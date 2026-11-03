// The exam room (a doctor's office at night, one warm wall lamp upper left), the padded exam table with its paper
// strip, and the hero sitting on its edge with his legs crossed (his right leg over his left, knees to screen-left),
// chopping just under his kneecap with the side of his hand. His legs and arms are this file's own drawing on his
// layer (the rig draws the torso and head); the leg can turn to glass (the thigh muscle, the cord under the kneecap,
// the wires to the spine) and his lower back opens into a see-through window with the spine inside.
'use strict';

const LKH = { hx: 600, hy: 1300, s: 1.6 };            // the seat point (his pelvis) in world coords, and his scale
const LKPAL = Object.assign({}, PAL);                 // his own outfit: the yellow coat as always
let LK_WALL = null;

// ---------------------------------------------------------------- the room (painted once)
function lkInitRoom() {
  const M = 320;
  LK_WALL = mkCanvas(W + 2 * M, H + 2 * M);
  const c = LK_WALL.getContext('2d');
  c.translate(M, M);
  const g = c.createLinearGradient(0, 200, 0, 1200);
  g.addColorStop(0, '#0F2A2E'); g.addColorStop(0.55, '#18444A'); g.addColorStop(1, '#123438');
  c.fillStyle = g; c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  for (let x = -M; x < W + M; x += 84) { c.fillStyle = 'rgba(160,255,235,0.025)'; c.fillRect(x, -M, 38, H + 2 * M); }
  // the wainscot below the rail
  const wg = c.createLinearGradient(0, 1120, 0, 1700); wg.addColorStop(0, '#5C3C2A'); wg.addColorStop(1, '#2E1C12');
  c.fillStyle = wg; c.fillRect(-M, 1120, W + 2 * M, H);
  c.fillStyle = '#7C5439'; c.fillRect(-M, 1106, W + 2 * M, 18);
  c.fillStyle = 'rgba(255,220,180,0.10)'; c.fillRect(-M, 1106, W + 2 * M, 4);
  for (let x = -M + 40; x < W + M; x += 190) {
    rrect(c, x, 1160, 150, 520, 10); c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,0.22)'; c.stroke();
    c.fillStyle = 'rgba(255,210,170,0.04)'; c.fill();
  }
  // a diploma (upper left, under the lamp)
  c.save(); c.translate(250, 760); c.rotate(-0.025);
  rrect(c, -104, -80, 208, 160, 8); c.fillStyle = '#6B4630'; c.fill();
  rrect(c, -90, -66, 180, 132, 4); c.fillStyle = '#F2E8D2'; c.fill();
  c.fillStyle = '#8A7A5A'; for (let i = 0; i < 4; i++) c.fillRect(-64 + (i % 2) * 10, -40 + i * 21, 128 - (i % 2) * 20, 6);
  circle(c, 52, 40, 16, '#C8341A'); circle(c, 52, 40, 9, '#F06A4A');
  c.restore();
  // an eye chart (right of his head)
  c.save(); c.translate(830, 690); c.rotate(0.03);
  rrect(c, -86, -120, 172, 240, 8); c.fillStyle = '#F4F1E8'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#26283A'; c.stroke();
  c.fillStyle = '#1A1C2C'; c.textAlign = 'center'; c.textBaseline = 'middle';
  let yy = -80;
  for (const [txt, sz] of [['E', 72], ['F P', 46], ['T O Z', 33], ['L P E D', 24], ['P E C F D', 18]]) { c.font = `900 ${sz}px Montserrat`; c.fillText(txt, 0, yy); yy += sz * 0.62 + 22; }
  c.restore();
  // a poster: a knee and a little hammer (far left, low)
  c.save(); c.translate(-60, 980); c.rotate(-0.02);
  rrect(c, -90, -120, 180, 240, 6); c.fillStyle = '#E9E2CF'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#3A3A48'; c.stroke();
  c.lineCap = 'round'; c.strokeStyle = '#B5574A'; c.lineWidth = 22;
  c.beginPath(); c.moveTo(-50, -70); c.lineTo(10, -10); c.lineTo(-10, 80); c.stroke();
  circle(c, 12, -10, 16, '#F0D9C0');
  c.save(); c.translate(48, 10); c.rotate(-0.5); rrect(c, -6, -50, 12, 70, 5); c.fillStyle = '#5A4A3A'; c.fill(); ellipse(c, 0, -54, 22, 13, '#D84A40'); c.restore();
  c.restore();
  // the floor far below
  const fg = c.createLinearGradient(0, 1830, 0, 2300); fg.addColorStop(0, '#3E4A58'); fg.addColorStop(1, '#1A2028');
  c.fillStyle = fg; c.fillRect(-M, 1830, W + 2 * M, 900);
}

