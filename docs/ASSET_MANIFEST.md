# Asset manifest

**Status legend:** ✅ shipped (procedural / code-generated) · 🟡 planned production asset · ⛔ deliberately not included

All current visuals are generated in code: there are no external model, texture or audio downloads. The UI labels 3D objects as *“प्रतीकात्मक लो-पॉली मॉडल (कोड से निर्मित) / Stylised low-poly model (generated in code)”*. Production GLB/WebP assets can replace them one by one; each content object has an optional `modelPath` / `imagePath`.

Format policy: **GLB** (Draco or Meshopt + KTX2 textures) for 3D, **SVG** for diagrams and motifs, **AVIF/WebP** for photography.

## 1. Environments

| File / module | Purpose | Format | Budget | Status / creation | Cultural reference requirements |
|---|---|---|---|---|---|
| `src/three/CourtyardEnvironment.tsx` | Day 1–2 (and Day 3/4 home scenes) aangan: house, kitchen, chulha, tulsi, water corner, shrine | Procedural R3F | ~60–90 draw calls | ✅ code | Mud-plastered floor, lime-washed walls, tiled roof, thatched kitchen typical of rural Bihar / east UP |
| `src/three/GhatEnvironment.tsx` | Day 3–4 river ghat: steps, chhatris, far bank, crowd, lamps, canes | Procedural R3F | ~70–110 draw calls (instanced) | ✅ code | Ganga ghats in Patna / Varanasi-style stepped ghats; painted risers seen at Chhath |
| `public/models/env/courtyard.glb` | Production courtyard | GLB + KTX2 | ≤ 1.5 MB | 🟡 artist | Photo reference from a Bhojpur / Mithila village home, reviewed by residents |
| `public/models/env/ghat.glb` | Production ghat set | GLB + KTX2 | ≤ 2 MB | 🟡 artist | Reference: Collectorate / Gai / Kali ghats, Patna; local pond ghats |
| `src/three/Water.tsx` | River surface shader | GLSL | 1 draw call | ✅ code | Calm November river; mist at dawn |
| `src/three/Atmosphere.tsx` + `src/lib/sky.ts` | Sky dome, sun, fog, lights by hour | GLSL + TS | 3 draw calls | ✅ code | Sunrise ≈ 06:00 / sunset ≈ 17:00 (Patna, Nov) |

## 2. Characters

| File / module | Purpose | Format | Budget | Status | Cultural reference |
|---|---|---|---|---|---|
| `src/three/Devotee.tsx` (`LOOKS`) | Vratis (yellow / saffron / red saree, pallu on head), elder, men in dhoti-kurta with gamchha, child | Procedural | ~20 meshes each | ✅ code | Common Chhath attire; long sindoor noted in text only |
| Crowd silhouettes (`GhatEnvironment › Crowd`) | Distant devotees | Instanced lathe + sphere | 2 draw calls | ✅ code | Mixed saree colours |
| `src/three/Devotee.tsx` (`LOOKS`) → now the **fallback** | Used only if a GLB fails to load or the manifest is emptied | Procedural | ~20 meshes each | ✅ code | — |
| `public/models/characters/{vrati_a,vrati_b,vrati_c,elder,man_dhoti,young_man,child}.glb` | Rigged characters (Mixamo skeleton, fingers, grip sockets), generated garments with cotton weave, cloth-simulated drape | GLB, Meshopt + WebP 1024 | 24k tris (child 15k) · 0.58–0.69 MB each | ✅ generated in CI by `characters/blender/build_character.py` · **MakeHuman/MPFB, CC0** | Saree with pallu over the head, bindi + sindoor for the vratis; dhoti/kurta + gamchha; see `docs/VISUAL_AUDIT.md §8` |

## 3. Ritual props (3D)

All ✅ procedural in `src/three/props.tsx`; 🟡 GLB targets ≤ 150 KB each in `public/models/props/<id>.glb`.

| Prop | Model id | Notes for production |
|---|---|---|
| सूप Soop | `soop` | Real bamboo weave pattern; brass variant optional |
| दउरा Daura | `daura` | Round bamboo basket, rim binding; yellow/red cloth cover |
| ठेकुआ Thekua | `thekua` | Mould (sancha) pattern varies by family — capture several |
| नारियल Coconut | `coconut` | With husk fibre, sindoor mark |
| गन्ना Sugarcane | `sugarcane` | Leaves on; kosi canopy assembly |
| दीया Diya | `diya` | Hand-thrown clay, cotton wick |
| कलश Kalash | `kalash` | Brass/clay, mango leaves, coconut |
| मौसमी फल Fruits | `fruits` | Banana bunch, citron (dabh nimbu), water chestnut, sweet potato, turmeric/ginger plants |
| चूल्हा Chulha | `chulha` | Clay U-stove, mango-wood fire |
| बरतन Vessels | `handi` | Clay handi, brass kadhai, lota |
| लोटा Lota | `lota` | Brass / copper |
| Food: लौकी, चावल, दाल, रसियाव, रोटी, गुड़ | `lauki`, `rice`, `dal`, `kheer`, `roti`, `gur` | Photograph real dishes for texture reference |

## 4. Food & object illustrations (2D)

| File | Purpose | Format | Budget | Status |
|---|---|---|---|---|
| `src/components/illustrations/ObjectIllustration.tsx` | Thumbnails + no-WebGL views for all 19 models | Inline SVG | < 2 KB each | ✅ code |
| `public/images/objects/<id>.avif` | Photography of real objects | AVIF + WebP fallback, 800 px | ≤ 60 KB each | 🟡 photographer (with consent of families) |

