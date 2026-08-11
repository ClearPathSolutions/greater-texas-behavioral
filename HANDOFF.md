# Greater Texas Behavioral — execution handoff

**Paste this whole file into a fresh Claude Code session started in
`/Users/benjamincastro/Greater Texas Behavioral`.** It is the execution plan; `ISSUES.md` in this
repo is the evidence. Read `ISSUES.md` before acting — every task below has a section there with
file:line references, how it was verified, and why the fix is what it is.

---

## Your job

Work the backlog in `ISSUES.md` (91 open tasks, IDs `CR-01`–`CR-21`, `FR-1`–`FR-3`, `V0xxx`,
`CO-1`–`CO-7`) in the wave order below. Code tasks you do. Non-code tasks you cannot do — surface
them clearly and stop, don't fake them.

**Ask before starting: has FR-1 been answered?** It gates roughly a third of the content work
(see Wave 1).

---

## Project facts

- Next.js 14.2.15, App Router, TypeScript strict, Tailwind. **3 runtime deps** (next, react,
  react-dom). Deployed on Vercel. Production: `https://greatertexasbehavioral.com` (still the old
  WordPress site — this repo has **not** cut over yet).
- 21 routes, 87 KB shared first-load JS. Only 4 client components: `Header`, `VerifyForm`,
  `ContactForm`, `Reveal`. Everything else is a server component.
- **Zero tests in the repo.** Playwright is a devDependency; the only test scripts live in
  git-ignored `_scrape/` (that's `CR-05`).
- Config that matters: `next.config.mjs` (redirects, CSP, `trailingSlash: true`), `lib/site.ts`
  (all contact info, nav), `lib/seo.ts` (`pageMetadata()` — every route's metadata funnels through
  it), `lib/staff.ts` (support-portal staff feed), `lib/clarion-blog.ts` (CMS blog).

### Commands

```bash
npx tsc --noEmit          # must stay clean
npx next lint             # must stay clean
npx next build            # must stay clean
npx next start -p 3111    # verify against http://127.0.0.1:3111
npm test                  # tracked verification suite (CR-05), needs the server above
```

Verify against a local production build or live production.

**CORRECTED 2026-08-11.** This section previously said the Vercel preview is behind Deployment
Protection and "you cannot check it over HTTP." That is true of **branch previews** only. The
**production alias** `greater-texas-behavioral.vercel.app` is **public and returns 200** — its
`robots.txt`, rendered pages and metadata are all checkable with plain `curl`. As written the
warning removed a verification channel that works, including the only way to check CR-02's live
staff-bio text without a local build. `ISSUES.md:1442-1444` had it right.

⚠️ Two build-time gotchas that will waste your time otherwise:

- **`/robots.txt` and `/sitemap.xml` are static**, so `VERCEL_ENV` and the sitemap dates are baked
  at `next build`. Setting an env var on `next start` changes nothing.
- **Kill any old server before re-testing.** `pkill -f "next start"` does not match the real
  process name (`next-server`). A stale server keeps port 3111, the new one dies with
  `EADDRINUSE`, and you get a screen of bogus MIME/400 failures from mismatched chunk hashes.
  Use `kill $(lsof -ti:3111)`.

---

## LANDMINES — read before touching code

Each of these is a real failure someone already paid for. Re-breaking them is the main risk.

1. **`issues.md` and `ISSUES.md` are the same file.** The filesystem is case-insensitive
   (verified). Writing `issues.md` destroys a 1,445-line audit record. Never create the lowercase
   variant.
2. **Never `npm audit fix --force`** — it resolves to `next@16`, a two-major break. Patch within
   the 14 line only.
3. **Do not add `data-clarion-form` to either form.** Clarion's `forms-capture.v1.js` scans once at
   load; the forms call `window.ClarionForms.submit()` explicitly instead. Adding the attribute
   double-submits and creates duplicate leads. See the header comment in `lib/useLeadDelivery.ts`.
4. **Do not "simplify" `lib/useLeadDelivery.ts` or `app/api/lead/route.ts`.** Treating
   `delivered: false` as failure is deliberate — a form must never claim success without
   confirmation. This is the most safety-critical code in the repo.
5. **Do not route `BlogCover` remote URLs through `next/image`.** `next/image` throws at request
   time for any host absent from `remotePatterns`, so a CMS editor picking a new host would 500 the
   blog. Unoptimized beats dead. (Staff photos are different — bounded host — see `CR-20`.)
6. **`trailingSlash: true`.** Every redirect `destination` must end in `/` or you cause a double
   hop. `canonicalPath()` in `lib/seo.ts` handles this for metadata.
7. **Never reintroduce `855-416-5648`.** It is Seaside Wellness's number (confirmed three
   independent ways). A comment in `lib/site.ts` records why.
