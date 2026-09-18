/**
 * Moderation — team-signed result filtering (NIP-32 labels + NIP-09 deletes).
 *
 * Team members publish kind 1985 label events marking results as hidden:
 *
 *   ["L", "dsearch.moderation"]            ← canonical namespace
 *   ["l", "hidden", "dsearch.moderation"]  ← label
 *   ["u", "<normalized-url>"]              ← target (web result)
 *   ["e", "<event-id>"]                    ← target (Nostr result)
 *
 * Readers (every user of the app) filter their own result lists against
 * labels signed by trusted team pubkeys ONLY (owner + owner-signed role
 * lists) — the author filter is the trust boundary; anyone can write a
 * label, only the team's count.
 *
 * Namespaces: writes go to the canonical `dsearch:*` control plane
 * (src/lib/dsearchProtocol.ts); labels/reports under the legacy
 * `0xsearchstr.*` namespaces remain READ-ONLY until migrated.
 *
 * Un-hiding = NIP-09 deletion (kind 5 with an e-tag of the label event).
 *
 * Abuse reports filed from the Policy page are NIP-56 kind 1984 events
 * labeled under the `dsearch.abuse` namespace — the dashboard reads them
 * (canonical + legacy) and turns them into moderation labels in one click.
 *
 * ⚠️ KEY NOTE: OWNER_PUBKEY is the project owner's personal key — its nsec
 * lives only in the owner's own signer, never in this codebase. Running a
 * fork? Replace it with your own pubkey (a one-line change) or the role
 * lists and moderation labels you sign won't be trusted by your deployment.
 */
import type { NostrEvent } from '@nostrify/nostrify';

import { normalizeIndexUrl } from '@/lib/webIndex';
import { APP_RELAYS, getIndexRelayUrls, getSearchRelayUrls } from '@/lib/appRelays';
import {
  OWNER_PUBKEY,
  DSEARCH_PROTOCOL,
  LEGACY_PROTOCOL,
  isModerationNs,
} from '@/lib/dsearchProtocol';

export { OWNER_PUBKEY };

/** Relays moderation data (labels, role lists, reports) is read from. */
export function getModerationRelayUrls(): string[] {
  return [
    ...new Set([
      ...getIndexRelayUrls(),
      ...getSearchRelayUrls(),
      // The owner's write relays (role lists + labels land here via NIP-65).
      ...APP_RELAYS.relays.map((r) => r.url),
    ]),
  ];
}

/** NIP-32 label kind. */
export const MODERATION_KIND = 1985;

/**
 * Label namespaces for moderation actions. Writes go to the canonical
 * Dsearch namespace only; legacy namespaces remain readable (owner/team
 * signed) until the owner migrates them. See src/lib/dsearchProtocol.ts.
 */
export const MODERATION_NS = DSEARCH_PROTOCOL.moderation;
export const LEGACY_MODERATION_NS = LEGACY_PROTOCOL.moderation;

/** NIP-56 report kind (Policy page abuse reports). */
export const REPORT_KIND = 1984;

/** Abuse-report label namespaces (canonical write, legacy read-only). */
export const REPORT_NS = DSEARCH_PROTOCOL.abuse;
export const LEGACY_REPORT_NS = LEGACY_PROTOCOL.abuse;

/* ------------------------------------------------------------------ */
/* Roles (owner-managed team lists)                                    */
/* ------------------------------------------------------------------ */

/**
 * Role lists: addressable kind 30078 events signed by the OWNER.
 * Content is a JSON array of hex pubkeys. Readers trust the owner's
 * signature only — the d-tag alone is not a trust boundary.
 *
 * Canonical d-tags are `dsearch:*`; the legacy `presearchstr:*` lists stay
 * READ-ONLY (owner-signed) until migrated — see src/lib/dsearchProtocol.ts.
 *
 * Pattern adapted from 0xNostr-Relay-Finder's dashboard.
 */
export const ROLES_KIND = 30078;
export const ADMIN_ROLES_D_TAG = DSEARCH_PROTOCOL.adminRoles;
export const MOD_ROLES_D_TAG = DSEARCH_PROTOCOL.moderatorRoles;
export const LEGACY_ADMIN_ROLES_D_TAG = LEGACY_PROTOCOL.adminRoles;
export const LEGACY_MOD_ROLES_D_TAG = LEGACY_PROTOCOL.moderatorRoles;
export const ROLES_T_TAG = DSEARCH_PROTOCOL.rolesTag;

export type { AppRole } from '@/lib/dsearchProtocol';

