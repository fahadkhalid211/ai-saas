/**
 * Turns translated blog files into the JSON the site reads, checking each against the English article.
 *
 *   node scripts/i18n/blog-merge.mjs            every file in scripts/i18n/out/blog/tr
 *
 * A translation file holds one or more languages:   === sv   ...article text...   === fi   ...
 * in the same line format as out/blog/src/<slug>.txt (file name = slug). A translation is rejected when its blocks differ in
 * kind or count, a list/table/FAQ changes size, a link address changes, or a {placeholder}/number-bearing link is lost.
 */
import fs from 'node:fs';
import path from 'node:path';

const LANGS = ['sv', 'fi', 'it', 'es'];

import { parse, check } from './blog-format.mjs';

const dir = 'scripts/i18n/out/blog';
const manifestPath = 'lib/i18n/blog-manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let ok = 0, bad = 0;
for (const f of fs.readdirSync(`${dir}/tr`).filter((x) => x.endsWith('.txt')).sort()) {
  const slug = f.replace(/\.txt$/, '');
  const srcFile = `${dir}/src/${slug}.txt`;
  if (!fs.existsSync(srcFile)) { console.log(`${f}: no such article`); bad++; continue; }
  const src = parse(fs.readFileSync(srcFile, 'utf8'));
  const parts = fs.readFileSync(`${dir}/tr/${f}`, 'utf8').split(/^=== (\w+)\s*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const lang = parts[i];
    if (!LANGS.includes(lang)) { console.log(`${f}: unknown language ${lang}`); bad++; continue; }
    let tr;
    try { tr = parse(parts[i + 1]); } catch (e) { console.log(`${f} [${lang}]: ${e.message}`); bad++; continue; }
    const errs = check(src, tr);
    if (errs.length) { console.log(`${f} [${lang}]: ${errs.slice(0, 3).join('; ')}`); bad++; continue; }
    const body = tr.blocks.map((b, k) => (b.type === 'h2' ? { type: 'h2', id: src.blocks[k].id, text: b.text } : b));
    const json = { title: tr.title, seoTitle: tr.seo || tr.title, description: tr.desc, excerpt: tr.excerpt, ...(tr.cluster ? { clusterName: tr.cluster } : {}), sourceModified: src.mod, body };
    fs.mkdirSync(`lib/blog/translations/${lang}`, { recursive: true });
    fs.writeFileSync(`lib/blog/translations/${lang}/${slug}.json`, JSON.stringify(json));
    if (!manifest[lang].includes(slug)) manifest[lang].push(slug);
    ok++;
  }
}
for (const l of LANGS) manifest[l].sort();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
console.log(`${ok} translations written, ${bad} rejected; ` + LANGS.map((l) => `${l}: ${manifest[l].length}`).join(', '));
