import { beforeEach, describe, expect, it, vi } from 'vitest';

const adminAuthMocks = vi.hoisted(() => ({
    requireAdminUser: vi.fn(),
}));

const adminRequestMocks = vi.hoisted(() => ({
    assertTrustedAdminPostRequest: vi.fn(),
}));

const moderationFormMocks = vi.hoisted(() => ({
    validateCommentModerationInput: vi.fn(),
}));

const moderationServiceMocks = vi.hoisted(() => ({
    moderateComment: vi.fn(),
}));

const pocketbaseMocks = vi.hoisted(() => ({
    createTrustedPocketBase: vi.fn(),
}));

vi.mock('../../../../../lib/admin/adminAuth', async () => {
    const actual = await vi.importActual('../../../../../lib/admin/adminAuth');
    return {
        ...actual,
        requireAdminUser: adminAuthMocks.requireAdminUser,
    };
});
vi.mock('../../../../../lib/admin/adminRequest', async () => {
    const actual = await vi.importActual('../../../../../lib/admin/adminRequest');
    return {
        ...actual,
        assertTrustedAdminPostRequest: adminRequestMocks.assertTrustedAdminPostRequest,
    };
});
vi.mock('../../../../../lib/admin/commentModerationForm', async () => {
    const actual = await vi.importActual('../../../../../lib/admin/commentModerationForm');
    return {
        ...actual,
        validateCommentModerationInput: moderationFormMocks.validateCommentModerationInput,
    };
});
vi.mock('../../../../../lib/admin/commentModerationService', async () => {
    const actual = await vi.importActual('../../../../../lib/admin/commentModerationService');
    return {
        ...actual,
        moderateComment: moderationServiceMocks.moderateComment,
    };
});
vi.mock('../../../../../lib/pocketbase', () => pocketbaseMocks);

import { POST } from './moderate';
import { AdminAuthorizationError } from '../../../../../lib/admin/adminAuth';
import { AdminCommentModerationError } from '../../../../../lib/admin/commentModerationService';
import { AdminRequestError } from '../../../../../lib/admin/adminRequest';

describe('POST /api/admin/comments/[commentId]/moderate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminAuthMocks.requireAdminUser.mockImplementation((user: unknown) => user);
        adminRequestMocks.assertTrustedAdminPostRequest.mockImplementation(() => undefined);
        moderationServiceMocks.moderateComment.mockResolvedValue({ id: 'com123def456ghi', is_hidden: true });
    });

    it('returns 401 for unauthenticated requests', async () => {
        adminAuthMocks.requireAdminUser.mockImplementation(() => {
            throw new AdminAuthorizationError('Unauthorized', 401);
        });

        const response = await POST({
            locals: { user: null },
            params: { commentId: 'com123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/comments/com123def456ghi/moderate', {
                method: 'POST',
            }),
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
            params: { commentId: 'com123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/comments/com123def456ghi/moderate', {
                method: 'POST',
            }),
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    });

    it('returns 400 for invalid comment ids', async () => {
        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { commentId: 'bad-id' },
            request: new Request('https://bariskode.test/api/admin/comments/bad-id/moderate', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
            }),
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid commentId' });
    });

    it('redirects on validation failure', async () => {
        moderationFormMocks.validateCommentModerationInput.mockReturnValue({
            success: false,
            error: { flatten: () => ({}) },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { commentId: 'com123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/comments/com123def456ghi/moderate', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ action: 'delete', returnTo: '/admin/courses' }),
            }),
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin/courses?tone=error&status=validation_failed');
    });

    it('moderates a comment through trusted PocketBase and redirects on success', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);
        moderationFormMocks.validateCommentModerationInput.mockReturnValue({
            success: true,
            data: {
                action: 'hide',
                returnTo: '/admin',
            },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { commentId: 'com123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/comments/com123def456ghi/moderate', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ action: 'hide', returnTo: '/admin' }),
            }),
        } as never);

        expect(pocketbaseMocks.createTrustedPocketBase).toHaveBeenCalled();
        expect(moderationServiceMocks.moderateComment).toHaveBeenCalledWith(pb, 'com123def456ghi', 'hide');
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin?tone=success&status=comment_hidden');
    });

    it('redirects known moderation errors to the requested admin page', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        moderationFormMocks.validateCommentModerationInput.mockReturnValue({
            success: true,
            data: {
                action: 'unhide',
                returnTo: '/admin/courses',
            },
        });
        moderationServiceMocks.moderateComment.mockRejectedValue(
            new AdminCommentModerationError('comment_not_found', 'Komentar tidak ditemukan', 404),
        );

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { commentId: 'com123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/comments/com123def456ghi/moderate', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({ action: 'unhide', returnTo: '/admin/courses' }),
            }),
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin/courses?tone=error&status=comment_not_found');
    });

    it('preserves existing returnTo query params on success', async () => {
        const pb = { collection: vi.fn() };
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue(pb);
        moderationFormMocks.validateCommentModerationInput.mockReturnValue({
            success: true,
            data: {
                action: 'hide',
                returnTo: '/admin/courses?tab=comments&edit=cou123def456ghi',
            },
        });

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { commentId: 'com123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/comments/com123def456ghi/moderate', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({
                    action: 'hide',
                    returnTo: '/admin/courses?tab=comments&edit=cou123def456ghi',
                }),
            }),
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe(
            '/admin/courses?tab=comments&edit=cou123def456ghi&tone=success&status=comment_hidden',
        );
    });

    it('redirects unexpected errors back to body-provided returnTo', async () => {
        pocketbaseMocks.createTrustedPocketBase.mockResolvedValue({ collection: vi.fn() });
        moderationFormMocks.validateCommentModerationInput.mockReturnValue({
            success: true,
            data: {
                action: 'hide',
                returnTo: '/admin/courses?tab=comments',
            },
        });
        moderationServiceMocks.moderateComment.mockRejectedValue(new Error('boom'));

        const response = await POST({
            locals: { user: { id: 'use123def456ghi', role: 'admin' } },
            params: { commentId: 'com123def456ghi' },
            request: new Request('https://bariskode.test/api/admin/comments/com123def456ghi/moderate', {
                method: 'POST',
                headers: { origin: 'https://bariskode.test' },
                body: new URLSearchParams({
                    action: 'hide',
                    returnTo: '/admin/courses?tab=comments',
                }),
            }),
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/admin/courses?tab=comments&tone=error&status=server_error');
    });
});
