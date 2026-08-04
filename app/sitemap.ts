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
 */
const ROUTES: Array<{ path: string; priority: number }> = [
  { path: '', priority: 1 },
  { path: 'our-story', priority: 0.8 },
  { path: 'what-we-treat', priority: 0.8 },
  { path: 'verify-insurance', priority: 0.8 },
  { path: 'blog', priority: 0.8 },
  // Low priority but deliberately indexable: the live site already serves this
  // URL, and a healthcare site should have a discoverable privacy policy.
  { path: 'privacy-policy', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages = ROUTES.map(({ path, priority }) => ({
    url: `${site.url}${canonicalPath(path)}`,
    lastModified: now,
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
