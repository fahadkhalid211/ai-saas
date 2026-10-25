import { describe, expect, it } from 'vitest';
import { FigureGuard, allowedFigures, numbersIn, unsupportedFigures } from './figure-guard';

const none = allowedFigures([]);

describe('figures the business never gave', () => {
  it('flags prices, percentages and limits, in the forms a model writes them', () => {
    for (const text of [
      'An online shop starts from $2,500.',
      'Pricing is around 3000 USD for an e-commerce site.',
      'That is roughly £1,200 to £1,800.',
      'We charge 50 dollars an hour.',
      'The package supports up to 500 products.',
      'A maximum of 100 products is included.',
      'It usually takes 4-6 weeks to deliver.',
      'You save 20% on the annual plan.',
      'Plans cap at 1,000 items.',
      'Costs start at €99 per month.',
      'About 2k pounds.',
    ]) {
      expect(unsupportedFigures(text, none), text).not.toEqual([]);
    }
  });

  it('does not flag ordinary sentences, times, dates or words', () => {
    for (const text of [
      'We build custom e-commerce websites tailored to your business.',
      'Pricing is agreed per project, so it is best to speak with the team.',
      'You can book a slot at 10:20 AM on Monday.',
      "I'm here 24/7 to help.",
      'Step one: tell me what you sell.',
      'Our office is at 12 Baker Street, London.',
      'Thanks for reaching out in 2026!',
    ]) {
      expect(unsupportedFigures(text, none), text).toEqual([]);
    }
  });

  it('lets through a figure the business supplied, however it is written', () => {
    const allowed = allowedFigures(['Starter website: $2,500. Shops support up to 500 products. Delivery in 4 weeks.']);
    expect(unsupportedFigures('A starter site is $2,500.', allowed)).toEqual([]);
    expect(unsupportedFigures('A starter site is 2500 USD.', allowed)).toEqual([]);
    expect(unsupportedFigures('Shops support up to 500 products.', allowed)).toEqual([]);
    expect(unsupportedFigures('Delivery takes about 4 weeks.', allowed)).toEqual([]);
    // but not a different figure
    expect(unsupportedFigures('A starter site is $3,500.', allowed)).not.toEqual([]);
    expect(unsupportedFigures('Shops support up to 1000 products.', allowed)).not.toEqual([]);
  });

  it('lets the visitor\'s own figures be repeated back', () => {
    const allowed = allowedFigures(['We have around 300 products and a $5,000 budget']);
    expect(unsupportedFigures('With 300 products, a $5,000 budget is something the team can discuss.', allowed)).toEqual([]);
  });

  it('reads 1.2k and 1,200 as the same number', () => {
    expect([...numbersIn('1.2k')]).toContain(1200);
    expect([...numbersIn('1,200')]).toContain(1200);
    expect(unsupportedFigures('That is $1.2k.', allowedFigures(['$1,200']))).toEqual([]);
  });
});

describe('the streaming guard', () => {
  const run = (tokens: string[], allowed = none) => {
    const g = new FigureGuard(allowed);
    let out = '';
    for (const t of tokens) out += g.push(t);
    out += g.flush();
    return { out, g };
  };

  it('passes a reply with no figures through unchanged', () => {
    const text = 'We build online shops. Tell me about your products and I will connect you with the team. [ACTION:BOOKING_FORM]';
    const { out, g } = run(text.split(/(?<= )/));
    expect(out).toBe(text);
    expect(g.dropped).toBe(0);
  });

  it('drops only the sentence with the invented figure, even when it arrives a few characters at a time', () => {
    const text = 'We build e-commerce websites. A shop starts at $2,500 and supports up to 500 products. Every project is different.';
    const { out, g } = run(text.match(/.{1,5}/g)!);
    expect(out).toContain('We build e-commerce websites.');
    expect(out).toContain('Every project is different.');
    expect(out).not.toMatch(/2,500|500 products|\$/);
    expect(g.dropped).toBe(1);
  });

  it('checks a last sentence that has no full stop', () => {
    const { out, g } = run(['Prices start at $99 per month']);
    expect(out).toBe('');
    expect(g.dropped).toBe(1);
  });

  it('drops one bullet without dropping the list', () => {
    const { out } = run(['- Online shop: from $3,000\n', '- Brochure site: tailored to you\n']);
    expect(out).toBe('- Brochure site: tailored to you\n');
  });

  it('keeps a figure that is in the supplied knowledge', () => {
    const { out, g } = run(['A shop is $3,000 to start.'], allowedFigures(['E-commerce site: $3,000']));
    expect(out).toBe('A shop is $3,000 to start.');
    expect(g.dropped).toBe(0);
  });

  it('does not split a decimal or an abbreviation-free price into two sentences', () => {
    const { out } = run(['The fee is 4.5 per cent today.'], allowedFigures(['fee 4.5']));
    expect(out).toBe('The fee is 4.5 per cent today.');
  });
});

describe('a finished reply (WhatsApp, Telegram)', () => {
  it('drops the invented figure, keeps the rest and says so', async () => {
    const { guardReply } = await import('./figure-guard');
    const r = guardReply('We build shops. A shop costs $2,500. Tell us what you sell.', ['A web design agency']);
    expect(r.dropped).toBe(1);
    expect(r.text).toContain('We build shops.');
    expect(r.text).toContain('Tell us what you sell.');
    expect(r.text).not.toMatch(/\$|2,500/);
    expect(r.text).toMatch(/won't guess a number/);
  });

  it('returns a clean reply untouched', async () => {
    const { guardReply } = await import('./figure-guard');
    expect(guardReply('Happy to help with that.', []).text).toBe('Happy to help with that.');
  });
});
