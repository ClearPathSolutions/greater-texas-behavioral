# Greater Texas Behavioral

A modern, mobile-first marketing website for **Greater Texas Behavioral** — a licensed
Virtual Intensive Outpatient Program (IOP) delivering addiction and mental health
treatment via secure telehealth across Texas.

Built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**, and
optimized for deployment on **Vercel**.

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
```

---

## Deploying to Vercel

1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket).
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset is auto-detected as **Next.js** — no configuration needed.
4. (Optional) Add the environment variables below to enable form email delivery.
5. Deploy. Add your custom domain `greatertexasbehavioral.com` under
   **Project → Settings → Domains**.

### Environment variables (optional — for the insurance/contact form)

The form works out of the box (submissions are validated and logged), but to actually
receive lead emails, connect [Resend](https://resend.com) and set:

| Variable         | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `RESEND_API_KEY` | Your Resend API key                                                    |
| `CONTACT_FROM`   | Verified sender, e.g. `Greater Texas Behavioral <admissions@greatertexasbehavioral.com>` |
| `CONTACT_TO`     | Where inquiries are delivered (defaults to `info@greatertexasbehavioral.com`) |

See `.env.example`.

---

## Project structure

```
app/
  layout.tsx            Root layout: fonts, metadata, JSON-LD, Header/Footer
  page.tsx              Home
  our-story/            Our Story
  what-we-treat/        What We Treat (#substance-use, #mental-health anchors)
  verify-insurance/     Insurance verification + lead form
  blog/                 Blog index + [slug] article template (starts empty)
  api/contact/          Form submission handler (Resend)
  sitemap.ts, robots.ts, not-found.tsx
  globals.css           Design system (tokens, components, utilities)
components/
  Header.tsx            Sticky, mobile-optimized nav with dropdown + slide-down menu
  Footer.tsx, Logo.tsx, PageHero.tsx, CTABand.tsx
  InsuranceStrip.tsx, Testimonials.tsx, VerifyForm.tsx
  ui/Icon.tsx           Inline SVG icon set
  ui/Reveal.tsx         Scroll-reveal wrapper (progressive enhancement)
lib/
  site.ts               Contact info, navigation, insurance carriers (edit here)
  blog.ts               Blog posts data source (add articles here)
public/
  images/               Optimized photography
  logos/                Brand logos
  og-image.jpg          Social share image
tailwind.config.ts      Brand colors, fonts, shadows
```

---

## Editing common things

- **Phone / email / nav links:** `lib/site.ts`
- **Brand colors & fonts:** `tailwind.config.ts` + `app/globals.css`
- **Add a blog article:** append to the `posts` array in `lib/blog.ts` (see the
  documented example at the top of that file). The blog UI and article template are
  already built; the section shows a polished "coming soon" state while empty.
- **Testimonials:** `components/Testimonials.tsx` — replace the representative quotes
  with your real, consented client reviews before launch (see the note in that file).

---

## Notes on this rebuild

- All content, imagery, logos, and the favicon were carried over from the previous
  live site. Photography was re-optimized (resized, compressed) and served through
  `next/image` (AVIF/WebP, responsive sizes).
- Insurance carriers are rendered as accessible text chips rather than a baked-in image,
  so they stay crisp and readable at every screen size.
- The blog's previous articles were written for a former Florida brand
  ("Seaside Wellness," West Palm Beach) and were intentionally **not** carried over.
  They remain available in `_scrape/` for reference. Add new Texas-focused articles via
  `lib/blog.ts`.
- Layout uses full-bleed section backgrounds with a centered `max-w-content` (1200px)
  column, so backgrounds reach the screen edges (no side "dead space") while text stays
  comfortably measured on large displays.

---

## Working source archive

The `_scrape/` directory (git-ignored) contains the raw scraped HTML, extracted text
content, and original full-resolution image downloads from the previous site, kept for
reference. It is not part of the deployed app and can be deleted at any time.
