import Image from 'next/image';

/**
 * Blog cover image (audit VIS-1).
 *
 * Cover URLs come from two places with different trust levels, so they cannot be
 * rendered the same way:
 *
 * - **Local paths** (`/images/…`, used by every post in `lib/original-posts.ts`)
 *   go through `next/image`, so they get AVIF/WebP conversion, responsive
 *   `srcset` and lazy loading like every other image on the site. This is the
 *   consistency gap VIS-1 flagged.
 *
 * - **Remote URLs** from the Clarion CMS stay a plain `<img>` on purpose.
 *   `next/image` throws at request time for any hostname not listed in
 *   `images.remotePatterns`, so routing CMS-controlled URLs through it would take
 *   the blog down the moment an editor picks an image from a new host. An
 *   unoptimized image is a much better failure mode than a 500. The CSP already
 *   permits these (`img-src … https:`) — verified against
 *   `images.unsplash.com`, which loads and decodes normally.
 *
 * The caller supplies a positioned, fixed-size container, so no width/height is
 * needed here and there is no layout shift either way.
 */
export default function BlogCover({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return null;

  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // Don't leak the reading URL to third-party image hosts — this is a
      // behavioural-health site and the path alone can be sensitive.
      referrerPolicy="no-referrer"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
