// Why Does the WRONG Finger Move? — the world. Loaded after camp.js (mosquito-bites' night campsite) and before scenes.js.
//   wfKnot(c, o)        his two hands, in "knot units" (centre 0, 0; about 150 wide): crossed at the wrists, then clasped,
//                       then rolled in. Hand A is his RIGHT hand (it sits on the LEFT after the wrists cross), hand B his LEFT.
//                       Fingers A0..A3 / B0..B3 = index .. little. Seen from his own eyes (the POV); the front view mirrors it.
//   wfArmsPov(c, o)     his forearms in yellow sleeves from the bottom of the frame up to the knot, crossed in an X.
//   wfRaccoon(c, o)     the raccoon across the picnic table (front view): moods, a pointing paw, a touching paw, its own knot.
//   wfTable / wfPovBack the picnic table seen from his seat, the lantern, the marshmallows, the campsite out of focus.
//   wfHero(cam, t, at, s, S)   him seen from the front, the knot under his chin (after clasped-thumbs' ctHeroAt).
'use strict';

const WF = { plank: null };
const RAC = { fur: '#8E96AC', furSh: '#6C738A', furHi: '#B8BFD2', belly: '#D9DCE6', mask: '#23242E', earIn: '#E7B7C0',
  nose: '#191920', paw: '#33343F', pawHi: '#4C4D5C', ring: '#2B2D38', white: '#F6F6FA', tongue: '#E0616C', mouth: '#4A1420' };
const WF_A = '#FF7A1A', WF_B = '#2E9BFF';      // x-ray tints: hand A (his right) orange, hand B (his left) blue
const WF_ROW = 9.5, WF_Y0 = -31;
const WF_LEN = [63, 67, 61, 52];                // index, middle, ring, little (knot units)

