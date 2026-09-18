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
      'Dr. Pamela Tambini is a board-certified physician in Internal Medicine and Addiction Medicine, healthcare executive, and Founder and Chief Executive Officer of The Sober Connection, a physician-led medical services organization supporting behavioral healthcare facilities nationwide.',
      'Through The Sober Connection, Dr. Tambini provides executive-level medical oversight and supports the development of clinical standards, quality assurance processes, and regulatory compliance initiatives. The Sober Connection\'s network of qualified medical professionals is responsible for the direct delivery and management of patient medical services at the behavioral healthcare facilities it serves, in accordance with applicable state and federal requirements.',
      'The Sober Connection provides comprehensive medical services across the continuum of behavioral healthcare, including medical detoxification, residential treatment, partial hospitalization, intensive outpatient, and outpatient settings. Its services include physician and advanced practice provider staffing, medical directorship services, provider credentialing, clinical quality assurance, policy development, provider education, and regulatory support.',
      'Dr. Tambini\'s role is focused primarily on organizational medical leadership, clinical governance, quality improvement, provider oversight.',
      'Prior to founding The Sober Connection, Dr. Tambini served as a hospitalist within the Veterans Health Administration, where she gained extensive experience managing medically complex patients and collaborating with multidisciplinary healthcare teams.',
      'Under Dr. Tambini\'s leadership, The Sober Connection has developed a multi-state medical services platform designed to provide behavioral healthcare organizations with consistent, evidence-based, and compliant medical services. The organization supports facilities with qualified medical professionals who evaluate and treat patients, manage medical needs, coordinate care, and provide services within their respective scopes of practice and applicable regulatory requirements.',
      'Dr. Tambini remains focused on advancing standards in addiction medicine and behavioral healthcare through physician leadership, provider education, clinical governance, and the development of systems that promote quality, accountability, continuity of care, and regulatory excellence.',
    ],
  },
];

/** Lookup for the `/team/[slug]` route. Unknown slugs 404 there. */
export function getNetworkLeader(slug: string): NetworkLeader | null {
  return networkLeaders.find((leader) => leader.slug === slug) ?? null;
}
