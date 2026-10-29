import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { MarketingPage } from '../pages/MarketingPage';
import { ReferralPage } from '../pages/ReferralPage';
import { EmbedPage } from '../pages/EmbedPage';

type CustomFixtures = {
  loginPage: LoginPage;
  marketingPage: MarketingPage;
  referralPage: ReferralPage;
  embedPage: EmbedPage;
};

export const test = base.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  marketingPage: async ({ page }, use) => {
    await use(new MarketingPage(page));
  },
  referralPage: async ({ page }, use) => {
    await use(new ReferralPage(page));
  },
  embedPage: async ({ page }, use) => {
    await use(new EmbedPage(page));
  },
});

export { expect } from '@playwright/test';
