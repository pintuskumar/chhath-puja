"use client";

/**
 * Realistic skinned character (MetaHuman → GLB) driven by the existing choreography.
 *  - one GLB per person, cloned with SkeletonUtils (shared geometry/textures, own skeleton)
 *  - clips from a shared animation GLB on the same skeleton, cross-faded by pose
 *  - walk playback rate follows ground speed → no foot sliding
 *  - ritual props parented to hand/head bones (hands hold the soop, lota, daura)
 * Choreography timing, hotspots, scroll story etc. are unchanged.
 */
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { createPortal, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Soop, Lota, Daura, Sugarcane, Thekua, Diya } from "../props";
import { mat } from "../materials";
import { GHAT, type ActorState, type HoldId } from "../choreography";
import { clipCandidates, LOCOMOTION, normalizeClipName, type ClipName } from "./clipMap";
import { modelUrl, type CharacterSpec, type ModelManifest, type PropOffset } from "./manifest";
import { ik, solveTwoBone, type Limb } from "./ik";
import { applyGrips, findHands, newGripState, type Frame, type GripState } from "./grips";

const RIGHT_GRIP = ["hand_r_grip", "hand_r", "mixamorigRightHand", "RightHand"];
const LEFT_GRIP = ["hand_l_grip", "hand_l", "mixamorigLeftHand", "LeftHand"];
const HEAD = ["head", "mixamorigHead", "Head"];
const LEGS = {
  l: [["mixamorigLeftUpLeg", "thigh_l"], ["mixamorigLeftLeg", "calf_l"], ["mixamorigLeftFoot", "foot_l"]],
  r: [["mixamorigRightUpLeg", "thigh_r"], ["mixamorigRightLeg", "calf_r"], ["mixamorigRightFoot", "foot_r"]],
} as const;

/** Default attachment bone per held item. */
const HOLD_BONE: Record<Exclude<HoldId, "none">, "right" | "left" | "head" | "both"> = {
  // the soop is held level in both hands → socket between the two palms
  soop: "both",
  "soop-filled": "both",
  lota: "right",
  daura: "head",
  broom: "right",
  ladle: "right",
  cane: "left",
  thekua: "right",
  diya: "right",
  wood: "head",
};

type GripProbe = Record<string, { hold: HoldId; pose: string; stream: boolean; l: number[]; r: number[]; fwd: number[] }>;
const probeV = new THREE.Vector3();
/**
 * Test-only (scripts/smoke.mjs sets `window.__gripProbe`): report each character's hand
 * positions in world space so the smoke test can frame a close-up of the grip.
 */
function publishGrips(
  s: ActorState,
  root: THREE.Object3D,
  bones: { left: THREE.Object3D | null; right: THREE.Object3D | null },
) {
  const w = window as Window & { __gripProbe?: boolean; __grips?: GripProbe };
  if (!w.__gripProbe || !bones.left || !bones.right) return;
  const out = (w.__grips ??= {});
  const p = (o: THREE.Object3D) => o.getWorldPosition(probeV).toArray().map((v) => +v.toFixed(3));
  probeV.set(0, 0, 1).transformDirection(root.matrixWorld);
  const fwd = probeV.toArray().map((v) => +v.toFixed(3));
  out[s.look] = { hold: s.hold, pose: s.pose, stream: !!s.stream, l: p(bones.left), r: p(bones.right), fwd };
}

function findBone(root: THREE.Object3D, names: string[]) {
  for (const n of names) {
    const hit = root.getObjectByName(n);
    if (hit) return hit;
  }
  return null;
}

/** Cloth materials written by characters/blender/build_character.py (`<id>_<garment>`). */
const CLOTH = /_(main|border|blouse|dhoti|kurta|pyjama|gamchha)$/;
const WATER_Y = 0; // river surface (Water.tsx)

