#!/usr/bin/env python3
"""
CI-only TEST FIXTURE: writes a grey, box-segment *mannequin* GLB with a real
skin (UE5 / MetaHuman bone names, finger + grip bones) and a clips GLB with a
few skeletal animations. It exists to exercise the rigged-character pipeline
(loading, skinning, clip binding, cross-fades, prop sockets) in the browser
smoke test. It is NOT a realistic character and is never deployed.

usage: python3 scripts/make-test-rig.py <out_dir>
"""
import json, math, os, struct, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "out/models/_fixture"
os.makedirs(OUT, exist_ok=True)

# name, parent, world position (m, Y up, facing +Z)
BONES = [
    ("root", None, (0, 0, 0)),
    ("pelvis", "root", (0, 0.95, 0)),
    ("spine_01", "pelvis", (0, 1.1, 0)),
    ("spine_03", "spine_01", (0, 1.3, 0)),
    ("neck_01", "spine_03", (0, 1.45, 0)),
    ("head", "neck_01", (0, 1.55, 0)),
]
for side, sx in (("r", 1), ("l", -1)):
    BONES += [
        (f"clavicle_{side}", "spine_03", (0.05 * sx, 1.42, 0)),
        (f"upperarm_{side}", f"clavicle_{side}", (0.19 * sx, 1.42, 0)),
        (f"lowerarm_{side}", f"upperarm_{side}", (0.19 * sx, 1.13, 0)),
        (f"hand_{side}", f"lowerarm_{side}", (0.19 * sx, 0.89, 0)),
        (f"index_01_{side}", f"hand_{side}", (0.19 * sx, 0.82, 0.02)),
        (f"hand_{side}_grip", f"hand_{side}", (0.19 * sx, 0.84, 0.04)),
        (f"thigh_{side}", "pelvis", (0.1 * sx, 0.93, 0)),
        (f"calf_{side}", f"thigh_{side}", (0.1 * sx, 0.5, 0)),
        (f"foot_{side}", f"calf_{side}", (0.1 * sx, 0.08, 0)),
        (f"ball_{side}", f"foot_{side}", (0.1 * sx, 0.02, 0.12)),
    ]
IDX = {b[0]: i for i, b in enumerate(BONES)}
WORLD = {b[0]: b[2] for b in BONES}

# (bone, from, to, half-width x, half-depth z)
SEGMENTS = [("pelvis", (0, 0.88, 0), (0, 1.1, 0), 0.17, 0.11), ("spine_01", (0, 1.1, 0), (0, 1.3, 0), 0.16, 0.1),
            ("spine_03", (0, 1.3, 0), (0, 1.46, 0), 0.19, 0.1), ("neck_01", (0, 1.45, 0), (0, 1.55, 0), 0.05, 0.05),
            ("head", (0, 1.53, 0.01), (0, 1.76, 0.01), 0.085, 0.1)]
for side, sx in (("r", 1), ("l", -1)):
    SEGMENTS += [(f"upperarm_{side}", (0.19 * sx, 1.42, 0), (0.19 * sx, 1.13, 0), 0.045, 0.045),
                 (f"lowerarm_{side}", (0.19 * sx, 1.13, 0), (0.19 * sx, 0.89, 0), 0.038, 0.038),
                 (f"hand_{side}", (0.19 * sx, 0.89, 0), (0.19 * sx, 0.8, 0.01), 0.02, 0.045),
                 (f"thigh_{side}", (0.1 * sx, 0.93, 0), (0.1 * sx, 0.5, 0), 0.075, 0.075),
                 (f"calf_{side}", (0.1 * sx, 0.5, 0), (0.1 * sx, 0.08, 0), 0.055, 0.055),
                 (f"foot_{side}", (0.1 * sx, 0.08, -0.04), (0.1 * sx, 0.0, 0.16), 0.045, 0.0)]

