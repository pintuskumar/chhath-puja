/**
 * Runtime hand grips for the rigged characters (after the mixer, every frame):
 *  - soop: palms up under the two side edges of the basket (arm IK); every finger joint curls
 *    until it touches the basket (contact wrap), so fingers lie flat under the base and bend
 *    up round the edge instead of poking through it.
 *  - lota: fingers and thumb close round the neck until they touch it (contact wrap); the pot hangs upright when carried and tilts with
 *    the wrist when pouring; the other palm supports its base while pouring; the stream
 *    falls from the lowest point of the lip straight down to the water.
 *  - daura (on the head): palms flat on the outside of the basket wall, fingers curl over the rim.
 *  - diya: resting on the upturned right palm, flame upright, fingers cupped round the bowl.
 * Works on the MPFB "mixamo" skeleton (finger bones `mixamorig{Side}Hand{Finger}{1..3}`).
 * Rigs without finger bones (the CI mannequin) get null from findHands → old sockets.
 * Prop dimensions match src/three/props.tsx (Soop 0.6 × 0.5 m, Lota neck r 0.04 at y 0.15).
 */
import * as THREE from "three";
import type { ActorState } from "../choreography";
import { rotateWorld, solveTwoBone } from "./ik";

const FINGERS = ["Index", "Middle", "Ring", "Pinky"] as const;

export interface Hand {
  upper: THREE.Object3D;
  fore: THREE.Object3D;
  hand: THREE.Object3D;
  grip: THREE.Object3D;
  /** [finger][joint 1..3] */
  fingers: THREE.Object3D[][];
  thumb: THREE.Object3D[];
  /** cached palm side (sign of f × across) for frames where the fingers are straight */
  palmSign: number;
}
export interface Hands {
  l: Hand;
  r: Hand;
}

/** Root-local placement written by applyGrips, read by the prop sockets after the mix. */
export interface Frame {
  ok: boolean;
  p: THREE.Vector3;
  q: THREE.Quaternion;
}
export interface GripState {
  soop: Frame;
  lota: Frame;
  diya: Frame;
  stream: { ok: boolean; p: THREE.Vector3; len: number };
  /** 0 = lota hangs upright (carried), 1 = follows the wrist (pouring / filling) */
  lotaTilt: number;
}

export const newGripState = (): GripState => ({
  soop: { ok: false, p: new THREE.Vector3(), q: new THREE.Quaternion() },
  lota: { ok: false, p: new THREE.Vector3(), q: new THREE.Quaternion() },
  diya: { ok: false, p: new THREE.Vector3(), q: new THREE.Quaternion() },
  stream: { ok: false, p: new THREE.Vector3(), len: 0 },
  lotaTilt: 0,
});

const get = (root: THREE.Object3D, ...names: string[]) => {
  for (const n of names) {
    const o = root.getObjectByName(n) ?? root.getObjectByName(n.replace("mixamorig", "mixamorig:"));
    if (o) return o;
  }
  return null;
};

function findHand(root: THREE.Object3D, side: "Left" | "Right", gripName: string): Hand | null {
  const upper = get(root, `mixamorig${side}Arm`);
  const fore = get(root, `mixamorig${side}ForeArm`);
  const hand = get(root, `mixamorig${side}Hand`);
  const grip = get(root, gripName);
  const fingers = FINGERS.map((f) => [1, 2, 3].map((j) => get(root, `mixamorig${side}Hand${f}${j}`)));
  const thumb = [1, 2, 3].map((j) => get(root, `mixamorig${side}HandThumb${j}`));
  if (!upper || !fore || !hand || !grip || fingers.some((f) => f.some((b) => !b)) || thumb.some((b) => !b)) return null;
  const h: Hand = { upper, fore, hand, grip, fingers: fingers as THREE.Object3D[][], thumb: thumb as THREE.Object3D[], palmSign: 1 };
  // rest pose: MakeHuman palms face (mostly) down
  root.updateMatrixWorld(true);
  frame(h, T.f, T.n, T.a, false);
  h.palmSign = T.n.y < 0 ? h.palmSign : -h.palmSign;
  return h;
}

export function findHands(root: THREE.Object3D): Hands | null {
  const l = findHand(root, "Left", "hand_l_grip");
  const r = findHand(root, "Right", "hand_r_grip");
  return l && r ? { l, r } : null;
}

