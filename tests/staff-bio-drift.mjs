/**
 * Staff bio content-drift check (audit CR-02 / CR-19a).
 *
 * WHY THIS EXISTS
 * `lib/staff.ts` already has a drift guard, but it only `console.warn`s. On
 * Vercel that lands in function logs nobody reads, so the guard documented the
 * problem without closing the loop it was built to close — CR-02's whole point
 * was "so portal edits can't silently reintroduce this". This makes it visible
 * in a place someone actually looks: the test run.
 *
 * WHAT IT DOES NOT DO
 * It does not hit the site. It reads the SAME upstream feed `lib/staff.ts`
 * reads, because the defect lives in the portal, not in our render. A bio can be
 * wrong upstream and perfectly rendered here.
 *
 * KNOWN-ISSUE ALLOWLIST
 * A permanently red test trains people to ignore red tests. CR-02 is a real,
 * open, externally-owned defect that this repo cannot fix, so it is listed in
 * KNOWN below: it prints loudly every run but does not fail the suite. Anything
 * NOT on that list is new drift and fails hard.
 *
 *   -> When CR-02 is fixed in the portal, DELETE its KNOWN entry. The check then
 *      becomes strict and will catch any regression.
 *
 * NETWORK POSTURE
 * The feed is a third-party service. If it is unreachable the check SKIPS rather
 * than fails, mirroring `fetchStaff`'s own rule that a directory outage must
 * never take a page down — and so this never becomes a flaky CI gate.
 */
import { readFileSync } from 'node:fs';

const FEED_ORIGIN = (
  process.env.STAFF_FEED_ORIGIN || 'https://support.quadranthealthgroup.com'
).replace(/\/$/, '');
const FACILITY = 'greater-texas-behavioral';

/**
 * Kept in sync with BIO_RED_FLAGS in lib/staff.ts — see assertPatternsInSync()
 * below, which fails if the two lists drift apart.
 */
const PATTERNS = [
  {
    id: 'intensive-outpatient',
    pattern: /intensive\s+outpatient/i,
    why: 'GTB is a Virtual Outpatient Program (OP). IOP is a different level of care with its own clinical and billing definition.',
  },
  {
    // Word boundaries: a bare /clinic/i also matches "clinical", which appears
    // legitimately in Norberto Segredo's bio. ISSUES.md 19a recorded that false
    // positive; this is the regex that avoids re-creating it.
    id: 'clinic',
    pattern: /\bclinics?\b/i,
    why: 'implies a physical location. GTB is 100% telehealth. NOTE: per FR-2 the legal entity may genuinely be "Greater Texas Behavioral Clinic" — review, do not auto-strip.',
  },
  {
    id: 'in-person',
    pattern: /\b(?:in[-\s]?person|on[-\s]?site|walk[-\s]?in)\b/i,
    why: 'describes in-person care. Only medical detox is in person, and via partners.',
  },
];

/**
 * Findings that are real, open, and owned by another system. Each MUST cite the
 * ISSUES.md row that tracks it, so an entry cannot quietly become a way to mute
 * a finding nobody is working on.
 */
const KNOWN = [
  {
    person: 'Emma Fyffe',
    id: 'intensive-outpatient',
    issue: 'CR-02 / CR-19a — fix in the support portal AND the master bios doc line 844',
  },
  {
    person: 'Emma Fyffe',
    id: 'clinic',
    issue: 'CR-02, gated on FR-2 (is "Clinic" the legal entity name?)',
  },
];

/** Guards against the test's copy of the patterns drifting from the app's. */
function assertPatternsInSync() {
  let src;
  try {
    src = readFileSync(new URL('../lib/staff.ts', import.meta.url), 'utf8');
  } catch {
    console.warn('  ! could not read lib/staff.ts to verify pattern sync');
    return true;
  }
  const missing = PATTERNS.filter((p) => !src.includes(p.pattern.source));
  if (missing.length) {
    console.error(
      `\n✖ PATTERN DRIFT — these regexes are in this test but not in lib/staff.ts:\n` +
        missing.map((m) => `    ${m.pattern}`).join('\n') +
        `\n  The app guard and this check must stay identical. Update both.\n`,
    );
    return false;
  }
  return true;
}

const isKnown = (person, id) =>
  KNOWN.find((k) => k.person === person && k.id === id);

async function main() {
  if (!assertPatternsInSync()) process.exit(1);

  const url = `${FEED_ORIGIN}/api/public/facilities/${encodeURIComponent(FACILITY)}/staff`;
  let staff;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.log(`  SKIP — feed returned HTTP ${res.status} (not a site defect)`);
      return;
    }
    staff = (await res.json()).staff ?? [];
  } catch (err) {
    console.log(`  SKIP — feed unreachable: ${err.message}`);
    console.log('  (a directory outage is not a test failure — see header)');
    return;
  }

  if (staff.length === 0) {
    console.log('  SKIP — feed returned 0 published bios, nothing to check');
    return;
  }

  console.log(`  ${staff.length} published bios from ${FEED_ORIGIN}\n`);

  const fresh = [];
  let knownCount = 0;

  for (const person of staff) {
    const haystack = `${person.title ?? ''} ${person.bio ?? ''}`;
    const noPhoto = !person.photoUrl;
    if (noPhoto) {
      // Not a failure — tracked as CR-19b. Reported so the upload is not forgotten.
      console.log(`  · ${person.name}: no headshot (CR-19b — file exists, unuploaded)`);
    }
    for (const { id, pattern, why } of PATTERNS) {
      const hit = haystack.match(pattern);
      if (!hit) continue;
      const known = isKnown(person.name, id);
      if (known) {
        knownCount++;
        console.log(
          `  KNOWN  ${person.name} — ${JSON.stringify(hit[0])}\n` +
            `         ${known.issue}`,
        );
      } else {
        fresh.push({ person: person.name, id, match: hit[0], why });
      }
    }
  }

  console.log('');
  if (fresh.length) {
    console.error('✖ NEW BIO DRIFT — not tracked by any known issue:\n');
    for (const f of fresh) {
      console.error(`   ${f.person} — matched ${JSON.stringify(f.match)}`);
      console.error(`   ${f.why}`);
      console.error(`   Edit at ${FEED_ORIGIN}/dev/staff\n`);
    }
    process.exit(1);
  }

  if (knownCount) {
    console.log(
      `⚠️  ${knownCount} KNOWN issue(s) still live upstream — no NEW drift.\n` +
        '   These are externally owned; delete their KNOWN entries here once fixed.',
    );
  } else {
    console.log('✅ no bio drift, and no known issues remain — remove the KNOWN list.');
  }
}

await main();
