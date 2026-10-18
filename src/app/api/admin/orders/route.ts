import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { AdminStats } from '@/lib/types';
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

    const orders = serverDb.getOrders();
    const inventory = serverDb.getInventory();

    // Compute admin stats
    const stats: AdminStats = {
      newOrders: orders.filter((o) => o.status === 'new_order').length,
      awaitingContact: orders.filter(
        (o) => o.status === 'new_order' || o.status === 'contacting_customer'
      ).length,
      awaitingCustomerResponse: orders.filter(
        (o) => o.status === 'awaiting_customer_response' || o.status === 'payment_instructions_sent'
      ).length,
      paymentConfirmed: orders.filter((o) => o.status === 'payment_confirmed').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      totalOrders: orders.length,
      totalOrderValue: Number(
        orders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.totalAmount, 0)
          .toFixed(2)
      ),
    };

    return NextResponse.json(
      {
        orders,
        inventory,
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
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

    const body = await req.json();
    const { syncOrders } = body;

    if (Array.isArray(syncOrders) && syncOrders.length > 0) {
      serverDb.syncOrdersFromClient(syncOrders);
    }

    const orders = serverDb.getOrders();
    const inventory = serverDb.getInventory();

    const stats: AdminStats = {
      newOrders: orders.filter((o) => o.status === 'new_order').length,
      awaitingContact: orders.filter(
        (o) => o.status === 'new_order' || o.status === 'contacting_customer'
      ).length,
      awaitingCustomerResponse: orders.filter(
        (o) => o.status === 'awaiting_customer_response' || o.status === 'payment_instructions_sent'
      ).length,
      paymentConfirmed: orders.filter((o) => o.status === 'payment_confirmed').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      totalOrders: orders.length,
      totalOrderValue: Number(
        orders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.totalAmount, 0)
          .toFixed(2)
      ),
    };

    return NextResponse.json(
      {
        success: true,
        orders,
        inventory,
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
