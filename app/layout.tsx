import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
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
    default: `${site.name} | Virtual IOP for Addiction & Mental Health in Texas`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'Virtual IOP Texas',
    'online addiction treatment Texas',
    'telehealth mental health Texas',
    'intensive outpatient program',
    'dual diagnosis treatment',
    'online rehab Texas',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Virtual IOP for Addiction & Mental Health in Texas`,
    description: site.description,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} | Virtual IOP in Texas`,
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
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    areaServed: { '@type': 'State', name: 'Texas' },
    medicalSpecialty: ['Psychiatric', 'Addiction Medicine'],
    availableService: [
      { '@type': 'MedicalTherapy', name: 'Virtual Intensive Outpatient Program (IOP)' },
      { '@type': 'MedicalTherapy', name: 'Online Dual Diagnosis Treatment' },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
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
      </body>
    </html>
  );
}
