/* Cluster AI — particle constellation.
   Thousands of tiny outlined triangles forming an organic brain shape
   (the "second brain"), plus a sparse ambient field drifting behind the
   page. Entirely procedural: the particle system IS the brand imagery. */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* Palette: violet-dominant with amber, teal, magenta, blue sparks. */
  var PALETTE = [
    { c: '#8052ff', w: 0.42 },
    { c: '#9d7bff', w: 0.12 },
    { c: '#4f7dff', w: 0.13 },
    { c: '#1fbf9e', w: 0.12 },
    { c: '#e14fff', w: 0.09 },
    { c: '#ffb829', w: 0.12 }
  ];

  function pickColor() {
    var r = Math.random();
    for (var i = 0; i < PALETTE.length; i++) {
      r -= PALETTE[i].w;
      if (r <= 0) return PALETTE[i].c;
    }
    return PALETTE[0].c;
  }

  /* ---------------- brain point cloud ---------------- */

  /* Side-profile brain silhouette, facing left (toward the copy).
     Normalized coordinates, y up. The particle cloud is sampled inside
     this polygon so the outline — frontal lobe, crown, occipital curve,
     cerebellum tuck, brainstem — reads unmistakably at a glance. */
  var BRAIN_PROFILE = [
    [-0.78, 0.10], [-0.74, 0.38], [-0.58, 0.60], [-0.30, 0.76],
    [0.02, 0.82], [0.34, 0.74], [0.60, 0.56], [0.76, 0.30],
    [0.82, 0.02], [0.76, -0.22], [0.62, -0.34],
    /* cerebellum notch + lobe */
    [0.56, -0.30], [0.66, -0.44], [0.60, -0.64], [0.40, -0.72],
    [0.22, -0.64],
    /* brainstem */
    [0.18, -0.70], [0.24, -0.96], [0.06, -0.98], [0.06, -0.66],
    /* temporal underside back to the forehead */
    [-0.10, -0.58], [-0.44, -0.50], [-0.66, -0.32], [-0.76, -0.12]
  ];

  function pointInPolygon(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1];
      var xj = poly[j][0], yj = poly[j][1];
      if (yi > y !== yj > y &&
          x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  function distToPolygon(x, y, poly) {
    var d = Infinity;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var x1 = poly[j][0], y1 = poly[j][1];
      var x2 = poly[i][0], y2 = poly[i][1];
      var dx = x2 - x1, dy = y2 - y1;
      var t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
      t = Math.max(0, Math.min(1, t));
      var px = x1 + t * dx - x, py = y1 + t * dy - y;
      var dist = Math.sqrt(px * px + py * py);
      if (dist < d) d = dist;
    }
    return d;
  }

  function brainPoints(n) {
    var pts = [];
    var count = 0;
    var guard = 0;
    while (count < n && guard < n * 60) {
      guard++;
      var x = -0.85 + Math.random() * 1.75;
      var y = -1.0 + Math.random() * 1.9;
      if (!pointInPolygon(x, y, BRAIN_PROFILE)) continue;

      var edgeDist = distToPolygon(x, y, BRAIN_PROFILE);
      var edge = Math.exp(-edgeDist / 0.07); /* 1 at the rim, 0 deep inside */

      /* density: strong shell bias + gyri-like interior fold bands */
      var band = Math.abs(
        Math.sin(5.2 * x + 2.6 * y) * Math.sin(3.8 * y - 1.7 * x + 1.3)
      );
      var keep = 0.16 + 0.72 * edge + 0.3 * band * (1 - edge);
      if (Math.random() > keep) continue;

      /* shallow depth so a gentle sway reads as volume, not a sphere */
      var interior = Math.min(1, edgeDist / 0.18);
      var z = (Math.random() * 2 - 1) * 0.26 * (0.35 + 0.65 * interior);

      pts.push({
        x: x, y: y, z: z,
        edge: edge,
        color: pickColor(),
        size: 1.4 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.15 + Math.random() * 0.45,
        spin: (Math.random() - 0.5) * 0.35,
        angle: Math.random() * Math.PI * 2
      });
      count++;
    }
    return pts;
  }

  function drawTriangle(ctx, x, y, size, angle, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (var k = 0; k < 3; k++) {
      var a = angle + (k * Math.PI * 2) / 3;
      var px = x + Math.cos(a) * size;
      var py = y + Math.sin(a) * size;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  /* ---------------- hero constellation ---------------- */

  function initConstellation() {
    var canvas = document.getElementById('constellation');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var points = brainPoints(2300);
    var w = 0;
    var h = 0;
    var running = true;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function render(tms) {
      var t = tms * 0.001;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.1;

      /* gentle sway, never a full rotation — the profile stays legible */
      var rotY = REDUCED ? 0.12 : 0.2 * Math.sin(t * 0.16);
      var rotX = 0.04 + (REDUCED ? 0 : Math.sin(t * 0.11) * 0.03);
      var cy = Math.cos(rotY);
      var sy = Math.sin(rotY);
      var cx = Math.cos(rotX);
      var sx = Math.sin(rotX);
      /* sized and offset so the cloud clears the headline column and the
         widest sway never clips the canvas bounds */
      var scale = Math.min(w * 0.44, h * 0.46);
      var cxp = w * 0.56;
      var f = 3.2; /* perspective distance */

      /* painter-ish ordering is unnecessary for outlined points; draw all */
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        /* rotate around Y then X */
        var x1 = p.x * cy + p.z * sy;
        var z1 = -p.x * sy + p.z * cy;
        var y1 = p.y * cx - z1 * sx;
        var z2 = p.y * sx + z1 * cx;

        var persp = f / (f + z2);
        var sxp = cxp + x1 * scale * persp;
        var syp = h * 0.5 - y1 * scale * persp;

        /* contour emphasis: rim particles draw brighter and larger, so
           the brain's outline stays defined while the interior is airy */
        var edgeBoost = 0.4 + 0.8 * p.edge;

        /* slow shimmer, not churn: shallow amplitude, slow phase */
        var tw = REDUCED
          ? 0.85
          : 0.78 + 0.22 * Math.sin(t * p.twinkle + p.phase);
        var depth = 0.55 + 0.45 * ((z2 + 0.3) / 0.6);
        var alpha = Math.max(0.08, Math.min(1, tw * depth * edgeBoost));
        var size = p.size * persp * (0.82 + 0.4 * p.edge);
        var ang = p.angle + (REDUCED ? 0 : t * p.spin);

        drawTriangle(ctx, sxp, syp, size, ang, p.color, alpha);
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

  /* ---------------- ambient drift field ---------------- */

  function initAmbient() {
    var canvas = document.getElementById('ambient');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var N = 34;
    var parts = [];
    var w = 0;
    var h = 0;

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
        vy: 0.006 + Math.random() * 0.012,
        size: 2.5 + Math.random() * 4,
        color: pickColor(),
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.4,
        alpha: 0.10 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2
      });
    }

    function render(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var y = (p.y - t * p.vy) % 1;
        if (y < 0) y += 1;
        var flicker = REDUCED ? 1 : 0.7 + 0.3 * Math.sin(t * 0.8 + p.phase);
        drawTriangle(
          ctx,
          p.x * w,
          y * h,
          p.size,
          p.angle + (REDUCED ? 0 : t * p.spin),
          p.color,
          p.alpha * flicker
        );
      }
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
