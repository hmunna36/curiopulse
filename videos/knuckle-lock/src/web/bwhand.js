// bwhand.js — his LEFT forearm and hand in 3D for the bent-wrist test, built on one-finger's fist3d.js (its hand rig,
// camera and capsules). What it adds:
// - a wrist that bends: the hand frame turns about the x axis through the wrist (`th` > 0: down, toward the palm (+z);
//   `th` < 0: tipped back). The forearm stays put: arm-frame points go through `pa`, hand-frame points through `ph`.
// - the forearm as an oval tube (a hull of rings), with the finger-closing muscle's bulge on the palm side (`bulge`);
// - the strings (the finger-closing tendons): from a puppet's control bar in the forearm, over the palm side of the wrist,
//   along the palm side of each finger to its tip (`slack`: waves; `taut`: straight and glowing; beads that ride with the
//   bar); the strings tied to the fingertips seen from outside (`ties`, the hook's "puppets");
// - the puppeteer: the forearm muscle as a little character holding the bar (`bwPuppeteer`: pull, faces, a wave, asleep in
//   a nightcap);
// - the hand and forearm as rosy glass (`bwGlass`), the marshmallow stick (`bwStick`).
'use strict';

const BWK = { L: 26, barRest: 5.4, pupLen: 10.5, pupW: 6.0 };
const BWC = { arm: '#EDB08A', glass: '#93507C', str: '#FFF1D9', strHot: '#FFF3A0', strDk: '#4A2440',
  mus: '#E8586E', musDk: '#B23A55', musHi: '#FF9DAC', bar: '#C07A42', barDk: '#7A4520', cord: '#FFF4E4' };

// a hand-frame point turned by the wrist
function bwRot(p, th) { const c = Math.cos(th), s = Math.sin(th); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
// the two projectors for a camera V and a wrist angle th
function bwProj(V, th) { const pa = fkCam(V); return { pa, ph: (p) => pa(bwRot(p, th)), th }; }

// ---------------------------------------------------------------- the forearm
// a ring of the forearm at u (0 the wrist .. 1 the elbow): half-width wx (across, toward the thumb), half-depth wz (palm
// side +z, a bulge there where the finger-closing muscle sits)
function bwArmRing(u, bulge) {
  const y = -u * BWK.L, wx = 2.75 + 1.05 * u + 0.5 * Math.sin(Math.PI * clamp(u * 1.15));
  const wz = 1.75 + 1.35 * u, bump = (0.7 + 1.0 * bulge) * Math.exp(-Math.pow((u - 0.45) / 0.22, 2));
  const P = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    P.push([wx * ca, y, (wz + (sa > 0 ? bump * Math.pow(sa, 1.5) : 0.25 * bump * Math.pow(-sa, 2))) * sa]);
  }
  return P;
}
// the forearm's outline on screen: a hull of all its rings (from just inside the wrist to the elbow)
function bwArmOutline(pa, bulge) {
  const P = [];
  for (let i = 0; i <= 14; i++) for (const q of bwArmRing(0.012 + (i / 14) * 0.988, bulge)) P.push(pa(q));
  return fkHull(P.map((q) => [q[0], q[1]]));
}
// the wrist joint: the forearm's end ring, a rounded ball and the hand's first ring, as one hull (it fills the corner on
// the outside of the bend)
function bwJointOutline(P2) {
  const pts = [];
  for (const q of bwArmRing(0.0, 0)) pts.push(P2.pa(q));
  for (const q of bwArmRing(0.05, 0)) pts.push(P2.pa(q));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    for (const h of [-0.55, 0, 0.55]) {
      const r = Math.sqrt(1 - h * h);
      pts.push(P2.pa(bwRot([2.5 * r * Math.cos(a), h * 1.25, 1.45 * r * Math.sin(a)], P2.th / 2)));
    }
    pts.push(P2.ph([2.6 * Math.cos(a), 0.9, 1.3 * Math.sin(a)]));
  }
  return fkHull(pts.map((q) => [q[0], q[1]]));
}
// items for fkDraw's depth sort: the forearm, then the joint, both a little behind the hand
function bwArmItems(c, P2, o = {}) {
  const zw = P2.pa([0, 0, 0])[3];
  const col = o.armCol || BWC.arm;
  return [
    { z: zw + 6, fn: () => { c.fillStyle = col; fkSmooth(c, bwArmOutline(P2.pa, o.bulge || 0)); c.fill(); } },
    { z: zw + 4, fn: () => { c.fillStyle = col; fkSmooth(c, bwJointOutline(P2)); c.fill(); } },
  ];
}

