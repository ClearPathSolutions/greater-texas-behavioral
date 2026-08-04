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
 * `script-src 'unsafe-inline'` is still required: the root layout ships two
 * small inline bootstrap scripts and Next.js inlines its own hydration data.
 * Tightening this to a nonce needs `middleware.ts` to generate a per-request
 * nonce — worth doing, but it changes every route to dynamic rendering, so it
 * is intentionally left as a follow-up rather than bundled into this pass.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.clarionlabs.ai",
  "style-src 'self' 'unsafe-inline'",
  // Staff photos are served from the Quadrant support portal; next/image
  // also emits data:/blob: URLs for placeholders.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.clarionlabs.ai",
  "frame-src 'none'",
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
  },
  async redirects() {
    return [
      // Renamed: WordPress `/insurance-verification/` -> `/verify-insurance/`
      {
        source: '/insurance-verification',
        destination: '/verify-insurance/',
        permanent: true,
      },
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
