"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useDirector } from "./Director";
import type { CameraPreset } from "@/content/types";

type V3 = [number, number, number];
export const CAMERAS: Record<CameraPreset, { pos: V3; target: V3 }> = {
  "courtyard-wide": { pos: [7.5, 5.2, 9.5], target: [0, 0.8, -1.5] },
  "courtyard-kitchen": { pos: [5.8, 2.8, 3.2], target: [1.8, 0.6, -2.0] },
  "courtyard-stove": { pos: [4.6, 1.9, -0.2], target: [3.1, 0.5, -3.1] },
  "courtyard-shrine": { pos: [2.4, 2.0, -0.6], target: [0.3, 0.6, -4.3] },
  "courtyard-night": { pos: [5.5, 3.6, 6.5], target: [-0.5, 0.6, -2] },
  "ghat-hero": { pos: [0, 2.6, 10.5], target: [0, 1.0, -12] },
  "ghat-path": { pos: [-3.5, 3.0, 12.5], target: [-4, 1.4, 5.5] },
  "ghat-steps": { pos: [3.6, 3.4, 8.2], target: [0, 0.8, 2.2] },
  "ghat-water": { pos: [3.2, 2.0, 3.6], target: [-0.3, 0.2, -3] },
  "ghat-closeup": { pos: [1.9, 1.15, -0.5], target: [-0.6, 0.85, -4.2] },
  "ghat-wide": { pos: [-7, 5.5, 13], target: [0, 0.5, -8] },
};

export function CameraRig({ free = false }: { free?: boolean }) {
  const d = useDirector();
  const { camera, size } = useThree();
  const controls = useRef<OrbitControlsImpl | null>(null);
  const look = useMemo(() => new THREE.Vector3(), []);
  const goalPos = useMemo(() => new THREE.Vector3(), []);
  const goalTarget = useMemo(() => new THREE.Vector3(), []);
  const inited = useRef(false);

  useFrame((_, delta) => {
    const snap = d.current;
    const preset = snap.view === "closeup" && snap.stage.closeCamera ? snap.stage.closeCamera : snap.stage.camera;
    const c = CAMERAS[preset];
    const portrait = size.width < size.height;
    // Portrait phones: pull back and widen so the ritual stays in frame.
    const cam = camera as THREE.PerspectiveCamera;
    const fov = portrait ? 62 : 45;
    if (Math.abs(cam.fov - fov) > 0.1) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    goalPos.set(...c.pos);
    goalTarget.set(...c.target);
    if (portrait) goalPos.sub(goalTarget).multiplyScalar(1.12).add(goalTarget);
    if (!snap.reduced && !snap.free) {
      // gentle cinematic drift
      goalPos.x += Math.sin(snap.t * 0.15) * 0.25;
      goalPos.y += Math.sin(snap.t * 0.11) * 0.1;
    }

    const transitioning = snap.sinceChange < 2.2 || !inited.current;
    if (snap.free && controls.current && !transitioning) {
      controls.current.update();
      return;
    }
    const k = !inited.current || snap.reduced ? 1 : 1 - Math.exp(-delta * 2.2);
    inited.current = true;
    camera.position.lerp(goalPos, k);
    look.lerp(goalTarget, k);
    camera.lookAt(look);
    if (controls.current) {
      controls.current.target.copy(look);
      controls.current.update();
    }
  });

  return free ? (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      minDistance={1.2}
      maxDistance={18}
      maxPolarAngle={Math.PI * 0.49}
    />
  ) : null;
}
