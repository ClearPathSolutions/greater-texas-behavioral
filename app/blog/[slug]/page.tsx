import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CTABand from '@/components/CTABand';
import { getAllPosts, getPost, formatDate, type Block } from '@/lib/blog';
import { IconArrowLeft } from '@/components/ui/Icon';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: 'Article not found' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [{ url: post.image }],
    },
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case 'h2':
      return <h2 key={i}>{block.text}</h2>;
    case 'h3':
      return <h3 key={i}>{block.text}</h3>;
    case 'quote':
      return <blockquote key={i}>{block.text}</blockquote>;
    case 'ul':
      return (
        <ul key={i}>
          {block.items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={i}>
          {block.items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ol>
      );
    default:
      return <p key={i}>{block.text}</p>;
  }
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <article>
        {/* Hero */}
        <header className="relative isolate overflow-hidden">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-forest-950/70" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(12,36,24,0.55) 0%, rgba(12,36,24,0.35) 40%, rgba(12,36,24,0.8) 100%)',
            }}
          />
          <div className="container-x relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-sm font-medium text-cream-100/80">
                {post.category && (
                  <span className="rounded-full bg-cream-50/15 px-3 py-1 backdrop-blur">
                    {post.category}
                  </span>
                )}
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.readingTime && <span>· {post.readingTime}</span>}
              </div>
              <h1 className="h-display mt-4 text-cream-50">{post.title}</h1>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="section bg-cream-50">
          <div className="container-narrow">
            <p className="lead mb-8 border-l-4 border-gold-400 pl-5">
              {post.excerpt}
            </p>
            <div className="prose-tx">{post.body.map(renderBlock)}</div>

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
