// Fireflies and their props: the bug as a character (front view, its lamp hanging under it), the bigger female who
// fakes a reply, a jumping spider, the jar, a glow stick, a light bulb for a tail, a thermometer, a crossed-out flame,
// a paper mask on a stick, cutlery, flowers, and the strips that show a flash pattern.
// Everything draws into ctx and gctx under whatever transform is current (camera or screen), in its own units.
'use strict';

const FF = { GLOW: '#D8FF5A', CORE: '#F6FFB8', HERS: '#9CFF6A' };   // the lamp: ours (yellow-green), the big female's (greener)

// faces: lid 0 (open) .. 1 (shut), brow + = worried / - = cross, pupil size, mouth
const FF_FACES = {
  calm: { lid: 0.12, brow: 0, pupil: 1, mouth: 'smile' },
  happy: { lid: 0.04, brow: 0.25, pupil: 1.1, mouth: 'grin' },
  love: { lid: 0.04, brow: 0.3, pupil: 1, mouth: 'grin', hearts: 1 },
  shock: { lid: 0, brow: 0.9, pupil: 0.5, mouth: 'o' },
  worried: { lid: 0.05, brow: 1, pupil: 0.8, mouth: 'wavy' },
  smug: { lid: 0.45, brow: -0.3, pupil: 1, mouth: 'smirk' },
  meh: { lid: 0.5, brow: -0.15, pupil: 1, mouth: 'flat' },
  dazed: { lid: 0.3, brow: 0.5, pupil: 0.8, mouth: 'wavy', cross: 1 },
  evil: { lid: 0.42, brow: -1, pupil: 0.9, mouth: 'fangs' },
  chew: { lid: 0.62, brow: -0.2, pupil: 1, mouth: 'chew' },
  sweat: { lid: 0.08, brow: 1, pupil: 0.7, mouth: 'grimace' },
  sweet: { lid: 0.1, brow: 0.35, pupil: 1.15, mouth: 'smile' },
};
// the colours of the two species
const FF_KIND = [
  { body: '#34293F', body2: '#4A3B58', shield: '#EB6A3C', rim: '#F8D271', spot: '#2B2030', wing: '#2A2233', edge: '#D9C36A', lamp: FF.GLOW, off: '#B9C27C' },
  { body: '#33372A', body2: '#4B5038', shield: '#C8A542', rim: '#EFE2A0', spot: '#2A2A1C', wing: '#252A20', edge: '#B7C68A', lamp: FF.HERS, off: '#9DB77A' },
];
const ffFace = (name, extra) => Object.assign({}, FF_FACES[name] || FF_FACES.calm, extra || {});
function ffLerpFace(a, b, k) {
  const o = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const p = a[key], q = b[key];
    o[key] = typeof p === 'number' || typeof q === 'number' ? lerp(p || 0, q || 0, k) : (k < 0.5 ? p : q);
  }
  return o;
}
// the lamp's outline in bug units (it hangs under the thorax)
function ffLampPath(c) {
  c.beginPath(); c.moveTo(-25, 44); c.lineTo(25, 44); c.quadraticCurveTo(26, 78, 15, 96); c.quadraticCurveTo(0, 112, -15, 96); c.quadraticCurveTo(-26, 78, -25, 44); c.closePath();
}
// a little heart in bug units
function ffHeartPath(c, x, y, k) {
  c.beginPath(); c.moveTo(x, y + 7 * k); c.bezierCurveTo(x - 11 * k, y - 1 * k, x - 7 * k, y - 10 * k, x, y - 4 * k); c.bezierCurveTo(x + 7 * k, y - 10 * k, x + 11 * k, y - 1 * k, x, y + 7 * k); c.closePath();
}