/**
 * MPFB exports every MakeHuman material as alpha BLEND (skin, eyes, hair). three.js sorts
 * transparent meshes per object, so eyeballs and the mouth interior bleed through the skin
 * (red blotches on faces at distance). Skin + eyes → opaque; hair → alpha cut-out;
 * only brows/lashes stay blended, drawn after the head without writing depth.
 * Mutates the cached (shared) materials once; idempotent.
 */
function fixHumanAlpha(x: THREE.Material) {
  if (x.userData.alphaFixed || !x.name.startsWith("Human.")) return;
  x.userData.alphaFixed = true;
  if (/eyebrow|eyelash/i.test(x.name)) {
    x.transparent = true;
    x.depthWrite = false;
  } else if (/\.(body|low-poly)$|eye/i.test(x.name)) {
    x.transparent = false;
    x.alphaTest = 0;
    x.depthWrite = true;
    x.side = THREE.FrontSide; // no inner faces showing through
    if (/low-poly/i.test(x.name) && (x as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
      // wet cornea: a sharp catchlight from the scene's environment light (eyes read alive)
      const e = x as THREE.MeshStandardMaterial;
      e.roughness = 0.08;
      e.envMapIntensity = 1.6;
    }
  } else {
    // hair: strand cards, cut out by the texture's alpha. With MSAA (medium/high quality)
    // alpha-to-coverage turns the hard 0.5 cut into soft, fine strand tips instead of a
    // jagged solid "helmet"; without MSAA three.js falls back to a plain cut-out.
    x.transparent = false;
    x.alphaTest = 0.35;
    x.alphaToCoverage = true;
    x.depthWrite = true;
    x.side = THREE.DoubleSide; // cards seen from behind must not vanish (patchy scalp)
    const h = x as THREE.MeshStandardMaterial;
    if (h.isMeshStandardMaterial) {
      // oiled black hair (common for vratis): a soft sheen rather than chalky matte
      h.roughness = Math.min(h.roughness, 0.42);
      h.metalness = 0;
      h.envMapIntensity = 1.25;
    }
  }
  x.needsUpdate = true;
}

/**
 * Wet cotton below the waterline: darker and glossier, with a short wicking band above it.
 * `wet` (0..1) is driven per character: 1 while standing in the river, drying slowly after.
 */
function makeWet(m: THREE.MeshStandardMaterial, wet: { value: number }) {
  const c = m.clone();
  c.onBeforeCompile = (sh) => {
    sh.uniforms.uWet = wet;
    sh.uniforms.uWaterY = { value: WATER_Y };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vWetY;")
      .replace("#include <skinning_vertex>", "#include <skinning_vertex>\nvWetY = (modelMatrix * vec4(transformed, 1.0)).y;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vWetY;\nuniform float uWet;\nuniform float uWaterY;\nfloat wetK;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nwetK = uWet * (1.0 - smoothstep(uWaterY, uWaterY + 0.12, vWetY));\ndiffuseColor.rgb *= mix(1.0, 0.55, wetK);",
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.32, wetK);");
  };
  c.customProgramCacheKey = () => "wet-cloth";
  return c;
}

interface Rest {
  q: THREE.Quaternion;
  p: THREE.Vector3;
}
const restOf = (o: THREE.Object3D): Rest => ({ q: o.quaternion.clone(), p: o.position.clone() });

/**
 * Retarget a clip authored on one MPFB skeleton onto another (different body proportions):
 *  - rotations become deltas from the source rest pose, re-applied on the target rest pose
 *  - only the hips may translate (bob, sitting), scaled by the ratio of hip heights
 *  - every other translation/scale track is dropped, so bone lengths stay the model's own
 */
function retarget(clip: THREE.AnimationClip, src: Map<string, Rest>, dst: Map<string, Rest>) {
  const c = clip.clone();
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const corr = new THREE.Quaternion();
  c.tracks = c.tracks.flatMap((t) => {
    const { nodeName, propertyName } = THREE.PropertyBinding.parseTrackName(t.name);
    const s = src.get(nodeName);
    const d = dst.get(nodeName);
    if (propertyName === "quaternion") {
      if (!s || !d) return [t];
      // q' = d · s⁻¹ · q
      corr.copy(d.q).multiply(qa.copy(s.q).invert());
      const v = t.values.slice();
      for (let i = 0; i < v.length; i += 4) {
        qb.fromArray(v, i).premultiply(corr).normalize().toArray(v, i);
      }
      const nt = t.clone();
      nt.values = v;
      return [nt];
    }
    if (propertyName === "position" && /hips$/i.test(nodeName) && s && d) {
      const k = s.p.length() > 1e-6 ? d.p.length() / s.p.length() : 1;
      const v = t.values.slice();
      for (let i = 0; i < v.length; i += 3) {
        v[i] = d.p.x + (v[i] - s.p.x) * k;
        v[i + 1] = d.p.y + (v[i + 1] - s.p.y) * k;
        v[i + 2] = d.p.z + (v[i + 2] - s.p.z) * k;
      }
      const nt = t.clone();
      nt.values = v;
      return [nt];
    }
    return [];
  });
  return c;
}

function restMap(root: THREE.Object3D) {
  const m = new Map<string, Rest>();
  root.traverse((o) => {
    if (o.name && !m.has(o.name)) m.set(o.name, (o.userData.rest as Rest | undefined) ?? restOf(o));
  });
  return m;
}

function HeldProp({ hold }: { hold: Exclude<HoldId, "none"> }) {
  switch (hold) {
    case "soop":
      return <Soop />;
    case "soop-filled":
      return <Soop filled />;
    case "lota":
      return <Lota />;
    case "daura":
      return <Daura covered scale={0.8} />;
    case "cane":
      return <Sugarcane height={2} />;
    case "thekua":
      return <Thekua />;
    case "diya":
      return <Diya />;
    case "broom":
      return (
        <mesh material={mat.wood()}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 5]} />
        </mesh>
      );
    case "ladle":
      return (
        <mesh material={mat.wood()}>
          <cylinderGeometry args={[0.01, 0.01, 0.45, 5]} />
        </mesh>
      );
    case "wood":
      return (
        <mesh material={mat.wood()} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.035, 0.8, 5]} />
        </mesh>
      );
  }
}

