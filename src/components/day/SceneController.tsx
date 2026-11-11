"use client";

/**
 * SceneController — owns the scene lifecycle:
 *   entry (≈0.9s intro) → active → paused (user pause / panel open / scrubbing) → exit (on change)
 * Marks scenes visited and announces changes to assistive tech.
 */
import { useEffect, useRef } from "react";
import { useExperience, usePrefs, isScenePaused } from "@/lib/store";
import { useT, num } from "@/lib/i18n";
import type { Day } from "@/content/types";

export function SceneController({ day }: { day: Day }) {
  const active = useExperience((s) => s.activeScene);
  const replayToken = useExperience((s) => s.replayToken);
  const paused = useExperience(isScenePaused);
  const setState = useExperience((s) => s.setSceneState);
  const markVisited = usePrefs((s) => s.markVisited);
  const { t, lang } = useT();
  const live = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setState("entry");
    const id = window.setTimeout(() => setState(useExperience.getState().panelObjectId ? "paused" : "active"), 900);
    const scene = day.scenes[active];
    if (scene) markVisited(day.slug, scene.id);
    return () => {
      window.clearTimeout(id);
      setState("exit");
    };
  }, [active, replayToken, day, markVisited, setState]);

  useEffect(() => {
    const s = useExperience.getState().sceneState;
    if (s === "entry" || s === "exit") return;
    setState(paused ? "paused" : "active");
  }, [paused, setState]);

  useEffect(() => {
    const scene = day.scenes[active];
    if (live.current && scene) live.current.textContent = `${t("scene")} ${num(active + 1, lang)}: ${t(scene.title)}`;
  }, [active, day, t, lang]);

  return <p ref={live} className="sr-only" aria-live="polite" />;
}