// ---------------------------------------------------------------- the firefly
// (x, y) = the middle of its thorax; about 250 units from antenna tip to lamp tip at s = 1.
// o: {kind: 0 ours | 1 the big female, lit: 0..1, face: name | object, look: [x, y], fly: true | false (wing cases shut),
//     tie: a bow tie (the males), lash: eyelashes and lipstick, tilt, seed, cook: 0..1 (toasted), noLamp (a bulb goes there),
//     armL / armR: [x, y] where each front leg reaches (bug units), bib, glow: scale of the halo (1), still: no bob}
function ffBug(x, y, s, t, o = {}) {
  const c = ctx, K = FF_KIND[o.kind || 0], lit = clamp(o.lit === undefined ? 1 : o.lit), cook = o.cook || 0;
  const F = typeof o.face === 'object' ? o.face : ffFace(o.face || 'calm'), look = o.look || [0, 0], fly = o.fly !== false;
  const seed = o.seed || 0, bob = o.still ? 0 : (fly ? 6 : 1.5) * Math.sin(t * (fly ? 8.5 : 2.2) + seed * 1.7);
  const dk = (h) => (cook > 0 ? mixHex(h, '#15121A', 0.86 * cook) : h);
  const lamp = o.lamp || K.lamp;
  const tr = (cc) => { cc.save(); cc.translate(x, y + bob * s); cc.rotate(o.tilt || 0); cc.scale(s, s); };
  tr(c); tr(gctx);
  // the halo behind it (the body hides its middle)
  if (lit > 0.02 && !o.noLamp) softDot(c, 0, 78, 150 * (o.glow || 1), lamp, 0.16 * lit);
  // hind wings: a blur of two beats (see-through: the light leaves them alone)
  if (fly) {
    for (const sd of [-1, 1]) for (let g = 0; g < 3; g++) {
      const a = sd * (1.02 + 0.5 * Math.sin(t * 61 + g * 2.1 + seed));
      c.save(); c.translate(sd * 18, -22); c.rotate(a);
      ellipse(c, 0, -52, 17, 56, `rgba(214,236,255,${0.11 + 0.03 * g})`);
      c.restore();
    }
  }
  actor(() => {
    // wing cases: thrown open in flight, folded down the back when it sits
    for (const sd of [-1, 1]) {
      c.save(); c.translate(sd * 20, -24); c.rotate(sd * (fly ? 2.25 + 0.06 * Math.sin(t * 31 + seed) : 0.2));
      c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-22, 50, 0, 96); c.quadraticCurveTo(22, 50, 9, 0); c.closePath(); c.fillStyle = dk(K.wing); c.fill();
      paint(() => { c.lineWidth = 3; c.strokeStyle = dk(K.edge); c.beginPath(); c.moveTo(sd * 9, 6); c.quadraticCurveTo(sd * 19, 50, sd * 2, 90); c.stroke(); });
      c.restore();
    }
    // legs: two pairs dangle, the front pair are its arms
    const leg = (pts) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 6.5; c.strokeStyle = dk('#221A2B'); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); };
    const sw = (ph) => (fly ? 4 * Math.sin(t * 7 + ph + seed) : 0);
    for (const sd of [-1, 1]) {
      leg([[sd * 22, 2], [sd * (46 + sw(1)), 22], [sd * (41 + sw(2)), 46]]);
      leg([[sd * 18, 16], [sd * (44 + sw(3)), 44], [sd * (36 + sw(4)), 70]]);
    }
    // abdomen (its lower half is the lamp)
    c.beginPath(); c.moveTo(-27, 8); c.lineTo(27, 8); c.quadraticCurveTo(30, 60, 15, 96); c.quadraticCurveTo(0, 112, -15, 96); c.quadraticCurveTo(-30, 60, -27, 8); c.closePath();
    c.fillStyle = dk(K.body2); c.fill();
    if (!o.noLamp) {
      ffLampPath(c); c.fillStyle = cook > 0 ? dk(K.off) : mixHex(K.off, FF.CORE, lit); c.fill();
      paint(() => { c.lineWidth = 2.5; c.strokeStyle = cook > 0 ? 'rgba(0,0,0,0.35)' : `rgba(90,110,40,${0.5 - 0.3 * lit})`; for (const yy of [62, 80]) { c.beginPath(); c.moveTo(-23 + (yy - 62) * 0.3, yy); c.quadraticCurveTo(0, yy + 5, 23 - (yy - 62) * 0.3, yy); c.stroke(); } });
    }
    paint(() => { c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.moveTo(-26, 26); c.quadraticCurveTo(0, 31, 26, 26); c.stroke(); });
    // thorax, head
    ellipse(c, 0, -6, 31, 28, dk(K.body));
    circle(c, 0, -58, 35, dk(K.body2));
    // the shield over its head
    c.beginPath(); c.moveTo(-42, -64); c.quadraticCurveTo(-40, -106, 0, -108); c.quadraticCurveTo(40, -106, 42, -64); c.quadraticCurveTo(0, -80, -42, -64); c.closePath();
    c.fillStyle = dk(K.shield); c.fill();
    paint(() => {
      c.lineWidth = 5; c.strokeStyle = dk(K.rim); c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-40, -66); c.quadraticCurveTo(-38, -104, 0, -105.5); c.quadraticCurveTo(38, -104, 40, -66); c.stroke();
      ellipse(c, 0, -90, 9, 7, dk(K.spot));
    });
    // antennae
    for (const sd of [-1, 1]) {
      const q = 0.14 * Math.sin(t * 13 + sd + seed) + (cook ? 0.5 * cook * sd : 0);
      c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = dk('#221A2B');
      c.beginPath(); c.moveTo(sd * 13, -104); c.quadraticCurveTo(sd * (20 + 20 * q), -134, sd * (46 + 26 * q), -146 + 10 * Math.abs(q)); c.stroke();
      circle(c, sd * (46 + 26 * q), -146 + 10 * Math.abs(q), 5, dk('#221A2B'));
    }
    // arms (the front legs), then whatever it wears
    for (const [sd, tg] of [[-1, o.armL], [1, o.armR]]) {
      const end = tg || [sd * (40 + sw(5)), 20], sh = [sd * 25, -16];
      const mx = (sh[0] + end[0]) / 2 + sd * 16, my = (sh[1] + end[1]) / 2 + 12;
      leg([sh, [mx, my], end]);
      circle(c, end[0], end[1], 6, dk('#221A2B'));
    }
  });
  // ---- the face: paint (no edge, no shadow of its own)
  paint(() => {
    c.save(); c.translate(0, -58);
    const lash = !!o.lash, eyeR = 13;
    for (const sd of [-1, 1]) {
      const ex = sd * 15.5, ey = -1;
      ellipse(c, ex, ey, eyeR, 15, '#FFFFFF');
      const px = ex + (F.cross ? -sd * 4 : look[0] * 4.5), py = ey + look[1] * 5;
      if (F.hearts) { ffHeartPath(c, px, py, 1.0); c.fillStyle = '#FF4D7A'; c.fill(); } else { circle(c, px, py, 6.6 * F.pupil, '#17122A'); circle(c, px - 2, py - 2.6, 2.2, '#FFFFFF'); }
      if (F.lid > 0.01) {
        c.save(); c.beginPath(); c.ellipse(ex, ey, eyeR + 1, 16, 0, 0, 7); c.clip();
        c.fillStyle = lash ? '#7A5AA8' : dk(K.body2); c.fillRect(ex - 16, ey - 17, 32, 32 * F.lid + 1);
        c.fillStyle = '#17122A'; c.fillRect(ex - 16, ey - 17 + 32 * F.lid, 32, 2.6);
        c.restore();
      }
      if (lash) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + sd * (0.5 + 0.38 * i); line(c, ex + Math.cos(a) * 12, ey - 15 + 30 * F.lid * 0.6 + Math.sin(a) * 3 + 12, ex + Math.cos(a) * 21, ey - 15 + 30 * F.lid * 0.6 + Math.sin(a) * 9 + 6, 2.6, '#17122A'); }
      const by = -21 - 3 * Math.abs(F.brow);
      line(c, sd * 5, by + F.brow * 5 * 1, sd * 25, by - F.brow * 5, 4.2, '#17122A');
    }
    // mouth
    const my = 20, lip = lash ? '#FF4D7A' : '#FFD9C8';
    c.lineCap = 'round'; c.lineWidth = 3.6; c.strokeStyle = lip;
    if (F.mouth === 'smile') { c.beginPath(); c.moveTo(-9, my - 1); c.quadraticCurveTo(0, my + 7, 9, my - 1); c.stroke(); }
    else if (F.mouth === 'grin') { c.beginPath(); c.moveTo(-12, my - 3); c.quadraticCurveTo(0, my + 13, 12, my - 3); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(-9, my - 3, 18, 3.4); }
    else if (F.mouth === 'o') ellipse(c, 0, my + 2, 6, 8, '#5A1522');
    else if (F.mouth === 'wavy') { c.beginPath(); c.moveTo(-11, my + 2); c.bezierCurveTo(-6, my - 4, -2, my + 6, 2, my + 1); c.bezierCurveTo(6, my - 4, 9, my + 5, 12, my + 1); c.stroke(); }
    else if (F.mouth === 'smirk') { c.beginPath(); c.moveTo(-8, my + 2); c.quadraticCurveTo(2, my + 6, 11, my - 3); c.stroke(); }
    else if (F.mouth === 'flat') { c.beginPath(); c.moveTo(-9, my + 2); c.lineTo(9, my + 2); c.stroke(); }
    else if (F.mouth === 'grimace') { rrect(c, -12, my - 4, 24, 11, 4); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#5A1522'; c.stroke(); for (const xx of [-4, 4]) line(c, xx, my - 4, xx, my + 7, 1.6, '#5A1522'); }
    else if (F.mouth === 'fangs') {
      c.beginPath(); c.moveTo(-15, my - 4); c.quadraticCurveTo(0, my + 15, 15, my - 4); c.closePath(); c.fillStyle = '#3A0A18'; c.fill();
      c.fillStyle = '#FFFFFF'; for (const xx of [-10, -3.4, 3.4, 10]) { c.beginPath(); c.moveTo(xx - 3.2, my - 3.5 + 0.12 * Math.abs(xx)); c.lineTo(xx + 3.2, my - 3.5 + 0.12 * Math.abs(xx)); c.lineTo(xx, my + 5.5 - 0.2 * Math.abs(xx)); c.closePath(); c.fill(); }
      c.lineWidth = 2.6; c.strokeStyle = lip; c.beginPath(); c.moveTo(-15, my - 4); c.quadraticCurveTo(0, my + 15, 15, my - 4); c.stroke();
    } else if (F.mouth === 'chew') {
      const ch = Math.sin(t * 17);
      for (const sd of [-1, 1]) ellipse(c, sd * 21, my - 3, 8 + 1.5 * ch * sd, 7, dk(K.body2));
      c.beginPath(); c.moveTo(-8, my + 1 + ch); c.quadraticCurveTo(0, my + 4 - 2 * ch, 8, my + 1 + ch); c.stroke();
    }
    c.restore();
    // a bow tie (the males)
    if (o.tie) {
      const col = cook > 0 ? dk('#FF5A6E') : '#FF5A6E';
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, -25); c.lineTo(sd * 17, -35); c.lineTo(sd * 17, -15); c.closePath(); c.fillStyle = col; c.fill(); }
      circle(c, 0, -25, 5, cook > 0 ? dk('#FFD0D6') : '#FFD0D6');
    }
    // a napkin tucked under her chin
    if (o.bib > 0) {
      c.save(); c.translate(0, -24); c.scale(o.bib, o.bib);
      c.beginPath(); c.moveTo(-22, 0); c.lineTo(22, 0); c.lineTo(17, 40); c.lineTo(0, 30); c.lineTo(-17, 40); c.closePath(); c.fillStyle = '#F7F4EC'; c.fill();
      c.lineWidth = 3; c.strokeStyle = '#FF5A6E'; c.beginPath(); c.moveTo(-14, 12); c.lineTo(14, 12); c.moveTo(-12, 22); c.lineTo(12, 22); c.stroke();
      c.restore();
    }
  });
  // ---- its light: the lamp goes into the glow layer
  if (lit > 0.02 && !o.noLamp) {
    ffLampPath(gctx); gctx.fillStyle = rgba(lamp, 0.9 * lit); gctx.fill();
    softDot(gctx, 0, 76, 96 * (o.glow || 1), lamp, 0.5 * lit);
  }
  c.restore(); gctx.restore();
}
// where a point given in bug units lands (same transform as ffBug, without the bob)
function ffPt(x, y, s, p, tilt = 0) { const cs = Math.cos(tilt), sn = Math.sin(tilt); return [x + (p[0] * cs - p[1] * sn) * s, y + (p[0] * sn + p[1] * cs) * s]; }

