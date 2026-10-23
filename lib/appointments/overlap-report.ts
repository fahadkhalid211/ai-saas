/**
 * Finds bookings of the same assistant whose time ranges overlap. Used by the ops report that must come
 * back empty before the no-overlap database constraint can be added.
 * Ranges are half-open: [start, end), so 10:00-10:30 and 10:30-11:00 do not overlap.
 */

export interface RangeRow {
  id: string;
  assistantId: string;
  slotStart: Date;
  slotEnd: Date;
}

/** Pairs of ids whose ranges overlap for the same assistant. Each pair is reported once. */
export function findOverlaps(rows: RangeRow[]): Array<[string, string]> {
  const byAssistant = new Map<string, RangeRow[]>();
  for (const r of rows) {
    const list = byAssistant.get(r.assistantId);
    if (list) list.push(r);
    else byAssistant.set(r.assistantId, [r]);
  }

  const pairs: Array<[string, string]> = [];
  for (const list of byAssistant.values()) {
    const sorted = [...list].sort((a, b) => a.slotStart.getTime() - b.slotStart.getTime());
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        // Sorted by start: once a later booking starts at or after this end, no further one can overlap it.
        if (sorted[j].slotStart.getTime() >= sorted[i].slotEnd.getTime()) break;
        pairs.push([sorted[i].id, sorted[j].id]);
      }
    }
  }
  return pairs;
}
