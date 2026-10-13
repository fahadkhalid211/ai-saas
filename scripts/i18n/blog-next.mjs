// Prints the next articles to translate (most linked-to first): node scripts/i18n/blog-next.mjs [count]
import fs from 'node:fs';
const d = 'scripts/i18n/out/blog';
const all = fs.readdirSync(`${d}/src`).map((f) => f.replace('.txt', ''));
const counts = {};
for (const f of all) for (const m of fs.readFileSync(`${d}/src/${f}.txt`, 'utf8').matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
const done = new Set(fs.readdirSync(`${d}/tr`).map((f) => f.replace('.txt', '')));
const todo = all.filter((s) => !done.has(s)).sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
const n = Number(process.argv[2] || 2);
console.log(`${done.size} done, ${todo.length} left`);
for (const s of todo.slice(0, n)) console.log(`\n##### ${s}\n` + fs.readFileSync(`${d}/src/${s}.txt`, 'utf8'));
