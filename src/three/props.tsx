"use client";

/**
 * Procedural low-poly ritual props. These are labelled in the UI as stylised models
 * generated in code — they stand in until reviewed GLB assets are produced
 * (see docs/ASSET_MANIFEST.md). Each prop is a few meshes with shared materials.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { mat, lathe } from "./materials";
import { glowTexture } from "./textures";
import type { PropModel } from "@/content/types";

export type GroupProps = ThreeElements["group"];

/* ───────── Flame & light ───────── */

export function Flame({ size = 1, light = false, ...p }: GroupProps & { size?: number; light?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Sprite>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 9 + seed;
    const f = 1 + Math.sin(t) * 0.08 + Math.sin(t * 2.3) * 0.05;
    if (ref.current) ref.current.scale.set(1, f, 1);
    if (glow.current) glow.current.material.opacity = 0.55 + Math.sin(t * 1.7) * 0.08;
  });
  const spriteMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: "#ffb04a",
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  return (
    <group {...p} scale={size}>
      <mesh ref={ref} position={[0, 0.03, 0]} material={mat.flame()}>
        <coneGeometry args={[0.014, 0.06, 6]} />
      </mesh>
      <sprite ref={glow} material={spriteMat} scale={[0.22, 0.22, 0.22]} position={[0, 0.04, 0]} />
      {light && <pointLight color="#ff9a3c" intensity={1.2} distance={3} decay={2} position={[0, 0.1, 0]} />}
    </group>
  );
}

export function Diya({ lit = true, light = false, ...p }: GroupProps & { lit?: boolean; light?: boolean }) {
  const geo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.05, 0],
        [0.08, 0.02],
        [0.09, 0.045],
        [0.085, 0.05],
        [0.065, 0.028],
        [0, 0.022],
      ]),
    [],
  );
  return (
    <group {...p}>
      <mesh geometry={geo} material={mat.clay()} />
      {lit && <Flame position={[0.05, 0.035, 0]} light={light} />}
    </group>
  );
}

/* ───────── Bamboo: soop & daura ───────── */

function useSoopGeometry() {
  return useMemo(() => {
    const side = new THREE.Shape();
    side.moveTo(0, 0);
    side.lineTo(0.5, 0);
    side.lineTo(0, 0.15);
    side.closePath();
    const sideGeo = new THREE.ExtrudeGeometry(side, { depth: 0.015, bevelEnabled: false });
    const back = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 18, 1, true, -Math.PI / 2, Math.PI);
    return { sideGeo, back };
  }, []);
}

export function Soop({ filled = false, ...p }: GroupProps & { filled?: boolean }) {
  const { sideGeo, back } = useSoopGeometry();
  return (
    <group {...p}>
      {/* base */}
      <mesh material={mat.bamboo()} position={[0, 0.01, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.5]} />
      </mesh>
      {/* curved back wall */}
      <mesh geometry={back} material={mat.bamboo()} position={[0, 0.085, -0.25]} scale={[1, 1, 0.35]} />
      {/* tapering sides */}
      <mesh geometry={sideGeo} material={mat.bamboo()} position={[-0.3, 0.01, -0.25]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh geometry={sideGeo} material={mat.bamboo()} position={[0.285, 0.01, -0.25]} rotation={[0, -Math.PI / 2, 0]} />
      {/* rim binding */}
      <mesh material={mat.bambooSolid()} position={[0, 0.02, 0.25]}>
        <boxGeometry args={[0.62, 0.025, 0.025]} />
      </mesh>
      {filled && <SoopContents />}
    </group>
  );
}

function SoopContents() {
  return (
    <group position={[0, 0.03, 0]}>
      <Coconut position={[0, 0.07, -0.1]} scale={0.8} />
      <BananaBunch position={[-0.17, 0.02, 0.0]} scale={0.55} rotation={[0, 0.6, 0]} />
      {[
        [0.12, 0.08],
        [0.2, -0.02],
        [0.08, -0.05],
        [0.16, 0.14],
      ].map(([x, z], i) => (
        <Thekua key={i} position={[x, 0.012 + i * 0.004, z]} rotation={[0, i, 0]} scale={0.7} />
      ))}
      <mesh material={mat.citron()} position={[-0.05, 0.05, 0.13]}>
        <sphereGeometry args={[0.05, 12, 10]} />
      </mesh>
      <mesh material={mat.chestnut()} position={[0.02, 0.02, 0.16]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.025, 8, 6]} />
      </mesh>
      <Diya position={[0.18, 0, 0.17]} scale={0.6} />
    </group>
  );
}

