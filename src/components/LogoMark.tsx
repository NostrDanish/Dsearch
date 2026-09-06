import { cn } from '@/lib/utils';

/**
 * Dsearch logo mark — a magnifying glass with a node network inside its lens.
 *
 * Geometry is identical to the static master (public/brand/icon.svg). The
 * teal parts render in `currentColor` (= --primary via the `text-primary`
 * class), so the mark follows the theme and the accent picker; the navy ring
 * and micro-dots stay the brand constant that gives the lens its depth.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="none"
      aria-hidden="true"
      className={cn('text-primary', className)}
    >
      {/* Sparkles + dust */}
      <path d="M205 135 Q212 173 243 180 Q212 187 205 225 Q198 187 167 180 Q198 173 205 135 Z" fill="#1d4e9e" />
      <path d="M732 160 Q737 189 762 195 Q737 201 732 230 Q727 201 702 195 Q727 189 732 160 Z" fill="currentColor" />
      <path d="M330 670 Q335 699 360 705 Q335 711 330 740 Q325 711 300 705 Q325 699 330 670 Z" fill="currentColor" />
      <circle cx="160" cy="285" r="11" fill="currentColor" />
      <circle cx="742" cy="540" r="11" fill="currentColor" />
      <circle cx="548" cy="728" r="11" fill="currentColor" />

      {/* Handle: neck + hollow capsule + solid tip cap */}
      <g transform="rotate(45 460 400)">
        <line x1="722" y1="368" x2="776" y2="368" stroke="currentColor" strokeWidth="19" strokeLinecap="round" />
        <line x1="722" y1="432" x2="776" y2="432" stroke="currentColor" strokeWidth="19" strokeLinecap="round" />
        <rect x="776" y="366" width="232" height="68" rx="34" stroke="currentColor" strokeWidth="19" />
        <circle cx="974" cy="400" r="34" fill="currentColor" />
      </g>

      {/* Lens: outer accent ring + inner navy ring */}
      <circle cx="460" cy="400" r="262" stroke="currentColor" strokeWidth="21" />
      <circle cx="460" cy="400" r="203" stroke="#1d4e9e" strokeWidth="30" />

      {/* Node mesh edges */}
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="round">
        <line x1="450" y1="268" x2="352" y2="322" />
        <line x1="450" y1="268" x2="562" y2="298" />
        <line x1="450" y1="268" x2="488" y2="355" />
        <line x1="352" y1="322" x2="318" y2="410" />
        <line x1="352" y1="322" x2="412" y2="402" />
        <line x1="562" y1="298" x2="488" y2="355" />
        <line x1="562" y1="298" x2="592" y2="428" />
        <line x1="488" y1="355" x2="412" y2="402" />
        <line x1="488" y1="355" x2="488" y2="455" />
        <line x1="318" y1="410" x2="412" y2="402" />
        <line x1="318" y1="410" x2="352" y2="490" />
        <line x1="412" y1="402" x2="352" y2="490" />
        <line x1="592" y1="428" x2="488" y2="455" />
        <line x1="592" y1="428" x2="542" y2="522" />
        <line x1="488" y1="455" x2="432" y2="528" />
        <line x1="488" y1="455" x2="542" y2="522" />
        <line x1="352" y1="490" x2="432" y2="528" />
        <line x1="432" y1="528" x2="542" y2="522" />
      </g>

      {/* Mesh nodes (varying sizes) */}
      <circle cx="450" cy="268" r="26" fill="currentColor" />
      <circle cx="352" cy="322" r="33" fill="currentColor" />
      <circle cx="562" cy="298" r="29" fill="currentColor" />
      <circle cx="488" cy="355" r="23" fill="currentColor" />
      <circle cx="318" cy="410" r="23" fill="currentColor" />
      <circle cx="412" cy="402" r="26" fill="currentColor" />
      <circle cx="592" cy="428" r="31" fill="currentColor" />
      <circle cx="488" cy="455" r="28" fill="currentColor" />
      <circle cx="352" cy="490" r="26" fill="currentColor" />
      <circle cx="432" cy="528" r="28" fill="currentColor" />
      <circle cx="542" cy="522" r="19" fill="currentColor" />

      {/* Navy micro-dots inside the mesh */}
      <circle cx="422" cy="325" r="9" fill="#1d4e9e" />
      <circle cx="367" cy="408" r="8" fill="#1d4e9e" />
      <circle cx="527" cy="418" r="9" fill="#1d4e9e" />
      <circle cx="417" cy="468" r="9" fill="#1d4e9e" />

      {/* Accent micro-dots */}
      <circle cx="507" cy="256" r="8" fill="currentColor" />
      <circle cx="602" cy="358" r="8" fill="currentColor" />
      <circle cx="487" cy="560" r="8" fill="currentColor" />
    </svg>
  );
}
