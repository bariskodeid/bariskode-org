import type { APIRoute } from 'astro';
import { ensureCertificateForCourse, getCourseIdByLessonId } from '../../../../lib/certificateService';
import { assertLessonUnlocked, assertUserCanAccessLesson, getUserProgressRecord, LessonAccessError } from '../../../../lib/lessonAccess';
import { createTrustedPocketBase } from '../../../../lib/pocketbase';
import { getQuizReviewAvailability } from '../../../../lib/quizReview';
import { acquireQuizSubmissionLock, QuizSubmissionLockError, releaseQuizSubmissionLock } from '../../../../lib/quizSubmissionLock';
import { isValidPocketBaseId } from '../../../../lib/validation';
import { getXpSyncState } from '../../../../lib/xpSync';

export const POST: APIRoute = async ({ params, locals, request }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let lockId: string | null = null;
    let pb: Awaited<ReturnType<typeof createTrustedPocketBase>> | null = null;

    try {
        if (!isValidPocketBaseId(params.lessonId)) {
            return new Response(JSON.stringify({ error: 'Invalid lessonId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let requestBody: { answers?: unknown };
        try {
            requestBody = await request.json();
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { answers } = requestBody; // array of selected option indices
        if (!Array.isArray(answers)) {
            return new Response(JSON.stringify({ error: 'answers must be an array' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        pb = await createTrustedPocketBase();
        const context = await assertUserCanAccessLesson(pb, locals.user, params.lessonId!);
        const { lesson } = context;

        if (lesson.type !== 'quiz') {
            return new Response(JSON.stringify({ error: 'Quiz lesson not available' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await assertLessonUnlocked(pb, locals.user.id, context, 'Complete the previous lesson before taking this quiz');

        lockId = await acquireQuizSubmissionLock(pb, locals.user.id, params.lessonId!);

        // Fetch FULL questions with is_correct — only server sees this
        const questions = await pb.collection('quiz_questions').getFullList({
            filter: `lesson = '${params.lessonId}'`,
            sort: '+order',
        });

        if (questions.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No quiz questions found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (answers.length !== questions.length) {
            return new Response(JSON.stringify({ error: 'Invalid answer payload' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const hasInvalidAnswer = answers.some((answer, index) => {
            const selectedIndex = Number(answer);
            return !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= questions[index].options.length;
        });

        if (hasInvalidAnswer) {
            return new Response(JSON.stringify({ error: 'Answers contain invalid option indexes' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const minScore = lesson.passing_score ?? 70;
        let correctCount = 0;

        const gradedResults = questions.map((q: any, i: number) => {
            const opts = q.options as { text: string; is_correct: boolean }[];
            const correctIdx = opts.findIndex((o) => o.is_correct);
            const isCorrect = Number(answers[i]) === correctIdx;
            if (isCorrect) correctCount++;
            return {
                questionId: q.id,
                isCorrect,
                selectedIndex: Number.isInteger(Number(answers[i])) ? Number(answers[i]) : -1,
                explanation: q.explanation ?? null,
            };
        });

        const score = Math.round((correctCount / questions.length) * 100);
        const passed = score >= minScore;

        // Upsert progress record
        const userId = locals.user.id;
        const existing = await getUserProgressRecord(pb, userId, params.lessonId!);

        if (lesson.max_attempts && lesson.max_attempts > 0 && (existing?.attempts ?? 0) >= lesson.max_attempts) {
            return new Response(JSON.stringify({ error: 'Maximum quiz attempts reached' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const attempts = (existing?.attempts ?? 0) + 1;
        const wasCompleted = existing?.status === 'completed';
        const status = wasCompleted || passed ? 'completed' : 'started';
        const completedAt = wasCompleted ? existing?.completed_at ?? new Date().toISOString() : passed ? new Date().toISOString() : null;

        if (existing) {
            await pb.collection('user_progress').update(existing.id, {
                status,
                score,
                attempts,
                completed_at: completedAt,
            });
        } else {
            await pb.collection('user_progress').create({
                user: userId,
                lesson: params.lessonId,
                status,
                score,
                attempts,
                completed_at: completedAt,
            });
        }

        // Award XP only on the first transition to completed.
        const xp = passed ? getXpSyncState(wasCompleted) : getXpSyncState(true);

        const reviewAvailable = getQuizReviewAvailability(passed, lesson.max_attempts, attempts);
        const results = reviewAvailable ? gradedResults : [];

        let certificate: { certId: string | null; created: boolean } | null = null;
        if (passed) {
            const origin = new URL(request.url).origin;
            const courseId = await getCourseIdByLessonId(pb, params.lessonId!);
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
        }

        return new Response(JSON.stringify({ score, passed, results, attempts, xp, certificate, reviewAvailable }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        if (err instanceof LessonAccessError || err instanceof QuizSubmissionLockError) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: err.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({ error: 'Failed to submit quiz' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    } finally {
        if (pb) {
            await releaseQuizSubmissionLock(pb, lockId);
        }
    }
};
