/**
 * Makes the text in React components translatable without changing how anything looks.
 *
 *   node scripts/i18n/codemod.mjs --mode=marketing|app [--write] [--extract=out.json] <files or folders>
 *
 *   - text written between tags      <p>Hello</p>                →  <p><T>Hello</T></p>
 *   - words held in a variable       <h2>{title}</h2>            →  <h2><T>{title}</T></h2>        (marketing mode)
 *   - attributes people read         placeholder="Name"          →  placeholder={__t("Name")}      (client components)
 *   - links                          next/link, <a href="/x">    →  language-aware versions (marketing mode)
 *
 * <T> shows the text in the page's language and leaves anything that is not text alone, so wrapping never alters the layout.
 * The script is idempotent: running it again changes nothing. Without --write it only reports what it would do.
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const MODE = flag('mode') || 'marketing';
const WRITE = args.includes('--write');
const EXTRACT = flag('extract');
const targets = args.filter((a) => !a.startsWith('--'));

const SKIP_TEXT_PARENTS = new Set(['option', 'textarea', 'title', 'style', 'script', 'noscript', 'code', 'pre', 'kbd', 'samp', 'var']);
const ATTRS = new Set(['placeholder', 'title', 'aria-label', 'alt', 'aria-description', 'aria-placeholder']);
const SKIP_IDENTIFIERS = new Set(['children', 'icon', 'Icon', 'key', 'index', 'className', 'style']);
// In the signed-in screens, only variables named like interface text are wrapped; anything else may be a customer's or visitor's own words.
const APP_TEXT_NAMES = /^(label|title|heading|subtitle|description|desc|text|message|caption|hint|helper|tagline|summary|placeholder|tab|cta|actionText|emptyText|idleLabel|savingLabel|savedLabel|statusText|buttonLabel|error|saveError|successMessage|notice|note|tooltip)$/;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rarr: '→', larr: '←', copy: '©', reg: '®', trade: '™', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', middot: '·', bull: '•', times: '×', check: '✓', laquo: '«', raquo: '»', euro: '€', pound: '£', deg: '°', ensp: ' ', emsp: ' ', thinsp: ' ', zwnj: '‌' };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? m;
  });
}
export const normalize = (t) => t.replace(/\s+/g, ' ').trim();
const hasLetters = (t) => /[A-Za-zÀ-ÖØ-öø-ÿ]{2,}/.test(t);

function walkFiles(p, out = []) {
  const st = fs.statSync(p);
  if (st.isFile()) {
    if (/\.tsx$/.test(p) && !/\.test\./.test(p)) out.push(p);
    return out;
  }
  for (const f of fs.readdirSync(p, { withFileTypes: true })) {
    if (['node_modules', '.next', 'rewritten', 'data'].includes(f.name)) continue;
    walkFiles(path.join(p, f.name), out);
  }
  return out;
}

const tagName = (el) => (el.tagName ? el.tagName.getText() : '');
const isHostTag = (n) => /^[a-z]/.test(n);

function enclosingParentTag(node) {
  let p = node.parent;
  while (p && !(ts.isJsxElement(p) || ts.isJsxFragment(p))) p = p.parent;
  if (!p) return { tag: '', el: null };
  return { tag: ts.isJsxElement(p) ? tagName(p.openingElement) : '', el: p };
}

function insideSkippedAncestor(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isJsxElement(p) && SKIP_TEXT_PARENTS.has(tagName(p.openingElement))) return true;
    if (ts.isJsxSelfClosingElement(p) && SKIP_TEXT_PARENTS.has(tagName(p))) return true;
  }
  return false;
}

function isComponentFunction(fn) {
  let name = '';
  if ((ts.isFunctionDeclaration(fn) || ts.isFunctionExpression(fn)) && fn.name) name = fn.name.text;
  const p = fn.parent;
  if (!name && p && ts.isVariableDeclaration(p) && ts.isIdentifier(p.name)) name = p.name.text;
  if (!name && p && ts.isCallExpression(p)) {
    // memo(...) / forwardRef(...) assigned to a variable
    const vd = p.parent;
    if (vd && ts.isVariableDeclaration(vd) && ts.isIdentifier(vd.name)) name = vd.name.text;
  }
  if (!name && p && ts.isExportAssignment(p)) name = 'Default';
  return /^[A-Z]/.test(name);
}

function nearestComponent(node) {
  for (let p = node.parent; p; p = p.parent) {
    if ((ts.isFunctionDeclaration(p) || ts.isFunctionExpression(p) || ts.isArrowFunction(p)) && isComponentFunction(p)) return p;
  }
  return null;
}

const unwrapParens = (e) => {
  while (e && (ts.isParenthesizedExpression(e) || ts.isNonNullExpression(e))) e = e.expression;
  return e;
};

/**
 * The parts of an expression that are interface text, found one by one: in `cond ? 'Saved' : item.title` only 'Saved' is
 * wrapped, because the other branch may be somebody's own words (a customer's file name, a visitor's message).
 */
