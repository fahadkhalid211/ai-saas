/**
 * Lists visible English text left on a page in another language.
 *   node scripts/i18n/audit-html.mjs http://localhost:3101 sv /  /pricing
 */
import fs from 'node:fs';
const [base, locale, ...paths] = process.argv.slice(2);
const cat = JSON.parse(fs.readFileSync(`lib/i18n/catalog/${locale}.json`, 'utf8'));
const vals = new Set(Object.values(cat).map((v) => v.replace(/\s+/g, ' ').trim()));
const keys = new Set(Object.keys(cat));
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
for (const p of paths) {
  const url = `${base}${p === '/' ? (locale === 'en' ? '' : '/' + locale) : (locale === 'en' ? '' : '/' + locale) + p}`;
  const html = await (await fetch(url, { headers: { accept: 'text/html' } })).text();
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const texts = [...body.matchAll(/>([^<>]+)</g)].map((m) => dec(m[1]).replace(/\s+/g, ' ').trim()).filter((t) => /[A-Za-z]{3,}/.test(t));
  const miss = [...new Set(texts)].filter((t) => !vals.has(t) && /\b(the|and|your|you|for|with|to|of|a|is|in)\b/i.test(t) || keys.has(t) && !vals.has(t));
  console.log(`\n== ${url}: ${texts.length} text nodes, ${miss.length} look English`);
  for (const t of miss.slice(0, 80)) console.log('  ' + t.slice(0, 110));
}
