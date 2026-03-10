import { describe, expect, it } from 'vitest';

import {
    buildCommentsPageHref,
    clampAdminCommentsPage,
    parsePositivePage,
} from './commentAdminPagination';

describe('commentAdminPagination', () => {
    describe('parsePositivePage', () => {
        it('returns page 1 for missing or invalid values', () => {
            expect(parsePositivePage(null)).toBe(1);
            expect(parsePositivePage('0')).toBe(1);
            expect(parsePositivePage('-1')).toBe(1);
            expect(parsePositivePage('abc')).toBe(1);
            expect(parsePositivePage('1.5')).toBe(1);
        });

        it('returns positive integer page values', () => {
            expect(parsePositivePage('7')).toBe(7);
        });
    });

    describe('clampAdminCommentsPage', () => {
        it('clamps oversized page numbers to the last available page', () => {
            expect(clampAdminCommentsPage(9999, 3)).toBe(3);
        });

        it('keeps at least page 1 when total pages is empty-like', () => {
            expect(clampAdminCommentsPage(5, 0)).toBe(1);
        });
    });

    describe('buildCommentsPageHref', () => {
        it('preserves safe params while removing flash params', () => {
            const href = buildCommentsPageHref(
                2,
                new URLSearchParams('page=1&filter=hidden&status=comment_hidden&tone=success'),
            );

            expect(href).toBe('/admin/comments?page=2&filter=hidden');
        });
    });
});
