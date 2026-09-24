import { describe, it, expect } from 'vitest';
import { resolveEmbedHost, PUBLIC_APP_URL } from './embed';

describe('embed host', () => {
  it('uses the address the dashboard is served from when visitors can reach it', () => {
    expect(resolveEmbedHost('', 'https://app.example.com')).toEqual({ host: 'https://app.example.com', note: null });
  });

  it('never puts an unreachable address into the code', () => {
    for (const origin of ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.1.5:3000', 'https://kortex-abc.vercel.app']) {
      const r = resolveEmbedHost('', origin);
      expect(r.host).toBe(PUBLIC_APP_URL);
      expect(r.note).toMatch(/cannot reach/);
    }
  });

  it('honours a custom host, adding https when missing', () => {
    expect(resolveEmbedHost('chat.mybrand.com/', 'http://localhost:3000')).toEqual({ host: 'https://chat.mybrand.com', note: null });
  });
});
