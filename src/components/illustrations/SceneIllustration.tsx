"use client";

/**
 * 2D illustrated version of every scene. Used:
 *  - as the first paint / LCP image before 3D loads,
 *  - when WebGL is unavailable or the visitor picks "2D",
 *  - on low-power devices.
 * It shares the sky model with the 3D scene and keeps working hotspots.
 */
import { useId } from "react";
import { skyAt } from "@/lib/sky";
import type { AnimationId, EnvironmentId } from "@/content/types";
import { RitualHotspot } from "../RitualHotspot";

const M = "#681C29";

type FigPose = "stand" | "namaste" | "soop" | "carry" | "sit" | "pour";
function Figure({ x, y, s = 1, color, pose, female = true }: { x: number; y: number; s?: number; color: string; pose: FigPose; female?: boolean }) {
  const sit = pose === "sit";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* garment */}
      <path d={sit ? "M-26 0 Q0 -36 26 0 Z" : female ? "M-16 0 L-9 -46 L9 -46 L16 0 Z" : "M-11 0 L-9 -46 L9 -46 L11 0 Z"} fill={color} stroke={M} strokeWidth="1.6" />
      <path d={sit ? "M-9 -14 L-8 -44 L8 -44 L9 -14 Z" : "M-9 -46 L-8 -70 L8 -70 L9 -46 Z"} fill={color} stroke={M} strokeWidth="1.6" />
      <circle cx="0" cy={sit ? -52 : -78} r="7.5" fill="#8f5d3e" stroke={M} strokeWidth="1.4" />
      {female && <path d={`M-9 ${sit ? -50 : -76} Q0 ${sit ? -66 : -92} 9 ${sit ? -50 : -76}`} fill={color} stroke={M} strokeWidth="1.4" />}
      {pose === "namaste" && <path d="M-7 -60 L0 -54 L7 -60" stroke="#8f5d3e" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {pose === "soop" && (
        <g>
          <path d="M-8 -64 L-2 -60 M8 -64 L2 -60" stroke="#8f5d3e" strokeWidth="3" strokeLinecap="round" />
          <path d="M-18 -66 L18 -66 L13 -80 Q0 -84 -13 -80 Z" fill="#c99a52" stroke={M} strokeWidth="1.4" />
          <circle cx="0" cy="-74" r="4" fill="#6b4426" />
          <circle cx="8" cy="-71" r="2.5" fill="#F6B93B" />
        </g>
      )}
      {pose === "carry" && (
        <g>
          <path d="M-8 -68 L-10 -90 M8 -68 L10 -90" stroke="#8f5d3e" strokeWidth="3" strokeLinecap="round" />
          <path d="M-18 -86 L18 -86 L14 -98 L-14 -98 Z" fill="#c99a52" stroke={M} strokeWidth="1.4" />
          <path d="M-15 -98 Q0 -110 15 -98" fill="#F6B93B" stroke={M} strokeWidth="1.2" />
        </g>
      )}
      {pose === "pour" && (
        <g>
          <path d="M6 -66 L20 -62" stroke="#8f5d3e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="23" cy="-62" r="4.5" fill="#d4a640" stroke={M} strokeWidth="1" />
          <path d="M25 -58 Q27 -40 26 -10" stroke="#eef6ff" strokeWidth="2.4" opacity=".9" />
        </g>
      )}
    </g>
  );
}

