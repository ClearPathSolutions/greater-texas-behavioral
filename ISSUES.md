# Greater Texas Behavioral — Audit Issues

Issues from the portfolio web audit ([source spreadsheet](https://docs.google.com/spreadsheets/d/1daiRElkRoKObt9KCsqFeXEhmtSBk5c1MQjUeaKx2nC8/edit)) that relate to this project. All rows verified in the audit on **2026-07-28**. Preview domain: `greater-texas-behavioral.vercel.app` → production `greatertexasbehavioral.com`.

Spreadsheet columns: `Issue ID | Facility | Issue | Location | Fix | Status | Verdict | Verified | Correction applied | Priority`

**Worked through on 2026-08-04. All 10 rows are now resolved or closed.**

## Priority summary

| ID | Priority | Status | Summary |
|----|----------|--------|---------|
| V0102 | **CRITICAL** | ✅ **RESOLVED** | Trailing-slash convention set to slash-canonical; canonicals + og:url aligned |
| V0100 | **COMPLIANCE** | ✅ **RESOLVED** (needs counsel review) | `/privacy-policy` built and linked in the footer |
| V0043 | **BLOCKED** → cleared | ✅ **RESOLVED** | Seaside's `855-416-5648` removed sitewide after evidence review |
| V0047 | Not triaged | ✅ **RESOLVED** | Per-page `og:url`, verified identical to canonical on all 7 routes |
| V0095 | Not triaged | 🔒 **CLOSED (by design)** | No aftercare page — poor fit for a virtual OP |
| V0096 | Not triaged | ✅ **RESOLVED — audit row was wrong** | `/verify-insurance` exists at the exact slug and renders |
| V0097 | Not triaged | ✅ **RESOLVED** | Renamed `/our-story` → `/about`, 301 from the old slug |
| V0098 | Not triaged | ✅ **RESOLVED** | `/contact` built, plus redirects from two portfolio variants |
| V0045 | LOW | 🔒 **CLOSED (by design)** | No child condition pages; hub has real content |
| V0044 | CLOSED | 🔒 **CLOSED (by design)** | 5-page stub intentional; privacy sub-point resolved under V0100 |

### Scope decision that unblocked V0095 / V0098 / V0045

GTB is a **virtual/telehealth provider**, not a facility. Confirmed 2026-08-04:

- **`/contact` — BUILD.** It is the portfolio standard (8 of 12 sites) and the single most
  expected page on any healthcare site; a visitor searching for it previously got nothing.
  Built deliberately lightweight so it does not expand GTB into a full facility site.
- **`/treatment/aftercare` — SKIP.** Does not map onto a virtual OP's service model.
- **Child condition pages — SKIP.** The audit already AMENDED V0045 to note the hub has real
  content. Revisit only if organic search for individual conditions justifies the content work.

---

## V0102 — Portfolio-wide trailing-slash mismatch — `CRITICAL` — ✅ RESOLVED
- **Facility:** ALL SITES
- **Issue:** All 12 previews serve the slashless form at 200 and 308-redirect the slash form; all 12 production sites are slash-canonical (301 on the slashless form). At cutover every inbound link using the production convention hits a redirect. Also causes the canonical-target redirects in V0018/V0067. Affects all 1,046 preview URLs — the single largest cutover issue in the audit by URL count.
- **Fix applied:** `trailingSlash: true` in `next.config.mjs` — **slash-canonical**, matching
  production and all 12 sites. Canonicals, `og:url` and every `sitemap.xml` entry now emit the
  trailing slash actually served, so no URL we publish redirects to itself.
- **Verified:** slashless forms 308 to the slash form (`/about` → `/about/`); `canonical` ==
  `og:url` on all 7 routes; all 13 sitemap URLs slash-terminated; internal `<Link>` hrefs render
  with slashes.
- **⚠️ Still needs:** ratification across the other 11 repos. The convention chosen here is the
  one that matches existing production behaviour, but it must be applied portfolio-wide to close
  the row globally.

## V0100 — Privacy policy missing — `COMPLIANCE` — ✅ RESOLVED (needs counsel review)
- **Facility:** ALL SITES (includes Greater Texas)
- **Issue:** Privacy policy: 1 site has NO privacy page at all (Greater Texas) — a compliance exposure on a YMYL healthcare site.
- **Escalation found while fixing:** the **live** WordPress site serves `/privacy-policy/` at
  **200**. This was therefore not just a gap — cutover would have *deleted* an existing
  compliance page. Built at the identical slug so the URL is preserved with no redirect.
- **Fix applied:** `app/privacy-policy/page.tsx`, linked in the footer bottom bar and from both
  intake forms, listed in `sitemap.xml` (indexable). Written from what the code actually does:
  the real form fields, the Clarion/Resend integrations, the attribution data
  `forms-capture.v1.js` sends, and the verified fact that the site sets **no cookies**. Covers the
  insurance member ID and free-text health context explicitly, plus HIPAA, 42 C.F.R. Part 2 for
  SUD records, and TDPSA rights for Texans.
- **⚠️ Still needs:** counsel/compliance sign-off. Six items only the business can confirm are
  listed in a header comment on the page — legal entity + mailing address, which vendors have
  BAAs, HIPAA scope for pre-intake inquiries, Part 2 applicability, retention periods, and the
  no-sale / no-targeted-advertising assertion.

## V0043 — Wrong facility phone number sitewide — `BLOCKED` → cleared — ✅ RESOLVED
- **Facility:** Greater Texas Behavioral
- **Issue:** Seaside Wellness's number `855-416-5648` appears on all 5 pages alongside Greater Texas's own `877-590-3665`.
- **Verdict:** CONFIRMED_AMENDED
- **Original correction:** PRIORITY BLOCKED — Confirm with admissions before removing a live tracked number. 1) Inherited, not introduced. 2) The fix may be unsafe — the number could be a live tracked line. **Do not remove without confirming with admissions.**

