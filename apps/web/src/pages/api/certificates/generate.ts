import type { APIRoute } from 'astro';
import { ensureCertificateForCourse } from '../../../lib/certificateService';

export const POST: APIRoute = async ({ locals, request }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { courseId } = await request.json();
        const userId = locals.user.id;

        if (!courseId) {
            return new Response(JSON.stringify({ error: 'courseId is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const origin = new URL(request.url).origin;
        const certResult = await ensureCertificateForCourse(
            locals.pb,
            { id: userId, email: locals.user.email, username: locals.user.username },
            courseId,
            origin
        );

        if (!certResult.completed || !certResult.certId) {
            return new Response(
                JSON.stringify({ error: 'Kursus belum selesai. Selesaikan semua lesson terlebih dahulu.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify({ certId: certResult.certId, alreadyExists: !certResult.created }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Certificate generation error:', err);
        return new Response(
            JSON.stringify({ error: err?.message ?? 'Failed to generate certificate' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
