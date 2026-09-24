import { reportClientError } from './lib/logging/client';

// Runs in the browser before the app becomes interactive: send uncaught errors to the master-only system log.
window.addEventListener('error', (event) => {
  // Cross-origin scripts (analytics, reCAPTCHA) only ever produce an opaque "Script error." with no detail: not actionable.
  if (!event.message || event.message === 'Script error.') return;
  if (event.filename && !event.filename.startsWith(window.location.origin)) return;
  reportClientError({
    kind: 'error',
    message: event.message,
    name: event.error?.name,
    stack: event.error?.stack,
    source: event.filename ? new URL(event.filename).pathname : undefined,
    line: event.lineno,
    column: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason: unknown = event.reason;
  const message = reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : 'Unhandled promise rejection';
  reportClientError({
    kind: 'unhandledrejection',
    message,
    name: reason instanceof Error ? reason.name : undefined,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});
