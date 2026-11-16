// sad-eyebrows (17 Nov 2026): the campfire where Gran gives the sausage to the saddest face.
//   seCampScene(cam, t, S, o)   the whole set: the camp (camp.js), Gran on her stump with the roasting stick, the fire, the dog on
//                               its crate, him with a tin plate and his own brow head (brows.js), the sausage on the stick
//   seHero(cam, t, H)           him (campChar) with the brow head, the glass forehead, the ropes, the padlock, a tear, a cloud
//   seDog(c, x, y, s, t, o)     the dog, sitting, front view (why-we-cry's pupDraw, with brows that go SAD or ANGRY, puppy eyes,
//                               a sausage in its mouth, an x-ray with the extra muscle over each eye, a dropped jaw, a palette)
//   seGran(c, x, y, s, t, o)    Gran on a stump (finger-flip's gran), a long roasting stick to any point
//   seKennels(cam, t, K)        the shelter: three kennels; the middle door swings open
//   seCloud(c, x, y, s, t, o)   a little rain cloud with a sad face that drips one tear
// World layout: ground y 1300 (camp.js), his feet at (420, 1330), the dog's crate at x 600, Gran at x 1010, the fire at 870.
'use strict';

CAMP.FX = 780; CAMP.HX = 420;          // before initCamp() paints the land: the fire between the dog and Gran
const SE = { hx: 420, hy: 1330, hs: 1, dogX: 578, crateY: 1046, dogS: 0.62, granX: 925, granY: 1196, granS: 0.84 };
const SEPAL = Object.assign({}, CAMPPAL, { coat: '#2C8C86', coatSh: '#1F6E69', coatHi: '#62CFC4', coatDk: '#165753', shortSleeve: false });
const SE_ROPE = '#E8C98A', SE_ROPE_DK = '#9C7A3E';

