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
} as const;

/**
 * Clarion Labs webchat / lead capture.
 * The cpx_ key is a PUBLIC site key (safe to ship). The server route reads
 * process.env.CLARION_SITE_KEY first and falls back to this so the integration
 * works with zero env config; override via env if the key is ever rotated.
 * NOTE: every production origin (apex + www + the .vercel.app alias, and any
 * custom domain) must be allowlisted in Clarion → Website Integrations.
 */
export const clarion = {
  siteKey: 'cpx_uP2v8Lehf_DtiZrt7m8Sl2DXgEYVYmit',
  api: 'https://api.clarionlabs.ai',
  widgetSrc: 'https://www.clarionlabs.ai/widget.v1.js',
  formsCaptureSrc: 'https://www.clarionlabs.ai/forms-capture.v1.js',
  blogEmbedSrc: 'https://www.clarionlabs.ai/blog-embed.v1.js',
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
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  // NOTE: "Verify Your Insurance" is intentionally NOT listed here. It is
  // already a prominent gold CTA button in both the desktop header and the
  // mobile menu panel, so listing it again duplicated the link — and the extra
  // item pushed the desktop nav past its available width at exactly the `lg`
  // breakpoint (1024px), wrapping two labels onto two lines.
];

// Footer "Get Help" quick links
export const footerLinks: NavChild[] = [
  { label: 'About', href: '/about' },
  { label: 'What We Treat', href: '/what-we-treat' },
  { label: 'Verify Your Insurance', href: '/verify-insurance' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

// Legal / compliance links, surfaced in the footer bottom bar.
export const legalLinks: NavChild[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
];

// Insurance carriers referenced on the source site's insurance visual.
export const insuranceCarriers: string[] = [
  'UnitedHealthcare',
  'Aetna',
  'Humana',
  'Anthem',
  'Blue Cross Blue Shield',
  'Cigna',
  'Ambetter',
  'TRICARE',
  'MVP Health Care',
  'HealthPartners',
  'Beacon',
  'ValueOptions',
  'Horizon',
  'VA / Veterans Affairs',
  'Medical Mutual',
];
