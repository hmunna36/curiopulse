// All of HUMANITY Fits in a Sugar Cube: the trail cafe at dusk (a new world, 8 Nov 2026).
// A log-plank hut cafe high in the mountains: a window on snowy peaks at dusk (right of his head), a chalkboard menu
// (left), a shelf of enamel mugs and a SUGAR jar, string lights and a pendant lamp (glow layer), a wood stove's embers
// (far left); a wooden table in front of him with his enamel mug of coffee (it steams), a saucer, a sugar bowl and a
// little bean scale. Props: sugar tongs, the cube, cotton-candy fluff (an atom), a magnifier.
// World coords: 1080x1920 at zoom 1. Every time comes from a cue (scenes.js); nothing here is timed.
'use strict';

const CF = {
  hx: 560, hy: 1500, hs: 1.0,            // the hero's rig origin and scale (stand pose, legs hidden by the table)
  tableY: 1268, tableFront: 1500,        // the table top at eye level: back edge, front edge
  mug: [392, 1356], saucer: [686, 1372], bowl: [182, 1330], scale: [846, 1346],
  cube: 40,                              // a sugar cube's side in world units (a cartoon cube: about a third of his eye line)
};
let CF_WALL = null, CF_WALL_X0 = -560, CF_WALL_Y0 = 220, CF_WALL_S = 1.3;
let CF_BGDY = 0;                         // the camera's height: + low (the wall slides down: more ceiling and lights
//                                          behind him), - high (the wall slides up, more table)
const CF_WOOD = ['#6B3F22', '#7C4A28', '#5E361D', '#73452A'];
// his trail-cafe outfit: the hiker coat as ever (it is a hut on his trail)
const CFPAL = PAL;

function cfLayerCam(cam, p, dy = 0) {
  return { x: 540 + (cam.x - 540) * p, y: 960 + (cam.y - 960) * p - dy, zoom: 1 + (cam.zoom - 1) * p, rot: cam.rot || 0, sx: cam.sx || 0, sy: cam.sy || 0 };
}

