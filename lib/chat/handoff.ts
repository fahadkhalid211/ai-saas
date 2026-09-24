/**
 * Live-agent hand-off. The assistant never asks visitors to type contact details into the chat: it offers
 * two ways forward, a booking form and a live agent. A request for a person is recognised here, in code,
 * so it works the same whichever model answers.
 */

const HUMAN_REQUEST = new RegExp(
  [
    String.raw`\b(talk|speak|chat|connect|transfer|put me through|get me)\b.{0,25}\b(human|person|people|agent|representative|rep|someone|somebody|team|staff|support|operator|manager)\b`,
    String.raw`\b(live|human|real)\s+(agent|person|support|chat|representative|assistance|help)\b`,
    String.raw`\b(customer\s+(service|support)|support\s+(team|agent)|contact\s+(support|someone|you))\b`,
    String.raw`\bnot\s+a\s+(bot|robot)\b`,
  ].join('|'),
  'i'
);

export function wantsLiveAgent(text: string): boolean {
  return HUMAN_REQUEST.test((text || '').slice(0, 400));
}

/** The reply for a live-agent request. The tokens make the chat show the agent state and, if enabled, the booking form. */
export function liveAgentReply(opts: { bookingEnabled?: boolean }): string {
  const lines = [
    "Of course. I'm connecting you with a live agent now. Someone from our team will join this chat shortly, so you can keep this window open.",
  ];
  if (opts.bookingEnabled) lines.push('If you would rather not wait, you can also pick a time that suits you below.');
  return `${lines.join('\n\n')} [ACTION:HUMAN_ESCALATION]${opts.bookingEnabled ? ' [ACTION:BOOKING_FORM]' : ''}`;
}

/** Streams a fixed reply word by word, like a model would. */
export async function* streamFixedReply(text: string): AsyncGenerator<string, void, unknown> {
  const words = text.split(/(\s+)/);
  for (let i = 0; i < words.length; i += 3) yield words.slice(i, i + 3).join('');
}

/** Removes the [ACTION:...] control tokens before text is shown to a visitor. */
export function stripActionTokens(text: string): string {
  return (text || '').replace(/\s*\[ACTION:[A-Z_]+\]/g, '').trim();
}
