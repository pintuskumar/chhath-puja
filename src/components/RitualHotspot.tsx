"use client";

import { useExperience } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { objectsById } from "@/content/objects";

/**
 * A pulsing marker over a ritual object (inside the 3D scene or the 2D illustration).
 * Real <button>: keyboard focusable, ≥44px touch target, labelled for screen readers.
 */
export function RitualHotspot({ objectId, compact = false }: { objectId: string; compact?: boolean }) {
  const open = useExperience((s) => s.openPanel);
  const { lang, t } = useT();
  const obj = objectsById[objectId];
  if (!obj) return null;
  const name = lang === "hi" ? obj.hindiName : obj.englishName;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        open(objectId);
      }}
      className="group relative flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none"
      aria-label={`${name} — ${t("hotspot")}`}
      aria-haspopup="dialog"
    >
      <span className="absolute inset-1 rounded-full bg-gold/40 motion-safe:animate-pulseRing" aria-hidden="true" />
      <span
        className="relative h-5 w-5 rounded-full border-2 border-cream bg-saffron shadow-[0_0_0_3px_rgba(104,28,41,.55)] transition-transform group-hover:scale-110 group-focus-visible:scale-125 group-focus-visible:ring-4 group-focus-visible:ring-gold"
        aria-hidden="true"
      />
      {!compact && (
        <span
          className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-night/85 px-2.5 py-1 text-xs font-medium text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          {name}
        </span>
      )}
    </button>
  );
}
