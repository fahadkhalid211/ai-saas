import crypto from 'crypto';
import path from 'path';
import { resolveDataDir, ensureDirectory, safeReadFile, safeAtomicWrite } from '../db/storage';

const DATA_DIR = resolveDataDir();
const ENCRYPTION_KEY_FILE = path.join(DATA_DIR, '.encryption_key');

let inMemoryEncryptionSecret: string | null = null;

const DEFAULT_FALLBACK_ENCRYPTION_SECRET = 'kortex-ai-default-encryption-salt-2026';

/**
 * Resolves the secret used to derive the AES-256-GCM key that protects every
 * stored provider API key. On serverless platforms (such as Vercel) where /tmp
 * is isolated per Lambda instance, falls back to a deterministic key when neither
 * ENCRYPTION_SECRET nor ADMIN_API_KEY is configured so that encryption and
 * decryption remain consistent across different lambda workers.
 */
function getEncryptionSecret(): string {
  if (process.env.ENCRYPTION_SECRET && process.env.ENCRYPTION_SECRET.trim()) {
    return process.env.ENCRYPTION_SECRET.trim();
  }
  if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.trim()) {
    return process.env.ADMIN_API_KEY.trim();
  }

  // If deployed to Vercel/serverless without explicit keys, use the stable default
  // so concurrent lambdas don't generate divergent keys and break decryption.
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return DEFAULT_FALLBACK_ENCRYPTION_SECRET;
  }

  if (inMemoryEncryptionSecret) {
    return inMemoryEncryptionSecret;
  }

  try {
    ensureDirectory(DATA_DIR);
    const saved = safeReadFile(ENCRYPTION_KEY_FILE);
    if (saved && saved.trim()) {
      inMemoryEncryptionSecret = saved.trim();
      return inMemoryEncryptionSecret;
    }

    const bundledKeyFile = path.join(process.cwd(), '.data', '.encryption_key');
    if (bundledKeyFile !== ENCRYPTION_KEY_FILE) {
      const bundledSaved = safeReadFile(bundledKeyFile);
      if (bundledSaved && bundledSaved.trim()) {
        inMemoryEncryptionSecret = bundledSaved.trim();
        return inMemoryEncryptionSecret;
      }
    }

    const generated = crypto.randomBytes(32).toString('hex');
    safeAtomicWrite(ENCRYPTION_KEY_FILE, generated);
    inMemoryEncryptionSecret = generated;
    return inMemoryEncryptionSecret;
  } catch {
    return DEFAULT_FALLBACK_ENCRYPTION_SECRET;
  }
}

// 32-byte key derivation from the resolved encryption secret
function getMasterKey(): Buffer {
  return crypto.createHash('sha256').update(getEncryptionSecret()).digest();
}

/**
 * Encrypts a plaintext secret using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext || typeof plaintext !== 'string') return '';
  if (plaintext.startsWith('enc:v1:')) return plaintext; // Already encrypted

  const key = getMasterKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Gracefully falls back to plaintext if the input is not encrypted.
 */
export function decryptSecret(ciphertext: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  if (!ciphertext.startsWith('enc:v1:')) {
    return ciphertext; // Unencrypted legacy secret
  }

  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 5) return '';

    const iv = Buffer.from(parts[2], 'hex');
    const authTag = Buffer.from(parts[3], 'hex');
    const encryptedHex = parts[4];

    const key = getMasterKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    // If decryption with current key fails, attempt fallback with legacy default salt
    try {
      const parts = ciphertext.split(':');
      if (parts.length === 5) {
        const iv = Buffer.from(parts[2], 'hex');
        const authTag = Buffer.from(parts[3], 'hex');
        const encryptedHex = parts[4];
        const legacyKey = crypto.createHash('sha256').update(DEFAULT_FALLBACK_ENCRYPTION_SECRET).digest();
        const decipher = crypto.createDecipheriv('aes-256-gcm', legacyKey, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }
    } catch {}

    console.error('[Crypto] Decryption error (invalid key or corrupted ciphertext):', err);
    return '';
  }
}

/**
 * Masks a sensitive secret for safe client-side display in dashboards.
 * E.g., 'sk-ant-api03-abcdef123456' -> 'sk-ant-****...3456'
 */
export function maskSecret(secret: string): string {
  if (!secret) return '';
  const plain = decryptSecret(secret);
  if (!plain) return '';

  if (plain.length <= 8) {
    return '********';
  }

  const prefix = plain.slice(0, Math.min(6, Math.floor(plain.length / 4)));
  const suffix = plain.slice(-4);
  return `${prefix}****...${suffix}`;
}
