import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
