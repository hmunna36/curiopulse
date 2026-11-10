// Borrowed from tongue-nose (24 Oct 2026; blocked-nostril's, via two-noses) for the mirror-eyes Short; A.under added (his eyes).
// Borrowed from blocked-nostril (12 Oct 2026) for the two-noses Short: the bathroom seen from its mirror, and the hero close in it.
// The camera IS the mirror: he stands square to us in blue pyjamas, close enough that his nose is the subject.
//   initMirror()                      paints the room twice (a bright morning; the evening, for the cold)
//   mirRoom(cam, t, {night})          the room, far behind him (it moves a little with the camera)
//   mirHero(cam, t, A)                him, from a description A (see below); returns points of his face in world coords
//   mirAir(cam, t, P, o)              air on its way into a nostril (or bouncing off a blocked one)
//   mirSniffMarks, mirGerm, mirJar, mirSnail, mintLeaf, fuelCan: props
'use strict';

const MIR = { hx: 540, hy: 1500, hs: 1 };                  // the rig's feet (world). His head's middle is at (540, 1030)
const MIR_HEAD = [MIR.hx, MIR.hy - 470 * MIR.hs];
const NZ = { y: 20, wing: 15, wingY: 26, nost: 8.5, nostY: 30 };   // his nose in head units: the tip, the wings, the nostrils
const MIR_NOSE = [MIR.hx, MIR_HEAD[1] + 22 * MIR.hs];
const MIR_CAMY = 1066;                                       // the camera height the room was painted for
let MIR_DAY = null, MIR_NIGHT = null;

// soft blue pyjamas
const MIRPAL = Object.assign({}, PAL, { coat: '#5C8FE0', coatSh: '#3F6BB8', coatHi: '#A9C8FF', coatDk: '#2C4E8E', pj: true });

