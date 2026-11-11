/**
 * Choreography: a pure function from (animation, progress) → actor states.
 * Keeping this free of React/Three makes ritual staging easy to review for
 * cultural accuracy: every gesture used is listed in POSES below, and only
 * simple, widely documented postures are used (standing, sitting, folded hands,
 * holding the soop towards the sun, pouring from a lota, carrying the daura,
 * bowing / touching feet). No ceremonial movements are invented.
 */
import type { AnimationId } from "@/content/types";

export type LookId = "vrati" | "vrati2" | "vrati3" | "elder" | "man" | "youngman" | "child" | "woman";
export type PoseId =
  | "idle"
  | "namaste"
  | "walk"
  | "sweep"
  | "crouch"
  | "stir"
  | "eat"
  | "sit"
  | "sit-namaste"
  | "arrange"
  | "carry-head"
  | "hold-soop"
  | "raise-soop"
  | "pour"
  | "fill"
  | "shoo"
  | "bow"
  | "offer"
  | "give";
export type HoldId = "none" | "soop" | "soop-filled" | "lota" | "daura" | "broom" | "ladle" | "cane" | "thekua" | "diya" | "wood";

export interface ActorState {
  look: LookId;
  pos: [number, number, number];
  rotY: number;
  pose: PoseId;
  hold: HoldId;
  /** Pouring stream visible (arghya). */
  stream?: boolean;
  visible?: boolean;
}

export type Actors = Record<string, ActorState>;

const PI = Math.PI;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/* ── Ghat geometry shared with GhatEnvironment ── */
export const GHAT = {
  stepDepth: 0.7,
  stepRise: 0.22,
  steps: 8,
  plateauZ: 5.6,
  plateauY: -0.12 + 7 * 0.22 + 0.22,
  waterStandY: -0.72,
};
export function stepTop(i: number) {
  return -0.12 + i * GHAT.stepRise;
}
/** Ground height on the ghat for a z coordinate (river at z<0). */
export function ghatGround(z: number) {
  if (z >= GHAT.plateauZ) return GHAT.plateauY;
  if (z < -0.4) return GHAT.waterStandY;
  if (z < 0) return lerp(GHAT.waterStandY, stepTop(0), (z + 0.4) / 0.4);
  return stepTop(Math.min(GHAT.steps - 1, Math.floor(z / GHAT.stepDepth)));
}
function walkPath(points: [number, number][], t: number): { x: number; z: number; rot: number } {
  // points are [x,z]; linear interpolation by equal segments
  const n = points.length - 1;
  const f = clamp01(t) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  const [x0, z0] = points[i];
  const [x1, z1] = points[i + 1];
  return { x: lerp(x0, x1, k), z: lerp(z0, z1, k), rot: Math.atan2(x1 - x0, z1 - z0) };
}
function onGhat(x: number, z: number): [number, number, number] {
  return [x, ghatGround(z), z];
}

/* ── Courtyard landmarks shared with CourtyardEnvironment ── */
export const YARD = {
  chulha: [3.2, 0, -3.3] as [number, number, number],
  water: [-4.1, 0, 1.3] as [number, number, number],
  shrine: [0.4, 0, -4.7] as [number, number, number],
  tulsi: [-1.8, 0, -2.4] as [number, number, number],
  wheat: [-1.2, 0, 2.5] as [number, number, number],
  soopMat: [1.3, 0, 1.4] as [number, number, number],
  door: [-2.6, 0, -5.4] as [number, number, number],
};

