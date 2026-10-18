import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { OrderStatus, ORDER_STATUSES } from '@/lib/types';
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
    const { status, adminName } = await req.json();

    if (!status || !(status in ORDER_STATUSES)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const updated = serverDb.updateOrderStatus(
      id,
      status as OrderStatus,
      adminName || session.username || 'Admin'
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
