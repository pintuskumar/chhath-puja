import * as THREE from "three";
import { weaveTexture, thekuaTexture } from "./textures";

/** Shared materials: one instance per look keeps shader programs and draw state minimal. */
const cache = new Map<string, THREE.Material>();

function std(key: string, params: THREE.MeshStandardMaterialParameters) {
  let m = cache.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial(params);
    cache.set(key, m);
  }
  return m;
}

export const mat = {
  clay: () => std("clay", { color: "#a65a34", roughness: 0.95 }),
  clayLight: () => std("clayLight", { color: "#c98a5b", roughness: 0.95 }),
  plaster: () => std("plaster", { color: "#d6b58a", roughness: 1 }),
  brass: () => std("brass", { color: "#d4a640", metalness: 0.85, roughness: 0.32 }),
  copper: () => std("copper", { color: "#c0703f", metalness: 0.8, roughness: 0.35 }),
  bamboo: () => std("bamboo", { map: weaveTexture(), roughness: 0.85 }),
  bambooSolid: () => std("bambooSolid", { color: "#c99a52", roughness: 0.8 }),
  thekua: () => std("thekua", { map: thekuaTexture(), roughness: 0.7 }),
  coconut: () => std("coconut", { color: "#6b4426", roughness: 1 }),
  sindoor: () => std("sindoor", { color: "#c0182a", roughness: 0.6 }),
  caneStalk: () => std("caneStalk", { color: "#5b2f4a", roughness: 0.6 }),
  caneLeaf: () => std("caneLeaf", { color: "#6f9a3a", roughness: 0.8, side: THREE.DoubleSide }),
  leaf: () => std("leaf", { color: "#3f7d32", roughness: 0.7, side: THREE.DoubleSide }),
  bananaRaw: () => std("bananaRaw", { color: "#8fb33a", roughness: 0.6 }),
  bananaRipe: () => std("bananaRipe", { color: "#e8c547", roughness: 0.6 }),
  citron: () => std("citron", { color: "#d3d045", roughness: 0.55 }),
  chestnut: () => std("chestnut", { color: "#2f1f1a", roughness: 0.7 }),
  sweetPotato: () => std("sweetPotato", { color: "#a4495a", roughness: 0.9 }),
  lauki: () => std("lauki", { color: "#9cc26a", roughness: 0.5 }),
  rice: () => std("rice", { color: "#f4efe2", roughness: 0.9 }),
  dal: () => std("dal", { color: "#e8b53a", roughness: 0.8 }),
  kheer: () => std("kheer", { color: "#c99a6a", roughness: 0.4 }),
  roti: () => std("roti", { color: "#dcb07a", roughness: 0.9 }),
  gur: () => std("gur", { color: "#7a3e14", roughness: 0.7 }),
  wheat: () => std("wheat", { color: "#d8a94a", roughness: 1 }),
  wood: () => std("wood", { color: "#6d4a2e", roughness: 0.9 }),
  cloth: (c: string) => std("cloth" + c, { color: c, roughness: 0.85 }),
  skin: (c: string) => std("skin" + c, { color: c, roughness: 0.7 }),
  hair: () => std("hair", { color: "#1a1210", roughness: 0.6 }),
  flame: () =>
    std("flame", {
      color: "#ffb347",
      emissive: "#ff8a1f",
      emissiveIntensity: 3,
      roughness: 1,
      toneMapped: false,
    }),
  shadow: () => {
    let m = cache.get("shadow") as THREE.MeshBasicMaterial | undefined;
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.28, depthWrite: false });
      cache.set("shadow", m);
    }
    return m;
  },
};

/** Lathe helper: profile as [radius, height] pairs. */
export function lathe(points: [number, number][], segments = 20) {
  return new THREE.LatheGeometry(
    points.map(([r, h]) => new THREE.Vector2(r, h)),
    segments,
  );
}