// ---------------------------------------------------------------- a jumping spider, from the front
// o: {face: 'hungry' | 'lick' | 'yuck' | 'scared', look: [x, y], step: walk phase, sick: 0..1 (it goes green)}
function ffSpider(x, y, s, t, o = {}) {
  const c = ctx, sick = o.sick || 0, face = o.face || 'hungry', look = o.look || [0, 0];
  const fur = mixHex('#7B6A8E', '#7FA860', 0.75 * sick), fur2 = mixHex('#5B4C6E', '#5F8A4A', 0.75 * sick);
  c.save(); c.translate(x, y + 3 * Math.sin(t * 6)); c.scale(s, s);
  actor(() => {
    // eight legs: knees up, feet down
    const ph = o.step === undefined ? 0 : o.step;
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
      const lift = 10 * Math.max(0, Math.sin(ph * 2 * Math.PI + i * 1.7 + (sd > 0 ? Math.PI : 0)));
      const kx = sd * (62 + i * 15), ky = -40 + i * 13 - lift, fx = sd * (92 + i * 20), fy = 58 - Math.abs(i - 1.5) * 6 - lift * 1.2;
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 11; c.strokeStyle = fur2;
      c.beginPath(); c.moveTo(sd * 36, -4 + i * 9); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    }
    ellipse(c, 0, 26, 52, 44, fur2);             // abdomen behind
    ellipse(c, 0, -10, 64, 56, fur);             // the head end: all face
    for (const sd of [-1, 1]) ellipse(c, sd * 13, 44, 10, 15, fur2);   // jaws
  });
  paint(() => {
    for (const sd of [-1, 1]) {                  // two big eyes, two small ones
      const ex = sd * 24, ey = -18, sq = face === 'yuck' ? 1 : 0;
      circle(c, sd * 54, -34, 9, '#17122A'); circle(c, sd * 56, -36, 3, '#FFFFFF');
      if (sq) { c.lineCap = 'round'; c.lineWidth = 6; c.strokeStyle = '#17122A'; c.beginPath(); c.moveTo(ex - 15, ey - 6 * sd); c.lineTo(ex + 15, ey + 6 * sd); c.stroke(); c.beginPath(); c.moveTo(ex - 13 * sd, ey + 9); c.lineTo(ex + 11 * sd, ey + 3); c.stroke(); }
      else {
        circle(c, ex, ey, 21, '#FFFFFF');
        circle(c, ex + look[0] * 7, ey + look[1] * 7, face === 'scared' ? 7 : 12, '#17122A');
        circle(c, ex + look[0] * 7 - 4, ey + look[1] * 7 - 5, 4, '#FFFFFF');
      }
      if (face === 'scared') line(c, sd * 8, -52, sd * 40, -46, 5, '#17122A');
    }
    if (face === 'lick' || face === 'yuck') {     // the tongue
      const L = face === 'yuck' ? 44 : 30 + 6 * Math.sin(t * 20);
      c.lineCap = 'round'; c.lineWidth = 17; c.strokeStyle = face === 'yuck' ? '#9BC46A' : '#FF7A93';
      c.beginPath(); c.moveTo(0, 26); c.quadraticCurveTo(face === 'yuck' ? 10 : 0, 26 + L * 0.6, face === 'yuck' ? 16 : 0, 26 + L); c.stroke();
      ellipse(c, 0, 24, 15, 9, '#3A0A18');
    } else if (face === 'hungry') { c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = '#17122A'; c.beginPath(); c.moveTo(-15, 20); c.quadraticCurveTo(0, 34, 15, 20); c.stroke(); }
    else ellipse(c, 0, 26, 9, 11, '#3A0A18');
  });
  c.restore();
}

