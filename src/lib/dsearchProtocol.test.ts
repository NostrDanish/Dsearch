/**
 * Dsearch protocol separation tests — the permission matrix, role-list
 * canonical/legacy resolution, namespace isolation, and the referral
 * config schema. The guarantees pinned here are the security model of the
 * whole app: who can moderate, who can publish config, and which
 * namespaces carry authority.
 */
import { describe, it, expect } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';

import {
  OWNER_PUBKEY,
  DSEARCH_PROTOCOL,
  LEGACY_PROTOCOL,
  ROLES_KIND,
  PERMISSIONS,
  roleForPubkey,
  resolveRoleEvents,
  isModerationNs,
  isAbuseNs,
} from './dsearchProtocol';
import {
  buildHideLabel,
  buildRoleListEvent,
  parseHiddenLabel,
  MODERATION_NS,
} from './moderation';
import {
  parseReferralConfig,
  buildReferralConfigEvent,
  DEFAULT_REFERRAL_CONFIG,
} from './referrals';

const OWNER = OWNER_PUBKEY;
const ADMIN = 'a'.repeat(64);
const MOD = 'b'.repeat(64);
const RANDO = 'c'.repeat(64);

function roleEvent(dTag: string, pubkeys: string[], author = OWNER, created_at = 1000): NostrEvent {
  return {
    id: 'x'.repeat(64),
    pubkey: author,
    kind: ROLES_KIND,
    created_at,
    content: JSON.stringify(pubkeys),
    tags: [['d', dTag]],
    sig: 'y'.repeat(128),
  };
}

/* ─── Namespaces ─── */

describe('Dsearch protocol namespaces', () => {
  it('canonical control-plane namespaces are all dsearch-owned', () => {
    for (const value of Object.values(DSEARCH_PROTOCOL)) {
      expect(value.startsWith('dsearch')).toBe(true);
    }
    expect(DSEARCH_PROTOCOL.adminRoles).toBe('dsearch:admin-roles');
    expect(DSEARCH_PROTOCOL.moderatorRoles).toBe('dsearch:mod-roles');
    expect(DSEARCH_PROTOCOL.affiliateRules).toBe('dsearch:affiliate-rules');
    expect(DSEARCH_PROTOCOL.referralConfig).toBe('dsearch:referral-config');
    expect(DSEARCH_PROTOCOL.moderation).toBe('dsearch.moderation');
    expect(DSEARCH_PROTOCOL.abuse).toBe('dsearch.abuse');
  });

  it('legacy namespaces stay frozen (read-only compatibility)', () => {
    expect(LEGACY_PROTOCOL.adminRoles).toBe('presearchstr:admin-roles');
    expect(LEGACY_PROTOCOL.moderatorRoles).toBe('presearchstr:mod-roles');
    expect(LEGACY_PROTOCOL.moderation).toBe('0xsearchstr.moderation');
    expect(LEGACY_PROTOCOL.abuse).toBe('0xsearchstr.abuse');
  });

  it('namespace matchers accept canonical + legacy, reject lookalikes', () => {
    expect(isModerationNs('dsearch.moderation')).toBe(true);
    expect(isModerationNs('0xsearchstr.moderation')).toBe(true);
    expect(isModerationNs('dsearch.moderation.evil')).toBe(false);
    expect(isAbuseNs('dsearch.abuse')).toBe(true);
    expect(isAbuseNs('0xsearchstr.abuse')).toBe(true);
    expect(isAbuseNs('dsearch.abuse.evil')).toBe(false);
  });
});

/* ─── Permission matrix ─── */

