// parlour.js — the 1880s, in sepia: a pianist's hand on a velvet cushion seen through glass (the strap between the
// ring and middle cords), a surgeon's scissors that snip it, the freed ring finger; then the pianist in his tailcoat
// in a gaslit parlour with a grand piano, waving a bandaged hand. Old film: scratches, dust, a flickering gate.
'use strict';

const PARPAL = Object.assign({}, PAL, {
  coat: '#24222C', coatSh: '#16151C', coatHi: '#3C3A48', coatDk: '#121118', strap: '#24222C', strapSh: '#16151C',
});
let PARLOUR_BG = null;
function initParlour() {
  const c0 = mkCanvas(W, H), x = c0.getContext('2d'), rng = mulberry32(77);
  // damask wallpaper in stripes, a wainscot, a tall window with heavy curtains, a grand piano with its lid up, a portrait
  let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5A2E2A'); g.addColorStop(1, '#2E1614');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? 'rgba(255,220,180,0.05)' : 'rgba(0,0,0,0.06)'; x.fillRect(i * 90, 0, 90, 1180); }
  for (let yy = 60; yy < 1180; yy += 120) for (let xx = 45; xx < W; xx += 180) {
    x.fillStyle = 'rgba(255,215,160,0.07)'; x.beginPath(); x.ellipse(xx, yy, 18, 30, 0, 0, 7); x.fill();
  }
  x.fillStyle = '#2A1810'; x.fillRect(0, 1180, W, 740); x.fillStyle = '#4A2C1A'; x.fillRect(0, 1170, W, 18);
  // window, far left
  g = x.createLinearGradient(0, 200, 0, 1000); g.addColorStop(0, '#2A3A5A'); g.addColorStop(1, '#1A2238');
  x.fillStyle = g; x.fillRect(40, 220, 260, 760);
  x.fillStyle = '#6A1A1E'; x.beginPath(); x.moveTo(0, 160); x.quadraticCurveTo(120, 600, 60, 1100); x.lineTo(0, 1100); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(340, 160); x.quadraticCurveTo(250, 600, 300, 1100); x.lineTo(380, 1100); x.lineTo(380, 160); x.closePath(); x.fill();
  // a portrait in a gilt frame
  x.fillStyle = '#9A7A3A'; x.fillRect(470, 230, 220, 270); x.fillStyle = '#3A2A20'; x.fillRect(490, 250, 180, 230);
  x.fillStyle = '#7A5A40'; x.beginPath(); x.ellipse(580, 340, 44, 54, 0, 0, 7); x.fill(); x.fillRect(530, 390, 100, 90);
  // the grand piano behind him, right: the lid up on its stick, the case
  x.fillStyle = '#120C0A';
  x.beginPath(); x.moveTo(620, 1060); x.lineTo(1080, 1000); x.lineTo(1080, 1190); x.lineTo(640, 1190); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(640, 1050); x.lineTo(1080, 560); x.lineTo(1080, 640); x.lineTo(700, 1050); x.closePath(); x.fill();
  x.strokeStyle = '#2A1E18'; x.lineWidth = 8; x.beginPath(); x.moveTo(900, 1020); x.lineTo(960, 760); x.stroke();
  x.fillStyle = '#E9DFC8'; x.fillRect(640, 1100, 440, 26); for (let i = 0; i < 18; i++) { x.fillStyle = '#0A0806'; if (i % 7 !== 2 && i % 7 !== 6) x.fillRect(660 + i * 24, 1100, 12, 15); }
  // a candelabra on the piano
  x.fillStyle = '#B8963E'; x.fillRect(840, 880, 10, 120); x.fillRect(790, 900, 110, 8);
  for (const cx of [796, 845, 894]) { x.fillStyle = '#EFE6D0'; x.fillRect(cx - 7, 840, 14, 60); }
  const c1 = mkCanvas(W, H), y = c1.getContext('2d');
  y.filter = 'blur(5px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
  PARLOUR_BG = c1;
}
// scissors in screen space: tip at (x, y), pointing along angle `an`, opened by `open` (rad); a hand in a black sleeve
// and a white cuff holds the loops
function parScissors(x, y, an, open, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.scale(s, s);
  const blade = (sg) => {
    ctx.save(); ctx.translate(-150, 0); ctx.rotate(sg * open / 2);
    ctx.beginPath(); ctx.moveTo(150, 0); ctx.quadraticCurveTo(60, sg * -22, -10, sg * -16); ctx.lineTo(-10, sg * 8); ctx.quadraticCurveTo(70, sg * 4, 150, 0); ctx.closePath();
    ctx.fillStyle = sg > 0 ? '#C9CDD4' : '#AEB3BC'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, sg * 2); ctx.lineTo(-120, sg * 30); ctx.lineWidth = 16; ctx.strokeStyle = '#9EA4AE'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-150, sg * 40, 34, 26, 0, 0, 7); ctx.lineWidth = 13; ctx.strokeStyle = '#9EA4AE'; ctx.stroke();
    ctx.restore();
  };
  blade(1); blade(-1);
  circle(ctx, -150, 0, 11, '#6E7480'); circle(ctx, -150, 0, 5, '#D8DCE2');
  // the surgeon's hand: a fist round the loops, a white cuff, a black sleeve off to the right
  ctx.translate(-300, 0);
  actor(() => {
    ctx.fillStyle = '#1C1A22'; rrect(ctx, -420, -70, 330, 140, 60); ctx.fill();
    ctx.fillStyle = '#F2EEE4'; rrect(ctx, -110, -62, 50, 124, 18); ctx.fill();
    ctx.fillStyle = '#E8B48E'; ctx.beginPath(); ctx.ellipse(-20, 0, 70, 58, 0, 0, 7); ctx.fill();
  });
  paint(() => { for (let i = -1; i <= 1; i++) line(ctx, 10, i * 24, 34, i * 22, 4, 'rgba(150,80,60,0.6)'); });
  ctx.restore();
}
// old film over the frame (screen space): scratches, dust and a gate flicker, on the frame clock
function parOldFilm(t) {
  screenSpace();
  const f = Math.floor(t * 30), r = mulberry32(900 + f * 7);
  paint(() => {
    ctx.save();
    for (let i = 0; i < 3; i++) if (r() < 0.6) { const x = r() * W; line(ctx, x, 0, x + (r() - 0.5) * 30, H, 1.5 + r() * 2, `rgba(255,240,210,${0.12 + r() * 0.15})`); }
    for (let i = 0; i < 14; i++) circle(ctx, r() * W, r() * H, 1 + r() * 4, `rgba(30,20,10,${0.25 + r() * 0.3})`);
    ctx.fillStyle = `rgba(20,12,4,${0.05 + 0.05 * r()})`; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  });
}

