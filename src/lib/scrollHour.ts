import type { SceneStage, TimeControl } from "@/content/types";

/**
 * Scroll-driven time of day (Day 4): within each scene the sun moves from that
 * scene's ritual time toward the next scene's, following scroll progress through
 * the section — so the arghya scene always lands at sunrise.
 */
export function scrollHour(stages: SceneStage[], index: number, sceneScroll: number, tc: TimeControl) {
  const a = stages[index]?.timeOfDay ?? tc.min;
  const b = stages[index + 1]?.timeOfDay ?? tc.max;
  const k = Math.min(1, Math.max(0, sceneScroll));
  return Math.min(tc.max, Math.max(tc.min, a + (b - a) * k));
}
