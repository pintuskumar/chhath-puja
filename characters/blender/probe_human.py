"""Probe: create one rigged MPFB human, list assets/bones, export GLB, render a preview."""
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(__file__))
from common import log, mpfb  # noqa: E402

OUT = os.environ.get("CHAR_OUT", "/tmp/chars")
os.makedirs(OUT, exist_ok=True)

HumanService = mpfb("mpfb.services.humanservice", "HumanService")
TargetService = mpfb("mpfb.services.targetservice", "TargetService")
AssetService = mpfb("mpfb.services.assetservice", "AssetService")
ExportService = mpfb("mpfb.services.exportservice", "ExportService")
ObjectService = mpfb("mpfb.services.objectservice", "ObjectService")
HOP = mpfb("mpfb.entities.objectproperties", "HumanObjectProperties")

AssetService.rescan_pack_metadata()
log("packs:", AssetService.get_pack_names() if AssetService.have_any_pack_meta_data() else "NONE")
for sub, typ in [("skins", "mhmat"), ("clothes", "mhclo"), ("hair", "mhclo"), ("eyes", "mhclo"), ("eyebrows", "mhclo"), ("eyelashes", "mhclo"), ("proxymeshes", "proxy")]:
    try:
        AssetService.update_asset_list(asset_subdir=sub, asset_type=typ)
        items = AssetService.get_asset_list(asset_subdir=sub, asset_type=typ)
        log(f"{sub}:", sorted(v["basename"] for v in items.values()))
    except Exception as e:  # noqa: BLE001
        log(f"{sub}: error {e}")

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

h = HumanService.create_human()
for k, v in {"gender": 0.0, "age": 0.62, "african": 0.3, "asian": 0.15, "caucasian": 0.55, "height": 0.42, "weight": 0.55, "muscle": 0.45}.items():
    try:
        HOP.set_value(k, v, entity_reference=h)
    except Exception as e:  # noqa: BLE001
        log("macro", k, e)
TargetService.reapply_macro_details(h)

skin = None
for cand in ["middleage_darkskinned_female", "middleage_african_female", "young_african_female", "middleage_lightskinned_female", "young_caucasian_female"]:
    skin = AssetService.find_asset_absolute_path(cand + ".mhmat", asset_subdir="skins")
    if skin:
        log("skin", cand)
        break
if skin:
    HumanService.set_character_skin(skin, h, skin_type="GAMEENGINE")

rig = HumanService.add_builtin_rig(h, "mixamo")
log("rig bones:", [b.name for b in rig.data.bones][:80], "count", len(rig.data.bones))

for sub, fname, atype in [("eyes", "low-poly.mhclo", "Eyes"), ("eyebrows", "eyebrow001.mhclo", "Eyebrows"), ("eyelashes", "eyelashes01.mhclo", "Eyelashes"), ("teeth", "teeth_base.mhclo", "Teeth"), ("hair", "bob02.mhclo", "Hair")]:
    p = AssetService.find_asset_absolute_path(fname, asset_subdir=sub)
    if p:
        HumanService.add_mhclo_asset(p, h, asset_type=atype, material_type="GAMEENGINE")
    else:
        log("missing", sub, fname)

root = ExportService.create_character_copy(h, name_suffix="_export")
eb = ObjectService.find_object_of_type_amongst_nearest_relatives(root, "Basemesh")
ExportService.bake_modifiers_remove_helpers(eb, bake_masks=True, bake_subdiv=False, remove_helpers=True, also_proxy=True)

for o in list(bpy.data.objects):
    if o not in [root, *ObjectService.get_list_of_children(root)]:
        bpy.data.objects.remove(o, do_unlink=True)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
log("objects:", [(o.name, o.type) for o in bpy.data.objects], "triangles≈", tris)

bpy.ops.object.select_all(action="SELECT")
glb = os.path.join(OUT, "probe_woman.glb")
bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True, export_skins=True, export_animations=False, export_yup=True)
log("glb bytes", os.path.getsize(glb))

# preview render (Workbench, CPU) — front & 3/4
scn = bpy.context.scene
scn.render.engine = "BLENDER_WORKBENCH"
scn.display.shading.light = "STUDIO"
scn.display.shading.color_type = "TEXTURE"
scn.render.resolution_x, scn.render.resolution_y = 800, 1000
cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 70
cam = bpy.data.objects.new("cam", cam_data)
scn.collection.objects.link(cam)
scn.camera = cam
for name, loc, rot in [("front", (0, -4.2, 0.9), (1.5708, 0, 0)), ("threeq", (2.6, -3.2, 1.3), (1.42, 0, 0.68)), ("face", (0, -1.1, 1.55), (1.5708, 0, 0))]:
    cam.location, cam.rotation_euler = loc, rot
    scn.render.filepath = os.path.join(OUT, f"probe_{name}.png")
    bpy.ops.render.render(write_still=True)
log("done")
