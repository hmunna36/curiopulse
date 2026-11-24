// There's a GALAXY in Your Sky Wider Than the Moon: the worlds and the props (25 Nov 2026).
//  - the night sky in "sky space" (1080x1920 at scale 1, as the wide shot sees it): a deep blue-violet gradient that is
//    brightest at the horizon, a painted star field, twinkling bright stars, a few bats, the Moon as a CHARACTER (a disc
//    with maria and craters, a face as paint: proud, side-eye, smirk, shock, nervous, squish, sulk; a cloud blanket) and
//    the Andromeda galaxy painted once at its true size beside it: nearly six full Moons long (APOD 2022-10-21 and
//    2025-02-21: "spanning nearly 6 full moons"; Wikipedia: 3.17 x 1 degrees, the Moon about 0.52). gxGalaxy draws it at
//    any EXPOSURE: 0 = what a naked eye catches (the small bright middle), 1 = the long exposure (the whole disk, the dust
//    lanes, the blue star clouds, pink knots, the two little companions M32 and M110);
//  - the valley: three mountain ranges with moonlit snow, a lake that mirrors them, the Moon's glitter path, and the
//    galaxy's reflection (gxValley);
//  - the hilltop camp: grass with moonlit tips, rocks, his orange tent glowing from inside with a string of bulbs, a
//    lantern on a stake, a thermos and a mug on a rock, two pines (gxHill, gxTent, gxLantern, gxCampProps, gxPine);
//  - his CAMERA GOGGLES: two lens barrels with glass that mirrors the galaxy, a REC light, a strap; flipped up onto his hair
//    or down over his eyes; the glass fills with light (gxGoggles);
//  - the extreme close-up of his eye (gxEyeECU), the space view of Andromeda and the light leaving it (gxSpace), the time
//    ribbon (gxRibbon), label pills (gxTag) and the stopwatch (gxWatch).
'use strict';

const GX = {
  skyTop: '#050A2E', sky1: '#0E1760', sky2: '#22238C', sky3: '#4A38B2', skyLow: '#8456CF', glowLow: '#B070E0',
  mtnFar: '#4A4CA8', mtnFarSh: '#383A90', snow: '#D9E2FF', snowSh: '#9FA9E8', mtnMid: '#2A2D78', forest: '#151A4E',
  lake0: '#6A4FC4', lake1: '#2E2C8A', lake2: '#151A55',
  hill: '#1B2F5E', hillHi: '#3D63A0', grass: '#25477A', grassHi: '#5C8CC4', rock: '#3A4277', rockHi: '#6670A8',
  tent: '#FF7A2F', tentSh: '#C9541C', tentHi: '#FFB062', tentIn: '#FFE09A', pole: '#2A2238',
  moon: '#F0E7C8', moonSh: '#D2C6A2', moonMare: '#C9BE9C', moonRim: '#FFF8E2',
  lensBarrel: '#232741', lensRing: '#9AA3C9', lensGlass0: '#0B1E4A', lensGlass1: '#1E5AA6', strap: '#3A2C4A',
};
// the sky's layout in sky space (the wide shot's own frame): the Moon upper left, the galaxy across the middle, rising to
// the right. The galaxy's visible disk is 6.1 Moon diameters long (3.17 / 0.52 degrees).
const GXS = { moon: [236, 560], moonR: 70, gal: [600, 860], galAng: -0.62 };
GXS.galLen = 6.1 * 2 * GXS.moonR;           // 854 px at scale 1
const GX_GW = 1700, GX_GH = 620, GX_GA = 800, GX_GB = 256;   // the painted galaxy: canvas size, half-axes of its halo
const GX_DISK = 0.85;                                         // the visible disk ends at 0.85 of the halo's half-axis
const GX_K = GXS.galLen / (2 * GX_DISK * GX_GA);              // canvas px -> sky px

let GX_STARS = null, GX_GAL = null, GX_GALS = null, GX_MTN = null;

