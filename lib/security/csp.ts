/**
 * Content Security Policy: the list of sources the browser may load from. One allowlist, two shapes:
 *  - `publicPolicy()` for the marketing site and customers' hosted landing pages (which can show images from any https host);
 *  - `internalPolicy()` for sign-in, dashboard and master console (no customer-supplied content, so images are limited too).
 *
 * Scripts keep 'unsafe-inline' on purpose: Next.js writes small inline bootstrap scripts, and a nonce would force every page to be
 * rendered per request (no static pages, slower first paint). Everything else is strict, which still blocks remote script
 * injection from unknown hosts, plugins, <base> hijacking and off-site form posts.
 */

const GOOGLE_ANALYTICS = ['https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com'];
const RECAPTCHA = ['https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/', 'https://recaptcha.google.com'];

export interface CspOptions {
  /** Report violations here without blocking (report-only mode). */
  reportUri?: string;
  /** Allow images from any https host (customer landing pages) or only from this site and a few known hosts. */
  anyHttpsImages: boolean;
  /** Next.js development needs eval; production must not. */
  development?: boolean;
}

function join(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(' ')}` : name))
    .join('; ');
}

export function buildPolicy(options: CspOptions): string {
  const dev = options.development ?? process.env.NODE_ENV !== 'production';
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), 'https://www.googletagmanager.com', ...RECAPTCHA.filter((s) => s.includes('/recaptcha/'))],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': options.anyHttpsImages
      ? ["'self'", 'data:', 'blob:', 'https:']
      : ["'self'", 'data:', 'blob:', 'https://lh3.googleusercontent.com', 'https://*.googleusercontent.com', ...GOOGLE_ANALYTICS],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", ...GOOGLE_ANALYTICS, 'https://www.google.com'],
    'frame-src': RECAPTCHA.filter((s) => s.includes('recaptcha')),
    'media-src': ["'self'", 'blob:', ...(options.anyHttpsImages ? ['https:'] : [])],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };
  if (options.reportUri) directives['report-uri'] = [options.reportUri];
  return join(directives);
}

export const CSP_REPORT_PATH = '/api/csp-report';

export const publicPolicy = (reportOnly = true) => buildPolicy({ anyHttpsImages: true, reportUri: reportOnly ? CSP_REPORT_PATH : undefined });
export const internalPolicy = (reportOnly = true) => buildPolicy({ anyHttpsImages: false, reportUri: reportOnly ? CSP_REPORT_PATH : undefined });

/* --------------------------------------------- violation reports --------------------------------------------- */

export interface CspViolation {
  directive: string;
  blockedHost: string;
  documentPath: string;
  sourceFile: string;
}

const EXTENSION = /^(chrome|moz|safari|edge|webkit-masked-url)[a-z-]*:/i;

function hostOf(uri: string): string {
  if (!uri) return 'unknown';
  if (EXTENSION.test(uri)) return 'extension';
  if (uri === 'inline' || uri === 'eval' || uri === 'data' || uri === 'blob' || uri === 'self') return uri;
  try {
    const u = new URL(uri);
    return u.host || u.protocol;
  } catch {
    return uri.slice(0, 40);
  }
}

function pathOf(uri: string): string {
  try {
    return new URL(uri).pathname.slice(0, 120);
  } catch {
    return '';
  }
}

/** Turns the body of a report (legacy `csp-report` or the Reporting API array) into normalised violations. Never throws. */
export function parseCspReports(body: unknown): CspViolation[] {
  const items: unknown[] = Array.isArray(body) ? body : [body];
  const out: CspViolation[] = [];
  for (const item of items.slice(0, 20)) {
    const raw = (item as { 'csp-report'?: unknown; body?: unknown } | null) ?? {};
    const r = (raw['csp-report'] ?? raw.body ?? raw) as Record<string, unknown>;
    if (!r || typeof r !== 'object') continue;
    const directive = String(r['effective-directive'] ?? r['effectiveDirective'] ?? r['violated-directive'] ?? r['violatedDirective'] ?? '').split(' ')[0];
    if (!directive) continue;
    const blocked = String(r['blocked-uri'] ?? r['blockedURL'] ?? r['blockedUri'] ?? '');
    const source = String(r['source-file'] ?? r['sourceFile'] ?? '');
    const doc = String(r['document-uri'] ?? r['documentURL'] ?? r['documentUri'] ?? '');
    const blockedHost = hostOf(blocked);
    if (blockedHost === 'extension' || EXTENSION.test(source)) continue; // browser extensions are not our problem
    out.push({ directive: directive.slice(0, 40), blockedHost, documentPath: pathOf(doc), sourceFile: hostOf(source) });
  }
  return out;
}
