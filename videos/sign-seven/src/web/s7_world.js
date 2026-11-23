// s7_world.js — Can You Make a 7 in SIGN Language? (23 Nov 2026). Built on one-finger's fist3d.js (the 3D hand and its
// camera), bent-wrist-fist's bwhand.js (the forearm, the glass, the puppeteer) and humanity-sugar-cube's cafe.js (the
// trail cafe at dusk). What is new here (borrow it):
// - `s7Geo`: the hand with EVERY joint of every finger set by hand (b: [knuckle, middle, end] in rad, + toward the palm;
//   lean: the finger's sideways spread) and a thumb that reaches a target (the ring fingertip for a sign-language 7)
//   or rests out; `S7P` holds the poses (straight, relaxed, the ring's 7 bend, the folded pinky of a 2);
// - `s7Reins`: four leather reins from the charioteer's fists in the forearm to the fingertips (palm side), the middle,
//   ring and little fingers' reins bound by a gold knot at the wrist (`knot`), which scissors can cut (`cut`: they
//   spring apart); `s7Charioteer`: the puppeteer in a Roman helmet with a red crest;
// - `s7Marmot`: the cafe's marmot cook (chef's hat, frying pan with a pancake; moods calm / squint / deadpan / smug /
//   panic / shock; paw 'pan' | 'chin' | 'flip'); `s7Plate` (a stack of n pancakes with butter and syrup), `s7Pancake`
//   (one, flying and flipping), `s7PanCake` (the one in the pan);
// - `s7Scissors` (surgical scissors that snip), `s7Sleeve` (a tuxedo sleeve and shirt cuff over the 3D forearm), the
//   violinist's stage (`s7Stage`), the typewriter desk (`s7Desk`: blurred typing hands, flying letters, a DING, the
//   violin sulking in its case), small things (`s7Tag`, `s7Burst`, `s7Ring`, `s7Bubble`).
// Hand frame (fist3d.js): origin = the middle of the wrist, +y toward the fingers, +x toward the thumb, +z out of the palm.
'use strict';

// ---------------------------------------------------------------- poses (rad): [knuckle, middle joint, end joint]
const S7P = {
  straight: [0.04, 0.07, 0.04],
  relax: [0.22, 0.34, 0.2],
  ring7: [0.92, 1.42, 0.78],      // the ring finger curled to meet the thumb (a sign-language 7)
  fold: [1.32, 1.62, 0.92],       // the little finger folded down (with the ring finger held: a 2)
  fist: [1.5, 1.74, 1.05],
};
const S7_SPREAD = { I: -0.17, M: -0.035, R: 0.03, L: 0.27 };   // the 7's fan
const S7_REST = { I: -0.07, M: 0.0, R: 0.05, L: 0.13 };
const s7Mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// A: {b: {I, M, R, L: [b0, b1, b2]}, lean: {I, M, R, L}, thumb: 0 (out, relaxed) .. 1 (on its target), tgt: 'R' | 'L' |
// 'M' | 'I' (the fingertip the thumb meets), tremble: {k: 0..1}, t, chunk (radius factor)}
function s7Geo(A = {}) {
  const t = A.t || 0, G = { f: {} }, B = A.b || {}, LN = A.lean || {}, TR = A.tremble || {}, ch = A.chunk || 1.16;
  for (const k of FK_ORD) {
    const F = FK_F[k], b = B[k] || S7P.relax, tr = TR[k] || 0;
    const shk = tr * (0.07 * vnoise(t * 31 + F.x * 3, 3) + 0.04 * vnoise(t * 57, 7));
    const lean = LN[k] === undefined ? S7_REST[k] : LN[k];
    const r = F.r * ch, rad = [r, r * 0.95, r * 0.88, r * 0.78];
    const pts = [[F.x, F.y, 0]], dirs = [];
    let th = 0, p = pts[0];
    const bb = [b[0] + shk * 0.6, b[1] + shk, b[2] + shk * 0.5];
    for (let i = 0; i < 3; i++) {
      th += bb[i];
      const d = [-Math.sin(lean) * Math.cos(th), Math.cos(lean) * Math.cos(th), Math.sin(th)];
      dirs.push({ d, th });
      p = [p[0] + d[0] * F.len[i], p[1] + d[1] * F.len[i], p[2] + d[2] * F.len[i]];
      pts.push(p);
    }
    G.f[k] = { pts, rad, dirs, lift: 1 };
  }
  // the thumb: out and relaxed, or bent across the palm to press on a fingertip's nail
  const out = [[2.85, 2.2, 0.7], [4.7, 4.6, 1.6], [5.9, 6.6, 2.0], [6.6, 8.3, 2.2]];
  const tk = clamp(A.thumb || 0);
  let pts = out;
  if (tk > 0.001) {
    const tg = A.tgt || 'R', F = G.f[tg];
    // the contact: on the back of the fingertip (its nail), a little toward the camera
    const nail = fkSegPt(G, tg, 2, 0.62, 'back', 1.05);
    const tip = [nail[0] + 0.55, nail[1] - 0.35, nail[2] + 0.75];
    const p0 = out[0];
    const bulge = [1.75, -0.4, 1.45];
    const q1 = fkLerp(p0, tip, 0.36), q2 = fkLerp(p0, tip, 0.72);
    const touch = [p0, [q1[0] + bulge[0], q1[1] + bulge[1], q1[2] + bulge[2]], [q2[0] + bulge[0] * 0.62, q2[1] + bulge[1] * 0.4, q2[2] + bulge[2] * 0.7], tip];
    const e = E.inOutSine(tk);
    pts = out.map((p, i) => fkLerp(p, touch[i], e));
    G.thumbTip = tip;
  }
  G.thumb = { pts, rad: [1.3 * ch / 1.16 * 1.04, 1.1 * ch / 1.16 * 1.04, 0.99 * ch / 1.16 * 1.04, 0.82 * ch / 1.16 * 1.04] };
  return G;
}
// a pose for every finger from a few numbers. o: {ring7 0..1 (the ring curls to the 7), sag 0..1 (the little finger
// sinks; 1 = folded: a 2), up 0..1 (index, middle, little straight up and fanned; 0 = relaxed), ringOnly 0..1 (an open
// hand whose ring finger bends; sag follows it), fist 0..1, waveI/M/R/L (a single finger dips: the free fingers)}
function s7Pose(o = {}) {
  const up = clamp(o.up === undefined ? 1 : o.up), b = {}, lean = {};
  for (const k of FK_ORD) {
    b[k] = s7Mix(S7P.relax, S7P.straight, up);
    lean[k] = lerp(S7_REST[k], S7_SPREAD[k], up * (o.fan === undefined ? 1 : o.fan));
  }
  b.R = s7Mix(b.R, S7P.ring7, clamp(o.ring7 || 0));
  b.L = s7Mix(b.L, S7P.fold, clamp(o.sag || 0));
  if (o.midSag) b.M = s7Mix(b.M, [0.5, 0.7, 0.35], clamp(o.midSag));
  for (const k of FK_ORD) {
    const w = o['wave' + k] || 0;
    if (w) b[k] = [b[k][0] + 0.75 * w, b[k][1] + 0.9 * w, b[k][2] + 0.5 * w];
  }
  if (o.fist) for (const k of FK_ORD) b[k] = s7Mix(b[k], S7P.fist, clamp(o.fist));
  return { b, lean };
}

