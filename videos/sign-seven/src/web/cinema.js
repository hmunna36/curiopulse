// THE CINEMA KIT (7 Nov 2026; reference/visual.md "Camera and light craft", engine.md "The cinema kit").
// The owner, 7 Nov 2026: "use these learnings to improve all other engines too", after Mishapland's Shorts were reworked
// to the camera grammar of Ricks Clips (frame by frame: a new angle at almost every cut, whip pans at story turns, a
// punch-in on the punchline, slight handheld drift on every shot, light that follows the stakes, weather and particles,
// depth in front of the lens). This file is that grammar for the canvas engine. It works on the finished, lit frame, so
// no world file has to know about it, and it costs a few milliseconds a frame.
//
// The plan is one object in make_timeline.py, `CAMERA`, which T.write puts into timeline.json as "camera"
// (timeline_lib.camera_plan checks it and prints a summary). Every time comes from a cue:
//   CAMERA = {
//     "hand":  {"hook": 0.25, "answer": 0.4},   # handheld drift per shot, 0..1 (0 = locked off). Unlisted shots: 0.3
//     "whip":  [[t, 1], [t2, -1]],              # whip pans across the cut at t (a shot's start); 1 = the camera swings right
//     "punch": [[t, 1.2], [t2, 1.15, t_end]],   # punch-ins: zoom in 4 frames at t, held to t_end or to the shot's end
//     "tilt":  [[t0, t1, 3]],                   # dutch tilts when things go wrong: degrees, eased in and out
//     "mood":  [[0, "day"], [t, "shade"], [t2, "warm"], [t3, "day"]],   # the light of the story (MOODS below)
//     "fg":    {"hook": "grass-b", "feel": ["leaves-tr", "bokeh-l"]},  # a foreground layer per shot (FG kinds below)
//     "air":   {"hook": "dust", "swing": {"kind": "dust", "amount": 0.6}},  # particles per shot (AIR kinds below)
//   }
// A shot may override its plan in what it returns: post.hand, post.mood (a name or a mood object), post.fg, post.air,
// post.focus ([x, y] on screen: where a punch-in or a tilt is centred; by default the hero's face).
//
// The order in main.js: the scene draws -> the light (look.js) -> the glow layer -> cinemaScene (mood, particles, the
// foreground layer) -> the scene's own push -> cinemaLens (handheld + punch + tilt + whip, then the whip's smear) ->
// blur, grade, vignette, the lens pass, grain, captions. Captions, the pill and the watermark never move.
'use strict';

const CIN_TL = window.TL || {};
const CIN_ON = CIN_TL.cinema === true;                  // timeline_lib writes it for every Short made from this template
const CIN_CFG = CIN_ON ? (CIN_TL.camera || {}) : {};
const CIN = { hero: null, frame: -1 };
const CIN_HAND_DEFAULT = 0.3;
const cinC = mkCanvas(W, H), cinx = cinC.getContext('2d', typeof CP_CTX2D === 'object' ? CP_CTX2D : {});          // a copy of the frame for the lens
const cinS = mkCanvas(64, H / 2), cinsx = cinS.getContext('2d', typeof CP_CTX2D === 'object' ? CP_CTX2D : {});     // the whip's smear (resized per frame)
const CIN_P = CanvasRenderingContext2D.prototype;
const cinF = mkCanvas(W, H), cinfx = cinF.getContext('2d', typeof CP_CTX2D === 'object' ? CP_CTX2D : {});          // the foreground layer, blurred in one pass
// the kit's own clocks and colour mixing, so it also runs in engines without fx.js's loopW / mixH (the weekly film)
function cinLoopW(w) {
  const D = window.TL && window.TL.duration > 5 ? window.TL.duration : 0, T2 = Math.PI * 2;
  return D ? (T2 * Math.max(1, Math.round((w * D) / T2))) / D : w;
}
function cinMixH(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16), m = (s) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, t));
  return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
}
// sizes of the foreground and particles: the Shorts' 1080x1920 frame is 1; a 1920x1080 film draws them smaller
const CIN_U = Math.min(1, H / 1920 + 0.25);

