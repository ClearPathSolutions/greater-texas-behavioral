'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Re-applies the saved campaign to the URL on every client-side route change.
 *
 * WHY THIS COMPONENT EXISTS
 * The parse-time bootstrap in the root layout restores campaign parameters on a
 * document load, but an App Router navigation rewrites the URL without running
 * any inline script. Without this, a visitor who lands on an ad and then clicks
 * "Verify Your Insurance" in the nav arrives at a clean URL, and
 * `forms-capture.v1.js` — which reads `utm`/`gclid` from `location.search` at
 * submit time — sends the lead as direct traffic. Clicking the nav is how most
 * people reach the form, so a document-load-only fix would have fixed almost
 * nothing while appearing to work in a hard-refresh test.
 *
 * `usePathname` only, deliberately: `useSearchParams` forces a Suspense
 * boundary and opts every static page into dynamic rendering.
 *
 * Calls `restore()` rather than `capture()`. `capture()` is what decides the
 * first-touch landing page, and a route change must never be allowed to
 * redefine that — the entry page is the page someone entered on.
 */
export default function AttributionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      window.__gtbCampaign?.restore();
    } catch {
      /* attribution must never break a page */
    }
  }, [pathname]);

  return null;
}
