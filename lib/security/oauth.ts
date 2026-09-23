import crypto from 'crypto';
import { Database, TeamMemberData, WorkspaceBillingData } from '@/lib/db';
import { generateSessionToken, createSessionCookieHeader } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';

export interface OAuthUserProfile {
  email: string;
  name?: string;
  provider: 'google' | 'apple' | 'sso';
  providerId?: string;
  domain?: string;
  picture?: string;
}

export interface OAuthAuthResult {
  member: TeamMemberData;
  workspace: WorkspaceBillingData;
  token: string;
  cookieHeader: string;
  isNewUser: boolean;
}

/*
 * SECURITY: a session may only be issued for an identity that a provider has proven to us
 * server-side. Never from an e-mail, JWT or "credential" a browser hands us: JWTs decoded without
 * checking their signature are forgeable by anyone. Google sign-in below uses the authorization-code
 * flow (we exchange the code with our client secret over TLS), a per-login `state` bound to the
 * browser by a cookie, and PKCE. Sign in with Apple and enterprise SSO are switched off until they
 * are implemented with real signature verification (see the routes).
 */

export function isGoogleOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(clientId && clientSecret);
}

export const OAUTH_STATE_COOKIE = 'crescelo_oauth';

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

/** A fresh login attempt: the state to send to the provider, the PKCE pair, and the cookie that binds it to this browser. */
export function createOAuthAttempt(): { state: string; challenge: string; cookie: string } {
  const state = b64url(crypto.randomBytes(24));
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookie = `${OAUTH_STATE_COOKIE}=${state}.${verifier}; Path=/api/auth/oauth; HttpOnly; SameSite=Lax; Max-Age=600${secure}`;
  return { state, challenge, cookie };
}

export function clearOAuthCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${OAUTH_STATE_COOKIE}=; Path=/api/auth/oauth; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

/** Checks the `state` returned by the provider against this browser's cookie. Returns the PKCE verifier, or null. */
export function verifyOAuthAttempt(req: Request, returnedState: string | null): { verifier: string } | null {
  if (!returnedState) return null;
  const header = req.headers.get('cookie') || '';
  const match = header
    .split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${OAUTH_STATE_COOKIE}=`));
  if (!match) return null;
  const [state, verifier] = match.slice(OAUTH_STATE_COOKIE.length + 1).split('.');
  if (!state || !verifier) return null;
  return timingSafeStringEqual(state, returnedState) ? { verifier } : null;
}

/** The Google authorization URL for a login attempt created with createOAuthAttempt(). */
export function getGoogleAuthUrl(origin: string, attempt: { state: string; challenge: string }): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/oauth/google`,
    scope: 'openid email profile',
    state: attempt.state,
    code_challenge: attempt.challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/** Google profile photos live on googleusercontent.com; accept nothing else so a profile cannot inject an arbitrary URL. */
export function safeAvatarUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 500) return undefined;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && /(^|\.)googleusercontent\.com$/i.test(u.hostname) ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Exchanges the authorization code for a verified Google identity. Throws unless the e-mail is verified by Google. */
export async function exchangeGoogleCode(
  code: string,
  origin: string,
  verifier: string
): Promise<{ email: string; name: string; providerId: string; picture?: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google sign-in is not configured.');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/api/auth/oauth/google`,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const tokens = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokens.access_token) throw new Error('Google sign-in could not be completed.');

  // The profile comes straight from Google over TLS with the access token we just obtained.
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    signal: AbortSignal.timeout(10_000),
  });
  const profile = await profileRes.json().catch(() => ({}));
  if (!profileRes.ok || typeof profile.email !== 'string' || !profile.sub) {
    throw new Error('Google did not return an account e-mail.');
  }
  if (profile.email_verified !== true) throw new Error('Your Google e-mail address is not verified.');

  return {
    email: profile.email,
    name: profile.name || profile.given_name || profile.email.split('@')[0],
    providerId: String(profile.sub),
    picture: safeAvatarUrl(profile.picture),
  };
}

/** Describes the identity provider for an e-mail domain. Informational only: it authenticates nobody. */
export function resolveEnterpriseSSO(domainOrEmail: string): {
  domain: string;
  idpName: string;
  protocol: 'SAML_2_0' | 'OIDC';
} {
  const clean = domainOrEmail.toLowerCase().trim();
  const domain = clean.includes('@') ? clean.split('@')[1] : clean;
  return { domain, idpName: `${domain.split('.')[0].toUpperCase()} Corporate IdP`, protocol: 'SAML_2_0' };
}

/** Signs a provider-verified identity in to its workspace (creating one on first use) and issues a session. */
export async function authenticateOAuthUser(
  profile: OAuthUserProfile,
  ip: string = '127.0.0.1'
): Promise<OAuthAuthResult> {
  const { workspace, member, isNewUser } = await Database.findOrCreateOAuthTenant({
    email: profile.email,
    name: profile.name,
    provider: profile.provider,
    providerId: profile.providerId,
    domain: profile.domain,
    picture: profile.picture,
  });

  const sessionToken = generateSessionToken(member.role, member.id, workspace.id);
  const cookieHeader = createSessionCookieHeader(sessionToken);

  await Database.addAuditLog({
    actor: { id: member.id, name: member.name, email: member.email, ip },
    action: isNewUser ? 'auth.oauth_provisioned' : 'auth.oauth_login',
    targetType: 'workspace',
    targetId: workspace.id,
    details: { provider: profile.provider, providerId: profile.providerId, domain: profile.domain },
  });

  return { member, workspace, token: sessionToken, cookieHeader, isNewUser };
}