### Evidence gathered before acting (2026-08-04)

The block existed because the number *might* have been a live tracked line. That was tested
rather than assumed:

| Signal | Finding |
|---|---|
| Is it Seaside's own number? | **Yes.** `seasidewellnesspb.com` publishes it 6× as `tel:` and 4× as visible text on the homepage alone; same pattern on their contact page. It is their primary line. |
| How does it appear on live GTB? | **Once**, as `<a href="tel:+18554165648">Admissions hotline</a>` — the digits are **never displayed**. |
| Where exactly? | Inside the copied Elementor footer "Get Help" column, directly beside `/our-story`, `/what-we-treat` and `/insurance-verification` links — i.e. the Seaside site-clone footer, verbatim. |
| GTB's own number on live | 4× `tel:`, 3× displayed — used for the hero, header and all CTAs. |

A genuine tracked line is *displayed* so callers dial it. A hidden `tel:` link with no visible
digits receives close to zero calls, so the cost of removing it is negligible next to publishing a
competing facility's number on a healthcare site.

- **Decision (2026-08-04):** cleared to remove on the strength of the above.
- **Fix applied:** deleted `admissionsPhone` / `admissionsHref` from `lib/site.ts` and the
  "Admissions Hotline" list item from `components/Footer.tsx`. A comment in `lib/site.ts` records
  why, so the number is not reintroduced by someone reading the old Seaside markup.
- **Reachability preserved:** the footer's "Contact Us" column still shows
  `(877) 590-3665` prominently, so no user journey lost its endpoint.
- **Verified:** `855` / `8554165648` returns **0 matches** in the rendered HTML of all 7 routes,
  and 0 matches in `app/`, `components/`, `lib/` source (only the explanatory comment remains).
  `877-590-3665` still renders 10–16 times per page.
- **⚠️ Follow-up for admissions:** if `855-416-5648` *was* carrying tracked attribution for GTB,
  restoring it is a one-line change — but the correct fix would then be a GTB-owned tracking
  number, not Seaside's. Also cross-check `877-590-3665` against the Google Business Profile.

## V0047 — `og:url` misconfigured or missing — ✅ RESOLVED
- **Facility:** Greater Texas Behavioral
- **Issue:** `og:url` is misconfigured or missing on all 11 pages: 4 point at the domain root, 6 have no `og:url` element at all, 1 is the homepage.
- **Root cause found:** Next.js merges `openGraph` **field-by-field** with the parent layout, so
  the `openGraph.url` set once in `app/layout.tsx` leaked onto every page that did not override
  it. Every page was also inheriting the layout's `og:title` / `og:description`, so any share of
  any page rendered as the homepage — broader than the row described.
