import type { APIRoute } from 'astro';

import { AdminAuthorizationError, requireAdminUser } from '../../../lib/admin/adminAuth';
import { AdminRequestError, assertTrustedAdminPostRequest } from '../../../lib/admin/adminRequest';
import { redirectToAdminCourses } from '../../../lib/admin/adminResponses';
import { validateCourseInput } from '../../../lib/admin/courseForm';
import { AdminCourseError, createCourse } from '../../../lib/admin/courseService';
import { createTrustedPocketBase } from '../../../lib/pocketbase';

export const POST: APIRoute = async ({ locals, request }) => {
    try {
        requireAdminUser(locals.user);
        assertTrustedAdminPostRequest(request);

        const formData = await request.formData();
        const validation = validateCourseInput(Object.fromEntries(formData.entries()));

        if (!validation.success) {
            return redirectToAdminCourses({ tone: 'error', status: 'validation_failed' });
        }

        const pb = await createTrustedPocketBase();
        await createCourse(pb, validation.data);

        return redirectToAdminCourses({ tone: 'success', status: 'created' });
    } catch (error) {
        if (error instanceof AdminAuthorizationError || error instanceof AdminRequestError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (error instanceof AdminCourseError) {
            return redirectToAdminCourses({ tone: 'error', status: error.code });
        }

        return redirectToAdminCourses({ tone: 'error', status: 'server_error' });
    }
};
