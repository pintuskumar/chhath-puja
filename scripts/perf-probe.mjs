// Diagnoses main-thread work after load (what Lighthouse reports as TBT), phone-like settings:
// 4× CPU throttle, 412×823, software WebGL (same as Lighthouse, so the 3D stays off).
// For each URL prints: long tasks, every React commit with the components that rendered in
// it, and the hottest functions of a CPU profile. Needs a `next build --no-mangling` export.
//   node scripts/perf-probe.mjs http://localhost:4173 / /day/nahay-khay/
import { chromium } from "playwright";

const [base = "http://localhost:4173", ...paths] = process.argv.slice(2);
const routes = paths.length ? paths : ["/", "/day/nahay-khay/"];

// Minimal React DevTools hook: React (prod) reports every commit to it.
const hookScript = () => {
  const commits = [];
  window.__probe = { commits, longtasks: [] };
  const name = (f) => {
    const t = f.type;
    if (!t || typeof t === "string") return null;
    return t.displayName || t.name || (t.render && (t.render.displayName || t.render.name)) || (t.type && (t.type.displayName || t.type.name)) || null;
  };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    renderers: new Map(),
    inject() {
      return 1;
    },
    checkDCE() {},
    onScheduleFiberRoot() {},
    onPostCommitFiberRoot() {},
    onCommitFiberUnmount() {},
    onCommitFiberRoot(_id, root) {
      const t = performance.now();
      const counts = {};
      let n = 0;
      const stack = [root.current];
      while (stack.length) {
        const f = stack.pop();
        if (!f) continue;
        // PerformedWork (1): the component function ran in this render
        if ((f.flags & 1) === 1 && (f.tag === 0 || f.tag === 1 || f.tag === 11 || f.tag === 14 || f.tag === 15)) {
          const k = name(f) || "?";
          counts[k] = (counts[k] || 0) + 1;
          n++;
        }
        if (f.sibling) stack.push(f.sibling);
        if (f.child) stack.push(f.child);
      }
      commits.push({ t: Math.round(t), n, top: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12) });
    },
  };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__probe.longtasks.push([Math.round(e.startTime), Math.round(e.duration)]);
  }).observe({ type: "longtask", buffered: true });
};

const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
for (const route of routes) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
  await ctx.addInitScript(hookScript);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
  await cdp.send("Profiler.start");
  const t0 = Date.now();
  await page.goto(base + route, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(9000);
  const { profile } = await cdp.send("Profiler.stop");
  const probe = await page.evaluate(() => window.__probe);
  console.log(`\n================ ${route}  (${Date.now() - t0} ms recorded)`);
  console.log("long tasks [start ms, duration ms]:", JSON.stringify(probe.longtasks));
  console.log(`React commits: ${probe.commits.length}`);
  for (const c of probe.commits) if (c.n > 0) console.log(`  @${c.t}ms  ${c.n} components:`, c.top.map(([k, v]) => `${k}×${v}`).join(" "));

  // CPU profile: self time per function, and total (inclusive) time per function
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  const self = new Map();
  const dt = profile.timeDeltas;
  profile.samples.forEach((id, i) => self.set(id, (self.get(id) ?? 0) + (dt[i + 1] ?? 0) / 1000));
  const key = (n) => `${n.callFrame.functionName || "(anon)"} ${n.callFrame.url.split("/").pop()}:${n.callFrame.lineNumber}`;
  const selfBy = new Map();
  const incl = new Map();
  for (const [id, ms] of self) {
    const n = byId.get(id);
    selfBy.set(key(n), (selfBy.get(key(n)) ?? 0) + ms);
    const seen = new Set();
    for (let p = id; p !== undefined; p = parent.get(p)) {
      const k = key(byId.get(p));
      if (seen.has(k)) continue;
      seen.add(k);
      incl.set(k, (incl.get(k) ?? 0) + ms);
    }
  }
  const fmt = (m, k) => [...m].filter(([n]) => !/^\((root|program|idle|garbage collector)\)/.test(n)).sort((a, b) => b[1] - a[1]).slice(0, k).map(([n, ms]) => `   ${Math.round(ms).toString().padStart(6)} ms  ${n}`).join("\n");
  console.log("top self time:\n" + fmt(selfBy, 25));
  // inclusive time, only app/component-looking frames (capitalised names) — what *our* code costs
  const appIncl = new Map([...incl].filter(([n]) => /^[A-Z]/.test(n) || /^use[A-Z]/.test(n)));
  console.log("top inclusive (components / hooks):\n" + fmt(appIncl, 30));
  await ctx.close();
}
await browser.close();
