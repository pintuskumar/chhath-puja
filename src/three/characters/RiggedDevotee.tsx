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

const RIGHT_GRIP = ["hand_r_grip", "hand_r", "mixamorigRightHand", "RightHand"];
const LEFT_GRIP = ["hand_l_grip", "hand_l", "mixamorigLeftHand", "LeftHand"];
const HEAD = ["head", "mixamorigHead", "Head"];

/** Default attachment bone per held item. */
const HOLD_BONE: Record<Exclude<HoldId, "none">, "right" | "left" | "head"> = {
  soop: "right",
  "soop-filled": "right",
  lota: "right",
  daura: "head",
  broom: "right",
  ladle: "right",
  cane: "left",
  thekua: "right",
  diya: "right",
  wood: "head",
};

function findBone(root: THREE.Object3D, names: string[]) {
  for (const n of names) {
    const hit = root.getObjectByName(n);
    if (hit) return hit;
  }
  return null;
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

interface Props {
  get: () => ActorState | undefined;
  spec: CharacterSpec;
  manifest: ModelManifest;
  reduced?: boolean;
  quality: "low" | "medium" | "high";
}

export function RiggedDevotee({ get, spec, manifest, reduced, quality }: Props) {
  const src = quality === "low" && spec.srcLow ? spec.srcLow : spec.src;
  // (draco=false: no CDN decoder; meshopt=true: decoder is bundled)
  const gltf = useGLTF(modelUrl(src), false, true);
  const clipsGltf = useGLTF(modelUrl(manifest.clips!), false, true);
  const shadows = quality === "high";

  const { model, scale, lift } = useMemo(() => {
    const m = cloneSkinned(gltf.scene) as THREE.Object3D;
    m.traverse((o) => {
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
  }, [gltf.scene, shadows, spec.height]);

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const actions = useMemo(() => {
    const map = new Map<string, THREE.AnimationAction>();
    for (const clip of [...clipsGltf.animations, ...gltf.animations]) {
      const c = clip.clone();
      // Clips must be in-place: drop horizontal root motion if present (choreography moves the actor).
      c.tracks = c.tracks.filter((t) => !/^(root|Root|Armature)\.position$/.test(t.name));
      map.set(normalizeClipName(c.name), mixer.clipAction(c));
    }
    return map;
  }, [mixer, clipsGltf.animations, gltf.animations]);
  useEffect(() => {
    // Mount counter for the browser smoke test (verifies rigged characters actually render).
    const w = window as Window & { __riggedCharacters?: number };
    w.__riggedCharacters = (w.__riggedCharacters ?? 0) + 1;
    return () => {
      w.__riggedCharacters = (w.__riggedCharacters ?? 1) - 1;
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    };
  }, [mixer, model]);

  const bones = useMemo(
    () => ({ right: findBone(model, RIGHT_GRIP), left: findBone(model, LEFT_GRIP), head: findBone(model, HEAD) }),
    [model],
  );

  const root = useRef<THREE.Group>(null);
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
    const dy = g.position.y - prev.y;
    first.current = false;

    const candidates = clipCandidates(s.pose, {
      moving: speed > 0.15,
      descending: dy < -0.002,
      inWater: s.pos[1] <= GHAT.waterStandY + 0.2,
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

    for (const [h, node] of Object.entries(holds.current)) if (node) node.visible = h === s.hold;
    if (stream.current) stream.current.visible = !!s.stream;
  });

  return (
    <group ref={root}>
      <group rotation={[0, yaw, 0]} position={[0, lift, 0]} scale={scale}>
        <primitive object={model} />
      </group>
      {(Object.keys(HOLD_BONE) as Exclude<HoldId, "none">[]).map((h) => {
        const offset = spec.props?.[h];
        const bone = (offset?.bone && model.getObjectByName(offset.bone)) || bones[HOLD_BONE[h]];
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
