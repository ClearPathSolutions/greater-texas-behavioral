# Greater Texas Behavioral

A modern, mobile-first marketing website for **Greater Texas Behavioral** — a licensed
Virtual Outpatient Program (OP) delivering addiction and mental health treatment via
secure telehealth across Texas.

Built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**, and
optimized for deployment on **Vercel**. Three runtime dependencies (`next`, `react`,
`react-dom`) — keeping that number small is deliberate.

> **This repo has not cut over yet.** `greatertexasbehavioral.com` is still the old
> WordPress site on WP Engine; this build serves at the Vercel production alias. See
> `HANDOFF.md` for the cutover checklist and `ISSUES.md` for the open backlog.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm test           # verification suite (needs a running server — see below)
npm run test:unit  # sanitizer unit test only (no server needed)
```

### Running the verification suite

The checks in `tests/` hit a **running server**, and default to
`http://127.0.0.1:3111`:

```bash
npm run build
npx next start -p 3111 &
npm test
```

Override the target with `BASE=https://… npm test`. Branch previews are behind Vercel
Deployment Protection and 302 to `vercel.com/sso-api`, so they can't be checked over
HTTP; the production alias is public and works. See `tests/README.md`.

`tests/lead-verify.mjs` **mocks Clarion**, so running it never creates a real lead.

---

## Deploying to Vercel

1. Push to a Git repository.
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset auto-detects as **Next.js** — no configuration needed.
4. Add the environment variables below.
5. Deploy, then add `greatertexasbehavioral.com` under **Project → Settings → Domains**.

### Environment variables

Nothing here is required to build or render, but **`RESEND_*` should be set before
launch** or the lead fallback accepts submissions it cannot deliver. See `.env.example`.

| Variable            | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `RESEND_API_KEY`    | Resend key — enables the `/api/lead/` email fallback                    |
| `CONTACT_FROM`      | Verified Resend sender                                                  |
| `CONTACT_TO`        | Where inquiries land (defaults to `site.email`)                          |
| `CLARION_SITE_KEY`  | Optional override of the public Clarion key shipped in `lib/site.ts`     |
| `CLARION_API`       | Optional override of the Clarion API base                               |
| `STAFF_FEED_ORIGIN` | Optional override of the Quadrant support-portal origin                 |

Indexing is gated on `VERCEL_ENV === 'production'` (`app/robots.ts`), so previews and
the pre-cutover alias return `Disallow: /`.

---

## Project structure

```
app/
  layout.tsx            Root layout: fonts, metadata, JSON-LD, Header/Footer, Clarion
  page.tsx              Home
  about/                About Us  (renamed from /our-story, which 301s here)
  team/                 Full team page, bios from the support portal
  what-we-treat/        What We Treat (#substance-use, #mental-health anchors)
  verify-insurance/     Insurance verification + lead form
  contact/              Contact methods + short message form
  privacy-policy/       Privacy policy
  blog/                 Blog index + [slug] article template
  api/lead/             Lead fallback handler (Resend) — POST only
  sitemap.ts, robots.ts, not-found.tsx
  globals.css           Design system (tokens, components, utilities)
components/
  Header.tsx            Sticky nav, dropdown + mobile dialog (focus trap, Escape)
  Footer.tsx, Logo.tsx, PageHero.tsx, CTABand.tsx
  InsuranceStrip.tsx, VerifyForm.tsx, ContactForm.tsx
  StaffGrid.tsx         Team teaser, fed by the support portal
  BlogCover.tsx         Local covers via next/image; remote CMS covers stay <img>
  ui/Icon.tsx           Inline SVG icon set
  ui/Reveal.tsx         Scroll-reveal wrapper (progressive enhancement)
lib/
  site.ts               Contact info, nav, carriers, parent org (EDIT HERE)
  seo.ts                pageMetadata() — every route's metadata funnels through it
  staff.ts              Support-portal staff feed
  clarion-blog.ts       Server-side Clarion CMS blog fetch + merge
  original-posts.ts     Five locally-authored posts, merged with the CMS feed
  useLeadDelivery.ts    Shared lead-delivery hook for both forms
  sanitize-html.ts      Allowlist sanitizer for CMS article HTML
tests/                  Verification suite (see tests/README.md)
public/                 Photography, logos, og-image.jpg
tailwind.config.ts      Brand colors, fonts, shadows
next.config.mjs         Cutover redirects, CSP + security headers, trailingSlash
```

---

## Editing common things

- **Phone / email / nav / carriers / parent org:** `lib/site.ts`
- **Brand colors & fonts:** `tailwind.config.ts` + `app/globals.css`
- **Page metadata:** always via `pageMetadata()` in `lib/seo.ts` — never set
  `openGraph` on a page directly. Next merges `openGraph` field-by-field with the
  layout, which is what made every page advertise the homepage (audit V0047).
- **Blog articles:** publish through Clarion; they appear within `revalidate: 300`.
  The five local posts live in `lib/original-posts.ts`, and a Clarion post with the
  same slug takes precedence.
- **Sitemap dates:** bump a route's `updated` in `app/sitemap.ts` when you change that
  page's content.

---

## Things that look wrong but are deliberate

Documented so they don't get "fixed." Each is the result of a real failure — the full
reasoning is in `ISSUES.md`.

- **`lib/useLeadDelivery.ts` calls `ClarionForms.submit()` explicitly** instead of
  relying on Clarion's auto-capture, which scans for forms once at script load and so
  missed every lead submitted after a client-side navigation. Forms must **not** carry
  a `data-clarion-form` attribute — that double-submits.
- **`delivered: false` counts as failure.** A form must never claim success without
  confirmation; the UI shows the phone number instead.
- **`BlogCover` keeps remote CMS covers on a plain `<img>`.** `next/image` throws at
  request time for any host absent from `remotePatterns`, so routing editor-controlled
  URLs through it would 500 the blog. Staff photos *are* optimized — that host is
  bounded (audit CR-20).
- **`trailingSlash: true`**, matching production. Redirect destinations must end in `/`.
- **No street address**, no aftercare page, no child condition pages — all closed by
  design for a telehealth provider.
- **`whitespace-nowrap` on desktop nav links** (wraps at 1024px without it) and
  **`min-w-0` on the `/contact` grid items** (overflows at 360px without it).
- **The site name omits "Clinic"** while the legal entity includes it — see
  `site.legalName`. Intentional; don't "correct" it.

---

## Working source archive

`_scrape/` (git-ignored) holds the raw scraped HTML, extracted text, and original
full-resolution downloads from the previous site. Not part of the deployed app. The
verification scripts that used to live there are now tracked in `tests/`.
