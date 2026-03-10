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
    updateModule: vi.fn(),
    deleteModule: vi.fn(),
}));

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
}));

vi.mock('../../../../../../lib/admin/adminAuth', async () => {
    const actual = await vi.importActual('../../../../../../lib/admin/adminAuth');
    return { ...actual, requireAdminUser: adminAuthMocks.requireAdminUser };
});
vi.mock('../../../../../../lib/admin/adminRequest', async () => {
    const actual = await vi.importActual('../../../../../../lib/admin/adminRequest');
    return { ...actual, assertTrustedAdminPostRequest: adminRequestMocks.assertTrustedAdminPostRequest };
});
vi.mock('../../../../../../lib/admin/moduleForm', () => moduleFormMocks);
vi.mock('../../../../../../lib/admin/moduleService', async () => {
    const actual = await vi.importActual('../../../../../../lib/admin/moduleService');
    return {
        ...actual,
        updateModule: moduleServiceMocks.updateModule,
        deleteModule: moduleServiceMocks.deleteModule,
    };
});
vi.mock('../../../../../../lib/pocketbase', () => pocketbaseMocks);

import { POST } from './[moduleId]';
import { AdminModuleError } from '../../../../../../lib/admin/moduleService';

describe('POST /api/admin/courses/[courseId]/modules/[moduleId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminAuthMocks.requireAdminUser.mockImplementation((user: unknown) => user);
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => undefined);
    });

    it('returns 400 for invalid module ids', async () => {
        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'bad-id' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/bad-id', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
            }),
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid moduleId' });
    });

    it('updates a module and redirects on success', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);
        moduleFormMocks.validateModuleInput.mockReturnValue({
            success: true,
            data: {
                title: 'Updated Module',
                course: 'cou123def456ghi',
                order: 1,
                description: 'Update',
            },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Updated Module', order: '1' }),
            }),
        } as never);

        expect(moduleServiceMocks.updateModule).toHaveBeenCalledWith(pb, 'mod123def456ghi', {
            title: 'Updated Module',
            course: 'cou123def456ghi',
            order: 1,
            description: 'Update',
        });
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=success&status=module_updated&edit=cou123def456ghi',
        );
    });

    it('deletes a module when intent=delete', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ intent: 'delete' }),
            }),
        } as never);

        expect(moduleServiceMocks.deleteModule).toHaveBeenCalledWith(pb, 'mod123def456ghi', 'cou123def456ghi');
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=success&status=module_deleted&edit=cou123def456ghi',
        );
    });

    it('redirects on validation failure', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        moduleFormMocks.validateModuleInput.mockReturnValue({ success: false, error: { flatten: () => ({}) } });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Bad' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=module_validation_failed&edit=cou123def456ghi',
        );
    });

    it('redirects known service errors', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        moduleFormMocks.validateModuleInput.mockReturnValue({
            success: true,
            data: {
                title: 'Updated Module',
                course: 'cou123def456ghi',
                order: 1,
            },
        });
        moduleServiceMocks.updateModule.mockRejectedValue(
            new AdminModuleError('module_not_found', 'Module tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Updated Module', order: '1' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=module_not_found&edit=cou123def456ghi',
        );
    });

    it('redirects delete when module belongs to another course', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        moduleServiceMocks.deleteModule.mockRejectedValue(
            new AdminModuleError('module_not_found', 'Module tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ intent: 'delete' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=module_not_found&edit=cou123def456ghi',
        );
    });
});
