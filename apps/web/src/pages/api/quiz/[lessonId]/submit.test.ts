import { describe, expect, it } from 'vitest';

import { POST } from './submit';

describe('POST /api/quiz/[lessonId]/submit request security', () => {
    it('rejects cross-origin requests', async () => {
        const request = new Request('https://bariskode.test/api/quiz/les123abc456def/submit', {
            method: 'POST',
            headers: {
                origin: 'https://evil.test',
                'content-type': 'application/json',
            },
            body: JSON.stringify({ answers: [] }),
        });

        const response = await POST({
            params: { lessonId: 'les123abc456def' },
            locals: { user: { id: 'use123abc456def', email: 'u@test.dev', username: 'user' } },
            request,
        } as never);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    });

    it('allows same-origin requests to continue route validation', async () => {
        const request = new Request('https://bariskode.test/api/quiz/invalid/submit', {
            method: 'POST',
            headers: {
                origin: 'https://bariskode.test',
                'content-type': 'application/json',
            },
            body: JSON.stringify({ answers: [] }),
        });

        const response = await POST({
            params: { lessonId: 'invalid' },
            locals: { user: { id: 'use123abc456def', email: 'u@test.dev', username: 'user' } },
            request,
        } as never);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid lessonId' });
    });
});
