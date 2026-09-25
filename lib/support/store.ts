import crypto from 'crypto';
import type { Pool } from 'pg';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';

/**
 * Support tickets. They live in their own two tables (not in the shared state row), so a busy inbox never slows the app down.
 * Without a database (local development) they are kept in memory for the life of the process.
 */

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageAuthor = 'customer' | 'staff' | 'system';

export interface Ticket {
  ref: string;
  workspaceId: string | null;
  name: string;
  email: string;
  business: string;
  category: string;
  priority: TicketPriority;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  lastReplyAt: string;
  lastReplyBy: 'customer' | 'staff';
  resolvedAt: string | null;
  messageCount: number;
}

export interface TicketMessage {
  id: string;
  ticketRef: string;
  author: MessageAuthor;
  authorName: string;
  body: string;
  /** Staff-only note, never shown to the requester and never e-mailed. */
  internal: boolean;
  createdAt: string;
}

export interface TicketFilter {
  workspaceId?: string;
  email?: string;
  status?: TicketStatus | 'active';
  priority?: TicketPriority;
  q?: string;
  limit?: number;
  offset?: number;
}

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

// ---------------------------------------------------------------------------
// memory fallback
// ---------------------------------------------------------------------------
const mem = { tickets: new Map<string, Ticket & { tokenHash: string }>(), messages: [] as TicketMessage[] };

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
      const present = await pool.query(`SELECT to_regclass('public.kortex_tickets') AS t, to_regclass('public.kortex_ticket_messages') AS m`);
      if (!present.rows[0]?.t || !present.rows[0]?.m) {
        const client = await pool.connect(); // the advisory lock belongs to one connection
        try {
          await client.query(`SELECT pg_advisory_lock(hashtext('ddl:kortex_tickets'))`);
          await client.query(`
            CREATE TABLE IF NOT EXISTS kortex_tickets (
              ref TEXT PRIMARY KEY,
              workspace_id TEXT,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              business TEXT NOT NULL DEFAULT '',
              category TEXT NOT NULL DEFAULT 'General Support',
              priority TEXT NOT NULL DEFAULT 'normal',
              subject TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'open',
              token_hash TEXT NOT NULL,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              last_reply_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              last_reply_by TEXT NOT NULL DEFAULT 'customer',
              resolved_at TIMESTAMPTZ,
              message_count INTEGER NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_kortex_tickets_status ON kortex_tickets (status, updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_kortex_tickets_workspace ON kortex_tickets (workspace_id, updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_kortex_tickets_email ON kortex_tickets (lower(email), created_at DESC);
            CREATE TABLE IF NOT EXISTS kortex_ticket_messages (
              id TEXT PRIMARY KEY,
              ticket_ref TEXT NOT NULL REFERENCES kortex_tickets(ref) ON DELETE CASCADE,
              author TEXT NOT NULL,
              author_name TEXT NOT NULL DEFAULT '',
              body TEXT NOT NULL,
              internal BOOLEAN NOT NULL DEFAULT FALSE,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_kortex_ticket_messages_ref ON kortex_ticket_messages (ticket_ref, created_at);
          `);
        } finally {
          await client.query(`SELECT pg_advisory_unlock(hashtext('ddl:kortex_tickets'))`).catch(() => undefined);
          client.release();
        }
      }
      return pool;
    } catch (err) {
      console.warn('[Support] ticket tables unavailable, using memory:', (err as Error)?.message);
      ready = null;
      return null;
    }
  })();
  return ready;
}

const iso = (v: any) => (v instanceof Date ? v.toISOString() : v ? new Date(v).toISOString() : '');

function rowToTicket(r: any): Ticket {
  return {
    ref: r.ref,
    workspaceId: r.workspace_id ?? null,
    name: r.name,
    email: r.email,
    business: r.business || '',
    category: r.category,
    priority: r.priority,
    subject: r.subject,
    status: r.status,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    lastReplyAt: iso(r.last_reply_at),
    lastReplyBy: r.last_reply_by,
    resolvedAt: r.resolved_at ? iso(r.resolved_at) : null,
    messageCount: Number(r.message_count) || 0,
  };
}

const rowToMessage = (r: any): TicketMessage => ({
  id: r.id,
  ticketRef: r.ticket_ref,
  author: r.author,
  authorName: r.author_name || '',
  body: r.body,
  internal: Boolean(r.internal),
  createdAt: iso(r.created_at),
});

export function newRef(): string {
  return `CR-${crypto.randomInt(100000, 1000000)}`;
}

// ---------------------------------------------------------------------------
// operations
// ---------------------------------------------------------------------------

