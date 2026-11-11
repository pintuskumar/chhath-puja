"use client";

/** Scene-specific educational widgets (2D, CSS/SVG). */
import { useExperience } from "@/lib/store";
import { useT } from "@/lib/i18n";
import type { L } from "@/content/types";

/* ───────── Day 1: cooking stages scrubber ───────── */

const STAGES: { label: L; detail: L }[] = [
  { label: { hi: "चावल धोना", en: "Washing rice" }, detail: { hi: "अरवा चावल को कई बार साफ़ पानी से धोया जाता है।", en: "Arwa rice is rinsed several times in clean water." } },
  { label: { hi: "भात पकना", en: "Bhaat cooks" }, detail: { hi: "मिट्टी की हाँडी में भात — भाप उठती है।", en: "Rice cooks in the clay pot — steam rises." } },
  { label: { hi: "दाल व कद्दू", en: "Dal & gourd" }, detail: { hi: "चना दाल और लौकी, बिना लहसुन-प्याज़।", en: "Chana dal and bottle gourd, without garlic or onion." } },
  { label: { hi: "परोसना", en: "Serving" }, detail: { hi: "केले के पत्ते पर — पहले व्रती, फिर परिवार।", en: "On banana leaves — the vrati first, then the family." } },
];

export function CookingStages() {
  const scrub = useExperience((s) => s.scrub);
  const setScrub = useExperience((s) => s.setScrub);
  const { t } = useT();
  const value = scrub ?? 0;
  const idx = Math.min(3, Math.floor(value * 4));
  return (
    <div className="rounded-2xl border border-river/30 bg-river/5 p-4">
      <label htmlFor="cook-scrub" className="q-label !mb-2 block">
        {t("cookingStages")}
      </label>
      <input
        id="cook-scrub"
        type="range"
        min={0}
        max={0.999}
        step={0.01}
        value={value}
        onChange={(e) => setScrub(Number(e.target.value))}
        aria-valuetext={t(STAGES[idx].label)}
        className="range range-light w-full"
      />
      <ol className="mt-2 grid grid-cols-4 gap-1 text-center text-xs">
        {STAGES.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setScrub(i / 4 + 0.05)}
              className={`w-full rounded-lg px-1 py-2 font-semibold transition-colors ${scrub !== null && i === idx ? "bg-river text-cream" : "bg-white text-night hover:bg-river/10"}`}
              aria-current={scrub !== null && i === idx ? "step" : undefined}
            >
              {t(s.label)}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm" aria-live="polite">
        {scrub === null ? t("scrubHint") : t(STAGES[idx].detail)}
      </p>
      {scrub !== null && (
        <button type="button" className="mt-2 text-sm font-semibold text-river underline" onClick={() => setScrub(null)}>
          {t("play")}
        </button>
      )}
    </div>
  );
}

/* ───────── Day 2 / Journey: the observance timeline ───────── */

const MARKS: { at: number; label: L; kind: "meal" | "arghya" | "fast" }[] = [
  { at: 12.8, label: { hi: "नहाय-खाय भोजन", en: "Nahay Khay meal" }, kind: "meal" },
  { at: 24 + 19, label: { hi: "खरना प्रसाद", en: "Kharna prasad" }, kind: "meal" },
  { at: 48 + 17, label: { hi: "संध्या अर्घ्य", en: "Sandhya Arghya" }, kind: "arghya" },
  { at: 72 + 6, label: { hi: "उषा अर्घ्य", en: "Usha Arghya" }, kind: "arghya" },
  { at: 72 + 7.2, label: { hi: "पारण", en: "Paran" }, kind: "meal" },
];

