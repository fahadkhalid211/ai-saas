// Files nothing imports (entry points such as pages, routes and layouts are skipped). Run: node scripts/find-orphans.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const skip = new Set(['node_modules', '.next', '.git', 'mobile', 'wordpress', 'load-tests', 'public', 'supabase', 'ops']);
const walk = (d, o = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (skip.has(e.name)) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, o) : o.push(p); } return o; };
const files = walk(root).filter((f) => /\.(ts|tsx|mjs|js|css)$/.test(f));
const src = files.filter((f) => /\.(ts|tsx)$/.test(f));
const texts = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));
const entry = /(^|[\/])(page|route|layout|loading|error|global-error|not-found|template|default|sitemap|robots|manifest|opengraph-image|twitter-image|icon|proxy|instrumentation|next\.config|vitest\.config|eslint\.config|next-env\.d)\./;
const all = [...texts.values()].join('\n');
const orphans = [];
for (const f of src) {
  const rel = path.relative(root, f).replace(/\/g, '/');
  if (entry.test(rel) || /\.test\./.test(rel) || rel.startsWith('scripts/') || rel.startsWith('eval/') || rel.endsWith('.d.ts')) continue;
  const noExt = rel.replace(/\.(ts|tsx)$/, '').replace(/\/index$/, '');
  const base = path.basename(noExt);
  const re = new RegExp(`['"\`](?:@/|\.{1,2}/|[./]*)[^'"\`]*${base.replace(/[.*+?^${}()|[\]\]/g, '\$&')}['"\`]`);
  const used = [...texts].some(([g, t]) => g !== f && re.test(t) && (t.includes(noExt) || re.test(t)));
  if (!used) orphans.push(rel);
}
console.log(`${orphans.length} files that no other file imports:`);
orphans.forEach((o) => console.log('  ' + o));
