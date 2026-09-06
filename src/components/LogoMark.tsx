import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — the constellation magnifier, inline SVG.
 * 
 * perfectly follows the design from the reference images:
 * - Emerald (#10d48e) and Navy (#0b3d91) theme.
 * - Hollow tube handle with large tip node.
 * - Organic mesh with varying node sizes.
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
      
      {/* Mesh Edges */}
      <g stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.8">
        <line x1="42" y1="40" x2="30" y2="32" />
        <line x1="42" y1="40" x2="55" y2="28" />
        <line x1="42" y1="40" x2="60" y2="45" />
        <line x1="42" y1="40" x2="32" y2="55" />
        <line x1="30" y1="32" x2="55" y2="28" />
        <line x1="55" y1="28" x2="60" y2="45" />
        <line x1="60" y1="45" x2="50" y2="58" />
        <line x1="32" y1="55" x2="50" y2="58" />
      </g>

      {/* Emerald Nodes */}
      <circle cx="42" cy="40" r="3.5" fill="currentColor" />
      <circle cx="30" cy="32" r="4.2" fill="currentColor" />
      <circle cx="55" cy="28" r="4.5" fill="currentColor" />
      <circle cx="60" cy="45" r="5.2" fill="currentColor" />
      <circle cx="32" cy="55" r="4.8" fill="currentColor" />
      <circle cx="50" cy="58" r="5.5" fill="currentColor" />
      
      {/* Navy Nodes (Semi-transparent in accent mode) */}
      <circle cx="42" cy="25" r="2.2" fill="#0b3d91" />
      <circle cx="68" cy="35" r="1.8" fill="#0b3d91" />
      <circle cx="35" cy="45" r="2.5" fill="#0b3d91" />

      {/* Magnifying Glass Ring */}
      <circle cx="42" cy="40" r="24" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="42" cy="40" r="20" stroke="#3f7bdc" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="80 30" />
      
      {/* Handle Stub */}
      <rect x="58" y="58" width="6" height="4" transform="rotate(45 61 60)" fill="currentColor" />

      {/* Hollow Tube Handle */}
      <g transform="rotate(45 42 40)">
         <line x1="42" y1="64" x2="42" y2="78" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
         <line x1="48" y1="64" x2="48" y2="78" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
         <path d="M42 64 Q45 61 48 64" stroke="currentColor" strokeWidth="2.2" fill="none" />
      </g>
      
      {/* Tip Node */}
      <circle cx="78" cy="78" r="4.5" fill="currentColor" />

      {/* Sparkles */}
      <path d="M85 15 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 z" fill="#3f7bdc" />
    </svg>
  );
}
