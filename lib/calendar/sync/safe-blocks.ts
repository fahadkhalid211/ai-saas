import { Database } from '@/lib/db';
import { logEvent } from '@/lib/logging/logger';
import type { ExternalBlock } from './types';

/**
 * External calendar blocks for a code path that only NARROWS what is offered (slot lists, the booking widget's taken times).
 * If the blocks cannot be read, an offer may show a time that the final booking check still refuses, so falling back to
 * "no blocks" is safe here. Paths that CONFIRM a booking must call Database.getExternalBlocks directly and fail closed.
 * The log line carries no URLs and no personal data.
 */
export async function getExternalBlocksOrEmpty(assistantId: string): Promise<ExternalBlock[]> {
  try {
    return await Database.getExternalBlocks(assistantId);
  } catch (err) {
    logEvent({
      level: 'warn',
      category: 'booking',
      event: 'booking.blocks_unavailable',
      meta: { assistantId, error: err instanceof Error ? err.name : 'unknown' },
    });
    return [];
  }
}
