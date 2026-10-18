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
    const { inventoryId } = await req.json();

    if (!inventoryId) {
      return NextResponse.json({ error: 'Inventory ID is required' }, { status: 400 });
    }

    const updated = serverDb.assignInventoryToOrder(id, inventoryId);

    return NextResponse.json({
      success: true,
      order: updated,
      message: 'Account successfully assigned to this order.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
