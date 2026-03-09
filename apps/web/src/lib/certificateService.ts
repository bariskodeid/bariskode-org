import type PocketBase from 'pocketbase';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import QRCode from 'qrcode';

import { CertificateTemplate } from '../components/react/CertificateTemplate';
import { isCourseCompleted } from './certificate';
import { isValidPocketBaseId } from './validation';

interface UserLike {
    id: string;
    email?: string;
    username?: string;
}

interface EnsureCertificateResult {
    certId: string | null;
    created: boolean;
    completed: boolean;
}

export async function getCourseIdByLessonId(pb: PocketBase, lessonId: string): Promise<string | null> {
    if (!isValidPocketBaseId(lessonId)) {
        return null;
    }

    try {
        const lesson = await pb.collection('lessons').getOne(lessonId, { fields: 'id,module' });
        const mod = await pb.collection('modules').getOne(lesson.module, { fields: 'id,course' });
        return mod.course as string;
    } catch {
        return null;
    }
}

export async function ensureCertificateForCourse(
    pb: PocketBase,
    user: UserLike,
    courseId: string,
    origin: string
): Promise<EnsureCertificateResult> {
    if (!isValidPocketBaseId(user.id) || !isValidPocketBaseId(courseId)) {
        return { certId: null, created: false, completed: false };
    }

    try {
        const existing = await pb.collection('certificates').getFirstListItem(
            `user = '${user.id}' && course = '${courseId}'`
        );

        // Recover from partially created certificate without file.
        if (existing.file) {
            return { certId: existing.id, created: false, completed: true };
        }

        const verifyUrl = `${origin}/verify/${existing.id}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl);
        const course = await pb.collection('courses').getOne(courseId, { fields: 'id,title' });
        const issuedDate = new Date(existing.issued_at ?? new Date().toISOString()).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        const pdfBuffer = await renderToBuffer(
            createElement(CertificateTemplate, {
                certId: existing.id,
                userName: user.username ?? user.email ?? 'Learner',
                courseName: course.title,
                issuedDate,
                verifyUrl,
                qrDataUrl,
            })
        );

        const formData = new FormData();
        formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), `certificate-${existing.id}.pdf`);
        await pb.collection('certificates').update(existing.id, formData);

        return { certId: existing.id, created: false, completed: true };
    } catch {
        // Not found, continue.
    }

    const completed = await isCourseCompleted(pb, user.id, courseId);
    if (!completed) {
        return { certId: null, created: false, completed: false };
    }

    const course = await pb.collection('courses').getOne(courseId, { fields: 'id,title' });
    let certRecord: { id: string };
    try {
        certRecord = await pb.collection('certificates').create({
            user: user.id,
            course: courseId,
            issued_at: new Date().toISOString(),
            is_valid: true,
        });
    } catch {
        const existing = await pb.collection('certificates').getFirstListItem(
            `user = '${user.id}' && course = '${courseId}'`
        );
        return { certId: existing.id, created: false, completed: true };
    }

    const certId = certRecord.id;
    const verifyUrl = `${origin}/verify/${certId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);
    const issuedDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const pdfBuffer = await renderToBuffer(
        createElement(CertificateTemplate, {
            certId,
            userName: user.username ?? user.email ?? 'Learner',
            courseName: course.title,
            issuedDate,
            verifyUrl,
            qrDataUrl,
        })
    );

    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), `certificate-${certId}.pdf`);
    await pb.collection('certificates').update(certId, formData);

    return { certId, created: true, completed: true };
}
