// Was Cleopatra Closer to the Pyramids or the MOON Landing? 🚀 — the cast and the graphics.
// Cleopatra (the house face: the hiker's own drawFace, with kohl wings, lips, a black bob with a straight fringe, a gold
// diadem with the cobra, a broad collar, a linen dress; sunglasses, a gum bubble; standing or sitting on a swing seat),
// Neil Armstrong (the house rig in a white suit, a gold visor down), a woolly mammoth, the pyramid builders with their
// block, a tumbleweed (sun-8-minutes'), the years counter, the brackets, tags and a comic burst.
'use strict';

const CLPAL = { skin: '#D9A27A', skinSh: '#B07450', skinHi: '#F2C8A4', hair: '#15101C', hairHi: '#3E3A6A', pupil: '#2A1A10',
  mouth: '#5A1522', tongue: '#E0616C', teeth: '#FFFFFF', lips: '#B8323F', lipsSh: '#7E1E2A', gold: '#E8B23A', goldSh: '#A87418',
  goldHi: '#FFE08A', linen: '#F6F1E4', linenSh: '#D8CDB4', lapis: '#2A4AA8', turq: '#2ABFB0', carn: '#C8402E' };
// her faces (drawFace's fields; `lips` is her own mouth: smile, duck, yawn, o, smirk, grin, flat)
const CF = {
  smile: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.4, browTilt: -0.2, blink: 0, cross: 0, lips: 'smile', lo: 0.4 },
  duck: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: -0.3, blink: 0, cross: 0, lips: 'duck', lo: 0.5 },
  bored: { eyeOpen: 1, pupil: 1, lookX: 0.4, lookY: -0.6, browY: -0.1, browTilt: -0.2, blink: 0.45, cross: 0, lips: 'flat', lo: 0 },
  up: { eyeOpen: 1, pupil: 1, lookX: -0.4, lookY: -1, browY: 0.3, browTilt: -0.1, blink: 0.3, cross: 0, lips: 'flat', lo: 0 },
  yawn: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: 0.6, blink: 1, cross: 0, lips: 'yawn', lo: 1 },
  peer: { eyeOpen: 1.1, pupil: 0.9, lookX: 0, lookY: 0.2, browY: 1.2, browTilt: -0.4, blink: 0, cross: 0, lips: 'smirk', lo: 0.3 },
  sly: { eyeOpen: 1, pupil: 1, lookX: -0.5, lookY: 0, browY: 0.5, browTilt: -0.5, blink: 0.25, cross: 0, lips: 'smirk', lo: 0.5 },
  wave: { eyeOpen: 1.05, pupil: 1, lookX: 0.8, lookY: 0.3, browY: 0.7, browTilt: -0.2, blink: 0, cross: 0, lips: 'grin', lo: 0.6 },
  wow: { eyeOpen: 1.3, pupil: 0.7, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.2, blink: 0, cross: 0, lips: 'o', lo: 0.7 },
  blow: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0.2, browY: 0.5, browTilt: -0.3, blink: 0.35, cross: 0, lips: 'blow', lo: 0.5 },
};
function cmLerpFace(a, b, k) {
  const o = Object.assign({}, k < 0.5 ? a : b);
  for (const key of ['eyeOpen', 'pupil', 'lookX', 'lookY', 'browY', 'browTilt', 'blink', 'lo']) o[key] = lerp(a[key] || 0, b[key] || 0, k);
  return o;
}
function cmFaceAt(keys, t) {             // keys: [[t, face]...], 0.12 s blends
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t >= keys[i][0]) f = cmLerpFace(keys[i - 1][1], keys[i][1], clamp((t - keys[i][0]) / 0.12));
  return f;
}
// two-bone IK: the elbow for shoulder sh, wrist w, bone lengths a, b; bend = +1 / -1 picks the side
function cmIK(sh, w, a, b, bend) {
  const dx = w[0] - sh[0], dy = w[1] - sh[1];
  let d = Math.hypot(dx, dy);
  const dd = clamp(d, Math.abs(a - b) + 1, a + b - 1);
  const ang = Math.atan2(dy, dx), cosA = (a * a + dd * dd - b * b) / (2 * a * dd);
  const A = ang + bend * Math.acos(clamp(cosA, -1, 1));
  const el = [sh[0] + Math.cos(A) * a, sh[1] + Math.sin(A) * a];
  const ew = [w[0] - el[0], w[1] - el[1]], L = Math.hypot(ew[0], ew[1]) || 1;
  return { el, wr: [el[0] + ew[0] / L * b, el[1] + ew[1] / L * b], dir: [ew[0] / L, ew[1] / L] };
}
// her hand at the wrist, pointing along d. kind: open, peace, fist, wave, mouth, glasses
function cmHand(c, wr, d, kind, P, side) {
  const hx = wr[0] + d[0] * 12, hy = wr[1] + d[1] * 12, a = Math.atan2(d[1], d[0]);
  const fing = (ang, len, w) => { const ex = hx + Math.cos(ang) * len, ey = hy + Math.sin(ang) * len; line(c, hx, hy, ex, ey, w, P.skin); return [ex, ey]; };
  if (kind === 'peace') {
    fing(a - 0.2, 46, 12); fing(a + 0.2, 46, 12);
    circle(c, hx, hy, 18, P.skin);
    line(c, hx - side * 6, hy + 4, hx + 10 * Math.cos(a + side * 1.4), hy + 10 * Math.sin(a + side * 1.4), 10, P.skin);   // the thumb across
    paint(() => { line(c, hx + Math.cos(a) * 8, hy + Math.sin(a) * 8, hx + Math.cos(a) * 16, hy + Math.sin(a) * 16, 2.5, P.skinSh); });
  } else if (kind === 'wave' || kind === 'mouth' || kind === 'open') {
    for (let i = -2; i <= 1; i++) fing(a + i * 0.26 + 0.13, kind === 'mouth' ? 30 : 34, 10);
    fing(a + 1.25 * side, 24, 10);
    circle(c, hx, hy, 19, P.skin);
  } else if (kind === 'glasses') {
    circle(c, hx, hy, 17, P.skin); fing(a - 0.3, 22, 9); fing(a + 0.3, 20, 9);
  } else {
    circle(c, hx, hy, 18, P.skin);
  }
  // a gold bracelet
  line(c, wr[0] - d[1] * 13, wr[1] + d[0] * 13, wr[0] + d[1] * 13, wr[1] - d[0] * 13, 8, P.gold);
}
// the diadem's cobra (head space), the sunglasses, the kohl, the lips
function cmUraeus(c, P) {
  c.save(); c.translate(0, -84);
  c.beginPath(); c.moveTo(-14, 10); c.quadraticCurveTo(-18, -16, 0, -28); c.quadraticCurveTo(18, -16, 14, 10); c.closePath();
  c.fillStyle = P.gold; c.fill();
  ellipse(c, 0, -30, 8, 9, P.gold);
  paint(() => { circle(c, 0, -31, 2.6, '#C8202E'); line(c, -8, -6, 8, -6, 2, P.goldSh); line(c, -9, 2, 9, 2, 2, P.goldSh); ellipse(c, 0, -10, 4, 9, P.carn); });
  c.restore();
}
function cmShades(c, dy, P) {
  c.save(); c.translate(0, dy);
  line(c, -66, -8, -40, -6, 5, P.gold); line(c, 66, -8, 40, -6, 5, P.gold);
  for (const s of [-1, 1]) {
    rrect(c, s * 24 - 22, -18, 44, 32, 13); c.fillStyle = '#1A1A24'; c.fill();
    paint(() => {
      const g = c.createLinearGradient(0, -18, 0, 14); g.addColorStop(0, 'rgba(120,90,200,0.55)'); g.addColorStop(1, 'rgba(255,120,80,0.35)');
      rrect(c, s * 24 - 20, -16, 40, 28, 11); c.fillStyle = g; c.fill();
      line(c, s * 24 - 12, -10, s * 24 - 2, -12, 3, 'rgba(255,255,255,0.8)');
    });
  }
  line(c, -4, -6, 4, -6, 5, P.gold);
  c.restore();
}
function cmLips(c, f, P, t) {
  const k = f.lo || 0;
  c.save(); c.translate(0, 40);
  if (f.lips === 'duck' || f.lips === 'blow') {
    ellipse(c, 0, 2, 14, 10, P.lips); ellipse(c, 0, -3, 12, 5, mixH(P.lips, '#FFFFFF', 0.12));
    line(c, -9, 2, 9, 2, 2.5, P.lipsSh); circle(c, -4, -5, 2, 'rgba(255,255,255,0.6)');
  } else if (f.lips === 'yawn') {
    const rx = 14 + 10 * k, ry = 8 + 26 * k;
    ellipse(c, 0, 6 + ry * 0.3, rx + 4, ry + 4, P.lips);
    ellipse(c, 0, 6 + ry * 0.3, rx, ry, P.mouth);
    ellipse(c, 0, 6 + ry * 1.0, rx * 0.7, ry * 0.32, P.tongue);
  } else if (f.lips === 'o') {
    ellipse(c, 0, 4, 9 + 5 * k, 10 + 8 * k, P.lips); ellipse(c, 0, 4, 5 + 4 * k, 6 + 7 * k, P.mouth);
  } else if (f.lips === 'grin') {
    c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(0, 26 * k + 6, 26, -6); c.quadraticCurveTo(0, 2, -26, -6); c.fillStyle = P.mouth; c.fill();
    c.save(); c.clip(); c.fillStyle = P.teeth; c.fillRect(-26, -7, 52, 9); c.restore();
    c.beginPath(); c.moveTo(-28, -6); c.quadraticCurveTo(0, 30 * k + 9, 28, -6); c.lineWidth = 5; c.strokeStyle = P.lips; c.stroke();
    c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(0, -12, 26, -6); c.lineWidth = 4; c.stroke();
  } else if (f.lips === 'smirk') {
    c.beginPath(); c.moveTo(-15, 0); c.quadraticCurveTo(2, 7, 19, -6); c.lineWidth = 7; c.strokeStyle = P.lips; c.lineCap = 'round'; c.stroke();
    line(c, -13, 0, 17, -5, 2, P.lipsSh);
  } else {                                                           // smile / flat: closed red lips
    const up = f.lips === 'smile' ? 6 + 6 * k : 1;
    c.beginPath(); c.moveTo(-18, -2); c.quadraticCurveTo(-8, -9, 0, -5); c.quadraticCurveTo(8, -9, 18, -2);
    c.quadraticCurveTo(0, 8 + up * 0.4, -18, -2); c.fillStyle = P.lips; c.fill();
    c.beginPath(); c.moveTo(-18, -2); c.quadraticCurveTo(0, up * 0.6, 18, -2); c.lineWidth = 2.5; c.strokeStyle = P.lipsSh; c.stroke();
    if (f.lips === 'smile') { line(c, -18, -2, -21, -6, 2.5, P.lipsSh); line(c, 18, -2, 21, -6, 2.5, P.lipsSh); }
  }
  c.restore();
}
function cmKohl(c, f) {
  for (const s of [-1, 1]) {
    const bl = f.blink >= 0.93;
    c.beginPath(); c.moveTo(s * 9, bl ? -1 : -14 * f.eyeOpen); c.quadraticCurveTo(s * 26, bl ? 5 : -19 * f.eyeOpen, s * 40, bl ? 0 : -8);
    c.lineTo(s * 54, -18); c.lineTo(s * 40, -3); c.lineWidth = 4.5; c.strokeStyle = '#120C14'; c.lineJoin = 'round'; c.stroke();
    if (!bl) { line(c, s * 22, 15 * f.eyeOpen, s * 42, 4, 3, '#2A1A22'); }
  }
}
// THE HEAD (head space: centre at 0, 0). o: {face, glasses (0..1), glassesY, bubble (0..1), pop (0..1), t}
function cmCleoHead(c, o, P = CLPAL) {
  const f = o.face || CF.smile;
  // the black bob, behind the head
  c.beginPath(); c.moveTo(-84, 66); c.lineTo(-90, -8); c.quadraticCurveTo(-92, -94, 0, -98); c.quadraticCurveTo(92, -94, 90, -8); c.lineTo(84, 66);
  c.quadraticCurveTo(0, 74, -84, 66); c.closePath();
  c.fillStyle = P.hair; c.fill();
  // the face
  c.beginPath(); c.ellipse(0, 0, 62, 70, 0, 0, Math.PI * 2);
  const g = c.createRadialGradient(-22, -24, 8, 0, 0, 78);
  g.addColorStop(0, P.skinHi); g.addColorStop(0.45, P.skin); g.addColorStop(1, P.skinSh);
  c.fillStyle = g; c.fill();
  paint(() => {
    drawFace(c, Object.assign({}, f, { mouth: 'none', mouthOpen: 0 }), Object.assign({}, PAL, { skin: P.skin, skinSh: P.skinSh, hair: P.hair, pupil: P.pupil }));
    cmKohl(c, f);
    cmLips(c, f, P, o.t || 0);
  });
  // the straight fringe and the sheen on it
  c.beginPath(); c.moveTo(-74, -40); c.quadraticCurveTo(-80, -96, 0, -100); c.quadraticCurveTo(80, -96, 74, -40); c.lineTo(-74, -44); c.closePath();
  c.fillStyle = P.hair; c.fill();
  paint(() => {
    for (let i = -5; i <= 5; i++) line(c, i * 13, -88 + Math.abs(i) * 2.5, i * 13.6, -46, 2, 'rgba(90,90,150,0.35)');
    line(c, -40, -82, 10, -92, 5, rgba(P.hairHi, 0.8));
    // the side curtains down to the jaw: thin strands
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) line(c, s * (70 + i * 4), -30, s * (72 + i * 4), 60, 2, 'rgba(80,80,140,0.3)');
  });
  // the gold diadem with the cobra
  c.beginPath(); c.arc(0, 2, 86, Math.PI * 1.17, Math.PI * 1.83); c.lineWidth = 11; c.strokeStyle = P.gold; c.stroke();
  paint(() => { for (let i = -4; i <= 4; i++) { const a = Math.PI * 1.5 + i * 0.075; circle(c, Math.cos(a) * 86, 2 + Math.sin(a) * 86, 3, i % 2 ? P.carn : P.lapis); } });
  cmUraeus(c, P);
  // gold earrings under the hair's edge
  for (const s of [-1, 1]) { circle(c, s * 80, 74, 10, P.gold); ellipse(c, s * 80, 96, 6, 12, P.gold); paint(() => circle(c, s * 80, 74, 4, P.carn)); }
  if ((o.glasses || 0) > 0.01) cmShades(c, lerp(-92, 0, clamp(o.glasses)) + (o.glassesY || 0), P);
  // bubble gum: a pink bubble from her lips; pop: shreds round the mouth
  if ((o.bubble || 0) > 0.01) {
    const r = 6 + 74 * clamp(o.bubble);
    circle(c, 0, 44 + r * 0.55, r, '#FF8FC0');
    paint(() => { ellipse(c, -r * 0.35, 44 + r * 0.2, r * 0.25, r * 0.15, 'rgba(255,255,255,0.75)', -0.5); });
  }
  if ((o.pop || 0) > 0.01) {
    const k = clamp(o.pop);
    paint(() => { for (const [x, y, r] of [[-30, 36, 18], [26, 30, 16], [0, 54, 22], [-12, 18, 12], [34, 52, 12]]) ellipse(c, x, y, r * (0.6 + 0.4 * k), r * 0.6, '#FF8FC0'); });
  }
}
// her whole figure. World coords, feet at (x, y), scale s. o: {face, armL, armR ({w: [x, y]} local wrist targets),
// handL, handR, headRot, headDX, headDY, lean, sit (0..1), glasses, glassesY, bubble, pop, t}
const CL = { sh: 56, shY: -372, neck: -404, head: -478, a: 98, b: 88 };
function cmCleo(c, x, y, s, t, o = {}) {
  const P = CLPAL;
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    const ln = o.lean || 0;
    c.translate(0, -222); c.rotate(ln); c.translate(0, 222);
    const sit = clamp(o.sit || 0);
    // legs when sitting (shins hanging from the knees), else the dress's hem
    if (sit > 0.5) {
      for (const sd of [-1, 1]) { line(c, sd * 30, -130, sd * 32, -24, 34, P.skin); ellipse(c, sd * 36, -12, 22, 11, '#8A5A2A'); line(c, sd * 24, -18, sd * 46, -20, 4, P.gold); }
    }
    // the dress
    c.beginPath();
    if (sit > 0.5) { c.moveTo(-56, CL.shY); c.lineTo(-46, -260); c.lineTo(-62, -200); c.lineTo(-66, -120); c.quadraticCurveTo(0, -100, 66, -120); c.lineTo(62, -200); c.lineTo(46, -260); c.lineTo(56, CL.shY); }
    else { c.moveTo(-56, CL.shY); c.lineTo(-44, -256); c.lineTo(-52, -196); c.lineTo(-74, -6); c.quadraticCurveTo(0, 6, 74, -6); c.lineTo(52, -196); c.lineTo(44, -256); c.lineTo(56, CL.shY); }
    c.closePath(); c.fillStyle = P.linen; c.fill();
    paint(() => {                                                    // pleats
      for (const px of [-30, -12, 8, 28]) line(c, px * 0.7, -240, px * (sit > 0.5 ? 1.2 : 1.6), sit > 0.5 ? -116 : -10, 2, 'rgba(160,140,110,0.35)');
    });
    // sandals peeking out (standing)
    if (sit <= 0.5) for (const sd of [-1, 1]) { ellipse(c, sd * 28, -2, 22, 9, '#8A5A2A'); line(c, sd * 18, -6, sd * 38, -8, 3, P.gold); }
    // the belt and its sash
    rrect(c, -48, -266, 96, 20, 6); c.fillStyle = P.gold; c.fill();
    c.beginPath(); c.moveTo(-10, -250); c.lineTo(-18, sit > 0.5 ? -130 : -150); c.lineTo(-2, sit > 0.5 ? -126 : -146); c.lineTo(2, -250); c.closePath(); c.fillStyle = P.carn; c.fill();
    c.beginPath(); c.moveTo(4, -250); c.lineTo(14, sit > 0.5 ? -136 : -160); c.lineTo(26, sit > 0.5 ? -132 : -156); c.lineTo(14, -250); c.closePath(); c.fillStyle = P.lapis; c.fill();
    // neck and the broad collar (usekh): bands of gold, lapis, turquoise and carnelian
    c.fillStyle = P.skin; c.fillRect(-20, CL.neck - 26, 40, 60);
    const bands = [[30, 42, P.gold], [42, 54, P.lapis], [54, 66, P.turq], [66, 78, P.gold], [78, 88, P.carn]];
    for (const [r0, r1, col] of bands) {
      c.beginPath(); c.arc(0, CL.neck + 4, r1, Math.PI * 0.02, Math.PI * 0.98); c.arc(0, CL.neck + 4, r0, Math.PI * 0.98, Math.PI * 0.02, true); c.closePath();
      c.fillStyle = col; c.fill();
    }
    paint(() => { for (let i = 0; i <= 14; i++) { const a = Math.PI * (0.06 + 0.88 * i / 14); circle(c, Math.cos(a) * 92, CL.neck + 4 + Math.sin(a) * 92, 5, P.gold); } });
    // the head
    const hx = o.headDX || 0, hy = CL.head + (o.headDY || 0);
    c.save(); c.translate(hx, hy); c.rotate(o.headRot || 0);
    cmCleoHead(c, { face: o.face, glasses: o.glasses, glassesY: o.glassesY, bubble: o.bubble, pop: o.pop, t });
    c.restore();
    // arms (bare, a gold band on each upper arm), in front
    for (const [sd, k] of [[-1, 'L'], [1, 'R']]) {
      const sh = [sd * CL.sh, CL.shY + 8];
      const tg = o['arm' + k] || { w: [sd * 70, -200] };
      const A = cmIK(sh, tg.w, CL.a, CL.b, tg.bend !== undefined ? tg.bend : -sd);
      line(c, sh[0], sh[1], A.el[0], A.el[1], 30, P.skin);
      line(c, A.el[0], A.el[1], A.wr[0], A.wr[1], 26, P.skin);
      const ub = [lerp(sh[0], A.el[0], 0.45), lerp(sh[1], A.el[1], 0.45)], dd = [A.el[0] - sh[0], A.el[1] - sh[1]], L = Math.hypot(dd[0], dd[1]) || 1;
      line(c, ub[0] - dd[1] / L * 16, ub[1] + dd[0] / L * 16, ub[0] + dd[1] / L * 16, ub[1] - dd[0] / L * 16, 9, P.gold);
      cmHand(c, A.wr, A.dir, o['hand' + k] || 'open', P, sd);
    }
    c.restore();
  });
}
// where her head is in world coords (for cameras and bubbles)
function cmCleoHeadAt(x, y, s, o = {}) { return [x + ((o.headDX || 0)) * s, y + (CL.head + (o.headDY || 0)) * s]; }

