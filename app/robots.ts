import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/**
 * Only the real production domain may be indexed.
 *
 * WHY (found 2026-08-11, no audit row covers it): this used to emit
 * `Allow: /` unconditionally. The Vercel production alias
 * (`greater-texas-behavioral.vercel.app`) is PUBLIC — it returns 200 over plain
 * HTTP, unlike branch previews, which sit behind Deployment Protection — so it
 * was fully crawlable while every page on it declared
 * `rel="canonical"` pointing at `greatertexasbehavioral.com`. Until cutover that
 * domain is still the old WordPress site, which serves different content at
 * those URLs and 404s four of them (`/about/`, `/contact/`, `/team/`,
 * `/verify-insurance/`). Publishing a crawlable duplicate that cross-canonicals
 * to mismatched URLs is a self-inflicted indexing problem.
 *
 * `VERCEL_ENV` is `production` only for the production deployment; previews and
 * local builds are `preview`/`development`/undefined. After cutover this becomes
 * a no-op for the real domain and keeps protecting every preview.
 *
 * ⚠️ THIS IS EVALUATED AT BUILD TIME, not per request — `/robots.txt` is a static
 * route, so the branch taken is frozen into the output. Vercel sets `VERCEL_ENV`
 * during the build, so production deployments come out correct. But it means:
 *
 *   VERCEL_ENV=production next start     ← does NOTHING, the file is already built
 *   VERCEL_ENV=production next build     ← this is what actually matters
 *
 * Verified both ways: a build with `VERCEL_ENV=production` emits `Allow: /` plus
 * the sitemap; a build without it emits `Disallow: /`. The default direction is
 * deliberately fail-safe — an unexpected build environment blocks crawlers rather
 * than accidentally indexing a staging copy.
 */
const isProduction = process.env.VERCEL_ENV === 'production';

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

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
