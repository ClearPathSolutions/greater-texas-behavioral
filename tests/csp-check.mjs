/**
 * Runtime / CSP regression check (audit CR-05).
 * Zero console errors, zero failed requests, one <h1>, every <img> has alt,
 * no horizontal overflow, only expected cookies, Clarion still loads under the CSP.
 *
 * COOKIES ARE NOW ASSERTED, not just printed (added 2026-08-11 with CR-22).
 * They used to be displayed and ignored, which meant adding GTM +
 * CallTrackingMetrics set a `__ctmid` cookie and the suite still said PASS —
 * even though /privacy-policy was written from the verified fact that this site
 * set no cookies. Anything not in EXPECTED_COOKIES now fails, so the next tag
 * that starts writing to the browser surfaces here instead of silently making a
 * compliance document wrong.
 *
 * CALLTRACKINGMETRICS IS ASSERTED, AND ONLY LOADED ONCE (added 2026-08-24).
 * Every way the CTM integration breaks is silent — leads still arrive and
 * Clarion still returns 200; only the link to the ad click is missing. So the
 * install is checked positively on the FIRST route: account id, a CTM-shaped
 * session id, the `__ctmid` cookie agreeing with it, and above all EXACTLY ONE
 * t.js tag. That last one matters because the GTM container is a loader — a CTM
 * tag added there on top of the one in the template gives two copies, which
 * double-counts sessions and makes the number swap unpredictable, and nothing
 * else in this repo would notice.
 *
 * THE CHECK THAT ACTUALLY MATTERS is `__ctm_tracked_numbers` — but it is
 * reported, NOT asserted, and the reason is worth knowing before you "fix" it.
 * CTM rules are domain-scoped. Account 264810's only GTB rule ("GTBC Ads")
 * matches `www.greatertexasbehavioral.com` and targets 830-264-1545, which this
 * site does not publish; the catch-all rule targets 877-834-0743, also absent.
 * The page renders 877-590-3665. So the count is 0 everywhere and no change in
 * this repo can move it — it needs a CTM account change. Gating on it would ship
 * a permanently red suite. See ISSUES.md CR-24.
 *
 * On `__ctm_tracked_numbers` generally: `config.sid` and
 * the `__ctmid` cookie populate even when the number scan found nothing at all,
 * so asserting those proves only that a session exists — not that the product
 * works. A non-empty `__ctm_tracked_numbers` is what proves the scan located the
 * page's phone numbers and the swap can happen. It is also the specific thing a
 * synchronous t.js tag breaks, silently: `async` is required, and `asyncAttr` is
 * asserted here so a well-meaning revert fails the suite instead of shipping.
 *
 * t.js is BLOCKED on the remaining routes. Every page that loads it opens a real
 * visitor session in the live CTM account, and there is no reason to put ten QA
 * visits into a production attribution account per run: the CSP comes from a
 * single `/:path*` rule, so proving t.js loads under it once proves it
 * everywhere.
 *
 * KNOWN-BENIGN REQUEST NOISE — see IGNORED_REQUESTS. Clarion's two scripts each
 * fire an install beacon on load, and Clarion pins its API to an origin
 * allowlist, so from a non-allowlisted origin the preflight is refused. That is
 * ISSUES.md CR-23 and it is NOT caused by this repo. It is excluded from the
 * pass/fail decision — otherwise every route fails and a real regression cannot
 * be seen — but it is still PRINTED on every run, because the underlying cause
 * is a real misconfiguration that should not be allowed to go quiet.
 */
import { chromium } from 'playwright';
import { BASE, ROUTES, assertReachable } from './lib/base.mjs';

/**
 * Cookie names this site is knowingly allowed to set, with the disclosure that
 * covers each. Adding a name here without updating /privacy-policy is the
 * failure mode this list exists to prevent.
 */
