import { Page, Locator } from '@playwright/test';

export class ReferralPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly copyButton: Locator;
  readonly referralLinkInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').first();
    this.copyButton = page.locator('button:has-text("Copy"), button[aria-label*="Copy"]').first();
    this.referralLinkInput = page.locator('input[readonly], input[value*="ref="]').first();
  }

  async goto(locale = 'en') {
    await this.page.goto(`/${locale}/referral/dashboard`, { waitUntil: 'domcontentloaded' });
  }
}
