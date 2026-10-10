// His living room (cats-purr): why-we-cry's room without the TV. An evening with one warm lamp on, and the same room
// at five in the morning by moonlight. The couch, him on the left cushion in his blue hoodie, and his cat: on his lap
// with his fingers under her chin, or on the back of the couch next to his head.
// World coords = screen coords at zoom 1. The wall is a cached picture (two of them: lamp on, lamp off); the couch,
// the props and everybody on it are shapes, so they take the light.
'use strict';

const LNG = { seatY: 1250, hx: 430, hs: 1.12, lampX: 1004, lampY: 770, backY: 892 };
const LNGPAL = Object.assign({}, PAL, {
  coat: '#5B7FD6', coatSh: '#3C59A8', coatHi: '#8FB0FF', coatDk: '#2C4488',
  strap: '#5B7FD6', strapSh: '#3C59A8', pants: '#3A3F58', pantsSh: '#262A40',
  shoe: '#E8E4D8', shoeSh: '#B8B2A0', sole: '#8A8576', pj: false, home: true,
});
let LNG_EVE = null, LNG_NIGHT = null;

function lngPaintRoom(lampOn) {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  if (lampOn) { g.addColorStop(0, '#1A2150'); g.addColorStop(0.72, '#0D1230'); g.addColorStop(1, '#05060F'); }
  else { g.addColorStop(0, '#111A46'); g.addColorStop(0.72, '#0A0F2C'); g.addColorStop(1, '#04050D'); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let x = 30; x < W; x += 90) { c.fillStyle = 'rgba(255,255,255,0.022)'; c.fillRect(x, 0, 44, 1430); }
  if (lampOn) {   // the lamp's warm wash on the wall (right)
    const lg = c.createRadialGradient(LNG.lampX, LNG.lampY, 20, LNG.lampX, LNG.lampY, 640);
    lg.addColorStop(0, 'rgba(255,190,120,0.36)'); lg.addColorStop(0.5, 'rgba(255,160,90,0.11)'); lg.addColorStop(1, 'rgba(255,160,90,0)');
    c.fillStyle = lg; c.fillRect(0, 0, W, H);
  } else {        // the moon's pale wash from the window (left)
    const mg = c.createRadialGradient(240, 600, 30, 240, 600, 760);
    mg.addColorStop(0, 'rgba(150,180,255,0.20)'); mg.addColorStop(0.6, 'rgba(120,150,255,0.06)'); mg.addColorStop(1, 'rgba(120,150,255,0)');
    c.fillStyle = mg; c.fillRect(0, 0, W, H);
  }
  // window (left): night sky, a moon, the cross bars, heavy curtains
  const wx = 96, wy = 430, ww = 250, wh = 360;
  rrect(c, wx - 14, wy - 14, ww + 28, wh + 28, 10); c.fillStyle = '#2B3364'; c.fill();
  const sky = c.createLinearGradient(0, wy, 0, wy + wh);
  if (lampOn) { sky.addColorStop(0, '#132456'); sky.addColorStop(1, '#27408A'); } else { sky.addColorStop(0, '#1A2E6A'); sky.addColorStop(1, '#40589E'); }
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  const rs = mulberry32(5);
  for (let i = 0; i < 26; i++) circle(c, wx + rs() * ww, wy + rs() * wh * 0.8, 1 + rs() * 1.8, `rgba(220,230,255,${0.4 + rs() * 0.5})`);
  const mx = lampOn ? wx + 170 : wx + 76, my = lampOn ? wy + 100 : wy + 236;   // by morning the moon has moved
  softDot(c, mx, my, 120, '#BFD2FF', 0.35); circle(c, mx, my, 34, '#EAF0FF'); circle(c, mx - 12, my - 8, 9, 'rgba(180,195,235,0.7)');
  c.fillStyle = '#2B3364'; c.fillRect(wx + ww / 2 - 6, wy, 12, wh); c.fillRect(wx, wy + wh / 2 - 6, ww, 12);
  for (const s of [-1, 1]) {   // curtains
    const cx = s < 0 ? wx - 44 : wx + ww - 26;
    const cg = c.createLinearGradient(cx, 0, cx + 70, 0); cg.addColorStop(0, '#4A1F3F'); cg.addColorStop(0.5, '#6B2C55'); cg.addColorStop(1, '#3A1832');
    c.fillStyle = cg; rrect(c, cx, wy - 40, 70, wh + 90, 14); c.fill();
    for (let i = 1; i < 4; i++) line(c, cx + i * 17, wy - 30, cx + i * 17, wy + wh + 40, 3, 'rgba(0,0,0,0.22)');
  }
  rrect(c, wx - 60, wy - 56, ww + 120, 22, 10); c.fillStyle = '#20264C'; c.fill();
  // a framed picture (right): a fish, of course
  const px = 742, py = 470, pw = 190, ph = 150;
  rrect(c, px - 12, py - 12, pw + 24, ph + 24, 8); c.fillStyle = '#6A4A2A'; c.fill();
  c.fillStyle = '#243A6A'; c.fillRect(px, py, pw, ph);
  c.save(); c.translate(px + pw / 2 - 8, py + ph / 2);
  ellipse(c, 0, 0, 52, 27, '#7FC8E8'); c.beginPath(); c.moveTo(44, 0); c.lineTo(82, -26); c.lineTo(82, 26); c.closePath(); c.fillStyle = '#7FC8E8'; c.fill();
  circle(c, -28, -6, 5, '#10203A'); line(c, -6, -14, -6, 14, 3, 'rgba(16,32,58,0.45)'); line(c, 12, -12, 12, 12, 3, 'rgba(16,32,58,0.45)');
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.06)'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 90, py); c.lineTo(px, py + 110); c.fill();
  // skirting + floor boards + a rug
  c.fillStyle = '#141A3C'; c.fillRect(0, 1404, W, 26);
  const fg = c.createLinearGradient(0, 1430, 0, H); fg.addColorStop(0, '#15122A'); fg.addColorStop(1, '#07060F');
  c.fillStyle = fg; c.fillRect(0, 1430, W, H - 1430);
  for (let i = 0; i < 7; i++) line(c, 0, 1470 + i * i * 12 + i * 30, W, 1470 + i * i * 12 + i * 30, 2, 'rgba(0,0,0,0.3)');
  ellipse(c, 540, 1560, 520, 90, '#3B2452'); ellipse(c, 540, 1560, 470, 72, '#4A2E66');
  return cv;
}
function initLounge() { LNG_EVE = lngPaintRoom(true); LNG_NIGHT = lngPaintRoom(false); }

