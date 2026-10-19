// Why Is the Vulcan Salute So HARD? Short: his living room at night, seen from the TV (the camera IS the TV: its cool
// light flickers on him from the front), and the hero close in it, in burgundy pyjamas, his left hand up beside his face.
//   initRoom()                 paints the room once (out of focus: it is far behind him)
//   roomBack(cam, t)           the room, far behind him (it moves only a little with the camera)
//   tvFlick(t)                 0..1, the TV's flicker (on a clock that goes round a whole number of times in the Short)
//   vsSt(A), vsHero(cam, t, A) him, from a description A (below); vsHero returns points in world coords
//   vsHeadPt(st, lx, ly)       a head-unit point -> world
'use strict';

const VS = { hx: 540, hy: 1500, hs: 1 };                    // the rig's feet (world); his head's middle is at (540, 1030)
const VS_CAMY = 1090;                                        // the camera height the room was painted for
let ROOM_C = null;

// burgundy pyjamas
const VSPAL = Object.assign({}, PAL, { coat: '#C2465A', coatSh: '#93303F', coatHi: '#F07C8C', coatDk: '#6E2230', pj: true });

// ---------------------------------------------------------------- the room (painted once, out of focus)
function initRoom() {
  const c0 = mkCanvas(1080, 1920), x = c0.getContext('2d');
  // the wall: a deep teal-navy with faint panels
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
  // a shelf on the right with a toy rocket, books and a plant (behind his raised hand: kept dark)
  x.fillStyle = '#0B1424'; x.fillRect(640, 760, 380, 18);
  for (let i = 0; i < 6; i++) { rrect(x, 660 + i * 26, 650 - (i % 3) * 14, 22, 110 + (i % 3) * 14, 3); x.fillStyle = ['#3B2A55', '#2A3F5C', '#4A2836'][i % 3]; x.fill(); }
  // the rocket
  x.save(); x.translate(900, 690);
  rrect(x, -16, -60, 32, 92, 16); x.fillStyle = '#C9D2E8'; x.fill();
  x.beginPath(); x.moveTo(-16, -40); x.quadraticCurveTo(0, -96, 16, -40); x.closePath(); x.fillStyle = '#E8564C'; x.fill();
  for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 16, 10); x.lineTo(s * 34, 36); x.lineTo(s * 16, 30); x.closePath(); x.fillStyle = '#E8564C'; x.fill(); }
  circle(x, 0, -24, 9, '#6FB6D8');
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
  // out of focus
  ROOM_C = mkCanvas(1080, 1920);
  const y = ROOM_C.getContext('2d');
  y.filter = 'blur(7px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
}
function tvFlick(t) {
  const w = loopW(5.3), w2 = loopW(13.1);
  return 0.5 + 0.28 * Math.sin(t * w) + 0.16 * Math.sin(t * w2 + 1.3) + 0.06 * Math.sin(t * loopW(31) + 0.4);
}
// the room is far behind him: it grows and slides only a little as the camera moves
function roomBgCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.35, y: 960 + (cam.y - VS_CAMY) * 0.35, zoom: 1.12 + 0.05 * (cam.zoom - 2.4), rot: 0, sx: (cam.sx || 0) * 0.15, sy: (cam.sy || 0) * 0.15 };
}
function roomBack(cam, t) {
  const bc = roomBgCam(cam);
  screenSpace(); ctx.fillStyle = '#0A1120'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(ROOM_C, 0, 0);
  softDot(gctx, 90, 770, 160, '#FFC27A', 0.55); softDot(gctx, 90, 800, 380, '#FF9A50', 0.14);   // the lamp
  softDot(gctx, 980, 400, 200, '#8FB8FF', 0.10);                                                 // the window
  // the TV's light on the wall behind him (it flickers)
  screenSpace();
  const f = tvFlick(t);
  softDot(gctx, 540, 900, 700, '#7FB6FF', 0.05 + 0.05 * f);
}

