import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import Reveal from '@/components/ui/Reveal';
import {
  IconBrain,
  IconLeaf,
  IconCheck,
  IconArrowRight,
  IconShieldCheck,
  IconUsers,
  IconHome,
  IconLock,
} from '@/components/ui/Icon';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'What We Treat',
  description:
    'Our Texas Virtual IOP treats substance use disorders and co-occurring mental health conditions — anxiety, depression, trauma, and more — through secure, evidence-based telehealth.',
  alternates: { canonical: '/what-we-treat' },
};

const conditions = [
  {
    id: 'substance-use',
    icon: IconLeaf,
    eyebrow: 'Substance use',
    title: 'Substance Use Disorders',
    image: '/images/substances.jpg',
    alt: 'Clinical support for substance use disorders',
    body: 'Our Texas Virtual IOP provides clinically structured support for individuals struggling with substance use. Because addiction impacts both behavior and mental health, our program focuses on identifying triggers, restructuring harmful patterns, and building practical relapse-prevention strategies. Through therapist-led groups and individualized counseling conducted online, clients gain accountability, support, and measurable progress while continuing to live at home.',
    tags: [
      'Alcohol use disorder',
      'Opioid misuse',
      'Prescription medication dependence',
      'Stimulant use',
      'Marijuana dependency',
      'Polysubstance use',
    ],
  },
  {
    id: 'mental-health',
    icon: IconBrain,
    eyebrow: 'Mental health',
    title: 'Mental Health Conditions',
    image: '/images/freedom-nature.jpg',
    alt: 'Support for mental health conditions',
    body: 'Our Virtual IOP treats a wide range of mental health conditions that often occur alongside substance use. Because many people facing addiction also live with underlying emotional or psychological distress, we integrate dual-diagnosis care into every treatment plan. Through structured online sessions, clients build emotional-regulation skills, strengthen coping strategies, and develop long-term wellness plans — all delivered securely through telehealth.',
    tags: [
      'Anxiety disorders',
      'Depression',
      'PTSD & trauma-related symptoms',
      'Bipolar disorder',
      'Mood instability',
      'Stress-related challenges',
    ],
  },
];

const whyItems = [
  {
    icon: IconUsers,
    title: 'Licensed Texas clinicians',
    body: 'Evidence-based therapy using proven modalities — CBT, relapse-prevention planning, and dual-diagnosis treatment.',
  },
  {
    icon: IconHome,
    title: 'No relocation required',
    body: 'Receive consistent therapeutic support without disrupting your career or family life.',
  },
  {
    icon: IconLock,
    title: 'Confidential & HIPAA-compliant',
    body: 'Secure telehealth accessible anywhere in Texas with a private internet connection.',
  },
  {
    icon: IconShieldCheck,
    title: 'Measurable progress',
    body: 'A focus on accountability and real, sustainable outcomes — not just short-term stabilization.',
  },
];

export default function WhatWeTreatPage() {
  return (
    <>
      <PageHero
        eyebrow="What We Treat"
        title="Recover from addiction & mental health challenges"
        subtitle="Structured, evidence-based Virtual IOP care for substance use, anxiety, depression, trauma, and co-occurring conditions — delivered securely across Texas."
        image="/images/horses-grazing.jpg"
        imageAlt="Horses grazing in a Texas field at sunset"
      />

      {/* Intro */}
      <section className="section-sm bg-cream-50">
        <div className="container-x">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="h-section">
              We help you recover — and stay well
            </h2>
            <p className="lead mt-5">
              Our Texas Virtual IOP delivers evidence-based therapy through
              secure telehealth, so you can receive professional support while
              maintaining daily responsibilities. We focus on accountability,
              measurable progress, and practical relapse-prevention strategies
              that build long-term stability.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Conditions — alternating rows */}
      <section className="bg-cream-50 pb-4">
        <div className="container-x space-y-20 lg:space-y-28">
          {conditions.map((c, i) => (
            <div
              key={c.id}
              id={c.id}
              className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="overflow-hidden rounded-3xl shadow-lift">
                  <Image
                    src={c.image}
                    alt={c.alt}
                    width={1000}
                    height={720}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </Reveal>

              <Reveal delay={100} className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <span className="eyebrow">{c.eyebrow}</span>
                <h3 className="mt-4 font-display text-3xl font-bold text-forest-900 sm:text-4xl">
                  {c.title}
                </h3>
                <p className="mt-5 text-lg leading-relaxed text-muted">{c.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {c.tags.map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3.5 py-2 text-sm font-medium text-forest-800"
                    >
                      <IconCheck className="h-4 w-4 text-gold-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="section bg-cream-100">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">The best in virtual treatment</span>
            <h2 className="h-section mt-4">
              Why choose Greater Texas Behavioral?
            </h2>
            <p className="lead mt-5">
              High-quality addiction and mental health treatment that fits into
              real life — while producing measurable progress and long-term
              recovery results.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyItems.map((w, i) => (
              <Reveal key={w.title} delay={i * 90}>
                <div className="card h-full p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                    <w.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-forest-900">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {w.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/verify-insurance" className="btn-primary">
              Verify Your Insurance
              <IconArrowRight className="h-5 w-5" />
            </Link>
            <a href={site.phoneHref} className="btn-outline">
              Call {site.phone}
            </a>
          </Reveal>
        </div>
      </section>

      <CTABand
        title="Take the first step toward recovery today"
        body="If you or a loved one is struggling with addiction or mental health challenges, we're here to help — quick, private, and judgment-free."
        image="/images/tx-bluebonnet-field.jpg"
        imageAlt="Texas bluebonnet field at sunset"
      />
    </>
  );
}
