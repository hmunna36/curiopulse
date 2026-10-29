// Why Do Wombats Poop CUBES? 🟫 — the bare-nosed wombat and the props.
// wbWombat(c, x, y, s, o): a procedural cartoon wombat in side view, facing right (o.flip = facing left). Local units:
// the origin is on the ground under its middle, up is -y; about 400 long and 200 tall. A barrel of grey-brown fur on four
// stumpy legs, a broad head with a big bare leathery nose, small round ears, small dark eyes. Moods by numbers:
// o = {flip, walk (phase, rad), walkAmt 0..1, lid 0..1 (half-shut = deadpan), brow -1 (glare) .. 1 (raised), look -1 (eye to the
// back: side-eye) .. 1, smile -1..1, chew (seconds clock or null), jaw 0..1, grass 0..1 (a grass blade in its mouth), squash,
// headDY, headRot, glass 0..1 (x-ray: see-through body, the gut inside), hat 0..1 (a little hard hat), crouch 0..1}
// It is a character: actor() round the body (rim light + full drawn shadow), paint() round the face details.
'use strict';

const WBW = { fur: '#8C7A66', furDk: '#6B5B4B', furLt: '#AE9A82', belly: '#B9A68C', nose: '#3B3533', noseHi: '#6A605C',
  ear: '#7A6856', earIn: '#C9A39A', claw: '#EDE2CC', eye: '#1A1210' };

function wbWombat(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  const walk = o.walk || 0, wa = o.walkAmt || 0, sq = o.squash || 0, glass = clamp(o.glass || 0);
  const bob = wa * 5 * Math.abs(Math.sin(walk));
  c.translate(0, -bob);
  c.scale(1 + 0.06 * sq, 1 - 0.08 * sq);
  const X = glass > 0.5;   // x-ray: a dark see-through body with a glowing outline, the gut inside
  const FUR = X ? '#0E2438' : WBW.fur, FURDK = X ? '#0B1C2E' : WBW.furDk;
  const leg = (lx, ph, far) => {
    const sw = wa * 14 * Math.sin(walk + ph), lift = wa * 6 * Math.max(0, Math.sin(walk + ph));
    const col = far ? FURDK : FUR;
    line(c, lx, -58, lx + sw * 0.6, -16 - lift, 50, col);
    c.beginPath(); c.ellipse(lx + sw + 8, -11 - lift, 30, 14, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill();
    if (!far && !X) paint(() => { for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(lx + sw + 26 + k * 2, -16 + k * 5 - lift); c.lineTo(lx + sw + 37 + k * 2, -12 + k * 5 - lift); c.lineWidth = 3.5; c.lineCap = 'round'; c.strokeStyle = WBW.claw; c.stroke(); } });
  };
  // the body: a chunky loaf, the round rump at the back, a broad chest, stubby legs
  const body = () => {
    c.beginPath();
    c.moveTo(-140, -84);
    c.bezierCurveTo(-152, -176, -82, -210, 2, -206);            // rump up over the back
    c.bezierCurveTo(74, -204, 118, -178, 128, -134);            // the back to the shoulders
    c.bezierCurveTo(136, -86, 120, -44, 92, -36);               // the chest
    c.bezierCurveTo(30, -24, -62, -24, -108, -34);              // the belly
    c.bezierCurveTo(-136, -42, -144, -60, -140, -84);           // up the back of the rump
    c.closePath();
  };
  actor(() => {
    leg(98, Math.PI, true); leg(-70, 0, true);
    body();
    if (X) { c.fillStyle = FUR; c.fill(); }
    else {
      const g = c.createLinearGradient(0, -206, 0, -26);
      g.addColorStop(0, WBW.furDk); g.addColorStop(0.42, WBW.fur); g.addColorStop(1, WBW.belly);
      c.fillStyle = g; c.fill();
    }
    leg(76, 0.6, false); leg(-92, Math.PI + 0.6, false);
    c.save(); c.translate(140, -122 + (o.headDY || 0)); c.rotate(o.headRot || 0); c.scale(1.22, 1.22);
    wbHead(c, o, X);
    c.restore();
  });
  if (!X) paint(() => {   // coarse fur: strokes sticking out along the back, a few inside
    const rng = mulberry32(5);
    for (let i = 0; i < 54; i++) {
      const u = i / 54, ax = lerp(-146, 124, u), ay = -84 - 120 * Math.sin(Math.PI * (0.1 + 0.8 * u)) + 4;
      const len = 9 + rng() * 11, a = -2.3 + u * 1.5 + (rng() - 0.5) * 0.5;
      c.beginPath(); c.moveTo(ax, ay + 8); c.lineTo(ax + Math.cos(a) * len, ay + 8 + Math.sin(a) * len);
      c.lineWidth = 2.6; c.lineCap = 'round'; c.strokeStyle = rng() < 0.55 ? 'rgba(74,62,50,0.6)' : 'rgba(208,192,166,0.5)'; c.stroke();
    }
    for (let i = 0; i < 30; i++) {
      const ax = -116 + rng() * 210, ay = -176 + rng() * 120;
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + 7 + rng() * 6, ay + 4 + rng() * 4);
      c.lineWidth = 1.8; c.strokeStyle = 'rgba(70,58,46,0.35)'; c.stroke();
    }
  });
  if (glass > 0.01) {   // the glowing outline and the gut inside (paint: it has no light of its own)
    paint(() => {
      c.globalAlpha = glass;
      body(); c.lineWidth = 5; c.strokeStyle = '#7FE9FF'; c.stroke();
      wbGutXray(c, o.gutT || 0, o.gutPhase || 0, o.cubesBig || 0);
      c.globalAlpha = 1;
    });
  }
  if ((o.hat || 0) > 0.01) {   // a little hard hat on its head
    c.save(); c.translate(140, -122 + (o.headDY || 0) - 78 - 220 * (1 - o.hat)); c.rotate(o.headRot || 0);
    wbHardHat(c, 4, -2, 0.7, '#FF8A1E');
    c.restore();
  }
  c.restore();
}

