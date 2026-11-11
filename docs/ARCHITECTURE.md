# Architecture

## Layers

```
┌──────────────────────────── content (src/content) ────────────────────────────┐
│ Day ─┬─ Scene { stage: {environment,timeOfDay,camera,animation,duration},      │
│      │          what, why, how[], when, objects[], regionalNotes[], sources[] }│
│      └─ culturalNotes[] (kind: belief | symbolism | practice | variation | care)│
│ RitualObject { hindiName, englishName, description, whenUsed, usage,           │
│                significance(+kind), model, days[], sources[] }                 │
└───────────────┬───────────────────────────────────────────────┬───────────────┘
                │ text                                           │ stage
        ┌───────▼────────┐                             ┌─────────▼──────────┐
        │ DOM components │◄──── zustand stores ───────►│ 3D world (R3F)     │
        │ DayScene, panel│   usePrefs (persisted)      │ Director → snapshot│
        │ controls, 2D   │   useExperience (session)   │ envs, devotees,    │
        └────────────────┘                             │ camera, hotspots   │
                                                       └────────────────────┘
```

* **Content is presentation-free.** Everything a visitor reads lives in `src/content` with Hindi and English side by side. `scripts/check-content.mjs` fails CI if any field is missing a translation or references an unknown object/source.
* **Stage data is not translatable** (`SceneStage`): it tells the 3D/2D renderers which environment, hour, camera preset and ritual animation to show.

## State

| Store | Persisted | Holds |
|---|---|---|
| `usePrefs` | yes (`localStorage`, rehydrated after first paint) | language, mode (guided/free), quality, renderer (auto/3d/2d), motion, volume, visited scenes |
| `useExperience` | no | current day & scene, scene state, user pause, open panel, time override, day scroll, scrub, camera view, replay token |

`audioOn` is deliberately **not** persisted: sound must be re-enabled by a click on each visit.

## Scene lifecycle

`SceneController` (DOM) tracks `entry → active → paused → exit`:

* **entry** — 0.9 s after a scene becomes active (camera flies to its preset, card reveals).
* **active** — ritual animation plays to completion and holds its final pose; ambient motion (water, flames, breathing) continues.
* **paused** — user pause, an explanation panel is open, or the Day 1 cooking scrubber is being used. Ritual time freezes; the text stays readable.
* **exit** — set on cleanup when another scene takes over.

Inside the canvas, `Director` runs first every frame (`useFrame(…, -2)`) and writes a mutable snapshot (`hour`, ritual `t`/`progress`, `actors`). Everything else reads the snapshot from a ref, so the animation loop causes **no React re-renders**.

## Guided vs free

* **Guided** — `ScrollStoryController` creates one ScrollTrigger per scene section (`top 60%` → `bottom 60%`) to set the active scene, one for whole-page progress (Day 4 sunrise), card reveals, and the Day 3 procession strip (scrubbed `xPercent`, then faded as the 3D procession takes over). Scroll sections are `pointer-events: none` except the cards, so 3D hotspots stay clickable.
* **Free** — no scroll coupling; scene tabs (WAI-ARIA tabs with arrow keys) and `OrbitControls`. The camera rig flies to each preset for ~2 s, then hands control to the visitor.

## 3D

* `ExperienceCanvas` is the only full-scene canvas. It is loaded with `next/dynamic` (`ssr: false`) **after load + idle**, so the 2D illustration of the same scene paints first.
* Each environment (`CourtyardEnvironment`, `GhatEnvironment`) is a separate `React.lazy` chunk; only the environment of the active scene is mounted.
* Quality presets: DPR (0.75–1 / 1–1.5 / 1–2), antialiasing, shadow maps (high only), crowd/diya/tree instance counts, water mesh resolution.
* `frameloop`: `always` normally, `demand` with reduced motion (re-render on store change), `never` when the canvas is off-screen or the tab is hidden.
* Draw calls kept low with GPU instancing for crowd (2), diyas (2–4), sugarcane (2), trees (1); shared materials; procedural `CanvasTexture`s (≤ 512 px).
* `Water` is a single `ShaderMaterial`: swell, procedural normals, sun glitter path, sky fresnel, diya shimmer, and up to 6 ripple emitters at devotees standing in the water.
* `Atmosphere` derives sky, fog, sun disc/glow and light colours from `lib/sky.ts` — the **same** model the 2D SVG fallback uses.
* `choreography.ts` is a pure function `(animation, progress, t) → actors`. All ritual postures are listed in one place (`POSES` in `Devotee.tsx`) for cultural review.

## Fallbacks

| Condition | Result |
|---|---|
| No WebGL / context creation fails | `GLBoundary` → 2D `SceneIllustration` with working hotspots |
| Low-power device (≤ 2 GB RAM, ≤ 2 cores, Save-Data) | 2D by default; can be overridden in Settings |
| Reduced motion (OS or site setting) | No camera tweens, ritual shown in final pose, on-demand rendering, CSS animations disabled |
| JS disabled | Server-rendered Hindi text for all scenes and objects |

## i18n

Hindi is pre-rendered (SEO for the primary audience). `useT()` resolves `L` objects or UI keys for the current language; switching updates `<html lang>`. Language is a client preference so the site can be deployed as static files; a locale-prefixed URL scheme (`/en/...`) could be added with `next-intl` if hosting with a server later.
