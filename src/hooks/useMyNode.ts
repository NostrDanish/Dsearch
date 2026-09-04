/**
 * My Node — this device's contribution to the shared index.
 *
 * Reads the device's own SIP-01 observations (kind 39697 authored by the
 * per-device indexer identity) from the index relay pool. This is REAL
 * relay data: if the relays don't have it, we show zero — never a guess.
 */
import { useQuery } from '@tanstack/react-query';
import type { NostrFilter } from '@nostrify/nostrify';

import { getIndexRelayUrls } from '@/lib/appRelays';
import { queryRelayPool } from '@/lib/searchRelays';
import { getIndexerIdentity } from '@/lib/indexerIdentity';
import { WEB_INDEX_KIND, parseIndexEvent, type IndexObservation } from '@/lib/webIndex';

export interface MyObservation {
  d: string;
  url: string;
  title: string;
  observedAt: number;
}

export function useMyNode() {
  // Read (and on first ever use, create) this device's indexing identity.
  const identity = getIndexerIdentity();

  const observations = useQuery({
    queryKey: ['my-node-observations', identity.pubkeyHex],
    queryFn: async ({ signal }) => {
      const filter: NostrFilter = {
        kinds: [WEB_INDEX_KIND],
        authors: [identity.pubkeyHex],
        limit: 200,
      };
      const settled = await queryRelayPool(getIndexRelayUrls(), [filter], { signal });

      // Addressable: latest per document id.
      const byDoc = new Map<string, IndexObservation>();
      for (const events of settled) {
        for (const ev of events) {
          const obs = parseIndexEvent(ev);
          if (!obs) continue;
          const existing = byDoc.get(obs.d);
          if (!existing || obs.observedAt > existing.observedAt) byDoc.set(obs.d, obs);
        }
      }
      return [...byDoc.values()].sort((a, b) => b.observedAt - a.observedAt);
    },
    staleTime: 60_000,
    retry: 1,
  });

  return {
    identity,
    observations: observations.data,
    isLoading: observations.isLoading,
    isError: observations.isError,
  };
}
