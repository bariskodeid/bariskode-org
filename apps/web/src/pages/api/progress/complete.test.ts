import { describe, expect, it } from 'vitest';

import { POST } from './complete';

describe('POST /api/progress/complete request security', () => {
    it('rejects cross-origin requests', async () => {
        const request = new Request('https://bariskode.test/api/progress/complete', {
            method: 'POST',
            headers: {
                origin: 'https://evil.test',
                'content-type': 'application/json',
            },
            body: JSON.stringify({ lessonId: 'les123abc456def' }),
        });

        const response = await POST({
            locals: { user: { id: 'use123abc456def', email: 'u@test.dev', username: 'user' } },
            request,
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    });

    it('allows same-origin requests to continue route validation', async () => {
        const request = new Request('https://bariskode.test/api/progress/complete', {
            method: 'POST',
            headers: {
                origin: 'https://bariskode.test',
                'content-type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const response = await POST({
            locals: { user: { id: 'use123abc456def', email: 'u@test.dev', username: 'user' } },
            request,
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'lessonId is required' });
    });
});
