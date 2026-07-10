'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import { IconCheck, IconLock, IconPhone } from './ui/Icon';

const fieldBase =
  'w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-ink placeholder:text-muted transition-colors focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40';

export default function VerifyForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [error, setError] = useState('');
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation on success so AT + keyboard users are informed.
  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Submission failed.');
      }
      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please call us.',
      );
    }
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

      {status === 'error' && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <a href={site.phoneHref} className="font-semibold underline">
            Call {site.phone}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-gold mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? 'Sending…' : 'Verify My Insurance'}
      </button>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-muted">
        <IconLock className="h-4 w-4 text-forest-500" />
        Your information is kept 100% confidential.
      </p>
    </form>
  );
}
