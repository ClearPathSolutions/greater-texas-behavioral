/**
 * Network-level medical leadership — locally authored, NOT portal-fed.
 *
 * `lib/staff.ts` returns the staff of ONE facility, which is the right shape
 * for people who work at Greater Texas Behavioral. Dr. Tambini does not: she
 * provides medical oversight across the whole Quadrant network, so the same
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

export const networkLeaders: NetworkLeader[] = [
  {
    slug: 'pamela-tambini',
    name: 'Dr. Pamela Tambini',
    title: 'Medical Oversight',
    // Nothing in the supplied material gives post-nominals. Her bio's
    // "board-certified physician in Internal Medicine and Addiction Medicine"
    // is a sentence, not a credential string — deriving "M.D." from it would be
    // inventing a credential, which is the one thing a staff page must not do.
    credentials: null,
    photo: '/images/pamela-tambini.jpg',
    summary:
      'Board-certified in Internal Medicine and Addiction Medicine, providing medical oversight across the Quadrant Health Group network.',
    // ⚠️ Verbatim. Note for anyone reading the drift guard in lib/staff.ts: this
    // bio contains the phrase "intensive outpatient", but it is describing the
    // continuum of care Dr. Tambini has worked across in her career — it is NOT
    // a claim about GTB's level of care (Virtual OP), and it is not portal
    // content, so `auditBios()` deliberately never sees it. Flagged here so the
    // next person to grep for CR-02 does not read this as a recurrence.
    bio: [
      'Dr. Pamela Tambini is a board-certified physician in Internal Medicine and Addiction Medicine, entrepreneur, and healthcare executive dedicated to advancing evidence-based treatment for individuals with substance use and co-occurring mental health disorders. She is the Founder and Chief Executive Officer of The Sober Connection, a physician-led medical services organization that partners with behavioral healthcare facilities nationwide to provide comprehensive medical leadership, provider staffing, quality assurance, and regulatory compliance solutions.',
      'With extensive experience across the continuum of addiction treatment—including medical detoxification, residential treatment, partial hospitalization, intensive outpatient, and outpatient care—Dr. Tambini has developed scalable clinical programs that improve patient outcomes while helping organizations maintain regulatory excellence and operational efficiency. Her expertise includes addiction medicine, psychopharmacology, withdrawal management, medical stabilization, utilization review, physician leadership, and multi-state healthcare operations.',
      'Prior to founding The Sober Connection, Dr. Tambini served as a hospitalist within the Veterans Health Administration, where she managed medically complex patients and collaborated with multidisciplinary teams to deliver high-quality inpatient care. Her clinical expertise, combined with her operational leadership, provides a unique perspective on integrating medical excellence with sustainable healthcare systems.',
      "Under Dr. Tambini's leadership, The Sober Connection has grown into a multi-state organization supporting behavioral healthcare facilities through physician staffing, medical directorships, quality improvement initiatives, provider education, credentialing, policy development, and clinical oversight. She is recognized for building high-performing medical teams, implementing standardized clinical processes, and helping treatment centers navigate accreditation, licensing, and payer requirements.",
      'Dr. Tambini is passionate about raising the standard of addiction medicine by combining compassionate patient care with innovative operational strategies. Her leadership philosophy emphasizes clinical integrity, accountability, and collaboration, with a focus on creating systems that support both providers and the patients they serve.',
      'She remains actively involved in medical education, physician mentorship, and the ongoing advancement of best practices in behavioral healthcare while continuing to care for patients and advise organizations on clinical program development, healthcare operations, and quality improvement initiatives.',
    ],
  },
];

/** Lookup for the `/team/[slug]` route. Unknown slugs 404 there. */
export function getNetworkLeader(slug: string): NetworkLeader | null {
  return networkLeaders.find((leader) => leader.slug === slug) ?? null;
}
