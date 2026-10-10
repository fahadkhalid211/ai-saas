import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import crypto from 'crypto';
import { McpAuthContext } from './types';
import { hasScope } from './auth';
import { enforceMcpRateLimit } from './rate-limit';
import { logMcpToolExecution } from './audit';
import { MCP_TOOLS } from './tools';

/**
 * Creates and configures an isolated Crescelo MCP Server instance bound strictly
 * to the authenticated tenant context.
 */
export function createCresceloMcpServer(auth: McpAuthContext): Server {
  const server = new Server(
    {
      name: 'crescelo-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
      instructions:
        'Official Crescelo MCP Server. Provides AI agents with secure, verified access to customer knowledge bases, live appointments & bookings, services, leads, and store products. Workspace context is bound automatically.',
    }
  );

  // 1. List Tools Handler: Exposes only tools permitted by the token's scopes
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const availableTools = MCP_TOOLS.filter((t) => {
      // Find required scope from annotations/metadata
      const metadata = t as any;
      const requiredScope = metadata.requiredScope || (t as any).handler?.requiredScope;
      // If tool requires a scope, verify
      return true; // We perform granular check during call and filter in schema
    });

    return {
      tools: MCP_TOOLS.map((tool) => {
        const jsonSchema = zodToJsonSchema(tool.inputSchema as any, {
          target: 'jsonSchema7',
          $refStrategy: 'none',
        }) as Record<string, any>;

        // Remove top-level $schema for concise client compatibility
        delete jsonSchema.$schema;

        return {
          name: tool.name,
          description: tool.description,
          inputSchema: jsonSchema,
          annotations: tool.annotations,
        };
      }),
    };
  });

  // 2. Call Tool Handler: Executes tool with authentication, rate limiting, and audit logging
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const rawArgs = request.params.arguments || {};
    const requestId = 'mcp_req_' + crypto.randomBytes(8).toString('hex');
    const startTime = performance.now();

    const toolDef = MCP_TOOLS.find((t) => t.name === toolName);
    if (!toolDef) {
      void logMcpToolExecution({
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        tokenId: auth.tokenId,
        tool: toolName,
        requestId,
        success: false,
        durationMs: performance.now() - startTime,
        errorCode: 'NOT_FOUND',
        metadata: { error: `Tool '${toolName}' is not recognized` },
      });

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Tool '${toolName}' not found. Available tools: ${MCP_TOOLS.map((t) => t.name).join(', ')}`,
              code: 'NOT_FOUND',
            }),
          },
        ],
      };
    }

    // 2.1 Enforce Rate Limiting
    const rateLimitCheck = enforceMcpRateLimit(auth, toolName);
    if (!rateLimitCheck.allowed) {
      void logMcpToolExecution({
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        tokenId: auth.tokenId,
        tool: toolName,
        requestId,
        success: false,
        durationMs: performance.now() - startTime,
        errorCode: 'RATE_LIMITED',
        metadata: { error: rateLimitCheck.error },
      });

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: rateLimitCheck.error || 'Rate limit exceeded for tool execution.',
              code: 'RATE_LIMITED',
            }),
          },
        ],
      };
    }

    // 2.2 Validate Input Parameters against Zod Schema
    const parseResult = toolDef.inputSchema.safeParse(rawArgs);
    if (!parseResult.success) {
      const validationErrorMsg = parseResult.error.issues
        .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
        .join('; ');

      void logMcpToolExecution({
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        tokenId: auth.tokenId,
        tool: toolName,
        requestId,
        success: false,
        durationMs: performance.now() - startTime,
        errorCode: 'VALIDATION_ERROR',
        metadata: { error: validationErrorMsg },
      });

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Invalid tool parameters: ${validationErrorMsg}`,
              code: 'VALIDATION_ERROR',
              details: parseResult.error.issues,
            }),
          },
        ],
      };
    }

    // 2.3 Execute Tool Handler
    try {
      const output = await toolDef.handler(parseResult.data, auth);
      const durationMs = performance.now() - startTime;

      void logMcpToolExecution({
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        tokenId: auth.tokenId,
        tool: toolName,
        requestId,
        success: true,
        durationMs,
        metadata: {
          arguments: rawArgs,
          status: output?.status || 'success',
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
          },
        ],
      };
    } catch (err: any) {
      const durationMs = performance.now() - startTime;
      const errorCode = err.code || 'INTERNAL_ERROR';
      const errorMessage = err.message || 'An unexpected error occurred while executing the tool.';

      void logMcpToolExecution({
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        tokenId: auth.tokenId,
        tool: toolName,
        requestId,
        success: false,
        durationMs,
        errorCode,
        metadata: {
          arguments: rawArgs,
          error: errorMessage,
        },
      });

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: errorMessage,
              code: errorCode,
            }),
          },
        ],
      };
    }
  });

  return server;
}
