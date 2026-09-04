import { useSeoMeta } from '@unhead/react';
import { ExternalLink, FileText } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProtocolSip01() {
  useSeoMeta({
    title: 'SIP-01 - DSearch Protocol',
    description: 'SIP-01 Web Index Observations: how a web page becomes a signed, verifiable Nostr event (kind 39697) that any search engine can index.',
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <p className="text-xs text-muted-foreground mb-2 font-mono">Protocol → SIP-01</p>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight">SIP-01 — Web Index Observations</h1>
          <Badge variant="default" className="text-[10px]">v1.2</Badge>
          <Badge variant="outline" className="text-[10px]">kind 39697</Badge>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          One signed statement: <em>"Indexer <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">pubkey</code> observed
          this web document at this time, and here is its lightweight metadata."</em> Any crawler can
          publish, any relay can store, any search node can consume, any engine can rank — without
          depending on a single company, crawler, relay, or signing key.
        </p>

        <div className="space-y-6">
          <Section title="The event at a glance">
            <pre className="text-xs font-mono bg-muted/60 border border-border/50 rounded-lg p-4 overflow-x-auto text-foreground">{`{
  "kind": 39697,
  "content": "{\\"title\\":\\"Example Page\\",
               \\"description\\":\\"A page about examples.\\"}",
  "tags": [
    ["d", "widx:3641c5f2274c5471278ab5bf1df6d185"],
    ["u", "https://example.com/page"],
    ["t", "nostr"],
    ["l", "en"],
    ["x", "2a5cbdf4…8e7c1"],
    ["v", "1"],
    ["source", "crawlstr/1"],
    ["alt", "Web index observation: Example Page"]
  ]
}`}</pre>
            <p className="mt-3">
              One addressable event per <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">(indexer pubkey, normalized URL)</code>.
              N indexers observing the same page produce N events with the same{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">d</code> — that agreement count is
              the network's ranking signal.
            </p>
          </Section>

          <Section title="Required fields">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    <th className="py-2 pr-4 font-medium text-foreground">Tag / field</th>
                    <th className="py-2 pr-4 font-medium text-foreground">Meaning</th>
                    <th className="py-2 font-medium text-foreground">Rule</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ['d', 'Document identity', 'widx: + first 32 hex chars of sha256(normalized URL)'],
                    ['u', 'Canonical URL', 'Must match d after §7 normalization (http/https only)'],
                    ['x', 'Content identity', 'sha256(title + "\\n" + description) — integrity check'],
                    ['v', 'Schema version', '"1" — unknown versions are rejected by validating relays'],
                    ['content.title', 'Page title', 'Required, hard length cap'],
                    ['alt', 'Human-readable summary', 'NIP-31 accessibility tag'],
                  ].map(([field, meaning, rule]) => (
                    <tr key={field} className="border-b border-border/30">
                      <td className="py-2 pr-4 font-mono text-foreground">{field}</td>
                      <td className="py-2 pr-4">{meaning}</td>
                      <td className="py-2">{rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Optional metadata">
            <div className="flex flex-wrap gap-2">
              {[
                ['t', 'topic tags (queryable)'],
                ['l', 'ISO 639-1 language'],
                ['published', 'page publication time'],
                ['description', 'in content JSON'],
                ['image', 'in content JSON'],
                ['type / platform / category', '§9.2 extensions'],
                ['network / country / mime', '§9.2 extensions'],
                ['source', 'indexer software id'],
              ].map(([tag, meaning]) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/50 text-xs">
                  <code className="font-mono text-foreground">{tag}</code>
                  <span className="text-muted-foreground">{meaning}</span>
                </span>
              ))}
            </div>
          </Section>

          <Section title="Why it can't be gamed silently">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Every observation is signed — provenance is never merged away',
                'The d ↔ u and x ↔ content relationships are verifiable by anyone (verifyObservation)',
                'Relay-side validation (§12.4) rejects malformed observations at the door with OK false',
                'URL normalization (§7) is byte-specified — all implementations dedupe identically',
                '§13 test vectors pin the hashing; if your implementation disagrees, it fails loudly in CI',
                'Deletions use NIP-09; updates are just newer addressable events with the same d',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary/60 mt-0.5 shrink-0">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Who implements it today">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                ['DSearch (this app)', 'reads + auto-indexes'],
                ['0xSearchstr', 'reads + auto-indexes'],
                ['Crawlstr', 'publishes (crawler)'],
                ['Indexstr', 'publishes (indexer)'],
                ['SIP Booster Relay', 'validates, indexes, federates'],
                ['UNCAGED Index Relay', 'validates, indexes (OpenSearch)'],
                ['Crawlstr SIP Relay', 'validates, replicates (Android)'],
                ['UNCAGED Engine', 'template for new engines'],
              ].map(([name, role]) => (
                <div key={name} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <FileText className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{role}</span>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://github.com/NostrDanish/SIP-01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-sm font-medium text-primary transition-colors"
            >
              Canonical spec (v1.2)
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://sip.shakespeare.wtf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-sm font-medium transition-colors"
            >
              Live spec, explorer &amp; test vectors
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
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
