# Greater Texas Behavioral — Audit Issues

Issues from the portfolio web audit ([source spreadsheet](https://docs.google.com/spreadsheets/d/1daiRElkRoKObt9KCsqFeXEhmtSBk5c1MQjUeaKx2nC8/edit)) that relate to this project. All rows verified in the audit on **2026-07-28**. Preview domain: `greater-texas-behavioral.vercel.app` → production `greatertexasbehavioral.com`.

Spreadsheet columns: `Issue ID | Facility | Issue | Location | Fix | Status | Verdict | Verified | Correction applied | Priority`

## Priority summary

| ID | Priority | Status | Summary |
|----|----------|--------|---------|
| V0102 | **CRITICAL** | Open | Portfolio-wide trailing-slash mismatch (biggest cutover issue) |
| V0100 | **COMPLIANCE** | Open | No privacy policy page at all (YMYL compliance exposure) |
| V0043 | **BLOCKED** | Open | Wrong facility phone number (Seaside's `855-416-5648`) sitewide |
| V0047 | Not triaged | Open | `og:url` misconfigured/missing on all 11 pages |
| V0095 | Not triaged | Open | No aftercare page (build decision) |
| V0096 | Not triaged | Open | No `/verify-insurance` page (slug standardization) |
| V0097 | Not triaged | Open | About slug: GTB uses `/our-story`, standard is `/about` |
| V0098 | Not triaged | Open | Contact page missing entirely (adopt `/contact`) |
| V0045 | LOW | Open | "What We Treat" hub has no child condition pages |
| V0044 | CLOSED | Open | 5-page stub — **by design** (virtual provider) |

---

## V0102 — Portfolio-wide trailing-slash mismatch — `CRITICAL`
- **Facility:** ALL SITES
- **Issue:** All 12 previews serve the slashless form at 200 and 308-redirect the slash form; all 12 production sites are slash-canonical (301 on the slashless form). At cutover every inbound link using the production convention hits a redirect. Also causes the canonical-target redirects in V0018/V0067. Affects all 1,046 preview URLs — the single largest cutover issue in the audit by URL count.
- **Location:** Example — Preview `.../about-us` (200, no slash) vs Production `.../about-us` (301 → trailing-slash form).
- **Fix:** Pick one convention and enforce it in the Next.js config across all 12 builds, then align the redirect map.
- **Verdict:** CONFIRMED_AMENDED · **Priority:** CRITICAL
- **Note:** Fix in `next.config.mjs` (`trailingSlash`) here in this repo, but must match the portfolio-wide decision.

## V0100 — Privacy policy missing — `COMPLIANCE`
- **Facility:** ALL SITES (includes Greater Texas)
- **Issue:** Privacy policy: 1 site has NO privacy page at all (Greater Texas) — a compliance exposure on a YMYL healthcare site.
- **Location:** Portfolio-wide. Absent entirely on: `https://greater-texas-behavioral.vercel.app`
- **Fix:** Build a privacy policy page.
- **Verdict:** CONFIRMED_AMENDED
- **Correction applied:** PRIORITY COMPLIANCE — Greater Texas has no privacy policy page at all.

## V0043 — Wrong facility phone number sitewide — `BLOCKED`
- **Facility:** Greater Texas Behavioral
- **Issue:** Seaside Wellness's number `855-416-5648` appears on all 5 pages alongside Greater Texas's own `877-590-3665`.
- **Location:** `/`, `/blog`, `/our-story`, `/verify-insurance`, `/what-we-treat`
- **Fix:** Remove `855-416-5648` from these pages. Cross-check the surviving number against the production domain and GBP.
- **Verdict:** CONFIRMED_AMENDED
- **Correction applied:** PRIORITY BLOCKED — Confirm with admissions before removing a live tracked number. 1) Inherited, not introduced. 2) The fix may be unsafe — the number could be a live tracked line. **Do not remove without confirming with admissions.**

## V0047 — `og:url` misconfigured or missing — `not triaged`
- **Facility:** Greater Texas Behavioral
- **Issue:** `og:url` is misconfigured or missing on all 11 pages: 4 point at the domain root, 6 have no `og:url` element at all, 1 is the homepage.
- **Location:** `https://greater-texas-behavioral.vercel.app` — (audit noted "4 pages affected" but full scope is all 11)
- **Fix:** Set `og:url` per page to that page's canonical URL on the production domain.
- **Verdict:** CONFIRMED_AMENDED
- **Correction applied:** 1) Incomplete scope — affects all pages, not just 4. 2) Example URL corrected to `https://greatertexasbehavioral.com/our-story` (original fix cited a URL that does not exist).

