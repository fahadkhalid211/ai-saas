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
 * Returns the Google OAuth 2.0 authorization URL.
 */
export function getGoogleAuthUrl(origin: string, state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'crescelo-google-client-id';
  const redirectUri = `${origin}/api/auth/oauth/google`;
  const scope = encodeURIComponent('openid email profile');
  const stateParam = encodeURIComponent(state || crypto.randomBytes(16).toString('hex'));

  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${stateParam}&access_type=offline&prompt=consent`;
}

/**
 * Returns the Sign in with Apple authorization URL.
 */
export function getAppleAuthUrl(origin: string, state?: string): string {
  const clientId = process.env.APPLE_CLIENT_ID || 'com.crescelo.ai.web';
  const redirectUri = `${origin}/api/auth/oauth/apple`;
  const scope = encodeURIComponent('name email');
  const stateParam = encodeURIComponent(state || crypto.randomBytes(16).toString('hex'));

  return `https://appleid.apple.com/auth/authorize?response_type=code%20id_token&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${stateParam}&response_mode=form_post`;
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
