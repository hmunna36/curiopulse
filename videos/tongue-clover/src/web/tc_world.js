// Can You Make a Tongue CLOVER? Short: the world (11 Nov 2026).
// The bathroom of the mirror Shorts (mirror.js: the camera IS the mirror) repainted for this one: apricot tiles, a pot of
// three-leaf clover on the sill, a mint towel, the morning window on the left.
//   initTc()                    paints the room once (TC_ROOM)
//   tcRoom(cam, t)              the room, far behind him (mirror.js's mirBgCam), with its window light and lamp
//   tcTongue(c, T, t)           his tongue out, front view, in HEAD units (roll-tongue's tongueFront underneath). T adds:
//                               fold 0..1 (the tip flipped up and back over the tongue: its underside shows),
//                               clover 0..1 (over 0.5: the three-leaf shape, popped in by `pop`), top 0..1 (taco
//                               toppings landing in the roll), wires {tangle, neat} 0..1 (the nerves inside, x-ray),
//                               twist -1..1 (turned on its long axis: the underside shows along one edge)
//   tcMini(c, x, y, s, o)       a little face with its tongue out (roll-tongue's miniFace) and tcTongue's options in o.T
//   tcGym(c, x, y, s, o)        a tongue gymnast in a leotard: o {pose: stand|crouch|tuck|land, rot, clover, arms, look, t}
//   tcArena(t, o)               the gymnastics hall in screen space: spotlights, a crowd with camera flashes, the beam
//   tcCard(x, y, s, k, t)       the TACO CLUB membership card (screen space)
//   tcScore(x, y, s, k, txt)    a judge's score card (screen space)
'use strict';

const TCPAL = Object.assign({}, PAL, { coat: '#2FAE7A', coatSh: '#1F8A5E', coatHi: '#8FE8BE', coatDk: '#16674A', pj: true });
const TCU = { under: '#E98AA2', underSh: '#CC6A88', vein: '#7A86E8', crease: '#9C2C44' };
let TC_ROOM = null;

