import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import Reveal from '@/components/ui/Reveal';
import { getClarionFeed, formatClarionDate } from '@/lib/clarion-blog';
import { IconArrowRight, IconChat, IconPhone } from '@/components/ui/Icon';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on addiction recovery, mental health, and virtual treatment from the team at Greater Texas Behavioral.',
  alternates: { canonical: '/blog' },
};

// Re-render from Clarion at most every 5 minutes.
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getClarionFeed();

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
          {posts.length === 0 ? (
            /* -------- Empty state -------- */
            <Reveal className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-100 text-forest-700">
                <IconChat className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-bold text-forest-900">
                New articles are on the way
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                We&apos;re preparing helpful, Texas-focused resources on recovery
                and mental wellness. In the meantime, our admissions team is
                ready to answer any questions you have — confidentially and with
                no obligation.
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
            </Reveal>
          ) : (
            /* -------- Post grid -------- */
            <>
              <h2 className="sr-only">Latest articles</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                  <Reveal key={post.slug} delay={(i % 3) * 90}>
                    <article className="card group flex h-full flex-col overflow-hidden">
                      <Link href={`/blog/${post.slug}`} className="block">
                        <div className="relative h-52 overflow-hidden bg-cream-200">
                          {post.cover_image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>
                      </Link>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center gap-3 text-xs font-medium text-muted">
                          {post.published_at && (
                            <time dateTime={post.published_at}>
                              {formatClarionDate(post.published_at)}
                            </time>
                          )}
                          {post.author_name && <span>· {post.author_name}</span>}
                        </div>
                        <h3 className="mt-3 font-display text-xl font-bold text-forest-900">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="transition-colors hover:text-forest-700"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        {post.excerpt && (
                          <p className="mt-2 flex-1 text-muted leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                        <Link
                          href={`/blog/${post.slug}`}
                          className="mt-4 inline-flex items-center gap-1.5 font-semibold text-forest-700 hover:text-forest-900"
                        >
                          Read more
                          <IconArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CTABand
        title="Have questions about virtual treatment?"
        body="Our admissions team is here to help you understand your options and take the next step — whenever you're ready."
        image="/images/wheat-field-hope.jpg"
        imageAlt="Texas field at golden hour"
      />
    </>
  );
}
