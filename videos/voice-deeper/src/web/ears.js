// Why Does Your Voice Sound DEEPER With Fingers in Your Ears? Short: the hero at his desk (eye-rub-stars' desk.js) with
// an index finger in each ear, his head turned to glass (voice-recording's voicehead.js: the skull, the voice box, the
// bone route), the low hum as fat violet rings that leak out of his ears or stay trapped inside, white earbuds, the
// muscles that hold his fingers in (they buzz), and a subwoofer on his chest.
// Rig-local units (the rig's feet at the origin, his head's middle at about (0, -470)); head units = rig units round the
// head's middle (the head is an ellipse 64 x 70; his ears sit at x = +-62).
'use strict';

const VD = { bass: '#C8A8FF', bassDk: '#7A52D6', bassGlow: '#A07CFF', skin: DKPAL.skin, skinSh: DKPAL.skinSh };
// arm positions as {e: elbow, f: the middle of the fist} (rig-local)
const VD_ARM = {
  plugL: { e: [-168, -318], f: [-104, -446] }, plugR: { e: [168, -318], f: [104, -446] },   // fist beside the ear, index finger in
  deskL: DK_ARM.deskL, deskR: DK_ARM.deskR,
  chinL: DK_ARM.chinL, chinR: DK_ARM.chinR,
  budR: { e: [162, -326], f: [100, -440] },                                                 // a fingertip on the earbud
};
const vdArmMix = dkArmMix;

// the fist with the index finger out to the ear. F = the fist's middle, ear = the ear hole (rig-local), k = 0 (fingertip
// at the ear's edge) .. 1 (in), s = side (-1 = screen left), press 0..1 (pushing harder: the fist squeezes, it trembles)
function vdPlugHand(c, F, ear, k, s, pal, o = {}) {
  const tr = o.tremble || 0, t = o.t || 0;
  const jx = tr * 2.2 * Math.sin(t * 2 * Math.PI * 25), jy = tr * 1.6 * Math.cos(t * 2 * Math.PI * 25 + 1);
  const Fx = F[0] + jx, Fy = F[1] + jy;
  const out = [ear[0] + s * 18, ear[1] + 2], tip = [lerp(out[0], ear[0] - s * 2, k), lerp(out[1], ear[1] + 1, k)];
  const base = [Fx - s * 10, Fy - 16];
  // the finger: from the top of the fist to the ear hole
  line(c, base[0], base[1], tip[0], tip[1], 15, pal.skin);
  // the fist: the back of the hand turned toward us, the knuckles toward the ear
  c.save(); c.translate(Fx, Fy); c.rotate(s * 0.35);
  const R = 23 * (1 - 0.05 * (o.press || 0));
  circle(c, 0, 0, R, pal.skin);
  for (let i = 0; i < 3; i++) circle(c, s * (-R * 0.55) + s * i * 0.1, -R * 0.15 + i * R * 0.42, R * 0.32, pal.skin);   // the curled fingers, toward the ear
  circle(c, s * R * 0.62, -R * 0.4, R * 0.33, pal.skin);                                                               // the thumb, outside
  paint(() => {
    for (let i = 0; i < 2; i++) line(c, s * (-R * 0.3), -R * 0.02 + i * R * 0.42, s * R * 0.3, R * 0.06 + i * R * 0.42, 2.2, 'rgba(170,88,60,0.42)');
  });
  c.restore();
  // the ear's front edge over the fingertip: it has gone in
  if (k > 0.35) paint(() => {
    c.beginPath(); c.ellipse(ear[0] - s * 3, ear[1] + 2, 6, 11, 0, s > 0 ? Math.PI * 0.55 : -Math.PI * 0.45, s > 0 ? Math.PI * 1.45 : Math.PI * 0.45);
    c.lineWidth = 4.5; c.strokeStyle = rgba(pal.skinSh, clamp((k - 0.35) * 2.5)); c.stroke();
  });
}

