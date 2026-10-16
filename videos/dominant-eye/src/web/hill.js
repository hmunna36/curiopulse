// A hilltop at night under a full moon, and the hero on it, close, from the front (dominant-eye, 16 Oct 2026).
// - initHill() paints the sky once (gradient, stars, two ranges of far hills, a village with warm windows) into a
//   canvas that hlSky() draws with a little parallax; hlMoon() draws the moon every frame, into the glow layer too;
//   hlStars() twinkles a few bright stars on clocks that loop with the Short; hlFire() is the warm glow of a campfire
//   off-screen at the lower right (it motivates the warm rim on him).
// - hlHero(cam, t, A): the hiker in his yellow coat, from a description: arms by elbow and wrist given as WORLD points
//   (A.armL / A.armR = {e, w}; his right arm is the rig's L, on screen-left), A.handL / A.handR ('point' = the index
//   finger out), the face, and the props on his face in head units (A.crown, A.badge, A.flip): a little gold crown over
//   his right eye (the boss) and an INTERN lanyard badge clipped to his left eyebrow.
// - hlTag(txt, x, y, col, k, to): a pill label on a thin dashed leader (screen space).
'use strict';

let HL_SKY = null;
const HL = { HX: 620, HY: 2405, HS: 3.0 };   // the hero's place in the hook: his head ~420 px tall, its middle at y ~1000
const HL_SW = 1400, HL_SH = 2300;           // the painted sky: larger than the frame, so the camera can drift and push
const HL_MOON = [175, 560];                  // where the moon sits on screen in the front shots (clear of the watermark)

