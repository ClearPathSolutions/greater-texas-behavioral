/**
 * Campaign attribution + CallTrackingMetrics (CTM) identity.
 *
 * THE PROBLEM THIS SOLVES
 * `forms-capture.v1.js` builds every submission payload in one function, and
 * two of its fields are read LIVE from `location.search` at submit time
 * (verified by reading the published script, not inferred):
 *
 *     utm:   ['source','medium','campaign','term','content'] <- location.search
 *     gclid: location.search
 *
 * Landing page and referrer ARE persisted by the vendor (sessionStorage,
 * `clarion_ft_*`). The campaign is not. So anyone who lands on an ad and reads
 * a second page before converting submits with a correct landing page and NO
 * campaign. The lead still arrives, the CRM record still looks populated, and
 * only the link to the ad click is missing — paid spend that appears to convert
 * at zero. It fails completely silently, which is why it survived this long.
 *
 * The vendor also never collects `wbraid`/`gbraid` at all — Google's `gclid`
 * substitutes under iOS and consent mode. CTM account 264810's own routing
 * rules key on both, so CTM can attribute those clicks while Clarion cannot.
 *
 * THE FIX, AND WHY IT HAS TO BE THE URL
 * Persist the campaign on first touch, then restore it into the query string on
 * later pageviews, before the vendor script reads it. We cannot simply hand
 * these fields over: `ClarionForms.submit()` accepts only `{form_key, data}`
 * and computes `utm`/`gclid` itself, so the URL is the only route to their
 * canonical top-level position in the payload. Anything smuggled through `data`
 * arrives nested under `data.*`, where Clarion's attribution parser never
 * looks — it would show up as a form field a human can read and stay invisible
 * to reporting, which is the same failure wearing a different hat.
 *
 * localStorage, not sessionStorage: a second tab is the same visit, and 30 days
 * is the ad-click attribution window this is reconciled against. `at` is
 * deliberately NOT refreshed on later pageviews — the window runs from the
 * click, not from the last time someone happened to visit.
 *
 * WHY THE WRITE PATH IS AN INLINE SCRIPT INSTEAD OF THIS MODULE
 * The restore must land before `t.js` and before `forms-capture.v1.js` run,
 * which is earlier than React hydration. So the write/restore half ships as a
 * parse-time inline script (`CAMPAIGN_BOOTSTRAP`, injected by the root layout)
 * which exposes itself as `window.__gtbCampaign`. `components/
 * AttributionTracker.tsx` re-invokes `restore()` on client-side route changes,
 * because an App Router navigation rewrites the URL without re-running any
 * inline script — a document-load-only bootstrap fixes nothing for a visitor
 * who reaches the form by clicking the nav, which is most of them.
 *
 * This module owns the shared constants and the READ path used at submit time.
 */

/** localStorage key holding the first-touch record. Shared with the bootstrap. */
export const CAMPAIGN_KEY = 'campaign.first_touch.v1';

/** 30 days — the ad-click attribution window, measured from the click. */
export const CAMPAIGN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Campaign parameters we persist and restore.
 *
 * `wbraid`/`gbraid` are here even though `forms-capture.v1.js` never reads
 * them: restoring them into the URL is what lets CTM's routing rules see them,
 * and `useLeadDelivery` forwards them explicitly so they are not lost entirely.
 */
export const CAMPAIGN_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
] as const;

/** Truncate stored values: this data ends up back in a URL. */
const MAX_VALUE_LEN = 256;

/** CTM's visitor session id: 24 hex, no dashes. A UUID is NOT this. */
export const CTM_ID_RE = /^[0-9a-f]{24}$/i;

type CampaignRecord = {
  /** Captured campaign parameters, keyed exactly as they appear in the URL. */
  p: Record<string, string>;
  /** First-touch landing page. */
  lp?: string;
  /** First-touch external referrer (`''` when the entry was direct). */
  rf?: string;
  /** Epoch ms of the click this record describes. */
  at: number;
};