const EXPECTED_COOKIES = [
  // CallTrackingMetrics — call attribution + dynamic number insertion.
  { prefix: '__ctmid', why: 'CTM visitor id' },
  { prefix: 'ct264810', why: 'CTM account-scoped session' },
  // The GTM container sets none itself; these come from the tags inside it.
  { prefix: '_ga', why: 'Google Analytics' },
  { prefix: '_gid', why: 'Google Analytics' },
  { prefix: '_gcl', why: 'Google Ads click id' },
  // Microsoft Clarity — session recording.
  { prefix: '_clck', why: 'Clarity user id' },
  { prefix: '_clsk', why: 'Clarity session' },
  { prefix: 'CLID', why: 'Clarity id' },
  { prefix: 'SM', why: 'Clarity/Microsoft sync' },
  // ⚠️ MICROSOFT ADVERTISING — not analytics. MUID is a cross-site advertising
  // identifier and Clarity syncs it to c.bing.com. Listed so the suite reflects
  // the CURRENT disclosed state — this is not an endorsement. If CR-22 is
  // decided against advertising sync, these four should stop appearing and this
  // block should be deleted so their return is caught as a regression.
  { prefix: 'MUID', why: 'Microsoft cross-site advertising id — see CR-22' },
  { prefix: 'MR', why: 'Microsoft advertising — see CR-22' },
  { prefix: 'SRM_B', why: 'Microsoft advertising — see CR-22' },
  { prefix: 'ANONCHK', why: 'Microsoft advertising — see CR-22' },
];

/** Vendor install beacon — origin-dependent, never caused by our code (CR-23). */
const IGNORED_REQUESTS = [/clarionlabs\.ai\/webchat\/public\/installed/];
const IGNORABLE_ERROR = /blocked by CORS policy|ERR_FAILED|Failed to load resource/i;
const CTM_REQUEST = /tctm\.co/;
/** CTM's visitor session id: 24 hex, no dashes. A UUID is NOT this. */
const CTM_ID = /^[0-9a-f]{24}$/i;
const CTM_AID = 264810;

function ignorable(text) {
  return IGNORED_REQUESTS.some((re) => re.test(text)) && IGNORABLE_ERROR.test(text);
}

function unexpectedCookies(cookieString) {
  return (cookieString || '')
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter(Boolean)
    .filter((name) => !EXPECTED_COOKIES.some((e) => name.startsWith(e.prefix)));
}

