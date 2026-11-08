// kl_world.js — the knuckle-lock Short's world: the inside of his tent at night (a lantern, fairy lights, a torch whose beam
// makes a stage on the back wall), his hand as a duck (one-finger's 3D hand rig, fist3d.js, with bent-wrist-fist's forearm,
// bwhand.js) whose SHADOW plays on the wall (a shadow duck with an eye of its own), the seatbelt that buckles across his
// knuckles, one knuckle in close-up (the bone's bump, the side strap that goes slack and tight), and the white cast of
// "duck mode". Everything in world coordinates (1080x1920 at zoom 1) unless it says screen space.
'use strict';

// ---------------------------------------------------------------- the place
const KL = { HX: 360, GY: 1300, HS: 0.95, PX: 23, BEAM: [600, 640], BEAMR: [300, 250] };
const KLPAL = Object.assign({}, PAL, { shortSleeve: true });
const KLC = {
  wallTop: '#0C3442', wallMid: '#1D737A', wallLow: '#14505C', side: '#0A2C38', sideDk: '#071E28', seam: '#08232C',
  ridge: '#061820', pole: '#3C2A24', mesh: '#1B2340', meshLine: '#3A4672', bag: '#E8603A', bagDk: '#A83A1E', bagHi: '#FFB08A',
  pack: '#7B61D6', packDk: '#4E3A9E', floor: '#4A3A5E', floorDk: '#2E2440', shadow: '#2A0F08',
  belt: '#5B6A86', beltDk: '#36405A', beltHi: '#8C9BB8', steel: '#C9D0DC', steelDk: '#59617A', red: '#E8384A',
  bone: '#F6EAD6', boneDk: '#C7B08E', cart: '#BFE6F2', strap: '#FFD447', strapDk: '#9A6A10', glassIn: '#7A3A66',
  cast: '#FBFBF6', castDk: '#D9DAD2', castLine: '#C9CBC2',
};

