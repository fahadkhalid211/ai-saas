/** The line format blog articles are exchanged in, and the checks a translation must pass. */
export function parse(txt) {
  const lines = txt.replace(/\r/g, '').split('\n');
  const out = { title: '', seo: '', desc: '', excerpt: '', cluster: '', mod: '', blocks: [] };
  let cur = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    let m;
    if ((m = line.match(/^(TITLE|SEO|DESC|EXCERPT|CLUSTER|MOD): ?(.*)$/))) out[m[1].toLowerCase()] = m[2];
    else if ((m = line.match(/^P: ?(.*)$/))) out.blocks.push({ type: 'p', text: m[1] });
    else if ((m = line.match(/^H2\[([^\]]*)\]: ?(.*)$/))) out.blocks.push({ type: 'h2', id: m[1], text: m[2] });
    else if ((m = line.match(/^H2: ?(.*)$/))) out.blocks.push({ type: 'h2', id: '', text: m[1] });
    else if ((m = line.match(/^H3: ?(.*)$/))) out.blocks.push({ type: 'h3', text: m[1] });
    else if ((m = line.match(/^NOTE: ?(.*)$/))) out.blocks.push({ type: 'note', text: m[1] });
    else if (line === 'UL:' || line === 'OL:') { cur = { type: line === 'UL:' ? 'ul' : 'ol', items: [] }; out.blocks.push(cur); }
    else if (line === 'TABLE:') { cur = { type: 'table', headers: [], rows: [] }; out.blocks.push(cur); }
    else if (line === 'FAQ:') { cur = { type: 'faq', items: [] }; out.blocks.push(cur); }
    else if ((m = line.match(/^- (.*)$/)) && cur && (cur.type === 'ul' || cur.type === 'ol')) cur.items.push(m[1]);
    else if ((m = line.match(/^H: (.*)$/)) && cur?.type === 'table') cur.headers = m[1].split(' | ');
    else if ((m = line.match(/^R: (.*)$/)) && cur?.type === 'table') cur.rows.push(m[1].split(' | '));
    else if ((m = line.match(/^Q: (.*)$/)) && cur?.type === 'faq') cur.items.push({ q: m[1], a: '' });
    else if ((m = line.match(/^A: (.*)$/)) && cur?.type === 'faq') cur.items[cur.items.length - 1].a = m[1];
    else throw new Error(`cannot read line: ${line.slice(0, 60)}`);
  }
  return out;
}

const links = (t) => (t.match(/\]\(([^)]+)\)/g) || []).join('');
const texts = (b) => (b.type === 'ul' || b.type === 'ol' ? b.items : b.type === 'table' ? [...b.headers, ...b.rows.flat()] : b.type === 'faq' ? b.items.flatMap((i) => [i.q, i.a]) : [b.text]);

export function check(src, tr) {
  const err = [];
  if (!tr.title || !tr.desc || !tr.excerpt) err.push('missing title/description/excerpt');
  if (src.blocks.length !== tr.blocks.length) return [`block count ${src.blocks.length} vs ${tr.blocks.length}`];
  src.blocks.forEach((b, i) => {
    const t = tr.blocks[i];
    if (b.type !== t.type) return err.push(`block ${i}: ${b.type} vs ${t.type}`);
    if (b.type === 'ul' || b.type === 'ol') { if (b.items.length !== t.items.length) err.push(`block ${i}: list size`); }
    if (b.type === 'faq' && b.items.length !== t.items.length) err.push(`block ${i}: faq size`);
    if (b.type === 'table' && (b.headers.length !== t.headers.length || b.rows.length !== t.rows.length || b.rows.some((r, k) => r.length !== t.rows[k]?.length))) err.push(`block ${i}: table size`);
    const a = texts(b), c = texts(t);
    if (a.length === c.length) a.forEach((x, k) => { if (links(x) !== links(c[k])) err.push(`block ${i}: links differ (${links(x).slice(0, 60)} vs ${links(c[k]).slice(0, 60)})`); });
  });
  return err;
}

