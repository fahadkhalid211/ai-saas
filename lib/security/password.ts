import crypto from 'crypto';

const SCRYPT_PREFIX = 'scrypt:v1:';
const KEY_LENGTH = 64;

/**
 * Hashes a plaintext password/access-code using scrypt with a random salt.
 * Output format: scrypt:v1:<salt_hex>:<hash_hex>
 */
export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, KEY_LENGTH).toString('hex');
  return `${SCRYPT_PREFIX}${salt}:${hash}`;
}

export function isHashedPassword(value?: string | null): boolean {
  return Boolean(value && value.startsWith(SCRYPT_PREFIX));
}

/**
 * Verifies a plaintext credential against a stored value. Supports both
 * scrypt-hashed values and legacy plaintext values (for lazy migration of
 * pre-existing records) using constant-time comparison either way.
 */
export function verifyPassword(plain: string, stored?: string | null): boolean {
  if (!plain || !stored) return false;

  if (isHashedPassword(stored)) {
    const rest = stored.slice(SCRYPT_PREFIX.length);
    const sepIdx = rest.indexOf(':');
    if (sepIdx === -1) return false;
    const salt = rest.slice(0, sepIdx);
    const hashHex = rest.slice(sepIdx + 1);
    try {
      const expected = Buffer.from(hashHex, 'hex');
      const actual = crypto.scryptSync(plain, salt, expected.length);
      return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
    } catch {
      return false;
    }
  }

  // Legacy plaintext credential predating the hashing migration.
  return timingSafeStringEqual(plain, stored);
}

/**
 * Constant-time string comparison, safe for comparing secrets of differing
 * (attacker-influenced) lengths without leaking length or content via timing.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Still perform a comparison of equal-length buffers to avoid a fast
    // early-return timing signal based on length.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generates a random, human-typeable temporary password for newly invited
 * staff/tenants, to be displayed once at creation time instead of relying on
 * a shared, predictable default credential.
 */
export function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(12);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}