// ---------------------------------------------------------------- the dog (front view, sitting)
const SE_PUP = { fur: '#D9A066', furSh: '#B57B45', white: '#FFF4E6', ear: '#7A4A26', nose: '#1E1410', collar: '#E8384F', tag: '#FFD447', tongue: '#FF7A90' };
const SE_PUG = { fur: '#C99A62', furSh: '#9E7444', white: '#F1DCC0', ear: '#3A302A', nose: '#1E1410', collar: '#3FB8FF', tag: '#FFD447', tongue: '#FF7A90' };
const SE_GRUMP = { fur: '#4A4458', furSh: '#2E2A3A', white: '#F4F0EA', ear: '#26222E', nose: '#1E1410', collar: '#4DD08A', tag: '#FFD447', tongue: '#FF7A90' };
// a point of the dog's head (head units) in world coords
function seDogPt(x, y, s, o, lx, ly) {
  const hx = x + ((o.dx || 0) + (o.headDX || 0)) * s, hy = y + (-232 + (o.headDY || 0)) * s, a = o.tilt || 0, cs = Math.cos(a), sn = Math.sin(a);
  return [hx + (lx * cs - ly * sn) * s, hy + (lx * sn + ly * cs) * s];
}
// o: {dx, tilt, headDX, headDY, look [x, y], ears, blink, sad 0..1 (inner brows up + big glossy puppy eyes), angry 0..1 (inner
//     brows down), smug 0..1, sausage 0..1 (in its mouth), chew (a phase), jaw 0..1 (dropped), xray 0..1, muscle 0..1 (the extra
//     muscle lit and pulling), wet 0..1, pal, wag}
function seDog(c, x, y, s, t, o = {}) {
  const F = o.pal || SE_PUP, lean = (o.dx || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  const wag = Math.sin(t * loopW(15)) * 0.5 * clamp(o.wag || 0);
  c.save(); c.translate(70, -30); c.rotate(0.42 + wag);
  c.lineCap = 'round'; c.lineWidth = 20; c.strokeStyle = F.furSh; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(22, -40, 6, -84); c.stroke();
  c.lineWidth = 16; c.strokeStyle = F.white; c.beginPath(); c.moveTo(10, -66); c.quadraticCurveTo(10, -76, 6, -86); c.stroke(); c.restore();
  ellipse(c, -56, -44, 52, 46, F.furSh); ellipse(c, 56, -44, 52, 46, F.furSh);
  c.beginPath(); c.moveTo(-62 + lean * 0.1, -6); c.quadraticCurveTo(-78 + lean * 0.6, -150, lean, -186); c.quadraticCurveTo(78 + lean * 0.6, -150, 62 + lean * 0.1, -6); c.closePath();
  c.fillStyle = F.fur; c.fill();
  c.beginPath(); c.moveTo(-30 + lean * 0.2, -22); c.quadraticCurveTo(-40 + lean * 0.6, -128, lean, -150); c.quadraticCurveTo(40 + lean * 0.6, -128, 30 + lean * 0.2, -22); c.closePath();
  c.fillStyle = F.white; c.fill();
  for (const sd of [-1, 1]) { rrect(c, sd * 27 - 15 + lean * 0.25, -92, 30, 92, 14); c.fillStyle = F.fur; c.fill(); ellipse(c, sd * 27 + lean * 0.2, -4, 21, 12, F.white); }
  // the head
  c.translate(lean + (o.headDX || 0), -232 + (o.headDY || 0)); c.rotate(o.tilt || 0);
  rrect(c, -44, 44, 88, 16, 8); c.fillStyle = F.collar; c.fill();
  circle(c, 0, 68, 10, F.tag);
  const ears = o.ears || 0, sad = clamp(o.sad || 0), ang = clamp(o.angry || 0);
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 62, -34);
    c.rotate(sd * (0.22 - 0.5 * Math.max(0, ears) + 1.25 * Math.max(0, -ears) + 0.12 * sad) + (ears < 0 ? 0.14 * Math.sin(t * 40 + sd) : 0));
    c.beginPath(); c.ellipse(sd * 10, 46 - 14 * Math.max(0, ears), 26, 56 - 6 * Math.max(0, ears), sd * 0.15, 0, Math.PI * 2); c.fillStyle = F.ear; c.fill(); c.restore();
  }
  ellipse(c, 0, 0, 82, 76, F.fur);
  ellipse(c, 0, 36 + 6 * clamp(o.jaw || 0), 49, 36 + 8 * clamp(o.jaw || 0), F.white);
  paint(() => {
    c.beginPath(); c.moveTo(-10, -70); c.quadraticCurveTo(0, -30, -6, 6); c.lineTo(6, 6); c.quadraticCurveTo(0, -30, 10, -70); c.closePath(); c.fillStyle = F.white; c.fill();
    const lk = o.look || [0, 0];
    for (const sd of [-1, 1]) {
      const ex = sd * 32, ey = -14;
      if ((o.blink || 0) > 0.9) { c.beginPath(); c.moveTo(ex - 12, ey); c.quadraticCurveTo(ex, ey + 8, ex + 12, ey); c.lineWidth = 5; c.strokeStyle = '#2A1A10'; c.lineCap = 'round'; c.stroke(); }
      else {
        const R = 13 + 8 * sad - 2 * ang;
        if (sad > 0.05) circle(c, ex, ey, R + 3.5, rgba('#FFFFFF', 0.9 * sad));
        circle(c, ex + lk[0] * 3, ey + lk[1] * 3 - 1.5 * sad, R, '#2A1A10');
        circle(c, ex + lk[0] * 3 - 4 - 2 * sad, ey + lk[1] * 3 - 5 - 3 * sad, 4.4 + 2.6 * sad, '#FFFFFF');
        if (sad > 0.2) { circle(c, ex + lk[0] * 3 + 5, ey + lk[1] * 3 + 4, 2.2 * sad, '#FFFFFF'); c.beginPath(); c.arc(ex, ey + 2, R + 1, 0.35, Math.PI - 0.35); c.lineWidth = 2.4; c.strokeStyle = rgba('#9FE8FF', 0.8 * sad); c.stroke(); }
        if ((o.smug || 0) > 0.05) { c.fillStyle = F.fur; c.fillRect(ex - 18, ey - 18, 36, 13 * o.smug + 4); line(c, ex - 15, ey - 2 + 13 * o.smug - 13, ex + 15, ey - 2 + 13 * o.smug - 13, 3, F.furSh); }
        if (ang > 0.05) { c.fillStyle = F.fur; c.beginPath(); c.moveTo(ex - sd * 18, ey - 16); c.lineTo(ex + sd * 18, ey - 16); c.lineTo(ex + sd * 18, ey - 12 + 0); c.lineTo(ex - sd * 18, ey - 16 + 14 * ang); c.closePath(); c.fill(); }
      }
      // the brow: inner end (near the middle) up for SAD, down for ANGRY
      const yi = -40 - 20 * sad + 16 * ang, yo = -36 + 7 * sad - 4 * ang, xi = sd * (17 - 3 * ang);
      c.beginPath(); c.moveTo(xi, yi); c.quadraticCurveTo(sd * 31, (yi + yo) / 2 - 4 + 3 * sad, sd * 45, yo);
      c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = F.furSh; c.stroke();
      if (sad > 0.3) for (let i = 0; i < 2; i++) line(c, sd * (8 + i * 5), -52 - i * 6 - 6 * sad, sd * (12 + i * 5), -60 - i * 6 - 6 * sad, 2.4, rgba(F.furSh, 0.7 * sad));   // the worried lines
    }
    ellipse(c, 0, 16, 17, 12, F.nose); ellipse(c, -5, 12, 6, 3, 'rgba(255,255,255,0.5)');
    const jaw = clamp(o.jaw || 0);
    if (jaw > 0.05) { ellipse(c, 0, 50 + 6 * jaw, 14 + 6 * jaw, 6 + 16 * jaw, '#3A0E16'); ellipse(c, 0, 58 + 12 * jaw, 10 + 4 * jaw, 4 + 6 * jaw, F.tongue); }
    else if ((o.sausage || 0) > 0.02) {
      const ch = Math.sin(o.chew || 0);
      c.save(); c.translate(0, 44 + 2 * ch); c.rotate(0.12 * ch);
      rrect(c, -46, -10, 92, 20, 10); c.fillStyle = '#B5462E'; c.fill();
      line(c, -36, -4, 30, -6, 3, 'rgba(255,190,150,0.6)');
      for (const e of [-1, 1]) line(c, e * 44, -3, e * 52, -8, 3, '#7A2A1A');
      c.restore();
      c.beginPath(); c.moveTo(-20, 38); c.quadraticCurveTo(0, 30 - 3 * ch, 20, 38); c.lineWidth = 4; c.strokeStyle = F.nose; c.stroke();
    } else {
      c.beginPath(); c.moveTo(0, 27); c.lineTo(0, 40);
      const sm = (o.smug || 0) * 6 - ang * 5;
      c.moveTo(-20, 42 - sm * 0.3); c.quadraticCurveTo(-9, 50 + sm, 0, 40); c.quadraticCurveTo(9, 50 + sm, 20, 42 - sm * 0.3);
      c.lineWidth = 4; c.strokeStyle = F.nose; c.lineCap = 'round'; c.stroke();
    }
    const wet = o.wet || 0;
    if (wet > 0.02) for (let i = 0; i < 5; i++) seTear(c, -50 + i * 24 + 6 * Math.sin(i * 7), -58 + 8 * Math.sin(i * 3.1) + 10 * (1 - wet) + ((t * 0.9 + i * 0.37) % 1) * 40, 5, wet);
  });
  // the x-ray: the head turns dark glass, the skull, and the extra muscle over each eye
  const xr = clamp(o.xray || 0);
  if (xr > 0.01) paint(() => {
    c.save(); c.globalAlpha = 0.5 * xr;
    c.beginPath(); c.ellipse(0, 0, 84, 78, 0, 0, Math.PI * 2); c.fillStyle = '#16307A'; c.fill();
    c.globalAlpha = xr;
    c.lineWidth = 3; c.strokeStyle = 'rgba(160,220,255,0.75)';
    c.beginPath(); c.moveTo(-58, 20); c.quadraticCurveTo(-66, -50, 0, -62); c.quadraticCurveTo(66, -50, 58, 20); c.quadraticCurveTo(40, 64, 0, 66); c.quadraticCurveTo(-40, 64, -58, 20); c.stroke();
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 32, -12, 24, 22, 0, 0, Math.PI * 2); c.stroke(); }
    // the muscle: from the inner brow up and in, toward the middle of the forehead; it bunches when it pulls
    const m = clamp(o.muscle || 0);
    for (const sd of [-1, 1]) {   // a spindle from the inner end of the brow up and in; it bunches (shorter, fatter) when it pulls
      const a = [sd * 19, -38 - 20 * sad], b = [sd * 12, -76 + 8 * m], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      c.save(); c.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); c.rotate(ang);
      const w = 9 + 5 * m;
      c.beginPath(); c.moveTo(-L / 2, 0); c.quadraticCurveTo(0, -w * 1.6, L / 2, 0); c.quadraticCurveTo(0, w * 1.6, -L / 2, 0); c.closePath();
      c.fillStyle = mixH('#D23A5E', '#FF5A84', m); c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#FFD0DC'; c.stroke();
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-L / 2 + 4, i * 0.6); c.quadraticCurveTo(0, i * w * 0.32, L / 2 - 4, i * 0.6); c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,215,225,0.75)'; c.stroke(); }
      c.restore();
    }
    c.restore();
  });
  c.restore();
  if (xr > 0.01 && (o.muscle || 0) > 0.01) for (const sd of [-1, 1]) { const p = seDogPt(x, y, s, o, sd * 16, -58); softDot(gctx, p[0], p[1], 40 * s, '#FF4F7A', 0.6 * xr * clamp(o.muscle)); }
}