// ---------------------------------------------------------------- the room
function mirPaintRoom(night) {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, W * 0.7, H);
  g.addColorStop(0, night ? '#1B3552' : '#49B3AE'); g.addColorStop(0.55, night ? '#12233F' : '#2A8A8E'); g.addColorStop(1, night ? '#0A1428' : '#17566A');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // tiles: each a touch lighter or darker than its neighbours, with dark joints between them
  const rng = mulberry32(7), TS = 135;
  for (let y = -25; y < H; y += TS) for (let x = -40; x < W + TS; x += TS) {
    const v = rng();
    rrect(c, x + 5, y + 5, TS - 10, TS - 10, 12);
    c.fillStyle = night ? `rgba(130,170,255,${0.02 + 0.06 * v})` : `rgba(255,255,255,${0.03 + 0.10 * v})`; c.fill();
    rrect(c, x + 14, y + 12, TS - 60, 8, 4); c.fillStyle = night ? 'rgba(180,200,255,0.05)' : 'rgba(255,255,255,0.13)'; c.fill();
  }
  for (let x = -40; x < W + TS; x += TS) line(c, x, 0, x, H, 6, night ? 'rgba(3,8,22,0.55)' : 'rgba(8,58,70,0.5)');
  for (let y = -25; y < H; y += TS) line(c, 0, y, W, y, 6, night ? 'rgba(3,8,22,0.55)' : 'rgba(8,58,70,0.5)');
  // the window, left: frosted glass full of morning (or a moon)
  rrect(c, 44, 330, 286, 470, 22); c.fillStyle = night ? '#263658' : '#CFE4E0'; c.fill();
  const wg = c.createLinearGradient(0, 350, 0, 780);
  if (night) { wg.addColorStop(0, '#1E3470'); wg.addColorStop(1, '#101C44'); } else { wg.addColorStop(0, '#FFE9A6'); wg.addColorStop(1, '#F7B95A'); }
  rrect(c, 66, 352, 242, 426, 12); c.fillStyle = wg; c.fill();
  if (night) { circle(c, 226, 470, 44, '#DCE8FF'); circle(c, 244, 458, 38, '#1B2F68'); }
  line(c, 187, 352, 187, 778, 12, night ? '#263658' : '#CFE4E0'); line(c, 66, 560, 308, 560, 12, night ? '#263658' : '#CFE4E0');
  rrect(c, 24, 790, 326, 30, 10); c.fillStyle = night ? '#1C2946' : '#DCE9E8'; c.fill();
  // a plant on the sill
  rrect(c, 86, 716, 82, 78, 14); c.fillStyle = night ? '#6A3A2E' : '#E07A4A'; c.fill();
  for (const [a, l] of [[-0.9, 96], [-0.35, 124], [0.2, 112], [0.75, 88]]) { c.save(); c.translate(127, 722); c.rotate(a); ellipse(c, 0, -l / 2, 17, l / 2, night ? '#1F5A48' : '#2FA36B'); c.restore(); }
  // a shelf, right: a cup with a toothbrush, a bottle
  rrect(c, 770, 700, 300, 22, 9); c.fillStyle = night ? '#22304E' : '#E3EEEE'; c.fill();
  line(c, 868, 520, 884, 640, 9, night ? '#7A8CC0' : '#FF7C8E'); rrect(c, 852, 492, 26, 46, 8); c.fillStyle = night ? '#B8C6EE' : '#FFFFFF'; c.fill();
  rrect(c, 840, 610, 84, 92, 14); c.fillStyle = night ? '#8A6A2E' : '#F6B24A'; c.fill();
  rrect(c, 962, 584, 66, 118, 20); c.fillStyle = night ? '#5A3A68' : '#C77BE0'; c.fill(); rrect(c, 980, 548, 30, 40, 8); c.fillStyle = night ? '#2A2440' : '#F4F0FA'; c.fill();
  // a towel on a ring
  c.beginPath(); c.arc(930, 940, 50, 0, 7); c.lineWidth = 10; c.strokeStyle = night ? '#55638A' : '#D9E3E6'; c.stroke();
  rrect(c, 872, 946, 116, 330, 18); c.fillStyle = night ? '#4A4470' : '#FFE9C7'; c.fill();
  for (const y of [1180, 1212]) { rrect(c, 872, y, 116, 14, 4); c.fillStyle = night ? '#6A5EA0' : '#F0915A'; c.fill(); }
  // a wall light above the window (lit in the evening)
  rrect(c, 150, 196, 78, 30, 10); c.fillStyle = night ? '#2A2440' : '#9CC2C0'; c.fill();
  c.beginPath(); c.moveTo(138, 226); c.lineTo(240, 226); c.lineTo(222, 296); c.lineTo(156, 296); c.closePath(); c.fillStyle = night ? '#FFE2A8' : '#B9D6D2'; c.fill();
  return cv;
}
function initMirror() { MIR_DAY = mirPaintRoom(false); MIR_NIGHT = mirPaintRoom(true); }

// the room is far behind him: it grows and slides only a little as the camera moves
function mirBgCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.9, y: 960 + (cam.y - MIR_CAMY) * 0.9, zoom: 1.09 + 0.04 * (cam.zoom - 4.2), rot: 0, sx: (cam.sx || 0) * 0.12, sy: (cam.sy || 0) * 0.12 };
}
function mirRoom(cam, t, o = {}) {
  const night = !!o.night, bc = mirBgCam(cam);
  screenSpace(); ctx.fillStyle = night ? '#0A1428' : '#17566A'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(night ? MIR_NIGHT : MIR_DAY, 0, 0);
  if (night) { softDot(gctx, 189, 262, 210, '#FFC27A', 0.62); softDot(gctx, 189, 300, 420, '#FF9A50', 0.16); softDot(gctx, 226, 470, 110, '#9FB8FF', 0.4); }
  else { softDot(gctx, 187, 565, 250, '#FFE2A0', 0.26); softDot(gctx, 187, 565, 560, '#FFD27A', 0.07); sunRays(187, 540, 0.32); }
}

