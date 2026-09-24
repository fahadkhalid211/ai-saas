/**
 * The address the embed code points at. It must be reachable from a customer's website, so an address that only works
 * on this computer (localhost, a private IP) or behind a login (a *.vercel.app deployment) is never put into the snippet.
 */
export const PUBLIC_APP_URL = 'https://www.crescelo.com';

export interface EmbedHost {
  host: string;
  /** Set when the address in the browser was replaced, so the dashboard can say why. */
  note: string | null;
}

function isUnreachableFromTheInternet(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h.endsWith('.localhost') ||
    h === '0.0.0.0' ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h.endsWith('.local') ||
    h.endsWith('.vercel.app')
  );
}

export function resolveEmbedHost(custom: string | undefined, currentOrigin: string | undefined): EmbedHost {
  const strip = (v: string) => v.trim().replace(/\/+$/, '');
  if (custom && custom.trim()) {
    const c = strip(custom);
    return { host: /^https?:\/\//i.test(c) ? c : `https://${c}`, note: null };
  }
  const configured = strip(process.env.NEXT_PUBLIC_APP_URL || '') || PUBLIC_APP_URL;
  if (!currentOrigin) return { host: configured, note: null };
  try {
    const url = new URL(currentOrigin);
    if (isUnreachableFromTheInternet(url.hostname)) {
      return {
        host: configured,
        note: `You opened the dashboard from ${url.host}, which your visitors cannot reach, so the code uses ${configured} instead.`,
      };
    }
    return { host: strip(url.origin), note: null };
  } catch {
    return { host: configured, note: null };
  }
}
