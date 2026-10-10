/**
 * The name shown at the top of the chat widget. By default it is the assistant's own name (often long, such as
 * "Sam's Workspace Assistant"); the owner can set a shorter title for visitors in Chat Widget settings.
 */

export const WIDGET_TITLE_MAX = 40;

/** Cleans what the owner typed: one line, trimmed, at most WIDGET_TITLE_MAX characters. Empty means "use the assistant's name". */
export function sanitizeWidgetTitle(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, WIDGET_TITLE_MAX).trim();
}

export function widgetTitleFor(assistant: { name?: string | null; widgetTitle?: string | null }): string {
  return sanitizeWidgetTitle(assistant.widgetTitle) || (assistant.name || '').trim() || 'AI Assistant';
}

/** Starter questions from the settings box: one per line, blank lines dropped, at most 8 questions of 120 characters. */
export function starterQuestionsFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((q) => q.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 8);
}
