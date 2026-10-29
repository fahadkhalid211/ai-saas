import { test, expect } from '../fixtures/auth';

test.describe('Embed Chat Widget Flow', () => {
  test('should load embed route and render layout or status notice', async ({ embedPage, page }) => {
    await embedPage.goto('nonexistent-assistant-test');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).not.toBeEmpty();
    const text = await page.textContent('body');
    expect(text?.length).toBeGreaterThan(0);
  });
});