// ---------------------------------------------------------------- the hand
// geometry from a state: lift (0 fist .. 1 straight, all four fingers with a little stagger), squeeze, tremble, thumb, t
function bwGeo(S, t) {
  const L = S.lift === undefined ? 0.5 : S.lift, st = [0, 0.04, 0.07, 0.1];
  const lift = {}, trem = {};
  FK_ORD.forEach((k, i) => { lift[k] = clamp(L + st[i] * (S.fan || 0)); trem[k] = S.tremble || 0; });
  return fkGeo({ lift, squeeze: S.squeeze || 0, tremble: trem, thumb: S.thumb === undefined ? 0.4 : S.thumb, t });
}
// draw hand + forearm. P2 = bwProj(...). o: {items: extra depth-sorted items, bulge, armCol}
function bwDraw(c, P2, G, o = {}) {
  const items = bwArmItems(c, P2, o).concat(o.items || []);
  fkDraw(c, P2.ph, G, { noArm: true, items });
}

// ---------------------------------------------------------------- glass
// the hand and forearm again in one colour on the scratch layer, laid over at one alpha (no darker overlaps)
function bwGlass(c, P2, G, k, o = {}) {
  if (k <= 0.01) return;
  const m = c.getTransform();
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 1; tctx.clearRect(0, 0, W, H);
  tctx.setTransform(m);
  const col = BWC.glass;
  tctx.fillStyle = col; fkSmooth(tctx, bwArmOutline(P2.pa, o.bulge || 0)); tctx.fill();
  fkSmooth(tctx, bwJointOutline(P2)); tctx.fill();
  fkSmooth(tctx, fkHull(fkPalmPts().map(P2.ph).map((q) => [q[0], q[1]]))); tctx.fill();
  const T = G.thumb, Tp = T.pts.map(P2.ph);
  for (let i = 0; i < 3; i++) fkCap(tctx, Tp[i], Tp[i + 1], T.rad[i] * Tp[i][2], T.rad[i + 1] * Tp[i + 1][2], col);
  for (const kk of FK_ORD) {
    const F = G.f[kk], Pp = F.pts.map(P2.ph);
    for (let i = 0; i < 3; i++) fkCap(tctx, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2], F.rad[i + 1] * Pp[i + 1][2], col);
  }
  // a lighter heart down the middle of the forearm
  tctx.globalCompositeOperation = 'source-atop';
  const q = P2.pa([0, -9, 0.6]), g = tctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], q[2] * 13);
  g.addColorStop(0, 'rgba(236,178,212,0.7)'); g.addColorStop(1, 'rgba(236,178,212,0)');
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.fillStyle = g; tctx.fillRect(0, 0, W, H);
  tctx.globalCompositeOperation = 'source-over';
  paint(() => {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.66 * k; c.drawImage(tintC, 0, 0); c.restore();
    c.save(); c.lineWidth = 4; c.strokeStyle = `rgba(255,214,236,${0.5 * k})`; fkSmooth(c, bwArmOutline(P2.pa, o.bulge || 0)); c.stroke(); c.restore();
  });
}