// ---------------------------------------------------------------- the wall, painted once (it is far behind him)
function initCafe() {
  const WW = 2300, WH = 1500, S = CF_WALL_S;
  CF_WALL = mkCanvas(Math.round(WW * S), Math.round(WH * S));
  const x = CF_WALL.getContext('2d'), rng = mulberry32(808);
  x.scale(S, S); x.translate(-CF_WALL_X0, -CF_WALL_Y0);
  const X0 = CF_WALL_X0, Y0 = CF_WALL_Y0, X1 = X0 + WW, Y1 = Y0 + WH;
  // log planks
  for (let y = Y0, i = 0; y < Y1; y += 58, i++) {
    const g = x.createLinearGradient(0, y, 0, y + 58);
    const base = CF_WOOD[i % 4];
    g.addColorStop(0, mixH(base, '#A8703F', 0.35)); g.addColorStop(0.5, base); g.addColorStop(1, mixH(base, '#2A140A', 0.45));
    x.fillStyle = g; x.fillRect(X0, y, WW, 58);
    for (let k = 0; k < 7; k++) {   // grain
      const gy = y + 10 + rng() * 38, gx = X0 + rng() * WW, gl = 80 + rng() * 260;
      x.beginPath(); x.moveTo(gx, gy); x.quadraticCurveTo(gx + gl / 2, gy + (rng() - 0.5) * 8, gx + gl, gy); x.lineWidth = 2; x.strokeStyle = 'rgba(40,18,6,0.28)'; x.stroke();
    }
    for (let k = 0; k < 2; k++) { const kx = X0 + rng() * WW, ky = y + 18 + rng() * 22; ellipse(x, kx, ky, 9 + rng() * 6, 5, 'rgba(40,18,6,0.45)'); }
    line(x, X0, y + 57, X1, y + 57, 3, 'rgba(25,10,4,0.55)');
  }
  // the window (right of his head): a dusk sky over snowy peaks
  const wx = 735, wy = 600, ww = 330, wh = 430;
  x.save(); rrect(x, wx, wy, ww, wh, 10); x.clip();
  const sg = x.createLinearGradient(0, wy, 0, wy + wh);
  sg.addColorStop(0, '#2A1E6E'); sg.addColorStop(0.45, '#7A4AA8'); sg.addColorStop(0.75, '#FF8E7A'); sg.addColorStop(1, '#FFC98A');
  x.fillStyle = sg; x.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * rng()})`; x.beginPath(); x.arc(wx + rng() * ww, wy + rng() * wh * 0.35, 0.8 + rng() * 1.5, 0, 7); x.fill(); }
  const peaks = (base, amp, col, snow, seed) => {
    const r2 = mulberry32(seed); x.beginPath(); x.moveTo(wx - 10, wy + wh);
    const pts = [];
    for (let px = wx - 10; px <= wx + ww + 10; px += 22) { const py = base - amp * (0.4 + 0.6 * Math.abs(Math.sin(px * 0.013 + seed))) - 20 * r2(); pts.push([px, py]); x.lineTo(px, py); }
    x.lineTo(wx + ww + 10, wy + wh); x.closePath(); x.fillStyle = col; x.fill();
    // snow caps lit pink by the low sun
    x.save(); x.clip();
    for (const [px, py] of pts) { x.beginPath(); x.moveTo(px - 30, py + 40); x.lineTo(px, py - 2); x.lineTo(px + 26, py + 34); x.closePath(); x.fillStyle = snow; x.fill(); }
    x.restore();
  };
  peaks(wy + wh * 0.72, 120, '#5A4A8C', '#FFD6E6', 3);
  peaks(wy + wh * 0.9, 90, '#3B3070', '#F6C2D8', 7);
  x.fillStyle = '#2A2258'; x.fillRect(wx, wy + wh * 0.92, ww, wh * 0.1);
  for (let i = 0; i < 9; i++) {   // pines at the foot of the slope
    const px = wx + 14 + i * 38 + rng() * 14, py = wy + wh - 4, ph = 40 + rng() * 40;
    x.beginPath(); x.moveTo(px, py - ph); x.lineTo(px + 15, py); x.lineTo(px - 15, py); x.closePath(); x.fillStyle = '#1C1946'; x.fill();
  }
  x.restore();
  // frame, mullions, sill, a little potted plant
  rrect(x, wx, wy, ww, wh, 10); x.lineWidth = 22; x.strokeStyle = '#3A2112'; x.stroke();
  line(x, wx + ww / 2, wy, wx + ww / 2, wy + wh, 12, '#3A2112'); line(x, wx, wy + wh * 0.46, wx + ww, wy + wh * 0.46, 12, '#3A2112');
  rrect(x, wx - 30, wy + wh - 4, ww + 60, 28, 6); x.fillStyle = '#4A2A16'; x.fill();
  rrect(x, wx + 230, wy + wh - 60, 46, 56, 6); x.fillStyle = '#C0553A'; x.fill();
  for (let i = 0; i < 6; i++) ellipse(x, wx + 253 + (i - 2.5) * 9, wy + wh - 76 - (i % 2) * 14, 9, 22, '#3E8A44', (i - 2.5) * 0.3);
  // the chalkboard menu (left)
  const bx = -330, by = 640, bw = 300, bh = 380;
  rrect(x, bx - 14, by - 14, bw + 28, bh + 28, 10); x.fillStyle = '#6E4424'; x.fill();
  rrect(x, bx, by, bw, bh, 6); x.fillStyle = '#20302A'; x.fill();
  x.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) x.fillRect(bx + rng() * bw, by + rng() * bh, 30 + rng() * 60, 2);
  x.textAlign = 'center'; x.fillStyle = '#F4F1E6';
  x.font = '900 46px Montserrat'; x.fillText('TRAIL', bx + bw / 2, by + 66); x.fillText('CAFE', bx + bw / 2, by + 114);
  x.strokeStyle = 'rgba(244,241,230,0.8)'; x.lineWidth = 4; x.beginPath(); x.moveTo(bx + 60, by + 160); x.lineTo(bx + 110, by + 128); x.lineTo(bx + 150, by + 160); x.lineTo(bx + 185, by + 136); x.lineTo(bx + 240, by + 160); x.stroke();
  x.font = '800 30px Montserrat'; x.textAlign = 'left';
  [['COCOA', '3'], ['CHAI', '2'], ['COFFEE', '2'], ['SOUP', '4']].forEach(([w, p], i) => {
    x.fillStyle = i === 2 ? '#FFD447' : '#E8E4D8'; x.fillText(w, bx + 34, by + 214 + i * 42); x.textAlign = 'right'; x.fillText(p, bx + bw - 34, by + 214 + i * 42); x.textAlign = 'left';
  });
  // a backpack on a peg and a coiled rope (where a hiker hangs his things)
  line(x, 150, 760, 150, 790, 10, '#2A160A');
  rrect(x, 70, 790, 170, 230, 40); x.fillStyle = '#C0392B'; x.fill();
  rrect(x, 95, 860, 120, 90, 20); x.fillStyle = '#A3301F'; x.fill();
  line(x, 105, 800, 95, 1000, 12, '#1CB3A4'); line(x, 205, 800, 215, 1000, 12, '#1CB3A4');
  rrect(x, 120, 880, 70, 14, 5); x.fillStyle = '#1C1C26'; x.fill();
  for (let i = 0; i < 4; i++) { x.beginPath(); x.ellipse(-10, 900 + i * 6, 52 - i * 3, 70 - i * 4, 0, 0, Math.PI * 2); x.lineWidth = 9; x.strokeStyle = i % 2 ? '#E8A33A' : '#D08A26'; x.stroke(); }
  // the shelf (above his head) with enamel mugs and the SUGAR jar
  rrect(x, 330, 690, 330, 18, 4); x.fillStyle = '#4A2A16'; x.fill();
  for (let i = 0; i < 3; i++) { const mx = 360 + i * 70; rrect(x, mx, 630, 50, 60, 8); x.fillStyle = ['#F1ECE0', '#2BA3A0', '#F1ECE0'][i]; x.fill(); line(x, mx, 634, mx + 50, 634, 6, '#23315E'); x.beginPath(); x.arc(mx + 54, 658, 14, -1.2, 1.2); x.lineWidth = 6; x.strokeStyle = '#D9D2C2'; x.stroke(); }
  rrect(x, 568, 600, 74, 92, 14); x.fillStyle = 'rgba(210,236,255,0.55)'; x.fill(); x.lineWidth = 3; x.strokeStyle = 'rgba(255,255,255,0.7)'; x.stroke();
  rrect(x, 566, 588, 78, 16, 5); x.fillStyle = '#B5672E'; x.fill();
  for (let i = 0; i < 9; i++) { rrect(x, 576 + (i % 3) * 20, 640 + Math.floor(i / 3) * 16, 16, 15, 2); x.fillStyle = '#FBF8EE'; x.fill(); }
  x.font = '900 13px Montserrat'; x.textAlign = 'center'; x.fillStyle = '#7A3E18'; x.fillText('SUGAR', 605, 630);
  // the wood stove (far left) and its pipe
  rrect(x, -330, 980, 260, 320, 18); x.fillStyle = '#26201E'; x.fill();
  rrect(x, -290, 1060, 180, 130, 12); x.fillStyle = '#5A1C08'; x.fill();
  rrect(x, -230, 520, 60, 470, 6); x.fillStyle = '#2E2826'; x.fill();
  // a framed trail map (right of the window)
  rrect(x, 1120, 700, 200, 250, 6); x.fillStyle = '#B88A4B'; x.fill();
  rrect(x, 1134, 714, 172, 222, 3); x.fillStyle = '#E8DCB8'; x.fill();
  x.strokeStyle = '#B5432E'; x.lineWidth = 4; x.setLineDash([10, 8]); x.beginPath(); x.moveTo(1150, 910); x.bezierCurveTo(1200, 860, 1170, 790, 1240, 760); x.lineTo(1290, 730); x.stroke(); x.setLineDash([]);
  // the far wall darkens toward the top and the edges
  const vg = x.createLinearGradient(0, Y0, 0, Y1); vg.addColorStop(0, 'rgba(10,4,2,0.55)'); vg.addColorStop(0.3, 'rgba(10,4,2,0)'); vg.addColorStop(1, 'rgba(10,4,2,0.35)');
  x.fillStyle = vg; x.fillRect(X0, Y0, WW, WH);
}

// string-light bulbs along a sagging wire, world points (painted per frame so they twinkle on loop-safe clocks)
const CF_BULBS = [];
for (let i = 0; i < 15; i++) {
  const u = i / 14, bx = -120 + u * 1320;
  CF_BULBS.push([bx, 560 + 70 * Math.sin(u * Math.PI) + 26 * Math.sin(u * Math.PI * 3)]);
}

function cfBack(cam, t, o = {}) {
  const dark = o.dark || 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1A0C06'; ctx.fillRect(0, 0, W, H);
  const lc = cfLayerCam(cam, 0.72, CF_BGDY);
  applyCam(lc);
  ctx.drawImage(CF_WALL, CF_WALL_X0, CF_WALL_Y0, CF_WALL.width / CF_WALL_S, CF_WALL.height / CF_WALL_S);
  // the window's dusk glow and the stove's embers bloom
  softDot(gctx, 900, 820, 260, '#FF9A7A', 0.16);
  const ember = 0.55 + 0.25 * Math.sin(t * loopW(5.1)) + 0.15 * Math.sin(t * loopW(8.3));
  softDot(ctx, -200, 1125, 150, '#FF7A22', 0.35 * ember); softDot(gctx, -200, 1125, 170, '#FF6A10', 0.55 * ember);
  // the wire and the bulbs
  ctx.lineWidth = 3; ctx.strokeStyle = '#1A0E08'; ctx.beginPath();
  CF_BULBS.forEach(([bx, by], i) => (i ? ctx.lineTo(bx, by) : ctx.moveTo(bx, by))); ctx.stroke();
  CF_BULBS.forEach(([bx, by], i) => {
    const tw = 0.8 + 0.2 * Math.sin(t * loopW(1.7 + 0.13 * i) + i * 2.1);
    circle(ctx, bx, by + 14, 11, '#FFE6A8');
    softDot(gctx, bx, by + 14, 46, '#FFC060', 0.75 * tw);
    softDot(ctx, bx, by + 14, 40, '#FFC060', 0.22 * tw);
  });
  // the pendant lamp over the table (left of his head, never behind it)
  const lx = 300, ly = 860;
  if (!o.noLamp) {
  line(ctx, lx, 300, lx, ly - 40, 4, '#140A05');
  ctx.beginPath(); ctx.moveTo(lx - 60, ly); ctx.quadraticCurveTo(lx, ly - 90, lx + 60, ly); ctx.closePath(); ctx.fillStyle = '#2E5B4E'; ctx.fill();
  ellipse(ctx, lx, ly + 2, 40, 12, '#FFE9B8');
  softDot(gctx, lx, ly + 10, 150, '#FFC36A', 0.8);
  softDot(ctx, lx, ly + 60, 260, '#FFB75A', 0.12);
  }
  if (dark > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(8,4,16,${dark})`; ctx.fillRect(0, 0, W, H); }
}