// world-space wall and floor; drawn every frame so it stays sharp at any zoom. o: {dy: the far camera's height offset (a low
// angle lifts the horizon), beam: 0..1 (the torch's stage on the wall), t}
function klTent(cam, t, o = {}) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#120812'; ctx.fillRect(0, 0, W, H);
  const P = 0.88;                                     // the wall is a little behind him: it moves a little less
  const cw = { x: cam.x, y: cam.y + (o.dy || 0) / Math.max(1, cam.zoom), zoom: cam.zoom * P, rot: cam.rot || 0, sx: cam.sx, sy: cam.sy };
  applyCam(cw);
  const X0 = -500, X1 = 1600, Y0 = -200, Y1 = 1700, FY = 1290;
  // the back wall: warm nylon lit from inside
  let g = ctx.createLinearGradient(0, 120, 0, FY);
  g.addColorStop(0, KLC.wallTop); g.addColorStop(0.45, KLC.wallMid); g.addColorStop(1, KLC.wallLow);
  ctx.fillStyle = g; ctx.fillRect(X0, Y0, X1 - X0, FY - Y0);
  // the side walls slope in at both edges
  ctx.fillStyle = KLC.side;
  ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(60, 140); ctx.lineTo(60, FY); ctx.lineTo(X0, FY + 220); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(X1, Y0); ctx.lineTo(1020, 140); ctx.lineTo(1020, FY); ctx.lineTo(X1, FY + 220); ctx.closePath(); ctx.fill();
  // the ridge and its pole
  ctx.fillStyle = KLC.ridge; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.lineTo(X1, 60); ctx.quadraticCurveTo(540, 210, X0, 60); ctx.closePath(); ctx.fill();
  line(ctx, X0, 92, X1, 92, 16, KLC.pole);
  // panel seams
  paint(() => {
    ctx.lineWidth = 5; ctx.strokeStyle = rgba(KLC.seam, 0.55);
    for (const x of [60, 1020]) { ctx.beginPath(); ctx.moveTo(x, 140); ctx.lineTo(x, FY); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(60, 980); ctx.quadraticCurveTo(540, 1010, 1020, 980); ctx.stroke();
    // stitching along the seams
    ctx.setLineDash([10, 12]); ctx.lineWidth = 2; ctx.strokeStyle = rgba('#FFD9A8', 0.35);
    for (const x of [74, 1006]) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, FY); ctx.stroke(); }
    ctx.setLineDash([]);
  });
  // a mesh window high on the left wall: the night and the rain outside
  ctx.fillStyle = KLC.mesh; rrect(ctx, -330, 240, 300, 250, 60); ctx.fill();
  paint(() => {
    ctx.save(); rrect(ctx, -330, 240, 300, 250, 60); ctx.clip();
    for (let i = 0; i < 7; i++) { const sx = -330 + 50 * i + ((t * 0) % 1); circle(ctx, sx + 30 * hash(i * 3.3), 270 + 180 * hash(i * 7.1), 2.5, rgba('#DCE6FF', 0.55)); }
    ctx.strokeStyle = rgba('#9FB6FF', 0.35); ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const u = ((t * loopW(3.1) / (Math.PI * 2) * 0.9 + hash(i * 1.7)) % 1), x = -320 + 290 * hash(i * 5.9), y = 240 + 250 * u;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 26); ctx.stroke();
    }
    ctx.strokeStyle = KLC.meshLine; ctx.lineWidth = 2;
    for (let x = -330; x < -30; x += 16) { ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x, 490); ctx.stroke(); }
    for (let y = 240; y < 490; y += 16) { ctx.beginPath(); ctx.moveTo(-330, y); ctx.lineTo(-30, y); ctx.stroke(); }
    ctx.restore();
    ctx.lineWidth = 8; ctx.strokeStyle = KLC.seam; rrect(ctx, -330, 240, 300, 250, 60); ctx.stroke();
  });
  // the door on the right wall: a zip in an arch, its pull
  paint(() => {
    ctx.lineWidth = 7; ctx.strokeStyle = rgba('#3A1408', 0.7);
    ctx.beginPath(); ctx.moveTo(1100, FY); ctx.lineTo(1100, 620); ctx.quadraticCurveTo(1290, 380, 1480, 620); ctx.lineTo(1480, FY); ctx.stroke();
    ctx.setLineDash([6, 6]); ctx.lineWidth = 4; ctx.strokeStyle = rgba('#FFE2B0', 0.5);
    ctx.beginPath(); ctx.moveTo(1112, FY); ctx.lineTo(1112, 626); ctx.quadraticCurveTo(1290, 400, 1468, 626); ctx.lineTo(1468, FY); ctx.stroke();
    ctx.setLineDash([]);
  });
  ctx.fillStyle = '#C9C2B8'; rrect(ctx, 1092, 760, 18, 52, 6); ctx.fill();
  // a mesh pocket on the right wall with a map sticking out, and a cord with two socks drying
  ctx.fillStyle = '#5A2010'; rrect(ctx, 860, 1040, 140, 120, 18); ctx.fill();
  ctx.fillStyle = '#F2E6C8'; ctx.save(); ctx.translate(905, 1030); ctx.rotate(-0.12); ctx.fillRect(-26, -40, 56, 60); ctx.restore();
  paint(() => { ctx.strokeStyle = rgba('#3A1408', 0.6); ctx.lineWidth = 2; for (let x = 866; x < 1000; x += 14) { ctx.beginPath(); ctx.moveTo(x, 1046); ctx.lineTo(x, 1156); ctx.stroke(); } });
  const sway = 0.06 * Math.sin(t * loopW(1.3));
  paint(() => { ctx.strokeStyle = '#3A2A20'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-200, 330); ctx.quadraticCurveTo(-60, 380, 70, 340); ctx.stroke(); });
  for (const [x, col, ph] of [[-150, '#3E7BE0', 0], [-40, '#F2C230', 1.7]]) {
    ctx.save(); ctx.translate(x, 352 - (x + 150) * 0.05); ctx.rotate(sway * Math.sin(t + ph) * 2);
    ctx.fillStyle = col; rrect(ctx, -16, 0, 32, 70, 10); ctx.fill(); ctx.beginPath(); ctx.ellipse(-2, 74, 28, 16, 0, 0, 7); ctx.fill();
    paint(() => { ctx.fillStyle = rgba('#FFFFFF', 0.85); ctx.fillRect(-16, 12, 32, 7); ctx.fillRect(-16, 26, 32, 7); });
    ctx.restore();
  }
  // the floor
  g = ctx.createLinearGradient(0, FY, 0, FY + 400);
  g.addColorStop(0, KLC.floor); g.addColorStop(1, KLC.floorDk);
  ctx.fillStyle = g; ctx.fillRect(X0, FY, X1 - X0, Y1 - FY);
  // the torch's stage on the back wall: a warm white oval, and its soft edge
  const bk = o.beam === undefined ? 1 : o.beam;
  if (bk > 0.01) {
    paint(() => {
      const [bx, by] = KL.BEAM, [rx, ry] = KL.BEAMR;
      ctx.save(); ctx.translate(bx, by); ctx.scale(1, ry / rx);
      const gb = ctx.createRadialGradient(0, 0, rx * 0.2, 0, 0, rx);
      gb.addColorStop(0, rgba('#FFEFD0', 0.95 * bk)); gb.addColorStop(0.78, rgba('#FFE1A8', 0.9 * bk)); gb.addColorStop(0.93, rgba('#F5B870', 0.45 * bk)); gb.addColorStop(1, rgba('#E89A50', 0));
      ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill();
      ctx.restore();
    });
    gctx.save(); camTransform(gctx, cw, 0.5); softDot(gctx, KL.BEAM[0], KL.BEAM[1], KL.BEAMR[0] * 0.9, '#FFD9A0', 0.05 * bk); gctx.restore();
  }
  // the fairy lights along the top of the wall: bulbs in the glow layer, twinkling on loop-safe clocks
  const bulb = (u) => [lerp(80, 1000, u), lerp(250, 230, u) + 70 * 4 * u * (1 - u)];
  paint(() => { ctx.strokeStyle = '#2E1A12'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 30; i++) { const q = bulb(i / 30); ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1]); } ctx.stroke(); });
  const cols = ['#FFD447', '#FF7AA2', '#7FE9FF', '#9DFF8A', '#FFB45A'];
  gctx.save(); camTransform(gctx, cw, 0.5);
  for (let i = 0; i < 14; i++) {
    const q = bulb((i + 0.5) / 14), col = cols[i % 5], tw = 0.75 + 0.25 * Math.sin(t * loopW(1.6 + 0.3 * (i % 3)) + i * 1.9);
    ctx.save(); paint(() => { circle(ctx, q[0], q[1] + 12, 11, col); circle(ctx, q[0] - 3, q[1] + 8, 4, rgba('#FFFFFF', 0.8)); }); ctx.restore();
    softDot(gctx, q[0], q[1] + 12, 30, col, 0.42 * tw);
  }
  gctx.restore();
  return cw;
}

