"use client";

/**
 * Stylised low-poly devotee. Attire follows common Chhath imagery:
 * vratis in yellow / saffron / red sarees with the pallu over the head,
 * men in dhoti-kurta. Poses are blended per frame from the choreography.
 */
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mat, lathe } from "./materials";
import { Soop, Lota, Daura, Sugarcane, Thekua, Diya } from "./props";
import type { ActorState, LookId, PoseId, HoldId } from "./choreography";

interface Look {
  female: boolean;
  garment: string;
  upper: string;
  border: string;
  skin: string;
  scale: number;
}

export const LOOKS: Record<LookId, Look> = {
  vrati: { female: true, garment: "#F6B93B", upper: "#F6B93B", border: "#c0182a", skin: "#a8714d", scale: 1 },
  vrati2: { female: true, garment: "#E97824", upper: "#E97824", border: "#F6B93B", skin: "#8d5a3b", scale: 0.98 },
  vrati3: { female: true, garment: "#d8352a", upper: "#d8352a", border: "#F6B93B", skin: "#b07a55", scale: 1.01 },
  elder: { female: true, garment: "#681C29", upper: "#681C29", border: "#F6B93B", skin: "#9a6646", scale: 0.96 },
  woman: { female: true, garment: "#c2416b", upper: "#c2416b", border: "#F6B93B", skin: "#a06a48", scale: 0.97 },
  man: { female: false, garment: "#f3ead6", upper: "#efe2c4", border: "#c0182a", skin: "#8f5d3e", scale: 1.06 },
  youngman: { female: false, garment: "#f3ead6", upper: "#E97824", border: "#F6B93B", skin: "#a26b48", scale: 1.04 },
  child: { female: false, garment: "#276C80", upper: "#F6B93B", border: "#276C80", skin: "#a8714d", scale: 0.62 },
};

/** Target joint values per pose. Arm pitch: negative = forward/up. */
interface PoseT {
  lp: number; // left shoulder pitch
  rp: number;
  lr: number; // shoulder roll (inward +)
  rr: number;
  le: number; // elbow
  re: number;
  torso: number; // forward lean
  sit: number; // 0 standing .. 1 seated cross-legged
  head: number;
}
const P = (o: Partial<PoseT>): PoseT => ({ lp: 0, rp: 0, lr: 0.05, rr: 0.05, le: -0.15, re: -0.15, torso: 0, sit: 0, head: 0, ...o });

const POSES: Record<PoseId, PoseT> = {
  idle: P({}),
  walk: P({}),
  namaste: P({ lp: -0.55, rp: -0.55, lr: 0.55, rr: 0.55, le: -1.75, re: -1.75 }),
  "sit-namaste": P({ lp: -0.55, rp: -0.55, lr: 0.55, rr: 0.55, le: -1.75, re: -1.75, sit: 1 }),
  sweep: P({ lp: -0.7, rp: -0.5, lr: 0.3, rr: 0.3, le: -0.4, re: -0.3, torso: 0.45, head: -0.2 }),
  crouch: P({ lp: -0.9, rp: -0.9, lr: 0.15, rr: 0.15, le: -0.4, re: -0.4, torso: 0.35, sit: 0.65 }),
  stir: P({ lp: -0.4, rp: -1.0, lr: 0.2, rr: 0.2, le: -0.9, re: -0.6, torso: 0.25, sit: 1 }),
  eat: P({ lp: -0.5, rp: -0.6, lr: 0.2, rr: 0.25, le: -0.6, re: -1.9, torso: 0.15, sit: 1 }),
  sit: P({ lp: -0.35, rp: -0.35, lr: 0.3, rr: 0.3, le: -0.9, re: -0.9, sit: 1 }),
  arrange: P({ lp: -1.0, rp: -1.1, lr: 0.15, rr: 0.15, le: -0.3, re: -0.4, torso: 0.4, sit: 1, head: 0.2 }),
  "carry-head": P({ lp: -2.85, rp: -2.85, lr: 0.25, rr: 0.25, le: -0.6, re: -0.6 }),
  "hold-soop": P({ lp: -0.95, rp: -0.95, lr: 0.25, rr: 0.25, le: -0.75, re: -0.75 }),
  "raise-soop": P({ lp: -1.35, rp: -1.35, lr: 0.22, rr: 0.22, le: -0.45, re: -0.45, head: -0.15 }),
  pour: P({ lp: -0.3, rp: -1.25, lr: 0.1, rr: 0.15, le: -0.3, re: -0.25, torso: 0.1 }),
  fill: P({ lp: -0.9, rp: -1.1, lr: 0.2, rr: 0.2, le: -0.3, re: -0.3, torso: 0.6, sit: 0.35 }),
  shoo: P({ lp: -2.2, rp: -2.2, lr: -0.5, rr: -0.5, le: -0.3, re: -0.3 }),
  bow: P({ lp: -1.1, rp: -1.1, lr: 0.2, rr: 0.2, le: -0.2, re: -0.2, torso: 1.05, sit: 0.35, head: -0.3 }),
  offer: P({ lp: -0.9, rp: -0.9, lr: 0.35, rr: 0.35, le: -0.8, re: -0.8 }),
  give: P({ lp: -0.3, rp: -1.0, lr: 0.1, rr: 0.15, le: -0.2, re: -0.4 }),
};

