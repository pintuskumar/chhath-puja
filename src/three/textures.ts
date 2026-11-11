import * as THREE from "three";

/**
 * Procedural CanvasTextures — generated once on the client, cached, tiny in memory
 * (≤ 512px) and zero network cost. See docs/ASSET_MANIFEST.md.
 */
const cache = new Map<string, THREE.Texture>();

function make(key: string, size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, repeat = 1) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Woven bamboo for soop & daura. */
export function weaveTexture() {
  return make("weave", 256, (g, s) => {
    g.fillStyle = "#c99a52";
    g.fillRect(0, 0, s, s);
    const n = 16;
    const w = s / n;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const over = (x + y) % 2 === 0;
        const grad = g.createLinearGradient(x * w, y * w, over ? x * w + w : x * w, over ? y * w : y * w + w);
        grad.addColorStop(0, over ? "#e2b56a" : "#a8773a");
        grad.addColorStop(1, over ? "#b9883f" : "#d3a45a");
        g.fillStyle = grad;
        g.fillRect(x * w + 1, y * w + 1, w - 2, w - 2);
      }
  });
}

/** Plastered earth floor. */
export function earthTexture() {
  return make(
    "earth",
    256,
    (g, s) => {
      g.fillStyle = "#b98a5e";
      g.fillRect(0, 0, s, s);
      const r = rand(7);
      for (let i = 0; i < 1400; i++) {
        g.fillStyle = r() > 0.5 ? "rgba(120,80,50,0.12)" : "rgba(235,200,160,0.12)";
        const x = r() * s;
        const y = r() * s;
        g.beginPath();
        g.arc(x, y, 1 + r() * 4, 0, Math.PI * 2);
        g.fill();
      }
      // Hand-plastered sweep arcs (lipai)
      g.strokeStyle = "rgba(90,60,40,0.10)";
      g.lineWidth = 3;
      for (let i = 0; i < 40; i++) {
        g.beginPath();
        g.arc(r() * s, r() * s, 20 + r() * 40, r() * 3, r() * 3 + 1.4);
        g.stroke();
      }
    },
    6,
  );
}

