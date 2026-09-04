import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Settings, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { SubmitToIndex } from '@/components/SubmitToIndex';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  /** When true, the layout uses a minimal header (for the home search page). */
  minimal?: boolean;
}

/** The ecosystem hub sections — desktop nav + footer. */
const HUB_LINKS = [
  { to: '/network', label: 'Network' },
  { to: '/build', label: 'Build' },
  { to: '/protocol', label: 'Protocol' },
  { to: '/community', label: 'Community' },
] as const;

export function Layout({ children, minimal = false }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip link — the first Tab stop on every page. Keyboard users can
          jump straight to the content; also makes it immediately obvious
          that Tab focus is working. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className={cn(
        'sticky top-0 z-40 border-b border-border/50 backdrop-blur-xl bg-background/80',
        minimal && 'border-transparent bg-transparent backdrop-blur-none',
      )}>
        <div className="container flex items-center justify-between h-14 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="DSearch home">
            <img
              src="/favicon.svg"
              alt=""
              className="w-8 h-8 rounded-lg border border-primary/20 group-hover:border-primary/40 transition-colors"
            />
            <span className="font-semibold text-lg tracking-tight">
              <span className="text-primary">D</span>
              <span className="text-foreground">Search</span>
            </span>
          </Link>

          {/* Hub navigation — the ecosystem sections. Desktop only; mobile
              users reach the same pages from the footer. */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Ecosystem">
            {HUB_LINKS.map((link) => (
              <Button
                key={link.to}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  'text-muted-foreground hover:text-foreground',
                  location.pathname.startsWith(link.to) && 'text-foreground bg-accent/50',
                )}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          <nav className="flex items-center gap-1" aria-label="App">
            {!isHome && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/">
                  <Search className="w-4 h-4 mr-1.5" />
                  Search
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubmitOpen(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Submit a link to the community index"
            >
              <PlusCircle className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Link to="/settings" aria-label="Settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>

            <LoginArea className="max-w-48" />
          </nav>
        </div>
      </header>

      {/* Main content — tabIndex -1 so the skip link can move focus here
          without adding an extra stop to the tab order. */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold"><span className="text-primary/70">D</span>Search</span>
            <span className="text-border">|</span>
            <span>Search the Web. Build the Index.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {HUB_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
            <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <Link to="/policy" className="hover:text-foreground transition-colors">Content Policy</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Vibed with Shakespeare
            </a>
          </div>
        </div>
      </footer>

      {/* Community index submission dialog */}
      <SubmitToIndex open={submitOpen} onOpenChange={setSubmitOpen} />
    </div>
  );
}
