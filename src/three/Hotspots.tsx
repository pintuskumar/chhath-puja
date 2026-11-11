"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useDirector } from "./Director";
import { YARD, stepTop, GHAT } from "./choreography";
import { hotspotElement } from "@/lib/hotspotRegistry";
import type { AnimationId, EnvironmentId } from "@/content/types";

type V3 = [number, number, number];
export type Anchor = { pos: V3 } | { actor: string; offset: V3 };

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Where each object's hotspot sits, per environment and ritual moment. */
export function anchorsFor(env: EnvironmentId, anim: AnimationId): Record<string, Anchor> {
  if (env === "courtyard") {
    const kharna = anim === "kharna-cook" || anim === "evening-puja" || anim === "prasad-receive";
    return {
      chulha: { pos: add(YARD.chulha, [0, 0.55, 0.15]) },
      handi: { pos: add(YARD.chulha, [-0.75, 0.45, 0.35]) },
      lauki: { pos: add(YARD.chulha, [-1.1, 0.3, 1.3]) },
      "chana-dal": { pos: add(YARD.chulha, [-0.65, 0.3, 1.6]) },
      "arwa-chawal": { pos: add(YARD.chulha, [-1.45, 0.3, 1.75]) },
      lota: { pos: add(YARD.water, [0.15, 0.75, 0]) },
      gehun: { pos: add(YARD.wheat, [0, 0.25, 0]) },
      kalash: { pos: add(YARD.shrine, [0, 0.95, 0]) },
      diya: { pos: add(YARD.shrine, [0.55, 0.45, 0.25]) },
      rasiyaw: kharna && anim === "kharna-cook" ? { pos: add(YARD.chulha, [0, 0.75, 0.1]) } : { pos: add(YARD.shrine, [-0.2, 0.45, 0.55]) },
      roti: anim === "kharna-cook" ? { pos: add(YARD.chulha, [0.75, 0.4, 0.6]) } : { pos: add(YARD.shrine, [0.25, 0.4, 0.62]) },
      gur: { pos: add(YARD.chulha, [-0.9, 0.3, 0.9]) },
      banana: { pos: add(YARD.shrine, [-0.6, 0.45, 0.45]) },
      soop: { pos: add(YARD.soopMat, [-0.35, 0.3, 0]) },
      daura: anim === "dawn-gather" ? { actor: "man", offset: [0, 1.4, 0] } : { pos: add(YARD.soopMat, [1.0, 0.6, 0.6]) },
      thekua: { pos: add(YARD.soopMat, [0.45, 0.25, -0.3]) },
      coconut: { pos: add(YARD.soopMat, [0.1, 0.35, 0.4]) },
      fruits: { pos: add(YARD.soopMat, [-0.6, 0.3, 0.55]) },
      sugarcane: { pos: add(YARD.soopMat, [1.7, 1.6, -0.4]) },
    };
  }
  const inWater = anim === "arghya" || anim === "usha-arghya" || anim === "stand-in-water";
  return {
    soop: inWater ? { actor: "vrati", offset: [0, 1.5, -0.45] } : { pos: [-0.2, stepTop(3) + 0.35, 2.05] },
    daura: anim === "procession" || anim === "dawn-arrive" ? { actor: "man", offset: [0, 2.15, 0] } : { pos: [0.9, stepTop(3) + 0.55, 2.6] },
    arghya: { pos: [0.55, 0.25, -2.6] },
    ghat: { pos: [-2.6, stepTop(4) + 0.3, 3.0] },
    diya: { pos: [1.8, stepTop(1) + 0.2, 0.95] },
    sugarcane: anim === "procession" ? { actor: "youngman", offset: [0.25, 2.0, 0.15] } : { pos: [-1.6, stepTop(3) + 2.0, 2.6] },
    kalash: { pos: [1.5, stepTop(3) + 0.5, 2.3] },
    coconut: { actor: "vrati", offset: [0, 1.35, 0.3] },
    fruits: inWater ? { actor: "vrati", offset: [0.25, 1.3, -0.3] } : { pos: [0.3, stepTop(3) + 0.3, 2.0] },
    thekua: inWater ? { actor: "vrati", offset: [-0.25, 1.25, -0.35] } : { pos: [-0.6, stepTop(3) + 0.25, 2.2] },
    prasad: { actor: "vrati", offset: [0, 1.5, 0.3] },
    lota: { actor: "youngman", offset: [0.2, 1.4, 0.3] },
    banana: { pos: [0.2, stepTop(3) + 0.3, 2.3] },
  };
}

/**
 * Projects each hotspot anchor to screen space every frame and positions the
 * matching DOM button (see components/day/HotspotLayer.tsx).
 */
export function Hotspots({ env, anim, ids }: { env: EnvironmentId; anim: AnimationId; ids: string[] }) {
  const d = useDirector();
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  const anchors = useMemo(() => anchorsFor(env, anim), [env, anim]);
  useFrame(() => {
    for (const id of ids) {
      const el = hotspotElement(id);
      const anchor = anchors[id];
      if (!el) continue;
      if (!anchor) {
        el.style.visibility = "hidden";
        continue;
      }
      if ("pos" in anchor) v.set(...anchor.pos);
      else {
        const a = d.current.actors[anchor.actor];
        if (!a) {
          el.style.visibility = "hidden";
          continue;
        }
        const c = Math.cos(a.rotY);
        const s = Math.sin(a.rotY);
        const [ox, oy, oz] = anchor.offset;
        v.set(a.pos[0] + ox * c + oz * s, a.pos[1] + oy, a.pos[2] - ox * s + oz * c);
      }
      v.project(camera);
      const onScreen = v.z < 1 && Math.abs(v.x) < 0.97 && Math.abs(v.y) < 0.95;
      el.style.visibility = onScreen ? "visible" : "hidden";
      if (onScreen) {
        const x = ((v.x + 1) / 2) * size.width;
        const y = ((1 - v.y) / 2) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
    }
  });
  return null;
}

export { GHAT };
