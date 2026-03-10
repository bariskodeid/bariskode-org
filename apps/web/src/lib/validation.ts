const POCKETBASE_ID_REGEX = /^[a-z0-9]{15}$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,50}$/i;

export function isValidPocketBaseId(value: unknown): value is string {
    return typeof value === 'string' && POCKETBASE_ID_REGEX.test(value);
}

export function normalizeInternalRedirect(value: string | null | undefined, fallback = '/dashboard'): string {
    if (!value) return fallback;
    if (!value.startsWith('/')) return fallback;
    if (value.startsWith('//')) return fallback;
    return value;
}

export function isValidUsername(value: unknown): value is string {
    return typeof value === 'string' && USERNAME_REGEX.test(value);
}