// ---------------------------------------------------------------- the room
function tcPaintRoom() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, W * 0.7, H);
  g.addColorStop(0, '#FFC49A'); g.addColorStop(0.55, '#F09A72'); g.addColorStop(1, '#C26652');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // tiles: each a touch lighter or darker than its neighbours, with joints between them
  const rng = mulberry32(11), TS = 128;
  for (let y = -30; y < H; y += TS) for (let x = -50; x < W + TS; x += TS) {
    const v = rng();
    rrect(c, x + 5, y + 5, TS - 10, TS - 10, 12);
    c.fillStyle = `rgba(255,255,255,${0.03 + 0.10 * v})`; c.fill();
    rrect(c, x + 14, y + 12, TS - 60, 8, 4); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fill();
  }
  for (let x = -50; x < W + TS; x += TS) line(c, x, 0, x, H, 6, 'rgba(120,52,40,0.42)');
  for (let y = -30; y < H; y += TS) line(c, 0, y, W, y, 6, 'rgba(120,52,40,0.42)');
  // a band of mint tiles at shoulder height
  for (let x = -50; x < W + TS; x += 64) { rrect(c, x + 3, 1352, 58, 58, 8); c.fillStyle = (Math.floor(x / 64) % 2) ? '#7FD8B4' : '#5CC49C'; c.fill(); }
  // the window, left: frosted glass full of morning
  rrect(c, 44, 330, 286, 470, 22); c.fillStyle = '#FFF1E2'; c.fill();
  const wg = c.createLinearGradient(0, 350, 0, 780); wg.addColorStop(0, '#FFF2B8'); wg.addColorStop(1, '#FFC46A');
  rrect(c, 66, 352, 242, 426, 12); c.fillStyle = wg; c.fill();
  line(c, 187, 352, 187, 778, 12, '#FFF1E2'); line(c, 66, 560, 308, 560, 12, '#FFF1E2');
  rrect(c, 24, 790, 326, 30, 10); c.fillStyle = '#FFF4EA'; c.fill();
  // a pot of three-leaf clover on the sill
  rrect(c, 92, 712, 104, 82, 16); c.fillStyle = '#4F8FE0'; c.fill();
  rrect(c, 84, 704, 120, 22, 9); c.fillStyle = '#6FA8F0'; c.fill();
  const leafy = mulberry32(5);
  for (let i = 0; i < 7; i++) {
    const sx = 112 + 64 * leafy(), sy = 600 + 70 * leafy(), r = 15 + 6 * leafy(), a0 = -0.6 + 1.2 * leafy();
    line(c, 144, 708, sx, sy + r * 0.6, 4, '#3E8A3A');
    for (let k = 0; k < 3; k++) {
      const a = a0 + k * (Math.PI * 2 / 3) - Math.PI / 2;
      c.save(); c.translate(sx + Math.cos(a) * r * 0.55, sy + Math.sin(a) * r * 0.55); c.rotate(a + Math.PI / 2);
      c.beginPath(); c.moveTo(0, r * 0.55); c.bezierCurveTo(-r * 0.95, -r * 0.1, -r * 0.45, -r * 0.85, 0, -r * 0.35);
      c.bezierCurveTo(r * 0.45, -r * 0.85, r * 0.95, -r * 0.1, 0, r * 0.55); c.fillStyle = k % 2 ? '#3FAF4A' : '#52C25A'; c.fill();
      c.restore();
    }
  }
  // a shelf, right: a cup with a toothbrush, a bottle, a jar of floss
  rrect(c, 770, 700, 300, 22, 9); c.fillStyle = '#FFF4EA'; c.fill();
  line(c, 868, 520, 884, 640, 9, '#4FB5FF'); rrect(c, 852, 492, 26, 46, 8); c.fillStyle = '#FFFFFF'; c.fill();
  rrect(c, 840, 610, 84, 92, 14); c.fillStyle = '#FFD24A'; c.fill();
  rrect(c, 962, 584, 66, 118, 20); c.fillStyle = '#9F7BEA'; c.fill(); rrect(c, 980, 548, 30, 40, 8); c.fillStyle = '#F4F0FA'; c.fill();
  // a mint towel on a ring
  c.beginPath(); c.arc(930, 940, 50, 0, 7); c.lineWidth = 10; c.strokeStyle = '#E8DCD2'; c.stroke();
  rrect(c, 872, 946, 116, 330, 18); c.fillStyle = '#9BEACB'; c.fill();
  for (const y of [1180, 1212]) { rrect(c, 872, y, 116, 14, 4); c.fillStyle = '#2FAE7A'; c.fill(); }
  // a wall light above the window
  rrect(c, 150, 196, 78, 30, 10); c.fillStyle = '#E6B89A'; c.fill();
  c.beginPath(); c.moveTo(138, 226); c.lineTo(240, 226); c.lineTo(222, 296); c.lineTo(156, 296); c.closePath(); c.fillStyle = '#FFE7B8'; c.fill();
  return cv;
}
function initTc() { TC_ROOM = tcPaintRoom(); }
function tcRoom(cam, t) {
  const bc = mirBgCam(cam);
  screenSpace(); ctx.fillStyle = '#C26652'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(TC_ROOM, 0, 0);
  softDot(gctx, 187, 565, 250, '#FFE2A0', 0.3); softDot(gctx, 187, 565, 560, '#FFD27A', 0.08); softDot(gctx, 189, 262, 120, '#FFE2B0', 0.35);
  sunRays(187, 540, 0.32);
}

