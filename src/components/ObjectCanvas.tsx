"use client";

/** Heavy WebGL part of the object viewer — its own chunk, loaded only when 3D is used. */
import { Component, Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { PropByModel } from "@/three/props";
import type { PropModel } from "@/content/types";

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Turntable({ model, spin }: { model: PropModel; spin: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (spin && g.current) g.current.rotation.y += d * 0.35;
  });
  return (
    <group ref={g}>
      <PropByModel model={model} />
    </group>
  );
}

export default function ObjectCanvas({ model, reduced, fallback }: { model: PropModel; reduced: boolean; fallback: ReactNode }) {
  return (
    <Boundary fallback={fallback}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0.9, 0.7, 1.3], fov: 40 }}
        frameloop={reduced ? "demand" : "always"}
        className="!absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        aria-hidden="true"
      >
        <hemisphereLight args={["#fff5df", "#6b4a2e", 1.1]} />
        <directionalLight position={[2, 3, 2]} intensity={1.8} color="#ffe4b0" />
        <directionalLight position={[-2, 1, -1]} intensity={0.5} color="#9fc3d0" />
        <Suspense fallback={null}>
          <Turntable model={model} spin={!reduced} />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={0.8} maxDistance={3} makeDefault />
      </Canvas>
    </Boundary>
  );
}
