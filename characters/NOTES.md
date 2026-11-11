# Character build notes (MakeHuman / MPFB route)

## Status
- [x] Headless Blender 4.2.9 + MPFB 2.0.18 + makehuman_system_assets (CC0) on GitHub Actions (cached)
- [x] Probe: rigged Mixamo-skeleton woman GLB, 36k tris, eyes/teeth/brows/lashes
- [ ] Round 1 (this): clothing + skin + hair for `vrati_a`, previews
- [ ] Round 2: remaining people (vrati_b, vrati_c, elder, man_dhoti, young_man, child)
- [ ] Round 3: decimate to budgets, clips (idle / walk / water idle / namaste / sit), integrate, before/after

## Probe findings
- Skins available: young/middleage/old × african/asian/caucasian (+ male/female). No South Asian preset
  → blend: tint `middleage_caucasian_female` / `asian` diffuse toward warm brown, raise roughness (probe was glossy).
- Hair: afro01, bob01/02, braid01, long01, ponytail01, short01–04. → `braid01` (long plait) recoloured near-black
  works for a bun/plait under the pallu.
- Clothes: only Western suits/shoes → **no MakeHuman saree**; build garments ourselves.
- Rig "mixamo" gives `mixamorig:*` bones incl. fingers. glTF export strips ":" → `mixamorigLeftHand`
  (RiggedDevotee already looks for `mixamorigRightHand`).

## Garment approach (no cloth sim — deterministic, skinned for free)
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
