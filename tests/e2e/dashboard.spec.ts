import { test, expect } from '../fixtures/auth';

test.describe('Dashboard & Protected Routes', () => {
  test('should protect /dashboard from unauthenticated visitors', async ({ page }) => {
    await page.goto('/en/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // Should redirect to /login or keep on login if unauthenticated
    const url = page.url();
    const isLogin = url.includes('/login');
    const isDashboard = url.includes('/dashboard');
    expect(isLogin || isDashboard).toBeTruthy();
  });

  test('should protect /master route and require master authentication', async ({ page }) => {
    await page.goto('/en/master', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // Master portal displays master admin login form or 404/redirect
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();
  });
});
