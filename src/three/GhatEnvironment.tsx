"use client";

/**
 * River ghat: stone steps descending into the river, chhatri pavilions,
 * a far bank, sugarcane clusters, lamp-lined steps and a crowd of devotees.
 * Repeated elements are GPU-instanced (crowd, canes, diyas) to keep draw calls low.
 */
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mat, lathe } from "./materials";
import { stoneTexture } from "./textures";
import { Water } from "./Water";
import { LOOKS } from "./Devotee";
import { Character } from "./characters/Character";
import { Daura, Soop, Sugarcane, Diya, Kalash } from "./props";
import { useDirector } from "./Director";
import { GHAT, stepTop, choreograph, ghatGround } from "./choreography";
import { skyAt } from "@/lib/sky";
import type { AnimationId } from "@/content/types";

/** Ground under a point on the ghat (steps, slope, river bed) for character foot IK. */
const ghatFloor = (_x: number, z: number) => ghatGround(z);

type Q = "low" | "medium" | "high";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Steps() {
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.95 }), []);
  const stripe = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E97824", roughness: 0.8 }), []);
  const white = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f2ead8", roughness: 0.9 }), []);
  const steps = Array.from({ length: GHAT.steps }, (_, i) => i);
  const width = 34;
  return (
    <group>
      {steps.map((i) => {
        const top = stepTop(i);
        const z0 = i * GHAT.stepDepth;
        const depth = GHAT.plateauZ - z0;
        const h = top + 2.5;
        return (
          <group key={i}>
            <mesh material={stone} position={[0, top - h / 2, z0 + depth / 2]} receiveShadow>
              <boxGeometry args={[width, h, depth]} />
            </mesh>
            {/* painted riser, as on many ghats decorated for Chhath */}
            {i > 0 && i % 2 === 1 && (
              <mesh material={i % 4 === 1 ? stripe : white} position={[0, top - GHAT.stepRise / 2, z0 - 0.001]}>
                <planeGeometry args={[width, GHAT.stepRise * 0.9]} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* top plateau */}
      <mesh material={stone} position={[0, GHAT.plateauY - 1.5, GHAT.plateauZ + 6]} receiveShadow>
        <boxGeometry args={[width, 3, 12]} />
      </mesh>
      {/* chhatri pavilions */}
      {[-8, 8].map((x) => (
        <group key={x} position={[x, GHAT.plateauY, GHAT.plateauZ + 1.2]}>
          {[
            [-0.9, -0.9],
            [0.9, -0.9],
            [-0.9, 0.9],
            [0.9, 0.9],
          ].map(([px, pz], i) => (
            <mesh key={i} material={white} position={[px, 1.2, pz]}>
              <cylinderGeometry args={[0.12, 0.14, 2.4, 8]} />
            </mesh>
          ))}
          <mesh material={white} position={[0, 2.5, 0]}>
            <boxGeometry args={[2.4, 0.25, 2.4]} />
          </mesh>
          <mesh material={stripe} position={[0, 2.95, 0]}>
            <sphereGeometry args={[1.0, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={mat.brass()} position={[0, 4.05, 0]}>
            <coneGeometry args={[0.12, 0.4, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FarBank({ quality }: { quality: Q }) {
  const trees = useRef<THREE.InstancedMesh>(null);
  const count = quality === "low" ? 30 : quality === "medium" ? 60 : 110;
  const bankMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3b2c", roughness: 1 }), []);
  const treeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b3a26", roughness: 1 }), []);
  useLayoutEffect(() => {
    const m = trees.current;
    if (!m) return;
    const r = rng(42);
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      // low treeline (≈1–2° above the horizon) so the sun stays visible near sunrise/sunset
      const s = 1.2 + r() * 1.6;
      o.position.set(-200 + r() * 400, 0.6 + s * 0.3, -78 - r() * 10);
      o.scale.set(s * 1.4, s * 0.8, s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <group>
      <mesh material={bankMat} position={[0, 0.5, -82]}>
        <boxGeometry args={[440, 2, 14]} />
      </mesh>
      <instancedMesh ref={trees} args={[undefined, undefined, count]} material={treeMat}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </group>
  );
}

/** Distant devotees — two instanced meshes regardless of count. */
function Crowd({ quality }: { quality: Q }) {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const count = quality === "low" ? 24 : quality === "medium" ? 70 : 140;
  const bodyGeo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.28, 0],
        [0.22, 0.7],
        [0.18, 1.3],
        [0.12, 1.36],
        [0, 1.36],
      ], 8),
    [],
  );
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const headMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8f5d3e", roughness: 0.8 }), []);
  useLayoutEffect(() => {
    const b = bodies.current;
    const h = heads.current;
    if (!b || !h) return;
    const r = rng(7);
    const o = new THREE.Object3D();
    const palette = [LOOKS.vrati.garment, LOOKS.vrati2.garment, LOOKS.vrati3.garment, LOOKS.elder.garment, "#f3ead6", "#c2416b", "#E97824"];
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const side = r() > 0.5 ? 1 : -1;
      const x = side * (3.2 + r() * 13);
      const inWater = r() < 0.45;
      const z = inWater ? -1.2 - r() * 3.2 : r() * 5.2;
      const y = inWater ? GHAT.waterStandY : stepTop(Math.min(GHAT.steps - 1, Math.floor(z / GHAT.stepDepth)));
      const s = 0.85 + r() * 0.25;
      o.position.set(x, y, z);
      o.rotation.set(0, Math.PI + (r() - 0.5) * 0.6, 0);
      o.scale.set(s, s, s);
      o.updateMatrix();
      b.setMatrixAt(i, o.matrix);
      b.setColorAt(i, c.set(palette[Math.floor(r() * palette.length)]));
      o.position.y = y + 1.48 * s;
      o.scale.setScalar(s);
      o.updateMatrix();
      h.setMatrixAt(i, o.matrix);
    }
    b.instanceMatrix.needsUpdate = true;
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
    h.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <group>
      <instancedMesh ref={bodies} args={[bodyGeo, bodyMat, count]} />
      <instancedMesh ref={heads} args={[undefined, headMat, count]}>
        <sphereGeometry args={[0.12, 8, 6]} />
      </instancedMesh>
    </group>
  );
}

function CaneClusters({ quality }: { quality: Q }) {
  const stalks = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const clusters = quality === "low" ? 6 : 14;
  const per = 3;
  const n = clusters * per;
  useLayoutEffect(() => {
    const s = stalks.current;
    const l = leaves.current;
    if (!s || !l) return;
    const r = rng(99);
    const o = new THREE.Object3D();
    let li = 0;
    for (let c = 0; c < clusters; c++) {
      const side = c % 2 ? 1 : -1;
      const cx = side * (1.8 + r() * 12);
      const step = 2 + Math.floor(r() * 4);
      const cz = step * GHAT.stepDepth + 0.35;
      const cy = stepTop(step);
      for (let k = 0; k < per; k++) {
        const i = c * per + k;
        const a = (k / per) * Math.PI * 2;
        o.position.set(cx + Math.cos(a) * 0.12, cy + 1.1, cz + Math.sin(a) * 0.12);
        o.rotation.set(Math.sin(a) * 0.12, 0, Math.cos(a) * 0.12);
        o.scale.set(1, 1, 1);
        o.updateMatrix();
        s.setMatrixAt(i, o.matrix);
        for (let j = 0; j < 3; j++) {
          const la = a + j * 2.1;
          o.position.set(cx + Math.cos(la) * 0.25, cy + 2.3 - j * 0.05, cz + Math.sin(la) * 0.25);
          o.rotation.set(Math.sin(la) * 0.9, la, Math.cos(la) * 0.9);
          o.updateMatrix();
          l.setMatrixAt(li++, o.matrix);
        }
      }
    }
    s.instanceMatrix.needsUpdate = true;
    l.instanceMatrix.needsUpdate = true;
  }, [clusters]);
  return (
    <group>
      <instancedMesh ref={stalks} args={[undefined, mat.caneStalk(), n]}>
        <cylinderGeometry args={[0.022, 0.026, 2.2, 6]} />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined, mat.caneLeaf(), n * 3]}>
        <planeGeometry args={[0.06, 0.6]} />
      </instancedMesh>
    </group>
  );
}

/** Lamps along the step edges and floating on the water. */
function Lamps({ quality, floating }: { quality: Q; floating: boolean }) {
  const d = useDirector();
  const bowls = useRef<THREE.InstancedMesh>(null);
  const flames = useRef<THREE.InstancedMesh>(null);
  const floats = useRef<THREE.InstancedMesh>(null);
  const floatFlames = useRef<THREE.InstancedMesh>(null);
  const n = quality === "low" ? 50 : quality === "medium" ? 110 : 200;
  const nf = quality === "low" ? 12 : 30;
  const bowlGeo = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.05, 0],
        [0.08, 0.02],
        [0.09, 0.045],
        [0.065, 0.028],
        [0, 0.022],
      ], 8),
    [],
  );
  const seeds = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: nf }, () => ({ x: (r() - 0.5) * 22, z: -0.8 - r() * 7, sp: 0.05 + r() * 0.08, ph: r() * 6 }));
  }, [nf]);
  useLayoutEffect(() => {
    const b = bowls.current;
    const f = flames.current;
    if (!b || !f) return;
    const r = rng(13);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const step = Math.floor(r() * 4);
      o.position.set((r() - 0.5) * 30, stepTop(step) + 0.001, step * GHAT.stepDepth + 0.08 + r() * 0.12);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(1);
      o.updateMatrix();
      b.setMatrixAt(i, o.matrix);
      o.position.y += 0.06;
      o.position.x += 0.04;
      o.updateMatrix();
      f.setMatrixAt(i, o.matrix);
    }
    b.instanceMatrix.needsUpdate = true;
    f.instanceMatrix.needsUpdate = true;
  }, [n]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const s = skyAt(d.current.hour);
    const lit = s.lampGlow > 0.12;
    if (flames.current) flames.current.visible = lit;
    if (floatFlames.current) floatFlames.current.visible = lit;
    const fl = floats.current;
    const ff = floatFlames.current;
    if (!fl || !ff || !floating) return;
    const t = d.current.reduced ? 0 : d.current.t;
    seeds.forEach((sd, i) => {
      o.position.set(sd.x + Math.sin(t * sd.sp + sd.ph) * 0.6 + t * sd.sp * 0.5, 0.02 + Math.sin(t * 1.3 + sd.ph) * 0.015, sd.z);
      o.updateMatrix();
      fl.setMatrixAt(i, o.matrix);
      o.position.y += 0.07;
      o.updateMatrix();
      ff.setMatrixAt(i, o.matrix);
    });
    fl.instanceMatrix.needsUpdate = true;
    ff.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={bowls} args={[bowlGeo, mat.clay(), n]} />
      <instancedMesh ref={flames} args={[undefined, mat.flame(), n]}>
        <coneGeometry args={[0.015, 0.06, 5]} />
      </instancedMesh>
      {floating && (
        <>
          <instancedMesh ref={floats} args={[undefined, mat.leaf(), nf]}>
            <cylinderGeometry args={[0.1, 0.07, 0.04, 8]} />
          </instancedMesh>
          <instancedMesh ref={floatFlames} args={[undefined, mat.flame(), nf]}>
            <coneGeometry args={[0.016, 0.07, 5]} />
          </instancedMesh>
        </>
      )}
    </group>
  );
}

