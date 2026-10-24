// The lake's birds. The lesser flamingo as a character (nbFlamingo: live, or a chalk-white "statue" coated in soda), small
// flamingos as sprites for the crowds (wading groups on the water plane, lines on the far shore, flocks in the sky), and
// the swallow that falls in (nbSwallow, with the drying and the crust as two dials).
// Bird units: a flamingo's body is about 150 wide; (0, 0) is the middle of the body; it faces LEFT unless o.flip = -1.
'use strict';

const FLAM = { body: '#FF8FB0', bodySh: '#F0628E', wing: '#FF6F9C', prim: '#2A1830', neck: '#FF9DBA', leg: '#F0708F',
  beak0: '#FFD2DC', beak1: '#C8284A', beakTip: '#1A1020', eye: '#FFF4D6', iris: '#F2A51A' };
const STONE = { body: '#F1E9DE', bodySh: '#D8CBBB', wing: '#E6DACB', prim: '#B3A391', neck: '#F3ECE2', leg: '#E2D5C6',
  beak0: '#EDE4D8', beak1: '#CFC1AF', beakTip: '#9C8E7E', eye: '#F6F0E6', iris: '#F6F0E6' };

// the neck as a cubic from its base (on the body) to the head; returns the head's place and the neck's direction there
function nbNeck(o) {
  const b0 = [-50, -24], h = o.head || [-96, -196];
  const c1 = o.c1 || [b0[0] - 10, b0[1] - 90], c2 = o.c2 || [h[0] + 70, h[1] + 30];
  return { b0, c1, c2, h };
}
function nbBez(n, u) {
  const v = 1 - u;
  return [v * v * v * n.b0[0] + 3 * v * v * u * n.c1[0] + 3 * v * u * u * n.c2[0] + u * u * u * n.h[0],
    v * v * v * n.b0[1] + 3 * v * v * u * n.c1[1] + 3 * v * u * u * n.c2[1] + u * u * u * n.h[1]];
}
// a leg: hip -> ankle (the joint that bends BACKWARD) -> foot; up = 0..1 folds it under the body
function nbLeg(c, P, hip, foot, up, wade) {
  const ank = [lerp((hip[0] + foot[0]) / 2 + 26, hip[0] + 34, up), lerp((hip[1] + foot[1]) / 2, hip[1] + 30, up)];
  const ft = [lerp(foot[0], hip[0] + 6, up), lerp(foot[1], hip[1] + 56, up)];
  line(c, hip[0], hip[1], ank[0], ank[1], 9, P.leg);
  line(c, ank[0], ank[1], ft[0], ft[1], 8, P.leg);
  circle(c, ank[0], ank[1], 6.5, P.leg);
  if (up < 0.5 && !wade) { c.beginPath(); c.moveTo(ft[0] - 22, ft[1] + 3); c.lineTo(ft[0] + 8, ft[1] - 3); c.lineTo(ft[0] + 12, ft[1] + 4); c.closePath(); c.fillStyle = P.leg; c.fill(); }
  return { ank, ft };
}