// ---------------------------------------------------------------- the hero
function mirHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function mirHeadPt(st, lx, ly) { const p = mirHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
// run fn in head units (origin at the head's middle), on a context that is in rig-local units
function mirInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// character.js's rig(), with arm bones of any length (pose.lenL / pose.lenR = [upper, fore]). An arm that comes up
// toward the camera looks shorter above the elbow and longer below it; with the rig's fixed bones a hand at his own
// nose puts the elbow up beside his ear.
function rig(pose) {
  const P = [0, pose.hipY], cs = Math.cos(pose.lean), sn = Math.sin(pose.lean);
  const U = (x, y) => [P[0] + x * cs - y * sn, P[1] + x * sn + y * cs];
  const r = { P, U, lean: pose.lean };
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    const arm = pose['arm' + k], leg = pose['leg' + k], len = pose['len' + k] || [100, 90];
    const sh = U(74 * s, -148);
    const d1 = DIR(s, arm.a + pose.lean * s), d2 = DIR(s, arm.a + arm.b + pose.lean * s);
    const el = [sh[0] + d1[0] * len[0], sh[1] + d1[1] * len[0]];
    const wr = [el[0] + d2[0] * len[1], el[1] + d2[1] * len[1]];
    const hip = [36 * s, pose.hipY + 4];
    const e1 = DIR(s, leg.a), e2 = DIR(s, leg.a + leg.b);
    const kn = [hip[0] + e1[0] * 104, hip[1] + e1[1] * 104];
    const an = [kn[0] + e2[0] * 98, kn[1] + e2[1] * 98];
    r['sh' + k] = sh; r['el' + k] = el; r['wr' + k] = wr; r['hip' + k] = hip; r['kn' + k] = kn; r['an' + k] = an;
    r['armDir' + k] = d2;
  }
  r.neck = U(0, -176);
  r.head = U(0, -248);
  r.heart = U(16, -108);
  r.chest = U(0, -100);
  return r;
}
// put an arm's elbow at e and its wrist at w (rig-local): the pose it takes
function mirArmAt(pose, side, e, w) {
  const s = side === 'L' ? -1 : 1, root = limbRoot(pose, 'arm' + side), lean = pose.lean * s;
  const th1 = Math.atan2(s * (e[0] - root[0]), e[1] - root[1]), th2 = Math.atan2(s * (w[0] - e[0]), w[1] - e[1]);
  const out = Object.assign({}, pose);
  out['arm' + side] = { a: th1 - lean, b: th2 - th1 };
  out['len' + side] = [Math.hypot(e[0] - root[0], e[1] - root[1]), Math.hypot(w[0] - e[0], w[1] - e[1])];
  return out;
}
// arm positions, as {e: elbow, w: wrist} (rig-local). The right arm: hanging, a finger pressing the nostril on its own
// side (screen right), hovering beside it, and across to the other nostril. The left arm: hanging, holding a jar up.
const MIR_ARM = {
  rest: { e: [90, -271], w: [113, -184] }, on: { e: [104, -292], w: [71, -418] }, off: { e: [108, -292], w: [84, -414] }, left: { e: [96, -300], w: [28, -404] },
  restL: { e: [-90, -271], w: [-113, -184] }, jar: { e: [-116, -290], w: [-52, -370] },
};
const mirArmMix = (a, b, k) => ({ e: [lerp(a.e[0], b.e[0], k), lerp(a.e[1], b.e[1], k)], w: [lerp(a.w[0], b.w[0], k), lerp(a.w[1], b.w[1], k)] });

// his rig state for a description A (no drawing)
function mirSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'fist', feetFront: 0 };
  if (A.armR) p = mirArmAt(p, 'R', A.armR.e, A.armR.w);
  if (A.armL) p = mirArmAt(p, 'L', A.armL.e, A.armL.w);
  return { x: MIR.hx + (A.dx || 0), y: MIR.hy, s: MIR.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, seed: 4 };
}