// ---------------------------------------------------------------- the tongue (head units)
function tcTongue(c, T, t) {
  const fold = clamp(T.fold || 0), clv = clamp(T.clover || 0);
  if (clv > 0.5) return tcClover(c, T, t);
  const B = Object.assign({}, T, { out: (T.out === undefined ? 1 : T.out) * (1 - 0.4 * fold) });
  const tw = T.twist || 0;
  if (Math.abs(tw) > 0.01) { c.save(); c.translate(0, TG_Y0); c.rotate(0.42 * tw); c.translate(0, -TG_Y0); }
  const r = tongueFront(c, B, t);
  if (r && Math.abs(tw) > 0.01) tcTwistEdge(c, r.G, tw);
  if (r && fold > 0.02) tcFlap(c, r.G, fold, T, t);
  if (r && (T.top || 0) > 0.01) tcToppings(c, r.G, T.top, t);
  if (r && T.wires) tcWires(c, r.G, T.wires, t);
  if (Math.abs(tw) > 0.01) c.restore();
  return r;
}
// the underside showing along one edge when the tongue is turned on its long axis
function tcTwistEdge(c, G, tw) {
  const s = tw > 0 ? 1 : -1, k = Math.abs(tw);
  const o = [], i2 = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10; o.push(tgEdge(G, s, u, -0.3)); i2.push(tgEdge(G, s, u, 2 + 9 * k)); }
  paint(() => {
    c.beginPath(); o.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); for (let i = i2.length - 1; i >= 0; i--) c.lineTo(i2[i][0], i2[i][1]); c.closePath();
    c.fillStyle = TCU.under; c.fill();
    c.beginPath(); i2.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = 1.4; c.strokeStyle = rgba(TG.dark, 0.6); c.stroke();
    const v = []; for (let i = 2; i <= 8; i++) v.push(tgEdge(G, s, i / 10, 1 + 4 * k));
    c.beginPath(); v.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = 1.2; c.strokeStyle = rgba(TCU.vein, 0.8); c.stroke();
  });
}
// the tip flipped up and back over the tongue: we see its underside (paler, two blue veins), pointing up
function tcFlap(c, G, fold, T, t) {
  const yb = G.tip[1] + 1.5, sw = T.sway || 0, k = (G.k.L + G.k.R) / 2;
  const wb = 15.5 * (1 - 0.4 * k), Lf = 26 * fold, ytop = Math.max(TG_Y0 + 7, yb - Lf);
  const tipx = G.tip[0] + 0.6 * sw;
  const path = () => {
    c.beginPath(); c.moveTo(G.tip[0] - wb, yb);
    c.bezierCurveTo(G.tip[0] - wb * 1.08, lerp(yb, ytop, 0.55), tipx - wb * 0.9, ytop, tipx, ytop);
    c.bezierCurveTo(tipx + wb * 0.9, ytop, G.tip[0] + wb * 1.08, lerp(yb, ytop, 0.55), G.tip[0] + wb, yb);
    c.quadraticCurveTo(G.tip[0], yb + 5.5, G.tip[0] - wb, yb); c.closePath();
  };
  // its shadow on the tongue: the flap stands up off it
  paint(() => { c.save(); c.translate(0, 2.6); c.translate(G.tip[0], yb); c.scale(1.1, 1.04); c.translate(-G.tip[0], -yb); path(); c.fillStyle = rgba(TG.dark, 0.5); c.fill(); c.restore(); });
  actor(() => { path(); c.fillStyle = TCU.under; c.fill(); });
  paint(() => {
    // the fold's rounded edge at the bottom, the veins and the little fold under the tip
    c.beginPath(); c.moveTo(G.tip[0] - wb * 1.0, yb - 0.5); c.quadraticCurveTo(G.tip[0], yb + 6, G.tip[0] + wb * 1.0, yb - 0.5); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = TG.hi; c.stroke();
    c.beginPath(); c.moveTo(G.tip[0] - wb * 0.9, yb + 1.6); c.quadraticCurveTo(G.tip[0], yb + 7.2, G.tip[0] + wb * 0.9, yb + 1.6); c.lineWidth = 1.4; c.strokeStyle = rgba(TG.dark, 0.7); c.stroke();
    ellipse(c, tipx, ytop + 2.2, wb * 0.55, 1.6, rgba('#FFFFFF', 0.4));
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(G.tip[0] + s * 3, yb - 1); c.quadraticCurveTo(G.tip[0] + s * 7, lerp(yb, ytop, 0.5), tipx + s * 4, lerp(yb, ytop, 0.88));
      c.lineWidth = 1.6; c.strokeStyle = rgba(TCU.vein, 0.85); c.stroke();
    }
    line(c, G.tip[0], yb - 2, lerp(G.tip[0], tipx, 0.5), lerp(yb, ytop, 0.45), 1.6, rgba(TCU.crease, 0.55));
    ellipse(c, tipx - 4, lerp(yb, ytop, 0.7), 3, 5, rgba('#FFFFFF', 0.25), -0.2);
    path(); c.lineWidth = 1.3; c.strokeStyle = rgba(TG.dark, 0.55); c.stroke();
  });
}
// taco toppings landing in the roll: lettuce, cheese, tomato
function tcToppings(c, G, k, t) {
  const items = 13;
  paint(() => {
    for (let i = 0; i < items; i++) {
      const h1 = hash(i * 3.7 + 1), h2 = hash(i * 5.3 + 2), h3 = hash(i * 1.9 + 7);
      const d = clamp((k * 1.6 - (i / items) * 0.6)), land = E.outBack(d, 1.4);
      if (d <= 0.01) continue;
      const u = 0.18 + 0.68 * h1, ex = tgEdge(G, h2 < 0.5 ? -1 : 1, u, 8);
      const x = lerp(0, ex[0], 0.55 * (h2 - 0.5) * 2) + (G.tip[0] * u * 0.3), y = ex[1] - 4 - (1 - land) * 46;
      c.save(); c.translate(x, y); c.rotate((h3 - 0.5) * 1.6 + (1 - land) * 2); c.scale(1.45, 1.45);
      if (i % 3 === 0) {          // lettuce: a wavy green shred
        c.beginPath(); c.moveTo(-6, 0); for (let j = 1; j <= 6; j++) c.lineTo(-6 + j * 2, (j % 2 ? -2 : 2)); c.lineWidth = 3; c.lineCap = 'round'; c.strokeStyle = '#5BD15A'; c.stroke();
      } else if (i % 3 === 1) {   // cheese: a little yellow stick
        rrect(c, -4.5, -1.8, 9, 3.6, 1.2); c.fillStyle = '#FFC93A'; c.fill();
      } else {                    // tomato: a red cube with a shine
        rrect(c, -2.6, -2.6, 5.2, 5.2, 1.4); c.fillStyle = '#F2453D'; c.fill(); circle(c, -0.9, -1, 0.9, 'rgba(255,255,255,0.6)');
      }
      c.restore();
    }
  });
}
// the nerves inside (x-ray): a tangle that sends one signal everywhere, or three neat wires, one per job
function tcWires(c, G, Wi, t) {
  const tg = clamp(Wi.tangle || 0), nt = clamp(Wi.neat || 0), y0 = TG_Y0;
  if (tg > 0.01) paint(() => {
    const cx = 0, cy = y0 + 20, pts = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 8;
      pts.push([cx + 11 * Math.sin(3 * a + 0.4 * Math.sin(t * 7)) + 4 * Math.sin(7 * a + t * 3), cy + 6 * Math.sin(2 * a + 1) + 3 * Math.cos(5 * a - t * 4)]);
    }
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineJoin = 'round';
    c.lineWidth = 4; c.strokeStyle = rgba('#5A1A08', 0.8 * tg); c.stroke(); c.lineWidth = 2.4; c.strokeStyle = rgba('#FF9A3C', tg); c.stroke();
    // one fat cord out of the knot to the whole tongue
    c.beginPath(); c.moveTo(0, cy + 6); c.quadraticCurveTo(2 * Math.sin(t * 9), lerp(cy, G.tip[1], 0.5), 0, G.tip[1] - 8); c.lineWidth = 3.4; c.strokeStyle = rgba('#FF9A3C', tg); c.stroke();
    line(c, 0, y0 - 6, 0, cy - 5, 3.4, rgba('#FF9A3C', tg));
  });
  if (tg > 0.01) softDotLocal(c, 0, y0 + 20, 26, '#FF9A3C', (0.35 + 0.25 * Math.abs(Math.sin(t * 13))) * tg);
  if (nt > 0.01) {
    const ends = [[G.tip[0], G.tip[1] - 7, '#FF7FA0'], [...tgEdge(G, -1, 0.62, 5), '#FFD447'], [...tgEdge(G, 1, 0.62, 5), '#7FE9FF']];
    paint(() => {
      ends.forEach(([x, y, col], i) => {
        const kk = clamp(nt * 3 - i * 0.6);
        if (kk <= 0.01) return;
        const x1 = lerp(0, x, kk), y1 = lerp(y0, y, kk);
        c.beginPath(); c.moveTo((i - 1) * 2.5, y0 - 6); c.quadraticCurveTo((i - 1) * 5, lerp(y0, y1, 0.5), x1, y1); c.lineWidth = 2.2; c.lineCap = 'round'; c.strokeStyle = col; c.stroke();
        circle(c, x1, y1, 2.8 * kk, col);
      });
    });
    ends.forEach(([x, y, col], i) => { const kk = clamp(nt * 3 - i * 0.6); if (kk > 0.3) softDotLocal(c, x, y, 10, col, 0.5 * kk); });
  }
}
// the three-leaf shape: the tip folded up over the middle (its underside shows), the two sides rolled up into round leaves
function tcClover(c, T, t) {
  const y0 = TG_Y0, sw = 0.5 * (T.sway || 0), pk = T.pop === undefined ? 1 : E.outBack(clamp(T.pop), 2.2);
  paint(() => {
    ellipse(c, 0, y0 - 1, 19, 8.5, TG.mouth);
    ellipse(c, 0, y0 - 5.5, 12.5, 2.8, '#FFFFFF');
  });
  c.save(); c.translate(sw, y0); c.scale(pk, pk); c.translate(0, -y0);
  // three heart-shaped leaves out of one middle, like a clover: one down (the tip), two up and out (the rolled sides)
  const C0 = [0, y0 + 26], R = 17, ANG = [Math.PI / 2, Math.PI / 2 + 2 * Math.PI / 3, Math.PI / 2 - 2 * Math.PI / 3];
  const leaf = (a) => {
    c.save(); c.translate(C0[0], C0[1]); c.rotate(a);
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(R * 0.2, -R * 0.58, R * 0.75, -R * 0.98, R * 1.16, -R * 0.56);
    c.bezierCurveTo(R * 1.38, -R * 0.3, R * 1.22, -R * 0.04, R * 0.9, 0);
    c.bezierCurveTo(R * 1.22, R * 0.04, R * 1.38, R * 0.3, R * 1.16, R * 0.56);
    c.bezierCurveTo(R * 0.75, R * 0.98, R * 0.2, R * 0.58, 0, 0);
    c.closePath(); c.restore();
  };
  // the neck of the tongue from the lips to the middle
  actor(() => {
    c.beginPath(); c.moveTo(-15, y0 - 4); c.lineTo(15, y0 - 4); c.quadraticCurveTo(10, y0 + 14, 3, C0[1]); c.lineTo(-3, C0[1]); c.quadraticCurveTo(-10, y0 + 14, -15, y0 - 4); c.closePath(); c.fillStyle = TG.sh; c.fill();
    for (const a of ANG) { leaf(a); c.fillStyle = TG.col; c.fill(); }
  });
  paint(() => {
    ANG.forEach((a, i) => {
      leaf(a); c.lineWidth = 2.4; c.strokeStyle = rgba(TG.ridge, 0.9); c.stroke();
      leaf(a); c.lineWidth = 1.3; c.strokeStyle = rgba(TG.dark, 0.7); c.stroke();
      // the fold down its middle, and a shine on one half
      c.save(); c.translate(C0[0], C0[1]); c.rotate(a);
      line(c, R * 0.12, 0, R * 0.82, 0, 1.8, rgba(TCU.crease, 0.6));
      ellipse(c, R * 0.72, -R * 0.42, R * 0.22, R * 0.12, rgba('#FFFFFF', 0.32), 0.5);
      c.restore();
    });
    circle(c, C0[0], C0[1], 2.6, TG.hollow);   // where the three folds meet
    // the lips over the root
    c.beginPath(); c.moveTo(-20, y0 - 2); c.quadraticCurveTo(0, y0 - 11, 20, y0 - 2); c.lineWidth = 3.2; c.lineCap = 'round'; c.strokeStyle = TG.lip; c.stroke();
  });
  // the x-ray: the same three ways of muscle in every leaf
  const xr = clamp(T.xray || 0), f = T.fib || {};
  if (xr > 0.01) paint(() => {
    const pulse = 0.75 + 0.25 * Math.sin(t * 6);
    for (const a of ANG) {
      leaf(a); c.fillStyle = rgba('#3A0C24', 0.72 * xr); c.fill();
      c.save(); c.translate(C0[0], C0[1]); c.rotate(a);
      for (const dy of [-0.4, 0, 0.4]) { c.beginPath(); c.moveTo(R * 0.15, dy * R * 0.4); c.quadraticCurveTo(R * 0.6, dy * R * 1.1, R * 1.05, dy * R * 0.9); c.lineWidth = 1.7; c.strokeStyle = rgba('#FF7FA0', xr * (0.25 + 0.75 * clamp(f.L || 0) * pulse)); c.stroke(); }
      for (const dx of [0.4, 0.7, 0.98]) { c.beginPath(); c.moveTo(R * dx, -R * 0.55 * Math.min(1, dx * 1.2)); c.quadraticCurveTo(R * (dx + 0.06), 0, R * dx, R * 0.55 * Math.min(1, dx * 1.2)); c.lineWidth = 1.5; c.strokeStyle = rgba('#FFD447', xr * (0.2 + 0.8 * clamp(f.X || 0) * pulse)); c.stroke(); }
      for (let i = 0; i < 5; i++) circle(c, R * (0.35 + 0.15 * i), R * 0.2 * Math.sin(i * 2.3), 1.1, rgba('#7FE9FF', xr * (0.15 + 0.85 * clamp(f.V || 0) * pulse)));
      c.restore();
      leaf(a); c.lineWidth = 1.5; c.strokeStyle = rgba('#FFB3C6', 0.85 * xr); c.stroke();
    }
  });
  c.restore();
  const G = { tip: [sw, y0 + 26 + R * 1.15], k: { L: 1, R: 1 }, L: 44, y0, A: { root: [-16.5, y0], mid: [-22, y0 + 18], near: [-14, y0 + 30], kk: 1 }, B: { root: [16.5, y0], mid: [22, y0 + 18], near: [14, y0 + 30], kk: 1 } };
  if (T.wires) tcWires(c, G, T.wires, t);
  return { G, tip: G.tip, edgeL: [-26, y0 + 30], edgeR: [26, y0 + 30], root: [0, y0], hole: [0, y0 + 32] };
}

