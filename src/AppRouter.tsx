import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import Policy from "./pages/Policy";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Explore from "./pages/Explore";
import Admin from "./pages/Admin";
import RemoteLoginSuccess from "./pages/RemoteLoginSuccess";
import NetworkPage from "./pages/Network";
import BuildPage from "./pages/Build";
import BuildCrawlstr from "./pages/BuildCrawlstr";
import BuildIndexstr from "./pages/BuildIndexstr";
import BuildRelay from "./pages/BuildRelay";
import ProtocolPage from "./pages/Protocol";
import ProtocolSip01 from "./pages/ProtocolSip01";
import ProtocolSip02 from "./pages/ProtocolSip02";
import CommunityPage from "./pages/Community";
import DashboardPage from "./pages/Dashboard";
import DocsPage from "./pages/Docs";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/explore" element={<Explore />} />
        {/* Ecosystem hub */}
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/build/crawlstr" element={<BuildCrawlstr />} />
        <Route path="/build/indexstr" element={<BuildIndexstr />} />
        <Route path="/build/relay" element={<BuildRelay />} />
        <Route path="/protocol" element={<ProtocolPage />} />
        <Route path="/protocol/sip-01" element={<ProtocolSip01 />} />
        <Route path="/protocol/sip-02" element={<ProtocolSip02 />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/docs" element={<DocsPage />} />
        {/* Hidden owner console — not linked in any nav */}
        <Route path="/admin" element={<Admin />} />
        {/* Legacy: instance management moved into Settings */}
        <Route path="/instances" element={<Navigate to="/settings" replace />} />
        {/* NIP-46 mobile signer callback — nostrconnect:// URIs point here */}
        <Route path="/remoteloginsuccess" element={<RemoteLoginSuccess />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
