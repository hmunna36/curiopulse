// What If the Sun VANISHED Right Now? ☀️ — the hiker on the beach: a coral beach shirt (sleeves rolled), teal swim
// shorts, bare legs and feet, sunglasses, sitting low in the striped deck chair with a tall glass of lemonade.
// svHero(cam, t, A) draws him from a description, lit, on his own layer:
//   A = {x, y, s, face, headRot, headDX, headDY, N (night: a navy wash over him), sip 0..1 (the glass at his mouth, the
//        straw in it) | glass: {e, w} (where his right arm holds it instead), relax 0..1 (left hand behind his head),
//        shades 0..1 (on), shadesUp 0..1 (pushed up onto his forehead), shadesDown 0..1 (slid down his nose: a squint over
//        them), liftL 0..1 (his left hand up at the shades), level 0..1 (lemonade left), ripple, clink, bob}
// Rig-local units: his feet on y = 0; the sit pose has the pelvis at y -34 (a low beach chair, knees up).
'use strict';

const SVPAL = Object.assign({}, PAL, {
  coat: '#FF7A5C', coatSh: '#D9533A', coatHi: '#FFB09A', coatDk: '#B8432E', pj: true, shortSleeve: true,
  pants: '#1CB3A4', pantsSh: '#117F74',
});
const SV_SIT = Object.assign({}, POSES.sit, { lean: -0.03 });
// his right arm: the glass at his lips (sip), lowered to rest on the chair's arm (rest); his left: on his belly, or
// behind his head (relax), or up at his sunglasses (lift)
const SV_SIP = { e: [132, -104], w: [66, -142] };
const SV_REST = { e: [132, -96], w: [150, -40] };
const SV_LBELLY = { e: [-112, -100], w: [-40, -84] };
const SV_LHEAD = { e: [-150, -330], w: [-58, -300] };
const SV_LMID = { e: [-150, -210], w: [-150, -300] };
const SV_LLIFT = { e: [-128, -190], w: [-66, -262] };

