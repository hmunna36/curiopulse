// Octopus Short: the octopus. Built from a description, drawn with shapes every frame so the light catches it.
// Local units at s = 1: the origin is the hub where the eight arms meet, under its face; up is -y. The mantle (the
// big bag on top) is ~120 wide and ~150 tall, the face below it carries the eyes (horizontal pupils, like a real one),
// the siphon sits on its right. Arms are spines of 22 segments: angle(u) = a + curl*u + tip*ramp(u)^2 + a wave, with
// 0 = straight down and +pi/2 = toward screen right. Suckers ride the underside.
// x-ray (o.xray = 1): a glass octopus with its organs: two feathery gills, a small GILL HEART at the base of each,
// the big BODY HEART between them, and the blood (blue: copper) flowing arms -> gill hearts -> gills -> big heart ->
// arms. o.sag (0..1) lets the vessel after the gills droop and its blood dawdle ("comes out all floppy"); o.punch
// (0..1) is the big heart's squeeze that shoots the blood out to every arm tip.
'use strict';

const OC = { wIdle: null };
const OC_SKIN = { base: '#E6643C', dark: '#B9452A', back: '#C44F30', under: '#F7C6AC', ring: '#D27E5E', spot: 'rgba(140,40,25,0.32)', hi: 'rgba(255,220,190,0.55)' };
const OC_ROOT = [[-30, -14], [-22, -8], [-12, -2], [-4, 1], [4, 1], [12, -2], [22, -8], [30, -14]];
const OC_BACK = [0, 1, 6, 7], OC_FRONT = [2, 3, 4, 5];
// organ positions (local)
const OC_ORG = { big: [0, -100], gh: [[-27, -72], [27, -72]], gb: [[-22, -88], [22, -88]], gt: [[-50, -150], [50, -150]] };

function ocIdleW() { if (!OC.wIdle) OC.wIdle = loopW(2.4); return OC.wIdle; }

// ---------------------------------------------------------------- poses: arrays of 8 arm specs
function ocArm(a, L, curl, tip, o = {}) { return Object.assign({ a, L, curl, tip, wave: 0.18, wf: 3.2, ph: 0, w: 24 }, o); }
const OC_POSES = {
  // resting on the rock: arms spread, draped over the edge, tips curled
  sit: () => [ocArm(-1.45, 170, 1.0, -2.6), ocArm(-1.05, 180, 0.8, -2.2), ocArm(-0.5, 168, 0.35, -1.9), ocArm(-0.14, 150, 0.05, 2.0),
    ocArm(0.16, 152, -0.05, -2.0), ocArm(0.52, 166, -0.35, 1.9), ocArm(1.08, 180, -0.8, 2.2), ocArm(1.45, 172, -1.0, 2.6)],
  // three arms up on the right, counting to THREE; the rest as in sit
  count: () => { const p = OC_POSES.sit(); p[5] = ocArm(2.12, 150, 1.2, 0.3, { wave: 0.05 }); p[6] = ocArm(2.6, 172, 0.26, 0.3, { wave: 0.05 }); p[7] = ocArm(2.63, 160, 0, 0.3, { wave: 0.05 }); return p; },
  // jetting away (it moves toward -y in its own frame): every arm trails behind, close together, waving
  jet: () => [...Array(8)].map((_, i) => ocArm((i - 3.5) * 0.07, 205 - Math.abs(i - 3.5) * 6, 0, (i - 3.5) * 0.12, { wave: 0.32, wf: 4.5, w: 22 })),
  // lounging, leaning back: one arm behind its head, the rest draped lazily
  lounge: () => { const p = OC_POSES.sit(); p[1] = ocArm(-2.5, 150, -1.6, -1.2, { wave: 0.04 }); p[0] = ocArm(-1.6, 175, 1.2, -2.2, { wave: 0.08 }); return p; },
};
// walking on two arms (arms 3 and 4 are the legs, each keeps its own side and steps in turn: the lifted one bends
// and shortens), the other six tucked up in tight curls at its sides, like a coconut octopus. ph = stride phase
function ocWalkPose(ph) {
  const p = [];
  for (let i = 0; i < 8; i++) {
    if (i === 3 || i === 4) {
      const s = i === 3 ? -1 : 1, st = Math.sin(ph + (i === 3 ? 0 : Math.PI)), lift = Math.max(0, st);
      p.push(ocArm(s * 0.34 + 0.22 * st, 132 - 30 * lift, -s * 0.1 + 0.5 * lift, s * 1.6 - 0.8 * lift, { wave: 0.0, w: 32 }));
    } else {
      const s = i < 4 ? -1 : 1, k = [0, 1, 2, 0, 0, 2, 1, 0][i];
      p.push(ocArm(s * (1.15 + 0.32 * k), 82 - 8 * k, s * 1.4, s * 4.2, { wave: 0.03, w: 22 }));
    }
  }
  return p;
}
function ocMix(A, B, k) {
  return A.map((a, i) => { const b = B[i], o = {}; for (const key of Object.keys(a)) o[key] = typeof a[key] === 'number' ? lerp(a[key], b[key], k) : (k < 0.5 ? a[key] : b[key]); return o; });
}
// aim one arm's tip at a local point (a poke): straight-ish with a small hook at the end
function ocReachArm(i, target, hook = 0.6) {
  const r = OC_ROOT[i], dx = target[0] - r[0], dy = target[1] - r[1];
  return ocArm(Math.atan2(dx, dy) - hook * 0.2, Math.hypot(dx, dy) * 1.02, 0, hook, { wave: 0.03, w: 22 });
}