// a tear drop (any units)
function seTear(c, x, y, r, a = 1, rot = 0) {
  if (a <= 0.01 || r <= 0.2) return;
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(0, -1.7 * r); c.bezierCurveTo(1.05 * r, -0.2 * r, 0.95 * r, r, 0, r); c.bezierCurveTo(-0.95 * r, r, -1.05 * r, -0.2 * r, 0, -1.7 * r);
  c.fillStyle = rgba('#7FD8FF', 0.96 * a); c.fill();
  c.lineWidth = Math.max(0.6, r * 0.16); c.strokeStyle = rgba('#2E86C8', 0.75 * a); c.stroke();
  c.fillStyle = rgba('#FFFFFF', 0.9 * a); c.beginPath(); c.ellipse(-0.3 * r, 0.1 * r, 0.22 * r, 0.36 * r, 0.4, 0, Math.PI * 2); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- Gran (seated on a stump, a long roasting stick)
const SE_GRAN = { skin: '#EDBFA0', skinSh: '#C98F70', hair: '#E4E2EE', coat: '#A86ED6', coatSh: '#7A48A8', pants: '#3A3452', pantsSh: '#2A2540', shoe: '#2FA7A0', sole: '#1F6E6A', mouth: '#5A1522' };
function seGranLegs(c, x, y, s, pal) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    const kx = sd * 40, ky = 22;
    rrect(c, kx - 32, -18, 64, 62, 26); c.fillStyle = pal.pants; c.fill();
    c.beginPath(); c.moveTo(kx - 25, ky + 4); c.lineTo(kx + 25, ky + 4); c.lineTo(kx + 22, ky + 120); c.lineTo(kx - 22, ky + 120); c.closePath(); c.fillStyle = pal.pantsSh; c.fill();
    ellipse(c, kx + sd * 3, ky + 128, 40, 22, pal.shoe);
  }
  c.restore();
}
// o: {stick: [wx, wy] the sausage end (world), sausage 0..1 (on the stick), lookX, lookY, smile, mouthO, tilt, aww 0..1 (her free hand
//     to her heart)}. (x, y) = the top of the stump (world)
function seGranHand(x, y, s, stick) {
  const sp = stick ? [(stick[0] - x) / s, (stick[1] - y) / s] : [-300, -260];
  const ang = Math.atan2(sp[1] - (-120), sp[0] - (-70));
  return [-70 + Math.cos(ang) * 70, -120 + Math.sin(ang) * 70];
}
// the roasting stick from her hand to the sausage end (world); drawn after him, so it passes in front
function seGranStick(c, x, y, s, t, o = {}) {
  const hand = seGranHand(x, y, s, o.stick), hw = [x + hand[0] * s, y + hand[1] * s], tip = o.stick;
  const back = [hw[0] - (tip[0] - hw[0]) * 0.12, hw[1] - (tip[1] - hw[1]) * 0.12];
  line(c, back[0], back[1], tip[0], tip[1], 8, '#8A5A32');
  paint(() => line(c, back[0], back[1] - 1.8, tip[0], tip[1] - 1.8, 2.4, 'rgba(255,214,160,0.5)'));
  circle(c, hw[0], hw[1], 16 * s, SE_GRAN.skin);
  if ((o.sausage === undefined ? 1 : o.sausage) > 0.02) seSausage(c, tip[0], tip[1], 1.25, Math.atan2(tip[1] - hw[1], tip[0] - hw[0]), t);
}
function seGran(c, x, y, s, t, o = {}) {
  const L = SE_GRAN;
  // the stump
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -96, 0, 192, 130, 18); c.fillStyle = '#6A4428'; c.fill();
  ellipse(c, 0, 0, 96, 22, '#A8784A');
  paint(() => { for (const r of [70, 48, 26]) { c.beginPath(); c.ellipse(0, 0, r, r * 0.22, 0, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = 'rgba(110,70,40,0.6)'; c.stroke(); } });
  c.restore();
  seGranLegs(c, x, y - 4, s, L);
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, -170, 70, 24, L.coatSh);
  c.beginPath(); c.moveTo(-74, -168); c.quadraticCurveTo(0, -184, 74, -168); c.quadraticCurveTo(92, -90, 80, 10); c.quadraticCurveTo(0, 26, -80, 10); c.quadraticCurveTo(-92, -90, -74, -168); c.closePath();
  c.fillStyle = L.coat; c.fill();
  paint(() => { line(c, 0, -166, 0, 8, 4, L.coatSh); for (let yy = -140; yy < 0; yy += 34) circle(c, 10, yy, 5, '#F2E6FF'); });
  rrect(c, -16, -196, 32, 34, 10); c.fillStyle = L.skinSh; c.fill();
  // the free arm (screen right): on her knee, or her hand to her heart (aww)
  const aw = clamp(o.aww || 0), fh = [lerp(48, 18, aw), lerp(0, -118, aw)];
  line(c, 70, -150, lerp(88, 70, aw), lerp(-60, -90, aw), 32, L.coatSh); line(c, lerp(88, 70, aw), lerp(-60, -90, aw), fh[0], fh[1], 28, L.coatSh); circle(c, fh[0], fh[1] + 4, 16, L.skin);
  // the stick arm (screen left): the hand out in front, the stick from it to the sausage end
  const hand = seGranHand(x, y, s, o.stick);
  c.restore();
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, -70, -150, -84, -110, 32, L.coatSh); line(c, -84, -110, hand[0], hand[1], 28, L.coatSh); circle(c, hand[0], hand[1], 16, L.skin);
  // the head
  c.save(); c.translate(0, -252); c.rotate(o.tilt || 0);
  for (const sd of [-1, 1]) ellipse(c, sd * 54, 4, 11, 16, L.skinSh);
  c.beginPath(); c.ellipse(0, 0, 56, 62, 0, 0, Math.PI * 2);
  const hg = c.createRadialGradient(-20, -24, 6, 0, 0, 72); hg.addColorStop(0, mixH(L.skin, '#FFFFFF', 0.25)); hg.addColorStop(0.5, L.skin); hg.addColorStop(1, L.skinSh);
  c.fillStyle = hg; c.fill();
  c.beginPath(); c.moveTo(-58, 4); c.quadraticCurveTo(-64, -60, 0, -66); c.quadraticCurveTo(64, -60, 58, 4); c.quadraticCurveTo(40, -34, 0, -36); c.quadraticCurveTo(-40, -34, -58, 4); c.closePath();
  c.fillStyle = L.hair; c.fill(); circle(c, 0, -76, 26, L.hair);
  paint(() => {
    for (const sd of [-1, 1]) {
      const ex = sd * 20, ey = -6;
      ellipse(c, ex, ey, 9, 11, '#FFFFFF');
      circle(c, ex + (o.lookX || 0) * 4, ey + (o.lookY || 0) * 4, 5.5, '#15132A');
      circle(c, ex + (o.lookX || 0) * 4 - 1.5, ey + (o.lookY || 0) * 4 - 2, 1.8, '#FFFFFF');
      const br = aw * 0.8;
      line(c, sd * 10, -30 - br * 9, sd * 30, -26 - br * 2, 5, '#A9A6BC');
      c.beginPath(); c.arc(sd * 20, -6, 15, 0, Math.PI * 2); c.lineWidth = 3.5; c.strokeStyle = '#3A2A52'; c.stroke();
    }
    line(c, -5, -6, 5, -6, 3, '#3A2A52');
    ellipse(c, 0, 12, 7, 5, 'rgba(160,90,60,0.5)');
    if ((o.mouthO || 0) > 0.05) ellipse(c, 0, 34, 6 + 4 * o.mouthO, 7 + 7 * o.mouthO, L.mouth);
    else { const sm = o.smile === undefined ? 0.6 : o.smile; c.beginPath(); c.moveTo(-12, 32 - 3 * Math.max(0, sm)); c.quadraticCurveTo(0, 32 + 12 * sm, 12, 32 - 3 * Math.max(0, sm)); c.lineWidth = 4.5; c.lineCap = 'round'; c.strokeStyle = L.mouth; c.stroke(); }
    for (const ex of [-36, 36]) ellipse(c, ex, 18, 9, 5, 'rgba(255,120,140,0.35)');
  });
  c.restore();
  c.restore();
}
// a sausage on the end of a stick (world), pointing along a: a two-prong fork, the sausage across the prongs
function seSausage(c, x, y, s, a, t) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  for (const e of [-1, 1]) line(c, -6, e * 6, 16, e * 6, 3.4, '#C9D0E4');
  c.save(); c.translate(30, 0); c.rotate(-a + 0.25);
  rrect(c, -46, -17, 92, 34, 17); c.fillStyle = '#A8452A'; c.fill();
  paint(() => {
    rrect(c, -40, -13, 80, 12, 6); c.fillStyle = 'rgba(214,110,70,0.85)'; c.fill();
    for (const xx of [-24, -6, 12, 30]) line(c, xx, -14, xx + 9, 14, 3.4, 'rgba(70,20,8,0.7)');
    line(c, -30, -9, 18, -10, 3, 'rgba(255,220,190,0.75)');
    for (const e of [-1, 1]) { c.beginPath(); c.moveTo(e * 46, -3); c.lineTo(e * 54, -7); c.lineTo(e * 53, 2); c.closePath(); c.fillStyle = '#7A2A1A'; c.fill(); }
  });
  c.restore();
  c.restore();
  for (let i = 0; i < 2; i++) { const u = (((t * 0.6 + i * 0.5) % 1) + 1) % 1; softDot(c, x + 30 * s * Math.cos(a) + 10 * Math.sin(u * 7 + i), y - 30 * s - 60 * s * u, (12 + 12 * u) * s, '#FFFFFF', 0.2 * (1 - u)); }
}

