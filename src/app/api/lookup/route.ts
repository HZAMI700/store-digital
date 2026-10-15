import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest) {
  try {
    const { orderReference, email, token } = await req.json();

    if (!orderReference || typeof orderReference !== 'string') {
      return NextResponse.json(
        { error: 'Order reference number is required' },
        { status: 400 }
      );
    }

    const order = serverDb.getOrderByReference(orderReference.trim());

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please verify your reference number.' },
        { status: 404 }
      );
    }

    // Dual authorization check: Must provide matching email OR valid guestLookupToken
    const isEmailMatch =
      email &&
      typeof email === 'string' &&
      order.customerEmail.toLowerCase().trim() === email.toLowerCase().trim();

    const isTokenMatch =
      token &&
      typeof token === 'string' &&
      order.guestLookupToken === token.trim();

    if (!isEmailMatch && !isTokenMatch) {
      return NextResponse.json(
        {
          error:
            'Authorization failed. Please enter the email address used during order submission.',
        },
        { status: 403 }
      );
    }

    // Sanitize order details (strip internal notes, hide credentials until approved)
    const sanitized = serverDb.sanitizeForCustomer(order);

    return NextResponse.json({
      success: true,
      order: sanitized,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error looking up order' },
      { status: 500 }
    );
  }
}