// its head in head units: the origin at the middle of the skull, the snout to +x
function wbHead(c, o, glass) {
  const jaw = clamp(o.jaw || 0), chew = o.chew;
  const chewK = chew == null ? 0 : 0.5 + 0.5 * Math.sin(chew * 13);
  const j = Math.max(jaw, 0.35 * chewK);
  // ears (far ear, then the skull, then the near ear)
  const ear = (ex, ey, far) => {
    c.beginPath(); c.moveTo(ex - 14, ey + 10); c.quadraticCurveTo(ex - 16, ey - 22, ex, ey - 26); c.quadraticCurveTo(ex + 16, ey - 20, ex + 12, ey + 10); c.closePath();
    c.fillStyle = glass ? '#0B1C2E' : (far ? WBW.furDk : WBW.ear); c.fill();
    if (!far) paint(() => { c.beginPath(); c.moveTo(ex - 7, ey + 4); c.quadraticCurveTo(ex - 8, ey - 14, ex, ey - 17); c.quadraticCurveTo(ex + 8, ey - 12, ex + 6, ey + 4); c.closePath(); c.fillStyle = WBW.earIn; c.fill(); });
  };
  ear(-36, -46, true);
  // skull + muzzle: a broad rounded block
  c.beginPath();
  c.moveTo(-60, 10);
  c.bezierCurveTo(-70, -40, -30, -62, 10, -58);
  c.bezierCurveTo(40, -56, 62, -40, 70, -20);
  c.bezierCurveTo(76, -8, 74, 14 + 10 * j, 60, 26 + 10 * j);
  c.bezierCurveTo(30, 40 + 8 * j, -30, 44, -60, 10);
  c.closePath();
  c.fillStyle = glass ? '#0E2438' : WBW.fur; c.fill();
  if (glass) paint(() => { c.lineWidth = 4; c.strokeStyle = '#7FE9FF'; c.stroke(); });
  ear(-22, -50, false);
  // the bare nose: a big leathery pad
  c.beginPath(); c.ellipse(64, -6, 25, 21, 0.15, 0, Math.PI * 2); c.fillStyle = glass ? '#13283C' : WBW.nose; c.fill();
  paint(() => {
    // nostrils and the leathery texture
    c.beginPath(); c.ellipse(76, 2, 4, 6, 0.4, 0, 7); c.fillStyle = '#17110F'; c.fill();
    c.beginPath(); c.ellipse(60, 6, 4, 5, 0.2, 0, 7); c.fill();
    c.beginPath(); c.ellipse(60, -16, 9, 4, -0.2, 0, 7); c.fillStyle = WBW.noseHi; c.fill();
    const rng = mulberry32(3);
    for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(50 + rng() * 30, -20 + rng() * 26, 1.3, 0, 7); c.fillStyle = 'rgba(20,16,14,0.5)'; c.fill(); }
    // the mouth: a short line under the nose, open by `jaw`
    c.beginPath(); c.moveTo(62, 22 + 6 * j); c.quadraticCurveTo(48, 26 + 8 * j + 4 * (o.smile || 0), 36, 22 + 4 * j - 6 * (o.smile || 0));
    c.lineWidth = 3; c.lineCap = 'round'; c.strokeStyle = '#2A201C'; c.stroke();
    if (j > 0.15) { c.beginPath(); c.ellipse(52, 26 + 6 * j, 10, 5 * j, 0, 0, 7); c.fillStyle = '#5A2A28'; c.fill(); }
    // a grass blade hanging from its mouth while it chews
    if ((o.grass || 0) > 0.01) {
      const ga = 0.3 + 0.15 * chewK;
      c.beginPath(); c.moveTo(44, 24 + 4 * j); c.quadraticCurveTo(30, 40, 20 + 10 * Math.sin(ga), 62 + 6 * chewK);
      c.lineWidth = 4.5; c.strokeStyle = '#B9C46A'; c.stroke();
      c.beginPath(); c.moveTo(48, 24 + 4 * j); c.quadraticCurveTo(60, 40, 70, 56 - 4 * chewK);
      c.lineWidth = 3.5; c.strokeStyle = '#8FA24E'; c.stroke();
    }
    // the eye: small, dark, a highlight; lids for a deadpan, a brow line for a glare or a raised look
    const lid = clamp(o.lid || 0), look = clamp(o.look || 0, -1, 1), brow = clamp(o.brow || 0, -1, 1);
    const ex = 20, ey = -22;
    c.beginPath(); c.ellipse(ex, ey, 9, 9, 0, 0, 7); c.fillStyle = '#F4EFE6'; c.fill();
    c.beginPath(); c.arc(ex + 3 * look, ey + 1, 6.5, 0, 7); c.fillStyle = WBW.eye; c.fill();
    c.beginPath(); c.arc(ex + 3 * look + 2, ey - 2, 2, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
    if (lid > 0.01) {
      c.beginPath(); c.moveTo(ex - 11, ey - 11); c.lineTo(ex + 11, ey - 11); c.lineTo(ex + 11, ey - 11 + 20 * lid); c.quadraticCurveTo(ex, ey - 8 + 22 * lid, ex - 11, ey - 11 + 20 * lid); c.closePath();
      c.fillStyle = WBW.fur; c.fill();
      c.beginPath(); c.moveTo(ex - 11, ey - 11 + 20 * lid); c.quadraticCurveTo(ex, ey - 8 + 22 * lid, ex + 11, ey - 11 + 20 * lid);
      c.lineWidth = 2.5; c.strokeStyle = '#3A2E26'; c.stroke();
    }
    c.beginPath(); c.moveTo(ex - 14, ey - 14 - 6 * brow + (brow < 0 ? 8 * -brow : 0)); c.lineTo(ex + 12, ey - 15 - 6 * brow - (brow < 0 ? 4 * brow : 0));
    c.lineWidth = 4.5; c.lineCap = 'round'; c.strokeStyle = '#3A2E26'; c.stroke();
    // whisker dots
    for (const [wx, wy] of [[42, 6], [46, 14], [38, 12]]) { c.beginPath(); c.arc(wx, wy, 1.6, 0, 7); c.fillStyle = 'rgba(40,30,24,0.6)'; c.fill(); }
  });
}

