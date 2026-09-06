import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the constellation magnifier.
 * 
 * This component is a 1:1 copy of the master SVG (public/brand/icon.svg).
 * It uses `currentColor` for the accent color, which is set to `var(--primary)`
 * via the `text-primary` class. This ensures the logo perfectly matches the
 * active theme (Light, Dark, Hacker) and accent color (Green, Blue, Red, etc.).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn('text-primary', className)}
    >
      {/* Background Tile */}
      <rect width="100" height="100" rx="24" fill="#070b1a" />
      
      {/* Orbit Rings */}
      <circle cx="42" cy="40" r="24" stroke="currentColor" strokeWidth="3" />
      <circle cx="42" cy="40" r="19" stroke="#1d4e9e" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="80 30" />

      {/* The Constellation Mesh */}
      <g stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.8">
        <line x1="42" y1="40" x2="30" y2="32" />
        <line x1="42" y1="40" x2="55" y2="28" />
        <line x1="42" y1="40" x2="60" y2="45" />
        <line x1="42" y1="40" x2="32" y2="55" />
        <line x1="30" y1="32" x2="55" y2="28" />
        <line x1="55" y1="28" x2="60" y2="45" />
        <line x1="60" y1="45" x2="50" y2="58" />
        <line x1="32" y1="55" x2="50" y2="58" />
        <line x1="30" y1="32" x2="32" y2="55" />
      </g>

      {/* Emerald Nodes */}
      <circle cx="42" cy="40" r="3.5" fill="currentColor" />
      <circle cx="30" cy="32" r="4.2" fill="currentColor" />
      <circle cx="55" cy="28" r="4.5" fill="currentColor" />
      <circle cx="60" cy="45" r="5.2" fill="currentColor" />
      <circle cx="32" cy="55" r="4.8" fill="currentColor" />
      <circle cx="50" cy="58" r="5.5" fill="currentColor" />
      
      {/* Navy Nodes */}
      <circle cx="42" cy="25" r="2.2" fill="#1d4e9e" />
      <circle cx="68" cy="35" r="1.8" fill="#1d4e9e" />
      <circle cx="35" cy="45" r="2.5" fill="#1d4e9e" />

      {/* Handle Stub */}
      <rect x="58" y="58" width="6" height="4" transform="rotate(45 61 60)" fill="currentColor" />

      {/* Handle (Hollow Tube) */}
      <g transform="rotate(45 42 40)">
         <line x1="42" y1="64" x2="42" y2="82" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
         <line x1="50" y1="64" x2="50" y2="82" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
         <path d="M42 64 Q46 60 50 64" stroke="currentColor" strokeWidth="3" fill="none" />
      </g>
      
      {/* Large Tip Node */}
      <circle cx="78" cy="78" r="6" fill="currentColor" />

      {/* Sparkles */}
      <path d="M85 15 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 z" fill="#3f7bdc" />
      <path d="M15 75 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1 z" fill="currentColor" />
    </svg>
  );
}