const T = {
  f: new THREE.Vector3(),
  n: new THREE.Vector3(),
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  fw: new THREE.Vector3(),
  nw: new THREE.Vector3(),
  p0: new THREE.Vector3(),
  p1: new THREE.Vector3(),
  p2: new THREE.Vector3(),
  o: new THREE.Vector3(),
  x: new THREE.Vector3(),
  y: new THREE.Vector3(),
  z: new THREE.Vector3(),
  tgt: new THREE.Vector3(),
  side: new THREE.Vector3(),
  m0: new THREE.Matrix4(),
  m1: new THREE.Matrix4(),
  q: new THREE.Quaternion(),
  qr: new THREE.Quaternion(),
};
const UP = new THREE.Vector3(0, 1, 0);

/**
 * World frame of a hand: f = wrist → middle knuckle (finger direction), a = pinky → index
 * knuckle (across the palm), n = palm normal (the side the fingers curl towards).
 */
function frame(h: Hand, f: THREE.Vector3, n: THREE.Vector3, a: THREE.Vector3, learn = true) {
  const { p0, p1, p2 } = T;
  h.hand.getWorldPosition(p0);
  h.fingers[1][0].getWorldPosition(p1);
  f.subVectors(p1, p0);
  if (!unit(f)) return false;
  h.fingers[0][0].getWorldPosition(p1);
  h.fingers[3][0].getWorldPosition(p2);
  a.subVectors(p1, p2);
  a.addScaledVector(f, -a.dot(f));
  if (!unit(a)) return false;
  n.crossVectors(f, a);
  if (!unit(n)) return false;
  if (learn) {
    // curled fingertips point to the palm side: learn the sign from the clip's finger curl
    h.fingers[1][0].getWorldPosition(p1);
    h.fingers[1][2].getWorldPosition(p2);
    p2.sub(p1);
    p2.addScaledVector(f, -p2.dot(f));
    if (p2.lengthSq() > 0.003 * 0.003) h.palmSign = p2.dot(n) >= 0 ? 1 : -1;
  }
  n.multiplyScalar(h.palmSign);
  return true;
}

/** A unit vector we can trust (degenerate cross products / zero lengths give NaN). */
const unit = (v: THREE.Vector3) => {
  const l = v.length();
  if (!(l > 1e-6)) return false;
  v.divideScalar(l);
  return true;
};
const finite = (q: THREE.Quaternion) => Number.isFinite(q.x + q.y + q.z + q.w);

/** Rotate the hand (about the wrist) so its fingers point along fw and the palm faces nw. */
function orientHand(h: Hand, fw: THREE.Vector3, nw: THREE.Vector3) {
  if (!frame(h, T.f, T.n, T.a)) return false;
  T.b.crossVectors(T.f, T.n);
  T.m0.makeBasis(T.f, T.n, T.b);
  T.fw.copy(fw);
  if (!unit(T.fw)) return false;
  T.nw.copy(nw).addScaledVector(T.fw, -nw.dot(T.fw));
  if (!unit(T.nw)) return false;
  T.b.crossVectors(T.fw, T.nw);
  T.m1.makeBasis(T.fw, T.nw, T.b);
  T.m1.multiply(T.m0.transpose());
  T.q.setFromRotationMatrix(T.m1);
  if (!finite(T.q)) return false;
  rotateWorld(h.hand, T.q.normalize());
  return true;
}

/** Put the grip point (palm centre) at `target`, hand oriented (fw, nw), elbow kept on its side. */
function placeHand(h: Hand, target: THREE.Vector3, fw: THREE.Vector3, nw: THREE.Vector3) {
  if (!orientHand(h, fw, nw) || !Number.isFinite(target.x + target.y + target.z)) return false;
  h.grip.getWorldPosition(T.p1);
  h.hand.getWorldPosition(T.p0);
  T.tgt.copy(target).sub(T.p1).add(T.p0); // wrist target
  T.side.copy(T.n); // fallback bend axis if the arm is fully straight
  solveTwoBone({ hip: h.upper, knee: h.fore, foot: h.hand }, T.tgt, T.side);
  return true;
}

// ───────────── contact wrap: each finger joint curls until its segment touches the prop ─────────────

/** Signed distance (metres) from a point in the prop's local space to its surface (< 0 = inside). */
type Sdf = (p: THREE.Vector3) => number;

