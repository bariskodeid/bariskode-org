import type { APIRoute } from 'astro';

import { AdminAuthorizationError, requireAdminUser } from '../../../../../../lib/admin/adminAuth';
import { AdminRequestError, assertTrustedAdminPostRequest } from '../../../../../../lib/admin/adminRequest';
import { redirectToAdminCourses } from '../../../../../../lib/admin/adminResponses';
import { validateModuleInput } from '../../../../../../lib/admin/moduleForm';
import { AdminModuleError, deleteModule, updateModule } from '../../../../../../lib/admin/moduleService';
import { createTrustedPocketBase } from '../../../../../../lib/pocketbase';
import { isValidPocketBaseId } from '../../../../../../lib/validation';

export const POST: APIRoute = async ({ locals, params, request }) => {
    try {
        requireAdminUser(locals.user);
        assertTrustedAdminPostRequest(request);

        const courseId = params.courseId ?? '';
        const moduleId = params.moduleId ?? '';

        if (!isValidPocketBaseId(courseId)) {
            return new Response(JSON.stringify({ error: 'Invalid courseId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!isValidPocketBaseId(moduleId)) {
            return new Response(JSON.stringify({ error: 'Invalid moduleId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const formData = await request.formData();
        const intent = formData.get('intent');
        const pb = await createTrustedPocketBase();

        if (intent === 'delete') {
            await deleteModule(pb, moduleId, courseId);
            return redirectToAdminCourses({ tone: 'success', status: 'module_deleted', edit: courseId });
        }

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

        await updateModule(pb, moduleId, validation.data);

        return redirectToAdminCourses({ tone: 'success', status: 'module_updated', edit: courseId });
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