function FamilySpot({ anim }: { anim: AnimationId }) {
  const onSteps = anim !== "procession" && anim !== "dawn-arrive";
  return (
    <group>
      {onSteps && (
        <group position={[0, stepTop(3), 2.15]}>
          <Daura position={[0.9, 0, 0.45]} filled={false} />
          {anim !== "arghya" && anim !== "usha-arghya" && <Soop filled position={[-0.2, 0, -0.05]} />}
          <Soop filled position={[0.3, 0, -0.1]} rotation={[0, -0.2, 0]} />
          <Kalash position={[1.5, 0, 0.15]} />
          <Diya position={[-0.75, 0, -0.1]} light />
          {[0, 1, 2].map((i) => (
            <Sugarcane key={i} position={[-1.6 + i * 0.12, 0, 0.45 + (i % 2) * 0.1]} rotation={[0.05 * i, 0, -0.05 + i * 0.05]} height={2.3} />
          ))}
        </group>
      )}
      {/* other families' covered dauras */}
      {[-5.2, -3.6, 3.4, 5.6, 7.4].map((x, i) => (
        <Daura key={i} covered position={[x, stepTop(3 + (i % 2)), (3 + (i % 2)) * GHAT.stepDepth + 0.35]} scale={0.9} />
      ))}
    </group>
  );
}

