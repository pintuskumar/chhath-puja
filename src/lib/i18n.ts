"use client";

import { useCallback } from "react";
import { usePrefs } from "./store";
import type { L, LList, Lang } from "@/content/types";
import { ui, type UiKey } from "@/content/ui";

/**
 * Lightweight, fully typed localization.
 * - Hindi is the default and is what the server pre-renders (good for SEO in the primary audience language).
 * - The visitor's choice is persisted locally and applied after hydration.
 * - Works with static export (no server middleware needed), which next-intl's routing would require.
 */
export function useLang(): Lang {
  return usePrefs((s) => s.lang);
}

export function useT() {
  const lang = useLang();
  const t = useCallback(
    (v: L | UiKey): string => {
      if (typeof v === "string") return ui[v][lang];
      return v[lang] || v.hi;
    },
    [lang],
  );
  const tl = useCallback((v: LList): string[] => (v[lang]?.length ? v[lang] : v.hi), [lang]);
  return { t, tl, lang };
}

export function pick(v: L, lang: Lang) {
  return v[lang] || v.hi;
}

const hiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
/** Devanagari numerals are used sparingly for decorative counters; data stays numeric. */
export function num(n: number, lang: Lang) {
  if (lang === "en") return String(n);
  return String(n)
    .split("")
    .map((c) => (/\d/.test(c) ? hiDigits[Number(c)] : c))
    .join("");
}

export function formatHour(h: number, lang: Lang) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const d = new Date(2026, 10, 15, hh, mm);
  return d.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" });
}

export function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
