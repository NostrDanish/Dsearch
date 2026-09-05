import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the magnifier-with-network-graph icon as inline SVG.
 *
 * Unlike /favicon.svg (a static file for browser tabs and READMEs, always
 * brand amber), this renders inline with `currentColor`, so the mark follows
 * the user's accent color (Settings → Appearance) and the light/dark theme.
 * The night-navy tile stays constant on every theme — it's the brand's
 * app-icon surface.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('text-primary', className)}
    >
      {/* Icon tile: night-navy rounded square (constant across themes) */}
      <rect width="32" height="32" rx="8" fill="#070b1a" />
      <rect x="1" y="1" width="30" height="30" rx="7" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.5" />
      {/* Magnifying glass: the search lens */}
      <circle cx="14" cy="14" r="6.5" stroke="currentColor" strokeWidth="2.4" />
      {/* The index inside the lens: a tiny network graph */}
      <path d="M14 11.2 L11.4 16 M14 11.2 L16.6 16 M11.4 16 L16.6 16" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.9" />
      <circle cx="14" cy="11.2" r="1.15" fill="currentColor" />
      <circle cx="11.4" cy="16" r="1.15" fill="currentColor" />
      <circle cx="16.6" cy="16" r="1.15" fill="currentColor" />
      {/* Handle */}
      <line x1="18.8" y1="18.8" x2="24.5" y2="24.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
