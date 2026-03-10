import type { APIRoute } from 'astro';

import { requireAdminUser, AdminAuthorizationError } from '@lib/admin/adminAuth';
import { assertTrustedAdminPostRequest, AdminRequestError } from '@lib/admin/adminRequest';
import { redirectToAdminCategories } from '@lib/admin/adminResponses';
import { AdminCategoryError, deleteCategory } from '@lib/admin/categoryService';
import { createTrustedPocketBase } from '@lib/pocketbase';
import { isValidPocketBaseId } from '@lib/validation';

export const POST: APIRoute = async ({ locals, params, request }) => {
    try {
        requireAdminUser(locals.user);
        assertTrustedAdminPostRequest(request);

        const categoryId = params.categoryId ?? '';
        if (!isValidPocketBaseId(categoryId)) {
            return new Response(JSON.stringify({ error: 'Invalid categoryId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const pb = await createTrustedPocketBase();
        await deleteCategory(pb, categoryId);

        return redirectToAdminCategories({ tone: 'success', status: 'deleted' });
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
