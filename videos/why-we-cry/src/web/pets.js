// The other animals on (and behind) the couch (why-we-cry): his dog, who is the backup, and the elephant in the room.
// Both are drawn with flat shapes for the cinematic look: call them inside actor(...); their faces are paint.
'use strict';

const PUP = { fur: '#D9A066', furSh: '#B57B45', white: '#FFF4E6', ear: '#7A4A26', nose: '#1E1410', collar: '#E8384F', tag: '#FFD447', tongue: '#FF7A90' };

// a point of the dog's head (head space: the middle of its skull is 0, 0) in world coords
function pupHead(x, y, s, o = {}) { return [x + (o.dx || 0) * s + (o.headDX || 0) * s, y + (-232 + (o.headDY || 0)) * s]; }
function pupPt(x, y, s, o, lx, ly) {
  const h = pupHead(x, y, s, o), a = o.tilt || 0, cs = Math.cos(a), sn = Math.sin(a);
  return [h[0] + (lx * cs - ly * sn) * s, h[1] + (lx * sn + ly * cs) * s];
}
// The dog, sitting, seen from the front; (x, y) = the middle of its base. o: {dx (the whole dog leans over, in its own
// units), tilt (head), headDX, headDY, look: [x, y], ears: -1 (blown back) .. 0 .. 1 (pricked), blink 0..1, wide 0..1,
// mouth: 'shut' | 'pant' | 'lick' (tongue out to one side: lickX, lickY in head units), wag, paw 0..1 (a front paw
// lifted to the left), wet 0..1 (drops on its head), smug 0..1}
function pupDraw(c, x, y, s, t, o = {}) {
  const F = PUP, lean = (o.dx || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  // tail
  const wag = Math.sin(t * 15) * 0.5 * clamp(o.wag || 0);
  c.save(); c.translate(70, -30); c.rotate(0.42 + wag);
  c.lineCap = 'round'; c.lineWidth = 20; c.strokeStyle = F.furSh; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(22, -40, 6, -84); c.stroke();
  c.lineWidth = 16; c.strokeStyle = F.white; c.beginPath(); c.moveTo(10, -66); c.quadraticCurveTo(10, -76, 6, -86); c.stroke(); c.restore();
  // haunches, body, chest
  ellipse(c, -56, -44, 52, 46, F.furSh); ellipse(c, 56, -44, 52, 46, F.furSh);
  c.beginPath(); c.moveTo(-62 + lean * 0.1, -6); c.quadraticCurveTo(-78 + lean * 0.6, -150, lean, -186); c.quadraticCurveTo(78 + lean * 0.6, -150, 62 + lean * 0.1, -6); c.closePath();
  c.fillStyle = F.fur; c.fill();
  c.beginPath(); c.moveTo(-30 + lean * 0.2, -22); c.quadraticCurveTo(-40 + lean * 0.6, -128, lean, -150); c.quadraticCurveTo(40 + lean * 0.6, -128, 30 + lean * 0.2, -22); c.closePath();
  c.fillStyle = F.white; c.fill();
  // front legs + paws (the left one can lift and reach across)
  const paw = clamp(o.paw || 0);
  for (const sd of [-1, 1]) {
    if (sd < 0 && paw > 0.02) {
      const sx = -26 + lean * 0.5, sy = -96, ex = sx - 54 * paw + (o.pawX || 0) * paw, ey = lerp(-4, -118 + (o.pawY || 0), paw);
      line(c, sx, sy, ex, ey, 30, F.fur); ellipse(c, ex, ey, 21, 16, F.white, -0.4 * paw);
    } else { rrect(c, sd * 27 - 15 + lean * 0.25, -92, 30, 92, 14); c.fillStyle = F.fur; c.fill(); ellipse(c, sd * 27 + lean * 0.2, -4, 21, 12, F.white); }
  }
  // head
  c.translate(lean + (o.headDX || 0), -232 + (o.headDY || 0)); c.rotate(o.tilt || 0);
  // collar + tag (it hangs under the chin)
  rrect(c, -44, 44, 88, 16, 8); c.fillStyle = F.collar; c.fill();
  circle(c, 0, 68, 10, F.tag);
  const ears = o.ears || 0;
  for (const sd of [-1, 1]) {   // ears: they hang, prick up, or fly back
    c.save(); c.translate(sd * 62, -34);
    c.rotate(sd * (0.22 - 0.5 * Math.max(0, ears) + 1.25 * Math.max(0, -ears)) + (ears < 0 ? 0.14 * Math.sin(t * 40 + sd) : 0));
    c.beginPath(); c.ellipse(sd * 10, 46 - 14 * Math.max(0, ears), 26, 56 - 6 * Math.max(0, ears), sd * 0.15, 0, Math.PI * 2); c.fillStyle = F.ear; c.fill(); c.restore();
  }
  ellipse(c, 0, 0, 82, 76, F.fur);
  ellipse(c, 0, 36, 49, 36, F.white);                                   // muzzle
  paint(() => {
    c.beginPath(); c.moveTo(-10, -70); c.quadraticCurveTo(0, -30, -6, 6); c.lineTo(6, 6); c.quadraticCurveTo(0, -30, 10, -70); c.closePath(); c.fillStyle = F.white; c.fill();   // blaze
    const lk = o.look || [0, 0], wide = o.wide || 0;
    for (const sd of [-1, 1]) {
      const ex = sd * 32, ey = -14;
      if ((o.blink || 0) > 0.9) { c.beginPath(); c.moveTo(ex - 12, ey); c.quadraticCurveTo(ex, ey + 8, ex + 12, ey); c.lineWidth = 5; c.strokeStyle = '#2A1A10'; c.lineCap = 'round'; c.stroke(); }
      else {
        if (wide > 0.02) circle(c, ex, ey, 13 + 5 * wide, '#FFFFFF');
        circle(c, ex + lk[0] * (3 + 5 * wide), ey + lk[1] * (3 + 3 * wide), 13 - 3 * wide, '#2A1A10');
        circle(c, ex + lk[0] * (3 + 5 * wide) - 4, ey + lk[1] * 3 - 5, 4.4, '#FFFFFF');
        if ((o.smug || 0) > 0.05) { c.fillStyle = F.fur; c.fillRect(ex - 16, ey - 16, 32, 13 * o.smug + 3); line(c, ex - 14, ey - 3 + 13 * o.smug - 13, ex + 14, ey - 3 + 13 * o.smug - 13, 3, F.furSh); }
      }
      line(c, sd * 20, -38 - 8 * wide - 4 * Math.max(0, ears), sd * 44, -34 - 6 * wide + sd * 0, 6, F.furSh);   // brow
    }
    ellipse(c, 0, 16, 17, 12, F.nose); ellipse(c, -5, 12, 6, 3, 'rgba(255,255,255,0.5)');
    const m = o.mouth || 'shut';
    if (m === 'pant' || m === 'lick') {
      ellipse(c, 0, 48, 17, 10, '#3A0E16');
      const lx = m === 'lick' ? (o.lickX === undefined ? -40 : o.lickX) : 0, ly = m === 'lick' ? (o.lickY === undefined ? 30 : o.lickY) : 66;
      c.lineCap = 'round'; c.lineWidth = 19; c.strokeStyle = F.tongue; c.beginPath(); c.moveTo(0, 48); c.quadraticCurveTo(lx * 0.4, 48 + (ly - 48) * 0.3 + (m === 'lick' ? 14 : 0), lx, ly); c.stroke();
      c.lineWidth = 2.5; c.strokeStyle = 'rgba(160,40,70,0.5)'; c.beginPath(); c.moveTo(0, 50); c.quadraticCurveTo(lx * 0.4, 48 + (ly - 48) * 0.3 + (m === 'lick' ? 14 : 0), lx * 0.9, ly - 2); c.stroke();
    } else {
      c.beginPath(); c.moveTo(0, 27); c.lineTo(0, 40); c.moveTo(-20, 42); c.quadraticCurveTo(-9, 50, 0, 40); c.quadraticCurveTo(9, 50, 20, 42);
      c.lineWidth = 4; c.strokeStyle = F.nose; c.lineCap = 'round'; c.stroke();
    }
    const wet = o.wet || 0;
    if (wet > 0.02) for (let i = 0; i < 5; i++) tearDrop(c, -50 + i * 24 + 6 * Math.sin(i * 7), -58 + 8 * Math.sin(i * 3.1) + 10 * (1 - wet), 5, wet);
  });
  c.restore();
}

// ---------------------------------------------------------------- the elephant in the room
const ELLY = { skin: '#8E9BB8', skinSh: '#6F7C9C', ear: '#A88FB0', tusk: '#FFF4DC', eye: '#1E1A2A' };
// (x, y) = the middle of its forehead. It stands behind the couch, so only its head, its ears and its trunk show.
// o: {look: [x, y], blink, chew 0..1, trunk: [x, y] where the tip of its trunk is (its own units, from the forehead),
// rise 0..1 (it comes up from behind the couch), flap}
function ellyDraw(c, x, y, s, t, o = {}) {
  const K = ELLY, rise = o.rise === undefined ? 1 : o.rise;
  c.save(); c.translate(x, y + 420 * (1 - rise)); c.scale(s, s);
  const flap = 0.1 * Math.sin(t * loopW(2.6)) * (o.flap === undefined ? 1 : o.flap);
  for (const sd of [-1, 1]) {   // ears
    c.save(); c.translate(sd * 150, 10); c.rotate(sd * (0.1 + flap));
    ellipse(c, sd * 92, 20, 130, 176, K.skinSh); ellipse(c, sd * 96, 26, 92, 134, K.ear);
    c.restore();
  }
  // body behind (a hint of back above the couch)
  ellipse(c, 0, 250, 300, 220, K.skinSh);
  // head
  c.beginPath(); c.moveTo(-170, 30); c.quadraticCurveTo(-190, -150, -70, -176); c.quadraticCurveTo(0, -150, 70, -176); c.quadraticCurveTo(190, -150, 170, 30);
  c.quadraticCurveTo(150, 200, 60, 236); c.lineTo(-60, 236); c.quadraticCurveTo(-150, 200, -170, 30); c.closePath();
  c.fillStyle = K.skin; c.fill();
  // tusks
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 62, 214); c.quadraticCurveTo(sd * 96, 300, sd * 132, 286); c.quadraticCurveTo(sd * 100, 262, sd * 92, 206); c.closePath(); c.fillStyle = K.tusk; c.fill(); }
  // trunk: from between the eyes down, then out to its tip
  const tip = o.trunk || [0, 470], chew = (o.chew || 0) * Math.sin(t * 9) * 5;
  const P = [[0, 150], [0, 300 + chew], [tip[0] * 0.25, lerp(300, tip[1], 0.75)], [tip[0], tip[1]]];
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (let i = 0; i < 16; i++) {
    const u0 = i / 16, u1 = (i + 1) / 16;
    const B = (u) => { const a = 1 - u; return [a * a * a * P[0][0] + 3 * a * a * u * P[1][0] + 3 * a * u * u * P[2][0] + u * u * u * P[3][0], a * a * a * P[0][1] + 3 * a * a * u * P[1][1] + 3 * a * u * u * P[2][1] + u * u * u * P[3][1]]; };
    const a = B(u0), b = B(u1);
    line(c, a[0], a[1], b[0], b[1], lerp(118, 54, u0), K.skin);
  }
  paint(() => {
    for (let i = 2; i < 15; i += 2) {   // creases across the trunk
      const u = i / 16, a = 1 - u;
      const px = a * a * a * P[0][0] + 3 * a * a * u * P[1][0] + 3 * a * u * u * P[2][0] + u * u * u * P[3][0], py = a * a * a * P[0][1] + 3 * a * a * u * P[1][1] + 3 * a * u * u * P[2][1] + u * u * u * P[3][1];
      const w = lerp(118, 54, u) * 0.36;
      c.lineWidth = 3; c.strokeStyle = 'rgba(70,80,110,0.35)'; c.beginPath(); c.moveTo(px - w, py - 3); c.quadraticCurveTo(px, py + 5, px + w, py - 3); c.stroke();
    }
    const lk = o.look || [0, 0];
    for (const sd of [-1, 1]) {
      const ex = sd * 98, ey = 26;
      if ((o.blink || 0) > 0.9) { c.beginPath(); c.moveTo(ex - 18, ey); c.quadraticCurveTo(ex, ey + 12, ex + 18, ey); c.lineWidth = 7; c.strokeStyle = K.eye; c.stroke(); }
      else { circle(c, ex, ey, 22, '#FFFFFF'); circle(c, ex + lk[0] * 8, ey + lk[1] * 7, 13, K.eye); circle(c, ex + lk[0] * 8 - 4, ey + lk[1] * 7 - 5, 4.5, '#FFFFFF'); }
      c.lineWidth = 8; c.strokeStyle = K.skinSh; c.beginPath(); c.moveTo(ex - 28, ey - 34); c.quadraticCurveTo(ex, ey - 46, ex + 28, ey - 34); c.stroke();
    }
    c.lineWidth = 4; c.strokeStyle = 'rgba(70,80,110,0.4)';
    c.beginPath(); c.moveTo(-70, -120); c.quadraticCurveTo(0, -100, 70, -120); c.stroke();
  });
  c.restore();
  return [x + tip[0] * s, y + 420 * (1 - rise) + tip[1] * s];
}

