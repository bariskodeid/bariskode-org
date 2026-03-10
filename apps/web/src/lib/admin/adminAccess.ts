import type { AdminNavItem, AdminSectionKey, User } from '@/types';

import { isTrustedAdminUser } from './adminAuth';

function isAdminPath(currentPath: string | null | undefined): currentPath is string {
    return typeof currentPath === 'string'
        && (currentPath === '/admin' || currentPath.startsWith('/admin/'));
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    {
        key: 'overview',
        label: 'Overview',
        href: '/admin',
        description: 'Ringkasan area admin dan langkah berikutnya.',
    },
    {
        key: 'categories',
        label: 'Categories',
        href: '/admin/categories',
        description: 'Kelola kategori untuk pengelompokan course.',
    },
    {
        key: 'courses',
        label: 'Courses',
        href: '/admin/courses',
        description: 'Kelola course, module, lesson, dan status publish.',
    },
    {
        key: 'comments',
        label: 'Comments',
        href: '/admin/comments',
        description: 'Moderasi komentar lesson melalui trusted backend.',
    },
];

export type AdminRouteAccessResult =
    | { kind: 'ok' }
    | { kind: 'redirect'; location: string };

export function isAdminUser(
    user: Pick<User, 'id' | 'role'> | null | undefined,
    adminUserIdsRaw?: string,
): boolean {
    return isTrustedAdminUser(user, adminUserIdsRaw);
}

export function normalizeAdminPath(currentPath: string | null | undefined): string {
    if (!isAdminPath(currentPath)) {
        return '/admin';
    }

    if (currentPath.startsWith('//')) {
        return '/admin';
    }

    return currentPath;
}

export function resolveAdminRouteAccess(params: {
    user: Pick<User, 'id' | 'role'> | null | undefined;
    currentPath: string | null | undefined;
    adminUserIdsRaw?: string;
}): AdminRouteAccessResult {
    const normalizedPath = normalizeAdminPath(params.currentPath);

    if (!params.user) {
        return {
            kind: 'redirect',
            location: `/login?redirect=${encodeURIComponent(normalizedPath)}`,
        };
    }

    if (!isAdminUser(params.user, params.adminUserIdsRaw)) {
        return { kind: 'redirect', location: '/403' };
    }

    return { kind: 'ok' };
}

export function getAdminSectionFromPath(
    currentPath: string | null | undefined,
): AdminSectionKey | null {
    if (!isAdminPath(currentPath) || currentPath.startsWith('//')) {
        return null;
    }

    const normalizedPath = currentPath;

    const matchedItem = ADMIN_NAV_ITEMS.find((item) => {
        if (item.href === '/admin') {
            return normalizedPath === '/admin';
        }

        return normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`);
    });

    return matchedItem?.key ?? null;
}

export function getAdminNavItems(currentPath: string | null | undefined) {
    const activeSection = getAdminSectionFromPath(currentPath);

    return ADMIN_NAV_ITEMS.map((item) => ({
        ...item,
        isActive: item.key === activeSection,
    }));
}
