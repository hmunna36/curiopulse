// His desk at night, seen from his monitor: the room painted once (far behind him, out of focus in the close shots),
// the hero in yellow pyjamas from a description (fists that grind into his eyes, one knuckle that rubs gently, a yawn),
// the stars he sees with his eyes shut (phosphenes), light that bounces off his fists, and his head turned to glass:
// two eyeballs, two cords, and a brain at the top of his skull with a phone.
// World units = the frame at zoom 1. The rig's feet stand at DK.hx, DK.hy; his head's middle is at (540, 1030).
'use strict';

const DK = { hx: 540, hy: 1500, hs: 1 };
const DK_HEAD = [DK.hx, DK.hy - 470 * DK.hs];
const DK_CAMY = 1030;                                       // the camera height the room was painted for
const DK_EYE = { x: 24, y: -2 };                            // his eyes in head units
let DK_ROOM = null;
// yellow pyjamas: the hiker's own yellow, at home at two in the morning
const DKPAL = Object.assign({}, PAL, { coat: '#F9BC38', coatSh: '#D58F1B', coatHi: '#FFE18F', coatDk: '#A96B10', pj: true });

// ---------------------------------------------------------------- the room
function dkPaintRoom() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, W * 0.5, H);
  g.addColorStop(0, '#1E2A5C'); g.addColorStop(0.55, '#141C44'); g.addColorStop(1, '#0A0F2A');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // a window on the left: blinds, a moon behind them
  rrect(c, 40, 380, 250, 520, 18); c.fillStyle = '#27356E'; c.fill();
  const wg = c.createLinearGradient(0, 400, 0, 880); wg.addColorStop(0, '#2B4AA0'); wg.addColorStop(1, '#16255E');
  rrect(c, 60, 400, 210, 480, 10); c.fillStyle = wg; c.fill();
  circle(c, 176, 520, 46, '#DDE8FF'); circle(c, 196, 506, 40, '#2A489C');
  for (let y = 416; y < 880; y += 34) { rrect(c, 56, y, 218, 12, 5); c.fillStyle = 'rgba(16,22,58,0.72)'; c.fill(); }
  rrect(c, 24, 892, 282, 26, 9); c.fillStyle = '#222C5C'; c.fill();
  // a poster above the desk, behind where his head will be (dark: nothing bright behind his face)
  rrect(c, 392, 330, 300, 220, 12); c.fillStyle = '#1A2350'; c.fill();
  c.lineWidth = 8; c.strokeStyle = '#27336C'; c.stroke();
  for (const [x, y, r] of [[470, 420, 34], [560, 470, 22], [620, 400, 14]]) circle(c, x, y, r, '#263470');
  // shelves on the right: books, a plant, a small lamp
  for (const y of [560, 800]) { rrect(c, 800, y, 300, 20, 8); c.fillStyle = '#27336C'; c.fill(); }
  const cols = ['#5B3F8E', '#2F6E8E', '#8E4F3F', '#3F8E6A', '#7A6A2E', '#4A4F9E'];
  let bx = 820;
  for (let i = 0; i < 7; i++) { const w = 22 + (i * 7) % 16, h = 110 + (i * 37) % 60; rrect(c, bx, 560 - h, w, h, 4); c.fillStyle = cols[i % cols.length]; c.fill(); bx += w + 5; }
  rrect(c, 846, 742, 64, 58, 12); c.fillStyle = '#7A4630'; c.fill();
  for (const [a, l] of [[-0.8, 80], [-0.2, 104], [0.4, 92], [0.95, 70]]) { c.save(); c.translate(878, 746); c.rotate(a); ellipse(c, 0, -l / 2, 14, l / 2, '#256A58'); c.restore(); }
  // the lamp, far right (warm; its glow goes into the glow layer in dkRoom)
  line(c, 1004, 800, 1004, 716, 9, '#3A2E5A');
  c.beginPath(); c.moveTo(958, 716); c.lineTo(1050, 716); c.lineTo(1030, 650); c.lineTo(978, 650); c.closePath(); c.fillStyle = '#FFD9A0'; c.fill();
  // a string of small lights along the top
  c.beginPath(); c.moveTo(0, 250); c.quadraticCurveTo(300, 330, 540, 268); c.quadraticCurveTo(800, 210, 1080, 300); c.lineWidth = 4; c.strokeStyle = '#0B1030'; c.stroke();
  return cv;
}
function initDesk() { DK_ROOM = dkPaintRoom(); }
// the room is far behind him: it grows and slides only a little as the camera moves
function dkBgCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.5, y: 960 + (cam.y - DK_CAMY) * 0.5, zoom: 1.1 + 0.035 * (cam.zoom - 3.6), rot: 0, sx: (cam.sx || 0) * 0.1, sy: (cam.sy || 0) * 0.1 };
}
const DK_BULBS = [[70, 268, '#FFD447'], [200, 296, '#7FE9FF'], [330, 306, '#FF86A6'], [470, 286, '#4DFFB4'], [610, 256, '#FFD447'], [750, 240, '#C8A8FF'], [890, 252, '#7FE9FF'], [1020, 284, '#FF86A6']];
// o: {dark: 0..1 (the room goes out as he presses), lamp: 0..1}
function dkRoom(cam, t, o = {}) {
  const bc = dkBgCam(cam), dark = clamp(o.dark || 0), lamp = (o.lamp === undefined ? 1 : o.lamp) * (1 - 0.85 * dark);
  screenSpace(); ctx.fillStyle = '#0A0F2A'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(DK_ROOM, 0, 0);
  for (let i = 0; i < DK_BULBS.length; i++) {
    const [x, y, col] = DK_BULBS[i], tw = 0.75 + 0.25 * Math.sin(t * loopW(1.4) + i * 1.7);
    circle(ctx, x, y, 9, col); softDot(gctx, x, y, 34, col, 0.5 * tw * lamp);
  }
  softDot(gctx, 1004, 690, 150, '#FFC27A', 0.55 * lamp); softDot(gctx, 1004, 720, 330, '#FF9A50', 0.14 * lamp);
  softDot(gctx, 176, 520, 120, '#9FB8FF', 0.34 * lamp);
  if (dark > 0.005) { screenSpace(); ctx.fillStyle = `rgba(3,4,16,${0.8 * dark})`; ctx.fillRect(0, 0, W, H); }
}
// the edge of his desk, in front of him (camera applied by the caller)
function dkDesk(o = {}) {
  const y = DK.hy - 196 * DK.hs;
  ctx.fillStyle = '#2A1F3F'; ctx.fillRect(-200, y, 1480, 600);
  ctx.fillStyle = '#3B2C58'; ctx.fillRect(-200, y, 1480, 14);
  if (o.mug !== false) {   // a mug, to his right
    rrect(ctx, 760, y - 74, 70, 80, 12); ctx.fillStyle = '#E86A5C'; ctx.fill();
    ctx.beginPath(); ctx.arc(836, y - 34, 20, -1.3, 1.3); ctx.lineWidth = 10; ctx.strokeStyle = '#E86A5C'; ctx.stroke();
    paint(() => { rrect(ctx, 772, y - 60, 46, 10, 5); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill(); });
  }
}

