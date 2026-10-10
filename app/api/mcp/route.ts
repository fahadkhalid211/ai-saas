import { NextRequest, NextResponse } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { authenticateMcpRequest } from '@/lib/mcp/auth';
import { createCresceloMcpServer } from '@/lib/mcp/server';
import { MCP_TOOLS } from '@/lib/mcp/tools';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, mcp-session-id, mcp-protocol-version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'mcp-session-id, mcp-protocol-version',
  'Access-Control-Max-Age': '86400',
};

function addCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, val] of Object.entries(CORS_HEADERS)) {
    headers.set(key, val);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  const auth = await authenticateMcpRequest(req);
  if (!auth) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message:
            'Unauthorized: Valid Crescelo MCP Bearer token or ?token= query parameter required.',
        },
        id: null,
      },
      {
        status: 401,
        headers: {
          ...CORS_HEADERS,
          'WWW-Authenticate': 'Bearer error="invalid_token"',
        },
      }
    );
  }

  const accept = req.headers.get('accept') || '';

  // If client is not requesting an SSE stream, return service health & metadata
  if (!accept.includes('text/event-stream')) {
    return NextResponse.json(
      {
        status: 'operational',
        server: 'crescelo-mcp-server',
        version: '1.0.0',
        protocol: 'mcp/1.0',
        tenant: {
          workspaceId: auth.workspaceId,
          tokenId: auth.tokenId,
          scopes: auth.scopes,
        },
        toolsCount: MCP_TOOLS.length,
        supportedTransports: ['streamable-http', 'sse'],
        documentation: 'https://www.crescelo.com/docs/mcp',
      },
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  }

  // Client requested SSE stream
  const server = createCresceloMcpServer(auth);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: false,
  });
  await server.connect(transport);

  const res = await transport.handleRequest(req);
  return addCors(res);
}

export async function POST(req: NextRequest) {
  const auth = await authenticateMcpRequest(req);
  if (!auth) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message:
            'Unauthorized: Valid Crescelo MCP Bearer token or ?token= query parameter required.',
        },
        id: null,
      },
      {
        status: 401,
        headers: {
          ...CORS_HEADERS,
          'WWW-Authenticate': 'Bearer error="invalid_token"',
        },
      }
    );
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error: Request body must be valid JSON.',
        },
        id: null,
      },
      {
        status: 400,
        headers: CORS_HEADERS,
      }
    );
  }

  // Ensure Accept header fulfills MCP SDK requirement for Streamable HTTP
  const acceptHeader = req.headers.get('accept') || '';
  let normalizedReq: Request = req;

  if (
    !acceptHeader.includes('application/json') ||
    !acceptHeader.includes('text/event-stream')
  ) {
    const newHeaders = new Headers(req.headers);
    newHeaders.set('accept', 'application/json, text/event-stream');
    normalizedReq = new Request(req.url, {
      method: req.method,
      headers: newHeaders,
    });
  }

  const server = createCresceloMcpServer(auth);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(normalizedReq, {
    parsedBody: body,
  });

  return addCors(response);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateMcpRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
  }

  const server = createCresceloMcpServer(auth);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  const res = await transport.handleRequest(req);
  return addCors(res);
}