## V0096 — No `/verify-insurance` page — `not triaged`
- **Facility:** ALL SITES (includes Greater Texas)
- **Issue:** Verify-insurance slug has 4 variants and is absent on 5 sites — including Greater Texas Behavioral.
- **Location:** Missing entirely on: `https://greater-texas-behavioral.vercel.app`
- **Fix:** Adopt `/verify-insurance` portfolio-wide and build it everywhere it is missing.
- **Verdict:** CONFIRMED_AMENDED
- **Note:** Conflicts with V0043, which lists `/verify-insurance` as an existing page — reconcile actual current page set before acting.

## V0095 — No aftercare page — `not triaged`
- **Facility:** ALL SITES
- **Issue:** Aftercare slug has 6 variants across 9 sites. Three sites have NO aftercare page at all — Wellness NJ, QHG parent, and **Greater Texas**. So this is a rename across 9 plus a build decision for 3.
- **Fix:** Adopt `/treatment/aftercare` portfolio-wide. For GTB this is a build-or-skip decision, not a rename.
- **Verdict:** CONFIRMED_AMENDED
- **Note:** Likely a "skip by design" for a virtual provider (cf. V0044), but not yet triaged.

## V0097 — About slug (`/our-story` → `/about`) — `not triaged`
- **Facility:** ALL SITES
- **Issue:** `/about` is live on 9 sites. Only 3 genuinely need a rename — Dallas `/about-us`, Fort Worth `/about-us`, and **Greater Texas `/our-story`**.
- **Location:** Redirect `https://greater-texas-behavioral.vercel.app/our-story`.
- **Fix:** Adopt `/about` portfolio-wide. Reference build: `laguna-view-detox.vercel.app/about`.
- **Verdict:** CONFIRMED_AMENDED
- **Note:** Would rename our existing `/our-story` route to `/about` (or add a redirect).

## V0098 — Contact page missing — `not triaged`
- **Facility:** ALL SITES
- **Issue:** Contact slug differs: `/contact` (8 sites), `/contact-us` (Dallas, Fort Worth), `/contact-location` (Marina Harbor), **absent on Greater Texas**.
- **Fix:** Adopt `/contact` portfolio-wide; build it on GTB. Reference build: `ocean-coast-recovery-center.vercel.app/contact`.
- **Verdict:** CONFIRMED · **Correction applied:** none — row accurate as written.
- **Note:** For a virtual-provider stub this may be intentionally omitted (cf. V0044); confirm before building.

## V0045 — "What We Treat" hub has no child pages — `LOW`
- **Facility:** Greater Texas Behavioral
- **Issue:** "What We Treat" hub exists with no child condition pages.
- **Location:** `https://greater-texas-behavioral.vercel.app/what-we-treat`
- **Fix:** Model on the Seaside condition set, or remove the empty hub.
- **Verdict:** CONFIRMED_AMENDED
- **Correction applied:** PRIORITY LOW — Downgraded; hub has real content, not empty. The word "empty" is wrong.

## V0044 — 5-page stub — `CLOSED (by design)`
- **Facility:** Greater Texas Behavioral
- **Issue:** Site is a 5-page stub. No treatment hub, no contact page, no admissions page, no tour, no privacy policy.
- **Location:** `https://greater-texas-behavioral.vercel.app`
- **Fix:** If a full facility site, model on a complete build; if a brand placeholder, keep out of the launch batch and noindex.
- **Verdict:** CONFIRMED
- **Correction applied:** PRIORITY CLOSED — By design: virtual provider, stub is inherited.
- **Note:** Privacy-policy sub-point is tracked separately and remains open under V0100.
