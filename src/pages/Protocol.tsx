import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ArrowRight, Code, FileText, ScrollText, Tags } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProtocolPage() {
  useSeoMeta({
    title: 'Protocol - Dsearch',
    description: 'SIP — the Search Index Protocol. An open standard for publishing, distributing and discovering searchable web-index data over decentralized infrastructure (Nostr).',
  });

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <ScrollText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SIP — Search Index Protocol</h1>
        </div>
        <p className="text-muted-foreground mb-4 leading-relaxed max-w-2xl">
          An open protocol for publishing, distributing, and discovering searchable web-index
          data over decentralized infrastructure. SIP is the contract that lets Dsearch,
          0xSearchstr, crawlers, indexers, and relays share one index without any of them
          owning it.
        </p>
        <p className="text-sm text-muted-foreground/80 mb-10 leading-relaxed max-w-2xl">
          One shared decentralized index. Many independent indexers. Many independent search
          engines. No single owner.
        </p>

        <div className="grid gap-4 mb-12">
          {/* SIP-01 */}
          <Link
            to="/protocol/sip-01"
            className="group rounded-xl border border-primary/20 bg-primary/5 p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring block"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">SIP-01</span>
              <Badge variant="default" className="text-[10px]">v1.2 · current</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Web Index Observations — how a web document becomes a signed Nostr event
              (kind 39697): URL identity, content hashing, metadata, extension tags,
              validation rules, and test vectors every implementation must reproduce.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read the human-friendly spec
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {/* SIP-02 */}
          <Link
            to="/protocol/sip-02"
            className="group rounded-xl border border-dashed border-border bg-card/50 p-6 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring block"
          >
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">SIP-02</span>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400">draft · in development</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The structured search query layer — one portable syntax
              (<code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">site:</code>,{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">lang:</code>,{' '}
              boolean operators, phrases, dates) instead of every frontend inventing its own.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              See the draft direction
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {/* Extensions */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Tags className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Extension Registry</span>
              <Badge variant="outline" className="text-[10px]">SIP-01 §9</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SIP-01 reserves a registry for optional metadata:{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">type</code>,{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">platform</code>,{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">category</code>,{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">network</code>,{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">country</code>,{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">mime</code> — plus
              application-specific tags that never break base compatibility. Extensions are additive
              by design: the wire format of SIP-01 never changes under your feet.
            </p>
          </div>
        </div>

        {/* Developers */}
        <h2 className="text-xl font-semibold mb-4">Implementing SIP</h2>
        <Card className="mb-8">
          <CardContent className="py-6 space-y-4">
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                <strong className="text-foreground">Read the index</strong> — query any SIP relay
                for kind 39697, group by the <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">d</code> tag,
                and count distinct signer pubkeys for independent-observation ranking:
              </p>
              <pre className="text-xs font-mono bg-muted/60 border border-border/50 rounded-lg p-4 overflow-x-auto text-foreground">{`{ "kinds": [39697], "#t": ["nostr"], "limit": 50 }`}</pre>
              <p>
                <strong className="text-foreground">Search the index</strong> — SIP relays answer
                NIP-50 with web operators:
              </p>
              <pre className="text-xs font-mono bg-muted/60 border border-border/50 rounded-lg p-4 overflow-x-auto text-foreground">{`["REQ","search",{ "kinds":[39697],
  "search":"bitcoin privacy site:github.com lang:en",
  "limit":50 }]`}</pre>
              <p>
                <strong className="text-foreground">Publish to the index</strong> — build kind 39697
                events per the spec (URL normalization → <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">d</code> identity,
                content hash → <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">x</code>) and
                pass the §13 test vectors before you ship.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://github.com/NostrDanish/SIP-01"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-sm font-medium transition-colors"
              >
                Canonical spec on GitHub
              </a>
              <a
                href="https://sip.shakespeare.wtf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-sm font-medium transition-colors"
              >
                Live spec &amp; explorer
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
