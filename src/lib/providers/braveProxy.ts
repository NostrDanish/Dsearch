/**
 * Engine-provided Brave Search — shared proxy logic.
 *
 * Mirrors the AI proxy: the Brave subscription token never leaves the
 * worker. The browser posts a query to same-origin `/api/search/brave`
 * and gets normalized JSON back. No key in the bundle, localStorage, or
 * any public response.
 */

export const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

export interface BraveProxyEnv {
  BRAVE_API_KEY?: string;
}

export interface BraveProxyRequest {
  q: string;
  count: number;
  search_lang?: string;
}

export function braveConfigured(env: BraveProxyEnv): boolean {
  return (env.BRAVE_API_KEY?.trim().length ?? 0) > 0;
}

/** Validate an inbound Brave proxy body. Returns an error string or the payload. */
export function validateBravePayload(body: unknown): BraveProxyRequest | string {
  if (!body || typeof body !== 'object') return 'Body must be a JSON object';
  const raw = body as Record<string, unknown>;
  if (typeof raw.q !== 'string' || raw.q.trim().length === 0) return 'q must be a non-empty string';
  if (raw.q.length > 500) return 'q is too long';

  let count = 20;
  if (raw.count !== undefined) {
    const n = Number(raw.count);
    if (!Number.isFinite(n) || n <= 0) return 'count must be a positive number';
    count = Math.min(Math.floor(n), 20);
  }

  let search_lang: string | undefined;
  if (raw.search_lang !== undefined) {
    if (typeof raw.search_lang !== 'string' || !/^[a-z]{2}$/.test(raw.search_lang)) {
      return 'search_lang must be a 2-letter language code';
    }
    search_lang = raw.search_lang;
  }

  return { q: raw.q.trim(), count, search_lang };
}

export function buildBraveSearchUrl(req: BraveProxyRequest): string {
  const params = new URLSearchParams({
    q: req.q,
    count: String(req.count),
    text_decorations: '0',
  });
  if (req.search_lang) params.set('search_lang', req.search_lang);
  return `${BRAVE_API_URL}?${params}`;
}
