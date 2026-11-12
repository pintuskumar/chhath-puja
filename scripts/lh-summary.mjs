// Prints Lighthouse category scores, key metrics and failing accessibility nodes (used in CI).
import fs from "node:fs";
const dir = process.argv[2] ?? ".lighthouseci";
// Several runs per URL (lighthouserc numberOfRuns): report the median-performance run and
// the spread — single simulated-throttling runs are noisy (e.g. home TBT 60 ms vs 920 ms).
const byUrl = new Map();
for (const f of fs.readdirSync(dir).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"))) {
  const r = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
  const u = r.requestedUrl ?? r.finalDisplayedUrl;
  byUrl.set(u, [...(byUrl.get(u) ?? []), r]);
}
for (const runs of byUrl.values()) {
  const perf = (x) => x.categories.performance?.score ?? 0;
  const tbt = (x) => Math.round(x.audits["total-blocking-time"]?.numericValue ?? 0);
  runs.sort((a, b) => perf(a) - perf(b));
  const r = runs[Math.floor(runs.length / 2)];
  const s = (k) => Math.round((r.categories[k]?.score ?? 0) * 100);
  const m = (id) => r.audits[id]?.displayValue ?? "-";
  console.log(`\n${r.finalDisplayedUrl}  (median of ${runs.length} runs)`);
  if (runs.length > 1) console.log(`  runs: perf ${runs.map((x) => Math.round(perf(x) * 100)).join("/")} · TBT ${runs.map(tbt).join("/")} ms`);
  console.log(`  perf=${s("performance")} a11y=${s("accessibility")} best=${s("best-practices")} seo=${s("seo")}`);
  console.log(`  FCP=${m("first-contentful-paint")} LCP=${m("largest-contentful-paint")} TBT=${m("total-blocking-time")} CLS=${m("cumulative-layout-shift")} SI=${m("speed-index")}`);
  const findNode = (o) => {
    if (!o || typeof o !== "object") return null;
    if (o.type === "node" && o.snippet) return o.snippet;
    for (const v of Object.values(o)) {
      const f = findNode(v);
      if (f) return f;
    }
    return null;
  };
  const lcpAudit = r.audits["largest-contentful-paint-element"];
  const lcpEl = findNode(lcpAudit?.details);
  if (lcpEl) console.log(`  LCP element: ${lcpEl.slice(0, 160)}`);
  const phases = lcpAudit?.details?.items?.[1]?.items?.map((i) => `${i.phase ?? i.label}:${Math.round(i.timing)}ms`);
  if (phases) console.log(`  LCP phases: ${phases.join(" ")}`);
  if (process.env.LH_DEBUG) {
    console.log("  LCP details:", JSON.stringify(lcpAudit?.details)?.slice(0, 900));
    const reqs = r.audits["network-requests"]?.details?.items ?? [];
    const big = [...reqs].sort((a, b) => b.transferSize - a.transferSize).slice(0, 8);
    for (const q of big) console.log(`  req ${Math.round(q.transferSize / 1024)}KB ${q.resourceType} ${q.url.split("/").pop()} start=${Math.round(q.networkRequestTime ?? q.startTime ?? 0)}`);
  }
  const rb = r.audits["render-blocking-resources"]?.details?.items?.map((i) => i.url.split("/").pop());
  if (rb?.length) console.log(`  render-blocking: ${rb.join(" ")}`);
  const boot = r.audits["bootup-time"]?.details?.items?.slice(0, 4).map((i) => `${i.url.split("/").pop()}:${Math.round(i.total)}ms`);
  if (boot) console.log(`  bootup: ${boot.join(" ")}`);
  const mt = r.audits["mainthread-work-breakdown"]?.details?.items?.slice(0, 6).map((i) => `${i.groupLabel ?? i.group}:${Math.round(i.duration)}ms`);
  if (mt) console.log(`  main thread: ${mt.join(" ")}`);
  const lt = r.audits["long-tasks"]?.details?.items?.slice(0, 5).map((i) => `${i.url.split("/").pop() || i.url}@${Math.round(i.startTime)}+${Math.round(i.duration)}ms`);
  if (lt?.length) console.log(`  long tasks: ${lt.join(" ")}`);
  for (const ref of r.categories.accessibility.auditRefs) {
    const a = r.audits[ref.id];
    if (ref.weight > 0 && a.score !== null && a.score < 1) {
      console.log(`  a11y FAIL ${ref.id}: ${a.title}`);
      for (const it of a.details?.items?.slice(0, 6) ?? []) console.log(`     - ${it.node?.snippet?.slice(0, 160)} ${it.node?.explanation ? "| " + it.node.explanation.split("\n")[1]?.trim() : ""}`);
    }
  }
}
