import { NextRequest, NextResponse } from 'next/server';
import { PayloadSchema, renderHtmlEmail } from '../../../lib/template';
import { getTransport } from '../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = PayloadSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    const data = parsed.data;
    const html = renderHtmlEmail(data);
    const toList = (process.env.RECIPIENT_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
    const cc = [data.subcontractor.email];
    if (!toList.length) return NextResponse.json({ error: 'No RECIPIENT_EMAILS configured on the server' }, { status: 500 });

    const transporter = getTransport();
    const from = process.env.SENDER_EMAIL || 'no-reply@example.com';
    await transporter.sendMail({ from, to: toList, cc, subject: `GX Price Request — ${data.project.name}`, html });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
