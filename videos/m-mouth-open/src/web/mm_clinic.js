// Why Can't You Say "M" With Your Mouth OPEN? 👄 Short: THE DENTIST'S ROOM by a sunny window (a new world, 12 Nov 2026).
// World space (1080x1920 at zoom 1). The hero sits in the dental chair, his head centre at MMH.head.
//   initClinic()              paints the back wall once (MM.WALL): mint wall, tiles, a window with blinds and a tree,
//                             the FLOSS! poster, an x-ray light box, a cabinet with a jar of toothbrushes and a plant
//   mmWall(cam, t, o)         the wall plate with parallax (o.dy: the camera's height: + = a high angle, - = a low one)
//   mmWallGlow(cam, t)        the room's practical lights in the glow layer (the light box, the window)
//   mmChairBack(cam)          the headrest and the backrest behind him (the set)
//   mmLamp(cam, t, o)         the dental lamp on its arm, its face in the glow layer (o.k: how much of it is lit)
//   mmHero(cam, t, A)         him in the chair (charLayer): the bib, the mirror in his mouth, a finger on his nose, his lips
//                             A: {face, headDX, headDY, headRot, lips: 'P' | null, puff, mirror: {k, x, y, ang}, finger 0..1,
//                             buzz 0..1, glove 0..1, cheekRed}
//   mmHeadPt(Hh, q)           head units -> world
//   mmDentist(c, x, y, s, o)  the dentist (an actor): cap, round glasses, a mask, a white coat; o: {eyes 'smile' | 'squint'
//                             | 'open', look: [x, y], lean, arm: {to: [x, y]} (world point the gloved hand holds)}
//   mmMirror(c, a, b, s)      a dental mirror from the handle end a to the mirror b (any context)
//   mmGlove(c, x, y, ang, s)  a blue-gloved fist holding a handle (any context)
'use strict';

const MMH = { x: 540, y: 1700, s: 1.0, head: [528, 1418] };   // his feet line; head = where the sitting rig's head lands
const MMPAL = PAL;                                 // his own yellow coat: the bib goes over it
const MMC = {
  wallTop: '#E4F6F1', wallBot: '#C6EAE3', tile: '#7FD3C8', tileHi: '#A8E6DD', grout: '#5DB8AD', trim: '#2E8C84',
  vinyl: '#1FA79B', vinylSh: '#137A71', vinylHi: '#52D0C3', metal: '#C9D2E0', metalSh: '#7E8AA3',
  bib: '#8CCBFF', bibSh: '#5FA8EA', glove: '#4F8DFF', gloveSh: '#2F64D6', coat: '#F7FAFF', coatSh: '#C9D3E6',
  mask: '#9ED8FF', maskSh: '#6FB4E8', cap: '#3FB7A9', capSh: '#2A8F84',
};
let MM_WALL = null, MM_WALL_SOFT = null;
const MM_WALL_W = 1400, MM_WALL_H = 1800, MM_WALL_HEAD = [700, 900];   // plate units; the head sits at MM_WALL_HEAD

