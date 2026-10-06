// Spicy-food Short: the chilli stall at a night market. An open stall under a striped awning (string lights, a
// CHILLI CHALLENGE banner, strings of dried chillies, paper lanterns), the night market behind it, a wooden counter in
// front; the hero behind the counter in a teal short-sleeved shirt (same face, hair and proportions as ever) with a
// chilli in his right hand. Plus the things that happen to him: the chilli itself (whole, bitten, or with a face), the
// bite, the red that climbs his face, steam out of his ears, the jet of flame, a mouth thermometer, the sprinkler on
// his head, the plate, the heap, a crosshair.
// World coords: 1080x1920 at zoom 1. Every time comes from a cue (scenes.js); nothing here is timed.
'use strict';

const ST = {
  hx: 540, seatY: 1190, hs: 1.3,        // the hero's rig origin and scale (his head centre lands at y = 823, his mouth at 875)
  topY: 1075, frontY: 1215,             // the counter top: back edge and front edge
  plate: [900, 1136],                   // the little plate on his right
  heap: [926, 1164],                    // the heap that arrives at the end: wholly outside the frame-1 close-up (x < 716)
};
const CHPAL = Object.assign({}, PAL, { coat: '#19A79A', coatSh: '#0E7268', coatHi: '#62E2D4', coatDk: '#0A544D', shortSleeve: true, pj: true });
const CHRED = Object.assign({}, CHPAL, { skin: '#F2644A', skinSh: '#C23A2A', skinHi: '#FF9478' });   // his face when it burns
let ST_WALL = null;
// an angular speed that fits the runtime n times: ambient motion made with it is the same on the last frame as on the first
const stW = (n) => (2 * Math.PI * n) / TLd.duration;

// ---------------------------------------------------------------- the chilli
// A red chilli. Origin = the cap (where the stem meets the pod); the pod runs along +x for 150 units and curls toward +y
// (flip mirrors the curl). o: {bitten 0..1 (the tip is gone), flip, dark (0..1, in shade)}
function chilliPod(c, x, y, s, rot, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, o.flip ? -s : s);
  const bit = o.bitten || 0, cut = 150 - 50 * bit;
  const body = () => { c.beginPath(); c.moveTo(0, -19); c.bezierCurveTo(52, -27, 112, -16, 152, 36); c.bezierCurveTo(104, 31, 50, 30, 0, 19); c.closePath(); };
  const bite = () => { for (let i = 0; i < 3; i++) c.arc(cut, -33 + i * 26 + 13, 13, -Math.PI / 2, Math.PI / 2, true); };
  c.save();
  if (bit > 0) { c.beginPath(); c.moveTo(-70, -90); c.lineTo(cut, -90); c.lineTo(cut, -33); bite(); c.lineTo(cut, 90); c.lineTo(-70, 90); c.closePath(); c.clip(); }
  body();
  const g = c.createLinearGradient(0, -24, 0, 34); g.addColorStop(0, '#FF5F4C'); g.addColorStop(0.38, '#E3182B'); g.addColorStop(1, '#8E0C1C');
  c.fillStyle = g; c.fill();
  c.beginPath(); c.moveTo(14, -10); c.bezierCurveTo(52, -17, 96, -10, 124, 12); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,205,185,0.6)'; c.stroke();
  if (bit > 0) {                           // the bitten end: pale flesh and seeds
    body(); c.clip();
    c.beginPath(); c.moveTo(cut, -33); bite(); c.lineWidth = 9; c.strokeStyle = '#FFB59A'; c.stroke();
    c.lineWidth = 3; c.strokeStyle = '#FFE3C8'; c.stroke();
    for (let i = 0; i < 3; i++) ellipse(c, cut - 13, -16 + i * 13, 3.2, 2.2, '#FFF1C8', 0.5);
  }
  c.restore();
  // the green cap and the stem
  c.beginPath(); c.moveTo(-6, -22); c.quadraticCurveTo(10, -24, 16, -12); c.quadraticCurveTo(8, -4, 18, 2); c.quadraticCurveTo(8, 6, 14, 16); c.quadraticCurveTo(4, 24, -6, 22); c.quadraticCurveTo(-14, 0, -6, -22); c.closePath();
  c.fillStyle = '#3C9A3C'; c.fill();
  c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-26, -4, -38, -24); c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = '#2E7D32'; c.stroke();
  c.lineWidth = 4; c.strokeStyle = '#6CC46A'; c.stroke();
  if (o.dark) { body(); c.fillStyle = `rgba(20,6,30,${0.5 * o.dark})`; c.fill(); }
  c.restore();
}