// ---------------------------------------------------------------- the hero
function dkHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function dkHeadPt(st, lx, ly) { const p = dkHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
// run fn in head units (origin at the head's middle) on a context that is in rig-local units
function dkInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// the same, on a context that has the camera applied (world units)
function dkInHeadW(c, st, fn) { c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); dkInHead(c, st, fn); c.restore(); }
// arm positions as {e: elbow, f: the middle of the fist} (rig-local). eyes = a fist on the eye of its own side
const DK_ARM = {
  eyesL: { e: [-132, -352], f: [-25, -471] }, eyesR: { e: [132, -352], f: [25, -471] },
  chinL: { e: [-118, -300], f: [-46, -392] }, chinR: { e: [118, -300], f: [46, -392] },
  deskL: { e: [-112, -262], f: [-70, -204] }, deskR: { e: [112, -262], f: [70, -204] },
  softR: { e: [124, -340], f: [36, -462] },                  // one knuckle at the outer corner of his eye
};
const dkArmMix = (a, b, k) => ({ e: [lerp(a.e[0], b.e[0], k), lerp(a.e[1], b.e[1], k)], f: [lerp(a.f[0], b.f[0], k), lerp(a.f[1], b.f[1], k)] });
const dkWrist = (arm) => { const dx = arm.f[0] - arm.e[0], dy = arm.f[1] - arm.e[1], L = Math.hypot(dx, dy) || 1; return [arm.f[0] - (dx / L) * 14, arm.f[1] - (dy / L) * 14]; };
// his rig state for a description A (no drawing)
function dkSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: A.hand || 'fist', feetFront: 0 };
  if (A.armR) p = armAt(p, 'R', A.armR.e, dkWrist(A.armR));
  if (A.armL) p = armAt(p, 'L', A.armL.e, dkWrist(A.armL));
  return { x: DK.hx + (A.dx || 0), y: DK.hy + (A.dy || 0), s: DK.hs * (A.s || 1), pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, frizz: A.frizz || 0, noLegs: !!A.noLegs, seed: 4 };
}
// a fist seen from the front: the back of the hand, four knuckles, a thumb tucked on the inner side. F = its middle,
// ang = how far it has twisted, s = which side's hand (-1 = screen left)
function dkFist(c, F, ang, pal, s, o = {}) {
  c.save(); c.translate(F[0], F[1]); c.rotate(ang);
  const R = o.r || 24;
  circle(c, 0, 0, R, pal.skin);
  for (let i = 0; i < 4; i++) circle(c, (-1.5 + i) * R * 0.44, -R * 0.62 + Math.abs(i - 1.5) * 2.4, R * 0.3, pal.skin);   // the knuckles, along the top
  circle(c, -s * R * 0.78, R * 0.18, R * 0.34, pal.skin);                                                            // the thumb
  paint(() => {
    for (let i = 0; i < 3; i++) line(c, (-1 + i) * R * 0.44, -R * 0.58, (-1 + i) * R * 0.44 + 1, R * 0.12, 2.2, 'rgba(170,88,60,0.42)');   // between the fingers
    c.beginPath(); c.arc(-s * R * 0.78, R * 0.18, R * 0.34, s > 0 ? -0.6 : Math.PI - 1.2, s > 0 ? 1.2 : Math.PI + 0.6); c.lineWidth = 2; c.strokeStyle = 'rgba(170,88,60,0.4)'; c.stroke();
  });
  c.restore();
}
// The hero at his desk. A: {armL, armR: {e, f} (DK_ARM, dkArmMix), fistL, fistR: {ang, r} (drawn again in front of
// his head when given), knuckleR: {k} (one bent finger instead of a fist), face, bob, lean, headRot, headDX, headDY,
// ambient, pre(lc), post(lc, r, st), pal, press: 0..1 (his cheeks ride up under the fists)}.
// Returns {st, r, head, eyeL, eyeR, top, chin, mouth, fistL, fistR (world points), K (world units per head unit)}.
function dkHero(cam, t, A = {}) {
  const pal = A.pal || DKPAL, st = dkSt(A), out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.05 : A.ambient,
    pre: A.pre ? (lc) => { lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s); A.pre(lc, st); lc.restore(); } : undefined,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      if (A.post) A.post(lc, rr, s2);
      for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
        const fi = A['fist' + k], arm = A['arm' + k];
        if (!fi || !arm) continue;
        const el = rr['el' + k], wr = rr['wr' + k], d = rr['armDir' + k];
        capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);                       // the forearm again, in front of his head
        line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
        if (fi.knuckle) {   // one bent index finger: its knuckle does the rubbing
          const F = arm.f, a = fi.ang || 0;
          lc.save(); lc.translate(F[0], F[1]); lc.rotate(a);
          circle(lc, 16, 22, 21, pal.skin);                                                           // the hand, below and outside
          line(lc, 12, 10, -2, -6, 12.5, pal.skin); line(lc, -2, -6, 10, -16, 11.5, pal.skin);     // the finger, bent
          paint(() => { for (let i = 0; i < 3; i++) line(lc, 6 + i * 8, 14, 9 + i * 8, 32, 2.2, 'rgba(170,88,60,0.42)'); });
          lc.restore();
        } else dkFist(lc, arm.f, fi.ang || 0, pal, s, fi);
      }
      lc.restore();
    },
  });
  const P = (lx, ly) => dkHeadPt(st, lx, ly);
  out.st = st; out.r = r; out.K = st.s; out.head = P(0, 0); out.top = P(0, -84); out.chin = P(0, 68); out.mouth = P(0, 40);
  out.eyeL = P(-DK_EYE.x, DK_EYE.y); out.eyeR = P(DK_EYE.x, DK_EYE.y); out.brain = P(0, -52);
  for (const k of ['L', 'R']) if (A['arm' + k]) { out['fist' + k] = [st.x + A['arm' + k].f[0] * st.s, st.y + A['arm' + k].f[1] * st.s]; out['el' + k] = [st.x + A['arm' + k].e[0] * st.s, st.y + A['arm' + k].e[1] * st.s]; }
  return out;
}

