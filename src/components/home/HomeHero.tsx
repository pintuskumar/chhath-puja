"use client";

/**
 * Cinematic introduction: a pre-dawn river ghat where the sun slowly rises.
 * 2D illustration renders first (fast LCP, also the low-power fallback);
 * the 3D scene loads lazily on capable devices.
 */
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { use3D, useEffectiveQuality, useReducedMotion } from "@/lib/device";
import { useT } from "@/lib/i18n";
import { SceneIllustration } from "../illustrations/SceneIllustration";
import type { SceneStage } from "@/content/types";

const ExperienceCanvas = dynamic(() => import("../ExperienceCanvas"), { ssr: false });

const HERO: { stage: SceneStage; objects: string[] }[] = [
  { stage: { environment: "ghat", timeOfDay: 6.45, camera: "ghat-hero", animation: "stand-in-water", duration: 10 }, objects: [] },
];

export function HomeHero() {
  const { t } = useT();
  const can3d = use3D();
  const quality = useEffectiveQuality();
  const reduced = useReducedMotion();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const fallback = <SceneIllustration environment="ghat" hour={6.2} animation="stand-in-water" interactive={false} />;

  const start = () => {
    if (reduced) return router.push("/journey");
    setLeaving(true);
    window.setTimeout(() => router.push("/journey"), 700);
  };

  return (
    <section className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden bg-night" aria-labelledby="hero-title">
      <div className="absolute inset-0">
        {can3d ? (
          <ExperienceCanvas
            className="absolute inset-0"
            label={t("heroSub")}
            scenes={HERO}
            quality={quality}
            reduced={reduced}
            hotspots={false}
            fixedIndex={0}
            intro={{ from: 4.7, seconds: 10 }}
            fallback={fallback}
          />
        ) : (
          <div className="absolute inset-0" role="img" aria-label={t("heroSub")}>
            {fallback}
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night/30 via-transparent to-night/80" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col items-center justify-end px-5 pb-24 text-center text-cream md:justify-center md:pb-0">
        <p className="hero-in text-sm font-semibold uppercase tracking-[0.3em] text-gold [animation-delay:.2s]">{t("tagline")}</p>
        <h1 id="hero-title" className="hero-in mt-3 font-display text-6xl leading-tight drop-shadow-lg [animation-delay:.5s] md:text-8xl" lang="hi">
          छठ महापर्व
        </h1>
        <p className="hero-in mt-3 max-w-xl text-xl text-cream/95 [animation-delay:.9s] md:text-2xl">{t("heroSub")}</p>
        <p className="hero-in mt-2 max-w-xl text-cream/80 [animation-delay:1.1s]">{t("core")}</p>
        <div className="hero-in mt-8 flex flex-wrap justify-center gap-3 [animation-delay:1.3s]">
          <button type="button" onClick={start} className="btn-primary text-lg">
            {t("ctaStart")} <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </button>
          <a href="#four-days" className="btn-ghost text-lg">
            {t("ctaDays")}
          </a>
        </div>
      </div>
      <a href="#four-days" className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-cream/85" aria-label={t("scroll")}>
        <span className="flex h-9 w-6 justify-center rounded-full border-2 border-cream/70 pt-1.5" aria-hidden="true">
          <span className="h-2 w-1 rounded-full bg-gold motion-safe:animate-scrollDot" />
        </span>
        <ChevronDown aria-hidden="true" className="h-4 w-4" />
      </a>
      {/* sunrise wipe transition into the journey */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[90] transition-all duration-700 ease-in ${leaving ? "opacity-100" : "opacity-0"}`}
        style={{
          background: "radial-gradient(circle at 50% 70%, #F6B93B 0%, #E97824 35%, #681C29 75%)",
          clipPath: leaving ? "circle(150% at 50% 70%)" : "circle(0% at 50% 70%)",
        }}
      />
    </section>
  );
}