// the table: top band from its back edge to its front edge (depth > 1: a high angle shows more of it), then its front face
function cfTable(cam, o = {}) {
  applyCam(cam);
  const depth = o.depth || 1, yb = CF.tableY + (o.dy || 0), yf = yb + (CF.tableFront - CF.tableY) * depth;
  const g = ctx.createLinearGradient(0, yb, 0, yf);
  g.addColorStop(0, '#9A6236'); g.addColorStop(1, '#B9783F');
  ctx.fillStyle = g; ctx.fillRect(-600, yb, 2300, yf - yb);
  const r = mulberry32(17);
  for (let i = 0; i < 6; i++) { const py = yb + (i + 0.5) * (yf - yb) / 6; line(ctx, -600, py, 1700, py, 2, 'rgba(70,34,12,0.35)'); }
  for (let i = 0; i < 10; i++) { const px = -400 + r() * 1900, py = yb + r() * (yf - yb); ellipse(ctx, px, py, 30 + r() * 40, 3, 'rgba(70,34,12,0.25)'); }
  ctx.fillStyle = '#6A3E1E'; ctx.fillRect(-600, yf, 2300, 60);
  ctx.fillStyle = '#4A2A12'; ctx.fillRect(-600, yf + 60, 2300, 600);
  return { yb, yf };
}

