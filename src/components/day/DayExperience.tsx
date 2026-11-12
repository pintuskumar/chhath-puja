"use client";

/**
 * DayExperience — one day of Chhath, in two modes:
 *  A. Guided story: a sticky stage with scroll-driven scenes (GSAP ScrollTrigger).
 *  B. Explore freely: free camera, scene tabs, every scene/object one tap away.
 */
import { IntentLink as Link } from "../IntentLink";
import { useCallback, useEffect, useRef, type ReactNode, type KeyboardEvent } from "react";
import { ArrowRight, ArrowLeft, BookOpenText, Compass } from "lucide-react";
import { useExperience, usePrefs } from "@/lib/store";
import { useReducedMotion, useHydrated } from "@/lib/device";
import { useT, num, formatDate } from "@/lib/i18n";
import { days } from "@/content/days";
import type { Day, Scene } from "@/content/types";
import { DayStage, StageOverlay } from "./DayStage";
import { DayScene } from "./DayScene";
import { SceneController } from "./SceneController";
import { ScrollStoryController } from "./ScrollStoryController";
import { CookingStages, ObservanceTimeline, ProcessionStrip } from "./widgets";
import { NoteList } from "../NoteBadge";
import { RitualExplanationPanel } from "../RitualExplanationPanel";
import { SunMotif, BorderBand } from "../illustrations/Madhubani";

function sceneExtra(scene: Scene): ReactNode {
  if (scene.id === "bhojan-ki-taiyari") return <CookingStages />;
  if (scene.id === "nirjala-vrat") return <ObservanceTimeline compact />;
  return null;
}

export function ModeSwitch() {
  const mode = usePrefs((s) => s.mode);
  const setMode = usePrefs((s) => s.setMode);
  const hydrated = useHydrated();
  const { t } = useT();
  const current = hydrated ? mode : "guided";
  return (
    <div role="radiogroup" aria-label={`${t("modeGuided")} / ${t("modeFree")}`} className="inline-flex rounded-full bg-night/70 p-1 text-cream">
      {(
        [
          ["guided", "modeGuided", BookOpenText],
          ["free", "modeFree", Compass],
        ] as const
      ).map(([m, k, Icon]) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={current === m}
          onClick={() => setMode(m)}
          className={`flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors ${current === m ? "bg-gold text-night" : "hover:bg-cream/10"}`}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
          {t(k)}
        </button>
      ))}
    </div>
  );
}

function DayHeader({ day }: { day: Day }) {
  const { t, lang } = useT();
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
        {t("day")} {num(day.id, lang)} · {t(day.tithi)}
      </p>
      <h1 className="mt-2 font-display text-5xl leading-tight text-cream drop-shadow md:text-7xl">{t(day.title)}</h1>
      <p className="mt-2 text-2xl text-gold">{t(day.theme)}</p>
      <p className="mt-1 text-sm text-cream/80">
        <time dateTime={day.date2026}>{formatDate(day.date2026, lang)}</time> · {t("dateNote")}
      </p>
      <p className="mt-4 text-lg leading-relaxed text-cream/95">{t(day.description)}</p>
    </div>
  );
}

