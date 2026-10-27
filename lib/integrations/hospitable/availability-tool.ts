/**
 * Availability & Pricing Tool for the Hospitable integration.
 *
 * Queries the locally-synced hospitable_calendar and hospitable_properties
 * tables — sub-5ms, zero external API calls, works offline.
 *
 * Called by the chat route when availability intent is detected.
 */

import { getPostgresPool } from '@/lib/db/postgres';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AvailabilityQuery {
  /** The assistant ID (used to scope to the right tenant) */
  assistantId: string;
  /** ISO date YYYY-MM-DD */
  checkIn: string;
  /** ISO date YYYY-MM-DD */
  checkOut: string;
  /** Optional partial property name for filtering */
  propertyName?: string;
  /** Optional guest count for filtering by max_guests */
  guests?: number;
}

export interface AvailabilityResult {
  propertyName: string;
  propertyId: string;
  available: boolean;
  checkIn: string;
  checkOut: string;
  nights: number;
  /** Average nightly rate over the requested period */
  nightlyRate: number | null;
  cleaningFee: number | null;
  /** Estimated total (nightly * nights + cleaning) */
  totalEstimate: number | null;
  currency: string;
  bookingUrl: string | null;
  minStay: number;
  minStayViolation: boolean;
  unavailableDates: string[];
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/**
 * Check real-time availability and pricing for all properties belonging
 * to the tenant associated with the given assistant.
 */
export async function checkAvailability(
  query: AvailabilityQuery
): Promise<AvailabilityResult[]> {
  const pool = getPostgresPool();
  if (!pool) {
    console.warn('[hospitable] No PostgreSQL pool available for availability check');
    return [];
  }

  const client = await pool.connect();
  try {
    // 1. Find properties for this assistant's tenant
    const propSql = query.propertyName
      ? `SELECT hp.id, hp.name, hp.currency, hp.base_nightly_rate, hp.weekend_rate,
                hp.cleaning_fee, hp.min_stay, hp.max_stay, hp.booking_url, hp.max_guests
           FROM hospitable_properties hp
           JOIN hospitable_tenants ht ON ht.id = hp.tenant_id
           WHERE ht.assistant_id = $1
             AND LOWER(hp.name) LIKE LOWER($2)
           LIMIT 10`
      : `SELECT hp.id, hp.name, hp.currency, hp.base_nightly_rate, hp.weekend_rate,
                hp.cleaning_fee, hp.min_stay, hp.max_stay, hp.booking_url, hp.max_guests
           FROM hospitable_properties hp
           JOIN hospitable_tenants ht ON ht.id = hp.tenant_id
           WHERE ht.assistant_id = $1
           LIMIT 20`;

    const propParams = query.propertyName
      ? [query.assistantId, `%${query.propertyName}%`]
      : [query.assistantId];

    const { rows: properties } = await client.query(propSql, propParams);

    if (properties.length === 0) return [];

    // 2. Calculate nights
    const checkInDate = new Date(query.checkIn);
    const checkOutDate = new Date(query.checkOut);
    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000
    );

    if (nights <= 0) return [];

    const results: AvailabilityResult[] = [];

    for (const prop of properties) {
      // Skip if guest count exceeds max_guests
      if (query.guests && prop.max_guests && query.guests > prop.max_guests) {
        continue;
      }

      // 3. Get calendar days for the stay
      const { rows: calDays } = await client.query(
        `SELECT date::text, available, min_stay, nightly_price
         FROM hospitable_calendar
         WHERE property_id = $1
           AND date >= $2::date
           AND date <  $3::date
         ORDER BY date`,
        [prop.id, query.checkIn, query.checkOut]
      );

      const unavailableDates = calDays
        .filter((d: any) => !d.available)
        .map((d: any) => d.date);

      // Check if all nights are covered (synced) and available
      const allAvailable =
        calDays.length === nights && unavailableDates.length === 0;

      // Min stay — use calendar's min_stay if present, fall back to property's
      const minStay =
        calDays.length > 0 && calDays[0].min_stay != null
          ? Number(calDays[0].min_stay)
          : Number(prop.min_stay ?? 1);
      const minStayViolation = nights < minStay;

      // 4. Calculate pricing
      let nightlyRate: number | null = null;
      if (calDays.length > 0) {
        const total = calDays.reduce(
          (sum: number, d: any) =>
            sum + (d.nightly_price != null ? Number(d.nightly_price) : Number(prop.base_nightly_rate ?? 0)),
          0
        );
        nightlyRate = total / calDays.length;
      } else if (prop.base_nightly_rate != null) {
        nightlyRate = Number(prop.base_nightly_rate);
      }

      const cleaningFee =
        prop.cleaning_fee != null ? Number(prop.cleaning_fee) : null;
      const totalEstimate =
        nightlyRate != null
          ? nightlyRate * nights + (cleaningFee ?? 0)
          : null;

      results.push({
        propertyName: prop.name,
        propertyId: prop.id,
        available: allAvailable && !minStayViolation,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        nights,
        nightlyRate: nightlyRate !== null ? parseFloat(nightlyRate.toFixed(2)) : null,
        cleaningFee: cleaningFee !== null ? parseFloat(cleaningFee.toFixed(2)) : null,
        totalEstimate:
          totalEstimate !== null ? parseFloat(totalEstimate.toFixed(2)) : null,
        currency: prop.currency ?? 'USD',
        bookingUrl: prop.booking_url ?? null,
        minStay,
        minStayViolation,
        unavailableDates,
      });
    }

    return results;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Formatter (for injecting into system prompt context)
// ---------------------------------------------------------------------------

export function formatAvailabilityContext(results: AvailabilityResult[]): string {
  if (results.length === 0) return '';

  const lines: string[] = ['=== LIVE AVAILABILITY DATA (from Property Management System) ==='];

  for (const r of results) {
    lines.push('');
    lines.push(`Property: ${r.propertyName}`);
    lines.push(`Check-in: ${r.checkIn}  |  Check-out: ${r.checkOut}  (${r.nights} night${r.nights !== 1 ? 's' : ''})`);

    if (r.minStayViolation) {
      lines.push(`Status: ⚠️ MINIMUM STAY REQUIREMENT: ${r.minStay} nights (requested: ${r.nights})`);
    } else {
      lines.push(`Status: ${r.available ? '✅ AVAILABLE' : '❌ NOT AVAILABLE'}`);
      if (!r.available && r.unavailableDates.length > 0) {
        lines.push(`Blocked dates: ${r.unavailableDates.slice(0, 5).join(', ')}${r.unavailableDates.length > 5 ? '…' : ''}`);
      }
    }

    lines.push(`Nightly rate: ${r.currency} ${r.nightlyRate?.toFixed(2) ?? 'Contact host'}`);
    if (r.cleaningFee != null && r.cleaningFee > 0) {
      lines.push(`Cleaning fee: ${r.currency} ${r.cleaningFee.toFixed(2)}`);
    }
    if (r.totalEstimate != null) {
      lines.push(`Estimated total: ${r.currency} ${r.totalEstimate.toFixed(2)}`);
    }
    if (r.available && r.bookingUrl) {
      lines.push(`Book here: ${r.bookingUrl}`);
    }
    lines.push('---');
  }

  return lines.join('\n');
}