// ---------------------------------------------------------------- the little rain cloud (any units: head units over his head)
// o: {face 'sad' | 'cry', drip 0..1 (a drop forming under it), rain 0..1}
function seCloud(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const bob = 2 * Math.sin(t * loopW(3.1));
  c.translate(0, bob);
  for (const [dx, dy, r] of [[-26, 4, 20], [-8, -8, 26], [16, -4, 22], [32, 6, 16], [0, 10, 22]]) circle(c, dx, dy, r, '#8FA3C8');
  for (const [dx, dy, r] of [[-26, 0, 16], [-8, -12, 21], [16, -8, 17]]) circle(c, dx, dy - 2, r * 0.7, '#B7C6E4');
  paint(() => {
    for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 9, 4, 4.2, Math.PI * 0.15, Math.PI * 0.85); c.lineWidth = 2.6; c.strokeStyle = '#2A3150'; c.lineCap = 'round'; c.stroke(); line(c, sd * 5, -3, sd * 13, -6 + 0, 2.2, '#2A3150'); }
    c.beginPath(); c.moveTo(-6, 15); c.quadraticCurveTo(0, 10, 6, 15); c.lineWidth = 2.4; c.strokeStyle = '#2A3150'; c.stroke();
  });
  const d = clamp(o.drip || 0);
  if (d > 0.01) seTear(c, 0, 30 + 6 * d, 3 + 4 * d, 1);
  const rn = clamp(o.rain || 0);
  if (rn > 0.01) for (let i = 0; i < 9; i++) { const u = (((t * 2.2 + i * 0.37) % 1) + 1) % 1; const xx = -34 + i * 8.5; line(c, xx, 28 + u * 70, xx - 2, 36 + u * 70, 2.2, rgba('#9FE8FF', 0.85 * rn * (1 - u * 0.6))); }
  c.restore();
}

