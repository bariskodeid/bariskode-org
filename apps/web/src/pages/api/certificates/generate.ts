import type { APIRoute } from 'astro';
import { ensureCertificateForCourse } from '../../../lib/certificateService';
import { createTrustedPocketBase } from '../../../lib/pocketbase';
import { assertRequestBodyWithinLimit, assertWithinRateLimit, getClientAddress, RateLimitError } from '../../../lib/rateLimit';
import { assertTrustedMutationRequest, RequestSecurityError } from '../../../lib/requestSecurity';
import { isValidPocketBaseId } from '../../../lib/validation';

export const POST: APIRoute = async ({ locals, request }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        assertTrustedMutationRequest(request);
    } catch (error) {
        if (error instanceof RequestSecurityError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        throw error;
    }

    try {
        const clientAddress = getClientAddress(request);
        await assertRequestBodyWithinLimit(request, 8 * 1024);
        await assertWithinRateLimit(`certificate-generate:${locals.user.id}:${clientAddress}`, {
            limit: 10,
            windowMs: 60_000,
        });
    } catch (error) {
        if (error instanceof RateLimitError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        throw error;
    }

    try {
        let requestBody: { courseId?: unknown };
        try {
            requestBody = await request.json();
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const courseId = typeof requestBody.courseId === 'string' ? requestBody.courseId : '';
        const userId = locals.user.id;

        if (!courseId) {
            return new Response(JSON.stringify({ error: 'courseId is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!isValidPocketBaseId(courseId)) {
            return new Response(JSON.stringify({ error: 'Invalid courseId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const origin = new URL(request.url).origin;
        const pb = await createTrustedPocketBase();
        const certResult = await ensureCertificateForCourse(
            pb,
            { id: userId, email: locals.user.email, username: locals.user.username },
            courseId,
            origin
        );

        if (!certResult.completed || !certResult.certId) {
            return new Response(
                JSON.stringify({ error: 'Kursus belum selesai. Selesaikan semua lesson terlebih dahulu.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify({ certId: certResult.certId, alreadyExists: !certResult.created }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        if (error instanceof RateLimitError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({ error: 'Failed to generate certificate' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
