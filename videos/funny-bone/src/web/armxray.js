// His arm, see-through. "Arm units": the shoulder is (0, 0), the upper arm runs LEFT to the elbow, the forearm UP to the
// hand: the pose he holds his sore arm in. It is his right arm with the palm toward us, so the little finger is the
// outermost one (far left). The nerve of the story (the ulnar nerve) comes down from the neck, lies under muscle along
// the underside of the upper arm, runs round the OUTSIDE of the elbow on bare bone with only skin over it, then goes
// under muscle again up the little-finger side of the forearm, and ends in the little finger and half the ring finger.
// fbArm draws at the current transform of ctx and gctx; armOn(V, fn) sets one up: V = {x, y, s} puts the shoulder at
// screen (x, y) with s pixels to a unit.
'use strict';

const FBA = {
  ELB: [-458, 14],           // the middle of the bare stretch: what the window in the doorway looks at
  HIT: [-496, 2],            // where the door frame lands
  KNOB: [-430, 20],          // the end of the upper-arm bone
  HUM: [-200, 6],            // the middle of the upper-arm bone
  HAND: [-440, -500],
  PINKY: [-501, -584], RING: [-461, -608],
  FACE: [-426, 71],          // where the bare nerve has its face
};
// the arm's outline, clockwise on screen (the hand's shapes are added to the same path, so they must turn the same way)
const FB_SKIN = [
  [90, 40], [40, 86], [-60, 106], [-190, 114], [-320, 108],                    // armpit, then under the upper arm
  [-400, 98], [-448, 90], [-488, 68], [-506, 34], [-510, -4],                  // round the elbow: bony, close to the bone
  [-512, -50], [-526, -120], [-530, -230], [-514, -330], [-490, -398],         // up the outside of the forearm
  [-384, -398], [-360, -330], [-348, -240], [-356, -150], [-352, -96],         // the wrist, down the inside to the crook
  [-310, -86], [-180, -88], [-40, -98], [60, -118],                            // along the top of the upper arm
];
const FB_FINGERS = [   // [base, tip, width]: little finger first (outermost), then ring, middle, index, thumb
  [[-481, -494], [-501, -572], 26], [[-454, -500], [-461, -604], 28], [[-425, -502], [-421, -620], 29], [[-397, -498], [-381, -598], 28], [[-390, -438], [-332, -478], 32],
];
const FB_MUS = [   // [a, b, bulge on the left of a->b, bulge on the right]: two on the upper arm, two on the forearm
  [[-48, -30], [-376, -22], 6, 52],       // on top of the bone
  [[-30, 42], [-368, 52], 56, 8],         // under it: the nerve lies under this one
  [[-484, -72], [-464, -352], 38, 18],    // the outside of the forearm: the nerve again
  [[-392, -62], [-408, -350], 10, 40],    // the inside of the forearm
];
const FB_NP = [[170, -150], [110, -60], [40, 30], [-40, 52], [-200, 56], [-330, 58], [-400, 70], [-440, 70], [-474, 52], [-490, 22], [-492, -12], [-484, -56],
  [-476, -120], [-472, -220], [-468, -330], [-466, -400], [-470, -450], [-476, -480]];
const FB_BR = [[[-476, -480], [-486, -512], [-496, -556], [-501, -582]], [[-476, -480], [-466, -520], [-461, -570], [-461, -606]]];
let FB_N = null;   // the dense curves, their lengths and the marks along the main one

