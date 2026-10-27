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
 *
 *   8. CAMPAIGN PERSISTENCE — 2026-08-24, added with lib/attribution.ts. §2 now
 *      discloses that campaign parameters persist in local storage for 30 days
 *      and are re-added to the URL between pages. Two consequences worth a
 *      human's judgement, neither of which existed when (7) was written:
 *        a. Campaign parameters now appear in the URL on internal pages, so any
 *           tag in the GTM container that captures page URLs — Clarity's session
 *           recordings included — will capture them alongside the path. On this
 *           site a path can imply what someone is seeking treatment for, which
 *           is the combination (7c) is about. It is not a new disclosure of the
 *           path itself (every tag already receives that), but it does widen
 *           what is attached to it.
 *        b. `Referrer-Policy: strict-origin-when-cross-origin` means these
 *           parameters are NOT sent to external sites as a referrer. That
 *           mitigation is load-bearing — do not relax that header without
 *           revisiting this.
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

const LAST_UPDATED = 'October 27, 2026';
// Effective date of the Notice of Privacy Practices section (bump when its text changes).
const NPP_EFFECTIVE_DATE = 'October 27, 2026';

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
                <a href={site.phoneHref} suppressHydrationWarning>{site.phone}</a>.
              </p>

              <h2>2. Information collected automatically</h2>
              <p>
                When you submit a form or use the chat widget, our lead-capture
                provider records technical context alongside your submission: the
                page you submitted from, the page you first landed on, the
                referring website, your browser&rsquo;s user-agent string, and
                any campaign parameters (such as <code>utm_source</code> or{' '}
                <code>gclid</code>) present in the link you arrived through.
              </p>
              <p>
                So that this stays accurate if you read a few pages before
                getting in touch, those campaign parameters and the page you
                first arrived on are kept in your browser&rsquo;s local storage
                for up to <strong>30 days</strong>, and the campaign parameters
                are re-added to the address bar as you move between pages. This
                information stays on your device, contains nothing you typed, and
                is used only to record which outreach channel led you here.
                Clearing your browsing data removes it.
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
                are described in our{' '}
                <a href="#notice-of-privacy-practices">Notice of Privacy Practices</a>{' '}
                below, which is also provided at intake.
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
                to request a paper copy of the Notice of Privacy Practices below:
              </p>
              <ul>
                <li>
                  Phone: <a href={site.phoneHref} suppressHydrationWarning>{site.phone}</a>
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

              {/* ----------------------------------------------------------------
                  HIPAA Notice of Privacy Practices. Added 2026-10-27 after
                  LegitScript asked for a policy covering protected health
                  information, medical records and patient rights (Terms §V(e),
                  Certification Standard 10). Structure follows the HHS model:
                  https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/model-notices-privacy-practices/index.html
                  Counsel should confirm: Privacy Officer designation, Part 2
                  program status (header item 4), Texas Medical Records Privacy
                  Act specifics, and whether a mailing address is required for
                  rights requests (site.address is region-only).
              ---------------------------------------------------------------- */}
              <h2 id="notice-of-privacy-practices">Notice of Privacy Practices</h2>
              <p className="text-sm font-semibold uppercase tracking-wider text-forest-600">
                Effective {NPP_EFFECTIVE_DATE}
              </p>
              <p>
                <strong>
                  This notice describes how medical information about you may be
                  used and disclosed and how you can get access to this
                  information. Please review it carefully.
                </strong>
              </p>
              <p>
                {site.legalName}, doing business as {site.name}, is required by
                law to maintain the privacy and security of your protected health
                information (&ldquo;PHI&rdquo;), to give you this notice of our
                legal duties and privacy practices, and to follow the terms of the
                notice currently in effect. This notice applies to all records of
                your care that we create or maintain. Sections 1 to 12 above cover
                information collected through this website before you become a
                client.
              </p>

              <h2>Your rights</h2>
              <p>When it comes to your health information, you have certain rights.</p>
              <ul>
                <li>
                  <strong>Get a copy of your medical record.</strong> You can ask to
                  see or get an electronic or paper copy of your medical record and
                  other health information we have about you. We will provide a copy
                  or a summary, usually within 30 days of your request. We may charge
                  a reasonable, cost-based fee.
                </li>
                <li>
                  <strong>Ask us to correct your medical record.</strong> You can ask
                  us to correct health information about you that you think is
                  incorrect or incomplete. We may say &ldquo;no&rdquo; to your
                  request, but we will tell you why in writing within 60 days.
                </li>
                <li>
                  <strong>Request confidential communications.</strong> You can ask
                  us to contact you in a specific way (for example, home or office
                  phone) or to send mail to a different address. We will say
                  &ldquo;yes&rdquo; to all reasonable requests.
                </li>
                <li>
                  <strong>Ask us to limit what we use or share.</strong> You can ask
                  us not to use or share certain health information for treatment,
                  payment, or our operations. We are not required to agree, and we
                  may say &ldquo;no&rdquo; if it would affect your care. If you pay
                  for a service or item out of pocket in full, you can ask us not to
                  share that information for the purpose of payment or our
                  operations with your health insurer. We will say &ldquo;yes&rdquo;
                  unless a law requires us to share it.
                </li>
                <li>
                  <strong>Get a list of those with whom we have shared information.</strong>{' '}
                  You can ask for an accounting of the times we have shared your
                  health information for six years prior to the date you ask, who we
                  shared it with, and why. We will include all disclosures except
                  those about treatment, payment, and health care operations, and
                  certain other disclosures (such as any you asked us to make). We
                  will provide one accounting a year for free but will charge a
                  reasonable, cost-based fee if you ask for another within 12 months.
                </li>
                <li>
                  <strong>Get a copy of this privacy notice.</strong> You can ask for
                  a paper copy of this notice at any time, even if you have agreed to
                  receive it electronically.
                </li>
                <li>
                  <strong>Choose someone to act for you.</strong> If you have given
                  someone medical power of attorney or if someone is your legal
                  guardian, that person can exercise your rights and make choices
                  about your health information. We will confirm the person has this
                  authority before we take any action.
                </li>
                <li>
                  <strong>File a complaint if you feel your rights are violated.</strong>{' '}
                  You can complain to us using the contact information at the bottom
                  of this page. You can also file a complaint with the U.S.
                  Department of Health and Human Services Office for Civil Rights by
                  sending a letter to 200 Independence Avenue, S.W., Washington,
                  D.C. 20201, calling 1-800-368-1019, or visiting{' '}
                  <a
                    href="https://www.hhs.gov/ocr/privacy/hipaa/complaints/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.hhs.gov/ocr/privacy/hipaa/complaints/
                  </a>
                  . <strong>We will not retaliate against you for filing a complaint.</strong>
                </li>
              </ul>

              <h2>Your choices</h2>
              <p>
                For certain health information, you can tell us your choices about
                what we share. If you have a clear preference for how we share your
                information in the situations described below, talk to us. Tell us
                what you want us to do, and we will follow your instructions.
              </p>
              <p>In these cases, you have both the right and choice to tell us to:</p>
              <ul>
                <li>
                  Share information with your family, close friends, or others
                  involved in your care.
                </li>
                <li>Share information in a disaster relief situation.</li>
              </ul>
              <p>
                If you are not able to tell us your preference, for example if you
                are incapacitated, we may go ahead and share your information if we
                believe it is in your best interest. We may also share your
                information when needed to lessen a serious and imminent threat to
                health or safety.
              </p>
              <p>
                In these cases, we never share your information unless you give us
                written permission:
              </p>
              <ul>
                <li>Marketing purposes.</li>
                <li>Sale of your information.</li>
                <li>Most sharing of psychotherapy notes.</li>
              </ul>
              <p>
                We do not use your health information for fundraising. If that ever
                changes, we will tell you and you will be able to opt out.
              </p>

              <h2>Substance use disorder treatment records</h2>
              <p>
                Because we provide substance use disorder treatment, records that
                identify you as seeking or receiving such treatment are also
                protected by the federal confidentiality regulations at 42 C.F.R.
                Part 2. In general, we may not tell anyone outside our program that
                you attend the program, or disclose any information identifying you
                as having a substance use disorder, unless you consent in writing,
                the disclosure is allowed by a court order, or the disclosure is
                made to medical personnel in a medical emergency, to qualified
                personnel for research, audit, or program evaluation, or as
                otherwise permitted by Part 2. Violation of these federal
                regulations is a crime, and suspected violations may be reported to
                the appropriate authorities. Federal law and regulations do not
                protect any information about a crime committed by a patient at the
                program or against any person who works for the program, or about
                any threat to commit such a crime, and do not protect information
                about suspected child abuse or neglect from being reported under
                state law.
              </p>

              <h2>Our uses and disclosures</h2>
              <p>We typically use or share your health information in the following ways.</p>
              <ul>
                <li>
                  <strong>Treat you.</strong> We can use your health information and
                  share it with other professionals who are treating you.{' '}
                  <em>Example:</em> a physician treating you for a medical condition
                  asks our clinical team about your medications.
                </li>
                <li>
                  <strong>Run our organization.</strong> We can use and share your
                  health information to run our practice, improve your care, and
                  contact you when necessary. <em>Example:</em> we use health
                  information about you to manage your treatment and services.
                </li>
                <li>
                  <strong>Bill for your services.</strong> We can use and share your
                  health information to bill and get payment from health plans or
                  other entities. <em>Example:</em> we give information about you to
                  your health insurance plan so it will pay for your services.
                </li>
              </ul>
              <p>
                We are also allowed or required to share your information in other
                ways, usually in ways that contribute to the public good, such as
                public health and research. We have to meet many conditions in the
                law before we can share your information for these purposes. Where
                42 C.F.R. Part 2 applies, we will only make these disclosures as that
                regulation permits.
              </p>
              <ul>
                <li>
                  <strong>Help with public health and safety issues.</strong>{' '}
                  Preventing disease, helping with product recalls, reporting adverse
                  reactions to medications, reporting suspected abuse, neglect, or
                  domestic violence, and preventing or reducing a serious threat to
                  anyone&rsquo;s health or safety.
                </li>
                <li>
                  <strong>Do research.</strong> We can use or share your information
                  for health research, subject to the conditions required by law.
                </li>
                <li>
                  <strong>Comply with the law.</strong> We will share information
                  about you if state or federal laws require it, including with the
                  Department of Health and Human Services if it wants to see that we
                  are complying with federal privacy law.
                </li>
                <li>
                  <strong>Respond to organ and tissue donation requests</strong> and{' '}
                  <strong>work with a medical examiner or funeral director</strong>{' '}
                  when required.
                </li>
                <li>
                  <strong>
                    Address workers&rsquo; compensation, law enforcement, and other
                    government requests.
                  </strong>{' '}
                  For workers&rsquo; compensation claims, for law enforcement
                  purposes or with a law enforcement official, with health oversight
                  agencies for activities authorized by law, and for special
                  government functions such as military, national security, and
                  presidential protective services.
                </li>
                <li>
                  <strong>Respond to lawsuits and legal actions.</strong> In
                  response to a court or administrative order, or in response to a
                  subpoena, as permitted by law.
                </li>
              </ul>

              <h2>Our responsibilities</h2>
              <ul>
                <li>
                  We are required by law to maintain the privacy and security of
                  your protected health information.
                </li>
                <li>
                  We will let you know promptly if a breach occurs that may have
                  compromised the privacy or security of your information.
                </li>
                <li>
                  We must follow the duties and privacy practices described in this
                  notice and give you a copy of it.
                </li>
                <li>
                  We will not use or share your information other than as described
                  here unless you tell us we can in writing. If you tell us we can,
                  you may change your mind at any time. Let us know in writing if
                  you change your mind.
                </li>
              </ul>
              <p>
                For more information, see{' '}
                <a
                  href="https://www.hhs.gov/hipaa/for-individuals/notice-privacy-practices/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.hhs.gov/hipaa/for-individuals/notice-privacy-practices
                </a>
                .
              </p>

              <h2>Telehealth</h2>
              <p>
                We deliver care through secure telehealth. Sessions are conducted
                over encrypted video and audio connections, and we do not record
                sessions without your written consent. You are responsible for
                choosing a private location for your sessions; we are not able to
                control who may overhear or see your screen on your end.
              </p>

              <h2>State law</h2>
              <p>
                Texas law, including the Texas Medical Records Privacy Act, may give
                you additional protections for your medical information and may
                further restrict how we use or disclose information about mental
                health and substance use disorder treatment. Where state law is
                stricter than federal law, we follow the stricter requirement.
              </p>

              <h2>Changes to the terms of this notice</h2>
              <p>
                We can change the terms of this notice, and the changes will apply
                to all information we have about you. The new notice will be
                available upon request and on our website.
              </p>

              <h2>Contact our Privacy Officer</h2>
              <p>
                To exercise any of the rights above, to ask questions about this
                notice, or to file a complaint, contact our Privacy Officer:
              </p>
              <ul>
                <li>
                  Phone: <a href={site.phoneHref} suppressHydrationWarning>{site.phone}</a>
                </li>
                <li>
                  Email: <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
              </ul>
              <p>
                We respond to requests as promptly as we can, and within the
                timeframes required by applicable law.
              </p>

              <hr className="my-10 border-cream-300" />

              <p className="text-sm text-muted" suppressHydrationWarning>
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