// his nose, in head units. N: {press: {side, k}, block: {L, R} 0..1 (how full of swollen tissue a nostril is),
//   flare: {L, R} 0..1, red 0..1 (a cold), quiver}
function mirNose(c, pal, N = {}, t = 0) {
  const red = N.red || 0, pr = N.press || { side: 1, k: 0 };
  const tip = mixH(mixH(pal.skin, '#EE7E5E', 0.42), '#F0424E', 0.72 * red), wing = mixH(mixH(pal.skin, '#DC6848', 0.52), '#E23A48', 0.72 * red);
  const q = (N.quiver || 0) * Math.sin(t * 46);
  paint(() => {
    ellipse(c, 0, NZ.nostY + 4.5, 19, 4.6, 'rgba(150,66,44,0.24)');   // the shade under it
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -3); c.quadraticCurveTo(s * 8.5, 9, s * 14, 18); c.lineWidth = 2.8; c.lineCap = 'round'; c.strokeStyle = 'rgba(170,84,56,0.36)'; c.stroke(); }   // the bridge
  });
  const geo = {};
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    const sq = pr.side === s ? pr.k : 0, fl = (N.flare && N.flare[k]) || 0;
    const wx = s * (NZ.wing - 5 * sq + 1.5 * fl), wy = NZ.wingY + 0.4 * q * (pr.side === s ? 0 : 1), rx = 9 - 2.8 * sq + 1.2 * fl, ry = 8.5 + 0.8 * fl;
    ellipse(c, wx, wy, rx, ry, wing);
    geo[k] = { sq, fl, wx, wy, rx, ry };
  }
  ellipse(c, 0, NZ.y, 15, 13.2, tip);
  paint(() => {
    ellipse(c, -4.4, 13.5, 5, 3.2, 'rgba(255,246,236,0.8)');
    if (red > 0.05) ellipse(c, 0, NZ.y + 2, 19, 14, `rgba(255,56,66,${0.2 * red})`);
    for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
      const G = geo[k], b = (N.block && N.block[k]) || 0;
      // the wing's outline, underneath and outside
      c.beginPath(); c.ellipse(G.wx, G.wy, G.rx, G.ry, 0, s > 0 ? -0.5 : Math.PI * 0.62, s > 0 ? Math.PI * 0.38 : Math.PI + 0.5); c.lineWidth = 1.9; c.lineCap = 'round'; c.strokeStyle = 'rgba(150,60,40,0.5)'; c.stroke();
      const nx = s * (NZ.nost - 3 * G.sq + 0.8 * G.fl), ny = NZ.nostY + 0.5 * q * (pr.side === s ? 0 : 1);
      const nk = N.nostK || 1;   // smaller nostrils for a wider shot (two-noses: at zoom 3 the full ones read as a snout)
      const rx = (6.2 + 1.9 * G.fl) * (1 - 0.86 * G.sq) * nk, ry = (4.3 + 1.5 * G.fl) * (1 - 0.35 * G.sq) * nk;
      ellipse(c, nx, ny, rx, ry, '#451420', s * 0.24);
      if (b > 0.02 && G.sq < 0.5) {   // swollen tissue, filling the hole
        ellipse(c, nx, ny + 0.5 * (1 - b), rx * (0.2 + 0.7 * b), ry * (0.25 + 0.64 * b), '#F0728A', s * 0.24);
        ellipse(c, nx - 1.5 * b, ny - 1.1 * b, rx * 0.3 * b, ry * 0.26 * b, 'rgba(255,220,228,0.92)', s * 0.24);
      }
    }
  });
}

