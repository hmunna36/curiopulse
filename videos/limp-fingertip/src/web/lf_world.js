// lf_world.js — Hook Your Finger. Can You Straighten the TIP? (27 Nov 2026). A new world: the porch of a lakeside cabin at
// sunset (the sky from violet to gold, a low sun on the far shore, ridges, a lake with the sun's road on it, pines, a far
// dock and canoe; the porch: a railing behind him, a roof beam with string lights, a hanging lantern, flower pots, a
// fishing rod; a plank table in front of him with a mug of cocoa and a sandwich). Built on finger-tip-bend's ft_world.js
// (the 3D hand pointing up, its joints set one by one), one-finger's fist3d.js and bent-wrist-fist's bwhand.js. New here:
// - `lfBug`: the ladybug (a red dome with spots, a black head with big eyes, legs, antennae; wings out to fly or float,
//   lying on her back in a hammock, a doctor's head mirror, a tiny reflex hammer);
// - `lfPoker`: his other hand's pointing finger, which pokes the tip (screen space);
// - `lfStrings`: the three strings on the BACK of the finger that straighten it: one to the middle bone (cyan), two that
//   run past the middle knuckle to the tip (yellow); `sag` lets the tip's two hang slack, `torn` breaks the middle one;
// - `lfWifi` (the Wi-Fi sign crossed out), `lfSpinner`, small tags.
// Hand frame (fist3d.js): origin = the middle of the wrist, +y toward the fingers, +x toward the thumb, +z out of the palm
// (so the back of the hand is -z). World coords: 1080x1920 at zoom 1. Every time comes from a cue (scenes.js).
'use strict';

const LF = {
  hx: 560, hy: 1500, hs: 1.0,            // the hero's rig origin and scale (stand pose, legs hidden by the table)
  tableY: 1268, tableFront: 1500,        // the table top: back edge, front edge
  mug: [318, 1352], plate: [868, 1372],
  sun: [880, 905],                       // the sun on the far layer (world units of that layer)
  horizon: 960,                          // the far shore's line on the far layer
};
let LF_FAR = null, LF_FAR_SOFT = null;   // the painted far view (sky, sun, ridges, lake, far shore), sharp and soft
const LF_FAR_X0 = -700, LF_FAR_Y0 = 120, LF_FAR_W = 2480, LF_FAR_H = 1500, LF_FAR_S = 1.0;
let LF_BGDY = 0;                         // the camera's height: + low (the far view sinks), - high
const LF_WOOD = ['#8A4E2A', '#7A4424', '#94582F', '#6E3C1F'];
const LFPAL = PAL;                       // his hiker coat as ever

function lfLayerCam(cam, p, dy = 0) {
  return { x: 540 + (cam.x - 540) * p, y: 960 + (cam.y - 960) * p - dy, zoom: 1 + (cam.zoom - 1) * p, rot: cam.rot || 0, sx: cam.sx || 0, sy: cam.sy || 0 };
}

