// Why Do Some People Have NO Wrist Tendon? Short: his living room at night, seen from the TV (the camera IS the TV: its
// cool light flickers on him from the front), borrowed from vulcan-salute's room.js as it was; the hero close in it, in a
// mustard T-shirt, one or both forearms up, palm to us, doing the test.
//   initRoom()                 paints the room once (out of focus: it is far behind him)
//   roomBack(cam, t)           the room, far behind him (it moves only a little with the camera)
//   tvFlick(t)                 0..1, the TV's flicker (on a clock that goes round a whole number of times in the Short)
//   wtSt(A), wtHero(cam, t, A) him, from a description A (below); wtHero returns points in world coords
//   wtHeadPt(st, lx, ly)       a head-unit point -> world
'use strict';

const VS = { hx: 540, hy: 1500, hs: 1 };                    // the rig's feet (world); his head's middle is at (540, 1030)
const VS_CAMY = 1090;                                        // the camera height the room was painted for
let ROOM_C = null;

// a mustard T-shirt (short sleeves: his forearms are bare)
const WTPAL = Object.assign({}, PAL, { coat: '#E9A93A', coatSh: '#B97A1C', coatHi: '#FFD27A', coatDk: '#8E5A12', pj: true });

// ---------------------------------------------------------------- the room (painted once, out of focus)
function initRoom() {
  const c0 = mkCanvas(1080, 1920), x = c0.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#0E1A30'); g.addColorStop(0.5, '#16263F'); g.addColorStop(1, '#0A1120');
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 7; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.05)'; x.fillRect(i * 160, 0, 160, 1920); }
  // a poster of a ringed planet, upper left
  x.save(); x.translate(250, 520);
  rrect(x, -120, -160, 240, 320, 8); x.fillStyle = '#1D1238'; x.fill();
  rrect(x, -108, -148, 216, 296, 6); x.fillStyle = '#2A1B54'; x.fill();
  for (let i = 0; i < 26; i++) { const r = mulberry32(40 + i); circle(x, -100 + r() * 200, -140 + r() * 280, 1.5 + r() * 2, 'rgba(255,255,255,0.6)'); }
  ellipse(x, 0, 10, 58, 58, '#E58E4F'); ellipse(x, -12, -6, 40, 36, '#F2B07A');
  x.save(); x.rotate(-0.3); x.beginPath(); x.ellipse(0, 10, 104, 22, 0, 0, 7); x.lineWidth = 9; x.strokeStyle = '#F6D7A6'; x.stroke(); x.restore();
  x.restore();
  // a shelf on the right with a baseball in a cube, books and a plant (behind his raised hand: kept dark)
  x.fillStyle = '#0B1424'; x.fillRect(640, 760, 380, 18);
  for (let i = 0; i < 6; i++) { rrect(x, 660 + i * 26, 650 - (i % 3) * 14, 22, 110 + (i % 3) * 14, 3); x.fillStyle = ['#3B2A55', '#2A3F5C', '#4A2836'][i % 3]; x.fill(); }
  x.save(); x.translate(900, 712);
  rrect(x, -40, -46, 80, 92, 6); x.fillStyle = 'rgba(160,190,230,0.16)'; x.fill();
  circle(x, 0, 6, 26, '#D8D2C4');
  x.beginPath(); x.arc(-34, 6, 26, -0.7, 0.7); x.lineWidth = 3; x.strokeStyle = '#C9473F'; x.stroke();
  x.beginPath(); x.arc(34, 6, 26, Math.PI - 0.7, Math.PI + 0.7); x.stroke();
  x.restore();
  // a floor lamp at the far left: its shade (lit from inside)
  x.beginPath(); x.moveTo(30, 820); x.lineTo(150, 820); x.lineTo(124, 720); x.lineTo(56, 720); x.closePath(); x.fillStyle = '#F2C27E'; x.fill();
  x.fillStyle = '#2B2230'; x.fillRect(86, 820, 8, 700);
  // a window at the far right, blinds half down, the city's lights beyond
  x.save(); x.translate(980, 300);
  rrect(x, -110, -150, 220, 360, 6); x.fillStyle = '#0A1830'; x.fill();
  for (let i = 0; i < 40; i++) { const r = mulberry32(90 + i); if (r() < 0.55) x.fillStyle = r() < 0.5 ? 'rgba(255,214,140,0.65)' : 'rgba(170,210,255,0.55)', x.fillRect(-100 + r() * 190, 40 + r() * 150, 6, 9); }
  for (let i = 0; i < 9; i++) { x.fillStyle = '#1E2C48'; x.fillRect(-110, -150 + i * 22, 220, 12); }
  x.restore();
  // the couch's back, low behind him
  rrect(x, -40, 1330, 1160, 300, 60); x.fillStyle = '#2B1E3A'; x.fill();
  rrect(x, -40, 1330, 1160, 40, 20); x.fillStyle = '#3A2A4E'; x.fill();
  ROOM_C = mkCanvas(1080, 1920);
  const y = ROOM_C.getContext('2d');
  y.filter = 'blur(7px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
}
function tvFlick(t) {
  const w = loopW(5.3), w2 = loopW(13.1);
  return 0.5 + 0.28 * Math.sin(t * w) + 0.16 * Math.sin(t * w2 + 1.3) + 0.06 * Math.sin(t * loopW(31) + 0.4);
}
function roomBgCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.35, y: 960 + (cam.y - VS_CAMY) * 0.35, zoom: 1.12 + 0.05 * (cam.zoom - 2.4), rot: 0, sx: (cam.sx || 0) * 0.15, sy: (cam.sy || 0) * 0.15 };
}
function roomBack(cam, t) {
  const bc = roomBgCam(cam);
  screenSpace(); ctx.fillStyle = '#0A1120'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(ROOM_C, 0, 0);
  softDot(gctx, 90, 770, 160, '#FFC27A', 0.32); softDot(gctx, 90, 800, 380, '#FF9A50', 0.08);   // the lamp
  softDot(gctx, 980, 400, 200, '#8FB8FF', 0.10);                                                 // the window
  screenSpace();
  const f = tvFlick(t);
  softDot(gctx, 540, 900, 700, '#7FB6FF', 0.05 + 0.05 * f);
}

