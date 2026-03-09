import { expect, test } from '@playwright/test';

test('homepage renders and has primary CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Bariskode/i);
    await expect(page.getByRole('link', { name: /Mulai Belajar Gratis/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Lihat Kursus/i })).toBeVisible();
});
