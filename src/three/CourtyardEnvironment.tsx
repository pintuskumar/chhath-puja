"use client";

/**
 * A Bihar / eastern-UP village courtyard (aangan): plastered earth floor,
 * lime-washed walls with Madhubani-inspired paintings, a tiled main house,
 * a thatched kitchen with a clay chulha, a tulsi chaura, a water corner and
 * the household place of worship. ~60–90 draw calls at full detail.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mat } from "./materials";
import { earthTexture, madhubaniWallTexture, tileTexture, thatchTexture, matTexture } from "./textures";
import {
  Chulha,
  Handi,
  Kadhai,
  Lauki,
  GrainBowl,
  Lota,
  Matka,
  Kalash,
  Diya,
  BananaLeaf,
  BananaBunch,
  Roti,
  Gur,
  Soop,
  Daura,
  Sugarcane,
  Thekua,
  Coconut,
  Fruits,
} from "./props";
import { Character } from "./characters/Character";
import { useDirector } from "./Director";
import { YARD, choreograph } from "./choreography";
import { skyAt } from "@/lib/sky";
import type { AnimationId } from "@/content/types";

function Walls() {
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e9d6b0", roughness: 1 }), []);
  const painted = useMemo(() => new THREE.MeshStandardMaterial({ map: madhubaniWallTexture(), roughness: 1 }), []);
  const tiles = useMemo(() => new THREE.MeshStandardMaterial({ map: tileTexture(), roughness: 0.9 }), []);
  return (
    <group>
      {/* main house back wall */}
      <mesh material={wall} position={[0, 1.6, -6.2]}>
        <boxGeometry args={[15, 3.2, 0.4]} />
      </mesh>
      {/* painted panels */}
      <mesh material={painted} position={[-5.0, 1.55, -5.99]}>
        <planeGeometry args={[2.4, 2.4]} />
      </mesh>
      <mesh material={painted} position={[1.4, 1.55, -5.99]}>
        <planeGeometry args={[2.4, 2.4]} />
      </mesh>
      {/* doorway */}
      <mesh material={mat.cloth("#2a1a14")} position={[-2.6, 1.05, -5.98]}>
        <planeGeometry args={[1.1, 2.1]} />
      </mesh>
      <mesh material={mat.wood()} position={[-2.6, 2.15, -5.95]}>
        <boxGeometry args={[1.3, 0.12, 0.1]} />
      </mesh>
      {/* sloped tiled roof */}
      <mesh material={tiles} position={[0, 3.45, -6.9]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[15.6, 0.1, 2.4]} />
      </mesh>
      {/* boundary wall left */}
      <mesh material={wall} position={[-7.3, 0.8, 0]}>
        <boxGeometry args={[0.35, 1.6, 12.4]} />
      </mesh>
      {/* boundary wall right (behind kitchen) */}
      <mesh material={wall} position={[7.3, 0.8, 0]}>
        <boxGeometry args={[0.35, 1.6, 12.4]} />
      </mesh>
      {/* a mango tree beyond the wall */}
      <mesh material={mat.wood()} position={[-9, 1.5, -3]}>
        <cylinderGeometry args={[0.25, 0.35, 3, 7]} />
      </mesh>
      {[
        [-9, 3.6, -3, 1.8],
        [-8.1, 3.2, -2.2, 1.3],
        [-9.8, 3.1, -3.9, 1.4],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} material={mat.leaf()} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
    </group>
  );
}

function Kitchen() {
  const thatch = useMemo(() => new THREE.MeshStandardMaterial({ map: thatchTexture(), roughness: 1 }), []);
  const [x, , z] = YARD.chulha;
  return (
    <group>
      <mesh material={mat.plaster()} position={[x, 1.1, z - 1.0]}>
        <boxGeometry args={[3.2, 2.2, 0.25]} />
      </mesh>
      <mesh material={mat.plaster()} position={[x + 1.6, 1.1, z]}>
        <boxGeometry args={[0.25, 2.2, 2.2]} />
      </mesh>
      {/* raised plastered platform */}
      <mesh material={mat.clayLight()} position={[x, 0.04, z + 0.1]}>
        <boxGeometry args={[3.2, 0.08, 2.4]} />
      </mesh>
      <mesh material={thatch} position={[x, 2.7, z]} rotation={[0, Math.PI / 4, 0]} scale={[1.25, 1, 1]}>
        <coneGeometry args={[2.6, 1.3, 4, 1]} />
      </mesh>
      {[-1.5, 1.5].map((dx) => (
        <mesh key={dx} material={mat.wood()} position={[x + dx, 1.1, z + 1.15]}>
          <cylinderGeometry args={[0.06, 0.07, 2.2, 6]} />
        </mesh>
      ))}
      {/* mango-wood stack */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} material={mat.wood()} position={[x + 1.2, 0.12 + (i % 2) * 0.12, z - 0.5 + i * 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.06, 0.8, 5]} />
        </mesh>
      ))}
    </group>
  );
}