function initClinic() {
  const cv = mkCanvas(MM_WALL_W, MM_WALL_H), g = cv.getContext('2d');
  // the wall: mint paint above, a tiled band below a teal trim
  const bg = g.createLinearGradient(0, 0, 0, MM_WALL_H); bg.addColorStop(0, MMC.wallTop); bg.addColorStop(0.62, MMC.wallBot); bg.addColorStop(1, '#B3DDD6');
  g.fillStyle = bg; g.fillRect(0, 0, MM_WALL_W, MM_WALL_H);
  const TY = 1080;
  g.fillStyle = MMC.tile; g.fillRect(0, TY, MM_WALL_W, MM_WALL_H - TY);
  const rng = mulberry32(17);
  for (let y = TY; y < MM_WALL_H; y += 64) for (let x = 0; x < MM_WALL_W; x += 64) {
    g.fillStyle = rng() < 0.12 ? MMC.tileHi : `rgba(255,255,255,${0.05 + 0.06 * rng()})`; g.fillRect(x + 3, y + 3, 58, 58);
  }
  g.fillStyle = MMC.trim; g.fillRect(0, TY - 16, MM_WALL_W, 18);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, TY - 16, MM_WALL_W, 4);
  // the window (right): a sunny sky, a tree, blinds half down
  const WX = 980, WY = 330, WW = 360, WH = 560;
  g.fillStyle = '#F4FBFF'; g.fillRect(WX - 22, WY - 22, WW + 44, WH + 44);
  const sky = g.createLinearGradient(0, WY, 0, WY + WH); sky.addColorStop(0, '#6FC8FF'); sky.addColorStop(1, '#CFF0FF');
  g.fillStyle = sky; g.fillRect(WX, WY, WW, WH);
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(WX + 60 + i * 70, WY + 120 + 18 * Math.sin(i * 1.7), 50, 22, 0, 0, 7); g.fill(); }
  // the tree outside
  g.fillStyle = '#6A4A2A'; g.fillRect(WX + 210, WY + 330, 26, WH - 330);
  for (let i = 0; i < 14; i++) { const a = rng() * 6.28, r = rng() * 120; g.fillStyle = i % 3 ? '#4FBF5A' : '#3A9E48'; g.beginPath(); g.arc(WX + 222 + Math.cos(a) * r, WY + 300 + Math.sin(a) * r * 0.8, 50 + 30 * rng(), 0, 7); g.fill(); }
  g.fillStyle = '#7ED870'; g.fillRect(WX, WY + WH - 70, WW, 70);
  // the blinds: slats down to 45 %
  for (let y = WY; y < WY + WH * 0.45; y += 26) { g.fillStyle = '#FFFFFF'; g.fillRect(WX - 8, y, WW + 16, 18); g.fillStyle = 'rgba(120,150,170,0.35)'; g.fillRect(WX - 8, y + 15, WW + 16, 3); }
  g.fillStyle = '#E3EBF2'; g.fillRect(WX - 14, WY + WH * 0.45, WW + 28, 12);
  // the frame's cross bars
  g.fillStyle = '#F4FBFF'; g.fillRect(WX + WW / 2 - 8, WY + WH * 0.45, 16, WH * 0.55); g.fillRect(WX, WY + WH * 0.72, WW, 14);
  // the FLOSS! poster (top middle): a happy tooth with a string of floss
  const PX = 470, PY = 160, PW = 300, PH = 380;
  g.fillStyle = '#FFFFFF'; g.fillRect(PX - 10, PY - 10, PW + 20, PH + 20);
  g.fillStyle = '#FFE36E'; g.fillRect(PX, PY, PW, PH);
  g.fillStyle = '#FFFFFF'; g.beginPath();
  g.moveTo(PX + 80, PY + 90); g.bezierCurveTo(PX + 80, PY + 40, PX + 150, PY + 50, PX + 150, PY + 70); g.bezierCurveTo(PX + 150, PY + 50, PX + 220, PY + 40, PX + 220, PY + 90);
  g.bezierCurveTo(PX + 220, PY + 170, PX + 200, PY + 240, PX + 190, PY + 260); g.bezierCurveTo(PX + 180, PY + 280, PX + 160, PY + 270, PX + 155, PY + 220);
  g.bezierCurveTo(PX + 150, PY + 200, PX + 150, PY + 200, PX + 145, PY + 220); g.bezierCurveTo(PX + 140, PY + 270, PX + 120, PY + 280, PX + 110, PY + 260);
  g.bezierCurveTo(PX + 100, PY + 240, PX + 80, PY + 170, PX + 80, PY + 90); g.fill();
  g.lineWidth = 6; g.strokeStyle = '#2A2A40'; g.stroke();
  g.fillStyle = '#2A2A40'; g.beginPath(); g.arc(PX + 125, PY + 120, 9, 0, 7); g.arc(PX + 175, PY + 120, 9, 0, 7); g.fill();
  g.beginPath(); g.arc(PX + 150, PY + 150, 22, 0.15, Math.PI - 0.15); g.lineWidth = 6; g.stroke();
  g.strokeStyle = '#FF5A8A'; g.lineWidth = 5; g.beginPath(); g.moveTo(PX + 40, PY + 200); g.quadraticCurveTo(PX + 150, PY + 330, PX + 260, PY + 190); g.stroke();
  g.font = '400 92px Anton'; g.textAlign = 'center'; g.fillStyle = '#E8344A'; g.fillText('FLOSS!', PX + PW / 2, PY + PH - 20);
  // the x-ray light box (left): a glowing panel with a smile of teeth
  const LX = 140, LY = 420, LW = 330, LH = 230;
  g.fillStyle = '#3A4458'; g.fillRect(LX - 16, LY - 16, LW + 32, LH + 32);
  g.fillStyle = '#E8F4FF'; g.fillRect(LX, LY, LW, LH);
  g.fillStyle = '#1C2638'; g.fillRect(LX + 22, LY + 26, LW - 44, LH - 52);
  for (let i = 0; i < 8; i++) {
    const x = LX + 50 + i * 30, top = LY + 70 + 8 * Math.abs(i - 3.5), h = 46 - 3 * Math.abs(i - 3.5);
    g.fillStyle = '#DCE8F6'; g.beginPath(); g.ellipse(x, top + h / 2, 12, h / 2, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x, top + h + 34, 11, h / 2 - 2, 0, 0, 7); g.fill();
  }
  // the cabinet (lower left), a jar of toothbrushes and a little plant on it
  g.fillStyle = '#FFFFFF'; g.fillRect(40, 940, 440, 140);
  g.fillStyle = '#E1E9F2'; for (let i = 0; i < 3; i++) g.fillRect(56 + i * 140, 960, 126, 104);
  g.fillStyle = MMC.trim; for (let i = 0; i < 3; i++) g.fillRect(100 + i * 140, 1004, 40, 10);
  g.fillStyle = 'rgba(180,230,255,0.75)'; g.fillRect(110, 860, 80, 80);
  const bc = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FB8FF'];
  for (let i = 0; i < 4; i++) { g.save(); g.translate(126 + i * 16, 880); g.rotate(-0.25 + i * 0.16); g.fillStyle = bc[i]; g.fillRect(-4, -70, 8, 90); g.fillStyle = '#FFFFFF'; g.fillRect(-7, -86, 14, 22); g.restore(); }
  g.fillStyle = '#C96A3A'; g.fillRect(330, 880, 80, 60);
  for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#3FA34D' : '#56C25F'; g.beginPath(); g.ellipse(370 + 34 * Math.cos(i * 0.7 - 2.6), 850 + 26 * Math.sin(i * 0.7 - 2.6), 16, 30, i * 0.7 - 1, 0, 7); g.fill(); }
  // a soft light patch from the window on the wall
  const lp = g.createRadialGradient(900, 700, 40, 900, 700, 520); lp.addColorStop(0, 'rgba(255,248,220,0.35)'); lp.addColorStop(1, 'rgba(255,248,220,0)');
  g.fillStyle = lp; g.fillRect(0, 0, MM_WALL_W, MM_WALL_H);
  MM_WALL = cv;
  // a soft copy for the close shots (the wall far behind him)
  const sv = mkCanvas(MM_WALL_W, MM_WALL_H), sg = sv.getContext('2d');
  sg.filter = 'blur(7px)'; sg.drawImage(cv, 0, 0); sg.filter = 'none';
  MM_WALL_SOFT = sv;
}

