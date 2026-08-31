// Emits Main.dc.html (hero artboard) with the particle brain baked as SVG,
// generated from the same profile polygon as assets/js/constellation.js.
import { writeFileSync } from 'node:fs';

const PROFILE = [
  [-0.78, 0.10], [-0.74, 0.38], [-0.58, 0.60], [-0.30, 0.76],
  [0.02, 0.82], [0.34, 0.74], [0.60, 0.56], [0.76, 0.30],
  [0.82, 0.02], [0.76, -0.22], [0.62, -0.34],
  [0.56, -0.30], [0.66, -0.44], [0.60, -0.64], [0.40, -0.72],
  [0.22, -0.64],
  [0.18, -0.70], [0.24, -0.96], [0.06, -0.98], [0.06, -0.66],
  [-0.10, -0.58], [-0.44, -0.50], [-0.66, -0.32], [-0.76, -0.12]
];
const PALETTE = [
  ['#8052ff', 0.42], ['#9d7bff', 0.12], ['#4f7dff', 0.13],
  ['#1fbf9e', 0.12], ['#e14fff', 0.09], ['#ffb829', 0.12]
];
let seed = 42;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = () => { let r = rnd(); for (const [c, w] of PALETTE) { r -= w; if (r <= 0) return c; } return PALETTE[0][0]; };
const inPoly = (x, y) => {
  let inside = false;
  for (let i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
    const [xi, yi] = PROFILE[i], [xj, yj] = PROFILE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const edgeDist = (x, y) => {
  let d = Infinity;
  for (let i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
    const [x1, y1] = PROFILE[j], [x2, y2] = PROFILE[i];
    const dx = x2 - x1, dy = y2 - y1;
    let t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t * dx - x, py = y1 + t * dy - y;
    d = Math.min(d, Math.hypot(px, py));
  }
  return d;
};

const tris = [];
let n = 0, guard = 0;
while (n < 650 && guard++ < 60000) {
  const x = -0.85 + rnd() * 1.75, y = -1.0 + rnd() * 1.9;
  if (!inPoly(x, y)) continue;
  const e = Math.exp(-edgeDist(x, y) / 0.07);
  const band = Math.abs(Math.sin(5.2 * x + 2.6 * y) * Math.sin(3.8 * y - 1.7 * x + 1.3));
  if (rnd() > 0.16 + 0.72 * e + 0.3 * band * (1 - e)) continue;
  const cx = 330 + x * 315, cy = 330 - y * 300;
  const s = (1.5 + rnd() * 2.2) * (0.85 + 0.4 * e);
  const a = rnd() * Math.PI * 2;
  const op = (0.35 + 0.6 * e).toFixed(2);
  const pts = [0, 1, 2].map(k => {
    const t = a + (k * Math.PI * 2) / 3;
    return `${(cx + Math.cos(t) * s).toFixed(1)},${(cy + Math.sin(t) * s).toFixed(1)}`;
  }).join(' ');
  tris.push(`<polygon points="${pts}" fill="none" stroke="${pick()}" stroke-width="1.1" opacity="${op}"/>`);
  n++;
}
const svg = `<svg viewBox="0 0 660 660" width="620" height="620" role="img" aria-label="Particle brain">${tris.join('')}</svg>`;

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"><\/script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600&display=swap">
  <style>
    body { margin: 0; background: #000000; font-family: 'Inter', system-ui, sans-serif; }
    a { color: #ffffff; text-decoration: none; } a:hover { color: #ffb829; }
  </style>
</helmet>
<div style="width: 1440px; height: 900px; background: #000000; display: flex; flex-direction: column; overflow: hidden;">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 24px 60px;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <svg width="26" height="26" viewBox="0 0 32 32"><path d="M15 3.5 L24.5 20 L5.5 20 Z" fill="none" stroke="#8052ff" stroke-width="2" stroke-linejoin="round"></path><path d="M23 23 L27.5 29.5 L18.5 29.5 Z" fill="none" stroke="#8052ff" stroke-width="1.6" stroke-linejoin="round"></path><path d="M9.5 23.5 L12.5 28 L6.5 28 Z" fill="#8052ff"></path></svg>
      <span style="font-size: 18px; font-weight: 600; color: #ffffff;">Cluster</span>
    </div>
    <div style="display: flex; align-items: center; gap: 36px;">
      <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase; color: #9a9a9a;">Manifesto</span>
      <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase; color: #9a9a9a;">Platform</span>
      <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase; color: #9a9a9a;">Contact</span>
    </div>
    <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase; color: #ffffff;">Get access</span>
  </div>
  <div style="flex: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px; align-items: center; padding: 0 60px;">
    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 30px;">
      <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase; color: #ffb829;">Introducing Cluster</span>
      <h1 style="margin: 0; font-size: 113px; font-weight: 400; line-height: 1.05; letter-spacing: -0.045em; color: #ffffff;">Unlock your second brain.</h1>
      <p style="margin: 0; font-size: 18px; font-weight: 200; line-height: 1.6; color: #ffffff; max-width: 520px;">Stop hunting for answers. Start using them. Cluster connects to every system your business runs on and turns scattered knowledge into instant, confident answers.</p>
      <span style="display: inline-flex; align-items: center; background: #8052ff; color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase; border-radius: 9999px; padding: 15px 26px; line-height: 1;">Request early access</span>
    </div>
    <div style="display: flex; align-items: center; justify-content: center;">${svg}</div>
  </div>
</div>
</x-dc>
</body>
</html>
`;
writeFileSync(new URL('./Main.dc.html', import.meta.url), html);
console.log('Main.dc.html written,', tris.length, 'triangles');
