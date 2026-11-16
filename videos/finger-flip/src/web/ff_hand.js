// "Can You Wag Your Fingers Like WIPERS?" Short: the pointing fist (index finger up), in HAND units: the middle of the
// wrist is the origin, y down, the index finger points up (-y). The fist is about 124 units wide and 104 tall, the
// index finger 104 long. Drawn in whatever transform the caller set (world or screen), so the same hand serves the
// over-the-shoulder view (the BACK of the hand to us) and the front view (the PALM to us).
//   ffPointer(c, o)      o = {a (rad, + = the tip swings to screen-right), view: 'back' | 'palm', th: +1 | -1 (the side
//                        the thumb is on, screen), s (scale), skin, sleeve, face (0..1), mood, look (-1..1), trail
//                        [angles] (ghost fingers of the last frames), tremble, glowTip (0..1)}
//   ffTipAt(o)           where the fingertip is (hand units, after the angle), for tags and touches
//   ffTwinFace(c, ...)   a small face on the nail (back) or the pad (palm) of the index finger
'use strict';

const FFH = {
  knI: [-30, -100],                 // the index knuckle (canonical: the thumb on -x)
  len: 108, w0: 34, w1: 29,         // index finger: length, width at the base and at the tip
  skin: '#F2B892', skin2: '#EDAE87', skinSh: '#D48E68', line: 'rgba(150,76,50,0.85)', nail: '#F9D6CC',
  pad: 'rgba(255,214,190,0.6)',
};

// the fingertip (hand units) for angle a (canonical: before the thumb flip)
function ffTipAt(a, len = FFH.len) {
  const kn = FFH.knI;
  return [kn[0] + Math.sin(a) * len, kn[1] - Math.cos(a) * len];
}
// a tapered finger from its knuckle along angle a, as one closed path (clockwise), length L
function ffFingerPath(c, a, L, w0 = FFH.w0, w1 = FFH.w1) {
  const kn = FFH.knI, ux = Math.sin(a), uy = -Math.cos(a), nx = -uy, ny = ux;
  const b = [kn[0] - ux * 18, kn[1] - uy * 18], tp = [kn[0] + ux * L, kn[1] + uy * L];
  c.moveTo(b[0] - nx * w0 / 2, b[1] - ny * w0 / 2);
  c.lineTo(tp[0] - nx * w1 / 2, tp[1] - ny * w1 / 2);
  c.arc(tp[0], tp[1], w1 / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, false);
  c.lineTo(b[0] + nx * w0 / 2, b[1] + ny * w0 / 2);
  c.closePath();
}
// a point along the finger: u 0 = knuckle .. 1 = tip, off = sideways
function ffAlong(a, u, off = 0, L = FFH.len) {
  const kn = FFH.knI, ux = Math.sin(a), uy = -Math.cos(a);
  return [kn[0] + ux * L * u - uy * off, kn[1] + uy * L * u + ux * off];
}
// the fist's outline (the back of the hand / the palm), wrist to knuckles
function ffFistPath(c) {
  c.moveTo(-38, 6);
  c.quadraticCurveTo(-52, -40, -50, -82);
  c.quadraticCurveTo(-50, -104, -30, -110);
  c.quadraticCurveTo(0, -116, 30, -108);
  c.quadraticCurveTo(62, -100, 62, -70);
  c.quadraticCurveTo(62, -30, 40, 6);
  c.closePath();
}

