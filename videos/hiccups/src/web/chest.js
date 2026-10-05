// Hiccups Short: his body in section, from the front, x-ray style. Mouth and throat, the voice box with the vocal cords
// drawn as a pair of little doors (hinged on the walls of the airway, they swing shut across it), the windpipe, two
// lungs, the dome of the diaphragm under them (with a face: the breathing muscle is the one being poked), and the
// stomach under its left half (our right), filling with soda. Air is drawn as cyan particles and as puffs with faces.
// Local coordinates: x = 0 on his midline, y = 0 about where the diaphragm's dome ends; the shots place it with
// sectionCam (v = {x, y, s}: local -> world). Nothing here is timed.
'use strict';

const BX = { larynx: [0, -560], half: 34, mouth: [0, -728], carina: [0, -360], stom: [150, 240] };

function initChest() {}

// the diaphragm's centre line at x. o: {drop 0..1 (0 = relaxed dome, 1 = pulled flat), poke 0..1 (the stomach prods it from below)}
function bxDiaY(x, o = {}) {
  const h = lerp(104, 12, o.drop || 0);
  const s = Math.pow(Math.max(0, Math.cos(Math.PI * x / 568)), 0.7) - 0.15 * Math.exp(-Math.pow(x / 62, 2));
  return 52 - h * s - (o.poke || 0) * 24 * Math.exp(-Math.pow((x - 176) / 62, 2));
}
function bxSmooth(c, P, close = true) {
  const n = P.length;
  c.beginPath();
  if (close) {
    c.moveTo((P[n - 1][0] + P[0][0]) / 2, (P[n - 1][1] + P[0][1]) / 2);
    for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    c.closePath();
  } else {
    c.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < n - 1; i++) c.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2);
    c.lineTo(P[n - 1][0], P[n - 1][1]);
  }
}
function bxLungPts(sd, o) {
  const m = (x) => sd * x, by = (x) => bxDiaY(sd * x, o) - 30, w = 1 + 0.035 * (o.drop || 0);
  const P = [[m(92), -338], [m(150 * w), -326], [m(214 * w), -276], [m(256 * w), -190], [m(266 * w), -90], [m(262 * w), by(262) - 30], [m(256 * w), by(256)]];
  for (let x = 220; x >= 60; x -= 40) P.push([m(x), by(x)]);
  P.push([m(40), by(40)], [m(34), by(34) - 40], [m(30), -160], [m(42), -256], [m(64), -318]);
  return P;
}
// the stomach's outline (local), swollen by `sw` 0..1 about its bottom; `poke` jabs its top up
function bxStomPath(c, sw = 0, poke = 0, down = 0) {
  const ox = BX.stom[0], oy = BX.stom[1] + down, k = 1 + 0.30 * sw, T = (x, y) => [ox + (x - 150) * k, oy + (y - 240) * (k + (y < 150 ? 0.10 * poke * (150 - y) / 90 : 0))];
  const pts = [[96, 78], [112, 46], [196, 40], [236, 86], [262, 150], [240, 214], [170, 244], [96, 236], [56, 224], [34, 212], [34, 184], [70, 190], [112, 178], [134, 146], [124, 104]].map((p) => T(p[0], p[1]));
  bxSmooth(c, pts);
  return T;
}

// one pair of doors across an airway: hinges at (cx -/+ half, cy), the leaves meet in the middle when k = 1 and hang along
// the walls (pointing the way the air flows, +y) when k = 0. hit 0..1 flashes them.
function bxDoorPair(c, cx, cy, half, k, hit = 0) {
  for (const sd of [-1, 1]) {
    c.save(); c.translate(cx + sd * half, cy); c.scale(-sd, 1); c.rotate((1 - k) * 1.36);
    const L = half - 0.6, th = half * 0.42;
    rrect(c, -1, -th / 2, L + 1, th, th * 0.28);
    const g = c.createLinearGradient(0, -th / 2, 0, th / 2); g.addColorStop(0, '#FFD873'); g.addColorStop(0.55, '#EDB13F'); g.addColorStop(1, '#B9791F');
    c.fillStyle = g; c.fill(); c.lineWidth = half * 0.06; c.strokeStyle = '#6E430E'; c.stroke();
    for (const px of [0.36, 0.68]) line(c, L * px, -th / 2 + 1, L * px, th / 2 - 1, half * 0.035, 'rgba(110,67,14,0.6)');
    circle(c, L * 0.84, 0, th * 0.17, '#FFF6CF'); circle(c, L * 0.84, 0, th * 0.08, '#8A5A12');
    if (hit > 0.01) { rrect(c, -1, -th / 2, L + 1, th, th * 0.28); c.fillStyle = `rgba(255,255,255,${0.45 * Math.min(1, hit)})`; c.fill(); }
    circle(c, 0, 0, th * 0.42, '#5B6B86'); circle(c, 0, 0, th * 0.2, '#C9D6EC');
    c.restore();
  }
}

