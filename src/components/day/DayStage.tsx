"use client";

/**
 * The visual stage of a day: lazy 3D canvas, or the 2D illustration
 * (ReducedMotionFallback) when 3D is off. Plus the playback controls bar.
 */
import dynamic from "next/dynamic";
import { Pause, Play, RotateCcw, ScanEye, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useExperience } from "@/lib/store";
import { use3D, useEffectiveQuality, useReducedMotion } from "@/lib/device";
import { useT, num } from "@/lib/i18n";
import { SceneIllustration } from "../illustrations/SceneIllustration";
import { TimeOfDayController, useStageHour } from "./TimeOfDayController";
import type { Day } from "@/content/types";

const ExperienceCanvas = dynamic(() => import("../ExperienceCanvas"), { ssr: false });

/** 2D fallback with an honest label. */
export function ReducedMotionFallback({ day, showLabel }: { day: Day; showLabel: boolean }) {
  const active = useExperience((s) => s.activeScene);
  const hour = useStageHour(day);
  const { t } = useT();
  const scene = day.scenes[Math.min(active, day.scenes.length - 1)];
  return (
    <div className="absolute inset-0">
      <SceneIllustration environment={scene.stage.environment} hour={hour} animation={scene.stage.animation} objects={scene.objects} />
      {showLabel && (
        <p className="absolute left-3 top-24 rounded-full bg-night/70 px-3 py-1 text-xs text-cream md:top-28">{t("fallbackLabel")}</p>
      )}
    </div>
  );
}

export function DayStage({ day, free }: { day: Day; free: boolean }) {
  const can3d = use3D();
  const quality = useEffectiveQuality();
  const reduced = useReducedMotion();
  const { t } = useT();
  const active = useExperience((s) => s.activeScene);
  const scene = day.scenes[Math.min(active, day.scenes.length - 1)];
  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      {can3d ? (
        <ExperienceCanvas
          className="absolute inset-0"
          label={`${t(day.title)} — ${t(scene.title)}. ${t(scene.visualDescription)}`}
          scenes={day.scenes}
          timeControl={day.timeControl}
          quality={quality}
          reduced={reduced}
          free={free}
          fallback={<ReducedMotionFallback day={day} showLabel={false} />}
        />
      ) : (
        <div role="group" aria-label={`${t(day.title)} — ${t(scene.title)}. ${t(scene.visualDescription)}`} className="absolute inset-0">
          <ReducedMotionFallback day={day} showLabel />
        </div>
      )}
    </div>
  );
}

export function StageControls({ day, onPrev, onNext }: { day: Day; onPrev: () => void; onNext: () => void }) {
  const { t, lang } = useT();
  const active = useExperience((s) => s.activeScene);
  const userPaused = useExperience((s) => s.userPaused);
  const setUserPaused = useExperience((s) => s.setUserPaused);
  const replay = useExperience((s) => s.replay);
  const view = useExperience((s) => s.view);
  const setView = useExperience((s) => s.setView);
  const scene = day.scenes[Math.min(active, day.scenes.length - 1)];
  const hasClose = !!scene.stage.closeCamera;
  return (
    <div className="pointer-events-auto flex w-full flex-wrap items-center gap-2" role="toolbar" aria-label={t("settings")}>
      <div className="flex items-center gap-1 rounded-full bg-night/70 p-1 text-cream">
        <button type="button" className="btn-icon" onClick={onPrev} disabled={active === 0} aria-label={t("prevScene")}>
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <span className="min-w-[3.5rem] text-center text-sm tabular-nums" aria-hidden="true">
          {num(active + 1, lang)}/{num(day.scenes.length, lang)}
        </span>
        <button type="button" className="btn-icon" onClick={onNext} disabled={active === day.scenes.length - 1} aria-label={t("nextScene")}>
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
        <span className="mx-0.5 h-6 w-px bg-cream/25" aria-hidden="true" />
        <button type="button" className="btn-icon" aria-pressed={userPaused} onClick={() => setUserPaused(!userPaused)} aria-label={userPaused ? t("play") : t("pause")}>
          {userPaused ? <Play aria-hidden="true" className="h-5 w-5" /> : <Pause aria-hidden="true" className="h-5 w-5" />}
        </button>
        <button type="button" className="btn-icon" onClick={replay} aria-label={t("replay")}>
          <RotateCcw aria-hidden="true" className="h-5 w-5" />
        </button>
        {hasClose && (
          <button
            type="button"
            className="btn-icon"
            aria-pressed={view === "closeup"}
            onClick={() => setView(view === "closeup" ? "overview" : "closeup")}
            aria-label={view === "closeup" ? t("overview") : t("closeup")}
            title={view === "closeup" ? t("overview") : t("closeup")}
          >
            {view === "closeup" ? <Maximize2 aria-hidden="true" className="h-5 w-5" /> : <ScanEye aria-hidden="true" className="h-5 w-5" />}
          </button>
        )}
      </div>
      <TimeOfDayController day={day} />
    </div>
  );
}
