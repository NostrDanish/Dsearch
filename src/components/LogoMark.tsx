import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the constellation magnifier.
 * 
 * This component is a 1:1 copy of the master SVG (public/brand/icon.svg).
 * It uses `currentColor` for the emerald parts and `var(--secondary)` for the
 * navy parts, ensuring the logo perfectly matches the active theme and accent.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="none"
      aria-hidden="true"
      className={cn('text-primary', className)}
    >
      <g transform="translate(512, 512)">
        {/* Lens Rings */}
        <circle r="400" stroke="currentColor" strokeWidth="40" strokeOpacity="0.8"/>
        <circle r="330" stroke="var(--secondary)" strokeWidth="30"/>

        {/* Constellation Mesh */}
        <g stroke="currentColor" strokeWidth="12" strokeOpacity="0.7">
          <path d="M -100 -150 L -200 -80 L -150 50 L 0 100 L 150 50 L 200 -80 L 100 -150 L -100 -150" />
          <path d="M -100 -150 L 0 -250 L 100 -150" />
          <path d="M -200 -80 L -250 50 L -150 50" />
          <path d="M 200 -80 L 250 50 L 150 50" />
          <path d="M 0 100 L 0 200" />
          <path d="M -100 -150 L 0 0 L 100 -150" />
          <path d="M -200 -80 L 0 0 L 200 -80" />
          <path d="M -150 50 L 0 0 L 150 50" />
        </g>

        {/* Nodes */}
        <circle cx="-100" cy="-150" r="30" fill="currentColor"/>
        <circle cx="100" cy="-150" r="30" fill="currentColor"/>
        <circle cx="-200" cy="-80" r="35" fill="currentColor"/>
        <circle cx="200" cy="-80" r="35" fill="currentColor"/>
        <circle cx="-150" cy="50" r="25" fill="currentColor"/>
        <circle cx="150" cy="50" r="25" fill="currentColor"/>
        <circle cx="0" cy="100" r="40" fill="currentColor"/>
        <circle cx="0" cy="-250" r="20" fill="currentColor"/>
        <circle cx="-250" cy="50" r="20" fill="currentColor"/>
        <circle cx="250" cy="50" r="20" fill="currentColor"/>
        <circle cx="0" cy="200" r="20" fill="currentColor"/>

        <circle cx="0" cy="0" r="20" fill="var(--secondary)"/>
        <circle cx="-50" cy="-50" r="15" fill="var(--secondary)"/>
        <circle cx="50" cy="-50" r="15" fill="var(--secondary)"/>

        {/* Sparkles */}
        <path d="M -300 -300 l20 50 50 20 -50 20 -20 50 -20 -50 -50 -20 50 -20 z" fill="currentColor"/>
        <path d="M 300 -350 l15 40 40 15 -40 15 -15 40 -15 -40 -40 -15 40 -15 z" fill="var(--secondary)"/>
        <path d="M -350 150 l10 25 25 10 -25 10 -10 25 -10 -25 -25 -10 25 -10 z" fill="var(--secondary)"/>
        <circle cx="320" cy="280" r="12" fill="currentColor"/>
        <circle cx="-320" cy="-80" r="10" fill="currentColor"/>

        {/* Magnifying Glass Handle */}
        <g transform="rotate(45 300 300)">
          <rect x="380" y="-20" width="80" height="40" fill="currentColor"/>
          <path d="M 460 -20 L 600 -20 L 600 20 L 460 20 Z" stroke="currentColor" strokeWidth="30" fill="none"/>
          <path d="M 460 -20 Q 445 0 460 20" stroke="currentColor" strokeWidth="30" fill="none"/>
          <path d="M 600 -20 Q 615 0 600 20" stroke="currentColor" strokeWidth="30" fill="none"/>
          <circle cx="660" cy="0" r="60" fill="currentColor"/>
        </g>
      </g>
    </svg>
  );
}
