/**
 * Pure logic for scripts/backfill-slot-ranges.ts (no database access here, so it is testable).
 */

import { slotRange } from './time-range';

/** Host name of a connection URL (never the password), or null when the URL cannot be parsed or has no host. */
export function parseDbHost(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Assistant id -> timezone (undefined when the assistant has none) from the `assistants` array of the stored app state.
 * Returns null when the value is not an array, so the caller can abort instead of guessing.
 */
export function assistantTimezones(assistants: unknown): Map<string, string | undefined> | null {
  if (!Array.isArray(assistants)) return null;
  const map = new Map<string, string | undefined>();
  for (const a of assistants) {
    if (!a || typeof a !== 'object') continue;
    const { id, timezone } = a as { id?: unknown; timezone?: unknown };
    if (typeof id !== 'string' || !id) continue;
    map.set(id, typeof timezone === 'string' && timezone ? timezone : undefined);
  }
  return map;
}

export interface BackfillRow {
  id: string;
  assistant_id: string;
  date: string;
  time_slot: string;
  duration_minutes: number | null;
  status: string;
}

export interface PlannedUpdate {
  id: string;
  assistantId: string;
  date: string;
  timeSlot: string;
  timezone: string | undefined;
  slotStart: string;
  slotEnd: string;
}

export interface BackfillPlan {
  planned: PlannedUpdate[];
  unreadable: BackfillRow[];
  unknownAssistant: BackfillRow[];
}

/** Splits rows into ranges to write, rows whose time cannot be read, and rows whose assistant is not known. */
export function planBackfill(rows: BackfillRow[], timezoneById: Map<string, string | undefined>): BackfillPlan {
  const plan: BackfillPlan = { planned: [], unreadable: [], unknownAssistant: [] };
  for (const row of rows) {
    if (!timezoneById.has(row.assistant_id)) {
      plan.unknownAssistant.push(row);
      continue;
    }
    const timezone = timezoneById.get(row.assistant_id);
    const range = slotRange(row.date, row.time_slot, row.duration_minutes ?? undefined, timezone);
    if (!range) {
      plan.unreadable.push(row);
      continue;
    }
    plan.planned.push({
      id: row.id,
      assistantId: row.assistant_id,
      date: row.date,
      timeSlot: row.time_slot,
      timezone,
      slotStart: range.start.toISOString(),
      slotEnd: range.end.toISOString(),
    });
  }
  return plan;
}