// The chilli as a little villain, upright: a plump pod with its cap as a hat, eyes, brows, a smug mouth, stick arms and legs.
// Origin = the ground under it; it is 290 units tall with the stem. o: {look: [x, y], mood: 'smug' | 'evil' | 'wink' | 'o',
// armL / armR: [x, y] hand targets (local), legs (default true), step (walk phase), bitten (a bite out of its tip), lean}
function chilliGuy(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'smug', look = o.look || [0, 0], legs = o.legs !== false;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.lean || 0);
  const st = o.step === undefined ? null : o.step;
  if (legs) for (const [sd, hx0, fx0] of [[-1, -2, -8], [1, 26, 36]]) {
    const up = st === null ? 0 : Math.max(0, Math.sin(st + (sd > 0 ? Math.PI : 0))), fx = fx0 + (st === null ? 0 : 10 * Math.cos(st + (sd > 0 ? Math.PI : 0)));
    line(c, hx0, -48, fx, 4 - 16 * up, 9, '#7A0A18');
    ellipse(c, fx + 7, 8 - 16 * up, 15, 8, '#3A0610');
  }
  const arm = (sd, target) => {
    const sx = sd * 50, sy = -150, tx = target ? target[0] : sd * 66, ty = target ? target[1] : -104;
    const mx = (sx + tx) / 2 + sd * 14, my = (sy + ty) / 2 + 16;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = '#7A0A18'; c.stroke();
    circle(c, tx, ty, 13, '#7A0A18'); circle(c, tx - 1, ty - 1, 10, '#F23A44');
  };
  arm(-1, o.armL);
  if (!o.armRFront) arm(1, o.armR);
  // the body
  const body = () => {
    c.beginPath(); c.moveTo(-38, -222); c.quadraticCurveTo(0, -238, 38, -222);
    c.bezierCurveTo(72, -200, 68, -110, 36, -62); c.bezierCurveTo(24, -32, 0, -12, -36, 0);
    c.bezierCurveTo(-22, -22, -40, -52, -52, -100); c.bezierCurveTo(-70, -160, -62, -205, -38, -222); c.closePath();
  };
  c.save();
  if (o.bitten) { c.beginPath(); c.rect(-120, -320, 240, 276); c.arc(-22, -40, 15, Math.PI, 0, true); c.arc(8, -40, 15, Math.PI, 0, true); c.clip(); }
  body();
  const g = c.createRadialGradient(-20, -176, 8, 0, -120, 150); g.addColorStop(0, '#FF7A66'); g.addColorStop(0.3, '#EC2334'); g.addColorStop(1, '#8E0C1C');
  c.fillStyle = g; c.fill();
  c.beginPath(); c.moveTo(-40, -196); c.quadraticCurveTo(-56, -150, -42, -100); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,210,195,0.5)'; c.stroke();
  if (o.bitten) { body(); c.clip(); c.beginPath(); c.arc(-22, -40, 15, Math.PI, 0, true); c.arc(8, -40, 15, Math.PI, 0, true); c.lineWidth = 9; c.strokeStyle = '#FFB59A'; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#FFE3C8'; c.stroke(); }
  c.restore();
  // the cap, worn as a hat, and the stem
  c.beginPath(); c.moveTo(-50, -212); c.quadraticCurveTo(-40, -244, 0, -246); c.quadraticCurveTo(40, -244, 50, -212);
  c.quadraticCurveTo(38, -204, 30, -214); c.quadraticCurveTo(20, -198, 8, -212); c.quadraticCurveTo(0, -196, -10, -212); c.quadraticCurveTo(-20, -198, -30, -214); c.quadraticCurveTo(-40, -204, -50, -212); c.closePath();
  c.fillStyle = '#3C9A3C'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1F5E24'; c.stroke();
  c.beginPath(); c.moveTo(0, -244); c.quadraticCurveTo(4, -272, 26, -288); c.lineWidth = 14; c.lineCap = 'round'; c.strokeStyle = '#2E7D32'; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#6CC46A'; c.stroke();
  // the face
  const lx = look[0] * 6, ly = look[1] * 5, ey = -160;
  for (const sd of [-1, 1]) {
    const ex = sd * 21;
    if (mood === 'wink' && sd > 0) { c.beginPath(); c.moveTo(ex - 13, ey - 2); c.quadraticCurveTo(ex, ey + 9, ex + 13, ey - 2); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#3A0610'; c.stroke(); }
    else {
      const ry = mood === 'o' ? 19 : mood === 'evil' ? 12 : 15;
      ellipse(c, ex, ey, 15, ry, '#FFFFFF'); circle(c, ex + lx, ey + ly * (ry / 15), 7.2, '#22060C'); circle(c, ex + lx - 2.4, ey + ly * (ry / 15) - 2.6, 2.6, '#FFFFFF');
    }
    const bt = mood === 'o' ? -0.5 : 1;    // brows: slanted in (scheming), or up (surprised)
    line(c, sd * 38, ey - 27 - 5 * bt - (mood === 'o' ? 8 : 0), sd * 8, ey - 20 + 5 * bt - (mood === 'o' ? 8 : 0), 7, '#5A0812');
  }
  if (mood === 'o') ellipse(c, 0, -122, 9, 11, '#3A0610');
  else if (mood === 'evil') {
    c.beginPath(); c.moveTo(-26, -132); c.quadraticCurveTo(0, -102, 28, -136); c.quadraticCurveTo(0, -122, -26, -132); c.closePath(); c.fillStyle = '#3A0610'; c.fill();
    c.save(); c.clip(); c.fillStyle = '#FFFFFF'; c.fillRect(-30, -136, 60, 9); c.restore();
  } else { c.beginPath(); c.moveTo(-18, -126); c.quadraticCurveTo(4, -112, 24, -134); c.lineWidth = 5.5; c.lineCap = 'round'; c.strokeStyle = '#3A0610'; c.stroke(); line(c, 24, -134, 29, -140, 4, '#3A0610'); }
  if (o.armRFront) arm(1, o.armR);
  c.restore();
}

// ---------------------------------------------------------------- fire, steam, water
// A jet of flame from (x, y) along angle a (under the current camera). len, w = its size, k 0..1 = how alive it is.
function fireJet(x, y, a, len, w, t, k, seed = 1) {
  if (k <= 0.01) return;
  const L = len * (0.55 + 0.45 * k), N = 22;
  const layers = [['#D8200E', 1, 1, 0.9], ['#FF5A12', 0.8, 0.9, 0.95], ['#FFB01E', 0.55, 0.76, 0.95], ['#FFF6B8', 0.28, 0.5, 0.95]];
  for (const c of [ctx, gctx]) {
    c.save(); c.translate(x, y); c.rotate(a);
    layers.forEach(([col, wk, lk, al], li) => {
      if (c === gctx && li > 1) return;
      const up = [], dn = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, px = u * L * lk, wob = 20 * u * vnoise(t * 5.5 + u * 3, seed + li) * (w / 120);
        const prof = Math.min(1, 0.1 + 1.45 * u) * (1 - Math.pow(u, 4.5)) * (0.86 + 0.14 * Math.sin(Math.PI * u));
        const hw = w * wk * k * prof * (1 + 0.2 * vnoise(t * 10 + u * 8, seed + 9 + li) + 0.16 * Math.sin(u * 19 - t * 26 + li));
        up.push([px, wob - hw]); dn.push([px, wob + hw]);
      }
      c.beginPath(); c.moveTo(0, 0);
      up.forEach((p) => c.lineTo(p[0], p[1])); dn.reverse().forEach((p) => c.lineTo(p[0], p[1]));
      c.closePath(); c.fillStyle = rgba(col, (c === gctx ? 0.62 : al) * Math.min(1, k * 1.6)); c.fill();
    });
    // embers
    for (let i = 0; i < 16; i++) {
      const p = (t * (1.1 + 0.7 * hash(i + seed)) + hash(i * 3.1 + seed)) % 1, px = L * (0.3 + 0.95 * p), py = (hash(i * 7.7 + seed) - 0.5) * w * 2.2 * p + 26 * p * Math.sin(t * 7 + i);
      const r = (3 + 5 * hash(i + 11)) * (1 - p) * (w / 110 + 0.4) * k;
      circle(c, px, py, r, rgba(i % 3 ? '#FFC44A' : '#FF7A2A', (1 - p) * (c === gctx ? 0.7 : 0.95)));
    }
    c.restore();
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; softDot(ctx, x + Math.cos(a) * L * 0.4, y + Math.sin(a) * L * 0.4, L * 0.9 + w, '#FF7A1E', 0.14 * k); ctx.restore();
}
// puffs of steam from (x, y) drifting along dir (-1 left, 1 right); k = strength, jet = how hard it blows
function earSteam(x, y, dir, t, k, jet = 0, seed = 1) {
  if (k <= 0.01) return;
  for (let i = 0; i < 9; i++) {
    const p = (t * (1.7 + 1.4 * jet) + i / 9 + hash(seed)) % 1, d = (18 + (150 + 190 * jet) * p);
    const px = x + dir * d, py = y - (56 - 40 * jet) * p * p - 10 * Math.sin(p * 6 + i) * (1 - jet), r = (9 + 34 * p) * (1 - 0.3 * jet);
    circle(ctx, px, py, r, `rgba(244,246,255,${0.62 * (1 - p) * k})`);
    softDot(gctx, px, py, r * 1.8, '#FFD9C8', 0.18 * (1 - p) * k);
  }
  if (jet > 0.2) for (const c of [ctx]) { c.save(); c.globalAlpha = 0.5 * jet * k; line(c, x + dir * 10, y, x + dir * 110, y - 6, 9, '#FFFFFF'); c.restore(); }
}
// a curl of smoke rising from (x, y): age 0..1
function smokeCurl(x, y, age, t, seed = 1, col = '#D9D9EA') {
  if (age <= 0 || age >= 1) return;
  const c = ctx;
  c.beginPath();
  for (let i = 0; i <= 22; i++) { const u = i / 22, py = y - u * 300 * Math.min(1, age * 2.4), px = x + 30 * u * Math.sin(u * 7 + t * 2.6 + seed) + 36 * u * u * (seed % 2 ? 1 : -1); i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = rgba(col, 0.5 * (1 - age) * Math.min(1, age * 9)); c.stroke();
}

// ---------------------------------------------------------------- the stall (static part)
function initStall() {
  ST_WALL = mkCanvas(1500, 1500);
  const x = ST_WALL.getContext('2d'), rng = mulberry32(73);
  x.translate(210, 100);                                  // world (0, 0) sits at (210, 100): the canvas covers x -210..1290, y -100..1400
  let g = x.createLinearGradient(0, -100, 0, 1400);
  g.addColorStop(0, '#070A22'); g.addColorStop(0.45, '#181746'); g.addColorStop(1, '#3B2052');
  x.fillStyle = g; x.fillRect(-210, -100, 1500, 1500);
  // ---- the market behind the stall, out of focus
  x.filter = 'blur(5px)';
  for (let bx = -210; bx < 1290;) {
    const bw = 70 + rng() * 120, bh = 190 + rng() * 300;
    x.fillStyle = '#12113A'; x.fillRect(bx, 1040 - bh, bw, bh + 300);
    for (let yy = 1040 - bh + 18; yy < 880; yy += 34) for (let xx = bx + 10; xx < bx + bw - 14; xx += 22) if (rng() < 0.3) { x.fillStyle = rng() < 0.75 ? 'rgba(255,205,130,0.55)' : 'rgba(150,215,255,0.5)'; x.fillRect(xx, yy, 9, 13); }
    bx += bw + 4;
  }
  g = x.createLinearGradient(0, 700, 0, 1100); g.addColorStop(0, 'rgba(255,140,70,0)'); g.addColorStop(1, 'rgba(255,140,70,0.45)');
  x.fillStyle = g; x.fillRect(-210, 700, 1500, 400);
  for (const [sx, sw, col] of [[-150, 290, '#B8324A'], [200, 210, '#2E8F8A'], [690, 220, '#C9772E'], [960, 300, '#8E3A8A']]) {
    const sy = 880;
    x.fillStyle = 'rgba(255,205,125,0.62)'; x.fillRect(sx + 6, sy + 40, sw - 12, 120);
    x.fillStyle = col; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + sw, sy); x.lineTo(sx + sw + 20, sy + 46); x.lineTo(sx - 20, sy + 46); x.closePath(); x.fill();
    for (let i = 0; i < 3; i++) { const px = sx + 34 + rng() * (sw - 68); x.fillStyle = '#160C26'; x.beginPath(); x.arc(px, sy + 96, 14, 0, 7); x.fill(); x.fillRect(px - 16, sy + 108, 32, 70); }
    x.fillStyle = '#1A0F2A'; x.fillRect(sx - 6, sy + 150, sw + 12, 200);
  }
  x.filter = 'blur(2px)';
  for (let i = 0; i < 44; i++) {                          // bokeh
    const px = -200 + rng() * 1480, py = 500 + rng() * 480, r = 10 + rng() * 30;
    const col = ['#FFB24A', '#FF7A3C', '#FFD98A', '#FF5A6E', '#6FD8E8'][Math.floor(rng() * 5)];
    const gg = x.createRadialGradient(px, py, 0, px, py, r); gg.addColorStop(0, rgba(col, 0.42)); gg.addColorStop(0.72, rgba(col, 0.26)); gg.addColorStop(1, rgba(col, 0));
    x.fillStyle = gg; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  }
  x.filter = 'none';
  // ---- the stall itself: roof, awning, posts, banner, dried chillies, lanterns
  for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${0.25 + 0.6 * rng()})`; x.beginPath(); x.arc(-200 + rng() * 1480, -90 + rng() * 330, 0.9 + rng() * 1.9, 0, 7); x.fill(); }
  for (const [y0, sag, ph] of [[20, 70, 0], [118, 54, 0.5]]) {          // bunting over the lane
    x.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, px = -210 + u * 1500, py = y0 + sag * Math.sin(Math.PI * u); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.lineWidth = 3; x.strokeStyle = '#2A2440'; x.stroke();
    for (let i = 0; i < 17; i++) {
      const u = (i + ph) / 17, px = -210 + u * 1500, py = y0 + sag * Math.sin(Math.PI * u);
      x.fillStyle = ['#C7283A', '#F0C24A', '#2E8F8A', '#E8E0D0'][i % 4]; x.globalAlpha = 0.8;
      x.beginPath(); x.moveTo(px - 26, py); x.lineTo(px + 26, py); x.lineTo(px, py + 54); x.closePath(); x.fill(); x.globalAlpha = 1;
    }
  }
  x.fillStyle = '#3A0A14'; x.fillRect(-210, 226, 1500, 30);            // the awning's top rail
  for (let i = 0; i < 14; i++) {                          // the striped awning with a scalloped edge
    const ax = -120 + i * 96, red = i % 2 === 0;
    g = x.createLinearGradient(0, 250, 0, 480);
    if (red) { g.addColorStop(0, '#7A1424'); g.addColorStop(1, '#D02C40'); } else { g.addColorStop(0, '#9C8E7A'); g.addColorStop(1, '#F6E8CE'); }
    x.fillStyle = g; x.beginPath(); x.moveTo(ax, 250); x.lineTo(ax + 96, 250); x.lineTo(ax + 96, 432); x.arc(ax + 48, 432, 48, 0, Math.PI); x.closePath(); x.fill();
  }
  g = x.createLinearGradient(0, 432, 0, 560); g.addColorStop(0, 'rgba(4,2,14,0.5)'); g.addColorStop(1, 'rgba(4,2,14,0)');
  x.fillStyle = g; x.fillRect(-210, 432, 1500, 128);
  for (const px of [20, 1024]) {                          // posts
    g = x.createLinearGradient(px, 0, px + 36, 0); g.addColorStop(0, '#5A3226'); g.addColorStop(0.5, '#3E2018'); g.addColorStop(1, '#22100C');
    x.fillStyle = g; x.fillRect(px, 300, 36, 1100);
  }
  // the banner
  line(x, 300, 430, 300, 566, 5, '#B9A27A'); line(x, 780, 430, 780, 566, 5, '#B9A27A');
  x.save(); x.translate(540, 612); x.rotate(-0.012);
  rrect(x, -282, -56, 564, 112, 12); g = x.createLinearGradient(0, -56, 0, 56); g.addColorStop(0, '#D02A3E'); g.addColorStop(1, '#9A1426'); x.fillStyle = g; x.fill();
  x.lineWidth = 6; x.strokeStyle = '#FFE2A8'; x.stroke();
  x.font = '400 66px Anton'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(60,0,10,0.5)'; x.fillText('CHILLI CHALLENGE', 0, 8);
  x.fillStyle = '#FFE9B8'; x.fillText('CHILLI CHALLENGE', 0, 4);
  x.restore();
  // strings of dried chillies
  for (const [rx, n] of [[128, 20], [954, 20]]) {
    line(x, rx, 440, rx, 800, 4, '#6A4A2A');
    for (let i = 0; i < n; i++) { const yy = 480 + (i / n) * 330, sd = i % 2 ? 1 : -1; chilliPod(x, rx, yy, 0.44 + 0.1 * rng(), Math.PI / 2 - sd * (0.5 + 0.5 * rng()), { flip: sd > 0, dark: 0.25 }); }
  }
  // paper lanterns (their glow is drawn every frame)
  for (const lx of [236, 846]) {
    line(x, lx, 440, lx, 672, 3, '#B9A27A');
    g = x.createRadialGradient(lx - 12, 716, 6, lx, 724, 70); g.addColorStop(0, '#FFE9A8'); g.addColorStop(0.5, '#FF9A3C'); g.addColorStop(1, '#D0521A');
    x.fillStyle = g; x.beginPath(); x.ellipse(lx, 724, 50, 58, 0, 0, 7); x.fill();
    for (let i = -2; i <= 2; i++) { x.beginPath(); x.ellipse(lx, 724, Math.abs(50 * Math.cos(i * 0.5)) , 58, 0, 0, 7); x.lineWidth = 2; x.strokeStyle = 'rgba(140,40,10,0.35)'; x.stroke(); }
    rrect(x, lx - 20, 662, 40, 12, 4); x.fillStyle = '#3A1A12'; x.fill(); rrect(x, lx - 20, 776, 40, 12, 4); x.fill();
    line(x, lx, 788, lx, 826, 4, '#D0521A');
  }
}

// the stall behind him. o: {warm 0..1 (the lights flinch), fire 0..1 (the flame lights the place)}
function stallBack(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx, warm = o.warm === undefined ? 1 : o.warm;
  c.drawImage(ST_WALL, -210, -100);
  for (const lx of [236, 846]) {
    const fl = (0.86 + 0.14 * Math.sin(stW(9) * t + lx)) * warm;
    softDot(gctx, lx, 724, 120, '#FF9A3C', 0.7 * fl);
    c.save(); c.globalCompositeOperation = 'lighter'; softDot(c, lx, 724, 330, '#FF8A3C', 0.16 * fl); c.restore();
  }
  // the string of bulbs under the awning
  c.beginPath();
  for (let i = 0; i <= 30; i++) { const u = i / 30, px = 38 + u * 1004, py = 476 + 36 * Math.sin(Math.PI * u); i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.lineWidth = 3; c.strokeStyle = '#1A1020'; c.stroke();
  for (let i = 0; i < 12; i++) {
    const u = (i + 0.5) / 12, px = 38 + u * 1004, py = 482 + 36 * Math.sin(Math.PI * u);
    const tw = (0.72 + 0.28 * Math.sin(stW(5 + (i % 4)) * t + i * 1.9)) * warm, col = ['#FFE2A6', '#FFB65A', '#FF8A7A'][i % 3];
    circle(c, px, py + 6, 9, col); softDot(gctx, px, py + 6, 40, col, 0.75 * tw);
    c.save(); c.globalCompositeOperation = 'lighter'; softDot(c, px, py + 6, 90, '#FFB65A', 0.10 * tw); c.restore();
  }
  if (o.fire > 0) { c.save(); c.globalCompositeOperation = 'lighter'; softDot(c, 760, 800, 900, '#FF6A1E', 0.26 * o.fire); c.restore(); }
}

// the counter in front of him (drawn after him)
function stCounter(c, t) {
  const y0 = ST.topY, y1 = ST.frontY;
  c.beginPath(); c.moveTo(-90, y0); c.lineTo(1170, y0); c.lineTo(1250, y1); c.lineTo(-170, y1); c.closePath();
  let g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#6E4226'); g.addColorStop(1, '#9A6238');
  c.fillStyle = g; c.fill();
  for (let i = 0; i < 6; i++) { const yy = y0 + 14 + i * 23; line(c, -150, yy, 1230, yy + 3 * Math.sin(i * 2.1), 2, 'rgba(60,28,12,0.28)'); }
  line(c, -90, y0 + 2, 1170, y0 + 2, 4, 'rgba(255,205,150,0.35)');
  g = c.createLinearGradient(0, y1, 0, 1920); g.addColorStop(0, '#4A2616'); g.addColorStop(0.08, '#35190F'); g.addColorStop(1, '#120807');
  c.fillStyle = g; c.fillRect(-200, y1, 1500, 900);
  for (let px = -110; px < 1250; px += 196) line(c, px, y1 + 30, px, 2000, 5, 'rgba(8,3,3,0.45)');
  c.fillStyle = '#5A311B'; c.fillRect(-200, y1, 1500, 24);
  line(c, -200, y1 + 1, 1300, y1 + 1, 3, 'rgba(255,200,140,0.3)');
}
// a small plate with a few chillies on it. (x, y) = its centre
function stPlate(c, x, y, s, n = 4) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 8, 122, 30, 'rgba(0,0,0,0.3)');
  ellipse(c, 0, 0, 118, 30, '#D8D2C6'); ellipse(c, 0, -4, 112, 26, '#F7F3EA'); ellipse(c, 0, -2, 78, 16, '#E9E3D6');
  const rng = mulberry32(5);
  for (let i = 0; i < n; i++) chilliPod(c, -62 + i * 30 + 8 * rng(), -20 - 6 * rng(), 0.62, 0.1 + (rng() - 0.5) * 0.5, { flip: i % 2 === 0 });
  c.restore();
}
// The heap: a wooden bowl piled with chillies, and a flag stuck in it. (x, y) = the middle of its foot.
// o: {flag 0..1+ (the flag springs up), wob (radians), take (one chilli fewer on top)}
function stHeap(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.wob || 0); c.scale(s, s);
  ellipse(c, 0, 6, 150, 22, 'rgba(0,0,0,0.35)');
  const rng = mulberry32(29);
  const pods = [];
  for (let i = 0; i < 46; i++) { const a = Math.PI * (0.04 + 0.92 * rng()), d = Math.sqrt(rng()), px = -Math.cos(a) * 124 * d, py = -70 - Math.sin(a) * 150 * d * (1 - 0.3 * Math.abs(Math.cos(a))); pods.push([px, py, rng() * 6.28, 0.6 + 0.2 * rng(), rng() < 0.5]); }
  pods.sort((p, q) => p[1] - q[1]);
  for (const [px, py, rot, sc, fl] of pods) chilliPod(c, px, py, sc, rot, { flip: fl });
  // the bowl
  c.beginPath(); c.moveTo(-152, -76); c.bezierCurveTo(-146, -16, -86, 4, 0, 4); c.bezierCurveTo(86, 4, 146, -16, 152, -76); c.closePath();
  const g = c.createLinearGradient(-152, 0, 152, 0); g.addColorStop(0, '#C98A4A'); g.addColorStop(0.45, '#9A5E2C'); g.addColorStop(1, '#5A3216');
  c.fillStyle = g; c.fill();
  c.beginPath(); c.ellipse(0, -76, 152, 20, 0, 0, Math.PI); c.lineWidth = 7; c.strokeStyle = '#E0A868'; c.stroke();
  for (const [px, py, rot, sc, fl] of pods.filter((p) => p[1] > -92).slice(-7)) chilliPod(c, px, Math.min(py, -84), sc, rot, { flip: fl });
  // the placard on a stick
  const fk = o.flag || 0;
  if (fk > 0.01) {
    c.save(); c.translate(-36, -200); c.rotate(-0.07 + 0.3 * (1 - Math.min(1, fk)) + 0.025 * Math.sin(t * 5)); c.scale(Math.min(1.12, fk), Math.min(1.12, fk));
    line(c, 0, 40, 0, -96, 8, '#E8D9B8');
    rrect(c, -86, -166, 172, 84, 12); c.fillStyle = '#FFD447'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#7A4A08'; c.stroke();
    c.font = '400 60px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C2182B'; c.fillText('EXTRA', 0, -121);
    c.restore();
  }
  c.restore();
}

// ---------------------------------------------------------------- the hero behind the counter
function stLayer(cam, st, o, draw) {
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const r = draw(lctx);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  // the lanterns from above, the dusk of the counter below; a fire lights him from the right
  const hy = H / 2 + (st.y - 370 * st.s - cam.y) * cam.zoom, ty = H / 2 + (ST.topY - cam.y) * cam.zoom;
  const g = lctx.createLinearGradient(0, hy - 120 * cam.zoom, 0, ty + 40);
  g.addColorStop(0, 'rgba(255,190,120,0.14)'); g.addColorStop(0.5, 'rgba(255,170,110,0.03)'); g.addColorStop(1, 'rgba(40,10,50,0.42)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  const fl = o.fireLight || 0;
  if (fl > 0.01) {
    const gx = lctx.createLinearGradient(W * 0.2, 0, W, 0); gx.addColorStop(0, 'rgba(255,120,30,0)'); gx.addColorStop(1, `rgba(255,120,30,${0.4 * fl})`);
    lctx.fillStyle = gx; lctx.fillRect(0, 0, W, H);
  }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  return r;
}
function stFist(c, x, y, pal, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  ellipse(c, 0, 0, 25, 22, pal.skinSh); ellipse(c, -1, -2, 22, 19, pal.skin);
  for (let i = 0; i < 3; i++) line(c, -14, -9 + i * 8, 13, -10 + i * 8, 2.2, 'rgba(160,96,70,0.55)');
  c.restore();
}
// reach with the elbow hanging down (of the two-bone IK's two answers, the one whose elbow is lower)
function stReach(pose, side, target) {
  const a = ikReach(pose, side, target, 1), b = ikReach(pose, side, target, -1);
  return rig(a)['el' + side][1] >= rig(b)['el' + side][1] ? a : b;
}
// his own mouth while he bites: jaw 1 = wide open, 0 = teeth clenched; chew slides a shut mouth from side to side
function stBiteMouth(c, jaw, pal, chew = 0) {
  const h = 13 + 27 * jaw, w = 50;
  c.save(); c.translate(chew * 5, 40);
  rrect(c, -w / 2, -8, w, h, 9 + 6 * jaw); c.fillStyle = pal.mouth; c.fill();
  if (jaw > 0.3) ellipse(c, 0, h - 15, 15, 7, pal.tongue);
  c.restore();
}
function stBiteTeeth(c, jaw, pal, chew = 0) {
  const h = 13 + 27 * jaw, w = 50;
  c.save(); c.translate(chew * 5, 40);
  rrect(c, -w / 2 + 3, -8, w - 6, 9, 4); c.fillStyle = pal.teeth; c.fill();
  if (jaw < 0.45) { rrect(c, -w / 2 + 3, -8 + h - 8, w - 6, 8, 4); c.fill(); line(c, -w / 2 + 5, -8 + h / 2, w / 2 - 5, -8 + h / 2, 2, 'rgba(90,21,34,0.6)'); }
  c.restore();
}
// o: {face, jaw (0..1: his own biting mouth is drawn; the face's mouth must be 'none'), chew, right: [x, y] / left: [x, y] (rig-local wrists),
//     chilli: {bitten, rot, s, guy: {...chilliGuy options} | null} | null, atMouth 0..1 (the chilli's tip is between his teeth),
//     flush 0..1 (how far the red has climbed his face), headDX, headDY, headRot, lean, frizz, jolt, fireLight, thermo 0..1, sprinkler 0..1}
function stHero(cam, t, o = {}) {
  const s = ST.hs, pal = CHPAL;
  const st = { x: ST.hx, y: ST.seatY - (o.jolt || 0) * 14 * s, s, face: o.face || FACES.calm, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0, frizz: o.frizz || 0, noLegs: true };
  let pose = JSON.parse(JSON.stringify(POSES.sit));
  pose.lean = o.lean || 0;
  pose.armL = { a: 0.42, b: -0.1 }; pose.armR = { a: 0.42, b: -0.1 };            // at rest his hands are in his lap, behind the counter
  const r0 = rig(pose), hd = [r0.head[0] + st.headDX, r0.head[1] + st.headDY], hr = pose.lean + st.headRot;
  const hp = (x, y) => [hd[0] + x * Math.cos(hr) - y * Math.sin(hr), hd[1] + x * Math.sin(hr) + y * Math.cos(hr)];   // head-local -> rig-local
  const mouth = hp(0, 40);
  if (o.left) pose = stReach(pose, 'L', o.left);
  const ch = o.chilli || null, am = clamp(o.atMouth || 0), cs = ch && ch.s ? ch.s : 0.62;
  // at his mouth the cap sits in his fist beside his cheek and the tip is between his teeth
  const capM = hp(91, 28), rotM = Math.PI + 0.1 + hr;
  let wrist = o.right || null, cap = null, crot = 0;
  if (ch) {
    const hold = o.right || [150, -170], hrot = ch.rot === undefined ? -1.9 : ch.rot, e = E.inOutSine(am);
    cap = [lerp(hold[0], capM[0], e), lerp(hold[1], capM[1], e) - 20 * Math.sin(Math.PI * e)];
    crot = lerp(angNear(hrot, rotM), rotM, e);
    wrist = [cap[0] + 12, cap[1] + 18];
  }
  if (wrist) pose = stReach(pose, 'R', wrist);
  const fl = clamp(o.flush || 0);
  const r = stLayer(cam, st, o, (lc) => {
    const stp = Object.assign({}, st, { pose });
    const rr = drawCharacter(lc, stp, t, pal);
    if (fl > 0.01) {                       // the red climbs: the same man again in red, clipped to his head below the line
      lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
      const top = lerp(hd[1] + 74, hd[1] - 104, fl);
      lc.beginPath(); lc.ellipse(hd[0], hd[1] + 6, 84, 96, 0, 0, Math.PI * 2); lc.clip();
      lc.beginPath(); lc.rect(hd[0] - 120, top, 240, 260); lc.clip();
      lc.scale(1 / st.s, 1 / st.s); lc.translate(-st.x, -st.y);
      drawCharacter(lc, stp, t, CHRED);
      lc.restore();
    }
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    if (o.jaw !== undefined) { lc.save(); lc.translate(hd[0], hd[1]); lc.rotate(hr); stBiteMouth(lc, o.jaw, pal, o.chew || 0); lc.restore(); }
    if (o.thermo > 0) stThermo(lc, mouth[0], mouth[1], hr, o.thermo, t);
    if (ch) {
      if (ch.guy) chilliGuy(lc, cap[0] + 2, cap[1] + 44, ch.guy.s || 0.62, t, Object.assign({ legs: false, bitten: true }, ch.guy));
      else chilliPod(lc, cap[0], cap[1], cs, crot, { bitten: ch.bitten || 0, flip: true });
      if (o.jaw !== undefined && am > 0.6) { lc.save(); lc.translate(hd[0], hd[1]); lc.rotate(hr); stBiteTeeth(lc, o.jaw, pal, o.chew || 0); lc.restore(); }
      stFist(lc, cap[0] + (ch.guy ? 2 : 6), cap[1] + (ch.guy ? 26 : 8), CHPAL, ch.guy ? 0 : crot);
    } else if (o.jaw !== undefined) { lc.save(); lc.translate(hd[0], hd[1]); lc.rotate(hr); stBiteTeeth(lc, o.jaw, pal, o.chew || 0); lc.restore(); }
    if (o.sprinkler > 0) stSprinkler(lc, hd[0] + 4 * Math.sin(hr), hd[1] - 78, o.sprinkler, t);
    lc.restore();
    return rr;
  });
  const wp = (p) => toWorld(st, p);
  return { st, r, pose, hr, mouth: wp(mouth), head: wp(hd), earL: wp(hp(-70, 2)), earR: wp(hp(70, 2)), top: wp(hp(0, -96)), wrist: wp(r.wrR), cap: cap ? wp(cap) : null, crot };
}
// a mouth thermometer (rig units): its bulb between his lips, the glass sticking out to his right. k = pop
function stThermo(c, mx, my, hr, k, t) {
  c.save(); c.translate(mx, my); c.rotate(hr + 0.42); c.scale(E.outBack(clamp(k), 1.6), 1);
  rrect(c, -4, -9, 176, 18, 9); c.fillStyle = 'rgba(235,245,255,0.92)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#7C8BA8'; c.stroke();
  rrect(c, 8, -3, 62, 6, 3); c.fillStyle = '#FF4A5A'; c.fill();                 // the red column: short. Normal.
  for (let i = 0; i < 9; i++) line(c, 30 + i * 15, -8, 30 + i * 15, i % 2 ? -3 : -1, 2, '#51607E');
  circle(c, 172, 0, 11, '#C9D6EA');
  c.restore();
}
// the sprinkler head that pops out of the top of his hair (rig units; the water is drawn by sprinklerSpray). k = pop
function stSprinkler(c, x, y, k, t) {
  const e = E.outBack(clamp(k), 2.2);
  c.save(); c.translate(x, y + 34 * (1 - e));
  rrect(c, -9, -34, 18, 44, 5); const g = c.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, '#E8EEF8'); g.addColorStop(1, '#7C8BA8'); c.fillStyle = g; c.fill();
  rrect(c, -15, -42, 30, 12, 5); c.fillStyle = '#C2182B'; c.fill();
  c.save(); c.translate(0, -50); c.rotate(t * 9);
  for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); rrect(c, -4, -24, 8, 16, 3); c.fillStyle = i % 2 ? '#AEB9CE' : '#E8EEF8'; c.fill(); }
  circle(c, 0, 0, 12, '#D7DEEA'); circle(c, 0, 0, 5, '#7C8BA8');
  c.restore();
  c.restore();
}
// water thrown out by the sprinkler at world (x, y), in two fans. k = how hard
function sprinklerSpray(x, y, t, k, z = 1) {
  if (k <= 0.01) return;
  // three jets a side, swinging; each one a ribbon of water with a bright core, breaking into drops at its end
  const G = 1500 * z, sw = 0.16 * Math.sin(t * 7.5);
  for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) {
    const a = -Math.PI / 2 + sd * (0.5 + 0.3 * j + sw * (j + 1) * 0.6), v = (520 - 50 * j) * z, qm = 0.62 + 0.1 * j;
    const pts = [];
    for (let i = 0; i <= 14; i++) { const q = (i / 14) * qm; pts.push([x + Math.cos(a) * v * q, y + Math.sin(a) * v * q + 0.5 * G * q * q]); }
    for (const [c, w, col] of [[ctx, 11 * z, `rgba(110,190,240,${0.55 * k})`], [ctx, 4.5 * z, `rgba(232,250,255,${0.9 * k})`], [gctx, 14 * z, `rgba(140,215,255,${0.16 * k})`]]) {
      c.save(); c.setLineDash([30 * z, 12 * z]); c.lineDashOffset = -t * 620 * z - j * 13;
      poly(c, pts, w, col); c.restore();
    }
    for (let d = 0; d < 5; d++) {          // the drops it breaks into
      const p = (t * 1.6 + d / 5 + j * 0.13 + (sd > 0 ? 0.37 : 0)) % 1, q = qm * (0.92 + 0.5 * p), jit = (hash(d * 7 + j) - 0.5) * 0.14;
      const px = x + Math.cos(a + jit) * v * q, py = y + Math.sin(a + jit) * v * q + 0.5 * G * q * q;
      circle(ctx, px, py, (7 - 3 * p) * z, `rgba(190,236,255,${0.95 * k * (1 - p)})`);
    }
  }
  softDot(gctx, x, y, 70 * z, '#9FE3FF', 0.35 * k);
}
// a red crosshair (screen space). k = pop, lock 0..1 = it has found its target; label under it (or above)
function reticle(x, y, r, k, t, lock = 0, label = '', above = false) {
  if (k <= 0.01) return;
  const rr = r * (1.5 - 0.5 * E.outBack(clamp(lock), 2)) * E.outBack(clamp(k), 1.8), bl = lock >= 1 ? 0.75 + 0.25 * Math.sin(t * 22) : 1;
  for (const [c, sc, lw, al] of [[ctx, 1, 7, 1], [gctx, 0.5, 14, 0.6]]) {
    c.save(); c.setTransform(sc, 0, 0, sc, 0, 0); c.translate(x, y); c.rotate(lock < 1 ? t * 1.6 : 0);
    c.globalAlpha = al * bl; c.strokeStyle = '#FF3A4A'; c.lineWidth = lw; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, rr, 0, 7); c.stroke();
    for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(rr * 0.62, 0); c.lineTo(rr * 1.36, 0); c.stroke(); }
    if (c === ctx) circle(c, 0, 0, 7, '#FF3A4A');
    c.restore();
  }
  if (label && lock > 0.5) pill(clamp(x, 236, 760), above ? y - r * 1.5 - 40 : y + r * 1.5 + 44, label, '#FF5A6E', (lock - 0.5) * 2, 40);
}

// the whole stall, in order. o: {warm, fire, hero: {...}, plate (default true), heap: {x (slide-in offset), flag, wob} | null}
function stallScene(cam, t, o = {}) {
  stallBack(cam, t, o);
  const h = stHero(cam, t, o.hero || {});
  applyCam(cam);
  stCounter(ctx, t);
  if (o.heap) stHeap(ctx, ST.heap[0] + (o.heap.x || 0), ST.heap[1], 1, t, o.heap);
  if (o.plate !== false) stPlate(ctx, ST.plate[0] + (o.plateDX || 0), ST.plate[1], 1, o.plateN === undefined ? 4 : o.plateN);
  applyCam(cam);
  return h;
}
