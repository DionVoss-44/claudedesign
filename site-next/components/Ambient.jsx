'use client';

/* Ambient field: large wireframe tetrahedra drifting behind the page,
   ported from the vanilla renderer. */

import { useEffect, useRef } from 'react';

const TETRA = [
  [1, 1, 1],
  [-1, -1, 1],
  [-1, 1, -1],
  [1, -1, -1],
];
const EDGES = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
];
const COLORS = ['#8052ff', '#9d7bff', '#ffb829', '#1fbf9e', '#e14fff', '#f4f1ff'];

export default function Ambient() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;

    const parts = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vy: 0.004 + Math.random() * 0.008,
      size: 6 + Math.pow(Math.random(), 1.6) * 42,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      srot: (Math.random() - 0.5) * 0.3,
      alpha: 0.07 + Math.random() * 0.13,
      flat: Math.random() < 0.4,
    }));

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const draw = (p, t) => {
      const rx = p.rx + (REDUCED ? 0 : t * p.srot);
      const ry = p.ry + (REDUCED ? 0 : t * p.srot * 0.7);
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      let y = (p.y - t * p.vy) % 1;
      if (y < 0) y += 1;
      const px = p.x * w;
      const py = y * h;
      const proj = TETRA.map(([vx, vy2, vz]) => {
        const x1 = vx * cy + vz * sy;
        const z1 = -vx * sy + vz * cy;
        const y1 = vy2 * cx - z1 * sx;
        return [px + x1 * p.size * 0.5, py + y1 * p.size * 0.5];
      });
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      if (p.flat) {
        ctx.moveTo(proj[0][0], proj[0][1]);
        ctx.lineTo(proj[1][0], proj[1][1]);
        ctx.lineTo(proj[2][0], proj[2][1]);
        ctx.closePath();
      } else {
        for (const [a, b] of EDGES) {
          ctx.moveTo(proj[a][0], proj[a][1]);
          ctx.lineTo(proj[b][0], proj[b][1]);
        }
      }
      ctx.stroke();
    };

    const render = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.2;
      for (const p of parts) draw(p, t);
      ctx.globalAlpha = 1;
    };

    const loop = (tms) => {
      render(tms * 0.001);
      if (!REDUCED) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    if (REDUCED) render(10);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas id="ambient" ref={ref} aria-hidden="true" />;
}
