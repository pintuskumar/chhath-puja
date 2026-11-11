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


L = {n: bone_head(n) for n in ["Hips", "Spine", "Spine2", "Neck", "Head", "LeftShoulder", "RightShoulder", "LeftArm", "RightArm", "LeftUpLeg", "LeftLeg", "LeftFoot"]}
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
if hair:
    tint_image_node(hair, S.get("hair_tint", [0.07, 0.05, 0.045]), f"{SPEC_ID}_hair")

# ───────────────────────── garment helpers ─────────────────────────


def cloth_mat(name, rgb, rough=0.85, sheen=0.25):
    m = bpy.data.materials.new(f"{SPEC_ID}_{name}")
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*[c ** 2.2 for c in rgb], 1)
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


def skin_from_body(obj, k=4, pelvis_blend=None):
    """Copy armature weights from the nearest body vertices (inverse-distance)."""
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


def body_shell(name, groups, z_min, z_max, offset, mat, sleeve_z_min=None):
    gidx = [group_names.index(g) for g in groups if g in group_names]
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
            if w < 0.5 or v.co.z < zmin or v.co.z > z_max:
                ok = False
                break
        if not ok:
            kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * offset
    bm.verts.layers.deform.remove(dl)
    ob = new_obj(name, bm, [mat])
    skin_from_body(ob)
    return ob


TORSO = ["mixamorig:Spine", "mixamorig:Spine1", "mixamorig:Spine2", "mixamorig:LeftShoulder", "mixamorig:RightShoulder", "mixamorig:LeftArm", "mixamorig:RightArm", "mixamorig:Hips", "mixamorig:Neck"]

# ───────────────────────── wrapped lower garment (saree / dhoti / petticoat) ─────────────────────────


def wrap_skirt(name, z_top, z_bottom, mat, border_mat, pleats=True, flare=0.04, ease=0.012, rows=22, segs=56):
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
            rr_x, rr_y = rx + ease + fl, ry + ease + fl
            pleat = 0.0
            # front pleats: character faces −Y → front is a ≈ −π/2
            da = math.atan2(math.sin(a + math.pi / 2), math.cos(a + math.pi / 2))
            if pleats and abs(da) < 0.55 and t > 0.08:
                pleat = 0.012 * min(1, t * 3) * (0.5 + 0.5 * math.cos(da * 22))
            ring.append(bm.verts.new((cx + (rr_x + pleat) * math.cos(a), cy + (rr_y + pleat) * math.sin(a), z)))
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


def ribbon(name, path_pts, width, offset, mat, border_mat, samples=60, across=6, border_side=1, drop=None):
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
    ob = new_obj(name, bm, [mat, border_mat])
    skin_from_body(ob, k=6)
    return ob


def hood(name, offset, mat, border_mat):
    """Pallu over the head: body head/neck shell, back & top only, flowing to the shoulders."""
    gidx = [group_names.index(g) for g in ("mixamorig:Head", "mixamorig:Neck", "mixamorig:HeadTop_End") if g in group_names]
    face_front_y = L["Head"].y - 0.035
    bm = bmesh.new()
    bm.from_mesh(body.data)
    bm.transform(body.matrix_world)
    dl = bm.verts.layers.deform.verify()
    kill = []
    for f in bm.faces:
        c = f.calc_center_median()
        w = sum(sum(v[dl].get(g, 0.0) for g in gidx) for v in f.verts) / len(f.verts)
        hairline = head_top_z - 0.055
        is_face = c.y < face_front_y and c.z < hairline
        if w < 0.35 or is_face or c.z < L["Neck"].z - 0.02:
            kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * offset
        if v.co.z < L["Head"].z:  # fall outward over the neck like cloth
            v.co.x *= 1.0 + (L["Head"].z - v.co.z) * 1.6
            v.co.y += (L["Head"].z - v.co.z) * 0.25
    # border = faces touching the open edge on the front half (frames the face)
    for f in bm.faces:
        on_edge = any(e.is_boundary for e in f.edges)
        f.material_index = 1 if on_edge and f.calc_center_median().y < L["Head"].y + 0.02 else 0
    # widen the border band by one ring
    ring = {f for f in bm.faces if f.material_index == 1}
    for f in list(ring):
        for e in f.edges:
            for g in e.link_faces:
                if g.calc_center_median().y < L["Head"].y + 0.02:
                    g.material_index = 1
    bm.verts.layers.deform.remove(dl)
    ob = new_obj(name, bm, [mat, border_mat])
    skin_from_body(ob)
    return ob