// where the plate is drawn: the head's own screen point, pulled toward the middle (parallax), scaled less than the camera
function mmWallXf(cam, o = {}) {
  const hs = toScreen(cam, MMH.head[0], MMH.head[1]);
  const p = 0.62, zf = Math.pow(cam.zoom, 0.58) * 0.92;
  return { x: hs[0] * p + (W / 2) * (1 - p), y: hs[1] * p + (H / 2) * (1 - p) + (o.dy || 0), zf };
}
function mmWall(cam, t, o = {}) {
  screenSpace();
  const X = mmWallXf(cam, o);
  ctx.fillStyle = '#B9E2DB'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(X.x, X.y); ctx.scale(X.zf, X.zf); ctx.translate(-MM_WALL_HEAD[0], -MM_WALL_HEAD[1]);
  ctx.drawImage(cam.zoom > 3.2 ? MM_WALL_SOFT : MM_WALL, 0, 0);
  ctx.restore();
  mmWallGlow(cam, t, o);
}
function mmWallGlow(cam, t, o = {}) {
  const X = mmWallXf(cam, o), P = (u, v) => [X.x + (u - MM_WALL_HEAD[0]) * X.zf, X.y + (v - MM_WALL_HEAD[1]) * X.zf];
  const lb = P(305, 535), wn = P(1160, 640);
  softDot(gctx, lb[0], lb[1], 190 * X.zf, '#CFE8FF', 0.32);
  softDot(gctx, wn[0], wn[1], 260 * X.zf, '#FFF6D8', 0.28);
}