// spine points of an arm (local), with angles
function ocSpine(i, A, t) {
  const N = 22, w = ocIdleW(), pts = [];
  let [x, y] = OC_ROOT[i];
  for (let j = 0; j <= N; j++) {
    const u = j / N, tr = Math.max(0, (u - 0.55) / 0.45);
    const th = A.a + A.curl * u + A.tip * tr * tr + A.wave * u * Math.sin(A.ph + i * 1.3 + t * w - u * A.wf);
    pts.push([x, y, th, u]);
    x += Math.sin(th) * A.L / N; y += Math.cos(th) * A.L / N;
  }
  return pts;
}
function ocArmPath(c, P, w0, k = 1) {
  const L = [], R = [];
  for (const [x, y, th, u] of P) { const w = (w0 * (1 - 0.9 * Math.pow(u, 1.1)) + 2) * k / 2, nx = Math.cos(th), ny = -Math.sin(th); L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]); }
  c.beginPath(); c.moveTo(L[0][0], L[0][1]);
  for (let j = 1; j < L.length; j++) c.lineTo(L[j][0], L[j][1]);
  const e = P[P.length - 1]; c.arc(e[0], e[1], Math.max(1.5, Math.hypot(L[L.length - 1][0] - R[R.length - 1][0], L[L.length - 1][1] - R[R.length - 1][1]) / 2), e[2] - Math.PI, e[2]);
  for (let j = R.length - 1; j >= 0; j--) c.lineTo(R[j][0], R[j][1]);
  c.closePath();
}
// the underside band and the suckers (paint), on the side the tip curls toward
function ocSuckers(c, P, A, w0, col) {
  const sd = A.tip >= 0 ? -1 : 1;
  for (let j = 3; j < P.length - 1; j += 1) {
    const [x, y, th, u] = P[j], w = (w0 * (1 - 0.9 * Math.pow(u, 1.1)) + 2) / 2, nx = Math.cos(th) * sd, ny = -Math.sin(th) * sd;
    const r = Math.max(1.2, w * 0.42);
    if (j % 2 === 0) { circle(c, x + nx * w * 0.62, y + ny * w * 0.62, r, col.under); circle(c, x + nx * w * 0.62, y + ny * w * 0.62, r * 0.5, col.ring); }
  }
}

// ---------------------------------------------------------------- the octopus
// o: {arms (8 specs), rot, sx, sy (squash), look [-1..1, -1..1], mood, blink, xray 0..1, hearts {gl, gr, big} pulse 0..1,
//     flat (big heart stopped, grey), sag, punch, flowT (blood clock), glowTips 0..1, siphon 0..1 (jet), noFace, armOver}
function octoDraw(c, x, y, s, t, o = {}) {
  const arms = o.arms || OC_POSES.sit(), xr = o.xray || 0;
  const P = arms.map((A, i) => ocSpine(i, A, t));
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s * (o.sx || 1), s * (o.sy || 1));
  if (xr < 0.5) {
    actor(() => {
      for (const i of OC_BACK) { ocArmPath(c, P[i], arms[i].w * 0.92); c.fillStyle = OC_SKIN.back; c.fill(); }
    });
    paint(() => { for (const i of OC_BACK) ocSuckers(c, P[i], arms[i], arms[i].w * 0.92, { under: '#E4A88E', ring: '#B76A50' }); });
    actor(() => ocBody(c, t, o));
    paint(() => ocFace(c, t, o));
    actor(() => { for (const i of OC_FRONT) { ocArmPath(c, P[i], arms[i].w); c.fillStyle = OC_SKIN.base; c.fill(); } });
    paint(() => { for (const i of OC_FRONT) ocSuckers(c, P[i], arms[i], arms[i].w, OC_SKIN); });
    if (o.siphon > 0.01) ocJet(c, t, o.siphon);
  } else {
    paint(() => ocGlass(c, P, arms, t, o));
  }
  c.restore();
  return P;
}

