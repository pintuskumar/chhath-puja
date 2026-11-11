"""
Author the shared Chhath animation clips on the MPFB Mixamo skeleton — headless.

  blender --background --python build_clips.py -- <out_dir>

Clips are keyframed (not motion-captured). Poses are described in world terms
(limb directions, hand targets solved with 2-bone IK, finger curl about the knuckle
hinge axis) so they do not depend on bone-roll conventions. Every clip is in place
(no root travel: the site's choreography moves the actor); only the hips move
vertically (walk bob, sitting). Ritual postures are deliberately simple and static
(holding / raising the soop, joined palms) — see characters/NOTES.md.

Output: <out>/chhath_clips.glb (armature only, one animation per clip) and
<out>/clips_sheet.png (mid-frame of every clip on the bare body, for review).
"""
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(__file__))
from common import log, mpfb  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = argv[0] if argv else os.environ.get("CHAR_OUT", "/tmp/chars")
os.makedirs(OUT, exist_ok=True)
SPECS = json.load(open(os.path.join(os.path.dirname(__file__), "..", "specs.json")))
S = SPECS["vrati_a"]
FPS = 24

HumanService = mpfb("mpfb.services.humanservice", "HumanService")
TargetService = mpfb("mpfb.services.targetservice", "TargetService")
AssetService = mpfb("mpfb.services.assetservice", "AssetService")
HOP = mpfb("mpfb.entities.objectproperties", "HumanObjectProperties")
AssetService.rescan_pack_metadata()

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
h = HumanService.create_human()
for k, v in S["macros"].items():
    HOP.set_value(k, v, entity_reference=h)
TargetService.reapply_macro_details(h)
skin_path = AssetService.find_asset_absolute_path(S["skin"] + ".mhmat", asset_subdir="skins")
HumanService.set_character_skin(skin_path, h, skin_type="GAMEENGINE")
rig = HumanService.add_builtin_rig(h, "mixamo")
log("rig", rig.name, "matrix_world identity:", rig.matrix_world == Matrix.Identity(4))

scn = bpy.context.scene
scn.render.fps = FPS
pbs = rig.pose.bones
for pb in pbs:
    pb.rotation_mode = "QUATERNION"
W = rig.matrix_world
Winv = W.inverted()
W3inv = W.to_3x3().inverted()


def P(n):
    return pbs.get("mixamorig:" + n)


def upd():
    bpy.context.view_layer.update()


def wpos(n, tail=False):
    pb = P(n)
    return W @ (pb.tail if tail else pb.head)


def wdir(n):
    pb = P(n)
    return (W.to_3x3() @ (pb.tail - pb.head)).normalized()


def reset():
    for pb in pbs:
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
    upd()


def rot_about_head(n, R3):
    """Apply a world-space rotation to bone n about its head (children follow)."""
    pb = P(n)
    if pb is None:
        return
    R = (W3inv @ R3 @ W.to_3x3()).to_4x4()
    head = pb.head.copy()
    pb.matrix = Matrix.Translation(head) @ R @ Matrix.Translation(-head) @ pb.matrix
    upd()


def turn(n, axis, deg):
    rot_about_head(n, Matrix.Rotation(math.radians(deg), 3, Vector(axis).normalized()))


def aim(n, d):
    """Point bone n along world direction d with the minimal rotation."""
    if P(n) is None:
        return
    rot_about_head(n, wdir(n).rotation_difference(Vector(d).normalized()).to_matrix())


def shift(n, v):
    pb = P(n)
    pb.matrix = Matrix.Translation(W3inv @ Vector(v)) @ pb.matrix
    upd()


