import type { APIRoute } from 'astro';
import { ensureCertificateForCourse, getCourseIdByLessonId } from '../../../lib/certificateService';
import { assertLessonUnlocked, assertUserCanAccessLesson, getUserProgressRecord, LessonAccessError } from '../../../lib/lessonAccess';
import { createTrustedPocketBase } from '../../../lib/pocketbase';
import { isValidPocketBaseId, normalizeInternalRedirect } from '../../../lib/validation';
import { getXpSyncState } from '../../../lib/xpSync';

async function markLessonCompletedIdempotently(pb: Awaited<ReturnType<typeof createTrustedPocketBase>>, userId: string, lessonId: string) {
    const existing = await getUserProgressRecord(pb, userId, lessonId);
    const wasCompleted = existing?.status === 'completed';

    if (existing) {
        if (!wasCompleted) {
            await pb.collection('user_progress').update(existing.id, {
                status: 'completed',
                completed_at: new Date().toISOString(),
            });
        }

        return { wasCompleted };
    }

    try {
        await pb.collection('user_progress').create({
            user: userId,
            lesson: lessonId,
            status: 'completed',
            attempts: 1,
            completed_at: new Date().toISOString(),
        });

        return { wasCompleted: false };
    } catch (error: any) {
        if (error?.status !== 400 && error?.status !== 409) {
            throw error;
        }

        const concurrentRecord = await getUserProgressRecord(pb, userId, lessonId);
        if (!concurrentRecord) {
            throw error;
        }

        if (concurrentRecord.status !== 'completed') {
            await pb.collection('user_progress').update(concurrentRecord.id, {
                status: 'completed',
                completed_at: new Date().toISOString(),
            });

            return { wasCompleted: false };
        }

        return { wasCompleted: true };
    }
}

export const POST: APIRoute = async ({ locals, request }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Support both JSON and FormData
        let lessonId: string;
        let redirectUrl: string | null = null;
        const contentType = request.headers.get('content-type') ?? '';

        if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            lessonId = formData.get('lessonId')?.toString() ?? '';
            redirectUrl = normalizeInternalRedirect(formData.get('redirect')?.toString() ?? null, `/learn/${lessonId}`);
        } else {
            const body = await request.json();
            lessonId = body.lessonId;
        }

        if (!lessonId) {
            return new Response(JSON.stringify({ error: 'lessonId is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!isValidPocketBaseId(lessonId)) {
            return new Response(JSON.stringify({ error: 'Invalid lessonId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const userId = locals.user.id;
        const pb = await createTrustedPocketBase();

        const context = await assertUserCanAccessLesson(pb, locals.user, lessonId);
        const { lesson } = context;

        if (lesson.type === 'quiz') {
            return new Response(JSON.stringify({ error: 'Quiz lessons must be completed via quiz submission' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await assertLessonUnlocked(pb, userId, context, 'Complete the previous lesson before marking this one finished');

        const { wasCompleted } = await markLessonCompletedIdempotently(pb, userId, lessonId);
        const xp = getXpSyncState(wasCompleted);

        let certificate: { certId: string | null; created: boolean } | null = null;
        const origin = new URL(request.url).origin;
        const courseId = await getCourseIdByLessonId(pb, lessonId);
        if (courseId) {
            const certResult = await ensureCertificateForCourse(
                pb,
                { id: userId, email: locals.user.email, username: locals.user.username },
                courseId,
                origin
            );
            if (certResult.completed && certResult.certId) {
                certificate = { certId: certResult.certId, created: certResult.created };
            }
        }

        // If form submission, redirect back
        if (redirectUrl) {
            return new Response(null, {
                status: 302,
                headers: { Location: redirectUrl },
            });
        }

        return new Response(JSON.stringify({ success: true, xp, certificate }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        if (err instanceof LessonAccessError) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: err.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({ error: 'Failed to mark complete' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
