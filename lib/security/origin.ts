/**
 * The public origin of this app, used to build OAuth redirect URIs and post-login redirects.
 *
 * In production it comes from NEXT_PUBLIC_APP_URL so a forged Host header cannot steer a redirect
 * or the redirect_uri sent to an identity provider. It is only honoured when it belongs to the same
 * site as the request (crescelo.com <-> www.crescelo.com); a stale value pointing at some other
 * domain (an old *.vercel.app address, say) is ignored rather than bouncing visitors there.
 * In development it is the request's own origin.
 */
function registrableDomain(hostname: string): string {
  return hostname.toLowerCase().split('.').slice(-2).join('.');
}

export function canonicalOrigin(req: Request): string {
  const requestUrl = new URL(req.url);
  if (process.env.NODE_ENV !== 'production') return requestUrl.origin;

  const configured = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (configured) {
    try {
      const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
      const url = new URL(withScheme);
      if (registrableDomain(url.hostname) === registrableDomain(requestUrl.hostname)) return url.origin;
    } catch {
      // fall through to the request origin
    }
  }
  return requestUrl.origin;
}