export function Daura({ filled = true, covered = false, ...p }: GroupProps & { filled?: boolean; covered?: boolean }) {
  return (
    <group {...p}>
      <mesh material={mat.bamboo()} position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.42, 0.32, 0.32, 20, 1, true]} />
      </mesh>
      <mesh material={mat.bamboo()} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 20]} />
      </mesh>
      <mesh material={mat.bambooSolid()} position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.02, 6, 24]} />
      </mesh>
      {filled && !covered && (
        <group position={[0, 0.2, 0]}>
          <Soop position={[0, 0.02, 0]} scale={0.95} filled />
          <BananaBunch position={[0.22, 0.05, -0.12]} scale={0.7} />
          <Sugarcane position={[-0.25, -0.15, -0.15]} height={0.9} rotation={[0.2, 0, 0.35]} />
        </group>
      )}
      {covered && (
        <mesh material={mat.cloth("#F6B93B")} position={[0, 0.34, 0]} scale={[1, 0.25, 1]}>
          <sphereGeometry args={[0.43, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      )}
    </group>
  );
}

/* ───────── Offerings ───────── */

export function Thekua(p: GroupProps) {
  return (
    <group {...p}>
      <mesh material={mat.thekua()} scale={[1.3, 1, 1]}>
        <cylinderGeometry args={[0.06, 0.062, 0.02, 14]} />
      </mesh>
    </group>
  );
}

export function Coconut(p: GroupProps) {
  return (
    <group {...p}>
      <mesh material={mat.coconut()} scale={[1, 1.15, 1]}>
        <icosahedronGeometry args={[0.08, 1]} />
      </mesh>
      <mesh material={mat.sindoor()} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[0.078, 0.006, 4, 16]} />
      </mesh>
    </group>
  );
}

export function BananaBunch({ ripe = false, ...p }: GroupProps & { ripe?: boolean }) {
  const fingers = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);
  return (
    <group {...p}>
      {fingers.map((i) => (
        <mesh
          key={i}
          material={ripe ? mat.bananaRipe() : mat.bananaRaw()}
          position={[(i - 3) * 0.035, 0.03 + Math.abs(i - 3) * -0.004, 0]}
          rotation={[0.25, 0, (i - 3) * 0.12]}
        >
          <capsuleGeometry args={[0.018, 0.13, 3, 6]} />
        </mesh>
      ))}
      <mesh material={mat.wood()} position={[0, 0.1, -0.03]}>
        <cylinderGeometry args={[0.012, 0.015, 0.06, 6]} />
      </mesh>
    </group>
  );
}

export function Sugarcane({ height = 2.2, leaves = true, ...p }: GroupProps & { height?: number; leaves?: boolean }) {
  const rings = Math.max(3, Math.round(height / 0.25));
  return (
    <group {...p}>
      <mesh material={mat.caneStalk()} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.022, 0.026, height, 6]} />
      </mesh>
      {Array.from({ length: rings }, (_, i) => (
        <mesh key={i} material={mat.wood()} position={[0, (i + 0.5) * (height / rings), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.025, 0.004, 3, 8]} />
        </mesh>
      ))}
      {leaves &&
        [0, 1.3, 2.6, 3.9, 5.1].map((a, i) => (
          <mesh
            key={i}
            material={mat.caneLeaf()}
            position={[Math.cos(a) * 0.12, height + 0.05 - i * 0.04, Math.sin(a) * 0.12]}
            rotation={[Math.sin(a) * 0.9, a, Math.cos(a) * 0.9]}
          >
            <planeGeometry args={[0.05, 0.55]} />
          </mesh>
        ))}
    </group>
  );
}

