import type PocketBase from 'pocketbase';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
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

async function hydrateCertificateFile(
    pb: PocketBase,
    certId: string,
    courseTitle: string,
    user: UserLike,
    issuedAt: string,
    origin: string
): Promise<void> {
    const verifyUrl = `${origin}/verify/${certId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);
    const issuedDate = new Date(issuedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const pdfBuffer = await renderToBuffer(
        createElement(CertificateTemplate, {
            certId,
            userName: user.username ?? user.email ?? 'Learner',
            courseName: courseTitle,
            issuedDate,
            verifyUrl,
            qrDataUrl,
        }) as ReactElement<DocumentProps>
    );

    const formData = new FormData();
    formData.append(
        'file',
        new Blob([toPdfBlobPart(pdfBuffer)], { type: 'application/pdf' }),
        `certificate-${certId}.pdf`
    );
    await pb.collection('certificates').update(certId, formData);
}

function toPdfBlobPart(buffer: Buffer): ArrayBuffer {
    const bytes = Uint8Array.from(buffer);
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
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
            `user = '${user.id}' && course = '${courseId}'`,
            { fields: 'id,file,issued_at,is_valid' }
        );

        if (existing.is_valid === false) {
            return { certId: null, created: false, completed: true };
        }

        // Recover from partially created certificate without file.
        if (existing.file) {
            return { certId: existing.id, created: false, completed: true };
        }

        const course = await pb.collection('courses').getOne(courseId, { fields: 'id,title' });
        await hydrateCertificateFile(
            pb,
            existing.id,
            course.title,
            user,
            existing.issued_at ?? new Date().toISOString(),
            origin
        );

        return { certId: existing.id, created: false, completed: true };
    } catch (error: any) {
        if (error?.status !== 404) {
            throw error;
        }
    }

    const completed = await isCourseCompleted(pb, user.id, courseId);
    if (!completed) {
        return { certId: null, created: false, completed: false };
    }

    const course = await pb.collection('courses').getOne(courseId, { fields: 'id,title' });
    const issuedAt = new Date().toISOString();
    let certRecord: { id: string; issued_at?: string; file?: string };
    try {
        certRecord = await pb.collection('certificates').create({
            user: user.id,
            course: courseId,
            issued_at: issuedAt,
            is_valid: true,
        });
    } catch (error: any) {
        if (error?.status !== 400 && error?.status !== 409) {
            throw error;
        }

        const existing = await pb.collection('certificates').getFirstListItem(
            `user = '${user.id}' && course = '${courseId}'`,
            { fields: 'id,issued_at,file,is_valid' }
        );

        if (existing.is_valid === false) {
            return { certId: null, created: false, completed: true };
        }

        if (!existing.file) {
            await hydrateCertificateFile(
                pb,
                existing.id,
                course.title,
                user,
                existing.issued_at ?? issuedAt,
                origin
            );
        }

        return { certId: existing.id, created: false, completed: true };
    }

    const certId = certRecord.id;
    await hydrateCertificateFile(
        pb,
        certId,
        course.title,
        user,
        certRecord.issued_at ?? issuedAt,
        origin
    );

    return { certId, created: true, completed: true };
}
