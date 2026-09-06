import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the constellation magnifier, inline SVG.
 *
 * Hand-tuned for small sizes (24–64px): the organic mesh is simplified to a
 * bold, well-spaced web of nodes drawn in `currentColor` (= --primary = the
 * user's accent), the deep node accents in dimmed currentColor, so the mark
 * follows the accent picker and theme. The night-navy tile stays constant.
 *
 * Matches public/brand/icon.svg in design language; static files carry the
 * full organic constellation.
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

      {/* The index inside the lens: an organic node web (bold, readable) */}
      <g stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.6">
        <line x1="12.6" y1="12.6" x2="8.4" y2="10.6" />
        <line x1="12.6" y1="12.6" x2="16.6" y2="9" />
        <line x1="12.6" y1="12.6" x2="17" y2="15.2" />
        <line x1="12.6" y1="12.6" x2="9.2" y2="16.4" />
        <line x1="12.6" y1="12.6" x2="14.4" y2="17.2" />
        <line x1="8.4" y1="10.6" x2="16.6" y2="9" />
        <line x1="16.6" y1="9" x2="17" y2="15.2" />
        <line x1="17" y1="15.2" x2="14.4" y2="17.2" />
        <line x1="9.2" y1="16.4" x2="14.4" y2="17.2" />
        <line x1="8.4" y1="10.6" x2="9.2" y2="16.4" />
      </g>
      {/* nodes: varying sizes, two-tone (accent + dimmed accent) */}
      <circle cx="12.6" cy="12.6" r="1.2" fill="currentColor" />
      <circle cx="8.4" cy="10.6" r="1.35" fill="currentColor" />
      <circle cx="16.6" cy="9" r="1" fill="currentColor" fillOpacity="0.5" />
      <circle cx="17" cy="15.2" r="0.9" fill="currentColor" />
      <circle cx="9.2" cy="16.4" r="1.05" fill="currentColor" fillOpacity="0.5" />
      <circle cx="14.4" cy="17.2" r="0.8" fill="currentColor" />
      {/* outrider + sparkles */}
      <circle cx="19.4" cy="6.6" r="0.85" fill="currentColor" fillOpacity="0.5" />
      <path d="M7 6.2 l0.5 1.1 1.1 0.5 -1.1 0.5 -0.5 1.1 -0.5 -1.1 -1.1 -0.5 1.1 -0.5 z" fill="currentColor" fillOpacity="0.6" />

      {/* Magnifying glass: lens ring + inner orbit + hollow handle with tip node */}
      <circle cx="12.6" cy="12.6" r="6.9" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12.6" cy="12.6" r="5.5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.5" />
      <line x1="17.7" y1="17.7" x2="19" y2="19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <rect x="18.5" y="21.2" width="2.5" height="6.6" rx="1.25" transform="rotate(-45 19.75 24.5)" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="24.3" cy="24.3" r="1.4" fill="currentColor" />
    </svg>
  );
}