export function Fruits(p: GroupProps) {
  return (
    <group {...p}>
      <BananaBunch position={[-0.12, 0, 0]} />
      <mesh material={mat.citron()} position={[0.1, 0.07, 0.02]}>
        <sphereGeometry args={[0.075, 14, 12]} />
      </mesh>
      <mesh material={mat.sweetPotato()} position={[0.02, 0.03, 0.13]} rotation={[0, 0.4, Math.PI / 2]}>
        <capsuleGeometry args={[0.03, 0.08, 3, 8]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={mat.chestnut()} position={[0.16 + i * 0.05, 0.02, 0.12 - i * 0.03]} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.028, 8, 6]} />
        </mesh>
      ))}
      {/* fresh turmeric/ginger plant */}
      {[0, 0.5, -0.4].map((r, i) => (
        <mesh key={i} material={mat.leaf()} position={[-0.02 + i * 0.03, 0.18, -0.1]} rotation={[r, 0, r * 0.6]}>
          <planeGeometry args={[0.04, 0.3]} />
        </mesh>
      ))}
    </group>
  );
}

export function Prasad(p: GroupProps) {
  return <Soop filled {...p} />;
}

/* ───────── Vessels ───────── */

export function Kalash({ leaves = true, ...p }: GroupProps & { leaves?: boolean }) {
  const geo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.07, 0],
        [0.13, 0.06],
        [0.15, 0.14],
        [0.12, 0.22],
        [0.065, 0.27],
        [0.075, 0.3],
        [0.06, 0.3],
      ]),
    [],
  );
  return (
    <group {...p}>
      <mesh geometry={geo} material={mat.brass()} />
      {leaves &&
        Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={mat.leaf()}
              position={[Math.cos(a) * 0.06, 0.33, Math.sin(a) * 0.06]}
              rotation={[Math.sin(a) * 0.9, -a, Math.cos(a) * -0.9]}
              scale={[0.5, 1, 1]}
            >
              <circleGeometry args={[0.07, 6]} />
            </mesh>
          );
        })}
      <Coconut position={[0, 0.38, 0]} scale={0.7} />
    </group>
  );
}

export function Lota({ metal = "brass", ...p }: GroupProps & { metal?: "brass" | "copper" }) {
  const geo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.05, 0],
        [0.085, 0.04],
        [0.09, 0.08],
        [0.06, 0.13],
        [0.04, 0.15],
        [0.055, 0.18],
        [0.05, 0.18],
      ]),
    [],
  );
  return (
    <group {...p}>
      <mesh geometry={geo} material={metal === "brass" ? mat.brass() : mat.copper()} />
    </group>
  );
}

export function Handi({ lid = false, steam = 0, ...p }: GroupProps & { lid?: boolean; steam?: number }) {
  const geo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.1, 0.01],
        [0.2, 0.09],
        [0.22, 0.17],
        [0.17, 0.26],
        [0.14, 0.29],
        [0.16, 0.31],
      ]),
    [],
  );
  return (
    <group {...p}>
      <mesh geometry={geo} material={mat.clay()} />
      {lid && (
        <mesh material={mat.clayLight()} position={[0, 0.31, 0]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[0.16, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      )}
      {steam > 0 && <Steam position={[0, 0.32, 0]} amount={steam} />}
    </group>
  );
}

export function Kadhai({ contents = "kheer", ...p }: GroupProps & { contents?: "kheer" | "dal" | "none" }) {
  const geo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.12, 0.01],
        [0.24, 0.06],
        [0.28, 0.12],
        [0.29, 0.13],
      ]),
    [],
  );
  return (
    <group {...p}>
      <mesh geometry={geo} material={mat.brass()} />
      {contents !== "none" && (
        <mesh material={contents === "kheer" ? mat.kheer() : mat.dal()} position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.24, 20]} />
        </mesh>
      )}
    </group>
  );
}