declare global {
  interface Window {
    /** Installed by CTM's `t.js`. */
    __ctm?: { config?: { aid?: number; sid?: string; host?: string } };
    /** Installed by `CAMPAIGN_BOOTSTRAP` — see the note above. */
    __gtbCampaign?: {
      capture: () => void;
      restore: () => boolean;
      read: () => CampaignRecord | null;
    };
  }
}

/**
 * Parse-time bootstrap, injected by the root layout as an inline script.
 *
 * ES5 on purpose (no template literals, no arrow functions): it runs before any
 * bundled JavaScript, so it gets no transpilation and no polyfills. Every
 * storage access is wrapped — Safari in private mode throws on `localStorage`
 * rather than returning null, and an exception here would stop the parser
 * before `t.js`.
 */
export const CAMPAIGN_BOOTSTRAP = `
(function () {
  var KEY = ${JSON.stringify(CAMPAIGN_KEY)};
  var TTL = ${CAMPAIGN_TTL_MS};
  var MAX = ${MAX_VALUE_LEN};
  var KEYS = ${JSON.stringify(CAMPAIGN_PARAMS)};

  function now() { return new Date().getTime(); }

  function count(o) {
    var n = 0, k;
    for (k in o) if (Object.prototype.hasOwnProperty.call(o, k)) n++;
    return n;
  }

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!v || typeof v !== 'object' || typeof v.at !== 'number') return null;
      if (now() - v.at >= TTL) return null;
      if (!v.p || typeof v.p !== 'object') v.p = {};
      return v;
    } catch (e) { return null; }
  }

  function write(rec) {
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) {}
  }

  function fromUrl() {
    var out = {};
    try {
      var q = new URLSearchParams(location.search), i, v;
      for (i = 0; i < KEYS.length; i++) {
        v = q.get(KEYS[i]);
        if (v) out[KEYS[i]] = String(v).slice(0, MAX);
      }
    } catch (e) {}
    return out;
  }

  function extRef() {
    try {
      var r = document.referrer || '';
      return r && r.indexOf(location.origin) !== 0 ? r : '';
    } catch (e) { return ''; }
  }

  // Put saved campaign parameters back into the query string, without
  // overwriting anything already there. Returns whether the URL changed.
  function restore() {
    var rec = read();
    if (!rec || !count(rec.p)) return false;
    try {
      var url = new URL(location.href), changed = false, k;
      for (k in rec.p) {
        if (!Object.prototype.hasOwnProperty.call(rec.p, k)) continue;
        if (KEYS.indexOf(k) === -1) continue;
        if (!url.searchParams.get(k)) { url.searchParams.set(k, rec.p[k]); changed = true; }
      }
      if (changed) history.replaceState(null, '', url.toString());
      return changed;
    } catch (e) { return false; }
  }

  function capture() {
    var found = fromUrl();
    // A fresh click always wins. That is a new campaign, not a continuation of
    // the previous one, so the landing page and referrer reset with it.
    if (count(found)) {
      write({ p: found, lp: location.href, rf: extRef(), at: now() });
      return;
    }
    // No campaign in the URL. Record first touch anyway so an organic or direct
    // lead still carries a real entry page, then restore any saved campaign.
    if (!read()) {
      write({ p: {}, lp: location.href, rf: extRef(), at: now() });
      return;
    }
    restore();
  }

  window.__gtbCampaign = { capture: capture, restore: restore, read: read };
  capture();
})();
`.trim();

/** Reads the stored first-touch record. Returns null when absent or expired. */
export function readCampaign(): CampaignRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = JSON.parse(
      localStorage.getItem(CAMPAIGN_KEY) || 'null',
    ) as CampaignRecord | null;
    if (!v || typeof v !== 'object' || typeof v.at !== 'number') return null;
    if (Date.now() - v.at >= CAMPAIGN_TTL_MS) return null;
    return { ...v, p: v.p && typeof v.p === 'object' ? v.p : {} };
  } catch {
    return null;
  }
}

