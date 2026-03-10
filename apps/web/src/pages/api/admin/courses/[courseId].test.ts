import { beforeEach, describe, expect, it, vi } from 'vitest';

const adminAuthMocks = vi.hoisted(() => ({
    requireAdminUser: vi.fn(),
}));

const adminRequestMocks = vi.hoisted(() => ({
    assertTrustedAdminPostRequest: vi.fn(),
}));

const courseFormMocks = vi.hoisted(() => ({
    validateCourseInput: vi.fn(),
}));

const courseServiceMocks = vi.hoisted(() => ({
    updateCourse: vi.fn(),
}));

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
}));

vi.mock('../../../../lib/admin/adminAuth', async () => {
    const actual = await vi.importActual('../../../../lib/admin/adminAuth');
    return {
        ...actual,
        requireAdminUser: adminAuthMocks.requireAdminUser,
    };
});
vi.mock('../../../../lib/admin/adminRequest', async () => {
    const actual = await vi.importActual('../../../../lib/admin/adminRequest');
    return {
        ...actual,
        assertTrustedAdminPostRequest: adminRequestMocks.assertTrustedAdminPostRequest,
    };
});
vi.mock('../../../../lib/admin/courseForm', () => courseFormMocks);
vi.mock('../../../../lib/admin/courseService', async () => {
    const actual = await vi.importActual('../../../../lib/admin/courseService');
    return {
        ...actual,
        updateCourse: courseServiceMocks.updateCourse,
    };
});
vi.mock('../../../../lib/pocketbase', () => pocketbaseMocks);

import { POST } from './[courseId]';
import { AdminRequestError } from '../../../../lib/admin/adminRequest';
import { AdminCourseError } from '../../../../lib/admin/courseService';

describe('POST /api/admin/courses/[courseId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminAuthMocks.requireAdminUser.mockImplementation((user: unknown) => user);
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => undefined);
    });

    it('returns 400 for invalid course ids', async () => {
        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'bad-id' },
            request: new Request('https://bariskode.test/api/admin/courses/bad-id', {
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
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi', {
                method: 'POST',
            }),
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    });

    it('redirects on validation failure', async () => {
        courseFormMocks.validateCourseInput.mockReturnValue({ success: false, error: { flatten: () => ({}) } });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Test' }),
            }),
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=validation_failed&edit=cou123def456ghi',
        );
    });

    it('updates a course and redirects on success', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);
        courseFormMocks.validateCourseInput.mockReturnValue({
            success: true,
            data: {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'advanced',
                status: 'published',
                tags: ['web', 'security'],
            },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Test' }),
            }),
        } as never);

        expect(courseServiceMocks.updateCourse).toHaveBeenCalledWith(pb, 'cou123def456ghi', {
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'desc',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'advanced',
            status: 'published',
            tags: ['web', 'security'],
        });
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin/courses?tone=success&status=updated');
    });

    it('redirects known service errors back to the edit state', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        courseFormMocks.validateCourseInput.mockReturnValue({
            success: true,
            data: {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'advanced',
                status: 'published',
                tags: ['web'],
            },
        });
        courseServiceMocks.updateCourse.mockRejectedValue(
            new AdminCourseError('course_not_found', 'Course tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { courseId: 'cou123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/courses/cou123def456ghi', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ title: 'Test' }),
            }),
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tone=error&status=course_not_found&edit=cou123def456ghi',
        );
    });
});
