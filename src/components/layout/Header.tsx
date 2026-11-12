"use client";

import { IntentLink as Link } from "../IntentLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useT, num } from "@/lib/i18n";
import { days } from "@/content/days";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { AudioToggle } from "../AudioManager";
import { SettingsButton } from "../SettingsPanel";
import { JourneyProgress } from "../JourneyProgress";
import { SunMotif } from "../illustrations/Madhubani";

const NAV = [
  ["/journey", "navJourney"],
  ["/explore", "navExplore"],
  ["/traditions", "navTraditions"],
] as const;

export function Header() {
  const { t, lang } = useT();
  const path = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const onDay = path.startsWith("/day/");

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-night/90 via-night/70 to-transparent pb-3 text-cream">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-3">
        <Link href="/" className="flex items-center gap-2 rounded-full pr-2 focus-visible:outline-offset-2" aria-label={t("siteName") + " — " + t("navHome")}>
          <SunMotif className="h-9 w-9" />
          <span className="font-display text-xl leading-none" lang="hi">
            छठ महापर्व
          </span>
        </Link>
        <nav aria-label={t("menu")} className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map(([href, key]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors hover:bg-cream/10 ${path === href ? "text-gold" : ""}`}
            >
              {t(key)}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-cream/25" aria-hidden="true" />
          {days.map((d) => (
            <Link
              key={d.slug}
              href={`/day/${d.slug}`}
              aria-current={path === `/day/${d.slug}` ? "page" : undefined}
              className={`rounded-full px-2.5 py-2 text-sm transition-colors hover:bg-cream/10 ${path === `/day/${d.slug}` ? "bg-cream/15 text-gold" : "text-cream/85"}`}
            >
              <span className="mr-1 text-gold/80">{num(d.id, lang)}</span>
              {t(d.title)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <AudioToggle />
          <SettingsButton />
          <button
            type="button"
            className="btn-icon text-cream lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("close") : t("menu")}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {onDay && (
        <div className="mx-auto mt-2 max-w-7xl px-4">
          <JourneyProgress />
        </div>
      )}
      {open && (
        <nav id="mobile-nav" aria-label={t("menu")} className="mx-3 mt-2 rounded-2xl bg-night/95 p-3 shadow-warm lg:hidden">
          <LanguageSwitcher className="mb-3 sm:hidden" />
          <ul className="grid gap-1">
            {[["/", "navHome"] as const, ...NAV].map(([href, key]) => (
              <li key={href}>
                <Link href={href} className="block rounded-xl px-3 py-3 font-semibold hover:bg-cream/10" aria-current={path === href ? "page" : undefined}>
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 px-3 text-xs uppercase tracking-wider text-gold">{t("navDays")}</p>
          <ul className="mt-1 grid grid-cols-2 gap-1">
            {days.map((d) => (
              <li key={d.slug}>
                <Link href={`/day/${d.slug}`} className="block rounded-xl px-3 py-3 hover:bg-cream/10" aria-current={path === `/day/${d.slug}` ? "page" : undefined}>
                  <span className="block text-xs text-gold">
                    {t("day")} {num(d.id, lang)}
                  </span>
                  {t(d.title)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
