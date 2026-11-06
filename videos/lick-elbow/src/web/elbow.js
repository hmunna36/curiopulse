// Why Can't You Lick Your ELBOW? Short: the hiker close up on a hot day on the trail (trail.js's sky, sun, clouds and ridges,
// far behind him), sleeves rolled up, an ice cream cone in the fist of his raised arm, a chocolate drip run down his bare
// forearm to the elbow; his tongue out of the corner of his mouth, straining for it.
//   elBack(cam, t)              the far view (sky, sun, clouds, ridges: trail.js), moving only a little with the camera
//   elSt(A)                     his rig state for a description A (no drawing)
//   elHero(cam, t, A)           him, from a description A (below); returns points in world coords
//   elTongue(c, T, t)           his tongue, out of a corner of his mouth (head units)
//   elCone(c, s, melt, t)       an ice cream cone held in a fist (fist units: the fist's middle is 0,0)
//   elPin(c, x, y, s, k)        a red pushpin (world)
// Rig-local units: his feet at 0,0, his head's middle at (0, -470), his mouth at (0, -430), his shoulders at (+-74, -370).
// side +1 = the arm on the screen's right (the rig's R arm), -1 = the screen's left. Everything ambient runs on loopW().
'use strict';

const EL = { hx: 540, hy: 1500, hs: 1 };
const EL_CAMY = 1000;                                  // the camera height the far view is framed for
const EL_SH = (s) => [74 * s, -370];                   // a shoulder (rig-local, lean 0)
const EL_MOUTH = [0, -430];
const EL_LU = 135, EL_LF = 92;                         // his upper arm and forearm here: long (the answer: "your ARM's too long")
const ELC = { choc: '#6E3B22', chocHi: '#A2603A', chocDk: '#43200F', cone: '#E7A957', coneSh: '#B9762F', coneDk: '#8C5220',
  sleeve: '#FFC23A', sleeveSh: '#DE8C16', cuff: '#F6A92B', cuffDk: '#B06C0C', gold: '#FFD447', bone: '#F4EBD0', boneEdge: '#BFAE84',
  glass: '#7FD8FF', pin: '#F0424E', pinSh: '#A8202C' };
const ELPAL = Object.assign({}, PAL, {});

// ---------------------------------------------------------------- the far view
function elBgCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.25, y: 1150 + (cam.y - EL_CAMY) * 0.25, zoom: 1.06 + 0.05 * (cam.zoom - 2.5), rot: 0,
    sx: (cam.sx || 0) * 0.15, sy: (cam.sy || 0) * 0.15 };
}
function elBack(cam, t, o = {}) {
  const bc = elBgCam(cam);
  screenSpace(); ctx.fillStyle = '#1767D4'; ctx.fillRect(0, 0, W, H);
  trSky(bc, t, { blue: 1 });
  trSun(bc, t, { blue: 1, at: [250, 520], r: 50, rays: 0.55, glow: 0.9 });
  trClouds(bc, t, { k: 1 });
  trRidges(bc, t, { blue: 1 });
  // heat shimmer motes drifting up (the loop clock)
  screenSpace();
  for (let i = 0; i < 12; i++) {
    const r = mulberry32(700 + i), ph = r() * 6.28;
    const px = 1080 * r() + 30 * Math.sin(t * loopW(1.1 + r()) + ph), py = 1920 * (1 - ((r() + t / TLd.duration * (1 + Math.floor(r() * 2))) % 1));
    softDot(gctx, px, py, 6 + r() * 7, '#FFF2C0', 0.22);
  }
}

// ---------------------------------------------------------------- the hero
function elHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function elInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// an elbow on the compass circle round shoulder `side`: angle a from straight up, toward the outside (+) or across (-)
function elOnCircle(side, a, R = EL_LU) { const sh = EL_SH(side); return [sh[0] + side * R * Math.sin(a), sh[1] - R * Math.cos(a)]; }
// a forearm from elbow e, pointing at angle f from straight up (+ = toward the outside), length EL_LF
function elFore(side, e, f, L = EL_LF) { return [e[0] + side * L * Math.sin(f), e[1] - L * Math.cos(f)]; }

function elSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'fist', feetFront: 0 };
  if (A.armR) p = armAt(p, 'R', A.armR.e, A.armR.w);
  if (A.armL) p = armAt(p, 'L', A.armL.e, A.armL.w);
  return { x: EL.hx + (A.dx || 0), y: EL.hy + (A.dy || 0), s: EL.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0,
    headRot: A.headRot || 0, seed: 4, noArms: true };
}

// a bare arm with a rolled-up sleeve: shoulder sh, elbow el, wrist wr (rig-local). o: {xray 0..1, squash 0..1 (squeezed),
// drip 0..1 (a chocolate run from the wrist to the elbow, and a drop hanging off the elbow), dripT (its wobble clock)}
function elArm(c, sh, el, wr, pal, side, t, o = {}) {
  const L = Math.hypot(el[0] - sh[0], el[1] - sh[1]) || 1, ux = (el[0] - sh[0]) / L, uy = (el[1] - sh[1]) / L;
  const cuffAt = Math.min(62, L * 0.45);
  const cp = [sh[0] + ux * cuffAt, sh[1] + uy * cuffAt];
  const sq = o.squash || 0;
  // the bare upper arm (skin), the forearm, the elbow
  capsuleShaded(c, cp, el, 38 * (1 - 0.12 * sq), pal.skin, pal.skinSh, pal.skinHi, pal);
  capsuleShaded(c, el, wr, 35, pal.skin, pal.skinSh, pal.skinHi, pal);
  // the sleeve, rolled up above the elbow: the shoulder part, then a fat cuff
  capsuleShaded(c, sh, cp, 46, pal.coat, pal.coatSh, pal.coatHi, pal);
  line(c, cp[0] - ux * 4, cp[1] - uy * 4, cp[0] + ux * 9, cp[1] + uy * 9, 50, ELC.cuff);
  paint(() => {
    line(c, cp[0] + ux * 2, cp[1] + uy * 2, cp[0] + ux * 3, cp[1] + uy * 3, 50, ELC.cuffDk);
    // the elbow's crease and its knobbly point (outside the bend)
    const fx = wr[0] - el[0], fy = wr[1] - el[1], fl = Math.hypot(fx, fy) || 1;
    const bx = -(ux + fx / fl), by = -(uy + fy / fl), bl = Math.hypot(bx, by) || 1;   // the outside of the bend
    const ox = el[0] + (bx / bl) * 13, oy = el[1] + (by / bl) * 13;
    for (const k of [-1, 1]) { c.beginPath(); c.arc(ox, oy, 6 + 2.5 * k, Math.atan2(by, bx) - 0.9, Math.atan2(by, bx) + 0.9); c.lineWidth = 1.8; c.strokeStyle = rgba('#A8603F', 0.55); c.stroke(); }
    ellipse(c, el[0] - (bx / bl) * 8, el[1] - (by / bl) * 8, 5, 2, rgba('#A8603F', 0.4), Math.atan2(by, bx) + Math.PI / 2);
  });
  // the x-ray: the skin of the upper arm turns to glass, and ONE bone shows inside, ball at the shoulder, knobs at the elbow
  const xr = o.xray || 0;
  if (xr > 0.01) paint(() => {
    c.save(); c.globalAlpha = xr;
    line(c, sh[0], sh[1], el[0], el[1], 44, rgba('#16305E', 0.82));
    line(c, sh[0], sh[1], el[0], el[1], 40, rgba(ELC.glass, 0.18));
    const a = [sh[0] + ux * 6, sh[1] + uy * 6], b = [el[0] - ux * 4, el[1] - uy * 4];
    line(c, a[0], a[1], b[0], b[1], 15, ELC.boneEdge); line(c, a[0], a[1], b[0], b[1], 11, ELC.bone);
    circle(c, a[0], a[1], 15, ELC.boneEdge); circle(c, a[0], a[1], 12.5, ELC.bone);
    for (const k of [-1, 1]) { circle(c, b[0] - uy * 7 * k, b[1] + ux * 7 * k, 8, ELC.boneEdge); circle(c, b[0] - uy * 7 * k, b[1] + ux * 7 * k, 6, ELC.bone); }
    line(c, a[0] + uy * 3, a[1] - ux * 3, b[0] + uy * 3, b[1] - ux * 3, 2.5, rgba('#FFFFFF', 0.7));
    c.restore();
  });
  // squeeze lines either side of the grip
  if (sq > 0.05) paint(() => {
    const m = [(cp[0] + el[0]) / 2, (cp[1] + el[1]) / 2];
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) {
      const d = 24 + 7 * i, px = m[0] - uy * k * d + ux * (i - 1) * 8, py = m[1] + ux * k * d + uy * (i - 1) * 8;
      line(c, px, py, px - uy * k * 7, py + ux * k * 7, 2.4, rgba('#FFFFFF', 0.85 * sq));
    }
  });
  // the chocolate run, from the wrist down the forearm's outside to the elbow, and the drop hanging off the elbow
  const dr = o.drip || 0;
  if (dr > 0.01) {
    const fx = el[0] - wr[0], fy = el[1] - wr[1], fl = Math.hypot(fx, fy) || 1, nx = -fy / fl * side, ny = fx / fl * side;
    paint(() => {
      c.beginPath();
      for (let i = 0; i <= 10; i++) {
        const u = i / 10, w = 5 * Math.sin(u * 7 + 1.3) * 0.5;
        const px = wr[0] + fx * u * dr + nx * (11 + w), py = wr[1] + fy * u * dr + ny * (11 + w);
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.lineWidth = 6.5; c.lineCap = 'round'; c.strokeStyle = ELC.choc; c.stroke();
      c.lineWidth = 2; c.strokeStyle = rgba(ELC.chocHi, 0.8); c.stroke();
    });
    if (dr > 0.9) {   // the drop, wobbling under the elbow's low point
      const lowX = el[0] + nx * 8, lowY = el[1] + 20;
      const wob = 1 + 0.12 * Math.sin((o.dripT || t) * 9), dk = clamp((dr - 0.9) / 0.1);
      c.save(); c.translate(lowX, lowY); c.scale(dk * (1 / wob), dk * wob);
      c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(13, 6, 0, 17); c.quadraticCurveTo(-13, 6, 0, -12); c.fillStyle = ELC.choc; c.fill();
      paint(() => { ellipse(c, -3.5, 4, 3, 4.6, rgba('#FFFFFF', 0.6)); ellipse(c, 3, 10, 4, 3, rgba(ELC.chocHi, 0.6)); });
      c.restore();
    }
  }
}

