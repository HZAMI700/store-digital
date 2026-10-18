import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production';
  const response = NextResponse.json(
    {
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache' },
    }
  );

  // Clear cookie immediately
  response.cookies.set('velto_admin_session', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