// the room behind the couch. o: {lamp: 0..1 (how bright the floor lamp is; 1 = the evening, 0 = five in the morning)}
function lngRoom(cam, t, o = {}) {
  const lamp = o.lamp === undefined ? 1 : o.lamp, c = ctx, X = LNG.lampX;
  applyCam(cam);
  c.drawImage(lamp > 0.5 ? LNG_EVE : LNG_NIGHT, 0, 0);
  if (lamp > 0.5) softDot(gctx, 266, 530, 150, '#9FB8FF', 0.45); else softDot(gctx, 172, 666, 170, '#9FB8FF', 0.6);   // the moon blooms
  // the floor lamp (far right)
  line(c, X, 1430, X, 840, 9, '#2A2440'); ellipse(c, X, 1432, 46, 10, '#2A2440');
  c.beginPath(); c.moveTo(X - 62, 836); c.lineTo(X + 62, 836); c.lineTo(X + 36, 700); c.lineTo(X - 36, 700); c.closePath();
  c.fillStyle = mixHex('#3A3060', '#FFD9A0', 0.85 * lamp); c.fill();
  if (lamp > 0.02) { softDot(gctx, X, LNG.lampY, 150, '#FFC27A', 0.55 * lamp); softDot(gctx, X, LNG.lampY + 10, 330, '#FF9A50', 0.16 * lamp); }
}

