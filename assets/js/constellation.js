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

  function brainPoints(n) {
    var pts = [];
    var count = 0;
    while (count < n) {
      /* random direction on sphere, biased toward the shell */
      var u = Math.random() * 2 - 1;
      var theta = Math.random() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u);
      var dx = s * Math.cos(theta);
      var dy = u;
      var dz = s * Math.sin(theta);
      var r = 0.72 + 0.28 * Math.pow(Math.random(), 0.6);

      var x = dx * r * 1.28; /* wider than tall */
      var y = dy * r * 0.98;
      var z = dz * r * 1.05;

      /* flatten the underside a little (temporal lobes sit low) */
      if (y < -0.55) y = -0.55 - (y + 0.55) * 0.35;

      /* longitudinal fissure: push particles off the centerline on top */
      if (Math.abs(x) < 0.14 && y > 0.1) {
        x += (x >= 0 ? 1 : -1) * (0.14 - Math.abs(x)) * 0.9;
      }

      /* cortical folds: sinusoidal displacement along the surface */
      var wob =
        0.05 * Math.sin(7.0 * x + 2.1 * z) * Math.sin(5.0 * y + 1.3) +
        0.03 * Math.sin(11.0 * z + 4.0 * y);
      x += dx * wob;
      y += dy * wob;
      z += dz * wob;

      pts.push({
        x: x, y: y, z: z,
        color: pickColor(),
        size: 1.6 + Math.random() * 2.6,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.5 + Math.random() * 1.2,
        spin: (Math.random() - 0.5) * 0.9,
        angle: Math.random() * Math.PI * 2
      });
      count++;
    }

    /* cerebellum: a denser small lobe tucked low at the back */
    var extra = Math.floor(n * 0.16);
    for (var i = 0; i < extra; i++) {
      var u2 = Math.random() * 2 - 1;
      var t2 = Math.random() * Math.PI * 2;
      var s2 = Math.sqrt(1 - u2 * u2);
      var r2 = 0.75 + 0.25 * Math.random();
      pts.push({
        x: s2 * Math.cos(t2) * 0.42 * r2 + 0.0,
        y: u2 * 0.3 * r2 - 0.62,
        z: s2 * Math.sin(t2) * 0.38 * r2 - 0.52,
        color: pickColor(),
        size: 1.4 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.5 + Math.random() * 1.2,
        spin: (Math.random() - 0.5) * 0.9,
        angle: Math.random() * Math.PI * 2
      });
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
    var points = brainPoints(1700);
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

      var rotY = REDUCED ? 0.4 : t * 0.12;
      var rotX = 0.12 + (REDUCED ? 0 : Math.sin(t * 0.07) * 0.04);
      var cy = Math.cos(rotY);
      var sy = Math.sin(rotY);
      var cx = Math.cos(rotX);
      var sx = Math.sin(rotX);
      var scale = Math.min(w, h) * 0.42;
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
        var sxp = w * 0.5 + x1 * scale * persp;
        var syp = h * 0.5 - y1 * scale * persp;

        var tw = REDUCED
          ? 0.8
          : 0.55 + 0.45 * Math.sin(t * p.twinkle + p.phase);
        var depth = 0.35 + 0.65 * ((z2 + 1.6) / 3.2);
        var alpha = Math.max(0.08, Math.min(1, tw * depth));
        var size = p.size * persp;
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
