import { NextRequest, NextResponse } from 'next/server';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  verifyAdminCredentials,
  createAdminSessionToken,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 1. Check Rate Limit
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار لمدة ${rateLimit.retryAfterSeconds || 60} ثانية قبل المحاولة مجدداً.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
            'Cache-Control': 'no-store, no-cache',
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: 'يرجى إدخال اسم المستخدم وكلمة المرور' },
        { status: 400, headers: { 'Cache-Control': 'no-store, no-cache' } }
      );
    }

    // 2. Verify Credentials using timing-safe comparison
    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مجدداً.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache' } }
      );
    }

    // 3. Reset rate limit on success
    resetLoginAttempts(ip);

    // 4. Create signed session token
    const token = createAdminSessionToken(username.trim());

    // 5. Build response and set HttpOnly Cookie
    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        username: username.trim(),
        token, // Also return in body for mobile/bearer clients
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, no-cache' },
      }
    );

    // Set secure HttpOnly cookie (24 hours expiry)
    response.cookies.set('velto_admin_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء معالجة تسجيل الدخول' },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache' } }
    );
  }
}
