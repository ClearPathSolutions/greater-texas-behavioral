/**
 * Central site configuration — single source of truth for contact info,
 * navigation and shared metadata used across the app.
 */

export const site = {
  name: 'Greater Texas Behavioral',
  shortName: 'Greater Texas Behavioral',
  tagline: 'Structured Online Addiction & Mental Health Treatment — Statewide in Texas',
  description:
    'Greater Texas Behavioral offers a fully licensed Virtual Outpatient Program (OP) for addiction and mental health treatment, delivered through secure telehealth anywhere in Texas.',
  url: 'https://greatertexasbehavioral.com',
  email: 'info@greatertexasbehavioral.com',
  // The single published number for Greater Texas Behavioral.
  //
  // Audit V0043: a second number, (855) 416-5648, used to live here as an
  // "admissions hotline" inherited from the Seaside Wellness site this build was
  // cloned from. It was removed on 2026-08-04 after confirming it is Seaside's
  // OWN primary published line — it appears 6 times as a tel: link and 4 times
  // as visible text on seasidewellnesspb.com, while on the live Greater Texas
  // site it appeared exactly once, as a footer link whose digits were never
  // displayed. Do not reintroduce a second number without confirming with
  // admissions that it belongs to this facility.
  phone: '(877) 590-3665',
  phoneHref: 'tel:+18775903665',
  address: {
    region: 'Texas',
    country: 'United States',
  },
  copyrightHolder: 'Greater Texas Behavioral',
  /**
   * Legal / DBA entity name (facility registry FR-2, resolved 2026-08-11).
   *
   * The registry's company field, the master bios doc, the live portal bio and
   * the folder the official brand assets were delivered in all say "Greater
   * Texas Behavioral **Clinic**". The marketing name deliberately stays
   * "Greater Texas Behavioral" — a shorter trading name is normal, and "Clinic"
   * implies a physical place, which is the exact signal `/contact` withholds
   * because GTB is 100% telehealth (`address` below is region-only, and the
   * registry itself records `Address: Virtual`).
   *
   * THIS DIVERGENCE IS INTENTIONAL — do not "correct" `name` to match. It is
   * recorded here so the next reader does not treat it as drift, and so the
   * privacy policy's outstanding item 1 (legal entity) has a single source.
   * Still needs counsel sign-off, along with a mailing address if they require
   * one for privacy-rights requests.
   */
  legalName: 'Greater Texas Behavioral Clinic',
} as const;

/**
 * Parent organisation (audit CR-18 / V0091).
 *
 * The parent passes no authority to this site and this site had no user-visible
 * link back — the only reference to `quadranthealthgroup.com` anywhere in the
 * repo was the staff-feed API origin in `lib/staff.ts`. The reciprocal half
 * (getting GTB named and linked on the parent's /locations page) is V0090 and
 * is not fixable from here.
 */
export const parentOrg = {
  name: 'Quadrant Health Group',
  url: 'https://quadranthealthgroup.com',
} as const;

/**
 * Clarion Labs webchat / lead capture.
 * The cpx_ key is a PUBLIC site key (safe to ship). `CLARION_SITE_KEY` overrides
 * it if it is ever rotated, but note WHERE that override applies: the only
 * reader is `lib/clarion-blog.ts` (the server-side blog fetch). The browser
 * scripts and the lead route both take the shipped value from this file, so
 * setting the env var alone does NOT rotate the key for form capture.
 * NOTE: every production origin (apex + www + the .vercel.app alias, and any
 * custom domain) must be allowlisted in Clarion → Website Integrations.
 */
