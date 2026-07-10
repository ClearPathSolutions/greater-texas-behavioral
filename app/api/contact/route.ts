import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';

type Payload = {
  name?: string;
  phone?: string;
  email?: string;
  insurance?: string;
  memberId?: string;
  message?: string;
  // honeypot — should stay empty
  company?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: Request) {
  let data: Payload;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: silently accept bots without doing anything
  if (data.company) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();

  if (!name || (!phone && !email)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide your name and a phone number or email.' },
      { status: 422 },
    );
  }

  const to = process.env.CONTACT_TO || site.email;
  const from = process.env.CONTACT_FROM; // e.g. "Greater Texas Behavioral <noreply@greatertexasbehavioral.com>"
  const apiKey = process.env.RESEND_API_KEY;

  const lines = [
    ['Name', name],
    ['Phone', phone],
    ['Email', email],
    ['Insurance', data.insurance || ''],
    ['Member ID', data.memberId || ''],
    ['Message', data.message || ''],
  ].filter(([, v]) => v);

  // If email delivery isn't configured, don't fail the user experience —
  // log the lead server-side and let the UI thank them + prompt a call.
  if (!apiKey || !from) {
    console.warn(
      '[contact] Email not configured (set RESEND_API_KEY and CONTACT_FROM). Lead received:',
      Object.fromEntries(lines),
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const html = `
      <h2>New inquiry — Greater Texas Behavioral</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${lines
          .map(
            ([k, v]) =>
              `<tr><td style="font-weight:600;vertical-align:top">${k}</td><td>${escapeHtml(
                String(v),
              )}</td></tr>`,
          )
          .join('')}
      </table>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email || undefined,
        subject: `New inquiry from ${name}`,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[contact] Resend error:', res.status, detail);
      return NextResponse.json(
        { ok: false, error: 'We could not submit your request. Please call us.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please call us.' },
      { status: 500 },
    );
  }
}
