// A doorway at home, seen from the hallway: the lit room behind him (painted once, out of focus), the hallway wall, the
// white door frame he bangs his elbow on; a laundry basket and what flies out of it; the hero from a description.
// World units are screen pixels at zoom 1. Everything in front of the room is drawn with shapes every frame, so the light
// stage can light it (reference/visual.md, "The light").
'use strict';

const DW = { XL: 292, XR: 812, TOP: 640, FLOOR: 1500, CW: 76, HS: 1.25, HX: 528 };
let DW_ROOM = null;

function initDoorway() {
  const c0 = mkCanvas(W, H), x = c0.getContext('2d');
  const X0 = DW.XL - 60, X1 = DW.XR + 60, Y0 = DW.TOP - 60, FL = 1340;
  // the far wall, warm
  let g = x.createLinearGradient(0, Y0, 0, FL); g.addColorStop(0, '#C98A52'); g.addColorStop(1, '#A8643C');
  x.fillStyle = g; x.fillRect(X0, Y0, X1 - X0, FL - Y0);
  // a window at dusk
  g = x.createLinearGradient(0, 770, 0, 1030); g.addColorStop(0, '#5C6FC0'); g.addColorStop(0.6, '#E98A78'); g.addColorStop(1, '#FFC27A');
  x.fillStyle = '#5A3A26'; x.fillRect(566, 756, 216, 290);
  x.fillStyle = g; x.fillRect(578, 768, 192, 266);
  x.fillStyle = '#5A3A26'; x.fillRect(670, 768, 8, 266); x.fillRect(578, 896, 192, 8);
  x.fillStyle = '#8E3B4A'; x.fillRect(548, 744, 34, 330); x.fillRect(766, 744, 34, 330);
  // a bookshelf on the left: dark, so that an arm held up in front of it reads
  x.fillStyle = '#4A2E26'; x.fillRect(296, 720, 196, 640);
  for (let r = 0; r < 4; r++) {
    x.fillStyle = '#2E1B18'; x.fillRect(306, 736 + r * 150, 176, 128);
    for (let i = 0; i < 8; i++) { x.fillStyle = ['#7A3B46', '#3F6E8C', '#8A6A2E', '#3E7A5A', '#6A4A8A'][(i + r * 2) % 5]; x.fillRect(312 + i * 21, 752 + r * 150 + (i % 3) * 8, 17, 110 - (i % 3) * 8); }
  }
  // the floor of the room
  g = x.createLinearGradient(0, FL, 0, DW.FLOOR + 40); g.addColorStop(0, '#7A4C30'); g.addColorStop(1, '#5E3924');
  x.fillStyle = g; x.fillRect(X0, FL, X1 - X0, DW.FLOOR + 60 - FL);
  // a sofa
  x.fillStyle = '#2C6F78'; rrect(x, 300, 1150, 420, 210, 40); x.fill();
  x.fillStyle = '#3A8892'; rrect(x, 322, 1238, 180, 96, 24); x.fill(); rrect(x, 516, 1238, 180, 96, 24); x.fill();
  x.fillStyle = '#E9B44C'; rrect(x, 340, 1176, 88, 78, 20); x.fill();
  // a plant
  x.fillStyle = '#7A4A2E'; rrect(x, 734, 1260, 74, 90, 12); x.fill();
  x.fillStyle = '#2F7D4E';
  for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.42; x.beginPath(); x.ellipse(770 + Math.cos(a) * 60, 1250 + Math.sin(a) * 86, 20, 62, a + Math.PI / 2, 0, 7); x.fill(); }
  // a floor lamp, far right
  x.fillStyle = '#3A2A22'; x.fillRect(846, 940, 8, 420); x.fillRect(822, 1350, 56, 12);
  x.fillStyle = '#FFE2A8'; x.beginPath(); x.moveTo(806, 944); x.lineTo(894, 944); x.lineTo(876, 864); x.lineTo(824, 864); x.closePath(); x.fill();
  g = x.createRadialGradient(850, 915, 10, 850, 915, 260); g.addColorStop(0, 'rgba(255,214,150,0.45)'); g.addColorStop(1, 'rgba(255,214,150,0)');
  x.fillStyle = g; x.fillRect(X0, Y0, X1 - X0, 800);
  DW_ROOM = mkCanvas(W, H);
  const y = DW_ROOM.getContext('2d');
  y.filter = 'blur(9px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
}

