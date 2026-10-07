import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import {
  editorial,
  editorialPolicyBody,
  editorialPolicyReady,
  editorialPolicyServed,
  EDITORIAL_POLICY_URL,
} from '@/lib/editorial';

/**
 * Editorial policy (portfolio editorial-policy package). Copy, merge fields and
 * the production gate all live in lib/editorial.ts — see the note there.
 */

// Reads the package template from disk, so it must render at build time.
export const dynamic = 'force-static';

const title = `Editorial Policy | ${editorial.facilityName}`;
const description = `How ${editorial.facilityName} researches, writes, clinically reviews and updates the health information on ${editorial.domain}.`;

// Withheld (production, not signed off): no metadata, so the 404 carries no
// trace of the page's title or canonical.
export const metadata: Metadata = editorialPolicyServed
  ? pageMetadata({
      // Absolute: the package specifies this exact title, and it already ends
      // in the brand name the layout template would append.
      title,
      absoluteTitle: true,
      description,
      path: 'editorial-policy',
      // Indexable only once signed off; previews are for review.
      noIndex: !editorialPolicyReady,
    })
  : {};

export default function EditorialPolicyPage() {
  if (!editorialPolicyServed) notFound();
  const html = editorialPolicyBody();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${EDITORIAL_POLICY_URL}#webpage`,
            url: EDITORIAL_POLICY_URL,
            name: 'Editorial Policy',
            description,
            // The site has no WebSite node, so the template's isPartOf is omitted.
            about: { '@id': `${site.url}/#organization` },
            ...(editorial.lastReviewed ? { lastReviewed: editorial.lastReviewed } : {}),
            inLanguage: 'en-US',
          }),
        }}
      />
      <PageHero
        eyebrow={site.name}
        title="Editorial Policy"
        image="/images/wheat-field-hope.jpg"
        imageAlt="Open field at sunrise"
      />

      <section className="section bg-cream-50">
        <div className="container-narrow">
          {/* suppressHydrationWarning: CTM rewrites the phone link inside. */}
          <div
            className="prose-tx"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>

      {/* Same band as /about and /team. */}
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
