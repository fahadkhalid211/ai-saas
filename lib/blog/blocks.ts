import type { BlogBlock } from './posts';

export const slugify = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** The plain text of one block. */
export function blockText(b: BlogBlock): string {
  switch (b.type) {
    case 'ul':
    case 'ol':
      return b.items.join(' ');
    case 'table':
      return [...b.headers, ...b.rows.flat()].join(' ');
    case 'faq':
      return b.items.map((i) => `${i.q} ${i.a}`).join(' ');
    default:
      return b.text;
  }
}

export const wordCount = (body: BlogBlock[]) => body.map(blockText).join(' ').split(/\s+/).filter(Boolean).length;

/** Every question and answer pair in a post, for FAQ structured data. */
export const faqItems = (body: BlogBlock[]) => body.flatMap((b) => (b.type === 'faq' ? b.items : []));
