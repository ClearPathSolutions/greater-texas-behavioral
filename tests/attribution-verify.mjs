/**
 * Attribution verification — CTM + Clarion, both intake forms.
 *
 * WHAT THIS PROVES, AND WHY IT NEEDS A BROWSER
 * All three ways this integration breaks are SILENT. Clarion returns 200, the
 * lead is delivered, and a rep can call the person back — only the link to the
 * ad click is missing. So "the lead arrived" proves nothing, and neither does a
 * curl harness: CTM's visitor session id only exists in a real browser, so a
 * node-only test produces a lead with no visit attached, which is exactly the
 * symptom under investigation. Everything below reads the ACTUAL request
 * payload out of a real page.
 *
 * The specific regression being locked down: `forms-capture.v1.js` reads
 * `utm`/`gclid` from `location.search` at submit time. Someone who lands on an
 * ad and then clicks through the nav to a form submits from a clean URL, and
 * their lead files as direct traffic. The nav click is the normal path, so this
 * has to be tested across a CLIENT-SIDE navigation — a hard reload of the form
 * page with the campaign still in the URL passes even when nothing is fixed.
 *
 * SAFETY, both properties worth preserving:
 *  - Clarion's submit endpoint is MOCKED, so no real lead is ever created.
 *  - `264810.tctm.co` is BLOCKED and `window.__ctm` is stubbed with a known
 *    24-hex id. Loading real t.js would start a live visitor session in the
 *    production CTM account on every scenario, and the assertions would then
 *    depend on a third party being up.
 *  - The server-side section posts DELIBERATELY INVALID leads, so it exercises
 *    the cookie-recovery path and returns 422 without creating anything.
 */
import { chromium } from 'playwright';
import { BASE, assertReachable } from './lib/base.mjs';

const CLARION_SUBMIT = /api\.clarionlabs\.ai\/forms\/public\/submit/;
const CTM_HOST = /tctm\.co/;

/** Shaped exactly like a real CTM sid: 24 hex, and chars 8-16 encode aid 264810. */
const STUB_SID = '6a88a9cc00040a6a4743909d';
/** The wrong thing to send. Present here so the guard against it is tested. */
const APP_UUID = 'f01079ad-73b9-4e58-abbb-a2dc68b7faac';
const CTM_ID = /^[0-9a-f]{24}$/i;

const CAMPAIGN =
  '?utm_source=test&utm_medium=cpc&utm_campaign=rollout&utm_term=detox' +
  '&gclid=TEST123&wbraid=WB456';

const FORMS = {
  insurance: {
    path: '/verify-insurance/',
    navLink: 'header a[href="/verify-insurance/"]',
    fill: async (page) => {
      await page.fill('#name', 'QA Attribution');
      await page.fill('#phone', '5125550147');
      await page.fill('#email', 'qa@example.invalid');
    },
  },
  contact: {
    path: '/contact/',
    navLink: 'header a[href="/contact/"]',
    fill: async (page) => {
      await page.fill('#contact-name', 'QA Attribution');
      await page.fill('#contact-phone', '5125550147');
      await page.fill('#contact-message', 'Testing attribution.');
    },
  },
};

