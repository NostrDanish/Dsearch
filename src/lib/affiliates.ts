/**
 * Affiliate link tagging — owner-managed domain → affiliate-code rules.
 *
 * Model: the owner (or an owner-listed admin) publishes ONE addressable
 * NIP-78 event (kind 30078, d-tag `dsearch:affiliate-rules`) whose content
 * is a JSON rule list:
 *
 *   { "version": 1, "rules": [
 *       { "host": "amazon.ca", "mode": "param", "params": { "tag": "dsearch-21" } },
 *       { "host": "ebay.com", "mode": "param", "params": { "mkcid": "1", "mkrid": "711-…", "campid": "…" } },
 *       { "host": "ppq.ai", "mode": "redirect", "target": "https://ppq.ai/invite/<code>" }
 *   ] }
 *
 * Two tagging modes, because affiliate programs come in two shapes:
 *   - `param`    — query-param tagging: matched result URLs keep their page
 *                  and gain/replace the parameter MAP (Amazon needs one,
 *                  eBay EPN needs five).
 *   - `redirect` — referral-link services (PPQ `/invite/<code>`, nano-gpt
 *                  `/r/<code>`): matched result URLs are replaced by the
 *                  referral link itself, since the referral page sets the
 *                  tracking cookie. `{url}` in the target is substituted
 *                  with the (encoded) original link for prefix-style programs.
 *
 * Back-compat: rules written by older clients with a single `param`/`value`
 * pair parse as one-entry `params`; single-param rules are still serialized
 * with legacy `param`/`value` fields so older clients keep reading them.
 *
 * Every client reads that event — author-filtered to the owner + the
 * owner-signed admin role list (the trust boundary, same as the moderation
 * lists; last-write-wins across the team) — and rewrites matching outbound
 * result URLs: `https://www.amazon.ca/item/…` becomes
 * `https://www.amazon.ca/item/…?tag=dsearch-21`.
 *
 * Nothing here is secret by design — affiliate codes are visible in the
 * final tagged URL no matter what. Keeping the config as a signed public
 * event means: no server storage, no new endpoints, and every change is
 * auditable on any relay.
 *
 * First matching rule wins. An existing affiliate parameter on the URL is
 * REPLACED (that is the point — our code should win over a scraped one).
 */
import type { NostrEvent } from '@nostrify/nostrify';

/** NIP-78 app-specific data kind (already used for submissions/stakes). */
export const AFFILIATES_KIND = 30078;

/** Addressable d-tag of the owner-signed affiliate rule list. */
export const AFFILIATES_D_TAG = 'dsearch:affiliate-rules';

/** Topic tag for relay-level filtering / discoverability. */
export const AFFILIATES_T_TAG = 'dsearch-affiliate-rules';

export interface AffiliateRule {
  /** Bare host to match, e.g. `amazon.ca` or `ppq.ai` (also matches subdomains). */
  host: string;
  /**
   * Tagging mode:
   *  - `param`    — set query parameter(s) on the matched URL. Amazon needs
   *                 one (`tag=code`); eBay EPN needs several at once
   *                 (`mkcid`, `mkrid`, `siteid`, `campid`, `customid`).
   *  - `redirect` — replace the whole URL with a referral link
   *                 (PPQ: https://ppq.ai/invite/<code>, nano-gpt: /r/<code>).
   *                 The literal token `{url}` in target is substituted with
   *                 the URL-encoded original link.
   */
  mode: 'param' | 'redirect';
  /** `param` mode: the full parameter map, e.g. `{ tag: 'dsearch-21' }`. */
  params?: Record<string, string>;
  /** `redirect` mode: referral URL, e.g. `https://ppq.ai/invite/<code>`. */
  target?: string;
}