def dot(name, pos, radius, mat, bone="mixamorig:Head"):
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=10, radius=radius)
    for v in bm.verts:
        v.co = Vector((v.co.x, 0, v.co.y))
    loc, nrm, _, _ = bvh.find_nearest(Vector(pos))
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
border = cloth_mat("border", C["border"], rough=0.7, sheen=0.4)
neck_z, hips_z, foot_z = L["Neck"].z, L["Hips"].z, L["LeftFoot"].z
shoulder_l, shoulder_r = L["LeftShoulder"], L["RightShoulder"]
front_y = body_slab(L["Spine2"].z - 0.05, L["Spine2"].z + 0.05)[:, 1].min()

garments = []
kind = S["outfit"]
if kind == "saree":
    blouse = cloth_mat("blouse", C.get("blouse", C["border"]), rough=0.8)
    garments.append(body_shell("blouse", TORSO, L["Spine"].z + 0.02, neck_z - 0.02, 0.004, blouse, sleeve_z_min=L["LeftArm"].z - 0.16))
    garments.append(wrap_skirt("saree_skirt", hips_z + 0.06, foot_z + 0.025, main, border))
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
        garments.append(hood("pallu_head", 0.03 if hair else 0.012, main, border))
    red = cloth_mat("sindoor", (0.72, 0.06, 0.08), rough=0.5, sheen=0)
    top = Vector((0, L["Head"].y - 0.04, head_top_z - 0.004))
    garments.append(dot("bindi", (0, -0.4, head_top_z - 0.085), 0.0045, red))
    garments.append(dot("sindoor", top, 0.006, red))
elif kind == "dhoti_kurta":
    kurta = cloth_mat("kurta", C["main"])
    garments.append(body_shell("kurta", TORSO + ["mixamorig:LeftForeArm", "mixamorig:RightForeArm", "mixamorig:LeftUpLeg", "mixamorig:RightUpLeg"], hips_z - 0.25, neck_z - 0.01, 0.006, kurta, sleeve_z_min=0))
    dhoti = cloth_mat("dhoti", C.get("dhoti", (0.95, 0.93, 0.86)))
    garments.append(wrap_skirt("dhoti", hips_z + 0.02, foot_z + 0.12, dhoti, border, pleats=True, flare=0.0, ease=0.02))
    if C.get("gamchha"):
        g = cloth_mat("gamchha", C["gamchha"], rough=0.8)
        ls = shoulder_l
        garments.append(ribbon("gamchha", [(ls.x - 0.03, front_y + 0.02, L["Spine"].z), (ls.x, front_y + 0.04, neck_z - 0.02), (ls.x, L["Neck"].y + 0.03, neck_z + 0.01), (ls.x - 0.02, L["Neck"].y + 0.12, L["Spine"].z)], 0.16, 0.02, g, border))
else:  # kurta_pyjama / child
    kurta = cloth_mat("kurta", C["main"])
    garments.append(body_shell("kurta", TORSO + ["mixamorig:LeftForeArm", "mixamorig:RightForeArm", "mixamorig:LeftUpLeg", "mixamorig:RightUpLeg"], hips_z - 0.22, neck_z - 0.01, 0.006, kurta, sleeve_z_min=0))
    py = cloth_mat("pyjama", C.get("pyjama", (0.94, 0.92, 0.85)))
    garments.append(body_shell("pyjama", ["mixamorig:Hips", "mixamorig:LeftUpLeg", "mixamorig:RightUpLeg", "mixamorig:LeftLeg", "mixamorig:RightLeg"], foot_z + 0.06, hips_z + 0.05, 0.007, py))

log("garments", [(g.name, len(g.data.polygons)) for g in garments])

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
