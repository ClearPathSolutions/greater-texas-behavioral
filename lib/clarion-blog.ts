/**
 * Server-side Clarion blog data source.
 *
 * Clarion's client-side blog embed (blog-embed.v1.js) fetches these same public
 * endpoints from the browser, but that fetch is CORS-blocked because the blog
 * endpoints don't return an Access-Control-Allow-Origin header for our origin.
 * CORS is a browser-only restriction, so we fetch the exact same endpoints from
 * the Next.js server instead — no CORS, plus SSR/SEO and our own styling.
 *
 * Contract (reverse-engineered from blog-embed.v1.js):
 *   GET {api}/blog/public/feed?site_key=KEY
 *       -> { posts: [{ slug, title, excerpt, published_at, author_name, cover_image_url }] }
 *   GET {api}/blog/public/post?site_key=KEY&slug=SLUG
 *       -> { slug, title, excerpt, published_at, author_name, cover_image_url, body_html,
 *            medically_reviewed_by, medically_reviewed_by_credentials,
 *            medically_reviewed_by_url }   (each reviewer field may be null)
 */
import { clarion, site } from './site';

// Clarion's edge blocks non-browser User-Agents (Node's default => connection reset).
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const API = clarion.api.replace(/\/$/, '');

/**
 * Blog images on this site's own domain. Clarion stores them and hands out
 * `https://api.clarionlabs.ai/blog/public/image/<key>` (or, once Clarion is told
 * this site proxies them, `<this site>/blog-images/<key>`). Both become
 * `/blog-images/<key>`, which next.config.mjs rewrites to Clarion's bytes route,
 * so the address a visitor, Google Images or a social card sees is this site's.
 */
export const IMAGE_PATH = '/blog-images';
const CLARION_IMAGE = `${API}/blog/public/image/`;
const OWN_IMAGE = new RegExp(
  `https://(?:www\\.)?${new URL(site.url).hostname.replace(/^www\./, '').replace(/\./g, '\\.')}(?=${IMAGE_PATH}/)`,
  'g',
);

export function onSiteImage(src: string): string {
  if (src.startsWith(CLARION_IMAGE)) return `${IMAGE_PATH}/${src.slice(CLARION_IMAGE.length)}`;
  return src.replace(OWN_IMAGE, '');
}

function onSiteImages(html: string): string {
  return html.split(CLARION_IMAGE).join(`${IMAGE_PATH}/`).replace(OWN_IMAGE, '');
}

function withSiteImages<T extends ClarionListPost>(post: T): T {
  return post.cover_image_url ? { ...post, cover_image_url: onSiteImage(post.cover_image_url) } : post;
}

const KEY = process.env.CLARION_SITE_KEY || clarion.siteKey;

// Re-fetch from Clarion at most every 5 minutes (ISR).
const REVALIDATE = 300;

export type ClarionListPost = {
  slug: string;
  title: string;
  excerpt?: string;
  published_at?: string;
  author_name?: string;
  cover_image_url?: string;
  /** The author's alt text for the cover; empty means none was written. */
  cover_image_alt?: string | null;
};

export type ClarionPost = ClarionListPost & {
  body_html?: string;
  /** Reviewer fields from the post endpoint. Each populated one is kept; each
   *  empty one is filled from the site default in lib/byline.ts. */
  medically_reviewed_by?: string | null;
  medically_reviewed_by_credentials?: string | null;
  medically_reviewed_by_url?: string | null;
};

/**
 * Per-post editorial fields (editorial-policy package, "Post fields"). Only
 * locally authored posts (lib/original-posts.ts) carry them. All optional. An
 * empty author field means no "Written by" line. The reviewer is different:
 * every post shows one, and a post without one gets the site default reviewer
 * (client instruction, 2026-11; see lib/byline.ts).
 */
export type EditorialPostFields = {
  /** Author, as a `/team/<slug>/` bio slug. Overrides `author_name` when set. */
  written_by?: string;
  /** Clinical reviewer, as a `/team/<slug>/` bio slug. Overrides the site default reviewer. */
  reviewed_by?: string;
  /** Date of the clinical review, YYYY-MM-DD. Optional; the reviewer shows without it. */
  last_reviewed?: string;
};

/** A post as rendered: from Clarion, or local with optional editorial fields. */
export type BlogPost = ClarionPost & EditorialPostFields;

async function clarionGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json' },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getClarionFeed(): Promise<ClarionListPost[]> {
  const data = await clarionGet<{ posts?: ClarionListPost[] }>(
    `/blog/public/feed?site_key=${encodeURIComponent(KEY)}`,
  );
  return Array.isArray(data?.posts) ? data!.posts.map(withSiteImages) : [];
}

export async function getClarionPost(slug: string): Promise<ClarionPost | null> {
  const post = await clarionGet<ClarionPost>(
    `/blog/public/post?site_key=${encodeURIComponent(KEY)}&slug=${encodeURIComponent(slug)}`,
  );
  if (!post) return null;
  return {
    ...withSiteImages(post),
    ...(post.body_html ? { body_html: onSiteImages(post.body_html) } : {}),
  };
}

/** Cover alt text: the author's from Clarion, else the post title. Never empty. */
export function coverAlt(post: { title: string; cover_image_alt?: string | null }): string {
  return post.cover_image_alt?.trim() || post.title;
}

// ---------------------------------------------------------------------------
// Merged blog source: Clarion-managed posts + the adapted original posts.
// Clarion is the live source of truth; a Clarion post with the same slug as a
// local one takes precedence. Results are sorted newest-first.
// ---------------------------------------------------------------------------
import { originalPosts } from './original-posts';

export async function getAllBlogPosts(): Promise<ClarionListPost[]> {
  const feed = await getClarionFeed();
  const clarionSlugs = new Set(feed.map((p) => p.slug));
  const locals = originalPosts.filter((p) => !clarionSlugs.has(p.slug));
  return [...feed, ...locals].sort((a, b) =>
    (b.published_at || '').localeCompare(a.published_at || ''),
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const fromClarion = await getClarionPost(slug);
  if (fromClarion) return fromClarion;
  return originalPosts.find((p) => p.slug === slug) ?? null;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const feed = await getClarionFeed();
  return Array.from(
    new Set([...feed.map((p) => p.slug), ...originalPosts.map((p) => p.slug)]),
  );
}

export function formatClarionDate(iso?: string): string {
  if (!iso) return '';
  try {
    // Treat date-only values (YYYY-MM-DD) as local noon to avoid a UTC
    // off-by-one that can render the previous day.
    const d = /^\d{4}-\d{2}-\d{2}$/.test(iso)
      ? new Date(`${iso}T12:00:00`)
      : new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
