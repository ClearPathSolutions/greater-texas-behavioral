/**
 * Desktop nav fit check (audit CR-05).
 * Guards the regression where adding a 5th nav item wrapped the nav onto two
 * lines at exactly 1024px. Keep `whitespace-nowrap` on the nav links.
 */
import { chromium } from 'playwright';
import { BASE, assertReachable } from './lib/base.mjs';

await assertReachable();
const browser = await chromium.launch();
let bad = 0;
for (const w of [1024, 1100, 1152, 1280, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const header = document.querySelector('header');
    const nav = header?.querySelector('nav[aria-label="Primary"]');
    // Only the top-level nav triggers — exclude the absolutely-positioned
    // dropdown panel, which sits at a different y even when closed.
    const tops = nav
      ? [...nav.querySelectorAll(':scope > *')].map((li) => {
          const trigger = li.querySelector(':scope > a, :scope > button') ?? li;
          return Math.round(trigger.getBoundingClientRect().top);
        })
      : [];
    const row = header?.querySelector('.container-x > div') ?? header;
    return {
      navVisible: nav ? getComputedStyle(nav).display !== 'none' : false,
      triggerRows: new Set(tops).size,
      navOverflows: nav ? nav.scrollWidth > nav.clientWidth + 1 : false,
      rowOverflows: row ? row.scrollWidth > row.clientWidth + 1 : false,
      headerH: Math.round(header?.getBoundingClientRect().height ?? 0),
      pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  const ok = r.navVisible && r.triggerRows === 1 && !r.navOverflows && !r.rowOverflows && !r.pageOverflow;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(w).padEnd(5)} nav-visible=${r.navVisible} trigger-rows=${r.triggerRows} nav-overflow=${r.navOverflows} row-overflow=${r.rowOverflows} header-h=${r.headerH}px page-overflow=${r.pageOverflow}`);
  await page.close();
}
await browser.close();
console.log(`\n${bad === 0 ? '✅ HEADER NAV FITS AT ALL DESKTOP WIDTHS' : `❌ ${bad} width(s) with header problems`}`);
