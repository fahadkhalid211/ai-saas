import crypto from 'crypto';
import type { Pool } from 'pg';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';
import { BILLING_PLANS } from './plans';
import type { WorkspaceBillingData } from '@/lib/db';
import { trialInfo } from './trial';

/**
 * Access codes: a code the platform owner makes and shares (with friends, a partner, a reviewer) that gives a workspace a plan
 * for free, for a number of days or with no end date. Stripe is not involved: redeeming a code puts the workspace on the plan
 * without a subscription, so nothing is ever charged. When a timed grant ends the workspace behaves like any ended trial
 * (assistants pause, and the owner can subscribe). A code can be limited to a number of uses, given an expiry date, and switched off.
 *
 * Codes live in two small tables created on first use; without a database (local development) they are kept in memory.
 */

export interface AccessCode {
  code: string;
  planId: 'starter' | 'growth' | 'scale';
  /** Days of free access counted from redemption. 0 means no end date. */
  days: number;
  maxUses: number;
  usedCount: number;
  /** After this moment the code can no longer be redeemed. */
  expiresAt: string | null;
  active: boolean;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface Redemption {
  code: string;
  workspaceId: string;
  redeemedAt: string;
}

export const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{3,31}$/;
export const MAX_DAYS = 3650;
export const MAX_USES = 1000;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I so a code read out loud or typed from a message is not mistaken

/** What people type: any case, stray spaces, and lookalike dashes are forgiven. */
export function normalizeCode(input: unknown): string {
  return String(input ?? '').trim().toUpperCase().replace(/[‐-―−]/g, '-').replace(/\s+/g, '');
}

/** A readable random code such as FRIEND-7K3Q9X. */
export function generateCode(prefix = 'FRIEND'): string {
  const bytes = crypto.randomBytes(6);
  const tail = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  const p = normalizeCode(prefix).replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return p ? `${p}-${tail}` : tail;
}

export interface NewCodeInput {
  code?: unknown;
  planId?: unknown;
  days?: unknown;
  maxUses?: unknown;
  expiresAt?: unknown;
  note?: unknown;
}

/** Checks what the owner typed and fills in the defaults. Throws a message meant to be shown to them. */
export function parseNewCode(input: NewCodeInput, now = new Date()): Omit<AccessCode, 'usedCount' | 'createdAt' | 'createdBy'> {
  const code = input.code ? normalizeCode(input.code) : generateCode();
  if (!CODE_PATTERN.test(code)) throw new Error('A code is 4 to 32 letters, numbers or dashes, for example FRIENDS-2026.');
  const planId = String(input.planId || 'growth') as AccessCode['planId'];
  if (!BILLING_PLANS.some((p) => p.id === planId)) throw new Error('Choose a plan: starter, growth or scale.');
  const days = input.days === undefined || input.days === '' ? 30 : Number(input.days);
  if (!Number.isInteger(days) || days < 0 || days > MAX_DAYS) throw new Error(`Days must be a whole number from 0 (no end date) to ${MAX_DAYS}.`);
  const maxUses = input.maxUses === undefined || input.maxUses === '' ? 1 : Number(input.maxUses);
  if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > MAX_USES) throw new Error(`Uses must be a whole number from 1 to ${MAX_USES}.`);
  let expiresAt: string | null = null;
  if (input.expiresAt) {
    const t = new Date(String(input.expiresAt));
    if (Number.isNaN(t.getTime())) throw new Error('The expiry date is not a valid date.');
    if (t.getTime() <= now.getTime()) throw new Error('The expiry date must be in the future.');
    expiresAt = t.toISOString();
  }
  return { code, planId, days, maxUses, expiresAt, active: true, note: String(input.note ?? '').trim().slice(0, 200) };
}