// the flamingo. o: {stone, head: [x, y], c1, c2 (the neck), beak (radians: + tips it down), face: 'chill' | 'open' |
// 'happy' | 'side' | 'blank' | 'shut', look: [x, y] (the pupil, -1..1), legs: {L: [x, y] | null, R: [x, y], upR 0..1},
// wade (a water line in bird units: the legs end there), wing (0 folded .. 1 open and up: the beckon), wingWave,
// shades (sunglasses), crust 0..1 (the statue's crust texture), flip}
function nbFlamingo(c, x, y, s, t, o = {}) {
  const P = o.stone ? STONE : (o.pal || FLAM), fl = o.flip || 1;
  c.save(); c.translate(x, y); c.scale(s * fl, s);
  if (o.tilt) c.rotate(o.tilt);
  const n = nbNeck(o);
  // legs (behind the body)
  const legs = o.legs || { L: [-10, 236], R: [16, 236] };
  if (legs.L) nbLeg(c, P, [-6, 34], legs.L, 0, o.wade !== undefined);
  if (legs.R) nbLeg(c, P, [14, 34], legs.R, legs.upR || 0, o.wade !== undefined);
  // the far wing when it opens (behind the body)
  const wg = clamp(o.wing || 0);
  // the body: an egg tipped up at the front, the tail to the right
  c.save(); c.rotate(-0.1);
  c.beginPath(); c.moveTo(-74, 0);
  c.bezierCurveTo(-74, -46, -10, -52, 34, -40); c.bezierCurveTo(70, -30, 92, -14, 96, -6);
  c.bezierCurveTo(80, 10, 60, 38, 10, 42); c.bezierCurveTo(-40, 46, -74, 30, -74, 0); c.closePath();
  c.fillStyle = P.body; c.fill();
  c.restore();
  // the folded wing, its black flight feathers at the back
  if (wg < 0.5) {
    c.save(); c.rotate(-0.1);
    c.beginPath(); c.moveTo(-40, -22); c.bezierCurveTo(-10, -40, 50, -36, 92, -14); c.bezierCurveTo(60, 8, 10, 14, -30, 4); c.closePath();
    c.fillStyle = P.wing; c.fill();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(56 + i * 3, -20 + i * 6); c.quadraticCurveTo(90 + i * 4, -18 + i * 6, 112 - i * 4, -10 + i * 7); c.lineWidth = 8 - i; c.strokeStyle = P.prim; c.lineCap = 'round'; c.stroke(); }
    c.restore();
  }
  // the neck
  const N = 24;
  const pts = [...Array(N + 1)].map((_, i) => nbBez(n, i / N));
  for (let i = 0; i < N; i++) line(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], lerp(25, 14, i / N), P.neck);
  // the head and the beak (o.nod: + tips the beak down, toward the chest)
  const hd = n.h;
  c.save(); c.translate(hd[0], hd[1]); c.rotate(-(o.nod === undefined ? 0.12 : o.nod));
  // the head: small and round, a little forehead, the neck flowing in at the back
  c.beginPath(); c.moveTo(20, 4); c.bezierCurveTo(22, -16, 6, -23, -8, -21); c.bezierCurveTo(-20, -19, -25, -8, -23, 2);
  c.bezierCurveTo(-20, 14, -4, 18, 8, 16); c.bezierCurveTo(16, 14, 20, 10, 20, 4); c.closePath();
  c.fillStyle = P.neck; c.fill();
  // the beak: deep at the base, bent sharply DOWN halfway (the flamingo's "Roman nose"), the tip hooking back;
  // pale at the base, crimson, black at the tip
  c.beginPath();
  c.moveTo(-14, -15); c.quadraticCurveTo(-36, -18, -46, -8); c.quadraticCurveTo(-55, 2, -50, 22);
  c.quadraticCurveTo(-48, 31, -41, 32); c.quadraticCurveTo(-44, 22, -38, 14); c.quadraticCurveTo(-30, 8, -14, 9); c.closePath();
  const bg = c.createLinearGradient(-16, -6, -46, 30);
  bg.addColorStop(0, P.beak0); bg.addColorStop(0.42, P.beak0); bg.addColorStop(0.55, P.beak1); bg.addColorStop(0.74, P.beak1); bg.addColorStop(0.8, P.beakTip); bg.addColorStop(1, P.beakTip);
  c.fillStyle = bg; c.fill();
  paint(() => { c.beginPath(); c.moveTo(-15, -2); c.quadraticCurveTo(-30, -2, -42, 6); c.lineWidth = 2; c.strokeStyle = rgba(P.beakTip, 0.45); c.lineCap = 'round'; c.stroke(); });
  c.restore();
  // the eye (paint): a small golden eye for the live bird, a blank pale statue's eye for the stone one
  paint(() => {
    c.save(); c.translate(hd[0], hd[1]); c.rotate(-(o.nod === undefined ? 0.12 : o.nod)); c.translate(1, -6);
    const f = o.stone ? 'blank' : (o.face || 'chill'), lk = o.look || [-0.3, 0];
    if (f === 'blank') { circle(c, 0, 0, 5.6, '#FBF7F0'); c.beginPath(); c.arc(0, 0, 5.6, 0, 7); c.lineWidth = 1.4; c.strokeStyle = 'rgba(160,145,128,0.75)'; c.stroke(); line(c, -6, -6, 5, -7.5, 2, 'rgba(160,145,128,0.6)'); }
    else if (f === 'happy' || f === 'shut') { c.beginPath(); c.arc(0, f === 'happy' ? 3 : 0, 6, f === 'happy' ? Math.PI * 1.1 : 0.15, f === 'happy' ? Math.PI * 1.9 : Math.PI - 0.15); c.lineWidth = 3; c.strokeStyle = '#3A1020'; c.lineCap = 'round'; c.stroke(); }
    else {
      const r = f === 'open' || f === 'side' ? 7 : 6.4;
      circle(c, 0, 0, r, P.eye); circle(c, lk[0] * 2.2, lk[1] * 2, r * 0.68, P.iris); circle(c, lk[0] * 2.6, lk[1] * 2.4, r * 0.34, '#120814');
      circle(c, lk[0] * 2.6 - 1.4, lk[1] * 2.4 - 1.6, 1.4, '#FFFFFF');
      if (f === 'chill') { c.save(); c.beginPath(); c.arc(0, 0, r + 0.6, 0, 7); c.clip(); c.fillStyle = P.neck; c.fillRect(-r - 1, -r - 1, 2 * r + 2, r * 1.05); line(c, -r, 0.6, r, 0.6, 2.2, '#7A2040'); c.restore(); }
    }
    c.restore();
    if (o.crust > 0.01) {                                    // the statue's crust: grains and a few cracks
      const rng = mulberry32(o.seed || 3);
      c.save(); c.rotate(-0.1);
      for (let i = 0; i < 70; i++) { const px = -66 + rng() * 150, py = -40 + rng() * 76; circle(c, px, py, 1 + 2.2 * rng(), rgba('#B9AA97', 0.55 * o.crust)); }
      c.lineWidth = 1.6; c.strokeStyle = rgba('#A49482', 0.7 * o.crust);
      for (let i = 0; i < 6; i++) { const px = -50 + rng() * 120, py = -26 + rng() * 50; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 10 + rng() * 14, py + (rng() - 0.5) * 16); c.lineTo(px + 18 + rng() * 14, py + (rng() - 0.5) * 22); c.stroke(); }
      c.restore();
      for (let i = 0; i < 18; i++) { const u = rng(), p = nbBez(n, u); circle(c, p[0] + (rng() - 0.5) * 12, p[1] + (rng() - 0.5) * 8, 1 + 1.6 * rng(), rgba('#B9AA97', 0.5 * o.crust)); }
    }
    if (o.shades) {                                           // sunglasses
      c.save(); c.translate(hd[0], hd[1]); c.rotate(-(o.nod === undefined ? 0.12 : o.nod)); c.translate(0, -7);
      rrect(c, -13, -7, 24, 13, 5); c.fillStyle = '#16121E'; c.fill();
      line(c, 11, -3, 22, -6, 3, '#16121E');
      c.beginPath(); c.moveTo(-9, -4); c.lineTo(-3, -4); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
      c.restore();
    }
  });
  // the near wing opening (the beckon): a fan of pink with black tips, waving
  if (wg >= 0.5 || wg > 0.01) {
    const k = clamp((wg - 0.05) / 0.95), wave = (o.wingWave || 0);
    if (k > 0.01) {
      c.save(); c.translate(-20, -20); c.rotate(-0.4 - 1.5 * k + 0.35 * wave);
      for (let i = 0; i < 5; i++) {
        const a = -0.5 + i * 0.22, L = 120 + i * 8;
        c.save(); c.rotate(a);
        c.beginPath(); c.moveTo(0, -10); c.quadraticCurveTo(L * 0.5, -22, L, -4); c.quadraticCurveTo(L * 0.5, 12, 0, 10); c.closePath();
        c.fillStyle = i > 2 ? P.prim : P.wing; c.fill();
        c.restore();
      }
      c.restore();
    }
  }
  c.restore();
}

