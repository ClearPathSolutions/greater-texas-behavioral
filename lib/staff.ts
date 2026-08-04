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

export async function fetchStaff(facility: string): Promise<StaffMember[]> {
  try {
    const res = await fetch(
      `${FEED_ORIGIN}/api/public/facilities/${encodeURIComponent(facility)}/staff`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { staff?: StaffMember[] };
    return data.staff ?? [];
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
