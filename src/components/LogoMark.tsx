import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the magnifier-with-node-constellation icon as inline SVG.
 *
 * Unlike /favicon.svg (a static file for browser tabs and READMEs, always
 * brand amber), this renders inline with `currentColor`, so the mark follows
 * the user's accent color (Settings → Appearance) and the light/dark theme.
 * The night-navy tile stays constant on every theme — it's the brand's
 * app-icon surface.
 *
 * Geometry mirrors public/brand/icon.svg (the static master).
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
      <circle cx="13.5" cy="13.5" r="7" stroke="currentColor" strokeWidth="2.6" />
      {/* The index inside the lens: a node constellation */}
      <path d="M13.5 13.5 L13.5 9.3 M13.5 13.5 L9.9 15.7 M13.5 13.5 L17.1 15.7" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.8" />
      <path d="M9.9 15.7 L17.1 15.7" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.7" />
      <circle cx="13.5" cy="13.5" r="1.3" fill="currentColor" />
      <circle cx="13.5" cy="9.3" r="1.05" fill="currentColor" />
      <circle cx="9.9" cy="15.7" r="1.05" fill="currentColor" />
      <circle cx="17.1" cy="15.7" r="1.05" fill="currentColor" />
      {/* Handle */}
      <line x1="18.9" y1="18.9" x2="24.7" y2="24.7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
