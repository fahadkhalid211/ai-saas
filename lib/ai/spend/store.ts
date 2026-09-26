import type { Pool } from 'pg';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';

/**
 * Estimated AI spend on a customer's own API key, one row per assistant per calendar month (UTC). Counting lives in its own
 * small table (not the shared state row) because every chat reply adds to it. Without a database (local development) the
 * totals are kept in memory for the life of the process.
 */

export type CapAlertKind = 'warning' | 'reached';

export interface SpendRow {
  assistantId: string;
  period: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  /** The cap (USD) the 80% warning was last sent for; null when none was sent this month. */
  warnedForCap: number | null;
  /** The cap (USD) the 100% alert was last sent for. */
  reachedForCap: number | null;
}

/** "2026-09" for any moment in September 2026, UTC. */
export function periodOf(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

/** Start of the next month (UTC), when the spend starts again from zero. */
export function periodResetsAt(date: Date = new Date()): string {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)).toISOString();
}

// ---------------------------------------------------------------------------
// memory fallback
// ---------------------------------------------------------------------------
const mem = new Map<string, SpendRow>();
const memKey = (assistantId: string, period: string) => `${assistantId}|${period}`;

/** Test hook: forget everything kept in memory. */
export function resetMemorySpend(): void {
  mem.clear();
}

// ---------------------------------------------------------------------------
// schema
// ---------------------------------------------------------------------------
let ready: Promise<Pool | null> | null = null;

function pg(): Promise<Pool | null> {
  if (!isPostgresConfigured()) return Promise.resolve(null);
  if (ready) return ready;
  ready = (async () => {
    const pool = getPostgresPool();
    if (!pool) return null;
    try {
      const present = await pool.query(`SELECT to_regclass('public.kortex_llm_spend') AS t`);
      if (!present.rows[0]?.t) {
        const client = await pool.connect(); // the advisory lock belongs to one connection
        try {
          await client.query(`SELECT pg_advisory_lock(hashtext('ddl:kortex_llm_spend'))`);
          await client.query(`
            CREATE TABLE IF NOT EXISTS kortex_llm_spend (
              assistant_id TEXT NOT NULL,
              period TEXT NOT NULL,
              workspace_id TEXT,
              input_tokens BIGINT NOT NULL DEFAULT 0,
              output_tokens BIGINT NOT NULL DEFAULT 0,
              cost_usd NUMERIC(14, 6) NOT NULL DEFAULT 0,
              warned_for_cap NUMERIC(12, 2),
              reached_for_cap NUMERIC(12, 2),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              PRIMARY KEY (assistant_id, period)
            );
            CREATE INDEX IF NOT EXISTS idx_kortex_llm_spend_workspace ON kortex_llm_spend (workspace_id, period);
          `);
        } finally {
          await client.query(`SELECT pg_advisory_unlock(hashtext('ddl:kortex_llm_spend'))`).catch(() => undefined);
          client.release();
        }
      }
      return pool;
    } catch (err) {
      console.warn('[Spend] spend table unavailable, using memory:', (err as Error)?.message);
      ready = null;
      return null;
    }
  })();
  return ready;
}

const num = (v: any) => (v === null || v === undefined ? null : Number(v));

function rowToSpend(r: any): SpendRow {
  return {
    assistantId: r.assistant_id,
    period: r.period,
    inputTokens: Number(r.input_tokens) || 0,
    outputTokens: Number(r.output_tokens) || 0,
    costUsd: Number(r.cost_usd) || 0,
    warnedForCap: num(r.warned_for_cap),
    reachedForCap: num(r.reached_for_cap),
  };
}

function emptyRow(assistantId: string, period: string): SpendRow {
  return { assistantId, period, inputTokens: 0, outputTokens: 0, costUsd: 0, warnedForCap: null, reachedForCap: null };
}

// ---------------------------------------------------------------------------
// operations
// ---------------------------------------------------------------------------

/** Adds one request's usage and returns the month's new total. Safe when many replies finish at once. */
export async function addSpend(input: {
  assistantId: string;
  workspaceId?: string | null;
  period: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}): Promise<SpendRow> {
  const pool = await pg();
  if (pool) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO kortex_llm_spend (assistant_id, period, workspace_id, input_tokens, output_tokens, cost_usd)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (assistant_id, period) DO UPDATE SET
           input_tokens = kortex_llm_spend.input_tokens + EXCLUDED.input_tokens,
           output_tokens = kortex_llm_spend.output_tokens + EXCLUDED.output_tokens,
           cost_usd = kortex_llm_spend.cost_usd + EXCLUDED.cost_usd,
           updated_at = NOW()
         RETURNING *`,
        [input.assistantId, input.period, input.workspaceId ?? null, Math.round(input.inputTokens), Math.round(input.outputTokens), input.costUsd]
      );
      return rowToSpend(rows[0]);
    } catch (err) {
      console.warn('[Spend] addSpend failed, counting in memory:', (err as Error)?.message);
    }
  }
  const key = memKey(input.assistantId, input.period);
  const row = mem.get(key) || emptyRow(input.assistantId, input.period);
  row.inputTokens += Math.round(input.inputTokens);
  row.outputTokens += Math.round(input.outputTokens);
  row.costUsd += input.costUsd;
  mem.set(key, row);
  return { ...row };
}

export async function getSpend(assistantId: string, period: string = periodOf()): Promise<SpendRow> {
  const pool = await pg();
  if (pool) {
    try {
      const { rows } = await pool.query(`SELECT * FROM kortex_llm_spend WHERE assistant_id = $1 AND period = $2`, [assistantId, period]);
      return rows[0] ? rowToSpend(rows[0]) : emptyRow(assistantId, period);
    } catch (err) {
      console.warn('[Spend] getSpend failed:', (err as Error)?.message);
    }
  }
  const row = mem.get(memKey(assistantId, period));
  return row ? { ...row } : emptyRow(assistantId, period);
}

/**
 * Claims the right to send one alert. Returns true once per (month, kind, cap value): a second reply crossing the same line
 * gets false, while raising or lowering the cap arms the alert again for the new value.
 */
export async function claimAlert(assistantId: string, period: string, kind: CapAlertKind, capUsd: number): Promise<boolean> {
  const column = kind === 'warning' ? 'warned_for_cap' : 'reached_for_cap';
  const cap = Math.round(capUsd * 100) / 100;
  const pool = await pg();
  if (pool) {
    try {
      const { rowCount } = await pool.query(
        `UPDATE kortex_llm_spend SET ${column} = $3, updated_at = NOW()
         WHERE assistant_id = $1 AND period = $2 AND ${column} IS DISTINCT FROM $3::numeric`,
        [assistantId, period, cap]
      );
      return (rowCount ?? 0) > 0;
    } catch (err) {
      console.warn('[Spend] claimAlert failed:', (err as Error)?.message);
      return false;
    }
  }
  const key = memKey(assistantId, period);
  const row = mem.get(key) || emptyRow(assistantId, period);
  const field = kind === 'warning' ? 'warnedForCap' : 'reachedForCap';
  if (row[field] === cap) return false;
  row[field] = cap;
  mem.set(key, row);
  return true;
}
