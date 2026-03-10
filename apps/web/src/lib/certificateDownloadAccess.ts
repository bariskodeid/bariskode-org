import { isTrustedAdminUser } from './admin/adminAuth';

export type CertificateDownloadCtaState = 'download' | 'login' | 'restricted' | 'unavailable';

interface CertificateDownloadCtaInput {
    user: { id: string; role?: 'student' | 'instructor' | 'admin' } | null;
    certificateUserId: string | null | undefined;
    hasFile: boolean;
}

export function getCertificateDownloadCtaState({
    user,
    certificateUserId,
    hasFile,
}: CertificateDownloadCtaInput): CertificateDownloadCtaState {
    if (!hasFile) {
        return 'unavailable';
    }

    if (!user) {
        return 'login';
    }

    if (user.id === certificateUserId || isTrustedAdminUser(user)) {
        return 'download';
    }

    return 'restricted';
}
