"""
Build one clothed, rigged Chhath character with MPFB (CC0 MakeHuman) — headless.

  blender --background --python build_character.py -- <spec_id> <out_dir>

Garments are generated procedurally (no cloth simulation) and skinned by copying
weights from the body, so they deform with the same Mixamo-compatible skeleton.
See characters/NOTES.md for the approach.
"""
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(__file__))
from common import log, mpfb  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
SPEC_ID = argv[0] if argv else "vrati_a"
OUT = argv[1] if len(argv) > 1 else os.environ.get("CHAR_OUT", "/tmp/chars")
os.makedirs(OUT, exist_ok=True)
SPECS = json.load(open(os.path.join(os.path.dirname(__file__), "..", "specs.json")))
S = SPECS[SPEC_ID]
log("building", SPEC_ID, S.get("label"))

HumanService = mpfb("mpfb.services.humanservice", "HumanService")
TargetService = mpfb("mpfb.services.targetservice", "TargetService")
AssetService = mpfb("mpfb.services.assetservice", "AssetService")
ExportService = mpfb("mpfb.services.exportservice", "ExportService")
ObjectService = mpfb("mpfb.services.objectservice", "ObjectService")
HOP = mpfb("mpfb.entities.objectproperties", "HumanObjectProperties")
AssetService.rescan_pack_metadata()

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

# ───────────────────────── body ─────────────────────────
h = HumanService.create_human()
for k, v in S["macros"].items():
    HOP.set_value(k, v, entity_reference=h)
TargetService.reapply_macro_details(h)

skin_path = AssetService.find_asset_absolute_path(S["skin"] + ".mhmat", asset_subdir="skins")
HumanService.set_character_skin(skin_path, h, skin_type="GAMEENGINE")
rig_src = HumanService.add_builtin_rig(h, "mixamo")

for sub, fname, atype in [
    ("eyes", "low-poly.mhclo", "Eyes"),
    ("eyebrows", S.get("eyebrows", "eyebrow001") + ".mhclo", "Eyebrows"),
    ("eyelashes", "eyelashes01.mhclo", "Eyelashes"),
    ("teeth", "teeth_base.mhclo", "Teeth"),
    ("hair", S["hair"] + ".mhclo", "Hair"),
]:
    p = AssetService.find_asset_absolute_path(fname, asset_subdir=sub)
    if p:
        HumanService.add_mhclo_asset(p, h, asset_type=atype, material_type="GAMEENGINE")
    else:
        log("missing asset", sub, fname)

root = ExportService.create_character_copy(h, name_suffix="_x")
body = ObjectService.find_object_of_type_amongst_nearest_relatives(root, "Basemesh")
ExportService.bake_modifiers_remove_helpers(body, bake_masks=True, bake_subdiv=False, remove_helpers=True, also_proxy=True)
keep = {root, *ObjectService.get_list_of_children(root)}
for o in list(bpy.data.objects):
    if o not in keep:
        bpy.data.objects.remove(o, do_unlink=True)
rig = root if root.type == "ARMATURE" else next(o for o in keep if o.type == "ARMATURE")
log("rig", rig.name, "body", body.name, "children", [o.name for o in keep])

# MPFB stores the body shape (age/height/ethnicity macros) as shape keys. Bake the mix into
# the mesh so vertex coordinates = what is rendered (garments are built from these).
for o in keep:
    if o.type == "MESH" and o.data.shape_keys:
        n = len(o.data.shape_keys.key_blocks)
        with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o]):
            bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
        log(f"baked {n} shape keys on {o.name}")
nose = max(body.data.vertices, key=lambda v: -(body.matrix_world @ v.co).y if (body.matrix_world @ v.co).z > 1.2 else -9)
log("front check: most -Y vertex above 1.2 m at", tuple(round(c, 3) for c in body.matrix_world @ nose.co))


def bone_head(name):
    return rig.matrix_world @ rig.data.bones["mixamorig:" + name].head_local


L = {n: bone_head(n) for n in ["Hips", "Spine", "Spine2", "Neck", "Head", "LeftShoulder", "RightShoulder", "LeftArm", "RightArm", "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftHand", "RightHand"]}
head_top_z = max((body.matrix_world @ v.co).z for v in body.data.vertices)
log("landmarks z: hips %.3f neck %.3f head %.3f top %.3f foot %.3f" % (L["Hips"].z, L["Neck"].z, L["Head"].z, head_top_z, L["LeftFoot"].z))

# ───────────────────────── texture tinting ─────────────────────────


def tint_image_node(obj, target_srgb, name):
    """Recolour a material's base-colour image so its mean matches target (keeps detail)."""
    for slot in obj.material_slots:
        m = slot.material
        if not m or not m.use_nodes:
            continue
        bsdf = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if not bsdf:
            continue
        link = next((l for l in m.node_tree.links if l.to_socket == bsdf.inputs["Base Color"]), None)
        if not link or link.from_node.type != "TEX_IMAGE" or not link.from_node.image:
            continue
        img = link.from_node.image
        w, hgt = img.size
        px = np.empty(w * hgt * 4, dtype=np.float32)
        img.pixels.foreach_get(px)
        px = px.reshape(-1, 4)
        mask = px[:, 3] > 0.5
        mean = px[mask, :3].mean(axis=0) if mask.any() else px[:, :3].mean(axis=0)
        gain = np.array(target_srgb, dtype=np.float32) / np.maximum(mean, 1e-3)
        px[:, :3] = np.clip(px[:, :3] * gain, 0, 1)
        new = bpy.data.images.new(name, w, hgt, alpha=True)
        new.pixels.foreach_set(px.ravel())
        new.pack()
        link.from_node.image = new
        log(f"tinted {img.name} mean {np.round(mean, 3)} → {target_srgb}")
        return m
    return None


