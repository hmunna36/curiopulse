// The rest of the cast: a mummy in sunglasses (the hiker's rig wrapped in bandages, holding a NATRON jar), a flamingo chick
// (a grey fluff ball) on its mud-cone nest on a white salt island, and a spotted hyena that dips a paw in and regrets it.
'use strict';

// ---------------------------------------------------------------- the mummy (the rig in bandages)
const MUMPAL = Object.assign({}, PAL, { skin: '#E9DDC2', skinSh: '#CDBE9C', skinHi: '#F6EEDA', hair: '#DCCDAE', hairHi: '#EFE4CC',
  coat: '#E5D8BC', coatSh: '#C6B590', coatHi: '#F4ECD8', coatDk: '#B9A67F', strap: '#E5D8BC', strapSh: '#C6B590', bare: true });
const MUMFACE = { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: 0.3, browTilt: 0, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 };
// x, y: its feet (world); A: {s, jar: [x, y] (world: where the jar is held), thumb 0..1, turn (head tilt), pop 0..1 (it appears)}
function ntMummy(c, x, y, t, A = {}) {
  const s = (A.s || 0.82) * E.outBack(clamp(A.pop === undefined ? 1 : A.pop), 1.6);
  if (s <= 0.01) return null;
  const st = { x, y, s, face: MUMFACE, noLegs: true, headRot: A.turn || 0 };
  let pose = JSON.parse(JSON.stringify(POSES.sit));
  if (A.jar) pose = ikReach(pose, 'R', ikLocal(st, A.jar[0], A.jar[1]), -1);
  pose.armL = { a: lerp(0.45, 2.2, clamp(A.thumb || 0)), b: lerp(-0.35, 1.25, clamp(A.thumb || 0)) };
  pose.handL = clamp(A.thumb || 0) > 0.5 ? 'thumb' : 'open';
  const r = drawCharacter(c, Object.assign({}, st, { pose }), t, MUMPAL);
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    // bandage wraps: on the head (round its face) and across the body and arms
    const hd = [r.head[0], r.head[1]];
    c.save(); c.translate(hd[0], hd[1]); c.rotate(A.turn || 0);
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(-64, i * 18 - 6); c.quadraticCurveTo(0, i * 18 + 6 + (i % 2 ? 4 : -4), 64, i * 18 - 2); c.lineWidth = 3; c.strokeStyle = 'rgba(160,140,100,0.65)'; c.stroke(); }
    // sunglasses (round, very cool)
    for (const sx of [-24, 24]) { circle(c, sx, -3, 19, '#16121E'); c.beginPath(); c.arc(sx - 5, -8, 7, Math.PI * 1.1, Math.PI * 1.6); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.6)'; c.stroke(); }
    line(c, -6, -5, 6, -5, 4, '#16121E');
    c.restore();
    for (let i = 0; i < 7; i++) { const yy = -40 - i * 20 + r.P[1] + 34; c.beginPath(); c.moveTo(-80, yy); c.quadraticCurveTo(0, yy + (i % 2 ? 10 : -6), 82, yy - 6); c.lineWidth = 3; c.strokeStyle = 'rgba(160,140,100,0.55)'; c.stroke(); }
    c.restore();
  });
  return { st, r, wp: (p) => [x + p[0] * s, y + p[1] * s] };
}
// a jar of natron (world units; its middle at x, y): a clay jar with a label, salt heaped on top
function ntJar(c, x, y, s = 1, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-34, -40); c.quadraticCurveTo(-56, 0, -36, 46); c.lineTo(36, 46); c.quadraticCurveTo(56, 0, 34, -40); c.closePath();
  c.fillStyle = '#C46A3A'; c.fill();
  rrect(c, -30, -52, 60, 16, 6); c.fillStyle = '#A3552C'; c.fill();
  c.beginPath(); c.moveTo(-28, -50); c.quadraticCurveTo(0, -78, 28, -50); c.closePath(); c.fillStyle = '#F6EFE6'; c.fill();   // the salt
  paint(() => {
    rrect(c, -36, -16, 72, 30, 6); c.fillStyle = '#F2E2B8'; c.fill();
    c.font = '900 18px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3A1E10'; c.fillText('NATRON', 0, 0);
    line(c, -30, 24, 30, 24, 3, 'rgba(90,40,20,0.5)');
  });
  c.restore();
}
// a puff of sand-coloured dust (world units), k 0..1 its age
function ntPoof(c, x, y, s, k, seed = 1) {
  if (k <= 0 || k >= 1) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < 12; i++) {
    const a = rng() * 6.283, d = (30 + 60 * rng()) * s * E.outCubic(k), r = (18 + 22 * rng()) * s * (1 - 0.5 * k);
    circle(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, r, rgba('#F1E2C4', 0.85 * (1 - k)));
  }
}