function figuresFor(env: EnvironmentId, anim: AnimationId) {
  const V = "#F6B93B";
  const V2 = "#E97824";
  const E = "#681C29";
  const W = "#f3ead6";
  if (env === "ghat") {
    const water = 520;
    switch (anim) {
      case "procession":
      case "dawn-arrive":
        return [
          <Figure key="a" x={420} y={430} color={W} female={false} pose="carry" />,
          <Figure key="b" x={480} y={430} color={V} pose="stand" />,
          <Figure key="c" x={540} y={430} color={E} pose="stand" />,
        ];
      case "ghat-arrange":
      case "blessing":
      case "paran":
      case "evening-close":
        return [
          <Figure key="a" x={560} y={470} color={V} pose={anim === "blessing" ? "stand" : "sit"} />,
          <Figure key="b" x={620} y={470} color={W} female={false} pose={anim === "blessing" ? "namaste" : "stand"} />,
          <Figure key="c" x={500} y={470} color={E} pose="namaste" />,
        ];
      default: {
        const arghya = anim === "arghya" || anim === "usha-arghya";
        return [
          <Figure key="a" x={600} y={water + 20} color={V} pose={arghya ? "soop" : "namaste"} />,
          <Figure key="b" x={450} y={water + 30} color={V2} pose={arghya ? "soop" : "namaste"} s={0.9} />,
          <Figure key="c" x={760} y={water + 26} color="#d8352a" pose="namaste" s={0.9} />,
          ...(arghya ? [<Figure key="d" x={642} y={water + 18} color={W} female={false} pose="pour" s={0.95} />] : []),
        ];
      }
    }
  }
  switch (anim) {
    case "cook":
    case "kharna-cook":
      return [<Figure key="a" x={760} y={470} color={V} pose="sit" />];
    case "meal":
    case "prasad-receive":
    case "nirjala":
    case "fast-rest":
      return [<Figure key="a" x={470} y={500} color={V} pose={anim === "fast-rest" || anim === "nirjala" ? "namaste" : "sit"} />, <Figure key="b" x={300} y={520} color={E} pose="stand" />];
    case "evening-puja":
      return [<Figure key="a" x={480} y={470} color={V} pose="namaste" />, <Figure key="b" x={400} y={500} color={E} pose="namaste" />];
    case "dawn-gather":
      return [<Figure key="a" x={540} y={520} color={W} female={false} pose="carry" />, <Figure key="b" x={460} y={520} color={V} pose="soop" />];
    case "arrange-soop":
      return [<Figure key="a" x={520} y={540} color={V} pose="sit" />, <Figure key="b" x={620} y={540} color={E} pose="sit" />];
    default:
      return [<Figure key="a" x={330} y={520} color={E} pose="stand" />, <Figure key="b" x={700} y={480} color={V} pose="stand" />];
  }
}

/** 2D hotspot coordinates in the 1000×640 illustration space. */
const POS2D: Record<EnvironmentId, Record<string, [number, number]>> = {
  courtyard: {
    chulha: [770, 400],
    handi: [800, 360],
    lauki: [690, 470],
    "chana-dal": [640, 500],
    "arwa-chawal": [590, 470],
    lota: [170, 470],
    gehun: [380, 560],
    kalash: [520, 360],
    diya: [570, 400],
    rasiyaw: [740, 360],
    roti: [820, 430],
    gur: [700, 520],
    banana: [460, 410],
    soop: [560, 560],
    daura: [660, 520],
    thekua: [600, 590],
    coconut: [520, 590],
    fruits: [470, 560],
    sugarcane: [720, 430],
  },
  ghat: {
    soop: [600, 430],
    daura: [690, 450],
    arghya: [640, 560],
    ghat: [300, 470],
    diya: [380, 500],
    sugarcane: [830, 380],
    kalash: [740, 470],
    coconut: [560, 440],
    fruits: [520, 470],
    thekua: [470, 460],
    prasad: [610, 400],
    lota: [670, 440],
    banana: [450, 480],
  },
};

