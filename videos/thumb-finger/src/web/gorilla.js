// Does Your Finger Move When You Bend Your THUMB? Short: a gorilla (a western lowland gorilla, cartoon) who sits beside him
// on the couch, seen from the front, in "gorilla units": the middle of its head is the origin, the head about 120 units
// wide, the body down to y 430. Call it inside actor(); its face is paint.
//   tfGorilla(c, x, y, s, t, o)   x, y: its head's middle (world), s: scale. o = {
//     look (-1..1, its eyes: + = toward the screen's right), blink 0..1, brow 0..1 (raised: surprise), grin 0..1 (a wide toothy
//     grin), huff 0..1 (puffed lips: unimpressed), nod (radians, its head tips), lean,
//     arm 0..1 (an arm comes up: forearm up beside its head, palm to us; armSide 1 = its left (screen right), -1 = its right),
//     hand (a wtHand description for that hand: tb, curl, glass, fork, pull...), handS,
//     drum 0..1 (both arms to the chest: chest drumming) and drumT (seconds since the drum started), rimCol}
//   GORPAL: the palette its hand takes (tfhand.js)
// Returns {head: [x, y] world, handTip(q): a hand-unit point of the raised hand -> world, P (the hand's points)}
'use strict';

const GOR = { fur: '#24212A', furHi: '#3A3542', furLo: '#141218', skin: '#3E3844', skinHi: '#5C5464', skinLo: '#2A252E', crest: '#2C2832' };
const GORPAL = { handSkin: '#3E3844', handLine: 'rgba(10,8,14,0.95)', handPad: 'rgba(110,100,120,0.55)', handCrease: 'rgba(16,12,20,0.75)',
  glass: '#3A3046', fur: 'rgba(20,18,24,0.9)' };