// ---------------------------------------------------------------- where the hero's face is (any look)
// drawCharacter is wrapped once: after each call we know where his head landed on screen and how big it is, so a
// punch-in, a tilt and the mood's light pool centre on his face without any help from the scene.
const CIN_drawCharacter0 = drawCharacter;
drawCharacter = function (c, st, t, pal) {
  const r = CIN_drawCharacter0(c, st, t, pal);
  try {
    if (r && r.head && (c === ctx || c === lctx)) {
      const m = CIN_P.getTransform.call(c);
      const hx = st.x + (r.head[0] + (st.headDX || 0)) * st.s, hy = st.y + (r.head[1] + (st.headDY || 0)) * st.s;
      const p = m.transformPoint(new DOMPoint(hx, hy)), sc = Math.hypot(m.a, m.b) * st.s;
      if (p.x > -200 && p.x < W + 200 && p.y > -200 && p.y < H + 200 && (!CIN.hero || sc > CIN.hero.sc)) CIN.hero = { x: p.x, y: p.y, sc };
    }
  } catch (e) { /* never let the kit break a frame */ }
  return r;
};

// ---------------------------------------------------------------- the plan at time t
function cinShotStart(t) { const s = shotAt(t); return s ? s.start : 0; }
function cinShotEnd(t) { const s = shotAt(t); return s ? s.end : TLd.duration; }
function cinHand(shot, post) {
  if (post && typeof post.hand === 'number') return post.hand;
  const h = CIN_CFG.hand;
  if (typeof h === 'number') return h;
  if (h && shot && typeof h[shot.id] === 'number') return h[shot.id];
  return CIN_HAND_DEFAULT;
}
// a punch-in: 1 before it, k after 4 frames (a small overshoot), held to its end or to the end of its shot
function cinPunch(t) {
  let k = 1;
  for (const p of CIN_CFG.punch || []) {
    const t0 = p[0], z = p[1] || 1.2, t1 = p[2] !== undefined && p[2] !== null ? p[2] : cinShotEnd(t0 + 0.01);
    if (t < t0 || t >= t1) continue;
    const u = clamp((t - t0) / (4 / FPS));
    const e = u < 1 ? E.outBack(u, 1.6) : 1;
    // a punch that ends before its shot does eases back out over 6 frames
    const out = p[2] !== undefined && p[2] !== null ? clamp((t1 - t) / (6 / FPS)) : 1;
    k *= 1 + (z - 1) * e * E.inOutSine(out);
  }
  return k;
}
function cinTilt(t) {
  let d = 0;
  for (const p of CIN_CFG.tilt || []) {
    const [t0, t1, deg] = p;
    if (t < t0 - 0.01 || t > t1 + 0.25) continue;
    const kin = ramp(t, t0, t0 + 0.22, E.outCubic), kout = 1 - ramp(t, t1, t1 + 0.25, E.inOutSine);
    d += (deg || 3) * Math.min(kin, kout);
  }
  return (d * Math.PI) / 180;
}
// whip pans: the outgoing shot swings away for `half` frames before the cut, the incoming one swings in after it.
// Returns the frame's slide in px (signed) and its speed (0..1) for the smear.
function cinWhip(f) {
  for (const w of CIN_CFG.whip || []) {
    const at = Math.round(w[0] * FPS), dir = w[1] === -1 ? -1 : 1, half = w[2] || 5, hin = Math.max(3, half - 1), D = W * 0.62;
    if (f >= at - half && f < at) { const u = (f - (at - half) + 1) / half; return { dx: -dir * D * u * u, v: u }; }
    if (f >= at && f < at + hin) { const u = 1 - (f - at + 1) / (hin + 1); return { dx: dir * D * u * u, v: u }; }
  }
  return null;
}

