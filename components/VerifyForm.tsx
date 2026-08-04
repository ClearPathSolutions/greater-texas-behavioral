'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import { IconCheck, IconLock, IconPhone } from './ui/Icon';

const fieldBase =
  'w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-ink placeholder:text-muted transition-colors focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40';

/** Matches the form key configured in Clarion → Form Submissions. */
const CLARION_FORM_KEY = 'insurance_verification';

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

/**
 * Insurance verification form.
 *
 * DELIVERY MODEL — read before changing this.
 *
 * This form is the primary intake path for someone asking for treatment, so it
 * must never claim a submission succeeded unless something confirmed receipt.
 * Two things are load-bearing:
 *
 * 1. We call `window.ClarionForms.submit()` EXPLICITLY and await the response,
 *    rather than relying on Clarion's auto-capture. Its `forms-capture.v1.js`
 *    scans the DOM for `form[data-clarion-form]` exactly once at script load;
 *    under the App Router this form mounts *after* that scan on any in-site
 *    navigation, so the auto-wired path silently dropped every lead that didn't
 *    arrive via a hard page load. The `data-clarion-form` attribute is
 *    deliberately ABSENT below — re-adding it would double-submit (once by the
 *    scan's listener, once by this handler) and create duplicate leads.
 *
 * 2. If Clarion is unavailable for any reason — script blocked by a tracker
 *    blocker, origin not allowlisted (403), network failure, slow load — we
 *    fall back to our own `/api/lead` route. The success screen appears only
 *    when one of the two paths confirms delivery; otherwise the user is shown
 *    the phone number instead of a false confirmation.
 */
export default function VerifyForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  );
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus();
    if (status === 'error') errorRef.current?.focus();
  }, [status]);

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

  async function submitToClarion(data: Record<string, string>): Promise<boolean> {
    const clarion = await waitForClarion();
    if (!clarion) return false;
    try {
      const res = await clarion.submit({ form_key: CLARION_FORM_KEY, data });
      // A non-2xx here is the "origin not allowlisted in Clarion" case.
      return Boolean(res?.ok);
    } catch {
      return false;
    }
  }

  async function submitToFallback(data: Record<string, string>): Promise<boolean> {
    try {
      // Trailing slash is required: `trailingSlash: true` applies to route
      // handlers too, so POSTing to `/api/lead` costs an extra 308 round trip
      // on every submission.
      const res = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      const json = (await res.json()) as { delivered?: boolean };
      // `delivered` is false when email relay is unconfigured — treat that as a
      // failure so the UI surfaces the phone number rather than a false success.
      return Boolean(json.delivered);
    } catch {
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;

    const data = Object.fromEntries(
      new FormData(e.currentTarget).entries(),
    ) as Record<string, string>;

    setStatus('sending');

    const captured = await submitToClarion(data);
    const delivered = captured || (await submitToFallback(data));

    setStatus(delivered ? 'success' : 'error');
  }

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-700">
          <IconCheck className="h-8 w-8" />
        </div>
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-5 font-display text-2xl font-bold text-forest-900 focus:outline-none"
        >
          Thank you — we&apos;ve got it.
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          A member of our admissions team will reach out shortly. Need help right
          now? We&apos;re available around the clock.
        </p>
        <a href={site.phoneHref} className="btn-primary mt-6">
          <IconPhone className="h-5 w-5" />
          Call {site.phone}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8">
      {status === 'error' && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-gold-400 bg-cream-100 p-4"
        >
          <p
            ref={errorRef}
            tabIndex={-1}
            className="font-semibold text-forest-900 focus:outline-none"
          >
            We couldn&apos;t submit your request.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Something on our end failed — please don&apos;t let it stop you. Call
            us at{' '}
            <a
              href={site.phoneHref}
              className="font-semibold text-forest-800 underline decoration-gold-300 underline-offset-2"
            >
              {site.phone}
            </a>{' '}
            and we&apos;ll take your information over the phone, or try
            submitting again.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Full name <span className="text-gold-600">*</span>
          </label>
          <input id="name" name="name" required autoComplete="name" className={fieldBase} placeholder="Your name" />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Phone <span className="text-gold-600">*</span>
          </label>
          <input id="phone" name="phone" type="tel" required aria-required="true" autoComplete="tel" className={fieldBase} placeholder="(555) 555-5555" />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className={fieldBase} placeholder="you@email.com" />
        </div>

        <div>
          <label htmlFor="insurance" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Insurance provider
          </label>
          <input id="insurance" name="insurance" className={fieldBase} placeholder="e.g. Blue Cross Blue Shield" />
        </div>

        <div>
          <label htmlFor="memberId" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Member ID <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="memberId" name="memberId" className={fieldBase} placeholder="Found on your insurance card" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-forest-800">
            How can we help? <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea id="message" name="message" rows={4} className={fieldBase} placeholder="Tell us a little about what you're looking for. This is completely confidential." />
        </div>
      </div>

      {/* Honeypot (hidden from humans) */}
      <div className="hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-gold mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'sending' ? 'Sending…' : 'Verify My Insurance'}
      </button>

      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted">
        <IconLock className="h-4 w-4 text-forest-500" />
        <span>Your information is kept 100% confidential.</span>
        <a
          href="/privacy-policy/"
          className="underline decoration-cream-300 underline-offset-2 hover:text-forest-700"
        >
          Privacy policy
        </a>
      </p>
    </form>
  );
}