// ---------------------------------------------------------------- props (world; drawn every frame so they catch the light)
// the enamel camping mug: (x, y) = the middle of its base on the table; s = scale (1 = 132 wide)
function cfMug(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const w = 132, h = 120;
  c.beginPath(); c.arc(-w / 2 - 6, -h * 0.55, 30, Math.PI * 0.5, Math.PI * 1.5); c.lineWidth = 15; c.strokeStyle = '#E7E0D0'; c.stroke();
  rrect(c, -w / 2, -h, w, h, 14); c.fillStyle = '#F2EDE2'; c.fill();
  ellipse(c, 0, -h, w / 2, 13, '#23315E');
  ellipse(c, 0, -h + 2, w / 2 - 9, 9, '#3B2010');
  paint(() => { ellipse(c, -10, -h + 1, w / 2 - 26, 4, 'rgba(160,96,52,0.8)'); line(c, -w / 2 + 2, -6, w / 2 - 2, -6, 8, '#23315E'); });
  paint(() => { c.font = '900 22px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#23315E'; c.fillText('⛰', 0, -h * 0.42); });
  c.restore();
  // steam: three wisps that rise on loop-safe clocks (see-through: never lit)
  for (let i = 0; i < 3; i++) {
    const ph = (t * loopW(0.6 + 0.08 * i) + i * 2.1) % (Math.PI * 2), u = ph / (Math.PI * 2);
    const sx = x + (i - 1) * 30 * s, sy = y - 124 * s - u * 150 * s;
    c.beginPath(); c.moveTo(sx, sy + 40 * s);
    c.bezierCurveTo(sx - 18 * s, sy + 20 * s, sx + 18 * s, sy, sx + 4 * s * Math.sin(ph * 2), sy - 34 * s);
    c.lineWidth = 9 * s; c.lineCap = 'round'; c.strokeStyle = `rgba(255,248,236,${0.28 * Math.sin(u * Math.PI)})`; c.stroke();
  }
}
function cfSaucer(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 4, 92, 22, '#D8D1C2'); ellipse(c, 0, 0, 90, 20, '#FBF8F0'); ellipse(c, 0, 0, 52, 10, '#ECE6D8');
  paint(() => { c.beginPath(); c.ellipse(0, 0, 78, 16, 0, 0, Math.PI * 2); c.lineWidth = 3; c.strokeStyle = '#23315E'; c.stroke(); });
  c.restore();
}
function cfBowl(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-58, -60); c.quadraticCurveTo(-60, 0, 0, 2); c.quadraticCurveTo(60, 0, 58, -60); c.closePath(); c.fillStyle = '#2BA3A0'; c.fill();
  ellipse(c, 0, -60, 58, 12, '#1E7F7C');
  for (let i = 0; i < 4; i++) cfCube(c, -30 + i * 20, -66 - (i % 2) * 6, 0.5, { rot: 0.2 * (i - 1.5) });
  paint(() => { c.font = '900 15px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF'; c.fillText('SUGAR', 0, -24); });
  c.restore();
}
// a sugar cube: (x, y) its centre, s = scale (1 = CF.cube), o = {rot, glow (0..1: it is all of us), sq}
function cfCube(c, x, y, s, o = {}) {
  const a = CF.cube * s / 2;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.beginPath(); c.moveTo(-a, -a * 0.6); c.lineTo(-a * 0.55, -a * 1.05); c.lineTo(a * 1.05, -a * 1.05); c.lineTo(a, -a * 0.6); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();   // top face
  c.beginPath(); c.moveTo(a, -a * 0.6); c.lineTo(a * 1.05, -a * 1.05); c.lineTo(a * 1.05, a * 0.55); c.lineTo(a, a); c.closePath(); c.fillStyle = '#D9DEE8'; c.fill();     // side face
  rrect(c, -a, -a * 0.6, 2 * a, a * 1.6, a * 0.12); c.fillStyle = '#F3F1EA'; c.fill();                                                                             // front face
  paint(() => {   // sparkly grains
    const r = mulberry32(11);
    for (let i = 0; i < 14; i++) circle(c, -a * 0.85 + r() * a * 1.7, -a * 0.45 + r() * a * 1.35, Math.max(0.8, a * 0.05), 'rgba(190,196,214,0.8)');
  });
  c.restore();
  if (o.glow > 0.01) {   // the cube that is all of us glows a little (its light goes into the glow layer: it blooms)
    softDot(gctx, x, y, CF.cube * s * 1.6, '#BFF0FF', 0.5 * o.glow);
    softDot(gctx, x, y, CF.cube * s * 0.8, '#FFFFFF', 0.45 * o.glow);
  }
}
// sugar tongs: hinge in his fist at h, the two arms down to the claws at p (the cube's centre); open 0..1
function cfTongs(c, h, p, open = 0, s = 1) {
  const dx = p[0] - h[0], dy = p[1] - h[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const half = (CF.cube * 0.62 + 16 * open) * s;
  const arm = (sd) => {
    const tip = [p[0] + nx * half * sd, p[1] + ny * half * sd];
    const mid = [h[0] + ux * L * 0.55 + nx * half * 0.9 * sd, h[1] + uy * L * 0.55 + ny * half * 0.9 * sd];
    c.beginPath(); c.moveTo(h[0], h[1]); c.quadraticCurveTo(mid[0], mid[1], tip[0], tip[1]);
    c.lineWidth = 9 * s; c.lineCap = 'round'; c.strokeStyle = '#8D98A8'; c.stroke();
    c.lineWidth = 5 * s; c.strokeStyle = '#DCE3EC'; c.stroke();
    // the claw: a little cup facing in
    c.beginPath(); c.arc(tip[0] - nx * 4 * sd * s, tip[1] - ny * 4 * sd * s, 9 * s, 0, Math.PI * 2); c.fillStyle = '#C3CCD8'; c.fill();
  };
  arm(-1); arm(1);
  circle(c, h[0], h[1], 10 * s, '#AEB8C6');
}

// cotton-candy fluff: a ball of puffs and floss strands round ONE tiny speck. (x, y) centre, r radius, o = {seed, poke:
// [px, py, k] (a dent), sq (0..1: squashed flat sideways), speck (0..1: the speck shows), wob}
const CF_FLUFF = [];
(function () {
  const r = mulberry32(2026);
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.72;
    CF_FLUFF.push({ a, d, rr: 0.22 + 0.16 * r(), sh: r(), ph: r() * 6.28 });
  }
  CF_FLUFF.sort((p, q) => p.d * Math.sin(p.a) - q.d * Math.sin(q.a));
})();
function cfFluff(c, x, y, r, t, o = {}) {
  const sq = o.sq || 0, sx = 1 - 0.86 * sq, sy = 1 + 0.25 * sq;
  const wob = o.wob || 0;
  const pk = o.poke;
  c.save(); c.translate(x, y);
  // the glow of the whole ball (bloom): candy pink
  softDot(gctx, 0, 0, r * 1.25 * Math.max(sx, 0.35), '#FF7FC0', 0.35);
  for (const f of CF_FLUFF) {
    let px = Math.cos(f.a) * f.d * r * sx, py = Math.sin(f.a) * f.d * r * sy;
    px += wob * 6 * Math.sin(t * 22 + f.ph); py += wob * 6 * Math.cos(t * 19 + f.ph);
    if (pk && pk[2] > 0) {   // a dent where the fingertip pushes in
      const qx = pk[0] - x, qy = pk[1] - y, dd = Math.hypot(px - qx, py - qy), R = r * 0.7;
      if (dd < R) { const push = pk[2] * (1 - dd / R) * r * 0.35; const L = Math.hypot(px, py) || 1; px -= (px / L) * push; py -= (py / L) * push; }
    }
    const rr = f.rr * r * (1 - 0.3 * sq);
    const col = f.sh < 0.33 ? '#FF9CCF' : f.sh < 0.66 ? '#FF86C2' : '#FFB2DA';
    circle(c, px, py, rr, col);
  }
  // floss strands: thin curly lines over the puffs (paint: no edge)
  paint(() => {
    const rs = mulberry32(77);
    for (let i = 0; i < 26; i++) {
      const a = rs() * 6.28, d = 0.25 + 0.6 * rs(), px = Math.cos(a) * d * r * sx, py = Math.sin(a) * d * r * sy, L = (0.18 + 0.2 * rs()) * r;
      c.beginPath(); c.moveTo(px, py); c.bezierCurveTo(px + L * 0.5, py - L * 0.4, px + L * 0.2, py + L * 0.5, px + L, py + L * 0.1);
      c.lineWidth = Math.max(1.5, r * 0.012); c.strokeStyle = rs() < 0.5 ? 'rgba(255,230,244,0.75)' : 'rgba(226,80,160,0.55)'; c.stroke();
    }
  });
  if ((o.speck || 0) > 0.01) {   // the speck: all the weight, in the middle (it glows gold)
    const k = o.speck;
    circle(c, 0, 0, Math.max(3, r * 0.04) * (0.6 + 0.4 * k), '#FFE27A');
    softDot(gctx, 0, 0, r * 0.32 * k, '#FFD447', 0.95 * k);
    softDot(c, 0, 0, r * 0.12 * k, '#FFF6C8', 0.5 * k);
  }
  c.restore();
}
// a puff of fluff that poofs out of something (k 0..1 from the poof): little pink clouds flying out and shrinking
function cfPoof(c, x, y, k, s = 1, seed = 5, dir = -Math.PI / 2, spread = 2.6, rise = 30) {
  if (k <= 0 || k >= 1) return;
  const r = mulberry32(seed);
  for (let i = 0; i < 14; i++) {
    const a = dir + (r() - 0.5) * spread, sp = (60 + 120 * r()) * s, e = E.outCubic(k);
    const px = x + Math.cos(a) * sp * e, py = y + Math.sin(a) * sp * e - rise * s * k;
    const rr = (16 + 18 * r()) * s * (1 - k) * (0.6 + 0.8 * Math.min(1, k * 4));
    if (rr > 0.5) circle(c, px, py, rr, r() < 0.5 ? '#FF9CCF' : '#FFB8DC');
  }
}