// the glass of lemonade (rig units), its base at (x, y): o = {level 0..1, rot, straw: [x, y] (the straw's tip, rig units;
// null = standing in the glass), ripple, clink, N}
function svGlass(c, x, y, o = {}) {
  const N = o.N || 0, h = 112, wt = 30, wb = 24, rot = o.rot || 0;
  c.save(); c.translate(x, y); c.rotate(rot);
  // the straw first (it is inside the glass, behind its front)
  const tip = o.straw ? [o.straw[0] - x, o.straw[1] - y] : [22, -h - 54];
  const foot = [-4, -26];
  const pts = [foot, [lerp(foot[0], tip[0], 0.72), -h + 4], tip];
  paint(() => {
    c.lineCap = 'round';
    c.lineWidth = 9; c.strokeStyle = mixH('#FFFFFF', '#5A6080', N); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.lineTo(pts[2][0], pts[2][1]); c.stroke();
    c.setLineDash([9, 9]); c.lineWidth = 9; c.strokeStyle = mixH('#F0424C', '#3A2236', N); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.lineTo(pts[2][0], pts[2][1]); c.stroke(); c.setLineDash([]);
  });
  // the glass: a tall tumbler; the lemonade inside stays level when the glass tips (rot)
  c.beginPath(); c.moveTo(-wt, -h); c.lineTo(wt, -h); c.lineTo(wb, 0); c.quadraticCurveTo(0, 6, -wb, 0); c.closePath();
  c.fillStyle = mixH('#DDF4FF', '#1C2440', N); c.fill();
  const lv = o.level === undefined ? 0.78 : o.level, ly = -h * lv + 4;
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(-wt + 3, -h + 2); c.lineTo(wt - 3, -h + 2); c.lineTo(wb - 3, -3); c.quadraticCurveTo(0, 3, -wb + 3, -3); c.closePath(); c.clip();
    c.rotate(-rot);
    const g = c.createLinearGradient(0, ly, 0, 20); g.addColorStop(0, mixH('#FFF09A', '#3A3A2A', N)); g.addColorStop(1, mixH('#FFD84A', '#2E2E22', N));
    const rp = (o.ripple || 0) * Math.sin((o.ripT || 0) * 40) * 4;
    c.fillStyle = g; c.beginPath(); c.moveTo(-80, ly + rp); c.lineTo(80, ly - rp); c.lineTo(80, 40); c.lineTo(-80, 40); c.closePath(); c.fill();
    c.fillStyle = rgba(N > 0.5 ? '#8890B0' : '#FFFFFF', 0.55); c.fillRect(-60, ly - 2 + rp, 120, 4);
    // ice cubes and bubbles
    const ck = o.clink || 0;
    for (const [ix, iy, r0] of [[-10, ly + 14, 0.3], [11, ly + 24 + 6 * ck, -0.4], [-4, ly + 44, 0.8]]) {
      c.save(); c.translate(ix, iy); c.rotate(r0 + 0.3 * ck); rrect(c, -11, -11, 22, 22, 4); c.fillStyle = rgba(N > 0.5 ? '#7A86A8' : '#FFFFFF', 0.6); c.fill(); c.restore();
    }
    for (let i = 0; i < 7; i++) { const by = ((i * 23 + (o.bubT || 0) * 60) % 90); circle(c, -18 + i * 6, -by - 8, 2.2, rgba('#FFFFFF', 0.6 * (1 - N))); }
    c.restore();
    // the glass's shine and rim
    c.fillStyle = rgba('#FFFFFF', N > 0.5 ? 0.12 : 0.5); c.beginPath(); c.moveTo(-wt + 7, -h + 8); c.lineTo(-wt + 15, -h + 8); c.lineTo(-wb + 12, -10); c.lineTo(-wb + 6, -10); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(0, -h, wt, 6, 0, 0, 7); c.lineWidth = 3; c.strokeStyle = rgba('#FFFFFF', N > 0.5 ? 0.25 : 0.8); c.stroke();
    // condensation drops
    for (const [dx, dy] of [[12, -60], [-16, -40], [18, -24], [4, -86]]) ellipse(c, dx, dy, 2.6, 3.4, rgba('#FFFFFF', N > 0.5 ? 0.15 : 0.6));
  });
  // a lemon slice on the rim
  c.save(); c.translate(wt - 4, -h + 2); c.rotate(-0.5);
  c.beginPath(); c.arc(0, 0, 20, Math.PI, 0); c.closePath(); c.fillStyle = mixH('#FFE14A', '#3A3A22', N); c.fill();
  paint(() => { c.beginPath(); c.arc(0, 0, 15, Math.PI, 0); c.closePath(); c.fillStyle = mixH('#FFF6B8', '#45452E', N); c.fill(); for (let i = 1; i < 6; i++) { const a = Math.PI + (i / 6) * Math.PI; line(c, 0, 0, Math.cos(a) * 14, Math.sin(a) * 14, 2, mixH('#FFE14A', '#3A3A22', N)); } });
  c.restore();
  c.restore();
}

// sunglasses in head space: up 0..1 = pushed up onto his forehead; down 0..1 = slid down his nose; N = night
function svShades(c, up = 0, down = 0, N = 0, sunGlint = 1) {
  c.save(); c.translate(0, -2 - 78 * up + 38 * down); c.rotate(-0.04 * up + 0.05 * down);
  paint(() => {
    const fr = mixH('#15122A', '#05060E', N);
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 8, -22); c.lineTo(sd * 60, -24); c.quadraticCurveTo(sd * 64, 18, sd * 40, 22); c.quadraticCurveTo(sd * 14, 22, sd * 8, -2); c.closePath();
      c.fillStyle = fr; c.fill();
    }
    line(c, -10, -16, 10, -16, 8, fr);
    for (const sd of [-1, 1]) line(c, sd * 60, -20, sd * 66, -14, 7, fr);
    if (N < 0.5) {
      for (const sd of [-1, 1]) {                                  // the sky in the lenses, and a glint
        const g = c.createLinearGradient(0, -20, 0, 20); g.addColorStop(0, 'rgba(120,180,255,0.35)'); g.addColorStop(1, 'rgba(255,190,120,0.18)');
        c.fillStyle = g; c.beginPath(); c.moveTo(sd * 12, -18); c.lineTo(sd * 56, -20); c.quadraticCurveTo(sd * 58, 14, sd * 38, 17); c.quadraticCurveTo(sd * 16, 17, sd * 12, 0); c.closePath(); c.fill();
        line(c, sd * 22, -12, sd * 30, -2, 4, 'rgba(255,255,255,0.75)');
        if (sunGlint > 0.01) { circle(c, sd * 44, -10, 4.5 * sunGlint, 'rgba(255,250,220,0.95)'); }
      }
    } else {
      for (const sd of [-1, 1]) line(c, sd * 22, -12, sd * 28, -4, 3, 'rgba(180,200,255,0.4)');
    }
  });
  c.restore();
}

function svHeadSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
function svRigSpace(c, st, fn) { c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); fn(c); c.restore(); }

// his legs, under him on his layer: shorts on the thighs (knees up, toward us), bare shins down to bare feet
function svLegs(c, st, r, N) {
  svRigSpace(c, st, (q) => {
    const sk = mixH(SVPAL.skin, '#2A2C4A', N * 0.0), sh = SVPAL.pantsSh;
    for (const k of ['L', 'R']) {
      const hip = r['hip' + k], kn = r['kn' + k], an = r['an' + k];
      line(q, kn[0], kn[1], an[0], an[1], 40, sk);                      // the shin
      ellipse(q, an[0] + (k === 'L' ? -6 : 6), an[1] + 8, 30, 15, sk);  // the bare foot
      for (let i = -2; i <= 2; i++) circle(q, an[0] + (k === 'L' ? -6 : 6) + i * 9, an[1] + 18, 5, sk);
      line(q, hip[0], hip[1], kn[0], kn[1], 54, SVPAL.pants);            // the thigh in shorts
      void sh;
    }
  });
}

// the hero; returns {st, r, pose, wp (rig -> world), mouth (world)}
function svHero(cam, t, A = {}) {
  const N = A.N || 0;
  const st = { x: A.x === undefined ? SB.hero[0] : A.x, y: A.y === undefined ? SB.hero[1] : A.y, s: A.s || 1,
    face: A.face || FACES.calm, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: (A.headDY || 0) + (A.bob || 0), noLegs: true };
  let pose = JSON.parse(JSON.stringify(SV_SIT));
  pose.hipY += (A.bob || 0) * 0.5;
  // right arm: the glass at his lips (sip) or resting; or given
  const gR = A.glass || armMix(SV_REST, SV_SIP, clamp(A.sip || 0));
  pose = armAt(pose, 'R', gR.e, gR.w);
  // left arm: belly -> behind the head (relax) -> up at the sunglasses (lift)
  // belly -> (the elbow up first) -> behind his head
  const rk = clamp(A.relax || 0);
  let gL = rk < 0.5 ? armMix(SV_LBELLY, SV_LMID, smooth(rk * 2)) : armMix(SV_LMID, SV_LHEAD, smooth(rk * 2 - 1));
  if ((A.liftL || 0) > 0.001) gL = armMix(gL, SV_LLIFT, clamp(A.liftL));
  pose = armAt(pose, 'L', gL.e, gL.w);
  pose.hand = 'open';
  const r0 = rig(pose);
  const head = [r0.head[0] + st.headDX, r0.head[1] + st.headDY];
  const mouthL = [head[0] + 2, head[1] + 46];
  const lr = charLayer(cam, Object.assign({}, st, { pose }), t, { pal: SVPAL, ambient: N > 0.5 ? 0.62 : (A.ambient || 0),
    pre: (lc) => svLegs(lc, st, r0, N),
    post: (lc, r) => {
      svHeadSpace(lc, r, st, (c) => {
        if ((A.shades === undefined ? 1 : A.shades) > 0.01) svShades(c, A.shadesUp || 0, A.shadesDown || 0, N, A.glint === undefined ? 1 : A.glint);
      });
      // the glass in his right hand, drawn over his chin with the hand round it
      svRigSpace(lc, st, (c) => {
        const w = r.wrR, d = r.armDirR;
        const hx = w[0] + d[0] * 14, hy = w[1] + d[1] * 14;
        const sip = clamp(A.sip || 0);
        const gx = hx - 22, gy = hy + 52;
        const strawTip = sip > 0.5 ? [lerp(gx + 22, mouthL[0], 1), mouthL[1]] : null;
        svGlass(c, gx, gy, { level: A.level, rot: A.glassRot || (sip > 0.5 ? -0.08 : 0.04), straw: strawTip && sip > 0.85 ? strawTip : (sip > 0.5 ? [lerp(gx + 22, mouthL[0], sip), lerp(gy - 166, mouthL[1], sip)] : null),
          ripple: A.ripple || 0, ripT: t, clink: A.clink || 0, bubT: t, N });
        // fingers wrapped round the glass
        circle(c, hx - 4, hy + 4, 20, SVPAL.skin);
        for (let i = 0; i < 3; i++) ellipse(c, hx - 26, hy - 8 + i * 15, 10, 7.5, SVPAL.skin);
        paint(() => { for (let i = 0; i < 3; i++) line(c, hx - 34, hy - 8 + i * 15, hx - 20, hy - 8 + i * 15, 2, rgba(SVPAL.skinSh, 0.8)); });
        if ((A.liftL || 0) > 0.3) {                                  // his left fingers at the shades' frame
          const wl = r.wrL, dl = r.armDirL, lx = wl[0] + dl[0] * 14, ly = wl[1] + dl[1] * 14;
          circle(c, lx, ly, 20, SVPAL.skin); ellipse(c, lx + 12, ly - 16, 9, 7, SVPAL.skin);
        }
      });
      if (A.post) A.post(lc, r, st, pose);
    } });
  const wp = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  return { st, r: lr, pose, wp, head: wp(head), mouth: wp(mouthL) };
}