// ---------------------------------------------------------------- the far view, painted once
function initLake() {
  const S = LF_FAR_S, WW = LF_FAR_W, WH = LF_FAR_H;
  LF_FAR = mkCanvas(Math.round(WW * S), Math.round(WH * S));
  const x = LF_FAR.getContext('2d'), rng = mulberry32(2711);
  x.scale(S, S); x.translate(-LF_FAR_X0, -LF_FAR_Y0);
  const X0 = LF_FAR_X0, Y0 = LF_FAR_Y0, X1 = X0 + WW, Y1 = Y0 + WH, HZ = LF.horizon;
  // the sky: violet to rose to gold at the far shore
  const sg = x.createLinearGradient(0, Y0, 0, HZ);
  sg.addColorStop(0, '#3A2C96'); sg.addColorStop(0.32, '#7B47C9'); sg.addColorStop(0.58, '#E25A9E');
  sg.addColorStop(0.8, '#FF8A4C'); sg.addColorStop(1, '#FFC867');
  x.fillStyle = sg; x.fillRect(X0, Y0, WW, HZ - Y0 + 2);
  // a few early stars high up
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * rng()})`; x.beginPath(); x.arc(X0 + rng() * WW, Y0 + rng() * 260, 0.8 + rng() * 1.6, 0, 7); x.fill(); }
  // long thin clouds lit pink from below
  for (let i = 0; i < 9; i++) {
    const cx = X0 + 120 + rng() * (WW - 240), cy = Y0 + 220 + rng() * 420, cw = 220 + rng() * 380, ch = 14 + rng() * 16;
    const cg = x.createLinearGradient(0, cy - ch, 0, cy + ch);
    cg.addColorStop(0, 'rgba(255,190,220,0.0)'); cg.addColorStop(0.6, 'rgba(255,170,200,0.55)'); cg.addColorStop(1, 'rgba(255,214,160,0.75)');
    x.fillStyle = cg; x.beginPath(); x.ellipse(cx, cy, cw, ch, 0, 0, 7); x.fill();
  }
  // the sun, low on the far shore, and its halo
  const [sx, sy] = LF.sun;
  const hg = x.createRadialGradient(sx, sy, 10, sx, sy, 520);
  hg.addColorStop(0, 'rgba(255,240,190,0.95)'); hg.addColorStop(0.12, 'rgba(255,214,140,0.7)'); hg.addColorStop(0.4, 'rgba(255,150,90,0.25)'); hg.addColorStop(1, 'rgba(255,120,90,0)');
  x.fillStyle = hg; x.fillRect(sx - 520, sy - 520, 1040, 1040);
  x.fillStyle = '#FFF1C2'; x.beginPath(); x.arc(sx, sy, 62, 0, 7); x.fill();
  // ridges: violet, lit at the rim
  const ridge = (base, amp, col, rim, seed, f) => {
    const r2 = mulberry32(seed); x.beginPath(); x.moveTo(X0, HZ + 4);
    const pts = [];
    for (let px = X0; px <= X1; px += 18) { const py = base - amp * (0.45 + 0.55 * Math.abs(Math.sin(px * f + seed))) - 18 * r2(); pts.push([px, py]); x.lineTo(px, py); }
    x.lineTo(X1, HZ + 4); x.closePath(); x.fillStyle = col; x.fill();
    x.save(); x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const p of pts) x.lineTo(p[0], p[1]); x.lineWidth = 3; x.strokeStyle = rim; x.stroke(); x.restore();
  };
  ridge(HZ - 40, 210, '#7A55B8', 'rgba(255,190,210,0.7)', 3, 0.0042);
  ridge(HZ - 10, 140, '#5C3F9E', 'rgba(255,160,190,0.6)', 7, 0.0061);
  // the far shore: pines in silhouette, a cabin with a lit window, a dock and a canoe
  x.fillStyle = '#2E2468'; x.fillRect(X0, HZ - 14, WW, 18);
  for (let px = X0; px < X1; px += 14 + rng() * 22) {
    if (Math.abs(px - sx) < 90 && rng() < 0.7) continue;   // a gap where the sun sits
    const ph = 24 + rng() * 62;
    x.beginPath(); x.moveTo(px, HZ - 8 - ph); x.lineTo(px + 11, HZ - 4); x.lineTo(px - 11, HZ - 4); x.closePath(); x.fillStyle = rng() < 0.5 ? '#271E5C' : '#2C2264'; x.fill();
  }
  rrect(x, 1290, HZ - 52, 70, 44, 4); x.fillStyle = '#3A2A5E'; x.fill();
  x.beginPath(); x.moveTo(1282, HZ - 50); x.lineTo(1325, HZ - 78); x.lineTo(1368, HZ - 50); x.closePath(); x.fillStyle = '#2A1F4C'; x.fill();
  x.fillStyle = '#FFD27A'; x.fillRect(1305, HZ - 40, 14, 12); x.fillRect(1331, HZ - 40, 14, 12);
  // the lake: the sky upside down, darker, with the far shore's line soft in it
  const lg = x.createLinearGradient(0, HZ, 0, Y1);
  lg.addColorStop(0, '#F59A6A'); lg.addColorStop(0.08, '#D8619A'); lg.addColorStop(0.35, '#7448B8'); lg.addColorStop(1, '#2E2A86');
  x.fillStyle = lg; x.fillRect(X0, HZ, WW, Y1 - HZ);
  // the ridges' mirror image: a soft violet band under the shore
  x.fillStyle = 'rgba(70,46,140,0.45)'; x.fillRect(X0, HZ + 4, WW, 34);
  // the sun's road on the water (the glitter dances on it per frame)
  const rg = x.createLinearGradient(sx - 120, 0, sx + 120, 0);
  rg.addColorStop(0, 'rgba(255,214,150,0)'); rg.addColorStop(0.5, 'rgba(255,224,170,0.55)'); rg.addColorStop(1, 'rgba(255,214,150,0)');
  x.fillStyle = rg; x.beginPath(); x.moveTo(sx - 40, HZ + 4); x.lineTo(sx + 40, HZ + 4); x.lineTo(sx + 170, Y1); x.lineTo(sx - 170, Y1); x.closePath(); x.fill();
  // the dock and the canoe on the right
  x.fillStyle = '#3B2A50'; x.fillRect(1180, HZ + 40, 190, 10);
  for (let i = 0; i < 5; i++) x.fillRect(1186 + i * 44, HZ + 40, 6, 26);
  x.beginPath(); x.moveTo(1040, HZ + 72); x.quadraticCurveTo(1110, HZ + 92, 1180, HZ + 72); x.quadraticCurveTo(1110, HZ + 80, 1040, HZ + 72); x.fillStyle = '#2A1E44'; x.fill();
  // ripple lines across the lake
  for (let i = 0; i < 60; i++) {
    const ry = HZ + 30 + Math.pow(rng(), 1.6) * (Y1 - HZ - 40), rw = 40 + (ry - HZ) * 0.25 * rng(), rx = X0 + rng() * WW;
    x.strokeStyle = `rgba(255,200,230,${0.10 + 0.12 * rng()})`; x.lineWidth = 2; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx + rw, ry); x.stroke();
  }
  // the soft copy for close-ups (the lens focused on his hand)
  LF_FAR_SOFT = mkCanvas(LF_FAR.width, LF_FAR.height);
  const y2 = LF_FAR_SOFT.getContext('2d');
  y2.filter = 'blur(9px)'; y2.drawImage(LF_FAR, 0, 0); y2.filter = 'none';
}

// the far view at depth p, with the glitter on the sun's road; soft 0..1 blends to the out-of-focus copy
function lfFar(cam, t, o = {}) {
  const p = o.p === undefined ? 0.14 : o.p, lc = lfLayerCam(cam, p, -LF_BGDY * 0.35);
  ctx.save(); applyCam(lc);
  const draw = (img, a) => { ctx.globalAlpha = a; ctx.drawImage(img, LF_FAR_X0, LF_FAR_Y0, LF_FAR_W, LF_FAR_H); };
  const soft = clamp(o.soft || 0);
  paint(() => {
    if (soft < 0.99) draw(LF_FAR, 1);
    if (soft > 0.01) draw(LF_FAR_SOFT, soft);
    ctx.globalAlpha = 1;
  });
  ctx.restore();
  // the glow of the sun into the glow layer, and the glitter on its road
  const ss = toScreen(lc, LF.sun[0], LF.sun[1]);
  softDot(gctx, ss[0], ss[1], 260 * lc.zoom, '#FFC47A', 0.32);
  const hz = toScreen(lc, LF.sun[0], LF.horizon + 6)[1];
  if (!o.noGlitter) wkGlitter(t, { x: ss[0], y0: hz + 6, y1: Math.min(H, hz + 520 * lc.zoom), n: 46, spread: 120 * lc.zoom, col: '#FFE7B0', a: 0.75 * (1 - 0.6 * soft), seed: 31 });
  // a flock crossing the sky (loop-safe)
  if (!o.noBirds) { ctx.save(); applyCam(lc); wkFlock(t, { t0: -6, t1: 24, x0: -300, y0: 560, x1: 1500, y1: 500, n: 5, s: 0.9, seed: 4, loop: true }); ctx.restore(); }
  return lc;
}

// ---------------------------------------------------------------- the porch behind him (railing, posts, roof, lights)
const LF_BULBS = [];
for (let i = 0; i < 17; i++) { const u = i / 16, bx = -260 + u * 1600; LF_BULBS.push([bx, 470 + 60 * Math.sin(u * Math.PI) + 22 * Math.sin(u * Math.PI * 4)]); }
function lfPorch(cam, t, o = {}) {
  const lc = lfLayerCam(cam, 0.72, -LF_BGDY * 0.15);
  ctx.save(); applyCam(lc);
  const blur = o.soft ? Math.round(5 * o.soft) : 0;
  if (blur) ctx.filter = `blur(${blur}px)`;
  // the railing: posts, a top rail, balusters (the lake shows between them)
  const RY = 1110, RB = 1290;
  actor(() => {
    for (let bx = -420; bx < 1600; bx += 64) { ctx.fillStyle = '#5A2F18'; ctx.fillRect(bx - 9, RY + 18, 18, RB - RY); }
    for (const px of [-300, 230, 900, 1430]) { ctx.fillStyle = '#4A2512'; ctx.fillRect(px - 26, 300, 52, RB - 300 + 40); }
    rrect(ctx, -480, RY - 6, 2120, 34, 8); ctx.fillStyle = '#6E3B1E'; ctx.fill();
  });
  paint(() => { ctx.fillStyle = 'rgba(255,190,120,0.55)'; ctx.fillRect(-480, RY - 6, 2120, 6); });
  // the roof beam across the top, and the string lights hanging from it
  actor(() => { ctx.fillStyle = '#3E1F0E'; ctx.fillRect(-480, 300, 2120, 58); });
  paint(() => {
    ctx.strokeStyle = '#2A160A'; ctx.lineWidth = 3; ctx.beginPath();
    LF_BULBS.forEach((b, i) => (i ? ctx.lineTo(b[0], b[1]) : ctx.moveTo(b[0], b[1]))); ctx.stroke();
  });
  // the flower pots on the rail (right) and a fishing rod leaning on the post (left)
  actor(() => {
    for (const [fx, fc] of [[1010, '#FF5A8A'], [1080, '#FFD447']]) {
      rrect(ctx, fx - 26, RY - 58, 52, 54, 8); ctx.fillStyle = '#C0553A'; ctx.fill();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#3E8A44'; ctx.beginPath(); ctx.ellipse(fx + (i - 2) * 9, RY - 74, 6, 18, (i - 2) * 0.35, 0, 7); ctx.fill(); }
      for (let i = 0; i < 3; i++) { ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(fx + (i - 1) * 16, RY - 96 + (i % 2) * 8, 11, 0, 7); ctx.fill(); }
    }
    ctx.strokeStyle = '#2C2C34'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(150, RB + 20); ctx.lineTo(60, 420); ctx.stroke();
    ctx.fillStyle = '#9AA0B0'; ctx.beginPath(); ctx.arc(138, RB - 160, 16, 0, 7); ctx.fill();
  });
  ctx.filter = 'none';
  // the bulbs glow (loop-safe twinkle)
  LF_BULBS.forEach((b, i) => {
    const tw = 0.82 + 0.18 * Math.sin(t * loopW(1.3 + (i % 4) * 0.4) + i * 1.7);
    const q = toScreen(lc, b[0], b[1] + 16);
    paint(() => { circle(ctx, b[0], b[1] + 16, 9, mixH('#FFC86A', '#FFF4D0', tw)); });
    softDot(gctx, q[0], q[1], 46 * lc.zoom, '#FFB45A', 0.32 * tw);
  });
  // the lantern hanging on the left
  const lq = [300, 560];
  actor(() => { line(ctx, lq[0], 358, lq[0], lq[1] - 40, 4, '#2A160A'); rrect(ctx, lq[0] - 30, lq[1] - 40, 60, 86, 10); ctx.fillStyle = '#2B2B33'; ctx.fill(); });
  paint(() => { rrect(ctx, lq[0] - 20, lq[1] - 28, 40, 62, 8); ctx.fillStyle = '#FFD98A'; ctx.fill(); });
  const ls = toScreen(lc, lq[0], lq[1]);
  softDot(gctx, ls[0], ls[1], 150 * lc.zoom, '#FFB050', 0.5 + 0.06 * Math.sin(t * loopW(5)));
  ctx.restore();
  return lc;
}

// ---------------------------------------------------------------- the table in front of him (his plane)
function lfTable(cam, t) {
  applyCam(cam);
  const y0 = LF.tableY, y1 = LF.tableFront + 300;
  actor(() => {
    for (let i = 0, y = y0; y < y1; y += 46, i++) {
      const g = ctx.createLinearGradient(0, y, 0, y + 46);
      const base = LF_WOOD[i % 4]; g.addColorStop(0, mixH(base, '#C58A55', 0.35)); g.addColorStop(1, mixH(base, '#3A1A08', 0.3));
      ctx.fillStyle = g; ctx.fillRect(-400, y, 1900, 46);
    }
  });
  paint(() => { for (let i = 0, y = y0; y < y1; y += 46, i++) line(ctx, -400, y + 45, 1500, y + 45, 3, 'rgba(40,16,6,0.5)'); });
  paint(() => { ctx.fillStyle = 'rgba(255,170,110,0.35)'; ctx.fillRect(-400, y0, 1900, 6); });
  // the mug of cocoa (steaming) and the plate with a sandwich
  const [mx, my] = LF.mug;
  actor(() => {
    rrect(ctx, mx - 46, my - 92, 92, 100, 14); ctx.fillStyle = '#2BA3A0'; ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 50, my - 46, 24, -1.3, 1.3); ctx.lineWidth = 12; ctx.strokeStyle = '#238C89'; ctx.stroke();
  });
  paint(() => { ellipse(ctx, mx, my - 90, 40, 9, '#6B3A1E'); ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 3; i++) circle(ctx, mx - 16 + i * 16, my - 92, 5, '#FFF4E6'); });
  for (let i = 0; i < 3; i++) {   // steam (loop-safe)
    const u = ((t * 0.45 + i / 3) % 1 + 1) % 1, sy = my - 110 - u * 120, sxx = mx - 14 + i * 14 + 10 * Math.sin(t * loopW(1.2) + i * 2);
    paint(() => { ctx.strokeStyle = `rgba(255,255,255,${0.35 * Math.sin(u * Math.PI)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sxx, sy); ctx.quadraticCurveTo(sxx + 14, sy - 24, sxx, sy - 46); ctx.stroke(); });
  }
  const [px, py] = LF.plate;
  actor(() => { ctx.fillStyle = '#F4F1E6'; ctx.beginPath(); ctx.ellipse(px, py, 120, 30, 0, 0, 7); ctx.fill(); });
  actor(() => {
    ctx.fillStyle = '#E8B866'; ctx.beginPath(); ctx.moveTo(px - 84, py - 6); ctx.lineTo(px + 80, py - 18); ctx.lineTo(px + 70, py - 56); ctx.lineTo(px - 70, py - 44); ctx.closePath(); ctx.fill();
  });
  paint(() => { line(ctx, px - 78, py - 26, px + 76, py - 38, 9, '#7BC043'); line(ctx, px - 76, py - 18, px + 74, py - 30, 7, '#E04B3A'); });
}

