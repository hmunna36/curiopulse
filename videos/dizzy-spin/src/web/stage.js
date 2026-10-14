// A ballet stage at night: red curtains, a wooden floor, a spotlight from above; the hero in a pink leotard and a tutu,
// a pirouette drawn as a paper-doll turn (his layer squeezed sideways by cos of the turn), a perfect stop; and the
// brain at a dial marked SPIN SIGNAL in a thought bubble.
// World units = the frame at zoom 1. The rig's feet stand at (ST.hx, ST.floor).
'use strict';

const ST = { hx: 540, floor: 1560, s: 1 };
let ST_BG = null;
const TUTUPAL = Object.assign({}, PAL, {
  coat: '#FF8FBF', coatSh: '#E46A9E', coatHi: '#FFC4DC', coatDk: '#C04C7E', bare: true,
  pants: '#FFB8D4', pantsSh: '#F09ABE', shoe: '#FF9EC6', shoeSh: '#E57FA8', sole: '#FFD6E8',
});
function stPaint() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#120A22'); g.addColorStop(0.7, '#1C0F30'); g.addColorStop(1, '#120A1E');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // the back wall: a dark velvet with a soft pattern
  for (let x = 0; x < W; x += 60) { c.fillStyle = x % 120 ? 'rgba(80,30,90,0.18)' : 'rgba(40,14,60,0.25)'; c.fillRect(x, 0, 30, 1300); }
  // the floor: boards in perspective
  const fl = c.createLinearGradient(0, 1300, 0, H);
  fl.addColorStop(0, '#5A3A2A'); fl.addColorStop(1, '#2E1C16');
  c.fillStyle = fl; c.fillRect(0, 1300, W, H - 1300);
  for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(540 + i * 60, 1300); c.lineTo(540 + i * 190, H); c.lineWidth = 3; c.strokeStyle = 'rgba(20,10,8,0.4)'; c.stroke(); }
  c.fillStyle = '#7A5238'; c.fillRect(0, 1296, W, 10);
  return cv;
}
function initStage() { ST_BG = stPaint(); }
// the curtains (world units; drawn before him, at the sides), and the valance across the top
function stCurtains(c, t, open = 1) {
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -60 : W + 60, x1 = 540 + sd * lerp(60, 330, open);
    c.beginPath(); c.moveTo(x0, -40);
    c.lineTo(x1, -40);
    c.bezierCurveTo(x1 + sd * 30, 600, x1 - sd * 30, 1100, x1 + sd * 90, 1640);
    c.lineTo(x0, 1640); c.closePath(); c.fillStyle = '#9E1B34'; c.fill();
    paint(() => { for (let i = 1; i < 6; i++) { const x = lerp(x0, x1, i / 6); c.beginPath(); c.moveTo(x, -40); c.quadraticCurveTo(x + sd * 10, 800, x + sd * 30 * i / 6, 1640); c.lineWidth = 10; c.strokeStyle = 'rgba(60,6,20,0.45)'; c.stroke(); } });
  }
  c.beginPath(); c.moveTo(-60, -40); c.lineTo(W + 60, -40); c.lineTo(W + 60, 250);
  for (let i = 8; i >= 0; i--) { const x = -60 + (i / 8) * (W + 120); c.quadraticCurveTo(x + (W + 120) / 16, 330, x, 250); }
  c.closePath(); c.fillStyle = '#B4223E'; c.fill();
  paint(() => { line(c, -60, 236, W + 60, 236, 10, '#E2B24A'); });
}
// the spotlight: a cone from above onto the floor round him (glow layer + a soft wash on the set)
function stSpot(cam, x, a = 1) {
  const top = toScreen(cam, x, -200), pool = toScreen(cam, x, ST.floor + 10), w = 300 * cam.zoom;
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  const gr = gctx.createLinearGradient(0, top[1], 0, pool[1]);
  gr.addColorStop(0, `rgba(255,236,200,${0.16 * a})`); gr.addColorStop(1, `rgba(255,220,170,${0.08 * a})`);
  gctx.beginPath(); gctx.moveTo(top[0] - 40, top[1]); gctx.lineTo(top[0] + 40, top[1]); gctx.lineTo(pool[0] + w, pool[1]); gctx.lineTo(pool[0] - w, pool[1]); gctx.closePath();
  gctx.fillStyle = gr; gctx.fill();
  gctx.restore();
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const pg = ctx.createRadialGradient(pool[0], pool[1], 10, pool[0], pool[1], w * 1.1);
  pg.addColorStop(0, `rgba(255,220,170,${0.28 * a})`); pg.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = pg; ctx.save(); ctx.translate(pool[0], pool[1]); ctx.scale(1, 0.22); ctx.translate(-pool[0], -pool[1]); ctx.fillRect(pool[0] - w * 1.2, pool[1] - w * 1.2, w * 2.4, w * 2.4); ctx.restore();
  ctx.restore();
}
function stBack(cam, t) {
  screenSpace(); ctx.fillStyle = '#120A22'; ctx.fillRect(0, 0, W, H);
  const bc = { x: 540 + (cam.x - 540) * 0.4, y: 960 + (cam.y - 960) * 0.4, zoom: 1 + 0.4 * (cam.zoom - 1), rot: 0 };
  applyCam(bc);
  ctx.drawImage(ST_BG, 0, 0);
}
// arms and legs as {e, w} (rig-local, standing: pelvis at -222, head middle at -470)
const ST_ARM = {
  upL: { e: [-118, -430], w: [-46, -588] }, upR: { e: [118, -430], w: [46, -588] },
  roundL: { e: [-140, -330], w: [-62, -300] }, roundR: { e: [140, -330], w: [62, -300] },
  tadaL: { e: [-162, -366], w: [-246, -420] }, tadaR: { e: [162, -366], w: [246, -420] },
};
// the tutu: a wide frill at his hips (rig-local)
function stTutu(c, spin, t) {
  const y = -212, wob = 3 * Math.sin(t * 12) * spin;
  for (const [rx, ry, dy, col] of [[150, 30, 6, '#F2A6C8'], [140, 26, -2, '#FFC4DC'], [118, 20, -10, '#FFE0EE']]) {
    c.beginPath();
    for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2, r = 1 + 0.06 * Math.sin(a * 9 + t * 10 * spin); c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rx * r, y + dy + wob + Math.sin(a) * ry * r); }
    c.closePath(); c.fillStyle = col; c.fill();
  }
}
// The hero on stage. A: {turn: radians of the pirouette (0 = facing us), spin 0..1 (how fast: the tutu flutters, a blur),
// face, armL, armR, legR: {a, b} (the working leg), bob}. Returns {st, head (world)}.
function stHero(cam, t, A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: 0, armL: { a: 0.2, b: 0.1 }, armR: { a: 0.2, b: 0.1 }, legL: { a: 0.03, b: 0 }, legR: A.legR || { a: 0.03, b: 0 }, hand: 'open', feetFront: 1 };
  const aL = A.armL || ST_ARM.roundL, aR = A.armR || ST_ARM.roundR;
  p = armAt(p, 'L', aL.e, aL.w); p = armAt(p, 'R', aR.e, aR.w);
  const st = { x: ST.hx, y: ST.floor, s: ST.s, pose: p, face: A.face || FACES.grin, seed: 4 };
  const k = Math.cos(A.turn || 0), sx = Math.sign(k) * Math.max(0.08, Math.abs(k));
  const back = k < 0;
  charLayer(cam, st, t, {
    pal: TUTUPAL, ambient: 0.03,
    pre: (lc) => { lc.translate(st.x, 0); lc.scale(sx, 1); lc.translate(-st.x, 0); },
    post: (lc) => {
      lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
      stTutu(lc, A.spin || 0, t);
      if (back) {   // his back: the hair covers the face
        const r = rig(p);
        lc.save(); lc.translate(r.head[0], r.head[1]);
        lc.beginPath(); lc.ellipse(0, -6, 66, 68, 0, 0, 7); lc.fillStyle = PAL.hair; lc.fill();
        lc.restore();
      }
      lc.restore();
    },
  });
  return { st, head: [st.x, st.y + (p.hipY - 248) * st.s] };
}
// the SPIN SIGNAL dial (screen space): level 0..1 (the needle), k = pop
function stDial(x, y, s, level, k, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2) * s;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  rrect(ctx, -120, -96, 240, 170, 26); ctx.fillStyle = '#2A2440'; ctx.fill();
  rrect(ctx, -108, -84, 216, 120, 18); ctx.fillStyle = '#F4F0E4'; ctx.fill();
  paint(() => {
    for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.12 + 0.76 * i / 10), r0 = 70, r1 = i % 5 ? 80 : 88; line(ctx, Math.cos(a) * r0, 26 + Math.sin(a) * r0, Math.cos(a) * r1, 26 + Math.sin(a) * r1, i % 5 ? 3 : 5, i > 7 ? '#E2283C' : '#2A2440'); }
    ctx.font = '900 22px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A2440';
    ctx.fillText('SPIN SIGNAL', 0, 54);
  });
  const a = Math.PI * (1.12 + 0.76 * clamp(level)) + 0.03 * Math.sin(t * 30) * (level > 0.5 ? 1 : 0);
  line(ctx, 0, 26, Math.cos(a) * 74, 26 + Math.sin(a) * 74, 7, '#E2283C');
  circle(ctx, 0, 26, 11, '#2A2440');
  ctx.restore();
}