// ---------------------------------------------------------------- moods: the light follows the stakes
// CurioPulse's colours are VIBRANT, and a mood never takes that away (owner, 7 Nov 2026: "no, the before's colours were
// vibrant", on the first version, whose moods greyed and darkened the frame: up to 18 % less saturated, up to 24 %
// darker). So a mood moves the COLOUR of the light, never its richness: a soft-light tint in a saturated colour (weaker
// round his face, by `keep`), a sky-end tint (`top`), then one filter pass, `saturate(sat) brightness(bright)`, tuned so
// the frame stays at least as saturated as drawn (measured on lick-elbow's frames, 7 Nov 2026: shade +5..+9 %, warm
// +1..+5 %, dusk 0..+5 %, night +7..+12 %, storm +5..+9 %, cold +5..+8 %) and only as much darker as the mood means
// (shade -4 %, storm -8 %, night -13 %; warm +3 %). No grey wash, no screen lift. Only `spot` darkens the edges (pool).
const MOODS = {
  day: {},
  shade: { tint: '#3D6BFF', tintA: 0.30, keep: 0.45, sat: 1.04, bright: 0.93 },                              // a cloud over the sun
  dusk: { tint: '#FF6A2E', tintA: 0.28, keep: 0.45, top: '#B04DFF', topA: 0.26, sat: 1.36, bright: 0.93 },   // a low sun, a violet sky end
  night: { tint: '#2E4BFF', tintA: 0.40, keep: 0.5, top: '#1C2CFF', topA: 0.24, sat: 1.0, bright: 0.84 },     // moonlight, deep blue
  storm: { tint: '#2F6BFF', tintA: 0.32, keep: 0.5, top: '#283A80', topA: 0.24, sat: 1.0, bright: 0.90 },     // trouble peaks
  warm: { tint: '#FFA028', tintA: 0.26, keep: 0.4, sat: 1.23, bright: 0.98 },                                // the reveal: golden
  cold: { tint: '#33C2FF', tintA: 0.26, keep: 0.45, sat: 1.03, bright: 0.96 },                               // a chill, a shock
  spot: { tint: '#2A3A9A', tintA: 0.20, keep: 0.9, sat: 1.12, bright: 1.0, pool: 0.42 },                     // everything else falls away
};
const CIN_MOOD_KEYS = ['tintA', 'keep', 'topA', 'sat', 'bright', 'pool'];
const CIN_MOOD_DEF = { tintA: 0, keep: 0.45, topA: 0, sat: 1, bright: 1, pool: 0 };
function cinMoodObj(m) { return typeof m === 'string' ? (MOODS[m] || {}) : (m || {}); }
function cinMoodMix(a, b, k) {
  const A = cinMoodObj(a), B = cinMoodObj(b), o = {};
  for (const key of CIN_MOOD_KEYS) o[key] = lerp(A[key] === undefined ? CIN_MOOD_DEF[key] : A[key], B[key] === undefined ? CIN_MOOD_DEF[key] : B[key], k);
  // a colour that only one side has keeps its hue while its amount fades
  for (const key of ['tint', 'top']) o[key] = A[key] && B[key] ? cinMixH(A[key], B[key], k) : (A[key] || B[key]);
  return o;
}
const CIN_MOOD_FADE = 0.45;        // seconds a mood takes to change (a cut inside it makes it read as the light changing)
function cinMoodAt(t) {
  const list = CIN_CFG.mood || [];
  if (!list.length) return null;
  let i = -1;
  for (let j = 0; j < list.length; j++) if (t >= list[j][0]) i = j;
  if (i < 0) return cinMoodObj(list[0][1]);
  const cur = list[i], prev = i > 0 ? list[i - 1] : null, fade = cur[2] || CIN_MOOD_FADE;
  if (!prev || t >= cur[0] + fade) return cinMoodObj(cur[1]);
  return cinMoodMix(prev[1], cur[1], E.inOutSine(clamp((t - cur[0]) / fade)));
}
function cinFocus(post) {
  if (post && post.focus) return { x: post.focus[0], y: post.focus[1], sc: post.focus[2] || 1 };
  if (CIN.hero) return CIN.hero;
  return { x: W / 2, y: H * 0.42, sc: 1 };
}
function cinGrade(m, F) {
  if (!m) return;
  const tintA = m.tintA || 0, topA = m.topA || 0, sat = m.sat === undefined ? 1 : m.sat, bright = m.bright === undefined ? 1 : m.bright;
  const pool = m.pool || 0, keep = m.keep === undefined ? 0.45 : m.keep;
  if (tintA < 0.004 && topA < 0.004 && Math.abs(sat - 1) < 0.004 && Math.abs(bright - 1) < 0.004 && pool < 0.004) return;
  const x = ctx;
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; x.globalAlpha = 1;
  const r0 = clamp(260 * F.sc, 180, 900), r1 = clamp(1500 * Math.max(0.6, F.sc), 900, 2400);
  if (m.tint && tintA > 0.004) {            // the light's colour: weaker round his face
    const g = x.createRadialGradient(F.x, F.y, r0 * 0.4, F.x, F.y, r0 * 2.4);
    g.addColorStop(0, rgba(m.tint, tintA * (1 - keep))); g.addColorStop(1, rgba(m.tint, tintA));
    x.globalCompositeOperation = 'soft-light'; x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  if (m.top && topA > 0.004) {              // the sky end of the frame
    const g = x.createLinearGradient(0, 0, 0, H * 0.75);
    g.addColorStop(0, rgba(m.top, topA)); g.addColorStop(1, rgba(m.top, 0));
    x.globalCompositeOperation = 'soft-light'; x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  if (pool > 0.004) {                       // spot only: the edges fall away in a deep blue, never grey
    const g = x.createRadialGradient(F.x, F.y + 0.3 * r0, r0, F.x, F.y + 0.3 * r0, r1);
    g.addColorStop(0, 'rgba(10,14,60,0)'); g.addColorStop(1, `rgba(10,14,60,${clamp(pool)})`);
    x.globalCompositeOperation = 'source-over'; x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  if (Math.abs(sat - 1) > 0.004 || Math.abs(bright - 1) > 0.004) {   // richness back (at least as drawn), and the mood's darkness
    cinx.setTransform(1, 0, 0, 1, 0, 0); cinx.globalCompositeOperation = 'copy'; cinx.filter = 'none'; cinx.drawImage(mainC, 0, 0);
    cinx.globalCompositeOperation = 'source-over';
    x.globalCompositeOperation = 'copy'; x.filter = `saturate(${sat.toFixed(3)}) brightness(${bright.toFixed(3)})`;
    x.drawImage(cinC, 0, 0);
    x.filter = 'none';
  }
  x.restore();
}

// ---------------------------------------------------------------- handheld drift
// A smooth, never-repeating wander (a sum of sines on loop-safe clocks, so the last frame lines up with frame 0) in
// whole pixels: a whole-pixel move copies the picture exactly, so the drift never softens it.
const CIN_HAND_PX = 24;            // px of drift at amount 1 (0.25 calm ~6 px, 0.35 tense ~8 px, 0.6 chaos ~14 px)
function cinHandXY(t, amt) {
  if (amt <= 0) return [0, 0];
  const a = amt * CIN_HAND_PX;
  const nx = Math.sin(t * cinLoopW(1.13) + 0.4) * 0.6 + Math.sin(t * cinLoopW(2.71) + 1.9) * 0.3 + Math.sin(t * cinLoopW(5.3) + 0.7) * 0.1;
  const ny = Math.sin(t * cinLoopW(0.91) + 2.2) * 0.6 + Math.sin(t * cinLoopW(2.33) + 0.3) * 0.3 + Math.sin(t * cinLoopW(4.7) + 4.1) * 0.1;
  return [a * nx, a * ny * 0.75];
}

// ---------------------------------------------------------------- particles in the air
// Screen-space, deterministic per frame, in three depths (near ones big, soft and fast). Every clock is loop-safe.
// Kinds: dust (motes in low sun), pollen, haze (big soft light blobs), rain, drizzle, snow, embers (rising sparks),
// sparkle (twinkles), spray. {kind, amount 0..1, color, wind: px/s}
const AIR = {
  dust: { n: 46, col: '#FFE7B0', r: [2.5, 7], v: [6, 22], rise: -6, glow: 0.55, a: 0.55 },
  pollen: { n: 40, col: '#FFF0A0', r: [2, 6], v: [10, 30], rise: -10, glow: 0.45, a: 0.6 },
  haze: { n: 9, col: '#FFF4D8', r: [90, 220], v: [4, 10], rise: -3, glow: 0.0, a: 0.07 },
  embers: { n: 34, col: '#FFA04A', r: [2, 5], v: [10, 26], rise: -120, glow: 0.9, a: 0.9 },
  sparkle: { n: 26, col: '#FFFFFF', r: [3, 7], v: [0, 6], rise: 0, glow: 0.8, a: 0.9 },
  snow: { n: 70, col: '#FFFFFF', r: [3, 8], v: [10, 30], rise: 90, glow: 0.0, a: 0.85 },
  rain: { n: 120, col: '#C9D8F2', r: [1.5, 3], v: [40, 60], rise: 1500, glow: 0.0, a: 0.5, streak: 1 },
  drizzle: { n: 70, col: '#C9D8F2', r: [1, 2], v: [30, 40], rise: 900, glow: 0.0, a: 0.35, streak: 1 },
  spray: { n: 50, col: '#F2FBFF', r: [2, 6], v: [40, 120], rise: -60, glow: 0.2, a: 0.8 },
};
function cinLoopV(v, span) { const D = TLd.duration > 5 ? TLd.duration : 0; return D ? (span * Math.round((v * D) / span)) / D : v; }
function cinAir(spec, t) {
  if (!spec) return;
  for (const s of Array.isArray(spec) ? spec : [spec]) {
    const o = typeof s === 'string' ? { kind: s } : s, K = AIR[o.kind];
    if (!K) continue;
    const n = Math.round(K.n * clamp(o.amount === undefined ? 1 : o.amount, 0, 2)), col = o.color || K.col, wind = o.wind || 0;
    const x = ctx;
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none';
    for (let i = 0; i < n; i++) {
      const h1 = hash(i * 3.1 + 11), h2 = hash(i * 7.7 + 3), h3 = hash(i * 1.9 + 29), z = 0.25 + 0.75 * hash(i * 5.3 + 7);
      const r = lerp(K.r[0], K.r[1], z) * (o.size || 1) * CIN_U;
      const vx = cinLoopV((lerp(K.v[0], K.v[1], h3) + wind) * (0.4 + 0.6 * z), W + 200);
      const vy = cinLoopV(K.rise * (0.5 + 0.5 * z), H + 200);
      const px = ((h1 * (W + 200) + vx * t + 18 * Math.sin(t * cinLoopW(0.6 + h2) + i)) % (W + 200) + (W + 200)) % (W + 200) - 100;
      const py = ((h2 * (H + 200) + vy * t + 14 * Math.sin(t * cinLoopW(0.45 + h1) + 2 * i)) % (H + 200) + (H + 200)) % (H + 200) - 100;
      const tw = o.kind === 'sparkle' ? Math.max(0, Math.sin(t * cinLoopW(2 + 3 * h3) + 9 * i)) : 0.65 + 0.35 * Math.sin(t * cinLoopW(1.3 + h3) + 5 * i);
      const a = K.a * tw * (0.45 + 0.55 * z) * (o.alpha || 1);
      if (a < 0.01) continue;
      if (K.streak) {
        x.globalCompositeOperation = 'source-over';
        line(x, px, py, px - (wind * 0.03), py - 26 * z - 10, r, rgba(col, a));
        continue;
      }
      if (o.kind === 'sparkle') {
        x.globalCompositeOperation = 'lighter';
        const L = r * 2.6 * tw;
        line(x, px - L, py, px + L, py, 1.6, rgba(col, a)); line(x, px, py - L, px, py + L, 1.6, rgba(col, a));
        softDot(x, px, py, r * 2, col, 0.5 * a);
        continue;
      }
      x.globalCompositeOperation = K.glow > 0 ? 'lighter' : 'source-over';
      softDot(x, px, py, r * (K.glow > 0 ? 2.2 : 1.4), col, a);
      if (K.glow > 0) softDot(x, px, py, r * 5, col, a * 0.18 * K.glow);
    }
    x.restore();
  }
}

// ---------------------------------------------------------------- the foreground layer: depth in front of the lens
// Dark, out-of-focus shapes at the frame's edges, as if they stood between the camera and the hero: grass at the bottom,
// leaves hanging in from a top corner, a rock, a post or the bars of a gate at one side, bokeh of lamps or glints.
// They move a little MORE than the picture does (handheld x 1.8 and a slow drift), so the eye reads depth. They stay in
// the corners and edges: never over his face or the key action, never inside the caption band (y 1180-1480) in the middle.
// kind-side: grass-b / grass-bl / grass-br, leaves-tl / leaves-tr, branch-tl / branch-tr, rock-bl / rock-br,
// post-l / post-r, bars-l / bars-r, bokeh-l / bokeh-r / bokeh-t, frame (both sides dark, like looking through a gap).
// {kind: 'grass-b', col: '#0B1A12', k: 0..1 (it slides in), blur: px}
function cinFgShapes(x, kind, side, col, t, P) {
  const R = (i) => hash(i * 12.9898 + kind.length * 78.233);
  if (kind === 'grass') {
    const xs = side === 'bl' ? [-80, 420] : side === 'br' ? [660, 1160] : [-80, 1160];
    const g = x.createLinearGradient(0, H - 420, 0, H);
    g.addColorStop(0, (P && P.lit) || '#3C6E2E'); g.addColorStop(1, x.fillStyle);
    x.fillStyle = g;
    for (let i = 0; i < 46; i++) {
      const bx = lerp(xs[0], xs[1], R(i)), h = 140 + 260 * R(i + 50) * (side === 'b' ? (0.55 + 0.9 * Math.abs(bx - 540) / 620) : 1);
      const sway = 0.07 * Math.sin(t * cinLoopW(1.2) + i * 0.7) + 0.25 * (R(i + 9) - 0.5), w = 14 + 16 * R(i + 77);
      const tipx = bx + Math.sin(sway) * h, tipy = H + 30 - Math.cos(sway) * h;
      x.beginPath(); x.moveTo(bx - w, H + 40); x.quadraticCurveTo(bx + (tipx - bx) * 0.4, H - h * 0.5, tipx, tipy);
      x.quadraticCurveTo(bx + (tipx - bx) * 0.45 + w * 0.3, H - h * 0.45, bx + w, H + 40); x.closePath(); x.fill();
    }
  } else if (kind === 'leaves' || kind === 'branch') {
    const sx = side === 'tl' ? -1 : 1, ox = side === 'tl' ? -30 : W + 30, oy = 330;
    x.save(); x.translate(ox, oy); x.scale(sx, 1); x.rotate(0.05 * Math.sin(t * cinLoopW(0.7)));
    x.lineCap = 'round'; x.strokeStyle = '#2A2118'; x.lineWidth = 24;
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-180, 60, -330, 230); x.stroke();
    x.lineWidth = 14; x.beginPath(); x.moveTo(-150, 70); x.quadraticCurveTo(-210, 190, -190, 330); x.stroke();
    const n = kind === 'leaves' ? 30 : 14, base = x.fillStyle;
    for (let i = 0; i < n; i++) {
      const u = R(i), lx = -30 - 290 * u, ly = 10 + 220 * u * u + 80 * (R(i + 30) - 0.5), a = -0.9 + 1.9 * R(i + 60) + 0.12 * Math.sin(t * cinLoopW(1.1) + i);
      const L = 70 + 40 * R(i + 6), w = 22 + 12 * R(i + 5);
      x.save(); x.translate(lx, ly); x.rotate(a);
      x.fillStyle = R(i + 90) < 0.3 ? (P && P.lit) || '#3E7330' : base;          // a few leaves catch the light
      x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(w, L * 0.45, 0, L); x.quadraticCurveTo(-w, L * 0.45, 0, 0); x.fill();
      x.restore();
    }
    x.restore();
  } else if (kind === 'rock') {
    const cx = side === 'bl' ? 40 : W - 40;
    x.beginPath(); x.ellipse(cx, H + 60, 330, 250, side === 'bl' ? 0.15 : -0.15, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(cx + (side === 'bl' ? 230 : -230), H + 120, 180, 150, 0, 0, Math.PI * 2); x.fill();
  } else if (kind === 'post' || kind === 'bars') {
    const sx = side === 'l' ? 1 : -1, x0 = side === 'l' ? 0 : W;
    if (kind === 'post') { x.fillRect(side === 'l' ? -40 : W - 110, -50, 150, H + 100); }
    else for (let i = 0; i < 3; i++) x.fillRect(x0 + sx * (10 + i * 70) - (sx < 0 ? 34 : 0), -50, 34, H + 100);
  } else if (kind === 'frame') {
    x.beginPath(); x.ellipse(-120, H * 0.5, 260, H * 0.62, 0, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(W + 120, H * 0.5, 260, H * 0.62, 0, 0, Math.PI * 2); x.fill();
  }
}
function cinFg(spec, t, hand) {
  if (!spec) return;
  for (const s of Array.isArray(spec) ? spec : [spec]) {
    const o = typeof s === 'string' ? { kind: s } : s, [kind, side = 'b'] = String(o.kind).split('-');
    const k = clamp(o.k === undefined ? 1 : o.k);
    if (k <= 0.01) continue;
    const x = ctx;
    // depth: it moves more than the frame does, and drifts slowly (a dolly), and slides in from its edge with k
    const dx = 0.8 * hand[0] + 16 * Math.sin(t * cinLoopW(0.35) + kind.length), dy = 0.8 * hand[1] + 6 * Math.sin(t * cinLoopW(0.27) + 1);
    const slide = (1 - E.outCubic(k)) * 260, sl = { l: [-slide, 0], r: [slide, 0], bl: [0, slide], br: [0, slide], b: [0, slide], tl: [-slide, -slide * 0.3], tr: [slide, -slide * 0.3], t: [0, -slide] }[side] || [0, 0];
    if (kind === 'bokeh') {
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.translate(dx + sl[0], dy + sl[1]);
      x.globalCompositeOperation = 'lighter';
      const col = o.col || '#FFD9A0', xs = side === 'l' ? [-60, 240] : side === 'r' ? [840, 1140] : [80, 1000], ys = side === 't' ? [380, 700] : [420, 1720];
      for (let i = 0; i < 9; i++) {
        const bx = lerp(xs[0], xs[1], hash(i * 4.1 + 2)), by = lerp(ys[0], ys[1], hash(i * 6.3 + 8)), r = 40 + 70 * hash(i * 2.7 + 1);
        const a = (0.10 + 0.12 * hash(i + 3)) * (0.8 + 0.2 * Math.sin(t * cinLoopW(0.8 + hash(i)) + i));
        x.fillStyle = rgba(col, a); x.beginPath(); x.arc(bx, by, r, 0, Math.PI * 2); x.fill();
        x.lineWidth = 3; x.strokeStyle = rgba(col, a * 1.6); x.stroke();
      }
      x.restore(); continue;
    }
    // plants are a deep green with a lighter green where the light catches them; posts, bars and rocks a dark grey-brown
    const plant = kind === 'grass' || kind === 'leaves' || kind === 'branch', f = cinfx;
    f.setTransform(1, 0, 0, 1, 0, 0); f.globalAlpha = 1; f.globalCompositeOperation = 'source-over'; f.filter = 'none';
    f.clearRect(0, 0, W, H);
    f.translate(dx + sl[0], dy + sl[1]);
    if (CIN_U < 1) {                 // smaller in a wide frame, shrunk toward its own edge or corner
      const an = { b: [W / 2, H], bl: [0, H], br: [W, H], tl: [0, 0], tr: [W, 0], l: [0, H / 2], r: [W, H / 2], t: [W / 2, 0] }[side] || [W / 2, H];
      f.translate(an[0], an[1]); f.scale(CIN_U, CIN_U); f.translate(-an[0], -an[1]);
    }
    f.fillStyle = o.col || (plant ? '#15301A' : '#1A1716');
    cinFgShapes(f, kind, side, o.col, t, { lit: o.lit || (plant ? '#3E7330' : '#3A3330') });
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over';
    x.filter = `blur(${o.blur === undefined ? 6 : o.blur}px)`;
    x.globalAlpha = o.alpha === undefined ? 0.94 : o.alpha;
    x.drawImage(cinF, 0, 0);
    x.restore();
  }
}

// ---------------------------------------------------------------- the two moments main.js calls
function cinemaFrameStart(f) { CIN.hero = null; CIN.frame = f; CIN.sceneT = null; }
// HITSTOP (8 Nov 2026, the video-quality research): on a punchline's impact the action freezes for a few frames while the
// camera keeps shaking, then snaps on. CAMERA["hit"] = [[t, frames]] (2-6 frames; 4 reads as a hit). main.js asks for the
// scene's clock here; captions, the drift, particles and the lens keep the real one.
function cinHitT(t) {
  if (!CIN_ON) return t;
  for (const h of CIN_CFG.hit || []) {
    const t0 = h[0], n = h[1] || 4;
    if (t >= t0 && t < t0 + n / FPS) { CIN.sceneT = t0; return t0; }
  }
  return t;
}
function cinHitShake(t) {
  for (const h of CIN_CFG.hit || []) {
    const t0 = h[0], n = h[1] || 4, u = (t - t0) * FPS;
    if (u < 0 || u > n + 5) continue;
    const a = 11 * (u < n ? 1 : Math.max(0, 1 - (u - n) / 5)), fr = Math.floor(u);
    return [a * (hash(fr * 3.1 + t0) * 2 - 1), a * 0.8 * (hash(fr * 7.7 + t0) * 2 - 1)];
  }
  return [0, 0];
}
// after the scene is lit and its glow is on: the mood, the particles, the foreground layer
function cinemaScene(t, shot, post) {
  if (!CIN_ON) return;
  const plan = (k) => (post && post[k] !== undefined ? post[k] : CIN_CFG[k] && shot ? CIN_CFG[k][shot.id] : undefined);
  const F = cinFocus(post);
  const m = post && post.mood !== undefined ? cinMoodObj(post.mood) : cinMoodAt(t);
  cinGrade(m, F);
  cinAir(plan('air'), t);
  cinFg(plan('fg'), t, cinHandXY(t, cinHand(shot, post)));
}
// the lens: handheld, punch-in, tilt and whip as one move of the finished frame, then the whip's smear
function cinemaLens(t, shot, post) {
  if (!CIN_ON) return;
  const f = Math.round(t * FPS);
  const hd = cinHandXY(t, cinHand(shot, post)), k = cinPunch(t), th = cinTilt(t), wp = cinWhip(f);
  const hs = cinHitShake(t); hd[0] += hs[0]; hd[1] += hs[1];
  const hx = Math.round(hd[0]), hy = Math.round(hd[1]);
  if (!wp && Math.abs(k - 1) < 1e-4 && Math.abs(th) < 1e-5 && !hx && !hy) return;
  const F = cinFocus(post);
  cinx.setTransform(1, 0, 0, 1, 0, 0); cinx.globalCompositeOperation = 'copy'; cinx.drawImage(mainC, 0, 0); cinx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (Math.abs(k - 1) < 1e-4 && Math.abs(th) < 1e-5 && !wp) {
    ctx.drawImage(cinC, hx, hy);                    // whole pixels: an exact copy, moved (what it uncovers keeps its own pixels)
  } else {
    // a tilt is zoomed just enough that the corners it uncovers stay under the phone's crop and the app's bands
    const kz = k * (1 + 0.55 * Math.abs(th));
    ctx.translate(F.x + hd[0] + (wp ? wp.dx : 0), F.y + hd[1]);
    if (th) ctx.rotate(th);
    ctx.scale(kz, kz);
    ctx.translate(-F.x, -F.y);
    ctx.drawImage(cinC, 0, 0);
    if (wp) ctx.drawImage(cinC, wp.dx > 0 ? -W / kz : W / kz, 0);   // the whip wraps the picture round, the smear hides the seam
  }
  ctx.restore();
  if (wp && wp.v > 0.02) cinSmear(W * 0.42 * wp.v, wp.v);
  // camera motion blur (8 Nov 2026, the video-quality research): a punch-in streaks outward from his face while it
  // zooms, a tilt smears round him while it turns, as a real lens would; nothing while the camera holds still
  const dk = k - cinPunch(t - 1 / FPS), dth = th - cinTilt(t - 1 / FPS);
  // a half-open shutter: the blur covers half of the frame-to-frame move, so his face (the centre) stays sharp
  if (Math.abs(dk) > 0.004 && typeof zoomBlur === 'function') zoomBlur(clamp(Math.abs(dk) * 0.55, 0, 0.045), F.x, F.y);
  if (Math.abs(dth) > 0.0015) cinRotBlur(dth * 0.5, F);
}
// a rotational smear about F over the angle the frame turned since the last frame (progressive average of 8 copies)
function cinRotBlur(dth, F) {
  cinx.setTransform(1, 0, 0, 1, 0, 0); cinx.globalCompositeOperation = 'copy'; cinx.filter = 'none'; cinx.drawImage(mainC, 0, 0);
  cinx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  const n = 8;
  for (let i = 1; i < n; i++) {
    const a = -dth * (i / (n - 1)) * 0.9;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(F.x, F.y); ctx.rotate(a); ctx.translate(-F.x, -F.y);
    ctx.globalAlpha = 1 / (i + 1);
    ctx.drawImage(cinC, 0, 0);
  }
  ctx.restore();
}
// a smooth horizontal smear of about `px` pixels (squeeze the frame thin, then stretch it back), blended in by `mix`
function cinSmear(px, mix) {
  const n = Math.max(6, Math.round(W / Math.max(2, px / 2.2)));
  if (cinS.width !== n) cinS.width = n;
  cinsx.setTransform(1, 0, 0, 1, 0, 0); cinsx.imageSmoothingEnabled = true; cinsx.imageSmoothingQuality = 'high';
  cinsx.clearRect(0, 0, n, cinS.height);
  cinsx.filter = 'blur(1.2px)';
  cinsx.drawImage(mainC, 0, 0, n, cinS.height);
  cinsx.filter = 'none';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.globalAlpha = clamp(0.35 + 0.75 * mix); ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(cinS, 0, 0, W, H);
  ctx.restore();
}
