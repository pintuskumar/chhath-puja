"use client";

/**
 * SceneController for the 3D world.
 * Runs first every frame (negative priority) and turns store state into a mutable
 * per-frame snapshot (hour, ritual time, progress, actors). Components read the
 * snapshot from a ref so the animation loop never triggers React re-renders.
 *
 * Scene lifecycle: entry → active → (paused) → exit is tracked in the store by
 * <SceneController/>; here "paused" freezes ritual time while ambient motion continues.
 */
import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useExperience, isScenePaused } from "@/lib/store";
import { choreograph, type Actors } from "./choreography";
import { scrollHour } from "@/lib/scrollHour";
import type { SceneStage, TimeControl } from "@/content/types";

export interface DirectorSnapshot {
  hour: number;
  t: number;
  progress: number;
  stage: SceneStage;
  sceneIndex: number;
  actors: Actors;
  reduced: boolean;
  view: "overview" | "closeup";
  free: boolean;
  /** seconds since the stage last changed (camera transitions). */
  sinceChange: number;
  /** Homepage hero (centred composition, no text-card offset). */
  hero: boolean;
}

const Ctx = createContext<RefObject<DirectorSnapshot> | null>(null);

export function useDirector() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDirector must be used inside <Director>");
  return c;
}

interface Props {
  stages: SceneStage[];
  timeControl?: TimeControl;
  reduced: boolean;
  free?: boolean;
  /** Homepage: sun rises from `from` to the stage hour over `seconds`. */
  intro?: { from: number; seconds: number };
  /** Use a fixed scene index instead of the store (homepage/explorer). */
  fixedIndex?: number;
  children: ReactNode;
}

export function Director({ stages, timeControl, reduced, free = false, intro, fixedIndex, children }: Props) {
  const first = stages[0];
  const snap = useRef<DirectorSnapshot>({
    hour: intro ? intro.from : first.timeOfDay,
    t: 0,
    progress: 0,
    stage: first,
    sceneIndex: 0,
    actors: choreograph(first.animation, 0, 0),
    reduced,
    view: "overview",
    free,
    sinceChange: 99,
    hero: fixedIndex !== undefined,
  });
  const lastIndex = useRef(-1);
  const lastReplay = useRef(-1);
  const elapsed = useRef(0);
  const introT = useRef(0);

  useEffect(() => {
    snap.current.reduced = reduced;
    snap.current.free = free;
  }, [reduced, free]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const s = snap.current;
    const ex = useExperience.getState();
    const index = fixedIndex ?? Math.min(ex.activeScene, stages.length - 1);
    const stage = stages[index];

    if (index !== lastIndex.current || ex.replayToken !== lastReplay.current) {
      if (index !== lastIndex.current) s.sinceChange = 0;
      lastIndex.current = index;
      lastReplay.current = ex.replayToken;
      elapsed.current = 0;
    }
    s.sinceChange += delta;
    s.stage = stage;
    s.sceneIndex = index;
    s.view = ex.view;

    // Ritual time: frozen while paused / panel open / scrubbing.
    const paused = fixedIndex === undefined && isScenePaused(ex);
    if (ex.scrub !== null && fixedIndex === undefined) {
      elapsed.current = ex.scrub * stage.duration;
    } else if (!paused) {
      elapsed.current = Math.min(stage.duration, elapsed.current + delta);
    }
    s.t += paused ? 0 : delta;
    s.progress = reduced && ex.scrub === null && fixedIndex === undefined ? 1 : elapsed.current / stage.duration;

    // Time of day
    let target = stage.timeOfDay;
    if (fixedIndex === undefined) {
      if (ex.timeOverride !== null) target = ex.timeOverride;
      else if (timeControl?.kind === "scroll") target = scrollHour(stages, index, ex.sceneScroll, timeControl);
    }
    if (intro && introT.current < intro.seconds) {
      introT.current += delta;
      const k = Math.min(1, introT.current / intro.seconds);
      const e = 1 - Math.pow(1 - k, 3);
      s.hour = reduced ? target : intro.from + (target - intro.from) * e;
    } else {
      const k = reduced ? 1 : 1 - Math.exp(-delta * 1.8);
      s.hour += (target - s.hour) * k;
    }

    s.actors = choreograph(stage.animation, s.progress, s.t);
  }, -2);

  return <Ctx.Provider value={snap}>{children}</Ctx.Provider>;
}
