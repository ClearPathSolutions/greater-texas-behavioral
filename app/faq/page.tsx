/**
 * FAQ (audit V0099).
 *
 * `/faq` is the portfolio-standard slug and GTB was 1 of 7 sites without one.
 * ISSUES.md's own reading: an FAQ is a genuinely good fit here, because the
 * questions a virtual provider gets ("does insurance cover it", "do I need to
 * travel", "what does a week look like") are exactly the objections this site
 * already answers in prose scattered across five pages.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SOURCING RULE — every answer below restates a claim ALREADY made on this site.
 * Nothing here is new. That is deliberate on two counts:
 *
 *   1. FR-1 (is SUD in scope?) is unresolved. An FAQ that only re-states existing
 *      copy adds no new service-line claim, so it cannot deepen that exposure. If
 *      FR-1 comes back "mental health only", this page needs the same edit as the
 *      rest of the site and no more.
 *   2. Session frequency is described as "multiple sessions per week" and NOT as a
 *      specific number, because the site has never published one. Do not invent
 *      "three groups and one individual per week" to sound concrete — that is a
 *      clinical/billing claim.
 *
 * Cost answers use the coverage-dependent phrasing settled under CR-08/CR-09.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Built with native <details>/<summary> rather than a JS accordion: keyboard and
 * screen-reader behaviour comes free, it works with JS disabled, and it adds zero
 * bytes to the client bundle — consistent with the rest of the site.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import Reveal from '@/components/ui/Reveal';
import { site } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { IconChevronDown, IconPhone, IconArrowRight } from '@/components/ui/Icon';

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about our Texas Virtual Outpatient Program — how telehealth treatment works, what insurance covers, what a week looks like, and how to get started.',
  path: 'faq',
});

/**
 * `answer` is plain text so the same string can feed both the rendered page and
 * the FAQPage JSON-LD without them drifting apart. `extra` holds anything that
 * needs markup (links) and is rendered only on the page — Google reads the text.
 */
type Faq = {
  q: string;
  answer: string;
  extra?: React.ReactNode;
};