function leafTargets(expr, isLeftOperand = false) {
  expr = unwrapParens(expr);
  if (!expr) return [];
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return hasLetters(expr.text) ? [{ node: expr, kind: 'whole' }] : [];
  if (ts.isTemplateExpression(expr)) {
    const text = [expr.head.text, ...expr.templateSpans.map((sp) => sp.literal.text)].join('');
    return hasLetters(text) ? [{ node: expr, kind: 'template' }] : [];
  }
  if (ts.isConditionalExpression(expr)) return [...leafTargets(expr.whenTrue), ...leafTargets(expr.whenFalse)];
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) return [...leafTargets(expr.left, true), ...leafTargets(expr.right)];
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) return leafTargets(expr.right);
    return [];
  }
  // a value on the left of || or ?? decides whether the right side is used: an element would always be "present"
  if (ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr) || ts.isElementAccessExpression(expr)) return !isLeftOperand && wrappableExpression(expr) ? [{ node: expr, kind: 'whole' }] : [];
  return [];
}

/** Placeholder names for the values inside a template literal: `${p.name}` becomes {name}, anything else {n1}, {n2}. */
function placeholderNames(spans) {
  const used = new Set();
  return spans.map((sp, i) => {
    let e = unwrapParens(sp.expression);
    let base = ts.isIdentifier(e) ? e.text : ts.isPropertyAccessExpression(e) ? e.name.text : `n${i + 1}`;
    base = base.replace(/\W/g, '') || `n${i + 1}`;
    let name = base, k = 2;
    while (used.has(name)) name = `${base}${k++}`;
    used.add(name);
    return name;
  });
}

