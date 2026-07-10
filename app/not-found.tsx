import Link from 'next/link';
import { site } from '@/lib/site';
import { IconArrowLeft, IconPhone } from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <section className="section bg-cream-50">
      <div className="container-x flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="font-display text-6xl font-extrabold text-forest-200">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-forest-900">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 max-w-md text-muted">
          The page you&apos;re looking for may have moved. Let&apos;s get you back
          on track — or reach out and we&apos;ll help directly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            <IconArrowLeft className="h-5 w-5" />
            Back to home
          </Link>
          <a href={site.phoneHref} className="btn-outline">
            <IconPhone className="h-5 w-5" />
            Call {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
