import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { site, clarion, parentOrg, analytics } from '@/lib/site';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Virtual OP for Addiction & Mental Health in Texas`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'Virtual OP Texas',
    'online addiction treatment Texas',
    'telehealth mental health Texas',
    'outpatient program',
    'dual diagnosis treatment',
    'online rehab Texas',
  ],
  alternates: { canonical: '/' },
  // NOTE: deliberately no `openGraph.url` here. Next.js merges openGraph
  // field-by-field with child routes, so a URL set at the layout level leaks
  // onto every page that doesn't override it — the exact cause of audit V0047.
  // Per-page OG/Twitter tags are built by `pageMetadata()` in lib/seo.ts.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: site.name,
    title: `${site.name} | Virtual OP for Addiction & Mental Health in Texas`,
    description: site.description,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} | Virtual OP in Texas`,
    description: site.description,
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#183024',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    areaServed: { '@type': 'State', name: 'Texas' },
    // Audit CR-18 — the machine-readable half of the parent relationship.
    parentOrganization: {
      '@type': 'Organization',
      name: parentOrg.name,
      url: parentOrg.url,
    },
    medicalSpecialty: ['Psychiatric', 'Addiction Medicine'],
    availableService: [
      { '@type': 'MedicalTherapy', name: 'Virtual Outpatient Program (OP)' },
      { '@type': 'MedicalTherapy', name: 'Online Dual Diagnosis Treatment' },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        {/* Google Tag Manager <noscript> fallback. GTM's own snippet puts this
            first in <body>; it needs `frame-src googletagmanager.com` in the CSP,
            which was previously 'none'. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${analytics.gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* Enables scroll-reveal animations only when JS is available, so
            content is always visible if JS is disabled or fails to run.
            Runs during parse (before content paints) to avoid any flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest-800 focus:px-5 focus:py-2 focus:text-cream-50"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />

        {/* Clarion Labs webchat widget (public site key — safe to ship) */}
        <Script
          src={clarion.widgetSrc}
          strategy="afterInteractive"
          data-site-key={clarion.siteKey}
          data-api={clarion.api}
        />
        {/* Clarion Labs form capture — hooks any <form data-clarion-form="…"> */}
        <Script
          src={clarion.formsCaptureSrc}
          strategy="afterInteractive"
          data-site-key={clarion.siteKey}
          data-api={clarion.api}
        />

        {/* ---------------------------------------------------------------
            Marketing / call tracking. Added 2026-08-11 at the owner's request.
            See the compliance note on `analytics` in lib/site.ts and ISSUES.md
            CR-22 — both of these set cookies, which contradicts three live
            statements in /privacy-policy that must be updated.
            --------------------------------------------------------------- */}

        {/* Google Tag Manager. Hand-rolled rather than pulling in
            @next/third-parties, to keep the runtime dependency count at 3.
            `afterInteractive` matches GTM's own guidance: it loads after
            hydration so it never competes with first paint. */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${analytics.gtmId}');`}
        </Script>

        {/* CallTrackingMetrics. Supplied as `//264810.tctm.co/t.js`; pinned to
            https in lib/site.ts.

            ⚠️ This script performs DYNAMIC NUMBER INSERTION — it rewrites phone
            numbers in the DOM at runtime, so the number a visitor sees and dials
            will not always be `site.phone`. That is the product working as
            intended, but it means the rendered number is no longer a reliable
            assertion: `tests/header-check.mjs` checks the server-rendered HTML,
            which CTM does not touch. If someone reports "the site shows a number
            we don't recognise", check the CTM pool before assuming a V0043-style
            regression. */}
        <Script src={analytics.callTrackingSrc} strategy="afterInteractive" async />
      </body>
    </html>
  );
}
