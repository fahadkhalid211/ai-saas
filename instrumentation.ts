import type { Instrumentation } from 'next';

/** Runs once when a server instance starts. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  // Everything the server writes with console.error / console.warn also goes to the master-only system log.
  const { installConsoleCapture } = await import('./lib/logging/console');
  installConsoleCapture();
  // Error alerts by e-mail (no-op unless enabled and e-mail sending is configured).
  const { installLogAlerts } = await import('./lib/logging/alerts');
  installLogAlerts();
}

/**
 * Called by Next.js for server errors that did not go through a wrapped route handler
 * (page rendering, server components, proxy). Handler errors are recorded by lib/logging/route.ts.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { logEvent, flushLogs } = await import('./lib/logging/logger');
  const path = (request.path || '').split('?')[0];
  logEvent({
    level: 'error',
    category: 'system',
    event: 'next.request_error',
    error: err,
    meta: {
      method: request.method,
      path,
      routePath: context.routePath,
      routeType: context.routeType,
      routerKind: context.routerKind,
      renderSource: context.renderSource,
      digest: typeof err === 'object' && err !== null && 'digest' in err ? String((err as { digest: unknown }).digest) : undefined,
    },
  });
  await flushLogs();
};