// the headrest and the backrest of the chair, behind him (world)
function mmChairBack(cam) {
  applyCam(cam);
  const hx = MMH.head[0], hy = MMH.head[1];
  // the backrest: from his shoulders down, wider than him
  rrect(ctx, hx - 128, hy + 96, 256, 430, 70); ctx.fillStyle = MMC.vinylSh; ctx.fill();
  rrect(ctx, hx - 116, hy + 104, 232, 410, 62); ctx.fillStyle = MMC.vinyl; ctx.fill();
  // the stem between headrest and backrest
  rrect(ctx, hx - 22, hy + 40, 44, 90, 10); ctx.fillStyle = MMC.metalSh; ctx.fill();
  // the headrest: a soft pad behind his head
  rrect(ctx, hx - 96, hy - 40, 192, 120, 56); ctx.fillStyle = MMC.vinylSh; ctx.fill();
  rrect(ctx, hx - 88, hy - 34, 176, 106, 50); ctx.fillStyle = MMC.vinyl; ctx.fill();
  paint(() => { line(ctx, hx - 60, hy - 18, hx + 40, hy - 24, 6, rgba(MMC.vinylHi, 0.7)); });
}
// the arms of the chair and a tray in front (world): only in the wider shots
function mmChairFront(cam) {
  applyCam(cam);
  const hx = MMH.head[0], hy = MMH.head[1];
  for (const s of [-1, 1]) { rrect(ctx, hx + s * 150 - 34, hy + 330, 68, 40, 18); ctx.fillStyle = MMC.vinylSh; ctx.fill(); rrect(ctx, hx + s * 150 - 30, hy + 330, 60, 32, 15); ctx.fillStyle = MMC.vinyl; ctx.fill(); }
}

