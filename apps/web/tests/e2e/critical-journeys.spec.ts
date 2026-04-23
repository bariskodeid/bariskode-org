import { expect, test } from '@playwright/test';

test.describe('critical journey guards', () => {
    test('guest user is redirected to login when accessing lesson/quiz pages', async ({ page }) => {
        const guardedPaths = ['/learn/demo-lesson-id', '/quiz/demo-lesson-id'];

        for (const guardedPath of guardedPaths) {
            await page.goto(guardedPath);

            const expectedEncodedRedirect = encodeURIComponent(guardedPath);
            await expect(page).toHaveURL(new RegExp(`/login\\?redirect=${expectedEncodedRedirect}$`));

            const currentUrl = new URL(page.url());
            expect(currentUrl.pathname).toBe('/login');
            expect(currentUrl.searchParams.get('redirect')).toBe(guardedPath);

            await expect(page.getByRole('heading', { name: /Selamat Datang Kembali/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /Masuk/i })).toBeVisible();
            await expect(page.locator('input[name="redirect"]')).toHaveValue(guardedPath);
        }
    });

    test('login page normalizes external redirect target', async ({ page }) => {
        await page.goto('/login?redirect=https://evil.example/phishing');

        const currentUrl = new URL(page.url());
        expect(currentUrl.pathname).toBe('/login');
        expect(currentUrl.searchParams.get('redirect')).toBe('https://evil.example/phishing');

        await expect(page.getByRole('heading', { name: /Selamat Datang Kembali/i })).toBeVisible();
        await expect(page.locator('input[name="redirect"]')).toHaveValue('/dashboard');
    });
});

const authEmail = process.env.E2E_AUTH_EMAIL;
const authPassword = process.env.E2E_AUTH_PASSWORD;
const courseSlug = process.env.E2E_COURSE_SLUG;
const readingLessonId = process.env.E2E_READING_LESSON_ID;
const quizLessonId = process.env.E2E_QUIZ_LESSON_ID;
const allowNonLocalTarget = process.env.E2E_ALLOW_NONLOCAL_TARGET === '1';
const quizAnswers = (process.env.E2E_QUIZ_ANSWERS ?? 'Guido van Rossum|str|Benar')
    .split('|')
    .map((value) => value.trim())
    .filter(Boolean);

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isSafeE2EHost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1';
}

test.describe('critical journey authenticated flow (opt-in)', () => {
    test.skip(
        !authEmail || !authPassword || !courseSlug,
        'Set E2E_AUTH_EMAIL, E2E_AUTH_PASSWORD, and E2E_COURSE_SLUG to run authenticated AQ-04 flow.',
    );

    test('auth → learn → quiz → certificate surfaces', async ({ page, baseURL }) => {
        test.setTimeout(90000);

        if (!baseURL) {
            test.skip(true, 'Playwright baseURL is required for authenticated AQ-04 flow.');
        }

        const baseHost = new URL(baseURL!).hostname;
        test.skip(
            !allowNonLocalTarget && !isSafeE2EHost(baseHost),
            `Refusing authenticated E2E on non-local host: ${baseHost}. Set E2E_ALLOW_NONLOCAL_TARGET=1 to override.`,
        );

        if (readingLessonId) {
            await page.goto(`/learn/${readingLessonId}`);
        } else {
            await page.goto(`/courses/${courseSlug}`);

            await expect(page.getByRole('link', { name: /Mulai Belajar|Lanjutkan Belajar/i })).toBeVisible();

            const startLearningLink = page.getByRole('link', {
                name: /Mulai Belajar|Lanjutkan Belajar/i,
            });
            await startLearningLink.click();
        }

        await expect(page).toHaveURL(/\/login\?redirect=%2Flearn%2F/);

        await page.getByLabel('Email').fill(authEmail!);
        await page.getByLabel('Password').fill(authPassword!);
        await page.getByRole('button', { name: /^Masuk$/i }).click();
        await expect(page.getByText(/Email atau password salah/i)).toHaveCount(0);
        await expect(page).toHaveURL(new RegExp(`^${escapeRegExp(baseURL!)}\/learn\/`));

        await expect(page).toHaveURL(/\/learn\//);

        if (quizLessonId) {
            await page.goto(`/learn/${quizLessonId}`);
        } else {
            await page.goto(`/courses/${courseSlug}`);

            const quizLink = page
                .locator('a[href^="/learn/"]', { hasText: /quiz/i })
                .first();
            await expect(quizLink).toBeVisible();
            await quizLink.click();
        }

        await expect(page).toHaveURL(/\/learn\//);
        await expect(page.getByRole('link', { name: /Mulai Quiz/i })).toBeVisible();
        await page.getByRole('link', { name: /Mulai Quiz/i }).click();

        await expect(page).toHaveURL(/\/quiz\//);
        await expect(page.getByRole('heading', { name: /Quiz/i })).toBeVisible();

        // Default answers target seeded Python intro quiz; override with E2E_QUIZ_ANSWERS.
        await page
            .getByRole('button', {
                name: new RegExp(escapeRegExp(quizAnswers[0] ?? 'Guido van Rossum'), 'i'),
            })
            .click();
        await page.getByRole('button', { name: /Selanjutnya/i }).click();
        await page
            .getByRole('button', {
                name: new RegExp(escapeRegExp(quizAnswers[1] ?? 'str'), 'i'),
            })
            .click();
        await page.getByRole('button', { name: /Selanjutnya/i }).click();
        await page
            .getByRole('button', {
                name: new RegExp(escapeRegExp(quizAnswers[2] ?? 'Benar'), 'i'),
            })
            .click();

        const submitResponsePromise = page.waitForResponse(
            (response) => response.url().includes('/api/quiz/') && response.url().includes('/submit')
                && response.request().method() === 'POST',
            { timeout: 15000 },
        );

        await page.getByRole('button', { name: /Submit Quiz/i }).click();

        const submitResponse = await submitResponsePromise;
        const submitStatus = submitResponse.status();
        const submitPayload = await submitResponse.json();

        if (submitStatus === 429) {
            expect(submitPayload?.error).toMatch(/Maximum quiz attempts reached/i);
        } else {
            expect(submitStatus).toBe(200);
            expect(submitPayload?.passed).toBeTruthy();
            await expect(page.getByText(/Lulus!/i)).toBeVisible();
        }

        await page.goto('/login?redirect=https://evil.example/phishing');
        await expect(page.url()).not.toContain('evil.example');
        await expect(page).toHaveURL(new RegExp(`^${escapeRegExp(baseURL!)}\/dashboard$`));

        await page.goto('/dashboard');
        await expect(page).toHaveURL('/dashboard');

        const certificateSection = page.getByRole('heading', { name: /Sertifikat Saya/i });
        await expect(certificateSection).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('link', { name: /Lihat Verifikasi/i }).first()).toBeVisible();
    });
});
