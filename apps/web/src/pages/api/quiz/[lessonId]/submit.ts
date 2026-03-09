import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, request }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { answers } = await request.json(); // array of selected option indices

        // Fetch FULL questions with is_correct — only server sees this
        const questions = await locals.pb.collection('quiz_questions').getFullList({
            filter: `lesson = '${params.lessonId}'`,
            sort: '+order',
        });

        if (questions.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No quiz questions found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const lesson = await locals.pb.collection('lessons').getOne(params.lessonId!);
        const minScore = lesson.passing_score ?? 70;
        let correctCount = 0;

        const results = questions.map((q: any, i: number) => {
            const opts = q.options as { text: string; is_correct: boolean }[];
            const correctIdx = opts.findIndex((o) => o.is_correct);
            const isCorrect = Number(answers[i]) === correctIdx;
            if (isCorrect) correctCount++;
            return {
                questionId: q.id,
                isCorrect,
                correctIndex: correctIdx,
                explanation: q.explanation ?? null,
            };
        });

        const score = Math.round((correctCount / questions.length) * 100);
        const passed = score >= minScore;

        // Upsert progress record
        const userId = locals.user.id;
        let existing: any = null;
        try {
            existing = await locals.pb.collection('user_progress').getFirstListItem(
                `user = '${userId}' && lesson = '${params.lessonId}'`
            );
        } catch { /* not found */ }

        const attempts = (existing?.attempts ?? 0) + 1;

        if (existing) {
            await locals.pb.collection('user_progress').update(existing.id, {
                status: passed ? 'completed' : 'started',
                score,
                attempts,
                completed_at: passed ? new Date().toISOString() : null,
            });
        } else {
            await locals.pb.collection('user_progress').create({
                user: userId,
                lesson: params.lessonId,
                status: passed ? 'completed' : 'started',
                score,
                attempts,
                completed_at: passed ? new Date().toISOString() : null,
            });
        }

        // Award XP if passed (double XP for perfect score)
        if (passed) {
            const baseXp = lesson.xp_reward ?? 25;
            const xpReward = score === 100 ? baseXp * 2 : baseXp;
            await locals.pb.collection('users').update(userId, { 'xp+': xpReward });
        }

        return new Response(JSON.stringify({ score, passed, results, attempts }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: err?.message ?? 'Failed to submit quiz' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
