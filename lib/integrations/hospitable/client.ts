/**
 * Hospitable Public API v2 client.
 *
 * Base URL : https://public.api.hospitable.com/v2
 * Auth     : Bearer <access_token>  (PAT or OAuth2 access token)
 * Docs     : https://developer.hospitable.com
 *
 * NOTE: API access requires a paid Hospitable plan (Host / Professional / Mogul).
 *       The free Essentials plan does NOT grant API access.
 */

const BASE_URL = 'https://public.api.hospitable.com/v2';

// ---------------------------------------------------------------------------
// Error classes
// ---------------------------------------------------------------------------

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`Hospitable API: rate limited. Retry after ${retryAfterSeconds}s`);
    this.name = 'RateLimitError';
  }
}

export class HospitableApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`Hospitable API error ${status}: ${body}`);
    this.name = 'HospitableApiError';
  }
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '60', 10);
    throw new RateLimitError(isNaN(retryAfter) ? 60 : retryAfter);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new HospitableApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Hospitable response types
// ---------------------------------------------------------------------------

export interface HospitableProperty {
  id: string;
  name: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    lat?: number;
    lng?: number;
  };
  amenities?: string[];
  photos?: Array<{ url: string } | string>;
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  currency?: string;
  base_nightly_rate?: number;
  weekend_rate?: number;
  cleaning_fee?: number;
  min_stay?: number;
  max_stay?: number;
  /** Direct booking link for this property */
  booking_link?: string;
}

export interface HospitableCalendarDay {
  /** ISO date string YYYY-MM-DD */
  date: string;
  available: boolean;
  min_stay?: number;
  nightly_price?: number;
}

export interface HospitablePricing {
  currency: string;
  base_nightly_rate?: number;
  weekend_rate?: number;
  cleaning_fee?: number;
  extra_guest_fee?: number;
  pet_fee?: number;
  resort_fee?: number;
  security_deposit?: number;
  /** Seasonal / special pricing rules */
  rules?: Array<{
    type: string;
    start_date?: string;
    end_date?: string;
    amount: number;
  }>;
}

export interface HospitableReservation {
  id: string;
  property_id: string;
  guest?: {
    name?: string;
    email?: string;
  };
  /** ISO date YYYY-MM-DD */
  check_in: string;
  /** ISO date YYYY-MM-DD */
  check_out: string;
  status: string;
  guest_count?: number;
  financials?: {
    total?: number;
    currency?: string;
  };
  /** Booking source: 'airbnb' | 'vrbo' | 'booking_com' | 'direct' | ... */
  channel?: string;
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

/** List all properties in the connected Hospitable account */
export async function listProperties(token: string) {
  return request<{ data: HospitableProperty[] }>('/properties', token);
}

/** Get a single property by its Hospitable ID */
export async function getProperty(token: string, hospId: string) {
  return request<{ data: HospitableProperty }>(`/properties/${hospId}`, token);
}

/**
 * Get the availability calendar for a property over a date range.
 * @param startDate ISO date YYYY-MM-DD
 * @param endDate   ISO date YYYY-MM-DD (exclusive upper bound)
 */
export async function getPropertyCalendar(
  token: string,
  hospPropertyId: string,
  startDate: string,
  endDate: string
) {
  const qs = new URLSearchParams({ start: startDate, end: endDate }).toString();
  return request<{ data: HospitableCalendarDay[] }>(
    `/properties/${hospPropertyId}/calendar?${qs}`,
    token
  );
}

/** Get pricing rules for a property */
export async function getPropertyPricing(token: string, hospPropertyId: string) {
  return request<{ data: HospitablePricing }>(
    `/properties/${hospPropertyId}/pricing`,
    token
  );
}

/**
 * List reservations with optional filter params.
 * Supported params: status, property_id, check_in_from, check_in_to, include, page, per_page
 */
export async function listReservations(
  token: string,
  params?: Record<string, string>
) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return request<{ data: HospitableReservation[]; meta?: Record<string, unknown> }>(
    `/reservations${qs}`,
    token
  );
}

/**
 * Validate a token by listing properties. Returns true if the token is valid.
 * Used during the onboarding connect flow.
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    await listProperties(token);
    return true;
  } catch (err) {
    if (err instanceof HospitableApiError && err.status === 401) return false;
    throw err;
  }
}
