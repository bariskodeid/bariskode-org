import { describe, expect, it, vi } from 'vitest';

import { getDashboardCertificateSummaries } from './dashboardCertificates';

describe('getDashboardCertificateSummaries', () => {
    it('maps valid certificates into dashboard summaries', async () => {
        const getFullList = vi.fn().mockResolvedValue([
            {
                id: 'cer123def456ghi',
                file: 'certificate.pdf',
                issued_at: '2026-03-09T00:00:00.000Z',
                expand: {
                    course: {
                        title: 'Web Security Basics',
                        slug: 'web-security-basics',
                    },
                },
            },
        ]);
        const pb = {
            collection: vi.fn(() => ({ getFullList })),
        } as never;

        const result = await getDashboardCertificateSummaries(pb, 'use123def456ghi');

        expect(result).toEqual([
            {
                certId: 'cer123def456ghi',
                courseTitle: 'Web Security Basics',
                courseSlug: 'web-security-basics',
                issuedAt: '2026-03-09T00:00:00.000Z',
                verifyUrl: '/verify/cer123def456ghi',
                downloadUrl: '/api/certificates/cer123def456ghi/download',
            },
        ]);
    });

    it('returns an empty array when certificate lookup fails', async () => {
        const pb = {
            collection: vi.fn(() => ({ getFullList: vi.fn().mockRejectedValue(new Error('boom')) })),
        } as never;

        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(getDashboardCertificateSummaries(pb, 'use123def456ghi')).resolves.toEqual([]);
        expect(consoleError).toHaveBeenCalledWith('dashboard certificate lookup failed', {
            userId: 'use123def456ghi',
        });

        consoleError.mockRestore();
    });
});
