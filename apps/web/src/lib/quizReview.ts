export function getQuizReviewAvailability(
    passed: boolean,
    maxAttempts: number | null | undefined,
    attempts: number
): boolean {
    if (passed) {
        return true;
    }

    return Boolean(maxAttempts && maxAttempts > 0 && attempts >= maxAttempts);
}