// ---------------------------------------------------------------- the padlock (head units): a teardrop keyhole
function sePadlock(c, x, y, s, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const open = clamp(o.open || 0), fall = clamp(o.fall || 0), sh = (o.shake || 0) * Math.sin((o.t || 0) * 70);
  c.save(); c.translate(x + sh * 1.6, y + 90 * fall * fall); c.rotate(0.6 * fall + 0.06 * sh); c.scale(s * E.outBack(k, 2.2), s * E.outBack(k, 2.2));
  // the shackle (lifts and swings when it opens)
  c.save(); c.translate(7, -8 - 6 * open); c.rotate(-0.9 * open); c.translate(-7, 0);
  c.beginPath(); c.arc(0, -2, 7, Math.PI, 0); c.lineTo(7, 5); c.moveTo(-7, -2); c.lineTo(-7, 5);
  c.lineWidth = 4.2; c.strokeStyle = '#59607A'; c.lineCap = 'butt'; c.stroke(); c.lineWidth = 2.4; c.strokeStyle = '#D6DCEC'; c.stroke();
  c.restore();
  rrect(c, -11, -6, 22, 19, 4); const g = c.createLinearGradient(-11, 0, 11, 0); g.addColorStop(0, '#FFE07A'); g.addColorStop(0.5, '#FFC23A'); g.addColorStop(1, '#D98F12');
  c.fillStyle = g; c.fill();
  paint(() => { rrect(c, -11, -6, 22, 19, 4); c.lineWidth = 1.6; c.strokeStyle = '#8A5A08'; c.stroke(); seKeyhole(c, 0, 3, 1, o.fill || 0); });
  c.restore();
}
// a teardrop-shaped keyhole; fill 0..1 = a tear in it, glowing blue
function seKeyhole(c, x, y, s, fill) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, -5.2); c.bezierCurveTo(3.4, -0.6, 3.2, 3.6, 0, 3.6); c.bezierCurveTo(-3.2, 3.6, -3.4, -0.6, 0, -5.2);
  c.fillStyle = fill > 0.05 ? mixH('#4A2C04', '#7FD8FF', clamp(fill)) : '#4A2C04'; c.fill();
  c.restore();
}