// where the beak's tip is (world), for a flamingo drawn at (x, y, s) with o (the same o)
function nbBeakTip(x, y, s, o = {}) {
  const n = nbNeck(o), a = -(o.nod === undefined ? 0.12 : o.nod), fl = o.flip || 1, tl = o.tilt || 0;
  const bx = -41 * Math.cos(a) - 32 * Math.sin(a), by = -41 * Math.sin(a) + 32 * Math.cos(a);
  let lx = n.h[0] + bx, ly = n.h[1] + by;
  if (tl) { const cs = Math.cos(tl), sn = Math.sin(tl); [lx, ly] = [lx * cs - ly * sn, lx * sn + ly * cs]; }
  return [x + lx * s * fl, y + ly * s];
}
function nbNeckAt(x, y, s, o, u) { const p = nbBez(nbNeck(o), u), fl = o.flip || 1; return [x + p[0] * s * fl, y + p[1] * s]; }
function nbHeadAt(x, y, s, o = {}) { const n = nbNeck(o), fl = o.flip || 1; return [x + n.h[0] * s * fl, y + n.h[1] * s]; }

// ---------------------------------------------------------------- small flamingos as sprites (the crowds)
// cached once: [stand, feed (head down), flap (wings up)] in pink, and the same in the statue's white
let NB_SPR = null;
const NB_SW = 90, NB_SH = 140;   // sprite size in px (the bird's body about 46 px wide)
function nbInitSprites() {
  NB_SPR = {};
  const kinds = { stand: {}, feed: { head: [-40, 40], c1: [-70, -60], c2: [-60, 10], nod: 1.5 }, flap: { wing: 1 } };
  for (const st of [false, true]) for (const [k, o] of Object.entries(kinds)) {
    const cv = mkCanvas(NB_SW, NB_SH), c = cv.getContext('2d');
    nbFlamingo(c, NB_SW * 0.52, NB_SH * 0.46, 0.3, 0, Object.assign({ stone: st, legs: { L: [-8, 210], R: [14, 210] }, face: 'chill' }, o));
    NB_SPR[(st ? 's_' : '') + k] = cv;
  }
}
// one small flamingo on the water plane at (wx, u), size h in world units at the near line; kind; mirrored reflection
function nbSmall(P, wx, u, h, kind, t, o = {}) {
  const [x, y, s] = ntAt(P, wx, u), sc = (h / NB_SH) * s;
  if (sc * NB_SH < 2.5 || y < P.yW - 2 || x < -80 || x > W + 80) return;
  const img = NB_SPR[(o.stone ? 's_' : '') + kind], w = NB_SW * sc, hh = NB_SH * sc;
  const dx = x - w * 0.52, dy = y - hh * 0.92;
  ctx.save();
  if (o.flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
  ctx.drawImage(img, dx, dy, w, hh);
  ctx.globalAlpha = sc < 0.45 ? 0.14 : 0.26; ctx.translate(0, 2 * y); ctx.scale(1, -1);   // its reflection (faint when small)
  ctx.drawImage(img, dx, dy, w, hh * 0.9);
  ctx.restore();
}
// a wading group: n birds round (wx, u), some feeding, one flapping now and then (a clock that loops)
function nbGroup(P, g, t) {
  const rng = mulberry32(g.seed);
  const birds = [...Array(g.n)].map(() => ({ dx: (rng() - 0.5) * g.spread, du: (rng() - 0.5) * g.depth, ph: rng() * 6.28, f: rng() < 0.5, w: 0.5 + rng() }));
  birds.sort((a, b) => a.du - b.du);
  for (const b of birds) {
    const cyc = Math.sin(t * loopW(0.6 * b.w) + b.ph), kind = b.f ? (cyc > -0.2 ? 'feed' : 'stand') : (Math.sin(t * loopW(0.45 * b.w) + b.ph * 3) > 0.93 ? 'flap' : 'stand');
    nbSmall(P, g.wx + b.dx + 14 * Math.sin(t * loopW(0.2 * b.w) + b.ph), g.u + b.du, g.h, kind, t, { flip: b.ph > 3.14 });
  }
}

// ---------------------------------------------------------------- a flamingo flying (side view): flocks in the sky
function nbFlyer(c, x, y, s, t, ph, col = FLAM) {
  const flap = Math.sin(t * loopW(6.5) + ph);
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, -10, 0, -70, -6 + 3 * flap, 6, col.neck);                         // the neck, stretched out in front
  circle(c, -74, -7 + 3 * flap, 7, col.neck);
  line(c, -80, -6 + 3 * flap, -94, 2 + 3 * flap, 5, col.beakTip);             // the beak
  line(c, 18, 2, 100, 6, 4, col.leg);                                        // the legs trailing behind
  ellipse(c, 4, 0, 30, 11, col.body);                                        // the body
  for (const side of [-1, 1]) {                                              // two wings, up and down
    const a = flap * 0.9 * side;
    c.beginPath(); c.moveTo(-8, -2); c.quadraticCurveTo(0, -40 * Math.cos(a) - 6, 18, -64 * Math.cos(a)); c.lineTo(26, -60 * Math.cos(a)); c.quadraticCurveTo(14, -24, 12, 0); c.closePath();
    c.fillStyle = side > 0 ? col.wing : col.bodySh; c.fill();
    c.beginPath(); c.moveTo(14, -48 * Math.cos(a)); c.lineTo(18, -64 * Math.cos(a)); c.lineTo(26, -60 * Math.cos(a)); c.lineTo(20, -44 * Math.cos(a)); c.closePath();
    c.fillStyle = col.prim; c.fill();
  }
  c.restore();
}
// a flock in a loose V across the sky: x0 -> x1 over [t0, t1] (screen space), size s
function nbFlock(t, f) {
  const k = (t - f.t0) / (f.t1 - f.t0);
  if (k < -0.1 || k > 1.1) return;
  screenSpace();
  const rng = mulberry32(f.seed);
  for (let i = 0; i < f.n; i++) {
    const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1, j = rng();
    const bx = lerp(f.x0, f.x1, k) + row * 46 * f.s * 2.4 * (f.x1 > f.x0 ? -1 : 1), by = lerp(f.y0, f.y1, k) + side * row * 18 * f.s * 2.4 + 8 * Math.sin(t * 1.3 + j * 6);
    ctx.save(); if (f.x1 < f.x0) { ctx.translate(bx, 0); ctx.scale(-1, 1); ctx.translate(-bx, 0); }
    nbFlyer(ctx, bx, by, f.s * (0.85 + 0.3 * j), t, j * 6.28);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the swallow that falls in (side view, facing left)
// o: {fly 0..1 (wings beating; 0 = folded), dry 0..1 (the water leaves it: thinner, drops rising), crust 0..1 (white
// crust grows from the bottom up), tilt, dip (how far under the waterline: a clip is the caller's)}
function nbSwallow(c, x, y, s, t, o = {}) {
  const dry = clamp(o.dry || 0), cr = clamp(o.crust || 0);
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s * (1 - 0.1 * dry), s * (1 - 0.16 * dry));
  const blue = mixH('#1F3E8E', '#43507A', dry), belly = mixH('#FFF2E6', '#E9DCCB', dry), throat = mixH('#E0582E', '#B08060', dry);
  const fl = o.fly || 0, flap = Math.sin(t * loopW(18) + 1) * fl;
  // the forked tail
  c.beginPath(); c.moveTo(40, -2); c.lineTo(112, -18); c.lineTo(78, 4); c.lineTo(114, 18); c.lineTo(40, 10); c.closePath(); c.fillStyle = blue; c.fill();
  // the far wing
  if (fl > 0.01) { c.beginPath(); c.moveTo(-6, -8); c.quadraticCurveTo(20, -50 - 30 * flap, 70, -64 - 40 * flap); c.quadraticCurveTo(40, -20, 24, -4); c.closePath(); c.fillStyle = mixH(blue, '#0B1A40', 0.4); c.fill(); }
  // the body
  c.beginPath(); c.moveTo(-46, -4); c.bezierCurveTo(-40, -26, 10, -24, 46, -6); c.bezierCurveTo(30, 14, -20, 22, -46, -4); c.closePath(); c.fillStyle = blue; c.fill();
  c.beginPath(); c.moveTo(-40, 2); c.bezierCurveTo(-20, 18, 20, 14, 44, 0); c.bezierCurveTo(10, 4, -20, 6, -40, 2); c.closePath(); c.fillStyle = belly; c.fill();
  circle(c, -44, -8, 15, blue);                                              // the head
  ellipse(c, -50, 2, 10, 7, throat);                                         // the rusty throat
  c.beginPath(); c.moveTo(-58, -10); c.lineTo(-70, -6); c.lineTo(-57, -3); c.closePath(); c.fillStyle = '#1A1A22'; c.fill();   // the beak
  // the near wing: folded along the back, or beating
  c.beginPath();
  if (fl > 0.01) { c.moveTo(-10, -8); c.quadraticCurveTo(10, -40 + 46 * flap, 64, -40 + 70 * flap); c.quadraticCurveTo(36, -6, 26, 0); }
  else { c.moveTo(-26, -12); c.quadraticCurveTo(20, -20, 92, -8); c.quadraticCurveTo(40, 0, -16, 0); }
  c.closePath(); c.fillStyle = mixH(blue, '#2B56B8', 0.3 * (1 - dry)); c.fill();
  paint(() => {                                                               // the eye
    if (cr > 0.85) { circle(c, -48, -12, 4.5, '#F7F2EA'); c.beginPath(); c.arc(-48, -12, 4.5, 0, 7); c.lineWidth = 1; c.strokeStyle = 'rgba(140,125,110,0.8)'; c.stroke(); }
    else { circle(c, -48, -12, 4.5, '#FFFFFF'); circle(c, -49, -12, 2.8, '#0B0B14'); circle(c, -50, -13, 0.9, '#FFFFFF'); }
  });
  // the crust: chalk-white crystals growing over it from below (a frost front with facets)
  if (cr > 0.01) paint(() => {
    c.save();
    const front = lerp(30, -40, cr);                                          // the crust's edge climbs from y 30 to -40
    c.beginPath();
    c.moveTo(-130, 60); c.lineTo(130, 60);
    for (let i = 12; i >= 0; i--) { const px = -120 + i * 20, j = 6 * Math.sin(i * 2.3 + 1) + 5 * Math.sin(i * 5.1); c.lineTo(px, front + j); }
    c.closePath(); c.clip();
    // the bird's shapes again, in white
    const ol = (fn) => { fn(); c.lineWidth = 3; c.strokeStyle = '#A99883'; c.stroke(); };
    ol(() => { c.beginPath(); c.moveTo(40, -2); c.lineTo(112, -18); c.lineTo(78, 4); c.lineTo(114, 18); c.lineTo(40, 10); c.closePath(); c.fillStyle = '#E6DCCD'; c.fill(); });
    ol(() => { c.beginPath(); c.moveTo(-46, -4); c.bezierCurveTo(-40, -26, 10, -24, 46, -6); c.bezierCurveTo(30, 14, -20, 22, -46, -4); c.closePath(); c.fillStyle = '#EFE7DA'; c.fill(); });
    ol(() => { c.beginPath(); c.arc(-44, -8, 15, 0, 7); c.fillStyle = '#F2EBDF'; c.fill(); });
    ellipse(c, -50, 2, 10, 7, '#E4D8C6');
    ol(() => { c.beginPath(); c.moveTo(-26, -12); c.quadraticCurveTo(20, -20, 92, -8); c.quadraticCurveTo(40, 0, -16, 0); c.closePath(); c.fillStyle = '#DCCFBD'; c.fill(); });
    ellipse(c, 0, 8, 34, 7, 'rgba(160,140,118,0.35)');
    c.beginPath(); c.moveTo(-58, -10); c.lineTo(-70, -6); c.lineTo(-57, -3); c.closePath(); c.fillStyle = '#CFC2B2'; c.fill();
    const rng = mulberry32(17);
    for (let i = 0; i < 40; i++) circle(c, -60 + rng() * 170, -24 + rng() * 40, 0.8 + 1.6 * rng(), rgba('#B8A994', 0.6));
    c.restore();
    // facets along the front, glinting
    if (cr < 0.98) for (let i = 0; i < 9; i++) {
      const px = -100 + i * 24, py = front + 6 * Math.sin(i * 2.3 + 1);
      c.save(); c.translate(px, py); c.rotate(0.6 * Math.sin(i * 3.7));
      c.beginPath(); c.moveTo(0, -7); c.lineTo(4, 0); c.lineTo(0, 6); c.lineTo(-4, 0); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
      c.restore();
    }
  });
  c.restore();
}
// the water leaving the swallow: droplets peeling off it and rising (world units round the bird)
function nbDrops(c, x, y, s, t, k, seed = 3) {
  if (k <= 0.01 || k >= 0.999) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < 22; i++) {
    const st = rng() * 0.7, life = 0.35 + 0.3 * rng(), u = clamp((k - st) / life);
    if (u <= 0 || u >= 1) continue;
    const px = x + (-60 + rng() * 150) * s + 20 * s * Math.sin(u * 5 + i), py = y + (-10 + rng() * 20) * s - u * (90 + 120 * rng()) * s;
    const r = (4 + 5 * rng()) * s * (1 - 0.6 * u);
    paint(() => {
      c.beginPath(); c.moveTo(px, py - r * 1.6); c.quadraticCurveTo(px + r, py, px, py + r); c.quadraticCurveTo(px - r, py, px, py - r * 1.6); c.closePath();
      c.fillStyle = rgba('#9FD8FF', 0.9 * (1 - u)); c.fill();
      circle(c, px - r * 0.3, py - r * 0.1, r * 0.3, rgba('#FFFFFF', 0.9 * (1 - u)));
    });
  }
}