const W = {
  h: new THREE.Vector3(),
  e: new THREE.Vector3(),
  m: new THREE.Vector3(),
  l: new THREE.Vector3(),
  d: new THREE.Vector3(),
  f: new THREE.Vector3(),
  n: new THREE.Vector3(),
  a: new THREE.Vector3(),
  w: new THREE.Vector3(),
  hinge: new THREE.Vector3(),
  q0: new THREE.Quaternion(),
  q: new THREE.Quaternion(),
  Mi: new THREE.Matrix4(),
};

/** Soop as a box: base 0.6 × 0.5 m, walls up to ~0.17 m (props.tsx); origin = centre of underside. */
export const soopSdf: Sdf = (p) => {
  const qx = Math.abs(p.x) - 0.3;
  const qy = Math.abs(p.y - 0.085) - 0.085;
  const qz = Math.abs(p.z) - 0.25;
  const out = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0));
  return out + Math.min(Math.max(qx, qy, qz), 0);
};

// Lota lathe profile [height, radius] (props.tsx) — base, belly, shoulder, neck, lip
const LOTA_PROFILE: [number, number][] = [
  [0, 0.05],
  [0.04, 0.085],
  [0.08, 0.09],
  [0.13, 0.06],
  [0.15, 0.04],
  [0.18, 0.055],
];
const lotaRadius = (h: number) => {
  if (h <= 0) return LOTA_PROFILE[0][1];
  for (let i = 1; i < LOTA_PROFILE.length; i++) {
    const [h1, r1] = LOTA_PROFILE[i];
    if (h <= h1) {
      const [h0, r0] = LOTA_PROFILE[i - 1];
      return r0 + ((r1 - r0) * (h - h0)) / (h1 - h0);
    }
  }
  return LOTA_PROFILE[LOTA_PROFILE.length - 1][1];
};
/** Lota body of revolution about +Y, origin at the base centre (approximate SDF, exact sign). */
export const lotaSdf: Sdf = (p) => {
  const h = Math.min(Math.max(p.y, 0), 0.18);
  return Math.max(Math.hypot(p.x, p.z) - lotaRadius(h), -p.y, p.y - 0.18);
};

// Daura (props.tsx, held at scale 0.8): bamboo wall from r 0.256 (bottom) to 0.336 (rim) over
// 0.256 m, rim ring at the top, cloth dome over it. Origin = centre of the base.
const DAURA_H = 0.256;
const DAURA_R0 = 0.256;
const DAURA_R1 = 0.336;
const dauraRadius = (y: number) => DAURA_R0 + ((DAURA_R1 - DAURA_R0) * Math.min(Math.max(y, 0), DAURA_H)) / DAURA_H;
/** Solid daura (wall + cloth on top), so fingertips stop on the wall and curl over the rim. */
export const dauraSdf: Sdf = (p) => Math.max(Math.hypot(p.x, p.z) - dauraRadius(p.y), -p.y, p.y - (DAURA_H + 0.02));

// Diya (props.tsx): clay bowl, base r 0.05 at y 0, rim r 0.09 at y 0.045.
export const diyaSdf: Sdf = (p) => {
  const y = Math.min(Math.max(p.y, 0), 0.05);
  return Math.max(Math.hypot(p.x, p.z) - (0.05 + (0.04 * y) / 0.05), -p.y, p.y - 0.05);
};

/** Far end of joint j of a finger chain: next joint's head, or the estimated fingertip. */
function endOf(chain: THREE.Object3D[], j: number, out: THREE.Vector3) {
  if (j < chain.length - 1) return chain[j + 1].getWorldPosition(out);
  // bones point along local +Y; distal phalanx ≈ 0.8 × the middle one (its offset from its parent)
  const b = chain[j];
  return b.localToWorld(out.set(0, b.position.length() * 0.8, 0));
}

/** Does segment j (near half and far end) reach within `rad` of the surface? */
function touches(chain: THREE.Object3D[], j: number, sdf: Sdf, rad: number) {
  chain[j].getWorldPosition(W.h);
  endOf(chain, j, W.e);
  W.m.addVectors(W.h, W.e).multiplyScalar(0.5);
  return sdf(W.l.copy(W.e).applyMatrix4(W.Mi)) < rad || sdf(W.l.copy(W.m).applyMatrix4(W.Mi)) < rad;
}

