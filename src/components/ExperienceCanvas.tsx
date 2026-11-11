"use client";

/**
 * ExperienceCanvas — the only place a full-scene WebGL canvas is created.
 *  - lazy: three/R3F code is in a separate chunk loaded after first paint
 *  - quality presets → DPR, antialiasing, shadows
 *  - pauses rendering when off-screen or the tab is hidden
 *  - reduced motion → on-demand rendering (no continuous animation)
 *  - any WebGL failure → falls back to the 2D illustration
 */
import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience, usePrefs } from "@/lib/store";
import DayWorld, { type WorldProps } from "@/three/DayWorld";
import { reportPerfDegraded } from "@/lib/device";

class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[ExperienceCanvas] falling back to 2D:", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** In demand mode, re-render whenever interaction state changes. */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const a = useExperience.subscribe(() => invalidate());
    const b = usePrefs.subscribe(() => invalidate());
    const id = window.setInterval(() => invalidate(), 1000);
    return () => {
      a();
      b();
      window.clearInterval(id);
    };
  }, [invalidate]);
  return null;
}

/**
 * Frame-time guard: after a warm-up (shader compilation), if the median frame time
 * stays above ~50 ms the canvas first drops resolution, then hands over to the 2D
 * illustration. Usability over spectacle.
 */
function PerformanceGuard({ onSlow }: { onSlow: (step: number) => void }) {
  const samples = useRef<number[]>([]);
  const warm = useRef(0);
  const step = useRef(0);
  useFrame((_, delta) => {
    warm.current += delta;
    if (warm.current < 3 || step.current >= 2) return;
    samples.current.push(delta);
    if (samples.current.length < 60) return;
    const sorted = samples.current.sort((a, b) => a - b);
    const median = sorted[30];
    samples.current = [];
    if (median > 0.05) {
      step.current += 1;
      warm.current = 1.5;
      onSlow(step.current);
    }
  });
  return null;
}

export interface ExperienceCanvasProps extends WorldProps {
  fallback: ReactNode;
  label: string;
  className?: string;
}

export default function ExperienceCanvas({ fallback, label, className, ...world }: ExperienceCanvasProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [lowRes, setLowRes] = useState(false);
  const forced3d = usePrefs((s) => s.renderer === "3d");

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    const vis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  const frameloop = !onScreen || !tabVisible ? "never" : world.reduced ? "demand" : "always";
  const dpr: [number, number] = lowRes ? [0.6, 0.75] : world.quality === "high" ? [1, 2] : world.quality === "medium" ? [1, 1.5] : [0.75, 1];

  return (
    <div ref={wrap} className={className} role="group" aria-label={label}>
      {/* The 2D illustration stays underneath until the first 3D frame is ready. */}
      {!ready && <div className="absolute inset-0">{fallback}</div>}
      <GLBoundary fallback={<div className="absolute inset-0">{fallback}</div>}>
        <Canvas
          className="!absolute inset-0"
          style={{ touchAction: world.free ? "none" : "pan-y" }}
          frameloop={frameloop}
          dpr={dpr}
          shadows={world.quality === "high"}
          camera={{ fov: 45, near: 0.1, far: 1200, position: [6, 4, 9] }}
          gl={{
            antialias: world.quality !== "low",
            powerPreference: world.quality === "low" ? "low-power" : "high-performance",
            alpha: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            requestAnimationFrame(() => setReady(true));
          }}
          aria-hidden="true"
        >
          {world.reduced && <DemandInvalidator />}
          {!world.reduced && (
            <PerformanceGuard
              onSlow={(step) => {
                if (step === 1) setLowRes(true);
                else if (!forced3d) reportPerfDegraded();
              }}
            />
          )}
          <Suspense fallback={null}>
            <DayWorld {...world} />
          </Suspense>
        </Canvas>
      </GLBoundary>
    </div>
  );
}