// ---------------------------------------------------------------- a dead branch standing in the water (a silhouette with
// its perches); world units, its foot at (x, y), its height h. Returns the perches [[x, y], ...]
function nbBranch(c, x, y, h, seed, col = '#E8DCCB', w = 1) {
  const rng = mulberry32(seed), out = [];
  const seg = (x0, y0, a, L, wd, depth) => {
    const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
    line(c, x0, y0, x1, y1, wd, col);
    if (depth <= 0 || wd < 3) { out.push([x1, y1]); return; }
    const n = depth > 1 ? 2 : 1 + (rng() < 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) seg(x1, y1, a + (i ? 0.55 : -0.5) + (rng() - 0.5) * 0.3, L * (0.55 + 0.2 * rng()), wd * 0.66, depth - 1);
  };
  seg(x, y, (rng() - 0.5) * 0.2, h * 0.5, 22 * w, 2);
  return out;
}

// the water over whatever is under its surface (world units): a soft band of the brine's own red, see-through, so a leg
// or a belly under the surface reads as under it; never a clip (a clipped shape is left out of the light's shape map,
// and the light then shades it as whatever is behind it)
let NB_WATER = null;
function nbWaterOver(c, x, y, rx, depth, a = 0.78) {
  if (!NB_WATER) {                       // a soft-edged patch of the brine: clear at the surface, deep red below, fading at the sides
    NB_WATER = mkCanvas(256, 128);
    const w = NB_WATER.getContext('2d'), id = w.createImageData(256, 128);
    for (let j = 0; j < 128; j++) for (let i = 0; i < 256; i++) {
      const v = j / 127, hx = Math.abs(i - 127.5) / 127.5;
      const al = clamp(v / 0.1) * (1 - Math.pow(hx, 3)) * (0.86 + 0.14 * v), k = 4 * (j * 256 + i);
      id.data[k] = 124; id.data[k + 1] = 16; id.data[k + 2] = 44; id.data[k + 3] = Math.round(255 * al);
    }
    w.putImageData(id, 0, 0);
  }
  c.save(); c.globalAlpha = a;
  c.drawImage(NB_WATER, x - rx, y - 4, 2 * rx, depth + 4);
  c.globalAlpha = 1;
  c.lineWidth = 3.5; c.strokeStyle = rgba('#FFD6C4', 0.5); c.beginPath(); c.ellipse(x, y, rx * 0.8, 8, 0, 0, 7); c.stroke();
  c.restore();
}
// a flamingo mirrored in the water under it (unlit: see-through)
function nbReflect(c, x, y, s, t, o, waterY) {
  c.save(); c.globalAlpha = 0.28;
  c.translate(0, 2 * waterY); c.scale(1, -1);
  nbFlamingo(c, x, y, s, t, o);
  c.restore();
}