function initHill() {
  HL_SKY = mkCanvas(HL_SW, HL_SH);
  const c = HL_SKY.getContext('2d'), rng = mulberry32(1607);
  const g = c.createLinearGradient(0, 0, 0, HL_SH);
  g.addColorStop(0, '#03051A'); g.addColorStop(0.38, '#0A1235'); g.addColorStop(0.58, '#16205033');
  g.addColorStop(0.58, '#16214F'); g.addColorStop(0.66, '#25306A'); g.addColorStop(0.71, '#1A2152'); g.addColorStop(1, '#070A1D');
  c.fillStyle = g; c.fillRect(0, 0, HL_SW, HL_SH);
  // a faint band of the Milky Way, corner to corner
  c.save(); c.translate(HL_SW * 0.62, HL_SH * 0.3); c.rotate(-0.95);
  for (let i = 0; i < 70; i++) {
    const x = (rng() - 0.5) * 1800, y = (rng() - 0.5) * 200 * (1 - Math.abs(x) / 1100);
    softDot(c, x, y, 60 + rng() * 90, '#6F7FD8', 0.035);
  }
  c.restore();
  // stars
  for (let i = 0; i < 420; i++) {
    const x = rng() * HL_SW, y = rng() * HL_SH * 0.66, r = 0.7 + rng() * rng() * 2.4;
    circle(c, x, y, r, `rgba(225,232,255,${0.25 + rng() * 0.65})`);
  }
  // the far range, pale with distance, and a village in its fold
  const far = (y0, amp, seed, col) => {
    const r2 = mulberry32(seed);
    const ph = [r2() * 6, r2() * 6, r2() * 6];
    c.beginPath(); c.moveTo(0, HL_SH);
    for (let x = 0; x <= HL_SW; x += 10) {
      const y = y0 - amp * (0.55 * Math.sin(x / 260 + ph[0]) + 0.3 * Math.sin(x / 113 + ph[1]) + 0.15 * Math.sin(x / 47 + ph[2]));
      c.lineTo(x, y);
    }
    c.lineTo(HL_SW, HL_SH); c.closePath(); c.fillStyle = col; c.fill();
  };
  far(1540, 70, 11, '#1B2556');
  for (let i = 0; i < 46; i++) {   // the village's windows
    const x = 820 + rng() * 380 + (rng() < 0.3 ? -520 : 0), y = 1555 + rng() * 40;
    circle(c, x, y, 1.6 + rng() * 1.8, rng() < 0.75 ? 'rgba(255,196,110,0.85)' : 'rgba(255,240,200,0.8)');
  }
  far(1610, 60, 23, '#111A40');
  far(1700, 40, 37, '#0A1130');
}
// the sky, painted once: the camera moves it a little (parallax p), and a push zooms it a quarter as much
function hlSky(cam, p = 0.18) {
  screenSpace();
  const z = 1 + ((cam.zoom || 1) - 1) * 0.25;
  const ox = ((cam.x || 540) - 540) * p, oy = ((cam.y || 960) - 960) * p;
  const w = HL_SW * z, h = HL_SH * z;
  ctx.drawImage(HL_SKY, 540 - w / 2 - ox, 960 - h / 2 - oy - 40, w, h);
}
// a few bright stars that twinkle (screen space); they keep their places at the loop
function hlStars(t, a = 1, avoid) {
  const rng = mulberry32(77);
  for (let i = 0; i < 16; i++) {
    const x = 60 + rng() * 960, y = 380 + rng() * 620, ph = rng() * 6, w = loopW(1.5 + rng() * 2.2);
    if (avoid && Math.hypot(x - avoid[0], y - avoid[1]) < avoid[2]) continue;
    const k = 0.55 + 0.45 * Math.sin(t * w + ph);
    const r = (1.6 + rng() * 2.2) * (0.7 + 0.5 * k);
    circle(ctx, x, y, r, `rgba(235,240,255,${0.5 * a * k})`);
    softDot(gctx, x, y, r * 4, '#BFD2FF', 0.35 * a * k);
  }
}
// the moon: a disc with soft maria and craters, a cold halo in the glow layer (screen space)
function hlMoon(x, y, r, t, o = {}) {
  screenSpace();
  softDot(gctx, x, y, r * 4.2, '#9FB8FF', 0.26 * (o.glow === undefined ? 1 : o.glow));
  softDot(gctx, x, y, r * 1.8, '#E9F0FF', 0.3 * (o.glow === undefined ? 1 : o.glow));
  circle(ctx, x, y, r, '#F4F0DA');
  paint(() => {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    ellipse(ctx, x - r * 0.28, y - r * 0.18, r * 0.34, r * 0.26, 'rgba(176,170,140,0.45)', 0.4);
    ellipse(ctx, x + r * 0.22, y + r * 0.08, r * 0.26, r * 0.32, 'rgba(176,170,140,0.38)', -0.3);
    ellipse(ctx, x - r * 0.05, y + r * 0.42, r * 0.2, r * 0.14, 'rgba(176,170,140,0.32)');
    for (const [dx, dy, rr] of [[0.45, -0.38, 0.09], [-0.52, 0.3, 0.07], [0.12, -0.62, 0.06], [0.58, 0.42, 0.06]]) {
      circle(ctx, x + dx * r, y + dy * r, rr * r, 'rgba(160,152,120,0.5)');
    }
    ctx.restore();
  });
  circle(gctx, x, y, r * 0.98, 'rgba(255,252,236,0.4)');
}
// the warm glow of a campfire off-screen at the lower right (k 0..1), flickering on a looping clock
function hlFire(t, k = 1) {
  screenSpace();
  const fl = 0.85 + 0.15 * Math.sin(t * loopW(11)) * Math.sin(t * loopW(7.3) + 1);
  softDot(gctx, 1120, 1960, 760, '#FF8A3A', 0.42 * k * fl);
  softDot(gctx, 1080, 1900, 300, '#FFC27A', 0.35 * k * fl);
}
// the whole set for a front shot: sky, stars, moon (the moon may be moved or left out)
function hlSet(cam, t, o = {}) {
  hlSky(cam, o.parallax === undefined ? 0.18 : o.parallax);
  const m = o.moon === undefined ? [HL_MOON[0] - ((cam.x || 540) - 540) * 0.1, HL_MOON[1] - ((cam.y || 960) - 960) * 0.1, 62] : o.moon;
  hlStars(t, 1, m ? [m[0], m[1], m[2] * 2.2] : null);
  if (m) hlMoon(m[0], m[1], m[2], t, o);
  hlFire(t, o.fire === undefined ? 1 : o.fire);
  return m;
}

