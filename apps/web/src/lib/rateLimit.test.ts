import { beforeEach, describe, expect, it } from 'vitest';

import {
    assertRequestBodyWithinLimit,
    assertWithinRateLimit,
    getClientAddress,
    RateLimitError,
    setRateLimitStoreForTests,
    resetRateLimitStore,
} from './rateLimit';

describe('rateLimit helpers', () => {
    beforeEach(() => {
        resetRateLimitStore();
    });

    it('allows requests within configured window limit', async () => {
        await expect(assertWithinRateLimit('k1', { limit: 2, windowMs: 1000, now: 1000 })).resolves.toBeUndefined();
        await expect(assertWithinRateLimit('k1', { limit: 2, windowMs: 1000, now: 1200 })).resolves.toBeUndefined();
    });

    it('rejects requests above configured window limit', async () => {
        await assertWithinRateLimit('k2', { limit: 1, windowMs: 1000, now: 1000 });
        await expect(assertWithinRateLimit('k2', { limit: 1, windowMs: 1000, now: 1200 })).rejects.toThrowError(RateLimitError);
    });

    it('resets counters when window has passed', async () => {
        await assertWithinRateLimit('k3', { limit: 1, windowMs: 1000, now: 1000 });
        await expect(assertWithinRateLimit('k3', { limit: 1, windowMs: 1000, now: 2101 })).resolves.toBeUndefined();
    });

    it('supports pluggable rate limit store adapters', async () => {
        setRateLimitStoreForTests({
            async hit() {
                return { count: 99, resetAt: Date.now() + 1000 };
            },
        });

        await expect(assertWithinRateLimit('adapter', { limit: 100, windowMs: 1000 })).resolves.toBeUndefined();
        await expect(assertWithinRateLimit('adapter', { limit: 98, windowMs: 1000 })).rejects.toThrowError(RateLimitError);
    });

    it('extracts first forwarded IP address', () => {
        const ip = getClientAddress(
            new Request('https://bariskode.test/api/quiz', {
                headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
            }),
            { trustProxyHeaders: true },
        );

        expect(ip).toBe('203.0.113.10');
    });

    it('returns unknown when proxy headers are not trusted', () => {
        const ip = getClientAddress(
            new Request('https://bariskode.test/api/quiz', {
                headers: { 'x-forwarded-for': '203.0.113.10' },
            }),
            { trustProxyHeaders: false },
        );

        expect(ip).toBe('unknown');
    });

    it('throws payload too large when content-length exceeds limit', async () => {
        await expect(
            assertRequestBodyWithinLimit(
                new Request('https://bariskode.test/api/quiz', {
                    headers: { 'content-length': '2049' },
                }),
                2048,
            ),
        ).rejects.toThrowError(RateLimitError);
    });

    it('throws payload too large when streamed body exceeds limit without content-length', async () => {
        await expect(
            assertRequestBodyWithinLimit(
                new Request('https://bariskode.test/api/quiz', {
                    method: 'POST',
                    body: 'x'.repeat(3000),
                }),
                2048,
            ),
        ).rejects.toThrowError(RateLimitError);
    });
});
