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
    updateLesson: vi.fn(),
    deleteLesson: vi.fn(),
}));

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
}));

vi.mock('../../../../../../../../lib/admin/adminAuth', async () => {
    const actual = await vi.importActual('../../../../../../../../lib/admin/adminAuth');
    return { ...actual, requireAdminUser: adminAuthMocks.requireAdminUser };
});
vi.mock('../../../../../../../../lib/admin/adminRequest', async () => {
    const actual = await vi.importActual('../../../../../../../../lib/admin/adminRequest');
    return { ...actual, assertTrustedAdminPostRequest: adminRequestMocks.assertTrustedAdminPostRequest };
});
vi.mock('../../../../../../../../lib/admin/lessonForm', () => lessonFormMocks);
vi.mock('../../../../../../../../lib/admin/lessonService', async () => {
    const actual = await vi.importActual('../../../../../../../../lib/admin/lessonService');
    return {
        ...actual,
        updateLesson: lessonServiceMocks.updateLesson,
        deleteLesson: lessonServiceMocks.deleteLesson,
    };
});
vi.mock('../../../../../../../../lib/pocketbase', () => pocketbaseMocks);

import { POST } from './[lessonId]';
import { AdminLessonError } from '../../../../../../../../lib/admin/lessonService';

describe('POST /api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminAuthMocks.requireAdminUser.mockImplementation((user: unknown) => user);
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => undefined);
    });

    it('returns 400 for invalid lesson ids', async () => {
        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi', lessonId: 'bad-id' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons/bad-id', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
            }),
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid lessonId' });
    });

    it('updates a lesson and redirects on success', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);
        lessonFormMocks.validateLessonInput.mockReturnValue({
            success: true,
            data: {
                title: 'Updated Lesson',
                slug: 'updated-lesson',
                module: 'mod123def456ghi',
                type: 'quiz',
                xp_reward: 30,
                order: 1,
                status: 'published',
                passing_score: 80,
            },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi', lessonId: 'les123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons/les123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Updated Lesson', type: 'quiz', xp_reward: '30', order: '1', status: 'published', passing_score: '80' }),
            }),
        } as never);

        expect(lessonServiceMocks.updateLesson).toHaveBeenCalledWith(pb, 'cou123def456ghi', 'les123def456ghi', {
            title: 'Updated Lesson',
            slug: 'updated-lesson',
            module: 'mod123def456ghi',
            type: 'quiz',
            xp_reward: 30,
            order: 1,
            status: 'published',
            passing_score: 80,
        });
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=success&status=lesson_updated&edit=cou123def456ghi',
        );
    });

    it('deletes a lesson when intent=delete', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi', lessonId: 'les123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons/les123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ intent: 'delete' }),
            }),
        } as never);

        expect(lessonServiceMocks.deleteLesson).toHaveBeenCalledWith(
            pb,
            'cou123def456ghi',
            'mod123def456ghi',
            'les123def456ghi',
        );
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=success&status=lesson_deleted&edit=cou123def456ghi',
        );
    });

    it('redirects on validation failure', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        lessonFormMocks.validateLessonInput.mockReturnValue({ success: false, error: { flatten: () => ({}) } });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi', lessonId: 'les123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons/les123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Bad' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=lesson_validation_failed&edit=cou123def456ghi',
        );
    });

    it('redirects known service errors', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        lessonFormMocks.validateLessonInput.mockReturnValue({
            success: true,
            data: {
                title: 'Updated Lesson',
                slug: 'updated-lesson',
                module: 'mod123def456ghi',
                type: 'reading',
                xp_reward: 30,
                order: 1,
                status: 'draft',
            },
        });
        lessonServiceMocks.updateLesson.mockRejectedValue(
            new AdminLessonError('lesson_not_found', 'Lesson tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi', lessonId: 'les123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons/les123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Updated Lesson', type: 'reading', xp_reward: '30', order: '1', status: 'draft' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=lesson_not_found&edit=cou123def456ghi',
        );
    });

    it('redirects delete when lesson belongs to another module or course', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        lessonServiceMocks.deleteLesson.mockRejectedValue(
            new AdminLessonError('lesson_not_found', 'Lesson tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi', moduleId: 'mod123def456ghi', lessonId: 'les123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi/modules/mod123def456ghi/lessons/les123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ intent: 'delete' }),
            }),
        } as never);

        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=lesson_not_found&edit=cou123def456ghi',
        );
    });
});
