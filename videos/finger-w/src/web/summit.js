// Can You Make a W With Your FINGERS? Short: a mountain summit at golden hour, seen from his selfie stick (the camera IS
// his phone), and the hiker close in it, his right hand up beside his face (the vulcan-salute Short's room.js rig, moved
// outdoors: the hand is that Short's hand.js).
//   initSummit()               paints the far view once (out of focus: it is far behind him)
//   summitBack(cam, t)         the far view (it moves only a little with the camera), the sun's glow, the summit flag
//   vsSt(A), vsHero(cam, t, A) him, from a description A (below); vsHero returns points in world coords
//   vsHeadPt(st, lx, ly)       a head-unit point -> world
// Everything ambient runs on loopW(), so the last frame meets the first.
'use strict';

const VS = { hx: 540, hy: 1500, hs: 1 };                    // the rig's feet (world); his head's middle is at (540, 1030)
const VS_CAMY = 1090;                                        // the camera height the view was painted for
const FW_SUN = [40, 1300];                                  // the low sun, far left (screen of the painted view)
let SUMMIT_C = null;

// the hiker as always (yellow coat, teal straps) with a knitted teal hat for the summit
const VSPAL = Object.assign({}, PAL, {});
const FW_HAT = '#1CB3A4', FW_HAT_SH = '#117F74', FW_HAT_HI = '#57D9C9';