8. **Keep `whitespace-nowrap` on the desktop nav links** (`components/Header.tsx`) — without it the
   nav wraps at exactly 1024px.
9. **Keep `min-w-0` on the `/contact` grid items** (the `Reveal` wrapper, not the card) — without it
   the 31-char email overflows the viewport at 360px.
10. **`_scrape/` is git-ignored and vercel-ignored.** Don't rely on anything in it shipping.

---

## Already verified clean — do not re-litigate

Confirmed 2026-08-11 against a real build. If you change something here, re-verify it; otherwise
skip.

- `tsc --noEmit`, `next lint`, `next build` all clean.
- All 9 routes 200; unknown slug 404. All 7 legacy redirects 308, single hop, slash-terminated.
- `canonical` == `og:url` on all 8 static routes. Exactly one `<h1>` per route; titles unique.
- 5 security headers present; **no** `Set-Cookie`; no `X-Powered-By`.
- `/api/lead/`: GET → 405, empty POST → 422.
- Deliberate design decisions, already closed — don't "fix" them: no aftercare page, no child
  condition pages, no street address (100% telehealth), `BlogCover`'s plain `<img>` for remote
  covers, the per-instance rate limiter in the lead route.

---

## WAVE 0 — commit first (do this before anything else)

`ISSUES.md` has ~1,100 lines of uncommitted analysis. One `git checkout` loses it.

```bash
git checkout -b audit/backlog-2026-08
git add ISSUES.md HANDOFF.md
git commit   # message: "Record full audit backlog: code review, audit workbook, bios, registry, headshots"
```

---

## WAVE 1 — blockers. Get answers from the human before coding.

These are not yours to decide. Ask, then stop on anything unanswered.

| ID | Question |
|---|---|
| **FR-1** | **Is GTB licensed and staffed to treat substance use disorders, or mental health only?** The facility registry marks `MH` only with `SUD` blank, but the site is saturated with it: `detox` ×71, `addiction` ×45, `substance use` ×27, plus `medicalSpecialty: ['Psychiatric', 'Addiction Medicine']` in the JSON-LD at `app/layout.tsx:79` and all 5 blog posts. If SUD is out of scope, `site.description`, the hero, `/what-we-treat#substance-use`, the insurance copy and `lib/original-posts.ts` all need rewriting. **Do not start content work until this is answered.** |
| **FR-2** | **Is the legal/DBA name "Greater Texas Behavioral Clinic"?** Four of five sources say "Clinic" (facility registry, master bios doc, live portal bio, and the brand-asset folder name); only `lib/site.ts` omits it. This also unblocks the privacy policy's outstanding item 1. |
| **CR-01** | **Rotate the Vercel API token** at `lib/.env` (a `vcp_…` token, plaintext, never committed but sitting in the source tree). Then delete the file — nothing reads it. 2 minutes, P0. |
| **CR-03** | **Testimonials are fabricated but framed as real** ("Real recovery", 5-star ratings, city attributions). FR-3 established there is **no Google Business Profile**, so there is no review pipeline to swap in — Option B (replace the section with truthful non-testimonial content) is the realistic path. Needs a decision on which. |
| **CR-19c** | **Does GTB have a Clinical/Medical Director?** None appears in the registry, the bios doc, or the headshot folder. The published team is 1 therapist + 2 case managers, on a site claiming a licensed OP treating dual diagnosis. |

---

## WAVE 2 — safe code fixes. No decisions needed. Do all of these.

Order is roughly cheapest-first. Run the full verify suite after the batch.

### CR-16 — `/insurance` is unmapped and will 404 at cutover
Production 301s `/insurance` → `/insurance-verification/`. We map the latter but not the former.
In `next.config.mjs` `redirects()`:
```js
{ source: '/insurance', destination: '/verify-insurance/', permanent: true },
```

### CR-15 — six indexed taxonomy/author URLs unmapped
All return 200 on production and appear in its sitemap: `/category/blog/`, `/tag/dry-january/`,
`/tag/addiction-recovery/`, `/tag/detox/`, `/tag/drug-detox/`, `/author/qhd-dev/`. Use path params
so tags added before cutover are covered too:
```js
{ source: '/category/:slug', destination: '/blog/', permanent: true },
{ source: '/tag/:slug',      destination: '/blog/', permanent: true },
{ source: '/author/:slug',   destination: '/blog/', permanent: true },
```

### CR-17 — production `/feed/` returns 200, the build has no feed
Either add `app/feed.xml/route.ts` generating from `getAllBlogPosts()`, or redirect
`/feed` → `/blog/`. Pick one; the redirect is fine for a 5-post blog.

