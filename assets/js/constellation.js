/* Cluster AI — the second brain, rendered.
   A dense triangular lattice tiling a 3D brain shell, colored in flowing
   organic patches, with dim back-faces showing through the interior, a
   stippled brainstem, soft bloom, slow yaw rotation, and large wireframe
   tetrahedra drifting in the page background. Entirely procedural. */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------------- deterministic noise ---------------- */

  function hash3(ix, iy, iz) {
    var h = (ix * 374761393 + iy * 668265263 + iz * 2147483647) | 0;
    h = (h ^ (h >> 13)) | 0;
    h = (h * 1274126177) | 0;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function noise3(x, y, z) {
    var ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    var fx = smooth(x - ix), fy = smooth(y - iy), fz = smooth(z - iz);
    var v = 0;
    for (var dz = 0; dz <= 1; dz++)
      for (var dy = 0; dy <= 1; dy++)
        for (var dx = 0; dx <= 1; dx++) {
          v += hash3(ix + dx, iy + dy, iz + dz) *
            (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy) * (dz ? fz : 1 - fz);
        }
    return v;
  }

  /* ---------------- palette: organic patches ---------------- */
  /* family per particle from low-frequency noise over object space, so
     colors form regions that rotate with the brain — amber floods the
     lower rim like the reference. */

  var FAMILIES = [
    ['#ffb829', '#ffd166', '#ffc94d', '#f5a623'],          /* amber */
    ['#8052ff', '#9d7bff', '#6a3df0'],          /* violet */
    ['#f4f1ff', '#cfc8e8', '#ffffff'],          /* white/silver */
    ['#1fbf9e', '#2ad4b0'],                     /* teal */
    ['#e14fff', '#c73aec'],                     /* magenta */
    ['#4f7dff', '#6f95ff']                      /* blue */
  ];

  function familyFor(px, py, pz) {
    var v = noise3(px * 2.0 + 7.3, py * 2.0 + 3.1, pz * 2.0 + 11.7);
    /* pull the lower rim toward amber, like the reference's glowing base */
    v -= Math.max(0, -py - 0.1) * 0.85;
    /* mottle: some particles defect to a neighbor patch's family */
    if (Math.random() < 0.22) v = Math.random();
    if (v < 0.20) return 0;
    if (v < 0.45) return 1;
    if (v < 0.72) return 2;
    if (v < 0.82) return 3;
    if (v < 0.91) return 4;
    return 5;
  }

  /* ---------------- brain lattice ---------------- */
  /* Object space: +x toward the face (screen-left at rest via mirror),
     +y up, z depth. Points sit on a deformed sphere in lat-band rows so
     the triangles read as a tiled surface, not a scatter. */

  function shapeCerebrum(dir) {
    var w = 1 + 0.05 * (noise3(dir[0] * 3.6 + 5, dir[1] * 3.6 + 5, dir[2] * 3.6 + 5) - 0.5) * 2;
    var x = dir[0] * 1.30 * w;
    var y = dir[1] * 1.00 * w;
    var z = dir[2] * 1.04 * w;
    /* longitudinal fissure: shallow crease along the crown */
    if (dir[1] > 0.35) y -= Math.max(0, 0.09 - Math.abs(dir[2]) * 0.5) * dir[1];
    /* flatten the underside; the temporal region sits low and level */
    if (y < -0.40) y = -0.40 + (y + 0.40) * 0.45;
    /* taper the back-bottom so the cerebellum tucks under */
    if (dir[0] < -0.3 && y < -0.1) x *= 0.94;
    return [x, y, z];
  }

  function buildBrain() {
    var pts = [];
    var lat, lon, i;

    /* cerebrum shell */
    var latBands = 74;
    for (i = 0; i <= latBands; i++) {
      lat = (-0.47 + (i / latBands) * 0.97) * Math.PI; /* -85°..+90° */
      var ringR = Math.cos(lat);
      var lonCount = Math.max(6, Math.round(ringR * 152));
      for (var j = 0; j < lonCount; j++) {
        lon = (j / lonCount) * Math.PI * 2 + (i % 2) * (Math.PI / lonCount);
        var dir = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
        var p = shapeCerebrum(dir);
        pts.push(makeSurfacePoint(p, dir, i + j, 1));
      }
    }

    /* cerebellum: finer, denser lobe tucked at the back-bottom */
    var cbC = [-0.60, -0.60, 0];
    var cbR = [0.42, 0.27, 0.34];
    var cbBands = 26;
    for (i = 0; i <= cbBands; i++) {
      lat = (-0.5 + i / cbBands) * Math.PI;
      var rr = Math.cos(lat);
      var cnt = Math.max(4, Math.round(rr * 46));
      for (var k = 0; k < cnt; k++) {
        lon = (k / cnt) * Math.PI * 2 + (i % 2) * (Math.PI / cnt);
        var d2 = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
        var w2 = 1 + 0.06 * (noise3(d2[0] * 5 + 9, d2[1] * 5, d2[2] * 5) - 0.5) * 2;
        var p2 = [
          cbC[0] + d2[0] * cbR[0] * w2,
          cbC[1] + d2[1] * cbR[1] * w2,
          cbC[2] + d2[2] * cbR[2] * w2
        ];
        var sp = makeSurfacePoint(p2, d2, i + k, 0.68);
        sp.cbl = true;
        pts.push(sp);
      }
    }

    return pts;
  }

  function makeSurfacePoint(p, n, parity, sizeMul) {
    var fam = familyFor(p[0], p[1], p[2]);
    var shades = FAMILIES[fam];
    return {
      x: p[0], y: p[1], z: p[2],
      nx: n[0], ny: n[1], nz: n[2],
      fam: fam,
      keep: Math.random() < 0.18, /* which back-faces stay visible */
      color: shades[(Math.random() * shades.length) | 0],
      bright: 0.45 + 0.55 * noise3(p[0] * 2.3 + 31, p[1] * 2.3, p[2] * 2.3),
      up: parity % 2 === 0,
      jit: (Math.random() - 0.5) * 0.3,
      size: (0.85 + Math.random() * 0.4) * sizeMul,
      tw: 0.3 + Math.random() * 0.9,
      ph: Math.random() * Math.PI * 2
    };
  }

  function buildStem() {
    var dots = [];
    for (var i = 0; i < 18; i++) {
      var t = i / 15;
      var cx = 0.02 + t * 0.1;
      var cy = -0.52 - t * 0.52;
      var r = 0.075 * (1 - t * 0.4);
      var cnt = Math.max(5, Math.round(14 * (1 - t * 0.25)));
      for (var k = 0; k < cnt; k++) {
        var a = (k / cnt) * Math.PI * 2 + i;
        dots.push({
          x: cx + Math.cos(a) * r * (0.85 + Math.random() * 0.3),
          y: cy + (Math.random() - 0.5) * 0.02,
          z: Math.sin(a) * r * (0.85 + Math.random() * 0.3),
          color: Math.random() < 0.55 ? '#ffb829' : (Math.random() < 0.5 ? '#f4f1ff' : '#9d7bff'),
          bright: 0.4 + Math.random() * 0.5,
          tw: 0.4 + Math.random() * 0.8,
          ph: Math.random() * Math.PI * 2
        });
      }
    }
    return dots;
  }

  /* ---------------- hero renderer ---------------- */

  function initConstellation() {
    if (window.__brainClaimed) return; /* the WebGL artwork renderer owns it */
    var canvas = document.getElementById('constellation');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var glow = document.createElement('canvas');
    var gtx = glow.getContext('2d');
    var points = buildBrain();
    var stem = buildStem();
    var w = 0, h = 0, gw = 0, gh = 0;
    var running = true;

    /* the scroll choreography's puppet strings: viewport-fraction position,
       scale, alpha, and extra rotation — tweened by GSAP in main.js */
    var POSE = window.__brainPose = { x: 0.72, y: 0.5, s: 1, a: 1, r: 0 };

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      gw = Math.max(1, Math.round(w / 4));
      gh = Math.max(1, Math.round(h / 4));
      glow.width = gw;
      glow.height = gh;
    }

    /* triangle path helpers: alternating up/down tiles */
    function tri(path, x, y, s, up, rot) {
      var base = up ? -Math.PI / 2 : Math.PI / 2;
      for (var k = 0; k < 3; k++) {
        var a = base + rot + (k * Math.PI * 2) / 3;
        var px = x + Math.cos(a) * s;
        var py = y + Math.sin(a) * s;
        if (k === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      }
      path.closePath();
    }

    var ALPHA_STEPS = 7;

    function render(tms) {
      var t = tms * 0.001;
      ctx.clearRect(0, 0, w, h);
      gtx.clearRect(0, 0, gw, gh);

      var yaw = -0.55 + POSE.r + (REDUCED ? 0 : t * 0.1);
      var pitch = 0.05;
      var cy = Math.cos(yaw), sy = Math.sin(yaw);
      var cp = Math.cos(pitch), sp = Math.sin(pitch);
      var scale = Math.min(w * 0.17, h * 0.34) * POSE.s;
      var cxp = w * POSE.x, cyp = h * POSE.y;
      var f = 3.4;

      /* stroke buckets: [famColor][alphaStep] -> Path2D; glow per family */
      var buckets = {};
      var glowPaths = {};

      function plot(p, isDot) {
        var x1 = p.x * cy + p.z * sy;
        var z1 = -p.x * sy + p.z * cy;
        var y1 = p.y * cp - z1 * sp;
        var z2 = p.y * sp + z1 * cp;

        var persp = f / (f + z2);
        /* mirrored: the face points screen-left, as in the reference */
        var sxp = cxp - x1 * scale * persp;
        var syp = cyp - y1 * scale * persp;

        var facing, rim;
        if (isDot) { facing = 0.6; rim = 0; }
        else {
          var nz1 = -p.nx * sy + p.nz * cy;
          var nzr = p.ny * sp + nz1 * cp;
          facing = -nzr; /* toward camera */
          rim = Math.pow(1 - Math.min(1, Math.abs(facing)), 2);
        }

        var twk = REDUCED ? 0.85 : 0.75 + 0.25 * Math.sin(t * p.tw + p.ph);
        var a;
        if (facing >= 0) a = (0.45 + 0.55 * p.bright) * (0.55 + 0.45 * facing) * twk;
        else {
          /* interior stays dark: only a sparse subset of the far side
             shows through, dimly */
          if (!p.keep) return;
          a = 0.07 * p.bright * twk + 0.015;
        }
        a += rim * 0.45;
        a = Math.max(0.03, Math.min(1, a)) * POSE.a;
        if (a < 0.01) return;

        var s = (isDot ? 1.7 : (0.0085 * scale + 1.05) * p.size) * persp * (1 + rim * 0.3);

        var step = Math.min(ALPHA_STEPS - 1, Math.floor(a * ALPHA_STEPS));
        var key = p.color + step;
        var path = buckets[key];
        if (!path) { path = buckets[key] = { p: new Path2D(), c: p.color, a: (step + 0.5) / ALPHA_STEPS }; }
        if (isDot) {
          path.p.moveTo(sxp + s, syp);
          path.p.arc(sxp, syp, s, 0, Math.PI * 2);
        } else {
          tri(path.p, sxp, syp, s, p.up, p.jit);
        }

        /* bloom: bright, camera-facing particles feed the glow layer */
        if (a > 0.52) {
          var gp = glowPaths[p.color];
          if (!gp) gp = glowPaths[p.color] = new Path2D();
          gp.rect(sxp / 4 - 1.3, syp / 4 - 1.3, 2.6, 2.6);
        }
      }

      for (var i = 0; i < points.length; i++) plot(points[i], false);
      for (var j = 0; j < stem.length; j++) plot(stem[j], true);

      /* glow pass under everything */
      gtx.globalAlpha = 0.85;
      for (var gk in glowPaths) {
        gtx.fillStyle = gk;
        gtx.fill(glowPaths[gk]);
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.36 * POSE.a;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(glow, 0, 0, gw, gh, -6, -6, w + 12, h + 12);
      ctx.restore();

      /* sharp lattice */
      ctx.lineWidth = 1;
      for (var bk in buckets) {
        var b = buckets[bk];
        ctx.globalAlpha = b.a;
        ctx.strokeStyle = b.c;
        ctx.stroke(b.p);
        if (b.a > 0.75) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = b.c;
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop(tms) {
      if (running) render(tms);
      if (!REDUCED) requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', function () {
      resize();
      if (REDUCED) render(4000);
    });

    if ('IntersectionObserver' in window && !REDUCED) {
      new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
      }).observe(canvas);
    }

    if (REDUCED) render(4000);
    else requestAnimationFrame(loop);
  }

  /* ---------------- ambient field: wireframe tetrahedra ---------------- */

  var TETRA = [
    [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]]
  ][0];
  var TETRA_EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

  function initAmbient() {
    var canvas = document.getElementById('ambient');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var N = 22;
    var parts = [];
    var w = 0, h = 0;
    var COLORS = ['#8052ff', '#9d7bff', '#ffb829', '#1fbf9e', '#e14fff', '#f4f1ff'];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    for (var i = 0; i < N; i++) {
      parts.push({
        x: Math.random(),
        y: Math.random(),
        vy: 0.004 + Math.random() * 0.008,
        size: 6 + Math.pow(Math.random(), 1.6) * 42,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        sx: (Math.random() - 0.5) * 0.25,
        srot: (Math.random() - 0.5) * 0.3,
        alpha: 0.07 + Math.random() * 0.13,
        flat: Math.random() < 0.4
      });
    }

    function drawTetra(p, t) {
      var rx = p.rx + (REDUCED ? 0 : t * p.srot);
      var ry = p.ry + (REDUCED ? 0 : t * p.srot * 0.7);
      var cx1 = Math.cos(rx), sx1 = Math.sin(rx);
      var cy1 = Math.cos(ry), sy1 = Math.sin(ry);
      var y = (p.y - t * p.vy) % 1;
      if (y < 0) y += 1;
      var px = p.x * w + Math.sin(t * 0.1 + p.ph || 0) * 6;
      var py = y * h;
      var proj = [];
      for (var v = 0; v < 4; v++) {
        var vx = TETRA[v][0], vy2 = TETRA[v][1], vz = TETRA[v][2];
        var x1 = vx * cy1 + vz * sy1;
        var z1 = -vx * sy1 + vz * cy1;
        var y1 = vy2 * cx1 - z1 * sx1;
        proj.push([px + x1 * p.size * 0.5, py + y1 * p.size * 0.5]);
      }
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      if (p.flat) {
        ctx.moveTo(proj[0][0], proj[0][1]);
        ctx.lineTo(proj[1][0], proj[1][1]);
        ctx.lineTo(proj[2][0], proj[2][1]);
        ctx.closePath();
      } else {
        for (var e = 0; e < TETRA_EDGES.length; e++) {
          var ed = TETRA_EDGES[e];
          ctx.moveTo(proj[ed[0]][0], proj[ed[0]][1]);
          ctx.lineTo(proj[ed[1]][0], proj[ed[1]][1]);
        }
      }
      ctx.stroke();
    }

    function render(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.2;
      for (var i = 0; i < parts.length; i++) drawTetra(parts[i], t);
      ctx.globalAlpha = 1;
    }

    function loop(tms) {
      render(tms * 0.001);
      if (!REDUCED) requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', function () {
      resize();
      if (REDUCED) render(10);
    });

    if (REDUCED) render(10);
    else requestAnimationFrame(loop);
  }

  initConstellation();
  initAmbient();
})();