// ---------------------------------------------------------------- the stars he sees (phosphenes), screen space
const PH_COLS = ['#FFD447', '#7FE9FF', '#C8A8FF', '#4DFFB4', '#FF86A6', '#FFFFFF', '#8FB8FF'];
let PH = null;
function initStars() {
  const rng = mulberry32(2026);
  PH = [];
  for (let i = 0; i < 92; i++) {
    const a = rng() * Math.PI * 2, d = 0.16 + 0.84 * Math.pow(rng(), 0.8);
    const kind = ['star', 'star', 'star', 'dot', 'dot', 'ring', 'plus'][Math.floor(rng() * 7)];
    PH.push({ a, d, kind, col: PH_COLS[Math.floor(rng() * PH_COLS.length)], r: kind === 'dot' ? 7 + 10 * rng() : kind === 'ring' ? 18 + 24 * rng() : 24 + 44 * rng(),
      ph: rng() * 7, w: 2.5 + 4 * rng(), rot: rng() * 1.6, born: clamp(d * 0.9 + 0.12 * (rng() - 0.5), 0.02, 1), drift: 0.4 + rng() });
  }
  PH.sort((p, q) => p.born - q.born);
}
function phStarPath(c, r, thin = 0.22) {
  c.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * thin : r * (i % 4 === 0 ? 1 : 0.72); c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath();
}
// one star at a screen point (both layers). k = how far it has popped, a = its brightness
function phStar(x, y, r, col, k, a = 1, rot = 0, kind = 'star') {
  if (k <= 0.01 || a <= 0.01) return;
  const q = E.outBack(clamp(k), 2.2);
  for (const [c, sc] of [[ctx, 1], [gctx, 0.5]]) {
    c.save(); c.setTransform(sc, 0, 0, sc, 0, 0); c.translate(x, y); c.rotate(rot); c.scale(q, q);
    const g = c === gctx;
    if (kind === 'dot') { circle(c, 0, 0, g ? r * 1.6 : r, rgba(col, (g ? 0.55 : 1) * a)); if (!g) circle(c, -r * 0.25, -r * 0.25, r * 0.4, rgba('#FFFFFF', 0.9 * a)); }
    else if (kind === 'ring') { c.beginPath(); c.arc(0, 0, r, 0, 7); c.lineWidth = g ? 12 : 6; c.strokeStyle = rgba(col, (g ? 0.5 : 0.95) * a); c.stroke(); }
    else if (kind === 'plus') { line(c, -r * 0.7, 0, r * 0.7, 0, g ? 13 : 7, rgba(col, (g ? 0.5 : 0.95) * a)); line(c, 0, -r * 0.7, 0, r * 0.7, g ? 13 : 7, rgba(col, (g ? 0.5 : 0.95) * a)); }
    else {
      phStarPath(c, g ? r * 1.25 : r); c.fillStyle = rgba(col, (g ? 0.6 : 1) * a); c.fill();
      if (!g) { phStarPath(c, r * 0.5, 0.3); c.fillStyle = rgba('#FFFFFF', 0.92 * a); c.fill(); }
    }
    c.restore();
  }
}
// the field. k = how much of it is out (0..1), C = [x, y] the screen point they come from, keep = fn(x, y) -> 0..1
// (0 where a star must not show: his face, his arms), o: {a, spread, burst (a moment's kick outward)}
function phField(t, k, C, keep, o = {}) {
  if (k <= 0.001) return;
  const A = o.a === undefined ? 1 : o.a, sp = o.spread || 1;
  for (const p of PH) {
    const kk = clamp((k - p.born * 0.94) / 0.07);
    if (kk <= 0) break;
    const reach = (300 + 760 * p.d) * sp * (1 + 0.05 * (o.burst || 0)) + 10 * p.drift * Math.sin(t * loopW(0.6) + p.ph);
    let x = C[0] + Math.cos(p.a) * reach * 0.62, y = C[1] + Math.sin(p.a) * reach * 1.02;
    // a star that would land outside the frame is folded back in (clamping them piled a row of stars along the top edge)
    if (x < 50) x = 50 + (50 - x) * 0.8; if (x > W - 50) x = W - 50 - (x - (W - 50)) * 0.8;
    if (y < 170) y = 170 + (170 - y) * 0.9; if (y > H - 260) y = H - 260 - (y - (H - 260)) * 0.8;
    x = clamp(x, 40, W - 40); y = clamp(y, 150, H - 240);
    if (y > 1235 && y < 1440) y = y < 1340 ? 1235 - (y - 1235) * 0.4 : 1440 + (1440 - y) * 0.2;   // not in the captions' band
    const tw = 0.62 + 0.38 * Math.sin(t * p.w + p.ph), vis = keep ? keep(x, y) : 1;
    phStar(x, y, p.r * (0.86 + 0.14 * tw), p.col, kk, A * tw * vis, p.rot + 0.3 * Math.sin(t * 0.9 + p.ph), p.kind);
  }
}

