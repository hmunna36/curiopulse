// The cat (cats-purr): the hiker's ginger cat, sitting and seen from the front, drawn with flat shapes for the
// cinematic look (call it inside actor(...); her face is paint). The same function draws her on a lap, on the back of
// the couch, as a loaf with her kittens, as a kitten, in a vet's cone, and in a crown.
// Also here: the marks and the word of a purr, a crown, a bow tie, a food bowl, his scratching fingers.
'use strict';

const PURC = { fur: '#F2923C', dark: '#C96A22', light: '#FFF0DA', ear: '#F7A8B0', line: '#5A2A10', nose: '#F07A90', iris: '#B9E24A', pupil: '#15131F' };
const PUR_TAU = Math.PI * 2;

// the buzz of a purr: a tiny sideways shiver that flips every frame (15 Hz at 30 fps reads as a hum). k = how hard
function purBuzz(t, k) { return k > 0.01 ? (Math.round(t * 30) % 2 ? 1 : -1) * 1.6 * k : 0; }

// the middle of her head, in her own units (origin: the middle of her base; about 280 units tall)
function purHeadAt(o = {}) {
  const loaf = o.loaf || 0, kit = o.kitten ? 1 : 0;
  return [(o.lean || 0) + (o.headDX || 0) + loaf * (o.loafHeadX === undefined ? -46 : o.loafHeadX), lerp(lerp(-190, -150, kit), -128, loaf) + (o.headDY || 0)];
}
// a point of her head (head units) in the coordinates she was drawn in
function purPt(x, y, s, o, lx, ly) {
  const h = purHeadAt(o), a = o.tilt || 0, cs = Math.cos(a), sn = Math.sin(a), hs = o.kitten ? 0.92 : 1;
  return [x + (h[0] + (lx * cs - ly * sn) * hs) * s, y + (h[1] + (lx * sn + ly * cs) * hs) * s];
}

// one eye (head space). mode: 'open' | 'half' | 'big' | 'happy' | 'shut'
function purEye(c, ex, ey, mode, look, F, lidK) {
  if (mode === 'happy') {
    c.beginPath(); c.moveTo(ex - 20, ey + 7); c.quadraticCurveTo(ex, ey - 19, ex + 20, ey + 7);
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = F.line; c.stroke(); return;
  }
  if (mode === 'shut') {
    c.beginPath(); c.moveTo(ex - 15, ey); c.quadraticCurveTo(ex, ey + 11, ex + 15, ey);
    c.lineWidth = 6; c.lineCap = 'round'; c.strokeStyle = F.line; c.stroke(); return;
  }
  const big = mode === 'big', rx = big ? 27 : 22, ry = big ? 29 : 23;
  ellipse(c, ex, ey, rx, ry, big ? '#D4F070' : F.iris);
  c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, PUR_TAU); c.lineWidth = 4.5; c.strokeStyle = F.line; c.stroke();
  const lx = look[0] * (big ? 4 : 7), ly = look[1] * (big ? 4 : 6);
  if (big) {   // wide open in the dark, or begging: the pupil is nearly the whole eye, with two lights in it
    ellipse(c, ex + lx, ey + ly, 20, 23, F.pupil);
    circle(c, ex + lx - 8, ey + ly - 10, 7.5, '#FFFFFF'); circle(c, ex + lx + 8, ey + ly + 9, 3.6, '#FFFFFF');
  } else {
    ellipse(c, ex + lx, ey + ly, 7, 17, F.pupil);
    circle(c, ex + lx - 5, ey + ly - 8, 4.6, '#FFFFFF');
  }
  const lid = mode === 'half' ? (lidK === undefined ? 0.46 : lidK) : (lidK || 0);
  if (lid > 0.02) {
    c.save(); c.beginPath(); c.ellipse(ex, ey, rx + 3, ry + 3, 0, 0, PUR_TAU); c.clip();
    c.fillStyle = F.fur; c.fillRect(ex - rx - 4, ey - ry - 4, 2 * rx + 8, (2 * ry + 4) * lid + 2);
    line(c, ex - rx - 2, ey - ry - 2 + (2 * ry + 4) * lid, ex + rx + 2, ey - ry - 2 + (2 * ry + 4) * lid, 5, F.line);
    c.restore();
  }
}

