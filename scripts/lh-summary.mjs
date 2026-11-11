// Prints Lighthouse category scores, key metrics and failing accessibility nodes (used in CI).
import fs from "node:fs";
const dir = process.argv[2] ?? ".lighthouseci";
for (const f of fs.readdirSync(dir).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"))) {
  const r = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
  const s = (k) => Math.round((r.categories[k]?.score ?? 0) * 100);
  const m = (id) => r.audits[id]?.displayValue ?? "-";
  console.log(`\n${r.finalDisplayedUrl}`);
  console.log(`  perf=${s("performance")} a11y=${s("accessibility")} best=${s("best-practices")} seo=${s("seo")}`);
  console.log(`  FCP=${m("first-contentful-paint")} LCP=${m("largest-contentful-paint")} TBT=${m("total-blocking-time")} CLS=${m("cumulative-layout-shift")} SI=${m("speed-index")}`);
  const lcpEl = r.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet;
  if (lcpEl) console.log(`  LCP element: ${lcpEl.slice(0, 140)}`);
  const boot = r.audits["bootup-time"]?.details?.items?.slice(0, 4).map((i) => `${i.url.split("/").pop()}:${Math.round(i.total)}ms`);
  if (boot) console.log(`  bootup: ${boot.join(" ")}`);
  for (const ref of r.categories.accessibility.auditRefs) {
    const a = r.audits[ref.id];
    if (ref.weight > 0 && a.score !== null && a.score < 1) {
      console.log(`  a11y FAIL ${ref.id}: ${a.title}`);
      for (const it of a.details?.items?.slice(0, 6) ?? []) console.log(`     - ${it.node?.snippet?.slice(0, 160)} ${it.node?.explanation ? "| " + it.node.explanation.split("\n")[1]?.trim() : ""}`);
    }
  }
}
