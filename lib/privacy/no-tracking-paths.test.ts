import { describe, it, expect } from 'vitest';
import { isNoTrackingPath } from './no-tracking-paths';

describe('isNoTrackingPath', () => {
  it('covers the embedded chat, hosted customer pages and the signed-in app, with or without a language prefix', () => {
    for (const p of ['/embed/ast_1', '/sv/embed/ast_1', '/site/barber', '/fi/site/barber', '/dashboard', '/it/dashboard', '/master', '/es/master/customers']) {
      expect(isNoTrackingPath(p), p).toBe(true);
    }
  });
  it('leaves Crescelo\'s own marketing pages alone', () => {
    for (const p of ['/', '/pricing', '/sv', '/sv/blog/x', '/login', '/embedded-guide', '/sitemap', '/site-map', '/dashboards']) {
      expect(isNoTrackingPath(p), p).toBe(false);
    }
  });
  it('treats a missing path as a normal page', () => {
    expect(isNoTrackingPath(undefined)).toBe(false);
    expect(isNoTrackingPath(null)).toBe(false);
  });
});
