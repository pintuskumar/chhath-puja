"use client";

/**
 * /journey — interactive four-day timeline. Pick a day to see its scenes,
 * with locally saved progress; jump straight to any ritual.
 */
import { IntentLink as Link } from "../IntentLink";
import { useState, type KeyboardEvent } from "react";
import { Check, ArrowRight } from "lucide-react";
import { usePrefs } from "@/lib/store";
import { useT, num, formatDate, formatHour } from "@/lib/i18n";
import { useHydrated } from "@/lib/device";
import { days } from "@/content/days";
import { SunMotif, BorderBand } from "../illustrations/Madhubani";
import { SceneIllustration } from "../illustrations/SceneIllustration";
import { ObservanceTimeline } from "../day/widgets";
import { JourneyProgress } from "../JourneyProgress";

export function JourneyTimeline() {
  const { t, lang } = useT();
  const [sel, setSel] = useState(0);
  const progress = usePrefs((s) => s.progress);
  const hydrated = useHydrated();
  const day = days[sel];
  const onKey = (e: KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % days.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + days.length) % days.length;
    else return;
    e.preventDefault();
    setSel(n);
    document.getElementById(`day-tab-${days[n].slug}`)?.focus();
  };
  return (
    <div className="min-h-screen bg-night text-cream">
      <section className="relative overflow-hidden px-5 pb-10 pt-32">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-5xl md:text-6xl">{t("journeyTitle")}</h1>
          <p className="mt-3 max-w-2xl text-lg text-cream/85">{t("journeySub")}</p>
          <div className="mt-6 max-w-xl">
            <p className="mb-2 text-sm font-semibold text-gold">{t("progress")}</p>
            <JourneyProgress variant="full" />
          </div>
        </div>
        {/* sun arc: sets on day 3, rises on day 4 */}
        <svg viewBox="0 0 1000 200" className="mx-auto mt-10 w-full max-w-6xl" aria-hidden="true">
          <path d="M40 180 Q500 -60 960 180" fill="none" stroke="#F6B93B" strokeWidth="2" strokeDasharray="6 8" />
          {days.map((d, i) => {
            const x = 125 + i * 250;
            const y = 180 - Math.sin((x / 1000) * Math.PI) * 120;
            return (
              <g key={d.slug} opacity={i === sel ? 1 : 0.55}>
                <circle cx={x} cy={y} r={i === sel ? 30 : 20} fill={d.accent} stroke="#FFF5DF" strokeWidth="3" />
                <text x={x} y={y + 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#101D38">
                  {num(d.id, lang)}
                </text>
              </g>
            );
          })}
          <line x1="0" y1="190" x2="1000" y2="190" stroke="#276C80" strokeWidth="6" />
        </svg>
      </section>

      <section className="px-5 pb-20" aria-label={t("navDays")}>
        <div className="mx-auto max-w-7xl">
          <div role="tablist" aria-label={t("navDays")} className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {days.map((d, i) => {
              const seen = hydrated ? progress[d.slug]?.length ?? 0 : 0;
              return (
                <button
                  key={d.slug}
                  id={`day-tab-${d.slug}`}
                  role="tab"
                  aria-selected={i === sel}
                  aria-controls="day-panel"
                  tabIndex={i === sel ? 0 : -1}
                  onClick={() => setSel(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${i === sel ? "border-gold bg-cream text-night" : "border-cream/20 hover:border-cream/60"}`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${i === sel ? "text-river" : "text-gold"}`}>
                    {t("day")} {num(d.id, lang)} · <time dateTime={d.date2026}>{formatDate(d.date2026, lang).split(",").slice(-2).join(",")}</time>
                  </span>
                  <span className={`mt-1 block font-display text-2xl ${i === sel ? "text-maroon" : ""}`}>{t(d.title)}</span>
                  <span className="block text-sm opacity-80">{t(d.theme)}</span>
                  <span className="mt-2 block text-xs opacity-75">
                    {num(seen, lang)}/{num(d.scenes.length, lang)} {t("visited")}
                  </span>
                </button>
              );
            })}
          </div>

          <div id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day.slug}`} className="mt-6 overflow-hidden rounded-3xl bg-cream text-night">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
              <div className="relative min-h-[260px]">
                <SceneIllustration environment={day.scenes[0].stage.environment} hour={day.scenes[Math.min(2, day.scenes.length - 1)].stage.timeOfDay} animation={day.scenes[Math.min(2, day.scenes.length - 1)].stage.animation} interactive={false} />
              </div>
              <div className="p-6 md:p-8">
                <SunMotif className="h-12 w-12" />
                <h2 className="mt-2 font-display text-4xl text-maroon">{t(day.title)}</h2>
                <p className="font-semibold text-saffron-ink">
                  {t(day.tithi)} · {t(day.theme)}
                </p>
                <p className="mt-3 leading-relaxed">{t(day.description)}</p>
                <ol className="mt-5 space-y-2">
                  {day.scenes.map((s) => {
                    const done = hydrated && progress[day.slug]?.includes(s.id);
                    return (
                      <li key={s.id}>
                        <Link href={`/day/${day.slug}#${s.id}`} className="flex items-center gap-3 rounded-xl border border-maroon/10 bg-white px-3 py-2.5 hover:border-saffron">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-river text-cream" : "bg-gold/30 text-maroon"}`}>
                            {done ? <Check aria-label={t("visited")} className="h-4 w-4" /> : num(s.index + 1, lang)}
                          </span>
                          <span className="flex-1">
                            <span className="block font-semibold">{t(s.title)}</span>
                            <span className="block text-xs text-night/70">{formatHour(s.stage.timeOfDay, lang)}</span>
                          </span>
                          <ArrowRight aria-hidden="true" className="h-4 w-4 text-river" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
                <Link href={`/day/${day.slug}`} className="btn-primary mt-6">
                  {t("startDay")} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-cream p-6 text-night">
            <h2 className="mb-4 font-display text-3xl text-maroon">{t("completeJourney")}</h2>
            <ObservanceTimeline />
            <p className="mt-4 rounded-xl bg-night/5 p-3 text-sm">{t("fastingCare")}</p>
          </div>
        </div>
      </section>
      <BorderBand />
    </div>
  );
}
