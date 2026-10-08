// A night fair and its drop tower: a mast with a platform at the top, a crane arm, a rope, a lever, a scientist with a
// clipboard, and a safety net 2,600 units below. One world for the drop, the two bars, and "try something new".
'use strict';

const FAIR = { HX: 700, TOP: 1060, DROP: 2600, PLAT: 1010, SX: 318, LEV: [474, 836] };
const LABPAL = Object.assign({}, PAL, { coat: '#F2F4FA', coatSh: '#C4CAE0', coatHi: '#FFFFFF', coatDk: '#9AA2C0', hair: '#B9BFCC', hairHi: '#E4E8F2', pants: '#3A3F5C', pantsSh: '#272B44', shoe: '#2A2140', shoeSh: '#15132A', pj: true });
let FAIR_FAR = null;

function initFair() {
  // the fair far below and far away: a big wheel, tents, strings of lights (a flat plate with parallax)
  FAIR_FAR = mkCanvas(W, 1500);
  const x = FAIR_FAR.getContext('2d'), rng = mulberry32(8812);
  x.filter = 'blur(3px)';
  // the wheel
  x.strokeStyle = 'rgba(120,130,200,0.5)'; x.lineWidth = 7; x.beginPath(); x.arc(820, 760, 250, 0, 7); x.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.lineWidth = 3; x.beginPath(); x.moveTo(820, 760); x.lineTo(820 + Math.cos(a) * 250, 760 + Math.sin(a) * 250); x.stroke(); x.fillStyle = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF'][i % 4]; x.beginPath(); x.arc(820 + Math.cos(a) * 250, 760 + Math.sin(a) * 250, 15, 0, 7); x.fill(); }
  x.lineWidth = 12; x.beginPath(); x.moveTo(820, 760); x.lineTo(700, 1200); x.moveTo(820, 760); x.lineTo(940, 1200); x.stroke();
  // tents
  for (const [tx, tw, th, col] of [[130, 260, 170, '#B0527E'], [420, 220, 140, '#5A68B8'], [960, 240, 150, '#B88A3C']]) {
    x.fillStyle = col; x.globalAlpha = 0.6; x.beginPath(); x.moveTo(tx - tw / 2, 1200); x.lineTo(tx, 1200 - th); x.lineTo(tx + tw / 2, 1200); x.closePath(); x.fill(); x.globalAlpha = 1;
  }
  x.fillStyle = '#0A0818'; x.fillRect(0, 1200, W, 300);
  x.filter = 'blur(2px)';
  for (let i = 0; i < 70; i++) { const lx = rng() * W, ly = 880 + rng() * 330, r = 5 + rng() * 9; const g = x.createRadialGradient(lx, ly, 0, lx, ly, r * 2.4); g.addColorStop(0, ['rgba(255,214,150,0.95)', 'rgba(255,120,150,0.9)', 'rgba(140,220,255,0.9)'][i % 3]); g.addColorStop(1, 'rgba(255,170,90,0)'); x.fillStyle = g; x.beginPath(); x.arc(lx, ly, r * 2.4, 0, 7); x.fill(); }
  x.filter = 'none';
}
// the night behind everything: a sky, stars that barely move, and the fair, which rises into view as the camera goes down
function fairBack(cam, t, v = 0) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070A22'); g.addColorStop(0.6, '#141A44'); g.addColorStop(1, '#2A1E4E');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  paint(() => {
    for (let i = 0; i < 60; i++) {
      const sx = hash(i * 1.7) * W, sy = ((hash(i * 3.3) * 2200 - cam.y * 0.06) % 2200 + 2200) % 2200 - 140, r = 1.5 + 2.5 * hash(i * 5.1), len = Math.min(240, v * 0.012 * (0.4 + hash(i)));
      if (len > 6) line(ctx, sx, sy, sx, sy - len, r, 'rgba(220,230,255,0.5)'); else circle(ctx, sx, sy, r, `rgba(235,240,255,${0.5 + 0.4 * Math.sin(t * 2 + i)})`);
    }
  });
  // the fair: its top edge sits at the horizon, which comes up from the bottom of the frame as he falls
  const hy = lerp(1500, 720, clamp((cam.y - 700) / FAIR.DROP)) + 0;
  ctx.drawImage(FAIR_FAR, 0, hy - 330 * cam.zoom, W, 1500);
  ctx.fillStyle = '#0A0818'; ctx.fillRect(0, hy + 1160, W, 2000);
}
// the mast: two rails, cross braces, a bulb now and then (world coords, camera applied). v = how fast the camera falls (px/s)
function fairMast(cam, t, v = 0) {
  const y0 = cam.y - 1100 / cam.zoom, y1 = cam.y + 1100 / cam.zoom, fast = clamp((v - 500) / 900);
  ctx.fillStyle = '#2B3566'; ctx.fillRect(108, y0, 26, y1 - y0); ctx.fillRect(232, y0, 26, y1 - y0);
  const sp = 190, k0 = Math.floor(y0 / sp) - 1, k1 = Math.ceil(y1 / sp) + 1;
  for (let k = k0; k <= k1; k++) {
    const y = k * sp;
    if (fast < 0.98) { ctx.globalAlpha = 1 - fast; line(ctx, 121, y, 245, y + sp, 12, '#39457E'); line(ctx, 245, y, 121, y + sp, 12, '#39457E'); ctx.globalAlpha = 1; }
    ctx.fillStyle = '#39457E'; ctx.fillRect(108, y - 8, 150, 16);
    if (((k % 2) + 2) % 2 === 0) {                              // a bulb; at speed it is a streak
      const len = Math.min(420, v * 0.03);
      if (len > 14) { line(ctx, 183, y, 183, y - len, 16, 'rgba(255,196,110,0.55)'); line(gctx, 183, y, 183, y - len, 26, 'rgba(255,170,80,0.5)'); }
      else { circle(ctx, 183, y, 13, '#FFE2A0'); softDot(gctx, 183, y, 60, '#FFB860', 0.7); }
    }
  }
}
// the top of the tower: the deck, its rail, the crane arm and its pulley, the lever box. pull 0..1 = the lever
function fairTop(t, pull = 0) {
  const c = ctx, P = FAIR.PLAT;
  // the rail behind the deck
  for (let x = 96; x <= 540; x += 74) line(c, x, P - 150, x, P, 9, '#39457E');
  line(c, 80, P - 150, 556, P - 150, 12, '#4A589A');
  // the crane arm, the pulley
  line(c, 232, 250, 780, 250, 30, '#39457E'); line(c, 245, 420, 560, 262, 13, '#2B3566');
  circle(c, FAIR.HX, 268, 30, '#8A93AD'); circle(c, FAIR.HX, 268, 11, '#2A2140');
  softDot(gctx, 780, 250, 70, '#FF5A6E', 0.5 + 0.4 * Math.sin(t * 5)); circle(c, 780, 250, 12, '#FF8A96');
  // the deck
  rrect(c, 60, P, 510, 30, 8); c.fillStyle = '#4A589A'; c.fill(); c.fillStyle = '#FFD447';
  paint(() => { for (let x = 80; x < 560; x += 60) { c.beginPath(); c.moveTo(x, P); c.lineTo(x + 26, P); c.lineTo(x + 12, P + 14); c.lineTo(x - 14, P + 14); c.closePath(); c.fillStyle = '#FFD447'; c.fill(); } });
  // the lever box
  const [lx, ly] = FAIR.LEV;
  rrect(c, lx - 44, ly, 88, P - ly, 12); c.fillStyle = '#39457E'; c.fill();
  paint(() => { rrect(c, lx - 30, ly + 60, 60, 40, 8); c.fillStyle = pull > 0.5 ? '#FF5A6E' : '#4DFFB4'; c.fill(); });
  if (pull > 0.5) softDot(gctx, lx, ly + 80, 60, '#FF5A6E', 0.7);
  const a = lerp(-0.75, 0.85, pull), kx = lx + Math.sin(a) * 130, ky = ly - Math.cos(a) * 130;
  line(c, lx, ly + 6, kx, ky, 15, '#C9D0E4'); circle(c, kx, ky, 25, '#FF5A6E');
  return [kx, ky];
}
// the safety net between two poles; sag = how far its middle is pushed down
function fairNet(t, sag = 0, front = false) {
  const c = ctx, Y = FAIR.TOP + FAIR.DROP, x0 = 300, x1 = 1100, mid = FAIR.HX;
  const yAt = (x) => { const u = (x - x0) / (x1 - x0); return Y + sag * Math.pow(Math.sin(Math.PI * u), 1.4) * (1 - 0.3 * Math.abs(x - mid) / 400); };
  if (!front) {
    for (const px of [x0 - 16, x1 + 16]) { line(c, px, Y - 150, px, Y + 420, 30, '#2B3566'); circle(c, px, Y - 150, 26, '#FFD447'); softDot(gctx, px, Y - 150, 80, '#FFC060', 0.6); }
    // the far edge of the net
    c.beginPath(); for (let x = x0; x <= x1; x += 20) c[x === x0 ? 'moveTo' : 'lineTo'](x, yAt(x) - 30); c.lineWidth = 9; c.strokeStyle = '#7C88C4'; c.stroke();
    return;
  }
  // the near edge and the mesh hanging under it
  paint(() => {
    c.lineWidth = 3.5; c.strokeStyle = 'rgba(200,210,255,0.5)';
    for (let x = x0; x <= x1; x += 40) { c.beginPath(); c.moveTo(x, yAt(x) + 4); c.lineTo(x + 40, yAt(x + 40) + 112); c.moveTo(x + 40, yAt(x + 40) + 4); c.lineTo(x, yAt(x) + 112); c.stroke(); }
  });
  c.beginPath(); for (let x = x0; x <= x1; x += 20) c[x === x0 ? 'moveTo' : 'lineTo'](x, yAt(x) + 4); c.lineWidth = 15; c.lineCap = 'round'; c.strokeStyle = '#C8D0F6'; c.stroke();
}
// a safety helmet (head space)
function fairHelmet(c, col = '#FF5A3C', dk = '#C93A22') {
  c.beginPath(); c.moveTo(-74, -14); c.quadraticCurveTo(-74, -100, 0, -100); c.quadraticCurveTo(74, -100, 74, -14); c.closePath(); c.fillStyle = col; c.fill();
  rrect(c, -82, -24, 164, 16, 7); c.fillStyle = dk; c.fill();
  paint(() => { rrect(c, -10, -99, 20, 76, 6); c.fillStyle = '#FFFFFF'; c.fill(); });
}
// his harness (rig space): two straps and a belt
function fairHarness(c, r, pose) {
  c.save(); c.translate(r.P[0], r.P[1]); c.rotate(pose.lean);
  line(c, -52, -160, 34, -34, 15, '#2A2140'); line(c, 52, -160, -34, -34, 15, '#2A2140');
  rrect(c, -80, -44, 160, 24, 8); c.fillStyle = '#2A2140'; c.fill();
  paint(() => { rrect(c, -15, -47, 30, 30, 6); c.fillStyle = '#FFD447'; c.fill(); });
  c.restore();
}
// the scientist on the deck: a white coat, grey hair, glasses, a clipboard; one hand on the lever
function fairScientist(t, knob, pull) {
  let p = clone(POSES.stand);
  p.lean = 0.03 + 0.05 * pull;
  const st = { x: FAIR.SX, y: FAIR.PLAT, s: 0.95, pose: p, face: Object.assign({}, pull > 0.3 ? FACES.grin : FACES.calm, { lookX: 0.9, lookY: 0.1 }), headRot: 0.04 };
  p = ikReach(p, 'R', ikLocal(st, knob[0] - 4, knob[1] + 4), -1);
  p = ikReach(p, 'L', [-96, p.hipY - 96], 1);
  st.pose = p;
  const r = drawCharacter(ctx, st, t, LABPAL);
  headSpace(ctx, r, st, (c) => paint(() => {
    for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 24, -2, 21, 0, 7); c.lineWidth = 5.5; c.strokeStyle = '#2A2140'; c.stroke(); }
    line(c, -4, -2, 4, -2, 5, '#2A2140');
  }));
  // the clipboard in his left hand
  const w = toWorld(st, r.wrL);
  ctx.save(); ctx.translate(w[0] - 6, w[1] - 30); ctx.rotate(-0.12);
  rrect(ctx, -44, -60, 88, 116, 9); ctx.fillStyle = '#B98A48'; ctx.fill();
  rrect(ctx, -36, -48, 72, 98, 5); ctx.fillStyle = '#FBF8F0'; ctx.fill();
  paint(() => { for (let i = 0; i < 5; i++) { rrect(ctx, -28, -34 + i * 17, 56 - (i % 2) * 16, 7, 3); ctx.fillStyle = '#B4BACB'; ctx.fill(); } rrect(ctx, -16, -68, 32, 16, 5); ctx.fillStyle = '#8A93AD'; ctx.fill(); });
  ctx.restore();
  rigSpace(ctx, st, (c) => drawHand(c, r.wrL, r.armDirL, 'open', LABPAL, -1, t));
  return st;
}
// a stopwatch (round (0, 0), about 80 across)
function fairWatch(c, x, y, s, t, run = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -9, -52, 18, 18, 4); c.fillStyle = '#C9D0E4'; c.fill();
  circle(c, 0, 0, 40, '#C9D0E4'); circle(c, 0, 0, 31, '#FBF8F0');
  paint(() => { for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(c, Math.cos(a) * 24, Math.sin(a) * 24, Math.cos(a) * 28, Math.sin(a) * 28, 2.5, '#2A2140'); } const a = -Math.PI / 2 + run * Math.PI * 2; line(c, 0, 0, Math.cos(a) * 22, Math.sin(a) * 22, 4.5, '#FF5A6E'); circle(c, 0, 0, 4.5, '#2A2140'); });
  c.restore();
}

