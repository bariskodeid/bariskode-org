import { describe, expect, it } from 'vitest';

import { getQuizReviewAvailability } from './quizReview';

describe('getQuizReviewAvailability', () => {
    it('returns true when the quiz is passed', () => {
        expect(getQuizReviewAvailability(true, 3, 1)).toBe(true);
    });

    it('returns false when the quiz is failed and attempts remain', () => {
        expect(getQuizReviewAvailability(false, 3, 1)).toBe(false);
    });

    it('returns true when the quiz is failed on the final allowed attempt', () => {
        expect(getQuizReviewAvailability(false, 3, 3)).toBe(true);
    });

    it('returns false for unlimited failed attempts', () => {
        expect(getQuizReviewAvailability(false, 0, 10)).toBe(false);
    });
});
