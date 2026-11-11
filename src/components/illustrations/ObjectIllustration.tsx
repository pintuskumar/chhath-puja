/**
 * 2D illustrations of ritual objects — used as thumbnails, as the no-WebGL fallback
 * in the object viewer, and for print. Simple Madhubani-flavoured line art.
 */
import { useId, type ReactNode } from "react";
import type { PropModel } from "@/content/types";

const M = "#681C29";
const S = "#E97824";
const G = "#F6B93B";
const C = "#FFF5DF";
const BAMBOO = "#c99a52";
const CLAY = "#a65a34";
const BRASS = "#d4a640";
const GREEN = "#6f9a3a";

function Weave({ id }: { id: string }) {
  return (
    <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill={BAMBOO} />
      <path d="M0 4 H8 M4 0 V8" stroke="#a8773a" strokeWidth="1.2" />
    </pattern>
  );
}

const Diya = ({ x = 100, y = 140, s = 1 }: { x?: number; y?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 0 Q0 26 34 0 Q20 -6 0 -6 Q-20 -6 -34 0Z" fill={CLAY} stroke={M} strokeWidth="2.5" />
    <path d="M22 -6 Q30 -30 22 -40 Q14 -30 22 -6Z" fill={G} stroke={S} strokeWidth="2" />
  </g>
);
const Banana = ({ x = 0, y = 0 }: { x?: number; y?: number }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-16, -6, 4, 14].map((dx, i) => (
      <path key={i} d={`M${dx} 0 q-6 -30 6 -46`} stroke="#8fb33a" strokeWidth="9" strokeLinecap="round" fill="none" />
    ))}
  </g>
);
const Coconut = ({ x = 100, y = 110 }: { x?: number; y?: number }) => (
  <g>
    <ellipse cx={x} cy={y} rx="26" ry="30" fill="#6b4426" stroke={M} strokeWidth="2.5" />
    <path d={`M${x - 26} ${y} Q${x} ${y + 8} ${x + 26} ${y}`} stroke="#c0182a" strokeWidth="4" fill="none" />
    {[-12, 0, 12].map((d) => (
      <path key={d} d={`M${x + d} ${y - 28} q-3 20 0 50`} stroke="#4a2d18" strokeWidth="1.5" fill="none" />
    ))}
  </g>
);
const Thekua = ({ x = 100, y = 110, r = 1 }: { x?: number; y?: number; r?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${r})`}>
    <ellipse rx="34" ry="24" fill="#b8742e" stroke={M} strokeWidth="2.5" />
    <ellipse rx="24" ry="15" fill="none" stroke="#7a4515" strokeWidth="2" />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * 5} y1={Math.sin(a) * 3} x2={Math.cos(a) * 22} y2={Math.sin(a) * 14} stroke="#7a4515" strokeWidth="1.5" />;
    })}
  </g>
);
const Soop = ({ filled = false, wid }: { filled?: boolean; wid: string }) => (
  <g>
    <path d="M30 150 L170 150 L150 70 Q100 50 50 70 Z" fill={`url(#${wid})`} stroke={M} strokeWidth="3" />
    <path d="M30 150 L170 150" stroke="#8a5c26" strokeWidth="6" />
    {filled && (
      <>
        <Coconut x={100} y={100} />
        <Banana x={66} y={140} />
        <Thekua x={138} y={128} r={0.55} />
        <Thekua x={124} y={140} r={0.55} />
        <circle cx="70" cy="96" r="12" fill="#d3d045" stroke={M} strokeWidth="2" />
        <Diya x={150} y={146} s={0.45} />
      </>
    )}
  </g>
);

export function ObjectIllustration({ model, className, title }: { model: PropModel; className?: string; title?: string }) {
  const wid = "weave" + useId().replace(/:/g, "");
  let body: ReactNode = null;
  switch (model) {
    case "soop":
      body = <Soop wid={wid} />;
      break;
    case "prasad":
      body = <Soop filled wid={wid} />;
      break;
    case "daura":
      body = (
        <g>
          <path d="M40 80 L160 80 L144 160 L56 160 Z" fill={`url(#${wid})`} stroke={M} strokeWidth="3" />
          <ellipse cx="100" cy="80" rx="60" ry="12" fill="#a8773a" stroke={M} strokeWidth="3" />
          <path d="M50 80 Q100 30 150 80" fill={G} stroke={M} strokeWidth="2.5" />
        </g>
      );
      break;
    case "thekua":
      body = (
        <g>
          <Thekua x={80} y={120} />
          <Thekua x={124} y={98} r={0.9} />
          <Thekua x={124} y={140} r={0.8} />
        </g>
      );
      break;
    case "coconut":
      body = <Coconut x={100} y={105} />;
      break;
    case "sugarcane":
      body = (
        <g>
          {[70, 100, 130].map((x, i) => (
            <g key={x}>
              <rect x={x - 6} y={60 + i * 4} width="12" height={120 - i * 4} fill="#5b2f4a" stroke={M} strokeWidth="2" />
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1={x - 6} x2={x + 6} y1={80 + k * 25} y2={80 + k * 25} stroke="#2e1726" strokeWidth="2" />
              ))}
              <path d={`M${x} ${60 + i * 4} q-30 -30 -40 -40 M${x} ${60 + i * 4} q30 -30 36 -44`} stroke={GREEN} strokeWidth="5" fill="none" />
            </g>
          ))}
        </g>
      );
      break;
    case "diya":
      body = <Diya x={100} y={130} s={1.6} />;
      break;
    case "kalash":
      body = (
        <g>
          <path d="M70 170 Q40 130 70 100 L80 90 L120 90 L130 100 Q160 130 130 170 Z" fill={BRASS} stroke={M} strokeWidth="3" />
          {[-30, -15, 0, 15, 30].map((r) => (
            <ellipse key={r} cx="100" cy="74" rx="8" ry="22" transform={`rotate(${r * 2} 100 90)`} fill={GREEN} stroke={M} strokeWidth="1.5" />
          ))}
          <Coconut x={100} y={62} />
          <path d="M60 130 H140" stroke={S} strokeWidth="4" />
        </g>
      );
      break;
    case "fruits":
      body = (
        <g>
          <Banana x={70} y={160} />
          <circle cx="128" cy="130" r="26" fill="#d3d045" stroke={M} strokeWidth="2.5" />
          <ellipse cx="110" cy="166" rx="26" ry="10" fill="#a4495a" stroke={M} strokeWidth="2" />
          {[146, 162, 178].map((x) => (
            <path key={x} d={`M${x} 168 l-7 -8 l7 -8 l7 8 Z`} fill="#2f1f1a" />
          ))}
          <path d="M150 100 q-10 -40 10 -60 M158 100 q8 -36 26 -44" stroke={GREEN} strokeWidth="5" fill="none" />
        </g>
      );
      break;
    case "banana":
      body = <Banana x={100} y={160} />;
      break;
    case "chulha":
      body = (
        <g>
          <path d="M40 170 V100 H160 V170 H130 V140 Q100 110 70 140 V170 Z" fill="#d6b58a" stroke={M} strokeWidth="3" />
          <path d="M84 170 Q90 140 100 150 Q110 132 116 170 Z" fill={S} />
          <path d="M92 170 Q100 150 108 170 Z" fill={G} />
        </g>
      );
      break;
    case "handi":
      body = (
        <g>
          <path d="M50 120 Q50 180 100 180 Q150 180 150 120 Q150 92 124 88 L76 88 Q50 92 50 120 Z" fill={CLAY} stroke={M} strokeWidth="3" />
          <ellipse cx="100" cy="86" rx="28" ry="6" fill="#7d3f22" stroke={M} strokeWidth="2" />
          <path d="M60 130 H140" stroke={C} strokeWidth="3" strokeDasharray="6 5" />
        </g>
      );
      break;
    case "lota":
      body = (
        <g>
          <path d="M60 150 Q60 100 90 96 L86 80 Q100 74 114 80 L110 96 Q140 100 140 150 Q140 180 100 180 Q60 180 60 150 Z" fill={BRASS} stroke={M} strokeWidth="3" />
          <path d="M70 140 H130" stroke="#fff3c4" strokeWidth="3" />
        </g>
      );
      break;
    case "lauki":
      body = (
        <g>
          <path d="M40 130 Q40 100 80 100 L150 92 Q176 96 172 116 Q168 136 140 138 L80 150 Q40 156 40 130 Z" fill="#9cc26a" stroke={M} strokeWidth="3" />
          <path d="M172 108 l14 -6" stroke="#6d4a2e" strokeWidth="5" />
        </g>
      );
      break;
    case "rice":
    case "dal":
      body = (
        <g>
          <path d="M40 130 Q100 190 160 130 Z" fill={BRASS} stroke={M} strokeWidth="3" />
          <path d="M48 130 Q100 80 152 130 Z" fill={model === "rice" ? "#f4efe2" : "#e8b53a"} stroke={M} strokeWidth="2" />
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse key={i} cx={64 + (i % 7) * 12} cy={118 - Math.floor(i / 7) * 10} rx="3" ry="1.6" fill={model === "rice" ? "#d9d0bb" : "#c48f1f"} />
          ))}
        </g>
      );
      break;
    case "kheer":
      body = (
        <g>
          <path d="M30 110 Q100 190 170 110 Z" fill={BRASS} stroke={M} strokeWidth="3" />
          <ellipse cx="100" cy="112" rx="68" ry="12" fill="#c99a6a" stroke={M} strokeWidth="2" />
          {[70, 90, 112, 130].map((x) => (
            <ellipse key={x} cx={x} cy={110} rx="4" ry="2" fill="#f4efe2" />
          ))}
        </g>
      );
      break;
    case "roti":
      body = (
        <g>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={100 + i * 6} cy={130 - i * 8} rx="56" ry="20" fill="#dcb07a" stroke={M} strokeWidth="2.5" />
          ))}
          {[80, 104, 126].map((x) => (
            <circle key={x} cx={x} cy={112} r="4" fill="#a8763e" />
          ))}
        </g>
      );
      break;
    case "gur":
      body = <path d="M60 150 L72 98 L120 84 L150 120 L132 162 L84 170 Z" fill="#7a3e14" stroke={M} strokeWidth="3" />;
      break;
  }
  return (
    <svg viewBox="0 0 200 200" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <Weave id={wid} />
      </defs>
      <circle cx="100" cy="100" r="92" fill={C} stroke={M} strokeWidth="2" strokeDasharray="2 6" />
      {body}
    </svg>
  );
}
