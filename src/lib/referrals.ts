/**
 * Partner referrals — `?ref=npub…` tracking links + affiliate-click
 * attribution, measurable on-platform with no server.
 *
 * Flow:
 *   1. A partner shares https://dsearch.com/?ref=<their npub>.
 *   2. First visit with a valid ref: the app stores the referrer
 *      (first-touch — a later link never overwrites) and publishes ONE
 *      referral ping (kind 34967, addressable, d = partner pubkey), so
 *      the partner's dashboard can count distinct referred devices.
 *   3. Whenever that visitor clicks an affiliate-tagged result link, the
 *      app publishes one click event (kind 6079, p = partner pubkey,
 *      host tag = the merchant host).
 *
 * Signing identity: a dedicated per-device key (`dsearch:ref-device-key`),
 * NOT the user's account key and NOT the SIP-01 indexer identity — votes
 * and indexing history must stay unlinkable to a referrer. Both event
 * kinds are public by design and pseudonymous; partners see counts, not
 * people.
 *
 * Honesty note: anyone can forge events for any npub. Counts are
 * indicative engagement metrics — settlement data for revenue share comes
 * from affiliate-network reports, not from these events.
 */
import { nip19 } from 'nostr-tools';
import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools/pure';
import type { NostrEvent } from '@nostrify/nostrify';

/** Referral attribution ping — addressable, one per device per partner (d = partner hex). */
export const REFERRAL_PING_KIND = 34967;
/** Affiliate click attributed to a partner — regular, one per click. */
export const AFFILIATE_CLICK_KIND = 6079;
/** Shared topic marker for both kinds. */
export const REFERRAL_T_TAG = 'dsearch-referral';

/** Invite Friends config (kind 30078, d-tag) — Dsearch control-plane data,
 *  defined in src/lib/dsearchProtocol.ts. Owner/admin-signed. */
export { DSEARCH_PROTOCOL } from '@/lib/dsearchProtocol';

const LS_REFERRER = 'dsearch:referrer';
const LS_REF_DEVICE_KEY = 'dsearch:ref-device-key';

/* ------------------------------------------------------------------ */
/* Referral configuration (Dsearch-owned; NOT referral state)          */
/* ------------------------------------------------------------------ */

export interface ReferralConfig {
  enabled: boolean;
  /** Days a first-touch attribution lasts before a new link may re-attribute. */
  attributionWindowDays: number;
}

export const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
  enabled: true,
  attributionWindowDays: 90,
};

/** Parse a dsearch:referral-config event (author trust enforced by caller). */
export function parseReferralConfig(event: NostrEvent): ReferralConfig {
  if (event.kind !== 30078) return DEFAULT_REFERRAL_CONFIG;
  try {
    const parsed = JSON.parse(event.content) as Record<string, unknown>;
    const enabled = typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_REFERRAL_CONFIG.enabled;
    const window_ = Number(parsed.attributionWindowDays);
    return {
      enabled,
      attributionWindowDays: Number.isFinite(window_) && window_ > 0 && window_ <= 3650
        ? Math.floor(window_)
        : DEFAULT_REFERRAL_CONFIG.attributionWindowDays,
    };
  } catch {
    return DEFAULT_REFERRAL_CONFIG;
  }
}

