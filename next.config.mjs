// ==============================================================================
// Crescelo - Next.js Configuration (ESM)
// Converted from next.config.ts to next.config.mjs for maximum host compatibility
// (bypasses SWC TypeScript config compilation on hosts with older glibc)
// ==============================================================================

const EMBEDDING_ROUTES = [
  '/api/analytics/unanswered',
  '/api/channels/instagram',
  '/api/channels/telegram',
  '/api/channels/tiktok',
  '/api/channels/whatsapp',
  '/api/chat',
  '/api/connectors/hospitable/sync',
  '/api/connectors/shopify/sync',
  '/api/connectors/wordpress/sync',
  '/api/connectors/wordpress/sync-item',
  '/api/cron/hospitable-sync',
  '/api/cron/recrawl',
  '/api/cron/reembed',
  '/api/knowledge/correct',
  '/api/knowledge/search',
  '/api/knowledge/upload',
  '/api/knowledge/url',
  '/api/mcp',
  '/api/templates',
  '/api/voice/end',
  '/api/voice/session',
  '/api/voice/turn',
  '/api/webhook/hospitable',
];

const ONNX_RUNTIME_FILES = './node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*';

const RERANK_ROUTES = [
  '/api/channels/instagram',
  '/api/channels/telegram',
  '/api/channels/tiktok',
  '/api/channels/whatsapp',
  '/api/chat',
  '/api/mcp',
  '/api/voice/end',
  '/api/voice/session',
  '/api/voice/turn',
];

const EMBEDDING_MODEL_FILES = './models/Xenova/bge-small-en-v1.5/**/*';
const RERANK_MODEL_FILES = './models/Xenova/ms-marco-MiniLM-L-6-v2/**/*';

// ------------------------------------------------------------------------------
// Content Security Policy
// ------------------------------------------------------------------------------
const GOOGLE_ANALYTICS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
];
const RECAPTCHA = [
  'https://www.google.com/recaptcha/',
  'https://www.gstatic.com/recaptcha/',
  'https://recaptcha.google.com',
];

function joinDirectives(directives) {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(' ')}` : name))
    .join('; ');
}

function buildCspPolicy(options) {
  const dev = options.development ?? process.env.NODE_ENV !== 'production';
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(dev ? ["'unsafe-eval'"] : []),
      'https://www.googletagmanager.com',
      ...RECAPTCHA.filter((s) => s.includes('/recaptcha/')),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': options.anyHttpsImages
      ? ["'self'", 'data:', 'blob:', 'https:']
      : [
          "'self'",
          'data:',
          'blob:',
          'https://lh3.googleusercontent.com',
          'https://*.googleusercontent.com',
          ...GOOGLE_ANALYTICS,
        ],
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
  return joinDirectives(directives);
}

const CSP_REPORT_PATH = '/api/csp-report';
const publicPolicy = (reportOnly = true) =>
  buildCspPolicy({ anyHttpsImages: true, reportUri: reportOnly ? CSP_REPORT_PATH : undefined });
const internalPolicy = (reportOnly = true) =>
  buildCspPolicy({ anyHttpsImages: false, reportUri: reportOnly ? CSP_REPORT_PATH : undefined });

// ------------------------------------------------------------------------------
// Next.js Config
// ------------------------------------------------------------------------------
/** @type {import('next').NextConfig} */
const nextConfig = {
  // A second dev server needs its own build folder: NEXT_DIST_DIR=.next-iso
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Do not advertise the framework in every response
  poweredByHeader: false,
  // Marks this app as one whose Next.js upgrades are security-only patch updates
  experimental: { agentUpgrade: 'security' },
  typescript: {
    ignoreBuildErrors: true,
  },

  outputFileTracingIncludes: {
    ...Object.fromEntries(
      EMBEDDING_ROUTES.map((route) => [
        route,
        [
          ONNX_RUNTIME_FILES,
          EMBEDDING_MODEL_FILES,
          ...(RERANK_ROUTES.includes(route) ? [RERANK_MODEL_FILES] : []),
        ],
      ])
    ),
    '/*/blog': ['./lib/blog/translations/**/*'],
    '/*/blog/*': ['./lib/blog/translations/**/*'],
  },

  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu/**/*',
      'node_modules/@swc/core-linux-x64-musl/**/*',
      'node_modules/@esbuild/**/*',
      'node_modules/@xenova/transformers/.cache/**/*',
      'node_modules/onnxruntime-node/bin/napi-v3/darwin/**/*',
      'node_modules/onnxruntime-node/bin/napi-v3/win32/**/*',
      'node_modules/onnxruntime-node/bin/napi-v3/linux/arm64/**/*',
      '**/*.test.*',
      '**/*.spec.*',
    ],
  },

  async redirects() {
    return [
      { source: '/welcome', destination: '/', permanent: true },
      { source: '/use-cases', destination: '/use-case', permanent: true },
    ];
  },

  async rewrites() {
    return [{ source: '/:key([a-zA-Z0-9]{16,64}).txt', destination: '/api/indexnow-key/:key' }];
  },

  async headers() {
    return [
      {
        source: '/widget.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/media/internal/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<host>.*\\.vercel\\.app)' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self)' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/((?!api|_next|embed|dashboard|login|master).*)',
        headers: [{ key: 'Content-Security-Policy-Report-Only', value: publicPolicy(true) }],
      },
      ...['/dashboard/:path*', '/login/:path*', '/master/:path*'].map((source) => ({
        source,
        headers: [{ key: 'Content-Security-Policy-Report-Only', value: internalPolicy(true) }],
      })),
      ...['/dashboard/:path*', '/login/:path*', '/master/:path*'].map((source) => ({
        source,
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self)' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'" },
        ],
      })),
      {
        source: '/((?!embed|dashboard|login|master).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self)' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; form-action 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