// the room through the opening, the wall round it, the door frame. o: {jolt: the frame shudders (0..1), dim: 0..1}
function doorDraw(cam, t, o = {}) {
  applyCam(cam);
  const { XL, XR, TOP, FLOOR, CW } = DW, c = ctx;
  // the room, a little slower than the wall (it is far away)
  const px = (cam.x - 540) * 0.06, py = (cam.y - 1050) * 0.04;
  c.save(); c.beginPath(); c.rect(XL - 2, TOP - 2, XR - XL + 4, FLOOR - TOP + 4); c.clip();
  c.drawImage(DW_ROOM, px, py);
  c.fillStyle = 'rgba(40,16,40,0.16)'; c.fillRect(XL - 2, TOP - 2, XR - XL + 4, FLOOR - TOP + 4);
  c.restore();
  // the hallway wall: dark plum above, a darker panel below, a rail between them
  const wall = (x0, y0, w, h) => {
    c.fillStyle = '#3A2C56'; c.fillRect(x0, y0, w, Math.min(h, 1190 - y0));
    if (y0 + h > 1190) { c.fillStyle = '#2B2044'; c.fillRect(x0, 1190, w, y0 + h - 1190); }
  };
  wall(-900, -400, XL - CW + 900, FLOOR + 400);
  wall(XR + CW, -400, 2000, FLOOR + 400);
  c.fillStyle = '#3A2C56'; c.fillRect(XL - CW, -400, XR - XL + 2 * CW, TOP - CW + 400);
  for (const [x0, w] of [[-900, XL - CW + 900], [XR + CW, 2000]]) { c.fillStyle = '#4A3A6A'; c.fillRect(x0, 1176, w, 16); c.fillStyle = '#E4DCCB'; c.fillRect(x0, FLOOR - 44, w, 44); }
  // the hallway floor
  c.fillStyle = '#4A3122'; c.fillRect(-900, FLOOR, 3000, 700);
  for (let i = 0; i < 7; i++) line(c, -900, FLOOR + 30 + i * i * 9, 2100, FLOOR + 30 + i * i * 9, 3, '#3B2619');
  // the door frame: the depth of the wall inside it, then the white trim
  const jx = (o.jolt || 0) * 3 * Math.sin(t * 95);
  c.fillStyle = '#A99C88'; c.fillRect(XL - 4 + jx, TOP - 4, 16, FLOOR - TOP + 4); c.fillRect(XR - 12, TOP - 4, 16, FLOOR - TOP + 4); c.fillRect(XL, TOP - 4, XR - XL, 14);
  c.fillStyle = '#EDE6D6';
  c.fillRect(XL - CW + jx, TOP - CW, CW, FLOOR - TOP + CW); c.fillRect(XR, TOP - CW, CW, FLOOR - TOP + CW); c.fillRect(XL - CW, TOP - CW, XR - XL + 2 * CW, CW);
  paint(() => {
    for (const x0 of [XL - CW + 14 + jx, XL - 18 + jx, XR + 14, XR + CW - 18]) line(c, x0, TOP - CW + 20, x0, FLOOR - 4, 4, '#CFC6B2');
    line(c, XL - CW + 20, TOP - CW + 16, XR + CW - 20, TOP - CW + 16, 4, '#CFC6B2'); line(c, XL - 30, TOP - 18, XR + 30, TOP - 18, 4, '#CFC6B2');
  });
}