// ---------------------------------------------------------------- faces on fingertips (after clasped-thumbs' ctFace)
function wfFace(c, x, y, s, mood, look, k) {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 2.4);
  c.save(); c.translate(x, y); c.scale(sc, sc);
  const lx = (look && look[0]) || 0, ly = (look && look[1]) || 0, ink = '#2A1418';
  const closed = mood === 'happy' || mood === 'proud';
  for (const ex of [-2.9, 2.9]) {
    if (!closed) {
      const ry = mood === 'shock' || mood === 'me' ? 2.9 : 2.4;
      ellipse(c, ex, -1.3, 2.25, ry, '#FFFFFF');
      circle(c, ex + 0.95 * lx, -1.3 + 1.0 * ly, mood === 'shock' ? 0.9 : 1.2, ink);
      if (mood === 'focus') { c.beginPath(); c.moveTo(ex - 2.4, -3.9 + (ex < 0 ? -0.5 : 0.5) * -1); c.lineTo(ex + 2.4, -3.9 + (ex < 0 ? 0.5 : -0.5) * -1); c.lineWidth = 0.9; c.strokeStyle = ink; c.lineCap = 'round'; c.stroke(); }
    } else {
      c.beginPath(); c.arc(ex, -0.8, 1.7, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 0.85; c.strokeStyle = ink; c.lineCap = 'round'; c.stroke();
    }
  }
  c.lineCap = 'round'; c.lineWidth = 0.85; c.strokeStyle = ink;
  c.beginPath();
  if (closed) { c.arc(0, 1.6, 2.0, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); ellipse(c, -4.3, 1.6, 1.3, 0.8, 'rgba(255,110,120,0.55)'); ellipse(c, 4.3, 1.6, 1.3, 0.8, 'rgba(255,110,120,0.55)'); }
  else if (mood === 'shock') { ellipse(c, 0, 2.6, 1.1, 1.4, ink); }
  else if (mood === 'me') { c.arc(0, 1.8, 1.7, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke(); }
  else if (mood === 'focus') { c.moveTo(-1.8, 2.6); c.lineTo(1.8, 2.6); c.stroke(); }
  else { c.arc(0, 1.5, 1.6, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
  c.restore();
}

// one finger as a tapered capsule from root (x0, y0) along angle a, length L, root width w. Returns {tip, mid, root}.
function wfFinger(c, pal, x0, y0, a, L, w, back, tint) {
  const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const tw = w * 0.86, x1 = x0 + ux * L, y1 = y0 + uy * L;
  const shape = (ww, tww) => {
    c.beginPath();
    c.moveTo(x0 + nx * ww / 2, y0 + ny * ww / 2);
    c.lineTo(x1 - ux * tww / 2 + nx * tww / 2, y1 - uy * tww / 2 + ny * tww / 2);
    c.arc(x1 - ux * tww / 2, y1 - uy * tww / 2, tww / 2, a + Math.PI / 2, a - Math.PI / 2, true);
    c.lineTo(x0 - nx * ww / 2, y0 - ny * ww / 2);
    c.closePath();
  };
  const sk = back ? mixH(pal.skin, pal.skinSh, 0.16) : pal.skin;
  shape(w + 2.2, tw + 2.2); c.fillStyle = pal.skinSh; c.fill();
  shape(w, tw); c.fillStyle = sk; c.fill();
  if (tint && tint.k > 0.01) { shape(w, tw); c.fillStyle = rgba(tint.col, 0.62 * tint.k); c.fill(); }
  // joint creases and the nail at the tip
  c.lineCap = 'round'; c.strokeStyle = 'rgba(150,86,62,0.6)'; c.lineWidth = 0.9;
  for (const u of [0.36, 0.66]) {
    const xx = x0 + ux * L * u, yy = y0 + uy * L * u;
    c.beginPath(); c.moveTo(xx + nx * w * 0.28 - ux * 0.8, yy + ny * w * 0.28 - uy * 0.8); c.quadraticCurveTo(xx + ux * 0.9, yy + uy * 0.9, xx - nx * w * 0.28 - ux * 0.8, yy - ny * w * 0.28 - uy * 0.8); c.stroke();
  }
  ellipse(c, x1 - ux * 3.4, y1 - uy * 3.4, 3.2, tw * 0.32, mixH(pal.skinHi || '#FFDCC4', '#FFFFFF', 0.25), a);
  return { tip: [x1 - ux * 7.2, y1 - uy * 7.2], mid: [x0 + ux * L * 0.42, y0 + uy * L * 0.42], root: [x0, y0], a };
}

function wfThumb(c, pal, root, tip, w, tint) {
  line(c, root[0], root[1], tip[0], tip[1], w + 2.4, pal.skinSh);
  line(c, root[0], root[1], tip[0], tip[1], w, pal.skin);
  if (tint && tint.k > 0.01) line(c, root[0], root[1], tip[0], tip[1], w, rgba(tint.col, 0.62 * tint.k));
  const dx = tip[0] - root[0], dy = tip[1] - root[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  ellipse(c, tip[0] - ux * 2.6, tip[1] - uy * 2.6, 3.4, 4.2, mixH(pal.skinHi || '#FFDCC4', '#FFFFFF', 0.25), Math.atan2(uy, ux) + Math.PI / 2);
  return [tip[0] - ux * 6, tip[1] - uy * 6];
}

// the rows of the clasp: A's fingers on rows 0, 2, 4, 6 (index on top), B's on 1, 3, 5, 7: twins sit side by side
function wfRow(id) { return 2 * (+id[1]) + (id[0] === 'B' ? 1 : 0); }

// ---------------------------------------------------------------- the hands
// o: {clasp 0..1 (0 = open hands side by side, crossed at the wrists), up 0..1 (thumbs up and out: after the roll),
//     lift: {id: 0..1}, wig: {id: 0..1}, t, xray 0..1, faces: {id: mood}, faceK: {id: 0..1}, look: {id: [x, y]},
//     ring: {id, k, col}, pal, squeeze}
function wfKnot(c, o = {}) {
  const pal = o.pal || PAL, t = o.t || 0, cl = clamp(o.clasp === undefined ? 1 : o.clasp), xk = clamp(o.xray || 0);
  const ce = E.inOutCubic(cl), up = clamp(o.up === undefined ? 1 : o.up);
  const lift = o.lift || {}, wig = o.wig || {}, faces = o.faces || {}, faceK = o.faceK || {}, looks = o.look || {};
  const out = { fingers: {}, back: {} };
  const tintOf = (sd) => (xk > 0.01 ? { col: sd > 0 ? WF_A : WF_B, k: xk } : null);
  // the backs of the hands: A on the left, B on the right; apart and turned (narrower) while open
  for (const sd of [1, -1]) {           // sd +1 = hand A (left side, fingers point right when clasped)
    const cx = -sd * lerp(66, 40, ce), cy = lerp(14, 4, ce), wid = lerp(52, 64, ce);
    c.save(); c.translate(cx, cy); c.rotate(-sd * lerp(-0.12, 0.1, ce));
    rrect(c, -wid / 2 - 2, -42, wid + 4, 88, 27); c.fillStyle = pal.skinSh; c.fill();
    rrect(c, -wid / 2, -41, wid, 83, 25); c.fillStyle = sd > 0 ? pal.skin : mixH(pal.skin, pal.skinSh, 0.1); c.fill();
    const tn = tintOf(sd);
    if (tn) { rrect(c, -wid / 2, -41, wid, 83, 25); c.fillStyle = rgba(tn.col, 0.62 * tn.k); c.fill(); }
    // knuckle bumps along the top while open, along the inner edge once clasped
    for (let i = 0; i < 4; i++) {
      const kx = lerp(-wid / 2 + 9 + i * (wid - 18) / 3, sd * 21, ce), ky = lerp(-34, -28 + i * 17, ce);
      ellipse(c, kx, ky, 4.2, 3.2, rgba(pal.skinHi || '#FFDCC4', 0.55));
    }
    c.restore();
    out.back[sd > 0 ? 'A' : 'B'] = [cx, cy];
  }
  // eight fingers: from pointing up (open) to lying across in rows (clasped). The lifted ones are drawn last, raised.
  const ids = ['A0', 'B0', 'A1', 'B1', 'A2', 'B2', 'A3', 'B3'];
  const geo = {};
  for (const id of ids) {
    const sd = id[0] === 'A' ? 1 : -1, i = +id[1];
    // open: hand A's back faces us on the left (index on its left), B's on the right (index on its right)
    const ox = -sd * 66 + sd * (-21 + i * 14) * 0.95, oy = -24, oa = -Math.PI / 2 + sd * (-0.16 + i * 0.1);
    const kx = -sd * 13, ky = WF_Y0 + wfRow(id) * WF_ROW, ka = sd > 0 ? 0 : Math.PI;
    let a = lerp(oa, sd > 0 ? ka : -Math.PI, ce);
    const x0 = lerp(ox, kx, ce), y0 = lerp(oy, ky, ce);
    const L = WF_LEN[i] * lerp(0.78, 1, ce), w = 12.2 - 1.2 * (i === 3);
    geo[id] = { sd, i, x0, y0, a, L, w };
  }
  const order = ids.slice().sort((p, q) => (lift[p] || 0) - (lift[q] || 0) || wfRow(p) - wfRow(q));
  for (const id of order) {
    const g = geo[id], lk = clamp(lift[id] || 0), wg = clamp(wig[id] || 0);
    let a = g.a + wg * 0.26 * Math.sin(t * 28 + g.i);
    // a lifted finger rises toward us: up the screen, a little bigger, with a shadow where it lay
    if (lk > 0.01) {
      c.save(); c.globalAlpha = 0.28 * lk;
      line(c, g.x0, g.y0 + 2, g.x0 + Math.cos(g.a) * g.L * 0.9, g.y0 + Math.sin(g.a) * g.L * 0.9 + 2, g.w, '#3A1A14');
      c.restore();
    }
    c.save();
    c.translate(g.x0, g.y0); c.scale(1 + 0.26 * lk, 1 + 0.26 * lk); c.translate(-g.x0, -g.y0);
    const f = wfFinger(c, pal, g.x0, g.y0 - 16 * lk, a - g.sd * 0.5 * lk, g.L, g.w, g.sd < 0, tintOf(g.sd));
    c.restore();
    // the finger's points in knot units (with the lift's scale about its root)
    const sc = 1 + 0.26 * lk, mapP = (p) => [g.x0 + (p[0] - g.x0) * sc, g.y0 + (p[1] - g.y0) * sc];
    // motion arcs round a wiggling tip
    if (lk > 0.25 && wg > 0.2) {
      const tp = mapP(f.tip);
      paint(() => {
        c.save(); c.lineCap = 'round'; c.strokeStyle = rgba('#FFFFFF', 0.85 * Math.min(lk, wg)); c.lineWidth = 2.2;
        for (const k of [1, -1]) { c.beginPath(); c.arc(tp[0], tp[1], 13 + 2 * Math.sin(t * 20), -Math.PI / 2 + k * 0.5 - 0.35, -Math.PI / 2 + k * 0.5 + 0.35); c.stroke(); }
        c.restore();
      });
    }
    out.fingers[id] = { tip: mapP(f.tip), mid: mapP(f.mid), root: [g.x0, g.y0], a: f.a };
    // its face
    if (faces[id] && (faceK[id] === undefined || faceK[id] > 0.01)) {
      const tp = out.fingers[id].tip;
      paint(() => wfFace(c, tp[0] - g.sd * 1.5, tp[1] - 1, 1.45 * (1 + 0.16 * lk), faces[id], looks[id] || [0, -0.4], faceK[id] === undefined ? 1 : faceK[id]));
    }
  }
  // the thumbs: down along the hands before the roll, up and out after it
  for (const sd of [1, -1]) {
    const b = out.back[sd > 0 ? 'A' : 'B'];
    const root = [lerp(-sd * 82, b[0] - sd * 8, ce), lerp(-6, -30, ce)];
    const dn = [root[0] - sd * 6, root[1] + 36], upT = [root[0] - sd * 22, root[1] - 30];
    const tip = [lerp(dn[0], upT[0], up), lerp(dn[1], upT[1], up)];
    out.back[(sd > 0 ? 'A' : 'B') + 't'] = wfThumb(c, pal, root, tip, 15.5, tintOf(sd));
  }
  // a target ring round one finger
  if (o.ring && o.ring.k > 0.01 && out.fingers[o.ring.id]) {
    const f = out.fingers[o.ring.id], k = E.outBack(clamp(o.ring.k), 2.2), p = f.mid;
    paint(() => {
      c.save(); c.translate(p[0], p[1]); c.rotate(f.a); c.scale(k, k);
      c.setLineDash([5, 3.4]); c.lineDashOffset = -t * 30;
      c.beginPath(); c.ellipse(0, 0, 25 + 1.4 * Math.sin(t * 9), 10.5, 0, 0, 7); c.lineWidth = 2.6; c.strokeStyle = o.ring.col || '#FFE14A'; c.stroke();
      c.restore();
    });
  }
  return out;
}

// his forearms in the POV: yellow sleeves from the bottom of the frame to the wrists, crossed (A over B), in knot units.
// o: {clasp, xray, spark: 0..1 (a call running up B's arm), pal}
function wfArmsPov(c, o = {}) {
  const pal = o.pal || PAL, ce = E.inOutCubic(clamp(o.clasp === undefined ? 1 : o.clasp)), xk = clamp(o.xray || 0);
  const arm = (sd) => {
    // sd +1 = hand A (his right hand): its wrist on the LEFT, its shoulder off the bottom RIGHT
    const wx = -sd * lerp(62, 44, ce), wy = 40;
    const bx = sd * 150, by = 330;
    const dx = bx - wx, dy = by - wy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const w0 = 30, w1 = 92;
    const quad = (a0, a1, w_0, w_1, col) => {
      const p0 = [wx + ux * a0, wy + uy * a0], p1 = [wx + ux * a1, wy + uy * a1];
      c.beginPath(); c.moveTo(p0[0] + nx * w_0 / 2, p0[1] + ny * w_0 / 2); c.lineTo(p1[0] + nx * w_1 / 2, p1[1] + ny * w_1 / 2);
      c.lineTo(p1[0] - nx * w_1 / 2, p1[1] - ny * w_1 / 2); c.lineTo(p0[0] - nx * w_0 / 2, p0[1] - ny * w_0 / 2); c.closePath();
      c.fillStyle = col; c.fill();
    };
    // the wrist (skin), then the sleeve with its cuff
    quad(-6, 26, 27, 30, pal.skinSh); quad(-6, 25, 24, 27, pal.skin);
    quad(22, L + 40, 40, w1 + 8, pal.coatSh); quad(26, L + 40, 36, w1, pal.coat);
    quad(22, 34, 42, 44, pal.coatDk);
    // a seam down the sleeve
    c.strokeStyle = rgba(pal.coatSh, 0.8); c.lineWidth = 2; c.beginPath();
    c.moveTo(wx + ux * 40 + nx * 6, wy + uy * 40 + ny * 6); c.lineTo(wx + ux * (L + 30) + nx * 18, wy + uy * (L + 30) + ny * 18); c.stroke();
    if (xk > 0.01) {
      paint(() => {
        c.save(); c.globalAlpha = 0.85 * xk;
        quad(-6, L + 40, 36, w1, sd > 0 ? WF_A : WF_B);
        c.restore();
        c.save(); c.globalAlpha = xk;
        c.strokeStyle = sd > 0 ? '#FFD2A8' : '#B8E6FF'; c.lineWidth = 2.4; c.setLineDash([4, 4]);
        c.beginPath(); c.moveTo(wx, wy); c.lineTo(bx + ux * 40, by + uy * 40); c.stroke(); c.restore();
      });
    }
    return { wrist: [wx, wy], base: [bx, by], u: [ux, uy] };
  };
  // B's arm first (under), A's crossed over it
  const B = arm(-1), A = arm(1);
  return { A, B };
}

// a point along B's arm (his LEFT arm, from the bottom LEFT up to the wrist on the RIGHT) and into its twin finger
function wfSparkPath(arms, kn, id) {
  const B = arms.B, f = kn.fingers[id];
  const s0 = [lerp(B.wrist[0], B.base[0], 0.62), lerp(B.wrist[1], B.base[1], 0.62)];
  const P = [s0, [lerp(B.wrist[0], B.base[0], 0.4), lerp(B.wrist[1], B.base[1], 0.4)], [lerp(B.wrist[0], B.base[0], 0.2), lerp(B.wrist[1], B.base[1], 0.2)], B.wrist];
  const bb = kn.back.B;
  P.push([bb[0], bb[1] + 10]);
  if (f) { P.push(f.root); P.push(f.mid); }
  return P;
}

// ---------------------------------------------------------------- the raccoon (front view, facing us)
// Units: its seat at (0, 0), about 290 tall. o: {t, mood: calm|smirk|laugh|shock|deadpan|focus|curious, look [x, y],
// rock (leans back laughing), headRot, point: {k, to: [x, y] in its units}, touch, blink, knot (its own paws knotted)}
function wfRaccoon(c, o = {}) {
  const t = o.t || 0, mood = o.mood || 'calm', lk = o.look || [0, 0];
  c.save();
  c.rotate(-0.12 * (o.rock || 0));
  const skipBody = o.part === 'arm';
  if (!skipBody) {
  // the tail, behind, curling up on its left (screen right)
  const sw = 0.12 * Math.sin(t * 2.3) + 0.35 * (o.rock || 0) * Math.sin(t * 17);
  c.save(); if (o.tailLeft) c.scale(-1, 1); c.translate(52, -40); c.rotate(-0.4 + sw);
  const tailPts = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; tailPts.push([u * 150, -Math.sin(u * 2.4) * 70 - u * 40]); }
  for (let i = 0; i < tailPts.length; i++) {
    const u = i / (tailPts.length - 1), [x, y] = tailPts[i], r = 30 - 6 * Math.abs(u - 0.45) * 2;
    circle(c, x, y, r + 2, RAC.furSh);
  }
  for (let i = 0; i < tailPts.length; i++) {
    const u = i / (tailPts.length - 1), [x, y] = tailPts[i], r = 30 - 6 * Math.abs(u - 0.45) * 2;
    circle(c, x, y, r, (Math.floor(u * 6.5) % 2) ? RAC.ring : RAC.fur);
  }
  c.restore();
  // the body
  ellipse(c, 0, -92, 82, 98, RAC.furSh);
  ellipse(c, 0, -94, 78, 94, RAC.fur);
  ellipse(c, 0, -72, 50, 64, RAC.belly);
  // its feet
  ellipse(c, -40, -6, 26, 14, RAC.paw); ellipse(c, 40, -6, 26, 14, RAC.paw);
  }
  // the arms: resting on its knees, or pointing / touching toward `point.to`
  const shoulder = (sd) => [sd * 56, -138];
  const rest = (sd) => [sd * 46, -44];
  const drawArm = (sd, hand, mode) => {
    const s0 = shoulder(sd);
    const mx = (s0[0] + hand[0]) / 2 + sd * 16, my = (s0[1] + hand[1]) / 2 + 10;
    c.lineCap = 'round';
    c.strokeStyle = RAC.furSh; c.lineWidth = 34; c.beginPath(); c.moveTo(s0[0], s0[1]); c.quadraticCurveTo(mx, my, hand[0], hand[1]); c.stroke();
    c.strokeStyle = RAC.fur; c.lineWidth = 29; c.beginPath(); c.moveTo(s0[0], s0[1]); c.quadraticCurveTo(mx, my, hand[0], hand[1]); c.stroke();
    // the dark "glove" over the wrist and paw
    const dx = hand[0] - mx, dy = hand[1] - my, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    line(c, hand[0] - ux * 26, hand[1] - uy * 26, hand[0], hand[1], 26, RAC.paw);
    circle(c, hand[0], hand[1], 17, RAC.paw);
    if (mode === 'point') {
      // one long finger with a claw, out along the arm
      line(c, hand[0], hand[1], hand[0] + ux * 40, hand[1] + uy * 40, 10, RAC.paw);
      line(c, hand[0] + ux * 40, hand[1] + uy * 40, hand[0] + ux * 47, hand[1] + uy * 47, 4, '#E8E2D2');
      for (const k of [-1, 1]) circle(c, hand[0] + ux * 8 - uy * k * 12, hand[1] + uy * 8 + ux * k * 12, 7, RAC.pawHi);
    } else {
      for (const k of [-1.5, -0.5, 0.5, 1.5]) circle(c, hand[0] + ux * 13 - uy * k * 7, hand[1] + uy * 13 + ux * k * 7, 5.5, RAC.pawHi);
    }
  };
  const pt = o.point || { k: 0 };
  const pk = clamp(pt.k || 0);
  const part = o.part || 'all';
  if (part === 'arm') {
    // only the pointing (or touching) paw, over the table and his hands
    if (pk > 0.01) {
      const to = pt.to || [-60, -120];
      const hand = [lerp(rest(-1)[0], to[0], pk), lerp(rest(-1)[1], to[1], pk)];
      drawArm(-1, hand, pt.touch ? 'rest' : 'point');
    }
    c.restore();
    return;
  }
  // its right paw (screen left) points; the other rests (or both hold its own little knot)
  if (o.knot && o.knot.simple) {
    // forearms crossed in front of the belly, the paws clasped in one dark ball with four finger stubs on top;
    // the stub on the left is ringed (what he points at), the one on the right pops up and wiggles (its twin)
    for (const sd of [-1, 1]) {
      const s0 = shoulder(sd);
      c.strokeStyle = RAC.furSh; c.lineWidth = 32; c.lineCap = 'round';
      c.beginPath(); c.moveTo(s0[0], s0[1]); c.quadraticCurveTo(sd * 70, -40, -sd * 20, -70); c.stroke();
      c.strokeStyle = RAC.fur; c.lineWidth = 27;
      c.beginPath(); c.moveTo(s0[0], s0[1]); c.quadraticCurveTo(sd * 70, -40, -sd * 20, -70); c.stroke();
    }
    const kk = clamp(o.knot.k || 0), cy = -78;
    c.save(); c.translate(0, cy + 10); c.scale(1.35, 1.35); c.translate(0, -(cy + 10));
    ellipse(c, 0, cy, 44, 30, '#1D1E26'); ellipse(c, 0, cy - 2, 41, 27, RAC.paw);
    const stubs = [-27, -9, 9, 27];
    stubs.forEach((sx, i) => {
      const up = i === 2 ? kk : 0, wg = i === 2 ? kk * (0.75 + Math.sin(t * 26) * 0.3) : 0;
      c.save(); c.translate(sx, cy - 20); c.rotate(wg);
      const L = 14 + 26 * up;
      rrect(c, -6.5, -L, 13, L + 8, 6.5); c.fillStyle = '#1D1E26'; c.fill();
      rrect(c, -5.2, -L + 1, 10.4, L + 6, 5.2); c.fillStyle = i === 2 && up > 0.2 ? '#B8BCCC' : '#8A8C9E'; c.fill();
      ellipse(c, 0, -L + 4, 3.2, 2.2, 'rgba(255,255,255,0.55)');
      if (up > 0.3) paint(() => wfFace(c, 0, -L + 7, 1.2, 'me', [0.3, -0.5], up));
      c.restore();
    });
    if (o.knot.ring > 0.01) paint(() => {
      c.save(); c.setLineDash([5, 3.5]); c.lineDashOffset = -t * 30; c.lineWidth = 3.2; c.strokeStyle = '#FF5A6E';
      c.beginPath(); c.ellipse(-9, cy - 26, 14, 20, 0, 0, 7); c.stroke(); c.restore();
    });
    c.restore();
  } else if (o.knot) {
    // forearms crossed in front of the belly, the paws knotted together
    for (const sd of [-1, 1]) {
      const s0 = shoulder(sd);
      c.strokeStyle = RAC.furSh; c.lineWidth = 32; c.lineCap = 'round';
      c.beginPath(); c.moveTo(s0[0], s0[1]); c.quadraticCurveTo(sd * 64, -60, -sd * 24, -104); c.stroke();
      c.strokeStyle = RAC.fur; c.lineWidth = 27;
      c.beginPath(); c.moveTo(s0[0], s0[1]); c.quadraticCurveTo(sd * 64, -60, -sd * 24, -104); c.stroke();
    }
    c.save(); c.translate(0, -132); c.scale(0.8, 0.8);
    const PAWPAL = Object.assign({}, PAL, { skin: '#5A5C6C', skinSh: '#26272F', skinHi: '#8A8CA0' });
    o.knotOut = wfKnot(c, { clasp: 1, up: 1, pal: PAWPAL, lift: o.knot.lift || {}, wig: o.knot.wig || {}, t, faces: o.knot.faces, faceK: o.knot.faceK, look: o.knot.look });
    c.restore();
  } else {
    drawArm(1, rest(1), 'rest');
    if (pk > 0.01 && part === 'body') { /* the pointing arm comes in the 'arm' pass */ }
    else if (pk > 0.01) {
      const to = pt.to || [-60, -120];
      const hand = [lerp(rest(-1)[0], to[0], pk), lerp(rest(-1)[1], to[1], pk)];
      drawArm(-1, hand, pt.touch ? 'rest' : 'point');
    } else drawArm(-1, rest(-1), 'rest');
  }
  // the head
  c.save(); c.translate(0, -214); c.rotate(o.headRot || 0);
  // ears
  for (const sd of [-1, 1]) {
    c.beginPath(); c.moveTo(sd * 30, -50); c.quadraticCurveTo(sd * 52, -104, sd * 76, -78); c.quadraticCurveTo(sd * 80, -50, sd * 66, -30); c.closePath();
    c.fillStyle = RAC.mask; c.fill();
    c.beginPath(); c.moveTo(sd * 40, -50); c.quadraticCurveTo(sd * 55, -86, sd * 68, -72); c.quadraticCurveTo(sd * 70, -52, sd * 60, -40); c.closePath();
    c.fillStyle = RAC.earIn; c.fill();
  }
  // the head shape with cheek fluff
  ellipse(c, 0, 0, 92, 70, RAC.furSh);
  ellipse(c, 0, -2, 88, 66, RAC.fur);
  for (const sd of [-1, 1]) {
    c.beginPath(); c.moveTo(sd * 60, -20); c.lineTo(sd * 104, 10); c.lineTo(sd * 76, 18); c.lineTo(sd * 98, 34); c.lineTo(sd * 56, 40); c.closePath(); c.fillStyle = RAC.white; c.fill();
  }
  // white brows over the mask, the mask, the muzzle
  paint(() => {
    ellipse(c, 0, -30, 66, 22, RAC.white);
    c.beginPath(); c.moveTo(-84, -4); c.quadraticCurveTo(-60, -30, -26, -18); c.quadraticCurveTo(0, -8, 26, -18); c.quadraticCurveTo(60, -30, 84, -4);
    c.quadraticCurveTo(62, 26, 30, 18); c.quadraticCurveTo(0, 8, -30, 18); c.quadraticCurveTo(-62, 26, -84, -4); c.closePath();
    c.fillStyle = RAC.mask; c.fill();
    ellipse(c, 0, 26, 40, 30, RAC.white);
    // the eyes
    const lx = clamp(lk[0], -1, 1), ly = clamp(lk[1], -1, 1);
    const shut = mood === 'laugh' || (o.blink || 0) > 0.5;
    for (const sd of [-1, 1]) {
      const ex = sd * 36, ey = -4;
      if (shut) {
        c.beginPath(); c.arc(ex, ey + 4, 11, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 4.5; c.strokeStyle = RAC.white; c.lineCap = 'round'; c.stroke();
        continue;
      }
      const big = mood === 'shock' ? 1.3 : mood === 'curious' ? 1.12 : 1;
      ellipse(c, ex, ey, 15 * big, 15 * big, RAC.white);
      circle(c, ex + lx * 5, ey + ly * 5, (mood === 'shock' ? 5.5 : 8.5), '#15131C');
      circle(c, ex + lx * 5 - 2.5, ey + ly * 5 - 3, 2.6, '#FFFFFF');
      // lids: smirk and deadpan are half shut, focus narrows
      const lid = mood === 'deadpan' ? 0.55 : mood === 'smirk' ? 0.38 : mood === 'focus' ? 0.45 : 0;
      if (lid > 0) { c.beginPath(); c.rect(ex - 17 * big, ey - 17 * big, 34 * big, 34 * big * lid); c.fillStyle = RAC.mask; c.fill(); }
    }
    // nose and mouth
    c.beginPath(); c.moveTo(-11, 14); c.quadraticCurveTo(0, 8, 11, 14); c.quadraticCurveTo(8, 26, 0, 27); c.quadraticCurveTo(-8, 26, -11, 14); c.closePath(); c.fillStyle = RAC.nose; c.fill();
    circle(c, -3, 15, 2.4, 'rgba(255,255,255,0.7)');
    c.lineCap = 'round'; c.strokeStyle = RAC.mouth; c.lineWidth = 3;
    if (mood === 'laugh') { ellipse(c, 0, 40, 15, 12, RAC.mouth); ellipse(c, 0, 45, 9, 5, RAC.tongue); }
    else if (mood === 'shock') { ellipse(c, 0, 44, 9, 13, RAC.mouth); }
    else if (mood === 'smirk') { c.beginPath(); c.moveTo(-12, 36); c.quadraticCurveTo(2, 42, 16, 30); c.stroke(); }
    else if (mood === 'focus') { c.beginPath(); c.moveTo(-10, 37); c.lineTo(10, 37); c.stroke(); ellipse(c, 7, 41, 5, 4, RAC.tongue); }
    else if (mood === 'deadpan') { c.beginPath(); c.moveTo(-11, 38); c.lineTo(11, 38); c.stroke(); }
    else { c.beginPath(); c.moveTo(0, 27); c.lineTo(0, 33); c.moveTo(-10, 36); c.quadraticCurveTo(0, 41, 10, 36); c.stroke(); }
    // whiskers
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.6;
    for (const sd of [-1, 1]) for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(sd * 22, 28 + k * 4); c.lineTo(sd * 58, 22 + k * 10); c.stroke(); }
    // laugh tears
    if (mood === 'laugh') for (const sd of [-1, 1]) { const u = (t * 2.2 + (sd > 0 ? 0.5 : 0)) % 1; ellipse(c, sd * (52 + 14 * u), 4 + 30 * u, 4, 6, rgba('#9FE8FF', 1 - u)); }
  });
  c.restore();
  c.restore();
}

// the raccoon at (x, y) in the current world camera, scale s, as an actor (rim light, shadows); returns its knot, if any
function wfRaccoonAt(x, y, s, o) {
  let res = null;
  actor(() => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); wfRaccoon(ctx, o); res = o.knotOut || null; ctx.restore(); });
  return res;
}

// ---------------------------------------------------------------- the picnic table, the props
function initWf() {
  const rng = mulberry32(4411);
  // a plank texture: wood grain lines, knots
  const cv = mkCanvas(600, 160), c = cv.getContext('2d');
  c.fillStyle = '#A0602F'; c.fillRect(0, 0, 600, 160);
  for (let i = 0; i < 26; i++) {
    const y = rng() * 160, a = 0.18 + rng() * 0.25;
    c.strokeStyle = `rgba(90,44,18,${a})`; c.lineWidth = 1 + rng() * 2.5;
    c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= 600; x += 30) c.lineTo(x, y + 6 * Math.sin(x * 0.01 + i) + (rng() - 0.5) * 2); c.stroke();
  }
  for (let i = 0; i < 3; i++) { const x = 80 + rng() * 440, y = 30 + rng() * 100; ellipse(c, x, y, 16, 7, 'rgba(80,36,14,0.6)'); ellipse(c, x, y, 8, 3.5, 'rgba(60,26,10,0.7)'); }
  WF.plank = cv;
}

