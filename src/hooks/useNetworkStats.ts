/**
 * Network overview hooks — live status for the Dsearch / SIP-01 network page.
 *
 * Three read paths, all client-side, all read-only:
 *   1. Relay NIP-11 documents (HTTP) — which index relays are alive and
 *      what they advertise (the `uncaged_index` block marks SIP-01 relays).
 *   2. Crawler/indexer heartbeats (kind 16919) — self-reported "this node
 *      is alive" signals from Crawlstr/Indexstr nodes. Network-health
 *      estimates only, never reputation.
 *   3. (Reused elsewhere) kind 39697 observations — the index itself.
 */
import { useQuery } from '@tanstack/react-query';
import type { NostrFilter } from '@nostrify/nostrify';

import { getIndexRelayUrls } from '@/lib/appRelays';
import { queryRelayPool } from '@/lib/searchRelays';

/* ------------------------------------------------------------------ */
/* Relay status (NIP-11)                                               */
/* ------------------------------------------------------------------ */

export interface RelayStatus {
  /** The wss:// URL from the pool. */
  url: string;
  /** Relay-reported name (NIP-11), when reachable. */
  name?: string;
  /** Relay software URL (NIP-11), when advertised. */
  software?: string;
  /** Supported NIPs (NIP-11). */
  supportedNips: number[];
  /** True when the relay advertises the SIP-01 `uncaged_index` block. */
  sip01: boolean;
  /** True when the NIP-11 document could be fetched at all. */
  reachable: boolean;
  /** Why it's unreachable, for the tooltip. */
  error?: string;
}

/** Convert a ws(s) relay URL to its https(s) NIP-11 document URL. */
function nip11Url(relayUrl: string): string | null {
  try {
    const u = new URL(relayUrl);
    if (u.protocol === 'wss:') u.protocol = 'https:';
    else if (u.protocol === 'ws:') u.protocol = 'http:';
    else return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchRelayStatus(url: string): Promise<RelayStatus> {
  const httpUrl = nip11Url(url);
  if (!httpUrl) {
    return { url, supportedNips: [], sip01: false, reachable: false, error: 'unsupported URL scheme' };
  }
  try {
    const res = await fetch(httpUrl, {
      headers: { Accept: 'application/nostr+json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = await res.json() as {
      name?: string;
      software?: string;
      supported_nips?: number[];
      uncaged_index?: { sip01?: boolean };
    };
    return {
      url,
      name: typeof doc.name === 'string' ? doc.name : undefined,
      software: typeof doc.software === 'string' ? doc.software : undefined,
      supportedNips: Array.isArray(doc.supported_nips) ? doc.supported_nips.filter((n) => typeof n === 'number') : [],
      sip01: doc.uncaged_index?.sip01 === true,
      reachable: true,
    };
  } catch (err) {
    return {
      url,
      supportedNips: [],
      sip01: false,
      reachable: false,
      error: err instanceof Error ? err.message : 'unreachable',
    };
  }
}

/** Live NIP-11 status for every relay in the effective index pool. */
export function useIndexRelayStatus() {
  const urls = getIndexRelayUrls();
  return useQuery({
    queryKey: ['index-relay-status', urls],
    queryFn: async () => {
      const results = await Promise.all(urls.map(fetchRelayStatus));
      // Online first, then SIP-01-capable, then alphabetical.
      return results.sort((a, b) => {
        if (a.reachable !== b.reachable) return a.reachable ? -1 : 1;
        if (a.sip01 !== b.sip01) return a.sip01 ? -1 : 1;
        return a.url.localeCompare(b.url);
      });
    },
    staleTime: 60_000,
    retry: 0,
  });
}

/* ------------------------------------------------------------------ */
/* Indexer heartbeats (kind 16919)                                     */
/* ------------------------------------------------------------------ */

/** Replaceable heartbeat kind shared by Crawlstr/Indexstr nodes. */
export const NODE_HEARTBEAT_KIND = 16919;
/** Heartbeats older than this are considered offline. */
const HEARTBEAT_TTL_S = 3600;

export interface NodeHeartbeat {
  pubkey: string;
  shard?: string;
  platform?: string;
  network?: string;
  source?: string;
  pagesIndexed?: number;
  published?: number;
  createdAt: number;
  online: boolean;
}

function parseHeartbeat(ev: { pubkey: string; created_at: number; content: string; tags: string[][] }): NodeHeartbeat | null {
  let payload: { shard?: string; platform?: string; network?: string; stats?: { pagesIndexed?: number; published?: number } } = {};
  try {
    payload = JSON.parse(ev.content) as typeof payload;
  } catch {
    // Some nodes publish tag-only heartbeats — tags alone still count.
  }
  const tag = (name: string) => ev.tags.find(([n]) => n === name)?.[1];
  const now = Math.floor(Date.now() / 1000);
  return {
    pubkey: ev.pubkey,
    shard: payload.shard ?? tag('shard'),
    platform: payload.platform,
    network: payload.network,
    source: tag('source'),
    pagesIndexed: payload.stats?.pagesIndexed,
    published: payload.stats?.published,
    createdAt: ev.created_at,
    online: now - ev.created_at < HEARTBEAT_TTL_S,
  };
}

/** Recent crawler/indexer heartbeats across the index relay pool. */
export function useNodeHeartbeats() {
  return useQuery({
    queryKey: ['node-heartbeats'],
    queryFn: async ({ signal }) => {
      const filter: NostrFilter = {
        kinds: [NODE_HEARTBEAT_KIND],
        limit: 200,
      };
      const settled = await queryRelayPool(getIndexRelayUrls(), [filter], { signal });

      // Replaceable kind: latest per pubkey wins.
      const byNode = new Map<string, NodeHeartbeat>();
      for (const events of settled) {
        for (const ev of events) {
          const hb = parseHeartbeat(ev);
          if (!hb) continue;
          const existing = byNode.get(ev.pubkey);
          if (!existing || hb.createdAt > existing.createdAt) byNode.set(ev.pubkey, hb);
        }
      }
      return [...byNode.values()].sort((a, b) => b.createdAt - a.createdAt);
    },
    staleTime: 60_000,
    retry: 1,
  });
}
