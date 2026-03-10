import { describe, expect, it } from 'vitest';

import {
    getAdminNavItems,
    getAdminSectionFromPath,
    isAdminUser,
    normalizeAdminPath,
    resolveAdminRouteAccess,
} from './adminAccess';

describe('isAdminUser', () => {
    it('returns true for admin users', () => {
        expect(isAdminUser({ id: 'use_admin_1', role: 'admin' }, 'use_admin_1')).toBe(true);
    });

    it('returns false for non-admin users or invalid shape', () => {
        expect(isAdminUser({ id: 'use_admin_1', role: 'student' }, 'use_admin_1')).toBe(false);
        expect(isAdminUser({ id: 'use_admin_1', role: 'instructor' }, 'use_admin_1')).toBe(false);
        expect(isAdminUser({ id: 'use_other_user', role: 'admin' }, 'use_admin_1')).toBe(false);
        expect(isAdminUser(null)).toBe(false);
        expect(isAdminUser(undefined)).toBe(false);
        expect(isAdminUser({} as never)).toBe(false);
    });
});

describe('normalizeAdminPath', () => {
    it('falls back to /admin for invalid paths', () => {
        expect(normalizeAdminPath(null)).toBe('/admin');
        expect(normalizeAdminPath('')).toBe('/admin');
        expect(normalizeAdminPath('/dashboard')).toBe('/admin');
        expect(normalizeAdminPath('/administer')).toBe('/admin');
        expect(normalizeAdminPath('//admin')).toBe('/admin');
    });

    it('preserves valid admin paths', () => {
        expect(normalizeAdminPath('/admin')).toBe('/admin');
        expect(normalizeAdminPath('/admin/courses/new')).toBe('/admin/courses/new');
    });
});

describe('resolveAdminRouteAccess', () => {
    it('redirects guests to login with nested admin path preserved', () => {
        expect(
            resolveAdminRouteAccess({ user: null, currentPath: '/admin/courses/new' }),
        ).toEqual({
            kind: 'redirect',
            location: '/login?redirect=%2Fadmin%2Fcourses%2Fnew',
        });
    });

    it('redirects non-admin authenticated users to /403', () => {
        expect(
            resolveAdminRouteAccess({
                user: { id: 'use_student_1', role: 'student' },
                currentPath: '/admin/categories',
                adminUserIdsRaw: 'use_admin_1',
            }),
        ).toEqual({ kind: 'redirect', location: '/403' });
    });

    it('allows admin users', () => {
        expect(
            resolveAdminRouteAccess({
                user: { id: 'use_admin_1', role: 'admin' },
                currentPath: '/admin',
                adminUserIdsRaw: 'use_admin_1',
            }),
        ).toEqual({ kind: 'ok' });
    });

    it('rejects admin-role users that are not allowlisted', () => {
        expect(
            resolveAdminRouteAccess({
                user: { id: 'use_not_allowlisted', role: 'admin' },
                currentPath: '/admin',
                adminUserIdsRaw: 'use_admin_1',
            }),
        ).toEqual({ kind: 'redirect', location: '/403' });
    });

    it('sanitizes invalid guest redirect paths', () => {
        expect(
            resolveAdminRouteAccess({ user: null, currentPath: '/dashboard' }),
        ).toEqual({
            kind: 'redirect',
            location: '/login?redirect=%2Fadmin',
        });
    });
});

describe('admin navigation helpers', () => {
    it('maps current path to a known admin section', () => {
        expect(getAdminSectionFromPath('/admin')).toBe('overview');
        expect(getAdminSectionFromPath('/admin/categories')).toBe('categories');
        expect(getAdminSectionFromPath('/admin/comments')).toBe('comments');
        expect(getAdminSectionFromPath('/admin/courses/new')).toBe('courses');
        expect(getAdminSectionFromPath('/administer')).toBeNull();
        expect(getAdminSectionFromPath('/dashboard')).toBeNull();
    });

    it('returns stable nav structure with one active item', () => {
        const navItems = getAdminNavItems('/admin/courses');

        expect(navItems).toHaveLength(4);
        expect(navItems.filter((item) => item.isActive)).toHaveLength(1);
        expect(navItems.find((item) => item.key === 'courses')?.isActive).toBe(true);
        expect(navItems.find((item) => item.key === 'overview')?.isActive).toBe(false);
        expect(navItems.find((item) => item.key === 'comments')?.isActive).toBe(false);
    });
});