// ================================================================ painted once
function gxPaintStars() {
  const w = 1700, h = 2600, cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(41);
  for (let i = 0; i < 2600; i++) {
    const sx = rnd() * w, sy = rnd() * h, z = rnd();
    const r = z < 0.02 ? 2.4 : z < 0.14 ? 1.5 : 0.9;
    x.globalAlpha = 0.35 + 0.65 * rnd();
    x.fillStyle = rnd() < 0.18 ? '#FFE6C0' : rnd() < 0.35 ? '#C2D6FF' : '#FFFFFF';
    x.beginPath(); x.arc(sx, sy, r, 0, Math.PI * 2); x.fill();
  }
  // a faint wash of the Milky Way's far edge, low on one side (so the sky is not one flat colour)
  x.globalAlpha = 1;
  for (let i = 0; i < 120; i++) {
    const u = rnd(), cx = w * (0.75 + 0.3 * rnd()), cy = h * (0.15 + 0.8 * u), r = 80 + rnd() * 180;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(140,120,255,0.05)'); g.addColorStop(1, 'rgba(140,120,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  }
  GX_STARS = cv;
}

// Andromeda, painted in its own frame: the long axis along x. Unit space: the halo's ellipse is the unit circle.
function gxPaintGalaxy() {
  const cv = mkCanvas(GX_GW, GX_GH), x = cv.getContext('2d'), rnd = mulberry32(31);
  const cx = GX_GW / 2, cy = GX_GH / 2;
  const unit = () => x.setTransform(GX_GA, 0, 0, GX_GB, cx, cy);
  const disc = (r0, r1, stops) => {
    const g = x.createRadialGradient(0, 0, r0, 0, 0, r1);
    for (const [k, c] of stops) g.addColorStop(k, c);
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r1, 0, Math.PI * 2); x.fill();
  };
  unit();
  // the faint outer halo, then the disk: warm in the middle, blue-violet outside
  disc(0, 1, [[0, 'rgba(150,150,255,0.30)'], [0.6, 'rgba(110,110,255,0.16)'], [1, 'rgba(90,90,255,0)']]);
  disc(0, GX_DISK, [[0, 'rgba(255,246,214,1)'], [0.12, 'rgba(255,224,170,0.95)'], [0.3, 'rgba(214,190,255,0.75)'],
    [0.62, 'rgba(140,150,255,0.5)'], [0.86, 'rgba(110,130,255,0.25)'], [1, 'rgba(100,120,255,0)']]);
  // star clouds along the arms: rings of small blue-white dots, denser on three rings (in canvas px, placed in unit space)
  x.setTransform(1, 0, 0, 1, 0, 0);
  const at = (r, a) => [cx + Math.cos(a) * r * GX_GA, cy + Math.sin(a) * r * GX_GB];
  for (let i = 0; i < 4200; i++) {
    const ring = [0.36, 0.5, 0.64, 0.76][i % 4];
    const r = ring + (rnd() - 0.5) * (rnd() < 0.7 ? 0.06 : 0.3), a = rnd() * Math.PI * 2;
    if (r > GX_DISK * 1.02 || r < 0.14) continue;
    const [px, py] = at(r, a);
    x.globalAlpha = 0.25 + 0.6 * rnd();
    x.fillStyle = rnd() < 0.75 ? '#D6E4FF' : '#FFFFFF';
    x.beginPath(); x.arc(px, py, 0.8 + 1.8 * rnd() * rnd(), 0, Math.PI * 2); x.fill();
  }
  // pink knots where stars are being born
  for (let i = 0; i < 90; i++) {
    const r = 0.46 + 0.32 * rnd(), a = rnd() * Math.PI * 2, [px, py] = at(r, a);
    x.globalAlpha = 0.5 + 0.4 * rnd(); x.fillStyle = '#FF86C8';
    x.beginPath(); x.arc(px, py, 1.5 + 2.2 * rnd(), 0, Math.PI * 2); x.fill();
  }
  x.globalAlpha = 1;
  // the dark dust lanes: ellipse rings, strongest on the near (lower) side, a little off-centre like a tilted disk
  unit();
  for (const [r, w, a] of [[0.3, 0.035, 0.55], [0.44, 0.045, 0.6], [0.57, 0.04, 0.5], [0.7, 0.035, 0.42]]) {
    x.lineWidth = w;
    x.strokeStyle = `rgba(36,16,56,${a})`;
    x.beginPath(); x.ellipse(0.02, 0.05, r, r * 0.96, 0, 0.08 * Math.PI, 0.94 * Math.PI); x.stroke();
    x.strokeStyle = `rgba(36,16,56,${a * 0.45})`;
    x.beginPath(); x.ellipse(0.02, 0.05, r, r * 0.96, 0, 1.06 * Math.PI, 1.94 * Math.PI); x.stroke();
  }
  // the bright middle
  disc(0, 0.2, [[0, 'rgba(255,253,240,1)'], [0.35, 'rgba(255,240,200,0.85)'], [1, 'rgba(255,220,170,0)']]);
  // the two little companions: M32 (round, just off the disk's near side) and M110 (stretched, beyond the far side)
  x.setTransform(1, 0, 0, 1, 0, 0);
  const m32 = at(0.2, 1.25), m110 = at(1.05, -1.95);
  for (const [px, py, rx, ry, rot] of [[m32[0], m32[1] + 30, 34, 30, 0], [m110[0], m110[1] - 26, 70, 36, -0.5]]) {
    x.save(); x.translate(px, py); x.rotate(rot); x.scale(1, ry / rx);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(255,244,220,0.95)'); g.addColorStop(0.4, 'rgba(240,220,255,0.45)'); g.addColorStop(1, 'rgba(200,190,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, Math.PI * 2); x.fill(); x.restore();
  }
  GX_GAL = cv;
  GX_GALS = mkCanvas(GX_GW, GX_GH);
}

function gxRidge(rnd, w, base, amp, step, rough, ph) {
  const pts = []; let v = 0;
  for (let x = -step; x <= w + step; x += step) {
    v += (rnd() - 0.5) * rough; v *= 0.86;
    pts.push([x, base - amp * (0.5 + 0.35 * Math.sin(x * 0.0042 + ph) + 0.25 * Math.sin(x * 0.011 + ph * 2.3)) + v * amp]);
  }
  return pts;
}
function gxPaintMountains() {
  const w = 2400, h = 760, cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(19);
  const fill = (pts, col) => { x.beginPath(); x.moveTo(pts[0][0], h + 5); for (const p of pts) x.lineTo(p[0], p[1]); x.lineTo(pts[pts.length - 1][0], h + 5); x.closePath(); x.fillStyle = col; x.fill(); };
  const far = [];
  for (let px = -60; px <= w + 60; px += 18) {
    const k = px / w;
    far.push([px, h - (300 + 200 * Math.pow(Math.abs(Math.sin(k * 6.1 + 0.9)), 1.5) + 60 * Math.sin(k * 21 + 1) + 20 * (rnd() - 0.5))]);
  }
  const g = x.createLinearGradient(0, 150, 0, h); g.addColorStop(0, GX.mtnFar); g.addColorStop(1, GX.mtnFarSh);
  fill(far, g);
  // moonlit snow on the upper slopes (the Moon is up on the LEFT: the left faces are brighter)
  const tmp = mkCanvas(w, h), tx = tmp.getContext('2d');
  tx.beginPath(); tx.moveTo(far[0][0], h); for (const p of far) tx.lineTo(p[0], p[1]); tx.lineTo(far[far.length - 1][0], h); tx.closePath();
  tx.fillStyle = GX.snow; tx.fill();
  tx.globalCompositeOperation = 'destination-in';
  tx.beginPath(); tx.moveTo(0, 0);
  for (let px = 0; px <= w; px += 22) tx.lineTo(px, h - 440 + 40 * Math.sin(px * 0.029) + 26 * (rnd() - 0.5));
  tx.lineTo(w, 0); tx.closePath(); tx.fill();
  tx.globalCompositeOperation = 'source-atop';
  for (let i = 1; i < far.length - 1; i++) {
    const [a, b, c2] = [far[i - 1], far[i], far[i + 1]];
    if (b[1] < a[1] && b[1] < c2[1]) {   // the right face of each peak in shadow
      tx.beginPath(); tx.moveTo(b[0], b[1]); tx.lineTo(b[0] + 150, b[1] + 260); tx.lineTo(b[0] + 20, b[1] + 300); tx.closePath();
      tx.fillStyle = GX.snowSh; tx.fill();
    }
  }
  x.drawImage(tmp, 0, 0);
  fill(gxRidge(rnd, w, h - 140, 240, 26, 0.5, 1.7), GX.mtnMid);
  // the forest band along the far shore: pine tips
  const fb = gxRidge(rnd, w, h - 34, 70, 30, 0.4, 0.4);
  fill(fb, GX.forest);
  x.fillStyle = GX.forest;
  for (let px = 0; px < w; px += 9 + rnd() * 8) {
    const base = h - 30 - 70 * (0.5 + 0.35 * Math.sin(px * 0.0042 + 0.4) + 0.25 * Math.sin(px * 0.011 + 0.92)) + 26;
    const th = 36 + rnd() * 64, tw = 11 + rnd() * 9;
    x.beginPath(); x.moveTo(px, base - th); x.lineTo(px + tw, base + 10); x.lineTo(px - tw, base + 10); x.closePath(); x.fill();
  }
  x.fillRect(0, h - 34, w, 40);
  for (const [px, py] of [[1480, h - 26], [1530, h - 22], [700, h - 30], [2010, h - 24]]) { x.fillStyle = '#FFD27A'; x.fillRect(px, py, 8, 6); }
  GX_MTN = cv;
}
function gxWorldInit() { gxPaintStars(); gxPaintGalaxy(); gxPaintMountains(); }

