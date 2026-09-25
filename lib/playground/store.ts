import crypto from 'crypto';
import type { Pool } from 'pg';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';
import { getAdminKey } from '@/lib/security/auth';

/**
 * The public playground: a visitor leaves a name and e-mail, uploads a few documents and chats with an assistant that answers
 * only from them. Each visit is a small, short-lived "session" with its own chunks, kept apart from every customer's real data.
 * Postgres when configured (so it survives serverless instances), memory otherwise.
 */

export const LIMITS = {
  sessionDays: 7,
  maxSources: 5,
  maxTotalChars: 200_000,
  maxFileBytes: 5_000_000,
  maxChats: 25,
};

export interface PgChunk {
  id: string;
  sourceId: string;
  sourceTitle: string;
  text: string;
}
export interface PgSource {
  id: string;
  title: string;
  kind: 'file' | 'url' | 'text';
  chars: number;
}
export interface PlaygroundSession {
  id: string;
  name: string;
  email: string;
  marketingOptIn: boolean;
  createdAt: string;
  expiresAt: string;
  sources: PgSource[];
  chunks: PgChunk[];
  chatCount: number;
}

const mem = new Map<string, PlaygroundSession>();
let ready: Promise<Pool | null> | null = null;

function pg(): Promise<Pool | null> {
  if (!isPostgresConfigured()) return Promise.resolve(null);
  if (ready) return ready;
  ready = (async () => {
    const pool = getPostgresPool();
    if (!pool) return null;
    try {
      const present = await pool.query(`SELECT to_regclass('public.kortex_playground_sessions') AS t`);
      if (!present.rows[0]?.t) {
        const client = await pool.connect();
        try {
          await client.query(`SELECT pg_advisory_lock(hashtext('ddl:kortex_playground'))`);
          await client.query(`
            CREATE TABLE IF NOT EXISTS kortex_playground_sessions (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
              sources JSONB NOT NULL DEFAULT '[]'::jsonb,
              chunks JSONB NOT NULL DEFAULT '[]'::jsonb,
              chat_count INTEGER NOT NULL DEFAULT 0,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              expires_at TIMESTAMPTZ NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_kortex_playground_email ON kortex_playground_sessions (lower(email), created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_kortex_playground_expires ON kortex_playground_sessions (expires_at);
          `);
        } finally {
          await client.query(`SELECT pg_advisory_unlock(hashtext('ddl:kortex_playground'))`).catch(() => undefined);
          client.release();
        }
      }
      return pool;
    } catch (err) {
      console.warn('[Playground] table unavailable, using memory:', (err as Error)?.message);
      ready = null;
      return null;
    }
  })();
  return ready;
}

const iso = (v: any) => (v instanceof Date ? v.toISOString() : new Date(v).toISOString());
const rowTo = (r: any): PlaygroundSession => ({
  id: r.id,
  name: r.name,
  email: r.email,
  marketingOptIn: Boolean(r.marketing_opt_in),
  createdAt: iso(r.created_at),
  expiresAt: iso(r.expires_at),
  sources: r.sources || [],
  chunks: r.chunks || [],
  chatCount: Number(r.chat_count) || 0,
});

/** The private link token for a session: derived from its id and a server secret, so it can be e-mailed and re-checked without storing it. */
export function sessionToken(id: string): string {
  return crypto.createHmac('sha256', process.env.PLAYGROUND_SECRET || getAdminKey()).update(`playground:${id}`).digest('hex').slice(0, 40);
}
export const sessionKey = (id: string) => `${id}.${sessionToken(id)}`;
export function parseSessionKey(key: unknown): string | null {
  if (typeof key !== 'string') return null;
  const [id, tok] = key.split('.');
  if (!id || !tok || !/^pg_[a-z0-9]{16}$/.test(id)) return null;
  const expected = Buffer.from(sessionToken(id));
  const given = Buffer.from(tok);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected) ? id : null;
}

export async function createSession(input: { name: string; email: string; marketingOptIn: boolean }): Promise<PlaygroundSession> {
  const now = Date.now();
  const s: PlaygroundSession = {
    id: 'pg_' + crypto.randomBytes(8).toString('hex'),
    name: input.name,
    email: input.email,
    marketingOptIn: input.marketingOptIn,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + LIMITS.sessionDays * 86400_000).toISOString(),
    sources: [],
    chunks: [],
    chatCount: 0,
  };
  const pool = await pg();
  if (pool) {
    await pool.query(
      `INSERT INTO kortex_playground_sessions (id, name, email, marketing_opt_in, expires_at) VALUES ($1,$2,$3,$4,$5)`,
      [s.id, s.name, s.email, s.marketingOptIn, s.expiresAt]
    );
  } else {
    mem.set(s.id, s);
  }
  return s;
}

