import { addDays, isIsoDate, minutesToHHMM, parseTimeToMinutes, WEEKDAYS } from '@/lib/appointments/availability';

/**
 * Deterministic parsing of what callers say (speech-to-text output) into dates, times and yes/no.
 * The booking flow trusts these parsers, not the language model, so a booking can never come from a guess.
 */

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_ABBR: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };

const NUM_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
};

const ORDINAL_WORDS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
  thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20,
  'twenty first': 21, 'twenty second': 22, 'twenty third': 23, 'twenty fourth': 24, 'twenty fifth': 25, 'twenty sixth': 26,
  'twenty seventh': 27, 'twenty eighth': 28, 'twenty ninth': 29, thirtieth: 30, 'thirty first': 31,
};

/** Turns spoken number words into digits: "ten thirty" -> "10 30", "twenty five" -> "25". */
export function wordsToDigits(input: string): string {
  const tokens = input.toLowerCase().replace(/[,]/g, ' ').split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    if (t in NUM_WORDS && NUM_WORDS[t] >= 20 && next && next in ORDINAL_WORDS) {
      // "twenty second" is an ordinal date, not 20 then something else: keep both words for ordinalDay()
      out.push(t, next);
      i++;
    } else if (t in NUM_WORDS && NUM_WORDS[t] >= 20 && next && next in NUM_WORDS && NUM_WORDS[next] > 0 && NUM_WORDS[next] < 10) {
      out.push(String(NUM_WORDS[t] + NUM_WORDS[next]));
      i++;
    } else if (t in NUM_WORDS) {
      out.push(String(NUM_WORDS[t]));
    } else {
      out.push(t);
    }
  }
  return out.join(' ');
}

function ordinalDay(text: string): number | null {
  const numeric = text.match(/\b(\d{1,2})(?:st|nd|rd|th)\b/);
  if (numeric) return Number(numeric[1]);
  for (const key of Object.keys(ORDINAL_WORDS).sort((a, b) => b.length - a.length)) {
    if (new RegExp(`\\b${key}\\b`).test(text)) return ORDINAL_WORDS[key];
  }
  return null;
}

function monthIndex(text: string): number | null {
  for (let i = 0; i < MONTHS.length; i++) if (new RegExp(`\\b${MONTHS[i]}\\b`).test(text)) return i;
  for (const [abbr, idx] of Object.entries(MONTH_ABBR)) if (new RegExp(`\\b${abbr}\\b\\.?`).test(text)) return idx;
  return null;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function makeIso(year: number, month: number, day: number): string | null {
  if (day < 1 || month < 0 || month > 11 || day > daysInMonth(year, month)) return null;
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Interprets a spoken date relative to today (ISO, in the business timezone). Returns null when unclear. */
export function parseSpokenDate(input: string, todayIso: string): string | null {
  if (!isIsoDate(todayIso)) return null;
  const text = ` ${wordsToDigits(input).replace(/[.,!?]/g, ' ')} `.toLowerCase().replace(/\s+/g, ' ');
  const [ty, tm, td] = todayIso.split('-').map(Number);

  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso && isIsoDate(iso[0])) return iso[0];

  if (/\bday after tomorrow\b/.test(text)) return addDays(todayIso, 2);
  if (/\btomorrow\b/.test(text)) return addDays(todayIso, 1);
  if (/\b(today|tonight|this evening|this afternoon|this morning)\b/.test(text)) return todayIso;
  const inDays = text.match(/\bin (\d{1,2}) days?\b/);
  if (inDays) return addDays(todayIso, Number(inDays[1]));
  if (/\bnext week\b/.test(text) && !WEEKDAYS.some((w) => text.includes(w.toLowerCase()))) return addDays(todayIso, 7);

  // Month + day ("september 22", "22nd of september", "sept 22nd")
  const mIdx = monthIndex(text);
  if (mIdx !== null) {
    const dayMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
    const day = dayMatch ? Number(dayMatch[1]) : ordinalDay(text);
    if (day) {
      let year = ty;
      let candidate = makeIso(year, mIdx, day);
      if (candidate && candidate < todayIso) candidate = makeIso(++year, mIdx, day);
      return candidate;
    }
  }

  // Numeric "9/22" or "22/9" or "9-22"
  const slash = text.match(/\b(\d{1,2})[/-](\d{1,2})\b/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    let month = a - 1;
    let day = b;
    if (a > 12 && b <= 12) {
      month = b - 1;
      day = a;
    }
    let year = ty;
    let candidate = makeIso(year, month, day);
    if (candidate && candidate < todayIso) candidate = makeIso(++year, month, day);
    return candidate;
  }

  // Weekday ("monday", "next friday", "this wednesday")
  for (let i = 0; i < 7; i++) {
    const name = WEEKDAYS[i].toLowerCase();
    if (new RegExp(`\\b${name}\\b`).test(text)) {
      const todayDow = new Date(Date.UTC(ty, tm - 1, td)).getUTCDay();
      let delta = (i - todayDow + 7) % 7;
      if (delta === 0 && !/\b(this|today)\b/.test(text)) delta = 7;
      if (/\bnext\b/.test(text) && delta < 7 && new RegExp(`next ${name}`).test(text) && delta <= 0) delta += 7;
      return addDays(todayIso, delta);
    }
  }

  // Bare ordinal ("the 25th")
  const bare = ordinalDay(text);
  if (bare) {
    let year = ty;
    let month = tm - 1;
    let candidate = makeIso(year, month, bare);
    if (!candidate || candidate < todayIso) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      candidate = makeIso(year, month, bare);
    }
    return candidate;
  }
  return null;
}