### CR-04 — mobile menu + resize permanently locks page scroll
**Confirmed repro:** open the menu at 820px, resize to 1180px → `body.style.overflow` stays
`hidden`, panel and toggle are both `lg:hidden` so there is no UI to recover, and scrolling is dead
until reload. Happens on iPad rotation. In `components/Header.tsx` (the scroll-lock effect is at
~L42-47), add a `matchMedia('(min-width: 1024px)')` listener that calls `setOpen(false)` when it
matches. Keep the existing cleanup that restores `overflow`.

### CR-06 — bump Next within the 14 line
```bash
npm i next@14.2.35 eslint-config-next@14.2.35
```
Clears most of the 8 advisories `npm audit` reports. None looked exploitable here (no middleware,
no i18n, no Server Actions, no rewrites) — `ISSUES.md` has the per-advisory table. **Not `--force`.**

### CR-12 — dead config
`lib/site.ts:46` — `blogEmbedSrc` is never referenced (the server-side `lib/clarion-blog.ts`
replaced it). Remove it; leave a one-line comment pointing at that file, matching how `site.ts`
already records the removed `admissionsPhone`.

### CR-11 — 3.6 MB of unreferenced assets ship in the deploy
Delete: `public/images/blog-sea-turtle.jpg`, `blog-palm.jpg` (both Florida/Seaside leftovers),
`tx-stockyards.jpg`, `friends-sunset.jpg`, `horse-stable.jpg`, `insurance-carriers.png`,
`public/logos/logo-full.png`. **But check `CR-21` first** — `logo-full.png` may want replacing with
a correctly-sized official export rather than deleting.

### CR-13 — sitemap reports everything as changed every build
`app/sitemap.ts:28` uses `new Date()` as `lastModified` for all 8 static routes. Give them a real
date (per-route constant, or git mtime at build). Blog entries already use `published_at` correctly.

### CR-08 / CR-10 — copy overclaims
- `app/verify-insurance/page.tsx:118` — "We work with **all** major insurance carriers" → "most
  major PPO plans", matching `site.description`, the hero badge, `InsuranceStrip`, and that page's
  own lead paragraph. Verify `grep -rn "all major" app components lib` returns nothing.
- `app/what-we-treat/page.tsx:165` — eyebrow "The best in virtual treatment" → something factual.
- `35+ more` chips (`verify-insurance:136`, `InsuranceStrip.tsx:54`) — substantiate or soften.

### Verify Wave 2
```bash
npx tsc --noEmit && npx next lint && npx next build && npx next start -p 3111
```
Then confirm: all 9 routes still 200; the 3 new redirect groups 308 → `/blog/` → 200 in a single
hop; `/insurance` → 308 → `/verify-insurance/` → 200; `canonical == og:url` unchanged on all 8
routes; the CR-04 repro now ends with `overflow: ''` and a scrollable page.

---

## WAVE 3 — code fixes with one small judgement each

### CR-20 — staff photos bypass `next/image`
`components/StaffGrid.tsx:62` and `app/team/page.tsx:51` render plain `<img>` at 96px/112px, and
`next.config.mjs` has **no `remotePatterns`**. The three real headshots total **2,999 KB**; at
256×256 they are **46 KB**. Safe to fix here (unlike `BlogCover`) because the host is single and
fixed — `support.quadranthealthgroup.com`, overridable only via `STAFF_FEED_ORIGIN`. Add it to
`images.remotePatterns`, switch both call sites to `next/image` with explicit `width`/`height`, and
drop the two `no-img-element` disables. Preferred belt-and-braces: also have the portal resize on
upload.

### CR-21 — official brand assets exist and aren't being used
`~/Downloads/Greater Texas Behavioral Clinic/GTB Logo/` has 5 official files, none matching
`public/logos/`. Two issues: (a) `LogoLight` (`components/Logo.tsx:48-55`) **hand-sets the wordmark**
as two `<span>`s instead of using a brand asset — two white RGBA variants now exist, so use
`greater-tx-behavioral-white.png` (downscale first; 3182 px for a 44 px badge repeats CR-20's
mistake); (b) the header's `logo-horizontal.png` is 2.5:1 while every official PNG is ~1.09:1, so
confirm it's approved. Watch for layout shift from the changed ratio.

### CR-18 — no link between this site and the parent
Only reference to `quadranthealthgroup.com` in the repo is the staff-feed `fetch` in `lib/staff.ts`.
Add a footer "Part of Quadrant Health Group" link, and consider `parentOrganization` in the
`MedicalBusiness` JSON-LD in `app/layout.tsx`.

