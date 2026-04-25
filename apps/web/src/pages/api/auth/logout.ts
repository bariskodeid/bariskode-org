import type { APIRoute } from 'astro';
import { assertWithinRateLimit, getClientAddress, RateLimitError } from '../../../lib/rateLimit';
import { assertTrustedMutationRequest, RequestSecurityError } from '../../../lib/requestSecurity';

/**
 * Logout — clear auth cookie and redirect.
 * POST /api/auth/logout
 */
export const POST: APIRoute = async ({ locals, request }) => {
    try {
        assertTrustedMutationRequest(request);

        const clientAddress = getClientAddress(request);
        await assertWithinRateLimit(`logout:${locals.user?.id ?? 'anon'}:${clientAddress}`, {
            limit: 30,
            windowMs: 60_000,
        });
    } catch (error) {
        if (error instanceof RequestSecurityError || error instanceof RateLimitError) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        throw error;
    }

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
