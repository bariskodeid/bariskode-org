import { describe, expect, it } from 'vitest';

import { isQuizSubmissionLockStale } from './quizSubmissionLock';

describe('isQuizSubmissionLockStale', () => {
    it('returns false when createdAt is missing', () => {
        expect(isQuizSubmissionLockStale(undefined)).toBe(false);
    });

    it('returns false for a fresh lock timestamp', () => {
        const now = new Date('2026-03-09T15:00:30.000Z').getTime();
        expect(isQuizSubmissionLockStale('2026-03-09T15:00:10.000Z', now)).toBe(false);
    });

    it('returns true for a stale lock timestamp', () => {
        const now = new Date('2026-03-09T15:00:45.000Z').getTime();
        expect(isQuizSubmissionLockStale('2026-03-09T15:00:10.000Z', now)).toBe(true);
    });
});
