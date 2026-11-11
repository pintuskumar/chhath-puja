"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Lang } from "@/content/types";

export type ExperienceMode = "guided" | "free";
export type Quality = "auto" | "low" | "medium" | "high";
export type MotionPref = "system" | "reduced" | "full";
export type RendererPref = "auto" | "3d" | "2d";
export type SceneState = "entry" | "active" | "paused" | "exit";
export type CameraView = "overview" | "closeup";

interface PrefsSlice {
  lang: Lang;
  mode: ExperienceMode;
  quality: Quality;
  motion: MotionPref;
  renderer: RendererPref;
  audioOn: boolean;
  volume: number;
  /** Visited scene ids per day slug — saved locally, no account needed. */
  progress: Record<string, string[]>;
  setLang: (l: Lang) => void;
  setMode: (m: ExperienceMode) => void;
  setQuality: (q: Quality) => void;
  setMotion: (m: MotionPref) => void;
  setRenderer: (r: RendererPref) => void;
  setAudioOn: (on: boolean) => void;
  setVolume: (v: number) => void;
  markVisited: (day: string, sceneId: string) => void;
  resetProgress: () => void;
}

export const usePrefs = create<PrefsSlice>()(
  persist(
    (set) => ({
      lang: "hi",
      mode: "guided",
      quality: "auto",
      motion: "system",
      renderer: "auto",
      audioOn: false,
      volume: 0.5,
      progress: {},
      setLang: (lang) => set({ lang }),
      setMode: (mode) => set({ mode }),
      setQuality: (quality) => set({ quality }),
      setMotion: (motion) => set({ motion }),
      setRenderer: (renderer) => set({ renderer }),
      setAudioOn: (audioOn) => set({ audioOn }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
      markVisited: (day, sceneId) =>
        set((s) => {
          const list = s.progress[day] ?? [];
          if (list.includes(sceneId)) return s;
          return { progress: { ...s.progress, [day]: [...list, sceneId] } };
        }),
      resetProgress: () => set({ progress: {} }),
    }),
    {
      name: "chhath-mahaparv-prefs",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Never persist audioOn: audible sound must always be user-initiated per visit.
      partialize: (s) => ({
        lang: s.lang,
        mode: s.mode,
        quality: s.quality,
        motion: s.motion,
        renderer: s.renderer,
        volume: s.volume,
        progress: s.progress,
      }),
      // Rehydrated manually in <ClientBoot/> so the server (Hindi) render matches first paint.
      skipHydration: true,
    },
  ),
);

interface ExperienceSlice {
  daySlug: string | null;
  activeScene: number;
  sceneState: SceneState;
  /** User pressed pause (distinct from auto-pause while a panel is open). */
  userPaused: boolean;
  panelObjectId: string | null;
  /** Manual time-of-day override from TimeOfDayController (null = follow scene). */
  timeOverride: number | null;
  /** 0..1 scroll progress across the whole day page (Day 4 sunrise is scroll-driven). */
  dayScroll: number;
  /** Manual scrub of the current scene's ritual animation 0..1 (null = auto play). */
  scrub: number | null;
  view: CameraView;
  replayToken: number;
  enterDay: (slug: string) => void;
  setActiveScene: (i: number) => void;
  setSceneState: (s: SceneState) => void;
  setUserPaused: (p: boolean) => void;
  openPanel: (objectId: string) => void;
  closePanel: () => void;
  setTimeOverride: (t: number | null) => void;
  setDayScroll: (p: number) => void;
  setScrub: (p: number | null) => void;
  setView: (v: CameraView) => void;
  replay: () => void;
}

export const useExperience = create<ExperienceSlice>()((set) => ({
  daySlug: null,
  activeScene: 0,
  sceneState: "entry",
  userPaused: false,
  panelObjectId: null,
  timeOverride: null,
  dayScroll: 0,
  scrub: null,
  view: "overview",
  replayToken: 0,
  enterDay: (slug) =>
    set({
      daySlug: slug,
      activeScene: 0,
      sceneState: "entry",
      userPaused: false,
      panelObjectId: null,
      timeOverride: null,
      dayScroll: 0,
      scrub: null,
      view: "overview",
    }),
  setActiveScene: (i) =>
    set((s) =>
      s.activeScene === i
        ? s
        : { activeScene: i, sceneState: "entry", timeOverride: null, scrub: null, replayToken: s.replayToken + 1 },
    ),
  setSceneState: (sceneState) => set({ sceneState }),
  setUserPaused: (userPaused) => set({ userPaused }),
  openPanel: (panelObjectId) => set({ panelObjectId }),
  closePanel: () => set({ panelObjectId: null }),
  setTimeOverride: (timeOverride) => set({ timeOverride }),
  setDayScroll: (dayScroll) => set({ dayScroll }),
  setScrub: (scrub) => set({ scrub }),
  setView: (view) => set({ view }),
  replay: () => set((s) => ({ replayToken: s.replayToken + 1, sceneState: "entry", scrub: null, userPaused: false })),
}));

/** True when the scene animation should not advance. */
export function isScenePaused(s: Pick<ExperienceSlice, "userPaused" | "panelObjectId" | "scrub">) {
  return s.userPaused || s.panelObjectId !== null || s.scrub !== null;
}