// a sign hanging out of a nostril on a string, in head units. S: {k: 0..1 dropped, txt, col, txt2, col2, flip 0..1, swing}
function mirSign(c, side, S, t) {
  if (!S || S.k <= 0.01) return;
  const k = clamp(S.k, 0, 1.2), w = 57, h = 21.5;
  const ax = side * NZ.nost, ay = NZ.nostY + 1.5;
  const sw = (S.swing || 0) * Math.sin(t * 7.3 + side);
  const cx = side * (31 + 3 * sw) * Math.min(1, k), cy = lerp(ay, 43.5, k) + 0.6 * Math.abs(sw);
  const flip = S.flip || 0, second = flip > 0.5, sx = Math.max(0.04, Math.abs(Math.cos(Math.PI * flip)));
  const col = second ? S.col2 : S.col, txt = second ? S.txt2 : S.txt;
  paint(() => { for (const e of [-1, 1]) line(c, ax, ay, cx + e * 17 * sx * Math.min(1, k), cy + 1.5, 1.3, '#3A2A2A'); });
  c.save(); c.translate(cx, cy); c.rotate(side * 0.035 + 0.06 * sw); c.scale(Math.min(1, k) * sx, Math.min(1, k));
  rrect(c, -w / 2, 0, w, h, 4.5); c.fillStyle = '#FFF4DC'; c.fill();
  paint(() => {
    rrect(c, -w / 2 + 1.6, 1.6, w - 3.2, h - 3.2, 3.4); c.lineWidth = 1.5; c.strokeStyle = col; c.stroke();
    for (const e of [-1, 1]) circle(c, e * 17, 2.6, 1.5, '#3A2A2A');
    c.font = '900 9.4px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(txt, 0, h / 2 + 1.6);
  });
  c.restore();
}