// ---------------------------------------------------------------- the brain, with a phone
// (time-flies' brain, with a telephone.) o: {mood: calm | worried | squint | think | grin | sad | wow | shrug, look: [x, y],
// armL, armR: a target, noArms, still, bob, lean, shut}
function erBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * 2.4)) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    circle(c, tx, ty, 21, '#FFA9C0'); circle(c, tx + sd * 12, ty - 14, 9, '#FFA9C0');
  };
  if (!o.noArms) { arm(-1, o.armL); arm(1, o.armR); }
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();                      // the stem
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = '#FF93B0'; c.fill();
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    const lx = look[0] * 9, ly = look[1] * 7, shut = o.shut || 0;
    const ry = mood === 'squint' ? 13 : mood === 'worried' || mood === 'wow' ? 34 : mood === 'grin' ? 24 : mood === 'sad' ? 25 : 28;
    for (const ex of [-44, 38]) {
      if (shut > 0.6) { c.beginPath(); c.moveTo(ex - 22, 2); c.quadraticCurveTo(ex, 18, ex + 22, 2); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke(); continue; }
      ellipse(c, ex, 4, 25, ry * (1 - 0.5 * shut), '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry * (1 - 0.5 * shut), 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' || mood === 'wow' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    }
    const bt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' || mood === 'shrug' ? 0.5 : 0, by = mood === 'worried' || mood === 'wow' ? -46 : mood === 'squint' ? -24 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    if (mood === 'worried' || mood === 'wow') ellipse(c, -2, 64, mood === 'wow' ? 19 : 15, mood === 'wow' ? 17 : 12, '#5A1522');
    else if (mood === 'grin') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'sad') { c.beginPath(); c.moveTo(-18, 68); c.quadraticCurveTo(0, 54, 18, 68); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else if (mood === 'squint' || mood === 'think' || mood === 'shrug') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  c.restore();
}
// an old telephone: a red base with a dial and a handset across the top. ring 0..1 = it shakes; up 0..1 = the handset
// has left the cradle (the caller draws it in the brain's hand with erHandset)
function erPhone(c, x, y, s, t, o = {}) {
  const ring = o.ring || 0, sh = ring * 5 * Math.sin(t * 70);
  c.save(); c.translate(x + sh, y - Math.abs(sh) * 0.6); c.scale(s, s); c.rotate(0.05 * ring * Math.sin(t * 61));
  c.beginPath(); c.moveTo(-58, 40); c.lineTo(-44, -14); c.quadraticCurveTo(0, -30, 44, -14); c.lineTo(58, 40); c.closePath(); c.fillStyle = '#E2283C'; c.fill();
  rrect(c, -64, 34, 128, 16, 8); c.fillStyle = '#B01C2E'; c.fill();
  paint(() => { circle(c, 0, 12, 24, '#FFF4E0'); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283 + (ring ? t * 3 : 0); circle(c, Math.cos(a) * 15, 12 + Math.sin(a) * 15, 3.6, '#B01C2E'); } circle(c, 0, 12, 6, '#E2283C'); });
  if (!(o.up > 0.5)) erHandset(c, 0, -34, 1, 0);
  c.restore();
}
function erHandset(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-50, 0); c.quadraticCurveTo(0, -22, 50, 0); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#B01C2E'; c.stroke();
  rrect(c, -70, -8, 38, 30, 12); c.fillStyle = '#E2283C'; c.fill();
  rrect(c, 32, -8, 38, 30, 12); c.fillStyle = '#E2283C'; c.fill();
  c.restore();
}
// ring marks round a point (camera or screen space, whatever is applied): k = a pulse 0..1
function erRingArcs(c, x, y, r, k, col = '#FFD447', w = 5) {
  if (k <= 0.02) return;
  c.save(); c.lineCap = 'round'; c.lineWidth = w; c.strokeStyle = rgba(col, 0.95 * clamp(k * 1.5));
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) {
    const rr = r * (1 + 0.42 * i) * (1 + 0.18 * (1 - k));
    c.beginPath(); c.arc(x, y, rr, sd > 0 ? -0.95 : Math.PI - 0.35 - 0.6, sd > 0 ? -0.35 : Math.PI + 0.95 - 0.6 + 0.0); c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------- his head, turned to glass (head units, camera applied)
// X: {k: how far the glass has come (0..1), press: [L, R] how hard each fist presses (0..1), call: 0..1 how far a pulse
// has gone up the cords (>1 = arrived), ring: 0..1, pick: 0..1 the brain picks up, mood, look, fists: [[x, y], ...] in
// head units (ghost rings where his fists are), ray: {side, k} a streak through an eyeball, flash: [L, R], mask: 0..1 a
// sleep mask's outline, t}
function dkXray(st, X, t) {
  const k = clamp(X.k);
  if (k <= 0.01) return;
  paint(() => dkInHeadW(ctx, st, (c) => {
    // the glass spreads over his head from his eyes (nothing fades in: a fading shape is drawn without its light)
    const kk = E.outCubic(k);
    if (kk < 0.999) { c.beginPath(); c.ellipse(0, lerp(DK_EYE.y, -15, kk), 67 * kk, 93 * kk, 0, 0, 7); c.clip(); }
    // the glass
    c.beginPath(); c.ellipse(0, -15, 64, 89, 0, 0, 7); c.fillStyle = 'rgba(9,18,58,0.9)'; c.fill();
    c.lineWidth = 2.2; c.strokeStyle = 'rgba(127,233,255,0.85)'; c.stroke();
    // the cords, from the back of each eye up to the brain
    const cord = (sd) => [[sd * 24, -17], [sd * 27, -27], [sd * 12, -24], [sd * 4 - 7, -31]];
    for (const sd of [-1, 1]) {
      const P = cord(sd);
      c.beginPath(); c.moveTo(P[0][0], P[0][1]); c.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]);
      c.lineWidth = 4.2; c.lineCap = 'round'; c.strokeStyle = '#FF9A3C'; c.stroke();
    }
    // the eyeballs
    for (const [i, sd] of [[0, -1], [1, 1]]) {
      const pr = X.press ? X.press[i] : 0, ex = sd * DK_EYE.x, ey = DK_EYE.y, fl = X.flash ? X.flash[i] : 0;
      c.save(); c.translate(ex, ey); c.scale(1 + 0.05 * pr, 1 - 0.16 * pr);
      circle(c, 0, 0, 17.5, '#F4F8FF'); c.beginPath(); c.arc(0, 0, 17.5, 0, 7); c.lineWidth = 1.6; c.strokeStyle = '#7FB6FF'; c.stroke();
      circle(c, 0, 1, 8.4, '#3F7BD9'); circle(c, 0, 1, 4.2, '#0B1030'); circle(c, -2.4, -1.6, 1.7, '#FFFFFF');
      if (fl > 0.02) circle(c, 0, 0, 17.5, rgba('#FFF3B0', 0.75 * fl));
      c.restore();
    }
    // his fists, as ghosts
    if (X.fists) for (const F of X.fists) { c.beginPath(); c.arc(F[0], F[1], 24, 0, 7); c.setLineDash([5, 4]); c.lineWidth = 1.8; c.strokeStyle = 'rgba(127,233,255,0.75)'; c.stroke(); c.setLineDash([]); c.fillStyle = 'rgba(127,200,255,0.10)'; c.fill(); }
    if (X.mask > 0.02) { c.beginPath(); c.ellipse(0, -2, 52, 17, 0, 0, 7); c.setLineDash([5, 4]); c.lineWidth = 1.8; c.strokeStyle = rgba('#7FE9FF', 0.75 * X.mask); c.stroke(); c.setLineDash([]); }
    // the brain and its phone
    const pick = clamp(X.pick || 0), BX = -9, BY = -65, BS = 0.2;
    const PX = 39, PY = -58;
    erPhone(c, PX, PY, 0.2, t, { ring: (X.ring || 0) * (1 - pick), up: pick });
    erBrain(c, BX, BY, BS, t, { still: true, mood: X.mood || 'calm', look: X.look || [0, 0], shut: X.shut || 0, armL: [-170, 120], armR: pick > 0.5 ? [120, -6] : [176, 118] });
    if (pick > 0.5) erHandset(c, BX + 27, BY - 3, 0.2, -1.15);
  }));
  // what glows: a pulse up each cord, the phone's ring, a flash in an eyeball
  dkInHeadW(gctx, st, (g) => {
    for (const sd of [-1, 1]) softDot(g, sd * DK_EYE.x, DK_EYE.y, 30, '#9FC8FF', 0.16 * k);
    softDot(g, -9, -65, 46, '#FF93B0', 0.12 * k);
    if (X.flash) for (const [i, sd] of [[0, -1], [1, 1]]) if (X.flash[i] > 0.02) softDot(g, sd * DK_EYE.x, DK_EYE.y, 24, '#FFF3B0', 0.45 * X.flash[i]);
  });
  const call = X.call;
  if (call !== undefined && call > 0 && call < 1) {
    for (const sd of [-1, 1]) {
      const u = clamp(call), x = lerp(sd * 24, sd * 4 - 7, u * u) + sd * 5 * Math.sin(Math.PI * u), y = lerp(-17, -31, u);
      paint(() => dkInHeadW(ctx, st, (c) => circle(c, x, y, 3.4, '#FFFDF0')));
      dkInHeadW(gctx, st, (g) => softDot(g, x, y, 8, '#FFC24A', 0.7));
    }
  }
  if ((X.ring || 0) > 0.02 && !(X.pick > 0.5)) {
    paint(() => dkInHeadW(ctx, st, (c) => erRingArcs(c, 39, -64, 15, X.ring, '#FFD447', 2)));
    dkInHeadW(gctx, st, (g) => softDot(g, 39, -60, 17, '#FFD447', 0.32 * X.ring));
  }
}
