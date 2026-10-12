/**
 * export const metadata: Metadata = <expr>;   →   export async function generateMetadata(): Promise<Metadata> { return localizeMeta(<expr>); }
 * Idempotent. Usage: node scripts/i18n/codemod-metadata.mjs [--write] <folders>
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const targets = args.filter((a) => !a.startsWith('--'));

function walk(p, out = []) {
  const st = fs.statSync(p);
  if (st.isFile()) { if (/\.tsx?$/.test(p) && !/\.test\./.test(p)) out.push(p); return out; }
  for (const f of fs.readdirSync(p, { withFileTypes: true })) { if (['node_modules', '.next'].includes(f.name)) continue; walk(path.join(p, f.name), out); }
  return out;
}

let n = 0;
for (const file of targets.flatMap((t) => walk(t))) {
  if (!/(page|layout)\.tsx$/.test(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let edit = null;
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    if (!st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    const d = st.declarationList.declarations[0];
    if (!ts.isIdentifier(d.name) || d.name.text !== 'metadata' || !d.initializer) continue;
    edit = { start: st.getStart(), end: st.getEnd(), text: `export async function generateMetadata(): Promise<Metadata> {\n  return localizeMeta(${d.initializer.getText()});\n}` };
  }
  if (!edit) continue;
  if (/\bmetadata\./.test(src.replace(edit.text, ''))) { console.log(`skip ${file}: metadata is read elsewhere in the file`); continue; }
  let out = src.slice(0, edit.start) + edit.text + src.slice(edit.end);
  if (!/localizeMeta/.test(src.slice(0, edit.start))) {
    const firstImport = sf.statements.find((s) => ts.isImportDeclaration(s));
    const at = firstImport ? firstImport.getStart() : 0;
    out = out.slice(0, at) + `import { localizeMeta } from '@/lib/i18n/metadata';\n` + out.slice(at);
  }
  n++;
  console.log(`${WRITE ? 'wrote' : 'would change'} ${file}`);
  if (WRITE) fs.writeFileSync(file, out, 'utf8');
}
console.log(`${n} files`);
