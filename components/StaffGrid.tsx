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

  return (
    <section className="section bg-cream-50">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">{eyebrow}</span>
          <h2 className="h-section mt-4">{title}</h2>
          {body && <p className="lead mt-5">{body}</p>}
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((person, i) => (
            <Reveal key={person.id} delay={i * 100}>
              <article className="card flex h-full flex-col p-7">
                <div className="flex items-center gap-4">
                  {person.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-lg font-bold text-cream-50"
                    >
                      {initials(person.name)}
                    </span>
                  )}
                  <div>
                    <h3 className="font-display text-xl font-bold text-forest-900">
                      {person.name}
                      {person.credentials && (
                        <span className="font-sans text-base font-normal text-muted">
                          , {person.credentials}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm font-semibold text-forest-700">
                      {person.title}
                    </p>
                  </div>
                </div>

                {person.bio && (
                  <p className="mt-4 leading-relaxed text-muted">{person.bio}</p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