// ---------------------------------------------------------------- the tuxedo sleeve over the 3D forearm
// depth-sorted items: a black sleeve from u0 to the elbow and a white shirt cuff with a gold cufflink just before it
function s7SleeveItems(c, P2, o = {}) {
  const u0 = o.u0 === undefined ? 0.2 : o.u0, items = [];
  const hullOf = (a, b, grow) => {
    const P = [];
    for (let i = 0; i <= 8; i++) for (const q of bwArmRing(lerp(a, b, i / 8), 0)) P.push(P2.pa([q[0] * grow, q[1], q[2] * grow]));
    return fkHull(P.map((q) => [q[0], q[1]]));
  };
  const zw = P2.pa([0, -BWK.L * (u0 + 0.3), 0])[3];
  items.push({ z: zw + 3.4, fn: () => { c.fillStyle = o.cuff || '#F4F2EE'; fkSmooth(c, hullOf(u0 - 0.035, u0 + 0.04, 1.16)); c.fill(); } });
  items.push({ z: zw + 3.2, fn: () => {
    c.fillStyle = o.col || '#1B1B26'; fkSmooth(c, hullOf(u0 + 0.03, 1, 1.24)); c.fill();
    const q = P2.pa([2.9, -BWK.L * (u0 + 0.005), 1.2]);
    paint(() => { circle(c, q[0], q[1], Math.max(4, q[2] * 0.42), '#E8B83A'); circle(c, q[0] - q[2] * 0.12, q[1] - q[2] * 0.12, Math.max(1.5, q[2] * 0.14), '#FFF2B0'); });
  } });
  return items;
}

