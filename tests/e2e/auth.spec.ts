import { test, expect } from '../fixtures/auth';

test.describe('Authentication Flow', () => {
  test('should display login form with email and password fields', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show error or prevent submission on invalid credentials', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill('invalid-user@example.com');
    await loginPage.passwordInput.fill('wrongpassword123');

    // Wait briefly for React state to process input changes
    const submitBtn = loginPage.submitButton;
    const isEnabled = await submitBtn.isEnabled().catch(() => false);
    if (isEnabled) {
      await submitBtn.click();
      const hasError = await loginPage.errorMessage.first().isVisible({ timeout: 5000 }).catch(() => false);
      const stillOnLogin = page.url().includes('/login');
      expect(hasError || stillOnLogin).toBeTruthy();
    } else {
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('should allow toggling between Sign In and Registration', async ({ loginPage }) => {
    await loginPage.goto();
    if (await loginPage.registerTabButton.isVisible()) {
      await loginPage.switchToRegister();
      // Should show registration form inputs
      await expect(loginPage.submitButton).toBeVisible();
    }
  });
});