const GROUPS: Array<{ heading: string; items: Faq[] }> = [
  {
    heading: 'How virtual treatment works',
    items: [
      {
        q: 'What is a Virtual Outpatient Program (OP)?',
        answer:
          'It is a structured, licensed treatment program delivered entirely through secure telehealth. You attend multiple therapy sessions per week — individual counseling and therapist-led groups — from wherever you are in Texas, while continuing to live at home and keep up with work, school, and family. It is real clinical care with accountability and measurable goals, not a self-guided app.',
      },
      {
        q: 'Do I need to travel or relocate?',
        answer:
          'No. The program is 100% online and available anywhere in Texas. There is no facility to commute to, no residential stay, and no time away from your life. That accessibility is the whole reason the program exists — many people delay getting help because of work, family, or distance.',
      },
      {
        q: 'What does a typical week look like?',
        answer:
          'Your plan is individualized, but care generally combines individual therapy, therapist-led group sessions, relapse-prevention planning, and family support sessions where appropriate. Clinicians use evidence-based approaches including cognitive behavioral therapy. Sessions are scheduled around work, school, and family rather than the reverse.',
        extra: (
          <p className="mt-3">
            The program is described in more detail on{' '}
            <Link href="/what-we-treat/">what we treat</Link>.
          </p>
        ),
      },
      {
        q: 'What do I need in order to take part?',
        answer:
          'A private space and a reliable internet connection. Sessions run on a secure, HIPAA-compliant telehealth platform, so having somewhere you can speak freely matters more than having particular equipment.',
      },
    ],
  },
  {
    heading: 'What we treat',
    items: [
      {
        q: 'What conditions do you treat?',
        answer:
          'Substance use disorders — including alcohol, opioid, prescription, and stimulant use — and mental health conditions such as anxiety, depression, trauma-related symptoms, and mood instability. Because these frequently occur together, dual diagnosis care is integrated into treatment planning rather than handled separately.',
        extra: (
          <p className="mt-3">
            Full detail on{' '}
            <Link href="/what-we-treat/#substance-use">substance use</Link> and{' '}
            <Link href="/what-we-treat/#mental-health">mental health</Link>.
          </p>
        ),
      },
      {
        q: 'What if I need medical detox first?',
        answer:
          'Medically supervised detox has to be delivered in person, so it is not something a virtual program provides. If there is physical dependence, our team assesses that during your consultation and helps coordinate a prompt connection to trusted medical detox providers. Once you are stabilized, treatment continues with us through telehealth.',
      },
      {
        q: 'Is this the right level of care for me?',
        answer:
          'That is what the initial consultation and clinical assessment are for. A licensed clinician reviews your history, current symptoms, and any co-occurring conditions, and will tell you honestly if a different level of care would serve you better. There is no obligation and no cost to find out.',
      },
    ],
  },
  {
    heading: 'Insurance and cost',
    items: [
      {
        q: 'Does insurance cover treatment?',
        answer:
          'We work with most major PPO insurance plans. Our admissions team verifies your benefits directly with your provider and explains what your plan includes, including any out-of-pocket costs, before treatment begins. Verification is free and confidential.',
        extra: (
          <p className="mt-3">
            You can start with the{' '}
            <Link href="/verify-insurance/">insurance verification form</Link>, or
            call us and we will take the details over the phone.
          </p>
        ),
      },
      {
        q: 'What if you are not in network with my plan, or I do not see my carrier?',
        answer:
          'Ask anyway. The carriers listed on our site are not an exhaustive list, and coverage depends on your specific plan rather than the carrier name alone. Verification costs nothing and commits you to nothing.',
      },
      {
        q: 'Do I have to give you my insurance details just to ask a question?',
        answer:
          'No. The contact form asks only for your name, a phone number, and your question — no insurance carrier and no member ID. Insurance details are only needed if you want us to verify your benefits.',
        extra: (
          <p className="mt-3">
            Use the <Link href="/contact/">contact page</Link> for general
            questions.
          </p>
        ),
      },
    ],
  },
  {
    heading: 'Privacy and getting started',
    items: [
      {
        q: 'Is this confidential?',
        answer:
          'Yes. Sessions are delivered over secure, HIPAA-compliant telehealth, and we do not disclose that you contacted us without your authorization except where the law requires it. For substance use disorder treatment records, the stricter federal confidentiality rules at 42 C.F.R. Part 2 also apply. One practical note: ordinary web forms and email are not encrypted end to end, so please avoid sending detailed clinical information that way — discuss it on the phone instead.',
        extra: (
          <p className="mt-3">
            Our <Link href="/privacy-policy/">privacy policy</Link> sets out
            exactly what this website collects and where it goes.
          </p>
        ),
      },
      {
        q: 'How do I get started?',
        answer:
          'Four steps. First, a consultation with an admissions specialist to discuss your needs. Second, insurance verification, where we review your benefits and explain your coverage. Third, a comprehensive clinical assessment with a licensed clinician, which produces your treatment plan. Fourth, your first session. You can begin by calling us or submitting the insurance form.',
      },
      {
        q: 'Who will I be working with?',
        answer:
          'Licensed Texas clinicians and case managers. The people who guide your care are credentialed professionals held to professional clinical standards, and you can read their bios before you ever pick up the phone.',
        extra: (
          <p className="mt-3">
            Meet them on the <Link href="/team/">our team</Link> page.
          </p>
        ),
      },
      {
        q: 'What if I am in crisis right now?',
        answer:
          'This website is not monitored for emergencies. If you or someone you know is in immediate danger, call 911. For free, confidential support 24/7, call or text the 988 Suicide & Crisis Lifeline, or reach the SAMHSA National Helpline at 1-800-662-4357.',
      },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

export default function FaqPage() {
  // FAQPage structured data, built from the same `answer` strings the page
  // renders so the two can never disagree.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ALL_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHero
        eyebrow="Questions & answers"
        title="Frequently asked questions"
        subtitle="Straight answers about how virtual treatment works, what insurance covers, and what happens after you reach out. If yours isn't here, just ask."
        image="/images/couple-reading.jpg"
        imageAlt="Two people reading together"
      />

      <section className="section bg-cream-50">
        <div className="container-narrow">
          {GROUPS.map((group, gi) => (
            <Reveal key={group.heading} delay={gi * 60} className="mb-12 last:mb-0">
              <h2 className="h-section mb-6">{group.heading}</h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="card group/faq overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 sm:p-6">
                      <h3 className="font-display text-lg font-bold text-forest-900">
                        {item.q}
                      </h3>
                      <IconChevronDown
                        aria-hidden="true"
                        className="mt-1 h-5 w-5 shrink-0 text-forest-600 transition-transform duration-200 group-open/faq:rotate-180"
                      />
                    </summary>
                    <div className="border-t border-cream-300 px-5 pb-5 pt-4 leading-relaxed text-muted sm:px-6 sm:pb-6">
                      <p>{item.answer}</p>
                      {item.extra}
                    </div>
                  </details>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="mt-14">
            <div className="rounded-2xl border border-gold-400/60 bg-cream-100 p-6 text-center">
              <h2 className="font-display text-xl font-bold text-forest-900">
                Still have a question?
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-muted">
                Our admissions team answers the phone around the clock, and asking
                costs nothing and commits you to nothing.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={site.phoneHref} className="btn-primary">
                  <IconPhone className="h-5 w-5" />
                  Call {site.phone}
                </a>
                <Link href="/contact/" className="btn-outline">
                  Send a message
                  <IconArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand
        eyebrow="Ready when you are"
        title="Find out if our Virtual OP is right for you"
        body="A short, confidential conversation is the fastest way to understand your options and what your insurance covers."
        image="/images/family-walk.jpg"
        imageAlt="A family walking together"
      />
    </>
  );
}