// the little bean scale: (x, y) the middle of its foot; o = {kg, dent (0..1), crack (0..1)}
function cfScale(c, x, y, s, o = {}) {
  const dent = o.dent || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -86, -64 + dent * 16, 172, 64 - dent * 16, 14); c.fillStyle = '#C7CED8'; c.fill();
  rrect(c, -86, -14, 172, 14, 6); c.fillStyle = '#9AA3B0'; c.fill();
  // the plate (it dents in the middle)
  c.beginPath(); c.moveTo(-96, -70 + dent * 16); c.quadraticCurveTo(0, -70 + dent * 46, 96, -70 + dent * 16); c.lineTo(96, -80 + dent * 16); c.quadraticCurveTo(0, -80 + dent * 46, -96, -80 + dent * 16); c.closePath();
  c.fillStyle = '#E4E9F0'; c.fill();
  // the display
  rrect(c, -50, -50 + dent * 16, 100, 30, 6); c.fillStyle = '#1C2A22'; c.fill();
  paint(() => {
    c.font = '900 22px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = o.kg > 0.05 ? '#FF6A5A' : '#7DFFB0';
    c.fillText(o.kg > 0.05 ? `${o.kg.toFixed(1)} kg` : '0.0 g', 0, -34 + dent * 16);
  });
  softDot(gctx, 0, -35 + dent * 16, 60, o.kg > 0.05 ? '#FF5A4A' : '#5AFFA0', 0.35);
  c.restore();
  if ((o.crack || 0) > 0.01) {   // crack lines in the table round its feet
    const k = o.crack, r = mulberry32(31);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3, L = (60 + 70 * r()) * k * s;
      const p = [[x, y]];
      for (let j = 1; j <= 3; j++) p.push([x + Math.cos(a + (r() - 0.5) * 0.6) * L * j / 3 * 1.6, y + Math.sin(a) * L * j / 3 * 0.35 + 4]);
      poly(c, p, 3.5 * s, 'rgba(40,18,6,0.85)');
    }
  }
}
// a magnifier: lens centre (x, y), radius R, handle toward ang; inner(c) draws what the lens shows (already clipped)
function cfMagnifier(c, x, y, R, ang, inner) {
  const hx = x + Math.cos(ang) * R * 1.05, hy = y + Math.sin(ang) * R * 1.05;
  line(c, hx, hy, hx + Math.cos(ang) * R * 1.1, hy + Math.sin(ang) * R * 1.1, R * 0.26, '#3A2418');
  line(c, hx, hy, hx + Math.cos(ang) * R * 0.25, hy + Math.sin(ang) * R * 0.25, R * 0.22, '#B88A4B');
  c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fillStyle = '#DDEBF4'; c.fill();   // one opaque fill first, outside the clip
  c.save(); c.beginPath(); c.arc(x, y, R * 0.94, 0, Math.PI * 2); c.clip(); inner(c); c.restore();
  paint(() => {
    c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.lineWidth = R * 0.1; c.strokeStyle = '#2C2F3A'; c.stroke();
    c.beginPath(); c.arc(x - R * 0.3, y - R * 0.34, R * 0.32, Math.PI * 1.05, Math.PI * 1.55); c.lineWidth = R * 0.07; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
  });
}

