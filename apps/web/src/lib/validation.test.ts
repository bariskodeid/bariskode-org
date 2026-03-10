import { describe, expect, it } from 'vitest';

import { isValidPocketBaseId, isValidUsername, normalizeInternalRedirect } from './validation';

describe('isValidPocketBaseId', () => {
    it('accepts valid PocketBase ids', () => {
        expect(isValidPocketBaseId('abc123def456ghi')).toBe(true);
    });

    it('rejects invalid PocketBase ids', () => {
        expect(isValidPocketBaseId('bad-id')).toBe(false);
        expect(isValidPocketBaseId(null)).toBe(false);
    });
});

describe('normalizeInternalRedirect', () => {
    it('keeps safe internal redirects and rejects unsafe values', () => {
        expect(normalizeInternalRedirect('/dashboard')).toBe('/dashboard');
        expect(normalizeInternalRedirect('//evil.test')).toBe('/dashboard');
        expect(normalizeInternalRedirect('https://evil.test')).toBe('/dashboard');
    });
});

describe('isValidUsername', () => {
    it('accepts valid usernames', () => {
        expect(isValidUsername('bariskode_user')).toBe(true);
        expect(isValidUsername('Bariskode123')).toBe(true);
    });

    it('rejects invalid usernames', () => {
        expect(isValidUsername('ab')).toBe(false);
        expect(isValidUsername("user' OR 1=1 --")).toBe(false);
        expect(isValidUsername('bad space')).toBe(false);
        expect(isValidUsername(null)).toBe(false);
    });
});
