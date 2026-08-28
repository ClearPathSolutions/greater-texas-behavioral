import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import Reveal from '@/components/ui/Reveal';
import { IconArrowLeft } from '@/components/ui/Icon';
import { pageMetadata } from '@/lib/seo';
import { site, parentOrg } from '@/lib/site';
import { initials } from '@/lib/staff';
import { getNetworkLeader, networkLeaders } from '@/lib/network-leadership';

/**
 * Profile pages for network leadership (`/team/<slug>/`).
 *
 * Scope is deliberate: this route serves `lib/network-leadership.ts` only, NOT
 * the portal-fed facility staff on `/team`. Two reasons. (1) Feed records have
 * no slug and `fetchStaff()` returns `[]` on any outage — building per-person
 * URLs on top of that would mint pages that 404 whenever the portal blinks.
 * (2) Facility bios are short enough to render in full on `/team` already, so a
 * page each would add crawlable near-duplicates for no reader benefit. If the
 * portal ever publishes slugs, extend this route rather than forking it.
 */

/**
 * Slugs whose canonical points at the PARENT site instead of at this page.
 *
 * A network leader's bio is published verbatim on quadranthealthgroup.com AND
 * on all 13 Quadrant facility sites, so 14 near-identical pages otherwise
 * compete with each other for the same searches and split whatever authority
 * the bio earns. The parent's copy is the one that should rank, so each entry
 * names the parent URL this page is a copy of. Facility staff — and any leader
 * not listed here — keep their own canonical, which `pageMetadata()` supplies.
 *
 * Trailing slash matches the parent's served URL, exactly as `canonicalPath()`
 * does here, so the canonical never points at a redirect.
 */
const CANONICAL_AT_PARENT: Record<string, string> = {
  'pamela-tambini': 'https://www.quadranthealthgroup.com/team/pamela-tambini/',
};

export function generateStaticParams() {
  return networkLeaders.map((leader) => ({ slug: leader.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const leader = getNetworkLeader(params.slug);
  // Unknown slugs render notFound() below; keep them out of the index.
  if (!leader) {
    return pageMetadata({
      title: 'Team member not found',
      description: site.description,
      path: `team/${params.slug}`,
      noIndex: true,
    });
  }

  const meta = pageMetadata({
    title: `${leader.name}, ${leader.title}`,
    description: leader.summary,
    path: `team/${leader.slug}`,
    type: 'article',
  });

  const parentCanonical = CANONICAL_AT_PARENT[leader.slug];
  if (!parentCanonical) return meta;

  // Canonical ONLY. `og:url` keeps pointing at this page so a share of this URL
  // still resolves here — the duplicate-content signal is the whole point, not
  // hiding the page.
  return { ...meta, alternates: { canonical: parentCanonical } };
}

export default function TeamMemberPage({
  params,
}: {
  params: { slug: string };
}) {
  const leader = getNetworkLeader(params.slug);
  if (!leader) notFound();

  return (
    <>
      <PageHero
        eyebrow={`${parentOrg.name} network leadership`}
        title={leader.name}
        subtitle={leader.summary}
        image="/images/community-support.jpg"
        imageAlt="A supportive group in conversation"
      />

      <section className="section bg-cream-50">
        <div className="container-x">
          <div className="mx-auto max-w-4xl space-y-8">
            <Reveal>
              {/* Same card as /team, so a profile reads as the long form of the
                  listing rather than a different site. */}
              <article className="card grid gap-8 p-8 sm:grid-cols-[13rem,1fr] sm:p-10">
                {/* Identity column */}
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  {leader.photo ? (
                    <Image
                      src={leader.photo}
                      alt={leader.name}
                      width={112}
                      height={112}
                      sizes="112px"
                      priority
                      className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-cream-50 shadow-soft"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-600 to-forest-900 font-display text-3xl font-bold tracking-wide text-cream-50 ring-4 ring-cream-50 shadow-soft"
                    >
                      {initials(leader.name)}
                    </span>
                  )}

                  <h2 className="mt-5 font-display text-2xl font-bold text-forest-900">
                    {leader.name}
                  </h2>
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest-600">
                    {leader.title}
                  </p>

                  {leader.credentials && (
                    <div className="mt-3 flex h-6 items-center">
                      <span className="inline-flex items-center rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold tracking-wide text-gold-700 ring-1 ring-gold-200">
                        {leader.credentials}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio column — paragraphs exactly as authored. */}
                <div className="border-t border-cream-300 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-1">
                  <div className="space-y-4 text-[1.0625rem] leading-[1.8] text-ink/85">
                    {leader.bio.map((para, p) => (
                      <p key={p}>{para}</p>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal className="pt-2">
              <Link
                href="/team"
                className="inline-flex items-center gap-2 font-semibold text-forest-700 hover:text-forest-900"
              >
                <IconArrowLeft className="h-4 w-4" />
                Back to our team
              </Link>
            </Reveal>
          </div>
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