function tcLeafPath(c, cx, cy, a, R) {
  const cs = Math.cos(a), sn = Math.sin(a), P = (x, y) => [cx + x * cs - y * sn, cy + x * sn + y * cs];
  const q = [[0, 0], [R * 0.2, -R * 0.58], [R * 0.75, -R * 0.98], [R * 1.16, -R * 0.56], [R * 1.38, -R * 0.3], [R * 1.22, -R * 0.04], [R * 0.9, 0],
    [R * 1.22, R * 0.04], [R * 1.38, R * 0.3], [R * 1.16, R * 0.56], [R * 0.75, R * 0.98], [R * 0.2, R * 0.58], [0, 0]].map((v) => P(v[0], v[1]));
  c.moveTo(q[0][0], q[0][1]);
  for (let i = 1; i < q.length; i += 3) c.bezierCurveTo(q[i][0], q[i][1], q[i + 1][0], q[i + 1][1], q[i + 2][0], q[i + 2][1]);
  c.closePath();
}

// ---------------------------------------------------------------- a little face with its tongue out
function tcMini(c, x, y, s, o = {}) {
  miniFace(c, x, y, s, Object.assign({}, o, { tongue: false }));
  c.save(); c.translate(x, y); c.scale(s / 70, s / 70);
  const r = tcTongue(c, Object.assign({ out: 1 }, o.T || {}), o.t || 0);
  c.restore();
  return r;
}