// the dental lamp: an arm from above, the lamp head with a glowing face. o.at = [x, y] world point of the lamp's face
function mmLamp(cam, t, o = {}) {
  applyCam(cam);
  const at = o.at || [MMH.head[0] - 150, MMH.head[1] - 250], k = o.k === undefined ? 1 : o.k;
  line(ctx, at[0] - 260, at[1] - 520, at[0] - 60, at[1] - 120, 26, MMC.metalSh);
  line(ctx, at[0] - 60, at[1] - 120, at[0], at[1] - 40, 22, MMC.metalSh);
  ctx.save(); ctx.translate(at[0], at[1]); ctx.rotate(0.5);
  rrect(ctx, -86, -44, 172, 74, 30); ctx.fillStyle = '#E9EEF6'; ctx.fill();
  rrect(ctx, -70, 8, 140, 22, 10); ctx.fillStyle = '#FFF8E2'; ctx.fill();
  ctx.restore();
  gctx.save(); gctx.translate(at[0], at[1]); gctx.rotate(0.5);
  rrect(gctx, -72, 6, 144, 26, 12); gctx.fillStyle = `rgba(255,246,214,${0.9 * k})`; gctx.fill();
  gctx.restore();
  screenSpace();
  const s = toScreen(cam, at[0], at[1] + 20);
  softDot(gctx, s[0], s[1], 300 * Math.min(2.4, cam.zoom), '#FFF3D0', 0.32 * k);
}
// a dental mirror: the handle from a to b, the round mirror at b (any context, its own units)
function mmMirror(c, a, b, s = 1) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  line(c, a[0], a[1], b[0] - Math.cos(ang) * 9 * s, b[1] - Math.sin(ang) * 9 * s, 7 * s, MMC.metalSh);
  line(c, a[0], a[1], b[0] - Math.cos(ang) * 9 * s, b[1] - Math.sin(ang) * 9 * s, 4 * s, MMC.metal);
  c.save(); c.translate(b[0], b[1]); c.rotate(ang);
  c.beginPath(); c.ellipse(0, 0, 9 * s, 11 * s, 0, 0, 7); c.fillStyle = MMC.metalSh; c.fill();
  paint(() => {
    c.beginPath(); c.ellipse(0, 0, 7 * s, 9 * s, 0, 0, 7); c.fillStyle = '#BFE7FF'; c.fill();
    line(c, -2 * s, -5 * s, 2 * s, -1 * s, 2 * s, 'rgba(255,255,255,0.95)');
  });
  c.restore();
}
// a blue-gloved fist round a handle at (x, y), the handle leaving at angle ang; a white cuff behind it
function mmGlove(c, x, y, ang, s = 1, sleeve = true) {
  c.save(); c.translate(x, y); c.rotate(ang);
  // the coat sleeve and the cuff (behind the fist, away from the handle)
  if (sleeve) { rrect(c, 20 * s, -26 * s, 140 * s, 52 * s, 22 * s); c.fillStyle = MMC.coat; c.fill(); }
  rrect(c, 14 * s, -22 * s, 20 * s, 44 * s, 8 * s); c.fillStyle = MMC.gloveSh; c.fill();
  // the fist: knuckles toward us
  rrect(c, -22 * s, -24 * s, 46 * s, 46 * s, 16 * s); c.fillStyle = MMC.glove; c.fill();
  paint(() => {
    for (let i = 0; i < 3; i++) line(c, -14 * s + i * 13 * s, -16 * s, -14 * s + i * 13 * s, 10 * s, 2 * s, rgba(MMC.gloveSh, 0.9));
    line(c, -16 * s, -20 * s, 14 * s, -20 * s, 3 * s, 'rgba(255,255,255,0.35)');
  });
  // the thumb over the handle
  rrect(c, -30 * s, -6 * s, 30 * s, 16 * s, 8 * s); c.fillStyle = MMC.gloveSh; c.fill();
  c.restore();
}

// head units -> world for a drawn hero (Hh from mmHero)
function mmHeadPt(Hh, q) {
  const st = Hh.st, r = Hh.r, a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [st.x + st.s * (r.head[0] + (st.headDX || 0) + q[0] * cs - q[1] * sn), st.y + st.s * (r.head[1] + (st.headDY || 0) + q[0] * sn + q[1] * cs)];
}
function mmInHead(c, st, r, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c);
  c.restore();
}

// pressed lips (a hum: M), cheeks a little puffed (head units, the mouth at 0,40)
function mmLipsP(c, puff = 0, wob = 0) {
  paint(() => {
    c.save(); c.translate(0, 40);
    for (const s of [-1, 1]) ellipse(c, s * (33 + 3 * puff), -10, 13 + 5 * puff, 10 + 4 * puff, rgba(MMPAL.skinHi, 0.35 + 0.35 * puff));
    for (const s of [-1, 1]) ellipse(c, s * 36, -8, 11, 7, `rgba(255,110,110,${0.22 + 0.2 * puff})`);
    const w = 17 + 2 * puff;
    c.beginPath(); c.moveTo(-w, wob); c.quadraticCurveTo(0, -5 + wob, w, 0); c.quadraticCurveTo(0, 7, -w, wob); c.closePath();
    c.fillStyle = '#C9606A'; c.fill();
    line(c, -w + 2, 0, w - 2, 0, 2.6, '#8E3440');
    c.restore();
  });
}

// his right arm at his face, as elbow + wrist in rig-local units (sitting): the hand at rest on the armrest .. a finger on
// the side of his nose
const MM_ARM_REST = { e: [104, -96], w: [120, -24] };
const MM_ARM_NOSE = { e: [140, -206], w: [54, -240] };   // the finger lies along the side of the nose, under the eye

