import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the approved app icon.
 *
 * This is NOT a hand-coded SVG (those kept breaking the handle). It renders
 * the AI-generated master raster (public/brand/icon-1024.png) — the exact
 * same image the OS install dialog and PWA icon use. One source of truth:
 * the logo you approved is the logo everywhere.
 *
 * Theme reactivity: the raster is emerald/navy on transparent, so it sits
 * correctly on any theme surface. (A CSS-variable SVG can't do this; a
 * hardcoded hand-copy kept introducing geometry errors.)
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/icon-1024.png"
      alt=""
      aria-hidden="true"
      className={cn('rounded-lg', className)}
    />
  );
}
