/**
 * ReferralCapture — mounts inside the app providers, renders nothing.
 *
 * Reads `?ref=` once: validates it as a Nostr identity (npub / nprofile /
 * hex → normalized 32-byte hex pubkey), refuses SELF-referral (a logged-in
 * user following their own link never attributes), respects the owner/admin
 * referral config (dsearch:referral-config — enabled + attribution window),
 * persists first-touch attribution in localStorage (survives refresh /
 * restart / login / logout), and publishes ONE referral ping (kind 34967,
 * addressable per device per partner) for the partner dashboard.
 *
 * Security: the ref parameter is ATTRIBUTION ONLY. It never grants any
 * authority — admin/affiliate/config permissions come from owner-signed
 * role lists, never from a URL.
 */
import { useEffect } from 'react';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReferralConfig } from '@/hooks/useReferrals';
import { publishToRelayPool } from '@/lib/searchRelays';
import { getModerationRelayUrls } from '@/lib/moderation';
import { parseRefParam, storeReferrer, buildReferralPing } from '@/lib/referrals';

export function ReferralCapture() {
  const { user } = useCurrentUser();
  const { config, isLoading } = useReferralConfig();

  useEffect(() => {
    if (isLoading) return; // wait for the config decision (defaults apply if absent)
    if (!config.enabled) return;

    const ref = new URLSearchParams(window.location.search).get('ref');
    if (!ref) return;
    const pubkey = parseRefParam(ref);
    if (!pubkey) return;

    // Self-referral guard: your own link on your own logged-in session
    // must never create attribution.
    if (user && user.pubkey === pubkey) return;

    // First-touch within the attribution window; a ping only when the
    // attribution was actually (re)stored.
    const stored = storeReferrer(pubkey, config.attributionWindowDays);
    if (!stored) return;

    // Fire-and-forget — a lost ping only means an undercounted referral.
    void publishToRelayPool(getModerationRelayUrls(), buildReferralPing(pubkey), 5000).catch(() => {});
  }, [user, config, isLoading]);

  return null;
}
