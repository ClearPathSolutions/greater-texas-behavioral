/**
 * Privacy policy (audit V0100).
 *
 * Slug note: the live WordPress site serves `/privacy-policy/` at 200. Building
 * this page at the same slug means the cutover preserves that URL exactly
 * instead of 404'ing an existing compliance page.
 *
 * ---------------------------------------------------------------------------
 * BEFORE LAUNCH — items only the business can confirm. Every statement below
 * was written from what the codebase actually does (form fields in
 * VerifyForm.tsx, the Clarion + Resend integrations, the support-portal staff
 * feed). These points are NOT verifiable from code and must be checked by
 * counsel or the compliance owner:
 *
 *   1. LEGAL ENTITY + MAILING ADDRESS. Privacy-rights requests normally need a
 *      postal address. This site carries none (virtual provider, `site.address`
 *      is region-only), so the contact section uses phone + email. Add the
 *      registered entity name and address if counsel requires it.
 *   2. BUSINESS ASSOCIATE AGREEMENTS. This page says vendors are "bound by
 *      contract" — it deliberately does NOT claim a signed BAA exists with
 *      Clarion Labs, Vercel or Resend. Confirm which vendors have BAAs and
 *      tighten or soften §5 accordingly.
 *   3. HIPAA SCOPE. §6 draws the standard line between marketing-site
 *      submissions and PHI created once care begins. Confirm this matches how
 *      admissions actually handles pre-intake inquiries.
 *   4. 42 CFR PART 2. Referenced in §6 because this is an SUD provider. Confirm
 *      Part 2 applicability and that the Notice of Privacy Practices exists and
 *      is obtainable at the contact points listed in §11.
 *   5. RETENTION PERIODS. §8 is intentionally qualitative. Insert real periods
 *      once the records-retention schedule is settled.
 *   6. SELLING / TARGETED ADVERTISING. §9 asserts we do not sell personal data
 *      or use it for cross-context behavioural advertising. If marketing later
 *      adds ad-platform pixels, that statement must change and a TDPSA opt-out
 *      mechanism must be added.
 *
 *   ⚠️ 7. THE CONDITION IN (6) HAS NOW TRIGGERED — 2026-08-11. Google Tag
 *      Manager (GTM-MTGTSPCG) and CallTrackingMetrics were added to the site, and
 *      the GTM container already carries Microsoft Clarity (session recording).
 *      §2 now discloses them and §4/§9 have been narrowed to stay truthful, but
 *      THREE THINGS STILL NEED A HUMAN:
 *        a. Confirm the full tag inventory in the GTM UI. This page can only
 *           describe what was observed loading; anything added in GTM later
 *           changes what is true here and nothing in this repo will notice.
 *        b. If any tag does targeted advertising, TDPSA requires a real opt-out
 *           mechanism — a sentence in a policy is not one.
 *        c. HHS OCR guidance on online tracking treats page paths plus IP on a
 *           health site as a disclosure of health information. Confirm whether
 *           Google, Microsoft and CallTrackingMetrics are covered by BAAs, or
 *           restrict tags on /verify-insurance, /contact and /what-we-treat.
 *      See ISSUES.md CR-22.
 * ---------------------------------------------------------------------------
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CTABand from '@/components/CTABand';
import Reveal from '@/components/ui/Reveal';
import { site } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How Greater Texas Behavioral collects, uses, protects, and shares the information you provide through this website, including insurance and health-related details.',
  path: 'privacy-policy',
});

const LAST_UPDATED = 'August 11, 2026';

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="What we collect through this website, why we collect it, and the choices you have. Written to be read — not to be skimmed past."
        image="/images/wheat-field-hope.jpg"
        imageAlt="Open field at sunrise"
      />

      <section className="section bg-cream-50">
        <div className="container-narrow">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-forest-600">
              Last updated {LAST_UPDATED}
            </p>

            <div className="prose-tx mt-8">
              <p className="lead">
                {site.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                &ldquo;our&rdquo;) provides a licensed Virtual Outpatient Program
                for addiction and mental health treatment to residents of Texas.
                This policy explains how we handle information collected through{' '}
                {site.url.replace('https://', '')}. Because reaching out for
                treatment is a sensitive act, we try to collect as little as
                possible and to be specific about where it goes.
              </p>

              <h2>1. Information you give us directly</h2>
              <p>
                Our insurance verification form asks for your{' '}
                <strong>name</strong> and <strong>phone number</strong> (both
                required), and optionally your <strong>email address</strong>,{' '}
                <strong>insurance provider</strong>,{' '}
                <strong>insurance member ID</strong>, and any message you choose
                to write in the &ldquo;How can we help?&rdquo; field. If you use
                the chat widget, we receive the contents of that conversation.
              </p>
              <p>
                You are never required to describe your medical history, your
                diagnosis, or your substance use to contact us. Please share only
                what you are comfortable sharing in a web form — anything more
                sensitive is better discussed on the phone with an admissions
                specialist at{' '}
                <a href={site.phoneHref}>{site.phone}</a>.
              </p>

              <h2>2. Information collected automatically</h2>
              <p>
                When you submit the form or use the chat widget, our lead-capture
                provider records technical context alongside your submission: the
                page you submitted from, the page you first landed on, the
                referring website, your browser&rsquo;s user-agent string, and
                any campaign parameters (such as <code>utm_source</code> or{' '}
                <code>gclid</code>) present in the link you arrived through. A
                small amount of that attribution data is stored in your
                browser&rsquo;s session storage and is cleared when you close the
                tab.
              </p>
              <p>
                Our hosting provider also processes standard server request data,
                including IP address, for security, abuse prevention, and
                reliability purposes.
              </p>
              <p>
                <strong>
                  Analytics, advertising and call-measurement tools.
                </strong>{' '}
                We use a tag-management tool to load measurement scripts on this
                site. These currently include website analytics, a product that
                records how visitors interact with pages (such as clicks,
                scrolling and mouse movement, with the contents of form fields
                masked), and a call-measurement service that attributes phone
                calls to the marketing that produced them. To do this they{' '}
                <strong>set cookies in your browser</strong> and receive technical
                information including the pages you view, your approximate
                location derived from IP address, your device and browser, and the
                referring site or campaign.
              </p>
              <p>
                The call-measurement service may also display a different phone
                number to different visitors so that calls can be attributed to a
                campaign. Calls to those numbers reach our admissions team as
                normal and may be recorded or logged for quality and attribution
                purposes.
              </p>
              <p>
                You can limit this using your browser&rsquo;s cookie controls, a
                tracking-protection or ad-blocking extension, or your
                device&rsquo;s global privacy control. Blocking them does not
                affect your ability to use this site, submit a form, or call us.
              </p>

              <h2>3. How we use your information</h2>
              <ul>
                <li>
                  To respond to you — by phone, text, or email — about the
                  treatment you asked about.
                </li>
                <li>
                  To verify your insurance benefits with your health plan on your
                  behalf, when you ask us to.
                </li>
                <li>
                  To explain coverage, expected out-of-pocket costs, and
                  appropriate next steps for care.
                </li>
                <li>
                  To operate, secure, and improve this website, and to understand
                  which outreach channels help people find treatment.
                </li>
                <li>
                  To meet our legal, regulatory, and professional obligations as
                  a licensed treatment provider.
                </li>
              </ul>
              <p>
                We do not use the information you submit here to make automated
                decisions about your care, and we do not use it for any purpose
                unrelated to helping you access treatment.
              </p>

              <h2>4. What we do not do</h2>
              <ul>
                <li>
                  <strong>We do not sell your personal information.</strong>
                </li>
                <li>
                  We do not share it with other treatment facilities, lead
                  brokers, or marketing aggregators.
                </li>
                <li>
                  We do not use the information you type into our forms &mdash;
                  your name, contact details, insurance details, or anything you
                  write in a message &mdash; for advertising, and we do not build
                  advertising profiles from it. The measurement tools described in
                  §2 do collect browsing data through cookies; see that section
                  for what they receive and how to limit it.
                </li>
                <li>
                  We do not disclose that you contacted us to family, employers,
                  or anyone else without your authorization, except where the law
                  requires or permits it.
                </li>
              </ul>

              <h2>5. Service providers</h2>
              <p>
                We use a small number of vendors to run this website and route
                your inquiry to our admissions team. They may process your
                information only to provide their service to us, are bound by
                contract, and may not use it for their own purposes:
              </p>
              <ul>
                <li>
                  <strong>Website hosting and delivery</strong> — serves these
                  pages and processes server request logs.
                </li>
                <li>
                  <strong>Lead capture and web chat</strong> — receives your form
                  submission and chat messages and makes them available to our
                  admissions team.
                </li>
                <li>
                  <strong>Email delivery</strong> — used as a backup channel to
                  deliver your inquiry to our admissions inbox if the primary
                  system is unavailable, so that a request for help is not lost.
                </li>
              </ul>
              <p>
                We may also disclose information when required by law, subpoena,
                or court order; to protect the safety of any person; or in
                connection with a business transfer, subject to the protections
                described here.
              </p>

              <h2>6. Health information, HIPAA, and Part 2</h2>
              <p>
                Information you send through this website before you become a
                client is used for admissions and benefit-verification purposes.
                We treat it as confidential regardless of its formal legal
                classification.
              </p>
              <p>
                Once you begin care with us, the protected health information
                created and maintained in the course of your treatment is
                governed by the Health Insurance Portability and Accountability
                Act (HIPAA) and, for substance use disorder treatment records, by
                the federal confidentiality regulations at 42 C.F.R. Part 2 —
                which are stricter than HIPAA and generally require your written
                consent before your records may be disclosed. Those protections
                are described in our Notice of Privacy Practices, which is
                provided at intake and is available on request using the contact
                details in §11.
              </p>
              <p>
                Please note that ordinary email and web forms are not encrypted
                end-to-end. Do not use them to send detailed clinical
                information.
              </p>

              <h2>7. Security</h2>
              <p>
                This site is served exclusively over HTTPS, and submissions are
                transmitted over encrypted connections. We limit the fields we
                ask for, restrict internal access to inquiries to the admissions
                staff who need them, and deliberately keep sensitive values —
                such as your insurance member ID and anything you write in the
                message field — out of our application logs.
              </p>
              <p>
                No method of transmission or storage is perfectly secure, and we
                cannot guarantee absolute security. If you believe your
                information has been compromised, contact us immediately.
              </p>

              <h2>8. How long we keep it</h2>
              <p>
                If you contact us and do not begin treatment, we retain your
                inquiry only as long as needed to follow up with you, to meet our
                legal and regulatory obligations, and to resolve disputes. If you
                do begin treatment, your clinical records are retained according
                to Texas law and applicable professional record-retention
                requirements. You may ask us to delete an inquiry that did not
                result in treatment.
              </p>

              <h2>9. Your rights and choices</h2>
              <p>
                Under the Texas Data Privacy and Security Act, Texas residents
                may ask us to confirm whether we process their personal data,
                obtain a copy of it, correct inaccuracies, or delete it, and may
                appeal a decision we make about such a request. We do not sell the
                personal information you submit through our forms. Texas residents
                also have the right to opt out of processing for targeted
                advertising and of any sharing that counts as a &ldquo;sale&rdquo;
                under the Act; to exercise that right in relation to the
                measurement and advertising cookies described in §2, contact us
                using the details in §11 and we will honour it &mdash; and you can
                block those cookies in your browser at any time. Depending on
                where you live, you may have similar rights under other state
                laws.
              </p>
              <p>
                You can also, at any time:
              </p>
              <ul>
                <li>
                  Ask us to stop contacting you — by replying to any message,
                  or by telling the person who calls you.
                </li>
                <li>
                  Reply <strong>STOP</strong> to any text message to end text
                  contact.
                </li>
                <li>
                  Use the unsubscribe link in any marketing email we send.
                </li>
              </ul>
              <p>
                Rights over clinical records held under HIPAA and 42 C.F.R. Part
                2 — including the right to access, amend, and restrict
                disclosure — are described in our Notice of Privacy Practices and
                are separate from the website rights above.
              </p>
              <p>
                We will not discriminate against you, or refuse or degrade your
                care, for exercising any of these rights.
              </p>

              <h2>10. Children&rsquo;s privacy</h2>
              <p>
                Our services are intended for adults. This website is not
                directed to children under 13, and we do not knowingly collect
                their personal information. If you believe a child has submitted
                information to us, contact us and we will delete it.
              </p>

              <h2>11. Contact us</h2>
              <p>
                For any privacy question, to exercise a right described above, or
                to request our Notice of Privacy Practices:
              </p>
              <ul>
                <li>
                  Phone: <a href={site.phoneHref}>{site.phone}</a>
                </li>
                <li>
                  Email: <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
              </ul>
              <p>
                We respond to privacy requests as promptly as we can, and within
                the timeframes required by applicable law.
              </p>

              <h2>12. Changes to this policy</h2>
              <p>
                If we change how we handle your information, we will update this
                page and revise the &ldquo;last updated&rdquo; date above.
                Material changes will be made clear rather than buried.
              </p>

              <hr className="my-10 border-cream-300" />

              <p className="text-sm text-muted">
                If you are in immediate danger, call 911. For free, confidential
                support 24/7, call or text the 988 Suicide &amp; Crisis Lifeline,
                or reach the SAMHSA National Helpline at 1-800-662-4357. See also{' '}
                <Link href="/what-we-treat/">what we treat</Link> and{' '}
                <Link href="/verify-insurance/">insurance verification</Link>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand
        eyebrow="Questions about your privacy?"
        title="Talk to a real person, confidentially"
        body="Our admissions team can answer questions about what we collect and how your information is protected — before you share anything."
        image="/images/tx-bluebonnet-field.jpg"
      />
    </>
  );
}
