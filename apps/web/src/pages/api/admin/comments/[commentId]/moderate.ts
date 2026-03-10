import type { APIRoute } from 'astro';

import { AdminAuthorizationError, requireAdminUser } from '../../../../../lib/admin/adminAuth';
import { validateCommentModerationInput } from '../../../../../lib/admin/commentModerationForm';
import { AdminCommentModerationError, moderateComment } from '../../../../../lib/admin/commentModerationService';
import { AdminRequestError, assertTrustedAdminPostRequest } from '../../../../../lib/admin/adminRequest';
import { createTrustedPocketBase } from '../../../../../lib/pocketbase';
import { isValidPocketBaseId, normalizeInternalRedirect } from '../../../../../lib/validation';

function redirectToModerationTarget(returnTo: string, params: Record<string, string>) {
    const url = new URL(returnTo, 'https://bariskode.internal');
    const search = new URLSearchParams(url.search);

    for (const [key, value] of Object.entries(params)) {
        search.set(key, value);
    }

    return new Response(null, {
        status: 302,
        headers: {
            Location: `${url.pathname}${search.toString() ? `?${search.toString()}` : ''}`,
        },
    });
}

export const POST: APIRoute = async ({ locals, params, request }) => {
    const fallbackReturnTo = '/admin';
    let returnTo = fallbackReturnTo;

    try {
        requireAdminUser(locals.user);
        assertTrustedAdminPostRequest(request);

        const commentId = params.commentId ?? '';
        if (!isValidPocketBaseId(commentId)) {
            return new Response(JSON.stringify({ error: 'Invalid commentId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const formData = await request.formData();
        const validation = validateCommentModerationInput(Object.fromEntries(formData.entries()), fallbackReturnTo);
        returnTo = normalizeInternalRedirect(formData.get('returnTo')?.toString(), fallbackReturnTo);

        if (!validation.success) {
            return redirectToModerationTarget(returnTo, {
                tone: 'error',
                status: 'validation_failed',
            });
        }

        returnTo = validation.data.returnTo;

        const pb = await createTrustedPocketBase();
        await moderateComment(pb, commentId, validation.data.action);

        return redirectToModerationTarget(returnTo, {
            tone: 'success',
            status: validation.data.action === 'hide' ? 'comment_hidden' : 'comment_visible',
        });
    } catch (error) {
        if (error instanceof AdminAuthorizationError || error instanceof AdminRequestError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (error instanceof AdminCommentModerationError) {
            return redirectToModerationTarget(returnTo, {
                tone: 'error',
                status: error.code,
            });
        }

        return redirectToModerationTarget(returnTo, {
            tone: 'error',
            status: 'server_error',
        });
    }
};
