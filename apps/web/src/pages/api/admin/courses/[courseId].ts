import type { APIRoute } from 'astro';

import { AdminAuthorizationError, requireAdminUser } from '../../../../lib/admin/adminAuth';
import { AdminRequestError, assertTrustedAdminPostRequest } from '../../../../lib/admin/adminRequest';
import { redirectToAdminCourses } from '../../../../lib/admin/adminResponses';
import { validateCourseInput } from '../../../../lib/admin/courseForm';
import { AdminCourseError, updateCourse } from '../../../../lib/admin/courseService';
import { createTrustedPocketBase } from '../../../../lib/pocketbase';
import { isValidPocketBaseId } from '../../../../lib/validation';

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
        const validation = validateCourseInput(Object.fromEntries(formData.entries()));

        if (!validation.success) {
            return redirectToAdminCourses({ tone: 'error', status: 'validation_failed', edit: courseId });
        }

        const pb = await createTrustedPocketBase();
        await updateCourse(pb, courseId, validation.data);

        return redirectToAdminCourses({ tone: 'success', status: 'updated' });
    } catch (error) {
        if (error instanceof AdminAuthorizationError || error instanceof AdminRequestError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (error instanceof AdminCourseError) {
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
