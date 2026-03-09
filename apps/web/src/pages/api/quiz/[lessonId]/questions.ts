import type { APIRoute } from 'astro';
import { assertLessonUnlocked, assertUserCanAccessLesson, LessonAccessError } from '../../../../lib/lessonAccess';
import { createTrustedPocketBase } from '../../../../lib/pocketbase';
import { isValidPocketBaseId } from '../../../../lib/validation';

export const GET: APIRoute = async ({ params, locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        if (!isValidPocketBaseId(params.lessonId)) {
            return new Response(JSON.stringify({ error: 'Invalid lessonId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const pb = await createTrustedPocketBase();
        const context = await assertUserCanAccessLesson(pb, locals.user, params.lessonId!);

        if (context.lesson.type !== 'quiz') {
            return new Response(JSON.stringify({ error: 'Quiz lesson not available' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await assertLessonUnlocked(pb, locals.user.id, context, 'Complete the previous lesson before taking this quiz');

        const questions = await pb.collection('quiz_questions').getFullList({
            filter: `lesson = '${params.lessonId}'`,
            sort: '+order',
        });

        // STRIP is_correct from options before sending to client
        const safeQuestions = questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            order: q.order,
            options: (q.options as any[]).map((o: any) => ({ text: o.text })),
        }));

        return new Response(JSON.stringify(safeQuestions), {
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
            JSON.stringify({ error: 'Failed to fetch questions' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