export function Matka(p: GroupProps) {
  const geo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.12, 0.01],
        [0.25, 0.14],
        [0.26, 0.26],
        [0.18, 0.4],
        [0.12, 0.44],
        [0.14, 0.48],
      ]),
    [],
  );
  return (
    <group {...p}>
      <mesh geometry={geo} material={mat.clay()} />
    </group>
  );
}

export function Chulha({ fire = 1, ...p }: GroupProps & { fire?: number }) {
  const u = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.32, 0);
    s.lineTo(0.32, 0);
    s.lineTo(0.32, 0.32);
    s.lineTo(0.2, 0.32);
    s.lineTo(0.2, 0.08);
    s.absarc(0, 0.08, 0.2, 0, Math.PI, false);
    s.lineTo(-0.2, 0.32);
    s.lineTo(-0.32, 0.32);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  }, []);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (light.current) light.current.intensity = fire * (1.6 + Math.sin(clock.elapsedTime * 11) * 0.25 + Math.sin(clock.elapsedTime * 5.3) * 0.2);
  });
  return (
    <group {...p}>
      <mesh geometry={u} material={mat.plaster()} position={[0, 0, -0.25]} />
      {fire > 0 && (
        <group position={[0, 0.02, 0.05]}>
          {[-0.08, 0, 0.08].map((x, i) => (
            <mesh key={i} material={mat.flame()} position={[x, 0.08, 0]} scale={[fire, fire * (1 + i * 0.2), fire]}>
              <coneGeometry args={[0.05, 0.18, 6]} />
            </mesh>
          ))}
          {[-0.1, 0.1].map((x, i) => (
            <mesh key={i} material={mat.wood()} position={[x, 0.03, 0.2]} rotation={[Math.PI / 2 - 0.15, 0, x * 2]}>
              <cylinderGeometry args={[0.025, 0.03, 0.5, 6]} />
            </mesh>
          ))}
          <pointLight ref={light} color="#ff8a2a" distance={4} decay={2} position={[0, 0.2, 0.25]} />
        </group>
      )}
    </group>
  );
}

/** A few drifting steam puffs — capped at 6 sprites. */
export function Steam({ amount = 1, ...p }: GroupProps & { amount?: number }) {
  const group = useRef<THREE.Group>(null);
  const m = useMemo(
    () => new THREE.SpriteMaterial({ map: glowTexture(), color: "#ffffff", transparent: true, opacity: 0.25, depthWrite: false }),
    [],
  );
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.35 + i / 6) % 1;
      c.position.set(Math.sin(t * 6 + i) * 0.05, t * 0.6, Math.cos(t * 5 + i) * 0.04);
      const s = 0.12 + t * 0.3;
      c.scale.set(s, s, s);
      ((c as THREE.Sprite).material as THREE.SpriteMaterial).opacity = 0.3 * amount * (1 - t);
    });
  });
  const mats = useMemo(() => Array.from({ length: 6 }, () => m.clone()), [m]);
  return (
    <group ref={group} {...p}>
      {mats.map((mm, i) => (
        <sprite key={i} material={mm} />
      ))}
    </group>
  );
}

/* ───────── Food ───────── */

export function Lauki(p: GroupProps) {
  return (
    <group {...p}>
      <mesh material={mat.lauki()} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}>
        <capsuleGeometry args={[0.06, 0.32, 4, 10]} />
      </mesh>
      <mesh material={mat.wood()} position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.012, 0.05, 5]} />
      </mesh>
    </group>
  );
}

