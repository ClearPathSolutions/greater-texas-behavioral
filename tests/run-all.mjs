/**
 * Runs the whole verification suite in order (audit CR-05).
 *
 * Exits non-zero if any script fails, so this is CI-usable:
 *   npx next build && npx next start -p 3111 & npm test
 *
 * `sanitize-html.test.mjs` runs first because it needs no server — if the
 * sanitizer is broken there is no point starting a browser.
 */
import { spawnSync } from 'node:child_process';
import { BASE } from './lib/base.mjs';

const SCRIPTS = [
  'sanitize-html.test.mjs',
  // Reads the upstream staff feed, not this site — no server needed, so it runs
  // early alongside the other serverless check.
  'staff-bio-drift.mjs',
  'lead-verify.mjs',
  // Runs right after lead-verify: same two forms, but asserting the attribution
  // on the payload rather than whether it was delivered.
  'attribution-verify.mjs',
  'responsive-check.mjs',
  'header-check.mjs',
  'csp-check.mjs',
  'img-csp.mjs',
];

console.log(`Target: ${BASE}\n`);

const failed = [];
for (const script of SCRIPTS) {
  console.log(`\n${'═'.repeat(70)}\n  ${script}\n${'═'.repeat(70)}`);
  const res = spawnSync('node', [`tests/${script}`], { stdio: 'inherit' });
  if (res.status !== 0) failed.push(script);
}

console.log(`\n${'═'.repeat(70)}`);
if (failed.length) {
  console.log(`❌ ${failed.length} script(s) failed: ${failed.join(', ')}`);
  process.exit(1);
}
console.log(`✅ all ${SCRIPTS.length} verification scripts passed`);
