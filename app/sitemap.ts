import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { canonicalPath } from '@/lib/seo';
import { getAllBlogPosts } from '@/lib/clarion-blog';

export const revalidate = 300;

/**
 * Static routes. Paths run through `canonicalPath()` so every entry carries the
 * trailing slash that `trailingSlash: true` actually serves — otherwise each URL
 * listed here would 308 to its real location, wasting crawl budget and muddying
 * the canonical signal.
 *
 * `updated` (audit CR-13) is a HAND-MAINTAINED date: the last time the page's
 * content meaningfully changed. It used to be `new Date()`, which told crawlers
 * all 8 pages had changed on every single deploy — a false change signal that
 * dilutes exactly the crawl budget the V0102 trailing-slash work was protecting.
 *
 * **Bump the date on a route when you change that page's content.** Deliberately
 * not derived from git mtime: a formatting-only commit would move the date for
 * no reason, which is the same false signal in a subtler form.
 */
const ROUTES: Array<{ path: string; priority: number; updated: string }> = [
  { path: '', priority: 1, updated: '2026-08-11' },
  { path: 'about', priority: 0.8, updated: '2026-08-04' },
  { path: 'team', priority: 0.6, updated: '2026-08-28' },
  { path: 'what-we-treat', priority: 0.8, updated: '2026-08-11' },
  { path: 'verify-insurance', priority: 0.8, updated: '2026-08-11' },
  { path: 'contact', priority: 0.7, updated: '2026-08-04' },
  { path: 'faq', priority: 0.7, updated: '2026-08-11' },
  { path: 'blog', priority: 0.8, updated: '2026-08-04' },
  // NOT LISTED: `/team/<slug>/` network-leader profiles. Their canonical points
  // at the parent (`CANONICAL_AT_PARENT` in app/team/[slug]/page.tsx) because the
  // same bio is published on quadranthealthgroup.com and every other Quadrant
  // facility site. Listing a URL here asks for it to be indexed, which is the
  // opposite of what its canonical says — a self-contradicting pair of signals.
  // The pages are still crawlable: `/team` links to each one. If a profile ever
  // becomes canonical HERE, drop it from that map and add it to this list.
  // Low priority but deliberately indexable: the live site already serves this
  // URL, and a healthcare site should have a discoverable privacy policy.
  { path: 'privacy-policy', priority: 0.3, updated: '2026-08-04' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages = ROUTES.map(({ path, priority, updated }) => ({
    url: `${site.url}${canonicalPath(path)}`,
    lastModified: new Date(`${updated}T12:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority,
  }));

  const posts = await getAllBlogPosts();
  const postPages = posts.map((post) => ({
    url: `${site.url}${canonicalPath(`blog/${post.slug}`)}`,
    lastModified: post.published_at ? new Date(post.published_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}
