/**
 * Lower bound for reading external calendar blocks for one date: the start of that date minus one day, as a UTC instant built
 * from the date text (never "now"). The day of slack covers every time-zone offset (at most 14 hours), so no block that can touch
 * the date is left out, while a tenant with 100,000 stored blocks is not read in full on every booking.
 * Undefined (no bound, read everything) when the text is not a real YYYY-MM-DD date.
 */
export function blocksLowerBound(date: string | null | undefined): Date | undefined {
  const m = typeof date === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim()) : null;
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const day = new Date(Date.UTC(y, mo - 1, d));
  if (day.getUTCFullYear() !== y || day.getUTCMonth() !== mo - 1 || day.getUTCDate() !== d) return undefined;
  return new Date(day.getTime() - 86_400_000);
}