- **Fix applied:** removed `openGraph.url` from the layout and routed all routes through a new
  `pageMetadata()` helper (`lib/seo.ts`) that derives canonical, `og:url`, `og:title`,
  `og:description` and the Twitter card from one input, so they cannot drift apart again.
- **Verified:** `canonical` == `og:url` on `/`, `/about/`, `/what-we-treat/`,
  `/verify-insurance/`, `/contact/`, `/blog/`, `/privacy-policy/` and blog post pages.

## V0096 — No `/verify-insurance` page — ✅ RESOLVED (audit row was incorrect)
- **Facility:** ALL SITES (includes Greater Texas)
- **Issue:** Verify-insurance slug has 4 variants and is absent on 5 sites — including Greater Texas Behavioral.
- **Reconciled:** the row is **wrong** for GTB, as V0043 implied. `app/verify-insurance/page.tsx`
  exists, the slug is exactly `/verify-insurance`, it returns 200, renders `<h1>Verify your
  insurance</h1>`, and is in `sitemap.xml`. Nothing to build.
- **Also added:** `/insurance-verification` (the live WordPress slug) now 301s here, so the
  cutover doesn't 404.

## V0095 — No aftercare page — 🔒 CLOSED (by design)
- **Facility:** ALL SITES
- **Issue:** Aftercare slug has 6 variants across 9 sites. Three sites have NO aftercare page at all — Wellness NJ, QHG parent, and **Greater Texas**. So this is a rename across 9 plus a build decision for 3.
- **Decision (2026-08-04):** **skip by design.** A standalone aftercare page does not map onto a
  virtual OP's service model. Aftercare planning is already described as part of the program on
  `/` and `/about`. Consistent with V0044.
- **Action:** none in this repo. The rename across the other 9 sites is unaffected.

## V0097 — About slug (`/our-story` → `/about`) — ✅ RESOLVED
- **Facility:** ALL SITES
- **Issue:** `/about` is live on 9 sites. Only 3 genuinely need a rename — Dallas `/about-us`, Fort Worth `/about-us`, and **Greater Texas `/our-story`**.
- **Fix applied:** full rename, not an alias. `app/our-story/` → `app/about/` (via `git mv`, so
  history follows), metadata path and title updated to `About Us`, nav + footer + in-body links
  and `sitemap.xml` all repointed, and `/our-story` → `/about/` added as a **301**. The old slug
  is indexed on the live WordPress site, so that redirect is load-bearing at cutover.
- **Verified:** `/about/` 200; `/our-story/` 308 → `/about/` → 200; no `/our-story` references
  remain in `app/`, `components/` or `lib/`; the `app/our-story/` directory no longer exists.
- **Note:** the nav label changed from "Our Story" to "About" to match. Revert that one string in
  `lib/site.ts` if the brand voice is preferred — the slug is what the audit requires.

## V0098 — Contact page missing — ✅ RESOLVED
- **Facility:** ALL SITES
- **Issue:** Contact slug differs: `/contact` (8 sites), `/contact-us` (Dallas, Fort Worth), `/contact-location` (Marina Harbor), **absent on Greater Texas**.
- **Decision (2026-08-04):** **build it**, at the standard `/contact` slug.
- **Fix applied:** `app/contact/page.tsx` — four contact-method cards (phone, email, availability,
  service area), a short message form, a crisis-resources notice, and a closing CTA. Added to nav,
  footer and `sitemap.xml`. `/contact-us` and `/contact-location` 301 here so inbound links using
  the other portfolio variants resolve.
- **Deliberately shorter form than `/verify-insurance`:** name, phone, message. No insurance
  carrier and no member ID — someone asking a question should not have to hand over insurance
  details first.
- **No street address, by design:** GTB is 100% telehealth with no physical clinic
  (`site.address` is region-only). Publishing one would misrepresent the service and create a
  bogus local-SEO signal.
- **Verified:** `/contact/` 200, canonical == og:url, form delivers through the same verified path
  as the insurance form (see below), no layout overflow at 360/768/1440px.

