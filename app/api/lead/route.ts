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
 *
 * ATTRIBUTION
 * A lead only reaches this route when Clarion did not confirm it, which is also
 * when nothing else on the page is recording where the person came from. So the
 * client sends its attribution here too, and this route recovers CTM's visitor
 * session id independently from the `__ctmid` cookie: that cookie is
 * first-party, so it rides along on this request whether or not the client-side
 * read worked. A client-side regression therefore cannot silently un-attribute
 * every lead — the server still has the id.
 *
 * `ctm_visitor_sid` is read FLAT and TOP-LEVEL because that is the only place
 * CTM's parser looks for it. Nesting it under a `session` object is a known
 * failure on a sibling site in this fleet: every lead delivered, every response
 * was a 200, and not one attached to a visit.
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

  // Attribution, sent by `attributionPayload()` in lib/attribution.ts.
  page_url?: unknown;
  landing_page_url?: unknown;
  referrer?: unknown;
  utm?: unknown;
  gclid?: unknown;
  wbraid?: unknown;
  gbraid?: unknown;
  fbclid?: unknown;
  msclkid?: unknown;
  /** CTM visitor session id: 24 hex, no dashes. See `ctmVisitorSid()`. */
  ctm_visitor_sid?: unknown;
};

/**
 * CTM's visitor session id shape: 24 hex characters, no dashes.
 *
 * A UUID (`f01079ad-73b9-4e58-abbb-a2dc68b7faac`) is NOT this. Passing an
 * application-generated id here files the lead against no visit while looking
 * like success in every log and dashboard, so the shape is checked rather than
 * trusted.
 */
const CTM_ID_RE = /^[0-9a-f]{24}$/i;

/**
 * `__ctmid` encodes the CTM account id in characters 8-16, hex.
 * `6a88a9cc00040a6a4743909d` -> `00040a6a` -> 264810. This mirrors the check
 * `t.js` performs on its own cookie, including its 7-character variant, and
 * catches a cookie issued by a DIFFERENT CTM account — which is shaped
 * perfectly and still attributes to nothing.
 */
const CTM_ACCOUNT_ID = 264810;

function belongsToOurAccount(sid: string): boolean {
  return (
    parseInt(sid.substring(8, 16), 16) === CTM_ACCOUNT_ID ||
    parseInt(sid.substring(8, 15), 16) === CTM_ACCOUNT_ID
  );
}

/**
 * Resolves the CTM visitor session id: client value first, `__ctmid` cookie as
 * the independent fallback.
 *
 * Returns whatever it has even when the shape is wrong, and warns instead —
 * a wrong id and no id both attach to no visit, so discarding it would only
 * destroy the evidence needed to work out which of the two happened.
 */
function ctmVisitorSid(body: LeadFields, request: Request): string | null {
  const fromClient =
    typeof body.ctm_visitor_sid === 'string' ? body.ctm_visitor_sid : null;

  if (fromClient && CTM_ID_RE.test(fromClient)) {
    if (!belongsToOurAccount(fromClient)) {
      console.warn('[lead] CTM sid is not from account', CTM_ACCOUNT_ID);
    }
    return fromClient;
  }

  const raw = request.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)__ctmid=([^;]*)/)?.[1];
  let fromCookie: string | null = null;
  try {
    fromCookie = raw ? decodeURIComponent(raw) : null;
  } catch {
    fromCookie = null;
  }

  if (fromCookie && CTM_ID_RE.test(fromCookie)) {
    if (fromClient) {
      console.warn('[lead] non-CTM sid from browser; using __ctmid cookie');
    }
    return fromCookie;
  }
  if (fromClient) {
    console.warn('[lead] sid not CTM-shaped and no cookie — no visit will attach');
    return fromClient;
  }
  console.warn('[lead] no CTM session id — t.js likely blocked');
  return null;
}

/** Bounded string, or null. Attribution values are client-controlled. */
function str(v: unknown, max = 500): string | null {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
}

/**
 * Rebuilds the attribution block rather than passing the client's object
 * through. This endpoint is public and unauthenticated, and every value here is
 * shaped entirely by the caller, so each field is picked by name, type-checked
 * and length-capped. `utm` is flattened to five known keys, which also stops a
 * nested object or a prototype-polluting key from reaching the email builder.
 */