// the lantern hanging from the ridge, upper left (world), swaying a little; its moth circling
function klLantern(cam, t, k = 1) {
  const sw = 0.05 * Math.sin(t * loopW(1.1)), px = 150, py = 92, L = 380;
  const lx = px + Math.sin(sw) * L, ly = py + Math.cos(sw) * L;
  line(ctx, px, py, lx, ly - 40, 4, '#2A1C14');
  ctx.save(); ctx.translate(lx, ly); ctx.rotate(-sw);
  ctx.fillStyle = '#3A2A20'; rrect(ctx, -44, -46, 88, 18, 8); ctx.fill(); rrect(ctx, -48, 64, 96, 20, 8); ctx.fill();
  ctx.fillStyle = '#FFE9A8'; rrect(ctx, -36, -30, 72, 96, 16); ctx.fill();
  paint(() => { ctx.strokeStyle = '#3A2A20'; ctx.lineWidth = 5; for (const x of [-36, 0, 36]) { ctx.beginPath(); ctx.moveTo(x, -30); ctx.lineTo(x, 66); ctx.stroke(); } circle(ctx, 0, 18, 15, '#FFFFFF'); });
  ctx.restore();
  gctx.save(); camTransform(gctx, cam, 0.5); softDot(gctx, lx, ly + 18, 150, '#FFB24A', 0.45 * k); softDot(gctx, lx, ly + 18, 60, '#FFF0C0', 0.75 * k); gctx.restore();
  // the moth: two flapping wings on a loop-safe orbit round the lantern
  const a = t * loopW(2.2), mx = lx + 120 * Math.cos(a), my = ly + 10 + 60 * Math.sin(a * 2), fl = Math.abs(Math.sin(t * loopW(40)));
  paint(() => {
    ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.cos(a) * 0.4);
    ctx.fillStyle = '#C9B48A';
    ctx.beginPath(); ctx.ellipse(-12, -4, 16, 9 + 6 * fl, -0.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -4, 16, 9 + 6 * fl, 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#5A4630'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 11, 0, 0, 7); ctx.fill();
    ctx.restore();
  });
  return [lx, ly];
}

