// THE WORLD KIT (16 Nov 2026; reference/visual.md "The world kit", engine.md "The world kit in code").
// The owner, 13 Nov 2026, on a 15-second showcase set on a lagoon: "I loved this"; on 16 Nov its new visuals became the
// channel's standard kit. What that Short did beyond the usual one, as named functions any world can call:
//   wkLayerCam / wkLayers   a place built in depth layers (sky, sun, clouds, hills, shore, the hero's plane), with a low or high camera
//   wkReflect / wkReflectHero / wkReflectScreen   the mirror image of any drawn layer on water (or a wet floor, ice, glass), rippled
//   wkGlitter               a light's glitter path on water (the sun, the moon, a street lamp on a wet road)
//   wkRipples / wkRings     highlights that make a flat colour read as water; rings round whatever stands in it
//   wkSplash                a splash: a foam crown, rings, flying drops
//   wkLensDrops             water beads on the lens; planned as CAMERA["lens"] in make_timeline.py they stay across a cut
//   wkFlock                 a flock crossing the sky in a loose V (birds by default; any flyer through `draw`)
//   wkCrowd                 a row of small background figures: waders on a far shore, people on a beach, a crowd at a fence
//   CAMERA["flash"]         the flash-forward of reference/direction.md (rule 4): a later shot for half a second, full frame or in a window
// Everything is a pure function of time on loop-safe clocks (the last frame lines up with frame 0), deterministic
// (seeded), and drawn with the engine's own helpers, so it works in both looks and in the weekly film's wide frame
// (sizes scale by WK_U). The file is the same in the Shorts' and the film's template. Reserved prefix: wk / WK.
// Nothing here runs unless a scene calls it or the timeline plans CAMERA["lens"] / CAMERA["flash"]: an older Short renders as it did.
'use strict';

const WK_TALL = H > W;                                   // the Shorts' 1080x1920 frame, or the film's 1920x1080
const WK_U = Math.min(1, H / 1920 + 0.25);               // sizes: 1 in a Short, about 0.81 in the film
const WK_2D = typeof CP_CTX2D === 'object' ? CP_CTX2D : {};
const wkA = mkCanvas(W, H), wkAx = wkA.getContext('2d', WK_2D);   // the thing to mirror, as the camera sees it
const wkB = mkCanvas(W, H), wkBx = wkB.getContext('2d', WK_2D);   // its mirror image, tinted and faded
// the kit's own loop clock, so it also runs in engines without fx.js's loopW (the weekly film)
function wkLoopW(w) {
  const D = window.TL && window.TL.duration > 5 ? window.TL.duration : 0, T2 = Math.PI * 2;
  return D ? (T2 * Math.max(1, Math.round((w * D) / T2))) / D : w;
}
// paint: see-through things are not shapes for the light (look.js); a plain call where the look is not loaded
function wkPaint(fn) { return typeof paint === 'function' ? paint(fn) : fn(); }
function wkDef(v, d) { return v === undefined || v === null ? d : v; }

// ---------------------------------------------------------------- depth layers
// The camera of a layer at depth p: 0 = glued to the screen (the sky), 1 = the hero's plane (the scene's own camera).
// o: {hz: the horizon's world y (the far layers turn about it; default 0.55 H), ax: the world x they turn about (W / 2),
//     dy: the camera's height in px: + is a LOW camera (the far layers sink, he stands against the sky), - a HIGH one
//     (the horizon rises, more ground behind him)}. At p = 0 the horizon sits at mid-frame (+ dy).
function wkLayerCam(cam, p, o = {}) {
  const z = 1 + (cam.zoom - 1) * p, hz = wkDef(o.hz, H * 0.55), ax = wkDef(o.ax, W / 2);
  return { x: lerp(ax, cam.x, p), y: lerp(hz, cam.y, p) - ((o.dy || 0) * (1 - p)) / z, zoom: z, rot: 0, sx: (cam.sx || 0) * p, sy: (cam.sy || 0) * p };
}
// where the horizon (world y o.hz) of the layer at depth p lands on screen: the sky's gradient ends there, the water starts
function wkHorizon(cam, p, o = {}) {
  const c2 = wkLayerCam(cam, p, o);
  return H / 2 + (c2.sy || 0) + (wkDef(o.hz, H * 0.55) - c2.y) * c2.zoom;
}
// A place in layers, far to near: wkLayers(cam, {hz: 1060, dy: 0}, [[0.08, sun], [0.14, clouds], [0.3, hills], [1, ground]]).
// Each fn(c2, p) is called with its layer's camera already applied to ctx and gctx (world coordinates). Three layers or
// more read as depth; the nearer a layer, the more it moves when the camera does.
function wkLayers(cam, o, layers) {
  for (const [p, fn] of layers) { const c2 = wkLayerCam(cam, p, o); applyCam(c2); fn(c2, p); }
  applyCam(cam);
}

