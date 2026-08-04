/**
 * Server-side lead fallback.
 *
 * WHY THIS EXISTS
 * The insurance form's primary path is Clarion's client-side capture script.
 * That path has four ways to fail silently in a real browser: the script is
 * blocked by an ad/tracker blocker, the origin isn't allowlisted in Clarion
 * (403), the network drops, or the script simply hasn't wired the form yet.
 * Before this route existed the form showed "Thank you — we've got it" in every
 * one of those cases and the lead was gone. On a behavioural-health intake form
 * that is the worst possible failure mode, so the client now falls back here
 * whenever Clarion does not confirm the submission.
 *
 * DELIVERY
 * Email via Resend's REST API (plain fetch — no new dependency). The response
 * reports honestly whether the lead was actually delivered; the client only
 * shows a success screen when something confirms receipt, and otherwise shows
 * the phone number. A "sort of worked" outcome is treated as a failure on
 * purpose.
 *
 * REQUIRED ENV for this fallback to deliver: RESEND_API_KEY, CONTACT_FROM,
 * CONTACT_TO. Without them the route accepts and logs the lead but reports
 * `delivered: false`, which surfaces the call-us fallback in the UI rather
 * than pretending the submission landed.
 */
import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

export const runtime = 'nodejs';
// Never cache a mutation endpoint.
export const dynamic = 'force-dynamic';

/** Reject absurd payloads outright. */
const MAX_BODY_BYTES = 16_000;
const MAX_FIELD_LEN = 5_000;

type LeadFields = {
  name?: string;
  phone?: string;
  email?: string;
  insurance?: string;
  memberId?: string;
  message?: string;
  /** Which form this came from, e.g. `insurance_verification` or `contact`. */
  form_key?: string;
  /** Honeypot — humans never fill this. */
  company?: string;
};

/** Human-readable labels for the known form keys. */
const FORM_LABELS: Record<string, string> = {
  insurance_verification: 'Insurance verification',
  contact: 'Contact form',
};

/**
 * Best-effort per-instance throttle. Serverless instances are ephemeral and
 * horizontally scaled, so this is a speed bump for naive floods, not a real
 * rate limiter. Put a WAF rule in front of the route if abuse becomes an issue.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear(); // crude unbounded-growth guard
  return recent.length > RATE_LIMIT_MAX;
}

function clean(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, MAX_FIELD_LEN) : '';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendViaResend(fields: {
  name: string;
  phone: string;
  email: string;
  insurance: string;
  memberId: string;
  message: string;
  formKey: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO || site.email;
  if (!key || !from || !to) return { sent: false, reason: 'not_configured' as const };

  const label = FORM_LABELS[fields.formKey] ?? 'Website inquiry';

  const rows: Array<[string, string]> = [
    ['Form', label],
    ['Name', fields.name],
    ['Phone', fields.phone || '—'],
    ['Email', fields.email || '—'],
    ['Insurance', fields.insurance || '—'],
    ['Member ID', fields.memberId || '—'],
    ['Message', fields.message || '—'],
  ];

  const html = `<h2>New ${escapeHtml(label.toLowerCase())} submission</h2>
<p><strong>Source:</strong> ${escapeHtml(site.url)} (server-side fallback — Clarion capture did not confirm)</p>
<table cellpadding="6" style="border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="border:1px solid #ddd"><strong>${escapeHtml(k)}</strong></td><td style="border:1px solid #ddd">${escapeHtml(v)}</td></tr>`,
  )
  .join('\n')}
</table>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields.email || undefined,
        subject: `${label} — ${fields.name}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error('[lead] resend rejected delivery', res.status, await res.text());
      return { sent: false, reason: 'provider_error' as const };
    }
    return { sent: true, reason: 'ok' as const };
  } catch (err) {
    console.error('[lead] resend request failed', err);
    return { sent: false, reason: 'network_error' as const };
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, delivered: false, error: 'rate_limited' },
      { status: 429 },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, delivered: false, error: 'payload_too_large' },
      { status: 413 },
    );
  }

  let body: LeadFields;
  try {
    body = JSON.parse(raw) as LeadFields;
  } catch {
    return NextResponse.json(
      { ok: false, delivered: false, error: 'invalid_json' },
      { status: 400 },
    );
  }

  // Honeypot: quietly accept and discard so bots get no signal.
  if (clean(body.company)) {
    return NextResponse.json({ ok: true, delivered: true, discarded: true });
  }

  const fields = {
    name: clean(body.name),
    phone: clean(body.phone),
    email: clean(body.email),
    insurance: clean(body.insurance),
    memberId: clean(body.memberId),
    message: clean(body.message),
    formKey: clean(body.form_key) || 'default',
  };

  // Name plus at least one way to reach the person back. The insurance form
  // requires a phone in markup; /contact accepts phone OR email.
  if (!fields.name || !(fields.phone || fields.email)) {
    return NextResponse.json(
      { ok: false, delivered: false, error: 'missing_required_fields' },
      { status: 422 },
    );
  }

  const delivery = await sendViaResend(fields);

  // Deliberately minimal logging. The insurance member ID and the free-text
  // "how can we help" box are health-adjacent identifiable information; email
  // is the delivery channel, so logs record only enough to reconcile a lost
  // lead, never the sensitive values themselves.
  console.log(
    JSON.stringify({
      tag: 'lead',
      at: new Date().toISOString(),
      form: fields.formKey,
      name: fields.name,
      phone: fields.phone,
      email: fields.email || null,
      insurance: fields.insurance || null,
      hasMemberId: Boolean(fields.memberId),
      messageChars: fields.message.length,
      delivered: delivery.sent,
      deliveryReason: delivery.reason,
    }),
  );

  return NextResponse.json({
    ok: true,
    delivered: delivery.sent,
    reason: delivery.reason,
  });
}

/** Explicit 405 so a stray GET is unambiguous rather than a confusing 404. */
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'method_not_allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
