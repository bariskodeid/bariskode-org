import type { User } from '@/types';

export class AdminAuthorizationError extends Error {
    status: number;

    constructor(message: string, status = 403) {
        super(message);
        this.status = status;
    }
}

type AdminIdentity = Pick<User, 'id'> & { role?: User['role'] };

function getConfiguredAdminUserIds(adminUserIdsRaw?: string): string | undefined {
    if (typeof adminUserIdsRaw === 'string') {
        return adminUserIdsRaw;
    }

    return import.meta.env.ADMIN_USER_IDS ?? process.env.ADMIN_USER_IDS;
}

export function parseAdminUserIds(adminUserIdsRaw: string | undefined): string[] {
    return (adminUserIdsRaw ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
}

export function isTrustedAdminUser(
    user: AdminIdentity | null | undefined,
    adminUserIdsRaw?: string,
): boolean {
    if (!user || user.role !== 'admin') {
        return false;
    }

    const configuredAdminUserIds = parseAdminUserIds(getConfiguredAdminUserIds(adminUserIdsRaw));

    if (configuredAdminUserIds.length === 0) {
        return false;
    }

    return configuredAdminUserIds.includes(user.id);
}

export function requireAdminUser(
    user: User | null | undefined,
    adminUserIdsRaw?: string,
) {
    if (!user) {
        throw new AdminAuthorizationError('Unauthorized', 401);
    }

    if (!isTrustedAdminUser(user, adminUserIdsRaw)) {
        throw new AdminAuthorizationError('Forbidden', 403);
    }

    return user;
}