// ================================================================ the sky
// sk: the sky camera {x, y, zoom} in sky space (toScreen works on it). o: {hz (screen y of the horizon: the gradient's
// end), e (the galaxy's exposure 0..1), moon (gxMoon options or false), gal (false: no galaxy), bats, twinkle, clones}
function gxSkyGrad(hz) {
  screenSpace();
  const g = ctx.createLinearGradient(0, hz - 1900, 0, hz);
  g.addColorStop(0, GX.skyTop); g.addColorStop(0.42, GX.sky1); g.addColorStop(0.72, GX.sky2); g.addColorStop(0.9, GX.sky3); g.addColorStop(1, GX.skyLow);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, hz) + 4);
  if (hz < H) { ctx.fillStyle = GX.skyLow; ctx.fillRect(0, hz, W, H - hz); }
  // a violet glow along the horizon
  const g2 = ctx.createLinearGradient(0, hz - 260, 0, hz);
  g2.addColorStop(0, 'rgba(176,112,224,0)'); g2.addColorStop(1, 'rgba(176,112,224,0.45)');
  ctx.fillStyle = g2; ctx.fillRect(0, hz - 260, W, 262);
}
function gxStars(sk, t, o = {}) {
  screenSpace();
  const z = sk.zoom, p0 = toScreen(sk, -310, -340);
  ctx.save(); ctx.globalAlpha = o.a != null ? o.a : 1;
  ctx.drawImage(GX_STARS, p0[0], p0[1], GX_STARS.width * z, GX_STARS.height * z);
  ctx.restore();
  // brighter stars that twinkle (loop-safe), with a small cross glint
  const rnd = mulberry32(73);
  for (let i = 0; i < 46; i++) {
    const sx = -300 + rnd() * 1700, sy = -300 + rnd() * 2400, ph = rnd() * 6, w = 1 + rnd() * 2.5, big = rnd() < 0.3;
    const p = toScreen(sk, sx, sy);
    if (p[0] < -20 || p[0] > W + 20 || p[1] < -20 || p[1] > (o.hz != null ? o.hz : H)) continue;
    const tw = 0.55 + 0.45 * Math.sin(t * loopW(w) + ph);
    const r = (big ? 2.8 : 1.9) * Math.max(1, Math.sqrt(z));
    circle(ctx, p[0], p[1], r, rgba('#FFFFFF', 0.95 * tw));
    softDot(gctx, p[0], p[1], r * 5, '#CFE0FF', 0.55 * tw);
    if (big) { const L = r * 4 * tw; line(ctx, p[0] - L, p[1], p[0] + L, p[1], 1.4, rgba('#FFFFFF', 0.6 * tw)); line(ctx, p[0], p[1] - L, p[0], p[1] + L, 1.4, rgba('#FFFFFF', 0.6 * tw)); }
  }
}
// the galaxy on screen at (x, y) (its centre), scale s (1 = 854 px long), angle ang, exposure e (0 = naked eye, 1 = long
// exposure). o: {a (opacity), glow (bloom amount), mirror (draw flipped: for the lake)}
function gxGalaxy(x, y, s, ang, e, o = {}) {
  e = clamp(e);
  let img = GX_GAL;
  if (e < 0.999) {
    const sx = GX_GALS.getContext('2d');
    sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'copy'; sx.drawImage(GX_GAL, 0, 0);
    sx.globalCompositeOperation = 'destination-in';
    sx.setTransform(GX_GA, 0, 0, GX_GB, GX_GW / 2, GX_GH / 2);
    const re = lerp(0.17, 1.02, E.outCubic(e));   // e = 0: about one Moon's width of faint haze, what eyes see on a dark night
    const g = sx.createRadialGradient(0, 0, 0, 0, 0, re);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.45, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    sx.fillStyle = g; sx.fillRect(-1.2, -1.2, 2.4, 2.4);
    sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'source-over';
    img = GX_GALS;
  }
  const k = GX_K * s, a = (o.a != null ? o.a : 1) * lerp(0.5, 1, E.inQuad(e));
  screenSpace();
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); if (o.mirror) ctx.scale(1, -1);
    ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
    const bl = (1 - e) * 5 * s;                       // a naked eye sees a soft fuzz, not the dust lanes
    if (bl > 0.3) ctx.filter = `blur(${bl.toFixed(1)}px)`;
    ctx.drawImage(img, -GX_GW / 2 * k, -GX_GH / 2 * k, GX_GW * k, GX_GH * k);
    ctx.restore();
  });
  // bloom: the middle always, the disk as the exposure grows
  const gl = o.glow != null ? o.glow : 1;
  if (gl > 0) {
    softDot(gctx, x, y, 90 * s * lerp(0.55, 1, e), '#FFE9C0', 0.75 * gl * a);
    gctx.save(); gctx.translate(x, y); gctx.rotate(ang); gctx.scale(1, 0.3);
    softDot(gctx, 0, 0, GXS.galLen * 0.5 * s * lerp(0.15, 1, e), '#9C8CFF', 0.32 * gl * a * e);
    gctx.restore();
  }
}
// the row of six Moons runs parallel to the galaxy, this far off its axis toward the lower right (sky px)
const GX_ROWOFF = 300;
function gxRow(u) { const p = gxAxis(u), a = GXS.galAng; return [p[0] - Math.sin(a) * GX_ROWOFF, p[1] + Math.cos(a) * GX_ROWOFF]; }
// where a point at fraction u (-1..1) along the galaxy's long axis lands (sky space)
function gxAxis(u, cen = GXS.gal, ang = GXS.galAng, len = GXS.galLen) {
  return [cen[0] + Math.cos(ang) * u * len / 2, cen[1] + Math.sin(ang) * u * len / 2];
}

