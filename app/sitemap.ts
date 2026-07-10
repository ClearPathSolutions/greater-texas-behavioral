import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getAllPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/our-story', '/what-we-treat', '/verify-insurance', '/blog'];
  const now = new Date();
  const staticPages = routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const postPages = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(post.date + 'T00:00:00'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}