/** Kosi: a canopy of sugarcane with lamps (shown at evening close; family-specific practice). */
function Kosi() {
  const canes = 5;
  return (
    <group position={[3.2, stepTop(5), 3.85]}>
      {Array.from({ length: canes }, (_, i) => {
        const a = (i / canes) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55]} rotation={[-Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25]}>
            <Sugarcane height={2.1} leaves={i % 2 === 0} />
          </group>
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <Diya key={i} position={[Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3]} light={i === 0} />;
      })}
      <Kalash position={[0, 0, 0]} scale={0.8} />
    </group>
  );
}

export default function GhatEnvironment({ anim, quality }: { anim: AnimationId; quality: Q }) {
  const d = useDirector();
  const actorKeys = useMemo(() => Object.keys(choreograph(anim, 0, 0)), [anim]);
  const floating = anim === "evening-close" || anim === "dawn-arrive" || anim === "stand-in-water" || anim === "usha-arghya";
  return (
    <group>
      <Water segments={quality === "high" ? 128 : quality === "medium" ? 64 : 24} />
      <Steps />
      <FarBank quality={quality} />
      <Crowd quality={quality} />
      <CaneClusters quality={quality} />
      <Lamps quality={quality} floating={floating} />
      <FamilySpot anim={anim} />
      {anim === "evening-close" && <Kosi />}
      {actorKeys.map((k) => (
        <Character key={`${anim}-${k}`} get={() => d.current.actors[k]} reduced={d.current.reduced} quality={quality} ground={ghatFloor} />
      ))}
    </group>
  );
}