// ---------------------------------------------------------------- the reins
// The four finger-bending cords as reins: from the charioteer's fists (screen points; or a point deep in the forearm)
// over the palm side of the wrist and the palm to the pad of each fingertip. The middle, ring and little fingers' reins
// pass through ONE point at the wrist, bound by a gold knot. o: {k (0..1 drawn), knot 0..1, cut 0..1 (the knot snipped:
// the reins spring apart), pull 0..1 (taut and lit), pullK: {I, M, R, L} (which reins pull), fists [[x, y], [x, y]],
// slack 0..1 (the index's rein waves), t, col, glow}
const S7_KNOT = [-0.9, 1.15, 1.18];
function s7ReinPath(P2, G, k, o, j) {
  const F = FK_F[k];
  const nat = [F.x * 0.3, 1.25, 1.12];
  const tied = k !== 'I' ? clamp(o.knot || 0) * (1 - clamp(o.cut || 0)) : 0;
  const w = [lerp(nat[0], S7_KNOT[0] + (j - 2) * 0.22, tied), lerp(nat[1], S7_KNOT[1], tied), lerp(nat[2], S7_KNOT[2], tied)];
  const hand = [w, [F.x * 0.55, 3.6, 1.15], [F.x * 0.85, 6.4, 1.0], [F.x, F.y - 0.2, 0.86]];
  for (const [i, u] of [[0, 0.2], [0, 0.65], [1, 0.12], [1, 0.62], [2, 0.18], [2, 0.7]]) hand.push(fkSegPt(G, k, i, u, 'front', 0.5));
  let start;
  const sy = o.startY === undefined ? -9.5 : o.startY;
  if (o.fists) start = o.fists[j < 2 ? 0 : 1];
  else { const s = P2.pa([F.x * 0.1, sy, 0.9]); start = [s[0], s[1]]; }
  const arm0 = P2.pa([F.x * 0.18, Math.max(sy + 1.2, -2.2), 1.0]);
  const H = hand.map((p) => { const q = P2.ph(p); return [q[0], q[1]]; });
  return { pts: [start, [arm0[0], arm0[1]]].concat(H), knotPt: P2.ph(S7_KNOT), k: P2.ph([0, 4, 1])[2] };
}
function s7Reins(c, g, P2, G, o = {}) {
  const kk = clamp(o.k === undefined ? 1 : o.k);
  if (kk <= 0.01) return null;
  let knotPt = null, scale = 1;
  paint(() => {
    FK_ORD.forEach((k, j) => {
      const R = s7ReinPath(P2, G, k, o, j);
      knotPt = R.knotPt; scale = R.k;
      let P = R.pts;
      // slack: the forearm stretch waves (the index's rein when the others pull; all of them when nothing pulls)
      const sl = k === 'I' ? (o.slackI === undefined ? (o.slack || 0) : o.slackI) : (o.slack || 0);
      if (sl > 0.01) {
        const a = P[0], b = P[1], n = 16, out = [], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        for (let i = 0; i <= n; i++) { const v = i / n, w = sl * R.k * 0.9 * Math.sin(Math.PI * v) * Math.sin(v * Math.PI * 3 + (o.t || 0) * 4 + j); out.push([a[0] + dx * v + nx * w, a[1] + dy * v + ny * w]); }
        P = out.concat(P.slice(2));
      }
      // a cut rein recoils: a little wave near the wrist that settles
      const cut = clamp(o.cut || 0);
      if (cut > 0.01 && k !== 'I') {
        const ring = Math.sin(Math.min(1, cut) * Math.PI * 4) * (1 - cut) * R.k * 0.8;
        P = P.map((q, i) => (i >= 2 && i <= 4 ? [q[0] + ring * (j - 2), q[1]] : q));
      }
      // drawn growing from the forearm toward the tip
      const acc = polyLen(P), L = acc[acc.length - 1] * E.outCubic(kk), Q = [];
      for (let i = 0; i < P.length; i++) { if (acc[i] <= L) Q.push(P[i]); else { Q.push(polyAt(P, acc, L)); break; } }
      const pk = (o.pullK && o.pullK[k] !== undefined ? o.pullK[k] : 1) * clamp(o.pull || 0);
      const wpx = Math.max(5, R.k * 0.42);
      poly(c, Q, wpx * 1.7, rgba('#3A1A0C', 0.85));
      poly(c, Q, wpx, mixH(o.col || '#C9823F', '#FFD36A', pk));
      poly(c, Q.map((q) => [q[0] - wpx * 0.18, q[1] - wpx * 0.18]), wpx * 0.28, rgba('#FFE7B8', 0.55));
      if (pk > 0.01) poly(g, Q, wpx * 2.4, rgba('#FFC85A', 0.3 * pk));
      // a little loop where it ties onto the fingertip
      if (kk > 0.97) { const e = Q[Q.length - 1]; circle(c, e[0], e[1], wpx * 0.95, '#3A1A0C'); circle(c, e[0], e[1], wpx * 0.62, mixH(o.col || '#C9823F', '#FFD36A', pk)); }
    });
  });
  // the gold knot round the three reins (and its two halves flying apart when cut)
  const kn = clamp(o.knot || 0) * kk;
  if (knotPt && kn > 0.01) {
    const s = scale, cut = clamp(o.cut || 0), pop = E.outBack(clamp(kn), 2.2);
    const band = (dx, dy, rot) => {
      c.save(); c.translate(knotPt[0] + dx, knotPt[1] + dy); c.rotate(rot); c.scale(pop, pop);
      rrect(c, -s * 1.15, -s * 0.62, s * 2.3, s * 1.24, s * 0.5); c.fillStyle = '#5A3608'; c.fill();
      rrect(c, -s * 1.0, -s * 0.5, s * 2.0, s * 1.0, s * 0.42); c.fillStyle = mixH('#F2B632', '#FFE58A', clamp(o.glow || 0)); c.fill();
      line(c, -s * 0.55, -s * 0.38, -s * 0.55, s * 0.38, Math.max(2, s * 0.14), '#B57A12'); line(c, s * 0.4, -s * 0.38, s * 0.4, s * 0.38, Math.max(2, s * 0.14), '#B57A12');
      c.restore();
    };
    if (cut < 0.01) actor(() => band(0, 0, 0.12));
    else {
      const f = E.outCubic(cut), dd = s * 4.5 * f;
      actor(() => { band(-dd, dd * 0.4, 0.12 - 1.6 * f); band(dd, dd * 0.7, 0.12 + 1.9 * f); });
    }
    softDot(g, knotPt[0], knotPt[1], s * 3.2, '#FFD45C', 0.35 * kn * (1 - cut));
  }
  return { knot: knotPt, s: scale };
}
// the charioteer: the forearm muscle (bent-wrist-fist's puppeteer) in a Roman helmet with a red crest, his fists where the
// reins start. o: as bwPuppeteer's, plus helmet 0..1, yank 0..1 (he leans back)
function s7Charioteer(c, g, P2, o = {}) {
  const P = bwPuppeteer(c, g, P2, { ...o, bar: null });
  if (!P) return null;
  const hk = clamp(o.helmet === undefined ? 1 : o.helmet) * clamp(o.k === undefined ? 1 : o.k);
  if (hk > 0.01) {
    const s = P.s, hd = P.head, ang = P.ang, pop = E.outBack(hk, 2.2);
    actor(() => {
      c.save(); c.translate(hd[0], hd[1]); c.rotate(ang); c.scale(pop, pop);
      // the dome over the top of his head (his own -y is toward the wrist: the top)
      const w = BWK.pupW * s * 0.36;
      c.beginPath(); c.ellipse(0, s * 1.2, w * 1.12, s * 2.1, 0, Math.PI, 2 * Math.PI); c.closePath();
      c.fillStyle = '#E3A92C'; c.fill();
      rrect(c, -w * 1.2, s * 0.9, w * 2.4, s * 0.75, s * 0.3); c.fillStyle = '#B57A12'; c.fill();
      // the crest: a red brush along the top, front to back
      c.beginPath(); c.moveTo(-w * 1.25, -s * 0.4); c.quadraticCurveTo(-w * 0.2, -s * 4.6, w * 1.3, -s * 0.3);
      c.quadraticCurveTo(0, -s * 2.0, -w * 1.25, -s * 0.4); c.closePath(); c.fillStyle = '#F2413E'; c.fill();
      c.restore();
    });
    paint(() => {
      c.save(); c.translate(hd[0], hd[1]); c.rotate(ang); c.scale(pop, pop);
      const w = BWK.pupW * s * 0.36;
      for (let i = 0; i < 9; i++) { const u = (i + 0.5) / 9; line(c, lerp(-w * 1.1, w * 1.15, u), -s * (0.7 + 2.6 * Math.sin(Math.PI * u)), lerp(-w * 1.1, w * 1.15, u), -s * (0.4 + 0.9 * Math.sin(Math.PI * u)), Math.max(1.5, s * 0.12), '#A81E28'); }
      circle(c, -w * 0.55, s * 0.35, s * 0.22, '#FFF2C0');
      c.restore();
    });
  }
  return P;
}