// ---------------------------------------------------------------- the jar (world units; (x, y) = the middle of the glass)
// 150 wide, 200 tall at s = 1. Back first, then what is inside, then the front (and the lid, wherever it is).
function ffJarShape(c, s) {
  const w = 75 * s, h = 100 * s;
  c.beginPath(); c.moveTo(-w * 0.8, -h); c.lineTo(w * 0.8, -h); c.lineTo(w * 0.8, -h + 22 * s); c.quadraticCurveTo(w, -h + 30 * s, w, -h + 52 * s);
  c.lineTo(w, h - 22 * s); c.quadraticCurveTo(w, h, w - 22 * s, h); c.lineTo(-w + 22 * s, h); c.quadraticCurveTo(-w, h, -w, h - 22 * s);
  c.lineTo(-w, -h + 52 * s); c.quadraticCurveTo(-w, -h + 30 * s, -w * 0.8, -h + 22 * s); c.closePath();
}
function ffJarBack(x, y, s, lit, lamp = FF.GLOW) {
  const c = ctx;
  c.save(); c.translate(x, y);
  ffJarShape(c, s); c.fillStyle = 'rgba(150,205,225,0.10)'; c.fill();
  if (lit > 0.02) {
    const g = c.createRadialGradient(0, 14 * s, 4, 0, 14 * s, 118 * s);
    g.addColorStop(0, rgba(lamp, 0.34 * lit)); g.addColorStop(1, rgba(lamp, 0));
    ffJarShape(c, s); c.fillStyle = g; c.fill();
  }
  c.restore();
  if (lit > 0.02) softDot(gctx, x, y + 14 * s, 150 * s, lamp, 0.22 * lit);
}
// lid: {dx, dy, rot} from its seat on the jar's mouth (world units), or null for no lid
function ffJarFront(x, y, s, lit, lid, t = 0) {
  const c = ctx, w = 75 * s, h = 100 * s;
  c.save(); c.translate(x, y);
  // the glass: an edge, the threads of the neck, a long reflection and a short one
  ffJarShape(c, s); c.lineWidth = 4.5 * s; c.lineJoin = 'round'; c.strokeStyle = `rgba(214,240,255,${0.5 + 0.2 * lit})`; c.stroke();
  c.lineWidth = 3 * s; c.strokeStyle = 'rgba(214,240,255,0.42)';
  for (const yy of [-h + 8 * s, -h + 16 * s]) { c.beginPath(); c.moveTo(-w * 0.8, yy); c.lineTo(w * 0.8, yy); c.stroke(); }
  c.lineCap = 'round'; c.lineWidth = 9 * s; c.strokeStyle = 'rgba(255,255,255,0.26)';
  c.beginPath(); c.moveTo(-w + 17 * s, -h + 62 * s); c.lineTo(-w + 17 * s, h - 40 * s); c.stroke();
  c.lineWidth = 5 * s; c.strokeStyle = 'rgba(255,255,255,0.18)';
  c.beginPath(); c.moveTo(w - 15 * s, -h + 70 * s); c.lineTo(w - 15 * s, -h + 112 * s); c.stroke();
  c.lineWidth = 4 * s; c.strokeStyle = 'rgba(214,240,255,0.3)'; c.beginPath(); c.ellipse(0, h - 13 * s, w - 16 * s, 7 * s, 0, 0, Math.PI); c.stroke();
  c.restore();
  if (lid) ffLid(x + lid.dx, y - h - 9 * s + lid.dy, s, lid.rot || 0);
}
function ffLid(x, y, s, rot = 0) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot);
  rrect(c, -68 * s, -15 * s, 136 * s, 30 * s, 8 * s); c.fillStyle = '#A9B1C2'; c.fill();
  rrect(c, -68 * s, -15 * s, 136 * s, 11 * s, 6 * s); c.fillStyle = '#DDE2EC'; c.fill();
  paint(() => { for (let i = -6; i <= 6; i++) line(c, i * 10 * s, -1 * s, i * 10 * s, 12 * s, 2.4 * s, 'rgba(70,80,104,0.6)'); });
  c.restore();
}

