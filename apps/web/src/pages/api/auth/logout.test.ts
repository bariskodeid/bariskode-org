import { describe, expect, it, vi } from 'vitest';

import { POST } from './logout';

describe('POST /api/auth/logout request security', () => {
    it('rejects cross-origin requests and does not clear auth store', async () => {
        const clear = vi.fn();
        const exportToCookie = vi.fn(() => 'pb_auth=; Path=/; Max-Age=0');

        const request = new Request('https://bariskode.test/api/auth/logout', {
            method: 'POST',
            headers: {
                origin: 'https://evil.test',
            },
        });

        const response = await POST({
            locals: {
                pb: {
                    authStore: { clear, exportToCookie },
                },
            },
            request,
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
        expect(clear).not.toHaveBeenCalled();
        expect(exportToCookie).not.toHaveBeenCalled();
    });

    it('allows same-origin requests and clears auth store', async () => {
        const clear = vi.fn();
        const exportToCookie = vi.fn(() => 'pb_auth=; Path=/; Max-Age=0');

        const request = new Request('https://bariskode.test/api/auth/logout', {
            method: 'POST',
            headers: {
                origin: 'https://bariskode.test',
            },
        });

        const response = await POST({
            locals: {
                pb: {
                    authStore: { clear, exportToCookie },
                },
            },
            request,
        } as never);

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/');
        expect(clear).toHaveBeenCalledOnce();
        expect(exportToCookie).toHaveBeenCalledOnce();
    });
});