def two_bone(upper, lower, target, pole):
    """Analytic IK: place the end of `lower` at `target`, bending towards `pole`."""
    S0 = wpos(upper)
    a, b = P(upper).length * W.to_scale().x, P(lower).length * W.to_scale().x
    T = Vector(target)
    d = (T - S0).length
    d = min(max(d, abs(a - b) + 1e-3), (a + b) * 0.999)
    u = (T - S0).normalized()
    p = Vector(pole)
    p = (p - u * p.dot(u)).normalized()
    cosA = (a * a + d * d - b * b) / (2 * a * d)
    sinA = math.sqrt(max(0.0, 1 - cosA * cosA))
    E = S0 + u * (a * cosA) + p * (a * sinA)
    aim(upper, E - S0)
    aim(lower, (S0 + u * d) - wpos(lower))
    IK_ERR[lower] = max(IK_ERR.get(lower, 0.0), (wpos(lower, tail=True) - T).length)


IK_ERR = {}


FINGERS = ["Index", "Middle", "Ring", "Pinky"]


def across(side):
    return (wpos(f"{side}HandIndex1") - wpos(f"{side}HandPinky1")).normalized()


def orient_hand(side, d, across_want):
    """Point the hand along d and roll it so index→pinky knuckles line up with across_want."""
    n = f"{side}Hand"
    aim(n, d)
    ax = wdir(n)
    cur = across(side)
    want = Vector(across_want)
    cur_p = (cur - ax * cur.dot(ax)).normalized()
    want_p = (want - ax * want.dot(ax)).normalized()
    ang = cur_p.angle(want_p, 0.0)
    if cur_p.cross(want_p).dot(ax) < 0:
        ang = -ang
    rot_about_head(n, Matrix.Rotation(ang, 3, ax))


def curl(side, deg, thumb=0.4):
    """Flex the fingers about the knuckle hinge axis (index→pinky)."""
    if P(f"{side}HandIndex1") is None:
        return
    sgn = 1 if side == "Right" else -1
    hinge = across(side)
    for f in FINGERS:
        for j, k in ((1, 0.8), (2, 1.0), (3, 0.7)):
            n = f"{side}Hand{f}{j}"
            if P(n):
                turn(n, hinge, sgn * deg * k)
    if thumb and P(f"{side}HandThumb2"):
        turn(f"{side}HandThumb2", hinge, sgn * deg * thumb * 0.5)


# ── rest landmarks ──
reset()
REST = {n: wdir(n) for n in ["LeftUpLeg", "LeftLeg", "LeftFoot", "RightUpLeg", "RightLeg", "RightFoot", "LeftArm", "RightArm"]}
HIP_Z = wpos("Hips").z
THIGH = P("LeftUpLeg").length * W.to_scale().x
SHIN = P("LeftLeg").length * W.to_scale().x
LEG_V = -(REST["LeftUpLeg"].z * THIGH + REST["LeftLeg"].z * SHIN)  # vertical leg extent at rest
X = Vector((1, 0, 0))
FWD = Vector((0, -1, 0))  # the character faces −Y; its left is +X
UP = Vector((0, 0, 1))
log(f"hips {HIP_Z:.3f} thigh {THIGH:.3f} shin {SHIN:.3f}")


def pitch(v, deg):
    """Tilt a direction forward (towards −Y) by deg; for downward vectors, + swings it forward."""
    return Matrix.Rotation(math.radians(-deg), 3, X) @ Vector(v)


def side_sign(side):
    return 1 if side == "Left" else -1


def bump(x, c, w):
    d = (x - c + 0.5) % 1.0 - 0.5  # periodic distance
    return math.exp(-(d / w) ** 2)


# ── posture building blocks ──
def spine(fwd=0.0, side=0.0, twist=0.0, breathe=0.0):
    for n, k in (("Spine", 0.3), ("Spine1", 0.35), ("Spine2", 0.35)):
        if fwd:
            turn(n, X, fwd * k)
        if side:
            turn(n, FWD, side * k)
        if twist:
            turn(n, UP, twist * k)
    if breathe:
        turn("Spine2", X, -breathe)


