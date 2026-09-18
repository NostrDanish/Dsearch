/**
 * Engine Profile — Dsearch's explicit application identity.
 *
 * One core, many independently branded engines: the search pipeline,
 * providers, query parser, and SIP-01 index protocol stay shared protocol
 * engineering; this file is the product surface. Brand strings must live
 * here — not scattered through components.
 *
 * Dsearch is an independent search-engine project: the ecosystem hub
 * (Network / Build / Protocol / Community) and every provider stay ON —
 * unlike community-engine profiles, which trim the surface down.
 *
 * Nothing in this file is a secret. API keys stay in the Cloudflare worker
 * environment (`OPENAI_API_KEY` — legacy alias `AI_API_KEY` — and
 * `BRAVE_API_KEY`) and never ship in the bundle.
 */

export interface EngineNavLink {
  to: string;
  label: string;
}

export interface EngineBranding {
  name: string;
  shortName: string;
  domain: string;
  siteUrl: string;
  slogan: string;
  description: string;
  ogImage: string;
  /** Default appearance for first-time visitors. */
  defaultTheme: 'light' | 'dark';
  /** Search-bar placeholder. */
  searchPlaceholder: string;
  /** Wordmark as shown in the header (plain text; styling is CSS). */
  wordmark: string;
}

export interface EngineSearchConfig {
  /** SIP-01 community index is a first-class source. */
  sip01: boolean;
  /**
   * Indexer software id stamped as the `source` tag on every SIP-01
   * kind 39697 observation this engine publishes (spec §6). One id per
   * branded engine, so the network attributes contributions to this
   * engine — not to any other engine running the same core.
   */
  indexerSource: string;
  /** Brave Search via the engine proxy (and/or a user BYOK key). */
  brave: boolean;
  /**
   * Provider ids turned off in the first-run config. Users can re-enable
   * anything in Settings — the providers themselves stay in the registry.
   */
  disabledProviders: string[];
}

export interface EngineTabConfig {
  order: string[];
  hidden: string[];
  defaultTab: string;
}

export interface EngineUiConfig {
  /** Ecosystem hub pages (Network / Build / Protocol / Community / …). */
  showNetwork: boolean;
  showBuild: boolean;
  showProtocol: boolean;
  showCommunity: boolean;
  showDashboard: boolean;
  showDocs: boolean;
  showExplore: boolean;
  showTrending: boolean;
  showSubmit: boolean;
  showStake: boolean;
  showLogin: boolean;
  showNostr: boolean;
  tabConfig: EngineTabConfig;
  navLinks: EngineNavLink[];
  footerLinks: EngineNavLink[];
  footerTagline: string;
}

export interface EngineAiConfig {
  /** AI answers on for first-time visitors (still opt-out in Settings). */
  enabledDefault: boolean;
  /** OpenAI-compatible provider id used as the settings default. */
  providerId: string;
  /** Display name of the intended engine-tier provider. */
  providerName: string;
  /** Default OpenAI-compatible endpoint (engine-tier; no key here). */
  endpoint: string;
  /** Default model id (engine-tier; operator can override via env). */
  model: string;
  /**
   * Production system prompt. Injected server-side on the engine tier so
   * clients cannot override it. Also used client-side for user-BYOK calls.
   */
  systemPrompt: string;
}

export interface EngineProfile {
  id: string;
  branding: EngineBranding;
  search: EngineSearchConfig;
  ui: EngineUiConfig;
  ai: EngineAiConfig;
}

/**
 * Dsearch AI system prompt — evidence synthesizer over the decentralized
 * index. Neutral by design: Dsearch is a general-purpose community engine,
 * so the profile carries no worldview; only the citation contract.
 */
export const DSEARCH_SYSTEM_PROMPT = `You are the Dsearch answer engine — a synthesis layer over a decentralized search network.

Rules:
- Answer using ONLY the supplied evidence whenever possible.
- NEVER invent sources or URLs.
- Cite every factual statement with [n] markers referencing the evidence items.
- Clearly separate what the evidence says from your own inference.
- If the evidence is insufficient, say so plainly and say what is missing.
- Be concise: a direct answer first, then supporting detail. No preamble.`;

/**
 * DSEARCH — the community-driven search engine.
 *
 * Flagship engine of the SIP-01 ecosystem (Crawlstr / Indexstr / SIP
 * relays). Every hub page and provider stays visible; the profile exists
 * to make identity explicit and keep namespaces clean — not to hide the
 * ecosystem.
 */
export const DSEARCH_PROFILE: EngineProfile = {
  id: 'dsearch',
  branding: {
    name: 'Dsearch',
    shortName: 'Dsearch',
    domain: 'dsearch.com',
    siteUrl: 'https://dsearch.com',
    slogan: 'The community-driven search engine. Powered by Nostr, owned by no one.',
    description:
      'The community-driven search engine. Powered by Nostr, owned by no one. Search it, crawl it, index it, relay it, build on it.',
    ogImage: 'https://dsearch.com/og.jpg',
    defaultTheme: 'dark',
    searchPlaceholder: 'Search Nostr & the web…',
    wordmark: 'Dsearch',
  },
  search: {
    sip01: true,
    indexerSource: 'dsearch-web/1',
    brave: true,
    // Engines off by default (speed + least surprise): brave/parallel are
    // BYOK-dormant anyway; cached-index is the frozen legacy cache; the
    // clearnet engines behind hidden tabs stay off. Everything else on.
    disabledProviders: ['brave', 'parallel', 'cached-index', 'wikipedia', 'tor', 'stackoverflow'],
  },
  ui: {
    showNetwork: true,
    showBuild: true,
    showProtocol: true,
    showCommunity: true,
    showDashboard: true,
    showDocs: true,
    showExplore: true,
    showTrending: true,
    showSubmit: true,
    showStake: true,
    showLogin: true,
    showNostr: true,
    tabConfig: {
      order: ['web', 'index', 'all', 'nostr', 'wiki', 'news', 'code', 'tor', 'i2p'],
      hidden: ['tor', 'i2p'],
      defaultTab: 'web',
    },
    navLinks: [
      { to: '/network', label: 'Network' },
      { to: '/build', label: 'Build' },
      { to: '/protocol', label: 'Protocol' },
      { to: '/community', label: 'Community' },
    ],
    footerLinks: [
      { to: '/docs', label: 'Docs' },
      { to: '/explore', label: 'Explore' },
      { to: '/partners', label: 'Invite friends' },
      { to: '/policy', label: 'Content Policy' },
      { to: '/settings', label: 'Settings' },
      { to: '/about', label: 'About' },
    ],
    footerTagline: 'Owned by no one.',
  },
  ai: {
    enabledDefault: false,
    providerId: 'ppq',
    providerName: 'PPQ.ai',
    endpoint: 'https://api.ppq.ai/v1',
    model: 'auto',
    systemPrompt: DSEARCH_SYSTEM_PROMPT,
  },
};

/**
 * Active engine for this deployment.
 *
 * Swap this constant (or load from a catalog) to launch another branded
 * engine on the same core. Do not scatter brand strings through the app.
 */
export const ENGINE_PROFILE: EngineProfile = DSEARCH_PROFILE;