/** Set joint `b` to its starting (clip) rotation turned by `deg` about the world hinge. */
function setBend(b: THREE.Object3D, q0: THREE.Quaternion, hinge: THREE.Vector3, deg: number) {
  b.quaternion.copy(q0);
  b.updateMatrixWorld(true);
  if (deg) rotateWorld(b, W.q.setFromAxisAngle(hinge, THREE.MathUtils.degToRad(deg)));
}

/**
 * Curl each joint (from the clip pose) by the largest angle in [lo, hi] that keeps its segment
 * just outside the prop: the finger wraps the surface instead of sinking into it. Joints that
 * cannot reach the prop keep the clip's pose; joints already touching when fully open stay open.
 */
function wrapChain(chain: THREE.Object3D[], hinge: THREE.Vector3, sdf: Sdf, rads: readonly number[], lo: number, hi: number) {
  for (let j = 0; j < chain.length; j++) {
    const b = chain[j];
    const r = rads[Math.min(j, rads.length - 1)];
    W.q0.copy(b.quaternion);
    setBend(b, W.q0, hinge, lo);
    if (touches(chain, j, sdf, r)) continue;
    setBend(b, W.q0, hinge, hi);
    if (!touches(chain, j, sdf, r)) {
      setBend(b, W.q0, hinge, 0);
      continue;
    }
    let a = lo;
    let c = hi;
    for (let i = 0; i < 9; i++) {
      const mid = (a + c) / 2;
      setBend(b, W.q0, hinge, mid);
      if (touches(chain, j, sdf, r)) c = mid;
      else a = mid;
    }
    setBend(b, W.q0, hinge, a);
  }
}

const FINGER_R = [0.0095, 0.0085, 0.0075] as const; // half-thickness per phalanx (MakeHuman hand)
const THUMB_R = [0.0105, 0.009] as const;

/**
 * Wrap all fingers and the thumb of `h` around a prop. `M` = the prop's world matrix
 * (basis + origin), `sdf` its shape in local space.
 */
function wrapHand(h: Hand, M: THREE.Matrix4, sdf: Sdf) {
  if (!frame(h, W.f, W.n, W.a)) return;
  W.Mi.copy(M).invert();
  h.hand.getWorldPosition(W.w);
  for (const finger of h.fingers) {
    // per-finger hinge: wrist → this knuckle, crossed with the palm normal (follows finger splay);
    // turning about d × n swings the finger towards the palm
    finger[0].getWorldPosition(W.d).sub(W.w);
    W.hinge.crossVectors(W.d, W.n);
    if (!unit(W.hinge)) continue;
    wrapChain(finger, W.hinge, sdf, FINGER_R, -50, 100);
  }
  h.thumb[0].getWorldPosition(W.w);
  h.thumb[1].getWorldPosition(W.d).sub(W.w);
  W.hinge.crossVectors(W.d, W.n);
  if (unit(W.hinge)) wrapChain([h.thumb[1], h.thumb[2]], W.hinge, sdf, THUMB_R, -30, 60);
}

const propM = new THREE.Matrix4();
const setPropMatrix = (o: THREE.Vector3, x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) => propM.makeBasis(x, y, z).setPosition(o);

/** World placement (o, basis x y z) → root-local Frame. */
function toLocal(root: THREE.Object3D, out: Frame, o: THREE.Vector3, x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) {
  out.p.copy(o);
  root.worldToLocal(out.p);
  T.m0.makeBasis(x, y, z);
  out.q.setFromRotationMatrix(T.m0).premultiply(root.getWorldQuaternion(T.qr).invert());
  out.ok = finite(out.q) && Number.isFinite(out.p.x + out.p.y + out.p.z);
}

// Soop (props.tsx): base 0.6 (x) × 0.5 (z) m, origin at the centre of its underside.
const SOOP_HAND_X = 0.21; // palm centres under the side edges (outer palm edge ≈ rim)
const SOOP_HAND_Z = -0.03; // a little towards the body
const PALM = 0.014; // grip bone (inside the hand) → palm surface
// Lota (props.tsx): neck radius 0.04 at y 0.15, lip at y 0.18, belly r 0.09.
const LOTA_NECK_Y = 0.15;
const LOTA_FIST = 0.05; // grip bone → neck axis (palm surface + neck radius)
const LOTA_LIP_Y = 0.18;
const LOTA_LIP_R = 0.052;

