const POCKETBASE_ID_REGEX = /^[a-z0-9]{15}$/;

export function isValidPocketBaseId(value: unknown): value is string {
    return typeof value === 'string' && POCKETBASE_ID_REGEX.test(value);
}

export function normalizeInternalRedirect(value: string | null | undefined, fallback = '/dashboard'): string {
    if (!value) return fallback;
    if (!value.startsWith('/')) return fallback;
    if (value.startsWith('//')) return fallback;
    return value;
}
