import { useSeoMeta } from '@unhead/react';
import { Cloud, Container, ExternalLink, Server, Smartphone } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BuildRelay() {
  useSeoMeta({
    title: 'Run a SIP Relay - DSearch',
    description: 'Become search infrastructure: deploy a validating, searchable, federating SIP-01 index relay — one click on Cloudflare, self-hosted on a VPS with Docker, or on Android.',
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <p className="text-xs text-muted-foreground mb-2 font-mono">Build → SIP Relay</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Run a SIP Relay</h1>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          Relays are the backbone: they validate SIP-01 observations at the door, index them for
          search, answer NIP-50 queries, and federate with each other over NIP-77 negentropy sync.
          More relays = a harder-to-censor, faster index for everyone. Pick your path — none of them
          require permission.
        </p>

        <div className="space-y-6">
          {/* Path 1: Cloudflare */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cloud className="w-5 h-5 text-primary" />
                Easy default — Cloudflare Workers
                <Badge variant="default" className="ml-auto text-[10px]">recommended start</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                The <strong className="text-foreground">SIP Booster Relay</strong> is a serverless SIP-01 index
                relay on Cloudflare Workers + D1 + Durable Objects. A free Cloudflare account is all you need —
                the deploy button clones the repo into your GitHub, provisions the database, and deploys.
              </p>
              <ol className="space-y-2 list-none">
                {[
                  'Open the repo and press "Deploy to Cloudflare"',
                  'Edit src/config.ts later for name, mode (sip01 / hybrid / general), and policy',
                  'Verify: curl -H "Accept: application/nostr+json" https://your-relay.workers.dev — look for the uncaged_index block',
                  'Point Crawlstr or Indexstr at wss://your-relay.workers.dev and watch observations land on the built-in dashboard',
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 border border-primary/20 text-xs font-bold text-primary shrink-0">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p>
                Includes NIP-50 web-search operators, NIP-77 federation sync, NIP-45 counts, an operator
                dashboard with in-browser SIP-01 conformance tests, and an optional Lightning pay-to-relay
                mode (off by default).{' '}
                <a href="https://github.com/NostrDanish/SIP-Booster-Relay" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                  github.com/NostrDanish/SIP-Booster-Relay<ExternalLink className="w-3 h-3 inline ml-0.5" />
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Path 2: Self-hosted */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Container className="w-5 h-5 text-primary" />
                Self-hosted — VPS / Docker
                <Badge variant="outline" className="ml-auto text-[10px]">full control</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                The <strong className="text-foreground">UNCAGED Index Relay</strong> is a high-performance
                Nostr relay backed by OpenSearch, native to kind 39697. It's the heavy option: full
                general-purpose relay plus SIP-01 validation, structured indexing, trending computation,
                and NIP-85 statistics — on your own hardware.
              </p>
              <ul className="space-y-1.5">
                {[
                  'Prerequisites: a VPS, Bun runtime, and an OpenSearch instance (Docker Compose included)',
                  'cp .env.example .env, set your relay identity, then docker compose up -d',
                  'Implements NIPs 1, 9, 11, 40, 42, 45, 50, 62, 70, 77, 85 — a complete relay, not just an index node',
                  'Best for operators who want the index on hardware they own',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-primary/60 mt-0.5 shrink-0">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                <a href="https://github.com/NostrDanish/UNCAGED-Index-Relay" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                  github.com/NostrDanish/UNCAGED-Index-Relay<ExternalLink className="w-3 h-3 inline ml-0.5" />
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Path 3: Android */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-primary" />
                In your pocket — Android
                <Badge variant="outline" className="ml-auto text-[10px]">experimental</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                <strong className="text-foreground">Crawlstr SIP Relay</strong> turns an Android phone into a
                validating index relay and search node (a fork of Citrine). It validates SIP-01 observations
                against the spec's test vectors, answers NIP-50 web-search queries, and can replicate the
                shared index over NIP-77 — WiFi-only mode included.
              </p>
              <p>
                <a href="https://github.com/NostrDanish/Crawlstr-SIP-Relay" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                  github.com/NostrDanish/Crawlstr-SIP-Relay<ExternalLink className="w-3 h-3 inline ml-0.5" />
                </a>
              </p>
            </CardContent>
          </Card>

          {/* After you're running */}
          <Card className="border-dashed">
            <CardContent className="py-6 px-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Once your relay is up:</strong> advertise the SIP-01
                capability block in its NIP-11 document and DSearch's relay auto-discovery will find it —
                verified relays join the index pool automatically. Your relay will appear on the{' '}
                <a href="/network" className="text-primary hover:underline">Network page</a> for every user
                whose client discovers it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
