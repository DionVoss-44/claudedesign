'use client';

/* The second brain, made real — image-to-particles in R3F.
   The approved brand render (public/assets/img/brain-source.png,
   Higgsfield job c2e051ac) is the source of truth: every lit pixel
   becomes a GPU particle on a 3D brain shell. Bloom via pmndrs
   postprocessing; particles assemble from a scattered cloud on load. */

import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { pose } from '../lib/pose';

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* side-profile silhouette matching the artwork's framing — gives each
   sampled pixel its depth on the shell */
const PROFILE = [
  [-0.78, 0.1], [-0.74, 0.38], [-0.58, 0.6], [-0.3, 0.76],
  [0.02, 0.82], [0.34, 0.74], [0.6, 0.56], [0.76, 0.3],
  [0.82, 0.02], [0.76, -0.22], [0.62, -0.34],
  [0.56, -0.3], [0.66, -0.44], [0.6, -0.64], [0.4, -0.72],
  [0.22, -0.64],
  [0.18, -0.7], [0.24, -0.96], [0.06, -0.98], [0.06, -0.66],
  [-0.1, -0.58], [-0.44, -0.5], [-0.66, -0.32], [-0.76, -0.12],
];

function inPoly(x, y) {
  let inside = false;
  for (let i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
    const [xi, yi] = PROFILE[i];
    const [xj, yj] = PROFILE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function edgeDist(x, y) {
  let d = Infinity;
  for (let i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
    const [x1, y1] = PROFILE[j];
    const [x2, y2] = PROFILE[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    let t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    d = Math.min(d, Math.hypot(x1 + t * dx - x, y1 + t * dy - y));
  }
  return d;
}

function sampleImage(image) {
  const N = image.width;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const ctx = c.getContext('2d');
  ctx.drawImage(image, 0, 0, N, N);
  const data = ctx.getImageData(0, 0, N, N).data;

  const pos = [];
  const scatter = [];
  const col = [];
  const size = [];
  const phase = [];
  const bright = [];

  const push = (x, y, z, r, g, b, br) => {
    pos.push(x, y, z);
    /* assemble-from: a loose shell far outside the brain */
    const a1 = Math.random() * Math.PI * 2;
    const a2 = Math.acos(Math.random() * 2 - 1);
    const rr = 2.2 + Math.random() * 1.6;
    scatter.push(
      rr * Math.sin(a2) * Math.cos(a1),
      rr * Math.cos(a2),
      rr * Math.sin(a2) * Math.sin(a1)
    );
    col.push(r, g, b);
    size.push(0.8 + Math.random() * 0.9);
    phase.push(Math.random() * Math.PI * 2);
    bright.push(br);
  };

  for (let v = 0; v < N; v++) {
    for (let u = 0; u < N; u++) {
      const idx = (v * N + u) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r + g + b < 85) continue;
      const x = (u / N - 0.5) * 2.05;
      const y = (0.5 - v / N) * 2.05;
      if (!inPoly(x, y)) continue;
      const d = edgeDist(x, y);
      const zmax = 0.6 * Math.sqrt(Math.min(1, d / 0.32));
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;
      push(x, y, zmax * (0.75 + Math.random() * 0.25), rn, gn, bn, 1);
      if (Math.random() < 0.5) {
        push(x, y, -zmax * (0.75 + Math.random() * 0.25), rn, gn, bn, 0.22);
      }
    }
  }
  return { pos, scatter, col, size, phase, bright, gridStep: 2.05 / N };
}

const vertexShader = /* glsl */ `
  attribute vec3 aScatter;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  attribute float aBright;
  uniform float uSize;
  uniform float uProgress;
  varying vec3 vColor;
  varying float vPhase;
  varying float vBright;
  void main() {
    vColor = aColor; vPhase = aPhase; vBright = aBright;
    /* per-particle stagger on the assembly, seeded by phase */
    float p = clamp(uProgress * 1.35 - vPhase * 0.055, 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    vec3 target = mix(aScatter, position, p);
    vec4 mv = modelViewMatrix * vec4(target, 1.0);
    gl_PointSize = aSize * uSize * (3.4 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vPhase;
  varying float vBright;
  float sdTri(vec2 p) {
    const float k = 1.7320508;
    p.x = abs(p.x) - 0.5; p.y = p.y + 0.5 / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -1.0, 0.0);
    return -length(p) * sign(p.y);
  }
  void main() {
    vec2 p = (gl_PointCoord - 0.5) * 2.4;
    float sd = sdTri(vec2(p.x, -p.y));
    float outline = smoothstep(0.3, 0.04, abs(sd));
    float fill = 0.12 * smoothstep(0.05, -0.5, sd);
    float tw = 0.78 + 0.22 * sin(uTime * (0.6 + vPhase * 0.25) + vPhase * 7.0);
    float a = (outline + fill) * tw * vBright * uAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function Particles({ sampled }) {
  const groupRef = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAlpha: { value: 1 },
      uSize: { value: 3 },
      uProgress: { value: REDUCED ? 1 : 0 },
    }),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(sampled.pos, 3));
    geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(sampled.scatter, 3));
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(sampled.col, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sampled.size, 1));
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(sampled.phase, 1));
    geo.setAttribute('aBright', new THREE.Float32BufferAttribute(sampled.bright, 1));
    return geo;
  }, [sampled]);

  useEffect(() => {
    if (REDUCED) return;
    const tween = gsap.to(uniforms.uProgress, {
      value: 1,
      duration: 2.4,
      ease: 'power3.inOut',
      delay: 0.2,
    });
    return () => tween.kill();
  }, [uniforms]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    const viewH = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z;
    const viewW = viewH * cam.aspect;
    const g = groupRef.current;
    if (!g) return;
    g.position.x = (pose.x - 0.5) * viewW;
    g.position.y = (0.5 - pose.y) * viewH;
    const base = Math.min(viewW * 0.21, viewH * 0.54);
    g.scale.setScalar(base * pose.s);
    g.rotation.y = (REDUCED ? 0.08 : Math.sin(t * 0.14) * 0.2) + pose.r;
    g.rotation.x = 0.04;

    uniforms.uTime.value = t;
    uniforms.uAlpha.value = pose.a;
    const h = state.size.height;
    const dpr = state.viewport.dpr;
    const pxPerWorld = (h / viewH) * dpr;
    uniforms.uSize.value = Math.max(
      2.5,
      g.scale.x * sampled.gridStep * pxPerWorld * 2.3
    );
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function BrainCanvas() {
  const [sampled, setSampled] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/assets/img/brain-source.png';
    img.onload = () => setSampled(sampleImage(img));
  }, []);

  return (
    <div className="brain-layer" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 35, position: [0, 0, 3.4] }}
        frameloop={REDUCED ? 'demand' : 'always'}
      >
        {sampled && <Particles sampled={sampled} />}
        <EffectComposer disableNormalPass>
          <Bloom
            intensity={0.45}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.55}
            mipmapBlur
            radius={0.55}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