// the gut inside the wombat (body units; the x-ray): the stomach up front, the long coils, then the colon to the rump.
// The stuff inside starts as a yellow-green slurry and darkens; in the last part it is brown CUBES in a row.
function wbGutPath() {
  const P = [];
  P.push([96, -132]); P.push([70, -150]); P.push([40, -140]);                 // the stomach to the small gut
  for (let k = 0; k < 4; k++) {                                              // the coils, front to back
    const cx = 22 - k * 34, cy = -104 + (k % 2) * 14;
    for (let a = 0; a <= 14; a++) { const u = a / 14 * Math.PI * 2; P.push([cx + 19 * Math.cos(u + k * 1.3), cy + 24 * Math.sin(u + k * 1.3)]); }
  }
  // the colon: up and forward along the top, then back along the top and down into the rump
  P.push([-104, -96]); P.push([-118, -128]); P.push([-92, -168]); P.push([-30, -182]); P.push([40, -178]); P.push([70, -164]);
  P.push([60, -150]); P.push([0, -160]); P.push([-60, -158]); P.push([-104, -150]); P.push([-128, -126]); P.push([-136, -98]);
  return P;
}
// cubesBig 0..1: the last part's cubes drawn bigger and lit (the lens looks at them)
function wbGutXray(c, t, phase, cubesBig = 0) {
  const P = wbGutPath();
  const acc = polyLen(P), len = acc[acc.length - 1];
  c.save();
  c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (const p of P) c.lineTo(p[0], p[1]);
  c.lineWidth = 24; c.strokeStyle = 'rgba(255,140,170,0.9)'; c.stroke();
  c.lineWidth = 16; c.strokeStyle = '#5A1630'; c.stroke();
  // the contents travel along: a yellow-green slurry, darker round lumps, then CUBES in the last 17 %
  const n = 40;
  for (let i = 0; i < n; i++) {
    const u = ((i + phase) / n) % 1;
    const p = polyAt(P, acc, u * len);
    if (u < 0.5) { c.beginPath(); c.arc(p[0], p[1], 5, 0, 7); c.fillStyle = mixH('#D8D070', '#9A7A40', u / 0.5); c.fill(); }
    else if (u < 0.83) { c.beginPath(); c.arc(p[0], p[1], 6.5, 0, 7); c.fillStyle = mixH('#8A6A3A', '#5E4024', (u - 0.5) / 0.33); c.fill(); }
    else {
      const s = 12 + 4 * cubesBig;
      c.save(); c.translate(p[0], p[1]); c.rotate(p[2]);
      c.fillStyle = '#6A4626'; c.fillRect(-s / 2, -s / 2, s, s);
      c.lineWidth = 2; c.strokeStyle = '#FFD9A0'; c.strokeRect(-s / 2, -s / 2, s, s);
      c.restore();
    }
  }
  c.restore();
}

