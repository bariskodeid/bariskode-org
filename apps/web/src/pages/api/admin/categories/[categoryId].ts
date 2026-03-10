import type { APIRoute } from 'astro';

import { requireAdminUser, AdminAuthorizationError } from '@lib/admin/adminAuth';
import { assertTrustedAdminPostRequest, AdminRequestError } from '@lib/admin/adminRequest';
import { redirectToAdminCategories } from '@lib/admin/adminResponses';
import { AdminCategoryError, updateCategory } from '@lib/admin/categoryService';
import { validateCategoryInput } from '@lib/admin/categoryForm';
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

        const formData = await request.formData();
        const validation = validateCategoryInput(Object.fromEntries(formData.entries()));

        if (!validation.success) {
            return redirectToAdminCategories({
                tone: 'error',
                status: 'validation_failed',
                edit: categoryId,
            });
        }

        const pb = await createTrustedPocketBase();
        await updateCategory(pb, categoryId, validation.data);

        return redirectToAdminCategories({ tone: 'success', status: 'updated' });
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
                edit: params.categoryId ?? '',
            });
        }

        return redirectToAdminCategories({
            tone: 'error',
            status: 'server_error',
            edit: params.categoryId ?? '',
        });
    }
};