// ---------------------------------------------------------------- a tongue gymnast (its own units: about 70 wide, 130 tall)
// o: {pose: 'stand' | 'crouch' | 'tuck' | 'land', rot (radians), clover 0..1, arms 0..1 (up), look [x, y], t, wink}
function tcGym(c, x, y, s, o = {}) {
  const t = o.t || 0, clv = clamp(o.clover || 0), arms = clamp(o.arms === undefined ? 0.3 : o.arms);
  const sq = o.pose === 'crouch' ? 0.82 : o.pose === 'tuck' ? 0.7 : 1, wd = o.pose === 'crouch' ? 1.12 : 1;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s * wd, s * sq);
  const body = () => {
    c.beginPath();
    if (clv > 0.5) {   // the top becomes three heart-shaped leaves, like a clover
      c.moveTo(-30, 52); c.bezierCurveTo(-34, 20, -32, -8, -18, -24); c.lineTo(18, -24); c.bezierCurveTo(32, -8, 34, 20, 30, 52); c.quadraticCurveTo(0, 62, -30, 52); c.closePath();
      for (const a of [-Math.PI / 2, -Math.PI / 2 - 1.2, -Math.PI / 2 + 1.2]) tcLeafPath(c, 0, -22, a, 30);
    } else {
      c.moveTo(-30, 52); c.bezierCurveTo(-36, 10, -38, -40, -22, -62); c.quadraticCurveTo(0, -84, 22, -62); c.bezierCurveTo(38, -40, 36, 10, 30, 52); c.quadraticCurveTo(0, 62, -30, 52);
    }
    c.closePath();
  };
  // arms (behind the body when down, in front when up)
  const armPts = (sd) => {
    const a = lerp(0.35, -2.2, arms) * sd + 0.15 * Math.sin(t * 6 + sd);
    const sh = [sd * 27, -8], el = [sh[0] + Math.sin(a) * 26 * sd * sd, sh[1] + Math.cos(a) * 26];
    const a2 = a + sd * lerp(0.3, -0.25, arms);
    return [sh, el, [el[0] + Math.sin(a2) * 22, el[1] + Math.cos(a2) * 22]];
  };
  const drawArm = (sd) => { const [sh, el, hd] = armPts(sd); line(c, sh[0], sh[1], el[0], el[1], 9, TG.col); line(c, el[0], el[1], hd[0], hd[1], 8.5, TG.col); circle(c, hd[0], hd[1], 7, TG.ridge); };
  actor(() => { body(); c.fillStyle = TG.col; c.fill(); for (const sd of [-1, 1]) drawArm(sd); });
  paint(() => {
    // the middle groove and a shine
    c.save(); body(); c.clip();
    line(c, 0, clv > 0.5 ? 10 : -58, 0, 30, 3, rgba(TG.dark, 0.35));
    ellipse(c, -12, -30, 6, 16, 'rgba(255,255,255,0.22)', -0.2);
    c.restore();
    // the leotard: a violet band with sparkles and a frill
    c.save(); body(); c.clip();
    c.fillStyle = '#7A3DEB'; c.fillRect(-45, 8, 90, 50);
    c.fillStyle = '#A97BFF'; c.fillRect(-45, 8, 90, 7);
    for (let i = 0; i < 9; i++) { const sx = -26 + i * 6.5, sy = 24 + 12 * hash(i * 3.1); circle(c, sx, sy, 1.6, rgba('#FFF6C8', 0.6 + 0.4 * Math.sin(t * 8 + i))); }
    c.restore();
    // the face: big eyes, brows, a determined little mouth (it is a tongue: no tongue of its own)
    const lk = o.look || [0, 0], ey = clv > 0.5 ? -4 : -40;
    for (const sd of [-1, 1]) {
      ellipse(c, sd * 11, ey, 8.5, 10, '#FFFFFF');
      if (o.wink && sd > 0) { c.beginPath(); c.moveTo(sd * 11 - 7, ey + 1); c.quadraticCurveTo(sd * 11, ey + 7, sd * 11 + 7, ey + 1); c.lineWidth = 2.6; c.strokeStyle = '#3A0C24'; c.stroke(); continue; }
      circle(c, sd * 11 + lk[0] * 3, ey + 1 + lk[1] * 3, 4.6, '#2A0A1A'); circle(c, sd * 11 + lk[0] * 3 - 1.6, ey - 1 + lk[1] * 3, 1.6, '#FFFFFF');
      line(c, sd * 5, ey - 14, sd * 17, ey - 15 - 2 * (o.brow || 0), 2.6, '#9C2C44');
    }
    c.beginPath(); c.moveTo(-6, ey + 16); c.quadraticCurveTo(0, ey + 21 + 3 * (o.smile || 0), 6, ey + 16); c.lineWidth = 2.4; c.lineCap = 'round'; c.strokeStyle = '#7A1A30'; c.stroke();
    // a hair bow on top
    const by = clv > 0.5 ? -82 : -78;
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, by); c.lineTo(sd * 13, by - 7); c.lineTo(sd * 13, by + 7); c.closePath(); c.fillStyle = '#FFD447'; c.fill(); }
    circle(c, 0, by, 3.6, '#FFB02E');
  });
  c.restore();
}

