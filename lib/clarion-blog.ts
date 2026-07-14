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
 *       -> { slug, title, excerpt, published_at, author_name, cover_image_url, body_html }
 */
import { clarion } from './site';

// Clarion's edge blocks non-browser User-Agents (Node's default => connection reset).
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const API = clarion.api.replace(/\/$/, '');
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
};

export type ClarionPost = ClarionListPost & {
  body_html?: string;
};

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
  return Array.isArray(data?.posts) ? data!.posts : [];
}

export async function getClarionPost(slug: string): Promise<ClarionPost | null> {
  return clarionGet<ClarionPost>(
    `/blog/public/post?site_key=${encodeURIComponent(KEY)}&slug=${encodeURIComponent(slug)}`,
  );
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

export async function getBlogPost(slug: string): Promise<ClarionPost | null> {
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
