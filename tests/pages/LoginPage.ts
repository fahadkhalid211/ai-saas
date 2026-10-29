import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerTabButton: Locator;
  readonly signInTabButton: Locator;
  readonly errorMessage: Locator;
  readonly googleSignInButton: Locator;
  readonly appleSignInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#staff-email, #reg-email, input[name="email"], input[type="email"]').first();
    this.passwordInput = page.locator('#staff-password, #reg-password, input[name="password"], input[type="password"]').first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.registerTabButton = page.locator('button:has-text("Create an account"), button:has-text("Sign up"), button:has-text("Register")');
    this.signInTabButton = page.locator('button:has-text("Sign in"), button:has-text("Log in")');
    this.errorMessage = page.locator('[role="alert"], .text-rose-500, .text-red-500');
    this.googleSignInButton = page.locator('button:has-text("Google"), a[href*="google"]');
    this.appleSignInButton = page.locator('button:has-text("Apple"), a[href*="apple"]');
  }

  async goto(locale = 'en') {
    await this.page.goto(`/${locale}/login`, { waitUntil: 'domcontentloaded' });
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }

  async switchToRegister() {
    if (await this.registerTabButton.isVisible()) {
      await this.registerTabButton.click();
    }
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.first().waitFor({ state: 'visible', timeout: 5000 });
    return (await this.errorMessage.first().textContent()) || '';
  }
}
