/**
 * Raised when a booking write cannot be made safely because Postgres, the only place that enforces
 * "no two bookings overlap", is unavailable while the deployment requires it (DB_RELATIONAL_MODE=true).
 * Callers should answer with HTTP 503 and let the visitor retry; the booking is never written elsewhere.
 */
export class BookingUnavailableError extends Error {
  readonly code = 'DB_UNAVAILABLE' as const;

  constructor(message = 'Booking is temporarily unavailable. Please try again in a moment.', options?: { cause?: unknown }) {
    super(message);
    this.name = 'BookingUnavailableError';
    if (options && 'cause' in options) (this as { cause?: unknown }).cause = options.cause;
  }
}