export async function insertTicket(
  t: Omit<Ticket, 'createdAt' | 'updatedAt' | 'lastReplyAt' | 'resolvedAt' | 'messageCount' | 'lastReplyBy' | 'status'>,
  tokenHash: string,
  first: { body: string; authorName: string }
): Promise<Ticket> {
  const now = new Date().toISOString();
  const message: TicketMessage = { id: 'tm_' + crypto.randomBytes(8).toString('hex'), ticketRef: t.ref, author: 'customer', authorName: first.authorName, body: first.body, internal: false, createdAt: now };
  const pool = await pg();
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO kortex_tickets (ref, workspace_id, name, email, business, category, priority, subject, status, token_hash, message_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'open',$9,1) RETURNING *`,
        [t.ref, t.workspaceId, t.name, t.email, t.business, t.category, t.priority, t.subject, tokenHash]
      );
      await client.query(`INSERT INTO kortex_ticket_messages (id, ticket_ref, author, author_name, body, internal) VALUES ($1,$2,'customer',$3,$4,FALSE)`, [message.id, t.ref, first.authorName, first.body]);
      await client.query('COMMIT');
      return rowToTicket(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }
  if (mem.tickets.has(t.ref)) throw Object.assign(new Error('duplicate'), { code: '23505' });
  const ticket: Ticket = { ...t, status: 'open', createdAt: now, updatedAt: now, lastReplyAt: now, lastReplyBy: 'customer', resolvedAt: null, messageCount: 1 };
  mem.tickets.set(t.ref, { ...ticket, tokenHash });
  mem.messages.push(message);
  return ticket;
}

export async function getTicket(ref: string): Promise<(Ticket & { tokenHash: string }) | null> {
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(`SELECT * FROM kortex_tickets WHERE ref = $1`, [ref]);
    return rows[0] ? { ...rowToTicket(rows[0]), tokenHash: rows[0].token_hash } : null;
  }
  return mem.tickets.get(ref) || null;
}

export async function listMessages(ref: string, includeInternal: boolean): Promise<TicketMessage[]> {
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(
      `SELECT * FROM kortex_ticket_messages WHERE ticket_ref = $1 ${includeInternal ? '' : 'AND internal = FALSE'} ORDER BY created_at ASC LIMIT 300`,
      [ref]
    );
    return rows.map(rowToMessage);
  }
  return mem.messages.filter((m) => m.ticketRef === ref && (includeInternal || !m.internal));
}

export async function addMessage(input: { ticketRef: string; author: MessageAuthor; authorName: string; body: string; internal?: boolean }, patch: Partial<Pick<Ticket, 'status' | 'priority'>> = {}): Promise<TicketMessage> {
  const now = new Date().toISOString();
  const msg: TicketMessage = { id: 'tm_' + crypto.randomBytes(8).toString('hex'), ticketRef: input.ticketRef, author: input.author, authorName: input.authorName, body: input.body, internal: Boolean(input.internal), createdAt: now };
  const replier = input.author === 'staff' ? 'staff' : input.author === 'customer' ? 'customer' : null;
  const pool = await pg();
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`INSERT INTO kortex_ticket_messages (id, ticket_ref, author, author_name, body, internal) VALUES ($1,$2,$3,$4,$5,$6)`, [msg.id, msg.ticketRef, msg.author, msg.authorName, msg.body, msg.internal]);
      await client.query(
        `UPDATE kortex_tickets SET
           message_count = message_count + 1,
           updated_at = NOW(),
           last_reply_at = CASE WHEN $2::text IS NOT NULL AND NOT $3::boolean THEN NOW() ELSE last_reply_at END,
           last_reply_by = CASE WHEN $2::text IS NOT NULL AND NOT $3::boolean THEN $2 ELSE last_reply_by END,
           status = COALESCE($4, status),
           priority = COALESCE($5, priority),
           resolved_at = CASE WHEN COALESCE($4, status) IN ('resolved','closed') THEN COALESCE(resolved_at, NOW()) ELSE NULL END
         WHERE ref = $1`,
        [msg.ticketRef, replier, msg.internal, patch.status ?? null, patch.priority ?? null]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
    return msg;
  }
  const t = mem.tickets.get(msg.ticketRef);
  if (t) {
    t.messageCount += 1;
    t.updatedAt = now;
    if (replier && !msg.internal) {
      t.lastReplyAt = now;
      t.lastReplyBy = replier;
    }
    if (patch.status) t.status = patch.status;
    if (patch.priority) t.priority = patch.priority;
    t.resolvedAt = t.status === 'resolved' || t.status === 'closed' ? t.resolvedAt || now : null;
  }
  mem.messages.push(msg);
  return msg;
}

export async function updateTicketFields(ref: string, patch: Partial<Pick<Ticket, 'status' | 'priority'>>): Promise<Ticket | null> {
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(
      `UPDATE kortex_tickets SET
         status = COALESCE($2, status),
         priority = COALESCE($3, priority),
         updated_at = NOW(),
         resolved_at = CASE WHEN COALESCE($2, status) IN ('resolved','closed') THEN COALESCE(resolved_at, NOW()) ELSE NULL END
       WHERE ref = $1 RETURNING *`,
      [ref, patch.status ?? null, patch.priority ?? null]
    );
    return rows[0] ? rowToTicket(rows[0]) : null;
  }
  const t = mem.tickets.get(ref);
  if (!t) return null;
  if (patch.status) t.status = patch.status;
  if (patch.priority) t.priority = patch.priority;
  t.updatedAt = new Date().toISOString();
  t.resolvedAt = t.status === 'resolved' || t.status === 'closed' ? t.resolvedAt || t.updatedAt : null;
  return t;
}

export async function listTickets(f: TicketFilter): Promise<{ tickets: Ticket[]; total: number }> {
  const limit = Math.min(Math.max(f.limit || 50, 1), 100);
  const offset = Math.max(f.offset || 0, 0);
  const pool = await pg();
  if (pool) {
    const where: string[] = [];
    const params: any[] = [];
    const add = (sql: string, v: any) => {
      params.push(v);
      where.push(sql.replace('?', `$${params.length}`));
    };
    if (f.workspaceId) add('workspace_id = ?', f.workspaceId);
    if (f.email) add('lower(email) = ?', f.email.toLowerCase());
    if (f.status === 'active') where.push(`status IN ('open','pending')`);
    else if (f.status) add('status = ?', f.status);
    if (f.priority) add('priority = ?', f.priority);
    if (f.q) {
      params.push(`%${f.q.replace(/[%_\\]/g, (c) => '\\' + c)}%`);
      where.push(`(ref ILIKE $${params.length} OR subject ILIKE $${params.length} OR lower(email) ILIKE $${params.length} OR name ILIKE $${params.length} OR business ILIKE $${params.length})`);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await pool.query(`SELECT COUNT(*)::int AS n FROM kortex_tickets ${clause}`, params);
    const { rows } = await pool.query(
      `SELECT * FROM kortex_tickets ${clause}
       ORDER BY (CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END) * (CASE WHEN status IN ('open','pending') THEN 1 ELSE 10 END), updated_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { tickets: rows.map(rowToTicket), total: total.rows[0]?.n ?? 0 };
  }
  let all = [...mem.tickets.values()].map(({ tokenHash: _t, ...rest }) => rest as Ticket);
  if (f.workspaceId) all = all.filter((t) => t.workspaceId === f.workspaceId);
  if (f.email) all = all.filter((t) => t.email.toLowerCase() === f.email!.toLowerCase());
  if (f.status === 'active') all = all.filter((t) => t.status === 'open' || t.status === 'pending');
  else if (f.status) all = all.filter((t) => t.status === f.status);
  if (f.priority) all = all.filter((t) => t.priority === f.priority);
  if (f.q) {
    const q = f.q.toLowerCase();
    all = all.filter((t) => [t.ref, t.subject, t.email, t.name, t.business].some((v) => v.toLowerCase().includes(q)));
  }
  all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { tickets: all.slice(offset, offset + limit), total: all.length };
}

