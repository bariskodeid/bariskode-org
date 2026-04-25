import { expect, test } from '@playwright/test';

test.describe('@smoke-staging deploy verification', () => {
    test('homepage is reachable', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Bariskode/i);
    });

    test('protected dashboard redirects guest to login', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
    });

    test('forgot-password route is healthy', async ({ page }) => {
        await page.goto('/forgot-password');
        await expect(page.getByRole('heading', { name: /Lupa Password/i })).toBeVisible();
    });
});