// the cone in a fist. Fist units: the fist's middle at 0,0, up = the world's up turned by rot. melt 0..1: drips over the
// scoop's rim. The cone's lower end sits in the fist; the fingers wrap it.
function elCone(c, pal, rot, melt, t, s = 1) {
  c.save(); c.rotate(rot); c.scale(s, s);
  // the waffle cone: from the fist up to its rim
  c.beginPath(); c.moveTo(-6, 22); c.lineTo(-27, -44); c.lineTo(27, -44); c.lineTo(6, 22); c.closePath();
  c.fillStyle = ELC.cone; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(-6, 22); c.lineTo(-27, -44); c.lineTo(27, -44); c.lineTo(6, 22); c.closePath(); c.clip();
    for (let i = -6; i <= 6; i++) { line(c, i * 9 - 30, -50, i * 9 + 10, 30, 2.2, rgba(ELC.coneDk, 0.5)); line(c, i * 9 + 30, -50, i * 9 - 10, 30, 2.2, rgba(ELC.coneDk, 0.5)); }
    c.fillStyle = rgba(ELC.coneSh, 0.35); c.fillRect(6, -50, 30, 80);
    c.restore();
  });
  rrect(c, -30, -50, 60, 12, 6); c.fillStyle = ELC.coneSh; c.fill();
  // the scoop: chocolate, a bit slumped, with drips down over the rim
  const sl = 1 + 0.04 * Math.sin(t * loopW(2.2));
  c.beginPath(); c.ellipse(0, -66, 31 * sl, 25 / sl, 0, 0, Math.PI * 2); c.fillStyle = ELC.choc; c.fill();
  paint(() => {
    for (const [x, len] of [[-21, 10 + 8 * melt], [-4, 14 + 12 * melt], [16, 8 + 10 * melt]]) {
      c.beginPath(); c.moveTo(x - 6, -48); c.lineTo(x - 5, -44 + len); c.quadraticCurveTo(x, -36 + len, x + 5, -44 + len); c.lineTo(x + 6, -48); c.closePath();
      c.fillStyle = ELC.choc; c.fill();
    }
    ellipse(c, -10, -76, 10, 6, rgba(ELC.chocHi, 0.75), -0.4);
    ellipse(c, -13, -78, 4, 2.4, rgba('#FFFFFF', 0.6), -0.4);
    // sprinkles
    const SP = [['#FF5D8F', -14, -60, 0.5], ['#7FE9FF', 8, -72, -0.3], ['#FFD447', 18, -60, 1.1], ['#4DFFB4', -2, -84, 0.2], ['#FF9A3C', -22, -70, -0.9]];
    for (const [col, x, y, a] of SP) { c.save(); c.translate(x, y); c.rotate(a); rrect(c, -4.5, -1.4, 9, 2.8, 1.4); c.fillStyle = col; c.fill(); c.restore(); }
  });
  c.restore();
  // the fist round it
  circle(c, 0, 0, 22, pal.skin);
  paint(() => { for (let i = 0; i < 3; i++) line(c, -14, -8 + i * 8, 15, -10 + i * 8, 2.2, rgba('#A8603F', 0.45)); });
}

