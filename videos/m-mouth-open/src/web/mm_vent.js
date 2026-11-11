// Why Can't You Say "M" With Your Mouth OPEN? 👄 Short: the ventriloquist act on tongue-twister's club stage (tw_stage.js,
// its neon now reads LIPS / SEALED). The hero, in a red bow tie, keeps a stiff grin while his wooden dummy talks.
//   mmDummy(c, x, y, s, o)   the dummy (an actor): its head at (x, y); o: {jaw 0..1, look [x, y], blink, tilt, brow}
//   mmVentHero(cam, t, A)    him standing with the dummy on his right arm; A: {face, jaw (the dummy's), dLook, dTilt,
//                            headRot, sweat}; returns {st, r, hp(q), dummy: [x, y] (the dummy's head, world), dmouth}
//   mmFlipBubble(x, y, k, flips, o)  a speech bubble HI MAMA! whose M's flip to N's (flips: 0..1 per M), screen space
//   mmNana(x, y, s, k, t)    a grandma in the front row (from behind) who waves back
'use strict';

const MMV = { x: 470, y: 1500, s: 1.0 };
const MMVPAL = Object.assign({}, PAL, {          // a burgundy stage jacket over his yellow shirt
  coat: '#B0283E', coatSh: '#7E1A2C', coatHi: '#E05A6E', coatDk: '#5E1220', strap: '#B0283E', strapSh: '#7E1A2C',
});
const MMD = { wood: '#F2C49A', woodSh: '#D9A274', hair: '#D2522A', hairHi: '#F08A50', suit: '#2F3A78', suitSh: '#1E2654', shirt: '#FFFFFF', tie: '#E8344A' };

function mmDummy(c, x, y, s, o = {}) {
  const jaw = clamp(o.jaw || 0), look = o.look || [0, 0], jd = 15 * jaw;
  actor(() => {
    c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s, s);
    // the body: a little suit below the head, arms hanging, legs dangling over his arm
    c.beginPath(); c.moveTo(-46, 58); c.quadraticCurveTo(-60, 70, -62, 150); c.lineTo(62, 150); c.quadraticCurveTo(60, 70, 46, 58); c.closePath();
    c.fillStyle = MMD.suit; c.fill();
    line(c, -56, 76, -72, 150, 20, MMD.suitSh); line(c, 56, 76, 72, 150, 20, MMD.suitSh);
    circle(c, -73, 156, 11, MMD.wood); circle(c, 73, 156, 11, MMD.wood);
    line(c, -26, 150, -30, 230, 22, MMD.suitSh); line(c, 26, 150, 34, 228, 22, MMD.suitSh);
    rrect(c, -46, 222, 34, 18, 8); c.fillStyle = '#1A1A22'; c.fill(); rrect(c, 18, 220, 34, 18, 8); c.fill();
    // the neck peg and the head
    rrect(c, -14, 34, 28, 30, 6); c.fillStyle = MMD.woodSh; c.fill();
    c.beginPath(); c.ellipse(0, 0, 56, 60, 0, Math.PI, Math.PI * 2); c.ellipse(0, 0, 56, 60, 0, 0, Math.PI); c.fillStyle = MMD.wood; c.fill();
    // the jaw: a block that drops on its slots
    rrect(c, -24, 20 + jd, 48, 32, 12); c.fillStyle = MMD.wood; c.fill();
    // the painted hair: slick, a side part
    c.beginPath(); c.moveTo(-58, 0); c.quadraticCurveTo(-64, -58, -10, -66); c.quadraticCurveTo(46, -70, 58, -12); c.quadraticCurveTo(30, -44, -6, -40); c.quadraticCurveTo(-36, -36, -58, 0); c.closePath();
    c.fillStyle = MMD.hair; c.fill();
    c.restore();
    paint(() => {
      c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s, s);
      line(c, -30, -50, 6, -58, 5, rgba(MMD.hairHi, 0.9));
      // the white shirt V and the red bow tie
      c.beginPath(); c.moveTo(-18, 58); c.lineTo(0, 96); c.lineTo(18, 58); c.closePath(); c.fillStyle = MMD.shirt; c.fill();
      c.beginPath(); c.moveTo(0, 66); c.lineTo(-18, 56); c.lineTo(-18, 76); c.closePath(); c.fillStyle = MMD.tie; c.fill();
      c.beginPath(); c.moveTo(0, 66); c.lineTo(18, 56); c.lineTo(18, 76); c.closePath(); c.fill();
      circle(c, 0, 66, 5, '#B01F30');
      // big painted eyes with lashes, high brows
      for (const sd of [-1, 1]) {
        const ex = sd * 21, ey = -10;
        ellipse(c, ex, ey, 14, 16, '#FFFFFF');
        circle(c, ex + look[0] * 4, ey + look[1] * 4, 8, '#2A6FD8'); circle(c, ex + look[0] * 4, ey + look[1] * 4, 4, '#0B0B1A');
        circle(c, ex + look[0] * 4 - 2.5, ey + look[1] * 4 - 3, 2.2, '#FFFFFF');
        if ((o.blink || 0) > 0.5) { ellipse(c, ex, ey, 15, 17, MMD.wood); line(c, ex - 13, ey + 2, ex + 13, ey + 2, 3, '#5A3020'); }
        for (let i = 0; i < 3; i++) line(c, ex - 10 + i * 10, ey - 15, ex - 13 + i * 13, ey - 23, 2.2, '#2A1810');
        const bb = -38 - 6 * (o.brow || 0);
        c.beginPath(); c.arc(ex, bb + 12, 13, Math.PI + 0.5, -0.5); c.lineWidth = 3.5; c.strokeStyle = '#7A3018'; c.stroke();
      }
      // rosy cheeks, freckles, a button nose
      for (const sd of [-1, 1]) { circle(c, sd * 36, 14, 11, 'rgba(255,90,110,0.55)'); for (let i = 0; i < 3; i++) circle(c, sd * (28 + i * 6), 8 + (i % 2) * 4, 1.6, 'rgba(150,80,50,0.7)'); }
      ellipse(c, 0, 8, 7, 5, MMD.woodSh);
      // the mouth: a painted smile above the jaw; the jaw's slots; the dark gap when it drops
      if (jd > 0.5) { rrect(c, -22, 16, 44, jd + 6, 6); c.fillStyle = '#3A0E18'; c.fill(); }
      c.beginPath(); c.moveTo(-22, 18); c.quadraticCurveTo(0, 26, 22, 18); c.lineWidth = 4; c.strokeStyle = '#B01F30'; c.lineCap = 'round'; c.stroke();
      line(c, -24, 20, -24, 50 + jd, 2.5, 'rgba(90,40,20,0.75)'); line(c, 24, 20, 24, 50 + jd, 2.5, 'rgba(90,40,20,0.75)');
      c.beginPath(); c.moveTo(-14, 30 + jd); c.quadraticCurveTo(0, 36 + jd, 14, 30 + jd); c.lineWidth = 3.5; c.strokeStyle = '#B01F30'; c.stroke();
      c.restore();
    });
  });
}

