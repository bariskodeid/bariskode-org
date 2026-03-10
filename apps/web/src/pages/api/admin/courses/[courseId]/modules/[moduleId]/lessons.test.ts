import { beforeEach, describe, expect, it, vi } from 'vitest';

const adminAuthMocks = vi.hoisted(() => ({
    requireAdminUser: vi.fn(),
}));

const adminRequestMocks = vi.hoisted(() => ({
    assertTrustedAdminPostRequest: vi.fn(),
}));

const lessonFormMocks = vi.hoisted(() => ({
    validateLessonInput: vi.fn(),
}));

const lessonServiceMocks = vi.hoisted(() => ({
    createLesson: vi.fn(),
}));

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
}));

vi.mock('../../../../../../../lib/admin/adminAuth', async () => {
    const actual = await vi.importActual('../../../../../../../lib/admin/adminAuth');
    return { ...actual, requireAdminUser: adminAuthMocks.requireAdminUser };
});
vi.mock('../../../../../../../lib/admin/adminRequest', async () => {
    const actual = await vi.importActual('../../../../../../../lib/admin/adminRequest');
    return { ...actual, assertTrustedAdminPostRequest: adminRequestMocks.assertTrustedAdminPostRequest };
});
vi.mock('../../../../../../../lib/admin/lessonForm', () => lessonFormMocks);
vi.mock('../../../../../../../lib/admin/lessonService', async () => {
    const actual = await vi.importActual('../../../../../../../lib/admin/lessonService');
    return { ...actual, createLesson: lessonServiceMocks.createLesson };
});
vi.mock('../../../../../../../lib/pocketbase', () => pocketbaseMocks);

import { POST } from './lessons';
import { AdminRequestError } from '../../../../../../../lib/admin/adminRequest';
import { AdminLessonError } from '../../../../../../../lib/admin/lessonService';

describe('POST /api/admin/courses/[courseId]/modules/[moduleId]/lessons', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminAuthMocks.requireAdminUser.mockImplementation((user: unknown) => user);
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => undefined);
    });

    it('returns 400 for invalid course ids', async () => {
        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'bad-id', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/bad-id/modules/mod123def456ghi/lessons', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
            }),
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid courseId' });
    });

    it('returns 400 for invalid module ids', async () => {
        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'bad-id' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/bad-id/lessons', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
            }),
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid moduleId' });
    });

    it('returns 403 for untrusted requests', async () => {
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => {
            throw new AdminRequestError('Forbidden', 403);
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons', {
                method: 'POST',
            }),
        } as never);

        expect(response.status).toBe(403);
    });

    it('redirects on validation failure', async () => {
        lessonFormMocks.validateLessonInput.mockReturnValue({ success: false, error: { flatten: () => ({}) } });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Lesson 1' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=lesson_validation_failed&edit=cou123def456ghi',
        );
    });

    it('creates a lesson and redirects on success', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);
        lessonFormMocks.validateLessonInput.mockReturnValue({
            success: true,
            data: {
                title: 'Intro to XSS',
                slug: 'intro-to-xss',
                module: 'mod123def456ghi',
                type: 'reading',
                xp_reward: 25,
                order: 0,
                status: 'draft',
            },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Intro to XSS', type: 'reading', xp_reward: '25', order: '0', status: 'draft' }),
            }),
        } as never);

        expect(lessonServiceMocks.createLesson).toHaveBeenCalledWith(pb, 'cou123def456ghi', {
            title: 'Intro to XSS',
            slug: 'intro-to-xss',
            module: 'mod123def456ghi',
            type: 'reading',
            xp_reward: 25,
            order: 0,
            status: 'draft',
        });
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=success&status=lesson_created&edit=cou123def456ghi',
        );
    });

    it('redirects known service errors', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        lessonFormMocks.validateLessonInput.mockReturnValue({
            success: true,
            data: {
                title: 'Intro to XSS',
                slug: 'intro-to-xss',
                module: 'mod123def456ghi',
                type: 'reading',
                xp_reward: 25,
                order: 0,
                status: 'draft',
            },
        });
        lessonServiceMocks.createLesson.mockRejectedValue(
            new AdminLessonError('module_not_found', 'Module tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Intro to XSS', type: 'reading', xp_reward: '25', order: '0', status: 'draft' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=module_not_found&edit=cou123def456ghi',
        );
    });
});
