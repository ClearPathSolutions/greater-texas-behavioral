import Reveal from '@/components/ui/Reveal';

/**
 * "Our Team" section, fed by the Quadrant support portal.
 *
 *   <StaffGrid facility="greater-texas-behavioral" />
 *
 * Content is managed at support.quadranthealthgroup.com/dev/staff. Only
 * published bios are returned, so this renders nothing until someone publishes.
 * Set STAFF_FEED_ORIGIN to point at a different portal environment.
 */

const FEED_ORIGIN =
  process.env.STAFF_FEED_ORIGIN ?? 'https://support.quadranthealthgroup.com';

type StaffMember = {
  id: string;
  name: string;
  title: string;
  credentials: string | null;
  bio: string | null;
  photoUrl: string | null;
};

async function fetchStaff(facility: string): Promise<StaffMember[]> {
  try {
    const res = await fetch(
      `${FEED_ORIGIN}/api/public/facilities/${encodeURIComponent(facility)}/staff`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { staff?: StaffMember[] };
    return data.staff ?? [];
  } catch {
    // A directory outage must never take the page down.
    return [];
  }
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function StaffGrid({
  facility,
  eyebrow = 'The people behind your care',
  title = 'Meet our team',
  body,
}: {
  facility: string;
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  const staff = await fetchStaff(facility);
  if (staff.length === 0) return null;

  // If anyone lists credentials, reserve the pill row on every card so the
  // dividers and bios stay aligned across the row. If nobody does, drop it.
  const showCredentialRow = staff.some((s) => s.credentials);

  // Center a short roster instead of leaving a stretched, orphaned column.
  const gridCols =
    staff.length === 1
      ? 'max-w-md'
      : staff.length === 2
        ? 'max-w-3xl sm:grid-cols-2'
        : 'max-w-5xl sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="section bg-cream-50">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">{eyebrow}</span>
          <h2 className="h-section mt-4">{title}</h2>
          {body && <p className="lead mt-5">{body}</p>}
        </Reveal>

        <div className={`mx-auto mt-14 grid gap-6 sm:gap-7 ${gridCols}`}>
          {staff.map((person, i) => (
            <Reveal key={person.id} delay={i * 100}>
              <article className="card group flex h-full flex-col items-center p-8 text-center transition duration-200 hover:-translate-y-1 hover:shadow-lift">
                {/* Avatar. With no photo we render a designed monogram — a
                    gradient disc with a ring — so the fallback reads as
                    intentional, not as a broken image. */}
                {person.photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    width={96}
                    height={96}
                    loading="lazy"
                    className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-cream-50 shadow-soft"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-600 to-forest-900 font-display text-2xl font-bold tracking-wide text-cream-50 ring-4 ring-cream-50 shadow-soft"
                  >
                    {initials(person.name)}
                  </span>
                )}

                <h3 className="mt-5 font-display text-xl font-bold text-forest-900">
                  {person.name}
                </h3>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest-600">
                  {person.title}
                </p>

                {showCredentialRow && (
                  <div className="mt-3 flex h-6 items-center justify-center">
                    {person.credentials && (
                      <span className="inline-flex items-center rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold tracking-wide text-gold-700 ring-1 ring-gold-200">
                        {person.credentials}
                      </span>
                    )}
                  </div>
                )}

                <span aria-hidden="true" className="mt-5 h-px w-10 bg-gold-300" />

                {person.bio && (
                  <p className="mt-5 line-clamp-[8] text-left text-[15px] leading-relaxed text-muted">
                    {person.bio}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
