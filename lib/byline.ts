/**
 * Article byline data (editorial-policy package: templates/article-byline.html
 * and schema/clinical-article.jsonld).
 *
 * Rules carried over from the package, and why each exists:
 *   - "Written by" appears only when a real author is known: the post's
 *     `written_by` bio slug, else the `author_name` Clarion / the local post
 *     already carries. No invented authors.
 *   - Every post shows a medical reviewer. The client overrode the package's
 *     "reviewer only with last_reviewed / no default reviewer" rule (2026-11):
 *     Clarion's `medically_reviewed_by`, `_credentials` and `_url` are kept
 *     where populated, and each empty field is filled individually from
 *     DEFAULT_REVIEWER. A local post's `reviewed_by` slug names a different
 *     reviewer; otherwise local posts get the default. `last_reviewed` is
 *     optional and only adds the "Last reviewed" date.
 *   - The reviewer's profile is the network profile on quadranthealthgroup.com.
 *     Her GTB page was removed at the client's request on 2026-11-06 (its URL
 *     redirects to /team/), so a reviewer URL pointing at a /team/<slug>/ page
 *     this site no longer serves falls back to the default URL.
 *   - Author names link to bio pages. The only bio pages this site has are the
 *     `/team/<slug>/` network-leader profiles (lib/network-leadership.ts), so
 *     that is what the slugs resolve against. An `author_name` with no bio page
 *     renders as plain text.
 */
import type { BlogPost } from './clarion-blog';
import { getNetworkLeader } from './network-leadership';
import { canonicalPath } from './seo';
import { site } from './site';

export type BylinePerson = {
  name: string;
  credentials: string | null;
  /** Site-relative bio path, or null when the person has no bio page here. */
  bioPath: string | null;
  /** Absolute profile URL on another site (opened in a new tab), or null. */
  externalUrl?: string | null;
};

/**
 * Site default reviewer. The profile is the Quadrant network page, not a GTB
 * page: /team/pamela-tambini/ was removed here on 2026-11-06 at the client's
 * request and must not be restored. Trailing slash is the form QHG serves.
 */
export const DEFAULT_REVIEWER = {
  name: 'Dr. Pamela Tambini',
  credentials: 'M.D.',
  url: 'https://www.quadranthealthgroup.com/team/pamela-tambini/',
} as const;

const SITE_HOST = new URL(site.url).hostname.replace(/^www\./, '');

/**
 * Resolves a reviewer profile URL. On this site's host (www or not) it becomes
 * an internal path in the served trailing-slash form; a `/team/<slug>/` path
 * with no bio page here (the removed GTB profile) falls back to the default.
 */
function reviewerLink(raw: string | null | undefined): Pick<BylinePerson, 'bioPath' | 'externalUrl'> {
  const fallback = { bioPath: null, externalUrl: DEFAULT_REVIEWER.url };
  const trimmed = raw?.trim();
  if (!trimmed) return fallback;
  let abs: URL;
  try {
    abs = new URL(trimmed, site.url);
  } catch {
    return fallback;
  }
  if (abs.hostname.replace(/^www\./, '') !== SITE_HOST) {
    return { bioPath: null, externalUrl: abs.href };
  }
  const team = abs.pathname.match(/^\/team\/([^/]+)\/?$/);
  if (team && !getNetworkLeader(team[1])) return fallback;
  return { bioPath: canonicalPath(abs.pathname), externalUrl: null };
}

function resolveReviewer(post: BlogPost): BylinePerson {
  // A local `reviewed_by` slug names a reviewer with a bio page on this site.
  if (post.reviewed_by) return bioPerson(post.reviewed_by, 'reviewed_by', post.slug);
  return {
    name: post.medically_reviewed_by?.trim() || DEFAULT_REVIEWER.name,
    credentials: post.medically_reviewed_by_credentials?.trim() || DEFAULT_REVIEWER.credentials,
    ...reviewerLink(post.medically_reviewed_by_url),
  };
}

export type Byline = {
  author: BylinePerson | null;
  /** Always set: the post's own reviewer, or the site default. */
  reviewer: BylinePerson;
  /** YYYY-MM-DD, or null. */
  lastReviewed: string | null;
  /** Neither Clarion nor the local posts record a modified date today. */
  modified: string | null;
};

function bioPerson(slug: string, field: string, postSlug: string): BylinePerson {
  const leader = getNetworkLeader(slug);
  // Fail the build: a byline naming someone without a bio page is exactly what
  // the policy promises never to publish.
  if (!leader) {
    throw new Error(`blog/${postSlug}: ${field} "${slug}" has no /team/<slug>/ bio page`);
  }
  return {
    name: leader.name,
    credentials: leader.credentials,
    bioPath: canonicalPath(`team/${leader.slug}`),
  };
}

export function getByline(post: BlogPost): Byline {
  if (post.last_reviewed && !/^\d{4}-\d{2}-\d{2}$/.test(post.last_reviewed)) {
    throw new Error(
      `blog/${post.slug}: last_reviewed must be YYYY-MM-DD, got "${post.last_reviewed}"`,
    );
  }
  const lastReviewed = post.last_reviewed || null;
  const reviewer = resolveReviewer(post);

  const authorName = post.author_name?.trim();
  const author = post.written_by
    ? bioPerson(post.written_by, 'written_by', post.slug)
    : authorName
      ? { name: authorName, credentials: null, bioPath: null }
      : null;

  return {
    author,
    reviewer,
    lastReviewed,
    modified: null,
  };
}
