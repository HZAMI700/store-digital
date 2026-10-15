import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const inventory = serverDb.getInventory();
    return NextResponse.json({ inventory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, accountData } = await req.json();

    if (!productId || !accountData || !accountData.trim()) {
      return NextResponse.json(
        { error: 'Product ID and Account Credentials Data are required' },
        { status: 400 }
      );
    }

    const item = serverDb.addInventoryItem(productId, accountData);

    return NextResponse.json({
      success: true,
      item,
      message: 'New digital account credential successfully vaulted in inventory.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