// the table top seen from his seat: planks running away from him toward the raccoon. Far edge at y0, in POV world coords.
function wfTable(t, o = {}) {
  const c = ctx, y0 = o.y0 || 1090, vx = 540, vy = 520;
  const far = [110, 970];
  const at = (x, y) => [vx + (x - vx) * (y - vy) / (y0 - vy), y];   // a line toward the vanishing point
  // the planks: five, with dark gaps
  const near = 2120;
  for (let i = 0; i < 5; i++) {
    const xa = lerp(far[0], far[1], i / 5) + 3, xb = lerp(far[0], far[1], (i + 1) / 5) - 3;
    const p0 = [xa, y0], p1 = [xb, y0], p2 = at(xb, near), p3 = at(xa, near);
    // at(): x at the near line from the far x
    const q2 = [vx + (xb - vx) * (near - vy) / (y0 - vy), near], q3 = [vx + (xa - vx) * (near - vy) / (y0 - vy), near];
    c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.lineTo(q2[0], q2[1]); c.lineTo(q3[0], q3[1]); c.closePath();
    c.fillStyle = ['#6F4A36', '#684331', '#77503A', '#63402F', '#6C4834'][i]; c.fill();
    c.save(); c.clip(); c.globalAlpha = 0.35;
    for (let k = 0; k < 6; k++) c.drawImage(WF.plank, xa - 400, y0 + k * 160 * (1 + k * 0.6), 1100, 160 * (1 + k * 0.6));
    c.restore();
  }
  // the far edge (its thickness) and the lantern's warm pool
  c.fillStyle = '#3E2618'; c.fillRect(far[0] - 6, y0 - 4, far[1] - far[0] + 12, 18);
  c.fillStyle = '#8A5E40'; c.fillRect(far[0] - 6, y0 - 6, far[1] - far[0] + 12, 6);
  const lp = o.lamp || [850, 1120];
  softDot(c, lp[0], lp[1] + 40, 300, '#FFB050', 0.22);
  // moonlight on the near planks, cool, so his warm skin stands off them
  softDot(c, 300, 1700, 700, '#6F8CFF', 0.10);
}

