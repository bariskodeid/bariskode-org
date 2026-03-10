import { z } from 'zod';

import { normalizeInternalRedirect } from '../validation';

export type CommentModerationAction = 'hide' | 'unhide';

export interface CommentModerationInput {
    action: CommentModerationAction;
    returnTo: string;
}

function normalizeAction(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizeCommentModerationInput(
    input: Record<string, unknown>,
    fallbackReturnTo = '/admin',
): CommentModerationInput {
    const normalizedReturnTo = typeof input.returnTo === 'string'
        ? normalizeInternalRedirect(input.returnTo.trim(), fallbackReturnTo)
        : fallbackReturnTo;

    return {
        action: normalizeAction(input.action) as CommentModerationAction,
        returnTo: normalizedReturnTo,
    };
}

export const commentModerationSchema = z.object({
    action: z.enum(['hide', 'unhide'], {
        message: 'Aksi moderasi tidak valid',
    }),
    returnTo: z.string().min(1),
});

export function validateCommentModerationInput(
    input: Record<string, unknown>,
    fallbackReturnTo = '/admin',
) {
    const normalized = normalizeCommentModerationInput(input, fallbackReturnTo);
    return commentModerationSchema.safeParse(normalized);
}