export type DayPart = 'morning' | 'afternoon' | 'evening';

export function parseDayPart(input: string): DayPart | null {
  const t = input.toLowerCase();
  if (/\b(morning|early)\b/.test(t)) return 'morning';
  if (/\b(afternoon|after lunch|lunchtime|midday)\b/.test(t)) return 'afternoon';
  if (/\b(evening|late|after work|night)\b/.test(t)) return 'evening';
  return null;
}

export function filterByDayPart(slots: string[], part: DayPart): string[] {
  return slots.filter((s) => {
    const m = parseTimeToMinutes(s);
    if (m === null) return false;
    if (part === 'morning') return m < 12 * 60;
    if (part === 'afternoon') return m >= 12 * 60 && m < 17 * 60;
    return m >= 17 * 60;
  });
}

/** Extracts a time of day as minutes from midnight, with a flag for whether am/pm was said. */
export function parseSpokenTime(input: string): { minutes: number; explicitMeridiem: boolean } | null {
  let t = ` ${wordsToDigits(input).replace(/[.,!?]/g, ' ')} `.toLowerCase().replace(/\s+/g, ' ');
  t = t.replace(/\ba\.?m\.?\b/g, 'am').replace(/\bp\.?m\.?\b/g, 'pm');

  const half = t.match(/\bhalf past (\d{1,2})\b/);
  const quarterPast = t.match(/\bquarter past (\d{1,2})\b/);
  const quarterTo = t.match(/\bquarter (?:to|of) (\d{1,2})\b/);
  const mer = t.match(/\b(am|pm|in the morning|in the afternoon|in the evening|at night)\b/);
  const meridiem = mer ? (mer[1] === 'am' || mer[1] === 'in the morning' ? 'am' : 'pm') : null;

  let h: number | null = null;
  let m = 0;
  if (half) {
    h = Number(half[1]);
    m = 30;
  } else if (quarterPast) {
    h = Number(quarterPast[1]);
    m = 15;
  } else if (quarterTo) {
    h = Number(quarterTo[1]) - 1;
    m = 45;
  } else {
    const colon = t.match(/\b(\d{1,2}):(\d{2})\b/);
    const spaced = t.match(/\b(\d{1,2}) (\d{2})\b(?!\s*(?:st|nd|rd|th|days?))/);
    const plain = t.match(/\b(\d{1,2})(?:\s*o'?clock)?\s*(?:am|pm)?\b/);
    if (colon) {
      h = Number(colon[1]);
      m = Number(colon[2]);
    } else if (spaced && Number(spaced[2]) < 60) {
      h = Number(spaced[1]);
      m = Number(spaced[2]);
    } else if (plain) {
      h = Number(plain[1]);
    }
  }
  if (h === null || m > 59) return null;
  if (meridiem) {
    if (h < 1 || h > 12) return h <= 23 ? { minutes: h * 60 + m, explicitMeridiem: true } : null;
    if (meridiem === 'am') h = h === 12 ? 0 : h;
    else h = h === 12 ? 12 : h + 12;
    return { minutes: h * 60 + m, explicitMeridiem: true };
  }
  if (h > 23) return null;
  return { minutes: h * 60 + m, explicitMeridiem: h > 12 || h === 0 };
}

/**
 * Chooses one of the offered slots from what the caller said: "the second one", "10:30", "two pm", "the last one".
 * Bare hours like "2" are matched against the offered slots (so "2" means 14:00 when only 14:00 is on offer).
 */
export function pickSlot(input: string, offered: string[]): string | null {
  if (!offered.length) return null;
  const text = input.toLowerCase();

  if (/\b(last one|the last|latest)\b/.test(text)) return offered[offered.length - 1];
  if (/\b(first one|the first|earliest|the earliest|first)\b/.test(text) && !/\d/.test(text)) return offered[0];
  const ord = ordinalDay(wordsToDigits(text).replace(/\bone\b/g, ''));
  if (ord && ord >= 1 && ord <= offered.length && /\b(one|option|slot|first|second|third|fourth|fifth|\dth|\d(?:st|nd|rd))\b/.test(text)) return offered[ord - 1];

  const parsed = parseSpokenTime(input);
  if (!parsed) return null;
  const want = parsed.minutes;
  const exact = offered.find((s) => parseTimeToMinutes(s) === want);
  if (exact) return exact;
  if (!parsed.explicitMeridiem) {
    // "2" could be 14:00; "10" could be 10:00 or 22:00. Match the hour on the 12-hour clock among offered slots.
    const matches = offered.filter((s) => {
      const m = parseTimeToMinutes(s);
      return m !== null && m % 60 === want % 60 && (Math.floor(m / 60) - Math.floor(want / 60)) % 12 === 0;
    });
    if (matches.length === 1) return matches[0];
  }
  return null;
}

export function parseYesNo(input: string): 'yes' | 'no' | null {
  const t = ` ${input.toLowerCase().replace(/[.,!?]/g, ' ')} `;
  const no = /\b(no|nope|nah|not really|don'?t|do not|wrong|incorrect|change|different|cancel that|not right|that'?s not)\b/.test(t);
  const yes = /\b(yes|yeah|yep|yup|sure|correct|that'?s right|right|ok|okay|please do|go ahead|book it|sounds good|perfect|confirm|absolutely|definitely|of course)\b/.test(t);
  if (no && !yes) return 'no';
  if (yes && !no) return 'yes';
  if (yes && no) return /\b(yes|yeah|sure|correct|go ahead)\b/.test(t.split(/\b(?:but|however)\b/)[0]) ? 'yes' : 'no';
  return null;
}

export { minutesToHHMM };