function damp(a: number, b: number, k: number) {
  return a + (b - a) * k;
}

export function Devotee({ get, reduced }: { get: () => ActorState | undefined; reduced?: boolean }) {
  const initial = get();
  const look = LOOKS[initial?.look ?? "vrati"];
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const skirt = useRef<THREE.Mesh>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lS = useRef<THREE.Group>(null);
  const rS = useRef<THREE.Group>(null);
  const lE = useRef<THREE.Group>(null);
  const rE = useRef<THREE.Group>(null);
  const holds = useRef<Partial<Record<HoldId, THREE.Group | null>>>({});
  const stream = useRef<THREE.Mesh>(null);
  const cur = useRef<PoseT>({ ...POSES[initial?.pose ?? "idle"] });
  const first = useRef(true);

  const skirtGeo = useMemo(
    () =>
      look.female
        ? lathe([
            [0, 0],
            [0.3, 0],
            [0.27, 0.3],
            [0.22, 0.65],
            [0.19, 0.95],
            [0, 0.95],
          ], 14)
        : lathe([
            [0, 0],
            [0.2, 0],
            [0.2, 0.35],
            [0.2, 0.8],
            [0.18, 0.95],
            [0, 0.95],
          ], 12),
    [look.female],
  );

  const gMat = mat.cloth(look.garment);
  const uMat = mat.cloth(look.upper);
  const bMat = mat.cloth(look.border);
  const sMat = mat.skin(look.skin);
  const streamMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#f4f8ff", transparent: true, opacity: 0.7, depthWrite: false }),
    [],
  );

  useFrame(({ clock }, delta) => {
    const s = get();
    const g = root.current;
    if (!g) return;
    if (!s || s.visible === false) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const k = first.current || reduced ? 1 : 1 - Math.exp(-delta * 6);
    first.current = false;

    // position / facing
    g.position.x = damp(g.position.x, s.pos[0], k);
    g.position.y = damp(g.position.y, s.pos[1], k);
    g.position.z = damp(g.position.z, s.pos[2], k);
    let dr = s.rotY - g.rotation.y;
    dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    g.rotation.y += dr * k;

    // pose blend
    const target = POSES[s.pose];
    const c = cur.current;
    (Object.keys(c) as (keyof PoseT)[]).forEach((key) => (c[key] = damp(c[key], target[key], k)));

    const t = clock.elapsedTime;
    const walking = s.pose === "walk" || (s.pose === "carry-head" && Math.abs(dr) < 0.5);
    const bob = walking && !reduced ? Math.abs(Math.sin(t * 6)) * 0.035 : 0;
    const breathe = reduced ? 0 : Math.sin(t * 1.6) * 0.008;

    // arm motion layers
    let lp = c.lp;
    let rp = c.rp;
    let re = c.re;
    if (!reduced) {
      if (s.pose === "walk") {
        lp += Math.sin(t * 6) * 0.35;
        rp -= Math.sin(t * 6) * 0.35;
      }
      if (s.pose === "sweep") {
        lp += Math.sin(t * 4) * 0.3;
        rp += Math.sin(t * 4) * 0.3;
      }
      if (s.pose === "stir") rp += Math.sin(t * 3) * 0.25;
      if (s.pose === "eat") re += (Math.sin(t * 1.4) * 0.5 + 0.5) * 0.4;
      if (s.pose === "arrange") {
        lp += Math.sin(t * 1.8) * 0.15;
        rp += Math.cos(t * 1.6) * 0.15;
      }
      if (s.pose === "shoo") {
        lp += Math.sin(t * 7) * 0.4;
        rp -= Math.sin(t * 7) * 0.4;
      }
    }

    if (body.current) body.current.position.y = bob - c.sit * 0.6 + breathe;
    if (skirt.current) {
      skirt.current.scale.set(1 + c.sit * 0.55, 1 - c.sit * 0.62, 1 + c.sit * 0.6);
      skirt.current.position.y = c.sit * 0.6;
    }
    if (torso.current) torso.current.rotation.x = c.torso;
    if (head.current) head.current.rotation.x = c.head;
    if (lS.current) {
      lS.current.rotation.x = lp;
      lS.current.rotation.z = -c.lr;
    }
    if (rS.current) {
      rS.current.rotation.x = rp;
      rS.current.rotation.z = c.rr;
    }
    if (lE.current) lE.current.rotation.x = c.le;
    if (rE.current) rE.current.rotation.x = re;

    const hs = holds.current;
    (Object.keys(hs) as HoldId[]).forEach((h) => {
      const node = hs[h];
      if (node) node.visible = h === s.hold;
    });
    const filled = hs["soop-filled"];
    if (filled) {
      // soop height follows hold vs raise
      const raise = s.pose === "raise-soop" ? 1 : 0;
      filled.position.y = damp(filled.position.y, 1.12 + raise * 0.22, k);
      filled.position.z = damp(filled.position.z, 0.4 + raise * 0.06, k);
    }
    if (stream.current) {
      const on = !!s.stream;
      stream.current.visible = on;
      if (on && !reduced) stream.current.scale.x = stream.current.scale.z = 1 + Math.sin(t * 20) * 0.15;
    }
  });

  const arm = (side: -1 | 1, sRef: RefObject<THREE.Group | null>, eRef: RefObject<THREE.Group | null>) => (
    <group ref={sRef} position={[side * 0.2, 0.42, 0]}>
      <mesh material={uMat} position={[0, -0.13, 0]}>
        <capsuleGeometry args={[0.045, 0.2, 3, 6]} />
      </mesh>
      <group ref={eRef} position={[0, -0.27, 0]}>
        <mesh material={sMat} position={[0, -0.12, 0]}>
          <capsuleGeometry args={[0.038, 0.19, 3, 6]} />
        </mesh>
      </group>
    </group>
  );

  return (
    <group ref={root} scale={look.scale}>
      {/* contact shadow (cheap, replaces shadow maps on low/medium) */}
      <mesh material={mat.shadow()} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.36, 16]} />
      </mesh>
      <group ref={body}>
        <mesh ref={skirt} geometry={skirtGeo} material={gMat} />
        {/* border band at hem */}
        <mesh material={bMat} position={[0, 0.03, 0]}>
          <cylinderGeometry args={[look.female ? 0.305 : 0.205, look.female ? 0.305 : 0.205, 0.05, 14, 1, true]} />
        </mesh>
        <group ref={torso} position={[0, 0.92, 0]}>
          <mesh material={uMat} position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.17, 0.19, 0.46, 10]} />
          </mesh>
          {look.female && (
            // pallu across the torso
            <mesh material={bMat} position={[0.02, 0.24, 0.12]} rotation={[0.1, 0, 0.75]}>
              <boxGeometry args={[0.08, 0.55, 0.04]} />
            </mesh>
          )}
          {!look.female && look.upper !== "#E97824" && (
            // gamchha over the shoulder
            <mesh material={mat.cloth("#b3202f")} position={[-0.12, 0.38, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.06, 0.25, 0.3]} />
            </mesh>
          )}
          {arm(-1, lS, lE)}
          {arm(1, rS, rE)}
          <group ref={head} position={[0, 0.56, 0]}>
            <mesh material={sMat}>
              <sphereGeometry args={[0.11, 14, 12]} />
            </mesh>
            {look.female ? (
              <mesh material={gMat} position={[0, 0.02, -0.01]} scale={[1.15, 1.1, 1.2]}>
                <sphereGeometry args={[0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              </mesh>
            ) : (
              <mesh material={mat.hair()} position={[0, 0.03, -0.01]} scale={[1.02, 0.9, 1.05]}>
                <sphereGeometry args={[0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
              </mesh>
            )}
            {look.female && (
              // sindoor / bindi accent
              <mesh material={mat.sindoor()} position={[0, 0.03, 0.105]}>
                <sphereGeometry args={[0.012, 6, 6]} />
              </mesh>
            )}
          </group>
        </group>

        {/* held items (body space) */}
        <group ref={(n) => void (holds.current["soop-filled"] = n)} position={[0, 1.12, 0.4]} rotation={[-0.35, 0, 0]} visible={false}>
          <Soop filled scale={0.85} />
        </group>
        <group ref={(n) => void (holds.current.soop = n)} position={[0, 1.0, 0.32]} rotation={[-0.2, 0, 0]} visible={false}>
          <Soop scale={0.75} />
        </group>
        <group ref={(n) => void (holds.current.daura = n)} position={[0, 1.66, 0]} visible={false}>
          <Daura covered scale={0.8} />
        </group>
        <group ref={(n) => void (holds.current.lota = n)} position={[0.22, 1.12, 0.42]} rotation={[1.9, 0, 0]} visible={false}>
          <Lota scale={1.1} />
        </group>
        <mesh ref={stream} material={streamMat} position={[0.22, 0.6, 0.62]} visible={false}>
          <cylinderGeometry args={[0.012, 0.018, 1.0, 6, 1, true]} />
        </mesh>
        <group ref={(n) => void (holds.current.broom = n)} position={[0, 0.5, 0.45]} rotation={[0.9, 0, 0]} visible={false}>
          <mesh material={mat.wood()}>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 5]} />
          </mesh>
          <mesh material={mat.wheat()} position={[0, -0.38, 0]}>
            <coneGeometry args={[0.1, 0.25, 8, 1, true]} />
          </mesh>
        </group>
        <group ref={(n) => void (holds.current.ladle = n)} position={[0.15, 0.62, 0.38]} rotation={[0.6, 0, 0]} visible={false}>
          <mesh material={mat.wood()}>
            <cylinderGeometry args={[0.01, 0.01, 0.45, 5]} />
          </mesh>
        </group>
        <group ref={(n) => void (holds.current.cane = n)} position={[0.25, 0.1, 0.15]} visible={false}>
          <Sugarcane height={2.0} />
        </group>
        <group ref={(n) => void (holds.current.thekua = n)} position={[0.12, 1.05, 0.45]} visible={false}>
          <Thekua />
        </group>
        <group ref={(n) => void (holds.current.diya = n)} position={[0, 1.02, 0.4]} visible={false}>
          <Diya scale={1.1} />
        </group>
        <group ref={(n) => void (holds.current.wood = n)} position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
          {[-0.06, 0, 0.06].map((z, i) => (
            <mesh key={i} material={mat.wood()} position={[0, 0, z]}>
              <cylinderGeometry args={[0.03, 0.035, 0.8, 5]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
