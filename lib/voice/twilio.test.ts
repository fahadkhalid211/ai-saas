import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  dialTwilioResponse,
  rejectTwilioResponse,
  sayTwilioHangupResponse,
  streamTwilioResponse,
  verifyTwilioSignature,
  xmlEscape,
} from './twilio';

describe('Twilio TwiML builders', () => {
  it('escapes XML characters', () => {
    expect(xmlEscape(`"hello" & <world>'`)).toBe('&quot;hello&quot; &amp; &lt;world&gt;&apos;');
  });

  it('builds a bidirectional stream with parameters for Twilio Media Streams', () => {
    const xml = streamTwilioResponse({
      url: 'wss://voice.example.com/stream',
      token: 'tok.123',
      callId: 'CA12345',
      from: '+14155550123',
      to: '+14155550000',
    });
    expect(xml).toContain('<Connect><Stream url="wss://voice.example.com/stream">');
    expect(xml).toContain('<Parameter name="callToken" value="tok.123"/>');
    expect(xml).toContain('<Parameter name="callId" value="CA12345"/>');
    expect(xml.startsWith('<?xml')).toBe(true);
  });

  it('prevents XML injection attacks', () => {
    const xml = streamTwilioResponse({
      url: 'wss://example.com',
      token: 't',
      callId: 'c',
      from: '"><Hangup/><Stream a="',
      to: '+1',
    });
    expect(xml).not.toContain('<Hangup/>');
  });

  it('builds dial, say-hangup, and reject responses', () => {
    expect(dialTwilioResponse('+14155559999')).toContain('<Number>+14155559999</Number>');
    expect(sayTwilioHangupResponse('Please leave a message')).toContain('<Say>Please leave a message</Say><Hangup/>');
    expect(rejectTwilioResponse()).toContain('<Reject reason="busy"/>');
  });
});

describe('Twilio signature validation', () => {
  it('verifies a valid Twilio HMAC-SHA1 signature and rejects tampering', () => {
    const authToken = '1234567890abcdef1234567890abcdef';
    const url = 'https://app.example.com/api/channels/twilio';
    const params = {
      CallSid: 'CA123',
      From: '+14155550100',
      To: '+14155550200',
    };

    // Construct valid signature
    let data = url;
    for (const k of Object.keys(params).sort()) {
      data += k + params[k as keyof typeof params];
    }
    const signature = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');

    expect(verifyTwilioSignature({ authToken, signature, url, params })).toBe(true);
    expect(verifyTwilioSignature({ authToken, signature, url: url + '/extra', params })).toBe(false);
    expect(verifyTwilioSignature({ authToken, signature, url, params: { ...params, From: '+19999999999' } })).toBe(false);
    expect(verifyTwilioSignature({ authToken: 'wrong_token', signature, url, params })).toBe(false);
  });
});