function lkRoomBack(cam, t, o = {}) {
  applyCam(cam);
  ctx.drawImage(LK_WALL, -320, -320);
  // the wall lamp (upper left): a brass arm, a green glass shade, its warm pool on the wall
  const lx = 150, ly = 470;
  softDot(ctx, lx + 60, ly + 260, 560, '#FFD9A0', 0.15);
  line(ctx, lx - 120, ly - 20, lx - 30, ly - 20, 10, '#9A7A44');
  line(ctx, lx - 30, ly - 20, lx, ly + 8, 8, '#9A7A44');
  ctx.beginPath(); ctx.moveTo(lx - 46, ly + 52); ctx.lineTo(lx - 22, ly + 4); ctx.lineTo(lx + 22, ly + 4); ctx.lineTo(lx + 46, ly + 52); ctx.closePath();
  ctx.fillStyle = '#1F6B4E'; ctx.fill();
  ellipse(ctx, lx, ly + 54, 46, 9, '#FFE7B0');
  softDot(gctx, lx, ly + 58, 120, '#FFD48A', 0.75);
  softDot(gctx, lx, ly + 150, 260, '#FFB866', 0.18);
  // the side counter with the jar of lollipops (left, behind his knees)
  const cy = 1190;
  rrect(ctx, -260, cy, 420, 34, 8); ctx.fillStyle = '#C9CED8'; ctx.fill();
  ctx.fillStyle = '#9AA2B4'; ctx.fillRect(-250, cy + 34, 400, 420);
  for (let i = 0; i < 2; i++) { rrect(ctx, -230, cy + 60 + i * 150, 360, 120, 8); ctx.lineWidth = 5; ctx.strokeStyle = '#7C8498'; ctx.stroke(); circle(ctx, -50, cy + 120 + i * 150, 8, '#5A6278'); }
  const jx = 70, jy = cy;
  for (const [dx, col, a] of [[-20, '#EF4638', -0.3], [4, '#FFC23A', 0.05], [24, '#1CB3A4', 0.35]]) {
    ctx.save(); ctx.translate(jx + dx, jy - 30); ctx.rotate(a); line(ctx, 0, 0, 0, -84, 5, '#F4F0E6'); circle(ctx, 0, -96, 17, col); ctx.restore();
  }
  rrect(ctx, jx - 46, jy - 96, 92, 100, 16); ctx.fillStyle = 'rgba(200,235,255,0.18)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(220,245,255,0.55)'; ctx.stroke();
  // the reflex hammer, unused, on a tray
  rrect(ctx, -10, cy - 14, 150, 14, 4); ctx.fillStyle = '#E4E8EE'; ctx.fill();
  ctx.save(); ctx.translate(60, cy - 22); ctx.rotate(0.04); line(ctx, -50, 0, 40, 0, 7, '#B8BEC8'); ctx.beginPath(); ctx.moveTo(40, -18); ctx.lineTo(62, -10); ctx.lineTo(62, 10); ctx.lineTo(40, 18); ctx.closePath(); ctx.fillStyle = '#D9473E'; ctx.fill(); ctx.restore();
}

// the exam table he sits on: a padded top with the paper strip, a cabinet front (drawn in front of the wall, behind him)
function lkTable(cam) {
  applyCam(cam);
  const top = LKH.hy + 22 * LKH.s, x0 = 360, x1 = 1600;
  const g = ctx.createLinearGradient(0, top + 30, 0, top + 560); g.addColorStop(0, '#D8DCE4'); g.addColorStop(1, '#8E96A8');
  ctx.fillStyle = g; ctx.fillRect(x0 + 20, top + 40, x1 - x0, 620);
  for (let i = 0; i < 3; i++) { rrect(ctx, x0 + 60 + i * 260, top + 90, 220, 170, 10); ctx.lineWidth = 6; ctx.strokeStyle = '#A4ACBC'; ctx.stroke(); line(ctx, x0 + 130 + i * 260, top + 120, x0 + 210 + i * 260, top + 120, 9, '#6C7488'); }
  rrect(ctx, x0, top - 6, x1 - x0, 52, 16); ctx.fillStyle = '#1D6E73'; ctx.fill();          // the padded top
  rrect(ctx, x0 + 6, top - 4, x1 - x0, 14, 7); ctx.fillStyle = '#2C8A8E'; ctx.fill();
  rrect(ctx, x0 + 40, top - 16, x1 - x0, 20, 4); ctx.fillStyle = '#F4F2EC'; ctx.fill();     // the paper strip
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let x = x0 + 70; x < x1; x += 60) ctx.fillRect(x, top - 16, 2, 20);
}

