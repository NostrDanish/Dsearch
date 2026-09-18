/**
 * Affiliate rule engine tests — the cases that broke in the field:
 * Amazon single-param tagging, eBay multi-param (EPN) tagging, subdomain
 * matching, replacing existing affiliate params, redirect rules, and the
 * {url} placeholder. Plus backward compat with the old param/value schema.
 */
import { describe, it, expect } from 'vitest';

import {
  applyAffiliateRules,
  buildAffiliateRulesEvent,
  isValidAffiliateRule,
  normalizeHostInput,
  paramsFromUrl,
  parseAffiliateRules,
  AFFILIATES_D_TAG,
  AFFILIATES_KIND,
  type AffiliateRule,
} from './affiliates';

const AMAZON: AffiliateRule = { host: 'amazon.ca', mode: 'param', params: { tag: 'dsearch-21' } };
const EBAY: AffiliateRule = {
  host: 'ebay.com',
  mode: 'param',
  params: { mkcid: '1', mkrid: '711-53200-19255-0', siteid: '123', campid: '456', customid: 'dsearch' },
};
const PPQ: AffiliateRule = { host: 'ppq.ai', mode: 'redirect', target: 'https://ppq.ai/invite/949880ca' };

describe('applyAffiliateRules', () => {
  it('Amazon: appends ?tag= to a product URL', () => {
    const out = applyAffiliateRules('https://www.amazon.ca/dp/B0EXAMPLE', [AMAZON]);
    expect(out).toBe('https://www.amazon.ca/dp/B0EXAMPLE?tag=dsearch-21');
  });

  it('Amazon: replaces an existing (scraped) tag with ours', () => {
    const out = applyAffiliateRules('https://amazon.ca/dp/B0EXAMPLE?tag=someone-else-20', [AMAZON]);
    expect(out).toBe('https://amazon.ca/dp/B0EXAMPLE?tag=dsearch-21');
  });

  it('eBay: sets the full EPN parameter map at once', () => {
    const out = applyAffiliateRules('https://www.ebay.com/itm/123456789', [EBAY]);
    const u = new URL(out);
    expect(u.searchParams.get('mkcid')).toBe('1');
    expect(u.searchParams.get('mkrid')).toBe('711-53200-19255-0');
    expect(u.searchParams.get('siteid')).toBe('123');
    expect(u.searchParams.get('campid')).toBe('456');
    expect(u.searchParams.get('customid')).toBe('dsearch');
    expect(u.pathname).toBe('/itm/123456789');
  });

  it('eBay: preserves unrelated existing params while replacing colliding ones', () => {
    const out = applyAffiliateRules('https://ebay.com/itm/1?hash=abc&campid=OLD', [EBAY]);
    const u = new URL(out);
    expect(u.searchParams.get('hash')).toBe('abc');
    expect(u.searchParams.get('campid')).toBe('456');
  });

  it('subdomains match (www., smile., etc.)', () => {
    expect(applyAffiliateRules('https://smile.amazon.ca/x', [AMAZON])).toContain('tag=dsearch-21');
    expect(applyAffiliateRules('https://www.ebay.com/itm/1', [EBAY])).toContain('mkcid=1');
  });

  it('redirect mode replaces the URL with the referral link', () => {
    expect(applyAffiliateRules('https://ppq.ai/models', [PPQ])).toBe('https://ppq.ai/invite/949880ca');
  });

  it('redirect mode substitutes {url} with the encoded original', () => {
    const rule: AffiliateRule = { host: 'example.com', mode: 'redirect', target: 'https://ref.io/go?to={url}' };
    expect(applyAffiliateRules('https://example.com/page?x=1', [rule]))
      .toBe(`https://ref.io/go?to=${encodeURIComponent('https://example.com/page?x=1')}`);
  });

  it('non-matching hosts and non-http(s) URLs pass through untouched', () => {
    expect(applyAffiliateRules('https://amazon.com/dp/B0EXAMPLE', [AMAZON])).toBe('https://amazon.com/dp/B0EXAMPLE');
    expect(applyAffiliateRules('magnet:?xt=urn:btih:abc', [AMAZON])).toBe('magnet:?xt=urn:btih:abc');
    expect(applyAffiliateRules('not a url', [AMAZON])).toBe('not a url');
  });
});