// a puff of breath with a face. r = size; o: {sq 0..1 (squashed flat against something), dizzy 0..1, look: [x, y], a (alpha), scared 0..1}
function bxPuff(c, x, y, r, t, o = {}) {
  const sq = o.sq || 0, a = o.a === undefined ? 1 : o.a;
  if (a <= 0.01) return;
  c.save(); c.translate(x, y + r * 0.34 * sq); c.scale(1 + 0.42 * sq, 1 - 0.46 * sq); c.globalAlpha = a;
  const blobs = [[-0.52, 0.12, 0.6], [0.52, 0.14, 0.58], [0, -0.3, 0.72], [0, 0.26, 0.66], [-0.3, -0.2, 0.52], [0.32, -0.18, 0.5]];
  for (const [px, py, pr] of blobs) circle(c, px * r, py * r, pr * r + r * 0.07, '#5FCBEA');
  for (const [px, py, pr] of blobs) circle(c, px * r + r * 0.02 * Math.sin(t * 5 + px * 9), py * r, pr * r, '#E4FAFF');
  const lk = o.look || [0, 0.4], dz = o.dizzy || 0, sc = o.scared || 0;
  for (const sd of [-1, 1]) {
    const ex = sd * r * 0.3, ey = -r * 0.06;
    if (dz > 0.5) { line(c, ex - r * 0.11, ey - r * 0.11, ex + r * 0.11, ey + r * 0.11, r * 0.06, '#15335A'); line(c, ex + r * 0.11, ey - r * 0.11, ex - r * 0.11, ey + r * 0.11, r * 0.06, '#15335A'); }
    else { ellipse(c, ex, ey, r * 0.15, r * (0.19 + 0.06 * sc), '#FFFFFF'); circle(c, ex + lk[0] * r * 0.05, ey + lk[1] * r * 0.06, r * (0.09 - 0.02 * sc), '#15335A'); }
  }
  if (dz > 0.5) { c.beginPath(); c.moveTo(-r * 0.16, r * 0.34); c.quadraticCurveTo(-r * 0.05, r * 0.26, 0, r * 0.34); c.quadraticCurveTo(r * 0.05, r * 0.42, r * 0.16, r * 0.34); c.lineWidth = r * 0.06; c.lineCap = 'round'; c.strokeStyle = '#15335A'; c.stroke(); }
  else ellipse(c, 0, r * 0.32, r * (0.08 + 0.07 * sc), r * (0.06 + 0.12 * sc), '#15335A');
  c.restore();
}

