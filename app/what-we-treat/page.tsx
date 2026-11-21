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
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'What We Treat',
  description:
    'Our Texas virtual outpatient program treats mental health conditions — anxiety, depression, trauma, PTSD, and mood disorders — through secure, evidence-based telehealth.',
  path: 'what-we-treat',
});

/**
 * FR-1 resolved 2026-11-20: Greater Texas Behavioral is a virtual outpatient
 * MENTAL HEALTH program. It does not operate a substance use disorder program
 * (no CDTF licence under Texas H&S Code ch. 464). Substance use appears on this
 * page only in the co-occurring note below, as a secondary concern addressed
 * within a mental health treatment plan. LegitScript flagged the old
 * `#substance-use` section listed ahead of mental health — do not reintroduce
 * a substance-use condition row, tag list, or nav entry.
 */
const conditions = [
  {
    id: 'mental-health',
    icon: IconBrain,
    eyebrow: 'Anxiety & depression',
    title: 'Anxiety, Depression & Stress',
    image: '/images/freedom-nature.jpg',
    alt: 'Support for anxiety and depression',
    body: 'Anxiety and depression can affect sleep, work, relationships, and the way you see yourself. Our Texas Virtual OP provides clinically structured support to help you understand what is driving your symptoms, build practical coping skills, and regain a sense of stability. Through therapist-led groups and individual sessions conducted online, clients make measurable progress while continuing to live at home.',
    tags: [
      'Generalized anxiety',
      'Panic & panic attacks',
      'Social anxiety',
      'Depression',
      'Stress-related challenges',
      'Life transitions',
    ],
  },
  {
    id: 'trauma',
    icon: IconLeaf,
    eyebrow: 'Trauma',
    title: 'Trauma & PTSD',
    image: '/images/wheat-field-hope.jpg',
    alt: 'Support for trauma and PTSD',
    body: 'Traumatic experiences can leave lasting effects long after the event itself — hypervigilance, intrusive memories, avoidance, and difficulty feeling safe. Our clinicians use a trauma-informed approach that moves at your pace, helping you process difficult experiences and strengthen emotional regulation in a secure, confidential setting.',
    tags: [
      'PTSD',
      'Trauma-related symptoms',
      'Emotional regulation',
      'Grief & loss',
    ],
  },
  {
    id: 'mood',
    icon: IconShieldCheck,
    eyebrow: 'Mood',
    title: 'Mood Disorders',
    image: '/images/horses-sunset.jpg',
    alt: 'Support for mood disorders',
    body: 'Mood disorders can make everyday life feel unpredictable. Through structured online sessions, clients learn to recognize patterns, build routines that support stability, and develop long-term wellness plans — all coordinated by licensed clinicians and delivered securely through telehealth.',
    tags: [
      'Bipolar disorder',
      'Mood instability',
      'Irritability & anger',
      'Long-term wellness planning',
    ],
  },
];

const whyItems = [
  {
    icon: IconUsers,
    title: 'Licensed Texas clinicians',
    body: 'Evidence-based therapy using proven modalities such as cognitive behavioral therapy and individualized treatment planning.',
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
        title="Virtual mental health treatment"
        subtitle="Structured, evidence-based Virtual OP care for anxiety, depression, trauma, and mood disorders — delivered securely across Texas."
        image="/images/horses-grazing.jpg"
        imageAlt="Horses grazing in a Texas field at sunset"
      />

      {/* Intro */}
      <section className="section-sm bg-cream-50">
        <div className="container-x">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="h-section">
              Professional mental health care, from home
            </h2>
            <p className="lead mt-5">
              Our Texas Virtual OP delivers evidence-based therapy through
              secure telehealth, so you can receive professional support while
              maintaining daily responsibilities. We focus on accountability,
              measurable progress, and practical coping strategies that build
              long-term stability.
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
                <h3 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                  {c.title}
                </h3>
                <p className="mt-5 text-lg leading-relaxed text-muted">{c.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {c.tags.map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800"
                    >
                      <IconCheck className="h-4 w-4 text-tan-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Co-occurring note. Deliberately a small text block, not a condition
          row: substance use is a secondary concern here (see FR-1 note). */}
      <section id="co-occurring" className="scroll-mt-28 bg-cream-50 pt-20 pb-20 lg:pt-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-3xl rounded-3xl border border-cream-300 bg-white p-8 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              When other concerns are part of the picture
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Greater Texas Behavioral is a mental health treatment program.
              Some clients living with a mental health condition also struggle
              with alcohol or other substance use. When that happens, our
              clinicians address it as a co-occurring concern within your mental
              health treatment plan.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              We do not operate a standalone substance use disorder treatment
              program, and we do not provide detox. If your assessment shows
              that a different level or type of care would serve you better, our
              team will help connect you with an appropriate provider.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Why choose */}
      <section className="section bg-cream-100">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            {/* Audit CR-10: was "The best in virtual treatment" — a bare
                superlative with no basis, on a clinical page. */}
            <span className="eyebrow justify-center">Why our Virtual OP works</span>
            <h2 className="h-section mt-4">
              Why choose Greater Texas Behavioral?
            </h2>
            <p className="lead mt-5">
              High-quality mental health treatment that fits into real life —
              while producing measurable progress and long-term stability.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyItems.map((w, i) => (
              <Reveal key={w.title} delay={i * 90}>
                <div className="card h-full p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <w.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
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
            <a href={site.phoneHref} className="btn-outline" suppressHydrationWarning>
              Call {site.phone}
            </a>
          </Reveal>
        </div>
      </section>

      <CTABand
        title="Take the first step toward feeling better"
        body="If you or a loved one is struggling with your mental health, we're here to help — quick, private, and judgment-free."
        image="/images/tx-bluebonnet-field.jpg"
        imageAlt="Texas bluebonnet field at sunset"
      />
    </>
  );
}
