// Browser smoke test (CI): forces the 3D renderer, walks every route and scene,
// opens hotspots/panels, switches language and mode, records runtime errors and
// saves screenshots to ./smoke-shots. Exits non-zero on any page error.
//
// Usage: node scripts/smoke.mjs http://localhost:4173
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4173";
const OUT = "smoke-shots";
fs.mkdirSync(OUT, { recursive: true });

const prefs = (renderer, extra = {}) =>
  JSON.stringify({
    state: { lang: "hi", mode: "guided", quality: "medium", motion: "full", renderer, volume: 0.5, progress: {}, ...extra },
    version: 1,
  });

const errors = [];
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

async function session(name, viewport, renderer, extra) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 600 });
  await ctx.addInitScript((v) => localStorage.setItem("chhath-mahaparv-prefs", v), prefs(renderer, extra));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`[${name}] pageerror ${page.url()}: ${e.message}\n      ${(e.stack ?? "").split("\n").slice(1, 16).join("\n      ")}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${name}] console.error ${page.url()}: ${m.text().slice(0, 300)}`);
  });
  return { ctx, page };
}

const shot = (page, file) => page.screenshot({ path: `${OUT}/${file}.png` });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const days = ["nahay-khay", "kharna", "sandhya-arghya", "usha-arghya"];

for (const [vpName, viewport] of [
  ["desktop", { width: 1280, height: 800 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const { ctx, page } = await session(`${vpName}-3d`, viewport, "3d");

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await wait(7000);
  const hasCanvas = await page.locator("canvas").count();
  console.log(`${vpName} home canvases=${hasCanvas}`);
  if (!hasCanvas) errors.push(`[${vpName}] no WebGL canvas on home with renderer=3d`);
  await shot(page, `${vpName}-home`);

  for (const d of days) {
    await page.goto(`${BASE}/day/${d}/`, { waitUntil: "networkidle" });
    await wait(5000);
    await shot(page, `${vpName}-${d}-0-intro`);
    const sections = await page.locator("[data-scene-index]").count();
    for (let i = 0; i < sections; i++) {
      await page.locator(`[data-scene-index="${i}"]`).scrollIntoViewIfNeeded();
      await page.evaluate((i) => {
        const el = document.querySelector(`[data-scene-index="${i}"]`);
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: "instant" });
      }, i);
      await wait(3500);
      const active = await page.evaluate(() => document.querySelector('[aria-current="page"] span span.bg-cream') ? 1 : 0);
      const label = await page.locator('[role="toolbar"] span[aria-hidden="true"]').first().textContent().catch(() => "?");
      console.log(`   ${d} scene ${i + 1}: toolbar=${label}`);
      await shot(page, `${vpName}-${d}-${i + 1}`);
    }
    console.log(`${vpName} ${d}: ${sections} scenes`);
  }

  // Hotspot → panel (Day 3, arghya scene) and rotate viewer
  await page.goto(`${BASE}/day/sandhya-arghya/#sandhya-arghya`, { waitUntil: "networkidle" });
  await wait(5000);
  const hotspot = page.locator('button[aria-haspopup="dialog"][aria-label*="सूप"]').first();
  if (await hotspot.count()) {
    await hotspot.evaluate((el) => el.click());
    await wait(3500);
    const dialog = await page.locator('[role="dialog"]').count();
    if (!dialog) errors.push(`[${vpName}] hotspot did not open dialog`);
    await shot(page, `${vpName}-panel-soop`);
    await page.keyboard.press("Escape");
  } else errors.push(`[${vpName}] no soop hotspot found on arghya scene`);

  // Language switch
  if (viewport.width < 640) await page.getByRole("button", { name: "मेनू" }).click().catch(() => errors.push(`[${vpName}] no menu button`));
  await page.getByRole("button", { name: "English" }).first().click().catch(() => errors.push(`[${vpName}] no English button`));
  await wait(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  if (lang !== "en") errors.push(`[${vpName}] html lang did not switch (got ${lang})`);
  await shot(page, `${vpName}-english`);

  // Explorer
  await page.goto(`${BASE}/explore/`, { waitUntil: "networkidle" });
  await wait(4000);
  await shot(page, `${vpName}-explore`);
  await ctx.close();

  // Free mode
  const free = await session(`${vpName}-free`, viewport, "3d", { mode: "free" });
  await free.page.goto(`${BASE}/day/kharna/`, { waitUntil: "networkidle" });
  await wait(5000);
  console.log("free: clicking tab 3");
  await free.page.locator('[role="tab"]').nth(2).click();
  await wait(3500);
  await shot(free.page, `${vpName}-free-kharna-puja`);
  await free.ctx.close();
}

// 2D fallback + reduced motion
const twoD = await session("2d", { width: 390, height: 844 }, "2d", { motion: "reduced" });
for (const route of ["/", "/journey/", "/day/usha-arghya/", "/traditions/"]) {
  await twoD.page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await wait(1500);
  if (await twoD.page.locator("canvas").count()) errors.push(`[2d] canvas present on ${route} with renderer=2d`);
  await shot(twoD.page, `2d${route.replace(/\//g, "_") || "_home"}`);
}
await twoD.ctx.close();

await browser.close();
const unique = [...new Set(errors)];
console.log(unique.length ? `\nERRORS (${unique.length}):\n${unique.join("\n")}` : "\nSMOKE OK — no runtime errors");
process.exit(unique.some((e) => e.includes("pageerror") || e.includes("no WebGL") || e.includes("did not")) ? 1 : 0);