function DayOutro({ day }: { day: Day }) {
  const { t, lang } = useT();
  const idx = days.findIndex((d) => d.slug === day.slug);
  const prev = days[idx - 1];
  const next = days[idx + 1];
  const finale = !next;
  return (
    <section className="relative bg-cream px-5 py-16 text-night" aria-labelledby={`${day.slug}-outro`}>
      <div className="mx-auto max-w-5xl">
        {finale && (
          <div className="mb-14 text-center">
            <SunMotif className="mx-auto h-28 w-28 motion-safe:animate-floaty" />
            <p id={`${day.slug}-outro`} className="mx-auto mt-6 max-w-3xl font-display text-3xl leading-snug text-maroon md:text-5xl">
              {t("blessing")}
            </p>
          </div>
        )}
        {day.culturalNotes.length > 0 && (
          <div className="mb-12">
            <h2 id={finale ? undefined : `${day.slug}-outro`} className="mb-4 font-display text-3xl text-maroon">
              {t("regional")}
            </h2>
            <NoteList notes={day.culturalNotes} />
          </div>
        )}
        {finale && (
          <div className="mb-12">
            <h2 className="mb-6 font-display text-3xl text-maroon">{t("completeJourney")}</h2>
            <ObservanceTimeline />
            <ol className="mt-8 grid gap-4 md:grid-cols-4">
              {days.map((d) => (
                <li key={d.slug}>
                  <Link href={`/day/${d.slug}`} className="block h-full rounded-2xl border border-maroon/15 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-warm">
                    <span className="text-xs font-bold uppercase tracking-wider text-river">
                      {t("day")} {num(d.id, lang)}
                    </span>
                    <span className="mt-1 block font-display text-2xl text-maroon">{t(d.title)}</span>
                    <span className="mt-1 block text-sm text-night/75">{t(d.theme)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
        <BorderBand className="mb-8" />
        <nav className="flex flex-wrap items-center justify-between gap-4" aria-label={t("navDays")}>
          {prev ? (
            <Link href={`/day/${prev.slug}`} className="btn-secondary">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {t("prevDay")}: {t(prev.title)}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/day/${next.slug}`} className="btn-primary">
              {t("nextDay")}: {t(next.title)} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          ) : (
            <Link href="/explore" className="btn-primary">
              {t("navExplore")} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </div>
    </section>
  );
}

function Guided({ day, reduced }: { day: Day; reduced: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const { t } = useT();
  const go = useCallback((i: number) => {
    const el = container.current?.querySelector<HTMLElement>(`[data-scene-index="${i}"]`);
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [reduced]);
  const active = useExperience((s) => s.activeScene);
  return (
    <>
      <div ref={container} className="relative">
        {/* sticky stage */}
        <div className="sticky top-0 h-[100dvh] w-full">
          <DayStage day={day} free={false} />
        </div>
        {/* toolbar + photo credit: its own sticky layer *above* the scene cards (z-20 > z-10),
            so they stay readable and tappable while a card scrolls underneath */}
        <div className="pointer-events-none sticky top-0 z-20 -mt-[100dvh] h-[100dvh] w-full">
          <StageOverlay day={day} onPrev={() => go(Math.max(0, active - 1))} onNext={() => go(Math.min(day.scenes.length - 1, active + 1))} />
        </div>
        {/* scroll narrative over the stage */}
        <div className="pointer-events-none relative z-10 -mt-[100dvh]">
          <header className="flex min-h-[100dvh] items-end bg-gradient-to-t from-night/85 via-night/30 to-transparent px-5 pb-44 pt-32 md:items-center md:pb-10">
            <div className="pointer-events-auto mx-auto w-full max-w-7xl">
              <DayHeader day={day} />
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ModeSwitch />
                <span className="text-sm text-cream/80">{t("modeGuidedDesc")}</span>
              </div>
            </div>
          </header>
          {day.scenes.map((scene) => (
            <section
              key={scene.id}
              id={scene.id}
              data-scene-index={scene.index}
              aria-labelledby={`${scene.id}-title`}
              className="relative flex min-h-[135dvh] items-start px-3 pb-28 pt-[52dvh] md:items-center md:px-6 md:pb-10 md:pt-24"
            >
              {scene.id === "ghat-ki-or" && <ProcessionStrip />}
              <div className="mx-auto w-full max-w-7xl">
                <div data-reveal className="pointer-events-auto w-full max-w-xl">
                  <DayScene scene={scene} total={day.scenes.length} accent={day.accent} extra={sceneExtra(scene)} />
                </div>
              </div>
            </section>
          ))}
          <div className="h-[30dvh]" aria-hidden="true" />
        </div>
      </div>
      {/* Must be a later sibling of the container: a child's layout effect runs before its parent's ref is attached. */}
      <ScrollStoryController container={container} reduced={reduced} />
      <DayOutro day={day} />
    </>
  );
}

function Free({ day }: { day: Day }) {
  const active = useExperience((s) => s.activeScene);
  const setActive = useExperience((s) => s.setActiveScene);
  const { t, lang } = useT();
  const scene = day.scenes[Math.min(active, day.scenes.length - 1)];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % day.scenes.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + day.scenes.length) % day.scenes.length;
    else return;
    e.preventDefault();
    setActive(n);
    tabs.current[n]?.focus();
  };
  return (
    <>
      <div className="relative flex min-h-[100dvh] flex-col lg:flex-row">
        <div className="relative h-[58dvh] w-full lg:h-[100dvh] lg:flex-1">
          <DayStage day={day} free />
          <div className="pointer-events-none absolute inset-0 z-20">
            <StageOverlay day={day} onPrev={() => setActive(Math.max(0, active - 1))} onNext={() => setActive(Math.min(day.scenes.length - 1, active + 1))} />
          </div>
        </div>
        <aside className="relative z-10 w-full bg-cream text-night lg:h-[100dvh] lg:w-[30rem] lg:overflow-y-auto lg:pt-28" aria-label={t(day.title)}>
          <div className="space-y-4 p-4">
            <div className="rounded-2xl bg-night p-4 text-cream">
              <p className="text-xs font-bold uppercase tracking-wider text-gold">
                {t("day")} {num(day.id, lang)} · {t(day.theme)}
              </p>
              <h1 className="mt-1 font-display text-4xl">{t(day.title)}</h1>
              <div className="mt-3">
                <ModeSwitch />
              </div>
              <p className="mt-2 text-sm text-cream/80">{t("modeFreeDesc")}</p>
            </div>
            <div role="tablist" aria-label={t("scenes")} className="flex gap-2 overflow-x-auto pb-1">
              {day.scenes.map((s, i) => (
                <button
                  key={s.id}
                  ref={(el) => void (tabs.current[i] = el)}
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={i === active}
                  aria-controls="free-panel"
                  tabIndex={i === active ? 0 : -1}
                  onKeyDown={(e) => onKey(e, i)}
                  onClick={() => setActive(i)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold ${i === active ? "border-maroon bg-maroon text-cream" : "border-maroon/25 bg-white hover:border-maroon"}`}
                >
                  {num(i + 1, lang)}. {t(s.title)}
                </button>
              ))}
            </div>
            <div id="free-panel" role="tabpanel" aria-labelledby={`tab-${scene.id}`}>
              <DayScene key={scene.id} scene={scene} total={day.scenes.length} accent={day.accent} extra={sceneExtra(scene)} defaultOpen headingLevel={2} />
            </div>
          </div>
        </aside>
      </div>
      <DayOutro day={day} />
    </>
  );
}

export function DayExperience({ day }: { day: Day }) {
  const enterDay = useExperience((s) => s.enterDay);
  const mode = usePrefs((s) => s.mode);
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  useEffect(() => {
    enterDay(day.slug);
    // deep link to a scene, e.g. /day/kharna#sandhya-puja
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const i = day.scenes.findIndex((s) => s.id === hash);
    if (i > 0) {
      useExperience.getState().setActiveScene(i);
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }));
    }
  }, [day, enterDay]);
  const free = hydrated && mode === "free";
  return (
    <>
      <SceneController day={day} />
      {free ? <Free day={day} /> : <Guided day={day} reduced={reduced} />}
      <RitualExplanationPanel />
    </>
  );
}
