export class AdminRequestError extends Error {
    status: number;

    constructor(message: string, status = 403) {
        super(message);
        this.status = status;
    }
}

export function assertTrustedAdminPostRequest(request: Request) {
    const requestUrl = new URL(request.url);
    const allowedOrigin = requestUrl.origin;
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    if (origin) {
        if (origin !== allowedOrigin) {
            throw new AdminRequestError('Forbidden', 403);
        }

        return;
    }

    if (referer) {
        try {
            const refererUrl = new URL(referer);
            if (refererUrl.origin !== allowedOrigin) {
                throw new AdminRequestError('Forbidden', 403);
            }

            return;
        } catch {
            throw new AdminRequestError('Forbidden', 403);
        }
    }

    throw new AdminRequestError('Forbidden', 403);
}
