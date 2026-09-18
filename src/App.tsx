// NOTE: This file should normally not be modified unless you are adding a new provider.
// To add new routes, edit the AppRouter.tsx file.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHead, UnheadProvider } from '@unhead/react/client';
import { InferSeoMetaPlugin } from 'unhead/plugins';
import { Suspense } from 'react';
import NostrProvider from '@/components/NostrProvider';
import { NostrSync } from '@/components/NostrSync';
import { ReferralCapture } from '@/components/ReferralCapture';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NostrLoginProvider } from '@nostrify/react/login';
import { AppProvider } from '@/components/AppProvider';
import { AppConfig } from '@/contexts/AppContext';
import { APP_RELAYS } from '@/lib/appRelays';
import { getBrowserLanguage } from '@/lib/languageFilter';
import { ENGINE_PROFILE } from '@/lib/engine/profile';
import { readStoredWithLegacy } from '@/lib/dsearchProtocol';
import AppRouter from './AppRouter';

// One-time localStorage migration: the app config moved from the generic
// `nostr:app-config` key to the engine-namespaced `dsearch:app-config`.
// Runs at module scope, before AppProvider's initializer reads storage.
const APP_STORAGE_KEY = 'dsearch:app-config';
readStoredWithLegacy(APP_STORAGE_KEY, 'nostr:app-config');

const head = createHead({
  plugins: [
    InferSeoMetaPlugin(),
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: Infinity,
    },
  },
});

const defaultConfig: AppConfig = {
  theme: ENGINE_PROFILE.branding.defaultTheme,
  accentColor: ENGINE_PROFILE.branding.defaultAccent,
  relayMetadata: APP_RELAYS,
  blossomServerMetadata: {
    servers: [
      'https://blossom.ditto.pub/',
      'https://blossom.dreamith.to/',
      'https://blossom.primal.net/',
    ],
    updatedAt: 0,
  },
  useAppBlossomServers: true,
  privacyMode: false,
  autoIndex: true,
  tabConfig: ENGINE_PROFILE.ui.tabConfig,
  voteWithIdentity: false,
  // Engines off by default (speed + principle of least surprise):
  //   brave         — BYOK/engine-tier; dormant until a key exists
  //   parallel      — BYOK; dormant until the user adds their own key anyway
  //   cached-index  — legacy kind 30078 cache (frozen/read-only; SIP-01 wins)
  //   wikipedia     — Wiki tab engine (tab hidden by default too)
  //   tor           — .onion search (Tor tab hidden by default)
  //   stackoverflow — Code tab engine (tab hidden by default too)
  // The SIP-01 web index, SearXNG, DuckDuckGo, Nostr, stakes, and community
  // stay on. Users re-enable anything in Settings → Engines. See
  // ENGINE_PROFILE.search.disabledProviders.
  disabledProviders: ENGINE_PROFILE.search.disabledProviders,
  // Language filter defaults to the browser's primary language (English
  // when it can't be detected). Only applies while the user has never
  // touched the filter — a stored choice, including a cleared one, wins.
  languageFilter: [getBrowserLanguage()],
};

export function App() {
  return (
    <UnheadProvider head={head}>
      <AppProvider storageKey={APP_STORAGE_KEY} defaultConfig={defaultConfig}>
        <QueryClientProvider client={queryClient}>
          <NostrLoginProvider storageKey='nostr:login'>
            <NostrProvider>
              <NostrSync />
              {/* Invite Friends capture (?ref=npub…) — inside providers so the
                  self-referral guard can see the logged-in user. */}
              <ReferralCapture />
              <TooltipProvider>
                <Toaster />
                <Suspense>
                  <AppRouter />
                </Suspense>
              </TooltipProvider>
            </NostrProvider>
          </NostrLoginProvider>
        </QueryClientProvider>
      </AppProvider>
    </UnheadProvider>
  );
}

export default App;