// the lantern on the table (a practical light: in the glow layer)
function wfLantern(x, y, s, t) {
  const c = ctx, fl = 0.9 + 0.07 * Math.sin(t * 9.3) + 0.04 * Math.sin(t * 21.1);
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 4, 46, 10, 'rgba(40,16,8,0.45)');
  rrect(c, -34, -12, 68, 16, 6); c.fillStyle = '#2C3A4A'; c.fill();
  rrect(c, -26, -96, 52, 86, 14); c.fillStyle = 'rgba(255,214,140,0.95)'; c.fill();
  for (const sx of [-26, 26]) line(c, sx, -96, sx, -12, 6, '#2C3A4A');
  rrect(c, -32, -108, 64, 16, 7); c.fillStyle = '#2C3A4A'; c.fill();
  c.beginPath(); c.arc(0, -120, 18, Math.PI, 0); c.lineWidth = 4; c.strokeStyle = '#2C3A4A'; c.stroke();
  ellipse(c, 0, -52, 9, 20, '#FFF6D8');
  c.restore();
  softDot(gctx, x, y - 52 * s, 150 * s * fl, '#FFB45A', 0.75);
  softDot(gctx, x, y - 52 * s, 50 * s, '#FFF0C0', 0.9);
}

// a bag of marshmallows (the raccoon's reason to be here), spilling
function wfMarsh(x, y, s, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 6, 70, 12, 'rgba(40,16,8,0.4)');
  c.beginPath(); c.moveTo(-50, 0); c.lineTo(-44, -110); c.lineTo(40, -118); c.lineTo(52, 0); c.closePath(); c.fillStyle = '#E8EEF8'; c.fill();
  c.fillStyle = '#3D8BFF'; c.fillRect(-46, -86, 94, 34);
  c.fillStyle = '#FFFFFF'; c.font = '900 22px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MALLOWS', 2, -69);
  for (const [mx, my] of [[70, -6], [96, -2], [84, -22]]) { rrect(c, mx - 15, my - 13, 30, 24, 8); c.fillStyle = '#F7F1EA'; c.fill(); rrect(c, mx - 15, my - 13, 30, 8, 4); c.fillStyle = '#FFFFFF'; c.fill(); }
  c.restore();
}