/** Build a role list event (owner publishes). */
export function buildRoleListEvent(dTag: string, pubkeys: string[]): {
  kind: number;
  content: string;
  tags: string[][];
} {
  const label = dTag === ADMIN_ROLES_D_TAG ? 'admin' : 'moderator';
  return {
    kind: ROLES_KIND,
    content: JSON.stringify(pubkeys),
    tags: [
      ['d', dTag],
      ['t', ROLES_T_TAG],
      ['alt', `Dsearch ${label} list`],
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Types + parsing                                                     */
/* ------------------------------------------------------------------ */

export interface HiddenTarget {
  /** Label event id (needed for un-hide via NIP-09). */
  labelEventId: string;
  /** 'u' (web URL, normalized) or 'e' (Nostr event id). */
  targetType: 'u' | 'e';
  /** The target value (normalized URL or event id hex). */
  value: string;
  /** When the label was published. */
  createdAt: number;
}

/** Parse a kind 1985 "hidden" label. Returns null if invalid or untrusted.
 *  Reads both the canonical dsearch namespace and the legacy 0xsearchstr
 *  namespace (team-signed only — the author filter stays the boundary).
 *  URL targets read BOTH `r` (NIP-32-correct — written by current code)
 *  and `u` (legacy labels) tags. */
export function parseHiddenLabel(event: NostrEvent, trusted: Set<string> = new Set([OWNER_PUBKEY])): HiddenTarget | null {
  if (event.kind !== MODERATION_KIND) return null;
  if (!trusted.has(event.pubkey)) return null; // trust boundary

  // Canonical + legacy namespaces both hide (read path; writes are canonical).
  const isHidden = event.tags.some(([n, v, ns]) => n === 'l' && v === 'hidden' && isModerationNs(ns));
  if (!isHidden) return null;

  const urlTag = event.tags.find(([n]) => n === 'r')?.[1] ?? event.tags.find(([n]) => n === 'u')?.[1];
  const eTag = event.tags.find(([n]) => n === 'e')?.[1];
  if (urlTag) return { labelEventId: event.id, targetType: 'u', value: urlTag, createdAt: event.created_at };
  if (eTag && /^[0-9a-f]{64}$/i.test(eTag)) {
    return { labelEventId: event.id, targetType: 'e', value: eTag.toLowerCase(), createdAt: event.created_at };
  }
  return null;
}

/** Build a kind 1985 "hidden" label for a target (URL or event id). */
export function buildHideLabel(target: { url?: string; eventId?: string }): {
  kind: number;
  content: string;
  tags: string[][];
} | null {
  // NIP-32 label targets are e/p/a/r/t — a web URL is an `r` tag. (Legacy
  // labels used `u`; readers accept both.)
  const targetTag = target.url
    ? ['r', normalizeIndexUrl(target.url) ?? target.url.trim()]
    : target.eventId && /^[0-9a-f]{64}$/i.test(target.eventId)
      ? ['e', target.eventId.toLowerCase()]
      : null;
  if (!targetTag) return null;

  return {
    kind: MODERATION_KIND,
    content: '',
    tags: [
      ['L', MODERATION_NS],
      ['l', 'hidden', MODERATION_NS],
      targetTag,
      ['alt', `Dsearch moderation: hidden ${targetTag[0] === 'r' ? targetTag[1] : 'event'}`],
    ],
  };
}

/** Build a NIP-09 deletion request for a label event (un-hide).
 *  Includes the `k` tag NIP-09 asks for (kind of the deleted event). */
export function buildUnhideDelete(labelEventId: string): { kind: number; content: string; tags: string[][] } {
  return {
    kind: 5,
    content: 'Un-hide result',
    tags: [['e', labelEventId], ['k', String(MODERATION_KIND)]],
  };
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

/** A set of hidden targets for fast result filtering. */
export interface ModerationSet {
  urls: Set<string>;
  eventIds: Set<string>;
}

export function toModerationSet(targets: HiddenTarget[]): ModerationSet {
  return {
    urls: new Set(targets.filter((t) => t.targetType === 'u').map((t) => t.value)),
    eventIds: new Set(targets.filter((t) => t.targetType === 'e').map((t) => t.value)),
  };
}

/** Is this result hidden by the moderation set? */
export function isHiddenResult(
  result: { url: string; nostrEvent?: { id: string } },
  set: ModerationSet,
): boolean {
  if (result.nostrEvent && set.eventIds.has(result.nostrEvent.id)) return true;
  const normalized = normalizeIndexUrl(result.url);
  if (normalized && set.urls.has(normalized)) return true;
  return false;
}
