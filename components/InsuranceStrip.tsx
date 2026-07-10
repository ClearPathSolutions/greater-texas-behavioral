import Link from 'next/link';
import { insuranceCarriers, site } from '@/lib/site';
import Reveal from './ui/Reveal';
import { IconShieldCheck, IconArrowRight, IconPhone } from './ui/Icon';

/**
 * Insurance carriers section — rebuilt as accessible text chips (no baked-in
 * image of logos) so it scales crisply and stays readable on every screen.
 */
export default function InsuranceStrip() {
  return (
    <section className="section bg-cream-100">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <Reveal>
            <span className="eyebrow">Coverage made simple</span>
            <h2 className="h-section mt-4">We accept most major insurance</h2>
            <p className="lead mt-5">
              Greater Texas Behavioral works with most major PPO insurance plans
              and will verify your coverage quickly and confidentially. Our
              admissions team works directly with your provider to help minimize
              out-of-pocket costs — many clients pay little to nothing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/verify-insurance" className="btn-primary">
                <IconShieldCheck className="h-5 w-5" />
                Verify Your Insurance
              </Link>
              <a href={site.phoneHref} className="btn-outline">
                <IconPhone className="h-5 w-5" />
                {site.phone}
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">
              Free, confidential verification — usually within one business day.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="card p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-forest-600">
                In-network &amp; out-of-network with
              </p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {insuranceCarriers.map((carrier) => (
                  <li
                    key={carrier}
                    className="rounded-full border border-cream-300 bg-cream-50 px-3.5 py-2 text-sm font-medium text-forest-800"
                  >
                    {carrier}
                  </li>
                ))}
                <li className="rounded-full bg-forest-800 px-3.5 py-2 text-sm font-semibold text-cream-50">
                  35+ more
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-cream-100 px-4 py-3 text-sm text-forest-800">
                <IconArrowRight className="h-4 w-4 shrink-0 text-gold-500" />
                Don&apos;t see your plan? We likely still work with it — just ask.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