// him on the stage, the dummy on his right arm (screen right). The right hand is inside the dummy: we see the forearm
// going behind it.
const MMV_ARM_R = { e: [112, -262], w: [150, -300] };
function mmVentHero(cam, t, A) {
  let pose = { ...POSES.stand, hand: 'open', handR: 'none' };
  pose = armAt(pose, 'R', MMV_ARM_R.e, MMV_ARM_R.w);
  const la = A.wave || 0;
  pose = armAt(pose, 'L', [lerp(-98, -150, la), lerp(-282, -330, la)], [lerp(-86, -140, la), lerp(-196, -420, la)]);
  const st = { x: MMV.x, y: MMV.y, s: MMV.s, pose, face: A.face, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, seed: 3 };
  const dummyAt = [MMV.x + (MMV_ARM_R.w[0] + 6) * MMV.s, MMV.y + (MMV_ARM_R.w[1] - 62) * MMV.s];   // its head at his chest, on his arm
  const r = charLayer(cam, st, t, { pal: MMVPAL, post: (lc, rr, s2) => {
    // the red bow tie at his collar (rig space, the neck at U(0, -176))
    lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
    const nk = rr.U(0, -168);
    paint(() => {
      lc.beginPath(); lc.moveTo(nk[0], nk[1]); lc.lineTo(nk[0] - 26, nk[1] - 14); lc.lineTo(nk[0] - 26, nk[1] + 14); lc.closePath(); lc.fillStyle = '#E8344A'; lc.fill();
      lc.beginPath(); lc.moveTo(nk[0], nk[1]); lc.lineTo(nk[0] + 26, nk[1] - 14); lc.lineTo(nk[0] + 26, nk[1] + 14); lc.closePath(); lc.fill();
      circle(lc, nk[0], nk[1], 7, '#B01F30');
    });
    lc.restore();
    // the dummy sits on his forearm, in front of him
    mmDummy(lc, dummyAt[0], dummyAt[1], 0.8 * MMV.s, { jaw: A.jaw || 0, look: A.dLook || [-0.6, 0], tilt: A.dTilt || 0, brow: A.dBrow || 0, blink: A.dBlink || 0 });
  } });
  const out = { st, r, dummy: dummyAt, dmouth: [dummyAt[0], dummyAt[1] + 24 * MMV.s] };
  out.hp = (q) => mmHeadPt(out, q);
  if ((A.sweat || 0) > 0.01) { screenSpace(); const run = ((t * 0.6) % 1 + 1) % 1, P = toScreen(cam, ...out.hp([60, -10 + 20 * run])); sweatDrop(ctx, P[0], P[1], cam.zoom / 2.4, A.sweat * Math.min(1, (1 - run) * 4)); applyCam(cam); }
  return out;
}

