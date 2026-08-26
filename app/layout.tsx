import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { site, clarion, parentOrg, analytics } from '@/lib/site';
import { CAMPAIGN_BOOTSTRAP } from '@/lib/attribution';
import AttributionTracker from '@/components/AttributionTracker';
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

        {/* ── Attribution. THE ORDER OF THE NEXT TWO TAGS IS LOAD-BEARING ──
            The bootstrap restores a saved campaign into the query string, and it
            must run BEFORE t.js so CTM attributes a returning visitor to the
            click that first brought them here instead of logging a fresh direct
            visit. Both must also precede forms-capture.v1.js below, which reads
            utm/gclid out of location.search at submit time. See
            lib/attribution.ts for why the URL is the only route to those fields.

            It sits AFTER the `js`-class script above on purpose: that one has to
            run before anything parse-blocking, or content paints visible and is
            then hidden by the reveal styles — the flash its own comment guards
            against. */}
        <script dangerouslySetInnerHTML={{ __html: CAMPAIGN_BOOTSTRAP }} />

        {/* CallTrackingMetrics.
            ⚠️ MUST STAY `async`. Do not "fix" this to a synchronous tag, and do
            not follow the rollout spec's Section 2, which says to load t.js
            eagerly — that guidance is wrong and this comment is here because it
            was followed once already.

            Read the account's t.js: every number-scan entry point defaults its
            root to `document.body` and is guarded by a truthiness check, so it
            returns WITHOUT SCANNING when body is null —

                function e(t,e){ if(void 0===t&&(t=document.body), t){ ... } }

            and on top of that it does an eager "early start" pass the moment it
            executes if body already exists:

                if(_.ready(R), document.body && !E) C=!0,
                  0===e(l).length && (__ctm.log("wait early start found nothing"), ...)

            A synchronous tag therefore fails in one of two ways. In <head> body
            is null and the scan no-ops. Here at the top of <body> it is worse in
            a subtler way: body EXISTS but is nearly empty — Header, main and
            Footer have not been parsed — so the early-start pass runs against a
            DOM with no phone numbers in it and takes the "found nothing" branch.

            Second, independent failure on React: a sync tag rewrites numbers
            before hydration, then React reverts the swap and replaces the server
            HTML wholesale.

            Both fail SILENTLY. No error, no console warning, `__ctm.config.sid`
            still populates and the `__ctmid` cookie is still set — so every
            check short of counting the tracked numbers passes while no swap has
            happened. Every visitor sees the hardcoded number and CTM can only
            guess which web session an inbound call belongs to, so call
            attribution fails intermittently. The assertion that actually catches
            this is in tests/csp-check.mjs:

                Object.keys(window.__ctm_tracked_numbers).length > 0

            Position: kept at the top of <body> so the download starts early.
            `async` makes the position irrelevant for execution order, and the
            campaign bootstrap above still runs first regardless — an inline
            script executes at parse time, which no async script can precede.

            ⚠️ DYNAMIC NUMBER INSERTION: t.js rewrites phone numbers in the DOM
            at runtime, so the number a visitor sees is not always `site.phone`.
            `tests/header-check.mjs` asserts the server-rendered HTML, which CTM
            does not touch. If someone reports "the site shows a number we don't
            recognise", check the CTM number pool before assuming a V0043-style
            regression.

            ⚠️ EXACTLY ONE COPY. Count with
            `script[src*="tctm.co/t.js"]` — NOT `script[src*="tctm.co"]`, which
            returns 2 on a correct install because t.js injects its own p.js.
            Removing that "extra" breaks CTM. */}
        <script async src={analytics.callTrackingSrc} />

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
        {/* Restores the campaign after an App Router navigation, which rewrites
            the URL without re-running the inline bootstrap above. */}
        <AttributionTracker />
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

        {/* NOTE: CallTrackingMetrics is NOT loaded here. It was, as an
            `afterInteractive` <Script>, and it has moved to the top of <body> as
            an eager tag — see the block up there for why. Do not re-add it in
            this position: two copies double-count sessions and make the number
            swap unpredictable. */}
      </body>
    </html>
  );
}
