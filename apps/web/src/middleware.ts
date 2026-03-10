import { defineMiddleware } from 'astro:middleware';
import { createPocketBase } from '@lib/pocketbase';
import { isTrustedAdminUser } from '@lib/admin/adminAuth';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/learn', '/quiz', '/admin'];
// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];
// Routes that redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/register'];

// Security headers
const SECURITY_HEADERS: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const onRequest = defineMiddleware(async ({ locals, request, redirect, url }, next) => {
    // Create per-request PocketBase instance (SSR-safe: no auth leaking)
    const pb = createPocketBase();
    const cookie = request.headers.get('cookie') ?? '';

    // Load auth state from cookie
    pb.authStore.loadFromCookie(cookie);

    // Refresh token if valid (extend session)
    if (pb.authStore.isValid) {
        try {
            await pb.collection('users').authRefresh();
        } catch {
            pb.authStore.clear();
        }
    }

    // Set locals — available in all .astro pages
    locals.pb = pb;
    locals.user = pb.authStore.isValid
        ? (pb.authStore.record as unknown as App.Locals['user'])
        : null;

    const path = url.pathname;

    // Redirect unauthenticated users from protected routes
    const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r));
    if (isProtected && !locals.user) {
        return redirect(`/login?redirect=${encodeURIComponent(path)}`);
    }

    // Admin-only routes
    const isAdminRoute = ADMIN_ROUTES.some((r) => path.startsWith(r));
    if (isAdminRoute && !isTrustedAdminUser(locals.user)) {
        return redirect('/403');
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
    if (isAuthRoute && locals.user) {
        return redirect('/dashboard');
    }

    const response = await next();

    // Update cookie with latest auth state
    response.headers.append(
        'set-cookie',
        pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'Lax' })
    );

    // Apply security headers
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value);
    }

    return response;
});
