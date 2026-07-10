import Link from 'next/link';
import { LogoLight } from './Logo';
import { footerLinks, site } from '@/lib/site';
import { IconPhone, IconMail, IconMapPin, IconArrowRight } from './ui/Icon';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-forest-950 text-cream-100">
      {/* Top CTA strip */}
      <div className="border-b border-white/10">
        <div className="container-x flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-cream-50 sm:text-3xl">
              Ready when you are.
            </h2>
            <p className="mt-2 max-w-xl text-cream-100/70">
              Speak with an admissions specialist today — the call is free,
              confidential, and there is no obligation.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={site.phoneHref} className="btn-gold whitespace-nowrap">
              <IconPhone className="h-5 w-5" />
              {site.phone}
            </a>
            <Link
              href="/verify-insurance"
              className="btn-ghost-light whitespace-nowrap"
            >
              Verify Insurance
              <IconArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <LogoLight />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-100/70">
            A fully licensed Virtual Intensive Outpatient Program delivering
            structured, evidence-based addiction and mental health treatment
            through secure telehealth — anywhere in Texas.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-sage-200">
            <IconMapPin className="h-4 w-4" />
            Serving all of Texas · 100% online
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cream-50">
            Get Help
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-cream-100/70 transition-colors hover:text-cream-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={site.admissionsHref}
                className="text-cream-100/70 transition-colors hover:text-cream-50"
              >
                Admissions Hotline
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cream-50">
            Contact Us
          </h3>
          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <a
                href={site.phoneHref}
                className="group flex items-start gap-3 text-cream-100/80 hover:text-cream-50"
              >
                <IconPhone className="mt-0.5 h-5 w-5 text-sage-300" />
                <span>
                  <span className="block text-xs uppercase tracking-wide text-cream-100/50">
                    Phone
                  </span>
                  {site.phone}
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="group flex items-start gap-3 break-all text-cream-100/80 hover:text-cream-50"
              >
                <IconMail className="mt-0.5 h-5 w-5 shrink-0 text-sage-300" />
                <span>
                  <span className="block text-xs uppercase tracking-wide text-cream-100/50">
                    Email
                  </span>
                  {site.email}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Crisis resources — responsible practice for a behavioral health site */}
      <div className="border-t border-white/10 bg-forest-950">
        <div className="container-x py-5">
          <p className="text-xs leading-relaxed text-cream-100/55">
            <strong className="font-semibold text-cream-100/80">
              In a crisis?
            </strong>{' '}
            If you or someone you know is in immediate danger, call 911. For
            free, confidential support 24/7, call or text the 988 Suicide &amp;
            Crisis Lifeline, or reach the SAMHSA National Helpline at
            1-800-662-4357.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream-100/50 sm:flex-row">
          <p>
            © {year} {site.copyrightHolder}. All Rights Reserved.
          </p>
          <p>
            Licensed Virtual IOP · Confidential &amp; HIPAA-compliant telehealth
          </p>
        </div>
      </div>
    </footer>
  );
}