// the couch: back + cushions (behind whoever sits on it) ...
function lngCouchBack() {
  const c = ctx;
  for (const s of [-1, 1]) { rrect(c, 540 + s * 380 - 60, 1380, 120, 60, 10); c.fillStyle = '#0C1F24'; c.fill(); }   // feet
  rrect(c, 150, 890, 780, 440, 70); c.fillStyle = '#1F5965'; c.fill();
  for (const x of [176, 546]) {   // back cushions
    rrect(c, x, 916, 358, 330, 56); c.fillStyle = '#2C7483'; c.fill();
    paint(() => { c.beginPath(); c.moveTo(x + 50, 934); c.quadraticCurveTo(x + 179, 922, x + 308, 934); c.lineWidth = 5; c.strokeStyle = 'rgba(190,240,250,0.16)'; c.lineCap = 'round'; c.stroke(); });
  }
  for (const x of [172, 546]) { rrect(c, x, 1212, 362, 128, 34); c.fillStyle = '#35899A'; c.fill(); }   // seat cushions
  paint(() => { line(c, 196, 1222, 510, 1222, 4, 'rgba(200,245,255,0.14)'); line(c, 570, 1222, 884, 1222, 4, 'rgba(200,245,255,0.14)'); });
}
// ... and its arms + base (in front of the cushions, behind the shins)
function lngCouchFront() {
  const c = ctx;
  rrect(c, 150, 1322, 780, 78, 22); c.fillStyle = '#12363E'; c.fill();
  for (const x of [96, 838]) {
    rrect(c, x, 1030, 146, 372, 62); c.fillStyle = '#225F6C'; c.fill();
    paint(() => { rrect(c, x + 12, 1040, 122, 70, 34); c.fillStyle = 'rgba(190,240,250,0.10)'; c.fill(); });
  }
}
// seated legs: thighs toward the camera (foreshortened), shins down, shoes front-on. Rig-local.
function lngLegs(c, x, y, s, pal) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    rrect(c, sd * 41 - 25, 30, 50, 180, 20); c.fillStyle = pal.pantsSh; c.fill();
    rrect(c, sd * 39 - 31, -26, 62, 78, 28); c.fillStyle = pal.pants; c.fill();
    drawShoe(c, [sd * 41, 196], sd, pal, 1, false);
  }
  c.restore();
}
// a cushion and a throw for the right-hand seat (so the couch is lived in), and the cat's toy mouse on the floor
function lngClutter() {
  const c = ctx;
  c.save(); c.translate(772, 1150); c.rotate(0.18); rrect(c, -78, -66, 156, 132, 30); c.fillStyle = '#E8A04A'; c.fill();
  paint(() => { for (let i = -2; i <= 2; i++) line(c, -60, i * 24, 60, i * 24, 4, 'rgba(120,60,10,0.25)'); }); c.restore();
  ellipse(c, 300, 1500, 34, 20, '#8A93AE'); circle(c, 272, 1490, 11, '#8A93AE');
  paint(() => { circle(c, 266, 1488, 3, '#1A1A22'); c.beginPath(); c.moveTo(332, 1502); c.quadraticCurveTo(372, 1482, 386, 1516); c.lineWidth = 4; c.strokeStyle = '#8A93AE'; c.lineCap = 'round'; c.stroke(); });
}

