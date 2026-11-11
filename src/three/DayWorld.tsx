"use client";

/**
 * Composition root for a day's 3D world. Only the environment needed for the
 * active scene is mounted; each environment is its own lazily-loaded chunk.
 */
import { lazy, Suspense } from "react";
import { Director } from "./Director";
import { Atmosphere } from "./Atmosphere";
import { CameraRig } from "./CameraRig";
import { Hotspots } from "./Hotspots";
import { useExperience } from "@/lib/store";
import type { Scene, SceneStage, TimeControl } from "@/content/types";

const CourtyardEnvironment = lazy(() => import("./CourtyardEnvironment"));
const GhatEnvironment = lazy(() => import("./GhatEnvironment"));

export interface WorldProps {
  scenes: Pick<Scene, "stage" | "objects">[];
  timeControl?: TimeControl;
  quality: "low" | "medium" | "high";
  reduced: boolean;
  free?: boolean;
  hotspots?: boolean;
  intro?: { from: number; seconds: number };
  fixedIndex?: number;
}

export default function DayWorld({ scenes, timeControl, quality, reduced, free, hotspots = true, intro, fixedIndex }: WorldProps) {
  const active = useExperience((s) => s.activeScene);
  const index = fixedIndex ?? Math.min(active, scenes.length - 1);
  const scene = scenes[index];
  const stage: SceneStage = scene.stage;
  const stages = scenes.map((s) => s.stage);
  return (
    <Director stages={stages} timeControl={timeControl} reduced={reduced} free={free} intro={intro} fixedIndex={fixedIndex}>
      <Atmosphere shadows={quality === "high"} />
      <CameraRig free={free} />
      <Suspense fallback={null}>
        {stage.environment === "courtyard" ? (
          <CourtyardEnvironment anim={stage.animation} quality={quality} />
        ) : (
          <GhatEnvironment anim={stage.animation} quality={quality} />
        )}
      </Suspense>
      {hotspots && <Hotspots env={stage.environment} anim={stage.animation} ids={scene.objects} />}
    </Director>
  );
}
