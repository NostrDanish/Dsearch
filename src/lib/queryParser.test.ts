/**
 * Query parser tests — the structured-query front end. The parser must
 * NEVER throw; malformed input degrades gracefully with hadErrors set.
 */
import { describe, it, expect } from 'vitest';

import { parseQuery, textOnly, toEngineQuery, type QueryNode } from '@/lib/queryParser';

/** Helper: unwrap to the root and assert kind. */
function root(q: string): QueryNode | undefined {
  return parseQuery(q).expr;
}

describe('plain terms and phrases', () => {
  it('parses plain terms as an implicit AND', () => {
    const p = parseQuery('nostr privacy');
    expect(p.expr).toMatchObject({
      type: 'and',
      implicit: true,
      children: [{ type: 'term', value: 'nostr' }, { type: 'term', value: 'privacy' }],
    });
    expect(p.hasBoolean).toBe(false);
    expect(p.hasFilters).toBe(false);
  });

  it('parses a quoted phrase', () => {
    const p = parseQuery('"decentralized search"');
    expect(p.expr).toEqual({ type: 'phrase', value: 'decentralized search' });
    expect(p.hasPhrases).toBe(true);
  });

  it('keeps phrases and terms together', () => {
    const p = parseQuery('nostr "privacy is freedom" protocol');
    expect(p.expr).toMatchObject({
      type: 'and',
      children: [
        { type: 'term', value: 'nostr' },
        { type: 'phrase', value: 'privacy is freedom' },
        { type: 'term', value: 'protocol' },
      ],
    });
  });

  it('handles an unclosed phrase gracefully', () => {
    const p = parseQuery('nostr "decentralized search');
    expect(p.hadErrors).toBe(true);
    expect(p.expr).toMatchObject({
      type: 'and',
      children: [{ type: 'term', value: 'nostr' }, { type: 'phrase', value: 'decentralized search' }],
    });
  });

  it('empty and whitespace queries parse to nothing', () => {
    expect(parseQuery('').expr).toBeUndefined();
    expect(parseQuery('   ').expr).toBeUndefined();
  });

  it('stop-word-only queries keep their words', () => {
    const p = parseQuery('the who');
    expect(p.expr).toMatchObject({ type: 'and', children: [{ type: 'term' }, { type: 'term' }] });
  });

  it('unicode and punctuation survive as terms', () => {
    expect(root('søgning æøå')).toMatchObject({ type: 'and' });
    expect(root('C++')).toEqual({ type: 'term', value: 'C++' });
  });
});

describe('boolean operators', () => {
  it('parses AND', () => {
    const p = parseQuery('nostr AND privacy');
    expect(p.expr).toMatchObject({ type: 'and', implicit: false });
    expect(p.hasBoolean).toBe(true);
  });

  it('parses OR', () => {
    expect(root('nostr OR bitcoin')).toMatchObject({
      type: 'or',
      children: [{ type: 'term', value: 'nostr' }, { type: 'term', value: 'bitcoin' }],
    });
  });

  it('parses NOT', () => {
    expect(root('nostr NOT twitter')).toMatchObject({
      type: 'and',
      children: [{ type: 'term', value: 'nostr' }, { type: 'not', child: { type: 'term', value: 'twitter' } }],
    });
  });

  it('parses the - prefix as NOT', () => {
    expect(root('nostr -twitter')).toMatchObject({
      type: 'and',
      children: [{ type: 'term' }, { type: 'not', child: { type: 'term', value: 'twitter' } }],
    });
  });

  it('respects precedence: NOT > AND > OR', () => {
    // a OR b AND NOT c  →  a OR (b AND (NOT c))
    expect(root('a OR b AND NOT c')).toMatchObject({
      type: 'or',
      children: [
        { type: 'term', value: 'a' },
        {
          type: 'and',
          children: [{ type: 'term', value: 'b' }, { type: 'not', child: { type: 'term', value: 'c' } }],
        },
      ],
    });
  });

  it('parses parentheses', () => {
    expect(root('nostr AND (privacy OR decentralization)')).toMatchObject({
      type: 'and',
      children: [
        { type: 'term', value: 'nostr' },
        { type: 'or', children: [{ type: 'term', value: 'privacy' }, { type: 'term', value: 'decentralization' }] },
      ],
    });
  });

  it('parses nested parentheses', () => {
    expect(root('(nostr OR bitcoin) AND privacy')).toMatchObject({
      type: 'and',
      children: [
        { type: 'or', children: [{ type: 'term', value: 'nostr' }, { type: 'term', value: 'bitcoin' }] },
        { type: 'term', value: 'privacy' },
      ],
    });
  });

  it('lowercase and/or/not stay ordinary words', () => {
    const p = parseQuery('rock and roll');
    expect(p.hasBoolean).toBe(false);
    expect(p.expr).toMatchObject({ type: 'and', implicit: true });
    const words = JSON.stringify(p.expr);
    expect(words).toContain('"and"');
  });

  it('drops dangling operators without crashing', () => {
    const p1 = parseQuery('nostr AND');
    expect(p1.hadErrors).toBe(true);
    expect(p1.expr).toEqual({ type: 'term', value: 'nostr' });

    const p2 = parseQuery('nostr OR');
    expect(p2.hadErrors).toBe(true);

    const p3 = parseQuery('nostr NOT');
    expect(p3.hadErrors).toBe(true);
  });

  it('handles empty parens and stray parens', () => {
    expect(parseQuery('nostr ()').hadErrors).toBe(true);
    expect(parseQuery('nostr )').hadErrors).toBe(true);
    expect(parseQuery('nostr ()').expr).toEqual({ type: 'term', value: 'nostr' });
  });
});