export async function ticketCounts(): Promise<Record<TicketStatus, number>> {
  const out: Record<TicketStatus, number> = { open: 0, pending: 0, resolved: 0, closed: 0 };
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(`SELECT status, COUNT(*)::int AS n FROM kortex_tickets GROUP BY status`);
    for (const r of rows) if (r.status in out) out[r.status as TicketStatus] = r.n;
    return out;
  }
  for (const t of mem.tickets.values()) out[t.status] += 1;
  return out;
}

/** Tickets that have been resolved for longer than `days` with no reply since (the daily job closes them). */
export async function staleResolved(days: number): Promise<Ticket[]> {
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(`SELECT * FROM kortex_tickets WHERE status = 'resolved' AND resolved_at < NOW() - ($1::int * INTERVAL '1 day') LIMIT 200`, [days]);
    return rows.map(rowToTicket);
  }
  const cutoff = Date.now() - days * 86400_000;
  return [...mem.tickets.values()].filter((t) => t.status === 'resolved' && t.resolvedAt && new Date(t.resolvedAt).getTime() < cutoff);
}

/** Tickets created from this e-mail address in the last hour (a limit on how many confirmation e-mails one address can be sent). */
export async function recentTicketsForEmail(email: string, minutes = 60): Promise<number> {
  const pool = await pg();
  if (pool) {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM kortex_tickets WHERE lower(email) = lower($1) AND created_at > NOW() - ($2::int * INTERVAL '1 minute')`, [email, minutes]);
    return rows[0]?.n ?? 0;
  }
  const cutoff = Date.now() - minutes * 60_000;
  return [...mem.tickets.values()].filter((t) => t.email.toLowerCase() === email.toLowerCase() && new Date(t.createdAt).getTime() > cutoff).length;
}
