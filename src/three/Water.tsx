"use client";

/**
 * Stylised river: one draw call. Gentle vertex swell, procedural normals,
 * a sun-glitter path, sky fresnel, diya shimmer near the bank, and expanding
 * ripples around devotees standing in the water. Reflections are stylised
 * (sky/sun only) — real planar reflections were rejected for mobile cost.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { skyAt } from "@/lib/sky";
import { sunDirection } from "./Atmosphere";
import { useDirector } from "./Director";
import { GHAT } from "./choreography";

const vert = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  w.y += sin(w.x * 0.35 + uTime * 0.6) * 0.03 + sin(w.z * 0.5 - uTime * 0.9) * 0.025;
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
uniform float uTime; uniform vec3 uWater; uniform vec3 uSky; uniform vec3 uSun; uniform vec3 uSunDir;
uniform float uSunStrength; uniform float uLamp; uniform vec3 uFogColor; uniform float uFogDensity;
uniform vec4 uRipples[6];
varying vec3 vWorld;

vec2 waveGrad(vec2 p, float t) {
  vec2 g = vec2(0.0);
  g += vec2(0.35, 0.0) * cos(p.x * 0.35 + t * 0.6) * 0.03;
  g += vec2(0.0, -0.5) * cos(p.y * 0.5 - t * 0.9) * 0.025;
  g += vec2(1.7, 1.1) * cos(dot(p, vec2(1.7, 1.1)) + t * 1.6) * 0.018;
  g += vec2(-2.9, 2.3) * cos(dot(p, vec2(-2.9, 2.3)) - t * 2.1) * 0.010;
  g += vec2(5.3, -4.1) * cos(dot(p, vec2(5.3, -4.1)) + t * 2.9) * 0.005;
  return g;
}

void main() {
  vec2 p = vWorld.xz;
  vec2 g = waveGrad(p, uTime);
  for (int i = 0; i < 6; i++) {
    vec4 r = uRipples[i];
    if (r.z <= 0.0) continue;
    vec2 d = p - r.xy;
    float dist = length(d) + 1e-4;
    float ring = sin(dist * 14.0 - uTime * 3.2) * exp(-dist * 1.4) * r.z;
    g += (d / dist) * ring * 0.18;
  }
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 col = mix(uWater, uSky, 0.18 + 0.62 * fres);
  vec3 r = reflect(-v, n);
  float sd = max(dot(r, uSunDir), 0.0);
  col += uSun * (pow(sd, 220.0) * 6.0 + pow(sd, 18.0) * 0.45) * uSunStrength;
  // warm shimmer of lamps near the ghat at dusk/dawn
  float bank = smoothstep(-6.0, 0.5, vWorld.z);
  col += vec3(1.0, 0.58, 0.2) * uLamp * bank * 0.22 * (0.55 + 0.45 * sin(vWorld.x * 6.0 + uTime * 1.7 + sin(vWorld.z * 9.0)));
  float dist = length(cameraPosition - vWorld);
  float fogF = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, uFogColor, clamp(fogF, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function Water({ segments = 48 }: { segments?: number }) {
  const director = useDirector();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTime: { value: 0 },
          uWater: { value: new THREE.Color() },
          uSky: { value: new THREE.Color() },
          uSun: { value: new THREE.Color() },
          uSunDir: { value: new THREE.Vector3() },
          uSunStrength: { value: 1 },
          uLamp: { value: 0 },
          uFogColor: { value: new THREE.Color() },
          uFogDensity: { value: 0.02 },
          uRipples: { value: Array.from({ length: 6 }, () => new THREE.Vector4(0, 0, 0, 0)) },
        },
      }),
    [],
  );

  useFrame(() => {
    const d = director.current;
    const s = skyAt(d.hour);
    const u = material.uniforms;
    u.uTime.value = d.reduced ? 0 : d.t;
    (u.uWater.value as THREE.Color).set(s.water);
    (u.uSky.value as THREE.Color).set(s.horizon);
    (u.uSun.value as THREE.Color).set(s.sunColor);
    sunDirection(d.hour, u.uSunDir.value as THREE.Vector3);
    u.uSunStrength.value = Math.max(0.05, Math.min(1.4, (s.elevation + 6) / 10));
    u.uLamp.value = s.lampGlow;
    (u.uFogColor.value as THREE.Color).set(s.fog);
    u.uFogDensity.value = s.fogDensity;
    // ripples around actors standing in water
    const rip = u.uRipples.value as THREE.Vector4[];
    let i = 0;
    for (const a of Object.values(d.actors)) {
      if (i >= 6) break;
      if (a.pos[1] <= GHAT.waterStandY + 0.2) rip[i++].set(a.pos[0], a.pos[2], 1, 0);
    }
    for (; i < 6; i++) rip[i].set(0, 0, 0, 0);
  });

  return (
    <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -99]}>
      <planeGeometry args={[420, 200, segments, Math.max(4, Math.round(segments / 2))]} />
    </mesh>
  );
}