// ---------------------------------------------------------------- Neil Armstrong: the house rig in a white suit, visor down
const NEILPAL = Object.assign({}, PAL, { coat: '#EEF0F2', coatSh: '#C9CDD4', coatHi: '#FFFFFF', coatDk: '#AEB4BE', strap: '#9AA3B5',
  strapSh: '#7A8396', pants: '#E6E8EC', pantsSh: '#BEC3CC', shoe: '#F2F4F8', shoeSh: '#C2C8D2', sole: '#6A7080', skin: '#E9ECF0', skinSh: '#C4C9D2' });
function cmNeil(x, y, s, t, o = {}) {
  const pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.feetFront = 1;
  const wv = o.wave || 0;
  if (wv > 0.01) { pose.armL = { a: lerp(0.2, 2.6, wv), b: lerp(0.12, 0.5 + 0.35 * Math.sin(t * 14), wv) }; pose.handL = 'spread'; }
  const st = { x, y, s, pose, face: FACES.calm };
  actor(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rrect(ctx, -92, -452, 184, 220, 20); ctx.fillStyle = '#D6D9E0'; ctx.fill();          // the backpack behind him
    ctx.restore();
    drawCharacterRig(ctx, st, t, NEILPAL);
    const r = rig(pose);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(r.head[0], r.head[1]);
    circle(ctx, 0, -6, 104, '#F2F4F8');                                                    // the white shell
    paint(() => {
      const g = ctx.createRadialGradient(-26, -30, 6, 0, 0, 92);
      g.addColorStop(0, '#FFF2B0'); g.addColorStop(0.35, '#E8B84A'); g.addColorStop(1, '#7A4A0C');
      ctx.beginPath(); ctx.ellipse(0, 4, 84, 76, 0, 0, 7); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 4, 70, Math.PI * 1.1, Math.PI * 1.42); ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineCap = 'round'; ctx.stroke();
      // a tiny reflection of Earth in the visor
      circle(ctx, 30, -18, 8, 'rgba(90,160,255,0.85)');
      ctx.fillStyle = '#C8283A'; ctx.fillRect(-120, 170, 26, 16); ctx.fillStyle = '#26407E'; ctx.fillRect(-120, 170, 11, 8);   // the flag patch on his shoulder
    });
    ctx.restore();
  });
}

