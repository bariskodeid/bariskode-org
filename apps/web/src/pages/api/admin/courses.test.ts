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
    createCourse: vi.fn(),
}));

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
}));

vi.mock('../../../lib/admin/adminAuth', async () => {
    const actual = await vi.importActual('../../../lib/admin/adminAuth');
    return {
        ...actual,
        requireAdminUser: adminAuthMocks.requireAdminUser,
    };
});
vi.mock('../../../lib/admin/adminRequest', async () => {
    const actual = await vi.importActual('../../../lib/admin/adminRequest');
    return {
        ...actual,
        assertTrustedAdminPostRequest: adminRequestMocks.assertTrustedAdminPostRequest,
    };
});
vi.mock('../../../lib/admin/courseForm', () => courseFormMocks);
vi.mock('../../../lib/admin/courseService', async () => {
    const actual = await vi.importActual('../../../lib/admin/courseService');
    return {
        ...actual,
        createCourse: courseServiceMocks.createCourse,
    };
});
vi.mock('../../../lib/pocketbase', () => pocketbaseMocks);

import { POST } from './courses';
import { AdminAuthorizationError } from '../../../lib/admin/adminAuth';
import { AdminRequestError } from '../../../lib/admin/adminRequest';
import { AdminCourseError } from '../../../lib/admin/courseService';

describe('POST /api/admin/courses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminAuthMocks.requireAdminUser.mockImplementation((user: unknown) => user);
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => undefined);
    });

    it('returns 401 for unauthenticated requests', async () => {
        adminAuthMocks.requireAdminUser.mockImplementation(() => {
            throw new AdminAuthorizationError('Unauthorized', 401);
        });

        const response = await POST({
            locals: { user: null },
            request: new Request('https://bariskode.test/api/admin/courses', { method: 'POST' }),
        } as never);

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    });

    it('returns 403 for untrusted requests', async () => {
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => {
            throw new AdminRequestError('Forbidden', 403);
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            request: new Request('https://bariskode.test/api/admin/courses', { method: 'POST' }),
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    });

    it('redirects on validation failure', async () => {
        courseFormMocks.validateCourseInput.mockReturnValue({ success: false, error: { flatten: () => ({}) } });

        const request = new Request('https://bariskode.test/api/admin/courses', {
            method: 'POST',
            headers: { origin: 'https://bariskode.test' },
            body: new URLSearchParams({ title: 'Test' }),
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            request,
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin/courses?tone=error&status=validation_failed');
    });

    it('creates a course and redirects on success', async () => {
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
                difficulty: 'beginner',
                status: 'draft',
                tags: ['web'],
            },
        });

        const request = new Request('https://bariskode.test/api/admin/courses', {
            method: 'POST',
            headers: { origin: 'https://bariskode.test' },
            body: new URLSearchParams({ title: 'Web Security Basics' }),
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            request,
        } as never);

        expect(courseServiceMocks.createCourse).toHaveBeenCalledWith(pb, {
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'desc',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'beginner',
            status: 'draft',
            tags: ['web'],
        });
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin/courses?tone=success&status=created');
    });

    it('redirects known service errors back to admin courses', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        courseFormMocks.validateCourseInput.mockReturnValue({
            success: true,
            data: {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'beginner',
                status: 'draft',
                tags: ['web'],
            },
        });
        courseServiceMocks.createCourse.mockRejectedValue(
            new AdminCourseError('duplicate_slug', 'Slug course sudah digunakan', 409),
        );

        const request = new Request('https://bariskode.test/api/admin/courses', {
            method: 'POST',
            headers: { origin: 'https://bariskode.test' },
            body: new URLSearchParams({ title: 'Web Security Basics' }),
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            request,
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin/courses?tone=error&status=duplicate_slug');
    });
});