// ---------------------------------------------------------------- reflections
// The water line (world y) on screen, for a camera that is not rotated (a scene's own camera; the cinema kit's tilt
// comes later, on the finished frame).
function wkWaterY(cam, wy) { return H / 2 + (cam.sy || 0) + (wy - cam.y) * cam.zoom; }
// The mirror image of `src` (a W x H canvas in screen space) under the water line `ys` (screen y), see-through and rippled.
// o: {a: opacity at the water line (0.3), fade: how much of it is gone at the far end (1), depth: px of water it reaches
//     (to the bottom of the frame), h: px above the line that are mirrored (all), sq: how tall the image is (0.82),
//     amp: the ripple's sideways px (9), rows / band: it is drawn in bands `band` px high every `rows` px (14 / 11: the
//     cartoon's broken reflection; band = rows is an unbroken mirror), w: ripple speed (2.4), freq: ripples per px (0.07),
//     tint / tintA: the water's colour over it ('#hex', 0.25), x0 / x1: only between these screen x (soft edges)}
function wkMirror(src, ys, t, o = {}) {
  if (!(ys > 1) || ys >= H) return;
  const sq = wkDef(o.sq, 0.82), a = wkDef(o.a, 0.3), fade = clamp(wkDef(o.fade, 1));
  const hSrc = Math.min(ys, wkDef(o.h, ys)), depth = Math.max(1, Math.min(H - ys, wkDef(o.depth, H - ys), hSrc * sq));
  const b = wkBx;
  b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; b.filter = 'none';
  b.clearRect(0, 0, W, H);
  b.setTransform(1, 0, 0, -sq, 0, ys * (1 + sq));                     // a point at screen y lands at ys + sq * (ys - y)
  const sy = Math.max(0, ys - depth / sq);
  b.drawImage(src, 0, sy, W, ys - sy, 0, sy, W, ys - sy);
  b.setTransform(1, 0, 0, 1, 0, 0);
  if (o.tint && wkDef(o.tintA, 0.25) > 0.004) {                       // the water's own colour over the image
    b.globalCompositeOperation = 'source-atop'; b.fillStyle = rgba(o.tint, wkDef(o.tintA, 0.25)); b.fillRect(0, ys - 1, W, depth + 2);
  }
  b.globalCompositeOperation = 'destination-in';                      // it thins out away from the line
  const g = b.createLinearGradient(0, ys, 0, ys + depth);
  g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, `rgba(0,0,0,${a * (1 - fade)})`);
  b.fillStyle = g; b.fillRect(0, ys - 1, W, depth + 2);
  if (o.x0 !== undefined && o.x1 !== undefined && o.x1 > o.x0) {      // only a stretch of the picture
    const s = Math.min(60, (o.x1 - o.x0) * 0.2), L = o.x1 - o.x0 + 2 * s, gx = b.createLinearGradient(o.x0 - s, 0, o.x1 + s, 0);
    gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(s / L, 'rgba(0,0,0,1)'); gx.addColorStop(1 - s / L, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = gx; b.fillRect(0, ys - 1, W, depth + 2);
  }
  b.globalCompositeOperation = 'source-over';
  const rows = Math.max(2, Math.round(wkDef(o.rows, 14) * WK_U)), band = Math.max(1, Math.min(rows, Math.round(wkDef(o.band, 11) * WK_U)));
  const amp = wkDef(o.amp, 9) * WK_U, w = wkLoopW(wkDef(o.w, 2.4)), fq = wkDef(o.freq, 0.07) / WK_U;
  wkPaint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    for (let y = Math.ceil(ys); y < ys + depth && y < H; y += rows) {
      const k = (y - ys) / depth, dx = amp * (0.35 + 0.65 * k) * Math.sin(t * w + (y - ys) * fq);
      const hh = Math.min(band, H - y);
      ctx.drawImage(wkB, 0, y, W, hh, dx, y, W, hh);
    }
    ctx.restore();
  });
}
function wkClearA() {
  wkAx.setTransform(1, 0, 0, 1, 0, 0); wkAx.globalAlpha = 1; wkAx.globalCompositeOperation = 'source-over'; wkAx.filter = 'none';
  wkAx.clearRect(0, 0, W, H);
}
// 1. Anything a function can draw again on another canvas (a boat, a bird, a sign, the hiker drawn with drawCharacter):
//    wkReflect(cam, waterY, t, (c) => drawBoat(c, x, y, s), {a: 0.3})
// `draw(c)` gets a canvas with the scene's camera on it: draw in world coordinates with c only (no applyCam, no
// screenSpace, no charLayer inside). Call it after the water is drawn (and after anything the image should lie over).
function wkReflect(cam, waterY, t, draw, o = {}) {
  const ys = wkWaterY(cam, waterY);
  if (!(ys > 1) || ys >= H) return;
  wkClearA(); camTransform(wkAx, cam, 1);
  wkAx.save(); draw(wkAx); wkAx.restore();
  wkMirror(wkA, ys, t, o);
  applyCam(cam);
}
// 2. The hero exactly as charLayer just drew him (his pose, his outfit, what he holds): call it after charLayer, once the
//    water in front of him is drawn. (A hero drawn straight onto ctx with drawCharacter: use wkReflect with the same call.)
function wkReflectHero(cam, waterY, t, o = {}) {
  const ys = wkWaterY(cam, waterY);
  if (!(ys > 1) || ys >= H) return;
  wkClearA(); wkAx.drawImage(layerC, 0, 0);
  wkMirror(wkA, ys, t, o);
  applyCam(cam);
}
// 3. What is already on the picture above the water line: a post, a jetty, a far shore, a whole skyline. o.x0 / o.x1
//    (screen x) keep it to one thing; o.h (px above the line) keeps the sky out of it.
function wkReflectScreen(cam, waterY, t, o = {}) {
  const ys = wkWaterY(cam, waterY);
  if (!(ys > 1) || ys >= H) return;
  wkClearA(); wkAx.drawImage(mainC, 0, 0);
  wkMirror(wkA, ys, t, o);
  applyCam(cam);
}

