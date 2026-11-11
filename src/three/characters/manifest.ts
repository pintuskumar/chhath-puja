"use client";

/**
 * Runtime manifest of realistic rigged characters (public/models/manifest.json).
 * Fetched once; when it lists no characters, every role keeps the procedural figure.
 */
import { useEffect, useState } from "react";
import { asset } from "@/lib/paths";
import type { HoldId, LookId } from "../choreography";

export interface PropOffset {
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Bone the prop is attached to (overrides the default grip bone). */
  bone?: string;
}

export interface CharacterSpec {
  /** Path relative to /models/, e.g. "characters/vrati_a.glb". */
  src: string;
  /** Optional lighter file for the "low" quality preset. */
  srcLow?: string;
  /** Standing height in metres; the model is scaled to it. */
  height: number;
  /** Where the asset came from and under which licence (shown in docs, required). */
  license: string;
  yawOffsetDeg?: number;
  /** Per-hold prop placement in grip-bone space. */
  props?: Partial<Record<HoldId, PropOffset>>;
}

export interface ModelManifest {
  version: 1;
  /** Shared animation file, relative to /models/ (e.g. "anims/chhath_clips.glb"). */
  clips: string | null;
  /** Speed (m/s) at which the walk clip's feet don't slide at timeScale 1. */
  walkSpeed: number;
  yawOffsetDeg?: number;
  characters: Partial<Record<LookId, CharacterSpec>>;
}

let cache: Promise<ModelManifest | null> | null = null;

export function loadManifest() {
  if (!cache) {
    cache = fetch(asset("/models/manifest.json"))
      .then((r) => (r.ok ? (r.json() as Promise<ModelManifest>) : null))
      .catch(() => null);
  }
  return cache;
}

export const modelUrl = (p: string) => asset(`/models/${p.replace(/^\/+/, "")}`);

export function useModelManifest() {
  const [m, setM] = useState<ModelManifest | null>(null);
  useEffect(() => {
    let alive = true;
    loadManifest().then((v) => alive && setM(v));
    return () => {
      alive = false;
    };
  }, []);
  return m;
}

export function hasRealisticCharacters(m: ModelManifest | null) {
  return !!m && !!m.clips && Object.keys(m.characters).length > 0;
}
