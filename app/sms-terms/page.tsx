/**
 * SMS terms (legal-pages standardization, 2026-10-27).
 *
 * The wording is the approved network text shared by every facility site; only
 * facility facts differ. Do not edit it here without the source package.
 * Virtual provider: no street address is published, so the contact block
 * carries the legal entity line, phone and email only.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/ui/Reveal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'SMS Terms',
  description:
    'Terms for text-message communications from Greater Texas Behavioral: consent, frequency, cost, opt-out, and privacy.',
  path: 'sms-terms',
});

export default function SmsTermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="SMS Terms"
        image="/images/wheat-field-hope.jpg"
        imageAlt="Open field at sunrise"
      />

      <section className="section bg-cream-50">
        <div className="container-narrow">
          <Reveal>
            <div className="prose-tx">
              <p>These terms describe how text-message communications work when you opt in to messages from Greater Texas Behavioral.</p>
              <p><em>Last updated: October 27, 2026.</em></p>

              <h2>Program description</h2>
              <p>By providing your mobile number and opting in, you agree to receive recurring informational and admissions-related text messages from Greater Texas Behavioral. Message frequency varies.</p>
              <h2>Consent is not a condition of treatment</h2>
              <p>Consent to receive SMS communications is not a condition of purchasing or receiving treatment or services.</p>

              <h2>Cost</h2>
              <p>Message and data rates may apply, depending on your carrier plan.</p>

              <h2>Opt-out</h2>
              <p suppressHydrationWarning>You can cancel at any time by replying STOP to any message. For help, reply HELP or contact us at <a href="tel:+18775903665">(877) 590-3665</a>.</p>
              <h2>Carriers</h2>
              <p>Carriers are not liable for delayed or undelivered messages.</p>

              <h2>Privacy</h2>
              <p>Mobile information is never shared or sold to third parties for marketing purposes. See our <Link href="/privacy-policy/">Privacy Policy</Link> for details.</p>
              <h2>If this is an emergency</h2>
              <p>Text messages are not monitored around the clock and are not for emergencies. If you are in crisis, call or text 988. In a medical emergency, call 911.</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