// a white earbud in an ear (head units): the bud in the hole, its stem hanging down
function vdBud(c, s, k = 1) {
  if (k <= 0.01) return;
  c.save(); c.translate(s * 63, 6); c.scale(k, k);
  rrect(c, -4.5, 6, 9, 30, 4.5); c.fillStyle = '#F2F4FA'; c.fill();
  circle(c, 0, 0, 10, '#F7F8FC');
  paint(() => { circle(c, -s * 2, -2, 4.2, '#C9CEDC'); line(c, -2.5, 30, 2.5, 30, 2.4, '#9AA2B8'); });
  c.restore();
}

// a fat eighth note (any units)
function vdNote(c, x, y, s, col, rot = 0, a = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  ellipse(c, -14, 26, 17, 12, rgba(col, a), -0.4); line(c, 0, 24, 0, -34, 7, rgba(col, a));
  c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(34, -26, 26, 4); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = rgba(col, a); c.stroke();
  c.restore();
}

// His head as glass (head units, on the character layer). o: {g 0..1 (it spreads from the middle), jd (jaw), vib, hot,
// trapped 0..1 (violet rings that cannot get out), notes 0..1, larynx 0..1 (the voice box shows, buzzing), bone 0..1
// (the route from the voice box up into the skull, drawn on), talk 0..1, look, browY}
function vdGlass(c, t, o = {}) {
  const g = clamp(o.g || 0);
  if (g <= 0.01) return;
  const q = E.outBack(g, 1.25);
  // the opaque fill first, outside any clip (a window over the hero: reference/visual.md)
  c.beginPath(); c.ellipse(0, 0, 64 * q, 70 * q, 0, 0, Math.PI * 2); c.fillStyle = '#14265E'; c.fill();
  if ((o.larynx || 0) > 0.01) {     // the neck as glass too, under the chin, and the voice box in it
    const lk = E.outBack(clamp(o.larynx), 1.4);
    rrect(c, -30 * lk, 58, 60 * lk, 74, 18); c.fillStyle = '#14265E'; c.fill();
  }
  c.save();
  c.beginPath(); c.ellipse(0, 0, 64 * q, 70 * q, 0, 0, Math.PI * 2);
  if ((o.larynx || 0) > 0.01) { const lk = E.outBack(clamp(o.larynx), 1.4); c.rect(-30 * lk, 58, 60 * lk, 74); }
  c.clip();
  paint(() => {
    const gg = c.createRadialGradient(-18, -24, 6, 0, 0, 90);
    gg.addColorStop(0, '#2A4FB0'); gg.addColorStop(1, '#14265E');
    c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); c.fillStyle = gg; c.fill();
    vhSkull(c, { jd: o.jd || 0, look: o.look || [0, 0], open: 1, t, vib: o.vib || 0, hot: o.hot || 0, browY: o.browY || 0.6, browTilt: o.browTilt || 0.2, a: 0.97 });
    if ((o.larynx || 0) > 0.01) { c.save(); c.translate(0, -24); c.globalAlpha *= clamp(o.larynx * 1.5); vhLarynx(c, false, t, o.talk || 0); c.restore(); }
    if ((o.humArcs || 0) > 0.01) for (let i = 0; i < 4; i++) {     // the bone hums: orange arcs climbing from the jaw through the skull
      const p = ((t * 1.3 + i / 4) % 1), r = 14 + 74 * p, a = clamp(o.humArcs) * (1 - p);
      c.beginPath(); c.arc(0, 46, r, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 6.5 * (1 - 0.35 * p); c.lineCap = 'round'; c.strokeStyle = rgba('#FF7A1A', 0.95 * a); c.stroke();
    }
    if ((o.trapped || 0) > 0.01) vhTrapped(c, false, t, o.trapped, { col: VD.bass, speed: 1.6, n: 4, cy: 4 });
    if ((o.notes || 0) > 0.01) for (let i = 0; i < 4; i++) {
      const p = ((t * 0.55 + i / 4) % 1), bx = [-30, 26, -8, 34][i] + 10 * Math.sin(t * 2.2 + i), by = 30 - 70 * p;
      vdNote(c, bx, by, 0.36 + 0.06 * Math.sin(t * 9 + i), i % 2 ? VD.bass : '#E2D2FF', 0.3 * Math.sin(t * 3 + i), clamp(o.notes) * Math.sin(Math.PI * p));
    }
  });
  c.restore();
  // the bone route: from the voice box, up the jaw, into the bone round the ear (orange beads)
  if ((o.bone || 0) > 0.01) paint(() => {
    c.save(); c.beginPath(); c.ellipse(0, 0, 63, 69, 0, 0, Math.PI * 2); c.clip();
    for (const sd of ['L', 'R']) vhRoute(c, false, VH_BONE[sd], { col: VH.bone, w: 5, k: o.bone, a: 1, guide: 0, t, speed: 34, kind: 'bone' });
    c.restore();
  });
  // the glass's edge, his ears as glass, his hair on top (so it is still him)
  paint(() => {
    c.beginPath(); c.ellipse(0, 0, 64 * q, 70 * q, 0, 0, Math.PI * 2); c.lineWidth = 2.6; c.strokeStyle = 'rgba(127,233,255,0.9)'; c.stroke();
    if (g > 0.75) { c.save(); c.globalAlpha *= clamp((g - 0.75) * 4); vhHair(c); c.restore(); }
  });
}

