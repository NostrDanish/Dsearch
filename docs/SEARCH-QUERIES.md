# Presearchstr search queries

Presearchstr understands real search syntax. Type naturally — plain words
work exactly like before — and reach for operators when you want precision.

Everything is parsed into a structured form (text vs. filters) and executed
**locally** against the results: a relay or engine that doesn't understand
an operator can never answer it wrong. Operators work on the community web
index (SIP-01), Nostr content, and — where the engine supports them
natively (DuckDuckGo/Brave/SearXNG understand `site:`) — web results too.

## The basics

| You type | You get |
|---|---|
| `nostr privacy` | Pages containing **both** words (order-free). |
| `"decentralized search"` | The **exact phrase**, in that order — ranked above loose keyword matches. |
| `nostr AND privacy` | Same as the space version, made explicit. |
| `nostr OR bitcoin` | Pages about **either**. |
| `nostr NOT twitter` | Nostr pages that don't mention Twitter. (Shorthand: `nostr -twitter`.) |
| `nostr AND (privacy OR decentralization)` | Grouping with parentheses. |

Boolean operators are **UPPERCASE** (`AND`, `OR`, `NOT`). Lowercase
"and / or / not" stay ordinary words, so `rock and roll` and
`node not syncing` do what you mean. Precedence: `NOT` > `AND` > `OR`;
parentheses override.

## Filters

Filters constrain **where** results come from instead of what they say.
They combine freely with text and each other.

| Filter | Meaning | Example |
|---|---|---|
| `site:` | This site, **including subdomains** | `nostr site:github.com` matches `github.com`, `www.github.com`, `gist.github.com` — never `evilgithub.com` |
| `domain:` | This **exact host** only | `domain:github.com` is `github.com` and nothing under it |
| `title:` | Words must appear in the **title** | `title:nostr`, `title:"Nostr relay"` |
| `type:` | Document type from the index | `type:pdf`, `type:repository` (`type:code` ≈ repositories) |
| `lang:` | Content language (ISO 639-1) | `lang:en`, `lang:de` |
| `tag:` | Exact topic tag (no substring fuzz) | `tag:nostr` matches `nostr`, not `nostr-tools` |
| `before:` | Published/observed **before** this date | `before:2026-08-01` |
| `after:` | Published/observed **on or after** this date | `after:2026-01-01` |

Field names are case-insensitive (`SITE:` = `site:`), and values may be
quoted (`title:"Nostr relay"`). A stray scheme or slash is tolerated
(`site:https://github.com/` works).

Combined:

```
nostr privacy site:github.com lang:en
nostr type:pdf after:2026-01-01
"nostr relay" site:github.com before:2026-08-01
```

## Notes & edge behavior

- **Dates** — `before:`/`after:` read the page's own publication date when
  the index carries one, otherwise the time it was observed by an indexer.
  `YYYY`, `YYYY-MM`, and `YYYY-MM-DD` all work. Invalid dates
  (`after:someday`) are ignored rather than breaking the search.
- **Unknown metadata** — a document with no known language passes a `lang:`
  filter (most pages aren't language-tagged yet); a document with no known
  type **fails** a `type:` filter (type is never guessed).
- **Your settings language filter** (Settings → General) still applies; an
  explicit `lang:` operator wins for that search.
- **Nostr identifiers stay private** — an npub/note/URL in the search bar
  never leaves for external engines at all (query classification runs first).
- Malformed syntax (`nostr AND`, unclosed quotes, empty `site:`) never
  crashes anything — the engine recovers and searches on.

Under the hood: `src/lib/queryParser.ts` (structured parse) +
`src/lib/queryEngine.ts` (authoritative local evaluation). Both are
internal to Presearchstr — no protocol changes, nothing to federate.
