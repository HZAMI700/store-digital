import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { method, timestamp, note, sendDirect, subject, body } = await req.json();

    if (!method || !['whatsapp', 'email', 'phone'].includes(method)) {
      return NextResponse.json({ error: 'Valid contact method required' }, { status: 400 });
    }

    const contactTime = timestamp || new Date().toISOString();

    // If server email requested, we can attempt sending via external SMTP / Resend or log as transactional
    if (sendDirect && method === 'email') {
      console.log(`[Transactional Email] Sending email for order ${id} to customer. Subject: ${subject}`);
    }

    const updated = serverDb.recordContactAttempt(id, method, contactTime, note);

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Contact via ${method.toUpperCase()} successfully recorded in order history.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
