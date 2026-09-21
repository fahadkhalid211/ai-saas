import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { dialResponse, parseCarrierBody, sayHangupResponse, streamResponse, verifyTelnyxSignature, verifyWebhookKey, xmlEscape } from './texml';

describe('TeXML builders', () => {
  it('escapes values', () => {
    expect(xmlEscape(`a&b<c>"d'`)).toBe('a&amp;b&lt;c&gt;&quot;d&apos;');
  });

  it('builds a bidirectional stream with parameters', () => {
    const xml = streamResponse({ url: 'wss://voice.example.com/stream', token: 'tok.en', callId: 'c1', from: '+14155550123', to: '+14155550000' });
    expect(xml).toContain('<Connect><Stream url="wss://voice.example.com/stream" bidirectionalMode="rtp" bidirectionalCodec="PCMU">');
    expect(xml).toContain('<Parameter name="callToken" value="tok.en"/>');
    expect(xml.startsWith('<?xml')).toBe(true);
  });

  it('cannot be injected through caller-controlled values', () => {
    const xml = streamResponse({ url: 'wss://x', token: 't', callId: 'c', from: '"/><Hangup/><x a="', to: '+1' });
    expect(xml).not.toContain('<Hangup/>');
  });

  it('builds forward and hang-up responses', () => {
    expect(dialResponse('+14155559999')).toContain('<Number>+14155559999</Number>');
    expect(sayHangupResponse('Sorry & goodbye')).toContain('<Say>Sorry &amp; goodbye</Say><Hangup/>');
  });
});

describe('webhook authentication', () => {
  it('verifies a genuine Ed25519 signature and rejects tampering or staleness', () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    const raw = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');
    const ts = '1800000000';
    const body = '{"a":1}';
    const sig = crypto.sign(null, Buffer.from(`${ts}|${body}`), privateKey).toString('base64');
    const nowMs = 1_800_000_000_000;
    expect(verifyTelnyxSignature({ publicKeyB64: raw, signatureB64: sig, timestamp: ts, rawBody: body, nowMs })).toBe(true);
    expect(verifyTelnyxSignature({ publicKeyB64: raw, signatureB64: sig, timestamp: ts, rawBody: body + 'x', nowMs })).toBe(false);
    expect(verifyTelnyxSignature({ publicKeyB64: raw, signatureB64: sig, timestamp: ts, rawBody: body, nowMs: nowMs + 3_600_000 })).toBe(false);
    expect(verifyTelnyxSignature({ publicKeyB64: 'AAAA', signatureB64: sig, timestamp: ts, rawBody: body, nowMs })).toBe(false);
  });

  it('checks the URL secret in constant time and refuses short secrets', () => {
    const secret = 's'.repeat(32);
    expect(verifyWebhookKey(secret, secret)).toBe(true);
    expect(verifyWebhookKey('x'.repeat(32), secret)).toBe(false);
    expect(verifyWebhookKey(null, secret)).toBe(false);
    expect(verifyWebhookKey('abc', 'abc')).toBe(false);
  });
});

describe('parseCarrierBody', () => {
  it('reads form and JSON bodies', () => {
    expect(parseCarrierBody('From=%2B1415&To=%2B1650&CallSid=abc', 'application/x-www-form-urlencoded')).toMatchObject({ From: '+1415', To: '+1650', CallSid: 'abc' });
    expect(parseCarrierBody('{"data":{"payload":{"from":"+1","to":"+2","call_control_id":"cc1"}}}', 'application/json')).toMatchObject({ from: '+1', to: '+2', call_control_id: 'cc1' });
    expect(parseCarrierBody('not json', 'application/json')).toEqual({});
  });
});