// an enamel mug
function wfMug(x, y, s, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 4, 40, 9, 'rgba(40,16,8,0.4)');
  rrect(c, -30, -64, 60, 66, 10); c.fillStyle = '#E8343C'; c.fill();
  ellipse(c, 0, -64, 30, 8, '#F4EDE6'); ellipse(c, 0, -63, 24, 5, '#5A3418');
  c.beginPath(); c.arc(32, -34, 15, -1.2, 1.2); c.lineWidth = 7; c.strokeStyle = '#E8343C'; c.stroke();
  for (let i = 0; i < 3; i++) { const u = ((t * 0.5 + i / 3) % 1); c.strokeStyle = rgba('#FFFFFF', 0.25 * (1 - u)); c.lineWidth = 4; c.beginPath(); c.moveTo(-8 + i * 8, -72 - u * 60); c.quadraticCurveTo(4 + i * 8, -90 - u * 60, -6 + i * 8, -110 - u * 60); c.stroke(); }
  c.restore();
}

// the campsite behind the table, out of focus, its camera following the POV camera a little (parallax)
function wfPovBack(cam, t) {
  const bg = { x: 640 + (cam.x - 540) * 0.22, y: 1010 + (cam.y - 960) * 0.18, zoom: 1.55 * (1 + (cam.zoom - 1) * 0.2), rot: 0 };
  campBack(bg, t, { soft: 1, fire: 0.5, lights: 1 });
  // the campfire, far behind on the right of the raccoon: a warm blur at the treeline (never behind his hands)
  screenSpace();
  const fl = 0.86 + 0.1 * Math.sin(t * 11) + 0.06 * Math.sin(t * 23.7);
  const fx = 820 - (cam.x - 540) * 0.4, fy = 880 - (cam.y - 960) * 0.25;
  softDot(ctx, fx, fy, 150, '#FF8A3C', 0.45 * fl);
  softDot(ctx, fx, fy + 10, 60, '#FFD27A', 0.7 * fl);
}

