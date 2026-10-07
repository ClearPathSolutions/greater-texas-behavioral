/**
 * Article byline data (editorial-policy package: templates/article-byline.html
 * and schema/clinical-article.jsonld).
 *
 * Rules carried over from the package, and why each exists:
 *   - "Written by" appears only when a real author is known: the post's
 *     `written_by` bio slug, else the `author_name` Clarion / the local post
 *     already carries. No invented authors.
 *   - The reviewer appears only when BOTH `reviewed_by` and `last_reviewed` are
 *     set. There is never a default or site-wide reviewer.
 *   - Names link to bio pages. The only bio pages this site has are the
 *     `/team/<slug>/` network-leader profiles (lib/network-leadership.ts), so
 *     that is what the slugs resolve against. An `author_name` with no bio page
 *     renders as plain text.
 */
import type { BlogPost } from './clarion-blog';
import { getNetworkLeader } from './network-leadership';
import { canonicalPath } from './seo';

export type BylinePerson = {
  name: string;
  credentials: string | null;
  /** Site-relative bio path, or null when the person has no bio page. */
  bioPath: string | null;
};

export type Byline = {
  author: BylinePerson | null;
  /** Set only when the post has both a reviewer and a review date. */
  reviewer: BylinePerson | null;
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
  // Resolved even when undated, so a typo'd slug still fails the build.
  const reviewer = post.reviewed_by
    ? bioPerson(post.reviewed_by, 'reviewed_by', post.slug)
    : null;

  const authorName = post.author_name?.trim();
  const author = post.written_by
    ? bioPerson(post.written_by, 'written_by', post.slug)
    : authorName
      ? { name: authorName, credentials: null, bioPath: null }
      : null;

  return {
    author,
    reviewer: lastReviewed ? reviewer : null,
    lastReviewed,
    modified: null,
  };
}
