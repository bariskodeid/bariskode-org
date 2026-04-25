import { describe, expect, it } from 'vitest';

import { POST } from './generate';

describe('POST /api/certificates/generate request security', () => {
    it('rejects cross-origin requests', async () => {
        const request = new Request('https://bariskode.test/api/certificates/generate', {
            method: 'POST',
            headers: {
                origin: 'https://evil.test',
                'content-type': 'application/json',
            },
            body: JSON.stringify({ courseId: 'cou123abc456def' }),
        });

        const response = await POST({
            locals: { user: { id: 'use123abc456def', email: 'u@test.dev', username: 'user' } },
            request,
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    });

    it('returns invalid JSON error for malformed payloads', async () => {
        const request = new Request('https://bariskode.test/api/certificates/generate', {
            method: 'POST',
            headers: {
                origin: 'https://bariskode.test',
                'content-type': 'application/json',
            },
            body: '{not-valid-json',
        });

        const response = await POST({
            locals: { user: { id: 'use123abc456def', email: 'u@test.dev', username: 'user' } },
            request,
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON body' });
    });
});
