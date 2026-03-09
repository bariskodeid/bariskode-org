export type CertificateDownloadCtaState = 'download' | 'login' | 'restricted' | 'unavailable';

interface CertificateDownloadCtaInput {
    user: { id: string; role?: string } | null;
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

    if (user.id === certificateUserId || user.role === 'admin') {
        return 'download';
    }

    return 'restricted';
}