// ---------------------------------------------------------------- the far view (painted once, out of focus)
function initSummit() {
  const c0 = mkCanvas(1080, 1920), x = c0.getContext('2d');
  // the sky: deep blue overhead, violet, then a burning orange band at the horizon
  const g = x.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0.00, '#111A4A'); g.addColorStop(0.22, '#24307A'); g.addColorStop(0.42, '#55408E');
  g.addColorStop(0.55, '#A04F86'); g.addColorStop(0.64, '#EE7A4E'); g.addColorStop(0.70, '#FFB66A'); g.addColorStop(1, '#FFD9A0');
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  // a few first stars up top
  for (let i = 0; i < 46; i++) { const r = mulberry32(300 + i); const y = r() * 520; circle(x, r() * 1080, y, 1.2 + r() * 1.8, `rgba(255,255,255,${0.5 * (1 - y / 600)})`); }
  // the sun's halo, low on the left
  const sg = x.createRadialGradient(FW_SUN[0], FW_SUN[1], 10, FW_SUN[0], FW_SUN[1], 520);
  sg.addColorStop(0, 'rgba(255,236,190,0.95)'); sg.addColorStop(0.18, 'rgba(255,190,110,0.55)'); sg.addColorStop(1, 'rgba(255,140,80,0)');
  x.fillStyle = sg; x.fillRect(0, 600, 1080, 1100);
  circle(x, FW_SUN[0], FW_SUN[1], 58, '#FFF2CF');
  // thin cloud streaks across the orange band
  x.globalAlpha = 0.55;
  for (let i = 0; i < 9; i++) { const r = mulberry32(70 + i); rrect(x, -120 + r() * 1100, 860 + r() * 300, 260 + r() * 360, 10 + r() * 12, 8); x.fillStyle = r() < 0.5 ? '#FFC79A' : '#E58AA0'; x.fill(); }
  x.globalAlpha = 1;
  // far peaks: three ranges, violet to plum, the farthest hazy, snow on the near one's tops (lit from the left)
  const ranges = [[1260, 170, 150, 11, '#8F5E9C', 0.0], [1330, 230, 190, 23, '#6A3F7E', 0.55], [1420, 280, 230, 37, '#3F2659', 0.75]];
  for (const [y0, amp, step, seed, col, snow] of ranges) {
    const r = mulberry32(seed), pts = [];
    for (let px = -200; px <= 1300; px += step) {
      const a = px + (r() - 0.5) * step * 0.4;
      pts.push([a, y0 - amp * (0.35 + 0.65 * r())], [a + step * (0.45 + 0.2 * r()), y0 - amp * 0.15 * r()]);
    }
    x.fillStyle = col; x.beginPath(); x.moveTo(-200, 1920);
    for (const p of pts) x.lineTo(p[0], p[1]);
    x.lineTo(1300, 1920); x.closePath(); x.fill();
    if (snow > 0) {
      for (let j = 0; j < pts.length; j += 2) {
        const p = pts[j], h = (y0 - p[1]) * 0.28 * snow;
        if (h < 18) continue;
        x.fillStyle = 'rgba(255,214,190,0.85)';
        x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] - h * 0.8, p[1] + h); x.lineTo(p[0] - h * 0.25, p[1] + h * 0.7); x.lineTo(p[0] + h * 0.15, p[1] + h * 1.05); x.lineTo(p[0] + h * 0.45, p[1] + h * 0.6); x.closePath(); x.fill();
      }
    }
  }
  // the sea of clouds below the peaks, catching the sun
  for (let i = 0; i < 26; i++) {
    const r = mulberry32(500 + i), cx = -100 + i * 52 + r() * 30, cy = 1470 + r() * 90, rr = 70 + r() * 70;
    const cg = x.createRadialGradient(cx - rr * 0.3, cy - rr * 0.4, 4, cx, cy, rr);
    cg.addColorStop(0, '#FFE2C2'); cg.addColorStop(0.6, '#F2A6A6'); cg.addColorStop(1, '#B9709A');
    x.fillStyle = cg; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill();
  }
  x.fillStyle = '#B9709A'; x.fillRect(-100, 1560, 1300, 400);
  // the summit's own rock, dark, at the bottom (he stands on it)
  x.fillStyle = '#2B1B33';
  x.beginPath(); x.moveTo(-60, 1920); x.lineTo(-60, 1640); x.lineTo(160, 1590); x.lineTo(420, 1560); x.lineTo(700, 1575); x.lineTo(960, 1610); x.lineTo(1140, 1660); x.lineTo(1140, 1920); x.closePath(); x.fill();
  x.fillStyle = '#4A2F4C';
  x.beginPath(); x.moveTo(-60, 1640); x.lineTo(160, 1590); x.lineTo(420, 1560); x.lineTo(700, 1575); x.lineTo(960, 1610); x.lineTo(1140, 1660); x.lineTo(1140, 1690); x.lineTo(700, 1610); x.lineTo(160, 1625); x.closePath(); x.fill();
  // out of focus
  SUMMIT_C = mkCanvas(1080, 1920);
  const y = SUMMIT_C.getContext('2d');
  y.filter = 'blur(6px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
}
// the view is far behind him: it grows and slides only a little as the camera moves
function summitBgCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.30, y: 960 + (cam.y - VS_CAMY) * 0.30, zoom: 1.10 + 0.04 * (cam.zoom - 2.4), rot: (cam.rot || 0) * 0.3, sx: (cam.sx || 0) * 0.15, sy: (cam.sy || 0) * 0.15 };
}
function summitBack(cam, t, o = {}) {
  const bc = summitBgCam(cam);
  screenSpace(); ctx.fillStyle = '#111A4A'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(SUMMIT_C, 0, 0);
  softDot(gctx, FW_SUN[0], FW_SUN[1], 110, '#FFE3A8', 0.45); softDot(gctx, FW_SUN[0], FW_SUN[1], 300, '#FF9A50', 0.12);   // the sun
  // the summit flag on its pole, far right behind him (it flutters on the loop clock)
  const fx = 960, fy = 1040, w = loopW(1.9);
  ctx.fillStyle = '#3A2A3C'; ctx.fillRect(fx - 4, fy, 8, 560);
  ctx.beginPath(); ctx.moveTo(fx + 4, fy + 6);
  for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.lineTo(fx + 4 + 150 * u, fy + 6 + 14 * Math.sin(t * w - u * 4.2) * u); }
  for (let i = 10; i >= 0; i--) { const u = i / 10; ctx.lineTo(fx + 4 + 150 * u, fy + 92 + 14 * Math.sin(t * w - u * 4.2 + 0.3) * u); }
  ctx.closePath(); ctx.fillStyle = '#E8564C'; ctx.fill();
  // a few motes in the wind, drifting on the loop clock
  screenSpace();
  for (let i = 0; i < 14; i++) {
    const r = mulberry32(900 + i), ph = r() * 6.28, py = 300 + r() * 1300 + 30 * Math.sin(t * loopW(2.3 + r()) + ph);
    const px = 1080 * ((r() + (t / TLd.duration) * (1 + Math.floor(r() * 2))) % 1);
    softDot(gctx, px, py, 5 + r() * 6, '#FFE0B0', 0.25 + 0.2 * Math.sin(t * loopW(1.3) + ph));
  }
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
// arm positions, {e: elbow, w: wrist} (rig-local). R = the arm on the screen's right (the W hand), L = the selfie arm
const VS_ARM = {
  up: { e: [158, -296], w: [160, -392] },           // the hand up beside his face
  look: { e: [156, -294], w: [152, -396] },         // turned toward his face to look at it
  low: { e: [150, -280], w: [178, -330] },          // lowered a little (the arm shot)
  selfie: { e: [-118, -262], w: [-150, -214] },     // the other arm out toward the camera, low: the selfie stick's grip
  restL: { e: [-90, -271], w: [-113, -184] },
};
// his rig state for a description A (no drawing)
function vsSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
  p = armAt(p, 'R', (A.armR || VS_ARM.up).e, (A.armR || VS_ARM.up).w);
  const armL = A.armL || VS_ARM.selfie;
  p = armAt(p, 'L', armL.e, armL.w);
  return { x: VS.hx + (A.dx || 0), y: VS.hy + (A.dy || 0), s: VS.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, seed: 4, noArms: true };
}
// the hand's frame at the right wrist: up the forearm, turned by A.handRot
function vsHandFrame(rr, A) {
  const el = rr.elR, wr = rr.wrR, d = [wr[0] - el[0], wr[1] - el[1]], L = Math.hypot(d[0], d[1]) || 1;
  const ang = Math.atan2(d[0] / L, -d[1] / L) + (A.handRot || 0);
  return { o: [wr[0] + (d[0] / L) * 6, wr[1] + (d[1] / L) * 6], ang, s: A.handS || 1.18 };
}
// the knitted hat (head units): a teal beanie with ribs and a pompom
function fwHat(c, t) {
  c.beginPath(); c.moveTo(-70, -20); c.quadraticCurveTo(-72, -96, 0, -104); c.quadraticCurveTo(72, -96, 70, -20); c.closePath();
  c.fillStyle = FW_HAT; c.fill();
  rrect(c, -74, -36, 148, 30, 12); c.fillStyle = FW_HAT_SH; c.fill();
  paint(() => {
    for (let i = -6; i <= 6; i++) line(c, i * 11, -33, i * 11, -10, 2.2, 'rgba(10,70,64,0.55)');
    for (let i = -3; i <= 3; i++) line(c, i * 16, -92 + Math.abs(i) * 3, i * 19, -40, 1.6, 'rgba(255,255,255,0.18)');
  });
  const sw = 2.5 * Math.sin(t * loopW(1.9));
  circle(c, sw, -112, 20, '#F5F0E6');
  paint(() => { for (let i = 0; i < 9; i++) { const a = i * 0.7; line(c, sw + Math.cos(a) * 8, -112 + Math.sin(a) * 8, sw + Math.cos(a) * 19, -112 + Math.sin(a) * 19, 2, 'rgba(200,190,175,0.7)'); } });
}
// the selfie stick: from his left fist toward the camera (out of frame, bottom left), thicker as it nears the lens
function fwStick(c, wr) {
  const a = [wr[0] - 4, wr[1] + 10], b = [wr[0] - 330, wr[1] + 470];
  c.beginPath(); c.moveTo(a[0] - 4, a[1]); c.lineTo(b[0] - 14, b[1]); c.lineTo(b[0] + 14, b[1]); c.lineTo(a[0] + 4, a[1]); c.closePath();
  c.fillStyle = '#23242E'; c.fill();
  paint(() => line(c, a[0] + 1, a[1] + 2, lerp(a[0], b[0], 0.7) + 4, lerp(a[1], b[1], 0.7), 2.2, 'rgba(255,220,180,0.35)'));
}
// Draw him from a description A:
//   face, headDX, headDY, headRot, lean, bob, dx, dy
//   armR / armL: {e, w} (VS_ARM, armMix)
//   H: the W hand (hand.js), handRot, handS
//   tongue 0..1 (the tip of his tongue out at the corner: concentrating), sweat 0..1
//   pal, ambient, post(lc, r, st, F) more drawing in rig-local units (F = the hand's frame), noStick
// Returns {st, r, head, F, hp(q): hand point -> world, P: the hand's points}
function vsHero(cam, t, A = {}) {
  const pal = A.pal || VSPAL, st = vsSt(A), out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.03 : A.ambient, light: 0,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      vsInHead(lc, s2, (c) => {
        actor(() => fwHat(c, t));
        // the tongue, out at the corner of his mouth (concentrating), and a bead of sweat
        const tg = A.tongue || 0;
        if (tg > 0.02) paint(() => { ellipse(c, 15, 44 + 3 * tg, 7 * tg, 5.5 * tg, pal.tongue, 0.4); line(c, 15, 42 + 3 * tg, 17 + 2 * tg, 47 + 3 * tg, 1.2, 'rgba(120,30,40,0.5)'); });
        const sw = A.sweat || 0;
        if (sw > 0.02) paint(() => { c.save(); c.translate(-46, -30 + 10 * sw); c.scale(sw, sw); c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(8, 2, 0, 6); c.quadraticCurveTo(-8, 2, 0, -12); c.fillStyle = '#BFF0FF'; c.fill(); c.restore(); });
        if (A.head) A.head(c);
      });
      const armOf = (k) => {
        capsuleShaded(lc, rr['sh' + k], rr['el' + k], 42, pal.coat, pal.coatSh, pal.coatHi, pal);
        capsuleShaded(lc, rr['el' + k], rr['wr' + k], 38, pal.coat, pal.coatSh, pal.coatHi, pal);
        const d = rr['armDir' + k], wr = rr['wr' + k];
        line(lc, wr[0] - d[0] * 8, wr[1] - d[1] * 8, wr[0] + d[0] * 1, wr[1] + d[1] * 1, 44, pal.coatSh);
      };
      // the selfie arm, its fist and the stick
      actor(() => { armOf('L'); });
      if (!A.noStick) actor(() => fwStick(lc, rr.wrL));
      actor(() => drawHand(lc, rr.wrL, rr.armDirL, 'fist', pal, -1, t));
      // the W arm, then the hand at its wrist
      actor(() => armOf('R'));
      if (A.arm) A.arm(lc, rr);
      const F = vsHandFrame(rr, A);
      lc.save(); lc.translate(F.o[0], F.o[1]); lc.rotate(F.ang); lc.scale(F.s, F.s);
      actor(() => { out.P = vsHand(lc, pal, A.H || {}, t); });
      if (A.inHand) A.inHand(lc, out.P);
      lc.restore();
      out.F = F;
      if (A.post) A.post(lc, rr, s2, F);
      lc.restore();
    },
  });
  out.st = st; out.r = r; out.head = vsHeadPt(st, 0, 0);
  const F = out.F, v = clamp((A.H || {}).view || 0), sx = -Math.cos(Math.PI * v), sxx = (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx);
  const hs = (A.H && A.H.s) || 1, hr = (A.H && A.H.rot) || 0;
  out.hp = (q) => {   // a hand-unit point (canonical) -> world
    const qq = [q[0] * hs * sxx, q[1] * hs];
    const rx = Math.cos(hr) * qq[0] - Math.sin(hr) * qq[1], ry = Math.sin(hr) * qq[0] + Math.cos(hr) * qq[1];
    const a = F.ang, wx = F.o[0] + (rx * Math.cos(a) - ry * Math.sin(a)) * F.s, wy = F.o[1] + (rx * Math.sin(a) + ry * Math.cos(a)) * F.s;
    return [st.x + wx * st.s, st.y + wy * st.s];
  };
  out.rp = (q) => [st.x + q[0] * st.s, st.y + q[1] * st.s];   // a rig-local point -> world
  return out;
}