// Catmull-Rom through P, seg points a span
function fbCR(P, seg = 12) {
  const out = [], n = P.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
    for (let j = 0; j < seg; j++) {
      const u = j / seg, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  out.push(P[n - 1]);
  return out;
}
function initArm() {
  const main = fbCR(FB_NP, 14), acc = polyLen(main);
  const near = (pt) => { let b = 0, bd = 1e9; main.forEach((p, i) => { const d = Math.hypot(p[0] - pt[0], p[1] - pt[1]); if (d < bd) { bd = d; b = i; } }); return b; };
  const br = FB_BR.map((P) => { const D = fbCR(P, 10); return { P: D, acc: polyLen(D) }; });
  FB_N = { main, acc, L: acc[acc.length - 1], br, i0: near([-372, 62]), i1: near([-484, -64]), iHit: near([-492, 0]), iFace: near(FBA.FACE), iWrist: near([-466, -400]), iSh: near([40, 30]) };
}
function armOn(V, fn) {
  for (const c of [ctx, gctx]) { c.save(); c.translate(V.x, V.y); c.scale(V.s, V.s); }
  try { return fn(); } finally { ctx.restore(); gctx.restore(); }
}
const armPt = (V, x, y) => [V.x + x * V.s, V.y + y * V.s];
// a view that puts arm point F at screen point P, s pixels to a unit
const armView = (F, P, s) => ({ x: P[0] - F[0] * s, y: P[1] - F[1] * s, s });
// keyframed views: keys [t, focusX, focusY, s, screenX, screenY]
function armKeys(t, keys, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = [t, ...[1, 2, 3, 4, 5].map((j) => lerp(a[j], b[j], u))]; }
    break;
  }
  return armView([k[1], k[2]], [k[4], k[5]], k[3]);
}

// a capsule added to the current path, clockwise on screen
function fbCapPath(c, a, b, w) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = dy / L, ny = -dx / L, r = w / 2, an = Math.atan2(ny, nx);
  c.moveTo(a[0] + nx * r, a[1] + ny * r); c.lineTo(b[0] + nx * r, b[1] + ny * r);
  c.arc(b[0], b[1], r, an, an + Math.PI, false); c.lineTo(a[0] - nx * r, a[1] - ny * r); c.arc(a[0], a[1], r, an + Math.PI, an + 2 * Math.PI, false);
  c.closePath();
}
function fbRRPath(c, x, y, w, h, r) {
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r); c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r); c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r); c.closePath();
}
function fbSmoothClosed(c, P) {
  const n = P.length, m = (i) => [(P[i % n][0] + P[(i + 1) % n][0]) / 2, (P[i % n][1] + P[(i + 1) % n][1]) / 2];
  const s = m(n - 1); c.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const q = m(i); c.quadraticCurveTo(P[i][0], P[i][1], q[0], q[1]); }
  c.closePath();
}
// the door frame's face leans a little (its top away from the forearm): its x at height y, when it stands at xp
const FB_TILT = 0.2;
const fbPostX = (xp, y) => xp + FB_TILT * (y - FBA.HIT[1]);
// the skin with the door frame pressed into it: near the elbow it cannot be left of the frame's face
function fbSkinPts(xp) {
  if (xp === undefined || xp === null) return FB_SKIN;
  return FB_SKIN.map((p) => (p[1] > -110 && p[1] < 100 && p[0] < fbPostX(xp, p[1]) + 5 ? [fbPostX(xp, p[1]) + 5, p[1]] : p));
}
function fbArmPath(c, xp) {
  c.beginPath();
  fbSmoothClosed(c, fbSkinPts(xp));
  fbRRPath(c, -494, -500, 112, 110, 26);
  for (const [a, b, w] of FB_FINGERS) fbCapPath(c, a, b, w);
}
function fbSpindle(c, a, b, wl, wr, k = 1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = dy / L, ny = -dx / L, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  c.beginPath(); c.moveTo(a[0], a[1]);
  c.quadraticCurveTo(mx + nx * wl * 2 * k, my + ny * wl * 2 * k, b[0], b[1]);
  c.quadraticCurveTo(mx - nx * wr * 2 * k, my - ny * wr * 2 * k, a[0], a[1]);
  c.closePath();
}
function fbStroke(c, P, i0, i1, w, col) {
  i0 = Math.max(0, Math.floor(i0)); i1 = Math.min(P.length - 1, Math.ceil(i1));
  if (i1 <= i0) return;
  c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = w; c.strokeStyle = col;
  c.beginPath(); c.moveTo(P[i0][0], P[i0][1]);
  for (let i = i0 + 1; i <= i1; i++) c.lineTo(P[i][0], P[i][1]);
  c.stroke();
}
// his body beside the arm: the hiker himself, tinted like the rest of the picture (his own head, hair and face from the
// rig, 2.3 times the rig's size), a shoulder, a chest with a hint of ribs. face = one of his faces
const FB_XPAL = Object.assign({}, PAL, { skin: '#2C58AC', skinSh: '#1D3F86', skinHi: '#4C7CCC', hair: '#0B1840', hairHi: '#2B4A9A', pupil: '#070D2A', mouth: '#0B1840', tongue: '#5A7FD0', teeth: '#DCE8FF' });
function fbBody(t, face) {
  const c = ctx;
  for (const pass of [0, 1]) {
    c.beginPath();
    fbSmoothClosed(c, [[36, -128], [110, -186], [200, -214], [340, -214], [520, -150], [566, 300], [548, 1000], [84, 1000], [94, 300], [72, 80]]);
    fbRRPath(c, 176, -262, 112, 120, 30);
    if (pass === 0) { c.lineJoin = 'round'; c.lineWidth = 10; c.strokeStyle = '#5E97D8'; c.stroke(); } else { c.fillStyle = '#152C63'; c.fill(); }
  }
  paint(() => {
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(300, -40 + i * 62); c.quadraticCurveTo(190, -70 + i * 62, 130, -8 + i * 62); c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = 'rgba(170,200,255,0.2)'; c.stroke(); }
  });
  c.save(); c.translate(232, -366); c.scale(2.3, 2.3);
  actor(() => {
    drawHead(c, { head: [0, 0], lean: 0 }, face || FACES.calm, { headRot: -0.07, headDY: 1.2 * Math.sin(t * 2.4) }, FB_XPAL, t);
    c.save(); c.rotate(-0.07); for (const sd of [-1, 1]) ellipse(c, sd * 62, 2 + 1.2 * Math.sin(t * 2.4), 7, 11, '#16306E'); c.restore();
  });
  c.restore();
}