## V0045 — "What We Treat" hub has no child pages — `LOW` — 🔒 CLOSED (by design)
- **Facility:** Greater Texas Behavioral
- **Issue:** "What We Treat" hub exists with no child condition pages.
- **Correction applied:** PRIORITY LOW — Downgraded; hub has real content, not empty. The word "empty" is wrong.
- **Decision (2026-08-04):** **leave as-is.** The hub covers substance use and mental health with
  real content and in-page anchors (`#substance-use`, `#mental-health`) that the nav dropdown
  links to. Splitting it into child pages is a content project, not a defect fix. Revisit only if
  organic demand for individual conditions justifies it.

## V0044 — 5-page stub — 🔒 CLOSED (by design)
- **Facility:** Greater Texas Behavioral
- **Issue:** Site is a 5-page stub. No treatment hub, no contact page, no admissions page, no tour, no privacy policy.
- **Correction applied:** PRIORITY CLOSED — By design: virtual provider, stub is inherited.
- **Current state:** now 7 pages — the privacy policy (V0100) and contact (V0098) sub-points were
  genuine gaps and have been closed. The remaining omissions (aftercare, condition children,
  facility tour) are confirmed intentional for a virtual provider.

---

## Verification

Every fix was confirmed against a local production build (`next build` + `next start`), not just
by inspection:

- `next build` clean — 20 routes; `next lint` clean; `tsc --noEmit` clean.
- **Routes:** `/`, `/about/`, `/what-we-treat/`, `/verify-insurance/`, `/contact/`, `/blog/`,
  `/privacy-policy/` all 200.
- **Redirects:** `/our-story/`, `/contact-us/`, `/contact-location/`, `/insurance-verification/`,
  `/privacy/` all 308 → correct slash-terminated target → 200.
- **Metadata:** `canonical` == `og:url` on all 7 routes plus blog posts.
- **Runtime:** zero console errors, zero 4xx/failed requests, one `<h1>` per page, no `<img>`
  missing `alt`, no cookies set, CSP breaks nothing (Clarion loads on every page).
- **Responsive:** no horizontal overflow at 360 / 768 / 1440px; desktop nav fits on one line at
  1024–1440px; mobile menu opens, traps focus, closes on Escape and restores focus to the toggle.
- **Lead delivery:** 8 Playwright scenarios (4 per form × insurance + contact) covering direct
  load, client-side navigation, Clarion 403, and script-blocked-with-no-email-relay. Each sends
  exactly one Clarion POST — never a duplicate — and no form ever claims success without
  confirmation.

Reusable check scripts live in `_scrape/` (git-ignored): `lead-verify.mjs`, `csp-check.mjs`,
`responsive-check.mjs`, `header-check.mjs`.

### Defects found and fixed while doing this work

Not audit rows — both were exposed by the changes above:

1. **Desktop nav wrapped at exactly 1024px.** Adding "Contact" as a 5th item pushed the nav past
   its available width at the `lg` breakpoint, wrapping "What We Treat" and "Verify Your
   Insurance" onto two lines. Fixed by adding `whitespace-nowrap` and removing the redundant
   "Verify Your Insurance" nav item — it is already a prominent gold CTA button in both the
   desktop header and the mobile menu panel, so it was a duplicate link.
2. **`/contact` overflowed the viewport at 360px.** The 31-character email address is a single
   unbreakable token, and CSS grid items default to `min-width: auto`, so the card's min-content
   widened the single-column track past the container. Fixed with `min-w-0` on the grid item
   (the `Reveal` wrapper, not the card inside it) plus `break-words` on the value.

### Related non-audit work on this branch

Found during a separate production review and fixed in the same branch:

- **Silent lead loss on the insurance form (P0).** The form showed "Thank you — we've got it"
  regardless of whether anything was sent; reaching it by in-site navigation produced zero network
  requests on submit. Now delivers through `lib/useLeadDelivery.ts` (shared by both forms) and
  only shows success on confirmation, with `/api/lead/` as a server-side fallback.
- **Security headers.** CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and
  `Permissions-Policy` added; previously only Vercel's HSTS was present.
- **Cutover redirect map** for the old WordPress URLs — see `next.config.mjs`.

### Outside this repo — still open

- **Live `robots.txt` points at another facility's sitemap:**
  `Sitemap: https://seasidewellnesspb.com/sitemap_index.xml`. Fix in WordPress/Yoast on WP Engine.
- **Staff bio contradicts the OP reclassification.** A published bio in the Quadrant support
  portal describes GTB as "an intensive outpatient program". It renders on `/about` via
  `StaffGrid`, so it contradicts the site copy live right now. Fix in the portal.
