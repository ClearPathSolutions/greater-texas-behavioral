/**
 * Responsive + mobile-menu check (audit CR-05).
 * Includes the CR-04 regression: opening the mobile menu and crossing the `lg`
 * breakpoint used to leave body.style.overflow permanently 'hidden'.
 */
import { chromium } from 'playwright';
import { BASE, ROUTES, assertReachable } from './lib/base.mjs';

await assertReachable();
const PAGES = ROUTES;
const WIDTHS = [360, 768, 1440];
const browser = await chromium.launch();
let bad = 0;
for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const over = [];
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const o = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (o) over.push(p);
  }
  console.log(`${over.length ? 'FAIL' : 'PASS'}  ${w}px  h-overflow on: ${over.length ? over.join(', ') : 'none'}`);
  if (over.length) bad++;
  await page.close();
}
// Mobile menu still keyboard-accessible with the new trailing-slash hrefs
const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
const toggle = page.locator('header button[aria-controls="mobile-menu"]');
const btn = toggle;
await btn.click();
await page.waitForTimeout(500);
const menu = await page.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]');
  return {
    opened: !!dlg,
    links: dlg ? [...dlg.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(h => h?.startsWith('/')) : [],
    focusInside: dlg ? dlg.contains(document.activeElement) : false,
  };
});
console.log(`${menu.opened ? 'PASS' : 'FAIL'}  mobile menu opens=${menu.opened} focus-trapped=${menu.focusInside}`);
console.log(`        hrefs: ${menu.links.join(' ')}`);
await page.keyboard.press('Escape');
await page.waitForTimeout(900);
// The panel stays mounted and toggles visibility classes, so assert on the
// toggle's aria-expanded plus the panel actually being invisible.
const closed = await page.evaluate(() => {
  const t = document.querySelector('header button[aria-controls="mobile-menu"]');
  const dlg = document.querySelector('[role="dialog"]');
  const wrap = dlg?.parentElement;
  return t?.getAttribute('aria-expanded') === 'false'
    && !!wrap && getComputedStyle(wrap).visibility === 'hidden';
});
console.log(`${closed ? 'PASS' : 'FAIL'}  Escape closes menu=${closed}`);
if (!menu.opened || !closed) bad++;
await page.close();

// ── CR-04 regression: menu open + viewport crosses `lg` ──────────────────────
//
// Both the panel and its toggle are `lg:hidden`. Before the fix, crossing 1024px
// with the menu open left `document.body.style.overflow = 'hidden'` with no UI
// able to clear it — the page was unscrollable until a reload, reachable by an
// ordinary iPad portrait->landscape rotation.
const resize = await browser.newPage({ viewport: { width: 820, height: 900 } });
await resize.goto(BASE + '/', { waitUntil: 'networkidle' });
await resize.click('header button[aria-controls="mobile-menu"]');
await resize.waitForTimeout(400);
const locked = await resize.evaluate(() => document.body.style.overflow);

// Cross the breakpoint, as a tablet rotation does.
await resize.setViewportSize({ width: 1180, height: 820 });
await resize.waitForTimeout(600);

// Use a REAL wheel event, not window.scrollTo: programmatic scrolling still
// moves scrollY even while `body { overflow: hidden }` blocks the user, so
// scrollTo reports "scrolls fine" on the very bug this is testing for. Wheel
// input is the actual symptom a person hits.
//
// (`globals.css` also sets `html { scroll-behavior: smooth }`, so the position
// is animated — hence the wait before measuring.)
await resize.mouse.move(590, 400);
await resize.mouse.wheel(0, 1200);
await resize.waitForTimeout(600);

const after = await resize.evaluate(() => ({
  overflow: document.body.style.overflow,
  scrollY: Math.round(window.scrollY),
  scrolled: window.scrollY > 100,
  expanded: document
    .querySelector('header button[aria-controls="mobile-menu"]')
    ?.getAttribute('aria-expanded'),
}));

const cr04 = after.overflow === '' && after.scrolled;
console.log(`${cr04 ? 'PASS' : 'FAIL'}  CR-04 resize past lg with menu open`);
console.log(`        locked-while-open="${locked}" after-resize overflow="${after.overflow}" scrollY=${after.scrollY} scrolls=${after.scrolled} aria-expanded=${after.expanded}`);
if (!cr04) {
  bad++;
  console.log('        !! page scroll is stuck — CR-04 has regressed');
}
await resize.close();

await browser.close();
console.log(`\n${bad === 0 ? '✅ RESPONSIVE + MENU OK' : `❌ ${bad} problem group(s)`}`);
