# Character build notes (MakeHuman / MPFB route)

## Status
- [x] Headless Blender 4.2.9 + MPFB 2.0.18 + makehuman_system_assets (CC0) on GitHub Actions (cached)
- [x] Probe: rigged Mixamo-skeleton woman GLB, 36k tris, eyes/teeth/brows/lashes
- [x] Round 1: clothing + skin + hair for `vrati_a`, previews in `docs/characters/` (5 build iterations)
  - fixed: MPFB macro shape keys not baked (garments offset), hands measured as hips, bindi on nose,
    fringe over eye, pallu snapping to arm, drapes tearing when arms raise
  - open: head drape still reads as a stiff hood (straight front edges); skirt is a clean tube
    without real drape; no fabric texture yet; GLB 13 MB / 50k tris (budget 3.5 MB / 25k)
- [x] Round 2: cotton weave textures, cloth simulation (two stages: inner layers, then kurta hem + gamchha
  over them), decimation to 24k tris, Meshopt + WebP (~0.65 MB each), all seven people
  - fixed: kurta hem / pyjama poke-through, rigid gamchha (simulation had been dropped by a refactor),
    waist rims (skirts now snug at the waistband), sleeve slivers at the wrists, braid through the pallu
- [x] Round 3: 16 keyframed clips (`build_clips.py`, review sheet `docs/characters/clips_sheet.png`),
  runtime retargeting, two-hand soop socket, live on the site, before/after in `docs/VISUAL_AUDIT.md §8`
  - fixed: finished NLA tracks leaking into the next clip's first key (corrupted loop frame)

## Probe findings
- Skins available: young/middleage/old × african/asian/caucasian (+ male/female). No South Asian preset
  → blend: tint `middleage_caucasian_female` / `asian` diffuse toward warm brown, raise roughness (probe was glossy).
- Hair: afro01, bob01/02, braid01, long01, ponytail01, short01–04. → `braid01` (long plait) recoloured near-black
  works for a bun/plait under the pallu.
- Clothes: only Western suits/shoes → **no MakeHuman saree**; build garments ourselves.
- Rig "mixamo" gives `mixamorig:*` bones incl. fingers. glTF export strips ":" → `mixamorigLeftHand`
  (RiggedDevotee already looks for `mixamorigRightHand`).

## Garment approach (generated, skinned from the body; cloth-simulated drape in round 2)
1. **Blouse** = copy of the body mesh, keep faces weighted to Spine*/Shoulder/upper Arm, push out along
   normals 4 mm. Same vertex groups as body → already skinned.
2. **Petticoat + saree skirt** = generated tube from waist to ankle with front pleats (radial sine
   displacement), slight flare; weights copied from the body with a Data Transfer modifier
   (nearest face, interpolated) → follows hips/legs.
3. **Pallu** = curved strip from right waist across chest, over left shoulder and over the head, with
   border colour band in the texture/vertex colour; weights from body.
4. Men: dhoti = wrapped skirt variant (shorter, between-legs tuck approximated), kurta = body copy
   torso+arms to mid-thigh pushed out; gamchha = strip over shoulder.
5. Sindoor/bindi: small red quads parented by weight to the head bone.

Materials: Principled BSDF, cotton roughness 0.85, saree yellow #E9B930 + red border #B3202F.
