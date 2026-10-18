import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'غير مصرح بالدخول' },
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store, no-cache' },
        }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        username: session.username,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, no-cache' },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache' } }
    );
  }
}
