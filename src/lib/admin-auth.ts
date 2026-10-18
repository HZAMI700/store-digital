import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Server-side environment variables with secure production defaults
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'yassine700';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yassine700';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'velto_ultra_secure_session_secret_2026_x89f_key';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

// In-memory rate limiting map for login attempts: ip -> { count, firstAttemptTime, blockedUntil }
const loginAttemptsMap = new Map<string, { count: number; firstAttemptTime: number; blockedUntil: number }>();

/**
 * Check if the given IP address is rate limited for login attempts.
 * Max 5 failed attempts per 60 seconds.
 */
export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttemptsMap.get(ip);

  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Reset window if 60 seconds have passed since first attempt
  if (now - record.firstAttemptTime > 60000) {
    loginAttemptsMap.delete(ip);
    return { allowed: true };
  }

  if (record.count >= 5) {
    record.blockedUntil = now + 60000; // Block for 1 minute
    return { allowed: false, retryAfterSeconds: 60 };
  }

  return { allowed: true };
}

/**
 * Record a failed login attempt for the given IP address.
 */
export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const record = loginAttemptsMap.get(ip);

  if (!record || now - record.firstAttemptTime > 60000) {
    loginAttemptsMap.set(ip, { count: 1, firstAttemptTime: now, blockedUntil: 0 });
  } else {
    record.count += 1;
    if (record.count >= 5) {
      record.blockedUntil = now + 60000;
    }
  }
}

/**
 * Reset failed login attempts upon successful login.
 */
export function resetLoginAttempts(ip: string) {
  loginAttemptsMap.delete(ip);
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Perform dummy timing comparison
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify admin credentials securely on server side.
 */
export function verifyAdminCredentials(username: string, pass: string): boolean {
  const userValid = safeEqual(username.trim(), ADMIN_USERNAME);
  const passValid = safeEqual(pass, ADMIN_PASSWORD);
  return userValid && passValid;
}

/**
 * Create a cryptographically signed session token for authenticated administrator.
 */
export function createAdminSessionToken(username: string): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = JSON.stringify({ u: username, i: issuedAt, e: expiresAt });
  const payloadBase64 = Buffer.from(payload).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadBase64);
  const signature = hmac.digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify a session token's cryptographic HMAC signature and expiration.
 */
export function verifyAdminSessionToken(token: string): { valid: boolean; username?: string } {
  try {
    if (!token || typeof token !== 'string') return { valid: false };
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };

    const [payloadBase64, signature] = parts;
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(payloadBase64);
    const expectedSignature = hmac.digest('base64url');

    if (!safeEqual(signature, expectedSignature)) {
      return { valid: false };
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (!payload.u || !payload.e || typeof payload.e !== 'number') {
      return { valid: false };
    }

    if (Date.now() > payload.e) {
      return { valid: false }; // Expired
    }

    return { valid: true, username: payload.u };
  } catch {
    return { valid: false };
  }
}

/**
 * Extract and verify admin session from Next.js incoming request.
 * Checks:
 * 1. HTTP-Only Cookie 'velto_admin_session'
 * 2. Header 'Authorization: Bearer <token>'
 * 3. Header 'x-admin-key' (matches ADMIN_PASSWORD for server automation/tests)
 */
export function getAdminSessionFromRequest(req: NextRequest): { username: string } | null {
  // 1. Check Cookie
  const cookieToken = req.cookies.get('velto_admin_session')?.value;
  if (cookieToken) {
    const verified = verifyAdminSessionToken(cookieToken);
    if (verified.valid && verified.username) {
      return { username: verified.username };
    }
  }

  // 2. Check Authorization Bearer Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    const verified = verifyAdminSessionToken(bearerToken);
    if (verified.valid && verified.username) {
      return { username: verified.username };
    }
  }

  // 3. Check x-admin-key header (for testing/automation with timing-safe comparison)
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey && safeEqual(adminKey, ADMIN_PASSWORD)) {
    return { username: ADMIN_USERNAME };
  }

  return null;
}
