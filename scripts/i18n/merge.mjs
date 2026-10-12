/**
 * Merges translated chunks into the catalogs, checking each one.
 *
 *   node scripts/i18n/merge.mjs            merge every file in scripts/i18n/out/tr
 *
 * A chunk file holds one line per text:  id¦sv¦fi¦it¦es   (or  id¦=  when the text is the same in every language;
 * an "=" in one column keeps the English text for that language). `id` is the position in out/order.json.
 * A translation is rejected (and reported) if it changes the {placeholders}, the **bold** markers or is empty.
 */
import fs from 'node:fs';
import path from 'node:path';

const LANGS = ['sv', 'fi', 'it', 'es'];
const order = JSON.parse(fs.readFileSync('scripts/i18n/out/order.json', 'utf8'));
const dir = 'scripts/i18n/out/tr';
const catalogs = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(fs.readFileSync(`lib/i18n/catalog/${l}.json`, 'utf8'))]));

const signature = (t) => (t.match(/\{\w+\}/g) || []).sort().join(',') + '|' + (t.match(/\*\*/g) || []).length;
let ok = 0;
let bad = 0;
const seen = new Set();

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.txt')).sort()) {
  for (const raw of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim()) continue;
    const parts = line.split('¦');
    const id = Number(parts[0]);
    const en = order[id];
    if (!Number.isInteger(id) || en === undefined) { console.log(`${f}: unknown id in "${line.slice(0, 50)}"`); bad++; continue; }
    seen.add(id);
    const cols = parts.length === 2 && parts[1] === '=' ? ['=', '=', '=', '='] : parts.slice(1);
    if (cols.length !== 4) { console.log(`${f}: ${id} has ${cols.length} columns: ${en.slice(0, 40)}`); bad++; continue; }
    LANGS.forEach((l, i) => {
      const t = cols[i].trim();
      if (t === '=') { delete catalogs[l][en]; return; } // same as English: no entry needed
      if (!t || signature(t) !== signature(en)) { console.log(`${f}: ${id} [${l}] placeholders/markers differ: ${en.slice(0, 50)} => ${t.slice(0, 50)}`); bad++; return; }
      catalogs[l][en] = t;
      ok++;
    });
  }
}
for (const l of LANGS) {
  const sorted = Object.fromEntries(Object.entries(catalogs[l]).sort((a, b) => a[0].localeCompare(b[0])));
  fs.writeFileSync(`lib/i18n/catalog/${l}.json`, JSON.stringify(sorted, null, 1) + '\n');
}
const missing = order.map((_, i) => i).filter((i) => !seen.has(i));
console.log(`${ok} translations merged, ${bad} rejected, ${seen.size}/${order.length} texts covered (${missing.length} left)`);
