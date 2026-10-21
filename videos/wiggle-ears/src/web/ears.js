// wiggle-ears (22 Oct 2026): the topic is his ears, so his head is drawn again over the rig's, in head units (origin at the
// head's middle, as mirror.js's mirInHead gives it), with ears big enough to see a twitch:
//   wgEarPath(c, s)               one ear's outline (s = -1 screen-left = his right ear, +1 screen-right = his left)
//   wgEar(c, pal, s, A, t)        that ear in skin: rim, fold, bowl, lobe; A = {tw (the top edge folds back, 0..1), perk (up)}
//   wgHeadBase(c, pal, H, t)      the ears, the skin, the hair pushed back under a gold party headband, the rig's face without
//                                 its brows and mouth (brows.js draws those, larger, so they can lift)
//   wgHeadFront(c, pal, H, t)     brows, forehead lines, mouth (brows.js), a sweat drop, the headband's two springy stars
//   wgGlass(c, pal, s, G, t)      the side of his head and that ear turned to glass: three tiny muscles (top, front, back) that
//                                 sleep, wake, tug and flex, their wires lighting up, number badges
//   wgMuscle(c, a, b, wa, wb, o)  one muscle from a to b (a face in its middle)
// and, in the world or the brain's room: wgBalloon, wgPop (the balloon bursting), wgRemote (the brain's FACE remote),
// wgPoster (MISSING: EAR REMOTE), wgChatter (the party's noise), wgNote.
'use strict';

const WG_GLASS = '#173677', WG_GLASS_HI = 'rgba(140,205,255,0.40)', WG_EDGE = '#9FE6FF';
const WG_MUS = '#E85574', WG_MUS_DK = '#9C2847', WG_MUS_HI = '#FF9DB2', WG_WIRE = '#FFD447';
const WG_GOLD = '#F3C640', WG_GOLD_DK = '#B88A1C', WG_GOLD_HI = '#FFF0A8';

// ---------------------------------------------------------------- an ear (outward units: u grows away from his face)
// the outline as points (u, v); the root (u < 62) is under the head's edge
const WG_EAR = [[57, -17], [69, -28], [84, -22], [89, -4], [84, 15], [74, 28], [63, 26], [57, 17]];
function wgEarPath(c, s) {
  const P = WG_EAR.map(([u, v]) => [s * u, v]), n = P.length;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  c.beginPath();
  let m = mid(P[n - 1], P[0]); c.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) { const q = P[i], m2 = mid(P[i], P[(i + 1) % n]); c.quadraticCurveTo(q[0], q[1], m2[0], m2[1]); }
  c.closePath();
}
// the transform of a twitch: the top edge folds back toward his head (it gets narrower and drops a little), a perk lifts it
function wgEarXf(c, s, A = {}) {
  const tw = A.tw || 0, pk = A.perk || 0;
  c.translate(s * 60, 6); c.rotate(-s * 0.13 * tw); c.scale(1 - 0.2 * tw, 1 - 0.05 * tw); c.translate(-s * 60, -6 - 3.5 * pk);
}
function wgEar(c, pal, s, A = {}, t = 0) {
  c.save(); wgEarXf(c, s, A);
  wgEarPath(c, s); c.fillStyle = pal.skin; c.fill();
  paint(() => {
    // the rim's fold, the bowl, the little flap in front of the hole, the lobe's shade
    c.beginPath(); c.moveTo(s * 64, -21); c.quadraticCurveTo(s * 81, -21, s * 83, -5); c.quadraticCurveTo(s * 84, 9, s * 76, 17);
    c.lineWidth = 2.6; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,96,66,0.75)'; c.stroke();
    ellipse(c, s * 71.5, 4, 6.6, 10.5, '#C47452');
    ellipse(c, s * 70.5, 6, 3.6, 6.2, '#9E5639');
    c.beginPath(); c.moveTo(s * 66, -12); c.quadraticCurveTo(s * 77, -13, s * 78, -2); c.lineWidth = 2; c.strokeStyle = 'rgba(176,96,66,0.55)'; c.stroke();
    ellipse(c, s * 63.5, 7, 2.6, 4.2, pal.skinSh);
    ellipse(c, s * 72, 23, 5.5, 3.2, 'rgba(255,130,120,0.28)');
  });
  c.restore();
}