// ---------------------------------------------------------------- his head: the brows, the glass, the ropes, the lock (head units)
// H: {face, brows {l, r}, mouth, flush, sweat, glass 0..1, ropes {k (drawn on), up 0..1, in 0..1, jam 0..1}, lock {k, open, fall,
//     shake, fill}, sadLines 0..1, tear 0..1 (a tear on his cheek), cloud {k, drip, rain, x}, drop {u 0..1 (a tear falling from the
//     cloud to the keyhole)}}
const SE_UP = (s) => [s * 24, -112], SE_IN = (s) => [s * 3, -12];
function seSadLines(c, k) {   // Darwin's horseshoe: short furrows across the middle of the forehead, two upright ones between the brows
  if (k <= 0.02) return;
  c.save(); c.globalAlpha = clamp(k);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-12 + i, -40 - i * 5.2); c.quadraticCurveTo(0, -43 - i * 5.2, 12 - i, -40 - i * 5.2); c.lineWidth = 2 - i * 0.3; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,96,66,0.7)'; c.stroke(); }
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 4.5, -22); c.quadraticCurveTo(sd * 5.5, -29, sd * 12.5, -37); c.lineWidth = 1.8; c.strokeStyle = 'rgba(176,96,66,0.6)'; c.stroke(); }
  c.restore();
}
function seRope(c, a, b, o = {}) {   // a twisted rope from a to b, taut or slack; march (0..1+) slides the twists toward b
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const sl = o.slack || 0, m = [(a[0] + b[0]) / 2 + (o.vib || 0), (a[1] + b[1]) / 2 + sl], N = 18, pts = [];
  for (let i = 0; i <= N * k; i++) { const u = i / N, v = 1 - u; pts.push([v * v * a[0] + 2 * u * v * m[0] + u * u * b[0], v * v * a[1] + 2 * u * v * m[1] + u * u * b[1]]); }
  if (pts.length < 2) return;
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]);
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = (o.w || 3.6) + 1.4; c.strokeStyle = SE_ROPE_DK; c.stroke();
  c.lineWidth = o.w || 3.6; c.strokeStyle = o.col || SE_ROPE; c.stroke();
  // the twist: short slanted marks that march toward b when it pulls
  const L = pts.length - 1, ph = ((o.march || 0) % 1 + 1) % 1;
  for (let i = 0; i < L; i += 2) {
    const j = Math.min(L - 1, Math.floor(i + ph * 2)), p = pts[j], q = pts[j + 1], dx = q[0] - p[0], dy = q[1] - p[1], n = Math.hypot(dx, dy) || 1;
    line(c, p[0] - dy / n * 1.6 - dx / n * 0.8, p[1] + dx / n * 1.6 - dy / n * 0.8, p[0] + dy / n * 1.6 + dx / n * 0.8, p[1] - dx / n * 1.6 + dy / n * 0.8, 1.1, SE_ROPE_DK);
  }
}
function sePulley(c, x, y, r, spin) {
  circle(c, x, y, r, '#59607A'); circle(c, x, y, r * 0.62, '#C9D0E4'); circle(c, x, y, r * 0.22, '#59607A');
  for (let i = 0; i < 3; i++) { const a = spin + i * 2.094; line(c, x, y, x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, 1.2, '#59607A'); }
}
function seHeadExtras(c, t, H) {
  const B = H.brows || {}, R = H.ropes;
  if (R) {
    const rk = clamp(R.k === undefined ? 1 : R.k), up = clamp(R.up || 0), inn = clamp(R.in || 0), jam = clamp(R.jam || 0);
    // the bar above his head, dropping in
    const bk = E.outBack(clamp(rk * 2), 1.6), by = -112 - 60 * (1 - bk);
    if (rk > 0.01) {
      actor(() => { rrect(c, -46, by - 9, 92, 12, 6); c.fillStyle = '#B97A45'; c.fill(); line(c, 0, by - 9, 0, by - 70, 3, '#9C7A3E'); });
      paint(() => { line(c, -40, by - 6, 38, by - 6, 2, 'rgba(255,214,160,0.55)'); for (const sd of [-1, 1]) sePulley(c, sd * 24, by + 6, 7, up * 9 + jam * Math.sin(t * 50)); });
    }
    for (const sd of [-1, 1]) {
      const Bs = B[sd < 0 ? 'l' : 'r'] || {}, p = EB_BROW_PT(sd, Bs, 0.28), vib = jam * 1.6 * Math.sin(t * 90 + sd);
      const pu = [sd * 24 - sd * 6, by + 6];
      paint(() => {
        seRope(c, p, pu, { k: rk, slack: 0, march: up * 3 + jam * Math.sin(t * 40) * 0.2, vib, w: 4.2 });
        seRope(c, p, SE_IN(sd), { k: clamp(rk * 1.5 - 0.4), slack: 4 * (1 - Math.max(inn, jam)), march: inn * 3, vib: -vib, w: 4.2 });
        if (rk > 0.4) { c.beginPath(); c.arc(p[0], p[1], 3.4, 0, Math.PI * 2); c.lineWidth = 2.2; c.strokeStyle = '#59607A'; c.stroke(); }
      });
    }
  }
  // the padlock between the brows
  if (H.lock && H.lock.k > 0.01) sePadlock(c, 0, -14, 1.55, { ...H.lock, t });
  // the cloud over his head and the one tear that falls from it into the keyhole
  if (H.cloud && H.cloud.k > 0.01) {
    const k = E.outBack(clamp(H.cloud.k), 1.8);
    actor(() => seCloud(c, H.cloud.x || 0, -150 + 40 * (1 - k), 1.15 * k, t, H.cloud));
  }
  if (H.drop && H.drop.u > 0 && H.drop.u < 1) { const u = H.drop.u, y = lerp(-110, -12, u * u); paint(() => seTear(c, 0, y, 4.2, 1)); }
  // a tear on his cheek
  if ((H.tear || 0) > 0.01) paint(() => seTear(c, -27, 6 + 22 * clamp((H.tear - 0.4) / 0.6), 4.6 * clamp(H.tear * 2), 1));
  // concentrating: a sweat drop
  if ((H.sweat || 0) > 0.02) paint(() => sweatDrop(c, 50, -36 + 10 * H.sweat, 0.42, clamp(H.sweat * 3)));
}

