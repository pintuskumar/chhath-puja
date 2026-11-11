# MetaHuman → website: step-by-step (Route A)

This is what **you** (or your 3D artist) do on a desktop. The website side is already built: drop the files in, edit one JSON file, push.

> Licence: since the MetaHuman 5.6 update (June 2025), MetaHumans may be used in any engine or software, including commercial web projects. See [metahuman.com/license](https://www.metahuman.com/license) and the [5.6 release notes](https://dev.epicgames.com/documentation/en-us/metahuman/metahuman-5-6-release-notes). Keep a copy of the licence page with your project records.

## 0. What you need

| Tool | Cost | Link |
|---|---|---|
| Epic Games account + Unreal Engine 5.6 or newer (includes MetaHuman Creator) | free | https://www.unrealengine.com |
| Blender 4.x | free | https://www.blender.org |
| Marvelous Designer (for the saree / dhoti) | paid, trial available | https://www.marvelousdesigner.com |
| Move.ai **or** Rokoko Video (mocap from phone video) | free tier | https://www.move.ai · https://www.rokoko.com |
| Rokoko Blender add-on (retargets mocap onto the MetaHuman skeleton) | free | https://www.rokoko.com/integrations/blender |
| Node 22 (to run the optimiser and validator) | free | https://nodejs.org |

Hardware: a PC with a recent GPU (MetaHuman Creator runs inside Unreal).

## 1. Create the first character: `vrati_a`

Start with **one** character. We'll validate the whole look on Day 3 before making the others.

1. In Unreal Engine, enable the **MetaHuman** plugin, create a project, and open **MetaHuman Creator**.
2. Build an adult Indian woman (≈ 35–45), using a South Asian preset as the starting point. Aim for:
   * natural skin tone and texture (no beauty filter), realistic age detail;
   * hair parted in the middle, tied low in a bun (it sits under the pallu);
   * body height ≈ 1.58 m with average build.
3. Use **plain neutral clothing** (we replace it). Barefoot if available.
4. Save the character.

Accessories to add later in Blender (simple meshes are fine): sindoor in the parting and a small bindi (texture paint), glass bangles, toe rings, an optional nose pin.

## 2. Export from Unreal at a web-friendly size

Full MetaHumans are hundreds of thousands of triangles with 8K textures, which is far too heavy for a phone. Export a **low LOD**.

1. In the Content Browser, open the MetaHuman's **Body** and **Face** skeletal meshes.
2. Use **LOD 3** (target) or LOD 4 (low preset). These LODs use **hair cards**, not strand grooms, which is what the web can render.
3. Right-click each mesh → **Asset Actions → Export** → FBX. In the FBX options, enable *Level of Detail*, and disable *Export Morph Targets* except jaw/blink if you want blinking.
4. Export the textures (body & face base colour, normal, roughness) at **2048 px**.

## 3. Assemble in Blender

1. Import both FBX files (Body + Face). Delete every LOD except the one you chose.
2. **Parent the face to the body skeleton** (the head bones share names) so there is **one armature**.
3. **Bone names must stay UE5 / MetaHuman names** (`pelvis`, `spine_01`…, `head`, `hand_r`, `index_01_r`…). Don't rename them.
4. Add two empty bones as children of the hands, named **`hand_r_grip`** and **`hand_l_grip`**. Place each at the centre of the closed palm, where a soop rim or lota neck would sit. The site attaches the soop, lota, thekua and diya there.
5. Materials: one Principled BSDF per part (skin, eyes, teeth, hair cards, saree…). Connect Base Color, Normal and Roughness textures only. Set skin **Subsurface ≈ 0.05–0.1** (exported as a glTF extension).
6. Scale: 1 unit = 1 metre, Y-up on export (the glTF exporter handles axes). The character faces **+Y in Blender** (which becomes +Z in glTF). If it ends up facing the wrong way on the site, set `yawOffsetDeg` in the manifest instead of re-exporting.

## 4. Saree (Marvelous Designer)

The saree is the most important piece for authenticity. Don't use a generic dress.

1. Export the posed body (A-pose) from Blender as OBJ and import it as an avatar in Marvelous Designer.
2. Drape a **Nivi-style saree with the pallu over the head** (common for vratis in Bihar & eastern UP). Use cotton or cotton-silk physical settings. Colour: **yellow with a red border** for `vrati_a`.
3. Include the blouse and petticoat. Make the pleats in front and the pallu covering the head, falling over the left shoulder.
4. Export as OBJ/FBX with UVs → Blender → **Data Transfer weights** from the body → parent to the armature. Then test-pose the shoulders and arms and fix any poke-through.
5. Target ≤ 8k triangles for the saree. Bake folds into the normal map instead of using geometry.
6. *Optional wet-look version* for water scenes: duplicate the lower half's material with darker albedo and lower roughness, named `saree_wet`.

## 5. Animations (record them; don't invent them)

Record a **real vrati, with her consent**, on a phone using Move.ai or Rokoko Video. Use a plain background, 10–20 s per take, the whole body visible.

| Clip name (exact) | What to record | Priority |
|---|---|---|
| `idle_stand` | standing calmly, hands relaxed | **1** |
| `walk_barefoot` | barefoot walk, natural pace, **in place / treadmill-style or cleaned to in-place** | **1** |
| `stand_in_water_idle` | standing still with small balance shifts (record in shallow water if possible) | **1** |
| `soop_raise_arghya` | holding a real soop with both hands and raising it toward the sun, as she does at the ghat | **1** |
| `soop_hold` | holding the soop at chest height | 2 |
| `lota_pour` | a family member pouring water/milk from a lota in front of the soop | 2 |
| `namaste` | folded hands in prayer | 2 |
| `carry_daura_walk`, `carry_daura_idle` | man carrying a daura on his head, walking and standing | 2 |
| `walk_steps_down` | walking down ghat steps | 3 |
| `sit_crosslegged`, `sit_eat` | sitting on a mat; eating from a banana leaf | 3 |
| `stir_chulha` | seated at a clay stove, stirring | 3 |
| `sweep`, `bow_touch_feet`, `give_prasad` | courtyard sweeping; touching the vrati's feet; handing prasad | 3 |

Then in Blender:
1. Retarget each recording onto the MetaHuman armature (Rokoko add-on → *Retargeting*, source = mocap, target = your armature).
2. Clean up foot contacts, and make walks **in place**: remove forward movement of `root`/`pelvis` (the website moves the person along the path and syncs stride speed).
3. Name each Action exactly as in the table and push it to the NLA so it gets exported.
4. Export a **separate file** that contains the armature + all actions only (no mesh): `chhath_clips.glb`.

Ask a vrati or family elder to **review the arghya, soop and daura clips** before release.

## 6. Export GLB from Blender

File → Export → glTF 2.0 (.glb):
* Include: *Selected objects* (armature + meshes), **Apply Modifiers**, **+Y Up**
* Data → Mesh: UVs, Normals; Skinning ✓; Shape keys only if you kept blink/jaw
* Animation: **off** for character files, **on** (NLA tracks / Actions) for `chhath_clips.glb`
* Compression: **off** (our optimiser does it)

## 7. Put the files in the repo

```
models-src/characters/vrati_a.glb      ← raw export (not committed)
models-src/anims/chhath_clips.glb
```

```bash
npm install
npm run models:optimize   # → public/models/characters/vrati_a.glb, public/models/anims/chhath_clips.glb
                          #   Meshopt geometry + WebP textures, 2048 px (1024 px for *_low.glb)
```

Then edit **`public/models/manifest.json`**:

```json
{
  "version": 1,
  "clips": "anims/chhath_clips.glb",
  "walkSpeed": 1.1,
  "yawOffsetDeg": 0,
  "characters": {
    "vrati": {
      "src": "characters/vrati_a.glb",
      "height": 1.58,
      "license": "MetaHuman (Epic Games) — MetaHuman EULA, saree by <name>, mocap by <name> with consent"
    }
  }
}
```

Roles (`characters` keys) used by the scenes: `vrati` (main vrati), `vrati2`, `vrati3` (other vratis in the water), `elder` (elderly woman), `woman`, `man` (dhoti-kurta, carries the daura), `youngman` (pours the lota), `child`. Any role you don't list keeps the stylised figure.

Validate and push:

```bash
npm run check:models   # sizes, triangles, skeleton, finger & grip bones, clip names, licence
git add public/models && git commit -m "assets: vrati_a MetaHuman + core clips" && git push
```

CI renders the Day 3 scenes with your character, and Vercel deploys a preview.

### Size budgets (checked by `check:models`)

| File | Triangles | Size after optimise |
|---|---|---|
| adult character (high) | ≤ 25,000 | ≤ 3.5 MB |
| `*_low.glb` (low preset, optional `srcLow`) | ≤ 6,000 | ≤ 1.2 MB |
| child | ≤ 15,000 | ≤ 3.5 MB |
| `chhath_clips.glb` | — | ≤ 2 MB |

## 8. Fine-tuning props in the hands

If the soop or lota doesn't sit right in the hands, adjust its placement in the manifest without re-exporting:

```json
"vrati": {
  "src": "characters/vrati_a.glb", "height": 1.58, "license": "…",
  "props": {
    "soop-filled": { "position": [0, -0.05, 0.12], "rotation": [-0.3, 0, 0] },
    "lota": { "position": [0, 0, 0.04], "rotation": [1.6, 0, 0] }
  }
}
```

Positions are in metres in the grip bone's space; rotations are in radians. Send me a screenshot and I'll tune these for you.

## What to send me first

1. `public/models/characters/vrati_a.glb`
2. `public/models/anims/chhath_clips.glb` with at least `idle_stand`, `walk_barefoot`, `stand_in_water_idle`, `soop_raise_arghya`
3. the manifest entry

I'll then render the before/after of the Sandhya Arghya close-up with identical cameras, tune hand placement, and continue with the other characters.