def head(pitch_deg=0.0, yaw=0.0):
    turn("Neck", X, pitch_deg * 0.4)
    turn("Head", X, pitch_deg * 0.6)
    if yaw:
        turn("Head", UP, yaw)


def legs_stand(spread=0.0, knee=0.0):
    if knee:  # bent knees lower the hips so the feet stay on the ground
        shift("Hips", (0, 0, -ground_drop(knee * 0.5, knee, knee * 0.5, knee)))
    for sd in ("Left", "Right"):
        s = side_sign(sd)
        th = Vector(REST[f"{sd}UpLeg"]) + X * (s * spread)
        aim(f"{sd}UpLeg", pitch(th, knee * 0.5))
        aim(f"{sd}Leg", pitch(REST[f"{sd}Leg"], -knee * 0.5))
        aim(f"{sd}Foot", REST[f"{sd}Foot"])


def ground_drop(th_l, k_l, th_r, k_r):
    """How far the hips must drop so the lower foot touches the ground."""
    def ext(th, k):
        return THIGH * math.cos(math.radians(th)) + SHIN * math.cos(math.radians(th - k))
    return LEG_V - max(ext(th_l, k_l), ext(th_r, k_r))


def arms_relaxed(swing_l=0.0, swing_r=0.0, elbow=10.0, out=0.16):
    for sd, sw in (("Left", swing_l), ("Right", swing_r)):
        s = side_sign(sd)
        up = pitch(Vector((s * out, 0.0, -1.0)), sw)
        aim(f"{sd}Arm", up)
        aim(f"{sd}ForeArm", pitch(Vector((s * out * 0.5, 0.0, -1.0)), sw + elbow))
        orient_hand(sd, wdir(f"{sd}ForeArm"), FWD)
        curl(sd, 18)


def hands_to(lt, rt, pole_l=None, pole_r=None):
    two_bone("LeftArm", "LeftForeArm", lt, pole_l or Vector((1, 0.3, -1)))
    two_bone("RightArm", "RightForeArm", rt, pole_r or Vector((-1, 0.3, -1)))


def chest():
    return wpos("Spine2")


def front_of(p, dist, dz=0.0, dx=0.0):
    return Vector(p) + FWD * dist + UP * dz + X * dx


# ── walk cycle ──
def walk_legs(t, amp=24.0, knee_extra=0.0, foot_amp=1.0):
    vals = {}
    for sd, ph in (("Left", t), ("Right", (t + 0.5) % 1.0)):
        th = amp * math.cos(2 * math.pi * ph)
        k = 5 + knee_extra + 12 * bump(ph, 0.1, 0.08) + 52 * bump(ph, 0.73, 0.11)
        vals[sd] = (th, k, ph)
    drop = ground_drop(vals["Left"][0], vals["Left"][1], vals["Right"][0], vals["Right"][1])
    shift("Hips", (0, 0, -drop))
    for sd in ("Left", "Right"):
        th, k, ph = vals[sd]
        aim(f"{sd}UpLeg", pitch(REST[f"{sd}UpLeg"], th))
        aim(f"{sd}Leg", pitch(REST[f"{sd}Leg"], th - k))
        # heel strike: toes up; push-off: heel lifts; swing: toes clear the ground
        fp = foot_amp * (14 * bump(ph, 0.0, 0.06) - 22 * bump(ph, 0.58, 0.07) + 6 * bump(ph, 0.8, 0.1))
        aim(f"{sd}Foot", pitch(REST[f"{sd}Foot"], -fp))
    return vals


# ── clip definitions: f(t∈[0,1)) poses the rig from rest ──
def c_idle(t):
    b = math.sin(2 * math.pi * t)
    shift("Hips", (0.006 * b, 0, 0))
    legs_stand(spread=0.02)
    spine(side=-0.8 * b, breathe=1.2 * math.sin(4 * math.pi * t))
    head(pitch_deg=2, yaw=3 * math.sin(2 * math.pi * t + 1))
    arms_relaxed(swing_l=2 + b, swing_r=2 - b)