pos, joints, weights, idx = [], [], [], []
for bone, a, b, hx, hz in SEGMENTS:
    j = IDX[bone]
    y0, y1 = min(a[1], b[1]), max(a[1], b[1])
    z0, z1 = (min(a[2], b[2]) - hz, max(a[2], b[2]) + hz) if hz else (a[2], b[2])
    cx = a[0]
    corners = [(cx + dx, y, z) for y in (y0, y1) for z in (z0, z1) for dx in (-hx, hx)]
    base = len(pos)
    pos += corners
    joints += [(j, 0, 0, 0)] * 8
    weights += [(1.0, 0, 0, 0)] * 8
    for f in [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]:
        q = [base + v for v in f]
        idx += [q[0], q[1], q[2], q[0], q[2], q[3]]


class Buf:
    def __init__(self):
        self.data, self.views, self.accs = bytearray(), [], []

    def add(self, fmt, rows, gltf_type, comp, minmax=False):
        while len(self.data) % 4:
            self.data += b"\0"
        off = len(self.data)
        for r in rows:
            self.data += struct.pack("<" + fmt, *(r if isinstance(r, (tuple, list)) else (r,)))
        self.views.append({"buffer": 0, "byteOffset": off, "byteLength": len(self.data) - off})
        acc = {"bufferView": len(self.views) - 1, "componentType": comp, "count": len(rows), "type": gltf_type}
        if minmax:
            cols = list(zip(*[r if isinstance(r, (tuple, list)) else (r,) for r in rows]))
            acc["min"], acc["max"] = [min(c) for c in cols], [max(c) for c in cols]
        self.accs.append(acc)
        return len(self.accs) - 1


def write_glb(path, gltf, buf):
    while len(buf.data) % 4:
        buf.data += b"\0"
    gltf["buffers"] = [{"byteLength": len(buf.data)}]
    gltf["bufferViews"], gltf["accessors"] = buf.views, buf.accs
    j = json.dumps(gltf).encode()
    j += b" " * ((4 - len(j) % 4) % 4)
    with open(path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(j) + 8 + len(buf.data)))
        f.write(struct.pack("<II", len(j), 0x4E4F534A) + j)
        f.write(struct.pack("<II", len(buf.data), 0x004E4942) + buf.data)


def bone_nodes():
    nodes = []
    for name, parent, w in BONES:
        p = WORLD[parent] if parent else (0, 0, 0)
        nodes.append({"name": name, "translation": [w[0] - p[0], w[1] - p[1], w[2] - p[2]], "children": []})
    for i, (name, parent, _) in enumerate(BONES):
        if parent:
            nodes[IDX[parent]]["children"].append(i)
    for n in nodes:
        if not n["children"]:
            del n["children"]
    return nodes


# ── character ──
b = Buf()
a_pos = b.add("fff", pos, "VEC3", 5126, True)
a_j = b.add("HHHH", joints, "VEC4", 5123)
a_w = b.add("ffff", weights, "VEC4", 5126)
a_i = b.add("H", idx, "SCALAR", 5123)
ibm = [(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -w[0], -w[1], -w[2], 1) for _, _, w in BONES]
a_ibm = b.add("f" * 16, ibm, "MAT4", 5126)
nodes = bone_nodes()
nodes.append({"name": "TEST_MANNEQUIN_not_realistic", "mesh": 0, "skin": 0})
write_glb(os.path.join(OUT, "mannequin.glb"), {
    "asset": {"version": "2.0", "generator": "chhath make-test-rig.py (CI fixture)"},
    "scene": 0, "scenes": [{"nodes": [0, len(nodes) - 1]}], "nodes": nodes,
    "meshes": [{"primitives": [{"attributes": {"POSITION": a_pos, "JOINTS_0": a_j, "WEIGHTS_0": a_w}, "indices": a_i, "material": 0}]}],
    "materials": [{"name": "fixture_grey", "pbrMetallicRoughness": {"baseColorFactor": [0.62, 0.62, 0.64, 1], "metallicFactor": 0, "roughnessFactor": 0.8}}],
    "skins": [{"joints": list(range(len(BONES))), "inverseBindMatrices": a_ibm, "skeleton": 0}],
}, b)


