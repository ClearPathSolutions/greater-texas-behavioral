/**
 * Blog posts withdrawn from the site (FR-1, 2026-11-20).
 *
 * Greater Texas Behavioral is a virtual outpatient MENTAL HEALTH program. It
 * does not operate a substance use disorder program, and LegitScript flagged the
 * site for presenting SUD treatment as a primary service (Standards 9 and 16).
 * These posts are addiction/detox-first, so they are hidden from /blog, the
 * sitemap and static params, and their URLs 301 to /blog/ (next.config.mjs).
 *
 * The five local posts still live in lib/original-posts.ts for history; the
 * Clarion post should ALSO be unpublished or rewritten in Clarion. Listing a
 * slug here is the site-side guard so it cannot reappear from the feed.
 *
 * Plain .mjs so next.config.mjs can import it without a TS step.
 */
export const RETIRED_BLOG_SLUGS = [
  // lib/original-posts.ts (all five were inherited from an SUD/detox facility)
  'holiday-pressure-and-addiction-when-its-time-to-reach-out-for-help',
  'when-detox-is-the-right-first-step-in-addiction-recovery',
  'beyond-the-dry-january-trend-when-brief-abstinence-signals-a-need-for-clinical-intervention',
  'comprehensive-addiction-treatment-in-texas',
  'detox-in-texas-that-accepts-private-insurance',
  // Clarion
  'virtual-iop-programs-texas-treat-alcohol-substance',
];