// ---------------------------------------------------------------- his legs and arms (rig-local units; the seat at 0)
// H: {kick 0..1.4 (the top shin's swing forward, rad), kickB (the bottom shin), chop 0..1 (the hand lifted above the spot),
//     reach 0..1 (the chopping hand at the knee; 0 = resting on his thigh), notme 0..1 (both hands up, palms out),
//     clench 0..1, shoeOff (the top shoe is gone: it flies on its own), xleg 0..1 (the leg goes glass), stretch -1..1
//     (the thigh muscle: + stretched, - bunched), dent 0..1 (the cord pushed in by the chop), xback 0..1 (the window
//     on his lower back), spark {up 0..1, down 0..1}, spineFace {look, mood, wave}, uncrossed (both legs hang: 1902)}
const LKG = { hipT: [-24, 2], kneeT: [-150, -8], hipB: [26, 10], kneeB: [-118, 16], shin: 100 };
function lkShinDir(k) { return [-Math.sin(k), Math.cos(k)]; }             // k = 0: hanging straight down; + swings forward (left)
function lkGeo(H) {
  const unc = H.uncrossed || 0;
  const kneeT = [lerp(LKG.kneeT[0], -142, unc), lerp(LKG.kneeT[1], 14, unc)];
  const kT = (H.kick || 0) - 0.05 * (1 - unc), kB = H.kickB || 0;
  const dT = lkShinDir(kT), dB = lkShinDir(kB - 0.30 * (1 - unc));
  const ankT = [kneeT[0] + dT[0] * LKG.shin, kneeT[1] + dT[1] * LKG.shin];
  const kneeB = [lerp(LKG.kneeB[0], -110, unc), lerp(LKG.kneeB[1], 22, unc)];
  const ankB = [kneeB[0] + dB[0] * LKG.shin, kneeB[1] + dB[1] * LKG.shin];
  const tap = [kneeT[0] + dT[0] * 30 - dT[1] * 22, kneeT[1] + dT[1] * 30 + dT[0] * 22];   // the front of the shin just under the kneecap
  const tapB = [kneeB[0] + dB[0] * 30 - dB[1] * 22, kneeB[1] + dB[1] * 30 + dB[0] * 22];
  return { hipT: LKG.hipT, kneeT, ankT, dT, kT, hipB: LKG.hipB, kneeB, ankB, dB, tap, tapB };
}
function lkTaper(c, a, b, wa, wb) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  c.beginPath(); c.arc(a[0], a[1], wa, ang + Math.PI / 2, ang - Math.PI / 2); c.arc(b[0], b[1], wb, ang - Math.PI / 2, ang + Math.PI / 2); c.closePath();
}
function lkShoe(c, an, ang, pal, missing) {
  c.save(); c.translate(an[0], an[1]); c.rotate(ang);
  drawShoe(c, [0, 0], -1, pal, 0, missing);
  c.restore();
}
// one leg in pants: thigh, knee, shin, shoe (the kneecap a soft bump on the knee's front)
function lkLeg(c, hip, knee, ank, d, k, pal, o = {}) {
  lkTaper(c, hip, knee, 27, 25); c.fillStyle = pal.pants; c.fill();
  lkTaper(c, knee, ank, 24, 21); c.fillStyle = pal.pants; c.fill();
  if (!o.noCap) { const cap = [knee[0] - 16 - d[1] * 0, knee[1] - 6]; circle(c, cap[0], cap[1], 15, pal.pants); }
  line(c, ank[0] + d[1] * 22, ank[1] - d[0] * 22 - 4, ank[0] - d[1] * 22, ank[1] + d[0] * 22 - 4, 12, pal.pantsSh);   // the cuff
  lkShoe(c, [ank[0] + d[0] * 6, ank[1] + d[1] * 6], 0.15 - k * 0.85, pal, o.missing);
}
// the arm from the shoulder to a wrist point (two bones, the elbow bent out to `bend`), a coat sleeve and a hand
function lkArm(c, sh, wr, bend, pal, hand = 'blade', handAng = 0, absAng = null) {
  const L1 = 100, L2 = 92, dx = wr[0] - sh[0], dy = wr[1] - sh[1], d = Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy));
  const a0 = Math.atan2(dy, dx), cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), A = Math.acos(cosA) * bend;
  const el = [sh[0] + Math.cos(a0 + A) * L1, sh[1] + Math.sin(a0 + A) * L1];
  const w2 = [sh[0] + Math.cos(a0) * d, sh[1] + Math.sin(a0) * d];
  lkTaper(c, sh, el, 21, 19); c.fillStyle = pal.coat; c.fill();
  lkTaper(c, el, w2, 19, 17); c.fillStyle = pal.coat; c.fill();
  const fa = Math.atan2(w2[1] - el[1], w2[0] - el[0]);
  line(c, w2[0] - Math.cos(fa) * 6, w2[1] - Math.sin(fa) * 6, w2[0] + Math.cos(fa) * 2, w2[1] + Math.sin(fa) * 2, 40, pal.coatSh);   // the cuff
  c.save(); c.translate(w2[0], w2[1]); c.rotate(absAng === null ? fa + handAng : absAng);
  if (hand === 'blade') {                    // the side of the hand, fingers straight and together: a karate chop
    rrect(c, -4, -15, 64, 30, 14); c.fillStyle = pal.skin; c.fill();
    ellipse(c, 14, 17, 13, 9, pal.skin, 0.5);                                        // the thumb (on top once the hand points left)
    paint(() => { line(c, 30, -6, 52, -6, 2.5, 'rgba(160,90,60,0.45)'); line(c, 30, 4, 52, 4, 2.5, 'rgba(160,90,60,0.45)'); });
  } else if (hand === 'palm') {              // palm out, fingers up (not me!)
    rrect(c, 4, -24, 46, 48, 18); c.fillStyle = pal.skin; c.fill();
    for (let i = 0; i < 4; i++) { rrect(c, 38, -22 + i * 12, 30, 10, 5); c.fillStyle = pal.skin; c.fill(); }
    ellipse(c, 20, -27, 12, 8, pal.skin, -0.9);
  } else {                                   // a relaxed hand flat on the table
    ellipse(c, 24, 0, 26, 18, pal.skin);
  }
  c.restore();
  return { el, wr: w2 };
}