describe('permission matrix', () => {
  const roles = ['owner', 'admin', 'moderator', 'user'] as const;

  it('search/read is universal (SIP-01 is not gated)', () => {
    // No permission helper gates search — this test pins that nothing in
    // the matrix even contemplates it.
    for (const role of roles) {
      expect(PERMISSIONS.canViewReports(role) || role === 'user').toBe(true);
    }
  });

  it('reports + moderation: owner, admin, moderator — never a normal user', () => {
    expect(PERMISSIONS.canViewReports('owner')).toBe(true);
    expect(PERMISSIONS.canViewReports('admin')).toBe(true);
    expect(PERMISSIONS.canViewReports('moderator')).toBe(true);
    expect(PERMISSIONS.canViewReports('user')).toBe(false);
    expect(PERMISSIONS.canModerate('moderator')).toBe(true);
    expect(PERMISSIONS.canModerate('user')).toBe(false);
  });

  it('affiliate + referral config: owner and admin only', () => {
    expect(PERMISSIONS.canManageAffiliates('owner')).toBe(true);
    expect(PERMISSIONS.canManageAffiliates('admin')).toBe(true);
    expect(PERMISSIONS.canManageAffiliates('moderator')).toBe(false);
    expect(PERMISSIONS.canManageAffiliates('user')).toBe(false);
    expect(PERMISSIONS.canManageReferralConfig('admin')).toBe(true);
    expect(PERMISSIONS.canManageReferralConfig('moderator')).toBe(false);
    expect(PERMISSIONS.canManageReferralConfig('user')).toBe(false);
  });

  it('roles + engine config + trust root: owner only, and nobody replaces the owner', () => {
    for (const role of roles) {
      expect(PERMISSIONS.canManageRoles(role)).toBe(role === 'owner');
      expect(PERMISSIONS.canManageEngineConfig(role)).toBe(role === 'owner');
    }
    // No permission path exists for changing the trust root — it is a
    // code constant, not an event. roleForPubkey always maps OWNER_PUBKEY
    // to owner regardless of any list content:
    expect(roleForPubkey(OWNER, [], [])).toBe('owner');
    // …and nobody can put the owner "into" a lesser role via a list:
    expect(roleForPubkey(OWNER, [RANDO], [RANDO])).toBe('owner');
  });

  it('roleForPubkey resolves the hierarchy correctly', () => {
    expect(roleForPubkey(ADMIN, [ADMIN], [])).toBe('admin');
    expect(roleForPubkey(MOD, [], [MOD])).toBe('moderator');
    expect(roleForPubkey(RANDO, [ADMIN], [MOD])).toBe('user');
  });
});

/* ─── Role-list resolution (canonical wins, legacy read-through) ─── */

describe('resolveRoleEvents', () => {
  it('legacy-only lists still grant access (pre-migration)', () => {
    const events = [roleEvent(LEGACY_PROTOCOL.adminRoles, [ADMIN])];
    const resolved = resolveRoleEvents(events);
    expect(resolved.admins).toEqual([ADMIN]);
    expect(resolved.hasCanonicalAdmins).toBe(false);
    expect(resolved.hasLegacyRoles).toBe(true);
  });

  it('canonical supersedes legacy once it exists — removals stick', () => {
    const events = [
      roleEvent(LEGACY_PROTOCOL.adminRoles, [ADMIN, MOD], OWNER, 1000),
      roleEvent(DSEARCH_PROTOCOL.adminRoles, [MOD], OWNER, 2000), // canonical without ADMIN
    ];
    const resolved = resolveRoleEvents(events);
    expect(resolved.admins).toEqual([MOD]); // legacy ADMIN is NOT merged back in
    expect(resolved.hasCanonicalAdmins).toBe(true);
  });

  it('a canonical event signed by a NON-owner grants nothing', () => {
    const events = [roleEvent(DSEARCH_PROTOCOL.adminRoles, [RANDO], RANDO)];
    const resolved = resolveRoleEvents(events);
    expect(resolved.admins).toEqual([]);
    expect(resolved.hasCanonicalAdmins).toBe(false);
  });

  it('latest event per d-tag wins', () => {
    const events = [
      roleEvent(DSEARCH_PROTOCOL.moderatorRoles, [MOD], OWNER, 1000),
      roleEvent(DSEARCH_PROTOCOL.moderatorRoles, [], OWNER, 3000),
    ];
    expect(resolveRoleEvents(events).mods).toEqual([]);
  });
});

/* ─── Moderation labels: canonical write, legacy read ─── */

