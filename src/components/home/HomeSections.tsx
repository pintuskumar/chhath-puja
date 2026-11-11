"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, Compass } from "lucide-react";
import { useT, num, formatDate } from "@/lib/i18n";
import { days } from "@/content/days";
import { SceneIllustration } from "../illustrations/SceneIllustration";
import { FishPair, Lotus, BorderBand } from "../illustrations/Madhubani";

export function DaysOverview() {
  const { t, lang } = useT();
  return (
    <section id="four-days" className="relative scroll-mt-20 bg-cream px-5 py-20 text-night" aria-labelledby="four-days-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Lotus className="mb-2 h-10 w-16" />
            <h2 id="four-days-title" className="font-display text-4xl text-maroon md:text-5xl">
              {t("journeyTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-night/80">{t("journeySub")}</p>
          </div>
          <Link href="/journey" className="btn-secondary">
            {t("navJourney")} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {days.map((d) => {
            const s = d.scenes[Math.floor(d.scenes.length / 2)];
            return (
              <li key={d.slug}>
                <Link
                  href={`/day/${d.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-maroon/15 bg-white shadow-sm transition hover:-translate-y-1 hover:border-saffron hover:shadow-warm"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SceneIllustration environment={s.stage.environment} hour={s.stage.timeOfDay} animation={s.stage.animation} interactive={false} />
                    <span className="absolute left-3 top-3 rounded-full bg-night/80 px-3 py-1 text-sm font-bold text-gold">
                      {t("day")} {num(d.id, lang)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-3xl text-maroon">{t(d.title)}</h3>
                    <p className="font-semibold text-saffron-ink">{t(d.theme)}</p>
                    <p className="mt-1 text-sm text-night/70">
                      <time dateTime={d.date2026}>{formatDate(d.date2026, lang)}</time>
                    </p>
                    <p className="mt-3 line-clamp-4 flex-1 text-[0.95rem] leading-relaxed text-night/85">{t(d.description)}</p>
                    <span className="mt-4 inline-flex items-center gap-1 font-semibold text-river group-hover:gap-2">
                      {t("startDay")} <ArrowRight aria-hidden="true" className="h-4 w-4 transition-all" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-sm text-night/70">{t("dateNote")}</p>
      </div>
    </section>
  );
}

export function HowToExperience() {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden bg-maroon px-5 py-20 text-cream" aria-labelledby="modes-title">
      <FishPair className="pointer-events-none absolute -right-10 top-6 h-40 w-80 opacity-25" />
      <div className="mx-auto max-w-5xl">
        <h2 id="modes-title" className="font-display text-4xl md:text-5xl">
          {t("core")}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(
            [
              [BookOpenText, "modeGuided", "modeGuidedDesc"],
              [Compass, "modeFree", "modeFreeDesc"],
            ] as const
          ).map(([Icon, title, desc]) => (
            <div key={title} className="rounded-3xl border border-cream/20 bg-night/30 p-6">
              <Icon aria-hidden="true" className="h-8 w-8 text-gold" />
              <h3 className="mt-3 font-display text-2xl text-gold">{t(title)}</h3>
              <p className="mt-2 text-cream/90">{t(desc)}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/day/nahay-khay" className="btn-primary">
            {t("ctaStart")} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link href="/explore" className="btn-ghost">
            {t("navExplore")}
          </Link>
          <Link href="/traditions" className="btn-ghost">
            {t("navTraditions")}
          </Link>
        </div>
      </div>
      <BorderBand className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
