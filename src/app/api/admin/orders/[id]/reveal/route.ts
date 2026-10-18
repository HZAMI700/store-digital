import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator authentication required.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache' } }
      );
    }

    const { id } = params;
    const { revealed } = await req.json();

    const updated = serverDb.toggleCredentialsRevealed(id, Boolean(revealed));

    return NextResponse.json({
      success: true,
      order: updated,
      message: revealed
        ? 'Credentials successfully revealed to customer dashboard.'
        : 'Credentials hidden.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
