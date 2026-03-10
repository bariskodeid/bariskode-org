import { describe, expect, it } from 'vitest';

import { AdminRequestError, assertTrustedAdminPostRequest } from './adminRequest';

describe('assertTrustedAdminPostRequest', () => {
    it('allows same-origin requests via Origin header', () => {
        expect(() =>
            assertTrustedAdminPostRequest(
                new Request('https://bariskode.test/api/admin/categories', {
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
            assertTrustedAdminPostRequest(
                new Request('https://bariskode.test/api/admin/categories', {
                    method: 'POST',
                    headers: {
                        referer: 'https://bariskode.test/admin/categories',
                    },
                }),
            ),
        ).not.toThrow();
    });

    it('rejects cross-origin requests', () => {
        expect(() =>
            assertTrustedAdminPostRequest(
                new Request('https://bariskode.test/api/admin/categories', {
                    method: 'POST',
                    headers: {
                        origin: 'https://evil.test',
                    },
                }),
            ),
        ).toThrowError(AdminRequestError);
    });

    it('rejects requests without origin and referer', () => {
        expect(() =>
            assertTrustedAdminPostRequest(
                new Request('https://bariskode.test/api/admin/categories', {
                    method: 'POST',
                }),
            ),
        ).toThrowError(AdminRequestError);
    });

    it('rejects malformed referer values', () => {
        expect(() =>
            assertTrustedAdminPostRequest(
                new Request('https://bariskode.test/api/admin/categories', {
                    method: 'POST',
                    headers: {
                        referer: 'not a url',
                    },
                }),
            ),
        ).toThrowError(AdminRequestError);
    });
});
