import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { AdminStats, OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
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

    return NextResponse.json({
      orders,
      inventory,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
