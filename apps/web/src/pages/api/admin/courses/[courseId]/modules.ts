import type { APIRoute } from 'astro';

import { AdminAuthorizationError, requireAdminUser } from '../../../../../lib/admin/adminAuth';
import { AdminRequestError, assertTrustedAdminPostRequest } from '../../../../../lib/admin/adminRequest';
import { redirectToAdminCourses } from '../../../../../lib/admin/adminResponses';
import { validateModuleInput } from '../../../../../lib/admin/moduleForm';
import { AdminModuleError, createModule } from '../../../../../lib/admin/moduleService';
import { createTrustedPocketBase } from '../../../../../lib/pocketbase';
import { isValidPocketBaseId } from '../../../../../lib/validation';

export const POST: APIRoute = async ({ locals, params, request }) => {
    try {
        requireAdminUser(locals.user);
        assertTrustedAdminPostRequest(request);

        const courseId = params.courseId ?? '';
        if (!isValidPocketBaseId(courseId)) {
            return new Response(JSON.stringify({ error: 'Invalid courseId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const formData = await request.formData();
        const validation = validateModuleInput({
            ...Object.fromEntries(formData.entries()),
            course: courseId,
        });

        if (!validation.success) {
            return redirectToAdminCourses({
                tone: 'error',
                status: 'module_validation_failed',
                edit: courseId,
            });
        }

        const pb = await createTrustedPocketBase();
        await createModule(pb, validation.data);

        return redirectToAdminCourses({ tone: 'success', status: 'module_created', edit: courseId });
    } catch (error) {
        if (error instanceof AdminAuthorizationError || error instanceof AdminRequestError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (error instanceof AdminModuleError) {
            return redirectToAdminCourses({
                tone: 'error',
                status: error.code,
                edit: params.courseId ?? '',
            });
        }

        return redirectToAdminCourses({
            tone: 'error',
            status: 'server_error',
            edit: params.courseId ?? '',
        });
    }
};
