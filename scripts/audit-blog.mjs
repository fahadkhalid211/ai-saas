// SEO audit of every blog post. Run: node scripts/audit-blog.mjs [--json]
import fs from 'node:fs';
import path from 'node:path';

const posts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib/blog/data/all-posts.json'), 'utf8'));
const slugs = new Set(posts.map((p) => p.slug));
const routes = new Set(['/', '/product', '/pricing', '/use-case', '/integrations', '/roadmap', '/support', '/support/contact', '/privacy', '/terms', '/cookies', '/dpa', '/subprocessors', '/acceptable-use', '/blog', '/login', '/guides/add-ai-assistant-to-wordpress']);
const issues = {};
const add = (k, s) => ((issues[k] ||= []).push(s));
const words = (t) => (t.match(/\b[\w'-]+\b/g) || []).length;
const textOf = (b) => (b.text ? b.text : b.items ? b.items.join(' ') : b.rows ? [...b.headers, ...b.rows.flat()].join(' ') : '');

const titleSeen = new Map();
const descSeen = new Map();
const wordCounts = [];
for (const p of posts) {
  const body = p.body || [];
  const full = body.map(textOf).join(' ');
  const wc = words(full);
  wordCounts.push(wc);
  if (p.title.length > 65) add('title > 65 chars (truncated in Google)', `${p.slug} (${p.title.length})`);
  if (p.title.length < 30) add('title < 30 chars', `${p.slug} (${p.title.length})`);
  if (p.description.length > 160) add('description > 160 chars', `${p.slug} (${p.description.length})`);
  if (p.description.length < 110) add('description < 110 chars', `${p.slug} (${p.description.length})`);
  if (p.excerpt && p.excerpt.endsWith('...')) add('excerpt is a truncated description', p.slug);
  if (!p.description.toLowerCase().includes((p.primaryKeyword || '').toLowerCase().split(' ')[0])) add('description lacks primary keyword', p.slug);
  if (p.primaryKeyword && !p.title.toLowerCase().includes(p.primaryKeyword.toLowerCase().split(' ').slice(0, 2).join(' '))) add('title lacks primary keyword (first 2 words)', p.slug);
  if (titleSeen.has(p.title)) add('duplicate title', `${p.slug} = ${titleSeen.get(p.title)}`);
  titleSeen.set(p.title, p.slug);
  if (descSeen.has(p.description)) add('duplicate description', `${p.slug} = ${descSeen.get(p.description)}`);
  descSeen.set(p.description, p.slug);
  if (wc < 600) add('thin content (< 600 words)', `${p.slug} (${wc})`);
  const h2 = body.filter((b) => b.type === 'h2');
  if (h2.length < 3) add('fewer than 3 H2 headings', `${p.slug} (${h2.length})`);
  const ids = h2.map((b) => b.id);
  if (new Set(ids).size !== ids.length) add('duplicate H2 ids (broken anchors)', p.slug);
  if (body[0] && body[0].type !== 'p') add('does not open with a paragraph', p.slug);
  const links = [...JSON.stringify(body).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  const internal = links.filter((l) => l.startsWith('/'));
  if (internal.length < 2) add('fewer than 2 internal links in the body', `${p.slug} (${internal.length})`);
  if (!links.some((l) => l.startsWith('/pricing') || l.startsWith('/login') || l.startsWith('/product'))) add('no link to a product/pricing/signup page', p.slug);
  for (const l of internal) {
    const u = l.split('#')[0].split('?')[0];
    if (u.startsWith('/blog/')) {
      if (!slugs.has(u.slice(6))) add('broken internal blog link', `${p.slug} -> ${l}`);
    } else if (!routes.has(u) && !u.startsWith('/support/')) add('broken internal link', `${p.slug} -> ${l}`);
  }
  if (!links.some((l) => l.startsWith('http'))) add('no external authority link', p.slug);
  for (const r of p.related || []) if (!slugs.has(r)) add('related slug does not exist', `${p.slug} -> ${r}`);
  if ((p.related || []).length < 3) add('fewer than 3 related posts', p.slug);
  if (!full.toLowerCase().includes((p.primaryKeyword || '~').toLowerCase())) add('primary keyword never appears in body', `${p.slug} ("${p.primaryKeyword}")`);
  const first100 = words(full) ? full.split(/\s+/).slice(0, 100).join(' ').toLowerCase() : '';
  if (p.primaryKeyword && !first100.includes(p.primaryKeyword.toLowerCase())) add('primary keyword not in first 100 words', p.slug);
  if (!body.some((b) => b.type === 'ul' || b.type === 'ol' || b.type === 'table')) add('no list or table (poor scannability)', p.slug);
  if (!/(faq|frequently asked|questions)/i.test(JSON.stringify(h2.map((b) => b.text)))) add('no FAQ-style section', p.slug);
  if (!p.tags || p.tags.length < 2) add('fewer than 2 tags', p.slug);
  if (p.dateModified < p.datePublished) add('dateModified before datePublished', p.slug);
  if (/\b(lorem|TODO|placeholder|XXXX)\b/i.test(full)) add('placeholder text in body', p.slug);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug) || p.slug.length > 70) add('slug not clean / too long', p.slug);
  const dupParas = new Set();
  for (const b of body) if (b.type === 'p') { if (dupParas.has(b.text)) add('repeated paragraph within the post', p.slug); dupParas.add(b.text); }
}
// near-duplicate bodies across posts (shared paragraphs)
const paraOwner = new Map();
let sharedParas = 0;
for (const p of posts) for (const b of p.body) if (b.type === 'p' && b.text.length > 120) { if (paraOwner.has(b.text) && paraOwner.get(b.text) !== p.slug) sharedParas++; else paraOwner.set(b.text, p.slug); }

const rows = Object.entries(issues).sort((a, b) => b[1].length - a[1].length);
console.log(`${posts.length} posts; words per post min ${Math.min(...wordCounts)} / median ${wordCounts.sort((a, b) => a - b)[100]} / max ${Math.max(...wordCounts)}`);
console.log(`paragraphs (120+ chars) copied verbatim between different posts: ${sharedParas}`);
for (const [k, v] of rows) console.log(`\n${v.length}x ${k}\n  ${v.slice(0, 4).join('\n  ')}${v.length > 4 ? '\n  ...' : ''}`);
if (process.argv.includes('--json')) fs.writeFileSync('/tmp/blog-audit.json', JSON.stringify(issues, null, 1));