// the muscles that hold a finger in: a spindle along the forearm (rig-local, el -> wr), see-through skin round it,
// fibres, a face that grits its teeth; it buzzes (25 times a second, drawn as a shiver)
function vdMuscle(c, el, wr, k, t, buzz, s) {
  if (k <= 0.01) return;
  const dx = wr[0] - el[0], dy = wr[1] - el[1], L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  const q = E.outBack(clamp(k), 1.6), sh = buzz * 1.6 * Math.sin(t * 2 * Math.PI * 25 + (s > 0 ? 1.3 : 0));
  c.save(); c.translate((el[0] + wr[0]) / 2, (el[1] + wr[1]) / 2); c.rotate(a); c.scale(q, q);
  rrect(c, -L / 2 - 4, -21, L + 8, 42, 21); c.fillStyle = '#16285E'; c.fill();           // the sleeve and skin as glass: opaque first
  paint(() => {
    rrect(c, -L / 2 - 4, -21, L + 8, 42, 21); c.lineWidth = 2.4; c.strokeStyle = 'rgba(127,233,255,0.85)'; c.stroke();
    c.translate(0, sh);
    c.beginPath(); c.moveTo(-L / 2 + 6, 0); c.bezierCurveTo(-L / 4, -19, L / 4, -19, L / 2 - 6, 0); c.bezierCurveTo(L / 4, 19, -L / 4, 19, -L / 2 + 6, 0); c.closePath();
    c.fillStyle = '#E8485E'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#8E1F33'; c.stroke();
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-L / 2 + 14, i * 2.2); c.bezierCurveTo(-L / 4, i * 6.4, L / 4, i * 6.4, L / 2 - 14, i * 2.2); c.lineWidth = 1.4; c.strokeStyle = 'rgba(255,190,200,0.75)'; c.stroke(); }
    // tendons at both ends
    line(c, -L / 2 - 2, 0, -L / 2 + 10, 0, 5, '#F4E6D8'); line(c, L / 2 - 10, 0, L / 2 + 2, 0, 5, '#F4E6D8');
    // a face: gritted teeth (upright on screen whatever the arm's angle)
    c.save(); c.rotate(-a); c.scale(0.9, 0.9);
    for (const ex of [-6.5, 6.5]) { circle(c, ex, -4, 3.4, '#FFFFFF'); circle(c, ex + 0.4, -3.6, 1.8, '#1A1030'); }
    line(c, -9, -10, -3, -8.5, 2.2, '#5A1020'); line(c, 9, -10, 3, -8.5, 2.2, '#5A1020');
    rrect(c, -7, 3, 14, 6, 2.5); c.fillStyle = '#FFFFFF'; c.fill(); line(c, -7, 6, 7, 6, 1.1, '#9A3040');
    c.restore();
  });
  c.restore();
}

