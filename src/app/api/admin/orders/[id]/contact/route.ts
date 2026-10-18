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
    const { method, timestamp, note, sendDirect, subject } = await req.json();

    if (!method || !['whatsapp', 'email', 'phone'].includes(method)) {
      return NextResponse.json({ error: 'Valid contact method required' }, { status: 400 });
    }

    const contactTime = timestamp || new Date().toISOString();

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
