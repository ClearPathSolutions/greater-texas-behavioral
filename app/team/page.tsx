import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import Reveal from '@/components/ui/Reveal';
import { pageMetadata } from '@/lib/seo';
import { fetchStaff, initials, bioParagraphs } from '@/lib/staff';

export const metadata: Metadata = pageMetadata({
  title: 'Our Team',
  description:
    'Meet the licensed clinicians and case managers behind Greater Texas Behavioral — the people who guide your care through our Virtual Outpatient Program.',
  path: 'team',
});

const FACILITY = 'greater-texas-behavioral';

export default async function TeamPage() {
  const staff = await fetchStaff(FACILITY);
  const anyCredentials = staff.some((s) => s.credentials);

  return (
    <>
      <PageHero
        eyebrow="The people behind your care"
        title="Our Team"
        subtitle="Licensed clinicians and case managers who walk alongside you — bringing clinical expertise, lived experience, and genuine compassion to every step of your recovery."
        image="/images/community-support.jpg"
        imageAlt="A supportive group in conversation"
      />

      <section className="section bg-cream-50">
        <div className="container-x">
          {staff.length === 0 ? (
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="h-section">Meet the team</h2>
              <p className="lead mt-5">
                Our team profiles are being updated. In the meantime, our
                admissions team is ready to answer your questions.
              </p>
            </Reveal>
          ) : (
            <div className="mx-auto max-w-4xl space-y-8">
              {staff.map((person, i) => (
                <Reveal key={person.id} delay={i * 80}>
                  <article className="card grid gap-8 p-8 sm:grid-cols-[13rem,1fr] sm:p-10">
                    {/* Identity column */}
                    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                      {person.photoUrl ? (
                        <Image
                          src={person.photoUrl}
                          alt={person.name}
                          width={112}
                          height={112}
                          sizes="112px"
                          className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-cream-50 shadow-soft"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-600 to-forest-900 font-display text-3xl font-bold tracking-wide text-cream-50 ring-4 ring-cream-50 shadow-soft"
                        >
                          {initials(person.name)}
                        </span>
                      )}

                      <h2 className="mt-5 font-display text-2xl font-bold text-forest-900">
                        {person.name}
                      </h2>
                      <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest-600">
                        {person.title}
                      </p>

                      {anyCredentials && (
                        <div className="mt-3 flex h-6 items-center">
                          {person.credentials && (
                            <span className="inline-flex items-center rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold tracking-wide text-gold-700 ring-1 ring-gold-200">
                              {person.credentials}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bio column */}
                    {person.bio && (
                      <div className="border-t border-cream-300 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-1">
                        <div className="space-y-4 text-[1.0625rem] leading-[1.8] text-ink/85">
                          {bioParagraphs(person.bio).map((para, p) => (
                            <p key={p}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}

              <Reveal className="pt-2 text-center">
                <p className="text-sm text-muted">
                  Want to know if our Virtual OP is right for you?{' '}
                  <Link
                    href="/contact"
                    className="font-semibold text-forest-700 underline decoration-gold-300 underline-offset-2 hover:text-forest-900"
                  >
                    Reach out to our admissions team
                  </Link>
                  .
                </p>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      <CTABand
        eyebrow="Start your recovery today"
        title="Compassionate, structured care is one call away"
        body="Talk with our admissions team about whether our Virtual OP is the right fit — free, confidential, and no obligation."
        image="/images/horses-sunset.jpg"
        imageAlt="Horses grazing at sunset"
      />
    </>
  );
}
