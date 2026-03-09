import type { APIRoute } from 'astro';

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
            redirectUrl = formData.get('redirect')?.toString() ?? null;
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

        const userId = locals.user.id;
        const pb = locals.pb;

        // Check if progress record already exists
        let existing: any = null;
        try {
            existing = await pb.collection('user_progress').getFirstListItem(
                `user = '${userId}' && lesson = '${lessonId}'`
            );
        } catch { /* not found — will create */ }

        if (existing) {
            if (existing.status !== 'completed') {
                await pb.collection('user_progress').update(existing.id, {
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                });
            }
        } else {
            await pb.collection('user_progress').create({
                user: userId,
                lesson: lessonId,
                status: 'completed',
                attempts: 1,
                completed_at: new Date().toISOString(),
            });
        }

        // Get XP reward from lesson
        const lesson = await pb.collection('lessons').getOne(lessonId);
        const xpGain = lesson.xp_reward ?? 10;

        // Update user XP (only if not already completed)
        if (!existing || existing.status !== 'completed') {
            await pb.collection('users').update(userId, {
                'xp+': xpGain,
            });
        }

        // If form submission, redirect back
        if (redirectUrl) {
            return new Response(null, {
                status: 302,
                headers: { Location: redirectUrl },
            });
        }

        return new Response(JSON.stringify({ success: true, xpGained: xpGain }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: err?.message ?? 'Failed to mark complete' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
