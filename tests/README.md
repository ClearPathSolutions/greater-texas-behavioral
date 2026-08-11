# Verification suite

Tracked in git as of audit **CR-05**. These five checks were the stated evidence
that the intake forms never silently drop a lead, but they lived in the
git-ignored `_scrape/` directory — nobody else could run them, CI could not run
them, and they were one `rm -rf` from gone.

## Running

They check a **running server**, so build and start one first:

```bash
npx next build
npx next start -p 3111 &
npm test
```

Default target is `http://127.0.0.1:3111`. Override with `BASE`:

```bash
BASE=https://greater-texas-behavioral.vercel.app npm test
```

Branch previews are behind Vercel Deployment Protection and 302 to
`vercel.com/sso-api`, so they cannot be checked over HTTP. The production alias
is public and works.

## What each script covers

| Script | Covers |
|---|---|
| `sanitize-html.test.mjs` | Unit test for `lib/sanitize-html.ts` (CR-07). The only script that needs no server. |
| `lead-verify.mjs` | 8 scenarios, 4 per intake form: direct load, client-side nav, Clarion 403, and script-blocked-with-no-email-relay. Asserts exactly one Clarion POST (never a duplicate) and that no form claims success without confirmation. |
| `responsive-check.mjs` | No horizontal overflow at 360/768/1440px; mobile menu opens, traps focus, closes on Escape; **plus the CR-04 resize repro**. |
| `header-check.mjs` | Desktop nav fits on one line at 1024–1440px (the 1024px wrap regression). |
| `csp-check.mjs` | Zero console/CSP errors, one `<h1>` per route, every `<img>` has `alt`, no cookies set. |
| `img-csp.mjs` | The one remote CMS blog cover loads and decodes under the CSP. |

## Safety

`lead-verify.mjs` **mocks the Clarion submit endpoint** — running it never
creates a real lead. It also mocks `/api/lead/` so results don't depend on
whether Resend is configured. Preserve both properties if you edit it: the
alternative is generating fake admissions inquiries for a treatment provider.