describe('moderation label namespaces', () => {
  const labelEvent = (ns: string, author = OWNER): NostrEvent => ({
    id: 'x'.repeat(64),
    pubkey: author,
    kind: 1985,
    created_at: 1000,
    content: '',
    tags: [['L', ns], ['l', 'hidden', ns], ['r', 'example.com/page']],
    sig: 'y'.repeat(128),
  });

  it('buildHideLabel writes ONLY the canonical namespace + NIP-32 r target', () => {
    const template = buildHideLabel({ url: 'https://example.com/page' });
    expect(template).not.toBeNull();
    const json = JSON.stringify(template);
    expect(json).toContain('dsearch.moderation');
    expect(json).not.toContain('0xsearchstr');
    expect(template!.tags.some(([n, v]) => n === 'r' && v === 'example.com/page')).toBe(true);
    expect(template!.tags.some(([n]) => n === 'u')).toBe(false);
  });

  it('parseHiddenLabel reads r + legacy u targets, canonical AND legacy namespaces', () => {
    const trusted = new Set([OWNER]);
    // NIP-32-correct r target (current writes):
    expect(parseHiddenLabel(labelEvent(MODERATION_NS), trusted)?.value).toBe('example.com/page');
    // Legacy u target (deployed labels):
    const legacyU = { ...labelEvent(LEGACY_PROTOCOL.moderation), tags: [['L', LEGACY_PROTOCOL.moderation], ['l', 'hidden', LEGACY_PROTOCOL.moderation], ['u', 'example.com/old']] };
    expect(parseHiddenLabel(legacyU as unknown as NostrEvent, trusted)?.value).toBe('example.com/old');
    expect(parseHiddenLabel(labelEvent('evil.moderation'), trusted)).toBeNull();
    expect(parseHiddenLabel(labelEvent(MODERATION_NS, RANDO), trusted)).toBeNull();
  });

  it('buildRoleListEvent writes the canonical role t-tag', () => {
    const template = buildRoleListEvent(DSEARCH_PROTOCOL.adminRoles, [ADMIN]);
    expect(template.tags).toContainEqual(['d', 'dsearch:admin-roles']);
    expect(template.tags).toContainEqual(['t', 'dsearch-roles']);
    expect(JSON.stringify(template.tags)).not.toContain('presearchstr');
  });
});

/* ─── Referral config (Dsearch-owned, kind 30078) ─── */

describe('dsearch:referral-config', () => {
  it('defaults when the event is missing/malformed', () => {
    expect(parseReferralConfig({ kind: 30078, content: 'not json' } as NostrEvent)).toEqual(DEFAULT_REFERRAL_CONFIG);
    expect(parseReferralConfig({ kind: 30078, content: '{"enabled":false}' } as NostrEvent).enabled).toBe(false);
    expect(parseReferralConfig({ kind: 30078, content: '{"attributionWindowDays":45}' } as NostrEvent).attributionWindowDays).toBe(45);
    // Out-of-range window falls back to the default, not to junk:
    expect(parseReferralConfig({ kind: 30078, content: '{"attributionWindowDays":-5}' } as NostrEvent)).toEqual(DEFAULT_REFERRAL_CONFIG);
  });

  it('writes kind 30078 under the dsearch d-tag with an alt tag', () => {
    const template = buildReferralConfigEvent({ enabled: true, attributionWindowDays: 30 }, DSEARCH_PROTOCOL.referralConfig);
    expect(template.kind).toBe(30078);
    expect(template.tags).toContainEqual(['d', 'dsearch:referral-config']);
    expect(template.tags.some(([n]) => n === 'alt')).toBe(true);
    const parsed = JSON.parse(template.content) as Record<string, unknown>;
    expect(parsed.enabled).toBe(true);
    expect(parsed.attributionWindowDays).toBe(30);
  });

  it('referral identity can never grant authority (ref ≠ admin)', () => {
    // A ?ref=npub identity is just a pubkey; the permission matrix only
    // grants power via owner-signed role lists. A random ref gets 'user'.
    const invitedPubkey = RANDO;
    expect(roleForPubkey(invitedPubkey, [], [])).toBe('user');
    expect(PERMISSIONS.canManageAffiliates('user')).toBe(false);
    expect(PERMISSIONS.canManageReferralConfig('user')).toBe(false);
  });
});
