/**
 * The AI provider layer (lib/ai/providers.ts) reports its own failures as plain text appended to the reply, for example
 * "\n\n*(AI Generation Error: ...)*", so a partial answer that streamed before the failure is never thrown away. That
 * module is server-only (it imports the OpenAI SDK), so this tiny, dependency-free file lets client components — the
 * dashboard's Testing Studio today — recognise that text without pulling the provider module into the browser bundle.
 */

export type ProviderNoticeKind = 'auth' | 'connection' | 'generation' | 'missing_provider';

export interface ProviderNotice {
  kind: ProviderNoticeKind;
  /** The human-readable explanation, with the wrapping "*(Label: ... )*" stripped. */
  detail: string;
  /** Any real answer text that streamed before the notice (present when a reply was interrupted partway through). */
  leading: string;
}

const NOTICE_RE = /\*\(\s*(Authentication Error|AI Generation Error|Connection Error|Notice)\s*:\s*([\s\S]*?)\)\*\s*$/;

const KIND: Record<string, ProviderNoticeKind> = {
  'Authentication Error': 'auth',
  'AI Generation Error': 'generation',
  'Connection Error': 'connection',
  Notice: 'missing_provider', // both "no provider reachable" notices read "Notice: Could not connect ..."
};

/** Finds a trailing provider-error notice in a reply, if there is one. Returns null for an ordinary answer. */
export function findProviderNotice(text: string): ProviderNotice | null {
  const m = NOTICE_RE.exec(text || '');
  if (!m) return null;
  return { kind: KIND[m[1]], detail: m[2].trim(), leading: text.slice(0, m.index).trim() };
}

/** True when the message is (or ends with) a provider notice rather than, or as well as, a real answer. */
export function isProviderNotice(text: string): boolean {
  return findProviderNotice(text) !== null;
}
