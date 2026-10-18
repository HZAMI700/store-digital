import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator authentication required.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache' } }
      );
    }

    const inventory = serverDb.getInventory();
    return NextResponse.json(
      { inventory },
      { headers: { 'Cache-Control': 'no-store, no-cache' } }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator authentication required.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache' } }
      );
    }

    const { productId, accountData } = await req.json();

    if (!productId || !accountData || !accountData.trim()) {
      return NextResponse.json(
        { error: 'Product ID and Account Credentials Data are required' },
        { status: 400 }
      );
    }

    const item = serverDb.addInventoryItem(productId, accountData);

    return NextResponse.json(
      {
        success: true,
        item,
        message: 'New digital account credential successfully vaulted in inventory.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
