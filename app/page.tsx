import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';
import Reveal from '@/components/ui/Reveal';
import Testimonials from '@/components/Testimonials';
import InsuranceStrip from '@/components/InsuranceStrip';
import CTABand from '@/components/CTABand';
import {
  IconPhone,
  IconArrowRight,
  IconVideo,
  IconBrain,
  IconShieldCheck,
  IconHome,
  IconClock,
  IconUsers,
  IconChat,
  IconClipboard,
  IconCheck,
  IconLeaf,
  IconMapPin,
} from '@/components/ui/Icon';

const trustBadges = [
  { icon: IconShieldCheck, label: 'Licensed Virtual IOP' },
  { icon: IconMapPin, label: 'All of Texas' },
  { icon: IconVideo, label: 'Secure Telehealth' },
  { icon: IconCheck, label: 'Most PPO Plans' },
];

const programs = [
  {
    icon: IconVideo,
    title: 'Virtual Intensive Outpatient Program',
    body: 'Our Virtual IOP includes multiple therapy sessions per week delivered through secure video conferencing — structured support that fits around work, school, and family.',
    features: [
      'Individual therapy',
      'Therapist-led group sessions',
      'Relapse prevention planning',
      'Cognitive behavioral therapy',
      'Dual diagnosis treatment',
      'Family support sessions',
    ],
  },
  {
    icon: IconBrain,
    title: 'Online Dual Diagnosis Treatment',
    body: 'Many people struggling with addiction also experience anxiety, depression, or trauma. Our integrated approach treats substance use and mental health together to improve long-term outcomes.',
    features: [
      'Co-occurring disorder care',
      'Anxiety & depression support',
      'Trauma-informed therapy',
      'Emotional regulation skills',
      'Personalized treatment plans',
      'Coordinated, measurable goals',
    ],
  },
];

const steps = [
  {
    icon: IconChat,
    title: 'Initial Consultation',
    body: 'Speak with a Virtual IOP admissions specialist to discuss your needs and determine if online treatment is the right fit.',
  },
  {
    icon: IconShieldCheck,
    title: 'Insurance Verification',
    body: 'We review your PPO insurance benefits and explain your coverage. Many clients have minimal out-of-pocket costs.',
  },
  {
    icon: IconClipboard,
    title: 'Clinical Assessment',
    body: 'Our licensed clinicians complete a comprehensive virtual assessment and create a personalized treatment plan.',
  },
  {
    icon: IconVideo,
    title: 'Begin Virtual Treatment',
    body: 'Attend structured therapy sessions from anywhere in Texas using our secure telehealth platform.',
  },
];

const whyItems = [
  {
    icon: IconHome,
    title: 'Recover at home',
    body: 'No travel and no relocation — receive real clinical care from the comfort and privacy of home.',
  },
  {
    icon: IconClock,
    title: 'Built around your life',
    body: 'Keep working, studying, and caring for your family while you get structured, accountable support.',
  },
  {
    icon: IconUsers,
    title: 'Licensed Texas clinicians',
    body: 'Evidence-based therapy from a team held to professional clinical standards and measurable goals.',
  },
  {
    icon: IconLeaf,
    title: 'Long-term recovery focus',
    body: 'Relapse prevention, coping strategies, and aftercare planning designed for lasting change.',
  },
];

