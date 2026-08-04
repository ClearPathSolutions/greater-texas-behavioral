/**
 * Contact page (audit V0098).
 *
 * `/contact` is the portfolio standard (live on 8 of 12 sites). GTB had no
 * contact page at any slug, so anyone looking for one got nothing — a real gap
 * even for an intentionally small virtual-provider site. Kept deliberately
 * lightweight: contact methods plus a short message form. This does not turn GTB
 * into a full facility site (cf. V0044, closed as by-design).
 *
 * The form asks for less than /verify-insurance on purpose — no insurance
 * carrier, no member ID. Someone asking a question shouldn't have to hand over
 * insurance details first.
 *
 * There is no street address here by design: GTB is 100% telehealth with no
 * physical clinic, and `site.address` is region-only. Publishing a mailing
 * address would misrepresent the service and create a bogus local-SEO signal.
 */
import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/ui/Reveal';
import { site } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import {
  IconPhone,
  IconMail,
  IconClock,
  IconMapPin,
  IconShieldCheck,
  IconChat,
} from '@/components/ui/Icon';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description:
    'Get in touch with Greater Texas Behavioral. Speak with an admissions specialist about our Virtual OP for addiction and mental health treatment — anywhere in Texas.',
  path: 'contact',
});

const methods = [
  {
    icon: IconPhone,
    label: 'Call admissions',
    value: site.phone,
    href: site.phoneHref,
    note: 'Free, confidential, and no obligation.',
  },
  {
    icon: IconMail,
    label: 'Email us',
    value: site.email,
    href: `mailto:${site.email}`,
    note: 'We reply as quickly as we can during business hours.',
  },
  {
    icon: IconClock,
    label: 'Availability',
    value: 'Admissions line open 24/7',
    note: 'Therapy sessions are scheduled around work, school, and family.',
  },
  {
    icon: IconMapPin,
    label: 'Where we serve',
    value: 'All of Texas · 100% online',
    note: 'Secure telehealth — no travel and no relocation required.',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to someone today"
        subtitle="Whether you're ready to start or just have questions, a real person on our admissions team will help you figure out the next step."
        image="/images/tx-skyline-dusk.jpg"
        imageAlt="Texas skyline at dusk"
      />

      {/* Contact methods */}
      <section className="section-sm bg-cream-50">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* min-w-0 belongs on the GRID ITEM (the Reveal wrapper), not the
                article inside it. Grid items default to min-width:auto, so the
                card's min-content — driven by the 31-character email address —
                widened the single-column track past the container and
                overflowed the page at 360px. */}
            {methods.map((m, i) => (
              <Reveal key={m.label} delay={i * 80} className="min-w-0">
                <article className="card flex h-full min-w-0 flex-col p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                    <m.icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-forest-600">
                    {m.label}
                  </h2>
                  {m.href ? (
                    <a
                      href={m.href}
                      className="mt-1 break-words font-display text-lg font-bold text-forest-900 underline decoration-gold-300 underline-offset-4 hover:text-forest-700"
                    >
                      {m.value}
                    </a>
                  ) : (
                    <p className="mt-1 break-words font-display text-lg font-bold text-forest-900">
                      {m.value}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {m.note}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Form + what to expect */}
      <section className="section bg-cream-100">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="eyebrow">Send us a message</span>
            <h2 className="h-section mt-4">
              Tell us what you need — we&apos;ll take it from there
            </h2>
            <p className="lead mt-5">
              Share as much or as little as you like. Nothing you send here
              commits you to treatment, and everything stays confidential.
            </p>

            <ul className="mt-8 space-y-5">
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                  <IconChat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-forest-900">
                    A real conversation
                  </h3>
                  <p className="mt-1 leading-relaxed text-muted">
                    You&apos;ll speak with an admissions specialist, not a call
                    centre script.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                  <IconShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-forest-900">
                    Confidential by default
                  </h3>
                  <p className="mt-1 leading-relaxed text-muted">
                    We don&apos;t share that you contacted us. Please avoid
                    sending detailed clinical information by web form or email.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                  <IconClock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-forest-900">
                    Need help right now?
                  </h3>
                  <p className="mt-1 leading-relaxed text-muted">
                    Call{' '}
                    <a
                      href={site.phoneHref}
                      className="font-semibold text-forest-800 underline decoration-gold-300 underline-offset-2"
                    >
                      {site.phone}
                    </a>{' '}
                    — the admissions line is answered around the clock.
                  </p>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Crisis notice — responsible practice for a behavioural health site */}
      <section className="bg-cream-50 py-10">
        <div className="container-narrow">
          <div className="rounded-2xl border border-gold-400/60 bg-cream-100 p-6">
            <h2 className="font-display text-lg font-bold text-forest-900">
              In a crisis?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This form is not monitored for emergencies. If you or someone you
              know is in immediate danger, call 911. For free, confidential
              support 24/7, call or text the 988 Suicide &amp; Crisis Lifeline,
              or reach the SAMHSA National Helpline at{' '}
              <a
                href="tel:+18006624357"
                className="font-semibold text-forest-800 underline decoration-gold-300 underline-offset-2"
              >
                1-800-662-4357
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Ready when you are"
        title="Find out if our Virtual OP is right for you"
        body="A short conversation with our admissions team is the fastest way to understand your options and what your insurance covers."
        image="/images/tx-bluebonnet-field.jpg"
      />
    </>
  );
}
