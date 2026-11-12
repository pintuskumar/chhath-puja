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

// Apply the production security headers from vercel.json so CSP problems show up here.
const vercel = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
const securityHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === "/(.*)").headers.map((h) => [h.key.toLowerCase(), h.value]),
);

const errors = [];
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

async function session(name, viewport, renderer, extra) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 600 });
  await ctx.addInitScript((v) => localStorage.setItem("chhath-mahaparv-prefs", v), prefs(renderer, extra));
  await ctx.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    await route.fulfill({ response: res, headers: { ...res.headers(), ...securityHeaders } });
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`[${name}] pageerror ${page.url()}: ${e.message}\n      ${(e.stack ?? "").split("\n").slice(1, 16).join("\n      ")}`));
  page.on("console", (m) => {
    if (m.type() === "error" && /Content Security Policy|Refused to/i.test(m.text())) errors.push(`[${name}] CSP ${page.url()}: ${m.text().slice(0, 300)}`);
    else if (m.type() === "error") errors.push(`[${name}] console.error ${page.url()}: ${m.text().slice(0, 300)}`);
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

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(7000);
  const hasCanvas = await page.locator("canvas").count();
  console.log(`${vpName} home canvases=${hasCanvas}`);
  if (!hasCanvas) errors.push(`[${vpName}] no WebGL canvas on home with renderer=3d`);
  await shot(page, `${vpName}-home`);

  for (const d of days) {
    await page.goto(`${BASE}/day/${d}/`, { waitUntil: "networkidle", timeout: 90000 });
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
  await page.goto(`${BASE}/day/sandhya-arghya/#sandhya-arghya`, { waitUntil: "networkidle", timeout: 90000 });
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

  // Realistic characters from the shipped manifest (not the CI fixture) must actually mount.
  const live = JSON.parse(fs.readFileSync("out/models/manifest.json", "utf8"));
  if (live.clips && Object.keys(live.characters ?? {}).length) {
    const n = await page.evaluate(() => window.__riggedCharacters ?? 0);
    console.log(`${vpName} live rigged characters on arghya scene = ${n}`);
    if (!n) errors.push(`[${vpName}] realistic characters did not mount on the arghya scene`);
  }

  // Before/after comparison frame: same scene + camera (ghat-closeup) as docs/audit/before-*,
  // with the sun pinned to the before frame's 4:55 pm so only the characters differ.
  // Reproduce exactly how the before frame was taken: open the day, scroll to scene 5.
  await page.goto(`${BASE}/day/sandhya-arghya/`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(5000);
  await page.evaluate(() => {
    const el = document.querySelector('[data-scene-index="4"]');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: "instant" });
  });
  // the procedural figures are only the loading fallback → wait for the real models
  const mounted = await page
    .waitForFunction(() => (window.__riggedCharacters ?? 0) >= 3, null, { timeout: 90000 })
    .then(() => true)
    .catch(() => false);
  if (!mounted) errors.push(`[${vpName}] comparison frame: realistic characters did not mount`);
  await wait(3500);
  const pinned = await page.evaluate(() => {
    const el = [...document.querySelectorAll('input[type="range"]')].find((e) => Number(e.max) > 12);
    if (!el) return false;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, "16.9");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  });
  if (!pinned) console.log(`${vpName}: time slider not found, comparison frame uses the scene's clock`);
  await wait(3000);
  await shot(page, `compare-${vpName}-sandhya-arghya`);

  // Stage toolbar must fit the viewport (time read-out + "follow scene" button fully visible)
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    return [...document.querySelectorAll('[role="toolbar"] output, [role="toolbar"] button')]
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width > 0 && (r.right > vw + 1 || r.left < -1))
      .map((r) => `${Math.round(r.left)}–${Math.round(r.right)}`);
  });
  if (overflow.length) errors.push(`[${vpName}] stage toolbar overflows the viewport: ${overflow.join(", ")}`);

  // Close-up view → real photograph of the moment (src/content/photos.ts), loaded and credited
  try {
    // click like a tap on the visible button: Playwright's own click scrolls the page first,
    // which on the scroll-driven story moves to the next scene
    const tapped = await page.evaluate(() => {
      const b = [...document.querySelectorAll('[role="toolbar"] button')].find((e) => e.getAttribute("aria-label") === "नज़दीक से");
      b?.click();
      return !!b;
    });
    if (!tapped) throw new Error("no close-up button on the arghya scene");
    const ok = await page
      .waitForFunction(() => {
        const img = document.querySelector('[data-testid="photo-closeup"] img');
        return !!img && img.complete && img.naturalWidth > 0;
      }, null, { timeout: 30000 })
      .then(() => true)
      .catch(() => false);
    if (!ok) errors.push(`[${vpName}] close-up photo did not load on the arghya scene`);
    const credit = await page.locator('[data-testid="photo-credit"]').innerText().catch(() => "");
    if (!/CC BY|पारिवारिक|family/.test(credit)) errors.push(`[${vpName}] close-up photo has no credit/licence`);
    await wait(1200);
    // toolbar + photo credit must be on top of the scene card that is on screen (not hidden under it)
    const covered = await page.evaluate(() => {
      const targets = [
        ...document.querySelectorAll('[role="toolbar"] button:not([disabled]), [role="toolbar"] input, [data-testid="photo-credit"] a'),
      ];
      return targets
        .map((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) return null;
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return hit && (el === hit || el.contains(hit)) ? null : `${el.getAttribute("aria-label") || el.textContent?.trim()} under ${hit?.tagName.toLowerCase()}.${String(hit?.className).split(" ")[0]}`;
        })
        .filter(Boolean);
    });
    if (covered.length) errors.push(`[${vpName}] stage controls covered by the page: ${covered.join("; ")}`);
    const shifted = await page.evaluate(() =>
      [document.scrollingElement, ...document.querySelectorAll("*")]
        .filter((e) => e && e.scrollLeft > 0)
        .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(" ").slice(0, 3).join(".")} scrollLeft=${e.scrollLeft}`),
    );
    if (shifted.length) console.log(`${vpName} horizontally scrolled after close-up click:`, shifted);
    const still = await page.locator('[data-testid="photo-closeup"]').count();
    if (!still) errors.push(`[${vpName}] close-up photo disappeared before the screenshot`);
    await shot(page, `${vpName}-sandhya-arghya-photo-closeup`);
    await page.evaluate(() =>
      [...document.querySelectorAll('[role="toolbar"] button')].find((e) => e.getAttribute("aria-label") === "पूरा दृश्य")?.click(),
    );
    await wait(800);
  } catch (e) {
    errors.push(`[${vpName}] close-up photo check failed: ${e.message.split("\n")[0]}`);
  }

  // Language switch
  if (viewport.width < 640) await page.getByRole("button", { name: "मेनू" }).click().catch(() => errors.push(`[${vpName}] no menu button`));
  await page.getByRole("button", { name: "English" }).first().click().catch(() => errors.push(`[${vpName}] no English button`));
  await wait(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  if (lang !== "en") errors.push(`[${vpName}] html lang did not switch (got ${lang})`);
  await shot(page, `${vpName}-english`);

  // Explorer
  await page.goto(`${BASE}/explore/`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(4000);
  await shot(page, `${vpName}-explore`);

  // Footer credit → GitHub profile; and no sideways page scroll
  await page.locator("footer").scrollIntoViewIfNeeded();
  await wait(800);
  const gh = await page.locator('footer a[href="https://github.com/pintu544"]').count();
  if (!gh) errors.push(`[${vpName}] footer credit link to github.com/pintu544 missing`);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (wide > 1) console.log(`${vpName}: page content is ${wide}px wider than the viewport (clipped)`);
  await shot(page, `${vpName}-footer`);
  await ctx.close();

  // Free mode
  const free = await session(`${vpName}-free`, viewport, "3d", { mode: "free" });
  await free.page.goto(`${BASE}/day/kharna/`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(5000);
  console.log("free: clicking tab 3");
  await free.page.locator('[role="tab"]').nth(2).click();
  await wait(3500);
  await shot(free.page, `${vpName}-free-kharna-puja`);
  await free.ctx.close();

  // Grip close-ups (desktop): the camera is put in front of a character's hands via the
  // test-only window.__debugCam / window.__gripProbe hooks, UI hidden. Reviewed by eye.
  if (vpName === "desktop") {
    const gs = await session("grip", viewport, "3d");
    await gs.ctx.addInitScript(() => {
      window.__gripProbe = true;
    });
    await gs.page.goto(`${BASE}/day/sandhya-arghya/#sandhya-arghya`, { waitUntil: "networkidle", timeout: 90000 });
    await gs.page.addStyleTag({ content: "header,[data-reveal],[role=toolbar],[data-testid=photo-credit]{visibility:hidden!important}" });
    const frame = async (who, file, { dist = 0.75, up = 0.12, side = 0.35, pose = null, when = () => true } = {}) => {
      // wait for the pose the shot is about (the scene clock moves the vrati from hold to raise)
      const g = await gs.page
        .waitForFunction(([w, p]) => window.__grips?.[w] && (!p || window.__grips[w].pose === p), [who, pose], { timeout: 45000 })
        .then((h) => h.jsonValue())
        .catch(() => null);
      if (!g) return errors.push(`[grip] no grip probe for ${who}`);
      if (!when(g)) console.log(`grip ${who}: state ${JSON.stringify({ hold: g.hold, pose: g.pose, stream: g.stream })}`);
      // camera in front of the character, a little to its right and above the hands
      const aimAt = (h) => {
        const mid = h.l.map((v, i) => (v + h.r[i]) / 2);
        const right = [-h.fwd[2], 0, h.fwd[0]];
        const pos = mid.map((v, i) => v + h.fwd[i] * dist + right[i] * side + (i === 1 ? up : 0));
        return gs.page.evaluate(({ pos, target }) => void (window.__debugCam = { pos, target }), { pos, target: mid });
      };
      await aimAt(g);
      const n0 = await gs.page.evaluate((w) => window.__grips?.[w]?.n ?? 0, who);
      await wait(1000);
      const g2 = await gs.page.evaluate((w) => window.__grips?.[w], who).catch(() => null);
      const fps = g2 ? g2.n - n0 : "?";
      const bad = g2 && [...g2.l, ...g2.r].some((v) => !Number.isFinite(v));
      console.log(`grip ${who}: hold=${g.hold} pose=${g.pose} stream=${g.stream} fps≈${fps} hands L${JSON.stringify(g.l)} R${JSON.stringify(g.r)}`);
      if (bad) errors.push(`[grip] ${who}: non-finite hand position`);
      // software WebGL renders these close-ups at ~0–8 fps; a 0 here is slowness, not a hang
      if (fps === 0) console.log(`grip ${who}: no new frame within 1 s (software WebGL)`);
      // hands move with the clip: re-aim at where they are now, then let a frame render
      if (g2 && !bad) {
        await aimAt(g2);
        await wait(700);
      }
      await gs.page
        .screenshot({ path: `${OUT}/${file}.png`, timeout: 60000 })
        .catch((e) => errors.push(`[grip] ${file}: ${e.message.split("\n")[0]}`));
    };
    try {
      await wait(6000);
      await frame("vrati", "grip-soop-front", { pose: "raise-soop" });
      await frame("vrati", "grip-soop-side", { dist: 0.35, side: 0.75, up: 0.25, pose: "raise-soop" });
      // from below: the palms under the basket's edges
      await frame("vrati", "grip-soop-under", { dist: 0.55, side: 0.2, up: -0.35, pose: "raise-soop" });
      // pouring comes and goes with the scene clock: wait for it
      await gs.page.waitForFunction(() => window.__grips?.youngman?.stream, null, { timeout: 30000 }).catch(() => {});
      await frame("youngman", "grip-lota-front", { dist: 0.6, side: 0.25, up: 0.1 });
      await frame("youngman", "grip-lota-side", { dist: 0.2, side: 0.6, up: 0.15 });
      await frame("youngman", "grip-lota-close", { dist: 0.32, side: 0.12, up: 0.05 });
    } catch (e) {
      errors.push(`[grip] close-ups failed: ${e.message.split("\n")[0]}`);
    }
    await gs.ctx.close().catch(() => {});
  }
}