skin_mat = tint_image_node(body, S["skin_tint"], f"{SPEC_ID}_skin")
if skin_mat:
    bsdf = next(n for n in skin_mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    if not any(l.to_socket == bsdf.inputs["Roughness"] for l in skin_mat.node_tree.links):
        bsdf.inputs["Roughness"].default_value = 0.58
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.3
hair = next((o for o in keep if "hair" in o.name.lower() or S["hair"] in o.name), None)
if hair and S.get("head_covered"):
    hb = bmesh.new()
    hb.from_mesh(hair.data)
    eye_z = L["Head"].z + 0.06
    front = [f for f in hb.faces if (hair.matrix_world @ f.calc_center_median()).y < -0.06 and (hair.matrix_world @ f.calc_center_median()).z < eye_z + 0.07]
    bmesh.ops.delete(hb, geom=front, context="FACES")
    # under the pallu: the braid/long hair below the skull base is hidden anyway and
    # used to poke out of the drape at the back → remove it …
    low = [f for f in hb.faces if (hair.matrix_world @ f.calc_center_median()).z < L["Head"].z + 0.02]
    bmesh.ops.delete(hb, geom=low, context="FACES")
    bmesh.ops.delete(hb, geom=[v for v in hb.verts if not v.link_faces], context="VERTS")
    # … and keep what remains close to the skull (the drape is built just outside the head)
    hv = np.array([(body.matrix_world @ v.co)[:] for v in body.data.vertices])
    hv = hv[hv[:, 2] > L["Head"].z + 0.04]
    hcx, hcy = hv[:, 0].mean(), hv[:, 1].mean()
    skull_r = max(np.abs(hv[:, 0] - hcx).max(), np.abs(hv[:, 1] - hcy).max())
    mw, mwi = hair.matrix_world, hair.matrix_world.inverted()
    pulled = 0
    for v in hb.verts:
        w = mw @ v.co
        dx, dy = w.x - hcx, w.y - hcy
        r = math.hypot(dx, dy)
        lim = skull_r + 0.01
        if r > lim:
            k = lim / r
            v.co = mwi @ Vector((hcx + dx * k, hcy + dy * k, w.z))
            pulled += 1
    hb.to_mesh(hair.data)
    hb.free()
    log("trimmed fringe faces:", len(front), "below skull:", len(low), "pulled in:", pulled)
if hair:
    tint_image_node(hair, S.get("hair_tint", [0.07, 0.05, 0.045]), f"{SPEC_ID}_hair")

# ───────────────────────── garment helpers ─────────────────────────


def weave_images(name, rgb, size=512, threads=56, stripe=None):
    """Plain-weave cotton: base colour (with slub variation) + tangent-space normal map."""
    rng = np.random.default_rng(abs(hash(name)) % 2**32)
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32) / size
    px, py = xx * threads * 2 * np.pi, yy * threads * 2 * np.pi
    warp = 0.5 + 0.5 * np.cos(px)
    weft = 0.5 + 0.5 * np.cos(py)
    over = (np.floor(xx * threads) + np.floor(yy * threads)) % 2
    height = np.where(over > 0, warp * 0.8 + weft * 0.2, weft * 0.8 + warp * 0.2)
    slub = np.repeat(rng.normal(0, 0.045, size), size).reshape(size, size) + np.tile(rng.normal(0, 0.03, size), (size, 1))  # uneven yarn
    lum = 0.86 + 0.16 * height + slub + rng.normal(0, 0.015, (size, size))
    col = np.stack([np.clip(rgb[i] * lum, 0, 1) for i in range(3)], axis=-1)
    if stripe:  # woven border lines (e.g. gold thread in a red border)
        band = (np.abs(((yy * 4) % 1) - 0.5) < 0.06)
        col[band] = np.array(stripe) * lum[band, None]
    gx = np.roll(height, -1, 1) - np.roll(height, 1, 1)
    gy = np.roll(height, -1, 0) - np.roll(height, 1, 0)
    n = np.stack([-gx * 1.5, -gy * 1.5, np.ones_like(gx)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    nrm = n * 0.5 + 0.5
    imgs = []
    for tag, arr in (("col", col), ("nrm", nrm)):
        img = bpy.data.images.new(f"{SPEC_ID}_{name}_{tag}", size, size, alpha=True)
        if tag == "nrm":
            img.colorspace_settings.name = "Non-Color"
        rgba = np.ascontiguousarray(np.concatenate([arr, np.ones((size, size, 1), np.float32)], -1)[::-1], dtype=np.float32)
        img.pixels.foreach_set(rgba.ravel())
        img.update()
        img.pack()
        chk = np.empty(size * size * 4, dtype=np.float32)
        img.pixels.foreach_get(chk)
        log(f"texture {img.name}: mean {chk.reshape(-1, 4)[:, :3].mean(axis=0).round(3)} packed={bool(img.packed_file)}")
        imgs.append(img)
    return imgs


def cylindrical_uv(ob, tile=0.12):
    """u = arc length around the body axis, v = height; one texture tile = `tile` metres."""
    me = ob.data
    uv = me.uv_layers.new(name="UVMap") if not me.uv_layers else me.uv_layers[0]
    me.uv_layers.active = uv
    for poly in me.polygons:
        cx = sum((ob.matrix_world @ me.vertices[i].co).x for i in poly.vertices) / len(poly.vertices)
        cy = sum((ob.matrix_world @ me.vertices[i].co).y for i in poly.vertices) / len(poly.vertices)
        a0 = math.atan2(cy, cx)
        for li in poly.loop_indices:
            co = ob.matrix_world @ me.vertices[me.loops[li].vertex_index].co
            a = math.atan2(co.y, co.x)
            da = math.atan2(math.sin(a - a0), math.cos(a - a0))  # no seam tearing inside a face
            uv.data[li].uv = ((a0 + da) * 0.2 / tile, co.z / tile)


def cloth_mat(name, rgb, rough=0.85, sheen=0.25, stripe=None):
    m = bpy.data.materials.new(f"{SPEC_ID}_{name}")
    m.use_nodes = True
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*[c ** 2.2 for c in rgb], 1)
    col_img, nrm_img = weave_images(name, rgb, stripe=stripe)
    tc = nt.nodes.new("ShaderNodeTexImage")
    tc.image = col_img
    nt.links.new(tc.outputs["Color"], b.inputs["Base Color"])
    tn = nt.nodes.new("ShaderNodeTexImage")
    tn.image = nrm_img
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.3
    nt.links.new(tn.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = rough
    if "Sheen Weight" in b.inputs:
        b.inputs["Sheen Weight"].default_value = sheen
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = 0.2
    return m


body_world = np.array([tuple(body.matrix_world @ v.co) for v in body.data.vertices])
kd = KDTree(len(body_world))
for i, co in enumerate(body_world):
    kd.insert(Vector(co), i)
kd.balance()
bm_body = bmesh.new()
bm_body.from_mesh(body.data)
bm_body.transform(body.matrix_world)
bvh = BVHTree.FromBMesh(bm_body)
_dl = bm_body.verts.layers.deform.verify()
bm_torso = bm_body.copy()
_dlt = bm_torso.verts.layers.deform.verify()
_arm_names = {"mixamorig:" + n for n in ("LeftArm", "RightArm", "LeftForeArm", "RightForeArm", "LeftHand", "RightHand")}
_arm_idx = [i for i, g in enumerate(body.vertex_groups) if g.name in _arm_names or "Hand" in g.name]
bmesh.ops.delete(bm_torso, geom=[f for f in bm_torso.faces if sum(sum(v[_dlt].get(g, 0.0) for g in _arm_idx) for v in f.verts) / len(f.verts) > 0.3], context="FACES")
bvh_torso = BVHTree.FromBMesh(bm_torso)
group_names = [g.name for g in body.vertex_groups]
W = np.zeros((len(body.data.vertices), len(group_names)), dtype=np.float32)
for v in body.data.vertices:
    for g in v.groups:
        W[v.index, g.group] = g.weight


SKIN_ARGS = {}


def skin_from_body(obj, k=4, pelvis_blend=None, no_arms=False, _remember=True):
    """Copy armature weights from the nearest body vertices (inverse-distance)."""
    if _remember:
        SKIN_ARGS[obj.name] = dict(k=k, pelvis_blend=pelvis_blend, no_arms=no_arms)
    for gn in group_names:
        if gn not in obj.vertex_groups:
            obj.vertex_groups.new(name=gn)
    hips = group_names.index("mixamorig:Hips") if "mixamorig:Hips" in group_names else None
    for v in obj.data.vertices:
        co = obj.matrix_world @ v.co
        hits = kd.find_n(co, k)
        wsum, acc = 0.0, np.zeros(len(group_names), dtype=np.float32)
        for _, idx, d in hits:
            f = 1.0 / max(d, 1e-4)
            acc += W[idx] * f
            wsum += f
        acc /= max(wsum, 1e-6)
        if no_arms:
            for gi, gn in enumerate(group_names):
                if any(t in gn for t in ("Arm", "Hand")):
                    acc[gi] = 0.0
            if acc.sum() < 1e-4 and "mixamorig:Spine2" in group_names:
                acc[group_names.index("mixamorig:Spine2")] = 1.0
        if pelvis_blend is not None and hips is not None:
            t = pelvis_blend(co)
            acc = acc * (1 - t)
            acc[hips] += t
        s = acc.sum()
        if s > 0:
            acc /= s
        for gi in np.argsort(-acc)[:4]:
            if acc[gi] > 0.01:
                obj.vertex_groups[group_names[gi]].add([v.index], float(acc[gi]), "REPLACE")
    if "Armature" not in obj.modifiers:
        mod = obj.modifiers.new("Armature", "ARMATURE")
        mod.object = rig
        obj.parent = rig
        obj.matrix_parent_inverse = rig.matrix_world.inverted()


def new_obj(name, bm, mats):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


ARM_GROUPS = [i for i, g in enumerate(group_names) if any(k in g for k in ("Arm", "Hand", "Shoulder"))]
not_arm = W[:, ARM_GROUPS].sum(axis=1) < 0.2 if ARM_GROUPS else np.ones(len(W), bool)


def body_slab(z0, z1, torso_only=True):
    m = (body_world[:, 2] >= z0) & (body_world[:, 2] < z1)
    if torso_only:
        m &= not_arm
    return body_world[m]


def push_to_surface(p, offset, tree=None):
    loc, nrm, _, _ = (tree or bvh).find_nearest(Vector(p))
    if loc is None:
        return Vector(p)
    return loc + nrm * offset


# ───────────────────────── blouse / kurta: body copy ─────────────────────────


def body_shell(name, groups, z_min, z_max, offset, mat, sleeve_z_min=None, exclude=False, trim=()):
    gidx = [group_names.index(g) for g in groups if g in group_names]
    if exclude:  # groups = parts to leave bare
        gidx = [i for i, g in enumerate(group_names) if any(k in g for k in groups)]
    bm = bmesh.new()
    bm.from_mesh(body.data)
    bm.transform(body.matrix_world)
    dl = bm.verts.layers.deform.verify()
    kill = []
    for f in bm.faces:
        ok = True
        for v in f.verts:
            w = sum(v[dl].get(g, 0.0) for g in gidx)
            zmin = sleeve_z_min if (sleeve_z_min is not None and abs(v.co.x) > 0.16) else z_min
            bad = (w >= 0.5) if exclude else (w < 0.5)
            near = any((v.co - c).length < r for c, r in trim)  # e.g. clean sleeve ends above the wrist
            if bad or near or v.co.z < zmin or v.co.z > z_max:
                ok = False
                break
        if not ok:
            kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    # drop small disconnected fragments (e.g. slivers left around the wrists)
    seen, comps = set(), []
    for f0 in bm.faces:
        if f0 in seen:
            continue
        stack, comp = [f0], []
        seen.add(f0)
        while stack:
            f = stack.pop()
            comp.append(f)
            for e in f.edges:
                for g in e.link_faces:
                    if g not in seen:
                        seen.add(g)
                        stack.append(g)
        comps.append(comp)
    if comps:
        big = max(len(c) for c in comps)
        small = [f for c in comps if len(c) < 0.1 * big for f in c]
        if small:
            bmesh.ops.delete(bm, geom=small, context="FACES")
        log(f"{name}: kept {sum(len(c) >= 0.1 * big for c in comps)} part(s), dropped {len(small)} stray faces")
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context="VERTS")
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * offset
    bm.verts.layers.deform.remove(dl)
    ob = new_obj(name, bm, [mat])
    skin_from_body(ob)
    return ob


TORSO = ["mixamorig:Spine", "mixamorig:Spine1", "mixamorig:Spine2", "mixamorig:LeftShoulder", "mixamorig:RightShoulder", "mixamorig:LeftArm", "mixamorig:RightArm", "mixamorig:Hips", "mixamorig:Neck"]

# ───────────────────────── wrapped lower garment (saree / dhoti / petticoat) ─────────────────────────


def wrap_skirt(name, z_top, z_bottom, mat, border_mat, pleats=True, flare=0.05, ease=0.012, rows=22, segs=72, ease_top=None):
    bm = bmesh.new()
    rings = []
    hip_slab = body_slab(L["Hips"].z - 0.12, L["Hips"].z + 0.02)
    cx, cy = hip_slab[:, 0].mean(), hip_slab[:, 1].mean()
    for r in range(rows + 1):
        t = r / rows
        z = z_top + (z_bottom - z_top) * t
        slab = body_slab(z - 0.03, z + 0.03)
        if t < 0.35 and len(slab) > 20:
            rx = np.abs(slab[:, 0] - cx).max()
            ry = np.abs(slab[:, 1] - cy).max()
        else:
            rx, ry = prev
        # never narrower than the hips below the waist (cloth hangs, doesn't wrap legs)
        if r > 0:
            rx, ry = max(rx, prev[0]), max(ry, prev[1])
        prev = (rx, ry)
        ring = []
        for s in range(segs):
            a = 2 * math.pi * s / segs
            fl = flare * t
            # snug at the waistband, loosening as it falls (no visible rim/ledge at the top)
            e = ease if ease_top is None else ease_top + (ease - ease_top) * min(1.0, t / 0.3)
            rr_x, rr_y = rx + e + fl, ry + e + fl
            pleat = 0.0
            # front pleats: character faces −Y → front is a ≈ −π/2
            da = math.atan2(math.sin(a + math.pi / 2), math.cos(a + math.pi / 2))
            if pleats and abs(da) < 0.55 and t > 0.08:
                pleat = 0.012 * min(1, t * 3) * (0.5 + 0.5 * math.cos(da * 22))
            fold = (0.004 * min(1.0, t / 0.15) + 0.012 * t * t) * (math.sin(a * 9 + 0.7) + 0.55 * math.sin(a * 17 + 2.1) + 0.3 * math.sin(a * 31))
            hem = (0.01 * math.sin(a * 5) + (0.012 if (pleats and abs(da) < 0.55) else 0)) * (1 if r == rows else 0)
            ring.append(bm.verts.new((cx + (rr_x + pleat + fold) * math.cos(a), cy + (rr_y + pleat + fold) * math.sin(a), z + hem)))
        rings.append(ring)
    bm.verts.ensure_lookup_table()
    for r in range(rows):
        for s in range(segs):
            a, b = rings[r][s], rings[r][(s + 1) % segs]
            c, d = rings[r + 1][(s + 1) % segs], rings[r + 1][s]
            f = bm.faces.new((a, d, c, b))
            f.material_index = 1 if r >= rows - 1 else 0
    ob = new_obj(name, bm, [mat, border_mat])
    hz = L["Hips"].z

    # upper part follows thighs a little; lower part hangs from the pelvis
    def blend(co):
        return min(0.85, max(0.0, (hz - 0.05 - co.z) / 0.6))

    skin_from_body(ob, k=6, pelvis_blend=blend)
    return ob


# ───────────────────────── ribbon along the body (pallu / gamchha) ─────────────────────────


def ribbon(name, path_pts, width, offset, mat, border_mat, samples=90, across=8, border_side=1, drop=None):
    """Strip following a polyline on the body surface. drop = list of free-hanging extra points."""
    pts = [Vector(p) for p in path_pts]
    # resample by arc length
    lens = [0.0]
    for a, b in zip(pts, pts[1:]):
        lens.append(lens[-1] + (b - a).length)
    total = lens[-1]
    centre = []
    for i in range(samples + 1):
        d = total * i / samples
        j = max(k for k in range(len(lens)) if lens[k] <= d) if d < total else len(pts) - 2
        j = min(j, len(pts) - 2)
        t = (d - lens[j]) / max(lens[j + 1] - lens[j], 1e-6)
        centre.append(pts[j].lerp(pts[j + 1], t))
    bm = bmesh.new()
    grid = []
    for i, c in enumerate(centre):
        tang = (centre[min(i + 1, samples)] - centre[max(i - 1, 0)]).normalized()
        loc, nrm, _, _ = bvh_torso.find_nearest(c)
        n = nrm if nrm is not None else Vector((0, -1, 0))
        side = tang.cross(n).normalized()
        row = []
        for k in range(across + 1):
            u = (k / across - 0.5) * width
            p = push_to_surface(c + side * u, offset, bvh_torso)
            row.append(bm.verts.new(p))
        grid.append(row)
    for i in range(samples):
        for k in range(across):
            f = bm.faces.new((grid[i][k], grid[i][k + 1], grid[i + 1][k + 1], grid[i + 1][k]))
            edge = (k == across - 1) if border_side > 0 else (k == 0)
            f.material_index = 1 if edge else 0
    for _ in range(4):
        bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    ob = new_obj(name, bm, [mat, border_mat])
    skin_from_body(ob, k=6, no_arms=True)
    return ob


def hood(name, offset, mat, border_mat, open_deg=62, rows=28, segs=64):
    """Pallu over the head as a smooth, loose drape: sits on the crown, frames the face
    and falls over the shoulders and back. Generated (not a skull copy) → clean edges."""
    head = body_slab(L["Head"].z, head_top_z, torso_only=False)
    hx, hy = head[:, 0].mean(), head[:, 1].mean()
    head_r = max(np.abs(head[:, 0] - hx).max(), np.abs(head[:, 1] - hy).max())
    shoulders = body_slab(L["LeftArm"].z - 0.03, L["LeftArm"].z + 0.03, torso_only=False)
    sh_r = np.abs(shoulders[:, 0] - hx).max() * 0.92
    hair_top = max((hair.matrix_world @ v.co).z for v in hair.data.vertices) if hair else head_top_z
    z_top, z_bot = max(head_top_z, hair_top) + 0.012, L["Spine2"].z - 0.02
    z_crown = L["Head"].z + 0.06
    bm = bmesh.new()
    grid = []
    open_a = math.radians(open_deg)
    for r in range(rows + 1):
        t = r / rows
        z = z_top - (z_top - z_bot) * t
        R = head_r + offset
        if z >= z_crown:  # round dome over the crown
            k = min(1.0, (z_top - z) / (z_top - z_crown))
            rad = R * math.sqrt(max(0.0, 1 - (1 - k) ** 2))
        elif z >= L["Neck"].z:  # straight down past the ears
            rad = R
        else:  # flares only below the neck, over the shoulders and back
            k = (L["Neck"].z - z) / max(L["Neck"].z - z_bot, 1e-3)
            rad = R + (sh_r + 0.02 - R) * (k ** 1.2)
        rad = max(rad, 0.004)
        row = []
        # curved face opening: narrow over the forehead, widest at the cheeks,
        # closing again below the chin so the two ends fall in front of the shoulders
        zf = (z - L["Head"].z) / max(head_top_z - L["Head"].z, 1e-3)  # 0 at chin, 1 at crown
        if zf > 0.75:
            half = math.radians(34 + (open_deg - 34) * (1 - (zf - 0.75) / 0.25))
        elif zf > 0:
            half = math.radians(open_deg)
        else:
            half = math.radians(max(22.0, open_deg - 40 * min(1.0, -zf * 1.4)))
        below = max(0.0, (L["Neck"].z - z) / max(L["Neck"].z - z_bot, 1e-3))
        for sgi in range(segs + 1):
            u = sgi / segs
            ang = half + (2 * math.pi - 2 * half) * u
            # soft vertical folds where the cloth hangs free
            rr = rad + below * (0.009 * math.sin(ang * 7 + 0.4) + 0.005 * math.sin(ang * 13))
            # the free front ends hang slightly forward and inward, like real cotton
            front = math.cos(ang) ** 8 if math.cos(ang) > 0 else 0
            x = hx + rr * math.sin(ang) * (1 - 0.25 * front * below)
            y = hy - rr * math.cos(ang) - 0.03 * front * below
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for r in range(rows):
        for sgi in range(segs):
            f = bm.faces.new((grid[r][sgi], grid[r + 1][sgi], grid[r + 1][sgi + 1], grid[r][sgi + 1]))
            f.material_index = 1 if sgi < 2 or sgi >= segs - 2 else 0
    # close the crown so there is no hole on top
    bmesh.ops.remove_doubles(bm, verts=grid[0], dist=0.006)
    for _ in range(2):
        bmesh.ops.smooth_vert(bm, verts=[v for v in bm.verts if not v.is_boundary], factor=0.4, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.normal_update()
    ob = new_obj(name, bm, [mat, border_mat])
    skin_from_body(ob, k=6, no_arms=True)
    # everything above the neck follows the head only (no stretching from shoulders)
    hg = ob.vertex_groups.get("mixamorig:Head")
    for v in ob.data.vertices:
        if (ob.matrix_world @ v.co).z > L["Neck"].z + 0.03:
            for g in ob.vertex_groups:
                g.remove([v.index])
            hg.add([v.index], 1.0, "REPLACE")
    return ob


def forehead_point(z):
    hit, nrm, _, _ = bvh.ray_cast(Vector((0, -1.0, z)), Vector((0, 1, 0)))
    return hit


def dot(name, pos, radius, mat, bone="mixamorig:Head"):
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=10, radius=radius)
    for v in bm.verts:
        v.co = Vector((v.co.x, 0, v.co.y))
    loc, nrm, _, _ = bvh.find_nearest(Vector(pos))
    if nrm is None:
        nrm = Vector((0, -1, 0))
    rot = Vector((0, -1, 0)).rotation_difference(nrm)
    for v in bm.verts:
        v.co = loc + nrm * 0.0015 + rot @ v.co
    ob = new_obj(name, bm, [mat])
    ob.vertex_groups.new(name=bone).add([v.index for v in ob.data.vertices], 1.0, "REPLACE")
    mod = ob.modifiers.new("Armature", "ARMATURE")
    mod.object = rig
    ob.parent = rig
    ob.matrix_parent_inverse = rig.matrix_world.inverted()
    return ob


# ───────────────────────── dress the character ─────────────────────────
C = S["colors"]
main = cloth_mat("main", C["main"])
border = cloth_mat("border", C["border"], rough=0.7, sheen=0.4, stripe=C.get("thread", (0.86, 0.66, 0.22)))
neck_z, hips_z, foot_z = L["Neck"].z, L["Hips"].z, L["LeftFoot"].z
shoulder_l, shoulder_r = L["LeftShoulder"], L["RightShoulder"]
front_y = body_slab(L["Spine2"].z - 0.05, L["Spine2"].z + 0.05)[:, 1].min()

garments = []
kind = S["outfit"]
if kind == "saree":
    blouse = cloth_mat("blouse", C.get("blouse", C["border"]), rough=0.8)
    garments.append(body_shell("blouse", TORSO, L["Spine"].z + 0.02, neck_z - 0.02, 0.004, blouse, sleeve_z_min=L["LeftArm"].z - 0.16))
    garments.append(wrap_skirt("saree_skirt", hips_z + 0.06, foot_z + 0.025, main, border, ease_top=0.004))
    # pallu: right waist → across chest → over left shoulder → down the back
    lx = shoulder_l.x + 0.02
    path = [
        (-0.13, front_y - 0.05, hips_z + 0.08),
        (-0.04, front_y - 0.04, L["Spine"].z + 0.06),
        (0.07, front_y - 0.02, L["Spine2"].z),
        (lx, front_y + 0.03, neck_z - 0.04),
        (lx, L["Neck"].y + 0.02, neck_z + 0.02),
        (lx - 0.02, L["Neck"].y + 0.12, neck_z - 0.1),
        (lx - 0.06, L["Neck"].y + 0.14, L["Spine"].z),
        (lx - 0.08, L["Neck"].y + 0.15, hips_z + 0.02),
    ]
    garments.append(ribbon("pallu", path, 0.24, 0.016, main, border, border_side=1))
    if S.get("head_covered", True):
        garments.append(hood("pallu_head", 0.022, main, border))
    red = cloth_mat("sindoor", (0.72, 0.06, 0.08), rough=0.5, sheen=0)
    top = Vector((0, L["Head"].y - 0.04, head_top_z - 0.004))
    fh = forehead_point(head_top_z - 0.072)
    log("forehead", tuple(round(c, 3) for c in fh) if fh else None)
    if fh:
        garments.append(dot("bindi", fh, 0.0045, red))
    garments.append(dot("sindoor", top, 0.006, red))
elif kind in ("dhoti_kurta", "kurta_pyjama"):
    kurta = cloth_mat("kurta", C["main"])
    # kurta: loose body shell (torso + full sleeves, hands/head/legs bare) …
    garments.append(body_shell("kurta", ["Hand", "Head", "Neck", "UpLeg", "Leg", "Foot", "Toe"], hips_z - 0.04, neck_z - 0.015, 0.012, kurta, exclude=True,
                                trim=[(L["LeftHand"], 0.05), (L["RightHand"], 0.05)]))
    # … plus a free-hanging hem panel from the hips to above the knee (cloth-simulated)
    knee_z = L["LeftLeg"].z
    # sits clearly outside the dhoti/pyjama (their pleats/folds used to poke through)
    hem_ease = 0.065 if kind == "dhoti_kurta" else 0.045
    garments.append(wrap_skirt("kurta_hem", hips_z + 0.02, knee_z + 0.08, kurta, kurta, pleats=False, flare=0.03, ease=hem_ease, ease_top=0.006))
    if kind == "dhoti_kurta":
        dhoti = cloth_mat("dhoti", C.get("dhoti", (0.95, 0.93, 0.86)))
        garments.append(wrap_skirt("dhoti", hips_z - 0.02, foot_z + 0.16, dhoti, border, pleats=True, flare=0.02, ease=0.03, ease_top=0.008))
        if C.get("gamchha"):
            g = cloth_mat("gamchha", C["gamchha"], rough=0.8, stripe=(0.95, 0.93, 0.86))
            # gamchha over the left shoulder (on the trapezius, not out on the arm),
            # hanging front and back; the cloth sim lets it fall and fold
            gx = shoulder_l.x - math.copysign(0.035, shoulder_l.x)
            garments.append(ribbon("gamchha", [
                (gx, front_y - 0.03, L["Spine"].z),
                (gx, front_y - 0.01, L["Spine2"].z),
                (gx, L["Neck"].y - 0.02, neck_z - 0.01),
                (gx, L["Neck"].y + 0.10, L["Spine2"].z),
                (gx, L["Neck"].y + 0.12, L["Spine"].z),
            ], 0.15, 0.022, g, g, samples=48, across=6))
    else:
        py = cloth_mat("pyjama", C.get("pyjama", (0.94, 0.92, 0.85)))
        garments.append(body_shell("pyjama", ["Hand", "Arm", "Spine1", "Spine2", "Neck", "Head", "Foot", "Toe"], foot_z + 0.07, hips_z - 0.03, 0.02, py, exclude=True))  # top hidden under the kurta hem

log("garments", [(g.name, len(g.data.polygons)) for g in garments])


# ───────────────────────── cloth simulation (real drape) ─────────────────────────
def simulate(objs_pins, colliders=(), frames=40):
    """objs_pins: [(object, pin_test(world_co) -> bool)]. Simulates in the rest pose against
    the body plus any garments in `colliders` (so outer layers drape over inner ones)."""
    cols = []
    for c_ob, th in [(body, 0.006)] + [(c, 0.004) for c in colliders]:
        m = c_ob.modifiers.new("collide", "COLLISION")
        c_ob.collision.thickness_outer = th
        c_ob.collision.cloth_friction = 8
        cols.append((c_ob, m))
    for ob, pin_test in objs_pins:
        g = ob.vertex_groups.new(name="pin")
        g.add([v.index for v in ob.data.vertices if pin_test(ob.matrix_world @ v.co)], 1.0, "REPLACE")
        m = ob.modifiers.new("cloth", "CLOTH")
        c = m.settings
        c.quality = 6
        c.mass = 0.18           # cotton
        c.tension_stiffness = 12
        c.compression_stiffness = 12
        c.shear_stiffness = 6
        c.bending_stiffness = 0.6
        c.air_damping = 1.5
        c.vertex_group_mass = "pin"
        m.collision_settings.use_collision = True
        m.collision_settings.distance_min = 0.005
        m.collision_settings.use_self_collision = False
        m.point_cache.frame_start, m.point_cache.frame_end = 1, frames
    scn = bpy.context.scene
    scn.frame_start, scn.frame_end = 1, frames
    for f in range(1, frames + 1):
        scn.frame_set(f)
    dg = bpy.context.evaluated_depsgraph_get()
    for ob, _ in objs_pins:
        ev = ob.evaluated_get(dg)
        me = ev.to_mesh()
        co = np.empty(len(me.vertices) * 3, dtype=np.float32)
        me.vertices.foreach_get("co", co)
        ev.to_mesh_clear()
        ob.modifiers.remove(ob.modifiers["cloth"])
        old = np.empty_like(co)
        ob.data.vertices.foreach_get("co", old)
        ob.data.vertices.foreach_set("co", co)
        ob.data.update()
        ob.vertex_groups.remove(ob.vertex_groups["pin"])
        for g in list(ob.vertex_groups):  # re-skin from the draped positions
            ob.vertex_groups.remove(g)
        skin_from_body(ob, _remember=False, **SKIN_ARGS[ob.name])
        log(f"draped {ob.name}: max move {np.abs(co - old).reshape(-1, 3).max():.3f} m")
    for c_ob, m in cols:
        c_ob.modifiers.remove(m)
    scn.frame_set(1)


by_name = {g.name: g for g in garments}
inner = []  # stage 1: layers next to the body
if "saree_skirt" in by_name:
    inner.append((by_name["saree_skirt"], lambda co: co.z > hips_z + 0.02))
if "dhoti" in by_name:
    inner.append((by_name["dhoti"], lambda co: co.z > hips_z - 0.04))
if "pallu_head" in by_name:
    inner.append((by_name["pallu_head"], lambda co: co.z > L["Head"].z + 0.07))
outer, outer_cols = [], [by_name[n] for n in ("dhoti", "pyjama", "kurta") if n in by_name]
if "kurta_hem" in by_name:  # stage 2: over the dhoti / pyjama
    outer.append((by_name["kurta_hem"], lambda co: co.z > hips_z - 0.01))
if "gamchha" in by_name:  # pinned only where it rests on the shoulder
    outer.append((by_name["gamchha"], lambda co: co.z > neck_z - 0.05))
for stage, cols in ((inner, ()), (outer, outer_cols)):
    if stage:
        try:
            simulate(stage, cols)
        except Exception as e:  # keep the un-simulated garment rather than failing the build
            log("cloth simulation failed:", repr(e))

for g in garments:
    cylindrical_uv(g)

# ───────────────────────── fit the web budget ─────────────────────────
BUDGET = S.get("tri_budget", 24000)
for o in [o for o in bpy.data.objects if o.type == "MESH" and "teeth" in o.name.lower()]:
    bpy.data.objects.remove(o, do_unlink=True)  # hidden behind closed lips


def tri_count():
    return sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == "MESH")