// The cat. (x, y) = the middle of her base, s = scale. o:
//   purr 0..1 (she shivers), lean (the upper body leans over, her units), headDX, headDY, tilt (head),
//   chin 0..1 (the head tips back: a chin being scratched), eyes: mode or [left, right] (viewer's left first),
//   look: [x, y], lid, ears: -1 (flat) .. 1 (pricked), mouth: 'w' | 'open' | 'meow' | 'eat',
//   tail 0..1 (how much it flicks), tailSide, noTail, paw 0..1 (a front paw lifts to pawTo: [x, y]; pawSide 1 = the one
//   on the viewer's right, -1 = the other),
//   loaf 0..1 (lying with her legs tucked under; loafHeadX), kitten (a kitten's proportions),
//   cone (a vet's collar), bandage (on the lifted paw), crown 0..1, seed
function purCat(c, x, y, s, t, o = {}) {
  const F = o.pal || PURC, loaf = o.loaf || 0, kit = !!o.kitten, lean = o.lean || 0, kb = kit ? 0.8 : 1;
  const bz = purBuzz(t, o.purr || 0), sd0 = o.seed || 0;
  c.save(); c.translate(x + bz * s, y); c.scale(s, s);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const br = 1 + 0.014 * Math.sin(t * loopW(2.3) + sd0);
  // ---- tail
  if (!o.noTail) {
    const fl = (o.tail || 0) * Math.sin(t * 5.2 + sd0), sd = o.tailSide || 1, bx = loaf > 0.5 ? 104 : 54 * kb;
    c.beginPath(); c.moveTo(sd * bx, -22); c.quadraticCurveTo(sd * (bx + 74), -14 - 16 * fl, sd * (bx + 62 + 12 * fl), -80 - 22 * fl);
    c.lineWidth = kit ? 17 : 26; c.strokeStyle = F.fur; c.stroke();
    c.beginPath(); c.moveTo(sd * (bx + 64 + 9 * fl), -66 - 18 * fl); c.lineTo(sd * (bx + 62 + 12 * fl), -80 - 22 * fl);
    c.lineWidth = kit ? 17 : 26; c.strokeStyle = F.dark; c.stroke();
  }
  // ---- body
  if (loaf > 0.5) {
    ellipse(c, 0, -60, 126, 64 * br, F.fur);
    ellipse(c, -30, -34, 70, 36, F.light);
    paint(() => { for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(58 + i * 26, -118 + i * 9); c.quadraticCurveTo(66 + i * 26, -96 + i * 6, 54 + i * 26, -76 + i * 8); c.lineWidth = 11; c.strokeStyle = F.dark; c.stroke(); } });
    for (const sd of [-1, 1]) ellipse(c, -34 + sd * 30, -8, 25, 11, F.light);
  } else {
    ellipse(c, -48 * kb, -36 * kb, 46 * kb, 40 * kb, F.fur); ellipse(c, 48 * kb, -36 * kb, 46 * kb, 40 * kb, F.fur);   // haunches
    c.beginPath(); c.moveTo(-66 * kb + lean * 0.1, -8); c.quadraticCurveTo(-86 * kb * br + lean * 0.5, -118 * kb, lean * 0.9, -170 * kb);
    c.quadraticCurveTo(86 * kb * br + lean * 0.5, -118 * kb, 66 * kb + lean * 0.1, -8); c.closePath(); c.fillStyle = F.fur; c.fill();
    c.beginPath(); c.moveTo(-34 * kb + lean * 0.2, -18); c.quadraticCurveTo(-48 * kb + lean * 0.5, -112 * kb, lean * 0.9, -152 * kb);
    c.quadraticCurveTo(48 * kb + lean * 0.5, -112 * kb, 34 * kb + lean * 0.2, -18); c.closePath(); c.fillStyle = F.light; c.fill();       // the bib
    if (!kit) paint(() => { for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sd * (72 - i * 3) + lean * 0.4, -112 + i * 30); c.quadraticCurveTo(sd * 54 + lean * 0.4, -104 + i * 30, sd * 46 + lean * 0.4, -116 + i * 30); c.lineWidth = 9; c.strokeStyle = F.dark; c.stroke(); } });
    // front legs and paws (the one on the viewer's right can lift)
    const paw = clamp(o.paw || 0), ps = o.pawSide || 1;
    for (const sd of [-1, 1]) {
      if (sd === ps && paw > 0.02) {
        const sx = ps * 22 * kb + lean * 0.5, sy = -98 * kb, to = o.pawTo || [70, -150], ex = lerp(ps * 24 * kb, to[0], paw), ey = lerp(-6, to[1], paw);
        line(c, sx, sy, ex, ey, 27 * kb, F.fur);
        if (o.bandage) { const ux = (ex - sx), uy = (ey - sy); line(c, sx + ux * 0.42, sy + uy * 0.42, sx + ux * 0.9, sy + uy * 0.9, 31 * kb, '#F4F7FF'); paint(() => { for (const f of [0.52, 0.66, 0.8]) line(c, sx + ux * f - 11, sy + uy * f - 5, sx + ux * f + 11, sy + uy * f + 5, 2.5, 'rgba(120,140,190,0.6)'); }); }
        ellipse(c, ex, ey, 19 * kb, 15 * kb, F.light);
      } else {
        rrect(c, sd * 24 * kb - 14 * kb + lean * 0.25, -90 * kb, 28 * kb, 90 * kb, 13 * kb); c.fillStyle = F.fur; c.fill();
        ellipse(c, sd * 24 * kb + lean * 0.2, -5, 20 * kb, 12 * kb, F.light);
      }
    }
  }
  // ---- head
  const hp = purHeadAt(o), chin = o.chin || 0, hs = kit ? 0.92 : 1;
  c.translate(hp[0], hp[1]); c.rotate(o.tilt || 0); c.scale(hs, hs);
  if (o.cone) {   // the vet's collar: a pale funnel round her head
    ellipse(c, 0, 4, 140, 118, '#E9F1FA');
    paint(() => { ellipse(c, 0, 8, 120, 100, '#F8FBFF'); c.beginPath(); c.ellipse(0, 4, 138, 116, 0, 0, PUR_TAU); c.lineWidth = 7; c.strokeStyle = '#B9C8DC'; c.stroke(); for (let i = 0; i < 12; i++) { const a = i * PUR_TAU / 12 + 0.2; line(c, Math.cos(a) * 92, 8 + Math.sin(a) * 76, Math.cos(a) * 116, 6 + Math.sin(a) * 96, 2.5, 'rgba(150,170,200,0.35)'); } });
  }
  const ears = o.ears === undefined ? 0.3 : o.ears;
  for (const sd of [-1, 1]) {
    c.save(); c.translate(sd * 50, -40); c.rotate(sd * (0.16 - 0.16 * Math.max(0, ears) + 0.95 * Math.max(0, -ears)));
    const eh = kit ? 46 : 78, ew = kit ? 30 : 35;
    c.beginPath(); c.moveTo(-ew, 24); c.quadraticCurveTo(sd * 2 - ew * 0.25, -eh * 0.55, sd * 9, -eh); c.quadraticCurveTo(sd * 2 + ew * 0.55, -eh * 0.4, ew, 24); c.closePath(); c.fillStyle = F.fur; c.fill();
    paint(() => { c.beginPath(); c.moveTo(-ew * 0.5, 16); c.quadraticCurveTo(sd * 3 - ew * 0.1, -eh * 0.35, sd * 8, -eh * 0.66); c.quadraticCurveTo(sd * 3 + ew * 0.32, -eh * 0.22, ew * 0.52, 16); c.closePath(); c.fillStyle = F.ear; c.fill(); });
    c.restore();
  }
  ellipse(c, 0, 0, 82, 68 - 3 * chin, F.fur);
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 72, 4); c.lineTo(sd * 100, 24); c.lineTo(sd * 68, 38); c.closePath(); c.fillStyle = F.fur; c.fill(); }   // cheek tufts
  paint(() => {
    c.save(); c.translate(0, -11 * chin);
    if (!kit) {
      for (const q of [-22, 0, 22]) line(c, q, -62, q * 0.8, -38 + Math.abs(q) * 0.2, 9, F.dark);        // forehead stripes
      for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) line(c, sd * 79, -6 + i * 19, sd * 58, -1 + i * 19, 8, F.dark);
    }
    ellipse(c, 0, 28, 39, 27, F.light);                                                              // muzzle
    if (chin > 0.05) ellipse(c, 0, 50 + 6 * chin, 30, 12 * chin, F.light);                             // the chin shows
    const lk = o.look || [0, 0], modes = Array.isArray(o.eyes) ? o.eyes : [o.eyes || 'open', o.eyes || 'open'];
    purEye(c, -33, -7, modes[0], lk, F, o.lid); purEye(c, 33, -7, modes[1], lk, F, o.lid);
    c.beginPath(); c.moveTo(-10, 14); c.lineTo(10, 14); c.lineTo(0, 25); c.closePath(); c.fillStyle = F.nose; c.fill();
    const m = o.mouth || 'w';
    if (m === 'open' || m === 'meow') {
      const mo = m === 'meow' ? 1 : 0.55;
      ellipse(c, 0, 40 + 5 * mo, 13 + 6 * mo, 9 + 12 * mo, '#5A1522'); ellipse(c, 0, 46 + 11 * mo, 8 + 3 * mo, 5 + 4 * mo, '#E0616C');
      if (m === 'meow') for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 13, 33); c.lineTo(sd * 9, 45); c.lineTo(sd * 5, 33); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill(); }
    } else {
      const ch = m === 'eat' ? 4 * Math.abs(Math.sin(t * 13)) : 0;
      c.beginPath(); c.moveTo(0, 25); c.lineTo(0, 33); c.moveTo(-19, 35); c.quadraticCurveTo(-9, 45 + ch, 0, 33); c.quadraticCurveTo(9, 45 + ch, 19, 35);
      c.lineWidth = 4.5; c.strokeStyle = F.line; c.stroke();
    }
    const wb = (o.purr || 0) > 0.05 ? 2.5 * Math.sin(t * 60) : 0;
    for (const sd of [-1, 1]) for (let i = -1; i <= 1; i++) line(c, sd * 31, 30 + i * 5, sd * (kit ? 86 : 116), 21 + i * 17 + wb * i, 2.6, 'rgba(255,255,255,0.92)');
    c.restore();
  });
  if ((o.crown || 0) > 0.01) purCrown(c, 0, -60, o.crown);
  c.restore();
}

