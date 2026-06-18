import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should render the login page with Google OAuth button', async ({ page }) => {
    await page.goto('/login');
    
    // Check if we start on login
    await expect(page.locator('h2')).toContainText(/Welcome/i);
    
    // Check for Google OAuth button
    await expect(page.locator('button', { hasText: /Google/i })).toBeVisible();
  });
});