## 5. Decorative 2D (Madhubani-inspired)

| File | Purpose | Format | Status | Requirement |
|---|---|---|---|---|
| `illustrations/Madhubani.tsx` → `SunMotif`, `FishPair`, `Lotus`, `BorderBand` | Section ornaments, logo | SVG | ✅ original drawings | Inspired by Mithila conventions (double outline, hatching); **not copied** from any artist |
| `src/three/textures.ts › madhubaniWallTexture` | Courtyard wall paintings | Canvas texture 512 px | ✅ code | Same |
| Commissioned Madhubani panels | Hero / section art | SVG or 2× WebP | 🟡 commission a Mithila artist, credited & paid | Artist attribution in footer |

## 6. Background textures

| Texture | Module | Size | Status |
|---|---|---|---|
| Earth floor (lipai), ghat stone, terracotta tiles, thatch, bamboo weave, chatai mat, thekua mould, glow | `src/three/textures.ts` | 128–512 px CanvasTexture | ✅ code |

## 7. Animation clips

Procedural, defined in `src/three/choreography.ts` (positions/paths) and `src/three/Devotee.tsx` (poses):

`clean, bath, cook, meal, prepare-next, fast-rest, kharna-cook, evening-puja, prasad-receive, nirjala, arrange-soop, procession, ghat-arrange, stand-in-water, arghya, evening-close, dawn-gather, dawn-arrive, usha-arghya, blessing, paran` — ✅

✅ Skeletal clips: `public/models/anims/chhath_clips.glb` (0.57 MB, 16 clips, CC0), **keyframed** by `characters/blender/build_clips.py` on the shared skeleton and retargeted per character at runtime: `idle_stand, walk_barefoot, walk_steps_down, carry_daura_walk, carry_daura_idle, stand_in_water_idle, soop_hold, soop_raise_arghya, lota_pour, namaste, sit_crosslegged, sit_eat, stir_chulha, sweep, bow_touch_feet, give_prasad`. Ritual postures are simple static holds, not invented choreography.

🟡 Still wanted: motion capture of a vrati for the arghya and walking clips, reviewed by practitioners. Drop-in replacement with the same clip names.

## 8. Audio

| Layer | Source | Status |
|---|---|---|
| River, dawn birds, evening crickets, stove crackle, puja bells | Synthesised live (Web Audio) in `AudioManager.tsx` | ✅ |
| Field recordings at a ghat | Record with permission, CC-BY or owned | 🟡 |
| Chhath songs (e.g. *Kaanch hi baans ke bahangiya*) | Only **new recordings of traditional songs** by consenting singers, or properly licensed tracks | 🟡 · ⛔ no commercial recordings without licence |
| Captions | Live region + on-screen caption of active sound layers | ✅ |

## 9. Social / misc

| File | Status |
|---|---|
| `public/favicon.svg` | ✅ |
| Open Graph image `public/og.png` (1200×630) | 🟡 — needs a rendered still of the ghat scene |

## Fonts (self-hosted)

| File | Purpose | Format | Size | Status / licence |
|---|---|---|---|---|
| `src/app/fonts/NotoSansDevanagari-wght.woff2` | Body text, Hindi + English (variable weight 400–700, width pinned to normal) | WOFF2, subset Devanagari + basic Latin, all layout features | 97 KB, preloaded | ✅ built by `.github/workflows/fonts.yml` from `google/fonts` · **SIL OFL 1.1** (`OFL-NotoSansDevanagari.txt`) |
| `src/app/fonts/TiroDevanagariHindi-Regular.woff2` | Decorative headings | WOFF2, same subset | 127 KB, not preloaded | ✅ same workflow · **SIL OFL 1.1** (`OFL-TiroDevanagariHindi.txt`) |

The build no longer contacts Google Fonts, so a fonts outage can't fail CI or Vercel.

## Photographs (scene close-ups)

Shown in the stage's close-up view and in each scene card (`src/content/photos.ts`). They were fetched and resized to 1280 px WebP by `.github/workflows/photos.yml`. Credit and licence are shown under every photo, linking to the Commons file page.

| File | Scene | Author | Licence | Source |
|---|---|---|---|---|
| `public/photos/thekua-kolkata.webp` | soop-ki-taiyari | Biswarup Ganguly | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Thekua_-_Chhath_Festival_-_Kolkata_2013-11-09_4316.JPG) |
| `public/photos/soop-on-ghat-steps.webp` | ghat-par-taiyari | Goutam1962 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Sacred_Offerings_to_the_Setting_Sun.jpg) |
| `public/photos/vratis-in-yamuna.webp` | jal-me-vrati | Manishjaisi | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Celebrating_Chhath_Puja.jpg) |
| `public/photos/arghya-soop-yamuna.webp` | sandhya-arghya | Goutam1962 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Women_Offering_Arghya_at_Yamuna.jpg) |
| `public/photos/sandhya-bagmati.webp` | sandhya-arghya | Skandagautam | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Chhath_Festival_in_Nepal.jpg) |
| `public/photos/usha-misty-pond.webp` | usha-arghya | Sntshkumar750 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Chhath_Puja_(Morning).jpg) |

The photos are resized but otherwise unmodified. Under CC BY-SA, a modified version would have to be shared under the same licence. Family photos go in `public/photos/family/` with `license: "family"`.