// him in the chair. Returns {st, r, hp(q)}.
function mmHero(cam, t, A) {
  const f = clamp(A.finger || 0);
  let pose = { ...POSES.sit, hand: 'open', handR: f > 0.5 ? 'point' : 'open' };
  const aR = armMix(MM_ARM_REST, MM_ARM_NOSE, E.inOutCubic(f));
  pose = armAt(pose, 'R', aR.e, aR.w);
  pose = armAt(pose, 'L', [-104, -96], [-120, -24]);
  const face = Object.assign({}, A.face);
  if (A.lips) face.mouth = 'none';
  const st = { x: MMH.x, y: MMH.y, s: MMH.s, pose, face, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, seed: 3 };
  const bz = clamp(A.buzz || 0);
  if (bz > 0.01) { st.headDX += 0.9 * bz * Math.sin(t * 157); st.headDY += 0.5 * bz * Math.sin(t * 131); }
  const r = charLayer(cam, st, t, { pal: MMPAL, post: (lc, rr, s2) => {
    // the paper bib on his chest, clipped on with a little chain
    lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s); lc.translate(rr.P[0], rr.P[1]); lc.rotate(s2.pose.lean);
    lc.beginPath(); lc.moveTo(-64, -142); lc.lineTo(64, -142); lc.lineTo(70, -40); lc.quadraticCurveTo(0, -30, -70, -40); lc.closePath();
    lc.fillStyle = MMC.bib; lc.fill();
    paint(() => { for (let i = 0; i < 4; i++) line(lc, -60, -126 + i * 22, 60, -126 + i * 22, 2, rgba(MMC.bibSh, 0.45)); });
    for (const sd of [-1, 1]) { circle(lc, sd * 58, -138, 6, '#B8C2D6'); line(lc, sd * 58, -140, sd * 40, -150, 3, '#B8C2D6'); }
    lc.restore();
    // the arm at his nose, drawn again in front of his head
    if (f > 0.02) {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      const el = rr.elR, wr = rr.wrR, d = rr.armDirR;
      capsuleShaded(lc, el, wr, 38, MMPAL.coat, MMPAL.coatSh, MMPAL.coatHi, MMPAL);
      line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, MMPAL.coatSh);
      drawHand(lc, wr, d, f > 0.5 ? 'point' : 'open', MMPAL, 1, t);
      lc.restore();
    }
    // the mouth extras in head units: pressed lips, the dental mirror
    mmInHead(lc, s2, rr, (c) => {
      if (A.lips === 'P') mmLipsP(c, A.puff || 0, A.lipWob || 0);
      const m = A.mirror;
      if (m && m.k > 0.01) {
        // the mirror sits in the open mouth (the yawn mouth's middle is at 0, 40 + 22 jaw), the handle leaves at the
        // corner of his mouth toward the dentist's hand (screen right)
        const jaw = face.jaw || 0, my = 40 - 2 + 34 * jaw * 0.66;
        const ek = E.inOutCubic(clamp(m.k));
        const tip = [lerp(320, m.x === undefined ? -4 : m.x, ek), lerp(my - 70, my + (m.y === undefined ? -14 : m.y), ek)];
        const ang = m.ang === undefined ? -0.18 : m.ang, L = 122;
        const end = [tip[0] + Math.cos(ang) * L, tip[1] + Math.sin(ang) * L];
        mmMirror(c, end, tip, 1.15);
        if (A.glove !== false) mmGlove(c, end[0], end[1], ang, 0.95, A.gloveSleeve !== false);
      }
    });
  } });
  const out = { st, r };
  out.hp = (q) => mmHeadPt(out, q);
  return out;
}

