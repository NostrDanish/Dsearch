import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Activity, Database, FileText, Globe, Network, Server, Users } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIndexRelayStatus, useNodeHeartbeats } from '@/hooks/useNetworkStats';
import { useRecentIndexedDocs } from '@/hooks/useRecentIndexedDocs';

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NetworkPage() {
  useSeoMeta({
    title: 'Network - Dsearch',
    description: 'Live view of the decentralized Dsearch / SIP-01 network: index relays, crawler and indexer nodes, and the shared web index they build.',
  });

  const relays = useIndexRelayStatus();
  const heartbeats = useNodeHeartbeats();
  const docs = useRecentIndexedDocs(100);

  const onlineRelays = relays.data?.filter((r) => r.reachable) ?? [];
  const sipRelays = relays.data?.filter((r) => r.sip01) ?? [];
  const onlineNodes = heartbeats.data?.filter((h) => h.online) ?? [];
  const totalObservedPages = docs.data?.length ?? 0;
  const indexedHosts = docs.data ? new Set(docs.data.map((d) => d.domain).filter(Boolean)).size : 0;
  // Sum of independent observations across all documents in the sample.
  const totalObservations = docs.data?.reduce((sum, d) => sum + d.indexerCount, 0) ?? 0;

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Network</h1>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          The Dsearch index is not a company asset — it's a live network of independent
          crawlers, indexers, and relays speaking{' '}
          <Link to="/protocol/sip-01" className="text-primary hover:underline">SIP-01</Link>.
          This page reads that network directly: nothing here comes from a Dsearch server.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <StatCard
            icon={<Server className="w-5 h-5 text-primary" />}
            value={relays.data ? `${onlineRelays.length}/${relays.data.length}` : undefined}
            label="index relays online"
            loading={relays.isLoading}
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-primary" />}
            value={heartbeats.data ? String(onlineNodes.length) : undefined}
            label="crawler nodes active (1h)"
            loading={heartbeats.isLoading}
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-primary" />}
            value={docs.data ? String(totalObservedPages) : undefined}
            label="documents in latest sample"
            loading={docs.isLoading}
          />
          <StatCard
            icon={<Globe className="w-5 h-5 text-primary" />}
            value={docs.data ? String(indexedHosts) : undefined}
            label="hosts in latest sample"
            loading={docs.isLoading}
          />
        </div>

        {/* Relay pool */}
        <h2 className="text-xl font-semibold mb-1">Index Relays</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Where SIP-01 observations live and sync from
          {sipRelays.length > 0 && (
            <> — <span className="text-foreground font-medium">{sipRelays.length}</span> advertise native SIP-01 support (NIP-11 <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">uncaged_index</code>)</>
          )}. Manage your pool in{' '}
          <Link to="/settings" className="text-primary hover:underline">Settings → Index Relays</Link>, or{' '}
          <Link to="/build/relay" className="text-primary hover:underline">run your own</Link>.
        </p>
        <div className="grid gap-2 mb-10">
          {relays.isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          {relays.data?.map((relay) => (
            <Card key={relay.url} className="border-border/60">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${relay.reachable ? 'bg-green-500' : 'bg-red-500/70'}`}
                  title={relay.reachable ? 'online' : `unreachable${relay.error ? `: ${relay.error}` : ''}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {relay.name ?? relay.url.replace(/^wss:\/\//, '')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{relay.url}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {relay.sip01 && <Badge variant="default" className="text-[10px]">SIP-01</Badge>}
                  {relay.reachable && relay.supportedNips.includes(50) && (
                    <Badge variant="outline" className="text-[10px]">NIP-50</Badge>
                  )}
                  {relay.reachable && relay.supportedNips.includes(77) && (
                    <Badge variant="outline" className="text-[10px]">NIP-77</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {relays.data?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8 px-6 text-center text-sm text-muted-foreground">
                No index relays configured. Add some in Settings → Index Relays.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Crawler nodes */}
        <h2 className="text-xl font-semibold mb-1">Crawler &amp; Indexer Nodes</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Self-reported heartbeats (kind 16919) from running{' '}
          <Link to="/build/crawlstr" className="text-primary hover:underline">Crawlstr</Link> and{' '}
          <Link to="/build/indexstr" className="text-primary hover:underline">Indexstr</Link> nodes.
          Heartbeats are coarse and privacy-minimal — a health signal, never a ranking signal.
        </p>
        <div className="grid gap-2 mb-10">
          {heartbeats.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          {heartbeats.data?.slice(0, 20).map((node) => (
            <Card key={node.pubkey} className="border-border/60">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${node.online ? 'bg-green-500' : 'bg-muted-foreground/40'}`}
                  title={node.online ? 'active within the last hour' : 'offline'}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono text-foreground truncate">
                    {node.pubkey.slice(0, 12)}…{node.pubkey.slice(-6)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[
                      node.source,
                      node.shard && `shard ${node.shard}`,
                      node.platform,
                      typeof node.pagesIndexed === 'number' && `${node.pagesIndexed.toLocaleString()} pages`,
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/70 shrink-0">{timeAgo(node.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
          {heartbeats.data?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8 px-6 text-center">
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No crawler heartbeats seen on your index relays right now.{' '}
                  <Link to="/build/crawlstr" className="text-primary hover:underline">Start a node</Link>{' '}
                  and it will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent observations */}
        <h2 className="text-xl font-semibold mb-1">Latest Index Observations</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          The newest pages the network has observed — {totalObservations} independent observations
          across the latest sample. Every one is a signed SIP-01 event from someone's node.
        </p>
        <div className="grid gap-2">
          {docs.isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          {docs.data?.slice(0, 25).map((doc) => (
            <Card key={doc.url} className="border-border/60">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primary/70 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{doc.title || doc.url}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono">{doc.url}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.indexerCount > 1 && (
                      <Badge variant="outline" className="text-[10px]">
                        <Users className="w-2.5 h-2.5 mr-1" />
                        {doc.indexerCount} indexers
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground/70">{timeAgo(doc.observedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {docs.data?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8 px-6 text-center text-sm text-muted-foreground">
                <Database className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
                No recent observations found on your relays. The index grows when people search and crawl.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, value, label, loading }: {
  icon: React.ReactNode;
  value?: string;
  label: string;
  loading: boolean;
}) {
  return (
    <Card className="border-primary/20 bg-primary/5">
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
}