// ---------------------------------------------------------------- laundry
// a sock (units: about 60 long), toe to the right; (x, y) is the cuff
function fbSock(c, x, y, s, rot, col = '#F4F0E6', band = '#E2483C') {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-12, -30); c.lineTo(12, -30); c.lineTo(13, 6); c.quadraticCurveTo(15, 14, 30, 14); c.quadraticCurveTo(46, 15, 45, 28);
  c.quadraticCurveTo(44, 40, 24, 40); c.lineTo(0, 40); c.quadraticCurveTo(-13, 39, -13, 24); c.closePath(); c.fillStyle = col; c.fill();
  paint(() => {
    c.fillStyle = band; c.fillRect(-12.5, -24, 25, 7); c.fillRect(-12.5, -12, 25, 7);
    c.beginPath(); c.moveTo(34, 15); c.quadraticCurveTo(46, 16, 45, 28); c.quadraticCurveTo(44, 40, 30, 40); c.quadraticCurveTo(38, 28, 34, 15); c.closePath(); c.fill();
  });
  c.restore();
}
// a T-shirt in a heap or in the air (about 90 wide)
function fbTee(c, x, y, s, rot, col = '#5B8DEF') {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-22, -34); c.quadraticCurveTo(0, -22, 22, -34); c.lineTo(50, -18); c.lineTo(40, 6); c.lineTo(26, -2); c.lineTo(28, 40); c.lineTo(-28, 40); c.lineTo(-26, -2); c.lineTo(-40, 6); c.lineTo(-50, -18); c.closePath();
  c.fillStyle = col; c.fill();
  paint(() => { c.beginPath(); c.moveTo(-14, -31); c.quadraticCurveTo(0, -20, 14, -31); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.stroke(); });
  c.restore();
}
// a towel as a soft lump
function fbTowel(c, x, y, s, rot, col = '#F2A7C3') {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -44, -24, 88, 48, 20); c.fillStyle = col; c.fill();
  paint(() => { for (const yy of [-10, 2, 14]) line(c, -30, yy, 30, yy, 3.5, 'rgba(255,255,255,0.6)'); });
  c.restore();
}
// the basket (units are rig units: 190 wide at the rim, 130 tall); (x, y) = the middle of its rim. heap 0..1 = how full
function fbBasket(c, x, y, s, rot, heap = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (heap > 0.02) {   // the washing, above the rim
    c.save(); c.scale(1, heap);
    fbTowel(c, -40, -22, 1.0, -0.2, '#F2A7C3');
    fbTee(c, 30, -30, 0.95, 0.25, '#5B8DEF');
    fbTowel(c, 6, -40, 0.8, 0.12, '#FFD86B');
    fbSock(c, -64, -30, 0.9, -1.9);
    c.restore();
  }
  c.beginPath(); c.moveTo(-95, -6); c.lineTo(95, -6); c.lineTo(78, 124); c.quadraticCurveTo(0, 138, -78, 124); c.closePath(); c.fillStyle = '#C9B8F0'; c.fill();
  paint(() => {
    for (let r = 0; r < 3; r++) for (let i = -3; i <= 3; i++) { const w = 1 - r * 0.06; rrect(c, i * 22 * w - 6, 26 + r * 30, 12, 20, 5); c.fillStyle = '#6E5AA8'; c.fill(); }
  });
  rrect(c, -103, -18, 206, 24, 12); c.fillStyle = '#E3D8FF'; c.fill();
  c.restore();
}
// what flew out of it, in world units: [vx, vy, spin, kind, colour] thrown from P at tt = 0 (gravity 2300)
const FB_FLY = [   // [x0, vx, vy, spin, kind]
  [150, 220, -1180, 5.2, 'sock'], [118, 380, -960, -6.4, 'tee'], [180, 120, -1290, 4.1, 'towel'], [100, 470, -700, -3.4, 'towel2'],
];
function fbFlying(c, P, tt, s = 1) {
  if (tt <= 0 || tt > 2.2) return;
  FB_FLY.forEach(([x0, vx, vy, sp, kind], i) => {
    const d = Math.max(0, tt - i * 0.015), x = P[0] + (x0 + vx * d) * s, y = P[1] + (vy * d + 0.5 * 2300 * d * d) * s, r = sp * d + i;
    if (kind === 'sock') fbSock(c, x, y, 1.35 * s, r);
    else if (kind === 'tee') fbTee(c, x, y, 1.3 * s, r);
    else fbTowel(c, x, y, 1.15 * s, r, kind === 'towel' ? '#FFD86B' : '#F2A7C3');
  });
}