// the hero on his layer. cam: the shot's camera. Returns the world point of the tap spot and the knee.
function lkHero(cam, t, H = {}) {
  const pal = H.pal || LKPAL, s = H.s || LKH.s, x = H.x === undefined ? LKH.hx : H.x, y = H.y === undefined ? LKH.hy : H.y;
  const pose = JSON.parse(JSON.stringify(POSES.sit));
  pose.hipY = 0; pose.lean = H.lean === undefined ? -0.16 : H.lean; pose.hand = 'open';
  const st = { x, y, s, pose, face: H.face || FACES.calm, headDX: H.headDX || 0, headDY: H.headDY || 0, headRot: H.headRot || 0, noLegs: true, noArms: true, seed: 4 };
  const G = lkGeo(H);
  let out = null;
  charLayer(cam, st, t, {
    pal,
    post: (lc, r) => {
      lc.save(); lc.translate(x, y); lc.scale(s, s);
      const toW = (p) => [x + p[0] * s, y + p[1] * s];
      if ((H.xback || 0) > 0.001) { lkBackWindow(lc, H, t); lkSpineFace(lc, H, t); }
      actor(() => {
        // his far arm: down at his side, the hand flat on the table behind him (or up, palm out)
        const nm = clamp(H.notme || 0);
        const restR = [128, 18], upR = [96, -128];
        lkArm(lc, r.shR, [lerp(restR[0], upR[0], nm), lerp(restR[1], upR[1], nm)], lerp(0.9, -1, nm), pal, nm > 0.5 ? 'palm' : 'flat', nm > 0.5 ? -1.45 : 0);
        // the bottom leg (his left), then the top leg (his right) over it
        lkLeg(lc, G.hipB, G.kneeB, G.ankB, G.dB, H.kickB || 0, pal, { missing: !!H.shoeOffB });
        if ((H.xleg || 0) < 0.999) lkLeg(lc, G.hipT, G.kneeT, G.ankT, G.dT, G.kT, pal, { missing: !!H.shoeOff });
      });
      if ((H.xleg || 0) > 0.001) { lkGlassLeg(lc, G, H, t, pal); lkShoe(lc, [G.ankT[0] + G.dT[0] * 6, G.ankT[1] + G.dT[1] * 6], 0.15 - G.kT * 0.85, pal, !!H.shoeOff); }
      lkWires(lc, G, H, t, toW);
      actor(() => {
        // the chopping arm (his right: screen-left), or both hands up
        const nm = clamp(H.notme || 0), reach = clamp(H.reach === undefined ? 1 : H.reach);
        const lift = clamp(H.chop || 0), blade = [G.tap[0] + 36, G.tap[1] - 16 - 88 * lift];
        const restL = [-96, -6];
        const wr = [lerp(restL[0], blade[0], reach), lerp(restL[1], blade[1], reach)];
        const upL = [-160, -176];
        const target = [lerp(wr[0], upL[0], nm), lerp(wr[1], upL[1], nm)];
        const chopping = nm < 0.5 && reach > 0.4;
        lkArm(lc, r.shL, target, nm > 0.5 ? -1 : 1, pal, nm > 0.5 ? 'palm' : chopping ? 'blade' : 'flat', nm > 0.5 ? -1.6 : 0,
          chopping ? Math.PI - 0.08 + 0.35 * lift : null);
      });
      if (H.lid) lkBrainLid(lc, r, st, H, t);
      out = { tap: toW(G.tap), tapB: toW(G.tapB), knee: toW(G.kneeT), ank: toW(G.ankT), hipT: toW(G.hipT), head: toW(r.head), G, r, toW,
        spine: toW(LK_SPINEBONE), muscle: toW(lkMuscle(G, 0).mid) };
      lc.restore();
    },
  });
  return out;
}