// ---------------------------------------------------------------- the woolly mammoth (side view, facing left)
// local: feet at y 0, the head's dome at about (-250, -560). o: {trunk 0..1 (raised in a wave), chew (phase), look [x, y],
// blink, brow, tusk (shine), sway}
function cmMammoth(c, x, y, s, t, o = {}) {
  const fur = '#6A4228', furD = '#4A2C1A', furL = '#8E5E38', tusk = '#F2E6C8';
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    const sw = (o.sway || 0) * Math.sin(t * 2);
    // far legs
    for (const lx of [-120, 210]) { rrect(c, lx - 44, -260, 88, 262, 30); c.fillStyle = furD; c.fill(); }
    // the tail
    line(c, 320, -360, 360, -250, 12, furD); ellipse(c, 362, -238, 14, 22, furD);
    // the body: a high domed head and shoulders sloping to the rump
    c.beginPath(); c.moveTo(-210, -300);
    c.bezierCurveTo(-260, -520, -120, -640, 10, -600);
    c.bezierCurveTo(160, -560, 330, -470, 350, -330);
    c.bezierCurveTo(360, -240, 300, -200, 220, -200);
    c.lineTo(-140, -200); c.bezierCurveTo(-200, -210, -220, -250, -210, -300); c.closePath();
    c.fillStyle = fur; c.fill();
    // the shaggy skirt under the belly
    c.beginPath(); c.moveTo(-200, -240);
    for (let i = 0; i <= 26; i++) { const xx = -200 + i * 20, yy = -150 - 30 * Math.abs(Math.sin(i * 1.7)) + 8 * Math.sin(t * 3 + i); c.lineTo(xx, i % 2 ? yy : -205); }
    c.lineTo(330, -240); c.closePath(); c.fillStyle = furD; c.fill();
    // near legs
    for (const lx of [-160, 160]) {
      rrect(c, lx - 48, -270, 96, 272, 32); c.fillStyle = fur; c.fill();
      paint(() => { for (let k = -1; k <= 1; k++) ellipse(c, lx + k * 24, -6, 12, 9, '#D8C8A4'); });
    }
    // the head
    const hx = -250, hy = -470;
    c.beginPath(); c.ellipse(hx, hy, 120, 140, -0.2, 0, 7); c.fillStyle = fur; c.fill();
    ellipse(c, hx + 40, hy - 70, 70, 90, fur, 0.3);                 // the dome
    ellipse(c, hx + 96, hy - 6, 30, 44, furD, 0.2);                  // the small ear
    paint(() => {                                                     // fur strands
      const rng = mulberry32(17);
      for (let i = 0; i < 70; i++) {
        const px = -230 + 560 * rng(), py = -560 + 330 * rng(), L = 26 + 30 * rng();
        line(c, px, py, px + 4 * Math.sin(i), py + L, 3, rng() < 0.5 ? furL : furD);
      }
      for (let i = 0; i < 18; i++) { const px = hx - 80 + 150 * rng(), py = hy - 120 + 140 * rng(); line(c, px, py, px - 3, py + 22, 3, furL); }
    });
    // the eye and brow
    paint(() => {
      const ex = hx - 50, ey = hy - 30, look = o.look || [-0.6, 0];
      if ((o.blink || 0) > 0.9) line(c, ex - 14, ey, ex + 14, ey, 4, '#1A0E08');
      else { ellipse(c, ex, ey, 15, 17, '#FFFFFF'); circle(c, ex + look[0] * 5, ey + look[1] * 5, 8, '#1A0E08'); circle(c, ex + look[0] * 5 - 3, ey + look[1] * 5 - 3, 3, '#FFFFFF'); }
      const bw = o.brow || 0;
      line(c, ex - 20, ey - 26 - 8 * bw, ex + 18, ey - 22 + 6 * bw, 6, furD);
    });
    // the mouth with grass (chewing), under the trunk's root
    const ch = Math.sin(o.chew || 0);
    paint(() => { for (let k = -2; k <= 2; k++) line(c, hx - 60, hy + 90 + 4 * ch, hx - 80 + k * 10, hy + 70 - 24 + 6 * ch * k, 4, '#8AA24A'); });
    ellipse(c, hx - 56, hy + 92 + 3 * ch, 26, 12 + 4 * Math.abs(ch), '#5A3220');
    // tusks: long, curving down, forward, then up and in
    for (const [ox, sh, w] of [[16, 0.85, 20], [0, 1, 24]]) {
      c.beginPath(); c.moveTo(hx - 70 + ox, hy + 50);
      c.bezierCurveTo(hx - 170 + ox, hy + 210 * sh, hx - 330 + ox, hy + 160 * sh, hx - 330 + ox * 2, hy + 10 * sh);
      c.lineWidth = w; c.strokeStyle = ox ? '#CFC2A0' : tusk; c.lineCap = 'round'; c.stroke();
    }
    // the trunk: from between the tusks, hanging and curling; o.trunk raises it in a wave
    const tr = clamp(o.trunk || 0), wig = Math.sin(t * 9) * 0.3 * tr;
    c.beginPath(); c.moveTo(hx - 100, hy + 10);
    const p1 = [hx - 160, hy + lerp(140, -60, tr)], p2 = [hx - 150 + lerp(0, -80, tr), hy + lerp(300, -180, tr)];
    c.bezierCurveTo(p1[0], p1[1], p2[0] + 30 * wig * 100 / 100, p2[1] - 40, p2[0], p2[1]);
    c.lineWidth = 46; c.strokeStyle = fur; c.lineCap = 'round'; c.stroke();
    c.lineWidth = 30; c.strokeStyle = fur; c.stroke();
    ellipse(c, p2[0] + 6, p2[1] + (tr > 0.5 ? -14 : 14), 22, 16, furD);
    paint(() => { for (let k = 0; k < 6; k++) { const u = 0.2 + k * 0.13, bx = lerp(lerp(hx - 100, p1[0], u), lerp(p1[0], p2[0], u), u), by = lerp(lerp(hy + 10, p1[1], u), lerp(p1[1], p2[1], u), u); line(c, bx - 16, by, bx + 16, by + 2, 3, furD); } });
    c.restore();
  });
}