// ---------------------------------------------------------------- the gymnastics hall (screen space)
let TC_HALL = null;
function tcPaintHall() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120A3A'); g.addColorStop(0.55, '#2A1458'); g.addColorStop(1, '#0E0828');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // stands: rows of the crowd as round heads and shoulders
  const rng = mulberry32(23);
  for (let row = 0; row < 7; row++) {
    const y = 420 + row * 74, n = 15 + row;
    c.fillStyle = `rgba(${40 + row * 9},${26 + row * 6},${90 + row * 8},1)`; c.fillRect(0, y + 26, W, 60);
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5 + 0.35 * (rng() - 0.5)) * (W / n), hc = ['#6A4FB0', '#8A5FC8', '#5A6FD0', '#B0608A', '#4A8AB8'][Math.floor(rng() * 5)];
      ellipse(c, x, y + 30, 22, 16, hc); circle(c, x, y + 4, 14, mixH(hc, '#FFD9B8', 0.35));
    }
  }
  c.fillStyle = 'rgba(12,6,34,0.5)'; c.fillRect(0, 400, W, 620);
  // banners
  for (const [x, col] of [[140, '#FF5A6E'], [540, '#FFD447'], [940, '#4DFFB4']]) { rrect(c, x - 70, 150, 140, 210, 10); c.fillStyle = col; c.fill(); rrect(c, x - 56, 168, 112, 174, 6); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fill(); }
  c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF';
  c.fillText('TONGUE', 540, 240); c.fillText('CUP', 540, 282);
  // the floor: a blue mat
  const fg = c.createLinearGradient(0, 1000, 0, H); fg.addColorStop(0, '#2C6FE0'); fg.addColorStop(1, '#173C8E');
  c.fillStyle = fg; c.fillRect(0, 1000, W, H - 1000);
  for (let i = 0; i < 6; i++) line(c, 0, 1060 + i * 150, W, 1060 + i * 150, 4, 'rgba(255,255,255,0.12)');
  return cv;
}
// t: video time; o: {beamY, flash}
function tcArena(t, o = {}) {
  screenSpace();
  ctx.drawImage(TC_HALL, 0, 0);
  // spotlights from the roof (the glow layer): three cones, the middle one on the beam
  for (const [x, a, col] of [[220, 0.2, '#9FB8FF'], [540, 0.22, '#FFF2C8'], [860, 0.2, '#FFB0D8']]) {
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    const g = gctx.createLinearGradient(x, 0, x, 1200); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
    gctx.beginPath(); gctx.moveTo(x - 40, 0); gctx.lineTo(x + 40, 0); gctx.lineTo(x + 240, 1200); gctx.lineTo(x - 240, 1200); gctx.closePath(); gctx.fillStyle = g; gctx.fill();
    gctx.restore();
  }
  // camera flashes in the crowd
  for (let i = 0; i < 6; i++) {
    const ph = ((t * 0.9 + hash(i * 7.1)) % 1);
    if (ph < 0.07 || (o.flash && hash(i + Math.floor(t * 6)) > 0.6 && ph < 0.2)) {
      const fx = 80 + 920 * hash(i * 3.3 + 1), fy = 440 + 440 * hash(i * 5.7 + 2);
      softDot(gctx, fx, fy, 46, '#FFFFFF', 0.85); circle(ctx, fx, fy, 6, '#FFFFFF');
    }
  }
  // the beam: a wooden bar on two legs
  const by = o.beamY || 1030;
  for (const lx of [250, 830]) { rrect(ctx, lx - 14, by + 20, 28, 240, 8); ctx.fillStyle = '#9AA4B8'; ctx.fill(); rrect(ctx, lx - 50, by + 248, 100, 22, 8); ctx.fillStyle = '#7A84A0'; ctx.fill(); }
  rrect(ctx, 120, by - 14, 840, 36, 14); ctx.fillStyle = '#C98A4E'; ctx.fill();
  paint(() => { rrect(ctx, 130, by - 12, 820, 9, 4); ctx.fillStyle = 'rgba(255,230,190,0.55)'; ctx.fill(); });
}
// a judge's score card on a little stand (screen space)
function tcScore(x, y, s, k, txt = '10') {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  line(ctx, 0, 40, 0, 110, 10, '#3A3A4A');
  rrect(ctx, -62, -50, 124, 96, 12); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  paint(() => { rrect(ctx, -62, -50, 124, 96, 12); ctx.lineWidth = 6; ctx.strokeStyle = '#2A1458'; ctx.stroke();
    ctx.font = '400 70px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#E8344A'; ctx.fillText(txt, 0, 0); });
  ctx.restore();
}

