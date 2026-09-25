// Static link check: every internal link written in the source must reach a page, a route or a public file.
// Run: node scripts/check-links.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', 'mobile', 'wordpress', 'load-tests'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

// ---- routes from the app directory
const appFiles = walk(path.join(root, 'app'));
const routes = [];
for (const f of appFiles) {
  const rel = path.relative(path.join(root, 'app'), f).replace(/\\/g, '/');
  const m = rel.match(/^(.*?)(?:^|\/)?(page|route)\.(tsx|ts|jsx|js)$/);
  if (!m) {
    const meta = rel.match(/^(.*?)(sitemap|robots|manifest|opengraph-image|twitter-image|icon)\.(tsx|ts|svg|ico)$/);
    if (meta) {
      const map = { sitemap: '/sitemap.xml', robots: '/robots.txt', manifest: '/manifest.webmanifest', 'opengraph-image': '/opengraph-image', 'twitter-image': '/twitter-image', icon: '/icon' };
      routes.push(new RegExp('^' + (meta[1] ? '/' + meta[1].replace(/\/$/, '') : '') + map[meta[2]].replace(/\./g, '\\.') + '$'));
      routes.push(new RegExp('^' + map[meta[2]].replace(/\./g, '\\.') + '$'));
    }
    continue;
  }
  const segs = m[1].split('/').filter(Boolean).filter((s) => !/^\(.*\)$/.test(s));
  const pat = '^/' + segs.map((s) => (/^\[\[?\.\.\./.test(s) ? '.+' : /^\[.*\]$/.test(s) ? '[^/]+' : s.replace(/\./g, '\\.'))).join('/') + '/?$';
  routes.push(new RegExp(pat.replace('^//', '^/')));
}
const publicFiles = new Set(walk(path.join(root, 'public')).map((f) => '/' + path.relative(path.join(root, 'public'), f).replace(/\\/g, '/')));

// redirects declared in next.config.ts count as valid entry points
const cfg = fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8');
const redirectSources = [...cfg.matchAll(/source:\s*'([^']+)'/g)].map((m) => m[1]);
const valid = (p) => {
  const clean = p.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return true;
  if (publicFiles.has(clean)) return true;
  if (routes.some((r) => r.test(clean))) return true;
  if (redirectSources.some((s) => s === clean)) return true;
  return false;
};

// ---- links in source
const srcFiles = [...walk(path.join(root, 'app')), ...walk(path.join(root, 'components')), ...walk(path.join(root, 'lib'))].filter((f) => /\.(tsx|ts)$/.test(f) && !/\.test\./.test(f));
const patterns = [
  /href\s*=\s*"(\/[^"{}$]*)"/g,
  /href\s*=\s*'(\/[^'{}$]*)'/g,
  /href:\s*'(\/[^'{}$]*)'/g,
  /href:\s*"(\/[^"{}$]*)"/g,
  /(?:router\.(?:push|replace)|redirect|permanentRedirect)\(\s*'(\/[^'{}$]*)'/g,
  /window\.location\.href\s*=\s*'(\/[^'{}$]*)'/g,
  /path:\s*'(\/[^'{}$]*)'/g,
];
const broken = [];
let checked = 0;
for (const f of srcFiles) {
  const text = fs.readFileSync(f, 'utf8');
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const link = m[1];
      if (link.startsWith('//') || link.startsWith('/api/') && false) continue;
      checked++;
      if (!valid(link)) broken.push(`${path.relative(root, f)}: ${link}`);
    }
  }
}
const uniq = [...new Set(broken)];
console.log(`checked ${checked} internal links; ${uniq.length} broken`);
uniq.forEach((b) => console.log('  BROKEN ' + b));

// ---- markup problems that are visible in source
const markup = [];
for (const f of srcFiles.filter((x) => x.endsWith('.tsx'))) {
  const text = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f);
  for (const m of text.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)) if (!/rel=/.test(m[0])) markup.push(`${rel}: target=_blank without rel: ${m[0].slice(0, 90)}`);
  for (const m of text.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0]) && !/\{\.\.\./.test(m[0])) markup.push(`${rel}: <img> without alt: ${m[0].slice(0, 90)}`);
  for (const m of text.matchAll(/href=["'](#?)["']/g)) markup.push(`${rel}: empty or "#" href`);
  for (const m of text.matchAll(/href=["']javascript:/g)) markup.push(`${rel}: javascript: href`);
  for (const m of text.matchAll(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*?<a\b/g)) markup.push(`${rel}: <a> nested in <a>`);
  for (const m of text.matchAll(/<button\b[^>]*>(?:(?!<\/button>)[\s\S])*?<button\b/g)) markup.push(`${rel}: <button> nested in <button>`);
  for (const m of text.matchAll(/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?<(div|ul|ol|h[1-6]|table|section)\b/g)) markup.push(`${rel}: <${m[1]}> inside <p>`);
}
const um = [...new Set(markup)];
console.log(`markup findings: ${um.length}`);
um.slice(0, 80).forEach((b) => console.log('  ' + b));
