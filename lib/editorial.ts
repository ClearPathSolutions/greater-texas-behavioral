import { readFileSync } from 'node:fs';
import path from 'node:path';
import { site } from './site';
import { canonicalPath } from './seo';

/**
 * Editorial policy — the portfolio-wide page from the editorial-policy dev
 * package (Clear Path Treatment Solutions, September 2026).
 *
 * The copy is shared by every site in the portfolio and must not be reworded
 * here; only the five merge fields below differ per site. Values mirror this
 * site's row (SITE_ID 10) in the package's facilities.csv / source-of-truth
 * sheet — update both together. Copy changes go to the package owner, never
 * into data/editorial-policy.html.
 *
 * GOING LIVE: fill `lastReviewed` (YYYY-MM-DD) and `contentSignoff` (a copy of
 * the sheet's CONTENT_SIGNOFF cell) below. Nothing else changes.
 *
 * Until every field is filled and signed off, the policy is withheld from
 * production (VERCEL_ENV === 'production'): the route 404s there and nothing
 * links to it, it is left out of the sitemap, and the Organization schema does
 * not point at it. Local and Vercel preview builds still render it (noindex)
 * so it can be reviewed.
 */
export const editorial = {
  /** Brand name as it appears in the site footer (`site.copyrightHolder`). */
  facilityName: site.copyrightHolder,
  domain: new URL(site.url).hostname,
  /** Corrections inbox. The sheet's EDITORIAL_EMAIL is blank; this is the site's public inbox. */
  editorialEmail: 'info@greatertexasbehavioral.com',
  /**
   * As supplied for the policy rollout. NOTE: the rest of the site shows this
   * number as `site.phone`, "(877) 590-3665" — same digits, different format.
   */
  phone: '877-590-3665',
  phoneTel: site.phoneHref.replace(/^tel:/, ''),
  /** YYYY-MM-DD. Blank until the content team supplies it. */
  lastReviewed: '',
  /** Copy of the sheet's CONTENT_SIGNOFF cell. Blank until signed off. */
  contentSignoff: '',
};

/** Trailing slash: the site runs `trailingSlash: true`, so this is the served, canonical URL. */
export const EDITORIAL_POLICY_PATH = canonicalPath('editorial-policy');
export const EDITORIAL_POLICY_URL = `${site.url}${EDITORIAL_POLICY_PATH}`;
export const CORRECTIONS_ANCHOR = 'content-updates-and-corrections';

export const editorialMissing: string[] = [
  !editorial.editorialEmail && 'EDITORIAL_EMAIL',
  !/^\d{4}-\d{2}-\d{2}$/.test(editorial.lastReviewed) && 'LAST_REVIEWED',
  !editorial.contentSignoff && 'CONTENT_SIGNOFF',
].filter((f): f is string => Boolean(f));

/** Every field filled and signed off: the policy may be public and indexed. */
export const editorialPolicyReady = editorialMissing.length === 0;

/** Whether this build serves the page at all (local and preview do, for review). */
export const editorialPolicyServed =
  editorialPolicyReady || process.env.VERCEL_ENV !== 'production';

/** "2026-09-30" -> "September 2026". */
function monthYear(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The policy body, read at build time from data/editorial-policy.html — an
 * unedited copy of the package's templates/editorial-policy.html (the package
 * folder itself is not committed). When the master copy changes, replace that
 * file wholesale; never hand-edit it.
 *
 * The template's `/about/` link already matches this site's About URL, so it
 * is left untouched.
 */
export function editorialPolicyBody(): string {
  const file = path.join(process.cwd(), 'data/editorial-policy.html');
  const fields: Record<string, string> = {
    FACILITY_NAME: editorial.facilityName,
    DOMAIN: editorial.domain,
    EDITORIAL_EMAIL: editorial.editorialEmail,
    PHONE: editorial.phone,
    PHONE_TEL: editorial.phoneTel,
    LAST_REVIEWED: editorial.lastReviewed && monthYear(editorial.lastReviewed),
  };

  const filled = readFileSync(file, 'utf8')
    // Header comment is dev notes, not page content.
    .replace(/<!--[\s\S]*?-->/g, '')
    // PageHero renders the page's single H1.
    .replace(/<h1>[\s\S]*?<\/h1>/, '')
    .replace(/\{\{([A-Z_]+)\}\}/g, (token, name: string) =>
      fields[name] ? escapeHtml(fields[name]) : token,
    )
    .trim();

  if (editorialPolicyReady && filled.includes('{{')) {
    // Package README: "Any hit blocks launch." Fail the build rather than ship it.
    throw new Error(
      `Editorial policy still contains a placeholder: ${filled.match(/\{\{[^}]*\}\}/)?.[0]}`,
    );
  }

  // Not ready, so this is a local/preview render (production 404s). Unfilled
  // fields show as a highlighted "[FIELD not set]" so they are impossible to
  // miss in review, while the page itself never carries a raw "{{".
  return filled.replace(
    /\{\{([A-Z_]+)\}\}/g,
    (_token, name: string) => `<mark class="editorial-unset">[${name} not set]</mark>`,
  );
}
