// A night office seen from the chair: the room painted once as a strip of one whole turn that streams past while the
// chair spins (the camera rides with him), the office chair, and the hero in it from a description.
// World units = the frame at zoom 1. The rig's feet stand at (OF.hx, OF.floor); rig-local heights (feet at 0): pelvis
// -205, seat top -198, armrests -270..-246, head middle -453.
'use strict';

const OF = { hx: 540, floor: 1640, s: 1 };
const OF_HIP = -205;
const OF_HEADY = OF.floor + (OF_HIP - 248) * OF.s;          // the head's middle, world y
const OF_PW = 3600, OF_PH = 1500, OF_EYE = 640;              // the strip: one turn of the room; eye level in it
let OF_STRIP = null;
// a pale blue shirt with a collar and buttons (the rig's pyjama top), navy trousers; a red tie is drawn on top
const OFPAL = Object.assign({}, PAL, { coat: '#A9CFF2', coatSh: '#79A6D2', coatHi: '#DDEEFF', coatDk: '#4F78A6', pj: true });

// ---------------------------------------------------------------- the room, one whole turn of it
function ofPaintStrip() {
  const cv = mkCanvas(OF_PW, OF_PH), c = cv.getContext('2d'), rng = mulberry32(31);
  const g = c.createLinearGradient(0, 0, 0, OF_PH);
  g.addColorStop(0, '#1A2250'); g.addColorStop(0.62, '#202A5E'); g.addColorStop(0.7, '#141A3E'); g.addColorStop(1, '#0E1230');
  c.fillStyle = g; c.fillRect(0, 0, OF_PW, OF_PH);
  // the ceiling: a strip light every 900 px
  c.fillStyle = '#121838'; c.fillRect(0, 0, OF_PW, 120);
  for (let x = 250; x < OF_PW; x += 900) { rrect(c, x, 70, 360, 26, 13); c.fillStyle = '#C9D6FF'; c.fill(); }
  // the floor: carpet and a skirting board
  c.fillStyle = '#272043'; c.fillRect(0, 1080, OF_PW, OF_PH - 1080);
  c.fillStyle = '#2E3770'; c.fillRect(0, 1060, OF_PW, 22);
  for (let i = 0; i < 260; i++) { const x = rng() * OF_PW, y = 1100 + rng() * 380; c.fillStyle = 'rgba(255,255,255,0.025)'; c.fillRect(x, y, 30 + rng() * 50, 3); }
  // 1. a big window: the city at night (x 80-760)
  rrect(c, 80, 230, 680, 620, 16); c.fillStyle = '#2E3A78'; c.fill();
  const sky = c.createLinearGradient(0, 250, 0, 830); sky.addColorStop(0, '#16205A'); sky.addColorStop(1, '#3A3F8E');
  rrect(c, 104, 254, 632, 572, 8); c.fillStyle = sky; c.fill();
  circle(c, 610, 350, 40, '#E8EEFF'); circle(c, 628, 338, 36, '#2A3478');
  let bx = 104;
  while (bx < 736) {
    const w = 50 + rng() * 70, h = 160 + rng() * 300, top = 826 - h;
    c.fillStyle = rng() < 0.5 ? '#121A44' : '#18205090'.slice(0, 7); c.fillRect(bx, top, Math.min(w, 736 - bx), h);
    for (let yy = top + 16; yy < 812; yy += 26) for (let xx = bx + 8; xx < Math.min(bx + w, 736) - 10; xx += 18) if (rng() < 0.35) { c.fillStyle = rng() < 0.7 ? '#FFD98A' : '#9FD8FF'; c.fillRect(xx, yy, 8, 11); }
    bx += w + 4;
  }
  c.fillStyle = '#2E3A78'; c.fillRect(416, 254, 10, 572); c.fillRect(104, 536, 632, 10);
  rrect(c, 60, 846, 720, 24, 8); c.fillStyle = '#39468C'; c.fill();
  // 2. a bookshelf (x 860-1180)
  rrect(c, 860, 300, 320, 760, 10); c.fillStyle = '#3A2A4E'; c.fill();
  const cols = ['#7A4FC4', '#2F8EB0', '#C4614F', '#3FAE7A', '#C9A23E', '#5A62D0', '#D06A9A'];
  for (const sy of [440, 620, 800, 980]) {
    c.fillStyle = '#2A1E3C'; c.fillRect(872, sy, 296, 14);
    let x = 884;
    while (x < 1150) { const w = 18 + rng() * 22, h = 90 + rng() * 60; if (x + w > 1158) break; rrect(c, x, sy - h, w, h, 3); c.fillStyle = cols[Math.floor(rng() * cols.length)]; c.fill(); x += w + 4; }
  }
  // 3. the door (x 1290-1620)
  rrect(c, 1290, 330, 330, 740, 8); c.fillStyle = '#2C3366'; c.fill();
  rrect(c, 1312, 350, 286, 720, 6); c.fillStyle = '#6B4A3A'; c.fill();
  rrect(c, 1350, 400, 210, 250, 8); c.fillStyle = '#7C5846'; c.fill();
  rrect(c, 1350, 700, 210, 300, 8); c.fillStyle = '#7C5846'; c.fill();
  circle(c, 1566, 720, 14, '#D9B45A');
  // 4. a desk with a monitor and a lamp (x 1720-2420)
  rrect(c, 1720, 820, 700, 40, 8); c.fillStyle = '#4A3462'; c.fill();
  c.fillStyle = '#3A2850'; c.fillRect(1740, 860, 30, 220); c.fillRect(2370, 860, 30, 220);
  rrect(c, 1860, 560, 360, 230, 14); c.fillStyle = '#1B1E2E'; c.fill();
  const scr = c.createLinearGradient(0, 576, 0, 774); scr.addColorStop(0, '#4FB8FF'); scr.addColorStop(1, '#2A6CD0');
  rrect(c, 1876, 576, 328, 198, 8); c.fillStyle = scr; c.fill();
  for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(1900, 600 + i * 26, 120 + (i * 53) % 150, 10); }
  c.fillStyle = '#1B1E2E'; c.fillRect(2028, 790, 24, 32);
  rrect(c, 2240, 800, 120, 20, 6); c.fillStyle = '#2A2240'; c.fill();
  line(c, 2300, 800, 2330, 690, 10, '#2A2240'); line(c, 2330, 690, 2290, 640, 10, '#2A2240');
  c.beginPath(); c.moveTo(2250, 650); c.lineTo(2330, 610); c.lineTo(2350, 650); c.lineTo(2290, 690); c.closePath(); c.fillStyle = '#FFCB7A'; c.fill();
  rrect(c, 1760, 780, 70, 40, 6); c.fillStyle = '#E86A5C'; c.fill();
  // 5. a whiteboard with a clock above it (x 2520-3020)
  circle(c, 2770, 300, 62, '#F2EEE4'); circle(c, 2770, 300, 52, '#FFFFFF');
  line(c, 2770, 300, 2770, 262, 7, '#1A1C2C'); line(c, 2770, 300, 2798, 312, 6, '#1A1C2C');
  rrect(c, 2520, 420, 500, 330, 12); c.fillStyle = '#C8CCE0'; c.fill();
  rrect(c, 2536, 436, 468, 298, 6); c.fillStyle = '#F4F6FF'; c.fill();
  c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = '#3F6AD8';
  c.beginPath(); c.ellipse(2660, 560, 70, 52, 0.3, 0, 7); c.stroke();
  c.strokeStyle = '#D8463F'; c.beginPath(); c.moveTo(2780, 650); c.lineTo(2850, 520); c.lineTo(2920, 600); c.lineTo(2970, 480); c.stroke();
  c.strokeStyle = '#2E9E6A'; c.beginPath(); c.moveTo(2600, 680); c.lineTo(2740, 680); c.stroke();
  // 6. a tall plant (x 3090-3330)
  rrect(c, 3150, 900, 130, 150, 18); c.fillStyle = '#B4583E'; c.fill();
  for (const [a, l] of [[-1.0, 260], [-0.55, 330], [-0.15, 380], [0.3, 340], [0.75, 280], [1.15, 210]]) {
    c.save(); c.translate(3215, 910); c.rotate(a); ellipse(c, 0, -l / 2, 34, l / 2, '#2C7A5C'); line(c, 0, 0, 0, -l + 20, 4, '#1E5A44'); c.restore();
  }
  // 7. a framed picture (x 3390-3560), and the wall runs on into the window at the start
  rrect(c, 3390, 420, 170, 220, 8); c.fillStyle = '#C9A23E'; c.fill();
  rrect(c, 3406, 436, 138, 188, 4); c.fillStyle = '#2F6EA0'; c.fill();
  c.beginPath(); c.moveTo(3406, 624); c.lineTo(3470, 520); c.lineTo(3544, 624); c.closePath(); c.fillStyle = '#3FAE7A'; c.fill();
  return cv;
}
function initOffice() { OF_STRIP = ofPaintStrip(); }

