import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the constellation magnifier, inline SVG.
 *
 * Design language (matches public/brand/icon.svg): a magnifying glass whose
 * double-orbit lens holds a node mesh, with outrider nodes on stems, a hollow
 * outlined handle, and a node at its tip. Everything draws in `currentColor`
 * (= --primary = the user's accent), deep accents in dimmed currentColor, so
 * the mark follows the accent picker and theme. The night-navy tile stays
 * constant across themes.
 *
 * Tuned for 24–64px: fewer, bigger nodes than the static masters, which carry
 * the full organic constellation.
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
      <rect x="1" y="1" width="30" height="30" rx="7" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />

      {/* Orbit rings: outer solid, inner dashed with a gap */}
      <circle cx="13" cy="13" r="8.1" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.1" />
      <circle cx="13" cy="13" r="6.5" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.7" strokeDasharray="29 12" strokeLinecap="round" transform="rotate(110 13 13)" />

      {/* Outrider stems */}
      <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.55">
        <line x1="10.2" y1="9.8" x2="7.2" y2="6.8" />
        <line x1="15.8" y1="9.8" x2="18.8" y2="6.8" />
        <line x1="9.2" y1="16.6" x2="6.4" y2="19.4" />
      </g>

      {/* Inner mesh */}
      <g stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.55">
        <line x1="13" y1="13" x2="10.2" y2="9.8" />
        <line x1="13" y1="13" x2="15.8" y2="9.8" />
        <line x1="13" y1="13" x2="10.6" y2="16.2" />
        <line x1="13" y1="13" x2="15.6" y2="16" />
        <line x1="10.2" y1="9.8" x2="15.8" y2="9.8" />
        <line x1="10.6" y1="16.2" x2="15.6" y2="16" />
      </g>

      {/* Inner nodes */}
      <circle cx="13" cy="13" r="1.15" fill="currentColor" />
      <circle cx="10.2" cy="9.8" r="0.8" fill="currentColor" />
      <circle cx="15.8" cy="9.8" r="0.75" fill="currentColor" fillOpacity="0.5" />
      <circle cx="10.6" cy="16.2" r="0.75" fill="currentColor" />
      <circle cx="15.6" cy="16" r="0.85" fill="currentColor" fillOpacity="0.5" />

      {/* Outrider nodes */}
      <circle cx="7.2" cy="6.8" r="1.35" fill="currentColor" />
      <circle cx="18.8" cy="6.8" r="1.35" fill="currentColor" />
      <circle cx="6.4" cy="19.4" r="1.35" fill="currentColor" />
      <circle cx="22.6" cy="11.8" r="0.8" fill="currentColor" />
      <circle cx="4.6" cy="12.8" r="0.7" fill="currentColor" fillOpacity="0.5" />
      <circle cx="16.6" cy="3.6" r="0.75" fill="currentColor" />

      {/* Sparkle + dust */}
      <path d="M25.2 3.4 l0.55 1.3 1.3 0.55 -1.3 0.55 -0.55 1.3 -0.55 -1.3 -1.3 -0.55 1.3 -0.55 z" fill="currentColor" fillOpacity="0.65" />
      <circle cx="27" cy="15" r="0.5" fill="currentColor" fillOpacity="0.5" />

      {/* Handle: stub neck + hollow capsule + tip node
          (capsule centerline (19.4,19.4)→(23.2,23.2), thickness 2.4) */}
      <line x1="17.9" y1="17.9" x2="19.2" y2="19.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="20.1" y="17.42" width="2.4" height="7.77" rx="1.2" transform="rotate(-45 21.3 21.3)" stroke="currentColor" strokeWidth="1.15" fill="none" />
      <circle cx="24.6" cy="24.6" r="1.5" fill="currentColor" />
    </svg>
  );
}