// ---------------------------------------------------------------- him, from the front, the knot under his chin
// S: {face, hdx, hdy, hrot, lean, knot: wfKnot options, point: 0..1 (the button: his right arm points at the raccoon)}
const WF_AT = [0, -330];          // the knot under his chin (rig units)
const WF_KS = 1.05;               // knot units per rig unit in the front view
function wfHero(cam, t, at, s, S, o = {}) {
  let p = JSON.parse(JSON.stringify(POSES.stand));
  p.lean = S.lean || 0; p.hand = 'none';
  const cx = WF_AT[0], cy = WF_AT[1];
  const pt = clamp(S.point || 0);
  // crossed: the screen-left arm (his right) reaches to the wrist on the screen-right, and the other way round
  for (const [k, sd] of [['L', -1], ['R', 1]]) {
    let e = [sd * 120, -246], w = [cx - sd * 50, cy + 44];
    if (pt > 0 && k === 'L') { e = [lerp(e[0], -128, pt), lerp(e[1], -300, pt)]; w = [lerp(w[0], -196, pt), lerp(w[1], -250, pt)]; }
    if (pt > 0 && k === 'R') { e = [lerp(e[0], 104, pt), lerp(e[1], -300, pt)]; w = [lerp(w[0], 98, pt), lerp(w[1], -232, pt)]; }
    p = armAt(p, k, e, w);
  }
  if (pt > 0.5) { p.handL = 'point'; p.handR = 'open'; }
  const st = { x: at[0], y: at[1], s, pose: p, face: S.face || FACES.calm, blink: S.blink || 0, headDX: S.hdx || 0, headDY: S.hdy || 0,
    headRot: S.hrot || 0 };
  let kn = null;
  const r = campChar(cam, st, t, {
    pal: o.pal || PAL, fire: 0.8, ambient: 0.1,
    post: (c, rr) => {
      if (pt > 0.5) return;
      const pal = o.pal || PAL;
      c.save(); c.translate(st.x, st.y); c.scale(s, s);
      // the forearms again, over the body, crossing into the knot: the one from screen-right first, his right over it
      for (const k of ['R', 'L']) { const e2 = rr['el' + k], w2 = rr['wr' + k]; line(c, e2[0], e2[1], w2[0], w2[1], 42, pal.coatSh); line(c, e2[0], e2[1], w2[0], w2[1], 37, pal.coat); }
      for (const k of ['R', 'L']) { const w2 = rr['wr' + k]; ellipse(c, w2[0], w2[1], 22, 18, pal.coatDk); }
      c.translate(cx, cy); c.scale(-WF_KS, WF_KS);          // mirrored: we face him
      kn = wfKnot(c, Object.assign({ clasp: 1, up: 1, t, pal }, S.knot || {}));
      c.restore();
    },
  });
  return { r, st, kn };
}
// a knot point (knot units) -> world, in the front view
function wfKnotWorld(st, p) { return toWorld(st, [WF_AT[0] - p[0] * WF_KS, WF_AT[1] + p[1] * WF_KS]); }