def c_water(t):
    b = math.sin(2 * math.pi * t)
    shift("Hips", (0.005 * b, 0, -0.01))
    legs_stand(spread=0.05, knee=4)
    spine(fwd=2, side=-0.6 * b, breathe=1.0 * math.sin(4 * math.pi * t))
    head(pitch_deg=-4)
    hands_to(front_of(wpos("Hips"), 0.22, 0.05, 0.10), front_of(wpos("Hips"), 0.22, 0.05, -0.10))
    for sd in ("Left", "Right"):
        orient_hand(sd, wdir(f"{sd}ForeArm"), FWD)
        curl(sd, 22)


def c_walk(t, down=False):
    v = walk_legs(t, amp=17 if down else 24, knee_extra=14 if down else 0)
    sl, sr = v["Left"][0], v["Right"][0]
    spine(fwd=7 if down else 3, twist=4 * math.cos(2 * math.pi * t))
    head(pitch_deg=8 if down else 2, yaw=-2 * math.cos(2 * math.pi * t))
    arms_relaxed(swing_l=-sl * 0.6, swing_r=-sr * 0.6, elbow=12)


def c_walk_down(t):
    c_walk(t, down=True)


def carry_arms():
    # palms steady the daura on the head: hands beside the crown, elbows out
    hd = wpos("Head")
    top = Vector((hd.x, hd.y, hd.z + 0.24))
    hands_to(top + Vector((0.19, -0.02, 0.0)), top + Vector((-0.19, -0.02, 0.0)), Vector((1, 0.2, -0.4)), Vector((-1, 0.2, -0.4)))
    for sd in ("Left", "Right"):
        s = side_sign(sd)
        orient_hand(sd, Vector((-s * 0.6, 0, 1)), Vector((0, -1, 0)))
        curl(sd, 30)


def c_carry_walk(t):
    walk_legs(t, amp=20)
    spine(twist=2 * math.cos(2 * math.pi * t))
    carry_arms()


def c_carry_idle(t):
    legs_stand(spread=0.03)
    spine(breathe=1.0 * math.sin(2 * math.pi * t))
    carry_arms()


def soop_hands(height, dist, lift=0.0):
    c = chest()
    base = Vector((c.x, c.y, height + lift))
    lt, rt = front_of(base, dist, 0, 0.16), front_of(base, dist, 0, -0.16)
    hands_to(lt, rt, Vector((1, 0.2, -1)), Vector((-1, 0.2, -1)))
    for sd in ("Left", "Right"):
        s = side_sign(sd)
        # palms up and inwards under the rim of the soop, fingers forward
        orient_hand(sd, Vector((-s * 0.25, -1, 0.15)), Vector((-s, 0, 0)))
        curl(sd, 35)


def c_soop_hold(t):
    shift("Hips", (0, 0, -0.01))
    legs_stand(spread=0.05, knee=4)
    spine(breathe=1.0 * math.sin(2 * math.pi * t))
    head(pitch_deg=4)
    soop_hands(chest().z - 0.06, 0.30)


def c_soop_raise(t):
    shift("Hips", (0, 0, -0.01))
    legs_stand(spread=0.05, knee=4)
    spine(fwd=-3, breathe=0.8 * math.sin(2 * math.pi * t))
    head(pitch_deg=-10)  # towards the sun
    soop_hands(wpos("Head").z + 0.03, 0.36, lift=0.02 * math.sin(2 * math.pi * t))


def c_lota(t):
    legs_stand(spread=0.04)
    spine(fwd=4)
    head(pitch_deg=10)
    lift = 0.5 - 0.5 * math.cos(2 * math.pi * t)  # raise → pour → lower
    c = chest()
    rt = front_of(c, 0.33, -0.05 + 0.08 * lift, -0.04)
    lt = front_of(c, 0.26, -0.12, 0.10)
    hands_to(lt, rt)
    orient_hand("Right", Vector((0.2, -1, 0.1)), Vector((0, 0, -1)))
    turn("RightHand", wdir("RightHand"), -55 * lift)  # tilt the lota
    curl("Right", 45)
    orient_hand("Left", Vector((-0.4, -1, 0)), Vector((0, 0, 1)))
    curl("Left", 25)


