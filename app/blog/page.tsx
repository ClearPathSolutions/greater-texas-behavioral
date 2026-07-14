import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import { IconChat, IconPhone } from '@/components/ui/Icon';
import { site, clarion } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on addiction recovery, mental health, and virtual treatment from the team at Greater Texas Behavioral.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Insights & resources"
        title="The Greater Texas Behavioral blog"
        subtitle="Guidance on addiction recovery, mental health, and getting the most from virtual treatment — from our clinical team."
        image="/images/tx-longhorns-sunset.jpg"
        imageAlt="Texas longhorns at sunset"
      />

      <section className="section bg-cream-50">
        <div className="container-x">
          {/* Clarion-managed blog posts render inside this element */}
          <div data-clarion-blog className="min-h-[40vh]">
            {/* Fallback shown until the Clarion embed loads / if it's empty */}
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-100 text-forest-700">
                <IconChat className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-bold text-forest-900">
                Articles are loading
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                If posts don&apos;t appear, our admissions team is always ready to
                answer your questions — confidentially and with no obligation.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={site.phoneHref} className="btn-primary">
                  <IconPhone className="h-5 w-5" />
                  Call {site.phone}
                </a>
                <Link href="/verify-insurance" className="btn-outline">
                  Verify Your Insurance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clarion Labs blog embed */}
      <Script
        src={clarion.blogEmbedSrc}
        strategy="afterInteractive"
        data-site-key={clarion.siteKey}
        data-api={clarion.api}
      />

      <CTABand
        title="Have questions about virtual treatment?"
        body="Our admissions team is here to help you understand your options and take the next step — whenever you're ready."
        image="/images/wheat-field-hope.jpg"
        imageAlt="Texas field at golden hour"
      />
    </>
  );
}