describe('filters', () => {
  it('parses every supported field', () => {
    for (const field of ['site', 'domain', 'title', 'type', 'lang', 'tag', 'before', 'after'] as const) {
      const value = field === 'before' || field === 'after' ? '2026-01-01' : 'x';
      const p = parseQuery(`nostr ${field}:${value}`);
      expect(p.hasFilters).toBe(true);
      expect(p.filters[0]).toMatchObject({ field, value, negated: false });
    }
  });

  it('separates text from filters (TEXT QUERY != FILTER)', () => {
    const p = parseQuery('nostr privacy site:github.com');
    expect(p.expr).toMatchObject({
      type: 'and',
      children: [
        { type: 'term', value: 'nostr' },
        { type: 'term', value: 'privacy' },
        { type: 'filter', field: 'site', value: 'github.com' },
      ],
    });
    // The filter value must not appear as a text term.
    expect(textOnly(p)).toBe('nostr privacy');
  });

  it('normalizes uppercase field names', () => {
    const p = parseQuery('SITE:github.com LANG:EN');
    expect(p.filters).toEqual([
      { field: 'site', value: 'github.com', negated: false },
      { field: 'lang', value: 'EN', negated: false },
    ]);
  });

  it('parses quoted filter values', () => {
    const p = parseQuery('title:"Nostr relay"');
    expect(p.filters[0]).toMatchObject({ field: 'title', value: 'Nostr relay' });
  });

  it('marks negated filters', () => {
    const p = parseQuery('nostr NOT site:twitter.com');
    expect(p.filters[0]).toMatchObject({ field: 'site', value: 'twitter.com', negated: true });
  });

  it('drops empty filter values gracefully (site:)', () => {
    const p = parseQuery('nostr site:');
    expect(p.hadErrors).toBe(true);
    expect(p.hasFilters).toBe(false);
  });

  it('treats unknown operators as plain text (unknown:value)', () => {
    const p = parseQuery('nostr foo:bar');
    expect(p.hasFilters).toBe(false);
    expect(p.expr).toMatchObject({
      type: 'and',
      children: [{ type: 'term', value: 'nostr' }, { type: 'term', value: 'foo:bar' }],
    });
  });

  it('does NOT mangle URLs containing colons', () => {
    const p = parseQuery('https://example.com/page');
    expect(p.hasFilters).toBe(false);
    expect(p.expr).toEqual({ type: 'term', value: 'https://example.com/page' });
  });

  it('keeps operator-ish words inside text harmless', () => {
    // "website:" contains "site" but the field is "website" — unknown → term.
    const p = parseQuery('website:review');
    expect(p.hasFilters).toBe(false);
  });
});

describe('textOnly', () => {
  it('returns the text residue with phrases re-quoted', () => {
    expect(textOnly(parseQuery('nostr AND (privacy OR decentralization) site:github.com "exact words"'))).toBe(
      'nostr privacy decentralization "exact words"',
    );
  });

  it('returns empty string for filters-only queries', () => {
    expect(textOnly(parseQuery('site:github.com lang:en'))).toBe('');
  });
});

describe('toEngineQuery (DDG-family translation)', () => {
  it('keeps text and native operators, translates NOT to -', () => {
    const p = parseQuery('nostr privacy NOT twitter site:github.com');
    expect(toEngineQuery(p)).toBe('nostr privacy -twitter site:github.com');
  });

  it('keeps quotes and before:/after:, maps title: to intitle:', () => {
    const p = parseQuery('"exact phrase" title:nostr after:2026-01-01');
    expect(toEngineQuery(p)).toBe('"exact phrase" intitle:nostr after:2026-01-01');
  });

  it('drops lang:/type:/tag: from the text (enforced locally, never sent as junk)', () => {
    const p = parseQuery('nostr lang:de type:pdf tag:nostr');
    expect(toEngineQuery(p)).toBe('nostr');
  });

  it('renders OR chains and keeps dash-prefixed terms', () => {
    expect(toEngineQuery(parseQuery('nostr OR bitcoin'))).toBe('nostr OR bitcoin');
    expect(toEngineQuery(parseQuery('nostr -twitter'))).toBe('nostr -twitter');
  });

  it('never mangles a URL term', () => {
    expect(toEngineQuery(parseQuery('https://example.com/page'))).toBe('https://example.com/page');
  });
});

describe('memoization', () => {
  it('returns the identical object for the same string', () => {
    expect(parseQuery('nostr privacy')).toBe(parseQuery('nostr privacy'));
  });
});
