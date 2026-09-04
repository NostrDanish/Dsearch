import { useSeoMeta } from '@unhead/react';
import { Database, ExternalLink } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BuildIndexstr() {
  useSeoMeta({
    title: 'Run Indexstr - DSearch',
    description: 'Join the distributed indexing network: curated collections, deterministic sharding, enrichment classification, and freshness scheduling — no central server.',
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <p className="text-xs text-muted-foreground mb-2 font-mono">Build → Indexstr</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Run Indexstr</h1>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          Indexstr is the heavyweight indexer of the DSearch ecosystem. Where Crawlstr is a scout,
          Indexstr is the network: curated URL collections, deterministic sharding, page enrichment,
          and freshness scheduling — coordinated across nodes <em>without any central server</em>.
        </p>

        <div className="space-y-6">
          <Section title="How it differs from Crawlstr">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="font-medium text-foreground mb-1">Crawlstr</p>
                <p className="text-xs text-muted-foreground leading-relaxed">"Let your browser crawl the web." Lightweight scout: seeds you choose, polite fetching, SIP-01 publishing.</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-medium text-foreground mb-1">Indexstr</p>
                <p className="text-xs text-muted-foreground leading-relaxed">"Turn the community into a distributed indexing network." Collections, shards, enrichment, freshness, network intake.</p>
              </div>
            </div>
          </Section>

          <Section title="What makes it a network">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Deterministic sharding — every URL belongs to one of 256 shards; every node has a home shard derived from its indexer pubkey. The community splits the crawl space instead of duplicating it. No coordinator, no registration',
                'Eight curated collections ship built in (Top Sites, Awesome Lists, RSS, Music, Books, Movies, Memes, Video Games — ~80 MB total) as SHA-256-verified SQLite databases, mirrored on Blossom',
                'Enrichment layer — every page is deterministically classified: topics ride SIP-01 t tags, document type rides the type extension. Any node replaying the algorithm reproduces the tags',
                'Network discovery intake — your node reads other indexers\' observations and queues URLs it has never seen. Every crawler is every other node\'s discovery sensor',
                'Freshness scheduling — URLs recrawl on adaptive intervals (24h doubling to a 30d cap); unchanged pages republish as a "still alive" signal',
                'Offline-first outbox — observations that can\'t reach a relay wait locally and flush on reconnect',
                'Abuse guards — crawl-trap heuristics, per-domain caps, per-indexer Sybil caps, robots.txt, SSRF guard',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary/60 mt-0.5 shrink-0">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="How to run it">
            <ol className="space-y-3 text-sm text-muted-foreground list-none">
              {[
                { step: '1', text: 'Open the app', code: 'https://indexstr.vercel.app' },
                { step: '2', text: 'Pick a collection (start small — Books or Video Games) or seed a URL manually' },
                { step: '3', text: 'Press Start Crawling. Your node claims its shard and works through it — sessions persist' },
                { step: '4', text: 'Watch your indexer identity, pages indexed, and publish counts on the dashboard' },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 border border-primary/20 text-xs font-bold text-primary shrink-0">{item.step}</span>
                  <span>
                    {item.text}
                    {'code' in item && item.code && (
                      <>
                        {' '}<a href={item.code} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs break-all">{item.code.replace('https://', '')}<ExternalLink className="w-3 h-3 inline ml-0.5" /></a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4">
              Source:{' '}
              <a href="https://github.com/NostrDanish/indexstr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                github.com/NostrDanish/indexstr<ExternalLink className="w-3 h-3 inline ml-0.5" />
              </a>
              {' '}— static app, <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">npm install && npm run dev</code>.
            </p>
          </Section>

          <Section title="How it contributes to DSearch">
            <p>
              Indexstr nodes publish the same SIP-01 kind 39697 observations as every other indexer —
              enriched with topic and type metadata that make DSearch's <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">tag:</code> and{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">type:</code> operators useful.
              Node heartbeats (kind 16919) power the <a href="/network" className="text-primary hover:underline">Network page</a>,
              and freshness recrawls keep the index from rotting.
            </p>
          </Section>

          <Section title="Requirements & honest limits">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Runs in a browser tab — a desktop or laptop on WiFi is the sweet spot; mobile works but collections download over your connection',
                'Collections download on demand (only the one you load) and are cached in IndexedDB',
                'Sessions are bandwidth-capped and rate-limited by design — this is polite infrastructure, not a scraper',
                'Your indexer identity is a per-device keypair, exportable in Settings if you want to keep your shard and stats across devices',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary/60 mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}