// ---------------------------------------------------------------- his head, again (head units)
// H: {face, brows: {l, r}, mouth, flush, sweat, ears: {l: {tw, perk}, r: {...}}, glass: {l, r} (wgGlass options), bop (the
//     headband's stars bounce), bopT (their own clock)}
function wgHairPath(c) {
  c.beginPath();
  c.moveTo(-66, 10);
  c.quadraticCurveTo(-74, -54, -30, -70);
  c.quadraticCurveTo(12, -88, 48, -64);
  c.quadraticCurveTo(76, -44, 66, 10);
  c.quadraticCurveTo(59, -22, 53, -44);
  c.quadraticCurveTo(0, -62, -53, -44);
  c.quadraticCurveTo(-59, -22, -66, 10);
  c.closePath();
}
function wgHeadBase(c, pal, H = {}, t = 0) {
  const EA = H.ears || {};
  // the ears first: the head covers their roots
  wgEar(c, pal, -1, EA.l || {}, t); wgEar(c, pal, 1, EA.r || {}, t);
  c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2);
  const g = c.createRadialGradient(-24, -26, 8, 0, 0, 78);
  g.addColorStop(0, pal.skinHi); g.addColorStop(0.45, pal.skin); g.addColorStop(1, pal.skinSh);
  c.fillStyle = g; c.fill();
  wgHairPath(c); c.fillStyle = pal.hair; c.fill();
  // the gold party headband, round the head under the tuft of hair
  c.beginPath();
  c.moveTo(-60, -37); c.quadraticCurveTo(0, -67, 60, -37);
  c.lineTo(61, -48); c.quadraticCurveTo(0, -79, -61, -48); c.closePath();
  c.fillStyle = WG_GOLD; c.fill();
  paint(() => {
    line(c, -20, -70, 4, -74, 3, rgba(pal.hairHi, 0.9));
    c.beginPath(); c.moveTo(-56, -44.5); c.quadraticCurveTo(0, -73.5, 56, -44.5); c.lineWidth = 2.4; c.strokeStyle = rgba(WG_GOLD_HI, 0.9); c.stroke();
    c.beginPath(); c.moveTo(-58, -39.5); c.quadraticCurveTo(0, -68.5, 58, -39.5); c.lineWidth = 2; c.strokeStyle = rgba(WG_GOLD_DK, 0.9); c.stroke();
    for (let i = 0; i < 22; i++) {   // glitter
      const u = (i + 0.5) / 22, x = lerp(-55, 55, u), y = -42.5 - 26 * (1 - Math.pow(x / 60, 2)) * 0.92 + (hash(i * 7) - 0.5) * 4;
      const tw = 0.55 + 0.45 * Math.sin(t * loopW(5.1) + i * 2.3);
      circle(c, x, y, 1.1 + 0.5 * tw, rgba('#FFFBE0', 0.5 + 0.5 * tw));
    }
    const f = Object.assign({}, H.face || FACES.calm, { noBrows: true, mouth: 'none' });
    drawFace(c, f, pal);
    const fl = H.flush || 0;
    if (fl > 0.02) for (const s of [-1, 1]) ellipse(c, s * 36, 22, 15, 9, `rgba(255,70,80,${0.34 * fl})`);
  });
}
// the headband's two springy stars (party boppers): springs up from the band, a star on each; they lag and bounce
function wgBoppers(c, H = {}, t = 0) {
  const b = H.bop || 0, tt = H.bopT === undefined ? t : H.bopT;
  for (const s of [-1, 1]) {
    const base = [s * 20, -64];
    const sw = (0.10 + 0.5 * b) * Math.sin(tt * loopW(9.4) + s * 0.9) + 0.04 * Math.sin(t * loopW(2.1) + s);
    const L = 40 + 3 * b * Math.sin(tt * loopW(11.3) + s * 2), ang = s * 0.32 + sw;
    const tip = [base[0] + Math.sin(ang) * L, base[1] - Math.cos(ang) * L];
    // the spring: a coil along a gentle curve
    c.beginPath();
    const N = 26;
    for (let i = 0; i <= N; i++) {
      const u = i / N, cx = lerp(base[0], tip[0], u) + Math.sin(u * Math.PI) * s * 4 * Math.cos(ang), cy = lerp(base[1], tip[1], u);
      const w = 2.6 * Math.sin(u * Math.PI * 10), nx = Math.cos(ang), ny = Math.sin(ang);
      if (i === 0) c.moveTo(cx + nx * w, cy + ny * w); else c.lineTo(cx + nx * w, cy + ny * w);
    }
    c.lineWidth = 1.6; c.strokeStyle = '#5A4A3A'; c.lineJoin = 'round'; c.stroke();
    // the star
    c.save(); c.translate(tip[0], tip[1]); c.rotate(sw * 0.8 + s * 0.2);
    c.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 4.6 : 10.5, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fillStyle = s < 0 ? '#FF6FA8' : '#5FE1FF'; c.fill();
    paint(() => { circle(c, -2.5, -3, 2.2, 'rgba(255,255,255,0.75)'); });
    c.restore();
  }
}
function wgGrit(c, pal, g) {
  const w = 17 + 4 * g, h = 6.5 + 3.5 * g, y = 39;
  rrect(c, -w, y - h, 2 * w, 2 * h, h * 0.9); c.fillStyle = pal.mouth; c.fill();
  c.save(); rrect(c, -w + 1.6, y - h + 1.6, 2 * w - 3.2, 2 * h - 3.2, h * 0.8); c.clip();
  c.fillStyle = pal.teeth; c.fillRect(-w, y - h, 2 * w, 2 * h);
  line(c, -w, y, w, y, 1.4, 'rgba(90,21,34,0.7)');
  for (const x of [-10, -3.5, 3.5, 10]) line(c, x * (w / 19), y - h, x * (w / 19), y + h, 1, 'rgba(90,21,34,0.45)');
  c.restore();
  for (const sd of [-1, 1]) line(c, sd * (w + 1.5), y - 3, sd * (w + 4.5), y - 6, 1.6, 'rgba(150,70,50,0.55)');   // strain creases
}
function wgHeadFront(c, pal, H = {}, t = 0) {
  paint(() => {
    const B = H.brows || {}, M = H.mouth || {};
    ebWrinkles(c, -1, (B.l && B.l.lift) || 0, B.l); ebWrinkles(c, 1, (B.r && B.r.lift) || 0, B.r);
    ebBrow(c, -1, B.l || {}, t); ebBrow(c, 1, B.r || {}, t);
    if ((M.grit || 0) > 0.05) wgGrit(c, pal, M.grit); else ebMouth(c, pal, M);
  });
  if ((H.sweat || 0) > 0.02) sweatDrop(c, 47, -30 + 8 * H.sweat, 0.42, clamp(H.sweat * 3));
  wgBoppers(c, H, t);
}

