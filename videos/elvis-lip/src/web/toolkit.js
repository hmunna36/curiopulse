// CurioPulse toolkit: one-line helpers around the vendored libraries in web/vendor/ (all MIT; each folder has its
// LICENSE): organic noise (simplex-noise), perceptual OKLCH colour (culori), shape morphs (flubber), friendly
// pseudo-3D props (Zdog), hand-drawn ink (rough.js) and baked 2D physics (matter-js, baked by bake_physics.js).
// Engine file: loaded after fx.js and before the video's world files (scene.html). Reference: reference/engine.md
// and reference/visual.md ("The toolkit").
// - Frame-pure: every helper's output depends only on its arguments (time, seed, shape), never on an earlier
//   frame, so stills, ranges and the full encode agree. Randomness is seeded (mulberry32), never Math.random.
// - Drawing helpers take the context to draw into (ctx, or gctx for the bloom layer) and work under whatever
//   transform is set: world coords after applyCam(cam), screen px after screenSpace().
// - Every global here starts with sn, ok, shape, morph, zd, rough or phys, so it can't collide with a world file's
//   own names (a duplicate const/let is a SyntaxError that stops the page).
'use strict';

// ================================================================= noise (simplex-noise 4.0.3)
const SN_FNS = {};
function snFns(seed) {
  let f = SN_FNS[seed];
  if (!f) {
    const S = window.SimplexNoise;
    f = SN_FNS[seed] = { n2: S.createNoise2D(mulberry32(seed * 7919 + 13)), n3: S.createNoise3D(mulberry32(seed * 7919 + 29)) };
  }
  return f;
}
// smooth noise in [-1, 1]
function sn2(x, y, seed = 1) { return snFns(seed).n2(x, y); }
function sn3(x, y, z, seed = 1) { return snFns(seed).n3(x, y, z); }
// fractal (layered) noise in about [-1, 1]: rougher detail for terrain, clouds, membranes
function snFbm(x, y, z = 0, seed = 1, octaves = 4) {
  let a = 1, f = 1, s = 0, n = 0;
  for (let i = 0; i < octaves; i++) { s += a * sn3(x * f, y * f, z * f, seed + i * 101); n += a; a *= 0.5; f *= 2.03; }
  return s / n;
}
// organic wander [dx, dy] in px: amp = how far, speed = how fast (about wanders per second). Floating things,
// a drifting camera target, a bobbing molecule: snDrift(t, 3, 24, 0.35)
function snDrift(t, seed = 1, amp = 20, speed = 0.3) {
  return [amp * sn2(t * speed, 11.3, seed), amp * sn2(t * speed, 47.9, seed)];
}
// closed wobbly outline [[x, y]…] around (cx, cy): a cell membrane, a droplet, a blob that breathes with t
function snBlob(cx, cy, r, t, seed = 1, amt = 0.12, n = 72, speed = 0.4) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + amt * sn3(Math.cos(a) * 1.3, Math.sin(a) * 1.3, t * speed, seed);
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return pts;
}
// wisps of gas, smoke or steam rising from a spot and swaying on a noise field (soft dots + bloom).
// o: {x, y, t, n = 26, seed = 1, col = '#CFE8FF', size = 60, rise = 420, spread = 90, life = 2.2, alpha = 0.22, glow = 0.5,
//     sway = 70, t0 = -Infinity}. World or screen coords, whichever transform is set.
function snWisps(o) {
  const n = o.n || 26, seed = o.seed || 1, life = o.life || 2.2, size = o.size || 60, rise = o.rise === undefined ? 420 : o.rise;
  const spread = o.spread === undefined ? 90 : o.spread, sway = o.sway === undefined ? 70 : o.sway;
  const col = o.col || '#CFE8FF', alpha = o.alpha === undefined ? 0.22 : o.alpha, glow = o.glow === undefined ? 0.5 : o.glow;
  const rng = mulberry32(seed * 977);
  const since = o.t - (o.t0 === undefined ? -1e9 : o.t0);
  for (let i = 0; i < n; i++) {
    const ph = rng(), sx = (rng() - 0.5) * spread, sz = 0.6 + 0.8 * rng();
    const age = ((o.t / life + ph) % 1 + 1) % 1;
    if (since < age * life) continue;                     // not born yet after t0
    const y = o.y - rise * age;
    const x = o.x + sx + sway * age * sn2(i * 3.1, o.t * 0.35 + age * 1.7, seed);
    const a = alpha * Math.sin(Math.PI * age) * sz;
    const r = size * (0.45 + 1.1 * age) * sz;
    softDot(o.c || ctx, x, y, r, col, a);
    if (glow > 0) softDot(gctx, x, y, r * 1.2, col, a * glow);
  }
}

