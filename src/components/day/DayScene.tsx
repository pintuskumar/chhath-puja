"use client";

/**
 * DayScene — the text side of a scene. Answers the five questions:
 * क्या (what) · क्यों (why) · कैसे (how) · कब (when) · क्या-क्या लगता है (materials).
 * The explanation never depends on the animation: everything is here as text.
 */
import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useT, num } from "@/lib/i18n";
import { useExperience } from "@/lib/store";
import { objectsById } from "@/content/objects";
import { NoteList, SourceLinks } from "../NoteBadge";
import { ObjectIllustration } from "../illustrations/ObjectIllustration";
import type { Scene } from "@/content/types";

export function ObjectChips({ ids }: { ids: string[] }) {
  const { lang } = useT();
  const open = useExperience((s) => s.openPanel);
  return (
    <ul className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const o = objectsById[id];
        if (!o) return null;
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => open(id)}
              aria-haspopup="dialog"
              className="flex min-h-[44px] items-center gap-2 rounded-full border border-maroon/25 bg-white py-1 pl-1 pr-3 text-sm font-medium text-night transition hover:border-saffron hover:bg-saffron/10"
            >
              <ObjectIllustration model={o.model} className="h-8 w-8" />
              {lang === "hi" ? o.hindiName : o.englishName}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function DayScene({
  scene,
  total,
  accent,
  extra,
  defaultOpen = false,
  headingLevel = 2,
}: {
  scene: Scene;
  total: number;
  accent: string;
  extra?: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: 2 | 3;
}) {
  const { t, tl, lang } = useT();
  const [open, setOpen] = useState(defaultOpen);
  const detailsId = useId();
  const H = headingLevel === 2 ? "h2" : "h3";
  const Q = headingLevel === 2 ? "h3" : "h4";
  return (
    <article className="scene-card" style={{ ["--accent" as string]: accent }} aria-labelledby={`${scene.id}-title`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-river">
        {t("scene")} {num(scene.index + 1, lang)} / {num(total, lang)}
      </p>
      <H id={`${scene.id}-title`} className="mt-1 font-display text-3xl leading-tight text-maroon md:text-4xl">
        {t(scene.title)}
      </H>
      <p className="mt-1 text-lg text-night/80">{t(scene.caption)}</p>

      <section className="mt-4">
        <Q className="q-label">{t("what")}</Q>
        <p className="leading-relaxed">{t(scene.what)}</p>
      </section>

      {extra && <div className="mt-4">{extra}</div>}

      <button
        type="button"
        className="mt-4 inline-flex min-h-[44px] items-center gap-1 rounded-full bg-maroon px-4 text-sm font-semibold text-cream hover:bg-maroon/90"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? t("readLess") : t("readMore")}
        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div id={detailsId} hidden={!open} className="mt-4 space-y-4">
        <section>
          <Q className="q-label">{t("why")}</Q>
          <p className="leading-relaxed">{t(scene.why)}</p>
        </section>
        <section>
          <Q className="q-label">{t("how")}</Q>
          <ol className="ml-5 list-decimal space-y-1 leading-relaxed marker:font-bold marker:text-saffron">
            {tl(scene.how).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
        <section>
          <Q className="q-label">{t("when")}</Q>
          <p className="leading-relaxed">{t(scene.when)}</p>
        </section>
        {scene.objects.length > 0 && (
          <section>
            <Q className="q-label">{t("materials")}</Q>
            <ObjectChips ids={scene.objects} />
          </section>
        )}
        {scene.regionalNotes.length > 0 && (
          <section>
            <Q className="q-label">{t("regional")}</Q>
            <NoteList notes={scene.regionalNotes} />
          </section>
        )}
        <section>
          <Q className="q-label">{t("sceneDescription")}</Q>
          <p className="text-sm leading-relaxed text-night/75">{t(scene.visualDescription)}</p>
        </section>
        <SourceLinks ids={scene.sources} />
      </div>
    </article>
  );
}
