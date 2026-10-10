import { internalPolicy, publicPolicy } from './lib/security/csp';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A second dev server (for tests against a throwaway database) needs its own build folder: NEXT_DIST_DIR=.next-iso
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Do not advertise the framework in every response.
  poweredByHeader: false,
  // The local AI search model (@xenova/transformers) runs on onnxruntime-node, whose native binding opens a shared library
  // next to it at run time. File tracing follows imports, not that, so the library was left out of the server functions and
  // the model never loaded in production ("libonnxruntime.so.1.14.0: cannot open shared object file").
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'status\\.crescelo\\.com',
            },
          ],
          destination: '/status/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    // The marketing page moved from /welcome to the site root.
    return [
      { source: '/welcome', destination: '/', permanent: true },
      // one address per page: /use-cases used to serve the same content as /use-case
      { source: '/use-cases', destination: '/use-case', permanent: true },
    ];
  },
  async headers() {
    return [
      // Preview deployments (*.vercel.app) must never compete with the real site in search results.
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
      // Content Security Policy in REPORT-ONLY mode: browsers tell /api/csp-report what would be blocked, nothing is blocked yet.
      // Switch the header name to Content-Security-Policy once System Logs show no legitimate violations (see lib/security/csp.ts).
      {
        source: '/((?!api|_next|embed|dashboard|login|master).*)',
        headers: [{ key: 'Content-Security-Policy-Report-Only', value: publicPolicy(true) }],
      },
      ...['/dashboard/:path*', '/login/:path*', '/master/:path*'].map((source) => ({
        source,
        headers: [{ key: 'Content-Security-Policy-Report-Only', value: internalPolicy(true) }],
      })),
      // Sign-in, dashboard and master console are never framed (clickjacking protection).
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
      // Public pages (the marketing site, customers' landing pages) may be shown inside other sites and website builders.
      // No Cross-Origin-Resource-Policy: customers load /widget.js from their own sites.
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
