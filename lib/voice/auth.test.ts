import { describe, it, expect } from 'vitest';
import { mintCallToken, signVoiceRequest, verifyCallToken, verifyVoiceRequest } from './auth';

const SECRET = 'x'.repeat(40);
const body = JSON.stringify({ callId: 'c1', text: 'hello' });
const nowMs = 1_800_000_000_000;
const ts = Math.floor(nowMs / 1000);

describe('verifyVoiceRequest', () => {
  it('accepts a correctly signed fresh request', () => {
    const sig = signVoiceRequest(SECRET, ts, body);
    expect(verifyVoiceRequest({ secret: SECRET, timestamp: String(ts), signature: sig, rawBody: body, nowMs })).toEqual({ ok: true });
  });

  it('rejects a replay of the same request', () => {
    const b = JSON.stringify({ n: 'replay-test' });
    const sig = signVoiceRequest(SECRET, ts, b);
    const args = { secret: SECRET, timestamp: String(ts), signature: sig, rawBody: b, nowMs };
    expect(verifyVoiceRequest(args).ok).toBe(true);
    expect(verifyVoiceRequest(args)).toEqual({ ok: false, reason: 'replay' });
  });

  it('rejects tampering, wrong secrets and stale timestamps', () => {
    const sig = signVoiceRequest(SECRET, ts, body);
    expect(verifyVoiceRequest({ secret: SECRET, timestamp: String(ts), signature: sig, rawBody: body + ' ', nowMs })).toEqual({ ok: false, reason: 'bad_signature' });
    expect(verifyVoiceRequest({ secret: 'y'.repeat(40), timestamp: String(ts), signature: sig, rawBody: body, nowMs })).toEqual({ ok: false, reason: 'bad_signature' });
    const old = ts - 3600;
    expect(verifyVoiceRequest({ secret: SECRET, timestamp: String(old), signature: signVoiceRequest(SECRET, old, body), rawBody: body, nowMs })).toEqual({ ok: false, reason: 'stale' });
  });

  it('is disabled without a secret and rejects missing headers', () => {
    expect(verifyVoiceRequest({ secret: null, timestamp: '1', signature: 'a', rawBody: '', nowMs })).toEqual({ ok: false, reason: 'disabled' });
    expect(verifyVoiceRequest({ secret: SECRET, timestamp: null, signature: null, rawBody: '', nowMs })).toEqual({ ok: false, reason: 'missing' });
  });
});

describe('call tokens', () => {
  it('round-trips and expires', () => {
    const token = mintCallToken(SECRET, { callId: 'c1', assistantId: 'a1', from: '+1', to: '+2' }, 60, nowMs);
    expect(verifyCallToken(SECRET, token, nowMs + 30_000)?.assistantId).toBe('a1');
    expect(verifyCallToken(SECRET, token, nowMs + 61_000)).toBeNull();
  });

  it('rejects forged and altered tokens', () => {
    const token = mintCallToken(SECRET, { callId: 'c1', assistantId: 'a1' }, 60, nowMs);
    expect(verifyCallToken('z'.repeat(40), token, nowMs)).toBeNull();
    const [body, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ callId: 'c1', assistantId: 'evil', exp: 9e9 })).toString('base64url');
    expect(verifyCallToken(SECRET, `${forged}.${sig}`, nowMs)).toBeNull();
    expect(verifyCallToken(SECRET, `${body}.`, nowMs)).toBeNull();
    expect(verifyCallToken(SECRET, null, nowMs)).toBeNull();
  });
});
