"use client";

import { useEffect, useState } from "react";
import { usePrefs, type Quality } from "./store";

let webglCache: boolean | null = null;

export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

type NavExtras = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** Rough device class used when quality = "auto". */
export function detectQuality(): Exclude<Quality, "auto"> {
  if (typeof window === "undefined") return "medium";
  const nav = navigator as NavExtras;
  const mem = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;
  const small = Math.min(window.innerWidth, window.innerHeight) < 500;
  if (nav.connection?.saveData || mem <= 2 || cores <= 2) return "low";
  if (small || mem <= 4) return "medium";
  return "high";
}

export function useMediaQuery(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

/** Combines OS setting and the in-site override. */
export function useReducedMotion() {
  const sys = useMediaQuery("(prefers-reduced-motion: reduce)");
  const pref = usePrefs((s) => s.motion);
  return pref === "reduced" || (pref === "system" && sys);
}

export function useEffectiveQuality(): Exclude<Quality, "auto"> {
  const q = usePrefs((s) => s.quality);
  const [auto, setAuto] = useState<Exclude<Quality, "auto">>("medium");
  useEffect(() => setAuto(detectQuality()), []);
  return q === "auto" ? auto : q;
}

/**
 * Whether to render real-time 3D. Starts false (SSR + first paint show the 2D
 * illustration, which is also the LCP-friendly path) and upgrades after mount.
 */
export function use3D() {
  const renderer = usePrefs((s) => s.renderer);
  const idle = useIdleAfterLoad();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!idle) return;
    if (renderer === "2d") return setOk(false);
    if (!hasWebGL()) return setOk(false);
    if (renderer === "3d") return setOk(true);
    setOk(detectQuality() !== "low");
  }, [renderer, idle]);
  return ok;
}

let idleReached = false;
/**
 * True once the page has loaded and the main thread is idle. Heavy WebGL work is
 * deferred until then so text, navigation and the 2D scene are usable first.
 */
export function useIdleAfterLoad() {
  const [ready, setReady] = useState(idleReached);
  useEffect(() => {
    if (idleReached) return;
    let cancelled = false;
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      const done = () => {
        if (cancelled) return;
        idleReached = true;
        setReady(true);
      };
      if (w.requestIdleCallback) w.requestIdleCallback(done, { timeout: 2500 });
      else window.setTimeout(done, 800);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", go);
    };
  }, []);
  return ready;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
