import { test, expect } from '@playwright/test';

test.describe('Startup Workflows', () => {
  test('should require authentication to access dashboard', async ({ page }) => {
    // If we go to dashboard without auth, middleware should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should require authentication to access discover page', async ({ page }) => {
    await page.goto('/discover');
    // Since /discover is protected in middleware.ts, it should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