/** Illustrated 4-day timeline with the ~36 h nirjala band. */
export function ObservanceTimeline({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const start = 0;
  const end = 84;
  const x = (h: number) => 20 + ((h - start) / (end - start)) * 760;
  const dayNames: L[] = [
    { hi: "नहाय-खाय", en: "Nahay Khay" },
    { hi: "खरना", en: "Kharna" },
    { hi: "संध्या अर्घ्य", en: "Sandhya Arghya" },
    { hi: "उषा अर्घ्य", en: "Usha Arghya" },
  ];
  return (
    <figure className="w-full">
      <svg viewBox="0 0 800 170" className="w-full" role="img" aria-labelledby="obs-title obs-desc">
        <title id="obs-title">{t("nirjalaBand")}</title>
        <desc id="obs-desc">
          {MARKS.map((m) => t(m.label)).join(" → ")}
        </desc>
        {[0, 1, 2, 3].map((d) => (
          <g key={d}>
            {/* night shading */}
            <rect x={x(d * 24)} y="40" width={x(d * 24 + 6) - x(d * 24)} height="60" fill="#101D38" opacity="0.18" />
            {d * 24 + 17 < end && (
              <rect x={x(d * 24 + 17)} y="40" width={x(Math.min(end, d * 24 + 24)) - x(d * 24 + 17)} height="60" fill="#101D38" opacity="0.18" />
            )}
            <line x1={x(d * 24)} x2={x(d * 24)} y1="30" y2="110" stroke="#681C29" strokeWidth="1" strokeDasharray="3 3" />
            <text x={x(d * 24 + 12)} y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill="#681C29">
              {t(dayNames[d])}
            </text>
          </g>
        ))}
        <rect x={x(43)} y="58" width={x(79.2) - x(43)} height="24" rx="12" fill="#276C80" />
        <text x={(x(43) + x(79.2)) / 2} y="75" textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFF5DF">
          {t("nirjalaBand")}
        </text>
        {MARKS.map((m, i) => (
          <g key={i}>
            <circle cx={x(m.at)} cy="70" r="9" fill={m.kind === "arghya" ? "#E97824" : "#F6B93B"} stroke="#681C29" strokeWidth="2" />
            {!compact && (
              <text x={x(m.at)} y={i % 2 ? 140 : 125} textAnchor="middle" fontSize="12" fill="#101D38">
                {t(m.label)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 text-xs text-night/70">{t("dateNote")}</figcaption>
    </figure>
  );
}

/* ───────── Day 3: side-scrolling 2D procession (dissolves into 3D) ───────── */

export function ProcessionStrip() {
  const fig = (x: number, color: string, carry: boolean, cane = false, key?: number) => (
    <g key={key} transform={`translate(${x} 0)`}>
      <path d="M-16 120 L-9 66 L9 66 L16 120 Z" fill={color} stroke="#681C29" strokeWidth="2" />
      <path d="M-9 66 L-8 40 L8 40 L9 66 Z" fill={color} stroke="#681C29" strokeWidth="2" />
      <circle cx="0" cy="30" r="9" fill="#8f5d3e" stroke="#681C29" strokeWidth="2" />
      {carry && (
        <g>
          <path d="M-8 40 L-12 14 M8 40 L12 14" stroke="#8f5d3e" strokeWidth="4" strokeLinecap="round" />
          <path d="M-22 18 L22 18 L17 4 L-17 4 Z" fill="#c99a52" stroke="#681C29" strokeWidth="2" />
          <path d="M-18 4 Q0 -10 18 4" fill="#F6B93B" stroke="#681C29" strokeWidth="1.5" />
        </g>
      )}
      {cane && (
        <g>
          <rect x="14" y="-30" width="5" height="150" fill="#5b2f4a" />
          <path d="M16 -30 q-20 -16 -30 -26 M16 -30 q18 -18 26 -28" stroke="#6f9a3a" strokeWidth="4" fill="none" />
        </g>
      )}
    </g>
  );
  const people = [
    [60, "#f3ead6", true, false],
    [130, "#F6B93B", false, false],
    [190, "#f3ead6", false, true],
    [260, "#681C29", false, false],
    [420, "#f3ead6", true, false],
    [490, "#E97824", false, false],
    [560, "#d8352a", false, false],
    [700, "#f3ead6", true, false],
    [770, "#F6B93B", false, true],
  ] as const;
  return (
    <div data-strip className="pointer-events-none absolute inset-x-0 top-[18%] overflow-hidden" aria-hidden="true">
      <div data-strip-track className="w-[200%] md:w-[140%]">
        <svg viewBox="0 0 900 160" className="h-36 w-full md:h-48">
          <rect y="120" width="900" height="8" fill="#681C29" />
          {Array.from({ length: 45 }, (_, i) => (
            <path key={i} d={`M${i * 20} 128 l10 12 l10 -12`} fill="#E97824" />
          ))}
          {people.map(([x, c, carry, cane], i) => fig(x, c, carry, cane, i))}
        </svg>
      </div>
    </div>
  );
}