export function choreograph(anim: AnimationId, p: number, t: number): Actors {
  const osc = (f: number) => Math.sin(t * f);
  switch (anim) {
    /* ───── Courtyard ───── */
    case "clean": {
      const sweepX = lerp(-3.2, 1.2, (Math.sin(p * PI * 1.5 - PI / 2) + 1) / 2);
      const carry = walkPath([
        [-3.5, -1.2],
        [0.5, -2.2],
        [2.4, -2.4],
      ], seg(p, 0.1, 0.7));
      return {
        elder: { look: "elder", pos: [sweepX, 0, 0.6 + osc(0.7) * 0.2], rotY: PI / 2, pose: "sweep", hold: "broom" },
        vrati: { look: "vrati", pos: [YARD.chulha[0] - 0.75, 0, YARD.chulha[2] + 0.5], rotY: PI / 2 + 0.3, pose: "crouch", hold: "none" },
        man: { look: "man", pos: [carry.x, 0, carry.z], rotY: p < 0.7 ? carry.rot : PI, pose: p < 0.7 ? "walk" : "idle", hold: "lota" },
        child: { look: "child", pos: [-0.8, 0, 2.6], rotY: -0.4, pose: "idle", hold: "none" },
      };
    }
    case "bath": {
      const back = walkPath([
        [YARD.water[0] + 0.7, YARD.water[2]],
        [-2, -0.5],
        [1.2, -2.4],
      ], seg(p, 0.55, 1));
      return {
        vrati:
          p < 0.55
            ? { look: "vrati", pos: [YARD.water[0] + 0.7, 0, YARD.water[2]], rotY: -PI / 2, pose: "fill", hold: "lota" }
            : { look: "vrati", pos: [back.x, 0, back.z], rotY: back.rot, pose: "walk", hold: "lota" },
        elder: { look: "elder", pos: [2.2, 0, 1.4], rotY: -0.6, pose: "idle", hold: "none" },
        man: { look: "man", pos: [3.8, 0, 0.6], rotY: -1.2, pose: "idle", hold: "none" },
      };
    }
    case "cook":
      return {
        vrati: { look: "vrati", pos: [YARD.chulha[0], 0, YARD.chulha[2] + 0.95], rotY: PI, pose: "stir", hold: "ladle" },
        elder: { look: "elder", pos: [YARD.chulha[0] - 1.2, 0, YARD.chulha[2] + 1.4], rotY: PI * 0.75, pose: "arrange", hold: "none" },
      };
    case "meal":
      return {
        vrati: { look: "vrati", pos: [0.6, 0, -1.1], rotY: 0.2, pose: "eat", hold: "none" },
        man: { look: "man", pos: [2.0, 0, -0.6], rotY: -0.5, pose: p > 0.45 ? "eat" : "sit", hold: "none" },
        child: { look: "child", pos: [-0.7, 0, -0.5], rotY: 0.6, pose: p > 0.45 ? "eat" : "sit", hold: "none" },
        elder: { look: "elder", pos: [1.3, 0, 0.6], rotY: PI, pose: p > 0.45 ? "eat" : "sit", hold: "none" },
      };
    case "prepare-next": {
      const wood = walkPath([
        [4.5, 2.5],
        [3.6, -0.5],
        [3.9, -2.2],
      ], seg(p, 0, 0.8));
      return {
        child: { look: "child", pos: [YARD.wheat[0] + 1.2, 0, YARD.wheat[2] + 0.3], rotY: -PI / 2, pose: "shoo", hold: "none" },
        vrati: { look: "vrati", pos: [YARD.wheat[0] - 1.1, 0, YARD.wheat[2] - 0.2], rotY: PI / 2, pose: "sit", hold: "none" },
        man: { look: "man", pos: [wood.x, 0, wood.z], rotY: p < 0.8 ? wood.rot : PI, pose: p < 0.8 ? "walk" : "idle", hold: "wood" },
      };
    }
    case "fast-rest":
      return {
        vrati: { look: "vrati", pos: [YARD.tulsi[0] + 0.9, 0, YARD.tulsi[2] + 0.4], rotY: -PI / 2 - 0.4, pose: "sit-namaste", hold: "none" },
        elder: { look: "elder", pos: [lerp(-0.5, 2.5, (osc(0.25) + 1) / 2), 0, 1.0], rotY: osc(0.25) > 0 ? PI / 2 : -PI / 2, pose: "walk", hold: "none" },
        man: { look: "man", pos: [3.7, 0, -1.6], rotY: -PI / 2, pose: "arrange", hold: "none" },
      };
    case "kharna-cook":
      return {
        vrati: { look: "vrati", pos: [YARD.chulha[0], 0, YARD.chulha[2] + 0.95], rotY: PI, pose: "stir", hold: "ladle" },
        elder: { look: "elder", pos: [0.4, 0, -0.8], rotY: 0.8, pose: "idle", hold: "none" },
      };
    case "evening-puja":
      return {
        vrati: {
          look: "vrati",
          pos: [YARD.shrine[0], 0, YARD.shrine[2] + 1.0],
          rotY: PI,
          pose: p < 0.45 ? "offer" : "sit-namaste",
          hold: p < 0.45 ? "diya" : "none",
        },
        elder: { look: "elder", pos: [YARD.shrine[0] - 1.1, 0, YARD.shrine[2] + 2.2], rotY: PI - 0.3, pose: "namaste", hold: "none" },
        man: { look: "man", pos: [YARD.shrine[0] + 1.2, 0, YARD.shrine[2] + 2.4], rotY: PI + 0.3, pose: "namaste", hold: "none" },
        child: { look: "child", pos: [YARD.shrine[0] + 0.2, 0, YARD.shrine[2] + 2.6], rotY: PI, pose: "namaste", hold: "none" },
      };
    case "prasad-receive": {
      const come = ease(seg(p, 0.55, 0.85));
      return {
        vrati: { look: "vrati", pos: [YARD.shrine[0], 0, YARD.shrine[2] + 1.0], rotY: p < 0.55 ? PI : 0, pose: p < 0.55 ? "eat" : "give", hold: p < 0.55 ? "none" : "thekua" },
        man: { look: "man", pos: lerp3([-2.6, 0, 1.6], [YARD.shrine[0] - 0.2, 0, YARD.shrine[2] + 1.9], come), rotY: PI * 0.85, pose: come > 0 && come < 1 ? "walk" : come >= 1 ? "bow" : "idle", hold: "none" },
        child: { look: "child", pos: lerp3([-3.1, 0, 2.1], [YARD.shrine[0] + 0.5, 0, YARD.shrine[2] + 1.8], come), rotY: PI * 0.9, pose: come > 0 && come < 1 ? "walk" : "namaste", hold: "none" },
        elder: { look: "elder", pos: [-2.0, 0, 2.4], rotY: PI * 0.8, pose: "namaste", hold: "none" },
      };
    }
    case "nirjala":
      return {
        vrati: { look: "vrati", pos: [YARD.tulsi[0] + 0.9, 0, YARD.tulsi[2] + 0.4], rotY: -PI / 2 - 0.4, pose: "sit-namaste", hold: "none" },
        elder: { look: "elder", pos: [0.2, 0, -0.2], rotY: -2.4, pose: "sit", hold: "none" },
      };
    case "arrange-soop":
      return {
        vrati: { look: "vrati", pos: [YARD.soopMat[0], 0, YARD.soopMat[2] - 0.85], rotY: 0, pose: "arrange", hold: "none" },
        elder: { look: "elder", pos: [YARD.soopMat[0] + 1.0, 0, YARD.soopMat[2] + 0.2], rotY: -PI / 2, pose: "arrange", hold: "none" },
        woman: { look: "woman", pos: [YARD.chulha[0], 0, YARD.chulha[2] + 0.95], rotY: PI, pose: "stir", hold: "ladle" },
        child: { look: "child", pos: [YARD.soopMat[0] - 1.1, 0, YARD.soopMat[2] + 0.4], rotY: PI / 2, pose: "idle", hold: "none" },
      };
    case "dawn-gather": {
      const lifted = p > 0.5;
      return {
        man: { look: "man", pos: [YARD.soopMat[0] + 0.1, 0, YARD.soopMat[2] + 0.9], rotY: PI, pose: lifted ? "carry-head" : "crouch", hold: lifted ? "daura" : "none" },
        vrati: { look: "vrati", pos: [YARD.soopMat[0] - 0.9, 0, YARD.soopMat[2] + 0.3], rotY: PI / 2, pose: "hold-soop", hold: "soop-filled" },
        elder: { look: "elder", pos: [YARD.soopMat[0] + 1.2, 0, YARD.soopMat[2] - 0.2], rotY: -PI / 2, pose: "offer", hold: "diya" },
        child: { look: "child", pos: [YARD.soopMat[0] - 0.2, 0, YARD.soopMat[2] + 2.0], rotY: PI, pose: "idle", hold: "none" },
      };
    }

    /* ───── Ghat ───── */
    case "procession":
    case "dawn-arrive": {
      const prog = anim === "procession" ? p : seg(p, 0, 0.6);
      const lane = (offset: number) => {
        const w = walkPath([
          [-13 + offset, 6.6],
          [-2 + offset, 6.6],
          [0.4 + offset * 0.3, 5.9],
        ], clamp01(prog - offset * 0.02));
        return w;
      };
      const a = lane(0);
      const b = lane(-1.3);
      const c = lane(-2.4);
      const d = lane(-3.4);
      const walking = prog < 0.98;
      const actors: Actors = {
        man: { look: "man", pos: onGhat(a.x, a.z), rotY: walking ? a.rot : 0, pose: "carry-head", hold: "daura" },
        vrati: { look: "vrati", pos: onGhat(b.x, b.z), rotY: walking ? b.rot : 0, pose: walking ? "walk" : "namaste", hold: "none" },
        youngman: { look: "youngman", pos: onGhat(c.x, c.z), rotY: walking ? c.rot : 0, pose: walking ? "walk" : "idle", hold: "cane" },
        elder: { look: "elder", pos: onGhat(d.x, d.z), rotY: walking ? d.rot : 0, pose: walking ? "walk" : "idle", hold: anim === "dawn-arrive" ? "diya" : "none" },
      };
      if (anim === "dawn-arrive") {
        // vrati then walks down the steps into the water to wait for sunrise
        const down = ease(seg(p, 0.6, 1));
        if (down > 0) {
          const z = lerp(5.6, -2.6, down);
          actors.vrati = { look: "vrati", pos: [lerp(-1, 0, down), ghatGround(z), z], rotY: PI, pose: down < 1 ? "walk" : "namaste", hold: "none" };
        }
      } else {
        actors.child = { look: "child", pos: onGhat(lane(-4.3).x, lane(-4.3).z), rotY: walking ? lane(-4.3).rot : 0, pose: walking ? "walk" : "idle", hold: "none" };
      }
      return actors;
    }
    case "ghat-arrange":
      return {
        vrati: { look: "vrati", pos: [-0.2, stepTop(3), 2.5], rotY: PI, pose: "arrange", hold: "none" },
        man: { look: "man", pos: [0.9, stepTop(4), 3.1], rotY: PI + 0.4, pose: p < 0.3 ? "carry-head" : "idle", hold: p < 0.3 ? "daura" : "none" },
        youngman: { look: "youngman", pos: [-1.4, stepTop(4), 3.0], rotY: PI - 0.5, pose: "idle", hold: "cane" },
        elder: { look: "elder", pos: [0.6, stepTop(3), 2.3], rotY: PI - 0.2, pose: "offer", hold: "diya" },
        child: { look: "child", pos: [1.6, stepTop(4), 3.3], rotY: PI + 0.2, pose: "idle", hold: "none" },
      };
    case "stand-in-water":
      return {
        vrati: { look: "vrati", pos: [0, GHAT.waterStandY, -2.6], rotY: PI, pose: "namaste", hold: "none" },
        vrati2: { look: "vrati2", pos: [-2.4, GHAT.waterStandY, -2.1], rotY: PI + 0.1, pose: "namaste", hold: "none" },
        vrati3: { look: "vrati3", pos: [2.6, GHAT.waterStandY, -3.0], rotY: PI - 0.1, pose: "namaste", hold: "none" },
        man: { look: "man", pos: [0.6, stepTop(1), 0.9], rotY: PI, pose: "namaste", hold: "none" },
        elder: { look: "elder", pos: [-0.8, stepTop(2), 1.6], rotY: PI, pose: "namaste", hold: "none" },
      };
    case "arghya":
    case "usha-arghya": {
      const lift = ease(seg(p, 0, 0.2));
      const pouring = p > 0.25 && p < 0.88;
      return {
        vrati: { look: "vrati", pos: [0, GHAT.waterStandY, -2.6], rotY: PI, pose: lift > 0.5 ? "raise-soop" : "hold-soop", hold: "soop-filled" },
        youngman: { look: "youngman", pos: [0.62, GHAT.waterStandY + 0.12, -2.05], rotY: PI - 0.75, pose: pouring ? "pour" : "idle", hold: "lota", stream: pouring },
        vrati2: { look: "vrati2", pos: [-2.4, GHAT.waterStandY, -2.1], rotY: PI + 0.1, pose: "raise-soop", hold: "soop-filled" },
        vrati3: { look: "vrati3", pos: [2.6, GHAT.waterStandY, -3.0], rotY: PI - 0.1, pose: p > 0.4 ? "raise-soop" : "namaste", hold: p > 0.4 ? "soop-filled" : "none" },
        elder: { look: "elder", pos: [-0.8, stepTop(1), 1.0], rotY: PI, pose: "namaste", hold: "none" },
      };
    }
    case "evening-close": {
      const up = ease(seg(p, 0.1, 0.8));
      const z = lerp(-2.6, 3.4, up);
      return {
        vrati: { look: "vrati", pos: [0, ghatGround(z), z], rotY: up < 1 ? 0 : PI, pose: up > 0 && up < 1 ? "walk" : "namaste", hold: "soop" },
        man: { look: "man", pos: [0.9, stepTop(5), 3.8], rotY: PI, pose: "idle", hold: "none" },
        elder: { look: "elder", pos: [-0.9, stepTop(5), 3.7], rotY: PI, pose: "namaste", hold: "none" },
        child: { look: "child", pos: [1.6, stepTop(5), 3.9], rotY: PI + 0.3, pose: "idle", hold: "diya" },
      };
    }
    case "blessing":
      return {
        vrati: { look: "vrati", pos: [0, stepTop(4), 3.0], rotY: 0, pose: p > 0.55 ? "give" : "idle", hold: p > 0.55 ? "thekua" : "soop" },
        youngman: { look: "youngman", pos: [0, stepTop(5), 3.75], rotY: PI, pose: p < 0.55 ? "bow" : "namaste", hold: "none" },
        child: { look: "child", pos: [0.65, stepTop(5), 3.7], rotY: PI - 0.4, pose: p > 0.55 ? "offer" : "namaste", hold: "none" },
        elder: { look: "elder", pos: [-0.8, stepTop(4), 3.2], rotY: 0.6, pose: "namaste", hold: "none" },
      };
    case "paran":
      return {
        vrati: { look: "vrati", pos: [0, stepTop(5), 3.6], rotY: PI, pose: "eat", hold: "none" },
        elder: { look: "elder", pos: [-0.9, stepTop(5), 3.8], rotY: PI - 0.4, pose: "sit", hold: "none" },
        man: { look: "man", pos: [1.0, stepTop(5), 3.9], rotY: PI + 0.4, pose: "sit", hold: "none" },
        child: { look: "child", pos: [0.4, stepTop(6), 4.4], rotY: PI, pose: "eat", hold: "none" },
      };
    default:
      return {};
  }
}
