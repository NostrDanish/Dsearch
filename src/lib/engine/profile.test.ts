import { describe, it, expect } from 'vitest';

import { ENGINE_PROFILE, DSEARCH_PROFILE, DSEARCH_SYSTEM_PROMPT } from './profile';

describe('engine profile', () => {
  it('Dsearch is the active deployment profile', () => {
    expect(ENGINE_PROFILE.id).toBe('dsearch');
    expect(ENGINE_PROFILE).toBe(DSEARCH_PROFILE);
  });

  it('does not embed API secrets', () => {
    const json = JSON.stringify(ENGINE_PROFILE);
    expect(json).not.toMatch(/sk-/);
    expect(json).not.toMatch(/BRAVE_API_KEY/);
    expect(json).not.toMatch(/AI_API_KEY/);
  });

  it('keeps SIP-01 as a first-class search source with Dsearch attribution', () => {
    expect(ENGINE_PROFILE.search.sip01).toBe(true);
    expect(ENGINE_PROFILE.search.brave).toBe(true);
    // SIP-01 observations are attributed to Dsearch.
    expect(ENGINE_PROFILE.search.indexerSource).toBe('dsearch-web/1');
    expect(ENGINE_PROFILE.search.disabledProviders).not.toContain('web-index');
    expect(ENGINE_PROFILE.search.disabledProviders).not.toContain('searxng');
    expect(ENGINE_PROFILE.search.disabledProviders).not.toContain('duckduckgo');
  });

  it('keeps the ecosystem hub UI fully visible (Dsearch is the hub)', () => {
    expect(ENGINE_PROFILE.ui.showNetwork).toBe(true);
    expect(ENGINE_PROFILE.ui.showBuild).toBe(true);
    expect(ENGINE_PROFILE.ui.showProtocol).toBe(true);
    expect(ENGINE_PROFILE.ui.showCommunity).toBe(true);
    expect(ENGINE_PROFILE.ui.showTrending).toBe(true);
    expect(ENGINE_PROFILE.ui.showNostr).toBe(true);
  });

  it('uses dsearch.com as the public site identity', () => {
    expect(ENGINE_PROFILE.branding.siteUrl).toBe('https://dsearch.com');
    expect(ENGINE_PROFILE.branding.domain).toBe('dsearch.com');
    expect(ENGINE_PROFILE.branding.name).toBe('Dsearch');
    expect(ENGINE_PROFILE.branding.ogImage.startsWith('https://')).toBe(true);
  });

  it('ships a neutral, evidence-bound AI profile (no worldview baked in)', () => {
    expect(ENGINE_PROFILE.ai.systemPrompt).toBe(DSEARCH_SYSTEM_PROMPT);
    expect(DSEARCH_SYSTEM_PROMPT).toMatch(/NEVER invent/);
    expect(DSEARCH_SYSTEM_PROMPT).toMatch(/ONLY the supplied evidence/i);
  });
});
