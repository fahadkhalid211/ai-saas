export type McpScope =
  | 'knowledge:read'
  | 'business:read'
  | 'services:read'
  | 'bookings:read'
  | 'bookings:create'
  | 'bookings:modify'
  | 'leads:read'
  | 'leads:create'
  | 'products:read'
  | 'analytics:read';

export const ALL_MCP_SCOPES: McpScope[] = [
  'knowledge:read',
  'business:read',
  'services:read',
  'bookings:read',
  'bookings:create',
  'bookings:modify',
  'leads:read',
  'leads:create',
  'products:read',
  'analytics:read',
];

export const DEFAULT_MCP_SCOPES: McpScope[] = [
  'knowledge:read',
  'business:read',
  'services:read',
  'bookings:read',
  'leads:create',
  'products:read',
];

export interface McpTokenRecord {
  id: string;
  tokenHash: string; // SHA-256 of plain token
  tokenPrefix: string; // e.g. "cres_mcp_a1b2..."
  workspaceId: string;
  userId: string;
  name: string;
  scopes: McpScope[];
  status: 'active' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
}

export interface McpAuditLogRecord {
  id: string;
  timestamp: string;
  workspaceId: string;
  userId: string;
  tokenId?: string;
  tool: string;
  requestId: string;
  success: boolean;
  durationMs: number;
  errorCode?: string;
  metadata?: Record<string, any>;
}

export interface McpAuthContext {
  authenticated: boolean;
  workspaceId: string;
  userId: string;
  tokenName: string;
  tokenId: string;
  scopes: McpScope[];
  isMasterAdmin?: boolean;
}

export type McpErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'BOOKING_CONFLICT'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ToolMetadata {
  readOnly: boolean;
  requiresConfirmation: boolean;
  destructive: boolean;
  requiredScope: McpScope;
}
