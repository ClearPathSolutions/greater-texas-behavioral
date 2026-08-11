/**
 * Shared target resolution for every check in this directory (audit CR-05).
 *
 * Defaults to a LOCAL production build, deliberately. These scripts used to
 * hard-code the production Vercel alias, which meant running them pointed real
 * traffic at a live healthcare site and made them useless in CI.
 *
 *   npx next build && npx next start -p 3111    # then:
 *   npm test
 *
 * Override to check a deployed environment:
 *   BASE=https://greater-texas-behavioral.vercel.app npm test
 *
 * NOTE: branch previews sit behind Vercel Deployment Protection and 302 every
 * request to vercel.com/sso-api, so they cannot be checked over plain HTTP. The
 * production alias IS public and works.
 */
export const BASE = (process.env.BASE || 'http://127.0.0.1:3111').replace(/\/$/, '');

/** Routes that must return 200. Slash-terminated: `trailingSlash: true`. */
export const ROUTES = [
  '/',
  '/about/',
  '/team/',
  '/what-we-treat/',
  '/verify-insurance/',
  '/contact/',
  '/blog/',
  '/privacy-policy/',
];

/** Fail fast with a useful message rather than 8 confusing timeouts. */
export async function assertReachable() {
  try {
    const res = await fetch(BASE + '/', { redirect: 'manual' });
    if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`\n✖ Cannot reach ${BASE}\n  ${err.message}`);
    console.error('  Start a production build first:  npx next build && npx next start -p 3111');
    console.error('  Or point elsewhere:              BASE=https://… npm test\n');
    process.exit(2);
  }
}
