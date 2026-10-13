import crypto from 'crypto';

/**
 * Authentication for the WordPress connector endpoints (register, sync, sync-item).
 *
 * These routes are called by the plugin on the customer's website, with no browser session, so the credential is the
 * assistant's connector key (its `webhookSecret`), sent in the `X-Crescelo-Secret` or `X-Crescelo-Key` header.
 *
 * The rules are deliberately strict:
 *  - an assistant with no key rejects every connector call (it used to accept them, so anyone who knew a public
 *    assistant id could write to its knowledge base);
 *  - a domain name is never a credential: it is a value the caller types, and the assistant id and its allowed domains
 *    are visible to every visitor of the site that embeds the widget;
 *  - keys are compared in constant time.
 */

export function safeSecretCompare(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/** The connector key the caller presented, or '' when there is none. */
export function presentedConnectorKey(req: Request, bodySecret?: unknown): string {
  const header = req.headers.get('x-crescelo-secret') || req.headers.get('x-crescelo-key') || '';
  if (header) return header.trim();
  return typeof bodySecret === 'string' ? bodySecret.trim() : '';
}

export type ConnectorAuthResult = { ok: true } | { ok: false; status: 401 | 403; error: string };

/** Whether the presented key opens this assistant. Fails closed when the assistant has no key. */
export function authorizeConnectorCall(assistant: { webhookSecret?: string | null }, presented: string): ConnectorAuthResult {
  if (!assistant.webhookSecret) {
    return {
      ok: false,
      status: 403,
      error: 'This assistant has no WordPress connection key yet. Open the Crescelo dashboard, go to the WordPress connection and generate a key.',
    };
  }
  if (!presented || !safeSecretCompare(assistant.webhookSecret, presented)) {
    return { ok: false, status: 401, error: 'Unauthorized: invalid or missing X-Crescelo-Secret.' };
  }
  return { ok: true };
}
