/**
 * Staff directory access, fed by the Quadrant support portal.
 *
 * Content is managed at support.quadranthealthgroup.com/dev/staff. Only
 * published bios are returned, so a facility renders nothing until someone
 * publishes. Set STAFF_FEED_ORIGIN to point at a different portal environment.
 *
 * Shared by <StaffGrid> (the teaser on /about) and the full /team page so both
 * read the same records from the same source.
 */

const FEED_ORIGIN =
  process.env.STAFF_FEED_ORIGIN ?? 'https://support.quadranthealthgroup.com';

export type StaffMember = {
  id: string;
  name: string;
  title: string;
  credentials: string | null;
  bio: string | null;
  photoUrl: string | null;
};

/**
 * Content drift guard (audit CR-02 / CR-19a).
 *
 * Staff bios are authored in another system, so this repo cannot prevent a wrong
 * claim being published — but it can refuse to let one pass silently. CR-02 is
 * live right now precisely because nothing noticed: a bio calling GTB "an
 * intensive outpatient program" has been rendering on /about and /team since the
 * service was reclassified to Virtual OP in commit 7b2e82e.
 *
 * Warns, never throws. A content problem in an external system must not fail the
 * build or blank a page — that would trade a wording error for an outage.
 */
const BIO_RED_FLAGS: Array<{ pattern: RegExp; why: string }> = [
  {
    // "Intensive outpatient program" is a DISTINCT level of care with its own
    // clinical and billing definition. The registry's own LOC value is
    // `Virtual OP`, and QHG's taxonomy lists IOP and Virtual OP separately.
    pattern: /intensive\s+outpatient/i,
    why: 'says "intensive outpatient" — GTB is a Virtual Outpatient Program (OP). IOP is a different level of care. Fix in the support portal AND the master bios doc, or a re-sync reintroduces it.',
  },
  {
    // WORD BOUNDARIES MATTER HERE. A bare /clinic/i substring also matches
    // "clinical", which appears legitimately in Norberto Segredo's bio ("his
    // clinical perspective"). ISSUES.md 19a recorded that false positive; this
    // is the regex that avoids re-creating it.
    pattern: /\bclinics?\b/i,
    why: 'names a "Clinic", which implies a physical location. GTB is 100% telehealth and /contact deliberately publishes no address. NOTE: per FR-2 the legal entity IS "Greater Texas Behavioral Clinic", so this may be correct in a legal context — review rather than auto-strip.',
  },
  {
    pattern: /\b(?:in[-\s]?person|on[-\s]?site|walk[-\s]?in)\b/i,
    why: 'describes in-person care. Only medical detox is delivered in person, and by partners — not by GTB.',
  },
];

/**
 * Logged once per process per distinct finding. Without this, ISR revalidation
 * every 300s reprints the same warnings forever and they stop being read.
 */
const warned = new Set<string>();

function auditBios(facility: string, staff: StaffMember[]): void {
  for (const person of staff) {
    const haystack = `${person.title ?? ''} ${person.bio ?? ''}`;
    for (const { pattern, why } of BIO_RED_FLAGS) {
      const hit = haystack.match(pattern);
      if (!hit) continue;
      const key = `${facility}|${person.id}|${pattern.source}`;
      if (warned.has(key)) continue;
      warned.add(key);
      console.warn(
        `[staff:content-drift] ${facility} — ${person.name}'s bio ${why}\n` +
          `                      matched ${JSON.stringify(hit[0])} · edit at ${FEED_ORIGIN}/dev/staff`,
      );
    }
  }
}

export async function fetchStaff(facility: string): Promise<StaffMember[]> {
  try {
    const res = await fetch(
      `${FEED_ORIGIN}/api/public/facilities/${encodeURIComponent(facility)}/staff`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { staff?: StaffMember[] };
    const staff = data.staff ?? [];
    auditBios(facility, staff);
    return staff;
  } catch {
    // A directory outage must never take a page down.
    return [];
  }
}

/** First initials of the first two name parts, e.g. "Emma Fyffe" -> "EF". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Split a bio into paragraphs for comfortable reading on the full team page.
 * The portal stores bios as one string; some carry real paragraph breaks, but
 * most are a single long block. When there are no explicit breaks, group the
 * prose into ~3-sentence paragraphs so a long bio doesn't read as a wall.
 *
 * ⚠️ LOAD-BEARING, not a nice-to-have (audit CR-19d). The portal flattens every
 * bio to a single line — verified: all three GTB bios come back with zero
 * newlines, even though the master document gives Jada 2 deliberate paragraphs
 * and Norberto 3. So the `explicit.length > 1` branch never fires for this
 * facility and the sentence-grouping heuristic is what actually renders /team.
 * If you "simplify" this to a plain `split('\\n\\n')`, every bio becomes one wall
 * of text. The upstream fix is preserving breaks in the portal.
 */
export function bioParagraphs(bio: string): string[] {
  const explicit = bio
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (explicit.length > 1) return explicit;

  const sentences = bio.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!sentences || sentences.length <= 4) return [bio.trim()];

  const perPara = 3;
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += perPara) {
    paras.push(
      sentences
        .slice(i, i + perPara)
        .join('')
        .trim(),
    );
  }
  return paras;
}
