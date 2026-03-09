import { expect, test } from '@playwright/test';

test('verify-email page renders resend form', async ({ page }) => {
    await page.goto('/verify-email?email=test@example.com');

    await expect(page.getByRole('heading', { name: /Verifikasi Email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kirim Ulang/i })).toBeVisible();
});

test('reset-password page renders with token', async ({ page }) => {
    await page.goto('/reset-password?token=dummy-token');

    await expect(page.getByRole('heading', { name: /Reset Password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Simpan Password Baru/i })).toBeVisible();
});

test('forgot-password page renders request form', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.getByRole('heading', { name: /Lupa Password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kirim Link Reset/i })).toBeVisible();
});
