const FLASH_QUERY_PARAMS = ['status', 'tone'] as const;

export function parsePositivePage(value: string | null): number {
    if (!value) {
        return 1;
    }

    const page = Number(value);
    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

export function clampAdminCommentsPage(page: number, totalPages: number): number {
    return Math.min(page, Math.max(totalPages, 1));
}

export function buildCommentsPageHref(page: number, searchParams: URLSearchParams): string {
    const params = new URLSearchParams(searchParams);

    for (const key of FLASH_QUERY_PARAMS) {
        params.delete(key);
    }

    params.set('page', String(page));

    return `/admin/comments?${params.toString()}`;
}
