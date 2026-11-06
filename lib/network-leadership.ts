/**
 * Network-level medical leadership — locally authored, NOT portal-fed.
 *
 * `lib/staff.ts` returns the staff of ONE facility, which is the right shape
 * for people who work at Greater Texas Behavioral. A network leader does not:
 * their remit spans the whole Quadrant network, so the same
 * record belongs on this site, on quadranthealthgroup.com, and on every other
 * facility site. Filing her as GTB facility staff would say she works here, and
 * would also make her vanish whenever the facility feed changes.
 *
 * The arrangement mirrors `lib/original-posts.ts` -> `lib/clarion-blog.ts`:
 * locally authored content that lives BESIDE the feed instead of inside it.
 *
 * This is the first published answer to ISSUES.md **CR-19c** ("does GTB have
 * clinical/medical oversight, and is it shared at the Quadrant level?"), which
 * stayed open because there was no named physician to point at. It is answered
 * with a supplied record, not with a claim written here.
 *
 * ⚠️ BIOS ARE VERBATIM AS SUPPLIED. The same text is published on the parent
 * site and on the other facility sites, so editing it here would (a) put this
 * site out of step with 13 others and (b) invent biography. Do not reword,
 * reorder, trim, or "fix" the paragraphs. Corrections come from the source.
 */

/** A person whose remit spans the Quadrant network rather than one facility. */
export type NetworkLeader = {
  /** URL segment under `/team/`. Also the key `CANONICAL_AT_PARENT` uses. */
  slug: string;
  name: string;
  title: string;
  /** Post-nominals for the pill on `/team`, or null when none were supplied. */
  credentials: string | null;
  /** Local path under `public/` — these are ours, not portal-hosted URLs. */
  photo: string | null;
  /** One line for the `/team` card and the page's meta description. */
  summary: string;
  /**
   * Authored paragraphs, kept as an ARRAY so they render exactly as written.
   * Deliberately not run through `bioParagraphs()` in lib/staff.ts: that
   * heuristic exists to rescue portal bios the portal has flattened to a single
   * line, and re-grouping these into three-sentence blocks would silently
   * rewrite copy that is published verbatim in a dozen other places.
   */
  bio: string[];
};

/**
 * Empty since 2026-11-06: Dr. Pamela Tambini and Casey Hyatt were removed from
 * this site at the client's request. With no entries, the "Network leadership"
 * section on /team is hidden and /team/<slug>/ has no pages; their old URLs
 * redirect to /team/ (next.config.mjs).
 */
export const networkLeaders: NetworkLeader[] = [];

/** Lookup for the `/team/[slug]` route. Unknown slugs 404 there. */
export function getNetworkLeader(slug: string): NetworkLeader | null {
  return networkLeaders.find((leader) => leader.slug === slug) ?? null;
}
