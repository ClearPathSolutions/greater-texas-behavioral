import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';

/**
 * Header logo — uses the brand's horizontal wordmark on light backgrounds.
 */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src="/logos/logo-horizontal.png"
        alt={site.name}
        width={2000}
        height={518}
        priority
        className="h-11 w-auto sm:h-12"
      />
    </Link>
  );
}

/**
 * Footer / dark-background lockup — the white horizontal logo (tan speech
 * bubbles) on the deep slate footer.
 */
export function LogoLight({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src="/logos/logo-horizontal-white.png"
        alt={site.name}
        width={2000}
        height={518}
        sizes="220px"
        className="h-12 w-auto"
      />
    </Link>
  );
}
