import type PocketBase from 'pocketbase';

interface CertificateCourse {
    title?: string;
    slug?: string;
}

interface CertificateRecord {
    id: string;
    file?: string;
    issued_at?: string;
    expand?: {
        course?: CertificateCourse;
    };
}

export interface DashboardCertificateSummary {
    certId: string;
    courseTitle: string;
    courseSlug: string | null;
    issuedAt: string | null;
    verifyUrl: string;
    downloadUrl: string | null;
}

export async function getDashboardCertificateSummaries(
    pb: PocketBase,
    userId: string
): Promise<DashboardCertificateSummary[]> {
    try {
        const certificates = await pb.collection('certificates').getFullList<CertificateRecord>({
            filter: `user = '${userId}' && is_valid = true`,
            sort: '-issued_at',
            expand: 'course',
            fields: 'id,file,issued_at,expand.course.title,expand.course.slug',
        });

        return certificates.map((certificate) => ({
            certId: certificate.id,
            courseTitle: certificate.expand?.course?.title ?? 'Kursus',
            courseSlug: certificate.expand?.course?.slug ?? null,
            issuedAt: certificate.issued_at ?? null,
            verifyUrl: `/verify/${certificate.id}`,
            downloadUrl: certificate.file ? `/api/certificates/${certificate.id}/download` : null,
        }));
    } catch {
        console.error('dashboard certificate lookup failed', { userId });
        return [];
    }
}
