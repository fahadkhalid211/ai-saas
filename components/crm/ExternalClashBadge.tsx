import { T } from '@/lib/i18n/context';
import React from 'react';
import { TriangleAlert } from 'lucide-react';

/**
 * Shown on a booking that the scheduled check found overlapping an event in the owner's linked calendar (`externalClashAt`). Icon and text,
 * not colour alone; the booking itself is never changed automatically.
 */
export function ExternalClashBadge({ clashAt }: { clashAt?: string | null }) {
  if (!clashAt) return null;
  return (
    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
      <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span><T>Clashes with an event in your calendar</T></span>
    </span>
  );
}