// his tongue out of a corner of his mouth, in head units. T: {k 0..1 out, len, ang (0 = his right on the screen, -PI/2 = up),
// bend (radians of curl toward up), quiver 0..1, side (+1 = the screen-right corner), w (thickness scale)}
function elTongue(c, T, t) {
  const k = clamp(T.k || 0), side = T.side || 1;
  const base = [side * 10, 45], L = (T.len || 40) * k;
  if (L < 0.5) return null;
  const q = (T.quiver || 0) * (0.6 * Math.sin(t * 47) + 0.4 * Math.sin(t * 73));
  const a = (T.ang === undefined ? (side > 0 ? -0.5 : Math.PI + 0.5) : T.ang) + 0.05 * q, bend = (T.bend || 0) * side;
  const tip = [base[0] + Math.cos(a) * L, base[1] + Math.sin(a) * L];
  const ctl = [base[0] + Math.cos(a + bend) * L * 0.55, base[1] + Math.sin(a + bend) * L * 0.55];
  const P = (u) => [lerp(lerp(base[0], ctl[0], u), lerp(ctl[0], tip[0], u), u), lerp(lerp(base[1], ctl[1], u), lerp(ctl[1], tip[1], u), u)];
  const wk = T.w || 1;
  const hw = (u) => wk * (12.5 - 3 * u) * (u > 0.72 ? Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.72) / 0.28, 2))) : 1);
  const top = [], bot = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, p = P(u), p2 = P(Math.min(1, u + 0.02)), p1 = P(Math.max(0, u - 0.02));
    let dx = p2[0] - p1[0], dy = p2[1] - p1[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const h = hw(u) + 0.6 * q * (i % 2 ? 1 : -1) * u;
    top.push([p[0] - dy * h, p[1] + dx * h]); bot.push([p[0] + dy * h, p[1] - dx * h]);
  }
  // the open corner of the mouth it comes out of
  paint(() => { ellipse(c, side * 7, 43, 13, 7.5, '#5A1522', side * 0.25); });
  c.beginPath(); top.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]);
  c.closePath(); c.fillStyle = '#E8667A'; c.fill();
  paint(() => {
    // the groove down its middle, a shine, and the upper lip over its root
    c.beginPath(); for (let i = 1; i <= 17; i++) { const p = P(i / 24); i > 1 ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }
    c.lineWidth = 1.6; c.lineCap = 'round'; c.strokeStyle = rgba('#9C2C44', 0.55); c.stroke();
    const sh = [], n = 14; for (let i = 3; i <= n; i++) { const u = i / 20, p = P(u); sh.push([lerp(p[0], top[Math.round(u * 24)][0], 0.55), lerp(p[1], top[Math.round(u * 24)][1], 0.55)]); }
    poly(c, sh, 2.2, rgba('#FFFFFF', 0.35));
    c.beginPath(); c.moveTo(side * -6, 41); c.quadraticCurveTo(side * 6, 36.5, side * 19, 41.5); c.lineWidth = 3.4; c.strokeStyle = '#B9524C'; c.stroke();
  });
  return { tip, base, P };
}

