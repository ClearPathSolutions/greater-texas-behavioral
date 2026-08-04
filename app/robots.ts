import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The lead route is a POST-only handler; there is nothing to crawl and a
      // GET only returns 405.
      disallow: ['/api/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
