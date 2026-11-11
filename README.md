# छठ महापर्व · Chhath Mahaparv

**“चार दिन, अनगिनत भावनाएँ, एक अटूट आस्था”**
*देखिए, समझिए और महसूस कीजिए छठ महापर्व की हर परंपरा।*

An immersive, bilingual (Hindi-first, English) 2D + 3D storytelling website that walks visitors through the four days of Chhath Puja — **नहाय-खाय, खरना, संध्या अर्घ्य, उषा अर्घ्य** — with animated rituals, clickable ritual objects and culturally reviewed explanations of *what, why, how, when* and *what is used*.

| | |
|---|---|
| Framework | Next.js 15 App Router (static export), React 19, TypeScript |
| 3D | three.js, React Three Fiber 9, @react-three/drei 10 (procedural low-poly, no external models) |
| 2D / motion | Tailwind CSS, SVG illustrations, GSAP + ScrollTrigger |
| State | Zustand (preferences + local journey progress persisted in `localStorage`) |
| i18n | Typed Hindi/English content model + `useT()` (works with static hosting) |
| Audio | Web Audio API, synthesised in the browser (no recordings) |
| Icons | lucide-react |

---

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
npm run check:content  # translations / references / choreography integrity
npm run typecheck
npm run build          # static site in ./out
npm start              # serve ./out locally
```

Node ≥ 20 is required (≥ 22.6 for `check:content`, which uses Node's native TypeScript type-stripping).

## Routes

| Route | Experience |
|---|---|
| `/` | Cinematic pre-dawn ghat; the sun rises as the page loads. CTAs to the journey and the four days. |
| `/journey` | Interactive four-day timeline, sun arc, per-scene progress, ~36 h nirjala diagram. |
| `/day/nahay-khay` | Day 1 — courtyard, 5 scenes, cooking-stage scrubber, stove / ingredient / water hotspots. |
| `/day/kharna` | Day 2 — afternoon → evening slider, rasiyaw & roti, evening puja, nirjala timeline. |
| `/day/sandhya-arghya` | Day 3 — 6 scenes, sun-position slider, 2D→3D procession, devotees in water with ripples, arghya, kosi. |
| `/day/usha-arghya` | Day 4 — scroll raises the sun, dawn arghya, blessings, paran, finale + full journey. |
| `/explore` | Ritual object explorer: 22 objects, rotatable 3D models, bilingual cards. |
| `/traditions` | Cultural context, belief/symbolism/practice/variation legend, regions, songs, glossary, sources. |

Scenes are deep-linkable: `/day/kharna/#sandhya-puja`.

## Two ways to experience

* **कथा क्रम · Guided story** — scroll; each scene enters, plays its ritual animation, reveals a short explanation, and hands over to the next.
* **स्वतंत्र खोज · Explore freely** — free orbit camera, scene tabs, every object one tap away, detailed text open by default.

Both modes share pause / replay / overview ↔ close-up / time-of-day controls. Opening any object panel pauses the scene.

## Project structure

```
src/
  app/                    routes, layout, sitemap, robots
  content/                ← all educational content (typed, bilingual, sourced)
    types.ts              Day / Scene / RitualObject / CulturalNote model
    days.ts               4 days · 21 scenes
    objects.ts            22 ritual objects & ingredients
    traditions.ts         context sections + glossary
    sources.ts            reference list
    ui.ts                 UI strings
  lib/                    store (zustand), i18n, sky/sun model, device & WebGL detection
  three/                  3D: Director (scene clock), Atmosphere, Water shader, CameraRig,
                          Courtyard & Ghat environments, Devotee, props, choreography, textures
  components/
    ExperienceCanvas.tsx  lazy WebGL canvas (quality, off-screen pause, fallback)
    day/                  DayExperience, DayScene, DayStage, SceneController,
                          ScrollStoryController, TimeOfDayController, widgets
    RitualHotspot, RitualExplanationPanel, RitualObjectViewer, AudioManager,
    JourneyProgress, LanguageSwitcher, SettingsPanel, Dialog, illustrations/ …
docs/                     architecture, asset manifest, sources, testing, deployment, limitations
scripts/                  content checker, Lighthouse summary
```

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for how the pieces fit together.

## Documentation

* [Architecture](docs/ARCHITECTURE.md)
* [Asset manifest](docs/ASSET_MANIFEST.md)
* [Cultural accuracy & sources](docs/CULTURAL_SOURCES.md)
* [Testing checklist](docs/TESTING_CHECKLIST.md)
* [Deployment](docs/DEPLOYMENT.md)
* [Known limitations & missing assets](docs/LIMITATIONS.md)

## A note on respect

Chhath is a living act of faith. This site describes practices; it does not prescribe them. Practices differ between families and regions — **your own elders' way is the authority for your family**. Nothing here encourages imitating the waterless fast.