// a red pushpin, its needle going in at (x, y) from the upper outside (world or rig units); k 0..1 = in
function elPin(c, x, y, s, k, side = 1) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.2), d = lerp(70, 0, clamp(k * 1.3));
  c.save(); c.translate(x + side * d * 0.5, y - d); c.scale(s * e, s * e); c.rotate(side * 0.45);
  line(c, 0, 0, 0, -34, 4, '#C9CED8');
  rrect(c, -9, -50, 18, 18, 5); c.fillStyle = ELC.pinSh; c.fill();
  c.beginPath(); c.ellipse(0, -60, 19, 15, 0, 0, Math.PI * 2); c.fillStyle = ELC.pin; c.fill();
  paint(() => { ellipse(c, -6, -65, 6, 4, rgba('#FFFFFF', 0.65), -0.4); });
  c.restore();
}

// Draw him from a description A:
//   side (+1 = the raised arm is on the screen's right), up: {e, w} the raised arm's elbow and wrist (rig-local),
//   low: {e, w} the other arm, face, headDX, headDY, headRot, lean, bob, dx, dy
//   tongue: elTongue's T (side defaults to A.side), cone: 'up' | 'low' | null (which fist holds it), coneRot, melt,
//   toss: {k 0..1, from [x,y], to [x,y], h} the cone in the air between the fists (rig-local; cone: null meanwhile)
//   drip 0..1 (the raised elbow), dripLow 0..1 (the other elbow), xray 0..1, squash 0..1, lowOnTop (the other arm over the
//   raised one: a squeeze), sweat 0..1, post(lc, rr, st) more drawing in rig-local units
// Returns {st, r, rp(p): rig-local -> world, head, mouth, sh, el, wr, tip (tongue tip, world), cone (world)}
function elHero(cam, t, A = {}) {
  const pal = A.pal || ELPAL, side = A.side || 1, kU = side > 0 ? 'R' : 'L', kL = side > 0 ? 'L' : 'R';
  const A2 = Object.assign({}, A, { ['arm' + kU]: A.up, ['arm' + kL]: A.low });
  const st = elSt(A2), out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.03 : A.ambient, light: 0,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      elInHead(lc, s2, (c) => {
        if (A.tongue) out.tongueH = elTongue(c, Object.assign({ side }, A.tongue), t);
        const sw = A.sweat || 0;
        if (sw > 0.02) paint(() => { for (const [x, y, s] of [[-side * 50, -34, 1], [side * 30, -58, 0.7]]) { c.save(); c.translate(x, y + 8 * sw); c.scale(sw * s, sw * s); c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(8, 2, 0, 6); c.quadraticCurveTo(-8, 2, 0, -12); c.fillStyle = '#BFF0FF'; c.fill(); c.restore(); } });
        if (A.head) A.head(c);
      });
      const fist = (k) => { const d = rr['armDir' + k], wr = rr['wr' + k]; return [wr[0] + d[0] * 14, wr[1] + d[1] * 14]; };
      const coneAt = (k, rot) => {
        const f = fist(k);
        lc.save(); lc.translate(f[0], f[1]);
        actor(() => elCone(lc, pal, rot, A.melt === undefined ? 0.6 : A.melt, t));
        lc.restore();
        out.coneL = [f[0], f[1] - 66];
      };
      const armOf = (k, o) => {
        actor(() => elArm(lc, rr['sh' + k], rr['el' + k], rr['wr' + k], pal, k === 'R' ? 1 : -1, t, o));
        if ((A.cone === 'up' && k === kU) || (A.cone === 'low' && k === kL)) coneAt(k, (A.coneRot || 0) * (k === 'R' ? 1 : -1));
        else actor(() => { const f = fist(k); circle(lc, f[0], f[1], 21, pal.skin); paint(() => { for (let i = 0; i < 3; i++) line(lc, f[0] - 13, f[1] - 8 + i * 8, f[0] + 13, f[1] - 9 + i * 8, 2.2, rgba('#A8603F', 0.4)); }); });
      };
      const oU = { drip: A.drip || 0, xray: A.xray || 0, squash: A.squash || 0 }, oL = { drip: A.dripLow || 0 };
      if (A.lowOnTop) { armOf(kU, oU); armOf(kL, oL); } else { armOf(kL, oL); armOf(kU, oU); }
      // the cone in the air (the toss)
      if (A.toss && A.toss.k > 0 && A.toss.k < 1) {
        const k = A.toss.k, a = A.toss.from, b = A.toss.to, h = A.toss.h || 160;
        const x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k) - h * 4 * k * (1 - k);
        lc.save(); lc.translate(x, y); lc.rotate(side * 6.283 * k);
        actor(() => elConeAlone(lc, A.melt === undefined ? 0.6 : A.melt, t));
        lc.restore();
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
      out.rr = rr;
    },
  });
  const rp = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  const rr = out.rr || rig(st.pose);
  out.st = st; out.r = r; out.rp = rp;
  out.head = rp(elHeadLocal(st, 0, 0)); out.mouth = rp(elHeadLocal(st, 0, 42)); out.corner = rp(elHeadLocal(st, side * 10, 45));
  out.sh = rp(rr['sh' + kU]); out.el = rp(rr['el' + kU]); out.wr = rp(rr['wr' + kU]);
  out.shL = rp(rr['sh' + kL]); out.elL = rp(rr['el' + kL]);
  if (out.tongueH) out.tip = rp(elHeadLocal(st, out.tongueH.tip[0], out.tongueH.tip[1]));
  if (out.coneL) out.cone = rp(out.coneL);
  return out;
}
// the cone on its own (in the air): the same drawing without the fist
function elConeAlone(c, melt, t) {
  c.save();
  c.beginPath(); c.moveTo(-6, 22); c.lineTo(-27, -44); c.lineTo(27, -44); c.lineTo(6, 22); c.closePath(); c.fillStyle = ELC.cone; c.fill();
  c.beginPath(); c.moveTo(-6, 22); c.lineTo(0, 34); c.lineTo(6, 22); c.closePath(); c.fill();
  rrect(c, -30, -50, 60, 12, 6); c.fillStyle = ELC.coneSh; c.fill();
  c.beginPath(); c.ellipse(0, -66, 31, 25, 0, 0, Math.PI * 2); c.fillStyle = ELC.choc; c.fill();
  paint(() => { ellipse(c, -10, -76, 10, 6, rgba(ELC.chocHi, 0.75), -0.4); });
  c.restore();
}

