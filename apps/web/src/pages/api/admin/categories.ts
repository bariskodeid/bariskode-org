import type { APIRoute } from 'astro';

import { requireAdminUser, AdminAuthorizationError } from '@lib/admin/adminAuth';
import { assertTrustedAdminPostRequest, AdminRequestError } from '@lib/admin/adminRequest';
import { redirectToAdminCategories } from '@lib/admin/adminResponses';
import { createCategory, AdminCategoryError } from '@lib/admin/categoryService';
import { validateCategoryInput } from '@lib/admin/categoryForm';
import { createTrustedPocketBase } from '@lib/pocketbase';

export const POST: APIRoute = async ({ locals, request }) => {
    try {
        requireAdminUser(locals.user);
        assertTrustedAdminPostRequest(request);

        const formData = await request.formData();
        const validation = validateCategoryInput(Object.fromEntries(formData.entries()));

        if (!validation.success) {
            return redirectToAdminCategories({
                tone: 'error',
                status: 'validation_failed',
            });
        }

        const pb = await createTrustedPocketBase();
        await createCategory(pb, validation.data);

        return redirectToAdminCategories({ tone: 'success', status: 'created' });
    } catch (error) {
        if (error instanceof AdminAuthorizationError || error instanceof AdminRequestError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (error instanceof AdminCategoryError) {
            return redirectToAdminCategories({
                tone: 'error',
                status: error.code,
            });
        }

        return redirectToAdminCategories({ tone: 'error', status: 'server_error' });
    }
};