export const clarion = {
  siteKey: 'cpx_uP2v8Lehf_DtiZrt7m8Sl2DXgEYVYmit',
  api: 'https://api.clarionlabs.ai',
  widgetSrc: 'https://www.clarionlabs.ai/widget.v1.js',
  formsCaptureSrc: 'https://www.clarionlabs.ai/forms-capture.v1.js',
  // Audit CR-12: `blogEmbedSrc` (blog-embed.v1.js) was removed on 2026-08-11.
  // It belonged to the client-side blog embed, which was replaced by the
  // server-side fetch in lib/clarion-blog.ts (commit faadc68) because the
  // browser fetch is CORS-blocked. Do not re-add it — wiring it back up
  // reintroduces that failure. See lib/clarion-blog.ts.
} as const;

/**
 * Marketing / call-tracking tags. Added 2026-08-11 at the owner's request.
 *
 * ⚠️ COMPLIANCE PRECONDITION — READ BEFORE SHIPPING.
 * Both of these set cookies and send visitor data to third parties. Three live
 * statements on this site were true before they were added and are NOT true now:
 *
 *   1. `/privacy-policy` §2 describes only Clarion's attribution data, and the
 *      page was written from the verified fact that this site set NO cookies.
 *   2. §4 states "We do not use it for cross-context behavioural advertising or
 *      build advertising profiles from it."
 *   3. §9 states "We do not sell personal data or process it for targeted
 *      advertising, so there is nothing to opt out of on those grounds" — which
 *      is what removes the TDPSA opt-out obligation.
 *
 * Audit V0100 recorded this exact condition: "If marketing later adds ad-platform
 * pixels, that statement must change and a TDPSA opt-out mechanism must be added."
 * That has now happened. See ISSUES.md CR-22.
 *
 * Separately: this is a behavioural-health site. Page paths such as
 * `/what-we-treat#substance-use` combined with an IP address are the pattern HHS
 * OCR's guidance on online tracking technologies treats as a disclosure of health
 * information. Confirm with counsel which tags may fire, and whether Google and
 * CallTrackingMetrics are covered by BAAs, before enabling anything beyond
 * first-party call attribution.
 */
export const analytics = {
  /** Google Tag Manager container. Loads whatever tags are configured in the GTM UI. */
  gtmId: 'GTM-MTGTSPCG',
  /**
   * CallTrackingMetrics. Account-scoped host, so it is safe to allowlist in CSP.
   * Supplied as `//264810.tctm.co/t.js`; pinned to https here because a
   * protocol-relative URL inherits the page protocol and `upgrade-insecure-requests`
   * would rewrite it anyway.
   *
   * ⚠️ LOADED EAGERLY AND PARSE-BLOCKING by the root layout — deliberately NOT
   * `afterInteractive` like GTM below. t.js performs the dynamic number swap, so
   * any deferral leaves a window in which a visitor can read and dial the
   * un-swapped number. On a site whose primary CTA is a phone number that is a
   * lost call, which costs more than the render-blocking milliseconds. GTM is a
   * different case and correctly stays deferred: nothing it does is visible.
   *
   * ⚠️ EXACTLY ONE COPY. A second t.js double-counts sessions and makes the
   * number swap unpredictable. The usual cause is a CTM tag added inside the GTM
   * container ON TOP of the one in the template — so if call attribution starts
   * behaving oddly, check the container before changing anything here.
   * `tests/csp-check.mjs` asserts the tag count for this reason.
   */
  callTrackingSrc: 'https://264810.tctm.co/t.js',
  /**
   * CTM account id. Confirmed, not assumed: `greatertexasbehavioral.com` appears
   * by name in the routing rules inside this account's own t.js. A wrong account
   * files every lead against no visit and returns a clean 200 while doing it.
   *
   * Also used server-side: `__ctmid` encodes the account in characters 8-16, hex
   * (`6a88a9cc00040a6a4743909d` -> `00040a6a` -> 264810), which lets
   * app/api/lead/route.ts spot a cookie issued by a different CTM account —
   * perfectly shaped, and still attributing to nothing.
   */
  ctmAccountId: 264810,
  /**
   * The value t.js sets as `__ctm.config.host` and builds all its own requests
   * from (an XHR to /x.json, an appended /ctm-form-api.js, /p.js, an image
   * pixel). This is what the CSP has to allow on `script-src` and `connect-src`.
   */
  ctmHost: '264810.tctm.co',
} as const;