// the dentist (an actor): head at (x, y), s = scale (1 = the hiker's head size). o: {eyes, look, lean, brow}
function mmDentist(c, x, y, s, o = {}) {
  const look = o.look || [-1, 0], eyes = o.eyes || 'open', br = o.brow || 0;
  actor(() => {
    c.save(); c.translate(x, y); c.rotate(o.lean || 0); c.scale(s, s);
    // the white coat: shoulders and chest below the head
    c.beginPath(); c.moveTo(-120, 120); c.quadraticCurveTo(-110, 70, -40, 64); c.lineTo(40, 64); c.quadraticCurveTo(110, 70, 120, 120); c.lineTo(140, 420); c.lineTo(-140, 420); c.closePath();
    c.fillStyle = MMC.coat; c.fill();
    // the teal scrubs at the neck, the lapels
    c.beginPath(); c.moveTo(-34, 64); c.lineTo(0, 120); c.lineTo(34, 64); c.closePath(); c.fillStyle = MMC.cap; c.fill();
    c.beginPath(); c.moveTo(-40, 64); c.lineTo(-6, 150); c.lineTo(-30, 230); c.lineTo(-70, 90); c.closePath(); c.fillStyle = MMC.coatSh; c.fill();
    c.beginPath(); c.moveTo(40, 64); c.lineTo(6, 150); c.lineTo(30, 230); c.lineTo(70, 90); c.closePath(); c.fillStyle = MMC.coatSh; c.fill();
    // the neck and the head
    rrect(c, -20, 30, 40, 44, 12); c.fillStyle = '#9A6244'; c.fill();
    c.beginPath(); c.ellipse(0, 0, 62, 70, 0, 0, 7); c.fillStyle = '#B97A56'; c.fill();
    for (const sd of [-1, 1]) { ellipse(c, sd * 60, 4, 12, 17, '#A86C4A'); }
    // the cap (a scrub cap with little white teeth on it)
    c.beginPath(); c.moveTo(-66, -6); c.quadraticCurveTo(-74, -78, 0, -84); c.quadraticCurveTo(74, -78, 66, -6); c.quadraticCurveTo(0, -30, -66, -6); c.closePath();
    c.fillStyle = MMC.cap; c.fill();
    c.restore();
    paint(() => {
      c.save(); c.translate(x, y); c.rotate(o.lean || 0); c.scale(s, s);
      for (let i = 0; i < 6; i++) { const tx = -44 + i * 18, ty = -50 + 8 * Math.sin(i * 1.3); ellipse(c, tx, ty, 4.5, 5.5, '#FFFFFF'); }
      line(c, -64, -10, 64, -10, 4, MMC.capSh);
      // the eyes: open, smiling (arcs) or squinting (narrow), behind round glasses
      for (const sd of [-1, 1]) {
        const ex = sd * 23, ey = -4;
        if (eyes === 'smile') { c.beginPath(); c.arc(ex, ey + 4, 9, Math.PI + 0.3, -0.3); c.lineWidth = 4.5; c.strokeStyle = '#2A1810'; c.lineCap = 'round'; c.stroke(); }
        else {
          const ry = eyes === 'squint' ? 4.5 : 10;
          ellipse(c, ex, ey, 10, ry, '#FFFFFF');
          circle(c, ex + look[0] * 3.5, ey + look[1] * 2.5, Math.min(6, ry), '#2A1810');
          if (eyes === 'squint') line(c, ex - 11, ey - 3, ex + 11, ey - 3, 3, '#7A4A32');
        }
        // the brow (the far one lifts when suspicious: brow > 0)
        const by = -22 - (sd > 0 ? br * 8 : -br * 2);
        line(c, ex - 11, by + (sd > 0 ? -br * 2 : 0), ex + 11, by - (sd > 0 ? br * 3 : 0), 5, '#3A2418');
        // the glasses
        c.beginPath(); c.arc(ex, ey, 17, 0, 7); c.lineWidth = 4; c.strokeStyle = '#2A2A3A'; c.stroke();
      }
      line(c, -6, -4, 6, -4, 3.5, '#2A2A3A');
      // the mask: over the nose and mouth, with pleats and ear loops
      c.beginPath(); c.moveTo(-50, 12); c.quadraticCurveTo(0, 2, 50, 12); c.lineTo(46, 52); c.quadraticCurveTo(0, 74, -46, 52); c.closePath();
      c.fillStyle = MMC.mask; c.fill();
      for (let i = 0; i < 3; i++) line(c, -42, 24 + i * 11, 42, 24 + i * 11, 2, rgba(MMC.maskSh, 0.8));
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 50, 14); c.quadraticCurveTo(sd * 66, 10, sd * 60, 0); c.lineWidth = 2.5; c.strokeStyle = '#FFFFFF'; c.stroke(); }
      // the badge on the coat
      rrect(c, 40, 150, 56, 22, 5); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 2; c.strokeStyle = MMC.trim; c.stroke();
      line(c, 48, 161, 88, 161, 3, MMC.trim);
      c.restore();
    });
  });
}