// ---------------------------------------------------------------- a glow stick (screen or world units)
// (x, y) its middle, len, w, rot; o: {lit 0..1, bend: how far its middle is pushed (units), vial: 1 whole .. 0 gone,
// wings: 0..1 (it grows a pair, and antennae), mix: 0..1 the two liquids swirling together, t}
function ffStick(x, y, len, w, rot, o = {}) {
  const lit = clamp(o.lit || 0), bend = o.bend || 0, t = o.t || 0, hl = len / 2;
  const path = (c) => { c.beginPath(); c.moveTo(-hl, 0); c.quadraticCurveTo(0, -2 * bend, hl, 0); };
  const tr = (c) => { c.save(); c.translate(x, y); c.rotate(rot); };
  const c = ctx;
  tr(c); tr(gctx);
  // wings and antennae come first: they sit behind the tube
  const wk = o.wings || 0;
  if (wk > 0.01) {
    for (const sd of [-1, 1]) {
      for (let g = 0; g < 2; g++) {
        c.save(); c.translate(-hl * 0.18, sd * w * 0.3); c.rotate(sd * (0.95 + 0.4 * Math.sin(t * 58 + g * 2)) ); c.scale(wk, wk);
        ellipse(c, 0, sd * w * 1.5, w * 0.62, w * 1.7, `rgba(214,236,255,${0.2 + 0.08 * g})`);
        c.restore();
      }
      const q = 0.2 * Math.sin(t * 12 + sd);
      c.lineCap = 'round'; c.lineWidth = w * 0.1; c.strokeStyle = '#221A2B';
      c.beginPath(); c.moveTo(-hl - w * 0.1, sd * w * 0.18); c.quadraticCurveTo(-hl - w * 0.6 * wk, sd * w * (0.4 + q) * wk, -hl - w * 0.95 * wk, sd * w * (0.85 + q) * wk); c.stroke();
      circle(c, -hl - w * 0.95 * wk, sd * w * (0.85 + q) * wk, w * 0.1 * wk, '#221A2B');
    }
  }
  // the tube: plastic, then the liquid
  c.lineCap = 'round';
  path(c); c.lineWidth = w; c.strokeStyle = mixHex('#52624A', '#E9FFB0', lit); c.stroke();
  path(c); c.lineWidth = w * 0.74; c.strokeStyle = mixHex('#7C9A5A', FF.GLOW, lit); c.stroke();
  paint(() => {
    // the little glass vial inside: whole, then in pieces
    const v = o.vial === undefined ? 1 : o.vial;
    if (v > 0.5) { c.beginPath(); c.moveTo(-hl * 0.62, 0); c.quadraticCurveTo(0, -2 * bend * 0.86, hl * 0.62, 0); c.lineWidth = w * 0.3; c.strokeStyle = 'rgba(160,225,255,0.85)'; c.stroke(); }
    else if (lit < 0.98 || o.shards) {
      const rng = mulberry32(41), mx = o.mix || 0;
      for (let i = 0; i < 9; i++) { const u = (rng() - 0.5) * 1.2, px = u * hl + 30 * mx * Math.sin(i * 2.3 + t * 5), py = (rng() - 0.5) * w * 0.5; line(c, px - 7, py - 3 * Math.sin(i), px + 7, py + 3 * Math.sin(i), w * 0.07, `rgba(190,235,255,${0.8 * (1 - 0.7 * mx)})`); }
      for (let i = 0; i < 7; i++) { const u = (rng() - 0.5) * 1.3, px = u * hl * (0.2 + 0.8 * mx), py = (rng() - 0.5) * w * 0.4; circle(c, px, py, w * (0.06 + 0.08 * rng()), `rgba(160,225,255,${0.7 * (1 - mx)})`); }
    }
    path(c); c.lineWidth = w * 0.12; c.strokeStyle = `rgba(255,255,255,${0.3 + 0.25 * lit})`; c.save(); c.translate(0, -w * 0.25); c.stroke(); c.restore();
    // end caps
    for (const sd of [-1, 1]) { rrect(c, sd * hl - w * 0.16 + sd * w * 0.3, -w * 0.52, w * 0.32, w * 1.04, w * 0.1); c.fillStyle = '#3B4658'; c.fill(); }
    if (wk > 0.3) {   // a face that did not ask for this
      for (const sd of [-1, 1]) { circle(c, -hl * 0.62, sd * w * 0.2, w * 0.15, '#FFFFFF'); circle(c, -hl * 0.62 - 1, sd * w * 0.2, w * 0.07, '#17122A'); }
    }
  });
  if (lit > 0.02) {
    path(gctx); gctx.lineCap = 'round'; gctx.lineWidth = w * 0.8; gctx.strokeStyle = rgba(FF.GLOW, 0.75 * lit); gctx.stroke();
    softDot(gctx, 0, -bend, hl * 0.9, FF.GLOW, 0.32 * lit);
  }
  c.restore(); gctx.restore();
}

