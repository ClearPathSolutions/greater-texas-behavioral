import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { clarion, site } from '@/lib/site';

// Must run on the Node runtime — Clarion's edge blocks non-browser callers,
// and we set a browser-like User-Agent below (Node's default UA => 000/reset).
export const runtime = 'nodejs';

const CLARION_API = process.env.CLARION_API || clarion.api;
const SITE_KEY = process.env.CLARION_SITE_KEY || clarion.siteKey;

// Clarion's edge blocks Node's default User-Agent, so send a browser-like one.
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

type LeadBody = {
  name?: string;
  phone?: string;
  email?: string;
  insurance?: string;
  memberId?: string;
  message?: string;
  company?: string; // honeypot — must stay empty
  page_url?: string;
  referrer?: string;
  utm?: Record<string, string>;
  gclid?: string;
};

/** Resolve the exact origin to present to Clarion (must be allowlisted). */
function resolveOrigin(req: Request): string {
  const origin = req.headers.get('origin');
  if (origin) return origin;
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : site.url;
}

/** Build the message body from only the fields this form actually collects. */
function buildMessage(d: LeadBody): string {
  const rows: Array<[string, string | undefined]> = [
    ['Name', d.name],
    ['Phone', d.phone],
    ['Email', d.email],
    ['Insurance', d.insurance],
    ['Member ID', d.memberId],
    ['Message', d.message],
  ];
  const body = rows
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join('\n');
  return `New website lead — Verify Insurance form\n\n${body}`;
}

export async function POST(req: Request) {
  let data: LeadBody;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: silently accept bots.
  if (data.company) return NextResponse.json({ ok: true });

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();

  if (!name || (!phone && !email)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide your name and a phone number or email.' },
      { status: 422 },
    );
  }

  const origin = resolveOrigin(req);
  const text = buildMessage(data);

  // Never lose a lead: if Clarion is unreachable/misconfigured, log the full
  // lead server-side and still tell the visitor we received it.
  const logLead = (reason: string) =>
    console.warn(`[lead] NOT delivered to Clarion (${reason}). Lead:`, {
      name,
      phone,
      email,
      insurance: data.insurance,
      memberId: data.memberId,
      message: data.message,
    });

  const headers = {
    'Content-Type': 'application/json',
    Origin: origin,
    'User-Agent': BROWSER_UA,
  };

  try {
    // 1) Create a public visitor session.
    const sessionRes = await fetch(`${CLARION_API}/webchat/public/session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        site_key: SITE_KEY,
        visitor_session_id: randomUUID(),
        page_url: data.page_url || origin,
        referrer: data.referrer || '',
        user_agent: req.headers.get('user-agent') || BROWSER_UA,
        utm: data.utm || {},
        gclid: data.gclid || '',
      }),
    });

    if (!sessionRes.ok) {
      logLead(`session ${sessionRes.status}`);
      return NextResponse.json({ ok: true, delivered: false });
    }

    const session = (await sessionRes.json()) as {
      conversation_id?: string;
      visitor_token?: string;
    };

    if (!session.visitor_token) {
      logLead('session missing visitor_token');
      return NextResponse.json({ ok: true, delivered: false });
    }

    // 2) Post the lead as a message into that conversation.
    const msgRes = await fetch(`${CLARION_API}/webchat/public/messages`, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${session.visitor_token}` },
      body: JSON.stringify({ client_msg_id: randomUUID(), text }),
    });

    if (!msgRes.ok) {
      logLead(`messages ${msgRes.status}`);
      return NextResponse.json({ ok: true, delivered: false });
    }

    console.log(`[lead] delivered to Clarion: ${session.conversation_id ?? 'ok'}`);
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    logLead(`exception ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.json({ ok: true, delivered: false });
  }
}
