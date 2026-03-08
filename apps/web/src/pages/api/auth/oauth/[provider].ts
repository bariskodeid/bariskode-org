import type { APIRoute } from 'astro';

/**
 * OAuth initiate — redirect user to provider's auth URL.
 * GET /api/auth/oauth/[provider]
 */
export const GET: APIRoute = async ({ params, locals, redirect }) => {
    const provider = params.provider as string;
    const validProviders = ['github', 'google'];

    if (!validProviders.includes(provider)) {
        return new Response(JSON.stringify({ error: 'Invalid provider' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const pb = locals.pb;

        // List available auth methods to get the OAuth provider URL
        const authMethods = await pb.collection('users').listAuthMethods();
        const providerConfig = authMethods.oauth2?.providers?.find(
            (p: { name: string }) => p.name === provider
        );

        if (!providerConfig) {
            return new Response(JSON.stringify({ error: `Provider ${provider} not configured` }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Store provider state and code verifier in a cookie for callback
        const state = providerConfig.state;
        const codeVerifier = providerConfig.codeVerifier;
        const redirectUrl = `${new URL('/api/auth/oauth/callback', import.meta.env.SITE || 'http://localhost:4321').toString()}`;

        // Build the auth URL
        const authUrl = `${providerConfig.authURL}${providerConfig.authURL.includes('?') ? '&' : '?'}redirect_uri=${encodeURIComponent(redirectUrl)}`;

        // Store state in cookie for verification in callback
        const headers = new Headers();
        headers.append('set-cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
        headers.append('set-cookie', `oauth_verifier=${codeVerifier}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
        headers.append('set-cookie', `oauth_provider=${provider}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
        headers.append('Location', authUrl);

        return new Response(null, { status: 302, headers });
    } catch (e: any) {
        console.error('OAuth init error:', e?.message);
        return redirect('/login?error=oauth_failed');
    }
};
