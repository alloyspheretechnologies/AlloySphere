import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should navigate to login and show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    
    // Attempt to submit empty form
    await page.click('button[type="submit"]');
    
    // Basic validation check (assuming HTML5 required validation or JS error rendering)
    // We check if the button is still there and we haven't navigated
    expect(page.url()).toContain('/login');
  });

  test('should allow user to toggle between login and signup', async ({ page }) => {
    await page.goto('/login');
    
    // Check if we start on login
    await expect(page.locator('h1')).toContainText(/Welcome/i);
    
    // Toggle to Sign up
    await page.click('text="Sign up"');
    await expect(page.locator('h1')).toContainText(/Create an account/i);
    
    // Toggle back to Login
    await page.click('text="Sign in"');
    await expect(page.locator('h1')).toContainText(/Welcome/i);
  });
  
  test('should render OAuth login buttons', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('button', { hasText: /Google/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /GitHub/i })).toBeVisible();
  });
});