// ---------------------------------------------------------------- him: the rig, the tin plate, the brow head
function seHeroPose(H) {
  let p = JSON.parse(JSON.stringify(POSES.stand));
  p.lean = H.lean || 0;
  p.hipY += H.bob || 0;
  const py = p.hipY - 92 - 40 * (H.plateUp || 0);
  p = ikReach(p, 'L', [-46, py], 1);
  p = ikReach(p, 'R', [46, py], -1);
  p.hand = 'fist';
  return p;
}
function seHero(cam, t, H) {
  const pose = seHeroPose(H);
  const st = { x: SE.hx + (H.dx || 0), y: SE.hy, s: SE.hs, pose, face: H.face || FACES.calm, headRot: H.headRot || 0, headDX: 0, headDY: H.headDY || 0, seed: 4 };
  const glass = clamp(H.glass || 0);
  applyCam(cam);
  const r = campChar(cam, st, t, {
    pal: SEPAL, ambient: 0.05, fire: 0.85,
    post: (lc, rr, s2) => {
      // the tin plate in both hands
      rigSpace(lc, s2, (cc) => {
        const py = s2.pose.hipY - 92 - 40 * (H.plateUp || 0) + 6;
        actor(() => { ellipse(cc, 0, py, 74, 20, '#8D99B8'); ellipse(cc, 0, py - 3, 60, 14, '#B7C2DC'); });
        paint(() => line(cc, -40, py - 8, -10, py - 10, 2.5, 'rgba(255,255,255,0.7)'));
        for (const sd of [-1, 1]) circle(cc, sd * 50, py + 2, 15, SEPAL.skin);
        if ((H.plateSausage || 0) > 0.02) seSausage(cc, -26, py - 12, 0.9, 0, t);
      });
      headSpace(lc, rr, s2, (c) => {
        actor(() => ebHeadBase(c, SEPAL, H, t));
        if (glass > 0.01) ebDome(c, t, { k: glass });
        ebHeadFront(c, SEPAL, H, t, glass);
        paint(() => seSadLines(c, H.sadLines || 0));
        seHeadExtras(c, t, H);
      });
    },
  });
  return { st, r, at: (lx, ly) => headPt(st, r, [lx, ly]) };
}

// ---------------------------------------------------------------- the whole campfire set
// S: {hero (H), dog (o for seDog), gran (o for seGran), stick: 'mid' | 'dog' | 'him' or [wx, wy], swing: {from, to, k}, sausage 0..1}
const SE_STICK = { mid: [505, 786], dog: [560, 935], him: [446, 978], rest: [790, 760] };
function seStickAt(S) {
  const P = (v) => (Array.isArray(v) ? v : SE_STICK[v || 'mid']);
  if (S.swing) { const a = P(S.swing.from), b = P(S.swing.to), k = clamp(S.swing.k); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - 60 * Math.sin(Math.PI * k)]; }
  return P(S.stick);
}
function seCampScene(cam, t, S, o = {}) {
  campBack(cam, t, { soft: o.soft || 0, fire: 1, lights: 1 });
  applyCam(cam);
  // Gran on her stump, behind the fire
  const tip = seStickAt(S);
  actor(() => seGran(ctx, SE.granX, SE.granY, SE.granS, t, { ...(S.gran || {}), stick: tip, sausage: S.sausage === undefined ? 1 : S.sausage }));
  campFire(t, 0.62);
  // the dog on its crate
  rrect(ctx, SE.dogX - 92, SE.crateY, 184, SE.hy - SE.crateY, 10); ctx.fillStyle = '#8A5A32'; ctx.fill();
  paint(() => { for (let i = 1; i < 4; i++) line(ctx, SE.dogX - 88, SE.crateY + i * 58, SE.dogX + 88, SE.crateY + i * 58, 3, 'rgba(60,34,16,0.6)'); line(ctx, SE.dogX - 80, SE.crateY + 10, SE.dogX + 80, SE.hy - 10, 4, 'rgba(60,34,16,0.5)'); });
  actor(() => seDog(ctx, SE.dogX, SE.crateY, SE.dogS, t, S.dog || {}));
  const D = S.dog || {};
  if (D.xray > 0.01) { applyCam(cam); }
  // him
  const Hh = seHero(cam, t, S.hero || {});
  applyCam(cam);
  actor(() => seGranStick(ctx, SE.granX, SE.granY, SE.granS, t, { stick: tip, sausage: S.sausage === undefined ? 1 : S.sausage }));
  return { Hh, tip };
}

