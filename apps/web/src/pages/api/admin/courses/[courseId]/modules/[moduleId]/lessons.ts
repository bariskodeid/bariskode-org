import type { APIRoute } from 'astro';

import { AdminAuthorizationError, requireAdminUser } from '../../../../../../../lib/admin/adminAuth';
import { AdminRequestError, assertTrustedAdminPostRequest } from '../../../../../../../lib/admin/adminRequest';
import { redirectToAdminCourses } from '../../../../../../../lib/admin/adminResponses';
import { validateLessonInput } from '../../../../../../../lib/admin/lessonForm';
import { AdminLessonError, createLesson } from '../../../../../../../lib/admin/lessonService';
import { createTrustedPocketBase } from '../../../../../../../lib/pocketbase';
import { isValidPocketBaseId } from '../../../../../../../lib/validation';

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
        const validation = validateLessonInput({
            ...Object.fromEntries(formData.entries()),
            module: moduleId,
        });

        if (!validation.success) {
            return redirectToAdminCourses({
                tone: 'error',
                status: 'lesson_validation_failed',
                edit: courseId,
            });
        }

        const pb = await createTrustedPocketBase();
        await createLesson(pb, courseId, validation.data);

        return redirectToAdminCourses({ tone: 'success', status: 'lesson_created', edit: courseId });
    } catch (error) {
        if (error instanceof AdminAuthorizationError || error instanceof AdminRequestError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (error instanceof AdminLessonError) {
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
