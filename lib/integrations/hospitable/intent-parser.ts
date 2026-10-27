/**
 * Hospitable intent detection and date extraction utilities.
 *
 * Lightweight, zero-LLM, regex-based fast path for detecting availability
 * questions and extracting date ranges from guest messages.
 *
 * Falls back gracefully when dates are ambiguous — the LLM handles those cases.
 */

// ---------------------------------------------------------------------------
// Intent detection
// ---------------------------------------------------------------------------

const AVAILABILITY_PATTERNS = [
  /\b(available|availability|availab)\b/i,
  /\b(check.?in|check.?out)\b/i,
  /\b(book|reserve|reservation|booking)\b/i,
  /\b(free|open|vacant|vacancy|vacancies)\b/i,
  /\b(stay|nights?|weekend|week)\b.*\b(from|to|between|at)\b/i,
  /\b(is|are).+\b(available|free|open)\b/i,
  /\bhow much.*(stay|night|week)/i,
  /\bprice.*(stay|night|from|to)\b/i,
];

/**
 * Returns true if the guest message appears to be asking about
 * property availability, pricing for a date range, or booking.
 */
export function detectAvailabilityIntent(text: string): boolean {
  return AVAILABILITY_PATTERNS.some((pattern) => pattern.test(text));
}

// ---------------------------------------------------------------------------
// Date extraction
// ---------------------------------------------------------------------------

export interface DateExtraction {
  /** ISO date YYYY-MM-DD */
  checkIn: string;
  /** ISO date YYYY-MM-DD */
  checkOut: string;
  /** Partial property name hint extracted from the message, if any */
  propertyName?: string;
  /** Guest count if mentioned */
  guests?: number;
}

const MONTH_MAP: Record<string, string> = {
  january: '01', jan: '01',
  february: '02', feb: '02',
  march: '03', mar: '03',
  april: '04', apr: '04',
  may: '05',
  june: '06', jun: '06',
  july: '07', jul: '07',
  august: '08', aug: '08',
  september: '09', sep: '09', sept: '09',
  october: '10', oct: '10',
  november: '11', nov: '11',
  december: '12', dec: '12',
};

function pad(n: number | string): string {
  return String(n).padStart(2, '0');
}

function resolveMonth(token: string): string | null {
  const lower = token.toLowerCase();
  return MONTH_MAP[lower] ?? null;
}

/** Add days to an ISO date string */
function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextWeekday(dayName: string, fromDate?: string): string {
  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const target = DAYS.indexOf(dayName.toLowerCase());
  if (target === -1) return todayISO();
  const base = fromDate ? new Date(fromDate) : new Date();
  const current = base.getUTCDay();
  const diff = ((target - current + 7) % 7) || 7;
  base.setUTCDate(base.getUTCDate() + diff);
  return base.toISOString().slice(0, 10);
}

/**
 * Attempt to extract check-in / check-out dates from free-form text.
 * Returns null if no dates can be reliably determined.
 *
 * Supported formats:
 *  - "2024-12-20 to 2024-12-27"
 *  - "December 20 to December 27"
 *  - "Dec 20 - Jan 3"
 *  - "next weekend"
 *  - "this Friday to Sunday"
 *  - "from Friday to Monday"
 */
export function extractDates(text: string): DateExtraction | null {
  const year = new Date().getFullYear();

  // ── ISO range: 2024-12-20 to 2024-12-27 ──────────────────────────────────
  const isoRange = text.match(
    /(\d{4}-\d{2}-\d{2})\s*(?:to|through|–|-)\s*(\d{4}-\d{2}-\d{2})/i
  );
  if (isoRange) {
    return { checkIn: isoRange[1], checkOut: isoRange[2] };
  }

  // ── Month-day ranges: "Dec 20 to Dec 27" or "December 20 - January 3" ────
  const monthDayRange = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|through|–|-)\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)?\s*(\d{1,2})(?:st|nd|rd|th)?\b/i
  );
  if (monthDayRange) {
    const m1 = resolveMonth(monthDayRange[1]);
    const d1 = parseInt(monthDayRange[2]);
    const m2 = monthDayRange[3] ? resolveMonth(monthDayRange[3]) : m1;
    const d2 = parseInt(monthDayRange[4]);
    if (m1 && m2) {
      const ciYear = year;
      const coYear = m2 < m1! ? year + 1 : year; // wrap into next year if needed
      return {
        checkIn: `${ciYear}-${m1}-${pad(d1)}`,
        checkOut: `${coYear}-${m2}-${pad(d2)}`,
      };
    }
  }

  // ── "next weekend" ────────────────────────────────────────────────────────
  if (/\bnext\s+weekend\b/i.test(text)) {
    const friday = nextWeekday('friday');
    const sunday = addDays(friday, 2);
    return { checkIn: friday, checkOut: sunday };
  }

  // ── "this weekend" ────────────────────────────────────────────────────────
  if (/\bthis\s+weekend\b/i.test(text)) {
    const today = new Date();
    const day = today.getUTCDay(); // 0=Sun, 6=Sat
    const daysUntilFri = day <= 5 ? 5 - day : 6;
    const friday = addDays(todayISO(), daysUntilFri === 0 ? 0 : daysUntilFri);
    const sunday = addDays(friday, 2);
    return { checkIn: friday, checkOut: sunday };
  }

  // ── Weekday range: "Friday to Monday" / "from Friday to Sunday" ───────────
  const weekdayRange = text.match(
    /\b(?:from\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:to|through|–|-)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
  );
  if (weekdayRange) {
    const friday = nextWeekday(weekdayRange[1]);
    const sunday = nextWeekday(weekdayRange[2], friday);
    return { checkIn: friday, checkOut: sunday };
  }

  // ── "next [month] for X nights/days" ─────────────────────────────────────
  const nightsMatch = text.match(/(\d+)\s*(?:nights?|days?)/i);
  const fromMatch = text.match(
    /\b(?:from|starting|arriving)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i
  );
  if (nightsMatch && fromMatch) {
    const nights = parseInt(nightsMatch[1]);
    const fromToken = fromMatch[1];
    const WDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const isWeekday = WDAYS.includes(fromToken.toLowerCase());
    if (isWeekday) {
      const checkIn = nextWeekday(fromToken);
      return { checkIn, checkOut: addDays(checkIn, nights) };
    }
  }

  return null; // Let the LLM handle it via function calling
}

// ---------------------------------------------------------------------------
// Guest count extraction
// ---------------------------------------------------------------------------

/**
 * Extract the number of guests from a message if mentioned.
 */
export function extractGuestCount(text: string): number | undefined {
  const match = text.match(/\b(\d+)\s*(?:guests?|people|persons?|adults?|pax)\b/i);
  return match ? parseInt(match[1]) : undefined;
}
