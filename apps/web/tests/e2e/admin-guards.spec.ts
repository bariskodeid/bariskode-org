import { expect, test } from '@playwright/test';

test.describe('admin guards', () => {
    test('guest users are redirected from admin pages to login', async ({ page }) => {
        const cases = [
            { path: '/admin', redirect: '/login?redirect=%2Fadmin' },
            { path: '/admin/categories', redirect: '/login?redirect=%2Fadmin%2Fcategories' },
            { path: '/admin/courses', redirect: '/login?redirect=%2Fadmin%2Fcourses' },
        ];

        for (const entry of cases) {
            await page.goto(entry.path);
            await expect(page).toHaveURL(new RegExp(entry.redirect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
            await expect(page.getByRole('heading', { name: /Selamat Datang Kembali/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /Masuk/i })).toBeVisible();
        }
    });

    test('guest users cannot call admin category create API', async ({ request }) => {
        const response = await request.post('/api/admin/categories', {
            form: {
                name: 'Security',
                slug: 'security',
                description: 'Unauthorized test request',
                order: '1',
            },
        });

        expect(response.status()).toBe(401);
        expect(response.headers()['content-type']).toContain('application/json');
        await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    });

    test('guest users cannot call admin course create API', async ({ request }) => {
        const response = await request.post('/api/admin/courses', {
            form: {
                title: 'Unauthorized Course',
                slug: 'unauthorized-course',
                description: 'Unauthorized test request',
                category: 'cat123def456ghi',
                instructor: 'use123def456ghi',
                difficulty: 'beginner',
                status: 'draft',
                estimated_hours: '1',
            },
        });

        expect(response.status()).toBe(401);
        expect(response.headers()['content-type']).toContain('application/json');
        await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    });
});
