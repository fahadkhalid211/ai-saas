import type { Pool } from 'pg';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';

/**
 * Blog edits made by the platform owner, and page views. Both live in their own small tables (created on first use); without a
 * database (local development) they are kept in memory for the life of the process.
 */

export interface BlogOverride {
  slug: string;
  title: string;
  description: string;
  /** The article in the plain-text format of lib/blog/markup.ts. */
  bodyMarkup: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ViewTotals {
  total: number;
  last7: number;
  last30: number;
  today: number;
}

const mem = { overrides: new Map<string, BlogOverride>(), views: new Map<string, Map<string, number>>() };

let ready: Promise<Pool | null> | null = null;

function pg(): Promise<Pool | null> {
  if (!isPostgresConfigured()) return Promise.resolve(null);
  if (ready) return ready;
  ready = (async () => {
    const pool = getPostgresPool();
    if (!pool) return null;
    try {
      const present = await pool.query(`SELECT to_regclass('public.kortex_blog_overrides') AS o, to_regclass('public.kortex_blog_views') AS v`);
      if (!present.rows[0]?.o || !present.rows[0]?.v) {
        const client = await pool.connect(); // the advisory lock belongs to one connection
        try {
          await client.query(`SELECT pg_advisory_lock(hashtext('ddl:kortex_blog'))`);
          await client.query(`
            CREATE TABLE IF NOT EXISTS kortex_blog_overrides (
              slug TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              body_markup TEXT NOT NULL,
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_by TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS kortex_blog_views (
              slug TEXT NOT NULL,
              day DATE NOT NULL,
              views INTEGER NOT NULL DEFAULT 0,
              PRIMARY KEY (slug, day)
            );
          `);
        } finally {
          await client.query(`SELECT pg_advisory_unlock(hashtext('ddl:kortex_blog'))`).catch(() => undefined);
          client.release();
        }
      }
      return pool;
    } catch (err) {
      console.warn('[Blog] tables unavailable, using memory:', (err as Error)?.message);
      ready = null;
      return null;
    }
  })();
  return ready;
}

const iso = (v: any) => (v instanceof Date ? v.toISOString() : v ? new Date(v).toISOString() : '');
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const rowToOverride = (r: any): BlogOverride => ({ slug: r.slug, title: r.title, description: r.description, bodyMarkup: r.body_markup, updatedAt: iso(r.updated_at), updatedBy: r.updated_by || '' });

export async function listOverrides(): Promise<BlogOverride[]> {
  const pool = await pg();
  if (!pool) return [...mem.overrides.values()];
  const r = await pool.query(`SELECT * FROM kortex_blog_overrides`);
  return r.rows.map(rowToOverride);
}

export async function getOverride(slug: string): Promise<BlogOverride | null> {
  const pool = await pg();
  if (!pool) return mem.overrides.get(slug) ?? null;
  const r = await pool.query(`SELECT * FROM kortex_blog_overrides WHERE slug = $1`, [slug]);
  return r.rows[0] ? rowToOverride(r.rows[0]) : null;
}

export async function saveOverride(o: Omit<BlogOverride, 'updatedAt'>): Promise<BlogOverride> {
  const pool = await pg();
  if (!pool) {
    const saved = { ...o, updatedAt: new Date().toISOString() };
    mem.overrides.set(o.slug, saved);
    return saved;
  }
  const r = await pool.query(
    `INSERT INTO kortex_blog_overrides (slug, title, description, body_markup, updated_by) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, body_markup = EXCLUDED.body_markup, updated_at = NOW(), updated_by = EXCLUDED.updated_by
     RETURNING *`,
    [o.slug, o.title, o.description, o.bodyMarkup, o.updatedBy]
  );
  return rowToOverride(r.rows[0]);
}

/** Puts the article back to the version in the code. */
export async function deleteOverride(slug: string): Promise<void> {
  const pool = await pg();
  if (!pool) {
    mem.overrides.delete(slug);
    return;
  }
  await pool.query(`DELETE FROM kortex_blog_overrides WHERE slug = $1`, [slug]);
}

export async function recordView(slug: string): Promise<void> {
  const pool = await pg();
  if (!pool) {
    const days = mem.views.get(slug) ?? new Map<string, number>();
    days.set(dayKey(), (days.get(dayKey()) ?? 0) + 1);
    mem.views.set(slug, days);
    return;
  }
  await pool.query(`INSERT INTO kortex_blog_views (slug, day, views) VALUES ($1, CURRENT_DATE, 1) ON CONFLICT (slug, day) DO UPDATE SET views = kortex_blog_views.views + 1`, [slug]);
}

/** Views per article: all time, last 30 days, last 7 days and today. */
export async function viewTotals(): Promise<Record<string, ViewTotals>> {
  const pool = await pg();
  const out: Record<string, ViewTotals> = {};
  if (!pool) {
    const now = Date.now();
    for (const [slug, days] of mem.views) {
      const t = { total: 0, last7: 0, last30: 0, today: 0 };
      for (const [d, n] of days) {
        const age = (now - new Date(d).getTime()) / 86400000;
        t.total += n;
        if (age < 30) t.last30 += n;
        if (age < 7) t.last7 += n;
        if (d === dayKey()) t.today += n;
      }
      out[slug] = t;
    }
    return out;
  }
  const r = await pool.query(`
    SELECT slug,
      SUM(views)::int AS total,
      SUM(views) FILTER (WHERE day > CURRENT_DATE - 30)::int AS last30,
      SUM(views) FILTER (WHERE day > CURRENT_DATE - 7)::int AS last7,
      SUM(views) FILTER (WHERE day = CURRENT_DATE)::int AS today
    FROM kortex_blog_views GROUP BY slug`);
  for (const row of r.rows) out[row.slug] = { total: row.total || 0, last30: row.last30 || 0, last7: row.last7 || 0, today: row.today || 0 };
  return out;
}

/** One article's views for each of the last `days` days (oldest first, zero-filled). */
export async function viewSeries(slug: string, days = 30): Promise<{ day: string; views: number }[]> {
  const pool = await pg();
  const counts = new Map<string, number>();
  if (!pool) {
    for (const [d, n] of mem.views.get(slug) ?? []) counts.set(d, n);
  } else {
    const r = await pool.query(`SELECT to_char(day, 'YYYY-MM-DD') AS d, views FROM kortex_blog_views WHERE slug = $1 AND day > CURRENT_DATE - $2::int`, [slug, days]);
    for (const row of r.rows) counts.set(row.d, row.views);
  }
  return Array.from({ length: days }, (_, i) => {
    const d = dayKey(new Date(Date.now() - (days - 1 - i) * 86400000));
    return { day: d, views: counts.get(d) ?? 0 };
  });
}
