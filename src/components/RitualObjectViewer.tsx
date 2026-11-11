"use client";

/**
 * RitualObjectViewer — rotatable 3D view of a single ritual object
 * (mouse drag / touch). The WebGL part is a separate lazy chunk; without
 * usable WebGL the 2D illustration is shown and three.js is never downloaded.
 */
import dynamic from "next/dynamic";
import { ObjectIllustration } from "./illustrations/ObjectIllustration";
import { use3D, useReducedMotion } from "@/lib/device";
import { useT } from "@/lib/i18n";
import type { PropModel } from "@/content/types";

const ObjectCanvas = dynamic(() => import("./ObjectCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-gold/10" />,
});

export default function RitualObjectViewer({ model, name, className }: { model: PropModel; name: string; className?: string }) {
  const { t } = useT();
  const can3d = use3D();
  const reduced = useReducedMotion();
  const fallback = <ObjectIllustration model={model} className="h-full w-full" title={name} />;
  const frame = className ?? "relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#fbe7c2] to-cream";
  if (!can3d) return <div className={frame}>{fallback}</div>;
  return (
    <figure className={frame}>
      <ObjectCanvas model={model} reduced={reduced} fallback={fallback} />
      <figcaption className="pointer-events-none absolute bottom-2 left-1/2 w-max max-w-[95%] -translate-x-1/2 rounded-full bg-night/75 px-3 py-1 text-center text-xs text-cream">
        {t("rotateHint")} · {t("procedural")}
      </figcaption>
    </figure>
  );
}
