/**
 * Time-of-day model shared by the 3D environments and the 2D SVG fallbacks,
 * so both renderers show the same sky for the same ritual moment.
 *
 * Approximate November values for Patna (≈ sunrise 06:00, sunset 17:00).
 */
export const SUNRISE = 6.0;
export const SUNSET = 17.0;

export interface SkyState {
  /** Sun elevation in degrees (negative = below horizon). */
  elevation: number;
  /** -1 (east / morning side) .. 1 (west / evening side). */
  azimuth: number;
  top: string;
  horizon: string;
  water: string;
  fog: string;
  fogDensity: number;
  sunColor: string;
  sunIntensity: number;
  ambient: number;
  /** 0..1 how much diya / fire light dominates. */
  lampGlow: number;
}

type RGB = [number, number, number];

function hex(c: string): RGB {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex([r, g, b]: RGB) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}
function mix(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** Key frames by sun elevation (deg). Colours derived from the design tokens. */
const KEYS: { el: number; top: string; horizon: string; water: string; fog: string; sun: string }[] = [
  { el: -18, top: "#060b19", horizon: "#101D38", water: "#0b1730", fog: "#101D38", sun: "#ffb067" },
  { el: -8, top: "#101D38", horizon: "#3a2a4a", water: "#16294a", fog: "#2c2a48", sun: "#ff9a4d" },
  { el: -2, top: "#22305a", horizon: "#c4573a", water: "#3b3a58", fog: "#7a4a4a", sun: "#E97824" },
  { el: 3, top: "#3b5f8a", horizon: "#F6B93B", water: "#276C80", fog: "#e2a26a", sun: "#F6B93B" },
  { el: 12, top: "#5d93bb", horizon: "#ffd9a0", water: "#2f7d8f", fog: "#f2d2a6", sun: "#ffe4b0" },
  { el: 35, top: "#79b2d4", horizon: "#FFF5DF", water: "#3a8a98", fog: "#efe4cc", sun: "#fff6e6" },
];

export function skyAt(hour: number): SkyState {
  const dayLen = SUNSET - SUNRISE;
  const p = (hour - SUNRISE) / dayLen; // 0 sunrise, 1 sunset
  // Elevation: a sine arc over the day, continued below the horizon at night.
  const elevation = Math.sin(Math.PI * p) * 42 * (p >= 0 && p <= 1 ? 1 : 0.6) - (p < 0 || p > 1 ? 4 : 0);
  const azimuth = Math.max(-1, Math.min(1, p * 2 - 1));

  let i = 0;
  while (i < KEYS.length - 2 && elevation > KEYS[i + 1].el) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = clamp01((elevation - a.el) / (b.el - a.el));

  const dusk = 1 - smooth(-6, 6, elevation);
  return {
    elevation,
    azimuth,
    top: mix(a.top, b.top, t),
    horizon: mix(a.horizon, b.horizon, t),
    water: mix(a.water, b.water, t),
    fog: mix(a.fog, b.fog, t),
    // Mist is densest just before dawn over the river (a familiar Usha Arghya sight in November).
    fogDensity: hour < 9 ? 0.03 + 0.03 * (1 - smooth(-4, 10, elevation)) : 0.012 + 0.01 * dusk,
    sunColor: mix(a.sun, b.sun, t),
    sunIntensity: 0.15 + 2.2 * smooth(-3, 20, elevation),
    ambient: 0.18 + 0.55 * smooth(-10, 25, elevation),
    lampGlow: dusk,
  };
}
