import { AsyncLocalStorage } from 'node:async_hooks';

/** Who and what the current request is, so any log line written while serving it carries the same identifiers. */
export interface LogContext {
  requestId: string;
  method?: string;
  route?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  deployment?: string;
  userId?: string;
  workspaceId?: string;
  role?: string;
  /** Set once a flush has been scheduled for this request, so a request causes at most one batched write. */
  flushScheduled?: boolean;
}

const storage = new AsyncLocalStorage<LogContext>();

export function getLogContext(): LogContext | undefined {
  return storage.getStore();
}

export function runWithLogContext<T>(ctx: LogContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function updateLogContext(patch: Partial<LogContext>): void {
  const ctx = storage.getStore();
  if (ctx) Object.assign(ctx, patch);
}
