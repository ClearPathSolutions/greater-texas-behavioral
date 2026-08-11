/**
 * Server-side HTML sanitizer for CMS-authored article bodies (audit CR-07).
 *
 * WHY THIS EXISTS
 * `app/blog/[slug]/page.tsx` renders Clarion's `body_html` through
 * `dangerouslySetInnerHTML`. React refuses to execute a `<script>` tag inserted
 * that way, so the obvious vector is already dead — but the CSP in
 * `next.config.mjs` still carries `script-src 'unsafe-inline'` (required today:
 * the root layout ships two inline bootstrap scripts and Next inlines its own
 * hydration data). That means **event-handler attributes DO run**: an
 * `<img onerror=…>` or `<svg onload=…>` in a post body would execute, on the
 * same origin that serves an intake form collecting an insurance member ID and
 * free-text health context, with `connect-src` allowing api.clarionlabs.ai.
 *
 * WHAT THIS IS AND IS NOT
 * This is **defence in depth on content we already consider trusted**, not a
 * boundary against hostile input. It is an allowlist: unknown tags are unwrapped,
 * unknown attributes are dropped, every `on*` handler is removed, and URL
 * attributes must carry a safe scheme.
 *
 * It is deliberately dependency-free — this project runs on three runtime
 * dependencies and that is a stated design value. The trade-off is honest:
 * a regex tokenizer is not a spec-compliant HTML parser. It handles quoted
 * attribute values containing `>`, which is the usual way naive sanitizers are
 * defeated, but it cannot claim the completeness of a real parse tree.
 *
 * ⚠️ **If Clarion publishing is ever opened beyond the site owner, replace this
 * with a parser-based sanitizer** (`sanitize-html` or `isomorphic-dompurify`)
 * and accept the dependency. The open question — who can publish to Clarion for
 * this site? — is recorded as the first checkbox of CR-07 in ISSUES.md. The
 * durable fix for the whole class is the nonce-based CSP scoped in
 * `next.config.mjs`, which removes `'unsafe-inline'` outright.
 */

/** Tags a blog article legitimately needs. Anything else is unwrapped. */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr',
  'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'small', 'sup', 'sub',
  'ul', 'ol', 'li',
  'a', 'blockquote', 'code', 'pre',
  'figure', 'figcaption', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'span', 'div', 'time',
]);

/**
 * Elements removed along with their contents. `script`/`style` are the obvious
 * ones; `iframe`/`object`/`embed` can load executable context, and a nested
 * `form` inside an article could phish against our own origin — `form-action`
 * is `'self'`, so a fake "verify your insurance" form would post to us and look
 * entirely legitimate.
 */
const VOID_CONTENT_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'template'];

/** Per-tag attribute allowlist. `class` is permitted — it is not a script vector. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class']),
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan', 'scope']),
  time: new Set(['datetime']),
  blockquote: new Set(['cite']),
};

/** Attributes whose value is a URL and therefore needs scheme checking. */
const URL_ATTRS = new Set(['href', 'src', 'cite']);

/**
 * True for values safe to keep in a URL attribute: absolute http(s), mailto,
 * tel, or a relative/anchor path. Everything else — `javascript:`, `data:`,
 * `vbscript:`, `file:` — is dropped.
 *
 * Control characters and whitespace are stripped before the scheme is tested,
 * which neutralises the classic `java&#9;script:` style obfuscations. Anything
 * not plainly recognisable as a safe form is rejected rather than repaired.
 */
function isSafeUrl(value: string): boolean {
  // Strip whitespace and C0/C1 control characters, which are how `javascript:`
  // gets smuggled past naive checks (`java\tscript:`, `java\0script:`).
  const normalized = value
    .replace(/[\s\u0000-\u001F\u007F-\u009F]+/g, '')
    .toLowerCase();
  if (/^(https?:|mailto:|tel:)/.test(normalized)) return true;
  // Root-relative path or a bare fragment.
  if (/^[#/]/.test(normalized)) return true;
  // A relative path with no scheme at all (no colon before the first / ? or #).
  const colon = normalized.indexOf(':');
  const delim = normalized.search(/[/#?]/);
  return colon === -1 || (delim !== -1 && delim < colon);
}

/** Matches one attribute, tolerating double-quoted, single-quoted and bare values. */
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function sanitizeAttrs(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  const global = ALLOWED_ATTRS['*'];
  const kept = new Map<string, string>();

  for (const m of raw.matchAll(ATTR_RE)) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? '';

    // Every event handler, unconditionally. This is the vector `unsafe-inline`
    // leaves open and the whole reason this file exists.
    if (name.startsWith('on')) continue;
    // `style` can carry `url(javascript:…)` in older engines and is never
    // needed in CMS prose — the .prose-tx styles handle presentation.
    if (name === 'style') continue;
    if (name === 'srcdoc' || name === 'formaction' || name === 'xlink:href') continue;

    if (!global.has(name) && !allowed?.has(name)) continue;
    if (URL_ATTRS.has(name) && !isSafeUrl(value)) continue;
    if (name === 'target' && value !== '_blank') continue;

    // Map, not array: a duplicate attribute in the source must not survive twice.
    kept.set(name, value);
  }

  // target="_blank" without noopener lets the opened page reach back through
  // window.opener. Forced here, after the loop, so it does not depend on whether
  // the CMS emitted `rel` before or after `target`.
  if (kept.get('target') === '_blank') {
    kept.set('rel', 'noopener noreferrer');
  }

  const out = [...kept].map(
    ([name, value]) => `${name}="${value.replace(/"/g, '&quot;')}"`,
  );
  return out.length ? ` ${out.join(' ')}` : '';
}

/**
 * Sanitize a CMS-authored HTML fragment.
 *
 * @param html Raw `body_html` from Clarion. Falsy input returns `''`.
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  let out = html;

  // 1. Drop dangerous elements together with their contents. The unclosed
  //    variant matters: `<script>alert(1)` with no closing tag must not survive.
  for (const tag of VOID_CONTENT_TAGS) {
    out = out.replace(
      new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?(?:</${tag}\\s*>|$)`, 'gi'),
      '',
    );
    // Self-closing or stray closing tags of the same names.
    out = out.replace(new RegExp(`</?${tag}\\b[^>]*/?>`, 'gi'), '');
  }

  // 2. Strip comments — conditional comments can reintroduce markup.
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  // 3. Strip doctype / processing instructions / CDATA.
  out = out.replace(/<[!?][^>]*>/g, '');

  // 4. Walk every remaining tag. The alternation in the attribute group is what
  //    lets a quoted value contain `>` without ending the match early.
  out = out.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)(\/?)>/g,
    (_full, closing: string, rawTag: string, attrs: string, selfClose: string) => {
      const tag = rawTag.toLowerCase();
      // Unwrap: drop the tag, keep whatever it contained.
      if (!ALLOWED_TAGS.has(tag)) return '';
      if (closing) return `</${tag}>`;
      return `<${tag}${sanitizeAttrs(tag, attrs)}${selfClose ? ' /' : ''}>`;
    },
  );

  return out;
}