await assertReachable();
const browser = await chromium.launch();
const allRoutes = [...ROUTES, '/blog/what-to-expect-first-30-days-of-treatment/'];
let bad = 0;
let sawVendorBeaconFailure = false;
for (const [i, p] of allRoutes.entries()) {
  const checkCtm = i === 0;
  const page = await browser.newPage();
  // Keep QA traffic out of the live CTM account. See the header note.
  if (!checkCtm) await page.route(CTM_REQUEST, (r) => r.abort());
  const errs = [], csp = [], failed = [];
  // The message text of a failed subresource is just "Failed to load resource:
  // net::ERR_FAILED" with no URL in it, so the location is appended — otherwise
  // a vendor beacon cannot be told apart from a genuinely broken asset.
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const at = m.location()?.url || '';
    errs.push(m.text().slice(0,160) + (at ? ` @ ${at.slice(0,90)}` : ''));
  });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0,160)));
  page.on('requestfailed', r => failed.push(`${r.url().slice(0,80)} ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0,80)}`); });
  await page.goto(BASE + p, { waitUntil: 'networkidle' }).catch(()=>{});
  await page.waitForTimeout(2500);
  const cspViolations = errs.filter(e => /Content Security Policy|violates the following/i.test(e));
  const a = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    noAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    clarion: !!window.ClarionForms,
    ctmAid: window.__ctm?.config?.aid ?? null,
    ctmSid: window.__ctm?.config?.sid ?? null,
    // `tctm.co/t.js`, NOT `*="tctm.co"`: t.js injects its own p.js from the same
    // host, so the looser match reports 2 on a CORRECT install. Deleting that
    // "duplicate" breaks CTM.
    tjsTags: document.querySelectorAll('script[src*="tctm.co/t.js"]').length,
    // Must be true. A sync tag scans a DOM with no phone numbers in it yet.
    asyncAttr: document.querySelector('script[src*="tctm.co/t.js"]')?.async ?? null,
    // The one that proves the scan actually found the page's numbers.
    trackedNumbers: Object.keys(window.__ctm_tracked_numbers || {}).length,
    // Rendered tel: links, to confirm a swap really happened.
    telLinks: [...new Set([...document.querySelectorAll('a[href^="tel:"]')]
      .map((a) => a.getAttribute('href')))],
    ctmid: (document.cookie.match(/__ctmid=([^;]*)/) || [])[1] ?? null,
    cookies: document.cookie,
    dataLayer: Array.isArray(window.dataLayer),
  }));
  const rogue = unexpectedCookies(a.cookies);

  // A request this script aborted on purpose is not a regression.
  const deliberatelyBlocked = (t) => !checkCtm && CTM_REQUEST.test(t);
  const beaconNoise = [...errs, ...failed].filter(ignorable);
  if (beaconNoise.length) sawVendorBeaconFailure = true;
  const realErrs = errs.filter(e => !ignorable(e) && !deliberatelyBlocked(e));
  const realFailed = failed.filter(f => !ignorable(f) && !deliberatelyBlocked(f));

  // Q1 of the CTM rollout spec, asserted rather than eyeballed.
  // `trackedNumbers` is deliberately NOT in this gate, even though it is the
  // check that proves the swap works. CTM's rules are domain-scoped, and the
  // only GTB rule in account 264810 ("GTBC Ads") matches
  // www.greatertexasbehavioral.com and looks for 830-264-1545 — a number this
  // site does not publish. So it reports 0 from localhost, from the Vercel
  // alias, and from the apex, for reasons no code change here can fix. Gating on
  // it would mean shipping a permanently red suite and teaching everyone to
  // ignore it. It is printed prominently instead. See ISSUES.md CR-24.
  const ctmOk = !checkCtm || (
    a.ctmAid === CTM_AID && a.tjsTags === 1 && a.asyncAttr === true &&
    CTM_ID.test(a.ctmSid || '') && CTM_ID.test(a.ctmid || '') && a.ctmSid === a.ctmid
  );

  const ok =
    realErrs.length === 0 && realFailed.length === 0 && a.h1 === 1 &&
    a.noAlt === 0 && !a.overflow && rogue.length === 0 && a.clarion &&
    a.dataLayer && ctmOk;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${p}`);
  console.log(`        h1=${a.h1} imgs-no-alt=${a.noAlt} h-overflow=${a.overflow} ClarionForms=${a.clarion} dataLayer=${a.dataLayer} cookies="${a.cookies}"`);
  if (checkCtm) {
    console.log(`        CTM: aid=${a.ctmAid} t.js-tags=${a.tjsTags} async=${a.asyncAttr} sid=${a.ctmSid} __ctmid=${a.ctmid} match=${a.ctmSid === a.ctmid}`);
    console.log(`        CTM: tracked-numbers=${a.trackedNumbers} tel-links=${JSON.stringify(a.telLinks)}`);
    if (a.tjsTags > 1) console.log('        !! TWO COPIES OF t.js — check for a CTM tag inside the GTM container (count with tctm.co/t.js, not tctm.co)');
    else if (a.asyncAttr !== true) console.log('        !! t.js IS NOT async — the number scan runs before the numbers exist. Do not revert this.');
    else if (a.trackedNumbers === 0) console.log('        ⚠️  SCAN FOUND NO NUMBERS — sid and cookie are set but NO SWAP HAPPENS. Not a code fault; see ISSUES.md CR-24.');
    else if (!ctmOk) console.log('        !! CTM NOT CORRECTLY INSTALLED — leads will attach to no visit');
  }
  if (rogue.length) console.log(`        UNDISCLOSED COOKIES: ${rogue.join(', ')} — add to /privacy-policy or remove the tag`);
  if (cspViolations.length) console.log(`        CSP VIOLATIONS: ${cspViolations.join(' | ')}`);
  if (realErrs.length) console.log(`        console: ${realErrs.join(' | ')}`);
  if (realFailed.length) console.log(`        requests: ${[...new Set(realFailed)].join(' | ')}`);
  await page.close();
}
await browser.close();
if (sawVendorBeaconFailure) {
  const local = /^https?:\/\/(127\.0\.0\.1|localhost)/.test(BASE);
  console.log(
    "\n⚠️  Clarion's install beacon (/webchat/public/installed) failed. Excluded\n" +
    '    from the result above: it is origin-dependent and not caused by this repo.',
  );
  console.log(
    local
      ? '    EXPECTED here — BASE is localhost, which is not on Clarion\'s origin\n' +
        '    allowlist and does not need to be. Verified 2026-08-24: the apex, www\n' +
        '    and greater-texas-behavioral.vercel.app all pass a CORS preflight on\n' +
        '    this endpoint AND on /forms/public/submit (204, origin echoed), so the\n' +
        '    allowlist is correctly configured. Re-run with BASE=<production origin>\n' +
        '    to check it there.'
      : '    ⚠️  NOT EXPECTED — BASE is not localhost, and the production origins are\n' +
        '    verified allowlisted. This is a real finding: investigate rather than\n' +
        '    assuming the origin allowlist. See ISSUES.md CR-23.',
  );
}
console.log(`\n${bad === 0 ? '✅ NO CSP OR RUNTIME REGRESSIONS' : `❌ ${bad} page(s) with problems`}`);
process.exit(bad === 0 ? 0 : 1);
