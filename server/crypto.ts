import crypto from 'crypto';
import type { EncryptedTokenData, TokenProvider } from '../src/types/index.js';

// Default worker secret key for encryption if not supplied in environment
const DEFAULT_SECRET = process.env.WORKER_SECRET || 'operava-production-master-worker-secret-key-32b';

/**
 * Derives a 32-byte cryptographic key using PBKDF2
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 */
export function encryptToken(plaintext: string, secret: string = DEFAULT_SECRET): EncryptedTokenData {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Plaintext token must be a non-empty string');
  }

  // Generate random salt (16 bytes) and IV (12 bytes recommended for GCM)
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);

  const key = deriveKey(secret, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    salt: salt.toString('hex'),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload back to plaintext
 */
export function decryptToken(encrypted: EncryptedTokenData, secret: string = DEFAULT_SECRET): string {
  if (!encrypted || !encrypted.ciphertext || !encrypted.iv || !encrypted.authTag || !encrypted.salt) {
    throw new Error('Invalid encrypted payload structure');
  }

  const salt = Buffer.from(encrypted.salt, 'hex');
  const iv = Buffer.from(encrypted.iv, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');

  const key = deriveKey(secret, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks a token safely for frontend presentation (e.g. ghp_1234567890abcdef -> ghp_...cdef)
 */
export function maskToken(rawToken: string): string {
  if (!rawToken) return '••••••••';
  const clean = rawToken.trim();
  if (clean.length <= 8) {
    return '••••' + clean.slice(-2);
  }
  const prefix = clean.startsWith('ghp_') ? 'ghp_' 
    : clean.startsWith('re_') ? 're_' 
    : clean.startsWith('sbp_') ? 'sbp_'
    : clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}...${suffix}`;
}

/**
 * Infer provider from token prefix or format
 */
export function inferProvider(token: string): TokenProvider {
  const t = token.trim();
  if (t.startsWith('ghp_') || t.startsWith('github_pat_')) return 'github';
  if (t.startsWith('re_')) return 'resend';
  if (t.startsWith('sbp_') || t.includes('supabase')) return 'supabase';
  if (t.length === 40 && /^[a-zA-Z0-9_-]+$/.test(t)) return 'cloudflare';
  return 'custom';
}
