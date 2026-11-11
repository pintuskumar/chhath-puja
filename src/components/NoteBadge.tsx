"use client";

import { BookOpen, Sparkles, Users, Shuffle, HeartHandshake } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { CulturalNote, NoteKind, SourceId } from "@/content/types";
import { sources } from "@/content/sources";

const KIND: Record<NoteKind, { key: "kindBelief" | "kindSymbolism" | "kindPractice" | "kindVariation" | "kindCare"; cls: string; Icon: typeof BookOpen }> = {
  belief: { key: "kindBelief", cls: "bg-maroon text-cream", Icon: Sparkles },
  symbolism: { key: "kindSymbolism", cls: "bg-gold text-night", Icon: BookOpen },
  practice: { key: "kindPractice", cls: "bg-river text-cream", Icon: Users },
  variation: { key: "kindVariation", cls: "bg-saffron text-night", Icon: Shuffle },
  care: { key: "kindCare", cls: "bg-night text-cream", Icon: HeartHandshake },
};

export function NoteKindBadge({ kind }: { kind: NoteKind }) {
  const { t } = useT();
  const k = KIND[kind];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${k.cls}`}>
      <k.Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {t(k.key)}
    </span>
  );
}

export function NoteList({ notes }: { notes: CulturalNote[] }) {
  const { t } = useT();
  if (!notes.length) return null;
  return (
    <ul className="space-y-3">
      {notes.map((n, i) => (
        <li key={i} className="rounded-xl border border-maroon/15 bg-white/60 p-3">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <NoteKindBadge kind={n.kind} />
            {n.region && <span className="text-xs font-semibold text-maroon">{t(n.region)}</span>}
          </div>
          <p className="text-[0.95rem] leading-relaxed">{t(n.text)}</p>
          {n.sources && <SourceLinks ids={n.sources} />}
        </li>
      ))}
    </ul>
  );
}

export function SourceLinks({ ids }: { ids: SourceId[] }) {
  const { t } = useT();
  if (!ids.length) return null;
  return (
    <p className="mt-2 text-xs text-night/70">
      <span className="font-semibold">{t("sourcesLabel")}: </span>
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && " · "}
          <a href={sources[id].url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-maroon">
            {sources[id].publisher}
          </a>
        </span>
      ))}
    </p>
  );
}
