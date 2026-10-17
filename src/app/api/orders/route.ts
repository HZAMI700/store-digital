import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { isValidEmail, isValidPhone } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      quantity,
      customerName,
      customerEmail,
      customerWhatsapp,
      countryCode,
      customerMessage,
      consentGiven,
      customerId,
      planId,
      unitPrice,
    } = body;

    // 1. Server-side Validations
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Customer name is required (min 2 characters)' },
        { status: 400 }
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    if (!customerWhatsapp || !isValidPhone(customerWhatsapp)) {
      return NextResponse.json(
        { error: 'A valid WhatsApp phone number is required' },
        { status: 400 }
      );
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Customer consent is required to process the order request' },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (!qty || qty < 1 || qty > 10) {
      return NextResponse.json(
        { error: 'Invalid quantity. Must be between 1 and 10' },
        { status: 400 }
      );
    }

    // 2. Validate product exists
    const product = serverDb.getProductById(productId) || serverDb.getProductBySlug(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Selected product does not exist or is out of stock' },
        { status: 404 }
      );
    }

    // 3. Prevent immediate duplicate submissions (same email & product in past 10 seconds)
    const recentOrders = serverDb.getOrders();
    const isDuplicate = recentOrders.some((o) => {
      const isSameEmail = o.customerEmail.toLowerCase() === customerEmail.toLowerCase().trim();
      const isSameProduct = o.productId === product.id;
      const createdDate = new Date(o.createdAt).getTime();
      const diffSeconds = (Date.now() - createdDate) / 1000;
      return isSameEmail && isSameProduct && diffSeconds < 10;
    });

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'تم استلام طلب مماثل للتو. يرجى الانتظار بضع ثوانٍ قبل إرسال طلب جديد.' },
        { status: 429 }
      );
    }

    // 4. Create Order with Server Calculated Prices
    const newOrder = serverDb.createOrder({
      productId: product.id,
      productName: product.title,
      quantity: qty,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerWhatsapp: customerWhatsapp.trim(),
      countryCode: countryCode || '+216',
      customerMessage: customerMessage ? customerMessage.trim() : null,
      consentGiven: true,
      customerId: customerId || null,
      planId: planId || null,
      unitPrice: typeof unitPrice === 'number' ? unitPrice : null,
    });

    // Return sanitized customer-facing order response
    const sanitized = serverDb.sanitizeForCustomer(newOrder);

    return NextResponse.json(
      {
        success: true,
        order: sanitized,
        message: 'Order request submitted successfully. Administrator will contact you.',
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error processing order submission:', error);
    return NextResponse.json(
      { error: error.message || 'Server error while submitting order request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');

    let orders = serverDb.getOrders();

    if (customerId) {
      orders = orders.filter((o) => o.customerId === customerId);
    } else if (email) {
      orders = orders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase());
    }

    // Strictly sanitize all customer orders (strip internal notes)
    const safeOrders = orders.map((o) => serverDb.sanitizeForCustomer(o));

    return NextResponse.json({ orders: safeOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
