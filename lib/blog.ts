/**
 * Blog data source.
 *
 * The blog is fully built and styled but starts empty by design — the old
 * articles were written for the previous Florida brand and were intentionally
 * not carried over. To publish an article, add an entry to `posts` below.
 * Each `body` block renders inside the `.prose-tx` article styles.
 *
 * Example:
 *
 *   {
 *     slug: 'welcome-to-greater-texas-behavioral',
 *     title: 'Welcome to Greater Texas Behavioral',
 *     excerpt: 'A short summary shown on the blog index and social cards.',
 *     date: '2026-07-10',                 // ISO date
 *     readingTime: '4 min read',
 *     image: '/images/community-support.jpg',
 *     imageAlt: 'Descriptive alt text',
 *     category: 'Recovery',
 *     body: [
 *       { type: 'p', text: 'A paragraph of body copy.' },
 *       { type: 'h2', text: 'A section heading' },
 *       { type: 'p', text: 'More copy.' },
 *       { type: 'ul', items: ['First point', 'Second point'] },
 *     ],
 *   }
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime?: string;
  image: string;
  imageAlt?: string;
  category?: string;
  body: Block[];
};

export const posts: Post[] = [];

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