// a cube of wombat poop: a little rounded brick of packed grass, seen three-quarter (top, front, right side). s = its edge
// in world units; rot = a roll in radians; o = {wet 0..1 (sheen), flag 0..1 (the note on a toothpick: MINE.), dust}
function wbCube(c, x, y, s, rot = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const h = s / 2, d = s * 0.32;
  // right side (darker), top (lighter), front (base): one rounded outline each, drawn back to front
  const face = (pts, col) => {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]); c.closePath();
    c.lineJoin = 'round'; c.lineWidth = s * 0.16; c.strokeStyle = col; c.stroke(); c.fillStyle = col; c.fill();
  };
  face([[h, -h], [h + d, -h - d * 0.8], [h + d, h - d * 0.8], [h, h]], '#3F2A1A');
  face([[-h, -h], [-h + d, -h - d * 0.8], [h + d, -h - d * 0.8], [h, -h]], '#7A5634');
  face([[-h, -h], [h, -h], [h, h], [-h, h]], '#5C3E25');
  paint(() => {   // packed grass fibres and specks, a sheen on the top edge
    const rng = mulberry32(Math.round(s * 7) + 11);
    for (let i = 0; i < 9; i++) {
      const fx = -h + rng() * s, fy = -h + rng() * s, a = rng() * 3.14;
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.cos(a) * s * 0.18, fy + Math.sin(a) * s * 0.18);
      c.lineWidth = Math.max(1, s * 0.03); c.strokeStyle = rng() < 0.5 ? 'rgba(170,150,90,0.6)' : 'rgba(40,26,14,0.55)'; c.stroke();
    }
    c.beginPath(); c.moveTo(-h + s * 0.08, -h - s * 0.02); c.lineTo(h - s * 0.06, -h - s * 0.02);
    c.lineWidth = Math.max(1, s * 0.05); c.strokeStyle = `rgba(255,230,190,${0.35 + 0.3 * (o.wet || 0)})`; c.stroke();
  });
  c.restore();
  if ((o.flag || 0) > 0.01) wbFlag(c, x + s * 0.1, y - s * 0.5, s, o.flag, o.flagText || 'MINE.');
}