// Draw him at the mirror from a description A:
//   face, headDX, headDY, headRot, lean, bob
//   armR / armL: {e, w} where the elbow and the wrist are (MIR_ARM, mirArmMix; none = the arm hangs)
//   finger: {side (+1 = the screen-right nostril; it may pass through 0 on its way across), k (0 = beside the wing ..
//            1 = pressed), on (0 = the finger just points up .. 1 = it goes to the nose)}
//   nose: the options of mirNose (block, flare, red, quiver); the finger's press is added here
//   signs: {L, R}: the options of mirSign
//   jar: {} a jar held in his left hand (give armL too)
//   blanket 0..1: a blanket over his head and shoulders (the cold)
//   post(lc, r, st): more drawing on his layer, in rig-local units
// Returns {st, r, head, nose, nostL, nostR, mouth, jar} in world coords
function mirHero(cam, t, A = {}) {
  const pal = A.pal || MIRPAL, st = mirSt(A), out = {};
  const fg = A.finger, N = Object.assign({}, A.nose || {});
  if (fg) N.press = { side: fg.side < 0 ? -1 : 1, k: Math.abs(fg.side) > 0.9 ? clamp(fg.k) * (fg.on === undefined ? 1 : clamp(fg.on)) : 0 };
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.04 : A.ambient,
    pre: (lc) => {
      if (!(A.blanket > 0.01)) return;
      lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
      actor(() => { ellipse(lc, 0, -476, 100, 108, '#7E5BC9'); });   // the hood of the blanket, behind his head
      lc.restore();
    },
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      if (A.blanket > 0.01) {   // the blanket over his shoulders
        actor(() => {
          lc.beginPath(); lc.moveTo(-58, -404); lc.quadraticCurveTo(-150, -380, -178, -230); lc.lineTo(-190, -120); lc.lineTo(190, -120); lc.lineTo(178, -230);
          lc.quadraticCurveTo(150, -380, 58, -404); lc.quadraticCurveTo(0, -362, -58, -404); lc.closePath(); lc.fillStyle = '#8E69DC'; lc.fill();
        });
        paint(() => { lc.beginPath(); lc.moveTo(0, -368); lc.quadraticCurveTo(-26, -300, -12, -130); lc.lineWidth = 5; lc.lineCap = 'round'; lc.strokeStyle = 'rgba(60,34,120,0.5)'; lc.stroke();
          for (const y of [-300, -230, -160]) line(lc, -170, y, 170, y, 7, 'rgba(255,224,150,0.22)'); });
        mirInHead(lc, s2, (c) => actor(() => {   // the edge of the hood, over his hair
          c.beginPath(); c.moveTo(-74, 34); c.quadraticCurveTo(-92, -60, -40, -84); c.quadraticCurveTo(0, -100, 40, -84); c.quadraticCurveTo(92, -60, 74, 34);
          c.quadraticCurveTo(84, -44, 34, -66); c.quadraticCurveTo(0, -76, -34, -66); c.quadraticCurveTo(-84, -44, -74, 34); c.closePath(); c.fillStyle = '#8E69DC'; c.fill();
        }));
      }
      mirInHead(lc, s2, (c) => {
        if (A.under) A.under(c);   // mirror-eyes: his big eyes, drawn before the nose so the nose stays in front of them
        const nk = A.noseK || 1;   // mirror-eyes: a smaller nose (this Short is about the eyes)
        c.save(); c.translate(0, NZ.y); c.scale(nk, nk); c.translate(0, -NZ.y);
        actor(() => mirNose(c, pal, N, t));
        c.restore();
        if (A.signs) { mirSign(c, -1, A.signs.L, t); mirSign(c, 1, A.signs.R, t); }
      });
      if (A.post) A.post(lc, rr, s2);
      // a jar in his left hand: the forearm and the hand again, in front of his head
      if (A.jar && A.armL) {
        const el = rr.elL, wr = rr.wrL, d = rr.armDirL, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14;
        capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
        line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
        const js = A.jar.s || 1;
        out.jarLocal = [hx - 2, hy - 34 * js];
        mirJar(lc, out.jarLocal[0], out.jarLocal[1], js, t, A.jar);
        circle(lc, hx - 2, hy + 4, 21.5, pal.skin);
        for (let i = 0; i < 3; i++) line(lc, hx - 8, hy - 12 + i * 9, hx + 16, hy - 15 + i * 9, 8.5, pal.skin);   // fingers round the glass
      }
      // the finger on his nose: the forearm, the hand and the finger again, in front of his head
      if (fg && A.armR) {
        const el = rr.elR, wr = rr.wrR, d = rr.armDirR, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14;
        const fk = clamp(fg.k), on = fg.on === undefined ? 1 : clamp(fg.on);
        const wing0 = mirHeadLocal(s2, fg.side * lerp(37, 16.5, fk), NZ.wingY + 0.5 + 4 * (1 - fk));   // the end of the finger: beside the wing, or pushing it in
        const tipP = [lerp(hx - 22, wing0[0], on), lerp(hy - 30, wing0[1], on)];   // on < 1: the finger just points up, away from his nose
        capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
        line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
        const dx = tipP[0] - hx, dy = tipP[1] - hy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
        line(lc, hx + ux * 8, hy + uy * 8, tipP[0] - ux * 6.2, tipP[1] - uy * 6.2, 12.4, pal.skin);   // the index finger
        circle(lc, hx, hy, 21.5, pal.skin);
        paint(() => {
          line(lc, hx + ux * 21, hy + uy * 21 - 4.6, hx + ux * 24, hy + uy * 24 + 4.6, 1.8, 'rgba(170,88,60,0.4)');   // the knuckle's crease
          for (let i = 0; i < 3; i++) { const a = Math.atan2(uy, ux) + 0.85 + i * 0.5; line(lc, hx + Math.cos(a) * 8, hy + Math.sin(a) * 8, hx + Math.cos(a) * 19, hy + Math.sin(a) * 19, 2.4, 'rgba(170,88,60,0.45)'); }   // the curled fingers
        });
        out.handLocal = [hx, hy];
      }
      lc.restore();
    },
  });
  const P = (lx, ly) => mirHeadPt(st, lx, ly);
  out.st = st; out.r = r; out.head = P(0, 0); out.nose = P(0, 22); out.mouth = P(0, 40); out.chin = P(0, 68);
  out.nostL = P(-NZ.nost, NZ.nostY + 1); out.nostR = P(NZ.nost, NZ.nostY + 1); out.top = P(0, -84);
  if (out.jarLocal) out.jar = [st.x + out.jarLocal[0] * st.s, st.y + out.jarLocal[1] * st.s];
  return out;
}

