import { beforeEach, describe, expect, it, vi } from 'vitest';

import { moderateComment } from './commentModerationService';

function createCollectionMock() {
    const comments = {
        getOne: vi.fn(),
        update: vi.fn(),
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

describe('commentModerationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('hides a comment', async () => {
        const { pb, comments } = createCollectionMock();
        comments.update.mockResolvedValue({ id: 'com123def456ghi', is_hidden: true });

        await moderateComment(pb as never, 'com123def456ghi', 'hide');

        expect(comments.update).toHaveBeenCalledWith('com123def456ghi', { is_hidden: true });
    });

    it('unhides a comment', async () => {
        const { pb, comments } = createCollectionMock();
        comments.update.mockResolvedValue({ id: 'com123def456ghi', is_hidden: false });

        await moderateComment(pb as never, 'com123def456ghi', 'unhide');

        expect(comments.update).toHaveBeenCalledWith('com123def456ghi', { is_hidden: false });
    });

    it('maps not found errors to domain errors', async () => {
        const { pb, comments } = createCollectionMock();
        comments.update.mockRejectedValue({ status: 404 });

        await expect(moderateComment(pb as never, 'com123def456ghi', 'hide')).rejects.toMatchObject({
            code: 'comment_not_found',
            status: 404,
        });
    });
});
