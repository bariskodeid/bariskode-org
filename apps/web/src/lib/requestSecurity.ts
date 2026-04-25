export class RequestSecurityError extends Error {
    status: number;

    constructor(message: string, status = 403) {
        super(message);
        this.status = status;
    }
}

function resolveAllowedOrigin(request: Request, configuredSiteUrl?: string): string {
    if (configuredSiteUrl) {
        try {
            return new URL(configuredSiteUrl).origin;
        } catch {
            throw new RequestSecurityError('Server misconfiguration', 500);
        }
    }

    if (import.meta.env.MODE === 'test') {
        return new URL(request.url).origin;
    }

    throw new RequestSecurityError('Server misconfiguration', 500);
}

/**
 * Basic same-origin guard for state-changing requests.
 *
 * Policy:
 * - Allow when `Origin` header matches request origin.
 * - Fallback to `Referer` origin match when `Origin` is absent.
 * - Reject when both headers are missing or cross-origin.
 */
export function assertTrustedMutationRequest(
    request: Request,
    options?: { allowedOrigin?: string },
) {
    const allowedOrigin = resolveAllowedOrigin(
        request,
        options?.allowedOrigin ?? import.meta.env.PUBLIC_SITE_URL,
    );
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    if (origin) {
        if (origin !== allowedOrigin) {
            throw new RequestSecurityError('Forbidden', 403);
        }

        return;
    }

    if (referer) {
        try {
            const refererUrl = new URL(referer);
            if (refererUrl.origin !== allowedOrigin) {
                throw new RequestSecurityError('Forbidden', 403);
            }

            return;
        } catch {
            throw new RequestSecurityError('Forbidden', 403);
        }
    }

    throw new RequestSecurityError('Forbidden', 403);
}
