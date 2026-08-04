'use client';

import { useCallback, useState } from 'react';

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
    const res = await clarion.submit({ form_key: formKey, data });
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
      body: JSON.stringify({ ...data, form_key: formKey }),
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