def c_namaste(t):
    legs_stand(spread=0.02)
    spine(fwd=3, breathe=1.0 * math.sin(2 * math.pi * t))
    head(pitch_deg=8)
    c = chest()
    p = front_of(c, 0.16, 0.04)
    hands_to(p + X * 0.012, p - X * 0.012, Vector((1, 0.4, -0.6)), Vector((-1, 0.4, -0.6)))
    for sd in ("Left", "Right"):
        orient_hand(sd, Vector((0, -0.2, 1)), FWD)
        curl(sd, 4, thumb=0)


def sit_base(lean=4.0):
    shift("Hips", (0, 0, -(HIP_Z - 0.12)))
    for sd, inner in (("Left", -1), ("Right", 1)):
        s = side_sign(sd)
        aim(f"{sd}UpLeg", Vector((s * 0.72, -0.68, -0.12)))
        # shins cross in front; the left one slightly in front of / below the right
        aim(f"{sd}Leg", Vector((-s * 0.95, -0.12 if sd == "Left" else -0.02, -0.06 if sd == "Left" else 0.02)))
        aim(f"{sd}Foot", Vector((-s * 0.4, -0.5, -0.3)))
    spine(fwd=lean)


def hands_on_knees():
    for sd in ("Left", "Right"):
        k = wpos(f"{sd}Leg")
        two_bone(f"{sd}Arm", f"{sd}ForeArm", k + Vector((0, -0.03, 0.07)), Vector((side_sign(sd), 0.5, -0.5)))
        orient_hand(sd, Vector((side_sign(sd) * 0.3, -0.6, -1)), FWD)
        curl(sd, 20)


def c_sit(t):
    sit_base()
    spine(breathe=1.0 * math.sin(2 * math.pi * t))
    head(pitch_deg=3)
    hands_on_knees()


def c_sit_eat(t):
    sit_base(lean=8)
    head(pitch_deg=8)
    k = wpos("LeftLeg")
    two_bone("LeftArm", "LeftForeArm", k + Vector((0, -0.03, 0.07)), Vector((1, 0.5, -0.5)))
    orient_hand("Left", Vector((0.3, -0.6, -1)), FWD)
    curl("Left", 20)
    up = 0.5 - 0.5 * math.cos(2 * math.pi * t)  # leaf plate → mouth → plate
    plate = front_of(wpos("Hips"), 0.38, 0.06, -0.06)
    mouth = front_of(wpos("Head"), 0.09, 0.0, -0.02)
    two_bone("RightArm", "RightForeArm", plate.lerp(mouth, up), Vector((-1, 0.2, -1)))
    orient_hand("Right", Vector((0.3, -1, -0.4 + 1.0 * up)), Vector((1, 0, 0)))
    curl("Right", 40)


def c_stir(t):
    sit_base(lean=14)
    head(pitch_deg=14)
    k = wpos("LeftLeg")
    two_bone("LeftArm", "LeftForeArm", k + Vector((0, -0.03, 0.07)), Vector((1, 0.5, -0.5)))
    orient_hand("Left", Vector((0.3, -0.6, -1)), FWD)
    curl("Left", 20)
    a = 2 * math.pi * t
    pot = front_of(wpos("Hips"), 0.45, 0.32, -0.08)
    two_bone("RightArm", "RightForeArm", pot + Vector((0.06 * math.cos(a), -0.06 * math.sin(a), 0)), Vector((-1, 0.3, -0.6)))
    orient_hand("Right", Vector((0.2, -0.5, -1)), Vector((1, 0, 0)))
    curl("Right", 50)


