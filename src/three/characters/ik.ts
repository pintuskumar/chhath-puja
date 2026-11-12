/** Small analytic IK helpers shared by foot planting and hand grips (world-space, no allocation). */
import * as THREE from "three";

export interface Limb {
  /** hip / shoulder (upper arm) */
  hip: THREE.Object3D;
  /** knee / elbow (forearm) */
  knee: THREE.Object3D;
  /** ankle / wrist */
  foot: THREE.Object3D;
}

export const ik = {
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  c: new THREE.Vector3(),
  t: new THREE.Vector3(),
  u: new THREE.Vector3(),
  n: new THREE.Vector3(),
  p: new THREE.Vector3(),
  e: new THREE.Vector3(),
  v1: new THREE.Vector3(),
  v2: new THREE.Vector3(),
  q: new THREE.Quaternion(),
  qa: new THREE.Quaternion(),
  qb: new THREE.Quaternion(),
  foot: new THREE.Quaternion(),
};

/** Apply a world-space rotation to a bone (children follow). */
export function rotateWorld(bone: THREE.Object3D, q: THREE.Quaternion) {
  bone.getWorldQuaternion(ik.qa);
  ik.qa.premultiply(q);
  bone.parent!.getWorldQuaternion(ik.qb);
  bone.quaternion.copy(ik.qb.invert().multiply(ik.qa));
  bone.updateMatrixWorld(true);
}

/**
 * Analytic two-bone IK: move the end joint to `target` (world), keeping the middle joint in
 * its current bend plane and the end bone's world orientation (feet stay flat, hands keep
 * their grip orientation).
 */
export function solveTwoBone(limb: Limb, target: THREE.Vector3, sideAxis: THREE.Vector3) {
  const { a, b, c, u, n, p, e, v1, v2, q } = ik;
  limb.hip.getWorldPosition(a);
  limb.knee.getWorldPosition(b);
  limb.foot.getWorldPosition(c);
  limb.foot.getWorldQuaternion(ik.foot);
  const l1 = a.distanceTo(b);
  const l2 = b.distanceTo(c);
  const d = THREE.MathUtils.clamp(a.distanceTo(target), Math.abs(l1 - l2) + 1e-4, (l1 + l2) * 0.999);
  u.subVectors(target, a).normalize();
  n.crossVectors(v1.subVectors(b, a), v2.subVectors(c, a));
  if (n.lengthSq() < 1e-10) n.copy(sideAxis);
  n.normalize();
  p.crossVectors(n, u).normalize();
  if (p.dot(v1.subVectors(b, a)) < 0) p.negate(); // keep the knee / elbow pointing the same way
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  e.copy(a).addScaledVector(u, l1 * cosA).addScaledVector(p, l1 * sinA);
  rotateWorld(limb.hip, q.setFromUnitVectors(v1.subVectors(b, a).normalize(), v2.subVectors(e, a).normalize()));
  limb.knee.getWorldPosition(b);
  limb.foot.getWorldPosition(c);
  const end = v2.copy(a).addScaledVector(u, d);
  rotateWorld(limb.knee, q.setFromUnitVectors(v1.subVectors(c, b).normalize(), end.sub(b).normalize()));
  limb.foot.parent!.getWorldQuaternion(ik.qb);
  limb.foot.quaternion.copy(ik.qb.invert().multiply(ik.foot));
  limb.foot.updateMatrixWorld(true);
}
