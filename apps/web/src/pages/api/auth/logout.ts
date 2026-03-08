import type { APIRoute } from 'astro';

/**
 * Logout — clear auth cookie and redirect.
 * POST /api/auth/logout
 */
export const POST: APIRoute = async ({ locals, redirect }) => {
    locals.pb.authStore.clear();

    const response = new Response(null, {
        status: 302,
        headers: { Location: '/' },
    });

    // Send cleared cookie
    response.headers.append(
        'set-cookie',
        locals.pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'Lax' })
    );

    return response;
};

// Also handle GET for convenience (e.g. from links)
export const GET: APIRoute = async ({ locals, redirect }) => {
    locals.pb.authStore.clear();

    const response = new Response(null, {
        status: 302,
        headers: { Location: '/' },
    });

    response.headers.append(
        'set-cookie',
        locals.pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'Lax' })
    );

    return response;
};
