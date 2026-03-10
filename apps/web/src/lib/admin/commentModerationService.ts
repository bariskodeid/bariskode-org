import type PocketBase from 'pocketbase';

import type { CommentModerationAction } from './commentModerationForm';

export class AdminCommentModerationError extends Error {
    code: 'comment_not_found';
    status: number;

    constructor(code: AdminCommentModerationError['code'], message: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export async function moderateComment(
    pb: Pick<PocketBase, 'collection'>,
    commentId: string,
    action: CommentModerationAction,
) {
    const nextHiddenState = action === 'hide';

    return pb.collection('comments').update(commentId, { is_hidden: nextHiddenState }).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminCommentModerationError('comment_not_found', 'Komentar tidak ditemukan', 404);
        }

        throw error;
    });
}
