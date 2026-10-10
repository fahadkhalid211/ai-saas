import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';
import { csvCell } from '@/lib/logging/csv';
import { describeLog } from '@/lib/logging/describe';
import { parseFilters, queryLogs, type LogEntry } from '@/lib/logging/query';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_ROWS = 50_000;
const PAGE = 1000;

const CSV_COLUMNS: Array<keyof LogEntry> = [
  'ts', 'level', 'category', 'event', 'message', 'requestId', 'method', 'route', 'path', 'status', 'durationMs',
  'userId', 'workspaceId', 'role', 'ip', 'errorName', 'errorMessage', 'fingerprint',
];

/** Master admin only: download the filtered log as NDJSON (default) or CSV, at most 50,000 rows. */
async function GETHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'ndjson';
  const base = parseFilters(url.searchParams);
  base.limit = PAGE;

  const encoder = new TextEncoder();
  let exported = 0;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (format === 'csv') controller.enqueue(encoder.encode(['description', ...CSV_COLUMNS].join(',') + '\n'));
        let before = base.before;
        while (exported < MAX_ROWS) {
          const { entries, nextCursor } = await queryLogs({ ...base, before });
          for (const e of entries) {
            controller.enqueue(
              encoder.encode(
                format === 'csv'
                  ? [csvCell(describeLog(e)), ...CSV_COLUMNS.map((c) => csvCell(e[c]))].join(',') + '\n'
                  : JSON.stringify({ description: describeLog(e), ...e }) + '\n'
              )
            );
            exported++;
          }
          if (!nextCursor || entries.length === 0) break;
          const [ts, id] = nextCursor.split('|');
          before = { ts, id };
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n# export stopped: ${(err as Error)?.message?.slice(0, 100)}\n`));
      } finally {
        logEvent({ category: 'admin', event: 'admin.logs_exported', meta: { format, rows: exported } });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': format === 'csv' ? 'text/csv; charset=utf-8' : 'application/x-ndjson; charset=utf-8',
      'Content-Disposition': `attachment; filename="crescelo-logs-${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'ndjson'}"`,
      'Cache-Control': 'no-store',
    },
  });
}

export const GET = logged(GETHandler, { route: '/api/master/logs/export' });