const HOST_RE = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/;
const PARAM_NAME_RE = /^[A-Za-z0-9_-]{1,32}$/;
// Values pass through URLSearchParams (always safely encoded) — reject only
// what would corrupt a hand-written config or explode size.
const PARAM_VALUE_RE = /^[^\s&?#]{1,128}$/;
const MAX_PARAMS = 10;
const URL_PLACEHOLDER = '{url}';

/** A redirect target: https URL, optionally containing {url} placeholders. */
export function isValidRedirectTarget(target: string): boolean {
  const withoutPlaceholder = target.split(URL_PLACEHOLDER).join('https://example.com/x');
  try {
    const u = new URL(withoutPlaceholder);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidAffiliateRule(rule: AffiliateRule): boolean {
  if (!HOST_RE.test(rule.host)) return false;
  if (rule.mode === 'param') {
    const entries = Object.entries(rule.params ?? {});
    if (entries.length === 0 || entries.length > MAX_PARAMS) return false;
    return entries.every(([k, v]) => PARAM_NAME_RE.test(k) && PARAM_VALUE_RE.test(v));
  }
  if (rule.mode === 'redirect') {
    return !!rule.target && isValidRedirectTarget(rule.target);
  }
  return false;
}

/**
 * Auto-fill helper: parse a pasted affiliate URL into host + params, so
 * multi-parameter programs (eBay EPN et al.) don't need hand-typing.
 * Returns null when the input isn't a valid http(s) URL.
 */
export function paramsFromUrl(input: string): { host: string; params: Record<string, string> } | null {
  try {
    const u = new URL(input.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const params: Record<string, string> = {};
    u.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return { host: u.hostname.toLowerCase().replace(/^www\./, ''), params };
  } catch {
    return null;
  }
}

/**
 * Normalize whatever a user pastes into the host field down to a bare
 * hostname: full URLs (https://ppq.ai/invite/x → ppq.ai), www prefixes,
 * paths, ports, trailing dots. Forgiving input beats cryptic errors.
 */
export function normalizeHostInput(input: string): string {
  let v = input.trim().toLowerCase();
  if (v.includes('://')) {
    try {
      v = new URL(v).hostname;
    } catch {
      // Keep going — the path/port stripping below still helps.
    }
  }
  return v.split('/')[0].split(':')[0].replace(/^www\./, '').replace(/\.$/, '');
}

/**
 * Parse an affiliate-config event into a validated rule list.
 * The author filter is the trust boundary — callers must only pass events
 * whose pubkey is the owner or an owner-listed admin (`trustedAuthors`);
 * the membership check here is defense-in-depth.
 */
export function parseAffiliateRules(event: NostrEvent, trustedAuthors: Set<string>): AffiliateRule[] {
  if (event.kind !== AFFILIATES_KIND) return [];
  if (!trustedAuthors.has(event.pubkey)) return [];
  if (event.tags.find(([n]) => n === 'd')?.[1] !== AFFILIATES_D_TAG) return [];

  try {
    const parsed = JSON.parse(event.content) as unknown;
    if (!parsed || typeof parsed !== 'object') return [];
    const rules = (parsed as Record<string, unknown>).rules;
    if (!Array.isArray(rules)) return [];

    const valid: AffiliateRule[] = [];
    for (const r of rules) {
      if (!r || typeof r !== 'object') continue;
      const raw = r as Record<string, unknown>;
      if (typeof raw.host !== 'string') continue;

      // Back-compat: rules saved before `mode` existed are param-mode; rules
      // saved before `params` existed carry a single `param`/`value` pair.
      const mode: AffiliateRule['mode'] = raw.mode === 'redirect' ? 'redirect' : 'param';

      let params: Record<string, string> | undefined;
      if (raw.params && typeof raw.params === 'object' && !Array.isArray(raw.params)) {
        params = {};
        for (const [k, v] of Object.entries(raw.params as Record<string, unknown>)) {
          if (typeof v === 'string') params[k.trim()] = v.trim();
        }
      } else if (typeof raw.param === 'string' && typeof raw.value === 'string') {
        params = { [raw.param.trim()]: raw.value.trim() };
      }

      const rule: AffiliateRule = {
        host: raw.host.trim().toLowerCase().replace(/\.$/, ''),
        mode,
        params,
        target: typeof raw.target === 'string' ? raw.target.trim() : undefined,
      };
      if (isValidAffiliateRule(rule)) valid.push(rule);
    }
    return valid;
  } catch {
    return [];
  }
}

/** Build the owner-signed config event template (NIP-31 alt tag included).
 *  Single-param rules also carry legacy `param`/`value` fields so clients
 *  built before the params map keep tagging. */
export function buildAffiliateRulesEvent(rules: AffiliateRule[]): {
  kind: number;
  content: string;
  tags: string[][];
} {
  const serialized = rules.map((rule) => {
    if (rule.mode !== 'param') return rule;
    const entries = Object.entries(rule.params ?? {});
    if (entries.length !== 1) return rule;
    const [[param, value]] = entries;
    return { ...rule, param, value };
  });
  return {
    kind: AFFILIATES_KIND,
    content: JSON.stringify({ version: 1, rules: serialized }),
    tags: [
      ['d', AFFILIATES_D_TAG],
      ['t', AFFILIATES_T_TAG],
      ['alt', 'Dsearch affiliate link rules (owner-managed domain → code map)'],
    ],
  };
}

/**
 * Apply the first matching rule to a URL. Returns the input unchanged when
 * nothing matches or the URL isn't http(s). Param values go through
 * URLSearchParams, so encoding is always safe; redirect targets are
 * validated https URLs (with optional {url} substitution).
 */
export function applyAffiliateRules(url: string, rules: AffiliateRule[]): string {
  if (rules.length === 0) return url;

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return url;

  const hostname = u.hostname.toLowerCase().replace(/\.$/, '');
  for (const rule of rules) {
    if (hostname !== rule.host && !hostname.endsWith(`.${rule.host}`)) continue;

    if (rule.mode === 'redirect') {
      // Replace the destination with the referral link — that's how
      // cookie-based programs (PPQ invite, nano-gpt /r/) attribute.
      return rule.target!.split(URL_PLACEHOLDER).join(encodeURIComponent(url));
    }

    // Param mode: set the full map (existing params with the same names are
    // replaced with our codes — that is the point).
    for (const [k, v] of Object.entries(rule.params ?? {})) {
      u.searchParams.set(k, v);
    }
    return u.toString();
  }
  return url;
}
