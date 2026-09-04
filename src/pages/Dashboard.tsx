import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import {
  Activity, Cpu, FileText, Globe, Key, LayoutDashboard,
  Server, Settings, ShieldCheck, SlidersHorizontal, Sparkles,
} from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/hooks/useAppContext';
import { useMyNode } from '@/hooks/useMyNode';
import { useIndexRelayStatus, useNodeHeartbeats } from '@/hooks/useNetworkStats';
import { useRecentIndexedDocs } from '@/hooks/useRecentIndexedDocs';
import { useCurrentUser } from '@/hooks/useCurrentUser';

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DashboardPage() {
  useSeoMeta({
    title: 'Dashboard - DSearch',
    description: 'Your DSearch node: network health, your device indexing identity, and your contribution to the shared SIP-01 index.',
  });

  const { config, updateConfig } = useAppContext();
  const { user } = useCurrentUser();
  const myNode = useMyNode();
  const relays = useIndexRelayStatus();
  const heartbeats = useNodeHeartbeats();
  const docs = useRecentIndexedDocs(100);

  const onlineRelays = relays.data?.filter((r) => r.reachable) ?? [];
  const onlineNodes = heartbeats.data?.filter((h) => h.online) ?? [];

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          One view of the network and your place in it. Everything here is either read live from
          relays or stored only on this device — <strong className="text-foreground">no account, no
          tracking, no DSearch server</strong>. Search activity is never measured: that silence is a
          feature, not a missing chart.
        </p>

        {/* ─── Overview ─── */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <StatCard
            icon={<Server className="w-5 h-5 text-primary" />}
            value={relays.data ? `${onlineRelays.length}/${relays.data.length}` : undefined}
            label="index relays online"
            loading={relays.isLoading}
            to="/network"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-primary" />}
            value={heartbeats.data ? String(onlineNodes.length) : undefined}
            label="crawler nodes active (1h)"
            loading={heartbeats.isLoading}
            to="/network"
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-primary" />}
            value={docs.data ? String(docs.data.length) : undefined}
            label="documents in latest sample"
            loading={docs.isLoading}
            to="/network"
          />
          <StatCard
            icon={<Globe className="w-5 h-5 text-primary" />}
            value={myNode.observations ? String(myNode.observations.length) : undefined}
            label="observations from this device"
            loading={myNode.isLoading}
          />
        </div>

        {/* ─── My Node ─── */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">My Node</h2>
        <div className="grid gap-4 mb-10">
          {/* Identity */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="w-4 h-4 text-primary" />
                Indexing Identity
                <Badge variant="outline" className="ml-auto text-[10px]">this device only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every browser is a pseudonymous indexer. This keypair was generated locally, never
                leaves this device unless you export it, and signs only page observations — never
                your searches, never your personal Nostr identity.
              </p>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-[11px] text-muted-foreground/70 mb-1">npub</p>
                <p className="text-xs font-mono text-foreground break-all">{myNode.identity.npub}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                Key export and regeneration live in{' '}
                <Link to="/settings" className="text-primary hover:underline">Settings → Auto Indexer</Link>.
              </div>
            </CardContent>
          </Card>

          {/* Auto-indexing */}
          <Card className={config.autoIndex ? 'border-primary/30 bg-primary/5' : ''}>
            <CardContent className="py-4 flex items-start gap-4">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 border ${config.autoIndex ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted text-muted-foreground border-border'}`}>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Automatic indexing</span>
                  <Switch
                    checked={config.autoIndex}
                    onCheckedChange={(checked) => updateConfig(() => ({ autoIndex: checked }))}
                    aria-label="Toggle automatic indexing"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {config.autoIndex
                    ? 'Active. Pages surfaced by your searches are anonymously contributed back to the shared index.'
                    : 'Off. Turn it on and every search you run helps grow the index for everyone.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Nostr identity (optional) */}
          <Card>
            <CardContent className="py-4 flex items-start gap-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 border bg-muted text-muted-foreground border-border">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">Nostr identity</span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {user
                    ? 'Logged in — you can stake keywords, submit links, and vote. Indexing stays on the separate device key either way.'
                    : 'Optional. Log in (top right) to stake keywords, submit links, and vote — indexing works without it.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* My observations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">My Recent Observations</CardTitle>
            </CardHeader>
            <CardContent>
              {myNode.isLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
              {myNode.observations && myNode.observations.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                  No observations from this device found on your index relays yet.
                  {config.autoIndex
                    ? ' They appear after your first few searches.'
                    : ' Enable automatic indexing above and search — that\'s all it takes.'}
                </p>
              )}
              {myNode.observations && myNode.observations.length > 0 && (
                <div className="space-y-1.5">
                  {myNode.observations.slice(0, 10).map((obs) => (
                    <div key={obs.d} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/40">
                      <FileText className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span className="text-xs text-foreground truncate flex-1">{obs.title || obs.url}</span>
                      <span className="text-[11px] text-muted-foreground/60 shrink-0">{timeAgo(obs.observedAt)}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground/60 pt-1">
                    Latest {Math.min(myNode.observations.length, 10)} of {myNode.observations.length} documents
                    observed by this device (per your index relays).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Settings shortcuts ─── */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Operate</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: <SlidersHorizontal className="w-4 h-4 text-primary" />, title: 'Search providers & engines', desc: 'SearXNG pool, Brave/Parallel keys, engine priority, privacy mode.', to: '/settings' },
            { icon: <Server className="w-4 h-4 text-primary" />, title: 'Relay pools', desc: 'Index, search, git, and wiki pools — hide defaults, add your own, auto-discovery.', to: '/settings' },
            { icon: <ShieldCheck className="w-4 h-4 text-primary" />, title: 'Privacy', desc: 'Nostr-only mode, what each provider tier can see, indexing privacy.', to: '/settings' },
            { icon: <Settings className="w-4 h-4 text-primary" />, title: 'All settings', desc: 'Appearance, indexer identity, AI answers, and everything else.', to: '/settings' },
          ].map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.icon}
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, value, label, loading, to }: {
  icon: React.ReactNode;
  value?: string;
  label: string;
  loading: boolean;
  to?: string;
}) {
  const card = (
    <Card className={`border-primary/20 bg-primary/5 transition-colors ${to ? 'hover:border-primary/40 h-full' : ''}`}>
      <CardContent className="py-4 px-5 flex items-center gap-3">
        {icon}
        <div>
          {loading || value === undefined ? (
            <Skeleton className="h-7 w-12 mb-1" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">{card}</Link> : card;
}