// ---------------------------------------------------------------- the pyramid builders: four haul a block on a sledge
function cmWorker(c, x, y, s, t, o = {}) {
  const skin = '#B07A52', hair = '#1A1210';
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s);
    const ph = o.ph || 0, lean = o.lean === undefined ? 0.35 : o.lean, step = Math.sin(ph);
    c.rotate(lean);
    line(c, -6, -70, -12 + 14 * step, 0, 16, skin); line(c, 6, -70, 12 - 14 * step, 0, 16, skin);
    c.beginPath(); c.moveTo(-24, -110); c.lineTo(24, -110); c.lineTo(30, -60); c.lineTo(-30, -60); c.closePath(); c.fillStyle = '#F2EEE2'; c.fill();
    rrect(c, -20, -190, 40, 86, 14); c.fillStyle = skin; c.fill();
    // arms out front to the rope
    line(c, -10, -170, -60, -140 + 6 * step, 12, skin); line(c, 12, -168, -56, -132 - 6 * step, 12, skin);
    c.restore();
    c.save(); c.translate(x, y); c.scale(s, s);
    const hx = (o.flip ? -1 : 1) * Math.sin(lean) * 230, hy = -Math.cos(lean) * 230;
    circle(c, hx, hy, 30, skin);
    c.beginPath(); c.arc(hx, hy - 4, 33, Math.PI * 0.95, Math.PI * 2.05); c.fillStyle = hair; c.fill();
    paint(() => {
      const lk = o.look || 0;                                       // 0 ahead, 1 up at him
      circle(c, hx - 10 * (o.flip ? -1 : 1), hy - 2 - 8 * lk, 4.5, '#1A0E08'); circle(c, hx + 8 * (o.flip ? -1 : 1), hy - 2 - 8 * lk, 4.5, '#1A0E08');
      if (lk > 0.5) ellipse(c, hx, hy + 14, 6, 8, '#3A1010'); else line(c, hx - 8, hy + 14, hx + 8, hy + 14, 3, '#3A1010');
    });
    c.restore();
  });
}
function cmBlock(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, -120, 0, 120, 0, 18, '#7A5230'); line(c, -130, -6, -150, -30, 12, '#7A5230');            // the sledge
  rrect(c, -110, -150, 220, 142, 6); c.fillStyle = '#EADBB6'; c.fill();
  paint(() => { line(c, -100, -110, 100, -112, 2, 'rgba(150,120,80,0.35)'); line(c, -60, -150, -64, -10, 2, 'rgba(150,120,80,0.3)'); });
  c.restore();
}
function cmTumbleweed(c, x, y, r, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const rng = mulberry32(77);
  c.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const a = rng() * 6.28, b = a + (rng() - 0.5) * 2.4, r1 = r * (0.3 + 0.7 * rng()), r2 = r * (0.5 + 0.5 * rng());
    c.beginPath(); c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    c.quadraticCurveTo(Math.cos((a + b) / 2) * r * 1.05, Math.sin((a + b) / 2) * r * 1.05, Math.cos(b) * r2, Math.sin(b) * r2);
    c.lineWidth = 2.5 + 2.5 * rng(); c.strokeStyle = rng() < 0.5 ? '#B98A4E' : '#8E6534'; c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------- graphics (screen space)
function cmTag(txt, x, y, k, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  const size = o.size || 46, sub = o.sub || '';
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(E.outBack(clamp(k), 1.7), E.outBack(clamp(k), 1.7));
  ctx.font = `900 ${size}px Montserrat`;
  const w1 = ctx.measureText(txt).width;
  ctx.font = `800 ${size * 0.56}px Montserrat`;
  const w2 = sub ? ctx.measureText(sub).width : 0;
  const w = Math.max(w1, w2) + size * 1.1, h = size * (sub ? 1.95 : 1.4);
  rrect(ctx, -w / 2 + 6, -h / 2 + 8, w, h, h * 0.32); ctx.fillStyle = 'rgba(10,6,20,0.55)'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h * 0.32); ctx.fillStyle = o.bg || '#1E1430'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = o.edge || '#FFD447'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${size}px Montserrat`; ctx.fillStyle = o.fg || '#FFFFFF';
  ctx.fillText(txt, 0, sub ? -size * 0.36 : 2);
  if (sub) { ctx.font = `800 ${size * 0.56}px Montserrat`; ctx.fillStyle = o.subCol || '#FFE6A8'; ctx.fillText(sub, 0, size * 0.5); }
  ctx.restore();
}
function cmBurst(txt, x, y, r, k, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.12); const sc = E.outBack(clamp(k), 2); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 22; i++) { const a = i * Math.PI * 2 / 22, rr = r * (i % 2 ? 0.66 : 1) * (1 + 0.06 * Math.sin(i * 3.1)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.78); }
  ctx.closePath(); ctx.fillStyle = o.bg || '#FFFFFF'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#141A2E'; ctx.stroke();
  ctx.font = `900 ${o.size || r * 0.5}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 8; ctx.strokeStyle = '#141A2E'; ctx.strokeText(txt, 0, 4);
  ctx.fillStyle = o.fg || '#FF5A6E'; ctx.fillText(txt, 0, 4);
  ctx.restore();
}
// the counter at the top: a big number and a word under it. mode: 'up' (green arrows) or 'back' (violet rewind)
function cmCounter(k, txt, label, col, t, mode = 'up') {
  if (k <= 0.01) return;
  screenSpace();
  const s = lerp(0.7, 1, E.outBack(clamp(k))), y = 560;
  ctx.save(); ctx.translate(540, y); ctx.scale(s, s);
  rrect(ctx, -270, -78, 540, 156, 30); ctx.fillStyle = 'rgba(14,10,30,0.97)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = '400 90px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const wN = ctx.measureText(txt).width, sz = Math.min(1, 400 / wN);
  ctx.save(); ctx.translate(30, -12); ctx.scale(sz, sz); ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 0); ctx.restore();
  ctx.font = '800 25px Montserrat'; const wl = ctx.measureText(label).width; ctx.save(); ctx.translate(0, 52); ctx.scale(Math.min(1, 470 / wl), 1); ctx.fillStyle = col; ctx.fillText(label, 0, 0); ctx.restore();
  const on = 0.55 + 0.45 * Math.sign(Math.sin(t * 14)), dir = mode === 'back' ? -1 : 1;
  ctx.fillStyle = rgba(col, on);
  for (const oy of [-14, 16]) { ctx.beginPath(); ctx.moveTo(-220, oy + 16 * dir); ctx.lineTo(-196, oy - 12 * dir); ctx.lineTo(-172, oy + 16 * dir); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// a vertical bracket from y0 to y1 at x (screen), drawn on by k, with a label beside it (side -1: label left)
function cmBracket(x, y0, y1, k, col, label, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  const side = o.side || 1, ym = lerp(y0, y1, 0.5), kk = clamp(k * 1.4);
  const ya = lerp(ym, y0, kk), yb = lerp(ym, y1, kk);
  paint(() => {
    ctx.lineCap = 'round';
    line(ctx, x, ya, x, yb, 7, col);
    line(ctx, x, ya, x - side * 26, ya, 7, col); line(ctx, x, yb, x - side * 26, yb, 7, col);
    softDot(gctx, x, ym, 60, col, 0.35 * kk);
  });
  if (label && k > 0.4) cmTag(label, x + side * (o.dx || 120), o.ly || ym, clamp((k - 0.4) * 2.5), { size: o.size || 40, edge: col, sub: o.sub, subCol: o.subCol || col });
}
