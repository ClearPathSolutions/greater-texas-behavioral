/**
 * Production URL + security configuration.
 *
 * TRAILING SLASH (audit V0102)
 * The live production site (WordPress/WP Engine) is slash-canonical: every URL
 * in its sitemap ends in `/`, and the slashless form 301s to the slash form.
 * Every existing backlink, Search Console record and ad destination therefore
 * uses the slash form. We match that convention so the cutover costs zero
 * redirect hops and zero accumulated link equity.
 *   NOTE: this must be ratified portfolio-wide — all 12 production sites are
 *   slash-canonical today, so `true` is the convention that aligns everything.
 *
 * REDIRECTS
 * The old site's 9 indexed URLs are mapped below. Two slugs carry over
 * unchanged (`/` and `/what-we-treat`) and `/privacy-policy` is now a real page
 * again, so only the renamed and retired URLs need entries.
 * Destinations include the trailing slash so nothing takes a double hop.
 */

/**
 * WordPress taxonomy/author archives that are indexed on production (audit
 * CR-15). All six return 200 today and appear in production's sitemap, and none
 * had a mapping — every one would have 404'd at cutover.
 *
 * Matched as path params rather than the six known literals so any tag or
 * category published on production between now and cutover is covered too.
 *
 * `:slug*` (zero-or-more segments), NOT `:slug`. The single-segment form was the
 * first fix and it left six live URLs still 404ing, because WordPress hangs a
 * feed off every archive: `/category/blog/feed/`, `/tag/detox/feed/` and
 * `/author/qhd-dev/feed/` all return 200 on production and are two segments deep.
 * Verified 2026-08-11. The wildcard also covers nested categories and any depth
 * added before cutover.
 */
const ARCHIVE_PREFIXES = ['category', 'tag', 'author'];

/** Blog posts that lived at the WordPress root and now live under /blog. */
const MIGRATED_POSTS = [
  'holiday-pressure-and-addiction-when-its-time-to-reach-out-for-help',
  'when-detox-is-the-right-first-step-in-addiction-recovery',
  'beyond-the-dry-january-trend-when-brief-abstinence-signals-a-need-for-clinical-intervention',
];

/**
 * Inherited Florida ("Seaside Wellness") articles with no Texas equivalent.
 * Sent to the blog index rather than 404'd so inbound links keep a useful
 * destination; they are not in our sitemap, so they will drop out of the index.
 */
const RETIRED_POSTS = [
  'west-palm-beach-addiction-treatment-guide',
  'how-to-find-a-luxury-detox',
];

/**
 * Content-Security-Policy.
 *
 * Scoped deliberately tight on `connect-src`/`form-action`: the insurance form
 * collects an insurance member ID and free-text health context, so the value
 * here is preventing that data from being posted anywhere other than our own
 * origin and Clarion. Verified against widget.v1.js / forms-capture.v1.js —
 * both talk only to https://api.clarionlabs.ai, use no iframes and open no
 * sockets.
 *
 * `script-src 'unsafe-inline'` is still required: the root layout ships four
 * small inline scripts (the `js` class, the campaign-attribution bootstrap, the
 * JSON-LD block and GTM's initialiser) and Next.js inlines its own hydration
 * data.
 * Tightening this to a nonce needs `middleware.ts` to generate a per-request
 * nonce — worth doing, but it changes every route to dynamic rendering, so it
 * is intentionally left as a follow-up rather than bundled into this pass.
 */
