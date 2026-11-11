"use client";

/**
 * Image-based lighting for PBR skin and cloth. Without an environment map,
 * realistic MetaHuman materials look flat and plastic. The environment is
 * rendered locally from light-formers (no HDR download; CSP-safe), tinted for
 * dusk or dawn. Enabled only when realistic characters are configured.
 */
import { Environment, Lightformer, SoftShadows } from "@react-three/drei";
import { useDirector } from "../Director";
import { skyAt } from "@/lib/sky";
import { hasRealisticCharacters, useModelManifest } from "./manifest";

export function RealisticLighting({ quality }: { quality: "low" | "medium" | "high" }) {
  const manifest = useModelManifest();
  const d = useDirector();
  if (!hasRealisticCharacters(manifest) || quality === "low") return null;
  // Sampled once per scene mount (scene time-of-day); cheap and stable.
  const s = skyAt(d.current.stage.timeOfDay);
  return (
    <>
      {quality === "high" && <SoftShadows size={18} samples={10} focus={0.6} />}
      <Environment resolution={quality === "high" ? 128 : 64} frames={1} environmentIntensity={0.55}>
        <color attach="background" args={[s.horizon]} />
        {/* sky dome */}
        <Lightformer form="rect" intensity={1.2} color={s.top} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 20, 1]} />
        {/* low sun / horizon glow */}
        <Lightformer form="ring" intensity={3} color={s.sunColor} position={[s.azimuth * 6, 1.2, -8]} scale={3} />
        {/* warm bounce from ground / ghat stone */}
        <Lightformer form="rect" intensity={0.5} color="#b98a5e" position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[20, 20, 1]} />
        {/* cool fill from behind */}
        <Lightformer form="rect" intensity={0.4} color="#9fb6d6" position={[0, 2, 8]} scale={[10, 4, 1]} />
      </Environment>
    </>
  );
}