### CR-05 — the safety-critical tests aren't in version control
Move `_scrape/lead-verify.mjs`, `csp-check.mjs`, `responsive-check.mjs`, `header-check.mjs`,
`img-csp.mjs` into a tracked `tests/`. Parameterise `BASE` via env (default
`http://127.0.0.1:3111`). **Keep the Clarion endpoint mocked** — the current script mocks it, which
is why running it never creates real leads; preserve that and say so in a comment. Add
`"test:e2e"` npm script. Add the CR-04 repro as a case.

### CR-07 — unsanitized CMS HTML
`app/blog/[slug]/page.tsx:94` renders Clarion `body_html` via `dangerouslySetInnerHTML`, and the CSP
includes `script-src 'unsafe-inline'`, so `<img onerror=…>` would execute (React blocks `<script>`
insertion but not event handlers). **First ask: who can publish to Clarion?** If anyone beyond the
owner, sanitize server-side (strip `on*`, `javascript:`). Longer term the nonce-based CSP sketched
in `next.config.mjs`'s comment removes `'unsafe-inline'` entirely — but it needs `middleware.ts` and
makes every route dynamic, which is why it was deferred.

---

## WAVE 4 — not code. Report, don't attempt.

You cannot do these. List them for the human with the `ISSUES.md` section reference.

| ID | Owner | Action |
|---|---|---|
| **CR-02 + CR-19a** | Portal editor + doc owner | Emma Fyffe's bio says *"Greater Texas Behavioral **Clinic**, an **intensive outpatient program**"* — live on `/about` and `/team` now. **Fix in BOTH the support portal and the master bios doc line 844**, or a re-sync reintroduces it. The IOP→OP half is unconditional (registry `LOC` = `Virtual OP`); the "Clinic" half waits on FR-2. |
| **CR-19b** | Portal editor | Upload the 3 headshots — they already exist. Web-ready 256px versions are at `~/Downloads/Staff Headshots/Texas/Virtual Staff/web-ready-256/` (52 KB total). Nothing needs photographing. |
| **V0090 / V0091 / VIS-2 / VIS-3** | Parent site | `quadranthealthgroup.com/locations/` names GTB **zero** times, links **zero** facility domains, and `/locations/greater-texas-behavioral/` 404s. A "location" page is the wrong format for a telehealth provider — a virtual/statewide service entry fits better. |
| **V0134** | WordPress | Two Florida/Seaside posts are **live at 200 on the Texas domain today** with Seaside's phone number, one duplicated at the same slug on `seasidewellnesspb.com`. This repo already 301s them, but only at cutover. Recommend keeping the `/blog/` destination rather than V0134's suggestion of pointing at Seaside (don't hand equity to another domain). |
| **CR-09** | Business | "Many clients pay little to nothing" — substantiate or soften to the coverage-dependent phrasing already used on `/verify-insurance`. |
| **CR-14** | Business | Blog's newest post is 2026-02-23. Decide if it's an active channel. |
| **CO-1** | Ben | Set `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` in Vercel or the lead fallback accepts but cannot deliver. |
| **CO-2** | Ben | Allowlist every production origin in Clarion → Website Integrations. |
| **CO-3** | Ben | Live WordPress `robots.txt` points at `seasidewellnesspb.com/sitemap_index.xml`. |
| **CO-4** | Counsel | Privacy policy needs sign-off on the 6 items in its page header comment. |
| **CO-5** | Business | Verify Shutterstock licensing on photos carried from the old site. |
| **V0124** | Ben | Re-run the cutover content diff immediately before launch. GTB was clear on 2026-08-11 (newest production content 2026-03-27) but it goes stale by definition. |

---

## Cutover checklist (before DNS switch)

The redirect map is **13 URLs**, not the 4 the audit claims:

- `/insurance-verification/` → `/verify-insurance/` ✅ already mapped
- `/our-story/` → `/about/` ✅
- 3 root blog posts → `/blog/<slug>/` ✅
- 2 retired Florida posts → `/blog/` ✅
- `/insurance` → `/verify-insurance/` ⬜ CR-16
- `/category/*`, `/tag/*`, `/author/*` → `/blog/` ⬜ CR-15 (6 known URLs)
- `/feed` ⬜ CR-17

Then: re-pull `greatertexasbehavioral.com/sitemap_index.xml` and diff against build routes (V0124);
re-check for new tags (CR-15); confirm the 5 `?kadence_element=` junk URLs are excluded from the
WordPress sitemap; remove or rename the `qhd-dev` author archive (it publishes an internal dev
account name in an indexed `<title>`).

---

## Reporting back

When you finish a wave, report: what changed, the verify output, what you skipped and why. Don't
mark a task done without running its verification. Update the `- [ ]` checkboxes in `ISSUES.md` as
you go and commit alongside the code — the file is the record, keep it true.