// ---------------------------------------------------------------- diagram helpers (world coords, camera applied)
// a dashed gold arc round centre C, radius R, from angle a0 to a1 (radians, screen: 0 = right, + = clockwise)
function elArc(C, R, a0, a1, w, k = 1, col = ELC.gold) {
  if (k <= 0.01 || Math.abs(a1 - a0) < 0.001) return;
  const c = ctx;
  paint(() => {
    c.save(); c.setLineDash([16, 12]); c.lineDashOffset = 0; c.lineCap = 'round';
    c.beginPath(); c.arc(C[0], C[1], R, a0, a1, a1 < a0); c.lineWidth = w + 5; c.strokeStyle = rgba('#3A2A00', 0.45 * k); c.stroke();
    c.beginPath(); c.arc(C[0], C[1], R, a0, a1, a1 < a0); c.lineWidth = w; c.strokeStyle = rgba(col, k); c.stroke();
    c.restore();
  });
  gctx.save(); gctx.beginPath(); gctx.arc(C[0], C[1], R, a0, a1, a1 < a0); gctx.lineWidth = w * 2.4; gctx.strokeStyle = rgba(col, 0.32 * k); gctx.stroke(); gctx.restore();
}
// a red target ring round a point (the mouth), with a label under or over it
function elTarget(P, r, k, txt, t, above = false) {
  if (k <= 0.01) return;
  const c = ctx, e = E.outBack(clamp(k), 2);
  paint(() => {
    c.save(); c.translate(P[0], P[1]); c.scale(e, e);
    const pu = 1 + 0.06 * Math.sin(t * 9);
    c.beginPath(); c.arc(0, 0, r * pu, 0, 7); c.lineWidth = 5; c.strokeStyle = '#FF4D5E'; c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.55 * pu, 0, 7); c.lineWidth = 3; c.strokeStyle = rgba('#FF4D5E', 0.8); c.stroke();
    c.restore();
  });
  if (txt) tagPill(txt, P[0], P[1] + (above ? -r - 30 : r + 30), '#FF4D5E', k, 30, '#FFFFFF');
}
