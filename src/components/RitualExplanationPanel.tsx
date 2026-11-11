"use client";

/**
 * Educational side-sheet for a ritual object. Opening it pauses the scene
 * (see isScenePaused) so the visitor can read without the story moving on.
 */
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { useExperience } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { objectsById } from "@/content/objects";
import { daysBySlug } from "@/content/days";
import { Dialog } from "./Dialog";
import { NoteKindBadge, SourceLinks } from "./NoteBadge";
import { ObjectIllustration } from "./illustrations/ObjectIllustration";

const RitualObjectViewer = dynamic(() => import("./RitualObjectViewer"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-2xl bg-gold/20" />,
});

export function ObjectDetails({ id, viewer = true }: { id: string; viewer?: boolean }) {
  const { t, lang } = useT();
  const o = objectsById[id];
  if (!o) return null;
  const name = lang === "hi" ? o.hindiName : o.englishName;
  return (
    <div className="space-y-5">
      {viewer ? (
        <RitualObjectViewer model={o.model} name={name} />
      ) : (
        <ObjectIllustration model={o.model} className="mx-auto h-48 w-48" title={name} />
      )}
      <div>
        <p className="font-display text-3xl text-maroon" lang="hi">
          {o.hindiName}
        </p>
        <p className="text-sm text-night/70" lang="en">
          {o.englishName}
        </p>
        {o.regionalNames && o.regionalNames.length > 0 && (
          <p className="mt-2 text-sm">
            <span className="font-semibold">{t("regionalNames")}: </span>
            {o.regionalNames.map((r) => `${r.name} (${t(r.note)})`).join(" · ")}
          </p>
        )}
      </div>
      <dl className="space-y-4">
        {(
          [
            ["whatIs", o.description],
            ["whenUsed", o.whenUsed],
            ["howUsed", o.usage],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm font-bold uppercase tracking-wide text-river">{t(k)}</dt>
            <dd className="mt-1 leading-relaxed">{t(v)}</dd>
          </div>
        ))}
        <div>
          <dt className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-river">
            {t("significance")} <NoteKindBadge kind={o.significanceKind} />
          </dt>
          <dd className="mt-1 leading-relaxed">{t(o.significance)}</dd>
        </div>
        <div>
          <dt className="text-sm font-bold uppercase tracking-wide text-river">{t("usedOn")}</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {o.days.map((d) => (
              <span key={d} className="rounded-full bg-saffron/15 px-3 py-0.5 text-sm text-maroon">
                {t(daysBySlug[d].title)}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <SourceLinks ids={o.sources} />
    </div>
  );
}

export function RitualExplanationPanel() {
  const id = useExperience((s) => s.panelObjectId);
  const close = useExperience((s) => s.closePanel);
  const { lang } = useT();
  const onClose = useCallback(() => close(), [close]);
  const o = id ? objectsById[id] : null;
  return (
    <Dialog open={!!o} onClose={onClose} title={o ? (lang === "hi" ? o.hindiName : o.englishName) : ""}>
      {o && <ObjectDetails id={o.id} />}
    </Dialog>
  );
}
