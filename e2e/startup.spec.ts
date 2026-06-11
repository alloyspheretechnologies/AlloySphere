import { test, expect } from '@playwright/test';

test.describe('Startup Workflows', () => {
  test('should require authentication to access dashboard', async ({ page }) => {
    // If we go to dashboard without auth, middleware should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should have a discover page visible to public or auth', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.locator('h1')).toContainText(/Discover Startups/i);
    // Should render search input
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });
});
