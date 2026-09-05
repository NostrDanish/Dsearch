import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Settings, PlusCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LoginArea } from '@/components/auth/LoginArea';
import { LogoMark } from '@/components/LogoMark';
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
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/community', label: 'Community' },
] as const;

/** Everything reachable from the mobile menu. */
const MOBILE_LINKS = [
  { to: '/', label: 'Search' },
  ...HUB_LINKS,
  { to: '/docs', label: 'Docs' },
  { to: '/explore', label: 'Explore' },
  { to: '/about', label: 'About' },
  { to: '/policy', label: 'Content Policy' },
  { to: '/settings', label: 'Settings' },
] as const;

export function Layout({ children, minimal = false }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [submitOpen, setSubmitOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Dsearch home">
            <LogoMark className="w-8 h-8 rounded-lg group-hover:drop-shadow-[0_0_6px_currentColor] transition-all" />
            <span className="font-semibold text-lg tracking-tight">
              <span className="text-primary">D</span>
              <span className="text-foreground">search</span>
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

            {/* Mobile menu — the whole ecosystem, reachable on every screen.
                The desktop hub nav above is hidden below lg; without this,
                phone users could only reach hub pages from the footer. */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 lg:hidden text-muted-foreground hover:text-foreground"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <LogoMark className="w-6 h-6 rounded-md" />
                    <span><span className="text-primary">D</span>search</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Mobile">
                  {MOBILE_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors',
                        (link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)) &&
                          'text-foreground bg-accent/50 font-medium',
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
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
            <span className="font-semibold"><span className="text-primary/70">D</span>search</span>
            <span className="text-border">|</span>
            <span>Search the Web. Build the Index.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {HUB_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
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