const conditions = [
  {
    id: 'substance-use',
    image: '/images/substances.jpg',
    alt: 'Support for substance use disorders',
    title: 'Substance Use Disorders',
    body: 'Alcohol, opioid, prescription, stimulant, and other substance-related challenges — addressing both the psychological and behavioral sides of addiction while building relapse-prevention skills.',
  },
  {
    id: 'mental-health',
    image: '/images/freedom-nature.jpg',
    alt: 'Support for mental health conditions',
    title: 'Mental Health Conditions',
    body: 'Anxiety, depression, trauma-related symptoms, mood disorders, and stress-related conditions — treated alongside addiction to strengthen long-term recovery stability.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/tx-bridge-sunset.jpg"
          alt="Texas skyline at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-radial-forest" />
        <div className="absolute inset-0 bg-forest-950/45" />

        <div className="container-x relative">
          <div className="max-w-3xl pt-24 pb-20 sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-cream-100/20 bg-cream-50/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                Evidence-based virtual care in Texas
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="h-display mt-6 text-cream-50">
                Structured online addiction &amp; mental health treatment,{' '}
                <span className="text-gold-300">statewide.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream-100/90 sm:text-xl">
                Greater Texas Behavioral is a fully licensed Virtual Intensive
                Outpatient Program — comprehensive, confidential care delivered
                through secure telehealth, without stepping away from work,
                school, or family.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href={site.phoneHref} className="btn-gold w-full sm:w-auto">
                  <IconPhone className="h-5 w-5" />
                  Call {site.phone}
                </a>
                <Link
                  href="/verify-insurance"
                  className="btn-ghost-light w-full sm:w-auto"
                >
                  Verify Your Insurance
                  <IconArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                {trustBadges.map((b) => (
                  <li
                    key={b.label}
                    className="flex items-center gap-2 text-sm font-medium text-cream-50/90"
                  >
                    <b.icon className="h-5 w-5 text-sage-300" />
                    {b.label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= INTRO ================= */}
      <section className="section bg-cream-50">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="eyebrow">A leading online IOP in Texas</span>
            <h2 className="h-section mt-4">
              Comprehensive virtual care that meets you where you are
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              <p>
                Our online IOP delivers comprehensive addiction and mental health
                treatment through secure telehealth sessions. We combine clinical
                expertise with flexibility, so Texans can receive high-quality
                care from the comfort and privacy of home.
              </p>
              <p>
                We treat substance use disorders and co-occurring mental health
                conditions using research-backed therapies led by licensed
                clinicians. Whether you&apos;re transitioning from a higher level
                of care or starting treatment for the first time, our Virtual IOP
                provides accountability, structure, and long-term recovery
                support.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/what-we-treat" className="btn-primary">
                Explore What We Treat
                <IconArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/our-story" className="btn-outline">
                Our Story
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-lift">
                <Image
                  src="/images/community-support.jpg"
                  alt="A supportive community standing together"
                  width={1000}
                  height={667}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* floating stat card */}
              <div className="absolute -bottom-6 hidden rounded-2xl border border-cream-300 bg-white/95 p-5 shadow-lift backdrop-blur sm:block sm:left-4 lg:left-auto lg:-left-6">
                <p className="font-display text-3xl font-extrabold text-forest-800">
                  100%
                </p>
                <p className="mt-1 text-sm text-muted">
                  Online &amp; confidential —<br />no travel required
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= PROGRAMS ================= */}
      <section className="section bg-cream-100">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Our programs</span>
            <h2 className="h-section mt-4">
              Structured virtual treatment programs
            </h2>
            <p className="lead mt-5">
              Flexible, clinically structured care that lets you keep up with
              daily responsibilities while getting meaningful therapeutic
              support.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {programs.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <article className="card flex h-full flex-col p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-800 text-cream-50">
                    <p.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold text-forest-900">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-muted leading-relaxed">{p.body}</p>
                  <ul className="mt-6 grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-forest-800">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STEPS ================= */}
      <section className="section bg-forest-900 text-cream-50">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center text-gold-300 before:bg-gold-300">
              Getting started
            </span>
            <h2 className="h-section mt-4 text-cream-50">
              Start Virtual IOP in four simple steps
            </h2>
            <p className="mt-5 text-lg text-cream-100/75">
              Confidential &amp; 100% online — from first call to first session.
            </p>
          </Reveal>

          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100} as="li">
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500 text-forest-950">
                      <s.icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-4xl font-extrabold text-white/15">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-cream-50">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream-100/70">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-12 flex justify-center">
            <a href={site.phoneHref} className="btn-gold">
              <IconPhone className="h-5 w-5" />
              Start today — {site.phone}
            </a>
          </Reveal>
        </div>
      </section>

      {/* ================= WHAT WE TREAT ================= */}
      <section className="section bg-cream-50">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">What we treat</span>
            <h2 className="h-section mt-4">
              Comprehensive online treatment for Texas
            </h2>
            <p className="lead mt-5">
              Evidence-based care for substance use and co-occurring mental
              health conditions — addressed together for lasting stability.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {conditions.map((c, i) => (
              <Reveal key={c.id} delay={i * 120}>
                <article className="card group h-full overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={c.image}
                      alt={c.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 to-transparent" />
                  </div>
                  <div className="p-8">
                    <h3 className="font-display text-2xl font-bold text-forest-900">
                      {c.title}
                    </h3>
                    <p className="mt-3 text-muted leading-relaxed">{c.body}</p>
                    <Link
                      href={`/what-we-treat#${c.id}`}
                      className="mt-5 inline-flex items-center gap-1.5 font-semibold text-forest-700 hover:text-forest-900"
                    >
                      Learn more
                      <IconArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY VIRTUAL IOP ================= */}
      <section className="section bg-cream-100">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <span className="eyebrow">Why choose us</span>
              <h2 className="h-section mt-4">
                Real clinical care, built for real life
              </h2>
              <p className="lead mt-5">
                Unlike residential programs, our Virtual IOP lets you receive
                consistent, HIPAA-compliant therapeutic support without
                relocating or disrupting your career or family.
              </p>
              <div className="mt-8">
                <Link href="/our-story" className="btn-primary">
                  Learn about our approach
                  <IconArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2">
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
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <Testimonials />

      {/* ================= INSURANCE ================= */}
      <InsuranceStrip />

      {/* ================= CTA ================= */}
      <CTABand
        title="Take the first step toward recovery today"
        body="If you or a loved one is struggling with substance use or mental health challenges, we offer flexible, confidential Virtual IOP treatment throughout Texas — structured clinical care without residential treatment."
        image="/images/tx-barn-bluebonnets.jpg"
        imageAlt="Texas barn among bluebonnets"
      />
    </>
  );
}
