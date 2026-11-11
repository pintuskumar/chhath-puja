"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { skyAt } from "@/lib/sky";
import { glowTexture } from "./textures";
import { useDirector } from "./Director";

/** Direction to the sun for a given hour; the sun always sits across the river (−z). */
export function sunDirection(hour: number, out = new THREE.Vector3()) {
  const s = skyAt(hour);
  const e = THREE.MathUtils.degToRad(s.elevation);
  const az = s.azimuth * 0.5;
  return out.set(Math.sin(az) * Math.cos(e), Math.sin(e), -Math.cos(az) * Math.cos(e)).normalize();
}

const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;
const skyFrag = /* glsl */ `
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSunDir; uniform vec3 uSunColor;
uniform float uNight;
varying vec3 vDir;
float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uTop, pow(smoothstep(-0.02, 0.65, h), 0.7));
  col = mix(col, uHorizon * 0.55, smoothstep(0.0, -0.25, h));
  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunColor * (pow(sd, 6.0) * 0.45 + pow(sd, 60.0) * 0.6);
  // sparse stars before dawn / after dusk
  vec3 cell = floor(d * 220.0);
  float star = step(0.9975, hash(cell)) * smoothstep(0.05, 0.4, h) * uNight;
  col += vec3(star);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function Atmosphere({ shadows = false }: { shadows?: boolean }) {
  const director = useDirector();
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const disc = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Sprite>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color() },
          uHorizon: { value: new THREE.Color() },
          uSunDir: { value: new THREE.Vector3(0, 0.1, -1) },
          uSunColor: { value: new THREE.Color() },
          uNight: { value: 0 },
        },
      }),
    [],
  );
  const discMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd27a", fog: false, toneMapped: false }), []);
  const glowMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: "#ffb347",
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  const fog = useMemo(() => new THREE.FogExp2("#101D38", 0.02), []);

  useFrame(({ camera }) => {
    const h = director.current.hour;
    const s = skyAt(h);
    sunDirection(h, dir);
    scene.fog = fog;
    fog.color.set(s.fog);
    fog.density = s.fogDensity;

    const u = skyMat.uniforms;
    (u.uTop.value as THREE.Color).set(s.top);
    (u.uHorizon.value as THREE.Color).set(s.horizon);
    (u.uSunColor.value as THREE.Color).set(s.sunColor).multiplyScalar(s.elevation > -6 ? 1 : 0.2);
    (u.uSunDir.value as THREE.Vector3).copy(dir);
    u.uNight.value = s.lampGlow;

    if (sun.current) {
      const up = s.elevation > 0;
      sun.current.position.copy(dir).multiplyScalar(40).add(camera.position.clone().setY(0));
      sun.current.target.position.copy(camera.position).setY(0);
      sun.current.target.updateMatrixWorld();
      sun.current.color.set(up ? s.sunColor : "#7f8fc4");
      sun.current.intensity = up ? s.sunIntensity : 0.25;
    }
    if (hemi.current) {
      hemi.current.color.set(s.top);
      hemi.current.groundColor.set(tmp.set("#5a3d28").lerp(new THREE.Color(s.horizon), 0.2));
      hemi.current.intensity = s.ambient * 1.4;
    }
    if (amb.current) amb.current.intensity = s.ambient * 0.5;

    const visible = s.elevation > -4;
    if (disc.current) {
      disc.current.visible = visible;
      disc.current.position.copy(dir).multiplyScalar(300).add(camera.position);
      discMat.color.set(s.sunColor);
    }
    if (glow.current) {
      glow.current.visible = visible;
      glow.current.position.copy(dir).multiplyScalar(290).add(camera.position);
      glowMat.color.set(s.sunColor);
      const g = 70 + (1 - Math.min(1, Math.max(0, s.elevation / 20))) * 60;
      glow.current.scale.set(g, g, g);
    }
  }, -1);

  return (
    <>
      <mesh material={skyMat} frustumCulled={false} renderOrder={-10}>
        <sphereGeometry args={[500, 32, 16]} />
      </mesh>
      <mesh ref={disc} material={discMat} renderOrder={-9}>
        <sphereGeometry args={[7, 20, 12]} />
      </mesh>
      <sprite ref={glow} material={glowMat} renderOrder={-8} />
      <hemisphereLight ref={hemi} />
      <ambientLight ref={amb} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />
    </>
  );
}
