# Known limitations & missing assets

Honest status of what is and isn't finished.

## Visual assets
- **All 3D is procedural low-poly**, built from primitives in code (`src/three/`). It is stylised, labelled as such in the UI, and intentionally simple; it is not a photoreal recreation. No artist-made GLB models, rigged characters or mocap animations exist yet — see the 🟡 rows in [ASSET_MANIFEST.md](ASSET_MANIFEST.md).
- **Characters** have no faces, fingers or cloth simulation; hand positions are approximate. Gestures are deliberately limited to simple, documented postures.
- **Water reflections are stylised** (sky + sun glitter + lamp shimmer + ripples). Devotees and diyas are not mirrored in the water.
- **No photography.** `imagePath` is optional in the data model and currently unused; object views are SVG illustrations or procedural 3D.
- **No Open Graph image** (social previews show title/description only).
- Madhubani motifs are original, simplified drawings *inspired by* Mithila art, not commissioned work by a Mithila artist.

## Content
- Content was researched from encyclopaedic, cultural-archive, government and press sources (see `src/content/sources.ts`). **It has not yet had community / practitioner review**, and Hindi has not been proofread by an independent native speaker. Treat it as a reviewed draft.
- Bhojpuri / Maithili / Magahi phrases are mentioned only as song titles and terms; no dialogue in these languages was written, to avoid misrepresenting them.
- The 2026 dates come from almanac summaries; local panchang timings can differ by place.
- Chaiti Chhath (the Chaitra observance) is mentioned but not visualised.

## Audio
- Ambience is **synthesised** (noise, oscillators). It is evocative, not realistic. There are **no Chhath songs**; adding them requires new recordings of traditional songs or licensed tracks.

## Technical
- Localization is client-side (Hindi pre-rendered, English applied after hydration) so the site can be hosted statically. English pages are therefore not separately indexable; a `/en/` route tree (e.g. with `next-intl`) would fix that if a server or per-locale export is added.
- The guided story relies on scroll position; very fast flings can skip the entry animation of a scene (the scene still becomes active and its text is complete).
- Lighthouse in CI runs on a GPU-less VM, so it measures the **2D path**: software WebGL is detected and served the illustration, as real GPU-less devices would be. 3D frame rate on real phones still needs on-device testing (see TESTING_CHECKLIST).
- GitHub Pages deployment needs a one-time settings change by a repo admin (see DEPLOYMENT.md).
- No automated end-to-end (Playwright) tests yet; checks are content integrity, typecheck, build and Lighthouse.