function Tulsi() {
  const [x, , z] = YARD.tulsi;
  return (
    <group position={[x, 0, z]}>
      <mesh material={mat.plaster()} position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
      </mesh>
      <mesh material={mat.plaster()} position={[0, 0.7, 0]}>
        <boxGeometry args={[0.45, 0.2, 0.45]} />
      </mesh>
      <mesh material={mat.sindoor()} position={[0, 0.35, 0.305]}>
        <planeGeometry args={[0.18, 0.18]} />
      </mesh>
      {[
        [0, 1.0, 0, 0.16],
        [0.1, 1.15, 0.05, 0.12],
        [-0.08, 1.2, -0.04, 0.11],
        [0, 1.32, 0, 0.09],
      ].map(([px, py, pz, r], i) => (
        <mesh key={i} material={mat.leaf()} position={[px, py, pz]}>
          <icosahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
    </group>
  );
}

function Mat({ position, size = [1.6, 1.2] }: { position: [number, number, number]; size?: [number, number] }) {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: matTexture(), roughness: 1 }), []);
  return (
    <mesh material={m} rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.012, position[2]]}>
      <planeGeometry args={size} />
    </mesh>
  );
}

/** Cooking stages are driven by ritual progress (and the Day 1 timeline scrubber). */
function CookingSet({ anim }: { anim: AnimationId }) {
  const d = useDirector();
  const rice = useRef<THREE.Group>(null);
  const dalPot = useRef<THREE.Group>(null);
  const plates = useRef<THREE.Group>(null);
  const [x, , z] = YARD.chulha;
  useFrame(() => {
    const p = d.current.progress;
    if (anim !== "cook") return;
    // 0–.25 washing rice · .25–.5 bhaat cooking · .5–.75 dal & lauki · .75–1 served
    if (rice.current) rice.current.visible = p < 0.3;
    if (dalPot.current) dalPot.current.visible = p >= 0.5;
    if (plates.current) plates.current.visible = p >= 0.75;
  });
  if (anim === "cook") {
    return (
      <group>
        <Handi position={[x, 0.32, z]} steam={0.9} lid={false} />
        <group ref={dalPot}>
          <Kadhai position={[x - 0.75, 0.08, z + 0.2]} contents="dal" scale={0.8} />
        </group>
        <group ref={rice}>
          <GrainBowl grain="rice" position={[x - 1.45, 0.08, z + 1.75]} />
        </group>
        <GrainBowl grain="dal" position={[x - 0.65, 0.08, z + 1.6]} />
        <Lauki position={[x - 1.1, 0.14, z + 1.3]} rotation={[0, 0.5, 0]} />
        <Lota position={[x + 0.7, 0.08, z + 0.5]} />
        <group ref={plates}>
          {[0, 1].map((i) => (
            <group key={i} position={[x - 0.2 + i * 0.6, 0.09, z + 1.5]}>
              <BananaLeaf scale={0.6} />
              <GrainBowl grain="rice" scale={0.5} position={[-0.05, 0, 0]} />
            </group>
          ))}
        </group>
      </group>
    );
  }
  if (anim === "kharna-cook") {
    return (
      <group>
        <Kadhai position={[x, 0.32, z]} contents="kheer" />
        <Roti position={[x + 0.75, 0.1, z + 0.6]} count={5} />
        <Gur position={[x - 0.9, 0.12, z + 0.9]} />
        <GrainBowl grain="rice" position={[x - 1.3, 0.08, z + 1.3]} />
        <Lota position={[x - 0.6, 0.08, z + 1.4]} />
      </group>
    );
  }
  return <Handi position={[x, 0.32, z]} lid />;
}

function Shrine({ anim }: { anim: AnimationId }) {
  const [x, , z] = YARD.shrine;
  const kharnaEvening = anim === "evening-puja" || anim === "prasad-receive";
  const lamps = kharnaEvening || anim === "nirjala" || anim === "dawn-gather";
  return (
    <group position={[x, 0, z]}>
      <mesh material={mat.plaster()} position={[0, 0.1, 0]}>
        <boxGeometry args={[1.8, 0.2, 1.0]} />
      </mesh>
      <Kalash position={[0, 0.2, -0.15]} />
      {[-0.5, 0.5].map((dx) => (
        <Diya key={dx} position={[dx, 0.2, 0.25]} lit={lamps} light={lamps && dx > 0} />
      ))}
      {kharnaEvening && (
        <group position={[0, 0.21, 0.45]}>
          <BananaLeaf scale={1.1} />
          <Kadhai contents="kheer" scale={0.5} position={[-0.15, 0.01, 0]} />
          <Roti scale={0.9} position={[0.25, 0.01, 0.05]} count={3} />
          <BananaBunch scale={0.9} position={[-0.6, 0.02, 0]} rotation={[0, 0.4, 0]} />
        </group>
      )}
    </group>
  );
}