// a small gold crown; (x, y) = the middle of its base, k = pop 0..1
function purCrown(c, x, y, k) {
  const s = E.outBack(clamp(k), 2.4);
  c.save(); c.translate(x, y); c.rotate(-0.08); c.scale(s, s);
  c.beginPath(); c.moveTo(-36, 0); c.lineTo(-42, -40); c.lineTo(-20, -22); c.lineTo(0, -52); c.lineTo(20, -22); c.lineTo(42, -40); c.lineTo(36, 0); c.closePath();
  c.fillStyle = '#FFCF3F'; c.fill();
  rrect(c, -38, -8, 76, 14, 5); c.fillStyle = '#E8A81C'; c.fill();
  paint(() => { circle(c, 0, -1, 5, '#FF5A6E'); circle(c, -22, -1, 4, '#7FE9FF'); circle(c, 22, -1, 4, '#7FE9FF'); for (const [px, py] of [[-42, -40], [0, -52], [42, -40]]) circle(c, px, py, 5.5, '#FFE99A'); });
  c.restore();
}

// the marks of a purr: little arcs that leave both sides of her (her units; draw inside the same transform as the cat,
// or pass x, y, s). k = how strong
function purMarks(c, x, y, s, t, k, o = {}) {
  if (k <= 0.02) return;
  const cy = o.cy === undefined ? -118 : o.cy, r0 = o.r0 === undefined ? 100 : o.r0;
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round';
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const p = ((t * 2.6 + i / 3) % 1 + 1) % 1, r = r0 + 46 * p, a = k * (1 - p) * 0.9;
      c.beginPath(); c.arc(0, cy, r, sd > 0 ? -0.42 : Math.PI - 0.42, sd > 0 ? 0.42 : Math.PI + 0.42);
      c.lineWidth = 7 - 3 * p; c.strokeStyle = `rgba(255,236,190,${a})`; c.stroke();
    }
    c.restore();
  });
}

