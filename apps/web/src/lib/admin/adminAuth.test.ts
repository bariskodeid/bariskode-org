import { describe, expect, it } from 'vitest';

import {
    AdminAuthorizationError,
    isTrustedAdminUser,
    parseAdminUserIds,
    requireAdminUser,
} from './adminAuth';

describe('parseAdminUserIds', () => {
    it('parses a comma-separated admin id list', () => {
        expect(parseAdminUserIds(' use_admin_1, use_admin_2 ,, use_admin_3 ')).toEqual([
            'use_admin_1',
            'use_admin_2',
            'use_admin_3',
        ]);
    });

    it('returns an empty list when unset', () => {
        expect(parseAdminUserIds(undefined)).toEqual([]);
    });
});

describe('isTrustedAdminUser', () => {
    it('returns true only when role is admin and id is allowlisted', () => {
        expect(
            isTrustedAdminUser(
                { id: 'use_admin_1', role: 'admin' } as const,
                'use_admin_1,use_admin_2',
            ),
        ).toBe(true);
    });

    it('rejects admin role without allowlisted id', () => {
        expect(
            isTrustedAdminUser(
                { id: 'use_not_allowlisted', role: 'admin' } as const,
                'use_admin_1,use_admin_2',
            ),
        ).toBe(false);
    });

    it('rejects non-admin roles even if id is allowlisted', () => {
        expect(
            isTrustedAdminUser(
                { id: 'use_admin_1', role: 'student' } as const,
                'use_admin_1',
            ),
        ).toBe(false);
    });

    it('fails closed when no admin ids are configured', () => {
        expect(isTrustedAdminUser({ id: 'use_admin_1', role: 'admin' } as const, undefined)).toBe(false);
    });
});

describe('requireAdminUser', () => {
    it('throws 401 when user is missing', () => {
        expect(() => requireAdminUser(null, 'use_admin_1')).toThrowError(AdminAuthorizationError);

        try {
            requireAdminUser(null, 'use_admin_1');
        } catch (error) {
            expect((error as AdminAuthorizationError).status).toBe(401);
        }
    });

    it('throws 403 when user is not a trusted admin', () => {
        expect(() =>
            requireAdminUser(
                { id: 'use_admin_1', role: 'admin' } as never,
                'use_someone_else',
            ),
        ).toThrowError(AdminAuthorizationError);
    });

    it('returns the user when id and role are both trusted', () => {
        const user = { id: 'use_admin_1', role: 'admin' } as never;

        expect(requireAdminUser(user, 'use_admin_1')).toBe(user);
    });
});