// the 1880s shot: lt from the cut, t video time
function pastDraw(lt, t, shot) {
  const c = cu(), snipT = c.snipped + 0.32, wideT = c.pianists - 0.12;
  if (t < wideT) {
    // the hand on a velvet cushion, seen through glass; the scissors come in and snip the strap
    screenSpace();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2A1A12'); g.addColorStop(1, '#3E2616');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const V = { phi: 0.98, tx: -0.3, ty: 3.0, tz: -2.6, D: 60 - 4 * ramp(t, shot.start, wideT, E.inOutSine), f: HV_F, cx: 520, cy: 980 };
    const pr0 = hvCam(V), cush = 2.2, pr = (p) => pr0([p[0], p[1] + cush, p[2]]);
    applyCam({ x: 540, y: 960, zoom: 1, rot: 0 });
    // the cushion: a fat rounded slab of red velvet
    const out = [];
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, rx = 13, rz = 15, e = 6; const cx2 = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 2 / e), cz2 = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 2 / e); out.push([cx2 * rx + 0.5, 0, cz2 * rz - 2]); }
    const side = out.map((p) => pr0([p[0], 0, p[2]])), top = out.map((p) => pr0([p[0], cush, p[2]]));
    ctx.fillStyle = '#5A1218'; hdSmooth(ctx, side); ctx.fill();
    ctx.fillStyle = '#8E1E28'; hdSmooth(ctx, top); ctx.fill();
    paint(() => { for (const [x, z] of [[-9, -12], [9, -12], [-9, 9], [9, 9], [0, -2]]) { const q = pr0([x, cush, z]); circle(ctx, q[0], q[1], 7, '#C9A050'); } });
    // the hand: a black sleeve and a white cuff
    const A = { lift: {}, fold: 0, tremble: 0, t };
    const free = ramp(t, snipT + 0.15, snipT + 0.45, E.outBack);
    A.lift.R = 0.45 * free + 0.07 * free * Math.sin((t - snipT) * 14);
    const G = hdGeo(A);
    actor(() => hdDraw(ctx, pr, G, { sleeve: '#1C1A22', sleeveDk: '#F2EEE4', cuffZ: -15, shadow: 0.8 }));
    hdGlass(ctx, pr, G, 0.8, { cuffZ: -15 });
    hdInside(pr, G, { k: 1, t, cords: 0.8, strap: 1, snip: ramp(t, snipT, snipT + 0.25), strapGlow: 1, glow: { R: 0.35 * free } });
    // the scissors close on the strap
    const q = hdStrapPt(pr, G), inK = ramp(t, c.surgeon - 0.2, c.snipped, E.outCubic), open = 0.65 * (1 - ramp(t, snipT - 0.12, snipT, E.inCubic)) + 0.4 * ramp(t, snipT + 0.1, snipT + 0.4);
    const out2 = 1 - ramp(t, snipT + 0.35, snipT + 0.8, E.inCubic);
    if (inK > 0.01 && out2 > 0.01) parScissors(q[0] + lerp(700, 0, inK) + 600 * (1 - out2), q[1] - lerp(260, 0, inK), Math.PI + 0.45, open, 1.35);
    // SNIP!
    const sk = popK(t, snipT, snipT + 0.55, 0.05, 0.15);
    if (sk > 0.01) { screenSpace(); bigWord('SNIP!', clamp(q[0] + 250, 300, 780), q[1] - 40, 150, '#FFE38A', E.outBack(clamp(sk), 2.4), -0.12); }
    // the ring finger is free
    const rt = pr(hdTop(G.f.R.pts[2], G.f.R.P[1], G.f.R.rad[2], 1.2));
    rfTag('FREE!', clamp(rt[0] - 120, 230, 830), Math.min(rt[1] - 280, 1180), '#4DFFB4', popK(t, snipT + 0.3, wideT + 1, 0.12), rt);
    // the year
    rfTag('1880s', 540, 480, '#F2CC8F', popK(t, c.in1880 - 0.05, wideT + 1, 0.15));
    parOldFilm(t);
    return { glow: 0.85, desat: 0.72, tint: '#C8964F', tintA: 0.22, capY: 1520, flash: 0.35 * popK(t, snipT, snipT + 0.2, 0.02, 0.18) };
  }
  // the pianist in his parlour, waving his bandaged hand, proud
  screenSpace();
  ctx.drawImage(PARLOUR_BG, 0, 0);
  for (const cx of [796, 845, 894]) { softDot(gctx, cx, 830 + 2 * Math.sin(t * 13 + cx), 60, '#FFC27A', 0.7); ellipse(ctx, cx, 828, 6, 12, '#FFE9B0'); }
  const cam = { x: 540, y: 960, zoom: 1 + 0.04 * ramp(t, wideT, shot.end), rot: 0 };
  applyCam(cam);
  const face = t < c.purpose ? RF.proud : lerpFace(RF.proud, { ...RF.proud, lookX: 0, browY: 1.0, browTilt: -0.5, blink: 0.35 }, ramp(t, c.purpose, c.purpose + 0.2));
  const pose = JSON.parse(JSON.stringify(POSES.sit));
  const st = { x: 600, y: 1640, s: 2.5, pose, face, noLegs: true, noArms: true };
  const H2 = 'parlour';
  const r = charLayer(cam, st, t, {
    pal: PARPAL, ambient: 0.05,
    post: (lc, rr) => {
      lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
      // shirt front and bow tie
      lc.fillStyle = '#F2EEE4'; lc.beginPath(); lc.moveTo(-34, -200); lc.lineTo(0, -110); lc.lineTo(34, -200); lc.closePath(); lc.fill();
      lc.fillStyle = '#0E0D12'; lc.beginPath(); lc.moveTo(0, -192); lc.lineTo(-26, -206); lc.lineTo(-26, -178); lc.closePath(); lc.fill();
      lc.beginPath(); lc.moveTo(0, -192); lc.lineTo(26, -206); lc.lineTo(26, -178); lc.closePath(); lc.fill();
      // his left arm resting down (screen right), and his right arm up, waving a bandaged hand
      const shR = rr.shR, shL = rr.shL;
      line(lc, shR[0], shR[1], shR[0] + 20, shR[1] + 120, 42, PARPAL.coat);
      const wave = Math.sin(t * 9) * 0.18;
      const el = [shL[0] - 30, shL[1] + 70], wr = [el[0] - 5 + 40 * wave, el[1] - 125];
      line(lc, shL[0], shL[1], el[0], el[1], 42, PARPAL.coat);
      line(lc, el[0], el[1], wr[0], wr[1], 38, PARPAL.coat);
      line(lc, wr[0], wr[1] + 6, wr[0], wr[1] - 4, 44, '#F2EEE4');
      parWaveHand(lc, wr[0], wr[1] - 30, wave);
      lc.restore();
    },
  });
  // a little sparkle by the bandage on "on purpose"
  parOldFilm(t);
  return { glow: 0.85, desat: 0.72, tint: '#C8964F', tintA: 0.22 };
}
// an open hand, palm to us, fingers up, the ring finger raised highest in a white bandage (rig units)
function parWaveHand(c, x, y, wave) {
  c.save(); c.translate(x, y); c.rotate(wave);
  const skin = '#EDB08A';
  ellipse(c, 0, 0, 30, 32, skin);
  const F = [[-22, -18, 28, -0.25], [-8, -26, 40, -0.08], [7, -28, 44, 0.05], [20, -22, 36, 0.2]];   // little, ring, middle, index
  F.forEach(([fx, fy, L, a], i) => {
    const tx = fx + Math.sin(a) * L, ty = fy - Math.cos(a) * L - (i === 1 ? 14 : 0);
    line(c, fx, fy, tx, ty, i === 1 ? 15 : 14, skin);
    if (i === 1) { line(c, fx + (tx - fx) * 0.35, fy + (ty - fy) * 0.35, fx + (tx - fx) * 0.75, fy + (ty - fy) * 0.75, 19, '#F7F3EA'); }
  });
  line(c, 26, 6, 46, -14, 15, skin);
  paint(() => { const tx = -22 + Math.sin(-0.08) * 40, ty = -26 - Math.cos(-0.08) * 40 - 14; line(c, -12, -46, -14, -62, 2.5, 'rgba(200,40,40,0.8)'); line(c, -21, -54, -5, -54, 2.5, 'rgba(200,40,40,0.8)'); });
  c.restore();
}