// his faces (FACES keys): sip (lips round the straw), aah (pleased, eyes shut behind the shades), smug, deadpan, wide,
// squint (suspicious over the top of the shades), read (brows up)
const SVF = {
  sip: { eyeOpen: 1, pupil: 1, lookX: 0.2, lookY: 0.2, browY: 0.5, browTilt: -0.2, mouth: 'o', mouthOpen: 0.35, blink: 0.5, cross: 0 },
  aah: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.75, blink: 1, cross: 0 },
  smug: { eyeOpen: 0.9, pupil: 1, lookX: 0.2, lookY: 0, browY: 0.6, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.4, blink: 0.4, cross: 0 },
  deadpan: { eyeOpen: 0.8, pupil: 1, lookX: 0, lookY: 0, browY: 0.1, browTilt: 0, mouth: 'flat', mouthOpen: 0.1, blink: 0.35, cross: 0 },
  wide: { eyeOpen: 1.35, pupil: 0.65, lookX: 0, lookY: -0.3, browY: 1.45, browTilt: 0.3, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  read: { eyeOpen: 1.25, pupil: 0.85, lookX: 0.1, lookY: 0.5, browY: 1.3, browTilt: 0.4, mouth: 'o', mouthOpen: 0.35, blink: 0, cross: 0 },
  squint: { eyeOpen: 0.55, pupil: 1, lookX: 0.75, lookY: -0.85, browY: -0.1, browTilt: -0.9, mouth: 'flat', mouthOpen: 0.15, blink: 0.25, cross: 0 },
  up: { eyeOpen: 1.2, pupil: 0.9, lookX: 0.4, lookY: -0.9, browY: 1.2, browTilt: 0.4, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
};
const svFace = (keys, t) => {   // keys: [[t, face], ...] -> the face at t, blended over 0.14 s after each key
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) f = lerpFace(f, keys[i][1], smooth(inv(keys[i][0], keys[i][0] + 0.14, t)));
  return f;
};

// a round portrait of him in the sun (screen space): k pops it in; the frame's ring in gold
function svPortrait(x, y, Rr, t, k, A = {}) {
  if (k <= 0.01) return;
  const r = Rr * E.outBack(clamp(k), 1.8), s = r / 150;
  screenSpace();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#2A78D2'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#4A95E4'); g.addColorStop(0.55, '#BDE7FF'); g.addColorStop(0.56, '#3FB0C8'); g.addColorStop(1, '#2D7FB9');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  softDot(ctx, x + r * 0.6, y - r * 0.6, r * 0.7, '#FFF6D8', 0.8);
  paint(() => {
    const st = { x: x + 6 * s, y: y + 330 * s, s, pose: armAt(armAt(Object.assign({}, SV_SIT), 'R', SV_SIP.e, SV_SIP.w), 'L', SV_LHEAD.e, SV_LHEAD.w), face: A.face || SVF.smug, noLegs: true };
    st.pose.hand = 'open';
    const rr = drawCharacter(ctx, st, t, SVPAL);
    svHeadSpace(ctx, rr, st, (c) => svShades(c, 0, 0, 0, 1));
    svRigSpace(ctx, st, (c) => { const w = rr.wrR, d = rr.armDirR; svGlass(c, w[0] + d[0] * 14 - 22, w[1] + d[1] * 14 + 52, { straw: [rr.head[0] + 2, rr.head[1] + 46], rot: -0.08 }); circle(c, w[0] + d[0] * 14 - 4, w[1] + d[1] * 14 + 4, 20, SVPAL.skin); });
  });
  ctx.restore();
  paint(() => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = '#FFD447'; ctx.stroke(); });
  softDot(gctx, x, y, r * 1.3, '#FFD447', 0.25);
}