// ---------------------------------------------------------------- the strings
// the screen axis of the forearm: wrist point, elbow point, the unit vector up the arm (toward the wrist) and across it
function bwAxis(P2) {
  const w = P2.pa([0, 0, 0.4]), e = P2.pa([0, -BWK.L, 0.4]);
  const dx = w[0] - e[0], dy = w[1] - e[1], l = Math.hypot(dx, dy) || 1;
  return { w, e, up: [dx / l, dy / l], ac: [-dy / l, dx / l], k: w[2] };
}
// where the bar sits on screen (its middle) for a bar distance barS (cm from the wrist)
function bwBarPt(P2, barS) { return P2.pa([0, -barS, 0.55]); }
// one string's path on screen: [from the bar ... to the fingertip], split at `nArm` (the forearm part ends there)
function bwStringPath(P2, G, k, barS, j) {
  const A = bwAxis(P2), b = bwBarPt(P2, barS), off = (j - 1.5) * 0.62 * A.k;
  const start = [b[0] + A.ac[0] * off, b[1] + A.ac[1] * off];
  const F = FK_F[k];
  const armEnd = P2.pa([F.x * 0.22, -0.6, 0.95]);
  const hand = [[F.x * 0.25, 0.7, 0.98], [F.x * 0.5, 3.4, 0.98], [F.x * 0.82, 6.4, 0.9], [F.x, F.y - 0.25, 0.78]].map(P2.ph);
  for (const [i, u] of [[0, 0.15], [0, 0.6], [1, 0.12], [1, 0.62], [2, 0.2], [2, 0.82]]) hand.push(P2.ph(fkSegPt(G, k, i, u, 'front', 0.42)));
  return { arm: [start, [armEnd[0], armEnd[1]]], hand: hand.map((q) => [q[0], q[1]]), k: A.k };
}
// draw the strings (inside the glass). o: {k (0..1 shown), slack 0..1, taut 0..1, glow 0..1, pullS (cm the bar has
// moved, for the beads), barS, t, beads 0..1}
function bwStrings(c, g, P2, G, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const barS = o.barS === undefined ? BWK.barRest : o.barS;
  paint(() => {
    FK_ORD.forEach((kk, j) => {
      const S = bwStringPath(P2, G, kk, barS, j);
      // the forearm part: straight, or a wave when slack (it hangs out toward the palm side a little)
      const a = S.arm[0], b = S.arm[1], n = 26, pts = [];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const amp = (o.slack || 0) * S.k * 1.5, ph = (o.t || 0) * 3.2 + j * 0.9;
      for (let i = 0; i <= n; i++) {
        const v = i / n, env = Math.sin(Math.PI * v);
        const w = amp * env * (Math.sin(v * Math.PI * 4.0 + ph) * 0.8 + 0.5);
        pts.push([a[0] + dx * v + nx * w, a[1] + dy * v + ny * w]);
      }
      const P = pts.concat(S.hand);
      const wpx = Math.max(4, S.k * 0.26);
      const hot = clamp(o.glow || 0);
      poly(c, P, wpx * 1.55, rgba(BWC.strDk, 0.65 * k));
      poly(c, P, wpx, rgba(mixH(BWC.str, BWC.strHot, hot), k));
      if (hot > 0.01) poly(g, P, wpx * 2.2, rgba('#FFE38A', 0.32 * hot * k));
      // beads that ride with the string (they move when the bar moves)
      if ((o.beads || 0) > 0.01) {
        const acc = polyLen(P), Lc = acc[acc.length - 1], sp = S.k * 3.1, sh = (o.pullS || 0) * S.k;
        for (let i = 0; i < 9; i++) {
          const s = ((i * sp + sh + j * sp * 0.37) % Lc + Lc) % Lc;
          if (s < S.k * 0.6) continue;
          const q = polyAt(P, acc, s);
          circle(c, q[0], q[1], wpx * 0.55, rgba('#FFFFFF', 0.85 * o.beads * k));
        }
      }
    });
  });
}
// the hook's "puppets": a marionette's strings, from each fingertip straight up out of the top of the frame (screen
// space; k drops them in from the top; jig 0..1 tugs them; the real strings, inside, come later)
function bwTies(c, g, P2, G, k, t, jig = 0) {
  if (k <= 0.01) return;
  paint(() => {
    FK_ORD.forEach((kk, j) => {
      const tip = P2.ph(fkSegPt(G, kk, 2, 0.85, 'back', 1.0));
      const top = -60, len = tip[1] - top, drop = E.outCubic(clamp(k * 1.3 - j * 0.08));
      const sway = 10 * Math.sin(t * 2.3 + j * 1.7) + 26 * jig * Math.sin(t * 22 + j * 1.3);
      const y0 = lerp(top - 40, top, drop), y1 = lerp(top, tip[1], drop), x1 = lerp(tip[0] + sway, tip[0], drop);
      const P = [[tip[0] + sway * 1.4, y0], [x1, y1]];
      poly(c, P, 7, 'rgba(30,16,40,0.45)');
      poly(c, P, 3.6, '#FFF6E8');
      poly(g, P, 9, 'rgba(255,240,200,0.28)');
      if (drop > 0.98) {   // the knot on the fingertip
        c.lineWidth = 3.5; c.strokeStyle = '#FFF6E8';
        c.beginPath(); c.ellipse(tip[0], tip[1], tip[2] * 0.75, tip[2] * 0.32, 0, 0, 7); c.stroke();
      }
    });
  });
}

