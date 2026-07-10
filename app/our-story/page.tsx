import type { Metadata } from 'next';
import Image from 'next/image';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import Reveal from '@/components/ui/Reveal';
import {
  IconShieldCheck,
  IconHeartHand,
  IconMapPin,
  IconLeaf,
} from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Greater Texas Behavioral was founded to make high-quality, evidence-based addiction and mental health treatment accessible to Texans everywhere through a licensed Virtual IOP.',
  alternates: { canonical: '/our-story' },
};

const principles = [
  {
    icon: IconShieldCheck,
    title: 'Clinical Excellence',
    body: 'Our licensed Texas clinicians provide structured, evidence-based treatment tailored to each client. From cognitive behavioral therapy to relapse-prevention planning, every element is designed to meet professional clinical standards and measurable goals.',
  },
  {
    icon: IconHeartHand,
    title: 'Compassionate Care',
    body: 'Recovery is not one-size-fits-all. We build strong therapeutic relationships through consistent virtual engagement, structured groups, and personalized planning — support without judgment, with privacy and dignity.',
  },
  {
    icon: IconMapPin,
    title: 'Accessible Treatment',
    body: 'Our Virtual IOP lets you receive structured addiction treatment from anywhere in Texas. No travel. No relocation. Just secure, confidential telehealth sessions designed around your schedule.',
  },
  {
    icon: IconLeaf,
    title: 'Long-Term Recovery Focus',
    body: 'We emphasize relapse prevention, coping strategies, accountability, and aftercare planning. The goal is not short-term stabilization, but meaningful, sustainable change supported by real-life recovery tools.',
  },
];

export default function OurStoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Accessible, evidence-based care across Texas"
        subtitle="Clinically structured. Compassionately delivered. Built for long-term recovery."
        image="/images/wheat-field-hope.jpg"
        imageAlt="Open Texas field at golden hour"
      />

      {/* Story */}
      <section className="section bg-cream-50">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="eyebrow">Expanding access to recovery</span>
            <h2 className="h-section mt-4">
              Meeting Texans where they are
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              <p>
                Greater Texas Behavioral was founded with a simple but powerful
                goal: make high-quality addiction and mental health treatment
                accessible to individuals throughout Texas, regardless of
                location.
              </p>
              <p>
                We recognized that many people delay seeking help due to work
                obligations, family responsibilities, or the inability to travel
                for treatment. Our solution was to build a fully licensed Virtual
                Intensive Outpatient Program that delivers structured clinical
                care through secure telehealth technology.
              </p>
              <p>
                Built on a foundation of evidence-based practice and ethical
                clinical standards, we provide online addiction treatment and
                dual diagnosis care that meets individuals where they are — with
                effective, accountable, and compassionate care that supports
                long-term recovery.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-3xl shadow-lift">
              <Image
                src="/images/family-walk.jpg"
                alt="A family walking together on a tree-lined path"
                width={1000}
                height={667}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission band */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/tx-skyline-dusk.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-forest-950/85" />
        <div className="container-x relative section-sm">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center text-gold-300 before:bg-gold-300">
              Our mission
            </span>
            <p className="mt-6 font-display text-2xl font-semibold leading-snug text-cream-50 sm:text-3xl">
              To deliver structured, evidence-based Virtual IOP care to
              individuals struggling with substance use and co-occurring mental
              health conditions across Texas — combining clinical expertise,
              accountability, and compassionate support.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="section bg-cream-100">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">What we stand for</span>
            <h2 className="h-section mt-4">Our core principles</h2>
            <p className="lead mt-5">
              Effective treatment must combine clinical expertise, accountability,
              and compassionate support. These principles guide everything we do.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <article className="card flex h-full gap-5 p-7">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-800 text-cream-50">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-forest-900">
                      {p.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Start your recovery today"
        title="Compassionate, structured care is one call away"
        body="Talk with our admissions team about whether our Virtual IOP is the right fit — free, confidential, and no obligation."
        image="/images/horses-sunset.jpg"
        imageAlt="Horses grazing at sunset"
      />
    </>
  );
}