before = tri_count()
others = before - sum(len(p.vertices) - 2 for p in body.data.polygons)
body_tris = sum(len(p.vertices) - 2 for p in body.data.polygons)
def obj_tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def decimate(o, ratio):
    """Collapse-decimate before the armature modifier (vertex weights are interpolated)."""
    dec = o.modifiers.new("web_decimate", "DECIMATE")
    dec.ratio = ratio
    dec.use_symmetry = True
    dec.symmetry_axis = "X"
    o.modifiers.move(len(o.modifiers) - 1, 0)
    with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o]):
        bpy.ops.object.modifier_apply(modifier="web_decimate")


ratio = max(0.12, min(1.0, (BUDGET - others) / max(body_tris, 1)))
if ratio < 1.0:
    decimate(body, ratio)
log(f"triangles {before} → {tri_count()} (body ratio {ratio:.2f})")
# Still over (small characters: the body is at its floor): the body-copy garment shells
# (kurta, pyjama, blouse) carry the body's full density → thin them too, never below 35 %.
excess = tri_count() - BUDGET
shells = [g for g in garments if g.name in ("kurta", "pyjama", "blouse")]
shell_tris = sum(obj_tris(g) for g in shells)
if excess > 0 and shell_tris:
    r = max(0.35, 1 - excess / shell_tris)
    for g in shells:
        decimate(g, r)
    log(f"garment shells ratio {r:.2f} → {tri_count()} tris")