const results = [];
function check(label, pass, detail) {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}`);
  if (detail) console.log(`        ${detail}`);
}

await assertReachable();
const browser = await chromium.launch();

/* ─────────────── browser: the Clarion payload, per form ─────────────── */
for (const [name, cfg] of Object.entries(FORMS)) {
  console.log(`\n───── ${name.toUpperCase()} FORM — Clarion payload ─────`);
  const context = await browser.newContext();
  // The cookie t.js would have set. Also proves the id survives without the
  // script, which is the whole reason CTM keeps it in a first-party cookie.
  await context.addCookies([
    { name: '__ctmid', value: STUB_SID, url: BASE },
  ]);
  const page = await context.newPage();
  await page.route(CTM_HOST, (r) => r.abort());
  await page.addInitScript(
    (sid) => {
      window.__ctm = { config: { aid: 264810, sid, host: '264810.tctm.co' } };
    },
    STUB_SID,
  );

  const posts = [];
  await page.route(CLARION_SUBMIT, async (route) => {
    posts.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  // Land on the ad, then reach the form the way a visitor actually does.
  await page.goto(BASE + '/' + CAMPAIGN, { waitUntil: 'networkidle' });
  await page.click(cfg.navLink);
  await page.waitForURL('**' + cfg.path + '**');
  await page.waitForTimeout(1200);

  await cfg.fill(page);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  const p = posts[0] || {};
  check(`${name}: exactly one Clarion submission`, posts.length === 1,
    `posts=${posts.length}`);
  check(`${name}: utm survived the navigation`,
    p.utm?.source === 'test' && p.utm?.medium === 'cpc' &&
    p.utm?.campaign === 'rollout' && p.utm?.term === 'detox',
    `utm=${JSON.stringify(p.utm)}`);
  check(`${name}: gclid survived the navigation`, p.gclid === 'TEST123',
    `gclid=${p.gclid}`);
  check(`${name}: ctm_visitor_sid is flat, top-level and CTM-shaped`,
    CTM_ID.test(p.ctm_visitor_sid || '') && p.ctm_visitor_sid === STUB_SID,
    `ctm_visitor_sid=${p.ctm_visitor_sid}`);
  check(`${name}: ctm_visitor_sid is not an app UUID`,
    !String(p.ctm_visitor_sid).includes('-'),
    `ctm_visitor_sid=${p.ctm_visitor_sid}`);
  check(`${name}: landing_page_url is the campaign entry page, not the form`,
    typeof p.landing_page_url === 'string' &&
    p.landing_page_url.includes('utm_source=test') &&
    !p.landing_page_url.includes(cfg.path),
    `landing_page_url=${p.landing_page_url}`);
  // The vendor collects no wbraid/gbraid at all; we forward them in `data`.
  check(`${name}: wbraid forwarded (vendor drops it entirely)`,
    p.data?.wbraid === 'WB456', `data.wbraid=${p.data?.wbraid}`);

  await context.close();
}

/* ── browser: the fallback path carries attribution when Clarion is down ── */
for (const [name, cfg] of Object.entries(FORMS)) {
  console.log(`\n───── ${name.toUpperCase()} FORM — /api/lead/ fallback payload ─────`);
  const context = await browser.newContext();
  await context.addCookies([{ name: '__ctmid', value: STUB_SID, url: BASE }]);
  const page = await context.newPage();
  await page.route(CTM_HOST, (r) => r.abort());
  await page.addInitScript((sid) => {
    window.__ctm = { config: { aid: 264810, sid, host: '264810.tctm.co' } };
  }, STUB_SID);

  // Clarion refuses (the "origin not allowlisted" case) so the client falls back.
  await page.route(CLARION_SUBMIT, (route) =>
    route.fulfill({ status: 403, contentType: 'application/json', body: '{}' }));

  const fallback = [];
  await page.route(/\/api\/lead\/?(\?|$)/, async (route) => {
    fallback.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, delivered: true }),
    });
  });

  await page.goto(BASE + '/' + CAMPAIGN, { waitUntil: 'networkidle' });
  await page.click(cfg.navLink);
  await page.waitForURL('**' + cfg.path + '**');
  await page.waitForTimeout(1200);
  await cfg.fill(page);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(6000);

  const f = fallback[0] || {};
  check(`${name}: fallback fired exactly once`, fallback.length === 1,
    `posts=${fallback.length}`);
  check(`${name}: fallback carries flat ctm_visitor_sid`,
    f.ctm_visitor_sid === STUB_SID, `ctm_visitor_sid=${f.ctm_visitor_sid}`);
  check(`${name}: fallback carries the campaign`,
    f.utm?.source === 'test' && f.gclid === 'TEST123',
    `utm=${JSON.stringify(f.utm)} gclid=${f.gclid}`);
  check(`${name}: fallback carries the first-touch landing page`,
    typeof f.landing_page_url === 'string' &&
    f.landing_page_url.includes('utm_source=test'),
    `landing_page_url=${f.landing_page_url}`);
  check(`${name}: fallback still identifies the form`, f.form_key === (
    name === 'insurance' ? 'insurance_verification' : 'contact'),
    `form_key=${f.form_key}`);

  await context.close();
}

/* ── browser: no campaign anywhere must not invent one ── */
{
  console.log('\n───── ORGANIC VISIT — no campaign is fabricated ─────');
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(CTM_HOST, (r) => r.abort());
  const posts = [];
  await page.route(CLARION_SUBMIT, async (route) => {
    posts.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.click(FORMS.contact.navLink);
  await page.waitForURL('**/contact/**');
  await page.waitForTimeout(1200);
  await FORMS.contact.fill(page);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  const p = posts[0] || {};
  check('organic: no utm invented', !p.utm, `utm=${JSON.stringify(p.utm)}`);
  check('organic: no gclid invented', !p.gclid, `gclid=${p.gclid}`);
  // t.js is blocked and no cookie was set, so null is the CORRECT answer here.
  check('organic: ctm_visitor_sid is null, never a substitute id',
    p.ctm_visitor_sid == null, `ctm_visitor_sid=${p.ctm_visitor_sid}`);
  check('organic: URL was not polluted with restored params',
    !page.url().includes('utm_'), `url=${page.url()}`);
  await context.close();
}

await browser.close();

/* ─────────── server: __ctmid recovery, without creating a lead ─────────── */
console.log('\n───── SERVER — /api/lead/ CTM id resolution ─────');

// Deliberately invalid (no name), so every request below 422s and nothing is
// ever delivered. `ctm_attached` is still reported on that path.
//
// Each probe declares its own X-Forwarded-For. The route rate-limits to 5 posts
// per minute PER IP, and there are more probes than that — sharing one bucket
// would 429 the last of them and report a confusing `undefined` instead of an
// honest failure. Distinct IPs also document what the limiter keys on.
let probeN = 0;
async function probe({ cookie, sid }) {
  const res = await fetch(BASE + '/api/lead/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': `203.0.113.${++probeN}`,
      ...(cookie ? { Cookie: `__ctmid=${cookie}` } : {}),
    },
    body: JSON.stringify({ form_key: 'contact', ctm_visitor_sid: sid }),
  });
  const body = await res.json();
  if (res.status === 429) {
    console.log('        !! rate limited — probe result is not meaningful');
  }
  return { status: res.status, body };
}

const good = await probe({ sid: STUB_SID });
check('server: accepts a CTM-shaped sid from the browser',
  good.status === 422 && good.body.ctm_attached === true,
  `status=${good.status} ctm_attached=${good.body.ctm_attached}`);

const recovered = await probe({ cookie: STUB_SID, sid: APP_UUID });
check('server: rejects an app UUID and recovers __ctmid from the cookie',
  recovered.body.ctm_attached === true,
  `ctm_attached=${recovered.body.ctm_attached} (sent UUID, cookie present)`);

const uuidOnly = await probe({ sid: APP_UUID });
check('server: a UUID with no cookie is NOT reported as attached',
  uuidOnly.body.ctm_attached === false,
  `ctm_attached=${uuidOnly.body.ctm_attached}`);

const nothing = await probe({});
check('server: no sid and no cookie is honestly unattached',
  nothing.body.ctm_attached === false,
  `ctm_attached=${nothing.body.ctm_attached}`);

// A cookie from a different CTM account is shaped perfectly and attributes to
// nothing. It is still passed through (a wrong id is evidence), but it must be
// recognisable: chars 8-16 hex-decode to the account id.
const foreign = '6a88a9cc00099999' + '4743909d';
const foreignRes = await probe({ cookie: foreign });
check('server: a foreign-account cookie is still shaped like a CTM id',
  foreignRes.body.ctm_attached === true &&
  parseInt(foreign.substring(8, 16), 16) !== 264810,
  `decoded aid=${parseInt(foreign.substring(8, 16), 16)} (warned, not dropped)`);

const passed = results.filter(Boolean).length;
console.log(`\n${results.every(Boolean)
  ? `✅ ALL ${results.length} ATTRIBUTION CHECKS PASS`
  : `❌ ${results.length - passed}/${results.length} ATTRIBUTION CHECKS FAILED`}`);
console.log(
  '\nNOTE: this proves the payload leaving the browser is correct. It CANNOT\n' +
  'prove CTM filed the lead against the visit — that requires opening the visit\n' +
  'in CallTrackingMetrics. No 200 response substitutes for that check.',
);
process.exit(results.every(Boolean) ? 0 : 1);