// The arm. o: {body, bodyFace, mus: [k, k, k, k] (how much of each muscle is there, 0..1.1), ghost: the nerve showing
// faintly through the muscle, glow: the nerve's light, bare: the bare stretch lit up (0..1), face: null | {mood: 'calm' |
// 'shy' | 'eek' | 'ouch' | 'flat', look: [x, y], sweat}, knob: the bone under it lit (0..1), hum: the whole upper-arm bone
// lit, humFace: 0..1 (it grins), skin: the skin over the nerve lit, post: the door frame's right face (arm x) or null,
// squash: 0..1, pulse: [[s, k]...] beads on the nerve at arclength s, fingers: the little and ring fingers lit (0..1),
// ends: the nerve's ends lit, shake: [dx, dy] added to the whole arm, noHand}
function fbArm(t, o = {}) {
  const N = FB_N, c = ctx, g = gctx, mus = o.mus || [1, 1, 1, 1], sq = o.squash || 0, xp = o.post === undefined ? null : o.post;
  const sh = o.shake || [0, 0];
  for (const cc of [c, g]) { cc.save(); cc.translate(sh[0], sh[1]); }
  if (o.body) fbBody(t, o.bodyFace);
  // ---- the flesh: one outline, one fill
  fbArmPath(c, xp); c.lineJoin = 'round'; c.lineWidth = 10; c.strokeStyle = '#8FD6FF'; c.stroke();
  fbArmPath(c, xp); c.fillStyle = '#1D3C82'; c.fill();
  fbArmPath(g, xp); g.lineWidth = 9; g.strokeStyle = 'rgba(110,190,255,0.22)'; g.stroke();
  // ---- bones
  const BONE = '#EEF3FF', hk = Math.max(o.knob || 0, o.hum || 0);
  if (hk > 0.02) { softDot(g, FBA.KNOB[0] - 14, FBA.KNOB[1], 86, '#BFE6FF', 0.3 * (o.knob || 0)); if (o.hum) { g.lineCap = 'round'; line(g, -20, 4, -400, 16, 56, rgba('#BFE6FF', 0.22 * o.hum)); } }
  c.beginPath(); c.moveTo(-4, -24); c.lineTo(-372, -6); c.lineTo(-372, 36); c.lineTo(-4, 16); c.closePath(); c.fillStyle = BONE; c.fill();
  circle(c, 4, -6, 40, BONE);
  ellipse(c, -426, 18, 48, 45, BONE);
  circle(c, -459, 22, 22, BONE);                                        // the bump the nerve lies on
  c.beginPath(); fbCapPath(c, [-450, -30], [-456, -384], 22); fbCapPath(c, [-404, -40], [-412, -386], 20); c.fillStyle = BONE; c.fill();
  if (!o.noHand) {
    rrect(c, -480, -432, 84, 34, 14); c.fillStyle = BONE; c.fill();
    paint(() => {
      for (const [a, b, w] of FB_FINGERS) {
        const m1 = [lerp(a[0], b[0], 0.34), lerp(a[1], b[1], 0.34)], m2 = [lerp(a[0], b[0], 0.68), lerp(a[1], b[1], 0.68)], e = [lerp(a[0], b[0], 0.96), lerp(a[1], b[1], 0.96)];
        const r0 = w === 32 ? [-420, -420] : [lerp(-438, a[0], 0.55), lerp(-410, a[1], 0.55)];
        line(c, r0[0], r0[1], a[0], a[1], 9, BONE); line(c, a[0], a[1], m1[0], m1[1], 9, BONE); line(c, m1[0], m1[1], m2[0], m2[1], 8, BONE); line(c, m2[0], m2[1], e[0], e[1], 7, BONE);
        for (const p of [a, m1, m2]) circle(c, p[0], p[1], 6.5, BONE);
      }
    });
  }
  if (o.humFace > 0.02) paint(() => {   // the bone has heard its own name
    const k = clamp(o.humFace), bl = 0.5 + 0.5 * Math.sin(t * 2.1) > 0.96 ? 0.1 : 1;
    for (const ex of [-330, -296]) { ellipse(c, ex, 6, 8 * k, 9 * k * bl, '#15132A'); circle(c, ex - 2, 3, 2.6 * k, '#FFFFFF'); }
    c.beginPath(); c.moveTo(-334, 22); c.quadraticCurveTo(-313, 22 + 13 * k, -292, 22); c.lineWidth = 4; c.lineCap = 'round'; c.strokeStyle = '#15132A'; c.stroke();
  });
  // ---- the nerve, under the muscles
  const P = N.main.map((p, i) => {
    if (xp === null || i < N.i0 || i > N.i1) return p;
    return [Math.max(p[0], fbPostX(xp, p[1]) + 18), p[1]];
  });
  const gl = o.glow === undefined ? 0.5 : o.glow, COL = '#FFAA33', DK = '#8A4300';
  fbStroke(c, P, 0, P.length - 1, 17, DK); fbStroke(c, P, 0, P.length - 1, 11, COL);
  for (const b of N.br) { fbStroke(c, b.P, 0, b.P.length - 1, 12, DK); fbStroke(c, b.P, 0, b.P.length - 1, 7, COL); }
  // ---- muscles
  FB_MUS.forEach(([a, b, wl, wr], i) => {
    const k = mus[i];
    if (k <= 0.02) return;
    fbSpindle(c, a, b, wl, wr, k); c.fillStyle = '#D9506F'; c.fill();
    paint(() => {
      c.save(); fbSpindle(c, a, b, wl, wr, k); c.clip();
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = dy / L, ny = -dx / L;
      for (let j = -2; j <= 2; j++) {
        const off = j * 15 + (wl - wr) * 0.5 * k;
        c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2 + nx * off * 2, (a[1] + b[1]) / 2 + ny * off * 2, b[0], b[1]);
        c.lineWidth = 3.5; c.strokeStyle = 'rgba(150,30,70,0.5)'; c.stroke();
      }
      c.restore();
    });
  });
  // the nerve, faint, where it lies under muscle
  const gh = o.ghost === undefined ? 0.4 : o.ghost;
  if (gh > 0.02) paint(() => {
    c.save(); c.setLineDash([14, 12]);
    if (mus[1] > 0.5) fbStroke(c, P, N.iSh + 6, N.i0 - 2, 6, rgba('#FFD08A', 0.55 * gh));
    if (mus[2] > 0.5) fbStroke(c, P, N.i1 + 2, N.iWrist - 6, 6, rgba('#FFD08A', 0.55 * gh));
    c.restore();
  });
  // ---- the bare stretch, on top: fatter, lit, flattened where the door frame has it
  const bare = o.bare || 0;
  for (let i = N.i0; i < N.i1; i++) {
    const p = P[i], q = P[i + 1], d = Math.abs((p[1] + q[1]) / 2 - FBA.HIT[1]), inX = (p[0] + q[0]) / 2 < -470 ? 1 : 0;
    const w = 26 * (1 - 0.66 * sq * inX * clamp(1 - d / 26)) + 13 * sq * inX * clamp(1 - Math.abs(d - 38) / 14);
    line(c, p[0], p[1], q[0], q[1], w + 6, DK);
  }
  for (let i = N.i0; i < N.i1; i++) {
    const p = P[i], q = P[i + 1], d = Math.abs((p[1] + q[1]) / 2 - FBA.HIT[1]), inX = (p[0] + q[0]) / 2 < -470 ? 1 : 0;
    const w = 26 * (1 - 0.66 * sq * inX * clamp(1 - d / 26)) + 13 * sq * inX * clamp(1 - Math.abs(d - 38) / 14);
    line(c, p[0], p[1], q[0], q[1], w, mixH(COL, '#FFE08A', bare));
  }
  fbStroke(g, P, N.i0, N.i1, 28, rgba('#FF9A3C', clamp(0.28 * gl + 0.26 * bare)));
  fbStroke(g, P, 0, N.i0, 16, rgba('#FF9A3C', 0.3 * gl * (mus[1] > 0.5 ? 0.35 : 1)));
  fbStroke(g, P, N.i1, P.length - 1, 16, rgba('#FF9A3C', 0.3 * gl * (mus[2] > 0.5 ? 0.35 : 1)));
  // its face
  if (o.face) paint(() => {
    const F = P[N.iFace], m = o.face.mood || 'calm', lk = o.face.look || [0, 0];
    const big = m === 'eek' || m === 'ouch' ? 1.35 : 1;
    c.save(); c.translate(F[0], F[1] - 1); c.scale(1.5, 1.5);
    if (m === 'shy' || m === 'eek') { ellipse(c, -19, 5, 5, 3, 'rgba(255,90,110,0.7)'); ellipse(c, 19, 5, 5, 3, 'rgba(255,90,110,0.7)'); }
    for (const sx of [-9, 9]) {
      if (m === 'ouch') { line(c, sx - 5, -7, sx + 5, 1, 3.2, '#3A1500'); line(c, sx + 5, -7, sx - 5, 1, 3.2, '#3A1500'); continue; }
      ellipse(c, sx, -3, 6.2 * big, (m === 'flat' ? 3.4 : 6.8) * big, '#FFFFFF');
      circle(c, sx + 2.4 * lk[0], -3 + 2.4 * lk[1], 3 * (m === 'eek' ? 0.7 : 1), '#2A1200');
    }
    c.lineCap = 'round'; c.lineWidth = 2.6; c.strokeStyle = '#3A1500';
    if (m === 'eek' || m === 'ouch') ellipse(c, 0, 8, 4, 4.5, '#3A1500');
    else { c.beginPath(); c.moveTo(-5, 8); c.quadraticCurveTo(0, m === 'shy' ? 5 : 11, 5, 8); c.stroke(); }
    c.restore();
    if (o.face.sweat > 0.02) sweatDrop(c, F[0] + 44, F[1] - 34 + 18 * ((t * 1.3) % 1), 0.62, o.face.sweat * (1 - ((t * 1.3) % 1)));
  });
  // ---- the skin over the bare stretch, lit: this is all there is on top of it
  if (o.skin > 0.02) {
    const S2 = fbSkinPts(xp).slice(5, 11);
    for (const [cc, w, col] of [[c, 7, rgba('#DFF6FF', 0.95 * o.skin)], [g, 11, rgba('#9FE4FF', 0.2 * o.skin)]]) { cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.lineWidth = w; cc.strokeStyle = col; smoothPath(cc, S2); cc.stroke(); }
  }
  // ---- the little finger and the ring finger, lit; the nerve's ends
  const fg = o.fingers || 0;
  if (fg > 0.02) {
    const jit = 2.5 * fg * Math.sin(t * 61);
    c.save(); c.globalAlpha = clamp(0.78 * fg);
    c.beginPath(); fbCapPath(c, [FB_FINGERS[0][0][0] + jit, FB_FINGERS[0][0][1]], [FB_FINGERS[0][1][0] + jit, FB_FINGERS[0][1][1]], 26);
    c.fillStyle = '#FFB13C'; c.fill();
    c.save(); c.beginPath(); c.rect(-520, -640, 61, 260); c.clip();          // the outer half of the ring finger
    c.beginPath(); fbCapPath(c, FB_FINGERS[1][0], FB_FINGERS[1][1], 28); c.fill(); c.restore();
    c.restore();
    for (const b of N.br) { fbStroke(c, b.P, 0, b.P.length - 1, 9, '#FFF2B8'); fbStroke(g, b.P, 0, b.P.length - 1, 30, rgba('#FF9A3C', 0.8 * fg)); }
    softDot(g, -486, -548, 110, '#FFB13C', 0.75 * fg);
    const rng = mulberry32(40 + Math.floor(t * 15));
    for (let i = 0; i < 6; i++) {   // the tingle
      const an = -2.9 + i * 0.36 + (rng() - 0.5) * 0.2, r0 = 62, r1 = r0 + (26 + rng() * 34) * fg, cx = -488, cy = -548;
      const J = jagged(rng, cx + Math.cos(an) * r0, cy + Math.sin(an) * r0, cx + Math.cos(an) * r1, cy + Math.sin(an) * r1, 16, 2);
      poly(c, J, 4.5, rgba('#FFF2B8', 0.95 * fg)); poly(g, J, 10, rgba('#FFB13C', 0.6 * fg));
    }
  }
  const en = o.ends || 0;
  if (en > 0.02) for (const tip of [FBA.PINKY, FBA.RING]) {
    for (let i = -2; i <= 2; i++) line(c, tip[0], tip[1], tip[0] + i * 5.5, tip[1] - 13 * en, 3, '#FFF2B8');
    softDot(g, tip[0], tip[1] - 6, 44, '#FFD447', 0.9 * en * (0.7 + 0.3 * Math.sin(t * 14)));
  }
  // ---- the zap on its way: beads of light on the nerve
  for (const [s, k] of o.pulse || []) {
    if (k <= 0.02) continue;
    let pt;
    if (s <= N.L) pt = [polyAt(P, N.acc, s)];
    else pt = N.br.map((b) => polyAt(b.P, b.acc, s - N.L));
    for (const q of pt) {
      circle(c, q[0], q[1], 13 * k, '#FFFDF0'); softDot(g, q[0], q[1], 90, '#FFC24A', 0.95 * k);
      const rng = mulberry32(7 + Math.floor(t * 30));
      for (let i = 0; i < 3; i++) { const an = rng() * 6.283, J = jagged(rng, q[0], q[1], q[0] + Math.cos(an) * 46, q[1] + Math.sin(an) * 46, 18, 2); poly(c, J, 3.5, rgba('#FFF6C4', 0.9 * k)); poly(g, J, 8, rgba('#FFB13C', 0.6 * k)); }
    }
  }
  // ---- the door frame, pressed into the elbow
  if (xp !== null) {
    c.save(); c.translate(xp, FBA.HIT[1]); c.rotate(-Math.atan(FB_TILT));
    c.fillStyle = '#EDE6D6'; c.fillRect(-620, -1500, 620, 3000);
    c.fillStyle = '#A99C88'; c.fillRect(-18, -1500, 18, 3000);
    paint(() => { for (const x0 of [-44, -150, -174]) line(c, x0, -1500, x0, 1500, 5, '#CFC6B2'); });
    c.restore();
  }
  for (const cc of [c, g]) cc.restore();
}
// the elbow in a round window (world units, camera applied): the same arm, small. R = the window's radius, s = pixels to
// an arm unit, k = how far it has opened (0..1)
function fbWindow(x, y, R, s, k, t, o = {}) {
  if (k <= 0.01) return;
  const r = R * E.outBack(clamp(k), 1.7);
  for (const cc of [ctx, gctx]) { cc.save(); cc.beginPath(); cc.arc(x, y, r, 0, 7); cc.clip(); }
  ctx.fillStyle = '#0B1638'; ctx.fillRect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4);
  gctx.fillStyle = '#000000'; gctx.fillRect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4);
  armOn(armView(o.focus || FBA.ELB, [x, y], s), () => fbArm(t, Object.assign({ mus: [1, 1, 1, 1], ghost: 0.5, noHand: true }, o)));
  ctx.restore(); gctx.restore();
  for (const [cc, w, col] of [[ctx, 0.11 * R, '#EAF6FF'], [gctx, 0.2 * R, 'rgba(120,200,255,0.55)']]) { cc.beginPath(); cc.arc(x, y, r, 0, 7); cc.lineWidth = w; cc.strokeStyle = col; cc.stroke(); }
}