log("tris per mesh", sorted(((o.name, obj_tris(o)) for o in bpy.data.objects if o.type == "MESH"), key=lambda x: -x[1])[:8])
for img in bpy.data.images:
    if img.size[0] > 1024 and not img.name.endswith(("_col", "_nrm")):
        img.scale(1024, 1024)
        img.pack()
log("images", [(i.name, tuple(i.size)) for i in bpy.data.images if i.size[0]])

# ───────────────────────── grip sockets ─────────────────────────
with bpy.context.temp_override(object=rig, active_object=rig, selected_objects=[rig]):
    bpy.ops.object.mode_set(mode="EDIT")
    eb = rig.data.edit_bones
    for side, tag in (("Right", "r"), ("Left", "l")):
        hand = eb.get(f"mixamorig:{side}Hand")
        mid = eb.get(f"mixamorig:{side}HandMiddle1")
        if not hand:
            continue
        g = eb.new(f"hand_{tag}_grip")
        tip = mid.head if mid else hand.tail
        g.head = hand.head.lerp(tip, 0.75)
        g.tail = g.head + (tip - hand.head).normalized() * 0.04
        g.parent = hand
        g.use_deform = False
    bpy.ops.object.mode_set(mode="OBJECT")
log("grip sockets:", [b.name for b in rig.data.bones if b.name.endswith("_grip")])

