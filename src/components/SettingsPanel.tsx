"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Dialog } from "./Dialog";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePrefs, type MotionPref, type Quality, type RendererPref } from "@/lib/store";
import { useT } from "@/lib/i18n";
import type { UiKey } from "@/content/ui";

function Radio<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: [T, UiKey][];
  onChange: (v: T) => void;
}) {
  const { t } = useT();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 font-bold text-maroon">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, k]) => (
          <label
            key={v}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-saffron ${
              value === v ? "border-maroon bg-maroon text-cream" : "border-maroon/30 bg-white hover:border-maroon"
            }`}
          >
            <input type="radio" className="sr-only" name={legend} value={v} checked={value === v} onChange={() => onChange(v)} />
            {t(k)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const { t } = useT();
  const p = usePrefs();
  return (
    <>
      <button type="button" className="btn-icon text-cream" aria-label={t("settings")} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <Settings2 aria-hidden="true" className="h-5 w-5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t("settings")} variant="center">
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-bold text-maroon">{t("language")}</p>
            <LanguageSwitcher className="!bg-night" />
          </div>
          <Radio<RendererPref>
            legend={t("renderer")}
            value={p.renderer}
            onChange={p.setRenderer}
            options={[
              ["auto", "qAuto"],
              ["3d", "r3d"],
              ["2d", "r2d"],
            ]}
          />
          <Radio<Quality>
            legend={t("quality")}
            value={p.quality}
            onChange={p.setQuality}
            options={[
              ["auto", "qAuto"],
              ["low", "qLow"],
              ["medium", "qMedium"],
              ["high", "qHigh"],
            ]}
          />
          <Radio<MotionPref>
            legend={t("motion")}
            value={p.motion}
            onChange={p.setMotion}
            options={[
              ["system", "mSystem"],
              ["reduced", "mReduced"],
              ["full", "mFull"],
            ]}
          />
          <div>
            <label htmlFor="vol" className="mb-1 block font-bold text-maroon">
              {t("volume")}
            </label>
            <input
              id="vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={p.volume}
              onChange={(e) => p.setVolume(Number(e.target.value))}
              className="range w-full"
            />
            <p className="mt-1 text-sm text-night/70">{t("audioNote")}</p>
          </div>
          <button type="button" onClick={p.resetProgress} className="btn-secondary">
            {t("resetProgress")}
          </button>
        </div>
      </Dialog>
    </>
  );
}