describe('validation', () => {
  it('accepts Amazon-style single param', () => {
    expect(isValidAffiliateRule(AMAZON)).toBe(true);
  });

  it('accepts eBay-style multi-param', () => {
    expect(isValidAffiliateRule(EBAY)).toBe(true);
  });

  it('rejects empty params, bad hosts, junk names, and broken redirect targets', () => {
    expect(isValidAffiliateRule({ host: 'ebay.com', mode: 'param', params: {} })).toBe(false);
    expect(isValidAffiliateRule({ host: 'not a host', mode: 'param', params: { tag: 'x' } })).toBe(false);
    expect(isValidAffiliateRule({ host: 'ebay.com', mode: 'param', params: { 'bad name': 'x' } })).toBe(false);
    expect(isValidAffiliateRule({ host: 'ebay.com', mode: 'param', params: { tag: 'has&equals=' } })).toBe(false);
    expect(isValidAffiliateRule({ host: 'ppq.ai', mode: 'redirect', target: 'not a url' })).toBe(false);
    expect(isValidAffiliateRule({ host: 'ppq.ai', mode: 'redirect', target: 'http://insecure.example.com/x' })).toBe(false);
  });
});

describe('paramsFromUrl (admin auto-fill)', () => {
  it('extracts host + all query params from a pasted affiliate URL', () => {
    const out = paramsFromUrl('https://www.ebay.com/itm/123?mkcid=1&mkrid=711-53200-19255-0&campid=456');
    expect(out).not.toBeNull();
    expect(out!.host).toBe('ebay.com');
    expect(out!.params).toEqual({ mkcid: '1', mkrid: '711-53200-19255-0', campid: '456' });
  });

  it('rejects non-URLs and non-http(s)', () => {
    expect(paramsFromUrl('ebay.com')).toBeNull();
    expect(paramsFromUrl('magnet:?xt=1')).toBeNull();
  });
});

describe('normalizeHostInput', () => {
  it('extracts the host from a pasted URL', () => {
    expect(normalizeHostInput('https://ppq.ai/invite/949880ca')).toBe('ppq.ai');
    expect(normalizeHostInput('https://WWW.Amazon.CA/dp/x?tag=y')).toBe('amazon.ca');
  });

  it('strips www, ports, paths, trailing dots from bare input', () => {
    expect(normalizeHostInput('www.ebay.com')).toBe('ebay.com');
    expect(normalizeHostInput('amazon.ca/')).toBe('amazon.ca');
  });
});

describe('schema back-compat', () => {
  const fakeEvent = (content: string) => ({
    kind: AFFILIATES_KIND,
    pubkey: 'c45041618951bb6012ac23f5cdf3d740465f2d640be841fd9bb1d0733370cd3c',
    tags: [['d', AFFILIATES_D_TAG]],
    content,
  }) as Parameters<typeof parseAffiliateRules>[0];

  const owner = new Set(['c45041618951bb6012ac23f5cdf3d740465f2d640be841fd9bb1d0733370cd3c']);

  it('old single param/value rules parse as one-entry params', () => {
    const event = fakeEvent(JSON.stringify({
      version: 1,
      rules: [{ host: 'amazon.ca', param: 'tag', value: 'dsearch-21' }],
    }));
    const rules = parseAffiliateRules(event, owner);
    expect(rules).toEqual([{ host: 'amazon.ca', mode: 'param', params: { tag: 'dsearch-21' }, target: undefined }]);
  });

  it('single-param rules serialize with legacy param/value fields too', () => {
    const template = buildAffiliateRulesEvent([AMAZON]);
    const written = JSON.parse(template.content) as { rules: Record<string, unknown>[] };
    expect(written.rules[0].params).toEqual({ tag: 'dsearch-21' });
    expect(written.rules[0].param).toBe('tag');
    expect(written.rules[0].value).toBe('dsearch-21');
  });

  it('multi-param rules serialize without legacy fields', () => {
    const template = buildAffiliateRulesEvent([EBAY]);
    const written = JSON.parse(template.content) as { rules: Record<string, unknown>[] };
    expect(written.rules[0].param).toBeUndefined();
  });

  it('the config event carries the canonical dsearch d-tag + t-tag', () => {
    const template = buildAffiliateRulesEvent([AMAZON]);
    expect(template.tags).toContainEqual(['d', 'dsearch:affiliate-rules']);
    expect(template.tags).toContainEqual(['t', 'dsearch-affiliate-rules']);
    expect(JSON.stringify(template.tags)).not.toContain('presearchstr');
    expect(JSON.stringify(template.tags)).not.toContain('0xsearchstr');
  });
});