// ---------------------------------------------------------------- the shelter: three kennels in daylight
// K: {pup (o for the middle dog), door 0..1 (swung open), gone 0..1 (the middle dog zooms off to the right), jaw 0..1 (the neighbours)}
function seKennels(cam, t, K) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FFE2B8'); g.addColorStop(0.55, '#FFC98E'); g.addColorStop(1, '#E59A5E');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // the wall: painted blocks, a sign, a window with sky, a paw-print poster
  for (let r = 0; r < 14; r++) for (let q = -2; q < 8; q++) { const x = q * 220 + (r % 2) * 110, y = 300 + r * 70; rrect(ctx, x + 4, y + 4, 212, 62, 8); ctx.fillStyle = r % 3 ? '#F7D9B0' : '#F2CFA0'; ctx.fill(); }
  rrect(ctx, 760, 380, 300, 200, 18); ctx.fillStyle = '#7FD0FF'; ctx.fill(); paint(() => { rrect(ctx, 760, 380, 300, 200, 18); ctx.lineWidth = 14; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); line(ctx, 910, 380, 910, 580, 10, '#FFFFFF'); softDot(ctx, 980, 430, 60, '#FFFFFF', 0.5); });
  softDot(gctx, 910, 480, 220, '#FFE9B0', 0.35);
  rrect(ctx, 60, 420, 420, 110, 24); ctx.fillStyle = '#3FB8A8'; ctx.fill();
  paint(() => { ctx.font = '900 64px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('ADOPT ME', 270, 478); });
  // the floor
  ctx.fillStyle = '#C98A5A'; ctx.fillRect(-600, 1380, 2400, 900);
  paint(() => { for (let i = 0; i < 14; i++) line(ctx, -600 + i * 180, 1380, -900 + i * 260, 2300, 3, 'rgba(120,70,40,0.35)'); });
  // three kennels
  const KX = [180, 540, 900], pals = [SE_PUG, SE_PUP, SE_GRUMP];
  for (let i = 0; i < 3; i++) {
    const x = KX[i];
    rrect(ctx, x - 165, 760, 330, 640, 22); ctx.fillStyle = '#5E6A8A'; ctx.fill();
    rrect(ctx, x - 150, 776, 300, 610, 16); ctx.fillStyle = '#2E3550'; ctx.fill();
    paint(() => { softDot(ctx, x, 1100, 220, '#FFB870', 0.18); rrect(ctx, x - 120, 1300, 240, 60, 26); ctx.fillStyle = '#E8384F'; ctx.fill(); });   // a cushion
    // the dog
    const mid = i === 1, gone = mid ? clamp(K.gone || 0) : 0;
    const dx = mid ? 900 * gone * gone : 0;
    const o = mid ? { ...(K.pup || {}), pal: pals[i] } : { pal: pals[i], jaw: K.jaw || 0, look: [i === 0 ? 1 : -1, 0], ears: i === 0 ? -0.2 : 0.3, angry: i === 2 ? 0.55 * (1 - clamp(K.jaw || 0)) : 0, blink: i === 0 && ((t * 0.7) % 1) < 0.05 ? 1 : 0 };
    if (gone < 0.98) actor(() => seDog(ctx, x + dx, 1350, 1.12, t, o));
    if (mid && gone > 0.05 && gone < 0.9) for (let j = 0; j < 5; j++) line(ctx, x + dx - 160 - j * 30, 1050 + j * 50, x + dx - 360 - j * 50, 1050 + j * 50, 9, rgba('#FFFFFF', 0.8 * (1 - gone)));
    // the bars (the door): the middle door swings open toward us
    const open = mid ? clamp(K.door || 0) : 0;
    ctx.save(); ctx.translate(x - 150, 776);
    const sx = Math.cos(open * 1.35), skew = 0.25 * Math.sin(open * 1.35);
    ctx.transform(sx, -skew, 0, 1, 0, 0);
    for (let b = 0; b <= 4; b++) { rrect(ctx, b * 75 - 4, 0, 8, 610, 4); ctx.fillStyle = '#C9D0E4'; ctx.fill(); }
    rrect(ctx, -8, 0, 316, 18, 8); ctx.fillStyle = '#A7B0C8'; ctx.fill(); rrect(ctx, -8, 300, 316, 16, 8); ctx.fill(); rrect(ctx, -8, 592, 316, 18, 8); ctx.fill();
    ctx.restore();
    // a name plate
    rrect(ctx, x - 90, 690, 180, 54, 12); ctx.fillStyle = '#FFF4E6'; ctx.fill();
    paint(() => { ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3A2A52'; ctx.fillText(['BISCUIT', 'NOODLE', 'GRUMBLE'][i], x, 718); });
  }
}

function initSeWorld() { initCamp(); }
