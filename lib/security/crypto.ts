import crypto from 'crypto';

// 32-byte key derivation from environment secret or fallback seed
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.ADMIN_API_KEY || 'kortex-ai-default-encryption-salt-2026';
  return crypto.createHash('sha256').update(secret).digest();
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
