import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the constellation magnifier, inline SVG.
 *
 * The mesh is drawn in `currentColor` (= --primary = the user's accent), the
 * deep node accents in a dimmed currentColor, so the mark follows the accent
 * picker and theme. The night-navy tile stays constant on every theme.
 *
 * Geometry mirrors public/brand/icon.svg (the static master) at 32px scale,
 * simplified to the five-node mesh so it stays crisp at 24px headers.
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
      {/* The index inside the lens: a five-node mesh */}
      <g stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.55">
        <line x1="13" y1="13" x2="8.6" y2="10.2" />
        <line x1="13" y1="13" x2="17.2" y2="9.6" />
        <line x1="13" y1="13" x2="17.6" y2="15.4" />
        <line x1="13" y1="13" x2="9.4" y2="16.6" />
        <line x1="8.6" y1="10.2" x2="17.2" y2="9.6" />
        <line x1="17.2" y1="9.6" x2="17.6" y2="15.4" />
        <line x1="9.4" y1="16.6" x2="17.6" y2="15.4" />
        <line x1="8.6" y1="10.2" x2="9.4" y2="16.6" />
      </g>
      <circle cx="13" cy="13" r="1.1" fill="currentColor" fillOpacity="0.45" />
      <circle cx="8.6" cy="10.2" r="1.25" fill="currentColor" />
      <circle cx="17.2" cy="9.6" r="1" fill="currentColor" />
      <circle cx="17.6" cy="15.4" r="0.8" fill="currentColor" fillOpacity="0.45" />
      <circle cx="9.4" cy="16.6" r="1.3" fill="currentColor" />
      {/* Magnifying glass: double-orbit lens + hollow handle with tip node */}
      <circle cx="13" cy="13" r="6.9" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1.6" />
      <circle cx="13" cy="13" r="5.6" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.5" />
      <line x1="18.3" y1="18.3" x2="19.6" y2="19.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <rect x="18.9" y="21.6" width="2.6" height="6.9" rx="1.3" transform="rotate(-45 20.2 25.05)" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="24.5" cy="24.5" r="1.45" fill="currentColor" />
    </svg>
  );
}