// ---------------------------------------------------------------- the TACO CLUB card (screen space)
function tcCard(x, y, s, k, t, o = {}) {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 1.7);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot === undefined ? -0.08 : o.rot); ctx.scale(sc, sc);
  rrect(ctx, -250, -160, 500, 320, 28); ctx.fillStyle = '#FFF4E0'; ctx.fill();
  paint(() => {
    rrect(ctx, -250, -160, 500, 320, 28); ctx.lineWidth = 8; ctx.strokeStyle = '#3A1A0A'; ctx.stroke();
    ctx.save(); rrect(ctx, -250, -160, 500, 320, 28); ctx.clip();
    ctx.fillStyle = '#FF8A2A'; ctx.fillRect(-250, -160, 500, 92);
    ctx.font = '900 54px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 8; ctx.strokeStyle = '#7A2A00'; ctx.strokeText('TACO CLUB', -120, -112); ctx.fillText('TACO CLUB', -120, -112);
    ctx.restore();
    // a taco badge in the header
    ctx.save(); ctx.translate(-180, -112);
    ctx.beginPath(); ctx.arc(0, 8, 38, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#FFCF4A'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#7A4A10'; ctx.stroke();
    for (let i = 0; i < 5; i++) circle(ctx, -24 + i * 12, -2 - 8 * Math.sin(i * 1.3), 7, i % 2 ? '#5BD15A' : '#F2453D');
    ctx.restore();
    // the photo: a little face with a rolled tongue
    rrect(ctx, -222, -46, 170, 180, 14); ctx.fillStyle = '#9BD4FF'; ctx.fill();
    ctx.font = '800 30px Montserrat'; ctx.fillStyle = '#3A1A0A'; ctx.textAlign = 'left';
    ctx.fillText('MEMBER', -26, -16);
    ctx.font = '700 24px Montserrat'; ctx.fillStyle = '#7A4A30'; ctx.fillText('rolls: YES', -26, 30); ctx.fillText('clover: NOPE', -26, 66);
    line(ctx, -26, 104, 210, 104, 3, 'rgba(58,26,10,0.35)');
    ctx.font = 'italic 700 26px Montserrat'; ctx.fillStyle = '#3A1A0A'; ctx.fillText('~ you', 60, 132);
    // the laminate's shine
    ctx.save(); rrect(ctx, -250, -160, 500, 320, 28); ctx.clip();
    const sh = ((t * 0.6) % 1.6) - 0.3;
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.moveTo(-250 + sh * 600, -160); ctx.lineTo(-180 + sh * 600, -160); ctx.lineTo(-300 + sh * 600, 160); ctx.lineTo(-370 + sh * 600, 160); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  // the face in the photo (outside paint: a character)
  tcMini(ctx, -137, 40, 58, { hair: 'cap', hairCol: PAL.hair || '#4A2E1E', look: [0.2, 0.4], eyes: 'smug', T: { kL: 0.8, kR: 0.8 }, t });
  ctx.restore();
}