// ================================================================= colour (culori 4.0.2, OKLCH)
// Blends and shades in OKLCH stay vivid and even (no muddy grey midpoints, no hue jumps), so colour-as-state
// changes (calm cyan -> danger red) and 2.5D shading look right. Results are '#rrggbb' strings, gamut-mapped.
let OK_CONV = null, OK_GAMUT = null;
const OK_MIX = {};
function okColor(c) { OK_CONV = OK_CONV || culori.converter('oklch'); return OK_CONV(c); }
function okHex(o) { OK_GAMUT = OK_GAMUT || culori.toGamut('rgb', 'oklch'); return culori.formatHex(OK_GAMUT(o)); }
// perceptual blend of two colours, k = 0..1
function okMix(a, b, k) {
  const key = a + '|' + b;
  const f = OK_MIX[key] || (OK_MIX[key] = culori.interpolate([a, b], 'oklch'));
  return okHex(f(clamp(k)));
}
// shift lightness (dl, 0..1 scale), multiply chroma (cm), rotate hue (dh degrees)
function okShade(hex, dl = 0, cm = 1, dh = 0) {
  const o = okColor(hex);
  return okHex({ mode: 'oklch', l: clamp(o.l + dl), c: Math.max(0, (o.c || 0) * cm), h: (o.h || 0) + dh });
}
// n colours evenly through the stops (OKLCH): heat maps, gauges, a state ramp
function okRamp(stops, n) {
  const f = culori.interpolate(stops, 'oklch');
  return [...Array(n)].map((_, i) => okHex(f(n === 1 ? 0 : i / (n - 1))));
}
// a 2.5D shading set from one base colour (the hiker's PAL works this way: base, shade, highlight)
function okPal(hex) {
  return { base: okShade(hex, 0), hi: okShade(hex, 0.12, 0.9), lo: okShade(hex, -0.13, 1.05), deep: okShade(hex, -0.27, 1.1),
    glow: okShade(hex, 0.06, 1.2), rim: okShade(hex, 0.22, 0.55) };
}

