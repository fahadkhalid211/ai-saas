import { checkRateLimit } from '../security/rate-limit';
import { McpAuthContext } from './types';

export interface McpRateLimitConfig {
  workspaceWindowMs?: number;
  workspaceMaxRequests?: number;
  toolWindowMs?: number;
  toolMaxRequests?: number;
}

export function enforceMcpRateLimit(
  auth: McpAuthContext,
  toolName?: string,
  config?: McpRateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; error?: string } {
  // Master admin bypasses rate limits
  if (auth.isMasterAdmin) {
    return { allowed: true, remaining: 9999, resetTime: Date.now() + 60000 };
  }

  const wsWindow = config?.workspaceWindowMs ?? 60 * 1000;
  const wsMax = config?.workspaceMaxRequests ?? 100;

  // 1. Check workspace limit
  const wsKey = `mcp:ws:${auth.workspaceId}`;
  const wsCheck = checkRateLimit(wsKey, { windowMs: wsWindow, max: wsMax });

  if (!wsCheck.allowed) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: wsCheck.resetTime,
      error: `Rate limit exceeded for workspace. Allowed: ${wsMax} req/min. Please try again in ${Math.ceil((wsCheck.resetTime - Date.now()) / 1000)}s.`,
    };
  }

  // 2. Check tool-specific limit (e.g. for booking creation or lead capture)
  if (toolName) {
    const isWriteAction = toolName.startsWith('create_') || toolName.startsWith('cancel_');
    const toolMax = config?.toolMaxRequests ?? (isWriteAction ? 30 : 120);
    const toolWindow = config?.toolWindowMs ?? 60 * 1000;

    const toolKey = `mcp:tool:${auth.workspaceId}:${toolName}`;
    const toolCheck = checkRateLimit(toolKey, { windowMs: toolWindow, max: toolMax });

    if (!toolCheck.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: toolCheck.resetTime,
        error: `Rate limit exceeded for tool '${toolName}'. Allowed: ${toolMax} executions/min. Please retry in ${Math.ceil((toolCheck.resetTime - Date.now()) / 1000)}s.`,
      };
    }
  }

  return wsCheck;
}
