import crypto from 'crypto';
import type { TeamMemberData } from '@/lib/db';
import { getAdminKey } from '@/lib/security/auth';
import { decryptSecret } from '@/lib/security/crypto';
import { findTotpStep } from '@/lib/security/totp';
import { timingSafeStringEqual } from '@/lib/security/password';

const HASH_PREFIX = 'h1:';

const normalize = (code: string) => code.trim().toUpperCase();

/** Recovery codes are stored as keyed hashes, so a copy of the database does not reveal usable codes. */
export function hashRecoveryCode(code: string): string {
  return HASH_PREFIX + crypto.createHmac('sha256', getAdminKey()).update(`recovery:${normalize(code)}`).digest('hex');
}

export function hashRecoveryCodes(codes: unknown): string[] {
  if (!Array.isArray(codes)) return [];
  return codes.filter((c): c is string => typeof c === 'string' && c.trim().length > 0).slice(0, 12).map(hashRecoveryCode);
}

export type SecondFactorResult =
  | { ok: false }
  | { ok: true; method: 'totp' | 'recovery'; updates: Partial<TeamMemberData> };

/**
 * Checks an authenticator code or a recovery code against a member.
 * - An authenticator code is refused if its time step was already used (a code cannot be replayed).
 * - A recovery code works once; codes stored before hashing was added (plain text) still match and are dropped on use.
 * `updates` must be saved by the caller when ok.
 */
export function checkSecondFactor(member: TeamMemberData, code: unknown): SecondFactorResult {
  const supplied = typeof code === 'string' ? normalize(code) : '';
  if (!supplied || !member.twoFactorSecret) return { ok: false };

  // 1. Check TOTP authenticator code (support 6-digits with or without spaces/dashes)
  const cleanDigits = supplied.replace(/[\s-]+/g, '');
  if (/^\d{6}$/.test(cleanDigits)) {
    const step = findTotpStep(cleanDigits, decryptSecret(member.twoFactorSecret), 2);
    if (step !== null) {
      if (typeof member.twoFactorLastStep === 'number' && step <= member.twoFactorLastStep) return { ok: false };
      return { ok: true, method: 'totp', updates: { twoFactorLastStep: step } };
    }
  }

  // 2. Check Recovery Code
  const stored = member.recoveryCodes || [];
  const hashed = hashRecoveryCode(supplied);
  const idx = stored.findIndex((c) => (c.startsWith(HASH_PREFIX) ? timingSafeStringEqual(c, hashed) : timingSafeStringEqual(normalize(c), supplied)));
  if (idx !== -1) {
    return { ok: true, method: 'recovery', updates: { recoveryCodes: stored.filter((_, i) => i !== idx) } };
  }

  // Try recovery code without dashes in case input differed in dash formatting
  const suppliedNoDash = supplied.replace(/-/g, '');
  const hashedNoDash = hashRecoveryCode(suppliedNoDash);
  const idxNoDash = stored.findIndex((c) => {
    const unhashedClean = normalize(c).replace(/-/g, '');
    return c.startsWith(HASH_PREFIX) ? timingSafeStringEqual(c, hashedNoDash) : timingSafeStringEqual(unhashedClean, suppliedNoDash);
  });
  if (idxNoDash !== -1) {
    return { ok: true, method: 'recovery', updates: { recoveryCodes: stored.filter((_, i) => i !== idxNoDash) } };
  }

  return { ok: false };
}