// ---------------------------------------------------------------- the marmot cook
// (x, y): its feet on the table (world). s: scale (1 = about 250 tall). o: {mood: 'calm'|'squint'|'deadpan'|'smug'|
// 'panic'|'shock', look: [x, y] (-1..1), paw: 'pan'|'chin'|'flip', flip 0..1 (the pan's flick), lean (rad), blink 0..1,
// sweat 0..1, hop (px up), squash, t, cake 0..1 (a pancake in its pan)}
function s7Marmot(c, x, y, s, o = {}) {
  const t = o.t || 0, mood = o.mood || 'calm', look = o.look || [0, 0];
  const breath = Math.sin(t * loopW(2.3)) * 0.015, sq = o.squash || 0;
  const FUR = '#A06A3A', FURDK = '#7A4A24', BELLY = '#E2BE8E', NOSE = '#3A2014';
  c.save(); c.translate(x, y - (o.hop || 0)); c.rotate(o.lean || 0); c.scale(s * (1 + sq * 0.25 + breath), s * (1 - sq * 0.25 - breath));
  // the tail, behind
  actor(() => { c.beginPath(); c.ellipse(52, -26, 34, 18, -0.6, 0, 7); c.fillStyle = FURDK; c.fill(); });
  // the body: a fat pear, and the head on top
  actor(() => {
    c.beginPath(); c.moveTo(0, -205);
    c.bezierCurveTo(70, -205, 92, -120, 86, -60); c.bezierCurveTo(82, -10, 50, 0, 0, 0);
    c.bezierCurveTo(-50, 0, -82, -10, -86, -60); c.bezierCurveTo(-92, -120, -70, -205, 0, -205); c.closePath();
    c.fillStyle = FUR; c.fill();
    // feet
    ellipse(c, -34, -4, 26, 11, FURDK); ellipse(c, 34, -4, 26, 11, FURDK);
  });
  paint(() => { c.beginPath(); c.ellipse(0, -72, 52, 66, 0, 0, 7); c.fillStyle = BELLY; c.fill(); });
  // the head
  const hy = -228;
  actor(() => {
    c.beginPath(); c.ellipse(0, hy, 74, 64, 0, 0, 7); c.fillStyle = FUR; c.fill();
    ellipse(c, -58, hy - 42, 15, 13, FURDK); ellipse(c, 58, hy - 42, 15, 13, FURDK);
  });
  // the chef's hat
  actor(() => {
    rrect(c, -50, hy - 92, 100, 34, 8); c.fillStyle = '#F6F4EE'; c.fill();
    for (const [dx, dy, r] of [[-34, -118, 30], [0, -132, 36], [34, -118, 30]]) circle(c, dx, hy + dy, r, '#FBFAF6');
  });
  paint(() => {
    // the muzzle, the nose, whiskers and the two buck teeth
    ellipse(c, 0, hy + 22, 40, 28, BELLY);
    ellipse(c, 0, hy + 8, 14, 10, NOSE);
    rrect(c, -9, hy + 26, 8, 15, 2); c.fillStyle = '#FFFCF0'; c.fill(); rrect(c, 1, hy + 26, 8, 15, 2); c.fill();
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) line(c, sx * 24, hy + 16 + i * 6, sx * (58 + i * 4), hy + 8 + i * 9, 2, 'rgba(60,30,14,0.6)');
    // the eyes
    const ey = hy - 12, ex = 26, lx = look[0] * 5, ly = look[1] * 4;
    const blink = clamp(o.blink || 0);
    for (const sx of [-1, 1]) {
      const cx = sx * ex;
      if (mood === 'squint') {
        line(c, cx - 11, ey + sx * 0, cx + 11, ey - 2, 4.5, '#1A0E08');
      } else if (mood === 'deadpan') {
        ellipse(c, cx, ey + 2, 10, 9, '#1A0E08'); c.fillStyle = FUR; c.fillRect(cx - 12, ey - 10, 24, 10);
        line(c, cx - 12, ey, cx + 12, ey, 3.5, FURDK);
      } else {
        const big = mood === 'panic' || mood === 'shock' ? 1.45 : 1;
        if (big > 1) circle(c, cx, ey, 13 * big, '#FFFFFF');
        ellipse(c, cx + lx, ey + ly, 9 * big * 0.75, 10 * big * 0.75 * (1 - blink), '#1A0E08');
        if (blink < 0.5) circle(c, cx + lx - 3, ey + ly - 4, 3, '#FFFFFF');
      }
      // brows
      const bt = { calm: 0, squint: 0.5, deadpan: -0.1, smug: 0.25, panic: -0.7, shock: -0.6 }[mood] || 0;
      line(c, cx - 12, ey - 20 + sx * bt * 6, cx + 12, ey - 20 - sx * bt * 6, 4, FURDK);
    }
    // the mouth
    if (mood === 'smug') { c.beginPath(); c.moveTo(-14, hy + 46); c.quadraticCurveTo(4, hy + 54, 18, hy + 42); c.lineWidth = 3.5; c.strokeStyle = NOSE; c.stroke(); }
    else if (mood === 'panic' || mood === 'shock') ellipse(c, 0, hy + 50, 10, 12, '#5A1A14');
    if ((o.sweat || 0) > 0.01) sweatDrop(c, 62, hy - 40, 1.1, clamp(o.sweat));
  });
  // the arms and the pan
  const paw = o.paw || 'pan';
  const fl = clamp(o.flip || 0);
  if (paw === 'chin') {
    actor(() => {
      line(c, -50, -150, -30, hy + 52, 26, FUR); circle(c, -26, hy + 50, 15, FURDK);
      line(c, 50, -150, 64, -96, 26, FUR); circle(c, 66, -92, 14, FURDK);
    });
  } else {
    // the pan in its right paw (screen right), held out at the front; flip lifts and flicks it
    const px = 112 + 18 * fl, py = -128 - 70 * fl, rot = -0.15 - 0.75 * fl;
    actor(() => {
      line(c, 46, -150, px - 26, py + 6, 26, FUR);
      line(c, -46, -150, -20, -110, 26, FUR); circle(c, -16, -106, 14, FURDK);
    });
    actor(() => {
      c.save(); c.translate(px, py); c.rotate(rot);
      line(c, -30, 0, 22, 0, 13, '#2A2A30');
      c.beginPath(); c.ellipse(78, 2, 58, 18, 0, 0, 7); c.fillStyle = '#26262C'; c.fill();
      c.beginPath(); c.ellipse(78, -2, 50, 12, 0, 0, 7); c.fillStyle = '#3C3C46'; c.fill();
      c.restore();
    });
    if ((o.cake === undefined ? 1 : o.cake) > 0.01) actor(() => { c.save(); c.translate(px, py); c.rotate(rot); s7PanCake(c, 78, -8, 0.82); c.restore(); });
    actor(() => circle(c, px - 26, py + 6, 15, FURDK));
  }
  c.restore();
  return { head: [x, y + hy * s], pan: [x + (112 + 18 * fl + 78) * s, y + (-128 - 70 * fl - 8) * s] };
}