// ---------------------------------------------------------------- the see-through ear and its three muscles (head units)
// The skin stays skin (a dark glass oval read as headphones on the first stills): the side of his head frosts over, the ear goes
// pale and see-through, and the muscles show under it.
const WG_PATCH = { u: 68, v: -12, rx: 30, ry: 46 };
// the muscles in outward units: a (the end at the ear), b (the end in the scalp), widths at a and at b, the number badge
const WG_MUSCLES = {
  top: { a: [70, -24], b: [62, -52], wa: 9, wb: 24, badge: [86, -46], n: '1' },
  front: { a: [59, -6], b: [43, -15], wa: 9, wb: 10, badge: [45, -30], n: '2' },
  back: { a: [76, 4], b: [96, 12], wa: 9, wb: 9, badge: [99, -6], n: '3' },
};
// a muscle: a tapered fan from a to b; o: {awake 0..1 (eyes open), tug 0..1 (shorter, fatter), flex 0..1 (a bulge, gritted
// teeth), jolt (a start), face: false, dim (behind the ear: paler)}
function wgMuscle(c, a, b, wa, wb, o = {}) {
  const tug = clamp(o.tug || 0), fx = clamp(o.flex || 0);
  const dx = b[0] - a[0], dy = b[1] - a[1], L0 = Math.hypot(dx, dy), ux = dx / L0, uy = dy / L0, nx = -uy, ny = ux;
  const L = L0 * (1 - 0.14 * tug - 0.08 * fx);
  const wAt = (u) => lerp(wa, wb, u) * (1 + 0.3 * tug + 0.6 * fx * Math.sin(Math.PI * u)) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, 0.1 + u * 0.9)));
  const P = (u, side) => { const w = wAt(u); return [a[0] + ux * L * u + nx * w * 0.5 * side, a[1] + uy * L * u + ny * w * 0.5 * side]; };
  const N = 16, pts = [];
  for (let i = 0; i <= N; i++) pts.push(P(i / N, 1));
  for (let i = N; i >= 0; i--) pts.push(P(i / N, -1));
  const path = () => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const q of pts) c.lineTo(q[0], q[1]); c.closePath(); };
  // a soft red halo: it sits under the skin
  path(); c.lineWidth = 5; c.lineJoin = 'round'; c.strokeStyle = `rgba(255,110,140,${o.dim ? 0.12 : 0.22 + 0.25 * fx})`; c.stroke();
  path(); c.fillStyle = o.dim ? '#E9879C' : (fx > 0.3 ? '#F2476C' : WG_MUS); c.fill();
  // fibres along it, fanning out
  for (const sd of [-0.62, -0.31, 0, 0.31, 0.62]) {
    c.beginPath();
    for (let i = 1; i < N; i++) { const u = i / N, q1 = P(u, 1), q2 = P(u, -1), q = [lerp(q2[0], q1[0], 0.5 + sd * 0.8), lerp(q2[1], q1[1], 0.5 + sd * 0.8)]; if (i === 1) c.moveTo(q[0], q[1]); else c.lineTo(q[0], q[1]); }
    c.lineWidth = 0.75; c.strokeStyle = Math.abs(sd) < 0.1 || Math.abs(sd) > 0.5 ? 'rgba(255,200,212,0.6)' : 'rgba(140,24,56,0.45)'; c.stroke();
  }
  path(); c.lineWidth = 1.5; c.strokeStyle = o.dim ? 'rgba(120,30,60,0.6)' : '#7E1A3A'; c.stroke();
  if (o.face === false) return;
  // its face, in the middle
  const m = [a[0] + ux * L * 0.52, a[1] + uy * L * 0.52], w = wAt(0.52);
  const fs = clamp(w / 10, 0.75, 1.7), aw = clamp(o.awake || 0), jl = o.jolt || 0;
  c.save(); c.translate(m[0], m[1] - 1.2 * jl); c.scale(fs, fs);
  for (const ex of [-2.5, 2.5]) {
    if (aw < 0.5) { c.beginPath(); c.moveTo(ex - 1.5, -0.6); c.quadraticCurveTo(ex, 0.7, ex + 1.5, -0.6); c.lineWidth = 0.8; c.strokeStyle = '#3E0A1C'; c.stroke(); }
    else {
      circle(c, ex, -0.8, 1.55 + 0.45 * jl, '#FFFFFF');
      circle(c, ex + 0.15, -0.6, fx > 0.4 ? 0.62 : 0.78, '#2A0614');
      if (fx > 0.4) line(c, ex - 1.6, -2.9 + (ex < 0 ? 0.6 : 0), ex + 1.4, -2.6 - (ex < 0 ? 0 : 0.6), 0.6, '#3E0A1C');   // a frown of effort
    }
  }
  if (fx > 0.4) {   // gritted teeth
    rrect(c, -3, 1.3, 6, 2.3, 0.9); c.fillStyle = '#FFFFFF'; c.fill();
    line(c, -3, 2.45, 3, 2.45, 0.35, '#3E0A1C');
    for (const x of [-1.5, 0, 1.5]) line(c, x, 1.4, x, 3.5, 0.3, 'rgba(62,10,28,0.6)');
  } else if (jl > 0.3) ellipse(c, 0, 2.7, 1.2, 1.4, '#3E0A1C');
  else { c.beginPath(); c.moveTo(-1.5, 2.2); c.quadraticCurveTo(0, 3.1 + 0.7 * aw, 1.5, 2.2); c.lineWidth = 0.65; c.strokeStyle = '#3E0A1C'; c.stroke(); }
  c.restore();
}
// G: {k 0..1 (it spreads from the ear), awake, tug: {top, front, back}, flex: {top, ...}, jolt, wire 0..1 (lit), clock,
//     badges [k1, k2, k3], zz 0..1 (the sleepers' z's), tw / perk (the ear's twitch, so its outline moves with the skin)}
function wgGlass(c, pal, s, G = {}, t = 0) {
  const k = clamp(G.k || 0);
  if (k <= 0.01) return;
  const Pc = [s * WG_PATCH.u, WG_PATCH.v], sc = E.outBack(k, 1.3);
  const head = () => { c.beginPath(); c.ellipse(0, 0, 64.3, 70.3, 0, 0, Math.PI * 2); };
  const M = WG_MUSCLES, Q = (p) => [s * p[0], p[1]];
  const tug = G.tug || {}, flex = G.flex || {}, aw = G.awake || 0, jl = G.jolt || 0;
  const mo = (key, dim) => ({ awake: aw, tug: tug[key] || 0, flex: flex[key] || 0, jolt: jl, dim });
  paint(() => {
    // the frost: the side of his head goes pale round the ear (soft edged; on his skin only)
    const frost = (alpha) => {
      const g = c.createRadialGradient(Pc[0], Pc[1], 2, Pc[0], Pc[1], WG_PATCH.ry * sc);
      g.addColorStop(0, `rgba(214,238,255,${alpha})`); g.addColorStop(0.62, `rgba(214,238,255,${alpha * 0.8})`); g.addColorStop(1, 'rgba(214,238,255,0)');
      return g;
    };
    c.save(); head(); c.clip();
    c.fillStyle = frost(0.62); c.fillRect(Pc[0] - 60, Pc[1] - 60, 120, 120);
    c.restore();
    c.save(); wgEarXf(c, s, G); wgEarPath(c, s); c.fillStyle = `rgba(214,238,255,${0.5 * k})`; c.fill(); c.restore();
    c.save();
    c.beginPath(); c.ellipse(Pc[0], Pc[1], WG_PATCH.rx * 1.25 * sc, WG_PATCH.ry * sc, 0, 0, Math.PI * 2); c.clip();
    // the back muscle lies behind the ear: drawn first, seen through the ear's pale skin
    c.save(); wgEarXf(c, s, G);
    wgMuscle(c, Q(M.back.a), Q(M.back.b), M.back.wa, M.back.wb, mo('back', true));
    wgEarPath(c, s); c.fillStyle = 'rgba(226,244,255,0.42)'; c.fill();
    c.lineWidth = 2.2; c.strokeStyle = '#4C8FD0'; c.stroke();
    c.beginPath(); c.moveTo(s * 64, -21); c.quadraticCurveTo(s * 81, -21, s * 83, -5); c.quadraticCurveTo(s * 84, 9, s * 76, 17);
    c.lineWidth = 1.4; c.strokeStyle = 'rgba(76,143,208,0.7)'; c.stroke();
    c.beginPath(); c.ellipse(s * 71.5, 4, 6.6, 10.5, 0, 0, Math.PI * 2); c.lineWidth = 1.2; c.strokeStyle = 'rgba(76,143,208,0.6)'; c.stroke();
    c.restore();
    // the wires: from each muscle in toward the brain; lit, beads run down them to the muscles
    const wk = clamp(G.wire || 0);
    if (wk > 0.02) {
      const wires = [[M.top.b, [44, -66]], [M.front.b, [30, -26]], [M.back.b, [58, 12]]];
      for (const [i, [p0, p1]] of wires.entries()) {
        const a = Q(p0), b = Q(p1), m = [(a[0] + b[0]) / 2 + s * 4, (a[1] + b[1]) / 2 - 5];
        c.beginPath(); c.moveTo(b[0], b[1]); c.quadraticCurveTo(m[0], m[1], a[0], a[1]);
        c.lineWidth = 2.6 * wk + 0.6; c.strokeStyle = rgba('#7A5A00', 0.55 * wk); c.stroke();
        c.lineWidth = 1.5 * wk + 0.4; c.strokeStyle = rgba(WG_WIRE, wk); c.stroke();
        for (let j = 0; j < 3; j++) {
          const u = ((G.clock || 0) * 1.4 + j / 3 + i * 0.21) % 1, v = 1 - u;
          const q = [v * v * b[0] + 2 * u * v * m[0] + u * u * a[0], v * v * b[1] + 2 * u * v * m[1] + u * u * a[1]];
          circle(c, q[0], q[1], 1.9 * wk, '#FFFBE0');
        }
      }
    }
    // the front and top muscles, under the frosted skin of his head
    wgMuscle(c, Q(M.front.a), Q(M.front.b), M.front.wa, M.front.wb, mo('front'));
    wgMuscle(c, Q(M.top.a), Q(M.top.b), M.top.wa, M.top.wb, mo('top'));
    c.restore();
    // number badges
    const bd = G.badges || [0, 0, 0];
    for (const [i, key] of ['top', 'front', 'back'].entries()) {
      const kk = clamp(bd[i] || 0);
      if (kk <= 0.01) continue;
      const p = Q(M[key].badge), r = 6.2 * E.outBack(kk, 2.2);
      circle(c, p[0], p[1], r + 1, '#0B0B1A'); circle(c, p[0], p[1], r, '#FFD447');
      c.font = `900 ${8.4 * E.outBack(kk, 2.2)}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#0B0B1A';
      c.fillText(M[key].n, p[0], p[1] + 0.5);
    }
    // z z z off the sleepers
    const zz = clamp(G.zz || 0);
    if (zz > 0.01) {
      c.font = '900 9px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = 0; i < 3; i++) {
        const u = ((G.clock || 0) * 0.55 + i / 3) % 1, p = Q([60 - 6 * u, -50 - 20 * u]);
        c.globalAlpha = zz * Math.sin(Math.PI * u);
        c.save(); c.translate(p[0], p[1]); c.scale(0.6 + 0.7 * u, 0.6 + 0.7 * u);
        c.lineWidth = 2.2; c.strokeStyle = '#0B0B1A'; c.strokeText('z', 0, 0); c.fillStyle = '#E8F4FF'; c.fillText('z', 0, 0);
        c.restore();
      }
      c.globalAlpha = 1;
    }
  });
}

// ---------------------------------------------------------------- props in the world
// a party balloon on a string (world units; r = the balloon's height radius). o: {col, sway}
function wgBalloon(c, x, y, r, t, o = {}) {
  const col = o.col || '#FF4F6A', sw = o.sway || 0;
  c.save(); c.translate(x, y); c.rotate(sw);
  // the string
  c.beginPath(); c.moveTo(0, r + 4); c.bezierCurveTo(6, r + 40, -8, r + 80, 4, r + 160); c.lineWidth = 1.5; c.strokeStyle = 'rgba(240,230,255,0.75)'; c.stroke();
  c.beginPath(); c.ellipse(0, 0, r * 0.86, r, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill();
  c.beginPath(); c.moveTo(-3.5, r - 1); c.lineTo(3.5, r - 1); c.lineTo(0, r + 5); c.closePath(); c.fillStyle = col; c.fill();
  paint(() => {
    ellipse(c, -r * 0.32, -r * 0.4, r * 0.17, r * 0.27, 'rgba(255,255,255,0.55)', -0.45);
    ellipse(c, -r * 0.22, -r * 0.12, r * 0.06, r * 0.08, 'rgba(255,255,255,0.4)');
  });
  c.restore();
}
// the balloon bursting at world (x, y): a jagged star, shreds flying, k = seconds since
function wgPop(x, y, r, d) {
  if (d < 0 || d > 0.9) return;
  const rng = mulberry32(77), k = clamp(d / 0.12);
  paint(() => {
    if (d < 0.22) {
      const s = r * (0.9 + 1.2 * k), a = 1 - clamp((d - 0.12) / 0.1);
      ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) { const rr = i % 2 ? s * 0.48 : s * (0.95 + 0.25 * rng()), an = i * Math.PI / 8 + 0.2; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      ctx.closePath(); ctx.fillStyle = '#FFF2A8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#FF9A3C'; ctx.stroke();
      ctx.restore();
      softDot(gctx, x, y, s * 1.6, '#FFE7A0', 0.8 * a);
    }
    for (let i = 0; i < 9; i++) {   // shreds of rubber
      const an = rng() * Math.PI * 2, v = 120 + 160 * rng(), px = x + Math.cos(an) * v * d, py = y + Math.sin(an) * v * d + 300 * d * d;
      ctx.save(); ctx.translate(px, py); ctx.rotate(an + d * 9); ctx.globalAlpha = clamp(1.3 - d * 1.4);
      ctx.fillStyle = '#FF4F6A'; ctx.fillRect(-4, -2, 8 + 4 * rng(), 4); ctx.restore();
    }
  });
}

// ---------------------------------------------------------------- the brain's room (room units = screen px at 1:1)
// the brain's FACE control panel: a sloped desk whose top edge runs from (x, y) 330 wide (s = 1). o: {press 0..1 (BROWS pushed
// in), lit 0..1}. The EARS socket is empty: dust and a cobweb.
function wgConsole(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // the front face and the sloped top
  c.beginPath(); c.moveTo(-10, 70); c.lineTo(340, 70); c.lineTo(330, 260); c.lineTo(0, 260); c.closePath(); c.fillStyle = '#23263A'; c.fill();
  c.beginPath(); c.moveTo(16, 0); c.lineTo(314, 0); c.lineTo(340, 70); c.lineTo(-10, 70); c.closePath(); c.fillStyle = '#3A3F5E'; c.fill();
  paint(() => {
    line(c, -10, 70, 340, 70, 3, 'rgba(255,255,255,0.18)');
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) circle(c, 60 + i * 70, 200, 7, i % 2 ? '#4DFFB4' : '#FF5A6E');   // little lamps
    // the big BROWS button
    const pr = clamp(o.press || 0), lit = clamp(o.lit || 0);
    ellipse(c, 92, 40, 78, 30, '#14162A');
    ellipse(c, 92, 33 + 8 * pr, 70, 26 - 3 * pr, mixHex('#E8B800', '#FFE36A', lit));
    ellipse(c, 92, 19 + 9 * pr, 70, 26 - 3 * pr, mixHex('#FFD447', '#FFF3A8', lit));
    c.font = '900 34px Montserrat'; c.fillStyle = '#FFE36A'; c.fillText('BROWS', 92, 104);
    // two small ones that work
    for (const [bx, lb, col] of [[206, 'SMILE', '#4DFFB4'], [274, 'BLINK', '#7FE9FF']]) {
      ellipse(c, bx, 30, 30, 12, '#14162A'); ellipse(c, bx, 24, 26, 10, col);
      c.font = '900 17px Montserrat'; c.fillStyle = col; c.fillText(lb, bx, 104);
    }
    // the empty EARS socket: a dark hole, dust, a cobweb
    ellipse(c, 232, 56, 34, 9, '#0B0C16');
    c.font = '900 17px Montserrat'; c.fillStyle = 'rgba(200,205,230,0.5)'; c.fillText('EARS', 240, 134);
    c.strokeStyle = 'rgba(230,230,245,0.55)'; c.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.95 + i * 0.22; c.beginPath(); c.moveTo(232 + 40, 46); c.lineTo(232 + 40 + Math.cos(a) * 36, 46 + Math.sin(a) * 36 + 22); c.stroke(); }
    for (const r of [12, 22, 32]) { c.beginPath(); c.arc(272, 46, r, Math.PI * 0.55, Math.PI * 1.05); c.stroke(); }
    for (let i = 0; i < 9; i++) circle(c, 210 + hash(i * 5) * 46, 50 + hash(i * 9) * 10, 1.4, 'rgba(200,190,170,0.6)');
  });
  c.restore();
}
// the MISSING poster on the wall: top-left corner at (x, y), 300 x 410 at s = 1. k pops it in; st: the LAST SEEN sticker
function wgPoster(c, x, y, s, k, st, t) {
  if (k <= 0.01) return;
  const sc = E.outBack(clamp(k), 1.6);
  c.save(); c.translate(x + 150 * s, y + 205 * s); c.rotate(0.05 - 0.08 * (1 - clamp(k))); c.scale(s * sc, s * sc);
  rrect(c, -150, -205, 300, 410, 6); c.fillStyle = '#F4EBD5'; c.fill();
  paint(() => {
    // tape
    for (const [tx, ty, r] of [[-120, -200, -0.5], [120, -200, 0.5]]) { c.save(); c.translate(tx, ty); c.rotate(r); c.fillStyle = 'rgba(255,240,180,0.8)'; c.fillRect(-26, -9, 52, 18); c.restore(); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '400 76px Anton'; c.fillStyle = '#D9283E'; c.fillText('MISSING', 0, -146);
    // a drawing of the lost remote: grey, with an ear on its button
    rrect(c, -40, -96, 80, 150, 22); c.fillStyle = '#5A607A'; c.fill();
    circle(c, 0, -60, 25, '#E9C9A9');
    // the ear on it
    c.save(); c.translate(-2, -60); c.scale(0.55, 0.55);
    c.beginPath(); c.moveTo(-8, -26); c.quadraticCurveTo(22, -34, 22, -4); c.quadraticCurveTo(22, 22, 4, 30); c.quadraticCurveTo(-6, 34, -8, 22);
    c.quadraticCurveTo(4, 14, 2, 0); c.quadraticCurveTo(-2, -12, -8, -26); c.closePath(); c.fillStyle = '#C47452'; c.fill();
    c.restore();
    for (const [bx, by] of [[-18, 0], [18, 0], [-18, 30], [18, 30]]) circle(c, bx, by, 9, '#8890AA');
    c.font = '900 40px Montserrat'; c.fillStyle = '#1A1A2A'; c.fillText('EAR REMOTE', 0, 92);
    c.font = '800 22px Montserrat'; c.fillStyle = '#5A5A6A'; c.fillText('REWARD: ONE WIGGLE', 0, 132);
  });
  // the sticker: LAST SEEN 25 MILLION YEARS AGO
  if (st > 0.01) {
    const k2 = E.outBack(clamp(st), 2.0);
    c.save(); c.translate(0, 160); c.rotate(-0.06); c.scale(k2, k2);
    rrect(c, -150, -58, 300, 116, 14); c.fillStyle = '#FFD447'; c.fill();
    paint(() => {
      c.lineWidth = 3; c.strokeStyle = '#0B0B1A'; rrect(c, -150, -58, 300, 116, 14); c.stroke();
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#0B0B1A';
      c.font = '800 19px Montserrat'; c.fillText('LAST SEEN', 0, -36);
      c.font = '900 40px Montserrat'; c.fillText('25 MILLION', 0, -4);
      c.font = '900 26px Montserrat'; c.fillText('YEARS AGO', 0, 33);
    });
    c.restore();
  }
  c.restore();
}

// ---------------------------------------------------------------- the party's noise (screen space)
// a chatter bubble: rounded, with a tail toward (tx, ty); txt in it; k pops it; j = its jitter
function wgBubble(x, y, w, h, txt, k, tx, ty, o = {}) {
  if (k <= 0.01) return;
  const sc = E.outBack(clamp(k), 2.2), col = o.col || '#FFFFFF';
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc);
  const ang = Math.atan2(ty - y, tx - x), bx = Math.cos(ang) * w * 0.36, by = Math.sin(ang) * h * 0.36;
  ctx.beginPath(); ctx.moveTo(bx - 14 * Math.sin(ang), by + 14 * Math.cos(ang)); ctx.lineTo(Math.cos(ang) * (w * 0.5 + 30), Math.sin(ang) * (h * 0.5 + 30)); ctx.lineTo(bx + 14 * Math.sin(ang), by - 14 * Math.cos(ang)); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2.4); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 13 * Math.sin(ang), by + 13 * Math.cos(ang)); ctx.lineTo(bx + 13 * Math.sin(ang), by - 13 * Math.cos(ang)); ctx.lineWidth = 8; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${o.size || 44}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.ink || '#0B0B1A';
  ctx.fillText(txt, 0, 2);
  ctx.restore();
}
// a music note (screen space), s = size
function wgNote(x, y, s, col, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ellipse(ctx, 0, 0, 11, 8, col, -0.4); line(ctx, 9, -3, 9, -42, 4, col);
  ctx.beginPath(); ctx.moveTo(9, -42); ctx.quadraticCurveTo(24, -36, 22, -20); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  ctx.restore();
}
// the party getting loud round him: bubbles from both sides and notes; k 0..1 how loud, t the clock, hd = his head (screen)
function wgChatter(t, k, hd, tq = 0) {
  if (k <= 0.01) return;
  screenSpace();
  const B = [
    [225, 560, 230, 96, 'BLAH!', 0.00, -0.08, '#FFFFFF'], [850, 585, 220, 96, 'HA HA!', 0.10, 0.08, '#FFE3F0'],
    [200, 775, 200, 90, 'WOO!', 0.22, 0.06, '#E3FFF4'], [870, 775, 200, 90, 'BLAH', 0.32, -0.07, '#FFFFFF'],
  ];
  for (const [x, y, w, h, txt, d, rot, col] of B) {
    const kk = clamp((k - d) / 0.28);
    const j = 5 * Math.sin(t * 23 + x) * kk;
    paint(() => wgBubble(x + j, y + 0.6 * j, w, h, txt, kk, hd[0], hd[1], { rot: rot + 0.03 * Math.sin(t * 17 + y), col, size: txt.length > 5 ? 40 : 46 }));
  }
  // notes drifting up the sides
  for (let i = 0; i < 6; i++) {
    const u = ((t * 0.45 + i / 6) % 1), side = i % 2 ? 1 : -1, x = 540 + side * (330 + 60 * Math.sin(i * 2.1 + t)), y = 1180 - u * 640;
    const kk = clamp((k - 0.2) / 0.4) * Math.sin(Math.PI * u);
    if (kk > 0.02) paint(() => wgNote(x, y, 1.1 * kk, ['#FFD447', '#7FE9FF', '#FF86A6'][i % 3], 0.2 * Math.sin(t * 3 + i)));
  }
}