// his sleeping bag over his legs, and his backpack; drawn after him (in front)
function klBag(t) {
  ctx.fillStyle = KLC.bagDk; rrect(ctx, 120, 1080, 520, 520, 120); ctx.fill();
  ctx.fillStyle = KLC.bag; rrect(ctx, 132, 1092, 496, 500, 110); ctx.fill();
  paint(() => {
    ctx.strokeStyle = rgba(KLC.bagDk, 0.8); ctx.lineWidth = 6;
    for (let y = 1170; y < 1560; y += 78) { ctx.beginPath(); ctx.moveTo(146, y); ctx.quadraticCurveTo(380, y + 18, 614, y); ctx.stroke(); }
    ctx.strokeStyle = rgba(KLC.bagHi, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(600, 1110); ctx.lineTo(604, 1580); ctx.stroke();
    ctx.fillStyle = '#E8E2D0'; rrect(ctx, 590, 1180, 22, 40, 6); ctx.fill();
  });
  // the backpack leaning on the right wall, a mug beside it
  ctx.fillStyle = KLC.packDk; rrect(ctx, 760, 1050, 230, 300, 60); ctx.fill();
  ctx.fillStyle = KLC.pack; rrect(ctx, 772, 1062, 206, 276, 54); ctx.fill();
  ctx.fillStyle = KLC.packDk; rrect(ctx, 800, 1170, 150, 110, 30); ctx.fill();
  paint(() => { ctx.fillStyle = '#FFD447'; rrect(ctx, 860, 1186, 30, 12, 5); ctx.fill(); });
  ctx.fillStyle = '#3FB8A8'; rrect(ctx, 690, 1240, 62, 74, 12); ctx.fill();
  paint(() => { ctx.strokeStyle = '#3FB8A8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(754, 1276, 18, -1.2, 1.2); ctx.stroke(); });
  softDot(gctx, 721, 1226, 30, '#FFFFFF', 0.12 * (0.6 + 0.4 * Math.sin(t * loopW(2)))); // steam glint
}

// ---------------------------------------------------------------- the hand as a duck
// fingers bend at the big knuckle (mcp 0 straight .. 1 = 90 degrees), the two outer joints curl a little (ip 0..1), the
// fingers fan out (spread 0..1: only works with the knuckles straight), try (0..1: the sideways push of a bent finger, which
// hardly moves it), tremble; thumb 0 = the duck's lower beak (its tip on the fingers' pads) .. 1 = out to the side (flat)
const KL_SPREAD = { I: -0.34, M: -0.09, R: 0.14, L: 0.40 };
function klGeo(A = {}) {
  const t = A.t || 0, G = { f: {} }, mcp = A.mcp === undefined ? 1 : A.mcp, ip = A.ip || 0, sp = A.spread || 0, tr = A.tremble || 0;
  for (const k of FK_ORD) {
    const F = FK_F[k];
    const shk = tr * (0.035 * vnoise(t * 31 + F.x * 3, 3) + 0.02 * vnoise(t * 57, 7));
    const b0 = 1.55 * mcp + shk, b1 = 0.22 * ip + shk * 0.5, b2 = 0.16 * ip;
    const lean = F.lean * 0.5 * (1 - mcp) + sp * KL_SPREAD[k] * (1 - 0.85 * mcp);
    const side = (A.try || 0) * KL_SPREAD[k] * 0.12 + tr * 0.02 * vnoise(t * 43 + F.x, 11);   // what a bent finger manages sideways
    const r = F.r, rad = [r, r * 0.93, r * 0.85, r * 0.74];
    const pts = [[F.x, F.y, 0]], dirs = [];
    let th = 0, p = pts[0];
    for (let i = 0; i < 3; i++) {
      th += [b0, b1, b2][i];
      let d = [-Math.sin(lean) * Math.cos(th) - Math.sin(side) * Math.sin(th), Math.cos(lean) * Math.cos(th), Math.cos(side) * Math.sin(th)];
      const n = Math.hypot(d[0], d[1], d[2]); d = d.map((v) => v / n);
      dirs.push({ d, th });
      p = [p[0] + d[0] * F.len[i], p[1] + d[1] * F.len[i], p[2] + d[2] * F.len[i]];
      pts.push(p);
    }
    G.f[k] = { pts, rad, dirs, lift: 1 - mcp };
  }
  // the thumb: the duck's lower beak (under the index and middle fingers' pads) .. out in the palm's plane
  const th = clamp(A.thumb || 0), open = A.open || 0;
  const duck = [[2.85, 2.2, 0.7], [3.6, 5.6, 2.2], [3.0, 7.3, 4.6], [2.3, 7.95, 7.0]];
  const duckO = [[2.85, 2.2, 0.7], [4.4, 4.3, 3.0], [4.1, 5.6, 5.4], [3.5, 5.9, 7.6]];   // the beak open (a quack)
  const flat = [[2.85, 2.2, 0.7], [4.9, 4.3, 0.9], [6.5, 5.9, 0.8], [7.7, 7.5, 0.6]];
  G.thumb = { pts: duck.map((p, i) => p.map((v, j) => lerp(lerp(v, duckO[i][j], open), flat[i][j], E.inOutSine(th)))), rad: [1.3, 1.08, 0.97, 0.8] };
  return G;
}

// ---------------------------------------------------------------- the shadow on the wall
// the hand drawn again in one colour on its own canvas, from the torch's side: the same view as ours, bigger and higher (the
// torch is low and in front), then laid on the wall inside the beam. V2: the shadow's camera; o: {eye: {...}, a, cast}
const klShC = mkCanvas(W, H), klShX = klShC.getContext('2d');
function klShadowDraw(P2s, G, o = {}) {
  const x = klShX;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, W, H);
  const col = '#2A1E1A';
  x.fillStyle = col; fkSmooth(x, bwArmOutline(P2s.pa, 0)); x.fill();
  fkSmooth(x, bwJointOutline(P2s)); x.fill();
  fkSmooth(x, fkHull(fkPalmPts().map(P2s.ph).map((q) => [q[0], q[1]]))); x.fill();
  const T = G.thumb, Tp = T.pts.map(P2s.ph);
  for (let i = 0; i < 3; i++) fkCap(x, Tp[i], Tp[i + 1], T.rad[i] * Tp[i][2], T.rad[i + 1] * Tp[i + 1][2], col);
  for (const kk of FK_ORD) {
    const F = G.f[kk], Pp = F.pts.map(P2s.ph);
    for (let i = 0; i < 3; i++) fkCap(x, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2] * (o.fat || 1), F.rad[i + 1] * Pp[i + 1][2] * (o.fat || 1), col);
  }
  if (o.cast) {   // the cast makes the shadow fatter round the hand and wrist
    const q = P2s.ph([0.3, 3.5, 0.4]); x.beginPath(); x.arc(q[0], q[1], q[2] * 5.3, 0, 7); x.fill();
  }
  // only inside the beam: mask with its oval
  x.globalCompositeOperation = 'destination-in';
  x.setTransform(1, 0, 0, 1, 0, 0);
  const B = o.beamS;
  if (B) {
    x.save(); x.translate(B[0], B[1]); x.scale(1, B[3] / B[2]);
    const gb = x.createRadialGradient(0, 0, B[2] * 0.55, 0, 0, B[2] * 1.05);
    gb.addColorStop(0, 'rgba(0,0,0,1)'); gb.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gb; x.fillRect(-B[2] * 1.2, -B[2] * 1.2, B[2] * 2.4, B[2] * 2.4);
    x.restore();
  }
  x.globalCompositeOperation = 'source-over';
  // onto the wall, a little soft
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.a === undefined ? 0.8 : o.a; ctx.filter = 'blur(2px)';
    ctx.drawImage(klShC, 0, 0); ctx.filter = 'none'; ctx.restore();
  });
}
// the shadow duck's eye (a hole of light in the shadow, as in a real shadow puppet), screen space. e: {x, y, r, mood:
// 'calm' | 'strain' | 'annoyed' | 'shock' | 'happy', look: [dx, dy], blink, k, bandage}
function klDuckEye(e) {
  const k = clamp(e.k === undefined ? 1 : e.k);
  if (k <= 0.01) return;
  const r = e.r * E.outBack(k, 2), m = e.mood || 'calm', lk = e.look || [0, 0];
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(e.x, e.y);
    if (m === 'happy') {
      ctx.lineWidth = r * 0.36; ctx.lineCap = 'round'; ctx.strokeStyle = '#FFF2D0';
      ctx.beginPath(); ctx.arc(0, r * 0.25, r * 0.75, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    } else {
      const sq = m === 'strain' ? 0.45 : m === 'annoyed' ? 0.55 : m === 'shock' ? 1.15 : 0.85;
      const open = sq * (1 - clamp(e.blink || 0));
      ctx.fillStyle = '#FFF2D0'; ctx.beginPath(); ctx.ellipse(0, 0, r, Math.max(1.5, r * open), 0, 0, 7); ctx.fill();
      if (open > 0.15) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, r, r * open, 0, 0, 7); ctx.clip();
        const pr = m === 'shock' ? 0.36 : 0.5;
        circle(ctx, lk[0] * r * 0.4, lk[1] * r * 0.3, r * pr, '#1A0A06');
        circle(ctx, lk[0] * r * 0.4 - r * 0.15, lk[1] * r * 0.3 - r * 0.18, r * 0.13, '#FFFFFF');
        ctx.restore();
      }
      // a lid line for strain / annoyed
      if (m === 'strain' || m === 'annoyed') {
        ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; ctx.strokeStyle = '#1A0A06';
        ctx.beginPath(); ctx.moveTo(-r * 1.1, -r * open * (m === 'annoyed' ? 0.9 : 1.2)); ctx.lineTo(r * 1.1, -r * open * (m === 'annoyed' ? 0.9 : 0.5)); ctx.stroke();
      }
      if (m === 'strain') {   // sweat on the shadow duck's head
        ctx.fillStyle = '#9FE3FF'; ctx.beginPath(); ctx.moveTo(r * 1.6, -r * 1.6); ctx.quadraticCurveTo(r * 2.1, -r * 0.8, r * 1.6, -r * 0.6); ctx.quadraticCurveTo(r * 1.1, -r * 0.8, r * 1.6, -r * 1.6); ctx.fill();
      }
    }
    if (e.bandage > 0.01) {   // a sticking plaster across the shadow duck's head
      const b = E.outBack(clamp(e.bandage), 2);
      ctx.save(); ctx.translate(r * 1.8, -r * 1.7); ctx.rotate(0.6); ctx.scale(b, b);
      ctx.fillStyle = '#F2D2B0'; rrect(ctx, -r * 1.5, -r * 0.42, r * 3, r * 0.84, r * 0.4); ctx.fill();
      ctx.fillStyle = '#E2B894'; ctx.fillRect(-r * 0.4, -r * 0.42, r * 0.8, r * 0.84);
      ctx.restore();
      ctx.save(); ctx.translate(r * 1.8, -r * 1.7); ctx.rotate(-0.6); ctx.scale(b, b);
      ctx.fillStyle = '#F2D2B0'; rrect(ctx, -r * 1.5, -r * 0.42, r * 3, r * 0.84, r * 0.4); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- the seatbelt across his knuckles
// a strap of webbing over the backs of the four big knuckles, from a steel tongue past the index to a buckle past the little
// finger. k 0..1: it slides across from the index side; click 0..1: the buckle's flash; o.retract: it zips back (0..1)
function klBeltPts(P2, G) {
  const pts = [];
  const I = fkSegPt(G, 'I', 0, 0.06, 'back', 1.35), L = fkSegPt(G, 'L', 0, 0.06, 'back', 1.35);
  const dir = [I[0] - L[0], I[1] - L[1], I[2] - L[2]], dl = Math.hypot(...dir), u = dir.map((v) => v / dl);
  pts.push([I[0] + u[0] * 1.9, I[1] + u[1] * 1.9, I[2] + u[2] * 1.9]);
  for (const k of FK_ORD) pts.push(fkSegPt(G, k, 0, 0.06, 'back', 1.35));
  pts.push([L[0] - u[0] * 1.7, L[1] - u[1] * 1.7, L[2] - u[2] * 1.7]);
  return pts.map(P2.ph);
}
function klBelt(P2, G, k, o = {}) {
  k = clamp(k);
  if (k <= 0.01) return [];
  const Q = klBeltPts(P2, G), P = Q.map((q) => [q[0], q[1]]), acc = polyLen(P), Lt = acc[acc.length - 1];
  const zf = Math.min(...Q.map((q) => q[3])) - 1.2, w = Math.max(10, Q[2][2] * 1.5);
  return [{ z: zf, fn: () => {
    // from the buckle end (the little finger's side) the strap reaches out toward the index by k
    const n = 24, run = [];
    for (let i = 0; i <= n; i++) { const s = Lt - (i / n) * Lt * k; run.push(polyAt(P, acc, s)); }
    poly(ctx, run, w * 1.24, KLC.beltDk); poly(ctx, run, w, KLC.belt);
    paint(() => {
      ctx.save(); ctx.setLineDash([w * 0.3, w * 0.22]); poly(ctx, run, 3, rgba(KLC.beltHi, 0.9)); ctx.restore();
    });
    // the buckle (red button) past the little finger, the steel tongue at the strap's moving end
    const b = polyAt(P, acc, Lt), b2 = polyAt(P, acc, Lt * 0.86), an = Math.atan2(b[1] - b2[1], b[0] - b2[0]);
    ctx.save(); ctx.translate(b[0], b[1]); ctx.rotate(an);
    ctx.fillStyle = '#20242E'; rrect(ctx, -w * 0.4, -w * 0.95, w * 2.0, w * 1.9, w * 0.4); ctx.fill();
    paint(() => { ctx.fillStyle = KLC.red; rrect(ctx, w * 0.25, -w * 0.45, w * 0.9, w * 0.9, w * 0.2); ctx.fill(); });
    ctx.restore();
    const e = run[run.length - 1], e2 = run[Math.max(0, run.length - 3)], an2 = Math.atan2(e[1] - e2[1], e[0] - e2[0]);
    ctx.save(); ctx.translate(e[0], e[1]); ctx.rotate(an2);
    ctx.fillStyle = KLC.steelDk; rrect(ctx, -w * 0.2, -w * 0.72, w * 1.2, w * 1.44, w * 0.25); ctx.fill();
    ctx.fillStyle = KLC.steel; rrect(ctx, -w * 0.08, -w * 0.58, w * 0.95, w * 1.16, w * 0.2); ctx.fill();
    paint(() => { ctx.fillStyle = KLC.steelDk; rrect(ctx, w * 0.3, -w * 0.2, w * 0.4, w * 0.4, w * 0.1); ctx.fill(); });
    ctx.restore();
    if ((o.click || 0) > 0.01) { softDot(gctx, b[0], b[1], w * 3, '#FFFFFF', 0.5 * o.click); }
  } }];
}

// ---------------------------------------------------------------- one knuckle up close (screen space, in a round window)
// side view, fingers to the right, the back of the hand up. The bone end of the hand (the head) is an egg that bulges toward
// the palm (down); the finger's first bone swings round it by phi (0 straight .. ~1.5 bent); the near side strap runs from a
// pin on top of the head to a pin on the finger bone's palm side: slack (waves) when straight, stretched tight when bent.
// o: {k (the window open 0..1), phi, bump (0..1: the bump glows), twang (0..1: the strap rings), taut (0..1 forced),
//     R (px, the head's radius), far (0..1: the far strap shows behind), label, t}
function klKnuckle(cx, cy, R, o = {}) {
  const phi = o.phi || 0, t = o.t || 0;
  // the window's own opaque disc first (outside any clip), so the light sees one flat thing
  const WR = R * 3.3 * E.outBack(clamp(o.k === undefined ? 1 : o.k), 1.6);
  if (WR < 2) return null;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = KLC.glassIn; ctx.beginPath(); ctx.arc(cx, cy, WR, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, WR, 0, 7); ctx.clip();
  let g = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, WR);
  g.addColorStop(0, '#B35C8E'); g.addColorStop(1, '#5A2450');
  ctx.fillStyle = g; ctx.fillRect(cx - WR, cy - WR, WR * 2, WR * 2);
  // the skin's outline of the finger and the hand round the bones (soft)
  const rot = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  const at = (p) => [cx + p[0] * R, cy + p[1] * R];
  ctx.fillStyle = rgba('#E89AC0', 0.35);
  ctx.beginPath(); ctx.moveTo(...at([-4, -1.45])); ctx.lineTo(...at([0, -1.4]));
  const fA = [[0.2, -1.42], [4.2, -1.15], [4.2, 1.15], [0.2, 1.55]].map((p) => rot(p, phi));
  ctx.lineTo(...at(fA[0])); ctx.lineTo(...at(fA[1])); ctx.lineTo(...at(fA[2])); ctx.lineTo(...at(fA[3]));
  ctx.lineTo(...at([-0.4, 1.7])); ctx.lineTo(...at([-4, 1.5])); ctx.closePath(); ctx.fill();
  // the far strap (behind the bones)
  const A = [-0.08, -0.62], B0 = [1.32, 0.42];
  const strapPath = (A2, B2, slack, off) => {
    const a = at([A2[0] + off[0], A2[1] + off[1]]), b = at([B2[0] + off[0], B2[1] + off[1]]);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, P = [];
    for (let i = 0; i <= 28; i++) {
      const u = i / 28, wv = slack * R * 0.32 * Math.sin(u * Math.PI) * Math.sin(u * Math.PI * 3 + 0.6) + (o.twang || 0) * R * 0.06 * Math.sin(u * Math.PI) * Math.sin(t * 90);
      P.push([lerp(a[0], b[0], u) + nx * wv, lerp(a[1], b[1], u) + ny * wv]);
    }
    return P;
  };
  // how long the strap must be (taut at a bent knuckle): with the finger straight the pins are closer -> it waves
  const B = rot(B0, phi), dNow = Math.hypot(B[0] - A[0], B[1] - A[1]), Bb = rot(B0, 1.45), dMax = Math.hypot(Bb[0] - A[0], Bb[1] - A[1]);
  const slack = Math.max(0, 1 - (o.taut || 0)) * clamp((dMax - dNow) / (dMax * 0.16));
  const tight = 1 - slack;
  if ((o.far || 0) > 0.01) poly(ctx, strapPath(A, B, slack, [0.22, -0.12]), R * 0.34, rgba('#B88A2A', 0.75 * o.far));
  // the hand's bone (the metacarpal), its egg-shaped head (the bump on the palm side), its cap of cartilage
  const bone = (fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.moveTo(...at([-4.2, -0.62])); ctx.lineTo(...at([-0.6, -0.72]));
    ctx.bezierCurveTo(...at([0.3, -1.12]), ...at([1.15, -0.55]), ...at([1.08, 0.12]));
    ctx.bezierCurveTo(...at([1.02, 0.95]), ...at([0.25, 1.42]), ...at([-0.45, 1.05]));   // the bump: wider toward the palm
    ctx.lineTo(...at([-4.2, 0.62])); ctx.closePath(); ctx.fill();
  };
  ctx.save(); ctx.translate(R * 0.06, R * 0.06); bone(KLC.boneDk); ctx.restore();
  bone(KLC.bone);
  // the bump lights up when it is named
  if ((o.bump || 0) > 0.01) {
    const b = at([0.55, 0.85]);
    ctx.fillStyle = rgba('#FF9A3C', 0.55 * o.bump); ctx.beginPath(); ctx.ellipse(b[0], b[1], R * 0.62, R * 0.42, 0.5, 0, 7); ctx.fill();
  }
  ctx.lineWidth = R * 0.12; ctx.strokeStyle = rgba(KLC.cart, 0.95); ctx.lineCap = 'round';
  ctx.beginPath(); for (let i = 0; i <= 16; i++) { const a = -1.0 + (i / 16) * 2.2; const p = at([0.12 + 0.98 * Math.cos(a), 0.22 + 1.05 * Math.sin(a)]); ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); } ctx.stroke();
  // the finger's first bone, swung by phi round the head: a cup at its base
  const fb = [[1.18, -0.78], [4.4, -0.5], [4.4, 0.5], [1.18, 0.86]].map((p) => rot(p, phi));
  const cup = [[1.05, -0.9], [1.4, 0], [1.05, 0.95]].map((p) => rot(p, phi));
  const fing = (fill, d) => {
    ctx.fillStyle = fill; ctx.beginPath();
    const P = (p) => at([p[0] + d, p[1] + d]);
    ctx.moveTo(...P(cup[0])); ctx.lineTo(...P(fb[0])); ctx.lineTo(...P(fb[1])); ctx.lineTo(...P(fb[2])); ctx.lineTo(...P(fb[3])); ctx.lineTo(...P(cup[2]));
    ctx.quadraticCurveTo(...P(cup[1]), ...P(cup[0])); ctx.closePath(); ctx.fill();
  };
  fing(KLC.boneDk, 0.06); fing(KLC.bone, 0);
  // the near strap, on top: the yellow webbing of a seatbelt, its pins
  const S = strapPath(A, B, slack, [0, 0]), sw = R * 0.42;
  poly(ctx, S, sw * 1.3, rgba(KLC.strapDk, 0.95)); poly(ctx, S, sw, mixH('#F0C040', '#FFE680', tight));
  ctx.save(); ctx.setLineDash([sw * 0.35, sw * 0.25]); poly(ctx, S, 3, rgba('#7A5208', 0.8)); ctx.restore();
  for (const p of [S[0], S[S.length - 1]]) { circle(ctx, p[0], p[1], sw * 0.62, '#8A5C14'); circle(ctx, p[0], p[1], sw * 0.4, '#FFF2B0'); }
  ctx.restore();   // the clip
  // its rim, and the glow of a tight strap
  ctx.lineWidth = Math.max(6, R * 0.16); ctx.strokeStyle = 'rgba(255,214,236,0.9)'; ctx.beginPath(); ctx.arc(cx, cy, WR, 0, 7); ctx.stroke();
  ctx.restore();
  if (tight > 0.6 && (o.taut === undefined || o.taut > 0 || tight > 0.9)) {
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    const m = S[14]; softDot(gctx, m[0], m[1], R * 1.5, '#FFE680', 0.22 * (tight - 0.6) / 0.4 + 0.3 * (o.twang || 0)); gctx.restore();
  }
  return { S, WR, tight, A: at(A), B: at(B), bump: at([0.55, 0.85]) };
}