// the Moon as a character: centre (x, y) on screen, radius R. f: {face: 'proud' | 'side' | 'smirk' | 'shock' | 'nervous' |
// 'squish' | 'sulk' | 'calm', look: [x, y] (-1..1), blush, squash (0..1: squeezed flat), jaw (0..1), sweat, cloud (0..1: the
// blanket pulled up), glow, num (a number label under it), numK}
function gxMoon(x, y, R, t, f = {}) {
  screenSpace();
  const sq = f.squash || 0, sxS = 1 + 0.16 * sq, syS = 1 - 0.2 * sq;
  // the moonlight halo: a RING round the disc (a filled glow bloomed its face away), and the disc cut out of the glow layer
  const gk = (f.glow != null ? f.glow : 1) * Math.min(1, 72 / R);   // a big Moon glows less: its face must read
  for (const [cc, r1, col, a] of [[gctx, R * 2.5, '232,240,255', 0.5 * gk], [ctx, R * 2.1, '200,212,255', 0.14 * gk]]) {
    const hg = cc.createRadialGradient(x, y, R * 0.97, x, y, r1);
    hg.addColorStop(0, `rgba(${col},${a})`); hg.addColorStop(1, `rgba(${col},0)`);
    cc.fillStyle = hg; cc.beginPath(); cc.arc(x, y, r1, 0, Math.PI * 2); cc.fill();
  }
  gctx.save(); gctx.globalCompositeOperation = 'destination-out'; gctx.beginPath(); gctx.arc(x, y, R * 1.02, 0, Math.PI * 2); gctx.fill(); gctx.restore();
  actor(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sxS, syS);
    const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
    g.addColorStop(0, GX.moonRim); g.addColorStop(0.55, GX.moon); g.addColorStop(1, GX.moonSh);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  if (f.edge) { screenSpace(); paint(() => { ctx.save(); ctx.translate(x, y); ctx.scale(sxS, syS); ctx.lineWidth = Math.max(2, R * 0.05); ctx.strokeStyle = 'rgba(40,30,70,0.55)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }); }
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sxS, syS);
    // maria and craters (they sit round the face, not on it)
    ellipse(ctx, -R * 0.45, -R * 0.52, R * 0.24, R * 0.16, rgba(GX.moonMare, 0.8), 0.4);
    ellipse(ctx, R * 0.5, -R * 0.42, R * 0.18, R * 0.13, rgba(GX.moonMare, 0.75), -0.3);
    ellipse(ctx, R * 0.62, R * 0.38, R * 0.14, R * 0.11, rgba(GX.moonMare, 0.7));
    for (const [cx, cy, cr] of [[-0.7, 0.2, 0.09], [-0.15, -0.75, 0.07], [0.3, 0.72, 0.08], [0.78, -0.05, 0.06], [-0.48, 0.62, 0.06]]) {
      ctx.lineWidth = R * 0.025; ctx.strokeStyle = rgba('#B9AF92', 0.8);
      ctx.beginPath(); ctx.arc(cx * R, cy * R, cr * R, 0, Math.PI * 2); ctx.stroke();
    }
    gxMoonFace(ctx, R, t, f);
    ctx.restore();
  });
  if (f.sweat > 0.02) sweatDrop(ctx, x + R * 0.82, y - R * 0.55, R / 60, clamp(f.sweat));
  if (f.cloud > 0.01) gxCloudBlanket(x, y, R, f.cloud, t);
  if (f.num && (f.numK || 0) > 0.01) gxTag(String(f.num), x, y + R + 46, '#FFFFFF', f.numK, 44, 0, 'rgba(14,16,40,0.85)');
}
function gxMoonFace(c, R, t, f) {
  const u = R / 70, face = f.face || 'proud';
  const lk = f.look || (face === 'side' ? [1, 0] : face === 'sulk' ? [-0.3, 0.8] : [0, 0]);
  const eyeY = -R * 0.12, eyeX = R * 0.3;
  const lid = face === 'proud' ? 0.42 : face === 'smirk' ? 0.5 : face === 'side' ? 0.35 : face === 'sulk' ? 0.55 : face === 'squish' ? 0.15 : 0;
  const open = face === 'shock' ? 1.35 : face === 'nervous' ? 1.15 : 1;
  for (const s of [-1, 1]) {
    const ex = s * eyeX, ry = 13 * u * open;
    ellipse(c, ex, eyeY, 11 * u, ry, '#FFFFFF');
    circle(c, ex + lk[0] * 4.5 * u, eyeY + lk[1] * 5 * u, 6 * u * (face === 'shock' ? 0.7 : 1), '#2A2238');
    circle(c, ex + lk[0] * 4.5 * u - 2 * u, eyeY + lk[1] * 5 * u - 2.4 * u, 2 * u, '#FFFFFF');
    if (lid > 0.01) {   // a heavy upper lid: smug, side-eye, sulk
      c.save(); c.beginPath(); c.ellipse(ex, eyeY, 12 * u, ry + 1, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = GX.moonSh; c.fillRect(ex - 13 * u, eyeY - ry - 2, 26 * u, (2 * ry + 2) * lid);
      line(c, ex - 12 * u, eyeY - ry + 2 * ry * lid, ex + 12 * u, eyeY - ry + 2 * ry * lid, 2.6 * u, '#6E6450');
      c.restore();
    }
    // brows
    const bt = face === 'proud' ? -0.25 : face === 'sulk' ? 0.9 : face === 'nervous' ? 1.0 : face === 'shock' ? 0.3 : face === 'side' ? -0.5 : face === 'squish' ? 0.8 : 0;
    const by = eyeY - 22 * u - (face === 'shock' ? 8 * u : 0);
    line(c, s * 8 * u, by - bt * 5 * u * 1, s * 26 * u, by + bt * 3 * u, 4.5 * u, '#8E8468');
  }
  // blush
  if (f.blush > 0.02) for (const s of [-1, 1]) ellipse(c, s * R * 0.5, R * 0.18, 12 * u, 7 * u, `rgba(255,120,140,${0.55 * f.blush})`);
  // the mouth
  c.save(); c.translate(0, R * 0.34);
  const jaw = f.jaw || 0;
  if (face === 'proud' || face === 'smirk') {
    c.beginPath();
    if (face === 'smirk') { c.moveTo(-14 * u, 2 * u); c.quadraticCurveTo(4 * u, 6 * u, 20 * u, -6 * u); }
    else { c.moveTo(-18 * u, -2 * u); c.quadraticCurveTo(0, 12 * u, 18 * u, -2 * u); }
    c.lineWidth = 4.5 * u; c.strokeStyle = '#7A3040'; c.lineCap = 'round'; c.stroke();
  } else if (face === 'shock' || jaw > 0.05) {
    const o = Math.max(jaw, face === 'shock' ? 0.8 : 0);
    ellipse(c, 0, 4 * u + 8 * u * o, (7 + 5 * o) * u, (6 + 16 * o) * u, '#5A1A2A');
    ellipse(c, 0, 8 * u + 14 * u * o, (5 + 3 * o) * u, (3 + 3 * o) * u, '#E0616C');
  } else if (face === 'nervous' || face === 'squish') {
    rrect(c, -16 * u, -6 * u, 32 * u, 12 * u, 5 * u); c.fillStyle = '#FFFFFF'; c.fill();
    c.lineWidth = 2.5 * u; c.strokeStyle = '#7A3040'; c.stroke(); line(c, -14 * u, 0, 14 * u, 0, 1.8 * u, '#7A3040');
  } else if (face === 'sulk') {
    c.beginPath(); c.moveTo(-16 * u, 6 * u); c.quadraticCurveTo(0, -8 * u, 16 * u, 6 * u);
    c.lineWidth = 4.5 * u; c.strokeStyle = '#7A3040'; c.lineCap = 'round'; c.stroke();
    // a wobbly lower lip
    line(c, -6 * u, 4 * u, 6 * u, 4 * u, 3 * u, 'rgba(122,48,64,0.6)');
  } else {   // side, calm: a flat line, a little to one side
    line(c, -12 * u + (face === 'side' ? 4 * u : 0), 2 * u, 12 * u + (face === 'side' ? 4 * u : 0), face === 'side' ? -1 * u : 2 * u, 4.5 * u, '#7A3040');
  }
  c.restore();
}
// a small fluffy cloud pulled up over the Moon like a blanket (k 0..1), with its edge in two little cloud "hands"
function gxCloudBlanket(x, y, R, k, t) {
  // it comes up to just under the eyes: they peek over it, sulking
  const top = lerp(y + R * 1.45, y + R * 0.12, E.outBack(clamp(k), 1.2));
  screenSpace();
  const puffs = [[-1.05, 0.22, 0.4], [-0.55, 0.04, 0.48], [0, -0.02, 0.52], [0.55, 0.04, 0.48], [1.05, 0.24, 0.38], [-0.75, 0.5, 0.45], [0.2, 0.52, 0.58], [0.85, 0.55, 0.42]];
  for (const [px, py, pr] of puffs) circle(ctx, x + px * R, top + py * R + R * 0.25, pr * R + 5, '#4E5AA8');
  for (const [px, py, pr] of puffs) circle(ctx, x + px * R - 3, top + py * R + R * 0.25 - 5, pr * R, '#7F8CD6');
  for (const [px, py, pr] of puffs.slice(0, 5)) circle(ctx, x + px * R - 6, top + py * R + R * 0.25 - 12, pr * R * 0.55, '#AEB8EE');
}

// a bat (for wkFlock's draw): wings that flap, facing right
function gxBat(c, x, y, s, t, ph) {
  const f = Math.sin(t * 16 + ph * 7), wy = 10 * f * s;
  c.fillStyle = '#0B0E2A';
  c.beginPath(); c.moveTo(x - 22 * s, y - wy); c.quadraticCurveTo(x - 10 * s, y - 2 * s, x, y + 2 * s);
  c.quadraticCurveTo(x + 10 * s, y - 2 * s, x + 22 * s, y - wy); c.quadraticCurveTo(x + 10 * s, y + 6 * s, x, y + 6 * s);
  c.quadraticCurveTo(x - 10 * s, y + 6 * s, x - 22 * s, y - wy); c.fill();
  circle(c, x + 2 * s, y, 4 * s, '#0B0E2A');
}

// ================================================================ the valley: mountains, the lake, mirror images
// o: {hz (screen y of the far shore), dx, ms (mountain scale), mirrorGal: {x, y, s, ang, e} (the galaxy above, to mirror),
//     moonX (screen x of the Moon above: its glitter path), lakeTo (screen y where the near hill starts covering it)}
function gxValley(t, o = {}) {
  screenSpace();
  const hz = o.hz, ms = o.ms || 1, dx = o.dx || 0;
  const iw = GX_MTN.width * ms * 0.6, ih = GX_MTN.height * ms * 0.6, ix = 540 - iw / 2 + dx;
  ctx.drawImage(GX_MTN, ix, hz - ih + 2, iw, ih);
  const lg = ctx.createLinearGradient(0, hz, 0, hz + 700);
  lg.addColorStop(0, GX.lake0); lg.addColorStop(0.3, GX.lake1); lg.addColorStop(1, GX.lake2);
  ctx.fillStyle = lg; ctx.fillRect(0, hz, W, H - hz + 4);
  // the mountains mirrored in rippling strips
  const sh = Math.min(ih, H - hz);
  ctx.save(); ctx.globalAlpha = 0.38;
  for (let y = 0; y < sh; y += 6) {
    const wob = (2 + y * 0.02) * Math.sin(y * 0.09 + t * loopW(1.7));
    const syImg = GX_MTN.height - 1 - (y / ih) * GX_MTN.height;
    if (syImg < 0) break;
    ctx.drawImage(GX_MTN, 0, syImg, GX_MTN.width, Math.max(1, (6 / ih) * GX_MTN.height), ix + wob, hz + y, iw, 6);
  }
  ctx.restore();
  // the galaxy's reflection, faint, in broken bands
  if (o.mirrorGal) {
    const m = o.mirrorGal, my = hz + (hz - m.y) * 0.32;
    if (my < H + 200) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, hz + 4, W, H - hz); ctx.clip();
      gxGalaxy(m.x, my, m.s * 0.9, -m.ang, m.e, { a: 0.35, glow: 0.25 });
      ctx.restore();
    }
  }
  // the Moon's glitter path
  if (o.moonX != null) {
    for (let i = 0; i < 24; i++) {
      const yy = hz + 10 + i * i * 1.7, ww = 26 + i * 8;
      if (yy > H) break;
      const xx = o.moonX + 16 * Math.sin(t * loopW(1.3) + i * 2.1);
      line(ctx, xx - ww / 2, yy, xx + ww / 2, yy, 2 + i * 0.12, rgba('#E6EEFF', 0.55 * (1 - i / 24)));
      if (i % 3 === 0) line(gctx, xx - ww / 3, yy, xx + ww / 3, yy, 3, rgba('#CFE0FF', 0.35 * (1 - i / 24)));
    }
  }
  for (let i = 0; i < 12; i++) {
    const yy = hz + 26 + i * 44, x0 = ((i * 397) % 900) + 40 * Math.sin(t * loopW(0.6) + i);
    line(ctx, x0, yy, x0 + 120 + i * 8, yy, 2, rgba('#FFFFFF', 0.07));
  }
}

