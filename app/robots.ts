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
 * ⚠️ CORRECTED 2026-08-11 — `VERCEL_ENV` ALONE WAS THE WRONG TEST.
 * The first version gated on `VERCEL_ENV === 'production'`. That reads as "is
 * this the real site" but actually means "is this the production deployment of
 * this Vercel project" — and until cutover those are different things. The
 * production deployment today IS `greater-texas-behavioral.vercel.app`, so
 * deploying would have emitted `Allow: /` on exactly the host this guard exists
 * to keep out of the index. Confirmed by building with `VERCEL_ENV=production`
 * before the first deploy: it emitted `Allow: /`.
 *
 * The test is therefore "is this deployment actually serving the canonical
 * domain", compared against `site.url` so the two can never disagree:
 *
 *   VERCEL_PROJECT_PRODUCTION_URL   the project's production domain. Becomes
 *                                   `greatertexasbehavioral.com` the moment that
 *                                   custom domain is attached, so indexing turns
 *                                   itself on at cutover with nothing to remember.
 *   SITE_INDEXABLE=true             manual override, in case that variable is
 *                                   unavailable or the domain is served some other
 *                                   way. Set it in Vercel only when the canonical
 *                                   domain is genuinely live on this deployment.
 *
 * Both still require `VERCEL_ENV === 'production'`, so previews stay blocked
 * regardless.
 *
 * ⚠️ THIS IS EVALUATED AT BUILD TIME, not per request — `/robots.txt` is a static
 * route, so the branch taken is frozen into the output. Vercel sets these during
 * the build, so production deployments come out correct. But it means:
 *
 *   SITE_INDEXABLE=true next start     ← does NOTHING, the file is already built
 *   SITE_INDEXABLE=true next build     ← this is what actually matters
 *
 * A redeploy is required for a change here to take effect.
 *
 * The default direction is deliberately fail-safe: anything unexpected blocks
 * crawlers rather than accidentally indexing a staging copy. The cost of being
 * wrong in that direction is a delayed index; the cost of the other direction is
 * a duplicate-content problem that outlives the mistake.
 */
const CANONICAL_HOST = new URL(site.url).host;

const isProductionDeployment = process.env.VERCEL_ENV === 'production';
const servesCanonicalDomain =
  process.env.VERCEL_PROJECT_PRODUCTION_URL === CANONICAL_HOST ||
  process.env.SITE_INDEXABLE === 'true';

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment || !servesCanonicalDomain) {
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