/**
 * Pose the hands for the held prop (call after the mixer and foot IK, before the sockets
 * read `state`). `root` is the actor group (world matrix up to date). `waterY` is the river
 * surface in the root's parent space.
 */
export function applyGrips(
  state: GripState,
  hands: Hands,
  s: ActorState,
  root: THREE.Object3D,
  delta: number,
  waterY: number,
  /** the daura's socket group on the head (world matrix up to date), when carried */
  daura?: THREE.Object3D | null,
) {
  state.soop.ok = false;
  state.lota.ok = false;
  state.diya.ok = false;
  state.stream.ok = false;
  const { o, x, y, z } = T;

  if ((s.hold === "soop" || s.hold === "soop-filled") && (s.pose === "hold-soop" || s.pose === "raise-soop")) {
    // basket frame from where the clip put the hands: level, yaw from the hand line
    const gl = hands.l.grip.getWorldPosition(new THREE.Vector3());
    const gr = hands.r.grip.getWorldPosition(T.p2);
    o.addVectors(gl, gr).multiplyScalar(0.5);
    x.subVectors(gl, gr);
    if (unit(x)) {
      y.copy(UP).addScaledVector(x, -x.y);
      if (!unit(y)) y.copy(UP);
      z.crossVectors(x, y);
      for (const [h, sgn] of [
        [hands.l, 1],
        [hands.r, -1],
      ] as const) {
        const tgt = new THREE.Vector3().copy(o).addScaledVector(x, sgn * SOOP_HAND_X).addScaledVector(y, -PALM).addScaledVector(z, SOOP_HAND_Z);
        // palm up, fingers forward and a little outwards along the side edge
        const fw = new THREE.Vector3().copy(z).addScaledVector(x, sgn * 0.3).normalize();
        placeHand(h, tgt, fw, y);
      }
      // a raised soop can be just out of reach: rest the basket on where the palms actually are
      hands.l.grip.getWorldPosition(gl);
      hands.r.grip.getWorldPosition(gr);
      if (Number.isFinite(gl.x + gl.y + gl.z + gr.x + gr.y + gr.z)) {
        o.addVectors(gl, gr).multiplyScalar(0.5).addScaledVector(y, PALM).addScaledVector(z, -SOOP_HAND_Z);
      }
      setPropMatrix(o, x, y, z);
      // fingers lie flat against the underside (and curl up round the edge where they pass it)
      wrapHand(hands.l, propM, soopSdf);
      wrapHand(hands.r, propM, soopSdf);
      toLocal(root, state.soop, o, x, y, z);
    }
  }

  if (s.hold === "lota") {
    const h = hands.r;
    const tilt = s.pose === "pour" || s.pose === "fill" ? 1 : 0;
    state.lotaTilt = delta >= 1 ? tilt : state.lotaTilt + (tilt - state.lotaTilt) * (1 - Math.exp(-delta * 5));
    // the clip's 45° curl tells us which side the palm is on
    if (!frame(h, T.f, T.n, T.a)) return;
    const fist = new THREE.Vector3().copy(T.n);
    // axis: upright when carried; when pouring it runs along the knuckles. The lota clip turns
    // the hand index-down / pinky-up (build_clips.py c_lota: across = (0,0,-1)), so the
    // mouth is on the pinky side: axis = −a (pinky → index reversed).
    T.a.negate();
    y.copy(UP).lerp(T.a, state.lotaTilt);
    if (!unit(y)) y.copy(UP);
    h.grip.getWorldPosition(o);
    o.addScaledVector(fist, LOTA_FIST).addScaledVector(y, -LOTA_NECK_Y); // pot origin = base centre
    z.copy(fist).addScaledVector(y, -fist.dot(y));
    if (!unit(z)) {
      z.set(0, 0, 1).addScaledVector(y, -y.z);
      if (!unit(z)) z.set(1, 0, 0);
    }
    x.crossVectors(y, z);
    toLocal(root, state.lota, o, x, y, z);
    // fingers and thumb close round the neck until they touch it
    setPropMatrix(o, x, y, z);
    wrapHand(h, propM, lotaSdf);

    if (s.pose === "pour") {
      // other palm under the base, fingers forward
      const tgt = new THREE.Vector3().copy(o).addScaledVector(y, -PALM - 0.008);
      const fwd = new THREE.Vector3(0, 0, 1).transformDirection(root.matrixWorld);
      const fw = fwd.addScaledVector(y, -fwd.dot(y));
      if (unit(fw) && placeHand(hands.l, tgt, fw, y)) wrapHand(hands.l, propM, lotaSdf); // cupped under the base
    }
    if (s.stream) {
      // lowest point of the lip, then straight down to the water
      const lip = new THREE.Vector3().copy(o).addScaledVector(y, LOTA_LIP_Y);
      const down = new THREE.Vector3(0, -1, 0).addScaledVector(y, y.y);
      if (unit(down)) lip.addScaledVector(down, LOTA_LIP_R);
      root.worldToLocal(lip);
      const waterLocal = waterY - root.position.y;
      state.stream.p.copy(lip);
      state.stream.len = Math.max(0, lip.y - waterLocal);
      state.stream.ok = state.stream.len > 0.05 && state.stream.len < 5 && Number.isFinite(lip.x + lip.y + lip.z);
    }
  }

  if (s.hold === "daura" && daura && (s.pose === "carry-head" || s.pose === "walk")) {
    // palms flat on the outside of the basket wall, fingers up, curling over the rim
    const D = daura.matrixWorld; // head socket: metre scale, follows the head
    o.setFromMatrixPosition(D);
    x.setFromMatrixColumn(D, 0);
    y.setFromMatrixColumn(D, 1);
    z.setFromMatrixColumn(D, 2);
    if (unit(x) && unit(y) && unit(z)) {
      propM.makeBasis(x, y, z).setPosition(o);
      // which way is "left" for this actor: from the clip's hands, across the basket axis
      const gl = hands.l.grip.getWorldPosition(new THREE.Vector3());
      const gr = hands.r.grip.getWorldPosition(T.p2);
      const side = new THREE.Vector3().subVectors(gl, gr).addScaledVector(y, -gl.clone().sub(gr).dot(y));
      if (unit(side)) {
        for (const [h, sgn] of [
          [hands.l, 1],
          [hands.r, -1],
        ] as const) {
          const out = new THREE.Vector3().copy(side).multiplyScalar(sgn);
          const hgt = DAURA_H * 0.45;
          const tgt = new THREE.Vector3().copy(o).addScaledVector(y, hgt).addScaledVector(out, dauraRadius(hgt) + PALM);
          // fingers up the wall (tilted with its flare), palm facing the basket
          const fw = new THREE.Vector3().copy(y).addScaledVector(out, (DAURA_R1 - DAURA_R0) / DAURA_H);
          if (unit(fw) && placeHand(h, tgt, fw, out.negate())) wrapHand(h, propM, dauraSdf);
        }
      }
    }
  }

  if (s.hold === "diya") {
    // diya resting on the right palm, palm up, flame upright
    const h = hands.r;
    const fwd = new THREE.Vector3(0, 0, 1).transformDirection(root.matrixWorld);
    fwd.y = 0;
    if (unit(fwd)) {
      if (s.pose === "offer" || s.pose === "give") {
        // the offering clip already holds the hand out: just turn the palm to face the sky
        orientHand(h, fwd, UP);
      } else {
        // otherwise bring the hand up in front of the chest (scaled to this actor's arm)
        const sh = h.upper.getWorldPosition(new THREE.Vector3());
        const el = h.fore.getWorldPosition(new THREE.Vector3());
        const wr = h.hand.getWorldPosition(new THREE.Vector3());
        const L = sh.distanceTo(el) + el.distanceTo(wr);
        const inward = new THREE.Vector3(0, 1, 0).cross(fwd); // actor's left
        const tgt = sh.addScaledVector(fwd, 0.6 * L).addScaledVector(UP, -0.45 * L).addScaledVector(inward, 0.12 * L);
        placeHand(h, tgt, fwd, UP);
      }
      h.grip.getWorldPosition(o).addScaledVector(UP, PALM);
      y.copy(UP);
      z.copy(fwd);
      x.crossVectors(y, z);
      toLocal(root, state.diya, o, x, y, z);
      setPropMatrix(o, x, y, z);
      wrapHand(h, propM, diyaSdf); // fingers cup round the bowl
    }
  }
}
