"use client";

import { IntentLink as Link } from "./IntentLink";
import { usePrefs, useExperience } from "@/lib/store";
import { useT, num } from "@/lib/i18n";
import { days } from "@/content/days";
import { useHydrated } from "@/lib/device";

/**
 * Persistent progress indicator: four day segments, each subdivided by scene.
 * Visited scenes are saved in localStorage (no account).
 */
export function JourneyProgress({ variant = "bar" }: { variant?: "bar" | "full" }) {
  const progress = usePrefs((s) => s.progress);
  const current = useExperience((s) => s.daySlug);
  const active = useExperience((s) => s.activeScene);
  const hydrated = useHydrated();
  const { t, lang } = useT();
  const total = days.reduce((a, d) => a + d.scenes.length, 0);
  const seen = hydrated ? days.reduce((a, d) => a + (progress[d.slug]?.filter((id) => d.scenes.some((s) => s.id === id)).length ?? 0), 0) : 0;

  return (
    <nav aria-label={t("progress")} className={variant === "full" ? "w-full" : "w-full"}>
      <div className="flex items-center gap-2">
        <ol className="flex flex-1 gap-1.5">
          {days.map((d) => {
            const visited = hydrated ? progress[d.slug] ?? [] : [];
            const isCurrent = current === d.slug;
            return (
              <li key={d.slug} className="flex-1">
                <Link
                  href={`/day/${d.slug}`}
                  className="group block rounded focus-visible:outline-offset-4"
                  aria-current={isCurrent ? "page" : undefined}
                  aria-label={`${t("day")} ${num(d.id, lang)}: ${t(d.title)} — ${visited.length}/${d.scenes.length} ${t("visited")}`}
                >
                  <span className="flex gap-0.5" aria-hidden="true">
                    {d.scenes.map((s, i) => (
                      <span
                        key={s.id}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          isCurrent && i === active ? "bg-cream" : visited.includes(s.id) ? "bg-gold" : "bg-cream/25"
                        }`}
                      />
                    ))}
                  </span>
                  {variant === "full" && (
                    <span className="mt-1 block truncate text-xs text-cream/80 group-hover:text-gold">{t(d.title)}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
        <span className="shrink-0 text-xs tabular-nums text-cream/80" aria-hidden="true">
          {num(seen, lang)}/{num(total, lang)}
        </span>
      </div>
    </nav>
  );
}