// ---------------------------------------------------------------- pancakes
function s7PanCake(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 46, 12, 0, 0, 7); c.fillStyle = '#C9772F'; c.fill();
  c.beginPath(); c.ellipse(0, -3, 42, 9, 0, 0, 7); c.fillStyle = '#E9A651'; c.fill();
  c.restore();
}
// one pancake in the air: (x, y) its centre, s scale, spin (rad: the flip; it narrows to an edge and back)
function s7Pancake(c, x, y, s, spin = 0) {
  const k = Math.cos(spin), w = 62 * s, h = Math.max(4, Math.abs(k) * 18 * s + 5 * s);
  actor(() => {
    c.beginPath(); c.ellipse(x, y, w, h, 0, 0, 7); c.fillStyle = '#C9772F'; c.fill();
  });
  if (Math.abs(k) > 0.25) paint(() => { c.beginPath(); c.ellipse(x, y - h * 0.2 * Math.sign(k), w * 0.9, h * 0.72, 0, 0, 7); c.fillStyle = k > 0 ? '#EDAE5A' : '#D8913E'; c.fill(); });
}
// the plate with a stack of n pancakes: (x, y) the plate's middle on the table (world); land: 0..1 (the top one's squash)
function s7Plate(c, x, y, s, n, o = {}) {
  actor(() => {
    c.beginPath(); c.ellipse(x, y, 130 * s, 34 * s, 0, 0, 7); c.fillStyle = '#E9ECF2'; c.fill();
    c.beginPath(); c.ellipse(x, y - 3 * s, 96 * s, 22 * s, 0, 0, 7); c.fillStyle = '#F8FAFF'; c.fill();
  });
  const th = 15 * s;
  for (let i = 0; i < n; i++) {
    const yy = y - 6 * s - i * th, sq = i === n - 1 ? (o.land || 0) : 0, wob = (o.wobble || 0) * Math.sin(i * 0.9 + (o.t || 0) * 13) * 6 * s * (i / Math.max(1, n));
    actor(() => {
      c.beginPath(); c.ellipse(x + wob, yy, 86 * s * (1 + sq * 0.12), 20 * s * (1 - sq * 0.25), 0, 0, 7); c.fillStyle = '#C9772F'; c.fill();
    });
    paint(() => { c.beginPath(); c.ellipse(x + wob, yy - 5 * s, 80 * s, 15 * s, 0, 0, 7); c.fillStyle = i % 2 ? '#E9A651' : '#EDAE5A'; c.fill(); });
  }
  if (n > 0 && (o.butter === undefined || o.butter)) {
    const ty = y - 6 * s - (n - 1) * th - 8 * s;
    paint(() => {
      // syrup over the top and a drip, a butter pat
      c.beginPath(); c.ellipse(x + 6 * s, ty, 58 * s, 11 * s, 0, 0, 7); c.fillStyle = 'rgba(150,62,10,0.85)'; c.fill();
      c.beginPath(); c.moveTo(x + 52 * s, ty + 2 * s); c.quadraticCurveTo(x + 64 * s, ty + 22 * s, x + 58 * s, ty + 36 * s); c.lineWidth = 9 * s; c.strokeStyle = 'rgba(150,62,10,0.85)'; c.lineCap = 'round'; c.stroke();
      rrect(c, x - 18 * s, ty - 14 * s, 34 * s, 16 * s, 4 * s); c.fillStyle = '#FFE680'; c.fill();
    });
  }
  return { top: [x, y - 6 * s - Math.max(0, n - 1) * th] };
}

