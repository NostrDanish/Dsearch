/**
 * Partners page — referral links + stats for the invite program.
 *
 * Any logged-in Nostr account is a partner: copy the tracking link, share
 * it, and this page shows the on-platform signal — referred devices
 * (first-touch `?ref=` pings) and affiliate clicks credited to you.
 *
 * Counts come from public, pseudonymous Nostr events (kind 34967 pings,
 * kind 6079 clicks — see NIP.md) and are indicative engagement metrics,
 * not settlement data.
 */
import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import {
  Handshake, Copy, Check, Users, MousePointerClick, Store, Activity,
} from 'lucide-react';

import { Layout } from '@/components/Layout';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyReferralStats, useReferralConfig } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/useToast';
import { ENGINE_PROFILE } from '@/lib/engine/profile';

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const Partners = () => {
  const { user } = useCurrentUser();
  const { stats, isLoading } = useMyReferralStats();
  const { config: referralConfig, isLoading: configLoading } = useReferralConfig();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useSeoMeta({
    title: `Invite friends - ${ENGINE_PROFILE.branding.name}`,
    description: 'Share Dsearch, track your referrals, and help grow the community index.',
  });

  const copyLink = async () => {
    if (!stats?.trackingLink) return;
    try {
      await navigator.clipboard.writeText(stats.trackingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Select the link and copy it manually.', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Handshake className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Invite friends</h1>
        </div>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Share Dsearch with your invite link. You get credit for the friends you bring
          and the affiliate clicks they generate — every new searcher warms the
          community index for everyone.
        </p>

        {!user ? (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center space-y-4">
              <Handshake className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                Log in with your Nostr key to get your invite link and see your stats.
                No account creation, no email — your key is your account.
              </p>
              <LoginArea className="max-w-60 mx-auto" />
            </CardContent>
          </Card>
        ) : !configLoading && !referralConfig.enabled ? (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <Handshake className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                The Invite Friends program is currently paused. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : isLoading || !stats ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tracking link */}
            <Card className="border-primary/20">
              <CardContent className="py-4 space-y-2">
                <p className="text-xs font-medium">Your invite link</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={stats.trackingLink}
                    className="font-mono text-xs"
                    onFocus={(e) => e.target.select()}
                    aria-label="Your tracking link"
                  />
                  <Button onClick={() => void copyLink()} className="shrink-0" variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1.5 hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                  First touch wins: the first invite link someone ever follows is the one
                  that sticks. Sharing your link again can never overwrite someone else&apos;s.
                </p>
              </CardContent>
            </Card>

            {/* Headline stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="py-4 px-5 flex items-center gap-3">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xl font-bold tracking-tight">{stats.referrals}</p>
                    <p className="text-[11px] text-muted-foreground">Referred users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 px-5 flex items-center gap-3">
                  <MousePointerClick className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xl font-bold tracking-tight">{stats.clicks}</p>
                    <p className="text-[11px] text-muted-foreground">Affiliate clicks</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clicks by store */}
            <div>
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-primary" />
                Clicks by store
              </h2>
              {stats.clicksByHost.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    No affiliate clicks yet. They appear when people you referred tap a
                    tagged result link.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {stats.clicksByHost.map(({ host, count }) => (
                    <div
                      key={host}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/60 bg-card"
                    >
                      <span className="font-mono text-sm flex-1 truncate">{host}</span>
                      <span className="text-sm font-semibold tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div>
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                Recent activity
              </h2>
              {stats.recent.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    Nothing yet — share your link to get started.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-1.5">
                  {stats.recent.map((item, i) => (
                    <div
                      key={`${item.kind}-${item.at}-${i}`}
                      className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-border/40 text-xs"
                    >
                      {item.kind === 'referral' ? (
                        <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <MousePointerClick className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                      <span className="text-muted-foreground flex-1">
                        {item.kind === 'referral'
                          ? 'New user arrived via your link'
                          : <>Affiliate click{item.host ? ` on ${item.host}` : ''}</>}
                      </span>
                      <span className="text-muted-foreground/50 shrink-0">{timeAgo(item.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              Counts come from public, pseudonymous Nostr events and are indicative, not
              settlement data. Your referred users stay pseudonymous: you see counts, not
              identities.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Partners;
