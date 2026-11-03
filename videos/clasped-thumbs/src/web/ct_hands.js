// Clasped hands seen from the front (clasped-thumbs, 3 Nov 2026), after knuckle-cracking's denClasp, bigger and with
// faces. Clasp units: centre (0, 0), the two thumbs crossed on top, eight fingers lying across the backs of the other hand,
// stacked top to bottom, turn about. Hand A comes in from screen left (its fingers point right), hand B from screen right.
//   sh 0..1   which thumb is on top: 0 = B's thumb (his own way), 1 = A's. Moving it shifts every finger one row.
//   pull 0..1 the fingers slide out of each other (a swap passes through it); open 0..1 the hands apart (not clasped)
//   faces 0..1 the faces pop in; mood: a string or a function (digit id) -> mood; look: [x, y] or (id) -> [x, y]
//   squeeze 0..1 they hold tight (a little squash)
// Digit ids: 'At' 'Bt' (thumbs), 'A0'..'A3', 'B0'..'B3' (index .. little). Returns the tips in clasp units.
'use strict';

const CT_ROW = 8.9, CT_Y0 = -28;
const CT_LEN = [0, 4, -2, -11];                   // index, middle, ring, little: how much longer than the index

function ctFingerRows(sh) {
  // B's fingers on rows 0, 2, 4, 6 at sh 0 (his own way: B's thumb on top) and on 1, 3, 5, 7 at sh 1
  const rows = {};
  for (let i = 0; i < 4; i++) { rows['B' + i] = 2 * i + sh; rows['A' + i] = 2 * i + 1 - sh; }
  return rows;
}

