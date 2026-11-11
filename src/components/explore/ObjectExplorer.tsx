"use client";

/**
 * /explore — gallery of ritual objects. Only the selected object gets a WebGL
 * canvas (one context at a time); thumbnails are SVG.
 */
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { ritualObjects, explorerFeatured, objectsById } from "@/content/objects";
import { days } from "@/content/days";
import { ObjectIllustration } from "../illustrations/ObjectIllustration";
import { ObjectDetails } from "../RitualExplanationPanel";
import { BorderBand } from "../illustrations/Madhubani";
import type { Day } from "@/content/types";

export function ObjectExplorer() {
  const { t, lang } = useT();
  const [filter, setFilter] = useState<Day["slug"] | "all">("all");
  const ordered = [...explorerFeatured.map((id) => objectsById[id]), ...ritualObjects.filter((o) => !explorerFeatured.includes(o.id))];
  const list = ordered.filter((o) => filter === "all" || o.days.includes(filter));
  const [sel, setSel] = useState(ordered[0].id);
  const current = list.find((o) => o.id === sel) ?? list[0];

  return (
    <div className="min-h-screen bg-cream text-night">
      <section className="bg-night px-5 pb-12 pt-32 text-cream">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-5xl md:text-6xl">{t("explorerTitle")}</h1>
          <p className="mt-3 max-w-2xl text-lg text-cream/85">{t("explorerSub")}</p>
          <div role="group" aria-label={t("usedOn")} className="mt-6 flex flex-wrap gap-2">
            {(["all", ...days.map((d) => d.slug)] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold ${filter === f ? "border-gold bg-gold text-night" : "border-cream/30 hover:border-cream"}`}
              >
                {f === "all" ? t("filterAll") : t(days.find((d) => d.slug === f)!.title)}
              </button>
            ))}
          </div>
        </div>
      </section>
      <BorderBand />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_28rem]">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" aria-label={t("explorerTitle")}>
          {list.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => {
                  setSel(o.id);
                  if (window.innerWidth < 1024) document.getElementById("object-detail")?.scrollIntoView({ behavior: "smooth" });
                }}
                aria-pressed={current?.id === o.id}
                className={`flex h-full w-full flex-col items-center rounded-2xl border-2 bg-white p-3 text-center transition hover:-translate-y-0.5 ${current?.id === o.id ? "border-saffron shadow-warm" : "border-maroon/10"}`}
              >
                <ObjectIllustration model={o.model} className="h-24 w-24" />
                <span className="mt-2 font-display text-xl text-maroon" lang="hi">
                  {o.hindiName}
                </span>
                <span className="text-xs text-night/70" lang="en">
                  {o.englishName}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {current && (
          <section id="object-detail" aria-label={lang === "hi" ? current.hindiName : current.englishName} className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-maroon/15 bg-white p-5 shadow-sm">
              <ObjectDetails key={current.id} id={current.id} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
