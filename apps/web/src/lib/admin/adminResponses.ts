export function redirectToAdminCategories(params: Record<string, string>) {
    const search = new URLSearchParams(params).toString();

    return new Response(null, {
        status: 302,
        headers: {
            Location: `/admin/categories${search ? `?${search}` : ''}`,
        },
    });
}

export function redirectToAdminCourses(params: Record<string, string>) {
    const search = new URLSearchParams(params).toString();

    return new Response(null, {
        status: 302,
        headers: {
            Location: `/admin/courses${search ? `?${search}` : ''}`,
        },
    });
}
