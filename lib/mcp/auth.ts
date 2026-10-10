import crypto from 'crypto';
import { Database } from '../db';
import { McpAuthContext, McpScope, McpTokenRecord, ALL_MCP_SCOPES, DEFAULT_MCP_SCOPES } from './types';
import { getAuthContext } from '../security/auth';

/**
 * Computes deterministic SHA-256 hash of a plain token string.
 * Plain tokens are never stored in the database.
 */
export function hashToken(plainToken: string): string {
  return crypto.createHash('sha256').update(plainToken.trim()).digest('hex');
}

/**
 * Generates a cryptographically secure random token for MCP access.
 * Format: cres_mcp_<64 hex chars>
 * Returns the raw token (to show once to the user) and the database record.
 */
export async function generateMcpToken(options: {
  workspaceId: string;
  userId: string;
  name: string;
  scopes?: McpScope[];
  expiresInDays?: number | null;
}): Promise<{ rawToken: string; record: McpTokenRecord }> {
  if (!options.workspaceId) {
    throw new Error('workspaceId is required to generate an MCP token');
  }

  const rawBytes = crypto.randomBytes(32).toString('hex');
  const rawToken = `cres_mcp_${rawBytes}`;
  const tokenHash = hashToken(rawToken);
  const tokenPrefix = rawToken.slice(0, 16) + '...';

  const validScopes: McpScope[] = (options.scopes && options.scopes.length > 0)
    ? options.scopes.filter((s) => ALL_MCP_SCOPES.includes(s))
    : [...DEFAULT_MCP_SCOPES];

  let expiresAt: string | null = null;
  if (options.expiresInDays !== undefined && options.expiresInDays !== null) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + options.expiresInDays);
    expiresAt = expDate.toISOString();
  }

  const record: McpTokenRecord = {
    id: 'tok_' + crypto.randomBytes(12).toString('hex'),
    tokenHash,
    tokenPrefix,
    workspaceId: options.workspaceId,
    userId: options.userId || 'admin',
    name: options.name || 'AI Assistant Client',
    scopes: validScopes,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt,
    lastUsedAt: null,
  };

  await Database.saveMcpToken(record);

  return { rawToken, record };
}

/**
 * Validates token string from request header or query parameter and resolves
 * strict tenant authentication context.
 *
 * Checks:
 * 1. Bearer format
 * 2. Token hash lookup in database
 * 3. Status ('active' vs 'revoked')
 * 4. Expiration date
 * 5. Updates lastUsedAt asynchronously
 */
export async function authenticateMcpRequest(req: Request): Promise<McpAuthContext | null> {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-mcp-key');
  let tokenStr = '';

  if (authHeader) {
    tokenStr = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  }

  // Also check query param ?token= for SSE GET requests if client cannot pass headers
  if (!tokenStr) {
    try {
      const url = new URL(req.url);
      const qToken = url.searchParams.get('token');
      if (qToken) tokenStr = qToken.trim();
    } catch {
      // invalid URL
    }
  }

  if (!tokenStr) {
    return null;
  }

  // 1. Check dedicated MCP token database
  if (tokenStr.startsWith('cres_mcp_')) {
    const tokenHash = hashToken(tokenStr);
    const tokenRecord = await Database.getMcpTokenByHash(tokenHash);

    if (!tokenRecord) {
      return null;
    }

    if (tokenRecord.status !== 'active') {
      return null; // Revoked token
    }

    if (tokenRecord.expiresAt) {
      const expiresTime = new Date(tokenRecord.expiresAt).getTime();
      if (Date.now() > expiresTime) {
        return null; // Expired token
      }
    }

    // Touch last used timestamp asynchronously
    void Database.touchMcpToken(tokenRecord.id);

    return {
      authenticated: true,
      workspaceId: tokenRecord.workspaceId,
      userId: tokenRecord.userId,
      tokenName: tokenRecord.name,
      tokenId: tokenRecord.id,
      scopes: tokenRecord.scopes || [],
      isMasterAdmin: false,
    };
  }

  // 2. Fallback: Authenticate via valid Crescelo admin/team session
  const adminCtx = await getAuthContext(req);
  if (adminCtx.authenticated) {
    return {
      authenticated: true,
      workspaceId: adminCtx.workspaceId || 'default-workspace',
      userId: adminCtx.memberId || 'admin',
      tokenName: 'Session (' + adminCtx.role + ')',
      tokenId: 'session_' + adminCtx.memberId,
      scopes: [...ALL_MCP_SCOPES], // full admin session has all scopes
      isMasterAdmin: adminCtx.isMasterAdmin,
    };
  }

  return null;
}

/**
 * Checks whether an authenticated context has the specified scope.
 */
export function hasScope(auth: McpAuthContext, scope: McpScope): boolean {
  if (!auth.authenticated) return false;
  if (auth.isMasterAdmin) return true;
  return auth.scopes.includes(scope);
}

/**
 * Throws structured error if auth context lacks required permission scope.
 */
export function assertScope(auth: McpAuthContext, scope: McpScope): void {
  if (!hasScope(auth, scope)) {
    const error: any = new Error(`Forbidden: Token lacks required scope '${scope}'`);
    error.code = 'FORBIDDEN';
    error.requiredScope = scope;
    throw error;
  }
}