function ocBodyPath(c, o) {
  const sq = 1 + 0.12 * (o.inflate || 0);
  c.beginPath();
  c.ellipse(0, -112, 60 * sq, 76 * sq, 0, 0, Math.PI * 2);
  c.moveTo(56, -40); c.ellipse(0, -40, 56, 40, 0, 0, Math.PI * 2);
}
function ocBody(c, t, o) {
  ocBodyPath(c, o);
  const g = c.createRadialGradient(-22, -140, 10, 0, -90, 120);
  g.addColorStop(0, '#FF9468'); g.addColorStop(0.55, OC_SKIN.base); g.addColorStop(1, OC_SKIN.dark);
  c.fillStyle = g; c.fill();
  // the siphon on its right side
  c.save(); c.translate(52, -34); c.rotate(0.5 - 0.4 * (o.siphon || 0));
  rrect(c, -6, -10, 30, 20, 9); c.fillStyle = OC_SKIN.dark; c.fill(); c.restore();
}
function ocFace(c, t, o) {
  // spots and a highlight on the mantle
  for (const [sx2, sy2, r] of [[-30, -150, 9], [18, -168, 7], [34, -128, 10], [-12, -122, 6], [-38, -104, 7], [40, -96, 6], [6, -146, 5], [-20, -176, 5]]) ellipse(c, sx2, sy2, r, r * 0.8, OC_SKIN.spot);
  ellipse(c, -24, -150, 16, 26, OC_SKIN.hi, -0.5);
  if (o.noFace) return;
  const md = o.mood || 'calm', lk = o.look || [0, 0];
  const M = {
    calm: { open: 1, lid: 0.18, brow: 0, tilt: 0, mouth: 'smile' }, smug: { open: 1, lid: 0.48, brow: -0.2, tilt: -0.5, mouth: 'smirk' },
    proud: { open: 1.05, lid: 0.25, brow: 0.4, tilt: 0.2, mouth: 'grin' }, shock: { open: 1.25, lid: 0, brow: 1, tilt: 0.6, mouth: 'o' },
    lazy: { open: 1, lid: 0.58, brow: -0.1, tilt: 0.1, mouth: 'flat' }, happy: { open: 1, lid: 0.1, brow: 0.5, tilt: 0.3, mouth: 'grin' },
    focus: { open: 1, lid: 0.32, brow: -0.4, tilt: -0.6, mouth: 'flat' }, dizzy: { open: 1.1, lid: 0.2, brow: 0.6, tilt: 0.8, mouth: 'wavy' },
  }[md] || {};
  const lid = Math.max(M.lid, o.blink || 0);
  for (const s of [-1, 1]) {
    const ex = s * 24, ey = -50, rx = 17 * M.open, ry = 19 * M.open;
    ellipse(c, ex, ey, rx + 3, ry + 3, '#7A2A18');
    ellipse(c, ex, ey, rx, ry, '#FFF8EC');
    const px = ex + lk[0] * 6, py = ey + lk[1] * 6;
    circle(c, px, py, 12, '#E9B23C');
    circle(c, px, py, 9, '#C98A1E');
    rrect(c, px - 9, py - 3.2, 18, 6.4, 3.2); c.fillStyle = '#15100A'; c.fill();
    circle(c, px - 4, py - 6, 3, 'rgba(255,255,255,0.95)');
    if (lid > 0.02) {   // upper lid
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx + 0.5, ry + 0.5, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = OC_SKIN.base; c.fillRect(ex - rx - 2, ey - ry - 2, 2 * rx + 4, (2 * ry + 2) * lid + 1);
      line(c, ex - rx, ey - ry + 2 * ry * lid, ex + rx, ey - ry + 2 * ry * lid, 3, '#7A2A18');
      c.restore();
    }
    // brow
    const by = ey - 26 - M.brow * 6;
    line(c, ex - s * 4, by + s * 0 - M.tilt * 4 * 1, ex + s * 14, by + M.tilt * 4, 5, '#8A2F1A');
  }
  // mouth
  c.save(); c.translate(0, -18);
  const mc = '#6B1E14';
  if (M.mouth === 'smile') { c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(0, 6, 9, 0); c.lineWidth = 3.5; c.strokeStyle = mc; c.lineCap = 'round'; c.stroke(); }
  else if (M.mouth === 'smirk') { c.beginPath(); c.moveTo(-8, 1); c.quadraticCurveTo(4, 4, 11, -3); c.lineWidth = 3.5; c.strokeStyle = mc; c.lineCap = 'round'; c.stroke(); }
  else if (M.mouth === 'grin') { c.beginPath(); c.moveTo(-12, -1); c.quadraticCurveTo(0, 13, 12, -1); c.closePath(); c.fillStyle = mc; c.fill(); }
  else if (M.mouth === 'o') { ellipse(c, 0, 2, 5, 7, mc); }
  else if (M.mouth === 'wavy') { c.beginPath(); c.moveTo(-10, 0); c.bezierCurveTo(-5, -5, -2, 5, 2, 0); c.bezierCurveTo(5, -5, 8, 5, 11, 0); c.lineWidth = 3; c.strokeStyle = mc; c.stroke(); }
  else { line(c, -7, 1, 7, 1, 3.5, mc); }
  c.restore();
}
// a jet of water and bubbles out of the siphon (local; the siphon points right and down a little)
function ocJet(c, t, k) {
  for (let i = 0; i < 14; i++) {
    const u = (hash(i * 2.7) + t * 2.2) % 1, d = 60 + u * 240 * k, a = 0.5 + 0.35 * (hash(i * 5.1) - 0.5);
    const bx = 70 + Math.cos(a) * d, by = -26 + Math.sin(a) * d * 0.6, r = (4 + 8 * hash(i + 1)) * (0.6 + u);
    c.beginPath(); c.arc(bx, by, r, 0, 7); c.lineWidth = 2; c.strokeStyle = `rgba(230,255,252,${0.8 * (1 - u)})`; c.stroke();
  }
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(66, -28, 280, 40); g.addColorStop(0, `rgba(210,255,250,${0.5 * k})`); g.addColorStop(1, 'rgba(210,255,250,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(66, -38); c.lineTo(300, -10); c.lineTo(300, 90); c.lineTo(66, -18); c.closePath(); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- the glass octopus and what is inside
const OC_GLASS = { fill: 'rgba(170,236,255,0.16)', edge: 'rgba(180,244,255,0.9)', blueIn: '#8DB4E0', blueOut: '#2E9BFF', heart: '#FF5577', heartDk: '#B8234A' };
function ocHeartShape(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(0, r * 0.95);
  c.bezierCurveTo(-r * 1.35, r * 0.1, -r * 0.95, -r * 1.05, 0, -r * 0.38);
  c.bezierCurveTo(r * 0.95, -r * 1.05, r * 1.35, r * 0.1, 0, r * 0.95);
  c.restore();
}
function ocHeart(c, x, y, r, pulse, flat, lit = 1) {
  const k = 1 + 0.22 * pulse;
  ocHeartShape(c, x, y, r * k);
  c.fillStyle = flat ? '#7E8796' : (lit > 0.5 ? OC_GLASS.heart : '#C9677E'); c.fill();
  c.lineWidth = 2.5; c.strokeStyle = flat ? '#48505E' : OC_GLASS.heartDk; c.stroke();
  ellipse(c, x - r * 0.35 * k, y - r * 0.3 * k, r * 0.26 * k, r * 0.16 * k, 'rgba(255,230,236,0.75)', -0.6);
}
// the paths blood takes (local), from the current arm spines
function ocVessels(P, o) {
  const sag = o.sag || 0, V = {};
  for (const [si, s] of [[0, -1], [1, 1]]) {
    const gh = OC_ORG.gh[si], gb = OC_ORG.gb[si], gt = OC_ORG.gt[si], bh = OC_ORG.big;
    V['in' + si] = [[s * 8, -10], [s * 18, -40], gh];                                  // used blood up to a gill heart
    V['gill' + si] = [gh, gb, [lerp(gb[0], gt[0], 0.5), lerp(gb[1], gt[1], 0.5)], gt];  // through the gill
    const mid = [s * 30 + 6 * sag * Math.sin((o.flowT || 0) * 5), -150 + 150 * sag];   // after the gill: it hangs like a wet noodle when floppy
    const pts = [];
    for (let j = 0; j <= 14; j++) { const u = j / 14; pts.push([(1 - u) * (1 - u) * gt[0] + 2 * u * (1 - u) * mid[0] + u * u * bh[0], (1 - u) * (1 - u) * gt[1] + 2 * u * (1 - u) * mid[1] + u * u * (bh[1] - 6)]); }
    V['eff' + si] = pts;
  }
  V.art = P.map((sp) => [[0, -84], [0, -12], ...sp.filter((_, j) => j % 2 === 0).map((p) => [p[0], p[1]])]);  // big heart -> each arm
  return V;
}
function ocPolyAt(P, u) {
  let L = 0; const seg = [];
  for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); L += d; }
  let s = clamp(u) * L;
  for (let i = 0; i < seg.length; i++) { if (s <= seg[i]) { const k = seg[i] ? s / seg[i] : 0; return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)]; } s -= seg[i]; }
  return P[P.length - 1];
}
function ocTube(c, P, w, col) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (const p of P.slice(1)) c.lineTo(p[0], p[1]); c.lineWidth = w; c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
// dots of blood moving along a path: n dots, `rate` path-lengths per second, phase `ph`
function ocDots(c, P, n, ft, rate, r, col, ph = 0) { for (let i = 0; i < n; i++) { const u = ((i / n + ft * rate + ph) % 1 + 1) % 1, p = ocPolyAt(P, u); circle(c, p[0], p[1], r, col); } }