// ---------------------------------------------------------------- the white cast of "duck mode"
// a padded cast round the forearm, the palm and the first bones of the fingers (the tips stay out), bandage turns on it, and
// a doctor's sticker. Drawn on the scratch layer in one go and laid on opaque. k 0..1 (pops on)
function klCast(P2, G, k, t) {
  k = clamp(k);
  if (k <= 0.01) return;
  const m = ctx.getTransform(), s = E.outBack(k, 2.4);
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 1; tctx.clearRect(0, 0, W, H);
  tctx.setTransform(m);
  const c0 = P2.ph([0.2, 4.0, 0]);
  tctx.translate(c0[0], c0[1]); tctx.scale(s, s); tctx.translate(-c0[0], -c0[1]);
  const col = KLC.cast, fat = 1.18;
  // the forearm part (from the wrist to two thirds of the way down)
  const P = [];
  for (let i = 0; i <= 9; i++) for (const q of bwArmRing(0.01 + (i / 9) * 0.55, 0)) P.push(P2.pa(q.map((v, j) => j === 1 ? v : v * fat)));
  tctx.fillStyle = col; fkSmooth(tctx, fkHull(P.map((q) => [q[0], q[1]]))); tctx.fill();
  fkSmooth(tctx, fkHull(fkPalmPts().map((q) => P2.ph([q[0] * 1.12, q[1], q[2] * 1.35])).map((q) => [q[0], q[1]]))); tctx.fill();
  fkSmooth(tctx, bwJointOutline(P2)); tctx.fill();
  for (const kk of FK_ORD) {
    const F = G.f[kk], a = P2.ph(F.pts[0]), b = P2.ph(fkLerp(F.pts[1], F.pts[2], 0.7));
    fkCap(tctx, a, b, F.rad[0] * a[2] * 1.32, F.rad[1] * b[2] * 1.3, col);
  }
  const T = G.thumb, ta = P2.ph(T.pts[0]), tb = P2.ph(T.pts[2]);
  fkCap(tctx, ta, tb, T.rad[0] * ta[2] * 1.3, T.rad[2] * tb[2] * 1.25, col);
  // bandage turns and a shade on the far side, inside the cast's shape
  tctx.globalCompositeOperation = 'source-atop';
  tctx.setTransform(1, 0, 0, 1, 0, 0);
  const wq = P2.pa([0, -5, 0]), u = P2.pa([0, -14, 0]), dx = wq[0] - u[0], dy = wq[1] - u[1], dl = Math.hypot(dx, dy) || 1;
  tctx.strokeStyle = KLC.castLine; tctx.lineWidth = Math.max(3, wq[2] * 0.22);
  for (let i = -12; i <= 12; i++) {
    const ox = wq[0] + (dx / dl) * i * wq[2] * 1.7, oy = wq[1] + (dy / dl) * i * wq[2] * 1.7, nx = -dy / dl, ny = dx / dl;
    tctx.beginPath(); tctx.moveTo(ox - nx * 600 + (dx / dl) * 40, oy - ny * 600 + (dy / dl) * 40); tctx.lineTo(ox + nx * 600 - (dx / dl) * 40, oy + ny * 600 - (dy / dl) * 40); tctx.stroke();
  }
  const sh = P2.ph([-2.5, 5, -1]), gs = tctx.createRadialGradient(sh[0], sh[1], 0, sh[0], sh[1], sh[2] * 9);
  gs.addColorStop(0, 'rgba(180,184,176,0.55)'); gs.addColorStop(1, 'rgba(180,184,176,0)');
  tctx.fillStyle = gs; tctx.fillRect(0, 0, W, H);
  tctx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(tintC, 0, 0); ctx.restore();
  // the doctor's sticker: a smiley and a red cross
  const st = P2.pa([0, -6.5, 0]);
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(st[0], st[1]); ctx.scale(s, s);
    const r = st[2] * 1.6;
    circle(ctx, 0, 0, r * 1.12, '#E0A400'); circle(ctx, 0, 0, r, '#FFD447');
    circle(ctx, -r * 0.35, -r * 0.2, r * 0.13, '#3A2600'); circle(ctx, r * 0.35, -r * 0.2, r * 0.13, '#3A2600');
    ctx.lineWidth = r * 0.12; ctx.strokeStyle = '#3A2600'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.5, 0.35, Math.PI - 0.35); ctx.stroke();
    ctx.restore();
  });
}

