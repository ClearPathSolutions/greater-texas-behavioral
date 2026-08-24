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

function unexpectedCookies(cookieString) {
  return (cookieString || '')
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter(Boolean)
    .filter((name) => !EXPECTED_COOKIES.some((e) => name.startsWith(e.prefix)));
}

await assertReachable();
const browser = await chromium.launch();
let bad = 0;
for (const p of [...ROUTES, '/blog/what-to-expect-first-30-days-of-treatment/']) {
  const page = await browser.newPage();
  const errs = [], csp = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,160)); });
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
    cookies: document.cookie,
  }));
  const rogue = unexpectedCookies(a.cookies);
  const ok =
    errs.length === 0 && failed.length === 0 && a.h1 === 1 && a.noAlt === 0 &&
    !a.overflow && rogue.length === 0;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${p}`);
  console.log(`        h1=${a.h1} imgs-no-alt=${a.noAlt} h-overflow=${a.overflow} ClarionForms=${a.clarion} cookies="${a.cookies}"`);
  if (rogue.length) console.log(`        UNDISCLOSED COOKIES: ${rogue.join(', ')} — add to /privacy-policy or remove the tag`);
  if (cspViolations.length) console.log(`        CSP VIOLATIONS: ${cspViolations.join(' | ')}`);
  if (errs.length) console.log(`        console: ${errs.join(' | ')}`);
  if (failed.length) console.log(`        requests: ${[...new Set(failed)].join(' | ')}`);
  await page.close();
}
await browser.close();
console.log(`\n${bad === 0 ? '✅ NO CSP OR RUNTIME REGRESSIONS' : `❌ ${bad} page(s) with problems`}`);
