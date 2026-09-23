/**
 * The public origin of this app, used to build OAuth redirect URIs and post-login redirects.
 *
 * In production it comes from NEXT_PUBLIC_APP_URL so a forged Host header cannot steer a redirect
 * or the redirect_uri sent to an identity provider. In development it is the request's own origin.
 */
export function canonicalOrigin(req: Request): string {
  const requestOrigin = new URL(req.url).origin;
  if (process.env.NODE_ENV !== 'production') return requestOrigin;

  const configured = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (configured) {
    try {
      const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
      return new URL(withScheme).origin;
    } catch {
      // fall through to the request origin
    }
  }
  return requestOrigin;
}
