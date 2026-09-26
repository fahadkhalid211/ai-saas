import type { BlogBlock } from './posts';
import { slugify } from './blocks';

/**
 * A plain-text way to write and edit an article. One blank line between blocks:
 *   ## Heading          ### Sub-heading
 *   Paragraph text (links as [label](/path), **bold**)
 *   - bullet            1. numbered step
 *   > A highlighted note
 *   | Col | Col |       (a table; the second line is | --- | --- |)
 *   Q: A question?      A: Its answer.   (consecutive pairs make the FAQ)
 */
export function toMarkup(body: BlogBlock[]): string {
  const out: string[] = [];
  for (const b of body) {
    switch (b.type) {
      case 'h2': out.push(`## ${b.text}`); break;
      case 'h3': out.push(`### ${b.text}`); break;
      case 'p': out.push(b.text); break;
      case 'note': out.push(`> ${b.text.replace(/\n/g, '\n> ')}`); break;
      case 'ul': out.push(b.items.map((i) => `- ${i}`).join('\n')); break;
      case 'ol': out.push(b.items.map((i, n) => `${n + 1}. ${i}`).join('\n')); break;
      case 'table':
        out.push([`| ${b.headers.join(' | ')} |`, `| ${b.headers.map(() => '---').join(' | ')} |`, ...b.rows.map((r) => `| ${r.join(' | ')} |`)].join('\n'));
        break;
      case 'faq': out.push(b.items.map((i) => `Q: ${i.q}\nA: ${i.a}`).join('\n\n')); break;
    }
  }
  return out.join('\n\n');
}

const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

export function fromMarkup(text: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  const chunks = text.replace(/\r\n/g, '\n').split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const first = lines[0];
    if (/^###\s+/.test(first) && lines.length === 1) blocks.push({ type: 'h3', text: first.replace(/^###\s+/, '') });
    else if (/^##\s+/.test(first) && lines.length === 1) { const t = first.replace(/^##\s+/, ''); blocks.push({ type: 'h2', text: t, id: slugify(t) }); }
    else if (lines.every((l) => /^>\s?/.test(l))) blocks.push({ type: 'note', text: lines.map((l) => l.replace(/^>\s?/, '')).join('\n') });
    else if (lines.every((l) => /^[-*]\s+/.test(l))) blocks.push({ type: 'ul', items: lines.map((l) => l.replace(/^[-*]\s+/, '')) });
    else if (lines.every((l) => /^\d+[.)]\s+/.test(l))) blocks.push({ type: 'ol', items: lines.map((l) => l.replace(/^\d+[.)]\s+/, '')) });
    else if (lines.length >= 2 && lines.every((l) => l.trim().startsWith('|'))) {
      const rows = lines.filter((l) => !/^\|?[\s:|-]+\|?$/.test(l.trim()) || !/-/.test(l));
      const [head, ...rest] = rows;
      blocks.push({ type: 'table', headers: cells(head), rows: rest.map(cells) });
    } else if (/^Q:\s+/.test(first)) {
      const items: { q: string; a: string }[] = [];
      let cur: { q: string; a: string } | null = null;
      for (const l of lines) {
        if (/^Q:\s+/.test(l)) { cur = { q: l.replace(/^Q:\s+/, ''), a: '' }; items.push(cur); }
        else if (/^A:\s*/.test(l) && cur) cur.a = l.replace(/^A:\s*/, '');
        else if (cur) cur.a = `${cur.a} ${l}`.trim();
      }
      const prev = blocks[blocks.length - 1];
      if (prev?.type === 'faq') prev.items.push(...items.filter((i) => i.a));
      else blocks.push({ type: 'faq', items: items.filter((i) => i.a) });
    } else blocks.push({ type: 'p', text: lines.join('\n') });
  }
  return blocks;
}

/** Problems that would publish a broken page. An empty list means the text is fine to save. */
export function validateMarkup(text: string): string[] {
  const problems: string[] = [];
  const body = fromMarkup(text);
  if (body.filter((b) => b.type === 'h2').length < 2) problems.push('Use at least two "## Heading" sections.');
  if (body.length < 4) problems.push('The article is too short to publish.');
  for (const m of text.matchAll(/\]\(([^)\s]*)\)/g)) {
    if (!/^(https:\/\/|\/|#)/.test(m[1])) problems.push(`Link "${m[1].slice(0, 40)}" must start with https:// or /`);
  }
  if (/<\/?(script|iframe|style|object)/i.test(text)) problems.push('HTML tags are not allowed.');
  return problems;
}