function WaterCorner() {
  const [x, , z] = YARD.water;
  return (
    <group position={[x, 0, z]}>
      <mesh material={mat.plaster()} position={[0, 0.08, 0]}>
        <boxGeometry args={[1.4, 0.16, 1.4]} />
      </mesh>
      <Matka position={[-0.3, 0.16, -0.3]} />
      <Matka position={[0.32, 0.16, -0.25]} scale={0.85} />
      <Lota position={[0.2, 0.16, 0.35]} metal="copper" />
    </group>
  );
}

function WheatDrying() {
  const [x, , z] = YARD.wheat;
  return (
    <group>
      <Mat position={[x, 0, z]} size={[2.2, 1.5]} />
      <mesh material={mat.wheat()} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
        <circleGeometry args={[0.62, 18]} />
      </mesh>
    </group>
  );
}

function SoopArrangement({ anim }: { anim: AnimationId }) {
  const [x, , z] = YARD.soopMat;
  const show = anim === "arrange-soop" || anim === "dawn-gather";
  if (!show) return null;
  return (
    <group position={[x, 0, z]}>
      <Mat position={[0, 0, 0]} size={[2.4, 1.8]} />
      <Soop filled position={[-0.35, 0.02, 0]} rotation={[0, 0.2, 0]} />
      <Soop filled position={[0.4, 0.02, -0.15]} rotation={[0, -0.3, 0]} />
      {anim === "arrange-soop" && (
        <>
          <Soop position={[0.15, 0.02, 0.6]} rotation={[0, 0.1, 0]} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Thekua key={i} position={[0.55 + (i % 3) * 0.12, 0.03, -0.55 + Math.floor(i / 3) * 0.12]} />
          ))}
          <Coconut position={[0.1, 0.09, 0.4]} />
          <Fruits position={[-0.6, 0.02, 0.6]} scale={0.9} />
          <Daura position={[1.0, 0, 0.6]} filled={false} />
        </>
      )}
      {[0, 0.25, 0.5].map((dx, i) => (
        <Sugarcane key={i} position={[1.6 + dx * 0.4, 0, -0.6 + dx]} rotation={[0.25, 0, -0.15]} height={2} />
      ))}
    </group>
  );
}

function MealSet() {
  const seats: [number, number, number][] = [
    [0.6, 0, -0.65],
    [1.75, 0, -0.25],
    [-0.45, 0, -0.1],
    [1.3, 0, 0.15],
  ];
  return (
    <group>
      <Mat position={[0.8, 0, -0.4]} size={[3.2, 1.6]} />
      {seats.map((p, i) => (
        <group key={i} position={p}>
          <BananaLeaf scale={0.55} />
          <GrainBowl grain="rice" scale={0.45} position={[-0.06, 0.01, 0]} />
          <GrainBowl grain="dal" scale={0.35} position={[0.1, 0.01, 0.03]} />
        </group>
      ))}
    </group>
  );
}

export default function CourtyardEnvironment({ anim, quality }: { anim: AnimationId; quality: "low" | "medium" | "high" }) {
  const d = useDirector();
  const ground = useMemo(() => new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 1 }), []);
  const lamp = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const s = skyAt(d.current.hour);
    if (lamp.current) lamp.current.intensity = s.lampGlow * 2.2;
  });
  const actorKeys = useMemo(() => Object.keys(choreograph(anim, 0, 0)), [anim]);
  return (
    <group>
      <mesh material={ground} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
      </mesh>
      <Walls />
      <Kitchen />
      <Chulha position={YARD.chulha} fire={anim === "cook" || anim === "kharna-cook" || anim === "arrange-soop" ? 1 : 0.35} />
      <CookingSet anim={anim} />
      <Tulsi />
      <Diya position={[YARD.tulsi[0], 0.81, YARD.tulsi[2] + 0.12]} lit={anim === "nirjala" || anim === "fast-rest"} />
      <Shrine anim={anim} />
      <WaterCorner />
      {(anim === "prepare-next" || anim === "clean" || anim === "bath") && <WheatDrying />}
      <SoopArrangement anim={anim} />
      {anim === "meal" && <MealSet />}
      {quality !== "low" &&
        [-5.5, -4.6].map((x, i) => (
          // banana plants by the wall
          <group key={i} position={[x, 0, 4.6 - i * 0.8]}>
            <mesh material={mat.leaf()} position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 1.6, 6]} />
            </mesh>
            {[0, 1.6, 3.2, 4.6].map((a, j) => (
              <mesh key={j} material={mat.leaf()} position={[Math.cos(a) * 0.4, 1.7, Math.sin(a) * 0.4]} rotation={[Math.sin(a) * 0.8, a, 0.9]}>
                <planeGeometry args={[0.35, 1.1]} />
              </mesh>
            ))}
          </group>
        ))}
      <pointLight ref={lamp} color="#ffae5a" position={[YARD.shrine[0], 1.2, YARD.shrine[2] + 1.2]} distance={7} decay={2} />
      {actorKeys.map((k) => (
        <Character key={`${anim}-${k}`} get={() => d.current.actors[k]} reduced={d.current.reduced} quality={quality} />
      ))}
    </group>
  );
}
