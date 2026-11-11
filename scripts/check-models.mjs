// Validates realistic character assets listed in public/models/manifest.json.
// No dependencies: parses the GLB JSON chunk directly.
//   npm run check:models
// Checks: file exists, size & triangle budgets, has a skin with hand/finger bones,
// grip sockets, clip names, licence recorded. Fails on hard errors, warns otherwise.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.env.MODELS_ROOT ?? "public/models";
const manifest = JSON.parse(fs.readFileSync(`${ROOT}/manifest.json`, "utf8"));
const REQUIRED_CLIPS = [
  "idle_stand", "walk_barefoot", "walk_steps_down", "carry_daura_walk", "carry_daura_idle",
  "stand_in_water_idle", "soop_hold", "soop_raise_arghya", "lota_pour", "namaste",
  "sit_crosslegged", "sit_eat", "stir_chulha", "sweep", "bow_touch_feet", "give_prasad",
];
const errors = [];
const warns = [];

function readGlb(rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    errors.push(`missing file: ${file}`);
    return null;
  }
  const buf = fs.readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) {
    errors.push(`${file}: not a binary glTF (.glb)`);
    return null;
  }
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
  return { file, size: buf.length, json };
}

function tris(json) {
  let n = 0;
  for (const m of json.meshes ?? [])
    for (const p of m.primitives ?? []) {
      if ((p.mode ?? 4) !== 4) continue;
      const acc = p.indices !== undefined ? json.accessors[p.indices] : json.accessors[p.attributes.POSITION];
      n += Math.floor(acc.count / 3);
    }
  return n;
}

const nodeNames = (json) => new Set((json.nodes ?? []).map((n) => n.name));
const MB = (b) => (b / 1048576).toFixed(2) + " MB";

const chars = Object.entries(manifest.characters ?? {});
if (!chars.length) {
  console.log("No realistic characters configured (manifest.characters is empty) — site uses procedural figures.");
  process.exit(0);
}
if (!manifest.clips) errors.push("manifest.clips is null but characters are listed");

let skeletonRef = null;
for (const [look, spec] of chars) {
  for (const [label, rel, maxTris, maxBytes] of [
    ["high", spec.src, look.startsWith("child") ? 15000 : 25000, 3.5 * 1048576],
    ...(spec.srcLow ? [["low", spec.srcLow, 6000, 1.2 * 1048576]] : []),
  ]) {
    const g = readGlb(rel);
    if (!g) continue;
    const t = tris(g.json);
    const names = nodeNames(g.json);
    console.log(`${look} (${label}): ${rel} · ${MB(g.size)} · ${t.toLocaleString()} tris · ${g.json.skins?.length ?? 0} skin(s) · ${g.json.materials?.length ?? 0} materials`);
    if (!g.json.skins?.length) errors.push(`${rel}: no skin/skeleton — must be a rigged SkinnedMesh`);
    if (t > maxTris) warns.push(`${rel}: ${t} tris exceeds budget ${maxTris}`);
    if (g.size > maxBytes) warns.push(`${rel}: ${MB(g.size)} exceeds budget ${MB(maxBytes)} — run npm run models:optimize`);
    const hasHand = ["hand_r", "mixamorigRightHand", "RightHand"].some((n) => names.has(n));
    const hasFinger = [...names].some((n) => /index_0?1_r|RightHandIndex1|index_metacarpal_r/i.test(n));
    if (!hasHand) errors.push(`${rel}: no right hand bone (hand_r / mixamorigRightHand)`);
    if (!hasFinger) warns.push(`${rel}: no finger bones found — hands cannot grip the soop`);
    if (!names.has("hand_r_grip")) warns.push(`${rel}: no hand_r_grip socket — props attach to the wrist, tune manifest props offsets`);
    if (!spec.license || /todo|unknown/i.test(spec.license)) errors.push(`${look}: licence not recorded in manifest`);
    if (label === "high") {
      const bones = (g.json.skins?.[0]?.joints ?? []).map((j) => g.json.nodes[j].name).sort().join(",");
      if (skeletonRef && skeletonRef.bones !== bones) warns.push(`${rel}: skeleton differs from ${skeletonRef.file} — clips may not bind`);
      skeletonRef ??= { bones, file: rel };
    }
  }
}

if (manifest.clips) {
  const g = readGlb(manifest.clips);
  if (g) {
    const clips = (g.json.animations ?? []).map((a) => (a.name ?? "").split("|").pop().toLowerCase());
    console.log(`clips: ${manifest.clips} · ${MB(g.size)} · ${clips.length} clips: ${clips.join(", ")}`);
    const missing = REQUIRED_CLIPS.filter((c) => !clips.includes(c));
    if (missing.length) warns.push(`missing clips (poses fall back to idle/sit): ${missing.join(", ")}`);
    if (!clips.includes("idle_stand")) errors.push("clips file must contain idle_stand");
  }
}

warns.forEach((w) => console.warn("WARN  " + w));
errors.forEach((e) => console.error("ERROR " + e));
process.exit(errors.length ? 1 : 0);
