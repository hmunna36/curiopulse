// Sun-sneeze Short: the street outside the cinema, late afternoon. World coords: ground at y = ST.G, the hero at s = 1
// (540 tall). The cinema wall is in shade (plum), the marquee throws a shadow on the pavement up to x = ST.shadeX, and
// everything right of it is in hard, warm sunlight. The sun itself sits top right in screen space (a little parallax).
'use strict';

const ST = { G: 1500, dx0: 200, dx1: 500, dTop: 900, shadeX: 600, wallX: 780, mx0: 40, mx1: 680, my0: 590, my1: 730 };
let ST_BLD = null;
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);

function initStreet() {
  const rng = mulberry32(31);
  ST_BLD = [...Array(8)].map((_, i) => ({ x: 720 + i * 190 + rng() * 50, w: 150 + rng() * 90, h: 420 + rng() * 460, k: i % 3, cols: 2 + Math.floor(rng() * 3) }));
}

// ---------------------------------------------------------------- sky + sun
function sunPos(cam) { return [930 - (cam.x - 540) * 0.05, 440 - (cam.y - 1200) * 0.05]; }
function streetSky() {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#10205E'); g.addColorStop(0.28, '#2A5CC0'); g.addColorStop(0.56, '#79AEEA'); g.addColorStop(0.74, '#FFD6A0'); g.addColorStop(1, '#F0A86E');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// the sun: k = how hard it glares (0 = behind the marquee, 1 = in his eyes, > 1 = a sneeze's worth)
function sunDraw(cam, t, k) {
  if (k <= 0.01) return;
  const [sx, sy] = sunPos(cam);
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(sx, sy, 10, sx, sy, 760);
  g.addColorStop(0, `rgba(255,236,170,${0.42 * Math.min(k, 1.3)})`); g.addColorStop(0.25, `rgba(255,190,96,${0.17 * Math.min(k, 1.3)})`); g.addColorStop(1, 'rgba(255,170,80,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // rays: long thin wedges, turning slowly
  ctx.translate(sx, sy);
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + t * 0.07 + 0.3 * hash(i), L = (520 + 420 * hash(i + 3)) * (0.7 + 0.3 * Math.min(k, 1.4)), w = 0.035 + 0.03 * hash(i + 9);
    const gr = ctx.createLinearGradient(0, 0, Math.cos(a) * L, Math.sin(a) * L);
    gr.addColorStop(0, `rgba(255,232,170,${0.13 * Math.min(k, 1.4)})`); gr.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * L, Math.sin(a - w) * L); ctx.lineTo(Math.cos(a + w) * L, Math.sin(a + w) * L); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  circle(ctx, sx, sy, 62, '#FFF6D8'); circle(ctx, sx, sy, 50, '#FFFFFF');
  softDot(gctx, sx, sy, 210, '#FFD98A', 0.42 * Math.min(k, 1.2)); circle(gctx, sx, sy, 52, 'rgba(255,244,210,0.8)');
  // lens ghosts toward the middle of the frame
  for (const [f, r, col, a] of [[0.35, 34, '#FFB06A', 0.2], [0.6, 60, '#9FD0FF', 0.12], [0.95, 26, '#FFE08A', 0.2]]) {
    const gx = lerp(sx, 430, f), gy = lerp(sy, 1150, f);
    softDot(ctx, gx, gy, r * 2, col, a * Math.min(k, 1.3)); softDot(gctx, gx, gy, r * 2.4, col, a * 0.8 * Math.min(k, 1.3));
  }
}

// ---------------------------------------------------------------- the street (camera space)
// o: {door: 0 shut .. 1 flung open, lit: marquee bulbs 0..1, flick: sign flicker 0..1, inside: glow from the foyer}
function streetBack(cam, t, o = {}) {
  streetSky();
  // far buildings, hazy, with parallax
  const pc = { x: lerp(540, cam.x, 0.55), y: lerp(1200, cam.y, 0.8), zoom: cam.zoom, rot: 0, sx: cam.sx, sy: cam.sy };
  applyCam(pc);
  for (const b of ST_BLD) {
    const g = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
    g.addColorStop(0, ['#6F86C8', '#7A7FC4', '#8792CC'][b.k]); g.addColorStop(0.75, ['#8FA2DA', '#9A98D6', '#A3AEDD'][b.k]); g.addColorStop(1, '#FFD9B0');
    ctx.fillStyle = g; ctx.fillRect(b.x, ST.G - b.h, b.w, b.h + 40);
    for (let r = 0; r < Math.floor(b.h / 78) - 1; r++) for (let q = 0; q < b.cols; q++)
      { ctx.fillStyle = (r * 3 + q + b.k) % 4 ? 'rgba(40,52,110,0.42)' : 'rgba(255,226,170,0.75)'; ctx.fillRect(b.x + 18 + q * (b.w - 36) / b.cols, ST.G - b.h + 30 + r * 78, (b.w - 36) / b.cols - 14, 44); }
  }
  applyCam(cam);
  const c = ctx, G = ST.G;
  // pavement: shade by the cinema, hard sun beyond the marquee's shadow
  c.fillStyle = '#40345C'; c.fillRect(-900, G, 3200, 900);
  c.beginPath(); c.moveTo(ST.shadeX, G); c.lineTo(2400, G); c.lineTo(2400, G + 900); c.lineTo(ST.shadeX - 330, G + 900); c.closePath();
  const pg = c.createLinearGradient(ST.shadeX - 200, 0, 1500, 0); pg.addColorStop(0, '#D9A878'); pg.addColorStop(1, '#F2C690');
  c.fillStyle = pg; c.fill();
  c.fillStyle = 'rgba(30,18,50,0.5)'; c.fillRect(-900, G, 3200, 14);                            // the kerb's shadow line
  for (let i = -3; i < 12; i++) line(c, 150 + i * 240, G + 14, 150 + i * 240 - 120, G + 420, 3, 'rgba(30,18,50,0.22)');   // paving joints
  line(c, -900, G + 150, 2400, G + 150, 3, 'rgba(30,18,50,0.18)');
  // the cinema wall (in shade) with a sunlit corner
  const wg = c.createLinearGradient(0, 300, 0, G); wg.addColorStop(0, '#4A2A66'); wg.addColorStop(1, '#2C1A44');
  c.fillStyle = wg; c.fillRect(-900, -200, 900 + ST.wallX, G + 200);
  const cg = c.createLinearGradient(ST.wallX - 90, 0, ST.wallX, 0); cg.addColorStop(0, 'rgba(255,170,120,0)'); cg.addColorStop(1, 'rgba(255,190,130,0.75)');
  c.fillStyle = cg; c.fillRect(ST.wallX - 90, -200, 90, G + 200);
  for (let y = 380; y < G - 70; y += 74) line(c, -900, y, ST.wallX, y, 2, 'rgba(20,10,40,0.2)');   // courses
  c.fillStyle = '#231438'; c.fillRect(-900, G - 64, 900 + ST.wallX, 64);                         // plinth
  // posters either side of the doors
  for (const [px, kind] of [[36, 0], [560, 1]]) {
    rrect(c, px - 8, 1000 - 8, 146, 316, 10); c.fillStyle = '#C9A24A'; c.fill();
    c.fillStyle = kind ? '#132A52' : '#3A1030'; c.fillRect(px, 1000, 130, 300);
    if (kind) { ellipse(c, px + 65, 1120, 46, 30, '#EAF2FF'); circle(c, px + 65, 1120, 20, '#3F7FD8'); circle(c, px + 65, 1120, 9, '#0B0B1A'); }
    else { circle(c, px + 65, 1110, 44, '#FFB23A'); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; line(c, px + 65 + Math.cos(a) * 56, 1110 + Math.sin(a) * 56, px + 65 + Math.cos(a) * 72, 1110 + Math.sin(a) * 72, 7, '#FFB23A'); } }
    for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(px + 18, 1206 + i * 26, 94 - i * 22, 10); }
  }
  // the doorway: a dark foyer, a red carpet glow
  rrect(c, ST.dx0 - 18, ST.dTop - 18, ST.dx1 - ST.dx0 + 36, G - ST.dTop + 18, 14); c.fillStyle = '#C9A24A'; c.fill();
  c.fillStyle = '#05040C'; c.fillRect(ST.dx0, ST.dTop, ST.dx1 - ST.dx0, G - ST.dTop);
  const ins = o.inside === undefined ? 1 : o.inside;
  softDot(c, 350, G - 60, 260, '#B0203A', 0.38 * ins); softDot(c, 350, 1090, 150, '#5A7CFF', 0.16 * ins * (0.7 + 0.3 * Math.sin(t * 9)));
  c.fillStyle = 'rgba(160,30,50,0.55)'; c.beginPath(); c.moveTo(ST.dx0 + 40, G); c.lineTo(ST.dx1 - 40, G); c.lineTo(ST.dx1 - 90, G - 120); c.lineTo(ST.dx0 + 90, G - 120); c.closePath(); c.fill();
  // NOW SHOWING plate
  rrect(c, 252, 858, 196, 34, 8); c.fillStyle = '#120C24'; c.fill();
  c.font = '900 22px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFD98A'; c.fillText('NOW SHOWING', 350, 876);
  // the marquee: canopy, sign, chasing bulbs
  const lit = o.lit === undefined ? 1 : o.lit, fl = o.flick || 0;
  c.fillStyle = '#1A1030'; c.beginPath(); c.moveTo(ST.mx0, ST.my1); c.lineTo(ST.mx1, ST.my1); c.lineTo(ST.mx1 - 30, ST.my1 + 34); c.lineTo(ST.mx0 + 30, ST.my1 + 34); c.closePath(); c.fill();
  rrect(c, ST.mx0, ST.my0, ST.mx1 - ST.mx0, ST.my1 - ST.my0, 16); c.fillStyle = '#150F33'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#C9A24A'; c.stroke();
  const on = fl > 0 ? (hash(Math.floor(t * 24)) > 0.45 * fl ? 1 : 0.25) : 1;
  c.font = '400 104px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 7; c.strokeStyle = rgba('#FF4D86', 0.9 * on); c.strokeText('CINEMA', 360, ST.my0 + 76);
  c.fillStyle = rgba('#FFE3EE', 0.35 + 0.65 * on); c.fillText('CINEMA', 360, ST.my0 + 76);
  gctx.font = '400 104px Anton'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.fillStyle = rgba('#FF4D86', 0.55 * on * lit); gctx.fillText('CINEMA', 360, ST.my0 + 76);
  for (let i = 0; i < 17; i++) for (const by of [ST.my0 + 2, ST.my1 - 2]) {
    const bx = ST.mx0 + 20 + i * (ST.mx1 - ST.mx0 - 40) / 16, onb = ((i + Math.floor(t * 7) + (by > ST.my0 + 10 ? 1 : 0)) % 3 === 0) ? 1 : 0.35;
    circle(c, bx, by, 9, mixHex('#7A5A20', '#FFE9A8', onb * lit)); softDot(gctx, bx, by, 26, '#FFD070', 0.7 * onb * lit);
  }
  // the door leaf, hinged on the left, swinging out toward us
  const a = clamp(o.door || 0, 0, 1.12) * 1.42, x1 = ST.dx0 + (ST.dx1 - ST.dx0) * Math.cos(a), sk = Math.sin(a);
  c.beginPath(); c.moveTo(ST.dx0, ST.dTop); c.lineTo(x1, ST.dTop - 34 * sk); c.lineTo(x1, G + 52 * sk); c.lineTo(ST.dx0, G); c.closePath();
  const dg = c.createLinearGradient(ST.dx0, 0, x1 + 1, 0); dg.addColorStop(0, '#6E1A2C'); dg.addColorStop(1, mixHex('#9A2A40', '#D06A6A', sk * 0.6));
  c.fillStyle = dg; c.fill(); c.lineWidth = 6; c.strokeStyle = '#3A0C18'; c.stroke();
  const mx = lerp(ST.dx0, x1, 0.56), wv = Math.cos(a);
  ellipse(c, mx, ST.dTop + 150, 46 * wv + 2, 60, '#1A1030'); ellipse(c, mx, ST.dTop + 150, 36 * wv + 1, 50, 'rgba(120,150,255,0.25)');
  line(c, lerp(ST.dx0, x1, 0.18), G - 250 + 14 * sk, lerp(ST.dx0, x1, 0.9), G - 250 + 30 * sk, 12, '#E2C06A');
  // lamp post down the street
  line(c, 1010, G, 1010, 760, 14, '#2A2440'); line(c, 1010, 770, 960, 740, 10, '#2A2440'); ellipse(c, 950, 742, 26, 14, '#3A3458');
}
// the hard sunlight as a veil over everything right of the marquee's shadow (call after the people are drawn)
function streetVeil(cam, k) {
  if (k <= 0.01) return;
  applyCam(cam);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(ST.shadeX - 60, 0, ST.shadeX + 500, 0);
  g.addColorStop(0, 'rgba(255,200,120,0)'); g.addColorStop(1, `rgba(255,200,120,${0.13 * k})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ST.shadeX - 60, -400); ctx.lineTo(2400, -400); ctx.lineTo(2400, ST.G + 900); ctx.lineTo(ST.shadeX - 390, ST.G + 900); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// 0 in the marquee's shade .. 1 out in the sun, for a person standing at world x
function sunAt(x) { return smooth(inv(ST.shadeX - 70, ST.shadeX + 50, x)); }

// ---------------------------------------------------------------- the hero in daylight
// like kit.js charLayer, but lit for the street: a cool shade wash under the marquee, a warm key light from the right in
// the sun. o: {pal, sun 0..1, dark 0..1 (still in the foyer), post(lctx, r, st), flash}
function sunChar(cam, st, t, o = {}) {
  const sun = o.sun === undefined ? 1 : o.sun;
  // his shadow on the pavement (long and to the left once he is in the sun)
  applyCam(cam);
  ctx.save(); ctx.translate(st.x, st.y + 6); ctx.transform(1, 0, -1.6 * sun, 1, 0, 0);
  ellipse(ctx, -10 * sun, 0, 96 * st.s, (16 + 22 * sun) * st.s, `rgba(24,12,44,${0.3 + 0.2 * sun})`); ctx.restore();
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const r = drawCharacter(lctx, st, t, o.pal || PAL);
  if (o.post) { lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s); o.post(lctx, r, st); lctx.restore(); }
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  if (sun < 1) { lctx.fillStyle = `rgba(40,24,90,${0.34 * (1 - sun)})`; lctx.fillRect(0, 0, W, H); }
  if (o.dark > 0) { lctx.fillStyle = `rgba(8,4,22,${0.62 * clamp(o.dark)})`; lctx.fillRect(0, 0, W, H); }
  if (sun > 0) {
    const p = toScreen(cam, st.x, st.y - 300 * st.s), g = lctx.createLinearGradient(p[0] + 150 * cam.zoom, p[1] - 200 * cam.zoom, p[0] - 130 * cam.zoom, p[1] + 120 * cam.zoom);
    g.addColorStop(0, `rgba(255,226,160,${0.42 * sun})`); g.addColorStop(0.55, `rgba(255,200,130,${0.1 * sun})`); g.addColorStop(1, `rgba(70,40,110,${0.2 * sun})`);
    lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  }
  if (o.flash > 0) { lctx.fillStyle = `rgba(255,250,235,${clamp(o.flash)})`; lctx.fillRect(0, 0, W, H); }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layerC, 0, 0);
  return r;
}

// ---------------------------------------------------------------- the sneeze, as acting
const FACE_AH = { eyeOpen: 0.8, pupil: 0.9, lookX: 0.3, lookY: -1, browY: 1.6, browTilt: 1.4, mouth: 'o', mouthOpen: 1, blink: 0.5, cross: 0, squeeze: 0.35, jaw: 0, tear: 0 };
const FACE_CHOO = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.6, browTilt: -0.9, mouth: 'scream', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1, jaw: 0, tear: 0 };
const FACE_SQUINT = { eyeOpen: 0.8, pupil: 0.9, lookX: 0.5, lookY: -0.6, browY: -0.2, browTilt: -0.5, mouth: 'wavy', mouthOpen: 0.3, blink: 0.5, cross: 0, squeeze: 0.3, jaw: 0, tear: 0 };
const POSE_AH = { hipY: -226, lean: -0.05, armL: { a: 0.75, b: 1.5 }, armR: { a: 0.75, b: 1.5 }, legL: { a: 0.09, b: 0 }, legR: { a: 0.09, b: 0 }, hand: 'spread', feetFront: 0 };
const POSE_CHOO = { hipY: -200, lean: 0.03, armL: { a: 1.15, b: 0.45 }, armR: { a: 1.15, b: 0.45 }, legL: { a: 0.24, b: -0.2 }, legR: { a: 0.24, b: -0.2 }, hand: 'spread', feetFront: 0 };
const POSE_HIPS = { hipY: -222, lean: 0, armL: { a: 0.72, b: -1.75 }, armR: { a: 0.72, b: -1.75 }, legL: { a: 0.12, b: 0 }, legR: { a: 0.12, b: 0 }, hand: 'open', feetFront: 0 };
// times = when each CHOO lands. Returns {w: the "ah..." 0..1, s: the snap (1 at the CHOO, dying away), n: how many so far}
function sneezeAct(t, times, lead = 0.5) {
  let w = 0, s = 0, n = 0;
  for (const ts of times) {
    if (t < ts) w = Math.max(w, ramp(t, ts - lead, ts - 0.03, E.inOutSine));
    else { s = Math.max(s, Math.exp(-(t - ts) * 5)); n++; }
  }
  return { w, s, n };
}
function sneezeFace(base, a) {
  let f = lerpFace(base, FACE_AH, a.w);
  if (a.s > 0.03) f = lerpFace(f, FACE_CHOO, clamp(a.s * 1.7));
  return f;
}
function sneezePose(base, a, keepR) {
  let p = lerpPose(base, POSE_AH, a.w * 0.9);
  if (a.s > 0.03) p = lerpPose(p, POSE_CHOO, clamp(a.s * 1.5));
  if (keepR) p.armR = base.armR;     // that hand is busy (the popcorn)
  return p;
}
// head offsets for st: back and up on the "ah...", down hard on the CHOO
function sneezeHead(a) { return { headDY: -16 * a.w + 30 * clamp(a.s * 1.5), headRot: -0.1 * a.w + 0.05 * a.s, headDX: 6 * a.w }; }

// the spray: a cone of fine droplets and a puff, from (x, y) in SCREEN space, thrown toward `dir` (radians)
function sprayBurst(x, y, t, t0, dir = 1.2, size = 1, seed = 1) {
  const d = t - t0;
  if (d < 0 || d > 0.7) return;
  const rng = mulberry32(seed * 91 + 7);
  screenSpace();
  const a = 1 - ramp(t, t0 + 0.25, t0 + 0.7);
  for (let i = 0; i < 4; i++) {   // the puff
    const u = E.outCubic(clamp(d / 0.5)), an = dir + (i - 1.5) * 0.3, R = (60 + 230 * u) * size;
    softDot(ctx, x + Math.cos(an) * R * 0.8, y + Math.sin(an) * R * 0.8, (40 + 120 * u) * size, '#EAF6FF', 0.16 * a * clamp(d / 0.06));
  }
  for (let i = 0; i < 46; i++) {
    const an = dir + (rng() - 0.5) * 1.15, v = (500 + rng() * 1300) * size, dd = d * (0.7 + 0.6 * rng());
    const px = x + Math.cos(an) * v * (1 - Math.exp(-dd * 4)) / 4 * 1.9, py = y + Math.sin(an) * v * (1 - Math.exp(-dd * 4)) / 4 * 1.9 + 380 * dd * dd;
    const r = (2.5 + rng() * 5.5) * size;
    circle(ctx, px, py, r, rgba('#E8F6FF', 0.9 * a)); softDot(gctx, px, py, r * 3, '#BFE6FF', 0.16 * a);
  }
}

// ---------------------------------------------------------------- popcorn
function kernel(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  circle(c, -r * 0.5, r * 0.2, r * 0.7, '#F1D58A'); circle(c, r * 0.5, r * 0.25, r * 0.66, '#F6E2A6'); circle(c, 0, -r * 0.4, r * 0.76, '#FFF4CC');
  circle(c, -r * 0.1, -r * 0.5, r * 0.3, '#FFFFFF');
  c.restore();
}
// the striped bucket, held at (x, y) (its base centre); fill 0..1 = how much popcorn is heaped on top
function popBucket(c, x, y, s, rot, fill) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (let i = 0; i < Math.round(9 * fill); i++) kernel(c, -44 + (i * 37) % 90, -128 - (i % 3) * 13, 16, i);
  c.beginPath(); c.moveTo(-42, 0); c.lineTo(42, 0); c.lineTo(62, -124); c.lineTo(-62, -124); c.closePath(); c.fillStyle = '#F7F1E4'; c.fill();
  c.save(); c.clip();
  for (let i = -2; i <= 2; i++) { c.fillStyle = '#E23A4A'; c.beginPath(); c.moveTo(i * 22 - 7, 0); c.lineTo(i * 22 + 7, 0); c.lineTo(i * 31 + 10, -124); c.lineTo(i * 31 - 10, -124); c.closePath(); if (i % 2 === 0) c.fill(); }
  c.fillStyle = 'rgba(60,20,40,0.16)'; c.fillRect(20, -130, 60, 140);
  c.restore();
  rrect(c, -66, -134, 132, 16, 8); c.fillStyle = '#FFFFFF'; c.fill();
  c.restore();
}
// kernels thrown from (x0, y0) at t0 (world coords): they arc up, fall, and stay where they land on the pavement
function popcornBurst(c, x0, y0, t, t0, n, seed, spread = 1, up = 1) {
  const d = t - t0;
  if (d < 0) return;
  const rng = mulberry32(seed), g = 2600;
  for (let i = 0; i < n; i++) {
    const an = -Math.PI / 2 + (rng() - 0.5) * 1.9 * spread, v = (620 + rng() * 900) * up, vx = Math.cos(an) * v, vy = Math.sin(an) * v;
    const r = 11 + rng() * 7, floor = ST.G + 10 + rng() * 120, sp = (rng() - 0.5) * 16;
    const tl = (-vy + Math.sqrt(vy * vy + 2 * g * (floor - y0))) / g, dd = Math.min(d, tl);
    kernel(c, x0 + vx * dd, y0 + vy * dd + 0.5 * g * dd * dd, r, sp * dd);
  }
}

// ---------------------------------------------------------------- his sunglasses (rig-local: call inside sunChar's post)
// lift 0 = on his nose, 1 = pushed up on his forehead; (ox, oy, rot) = flying off
function shades(c, r, st, lift = 0, k = 1, glint = 0) {
  if (k <= 0) return;
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  c.translate(0, -2 - 44 * lift);
  shadesShape(c, glint);
  c.restore();
}
function shadesShape(c, glint = 0) {
  line(c, -62, -6, -48, -4, 6, '#15121F'); line(c, 62, -6, 48, -4, 6, '#15121F');
  for (const s of [-1, 1]) {
    rrect(c, s * 25 - 23, -17, 46, 36, 13); const g = c.createLinearGradient(0, -17, 0, 19); g.addColorStop(0, '#2A2540'); g.addColorStop(1, '#0B0A14'); c.fillStyle = g; c.fill();
    c.lineWidth = 4; c.strokeStyle = '#05040A'; c.stroke();
    line(c, s * 25 - 12, -8, s * 25 + 2, -11, 4, 'rgba(255,255,255,0.5)');
    circle(c, s * 25 + 9, 6, 6, 'rgba(255,214,120,0.85)');       // the sun, in each lens
  }
  line(c, -4, -6, 4, -6, 5, '#05040A');
  if (glint > 0) { c.save(); c.translate(40, -14); c.rotate(0.4); c.fillStyle = `rgba(255,255,255,${glint})`; for (const [w, h] of [[4, 34], [34, 4]]) { c.beginPath(); c.ellipse(0, 0, w * glint, h * glint, 0, 0, 7); c.fill(); } c.restore(); }
}

// ---------------------------------------------------------------- the other cinema-goers (not him: their own simple build)
const PEDS = [
  { coat: '#33A69B', coatSh: '#22786F', hair: '#E3B45C', skin: '#F0C5A0', pants: '#3A3355', kind: 0 },
  { coat: '#E0685E', coatSh: '#AD463E', hair: '#3A2A22', skin: '#C98D6A', pants: '#2B3A66', kind: 1 },
  { coat: '#8C7AE0', coatSh: '#6654B8', hair: '#C8C8D6', skin: '#EDBE9C', pants: '#40304A', kind: 2 },
];
// o: {walk 0..1, turn -1..1 (which way the head looks), shield: an arm up against the sun, wide: startled, sun 0..1}
function drawPed(c, x, y, s, k, t, o = {}) {
  const P = PEDS[k], ph = t * 6.2 + k * 2.1, wk = o.walk === undefined ? 1 : o.walk, sw = Math.sin(ph) * wk, turn = o.turn || 0;
  ellipse(c, x - 30 * (o.sun || 0), y + 6, 84 * s, (14 + 16 * (o.sun || 0)) * s, 'rgba(24,12,44,0.36)');
  c.save(); c.translate(x, y - 7 * Math.abs(Math.cos(ph)) * wk); c.scale(s, s);
  for (const sd of [-1, 1]) { const lift = Math.max(0, sd * sw) * 30; line(c, sd * 30, -200, sd * 32, -30 - lift, 50, P.pants); ellipse(c, sd * 36, -12 - lift, 40, 20, '#2A2233'); }
  rrect(c, -88, -400, 176, 220, 54); c.fillStyle = P.coatSh; c.fill();
  rrect(c, -88, -400, 150, 220, 54); c.fillStyle = P.coat; c.fill();
  line(c, 0, -390, 0, -190, 4, P.coatSh);
  for (const sd of [-1, 1]) {
    if (o.shield && sd === 1) { line(c, 82, -360, 128, -430, 40, P.coatSh); line(c, 128, -430, 62, -520, 36, P.coat); circle(c, 54, -528, 22, P.skin); }
    else { const a = sd * 0.16 - sd * sw * 0.3; line(c, sd * 82, -362, sd * 82 + Math.sin(a) * 130, -362 + Math.cos(a) * 130, 40, sd > 0 ? P.coatSh : P.coat); circle(c, sd * 82 + Math.sin(a) * 148, -362 + Math.cos(a) * 148, 21, P.skin); }
  }
  c.translate(turn * 6, -468);
  if (P.kind === 0) circle(c, 0, -74, 30, P.hair);                                              // a bun
  circle(c, 0, 0, 66, P.skin);
  c.beginPath(); c.arc(0, -4, 68, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(40, -34, 0, -40); c.quadraticCurveTo(-44, -30, -68, -2); c.closePath(); c.fillStyle = P.hair; c.fill();
  if (P.kind === 1) { c.fillStyle = '#F2D34A'; c.beginPath(); c.arc(0, -16, 70, Math.PI, 0); c.closePath(); c.fill(); rrect(c, turn * 20 - 10, -24, 84, 14, 7); c.fill(); }   // a cap
  for (const sd of [-1, 1]) {
    const ex = sd * 23 + turn * 15;
    if (o.wide) { ellipse(c, ex, 0, 12, 15, '#FFFFFF'); circle(c, ex + turn * 4, 0, 6, '#2A1B14'); }
    else circle(c, ex, 0, 6.5, '#2A1B14');
  }
  if (P.kind === 2) { c.lineWidth = 4; c.strokeStyle = '#3A2A4A'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 23 + turn * 15, 0, 17, 0, 7); c.stroke(); } }   // glasses
  if (o.wide) ellipse(c, turn * 14, 34, 9, 11, '#5A1522'); else { c.beginPath(); c.moveTo(-12 + turn * 14, 32); c.quadraticCurveTo(turn * 14, 38, 12 + turn * 14, 32); c.lineWidth = 4.5; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
  ellipse(c, -36, 22, 10, 6, 'rgba(255,110,110,0.25)'); ellipse(c, 36, 22, 10, 6, 'rgba(255,110,110,0.25)');
  c.restore();
}

// ---------------------------------------------------------------- small props
// the cold germ: a smug green blob with knobs; dead = crossed out (it sags)
function germ(x, y, r, k, t, dead = 0) {
  if (k <= 0) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2.2), wob = 1 + 0.05 * Math.sin(t * 9);
  ctx.save(); ctx.translate(x, y + 26 * dead); ctx.scale(s * wob, s * (2 - wob) * (1 - 0.18 * dead)); ctx.rotate(0.12 * Math.sin(t * 3) + 0.3 * dead);
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + 0.2; line(ctx, Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, Math.cos(a) * r * 1.26, Math.sin(a) * r * 1.26, r * 0.16, '#3E9C4A'); circle(ctx, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, r * 0.14, '#7FE08A'); }
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, '#B6F5B0'); g.addColorStop(0.6, '#5CC86A'); g.addColorStop(1, '#2F8A40');
  circle(ctx, 0, 0, r, '#5CC86A'); ctx.fillStyle = g; ctx.fill();
  for (const sd of [-1, 1]) {
    if (dead > 0.5) { line(ctx, sd * r * 0.36 - 9, -r * 0.2 - 9, sd * r * 0.36 + 9, -r * 0.2 + 9, 5, '#173A1E'); line(ctx, sd * r * 0.36 + 9, -r * 0.2 - 9, sd * r * 0.36 - 9, -r * 0.2 + 9, 5, '#173A1E'); }
    else { ellipse(ctx, sd * r * 0.36, -r * 0.18, r * 0.2, r * 0.24, '#FFFFFF'); circle(ctx, sd * r * 0.36 - r * 0.07, -r * 0.14, r * 0.1, '#173A1E'); line(ctx, sd * r * 0.14, -r * 0.5, sd * r * 0.56, -r * 0.4 - sd * 0, 5, '#173A1E'); }
  }
  ctx.beginPath(); if (dead > 0.5) { ctx.moveTo(-r * 0.3, r * 0.42); ctx.quadraticCurveTo(0, r * 0.22, r * 0.3, r * 0.42); } else { ctx.moveTo(-r * 0.34, r * 0.26); ctx.quadraticCurveTo(0, r * 0.62, r * 0.38, r * 0.2); }
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = '#173A1E'; ctx.stroke();
  ctx.restore();
}
// a four-point sparkle (screen space)
function sparkle(x, y, r, a, col = '#FFFFFF') {
  if (a <= 0.01) return;
  for (const [cc, sc, al] of [[gctx, 0.5, 0.8], [ctx, 1, 1]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y); cc.fillStyle = rgba(col, a * al);
    for (const [w, h] of [[r * 0.16, r], [r, r * 0.16]]) { cc.beginPath(); cc.ellipse(0, 0, w, h, 0, 0, 7); cc.fill(); }
    cc.restore();
  }
}