// ---------------------------------------------------------------- small things (screen space unless said)
// surgical scissors: (x, y) the pivot, s scale, open 0..1, rot (the direction the blades point)
function s7Scissors(c, x, y, s, open, rot) {
  const a = 0.05 + 0.42 * clamp(open);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (const sg of [-1, 1]) {
    c.save(); c.rotate(sg * a);
    actor(() => {
      // the blade: long, tapering, from the pivot forward
      c.beginPath(); c.moveTo(-8, -9 * sg); c.quadraticCurveTo(80, -14 * sg, 170, -2 * sg); c.lineTo(170, 2 * sg); c.quadraticCurveTo(80, 6 * sg, -8, 9 * sg); c.closePath();
      c.fillStyle = '#C9D2DE'; c.fill();
      // the shank back to the ring handle
      line(c, 0, 0, -78, -10 * sg, 13, '#AEB8C6');
      c.beginPath(); c.ellipse(-104, -16 * sg, 26, 20, 0, 0, 7); c.lineWidth = 11; c.strokeStyle = '#AEB8C6'; c.stroke();
    });
    paint(() => { c.beginPath(); c.moveTo(10, -3 * sg); c.quadraticCurveTo(80, -6 * sg, 160, -1 * sg); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.stroke(); });
    c.restore();
  }
  paint(() => { circle(c, 0, 0, 9, '#5C6676'); circle(c, -2, -2, 3, '#FFFFFF'); });
  c.restore();
}
// a pill tag with an optional leader (screen space)
function s7Tag(txt, x, y, k, col, to, size = 46, icon) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = E.outBack(clamp(k), 2.2);
  ctx.font = `900 ${size}px Montserrat`;
  const iw = icon ? size * 1.1 : 0, w = ctx.measureText(txt).width + size * 0.9 + iw, h = size * 1.45;
  ctx.restore();
  if (to) { screenSpace(); thinLeader([x, y + h * 0.5 * Math.sign(to[1] - y)], to, clamp(k * 1.5 - 0.3), col); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#141428'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.fillText(txt, iw / 2, size * 0.05);
  if (icon) icon(ctx, -w / 2 + size * 0.55 + iw * 0.3, 0, size / 46);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.fillStyle = 'rgba(0,0,0,0.85)'; rrect(gctx, x - w * s / 2 - 8, y - h * s / 2 - 8, w * s + 16, h * s + 16, h * s / 2); gctx.fill();
  gctx.restore();
}
// a small violin icon (for a tag) or a big one: (x, y) its middle, s scale, rot, face: null | 'sad'
function s7Violin(c, x, y, s, rot = 0, face = null) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const body = '#B5551E', dark = '#7A3410';
  c.beginPath();
  c.moveTo(0, -46); c.bezierCurveTo(22, -46, 26, -30, 16, -18); c.bezierCurveTo(10, -10, 10, -4, 16, 4);
  c.bezierCurveTo(30, 18, 26, 46, 0, 46); c.bezierCurveTo(-26, 46, -30, 18, -16, 4); c.bezierCurveTo(-10, -4, -10, -10, -16, -18);
  c.bezierCurveTo(-26, -30, -22, -46, 0, -46); c.closePath(); c.fillStyle = body; c.fill();
  c.fillStyle = '#2A1408'; c.fillRect(-4, -92, 8, 66);
  c.beginPath(); c.ellipse(0, -96, 7, 9, 0, 0, 7); c.fillStyle = dark; c.fill();
  c.fillStyle = '#F3E4C0'; c.fillRect(-7, 22, 14, 5);
  if (face === 'sad') {
    ellipse(c, -9, -6, 5.5, 6.5, '#FFFFFF'); ellipse(c, 9, -6, 5.5, 6.5, '#FFFFFF');
    ellipse(c, -9, -4, 3.5, 4.5, '#1A0A04'); ellipse(c, 9, -4, 3.5, 4.5, '#1A0A04');
    c.beginPath(); c.moveTo(-10, 16); c.quadraticCurveTo(0, 7, 10, 16); c.lineWidth = 3.5; c.strokeStyle = '#1A0A04'; c.lineCap = 'round'; c.stroke();
    line(c, -16, -15, -5, -12, 3, '#1A0A04'); line(c, 16, -15, 5, -12, 3, '#1A0A04');
    ellipse(c, 13, 4, 2.2, 3.4, '#8FD8FF');
  } else {
    c.lineWidth = 2.5; c.strokeStyle = '#2A1408'; c.beginPath(); c.moveTo(-7, -8); c.quadraticCurveTo(-11, 0, -6, 8); c.stroke(); c.beginPath(); c.moveTo(7, -8); c.quadraticCurveTo(11, 0, 6, 8); c.stroke();
  }
  c.restore();
}
// a comic burst with a word (screen space)
function s7Burst(x, y, s, k, word, col = '#4DFFB4', rot = -0.12, size = 104) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.6) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 150 : 96 + 14 * (i % 3); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.lineWidth = size * 0.1; ctx.strokeStyle = '#1A1030'; ctx.strokeText(word, 0, 6); ctx.fillText(word, 0, 6);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.fillStyle = 'rgba(0,0,0,0.8)'; gctx.beginPath(); gctx.ellipse(x, y, 190 * sc, 125 * sc, rot, 0, 7); gctx.fill();
  gctx.restore();
}
// a ring round a point (screen space)
function s7Ring(x, y, r, k, col = '#FF5A6E', t = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4) * (1 + 0.05 * Math.sin(t * 9));
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineWidth = 10; ctx.strokeStyle = rgba(col, clamp(k));
    ctx.beginPath(); ctx.arc(x, y, r * s, 0, 7); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba('#FFFFFF', 0.6 * clamp(k)); ctx.beginPath(); ctx.arc(x, y, r * s + 10, 0, 7); ctx.stroke();
    ctx.restore();
  });
}
// a speech bubble with a tail toward (tx, ty) (screen space)
function s7Bubble(txt, x, y, k, tx, ty, col = '#1A1030', size = 70, rot = -0.06) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `400 ${size}px Anton`;
  const w = ctx.measureText(txt).width + 64, h = size * 1.32;
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#0B0B1A'; ctx.lineWidth = 7;
  const ax = (tx - x) / s, ay = (ty - y) / s, al = Math.hypot(ax, ay) || 1;
  ctx.beginPath(); ctx.moveTo(-w * 0.12, 0); ctx.lineTo(ax * Math.min(1, (al - 10) / al), ay * Math.min(1, (al - 10) / al)); ctx.lineTo(w * 0.12, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.1, h / 2 - 5); ctx.lineTo(w * 0.1, h / 2 - 5); ctx.lineWidth = 12; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(txt, 0, 4);
  ctx.restore();
}

