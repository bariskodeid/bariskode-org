import { describe, expect, it } from 'vitest';

import { getCertificateDownloadCtaState } from './certificateDownloadAccess';

describe('getCertificateDownloadCtaState', () => {
    const ownerId = 'use123def456ghi';

    it('returns login for guests when a PDF exists', () => {
        expect(
            getCertificateDownloadCtaState({
                user: null,
                certificateUserId: ownerId,
                hasFile: true,
            })
        ).toBe('login');
    });

    it('returns download for the certificate owner', () => {
        expect(
            getCertificateDownloadCtaState({
                user: { id: ownerId, role: 'student' },
                certificateUserId: ownerId,
                hasFile: true,
            })
        ).toBe('download');
    });

    it('returns download for admins', () => {
        expect(
            getCertificateDownloadCtaState({
                user: { id: 'use999def456ghi', role: 'admin' },
                certificateUserId: ownerId,
                hasFile: true,
            })
        ).toBe('download');
    });

    it('returns restricted for logged-in non-owners', () => {
        expect(
            getCertificateDownloadCtaState({
                user: { id: 'use999def456ghi', role: 'student' },
                certificateUserId: ownerId,
                hasFile: true,
            })
        ).toBe('restricted');
    });

    it('returns unavailable when no PDF exists', () => {
        expect(
            getCertificateDownloadCtaState({
                user: null,
                certificateUserId: ownerId,
                hasFile: false,
            })
        ).toBe('unavailable');
    });
});