function wrappableExpression(expr, ctx) {
  if (!expr) return false;
  // parentheses and non-null assertions do not change what a value is
  while (ts.isParenthesizedExpression(expr) || ts.isNonNullExpression(expr)) expr = expr.expression;
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return hasLetters(expr.text);
  if (ts.isIdentifier(expr)) {
    if (SKIP_IDENTIFIERS.has(expr.text)) return false;
    if (expr.text === 'dict') return false;
    return MODE === 'marketing' ? true : APP_TEXT_NAMES.test(expr.text);
  }
  if (ts.isPropertyAccessExpression(expr)) {
    const last = expr.name.text;
    if (SKIP_IDENTIFIERS.has(last)) return false;
    const root = expr.getText().split(/[.?]/)[0];
    if (root === 'dict') return false;
    return MODE === 'marketing' ? true : APP_TEXT_NAMES.test(last);
  }
  if (ts.isElementAccessExpression(expr)) return MODE === 'marketing';
  if (ts.isConditionalExpression(expr)) return wrappableExpression(expr.whenTrue, ctx) || wrappableExpression(expr.whenFalse, ctx);
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) return wrappableExpression(expr.left, ctx) || wrappableExpression(expr.right, ctx);
  }
  return false;
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  // JSX inside ImageResponse is drawn to a picture, outside React: hooks and components do not work there.
  if (/ImageResponse/.test(src)) return { out: src, changed: false, extracted: [], log: [], count: 0 };
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const first = sf.statements[0];
  const isClient = !!first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) && first.expression.text === 'use client';
  const edits = [];
  const extracted = [];
  const log = [];
  let usesT = false;
  let usesUseT = false;
  let usesLink = false;
  let usesA = false;
  const hookInserts = new Map(); // component fn -> true

  const alreadyWrapped = (node) => {
    const p = node.parent;
    return p && ts.isJsxElement(p) && tagName(p.openingElement) === 'T';
  };

  function wrapLeaves(targets, comp) {
    for (const t of targets) {
      const n = t.node;
      if (t.kind === 'template') {
        if (!comp || !ts.isBlock(comp.body)) {
          log.push(`template left in English (no block-bodied component around it): ${n.getText().slice(0, 60)}`);
          continue;
        }
        const names = placeholderNames(n.templateSpans);
        let text = n.head.text;
        n.templateSpans.forEach((sp, i) => (text += `{${names[i]}}` + sp.literal.text));
        // `n === 1 ? 'day' : 'days'` inside a sentence is a word of its own: translated separately, not left in English
        const valueOf = (ex) => {
          const u = unwrapParens(ex);
          const lit = (x) => { x = unwrapParens(x); return x && (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x)) && hasLetters(x.text) ? x : null; };
          if (ts.isConditionalExpression(u) && lit(u.whenTrue) && lit(u.whenFalse)) {
            extracted.push({ key: normalize(lit(u.whenTrue).text), kind: 'literal' }, { key: normalize(lit(u.whenFalse).text), kind: 'literal' });
            return `${u.condition.getText()} ? __t(${JSON.stringify(lit(u.whenTrue).text)}) : __t(${JSON.stringify(lit(u.whenFalse).text)})`;
          }
          return ex.getText();
        };
        const values = n.templateSpans.map((sp, i) => `${names[i]}: ${valueOf(sp.expression)}`).join(', ');
        edits.push({ start: n.getStart(), end: n.getEnd(), text: `__t(${JSON.stringify(text)}, { ${values} })` });
        hookInserts.set(comp, true);
        usesUseT = true;
        extracted.push({ key: normalize(text), kind: 'template' });
      } else {
        edits.push({ start: n.getStart(), end: n.getStart(), text: '<T>{', order: 0 });
        edits.push({ start: n.getEnd(), end: n.getEnd(), text: '}</T>', order: 1 });
        usesT = true;
        if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) extracted.push({ key: normalize(n.text), kind: 'literal' });
      }
    }
  }

  function visit(node) {
    // ---- text between tags ----
    if (ts.isJsxText(node) && hasLetters(node.text)) {
      const { tag } = enclosingParentTag(node);
      const parentEl = node.parent;
      if (!alreadyWrapped(node) && !SKIP_TEXT_PARENTS.has(tag) && !insideSkippedAncestor(node) && !(ts.isJsxElement(parentEl) && tagName(parentEl.openingElement) === 'T')) {
        const raw = node.text;
        const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const core = m[2];
        if (core && hasLetters(decodeEntities(core))) {
          // node.pos, not getStart(): for JSX text the leading spaces are part of the text, not trivia to skip
          const start = node.pos + m[1].length;
          edits.push({ start, end: start + core.length, text: `<T>${core}</T>` });
          usesT = true;
          extracted.push({ key: normalize(decodeEntities(core)), kind: 'text' });
        }
      }
    }
    // ---- <option>Label</option>: plain strings only (React cannot read the value of an element child) ----
    if (ts.isJsxText(node) && hasLetters(node.text) && ts.isJsxElement(node.parent) && tagName(node.parent.openingElement) === 'option') {
      const m = node.text.match(/^(\s*)([\s\S]*?)(\s*)$/);
      const core = m[2];
      const comp = nearestComponent(node);
      if (core && hasLetters(decodeEntities(core))) {
        if (isClient && comp && ts.isBlock(comp.body)) {
          const start = node.pos + m[1].length;
          edits.push({ start, end: start + core.length, text: `{__t(${JSON.stringify(decodeEntities(core))})}` });
          hookInserts.set(comp, true);
          usesUseT = true;
          extracted.push({ key: normalize(decodeEntities(core)), kind: 'option' });
        } else {
          log.push(`option left in English: ${core.slice(0, 50)}`);
        }
      }
    }
    // ---- {expressions} between tags ----
    if (ts.isJsxExpression(node) && node.expression && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      const { tag } = enclosingParentTag(node);
      const e = node.expression;
      const complex = !(ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e) || ts.isIdentifier(e) || ts.isPropertyAccessExpression(e));
      const parent = node.parent;
      const inT = ts.isJsxElement(parent) && tagName(parent.openingElement) === 'T';
      // an earlier run wrapped a whole conditional in <T>: unwrap it, so only the text parts get translated
      const migrate = MODE === 'app' && inT && complex && parent.children.length === 1 && !insideSkippedAncestor(node);
      if (migrate) {
        edits.push({ start: parent.openingElement.getStart(), end: parent.openingElement.getEnd(), text: '' });
        edits.push({ start: parent.closingElement.getStart(), end: parent.closingElement.getEnd(), text: '' });
      }
      const eligible = migrate || (!alreadyWrapped(node) && !SKIP_TEXT_PARENTS.has(tag) && !insideSkippedAncestor(node));
      if (eligible) {
        const targets = leafTargets(e);
        const comp = nearestComponent(node);
        const direct = targets.length === 1 && unwrapParens(e) === targets[0].node && targets[0].kind === 'whole';
        if (MODE === 'marketing' || direct) {
          // marketing pages and plain values: the old, whole-expression wrap
          if (!inT && wrappableExpression(e) && !((ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) && !hasLetters(e.text))) {
            edits.push({ start: node.getStart(), end: node.getStart(), text: '<T>', order: 0 });
            edits.push({ start: node.getEnd(), end: node.getEnd(), text: '</T>', order: 1 });
            usesT = true;
            if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) extracted.push({ key: normalize(e.text), kind: 'literal' });
          } else if (migrate) {
            wrapLeaves(targets, comp);
          }
        } else {
          wrapLeaves(targets, comp);
        }
      }
    }
    // ---- attributes ----
    if (isClient && ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && ATTRS.has(node.name.getText())) {
      const el = node.parent.parent; // JsxAttributes -> element
      const nm = el && el.tagName ? el.tagName.getText() : '';
      if (isHostTag(nm) && hasLetters(node.initializer.text)) {
        const comp = nearestComponent(node);
        if (comp && ts.isBlock(comp.body)) {
          edits.push({ start: node.initializer.getStart(), end: node.initializer.getEnd(), text: `{__t(${JSON.stringify(node.initializer.text)})}` });
          hookInserts.set(comp, true);
          usesUseT = true;
          extracted.push({ key: normalize(node.initializer.text), kind: 'attr' });
        } else {
          log.push(`attribute left in English (no block-bodied component around it): ${node.getText().slice(0, 60)}`);
        }
      }
    }
    // ---- links (public site only) ----
    if (MODE === 'marketing') {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === 'next/link') {
        edits.push({ start: node.moduleSpecifier.getStart(), end: node.moduleSpecifier.getEnd(), text: `'@/components/i18n/Link'` });
      }
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText() === 'a') {
        const hasHref = node.attributes.properties.some((p) => ts.isJsxAttribute(p) && p.name.getText() === 'href');
        if (hasHref) {
          edits.push({ start: node.tagName.getStart(), end: node.tagName.getEnd(), text: 'A' });
          if (ts.isJsxOpeningElement(node) && ts.isJsxElement(node.parent)) {
            const closing = node.parent.closingElement;
            edits.push({ start: closing.tagName.getStart(), end: closing.tagName.getEnd(), text: 'A' });
          }
          usesA = true;
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);

  // hooks at the top of the components that got translated attributes
  for (const comp of hookInserts.keys()) {
    const body = comp.body;
    const text = body.getText();
    if (/const __t = useT\(\)/.test(text)) continue;
    edits.push({ start: body.getStart() + 1, end: body.getStart() + 1, text: '\n  const __t = useT();' });
  }

  // imports
  const importLines = [];
  const needsUseT = usesUseT || /\buseT\(\)/.test(src);
  const needsT = usesT || /<T>/.test(src);
  if (needsT || needsUseT) {
    const needed = [needsT && 'T', needsUseT && 'useT'].filter(Boolean);
    const existing = sf.statements.find((st) => ts.isImportDeclaration(st) && st.moduleSpecifier.text === '@/lib/i18n/context');
    const bindings = existing && existing.importClause && existing.importClause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      const have = bindings.elements.map((e) => e.name.text);
      const missing = needed.filter((n) => !have.includes(n));
      if (missing.length) edits.push({ start: bindings.getStart(), end: bindings.getEnd(), text: `{ ${[...have, ...missing].join(', ')} }` });
    } else if (!existing) {
      importLines.push(`import { ${needed.join(', ')} } from '@/lib/i18n/context';`);
    }
  }
  if (usesA && !/from ['"]@\/components\/i18n\/A['"]/.test(src)) importLines.push(`import { A } from '@/components/i18n/A';`);
  if (importLines.length) {
    const firstImport = sf.statements.find((s) => ts.isImportDeclaration(s));
    const at = firstImport ? firstImport.getStart() : (first && isClient ? first.getEnd() : 0);
    edits.push({ start: at, end: at, text: importLines.join('\n') + '\n' });
  }

  // apply
  edits.sort((a, b) => b.start - a.start || b.end - a.end || (a.order ?? 0) - (b.order ?? 0));
  let out = src;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return { out, changed: out !== src, extracted, log, count: edits.length };
}

const files = targets.flatMap((t) => walkFiles(t));
let changedFiles = 0;
const allExtracted = {};
for (const f of files) {
  const r = processFile(f);
  for (const x of r.extracted) {
    (allExtracted[x.key] ||= []).push(path.relative(process.cwd(), f).replace(/\\/g, '/'));
  }
  if (r.changed) {
    changedFiles++;
    console.log(`${WRITE ? 'wrote' : 'would change'} ${f} (${r.count} edits)`);
    if (WRITE) fs.writeFileSync(f, r.out, 'utf8');
  }
  for (const l of r.log) console.log(`  note ${f}: ${l}`);
}
console.log(`${files.length} files, ${changedFiles} ${WRITE ? 'changed' : 'would change'}, ${Object.keys(allExtracted).length} distinct texts`);
if (EXTRACT) {
  fs.mkdirSync(path.dirname(EXTRACT), { recursive: true });
  fs.writeFileSync(EXTRACT, JSON.stringify(allExtracted, null, 1));
}