// ---------------------------------------------------------------- the hero on the couch
function lngHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function lngHeadPt(st, lx, ly) { const p = lngHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
function lngHeadSpace(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
const LNG_LAP = { x: 0, y: -14, s: 0.72 };   // where she sits on his lap (rig-local), and how big

// his rig state for a description A (no drawing)
function lngSt(A = {}) {
  const base = { hipY: -34 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 };
  let p = base;
  p = ikReach(p, 'L', A.handL || [-58, -40], A.bendL === undefined ? -1 : A.bendL);
  p = ikReach(p, 'R', A.handR || [58, -40], A.bendR === undefined ? -1 : A.bendR);
  return { x: LNG.hx + (A.dx || 0), y: LNG.seatY, s: LNG.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: true, seed: 4 };
}
// Draw him on the couch from a description A:
//   face, headDX, headDY, headRot, lean, bob, handL / handR: rig-local wrist targets, bendL / bendR
//   cat: the options of purCat for the cat on his lap (null = no cat there); catAt: {x, y, s} overrides LNG_LAP
//   scratch 0..1: the fingers of his right hand work (toward scratchUp, an angle)
//   bowl: {full} a food bowl held up in his right hand; tie 0..1: a bow tie
//   ambient
// Returns {st, r, head, eyeL, eyeR, cat: {x, y, s} in world coords, handR: [x, y] world}
function lngHero(cam, t, A = {}) {
  const pal = A.pal || LNGPAL, st = lngSt(A), out = {};
  const lap = A.catAt || LNG_LAP;
  const r = lngLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.08 : A.ambient,
    pre: (lc) => actor(() => lngLegs(lc, st.x, st.y, st.s, pal)),
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      if (A.tie > 0.01) purBowTie(lc, rr.neck[0], rr.neck[1] + 22, A.tie);
      if (A.cat) {
        actor(() => purCat(lc, lap.x, lap.y, lap.s, t, A.cat));
        if (A.catMarks > 0.02) purMarks(lc, lap.x, lap.y, lap.s, t, A.catMarks);
        // his forearms and hands again, in front of her
        for (const k of ['L', 'R']) {
          const el = rr['el' + k], wr = rr['wr' + k], d = rr['armDir' + k], sd = k === 'L' ? -1 : 1;
          capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
          line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
          if (k === 'R' && A.scratch > 0.02) purFingers(lc, wr[0] + d[0] * 14, wr[1] + d[1] * 14, A.scratchUp === undefined ? -Math.PI / 2 - 0.25 : A.scratchUp, t, pal, A.scratch);
          drawHand(lc, wr, d, k === 'R' && A.scratch > 0.02 ? 'fist' : 'open', pal, sd, t);
        }
      }
      if (A.bowl) {
        const wr = rr.wrR, d = rr.armDirR, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14;
        purBowl(lc, hx + (A.bowl.dx || 0), hy - 44, 0.78, A.bowl);
        drawHand(lc, wr, d, 'open', pal, 1, t);
        out.bowlLocal = [hx + (A.bowl.dx || 0), hy - 44];
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  out.st = st; out.r = r;
  out.head = lngHeadPt(st, 0, 0); out.mouth = lngHeadPt(st, 0, 40); out.chin = lngHeadPt(st, 0, 66);
  out.earR = lngHeadPt(st, 62, 2); out.eyeL = lngHeadPt(st, -24, -2); out.eyeR = lngHeadPt(st, 24, -2);
  out.cat = { x: st.x + lap.x * st.s, y: st.y + lap.y * st.s, s: lap.s * st.s };
  out.handR = [st.x + (r.wrR[0] + r.armDirR[0] * 14) * st.s, st.y + (r.wrR[1] + r.armDirR[1] * 14) * st.s];
  if (out.bowlLocal) out.bowl = [st.x + out.bowlLocal[0] * st.s, st.y + out.bowlLocal[1] * st.s];
  return out;
}

// kit.js's charLayer with a `pre` step (his legs on the seat go on his own layer)
function lngLayer(cam, st, t, o = {}) {
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  if (o.pre) o.pre(lctx);
  const r = drawCharacter(lctx, st, t, o.pal || PAL);
  if (o.post) o.post(lctx, r, st);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  if (o.ambient) { lctx.fillStyle = `rgba(16,20,60,${o.ambient})`; lctx.fillRect(0, 0, W, H); }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  return r;
}

// his faces
const LNGFACE = {
  // looking down at her, pleased
  fond: { eyeOpen: 0.92, pupil: 1.05, lookX: 0.05, lookY: 1.0, browY: 0.5, browTilt: 0.2, mouth: 'flat', mouthOpen: 2.4, blink: 0.18, cross: 0 },
  // to us: see? happy cat
  proud: { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0, browY: 1.1, browTilt: -0.1, mouth: 'grin', mouthOpen: 0.9, blink: 0, cross: 0 },
  // ... maybe?
  unsure: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.1, lookY: 0.9, browY: 0.9, browTilt: 0.9, mouth: 'flat', mouthOpen: -0.6, blink: 0, cross: 0 },
  // melted
  aww: { eyeOpen: 1.12, pupil: 1.2, lookX: 0.05, lookY: 1.0, browY: 1.0, browTilt: 1.5, mouth: 'flat', mouthOpen: 2.8, blink: 0, cross: 0 },
  // asleep sitting up, mouth open
  asleep: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: 0.1, mouth: 'o', mouthOpen: 0.5, blink: 1, cross: 0 },
  // five in the morning, awake, not by choice
  awake: { eyeOpen: 1.35, pupil: 0.6, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.3, mouth: 'flat', mouthOpen: -0.4, blink: 0, cross: 0 },
  // the stare of a man who has understood his place
  beaten: { eyeOpen: 1, pupil: 0.95, lookX: 0, lookY: 0, browY: -0.4, browTilt: -0.1, mouth: 'flat', mouthOpen: -0.5, blink: 0.42, cross: 0 },
};
