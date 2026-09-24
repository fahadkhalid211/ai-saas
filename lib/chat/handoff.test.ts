import { describe, it, expect } from 'vitest';
import { wantsLiveAgent, liveAgentReply, stripActionTokens, streamFixedReply } from './handoff';

describe('live agent hand-off', () => {
  it('recognises requests for a person', () => {
    for (const t of [
      'I want to talk to a human',
      'can I speak with someone from your team?',
      'connect me to a live agent',
      'get me a real person please',
      'customer service',
      'I need support team',
      'are you a bot? I want a real person',
    ]) {
      expect(wantsLiveAgent(t), t).toBe(true);
    }
  });

  it('does not treat ordinary questions as a hand-off', () => {
    for (const t of ['how much does a haircut cost?', 'what are your opening hours', 'do you have a human resources policy', 'book me for Friday']) {
      expect(wantsLiveAgent(t), t).toBe(false);
    }
  });

  it('replies with the agent token, and adds the booking form only when booking is on', () => {
    const withBooking = liveAgentReply({ bookingEnabled: true });
    expect(withBooking).toContain('[ACTION:HUMAN_ESCALATION]');
    expect(withBooking).toContain('[ACTION:BOOKING_FORM]');
    expect(withBooking).toMatch(/someone from our team will/i); // also trips the server's hand-off detector
    const without = liveAgentReply({ bookingEnabled: false });
    expect(without).toContain('[ACTION:HUMAN_ESCALATION]');
    expect(without).not.toContain('BOOKING_FORM');
  });

  it('never asks for contact details', () => {
    expect(liveAgentReply({ bookingEnabled: true })).not.toMatch(/your (email|phone|number|details)|leave|drop|share/i);
  });

  it('strips control tokens and streams the whole text', async () => {
    expect(stripActionTokens('Sure. [ACTION:BOOKING_FORM] [ACTION:HUMAN_ESCALATION]')).toBe('Sure.');
    let out = '';
    for await (const c of streamFixedReply('one two three four five')) out += c;
    expect(out).toBe('one two three four five');
  });
});