# ── clips (same skeleton) ──
def qx(deg):
    r = math.radians(deg) / 2
    return (math.sin(r), 0.0, 0.0, math.cos(r))


CLIPS = {
    "idle_stand": (2.0, {"spine_01": [(0, qx(0)), (1, qx(1.5)), (2, qx(0))]}),
    "stand_in_water_idle": (2.4, {"spine_01": [(0, qx(0)), (1.2, qx(1)), (2.4, qx(0))]}),
    "walk_barefoot": (1.0, {
        "thigh_r": [(0, qx(-25)), (0.5, qx(25)), (1, qx(-25))], "thigh_l": [(0, qx(25)), (0.5, qx(-25)), (1, qx(25))],
        "calf_r": [(0, qx(5)), (0.25, qx(40)), (0.5, qx(5)), (1, qx(5))], "calf_l": [(0, qx(5)), (0.5, qx(5)), (0.75, qx(40)), (1, qx(5))],
        "upperarm_r": [(0, qx(15)), (0.5, qx(-15)), (1, qx(15))], "upperarm_l": [(0, qx(-15)), (0.5, qx(15)), (1, qx(-15))]}),
    "soop_hold": (2.0, {"upperarm_r": [(0, qx(-45)), (2, qx(-45))], "upperarm_l": [(0, qx(-45)), (2, qx(-45))],
                        "lowerarm_r": [(0, qx(-40)), (2, qx(-40))], "lowerarm_l": [(0, qx(-40)), (2, qx(-40))]}),
    "soop_raise_arghya": (2.0, {"upperarm_r": [(0, qx(-75)), (2, qx(-75))], "upperarm_l": [(0, qx(-75)), (2, qx(-75))],
                                "lowerarm_r": [(0, qx(-20)), (2, qx(-20))], "lowerarm_l": [(0, qx(-20)), (2, qx(-20))]}),
    "namaste": (2.0, {"upperarm_r": [(0, qx(-30)), (2, qx(-30))], "upperarm_l": [(0, qx(-30)), (2, qx(-30))],
                      "lowerarm_r": [(0, qx(-100)), (2, qx(-100))], "lowerarm_l": [(0, qx(-100)), (2, qx(-100))]}),
    "lota_pour": (2.0, {"upperarm_r": [(0, qx(-60)), (2, qx(-60))], "lowerarm_r": [(0, qx(-10)), (2, qx(-10))]}),
}
cb = Buf()
anims = []
for name, (_, tracks) in CLIPS.items():
    samplers, channels = [], []
    for bone, keys in tracks.items():
        ti = cb.add("f", [k[0] for k in keys], "SCALAR", 5126, True)
        qi = cb.add("ffff", [k[1] for k in keys], "VEC4", 5126)
        samplers.append({"input": ti, "output": qi, "interpolation": "LINEAR"})
        channels.append({"sampler": len(samplers) - 1, "target": {"node": IDX[bone], "path": "rotation"}})
    anims.append({"name": f"Armature|{name}", "samplers": samplers, "channels": channels})
write_glb(os.path.join(OUT, "clips.glb"), {
    "asset": {"version": "2.0", "generator": "chhath make-test-rig.py (CI fixture)"},
    "scene": 0, "scenes": [{"nodes": [0]}], "nodes": bone_nodes(), "animations": anims,
}, cb)

json.dump({
    "version": 1, "note": "CI FIXTURE — grey test mannequin, not realistic",
    "clips": "_fixture/clips.glb", "walkSpeed": 1.1,
    "characters": {k: {"src": "_fixture/mannequin.glb", "height": h, "license": "CI test fixture (generated)"}
                   for k, h in (("vrati", 1.58), ("vrati2", 1.55), ("vrati3", 1.6), ("youngman", 1.72), ("man", 1.7), ("elder", 1.52))},
}, open(os.path.join(OUT, "manifest.json"), "w"), indent=2)
print("fixture written to", OUT)