// the note: a little paper flag on a toothpick stuck in the cube (it pops up with outBack). s = the cube's size
function wbFlag(c, x, y, s, k, txt) {
  const kk = E.outBack(clamp(k), 2.2), L = s * 1.9 * kk, fw = s * 2.1, fh = s * 1.05;
  c.save(); c.translate(x, y);
  line(c, 0, 0, 0, -L, Math.max(2, s * 0.08), '#E8D3A6');
  if (kk > 0.3) {
    c.save(); c.translate(0, -L); c.rotate(-0.06 + 0.05 * Math.sin(k * 9)); c.scale(clamp(kk), clamp(kk));
    c.beginPath(); c.moveTo(0, 0); c.lineTo(fw, fh * 0.12); c.lineTo(fw * 0.94, fh * 0.55); c.lineTo(fw, fh); c.lineTo(0, fh); c.closePath();
    c.fillStyle = '#FFF8E8'; c.fill();
    paint(() => {
      c.font = `900 ${Math.round(fh * 0.56)}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#3A2A1E'; c.fillText(txt, fw * 0.47, fh * 0.55);
    });
    c.restore();
  }
  c.restore();
}

// a round brown dough ball (the "round note"): a sphere with a highlight. r = radius
function wbBall(c, x, y, r, spin = 0) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2);
  const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#9A7046'); g.addColorStop(0.6, '#6A4A2C'); g.addColorStop(1, '#4A3220');
  c.fillStyle = g; c.fill();
  paint(() => {
    c.rotate(spin);
    for (let i = 0; i < 4; i++) { const a = i * 1.57; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2); c.lineTo(Math.cos(a) * r * 0.65, Math.sin(a) * r * 0.65); c.lineWidth = Math.max(1, r * 0.08); c.strokeStyle = 'rgba(40,26,14,0.45)'; c.stroke(); }
  });
  c.restore();
}

// the magnifying glass: a brass ring, the glass, a wooden handle (it points along ang). r = the lens radius.
// o.fill(fn): draws what the lens shows, clipped to the glass (an opaque disc first, so the light does not see through)
function wbMagnifier(c, x, y, r, ang, o = {}) {
  c.save(); c.translate(x, y);
  // the handle
  const hx = Math.cos(ang), hy = Math.sin(ang);
  line(c, hx * r * 1.05, hy * r * 1.05, hx * r * 2.3, hy * r * 2.3, r * 0.26, '#7A4A28');
  line(c, hx * r * 1.0, hy * r * 1.0, hx * r * 1.25, hy * r * 1.25, r * 0.3, '#C9A050');
  // the glass: an opaque disc first, then what it shows
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fillStyle = o.under || '#C8DCE0'; c.fill();
  if (o.fill) { c.save(); c.beginPath(); c.arc(0, 0, r * 0.98, 0, Math.PI * 2); c.clip(); o.fill(c); c.restore(); }
  paint(() => {
    // a shine across the glass
    c.beginPath(); c.ellipse(-r * 0.32, -r * 0.38, r * 0.42, r * 0.16, -0.6, 0, 7); c.fillStyle = 'rgba(255,255,255,0.28)'; c.fill();
  });
  // the brass ring
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.lineWidth = r * 0.16; c.strokeStyle = '#B88A3A'; c.stroke();
  c.beginPath(); c.arc(0, 0, r * 1.02, -2.4, -0.8); c.lineWidth = r * 0.05; c.strokeStyle = '#F2D48A'; c.stroke();
  c.restore();
}

// a frilly lettuce leaf (the wombat's salad)
function wbLettuce(c, x, y, s, rot = 0, bite = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0);
  for (let a = 0; a <= 20; a++) {
    const u = a / 20, ang = -Math.PI * 0.95 + u * Math.PI * 0.9, rr = 46 + 8 * Math.sin(a * 2.3);
    if (bite > 0.01 && u > 0.6) { const b = 1 - bite * 0.45 * Math.sin((u - 0.6) / 0.4 * Math.PI); c.lineTo(Math.cos(ang) * rr * b, Math.sin(ang) * rr * b); }
    else c.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  c.closePath(); c.fillStyle = '#8BCB4E'; c.fill();
  paint(() => {
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-10, -24, -18, -40); c.lineWidth = 4; c.strokeStyle = '#D8F0A8'; c.stroke();
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-6 - k * 3, -10 - k * 8); c.lineTo(-24 - k * 5, -6 - k * 10); c.lineWidth = 2; c.stroke(); }
  });
  c.restore();
}

// a hard hat (dome, brim, a ridge), centred on its brim; s = scale (1 = the hiker's head)
function wbHardHat(c, x, y, s, col = '#FFC93A') {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 90, 16, 0, 0, Math.PI * 2); c.fillStyle = mixH(col, '#A06A10', 0.35); c.fill();
  c.beginPath(); c.moveTo(-70, 0); c.bezierCurveTo(-70, -80, 70, -80, 70, 0); c.closePath(); c.fillStyle = col; c.fill();
  paint(() => {
    line(c, 0, -58, 0, -4, 10, mixH(col, '#FFFFFF', 0.35));
    c.beginPath(); c.ellipse(-30, -40, 18, 8, -0.6, 0, 7); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();
  });
  c.restore();
}

// a clipboard with a sheet and a steel clip
function wbClipboard(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -46, -62, 92, 124, 8); c.fillStyle = '#A5713C'; c.fill();
  rrect(c, -38, -50, 76, 104, 3); c.fillStyle = '#F6F2E8'; c.fill();
  paint(() => { for (let k = 0; k < 5; k++) line(c, -28, -30 + k * 16, 26 - (k % 2) * 14, -30 + k * 16, 3, 'rgba(60,70,110,0.55)'); });
  rrect(c, -20, -70, 40, 18, 5); c.fillStyle = '#B7BCC8'; c.fill();
  c.restore();
}