// ---------------------------------------------------------------- the hero at the table
// A = {face, pose (a base pose), handL / handR: world points the wrists reach (elbows out), kindL / kindR (hand shapes),
//      tongs: {p (claw centre, world), open}, cube: {p, glow} drawn between the tongs, headRot, headDX, headDY,
//      front(c, rr): drawn after him on his layer (things he holds in front of himself), lookAt}
function cfHero(cam, t, A = {}) {
  const st = { x: CF.hx + (A.dx || 0), y: CF.hy + (A.dy || 0), s: CF.hs, noLegs: true,
    pose: null, face: A.face || FACES.calm, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0 };
  let pose = JSON.parse(JSON.stringify(A.pose || POSES.stand));
  if (A.handL) pose = ikReach(pose, 'L', ikLocal(st, A.handL[0], A.handL[1]), A.bendL === undefined ? -1 : A.bendL);
  if (A.handR) pose = ikReach(pose, 'R', ikLocal(st, A.handR[0], A.handR[1]), A.bendR === undefined ? -1 : A.bendR);
  if (A.armL) pose = armAt(pose, 'L', ikLocal(st, ...A.armL.e), ikLocal(st, ...A.armL.w));
  if (A.armR) pose = armAt(pose, 'R', ikLocal(st, ...A.armR.e), ikLocal(st, ...A.armR.w));
  if (A.kindL) pose.handL = A.kindL;
  if (A.kindR) pose.handR = A.kindR;
  st.pose = pose;
  const out = {};
  const r = charLayer(cam, st, t, {
    pal: CFPAL, ambient: 0.02, light: 0,
    post: (lc, rr, s2) => {
      // what he holds is drawn after him (in world coords on his layer)
      lc.save();
      lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      const wl = rr.wrL, wr = rr.wrR, dl = rr.armDirL, dr = rr.armDirR;
      lc.restore();
      const toW = (p) => [s2.x + p[0] * s2.s, s2.y + p[1] * s2.s];
      out.wristL = toW(wl); out.wristR = toW(wr);
      out.handL = toW([wl[0] + dl[0] * 14, wl[1] + dl[1] * 14]); out.handR = toW([wr[0] + dr[0] * 14, wr[1] + dr[1] * 14]);
      if (A.front) A.front(lc, out);
      if (A.tongs) {
        const h = A.tongsHand === 'R' ? out.handR : out.handL;
        actor(() => {
          if (A.cube) cfCube(lc, A.cube.p[0], A.cube.p[1], A.cube.s || 1, { rot: A.cube.rot || 0 });
          cfTongs(lc, [h[0], h[1] + 10], A.tongs.p, A.tongs.open || 0);
          // his fist again over the hinge, so he grips them
          circle(lc, h[0], h[1], 21, CFPAL.skin);
        });
      }
      if (A.after) A.after(lc, out);
    },
  });
  const rp = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  out.st = st; out.r = r; out.rp = rp;
  out.head = rp(r.head);
  return out;
}
// a face that looks at a world point from his head (lookX/lookY -1..1)
function cfLook(face, head, p, amt = 1) {
  const dx = p[0] - head[0], dy = p[1] - head[1], L = Math.hypot(dx, dy) || 1;
  return Object.assign({}, face, { lookX: clamp(dx / L * 1.2, -1, 1) * amt, lookY: clamp(dy / L * 1.2, -1, 1) * amt });
}
