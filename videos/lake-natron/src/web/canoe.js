// The hiker in a wooden canoe on Lake Natron: a teal explorer's shirt that stands out against the red water, a pith
// helmet, a paddle; the canoe's far rail on his own layer under him and its near side in front of him (so the boat is
// lit and sharp with him, never softened as set). ntHero(cam, t, A) draws him from a description and returns his points.
// World: he sits at NT.hx, NT.hy (the waterline under the canoe), scale NT.hs.
'use strict';

const NATPAL = Object.assign({}, PAL, { coat: '#22B3C4', coatSh: '#147C92', coatHi: '#86E4EE', coatDk: '#0F5E74',
  strap: '#E7C27C', strapSh: '#B08A46' });
// his faces here (FACES keys; mouth 'none' is not used)
const NF = {
  poke: { eyeOpen: 1.12, pupil: 0.95, lookX: 0.9, lookY: 0.15, browY: 0.85, browTilt: -0.25, mouth: 'o', mouthOpen: 0.22, blink: 0, cross: 0 },
  tok: { eyeOpen: 1.28, pupil: 0.75, lookX: 0.85, lookY: 0.0, browY: 1.35, browTilt: 0.15, mouth: 'o', mouthOpen: 0.5, blink: 0, cross: 0 },
  us: { eyeOpen: 1.18, pupil: 0.85, lookX: 0, lookY: 0, browY: 1.25, browTilt: 0.05, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  eww: { eyeOpen: 0.55, pupil: 1, lookX: 0.6, lookY: 0.3, browY: -0.25, browTilt: 1.25, mouth: 'grimace', mouthOpen: 1, blink: 0.35, cross: 0 },
  burn: { eyeOpen: 1.42, pupil: 0.5, lookX: -0.7, lookY: 0.5, browY: 1.55, browTilt: 0.45, mouth: 'scream', mouthOpen: 0.75, blink: 0, cross: 0 },
  down: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.1, lookY: 1, browY: 0.7, browTilt: 0.35, mouth: 'o', mouthOpen: 0.25, blink: 0, cross: 0 },
  dead: { eyeOpen: 0.82, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.3, mouth: 'flat', mouthOpen: 0, blink: 0.3, cross: 0 },
  side: { eyeOpen: 1.38, pupil: 0.55, lookX: -0.95, lookY: 0, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 },
  shock: { eyeOpen: 1.42, pupil: 0.5, lookX: 0.4, lookY: 0.2, browY: 1.55, browTilt: 0.4, mouth: 'scream', mouthOpen: 0.9, blink: 0, cross: 0 },
  smile: { eyeOpen: 1, pupil: 1, lookX: -0.6, lookY: 0, browY: 0.6, browTilt: -0.1, mouth: 'grin', mouthOpen: 0.55, blink: 0, cross: 0 },
  nope: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: 0, browY: 0.45, browTilt: 0.35, mouth: 'grin', mouthOpen: 0.35, blink: 0.15, cross: 0 },
};

