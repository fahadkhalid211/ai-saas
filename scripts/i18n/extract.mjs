/**
 * Lists every English text the pages can show, so the catalogs can be written and checked.
 *
 *   node scripts/i18n/extract.mjs [--out=scripts/i18n/out/universe.json]
 *
 * It reads the source with the TypeScript compiler and collects:
 *   - the text inside <T>...</T> (and string literals inside it)
 *   - the first argument of __t("...") / t("...") calls
 *   - string values in the data that feeds the pages (objects and arrays in the listed files)
 * and writes { "English text": ["file", ...] }.
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { decodeEntities, normalize } from './codemod-lib.mjs';

const out = (process.argv.find((a) => a.startsWith('--out=')) || '--out=scripts/i18n/out/universe.json').slice(6);

// Where texts live. Legal document bodies, customer pages (embed, site, landing-page), status and the owner-only console stay out.
const ROOTS = [
  'app/[locale]/(marketing)',
  'app/[locale]/dashboard',
  'app/[locale]/login',
  'app/[locale]/not-found.tsx',
  'app/[locale]/error.tsx',
  'app/global-error.tsx',
  'components/marketing',
  'components/legal',
  'components/a11y',
  'components/i18n',
  'components/crm',
  'components/chat',
  'components/ui',
  'components/security',
  'components/brand',
  'components/markdown-renderer.tsx',
  'lib/product-features.ts',
  'lib/billing/plans.ts',
  'components/i18n/EnglishOnlyNotice.tsx',
];
const EXCLUDE = /(AccessCodesTab|AdminLoginScreen|AuditTab|BlogAdminTab|SystemLogsTab)\.tsx$|\.test\.|[\\/]rewritten[\\/]|[\\/]data[\\/]|LanguageSwitcher/;
// Properties whose strings are never words for people.
const SKIP_KEYS = new Set(['href', 'path', 'slug', 'id', 'icon', 'className', 'class', 'color', 'bg', 'url', 'src', 'image', 'img', 'type', 'kind', 'key', 'value', 'to', 'target', 'rel', 'method', 'tone', 'variant', 'size', 'codeSnippet', 'code', 'snippet', 'accent', 'gradient', 'fill', 'stroke', 'viewBox', 'd', 'transform', 'role', 'tab', 'mode', 'format', 'locale', 'lang', 'anchor', 'name_', 'font', 'fontFamily', 'style', 'width', 'height', 'ariaRole', 'endpoint', 'event', 'provider', 'model', 'plan', 'status', 'section', 'channel', 'platform']);

function walk(p, acc = []) {
  if (!fs.existsSync(p)) return acc;
  const st = fs.statSync(p);
  if (st.isFile()) { if (/\.tsx?$/.test(p) && !EXCLUDE.test(p)) acc.push(p); return acc; }
  for (const f of fs.readdirSync(p, { withFileTypes: true })) walk(path.join(p, f.name), acc);
  return acc;
}

const hasLetters = (t) => /[A-Za-z]{2,}/.test(t);
const looksLikeText = (t) => {
  if (!hasLetters(t) || t.length > 700) return false;
  if (/^(https?:|mailto:|tel:|\/|#|\.|@|\{|\[)/.test(t) || /\bhttps?:\/\//.test(t)) return false;
  if (/^[a-z0-9_.:/-]+$/.test(t) && !t.includes(' ')) return false; // an id, a class list, a path
  if (/^[a-z]+(-[a-z0-9]+)+( [a-z0-9:\-\[\]\/.%]+)*$/.test(t)) return false; // tailwind classes
  if (/=>|\bfunction\b|\bconst\b|<\/?[a-z]/.test(t)) return false;
  return true;
};

const CSS_KEYS = new Set(['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight', 'borderRadius', 'background', 'backgroundColor', 'backgroundImage', 'boxShadow', 'gap', 'display', 'flexDirection', 'alignItems', 'justifyContent', 'gridTemplateColumns', 'gridTemplateRows', 'textTransform', 'textDecoration', 'letterSpacing', 'lineHeight', 'fontWeight', 'fontSize', 'textAlign', 'position', 'overflow', 'cursor', 'opacity', 'zIndex', 'top', 'left', 'right', 'bottom', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'outline', 'transition', 'animation', 'Content-Type', 'Cache-Control', 'contentType']);
const PROP_WORDS = /^(intro|eyebrow|lead|kicker|tagline|subhead|badge|idleLabel|savingLabel|savedLabel|label|title|heading|subtitle|caption|hint|helper|tooltip|emptyText|cta|actionLabel|text|description|placeholder|confirmLabel|cancelLabel|message)$/;

const universe = new Map();
const add = (text, file) => {
  const key = normalize(text);
  if (!key || !looksLikeText(key)) return;
  if (!universe.has(key)) universe.set(key, new Set());
  universe.get(key).add(file);
};

function literalsOf(expr, cb) {
  while (expr && (ts.isParenthesizedExpression(expr) || ts.isNonNullExpression(expr) || ts.isAsExpression(expr))) expr = expr.expression;
  if (!expr) return;
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) cb(expr.text);
  else if (ts.isConditionalExpression(expr)) { literalsOf(expr.whenTrue, cb); literalsOf(expr.whenFalse, cb); }
  else if (ts.isBinaryExpression(expr)) { literalsOf(expr.left, cb); literalsOf(expr.right, cb); }
}

for (const file of ROOTS.flatMap((r) => walk(r))) {
  const rel = file.replace(/\\/g, '/');
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (node) => {
    // <T>text</T>
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText() === 'T') {
      for (const c of node.children) {
        if (ts.isJsxText(c)) add(decodeEntities(c.text), rel);
        else if (ts.isJsxExpression(c) && c.expression) literalsOf(c.expression, (t) => add(t, rel));
      }
    }
    // __t("...") / t("...")
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && (node.expression.text === '__t' || node.expression.text === 't') && node.arguments[0]) {
      literalsOf(node.arguments[0], (t) => add(t, rel));
    }
    // const CATEGORIES = ['A', 'B']: lists of labels
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && /^(CATEGORIES|PRIORITIES|STATUSES|OPTIONS|TOPICS)$/.test(node.name.text) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const el of node.initializer.elements) if (ts.isStringLiteral(el)) add(el.text, rel);
    }
    // page-level constants: const TITLE = '...'
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && /^[A-Z][A-Z0-9_]*$/.test(node.name.text) && node.initializer && rel.startsWith('app/')) {
      literalsOf(node.initializer, (t) => add(t, rel));
    }
    // props that carry words: <SaveButton idleLabel="Save" />, <TRich text="..." />
    if (ts.isJsxAttribute(node) && node.initializer && PROP_WORDS.test(node.name.getText())) {
      const init = node.initializer;
      if (ts.isStringLiteral(init)) add(init.text, rel);
      else if (ts.isJsxExpression(init) && init.expression) literalsOf(init.expression, (t) => add(t, rel));
    }
    // messages set from code: setError('...'), alert('...')
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && /^(setError|setErrorMessage|setSuccessMessage|setNotice|setSaveError|setStatusMessage|setFormError|alert)$/.test(node.expression.text) && node.arguments[0]) {
      literalsOf(node.arguments[0], (t) => add(t, rel));
    }
    // data: properties and array items
    if (ts.isPropertyAssignment(node)) {
      const nm = ts.isIdentifier(node.name) ? node.name.text : ts.isStringLiteral(node.name) ? node.name.text : '';
      if (nm && !nm.startsWith('@') && !SKIP_KEYS.has(nm) && !CSS_KEYS.has(nm)) literalsOf(node.initializer, (t) => add(t, rel));
    }
    if (ts.isArrayLiteralExpression(node)) {
      for (const el of node.elements) if (ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el)) {
        // a list of words is data only when it sits in a property that is not skipped
        const p = node.parent;
        const nm = p && ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) ? p.name.text : '';
        if (nm && !SKIP_KEYS.has(nm)) add(el.text, rel);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

const result = Object.fromEntries([...universe.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, [...v]]));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 1));
console.log(`${Object.keys(result).length} texts -> ${out}`);