// ---------------------------------------------------------------- the hero in the doorway
// a shirt with the sleeves pushed up: his forearms are bare (the zap runs down one of them)
const FBPAL = Object.assign({}, PAL, { coat: '#2BB3A3', coatSh: '#19877A', coatHi: '#8FE6D8', coatDk: '#126B60', pj: true, shortSleeve: true });
// where an arm's elbow and wrist are (rig units; x < 0 is the left of the screen: the arm that finds the door frame)
const FB_ARM = {
  holdL: { e: [-168, -332], w: [-100, -292] }, holdR: { e: [168, -332], w: [100, -292] },
  zapL: { e: [-168, -332], w: [-232, -274] },            // thrown out and down, rigid, fingers spread
  showL: { e: [-172, -368], w: [-177, -458] },           // held up to look at: upper arm level, forearm up
  foldL: { e: [-122, -288], w: [-30, -326] },            // folded across his chest (the button)
  flinchR: { e: [112, -296], w: [56, -364] },             // the other hand jumps to his chest
  restR: { e: [104, -272], w: [114, -184] },
  rubR: { e: [14, -282], w: [-98, -294] },               // the other hand cups the sore elbow
};
function fbSt(A) {
  return { x: A.x === undefined ? DW.HX : A.x, y: DW.FLOOR + (A.bob || 0), s: A.s || DW.HS };
}
// A: {x, s, bob, lean, face, armL: {e, w}, armR: {e, w}, hand: 'open' | 'spread', basket: 0..1 (in his hands), sock: 0..1 (on his
//     head), frizz, headDX, headDY, headRot, tremL: the left arm shakes, handL / handR: one hand's shape}
function fbHero(cam, t, A) {
  const st = fbSt(A);
  let pose = Object.assign({}, POSES.stand, { hipY: -222, lean: A.lean || 0, hand: A.hand || 'open', handL: A.handL, handR: A.handR, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 } });
  const aL = A.armL || FB_ARM.holdL, aR = A.armR || FB_ARM.holdR, tr = A.tremL || 0;
  const jL = { e: [aL.e[0] + tr * 3 * vnoise(t * 31, 4), aL.e[1] + tr * 3 * vnoise(t * 33, 6)], w: [aL.w[0] + tr * 7 * vnoise(t * 37, 8), aL.w[1] + tr * 7 * vnoise(t * 35, 2)] };
  pose = armAt(pose, 'L', jL.e, jL.w);
  pose = armAt(pose, 'R', aR.e, aR.w);
  Object.assign(st, { pose, face: A.face, frizz: A.frizz || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0 });
  const bk = A.basket === undefined ? 0 : A.basket, sock = A.sock || 0;
  const r = charLayer(cam, st, t, { pal: FBPAL, post: (lc, rr) => {
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    if (bk > 0.5) {   // the basket in front of his chest, his forearms and hands on its rim again
      fbBasket(lc, 0, -300, 1, 0.02 * Math.sin(t * 9), 1);
      actor(() => {
        for (const [sd, k] of [[-1, 'L'], [1, 'R']]) {
          const el = rr['el' + k], wr = rr['wr' + k], d = rr['armDir' + k];
          capsuleShaded(lc, el, wr, 36, FBPAL.skin, FBPAL.skinSh, FBPAL.skinHi, FBPAL);
          drawHand(lc, wr, d, 'open', FBPAL, sd, t);
        }
      });
    }
    if (sock > 0.02) {   // a sock that came down on his head, and stays
      const hx = rr.head[0] + (st.headDX || 0), hy = rr.head[1] + (st.headDY || 0);
      lc.save(); lc.translate(hx, hy); lc.rotate((pose.lean || 0) + (st.headRot || 0));
      fbSock(lc, 46, -70 - 60 * (1 - sock), 1.05, 2.5 + 0.5 * (1 - sock));
      lc.restore();
    }
    lc.restore();
  } });
  const wp = (p) => toWorld(st, p);
  return { st, r, elL: wp(r.elL), wrL: wp(r.wrL), shL: wp(r.shL), dirL: r.armDirL, head: wp([r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)]), s: st.s };
}

