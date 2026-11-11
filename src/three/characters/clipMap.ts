/**
 * Maps choreography poses to authored skeletal clips.
 * Ritual poses map ONLY to ritual-specific clips (recorded from a vrati, reviewed);
 * there is no fallback from e.g. "raise-soop" to a generic "offering" animation.
 */
import type { PoseId } from "../choreography";

export const REQUIRED_CLIPS = [
  "idle_stand",
  "walk_barefoot",
  "walk_steps_down",
  "carry_daura_walk",
  "carry_daura_idle",
  "stand_in_water_idle",
  "soop_hold",
  "soop_raise_arghya",
  "lota_pour",
  "namaste",
  "sit_crosslegged",
  "sit_eat",
  "stir_chulha",
  "sweep",
  "bow_touch_feet",
  "give_prasad",
] as const;
export type ClipName = (typeof REQUIRED_CLIPS)[number];

/** Clips that represent locomotion: playback rate follows ground speed. */
export const LOCOMOTION: ClipName[] = ["walk_barefoot", "walk_steps_down", "carry_daura_walk"];

interface Ctx {
  moving: boolean;
  descending: boolean;
  inWater: boolean;
}

/** Preferred clips for a pose, best first. The first one present in the file is used. */
export function clipCandidates(pose: PoseId, c: Ctx): ClipName[] {
  if (c.moving) {
    if (pose === "carry-head") return ["carry_daura_walk", "walk_barefoot"];
    return c.descending ? ["walk_steps_down", "walk_barefoot"] : ["walk_barefoot"];
  }
  switch (pose) {
    case "idle":
    case "walk":
    case "shoo":
      return c.inWater ? ["stand_in_water_idle", "idle_stand"] : ["idle_stand"];
    case "namaste":
      return ["namaste", c.inWater ? "stand_in_water_idle" : "idle_stand"];
    case "sit-namaste":
    case "sit":
    case "crouch":
    case "arrange":
      return ["sit_crosslegged"];
    case "eat":
      return ["sit_eat", "sit_crosslegged"];
    case "stir":
      return ["stir_chulha", "sit_crosslegged"];
    case "sweep":
      return ["sweep", "idle_stand"];
    case "fill":
    case "pour":
      return ["lota_pour", "idle_stand"];
    case "carry-head":
      return ["carry_daura_idle", "idle_stand"];
    case "hold-soop":
      return ["soop_hold"];
    case "raise-soop":
      return ["soop_raise_arghya", "soop_hold"];
    case "bow":
      return ["bow_touch_feet", "idle_stand"];
    case "offer":
    case "give":
      return ["give_prasad", "idle_stand"];
    default:
      return ["idle_stand"];
  }
}

/** Blender exports actions as "Armature|walk_barefoot"; UE as "walk_barefoot". */
export function normalizeClipName(name: string) {
  return name.split("|").pop()!.trim().toLowerCase();
}