// ---------------------------------------------------------------- the canoe (world units round the hero; length 780)
const CN = { x0: 150, x1: 930, top: 1080, keel: 1156 };
const cnTop = (x) => { const d = (x - 540) / 390; return CN.top - 50 * Math.pow(Math.abs(d), 4); };
const cnBot = (x) => { const d = (x - 540) / 390; return CN.keel - 64 * Math.pow(Math.abs(d), 2.6); };
function cnHullPath(c, inset = 0) {
  c.beginPath();
  for (let x = CN.x0 + inset; x <= CN.x1 - inset; x += 10) { const y = cnTop(x) + inset; x === CN.x0 + inset ? c.moveTo(x, y) : c.lineTo(x, y); }
  for (let x = CN.x1 - inset; x >= CN.x0 + inset; x -= 10) c.lineTo(x, cnBot(x) - inset * 0.6);
  c.closePath();
}
// behind him: the far rail and the dark inside of the boat (on his layer, before him)
function cnBack(c) {
  c.beginPath(); c.moveTo(CN.x0 + 22, cnTop(CN.x0 + 22) + 4);
  for (let x = CN.x0 + 22; x <= CN.x1 - 22; x += 10) c.lineTo(x, cnTop(x) - 30 + 22 * Math.pow(Math.abs((x - 540) / 390), 3));
  for (let x = CN.x1 - 22; x >= CN.x0 + 22; x -= 10) c.lineTo(x, cnTop(x) + 6);
  c.closePath(); c.fillStyle = '#4A2212'; c.fill();
  c.beginPath();
  for (let x = CN.x0 + 22; x <= CN.x1 - 22; x += 10) { const y = cnTop(x) - 30 + 22 * Math.pow(Math.abs((x - 540) / 390), 3); x === CN.x0 + 22 ? c.moveTo(x, y) : c.lineTo(x, y); }
  c.lineWidth = 12; c.strokeStyle = '#B9733F'; c.lineCap = 'round'; c.stroke();
}
// in front of him: the near side of the hull, its rail, planks, a cream stripe, the wet band at the waterline
function cnFront(c, t) {
  cnHullPath(c); c.fillStyle = '#9C552F'; c.fill();
  paint(() => {
    c.save(); cnHullPath(c); c.clip();
    for (let k = 1; k < 4; k++) { c.beginPath(); for (let x = CN.x0; x <= CN.x1; x += 10) { const y = lerp(cnTop(x), cnBot(x), k / 4); x === CN.x0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.lineWidth = 3; c.strokeStyle = 'rgba(90,40,20,0.45)'; c.stroke(); }
    c.beginPath(); for (let x = CN.x0; x <= CN.x1; x += 10) { const y = lerp(cnTop(x), cnBot(x), 0.3); x === CN.x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.lineWidth = 10; c.strokeStyle = '#F2E2C2'; c.stroke();
    c.beginPath(); for (let x = CN.x0; x <= CN.x1; x += 10) { const y = lerp(cnTop(x), cnBot(x), 0.3) + 9; x === CN.x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.lineWidth = 5; c.strokeStyle = '#1FA2B4'; c.stroke();
    const wg = c.createLinearGradient(0, CN.keel - 30, 0, CN.keel);                       // wet and dark at the waterline
    wg.addColorStop(0, 'rgba(60,15,20,0)'); wg.addColorStop(1, 'rgba(60,15,20,0.55)');
    c.fillStyle = wg; c.fillRect(CN.x0, CN.keel - 30, CN.x1 - CN.x0, 40);
    c.restore();
  });
  c.beginPath(); for (let x = CN.x0; x <= CN.x1; x += 10) { const y = cnTop(x); x === CN.x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
  c.lineWidth = 14; c.strokeStyle = '#C98547'; c.lineCap = 'round'; c.stroke();              // the rail
}
// the hull's reflection and the line where it meets the water (set: drawn before him, in world space)
function cnWaterline(c, t) {
  c.save();
  c.translate(0, 2 * CN.keel); c.scale(1, -1);
  c.globalAlpha = 0.28; cnHullPath(c); c.fillStyle = '#3A0D18'; c.fill();
  c.restore();
  c.save();
  for (let i = 0; i < 3; i++) {
    const y = CN.keel + 4 + i * 9, a = 0.35 - i * 0.1;
    c.beginPath(); c.ellipse(540, y, 420 + i * 40 + 6 * Math.sin(t * loopW(2.2) + i), 7 + i * 3, 0, 0, 7);
    c.lineWidth = 3; c.strokeStyle = rgba('#FFC8B0', a); c.stroke();
  }
  c.restore();
}

function cnRock(c, dy, roll) { c.translate(540, NT.hy + dy); c.rotate(roll); c.translate(-540, -NT.hy); }

// ---------------------------------------------------------------- the paddle (world units): grip at g, blade tip at b
function cnPaddle(c, g, b, o = {}) {
  const dx = b[0] - g[0], dy = b[1] - g[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const bl = 120, bw = 34, bs = [b[0] - ux * bl, b[1] - uy * bl];
  line(c, g[0], g[1], bs[0], bs[1], 13, '#C08A55');                                   // the shaft
  line(c, g[0] - ux * 8, g[1] - uy * 8, g[0] + ux * 8, g[1] + uy * 8, 22, '#8A5A30'); // the grip
  c.beginPath();                                                                      // the blade
  c.moveTo(bs[0] + nx * 8, bs[1] + ny * 8);
  c.quadraticCurveTo(bs[0] + nx * bw + ux * 30, bs[1] + ny * bw + uy * 30, b[0] + nx * bw * 0.8, b[1] + ny * bw * 0.8);
  c.quadraticCurveTo(b[0] + ux * 14, b[1] + uy * 14, b[0] - nx * bw * 0.8, b[1] - ny * bw * 0.8);
  c.quadraticCurveTo(bs[0] - nx * bw + ux * 30, bs[1] - ny * bw + uy * 30, bs[0] - nx * 8, bs[1] - ny * 8);
  c.closePath(); c.fillStyle = '#D29A60'; c.fill();
  const cr = clamp(o.crust || 0);                                                     // the soda crust on its tip
  if (cr > 0.01) paint(() => {
    c.save(); c.clip();
    const cut = 1 - 0.75 * cr;
    const p0 = [b[0] - ux * bl * (1 - cut) * 1.3, b[1] - uy * bl * (1 - cut) * 1.3];
    c.beginPath();
    for (let i = 0; i <= 12; i++) { const s2 = (i / 12 - 0.5) * 2, j = 7 * Math.sin(i * 2.7); c.lineTo(p0[0] + nx * s2 * 60 - ux * j, p0[1] + ny * s2 * 60 - uy * j); }
    c.lineTo(b[0] + ux * 40 + nx * 60, b[1] + uy * 40 + ny * 60); c.lineTo(b[0] + ux * 40 - nx * 60, b[1] + uy * 40 - ny * 60); c.closePath();
    c.fillStyle = '#F6EEE6'; c.fill();
    const rng = mulberry32(5);
    for (let i = 0; i < 26; i++) circle(c, b[0] - ux * rng() * bl * cr * 0.6 + nx * (rng() - 0.5) * 50, b[1] - uy * rng() * bl * cr * 0.6 + ny * (rng() - 0.5) * 50, 2 + 3 * rng(), rgba('#D9C8BC', 0.9));
    c.restore();
  });
}

// ---------------------------------------------------------------- the pith helmet (head space: the head's middle at 0, 0)
function cnHat(c, tip = 0) {
  c.save(); c.rotate(tip);
  c.beginPath(); c.ellipse(0, -44, 108, 21, 0, 0, 7); c.fillStyle = '#CDB37A'; c.fill();     // the brim
  c.beginPath(); c.ellipse(0, -50, 76, 64, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#EAD6A2'; c.fill();   // the dome
  paint(() => {
    rrect(c, -76, -60, 152, 13, 6); c.fillStyle = '#6E4A2A'; c.fill();                         // the band
    c.beginPath(); c.ellipse(-22, -86, 20, 9, -0.35, 0, 7); c.fillStyle = 'rgba(255,248,226,0.6)'; c.fill();
    circle(c, 0, -112, 7, '#CDB37A');
  });
  c.restore();
}

// ---------------------------------------------------------------- him in the canoe, from a description
// A: {face, headDX, headDY, headRot, lean, bob, hatTip, armL: [x, y] | {e, w}, armR: [x, y] | {e, w} (world points or rig
// elbow+wrist), handL, handR ('open' 'point' 'spread' 'fist'), paddle: {g: [x, y], b: [x, y] (world), crust, held: 'L'|'R'|'LR'},
// wipe 0..1 (the right hand rubbing his chest), post(lc, H), noBoat}
function ntHero(cam, t, A0 = {}) {
  let A = A0;
  const dy = A.dy || 0, roll = A.roll || 0;                              // the boat bobs and rocks on the water
  const st = { x: NT.hx, y: NT.hy + dy, s: NT.hs, face: A.face || NF.us, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: true };
  let pose = JSON.parse(JSON.stringify(POSES.sit));
  pose.lean = (A.lean || 0) + roll; pose.hipY += A.bob || 0;
  pose.armL = { a: 0.45, b: -0.35 }; pose.armR = { a: 0.45, b: -0.35 };
  const loc = (p) => ikLocal(st, p[0], p[1]);
  const armP = (p0, side, tgt) => {
    if (!tgt) return p0;
    if (Array.isArray(tgt)) { const a1 = ikReach(p0, side, loc(tgt), 1), b1 = ikReach(p0, side, loc(tgt), -1), s = side === 'R' ? 1 : -1; return s * rig(a1)['el' + side][0] >= s * rig(b1)['el' + side][0] ? a1 : b1; }
    return armAt(p0, side, loc(tgt.e), loc(tgt.w));
  };
  // a pointing finger whose TIP lands on a world point: solve for the wrist, a few times (the finger lies along the forearm)
  for (const side of ['L', 'R']) {
    const tip = A['tip' + side];
    if (!tip) continue;
    let w = tip;
    for (let i = 0; i < 4; i++) { const d = rig(armP(pose, side, w))['armDir' + side]; w = [tip[0] - d[0] * 70 * st.s, tip[1] - d[1] * 70 * st.s]; }
    A = Object.assign({}, A, { ['arm' + side]: w });
  }
  pose = armP(pose, 'L', A.armL); pose = armP(pose, 'R', A.armR);
  pose.handL = A.handL || 'open'; pose.handR = A.handR || 'open';
  const r0 = rig(pose);
  const H = { hd: [r0.head[0] + st.headDX, r0.head[1] + st.headDY], hr: pose.lean + st.headRot };
  const wp = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  const rr = charLayer(cam, Object.assign({}, st, { pose }), t, {
    pal: NATPAL,
    pre: (lc) => { if (!A.noBoat) { lc.save(); cnRock(lc, dy, roll); cnBack(lc); if (A.inBoat) A.inBoat(lc); lc.restore(); } },
    post: (lc, r) => {
      lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
      lc.save(); lc.translate(H.hd[0], H.hd[1]); lc.rotate(H.hr); cnHat(lc, A.hatTip || 0); lc.restore();
      lc.restore();
      if (A.paddle && !A.paddle.over) cnPaddle(lc, A.paddle.g, A.paddle.b, A.paddle);
      if (!A.noBoat) { lc.save(); cnRock(lc, dy, roll); cnFront(lc, t); lc.restore(); }
      if (A.paddle && A.paddle.over) {                     // the paddle in front of the hull, its blade clipped at the water
        lc.save(); lc.beginPath(); lc.rect(-2000, -2000, 5000, 2000 + (A.paddle.sub || 99999)); lc.clip();
        cnPaddle(lc, A.paddle.g, A.paddle.b, A.paddle); lc.restore();
      }
      if (A.paddle && A.paddle.hands) for (const k of A.paddle.hands) { const w2 = wp(r['wr' + k]), d = r['armDir' + k]; circle(lc, w2[0] + d[0] * 14 * st.s, w2[1] + d[1] * 14 * st.s, 21 * st.s, NATPAL.skin); }
      if (A.post) A.post(lc, { H, r, st, wp });
    },
  });
  return { st, r: rr, pose, head: wp(H.hd), wrL: wp(rr.wrL), wrR: wp(rr.wrR), H, wp };
}
