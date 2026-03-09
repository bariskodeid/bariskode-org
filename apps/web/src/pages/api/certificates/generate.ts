import type { APIRoute } from 'astro';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { CertificateTemplate } from '../../../components/react/CertificateTemplate';
import { isCourseCompleted } from '../../../lib/certificate';

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

        // 1. Verify course is completed
        const completed = await isCourseCompleted(locals.pb, userId, courseId);
        if (!completed) {
            return new Response(
                JSON.stringify({ error: 'Kursus belum selesai. Selesaikan semua lesson terlebih dahulu.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 2. Check if certificate already exists
        try {
            const existing = await locals.pb.collection('certificates').getFirstListItem(
                `user = '${userId}' && course = '${courseId}'`
            );
            return new Response(JSON.stringify({
                certId: existing.id,
                alreadyExists: true,
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch { /* not found — create new */ }

        // 3. Get course data
        const course = await locals.pb.collection('courses').getOne(courseId);
        const origin = new URL(request.url).origin;
        const issuedDate = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        // 4. Create certificate record first to get the ID
        const certRecord = await locals.pb.collection('certificates').create({
            user: userId,
            course: courseId,
            issued_at: new Date().toISOString(),
            is_valid: true,
        });

        const certId = certRecord.id;
        const verifyUrl = `${origin}/verify/${certId}`;

        // 5. Generate PDF
        const pdfBuffer = await renderToBuffer(
            createElement(CertificateTemplate, {
                certId,
                userName: locals.user.username ?? locals.user.email,
                courseName: course.title,
                issuedDate,
                verifyUrl,
            })
        );

        // 6. Upload PDF to certificate record
        const formData = new FormData();
        formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), `certificate-${certId}.pdf`);

        await locals.pb.collection('certificates').update(certId, formData);

        return new Response(JSON.stringify({ certId, alreadyExists: false }), {
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
