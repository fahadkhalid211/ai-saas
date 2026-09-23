import crypto from 'crypto';
import { Database, TeamMemberData, WorkspaceBillingData } from '@/lib/db';
import { generateSessionToken, createSessionCookieHeader } from '@/lib/security/auth';

export interface OAuthUserProfile {
  email: string;
  name?: string;
  provider: 'google' | 'apple' | 'sso';
  providerId?: string;
  domain?: string;
}

export interface OAuthAuthResult {
  member: TeamMemberData;
  workspace: WorkspaceBillingData;
  token: string;
  cookieHeader: string;
  isNewUser: boolean;
}

/**
 * Safe JWT payload decoder (works in Node.js runtime without external libraries).
 */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isGoogleOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(clientId && clientSecret);
}

export function isAppleOAuthConfigured(): boolean {
  const clientId = process.env.APPLE_CLIENT_ID;
  return Boolean(clientId && clientId !== 'com.crescelo.ai.web');
}

export function isEnterpriseSSOConfigured(): boolean {
  return Boolean(
    (process.env.SSO_CLIENT_ID && process.env.SSO_CLIENT_SECRET) ||
    process.env.SSO_OIDC_ISSUER ||
    process.env.SAML_ENTRY_POINT ||
    process.env.WORKOS_API_KEY
  );
}

/**
 * Returns the Google OAuth 2.0 authorization URL.
 */
export function getGoogleAuthUrl(origin: string, state?: string): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  const redirectUri = `${origin}/api/auth/oauth/google`;
  const scope = encodeURIComponent('openid email profile');
  const stateParam = encodeURIComponent(state || crypto.randomBytes(16).toString('hex'));

  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${stateParam}&access_type=offline&prompt=consent`;
}

/**
 * Exchanges Google authorization code for verified user info.
 */
export async function exchangeGoogleCode(
  code: string,
  origin: string
): Promise<{ email: string; name: string; providerId: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) are not configured in .env');
  }

  const redirectUri = `${origin}/api/auth/oauth/google`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.access_token) {
    const errorDesc = tokens.error_description || tokens.error || 'Failed to exchange authorization code with Google';
    throw new Error(`Google token exchange error: ${errorDesc}`);
  }

  // Fetch verified profile from Google UserInfo
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.email) {
    // Fallback: inspect id_token if userinfo didn't return email
    if (tokens.id_token) {
      const decoded = decodeJwtPayload(tokens.id_token);
      if (decoded?.email) {
        return {
          email: decoded.email,
          name: decoded.name || decoded.email.split('@')[0],
          providerId: decoded.sub || code.slice(0, 16),
        };
      }
    }
    throw new Error('Failed to retrieve verified email from Google OAuth');
  }

  return {
    email: profile.email,
    name: profile.name || profile.given_name || profile.email.split('@')[0],
    providerId: profile.sub || code.slice(0, 16),
  };
}

/**
 * Returns the Sign in with Apple authorization URL.
 */
export function getAppleAuthUrl(origin: string, state?: string): string | null {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) return null;

  const redirectUri = `${origin}/api/auth/oauth/apple`;
  const scope = encodeURIComponent('name email');
  const stateParam = encodeURIComponent(state || crypto.randomBytes(16).toString('hex'));

  return `https://appleid.apple.com/auth/authorize?response_type=code%20id_token&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${stateParam}&response_mode=form_post`;
}

/**
 * Parses Apple authorization callback payload.
 */
export function parseAppleAuthPayload(params: {
  id_token?: string;
  code?: string;
  user?: any;
}): { email: string; name: string; providerId: string } {
  const { id_token, code, user } = params;

  let email = '';
  let providerId = code ? `apple_${code.slice(0, 16)}` : 'apple_user';
  let name = 'Apple User';

  // Decode id_token JWT
  if (id_token) {
    const payload = decodeJwtPayload(id_token);
    if (payload) {
      if (payload.email) email = payload.email;
      if (payload.sub) providerId = payload.sub;
    }
  }

  // Parse user object sent by Apple on first sign-in
  if (user) {
    try {
      const userObj = typeof user === 'string' ? JSON.parse(user) : user;
      if (userObj.name) {
        const parts = [userObj.name.firstName, userObj.name.lastName].filter(Boolean);
        if (parts.length > 0) name = parts.join(' ');
      }
      if (userObj.email && !email) {
        email = userObj.email;
      }
    } catch {}
  }

  if (!email) {
    throw new Error('Apple authorization did not return an email address. Please ensure email sharing is granted.');
  }

  return { email, name, providerId };
}

/**
 * Resolves an enterprise email domain to an Identity Provider profile (Okta, Azure AD, Google Workspace SAML).
 */
export function resolveEnterpriseSSO(domainOrEmail: string): {
  domain: string;
  idpName: string;
  protocol: 'SAML_2_0' | 'OIDC';
} {
  const clean = domainOrEmail.toLowerCase().trim();
  const domain = clean.includes('@') ? clean.split('@')[1] : clean;

  let idpName = 'Enterprise SAML 2.0 IdP';
  if (domain.includes('google') || domain.includes('alphabet')) {
    idpName = 'Google Workspace SSO';
  } else if (domain.includes('microsoft') || domain.includes('azure') || domain.includes('outlook')) {
    idpName = 'Microsoft Entra ID (Azure AD)';
  } else if (domain.includes('okta')) {
    idpName = 'Okta Enterprise SSO';
  } else {
    idpName = `${domain.split('.')[0].toUpperCase()} Corporate IdP`;
  }

  return {
    domain,
    idpName,
    protocol: 'SAML_2_0',
  };
}

/**
 * Authenticates an OAuth/SSO profile into a tenant workspace and generates session tokens.
 */
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
  });

  const sessionToken = generateSessionToken(
    member.role,
    member.id,
    workspace.id
  );
  const cookieHeader = createSessionCookieHeader(sessionToken);

  await Database.addAuditLog({
    actor: { id: member.id, name: member.name, email: member.email, ip },
    action: isNewUser ? 'auth.oauth_provisioned' : 'auth.oauth_login',
    targetType: 'workspace',
    targetId: workspace.id,
    details: {
      provider: profile.provider,
      providerId: profile.providerId,
      domain: profile.domain,
    },
  });

  return {
    member,
    workspace,
    token: sessionToken,
    cookieHeader,
    isNewUser,
  };
}
