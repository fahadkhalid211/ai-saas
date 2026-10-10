import { Database } from '../db';
import { McpAuditLogRecord } from './types';

/**
 * Strips sensitive fields (passwords, tokens, secrets, long contents) from metadata
 * before persisting to audit log.
 */
function sanitizeAuditMetadata(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const SENSITIVE_KEYS = new Set([
    'password',
    'token',
    'secret',
    'apikey',
    'api_key',
    'authorization',
    'cookie',
  ]);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 500) {
      clean[key] = value.slice(0, 500) + '... [truncated]';
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export async function logMcpToolExecution(entry: {
  workspaceId: string;
  userId: string;
  tokenId?: string;
  tool: string;
  requestId: string;
  success: boolean;
  durationMs: number;
  errorCode?: string;
  metadata?: Record<string, any>;
}): Promise<McpAuditLogRecord> {
  const sanitizedMeta = sanitizeAuditMetadata(entry.metadata);

  return Database.saveMcpAuditLog({
    workspaceId: entry.workspaceId,
    userId: entry.userId,
    tokenId: entry.tokenId,
    tool: entry.tool,
    requestId: entry.requestId,
    success: entry.success,
    durationMs: Math.round(entry.durationMs),
    errorCode: entry.errorCode,
    metadata: sanitizedMeta,
  });
}
