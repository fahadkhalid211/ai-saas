import { describe, it, expect } from 'vitest';
import { sanitizeWidgetTitle, starterQuestionsFromText, widgetTitleFor, WIDGET_TITLE_MAX } from './title';

describe('chat widget title', () => {
  it("uses the owner's title when set, otherwise the assistant's name", () => {
    expect(widgetTitleFor({ name: "Fahad Khalid's Workspace Assistant", widgetTitle: 'Ask Fahad' })).toBe('Ask Fahad');
    expect(widgetTitleFor({ name: "Fahad Khalid's Workspace Assistant" })).toBe("Fahad Khalid's Workspace Assistant");
    expect(widgetTitleFor({ name: 'Front desk', widgetTitle: '   ' })).toBe('Front desk');
    expect(widgetTitleFor({})).toBe('AI Assistant');
  });

  it('keeps the title to one short line', () => {
    expect(sanitizeWidgetTitle('  Bright\nDental   Help ')).toBe('Bright Dental Help');
    expect(sanitizeWidgetTitle('x'.repeat(100))).toHaveLength(WIDGET_TITLE_MAX);
    expect(sanitizeWidgetTitle(42)).toBe('');
  });
});

describe('starter questions box', () => {
  it('reads one question per line and ignores blank lines', () => {
    expect(starterQuestionsFromText('What are your prices?\n\n  Where are you?  \r\nDo you take walk-ins?\n')).toEqual([
      'What are your prices?',
      'Where are you?',
      'Do you take walk-ins?',
    ]);
    expect(starterQuestionsFromText('')).toEqual([]);
  });
});
