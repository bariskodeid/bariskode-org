import { describe, expect, it } from 'vitest';

import { RequestSecurityError, assertTrustedMutationRequest } from './requestSecurity';

describe('assertTrustedMutationRequest', () => {
    it('allows same-origin requests via Origin header', () => {
        expect(() =>
            assertTrustedMutationRequest(
                new Request('https://bariskode.test/api/progress/complete', {
                    method: 'POST',
                    headers: {
                        origin: 'https://bariskode.test',
                    },
                }),
            ),
        ).not.toThrow();
    });

    it('allows same-origin requests via Referer fallback', () => {
        expect(() =>
            assertTrustedMutationRequest(
                new Request('https://bariskode.test/api/progress/complete', {
                    method: 'POST',
                    headers: {
                        referer: 'https://bariskode.test/learn/abc',
                    },
                }),
            ),
        ).not.toThrow();
    });

    it('rejects cross-origin origin headers', () => {
        expect(() =>
            assertTrustedMutationRequest(
                new Request('https://bariskode.test/api/progress/complete', {
                    method: 'POST',
                    headers: {
                        origin: 'https://evil.test',
                    },
                }),
            ),
        ).toThrowError(RequestSecurityError);
    });

    it('rejects requests with no origin metadata', () => {
        expect(() =>
            assertTrustedMutationRequest(
                new Request('https://bariskode.test/api/progress/complete', {
                    method: 'POST',
                }),
            ),
        ).toThrowError(RequestSecurityError);
    });

    it('uses configured allowedOrigin when provided', () => {
        expect(() =>
            assertTrustedMutationRequest(
                new Request('http://internal:4321/api/progress/complete', {
                    method: 'POST',
                    headers: {
                        origin: 'https://bariskode.test',
                    },
                }),
                { allowedOrigin: 'https://bariskode.test' },
            ),
        ).not.toThrow();
    });

    it('rejects malformed referer values', () => {
        expect(() =>
            assertTrustedMutationRequest(
                new Request('https://bariskode.test/api/progress/complete', {
                    method: 'POST',
                    headers: {
                        referer: 'not a url',
                    },
                }),
            ),
        ).toThrowError(RequestSecurityError);
    });
});
