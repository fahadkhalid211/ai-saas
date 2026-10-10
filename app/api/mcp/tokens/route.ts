import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withRoleAuth, getAuthContext } from '@/lib/security/auth';
import { generateMcpToken } from '@/lib/mcp/auth';
import { ALL_MCP_SCOPES, McpScope } from '@/lib/mcp/types';
import { getClientIp } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';

const GETHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const tokens = await Database.getMcpTokens(ctx.workspaceId);

    // Return sanitized tokens list (never exposes tokenHash)
    const sanitized = tokens.map((t) => ({
      id: t.id,
      name: t.name,
      tokenPrefix: t.tokenPrefix,
      workspaceId: t.workspaceId,
      userId: t.userId,
      scopes: t.scopes,
      status: t.status,
      createdAt: t.createdAt,
      lastUsedAt: t.lastUsedAt,
      expiresAt: t.expiresAt,
    }));

    return NextResponse.json({
      tokens: sanitized,
      availableScopes: ALL_MCP_SCOPES,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch MCP tokens' },
      { status: 500 }
    );
  }
});

const POSTHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();

    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'AI Assistant Client';
    const requestedScopes: McpScope[] = Array.isArray(body.scopes) && body.scopes.length > 0
      ? body.scopes.filter((s: string) => ALL_MCP_SCOPES.includes(s as McpScope))
      : ['knowledge:read', 'business:read', 'services:read', 'bookings:read', 'products:read'];

    const expiresInDays = typeof body.expiresInDays === 'number' && body.expiresInDays > 0
      ? body.expiresInDays
      : null;

    const { rawToken, record } = await generateMcpToken({
      workspaceId: ctx.workspaceId,
      userId: ctx.memberId || 'admin',
      name,
      scopes: requestedScopes,
      expiresInDays,
    });

    await Database.addAuditLog({
      workspaceId: ctx.workspaceId,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
        ip: getClientIp(req),
      },
      action: 'mcp.token.created',
      targetType: 'mcp_token',
      targetId: record.id,
      details: {
        tokenName: record.name,
        scopes: record.scopes,
        expiresAt: record.expiresAt,
      },
    });

    return NextResponse.json(
      {
        message: 'MCP token generated successfully. Copy this token immediately as it cannot be shown again.',
        token: rawToken,
        record: {
          id: record.id,
          name: record.name,
          tokenPrefix: record.tokenPrefix,
          scopes: record.scopes,
          createdAt: record.createdAt,
          expiresAt: record.expiresAt,
          status: record.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create MCP token' },
      { status: 500 }
    );
  }
});

const DELETEHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const url = new URL(req.url);
    const tokenId = url.searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required (?id=...)' }, { status: 400 });
    }

    const revoked = await Database.revokeMcpToken(tokenId, ctx.workspaceId);
    if (!revoked) {
      return NextResponse.json({ error: 'Token not found or already revoked' }, { status: 404 });
    }

    await Database.addAuditLog({
      workspaceId: ctx.workspaceId,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
        ip: getClientIp(req),
      },
      action: 'mcp.token.revoked',
      targetType: 'mcp_token',
      targetId: tokenId,
      details: {
        revokedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, message: 'MCP token revoked successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to revoke MCP token' },
      { status: 500 }
    );
  }
});

export const GET = logged(GETHandler, { route: '/api/mcp/tokens' });
export const POST = logged(POSTHandler, { route: '/api/mcp/tokens' });
export const DELETE = logged(DELETEHandler, { route: '/api/mcp/tokens' });