// ---------------------------------------------------------------- glitter, ripples, rings
// A light's glitter path on water: short bright dashes that twinkle, narrow at the horizon and wide near the lens, under
// the light that makes them (the sun, the moon, a lamp). Screen space; the dashes bloom (glow layer).
// o: {x: the light's screen x (W / 2), y0: the horizon or the far edge of the water (screen y), y1: the near edge (H),
//     n: 46, spread: half-width in px at the near edge (260), col: '#FFFADC', glow: '#FFE296', a: 1, seed: 99}
function wkGlitter(t, o = {}) {
  const x0 = wkDef(o.x, W / 2), y0 = wkDef(o.y0, H * 0.5), y1 = wkDef(o.y1, H), n = wkDef(o.n, 46), sp = wkDef(o.spread, 260) * WK_U;
  const col = o.col || '#FFFADC', glow = o.glow || '#FFE296', a = wkDef(o.a, 1), rg = mulberry32(wkDef(o.seed, 99));
  ctx.save(); gctx.save(); screenSpace();
  for (let i = 0; i < n; i++) {
    const u = rg(), r2 = rg(), r3 = rg(), r4 = rg();
    const y = y0 + 8 + u * u * (y1 - y0) * 0.72, wv = (14 + 80 * u) * (0.5 + r2) * WK_U, x = x0 + (r3 - 0.5) * (60 * WK_U + sp * u);
    const tw = 0.5 + 0.5 * Math.sin(t * wkLoopW(2.2 + 2 * r4) + i * 2.4);
    if (y > H + 10 || y > y1) continue;
    line(ctx, x - wv / 2, y, x + wv / 2, y, (3 + 5 * u) * WK_U, rgba(col, clamp(a * (0.25 + 0.6 * tw))));
    line(gctx, x - wv / 2, y, x + wv / 2, y, (8 + 8 * u) * WK_U, rgba(glow, clamp(a * 0.5 * tw)));
  }
  ctx.restore(); gctx.restore();
}
// Highlights across a sheet of water, small at the horizon and long near the lens, each on its own depth (they slide
// against each other when the camera moves). o: {hz, dy, ax: as wkLayerCam, p0: the horizon's depth (0.3), y1: the world
// y of the nearest ones (hz + 1400), x0 / x1: world x range (-500 .. W + 500), n: 80, seed: 5, col: '#E2FFFC', a: 1}
function wkRipples(cam, t, o = {}) {
  const hz = wkDef(o.hz, H * 0.55), p0 = wkDef(o.p0, 0.3), y1 = wkDef(o.y1, hz + 1400), xa = wkDef(o.x0, -500), xb = wkDef(o.x1, W + 500);
  const n = wkDef(o.n, 80), col = o.col || '#E2FFFC', a = wkDef(o.a, 1), rr = mulberry32(wkDef(o.seed, 5)), hzS = wkHorizon(cam, p0, o);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const wx = xa + rr() * (xb - xa), u = 0.03 + rr() * 0.97, r3 = rr(), p = lerp(p0, 1, u), c2 = wkLayerCam(cam, p, o);
    const wy = lerp(hz + 6, y1, Math.pow(u, 1.5));
    const sx = W / 2 + (c2.sx || 0) + (wx + 30 * Math.sin(t * wkLoopW(0.5) + i) - c2.x) * c2.zoom, sy = H / 2 + (c2.sy || 0) + (wy - c2.y) * c2.zoom;
    if (sy < hzS + 3 || sy > H + 10 || sx < -200 || sx > W + 200) continue;
    const len = lerp(18, 190, u) * c2.zoom * (0.5 + r3) * WK_U, al = a * (0.2 + 0.4 * u) * (0.55 + 0.45 * Math.sin(t * wkLoopW(1.3) + i * 1.9));
    line(ctx, sx - len / 2, sy, sx + len / 2, sy, lerp(2, 7, u) * c2.zoom * WK_U, rgba(col, clamp(al)));
  }
  ctx.restore();
}
// Rings spreading round something that stands in the water (a post, a leg, a boat). Under the CURRENT transform (world
// coordinates with the camera applied). rx = the ring's first half-width; ph 0..1 sets one thing's rings off another's.
function wkRings(x, y, rx, t, ph = 0, col = '#EBFFFC') {
  wkPaint(() => {
    for (let k = 0; k < 2; k++) {
      const u = (((t * wkLoopW(Math.PI) / (Math.PI * 2)) + ph + k * 0.5) % 1 + 1) % 1, r = rx * (0.75 + 0.7 * u);
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.2, 0, 0, Math.PI * 2);
      ctx.lineWidth = 5 * (1 - u) + 1; ctx.strokeStyle = rgba(col, 0.75 * (1 - u)); ctx.stroke();
    }
  });
}