// a subwoofer on his chest: a black cabinet with a cone that pumps (rig-local; k = pop-in, pump 0..1)
function vdWoofer(c, P, k, pump, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 1.7);
  c.save(); c.translate(P[0], P[1]); c.scale(q, q);
  rrect(c, -62, -58, 124, 116, 14); c.fillStyle = '#17171F'; c.fill();
  paint(() => {
    rrect(c, -62, -58, 124, 116, 14); c.lineWidth = 3; c.strokeStyle = '#3A3A4C'; c.stroke();
    for (const [x, y] of [[-52, -48], [52, -48], [-52, 48], [52, 48]]) circle(c, x, y, 3.2, '#5A5A70');
    const R = 46 * (1 + 0.06 * pump);
    circle(c, 0, 0, R + 4, '#2A2A36'); circle(c, 0, 0, R, '#3C3C4E');
    const g = c.createRadialGradient(-8 - 4 * pump, -8 - 4 * pump, 4, 0, 0, R * 0.86);
    g.addColorStop(0, '#6A6A84'); g.addColorStop(1, '#232330');
    c.beginPath(); c.arc(0, 0, R * 0.84, 0, Math.PI * 2); c.fillStyle = g; c.fill();
    circle(c, 0, 0, R * 0.32 * (1 + 0.25 * pump), '#14141C');
    c.beginPath(); c.arc(0, 0, R * 0.84, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = 'rgba(200,168,255,0.5)'; c.stroke();
  });
  c.restore();
}

// The hero at his desk (a copy of eye-rub-stars' dkHero with ears, glass and the rest). A: {armL, armR: {e, f},
// plugL, plugR: 0..1 (an index finger in that ear; needs armL/armR), press 0..1, tremble 0..1, budsL, budsR 0..1,
// glass: {vdGlass options}, muscleL, muscleR 0..1, buzz 0..1, woofer 0..1, pump 0..1, face, bob, lean, headRot, headDX,
// headDY, ambient, post(lc, r, st)}. Returns {st, r, K, head, top, chin, mouth, earL, earR, fistL, fistR, elL, elR, chest}
// (world points).
function vdHero(cam, t, A = {}) {
  const pal = A.pal || DKPAL, st = dkSt(A), out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.05 : A.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      if ((A.woofer || 0) > 0.01) vdWoofer(lc, [rr.chest[0], rr.chest[1] + 8], A.woofer, A.pump || 0, t);
      if (A.glass && (A.glass.g || 0) > 0.01) dkInHead(lc, s2, (c) => vdGlass(c, t, A.glass));
      dkInHead(lc, s2, (c) => { for (const [s, k] of [[-1, 'L'], [1, 'R']]) vdBud(c, s, A['buds' + k] || 0); });
      for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
        const arm = A['arm' + k];
        if (!arm) continue;
        const el = rr['el' + k], wr = rr['wr' + k];
        const plug = A['plug' + k];
        if (plug === undefined) continue;
        capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);                 // the forearm again, beside his head
        if ((A['muscle' + k] || 0) > 0.01) vdMuscle(lc, el, wr, A['muscle' + k], t, A.buzz || 0, s);
        const ear = dkHeadLocal(s2, s * 63, 4);
        vdPlugHand(lc, arm.f, ear, plug, s, pal, { press: A.press || 0, tremble: A.tremble || 0, t });
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  const P = (lx, ly) => dkHeadPt(st, lx, ly);
  out.st = st; out.r = r; out.K = st.s; out.head = P(0, 0); out.top = P(0, -84); out.chin = P(0, 68); out.mouth = P(0, 40);
  out.earL = P(-66, 4); out.earR = P(66, 4); out.brain = P(0, -52);
  out.chest = [st.x + r.chest[0] * st.s, st.y + (r.chest[1] + 8) * st.s];
  for (const k of ['L', 'R']) if (A['arm' + k]) { out['fist' + k] = [st.x + A['arm' + k].f[0] * st.s, st.y + A['arm' + k].f[1] * st.s]; out['el' + k] = [st.x + A['arm' + k].e[0] * st.s, st.y + A['arm' + k].e[1] * st.s]; }
  return out;
}

