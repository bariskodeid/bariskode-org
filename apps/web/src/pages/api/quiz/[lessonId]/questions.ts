import type { APIRoute } from 'astro';
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

        const questions = await locals.pb.collection('quiz_questions').getFullList({
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
        return new Response(
            JSON.stringify({ error: 'Failed to fetch questions' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
