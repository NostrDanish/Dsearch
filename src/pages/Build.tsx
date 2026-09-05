import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ArrowRight, Bug, Code, Hammer, Search, Server, Database } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LEVELS = [
  {
    level: 1,
    title: 'Search',
    tagline: 'No technical knowledge required',
    description: 'Just use Dsearch. Every search you run reads the community index first — and the pages your results surface flow back into it. Using the engine is already contributing.',
    to: '/',
    linkLabel: 'Start searching',
  },
  {
    level: 2,
    title: 'Crawl',
    tagline: 'Install Crawlstr',
    description: 'Turn your browser into a voluntary crawl node. Add a seed URL or pick a Scout category — Crawlstr fetches pages politely (robots.txt, per-domain rate limits) and publishes SIP-01 observations.',
    to: '/build/crawlstr',
    linkLabel: 'Run Crawlstr',
  },
  {
    level: 3,
    title: 'Index',
    tagline: 'Run Indexstr',
    description: 'Join the distributed indexing network. Load curated collections, claim your deterministic shard of the crawl space, classify pages, and coordinate with other nodes — no central server.',
    to: '/build/indexstr',
    linkLabel: 'Run Indexstr',
  },
  {
    level: 4,
    title: 'Relay',
    tagline: 'Run a SIP relay',
    description: 'Become infrastructure. A SIP relay validates, stores, indexes, and federates kind 39697 observations — the backbone every search engine reads from. One click on Cloudflare, or fully self-hosted.',
    to: '/build/relay',
    linkLabel: 'Run a relay',
  },
  {
    level: 5,
    title: 'Develop',
    tagline: 'Build on SIP',
    description: 'The protocol is the whole contract. Implement SIP-01, publish observations, query the shared index, or build an entirely new search engine on top of it.',
    to: '/protocol',
    linkLabel: 'Read the protocol',
  },
] as const;

export default function BuildPage() {
  useSeoMeta({
    title: 'Build - Dsearch',
    description: 'Help build the decentralized search engine: run a Crawlstr crawler, an Indexstr indexer, a SIP relay, or develop against the Search Index Protocol.',
  });

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Hammer className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Build the Index</h1>
        </div>
        <p className="text-muted-foreground mb-4 leading-relaxed max-w-2xl">
          Dsearch has no central crawler farm and no company index. The index exists because
          people run pieces of it. Every level below is real, running today, and open to anyone —
          pick the one that matches how much you want to run.
        </p>
        <p className="text-sm text-muted-foreground/80 mb-10 leading-relaxed max-w-2xl">
          Everything you run publishes signed <Link to="/protocol/sip-01" className="text-primary hover:underline">SIP-01</Link> events
          to the shared relay network — visible immediately on Dsearch, 0xSearchstr, and every
          compatible client.
        </p>

        {/* The ladder */}
        <div className="space-y-3 mb-12">
          {LEVELS.map((level) => (
            <Link
              key={level.level}
              to={level.to}
              className="group flex items-start gap-4 rounded-xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0 font-bold text-primary">
                {level.level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{level.title}</span>
                  <span className="text-xs text-muted-foreground">{level.tagline}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{level.description}</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary shrink-0 mt-2">
                {level.linkLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        {/* The components */}
        <h2 className="text-xl font-semibold mb-4">The Components</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <ComponentCard
            icon={<Search className="w-5 h-5 text-primary" />}
            name="Crawlstr"
            role="Lightweight scout crawler"
            detail="Browser-based. Seeds, robots.txt, sitemaps, RSS, rate limits, anonymous per-device identity. The easiest way to contribute."
            to="/build/crawlstr"
            badge="Browser"
          />
          <ComponentCard
            icon={<Database className="w-5 h-5 text-primary" />}
            name="Indexstr"
            role="Heavyweight indexer"
            detail="Curated URL collections, 256-shard deterministic work split, enrichment classification, freshness scheduling, offline outbox."
            to="/build/indexstr"
            badge="Browser / Desktop"
          />
          <ComponentCard
            icon={<Server className="w-5 h-5 text-primary" />}
            name="SIP Relay"
            role="Index infrastructure"
            detail="Validates, stores, indexes and federates SIP-01 observations. One-click Cloudflare deploy, self-hosted OpenSearch, or Android."
            to="/build/relay"
            badge="Infrastructure"
          />
          <ComponentCard
            icon={<Code className="w-5 h-5 text-primary" />}
            name="SIP Protocol"
            role="The open contract"
            detail="SIP-01 defines how web documents live on Nostr. Implement it and your software joins the same index — no permission needed."
            to="/protocol"
            badge="Developers"
          />
        </div>

        {/* Honest note */}
        <Card className="border-dashed">
          <CardContent className="py-6 px-6">
            <div className="flex items-start gap-3">
              <Bug className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">No accounts, no registration, no permission.</strong>{' '}
                Crawlers and indexers sign with a throwaway per-device keypair generated on first run —
                never your personal Nostr identity. Observations contain public page metadata only,
                never your searches or browsing history.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function ComponentCard({ icon, name, role, detail, to, badge }: {
  icon: React.ReactNode;
  name: string;
  role: string;
  detail: string;
  to: string;
  badge: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring block"
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-semibold text-foreground">{name}</span>
        <Badge variant="outline" className="ml-auto text-[10px]">{badge}</Badge>
      </div>
      <p className="text-xs text-primary/80 font-medium mb-2">{role}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
    </Link>
  );
}