// the low hum as fat violet rings at an ear (world units, camera applied): `leak` 0..1 = rings that leave and fade,
// `back` 0..1 = rings that try to leave and bounce back in (the finger is there). s = side, K = world units per head unit
function vdEarRings(P, s, K, t, o = {}) {
  const leak = clamp(o.leak || 0), back = clamp(o.back || 0);
  if (leak <= 0.01 && back <= 0.01) return;
  const n = 3, sp = o.speed || 0.9;
  for (let i = 0; i < n; i++) {
    const p = ((t * sp + i / n) % 1);
    for (const [cc, w, al] of [[ctx, 1, 0.95], [gctx, 1.6, 0.22]]) {
      if (leak > 0.01) {        // out and away, getting fatter and fainter
        const d = (14 + 120 * p) * K, R = (18 + 46 * p) * K, a = leak * (1 - p) * al;
        cc.beginPath(); cc.arc(P[0] + s * (d - R), P[1], R, s > 0 ? -0.75 : Math.PI - 0.75, s > 0 ? 0.75 : Math.PI + 0.75);
        cc.lineWidth = (13 - 6 * p) * K * w * 0.5; cc.lineCap = 'round'; cc.strokeStyle = rgba(VD.bass, a); cc.stroke();
      }
      if (back > 0.01) {        // out to the fingertip, then back in
        const u = p < 0.5 ? p * 2 : 2 - p * 2, d = (6 + 20 * u) * K, R = (16 + 6 * u) * K, a = back * 0.9 * al;
        cc.beginPath(); cc.arc(P[0] + s * (d - R), P[1], R, s > 0 ? -0.7 : Math.PI - 0.7, s > 0 ? 0.7 : Math.PI + 0.7);
        cc.lineWidth = 9 * K * w * 0.5; cc.lineCap = 'round'; cc.strokeStyle = rgba(VD.bass, a); cc.stroke();
      }
    }
  }
}

// the boom of his voice round his head, from outside (world units): wide low rings that pulse and stay close
function vdBoomRings(P, K, t, k) {
  if (k <= 0.01) return;
  for (let i = 0; i < 3; i++) {
    const p = ((t * 1.7 + i / 3) % 1), R = (92 + 38 * p) * K, a = k * (1 - p);
    for (const [cc, w, al] of [[ctx, 1, 0.75], [gctx, 1.8, 0.24]]) {
      cc.beginPath(); cc.ellipse(P[0], P[1], R, R * 1.06, 0, 0, Math.PI * 2);
      cc.lineWidth = (10 - 5 * p) * K * w * 0.5; cc.strokeStyle = rgba(VD.bass, a * al); cc.stroke();
    }
  }
}

// rumble marks round his head: short jagged low lines (world units)
function vdRumble(P, K, t, k) {
  if (k <= 0.01) return;
  const rng = mulberry32(77 + Math.floor(t * 12));
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.52 + (rng() - 0.5) * 0.12, r0 = 112 * K, L = (24 + 10 * rng()) * K;
    const pts = [];
    for (let j = 0; j <= 4; j++) { const rr = r0 + (L * j) / 4, wob = (j % 2 ? 1 : -1) * 4.5 * K; pts.push([P[0] + Math.cos(a) * rr - Math.sin(a) * wob, P[1] + Math.sin(a) * rr * 1.04 + Math.cos(a) * wob]); }
    for (const [cc, w, al] of [[ctx, 5, 0.9], [gctx, 10, 0.45]]) poly(cc, pts, w * K * 0.5, rgba(VD.bass, k * al));
  }
}
