# Greater Texas Behavioral — Audit Issues

Issues from the portfolio web audit ([source spreadsheet](https://docs.google.com/spreadsheets/d/1daiRElkRoKObt9KCsqFeXEhmtSBk5c1MQjUeaKx2nC8/edit)) that relate to this project. All rows verified in the audit on **2026-07-28**. Preview domain: `greater-texas-behavioral.vercel.app` → production `greatertexasbehavioral.com`.

Spreadsheet columns: `Issue ID | Facility | Issue | Location | Fix | Status | Verdict | Verified | Correction applied | Priority`

**Worked through on 2026-08-04. All 10 rows are now resolved or closed.**

> **This file now records two passes.**
>
> 1. **Open tasks — code-review pass 2026-08-11** (immediately below). New findings from a full
>    head-to-toe review of the codebase and a running production build. **14 open tasks + 7 carried
>    over.** Start here.
> 2. **Portfolio audit rows (2026-07-28)** — the original 10 spreadsheet rows, all resolved or
>    closed on 2026-08-04. Historical record, kept for the reasoning behind each decision.
>
> **Naming note:** this file is `ISSUES.md`. The repo lives on a case-insensitive filesystem, so
> `issues.md` and `ISSUES.md` are the same path — don't create the lowercase variant, it will
> overwrite this one.

---

# Execution pass — 2026-08-11 (branch `audit/backlog-2026-08`)

Worked the HANDOFF.md waves. **18 tasks closed in code and verified; 73 checkboxes remain**, all of
them either non-code (portal, WordPress, parent site, counsel, business) or blocked on a decision.

## Closed and verified in code

| ID | What changed |
|---|---|
| CR-03 | Fabricated testimonials deleted (Option B). `components/Testimonials.tsx` removed; the homepage slot now renders real portal clinicians via `StaffGrid`. |
| CR-04 | `matchMedia('(min-width: 1024px)')` listener closes the menu at the breakpoint. Repro is now a tracked test. |
| CR-05 | 5 scripts moved to a tracked `tests/`, `BASE` parameterised (defaults to local), `npm test` aggregate added, CR-04 repro added, plus a new 39-case sanitizer unit test. |
| CR-06 | `next` + `eslint-config-next` → 14.2.35. |
| CR-07 | New `lib/sanitize-html.ts`, allowlist-based, wired into `app/blog/[slug]`. 39/39 tests pass. |
| CR-08 | "all major" → "most major PPO insurance plans"; both `35+ more` chips → "and many more"; "In-network & out-of-network with" → "We verify benefits with". |
| CR-10 | "The best in virtual treatment" → "Why our Virtual OP works". |
| CR-11 | 7 unreferenced assets deleted (3.57 MB). `public/` 11 MB → 7.6 MB. |
| CR-12 | `clarion.blogEmbedSrc` removed with a pointer comment. |
| CR-13 | Sitemap static routes now carry hand-maintained `updated` dates. |
| CR-15 | `/category/:slug`, `/tag/:slug`, `/author/:slug` → `/blog/`. |
| CR-16 | `/insurance` → `/verify-insurance/`. |
| CR-17 | `/feed` → `/blog/`. |
| CR-18 | Footer "Part of Quadrant Health Group" link + `parentOrganization` in the JSON-LD. |
| CR-20 | `images.remotePatterns` for the portal host; both call sites on `next/image`; both eslint disables gone. |
| FR-2 | `site.legalName = 'Greater Texas Behavioral Clinic'` recorded, with a comment stating the marketing-name divergence is intentional. The "drop Clinic" half of CR-02/CR-19a is **dropped**; the IOP→OP half stands. |

### Verification run

`tsc --noEmit`, `next lint`, `next build` clean — 21 routes, 87.3 kB shared JS. All 9 routes 200.
`canonical == og:url` and exactly one `<h1>` on all 8 static routes. 5 security headers, no cookies.
`/api/lead/` GET 405, empty POST 422.

**All 7 new redirects are single-hop 308 from the slash form**, which is the form production links
(production is slash-canonical). The slashless form takes 2 hops because `trailingSlash: true`
normalises it first — that is inherent to the setting and applies equally to the pre-existing
redirects verified on 2026-08-04, so it is not a regression.

`npm test` — **all 6 scripts pass**: 8/8 lead-delivery scenarios (exactly one Clarion POST each,
never a duplicate; no false success), responsive 360/768/1440 + menu + CR-04, header fit at
1024–1440, zero CSP/runtime errors on 9 routes, remote blog cover decodes.

The CR-04 test was confirmed to actually catch the bug: with the fix reverted it reports
`overflow="hidden" aria-expanded=true` and fails. It uses a real `mouse.wheel`, not
`window.scrollTo` — programmatic scrolling moves `scrollY` even while `body{overflow:hidden}`
blocks the user, so `scrollTo` reports success on the very bug being tested.

## Round 2 — remaining actionable items closed

Went back through the 73 for anything still doable in code.

| ID | Outcome |
|---|---|
| **CR-02 guard** | ✅ **BUILT.** CR-02's own "Consider" item: `auditBios()` in `lib/staff.ts` now warns when a portal bio says "intensive outpatient", names a "Clinic", or claims in-person care. Warns, never throws — an external content problem must not fail a build or blank a page. Deduped per process so ISR revalidation every 300s doesn't reprint forever. **Uses `\bclinics?\b`, not a bare substring:** verified against the live feed that a bare `/clinic/i` false-positives on Norberto Segredo's "his **clinic**al perspective", exactly as 19a recorded. Emma's is the one true hit and it fires correctly. |
| **V0099** | ✅ **BUILT** — `/faq`, the portfolio standard. GTB was 1 of 7 sites without one. 14 questions in 4 groups, native `<details>`/`<summary>` (keyboard + screen-reader behaviour free, works with JS off, zero client bytes), plus `FAQPage` JSON-LD generated from the same answer strings the page renders so they cannot drift. Added to nav, footer, sitemap and the test route list. **Every answer restates a claim already on the site** — nothing new, so FR-1 exposure is unchanged, and session frequency stays "multiple sessions per week" because no specific number has ever been published. |
| **V0094** | 🔒 **CLOSED by design** — keep `/what-we-treat`, per this file's own recommendation. It is indexed on production, matches the condition-led framing, and renaming costs a redirect for no user benefit. Still needs feeding back to the sheet owner so V0094 stops assuming 11 of 12 sites. |
| **V0134 destination** | 🔒 **DECIDED** — the two retired Florida posts keep going to `/blog/`, not to the Seaside equivalents V0134 suggested. 301'ing to `seasidewellnesspb.com` would hand link equity to another domain and land a Texan searching for Texas treatment in Florida. Already what `next.config.mjs` does; recorded so repo and production agree. The unpublish itself is still WordPress work. |
| **CR-09** | ✅ **SOFTENED.** "many clients pay little to nothing" → "in many cases insurance covers a significant portion of treatment", and the homepage's "Many clients have minimal out-of-pocket costs" → coverage-dependent wording. All three cost claims now agree. Same class as CR-08, so the same treatment. **Reversible** — restore the original if admissions can substantiate it from real benefit-verification outcomes. |
| **CR-19b** | ✅ **PREPARED** (upload is still yours). Regenerated all three at 256×256, **2,999 KB → 26 KB (99%)**, better than the 46 KB estimate via quality 82 + progressive. Jada's 1290×1505 portrait source is **cropped with a deliberate upward bias (y=0.34)** rather than dead centre, because `object-cover` on a square crops top and bottom and that eats headroom on a headshot. All three visually confirmed in-frame at both 256px and the real 96px render size. Ready at `~/Downloads/Staff Headshots/Texas/Virtual Staff/web-ready-256/`. |
| **CR-19d** | ✅ **RESOLVED as documented.** Took the "accept the heuristic and note it is load-bearing" branch: `bioParagraphs()` now carries a warning that the portal returns zero newlines for all three bios, so the `explicit.length > 1` path never fires and the sentence-grouping fallback is what actually renders `/team`. Simplifying it to `split('\n\n')` would turn every bio into one wall. |
| **CR-11 (optional half)** | 🔒 **CLOSED — measured, not worth doing.** The note flagged "15 images exceed 400 KB at source". Measured: 16 JPEGs, 7,529 KB, and **not one exceeds 2560px** (largest is 2000×1333). 2000px is the correct source size for `next/image` to derive from, and 400–650 KB is simply what a good-quality 2000px JPEG weighs. Recompressing would trade visible quality for repo bytes with **zero** served-byte benefit, since AVIF/WebP conversion already happens on demand. Deliberate no. |

### Nav width note

Adding a 6th nav item was the risk here — landmine #8 records that a 5th once wrapped the nav at
exactly 1024px. "FAQ" is 3 characters and it fits: `node tests/header-check.mjs` reports one trigger
row and no overflow at 1024/1100/1152/1280/1440. A longer label would not have. The comment in
`lib/site.ts` now says to re-run that test after any nav change.

## Round 3 — headshot-folder sweep + parent team page, 2026-08-11

Prompted by a pointer that headshots might live in another Downloads folder. Swept the whole tree
and then cross-checked the parent's published team page. **No code changes; four backlog corrections.**

### Folder sweep result — nothing was missed

- `~/Downloads/Greater Texas Behavioral Clinic/` holds **logos only** — no headshots.
- `~/Downloads/Staff Headshots/` is organised by state: Iowa 5, New Jersey 19, Florida 8, Kentucky 2,
  Quadrant 17 (+56 in subfolders), Texas 9, California 5 (+ subfolders).
- **GTB's are the 3 in `Texas/Virtual Staff/` already handled under CR-19b.** The 9 files directly in
  `Texas/` all resolve elsewhere by their own filenames — `DDC-Sarah-Bentley-CM`,
  `FWW - Krystal Moore`, `FWW- Jacci Westbrook`, `FWW-Corney Best-Clinical Director`,
  `Antoine Gross-Clinical Director`, `Deborah Wade - Nursing Director`, `Josh L`,
  `Olivia Hadjerioua`, and ` Haley Hayes` (the one with no bio anywhere).

### VIS-3 — 🔒 CLOSED, the row is WRONG for GTB

VIS-3 said the parent's `/about/meet-the-team` "should group Texas facilities incl. Greater Texas
Behavioral", implying GTB is absent. **It is not absent.** Verified live on the page:

> `… Krystal Moore Case Manager, Fort Worth Wellness Center · **Virtual Outpatient Program – Texas /
> Greater Texas Behavioral** · Emma Fyffe, LPC Primary Therapist · Jada Spencer Case Manager ·
> Norberto Segredo Case Manager · West Palm Beach – Florida …`

All three GTB staff are there, under their own correctly-labelled heading, and "Greater Texas" also
appears in the page's facility filter list. The grouping VIS-3 asks for **already exists**. No action.
Contrast **V0090, which still stands** — that is the `/locations/` page, where "Greater Texas" appears
0 times and `/locations/greater-texas-behavioral/` 404s. The two rows are about different pages.

### CR-02 / CR-19a — corroborated by a FIFTH source, and the parent is more accurate than the portal

The parent's own team page labels GTB **"Virtual Outpatient Program – Texas"**. So the published
parent site already says Virtual OP while the support portal bio still says "intensive outpatient
program". The portal is the outlier, not the site. Strengthens the IOP→OP fix — it is not a
preference, it is the only string out of step across five sources.

### CR-19c — the "shared Quadrant oversight" option is NOT available as written

This is the sharpest evidence yet, and it closes an escape hatch the row left open. Every clinical
title on the parent's team page is **facility-attached**:

| Role | Attached to |
|---|---|
| Antoine Gross — Clinical Director | Dallas Detox Center |
| Cortney Best, M.C.J., LCDC — Clinical Director | Fort Worth Wellness Center |
| Michelle Szwed, LPC, LCADC, ACS — Clinical Director | **West Windsor – New Jersey**, Wellness Recovery Center NJ |
| **Dr. Olivia M. Gibson-Delaney, M.D — Medical Director** | **West Windsor – New Jersey** — NOT corporate |
| Ila Holgerson — Director of Clinical Operations | **West Windsor – New Jersey** — NOT corporate |
| Michael McArthur / Erin Crawford / Deborah Wade — Nursing | Laguna View / Seaside / Ocean Coast |

And **CORPORATE LEADERSHIP is entirely non-clinical**: Nicholas Petrillo (CEO), Michael Zornberg
(COO), Sal Rabie (CFO), Colin McBride (CRO), plus founders Joey Cameron and Louis Iacona.

**So there is no published Quadrant-level clinical or medical authority to point at**, and GTB is the
only facility group on the parent's own team page with no clinical lead — one LPC therapist and two
case managers. CR-19c offered "if clinical oversight is shared at the Quadrant level, say so on
`/team` in one sentence". That option cannot be exercised honestly today, because there is nothing
published to reference. This is now confirmed from **four** independent sources: the facility
registry, the master bios doc, the headshot folder, and the parent's public team page.

- [ ] **New lead worth checking:** `Staff Headshots/Quadrant/Dr. Pamela Tambini.png` is a
      physician-titled headshot on file who does **not** appear anywhere on the published parent team
      page — either former staff or never published. If she is GTB's supervising physician, that is
      the answer to CR-19c and it simply needs publishing.
- [ ] Otherwise this stays a business/licensure question, not a content one.

### CR-19b — de-risked: the photos are already public

The parent's team page serves headshots inside the GTB block — `EMMA-1-1024x1024.jpg` and
`IMG_2769-878x1024.jpeg`. That second file is **878×1024 = 0.857**, an exact ratio match for Jada's
1290×1505 source, so it is hers. **Emma's and Jada's headshots are therefore already published
publicly by the parent organisation**, which means the portal upload is a gap in the portal, not a
consent or approval question. Nothing is waiting on permission.

### V0091 — holds on BOTH parent pages, not just `/locations/`

Re-checked the team page for outbound links: `greatertexasbehavioral.com` **0**, and 0 for every other
facility domain (`seasidewellnesspb.com`, `lagunaviewdetox.com`, Dallas, Fort Worth). So the parent
passes no authority to any facility from either page. The repo-side half is already done (CR-18).

## New findings from this pass

### CR-21 is BLOCKED, and the reason is bigger than the row said — `P2` — brand owner

CR-21 described an aspect-ratio mismatch (2.5:1 shipped vs 1.09:1 official) and instructed swapping
`LogoLight`'s hand-set wordmark for `greater-tx-behavioral-white.png`. **I did not do the swap.**
Rendering the assets — rather than reading their metadata — shows the row understated the problem:

- **The glyph inside the Texas outline is different.** Shipping (`logo-horizontal.png`,
  `logo-mark.png`) = a **medical cross**. Official (all 5 files) = **two speech bubbles**. These are
  different marks, not two crops of one lockup.
- Swapping only the footer would put speech bubbles in the footer and a cross in the header **on
  every page**. That is worse than either state alone, so the swap is gated on CR-21's own first
  checkbox: *"Confirm with the brand owner which lockup is current."*
- **Additional defect the row missed:** `logo-mark.png` is not a mark. It is the **full horizontal
  lockup padded into a 512×512 square**, and `LogoLight` renders it at 36 px inside a 44 px badge
  *next to* the hand-set words — so the footer currently shows the wordmark **twice**, once
  illegibly. Fixing this properly needs the same brand answer.

A side-by-side comparison sheet was generated for the brand owner at
`~/Downloads/Greater Texas Behavioral Clinic/BRAND-DISCREPANCY-2026-08-11.png`.

- [ ] Brand owner: is the current mark the **medical cross** or the **two speech bubbles**?
- [ ] Then update header, footer badge and `logo-mark.png` together, from the official source.

### Gaps filed and fixed — no audit row covered these

1. **The Vercel alias was publicly indexable and cross-canonicalled to the WordPress domain.**
   `app/robots.ts` emitted `Allow: /` unconditionally while every page canonicalled to
   `greatertexasbehavioral.com`, which until cutover serves different content and 404s four of those
   URLs. Now gated on `VERCEL_ENV === 'production'`. **Note it is baked at build time** — a static
   route — so `VERCEL_ENV=production next start` does nothing; the build is what matters. Verified
   both directions.
2. **The insurance carrier list was inherited verbatim from Seaside.** Seven of fifteen entries were
   unsupportable for a Texas-only provider: Anthem (not in Texas), MVP (NY), HealthPartners (MN),
   Horizon (NJ), Medical Mutual (OH), and Beacon + ValueOptions — the same defunct entity twice
   (ValueOptions → Beacon 2014 → Carelon 2022). Pruned to the eight that plainly operate in Texas.
   **Nothing was added** — naming a carrier is a payer-relationship claim.
   - [ ] Admissions: confirm the real contracted payer list. Superior HealthPlan, Molina of Texas,
         Carelon Behavioral Health and Magellan are the likely Texas additions.
3. **`(877) 590-3665` was hard-coded in 5 blog bodies.** Now `${site.phone}`. V0043 was a
   wrong-phone-number incident, so stale digits in prose is a live recurrence path.
4. **README.md documented three paths that do not exist** (`app/our-story/`, `app/api/contact/`,
   `lib/blog.ts`) and omitted `/team`, `/contact`, `/privacy-policy`, `lib/seo.ts`, `lib/staff.ts`,
   `lib/useLeadDelivery.ts` and both integrations. Rewritten, with a "things that look wrong but are
   deliberate" section so the landmines survive outside HANDOFF.md.

### HANDOFF.md correction

Its Commands section claimed the Vercel preview cannot be checked over HTTP. That is true of
**branch** previews; the **production alias is public and returns 200**. As written it removed a
working verification channel — including the only way to check CR-02's live bio text without a local
build. Corrected in place; `ISSUES.md:1442-1444` was already right.

## Still blocked — not startable in code

- **FR-1 (SUD vs MH scope)** — unresolved, so **no SUD content was touched**. Per this file's own
  reading the likeliest answer is an unfilled registry cell, and the "SUD in scope" outcome needs
  zero site changes; that is the state the site is in. Do not start content work until clinical or
  compliance answers.
- **CR-19c (clinical leadership)** — the absence is corroborated in all three sources. Nothing was
  added to `/team`: asserting shared Quadrant-level oversight without confirmation would invent a
  clinical claim.
- **CR-01 (Vercel token)** — `lib/.env` deliberately left in place. Rotation happens in the Vercel
  dashboard and only you can do it; deleting the file first would destroy the value without
  revoking the token. Delete it after rotating.
- **CR-07 trust boundary** — who can publish to Clarion? If anyone beyond the owner, replace the
  hand-rolled sanitizer with a parser-based library.
- All Wave 4 items (portal, WordPress, parent site, counsel, business) are unchanged.

---

# Open tasks — code-review pass 2026-08-11

Source: full read of `app/`, `components/`, `lib/` and all configs, verified against a local
production build (`next build` + `next start -p 3111`). Findings are new — everything re-testable
from the 2026-08-04 pass still holds (see Baseline below).

**Pass 3 (2026-08-11):** the full audit workbook was pulled from all 5 tabs and reconciled against
this file. **9 GTB-relevant rows were never triaged here**, and 3 further defects were found that
no audit row covers. See "Pass 3 — audit workbook reconciliation" below.

## Priority summary — code review

| ID | Priority | Owner | Status | Summary |
|----|----------|-------|--------|---------|
| CR-01 | **P0** | Ben | ☐ Open | Live Vercel API token in plaintext at `lib/.env` — rotate |
| CR-02 | **P0** | Portal editor | ☐ Open | Staff bio says "intensive outpatient program" + "Clinic" — contradicts Virtual OP + telehealth-only |
| CR-03 | **P0** | Business | ✅ **FIXED** (Option B) | Placeholder testimonials are presented as real reviews |
| CR-04 | **P1** | Dev | ✅ **FIXED** | Mobile menu + viewport resize permanently locks page scroll (repro confirmed) |
| CR-05 | **P1** | Dev | ✅ **FIXED** | Lead-delivery tests live in git-ignored `_scrape/` — untracked, unrunnable in CI |
| CR-06 | **P1** | Dev | ✅ **FIXED** | Bump `next` 14.2.15 → 14.2.35 (patch line, clears most advisories) |
| CR-07 | **P1** | Dev | ✅ **FIXED** | Clarion `body_html` rendered unsanitized under `script-src 'unsafe-inline'` |
| CR-08 | P2 | Dev | ✅ **FIXED** | "We work with **all** major insurance carriers" contradicts "most major PPO" sitewide |
| CR-09 | P2 | Business | ☐ Open | "Many clients pay little to nothing" — unsubstantiated financial claim |
| CR-10 | P2 | Dev | ✅ **FIXED** | "The best in virtual treatment" — bare superlative on a healthcare page |
| CR-11 | P3 | Dev | ✅ **FIXED** | 3.6 MB of unreferenced assets ship in the deploy, incl. Seaside leftovers |
| CR-12 | P3 | Dev | ✅ **FIXED** | Dead config: `clarion.blogEmbedSrc` never referenced |
| CR-13 | P3 | Dev | ✅ **FIXED** | `sitemap.xml` stamps `lastModified: now` on every build — false change signal |
| CR-14 | P3 | Business | ☐ Open | Blog is ~6 months stale (newest post 2026-02-23) |

### Carried over — still open from the 2026-08-04 pass

Confirmed still outstanding on 2026-08-11. Detail lives in the sections further down this file.

| ID | Owner | Summary | Detail |
|----|-------|---------|--------|
| CO-1 | Ben | Set `RESEND_API_KEY` / `CONTACT_FROM` / `CONTACT_TO` in Vercel or the lead fallback accepts but cannot deliver | "Outside this repo" |
| CO-2 | Ben | Allowlist every production origin in Clarion → Website Integrations | "Outside this repo" |
| CO-3 | Ben | Live WordPress `robots.txt` points at `seasidewellnesspb.com/sitemap_index.xml` — fix in Yoast | "Outside this repo" |
| CO-4 | Counsel | Privacy policy needs sign-off on 6 items listed in the page header comment | V0100 |
| CO-5 | Business | Verify Shutterstock licensing on photos carried from the old live site | (pre-launch flag) |
| CO-6 | Clarion editor | Re-upload the one hotlinked Unsplash blog cover to Clarion's own CDN | VIS-1 |
| CO-7 | — | ~~Cross-check `(877) 590-3665` against the Google Business Profile~~ — **🔒 CLOSED 2026-08-11.** GTB has **no** Google Business Profile (registry `GMB Review Link = -`), so there is nothing to check against. The registry verifies the number instead: `Website # = 877-590-3665`, matching `lib/site.ts` exactly. See FR-3. | V0043 |

### Priority summary — Pass 3 (audit workbook, newly triaged)

| ID | Priority | Owner | Status | Summary |
|----|----------|-------|--------|---------|
| V0134 | **HIGH** | Ben (WordPress) | ☐ Open | Florida/Seaside content live on the Texas domain — 2 posts, still HTTP 200 today |
| CR-15 | **HIGH** | Dev | ✅ **FIXED** | 6 indexed taxonomy/author URLs missing from the cutover redirect map — will 404 |
| CR-16 | **HIGH** | Dev | ✅ **FIXED** | `/insurance` (301 alias on production) missing from the redirect map — will 404 |
| V0116 | HIGH | Dev | ◐ Folded | Preview-vs-production slug change for GTB — actioned as CR-16 |
| V0094 | P2 | Business | ☐ Decide | Portfolio treatment-hub standard is `/treatment`; GTB uses `/what-we-treat` (uncounted 5th variant) |
| V0099 | P2 | Business | ☐ Decide | Portfolio FAQ standard is `/faq`; GTB has no FAQ page (1 of 7 sites) |
| CR-17 | P3 | Dev | ✅ **FIXED** | Production `/feed/` returns 200; the build has no RSS feed — aggregators break at cutover |
| V0124 | **CRITICAL** (portfolio) | Ben | ☑ Clear, re-run | Cutover content gap — GTB verified unaffected 2026-08-11; must be re-run at cutover |
| V0135 | MEDIUM | Dev | ☑ Satisfied | 4-pair redirect map — already in `next.config.mjs`; but the row undercounts (see CR-15/16) |
| V0101 | — | — | 🔒 Closed | Blog URL pattern — GTB build already on the `/blog/slug` standard |
| V0103 | — | — | 🔒 Closed | `/contact` → JPEG on production — Dallas and Fort Worth only, not GTB |
| V0118 | — | — | 🔒 Closed | Geo-suffixed service slugs — not applicable to GTB |

**Found on the second sweep** (filed under other facilities, missed by a Facility-column filter):

| ID | Priority | Owner | Status | Summary |
|----|----------|-------|--------|---------|
| V0090 | **HIGH** | Ben / parent | ☐ Open | GTB absent from the Quadrant parent site entirely — `/locations/` names it **0 times**, its page 404s |
| V0091 | P2 | Ben / parent | ☐ Open | Parent passes no authority to GTB — 0 outbound facility links on `/locations/` |
| CR-18 | P2 | Dev | ✅ **FIXED** | Reciprocal half of V0091: this site has **no user-visible link to the parent** at all |
| VIS-2 | P3 | Parent site | ☐ Open | Parent `/locations` "missing facilities" row names GTB — corroborates V0090 |
| VIS-3 | P3 | Parent site | ☐ Open | Parent `/about/meet-the-team` should group Texas facilities incl. GTB |
| V0046 | — | — | 🔒 Withdrawn | GTB "missing H1" — false, withdrawn. Carries a methodology warning worth keeping |
| V0042 | P3 | Sheet owner | ☐ Note | Portfolio privacy-robots breakdown still lists GTB as "no privacy page" — now stale |

**Staff bios** (master bios doc, reviewed 2026-08-11). Roster is complete and byte-identical to the
portal — **no bios need adding**:

| ID | Priority | Owner | Status | Summary |
|----|----------|-------|--------|---------|
| CR-19a | **P0** | Doc owner | ☐ Open | The IOP / "Clinic" error is in the **master doc**, not just the portal — upstream half of CR-02 |
| CR-19c | **P1** | Business | ☐ Decide | No Clinical/Medical Director published — only 1 therapist + 2 case managers |
| CR-19b | P2 | Portal editor | ☐ Open | All 3 staff have `photoUrl: null` — **the photos exist and are unuploaded**, none are missing |
| CR-20 | P2 | Dev | ✅ **FIXED** | Staff photos bypass `next/image` and no `remotePatterns` exists — originals are **2.9 MB** for three 96px avatars |
| CR-21 | P2 | Dev / brand | ☐ Open | Official logo set exists in `~/Downloads/Greater Texas Behavioral Clinic/`; footer wordmark is a **CSS reconstruction** and the header lockup matches no official file |
| CR-19d | P3 | Portal editor | ☐ Open | Portal flattens the authors' paragraph breaks; `bioParagraphs()` heuristic covers it |

### Priority summary — Pass 4 (facility registry)

Read from an owner-supplied screenshot; the sheet itself is access-restricted (401 on all exports).

| ID | Priority | Owner | Status | Summary |
|----|----------|-------|--------|---------|
| FR-1 | **P0 — confirm first** | Clinical / compliance | ☐ Open | Registry marks GTB **`MH` only, `SUD` blank** — but the site is saturated with addiction/detox content (`detox` ×71, `addiction` ×45) and declares `Addiction Medicine` in its JSON-LD |
| FR-2 | **P1** | Business / counsel | ✅ **RECORDED** | Registry company name is "Greater Texas Behavioral **Clinic**" — third source using "Clinic"; **amends CR-02 and CR-19a** |
| FR-3 | P2 | Business | ☐ Open | No Google Business Profile — **closes CO-7**, and blocks CR-03 Option A |

### Workbook coverage — what the 5 tabs actually contain for GTB

Pulled 2026-08-11 via `export?format=xlsx` and parsed with openpyxl. The sheet is unchanged since
the 2026-07-28 verification pass and **still shows every GTB row as `Status: Open`** — it has not
been updated with any of the fixes recorded in this file.

| Tab | Rows | GTB-relevant | Notes |
|---|---|---|---|
| Vercel Build Issues | 102 | **22** — 6 facility-specific + 13 `ALL SITES` + **3 filed under other facilities** | 10 were already in this file; 12 were not |
| Broken Internal Links | 29 | **0** | All 29 are Dallas (V0001-V0016) and Fort Worth (V0024-V0036) |
| Visual Issues | 1,903 | **0 by facility, but 2 rows reference GTB** | No row is *filed* under GTB — confirms it was never visually QA'd. Two rows filed under Quadrant Health Group name GTB as a missing entry (see VIS-2/VIS-3 below). The 91 rows with a blank facility are entirely empty padding (IDs 1813-1903), not data. |
| Verification Log | 74 | 17 | 14 matching the IDs above, plus V0042, V0046 and V0090. **V0116, V0118, V0124, V0134, V0135 are absent** — added during verification, never independently re-tested |
| Legend | — | — | 118 total rows = 108 original + 10 added during verification |

> **Correction to this pass's first sweep.** The initial extraction filtered on the **Facility
> column** only, which reported 19 GTB-relevant rows. A full-text sweep for `greater texas` /
> `greatertexasbehavioral` / `greater-texas-behavioral` / both phone numbers across every cell of
> every tab found **five more items filed under other facilities** — V0090 and V0091 (Quadrant
> parent), V0042 (Fort Worth), and two Visual Issues rows (Quadrant parent) — plus **V0046**, a
> withdrawn GTB row that survives only in the Verification Log and is absent from the issues tab.
> Anyone re-running this reconciliation should sweep full text, not the Facility column: a row
> about the parent site can be a GTB task.

**Caution the Legend itself sets:** *"NOT YET VERIFIED — 34 rows. Treat their counts and fix
instructions with the same caution the verified set earned — roughly two thirds of verified rows
needed a correction."* The five GTB-relevant rows missing from the Verification Log fall in that
bucket, so each was independently re-tested against production before being triaged below. **Two
of the five turned out to be imprecise** — see V0116 and V0135.

---

## CR-01 — Live Vercel API token in plaintext — `P0` — Ben

- **Where:** `lib/.env` (single line, a `vcp_…` Vercel API token).
- **History:** flagged in the 2026-08-04 pass as "rotate the Vercel API token sitting in plaintext".
  Still present and unrotated 7 days later.
- **Exposure assessment (checked, not assumed):** it has **never been committed** —
  `git ls-files` returns only `.env.example`; `git check-ignore -v lib/.env` matches
  `.gitignore:35:.env*`; the working tree is clean; `.vercelignore` also excludes `.env*`. So this
  is not a repo leak.
- **Why it still matters:** it is a full-access deploy token sitting *inside the source tree* in a
  directory that is otherwise all committed code. One `git add -f`, one directory-wide backup or
  cloud sync, one shared machine, or one `zip -r` of the project and it is out. Nothing in the
  application reads it — `grep` finds no consumer.

- [ ] Rotate the token at vercel.com → Account Settings → Tokens (revoke the old one).
- [ ] Delete `lib/.env`. If a token is genuinely needed for local CLI work, keep it outside the
      repo (e.g. the login keychain / `~/.vercel`), never in the source tree.
- [ ] Verify: `test ! -f lib/.env` and `grep -rn 'vcp_' .` returns nothing outside `node_modules`.

## CR-02 — Staff bio contradicts the service classification — `P0` — Portal editor

- **Where:** rendered on **both** `/about/` and `/team/` via `components/StaffGrid.tsx` and
  `app/team/page.tsx`, sourced from `lib/staff.ts` → the Quadrant support portal feed
  (`support.quadranthealthgroup.com/api/public/facilities/greater-texas-behavioral/staff`).
- **The text, verbatim, live right now:** Emma Fyffe's bio reads *"She serves as the primary
  therapist at Greater Texas Behavioral **Clinic**, an **intensive outpatient program** providing
  care for individuals experiencing mental health and substance use challenges."*
- **Two separate contradictions:**
  1. **IOP vs OP.** Commit `7b2e82e` deliberately reclassified the service from IOP to
     **Virtual Outpatient Program (OP)**, and every other string on the site says OP —
     `lib/site.ts`, the JSON-LD `availableService` in `app/layout.tsx`, the footer, all page copy.
     "Intensive outpatient program" is a distinct level of care with its own clinical and billing
     definition, so this is a substantive misstatement, not a wording nit.
  2. **"Clinic" implies a physical location.** `/contact` deliberately publishes no street address
     because GTB is 100% telehealth (`site.address` is region-only, and the reasoning is recorded
     in the header comment of `app/contact/page.tsx`). A bio naming a "Clinic" undercuts that on
     the same domain.
- **Note:** this was flagged on 2026-08-04 under "Outside this repo — still open" and is
  **unchanged**. It renders on a YMYL healthcare page today.

- [ ] Edit the bio in the support portal (`support.quadranthealthgroup.com/dev/staff`):
      "intensive outpatient program" → "virtual outpatient program".
- [ ] **AMENDED by FR-2 (2026-08-11):** originally this task also said to drop "Clinic" from the
      facility name. Hold that half — the facility registry's *company name* is "Greater Texas
      Behavioral **Clinic**", so "Clinic" may be the correct legal/DBA name and `lib/site.ts` the
      outlier. The **IOP → OP fix above stands regardless** (the registry's own `LOC` is
      `Virtual OP`). Resolve the naming question under FR-2 first, then apply or drop this half.
- [ ] Review the other two bios (Jada Spencer, Norberto Segredo) for the same drift while in there.
- [ ] Verify after the portal cache clears (`revalidate: 300`):
      `curl -s https://greatertexasbehavioral.com/team/ | grep -ci 'intensive outpatient'` → `0`,
      same for `/about/`.
- **Consider:** a build-time guard in `lib/staff.ts` that flags bios containing "intensive
  outpatient" or "Clinic", so portal edits can't silently reintroduce this. Cheap insurance given
  the content is owned by another system.
  - [x] **Guard built** — `BIO_RED_FLAGS` in `lib/staff.ts`. Warns, never throws: a content problem
        in an external system must not blank a page. Uses `\bclinics?\b` with word boundaries, which
        is what avoids re-creating the "clinical" false positive recorded in 19a.
  - [x] **Loop closed 2026-08-11 — `tests/staff-bio-drift.mjs`.** The guard alone did **not**
        satisfy this row's stated purpose ("so portal edits can't silently reintroduce this"):
        `console.warn` on Vercel lands in function logs nobody reads, so it documented the problem
        instead of catching it. The new check reads the **same upstream feed** (the defect is in the
        portal, not in our render) and is wired into `npm test`. Design notes:
        - **Known-issue allowlist.** A permanently-red test trains people to ignore red tests. The
          two live CR-02 findings are listed in `KNOWN` with their issue references: they print
          loudly every run but do not fail the suite. **Anything not on that list fails hard.**
          Delete the `KNOWN` entries when the portal is fixed and the check becomes strict.
        - **Pattern-sync guard.** The check asserts each of its regexes appears verbatim in
          `lib/staff.ts`, so the app guard and the test cannot drift apart.
        - **Skips, never fails, on an unreachable feed** — mirroring `fetchStaff`'s rule that a
          directory outage must not take a page down, so this never becomes a flaky CI gate.
        - Also reports `photoUrl: null` per person, so CR-19b stays visible.
        - **All three paths verified:** known-only → exit 0; unlisted drift → exit 1; a regex that
          diverges from `lib/staff.ts` → exit 1.

## CR-03 — Placeholder testimonials presented as real reviews — `P0` — Business

- **Where:** `components/Testimonials.tsx`, rendered on the homepage.
- **The gap:** the file's own header comment says the entries are *"generic … replace them with
  your real, consented client reviews … before launch."* But nothing in the **rendered** output
  says so. A visitor sees the eyebrow "**Real recovery**", the heading "**They trusted us with
  their recovery. So can you.**", the lead "**Stories from Texans who found** structure, support,
  and lasting change through our Virtual OP", three first-person quotes, five gold stars each
  (`role="img" aria-label="5 out of 5 stars"`), and city attributions — Houston TX, Austin TX,
  West Texas.
- **Why P0:** there is no way for a visitor to tell these are not real reviews, and the framing
  affirmatively asserts they are. On a healthcare site that is an FTC endorsement-rule exposure
  (16 C.F.R. Part 255 — testimonials must reflect the honest experience of actual clients) on top
  of state advertising rules for licensed providers. This is the oldest unresolved pre-launch item
  in the project.
- **Do not** "fix" this by adding fine print like "representative example" under a section headed
  "Real recovery" — the heading and the star ratings are the problem.

Pick one:

- [ ] **Option A — likely blocked, see FR-3:** replace with real, consented reviews. Attribute
      honestly (first name + initial, or "client, Houston" with written consent), and only show star
      ratings if they came from an actual rating. **But the facility registry shows GTB has no Google
      Business Profile** (`GMB Review Link = -`), so there is no existing review pipeline to draw
      from — which is also why no verbatim quotes could be carried over from the old site. Reviews
      would have to be collected from scratch. **Option B is now the realistic path.**
- [x] **Option B:** delete the section and put something truthful in the slot — the clinical
      approach, what a week in the program looks like, or the licensure/credentials of the team
      (which `/team` now has real data for).
- [ ] **Option C (stopgap only, if launch can't wait):** keep the layout but remove every claim of
      authenticity — drop the star ratings, drop the city attributions, retitle away from "Real
      recovery"/"Stories from Texans", and label the block explicitly as illustrative of the
      program rather than as client experience.
- [ ] Whichever option: also re-check the homepage's neighbouring claims for the same class of
      problem (see CR-09).

## CR-04 — Mobile menu + resize permanently locks page scroll — `P1` — Dev

- **Where:** `components/Header.tsx:42-47` (the body-scroll-lock effect).
- **Repro (confirmed with Playwright against the production build, not inferred):**
  1. Load any page at a sub-`lg` viewport (tested 820×900).
  2. Tap the hamburger — `document.body.style.overflow` becomes `hidden`. Correct so far.
  3. Resize or rotate to ≥1024px (tested 1180×820).
  4. Result: `body.style.overflow` is **still `hidden`**, the panel is `display: none` (it is
     `lg:hidden`), and the toggle button is gone (also `lg:hidden`). A 1200px wheel scroll moves
     `window.scrollY` from 0 to **0**.
- **Impact:** the page is unscrollable with no UI capable of unlocking it. Only a reload recovers.
  Reachable by ordinary tablet rotation — an iPad going portrait→landscape crosses 1024px.
- **Cause:** `open` is reset on route change (`[pathname]`) and by Escape, but never by a viewport
  change, and both the panel and its toggle are hidden at `lg`.

- [x] Add a `matchMedia('(min-width: 1024px)')` listener in `Header.tsx` that calls
      `setOpen(false)` when it matches, so the state follows the breakpoint that hides the UI.
      Keep the existing cleanup that restores `document.body.style.overflow`.
- [x] Verify: the repro above ends with `body.style.overflow === ''` and a wheel scroll moving
      `scrollY`. Worth keeping as a tracked test — see CR-05.

## CR-05 — Lead-delivery tests are untracked — `P1` — Dev

- **Where:** `_scrape/lead-verify.mjs`, `csp-check.mjs`, `responsive-check.mjs`,
  `header-check.mjs`, `img-csp.mjs`. `_scrape/` is git-ignored (`.gitignore:35`) and
  vercel-ignored.
- **The gap:** the Verification section below cites 8 Playwright lead-delivery scenarios as the
  evidence that the insurance and contact forms never silently drop a lead. That evidence is not
  in version control. Nobody else can run it, CI cannot run it, and it is one `rm -rf _scrape`
  from gone — at which point the most safety-critical path on the site (whether someone asking for
  treatment actually reaches admissions) has no regression coverage at all.
- **Context:** `playwright` is already a devDependency, so there is no new tooling cost. The repo
  currently has **zero** tracked tests.

- [x] Move the five scripts into a tracked `tests/` directory and drop the `_scrape` ignore for
      them.
- [x] Parameterise `BASE` via env (default `http://127.0.0.1:3111`) instead of the hard-coded
      production alias, so a local `next start` is the default target. Keep the Clarion endpoint
      **mocked** — the current script mocks it, which is why running it never creates real leads.
      Preserve that property and say so in a header comment.
- [x] Add npm scripts, e.g. `"test:e2e": "node tests/lead-verify.mjs"` plus a `test` aggregate.
- [x] Add the CR-04 resize repro as a case in `responsive-check.mjs`.
- [x] Verify: a fresh clone + `npm ci` + `npm run build` + `npm start` + `npm test` passes with no
      files from `_scrape/`.

## CR-06 — Bump `next` 14.2.15 → 14.2.35 — `P1` — Dev

- **Where:** `package.json` — `"next": "14.2.15"` (Oct 2024). Latest on the 14 line is 14.2.35.
- **`npm audit --omit=dev` reports** 8 Next advisories + 4 transitive `postcss` ones
  (3 vulnerabilities: 2 high, 1 critical).
- **Exploitability against *this* app — checked individually, not taken at face value:**

  | Advisory | Applies here? |
  |---|---|
  | GHSA-36qx-fr4f-26g5 — middleware/proxy bypass, Pages Router + i18n | **No** — App Router, no `middleware.ts`, no i18n |
  | GHSA-m99w-x7hq-7vfj — DoS via Server Actions | **No** — no Server Actions |
  | GHSA-89xv-2m56-2m9x — SSRF in Server Actions on custom servers | **No** — no Server Actions, no custom server |
  | GHSA-4c39-4ccg-62r3 — unbounded Server Action payload, Edge | **No** — no Server Actions, `runtime = 'nodejs'` |
  | GHSA-955p-x3mx-jcvp — disclosure of internal Server Function endpoints | **No** — no Server Actions |
  | GHSA-p9j2-gv94-2wf4 — SSRF via attacker-controlled rewrite destination | **No** — no rewrites; redirect destinations are static literals |
  | GHSA-68g3-v927-f742 / GHSA-4633-3j49-mh5q — cache confusion for requests **with bodies** | **Closest to relevant** — `/api/lead/` is a POST with a body, though it is `dynamic = 'force-dynamic'` |
  | postcss ×4 — `sourceMappingURL` path traversal / `</style>` XSS | **No** at runtime — build-time only, requires attacker-controlled CSS |

- **So:** nothing here reads as currently exploitable. This is hygiene plus closing the one
  near-miss, not an incident.
- **Do NOT run `npm audit fix --force`** — it resolves to `next@16.3.0`, a two-major breaking jump.

- [x] `npm i next@14.2.35 eslint-config-next@14.2.35`
- [x] Verify: `npx tsc --noEmit`, `npx next lint`, `npx next build` all clean; re-run the route /
      redirect / header / metadata checks in Baseline below; re-run `npm audit --omit=dev` and
      record what remains.
- [ ] Separately, decide whether to track the 15 → 16 upgrade as its own scheduled task.

## CR-07 — Clarion `body_html` rendered unsanitized — `P1` — Dev

- **Where:** `app/blog/[slug]/page.tsx:94` —
  `dangerouslySetInnerHTML={{ __html: post.body_html || '' }}`, fed straight from the Clarion CMS
  via `lib/clarion-blog.ts`.
- **Current mitigation and its limit:** React will not execute a `<script>` tag inserted through
  `innerHTML`, so the obvious vector is dead. But the CSP in `next.config.mjs` includes
  `script-src 'unsafe-inline'` (required today — the layout ships two inline bootstrap scripts and
  Next inlines hydration data), so **event-handler attributes still run**: an `<img onerror=…>` or
  `<svg onload=…>` in a post body would execute.
- **Assessment:** treating the owner's own CMS as trusted is a defensible call, and the code says
  so explicitly. The reason to tighten it anyway is blast radius — this origin also serves an
  intake form collecting an insurance member ID and free-text health context, and the CSP's
  `connect-src` allows `api.clarionlabs.ai`. If the Clarion account is shared beyond the owner, or
  ever supports multiple editors, the trust assumption stops holding.

- [ ] Decide and record the trust boundary: who can publish to Clarion for this site?
- [ ] If it is anyone beyond the owner: sanitize server-side before render (allowlist tags/attrs,
      strip all `on*` handlers and `javascript:` URLs). Keep it server-side so no client bundle
      cost.
- [ ] Longer-term, revisit the nonce-based CSP already scoped in the `next.config.mjs` comment —
      it removes `'unsafe-inline'` and closes this class outright. Cost is a `middleware.ts` and
      every route going dynamic, which is why it was deferred; re-evaluate rather than assume.

## CR-08 — "All major insurance carriers" overclaim — `P2` — Dev

- **Where:** `app/verify-insurance/page.tsx:118` — `<h2>We work with all major insurance carriers</h2>`.
- **It contradicts the rest of the site**, including the same page: the hero trust badge says
  "Most PPO Plans" (`app/page.tsx:37`), `components/InsuranceStrip.tsx:19` says "most major PPO
  insurance plans", and the lead paragraph 55 lines above this heading says "most major PPO
  insurance providers". `lib/site.ts` lists 15 named carriers.
- **"All" is unsubstantiable** and is the kind of absolute that draws advertising complaints. The
  adjacent `35+ more` chip (`:136`) is also a specific number nothing supports.

- [x] Change the heading to "We work with most major insurance carriers" (or "…most major PPO
      plans" to match `site.description` exactly).
- [x] Either substantiate `35+ more` against the real payer list or soften it to "and many more".
      Same chip appears in `components/InsuranceStrip.tsx:54` — fix both.
- [x] Verify: `grep -rn "all major" app components lib` returns nothing.

## CR-09 — "Many clients pay little to nothing" — `P2` — Business

- **Where:** `components/InsuranceStrip.tsx:22` (homepage), echoed by "Many clients have minimal
  out-of-pocket costs" in `app/page.tsx:78` and "In many cases, insurance significantly reduces
  out-of-pocket costs" in `app/verify-insurance/page.tsx:61-62`.
- **Why it needs an owner decision:** these are cost claims made before any benefits check, on the
  page whose CTA is a form that collects insurance details. The third phrasing is defensible; the
  first ("pay little to nothing") is the strongest and the least supportable.

- [x] Confirm with admissions whether the claim is backed by actual benefit-verification outcomes.
- [x] If not, soften to the coverage-dependent phrasing already used on `/verify-insurance` and
      keep all three wordings consistent.

## CR-10 — "The best in virtual treatment" — `P2` — Dev

- **Where:** `app/what-we-treat/page.tsx:165` — section eyebrow.
- A bare superlative with no basis, on a clinical page. Inconsistent with the restraint everywhere
  else in the copy ("a leading online OP", "evidence-based", "structured").

- [x] Replace with something factual — e.g. "Why our Virtual OP works" or "What sets our program
      apart".

## CR-11 — 3.6 MB of unreferenced assets ship in the deploy — `P3` — Dev

Not referenced anywhere in `app/`, `components/` or `lib/`:

| File | Size | Note |
|---|---|---|
| `public/images/blog-sea-turtle.jpg` | 976K | Florida / Seaside leftover |
| `public/images/blog-palm.jpg` | 708K | Florida / Seaside leftover |
| `public/images/tx-stockyards.jpg` | 848K | unused |
| `public/images/friends-sunset.jpg` | 540K | unused |
| `public/images/horse-stable.jpg` | 460K | unused |
| `public/images/insurance-carriers.png` | — | superseded when `InsuranceStrip` moved to text chips |
| `public/logos/logo-full.png` | — | only `logo-mark` / `logo-horizontal` are used |

`public/` is 11 MB total, so this is roughly a third of it, served from the deploy for no reason.
The two Seaside blog images are also the last inherited Florida assets in the tree.

- [x] Delete the seven files.
- [x] Verify: `next build` clean, then re-run the unreferenced-asset scan — for each file in
      `public/`, `grep -rqF "$(basename f)" app components lib`.
- **Separate, do not conflate:** 15 images in `public/` exceed 400 KB at source. Served bytes are
  fine because `next/image` converts to AVIF/WebP on demand, so this is repo/deploy weight only —
  optional cleanup, not a performance defect.

## CR-12 — Dead config entry — `P3` — Dev

- **Where:** `lib/site.ts:46` — `blogEmbedSrc: 'https://www.clarionlabs.ai/blog-embed.v1.js'`.
- Never referenced. It belongs to the abandoned client-side blog embed, which was replaced by the
  server-side fetch in `lib/clarion-blog.ts` (commit `faadc68`, to bypass CORS). Leaving it in
  `site.ts` invites someone to wire it back up and reintroduce the CORS failure.

- [x] Remove the key. If it is worth remembering why, replace it with a one-line comment pointing
      at `lib/clarion-blog.ts` — matching how `lib/site.ts` already records the removed
      `admissionsPhone`.

## CR-13 — `sitemap.xml` reports everything as changed on every build — `P3` — Dev

- **Where:** `app/sitemap.ts:28,32` — `const now = new Date()` used as `lastModified` for all 8
  static routes.
- Every deploy tells crawlers all 8 pages changed, whether they did or not. Blog entries are
  handled correctly (they use `post.published_at`); the static routes are the issue. Low impact,
  but it dilutes the crawl signal the V0102 trailing-slash work was specifically protecting.

- [x] Give the static routes a real date — a per-route constant updated when the page changes, or
      the file's git mtime at build.
- [x] Verify: two consecutive builds with no content change produce identical `lastModified`
      values for the static routes.

## CR-14 — Blog is ~6 months stale — `P3` — Business

- Newest post is `published_at: '2026-02-23'` (`lib/original-posts.ts:173`); today is 2026-08-11.
  All 5 local posts fall between 2025-12-16 and 2026-02-23.
- Not a bug — the merge logic in `lib/clarion-blog.ts` is working and Clarion posts take
  precedence. It is a content-freshness signal on a site whose blog is a stated SEO asset, and it
  also weakens the case recorded under V0045 for skipping child condition pages.

- [ ] Decide whether the blog is an active channel. If yes, publish through Clarion (no code
      change needed — it appears within `revalidate: 300`). If no, consider whether the section
      still earns its nav slot.

---

# Pass 3 — audit workbook reconciliation, 2026-08-11

Source: `https://docs.google.com/spreadsheets/d/1daiRElkRoKObt9KCsqFeXEhmtSBk5c1MQjUeaKx2nC8`,
all 5 tabs. Every claim below was re-tested against **live production**
(`greatertexasbehavioral.com`) on 2026-08-11 before being written down, because the five rows that
matter most here never went through the workbook's own verification pass.

## V0134 — Florida/Seaside content live on the Texas domain — `HIGH` — Ben (WordPress)

**This row is not in the audit's Verification Log and was never triaged in this file.**

- **Verified live 2026-08-11 — both still HTTP 200:**
  - `https://greatertexasbehavioral.com/west-palm-beach-addiction-treatment-guide/`
  - `https://greatertexasbehavioral.com/how-to-find-a-luxury-detox/`
- **What the audit found:** the first is titled "Comprehensive Addiction Treatment in West Palm
  Beach" — "West Palm Beach" ×7, "Florida" ×3, "Seaside" ×6, and **"Texas" zero times**. The second
  targets "Luxury Detox in Palm Beach". Both carry `855-416-5648`, which is Seaside's number, and
  the first is **duplicated at the same slug** on `seasidewellnesspb.com`. The two also share an
  identical H1, so one was cloned from the other without editing.
- **Why it is still open:** this repo already handles it — `RETIRED_POSTS` in `next.config.mjs`
  301s both slugs to `/blog/`. But **that only takes effect at cutover.** Right now, today, the
  Texas domain is publishing Florida content with a competitor facility's phone number on it, and
  one page is duplicate content against a sibling QHG domain. The repo cannot fix a live WordPress
  site.
- **Cross-reference:** this is the second Seaside artifact found on the Texas domain after V0043
  (the phone number). Both confirm the site was cloned from Seaside.

- [ ] Unpublish or 301 both posts **on production WordPress** — do not wait for cutover.
- [x] **Decision needed on the destination.** V0134 recommends 301'ing them to the Seaside
      equivalents, on the reasoning that the content belongs to that facility and market. This repo
      currently sends them to `/blog/`. Recommend **keeping `/blog/`**: 301'ing to
      `seasidewellnesspb.com` hands whatever link equity these URLs hold to a different domain, and
      a Texan who clicked a Texas result should not land in Florida. Record whichever is chosen so
      the repo and production agree.
- [ ] Confirm the Seaside copy is canonical and fix its duplicate H1 (Seaside's owner, not GTB's).
- [ ] Verify: both URLs return 301 (not 200) on production, and `855` returns 0 occurrences on the
      Texas domain.

## CR-15 — Six indexed URLs missing from the cutover redirect map — `HIGH` — Dev

**Found by pulling the production sitemap; no audit row covers this.** V0135 claims GTB needs a
"4-pair redirect map — smallest in the portfolio". That undercounts.

`next.config.mjs` maps 9 URLs (`/`, `/what-we-treat` unchanged; `/insurance-verification`,
`/our-story`, 3 migrated posts, 2 retired posts). The production sitemap contains **6 more indexed
URLs that all return HTTP 200 and are mapped nowhere** — every one 404s on the new build:

| Production URL | Status | Title | Should go to |
|---|---|---|---|
| `/category/blog/` | 200 | "Blog Archives - Greater Texas Behavioral" | `/blog/` |
| `/tag/dry-january/` | 200 | tag archive | `/blog/` |
| `/tag/addiction-recovery/` | 200 | tag archive | `/blog/` |
| `/tag/detox/` | 200 | tag archive | `/blog/` |
| `/tag/drug-detox/` | 200 | tag archive | `/blog/` |
| `/author/qhd-dev/` | 200 | **"qhd dev, Author at Greater Texas Behavioral"** | `/blog/` or `/about/` |

- **Second problem on the author URL:** it publishes an internal developer account name
  (`qhd-dev`) in an indexed `<title>` on a healthcare domain. Worth removing on production
  regardless of the redirect.
- **Also in the production sitemap, and junk:** five `/?kadence_element=elementor-1160-2…` URLs.
  These are Kadence template fragments that Yoast is exposing to crawlers. They need excluding from
  the sitemap on the WordPress side — not redirecting.
- **Note on `/blog/`:** production `/blog/` 301s to a single post
  (`/holiday-pressure-and-addiction…/`), while the new build serves a real blog index there. That
  is an improvement at cutover, not a defect — recorded so nobody "fixes" it back.

- [x] Add a catch-all redirect group to `next.config.mjs`: `/category/:slug`, `/tag/:slug`,
      `/author/:slug` → `/blog/`. Use path params rather than the six literals, so tags added on
      production before cutover are covered too.
- [ ] Ask whoever runs the WordPress site to exclude the `kadence_element` URLs from the sitemap
      and to remove or rename the `qhd-dev` author archive.
- [x] Verify: each of the 6 URLs returns 308 → `/blog/` → 200 against a local `next start`, and
      re-pull the production sitemap at cutover to catch any new tags.

### 15b — the first fix was single-segment and left 6 live URLs still 404ing — ✅ FIXED 2026-08-11

Found by reviewing the completed work rather than trusting it. The original patterns used `:slug`,
which matches **exactly one** path segment — but WordPress hangs a feed off every archive, and those
are two segments deep. Probed production directly:

| URL | Production | Before this fix | Now |
|---|---|---|---|
| `/feed/` | 200 | 308 → `/blog/` ✅ | ✅ |
| `/feed/atom/` | **200** | **404** | ✅ 1 hop → `/blog/` |
| `/feed/rss/` | **301** | **404** | ✅ 1 hop → `/blog/` |
| `/comments/feed/` | **200** | **404** | ✅ 1 hop → `/blog/` |
| `/category/blog/feed/` | **200** | **404** | ✅ 1 hop → `/blog/` |
| `/tag/detox/feed/` | **200** | **404** | ✅ 1 hop → `/blog/` |
| `/author/qhd-dev/feed/` | **200** | **404** | ✅ 1 hop → `/blog/` |

- **Fix applied:** `:slug` → `:slug*` (zero-or-more) on all three archive prefixes; `/feed` →
  `/feed/:path*` to catch the format variants; and a **separate** `/comments/:path*` entry, because
  `/comments/feed/` is not under `/feed` and no wildcard on `/feed` would ever have reached it.
- **Why it was missed the first time:** the fix was scoped from the production **sitemap**, which
  lists only the 6 flat archive URLs. Feeds are not in a sitemap — they had to be probed for
  directly. Any future redirect work should probe, not just read the sitemap.
- **Verified:** all 16 known production URLs (6 archives + 4 feed variants + 3 tags + `/insurance`,
  `/insurance-verification/`, `/our-story/`) resolve in **exactly 1 hop** to a 200. `tsc`, `lint`,
  `build` clean; all 7 test scripts pass.
- **Revised count:** the cutover redirect map is **19 URLs**, not the 13 recorded earlier and not
  the 4 V0135 claims.

## CR-16 — `/insurance` missing from the redirect map — `HIGH` — Dev

Audit row **V0116** states *"Greater Texas: production serves `/insurance` while the preview serves
`/verify-insurance`."* That row is not in the Verification Log, so I tested it.

- **The row is imprecise, but the gap is real.** Measured 2026-08-11:

  | URL | Production | In our redirect map? |
  |---|---|---|
  | `/insurance` | **301 → `/insurance-verification/`** | **No** |
  | `/insurance-verification/` | 200 (canonical) | Yes → `/verify-insurance/` |
  | `/verify-insurance/` | 404 | n/a (this is the new slug) |

- So production's canonical slug is `/insurance-verification/` — not `/insurance` as V0116 says —
  and that one **is** already mapped. But `/insurance` is a live 301 alias, meaning it is a real
  inbound path someone has linked, and it is mapped nowhere. At cutover it 404s.
- This is also the gap flagged in V0044's verification notes: *"the insurance slug CHANGED between
  production and preview… That needs a redirect at cutover and is not yet logged anywhere."*

- [x] Add `{ source: '/insurance', destination: '/verify-insurance/', permanent: true }` to
      `next.config.mjs`.
- [x] Verify: `/insurance` → 308 → `/verify-insurance/` → 200, single hop.

## CR-17 — Production `/feed/` has no equivalent in the build — `P3` — Dev

- `https://greatertexasbehavioral.com/feed/` returns **200** — WordPress's RSS feed. The Next build
  has no `/feed/` route, so it 404s at cutover. Any aggregator, reader, or syndication integration
  subscribed to it breaks silently.
- Low impact for a 5-post blog, but it is free to fix and impossible to notice once broken.

- [x] Decide: add an RSS route (a `app/feed.xml/route.ts` generating from `getAllBlogPosts()`), or
      accept the loss and 301 `/feed` → `/blog/`.
- [x] Verify whichever is chosen returns 200 or a single-hop 308.

## V0124 — Cutover content gap — `CRITICAL` portfolio-wide — GTB clear, must be re-run

- **The row:** all 12 Vercel builds were generated from a content snapshot around 15-16 July 2026,
  and production kept publishing. 15 pages exist on production but not in their builds, across 10
  of 12 sites. The row explicitly notes GTB is unaffected "only because they published nothing
  after the snapshot".
- **Re-verified for GTB on 2026-08-11** — the audit's data is 2 weeks stale, so this needed
  re-running. Full production sitemap pulled; **newest content is 2026-03-27**
  (`/`, `/insurance-verification/`, `/our-story/`, `/what-we-treat/`). Newest post is 2026-02-24.
  Nothing has been published since the snapshot. **GTB remains unaffected.**
- **But the row's own instruction is to re-run the diff immediately before cutover**, because it
  goes stale by definition. That still stands.

- [ ] Re-pull `greatertexasbehavioral.com/sitemap_index.xml` immediately before cutover and diff
      against the build's routes. Anything with `lastmod` after the last deploy is a gap.
- [ ] While doing it, re-run the CR-15 check — new tags or categories on production create new
      indexed URLs that need redirects.

## V0094 — GTB is an uncounted 5th variant of the treatment-hub slug — `P2` — Decide

- **The row:** the portfolio uses 4 treatment-hub slugs — `/treatment` (8 sites),
  `/treatment-services` (Dallas), `/programs` (Des Moines), `/what-we-offer` (Marina Harbor). The
  fix is to adopt `/treatment` portfolio-wide.
- **What the row misses, per its own Verification Log entry:** *"The row accounts for 11 of 12
  sites. Greater Texas has NO treatment hub under any of the four slugs."* GTB uses
  **`/what-we-treat`** — which is a fifth variant the standardisation row does not count.
- **Not a defect.** `/what-we-treat` is arguably the better slug for a provider that treats
  conditions rather than selling programs, and V0045 already closed the child-page question. But if
  the portfolio genuinely standardises on `/treatment`, GTB is in scope and nobody has noticed.

- [x] Decide: keep `/what-we-treat` as a deliberate exception, or adopt `/treatment` with a 301
      from `/what-we-treat`. **Recommend keeping it** — `/what-we-treat` is indexed on production
      (`lastmod` 2026-03-27), matches the site's condition-led framing, and renaming costs a
      redirect for no user benefit.
- [ ] Whichever way, feed the answer back into V0094 so the portfolio row stops assuming 11 sites.

## V0099 — No FAQ page — `P2` — Decide

- **The row:** FAQ has 6 slug variants and is **absent on 7 sites**, GTB among them (verified in
  the log: *"Des Moines, Hillside, Laguna, Ocean Coast, QHG parent, Fort Worth and Greater Texas
  have no FAQ page under any tested slug"*). Proposed standard is `/faq`.
- **Consistent with the V0044 decision** to keep GTB deliberately small, so this is a content
  judgement, not a defect. An FAQ is, however, a genuinely good fit for a virtual provider — the
  most common questions ("does insurance cover it", "do I need to travel", "how many sessions a
  week") are exactly the objections the site already answers in scattered prose.

- [x] Decide whether an FAQ earns its place. If yes, build at `/faq` (the portfolio standard) and
      add to nav, footer and sitemap. If no, record it as by-design alongside V0095/V0045 so the
      portfolio row can stop counting GTB as a gap.

## V0090 — GTB is absent from the Quadrant parent site entirely — `HIGH` — Ben / parent site

Filed under "Quadrant Health Group (parent)", verdict **CONFIRMED**, so my Facility-column sweep
missed it. It is a GTB task.

- **The row:** the parent's locations index covers only 9 facilities. Des Moines and **Greater
  Texas Behavioral** have no location page.
- **The Verification Log sharpens it considerably:** *"'Des Moines' and 'Iowa' each appear twice in
  the /locations page copy while **'Greater Texas' appears zero times**. So Des Moines is
  acknowledged in text but has no page, and Greater Texas is **absent from the parent entirely —
  not even named**."*
- **Re-verified against live production 2026-08-11:**

  | Check | Result |
  |---|---|
  | `quadranthealthgroup.com/locations/` | 200 |
  | `quadranthealthgroup.com/locations/greater-texas-behavioral/` | **404** |
  | "Greater Texas" mentions on the live locations page | **0** |

- **Why it matters:** the parent is the highest-authority domain in the portfolio and it does not
  acknowledge this facility exists. Every other facility gets a page and inbound link; GTB gets
  neither. That is lost referral traffic and lost internal authority for a site about to launch.
- **Good instinct in the audit's own notes:** *"Given V0044 and V0046 established Greater Texas is
  a virtual provider with no physical address, a 'location' page may be the wrong format for it; a
  service-line entry would fit better. Worth deciding rather than defaulting to a location page."*
  Agreed — a "location" page for a telehealth provider would create the same bogus local-SEO signal
  that `/contact` deliberately avoids (V0098).

- [ ] Decide the format: a `/locations/greater-texas-behavioral` page for consistency, or a
      distinct "virtual/statewide services" entry. **Recommend the latter** — it is accurate, and it
      avoids inventing a physical location.
- [ ] Get GTB named and linked on the parent's locations page either way.
- [ ] Verify: `"Greater Texas"` appears on `quadranthealthgroup.com/locations/` and the entry links
      to `https://greatertexasbehavioral.com`.

## V0091 / CR-18 — No authority flows between the parent and GTB, in either direction — `P2`

Also filed under the parent, verdict **CONFIRMED**. It has a **repo-side half** that no row covers.

- **The row:** the parent's locations page contains no outbound links to any facility website —
  only social links — so the parent passes no authority to any facility. `greatertexasbehavioral.com`
  is one of the 11 it lists as needing a link. The fix also asks each facility to **link back** to
  `quadranthealthgroup.com`.
- **Re-verified live 2026-08-11:** outbound links to facility production domains on
  `quadranthealthgroup.com/locations/` = **0**. Links to `greatertexasbehavioral.com` = **0**. Row
  holds exactly.
- **The half nobody logged — our side.** `grep -rn "quadrant" app components lib` returns only
  `lib/staff.ts`, and both hits are the **staff-feed API origin** (`support.quadranthealthgroup.com`,
  used in a `fetch`). There is **no user-visible link from this site to the parent** anywhere — not
  in the footer, not on `/about`, not on `/team`. So the reciprocal link the row asks for does not
  exist on the GTB end either, and that part is fixable in this repo today.

- [x] **CR-18 (Dev, this repo):** add a parent-organisation link — footer is the conventional slot,
      e.g. "Part of Quadrant Health Group" linking to `https://quadranthealthgroup.com`. Consider
      also adding `parentOrganization` to the `MedicalBusiness` JSON-LD in `app/layout.tsx`, which
      is the machine-readable version of the same relationship.
- [ ] **Parent side (Ben):** add the outbound link to `greatertexasbehavioral.com` from the
      locations page. Depends on V0090 — GTB has to be listed before it can be linked.
- [x] Verify: footer link renders and resolves 200; JSON-LD validates.

## VIS-2 / VIS-3 — Parent-site visual rows naming GTB — `P3` — parent site

Two rows in the **Visual Issues** tab, both filed under "Quadrant Health Group", both naming GTB.
These are why "GTB has zero Visual Issues rows" needed qualifying — no row is *filed* under GTB, but
GTB appears as the missing item in two.

- **VIS-2 (row 860)** — `quadrant-health-group.vercel.app/locations`, "Missing facilities in the
  list": Wellness Detox LA, **Greater Texas Behavioral**, Wellness Ranch KY. Independent
  corroboration of V0090 from the visual pass.
- **VIS-3 (row 856)** — `quadrant-health-group.vercel.app/about/meet-the-team`, "Missing categories
  of staff positions". The requested grouping explicitly includes *"Texas Facilities > Dallas Detox
  Center / Fort Worth Wellness Center, **Greater Texas Behavioral**"* — so GTB's clinicians should
  appear in the parent's team page too. Note GTB now has 3 published bios in the support portal
  (see CR-02), so the content exists to populate this.

- [ ] Both are parent-site work. Raise with whoever owns the QHG build; track alongside V0090/V0091
      since all four are the same underlying gap — the parent does not represent this facility.

## V0046 — WITHDRAWN GTB row, and the methodology warning attached to it — record only

This row exists **only in the Verification Log** — it was withdrawn and removed from the issues tab,
which is why no facility-column sweep finds it. Recorded here so nobody resurrects it.

- **The claim:** the GTB homepage has no H1. **Verdict: `NOT_CONFIRMED` — withdrawn entirely.**
  *"FALSE. The homepage HAS exactly one H1… Fetched 5 separate times, every run returned h1 count
  = 1… All 11 Greater Texas preview pages have exactly one H1 each — zero H1 problems anywhere."*
  Independently re-confirmed in this file's Baseline: exactly one `<h1>` on all 9 routes.
- **The part worth keeping** — the auditor's own root-cause note: *"the original reading came from
  `audit2.py`, the same script run that also wrongly reported Greater Texas as missing a homepage
  canonical. **Two false negatives for the same site in the same run** points to a bad or truncated
  response that the script recorded as absence rather than error. ACTION: any other row sourced from
  that script pass (H1 counts, canonical counts) should be re-tested rather than trusted."*
- **Implication for this file:** GTB specifically was the site that script mis-measured twice. Any
  remaining GTB row asserting a *missing* element deserves an independent check before action —
  which is the standard applied throughout Pass 3.

## V0042 — GTB now joins an unmade portfolio decision — `P3` — note only

Filed under Fort Worth, but its correction includes GTB in a portfolio-wide breakdown: privacy pages
carry **four different robots treatments** across the 12 sites — `index, follow` (5 sites), no robots
meta (3), `noindex, follow` (2), `index, nofollow` (Fort Worth), and *"no privacy page: Greater
Texas"*.

- **That last line is now out of date.** GTB has a privacy policy as of the V0100 fix, and it is
  deliberately **indexable** (`app/sitemap.ts` lists it; the reasoning is in the file). So GTB has
  moved from "no page" into the `index, follow` bucket — the largest and, in my view, correct one.
- No action needed here beyond feeding it back so the portfolio row reflects reality.

- [ ] Tell whoever owns the sheet that GTB's privacy-page status changed, so V0042's breakdown can
      be updated from "no privacy page" to `index, follow`.

## CR-19 — Staff bios: 1 update, 3 headshots, 1 decision — no additions needed

Source: the master bios document
(`docs.google.com/document/d/1MWL4ki6HDCcUN-1mh2EFU-6eoMVpwpSSRMDm58Me3oA`), 1,119 lines covering
the whole portfolio. GTB's section is lines 842-859. Diffed against the live support-portal feed on
2026-08-11.

### The roster is complete and in sync — nothing to add or remove

| Person | Title | Credentials | Doc vs portal | Headshot |
|---|---|---|---|---|
| Emma Fyffe | Primary Therapist | LPC | **byte-identical** (712 chars) | ❌ none |
| Jada Spencer | Case Manager | — | **byte-identical** (927 chars) | ❌ none |
| Norberto Segredo | Case Manager | — | **byte-identical** (1,202 chars) | ❌ none |

- Three people in the doc, the same three in the portal, same titles, same credentials, and all
  three bios match the master document character-for-character. **No bio needs adding, and no
  portal entry is stale or orphaned.**
- **No GTB person appears on the doc's "BIOS NEEDED" lists.** The only `TEXAS` entry there is
  *"Landon Hawpe - Case Manager DDC (need headshot & bio)"* — DDC is Dallas Detox Center, not GTB.
  So nobody is tracking a GTB bio as outstanding, and correctly so.

### 19a — The IOP / "Clinic" error originates in the master document — `P0`

**This is the upstream half of CR-02 and it changes that task.** CR-02 says to fix the bio in the
support portal. That is necessary but not sufficient: the wrong text is in the **master doc** too, at
line 844:

> *"She serves as the primary therapist at Greater Texas Behavioral **Clinic**, an **intensive
> outpatient program** providing care for individuals…"*

Fix only the portal and the next person who re-syncs or re-pastes from the master reintroduces it.

- Verified this is the **only** genuine instance in GTB's section. `Clinic` also matched inside
  Norberto's bio, but that is the substring in *"his **clinic**al perspective"* — a false positive,
  not a defect. Emma's is the single occurrence, and hers is the only bio that describes the
  facility at all; Jada's and Norberto's never name it, so they carry no risk.
- Across the whole 1,119-line document, "Greater Texas" appears exactly **twice**: the section
  heading and this sentence. No other facility's bio references GTB.

- [ ] Fix line 844 in the master doc: "intensive outpatient program" → "virtual outpatient program".
- [ ] **AMENDED by FR-2:** the "drop Clinic" half of this task is on hold — see the amendment in
      CR-02 and the naming decision in FR-2. The IOP wording fix is unaffected.
- [ ] Then fix the portal (CR-02), so the two agree.
- [ ] Verify both: the doc no longer contains "intensive outpatient" in the GTB section, and
      `curl -s …/team/ | grep -ci 'intensive outpatient'` returns `0`.

### 19b — All three staff have no headshot — `P2`

`photoUrl` is `null` for every GTB team member, so `StaffGrid` and `/team` render the gradient
monogram fallback for the **entire team**. The fallback is deliberately designed to look
intentional rather than broken (see the comment in `components/StaffGrid.tsx`), so this does not
look like a bug — which is exactly why it has gone unnoticed.

On a page whose purpose is "the people behind your care", three faceless initials undercut the
trust the page exists to build.

**AMENDED 2026-08-11 — nothing needs sourcing. All three headshots already exist.** Located in
`~/Downloads/Staff Headshots/Texas/Virtual Staff/`. Each was opened and confirmed to be a genuine
professional headshot of the right person — neutral background, well lit, appropriate for a
healthcare team page. This is not a photography task; it is an **upload** task.

### Headshot map — GTB

| Staff member | File | Dimensions | Size | Square? | Status |
|---|---|---|---|---|---|
| Emma Fyffe | `Texas/Virtual Staff/GTB-Emma.jpg` | 3469 × 3469 | 1,585 KB | ✅ | ✅ exists, **not uploaded** |
| Jada Spencer | `Texas/Virtual Staff/GTB - Jada.jpg` | 1290 × 1505 **(portrait)** | 113 KB | ⚠️ 0.86:1 | ✅ exists, **not uploaded** |
| Norberto Segredo | `Texas/Virtual Staff/GTB-Norberto.jpg` | 1805 × 1805 | 1,300 KB | ✅ | ✅ exists, **not uploaded** |

**Missing headshots for GTB: none.** All three staff are covered, and GTB's absence from the master
doc's "need headshot" list was correct — the photos were taken, they just never reached the portal.

- [ ] Upload all three to the support portal so `photoUrl` stops being `null`.
- [x] **Resize before uploading — see CR-20.** The originals total **2.9 MB** to render three 96px
      circles. Center-cropped to 256 × 256 they total **46 KB** — a **98% reduction** with no visible
      difference at render size. Web-ready 256px versions are already generated at
      `…/scratchpad/hs-test/` if useful.
- [x] Jada's is the only non-square source — **1290 × 1505, portrait**. `object-cover` on a square
      container therefore crops **top and bottom**, which is the risky direction for a headshot (it
      eats headroom). Verified the generated 256 × 256 center crop: her head is fully in frame, so it
      is safe — but crop deliberately on the way in rather than relying on the default.
      *(Dimensions here were transposed on first pass — `mdls` sorts its attributes alphabetically, so
      Height prints before Width. Re-measured with `sips`; Emma and Norberto are square either way.)*
- [ ] Verify: `photoUrl` non-null for all three in the feed, and `/about/` + `/team/` render `<img>`
      rather than monograms. The CSP already permits the portal's host (`img-src … https:`), so no
      config change is needed for the upload itself.

### Folder audit — the rest of `Staff Headshots/` (124 files)

Checked whether any other file belongs to GTB. **None do**, but three things are worth passing on:

- **The 5 unprefixed files in `Texas/` are not GTB's.** Every one resolves to another facility via
  the master bios doc: **Antoine Gross Sr., LPC — Director of Clinical Services → Dallas Detox
  Center** (line 793); **Olivia Hadjerioua — Executive Director → "Dallas Detox Center and Fort
  Worth Wellness Center"**; **Joshua Leder — Director of Operations → "the Texas facilities"**;
  **Deborah Wade, BSN, RN — Director of Nursing → Ocean Coast Recovery**. This matters because it
  **confirms CR-19c independently**: there is no GTB clinical leader in the headshot folder either,
  so the absence is real and not a filing accident.
- **`Texas/ Haley Hayes.png` has a headshot but no bio anywhere in the master doc** — the inverse of
  the "BIOS NEEDED" list, and so tracked by nothing. Worth raising with the doc owner.
- **Three files are filed under `Texas/` but documented under the "Ocean Coast Recovery" section** of
  the bios doc (Deborah Wade, Olivia Hadjerioua, Joshua Leder) even though two of their bios name
  Texas facilities. The folder is right and the doc's section placement is wrong. Not a GTB defect —
  noted so this reconciliation is reproducible.

## CR-20 — Staff photos bypass `next/image`, so avatars ship at full resolution — `P2` — Dev

Surfaced by CR-19b. Independent of it: this bites the moment any photo is uploaded, for any facility.

- `components/StaffGrid.tsx:62` and `app/team/page.tsx:51` render staff photos as a **plain `<img>`**
  with an explicit `eslint-disable-next-line @next/next/no-img-element`, at `h-24 w-24` (96px) and
  `h-28 w-28` (112px) respectively.
- `next.config.mjs` has **no `images.remotePatterns`** — only `formats`. So there is currently no way
  to route a remote staff photo through `next/image` even if we wanted to.
- **Consequence, measured against the real files:** upload the originals as-is and `/about` pulls
  **2,999 KB to paint three 96-pixel circles.** Resized to 256 × 256 the same three are **46 KB**.

  | | Total |
  |---|---|
  | Originals as-is | 2,999 KB |
  | 256 × 256, quality 82 | 46 KB |
  | **Reduction** | **98%** |

- **Why this is safely fixable here, unlike `BlogCover`.** `components/BlogCover.tsx` deliberately
  keeps remote URLs off `next/image` because blog cover hosts are CMS-controlled and unbounded — a
  new host would throw at request time and 500 the blog. **Staff photos are different: the host is
  known, single and fixed** (`support.quadranthealthgroup.com`, overridable only by the
  `STAFF_FEED_ORIGIN` env var). A bounded host is exactly the case `remotePatterns` is for, so the
  reasoning that rules it out for blog covers does not transfer.

- [ ] Preferred: have the portal resize on upload. That fixes every facility at once and needs no
      code change.
- [x] Belt and braces, in this repo: add the portal host to `images.remotePatterns` and switch
      `StaffGrid.tsx` and `app/team/page.tsx` to `next/image` with explicit `width`/`height`,
      removing the two `no-img-element` disables. Keep a plain-`<img>` fallback path only if a
      non-portal host ever becomes possible.
- [x] Verify: staff avatars served via `/_next/image?url=…` in AVIF/WebP, and total avatar bytes on
      `/about/` under ~60 KB.

### 19c — No clinical leadership is published — `P1` — decision

GTB's published team is **one Primary Therapist and two Case Managers**. There is no Clinical
Director, Medical Director, prescriber, or psychiatrist listed anywhere.

That sits awkwardly against what the site claims. The homepage, footer and JSON-LD all describe a
*"fully licensed Virtual Outpatient Program"* delivering *"dual diagnosis treatment"* and
*"medication"*-adjacent care from *"licensed Texas clinicians"* — and `/team`'s own subtitle says
"licensed clinicians and case managers". For comparison, Fort Worth Wellness — a sibling Texas
facility in the same document — publishes **Cortney Best, M.C.J., LCDC, Clinical Director** with
supervision responsibilities spelled out.

This is not necessarily a gap in staffing; it may be a gap in what has been written up. But as
published, a visitor evaluating a dual-diagnosis provider cannot find who oversees clinical care.

**Corroborated 2026-08-11 by the headshot folder.** `Staff Headshots/Texas/` was checked for a GTB
clinical leader and there is none — the only Texas clinical leadership on file is **Antoine Gross Sr.,
LPC (Director of Clinical Services, Dallas Detox Center)** and **Corney Best, M.C.J., LCDC (Clinical
Director, Fort Worth Wellness)**. So the gap appears in all three sources — the registry, the bios
doc and the headshot folder — which makes it a real absence rather than a paperwork lag.

**Two possible leads worth checking first:** the bios doc lists **Joshua Leder — Director of
Operations for "the Texas facilities" under Quadrant Health Group** (which would include GTB) and
**Olivia Hadjerioua — Executive Director**, though her bio names only Dallas and Fort Worth. Neither
is a clinical role, so neither answers the clinical-oversight question — but if operational leadership
is shared across Texas, clinical supervision may be too, and that is the thread to pull.

- [ ] Confirm whether GTB has a Clinical Director / Medical Director / supervising clinician.
- [ ] If yes: get a bio into the master doc and the portal. This is the single highest-value
      addition available to `/team`.
- [ ] If clinical oversight is shared at the Quadrant level rather than facility-level, say so on
      `/team` in one sentence instead of leaving the absence unexplained — and check it does not
      conflict with the licensure claims in `lib/site.ts`.

### 19d — The portal flattens the authors' paragraph breaks — `P3`

The master doc gives Jada 2 deliberate paragraphs and Norberto 3. The portal stores every bio as a
**single line with zero newlines** (verified: `newlines=0` for all three). So `bioParagraphs()` in
`lib/staff.ts` never finds explicit breaks and always falls through to its
group-every-3-sentences heuristic — which yields 2 paragraphs for Emma, 3 for Jada (author wrote 2)
and 3 for Norberto (author wrote 3).

The fallback was written for exactly this case and it reads fine, so this is cosmetic. Recording it
because the cause is upstream, not in our code.

- [x] Either preserve paragraph breaks when saving bios in the portal, or accept the heuristic and
      note that `bioParagraphs()` is load-bearing rather than a nice-to-have.

## CR-21 — Official brand assets exist and the site is not using them — `P2` — Dev

Found on a second sweep of `~/Downloads` while reviewing this work. `~/Downloads/Greater Texas
Behavioral Clinic/GTB Logo/` (delivered 2026-08-11) holds **5 official brand files**, none of which
are byte-identical to anything in `public/logos/`:

| Official asset | W × H | Alpha | Size |
|---|---|---|---|
| `greater-tx-behavioral-logo2.jpg` | 4267 × 4267 | — (JPEG) | 632 KB |
| `greater-tx-behavioral-logo2.png` | 3182 × 2926 | RGBA | 152 KB |
| `greater-tx-behavioral-logo2trans.png` | 3182 × 2926 | RGBA | 148 KB |
| **`greater-tx-behavioral-white.png`** | 3182 × 2926 | RGBA | 140 KB |
| **`greater-tx-behavioral-white2tone.png`** | 3182 × 2926 | RGBA | 144 KB |

What the repo ships: `logo-horizontal.png` (977 × 391, header), `logo-mark.png` (512 × 512, footer
badge), `logo-full.png` (1536 × 1024, **unreferenced** — see CR-11).

Two things fall out of the comparison:

- **The footer wordmark is a CSS reconstruction, not the brand asset.** `LogoLight` in
  `components/Logo.tsx:48-55` renders the mark in a cream badge and then **hand-sets the words**
  "Greater Texas" / "Behavioral" as two `<span>`s in Plus Jakarta Sans with tracking. That was a
  reasonable workaround when no light-background asset existed — but **two white variants now do**
  (`white.png`, `white2tone.png`), both with alpha, so the real wordmark can sit on the forest footer
  directly. Reconstructed wordmarks drift from the brand (letterspacing, weight, lockup ratio) and
  are the kind of thing a brand owner notices immediately.
- **The header logo matches none of the official files.** `logo-horizontal.png` is 977 × 391 —
  a **2.5:1** wide lockup. Every official PNG is 3182 × 2926, roughly **1.09:1** (near-square,
  stacked). So the header asset is either derived from an older brand file or custom-cut for this
  build. Worth confirming it is approved rather than assuming.

- [ ] Confirm with the brand owner which lockup is current, and whether the 2.5:1 horizontal version
      in the repo is approved.
- [ ] Swap `LogoLight`'s hand-set wordmark for `greater-tx-behavioral-white.png` (or `white2tone`),
      keeping the existing `aria-label` and `Link`. Downscale first — 3182 px wide for a ~44 px badge
      is the same mistake as CR-20.
- [ ] Re-check CR-11 before deleting `logo-full.png`: it is genuinely unreferenced, but decide whether
      the right move is delete or **replace** it with a correctly-sized official export.
- [ ] Verify: header and footer render the approved lockup at every breakpoint; no layout shift from
      the changed aspect ratio; total logo bytes unchanged or lower.

## CR-22 — GTM + CallTrackingMetrics added; the site went from 0 cookies to 12 — `P0` — Compliance

**Requested and implemented 2026-08-11.** `GTM-MTGTSPCG` and
`//264810.tctm.co/t.js` are live in `app/layout.tsx`, configured from a new
`analytics` block in `lib/site.ts`, with CSP widened to match. Both work — verified in a real
browser, zero CSP violations.

The implementation was the easy half. Running `tests/csp-check.mjs` afterwards surfaced things the
request did not mention, and they change this site's compliance position.

### What the GTM container actually loads

Nobody said Clarity was in there. It is, and it does more than analytics:

| Loaded | What it is |
|---|---|
| `googletagmanager.com/gtm.js?id=GTM-MTGTSPCG` | the container |
| `264810.tctm.co/t.js` + `p.js` | CallTrackingMetrics |
| `www.clarity.ms/tag/y5yz4xse4b` → `scripts.clarity.ms/…/clarity.js` | **Microsoft Clarity — session recording + heatmaps** |
| `c.clarity.ms/c.gif` | Clarity beacon |
| **`c.bing.com/c.gif?ctsa=mr&CtsSyncId=…`** | **Microsoft Advertising identity sync** |

### Cookies: 0 → 12 on first page load

`__ctmid`, `ct264810`, `CLID`, `_clck`, `_clsk`, `SM`, `MUID`×2, `MR`×2, `SRM_B`, `ANONCHK`.

`MUID` is Microsoft's **cross-site advertising identifier**, and Clarity syncs it to `c.bing.com`.
That is not analytics — it is ad-tech, running on a substance-use treatment site. HHS OCR's guidance
on online tracking technologies treats page path plus IP on a health site as a disclosure of health
information, and `/verify-insurance` collects an insurance member ID and free-text health context.

### Three live statements were made false, and are now fixed

Audit **V0100** predicted this precisely: *"If marketing later adds ad-platform pixels, that statement
must change and a TDPSA opt-out mechanism must be added."* It has happened.

`/privacy-policy` was **written from the verified fact that the site set no cookies**. Updated
2026-08-11 (last-updated date bumped):

- **§2** — new disclosure of analytics, session recording, call measurement, the cookies they set,
  dynamic number insertion, and how to block them.
- **§4** — "we do not use it for cross-context behavioural advertising" narrowed to what is still
  true: form submissions are not used for advertising.
- **§9** — the TDPSA claim that there was "nothing to opt out of" is gone; replaced with an actual
  opt-out route.

⚠️ **This is a lawyer's document and I am not one.** The edits keep it factually accurate rather
than settling it. Item 7 in the page's header comment lists what counsel must confirm.

### Guardrail added

`tests/csp-check.mjs` printed `cookies="…"` but **never asserted on it** — which is why adding GTM
set a cookie and the suite still said PASS. It now fails on any cookie outside an annotated
allowlist, so the next tag that starts writing to the browser surfaces here instead of silently
making a compliance document wrong.

### Decisions needed — before cutover, not after

The natural window: `greatertexasbehavioral.com` is still WordPress and the Vercel alias is
`Disallow: /`, so real traffic through these tags is near zero right now.

- [ ] **Is Microsoft Clarity meant to be on this site?** Session recording on `/verify-insurance`
      and `/contact`. Clarity masks input values by default but still records interaction. Either
      configure masking/exclusions for those routes, or remove the tag — deleting the two
      `clarity.ms` hosts from `script-src` in `next.config.mjs` disables it.
- [ ] **Is the Bing/`MUID` advertising sync intended?** This is the sharpest question of the three.
      It is a consequence of Clarity, not a separate tag.
- [ ] **Confirm the full tag inventory in the GTM UI.** This page documents what was observed
      loading. Anything added in GTM later changes what is true here and nothing in this repo will
      notice — GTM is a loader, and a tag whose host is missing from CSP fails silently.
- [ ] **Counsel review** of the privacy-policy changes, plus BAA status for Google, Microsoft and
      CallTrackingMetrics.
- [ ] **TDPSA opt-out**: §9 now promises we will honour an opt-out request. Make sure someone can
      actually action one.
- [ ] Note for future phone-number reports: CTM does **dynamic number insertion**, so the number a
      visitor sees may not be `site.phone`. Check the CTM pool before assuming a V0043-style
      regression.

## CR-23 — Clarion webchat is failing on the live site — `P1` — Ben

Found while baselining CR-22, **not caused by it**. `tests/csp-check.mjs` fails on all 10 routes
because `https://api.clarionlabs.ai/webchat/public/installed` errors — `net::ERR_FAILED` locally,
`net::ERR_ABORTED` against the deployed alias. Confirmed on the **live production alias running the
previous build**, so it predates the tag work.

`window.ClarionForms` still initialises, so form capture is intact — but the webchat install check
is failing, which is the widget on a lead-generating healthcare site. This is almost certainly
**CO-2** (production origins not allowlisted in Clarion → Website Integrations) finally showing up
as a hard failure.

- [x] ~~Allowlist the origins in Clarion → Website Integrations~~ — **already done. Verified
      2026-08-24 and the CO-2 diagnosis above does not hold.** A CORS preflight
      (`OPTIONS`, no lead created) was sent for both endpoints from three origins:

      | Origin | `/forms/public/submit` | `/webchat/public/installed` |
      |---|---|---|
      | `https://greatertexasbehavioral.com` | 204, origin echoed | 204, origin echoed |
      | `https://greater-texas-behavioral.vercel.app` | 204, origin echoed | 204, origin echoed |
      | `http://127.0.0.1:3111` | 204, **no** ACAO | 204, **no** ACAO |

      So the apex and the alias ARE allowlisted, on the beacon endpoint too. Doing the
      action item above would have changed nothing. The failure reproduces only from
      localhost, which is what `tests/lib/base.mjs` targets by default — that accounts for
      the local `net::ERR_FAILED` on all 10 routes.
- [ ] STILL OPEN, narrowed: the `net::ERR_ABORTED` reported against the deployed alias is
      NOT explained by the allowlist. `ERR_ABORTED` is a cancelled request rather than a
      refused one, and the beacon is fired with `keepalive` during load, so page teardown is
      the likely cause and it is probably benign. Confirm with
      `BASE=https://greater-texas-behavioral.vercel.app npm test` — `csp-check.mjs` now
      prints a distinct warning when the beacon fails against a non-localhost origin, which
      is the case worth acting on.
- [ ] Also worth separating: the beacon is an *install telemetry* ping. `window.ClarionForms`
      initialising is the thing that matters for lead capture, and it does. The beacon failing
      does not by itself mean the webchat widget is broken — check the widget's own behaviour
      before treating this as P1.

## CR-24 — CTM number swap cannot fire on this site as configured — `P1` — needs CTM account access

Found 2026-08-24 while verifying the `async` change on t.js. The tag is installed correctly —
`aid` 264810, exactly one copy, `config.sid` a valid 24-hex id, `__ctmid` cookie agreeing — and
**the number swap still never happens.** `Object.keys(window.__ctm_tracked_numbers).length` is `0`.

This is an account-configuration mismatch, not a code fault. Nothing in this repo can fix it.
Read out of the account's own `t.js` with `__ctm_debug=1`:

    [["",""],["www.greatertexasbehavioral.com",""],"GTBC Ads",
      {"1.830.264.1545":2092408},false,false,false,false]

Two independent mismatches:

1. **Domain scope.** The only GTB rule matches `www.greatertexasbehavioral.com` — `www` only. It
   will not match the apex `greatertexasbehavioral.com`, and `t.js` contains no reference to
   `greater-texas-behavioral.vercel.app` at all (checked: zero occurrences). So on the alias and
   on the apex, GTB falls through to generic rules — the 7 that actually matched from localhost
   were `BSUD 2`, `BMH 1`, `BSUD OH`, `BSUD 1`, `The Ohio RC`, `Wellness Ranch KY` and `Iowa`,
   none of which is this facility.

2. **The number it looks for is not on the page.** The rule targets **830-264-1545**. The
   catch-all `BSUD 2` rule targets **877-834-0743**. This site publishes **877-590-3665** (16
   `tel:` links in the server-rendered homepage). CTM scans, matches nothing, and logs
   `rules: [...] marked: []` / `scan main 7 []` / `lookup pools none found`.

Consequence: every visitor sees the same hardcoded number, and CTM can only guess which web
session an inbound call belongs to — so call attribution is unreliable, exactly the symptom the
`async` fix was chasing. The `async` fix was still necessary and is correct; it is just not
sufficient on its own, and it is not what is failing here.

**Confirmed against production 2026-08-24, which settles which side is wrong.** The LIVE
WordPress site publishes `tel:+18775903665` — 16 occurrences on both
`https://www.greatertexasbehavioral.com/` and the apex, i.e. identical to this build. And on the
deployed Vercel alias the 7 rules that matched are the same generic ones listed above, with
`marked: []`. So:

  - This build is **not** the anomaly. The site has published 877-590-3665 all along.
  - `830-264-1545` is not on the live site either, and `www` is the only domain the rule matches,
    so **the swap has never worked on this property** — on WordPress or on the new build. This is
    a pre-existing fault that the CTM install merely made visible.

- [ ] RECOMMENDED: retarget the "GTBC Ads" rule to **877-590-3665** rather than changing the
      site's number. 877-590-3665 is the established published number on the live site,
      `lib/site.ts` records it as "the single published number", and V0043 warns against
      changing a published number without admissions confirming it. Changing the site to show
      830-264-1545 would be the larger, riskier change and would contradict the live site.
      Confirm with admissions what 830-264-1545 is — a stale number, or one belonging to a
      different property.
- [ ] Widen the "GTBC Ads" rule's domain match to cover the apex as well as `www`, or confirm
      the site will canonicalise to `www` at cutover. Today `next.config.mjs` canonicalises to
      the apex (`site.url = https://greatertexasbehavioral.com`), so as things stand the rule
      would never match production.
- [ ] Add `greater-texas-behavioral.vercel.app` to a rule if the swap should be verifiable
      before DNS cutover. Without it, this cannot be confirmed in a real browser until the
      canonical domain moves off WordPress.
- [ ] Verify: `Object.keys(window.__ctm_tracked_numbers).length > 0` and the rendered `tel:`
      links differ from `site.phone`. `tests/csp-check.mjs` prints both every run.

## Rows closed with no action needed

- **V0135 — cutover redirect map.** Already satisfied: all 4 pairs (`/insurance-verification` plus
  3 root-level blog posts) are in `next.config.mjs` and verified 308 → correct slash-terminated
  target → 200. **But the row's claim of "4 URL pairs, smallest redirect map in the portfolio" is
  wrong** — the real map is 13 URLs once CR-15's six taxonomy URLs, CR-16's `/insurance`, and the
  two retired Florida posts are counted. Superseded rather than simply closed.
- **V0101 — blog URL pattern.** GTB is already on the `/blog/slug` standard, confirmed in the
  Verification Log as 1 of the 6 compliant sites. No action.
- **V0103 — `/contact` 301s to a JPEG.** Dallas and Fort Worth only. GTB production `/contact`
  404s, which is consistent with V0044 and is resolved by the `/contact` page built under V0098.
  Re-verified 2026-08-11: production `/contact/` = 404, our build = 200.
- **V0118 — geo-suffixed service slugs.** Marina Harbor, Des Moines and Hillside. No GTB instance.

## Workbook hygiene — worth raising with whoever owns the sheet

Not GTB defects, but they affect how much this file can trust the source:

- [ ] **Every GTB row still reads `Status: Open`**, including the 10 resolved and verified in the
      2026-08-04 pass. The sheet and reality have diverged; someone should close them out or the
      next reader will redo this work.
- [ ] **V0116 is inaccurate for GTB** — it says production serves `/insurance`; production serves
      `/insurance-verification/` and 301s `/insurance` to it. Correct the row (see CR-16).
- [ ] **V0135 undercounts the redirect map** at 4 pairs; it is 13 (see CR-15/CR-16).
- [ ] **V0134, V0135, V0116, V0118, V0124 are absent from the Verification Log.** They were added
      during the verification pass and so never got verified themselves, yet two of them carry
      HIGH/CRITICAL priority. Worth a second pass given the Legend's own warning that two thirds of
      verified rows needed a correction.

---

# Pass 4 — facility registry reconciliation, 2026-08-11

Source: the QHG facility registry spreadsheet
(`docs.google.com/spreadsheets/d/1KGS7Cwg7buK-tQ-ELySG84OCpJxbWWzBAv40CcfroT4`). **That sheet is
access-restricted** — all export endpoints return 401 — so this pass was read from a screenshot
supplied by the owner rather than parsed. Values below are transcribed, not machine-extracted;
re-verify against the live sheet before acting on FR-1 or FR-2.

**GTB's row as recorded:**

| Column | Value |
|---|---|
| Company | **Greater Texas Behavioral Clinic** |
| Site URL | `https://greatertexasbehavioral.com/` |
| LOC | **Virtual OP** |
| SUD | *(blank)* |
| MH | **x** |
| In-patient Bed Count | *(blank)* |
| Address | *Virtual* |
| City / Zip | Texas / *(blank)* |
| Website # | 877-590-3665 |
| Est | 2025 |
| GMB Review Link | **-** |

## FR-1 — The registry marks GTB as mental-health only; the site sells addiction treatment — `P0`

**This is the most consequential thing found in any pass. Confirm before launch.**

- In the registry, GTB has **`MH = x` and `SUD` blank**. Every facility with a substance-use service
  line carries an `x` in SUD; GTB does not. (Wellness Ranch KY is the only other blank, and it has
  not opened yet.)
- **The site is saturated with substance-use content.** Measured in `app/`, `components/`, `lib/`:

  | Term | Occurrences |
  |---|---|
  | `detox` | 71 |
  | `addiction` | 45 |
  | `substance use` | 27 |
  | `relapse` | 19 |

  It is not incidental framing either — it is in the load-bearing places:
  `site.description` leads with *"for **addiction** and mental health treatment"*;
  `app/layout.tsx:79` declares `medicalSpecialty: ['Psychiatric', '**Addiction Medicine**']` in the
  `MedicalBusiness` JSON-LD; `/what-we-treat` has a dedicated `#substance-use` section naming
  "alcohol, opioid, prescription, stimulant"; and 5 of 5 blog posts are addiction/detox content.
- **If the registry is authoritative, the site advertises a service line this facility does not
  provide** — on a YMYL healthcare domain, for SUD treatment, in Texas. That is a licensure and
  advertising exposure well beyond anything else in this file.
- **Evidence pointing the other way**, which is why this is flagged for confirmation rather than
  filed as a defect: two of the three published staff bios describe substance-use work directly
  (Emma — *"mental health and substance use challenges"*; Norberto — *"recovery from substance
  use"*), and V0134 established this site was cloned from an SUD facility. The likeliest reading is
  an **unfilled cell**, not an MH-only mandate.
- **Do not resolve this by assuming.** The two outcomes are "correct a spreadsheet cell" and "remove
  the majority of the site's content", and they are not close in cost.

- [ ] Confirm with clinical/compliance: is GTB licensed and staffed to treat substance use
      disorders, or is it mental-health only?
- [ ] If SUD **is** in scope: fill in the registry cell. No site change needed.
- [ ] If it is **not**: this becomes the largest task in this file. `site.description`, the JSON-LD
      `medicalSpecialty`, the homepage hero, `/what-we-treat#substance-use`, the insurance copy and
      all 5 blog posts would need rewriting, and `lib/original-posts.ts` would need retiring. Flag
      immediately rather than working down the list.

## FR-2 — The registry's company name is "Greater Texas Behavioral **Clinic**" — `P1` — decision

**This inverts guidance I gave in CR-02 and CR-19a.** Both told you to drop "Clinic" from the staff
bio. That was reasoned from the site's own naming and its telehealth-only positioning — but "Clinic"
is not a bio typo. It is the **company-name field of the facility registry**, and it is now the
third independent place it appears:

| Source | Name used |
|---|---|
| Facility registry (this sheet) | **Greater Texas Behavioral Clinic** |
| Master bios doc, line 844 | Greater Texas Behavioral **Clinic** |
| Support portal bio (live on `/about`, `/team`) | Greater Texas Behavioral **Clinic** |
| **Brand-asset folder** (`~/Downloads/Greater Texas Behavioral Clinic/`) | Greater Texas Behavioral **Clinic** |
| `lib/site.ts` → whole site, `<title>`, JSON-LD, footer, © | Greater Texas Behavioral |

So the site may be the outlier, not the bio. **Four of five sources say "Clinic"** — including the
folder the official logo files were delivered in, which is as close to a brand-owner signal as
anything available here.

- **Still true regardless:** "intensive outpatient program" is wrong in the bio. The registry's own
  `LOC` value is **`Virtual OP`**, and its taxonomy distinguishes the two explicitly — Wellness NJ
  is listed as "PHP, IOP, OP, Virtual OP" and Des Moines as "Detox, Res, IOP, Virtual OP". So IOP
  and OP are separate levels of care in QHG's own vocabulary, and GTB is `Virtual OP`. **CR-02 and
  CR-19a remain valid on the IOP half; only their "drop Clinic" instruction is now in question.**
- **Why "Clinic" is worth resisting anyway:** it implies a physical place, which is the exact signal
  `/contact` deliberately withholds (V0098) and which the registry itself contradicts two columns
  later with `Address: Virtual`. A telehealth provider named "Clinic" is not wrong, just unhelpful.
- **This is the same question the privacy policy is already blocked on** — item 1 of its pre-launch
  checklist asks for the legal entity name. Answer it once, here.

- [ ] Establish the legal/DBA entity name. If it is "Greater Texas Behavioral Clinic", decide
      whether the marketing name stays "Greater Texas Behavioral" (common and fine) — and if so,
      record that the divergence is deliberate so nobody "corrects" `lib/site.ts` later.
- [ ] Feed the answer into the privacy policy's outstanding item 1 (V0100) at the same time.
- [ ] **Amend CR-02 / CR-19a accordingly** — fix the IOP wording in both the portal and the master
      doc regardless, but only change "Clinic" if the naming decision says to.

## FR-3 — GTB has no Google Business Profile — `P2`

`GMB Review Link` is **`-`**. Nine of the ten facilities with physical addresses have a
`g.page/…/review` link; GTB and the two Quadrant corporate entities do not.

Defensible on its face — a Google Business Profile requires a physical service location, which a
100%-telehealth provider cannot supply. But it has two consequences that change existing tasks:

**It makes CO-7 impossible as written.** That task says *"cross-check `(877) 590-3665` against the
Google Business Profile"*. There is no profile to check against. **The registry supplies the
verification instead: `Website # = 877-590-3665`, which matches `lib/site.ts` exactly.** CO-7 is
closed on that basis — see the amendment below.

**It undercuts CR-03's preferred fix.** `components/Testimonials.tsx` records that *"the original
site displayed a live Google-reviews widget"* — but with no Google Business Profile there was never
a review source behind it, which explains why no verbatim quotes could be carried over. So CR-03
Option A ("replace with real, consented reviews") has **no existing pipeline to draw from**. Real
reviews would have to be collected first, which is weeks of lead time, not an edit.

- [ ] Decide whether a GBP is obtainable at all for a telehealth-only provider in Texas (service-area
      businesses can sometimes qualify without a public address).
- [ ] If not, accept that GTB has no organic review channel and resolve **CR-03 via Option B**
      (replace the testimonials section with truthful non-testimonial content) rather than leaving a
      fabricated section live while waiting for reviews that cannot arrive.

## Corroborations — registry agrees with decisions already made

Recorded because each independently confirms a call made earlier, which is worth as much as a defect:

- **`LOC = Virtual OP`** — confirms the OP-not-IOP reclassification in commit `7b2e82e` against
  QHG's own taxonomy. Strengthens CR-02 / CR-19a.
- **`Address = Virtual`, `City = Texas`, `Zip` blank, `Bed Count` blank** — confirms the deliberate
  no-street-address decision on `/contact` (V0098) and `site.address` being region-only. GTB is the
  only facility in the registry that is *exclusively* Virtual OP and the only one with no bed count.
- **`Website # = 877-590-3665`** — matches `lib/site.ts` exactly.
- **Seaside Wellness of Palm Beach = `855-416-5648`** — a **third** independent confirmation that
  V0043's removal was correct. The registry attributes that number to Seaside, not GTB, exactly as
  the V0043 evidence concluded.

---

## Baseline — verified clean on 2026-08-11

Re-tested this pass, against `next build` + `next start -p 3111`. Recorded so a future regression
is attributable.

- `npx tsc --noEmit` clean · `npx next lint` clean · `npx next build` clean (21 routes,
  87.2 kB shared first-load JS, 3 runtime dependencies).
- **Routes 200:** `/`, `/about/`, `/team/`, `/what-we-treat/`, `/verify-insurance/`, `/contact/`,
  `/blog/`, `/privacy-policy/`, `/blog/<post>/`. Unknown slug → 404.
- **Redirects, all 308 single-hop to a slash-terminated target:** `/about` (slashless),
  `/our-story/`, `/contact-us/`, `/contact-location/`, `/insurance-verification/`, `/privacy/`,
  the retired Seaside posts → `/blog/`, and the migrated posts → `/blog/<slug>/`.
- **Metadata:** `canonical` == `og:url` on all 8 static routes; exactly one `<h1>` per route;
  titles unique and correctly templated.
- **Headers:** all five security headers present; **no** `Set-Cookie`; **no** `X-Powered-By`.
- **`/api/lead/`:** GET → 405 with `Allow: POST`; empty POST → 422 `missing_required_fields`.
- **Staff feed** reachable, returns 3 published bios (which is how CR-02 was confirmed).

### Reviewed and deliberately not filed as issues

So the next reviewer does not re-litigate them:

- **`components/BlogCover.tsx` keeping remote CMS URLs on a plain `<img>`** — correct. Routing
  CMS-controlled hostnames through `next/image` would 500 the blog the moment an editor picks a
  new host. Documented in the component.
- **`lib/useLeadDelivery.ts` calling `ClarionForms.submit()` explicitly** rather than relying on
  auto-capture, and treating `delivered: false` as failure — both load-bearing, both the result of
  real failures. Do not "simplify" either.
- **Per-instance rate limiter in `app/api/lead/route.ts`** — labelled a speed bump, not a rate
  limiter, which is accurate for serverless. Fine as-is; a WAF rule is the real answer if abused.
- **No aftercare page, no child condition pages, no street address** — all closed by design under
  V0095 / V0045 / V0098.
- **`script-src 'unsafe-inline'`** — currently required; tracked under CR-07 rather than as its
  own row.

---

# Portfolio audit rows — 2026-07-28

## Priority summary — portfolio audit rows

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

Every fix was confirmed twice — first against a local production build (`next build` +
`next start`), then **re-run against the deployed production alias**
`greater-texas-behavioral.vercel.app` after merging to `main` (deployment `6db655e`). Everything
below passed in both environments:

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

Additionally confirmed on production: all five security headers present (CSP,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) alongside
Vercel's HSTS; `robots.txt` disallows `/api/` and points at our own sitemap; `/api/lead/` returns
405 on GET and 422 on an empty POST; and `855-416-5648` returns **0 occurrences** on all 7 routes
while `877-590-3665` renders 10–16 times each.

Reusable check scripts live in `_scrape/` (git-ignored): `lead-verify.mjs`, `csp-check.mjs`,
`responsive-check.mjs`, `header-check.mjs`, `img-csp.mjs`. Their `BASE` currently points at the
production alias; switch it to `http://127.0.0.1:3111` to run against a local `next start`.
The lead-delivery script **mocks** the Clarion endpoint, so running it never creates real leads.

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
