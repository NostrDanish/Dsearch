import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { AlertTriangle, Code } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProtocolSip02() {
  useSeoMeta({
    title: 'SIP-02 (draft) - Dsearch Protocol',
    description: 'SIP-02 — the structured search query layer for the Search Index Protocol. Status: draft, in development. One portable query syntax for every SIP-compatible engine.',
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <p className="text-xs text-muted-foreground mb-2 font-mono">Protocol → SIP-02</p>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight">SIP-02 — Search Query Layer</h1>
          <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400">draft · not finalized</Badge>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          SIP-01 defines how documents live on the network. SIP-02 will define how{' '}
          <strong className="text-foreground">questions</strong> travel it: one structured query
          language that every SIP-compatible engine, relay, and client can parse the same way —
          instead of every frontend inventing its own syntax.
        </p>

        {/* Honesty box */}
        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-5 px-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Status: active development, nothing here is a standard yet.</strong>{' '}
              SIP-02 has no published specification. The syntax below is implemented and battle-tested
              inside Dsearch's own query engine
              (<code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">src/lib/queryParser.ts</code> +{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">queryEngine.ts</code>) — that
              working implementation is the seed of the future draft, and it already runs on every
              Dsearch search today.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Section title="The problem it solves">
            <p>
              Today, NIP-50 search is a single opaque string. A relay that misunderstands{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">site:</code> answers it
              wrong; a client can't tell whether an operator was applied or silently dropped. Dsearch's
              current answer is to re-evaluate everything locally — correct, but every client shouldn't
              have to reinvent that. SIP-02 lifts the structured query into the protocol: parse once,
              execute anywhere, and let engines advertise which operators they honor.
            </p>
          </Section>

          <Section title="The working syntax (implemented in Dsearch)">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    <th className="py-2 pr-4 font-medium text-foreground">Syntax</th>
                    <th className="py-2 font-medium text-foreground">Meaning</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ['nostr privacy', 'both words, order-free'],
                    ['"decentralized search"', 'exact phrase'],
                    ['nostr AND privacy', 'explicit boolean (UPPERCASE; lowercase stays text)'],
                    ['nostr OR bitcoin', 'either term'],
                    ['nostr NOT twitter', 'exclusion (nostr -twitter works too)'],
                    ['nostr AND (privacy OR decentralization)', 'parentheses with correct precedence'],
                    ['site:github.com', 'host + subdomains (never evilgithub.com)'],
                    ['domain:github.com', 'exact host only'],
                    ['title:"Nostr relay"', 'title-only search'],
                    ['type:pdf', 'SIP-01 type/mime metadata'],
                    ['lang:de', 'content language'],
                    ['tag:nostr', 'exact topic tag'],
                    ['before:2026-08-01 / after:2026-01-01', 'published/observed date boundaries'],
                  ].map(([syntax, meaning]) => (
                    <tr key={syntax} className="border-b border-border/30">
                      <td className="py-2 pr-4 font-mono text-foreground whitespace-nowrap">{syntax}</td>
                      <td className="py-2">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Try it live — every Dsearch search runs this parser, and the results page shows the
              parsed interpretation as "Understood as:" chips.
            </p>
          </Section>

          <Section title="Design principles for the draft">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Local-authoritative execution — a relay that ignores an operator can never answer it wrong',
                'Graceful degradation — engines that natively understand an operator get it; others get the text residue, and the merge layer enforces filters',
                'SIP-01-native fields — type:, tag:, lang:, before:/after: map directly onto SIP-01 tags',
                'Additive forever — like SIP-01, new operators register; old queries never change meaning',
                'Privacy-aware — sensitive query classes (NIP-19 identifiers, URLs, math) keep their deterministic local paths',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary/60 mt-0.5 shrink-0">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="How to follow or shape it">
            <p>
              The reference implementation lives in the{' '}
              <a href="https://github.com/NostrDanish/Dsearch" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                Dsearch repo
              </a>{' '}
              (<code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">src/lib/queryParser.ts</code>,{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">queryEngine.ts</code>, tests
              included). When the draft stabilizes it will be published alongside SIP-01 in the{' '}
              <a href="https://github.com/NostrDanish/SIP-01" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                SIP repository
              </a>
              . Discussion happens in the open — see{' '}
              <Link to="/community" className="text-primary hover:underline">Community</Link>.
            </p>
          </Section>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/70">
          <Code className="w-3.5 h-3.5" />
          <span>SIP-02 draft area — last reviewed September 2026</span>
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