// the bones of his left arm, for the flash on ZAP! (world units, camera applied): a dark arm with the bones lit in it
function fbArmBones(Hh, k) {
  if (k <= 0.01) return;
  const { shL: S, elL: Ee, wrL: Wr, dirL: d, s } = Hh, hx = Wr[0] + d[0] * 14 * s, hy = Wr[1] + d[1] * 14 * s;
  const a0 = Math.atan2(d[1], d[0]);
  ctx.save(); ctx.globalAlpha = clamp(k * 1.4);
  line(ctx, S[0], S[1], Ee[0], Ee[1], 44 * s, '#101A4A'); line(ctx, Ee[0], Ee[1], Wr[0], Wr[1], 38 * s, '#101A4A'); circle(ctx, hx, hy, 22 * s, '#101A4A');
  for (let i = -2; i <= 2; i++) line(ctx, hx, hy, hx + Math.cos(a0 + i * 0.38) * 34 * s, hy + Math.sin(a0 + i * 0.38) * 34 * s, 12 * s, '#101A4A');
  ctx.restore();
  for (const [c, a, w] of [[ctx, 1, 1], [gctx, 0.8, 1.9]]) {
    const col = c === ctx ? rgba('#F1F6FF', clamp(k * 1.4)) : rgba('#9FD0FF', a * k);
    line(c, S[0], S[1], Ee[0], Ee[1], 12 * s * w, col); circle(c, Ee[0], Ee[1], 10 * s * w, col); circle(c, S[0], S[1], 10 * s * w, col);
    const nx = -(Wr[1] - Ee[1]), ny = Wr[0] - Ee[0], L = Math.hypot(nx, ny) || 1, ox = (nx / L) * 6 * s, oy = (ny / L) * 6 * s;
    line(c, Ee[0] + ox, Ee[1] + oy, Wr[0] + ox, Wr[1] + oy, 6 * s * w, col); line(c, Ee[0] - ox, Ee[1] - oy, Wr[0] - ox, Wr[1] - oy, 6 * s * w, col);
    for (let i = -2; i <= 2; i++) line(c, hx, hy, hx + Math.cos(a0 + i * 0.38) * 32 * s, hy + Math.sin(a0 + i * 0.38) * 32 * s, 4 * s * w, col);
  }
}
// the zap on his skin (world units, camera applied): jagged arcs from his elbow to his fingers. k = how strong, f = frame
function fbZap(Hh, f, k, tips = 1) {
  if (k <= 0.02) return;
  const { elL: Ee, wrL: Wr, dirL: d, shL: S, s } = Hh, tip = [Wr[0] + d[0] * 44 * s, Wr[1] + d[1] * 44 * s];
  const rng = mulberry32(900 + f);
  const n = 2 + Math.round(2 * k);
  for (let i = 0; i < n; i++) {
    const A = i === n - 1 && k > 0.6 ? S : Ee, B = i === n - 1 && k > 0.6 ? Ee : tip;
    const J = jagged(rng, A[0], A[1], B[0], B[1], 46 * s * (0.6 + rng() * 0.6), 4);
    poly(ctx, J, 5 * s, rgba('#FFF6C4', 0.95 * clamp(k * 1.5))); poly(gctx, J, 13 * s, rgba('#FFB13C', 0.8 * clamp(k * 1.5)));
  }
  for (let i = 0; i < 4 * tips; i++) {   // sparks off his fingertips
    const a = Math.atan2(d[1], d[0]) + (rng() - 0.5) * 1.6, r0 = 8 * s, r1 = (26 + rng() * 40) * s * k;
    line(ctx, tip[0] + Math.cos(a) * r0, tip[1] + Math.sin(a) * r0, tip[0] + Math.cos(a) * r1, tip[1] + Math.sin(a) * r1, 4 * s, rgba('#FFF6C4', 0.9 * k));
  }
  softDot(gctx, Ee[0], Ee[1], 70 * s, '#FFB13C', 0.55 * k);
}
// a comic burst with a word in it (world units, camera applied). k = pop 0..1, a = alpha
function fbBurst(x, y, r, txt, k, a = 1, rot = -0.1, seed = 3) {
  if (k <= 0.01 || a <= 0.01) return;
  const q = E.outBack(clamp(k), 2.6), rng = mulberry32(seed), n = 13;
  const star = (c, r0, r1) => {
    c.beginPath();
    for (let i = 0; i < n * 2; i++) { const an = (i / (n * 2)) * Math.PI * 2 + rot, rr = (i % 2 ? r0 : r1 * (0.86 + 0.28 * ((i * 7919) % 13) / 13)) * q; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    c.closePath();
  };
  ctx.save(); ctx.globalAlpha = a;
  star(ctx, r * 0.62, r * 1.08); ctx.fillStyle = '#E2283C'; ctx.fill();
  star(ctx, r * 0.54, r * 0.94); ctx.fillStyle = '#FFD447'; ctx.fill();
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(q, q);
    ctx.font = `400 ${r * 0.56}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = r * 0.07; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText(txt, 0, r * 0.03);
    ctx.fillStyle = '#1A1026'; ctx.fillText(txt, 0, r * 0.03);
    ctx.restore();
  });
  ctx.restore();
  star(gctx, r * 0.5, r * 0.9); gctx.fillStyle = rgba('#FFB13C', 0.5 * a); gctx.fill();
  void rng;
}