// ================================================================ the hilltop camp (world space of a shot's camera)
// the ground from the crest down: a curved crest at y0 between x0 and x1, grass, rocks. o: {tufts}
function gxHill(c, x0, x1, y0, t, o = {}) {
  const crest = (x) => y0 + 30 * Math.sin(x * 0.0021 + 0.6) + 12 * Math.sin(x * 0.009);
  const g = c.createLinearGradient(0, y0 - 40, 0, y0 + 700);
  g.addColorStop(0, GX.hill); g.addColorStop(1, '#0F1B40');
  c.fillStyle = g; c.beginPath(); c.moveTo(x0, y0 + 900);
  for (let x = x0; x <= x1; x += 30) c.lineTo(x, crest(x));
  c.lineTo(x1, y0 + 900); c.closePath(); c.fill();
  // the moonlit lip of the crest
  c.save(); c.lineWidth = 8; c.strokeStyle = rgba(GX.hillHi, 0.9); c.lineCap = 'round'; c.beginPath();
  for (let x = x0; x <= x1; x += 30) { const y = crest(x) + 4; x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
  c.stroke(); c.restore();
  const rnd = mulberry32(o.seed || 23);
  for (let i = 0; i < (o.rocks != null ? o.rocks : 6); i++) {
    const rx = x0 + rnd() * (x1 - x0), ry = crest(rx) + 60 + rnd() * 260, rr = 20 + rnd() * 36;
    ellipse(c, rx, ry, rr, rr * 0.6, GX.rock); ellipse(c, rx - rr * 0.25, ry - rr * 0.2, rr * 0.5, rr * 0.28, GX.rockHi);
  }
  const n = o.tufts != null ? o.tufts : 34;
  for (let i = 0; i < n; i++) {
    const gx = x0 + rnd() * (x1 - x0), gy = crest(gx) + 8 + rnd() * 330;
    for (let j = -2; j <= 2; j++) line(c, gx, gy, gx + j * 9 + 3 * Math.sin(t * loopW(1.1) + i), gy - 32 - 8 * Math.abs(j % 2), 5, j % 2 ? GX.grassHi : GX.grass);
  }
  return crest;
}
// his tent: an A-frame dome, glowing from inside, the door flap open, a string of bulbs along its ridge (s = scale)
function gxTent(c, x, y, s, t) {
  const fl = 0.9 + 0.1 * Math.sin(t * loopW(7)) * Math.sin(t * loopW(4.3));
  c.save(); c.translate(x, y); c.scale(s, s);
  // guy lines
  line(c, -150, -120, -260, 10, 3, '#8E8AB8'); line(c, 150, -120, 260, 10, 3, '#8E8AB8');
  // the body
  c.beginPath(); c.moveTo(-200, 0); c.quadraticCurveTo(-170, -200, 0, -250); c.quadraticCurveTo(170, -200, 200, 0); c.closePath();
  c.fillStyle = GX.tent; c.fill();
  c.beginPath(); c.moveTo(60, 0); c.quadraticCurveTo(80, -170, 0, -250); c.quadraticCurveTo(170, -200, 200, 0); c.closePath();
  c.fillStyle = GX.tentSh; c.fill();
  // the lit door
  c.beginPath(); c.moveTo(-95, 0); c.quadraticCurveTo(-70, -150, -10, -190); c.quadraticCurveTo(30, -130, 40, 0); c.closePath();
  c.fillStyle = GX.tentIn; c.fill();
  // the flap folded back
  c.beginPath(); c.moveTo(-10, -190); c.quadraticCurveTo(30, -130, 40, 0); c.lineTo(90, 0); c.quadraticCurveTo(60, -120, -10, -190); c.closePath();
  c.fillStyle = GX.tentHi; c.fill();
  c.restore();
  // the glow from inside, and the bulbs along the ridge
  const p = (px, py) => [x + px * s, y + py * s];
  const d = p(-30, -80);
  softDot(gctx, d[0], d[1], 170 * s, '#FFB050', 0.75 * fl);
  softDot(ctx, d[0], d[1] + 60 * s, 260 * s, '#FFB060', 0.12 * fl);
  for (let i = 0; i <= 8; i++) {
    const u = i / 8, bx = lerp(-190, 190, u), by = -250 + 250 * Math.pow(Math.abs(u - 0.5) * 2, 1.6) - 18 + 10 * Math.sin(u * Math.PI);
    const q = p(bx, by), col = ['#FFD76A', '#FF8FB0', '#8FE3FF'][i % 3], on = 0.75 + 0.25 * Math.sin(t * loopW(3 + i * 0.4) + i);
    circle(ctx, q[0], q[1], 7 * s, col);
    softDot(gctx, q[0], q[1], 26 * s, col, 0.9 * on);
  }
}
// a lantern on a stake (a practical light: it blooms)
function gxLantern(c, x, y, s, t) {
  rrect(c, x - 7 * s, y - 230 * s, 14 * s, 230 * s, 4 * s); c.fillStyle = '#3A2C3A'; c.fill();
  line(c, x, y - 226 * s, x + 40 * s, y - 226 * s, 7 * s, '#3A2C3A');
  const lx = x + 40 * s, ly = y - 186 * s, fl = 0.85 + 0.15 * Math.sin(t * loopW(9)) * Math.sin(t * loopW(5.3));
  line(c, lx, y - 226 * s, lx, ly - 36 * s, 3 * s, '#2A2A34');
  rrect(c, lx - 20 * s, ly - 36 * s, 40 * s, 64 * s, 8 * s); c.fillStyle = '#2A2A34'; c.fill();
  rrect(c, lx - 14 * s, ly - 28 * s, 28 * s, 48 * s, 6 * s); c.fillStyle = '#FFD27A'; c.fill();
  softDot(gctx, lx, ly - 4 * s, 110 * s, '#FFB050', 0.9 * fl);
  softDot(gctx, lx, ly - 4 * s, 36 * s, '#FFF2C0', 1);
  softDot(ctx, lx, ly - 4 * s, 190 * s, '#FFB060', 0.16 * fl);
}
// a thermos and a steaming mug on a flat rock
function gxCampProps(c, x, y, s, t) {
  ellipse(c, x, y, 110 * s, 34 * s, GX.rock); ellipse(c, x - 20 * s, y - 10 * s, 80 * s, 20 * s, GX.rockHi);
  rrect(c, x - 70 * s, y - 120 * s, 40 * s, 110 * s, 10 * s); c.fillStyle = '#2E9A8C'; c.fill();
  rrect(c, x - 74 * s, y - 132 * s, 48 * s, 20 * s, 6 * s); c.fillStyle = '#C8CCDA'; c.fill();
  rrect(c, x + 10 * s, y - 64 * s, 46 * s, 50 * s, 8 * s); c.fillStyle = '#FF5A6E'; c.fill();
  c.save(); c.lineWidth = 7 * s; c.strokeStyle = '#FF5A6E'; c.beginPath(); c.arc(x + 60 * s, y - 40 * s, 13 * s, -1.3, 1.3); c.stroke(); c.restore();
  for (let i = 0; i < 3; i++) {
    const u = ((t * loopW(0.7) / (Math.PI * 2) + i / 3) % 1);
    circle(c, x + 33 * s + 8 * s * Math.sin(u * 9 + i), y - 76 * s - u * 70 * s, (5 + 5 * u) * s, rgba('#FFFFFF', 0.28 * (1 - u)));
  }
}
// a pine: a dark stacked silhouette with a moonlit left edge
function gxPine(c, x, y, h, w) {
  rrect(c, x - w * 0.06, y - h * 0.18, w * 0.12, h * 0.2, 3); c.fillStyle = '#1A1430'; c.fill();
  for (let i = 0; i < 5; i++) {
    const ty = y - h * (0.15 + i * 0.17), tw = w * (1 - i * 0.17) / 2;
    c.beginPath(); c.moveTo(x - tw, ty); c.lineTo(x, ty - h * 0.3); c.lineTo(x + tw, ty); c.closePath(); c.fillStyle = '#0F1B3C'; c.fill();
    c.beginPath(); c.moveTo(x - tw, ty); c.lineTo(x, ty - h * 0.3); c.lineTo(x - tw * 0.55, ty); c.closePath(); c.fillStyle = '#2A4778'; c.fill();
  }
}

// ================================================================ his camera goggles (head units, origin = his head centre)
// g: {up 0..1 (flipped up onto his hair), rec 0..1 (the REC light), fill 0..1 (the glass filling with light), refl
//     (the galaxy's reflection 0..1), glint 0..1 (a flare across the glass), t}
function gxOnHead(c, st, r, fn) {
  const hp = toWorld(st, r.head);
  c.save(); c.translate(hp[0] + (st.headDX || 0) * st.s, hp[1] + (st.headDY || 0) * st.s); c.rotate(r.lean + (st.headRot || 0)); c.scale(st.s, st.s);
  fn(c); c.restore();
}
function gxGoggles(c, st, r, g) {
  const up = clamp(g.up || 0), t = g.t || 0;
  gxOnHead(c, st, r, (x) => {
    const ly = lerp(2, -60, E.inOutCubic(up)), sq = lerp(1, 0.5, up), R = 27;
    // the strap round his head
    for (const s of [-1, 1]) {
      x.beginPath(); x.moveTo(s * 50, ly - 6 * sq); x.quadraticCurveTo(s * 66, ly - 4 * sq + up * 6, s * 70, ly + 2 + up * 14);
      x.lineWidth = 12; x.strokeStyle = GX.strap; x.lineCap = 'round'; x.stroke();
    }
    // the bridge
    rrect(x, -10, ly - 7 * sq, 20, 12 * sq, 4); x.fillStyle = GX.lensBarrel; x.fill();
    for (const s of [-1, 1]) {
      const cx = s * 27;
      ellipse(x, cx, ly, R + 3, (R + 3) * sq, GX.lensBarrel);
      paint(() => {
        ellipse(x, cx, ly, R - 1, (R - 1) * sq, GX.lensRing);
        // the knurled focus ring
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          line(x, cx + Math.cos(a) * (R - 1), ly + Math.sin(a) * (R - 1) * sq, cx + Math.cos(a) * (R + 2), ly + Math.sin(a) * (R + 2) * sq, 1.6, rgba('#11142A', 0.7));
        }
        // the glass: deep blue, brighter as it fills with light
        const fill = clamp(g.fill || 0);
        const gg = x.createRadialGradient(cx - 6, ly - 6 * sq, 2, cx, ly, R - 4);
        gg.addColorStop(0, mixH(GX.lensGlass1, '#B9A8FF', fill)); gg.addColorStop(1, mixH(GX.lensGlass0, '#3A2C9A', fill));
        x.fillStyle = gg; x.beginPath(); x.ellipse(cx, ly, R - 5, (R - 5) * sq, 0, 0, Math.PI * 2); x.fill();
        // the galaxy mirrored in the glass: a small tilted glowing streak with a bright middle, and two stars
        const rf = clamp(g.refl != null ? g.refl : 1) * (1 - up * 0.7);
        if (rf > 0.02) {
          x.save(); x.beginPath(); x.ellipse(cx, ly, R - 5, (R - 5) * sq, 0, 0, Math.PI * 2); x.clip();
          x.translate(cx + 3, ly - 3 * sq); x.rotate(-0.55);
          ellipse(x, 0, 0, 15, 4.5 * sq, rgba('#C9B8FF', 0.55 * rf));
          ellipse(x, 0, 0, 6, 2.4 * sq, rgba('#FFF2CC', 0.95 * rf));
          x.restore();
          circle(x, cx - 11, ly + 8 * sq, 1.4, rgba('#FFFFFF', 0.9 * rf)); circle(x, cx + 9, ly + 11 * sq, 1.1, rgba('#FFFFFF', 0.8 * rf));
        }
        // a white highlight arc, and the glint sweeping across
        x.save(); x.lineWidth = 3.2; x.lineCap = 'round'; x.strokeStyle = 'rgba(255,255,255,0.75)';
        x.beginPath(); x.ellipse(cx, ly, R - 9, (R - 9) * sq, 0, -2.55, -1.75); x.stroke(); x.restore();
        const gl = clamp(g.glint || 0);
        if (gl > 0.02 && gl < 0.98) {
          x.save(); x.beginPath(); x.ellipse(cx, ly, R - 5, (R - 5) * sq, 0, 0, Math.PI * 2); x.clip();
          const gxp = lerp(-R, R, gl);
          x.translate(cx + gxp, ly); x.rotate(0.5); x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(-4, -R, 8, 2 * R); x.restore();
        }
      });
    }
    // the REC light on the left barrel's rim
    const rec = clamp(g.rec || 0);
    circle(x, -27 - 19, ly - 19 * sq, 5.5, rec > 0.5 ? '#FF3B4E' : '#5A2030');
    if (rec > 0.5) {
      const p = toWorld(st, r.head);
      softDot(gctx, p[0] + (st.headDX || 0) * st.s - 46 * st.s, p[1] + (ly - 19 * sq) * st.s, 26 * st.s, '#FF3B4E', 0.9 * rec);
    }
  });
  // the glass glows when it fills with light (the bloom), in world coordinates
  const fill = clamp(g.fill || 0);
  if (fill > 0.02 || (g.refl || 0) > 0.5) {
    const hp = toWorld(st, r.head), hx = hp[0] + (st.headDX || 0) * st.s, hy = hp[1] + (st.headDY || 0) * st.s;
    const ly = lerp(2, -60, E.inOutCubic(up));
    for (const s of [-1, 1]) softDot(gctx, hx + s * 27 * st.s, hy + ly * st.s, 30 * st.s * (0.6 + fill), '#B9A8FF', 0.55 * Math.max(fill, 0.25 * (1 - up)));
  }
}