// ---------------------------------------------------------------- the hero, from the front
const HLPAL = Object.assign({}, PAL);
// arm targets, in rig-local units (elbow e, wrist w); his right arm is 'L' (screen-left)
const HL_ARM = {
  restL: { e: [-104, -272], w: [-114, -184] }, restR: { e: [104, -272], w: [114, -184] },
  shrugL: { e: [-150, -300], w: [-196, -362] }, shrugR: { e: [150, -300], w: [196, -362] },
};
// A: {x, y, s, face, armL, armR ({e, w} rig-local, or {E, Wr} WORLD points), handL, handR, headDX, headDY, headRot, lean,
//     crown (0..1 pop), crownGlint, badge (0..1 pop), flip (0..1 the badge turned over), badgeBack (text), swing, nervous}
function hlHero(cam, t, A) {
  const st = { x: A.x === undefined ? HL.HX : A.x, y: A.y === undefined ? HL.HY : A.y, s: A.s || HL.HS };
  const armOf = (a, dflt) => {
    const q = a || dflt;
    if (q.E) return { e: ikLocal(st, q.E[0], q.E[1]), w: ikLocal(st, q.Wr[0], q.Wr[1]) };
    return q;
  };
  let pose = Object.assign({}, POSES.stand, { lean: A.lean || 0, hand: 'open', handL: A.handL, handR: A.handR });
  const aL = armOf(A.armL, HL_ARM.restL), aR = armOf(A.armR, HL_ARM.restR);
  pose = armAt(pose, 'L', aL.e, aL.w);
  pose = armAt(pose, 'R', aR.e, aR.w);
  Object.assign(st, { pose, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: true });
  const r = charLayer(cam, st, t, { pal: A.pal || HLPAL, post: (lc, rr) => {
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    lc.translate(rr.head[0] + st.headDX, rr.head[1] + st.headDY); lc.rotate(rr.lean + st.headRot);
    if ((A.crown || 0) > 0.01) hlCrown(lc, -26, -40, 1, A.crown, t, A.crownGlint || 0);
    if ((A.badge || 0) > 0.01) hlBadge(lc, 37, -33, 1, A.badge, t, A);
    lc.restore();
    if (A.post) A.post(lc, rr, st);
  } });
  const wp = (p) => toWorld(st, p);
  const hp = (p) => {   // a point in head units -> world
    const c0 = Math.cos(r.lean + st.headRot), s0 = Math.sin(r.lean + st.headRot);
    return wp([r.head[0] + st.headDX + p[0] * c0 - p[1] * s0, r.head[1] + st.headDY + p[0] * s0 + p[1] * c0]);
  };
  const dL = r.armDirL, tipL = [r.wrL[0] + dL[0] * 70, r.wrL[1] + dL[1] * 70];
  return { st, r, head: hp([0, 0]), eyeR: hp([-24, -2]), eyeL: hp([24, -2]), crownAt: hp([-26, -60]), badgeAt: hp([46, 14]),
    tipL: wp(tipL), wrL: wp(r.wrL), wrR: wp(r.wrR), shL: wp(r.shL), hp };
}
// a little gold crown sitting on his right brow (head units; k = its pop)
function hlCrown(c, x, y, s, k, t, glint = 0) {
  const q = E.outBack(clamp(k), 2.4);
  c.save(); c.translate(x, y + (1 - clamp(k * 1.4)) * -26); c.scale(s * q, s * q); c.rotate(-0.16);
  c.beginPath(); c.moveTo(-19, 2); c.lineTo(-22, -20); c.lineTo(-10, -10); c.lineTo(0, -26); c.lineTo(10, -10); c.lineTo(22, -20); c.lineTo(19, 2); c.closePath();
  c.fillStyle = '#FFC531'; c.fill();
  paint(() => {
    c.fillStyle = '#E39A12'; c.fillRect(-19, -4, 38, 6);
    circle(c, 0, -2, 3.2, '#FF3F6C'); circle(c, -11, -1, 2.2, '#3FD6FF'); circle(c, 11, -1, 2.2, '#3FD6FF');
    for (const [px, py] of [[-22, -20], [0, -26], [22, -20]]) circle(c, px, py, 2.8, '#FFF1B8');
    line(c, -14, -12, -9, -18, 1.8, 'rgba(255,250,220,0.9)');
  });
  c.restore();
  if (glint > 0.01) {   // a star-shaped glint on the crown's tip, in the glow layer of the hero's layer is not available: drawn as paint
    const a = clamp(glint), r0 = 12 * a;
    paint(() => {
      c.save(); c.translate(x + 4, y - 30); c.rotate(t * 2);
      c.fillStyle = `rgba(255,255,235,${a})`;
      c.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r0 * 0.25 : r0; const an = (i / 8) * Math.PI * 2; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill();
      c.restore();
    });
  }
}
// an INTERN lanyard badge clipped to his left eyebrow, hanging beside the eye (head units; k = its pop)
function hlBadge(c, x, y, s, k, t, A) {
  const q = E.outBack(clamp(k), 2.2);
  const sw = (A.swing === undefined ? 0.22 : A.swing) * Math.sin(t * 7.5) * Math.exp(-2.2 * Math.max(0, t - (A.badgeT || 0))) + (A.nervous || 0) * 0.08 * Math.sin(t * 31);
  c.save(); c.translate(x, y); c.scale(s * q, s * q); c.rotate(-0.15 + sw);
  // the clip on the brow, and the cord
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, 16, 10, 38); c.lineWidth = 2.6; c.strokeStyle = '#2E5BFF'; c.lineCap = 'round'; c.stroke();
  rrect(c, -3.5, -3, 7, 7, 1.5); c.fillStyle = '#C9CED8'; c.fill();
  // the card (it can turn over: flip 0..1)
  const fl = clamp(A.flip || 0), sx = Math.cos(Math.PI * fl);
  c.translate(10, 52); c.scale(Math.max(0.06, Math.abs(sx)), 1);
  rrect(c, -13, -15, 26, 31, 3); c.fillStyle = '#FFFFFF'; c.fill();
  paint(() => {
    if (sx >= 0) {   // the front: a blue header, INTERN, a photo square and two lines
      c.fillStyle = '#2E5BFF'; c.fillRect(-13, -15, 26, 8);
      c.font = '900 5.6px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF';
      c.fillText('INTERN', 0, -10.8);
      c.fillStyle = '#FFD7B8'; c.fillRect(-9, -4, 8, 9); circle(c, -5, -1, 2.2, '#2A1B14');
      line(c, 2, -2, 9, -2, 1.6, '#9AA3B8'); line(c, 2, 2, 8, 2, 1.6, '#9AA3B8'); line(c, -9, 10, 9, 10, 1.6, '#C9CED8');
    } else {         // the back: the job
      c.fillStyle = '#4DFFB4'; c.fillRect(-13, -15, 26, 8);
      c.font = '900 5.2px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#0B2A20';
      c.fillText('JOB:', 0, -10.8);
      c.fillStyle = '#12182E'; c.font = '900 6.4px Montserrat';
      for (const [i, ln] of (A.badgeBack || ['DEPTH']).entries()) c.fillText(ln, 0, -1 + i * 8);
    }
  });
  c.restore();
}
// a pill label on a thin dashed leader (screen space); k 0..1
function hlTag(txt, x, y, col, k, to, size = 46) {
  if (k <= 0.01) return;
  if (to) thinLeader([x, y], [to[0], to[1]], k, col);
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.95, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(8,10,28,0.92)'; ctx.fill();
  paint(() => { ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); ctx.fillStyle = col; ctx.fillText(txt, 0, size * 0.06); });
  ctx.restore();
}
