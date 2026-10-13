import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { EMBEDDING_ROUTES } from './embedding-routes';

const ROOT = process.cwd();
const EMBEDDER = path.join(ROOT, 'lib/rag/embedder.ts');
const EXTENSIONS = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

function resolveModule(spec: string, from: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else return null; // a package
  for (const ext of ['', ...EXTENSIONS]) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const importsOf = new Map<string, string[]>();
function directImports(file: string): string[] {
  const cached = importsOf.get(file);
  if (cached) return cached;
  const src = fs.readFileSync(file, 'utf8');
  const specs = new Set<string>();
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) specs.add(m[1]);
  for (const m of src.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)) specs.add(m[1]);
  const resolved = [...specs].map((s) => resolveModule(s, file)).filter((x): x is string => Boolean(x));
  importsOf.set(file, resolved);
  return resolved;
}

function reachesEmbedder(entry: string): boolean {
  const seen = new Set<string>();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    if (file === EMBEDDER) return true;
    stack.push(...directImports(file));
  }
  return false;
}

function routeFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) routeFiles(full, out);
    else if (entry.name === 'route.ts') out.push(full);
  }
  return out;
}

describe('routes that run the embedding model', () => {
  const routes = routeFiles(path.join(ROOT, 'app/api')).map((file) => ({
    file,
    route: '/' + path.relative(path.join(ROOT, 'app'), path.dirname(file)).split(path.sep).join('/'),
  }));
  const users = routes.filter((r) => reachesEmbedder(r.file)).map((r) => r.route);

  it('finds the routes by reading the source', () => {
    expect(routes.length).toBeGreaterThan(50);
    expect(users).toContain('/api/chat');
  });

  it('lists every route that uses the embedder, so it gets the native library', () => {
    const missing = users.filter((r) => !EMBEDDING_ROUTES.includes(r));
    expect(missing, `add these to lib/rag/embedding-routes.ts: ${missing.join(', ')}`).toEqual([]);
  });

  it('lists only routes that exist', () => {
    const known = new Set(routes.map((r) => r.route));
    expect(EMBEDDING_ROUTES.filter((r) => !known.has(r))).toEqual([]);
  });
});