// ---------------------------------------------------------------- the violinist's stage (screen space, painted per frame)
// a dark concert stage: deep red curtains at the sides, a warm wood floor, one spotlight from above on (sx, sy)
function s7Stage(t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1B0C24'); g.addColorStop(0.62, '#2A1230'); g.addColorStop(0.63, '#5A2E1A'); g.addColorStop(1, '#3A1C10');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // floor boards
  for (let i = 0; i < 9; i++) { const y = 1210 + i * i * 9; line(ctx, 0, y, W, y, 2, 'rgba(20,8,4,0.45)'); }
  // curtains
  const sway = Math.sin(t * loopW(3.3)) * 6;
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 0 : W;
    for (let i = 0; i < 5; i++) {
      const x = x0 - side * (40 + i * 46 + sway * (i % 2 ? 1 : -1));
      ctx.beginPath(); ctx.moveTo(x - side * 34, 0); ctx.quadraticCurveTo(x + side * 18, 700, x - side * 10, 1400);
      ctx.lineTo(x + side * 30, 1400); ctx.quadraticCurveTo(x + side * 60, 700, x + side * 26, 0); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#8E1C2C' : '#A8243A'; ctx.fill();
    }
  }
  // the valance across the top
  ctx.fillStyle = '#8E1C2C'; ctx.fillRect(0, 0, W, 300);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(60 + i * 120, 300, 60, 0, Math.PI); ctx.fillStyle = '#A8243A'; ctx.fill(); }
  ctx.fillStyle = '#E3B04B'; for (let i = 0; i < 9; i++) ctx.fillRect(20 + i * 120, 300, 80, 6);
  // the spotlight: a cone and a pool on the floor
  const sx = o.sx || 540, sy = o.sy || 1000;
  const cone = ctx.createLinearGradient(0, 0, 0, sy + 300);
  cone.addColorStop(0, 'rgba(255,236,190,0.0)'); cone.addColorStop(1, 'rgba(255,236,190,0.22)');
  ctx.beginPath(); ctx.moveTo(sx - 60, 300); ctx.lineTo(sx + 60, 300); ctx.lineTo(sx + 420, 1500); ctx.lineTo(sx - 420, 1500); ctx.closePath(); ctx.fillStyle = cone; ctx.fill();
  softDot(ctx, sx, 1430, 420, '#FFE8B0', 0.22);
  softDot(gctx, sx, 330, 120, '#FFF0C8', 0.8);
  softDot(gctx, sx, sy, 380, '#FFE2A0', 0.12);
}

