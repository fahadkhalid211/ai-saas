import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { YouTubeExtractionError, youTubeFailure } from './url-extractor';
import { diagnoseKnowledgeFailure } from './diagnostics';
import { createProxiedHttpsAgent } from './proxy-agent';

const base = { title: 'My video', botCheck: false, heardFromYouTube: true, captionTracksListed: false };

describe('why a YouTube link could not be read', () => {
  it('says "blocked" for every way a cloud server is turned away', () => {
    // the watch page was a bot check
    expect(youTubeFailure({ ...base, botCheck: true }).code).toBe('blocked');
    // YouTube said nothing at all
    expect(youTubeFailure({ ...base, heardFromYouTube: false }).code).toBe('blocked');
    // the player API asked the server to sign in
    expect(youTubeFailure({ ...base, playability: { status: 'LOGIN_REQUIRED', reason: "Sign in to confirm you're not a bot" } }).code).toBe('blocked');
    expect(youTubeFailure({ ...base, playability: { status: 'LOGIN_REQUIRED' } }).code).toBe('blocked');
    // the video lists captions but none would download (the token requirement)
    expect(youTubeFailure({ ...base, captionTracksListed: true }).code).toBe('blocked');
  });

  it('says "unavailable" for a private, removed or restricted video, with YouTube\'s own words', () => {
    const e = youTubeFailure({ ...base, playability: { status: 'UNPLAYABLE', reason: 'Video unavailable' } });
    expect(e.code).toBe('unavailable');
    expect(e.message).toContain('Video unavailable');
    expect(youTubeFailure({ ...base, playability: { status: 'LOGIN_REQUIRED', reason: 'This video is private' } }).code).toBe('unavailable');
    expect(youTubeFailure({ ...base, playability: { status: 'ERROR' } }).message).toMatch(/error/i);
  });

  it('says "no captions" only when YouTube answered fine and the video simply has none', () => {
    const e = youTubeFailure({ ...base, playability: { status: 'OK' }, audioError: ' Audio transcription was attempted but failed: needs a key.' });
    expect(e).toBeInstanceOf(YouTubeExtractionError);
    expect(e.code).toBe('no_captions');
    expect(e.message).toContain('My video');
    expect(e.message).toContain('needs a key');
    expect(e.message).not.toMatch(/only music/); // the old catch-all guess
  });
});

describe('what the person is told to do', () => {
  const diag = (e: Error) => diagnoseKnowledgeFailure({ filename: 'https://youtu.be/abc', type: 'youtube', errorMessage: e.message });

  it('for a blocked server: take the transcript from YouTube or upload the file, not "re-save your PDF"', () => {
    const d = diag(youTubeFailure({ ...base, botCheck: true }));
    expect(d.reason).toMatch(/YouTube is blocking our server/);
    expect(d.whatToDoNext).toMatch(/Show transcript/);
    expect(d.whatToDoNext).not.toMatch(/PDF/);
  });

  it('for an unavailable video: check it is public', () => {
    const d = diag(youTubeFailure({ ...base, playability: { status: 'UNPLAYABLE', reason: 'Video unavailable' } }));
    expect(d.whatToDoNext).toMatch(/public/i);
  });

  it('for no captions: turn captions on or upload the audio', () => {
    const d = diag(youTubeFailure({ ...base, playability: { status: 'OK' } }));
    expect(d.reason).toMatch(/no captions/i);
    expect(d.whatToDoNext).toMatch(/captions/i);
  });
});

describe('sending YouTube traffic through a proxy', () => {
  let proxy: http.Server | undefined;
  afterEach(() => new Promise<void>((resolve) => (proxy ? proxy.close(() => resolve()) : resolve())));

  it('asks the proxy to open a tunnel to the real host, with its credentials, and reports a refusal clearly', async () => {
    const seen: { line?: string; auth?: string; host?: string } = {};
    proxy = http.createServer();
    proxy.on('connect', (req, socket) => {
      seen.line = `${req.method} ${req.url}`;
      seen.auth = String(req.headers['proxy-authorization'] || '');
      seen.host = String(req.headers.host || '');
      socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    });
    await new Promise<void>((resolve) => proxy!.listen(0, '127.0.0.1', resolve));
    const port = (proxy.address() as net.AddressInfo).port;

    const agent = createProxiedHttpsAgent(`http://user:p%40ss@127.0.0.1:${port}`);
    const err = await new Promise<Error>((resolve) => {
      const req = https.request({ host: 'www.youtube.com', path: '/', agent, timeout: 5000 }, () => resolve(new Error('should not connect')));
      req.on('error', resolve);
      req.end();
    });
    agent.destroy();

    expect(seen.line).toBe('CONNECT www.youtube.com:443');
    expect(seen.host).toBe('www.youtube.com:443');
    expect(seen.auth).toBe('Basic ' + Buffer.from('user:p@ss').toString('base64'));
    expect(err.message).toMatch(/proxy refused the connection \(HTTP 502\)/);
  });

  it('accepts only an http(s) proxy address', () => {
    expect(() => createProxiedHttpsAgent('socks5://127.0.0.1:1080')).toThrow(/http:\/\//);
  });
});
