import { beforeEach, describe, expect, it, vi } from 'vitest';

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
    getPocketBaseUrl: vi.fn(() => 'https://pb.example.test'),
}));

vi.mock('../../../../lib/pocketbase', () => ({
    createTrustedPocketBase: pocketbaseMocks.createTrustedPocketBase,
    getPocketBaseUrl: pocketbaseMocks.getPocketBaseUrl,
}));

import { GET } from './download';

describe('GET /api/certificates/[certId]/download', () => {
    const certId = 'cer123def456ghi';
    const ownerId = 'use123def456ghi';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    it('returns 401 for unauthenticated requests', async () => {
        const response = await GET({
            locals: { user: null },
            params: { certId },
        } as never);

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(pocketbaseMocks.createTrustedPocketBase).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid certificate ids', async () => {
        const response = await GET({
            locals: { user: { id: ownerId, role: 'student' } },
            params: { certId: 'bad-id' },
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid certId' });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(pocketbaseMocks.createTrustedPocketBase).not.toHaveBeenCalled();
    });

    it('returns 403 for non-owner non-admin users', async () => {
        const getOne = vi.fn().mockResolvedValue({
            id: certId,
            user: ownerId,
            file: 'certificate.pdf',
            is_valid: true,
        });
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({
            collection: vi.fn(() => ({ getOne })),
            authStore: { token: 'admin-token' },
        });

        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET({
            locals: { user: { id: 'use999def456ghi', role: 'student' } },
            params: { certId },
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns 404 when the certificate file is missing', async () => {
        const getOne = vi.fn().mockResolvedValue({
            id: certId,
            user: ownerId,
            file: '',
            is_valid: true,
        });
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({
            collection: vi.fn(() => ({ getOne })),
            authStore: { token: 'admin-token' },
        });

        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET({
            locals: { user: { id: ownerId, role: 'student' } },
            params: { certId },
        } as never);

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toEqual({ error: 'Certificate PDF not found' });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns 410 when the certificate has been revoked', async () => {
        const getOne = vi.fn().mockResolvedValue({
            id: certId,
            user: ownerId,
            file: 'certificate.pdf',
            is_valid: false,
        });
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({
            collection: vi.fn(() => ({ getOne })),
            authStore: { token: 'admin-token' },
        });

        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET({
            locals: { user: { id: ownerId, role: 'student' } },
            params: { certId },
        } as never);

        expect(response.status).toBe(410);
        await expect(response.json()).resolves.toEqual({ error: 'Certificate is no longer valid' });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('streams the PDF for the certificate owner', async () => {
        const getOne = vi.fn().mockResolvedValue({
            id: certId,
            user: ownerId,
            file: 'certificate.pdf',
            is_valid: true,
        });
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({
            collection: vi.fn(() => ({ getOne })),
            authStore: { token: 'admin-token' },
        });

        const fetchMock = vi.fn().mockResolvedValue(
            new Response('pdf-content', {
                status: 200,
                headers: { 'Content-Type': 'application/pdf' },
            })
        );
        vi.stubGlobal('fetch', fetchMock);

        const response = await GET({
            locals: { user: { id: ownerId, role: 'student' } },
            params: { certId },
        } as never);

        expect(fetchMock).toHaveBeenCalledWith(
            'https://pb.example.test/api/files/certificates/cer123def456ghi/certificate.pdf',
            {
                headers: {
                    Authorization: 'Bearer admin-token',
                },
            }
        );
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/pdf');
        expect(response.headers.get('Content-Disposition')).toBe(
            'attachment; filename="certificate-cer123def456ghi.pdf"'
        );
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        await expect(response.text()).resolves.toBe('pdf-content');
    });
});