// where the bright things of the strip are (strip x, y, colour, radius, strength): they shine into the glow layer
const OF_LAMPS = [[610, 350, '#DDE6FF', 110, 0.35], [2040, 675, '#5FB8FF', 220, 0.38], [2300, 655, '#FFC27A', 150, 0.55], [430, 82, '#C9D6FF', 160, 0.22], [1330, 82, '#C9D6FF', 160, 0.22], [2230, 82, '#C9D6FF', 160, 0.22], [3130, 82, '#C9D6FF', 160, 0.22]];
// the room behind him. ang = how far round the chair has turned (radians; the strip streams right to left as it grows),
// w = how fast it is turning now (rad/s, for the smear), cam = the shot's camera (the strip is far: it scales less)
function ofRoom(cam, t, ang, w, o = {}) {
  const bs = 0.62 + 0.34 * cam.zoom;
  const ox = ((ang / (Math.PI * 2)) * OF_PW) % OF_PW;
  const yTop = 960 - OF_EYE * bs + (OF_HEADY + 40 - cam.y) * cam.zoom * 0.3 + (o.dy || 0);
  const smear = Math.min(900, Math.abs(w) / 30 * (OF_PW / (Math.PI * 2)) * bs * 1.35);
  screenSpace();
  ctx.fillStyle = '#0E1230'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(cam.rot || 0); ctx.translate(-540, -960);
  const n = smear > 6 ? Math.min(14, 4 + Math.round(smear / 40)) : 1;
  for (let i = 0; i < n; i++) {
    const sh = n > 1 ? (i / (n - 1) - 0.5) * smear : 0;
    ctx.globalAlpha = 1 / (i + 1);
    let x0 = 540 - ox * bs + sh;
    while (x0 > -200) x0 -= OF_PW * bs;
    for (let x = x0; x < W + 200; x += OF_PW * bs) ctx.drawImage(OF_STRIP, x, yTop, OF_PW * bs, OF_PH * bs);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  // the lamps glow (less while the room is a blur)
  const ga = 1 / (1 + smear / 60);
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(540, 960); gctx.rotate(cam.rot || 0); gctx.translate(-540, -960);
  for (const [lx, ly, col, r, a] of OF_LAMPS) {
    let x = 540 + (lx - ox) * bs;
    x = ((x + 300) % (OF_PW * bs) + OF_PW * bs) % (OF_PW * bs) - 300;
    const away = Math.pow(clamp(Math.abs(x - 540) / 420), 1.5);   // nothing bright right behind him (it blooms through him)
    if (x > -300 && x < W + 300) softDot(gctx, x, yTop + ly * bs, r * bs, col, a * ga * away * (o.lamp === undefined ? 1 : o.lamp));
  }
  gctx.restore();
  // speed lines across the room while it streams
  const sp = clamp((smear - 60) / 300);
  if (sp > 0.01) {
    const rng = mulberry32(5 + Math.floor(t * 30));
    for (let i = 0; i < 14; i++) {
      const y = 380 + rng() * 1200, x = rng() * W, L = 200 + rng() * 420;
      line(ctx, x, y, x - L * Math.sign(w || 1), y, 3 + rng() * 4, rgba('#E6EEFF', 0.34 * sp));
    }
  }
}

// ---------------------------------------------------------------- the chair (rig-local units; the caller has applied the camera)
function ofChairBack(c, o = {}) {
  c.save(); c.translate(OF.hx, OF.floor); c.scale(OF.s, OF.s);
  rrect(c, -164, -470, 328, 290, 70); c.fillStyle = '#35264A'; c.fill();             // the back, up to his shoulders: the room shows round his head
  paint(() => { for (const x of [-110, 110]) line(c, x, -440, x, -240, 4, 'rgba(20,12,34,0.55)'); });
  // the arms: pads and their posts, beside his hips
  for (const s of [-1, 1]) {
    rrect(c, s > 0 ? 146 : -160, -250, 14, 64, 6); c.fillStyle = '#211A2E'; c.fill();
    rrect(c, s > 0 ? 112 : -180, -276, 68, 30, 13); c.fillStyle = '#2A2036'; c.fill();
  }
  // the seat, under him
  rrect(c, -176, -214, 352, 60, 28); c.fillStyle = '#46325C'; c.fill();
  // the column and the five-legged base on wheels
  rrect(c, -15, -160, 30, 104, 8); c.fillStyle = '#2B2B3A'; c.fill();
  rrect(c, -40, -168, 80, 22, 8); c.fillStyle = '#1E1E2A'; c.fill();
  for (const [x0, x1, y1] of [[0, -190, -28], [0, 190, -28], [0, -96, -10], [0, 96, -10]]) { line(c, x0, -58, x1, y1 - 14, 20, '#262634'); circle(c, x1, y1, 17, '#14141E'); }
  c.restore();
}
// his thighs and shins on the seat (drawn on his own layer, after him), rig-local units
function ofLegs(c, pal) {
  for (const s of [-1, 1]) {
    line(c, s * 56, -178, s * 62, -46, 44, pal.pants);
    ellipse(c, s * 50, -196, 50, 40, pal.pants);
    drawShoe(c, [s * 62, -40], s, pal, 1, false);
  }
}
// a tie (rig-local; swing = how far it flies to the side, radians)
function ofTie(c, swing) {
  c.save(); c.translate(0, OF_HIP - 160); c.rotate(swing);
  c.beginPath(); c.moveTo(-13, 0); c.lineTo(13, 0); c.lineTo(9, 22); c.lineTo(-9, 22); c.closePath(); c.fillStyle = '#C42A3C'; c.fill();
  c.beginPath(); c.moveTo(-9, 20); c.lineTo(9, 20); c.lineTo(20, 120); c.lineTo(0, 144); c.lineTo(-20, 120); c.closePath(); c.fillStyle = '#E2384C'; c.fill();
  paint(() => { for (let i = 0; i < 4; i++) line(c, -14, 44 + i * 24, 14, 32 + i * 24, 4, 'rgba(255,214,90,0.7)'); });
  c.restore();
}

// ---------------------------------------------------------------- the hero in the chair
// arms as {e: elbow, w: wrist} (rig-local)
const OF_ARM = {
  gripL: { e: [-122, -296], w: [-144, -262] }, gripR: { e: [122, -296], w: [144, -262] },
  lapL: { e: [-110, -270], w: [-62, -232] }, lapR: { e: [110, -270], w: [62, -232] },
  upL: { e: [-150, -430], w: [-96, -560] }, upR: { e: [150, -430], w: [96, -560] },
  thumbR: { e: [128, -300], w: [150, -380] },
};
function ofSt(A = {}) {
  let p = { hipY: OF_HIP + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.2, b: 0.1 }, armR: { a: 0.2, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: A.hand || 'fist', feetFront: 1 };
  const aL = A.armL || OF_ARM.gripL, aR = A.armR || OF_ARM.gripR;
  p = armAt(p, 'L', aL.e, aL.w); p = armAt(p, 'R', aR.e, aR.w);
  if (A.handL) p.handL = A.handL;
  if (A.handR) p.handR = A.handR;
  return { x: OF.hx + (A.dx || 0), y: OF.floor + (A.dy || 0), s: OF.s, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, frizz: A.frizz || 0, noLegs: true, seed: 4 };
}
function ofHeadPt(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  const hx = r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, hy = r.head[1] + (st.headDY || 0) + lx * sn + ly * cs;
  return [st.x + hx * st.s, st.y + hy * st.s];
}
// A: {face, armL, armR, bob, lean, headRot, headDX, headDY, tie (swing), ambient, post(lc, r, st) in rig units, pal}
function ofHero(cam, t, A = {}) {
  const pal = A.pal || OFPAL, st = ofSt(A);
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.04 : A.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      ofTie(lc, A.tie || 0);
      ofLegs(lc, pal);
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  const P = (lx, ly) => ofHeadPt(st, lx, ly);
  return { st, r, s: st.s, head: P(0, 0), top: P(0, -84), chin: P(0, 68), earR: P(62, 2), earL: P(-62, 2), eyeL: P(-24, -2), eyeR: P(24, -2), P,
    wrL: [st.x + r.wrL[0] * st.s, st.y + r.wrL[1] * st.s], wrR: [st.x + r.wrR[0] * st.s, st.y + r.wrR[1] * st.s] };
}

// swoosh arcs round him while the chair turns (world, the camera applied): part = 'back' (before him) or 'front'
// (after him); k = how fast (0..1), ph = the turn so far
function ofSwoosh(c, g, part, k, ph) {
  if (k <= 0.02) return;
  const cx = OF.hx, cy = OF.floor + (OF_HIP - 90) * OF.s;
  for (let j = 0; j < 2; j++) {
    const rx = (250 + j * 46) * OF.s, ry = (44 + j * 10) * OF.s, y0 = cy - j * 150 * OF.s, a0 = -ph * 1.0 + j * 2.1;
    for (let i = 0; i < 3; i++) {
      const a = a0 + i * 2.1, front = Math.sin(a + 0.5) > 0;
      if ((part === 'front') !== front) continue;
      c.beginPath(); c.ellipse(cx, y0, rx, ry, 0, a, a + 1.0); c.lineWidth = 9 * OF.s; c.lineCap = 'round'; c.strokeStyle = rgba('#F2F6FF', 0.62 * k); c.stroke();
      g.beginPath(); g.ellipse(cx, y0, rx, ry, 0, a, a + 1.0); g.lineWidth = 22 * OF.s; g.strokeStyle = rgba('#9FC8FF', 0.3 * k); g.stroke();
    }
  }
}
// black in the glow layer where he and the chair are, so a lamp passing behind him does not shine through (world)
function ofOcclude(H) {
  const st = H.st;
  gctx.fillStyle = '#000000';
  gctx.beginPath(); gctx.ellipse(H.head[0], H.head[1], 74 * st.s, 84 * st.s, 0, 0, 7); gctx.fill();
  rrect(gctx, st.x - 170 * st.s, st.y - 470 * st.s, 340 * st.s, 470 * st.s, 40 * st.s); gctx.fill();
}
