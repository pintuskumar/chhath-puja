"use client";

import { useT } from "@/lib/i18n";
import { traditionSections, glossary } from "@/content/traditions";
import { sourceList } from "@/content/sources";
import { NoteList, SourceLinks, NoteKindBadge } from "../NoteBadge";
import { BorderBand, SunMotif, FishPair } from "../illustrations/Madhubani";
import type { NoteKind } from "@/content/types";

export function TraditionsView() {
  const { t } = useT();
  const kinds: NoteKind[] = ["belief", "symbolism", "practice", "variation", "care"];
  return (
    <div className="bg-cream text-night">
      <section className="relative overflow-hidden bg-night px-5 pb-14 pt-32 text-cream">
        <FishPair className="pointer-events-none absolute -right-8 bottom-4 h-32 w-64 opacity-30" />
        <div className="mx-auto max-w-4xl">
          <SunMotif className="h-16 w-16" />
          <h1 className="mt-3 font-display text-5xl md:text-6xl">{t("navTraditions")}</h1>
          <p className="mt-3 text-lg text-cream/85">{t("footerNote")}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={t("navTraditions")}>
            {kinds.map((k) => (
              <li key={k}>
                <NoteKindBadge kind={k} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <BorderBand />
      <div className="mx-auto max-w-4xl px-5 py-12">
        <nav aria-label={t("menu")} className="mb-10 rounded-2xl border border-maroon/15 bg-white p-4">
          <ol className="grid gap-1 sm:grid-cols-2">
            {traditionSections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-saffron/10">
                  {t(s.title)}
                </a>
              </li>
            ))}
            <li>
              <a href="#glossary" className="block rounded-lg px-2 py-1.5 hover:bg-saffron/10">
                {t({ hi: "शब्दावली", en: "Glossary" })}
              </a>
            </li>
            <li>
              <a href="#sources" className="block rounded-lg px-2 py-1.5 hover:bg-saffron/10">
                {t("sourcesLabel")}
              </a>
            </li>
          </ol>
        </nav>
        {traditionSections.map((s) => (
          <section key={s.id} id={s.id} className="mb-12 scroll-mt-24" aria-labelledby={`${s.id}-h`}>
            <h2 id={`${s.id}-h`} className="font-display text-3xl text-maroon md:text-4xl">
              {t(s.title)}
            </h2>
            <p className="mt-3 text-lg leading-relaxed">{t(s.body)}</p>
            {s.notes.length > 0 && (
              <div className="mt-4">
                <NoteList notes={s.notes} />
              </div>
            )}
            <SourceLinks ids={s.sources} />
          </section>
        ))}

        <section id="glossary" className="mb-12 scroll-mt-24" aria-labelledby="glossary-h">
          <h2 id="glossary-h" className="font-display text-3xl text-maroon md:text-4xl">
            {t({ hi: "शब्दावली", en: "Glossary" })}
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {glossary.map((g) => (
              <div key={g.term} className="rounded-xl border border-maroon/15 bg-white p-3">
                <dt>
                  <span className="font-display text-xl text-maroon" lang="hi">
                    {g.term}
                  </span>{" "}
                  <span className="text-sm text-night/70" lang="en">
                    ({g.en})
                  </span>
                </dt>
                <dd className="mt-1 text-[0.95rem]">{t(g.meaning)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="sources" className="scroll-mt-24" aria-labelledby="sources-h">
          <h2 id="sources-h" className="font-display text-3xl text-maroon md:text-4xl">
            {t("sourcesLabel")}
          </h2>
          <ul className="mt-4 space-y-3">
            {sourceList.map((s) => (
              <li key={s.id} className="rounded-xl border border-maroon/15 bg-white p-3">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-river underline underline-offset-2">
                  {s.title}
                </a>{" "}
                <span className="text-sm text-night/70">— {s.publisher}</span>
                <p className="mt-1 text-sm">{t(s.usedFor)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