// ---------------------------------------------------------------- the puppeteer
// the forearm muscle as a little character, standing in the forearm with his head toward the wrist, holding the bar.
// o: {k (0..1 popped in), barS (cm from the wrist), pull 0..1 (how hard; squashes him), mood: 'calm'|'happy'|'strain'|
// 'worry'|'pant'|'shock'|'proud'|'sleep', look [x, y] (-1..1), wave 0..1 (his right hand off the bar, waving), lift (cm he
// is pulled up toward the wrist), cap 0..1 (a nightcap), t}
function bwPuppeteer(c, g, P2, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return null;
  const A = bwAxis(P2), barS = o.barS === undefined ? BWK.barRest : o.barS, t = o.t || 0;
  const pull = clamp(o.pull || 0), lift = o.lift || 0;
  const s = A.k;                                  // px per cm here
  // his middle: below the bar (toward the elbow); he rises with `lift`
  const mid = P2.pa([0, -(BWK.barRest + 1.7 + BWK.pupLen * 0.42) + lift, 0.35]);   // anchored: the bar comes down to him
  const ang = Math.atan2(A.up[1], A.up[0]) + Math.PI / 2;      // local -y = up the arm
  const sq = 1 + 0.16 * pull, len = BWK.pupLen * s / sq, wid = BWK.pupW * s * sq;
  const pop = E.outBack(k, 2.2);
  const bar = bwBarPt(P2, barS);
  const barL = [bar[0] - A.ac[0] * 2.3 * s, bar[1] - A.ac[1] * 2.3 * s], barR = [bar[0] + A.ac[0] * 2.3 * s, bar[1] + A.ac[1] * 2.3 * s];
  const mood = o.mood || 'calm', breath = Math.sin(t * loopW(3.1)) * 0.02 + (mood === 'pant' ? 0.07 * Math.sin(t * 17) : 0);
  // in his own frame (px): x across, y down the arm (negative = toward the wrist)
  const toW = (x, y) => [mid[0] + (x * Math.cos(ang) - y * Math.sin(ang)) * pop, mid[1] + (x * Math.sin(ang) + y * Math.cos(ang)) * pop];
  const hy = -len * 0.5;                          // the top of his head
  // the cord from his bottom down to the elbow
  const tail0 = toW(0, len * 0.45), tail1 = P2.pa([0, -BWK.L * 0.95, 0.3]);
  paint(() => {
    poly(c, [tail0, [tail1[0], tail1[1]]], Math.max(5, s * 0.5) * 1.5, rgba(BWC.strDk, 0.6 * k));
    poly(c, [tail0, [tail1[0], tail1[1]]], Math.max(4, s * 0.5), rgba(BWC.cord, k));
  });
  actor(() => {
    c.save();
    c.translate(mid[0], mid[1]); c.rotate(ang); c.scale(pop * (1 + breath), pop * (1 - breath));
    // body: a fat bean, wider at the top
    c.beginPath();
    c.moveTo(0, hy);
    c.bezierCurveTo(wid * 0.62, hy, wid * 0.62, len * 0.05, wid * 0.36, len * 0.32);
    c.quadraticCurveTo(wid * 0.18, len * 0.5, 0, len * 0.5);
    c.quadraticCurveTo(-wid * 0.18, len * 0.5, -wid * 0.36, len * 0.32);
    c.bezierCurveTo(-wid * 0.62, len * 0.05, -wid * 0.62, hy, 0, hy);
    c.closePath(); c.fillStyle = BWC.mus; c.fill();
    c.restore();
  });
  paint(() => {
    c.save();
    c.translate(mid[0], mid[1]); c.rotate(ang); c.scale(pop * (1 + breath), pop * (1 - breath));
    // fibres
    c.lineCap = 'round';
    for (const fx of [-0.28, -0.1, 0.1, 0.28]) {
      c.beginPath(); c.moveTo(fx * wid * 0.9, hy + len * 0.2); c.quadraticCurveTo(fx * wid * 1.25, len * 0.05, fx * wid * 0.55, len * 0.36);
      c.lineWidth = Math.max(2, s * 0.13); c.strokeStyle = rgba(BWC.musHi, 0.55); c.stroke();
    }
    // the face
    const fy = hy + len * 0.27, ex = wid * 0.17, er = s * 0.62;
    const lk = o.look || [0, 0];
    const shut = mood === 'sleep', squint = mood === 'strain' || mood === 'pant';
    for (const sx of [-1, 1]) {
      if (shut) {
        c.beginPath(); c.arc(sx * ex, fy, er * 0.8, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = Math.max(3, s * 0.18); c.strokeStyle = '#3A1020'; c.stroke();
      } else if (squint) {
        c.beginPath(); c.moveTo(sx * ex - er * 0.8, fy - er * 0.3 * sx * 0); c.lineTo(sx * ex + er * 0.2 * sx, fy); c.lineTo(sx * ex - er * 0.8, fy + er * 0.45);
        c.lineWidth = Math.max(3, s * 0.2); c.strokeStyle = '#3A1020'; c.lineJoin = 'round'; c.stroke();
      } else {
        const open = mood === 'shock' ? 1.25 : 1;
        c.beginPath(); c.ellipse(sx * ex, fy, er * 0.85 * open, er * open, 0, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
        c.lineWidth = Math.max(2, s * 0.08); c.strokeStyle = '#5A1A2A'; c.stroke();
        c.beginPath(); c.arc(sx * ex + lk[0] * er * 0.35, fy + lk[1] * er * 0.35, er * 0.42, 0, 7); c.fillStyle = '#20101A'; c.fill();
        c.beginPath(); c.arc(sx * ex + lk[0] * er * 0.35 - er * 0.14, fy + lk[1] * er * 0.35 - er * 0.16, er * 0.13, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
      }
      // brows (+ angry: the inner end down; - worried: the inner end up)
      const bt = { calm: 0, happy: -0.15, strain: 0.7, worry: -0.6, pant: 0.35, shock: -0.4, proud: 0.3, sleep: 0 }[mood] || 0;
      const by = fy - er * (mood === 'shock' ? 1.75 : 1.4);
      c.beginPath(); c.moveTo(sx * (ex - er * 0.85), by + bt * er * 0.55); c.lineTo(sx * (ex + er * 0.8), by - bt * er * 0.3);
      c.lineWidth = Math.max(3, s * 0.2); c.strokeStyle = '#5A1A2A'; c.lineCap = 'round'; c.stroke();
    }
    // the mouth
    const my = fy + er * 1.55, mw = wid * 0.17;
    c.lineWidth = Math.max(3, s * 0.16); c.strokeStyle = '#3A1020'; c.lineCap = 'round';
    if (mood === 'happy' || mood === 'proud') {
      c.beginPath(); c.moveTo(-mw, my - er * 0.2); c.quadraticCurveTo(0, my + er * 0.9, mw, my - er * 0.2); c.closePath(); c.fillStyle = '#5A1020'; c.fill(); c.stroke();
    } else if (mood === 'strain') {
      rrect(c, -mw, my - er * 0.3, mw * 2, er * 0.7, er * 0.2); c.fillStyle = '#FFFFFF'; c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-mw, my + er * 0.05); c.lineTo(mw, my + er * 0.05); c.lineWidth = Math.max(2, s * 0.08); c.stroke();
    } else if (mood === 'pant' || mood === 'shock') {
      const oo = mood === 'shock' ? 0.75 : 0.55 + 0.2 * Math.sin(t * 17);
      c.beginPath(); c.ellipse(0, my + er * 0.1, mw * 0.6, er * oo, 0, 0, 7); c.fillStyle = '#5A1020'; c.fill(); c.stroke();
    } else if (mood === 'worry') {
      c.beginPath(); c.moveTo(-mw, my + er * 0.3); c.quadraticCurveTo(-mw * 0.4, my - er * 0.25, 0, my + er * 0.15); c.quadraticCurveTo(mw * 0.4, my + er * 0.5, mw, my); c.stroke();
    } else if (mood === 'sleep') {
      c.beginPath(); c.ellipse(0, my + er * 0.15, mw * 0.32, er * 0.32, 0, 0, 7); c.fillStyle = '#5A1020'; c.fill();
    } else {
      c.beginPath(); c.moveTo(-mw * 0.8, my); c.quadraticCurveTo(0, my + er * 0.45, mw * 0.8, my); c.stroke();
    }
    // a nightcap
    const cap = clamp(o.cap || 0);
    if (cap > 0.01) {
      const cs = E.outBack(cap, 2);
      c.save(); c.translate(0, hy + len * 0.06); c.scale(cs, cs); c.rotate(-0.25);
      c.beginPath(); c.moveTo(-wid * 0.48, 0); c.quadraticCurveTo(-wid * 0.2, -len * 0.42, wid * 0.55, -len * 0.38); c.quadraticCurveTo(wid * 0.2, -len * 0.2, wid * 0.48, 0); c.closePath();
      c.fillStyle = '#5B7BE8'; c.fill();
      rrect(c, -wid * 0.55, -s * 0.5, wid * 1.1, s * 1.0, s * 0.45); c.fillStyle = '#F4F0FF'; c.fill();
      c.beginPath(); c.arc(wid * 0.58, -len * 0.38, s * 0.6, 0, 7); c.fillStyle = '#F4F0FF'; c.fill();
      c.restore();
    }
    c.restore();
  });
  if (o.bar) o.bar();                              // the control bar: in front of his body, behind his hands
  // the arms to the bar (his left hand may wave instead)
  const sh = [toW(-wid * 0.42, hy + len * 0.36), toW(wid * 0.42, hy + len * 0.36)];
  const wave = clamp(o.wave || 0);
  const hands = [barL, barR];
  if (wave > 0.01) {
    const wv = toW(wid * (0.95 + 0.12 * Math.sin(t * 16)), hy - len * 0.05);
    hands[1] = [lerp(barR[0], wv[0], wave), lerp(barR[1], wv[1], wave)];
  }
  actor(() => {
    for (let i = 0; i < 2; i++) {
      const a = sh[i], b = hands[i], mx = (a[0] + b[0]) / 2, my2 = (a[1] + b[1]) / 2;
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]), bend = Math.max(0, wid * 0.9 - d) * 0.6 * (i ? 1 : -1);
      const el = [mx + A.ac[0] * bend, my2 + A.ac[1] * bend];
      poly(c, [a, el, b], Math.max(6, s * 0.62), BWC.musDk);
      poly(c, [a, el, b], Math.max(4, s * 0.45), BWC.mus);
      c.beginPath(); c.arc(b[0], b[1], Math.max(5, s * 0.45), 0, 7); c.fillStyle = BWC.mus; c.fill();
    }
  });
  return { mid, head: toW(0, hy), barL, barR, s, ang };
}
// the control bar (the puppet's cross): drawn after the strings so they hang from it
function bwBar(c, P2, barS, k = 1) {
  if (k <= 0.01) return;
  const A = bwAxis(P2), b = bwBarPt(P2, barS), s = A.k;
  const L = 2.9 * s * E.outBack(clamp(k), 2);
  actor(() => {
    poly(c, [[b[0] - A.ac[0] * L, b[1] - A.ac[1] * L], [b[0] + A.ac[0] * L, b[1] + A.ac[1] * L]], Math.max(7, s * 0.55), BWC.barDk);
    poly(c, [[b[0] - A.ac[0] * L * 0.97, b[1] - A.ac[1] * L * 0.97], [b[0] + A.ac[0] * L * 0.97, b[1] + A.ac[1] * L * 0.97]], Math.max(5, s * 0.4), BWC.bar);
    poly(c, [[b[0] - A.up[0] * s * 0.9, b[1] - A.up[1] * s * 0.9], [b[0] + A.up[0] * s * 0.9, b[1] + A.up[1] * s * 0.9]], Math.max(6, s * 0.5), BWC.barDk);
  });
}

