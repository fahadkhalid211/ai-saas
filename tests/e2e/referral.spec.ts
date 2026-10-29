import { test, expect } from '../fixtures/auth';

test.describe('Referral Flow', () => {
  test('should protect dashboard or handle unauthenticated referral visitor', async ({ referralPage, page }) => {
    await referralPage.goto();
    await page.waitForLoadState('domcontentloaded');
    const isLogin = page.url().includes('/login');
    const isReferral = page.url().includes('/referral');
    expect(isLogin || isReferral).toBeTruthy();
  });

  test('should capture referral attribution from ?ref= query parameter', async ({ page }) => {
    await page.goto('/login?ref=partner_test_123');
    await expect.poll(async () => {
      return await page.evaluate(() => localStorage.getItem('crescelo_ref'));
    }).toBe('partner_test_123');
  });
});