def c_sweep(t):
    shift("Hips", (0, 0.03, 0))
    legs_stand(spread=0.06, knee=24)
    sw = math.sin(2 * math.pi * t)
    spine(fwd=38, twist=-6 * sw)
    head(pitch_deg=-12)
    hip = wpos("Hips")
    two_bone("RightArm", "RightForeArm", front_of(Vector((hip.x, hip.y, 0.0)), 0.42, 0.55, -0.05 + 0.22 * sw), Vector((-1, 0.4, -0.3)))
    orient_hand("Right", Vector((0.15 * sw, -0.3, -1)), FWD)
    curl("Right", 50)
    k = wpos("LeftLeg")
    two_bone("LeftArm", "LeftForeArm", k + Vector((0.02, -0.04, 0.12)), Vector((1, 0.4, -0.4)))
    orient_hand("Left", Vector((0.2, -0.4, -1)), FWD)
    curl("Left", 18)


def c_bow(t):
    # stand → bend to touch the feet of the person in front → hold → rise
    k = min(1.0, max(0.0, (t - 0.15) / 0.25)) if t < 0.6 else max(0.0, 1 - (t - 0.6) / 0.3)
    k = 0.5 - 0.5 * math.cos(math.pi * k)
    shift("Hips", (0, 0.06 * k, 0))
    legs_stand(spread=0.03, knee=20 * k)
    spine(fwd=78 * k)
    head(pitch_deg=10 * k)
    hip = wpos("Hips")
    if k > 0.05:
        g = front_of(Vector((hip.x, hip.y, 0.0)), 0.55, 0.06)
        low = lambda sd: g + X * (side_sign(sd) * 0.09)  # noqa: E731
        hands_to(low("Left").lerp(wpos("LeftArm") + Vector((0.1, -0.05, -0.55)), 1 - k), low("Right").lerp(wpos("RightArm") + Vector((-0.1, -0.05, -0.55)), 1 - k))
        for sd in ("Left", "Right"):
            orient_hand(sd, wdir(f"{sd}ForeArm"), FWD)
            curl(sd, 10)
    else:
        arms_relaxed()


def c_give(t):
    legs_stand(spread=0.03)
    e = 0.5 - 0.5 * math.cos(2 * math.pi * t)
    spine(fwd=6 + 6 * e)
    head(pitch_deg=10)
    c = chest()
    two_bone("RightArm", "RightForeArm", front_of(c, 0.25 + 0.15 * e, -0.15, -0.08), Vector((-1, 0.2, -1)))
    orient_hand("Right", Vector((0.1, -1, 0)), Vector((1, 0, 0)))  # palm up, offering
    curl("Right", 15)
    two_bone("LeftArm", "LeftForeArm", wpos("RightForeArm") + Vector((0.04, 0.0, -0.03)), Vector((1, 0.3, -1)))
    orient_hand("Left", Vector((-1, -0.3, 0)), FWD)
    curl("Left", 30)


CLIPS = [  # name, seconds, pose fn, loop?
    ("idle_stand", 4.0, c_idle),
    ("walk_barefoot", 1.2, c_walk),
    ("walk_steps_down", 1.3, c_walk_down),
    ("carry_daura_walk", 1.25, c_carry_walk),
    ("carry_daura_idle", 4.0, c_carry_idle),
    ("stand_in_water_idle", 5.0, c_water),
    ("soop_hold", 4.0, c_soop_hold),
    ("soop_raise_arghya", 6.0, c_soop_raise),
    ("lota_pour", 3.0, c_lota),
    ("namaste", 4.0, c_namaste),
    ("sit_crosslegged", 4.0, c_sit),
    ("sit_eat", 3.0, c_sit_eat),
    ("stir_chulha", 2.0, c_stir),
    ("sweep", 1.6, c_sweep),
    ("bow_touch_feet", 4.0, c_bow),
    ("give_prasad", 3.0, c_give),
]