// ---------------------------------------------------------------- the chick and its nest
// the nest: a mud cone with a hollow on top (world units; its base centred at x, y, width w)
function ntNest(c, x, y, w = 160) {
  c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x - w * 0.36, y - w * 0.2, x - w * 0.3, y - w * 0.36);
  c.lineTo(x + w * 0.3, y - w * 0.36); c.quadraticCurveTo(x + w * 0.36, y - w * 0.2, x + w / 2, y); c.closePath();
  c.fillStyle = '#8C6450'; c.fill();
  ellipse(c, x, y - w * 0.36, w * 0.3, w * 0.07, '#5E3E30');
  paint(() => { for (let i = 0; i < 5; i++) line(c, x - w * 0.4 + i * w * 0.18, y - 4, x - w * 0.34 + i * w * 0.16, y - w * 0.3, 2, 'rgba(70,40,30,0.35)'); });
}
// the chick: a grey fluff ball (x, y = where it sits; s ~1 = 90 wide). o: {face: 'open' | 'smug' | 'shut', look, hop}
function ntChick(c, x, y, s, t, o = {}) {
  const hop = o.hop || 0;
  c.save(); c.translate(x, y - hop * 20 * s); c.scale(s, s);
  const rng = mulberry32(9);
  for (let i = 0; i < 22; i++) { const a = (i / 22) * 6.283, r = 44 + 4 * Math.sin(i * 3.3 + t * 2); circle(c, Math.cos(a) * r * 0.95, -46 + Math.sin(a) * r * 0.9, 12 + 3 * rng(), '#9C9AA3'); }
  ellipse(c, 0, -46, 44, 41, '#A9A7B0');
  ellipse(c, 4, -30, 26, 20, '#C6C4CC');
  circle(c, -24, -90, 25, '#A9A7B0');                                          // the head
  for (let i = 0; i < 8; i++) { const a = -Math.PI + (i / 7) * Math.PI; circle(c, -24 + Math.cos(a) * 24, -90 + Math.sin(a) * 24, 7, '#9C9AA3'); }
  c.beginPath(); c.moveTo(-44, -92); c.lineTo(-64, -86); c.lineTo(-44, -80); c.closePath(); c.fillStyle = '#E9B7B7'; c.fill();   // a straight little beak
  line(c, -8, -6, -12, 6, 6, '#C49A9A'); line(c, 10, -6, 12, 6, 6, '#C49A9A');
  paint(() => {
    const f = o.face || 'open', lk = o.look || [-0.4, 0];
    if (f === 'smug') { for (const ex of [-34, -16]) { c.beginPath(); c.arc(ex, -94, 5, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 3; c.strokeStyle = '#1A1420'; c.lineCap = 'round'; c.stroke(); } }
    else if (f === 'shut') { for (const ex of [-34, -16]) { c.beginPath(); c.arc(ex, -96, 5, 0.2, Math.PI - 0.2); c.lineWidth = 3; c.strokeStyle = '#1A1420'; c.stroke(); } }
    else for (const ex of [-34, -16]) { circle(c, ex, -95, 6.5, '#1A1420'); circle(c, ex + lk[0] * 1.5 - 1.5, -97 + lk[1], 2, '#FFFFFF'); }
    ellipse(c, -40, -78, 6, 4, 'rgba(255,140,150,0.4)');
  });
  c.restore();
}
// a white salt island lying on the water plane (screen space via the plane), returns its middle
function ntIsland(P, wx, u, rx, seed) {
  const [x, y, s] = ntAt(P, wx, u), RX = rx * s, RY = RX * (0.08 + 0.22 * Math.min(1.2, u));
  if (y < P.yW || RX < 2) return [x, y, s];
  const rng = mulberry32(seed), n = 16;
  screenSpace();
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, k = 0.78 + 0.3 * rng(); i ? ctx.lineTo(x + Math.cos(a) * RX * k, y + Math.sin(a) * RY * k) : ctx.moveTo(x + Math.cos(a) * RX * k, y + Math.sin(a) * RY * k); }
  ctx.closePath(); ctx.fillStyle = '#E9B4A6'; ctx.fill();
  ctx.save(); ctx.translate(x, y - RY * 0.15); ctx.scale(0.92, 0.82); ctx.translate(-x, -y); ctx.fillStyle = '#FBEDE6'; ctx.fill(); ctx.restore();
  return [x, y, s];
}

