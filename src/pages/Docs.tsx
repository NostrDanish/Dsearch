import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ArrowRight, BookOpen, Code, GraduationCap, Search, Server } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

export default function DocsPage() {
  useSeoMeta({
    title: 'Docs - DSearch',
    description: 'Understand DSearch in minutes: search it, contribute a crawler or indexer, run a relay, or build on the SIP protocol.',
  });

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Docs</h1>
        </div>
        <p className="text-muted-foreground mb-10 leading-relaxed max-w-2xl">
          Three doors into the ecosystem. Pick the one that sounds like you —
          every path is complete on its own, and they all connect.
        </p>

        {/* The three paths */}
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          <PathCard
            to="/"
            icon={<Search className="w-6 h-6 text-primary" />}
            title="I just want to search"
            description="No setup, no account. DSearch is a working search engine right now — the community index first, privacy-respecting web results alongside."
            cta="Open DSearch"
          />
          <PathCard
            to="/build"
            icon={<Server className="w-6 h-6 text-primary" />}
            title="I want to contribute"
            description="Run a crawler (Crawlstr), an indexer (Indexstr), or a SIP relay. Five levels, from 'just search' to 'operate infrastructure'."
            cta="Pick your level"
          />
          <PathCard
            to="/protocol"
            icon={<Code className="w-6 h-6 text-primary" />}
            title="I want to build"
            description="SIP-01 spec, test vectors, query examples, and the repos. Implement the protocol and your software joins the shared index."
            cta="Read the protocol"
          />
        </div>

        {/* Beginner shelf */}
        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Start here
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Plain-language answers, no protocol knowledge required.</p>
        <div className="grid gap-2 mb-12">
          {[
            { q: 'What is DSearch?', a: 'A decentralized search engine: the index lives on Nostr relays and is built by its users, not by a company crawler.', to: '/about' },
            { q: 'What is SIP?', a: 'The Search Index Protocol — the open standard (kind 39697 events) that lets every crawler, indexer, relay, and search engine share one index.', to: '/protocol' },
            { q: 'How do I help without technical skills?', a: 'Search. Seriously — with auto-indexing on, every search anonymously contributes surfaced pages back to the index.', to: '/dashboard' },
            { q: 'How do I run a crawler?', a: 'Open Crawlstr, add a seed URL, press start. It respects robots.txt and publishes observations under a throwaway device key.', to: '/build/crawlstr' },
            { q: 'How do I run a relay?', a: 'Three paths: one-click Cloudflare, a Docker VPS, or an Android phone. All validate and federate the same SIP-01 events.', to: '/build/relay' },
            { q: 'Who can see my searches?', a: 'The honest answer, with a traffic-light indicator next to the search bar and a full threat model.', to: '/about' },
          ].map((item) => (
            <Link
              key={item.q}
              to={item.to}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.q}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.a}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </Link>
          ))}
        </div>

        {/* Advanced shelf */}
        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          Go deeper
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Specifications, implementation guides, and source.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: 'SIP-01 — Web Index Observations', desc: 'The canonical spec: event format, URL normalization, content hashing, validation, test vectors.', href: 'https://github.com/NostrDanish/SIP-01', internal: '/protocol/sip-01' },
            { name: 'SIP-02 — Query layer (draft)', desc: 'The structured query language being grown from DSearch\u2019s working parser. Not finalized.', internal: '/protocol/sip-02' },
            { name: 'Structured search syntax', desc: 'Every operator the engine executes locally: boolean, phrases, site:, lang:, before:/after: …', href: 'https://github.com/NostrDanish/Dsearch/blob/main/docs/SEARCH-QUERIES.md' },
            { name: 'SIP-01 implementation guide', desc: 'How to build a compatible publisher, relay, or search node.', href: 'https://github.com/NostrDanish/Dsearch/blob/main/docs/IMPLEMENTATION-GUIDE.md' },
            { name: 'Custom event schemas (NIP.md)', desc: 'Everything DSearch writes to Nostr: stakes, term signals, submissions, legacy cache.', href: 'https://github.com/NostrDanish/Dsearch/blob/main/NIP.md' },
            { name: 'Provider architecture', desc: 'Add a search source in ~50 lines: one SearchProvider interface, no core changes.', href: 'https://github.com/NostrDanish/Dsearch/tree/main/src/lib/providers' },
          ].map((doc) => (
            <div key={doc.name} className="rounded-xl border border-border/60 bg-card/50 p-4">
              <p className="text-sm font-medium text-foreground mb-1">{doc.name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{doc.desc}</p>
              <div className="flex gap-3">
                {doc.internal && (
                  <Link to={doc.internal} className="text-xs font-medium text-primary hover:underline">Read here</Link>
                )}
                {doc.href && (
                  <a href={doc.href} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline">
                    View on GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function PathCard({ to, icon, title, description, cta }: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:border-primary/40 transition-colors">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4">
        {cta}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}