export function SceneIllustration({
  environment,
  hour,
  animation,
  objects = [],
  className,
  interactive = true,
}: {
  environment: EnvironmentId;
  hour: number;
  animation: AnimationId;
  objects?: string[];
  className?: string;
  interactive?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const s = skyAt(hour);
  const sunX = 500 + s.azimuth * 300;
  const sunY = 330 - s.elevation * 7;
  const showSun = s.elevation > -5;
  const lamps = s.lampGlow > 0.15;
  return (
    <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className={className ?? "h-full w-full"} aria-hidden={!interactive}>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.top} />
          <stop offset="1" stopColor={s.horizon} />
        </linearGradient>
        <linearGradient id={`water${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.horizon} />
          <stop offset="0.5" stopColor={s.water} />
        </linearGradient>
        <radialGradient id={`glow${id}`}>
          <stop offset="0" stopColor={s.sunColor} stopOpacity="0.9" />
          <stop offset="1" stopColor={s.sunColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="640" fill={`url(#sky${id})`} />
      {showSun && (
        <g>
          <circle cx={sunX} cy={sunY} r="110" fill={`url(#glow${id})`} />
          <circle cx={sunX} cy={sunY} r="34" fill={s.sunColor} />
        </g>
      )}
      {environment === "ghat" ? (
        <g>
          <rect y="330" width="1000" height="18" fill="#2f3326" />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={i * 40 + (i % 3) * 7} cy={330} r={10 + (i % 4) * 4} fill="#2b3a26" />
          ))}
          <rect y="346" width="1000" height="200" fill={`url(#water${id})`} />
          {showSun && <rect x={sunX - 18} y="350" width="36" height="190" fill={s.sunColor} opacity="0.35" />}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} y={500 + i * 28} width="1000" height="30" fill={i % 2 ? "#b9a58b" : "#cdb99c"} stroke="#7a6a58" strokeWidth="1" />
          ))}
          <rect y="500" width="1000" height="8" fill="#E97824" opacity="0.8" />
          {[110, 890].map((x) => (
            <g key={x}>
              <rect x={x - 40} y="420" width="80" height="12" fill="#f2ead8" />
              <path d={`M${x - 34} 420 Q${x} 370 ${x + 34} 420 Z`} fill="#E97824" />
              <rect x={x - 34} y="432" width="8" height="70" fill="#f2ead8" />
              <rect x={x + 26} y="432" width="8" height="70" fill="#f2ead8" />
            </g>
          ))}
          {[800, 830, 856].map((x, i) => (
            <g key={x}>
              <rect x={x} y={360 + i * 6} width="7" height={150 - i * 6} fill="#5b2f4a" />
              <path d={`M${x + 3} ${360 + i * 6} q-24 -20 -34 -30 M${x + 3} ${360 + i * 6} q22 -22 28 -34`} stroke="#6f9a3a" strokeWidth="5" fill="none" />
            </g>
          ))}
          {Array.from({ length: 30 }, (_, i) => (
            <g key={i} transform={`translate(${20 + i * 33} ${512 + (i % 3) * 28})`}>
              <path d="M-7 0 Q0 6 7 0 Z" fill="#a65a34" />
              {lamps && <path d="M3 -1 Q6 -9 3 -13 Q0 -9 3 -1Z" fill="#F6B93B" />}
            </g>
          ))}
        </g>
      ) : (
        <g>
          <rect y="360" width="1000" height="280" fill="#b98a5e" />
          <rect y="200" width="1000" height="170" fill="#e9d6b0" stroke={M} strokeWidth="2" />
          <path d="M0 200 L1000 200 L980 160 L20 160 Z" fill="#9a4a2c" />
          {/* painted wall panels */}
          {[120, 470].map((x) => (
            <g key={x}>
              <rect x={x} y="220" width="160" height="120" fill="#f1e2c2" stroke={M} strokeWidth="4" />
              <circle cx={x + 80} cy="268" r="26" fill="#F6B93B" stroke={M} strokeWidth="2" />
              <path d={`M${x + 30} 316 q25 -18 50 0 q-25 18 -50 0 M${x + 130} 316 q-25 -18 -50 0 q25 18 50 0`} fill="#276C80" stroke={M} strokeWidth="1.5" />
            </g>
          ))}
          <rect x="330" y="250" width="70" height="120" fill="#2a1a14" />
          {/* kitchen hut */}
          <path d="M660 260 L800 180 L940 260 Z" fill="#b08a4a" stroke={M} strokeWidth="2" />
          <rect x="680" y="260" width="240" height="160" fill="#d6b58a" stroke={M} strokeWidth="2" />
          <path d="M730 420 V380 H810 V420 H795 V400 Q770 385 745 400 V420Z" fill="#c98a5b" stroke={M} strokeWidth="2" />
          <path d="M755 420 Q762 398 770 405 Q778 395 785 420 Z" fill="#E97824" />
          {/* tulsi */}
          <rect x="230" y="420" width="50" height="50" fill="#d6b58a" stroke={M} strokeWidth="2" />
          <circle cx="255" cy="405" r="18" fill="#3f7d32" />
          {/* shrine */}
          <rect x="460" y="380" width="120" height="20" fill="#d6b58a" stroke={M} strokeWidth="2" />
          <path d="M505 380 Q500 350 520 345 Q540 350 535 380 Z" fill="#d4a640" stroke={M} strokeWidth="1.5" />
          {lamps &&
            [480, 560].map((x) => (
              <g key={x}>
                <circle cx={x} cy="372" r="16" fill="#F6B93B" opacity="0.35" />
                <path d={`M${x} 376 Q${x + 4} 366 ${x} 360 Q${x - 4} 366 ${x} 376Z`} fill="#F6B93B" />
              </g>
            ))}
          {/* water corner */}
          <ellipse cx="150" cy="470" rx="34" ry="40" fill="#a65a34" stroke={M} strokeWidth="2" />
          <ellipse cx="200" cy="485" rx="18" ry="20" fill="#d4a640" stroke={M} strokeWidth="2" />
        </g>
      )}
      {figuresFor(environment, animation)}
      {interactive &&
        objects
          .filter((o) => POS2D[environment][o])
          .map((o) => {
            const [x, y] = POS2D[environment][o];
            return (
              <foreignObject key={o} x={x - 26} y={y - 26} width="52" height="52" className="overflow-visible">
                <div className="flex h-full w-full items-center justify-center">
                  <RitualHotspot objectId={o} compact />
                </div>
              </foreignObject>
            );
          })}
    </svg>
  );
}
