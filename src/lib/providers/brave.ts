/**
 * Brave Search provider — official Brave Search API.
 *
 * Credential order (never both in one request):
 *   1. User BYOK key in localStorage — query goes to Brave via the CORS
 *      proxy (the proxy sees query + key). The original Dsearch path.
 *   2. Engine-provided Brave — same-origin POST /api/search/brave. The
 *      worker injects BRAVE_API_KEY. No key in the browser.
 *   3. Neither → zero-cost no-op.
 *
 * The engine path is how Dsearch can offer Brave without exposing a
 * shared key — the 0xSigner pattern: secrets live server-side, browsers
 * call the same-origin proxy.
 */
import type { SearchProvider, SearchOptions, ProviderSearchResponse, SearchResult } from './types';
import { proxiedFetch } from '@/lib/corsProxy';
import { getWebEngineBases } from './enginePriority';
import { braveLanguageParam } from '@/lib/languageFilter';
import { toEngineQuery } from '@/lib/queryParser';
import { ENGINE_AI_BASE } from '@/lib/aiConfig';
import { readStoredWithLegacy, writeStoredCanonical } from '@/lib/dsearchProtocol';

const LS_BRAVE_KEY = 'dsearch:brave-api-key';
const LEGACY_LS_BRAVE_KEY = 'presearchstr:brave-api-key';
const API_URL = 'https://api.search.brave.com/res/v1/web/search';
// Engine Brave lives on the same worker as engine AI (/api/ai ↔ /api/search).
const ENGINE_BRAVE_URL = `${ENGINE_AI_BASE.replace(/\/ai$/, '')}/search/brave`;

/** Read the user's Brave API key (empty when unset). */
export function getBraveApiKey(): string {
  try {
    return (readStoredWithLegacy(LS_BRAVE_KEY, LEGACY_LS_BRAVE_KEY) ?? '').trim();
  } catch {
    return '';
  }
}

/** Store/clear the user's Brave API key (Settings). */
export function setBraveApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    writeStoredCanonical(LS_BRAVE_KEY, LEGACY_LS_BRAVE_KEY, trimmed || null);
  } catch {
    // Storage unavailable — the provider just stays dormant.
  }
}

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
  age?: string;
}

interface BraveSearchResponse {
  web?: { results?: BraveWebResult[] };
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function mapResults(raw: BraveWebResult[], limit: number): SearchResult[] {
  return raw
    .filter((r): r is BraveWebResult & { title: string; url: string } => !!r.title && !!r.url)
    .slice(0, limit)
    .map((r, i) => ({
      id: `brave-${r.url}`,
      title: r.title,
      url: r.url,
      snippet: r.description ?? '',
      source: 'web',
      provider: 'brave',
      domain: extractDomain(r.url),
      engine: 'Brave',
      // Leads the organic web band when a key/engine tier exists;
      // otherwise dormant — see enginePriority.ts.
      score: getWebEngineBases().brave - i * 0.5,
    }));
}

export const braveProvider: SearchProvider = {
  id: 'brave',
  name: 'Brave',
  source: 'web',
  privacy: 'proxied',
  privacyNote: 'Brave Search API. With your own key, the query + key go to Brave via the CORS proxy. With engine-provided Brave, the query goes to this site\'s same-origin proxy (the key never reaches the browser). No key anywhere = provider inactive.',

  async search({ query, signal, limit = 20, languages, parsed }: SearchOptions): Promise<ProviderSearchResponse> {
    if (!query.trim()) return { results: [] };

    // Brave natively understands -exclusions, quotes, site:, intitle:,
    // before:/after: — the translation layer maps our syntax onto it.
    const engineQuery = parsed ? toEngineQuery(parsed) : query.trim();
    if (!engineQuery) return { results: [] };

    // Result language filter: Brave honors one search_lang server-side.
    // An explicit lang: operator in the query overrides the Settings filter.
    const queryLangs = parsed?.filters.filter((f) => f.field === 'lang' && !f.negated).map((f) => f.value.toLowerCase());
    const lang = braveLanguageParam(queryLangs && queryLangs.length > 0 ? queryLangs : (languages ?? []));
    const count = Math.min(limit, 20);
    const apiKey = getBraveApiKey();

    try {
      if (apiKey) {
        const params = new URLSearchParams({
          q: engineQuery,
          count: String(count),
          text_decorations: '0',
        });
        if (lang) params.set('search_lang', lang);

        const res = await proxiedFetch(`${API_URL}?${params}`, {
          signal,
          headers: {
            Accept: 'application/json',
            'X-Subscription-Token': apiKey,
          },
        });
        if (!res.ok) return { results: [] };
        const data = (await res.json()) as BraveSearchResponse;
        return { results: mapResults(data.web?.results ?? [], limit) };
      }

      // Engine-provided Brave — no key in the browser.
      const res = await fetch(ENGINE_BRAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ q: engineQuery, count, search_lang: lang || undefined }),
        signal,
      });
      if (!res.ok) return { results: [] };
      const data = (await res.json()) as BraveSearchResponse;
      return { results: mapResults(data.web?.results ?? [], limit) };
    } catch {
      return { results: [] };
    }
  },
};