// a speech bubble with HI MAMA! whose M's flip to N's (screen space); tail toward (tx, ty)
function mmFlipBubble(x, y, k, flips, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2), size = o.size || 96;
  const txt = o.txt || ['H', 'I', ' ', 'M', 'A', 'M', 'A', '!'], flipIdx = o.flipIdx || [3, 5];
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.05); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const ws = txt.map((ch) => (ch === ' ' ? size * 0.3 : ctx.measureText(ch === 'M' ? 'M' : ch).width + size * 0.06));
  const Wt = ws.reduce((a, b) => a + b, 0), w = Wt + size * 0.9, h = size * 1.45;
  const tx = (o.tx === undefined ? x - 200 : o.tx) - x, ty = (o.ty === undefined ? y + 200 : o.ty) - y;
  for (const [lw, col] of [[14, '#0B0B1A'], [0, '#FFFFFF']]) {
    ctx.beginPath(); ctx.moveTo(-w * 0.12, h / 2 - 8); ctx.lineTo(tx / s, ty / s); ctx.lineTo(w * 0.08, h / 2 - 8); ctx.closePath();
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2);
    if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.stroke(); }
    else { ctx.fillStyle = col; ctx.fill(); }
  }
  let cx = -Wt / 2;
  txt.forEach((ch, i) => {
    const cw = ws[i]; cx += cw / 2;
    if (ch !== ' ') {
      const fi = flipIdx.indexOf(i), f = fi >= 0 ? clamp(flips[fi] || 0) : 0;
      const sy = Math.abs(Math.cos(Math.PI * f)), shown = f > 0.5 ? 'N' : ch;
      const col = f > 0.5 ? '#FF9A3C' : fi >= 0 ? (o.mCol || '#0B0B1A') : '#0B0B1A';
      ctx.save(); ctx.translate(cx, 4); ctx.scale(1, Math.max(0.04, sy));
      if (f > 0.5) { ctx.lineWidth = size * 0.12; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(shown, 0, 0); }
      ctx.fillStyle = col; ctx.fillText(shown, 0, 0);
      ctx.restore();
    }
    cx += cw / 2;
  });
  ctx.restore();
}

// a grandma in the front row from behind (world space): grey bun, a waving hand
function mmNana(x, y, s, k, t) {
  const c = ctx, wv = Math.sin(t * 14) * 0.35;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#0B0714';
  c.beginPath(); c.moveTo(-110, 260); c.quadraticCurveTo(-104, 60, -40, 44); c.lineTo(40, 44); c.quadraticCurveTo(104, 60, 110, 260); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0, -18, 52, 60, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(0, -86, 30, 24, 0, 0, Math.PI * 2); c.fill();               // the bun
  c.beginPath(); c.ellipse(0, -86, 30, 24, 0, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 4; c.strokeStyle = 'rgba(220,220,235,0.55)'; c.stroke();
  c.beginPath(); c.ellipse(0, -18, 52, 60, 0, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 4; c.strokeStyle = 'rgba(255,220,170,0.3)'; c.stroke();
  if (k > 0.01) {                                    // her hand up, waving
    const ax = 92, ay = -130 * k;
    c.save(); c.translate(ax * 0.85, 70); c.rotate(-0.25 + wv * k);
    line(c, 0, 0, 0, ay - 60, 28, '#0B0714');
    circle(c, 0, ay - 76, 24, '#0B0714');
    c.restore();
  }
  c.restore();
}
