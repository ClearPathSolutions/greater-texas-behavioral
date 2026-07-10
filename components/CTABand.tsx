import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';
import Reveal from './ui/Reveal';
import { IconPhone, IconArrowRight, IconLock } from './ui/Icon';

type CTABandProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  image?: string;
  imageAlt?: string;
};

export default function CTABand({
  eyebrow = 'Take the first step',
  title,
  body,
  image = '/images/tx-bluebonnet-field.jpg',
  imageAlt = 'Texas bluebonnet field at sunset',
}: CTABandProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-forest-950/78" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(120deg, rgba(12,36,24,0.85) 0%, rgba(12,36,24,0.55) 55%, rgba(12,36,24,0.75) 100%)',
        }}
      />
      <div className="container-x relative section">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-gold-300 before:bg-gold-300">
            {eyebrow}
          </span>
          <h2 className="h-section mt-4 text-cream-50">{title}</h2>
          {body && (
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream-100/80">
              {body}
            </p>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={site.phoneHref} className="btn-gold w-full sm:w-auto">
              <IconPhone className="h-5 w-5" />
              Call {site.phone}
            </a>
            <Link
              href="/verify-insurance"
              className="btn-ghost-light w-full sm:w-auto"
            >
              Verify Your Insurance
              <IconArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-cream-100/70">
            <IconLock className="h-4 w-4 text-sage-300" />
            100% confidential · Free assessment · No obligation
          </p>
        </Reveal>
      </div>
    </section>
  );
}