// ---------------------------------------------------------------- the hero
function wtHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function wtHeadPt(st, lx, ly) { const p = wtHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
function wtInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// arm positions, {e: elbow, w: wrist} (rig-local). R = the arm on the screen's right (his left: the test hand), L = the other
const WT_ARM = {
  up: { e: [144, -278], w: [125, -440] },           // forearm up beside his face, palm to us
  look: { e: [140, -282], w: [112, -444] },         // a little closer in, to look at it
  restR: { e: [96, -271], w: [116, -186] },         // hanging
  restL: { e: [-90, -271], w: [-113, -184] },       // hanging
  upL: { e: [-144, -278], w: [-125, -440] },        // the other forearm up, the same way
  gripR: { e: [150, -230], w: [96, -300] },         // fists in front of his chest (the grip meters)
  gripL: { e: [-150, -230], w: [-96, -300] },
};
// his rig state for a description A (no drawing)
function wtSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
  const aR = A.armR || WT_ARM.up, aL = A.armL || WT_ARM.restL;
  p = armAt(p, 'R', aR.e, aR.w);
  p = armAt(p, 'L', aL.e, aL.w);
  return { x: VS.hx + (A.dx || 0), y: VS.hy + (A.dy || 0), s: VS.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, seed: 4, noArms: true };
}
// the hand's frame at a wrist: up the forearm, turned by handRot. Returns {o, ang, s, fa (the forearm in hand units)}
function wtHandFrame(rr, k, A, Hs) {
  const el = rr['el' + k], wr = rr['wr' + k], d = [wr[0] - el[0], wr[1] - el[1]], L = Math.hypot(d[0], d[1]) || 1;
  const ang = Math.atan2(d[0] / L, -d[1] / L) + ((k === 'R' ? A.handRot : A.handRotL) || 0), s = A.handS || 0.8;
  return { o: [wr[0] + (d[0] / L) * 6, wr[1] + (d[1] / L) * 6], ang, s, fa: (L + 6) / (s * (Hs || 1)) };
}
// Draw him from a description A:
//   face, headDX, headDY, headRot, lean, bob, dx, dy
//   armR / armL: {e, w} (WT_ARM, armMix)
//   HR: the test hand (screen right, his left; wrist.js H), HL: the other hand when it is up too (it is drawn mirrored),
//     handRot / handRotL, handS
//   glove: {k, at, rot} a surgeon's glove pinching the test hand's cord (hand units of that hand)
//   fistL / fistR: a fist at that wrist instead of an open hand (the grip meters' handles are drawn by the scene)
//   pal, ambient, tv (0..1 the TV's light on him), post(lc, r, st) more drawing in rig-local units
// Returns {st, r, head, F, FL, hp(q), hpL(q): hand points -> world, P, PL}
function wtHero(cam, t, A = {}) {
  const pal = A.pal || WTPAL, st = wtSt(A), out = {};
  const tv = A.tv === undefined ? 0.22 : A.tv;
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.03 : A.ambient, light: tv * (0.75 + 0.5 * tvFlick(t)),
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      // an upper arm: the short sleeve, then bare skin to the elbow
      const upper = (k) => {
        const sh = rr['sh' + k], el = rr['el' + k], m = [lerp(sh[0], el[0], 0.42), lerp(sh[1], el[1], 0.42)];
        capsuleShaded(lc, [lerp(sh[0], el[0], 0.3), lerp(sh[1], el[1], 0.3)], el, 34, pal.skin, pal.skinSh, pal.skinHi, pal);
        capsuleShaded(lc, sh, m, 46, pal.coat, pal.coatSh, pal.coatHi, pal);
      };
      // a hanging arm (forearm as a skin capsule, an open hand or a fist)
      const hanging = (k, side) => {
        upper(k);
        capsuleShaded(lc, rr['el' + k], rr['wr' + k], 32, pal.skin, pal.skinSh, pal.skinHi, pal);
        drawHand(lc, rr['wr' + k], rr['armDir' + k], (k === 'L' ? A.fistL : A.fistR) ? 'fist' : 'open', pal, side, t);
      };
      const raised = (k, H, mirror) => {
        actor(() => upper(k));
        const F = wtHandFrame(rr, k, A, (H && H.s) || 1);
        lc.save(); lc.translate(F.o[0], F.o[1]); lc.rotate(F.ang); lc.scale(F.s, F.s);
        let P = null;
        actor(() => { P = wtHand(lc, pal, Object.assign({ fa: F.fa, mirror }, H), t); });
        if (k === 'R' && A.glove) actor(() => wtGlove(lc, A.glove, t));
        lc.restore();
        return { F, P };
      };
      if (A.HL) { const o = raised('L', A.HL, -1); out.FL = o.F; out.PL = o.P; }
      else actor(() => hanging('L', -1));
      if (A.HR) { const o = raised('R', A.HR, 1); out.F = o.F; out.P = o.P; }
      else actor(() => hanging('R', 1));
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  out.st = st; out.r = r; out.head = wtHeadPt(st, 0, 0);
  const mk = (F, H, mir) => (q) => {   // a hand-unit point (canonical) -> world
    if (!F) return [0, 0];
    const v = clamp((H || {}).view || 0), sx = -Math.cos(Math.PI * v), sxx = (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx) * mir;
    const hs = (H && H.s) || 1, hr = (H && H.rot) || 0;
    const qq = [q[0] * hs * sxx, q[1] * hs];
    const rx = Math.cos(hr) * qq[0] - Math.sin(hr) * qq[1], ry = Math.sin(hr) * qq[0] + Math.cos(hr) * qq[1];
    const a = F.ang, wx = F.o[0] + (rx * Math.cos(a) - ry * Math.sin(a)) * F.s, wy = F.o[1] + (rx * Math.sin(a) + ry * Math.cos(a)) * F.s;
    return [st.x + wx * st.s, st.y + wy * st.s];
  };
  out.hp = mk(out.F, A.HR, 1); out.hpL = mk(out.FL, A.HL, -1);
  return out;
}
