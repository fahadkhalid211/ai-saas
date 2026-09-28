/**
 * Redaction for anything that is about to be written to the system log.
 *
 * Rules: secrets are replaced by "[redacted]" whatever they are called or wherever they appear, long strings
 * are cut, nested data is bounded in depth and size. Message text and request bodies are never logged by the
 * callers; this is the safety net for what does get passed in.
 */

const SENSITIVE_KEY =
  /pass(word|wd|code)?|secret|token|api[-_]?key|apikey|authorization|auth[-_]?header|cookie|session|signature|credential|private[-_]?key|otp|code[-_]?verifier|client[-_]?secret|bearer|x-api-key|encryption|salt|hash|recovery|twofactor|two_factor/i;

// Values that look like secrets even under an innocent key name.
const SECRET_VALUE_PATTERNS: Array<[RegExp, string]> = [
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{5,}\b/g, '[redacted-jwt]'],
  [/\b(sk|rk|pk)[-_](live|test|proj|ant)?[-_]?[A-Za-z0-9_-]{16,}\b/g, '[redacted-key]'],
  [/\bgsk_[A-Za-z0-9]{16,}\b/g, '[redacted-key]'],
  [/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[redacted-key]'],
  [/\bGOCSPX-[A-Za-z0-9_-]{10,}\b/g, '[redacted-key]'],
  [/\bEA[A-Za-z0-9]{40,}\b/g, '[redacted-key]'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{10,}/gi, 'Bearer [redacted]'],
  [/\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|rediss|amqp):\/\/[^\s'"]+/gi, '[redacted-connection-string]'],
  [/\b((?:token|key|secret|code|password|sig|signature|api_key|apikey|access_token)\s*[:=]\s*)[^\s,;&'"]+/gi, '$1[redacted]'],
  [/([?&](?:token|key|secret|code|password|sig|signature|api_key|apikey|access_token)=)[^&\s'"]+/gi, '$1[redacted]'],
];

export const MAX_STRING = 500;
export const MAX_DEPTH = 5;
export const MAX_KEYS = 40;
export const MAX_ARRAY = 20;

export function redactString(input: string, max = MAX_STRING): string {
  let out = input;
  for (const [pattern, replacement] of SECRET_VALUE_PATTERNS) out = out.replace(pattern, replacement);
  return out.length > max ? `${out.slice(0, max)}…[+${out.length - max}]` : out;
}

export function redactValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return { name: value.name, message: redactString(value.message), stack: redactString(value.stack || '', 2000) };
  }
  if (typeof value !== 'object') return String(value);
  if (seen.has(value as object)) return '[circular]';
  if (depth >= MAX_DEPTH) return '[max-depth]';
  seen.add(value as object);

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY).map((v) => redactValue(v, depth + 1, seen));
    if (value.length > MAX_ARRAY) items.push(`[+${value.length - MAX_ARRAY} more]`);
    return items;
  }

  const out: Record<string, unknown> = {};
  let count = 0;
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (count++ >= MAX_KEYS) {
      out['…'] = `[+${Object.keys(value as object).length - MAX_KEYS} more keys]`;
      break;
    }
    out[key] = SENSITIVE_KEY.test(key) ? '[redacted]' : redactValue(v, depth + 1, seen);
  }
  return out;
}

/** Redacts and bounds a metadata object; if it is still larger than maxBytes it is replaced by a truncation marker. */
export function safeMeta(meta: unknown, maxBytes = 8192): Record<string, unknown> | null {
  if (meta === null || meta === undefined) return null;
  const redacted = redactValue(meta);
  if (redacted === null || typeof redacted !== 'object' || Array.isArray(redacted)) return { value: redacted };
  const json = JSON.stringify(redacted);
  if (json.length <= maxBytes) return redacted as Record<string, unknown>;
  return { truncated: true, bytes: json.length, preview: json.slice(0, 1024) };
}

/** Removes the query string values from a URL path so tokens in links never reach the log. */
export function safePath(pathname: string, search?: string): string {
  const path = pathname.slice(0, 300);
  if (!search) return path;
  const keys = [...new URLSearchParams(search).keys()].slice(0, 10);
  return keys.length ? `${path}?${keys.map((k) => `${k.slice(0, 40)}=…`).join('&')}` : path;
}