rig.animation_data_create()
actions = []
for name, secs, fn in CLIPS:
    act = bpy.data.actions.new(name)
    rig.animation_data.action = act
    n_keys = max(8, int(round(secs * 8)))  # 8 keys/s, sampled at 24 fps on export
    prevq = {}
    for i in range(n_keys + 1):
        t = (i / n_keys) % 1.0  # last key == first → seamless loop
        frame = 1 + secs * FPS * i / n_keys
        reset()
        fn(t)
        for pb in pbs:
            q = pb.rotation_quaternion.copy()
            if pb.name in prevq and prevq[pb.name].dot(q) < 0:
                q.negate()
            prevq[pb.name] = q
            pb.rotation_quaternion = q
            pb.keyframe_insert("rotation_quaternion", frame=frame, group=pb.name)
        P("Hips").keyframe_insert("location", frame=frame, group=P("Hips").name)
    for fc in act.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"
        fc.modifiers.new("CYCLES")
    tr = rig.animation_data.nla_tracks.new()
    tr.name = name
    tr.strips.new(name, 1, act)
    actions.append((name, secs, act))
    errs = {k.replace("ForeArm", ""): round(v * 100, 1) for k, v in IK_ERR.items()}
    log(f"clip {name}: {secs}s, {n_keys + 1} keys, IK reach error cm {errs}")
    IK_ERR.clear()
rig.animation_data.action = None

# ── export (armature only) ──
bpy.ops.object.select_all(action="DESELECT")
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
glb = os.path.join(OUT, "chhath_clips.glb")
bpy.ops.export_scene.gltf(
    filepath=glb, export_format="GLB", use_selection=True, export_skins=True,
    export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True,
    export_frame_step=1, export_optimize_animation_size=True, export_yup=True,
)
log(f"exported {glb} {os.path.getsize(glb) / 1e6:.2f} MB")

# ── review sheet: two frames of every clip on the bare body ──
for tr in rig.animation_data.nla_tracks:
    tr.mute = True
scn.render.engine = "CYCLES"
scn.cycles.device = "CPU"
scn.cycles.samples = 12
scn.cycles.use_denoising = True
TW, TH = 320, 440
scn.render.resolution_x, scn.render.resolution_y = TW, TH
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.45, 0.36, 1)
scn.world = world
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 3.0
sun.rotation_euler = (math.radians(55), 0, math.radians(-35))
scn.collection.objects.link(sun)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
cam.data.lens = 45
scn.collection.objects.link(cam)
scn.camera = cam
loc, tgt = Vector((1.15, -2.35, 1.05)), Vector((0, 0, 0.82))
cam.location = loc
cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()

tiles = []
for name, secs, act in actions:
    rig.animation_data.action = act
    for frac in (0.25, 0.75):
        scn.frame_set(int(1 + secs * FPS * frac))
        path = os.path.join(OUT, f"_tile_{name}_{frac}.png")
        scn.render.filepath = path
        bpy.ops.render.render(write_still=True)
        img = bpy.data.images.load(path)
        tiles.append((name, np.array(img.pixels[:], dtype=np.float32).reshape(TH, TW, 4)))
        bpy.data.images.remove(img)
        os.remove(path)
cols = 8
rows = math.ceil(len(tiles) / cols)
sheet = np.ones((rows * TH, cols * TW, 4), dtype=np.float32)
for i, (_, px) in enumerate(tiles):
    r, c = divmod(i, cols)
    sheet[(rows - 1 - r) * TH:(rows - r) * TH, c * TW:(c + 1) * TW] = px  # Blender pixels are bottom-up
im = bpy.data.images.new("sheet", cols * TW, rows * TH, alpha=True)
im.pixels = sheet.ravel()
im.filepath_raw = os.path.join(OUT, "clips_sheet.png")
im.file_format = "PNG"
im.save()
log("sheet order (2 tiles each, left→right, top→bottom):", [n for n, _, _ in actions])