// ---------------------------------------------------------------- the marshmallow stick, across the palm
// items for the depth sort: the stick in pieces (so the fingers wrap round it) and the marshmallow at its far end, all in
// the hand frame. o: {k 0..1 (there), drop (cm it has fallen, in the ARM frame's -y), spin, toast 0..1, flame 0..1}
function bwStickItems(c, g, P2, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return [];
  const items = [], drop = o.drop || 0;
  const cy = 7.4, cz = 2.5;
  // a point along the stick (x in cm from the palm's middle), projected; `drop` (cm) moves it straight down the screen
  const at = (x) => { const q = P2.ph([x, cy, cz]); return [q[0], q[1] + drop * q[2], q[2], q[3]]; };
  const xs = [6, 4, 2, 0, -2, -4, -6, -8, -10.5, -13, -15];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = at(xs[i]), b = at(xs[i + 1]);
    items.push({ z: (a[3] + b[3]) / 2 + 0.1, fn: () => { fkCap(c, a, b, 0.5 * a[2], 0.5 * b[2], '#B0773E'); } });
  }
  // the marshmallow at the far end
  const m0 = at(-16.2), m1 = at(-20.2), toast = clamp(o.toast || 0);
  items.push({ z: (m0[3] + m1[3]) / 2, fn: () => {
    fkCap(c, m0, m1, 1.75 * m0[2], 1.75 * m1[2], mixH('#FFF6EA', '#D9944A', toast * 0.6));
    paint(() => { const q = [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2]; ellipse(c, q[0] - 0.4 * m0[2], q[1] - 0.6 * m0[2], 0.6 * m0[2], 0.35 * m0[2], 'rgba(255,255,255,0.7)'); });
  } });
  return items;
}
