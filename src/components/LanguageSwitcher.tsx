"use client";

import { Languages } from "lucide-react";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/i18n";

/** Two-state toggle; announces the change and switches <html lang>. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const lang = usePrefs((s) => s.lang);
  const setLang = usePrefs((s) => s.setLang);
  const { t } = useT();
  return (
    <div role="group" aria-label={t("language")} className={`inline-flex items-center rounded-full border border-cream/30 bg-night/40 p-0.5 ${className}`}>
      <Languages aria-hidden="true" className="mx-1.5 h-4 w-4 text-gold" />
      {(
        [
          ["hi", "हिन्दी"],
          ["en", "English"],
        ] as const
      ).map(([code, label]) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`min-h-[36px] rounded-full px-3 text-sm font-semibold transition-colors ${
            lang === code ? "bg-gold text-night" : "text-cream hover:bg-cream/10"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