// ---------------------------------------------------------------- air
// Air on its way into a nostril at world point P (the camera is applied by the caller). o: {k: how much, blocked 0..1
// (it stops short and bounces off), speed, seed, col, slow: a few lazy dots instead of streaks}
function mirAir(t, P, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.02) return;
  const n = o.slow ? 5 : 20, sp = o.speed || (o.slow ? 0.42 : 2.1), bl = o.blocked || 0, col = o.col || '#DDF7FF';
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 7 + (o.seed || 1)), h2 = hash(i * 13 + 5 + (o.seed || 1));
    const p = ((t * sp * (0.8 + 0.4 * h2) + h1) % 1 + 1) % 1;
    const a0 = Math.PI * (0.14 + 0.72 * (i + 0.5) / n) + (o.lean || 0);      // they come from below, in a fan
    const R0 = 62 + 34 * h2;
    let r, al, a = a0 + 0.5 * (1 - p) * (h1 - 0.5), out = 0;
    if (bl > 0.5) {   // in to the hole ... and off it again, sideways
      const pin = Math.min(1, p / 0.62); out = clamp((p - 0.62) / 0.38);
      r = lerp(R0, 8, pin * pin) + 18 * out; a += (h1 > 0.5 ? 1 : -1) * 1.3 * out;
      al = Math.sin(Math.PI * pin * 0.5) * (1 - out);
    } else { r = lerp(R0, 1.5, p * p); al = Math.sin(Math.PI * Math.min(1, p * 1.6) * 0.5) * clamp((1 - p) * 6); }
    const x = P[0] + Math.cos(a) * r, y = P[1] + Math.sin(a) * r * 0.82;
    const len = o.slow ? 0 : Math.min(r - 1, (9 + 15 * p) * (out > 0 ? 0.4 : 1)), tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len * 0.82;
    for (const cc of [ctx, gctx]) {
      if (o.slow) circle(cc, x, y, cc === ctx ? 2.5 : 4.4, rgba(col, (cc === ctx ? 0.95 : 0.22) * al * k));
      else {
        if (cc === ctx) line(cc, x, y, tx, ty, 3.3, rgba('#12406A', 0.35 * al * k));
        line(cc, x, y, tx, ty, cc === ctx ? 2.2 : 4.2, rgba(col, (cc === ctx ? 0.95 : 0.2) * al * k));
      }
    }
  }
}