// one face, in its own small space: x, y the centre, s its size (1 = finger size), mood, look [-1..1, -1..1], k pop 0..1
function ctFace(c, x, y, s, mood, look, k, blink = 0) {
  if (k <= 0.01) return;
  const sc = s * E.outBack(clamp(k), 2.4);
  c.save(); c.translate(x, y); c.scale(sc, sc);
  const lx = (look && look[0]) || 0, ly = (look && look[1]) || 0;
  const ink = '#2A1418';
  const eyeOpen = mood !== 'happy' && mood !== 'bliss' && blink < 0.5;
  for (const ex of [-2.9, 2.9]) {
    if (eyeOpen) {
      const ry = mood === 'shock' ? 2.9 : mood === 'awk' || mood === 'side' ? 2.0 : 2.5;
      ellipse(c, ex, -1.3, 2.25, ry, '#FFFFFF');
      circle(c, ex + 0.95 * lx, -1.3 + 1.0 * ly + (mood === 'awk' || mood === 'side' ? 0.3 : 0), 1.2, ink);
      if (mood === 'awk' || mood === 'side') { c.beginPath(); c.moveTo(ex - 2.4, -2.6); c.lineTo(ex + 2.4, -2.6); c.lineWidth = 0.75; c.strokeStyle = ink; c.lineCap = 'round'; c.stroke(); }
      if (mood === 'grump') { c.beginPath(); c.moveTo(ex - 2.2, -4.4 + (ex < 0 ? -0.6 : 0.6) * -1); c.lineTo(ex + 2.2, -4.4 + (ex < 0 ? 0.6 : -0.6) * -1); c.lineWidth = 0.9; c.strokeStyle = ink; c.stroke(); }
    } else {
      c.beginPath(); c.arc(ex, -0.6, 1.7, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 0.85; c.strokeStyle = ink; c.lineCap = 'round'; c.stroke();
    }
  }
  c.lineCap = 'round'; c.lineWidth = 0.85; c.strokeStyle = ink;
  c.beginPath();
  if (mood === 'happy' || mood === 'bliss') { c.arc(0, 1.6, 2.0, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); ellipse(c, -4.3, 1.6, 1.3, 0.8, 'rgba(255,110,120,0.55)'); ellipse(c, 4.3, 1.6, 1.3, 0.8, 'rgba(255,110,120,0.55)'); }
  else if (mood === 'shock') { ellipse(c, 0, 2.6, 1.1, 1.4, ink); }
  else if (mood === 'awk' || mood === 'side') { c.moveTo(-2.2, 2.7); c.quadraticCurveTo(-1.1, 2.0, 0, 2.7); c.quadraticCurveTo(1.1, 3.4, 2.2, 2.7); c.stroke(); }
  else if (mood === 'grump') { c.arc(0, 4.4, 1.9, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
  else { c.arc(0, 1.5, 1.6, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
  c.restore();
}

// one finger lying across: root (x0, y) to tip (x1, y + dy), thickness w; sd +1 points right. Returns the tip.
function ctFinger(c, pal, x0, y, x1, dy, w, sd, back) {
  const sk = back ? mixH(pal.skin, pal.skinSh, 0.18) : pal.skin, sh = pal.skinSh;
  // a tapered capsule: outline, then the fill
  const tipW = w * 0.86;
  const pts = (ww, tw) => {
    const nx = 0, ny = 1;
    return [[x0, y - ww / 2], [x1 - sd * tw / 2, y + dy - tw / 2], [x1 - sd * tw / 2, y + dy + tw / 2], [x0, y + ww / 2]];
  };
  const draw = (ww, tw, col) => {
    const p = pts(ww, tw);
    c.beginPath(); c.moveTo(p[0][0], p[0][1]); c.lineTo(p[1][0], p[1][1]);
    c.arc(x1 - sd * tw / 2, y + dy, tw / 2, -Math.PI / 2 * sd, Math.PI / 2 * sd, sd < 0);
    c.lineTo(p[3][0], p[3][1]); c.closePath(); c.fillStyle = col; c.fill();
  };
  draw(w + 2.2, tipW + 2.2, sh);
  draw(w, tipW, sk);
  // the knuckle crease at the root, the joint creases, the nail at the tip
  c.lineCap = 'round'; c.strokeStyle = 'rgba(150,86,62,0.6)'; c.lineWidth = 0.9;
  for (const u of [0.36, 0.66]) {
    const xx = lerp(x0, x1, u), yy = y + dy * u;
    c.beginPath(); c.moveTo(xx - sd * 0.8, yy - w * 0.28); c.quadraticCurveTo(xx + sd * 0.9, yy, xx - sd * 0.8, yy + w * 0.28); c.stroke();
  }
  ellipse(c, x1 - sd * 3.2, y + dy - 0.2, 3.1, tipW * 0.32, mixH(pal.skinHi || '#F2C6A0', '#FFFFFF', 0.25));
  return [x1 - sd * 7.6, y + dy];
}

function ctThumb(c, pal, root, tip, w) {
  line(c, root[0], root[1], tip[0], tip[1], w + 2.4, pal.skinSh);
  line(c, root[0], root[1], tip[0], tip[1], w, pal.skin);
  const dx = tip[0] - root[0], dy = tip[1] - root[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  ellipse(c, tip[0] - ux * 2.6, tip[1] - uy * 2.6, 3.4, 4.2, mixH(pal.skinHi || '#F2C6A0', '#FFFFFF', 0.25), Math.atan2(uy, ux));
  c.lineCap = 'round'; c.strokeStyle = 'rgba(150,86,62,0.6)'; c.lineWidth = 0.9;
  const mx = root[0] + dx * 0.48, my = root[1] + dy * 0.48;
  c.beginPath(); c.moveTo(mx - uy * w * 0.3, my + ux * w * 0.3); c.lineTo(mx + uy * w * 0.3, my - ux * w * 0.3); c.stroke();
  return [tip[0] - ux * 7, tip[1] - uy * 7];
}

// the whole clasp in clasp units (call it translated and scaled to where the hands are)
function ctClasp(c, pal, o = {}) {
  const sh = clamp(o.sh || 0), pull = clamp(o.pull || 0), open = clamp(o.open || 0), sq = clamp(o.squeeze || 0);
  const faces = o.faces || 0, t = o.t || 0;
  const moodOf = (id) => typeof o.mood === 'function' ? o.mood(id) : (o.mood || 'calm');
  const lookOf = (id) => typeof o.look === 'function' ? o.look(id) : (o.look || [0, 0]);
  const apart = 10 * pull + 34 * open;
  const tips = {};
  c.save(); c.scale(1 - 0.05 * sq, 1 + 0.05 * sq);
  // the backs of the two hands
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * (40 + apart), 4); c.rotate(sd * (0.1 + 0.25 * open));
    rrect(c, -32, -40, 64, 84, 27); c.fillStyle = pal.skinSh; c.fill();
    rrect(c, -30 - sd * 1.2, -39, 59, 79, 25); c.fillStyle = pal.skin; c.fill();
    // knuckle bumps along the inner edge
    for (let i = 0; i < 4; i++) ellipse(c, -sd * 21, -28 + i * 17, 4.2, 3.2, rgba(pal.skinHi || '#F2C6A0', 0.55));
    c.restore();
  }
  // eight fingers; at sh 0.5 they pass each other, pulled back
  const rows = ctFingerRows(sh), mid = Math.sin(Math.PI * clamp(sh)) * 0.0;
  const order = Object.keys(rows).sort((p, q) => rows[p] - rows[q]);
  for (const id of order) {
    const sd = id[0] === 'A' ? 1 : -1, i = +id[1];
    const y = CT_Y0 + rows[id] * CT_ROW + (o.wig || 0) * 1.6 * Math.sin(t * 31 + i * 1.9 + (sd > 0 ? 0 : 2));
    const reach = (1 - 0.72 * pull) * (1 - 0.95 * open);
    const x0 = -sd * (13 + apart * 0.3), x1 = x0 + sd * ((63 + CT_LEN[i]) * reach + (1 - reach) * 14) - sd * apart * 0;
    const xx1 = sd > 0 ? Math.max(x1, x0 + 12) : Math.min(x1, x0 - 12);
    const base = [x0 - sd * apart, y];
    tips[id] = ctFinger(c, pal, base[0], base[1], xx1 - sd * apart * (1 - open), 1.6 + 0.8 * sq, 10.6 - 0.8 * (i === 3), sd, sd < 0);
  }
  // the thumbs, crossed on top; the one on top is drawn last and sits higher
  const topA = sh > 0.5;
  const thumb = (sd) => {
    const isTop = (sd > 0) === topA, k = 1 - Math.max(pull, open);
    const root = [-sd * (24 + apart), -32];
    const tip = [lerp(-sd * (24 + apart) + sd * 8, sd * (12 - 4 * isTop), k), lerp(-62, -48 - (isTop ? 7 : 0), k)];
    return ctThumb(c, pal, root, tip, 13.5);
  };
  const first = topA ? -1 : 1, second = -first;
  tips[first > 0 ? 'At' : 'Bt'] = thumb(first);
  tips[second > 0 ? 'At' : 'Bt'] = thumb(second);
  // the faces
  if (faces > 0.01) {
    paint(() => {
      for (const id of Object.keys(tips)) {
        const p = tips[id], isThumb = id[1] === 't';
        const kk = clamp(faces * 1.0 - (isThumb ? 0 : 0.04 * (+id[1] + (id[0] === 'B' ? 0.5 : 0))) * 0);
        ctFace(c, p[0] + (isThumb ? 0 : (id[0] === 'A' ? -2.2 : 2.2)), p[1] + (isThumb ? 0 : -1.0), isThumb ? 1.55 : 1.45, moodOf(id), lookOf(id), kk, o.blink ? o.blink(id) : 0);
      }
    });
  }
  c.restore();
  return tips;
}

// ---------------------------------------------------------------- him, praying (or not), with the clasp in front of his chin
// S: {face, sh, pull, open, faces, mood, look, squeeze, wig, hdx, hdy, hrot, lean, apartArms 0..1 (hands down at his sides)}
// at: [x, y] his feet (world), s his scale. The clasp sits at CT_AT in rig units.
const CT_AT = [0, -326];            // under his chin (rig units)
const CT_SC = 1.12;                 // clasp units per rig unit
function ctHeroAt(cam, t, at, s, S, o = {}) {
  let p = JSON.parse(JSON.stringify(POSES.stand));
  p.lean = S.lean || 0; p.hand = 'fist';
  const cx = CT_AT[0], cy = CT_AT[1] + (S.lift || 0), open = clamp(Math.max(S.open || 0, 1.6 * clamp(S.armsK || 0))), pull = clamp(S.pull || 0);
  const spread = (40 + 10 * pull + 34 * open) * CT_SC;
  const down = clamp(S.down || 0);
  const ak = clamp(S.armsK || 0);
  for (const [k, sd] of [['L', -1], ['R', 1]]) {
    let w = [lerp(cx + sd * (spread + 30), sd * 98, down), lerp(cy + 26, -232, down)];
    let e = [lerp(sd * 128, sd * 104, down), lerp(-246, -300, down)];
    if (S.arms && ak > 0) { const A = S.arms[k]; w = [lerp(w[0], A.w[0], ak), lerp(w[1], A.w[1], ak)]; e = [lerp(e[0], A.e[0], ak), lerp(e[1], A.e[1], ak)]; }
    p = armAt(p, k, e, w);
  }
  const st = { x: at[0], y: at[1], s, pose: p, face: S.face || FACES.calm, blink: S.blink || 0, headDX: S.hdx || 0, headDY: S.hdy || 0,
    headRot: S.hrot || 0, frizz: S.frizz || 0 };
  const r = campChar(cam, st, t, {
    pal: o.pal || PAL, fire: 0, ambient: 0.16,
    post: (c, rr) => {
      if (down > 0.5 || (S.armsK || 0) > 0.55) return;
      // the forearms again over the body, into the hands
      c.save(); c.translate(st.x, st.y); c.scale(s, s);
      const pal = o.pal || PAL;
      for (const k of ['L', 'R']) { const e2 = rr['el' + k], w2 = rr['wr' + k]; line(c, e2[0], e2[1], w2[0], w2[1], 40, pal.coat); }
      for (const k of ['L', 'R']) { const w2 = rr['wr' + k], sd = k === 'L' ? -1 : 1; rrect(c, w2[0] - 22, w2[1] - 20, 44, 40, 14); c.fillStyle = pal.coatSh; c.fill(); }
      c.translate(cx, cy); c.scale(CT_SC, CT_SC);
      S.tips = ctClasp(c, pal, { sh: S.sh, pull, open, faces: S.faces, mood: S.mood, look: S.look, squeeze: S.squeeze, wig: S.wig, t, blink: S.fblink });
      c.restore();
      if (o.post) o.post(c, rr, st);
    },
  });
  return { r, st };
}