const CSP = [
  "default-src 'self'",
  // GTM + CallTrackingMetrics added 2026-08-11 (see `analytics` in lib/site.ts).
  //
  // ⚠️ GTM IS A LOADER, NOT A TAG. Whatever is configured in the GTM UI injects
  // further scripts at runtime, and anything whose host is not listed here is
  // silently blocked — the tag simply never fires, with no error in the GTM
  // interface. So every new tag added in GTM needs its host added here too.
  // Common ones and what they need:
  //   Microsoft Clarity  -> script www.clarity.ms · connect *.clarity.ms  [ALREADY IN
  //                         THIS CONTAINER — see the warning below]
  //   GA4                -> script googletagmanager.com · connect *.google-analytics.com
  //   Google Ads / gtag  -> script googletagmanager.com, googleadservices.com
  //                         · connect google.com, googleadservices.com · img *
  //   Meta Pixel         -> script connect.facebook.net · connect facebook.com
  //   LinkedIn           -> script snap.licdn.com · connect px.ads.linkedin.com
  // If a tag "works in Preview mode but not live", this list is the first place
  // to look: GTM Preview runs same-origin and bypasses the page CSP.
  //
  // ⚠️ MICROSOFT CLARITY IS ALREADY CONFIGURED IN THIS GTM CONTAINER.
  // Discovered by running tests/csp-check.mjs after adding GTM: the container
  // immediately tried to load https://www.clarity.ms/tag/y5yz4xse4b and CSP
  // blocked it. Clarity is SESSION RECORDING + heatmaps — it replays mouse
  // movement, clicks and scrolling. `www.clarity.ms` is allowlisted below so the
  // container the owner asked for actually works, but on a behavioural-health
  // site this is the single highest-risk tag in the stack: /verify-insurance
  // collects an insurance member ID and free-text health context. Clarity masks
  // input VALUES by default, but it still records interaction on those pages.
  // Decide deliberately: mask/exclude the form routes in Clarity, or remove the
  // tag. Removing the two clarity.ms hosts from script-src disables it again.
  //
  // ⚠️ AND IT IS NOT JUST SESSION RECORDING. Verified in a real browser after
  // allowlisting: Clarity loads scripts.clarity.ms, then beacons c.clarity.ms
  // AND c.bing.com with a `CtsSyncId`, setting MUID / MR / SRM_B / ANONCHK.
  // MUID is Microsoft's CROSS-SITE ADVERTISING IDENTIFIER. So this container
  // syncs an ad ID to Microsoft Advertising from a substance-use treatment site,
  // which is the exact pattern HHS OCR's tracking-technology guidance is about.
  // Ten cookies are set on first load; before GTM there were zero.
  // See ISSUES.md CR-22.
  "script-src 'self' 'unsafe-inline' https://www.clarionlabs.ai https://www.googletagmanager.com https://264810.tctm.co https://*.tctm.co https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  // Staff photos are served from the Quadrant support portal; next/image
  // also emits data:/blob: URLs for placeholders.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // `connect-src` is the one directive worth keeping tight: the insurance form
  // carries a member ID and free-text health context, so this is what stops that
  // payload reaching anywhere unintended. Each host below is here for a reason —
  // do not widen it to `https:` for convenience.
  //
  // `*.tctm.co` is load-bearing for lead attribution, not just for the number
  // swap: t.js tracks events with an XHR to `<account>.tctm.co/x.json`. Remove it
  // and the script still loads and still swaps numbers while silently recording
  // nothing — which is the exact failure mode `lib/attribution.ts` exists to fix.
  "connect-src 'self' https://api.clarionlabs.ai https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.tctm.co https://api.calltrackingmetrics.com https://*.clarity.ms",
  // GTM's <noscript> fallback is an iframe on googletagmanager.com. Was 'none'.
  "frame-src https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Redundant with frame-ancestors, but still honoured by older crawlers/proxies.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    // Nothing on the marketing site needs these. Revisit if telehealth video
    // is ever embedded directly rather than linked out to the clinical platform.
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    /**
     * Staff headshots from the Quadrant support portal (audit CR-20).
     *
     * Safe to optimize here, unlike blog covers: this host is single, known and
     * fixed — `lib/staff.ts` derives it from `STAFF_FEED_ORIGIN` and defaults to
     * this origin, so a CMS editor cannot introduce an unlisted hostname. Blog
     * cover hosts ARE editor-controlled and unbounded, which is why
     * `components/BlogCover.tsx` deliberately keeps them off `next/image` (an
     * unlisted host throws at request time and would 500 the blog).
     *
     * If STAFF_FEED_ORIGIN is ever pointed at another environment, add it here
     * too or the avatars will throw.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'support.quadranthealthgroup.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Renamed: WordPress `/insurance-verification/` -> `/verify-insurance/`
      {
        source: '/insurance-verification',
        destination: '/verify-insurance/',
        permanent: true,
      },
      // Audit CR-16 — `/insurance` is a live 301 alias on production
      // (`/insurance` -> `/insurance-verification/`), so it is a real inbound
      // path someone has linked, and it was mapped nowhere. Note audit row
      // V0116 claims production *serves* `/insurance`; it does not — it
      // redirects. The canonical production slug is `/insurance-verification/`,
      // which is already handled above.
      { source: '/insurance', destination: '/verify-insurance/', permanent: true },
      // Audit CR-15 — indexed WordPress archives (and their per-archive feeds)
      // -> the blog index. See ARCHIVE_PREFIXES above for why this is `:slug*`.
      ...ARCHIVE_PREFIXES.map((prefix) => ({
        source: `/${prefix}/:slug*`,
        destination: '/blog/',
        permanent: true,
      })),
      // Audit CR-17 — WordPress RSS. `/feed/` returns 200 on production and so
      // do its format variants: `/feed/atom/` is 200 and `/feed/rss/` is a live
      // 301. We ship no feed, so subscribed aggregators would break silently at
      // cutover. `:path*` catches every variant; sent to the blog index rather
      // than building an RSS route for 6 posts.
      { source: '/feed/:path*', destination: '/blog/', permanent: true },
      // `/comments/feed/` is a separate WordPress endpoint (site-wide comment
      // RSS), also 200 on production, and is NOT under /feed — it needs its own
      // entry or it 404s.
      { source: '/comments/:path*', destination: '/blog/', permanent: true },
      // Root-level WordPress posts now namespaced under /blog
      ...MIGRATED_POSTS.map((slug) => ({
        source: `/${slug}`,
        destination: `/blog/${slug}/`,
        permanent: true,
      })),
      // Retired inherited Florida content
      ...RETIRED_POSTS.map((slug) => ({
        source: `/${slug}`,
        destination: '/blog/',
        permanent: true,
      })),
      // Audit V0097 — adopt the portfolio-standard `/about` slug. `/about` is
      // now the canonical route; the old WordPress `/our-story/` (which IS
      // indexed on the live site) redirects to it.
      { source: '/our-story', destination: '/about/', permanent: true },
      // Audit V0098 — `/contact` is the portfolio standard; catch the two
      // variants used elsewhere in the portfolio so inbound links resolve.
      { source: '/contact-us', destination: '/contact/', permanent: true },
      { source: '/contact-location', destination: '/contact/', permanent: true },
      // Common inbound variant for the privacy page.
      { source: '/privacy', destination: '/privacy-policy/', permanent: true },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
