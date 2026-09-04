import { useSeoMeta } from '@unhead/react';
import { ExternalLink, Search } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BuildCrawlstr() {
  useSeoMeta({
    title: 'Run Crawlstr - DSearch',
    description: 'Turn your browser into a voluntary crawl node that feeds the shared SIP-01 index. No backend, no account, robots.txt-aware.',
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <p className="text-xs text-muted-foreground mb-2 font-mono">Build → Crawlstr</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Run Crawlstr</h1>
        </div>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          Crawlstr is the lightweight, browser-based crawler of the DSearch ecosystem — the easiest
          way to help build the index. Open it, give it a seed, and your browser becomes a voluntary
          crawl node feeding the shared SIP-01 index on Nostr.
        </p>

        <div className="space-y-6">
          <Section title="What it does">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Fetches web pages politely — robots.txt, per-domain rate limits, sitemap and RSS discovery',
                'Extracts title, description, text, links and language; SHA-256 hashes content for network-wide dedup',
                'Signs each page as a SIP-01 kind 39697 observation with a per-device anonymous keypair',
                'Publishes to the SIP relay network — instantly searchable by DSearch, 0xSearchstr, and every compatible client',
                'Runs battery/WiFi/bandwidth-aware with a persistent IndexedDB queue that survives restarts',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary/60 mt-0.5 shrink-0">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Why it matters">
            <p>
              Most "decentralized search" projects still run centralized crawlers. Crawlstr makes
              every browser a potential crawler — opt-in, transparent, resource-aware. A hundred
              people running a tab each outcrawls a server rack, and nobody can switch it off.
            </p>
          </Section>

          <Section title="How to run it">
            <ol className="space-y-3 text-sm text-muted-foreground list-none">
              {[
                { step: '1', text: 'Open the app', code: 'https://crawlstr.vercel.app' },
                { step: '2', text: 'Add a seed URL you care about — or pick a "Scout" category and let it choose from the built-in seed corpus' },
                { step: '3', text: 'Press Start Crawling. The queue persists in your browser; close the tab and resume later' },
                { step: '4', text: 'Optionally tune resource limits — bandwidth cap, pages per hour, per-domain delay' },
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
              Self-host or inspect the source:{' '}
              <a href="https://github.com/NostrDanish/Crawlstr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                github.com/NostrDanish/Crawlstr<ExternalLink className="w-3 h-3 inline ml-0.5" />
              </a>
              {' '}— it's a static app; <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">npm install && npm run dev</code> is the whole setup.
            </p>
          </Section>

          <Section title="How it contributes to DSearch">
            <p>
              Every page Crawlstr observes becomes a SIP-01 event on the shared relay network.
              DSearch's Web Index provider reads exactly those events: a page you crawl today is a
              search result for everyone tomorrow. Your node also emits a coarse, privacy-minimal
              heartbeat (kind 16919) so the <a href="/network" className="text-primary hover:underline">Network page</a> can
              show the world that the swarm is alive.
            </p>
          </Section>

          <Section title="Privacy & safety">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Observations are signed by a throwaway per-device keypair — never your personal Nostr identity',
                'Events contain public page metadata only — never your searches or browsing history',
                'An SSRF guard refuses private/loopback/link-local targets before any request, direct or proxied',
                'Relay operators see the observation and your IP (that\'s how Nostr works) — use a VPN or Tor for network-layer privacy',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary/60 mt-0.5 shrink-0">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Troubleshooting">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Queue not moving? Many sites block browser fetches (CORS) — the built-in proxy fallback handles most; some sites simply refuse',
                'Nothing publishing? Check Settings → relays are reachable, and that you\'re online — the outbox flushes on reconnect',
                'High bandwidth? Lower the session bandwidth cap and pages/hour in Settings',
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
