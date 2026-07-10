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
        width={977}
        height={391}
        priority
        className="h-9 w-auto sm:h-10"
      />
    </Link>
  );
}

/**
 * Footer / dark-background lockup — mark in a light badge + light wordmark,
 * so the brand reads clearly on the deep forest footer.
 */
export function LogoLight({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-50 shadow-soft">
        <Image
          src="/logos/logo-mark.png"
          alt=""
          width={72}
          height={72}
          sizes="44px"
          className="h-9 w-9"
        />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[0.95rem] font-extrabold uppercase tracking-wide text-cream-50">
          Greater Texas
        </span>
        <span className="block font-display text-xs font-semibold uppercase tracking-[0.22em] text-sage-300">
          Behavioral
        </span>
      </span>
    </Link>
  );
}
