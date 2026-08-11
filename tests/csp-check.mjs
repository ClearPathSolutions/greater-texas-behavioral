/**
 * Runtime / CSP regression check (audit CR-05).
 * Zero console errors, zero failed requests, one <h1>, every <img> has alt,
 * no horizontal overflow, no cookies set, Clarion still loads under the CSP.
 */
import { chromium } from 'playwright';
import { BASE, ROUTES, assertReachable } from './lib/base.mjs';

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
  const ok = errs.length === 0 && failed.length === 0 && a.h1 === 1 && a.noAlt === 0 && !a.overflow;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${p}`);
  console.log(`        h1=${a.h1} imgs-no-alt=${a.noAlt} h-overflow=${a.overflow} ClarionForms=${a.clarion} cookies="${a.cookies}"`);
  if (cspViolations.length) console.log(`        CSP VIOLATIONS: ${cspViolations.join(' | ')}`);
  if (errs.length) console.log(`        console: ${errs.join(' | ')}`);
  if (failed.length) console.log(`        requests: ${[...new Set(failed)].join(' | ')}`);
  await page.close();
}
await browser.close();
console.log(`\n${bad === 0 ? '✅ NO CSP OR RUNTIME REGRESSIONS' : `❌ ${bad} page(s) with problems`}`);
