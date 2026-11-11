"use client";

import { Sun, Sunrise, Sunset, Moon } from "lucide-react";
import { useExperience } from "@/lib/store";
import { useT, formatHour } from "@/lib/i18n";
import { SUNRISE, SUNSET } from "@/lib/sky";
import type { Day } from "@/content/types";

export function useStageHour(day: Day) {
  const active = useExperience((s) => s.activeScene);
  const override = useExperience((s) => s.timeOverride);
  const scroll = useExperience((s) => s.dayScroll);
  const tc = day.timeControl;
  if (override !== null) return override;
  if (tc?.kind === "scroll") return tc.min + (tc.max - tc.min) * scroll;
  return day.scenes[Math.min(active, day.scenes.length - 1)].stage.timeOfDay;
}

function Icon({ h }: { h: number }) {
  if (h < SUNRISE - 0.5 || h > SUNSET + 0.7) return <Moon aria-hidden="true" className="h-4 w-4" />;
  if (h < SUNRISE + 1.2) return <Sunrise aria-hidden="true" className="h-4 w-4" />;
  if (h > SUNSET - 1.2) return <Sunset aria-hidden="true" className="h-4 w-4" />;
  return <Sun aria-hidden="true" className="h-4 w-4" />;
}

/**
 * TimeOfDayController — slider for Kharna (afternoon → evening) and
 * Sandhya Arghya (sun position); read-out for Usha Arghya (scroll-driven).
 */
export function TimeOfDayController({ day }: { day: Day }) {
  const tc = day.timeControl;
  const override = useExperience((s) => s.timeOverride);
  const setOverride = useExperience((s) => s.setTimeOverride);
  const hour = useStageHour(day);
  const { t, lang } = useT();
  if (!tc) return null;
  const id = `tod-${day.slug}`;
  if (tc.kind === "scroll") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-night/70 px-3 py-2 text-sm text-cream" aria-live="off">
        <Icon h={hour} />
        <span>{t(tc.label)}</span>
        <span className="tabular-nums text-gold">{formatHour(hour, lang)}</span>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-night/70 px-3 py-1.5 text-cream">
      <label htmlFor={id} className="flex shrink-0 items-center gap-1.5 text-sm">
        <Icon h={hour} />
        <span className="hidden sm:inline">{t(tc.label)}</span>
      </label>
      <input
        id={id}
        type="range"
        className="range min-w-0 flex-1"
        min={tc.min}
        max={tc.max}
        step={0.05}
        value={hour}
        aria-valuetext={formatHour(hour, lang)}
        onChange={(e) => setOverride(Number(e.target.value))}
      />
      <output htmlFor={id} className="w-16 shrink-0 text-right text-sm tabular-nums text-gold">
        {formatHour(hour, lang)}
      </output>
      {override !== null && (
        <button type="button" onClick={() => setOverride(null)} className="shrink-0 rounded-full px-2 py-1 text-xs underline">
          {t("followScene")}
        </button>
      )}
    </div>
  );
}
