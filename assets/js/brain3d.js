/* Cluster AI — the second brain, made real.
   Image-to-particles: the approved brand render (assets/img/brain-source.png,
   Higgsfield job c2e051ac) is the SOURCE OF TRUTH. Every lit pixel of it
   becomes a WebGL particle with that pixel's color, projected onto a 3D
   brain shell so the artwork itself rotates, twinkles, and travels with
   scroll. three.js Points + additive blending, GPU all the way.
   Falls back to the 2D canvas renderer when WebGL is unavailable. */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.THREE) return;

  var canvas = document.getElementById('constellation');
  if (!canvas) return;

  /* side-profile silhouette (matches the source artwork's framing) used
     to give each sampled pixel a depth on the shell */
  var PROFILE = [
    [-0.78, 0.10], [-0.74, 0.38], [-0.58, 0.60], [-0.30, 0.76],
    [0.02, 0.82], [0.34, 0.74], [0.60, 0.56], [0.76, 0.30],
    [0.82, 0.02], [0.76, -0.22], [0.62, -0.34],
    [0.56, -0.30], [0.66, -0.44], [0.60, -0.64], [0.40, -0.72],
    [0.22, -0.64],
    [0.18, -0.70], [0.24, -0.96], [0.06, -0.98], [0.06, -0.66],
    [-0.10, -0.58], [-0.44, -0.50], [-0.66, -0.32], [-0.76, -0.12]
  ];
  function inPoly(x, y) {
    var inside = false;
    for (var i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
      var xi = PROFILE[i][0], yi = PROFILE[i][1];
      var xj = PROFILE[j][0], yj = PROFILE[j][1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function edgeDist(x, y) {
    var d = Infinity;
    for (var i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
      var x1 = PROFILE[j][0], y1 = PROFILE[j][1];
      var x2 = PROFILE[i][0], y2 = PROFILE[i][1];
      var dx = x2 - x1, dy = y2 - y1;
      var t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
      t = Math.max(0, Math.min(1, t));
      var px = x1 + t * dx - x, py = y1 + t * dy - y;
      d = Math.min(d, Math.hypot(px, py));
    }
    return d;
  }

  /* claim the canvas synchronously so the 2D fallback stands down and the
     scroll choreography finds its pose object immediately */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: false, powerPreference: 'high-performance'
    });
  } catch (e) {
    return; /* no WebGL — the canvas renderer takes over */
  }
  renderer.setClearColor(0x000000, 0);
  window.__brainClaimed = true;
  window.__brainPose = { x: 0.72, y: 0.5, s: 1, a: 1, r: 0 };

  var img = new Image();
  img.src = 'assets/img/brain-source.png';
  img.onload = function () {
    build(img);
  };

  function build(image) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 3.4;

    /* ---- sample the artwork ---- */
    var s = document.createElement('canvas');
    var N = Math.min(image.width, 210); /* cap the sampling lattice; drawImage averages the higher-res source */
    s.width = N; s.height = N;
    var sctx = s.getContext('2d');
    sctx.drawImage(image, 0, 0, N, N);
    var data = sctx.getImageData(0, 0, N, N).data;

    var pos = [], col = [], size = [], phase = [], bright = [];
    function push(x, y, z, r, g, b, br) {
      pos.push(x, y, z);
      col.push(r, g, b);
      /* bimodal sizes: large outlined triangles plus small bright chips */
      size.push(Math.random() < 0.72 ? 0.9 + Math.random() * 0.8 : 0.38 + Math.random() * 0.34);
      phase.push(Math.random() * Math.PI * 2);
      bright.push(br);
    }
    for (var v = 0; v < N; v++) {
      for (var u = 0; u < N; u++) {
        var idx = (v * N + u) * 4;
        var r = data[idx], g = data[idx + 1], b = data[idx + 2];
        var lum = (r + g + b) / 765;
        if (lum < 0.12) continue; /* void */
        /* density follows the artwork's light: the bright rim survives
           whole, the dark interior keeps only sparse triangles */
        var keep = lum > 0.3 ? 1 : Math.pow(lum / 0.3, 3) * 0.5;
        if (Math.random() > keep) continue;
        var x = (u / N - 0.5) * 2.05;
        var y = (0.5 - v / N) * 2.05;
        if (!inPoly(x, y)) continue; /* ambient scraps live on their own layer */
        var d = edgeDist(x, y);
        var zmax = 0.6 * Math.sqrt(Math.min(1, d / 0.32));
        /* normalize hue, then snap toward the nearest brand color — the
           render was generated on the brand palette and downsample
           averaging drifts its hues */
        var maxc = Math.max(r, g, b, 1);
        var rn = r / maxc, gn = g / maxc, bn = b / maxc;
        var t = null;
        if (bn >= rn && bn >= gn && bn - Math.min(rn, gn) > 0.18) {
          t = [0.5, 0.32, 1.0]; /* electric iris */
        } else if (rn >= gn && gn >= bn && rn - bn > 0.22) {
          t = [1.0, 0.72, 0.16]; /* saffron spark */
        } else if (gn >= rn && gn - rn > 0.15) {
          t = [0.1, 0.72, 0.6]; /* verdant */
        }
        if (t) {
          rn = rn * 0.35 + t[0] * 0.65;
          gn = gn * 0.35 + t[1] * 0.65;
          bn = bn * 0.35 + t[2] * 0.65;
        }
        var br = 0.3 + 0.7 * Math.min(1, lum * 1.7);
        /* front face carries the artwork verbatim */
        push(x, y, zmax * (0.75 + Math.random() * 0.25), rn, gn, bn, br);
        if (keep === 1 && Math.random() < 0.6) {
          /* thicken the bright rim into the near-solid band of the render */
          var j = 2.05 / N;
          push(x + (Math.random() - 0.5) * j * 2.2, y + (Math.random() - 0.5) * j * 2.2,
            zmax * (0.5 + Math.random() * 0.5), rn, gn, bn, br * 0.85);
        }
        /* far side: same artwork mirrored through the shell, dimmed —
           gives the hollow look and something to rotate into view */
        if (Math.random() < 0.5) {
          push(x, y, -zmax * (0.75 + Math.random() * 0.25), rn, gn, bn, 0.22);
        }
      }
    }

    var gridStep = 2.05 / N; /* object-space spacing of the sample grid */

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phase, 1));
    geo.setAttribute('aBright', new THREE.Float32BufferAttribute(bright, 1));

    var uniforms = {
      uTime: { value: 0 },
      uAlpha: { value: 1 },
      uSize: { value: 1 }
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        'attribute vec3 aColor;',
        'attribute float aSize;',
        'attribute float aPhase;',
        'attribute float aBright;',
        'uniform float uSize;',
        'varying vec3 vColor;',
        'varying float vPhase;',
        'varying float vBright;',
        'void main() {',
        '  vColor = aColor; vPhase = aPhase; vBright = aBright;',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = aSize * uSize * (3.4 / -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uTime;',
        'uniform float uAlpha;',
        'varying vec3 vColor;',
        'varying float vPhase;',
        'varying float vBright;',
        /* iq's equilateral-triangle SDF, drawn as an outline sprite */
        'float sdTri(vec2 p) {',
        '  const float k = 1.7320508;',
        '  p.x = abs(p.x) - 0.5; p.y = p.y + 0.5 / k;',
        '  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;',
        '  p.x -= clamp(p.x, -1.0, 0.0);',
        '  return -length(p) * sign(p.y);',
        '}',
        'void main() {',
        '  vec2 p = (gl_PointCoord - 0.5) * 2.4;',
        '  float sd = sdTri(vec2(p.x, -p.y));',
        '  float outline = smoothstep(0.3, 0.04, abs(sd));',
        '  float fill = 0.18 * smoothstep(0.05, -0.5, sd);',
        '  float tw = 0.78 + 0.22 * sin(uTime * (0.6 + vPhase * 0.25) + vPhase * 7.0);',
        /* 0.62 headroom keeps stacked additive particles from clipping white */
        '  float a = (outline + fill) * tw * vBright * uAlpha * 0.62;',
        '  if (a < 0.01) discard;',
        '  gl_FragColor = vec4(vColor, a);',
        '}'
      ].join('\n')
    });

    var points = new THREE.Points(geo, material);
    var group = new THREE.Group();
    group.add(points);
    scene.add(group);

    var POSE = window.__brainPose;
    var w = 0, h = 0;

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      renderer.setPixelRatio(DPR);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function render(t) {
      var viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      var viewW = viewH * camera.aspect;
      group.position.x = (POSE.x - 0.5) * viewW;
      group.position.y = (0.5 - POSE.y) * viewH;
      var base = Math.min(viewW * 0.21, viewH * 0.54);
      group.scale.setScalar(base * POSE.s);
      group.rotation.y = (REDUCED ? 0.08 : Math.sin(t * 0.14) * 0.2) + POSE.r;
      group.rotation.x = 0.04;
      uniforms.uTime.value = t;
      uniforms.uAlpha.value = POSE.a;
      /* each sprite spans ~1.6 sample-grid cells on screen, whatever the
         brain's current scale — dense speckle, never a merged blob */
      var pxPerWorld = (h / viewH) * DPR;
      uniforms.uSize.value = Math.max(2.5, group.scale.x * gridStep * pxPerWorld * 2.3);
      renderer.render(scene, camera);
    }

    function loop(tms) {
      render(tms * 0.001);
      if (!REDUCED) requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', function () {
      resize();
      if (REDUCED) render(4);
    });

    if (REDUCED) render(4);
    else requestAnimationFrame(loop);
  }
})();