// ---------------------------------------------------------------- the hyena (profile, facing LEFT; x, y = the ground under
// its middle; s ~1 = 300 long). o: {walk (a phase), paw 0..1 (the front paw reaches out and down), yelp 0..1, back 0..1
// (it scrambles backwards), face: 'sniff' | 'yelp' | 'sulk', steam}
function ntHyena(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const ph = o.walk || 0, step = Math.sin(ph), paw = clamp(o.paw || 0), yelp = clamp(o.yelp || 0);
  const fur = '#B98E5A', furDk = '#8C6438', spot = '#4A3222', muzzle = '#3A2A20';
  const leg = (x0, y0, ang, L, w, col) => { const x1 = x0 + Math.sin(ang) * L, y1 = y0 + Math.cos(ang) * L; line(c, x0, y0, x1, y1, w, col); return [x1, y1]; };
  // far legs
  leg(70, -110, 0.15 * step, 110, 24, furDk); leg(-80, -130, -0.18 * step, 128, 26, furDk);
  // the tail
  c.beginPath(); c.moveTo(100, -150); c.quadraticCurveTo(140, -130 + 10 * Math.sin(t * 6), 132, -90); c.lineWidth = 12; c.strokeStyle = furDk; c.lineCap = 'round'; c.stroke();
  // the body: high shoulders, a sloping back
  c.beginPath(); c.moveTo(-120, -190); c.quadraticCurveTo(-40, -220, 40, -176); c.quadraticCurveTo(110, -160, 112, -120);
  c.quadraticCurveTo(100, -88, 40, -92); c.quadraticCurveTo(-60, -84, -110, -110); c.quadraticCurveTo(-140, -150, -120, -190); c.closePath();
  c.fillStyle = fur; c.fill();
  paint(() => { const rng = mulberry32(4); for (let i = 0; i < 16; i++) circle(c, -100 + rng() * 200, -180 + rng() * 80, 5 + 4 * rng(), rgba(spot, 0.7)); });
  // the mane along the neck and back
  c.beginPath(); c.moveTo(-130, -200); for (let i = 0; i <= 8; i++) c.lineTo(-130 + i * 26, -206 + (i % 2 ? -10 : 4) + i * 3); c.lineTo(80, -170); c.lineTo(-120, -186); c.closePath(); c.fillStyle = furDk; c.fill();
  // near legs: the front one reaches for the water when o.paw
  const fx = -96, fy = -118;
  if (paw > 0.01) { const a = lerp(-0.2 * step, -0.95, paw); const k = leg(fx, fy, a, lerp(128, 120, paw), 26, fur); circle(c, k[0], k[1], 14, furDk); if (o.steam > 0.01) snWisps({ c, x: k[0], y: k[1], t, n: 10, seed: 3, col: '#FFFFFF', size: 26, rise: 160, spread: 30, life: 0.9, alpha: 0.5 * o.steam, glow: 0.3, sway: 40 }); }
  else { const k = leg(fx, fy, 0.2 * step, 128, 26, fur); circle(c, k[0], k[1], 14, furDk); }
  { const k = leg(90, -104, -0.18 * step, 104, 24, fur); circle(c, k[0], k[1], 13, furDk); }
  // the head: big, round ears, a dark muzzle; it tips down to sniff, up to yelp
  const hr = lerp(0.18, -0.55, yelp);
  c.save(); c.translate(-150, -192); c.rotate(hr);
  ellipse(c, 0, 0, 52, 44, fur);
  for (const ex of [8, 34]) { ellipse(c, ex, -44, 15, 22, furDk); ellipse(c, ex, -42, 8, 13, '#E8B0A0'); }
  c.beginPath(); c.moveTo(-30, -14); c.quadraticCurveTo(-92, -10, -96, 14); c.quadraticCurveTo(-80, 36, -24, 28); c.closePath(); c.fillStyle = fur; c.fill();
  ellipse(c, -86, 4, 14, 16, muzzle);
  paint(() => {
    if (yelp > 0.3) { c.beginPath(); c.moveTo(-90, 20); c.lineTo(-40, 26); c.lineTo(-70, 44 * yelp); c.closePath(); c.fillStyle = '#5A1A20'; c.fill(); }
    const f = o.face || 'sniff';
    if (f === 'yelp') { c.beginPath(); c.moveTo(-26, -16); c.lineTo(-12, -8); c.lineTo(-26, -2); c.lineWidth = 4; c.strokeStyle = '#1A1010'; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
    else { circle(c, -20, -10, 8, '#FFFFFF'); circle(c, -23, -10, 5, '#1A1010'); circle(c, -24.5, -11.5, 1.5, '#FFFFFF'); if (f === 'sulk') line(c, -30, -22, -10, -18, 3, '#1A1010'); }
  });
  c.restore();
  c.restore();
}
