import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listAdminComments } from './commentAdminService';

function createCollectionMock() {
    const comments = {
        getList: vi.fn(),
    };

    return {
        pb: {
            collection: vi.fn((name: string) => {
                if (name === 'comments') return comments;
                throw new Error(`Unexpected collection: ${name}`);
            }),
        },
        comments,
    };
}

describe('commentAdminService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists comments newest first with user and lesson expansion', async () => {
        const { pb, comments } = createCollectionMock();
        comments.getList.mockResolvedValue({
            items: [{ id: 'com123def456ghi' }],
            page: 2,
            perPage: 20,
            totalItems: 45,
            totalPages: 3,
        });

        const result = await listAdminComments(pb as never, 2, 20);

        expect(comments.getList).toHaveBeenCalledWith(2, 20, {
            sort: '-created',
            expand: 'user,lesson',
            fields: 'id,user,lesson,parent,content,is_hidden,created,updated,expand.user.id,expand.user.username,expand.user.role,expand.lesson.id,expand.lesson.title',
        });
        expect(result).toEqual({
            items: [{ id: 'com123def456ghi' }],
            page: 2,
            perPage: 20,
            totalItems: 45,
            totalPages: 3,
        });
    });

    it('returns narrowed expansion shape for admin moderation rows', async () => {
        const { pb, comments } = createCollectionMock();
        comments.getList.mockResolvedValue({
            items: [
                {
                    id: 'com123def456ghi',
                    expand: {
                        user: { id: 'use123def456ghi', username: 'adminmod', role: 'admin' },
                        lesson: { id: 'les123def456ghi', title: 'Intro' },
                    },
                },
            ],
            page: 1,
            perPage: 20,
            totalItems: 1,
            totalPages: 1,
        });

        const result = await listAdminComments(pb as never, 1, 20);

        expect(result.items[0]?.expand?.user?.username).toBe('adminmod');
        expect(result.items[0]?.expand?.lesson?.title).toBe('Intro');
    });
});
