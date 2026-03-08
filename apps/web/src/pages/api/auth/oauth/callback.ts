import type { APIRoute } from 'astro';

/**
 * OAuth callback — exchange code for auth token.
 * GET /api/auth/oauth/callback?code=xxx&state=yyy
 */
export const GET: APIRoute = async ({ request, locals, redirect }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
        return redirect('/login?error=missing_params');
    }

    // Parse cookies
    const cookies = Object.fromEntries(
        (request.headers.get('cookie') ?? '')
            .split(';')
            .map((c) => c.trim().split('=').map((s) => s.trim()))
    );

    const storedState = cookies['oauth_state'];
    const codeVerifier = cookies['oauth_verifier'];
    const provider = cookies['oauth_provider'];

    if (!storedState || !codeVerifier || !provider) {
        return redirect('/login?error=invalid_session');
    }

    // Verify state to prevent CSRF
    if (state !== storedState) {
        return redirect('/login?error=state_mismatch');
    }

    try {
        const pb = locals.pb;
        const redirectUrl = `${new URL('/api/auth/oauth/callback', import.meta.env.SITE || 'http://localhost:4321').toString()}`;

        // Exchange code for auth
        await pb.collection('users').authWithOAuth2Code(
            provider,
            code,
            codeVerifier,
            redirectUrl,
            {
                // Create user on first OAuth login
                createData: {
                    role: 'student',
                    xp: 0,
                    level: 1,
                    streak_current: 0,
                    streak_longest: 0,
                },
            }
        );

        // Set the auth cookie
        const response = new Response(null, {
            status: 302,
            headers: { Location: '/dashboard' },
        });

        response.headers.append(
            'set-cookie',
            pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'Lax' })
        );

        // Clear OAuth cookies
        response.headers.append('set-cookie', 'oauth_state=; HttpOnly; Secure; Path=/; Max-Age=0');
        response.headers.append('set-cookie', 'oauth_verifier=; HttpOnly; Secure; Path=/; Max-Age=0');
        response.headers.append('set-cookie', 'oauth_provider=; HttpOnly; Secure; Path=/; Max-Age=0');

        return response;
    } catch (e: any) {
        console.error('OAuth callback error:', e?.message);
        return redirect('/login?error=oauth_callback_failed');
    }
};