// ================================================================= shapes + morphs (flubber 0.4.2)
// Shapes are rings [[x, y]…] in LOCAL coords around (0, 0); draw them with translate/scale. A morph between any two
// shapes (any point counts, any topology) is cached by its key, so build the shapes once (initScenes2 or a const).
function shapeCircle(r, n = 48) { return [...Array(n)].map((_, i) => [Math.cos((i / n) * 6.2832) * r, Math.sin((i / n) * 6.2832) * r]); }
function shapeTear(s = 1, n = 64) {                    // a teardrop, tip up, about 2s wide and 3s tall around (0, 0)
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 - 0.55 * Math.pow(Math.max(0, -Math.sin(a)), 3);
    pts.push([Math.cos(a) * s * r * (1 - 0.35 * Math.max(0, -Math.sin(a))), (Math.sin(a) * 1.05 + 0.25) * s * (Math.sin(a) < 0 ? 1.55 : 1)]);
  }
  return pts;
}
function shapeHeart(s = 1, n = 72) {
  return [...Array(n)].map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [16 * Math.pow(Math.sin(a), 3) * s / 16, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * s / 16];
  });
}
function shapeStar(r1, r2, points = 5) {
  return [...Array(points * 2)].map((_, i) => {
    const a = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2, r = i % 2 ? r2 : r1;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
}
function shapeRect(w, h, r = 0) {
  if (r <= 0) return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  const pts = [], q = 8;
  for (const [cx, cy, a0] of [[w / 2 - r, -h / 2 + r, -Math.PI / 2], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI]]) {
    for (let i = 0; i <= q; i++) { const a = a0 + (i / q) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  }
  return pts;
}
function shapeBlob(r, seed = 1, amt = 0.18, n = 64) { return snBlob(0, 0, r, 0, seed, amt, n, 0); }
function shapePath(pts) { return 'M' + pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L') + 'Z'; }

const MORPH_FN = {};
// Path2D of the morph from shape a to shape b at k (0..1). a, b: rings or SVG path strings.
function morphPath(key, a, b, k, maxSeg = 6) {
  let f = MORPH_FN[key];
  if (!f) f = MORPH_FN[key] = flubber.interpolate(a, b, { maxSegmentLength: maxSeg, string: true });
  return new Path2D(f(clamp(k)));
}
// fill (and optionally stroke and glow) the morph at (x, y) with scale s and rotation rot.
// style: {fill, stroke, lineWidth, glow (0..1, also drawn into gctx), glowCol}
function morphFill(c, key, a, b, k, x, y, s = 1, style = {}, rot = 0) {
  const p = morphPath(key, a, b, k, style.maxSeg);
  const one = (cc, isGlow) => {
    cc.save(); cc.translate(x, y); cc.rotate(rot); cc.scale(s, s);
    if (isGlow) { cc.globalAlpha *= style.glow; cc.fillStyle = style.glowCol || style.fill; cc.fill(p); }
    else {
      if (style.fill) { cc.fillStyle = style.fill; cc.fill(p); }
      if (style.stroke) { cc.lineWidth = (style.lineWidth || 6) / s; cc.lineJoin = 'round'; cc.strokeStyle = style.stroke; cc.stroke(p); }
    }
    cc.restore();
  };
  one(c, false);
  if (style.glow > 0 && c !== gctx) one(gctx, true);
}
// one shape splitting into several (a drop into droplets) or several merging into one (k = 0..1).
// Returns Path2D[]; a: ring, bs: rings. merge = true runs it backwards (bs -> a).
const MORPH_MANY = {};
function morphSplit(key, a, bs, k, merge = false, maxSeg = 6) {
  let fs = MORPH_MANY[key];
  if (!fs) fs = MORPH_MANY[key] = merge ? flubber.combine(bs, a, { maxSegmentLength: maxSeg, single: false, string: true })
    : flubber.separate(a, bs, { maxSegmentLength: maxSeg, single: false, string: true });
  return fs.map((f) => new Path2D(f(clamp(k))));
}

// ================================================================= pseudo-3D props (Zdog 1.1.3)
// Zdog builds round, flat-shaded 3D props from spheres, discs, cones and tubes and z-sorts them; here they render
// straight into the canvas as vectors under the current transform (crisp at any camera zoom), with a soft 2.5D
// shade on every ball. Build once, draw every frame:
//   const HEART = zdHeart({ color: '#FF4D6D' });               // in initScenes2 (or a top-level const)
//   zdDraw(HEART, 540, 900, { s: 2.2, ry: t * 0.8, glow: 0.35, beat: 1 + 0.08 * Math.sin(t * 9) });
// Units: a prop is about 200 units across at s = 1 (s scales it, strokes included). rx/ry/rz rotate it (radians).
const ZD_LIGHT = [-0.42, -0.48];                        // shading light: up and to the left, like the hiker's highlights
let ZD_GLOWPASS = false;
function zdProp(build) {
  const root = new Zdog.Anchor();
  const parts = build(root) || {};
  return { root, parts };
}
// a shaded ball (sphere) at (x, y, z) with diameter d; o.shade = 0..1 (how strong the 2.5D shade is)
function zdBall(addTo, x, y, z, d, color, o = {}) {
  const sh = new Zdog.Shape({ addTo, translate: { x, y, z }, stroke: d, color });
  const shade = o.shade === undefined ? 1 : o.shade;
  if (shade > 0) {
    const pal = okPal(color);
    sh.renderCanvasDot = function (c) {
      const lw = this.getLineWidth();
      if (!lw) return;
      const p = this.pathCommands[0].endRenderPoint, r = lw / 2;
      c.fillStyle = this.getRenderColor();
      c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill();
      if (ZD_GLOWPASS) return;
      const g = c.createRadialGradient(p.x + ZD_LIGHT[0] * r, p.y + ZD_LIGHT[1] * r, r * 0.05, p.x, p.y, r * 1.02);
      g.addColorStop(0, rgba(pal.rim, 0.75 * shade)); g.addColorStop(0.35, rgba(pal.hi, 0.25 * shade));
      g.addColorStop(0.72, rgba(pal.base, 0)); g.addColorStop(1, rgba(pal.deep, 0.75 * shade));
      c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill();
    };
  }
  return sh;
}
// a tube from a to b ({x, y, z}), thickness w
function zdTube(addTo, a, b, w, color) { return new Zdog.Shape({ addTo, path: [a, b], stroke: w, color }); }
// draw a prop at (x, y). o: {s, rx, ry, rz, glow (0..1: also into the bloom layer), alpha, beat (scale pulse)}
function zdDraw(prop, x, y, o = {}) {
  const r = prop.root;
  r.rotate.x = o.rx || 0; r.rotate.y = o.ry || 0; r.rotate.z = o.rz || 0;
  r.updateGraph();
  const s = (o.s || 1) * (o.beat || 1);           // scale on the canvas, so strokes and balls scale together
  const draw = (c, glowPass) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (o.alpha !== undefined) c.globalAlpha *= clamp(o.alpha);
    if (glowPass) c.globalAlpha *= o.glow;
    ZD_GLOWPASS = glowPass;
    r.renderGraphCanvas(c);
    ZD_GLOWPASS = false;
    c.restore();
  };
  draw(ctx, false);
  if (o.glow > 0) draw(gctx, true);
}
// ---- ready-made props (colours: any CSS hex; every prop's parts can be tweaked after building)
// a cartoon heart (organ): two lobes, a pointed apex, aorta and vessels. o: {color, vessel}
function zdHeart(o = {}) {
  const col = o.color || '#FF4D6D', pal = okPal(col), ves = o.vessel || '#8FB8FF';
  return zdProp((root) => {
    const body = new Zdog.Anchor({ addTo: root, rotate: { z: 0.18 } });
    zdBall(body, -26, -12, 0, 92, col);
    zdBall(body, 26, -8, -4, 86, pal.lo);
    new Zdog.Cone({ addTo: body, diameter: 120, length: 82, translate: { y: 18 }, rotate: { x: -Math.PI / 2 }, color: pal.base, backface: pal.lo, stroke: false });
    zdBall(body, 0, 8, 8, 96, col, { shade: 0.9 });
    zdTube(body, { x: -6, y: -40, z: -6 }, { x: -2, y: -86, z: -10 }, 28, okShade(col, 0.08, 0.8));
    zdTube(body, { x: -2, y: -86, z: -10 }, { x: 28, y: -96, z: -12 }, 26, okShade(col, 0.08, 0.8));
    zdTube(body, { x: 18, y: -44, z: -16 }, { x: 34, y: -78, z: -22 }, 20, ves);
    zdTube(body, { x: 4, y: -20, z: 46 }, { x: 22, y: 30, z: 40 }, 6, okShade(col, -0.18, 1.1));
    return { body };
  });
}
// an eyeball that can look around: rotate it (rx, ry) and the iris turns with it. o: {iris, white, pupil}
function zdEye(o = {}) {
  const iris = o.iris || '#4AA8FF', white = o.white || '#F4F6FF';
  return zdProp((root) => {
    zdBall(root, 0, 0, 0, 180, white, { shade: 0.8 });
    const front = new Zdog.Anchor({ addTo: root, translate: { z: 84 } });
    new Zdog.Ellipse({ addTo: front, diameter: 86, stroke: 6, fill: true, color: iris });
    new Zdog.Ellipse({ addTo: front, diameter: 64, stroke: 4, fill: false, color: okShade(iris, 0.12, 0.9), translate: { z: 1 } });
    new Zdog.Ellipse({ addTo: front, diameter: 40, stroke: 2, fill: true, color: o.pupil || '#0B0B1A', translate: { z: 3 } });
    new Zdog.Shape({ addTo: front, translate: { x: -14, y: -16, z: 8 }, stroke: 14, color: '#FFFFFF' });
    return { front };
  });
}
// a cell: translucent membrane, nucleus, and a few organelles before and behind it. o: {color, nucleus, seed, n}
function zdCell(o = {}) {
  const col = o.color || '#4DFFB4', nuc = o.nucleus || '#C8A8FF', rng = mulberry32((o.seed || 1) * 31);
  return zdProp((root) => {
    for (let i = 0; i < (o.n || 9); i++) {
      const a = rng() * Math.PI * 2, b = (rng() - 0.5) * 2.4, rr = 50 + rng() * 30;
      zdBall(root, Math.cos(a) * Math.cos(b) * rr, Math.sin(b) * rr * 0.9, Math.sin(a) * Math.cos(b) * rr, 14 + rng() * 14,
        okShade(col, -0.05 + rng() * 0.15, 1, rng() * 60 - 30), { shade: 0.7 });
    }
    zdBall(root, 6, -4, 0, 76, nuc, { shade: 1 });
    new Zdog.Shape({ addTo: root, stroke: 200, color: rgba(okShade(col, 0.05), 0.22) });
    new Zdog.Ellipse({ addTo: root, diameter: 196, stroke: 5, color: rgba(okShade(col, 0.18, 0.8), 0.8) });
    return {};
  });
}
// ball-and-stick molecule. o.atoms: [[x, y, z, d, color]…], o.bonds: [[i, j]…]; or o.preset 'water' | 'co2' | 'o2' | 'ch4'
const ZD_MOLS = {
  water: { atoms: [[0, 0, 0, 92, '#FF5A6E'], [-62, 44, 0, 58, '#F4F6FF'], [62, 44, 0, 58, '#F4F6FF']], bonds: [[0, 1], [0, 2]] },
  co2: { atoms: [[0, 0, 0, 80, '#3A3F55'], [-92, 0, 0, 84, '#FF5A6E'], [92, 0, 0, 84, '#FF5A6E']], bonds: [[0, 1], [0, 2]] },
  o2: { atoms: [[-44, 0, 0, 88, '#FF5A6E'], [44, 0, 0, 88, '#FF5A6E']], bonds: [[0, 1]] },
  ch4: { atoms: [[0, 0, 0, 84, '#3A3F55'], [0, -78, 0, 52, '#F4F6FF'], [-70, 30, 36, 52, '#F4F6FF'], [70, 30, 36, 52, '#F4F6FF'], [0, 30, -78, 52, '#F4F6FF']],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4]] },
};
function zdMolecule(o = {}) {
  const m = o.preset ? ZD_MOLS[o.preset] : o;
  return zdProp((root) => {
    for (const [i, j] of m.bonds) {
      const a = m.atoms[i], b = m.atoms[j];
      zdTube(root, { x: a[0], y: a[1], z: a[2] }, { x: b[0], y: b[1], z: b[2] }, 16, o.bond || '#C9D2EE');
    }
    for (const [x, y, z, d, c] of m.atoms) zdBall(root, x, y, z, d, c);
    return {};
  });
}
// a planet with an optional ring and moon. o: {color, ring, moon, tilt}
function zdPlanet(o = {}) {
  const col = o.color || '#FF9A3C';
  return zdProp((root) => {
    zdBall(root, 0, 0, 0, 160, col);
    const tilt = new Zdog.Anchor({ addTo: root, rotate: { x: Math.PI / 2 - 0.35, z: o.tilt === undefined ? 0.3 : o.tilt } });
    if (o.ring !== false) {
      new Zdog.Ellipse({ addTo: tilt, diameter: 250, stroke: 12, color: o.ring || okShade(col, 0.15, 0.6) });
      new Zdog.Ellipse({ addTo: tilt, diameter: 214, stroke: 6, color: rgba(okShade(col, 0.25, 0.5), 0.7) });
    }
    let moon = null;
    if (o.moon) { moon = new Zdog.Anchor({ addTo: root }); zdBall(moon, 150, -30, 0, 34, o.moon === true ? '#C9D2EE' : o.moon); }
    return { tilt, moon };
  });
}
// a lumpy organ or blob (brain, stomach, lung lobe, onion bulb...): a cluster of shaded balls. o: {color, n, r, seed, flat}
function zdBlob(o = {}) {
  const col = o.color || '#FF86A6', rng = mulberry32((o.seed || 1) * 17), r = o.r || 70;
  return zdProp((root) => {
    const n = o.n || 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rng() * 0.4, b = (rng() - 0.5) * 1.6;
      zdBall(root, Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r * (o.flat || 0.8), Math.sin(a) * Math.cos(b) * r * 0.8,
        r * (0.8 + rng() * 0.5), okShade(col, (rng() - 0.5) * 0.08));
    }
    zdBall(root, 0, 0, 0, r * 1.7, col);
    return {};
  });
}