// ---------------------------------------------------------------- a splash
// A splash at a world point (the camera is applied here): a foam crown that rises and falls in half a second, three
// rings that spread, and flying drops (fx.js splashDrops). t0 = the hit (a cue), big = its size (1 = a person's hand,
// 2 = a person). o: {col: '#FFFFFF', col2: '#DFF8FF', glow: '#CFF4FF', drops: 46}
function wkSplash(cam, x, y, t0, t, big = 1, o = {}) {
  const d = t - t0;
  if (d < 0 || d > 1.6) return;
  applyCam(cam);
  const up = Math.sin(Math.PI * clamp(d / 0.5)), k = clamp(d / 0.5), c1 = o.col || '#FFFFFF', c2 = o.col2 || '#DFF8FF';
  if (d < 0.5) {
    for (let i = -3; i <= 3; i++) {
      const h = (230 - 34 * Math.abs(i)) * up * big, w = 50 * big;
      ctx.beginPath(); ctx.moveTo(x + i * 44 * big - w / 2, y); ctx.quadraticCurveTo(x + i * 62 * big * (0.7 + k), y - h * 1.2, x + i * 44 * big + w / 2, y); ctx.closePath();
      ctx.fillStyle = i % 2 ? c2 : c1; ctx.fill();
    }
    softDot(gctx, x, y - 60, 260 * big, o.glow || '#CFF4FF', 0.5 * up);
  }
  wkPaint(() => {
    for (let i = 0; i < 3; i++) {
      const u = clamp((d - i * 0.12) / 1.1); if (u <= 0 || u >= 1) continue;
      ctx.beginPath(); ctx.ellipse(x, y + 6, (90 + 330 * u) * big, (18 + 60 * u) * big, 0, 0, Math.PI * 2);
      ctx.lineWidth = 9 * (1 - u) + 1; ctx.strokeStyle = rgba('#F0FFFE', 0.9 * (1 - u)); ctx.stroke();
    }
  });
  if (typeof splashDrops === 'function') {
    const sx = W / 2 + (cam.sx || 0) + (x - cam.x) * cam.zoom, sy = H / 2 + (cam.sy || 0) + (y - cam.y) * cam.zoom;
    splashDrops(sx, sy - 10, t0, t, Math.round(wkDef(o.drops, 46) * big), 31, 1.15);
  }
  applyCam(cam);
}

