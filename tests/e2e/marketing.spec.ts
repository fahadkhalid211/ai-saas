import { test, expect } from '../fixtures/auth';

test.describe('Marketing & Landing Page', () => {
  test('should load landing page and display hero elements', async ({ marketingPage, page }) => {
    await marketingPage.goto();
    await expect(page).toHaveTitle(/Crescelo|AI|Growth/i);
    await expect(marketingPage.heroHeading).toBeAttached();
  });

  test('should navigate to sign-in from marketing page', async ({ marketingPage, page }) => {
    await marketingPage.goto();
    await Promise.all([
      page.waitForURL(/.*\/login/),
      marketingPage.clickSignIn(),
    ]);
    await expect(page).toHaveURL(/.*\/login/);
  });
});