function ocGlass(c, P, arms, t, o) {
  // the glass body and arms: one outline (stroke all, then fill all)
  c.lineJoin = 'round';
  for (const i of [...OC_BACK, ...OC_FRONT]) { ocArmPath(c, P[i], arms[i].w); c.lineWidth = 3; c.strokeStyle = OC_GLASS.edge; c.stroke(); }
  ocBodyPath(c, o); c.lineWidth = 3.5; c.strokeStyle = OC_GLASS.edge; c.stroke();
  for (const i of [...OC_BACK, ...OC_FRONT]) { ocArmPath(c, P[i], arms[i].w); c.fillStyle = OC_GLASS.fill; c.fill(); }
  ocBodyPath(c, o); c.fillStyle = 'rgba(170,236,255,0.20)'; c.fill();
  // eyes stay (so it is still a character)
  if (!o.noFace) for (const s of [-1, 1]) { ellipse(c, s * 24, -50, 15, 17, 'rgba(255,248,236,0.85)'); const lk = o.look || [0, 0]; rrect(c, s * 24 + lk[0] * 6 - 8, -53 + lk[1] * 6, 16, 6, 3); c.fillStyle = '#15100A'; c.fill(); }
  const V = ocVessels(P, o), ft = o.flowT === undefined ? t : o.flowT, sag = o.sag || 0, punch = o.punch || 0, hs = o.hearts || {};
  // vessels
  for (let i = 0; i < 8; i++) ocTube(c, V.art[i], 5, 'rgba(46,155,255,0.55)');
  for (const si of [0, 1]) ocTube(c, V['in' + si], 5, 'rgba(141,180,224,0.7)');
  // gills: a rachis with feathery filaments that squeeze
  for (const si of [0, 1]) {
    const s = si ? 1 : -1, gb = OC_ORG.gb[si], gt = OC_ORG.gt[si], sq = o.squeeze ? o.squeeze[si] || 0 : 0;
    ocTube(c, [gb, gt], 6, '#E58EA4');
    for (let j = 1; j <= 11; j++) {
      const u = j / 12, px = lerp(gb[0], gt[0], u), py = lerp(gb[1], gt[1], u), L = (15 - 6 * Math.abs(u - 0.45)) * (1 - 0.45 * sq);
      const a = Math.atan2(gt[1] - gb[1], gt[0] - gb[0]);
      for (const sd of [-1, 1]) line(c, px, py, px + Math.cos(a + sd * 1.25) * L, py + Math.sin(a + sd * 1.25) * L, 4.5, '#F4B4C4');
    }
    if (sq > 0.08) {   // squeeze marks pressing in on both sides of the gill
      const mx = (gb[0] + gt[0]) / 2, my = (gb[1] + gt[1]) / 2, a = Math.atan2(gt[1] - gb[1], gt[0] - gb[0]);
      for (const sd of [-1, 1]) for (let k = -1; k <= 1; k++) {
        const nx = Math.cos(a + sd * Math.PI / 2), ny = Math.sin(a + sd * Math.PI / 2), ox = mx + nx * (27 - 6 * sq) + Math.cos(a) * k * 14, oy = my + ny * (27 - 6 * sq) + Math.sin(a) * k * 14;
        line(c, ox + nx * 10, oy + ny * 10, ox, oy, 3.5, `rgba(255,255,255,${0.95 * clamp(sq * 1.5)})`);
      }
    }
  }
  // the vessel out of each gill to the big heart, over the gills: firm and bright, or (sag) hanging limp
  for (const si of [0, 1]) { ocTube(c, V['eff' + si], 9 + 3 * sag, 'rgba(20,90,200,0.9)'); ocTube(c, V['eff' + si], 5 + 2 * sag, 'rgba(90,190,255,0.95)'); }
  // blood: in through the arms' veins, fast and tight through the gills, then slow and droopy after them, then
  // punched out by the big heart to every arm tip
  for (const si of [0, 1]) {
    ocDots(c, V['in' + si], 5, ft, 0.55, 3.2, OC_GLASS.blueIn, si * 0.3);
    ocDots(c, V['gill' + si], 6, ft, 1.3 * (o.gillRate || 1), 3.4, '#5FB0FF', si * 0.2);
    ocDots(c, V['eff' + si], 7, ft, lerp(0.75, 0.16, sag), 3.8 + 0.6 * sag, OC_GLASS.blueOut, si * 0.5);
  }
  const ar = lerp(0.45, 1.8, punch);
  for (let i = 0; i < 8; i++) ocDots(c, V.art[i], 6, ft, ar, 3.2 + 1.2 * punch, '#46B6FF', i * 0.13);
  // arm tips lit by the blood that just arrived
  if ((o.glowTips || 0) > 0.01) for (let i = 0; i < 8; i++) { const e = P[i][P[i].length - 1]; circle(c, e[0], e[1], 7 * o.glowTips, '#9BE3FF'); }
  // the three hearts
  ocHeart(c, OC_ORG.gh[0][0], OC_ORG.gh[0][1], 10, hs.gl || 0, false, o.lightGill === undefined ? 1 : o.lightGill);
  ocHeart(c, OC_ORG.gh[1][0], OC_ORG.gh[1][1], 10, hs.gr || 0, false, o.lightGill === undefined ? 1 : o.lightGill);
  ocHeart(c, OC_ORG.big[0], OC_ORG.big[1], 20, (hs.big || 0) + 0.6 * punch, !!o.flat, o.lightBig === undefined ? 1 : o.lightBig);
  if (punch > 0.05) for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3, r1 = 24 + 10 * punch, r2 = 30 + 22 * punch; line(c, Math.cos(a) * r1, -100 + Math.sin(a) * r1, Math.cos(a) * r2, -100 + Math.sin(a) * r2, 3, `rgba(255,240,180,${punch})`); }
}

// glow-layer copy of the hearts (local transform must match): call with gctx under the same camera
function octoHeartGlow(g, x, y, s, o) {
  const hs = o.hearts || {};
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s * (o.sx || 1), s * (o.sy || 1));
  for (const [p, r, k] of [[OC_ORG.gh[0], 14, hs.gl || 0], [OC_ORG.gh[1], 14, hs.gr || 0], [OC_ORG.big, 24, o.flat ? -1 : (hs.big || 0) + (o.punch || 0)]]) {
    if (k < 0) continue;   // a stopped heart does not glow
    g.globalAlpha = 0.35 + 0.5 * clamp(k); ocHeartShape(g, p[0], p[1], r); g.fillStyle = '#FF4D77'; g.fill();
  }
  g.globalAlpha = 1; g.restore();
}

// heart pulses from the beat schedule: a "ba-dum" for each heart (the gill hearts lead the big one by 0.12 s)
function ocPulse(t, lead = 0) {
  const B = TLd.cues.beats || [];
  let k = 0;
  for (const b0 of B) { const b = b0 - lead, d = t - b; if (d >= -0.02 && d < 0.4) k = Math.max(k, Math.exp(-d * 9) * (d < 0 ? 0 : 1)); }
  return k;
}
