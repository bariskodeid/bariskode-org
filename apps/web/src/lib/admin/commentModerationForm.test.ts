import { describe, expect, it } from 'vitest';

import {
    normalizeCommentModerationInput,
    validateCommentModerationInput,
} from './commentModerationForm';

describe('normalizeCommentModerationInput', () => {
    it('normalizes action and keeps safe internal return path', () => {
        expect(normalizeCommentModerationInput({ action: '  HIDE ', returnTo: ' /admin/courses ' })).toEqual({
            action: 'hide',
            returnTo: '/admin/courses',
        });
    });

    it('falls back for unsafe returnTo values', () => {
        expect(normalizeCommentModerationInput({ action: 'hide', returnTo: 'https://evil.test' })).toEqual({
            action: 'hide',
            returnTo: '/admin',
        });
        expect(normalizeCommentModerationInput({ action: 'hide', returnTo: '//evil.test/path' })).toEqual({
            action: 'hide',
            returnTo: '/admin',
        });
    });
});

describe('validateCommentModerationInput', () => {
    it('accepts valid moderation actions', () => {
        const result = validateCommentModerationInput({ action: 'unhide', returnTo: '/admin' });

        expect(result.success).toBe(true);
    });

    it('rejects unsupported actions', () => {
        const result = validateCommentModerationInput({ action: 'delete', returnTo: '/admin' });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        expect(result.error.flatten().fieldErrors.action?.[0]).toContain('valid');
    });
});