// ---------------------------------------------------------------- the typewriter desk (screen space, painted per frame)
// k: the typing (0 still .. 1 a blur), line (how far the carriage has gone, 0..1), t, letters: [[ch, born, seed]],
// sad (the violin in its case sulks)
function s7Desk(t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2A2F58'); g.addColorStop(0.6, '#3C3462'); g.addColorStop(0.61, '#8A552C'); g.addColorStop(0.86, '#7A4A26'); g.addColorStop(0.861, '#4A2A12'); g.addColorStop(1, '#3A2010');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // wallpaper stripes, a framed music sheet, a night window with the moon
  for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fillRect(i * 96, 0, 40, 1170); }
  rrect(ctx, 120, 470, 230, 290, 8); ctx.fillStyle = '#C9A15A'; ctx.fill(); rrect(ctx, 136, 486, 198, 258, 4); ctx.fillStyle = '#F4ECD6'; ctx.fill();
  for (let r = 0; r < 5; r++) for (let l = 0; l < 5; l++) line(ctx, 152, 520 + r * 46 + l * 6, 318, 520 + r * 46 + l * 6, 1.5, '#5A5040');
  for (let i = 0; i < 9; i++) { const x = 160 + i * 18, y = 520 + ((i * 37) % 180); circle(ctx, x, y + 4, 5, '#2A2418'); line(ctx, x + 4, y + 4, x + 4, y - 22, 2, '#2A2418'); }
  rrect(ctx, 640, 430, 320, 340, 12); ctx.fillStyle = '#141C46'; ctx.fill(); ctx.lineWidth = 18; ctx.strokeStyle = '#3A2616'; ctx.stroke();
  line(ctx, 800, 430, 800, 770, 10, '#3A2616'); line(ctx, 640, 600, 960, 600, 10, '#3A2616');
  circle(ctx, 900, 500, 38, '#F4F0D8'); softDot(gctx, 900, 500, 110, '#E8F0FF', 0.5);
  for (let i = 0; i < 10; i++) circle(ctx, 660 + ((i * 97) % 280), 450 + ((i * 61) % 130), 3, '#FFF6D0');
  // the desk lamp, top left, its pool of light on the desk
  line(ctx, 40, 1180, 80, 860, 14, '#2C2C34'); line(ctx, 80, 860, 150, 800, 14, '#2C2C34');
  ctx.beginPath(); ctx.moveTo(120, 760); ctx.lineTo(230, 790); ctx.lineTo(200, 870); ctx.closePath(); ctx.fillStyle = '#2E8A6A'; ctx.fill();
  softDot(gctx, 196, 846, 100, '#FFD27A', 0.8); softDot(ctx, 470, 1250, 460, '#FFC870', 0.14);
  // the typewriter, big and central (it shakes a little as it types)
  const k = clamp(o.k || 0), tx = 540, ty = 1050, sh = k * 3 * Math.sin(t * 90);
  // the paper in the carriage (it slides left as the line types)
  const shift = 120 - 240 * (o.line || 0);
  actor(() => { rrect(ctx, tx - 190 + shift, ty - 420 + sh, 380, 320, 6); ctx.fillStyle = '#FBF8EE'; ctx.fill(); });
  paint(() => {
    ctx.fillStyle = '#2A2A3A';
    for (let r = 0; r < 6; r++) { const n = r < 5 ? 1 : (o.line || 0); ctx.fillRect(tx - 160 + shift, ty - 380 + r * 40 + sh, 300 * n, 9); }
  });
  actor(() => {
    rrect(ctx, tx - 330, ty - 150 + sh, 660, 84, 34); ctx.fillStyle = '#163428'; ctx.fill();
    rrect(ctx, tx - 300, ty - 90 + sh, 600, 250, 50); ctx.fillStyle = '#1F5442'; ctx.fill();
  });
  paint(() => {
    circle(ctx, tx - 300, ty - 108 + sh, 20, '#C9CED8'); circle(ctx, tx + 300, ty - 108 + sh, 20, '#C9CED8');   // the platen knobs
    for (let r = 0; r < 3; r++) for (let i = 0; i < 10 - r; i++) {
      const kx = tx - 236 + r * 24 + i * 52, ky = ty - 30 + r * 50 + sh, down = k > 0.1 && ((i * 7 + r * 3 + Math.floor(t * 40)) % 5 === 0);
      circle(ctx, kx, ky + (down ? 5 : 0), 19, '#F1E9D2'); circle(ctx, kx, ky + (down ? 5 : 0), 12, '#D9CFB4');
    }
    ctx.font = '900 26px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#E8C66A'; ctx.fillText('SPEEDY', tx, ty + 140 + sh);
  });
  // the two hands typing, in tuxedo sleeves from below: a blur of fingers
  for (const side of [-1, 1]) {
    const hx = tx + side * 150 + Math.sin(t * 55 + side) * 16 * k, hy = ty + 30 + Math.cos(t * 61 + side) * 9 * k;
    actor(() => {
      line(ctx, hx + side * 110, hy + 420, hx + side * 20, hy + 90, 96, '#1B1B26');
      line(ctx, hx + side * 26, hy + 118, hx + side * 8, hy + 62, 100, '#F4F2EE');
      ctx.beginPath(); ctx.ellipse(hx, hy + 20, 80, 62, side * 0.15, 0, 7); ctx.fillStyle = '#EDB08A'; ctx.fill();
    });
    paint(() => {
      for (let i = 0; i < 4; i++) {
        const fx = hx + side * (-54 + i * 34), fy = hy - 40 + Math.sin(t * 70 + i * 2 + side) * 16 * k;
        line(ctx, fx, hy + 10, fx - side * 4, fy - 20, 26, '#E9A884');
        circle(ctx, fx - side * 4, fy - 22, 13, '#F4C2A0');
        if (k > 0.2) for (let m = 1; m <= 3; m++) line(ctx, fx - 22, fy - 20 + m * 13 * k, fx + 22, fy - 20 + m * 13 * k, 3, rgba('#FFFFFF', 0.35 * k));
      }
      // his thumbs along the space bar
      line(ctx, hx - side * 60, hy + 34, hx - side * 92, hy + 10, 24, '#E9A884');
    });
  }
  // speed lines round the machine
  if (k > 0.05) paint(() => {
    for (let i = 0; i < 12; i++) { const a = -Math.PI + (i + 0.5) * Math.PI / 12, r0 = 360, r1 = 430 + 30 * Math.sin(t * 30 + i); line(ctx, tx + Math.cos(a) * r0, ty - 40 + Math.sin(a) * r0 * 0.75, tx + Math.cos(a) * r1, ty - 40 + Math.sin(a) * r1 * 0.75, 7, rgba('#FFFFFF', 0.45 * k)); }
  });
  // letters flying up out of the paper
  for (const L of o.letters || []) {
    const age = t - L[1];
    if (age < 0 || age > 0.85) continue;
    const r = mulberry32(L[2]), vx = (r() - 0.5) * 1000, vy = -600 - r() * 450;
    const x = tx + vx * age, y = ty - 300 + vy * age + 1100 * age * age;
    if (y < 420) continue;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 2 + age * 6);
    ctx.font = '900 66px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 9; ctx.strokeStyle = '#1A1030'; ctx.strokeText(L[0], 0, 0); ctx.fillStyle = '#FFFFFF'; ctx.fillText(L[0], 0, 0);
    ctx.restore();
  }
  // the violin in its open case on the desk, bottom left (below the captions), sulking
  const cx = 330, cy = 1548;
  actor(() => { ctx.beginPath(); ctx.ellipse(cx, cy, 236, 96, -0.06, 0, 7); ctx.fillStyle = '#1E1A24'; ctx.fill(); });
  paint(() => { ctx.beginPath(); ctx.ellipse(cx, cy - 4, 214, 80, -0.06, 0, 7); ctx.fillStyle = '#7A2A50'; ctx.fill(); });
  actor(() => s7Violin(ctx, cx + 20, cy - 2, 1.95, Math.PI / 2 - 0.06, o.sad ? 'sad' : null));
  // the bow beside it
  actor(() => line(ctx, cx - 190, cy + 84, cx + 230, cy + 58, 8, '#5A3218'));
}