function attribution(body: LeadFields, request: Request) {
  const rawUtm =
    body.utm && typeof body.utm === 'object' && !Array.isArray(body.utm)
      ? (body.utm as Record<string, unknown>)
      : {};
  const utm: Record<string, string> = {};
  for (const k of ['source', 'medium', 'campaign', 'term', 'content']) {
    const v = str(rawUtm[k], 200);
    if (v) utm[k] = v;
  }

  return {
    pageUrl: str(body.page_url, 1000),
    landingPageUrl: str(body.landing_page_url, 1000),
    referrer: str(body.referrer, 1000),
    utm,
    gclid: str(body.gclid, 200),
    wbraid: str(body.wbraid, 200),
    gbraid: str(body.gbraid, 200),
    fbclid: str(body.fbclid, 200),
    msclkid: str(body.msclkid, 200),
    ctmVisitorSid: ctmVisitorSid(body, request),
  };
}

type Attribution = ReturnType<typeof attribution>;

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

async function sendViaResend(
  fields: {
    name: string;
    phone: string;
    email: string;
    insurance: string;
    memberId: string;
    message: string;
    formKey: string;
  },
  attr: Attribution,
) {
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

  // Attribution goes in its own table below the person's details, not mixed in
  // with them. Whoever picks this lead up is calling someone back, and the
  // click id is not part of that conversation — but it is the only copy that
  // exists, because this email IS the fallback for Clarion not recording it.
  const clickId =
    (attr.gclid && `gclid ${attr.gclid}`) ||
    (attr.wbraid && `wbraid ${attr.wbraid}`) ||
    (attr.gbraid && `gbraid ${attr.gbraid}`) ||
    (attr.fbclid && `fbclid ${attr.fbclid}`) ||
    (attr.msclkid && `msclkid ${attr.msclkid}`) ||
    '—';
  const utmSummary = Object.entries(attr.utm)
    .map(([k, v]) => `${k}=${v}`)
    .join(' · ');
  const attrRows: Array<[string, string]> = [
    ['Campaign', utmSummary || '— (no utm parameters)'],
    ['Click ID', clickId],
    ['Landing page', attr.landingPageUrl || '—'],
    ['Submitted from', attr.pageUrl || '—'],
    ['Referrer', attr.referrer || '— (direct)'],
    [
      'CTM visitor session',
      attr.ctmVisitorSid ??
        '— NONE. t.js was blocked or absent; this lead attaches to no CTM visit.',
    ],
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
</table>
<h3 style="margin-top:20px">Attribution</h3>
<table cellpadding="6" style="border-collapse:collapse;font-size:13px">
${attrRows
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

  // Resolved before the validity check on purpose. `ctm_attached` is reported on
  // the 422 as well as on success, which is what makes the server-side half of
  // this integration testable: a deliberately incomplete POST can assert that
  // the `__ctmid` cookie was recovered without ever creating a lead or sending
  // an email. It is also the field to watch in production — false across a run
  // of real leads means t.js has stopped loading.
  const attr = attribution(body, request);
  const ctmAttached = Boolean(
    attr.ctmVisitorSid && CTM_ID_RE.test(attr.ctmVisitorSid),
  );

  // Name plus at least one way to reach the person back. The insurance form
  // requires a phone in markup; /contact accepts phone OR email.
  if (!fields.name || !(fields.phone || fields.email)) {
    return NextResponse.json(
      {
        ok: false,
        delivered: false,
        error: 'missing_required_fields',
        ctm_attached: ctmAttached,
      },
      { status: 422 },
    );
  }

  const delivery = await sendViaResend(fields, attr);

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
      // Attribution is safe to log where the message body is not: it describes
      // the ad click, not the person. `ctmAttached` is the one field worth
      // alerting on — false across a run of leads means t.js has stopped
      // loading, and nothing else anywhere reports that.
      utm: Object.keys(attr.utm).length ? attr.utm : null,
      gclid: attr.gclid,
      landingPage: attr.landingPageUrl,
      ctmVisitorSid: attr.ctmVisitorSid,
      ctmAttached,
    }),
  );

  return NextResponse.json({
    ok: true,
    delivered: delivery.sent,
    reason: delivery.reason,
    ctm_attached: ctmAttached,
  });
}

/** Explicit 405 so a stray GET is unambiguous rather than a confusing 404. */
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'method_not_allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