- **Rotate the Vercel API token** sitting in plaintext at `lib/.env` (git-ignored, uncommitted).
- **Set `RESEND_API_KEY` / `CONTACT_FROM` / `CONTACT_TO`** or the lead fallback can accept but not
  deliver.
- **Confirm the production origins are allowlisted** in Clarion → Website Integrations.

---

## Visual / rendering check — manual pass 2026-08-04

The audit workbook has 5 tabs. **Greater Texas Behavioral has zero rows in the "Visual Issues"
tab and zero in the "Broken Internal Links" tab.** That tab only covers 5 sites (Dallas, Laguna
View, Hillside, Quadrant parent, Des Moines) — GTB was **never visually QA'd** in the audit, so
"no rows" means *not reviewed*, not *reviewed and clean*. This manual pass fills that gap.

Checked against the **live preview** (`greater-texas-behavioral.vercel.app`), which is still the
**pre-deploy** build (see deploy note below). Markup-level only — not a pixel/responsive render.

**Clean:** every `<img>` has alt text; viewport meta present; favicon present; no `wp-content`
image dependencies; no broken/missing image sources; phone displays consistently as `(877) 590-3665`.

**Findings:**

- **VIS-1 (minor) — hotlinked external image on `/blog`** — ✅ **RESOLVED**
  - **CSP concern: ruled out.** The policy uses `img-src 'self' data: blob: https:`, which permits
    any HTTPS host. Verified in a real browser: the `images.unsplash.com` request returns **200**,
    the `<img>` decodes at 1200×800, and **zero** CSP violations are reported on `/blog/` or the
    post page. Nothing was being blocked.
  - **Source identified.** The URL is not in this repo — it is the `cover_image_url` of a single
    Clarion-managed post (`what-to-expect-first-30-days-of-treatment`). All 5 posts in
    `lib/original-posts.ts` already use local `/images/…` paths. Self-hosting it here would be
    overwritten by the CMS, so that is the wrong layer to fix it at.
  - **Real defect was the consistency half.** *Every* cover — local ones included — was rendered
    as a raw `<img>`, so the 5 local covers were skipping `next/image` entirely: no AVIF/WebP, no
    responsive `srcset`.
  - **Fix applied:** new `components/BlogCover.tsx`, used by both `/blog` and `/blog/[slug]`.
    Local paths go through `next/image`; remote CMS URLs stay a plain `<img>` **deliberately** —
    `next/image` throws at request time for any hostname absent from `images.remotePatterns`, so
    routing CMS-controlled URLs through it would 500 the blog the moment an editor picks a new
    host. An unoptimized image is a far better failure mode than a dead page. Also added
    `referrerPolicy="no-referrer"` so the article URL isn't leaked to third-party image hosts —
    the path alone is sensitive on a behavioural-health site.
  - **Verified:** all 5 local covers now serve via `/_next/image/?url=…`; the one remote cover
    remains a plain `<img>` and still loads.
  - **Remaining (out of repo, cosmetic):** ask whoever manages Clarion to re-upload that cover so
    it is served from Clarion's own CDN rather than hotlinked from Unsplash.

- **V0043 corroborated on the live build** — ✅ now **RESOLVED**, see the V0043 section above. The
  observation was exactly right: the digits shown were always `(877) 590-3665` while the footer's
  clickable link was `tel:+18554165648`. That mismatch is what confirmed it was a clone artifact
  rather than a published GTB line, and it has now been removed and verified at 0 occurrences.

- **False alarm:** `(555) 555-5555` on `/verify-insurance` is a form input `placeholder`
  attribute, not a displayed number — not a defect. Agreed, no action.

### Deploy gap — ✅ CLOSED (2026-08-04)
Was accurate when written: the work sat on the unmerged `changes-and-issues` branch, so
`greater-texas-behavioral.vercel.app` (which tracks `main`) still served the old build — `/about`,
`/contact` and `/privacy-policy` 404'd and `/our-story` returned 200.

The branch has since been merged to `main` and deployed. Branch previews could not be verified over
HTTP because Vercel **Deployment Protection** 302s every request to `vercel.com/sso-api`; the
production alias is public, so verification was done there after merge. See the Verification
section above for what was checked.
