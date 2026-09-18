/**
 * Access control hook — resolves the current user's team role.
 *
 *   1. pubkey === OWNER_PUBKEY           → 'owner'
 *   2. in owner-signed admin role list   → 'admin'
 *   3. in owner-signed mod role list     → 'moderator'
 *   4. otherwise                         → 'user'
 *
 * Role lists are kind 30078 addressable events published by the owner
 * (see src/lib/dsearchProtocol.ts). Readers query the canonical
 * `dsearch:*` d-tags plus the legacy `presearchstr:*` ones; the central
 * resolver applies "canonical supersedes legacy, owner-signed only".
 * Adapted from 0xNostr-Relay-Finder's useAdminAccess.
 */
import { useQuery } from '@tanstack/react-query';

import { queryRelayPool } from '@/lib/searchRelays';
import { getModerationRelayUrls } from '@/lib/moderation';
import {
  OWNER_PUBKEY,
  ROLES_KIND,
  ROLE_LIST_D_TAGS,
  PERMISSIONS,
  resolveRoleEvents,
  type AppRole,
} from '@/lib/dsearchProtocol';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/** Fetch the owner-signed role lists (canonical + legacy). Cached — they
 *  change rarely. Only runs when someone is logged in (roles are
 *  meaningless logged out, and the query would hit ~15 relays for every
 *  visitor). */
export function useRoleLists(): {
  admins: string[];
  mods: string[];
  isLoading: boolean;
  /** True when canonical dsearch:* role events exist for each list. */
  hasCanonicalAdmins: boolean;
  hasCanonicalMods: boolean;
  /** True when pre-migration (legacy namespace) role events exist. */
  hasLegacyRoles: boolean;
} {
  const { user } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    enabled: !!user,
    queryFn: async ({ signal }) => {
      const settled = await queryRelayPool(
        getModerationRelayUrls(),
        [{
          kinds: [ROLES_KIND],
          authors: [OWNER_PUBKEY], // trust boundary: owner-signed only
          '#d': [...ROLE_LIST_D_TAGS],
          limit: ROLE_LIST_D_TAGS.length,
        }],
        { signal },
      );

      const events = settled.flatMap((value) => value);
      return resolveRoleEvents(events);
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return {
    admins: data?.admins ?? [],
    mods: data?.mods ?? [],
    isLoading,
    hasCanonicalAdmins: data?.hasCanonicalAdmins ?? false,
    hasCanonicalMods: data?.hasCanonicalMods ?? false,
    hasLegacyRoles: data?.hasLegacyRoles ?? false,
  };
}

/** The set of pubkeys trusted to moderate (owner + admins + mods). */
export function useTrustedModerators(): Set<string> {
  const { admins, mods } = useRoleLists();
  return new Set([OWNER_PUBKEY, ...admins, ...mods]);
}

export function useAdminAccess() {
  const { user } = useCurrentUser();
  const { admins, mods, isLoading, hasCanonicalAdmins, hasCanonicalMods, hasLegacyRoles } = useRoleLists();

  const pubkey = user?.pubkey ?? '';

  const role: AppRole = (() => {
    if (pubkey === OWNER_PUBKEY) return 'owner';
    if (admins.includes(pubkey)) return 'admin';
    if (mods.includes(pubkey)) return 'moderator';
    return 'user';
  })();

  return {
    role,
    isOwner: role === 'owner',
    /** Admin = owner or admin list. */
    isAdmin: role === 'owner' || role === 'admin',
    /** Mod = any team member (owner, admin, moderator). */
    isMod: PERMISSIONS.canModerate(role),
    /** Roles tab (add/remove team members) — owner only. */
    canManageRoles: PERMISSIONS.canManageRoles(role),
    /** Affiliate rules + referral config — owner + admins. */
    canManageAffiliates: PERMISSIONS.canManageAffiliates(role),
    canManageReferralConfig: PERMISSIONS.canManageReferralConfig(role),
    isLoading,
    adminList: admins,
    modList: mods,
    hasCanonicalAdmins,
    hasCanonicalMods,
    hasLegacyRoles,
  };
}
