/**
 * Keeps the assistant from quoting figures the business never gave it.
 *
 * A model asked "how much for an online shop?" will happily say "from $2,500, up to 500 products" out of general knowledge, and a
 * visitor takes that as the business's own price. The prompt forbids it, but a prompt is a request, not a guarantee, so the reply is
 * also checked here: every price, percentage, and quantity or duration ("500 products", "3 weeks") in it must appear in what the
 * business supplied (knowledge base, catalog, instructions) or in the visitor's own words. A sentence with a figure that does not is
 * dropped before the visitor sees it.
 */

const CURRENCY = String.raw`(?:[$£€¥₹]|US\$|USD|GBP|EUR|AUD|CAD|PKR|AED|INR|SEK|NOK|DKK|CHF|Rs\.?)`;
const AMOUNT = String.raw`\d[\d,]*(?:\.\d+)?\s?(?:k|m|million|thousand)?`;
const UNIT =
  String.raw`(?:products?|items?|skus?|listings?|pages?|users?|seats?|members?|accounts?|languages?|integrations?|channels?|categories|variants?|orders?|visitors?|` +
  String.raw`employees|staff|stores?|websites?|sites?|projects?|revisions?|credits?|requests?|messages?|conversations?|hours?|days?|weeks?|months?|years?|minutes?)`;

/** A price ("$2,500", "2500 USD", "50 dollars"), a percentage, or a number with a unit ("up to 500 products", "2-4 weeks"). */
const FIGURE = new RegExp(
  [
    String.raw`${CURRENCY}\s?${AMOUNT}`,
    String.raw`${AMOUNT}\s?(?:${CURRENCY}|dollars?|euros?|pounds?|rupees?|bucks)\b`,
    String.raw`\d[\d,]*(?:\.\d+)?\s?%`,
    String.raw`\d[\d,]*(?:\.\d+)?(?:\s?(?:-|–|—|to)\s?\d[\d,]*(?:\.\d+)?)?\+?\s?${UNIT}\b`,
  ].join('|'),
  'gi'
);

const NUMBER = /\d[\d,]*(?:\.\d+)?\s?(?:k\b|m\b|million\b|thousand\b)?/gi;

/** The numeric values written in a text, as they would be compared ("1,200" = 1200, "1.2k" = 1200). */
export function numbersIn(text: string): Set<number> {
  const out = new Set<number>();
  for (const m of (text || '').matchAll(NUMBER)) {
    const raw = m[0].toLowerCase().trim();
    const base = parseFloat(raw.replace(/,/g, ''));
    if (!Number.isFinite(base)) continue;
    // "1.2k" means 1200 (not 1.2), so it matches a knowledge base that says "1,200"
    if (/k$|thousand$/.test(raw)) out.add(base * 1_000);
    else if (/m$|million$/.test(raw)) out.add(base * 1_000_000);
    else out.add(base);
  }
  return out;
}

/** Everything the business supplied, plus the visitor's own words: the figures a reply is allowed to repeat. */
export function allowedFigures(sources: Array<string | undefined | null>): Set<number> {
  const out = new Set<number>();
  for (const s of sources) for (const n of numbersIn(s || '')) out.add(n);
  return out;
}

/** The figures in a piece of text that are not in the allowed set. */
export function unsupportedFigures(text: string, allowed: Set<number>): string[] {
  const bad: string[] = [];
  for (const m of (text || '').matchAll(FIGURE)) {
    const nums = numbersIn(m[0]);
    if (nums.size === 0) continue;
    if ([...nums].some((n) => !allowed.has(n))) bad.push(m[0].trim());
  }
  return bad;
}

/** What the visitor is told after a figure was removed (and the next step is offered by the caller). */
export const FIGURE_REMOVED_NOTE = "I don't have confirmed prices or figures for that, so I won't guess a number.";

/** Checks a finished reply (for channels that send one message, such as WhatsApp and Telegram). */
export function guardReply(reply: string, sources: Array<string | undefined | null>): { text: string; dropped: number } {
  const guard = new FigureGuard(allowedFigures(sources));
  let text = guard.push(reply) + guard.flush();
  if (guard.dropped > 0) text = text.trim() ? `${text.trimEnd()}\n\n${FIGURE_REMOVED_NOTE}` : FIGURE_REMOVED_NOTE;
  return { text, dropped: guard.dropped };
}

/**
 * Filters a streamed reply one sentence at a time. Text is held until a sentence (or line) is complete, checked, and either passed
 * on or dropped, so the visitor still sees the answer building up but never sees an unsupported figure, not even briefly.
 */
export class FigureGuard {
  dropped = 0;
  private pending = '';
  private kept = '';

  constructor(private readonly allowed: Set<number>) {}

  /** What has been passed on so far. */
  get passed(): string {
    return this.kept;
  }

  push(token: string): string {
    this.pending += token;
    let out = '';
    for (;;) {
      const boundary = /[.!?]["')\]*_]*\s|\n/.exec(this.pending);
      if (!boundary) break;
      const end = boundary.index + boundary[0].length;
      out += this.check(this.pending.slice(0, end));
      this.pending = this.pending.slice(end);
    }
    this.kept += out;
    return out;
  }

  /** Call when the reply is finished: checks whatever is left. */
  flush(): string {
    const out = this.pending ? this.check(this.pending) : '';
    this.pending = '';
    this.kept += out;
    return out;
  }

  private check(unit: string): string {
    if (unsupportedFigures(unit, this.allowed).length === 0) return unit;
    this.dropped += 1;
    return '';
  }
}