// ---------------------------------------------------------------- props
// a lab jar with two smells in it (rig-local or any units; its mouth is at the top). o: {wob}
function mirJar(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.rot || 0);
  rrect(c, -15, -4, 30, 40, 7); c.fillStyle = '#CDEFF2'; c.fill();
  rrect(c, -17, -9, 34, 8, 3); c.fillStyle = '#9FD6DC'; c.fill();
  paint(() => {
    c.save(); rrect(c, -15, -4, 30, 40, 7); c.clip();
    c.fillStyle = '#7BD88F'; c.fillRect(-15, 14, 30, 22);
    c.fillStyle = '#9A8FB8'; c.beginPath(); c.moveTo(-15, 22 + 2 * Math.sin(t * 3)); c.quadraticCurveTo(0, 15, 15, 23 - 2 * Math.sin(t * 3)); c.lineTo(15, 36); c.lineTo(-15, 36); c.closePath(); c.fill();
    c.restore();
    rrect(c, -10, 1, 20, 11, 2.5); c.fillStyle = '#FFFFFF'; c.fill();
    c.font = '900 8px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2A2440'; c.fillText('MIX', 0, 7);
    line(c, -11, 0, -11, 30, 2, 'rgba(255,255,255,0.7)');
  });
  c.restore();
}
// a mint leaf and a fuel can: what each nostril made of the jar (drawn about 0,0, about 100 px across at s = 1)
function mintLeaf(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (const [a, l] of [[-0.55, 0.8], [0.5, 0.86], [0, 1]]) {
    c.save(); c.rotate(a); c.beginPath(); c.moveTo(0, 30); c.quadraticCurveTo(-34 * l, -6, 0, -52 * l); c.quadraticCurveTo(34 * l, -6, 0, 30); c.closePath();
    c.fillStyle = a === 0 ? '#3FCB7C' : '#2FA866'; c.fill(); line(c, 0, 24, 0, -40 * l, 3, 'rgba(18,90,52,0.6)');
    for (const yy of [-22, -6, 10]) { line(c, 0, yy * l, -11 * l, (yy - 10) * l, 2, 'rgba(18,90,52,0.5)'); line(c, 0, yy * l, 11 * l, (yy - 10) * l, 2, 'rgba(18,90,52,0.5)'); }
    c.restore();
  }
  c.restore();
}
function fuelCan(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -34, -30, 68, 74, 10); c.fillStyle = '#E2463C'; c.fill();
  c.beginPath(); c.moveTo(-34, -22); c.lineTo(-10, -48); c.lineTo(16, -48); c.lineTo(16, -30); c.closePath(); c.fillStyle = '#E2463C'; c.fill();
  rrect(c, 14, -56, 22, 14, 4); c.fillStyle = '#2A2440'; c.fill();
  c.beginPath(); c.moveTo(0, -12); c.bezierCurveTo(17, 8, 17, 32, 0, 32); c.bezierCurveTo(-17, 32, -17, 8, 0, -12); c.fillStyle = '#2A2440'; c.fill();   // a drop of fuel
  ellipse(c, -5, 18, 3.4, 6, 'rgba(255,255,255,0.5)', 0.4);
  rrect(c, -24, -36, 26, 10, 5); c.fillStyle = '#A8241E'; c.fill();
  c.restore();
}
// a snail, for the slow lane (about 90 px long at s = 1, facing right)
function mirSnail(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -40, 8, 86, 18, 9); c.fillStyle = '#F2C879'; c.fill();
  circle(c, 44, 0, 13, '#F2C879');
  for (const e of [0, 1]) { line(c, 40 + e * 9, -8, 38 + e * 13, -26 + 2 * Math.sin(t * 5 + e), 3.5, '#F2C879'); circle(c, 38 + e * 13, -27 + 2 * Math.sin(t * 5 + e), 4, '#2A2440'); }
  circle(c, -6, -8, 27, '#FF9A3C'); c.beginPath(); c.arc(-6, -8, 16, 0.4, 5.2); c.lineWidth = 5; c.strokeStyle = '#C8641A'; c.stroke(); c.beginPath(); c.arc(-4, -8, 6, 0, 4.6); c.stroke();
  c.restore();
}
// the cold: a small green germ with a face, an arm that waves
function mirGerm(c, x, y, s, t, k = 1) {
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(s * k, s * k); c.rotate(0.12 * Math.sin(t * 3));
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + t * 0.6; line(c, Math.cos(a) * 34, Math.sin(a) * 34, Math.cos(a) * 54, Math.sin(a) * 54, 9, '#5FD06A'); circle(c, Math.cos(a) * 56, Math.sin(a) * 56, 8, '#8BEA8F'); }
  circle(c, 0, 0, 40, '#5FD06A');
  paint(() => {
    ellipse(c, -12, -14, 14, 9, 'rgba(210,255,210,0.5)');
    for (const e of [-1, 1]) { ellipse(c, e * 13, -4, 8, 10, '#FFFFFF'); circle(c, e * 13 + 2, -2, 4.4, '#15132A'); line(c, e * 6, -19, e * 21, -15, 4, '#1F6A2E'); }
    c.beginPath(); c.moveTo(-13, 14); c.quadraticCurveTo(0, 28, 15, 12); c.lineWidth = 4; c.lineCap = 'round'; c.strokeStyle = '#1F4A2A'; c.stroke();
  });
  c.restore();
}