// ================================================================= hand-drawn ink (rough.js 4.6.6)
// Sketchy circles, underlines, arrows and boxes, the way a teacher marks the board. Seeded, so a mark stays put; set
// o.boil = n to redraw it every n frames (deliberately "alive" lines). o.k = 0..1 draws the stroke on.
// o: rough options ({stroke, strokeWidth, roughness, bowing, fill, fillStyle, hachureGap…}) + {seed, k, boil, t, glow}
const ROUGH_RC = new Map();
let ROUGH_SVGP = null;
function roughOn(c) {
  let rc = ROUGH_RC.get(c);
  if (!rc) { rc = rough.canvas(c.canvas); ROUGH_RC.set(c, rc); }
  return rc;
}
function roughLen(d) {
  if (!ROUGH_SVGP) ROUGH_SVGP = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  ROUGH_SVGP.setAttribute('d', d);
  return ROUGH_SVGP.getTotalLength();
}
// kind: 'ellipse' | 'circle' | 'line' | 'rectangle' | 'linearPath' | 'curve' | 'polygon' | 'arc' | 'path'; args as rough.js
function roughDraw(c, kind, args, o = {}) {
  const k = o.k === undefined ? 1 : clamp(o.k);
  if (k <= 0) return;
  const seed = (o.seed || 7) + (o.boil ? Math.floor((o.t || 0) * FPS / o.boil) : 0);
  const opts = Object.assign({ stroke: '#FFD447', strokeWidth: 7, roughness: 1.3, bowing: 1.2, disableMultiStroke: false },
    o, { seed: Math.max(1, seed) });
  for (const key of ['k', 'boil', 't', 'glow']) delete opts[key];
  const one = (cc, isGlow) => {
    const rc = roughOn(cc);
    const dr = rc.generator[kind](...args, opts);
    cc.save();
    if (isGlow) { cc.globalAlpha *= o.glow; }
    if (k >= 1) rc.draw(dr);
    else {
      cc.lineCap = 'round'; cc.lineJoin = 'round';
      for (const p of rc.generator.toPaths(dr)) {
        if (p.stroke === 'none' || !p.stroke) continue;
        const L = roughLen(p.d);
        cc.setLineDash([L * k, L + 1]); cc.lineDashOffset = 0;
        cc.strokeStyle = p.stroke; cc.lineWidth = p.strokeWidth; cc.stroke(new Path2D(p.d));
      }
      cc.setLineDash([]);
    }
    cc.restore();
  };
  one(c, false);
  if (o.glow > 0 && c !== gctx) one(gctx, true);
}
// a loop around something (a word, a cell): centre (x, y), size w x h
function roughCircle(c, x, y, w, h, o = {}) { roughDraw(c, 'ellipse', [x, y, w, h], o); }
function roughUnderline(c, x0, x1, y, o = {}) {
  roughDraw(c, 'curve', [[[x0, y + 4], [lerp(x0, x1, 0.35), y - 3], [lerp(x0, x1, 0.7), y + 3], [x1, y - 2]]], o);
}
function roughArrow(c, x0, y0, x1, y1, o = {}) {
  const k = o.k === undefined ? 1 : clamp(o.k);
  const mx = lerp(x0, x1, 0.5) + (y1 - y0) * (o.bend === undefined ? 0.18 : o.bend), my = lerp(y0, y1, 0.5) - (x1 - x0) * (o.bend === undefined ? 0.18 : o.bend);
  roughDraw(c, 'curve', [[[x0, y0], [mx, my], [x1, y1]]], Object.assign({}, o, { k: Math.min(1, k / 0.8) }));
  if (k > 0.8) {
    const hk = (k - 0.8) / 0.2, a = Math.atan2(y1 - my, x1 - mx), L = (o.head || 46) * hk;
    for (const s of [-1, 1]) roughDraw(c, 'line', [x1, y1, x1 - Math.cos(a + s * 0.5) * L, y1 - Math.sin(a + s * 0.5) * L], Object.assign({}, o, { k: 1, seed: (o.seed || 7) + 2 + s }));
  }
}
function roughBox(c, x, y, w, h, o = {}) { roughDraw(c, 'rectangle', [x - w / 2, y - h / 2, w, h], o); }