export function GrainBowl({ grain = "rice", ...p }: GroupProps & { grain?: "rice" | "dal" | "wheat" }) {
  const bowl = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.08, 0],
        [0.14, 0.04],
        [0.15, 0.06],
      ]),
    [],
  );
  const m = grain === "rice" ? mat.rice() : grain === "dal" ? mat.dal() : mat.wheat();
  return (
    <group {...p}>
      <mesh geometry={bowl} material={mat.brass()} />
      <mesh material={m} position={[0, 0.06, 0]}>
        <coneGeometry args={[0.13, 0.07, 14]} />
      </mesh>
    </group>
  );
}

export function Roti({ count = 3, ...p }: GroupProps & { count?: number }) {
  return (
    <group {...p}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} material={mat.roti()} position={[i * 0.01, i * 0.008, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.006, 16]} />
        </mesh>
      ))}
    </group>
  );
}

export function Gur(p: GroupProps) {
  return (
    <group {...p}>
      <mesh material={mat.gur()} scale={[1, 0.75, 1]}>
        <dodecahedronGeometry args={[0.07, 0]} />
      </mesh>
    </group>
  );
}

export function BananaLeaf(p: GroupProps) {
  return (
    <group {...p}>
      <mesh material={mat.leaf()} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.45, 1]}>
        <circleGeometry args={[0.35, 18]} />
      </mesh>
    </group>
  );
}

/** Dispatch by content model id — used by the object explorer. */
export function PropByModel({ model }: { model: PropModel }) {
  switch (model) {
    case "soop":
      return <Soop filled={false} position={[0, -0.05, 0]} scale={1.4} />;
    case "prasad":
      return <Soop filled position={[0, -0.05, 0]} scale={1.4} />;
    case "daura":
      return <Daura position={[0, -0.25, 0]} scale={1.1} />;
    case "thekua":
      return (
        <group scale={2.6}>
          <Thekua position={[0, 0, 0]} />
          <Thekua position={[0.1, 0.025, 0.04]} rotation={[0.2, 1, 0]} />
          <Thekua position={[-0.08, 0.02, 0.06]} rotation={[-0.15, 2, 0.1]} />
        </group>
      );
    case "coconut":
      return <Coconut scale={3} />;
    case "sugarcane":
      return <Sugarcane height={1.1} position={[0, -0.6, 0]} />;
    case "diya":
      return <Diya scale={4} position={[0, -0.1, 0]} />;
    case "kalash":
      return <Kalash scale={2} position={[0, -0.4, 0]} />;
    case "fruits":
      return <Fruits scale={2.2} position={[0, -0.15, 0]} />;
    case "banana":
      return <BananaBunch scale={3.5} position={[0, -0.2, 0]} />;
    case "chulha":
      return <Chulha scale={1.3} position={[0, -0.2, 0]} />;
    case "handi":
      return (
        <group position={[0, -0.25, 0]}>
          <Handi scale={1.3} position={[-0.2, 0, 0]} lid />
          <Kadhai scale={0.9} position={[0.35, 0, 0.1]} contents="none" />
          <Lota position={[0.1, 0, 0.35]} scale={1.3} />
        </group>
      );
    case "lota":
      return <Lota scale={3.5} position={[0, -0.3, 0]} />;
    case "lauki":
      return <Lauki scale={2.2} />;
    case "rice":
      return <GrainBowl grain="rice" scale={2.8} position={[0, -0.1, 0]} />;
    case "dal":
      return <GrainBowl grain="dal" scale={2.8} position={[0, -0.1, 0]} />;
    case "kheer":
      return <Kadhai contents="kheer" scale={1.7} position={[0, -0.1, 0]} />;
    case "roti":
      return <Roti scale={3.5} count={4} />;
    case "gur":
      return <Gur scale={4} />;
    default:
      return null;
  }
}
