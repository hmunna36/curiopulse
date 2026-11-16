// "Can You Wag Your Fingers Like WIPERS?" Short: the cast besides the hero.
//   ffRef(c, x, y, s, t, o)   the brain as a referee (a pink brain with a face, a striped shirt, a whistle, arms that
//                              point one way then the other), in its own units (about 220 wide, 300 tall, origin at the
//                              middle of its shirt's hem). o: {pt (-1..1: arms point screen-left .. screen-right),
//                              blow 0..1 (cheeks puff, the whistle sounds), dizzy 0..1, flag 0..1 (a white flag up),
//                              sweat 0..1, slump 0..1 (gives up: sinks and tilts), look -1..1}
//   ffSwingLegs(c, x, y, s, sw, pal)   seated legs seen from the front, hanging off a ledge; sw = the swing (-1 back ..
//                              1 forward toward the camera): the shins foreshorten and the boots rise and grow
//   ffGran(c, x, y, s, t, o)   the stranger on the van's step: a gran in a mustard raincoat with a tea mug
'use strict';

const FREF = { pink: '#F59BBE', pinkSh: '#D96F9A', pinkHi: '#FFC6DC', fold: '#B84F7E' };

function ffRef(c, x, y, s, t, o = {}) {
  const pt = clamp(o.pt === undefined ? 0 : o.pt, -1, 1), blow = clamp(o.blow || 0), dz = clamp(o.dizzy || 0);
  const slump = clamp(o.slump || 0), fl = clamp(o.flag || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.rotate(-0.22 * slump);
  c.translate(0, 40 * slump);
  // the shirt: black and white stripes, a collar
  c.save();
  c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(-82, -70, -60, -120); c.lineTo(60, -120); c.quadraticCurveTo(82, -70, 70, 0); c.closePath();
  c.fillStyle = '#F4F4F8'; c.fill();
  c.clip();
  for (let i = -4; i <= 4; i++) { c.fillStyle = '#16161E'; c.fillRect(i * 32 - 7, -130, 15, 140); }
  c.restore();
  // arms: shoulder at (+-58, -104); both arms point the same way (pt), the far one a little higher
  for (const sd of [-1, 1]) {
    const sh = [sd * 58, -104];
    let ax, ay;
    if (fl > 0.01 && sd === 1) { ax = sh[0] + 30; ay = sh[1] - 120 * fl; }
    else {
      const dir = pt === 0 ? sd : Math.sign(pt);
      const reach = Math.abs(pt) * 110 + (1 - Math.abs(pt)) * 40;
      ax = sh[0] + dir * reach * (sd === dir ? 1 : 0.55) + (1 - Math.abs(pt)) * sd * 20;
      ay = sh[1] + 18 - 30 * Math.abs(pt) * (sd === dir ? 1 : 0.4) + 40 * slump;
    }
    line(c, sh[0], sh[1], ax, ay, 22, '#16161E');
    line(c, sh[0], sh[1], ax, ay, 15, '#F4F4F8');
    circle(c, ax, ay, 14, FREF.pink);
    if (fl > 0.01 && sd === 1) {   // the white flag on a stick
      line(c, ax, ay + 10, ax, ay - 110, 5, '#8A5A3A');
      const wv = Math.sin(t * 14) * 8;
      c.beginPath(); c.moveTo(ax, ay - 110); c.quadraticCurveTo(ax + 40, ay - 120 + wv, ax + 84, ay - 104); c.lineTo(ax + 84, ay - 54); c.quadraticCurveTo(ax + 40, ay - 70 + wv, ax, ay - 60); c.closePath();
      c.fillStyle = '#FFFFFF'; c.fill();
    }
  }
  // the brain (head): a lumpy pink blob with folds
  c.save(); c.translate(0, -200); c.rotate(0.06 * Math.sin(t * 9) * dz);
  c.beginPath();
  const lobes = 9;
  for (let i = 0; i <= lobes * 4; i++) {
    const a = (i / (lobes * 4)) * Math.PI * 2, r = 100 + 9 * Math.sin(a * lobes) + 4 * Math.sin(a * 3 + 1);
    const px = Math.cos(a) * r * 1.1, py = Math.sin(a) * r * 0.82;
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath(); c.fillStyle = FREF.pink; c.fill();
  paint(() => {
    c.lineCap = 'round'; c.strokeStyle = FREF.fold; c.lineWidth = 5;
    c.beginPath(); c.moveTo(0, -78); c.quadraticCurveTo(-8, -40, 4, -10); c.stroke();
    for (const [ax2, ay2, bx, by, cx2, cy2] of [[-70, -40, -40, -66, -20, -40], [30, -60, 60, -44, 82, -20], [-90, 10, -60, -6, -50, 20], [60, 20, 84, 4, 96, 30], [-30, -60, -10, -76, 10, -60]]) {
      c.beginPath(); c.moveTo(ax2, ay2); c.quadraticCurveTo(bx, by, cx2, cy2); c.stroke();
    }
    // the face
    const lk = (o.look || 0) * 6;
    if (dz > 0.5) {
      for (const ex of [-34, 34]) { c.beginPath(); for (let i = 0; i < 22; i++) { const aa = i * 0.62 + t * 12, r = 1 + i * 0.9; c.lineTo(ex + Math.cos(aa) * r, 16 + Math.sin(aa) * r); } c.lineWidth = 3.5; c.strokeStyle = '#15132A'; c.stroke(); }
    } else {
      for (const ex of [-34, 34]) {
        ellipse(c, ex, 16, 18, 22, '#FFFFFF');
        circle(c, ex + lk + pt * 5, 18, 9, '#15132A'); circle(c, ex + lk + pt * 5 - 3, 13, 3, '#FFFFFF');
        line(c, ex - 16, -12 - (ex < 0 ? -1 : 1) * 6 * (o.sweat || 0), ex + 16, -12 + (ex < 0 ? -1 : 1) * 6 * (o.sweat || 0), 6, '#8E2F5A');
      }
    }
    // cheeks puff as it blows; the whistle in its mouth
    const pf = 1 + 0.35 * blow;
    for (const ex of [-46, 46]) ellipse(c, ex, 52, 13 * pf, 9 * pf, 'rgba(255,110,150,0.55)');
    ellipse(c, 0, 56, 12 * pf, 10 * pf, '#8E2F5A');
  });
  // the whistle (silver) and its lanyard
  rrect(c, 4, 46, 46, 22, 9); c.fillStyle = '#C9D2E0'; c.fill();
  circle(c, 44, 66, 13, '#C9D2E0');
  paint(() => { line(c, 10, 52, 40, 50, 3, 'rgba(255,255,255,0.8)'); c.beginPath(); c.moveTo(0, 60); c.quadraticCurveTo(-40, 120, -10, 170); c.lineWidth = 3; c.strokeStyle = '#E8504E'; c.stroke(); });
  if ((o.sweat || 0) > 0.05) sweatDrop(c, 96, -50, 1.4, o.sweat);
  c.restore();
  c.restore();
}

// seated legs hanging off a ledge, seen from the front. Local units: the hips at (0, 0), the knees forward at y +20,
// the shins hang down about 150. sw: -1 (swung back, under the ledge) .. 1 (kicked forward, toward the camera).
function ffSwingLegs(c, x, y, s, sw, pal, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    const k = sw + (o.split ? sd * o.split : 0);
    const kx = sd * 40, ky = 22;
    // thigh: a rounded knee block toward us
    rrect(c, kx - 32, -18, 64, 62, 26); c.fillStyle = pal.pants; c.fill();
    // the shin: forward = shorter on screen (toward us) and the boot rises; back = shorter too, the boot smaller
    const ang = k * 1.05, L = 165 * Math.cos(ang) + 24 * Math.max(0, Math.sin(ang)) - 30 * Math.max(0, Math.sin(ang)) ** 2, grow = 1 + 0.6 * Math.sin(ang);
    const fx = kx + sd * 4 * Math.sin(ang), fy = ky + L;
    c.beginPath(); c.moveTo(kx - 25, ky + 4); c.lineTo(kx + 25, ky + 4); c.lineTo(fx + 22 * grow, fy); c.lineTo(fx - 22 * grow, fy); c.closePath();
    c.fillStyle = pal.pantsSh || pal.pants; c.fill();
    // the boot (and its sole when it kicks up toward us)
    const bw = 40 * grow, bh = 22 * grow;
    ellipse(c, fx + sd * 3, fy + 8 * grow, bw, bh, pal.shoe);
    if (Math.sin(ang) > 0.25) { ellipse(c, fx + sd * 3, fy + 2 * grow, bw * 0.86, bh * 0.75 * clamp((Math.sin(ang) - 0.25) * 2), pal.sole || '#2A1A14'); }
    paint(() => ellipse(c, fx + sd * 3 - 10 * grow, fy + 2 * grow, bw * 0.35, bh * 0.25, 'rgba(255,255,255,0.22)'));
  }
  c.restore();
}

const FGRAN = { skin: '#EDBFA0', skinSh: '#C98F70', hair: '#E4E2EE', coat: '#A86ED6', coatSh: '#7A48A8', pants: '#3A3452', pantsSh: '#2A2540', shoe: '#2FA7A0', sole: '#1F6E6A', mouth: '#5A1522' };
// o: {lookX, lookY, brow (0..1), smile (-1..1), mouthO, sw (the swing), mug (0..1 raised), tilt}
function ffGran(c, x, y, s, t, o = {}) {
  const L = FGRAN;
  ffSwingLegs(c, x, y, s, o.sw || 0, { pants: L.pants, pantsSh: L.pantsSh, shoe: L.shoe, sole: L.sole });
  c.save(); c.translate(x, y); c.scale(s, s);
  // the raincoat (a hood down at the back)
  ellipse(c, 0, -170, 70, 24, L.coatSh);
  c.beginPath(); c.moveTo(-74, -168); c.quadraticCurveTo(0, -184, 74, -168); c.quadraticCurveTo(92, -90, 80, 10); c.quadraticCurveTo(0, 26, -80, 10); c.quadraticCurveTo(-92, -90, -74, -168); c.closePath();
  c.fillStyle = L.coat; c.fill();
  paint(() => { line(c, 0, -166, 0, 8, 4, L.coatSh); for (let yy = -140; yy < 0; yy += 34) circle(c, 10, yy, 5, '#F2E6FF'); });
  rrect(c, -16, -196, 32, 34, 10); c.fillStyle = L.skinSh; c.fill();
  // arms: the left hand on her knee, the right holds a mug
  const mk = clamp(o.mug || 0);
  line(c, -70, -150, -84, -60, 32, L.coatSh); line(c, -84, -60, -50, -4, 28, L.coatSh); circle(c, -48, 0, 16, L.skin);
  const wr = [lerp(46, 40, mk), lerp(-24, -150, mk)];
  line(c, 70, -150, 92, -70, 32, L.coatSh); line(c, 92, -70, wr[0], wr[1], 28, L.coatSh);
  rrect(c, wr[0] - 24, wr[1] - 52, 48, 54, 10); c.fillStyle = '#FFFFFF'; c.fill();
  paint(() => { rrect(c, wr[0] - 24, wr[1] - 40, 48, 12, 2); c.fillStyle = '#FF86A6'; c.fill(); });
  circle(c, wr[0], wr[1] + 2, 15, L.skin);
  // the head
  c.save(); c.translate(0, -252); c.rotate(o.tilt || 0);
  for (const sd of [-1, 1]) ellipse(c, sd * 54, 4, 11, 16, L.skinSh);
  c.beginPath(); c.ellipse(0, 0, 56, 62, 0, 0, Math.PI * 2);
  const hg = c.createRadialGradient(-20, -24, 6, 0, 0, 72); hg.addColorStop(0, mixH(L.skin, '#FFFFFF', 0.25)); hg.addColorStop(0.5, L.skin); hg.addColorStop(1, L.skinSh);
  c.fillStyle = hg; c.fill();
  // the hair: a white bun
  c.beginPath(); c.moveTo(-58, 4); c.quadraticCurveTo(-64, -60, 0, -66); c.quadraticCurveTo(64, -60, 58, 4); c.quadraticCurveTo(40, -34, 0, -36); c.quadraticCurveTo(-40, -34, -58, 4); c.closePath();
  c.fillStyle = L.hair; c.fill(); circle(c, 0, -76, 26, L.hair);
  paint(() => {
    const br = o.brow || 0;
    for (const sd of [-1, 1]) {
      const ex = sd * 20, ey = -6;
      ellipse(c, ex, ey, 9, 11, '#FFFFFF');
      circle(c, ex + (o.lookX || 0) * 4, ey + (o.lookY || 0) * 4, 5.5, '#15132A');
      circle(c, ex + (o.lookX || 0) * 4 - 1.5, ey + (o.lookY || 0) * 4 - 2, 1.8, '#FFFFFF');
      line(c, sd * 10, -30 - br * 10 * (sd > 0 ? 1.4 : 0.6), sd * 30, -27 - br * 8 * (sd > 0 ? 1.4 : 0.6), 5, '#A9A6BC');
      c.beginPath(); c.arc(sd * 20, -6, 15, 0, Math.PI * 2); c.lineWidth = 3.5; c.strokeStyle = '#3A2A52'; c.stroke();
    }
    line(c, -5, -6, 5, -6, 3, '#3A2A52');
    ellipse(c, 0, 12, 7, 5, 'rgba(160,90,60,0.5)');
    if ((o.mouthO || 0) > 0.05) ellipse(c, 0, 34, 6 + 4 * o.mouthO, 7 + 7 * o.mouthO, L.mouth);
    else { const sm = o.smile || 0; c.beginPath(); c.moveTo(-12, 32 - 3 * Math.max(0, sm)); c.quadraticCurveTo(0, 32 + 12 * sm, 12, 32 - 3 * Math.max(0, sm)); c.lineWidth = 4.5; c.lineCap = 'round'; c.strokeStyle = L.mouth; c.stroke(); }
    for (const ex of [-36, 36]) ellipse(c, ex, 18, 9, 5, 'rgba(255,120,140,0.35)');
  });
  c.restore();
  c.restore();
}
