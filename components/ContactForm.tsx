'use client';

import { useEffect, useRef } from 'react';
import { site } from '@/lib/site';
import { useLeadDelivery } from '@/lib/useLeadDelivery';
import { IconCheck, IconLock, IconPhone } from './ui/Icon';

const fieldBase =
  'w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-ink placeholder:text-muted transition-colors focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40';

/**
 * General contact form (audit V0098).
 *
 * Deliberately shorter than the insurance form: no member ID, no insurance
 * carrier. Someone who just wants to ask a question should not have to hand over
 * insurance details to do it.
 *
 * Delivery is handled by `useLeadDelivery` — see lib/useLeadDelivery.ts for why
 * the success screen requires confirmation and why this form must NOT carry a
 * `data-clarion-form` attribute.
 */
export default function ContactForm() {
  const { status, submit } = useLeadDelivery('contact');
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus();
    if (status === 'error') errorRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submit(e.currentTarget);
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
          Message received.
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          Someone from our team will get back to you shortly. If you&apos;d
          rather not wait, our admissions line is open around the clock.
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
            We couldn&apos;t send your message.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Something on our end failed — please don&apos;t let it stop you. Call
            us at{' '}
            <a
              href={site.phoneHref}
              className="font-semibold text-forest-800 underline decoration-gold-300 underline-offset-2"
            >
              {site.phone}
            </a>
            , email{' '}
            <a
              href={`mailto:${site.email}`}
              className="font-semibold text-forest-800 underline decoration-gold-300 underline-offset-2"
            >
              {site.email}
            </a>
            , or try again.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            Full name <span className="text-gold-600">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            className={fieldBase}
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            Phone <span className="text-gold-600">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            aria-required="true"
            autoComplete="tel"
            className={fieldBase}
            placeholder="(555) 555-5555"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            Email <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className={fieldBase}
            placeholder="you@email.com"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            How can we help? <span className="text-gold-600">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            className={fieldBase}
            placeholder="Ask us anything — about the program, scheduling, insurance, or getting started. This is completely confidential."
          />
        </div>
      </div>

      {/* Honeypot (hidden from humans) */}
      <div className="hidden" aria-hidden>
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
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
