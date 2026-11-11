"use client";

/**
 * AudioManager — optional ambient sound, synthesised with the Web Audio API.
 *  - Never autoplays: the AudioContext is created only from a user click.
 *  - No recordings → no copyright issues. (Licensed Chhath songs can be added later; see docs.)
 *  - Ambience follows the current scene: river, dawn birds, evening crickets, cooking fire, bells.
 *  - Captions: the active layers are announced in a polite live region.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { usePrefs, useExperience } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { daysBySlug } from "@/content/days";
import type { L } from "@/content/types";

type Layer = "river" | "birds" | "crickets" | "fire" | "bells";
const CAPTIONS: Record<Layer, L> = {
  river: { hi: "नदी का बहाव", en: "Flowing river" },
  birds: { hi: "भोर के पक्षी", en: "Dawn birds" },
  crickets: { hi: "संध्या के झींगुर", en: "Evening crickets" },
  fire: { hi: "चूल्हे की आँच", en: "Crackling stove" },
  bells: { hi: "पूजा की घंटी", en: "Puja bells" },
};

function noiseBuffer(ctx: AudioContext, seconds = 2, brown = false) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return buf;
}

class Engine {
  ctx: AudioContext;
  master: GainNode;
  layers: Partial<Record<Layer, GainNode>> = {};
  timers: number[] = [];
  constructor() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.build();
  }
  private gain(layer: Layer) {
    const g = this.ctx.createGain();
    g.gain.value = 0;
    g.connect(this.master);
    this.layers[layer] = g;
    return g;
  }
  private build() {
    const c = this.ctx;
    // River: looping brown noise through a lowpass with slow swell
    const river = this.gain("river");
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 4, true);
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 700;
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    lfo.frequency.value = 0.12;
    lfoG.gain.value = 250;
    lfo.connect(lfoG).connect(lp.frequency);
    src.connect(lp).connect(river);
    src.start();
    lfo.start();
    // Fire: crackles = short filtered noise bursts
    const fire = this.gain("fire");
    const fireNoise = c.createBufferSource();
    fireNoise.buffer = noiseBuffer(c, 2);
    fireNoise.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2500;
    const crackle = c.createGain();
    crackle.gain.value = 0;
    fireNoise.connect(bp).connect(crackle).connect(fire);
    fireNoise.start();
    this.timers.push(
      window.setInterval(() => {
        const t = c.currentTime;
        crackle.gain.cancelScheduledValues(t);
        crackle.gain.setValueAtTime(0.6 * Math.random(), t);
        crackle.gain.exponentialRampToValueAtTime(0.001, t + 0.04 + Math.random() * 0.05);
      }, 90),
    );
    // Birds: random chirps
    const birds = this.gain("birds");
    this.timers.push(
      window.setInterval(() => {
        if (Math.random() < 0.55) return;
        const t = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        const f = 2200 + Math.random() * 2200;
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * (0.7 + Math.random() * 0.6), t + 0.12);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        o.connect(g).connect(birds);
        o.start(t);
        o.stop(t + 0.2);
      }, 260),
    );
    // Crickets: amplitude-modulated high tone
    const crickets = this.gain("crickets");
    const co = c.createOscillator();
    co.frequency.value = 4400;
    const am = c.createGain();
    am.gain.value = 0;
    const amO = c.createOscillator();
    amO.type = "square";
    amO.frequency.value = 28;
    const amG = c.createGain();
    amG.gain.value = 0.03;
    amO.connect(amG).connect(am.gain);
    co.connect(am).connect(crickets);
    co.start();
    amO.start();
    // Bells: inharmonic partials, occasional strike
    const bells = this.gain("bells");
    this.timers.push(
      window.setInterval(() => {
        if (Math.random() < 0.6) return;
        const t = c.currentTime;
        [1, 2.76, 5.4].forEach((m, i) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.frequency.value = 740 * m;
          g.gain.setValueAtTime(0.18 / (i + 1), t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 / (i + 1));
          o.connect(g).connect(bells);
          o.start(t);
          o.stop(t + 2.5);
        });
      }, 4200),
    );
  }
  setMix(mix: Partial<Record<Layer, number>>, volume: number) {
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(volume * 0.6, t, 0.3);
    (Object.keys(this.layers) as Layer[]).forEach((k) => this.layers[k]!.gain.setTargetAtTime(mix[k] ?? 0, t, 0.8));
  }
  async resume() {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }
  suspend() {
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    window.setTimeout(() => this.ctx.suspend(), 300);
  }
}

function mixFor(pathname: string, sceneIdx: number): Partial<Record<Layer, number>> {
  const m = pathname.match(/\/day\/([^/]+)/);
  if (!m) return pathname === "/" || pathname === "" ? { river: 0.6, birds: 0.5 } : { river: 0.35, birds: 0.2 };
  const day = daysBySlug[m[1]];
  const sc = day?.scenes[Math.min(sceneIdx, (day?.scenes.length ?? 1) - 1)];
  if (!sc) return { river: 0.3 };
  const h = sc.stage.timeOfDay;
  const night = h < 5.5 || h > 17.8;
  const mix: Partial<Record<Layer, number>> = {};
  if (sc.stage.environment === "ghat") mix.river = 0.7;
  else mix.river = 0.0;
  if (h >= 5 && h < 9) mix.birds = 0.5;
  if (night || (h > 17 && h <= 20)) mix.crickets = 0.25;
  if (["cook", "kharna-cook", "arrange-soop"].includes(sc.stage.animation)) mix.fire = 0.5;
  if (["evening-puja", "arghya", "usha-arghya", "prasad-receive"].includes(sc.stage.animation)) mix.bells = 0.5;
  if (!night && sc.stage.environment === "courtyard" && !mix.birds) mix.birds = 0.2;
  return mix;
}

export function AudioToggle() {
  const on = usePrefs((s) => s.audioOn);
  const setOn = usePrefs((s) => s.setAudioOn);
  const volume = usePrefs((s) => s.volume);
  const scene = useExperience((s) => s.activeScene);
  const pathname = usePathname() ?? "/";
  const { t, lang } = useT();
  const engine = useRef<Engine | null>(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    if (!on) {
      e.suspend();
      setCaption("");
      return;
    }
    const mix = mixFor(pathname, scene);
    e.resume().then(() => e.setMix(mix, volume));
    const active = (Object.keys(mix) as Layer[]).filter((k) => (mix[k] ?? 0) > 0);
    setCaption(active.map((k) => CAPTIONS[k][lang]).join(", "));
  }, [on, volume, scene, pathname, lang]);

  useEffect(() => () => engine.current?.timers.forEach((id) => window.clearInterval(id)), []);

  return (
    <>
      <button
        type="button"
        className="btn-icon text-cream"
        aria-pressed={on}
        aria-label={on ? t("audioOff") : t("audioOn")}
        title={t("audioNote")}
        onClick={() => {
          if (!engine.current) engine.current = new Engine();
          setOn(!on);
        }}
      >
        {on ? <Volume2 aria-hidden="true" className="h-5 w-5" /> : <VolumeX aria-hidden="true" className="h-5 w-5" />}
      </button>
      <p className="sr-only" aria-live="polite">
        {caption ? `${t("nowPlaying")}: ${caption}` : ""}
      </p>
      {on && caption && (
        <p className="pointer-events-none fixed bottom-3 left-3 z-[60] max-w-[70vw] rounded-full bg-night/80 px-3 py-1 text-xs text-cream" aria-hidden="true">
          ♪ {caption}
        </p>
      )}
    </>
  );
}