/** Keeps a prop at real-world (metre) size regardless of the bone's accumulated scale. */
function BoneSocket({ bone, offset, children }: { bone: THREE.Object3D; offset?: PropOffset; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const ws = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!g.current) return;
    bone.getWorldScale(ws);
    g.current.scale.setScalar(ws.x > 1e-6 ? 1 / ws.x : 1);
  });
  return createPortal(
    <group ref={g}>
      <group position={offset?.position ?? [0, 0, 0]} rotation={offset?.rotation ?? [0, 0, 0]}>
        {children}
      </group>
    </group>,
    bone,
  );
}

/**
 * Socket midway between both grip bones, x-axis along right→left hand, y-axis up.
 * Lives in the actor's root space (not under a bone), so it has metre scale.
 */
function BothHandsSocket({
  left,
  right,
  root,
  afterMix,
  offset,
  frame,
  children,
}: {
  left: THREE.Object3D;
  right: THREE.Object3D;
  root: { current: THREE.Group | null };
  afterMix: Set<() => void>;
  offset?: PropOffset;
  /** basket frame solved by applyGrips (root-local); used instead of the hand midpoint when ok */
  frame?: Frame;
  children: ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const t = useMemo(
    () => ({ l: new THREE.Vector3(), r: new THREE.Vector3(), x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3(), m: new THREE.Matrix4() }),
    [],
  );
  useEffect(() => {
    const update = () => {
      const n = g.current;
      const base = root.current;
      if (!n || !base) return;
      // hands placed on the basket by applyGrips this frame → use that basket frame
      if (frame?.ok) {
        n.position.copy(frame.p);
        n.quaternion.copy(frame.q);
        return;
      }
      left.getWorldPosition(t.l);
      right.getWorldPosition(t.r);
      base.worldToLocal(t.l);
      base.worldToLocal(t.r);
      n.position.copy(t.l).add(t.r).multiplyScalar(0.5);
      t.x.subVectors(t.l, t.r);
      if (t.x.lengthSq() < 1e-8) return;
      t.x.normalize();
      t.y.set(0, 1, 0).addScaledVector(t.x, -t.x.y).normalize();
      t.z.crossVectors(t.x, t.y);
      n.quaternion.setFromRotationMatrix(t.m.makeBasis(t.x, t.y, t.z));
    };
    // runs right after the mixer has posed the skeleton (same frame, no lag)
    afterMix.add(update);
    return () => void afterMix.delete(update);
  }, [afterMix, left, right, root, t, frame]);
  return (
    <group ref={g}>
      <group position={offset?.position ?? [0, 0, 0]} rotation={offset?.rotation ?? [0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

/** Root-space socket placed from a Frame written by applyGrips (lota in the fist). */
function FrameSocket({ frame, afterMix, offset, children }: { frame: Frame; afterMix: Set<() => void>; offset?: PropOffset; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useEffect(() => {
    const update = () => {
      const n = g.current;
      if (!n || !frame.ok) return;
      n.position.copy(frame.p);
      n.quaternion.copy(frame.q);
    };
    afterMix.add(update);
    return () => void afterMix.delete(update);
  }, [afterMix, frame]);
  return (
    <group ref={g}>
      <group position={offset?.position ?? [0, 0, 0]} rotation={offset?.rotation ?? [0, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

interface Props {
  get: () => ActorState | undefined;
  spec: CharacterSpec;
  manifest: ModelManifest;
  reduced?: boolean;
  quality: "low" | "medium" | "high";
  /** Terrain height in environment space; enables foot IK (feet planted on the ghat steps). */
  ground?: (x: number, z: number) => number;
}

export function RiggedDevotee({ get, spec, manifest, reduced, quality, ground }: Props) {
  const src = quality === "low" && spec.srcLow ? spec.srcLow : spec.src;
  // (draco=false: no CDN decoder; meshopt=true: decoder is bundled)
  const gltf = useGLTF(modelUrl(src), false, true);
  const clipsGltf = useGLTF(modelUrl(manifest.clips!), false, true);
  const shadows = quality === "high";

  const wet = useMemo(() => ({ value: 0 }), []);
  const { model, scale, lift } = useMemo(() => {
    const m = cloneSkinned(gltf.scene) as THREE.Object3D;
    const own: THREE.Material[] = [];
    m.userData.ownMaterials = own; // per-instance clones, disposed on unmount
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const swap = (x: THREE.Material) => {
        fixHumanAlpha(x);
        if (!(x as THREE.MeshStandardMaterial).isMeshStandardMaterial || !CLOTH.test(x.name)) return x;
        const c = makeWet(x as THREE.MeshStandardMaterial, wet);
        own.push(c);
        return c;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
    });
    m.traverse((o) => {
      o.userData.rest = restOf(o); // captured before any clip plays (used for retargeting)
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = shadows;
      mesh.receiveShadow = shadows;
      // skinned bounds don't follow the animation → avoid popping out at screen edges
      if ((o as THREE.SkinnedMesh).isSkinnedMesh) o.frustumCulled = false;
    });
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const h = box.max.y - box.min.y;
    const s = h > 0 ? spec.height / h : 1;
    return { model: m, scale: s, lift: -box.min.y * s };
  }, [gltf.scene, shadows, spec.height, wet]);

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const actions = useMemo(() => {
    const map = new Map<string, THREE.AnimationAction>();
    const dst = restMap(model);
    const shared = restMap(clipsGltf.scene);
    const own = restMap(gltf.scene);
    for (const [clips, src] of [
      [clipsGltf.animations, shared],
      [gltf.animations, own],
    ] as const) {
      for (const clip of clips) {
        // In place: the choreography moves the actor; only the hips bob/sit.
        const c = retarget(clip, src, dst);
        map.set(normalizeClipName(c.name), mixer.clipAction(c));
      }
    }
    return map;
  }, [mixer, model, clipsGltf.animations, clipsGltf.scene, gltf.animations, gltf.scene]);
  useEffect(() => {
    // Mount counter for the browser smoke test (verifies rigged characters actually render).
    const w = window as Window & { __riggedCharacters?: number };
    w.__riggedCharacters = (w.__riggedCharacters ?? 0) + 1;
    return () => {
      w.__riggedCharacters = (w.__riggedCharacters ?? 1) - 1;
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      for (const mt of (model.userData.ownMaterials as THREE.Material[] | undefined) ?? []) mt.dispose();
    };
  }, [mixer, model]);

  const bones = useMemo(
    () => ({ right: findBone(model, RIGHT_GRIP), left: findBone(model, LEFT_GRIP), head: findBone(model, HEAD) }),
    [model],
  );
  const legs = useMemo(() => {
    const out: Limb[] = [];
    for (const names of [LEGS.l, LEGS.r]) {
      const [hip, knee, foot] = names.map((n) => findBone(model, [...n]));
      if (hip && knee && foot) out.push({ hip, knee, foot });
    }
    return out.length === 2 ? out : null;
  }, [model]);
  const footBase = useRef<number | null>(null);
  const prevTargetY = useRef<number | null>(null);
  const fk = useMemo(() => ({ w: new THREE.Vector3(), side: new THREE.Vector3(), gy: [0, 0] }), []);

  // finger-level grips (MPFB skeleton); null on rigs without finger bones → plain sockets
  const hands = useMemo(() => findHands(model), [model]);
  const grip = useMemo<GripState>(() => newGripState(), []);
  const fall = useRef<THREE.Mesh>(null);

  const root = useRef<THREE.Group>(null);
  const afterMix = useMemo(() => new Set<() => void>(), []);
  const holds = useRef<Partial<Record<HoldId, THREE.Group | null>>>({});
  const stream = useRef<THREE.Mesh>(null);
  const current = useRef<{ name: string; action: THREE.AnimationAction } | null>(null);
  const first = useRef(true);
  const prev = useMemo(() => new THREE.Vector3(), []);
  const yaw = THREE.MathUtils.degToRad(spec.yawOffsetDeg ?? manifest.yawOffsetDeg ?? 0);

  const streamMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#f4f8ff", transparent: true, opacity: 0.7, depthWrite: false }),
    [],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const s = get();
    const g = root.current;
    if (!g) return;
    if (!s || s.visible === false) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const k = first.current || reduced ? 1 : 1 - Math.exp(-delta * 6);
    prev.copy(g.position);
    g.position.x += (s.pos[0] - g.position.x) * k;
    g.position.y += (s.pos[1] - g.position.y) * k;
    g.position.z += (s.pos[2] - g.position.z) * k;
    let dr = s.rotY - g.rotation.y;
    dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    g.rotation.y += dr * k;

    const speed = first.current ? 0 : Math.hypot(g.position.x - prev.x, g.position.z - prev.z) / Math.max(delta, 1e-3);
    const dy = prevTargetY.current == null ? 0 : s.pos[1] - prevTargetY.current;
    prevTargetY.current = s.pos[1];
    first.current = false;

    const inWater = s.pos[1] <= GHAT.waterStandY + 0.2;
    // soaks quickly, dries over ~2 minutes
    wet.value = inWater ? Math.min(1, wet.value + delta * 1.5) : Math.max(0, wet.value - delta / 120);
    const candidates = clipCandidates(s.pose, {
      moving: speed > 0.15,
      descending: dy < -0.002,
      inWater,
    });
    const name = candidates.find((c) => actions.has(c)) ?? (actions.has("idle_stand") ? "idle_stand" : actions.keys().next().value);
    if (name && current.current?.name !== name) {
      const next = actions.get(name)!;
      next.reset().setEffectiveWeight(1).fadeIn(reduced ? 0 : 0.35).play();
      current.current?.action.fadeOut(reduced ? 0 : 0.35);
      current.current = { name, action: next };
    }
    const cur = current.current;
    if (cur) cur.action.timeScale = LOCOMOTION.includes(cur.name as ClipName) ? THREE.MathUtils.clamp(speed / manifest.walkSpeed, 0.6, 1.6) : 1;
    // Reduced motion: hold the pose (first frame of each clip), no looping motion.
    mixer.update(reduced ? 0 : delta);
    g.updateMatrixWorld(true);
    if (ground && legs && g.parent) {
      // pelvis follows the lower foot's ground; the other leg is lifted onto its step
      for (let i = 0; i < 2; i++) {
        legs[i].foot.getWorldPosition(fk.w);
        g.parent.worldToLocal(fk.w);
        fk.gy[i] = ground(fk.w.x, fk.w.z);
      }
      const base = Math.min(fk.gy[0], fk.gy[1]);
      footBase.current = footBase.current == null || reduced ? base : footBase.current + (base - footBase.current) * (1 - Math.exp(-delta * 14));
      g.position.y = footBase.current;
      g.updateMatrixWorld(true);
      fk.side.set(1, 0, 0).applyQuaternion(g.getWorldQuaternion(ik.q));
      for (let i = 0; i < 2; i++) {
        const lift = fk.gy[i] - footBase.current;
        if (lift > 0.01) {
          legs[i].foot.getWorldPosition(ik.t);
          ik.t.y += lift;
          solveTwoBone(legs[i], ik.t, fk.side);
        }
      }
    }
    if (hands) applyGrips(grip, hands, s, g, reduced ? 1 : delta, WATER_Y);
    for (const f of afterMix) f();

    for (const [h, node] of Object.entries(holds.current)) if (node) node.visible = h === s.hold;
    if (stream.current) stream.current.visible = !!s.stream && !hands;
    if (fall.current) {
      const st = grip.stream;
      fall.current.visible = !!s.stream && st.ok;
      if (st.ok) {
        fall.current.position.set(st.p.x, st.p.y - st.len / 2, st.p.z);
        fall.current.scale.set(1, st.len, 1);
      }
    }
    publishGrips(s, g, bones);
  });

  return (
    <group ref={root}>
      <group rotation={[0, yaw, 0]} position={[0, lift, 0]} scale={scale}>
        <primitive object={model} />
      </group>
      {hands && (
        // arghya stream: from the lota's lip straight down to the river (unit height, scaled)
        <mesh ref={fall} material={streamMat} visible={false}>
          <cylinderGeometry args={[0.011, 0.006, 1, 8, 1, true]} />
        </mesh>
      )}
      {(Object.keys(HOLD_BONE) as Exclude<HoldId, "none">[]).map((h) => {
        const offset = spec.props?.[h];
        const where = HOLD_BONE[h];
        const content = (
          <group ref={(n) => void (holds.current[h] = n)} visible={false}>
            <HeldProp hold={h} />
          </group>
        );
        if (where === "both" && !offset?.bone) {
          if (!bones.left || !bones.right) return null;
          return (
            <BothHandsSocket key={h} left={bones.left} right={bones.right} root={root} afterMix={afterMix} offset={offset} frame={hands ? grip.soop : undefined}>
              {content}
            </BothHandsSocket>
          );
        }
        if (h === "lota" && hands && !offset?.bone) {
          return (
            <FrameSocket key={h} frame={grip.lota} afterMix={afterMix} offset={offset}>
              {content}
            </FrameSocket>
          );
        }
        const bone = (offset?.bone && model.getObjectByName(offset.bone)) || (where === "both" ? bones.right : bones[where]);
        if (!bone) return null;
        return (
          <BoneSocket key={h} bone={bone} offset={offset}>
            <group ref={(n) => void (holds.current[h] = n)} visible={false}>
              <HeldProp hold={h} />
              {h === "lota" && (
                <mesh ref={stream} material={streamMat} position={[0, -0.5, 0.08]} visible={false}>
                  <cylinderGeometry args={[0.012, 0.018, 1.0, 6, 1, true]} />
                </mesh>
              )}
            </group>
          </BoneSocket>
        );
      })}
    </group>
  );
}