// a piece of popcorn, and a striped bucket of it (centre of its top edge)
function popPiece(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  circle(c, r * 0.45, r * 0.35, r * 0.8, '#E3BE78'); circle(c, -r * 0.5, r * 0.2, r * 0.75, '#F1D9A2'); circle(c, 0, -r * 0.35, r * 0.85, '#FFF3D6');
  c.restore();
}
function popTub(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (const [px, py, r] of [[-44, -6, 13], [-18, -18, 15], [12, -22, 15], [40, -8, 13], [-30, 2, 12], [0, -4, 15], [28, 4, 12]]) popPiece(c, px, py, r);
  c.beginPath(); c.moveTo(-78, 0); c.lineTo(78, 0); c.lineTo(58, 138); c.lineTo(-58, 138); c.closePath(); c.fillStyle = '#F4F1EA'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(-78, 0); c.lineTo(78, 0); c.lineTo(58, 138); c.lineTo(-58, 138); c.closePath(); c.clip();
    for (let i = -3; i <= 3; i++) if (i % 2 === 0) { c.beginPath(); c.moveTo(i * 22 - 11, 0); c.lineTo(i * 22 + 11, 0); c.lineTo(i * 16.5 + 8, 140); c.lineTo(i * 16.5 - 8, 140); c.closePath(); c.fillStyle = '#E2424B'; c.fill(); }
    c.restore();
  });
  rrect(c, -82, -8, 164, 16, 8); c.fillStyle = '#FFFFFF'; c.fill();
  c.restore();
}
