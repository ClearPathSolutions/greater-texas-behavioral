'use client';

import { useCallback, useState } from 'react';
import {
  attributionPayload,
  ctmSessionId,
  droppedClickIds,
} from '@/lib/attribution';

/**
 * Shared lead-delivery hook — the single place that decides whether a form may
 * tell someone their request was received.
 *
 * Extracted from VerifyForm so /contact reuses the exact same verified path
 * rather than reimplementing it. Both forms are intake paths for someone asking
 * for treatment, so the rule is identical: NEVER show a success screen unless
 * something confirmed receipt.
 *
 * Two load-bearing details, both the result of real failures:
 *
 * 1. We call `window.ClarionForms.submit()` EXPLICITLY and await the response
 *    instead of relying on Clarion's auto-capture. `forms-capture.v1.js` scans
 *    for `form[data-clarion-form]` exactly once at script load; under the App
 *    Router a form mounts *after* that scan on any client-side navigation, so
 *    the auto-wired path silently dropped every lead that didn't arrive via a
 *    hard page load. Forms using this hook must NOT carry a
 *    `data-clarion-form` attribute — that would double-submit (once by the
 *    scan's listener, once by us) and create duplicate leads.
 *
 * 2. If Clarion is unavailable for any reason — script blocked by a tracker
 *    blocker, origin not allowlisted (403), network failure, slow load — we
 *    fall back to our own `/api/lead/` route. `delivered: false` (e.g. the
 *    email relay is unconfigured) counts as a FAILURE on purpose, so the UI
 *    surfaces the phone number instead of a false confirmation.
 *
 * ATTRIBUTION — the two paths need different treatment, which is why it is
 * handled here rather than in either form.
 *
 * On the CLARION path, `forms-capture.v1.js` builds the whole payload itself:
 * `page_url`, `landing_page_url`, `referrer`, `utm`, `gclid` and — flat and
 * top-level, which is what CTM requires — `ctm_visitor_sid`. Its `submit()` API
 * accepts only `{form_key, data}`, so none of that can be overridden from here,
 * and it does not need to be: `lib/attribution.ts` fixes the one field that was
 * broken (the campaign) by restoring it into the URL the vendor reads. All we
 * add is the click ids the vendor drops on the floor entirely.
 *
 * On the FALLBACK path nothing collects attribution at all, because the vendor
 * script is precisely what is missing. That path therefore sends the full
 * attribution block explicitly. This matters more than it looks: the fallback
 * fires when a tracker blocker ate the vendor script, which correlates strongly
 * with paid traffic, so treating it as an afterthought loses attribution on
 * exactly the leads whose source is most expensive to have bought.
 */

/** How long to wait for the afterInteractive Clarion script before falling back. */
const CLARION_WAIT_MS = 4000;

declare global {
  interface Window {
    ClarionForms?: {
      submit: (payload: {
        form_key: string;
        data: Record<string, unknown>;
      }) => Promise<Response>;
      scan?: () => void;
    };
  }
}

export type LeadStatus = 'idle' | 'sending' | 'success' | 'error';

/** Resolves once Clarion's script has exposed its API, or null on timeout. */
async function waitForClarion(): Promise<Window['ClarionForms'] | null> {
  const deadline = Date.now() + CLARION_WAIT_MS;
  while (Date.now() < deadline) {
    if (typeof window.ClarionForms?.submit === 'function') {
      return window.ClarionForms;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

async function submitToClarion(
  formKey: string,
  data: Record<string, string>,
): Promise<boolean> {
  const clarion = await waitForClarion();
  if (!clarion) return false;
  try {
    // `wbraid`/`gbraid` are Google's gclid substitutes under iOS and consent
    // mode, and `forms-capture.v1.js` never reads them — it only looks for
    // `gclid`. They go inside `data` because that is the only part of the
    // payload we control; Clarion's attribution parser will not use them from
    // there, but the values reach the lead record instead of vanishing, and
    // CTM's own routing rules (which DO key on both) see them in the URL.
    // A deliberate non-choice: we do NOT copy them into `gclid` to make that
    // field populate. A wbraid is not a gclid, and forging one trades a visibly
    // missing value for a silently wrong one.
    const res = await clarion.submit({
      form_key: formKey,
      data: { ...data, ...droppedClickIds() },
    });
    // A non-2xx here is the "origin not allowlisted in Clarion" case.
    return Boolean(res?.ok);
  } catch {
    return false;
  }
}

async function submitToFallback(
  formKey: string,
  data: Record<string, string>,
): Promise<boolean> {
  try {
    // Trailing slash is required: `trailingSlash: true` applies to route
    // handlers too, so POSTing to `/api/lead` costs an extra 308 round trip
    // on every submission.
    const res = await fetch('/api/lead/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Attribution is spread LAST so a form field can never shadow it — the
      // fields are attacker-influenced (anyone can rename an input), and
      // `ctm_visitor_sid` in particular has to stay the value we computed.
      body: JSON.stringify({
        ...data,
        form_key: formKey,
        ...attributionPayload(),
      }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { delivered?: boolean };
    return Boolean(json.delivered);
  } catch {
    return false;
  }
}

/**
 * @param formKey Matches the form key configured in Clarion → Form Submissions.
 */
export function useLeadDelivery(formKey: string) {
  const [status, setStatus] = useState<LeadStatus>('idle');

  const submit = useCallback(
    async (form: HTMLFormElement) => {
      if (status === 'sending') return;

      const data = Object.fromEntries(new FormData(form).entries()) as Record<
        string,
        string
      >;

      // Loud in development only. Every way this integration breaks returns a
      // clean 200 and a real, callable lead — the only thing missing is the
      // link to the ad click — so there is no runtime signal to notice. A
      // console line at the moment of submission is the cheapest place to catch
      // "t.js got blocked" before it becomes a month of unattributed spend.
      if (process.env.NODE_ENV !== 'production' && !ctmSessionId()) {
        console.warn(
          '[lead] no CTM session id at submit time — t.js blocked or not loaded. ' +
            'This lead will attach to no visit in CallTrackingMetrics.',
        );
      }

      setStatus('sending');
      const captured = await submitToClarion(formKey, data);
      const delivered = captured || (await submitToFallback(formKey, data));
      setStatus(delivered ? 'success' : 'error');
    },
    [formKey, status],
  );

  const reset = useCallback(() => setStatus('idle'), []);

  return { status, submit, reset };
}