// ---------------------------------------------------------------- the drop, as a function of the video's time
function fallState(t) {
  const c = cu(), tRel = c.release, tNet = c.net, T = tNet - tRel;
  const u = clamp((t - tRel) / T), d = FAIR.DROP * u * u, v = t > tRel && t < tNet ? 2 * FAIR.DROP * u / T : 0;
  const tau = t - tNet;
  const sag = tau > 0 ? 190 * Math.exp(-tau * 3.0) * Math.sin(tau * 8.5) + 34 * (1 - Math.exp(-tau * 6)) : 0;       // the net gives, swings, settles
  const y = FAIR.TOP + d + (tau > 0 ? sag : 0);
  return { d, v, sag, y, u, tau, falling: t >= tRel && t < tNet, landed: tau >= 0 };
}
function fallHero(t) {
  const c = cu(), F = fallState(t);
  let p, face, frizz = 0, headDY = 0, headRot = 0;
  if (!F.falling && !F.landed) {                       // hanging from the rope: he grips his straps and looks down
    p = clone(POSES.stand);
    p = ikReach(p, 'L', [-54, p.hipY - 150], 1); p = ikReach(p, 'R', [54, p.hipY - 150], 1);
    p.legL = { a: 0.10 + 0.06 * Math.sin(t * 3.1), b: 0.06 }; p.legR = { a: 0.10 - 0.06 * Math.sin(t * 3.1), b: 0.06 };
    p.lean = 0.03 * Math.sin(t * 2.2);
    const scared = ramp(t, c.dropped - 0.25, c.dropped - 0.02);
    face = lerpFace(Object.assign({}, FACES.nervous, { lookX: -0.6, lookY: 0.9 }), Object.assign({}, FACES.shock, { lookX: -0.8, lookY: 0 }), scared);
    headRot = 0.03 * Math.sin(t * 2.2);
  } else if (F.falling) {
    const k = ramp(t, c.release, c.release + 0.14);
    const hang = clone(POSES.stand);
    p = twitch(lerpPose(hang, POSES.fall, k), t, 0.22 * k, 9);
    face = Object.assign({}, FACES.shock, { lookY: -0.3, mouthOpen: 1 });
    headDY = -6 * k; headRot = 0.08 * Math.sin(t * 17) * k;
  } else {                                             // in the net: he lands sitting, and sees stars
    const up = cu().so === undefined ? 0 : ramp(t, c.so - 0.1, c.so + 0.25, E.outBack);
    p = lerpPose(POSES.sit, POSES.sitThumb, clamp(up));
    p = twitch(p, t, 0.05 * Math.exp(-F.tau * 2), 4);
    const show = ramp(t, c.new3 - 0.22, c.new3 + 0.02, E.outCubic);          // he holds up the new photo
    if (show > 0.01) { const q = ikReach(p, 'L', [-150, p.hipY - 186], 1); p.armL = { a: lerp(p.armL.a, q.armL.a, show), b: lerp(p.armL.b, q.armL.b, show) }; }
    const dazed = Object.assign({}, FACES.dazed, { cross: 1 });
    face = lerpFace(dazed, Object.assign({}, FACES.grin, { lookX: 0, lookY: 0 }), clamp(up));
    if (up < 0.5) face.cross = 1;
    headRot = 0.10 * Math.sin(t * 2.6) * (1 - clamp(up)); headDY = 4 * Math.sin(t * 2.6);
  }
  const st = { x: FAIR.HX, y: F.y, s: 1, pose: p, face, frizz, headDY, headRot };
  return { st, F };
}