// a small face on the index finger: on the nail (back) or the pad (palm). mood: calm | love | strain | cheer | annoyed |
// worried | dizzy; look -1..1 (toward its twin: + = screen right, already in screen sense)
function ffTwinFace(c, a, f, mood, look, view, thSign, t) {
  if (f <= 0.01) return;
  const p = ffAlong(a, 0.8);
  c.save(); c.translate(p[0], p[1]); c.rotate(a);
  c.scale(thSign * f * 1.75, f * 1.75);   // undo the thumb flip so the face is never mirrored; lk is in screen sense
  const lk = look * thSign * thSign;
  paint(() => {
    const ink = '#15132A', lip = '#5A1522';
    if (mood === 'cheer') {            // ^ ^ and a wide open grin
      for (const ex of [-5.2, 5.2]) { c.beginPath(); c.moveTo(ex - 3.2, -1); c.lineTo(ex, -4.4); c.lineTo(ex + 3.2, -1); c.lineWidth = 1.7; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = ink; c.stroke(); }
      c.beginPath(); c.moveTo(-5.2, 3.2); c.quadraticCurveTo(0, 11, 5.2, 3.2); c.closePath(); c.fillStyle = lip; c.fill();
      ellipse(c, 0, 6.6, 2.6, 1.5, '#E0616C');
    } else if (mood === 'dizzy') {
      for (const ex of [-5.2, 5.2]) { c.beginPath(); for (let i = 0; i < 16; i++) { const aa = i * 0.7 + t * 9, r = 0.4 + i * 0.2; c.lineTo(ex + Math.cos(aa) * r, -1 + Math.sin(aa) * r); } c.lineWidth = 1.1; c.strokeStyle = ink; c.stroke(); }
      c.beginPath(); c.moveTo(-3.5, 5); c.quadraticCurveTo(-1.5, 3.5, 0, 5); c.quadraticCurveTo(1.5, 6.5, 3.5, 5); c.lineWidth = 1.2; c.strokeStyle = lip; c.stroke();
    } else {
      const strain = mood === 'strain', ann = mood === 'annoyed', wor = mood === 'worried';
      for (const ex of [-5.2, 5.2]) {
        const eo = strain ? 0.55 : ann ? 0.6 : 1;
        ellipse(c, ex, -1, 3.5, 4.2 * eo, '#FFFFFF');
        circle(c, ex + lk * 1.4, -0.6 + (ann ? 0.6 : 0), 2.0, ink);
        circle(c, ex + lk * 1.4 - 0.7, -1.5, 0.6, '#FFFFFF');
        if (strain || ann || wor) {   // brows
          const tilt = wor ? -1 : 1;
          line(c, ex - 3.4, -6.3 - (ex < 0 ? tilt : -tilt) * 1.1, ex + 3.4, -6.3 + (ex < 0 ? tilt : -tilt) * 1.1, 1.3, ink);
        }
      }
      if (strain) {                    // gritted teeth
        rrect(c, -5, 3.4, 10, 4.2, 1.6); c.fillStyle = '#FFFFFF'; c.fill();
        c.lineWidth = 0.9; c.strokeStyle = lip; c.stroke();
        line(c, -5, 5.5, 5, 5.5, 0.7, lip);
      } else if (ann || wor) {
        c.beginPath(); c.moveTo(-3.4, 5.6); c.quadraticCurveTo(0, wor ? 3.4 : 4.4, 3.4, 5.6); c.lineWidth = 1.3; c.lineCap = 'round'; c.strokeStyle = lip; c.stroke();
      } else {
        c.beginPath(); c.arc(lk * 0.6, 3.4, 3.3, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 1.4; c.lineCap = 'round'; c.strokeStyle = lip; c.stroke();
      }
      if (mood === 'love') for (const ex of [-7.4, 7.4]) ellipse(c, ex, 3.2, 2.6, 1.5, 'rgba(255,96,130,0.75)');
    }
  });
  c.restore();
}

// the whole pointing fist
function ffPointer(c, o = {}) {
  const a = o.a || 0, view = o.view || 'back', th = o.th === -1 ? -1 : 1, s = o.s || 1;
  const skin = o.skin || FFH.skin, sleeve = o.sleeve || null;
  c.save();
  if (o.rot) c.rotate(o.rot);
  // canonical has the thumb on -x; th = -1 keeps it, th = +1 flips the hand (the thumb goes to +x)
  c.scale(-th * s, s);
  const aa = -th * a;   // the angle in canonical space, so that + always swings the tip to screen-right
  // the sleeve (his yellow coat) under the wrist
  if (sleeve) {
    const lean = o.sleeveLean === undefined ? 0.28 : o.sleeveLean;   // + = it runs down toward the hand's outer side
    c.save(); c.rotate(-lean);
    c.beginPath(); c.moveTo(-40, 4); c.lineTo(40, 4); c.lineTo(50, 300); c.lineTo(-50, 300); c.closePath(); c.fillStyle = sleeve.coat; c.fill();
    c.beginPath(); c.moveTo(18, 40); c.lineTo(40, 40); c.lineTo(50, 300); c.lineTo(26, 300); c.closePath(); c.fillStyle = sleeve.coatSh; c.fill();
    rrect(c, -46, -6, 92, 34, 14); c.fillStyle = sleeve.coatDk || sleeve.coatSh; c.fill();
    c.restore();
  }
  // ghost fingers of the last frames (the motion), paint: they take no light and drop no shadow
  if (o.trail && o.trail.length) {
    paint(() => {
      o.trail.forEach((ta, i) => {
        const k = (i + 1) / (o.trail.length + 1);
        c.beginPath(); ffFingerPath(c, -th * ta, FFH.len); c.fillStyle = rgba('#FFE7D2', 0.10 + 0.16 * k); c.fill();
      });
    });
  }
  // the thumb on the far side (back view): its base shows at the edge of the fist
  if (view === 'back') {
    c.beginPath(); c.moveTo(-44, -10); c.quadraticCurveTo(-74, -40, -66, -78); c.quadraticCurveTo(-56, -96, -42, -84); c.quadraticCurveTo(-36, -50, -30, -20); c.closePath();
    c.fillStyle = FFH.skin2; c.fill();
  }
  // the fist
  c.beginPath(); ffFistPath(c); c.fillStyle = skin; c.fill();
  // the index finger (a hair of a different colour, so the light sees two things)
  const tr = o.tremble ? o.tremble * 0.05 * Math.sin((o.t || 0) * 61) : 0;
  c.beginPath(); ffFingerPath(c, aa + tr, FFH.len); c.fillStyle = '#F3B894'; c.fill();
  paint(() => {
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.save(); c.beginPath(); c.rect(-400, -400, 800, 800); ffFistPath(c); c.clip('evenodd');
    c.beginPath(); ffFingerPath(c, aa + tr, FFH.len); c.lineWidth = 2.6; c.strokeStyle = FFH.line; c.stroke();
    c.restore();
    if ((o.glowTip || 0) > 0.01) { c.beginPath(); ffFingerPath(c, aa + tr, FFH.len, FFH.w0 + 8, FFH.w1 + 8); c.lineWidth = 6 * o.glowTip; c.strokeStyle = '#FFD447'; c.stroke(); }
    // creases
    for (const u of [0.38, 0.68]) {
      const p1 = ffAlong(aa + tr, u, -FFH.w0 * 0.3), p2 = ffAlong(aa + tr, u, FFH.w0 * 0.3), m = ffAlong(aa + tr, u + (view === 'back' ? -0.03 : 0.025));
      c.beginPath(); c.moveTo(p1[0], p1[1]); c.quadraticCurveTo(m[0], m[1], p2[0], p2[1]); c.lineWidth = 1.6; c.strokeStyle = 'rgba(160,82,56,0.55)'; c.stroke();
    }
    if (view === 'back') {
      const n = ffAlong(aa + tr, 0.86);
      ellipse(c, n[0], n[1], 9.5, 12.5, FFH.nail, aa + tr);
      c.beginPath(); c.ellipse(n[0], n[1], 9.5, 12.5, aa + tr, 0, 7); c.lineWidth = 1.1; c.strokeStyle = 'rgba(200,120,100,0.6)'; c.stroke();
    } else {
      const n = ffAlong(aa + tr, 0.86);
      ellipse(c, n[0], n[1], 8.5, 11.5, FFH.pad, aa + tr);
    }
    // the fist's outline (not across the finger's root)
    c.save(); c.beginPath(); c.rect(-400, -400, 800, 800); ffFingerPath(c, aa + tr, FFH.len); c.clip('evenodd');
    c.beginPath(); ffFistPath(c); c.lineWidth = 2.6; c.strokeStyle = FFH.line; c.stroke();
    c.restore();
    if (view === 'back') {
      // the curled fingers' knuckles along the top, the cords on the back of the hand
      for (const [kx, ky] of [[-2, -110], [22, -107], [44, -98]]) {
        c.beginPath(); c.arc(kx, ky + 12, 11, Math.PI * 1.12, Math.PI * 1.88); c.lineWidth = 1.8; c.strokeStyle = 'rgba(160,82,56,0.5)'; c.stroke();
        line(c, kx * 0.8, ky + 26, kx * 0.3, -14, 1.5, 'rgba(176,96,66,0.22)');
      }
      line(c, -26, -80, -14, -14, 1.5, 'rgba(176,96,66,0.22)');
    } else {
      // the palm side: three curled fingers side by side, and the thumb across them
      for (const [fx, fy, fh] of [[-4, -96, 62], [20, -92, 58], [42, -84, 48]]) {
        rrect(c, fx - 11, fy, 22, fh, 10); c.lineWidth = 1.8; c.strokeStyle = 'rgba(160,82,56,0.55)'; c.stroke();
        ellipse(c, fx, fy + fh - 9, 6, 4, 'rgba(255,214,190,0.5)');
      }
      // the thumb lying across
      c.beginPath(); c.moveTo(-48, -40); c.quadraticCurveTo(-6, -58, 34, -50); c.quadraticCurveTo(46, -44, 34, -34); c.quadraticCurveTo(-4, -28, -46, -18); c.closePath();
      c.fillStyle = FFH.skin2; c.fill(); c.lineWidth = 2.2; c.strokeStyle = FFH.line; c.stroke();
      ellipse(c, 28, -43, 7, 5, FFH.nail, -0.15);
      // palm crease
      c.beginPath(); c.moveTo(-40, -6); c.quadraticCurveTo(-10, -14, 22, -4); c.lineWidth = 1.6; c.strokeStyle = 'rgba(170,92,64,0.45)'; c.stroke();
    }
  });
  ffTwinFace(c, aa + tr, o.face || 0, o.mood || 'calm', o.look || 0, view, -th, o.t || 0);
  c.restore();
}

// where the index tip is, in the caller's space, for a hand drawn with ffPointer(c, o) at the origin
function ffTipWorld(o) {
  const th = o.th === -1 ? -1 : 1, s = o.s || 1, aa = -th * (o.a || 0);
  const p = ffTipAt(aa);
  let x = -th * s * p[0], y = s * p[1];
  if (o.rot) { const cs = Math.cos(o.rot), sn = Math.sin(o.rot); [x, y] = [x * cs - y * sn, x * sn + y * cs]; }
  return [x, y];
}
