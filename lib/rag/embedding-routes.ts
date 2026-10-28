/**
 * The API routes that run the embedding model (they import lib/rag/embedder, directly or through other modules).
 *
 * The model runs on onnxruntime, a native library that Next.js cannot find by itself, so next.config.ts adds it to the server
 * functions of exactly these routes. It used to be added to every API route (97 of them): each function then carried tens of
 * megabytes it never used, which multiplied storage and slowed every cold start.
 *
 * A route missing from this list does not fail loudly: it quietly falls back to stand-in vectors and answers get worse.
 * lib/rag/embedding-routes.test.ts reads the source and fails when a route that uses the embedder is not listed.
 */
export const EMBEDDING_ROUTES: string[] = [
  '/api/analytics/unanswered',
  '/api/channels/instagram',
  '/api/channels/telegram',
  '/api/channels/tiktok',
  '/api/channels/whatsapp',
  '/api/chat',
  '/api/connectors/hospitable/sync',
  '/api/connectors/shopify/sync',
  '/api/connectors/wordpress/sync',
  '/api/connectors/wordpress/sync-item',
  '/api/cron/hospitable-sync',
  '/api/cron/recrawl',
  '/api/cron/reembed',
  '/api/knowledge/correct',
  '/api/knowledge/search',
  '/api/knowledge/upload',
  '/api/knowledge/url',
  '/api/mcp',
  '/api/templates',
  '/api/voice/end',
  '/api/voice/session',
  '/api/voice/turn',
  '/api/webhook/hospitable',
];

export const ONNX_RUNTIME_FILES = './node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*';
