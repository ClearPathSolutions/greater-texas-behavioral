import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import VerifyForm from '@/components/VerifyForm';
import Reveal from '@/components/ui/Reveal';
import { insuranceCarriers, site } from '@/lib/site';
import { IconPhone, IconClipboard, IconChat, IconShieldCheck, IconArrowRight } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Verify Your Insurance',
  description:
    'Verify your insurance for Virtual IOP treatment in Texas. We work with most major PPO providers — the process is quick, confidential, and free.',
  alternates: { canonical: '/verify-insurance' },
};

const steps = [
  {
    icon: IconClipboard,
    title: 'Submit your information',
    body: 'Fill out our secure, confidential insurance form — or call us directly.',
  },
  {
    icon: IconPhone,
    title: 'We contact your provider',
    body: 'Our admissions specialists reach out to your insurance company on your behalf.',
  },
  {
    icon: IconShieldCheck,
    title: 'Benefits review',
    body: 'We review what services are covered under your plan and identify any out-of-pocket costs.',
  },
  {
    icon: IconChat,
    title: 'Next steps',
    body: 'We explain your coverage and guide you through treatment options that fit your benefits.',
  },
];

export default function VerifyInsurancePage() {
  return (
    <>
      <PageHero
        eyebrow="Insurance"
        title="Verify your insurance"
        subtitle="Many people are surprised to learn their health plan may cover Virtual IOP treatment. Verification is quick, completely confidential, and free."
        image="/images/tx-star-frisco.jpg"
        imageAlt="Texas at dusk"
      />

      {/* Intro + form */}
      <section className="section bg-cream-50">
        <div className="container-x grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="h-section mt-4">
              We handle the details, so you can focus on getting help
            </h2>
            <p className="lead mt-5">
              We work with most major PPO insurance providers to verify your
              benefits and clearly explain what your plan includes. In many
              cases, insurance significantly reduces out-of-pocket costs.
            </p>

            <ol className="mt-10 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-800 text-cream-50">
                      <s.icon className="h-5 w-5" />
                    </span>
                    {i < steps.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-cream-300" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-display text-lg font-bold text-forest-900">
                      {i + 1}. {s.title}
                    </h3>
                    <p className="mt-1 leading-relaxed text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-2xl bg-cream-100 p-5">
              <p className="text-forest-800">
                Prefer to talk it through? Call our admissions team directly.
              </p>
              <a href={site.phoneHref} className="btn-primary mt-4">
                <IconPhone className="h-5 w-5" />
                {site.phone}
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:sticky lg:top-28">
            <div className="mb-5">
              <h2 className="font-display text-2xl font-bold text-forest-900">
                Verify your coverage today
              </h2>
              <p className="mt-2 text-muted">
                Complete the confidential form below and a member of our
                admissions team will verify your benefits and follow up shortly.
              </p>
            </div>
            <VerifyForm />
          </Reveal>
        </div>
      </section>

      {/* Carriers */}
      <section className="section-sm bg-cream-100">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Accepted providers</span>
            <h2 className="h-section mt-4">
              We work with all major insurance carriers
            </h2>
            <p className="lead mt-5">
              Greater Texas Behavioral partners with leading providers to review
              your coverage and outline your benefits before treatment begins.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
              {insuranceCarriers.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-medium text-forest-800"
                >
                  {c}
                </li>
              ))}
              <li className="rounded-full bg-forest-800 px-4 py-2 text-sm font-semibold text-cream-50">
                35+ more
              </li>
            </ul>
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-muted">
              <IconArrowRight className="h-4 w-4 text-gold-500" />
              Don&apos;t see your plan? We likely still work with it — just ask.
            </p>
          </Reveal>
        </div>
      </section>

      <CTABand
        eyebrow="Peace of mind"
        title="Move forward with clarity and confidence"
        body="Understanding your benefits shouldn't be stressful. Let us verify your coverage so you can focus on recovery."
        image="/images/horses-closeup.jpg"
        imageAlt="Horses in a Texas field"
      />
    </>
  );
}
