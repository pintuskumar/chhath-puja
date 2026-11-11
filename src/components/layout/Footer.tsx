"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { days } from "@/content/days";
import { BorderBand } from "../illustrations/Madhubani";

export function Footer() {
  const { t } = useT();
  return (
    <footer className="relative bg-night text-cream">
      <BorderBand className="opacity-90" />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-gold" lang="hi">
            छठ महापर्व
          </p>
          <p className="mt-2 text-cream/85">{t("tagline")}</p>
        </div>
        <nav aria-label={t("navDays")}>
          <ul className="grid gap-2">
            {days.map((d) => (
              <li key={d.slug}>
                <Link href={`/day/${d.slug}`} className="hover:text-gold">
                  {t(d.subtitle)} · {t(d.title)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/explore" className="hover:text-gold">
                {t("navExplore")}
              </Link>
            </li>
            <li>
              <Link href="/traditions" className="hover:text-gold">
                {t("navTraditions")}
              </Link>
            </li>
          </ul>
        </nav>
        <p className="text-sm leading-relaxed text-cream/80">{t("footerNote")}</p>
      </div>
    </footer>
  );
}