// ---------------------------------------------------------------- the glass leg (the thigh muscle, the cord, the wires)
function lkMuscle(G, st) {                                         // the thigh muscle's two ends and its middle (local units)
  const m0 = [G.hipT[0] - 22, G.hipT[1] - 14], m1 = [G.kneeT[0] + 30 - 14 * st, G.kneeT[1] - 18];
  return { m0, m1, mid: [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2 - 4] };
}
function lkGlassLeg(c, G, H, t, pal) {
  const a = clamp(H.xleg), st = H.stretch || 0, dent = clamp(H.dent || 0);
  c.save();
  // the glass: pale blue, see-through, a bright edge
  const lim = (p, q, wa, wb) => { lkTaper(c, p, q, wa, wb); c.fillStyle = `rgba(70,150,255,${0.42 * a})`; c.fill(); c.lineWidth = 4; c.strokeStyle = rgba('#9FF2FF', 0.95 * a); c.stroke(); };
  lim(G.hipT, G.kneeT, 28, 26); lim(G.kneeT, G.ankT, 24, 21);
  // bones, faint: thigh bone, shin bone
  line(c, G.hipT[0] - 6, G.hipT[1] + 8, G.kneeT[0] + 18, G.kneeT[1] + 8, 12, rgba('#E4F0FF', 0.45 * a));
  line(c, G.kneeT[0] + G.dT[0] * 18, G.kneeT[1] + G.dT[1] * 18, G.ankT[0] - G.dT[0] * 10, G.ankT[1] - G.dT[1] * 10, 11, rgba('#E4F0FF', 0.45 * a));
  // the thigh muscle: a fat spindle along the top of the thigh (stretched: longer and thinner; bunched: short and fat)
  const { m0, m1, mid } = lkMuscle(G, st);
  const mw = 17 * (1 - 0.3 * Math.max(0, st)) + 10 * Math.max(0, -st);
  c.beginPath(); c.moveTo(m0[0], m0[1]);
  c.quadraticCurveTo(mid[0], mid[1] - mw * 2.1, m1[0], m1[1]); c.quadraticCurveTo(mid[0], mid[1] + mw * 1.7, m0[0], m0[1]); c.closePath();
  c.fillStyle = rgba('#FF5F86', a); c.fill(); c.lineWidth = 3; c.strokeStyle = rgba('#FFD0DA', a); c.stroke();
  paint(() => {
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(m0[0] + 10, m0[1] + i * 3); c.quadraticCurveTo(mid[0], mid[1] + i * mw * 0.6, m1[0] - 8, m1[1] + i * 2); c.lineWidth = 2; c.strokeStyle = rgba('#B8304E', 0.75 * a); c.stroke(); }
  });
  // arrows: pulled apart while it stretches, squeezed while it bunches
  const ux = (m1[0] - m0[0]), uy = (m1[1] - m0[1]), L = Math.hypot(ux, uy) || 1, u = [ux / L, uy / L];
  const arrow = (p, d, col, k) => {
    if (k <= 0.02) return;
    const q = [p[0] + d[0] * 26 * k, p[1] + d[1] * 26 * k], n = [-d[1], d[0]];
    line(c, p[0], p[1], q[0], q[1], 5, rgba(col, k)); 
    c.beginPath(); c.moveTo(q[0] + d[0] * 10, q[1] + d[1] * 10); c.lineTo(q[0] + n[0] * 8, q[1] + n[1] * 8); c.lineTo(q[0] - n[0] * 8, q[1] - n[1] * 8); c.closePath(); c.fillStyle = rgba(col, k); c.fill();
  };
  const sk = clamp(st * 1.4), bk = clamp(-st * 1.4);
  arrow([m0[0] - u[0] * 4, m0[1] - 26], [-u[0], -u[1]], '#FFFFFF', sk); arrow([m1[0] + u[0] * 4, m1[1] - 26], u, '#FFFFFF', sk);
  arrow([m0[0] - u[0] * 30, m0[1] - 28], u, '#FFB23F', bk); arrow([m1[0] + u[0] * 30, m1[1] - 28], [-u[0], -u[1]], '#FFB23F', bk);
  // the cord: from the muscle's end over the kneecap to the top of the shin (the chop dents it)
  const cap = [G.kneeT[0] - 13, G.kneeT[1] - 11], sh = [G.tap[0] + G.dT[0] * 10, G.tap[1] + G.dT[1] * 10];
  const dn = [G.tap[0] + 12 * dent, G.tap[1] - 3 * dent];
  c.beginPath(); c.moveTo(m1[0], m1[1]); c.quadraticCurveTo(cap[0] - 18, cap[1] - 16, cap[0] - 12, cap[1] + 8);
  c.quadraticCurveTo(dn[0] - 8, dn[1] - 4, sh[0], sh[1]);
  c.lineWidth = 11; c.strokeStyle = rgba('#FFE7C2', a); c.lineCap = 'round'; c.stroke();
  circle(c, cap[0], cap[1], 13, rgba('#EAF4FF', 0.95 * a));         // the kneecap
  c.restore();
}

