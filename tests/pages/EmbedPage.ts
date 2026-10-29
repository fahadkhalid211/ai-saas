import { Page, Locator } from '@playwright/test';

export class EmbedPage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messagesContainer: Locator;
  readonly errorNotice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatInput = page.locator('input[placeholder*="Ask anything"], input[placeholder*="Ask a question"]');
    this.sendButton = page.locator('button:has(svg.lucide-send), button[title*="Send"]').last();
    this.messagesContainer = page.locator('main');
    this.errorNotice = page.locator('text=/not found|inactive|error|failed/i');
  }

  async goto(assistantId: string, locale = 'en') {
    await this.page.goto(`/${locale}/embed/${assistantId}`, { waitUntil: 'domcontentloaded' });
  }

  async sendMessage(text: string) {
    await this.chatInput.fill(text);
    await this.chatInput.press('Enter');
  }
}
