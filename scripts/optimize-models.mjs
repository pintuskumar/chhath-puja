// Optimises raw exports in models-src/ → public/models/ (same relative paths).
//   npm run models:optimize            (needs internet the first time: downloads @gltf-transform/cli via npx)
// Meshopt geometry + WebP textures: both decode in the browser with no external decoder files.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = "models-src";
const OUT = "public/models";
if (!fs.existsSync(SRC)) {
  console.error(`Put raw .glb exports in ./${SRC}/characters and ./${SRC}/anims first (see docs/METAHUMAN_GUIDE.md).`);
  process.exit(1);
}
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const file of walk(SRC).filter((f) => f.endsWith(".glb"))) {
  const rel = path.relative(SRC, file);
  const isAnim = rel.startsWith("anims");
  const out = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const low = /_low\.glb$/.test(rel);
  const args = ["--yes", "@gltf-transform/cli@4", "optimize", file, out, "--compress", "meshopt", "--texture-compress", "webp", "--texture-size", low ? "1024" : "2048"];
  if (isAnim) args.push("--simplify", "false", "--texture-compress", "false");
  // Never let the optimiser merge or instance skinned meshes away from their skeleton.
  args.push("--join", "false", "--instance", "false");
  console.log(`> ${rel}`);
  execFileSync("npx", args, { stdio: "inherit" });
}
console.log("Done. Now run: npm run check:models");