// the word of a purr, in screen space: letters that shiver. k = pop 0..1, a = alpha
function purWord(txt, x, y, size, k, t, o = {}) {
  if (k <= 0.01) return;
  const col = o.col || '#FFE9B8', rot = o.rot || -0.1, sc = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.globalAlpha = o.a === undefined ? 1 : o.a;
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const adv = size * 0.56, x0 = -adv * (txt.length - 1) / 2, f = Math.round(t * 30);
  for (let i = 0; i < txt.length; i++) {
    const jx = ((f + i) % 2 ? 1 : -1) * size * 0.022, jy = ((f + i * 3) % 3 - 1) * size * 0.02 - Math.sin(i * 0.9) * size * 0.05;
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#1A0E08'; ctx.strokeText(txt[i], x0 + i * adv + jx, jy);
    ctx.fillStyle = col; ctx.fillText(txt[i], x0 + i * adv + jx, jy);
  }
  ctx.restore();
}

// his bow tie (rig-local, at his collar); k = pop
function purBowTie(c, x, y, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.6);
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 0); c.lineTo(sd * 34, -17); c.lineTo(sd * 34, 17); c.closePath(); c.fillStyle = '#16161F'; c.fill(); }
  rrect(c, -8, -9, 16, 18, 5); c.fillStyle = '#2A2A38'; c.fill();
  c.restore();
}

