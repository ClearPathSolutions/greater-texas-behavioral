import Link from 'next/link';
import type { Byline, BylinePerson } from '@/lib/byline';
import { editorialPolicyServed, EDITORIAL_POLICY_PATH } from '@/lib/editorial';

/** Date-only and UTC, so "2026-09-30" can't render as the 29th in US zones. */
function formatDate(iso: string): string {
  return new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function PersonName({ person, rel }: { person: BylinePerson; rel?: string }) {
  const label = person.credentials ? `${person.name}, ${person.credentials}` : person.name;
  return person.bioPath ? (
    <Link href={person.bioPath} rel={rel}>
      {label}
    </Link>
  ) : (
    <>{label}</>
  );
}

/**
 * Article byline, from the editorial-policy package's
 * templates/article-byline.html. Sits directly under the post's H1. Each line
 * renders only when its data exists; getByline() has already dropped a
 * reviewer that has no review date.
 */
export default function ArticleByline({ byline }: { byline: Byline }) {
  const { author, reviewer, lastReviewed, modified } = byline;
  const meta = [
    lastReviewed && (
      <span key="reviewed">
        Last reviewed <time dateTime={lastReviewed}>{formatDate(lastReviewed)}</time>
      </span>
    ),
    modified && (
      <span key="updated">
        Updated <time dateTime={modified}>{formatDate(modified)}</time>
      </span>
    ),
    // Linked only where the policy is served, so production never links a 404.
    editorialPolicyServed && (
      <Link key="policy" href={EDITORIAL_POLICY_PATH}>
        Editorial policy
      </Link>
    ),
  ].filter(Boolean);

  if (!author && meta.length === 0) return null;

  return (
    <div className="article-byline">
      {author && (
        <p className="byline-line">
          Written by <PersonName person={author} rel="author" />
        </p>
      )}
      {reviewer && (
        <p className="byline-line">
          Clinically reviewed by <PersonName person={reviewer} />
        </p>
      )}
      {meta.length > 0 && (
        <p className="byline-meta">
          {meta.flatMap((m, i) => (i === 0 ? [m] : [' · ', m]))}
        </p>
      )}
    </div>
  );
}
