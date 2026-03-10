import { beforeEach, describe, expect, it, vi } from 'vitest';

const adminAuthMocks = vi.hoisted(() => ({
    requireAdminUser: vi.fn(),
}));

const adminRequestMocks = vi.hoisted(() => ({
    assertTrustedAdminPostRequest: vi.fn(),
}));

const moduleFormMocks = vi.hoisted(() => ({
    validateModuleInput: vi.fn(),
}));

const moduleServiceMocks = vi.hoisted(() => ({
    createModule: vi.fn(),
}));

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
}));

vi.mock('../../../../../lib/admin/adminAuth', async () => {
    const actual = await vi.importActual('../../../../../lib/admin/adminAuth');
    return { ...actual, requireAdminUser: adminAuthMocks.requireAdminUser };
});
vi.mock('../../../../../lib/admin/adminRequest', async () => {
    const actual = await vi.importActual('../../../../../lib/admin/adminRequest');
    return { ...actual, assertTrustedAdminPostRequest: adminRequestMocks.assertTrustedAdminPostRequest };
});
vi.mock('../../../../../lib/admin/moduleForm', () => moduleFormMocks);
vi.mock('../../../../../lib/admin/moduleService', async () => {
    const actual = await vi.importActual('../../../../../lib/admin/moduleService');
    return { ...actual, createModule: moduleServiceMocks.createModule };
});
vi.mock('../../../../../lib/pocketbase', () => pocketbaseMocks);

import { POST } from './modules';
import { AdminRequestError } from '../../../../../lib/admin/adminRequest';
import { AdminModuleError } from '../../../../../lib/admin/moduleService';

describe('POST /api/admin/courses/[courseId]/modules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminAuthMocks.requireAdminUser.mockImplementation((user: unknown) => user);
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => undefined);
    });

    it('returns 400 for invalid course ids', async () => {
        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'bad-id' },
            request: new Request('https://bariskode.test/api/admin/courses/bad-id/modules', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
            }),
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid courseId' });
    });

    it('returns 403 for untrusted requests', async () => {
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => {
            throw new AdminRequestError('Forbidden', 403);
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules', {
                method: 'POST',
            }),
        } as never);

        expect(response.status).toBe(403);
    });

    it('redirects on validation failure', async () => {
        moduleFormMocks.validateModuleInput.mockReturnValue({ success: false, error: { flatten: () => ({}) } });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Mod 1', order: '0' }),
            }),
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=module_validation_failed&edit=cou123def456ghi',
        );
    });

    it('creates a module and redirects on success', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);
        moduleFormMocks.validateModuleInput.mockReturnValue({
            success: true,
            data: {
                title: 'Fundamentals',
                course: 'cou123def456ghi',
                order: 0,
                description: 'Pengenalan',
            },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Fundamentals', order: '0' }),
            }),
        } as never);

        expect(moduleServiceMocks.createModule).toHaveBeenCalledWith(pb, {
            title: 'Fundamentals',
            course: 'cou123def456ghi',
            order: 0,
            description: 'Pengenalan',
        });
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=success&status=module_created&edit=cou123def456ghi',
        );
    });

    it('redirects known service errors', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        moduleFormMocks.validateModuleInput.mockReturnValue({
            success: true,
            data: {
                title: 'Fundamentals',
                course: 'cou123def456ghi',
                order: 0,
            },
        });
        moduleServiceMocks.createModule.mockRejectedValue(
            new AdminModuleError('course_not_found', 'Course tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Fundamentals', order: '0' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=course_not_found&edit=cou123def456ghi',
        );
    });
});
