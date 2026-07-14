import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getClarionFeed } from '@/lib/clarion-blog';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['', '/our-story', '/what-we-treat', '/verify-insurance', '/blog'];
  const now = new Date();
  const staticPages = routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const posts = await getClarionFeed();
  const postPages = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}
