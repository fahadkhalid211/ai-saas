import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Standard RFC 6238 recommends 160-bit secret key (20 bytes = 32 Base32 characters).
 */
export function generateBase32Secret(length = 32): string {
  const randomBytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < randomBytes.length; i++) {
    secret += BASE32_ALPHABET[randomBytes[i] % 32];
  }
  return secret;
}

/**
 * Decodes a Base32 string to Buffer.
 * Supports standard RFC 4648 with or without padding and handles partial final nibbles
 * (such as 20-character secrets, ensuring full compatibility with Google Authenticator).
 */
export function base32ToBuffer(base32: string, includePartialRemainder = true): Buffer {
  const cleaned = (base32 || '').toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  if (includePartialRemainder && bits.length % 8 !== 0) {
    const remainder = bits.slice(bytes.length * 8);
    bytes.push(parseInt(remainder.padEnd(8, '0'), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpCode(secret: string, timeStep = 30, timeOffset = 0, includeRemainder = true): string {
  const key = base32ToBuffer(secret, includeRemainder);
  const epoch = Math.floor(Date.now() / 1000) + timeOffset;
  const counter = Math.floor(epoch / timeStep);

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuf);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export function verifyTotpToken(token: string, secret: string, window = 2): boolean {
  if (!token) return false;
  const normalizedToken = token.replace(/[\s-]+/g, '').trim();
  if (normalizedToken.length !== 6) return false;

  // Check current window, plus -window and +window windows for clock skew tolerance
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    // Check standard RFC decoding (includes partial remainder byte)
    if (generateTotpCode(secret, 30, errorWindow * 30, true) === normalizedToken) {
      return true;
    }
    // Fallback: check legacy unpadded decoding if secret has fractional bits
    if (generateTotpCode(secret, 30, errorWindow * 30, false) === normalizedToken) {
      return true;
    }
  }
  return false;
}

export function generateOtpAuthUrl(options: {
  issuer: string;
  accountName: string;
  secret: string;
}): string {
  const issuer = encodeURIComponent(options.issuer);
  const account = encodeURIComponent(options.accountName);
  return `otpauth://totp/${issuer}:${account}?secret=${options.secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${hex.substring(0, 4)}-${hex.substring(4, 8)}`);
  }
  return codes;
}

/** The 30-second time step a valid token belongs to (within +-window), or null. Lets callers refuse a code that was already used. */
export function findTotpStep(token: string, secret: string, window = 2): number | null {
  if (!token) return null;
  const normalized = token.replace(/[\s-]+/g, '').trim();
  if (normalized.length !== 6) return null;
  const nowStep = Math.floor(Date.now() / 1000 / 30);
  for (let w = -window; w <= window; w++) {
    // Standard RFC
    if (generateTotpCode(secret, 30, w * 30, true) === normalized) {
      return nowStep + w;
    }
    // Fallback legacy unpadded
    if (generateTotpCode(secret, 30, w * 30, false) === normalized) {
      return nowStep + w;
    }
  }
  return null;
}
