import { expect, test } from '@playwright/test';

test('homepage renders and has primary CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Bariskode/i);
    await expect(page.getByRole('link', { name: /Mulai Belajar Gratis/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Lihat Kursus/i })).toBeVisible();
});

test('dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
});

test('invalid certificate page shows not found state', async ({ page }) => {
    await page.goto('/verify/invalid-certificate-id');

    await expect(page.getByRole('heading', { name: /Certificate Tidak Valid/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Kembali ke Beranda/i })).toBeVisible();
});
