// Content integrity check — run with `npm run check:content` (Node ≥ 22.6, native TS type-stripping).
// Verifies every translatable field has Hindi + English, references resolve,
// and every scene has a working choreography and sky state.
import { days } from "../src/content/days.ts";
import { objectsById, explorerFeatured } from "../src/content/objects.ts";
import { sources } from "../src/content/sources.ts";
import { traditionSections, glossary } from "../src/content/traditions.ts";
import { ui } from "../src/content/ui.ts";
import { choreograph } from "../src/three/choreography.ts";
import { skyAt } from "../src/lib/sky.ts";

const errors = [];
const L = (v, where) => {
  if (!v || !v.hi?.trim() || !v.en?.trim()) errors.push(`missing translation: ${where}`);
};
let scenes = 0;
for (const d of days) {
  ["title", "subtitle", "theme", "tithi", "description"].forEach((k) => L(d[k], `${d.slug}.${k}`));
  d.culturalNotes.forEach((n, i) => L(n.text, `${d.slug}.note${i}`));
  d.ritualObjects.forEach((o) => objectsById[o] || errors.push(`unknown object ${o} in ${d.slug}`));
  d.scenes.forEach((s, i) => {
    scenes++;
    const w = `${d.slug}/${s.id}`;
    if (s.index !== i) errors.push(`bad index ${w}`);
    ["title", "caption", "what", "why", "when", "visualDescription"].forEach((k) => L(s[k], `${w}.${k}`));
    if (!s.how.hi.length || s.how.hi.length !== s.how.en.length) errors.push(`how hi/en length mismatch ${w}`);
    s.objects.forEach((o) => objectsById[o] || errors.push(`unknown object ${o} in ${w}`));
    s.sources.forEach((o) => sources[o] || errors.push(`unknown source ${o} in ${w}`));
    s.regionalNotes.forEach((n, j) => L(n.text, `${w}.regional${j}`));
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const actors = choreograph(s.stage.animation, p, 2);
      if (!Object.keys(actors).length) errors.push(`no choreography for ${s.stage.animation}`);
      for (const [k, a] of Object.entries(actors)) if (a.pos.some(Number.isNaN) || Number.isNaN(a.rotY)) errors.push(`NaN in ${w}:${k}`);
    }
    if (!/^#[0-9a-f]{6}$/.test(skyAt(s.stage.timeOfDay).top)) errors.push(`bad sky for ${w}`);
  });
}
for (const o of Object.values(objectsById)) {
  ["description", "whenUsed", "usage", "significance"].forEach((k) => L(o[k], `${o.id}.${k}`));
  o.sources.forEach((s) => sources[s] || errors.push(`unknown source ${s} in ${o.id}`));
}
explorerFeatured.forEach((id) => objectsById[id] || errors.push(`featured object missing: ${id}`));
traditionSections.forEach((s) => {
  L(s.title, s.id);
  L(s.body, s.id);
});
glossary.forEach((g) => L(g.meaning, g.term));
Object.entries(ui).forEach(([k, v]) => L(v, `ui.${k}`));

console.log(`days=${days.length} scenes=${scenes} objects=${Object.keys(objectsById).length} sources=${Object.keys(sources).length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("content OK");
