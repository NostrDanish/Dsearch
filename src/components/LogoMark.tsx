import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the magnifier with the five-node mesh inside its lens,
 * rendered as inline SVG in `currentColor`, so the mark follows the user's
 * accent color (Settings → Appearance) and the light/dark theme. The
 * night-navy tile stays constant on every theme.
 *
 * Geometry mirrors public/brand/icon.svg (the static master) scaled to 32.
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
      <g stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.65">
        <line x1="13" y1="13" x2="9.95" y2="10.55" />
        <line x1="13" y1="13" x2="16.05" y2="10.55" />
        <line x1="13" y1="13" x2="10.7" y2="16.2" />
        <line x1="13" y1="13" x2="15.3" y2="16.2" />
        <line x1="9.95" y1="10.55" x2="16.05" y2="10.55" />
        <line x1="9.95" y1="10.55" x2="10.7" y2="16.2" />
        <line x1="16.05" y1="10.55" x2="15.3" y2="16.2" />
        <line x1="10.7" y1="16.2" x2="15.3" y2="16.2" />
      </g>
      <circle cx="13" cy="13" r="1.15" fill="currentColor" />
      <circle cx="9.95" cy="10.55" r="1" fill="currentColor" />
      <circle cx="16.05" cy="10.55" r="1" fill="currentColor" />
      <circle cx="10.7" cy="16.2" r="1" fill="currentColor" />
      <circle cx="15.3" cy="16.2" r="1" fill="currentColor" />
      {/* Magnifying glass: ring + elongated hollow handle */}
      <circle cx="13" cy="13" r="6.75" stroke="currentColor" strokeWidth="2.3" />
      <line x1="17.75" y1="17.75" x2="19.6" y2="19.6" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <rect x="18.9" y="21.7" width="3.2" height="7.6" rx="1.6" transform="rotate(-45 20.5 25.5)" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
