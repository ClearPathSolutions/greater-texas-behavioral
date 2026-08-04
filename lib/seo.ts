/**
 * Per-page metadata builder (fixes audit V0047).
 *
 * Next.js merges `openGraph` field-by-field with the parent layout, which is
 * exactly why og:url/og:title silently stayed at the site defaults on every
 * page: a page that sets only `title` inherits the layout's `openGraph.url`,
 * so all five pages advertised the homepage. Rather than repeat four
 * near-identical blocks per route, every page funnels through this helper so
 * canonical, og:url, og:title/description and the Twitter card can never
 * disagree with one another again.
 *
 * Paths are emitted WITH a trailing slash to match `trailingSlash: true` in
 * next.config.mjs, so the canonical target is the URL actually served (no
 * canonical -> redirect hop).
 */
import type { Metadata } from 'next';
import { site } from './site';

/** Normalises `''`, `'about'` and `'/about'` to `'/about/'`. */
export function canonicalPath(path = ''): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export function pageMetadata({
  title,
  description,
  path,
  image = '/og-image.jpg',
  type = 'website',
  noIndex = false,
  absoluteTitle = false,
}: {
  /** Page title WITHOUT the site-name suffix — the layout template adds it. */
  title: string;
  description: string;
  /** Route path, e.g. `'about'` or `''` for the homepage. */
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  /**
   * Use the title verbatim instead of running it through the layout's
   * `%s | Greater Texas Behavioral` template. The homepage needs this — its
   * title already ends in the brand name.
   */
  absoluteTitle?: boolean;
}): Metadata {
  const url = canonicalPath(path);
  // og:title carries the full, share-ready title. Page `title` stays bare so
  // the layout's `%s | Greater Texas Behavioral` template still applies.
  const shareTitle = absoluteTitle ? title : `${title} | ${site.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      locale: 'en_US',
      siteName: site.name,
      url,
      title: shareTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [image],
    },
  };
}
