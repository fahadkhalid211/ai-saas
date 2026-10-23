import { isBookingUnavailable } from '@/lib/appointments/errors';
import type { McpErrorCode } from './types';

/** Message for a booking change refused because the database that prevents double bookings is unavailable. */
export const MCP_SERVICE_UNAVAILABLE_MESSAGE = 'Bookings are temporarily unavailable. Nothing was changed; please try again in a minute.';

/**
 * The MCP error code for an error thrown by a tool. The database layer's DB_UNAVAILABLE is not an MCP code, so it is
 * reported as SERVICE_UNAVAILABLE; any other code the tool set is kept, and an error without one is INTERNAL_ERROR.
 */
export function toMcpErrorCode(err: unknown): McpErrorCode | string {
  if (isBookingUnavailable(err)) return 'SERVICE_UNAVAILABLE';
  const code = (err as { code?: unknown } | null | undefined)?.code;
  return typeof code === 'string' && code ? code : 'INTERNAL_ERROR';
}

/** Rethrows a DB_UNAVAILABLE refusal as an MCP SERVICE_UNAVAILABLE error with a retry message; other errors unchanged. */
export function asMcpError(err: unknown): unknown {
  if (!isBookingUnavailable(err)) return err;
  const error: Error & { code?: McpErrorCode } = new Error(MCP_SERVICE_UNAVAILABLE_MESSAGE);
  error.code = 'SERVICE_UNAVAILABLE';
  return error;
}