// ---------------------------------------------------------------- the hero
function vsHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function vsHeadPt(st, lx, ly) { const p = vsHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
function vsInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// arm positions, {e: elbow, w: wrist} (rig-local). R = the arm on the screen's right (the saluting hand), L = the other
const VS_ARM = {
  up: { e: [158, -296], w: [160, -392] },           // the hand up beside his face
  look: { e: [156, -294], w: [152, -396] },         // turned toward his face to look at it
  restL: { e: [-90, -271], w: [-113, -184] },       // hanging
  helpL: { e: [-40, -262], w: [96, -432] },         // across his chest, up to the other hand's fingers
  downR: { e: [96, -271], w: [116, -186] },         // hanging
};
// his rig state for a description A (no drawing)
function vsSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
  p = armAt(p, 'R', (A.armR || VS_ARM.up).e, (A.armR || VS_ARM.up).w);
  let armL = A.armL || VS_ARM.restL;
  if (A.help) {
    // the helping hand grips the saluting hand's fingers: put its wrist where the grip needs it, the elbow low in front
    const rr = rig(p), F = vsHandFrame(rr, A), H = A.H || {}, v = clamp(H.view || 0), sx = -Math.cos(Math.PI * v) >= 0 ? 1 : -1;
    const at = A.help.at || [20, -128], k = clamp(A.help.k === undefined ? 1 : A.help.k), hs = (H.s || 1) * F.s;
    const q = [(at[0] + 7 * k + VH_HELP_WRIST[0]) * sx * hs, (at[1] + VH_HELP_WRIST[1]) * hs];
    const wr = [F.o[0] + q[0] * Math.cos(F.ang) - q[1] * Math.sin(F.ang), F.o[1] + q[0] * Math.sin(F.ang) + q[1] * Math.cos(F.ang)];
    const drop = A.help.drop || 0;   // the hand dropping away, down out of the camera's frame
    const w2 = [lerp(wr[0], -60, drop), lerp(wr[1], -150, drop)];
    armL = { e: [lerp(46, -60, drop), lerp(-246, -232, drop)], w: w2 };
  }
  p = armAt(p, 'L', armL.e, armL.w);
  return { x: VS.hx + (A.dx || 0), y: VS.hy + (A.dy || 0), s: VS.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, seed: 4, noArms: true };
}
// the hand's frame at the right wrist: up the forearm, turned by A.handRot
function vsHandFrame(rr, A) {
  const el = rr.elR, wr = rr.wrR, d = [wr[0] - el[0], wr[1] - el[1]], L = Math.hypot(d[0], d[1]) || 1;
  const ang = Math.atan2(d[0] / L, -d[1] / L) + (A.handRot || 0);
  return { o: [wr[0] + (d[0] / L) * 6, wr[1] + (d[1] / L) * 6], ang, s: A.handS || 1.18 };
}
// Draw him from a description A:
//   face, headDX, headDY, headRot, lean, bob, dx, dy
//   armR / armL: {e, w} (VS_ARM, armMix)
//   H: the saluting hand (hand.js), handRot, handS
//   help: the other hand pinching his fingers (vsHelper's Hp; give armL too), or null
//   tongue 0..1 (the tip of his tongue out at the corner: concentrating), sweat 0..1
//   pal, ambient, tv (0..1 the TV's light on him), post(lc, r, st, F) more drawing in rig-local units (F = the hand's frame)
// Returns {st, r, head, F, hp(q): hand point -> world, P: the hand's points}
function vsHero(cam, t, A = {}) {
  const pal = A.pal || VSPAL, st = vsSt(A), out = {};
  const tv = A.tv === undefined ? 0.22 : A.tv;
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.03 : A.ambient, light: tv * (0.75 + 0.5 * tvFlick(t)),
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      // the tongue, out at the corner of his mouth (concentrating), and a bead of sweat
      vsInHead(lc, s2, (c) => {
        const tg = A.tongue || 0;
        if (tg > 0.02) paint(() => { ellipse(c, 15, 44 + 3 * tg, 7 * tg, 5.5 * tg, pal.tongue, 0.4); line(c, 15, 42 + 3 * tg, 17 + 2 * tg, 47 + 3 * tg, 1.2, 'rgba(120,30,40,0.5)'); });
        const sw = A.sweat || 0;
        if (sw > 0.02) paint(() => { c.save(); c.translate(-46, -30 + 10 * sw); c.scale(sw, sw); c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(8, 2, 0, 6); c.quadraticCurveTo(-8, 2, 0, -12); c.fillStyle = '#BFF0FF'; c.fill(); c.restore(); });
      });
      // the other arm: hanging, or across his chest to help
      const armOf = (k) => {
        capsuleShaded(lc, rr['sh' + k], rr['el' + k], 42, pal.coat, pal.coatSh, pal.coatHi, pal);
        capsuleShaded(lc, rr['el' + k], rr['wr' + k], 38, pal.coat, pal.coatSh, pal.coatHi, pal);
        const d = rr['armDir' + k], wr = rr['wr' + k];
        line(lc, wr[0] - d[0] * 8, wr[1] - d[1] * 8, wr[0] + d[0] * 1, wr[1] + d[1] * 1, 44, pal.coatSh);
      };
      if (!A.help) actor(() => { armOf('L'); drawHand(lc, rr.wrL, rr.armDirL, 'open', pal, -1, t); });
      // the saluting arm, then the hand at its wrist
      actor(() => armOf('R'));
      const F = vsHandFrame(rr, A);
      lc.save(); lc.translate(F.o[0], F.o[1]); lc.rotate(F.ang); lc.scale(F.s, F.s);
      actor(() => { out.P = vsHand(lc, pal, A.H || {}, t); });
      lc.restore();
      // the other hand, helping: its arm across his chest, in front of the saluting hand's wrist
      if (A.help) {
        actor(() => armOf('L'));
        if ((A.help.drop || 0) < 0.12) {
          lc.save(); lc.translate(F.o[0], F.o[1]); lc.rotate(F.ang); lc.scale(F.s, F.s);
          const v = clamp((A.H || {}).view || 0), sx = -Math.cos(Math.PI * v), hs = (A.H && A.H.s) || 1;
          lc.scale((sx >= 0 ? 1 : -1) * hs, hs);
          actor(() => vsHelper(lc, pal, A.help, t));
          lc.restore();
        } else actor(() => drawHand(lc, rr.wrL, rr.armDirL, 'fist', pal, -1, t));
      }
      out.F = F;
      if (A.post) A.post(lc, rr, s2, F);
      lc.restore();
    },
  });
  out.st = st; out.r = r; out.head = vsHeadPt(st, 0, 0);
  const F = out.F, v = clamp((A.H || {}).view || 0), sx = -Math.cos(Math.PI * v), sxx = (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx);
  const hs = (A.H && A.H.s) || 1, hr = (A.H && A.H.rot) || 0;
  out.hp = (q) => {   // a hand-unit point (canonical) -> world
    const qr = [q[0] * Math.cos(hr) - q[1] * Math.sin(hr), q[0] * Math.sin(hr) + q[1] * Math.cos(hr)];
    const lx = qr[0] * hs * sxx, ly = qr[1] * hs;   // scale after the rotation, as vsHand does: rotate, then scale
    const qq = [q[0] * hs * sxx, q[1] * hs];
    const rx = Math.cos(hr) * qq[0] - Math.sin(hr) * qq[1], ry = Math.sin(hr) * qq[0] + Math.cos(hr) * qq[1];
    void lx; void ly;
    const a = F.ang, wx = F.o[0] + (rx * Math.cos(a) - ry * Math.sin(a)) * F.s, wy = F.o[1] + (rx * Math.sin(a) + ry * Math.cos(a)) * F.s;
    return [st.x + wx * st.s, st.y + wy * st.s];
  };
  return out;
}