/**
 * CTM's visitor session id, or null.
 *
 * `t.js` reconciles `__ctm.config.sid` against the `__ctmid` first-party cookie
 * on load, so `config.sid` is already cookie-derived and correct across tabs —
 * the cookie is read here only as a fallback for the case where `t.js` was
 * blocked after having set it on an earlier visit.
 *
 * There is deliberately NO sessionStorage cache. CTM already keeps this in a
 * 30-day first-party cookie that survives a full page load and a second tab;
 * a stashed copy could only ever be staler.
 *
 * Returning null is the CORRECT answer when CTM's id is unavailable. Never
 * substitute an application-generated id — a UUID here files the lead against
 * no visit while looking, in every log and dashboard, exactly like success.
 */
export function ctmSessionId(): string | null {
  let sid: string | null = null;
  let vid: string | null = null;

  try {
    const raw = window.__ctm?.config?.sid;
    sid = raw ? String(raw) : null;
  } catch {
    /* CTM not present */
  }
  try {
    const m = document.cookie.match(/(?:^|;\s*)__ctmid=([^;]*)/);
    vid = m ? decodeURIComponent(m[1]) : null;
  } catch {
    /* cookies unavailable */
  }

  if (CTM_ID_RE.test(sid ?? '')) return sid;
  if (CTM_ID_RE.test(vid ?? '')) return vid;
  return sid ?? vid ?? null;
}

export type Attribution = {
  page_url: string;
  landing_page_url: string | null;
  referrer: string | null;
  /** Shaped like the vendor's field (`source`, not `utm_source`). */
  utm: Record<string, string> | null;
  gclid: string | null;
  wbraid: string | null;
  gbraid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  /** FLAT and top-level on purpose — see the note in app/api/lead/route.ts. */
  ctm_visitor_sid: string | null;
};

/** Live URL value first (the bootstrap has already restored it), then storage. */
function param(name: string, stored: Record<string, string>): string | null {
  try {
    const v = new URLSearchParams(location.search).get(name);
    if (v) return v.slice(0, MAX_VALUE_LEN);
  } catch {
    /* ignore */
  }
  return stored[name] ?? null;
}

/**
 * Attribution for OUR OWN `/api/lead/` fallback.
 *
 * Not used for the Clarion path: `forms-capture.v1.js` computes all of this
 * itself and its public `submit()` API accepts no overrides. This exists so a
 * lead that falls back to email is not attribution-blind — the fallback fires
 * exactly when Clarion is blocked or unreachable, which is also exactly when
 * nothing else is recording where the person came from.
 */
export function attributionPayload(): Attribution {
  const rec = readCampaign();
  const stored = rec?.p ?? {};

  const utm: Record<string, string> = {};
  for (const k of ['source', 'medium', 'campaign', 'term', 'content'] as const) {
    const v = param('utm_' + k, stored);
    if (v) utm[k] = v;
  }

  return {
    page_url: location.href,
    landing_page_url: rec?.lp || location.href,
    referrer: rec?.rf || null,
    utm: Object.keys(utm).length ? utm : null,
    gclid: param('gclid', stored),
    wbraid: param('wbraid', stored),
    gbraid: param('gbraid', stored),
    fbclid: param('fbclid', stored),
    msclkid: param('msclkid', stored),
    ctm_visitor_sid: ctmSessionId(),
  };
}

/** Click ids `forms-capture.v1.js` drops entirely. See CAMPAIGN_PARAMS. */
export function droppedClickIds(): Record<string, string> {
  const stored = readCampaign()?.p ?? {};
  const out: Record<string, string> = {};
  for (const k of ['wbraid', 'gbraid', 'fbclid', 'msclkid'] as const) {
    const v = param(k, stored);
    if (v) out[k] = v;
  }
  return out;
}
