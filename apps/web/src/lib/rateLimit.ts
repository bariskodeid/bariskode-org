type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const RATE_LIMIT_MAX_KEYS = 5000;

interface RateLimitStore {
    hit(_key: string, _windowMs: number, _now: number): Promise<RateLimitEntry>;
}

class InMemoryRateLimitStore implements RateLimitStore {
    private rateLimitStore = new Map<string, RateLimitEntry>();

    private pruneExpiredEntries(now: number) {
        for (const [key, value] of this.rateLimitStore.entries()) {
            if (now > value.resetAt) {
                this.rateLimitStore.delete(key);
            }
        }
    }

    async hit(key: string, windowMs: number, now: number): Promise<RateLimitEntry> {
        this.pruneExpiredEntries(now);

        const current = this.rateLimitStore.get(key);

        if (!current && this.rateLimitStore.size >= RATE_LIMIT_MAX_KEYS) {
            throw new RateLimitError('Rate limiter is saturated', 503);
        }

        if (!current || now > current.resetAt) {
            const next = {
                count: 1,
                resetAt: now + windowMs,
            };
            this.rateLimitStore.set(key, next);
            return next;
        }

        const next = {
            ...current,
            count: current.count + 1,
        };

        this.rateLimitStore.set(key, next);
        return next;
    }

    reset() {
        this.rateLimitStore.clear();
    }
}

class UpstashRateLimitStore implements RateLimitStore {
    private url: string;
    private token: string;

    constructor(url: string, token: string) {
        this.url = url.replace(/\/$/, '');
        this.token = token;
    }

    private async callPipeline(windowKey: string, windowMs: number): Promise<Response> {
        const parsedTimeoutMs = Number(import.meta.env.RATE_LIMIT_BACKEND_TIMEOUT_MS ?? '1500');
        const parsedMaxRetries = Number(import.meta.env.RATE_LIMIT_BACKEND_MAX_RETRIES ?? '1');
        const timeoutMs = Number.isFinite(parsedTimeoutMs)
            ? Math.min(Math.max(parsedTimeoutMs, 250), 10000)
            : 1500;
        const maxRetries = Number.isFinite(parsedMaxRetries)
            ? Math.min(Math.max(Math.trunc(parsedMaxRetries), 0), 3)
            : 1;

        for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);

            try {
                return await fetch(`${this.url}/pipeline`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([
                        ['INCR', windowKey],
                        ['PEXPIRE', windowKey, windowMs + 5000],
                    ]),
                    signal: controller.signal,
                });
            } catch {
                if (attempt === maxRetries) {
                    throw new RateLimitError('Rate limit backend unavailable', 503);
                }
            } finally {
                clearTimeout(timeout);
            }
        }

        throw new RateLimitError('Rate limit backend unavailable', 503);
    }

    async hit(key: string, windowMs: number, now: number): Promise<RateLimitEntry> {
        const windowKey = `${key}:${Math.floor(now / windowMs)}`;
        const response = await this.callPipeline(windowKey, windowMs);

        if (!response.ok) {
            throw new RateLimitError('Rate limit backend unavailable', 503);
        }

        const result = await response.json();
        const count = Number(result?.[0]?.result ?? 0);

        if (!Number.isFinite(count) || count <= 0) {
            throw new RateLimitError('Rate limit backend unavailable', 503);
        }

        return {
            count,
            resetAt: now + windowMs,
        };
    }
}

const inMemoryRateLimitStore = new InMemoryRateLimitStore();

let rateLimitStoreOverride: RateLimitStore | null = null;

function resolveRateLimitStore(): RateLimitStore {
    if (rateLimitStoreOverride) {
        return rateLimitStoreOverride;
    }

    const backend = (import.meta.env.RATE_LIMIT_BACKEND ?? 'memory').toLowerCase();
    if (backend === 'memory') {
        return inMemoryRateLimitStore;
    }

    if (backend === 'upstash') {
        const upstashUrl = import.meta.env.UPSTASH_REDIS_REST_URL;
        const upstashToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN;

        if (!upstashUrl || !upstashToken) {
            throw new RateLimitError('Rate limit backend misconfiguration', 500);
        }

        let parsedUpstashUrl: URL;
        try {
            parsedUpstashUrl = new URL(upstashUrl);
        } catch {
            throw new RateLimitError('Rate limit backend misconfiguration', 500);
        }

        if (parsedUpstashUrl.protocol !== 'https:') {
            throw new RateLimitError('Rate limit backend misconfiguration', 500);
        }

        return new UpstashRateLimitStore(upstashUrl, upstashToken);
    }

    throw new RateLimitError('Rate limit backend misconfiguration', 500);
}

export class RateLimitError extends Error {
    status: number;

    constructor(message = 'Too Many Requests', status = 429) {
        super(message);
        this.status = status;
    }
}

export async function assertWithinRateLimit(
    key: string,
    options: { limit: number; windowMs: number; now?: number },
) {
    const now = options.now ?? Date.now();
    const entry = await resolveRateLimitStore().hit(key, options.windowMs, now);

    if (entry.count > options.limit) {
        throw new RateLimitError();
    }
}

export function getClientAddress(
    request: Request,
    options?: { trustProxyHeaders?: boolean },
) {
    const trustProxyHeaders = options?.trustProxyHeaders ?? import.meta.env.TRUST_PROXY_HEADERS === 'true';
    if (!trustProxyHeaders) {
        return 'unknown';
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    const realIp = request.headers.get('x-real-ip');
    return realIp?.trim() || 'unknown';
}

export async function assertRequestBodyWithinLimit(request: Request, maxBytes: number) {
    const contentLengthRaw = request.headers.get('content-length');
    if (contentLengthRaw) {
        const contentLength = Number(contentLengthRaw);
        if (Number.isFinite(contentLength) && contentLength > maxBytes) {
            throw new RateLimitError('Payload Too Large', 413);
        }
    }

    if (!request.body) {
        return;
    }

    const reader = request.clone().body?.getReader();
    if (!reader) {
        return;
    }

    let total = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        total += value.byteLength;
        if (total > maxBytes) {
            throw new RateLimitError('Payload Too Large', 413);
        }
    }
}

export function resetRateLimitStore() {
    inMemoryRateLimitStore.reset();
    rateLimitStoreOverride = null;
}

export function setRateLimitStoreForTests(store: RateLimitStore) {
    rateLimitStoreOverride = store;
}
