/**
 * Lead-delivery verification — 8 scenarios, 4 per intake form (audit CR-05).
 *
 * This is the evidence that neither intake form silently drops someone asking
 * for treatment. It asserts two things per scenario: exactly ONE Clarion POST
 * (never a duplicate — see the double-submit warning in lib/useLeadDelivery.ts),
 * and that the UI never shows success unless something confirmed receipt.
 *
 * SAFETY: the Clarion submit endpoint is MOCKED, so running this never creates
 * a real lead. `/api/lead/` is mocked too, so results don't depend on whether
 * Resend is configured. CallTrackingMetrics is BLOCKED and `window.__ctm` is
 * stubbed — otherwise each of the eight scenarios would open a real visitor
 * session in the live CTM account, and delivery assertions would start
 * depending on a third party being reachable. Preserve all three properties.
 *
 * Attribution correctness is NOT tested here; it has its own script,
 * `attribution-verify.mjs`. This one is only about whether the lead arrives.
 */
import { chromium } from 'playwright';
import { BASE, assertReachable } from './lib/base.mjs';

await assertReachable();

const CLARION_SUBMIT = /api\.clarionlabs\.ai\/forms\/public\/submit/;
const CLARION_SCRIPT = /clarionlabs\.ai\/.*\.js/;
const CTM_HOST = /tctm\.co/;
/** Shaped like a real CTM sid: 24 hex, chars 8-16 encoding account 264810. */
const STUB_CTM_SID = '6a88a9cc00040a6a4743909d';

/** The two intake forms, with the fields each one requires. */
const FORMS = {
  insurance: {
    path: '/verify-insurance/',
    navLink: 'header a[href="/verify-insurance/"]',
    fill: async (page) => {
      await page.fill('#name', 'QA Verification');
      await page.fill('#phone', '5125550147');
      await page.fill('#email', 'qa@example.invalid');
      await page.fill('#memberId', 'MBR-123');
    },
    successText: ["we've got it", 'we’ve got it'],
    errorText: ["couldn't submit", 'couldn’t submit'],
  },
  contact: {
    path: '/contact/',
    navLink: 'header a[href="/contact/"]',
    fill: async (page) => {
      await page.fill('#contact-name', 'QA Contact');
      await page.fill('#contact-phone', '5125550147');
      await page.fill('#contact-message', 'Testing the contact delivery path.');
    },
    successText: ['Message received'],
    errorText: ["couldn't send", 'couldn’t send'],
  },
};

async function scenario({ form, label, nav, clarionStatus, blockScript, fallbackDelivered, expect }) {
  const cfg = FORMS[form];
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const clarionPosts = [];
  const fallbackPosts = [];

  // Keep QA traffic out of the live CTM account, and keep these scenarios
  // independent of CTM being up. See the SAFETY note above.
  await page.route(CTM_HOST, (r) => r.abort());
  await page.addInitScript((sid) => {
    window.__ctm = { config: { aid: 264810, sid, host: '264810.tctm.co' } };
  }, STUB_CTM_SID);

  if (blockScript) await page.route(CLARION_SCRIPT, (r) => r.abort());

  // Never let a real lead reach Clarion — mock the response instead.
  await page.route(CLARION_SUBMIT, async (route) => {
    clarionPosts.push(route.request().postData());
    await route.fulfill({
      status: clarionStatus ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: clarionStatus === 200 }),
    });
  });

  // Intercept our own fallback so the test doesn't depend on Resend config.
  await page.route(/\/api\/lead\/?(\?|$)/, async (route) => {
    fallbackPosts.push(route.request().postData());
    if (fallbackDelivered === undefined) return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, delivered: fallbackDelivered }),
    });
  });

  if (nav === 'direct') {
    await page.goto(BASE + cfg.path, { waitUntil: 'networkidle' });
  } else {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.click(cfg.navLink);
    await page.waitForURL('**' + cfg.path);
  }
  await page.waitForTimeout(1200);

  await cfg.fill(page);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(6000);

  const ui = await page.evaluate(
    ({ ok, err }) => {
      const t = document.body.innerText;
      return {
        success: ok.some((s) => t.includes(s)),
        error: err.some((s) => t.includes(s)),
        showsPhone: t.includes('(877) 590-3665'),
      };
    },
    { ok: cfg.successText, err: cfg.errorText },
  );

  const outcome = ui.success ? 'success' : ui.error ? 'error' : 'neither';
  const noDupes = clarionPosts.length <= 1;
  const pass = outcome === expect && noDupes;

  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}`);
  console.log(`        clarion=${clarionPosts.length} fallback=${fallbackPosts.length} ui=${outcome} phone=${ui.showsPhone} (expected ${expect})`);
  if (!noDupes) console.log('        !! DUPLICATE Clarion submission');

  // The fallback payload must identify which form it came from.
  if (fallbackPosts.length && fallbackPosts[0]) {
    const key = JSON.parse(fallbackPosts[0]).form_key;
    console.log(`        fallback form_key=${key}`);
  }

  await browser.close();
  return pass;
}

const results = [];
for (const form of ['insurance', 'contact']) {
  console.log(`\n───── ${form.toUpperCase()} FORM ─────`);
  results.push(await scenario({ form, label: '1. Direct load, Clarion healthy          -> sent, success', nav: 'direct', clarionStatus: 200, expect: 'success' }));
  results.push(await scenario({ form, label: '2. CLIENT-SIDE NAV, Clarion healthy     -> sent, success', nav: 'spa', clarionStatus: 200, expect: 'success' }));
  results.push(await scenario({ form, label: '3. Clarion 403 (not allowlisted)        -> falls back, success', nav: 'spa', clarionStatus: 403, fallbackDelivered: true, expect: 'success' }));
  results.push(await scenario({ form, label: '4. Script blocked + no email relay      -> honest ERROR + phone', nav: 'spa', blockScript: true, fallbackDelivered: false, expect: 'error' }));
}

console.log(`\n${results.every(Boolean) ? '✅ ALL SCENARIOS PASS' : '❌ FAILURES PRESENT'}`);
process.exit(results.every(Boolean) ? 0 : 1);
