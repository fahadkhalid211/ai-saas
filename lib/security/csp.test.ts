import { describe, it, expect } from 'vitest';
import { buildPolicy, parseCspReports, publicPolicy, internalPolicy } from './csp';

describe('content security policy', () => {
  it('locks down plugins, base and forms, and never allows eval in production', () => {
    const p = buildPolicy({ anyHttpsImages: true, development: false });
    expect(p).toContain("object-src 'none'");
    expect(p).toContain("base-uri 'self'");
    expect(p).toContain("form-action 'self'");
    expect(p).toContain("default-src 'self'");
    expect(p).not.toContain('unsafe-eval');
    expect(buildPolicy({ anyHttpsImages: true, development: true })).toContain('unsafe-eval');
  });

  it('allows only the scripts the site really uses', () => {
    const script = buildPolicy({ anyHttpsImages: true, development: false }).split('; ').find((d) => d.startsWith('script-src'))!;
    expect(script).toContain('https://www.googletagmanager.com');
    expect(script).toContain('https://www.google.com/recaptcha/');
    expect(script).not.toMatch(/\shttps:(\s|$)/); // no blanket https: for scripts
  });

  it('public pages accept customer images from any https host, internal areas do not', () => {
    expect(publicPolicy()).toMatch(/img-src [^;]*\shttps:(\s|;|$)/);
    expect(internalPolicy()).not.toMatch(/img-src [^;]*\shttps:(\s|;|$)/);
  });

  it('report-only policies point reports at the collector', () => {
    expect(publicPolicy(true)).toContain('report-uri /api/csp-report');
    expect(publicPolicy(false)).not.toContain('report-uri');
  });
});

describe('violation reports', () => {
  it('reads the legacy report format', () => {
    const v = parseCspReports({ 'csp-report': { 'document-uri': 'https://www.crescelo.com/pricing?x=secret', 'violated-directive': 'script-src-elem', 'blocked-uri': 'https://evil.example/a.js?token=1' } });
    expect(v).toEqual([{ directive: 'script-src-elem', blockedHost: 'evil.example', documentPath: '/pricing', sourceFile: 'unknown' }]);
  });

  it('reads the Reporting API format (an array)', () => {
    const v = parseCspReports([{ type: 'csp-violation', body: { documentURL: 'https://www.crescelo.com/', effectiveDirective: 'img-src', blockedURL: 'inline' } }]);
    expect(v[0]).toMatchObject({ directive: 'img-src', blockedHost: 'inline', documentPath: '/' });
  });

  it('drops browser-extension noise and garbage, and never throws', () => {
    expect(parseCspReports({ 'csp-report': { 'violated-directive': 'script-src', 'blocked-uri': 'chrome-extension://abc/x.js' } })).toEqual([]);
    expect(parseCspReports({ 'csp-report': { 'violated-directive': 'script-src', 'blocked-uri': 'https://a.example/x.js', 'source-file': 'moz-extension://y' } })).toEqual([]);
    expect(parseCspReports(null)).toEqual([]);
    expect(parseCspReports('nonsense')).toEqual([]);
    expect(parseCspReports({})).toEqual([]);
  });

  it('keeps no query strings or full URLs', () => {
    const [v] = parseCspReports({ 'csp-report': { 'document-uri': 'https://www.crescelo.com/login?email=a@b.c', 'effective-directive': 'connect-src', 'blocked-uri': 'https://x.example/path?secret=1' } });
    expect(JSON.stringify(v)).not.toMatch(/secret|email=|a@b/);
  });
});
