import { Page, Locator } from '@playwright/test';

export class MarketingPage {
  readonly page: Page;
  readonly heroHeading: Locator;
  readonly getStartedButton: Locator;
  readonly signInLink: Locator;
  readonly pricingLink: Locator;
  readonly burgerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.locator('#mk-hero-title, h1').first();
    this.getStartedButton = page.locator('a.mk-cta-desktop, a[href*="mode=register"]').first();
    this.signInLink = page.locator('a.mk-login, a[href*="/login"]').first();
    this.pricingLink = page.locator('a[href*="/pricing"]').first();
    this.burgerButton = page.locator('button.mk-burger, button[aria-label="Open menu"]').first();
  }

  async goto(locale = 'en') {
    await this.page.addInitScript(() => {
      try {
        localStorage.setItem('crescelo_cookie_consent', 'granted');
      } catch {}
    });
    await this.page.goto(`/${locale}`, { waitUntil: 'domcontentloaded' });
    const acceptCookies = this.page.locator('button:has-text("Accept"), button:has-text("Reject")').first();
    if (await acceptCookies.isVisible().catch(() => false)) {
      await acceptCookies.click().catch(() => {});
    }
  }

  async clickSignIn() {
    const viewport = this.page.viewportSize();
    const isMobile = viewport ? viewport.width < 1024 : false;

    if (isMobile) {
      await this.burgerButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.burgerButton.click();
      const mobileLogin = this.page.locator('#mk-mobile-menu a[href*="/login"]').first();
      await mobileLogin.waitFor({ state: 'visible', timeout: 5000 });
      await mobileLogin.click();
    } else {
      await this.signInLink.waitFor({ state: 'visible', timeout: 10000 });
      await this.signInLink.click();
    }
  }
}