# ───────────────────────── export ─────────────────────────
for o in bpy.data.objects:
    o.select_set(o.type in {"MESH", "ARMATURE"})
bpy.context.view_layer.objects.active = rig
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
glb = os.path.join(OUT, f"{SPEC_ID}.glb")
bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True, export_skins=True, export_animations=False, export_yup=True, export_image_format="JPEG", export_jpeg_quality=85)
log(f"exported {glb} {os.path.getsize(glb)/1e6:.2f} MB, ≈{tris} tris")

# ───────────────────────── previews (Cycles CPU) ─────────────────────────
scn = bpy.context.scene
scn.render.engine = "CYCLES"
scn.cycles.device = "CPU"
scn.cycles.samples = 48
scn.cycles.use_denoising = True
scn.render.resolution_x, scn.render.resolution_y = 720, 960
scn.view_settings.view_transform = "AgX" if "AgX" in [v.identifier for v in scn.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.42, 0.3, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.6
scn.world = world
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 3.2
sun.data.color = (1.0, 0.82, 0.6)
sun.data.angle = math.radians(6)
sun.rotation_euler = (math.radians(62), 0, math.radians(-35))
scn.collection.objects.link(sun)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
scn.collection.objects.link(cam)
scn.camera = cam


def shoot(tag, loc, target, lens):
    cam.data.lens = lens
    cam.location = loc
    d = Vector(target) - Vector(loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    scn.render.filepath = os.path.join(OUT, f"{SPEC_ID}_{tag}.png")
    bpy.ops.render.render(write_still=True)


hz = L["Head"].z
shoot("front", (0, -4.0, 0.95), (0, 0, 0.85), 55)
shoot("threeq", (2.4, -3.0, 1.25), (0, 0, 0.9), 55)
shoot("face", (0.25, -1.0, hz + 0.05), (0, 0, hz + 0.02), 85)

# posed check: soop-raise arms to verify garments follow the skeleton
pb = rig.pose.bones
for side, sgn in (("Left", 1), ("Right", -1)):
    pb[f"mixamorig:{side}Arm"].rotation_mode = "XYZ"
    pb[f"mixamorig:{side}Arm"].rotation_euler = (math.radians(-70), 0, math.radians(sgn * 35))
    pb[f"mixamorig:{side}ForeArm"].rotation_mode = "XYZ"
    pb[f"mixamorig:{side}ForeArm"].rotation_euler = (0, 0, math.radians(sgn * 25))
pb["mixamorig:LeftUpLeg"].rotation_mode = "XYZ"
pb["mixamorig:LeftUpLeg"].rotation_euler = (math.radians(-25), 0, 0)
bpy.context.view_layer.update()
shoot("posed", (2.0, -3.2, 1.2), (0, 0, 0.9), 55)
log("done")