export async function getSession(id: string): Promise<PlaygroundSession | null> {
  const pool = await pg();
  let s: PlaygroundSession | null;
  if (pool) {
    const { rows } = await pool.query(`SELECT * FROM kortex_playground_sessions WHERE id = $1`, [id]);
    s = rows[0] ? rowTo(rows[0]) : null;
  } else {
    s = mem.get(id) || null;
  }
  return s && new Date(s.expiresAt).getTime() > Date.now() ? s : null;
}

export async function saveContent(id: string, sources: PgSource[], chunks: PgChunk[]): Promise<void> {
  const pool = await pg();
  if (pool) {
    await pool.query(`UPDATE kortex_playground_sessions SET sources = $2::jsonb, chunks = $3::jsonb WHERE id = $1`, [id, JSON.stringify(sources), JSON.stringify(chunks)]);
    return;
  }
  const s = mem.get(id);
  if (s) {
    s.sources = sources;
    s.chunks = chunks;
  }
}

/** Counts one question and returns the new total, atomically enough for a per-visitor limit. */
export async function bumpChat(id: string): Promise<number> {
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(`UPDATE kortex_playground_sessions SET chat_count = chat_count + 1 WHERE id = $1 RETURNING chat_count`, [id]);
    return rows[0]?.chat_count ?? 0;
  }
  const s = mem.get(id);
  if (!s) return 0;
  s.chatCount += 1;
  return s.chatCount;
}

export async function sessionsForEmailToday(email: string): Promise<number> {
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM kortex_playground_sessions WHERE lower(email) = lower($1) AND created_at > NOW() - INTERVAL '1 day'`, [email]);
    return rows[0]?.n ?? 0;
  }
  const cutoff = Date.now() - 86400_000;
  return [...mem.values()].filter((s) => s.email.toLowerCase() === email.toLowerCase() && new Date(s.createdAt).getTime() > cutoff).length;
}

/** Removes expired sessions (the daily job). Returns how many. */
export async function purgeExpired(): Promise<number> {
  const pool = await pg();
  if (pool) {
    const r = await pool.query(`DELETE FROM kortex_playground_sessions WHERE expires_at < NOW()`);
    return r.rowCount ?? 0;
  }
  let n = 0;
  for (const [id, s] of mem) if (new Date(s.expiresAt).getTime() < Date.now()) (mem.delete(id), n++);
  return n;
}

// ---------------------------------------------------------------------------
// Retrieval: a small BM25 over the visitor's own chunks (no model download, no shared index)
// ---------------------------------------------------------------------------

const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'is', 'are', 'do', 'does', 'how', 'i', 'my', 'me', 'can', 'you', 'it', 'with', 'what', 'where', 'when', 'why', 'this', 'that', 'be', 'your', 'we', 'our', 'at', 'as', 'by', 'from', 'if', 'was', 'were', 'will', 'would', 'about']);
const tok = (t: string) => (t.toLowerCase().match(/[a-z0-9$%.\-']+/g) || []).map((w) => w.replace(/^[.\-']+|[.\-']+$/g, '')).filter((w) => w && !STOP.has(w));
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '');

export function searchChunks(chunks: PgChunk[], query: string, k = 5): { chunk: PgChunk; score: number }[] {
  const q = [...new Set(tok(query).map(stem))];
  if (!q.length || !chunks.length) return [];
  const docs = chunks.map((c) => tok(c.text).map(stem));
  const avg = docs.reduce((n, d) => n + d.length, 0) / docs.length || 1;
  const df = new Map<string, number>();
  for (const d of docs) for (const w of new Set(d)) df.set(w, (df.get(w) || 0) + 1);
  const N = docs.length;
  const scored = chunks.map((chunk, i) => {
    const d = docs[i];
    const tf = new Map<string, number>();
    for (const w of d) tf.set(w, (tf.get(w) || 0) + 1);
    let score = 0;
    for (const w of q) {
      const f = tf.get(w) || 0;
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(w) || 0) + 0.5) / ((df.get(w) || 0) + 0.5));
      score += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.length / avg))));
    }
    return { chunk, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
}
