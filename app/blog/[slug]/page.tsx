import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CTABand from '@/components/CTABand';
import {
  getAllBlogSlugs,
  getBlogPost,
  formatClarionDate,
} from '@/lib/clarion-blog';
import { IconArrowLeft } from '@/components/ui/Icon';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import BlogCover from '@/components/BlogCover';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  // Unknown slugs render notFound() below; keep them out of the index.
  if (!post) {
    return pageMetadata({
      title: 'Article not found',
      description: site.description,
      path: `blog/${params.slug}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: post.title,
    description: post.excerpt || site.description,
    path: `blog/${post.slug}`,
    type: 'article',
    image: post.cover_image_url || '/og-image.jpg',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <article>
        {/* Hero */}
        <header className="relative isolate overflow-hidden bg-forest-900">
          <BlogCover
            src={post.cover_image_url}
            /* Decorative: the headline immediately below carries the meaning. */
            alt=""
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-forest-950/70" />
          <div className="container-x relative pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pt-40 lg:pb-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-sm font-medium text-cream-100/80">
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatClarionDate(post.published_at)}
                  </time>
                )}
                {post.author_name && <span>· {post.author_name}</span>}
              </div>
              <h1 className="h-display mt-4 text-cream-50">{post.title}</h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="section bg-cream-50">
          <div className="container-narrow">
            {post.excerpt && (
              <p className="lead mb-8 border-l-4 border-gold-400 pl-5">
                {post.excerpt}
              </p>
            )}
            <div
              className="prose-tx"
              // Content authored by the site owner in Clarion (trusted CMS source).
              dangerouslySetInnerHTML={{ __html: post.body_html || '' }}
            />

            <div className="mt-12 border-t border-cream-300 pt-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-semibold text-forest-700 hover:text-forest-900"
              >
                <IconArrowLeft className="h-4 w-4" />
                Back to all articles
              </Link>
            </div>
          </div>
        </div>
      </article>

      <CTABand
        title="Ready to talk to someone?"
        body="If any of this resonates, our admissions team is here — confidentially and without obligation."
        image="/images/tx-bluebonnet-field.jpg"
        imageAlt="Texas bluebonnet field at sunset"
      />
    </>
  );
}