// ---------------------------------------------------------------- the ladybug
// (x, y) her middle on screen, s px per unit (her shell is about 1 unit wide), rot: her body's angle (0 = head to the
// right, feet down), o: {flip (face left), wings 0..1 (open, flying), back 0..1 (lying on her back), eyes 'open'|'half'|
// 'shut'|'wide', look [x, y], mirror 0..1 (a doctor's head mirror), hammer 0..1 (+ tap angle hammerA), legs (walk phase),
// wave (a leg waving), t}
function lfBug(x, y, s, rot, o = {}) {
  const t = o.t || 0, fl = o.flip ? -1 : 1;
  const wings = clamp(o.wings || 0), back = clamp(o.back || 0);
  const draw = () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * fl, s);
    // legs (three a side, under the shell), waggle when walking or lying
    ctx.lineCap = 'round'; ctx.strokeStyle = '#141018'; ctx.lineWidth = 0.075;
    for (let i = 0; i < 3; i++) {
      const lx = -0.22 + i * 0.22, ph = (o.legs || 0) * 9 + i * 2.1, k = (back > 0.5 ? -1 : 1);
      const kx = lx + 0.06 * Math.sin(ph) + (back > 0.5 ? 0.04 * Math.sin(t * 11 + i) : 0);
      ctx.beginPath(); ctx.moveTo(lx, 0.12 * k); ctx.lineTo(kx - 0.05, 0.34 * k); ctx.lineTo(kx + 0.02, 0.46 * k); ctx.stroke();
    }
    // the membrane wings (behind the shell halves when open)
    if (wings > 0.01) {
      const fl2 = 0.5 + 0.5 * Math.sin(t * 70);
      for (const sd of [-1, 1]) {
        ctx.save(); ctx.rotate(-0.4 * sd * wings - 0.2); ctx.fillStyle = `rgba(230,240,255,${0.55 * wings})`;
        ctx.beginPath(); ctx.ellipse(-0.1, -0.55 * wings * (0.8 + 0.3 * fl2), 0.22, 0.62 * wings, 0.3 * sd, 0, 7); ctx.fill(); ctx.restore();
      }
    }
    // the head (black) with two white spots and big eyes
    ctx.fillStyle = '#141018'; ctx.beginPath(); ctx.ellipse(0.46, -0.06, 0.24, 0.21, 0, 0, 7); ctx.fill();
    // antennae
    ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(0.58, -0.22); ctx.quadraticCurveTo(0.72, -0.48, 0.66, -0.56); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.5, -0.24); ctx.quadraticCurveTo(0.56, -0.5, 0.46, -0.58); ctx.stroke();
    ctx.fillStyle = '#141018'; ctx.beginPath(); ctx.arc(0.66, -0.57, 0.05, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(0.46, -0.59, 0.05, 0, 7); ctx.fill();
    // the shell: two red halves, opened a little when the wings are out
    const op = 0.5 * wings;
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.rotate(-sd * op * 0.3);
      ctx.fillStyle = '#E8262E'; ctx.beginPath();
      if (sd < 0) { ctx.ellipse(-0.05, -0.02, 0.48, 0.36, 0, Math.PI, Math.PI * 2); ctx.lineTo(0.43, 0.02); }
      else { ctx.ellipse(-0.05, -0.02, 0.48, 0.36, 0, Math.PI * 0.92, Math.PI * 2.08); }
      ctx.fill(); ctx.restore();
    }
    ctx.fillStyle = '#E8262E'; ctx.beginPath(); ctx.ellipse(-0.05, 0.02, 0.48, 0.16, 0, 0, Math.PI); ctx.fill();
    ctx.restore();
  };
  actor(draw);
  // spots, shine, the face (painted: not lit as their own shapes)
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * fl, s);
    ctx.fillStyle = '#141018';
    for (const [sx, sy, r] of [[-0.3, -0.12, 0.08], [-0.05, -0.26, 0.075], [0.18, -0.1, 0.07], [-0.12, 0.0, 0.06], [0.05, -0.02, 0.05]]) { ctx.beginPath(); ctx.arc(sx, sy, r, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(-0.14, -0.27, 0.13, 0.05, -0.25, 0, 7); ctx.fill();
    // eyes: big whites with pupils, lids by mood
    const ey = o.eyes || 'open', lk = o.look || [0.3, 0];
    for (const [ex, er] of [[0.5, 0.1], [0.36, 0.085]]) {
      const open = ey === 'shut' ? 0.08 : ey === 'half' ? 0.5 : ey === 'wide' ? 1.25 : 1;
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(ex, -0.1, er * (ey === 'wide' ? 1.15 : 1), er * open, 0, 0, 7); ctx.fill();
      if (open > 0.2) { ctx.fillStyle = '#141018'; ctx.beginPath(); ctx.arc(ex + lk[0] * er * 0.45, -0.1 + lk[1] * er * 0.45, er * 0.5, 0, 7); ctx.fill(); }
      if (ey === 'shut') { ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.arc(ex, -0.12, er * 0.8, 0.2, Math.PI - 0.2); ctx.stroke(); }
    }
    // a smile
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.arc(0.5, 0.02, 0.07, 0.3, Math.PI - 0.6); ctx.stroke();
    ctx.restore();
  });
  // the doctor's head mirror on a band (her own beat)
  const mi = clamp(o.mirror || 0);
  if (mi > 0.01) {
    const kk = E.outBack(mi, 2.2), drop = (1 - clamp(mi * 1.4)) * 1.2;
    paint(() => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * fl, s); ctx.translate(0.46, -0.26 - drop); ctx.scale(kk, kk);
      ctx.fillStyle = '#2E3A52'; ctx.fillRect(-0.24, -0.04, 0.48, 0.08);
      const g = ctx.createRadialGradient(-0.04, -0.2, 0.01, 0, -0.16, 0.16); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.5, '#D8E6F4'); g.addColorStop(1, '#8EA4BE');
      ctx.fillStyle = '#7C8AA0'; ctx.beginPath(); ctx.arc(0, -0.16, 0.17, 0, 7); ctx.fill();
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -0.16, 0.14, 0, 7); ctx.fill();
      ctx.fillStyle = '#3A4A60'; ctx.beginPath(); ctx.arc(0, -0.16, 0.035, 0, 7); ctx.fill();
      ctx.restore();
    });
    const mp = lfBugPt(x, y, s, rot, fl, 0.46, -0.42 - drop);
    softDot(gctx, mp[0], mp[1], s * 0.3, '#FFFFFF', 0.35 * mi);
  }
  // a tiny reflex hammer in her front leg
  const hm = clamp(o.hammer || 0);
  if (hm > 0.01) {
    paint(() => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * fl, s); ctx.translate(0.6, 0.18); ctx.rotate(o.hammerA || 0); ctx.scale(hm * 1.7, hm * 1.7);
      ctx.strokeStyle = '#B8C0CC'; ctx.lineWidth = 0.06; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0.42, -0.1); ctx.stroke();
      ctx.fillStyle = '#E0434E'; ctx.beginPath(); ctx.ellipse(0.46, -0.11, 0.07, 0.13, -0.24, 0, 7); ctx.fill();
      ctx.restore();
    });
  }
}
function lfBugPt(x, y, s, rot, fl, u, v) {
  const c = Math.cos(rot), sn = Math.sin(rot), px = u * s * fl, py = v * s;
  return [x + px * c - py * sn, y + px * sn + py * c];
}