// The whole section. v = {x, y, s}. o: {drop, poke, swell, fill 0..1 (soda in the stomach), pour 0..1 (a stream still coming down the gullet),
//   door 0..1 (0 open, 1 shut), doorHit, air 0..1 (how much air is drawn), flow (phase: the air moves down as it grows), jam 0..1 (the air above
//   the shut doors piles up on them), mood 0 calm / 1 annoyed / 2 shocked (the diaphragm's face), lungGlow, puffs: [{y, r, sq, dizzy, a, x}]}
function chestXray(v, t, o = {}) {
  const c = ctx, drop = o.drop || 0, poke = o.poke || 0, sw = o.swell || 0, dO = { drop, poke }, sdn = 66 * clamp(drop, 0, 1.15);
  const G = (fn) => { gctx.save(); gctx.setTransform(0.5 * v.s, 0, 0, 0.5 * v.s, 0.5 * v.x, 0.5 * v.y); fn(gctx); gctx.restore(); };
  c.save(); c.translate(v.x, v.y); c.scale(v.s, v.s);
  // ---- the body's outline
  const body = () => {
    c.beginPath(); c.moveTo(-64, -690); c.lineTo(-64, -588); c.quadraticCurveTo(-96, -548, -262, -524); c.quadraticCurveTo(-338, -506, -330, -400);
    c.lineTo(-284, 70); c.quadraticCurveTo(-300, 240, -290, 420); c.lineTo(-300, 1300); c.lineTo(300, 1300); c.lineTo(290, 420); c.quadraticCurveTo(300, 240, 284, 70); c.lineTo(330, -400);
    c.quadraticCurveTo(338, -506, 262, -524); c.quadraticCurveTo(96, -548, 64, -588); c.lineTo(64, -690); c.closePath();
  };
  body(); c.fillStyle = 'rgba(34,78,160,0.32)'; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(127,233,255,0.7)'; c.stroke();
  G((g) => { g.lineWidth = 12; g.strokeStyle = 'rgba(80,180,255,0.3)'; g.beginPath(); g.moveTo(-262, -524); g.quadraticCurveTo(-338, -506, -330, -400); g.lineTo(-284, 70); g.moveTo(262, -524); g.quadraticCurveTo(338, -506, 330, -400); g.lineTo(284, 70); g.stroke(); });
  // the head: his hair, his eyes, an open mouth
  c.beginPath(); c.ellipse(0, -812, 150, 164, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(40,90,176,0.5)'; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(127,233,255,0.7)'; c.stroke();
  c.save(); c.translate(0, -818); c.scale(2.34, 2.34);
  c.beginPath(); c.moveTo(-66, 10); c.quadraticCurveTo(-74, -54, -30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(76, -44, 66, 10);
  c.quadraticCurveTo(60, -22, 32, -36); c.quadraticCurveTo(2, -26, -20, -42); c.quadraticCurveTo(-52, -30, -66, 10); c.closePath();
  c.fillStyle = 'rgba(14,26,84,0.78)'; c.fill();
  for (const sd of [-1, 1]) { ellipse(c, sd * 24, -2, 13, 16, 'rgba(235,246,255,0.92)'); circle(c, sd * 24, 4, 6.5, '#0C1A4A'); line(c, sd * 11, -34, sd * 37, -30, 7, 'rgba(14,26,84,0.85)'); }
  c.restore();
  // faint ribs
  for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) {
    const y = -470 + i * 62;
    c.beginPath(); c.moveTo(sd * 22, y); c.quadraticCurveTo(sd * 250, y - 34 + i * 7, sd * (296 - i * 5), y + 78);
    c.lineWidth = 9; c.strokeStyle = 'rgba(200,230,255,0.10)'; c.stroke();
  }
  // ---- the gullet, behind everything: down to the stomach
  const gul = [[16, -640], [20, -500], [30, -300], [62, -90], [88, bxDiaY(88, dO) + 30], [BX.stom[0] - 54 * (1 + 0.3 * sw) + 4, BX.stom[1] + sdn - 168 * (1 + 0.3 * sw)]];
  bxSmooth(c, gul, false); c.lineWidth = 22; c.lineCap = 'round'; c.strokeStyle = '#8E3A52'; c.stroke(); c.lineWidth = 14; c.strokeStyle = '#C96A84'; c.stroke();
  if ((o.pour || 0) > 0.01) { c.save(); c.setLineDash([26, 30]); c.lineDashOffset = -t * 420; bxSmooth(c, gul, false); c.lineWidth = 9; c.strokeStyle = rgba(DN_SODA[1], 0.95 * o.pour); c.stroke(); c.restore(); }
  // ---- the lungs
  for (const sd of [-1, 1]) {
    const P = bxLungPts(sd, dO);
    bxSmooth(c, P);
    const lg = c.createRadialGradient(sd * 120, -250, 20, sd * 150, -170, 300); lg.addColorStop(0, '#FFC1CE'); lg.addColorStop(0.6, '#F0889F'); lg.addColorStop(1, '#C85C7C');
    c.fillStyle = lg; c.fill(); c.lineWidth = 6; c.strokeStyle = '#8A2F52'; c.stroke();
    c.save(); bxSmooth(c, P); c.clip();
    // bronchi inside
    const br = [[sd * 58, -296], [sd * 110, -262], [sd * 150, -210]], yb = bxDiaY(sd * 150, dO);
    c.lineCap = 'round'; c.strokeStyle = 'rgba(232,248,255,0.85)';
    c.lineWidth = 13; bxSmooth(c, [[sd * 20, -340], ...br], false); c.stroke();
    for (const [a, bx2, by2, w2] of [[1, 196, -292, 8], [1, 226, -200, 8], [2, 208, -120, 7], [2, 150, lerp(-110, -70, drop), 8], [2, 96, lerp(-130, -80, drop), 7], [1, 96, -200, 6]]) {
      c.lineWidth = w2; c.beginPath(); c.moveTo(br[a][0], br[a][1]); c.quadraticCurveTo((br[a][0] + sd * bx2) / 2 + sd * 10, (br[a][1] + by2) / 2 - 12, sd * bx2, by2); c.stroke();
    }
    c.beginPath(); c.moveTo(sd * 262, -210); c.quadraticCurveTo(sd * 150, -150, sd * 44, yb - 110); c.lineWidth = 4; c.strokeStyle = 'rgba(138,47,82,0.45)'; c.stroke();
    if ((o.lungGlow || 0) > 0.01) { c.fillStyle = `rgba(160,235,255,${0.3 * o.lungGlow})`; c.fillRect(sd < 0 ? -300 : 0, -360, 300, 460); }
    c.restore();
  }
  // ---- the windpipe, the voice box, the throat, the mouth
  const [lx, ly] = BX.larynx, hf = BX.half;
  line(c, -72, -326, -18, -356, 30, '#E7B6C6'); line(c, 72, -326, 18, -356, 30, '#E7B6C6');          // the two main branches
  line(c, -72, -326, -18, -356, 16, '#0B1F3F'); line(c, 72, -326, 18, -356, 16, '#0B1F3F');
  c.beginPath(); c.moveTo(-30, -508); c.lineTo(30, -508); c.lineTo(30, -352); c.quadraticCurveTo(0, -330, -30, -352); c.closePath(); c.fillStyle = '#E7B6C6'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#A8627E'; c.stroke();
  c.beginPath(); c.moveTo(-20, -512); c.lineTo(20, -512); c.lineTo(20, -356); c.quadraticCurveTo(0, -342, -20, -356); c.closePath(); c.fillStyle = '#0B1F3F'; c.fill();
  for (let y = -494; y < -366; y += 24) for (const sd of [-1, 1]) line(c, sd * 21, y, sd * 30, y, 9, '#C98AA4');    // cartilage rings
  // the voice box: a shield of cartilage with the airway through it
  c.beginPath(); c.moveTo(-66, -628); c.quadraticCurveTo(0, -646, 66, -628); c.lineTo(50, -506); c.quadraticCurveTo(0, -492, -50, -506); c.closePath();
  const vg = c.createLinearGradient(-66, 0, 66, 0); vg.addColorStop(0, '#FFF3DC'); vg.addColorStop(0.5, '#EAD6B0'); vg.addColorStop(1, '#BFA37A');
  c.fillStyle = vg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#8C6F44'; c.stroke();
  c.beginPath(); c.moveTo(-hf, -636); c.lineTo(hf, -636); c.lineTo(hf, -530); c.quadraticCurveTo(hf - 2, -512, 20, -506); c.lineTo(-20, -506); c.quadraticCurveTo(-hf + 2, -512, -hf, -530); c.closePath(); c.fillStyle = '#0B1F3F'; c.fill();
  // the throat up to the mouth
  c.beginPath(); c.moveTo(-hf - 9, -632); c.lineTo(hf + 9, -632); c.lineTo(hf + 6, -700); c.lineTo(-hf - 6, -700); c.closePath(); c.fillStyle = '#E7B6C6'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#A8627E'; c.stroke();
  c.fillStyle = '#0B1F3F'; c.fillRect(-hf + 1, -704, 2 * hf - 2, 74);
  c.beginPath(); c.ellipse(0, -728, 62, 34, 0, 0, Math.PI * 2); c.fillStyle = '#0B1F3F'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#E78BA4'; c.stroke();
  c.fillStyle = 'rgba(240,250,255,0.9)'; for (let i = -3; i <= 3; i++) { rrect(c, i * 14 - 6, -760, 12, 11, 3); c.fill(); }
  // ---- air: particles running down the airway (above the shut doors they pile up; below them they are gone)
  const air = o.air || 0, jam = o.jam || 0, doorK = o.door || 0;
  if (air > 0.01) {
    const N = 46, top = -752, bot = -372;
    for (let i = 0; i < N; i++) {
      const u = (hash(i * 2.7 + 1) + (o.flow || 0) * (0.7 + 0.6 * hash(i + 31))) % 1;
      let y = lerp(top, bot, u), wHalf = y < -700 ? 44 : (y < -512 ? hf - 6 : 15);
      let x = (hash(i * 5.3 + 2) - 0.5) * 2 * wHalf, a = air * Math.min(1, u * 9) * (1 - Math.pow(u, 6));
      if (doorK > 0.6) {
        if (y > ly - 4) a *= Math.max(0, 1 - jam * 3);               // below the doors: nothing comes any more
        else if (jam > 0) { const yj = ly - 12 - 44 * hash(i * 9.1) * (0.4 + 0.6 * hash(i)), k2 = clamp(jam * 1.4 - (ly - y) / 420); y = lerp(y, yj, E.outCubic(k2)); x = lerp(x, (hash(i * 5.3 + 2) - 0.5) * 2 * (hf - 6), k2) + 2 * Math.sin(t * 40 + i) * k2; }
      }
      if (a <= 0.01) continue;
      const len = 10 + 16 * hash(i + 3);
      line(c, x, y - len * (1 - 0.8 * jam * (y < ly ? 1 : 0)), x, y, 4.5, `rgba(150,236,255,${0.9 * a})`);
      G((g) => softDot(g, x, y - len / 2, 16, '#7FE9FF', (o.puffs && o.puffs.length ? 0.16 : 0.5) * a));
    }
  }
  // ---- the doors (the vocal cords), and whoever runs into them
  for (const sd of [-1, 1]) { rrect(c, sd * hf - (sd > 0 ? 0 : 7), ly - 10, 7, 20, 2); c.fillStyle = '#5B6B86'; c.fill(); }
  for (const p of (o.puffs || [])) bxPuff(c, p.x || 0, p.y, p.r || 24, t, p);
  bxDoorPair(c, lx, ly, hf, doorK, o.doorHit || 0);
  const sg = o.sign || 0;
  if (sg > 0.01) {                          // a sign swings on the shut doors
    const drop2 = E.outBack(clamp(sg * 2.2), 1.4), sw2 = (o.signSwing || 0);
    c.save(); c.translate(lx, ly + 6); c.rotate(sw2); c.globalAlpha = clamp(sg * 6);
    line(c, -13, 0, -15, 9 * drop2 + 2, 1.6, '#DCE6F5'); line(c, 13, 0, 15, 9 * drop2 + 2, 1.6, '#DCE6F5');
    rrect(c, -24, 9 * drop2, 48, 17, 3); c.fillStyle = '#FFF7E0'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#C22843'; c.stroke();
    c.font = '900 10px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C22843'; c.fillText('CLOSED', 0, 9 * drop2 + 9.2);
    c.restore();
  }
  if ((o.doorHit || 0) > 0.01) G((g) => softDot(g, lx, ly, 70, '#FFE9A6', 0.34 * Math.min(1, o.doorHit)));
  // ---- the stomach, under the diaphragm's left half (our right)
  const T = bxStomPath(c, sw, poke, sdn);
  const sgr = c.createRadialGradient(BX.stom[0] + 20, BX.stom[1] + sdn - 150, 10, BX.stom[0], BX.stom[1] + sdn - 90, 190 * (1 + 0.3 * sw));
  sgr.addColorStop(0, '#FFB0C0'); sgr.addColorStop(1, '#D65C7C');
  c.fillStyle = sgr; c.fill();
  c.save(); bxStomPath(c, sw, poke, sdn); c.clip();
  const fill = o.fill === undefined ? 0 : o.fill;
  if (fill > 0.01) {
    const surf = T(150, lerp(238, 112, fill))[1];
    c.beginPath(); c.moveTo(-200, 600);
    for (let x = -60; x <= 420; x += 12) c.lineTo(x, surf + 4 * Math.sin(x * 0.08 + t * 7) + 3 * Math.sin(x * 0.19 - t * 9));
    c.lineTo(420, 600); c.closePath();
    const sg2 = c.createLinearGradient(0, surf, 0, surf + 150); sg2.addColorStop(0, '#FFB23E'); sg2.addColorStop(1, '#E0620C');
    c.fillStyle = sg2; c.fill();
    for (let i = 0; i < 30; i++) {                               // the fizz
      const life = (hash(i * 1.9) + t * (0.6 + 0.9 * hash(i + 5))) % 1, bx2 = T(60 + 190 * hash(i * 3.7 + 1), 0)[0], by2 = lerp(T(0, 244)[1], surf - 46 * sw * hash(i + 8), life);
      if (hash(i + 13) > 0.35 + 0.65 * sw + 0.2) continue;
      const above = by2 < surf;
      circle(c, bx2 + 5 * Math.sin(t * 6 + i), by2, (2.5 + 5 * hash(i + 2)) * (0.7 + 0.5 * sw), above ? 'rgba(255,240,210,0.55)' : 'rgba(255,246,214,0.85)');
    }
    line(c, -60, surf, 420, surf, 7, 'rgba(255,238,205,0.9)');
  }
  c.restore();
  bxStomPath(c, sw, poke, sdn); c.lineWidth = 6; c.strokeStyle = '#8A2A48'; c.stroke();
  G((g) => { if (fill > 0.01) softDot(g, BX.stom[0], BX.stom[1] + sdn - 70, 150 * (1 + 0.3 * sw), '#FF9A3C', 0.28 * fill); });
  // ---- the diaphragm: a domed sheet of muscle, with a face
  const band = (hw) => {
    c.beginPath();
    for (let x = -286; x <= 286; x += 11) { const y = bxDiaY(x, dO) - hw * (0.55 + 0.45 * Math.cos(Math.PI * x / 600)); x === -286 ? c.moveTo(x, y) : c.lineTo(x, y); }
    for (let x = 286; x >= -286; x -= 11) c.lineTo(x, bxDiaY(x, dO) + hw * (0.55 + 0.45 * Math.cos(Math.PI * x / 600)));
    c.closePath();
  };
  band(26); c.fillStyle = '#8E2238'; c.fill();
  band(21);
  const mg = c.createLinearGradient(0, -70, 0, 80); mg.addColorStop(0, '#FF8A84'); mg.addColorStop(1, '#D8444E');
  c.fillStyle = mg; c.fill();
  c.save(); band(21); c.clip();
  for (let x = -280; x <= 280; x += 17) { const y = bxDiaY(x, dO); line(c, x - 5, y - 20, x + 5, y + 20, 3, 'rgba(255,206,196,0.4)'); }
  ellipse(c, 0, bxDiaY(0, dO), 54, 14, 'rgba(255,236,226,0.85)');                                  // the central tendon
  c.restore();
  G((g) => { if ((o.diaGlow || 0) > 0.01) { g.lineWidth = 30; g.strokeStyle = `rgba(255,120,110,${0.6 * o.diaGlow})`; g.beginPath(); for (let x = -280; x <= 280; x += 20) { const y = bxDiaY(x, dO); x === -280 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } });
  // its face (on the dome over the stomach's neighbour, looking at whoever is poking it)
  const mood = o.mood || 0, fx = -112, fy = bxDiaY(fx, dO) - 1, sl = -Math.atan((bxDiaY(fx + 12, dO) - bxDiaY(fx - 12, dO)) / 24);
  c.save(); c.translate(fx, fy); c.rotate(-sl);
  for (const sd of [-1, 1]) {
    const ex = sd * 19, open = mood >= 1.5 ? 1.35 : (mood >= 0.5 ? 0.8 : 0.5);
    ellipse(c, ex, -2, 10, 11 * open, '#FFFFFF');
    circle(c, ex + (mood >= 1.5 ? 0 : 3.5), -2 + (mood >= 1.5 ? 0 : 2.5), mood >= 1.5 ? 3.6 : 5, '#3A0A16');
    if (mood < 1.5) { c.fillStyle = '#F06A6E'; c.fillRect(ex - 11, -15, 22, mood >= 0.5 ? 7 : 10); }                  // lids: sleepy, then narrowed
    if (mood >= 0.5) line(c, ex - sd * 11, -18 - (mood >= 1.5 ? 6 : 0), ex + sd * 9, -11 - (mood >= 1.5 ? 12 : -1), 4, '#5A0E1E');   // brows: cross, then raised
  }
  if (mood >= 1.5) ellipse(c, 0, 14, 6, 8, '#3A0A16');
  else if (mood >= 0.5) { c.beginPath(); c.moveTo(-9, 15); c.quadraticCurveTo(0, 9, 9, 15); c.lineWidth = 3.5; c.lineCap = 'round'; c.strokeStyle = '#3A0A16'; c.stroke(); }
  else line(c, -7, 13, 7, 13, 3.5, '#3A0A16');
  c.restore();
  c.restore();
}

// local point -> screen under v
function bxPt(v, x, y) { return [v.x + x * v.s, v.y + y * v.s]; }
// a label pill with a dotted leader to the thing it names (screen space)
function bxLabel(txt, x, y, k, col, ax, ay, size = 40) {
  if (k <= 0.01) return;
  screenSpace();
  const u = clamp(k);
  ctx.save(); ctx.setLineDash([9, 9]); line(ctx, x, y, lerp(x, ax, u), lerp(y, ay, u), 4, rgba(col, 0.85)); ctx.restore();
  if (k >= 0.95) { circle(ctx, ax, ay, 8, col); softDot(gctx, ax, ay, 30, col, 0.8); }
  pill(x, y, txt, col, k, size);
}