// the wires between the thigh muscle and the spine: the way up (cyan) and the way back (orange). Local units
const LK_SPINEBONE = [8, -36];
function lkWirePaths(G) {
  const { mid } = lkMuscle(G, 0), S = LK_SPINEBONE;
  // one loop above the thigh: up round the outside (cyan), back down the inside (orange)
  const up = crDense2([[mid[0] - 18, mid[1] - 8], [mid[0] - 14, mid[1] - 70], [S[0] - 62, S[1] - 56], [S[0] - 14, S[1] - 6]], 16);
  const dn = crDense2([[S[0] - 14, S[1] + 6], [S[0] - 46, S[1] - 18], [mid[0] + 10, mid[1] - 40], [mid[0] + 14, mid[1] - 8]], 16);
  return { up, dn, upAcc: polyLen(up), dnAcc: polyLen(dn) };
}
function crDense2(P, per = 14) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < per; j++) {
      const u = j / per, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
// drawn in the hero's local units (inside lkHero's post transform), with the glow layer in world units through toW
function lkWires(c, G, H, t, toW) {
  const a = clamp(H.wires || 0); if (a < 0.01) return;
  const P = lkWirePaths(G);
  const draw = (pts, col, k) => {
    const n = Math.max(2, Math.round(pts.length * k));
    poly(c, pts.slice(0, n), 10, rgba('#081428', 0.95 * a)); poly(c, pts.slice(0, n), 5.5, rgba(col, a));
    gctx.save(); gctx.globalAlpha = 0.6 * a; poly(gctx, pts.slice(0, n).map(toW), 12, col); gctx.restore();
  };
  draw(P.up, '#7FE9FF', clamp(H.wireUp === undefined ? 1 : H.wireUp));
  draw(P.dn, '#FF9A3C', clamp(H.wireDn === undefined ? 1 : H.wireDn));
  // the sparks: a bright head and a short tail
  const sp = (pts, acc, u, col) => {
    if (u <= 0 || u >= 1) return;
    const Lt = acc[acc.length - 1];
    for (let i = 5; i >= 0; i--) {
      const p = polyAt(pts, acc, Math.max(0, u * Lt - i * 9)), r = i ? 9 - i : 13;
      circle(c, p[0], p[1], r, i ? rgba(col, 0.8 - i * 0.12) : '#FFFFFF');
    }
    const p = polyAt(pts, acc, u * Lt), w = toW(p);
    softDot(gctx, w[0], w[1], 90, col, 1); softDot(gctx, w[0], w[1], 30, '#FFFFFF', 1);
  };
  sp(P.up, P.upAcc, H.sparkUp || 0, '#7FE9FF');
  sp(P.dn, P.dnAcc, H.sparkDn || 0, '#FF9A3C');
  // the spine holds the spark between the catch and the yank
  if (H.holding) { const w = toW(LK_SPINEBONE); softDot(gctx, w[0], w[1], 70, '#7FE9FF', 0.9); }
}

// the window on his lower back: opaque first (the light reads it as a thing), then the spine inside it
function lkBackWindow(c, H, t) {
  const k = clamp(H.xback), cx = 6, cy = -78, rx = 66 * E.outBack(k, 1.4), ry = 96 * E.outBack(k, 1.4);
  if (rx < 1) return;
  c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fillStyle = '#0E1F44'; c.fill();
  c.save(); c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.clip();
  const g = c.createRadialGradient(cx, cy, 10, cx, cy, ry); g.addColorStop(0, '#1F4A8A'); g.addColorStop(1, '#0B1834');
  c.fillStyle = g; c.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  // the spine: a column of rounded bones with discs between them, a gentle S
  const n = 9;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), by = lerp(-162, 6, u), bx = 6 + 7 * Math.sin(u * 3.3 + 0.4), bw = lerp(13, 21, u), bh = lerp(13, 16, u);
    line(c, bx + bw + 4, by, bx + bw + 16, by + 6, 7, '#C8DCF8'); line(c, bx - bw - 4, by, bx - bw - 16, by + 6, 7, '#C8DCF8');   // the side wings
    rrect(c, bx - bw, by - bh + 2, bw * 2, bh * 2 - 4, 8); c.fillStyle = '#E8F1FF'; c.fill();
    rrect(c, bx - bw * 0.62, by - bh + 4, bw * 0.4, bh * 2 - 8, 4); c.fillStyle = 'rgba(150,180,230,0.55)'; c.fill();
    rrect(c, bx - bw * 0.8, by + bh - 3, bw * 1.6, 7, 3); c.fillStyle = '#FF7A98'; c.fill();
  }
  c.restore();
  c.lineWidth = 4; c.strokeStyle = '#7FE9FF'; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.stroke();
}
// the spine's face: on the bone the wires reach (in the hero's local units): it waves, catches the spark, yanks the cord
function lkSpineFace(c, H, t) {
  const k = clamp(H.xback || 0); if (k < 0.6) return;
  const [fx, fy] = LK_SPINEBONE, mood = H.spineMood || 'calm';
  paint(() => {
    const look = H.spineLook || [0, 0];
    for (const sx of [-12, 12]) {
      ellipse(c, fx + sx, fy - 4, 8.5, mood === 'wide' ? 11 : 8.5, '#FFFFFF'); c.lineWidth = 2; c.strokeStyle = '#1A1430'; c.beginPath(); c.ellipse(fx + sx, fy - 4, 8.5, mood === 'wide' ? 11 : 8.5, 0, 0, 7); c.stroke();
      circle(c, fx + sx + look[0] * 3, fy - 4 + look[1] * 3, mood === 'wide' ? 3.4 : 4.2, '#1A1430');
    }
    if (mood === 'grin' || mood === 'wide') { c.beginPath(); c.moveTo(fx - 10, fy + 8); c.quadraticCurveTo(fx, fy + 18, fx + 10, fy + 8); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else { c.beginPath(); c.moveTo(fx - 8, fy + 9); c.quadraticCurveTo(fx, fy + 14, fx + 8, fy + 9); c.lineWidth = 3; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  // its little arm: a wave, or a fist pulling the orange wire (the yank)
  const wv = H.spineWave || 0, yk = H.spineYank || 0;
  const sh = [fx - 26, fy + 4];
  let hand;
  if (yk > 0) hand = [fx - 40 - 4 * yk, fy + 14 + 22 * yk];
  else hand = [fx - 46 + 7 * Math.sin(t * 16) * wv, fy - 26 * wv + 12 * (1 - wv)];
  line(c, sh[0], sh[1], hand[0], hand[1], 7, '#E8F1FF'); circle(c, hand[0], hand[1], 8, '#E8F1FF');
}

// ---------------------------------------------------------------- inside his head: the brain, asleep (after pins-needles' brainGuy)
function lkBrainRoom(t) {
  screenSpace();
  const g = ctx.createRadialGradient(540, 900, 100, 540, 900, 1100); g.addColorStop(0, '#5A2A70'); g.addColorStop(1, '#12061C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(9), pts = [...Array(18)].map(() => [rng() * W, 380 + rng() * 1100]);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < 300) line(ctx, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 2.5, `rgba(255,150,210,${0.09 + 0.04 * Math.sin(t * loopW(2) + i + j)})`);
  }
  pts.forEach((p, i) => { circle(ctx, p[0], p[1], 6, 'rgba(255,170,220,0.2)'); softDot(gctx, p[0], p[1], 34, '#FF86C8', 0.12 + 0.08 * Math.sin(t * loopW(3) + i * 1.7)); });
}
// the bed and the bedside lamp (drawn in the current transform)
function lkBed(t, glow = true) {
  rrect(ctx, 150, 1230, 780, 60, 20); ctx.fillStyle = '#6A3A22'; ctx.fill();                              // the frame
  line(ctx, 180, 1290, 180, 1420, 22, '#5A3018'); line(ctx, 900, 1290, 900, 1420, 22, '#5A3018');
  rrect(ctx, 130, 980, 70, 300, 26); ctx.fillStyle = '#7A4428'; ctx.fill();                               // the headboard
  rrect(ctx, 880, 1050, 110, 180, 10); ctx.fillStyle = '#3A2048'; ctx.fill();                              // the bedside lamp
  line(ctx, 935, 1050, 935, 960, 8, '#C8A060');
  ctx.beginPath(); ctx.moveTo(890, 960); ctx.lineTo(980, 960); ctx.lineTo(960, 900); ctx.lineTo(910, 900); ctx.closePath(); ctx.fillStyle = '#FFB86A'; ctx.fill();
}
function lkQuilt(t, breathe) {
  ctx.beginPath(); ctx.moveTo(360, 1240); ctx.quadraticCurveTo(380, 1080 - 14 * breathe, 620, 1090 - 18 * breathe); ctx.quadraticCurveTo(880, 1100, 900, 1240); ctx.closePath();
  ctx.fillStyle = '#3A6AC8'; ctx.fill();
  paint(() => { for (let i = 0; i < 5; i++) line(ctx, 420 + i * 100, 1110 - 8 * breathe, 440 + i * 100, 1236, 4, 'rgba(255,255,255,0.18)'); });
}
// the brain itself. o: {mood 'sleep' | 'squint' | 'wide' | 'calm', mask 0..1 (0 = over the eyes, 1 = pushed up), look, lean}
function lkBrain(x, y, s, t, o = {}) {
  const c = ctx, mood = o.mood || 'calm', look = o.look || [0, 0];
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.lean || 0);
    const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
    c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.fillStyle = '#7E2748'; c.fill();
    c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr - 7, ly); c.arc(lx, ly, lr - 7, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
    c.fillStyle = '#FF93B0'; c.fill();
    paint(() => {
      c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(160,52,96,0.6)';
      for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
        c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
      }
      const lx = look[0] * 9, ly = look[1] * 7;
      for (const ex of [-44, 38]) {
        if (mood === 'sleep') { c.beginPath(); c.moveTo(ex - 20, 4); c.quadraticCurveTo(ex, 18, ex + 20, 4); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke(); }
        else {
          const ry = mood === 'squint' ? 12 : mood === 'wide' ? 34 : 28;
          ellipse(c, ex, 4, 25, ry, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry, 0, 0, 7); c.stroke();
          circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'wide' ? 8 : 10, '#231028');
        }
      }
      if (mood === 'sleep') { c.beginPath(); c.moveTo(-12, 60); c.quadraticCurveTo(0, 54, 12, 60); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
      else if (mood === 'wide') ellipse(c, 0, 62, 14, 12, '#5A1522');
      else { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 56, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
      // the sleep mask: over the eyes, or pushed up on the forehead
      const mk = clamp(o.mask || 0), my = lerp(2, -56, E.outBack(mk));
      rrect(c, -86, my - 22, 172, 46, 22); c.fillStyle = '#2A2050'; c.fill();
      line(c, -86, my, -150, my - 10, 8, '#2A2050'); line(c, 86, my, 150, my - 10, 8, '#2A2050');
      if (mk < 0.5) { c.font = '900 26px Montserrat'; c.fillStyle = '#C8B8FF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DO NOT DISTURB', 0, my + 2); }
    });
    c.restore();
  });
}
// the memo: a folded note that flutters in on a zig-zag. k 0..1 along its way, from (x0, y0) to (x1, y1)
function lkMemo(x0, y0, x1, y1, k, t) {
  if (k <= 0) return;
  const u = E.outCubic(clamp(k)), x = lerp(x0, x1, u) + 60 * Math.sin(u * 9) * (1 - u), y = lerp(y0, y1, u);
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.35 * Math.sin(u * 9) * (1 - u) - 0.08);
  actor(() => { rrect(ctx, -120, -62, 240, 124, 8); ctx.fillStyle = '#FFF6D8'; ctx.fill(); ctx.fillStyle = '#F0D890'; ctx.fillRect(-120, -62, 240, 22); });
  paint(() => {
    ctx.font = '900 30px Montserrat'; ctx.fillStyle = '#5A3A10'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('FYI:', 0, -10); ctx.fillText('LEG KICKED', 0, 30);
  });
  ctx.restore();
}
