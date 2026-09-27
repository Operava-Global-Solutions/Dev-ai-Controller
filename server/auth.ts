import crypto from 'crypto';
import type { SupabaseAuthUser } from '../src/types/index.js';

// Admin credentials configured strictly via environment variables
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
export const ADMIN_WJT_KEY =
  process.env.JWT_SECRET || process.env.ADMIN_WJT_KEY || process.env.ADMIN_JWT_KEY || '';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Standard RFC 4648 Base32 Encoder for Authenticator App compatibility
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

/**
 * Standard RFC 4648 Base32 Decoder
 */
export function base32Decode(str: string): Buffer {
  const clean = str.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Derives a deterministic 160-bit (20-byte) Authenticator App secret from ADMIN_WJT_KEY
 */
export function getAuthenticatorSecret(): {
  secret: string;
  otpauthUrl: string;
  issuer: string;
  account: string;
} {
  const hash = crypto.createHmac('sha256', 'authenticator-seed').update(ADMIN_WJT_KEY).digest();
  const secretBytes = hash.subarray(0, 20);
  const secret = base32Encode(secretBytes);
  const issuer = 'DevaiController';
  const account = ADMIN_EMAIL;
  const label = encodeURIComponent(`${issuer}:${account}`);
  const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(
    issuer
  )}&algorithm=SHA1&digits=6&period=30`;

  return { secret, otpauthUrl, issuer, account };
}

/**
 * Computes RFC 6238 TOTP code (standard 30-second window, 6 digits)
 */
export function generateTotpCode(
  secretBase32: string,
  timeMs: number = Date.now(),
  stepSeconds = 30
): string {
  const secretBytes = base32Decode(secretBase32);
  const counter = Math.floor(timeMs / 1000 / stepSeconds);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', secretBytes).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verifies Authenticator App TOTP code with ±30 second sliding window
 */
export function verifyAuthenticatorOtp(candidateOtp: string): boolean {
  if (!candidateOtp) return false;
  const clean = candidateOtp.trim().replace(/\s+/g, '');
  if (clean.length !== 6) return false;

  const { secret } = getAuthenticatorSecret();
  const now = Date.now();

  // Check previous window (-30s), current window (0s), and next window (+30s)
  for (const offset of [-30000, 0, 30000]) {
    const expected = generateTotpCode(secret, now + offset, 30);
    if (clean === expected) {
      return true;
    }
  }
  return false;
}

/**
 * Generates an Email OTP using ADMIN_WJT_KEY (5-minute sliding window)
 */
export function generateEmailOtp(
  email: string = ADMIN_EMAIL
): { otp: string; expiresAt: number } {
  const now = Date.now();
  const step = Math.floor(now / (1000 * 300)); // 300s = 5 minutes
  const hmac = crypto.createHmac('sha256', ADMIN_WJT_KEY);
  hmac.update(`email-otp:${email.toLowerCase().trim()}:${step}`);
  const hash = hmac.digest('hex');
  const num = (parseInt(hash.slice(0, 8), 16) % 900000) + 100000;
  const otp = num.toString().padStart(6, '0');
  const expiresAt = (step + 1) * 300 * 1000;
  return { otp, expiresAt };
}

/**
 * Verifies Email OTP against ADMIN_WJT_KEY with a sliding window
 */
export function verifyEmailOtp(email: string, candidateOtp: string): boolean {
  if (!candidateOtp) return false;
  const clean = candidateOtp.trim().replace(/\s+/g, '');
  if (clean.length !== 6) return false;

  const now = Date.now();
  const currentStep = Math.floor(now / (1000 * 300));

  for (const step of [currentStep, currentStep - 1, currentStep + 1]) {
    const hmac = crypto.createHmac('sha256', ADMIN_WJT_KEY);
    hmac.update(`email-otp:${email.toLowerCase().trim()}:${step}`);
    const hash = hmac.digest('hex');
    const num = (parseInt(hash.slice(0, 8), 16) % 900000) + 100000;
    const expected = num.toString().padStart(6, '0');
    if (clean === expected) {
      return true;
    }
  }
  return false;
}

/**
 * Universal OTP verification supporting both Email Code and Authenticator App
 */
export function verifyAdminOtp(
  email?: string,
  candidateOtp?: string,
  method: 'email' | 'authenticator' | 'any' = 'any'
): boolean {
  if (!ADMIN_WJT_KEY || !candidateOtp) return false;
  const targetEmail = (email || ADMIN_EMAIL).toLowerCase().trim();
  if (method === 'email') return verifyEmailOtp(targetEmail, candidateOtp);
  if (method === 'authenticator') return verifyAuthenticatorOtp(candidateOtp);
  return verifyEmailOtp(targetEmail, candidateOtp) || verifyAuthenticatorOtp(candidateOtp);
}

/**
 * Validates admin email and password credentials
 */
export function validateAdminCredentials(email?: string, password?: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !email || !password) return false;
  if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) return false;
  const supplied = Buffer.from(password);
  const expected = Buffer.from(ADMIN_PASSWORD);
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

/**
 * Base64 URL safe encoder
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64 URL safe decoder
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Creates a signed JWT using ADMIN_WJT_KEY
 */
export function createAdminJwt(payload: Record<string, any>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const fullPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', ADMIN_WJT_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies a JWT signed by ADMIN_WJT_KEY
 */
export function verifyAdminJwt(token: string): any | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_WJT_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Returns default Admin SupabaseAuthUser profile
 */
export function getAdminUserProfile(): SupabaseAuthUser {
  return {
    id: 'usr-sb-7782194',
    email: ADMIN_EMAIL,
    name: 'Jelvan',
    role: 'Developer / Operator',
    sessionValid: true,
    lastSignInAt: new Date().toISOString(),
  };
}
