<p align="center">
  <img src="public/brand/logo.svg" alt="Dsearch — The community-driven search engine. Powered by Nostr, owned by no one." width="480">
</p>

# Dsearch

**The community-driven search engine. Powered by Nostr, owned by no one.**

Dsearch is the **decentralized search engine built by its users** — and the home of an open
search-infrastructure ecosystem. One shared index on Nostr, built by everyone who searches,
crawls, indexes, or runs a relay. No company owns the crawler, the index, the relay network,
or this interface.

**Live:** [dsearch.com](https://dsearch.com)

[![Edit with Shakespeare](https://shakespeare.diy/badge.svg)](https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2FNostrDanish%2FDsearch.git)

---

## Brand

All brand assets live in [`public/brand/`](public/brand/):

| File | What |
|------|------|
| [`logo.svg`](public/brand/logo.svg) | Horizontal lockup — icon + wordmark + tagline (auto light/dark) |
| [`icon.svg`](public/brand/icon.svg) | The mark on its night-navy tile — the master SVG |
| [`icon-1024.png`](public/brand/icon-1024.png) | Raster icon 1024×1024 (app stores, avatars, PWA install) |
| [`favicon.svg`](public/favicon.svg) | 32px-optimized favicon |
| [`og.jpg`](public/og.jpg) | Social link preview card |

The mark: a magnifying glass whose lens holds a node constellation — search, with the
index inside. Brand amber `#f0b45a` on night navy `#070b1a`. In-app, the logo follows
the user's accent color and theme (inline SVG, `src/components/LogoMark.tsx`).

---

## The Ecosystem

Dsearch is the flagship engine of a modular stack. Every layer is open, separable, and
runnable by anyone:

```
                         ┌─────────────────┐
                         │    DSEARCH      │   ← this repo
                         │  Search Engine  │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │       SIP       │
                         │ Search Protocol │   SIP-01 (documents, v1.2)
                         └────────┬────────┘   SIP-02 (queries, draft)
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
        ┌─────▼─────┐       ┌────▼─────┐       ┌────▼─────┐
        │ CRAWLSTR  │       │ INDEXSTR │       │   SIP    │
        │  crawler  │       │  indexer │       │  RELAYS  │
        └─────┬─────┘       └────┬─────┘       └────┬─────┘
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 │
                         ┌───────▼───────┐
                         │ DECENTRALIZED │
                         │ SEARCH INDEX  │
                         └───────────────┘
```

| Component | Role | Repo | Live |
|-----------|------|------|------|
| **Dsearch** | Search engine + ecosystem hub | this repo | [dsearch.com](https://dsearch.com) |
| **SIP-01** | The protocol spec + test vectors | [SIP-01](https://github.com/NostrDanish/SIP-01) | [spec site](https://sip.shakespeare.wtf) |
| **Crawlstr** | Lightweight browser crawler | [Crawlstr](https://github.com/NostrDanish/Crawlstr) | [crawlstr.vercel.app](https://crawlstr.vercel.app) |
| **Indexstr** | Heavyweight distributed indexer | [indexstr](https://github.com/NostrDanish/indexstr) | [indexstr.vercel.app](https://indexstr.vercel.app) |
| **SIP Booster Relay** | Serverless index relay (Cloudflare) | [SIP-Booster-Relay](https://github.com/NostrDanish/SIP-Booster-Relay) | dashboard |
| **UNCAGED Index Relay** | Self-hosted index relay (OpenSearch) | [UNCAGED-Index-Relay](https://github.com/NostrDanish/UNCAGED-Index-Relay) | — |
| **Crawlstr SIP Relay** | Android index relay | [Crawlstr-SIP-Relay](https://github.com/NostrDanish/Crawlstr-SIP-Relay) | — |

**Lineage:** Dsearch consolidates several iterations of community search work —
**0xSearchstr** (the original aggregator) → **UNCAGED Engine** (the minimal template) →
**Presearchstr** (the community fork) → **Dsearch** (the independent ecosystem).
It is not a rebrand of any single predecessor: it's where the stack becomes one coherent project.

**Federation:** Dsearch and [0xSearchstr](https://github.com/NostrDanish/0xSearchstr) share one
index. Same kinds, same tags, different signers. A search on either app warms the index for both.

---

## What You Can Do Here

- **Search** — the engine: SIP-01 community index first, then 18 parallel providers (Nostr NIP-50,
  SearXNG, DuckDuckGo, Brave BYOK, Hacker News, wiki, git, Tor…). Keyword staking with your Nostr key.
- **Network** (`/network`) — live view: index relays, crawler heartbeats, latest observations.
- **Build** (`/build`) — run a crawler (Crawlstr), an indexer (Indexstr), or a SIP relay.
- **Protocol** (`/protocol`) — SIP-01 explained; SIP-02 (query layer) draft area.
- **Community** (`/community`) — every repo, every contribution path.

---

## How the Search Engine Works

```
User Search
       │
       ▼
 ┌─────────────── All providers run in parallel ──────────────┐
 │  Web Index (SIP-01) · Legacy Cache · Nostr NIP-50 · Stakes │
 │  Community · SearXNG · DuckDuckGo · Brave (BYOK) · HN ·    │
 │  Wiki (NIP-54) · Git (NIP-34) · StackOverflow · Tor · Wiki │
 └──────────────────────┬──────────────────────────────────────┘
                        │
                   Merge + Deduplicate + Rank (coverage-weighted)
                        │
                        ▼
                    Display Results  →  auto-index surfaced pages (SIP-01)
                        │
                   Still nothing? → privacy-respecting fallback links
```

1. **Every source is a provider** — each returns a universal `SearchResult[]`
2. **All providers run in parallel** — results stream in as each completes
3. **The community index scores highest** — decentralized results are prioritized
4. **Auto-indexing** — every search contributes surfaced pages back as SIP-01 observations,
   signed by a per-device pseudonymous keypair (never your identity, never your query)
5. **Never empty** — fallback links to privacy-respecting engines

### Structured queries

The search bar parses real search syntax into an AST and executes it **locally and
authoritatively** — operators are never "stripped and hoped for":

```
"decentralized search"      exact phrase        site:github.com     host + subdomains
nostr AND privacy           boolean (UPPERCASE) lang:de             language
nostr NOT twitter           exclusion           tag:nostr           exact topic tag
(nostr OR bitcoin)          grouping            after:2026-01-01    date boundary
```

This engine is the reference implementation seed for the in-development **SIP-02** query-layer
specification. Full guide: [docs/SEARCH-QUERIES.md](docs/SEARCH-QUERIES.md).

### Query classification & privacy

| Input | What happens |
|-------|--------------|
| `15% of 80` | Calculator instant answer — no providers run at all |
| `npub1…` / `note1…` | Nostr instant card — clearnet engines never see it |
| `name@domain.tld` | NIP-05 resolution to a profile card |
| `https://example.com` | SIP-01 index lookup — only Nostr-tier providers run |
| anything else | Full provider fan-out |

Provider skipping isn't just speed — it's privacy. The honest traffic-light indicator by the
search bar shows exactly who can see each query (Nostr relays / direct APIs / proxied engines).

### Keyword staking

Stake a keyword with your Nostr key — no tokens: sign an addressable event binding a keyword to
your link and it takes the top "Community Stake" placement on every compatible client. One stake
per keyword per npub; recency-ranked today, zap-weighting-ready by schema.

---

## Protocol

Everything this app writes is documented in [NIP.md](NIP.md) and the canonical
[SIP-01 spec](https://github.com/NostrDanish/SIP-01) (local copy: [docs/SIP-01.md](docs/SIP-01.md)):

- **Web document index** (`widx:*`) — SIP-01, kind 39697, per-device indexer identities
- **Search cache** (`0xsearchstr:cache:*`) — federated legacy cache, kind 30078 (frozen, read-only)
- **Term signals** (`0xsearchstr:term:*`) — hashed k-anonymity trending (never plaintext queries)
- **Community submissions** (`0xsearchstr:submit:*`) — user-curated links
- **Keyword stakes** (`0xsearchstr:stake:*`) — Nostr-native keyword placement

The `0xsearchstr:*` namespaces are the **federation contract** shared with 0xSearchstr and every
compatible fork — they are intentionally kept, not legacy accidents.

---

## Relay Pools

Four default pools, all user-editable in Settings (hide defaults, add customs, restore):

| Pool | Purpose |
|------|---------|
| **Index Relays** | Where the community index lives — SIP-01 observations, legacy cache, submissions, stakes |
| **Search Relays** | NIP-50 full-text Nostr search (read-only) |
| **Git Relays** | NIP-34 repos/issues/PRs for the Code tab (read-only) |
| **Wiki Relays** | NIP-54 wiki articles (read-only) |

Index and search pools also grow by **auto-discovery** (NIP-66 announcements + NIP-11
verification; the SIP-01 `uncaged_index` block earns a relay its index-pool spot).

---

## AI Answers (optional)

An optional AI answer layer synthesizes cited answers from the result evidence pack — off by
default, ephemeral, never indexed. Credential precedence: **your own key** (any
OpenAI-compatible API, Settings → AI) → **engine-provided** (operator key via the included
Cloudflare worker, `/api/ai`) → **built-in free tier** (public, rate-limited by design) →
unavailable. Nostr results are excluded from evidence unless you opt in.

---

## Self-Hosted Backend (legacy, optional)

The `backend/` directory contains the original 0xSearchstr-era self-hosted stack (Meilisearch +
Nostr/clearnet/Tor crawlers + NIP-50 relay proxy + abuse API, `docker compose up -d`).
It is superseded in practice by the SIP-01 ecosystem (Crawlstr/Indexstr + SIP relays) and kept
for operators who want it. New infrastructure work targets the SIP stack.

---

## Quick Start

```bash
git clone https://github.com/NostrDanish/Dsearch.git
cd Dsearch
npm install
npm run dev
```

Open `http://localhost:8080` and search.

---

## Tech Stack

React 19 · TypeScript · Vite · TailwindCSS 4 · shadcn/ui · Nostrify · TanStack Query ·
optional Cloudflare worker (engine AI proxy only)

## License

MIT

---

*Vibed with [Shakespeare](https://shakespeare.diy)*