export type NavChild = { label: string; href: string; description?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

export const nav: NavItem[] = [
  {
    label: 'What We Treat',
    href: '/what-we-treat',
    children: [
      {
        label: 'Substance Use Disorders',
        href: '/what-we-treat#substance-use',
        description: 'Alcohol, opioids, stimulants & more',
      },
      {
        label: 'Mental Health Conditions',
        href: '/what-we-treat#mental-health',
        description: 'Anxiety, depression, trauma & mood',
      },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  // Added 2026-08-11 with the /faq page (audit V0099). "FAQ" is 3 characters,
  // which is why a 6th item fits where a longer one would not — verified with
  // `node tests/header-check.mjs`: one trigger row and no overflow at 1024,
  // 1100, 1152, 1280 and 1440px.
  { label: 'FAQ', href: '/faq' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  // ⚠️ THIS NAV IS AT ITS WIDTH LIMIT AT 1024px. Adding "Contact" as a 5th item
  // once wrapped "What We Treat" and "Verify Your Insurance" onto two lines, and
  // the fix was `whitespace-nowrap` plus removing a redundant item. Run
  // `node tests/header-check.mjs` after ANY change here — a long label will
  // break the `lg` breakpoint even though it looks fine on a wide monitor.
  //
  // NOTE: "Verify Your Insurance" is intentionally NOT listed. It is already a
  // prominent gold CTA button in both the desktop header and the mobile menu
  // panel, so listing it again duplicated the link — and the extra item is what
  // pushed the nav past its available width in the first place.
];

// Footer "Get Help" quick links
export const footerLinks: NavChild[] = [
  { label: 'About', href: '/about' },
  { label: 'Our Team', href: '/team' },
  { label: 'What We Treat', href: '/what-we-treat' },
  { label: 'Verify Your Insurance', href: '/verify-insurance' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

// Legal / compliance links, surfaced in the footer bottom bar.
export const legalLinks: NavChild[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
];

/**
 * Insurance carriers, rendered on the homepage (`InsuranceStrip`) and on
 * `/verify-insurance`.
 *
 * PRUNED 2026-08-11. This list was inherited verbatim from the Seaside Wellness
 * (Florida) site this build was cloned from — the same clone artifact as V0043's
 * phone number and V0134's Florida blog posts — and seven of the fifteen entries
 * could not be supported for a Texas-only provider:
 *
 *   Anthem            — does not write in Texas; the BCBS licensee here is
 *                       BCBSTX, an HCSC company (generic "Blue Cross Blue
 *                       Shield" is kept, since out-of-state BCBS plans do cover
 *                       Texas members through BlueCard).
 *   MVP Health Care   — New York / Vermont
 *   HealthPartners    — Minnesota / Wisconsin
 *   Horizon           — New Jersey (Horizon BCBSNJ)
 *   Medical Mutual    — Ohio
 *   Beacon            — defunct brand: Beacon Health Options became Carelon
 *   ValueOptions      — defunct brand: merged INTO Beacon in 2014, so the list
 *                       named the same dead entity twice
 *
 * ⚠️ The eight that remain are the ones that plainly operate in Texas — they are
 * NOT a verified payer list. Nothing was added, deliberately: naming a carrier
 * here is a payer-relationship claim, and inventing one is the defect this prune
 * was fixing. **Admissions should confirm the real contracted list before
 * launch** and add back anything genuine (Superior HealthPlan, Molina of Texas,
 * Carelon Behavioral Health and Magellan are the likely Texas candidates).
 */
export const insuranceCarriers: string[] = [
  'UnitedHealthcare',
  'Aetna',
  'Humana',
  'Blue Cross Blue Shield',
  'Cigna',
  'Ambetter',
  'TRICARE',
  'VA / Veterans Affairs',
];
