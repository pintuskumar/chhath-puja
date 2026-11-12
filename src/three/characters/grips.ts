/**
 * Runtime hand grips for the rigged characters (after the mixer, every frame):
 *  - soop: palms up under the two side edges of the basket (arm IK), fingers flattened so
 *    they no longer poke up through the woven base; the basket rests on the palms.
 *  - lota: closed fist around the neck; the pot hangs upright when carried and tilts with
 *    the wrist when pouring; the other palm supports its base while pouring; the stream
 *    falls from the lowest point of the lip straight down to the water.
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
  stream: { ok: boolean; p: THREE.Vector3; len: number };
  /** 0 = lota hangs upright (carried), 1 = follows the wrist (pouring / filling) */
  lotaTilt: number;
}

export const newGripState = (): GripState => ({
  soop: { ok: false, p: new THREE.Vector3(), q: new THREE.Quaternion() },
  lota: { ok: false, p: new THREE.Vector3(), q: new THREE.Quaternion() },
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
  f.subVectors(p1, p0).normalize();
  h.fingers[0][0].getWorldPosition(p1);
  h.fingers[3][0].getWorldPosition(p2);
  a.subVectors(p1, p2);
  a.addScaledVector(f, -a.dot(f)).normalize();
  n.crossVectors(f, a).normalize();
  if (learn) {
    // curled fingertips point to the palm side: learn the sign from the clip's finger curl
    h.fingers[1][0].getWorldPosition(p1);
    h.fingers[1][2].getWorldPosition(p2);
    p2.sub(p1);
    p2.addScaledVector(f, -p2.dot(f));
    if (p2.lengthSq() > 0.003 * 0.003) h.palmSign = p2.dot(n) >= 0 ? 1 : -1;
  }
  n.multiplyScalar(h.palmSign);
}

/** Rotate the hand (about the wrist) so its fingers point along fw and the palm faces nw. */
function orientHand(h: Hand, fw: THREE.Vector3, nw: THREE.Vector3) {
  frame(h, T.f, T.n, T.a);
  T.b.crossVectors(T.f, T.n);
  T.m0.makeBasis(T.f, T.n, T.b);
  T.nw.copy(nw).addScaledVector(fw, -nw.dot(fw)).normalize();
  T.fw.copy(fw).normalize();
  T.b.crossVectors(T.fw, T.nw);
  T.m1.makeBasis(T.fw, T.nw, T.b);
  T.m1.multiply(T.m0.transpose());
  rotateWorld(h.hand, T.q.setFromRotationMatrix(T.m1));
}

/** Put the grip point (palm centre) at `target`, hand oriented (fw, nw), elbow kept on its side. */
function placeHand(h: Hand, target: THREE.Vector3, fw: THREE.Vector3, nw: THREE.Vector3) {
  orientHand(h, fw, nw);
  h.grip.getWorldPosition(T.p1);
  h.hand.getWorldPosition(T.p0);
  T.tgt.copy(target).sub(T.p1).add(T.p0); // wrist target
  T.side.copy(T.n); // fallback bend axis if the arm is fully straight
  solveTwoBone({ hip: h.upper, knee: h.fore, foot: h.hand }, T.tgt, T.side);
}

/** Flex (deg > 0) or straighten (deg < 0) the fingers about the knuckle hinge, per joint. */
function curl(h: Hand, deg: [number, number, number], thumbDeg = 0) {
  frame(h, T.f, T.n, T.a); // fingers are still as the clip curled them → learn the palm side
  T.a.crossVectors(T.f, T.n).normalize(); // rotating f about f × n moves it towards the palm
  for (const finger of h.fingers)
    for (let j = 0; j < 3; j++) if (deg[j]) rotateWorld(finger[j], T.q.setFromAxisAngle(T.a, THREE.MathUtils.degToRad(deg[j])));
  if (thumbDeg) {
    h.thumb[0].getWorldPosition(T.p0);
    h.thumb[2].getWorldPosition(T.p1);
    T.b.subVectors(T.p1, T.p0).normalize().cross(T.n).normalize();
    for (const j of [1, 2]) rotateWorld(h.thumb[j], T.q.setFromAxisAngle(T.b, THREE.MathUtils.degToRad(thumbDeg)));
  }
}

/** World placement (o, basis x y z) → root-local Frame. */
function toLocal(root: THREE.Object3D, out: Frame, o: THREE.Vector3, x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) {
  out.p.copy(o);
  root.worldToLocal(out.p);
  T.m0.makeBasis(x, y, z);
  out.q.setFromRotationMatrix(T.m0).premultiply(root.getWorldQuaternion(T.qr).invert());
  out.ok = true;
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
export function applyGrips(state: GripState, hands: Hands, s: ActorState, root: THREE.Object3D, delta: number, waterY: number) {
  state.soop.ok = false;
  state.lota.ok = false;
  state.stream.ok = false;
  const { o, x, y, z } = T;

  if ((s.hold === "soop" || s.hold === "soop-filled") && (s.pose === "hold-soop" || s.pose === "raise-soop")) {
    // basket frame from where the clip put the hands: level, yaw from the hand line
    const gl = hands.l.grip.getWorldPosition(new THREE.Vector3());
    const gr = hands.r.grip.getWorldPosition(T.p2);
    o.addVectors(gl, gr).multiplyScalar(0.5);
    x.subVectors(gl, gr);
    if (x.lengthSq() > 1e-8) {
      x.normalize();
      y.copy(UP).addScaledVector(x, -x.y).normalize();
      z.crossVectors(x, y);
      for (const [h, sgn] of [
        [hands.l, 1],
        [hands.r, -1],
      ] as const) {
        const tgt = new THREE.Vector3().copy(o).addScaledVector(x, sgn * SOOP_HAND_X).addScaledVector(y, -PALM).addScaledVector(z, SOOP_HAND_Z);
        // palm up, fingers forward and a little outwards along the side edge
        const fw = new THREE.Vector3().copy(z).addScaledVector(x, sgn * 0.3).normalize();
        placeHand(h, tgt, fw, y);
        // the clip curls the fingers (35°) — flatten them under the base, thumb up the rim
        curl(h, [-22, -28, -18], -12);
      }
      toLocal(root, state.soop, o, x, y, z);
    }
  }

  if (s.hold === "lota") {
    const h = hands.r;
    const tilt = s.pose === "pour" || s.pose === "fill" ? 1 : 0;
    state.lotaTilt = delta >= 1 ? tilt : state.lotaTilt + (tilt - state.lotaTilt) * (1 - Math.exp(-delta * 5));
    // close the fist around the neck (on top of the clip's 45° curl)
    curl(h, [30, 35, 25], 22);
    frame(h, T.f, T.n, T.a, false);
    const fist = new THREE.Vector3().copy(T.n);
    // axis: upright when carried, along the knuckles (index side up) when pouring
    y.copy(UP).lerp(T.a, state.lotaTilt).normalize();
    h.grip.getWorldPosition(o);
    o.addScaledVector(fist, LOTA_FIST).addScaledVector(y, -LOTA_NECK_Y); // pot origin = base centre
    z.copy(fist).addScaledVector(y, -fist.dot(y));
    if (z.lengthSq() < 1e-6) z.set(0, 0, 1).addScaledVector(y, -y.z);
    z.normalize();
    x.crossVectors(y, z);
    toLocal(root, state.lota, o, x, y, z);

    if (s.pose === "pour") {
      // other palm under the base, fingers forward
      const tgt = new THREE.Vector3().copy(o).addScaledVector(y, -PALM - 0.008);
      const fwd = new THREE.Vector3(0, 0, 1).transformDirection(root.matrixWorld);
      const fw = fwd.addScaledVector(y, -fwd.dot(y)).normalize();
      placeHand(hands.l, tgt, fw, y);
      curl(hands.l, [8, 10, 6]);
    }
    if (s.stream) {
      // lowest point of the lip, then straight down to the water
      const lip = new THREE.Vector3().copy(o).addScaledVector(y, LOTA_LIP_Y);
      const down = new THREE.Vector3(0, -1, 0).addScaledVector(y, y.y);
      if (down.lengthSq() > 1e-6) lip.addScaledVector(down.normalize(), LOTA_LIP_R);
      root.worldToLocal(lip);
      const waterLocal = waterY - root.position.y;
      state.stream.p.copy(lip);
      state.stream.len = Math.max(0, lip.y - waterLocal);
      state.stream.ok = state.stream.len > 0.05;
    }
  }
}