// ---------------------------------------------------------------- a light bulb, hanging where a lamp should be (bug units via the caller's transform)
// (x, y) = the top of its screw cap; heat 0..1
function ffBulb(x, y, s, heat, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -15, 0, 30, 24, 4); c.fillStyle = '#9AA3B5'; c.fill();
  paint(() => { for (const yy of [6, 12, 18]) line(c, -15, yy, 15, yy + 2, 2, '#5E6780'); });
  c.beginPath(); c.moveTo(-15, 22); c.quadraticCurveTo(-48, 46, -42, 82); c.quadraticCurveTo(-30, 118, 0, 118); c.quadraticCurveTo(30, 118, 42, 82); c.quadraticCurveTo(48, 46, 15, 22); c.closePath();
  c.fillStyle = mixHex('#C9D4E4', '#FFE9A8', heat); c.fill();
  paint(() => {
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 3.2; c.strokeStyle = mixHex('#6A7388', '#FF7A1E', heat);
    c.beginPath(); c.moveTo(-8, 24); c.lineTo(-10, 60); for (let i = 0; i <= 6; i++) c.lineTo(-10 + i * 3.3, 60 + (i % 2 ? -9 : 0)); c.lineTo(10, 60); c.lineTo(8, 24); c.stroke();
    ellipse(c, -18, 62, 7, 16, 'rgba(255,255,255,0.4)', 0.3);
  });
  c.restore();
  if (heat > 0.02) {
    gctx.save(); gctx.translate(x, y); gctx.scale(s, s);
    gctx.beginPath(); gctx.arc(0, 74, 40, 0, 7); gctx.fillStyle = `rgba(255,190,90,${0.7 * heat})`; gctx.fill();
    softDot(gctx, 0, 72, 150, '#FF9A3C', 0.5 * heat);
    gctx.restore();
  }
}
// heat shimmer: wavy lines rising from a point (world or screen units)
function ffHeat(x, y, s, k, t, n = 4, col = '#FF8A4A') {
  if (k <= 0.02) return;
  paint(() => {
    for (let i = 0; i < n; i++) {
      const ox = (i - (n - 1) / 2) * 34 * s, ph = (t * 1.3 + i * 0.37) % 1;
      ctx.lineCap = 'round'; ctx.lineWidth = 6 * s; ctx.strokeStyle = rgba(col, 0.75 * k * Math.sin(Math.PI * ph));
      ctx.beginPath();
      for (let j = 0; j <= 8; j++) { const u = j / 8, yy = y - (ph * 80 + u * 70) * s, xx = x + ox + Math.sin(u * 6 + t * 7 + i) * 9 * s; if (j) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.stroke();
    }
  });
}

// ---------------------------------------------------------------- a thermometer (screen units); level 0..1
function ffThermo(x, y, s, level, k = 1) {
  if (k <= 0) return;
  const c = ctx, e = E.outBack(clamp(k), 1.8);
  c.save(); c.translate(x, y); c.scale(s * e, s * e);
  rrect(c, -17, -150, 34, 236, 17); c.fillStyle = '#EEF2FA'; c.fill();
  circle(c, 0, 96, 34, '#EEF2FA');
  const col = mixHex('#49B8FF', '#FF4A3A', clamp((level - 0.25) / 0.6));
  paint(() => {
    circle(c, 0, 96, 24, col);
    const top = lerp(76, -132, clamp(level));
    rrect(c, -8, top, 16, 96 - top, 8); c.fillStyle = col; c.fill();
    for (let i = 0; i < 7; i++) line(c, 17, -128 + i * 30, i % 2 ? 27 : 33, -128 + i * 30, 3, '#8E96A8');
    ellipse(c, -8, 88, 6, 9, 'rgba(255,255,255,0.5)', 0.4);
  });
  c.restore();
  if (level > 0.6) softDot(gctx, x, y + 96 * s, 90 * s, '#FF4A3A', 0.4 * (level - 0.6) * 2.5 * k);
}

// ---------------------------------------------------------------- a flame, and the line through it (screen units)
function ffNoFlame(x, y, s, k, kx, t) {
  if (k <= 0) return;
  const c = ctx, e = E.outBack(clamp(k), 2);
  c.save(); c.translate(x, y); c.scale(s * e, s * e);
  circle(c, 0, 0, 78, '#10182E');
  paint(() => {
    const fl = 1 + 0.06 * Math.sin(t * 23);
    c.beginPath(); c.moveTo(0, 46); c.bezierCurveTo(46, 30, 38, -18, 6, -52 * fl); c.bezierCurveTo(8, -24, -14, -18, -16, -34); c.bezierCurveTo(-42, -8, -44, 34, 0, 46); c.closePath(); c.fillStyle = '#FF8A1E'; c.fill();
    c.beginPath(); c.moveTo(0, 42); c.bezierCurveTo(24, 32, 20, 6, 4, -12 * fl); c.bezierCurveTo(0, 4, -16, 8, -20, 22); c.bezierCurveTo(-18, 34, -10, 42, 0, 42); c.closePath(); c.fillStyle = '#FFE08A'; c.fill();
    c.lineWidth = 8; c.strokeStyle = kx > 0.5 ? '#FF3A4A' : '#8FB8FF'; c.beginPath(); c.arc(0, 0, 78, 0, 7); c.stroke();
    if (kx > 0) { c.lineCap = 'round'; c.lineWidth = 16; c.strokeStyle = '#FF3A4A'; const u = clamp(kx); c.beginPath(); c.moveTo(-54, -54); c.lineTo(-54 + 108 * u, -54 + 108 * u); c.stroke(); }
  });
  c.restore();
  if (kx > 0) { softDot(gctx, x, y, 110 * s, '#FF3A4A', 0.3 * clamp(kx) * e); }
}

// ---------------------------------------------------------------- a flash pattern, written down (screen units)
// marks: [[start, length], ...] in beats along a strip `beats` long; `play` 0..1 = how much of it has been flashed so far
function ffStrip(x, y, w, marks, beats, play, col, k = 1, h = 54) {
  if (k <= 0) return;
  const c = ctx, e = E.outBack(clamp(k), 2);
  c.save(); c.translate(x, y); c.scale(e, e);
  rrect(c, -w / 2, -h / 2, w, h, h / 2); c.fillStyle = 'rgba(8,14,30,0.9)'; c.fill();
  paint(() => {
    c.lineWidth = 3.5; c.strokeStyle = rgba(col, 0.75); rrect(c, -w / 2, -h / 2, w, h, h / 2); c.stroke();
    const x0 = -w / 2 + h * 0.55, L = w - h * 1.1, r = h * 0.21;
    for (const [a, len] of marks) {
      const on = play * beats >= a + 0.05;
      const xa = x0 + (a / beats) * L, xb = x0 + ((a + len) / beats) * L;
      c.lineCap = 'round'; c.lineWidth = 2 * r; c.strokeStyle = on ? col : 'rgba(120,140,170,0.35)';
      c.beginPath(); c.moveTo(xa + r, 0); c.lineTo(Math.max(xa + r + 0.1, xb - r), 0); c.stroke();
    }
  });
  c.restore();
  // the lit marks glow
  gctx.save(); gctx.translate(x, y); gctx.scale(e, e);
  const x0 = -w / 2 + h * 0.55, L = w - h * 1.1, r = h * 0.21;
  for (const [a, len] of marks) {
    const age = play * beats - a;
    if (age < 0.05) continue;
    const xa = x0 + (a / beats) * L, xb = x0 + ((a + len) / beats) * L;
    gctx.lineCap = 'round'; gctx.lineWidth = 2 * r; gctx.strokeStyle = rgba(col, 0.3 + 0.5 * Math.exp(-age * 1.2));
    gctx.beginPath(); gctx.moveTo(xa + r, 0); gctx.lineTo(Math.max(xa + r + 0.1, xb - r), 0); gctx.stroke();
  }
  gctx.restore();
}

// ---------------------------------------------------------------- what the big female carries
// a paper mask of the small female's face, on a stick (units of the bug that holds it; (x, y) = the middle of the face)
function ffMask(x, y, s, rot = 0) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  line(c, -26, 30, -44, 104, 7, '#B98A52');
  circle(c, 0, 0, 43, '#F7F4EC');
  paint(() => {
    circle(c, 0, 2, 37, '#4A3B58');
    c.beginPath(); c.moveTo(-40, -6); c.quadraticCurveTo(-38, -44, 0, -46); c.quadraticCurveTo(38, -44, 40, -6); c.quadraticCurveTo(0, -22, -40, -6); c.closePath(); c.fillStyle = '#EB6A3C'; c.fill();
    for (const sd of [-1, 1]) {
      ellipse(c, sd * 15, 2, 12, 14, '#FFFFFF'); circle(c, sd * 15, 3, 6.5, '#17122A'); circle(c, sd * 15 - 2, 0.5, 2.2, '#FFFFFF');
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + sd * (0.5 + 0.38 * i); line(c, sd * 15 + Math.cos(a) * 12, 2 + Math.sin(a) * 14, sd * 15 + Math.cos(a) * 20, 2 + Math.sin(a) * 21, 2.6, '#17122A'); }
    }
    c.lineCap = 'round'; c.lineWidth = 3.6; c.strokeStyle = '#FF4D7A'; c.beginPath(); c.moveTo(-9, 22); c.quadraticCurveTo(0, 30, 9, 22); c.stroke();
    ellipse(c, -27, 16, 6, 4, 'rgba(255,120,150,0.5)'); ellipse(c, 27, 16, 6, 4, 'rgba(255,120,150,0.5)');
  });
  c.restore();
}
function ffFork(x, y, s, rot = 0) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  line(c, 0, 0, 0, -52, 6, '#DDE2EC');
  line(c, -9, -52, 9, -52, 6, '#DDE2EC');
  for (const xx of [-9, 0, 9]) line(c, xx, -52, xx, -76, 4.4, '#DDE2EC');
  c.restore();
}
function ffKnife(x, y, s, rot = 0) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  line(c, 0, 0, 0, -30, 7, '#8E5A3A');
  c.beginPath(); c.moveTo(-4, -30); c.lineTo(-4, -80); c.quadraticCurveTo(9, -70, 7, -30); c.closePath(); c.fillStyle = '#DDE2EC'; c.fill();
  c.restore();
}
// three small flowers in a paper cone ((x, y) = where it is held)
function ffFlowers(x, y, s, rot = 0) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 8); c.lineTo(-17, -32); c.lineTo(17, -32); c.closePath(); c.fillStyle = '#F7F4EC'; c.fill();
  paint(() => {
    [[-13, -44, '#FF86A6'], [0, -54, '#FFD447'], [13, -44, '#C8A8FF']].forEach(([fx, fy, col]) => {
      line(c, fx * 0.4, -30, fx, fy, 2.6, '#4DBB7A');
      for (let i = 0; i < 5; i++) { const a = i * 1.257; circle(c, fx + Math.cos(a) * 6.5, fy + Math.sin(a) * 6.5, 5, col); }
      circle(c, fx, fy, 3.6, '#FFF6C8');
    });
  });
  c.restore();
}
// a comic burst with a word in it (screen units)
function ffBurst(txt, x, y, r, k, col = '#FFD447', ink = '#3A0A18', rot = -0.08, seed = 3) {
  if (k <= 0) return;
  const c = ctx, e = E.outBack(clamp(k), 2.6), rng = mulberry32(seed), n = 14;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(rot); c.scale(e, e);
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * (0.72 + 0.08 * rng()) : r * (1.0 + 0.16 * rng()); c.lineTo(Math.cos(a) * rr * 1.25, Math.sin(a) * rr * 0.8); }
  c.closePath(); c.fillStyle = col; c.fill();
  paint(() => {
    c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = ink; c.stroke();
    c.font = `400 ${r * 0.62}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = ink; c.fillText(txt, 0, r * 0.04);
  });
  c.restore();
  softDot(gctx, x, y, r * 1.5, col, 0.22 * clamp(k));
}
