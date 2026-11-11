"use client";

import { useT } from "@/lib/i18n";

export function SkipLink() {
  const { t } = useT();
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-full bg-gold px-4 py-2 font-bold text-night focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
    >
      {t("skip")}
    </a>
  );
}