/** Build the referral-config event template (owner/admin publishes). */
export function buildReferralConfigEvent(config: ReferralConfig, dTag: string): {
  kind: number;
  content: string;
  tags: string[][];
} {
  return {
    kind: 30078,
    content: JSON.stringify({ version: 1, ...config }),
    tags: [
      ['d', dTag],
      ['t', REFERRAL_T_TAG],
      ['alt', 'Dsearch Invite Friends configuration'],
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Ref param parsing                                                   */
/* ------------------------------------------------------------------ */

/** Parse a `?ref=` value into a hex pubkey. Accepts npub / nprofile / hex. */
export function parseRefParam(input: string): string | null {
  const v = input.trim();
  if (/^[0-9a-f]{64}$/i.test(v)) return v.toLowerCase();
  try {
    const decoded = nip19.decode(v);
    if (decoded.type === 'npub') return decoded.data;
    if (decoded.type === 'nprofile') return decoded.data.pubkey;
  } catch {
    // fall through
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Stored referrer (first-touch)                                       */
/* ------------------------------------------------------------------ */

export interface StoredReferrer {
  /** Partner pubkey (hex). */
  pubkey: string;
  /** When the attribution happened (unix seconds). */
  at: number;
}

export function getStoredReferrer(): StoredReferrer | null {
  try {
    const raw = localStorage.getItem(LS_REFERRER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredReferrer>;
    if (typeof parsed.pubkey !== 'string' || !/^[0-9a-f]{64}$/i.test(parsed.pubkey)) return null;
    return { pubkey: parsed.pubkey.toLowerCase(), at: typeof parsed.at === 'number' ? parsed.at : 0 };
  } catch {
    return null;
  }
}

/**
 * First-touch within the attribution window: an existing in-window
 * attribution is never overwritten (partners can't poach each other by
 * getting the same person to click again). After the window expires, a new
 * link may re-attribute. Returns true when the attribution was stored —
 * the caller pings only then.
 */
export function storeReferrer(pubkey: string, attributionWindowDays: number): boolean {
  try {
    const existing = getStoredReferrer();
    if (existing) {
      if (existing.pubkey === pubkey) return false; // same partner — nothing to re-attribute
      const ageDays = (Math.floor(Date.now() / 1000) - existing.at) / 86_400;
      if (ageDays <= attributionWindowDays) return false;
    }
    localStorage.setItem(LS_REFERRER, JSON.stringify({ pubkey, at: Math.floor(Date.now() / 1000) }));
    return true;
  } catch {
    // Storage unavailable — referral simply won't attribute.
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Per-device analytics key (separate from account + indexer identity) */
/* ------------------------------------------------------------------ */

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getReferralDeviceSecret(): string {
  try {
    const existing = localStorage.getItem(LS_REF_DEVICE_KEY);
    if (existing && /^[0-9a-f]{64}$/i.test(existing)) return existing.toLowerCase();
    const sk = generateSecretKey();
    const hex = (typeof sk === 'string' ? sk : bytesToHex(sk as Uint8Array)).toLowerCase();
    localStorage.setItem(LS_REF_DEVICE_KEY, hex);
    return hex;
  } catch {
    // Storage unavailable — session-only key; the ping dedupes per session at worst.
    const sk = generateSecretKey();
    return (typeof sk === 'string' ? sk : bytesToHex(sk as Uint8Array)).toLowerCase();
  }
}

/* ------------------------------------------------------------------ */
/* Event builders                                                      */
/* ------------------------------------------------------------------ */

/** The referral ping — addressable so one device = one event per partner. */
export function buildReferralPing(partnerPubkey: string): NostrEvent {
  const sk = hexToBytes(getReferralDeviceSecret());
  return finalizeEvent(
    {
      kind: REFERRAL_PING_KIND,
      content: '',
      tags: [
        ['d', partnerPubkey],
        ['p', partnerPubkey],
        ['t', REFERRAL_T_TAG],
        ['alt', 'Dsearch referral attribution ping (one per device per partner)'],
      ],
      created_at: Math.floor(Date.now() / 1000),
    },
    sk,
  );
}

/** One affiliate click credited to the stored referrer. */
export function buildAffiliateClick(partnerPubkey: string, host: string): NostrEvent {
  const sk = hexToBytes(getReferralDeviceSecret());
  return finalizeEvent(
    {
      kind: AFFILIATE_CLICK_KIND,
      content: '',
      tags: [
        ['p', partnerPubkey],
        ['t', REFERRAL_T_TAG],
        ['host', host],
        ['alt', 'Dsearch affiliate click credited to a referral partner'],
      ],
      created_at: Math.floor(Date.now() / 1000),
    },
    sk,
  );
}

/** Device pubkey for the analytics key (dashboards never need this — events carry p-tags). */
export function getReferralDevicePubkey(): string {
  const pub = getPublicKey(hexToBytes(getReferralDeviceSecret()));
  return typeof pub === 'string' ? pub : bytesToHex(pub as Uint8Array);
}