// ---------------------------------------------------------------- water on the lens
// Beads of water on the glass after a splash (or rain, a sneeze, a wave): they pop on within a third of a second, slide
// down a little and dry. Screen space, over the finished frame: they are on the lens, so they do not move with the
// picture and they stay through a cut. Best planned in make_timeline.py: CAMERA["lens"] = [[cues["splash"], {}]]
// (main.js then draws them on every frame, whatever the shot; timeline_lib keeps them out of the first 1.5 s and off the
// loop's last half second). Or from a shot: return {overlay: () => wkLensDrops(t, cu().splash)} in every shot they cover.
// o: {n: 16, life: seconds until the last bead has gone (1.7), seed: 77, size: 1, box: [x0, y0, x1, y1] where beads may
//     sit (the key zone), keep: [[x0, y0, x1, y1], ...] boxes that stay dry (the caption band)}
function wkLensDrops(t, t0, o = {}) {
  const life = wkDef(o.life, 1.7), d = t - t0;
  if (d < 0.06 || d > life) return;
  const n = wkDef(o.n, 16), sz = wkDef(o.size, 1) * WK_U, rng = mulberry32(wkDef(o.seed, 77)), ls = life / 1.7;
  const box = o.box || (WK_TALL ? [70, 380, 1010, 1630] : [120, 90, W - 120, H - 250]);
  const keep = o.keep || (WK_TALL ? [[210, 1180, 870, 1480]] : [[W / 2 - 760, H - 250, W / 2 + 760, H]]);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  for (let i = 0; i < n; i++) {
    // every bead takes its six numbers whether it shows or not, so no bead moves when another comes or goes
    const x = lerp(box[0], box[2], rng()), y0 = lerp(box[1], box[3], rng()), r0 = (16 + rng() * 34) * sz, del = (0.06 + rng() * 0.25) * ls;
    const lf = (0.8 + rng() * 0.75) * ls, sl = 0.5 + rng(), u = (d - del) / lf;
    if (u <= 0 || u >= 1) continue;
    if (keep.some((b) => x > b[0] && x < b[2] && y0 > b[1] && y0 < b[3])) continue;
    const k = Math.min(1, u / 0.08) * (u > 0.7 ? (1 - u) / 0.3 : 1), r = r0 * k, y = y0 + 150 * sz * u * u * sl;
    if (r < 0.5) continue;
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.34)'); g.addColorStop(0.6, 'rgba(210,244,255,0.10)'); g.addColorStop(1, 'rgba(10,70,120,0.26)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.92, r * 1.08, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x - r * 0.36, y - r * 0.42, r * 0.2, r * 0.13, -0.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// main.js calls this on every frame, after the lens pass and before the grain and the captions
function wkLensPlan(t) {
  const L = window.TL && window.TL.camera && window.TL.camera.lens;
  if (!L || !L.length) return;
  for (const e of L) wkLensDrops(t, e[0], e[1] || {});
}

// ---------------------------------------------------------------- a flock crossing the sky
const WK_BIRD = { body: '#FFFFFF', wing: '#E3EEFF', far: '#BBD0F2', tip: '#2A3350', beak: '#FF9A3C' };
// one flyer, side view, facing RIGHT; about 100 units from tail to beak at s = 1; ph = its place in the wing beat
function wkBird(c, x, y, s, t, ph = 0, pal = null) {
  const P = pal || WK_BIRD, flap = Math.sin(t * wkLoopW(6.5) + ph);
  c.save(); c.translate(x, y); c.scale(s, s);
  const wing = (k, col) => {                                   // k = -1 (the tip below the body) .. 1 (above it)
    c.beginPath(); c.moveTo(12, -3); c.quadraticCurveTo(6, -34 * k - 4, -16, -60 * k); c.lineTo(-27, -54 * k);
    c.quadraticCurveTo(-13, -22 * k, -14, 2); c.closePath(); c.fillStyle = col; c.fill();
    c.beginPath(); c.moveTo(-11, -44 * k); c.lineTo(-16, -60 * k); c.lineTo(-27, -54 * k); c.lineTo(-19, -40 * k); c.closePath(); c.fillStyle = P.tip; c.fill();
  };
  wing(0.85 * flap - 0.12, P.far);                             // the far wing, a little behind the beat
  c.beginPath(); c.moveTo(-24, -1); c.lineTo(-52, -8); c.lineTo(-44, 1); c.lineTo(-52, 9); c.lineTo(-24, 5); c.closePath(); c.fillStyle = P.wing; c.fill();   // the tail
  ellipse(c, 0, 0, 30, 11, P.body);
  circle(c, 29, -6 + 2 * flap, 9, P.body);
  c.beginPath(); c.moveTo(36, -9 + 2 * flap); c.lineTo(52, -4 + 2 * flap); c.lineTo(36, -1 + 2 * flap); c.closePath(); c.fillStyle = P.beak; c.fill();
  wing(flap, P.wing);                                          // the near wing
  c.restore();
}
// A flock in a loose V: it flies from (x0, y0) to (x1, y1) between t0 and t1. Drawn under the CURRENT transform: call
// screenSpace() first for a far sky, or applyCam(wkLayerCam(cam, 0.14, o)) to fly it in a layer.
// f: {t0, t1, x0, y0, x1, y1, n: 7, s: 0.42, seed: 9, loop: true = it comes round once every lap of the Short (the clock
//     wraps at the Short's length, so the loop's last frame meets frame 0), pal: colours for wkBird ({body, wing, far, tip,
//     beak}), draw: (c, x, y, s, t, ph, i) => your own flyer, drawn facing right (bats, butterflies, paper planes)}
function wkFlock(t, f) {
  const D = window.TL && window.TL.duration > 5 ? window.TL.duration : 0;
  const tt = f.loop && D ? f.t0 + ((((t - f.t0) % D) + D) % D) : t;
  const k = (tt - f.t0) / (f.t1 - f.t0);
  if (k < -0.1 || k > 1.1) return;
  const n = wkDef(f.n, 7), s = wkDef(f.s, 0.42), rng = mulberry32(wkDef(f.seed, 9)), right = f.x1 >= f.x0;
  for (let i = 0; i < n; i++) {
    const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1, j = rng();
    const bx = lerp(f.x0, f.x1, k) + row * 110 * s * (right ? -1 : 1), by = lerp(f.y0, f.y1, k) + side * row * 43 * s + 8 * Math.sin(t * wkLoopW(1.3) + j * 6);
    ctx.save();
    if (!right) { ctx.translate(bx, 0); ctx.scale(-1, 1); ctx.translate(-bx, 0); }
    if (f.draw) f.draw(ctx, bx, by, s * (0.85 + 0.3 * j), t, j * 6.28, i);
    else wkBird(ctx, bx, by, s * (0.85 + 0.3 * j), t, j * 6.28, f.pal);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- a crowd in the background
const WK_COATS = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF', '#FF9A3C', '#C8A8FF', '#FF86A6'];
const WK_SKINS = ['#F2B892', '#C98A5E', '#8D5A3B', '#FFD2B0'];
// one small person seen from far off: feet at (x, y), about 100 units tall at s = 1; r = four numbers 0..1 of his own.
// He bobs, and now and then throws his arms up (o.cheer 0..1 = how many do at any moment; default 0.25).
function wkPerson(c, x, y, s, i, r, t, o = {}) {
  const coat = (o.coats || WK_COATS)[i % (o.coats || WK_COATS).length], skin = WK_SKINS[Math.floor(r[1] * 4) % 4];
  const bob = 2.5 * s * Math.sin(t * wkLoopW(1.1 + r[2]) + i * 2.1), up = Math.sin(t * wkLoopW(0.7 + 0.6 * r[3]) + i * 1.7) > 1 - 2 * wkDef(o.cheer, 0.25);
  const hy = y - 84 * s + bob, sh = y - 62 * s + bob;
  line(c, x - 7 * s, y - 34 * s, x - 8 * s, y, 9 * s, '#2F3A78'); line(c, x + 7 * s, y - 34 * s, x + 8 * s, y, 9 * s, '#2F3A78');
  line(c, x, sh, x, y - 36 * s + bob * 0.5, 28 * s, coat);
  for (const sd of [-1, 1]) {
    if (up) line(c, x + sd * 13 * s, sh, x + sd * 24 * s, sh - 30 * s, 8 * s, coat);
    else line(c, x + sd * 14 * s, sh, x + sd * 17 * s, sh + 26 * s, 8 * s, coat);
  }
  circle(c, x, hy, 13 * s, skin);
  c.beginPath(); c.arc(x, hy - 2 * s, 13.5 * s, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fillStyle = r[0] > 0.5 ? '#2A1B14' : '#5A3A22'; c.fill();
}
// one small wading bird (a flamingo by default): feet at (x, y), about 50 units tall at s = 1; it feeds or stands
function wkWader(c, x, y, s, i, r, t, o = {}) {
  const P = o.pal || { body: '#FF8FB0', leg: '#F0708F', neck: '#FF9DBA' }, fl = r[0] > 0.5 ? 1 : -1, down = r[1] > 0.7;
  const bob = Math.sin(t * wkLoopW(1.1) + i * 2.1);
  line(c, x, y - 12 * s, x, y + 6 * s, 2.4 * s, P.leg);
  ellipse(c, x, y - 16 * s, 11 * s, 7 * s, P.body);
  if (down) line(c, x + fl * 8 * s, y - 16 * s, x + fl * 15 * s, y - 2 * s + bob, 3.4 * s, P.neck);
  else { line(c, x + fl * 8 * s, y - 18 * s, x + fl * 10 * s, y - 34 * s, 3.4 * s, P.neck); circle(c, x + fl * 12 * s, y - 36 * s, 3.6 * s, P.neck); }
}
// A row of small figures between (x0, y) and (x1, y), under the CURRENT transform (apply the layer's camera first).
// o: {x0, x1, y, n: 17, s: 1, seed: 7, jx: 0.65 (how unevenly they stand, in spacings), jy: 16 (px of depth in the row),
//     sv: 0.5 (sizes run s * 0.8 .. s * (0.8 + sv)), mirror: 0..1 (a mirror image under each, for water or a wet floor;
//     0 = none), draw: wkPerson | wkWader | (c, x, y, s, i, r, t, o) => your own figure, feet at (x, y)}
// The far ones are drawn first. A figure under about 10 px is paint (unlit); a bigger one catches the place's light.
function wkCrowd(c, t, o = {}) {
  const n = wkDef(o.n, 17), rf = mulberry32(wkDef(o.seed, 7)), draw = o.draw || wkPerson, jy = wkDef(o.jy, 16), sv = wkDef(o.sv, 0.5), s0 = wkDef(o.s, 1);
  const step = (o.x1 - o.x0) / Math.max(1, n - 1), L = [];
  for (let i = 0; i < n; i++) {
    const r = [rf(), rf(), rf(), rf()], e = rf(), d = rf(), z = rf();
    L.push({ i, r, x: o.x0 + i * step + (e - 0.5) * step * wkDef(o.jx, 0.65), y: o.y + d * jy, s: s0 * (0.8 + sv * z) });
  }
  L.sort((a, b) => a.y - b.y);
  for (const q of L) {
    if (o.mirror > 0.01) wkPaint(() => {
      c.save(); c.globalAlpha = o.mirror; c.translate(0, 2 * q.y); c.scale(1, -1);
      draw(c, q.x, q.y, q.s, q.i, q.r, t, o);
      c.restore();
    });
    draw(c, q.x, q.y, q.s, q.i, q.r, t, o);
  }
}

// ---------------------------------------------------------------- the flash-forward (reference/direction.md, rule 4)
// CAMERA["flash"] = [[t0, seconds, t_from, {win: [cx, cy, r]}]] in make_timeline.py: for `seconds` from t0 the picture
// shows the moment t_from of a LATER shot (the real shot, replayed from part-way in, never a made-up teaser), then goes
// back. Without `win` it fills the frame: a hard cut in and out. With `win` it plays in a round window (centre and
// radius in screen px) over the shot that is running, which goes on underneath: a TEST Short keeps the test on screen.
// Options: zoom (how much of the later picture the window shows: 1 = a square as wide as the frame; 2 = half of that),
// at: [x, y] (the point of the later picture the window centres on; default his face there, else the middle), ring.
// The later shot keeps its own place's light, foreground, particles and the mood of its own moment; captions, the
// handheld drift and the sound stay on the real clock. main.js asks wkFlashAt(t) before it runs the shot.
const wkF = mkCanvas(W, H), wkFx = wkF.getContext('2d', WK_2D);
function wkFlashAt(t) {
  const L = window.TL && window.TL.camera && window.TL.camera.flash;
  if (!L || !L.length) return null;
  for (const e of L) {
    if (t < e[0] - 1e-6 || t >= e[0] + e[1] - 1e-6) continue;
    const t2 = e[2] + (t - e[0]), o = e[3] || {};
    return { t0: e[0], dur: e[1], t: t2, shot: shotAt(t2), win: o.win || null, o };
  }
  return null;
}
// run the later shot at its own time, as itself
function wkFlashRun(ff) {
  if (typeof LK === 'object' && LK) { LK.shot = ff.shot.id; LK.lt = ff.t - ff.shot.start; LK.t = ff.t; }   // its place's light (look.js)
  const post = SC[ff.shot.id](ff.t - ff.shot.start, ff.t, ff.shot) || {};
  const C = (window.TL && window.TL.camera) || {};
  if (post.fg === undefined) post.fg = (C.fg && C.fg[ff.shot.id]) || null;
  if (post.air === undefined) post.air = (C.air && C.air[ff.shot.id]) || null;
  if (post.mood === undefined && typeof cinMoodAt === 'function') post.mood = cinMoodAt(ff.t) || {};
  return post;
}
// the window: draw the later shot first, keep its finished picture, and hand the frame back as main.js started it
function wkFlashGrab(ff, f) {
  ff.ok = false;
  try {
    const post = wkFlashRun(ff);
    if (typeof lookScene === 'function') lookScene(f);
    if (typeof composeGlow === 'function') composeGlow(post.glow === undefined ? 0.85 : post.glow);
    wkFx.setTransform(1, 0, 0, 1, 0, 0); wkFx.globalAlpha = 1; wkFx.filter = 'none';
    wkFx.globalCompositeOperation = 'copy'; wkFx.drawImage(mainC, 0, 0); wkFx.globalCompositeOperation = 'source-over';
    ff.focus = typeof CIN === 'object' && CIN && CIN.hero ? [CIN.hero.x, CIN.hero.y] : null;
    ff.ok = true;
  } catch (e) { /* never let a flash break a frame: the running shot plays on without its window */ }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#05060F'; ctx.fillRect(0, 0, W, H);
  gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.clearRect(0, 0, W / 2, H / 2); gctx.globalAlpha = 1; gctx.globalCompositeOperation = 'source-over';
  if (typeof lookFrameStart === 'function') lookFrameStart(f);
  if (typeof cinemaFrameStart === 'function' && typeof CIN === 'object') { const sT = CIN.sceneT; cinemaFrameStart(f); CIN.sceneT = sT; }
}
// ... and after the running shot is drawn and lit: the later picture in its window (it pops in and out in 3 frames)
function wkFlashWindow(ff, t) {
  if (!ff.ok || !ff.win) return;
  const cx = ff.win[0], cy = ff.win[1], r = ff.win[2], u = t - ff.t0, k = Math.min(clamp(u / 0.1), clamp((ff.dur - u) / 0.1));
  const R = r * E.outBack(clamp(k), 1.7);
  if (R < 4) return;
  const o = ff.o, side = Math.min(W, H) / wkDef(o.zoom, 1.6);
  const fx = o.at ? o.at[0] : ff.focus ? ff.focus[0] : W / 2, fy = o.at ? o.at[1] : ff.focus ? ff.focus[1] : H * 0.45;
  const sx = clamp(fx - side / 2, 0, W - side), sy = clamp(fy - side / 2, 0, H - side);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  circle(ctx, cx, cy, R + 15, '#0B0B1A'); circle(ctx, cx, cy, R + 9, o.ring || '#FFFFFF');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(wkF, sx, sy, side, side, cx - R, cy - R, 2 * R, 2 * R);
  ctx.restore();
}