/** Ghat stone. */
export function stoneTexture() {
  return make(
    "stone",
    256,
    (g, s) => {
      g.fillStyle = "#b9a58b";
      g.fillRect(0, 0, s, s);
      const r = rand(11);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(${80 + r() * 60},${70 + r() * 50},${60 + r() * 40},0.15)`;
        g.fillRect(r() * s, r() * s, 2 + r() * 5, 2 + r() * 5);
      }
      g.strokeStyle = "rgba(70,55,45,0.35)";
      g.lineWidth = 2;
      for (let x = 0; x <= s; x += s / 4) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, s);
        g.stroke();
      }
    },
    4,
  );
}

/**
 * Madhubani-inspired wall painting: double-line borders, fish pairs, sun and lotus,
 * in the site palette on a lime-washed wall. Inspired by, not copied from, any artwork.
 */
export function madhubaniWallTexture() {
  return make("madhubani", 512, (g, s) => {
    g.fillStyle = "#f1e2c2";
    g.fillRect(0, 0, s, s);
    const maroon = "#681C29";
    const saffron = "#E97824";
    const gold = "#F6B93B";
    const blue = "#276C80";
    // Border: double line with triangles
    g.strokeStyle = maroon;
    g.lineWidth = 6;
    g.strokeRect(12, 12, s - 24, s - 24);
    g.lineWidth = 2;
    g.strokeRect(28, 28, s - 56, s - 56);
    g.fillStyle = saffron;
    for (let x = 32; x < s - 32; x += 24) {
      g.beginPath();
      g.moveTo(x, 28);
      g.lineTo(x + 12, 12);
      g.lineTo(x + 24, 28);
      g.fill();
      g.beginPath();
      g.moveTo(x, s - 28);
      g.lineTo(x + 12, s - 12);
      g.lineTo(x + 24, s - 28);
      g.fill();
    }
    // Sun
    const cx = s / 2;
    const cy = s * 0.36;
    g.fillStyle = gold;
    g.beginPath();
    g.arc(cx, cy, 52, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = maroon;
    g.lineWidth = 3;
    g.stroke();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58);
      g.lineTo(cx + Math.cos(a + 0.12) * 84, cy + Math.sin(a + 0.12) * 84);
      g.lineTo(cx + Math.cos(a + 0.24) * 58, cy + Math.sin(a + 0.24) * 58);
      g.fillStyle = i % 2 ? saffron : gold;
      g.fill();
      g.stroke();
    }
    // Face hatching
    g.strokeStyle = maroon;
    g.lineWidth = 1.5;
    for (let r = 14; r < 50; r += 8) {
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
    // Fish pair
    const fish = (x: number, y: number, flip: number) => {
      g.save();
      g.translate(x, y);
      g.scale(flip, 1);
      g.fillStyle = blue;
      g.beginPath();
      g.ellipse(0, 0, 60, 22, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(55, 0);
      g.lineTo(85, -20);
      g.lineTo(85, 20);
      g.fill();
      g.strokeStyle = gold;
      g.lineWidth = 2;
      for (let i = -40; i < 50; i += 10) {
        g.beginPath();
        g.moveTo(i, -18);
        g.lineTo(i + 6, 0);
        g.lineTo(i, 18);
        g.stroke();
      }
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(-40, -4, 5, 0, Math.PI * 2);
      g.fill();
      g.restore();
    };
    fish(s * 0.3, s * 0.72, 1);
    fish(s * 0.7, s * 0.72, -1);
    // Lotus
    g.fillStyle = saffron;
    for (let i = -2; i <= 2; i++) {
      g.beginPath();
      g.ellipse(cx + i * 14, s * 0.62, 9, 26, i * 0.35, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** Terracotta roof tiles. */
export function tileTexture() {
  return make(
    "tile",
    128,
    (g, s) => {
      g.fillStyle = "#9a4a2c";
      g.fillRect(0, 0, s, s);
      g.strokeStyle = "#6e2f1c";
      g.lineWidth = 3;
      for (let y = 0; y < s; y += 16) {
        for (let x = (y / 16) % 2 ? -8 : 0; x < s; x += 16) {
          g.beginPath();
          g.arc(x + 8, y + 16, 8, Math.PI, 0);
          g.stroke();
        }
      }
    },
    4,
  );
}

export function thatchTexture() {
  return make(
    "thatch",
    128,
    (g, s) => {
      g.fillStyle = "#b08a4a";
      g.fillRect(0, 0, s, s);
      const r = rand(3);
      for (let i = 0; i < 500; i++) {
        g.strokeStyle = r() > 0.5 ? "rgba(90,60,25,0.4)" : "rgba(220,190,120,0.4)";
        g.beginPath();
        const x = r() * s;
        const y = r() * s;
        g.moveTo(x, y);
        g.lineTo(x + (r() - 0.5) * 6, y + 14);
        g.stroke();
      }
    },
    3,
  );
}

/** Soft radial glow for sun, lamps and fire (used with additive blending). */
export function glowTexture() {
  return make("glow", 128, (g, s) => {
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,240,200,0.6)");
    grad.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
}

export function thekuaTexture() {
  return make("thekua", 128, (g, s) => {
    g.fillStyle = "#b8742e";
    g.fillRect(0, 0, s, s);
    g.strokeStyle = "#7a4515";
    g.lineWidth = 3;
    // Mould pattern (sanchā): concentric oval with radial grooves
    g.beginPath();
    g.ellipse(s / 2, s / 2, s * 0.36, s * 0.3, 0, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      g.beginPath();
      g.moveTo(s / 2 + Math.cos(a) * 10, s / 2 + Math.sin(a) * 8);
      g.lineTo(s / 2 + Math.cos(a) * s * 0.34, s / 2 + Math.sin(a) * s * 0.28);
      g.stroke();
    }
  });
}

export function matTexture() {
  return make(
    "mat",
    128,
    (g, s) => {
      g.fillStyle = "#d9b56e";
      g.fillRect(0, 0, s, s);
      g.strokeStyle = "#a77c3a";
      g.lineWidth = 2;
      for (let y = 0; y < s; y += 6) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(s, y);
        g.stroke();
      }
      g.strokeStyle = "#681C29";
      g.lineWidth = 6;
      g.strokeRect(6, 6, s - 12, s - 12);
    },
    1,
  );
}
