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
    const { notes } = await req.json();

    const updated = serverDb.updateOrderNotes(id, typeof notes === 'string' ? notes : '');

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