function tfGorilla(c, x, y, s, t, o = {}) {
  const out = {};
  const arm = E.inOutSine(clamp(o.arm || 0)), dr = clamp(o.drum || 0), dt = o.drumT || 0;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.lean || 0);
  // ---- the body: huge shoulders, a broad chest, arms
  const body = (cc, col) => {
    cc.beginPath();
    cc.moveTo(-56, 40);
    cc.bezierCurveTo(-120, 70, -205, 92, -212, 190);
    cc.bezierCurveTo(-222, 300, -214, 380, -205, 470);
    cc.lineTo(205, 470);
    cc.bezierCurveTo(214, 380, 222, 300, 212, 190);
    cc.bezierCurveTo(205, 92, 120, 70, 56, 40);
    cc.closePath(); cc.fillStyle = col; cc.fill();
  };
  body(c, GOR.fur);
  paint(() => {
    // the chest: bare, dark leathery skin with two broad pecs
    c.beginPath(); c.moveTo(-120, 175); c.bezierCurveTo(-110, 140, -30, 128, 0, 150); c.bezierCurveTo(30, 128, 110, 140, 120, 175);
    c.bezierCurveTo(118, 250, 60, 290, 0, 282); c.bezierCurveTo(-60, 290, -118, 250, -120, 175); c.closePath();
    c.fillStyle = GOR.skinLo; c.fill();
    c.beginPath(); c.moveTo(0, 152); c.lineTo(0, 276); c.lineWidth = 3; c.strokeStyle = 'rgba(10,8,12,0.6)'; c.stroke();
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 18, 236); c.quadraticCurveTo(sd * 70, 262, sd * 112, 214); c.lineWidth = 3; c.strokeStyle = 'rgba(10,8,12,0.5)'; c.stroke(); }
    // fur: short strokes down the shoulders and the flanks
    const r = mulberry32(919);
    for (let i = 0; i < 120; i++) {
      const sd = r() < 0.5 ? -1 : 1, u = r(), px = sd * lerp(80, 205, Math.pow(r(), 0.6)), py = lerp(70, 460, u);
      if (Math.abs(px) < 125 && py > 130 && py < 290) continue;
      line(c, px, py, px + sd * (2 + 4 * r()), py + 9 + 6 * r(), 2.2, r() < 0.5 ? 'rgba(70,64,80,0.55)' : 'rgba(8,6,10,0.5)');
    }
  });
  // ---- the arms: the drum (both fists to the chest) or resting on its lap; its left arm (screen right) can come up
  const sh = { L: [-170, 150], R: [170, 150] };
  const fist = (p, r) => { circle(c, p[0], p[1], r, GOR.skin); paint(() => { for (let i = -1; i <= 1; i++) line(c, p[0] - r * 0.55, p[1] + i * r * 0.32, p[0] + r * 0.2, p[1] + i * r * 0.32, 2, 'rgba(10,8,12,0.7)'); }); };
  const limb = (a, b, w) => { line(c, a[0], a[1], b[0], b[1], w, GOR.fur); };
  for (const sd of [-1, 1]) {
    const k = sd < 0 ? 'L' : 'R';
    if (arm > 0.01 && sd === (o.armSide || 1)) continue;          // drawn below as the raised arm
    const hit = dr > 0.01 ? Math.max(0, Math.sin(dt * 26 + (sd > 0 ? 0 : Math.PI))) : 0;
    const rest = { e: [sd * 225, 300], h: [sd * 120, 410] };
    const chest = { e: [sd * 215, 250], h: [sd * lerp(70, 52, hit), lerp(210, 196, hit)] };
    const e = [lerp(rest.e[0], chest.e[0], dr), lerp(rest.e[1], chest.e[1], dr)], h = [lerp(rest.h[0], chest.h[0], dr), lerp(rest.h[1], chest.h[1], dr)];
    limb(sh[k], e, 96); limb(e, h, 78);
    fist(h, 40);
    if (dr > 0.5 && hit > 0.92) out['thump' + k] = true;
  }
  // ---- the head
  c.save(); c.rotate(o.nod || 0);
  const head = (cc, col) => {
    cc.beginPath();
    cc.moveTo(-62, 16);
    cc.bezierCurveTo(-70, -30, -58, -66, -30, -84);
    cc.quadraticCurveTo(0, -112, 30, -84);
    cc.bezierCurveTo(58, -66, 70, -30, 62, 16);
    cc.bezierCurveTo(60, 60, 34, 82, 0, 84);
    cc.bezierCurveTo(-34, 82, -60, 60, -62, 16);
    cc.closePath(); cc.fillStyle = col; cc.fill();
  };
  for (const sd of [-1, 1]) circle(c, sd * 64, -2, 13, GOR.skinLo);   // ears
  head(c, GOR.fur);
  paint(() => {
    // the crest's sheen, the brow's fur
    c.beginPath(); c.moveTo(-26, -86); c.quadraticCurveTo(0, -110, 26, -86); c.lineWidth = 6; c.strokeStyle = 'rgba(90,82,100,0.55)'; c.stroke();
    // the face: a leathery mask from the brow to the chin
    c.beginPath();
    c.moveTo(-50, -30); c.quadraticCurveTo(0, -44, 50, -30);
    c.bezierCurveTo(56, 10, 50, 52, 30, 70); c.quadraticCurveTo(0, 84, -30, 70); c.bezierCurveTo(-50, 52, -56, 10, -50, -30);
    c.closePath(); c.fillStyle = GOR.skin; c.fill();
    // the brow ridge: a heavy shelf
    const bro = clamp(o.brow || 0) * 6;
    c.beginPath(); c.moveTo(-50, -26 - bro); c.quadraticCurveTo(-24, -42 - bro, 0, -32 - bro); c.quadraticCurveTo(24, -42 - bro, 50, -26 - bro);
    c.quadraticCurveTo(26, -20 - bro, 0, -22 - bro); c.quadraticCurveTo(-26, -20 - bro, -50, -26 - bro); c.closePath(); c.fillStyle = GOR.skinLo; c.fill();
    c.beginPath(); c.moveTo(-46, -30 - bro); c.quadraticCurveTo(-24, -42 - bro, 0, -33 - bro); c.quadraticCurveTo(24, -42 - bro, 46, -30 - bro);
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(140,130,150,0.45)'; c.stroke();
    // the eyes, deep under the brow
    const bl = clamp(o.blink || 0), look = o.look || 0;
    for (const ex of [-1, 1]) {
      const ex0 = ex * 20, ey = -14;
      ellipse(c, ex0, ey, 10, 8, '#1A1418');
      if (bl > 0.85) { line(c, ex0 - 8, ey, ex0 + 8, ey, 2.5, '#0C0A0E'); continue; }
      ellipse(c, ex0, ey, 8.2, 6.6 * (1 - 0.8 * bl), '#F2EDE6');
      circle(c, ex0 + 3.2 * look, ey + 0.5, 5.0, '#5A341C');
      circle(c, ex0 + 3.2 * look, ey + 0.5, 2.6, '#0A0606');
      circle(c, ex0 + 3.2 * look + 1.6, ey - 1.5, 1.2, '#FFFFFF');
    }
    // the nose: broad, with two big nostrils
    c.beginPath(); c.moveTo(-6, -8); c.quadraticCurveTo(-24, 6, -20, 18); c.quadraticCurveTo(0, 28, 20, 18); c.quadraticCurveTo(24, 6, 6, -8); c.closePath();
    c.fillStyle = GOR.skinHi; c.fill();
    for (const ex of [-1, 1]) ellipse(c, ex * 9, 15, 6.5, 4.6, '#120E14', ex * 0.4);
    // the muzzle and the mouth
    c.beginPath(); c.moveTo(-34, 34); c.quadraticCurveTo(0, 26, 34, 34); c.quadraticCurveTo(30, 66, 0, 70); c.quadraticCurveTo(-30, 66, -34, 34); c.closePath();
    c.fillStyle = GOR.skinHi; c.fill();
    const gr = clamp(o.grin || 0), hf = clamp(o.huff || 0);
    if (gr > 0.05) {
      c.beginPath(); c.moveTo(-26, 44); c.quadraticCurveTo(0, 44 + 20 * gr, 26, 44); c.quadraticCurveTo(0, 50 + 10 * gr, -26, 44); c.closePath();
      c.fillStyle = '#F4EEDC'; c.fill();
      c.lineWidth = 2; c.strokeStyle = '#120E14'; c.stroke();
      for (let i = -2; i <= 2; i++) line(c, i * 9, 45, i * 9, 47 + 10 * gr, 1.2, 'rgba(60,50,40,0.6)');
    } else if (hf > 0.05) {
      ellipse(c, 0, 48, 14 + 6 * hf, 7 + 4 * hf, GOR.skinLo);
      ellipse(c, 0, 47, 8 + 4 * hf, 3 + 2 * hf, '#120E14');
    } else {
      c.beginPath(); c.moveTo(-24, 47); c.quadraticCurveTo(0, 52, 24, 47); c.lineWidth = 2.6; c.strokeStyle = '#120E14'; c.stroke();
    }
  });
  c.restore();
  out.head = [x, y];
  // ---- its raised arm (its left: the screen's right): an upper arm out from the shoulder, the forearm up, the hand palm to us
  if (arm > 0.01) {
    const sd = o.armSide || 1, shR = sd > 0 ? sh.R : sh.L;
    const el = [sd * lerp(225, 236, arm), lerp(300, 150, arm)], wr = [sd * lerp(130, 196, arm), lerp(410, -96, arm)];
    limb(shR, el, 96);
    const d = [wr[0] - el[0], wr[1] - el[1]], L = Math.hypot(d[0], d[1]) || 1, ang = Math.atan2(d[0] / L, -d[1] / L);
    const hs = o.handS || 1.22;
    c.save(); c.translate(wr[0], wr[1]); c.rotate(ang); c.scale(hs, hs);
    const HD = Object.assign({ view: 0, mirror: sd > 0 ? 1 : -1, fa: (L + 30) / hs }, o.hand || {});
    out.mir = HD.mirror;
    out.P = wtHand(c, GORPAL, HD, t);
    out.hm = c.getTransform();
    c.restore();
  }
  c.restore();
  // a hand-unit point of the raised hand -> the context's pixels (screen, when c is a layer with the camera on it)
  out.handTip = (q) => { if (!out.hm) return [x, y]; const m = out.hm, qx = -q[0] * (out.mir || 1); return [m.a * qx + m.c * q[1] + m.e, m.b * qx + m.d * q[1] + m.f]; };
  return out;
}
