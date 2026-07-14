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

export function formatClarionDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