// ================================================================ labels, the stopwatch
// a label pill in screen space (a black patch in the glow layer under it, so nothing blooms over the words)
function gxTag(txt, x, y, col, k, size = 40, rot = 0, fill = 'rgba(14,16,40,0.86)') {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = E.outBack(clamp(k)); ctx.scale(sc, sc);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.55;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.rotate(rot);
  rrect(gctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, h / 2 + 14); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill(); gctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, size * 0.04);
  ctx.restore();
}
// a stopwatch (screen space): face radius r, sweep 0..1 of a full turn, the readout text under the hand, k pops it
function gxWatch(x, y, r, sweep, txt, k, col = '#4DFFB4') {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); const sc = E.outBack(clamp(k)); ctx.scale(sc, sc);
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); circle(gctx, 0, 0, r + 24, 'rgba(0,0,0,1)'); gctx.restore();
  rrect(ctx, -16, -r - 34, 32, 26, 6); ctx.fillStyle = '#C8CCDA'; ctx.fill();
  circle(ctx, 0, 0, r + 12, '#C8CCDA'); circle(ctx, 0, 0, r, '#101436');
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(sweep)); ctx.closePath();
  ctx.fillStyle = rgba(col, 0.35); ctx.fill(); ctx.restore();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, Math.sin(a) * (r - 6), -Math.cos(a) * (r - 6), Math.sin(a) * (r - 18), -Math.cos(a) * (r - 18), 4, '#8E95C0'); }
  const a = Math.PI * 2 * sweep;
  line(ctx, 0, 0, Math.sin(a) * (r - 14), -Math.cos(a) * (r - 14), 7, col); circle(ctx, 0, 0, 9, col);
  ctx.font = `900 ${Math.round(r * 0.42)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
  ctx.fillText(txt, 0, r * 0.45);
  ctx.restore();
}
