/**
 * Madhubani-inspired decorative motifs (double outlines, hatching, fish, sun, lotus).
 * Original drawings in the site palette — inspired by the Mithila tradition, not copied
 * from any specific artwork. Purely decorative: aria-hidden.
 */
import type { SVGProps } from "react";

const M = "#681C29";
const S = "#E97824";
const G = "#F6B93B";
const B = "#276C80";

export function SunMotif({ className, ...p }: SVGProps<SVGSVGElement>) {
  const rays = Array.from({ length: 16 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false" {...p}>
      {rays.map((i) => {
        const a = (i / 16) * Math.PI * 2;
        const a2 = a + Math.PI / 16;
        const x1 = 100 + Math.cos(a) * 58;
        const y1 = 100 + Math.sin(a) * 58;
        const x2 = 100 + Math.cos(a + Math.PI / 32) * 92;
        const y2 = 100 + Math.sin(a + Math.PI / 32) * 92;
        const x3 = 100 + Math.cos(a2) * 58;
        const y3 = 100 + Math.sin(a2) * 58;
        return <path key={i} d={`M${x1},${y1} L${x2},${y2} L${x3},${y3} Z`} fill={i % 2 ? S : G} stroke={M} strokeWidth="2" />;
      })}
      <circle cx="100" cy="100" r="54" fill={G} stroke={M} strokeWidth="3" />
      <circle cx="100" cy="100" r="46" fill="none" stroke={M} strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="100" cy="100" r="36" fill="none" stroke={M} strokeWidth="1.5" />
      {/* stylised face, typical of Mithila sun paintings */}
      <path d="M80 92 q8 -7 16 0 M104 92 q8 -7 16 0" stroke={M} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="96" r="3" fill={M} />
      <circle cx="112" cy="96" r="3" fill={M} />
      <path d="M100 98 v12 q-4 3 0 4" stroke={M} strokeWidth="2.5" fill="none" />
      <path d="M88 118 q12 9 24 0" stroke={M} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function FishPair({ className, ...p }: SVGProps<SVGSVGElement>) {
  const fish = (flip: boolean) => (
    <g transform={flip ? "translate(240,0) scale(-1,1)" : undefined}>
      <path d="M20 60 Q60 20 110 60 Q60 100 20 60 Z" fill={B} stroke={M} strokeWidth="3" />
      <path d="M108 60 L132 40 L132 80 Z" fill={S} stroke={M} strokeWidth="3" />
      {[40, 52, 64, 76, 88].map((x) => (
        <path key={x} d={`M${x} 44 L${x + 7} 60 L${x} 76`} stroke={G} strokeWidth="2.5" fill="none" />
      ))}
      <circle cx="34" cy="56" r="5" fill="#FFF5DF" stroke={M} strokeWidth="2" />
    </g>
  );
  return (
    <svg viewBox="0 0 240 120" className={className} aria-hidden="true" focusable="false" {...p}>
      {fish(false)}
      {fish(true)}
    </svg>
  );
}

export function Lotus({ className, ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true" focusable="false" {...p}>
      {[-40, -20, 0, 20, 40].map((r, i) => (
        <ellipse key={i} cx="60" cy="44" rx="11" ry="30" transform={`rotate(${r} 60 70)`} fill={i % 2 ? G : S} stroke={M} strokeWidth="2" />
      ))}
      <path d="M20 72 H100" stroke={M} strokeWidth="3" />
    </svg>
  );
}

/** Repeating border band (triangles + double rule) used as section dividers. */
export function BorderBand({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 240 24" preserveAspectRatio="none" className="h-6 w-full">
        <defs>
          <pattern id="mb-tri" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 22 L12 4 L24 22 Z" fill={S} stroke={M} strokeWidth="1.5" />
            <circle cx="12" cy="16" r="2" fill={G} />
          </pattern>
        </defs>
        <rect width="240" height="24" fill="url(#mb-tri)" />
        <line x1="0" y1="23" x2="240" y2="23" stroke={M} strokeWidth="2" />
      </svg>
    </div>
  );
}
