"use client";

/**
 * Real photographs of a scene's moment (src/content/photos.ts).
 *  - <PhotoCloseup/>: full-stage photo shown in the stage's close-up view (3D stays for wide shots)
 *  - <PhotoFigures/>: the same photos in the scene card, with credit and licence
 */
import { useT } from "@/lib/i18n";
import { asset } from "@/lib/paths";
import { scenePhotos } from "@/content/photos";
import type { ScenePhoto } from "@/content/types";

export const photosFor = (sceneId: string): ScenePhoto[] => scenePhotos[sceneId] ?? [];

function Credit({ p, className = "" }: { p: ScenePhoto; className?: string }) {
  const { t } = useT();
  const { author, license, licenseUrl, sourceUrl } = p.credit;
  const lic = license === "family" ? t("familyPhoto") : license;
  return (
    <span className={className}>
      {t("photo")}:{" "}
      {sourceUrl ? (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2">
          {author}
        </a>
      ) : (
        author
      )}
      {" · "}
      {licenseUrl ? (
        <a href={licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline decoration-dotted underline-offset-2">
          {lic}
        </a>
      ) : (
        lic
      )}
    </span>
  );
}

/** Full-stage photograph for the close-up view, with a slow drift (off for reduced motion). */
export function PhotoCloseup({ sceneId }: { sceneId: string }) {
  const { t } = useT();
  const p = photosFor(sceneId)[0];
  if (!p) return null;
  return (
    <figure className="photo-closeup absolute inset-0 z-[6] m-0 overflow-hidden bg-night" data-testid="photo-closeup">
      <img
        key={p.src}
        src={asset(p.src)}
        width={p.width}
        height={p.height}
        alt={t(p.alt)}
        decoding="async"
        className="photo-drift h-full w-full object-cover"
        style={{ objectPosition: p.focus ?? "50% 50%" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/70 to-transparent" aria-hidden="true" />
      <figcaption className="absolute right-3 top-24 max-w-[min(26rem,calc(100%-1.5rem))] rounded-2xl bg-night/70 px-3 py-2 text-right text-xs text-cream backdrop-blur-sm md:top-28">
        <span className="block font-semibold text-gold">{t("realPhoto")}</span>
        <span className="block text-sm">{t(p.caption)}</span>
        <Credit p={p} className="block opacity-80" />
      </figcaption>
    </figure>
  );
}

/** Photos inside the scene card's full explanation. */
export function PhotoFigures({ sceneId, heading: Q = "h3" }: { sceneId: string; heading?: "h3" | "h4" }) {
  const { t } = useT();
  const list = photosFor(sceneId);
  if (list.length === 0) return null;
  return (
    <section>
      <Q className="q-label">{t("photosOfMoment")}</Q>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <figure key={p.src} className="m-0">
            <img
              src={asset(p.src)}
              width={p.width}
              height={p.height}
              alt={t(p.alt)}
              loading="lazy"
              decoding="async"
              className="h-auto w-full rounded-xl object-cover"
            />
            <figcaption className="mt-1 text-sm leading-snug text-night/80">
              {t(p.caption)} <Credit p={p} className="text-xs text-night/60" />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