// ================================================================= baked physics (matter-js 0.20, bake_physics.js)
// src/physics.js describes the bodies; `node bake_physics.js ../.work` simulates at 240 Hz before frame 0 and writes
// .work/physics.json; render.js hands it to the page as window.PHYS. Here you only look positions up, so any frame
// renders on its own. A body's {x, y, a} is in world px (y down) and radians.
function physData(name) {
  const P = window.PHYS && window.PHYS[name];
  if (!P) throw new Error(`no baked physics "${name}": write src/physics.js, then run node bake_physics.js ../.work`);
  return P;
}
// every tracked body of the sim at time t: [{id, x, y, a, ...meta}] (before t0: the start, after the end: the rest)
function physAt(name, t) {
  const P = physData(name);
  const u = clamp((t - P.t0) * P.hz, 0, P.frames.length - 1), i = Math.min(P.frames.length - 2, Math.floor(u)), f = u - i;
  const A = P.frames[Math.max(0, i)], B = P.frames[Math.min(P.frames.length - 1, i + 1)];
  return P.ids.map((id, j) => {
    let da = B[j * 3 + 2] - A[j * 3 + 2];
    if (da > Math.PI) da -= 2 * Math.PI; else if (da < -Math.PI) da += 2 * Math.PI;
    return Object.assign({ id, x: lerp(A[j * 3], B[j * 3], f), y: lerp(A[j * 3 + 1], B[j * 3 + 1], f), a: A[j * 3 + 2] + da * f }, P.meta[id]);
  });
}
function physBody(name, id, t) { return physAt(name, t).find((b) => b.id === id); }
// the collisions (for flashes, dust puffs, squash): [{t, a, b, speed}] in video seconds, speed in px/s
function physHits(name) { return physData(name).hits; }
// a quick outline of every body (to check a bake before drawing the real art)
function physDebug(name, t, col = '#7FE9FF') {
  for (const b of physAt(name, t)) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.lineWidth = 4; ctx.strokeStyle = col;
    ctx.beginPath();
    if (b.kind === 'circle') ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    else if (b.kind === 'rect') ctx.rect(-b.w / 2, -b.h / 2, b.w, b.h);
    else if (b.verts) b.verts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath(); ctx.stroke(); ctx.restore();
  }
}
