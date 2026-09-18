import { describe, it, expect } from 'vitest';

import {
  braveConfigured,
  validateBravePayload,
  buildBraveSearchUrl,
  BRAVE_API_URL,
} from './braveProxy';

describe('braveConfigured', () => {
  it('is false without a key', () => {
    expect(braveConfigured({})).toBe(false);
    expect(braveConfigured({ BRAVE_API_KEY: '   ' })).toBe(false);
  });
  it('is true when a key is set', () => {
    expect(braveConfigured({ BRAVE_API_KEY: 'BSA-test' })).toBe(true);
  });
});

describe('validateBravePayload', () => {
  it('accepts a normal query', () => {
    expect(validateBravePayload({ q: 'decentralized search' })).toEqual({
      q: 'decentralized search',
      count: 20,
      search_lang: undefined,
    });
  });

  it('rejects empty / oversized / malformed input', () => {
    expect(typeof validateBravePayload(null)).toBe('string');
    expect(typeof validateBravePayload({})).toBe('string');
    expect(typeof validateBravePayload({ q: '' })).toBe('string');
    expect(typeof validateBravePayload({ q: 'x'.repeat(501) })).toBe('string');
    expect(typeof validateBravePayload({ q: 'ok', count: 0 })).toBe('string');
    expect(typeof validateBravePayload({ q: 'ok', search_lang: 'english' })).toBe('string');
  });

  it('caps count at 20', () => {
    const out = validateBravePayload({ q: 'ok', count: 99 });
    expect(out).toEqual({ q: 'ok', count: 20, search_lang: undefined });
  });
});

describe('buildBraveSearchUrl', () => {
  it('never embeds a key in the URL', () => {
    const url = buildBraveSearchUrl({ q: 'nostr', count: 10, search_lang: 'en' });
    expect(url.startsWith(BRAVE_API_URL)).toBe(true);
    expect(url).toContain('q=nostr');
    expect(url).toContain('search_lang=en');
    expect(url).not.toMatch(/sk-|BSA-|token|key/i);
  });
});