// a pill tag with an optional leader to a point (screen space)
function klTag(txt, x, y, k, col, to, size = 46) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = E.outBack(clamp(k), 2.2);
  ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.45;
  ctx.restore();
  if (to) { screenSpace(); thinLeader([x, y + h * 0.5 * Math.sign(to[1] - y)], to, clamp(k * 1.5 - 0.3), col); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#141428'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
  // a dark patch under it in the glow layer, so nothing bright eats it
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.fillStyle = 'rgba(0,0,0,0.85)'; rrect(gctx, x - w * s / 2 - 8, y - h * s / 2 - 8, w * s + 16, h * s + 16, h * s / 2); gctx.fill();
  gctx.restore();
}
// a comic burst with a word (screen space)
function klBurst(x, y, s, k, word, col = '#4DFFB4', rot = -0.12, size = 104) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.6) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 150 : 96 + 14 * (i % 3); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.lineWidth = size * 0.1; ctx.strokeStyle = '#1A1030'; ctx.strokeText(word, 0, 6); ctx.fillText(word, 0, 6);
  ctx.restore();
}
// motion marks round a point (screen space)
function klShake(x, y, r, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const rr = r * (1 + 0.22 * i) + 6 * Math.sin(t * 40 + i);
      ctx.beginPath(); ctx.arc(x, y, rr, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5);
      ctx.lineWidth = 6 - 2 * i; ctx.strokeStyle = rgba('#FFFFFF', 0.8 * k); ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
  });
}
