/**
 * Central site configuration — single source of truth for contact info,
 * navigation and shared metadata used across the app.
 */

export const site = {
  name: 'Greater Texas Behavioral',
  shortName: 'Greater Texas Behavioral',
  tagline: 'Structured Online Addiction & Mental Health Treatment — Statewide in Texas',
  description:
    'Greater Texas Behavioral offers a fully licensed Virtual Intensive Outpatient Program (IOP) for addiction and mental health treatment, delivered through secure telehealth anywhere in Texas.',
  url: 'https://greatertexasbehavioral.com',
  email: 'info@greatertexasbehavioral.com',
  // Primary published number
  phone: '(877) 590-3665',
  phoneHref: 'tel:+18775903665',
  // Admissions hotline (from source site)
  admissionsPhone: '(855) 416-5648',
  admissionsHref: 'tel:+18554165648',
  address: {
    region: 'Texas',
    country: 'United States',
  },
  copyrightHolder: 'Greater Texas Behavioral',
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
  { label: 'Our Story', href: '/our-story' },
  { label: 'Blog', href: '/blog' },
  { label: 'Verify Your Insurance', href: '/verify-insurance' },
];

// Footer "Get Help" quick links
export const footerLinks: NavChild[] = [
  { label: 'Our Story', href: '/our-story' },
  { label: 'What We Treat', href: '/what-we-treat' },
  { label: 'Verify Your Insurance', href: '/verify-insurance' },
  { label: 'Blog', href: '/blog' },
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
