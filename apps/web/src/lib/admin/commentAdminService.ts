import type PocketBase from 'pocketbase';

import type { Comment, Lesson, User } from '@/types';

export interface AdminCommentRow extends Omit<Comment, 'expand'> {
    expand?: {
        user?: Pick<User, 'id' | 'username' | 'role'>;
        lesson?: Pick<Lesson, 'id' | 'title'>;
    };
}

export interface AdminCommentListResult {
    items: AdminCommentRow[];
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
}

export async function listAdminComments(
    pb: Pick<PocketBase, 'collection'>,
    page: number,
    perPage: number,
): Promise<AdminCommentListResult> {
    const result = await pb.collection('comments').getList<AdminCommentRow>(page, perPage, {
        sort: '-created',
        expand: 'user,lesson',
        fields: 'id,user,lesson,parent,content,is_hidden,created,updated,expand.user.id,expand.user.username,expand.user.role,expand.lesson.id,expand.lesson.title',
    });

    return {
        items: result.items,
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
    };
}
