/**
 * Remote CMS blog cover check (audit CR-05, VIS-1).
 * The one Clarion-managed cover is hotlinked from an external host and stays a
 * plain <img> on purpose. Confirms it loads and decodes under the CSP.
 */
import { chromium } from 'playwright';
import { BASE, assertReachable } from './lib/base.mjs';

await assertReachable();
const browser = await chromium.launch();
const page = await browser.newPage();
const violations = [], imgResults = [];
page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text().slice(0,180)); });
page.on('response', r => { if (/images\.unsplash\.com/.test(r.url())) imgResults.push(`${r.status()} ${r.url().slice(0,70)}`); });
page.on('requestfailed', r => { if (/images\.unsplash\.com/.test(r.url())) imgResults.push(`FAILED ${r.failure()?.errorText} ${r.url().slice(0,60)}`); });
for (const p of ['/blog/', '/blog/what-to-expect-first-30-days-of-treatment/']) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const loaded = await page.evaluate(() => [...document.images]
    .filter(i => /unsplash/.test(i.currentSrc || i.src))
    .map(i => ({ complete: i.complete, w: i.naturalWidth, h: i.naturalHeight })));
  console.log(`${p}`);
  console.log('   unsplash <img> decoded:', JSON.stringify(loaded));
}
console.log('\nnetwork:', imgResults.length ? imgResults.join('\n         ') : '(none)');
console.log('CSP violations:', violations.length ? violations.join(' | ') : 'NONE — img-src allows it');
await browser.close();