// ---------------------------------------------------------------- his other hand's pointing finger (screen space)
// tip: the point it touches (screen), dir: unit vector from its knuckles to its tip, r: finger radius px, k 0..1 (in)
function lfPoker(tip, dir, r, k, o = {}) {
  if (k <= 0.01) return;
  const kk = E.outCubic(clamp(k)), back = (1 - kk) * r * 14;
  const tx = tip[0] - dir[0] * back, ty = tip[1] - dir[1] * back;
  const L = r * 6.5, bx = tx - dir[0] * L, by = ty - dir[1] * L;
  const nx = -dir[1], ny = dir[0];
  const skin = '#EDB08A';
  actor(() => {
    // the hand behind the finger: a rounded fist block and the sleeve beyond it
    line(ctx, bx - dir[0] * r * 5, by - dir[1] * r * 5, bx - dir[0] * r * 14, by - dir[1] * r * 14, r * 4.2, LFPAL.coat);
    ctx.save(); ctx.translate(bx - dir[0] * r * 1.8 + nx * r * 0.9, by - dir[1] * r * 1.8 + ny * r * 0.9); ctx.rotate(Math.atan2(dir[1], dir[0]));
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 0, r * 2.9, r * 2.3, 0, 0, 7); ctx.fill(); ctx.restore();
    line(ctx, bx, by, tx, ty, r * 2, skin);
  });
  paint(() => {
    const an = Math.atan2(dir[1], dir[0]);
    ellipse(ctx, tx - dir[0] * r * 0.45 - nx * r * 0.4, ty - dir[1] * r * 0.45 - ny * r * 0.4, r * 0.55, r * 0.4, '#FAD9CC', an);
    ctx.save(); ctx.strokeStyle = 'rgba(160,86,62,0.5)'; ctx.lineWidth = Math.max(2, r * 0.12); ctx.lineCap = 'round';
    for (const u of [0.38, 0.7]) { const q = [tx - dir[0] * L * u, ty - dir[1] * L * u]; ctx.beginPath(); ctx.moveTo(q[0] - nx * r * 0.6, q[1] - ny * r * 0.6); ctx.lineTo(q[0] - nx * r * 0.1, q[1] - ny * r * 0.1); ctx.stroke(); }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- the three strings on the back of the finger
// P2, G: the 3D hand. o: {k (0..1 shown), sag 0..1 (the tip's two hang slack), torn 0..1 (the middle one snaps), hotMid,
// hotTip (glow), t}. Returns screen points of interest (the hammock's low point, the frayed ends).
function lfStringPts(P2, G, o) {
  const F = FK_F.I, f = G.f.I, r0 = f.rad[0];
  // the shared stretch: from the back of the forearm, over the back of the hand, to the first bone's back
  const arm = [[F.x * 0.15, -7.5, -1.55], [F.x * 0.2, -3.5, -1.45], [F.x * 0.22, -0.6, -1.0]].map(P2.ph);
  const hand = [[F.x * 0.3, 1.2, -1.0], [F.x * 0.55, 3.6, -1.0], [F.x * 0.85, 6.3, -0.95]].map(P2.ph);
  const first = [0.1, 0.35, 0.55].map((u) => P2.ph(fkSegPt(G, 'I', 0, u, 'back', 1.0)));
  const common = arm.concat(hand, first);
  // the middle string: on over the middle knuckle's back to the middle bone
  const midPath = [0.75, 0.95].map((u) => P2.ph(fkSegPt(G, 'I', 0, u, 'back', 1.02)));
  // round the corner of the bent knuckle
  const j = f.pts[1], d0 = f.dirs[0].th, d1 = f.dirs[1].th;
  for (let i = 0; i <= 4; i++) { const th = lerp(d0, d1, i / 4), rr = f.rad[1] * 1.05; midPath.push(P2.ph([j[0], j[1] + Math.sin(th) * rr, j[2] - Math.cos(th) * rr])); }
  midPath.push(P2.ph(fkSegPt(G, 'I', 1, 0.14, 'back', 1.02)));
  // the tip's two: from the split, along the first bone's sides, past the middle knuckle's sides (below its corner), along
  // the middle bone's sides to the last bone's back
  const side = (sd) => {
    const pts = [];
    for (const u of [0.7, 0.92]) { const p = fkSegPt(G, 'I', 0, u, 'back', 0.6); pts.push([p[0] + sd * r0 * 0.85, p[1], p[2]]); }
    const jj = f.pts[1]; pts.push([jj[0] + sd * f.rad[1] * 1.02, jj[1], jj[2]]);
    for (const u of [0.35, 0.75]) { const p = fkSegPt(G, 'I', 1, u, 'back', 0.55); pts.push([p[0] + sd * f.rad[1] * 0.9, p[1], p[2]]); }
    const p2 = fkSegPt(G, 'I', 2, 0.12, 'back', 1.0); pts.push(p2);
    return pts.map(P2.ph);
  };
  return { common, midPath, sideA: side(1), sideB: side(-1), k: P2.ph(f.pts[1])[2] };
}
function lfSag(P, amt, t, ph) {
  // a sag that hangs toward the screen's bottom and swings a little (the slack), zero at both ends
  if (amt <= 0.001) return P;
  const acc = polyLen(P), L = acc[acc.length - 1], n = 22, out = [];
  for (let i = 0; i <= n; i++) {
    const v = i / n, q = polyAt(P, acc, L * v), w = Math.sin(Math.PI * v);
    out.push([q[0] + amt * 0.05 * L * w * Math.sin(t * 3.1 + ph), q[1] + amt * 0.55 * L * Math.pow(w, 1.3)]);
  }
  return out;
}
function lfStrings(c, g, P2, G, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return null;
  const S = lfStringPts(P2, G, o), t = o.t || 0;
  const wpx = Math.max(6, S.k * 0.3), sag = clamp(o.sag || 0), torn = clamp(o.torn || 0);
  const draw = (P, col, hot, w = wpx) => {
    const acc = polyLen(P), L = acc[acc.length - 1] * E.outCubic(k), Q = [];
    for (let i = 0; i < P.length; i++) { if (acc[i] <= L) Q.push([P[i][0], P[i][1]]); else { Q.push(polyAt(P, acc, L)); break; } }
    paint(() => { poly(c, Q, w * 1.7, rgba('#2A1636', 0.7)); poly(c, Q, w, mixH(col, '#FFFFFF', 0.35 * hot)); });
    poly(g, Q, w * 2.4, rgba(col, 0.16 + 0.22 * hot));
    return Q;
  };
  const common = draw(S.common.map((q) => [q[0], q[1]]), '#FFF1D9', 0.2);
  // the tip's two (yellow): sagging when slack, straight and bright when they take the pull
  const yA = lfSag(S.sideA.map((q) => [q[0], q[1]]), sag, t, 0), yB = lfSag(S.sideB.map((q) => [q[0], q[1]]), sag * 0.9, t, 1.3);
  const far = S.sideB[2][2] < S.sideA[2][2];   // which side is nearer the camera (bigger scale = nearer)
  draw(far ? yA : yB, '#E8B63A', o.hotTip || 0, wpx * 0.85);
  const near = draw(far ? yB : yA, '#FFD447', o.hotTip || 0);
  // the middle string (cyan): taut over the bent knuckle; torn = two frayed ends that recoil
  const mid = S.midPath.map((q) => [q[0], q[1]]);
  let ends = null;
  if (torn < 0.01) draw(mid, '#7FE9FF', o.hotMid || 0, wpx * 1.1);
  else {
    const acc = polyLen(mid), L = acc[acc.length - 1], cut = 0.55, rec = E.outBack(torn, 1.6);
    const a = [], b = [];
    for (let i = 0; i <= 14; i++) { const v = (i / 14) * cut * (1 - 0.45 * rec); a.push(polyAt(mid, acc, L * v)); }
    for (let i = 0; i <= 10; i++) { const v = 1 - (i / 10) * (1 - cut) * (1 - 0.6 * rec); b.push(polyAt(mid, acc, L * v)); }
    const curl = (P, sgn) => P.map((q, i) => (i > P.length - 4 ? [q[0] + sgn * rec * (i - P.length + 4) * wpx * 0.6, q[1] - rec * (i - P.length + 4) * wpx * 0.4] : q));
    const A = curl(a, 1), B = curl(b, -1);
    for (const P of [A, B]) paint(() => { poly(c, P, wpx * 1.9, rgba('#2A1636', 0.7)); poly(c, P, wpx * 1.1, '#7FE9FF'); });
    ends = [A[A.length - 1], B[B.length - 1]];
    for (const e of ends) paint(() => { for (let i = 0; i < 5; i++) { const an = i * 1.25 + 0.4; line(c, e[0], e[1], e[0] + Math.cos(an) * wpx * 1.2, e[1] + Math.sin(an) * wpx * 1.2, 3, '#BFF6FF'); } });
  }
  // the hot joints (the middle knuckle cyan, the tip's joint yellow)
  const mk = P2.ph(G.f.I.pts[1]), tk = P2.ph(G.f.I.pts[2]);
  for (const [q, h, col] of [[mk, o.ringMid || 0, '#7FE9FF'], [tk, o.ringTip || 0, '#FFD447']]) {
    if (h <= 0.01) continue;
    const rr = q[2] * 1.75 * (0.8 + 0.2 * E.outBack(clamp(h), 2));
    paint(() => { c.save(); c.lineWidth = Math.max(4, q[2] * 0.2); c.strokeStyle = rgba(col, 0.95 * h); c.beginPath(); c.arc(q[0], q[1], rr, 0, 7); c.stroke(); c.restore(); });
    softDot(g, q[0], q[1], rr * 1.2, col, 0.16 * h);
  }
  // the hammock: the lowest point of the near yellow string
  let low = near[0];
  for (const q of near) if (q[1] > low[1]) low = q;
  return { low, ends, near, mk, tk };
}

// ---------------------------------------------------------------- small things (screen space)
// the Wi-Fi sign, crossed out (k pops it, x: the slash 0..1)
function lfWifi(x, y, s, k, slash, t) {
  if (k <= 0.01) return;
  const kk = E.outBack(clamp(k), 2.4) * s;
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(kk, kk);
    ctx.fillStyle = 'rgba(20,16,40,0.78)'; ctx.beginPath(); ctx.arc(0, -30, 92, 0, 7); ctx.fill();
    ctx.lineCap = 'round'; ctx.strokeStyle = '#FFFFFF';
    for (const [r, w] of [[64, 13], [42, 13], [20, 13]]) { ctx.lineWidth = w; ctx.beginPath(); ctx.arc(0, 12, r, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke(); }
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, 10, 8, 0, 7); ctx.fill();
    const sl = clamp(slash);
    if (sl > 0.01) { ctx.strokeStyle = '#FF3B4E'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(-62, -92); ctx.lineTo(-62 + 124 * sl, -92 + 124 * sl); ctx.stroke(); }
    ctx.restore();
  });
  softDot(gctx, x, y - 30 * kk, 120 * kk, '#FF5A6E', 0.12 * clamp(k));
}
// a loading spinner (the tip "thinking")
function lfSpinner(x, y, s, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + Math.floor(t * 12) * Math.PI / 4;
      ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.75 * (i / 7)})`; ctx.beginPath(); ctx.arc(Math.cos(a) * 30, Math.sin(a) * 30, 7, 0, 7); ctx.fill();
    }
    ctx.restore();
  });
}
// motion arcs behind something flung (screen space)
function lfWhoosh(pts, k) {
  if (k <= 0.01 || pts.length < 2) return;
  paint(() => { ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.strokeStyle = rgba('#FFFFFF', 0.5 * k * (1 - i * 0.28)); ctx.lineWidth = 6 - i * 1.6; ctx.beginPath(); pts.forEach((q, j) => (j ? ctx.lineTo(q[0] + i * 9, q[1] + i * 7) : ctx.moveTo(q[0] + i * 9, q[1] + i * 7))); ctx.stroke(); } ctx.restore(); });
}