/** Can this code be redeemed right now? (The store also enforces it atomically when redeeming.) */
export function redeemable(c: AccessCode | null | undefined, now = new Date()): boolean {
  if (!c || !c.active) return false;
  if (c.usedCount >= c.maxUses) return false;
  if (c.expiresAt && new Date(c.expiresAt).getTime() <= now.getTime()) return false;
  return true;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The billing fields a workspace gets when it redeems a code. `requiresSubscription: false` and no Stripe subscription make it a
 * plain no-card workspace; a trial end date (when the code has days) makes it lock when the time is up, and no end date leaves it open.
 */
export function grantFor(c: Pick<AccessCode, 'code' | 'planId' | 'days'>, now = new Date()): Partial<WorkspaceBillingData> {
  const plan = BILLING_PLANS.find((p) => p.id === c.planId) || BILLING_PLANS[0];
  const grant: Partial<WorkspaceBillingData> = {
    requiresSubscription: false,
    complimentaryCode: c.code,
    planId: plan.id,
    planName: plan.name,
    monthlyChatLimit: plan.chatSessionsLimit,
    overageRatePerChat: plan.overageRate,
    landingPageLimit: plan.landingPageLimit,
    trialStartedAt: now.toISOString(),
  };
  grant.trialEndsAt = c.days > 0 ? new Date(now.getTime() + c.days * DAY_MS).toISOString() : undefined;
  return grant;
}


type Billing = Pick<WorkspaceBillingData, 'stripeSubscriptionId' | 'subscriptionStatus' | 'billingRisk' | 'complimentaryCode' | 'earlyBird' | 'requiresSubscription' | 'trialStartedAt' | 'trialEndsAt' | 'cancelAtPeriodEnd'>;

/** Why this workspace cannot redeem a code right now, or null when it can. The message is shown to the owner. */
export function redeemBlockReason(ws: Billing | null | undefined): string | null {
  if (!ws) return 'We could not find your workspace.';
  if (ws.billingRisk) return 'This workspace cannot use access codes. Please contact support.';
  if (ws.stripeSubscriptionId && ['trialing', 'active', 'past_due'].includes(ws.subscriptionStatus || '')) {
    return 'You already have a subscription. Cancel it in the billing portal first if you would rather use free access.';
  }
  const status = trialInfo(ws).status;
  if (status === 'needs_card' || status === 'expired') return null;
  if (status === 'trialing' && ws.earlyBird && !ws.complimentaryCode) return null;
  if (ws.complimentaryCode) return 'You already have free access with an access code.';
  return 'Your workspace already has access, so a code is not needed.';
}

/** For the dashboard: is this workspace on free access from a code, and until when (null = no end date)? */
export function complimentaryInfo(ws: Billing | null | undefined): { active: boolean; code: string; endsAt: string | null } {
  if (!ws?.complimentaryCode || ws.stripeSubscriptionId) return { active: false, code: '', endsAt: null };
  const status = trialInfo(ws).status;
  return { active: status === 'trialing' || status === 'legacy', code: ws.complimentaryCode, endsAt: ws.trialEndsAt || null };
}

/* ------------------------------------------------------------------ storage ------------------------------------------------------------------ */

const mem = { codes: new Map<string, AccessCode>(), redemptions: [] as Redemption[] };
let ready: Promise<Pool | null> | null = null;

/** Test helper: forget everything held in memory. */
export function resetAccessCodesMemory() {
  mem.codes.clear();
  mem.redemptions = [];
}

function pg(): Promise<Pool | null> {
  if (!isPostgresConfigured()) return Promise.resolve(null);
  if (ready) return ready;
  ready = (async () => {
    const pool = getPostgresPool();
    if (!pool) return null;
    try {
      const present = await pool.query(`SELECT to_regclass('public.kortex_access_codes') AS c, to_regclass('public.kortex_access_redemptions') AS r`);
      if (!present.rows[0]?.c || !present.rows[0]?.r) {
        const client = await pool.connect();
        try {
          await client.query(`SELECT pg_advisory_lock(hashtext('ddl:kortex_access_codes'))`);
          await client.query(`
            CREATE TABLE IF NOT EXISTS kortex_access_codes (
              code TEXT PRIMARY KEY,
              plan_id TEXT NOT NULL,
              days INTEGER NOT NULL DEFAULT 30,
              max_uses INTEGER NOT NULL DEFAULT 1,
              used_count INTEGER NOT NULL DEFAULT 0,
              expires_at TIMESTAMPTZ,
              active BOOLEAN NOT NULL DEFAULT TRUE,
              note TEXT NOT NULL DEFAULT '',
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              created_by TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS kortex_access_redemptions (
              code TEXT NOT NULL,
              workspace_id TEXT NOT NULL,
              redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              PRIMARY KEY (code, workspace_id)
            );
          `);
        } finally {
          await client.query(`SELECT pg_advisory_unlock(hashtext('ddl:kortex_access_codes'))`).catch(() => undefined);
          client.release();
        }
      }
      return pool;
    } catch (err) {
      console.warn('[AccessCodes] tables unavailable, using memory:', (err as Error)?.message);
      ready = null;
      return null;
    }
  })();
  return ready;
}

const iso = (v: any) => (v instanceof Date ? v.toISOString() : v ? new Date(v).toISOString() : '');
const rowTo = (r: any): AccessCode => ({
  code: r.code,
  planId: r.plan_id,
  days: Number(r.days),
  maxUses: Number(r.max_uses),
  usedCount: Number(r.used_count),
  expiresAt: r.expires_at ? iso(r.expires_at) : null,
  active: Boolean(r.active),
  note: r.note || '',
  createdAt: iso(r.created_at),
  createdBy: r.created_by || '',
});

export async function createAccessCode(input: NewCodeInput, createdBy: string): Promise<AccessCode> {
  const parsed = parseNewCode(input);
  const pool = await pg();
  if (pool) {
    const r = await pool.query(
      `INSERT INTO kortex_access_codes (code, plan_id, days, max_uses, expires_at, active, note, created_by)
       VALUES ($1,$2,$3,$4,$5,TRUE,$6,$7) ON CONFLICT (code) DO NOTHING RETURNING *`,
      [parsed.code, parsed.planId, parsed.days, parsed.maxUses, parsed.expiresAt, parsed.note, createdBy]
    );
    if (!r.rows[0]) throw new Error('That code already exists. Choose another, or leave it blank for a random one.');
    return rowTo(r.rows[0]);
  }
  if (mem.codes.has(parsed.code)) throw new Error('That code already exists. Choose another, or leave it blank for a random one.');
  const made: AccessCode = { ...parsed, usedCount: 0, createdAt: new Date().toISOString(), createdBy };
  mem.codes.set(made.code, made);
  return made;
}

export async function listAccessCodes(): Promise<(AccessCode & { redemptions: Redemption[] })[]> {
  const pool = await pg();
  if (pool) {
    const [codes, reds] = await Promise.all([
      pool.query(`SELECT * FROM kortex_access_codes ORDER BY created_at DESC`),
      pool.query(`SELECT code, workspace_id, redeemed_at FROM kortex_access_redemptions ORDER BY redeemed_at DESC`),
    ]);
    const byCode = new Map<string, Redemption[]>();
    for (const r of reds.rows) byCode.set(r.code, [...(byCode.get(r.code) || []), { code: r.code, workspaceId: r.workspace_id, redeemedAt: iso(r.redeemed_at) }]);
    return codes.rows.map((r) => ({ ...rowTo(r), redemptions: byCode.get(r.code) || [] }));
  }
  return [...mem.codes.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => ({ ...c, redemptions: mem.redemptions.filter((r) => r.code === c.code) }));
}

export async function setAccessCodeActive(code: string, active: boolean): Promise<boolean> {
  const c = normalizeCode(code);
  const pool = await pg();
  if (pool) return ((await pool.query(`UPDATE kortex_access_codes SET active = $2 WHERE code = $1`, [c, active])).rowCount ?? 0) > 0;
  const found = mem.codes.get(c);
  if (found) found.active = active;
  return Boolean(found);
}

export async function deleteAccessCode(code: string): Promise<boolean> {
  const c = normalizeCode(code);
  const pool = await pg();
  if (pool) return ((await pool.query(`DELETE FROM kortex_access_codes WHERE code = $1`, [c])).rowCount ?? 0) > 0;
  mem.redemptions = mem.redemptions.filter((r) => r.code !== c);
  return mem.codes.delete(c);
}

export type RedeemResult = { ok: true; code: AccessCode } | { ok: false; reason: 'invalid' | 'already' };

/**
 * Uses one of the code's places for a workspace, all or nothing. A workspace can redeem a given code once; the last place goes to
 * exactly one caller even if two redeem at the same moment. "invalid" covers unknown, switched off, expired and used-up codes alike,
 * so someone guessing cannot learn which codes exist.
 */
export async function redeemAccessCode(codeInput: unknown, workspaceId: string, now = new Date()): Promise<RedeemResult> {
  const code = normalizeCode(codeInput);
  if (!CODE_PATTERN.test(code)) return { ok: false, reason: 'invalid' };
  const pool = await pg();
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const claimed = await client.query(
        `UPDATE kortex_access_codes SET used_count = used_count + 1
         WHERE code = $1 AND active AND used_count < max_uses AND (expires_at IS NULL OR expires_at > $2) RETURNING *`,
        [code, now.toISOString()]
      );
      if (!claimed.rows[0]) {
        await client.query('ROLLBACK');
        return { ok: false, reason: 'invalid' };
      }
      const seen = await client.query(`INSERT INTO kortex_access_redemptions (code, workspace_id, redeemed_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING code`, [code, workspaceId, now.toISOString()]);
      if (!seen.rows[0]) {
        await client.query('ROLLBACK');
        return { ok: false, reason: 'already' };
      }
      await client.query('COMMIT');
      return { ok: true, code: rowTo(claimed.rows[0]) };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }
  const c = mem.codes.get(code);
  if (!redeemable(c, now)) return { ok: false, reason: 'invalid' };
  if (mem.redemptions.some((r) => r.code === code && r.workspaceId === workspaceId)) return { ok: false, reason: 'already' };
  c!.usedCount += 1;
  mem.redemptions.push({ code, workspaceId, redeemedAt: now.toISOString() });
  return { ok: true, code: { ...c! } };
}