// a pet's bowl with food in it; (x, y) = the middle of its rim. o: {full 0..1}
function purBowl(c, x, y, s, o = {}) {
  const full = o.full === undefined ? 1 : o.full;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (full > 0.05) { c.fillStyle = '#A8683A'; c.beginPath(); c.moveTo(-40, 2); c.quadraticCurveTo(-30, -22 * full, -8, -18 * full); c.quadraticCurveTo(6, -30 * full, 22, -18 * full); c.quadraticCurveTo(36, -18 * full, 40, 2); c.closePath(); c.fill();
    paint(() => { for (const [dx, dy] of [[-22, -8], [-4, -15], [14, -10], [26, -4], [-12, -3]]) circle(c, dx, dy * full, 4.5, '#C98A52'); }); }
  c.beginPath(); c.moveTo(-50, 0); c.lineTo(50, 0); c.lineTo(62, 40); c.quadraticCurveTo(0, 48, -62, 40); c.closePath(); c.fillStyle = '#E8507C'; c.fill();
  rrect(c, -54, -6, 108, 12, 6); c.fillStyle = '#FF86A6'; c.fill();
  paint(() => {   // a paw print
    c.fillStyle = '#FFE1EA'; c.beginPath(); c.ellipse(0, 26, 10, 8, 0, 0, PUR_TAU); c.fill();
    for (const [dx, dy] of [[-11, 14], [-4, 9], [4, 9], [11, 14]]) { c.beginPath(); c.arc(dx, dy, 3.6, 0, PUR_TAU); c.fill(); }
  });
  c.restore();
}

// his scratching fingers: four short fingers that curl up from the hand at (hx, hy), toward `up` (an angle), working
function purFingers(c, hx, hy, up, t, pal, k = 1) {
  for (let i = 0; i < 4; i++) {
    const a = up + (i - 1.5) * 0.36, w = 0.5 + 0.5 * Math.sin(t * 21 + i * 1.5), L = 20 + 9 * w * k;
    line(c, hx + Math.cos(a) * 12, hy + Math.sin(a) * 12, hx + Math.cos(a) * (12 + L), hy + Math.sin(a) * (12 + L), 10.5, pal.skin);
  }
}
