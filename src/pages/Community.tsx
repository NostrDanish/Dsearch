import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ExternalLink, GitBranch, HeartHandshake, MessageSquare, Users } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const REPOS = [
  {
    name: 'Dsearch',
    url: 'https://github.com/NostrDanish/Dsearch',
    desc: 'This app — the flagship search engine and ecosystem home.',
    tag: 'engine',
  },
  {
    name: 'SIP-01',
    url: 'https://github.com/NostrDanish/SIP-01',
    desc: 'The canonical Search Index Protocol specification, test vectors, and live spec site.',
    tag: 'protocol',
  },
  {
    name: 'Crawlstr',
    url: 'https://github.com/NostrDanish/Crawlstr',
    desc: 'The lightweight browser crawler — voluntary crawl nodes feeding the shared index.',
    tag: 'crawler',
  },
  {
    name: 'indexstr',
    url: 'https://github.com/NostrDanish/indexstr',
    desc: 'The heavyweight distributed indexer — collections, sharding, enrichment, freshness.',
    tag: 'indexer',
  },
  {
    name: 'SIP-Booster-Relay',
    url: 'https://github.com/NostrDanish/SIP-Booster-Relay',
    desc: 'Serverless SIP-01 index relay for Cloudflare Workers — the one-click infrastructure path.',
    tag: 'relay',
  },
  {
    name: 'UNCAGED-Index-Relay',
    url: 'https://github.com/NostrDanish/UNCAGED-Index-Relay',
    desc: 'Self-hosted OpenSearch-backed index relay — the own-your-hardware path.',
    tag: 'relay',
  },
  {
    name: 'Crawlstr-SIP-Relay',
    url: 'https://github.com/NostrDanish/Crawlstr-SIP-Relay',
    desc: 'A validating SIP-01 index relay that fits in your pocket (Android, Citrine fork).',
    tag: 'relay',
  },
  {
    name: '0xSearchstr',
    url: 'https://github.com/NostrDanish/0xSearchstr',
    desc: 'The original Nostr-native search aggregator — federation sibling sharing the same index.',
    tag: 'federation',
  },
  {
    name: 'UNCAGED-ENGINE',
    url: 'https://github.com/NostrDanish/UNCAGED-ENGINE',
    desc: 'The minimal search-engine template — build your own engine on the shared core.',
    tag: 'template',
  },
] as const;

export default function CommunityPage() {
  useSeoMeta({
    title: 'Community - DSearch',
    description: 'DSearch is built in the open: every repository, every protocol decision, every contribution path.',
  });

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        </div>
        <p className="text-muted-foreground mb-10 leading-relaxed max-w-2xl">
          DSearch is community infrastructure: open source end to end, permissionless to run,
          and federated by design. No company owns the crawler, the index, the relay network,
          or this interface — and that's the point.
        </p>

        {/* Contribute */}
        <h2 className="text-xl font-semibold mb-4">Ways to Contribute</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {[
            {
              icon: <GitBranch className="w-5 h-5 text-primary" />,
              title: 'Code',
              desc: 'Every repo below is MIT-licensed and takes PRs. Good first contribution: a new search provider — one file implementing SearchResult[] — or a SIP-01 conformance improvement.',
            },
            {
              icon: <HeartHandshake className="w-5 h-5 text-primary" />,
              title: 'Infrastructure',
              desc: 'Run a crawler, an indexer, or a relay. Real machines serving real index data beat any code contribution for network health.',
            },
            {
              icon: <MessageSquare className="w-5 h-5 text-primary" />,
              title: 'Protocol',
              desc: 'SIP-01 is stable; SIP-02 (the query layer) is being drafted now. Review it, break it, improve it — in the open.',
            },
            {
              icon: <Users className="w-5 h-5 text-primary" />,
              title: 'Curate',
              desc: 'Stake keywords with your Nostr key, submit links to the community index, vote on results. Curation is signed and attributable — quality is a public act.',
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/60">
              <CardContent className="py-5 px-5">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <span className="font-semibold text-foreground">{item.title}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Repos */}
        <h2 className="text-xl font-semibold mb-4">The Repositories</h2>
        <div className="grid gap-2 mb-12">
          {REPOS.map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <GitBranch className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground font-mono">{repo.name}</span>
                  <Badge variant="outline" className="text-[10px]">{repo.tag}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{repo.desc}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </a>
          ))}
        </div>

        {/* Federation note */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6 px-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Forks welcome — the index is the commons.</strong>{' '}
              DSearch, 0xSearchstr, and every compatible client read and write the same SIP-01 index.
              If you build a better search engine on this stack, your users and our users share one
              index from day one. That's not a partnership — it's the protocol. Start from{' '}
              <a href="https://github.com/NostrDanish/UNCAGED-ENGINE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">the template</a>,
              read <Link to="/protocol" className="text-primary hover:underline">the protocol</Link>,
              and ship.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