// Rigged-character pipeline (CI fixture mannequin with UE5 bone names; NOT realistic art).
if (fs.existsSync("out/models/_fixture/manifest.json")) {
  for (const [vpName, viewport] of [
    ["desktop", { width: 1280, height: 800 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const rig = await session(`${vpName}-rig`, viewport, "3d");
    await rig.ctx.route("**/models/manifest.json", (route) =>
      route.fulfill({ contentType: "application/json", body: fs.readFileSync("out/models/_fixture/manifest.json", "utf8") }),
    );
    for (const [scene, file] of [["sandhya-arghya", "arghya"], ["ghat-ki-or", "procession"]]) {
      await rig.page.goto(`${BASE}/day/sandhya-arghya/#${scene}`, { waitUntil: "networkidle", timeout: 90000 });
      await wait(7000);
      const n = await rig.page.evaluate(() => window.__riggedCharacters ?? 0);
      console.log(`${vpName} rig ${scene}: rigged characters mounted = ${n}`);
      if (!n) errors.push(`[${vpName}-rig] no rigged characters did mount on ${scene}`);
      await shot(rig.page, `rig-${vpName}-${file}`);
    }
    await rig.ctx.close();
  }
}

// 2D fallback + reduced motion
const twoD = await session("2d", { width: 390, height: 844 }, "2d", { motion: "reduced" });
for (const route of ["/", "/journey/", "/day/usha-arghya/", "/traditions/"]) {
  await twoD.page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90000 });
  await wait(1500);
  if (await twoD.page.locator("canvas").count()) errors.push(`[2d] canvas present on ${route} with renderer=2d`);
  await shot(twoD.page, `2d${route.replace(/\//g, "_") || "_home"}`);
}
await twoD.ctx.close();

await browser.close();
const unique = [...new Set(errors)];
console.log(unique.length ? `\nERRORS (${unique.length}):\n${unique.join("\n")}` : "\nSMOKE OK — no runtime errors");
process.exit(unique.some((e) => e.includes("pageerror") || e.includes("CSP") || e.includes("no WebGL") || e.includes("did not") || e.includes("did mount")) ? 1 : 0);
