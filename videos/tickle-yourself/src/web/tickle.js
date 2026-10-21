// Why Can't You TICKLE Yourself? Short: this video's own props and characters (loaded after hand.js, room.js and
// brainroom.js, which come from vulcan-salute).
//   TKPAL, TF                    his green hoodie; his faces
//   tkSt(A), tkHero(cam, t, A)   him in the living room with his right hand up, palm to us, and the index finger of his
//                                other hand tickling it (A.poke); like vulcan-salute's vsSt / vsHero, which it follows
//   tkPoker(c, pal, P, t)        that tickling hand, drawn in the raised hand's units (hand.js)
//   tkPip(cam, t, P)             Pip, his niece (the rig in pink, pigtails), leaning in with one finger out
//   brain's room (room space, brainroom.js): tkPalmScreen, tkBook, tkPrinter, tkSlip, tkKnob, tkMeter
//   the lab: tkLabBack, tkRobot, tkJoystick, tkReadout, tkMiniRobot
'use strict';

// ---------------------------------------------------------------- him
const TKPAL = Object.assign({}, PAL, { coat: '#2E9C7E', coatSh: '#1E715B', coatHi: '#5ED3B0', coatDk: '#145444', strap: '#2E9C7E', strapSh: '#1E715B', pj: true });
const TF = {
  // eyes on his raised palm (screen right), hopeful: this time it will work
  eager: { eyeOpen: 1.1, pupil: 0.95, lookX: 0.85, lookY: -0.3, browY: 0.95, browTilt: 0.35, mouth: 'grin', mouthOpen: 0.3, blink: 0, cross: 0 },
  // still on the palm, nothing happening
  meh: { eyeOpen: 1, pupil: 1, lookX: 0.8, lookY: -0.25, browY: 0.05, browTilt: -0.2, mouth: 'flat', mouthOpen: 0, blink: 0.38, cross: 0 },
  // straight at us, heavy lids: nothing
  flat: { eyeOpen: 1, pupil: 1.05, lookX: 0, lookY: 0.08, browY: -0.15, browTilt: -0.25, mouth: 'flat', mouthOpen: 0, blink: 0.46, cross: 0 },
  // eyes up at his own forehead (the window opening there)
  up: { eyeOpen: 1.15, pupil: 0.9, lookX: 0.15, lookY: -1, browY: 1.1, browTilt: 0.4, mouth: 'o', mouthOpen: 0.2, blink: 0, cross: 0 },
  // a surprise touch: wide eyes
  jolt: { eyeOpen: 1.35, pupil: 0.62, lookX: 0.6, lookY: -0.2, browY: 1.45, browTilt: 0.4, mouth: 'o', mouthOpen: 0.65, blink: 0, cross: 0 },
  // laughing helplessly: eyes squeezed, mouth wide, a tear
  laugh: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.1, browTilt: 0.6, mouth: 'grin', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1, tear: 0.7 },
  giggle: { eyeOpen: 1, pupil: 1, lookX: 0.4, lookY: -0.1, browY: 0.85, browTilt: 0.7, mouth: 'grin', mouthOpen: 0.65, blink: 0.75, cross: 0, squeeze: 0.5 },
  // a twitch: something is happening
  twitchy: { eyeOpen: 1.2, pupil: 0.8, lookX: 0.8, lookY: -0.25, browY: 1.0, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  sheepish: { eyeOpen: 0.95, pupil: 0.95, lookX: -0.1, lookY: 0.12, browY: 0.85, browTilt: 0.9, mouth: 'grin', mouthOpen: 0.3, blink: 0.25, cross: 0 },
};

// the tickling hand's parts, from its fingertip (hand units of the raised hand, canonical: hand.js)
const TK_POKE = { knuckle: [30, 56], fist: [52, 80], wrist: [66, 122] };
// the tickle wiggle: the fingertip scribbles a small loop (hand units); w = how hard he goes (0..1), t = seconds
function tkWiggle(t, w, rate = 1) {
  if (w <= 0.001) return [0, 0];
  const a = t * 23 * rate;
  return [w * (7 * Math.sin(a) + 2.5 * Math.sin(a * 2.3 + 1)), w * (4.5 * Math.sin(a * 1.6 + 0.6))];
}
// the tickling hand: the index finger out (bent a little as it scratches), the other fingers curled into a fist, the
// thumb along them. P = {tip: [x, y] fingertip, bend 0..1, pal}. Drawn in the raised hand's units, on top of it.
function tkPoker(c, pal, P, t) {
  const skin = (pal && pal.skin) || VH_SKIN, tip = P.tip, b = P.bend || 0;
  const kn = [tip[0] + TK_POKE.knuckle[0], tip[1] + TK_POKE.knuckle[1]];
  const fi = [tip[0] + TK_POKE.fist[0], tip[1] + TK_POKE.fist[1]];
  // the finger: two segments, the middle joint bowed out as it scratches
  const mid = [lerp(kn[0], tip[0], 0.5) + 7 * b, lerp(kn[1], tip[1], 0.5) + 2 * b];
  // the fist (back of the hand to us), outside the palm's heel
  ellipse(c, fi[0] + 3, fi[1] + 3, 28, 25, VH_SKIN2, 0.6);
  ellipse(c, fi[0], fi[1], 26, 24, skin, 0.6);
  c.lineCap = 'round';
  // the finger: a dark edge first (it must read against the palm under it), then the skin
  line(c, kn[0], kn[1], mid[0], mid[1], 19, '#B8694A');
  line(c, mid[0], mid[1], tip[0], tip[1], 17.5, '#B8694A');
  line(c, kn[0], kn[1], mid[0], mid[1], 15, '#F6C29C');
  line(c, mid[0], mid[1], tip[0], tip[1], 13.5, '#F7C6A2');
  paint(() => {
    c.lineJoin = 'round';
    // the curled fingers' creases
    for (let i = 0; i < 3; i++) { const yy = fi[1] - 6 + i * 9; c.beginPath(); c.arc(fi[0] + 13, yy, 7.5, -1.2, 1.2); c.lineWidth = 1.6; c.strokeStyle = 'rgba(160,82,56,0.55)'; c.stroke(); }
    c.beginPath(); c.ellipse(fi[0], fi[1], 26, 24, 0.6, 0, 7); c.lineWidth = 2.2; c.strokeStyle = VH_LINE; c.stroke();
    // the knuckle crease and the nail (back view)
    const ux = tip[0] - mid[0], uy = tip[1] - mid[1], L = Math.hypot(ux, uy) || 1;
    c.beginPath(); c.arc(mid[0], mid[1], 5, Math.atan2(uy, ux) + 1.2, Math.atan2(uy, ux) + 1.9 + Math.PI); c.lineWidth = 1.3; c.strokeStyle = 'rgba(160,82,56,0.5)'; c.stroke();
    ellipse(c, tip[0] - (ux / L) * 3.5, tip[1] - (uy / L) * 3.5, 4.8, 6.4, VH_NAIL, Math.atan2(uy, ux) + Math.PI / 2);
    c.beginPath(); c.ellipse(tip[0] - (ux / L) * 3.5, tip[1] - (uy / L) * 3.5, 4.8, 6.4, Math.atan2(uy, ux) + Math.PI / 2, 0, 7); c.lineWidth = 1; c.strokeStyle = 'rgba(200,120,100,0.7)'; c.stroke();
    // the thumb along the curled fingers
    c.beginPath(); c.moveTo(fi[0] - 18, fi[1] + 12); c.quadraticCurveTo(fi[0] - 24, fi[1] - 4, fi[0] - 12, fi[1] - 16); c.lineWidth = 2.2; c.strokeStyle = VH_LINE; c.stroke();
  });
}

// arm positions {e: elbow, w: wrist} (rig-local), as in room.js's VS_ARM
const TK_ARM = {
  up: VS_ARM.up,
  low: { e: [150, -262], w: [182, -330] },       // the hand lowered to his chest (still palm out): the button's shrug
  shrugR: { e: [170, -290], w: [214, -360] },
  restL: VS_ARM.restL,
  shrugL: { e: [-150, -262], w: [-196, -330] },  // the other hand out, palm up: a shrug
  stick: { e: [-30, -232], w: [60, -300] },      // the lab: gripping the joystick in front of his chest
};
// his rig state for a description A (as vsSt in room.js, with A.poke = {tip: [x, y] (raised-hand units), k 0..1 (the
// hand in place; 0 = hanging), bend} instead of A.help)
function tkSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
  const aR = A.armR || TK_ARM.up;
  p = armAt(p, 'R', aR.e, aR.w);
  let armL = A.armL || TK_ARM.restL;
  if (A.poke && (A.poke.k === undefined || A.poke.k > 0.001)) {
    const rr = rig(p), F = vsHandFrame(rr, A), H = A.H || {}, v = clamp(H.view || 0), sx = -Math.cos(Math.PI * v) >= 0 ? 1 : -1;
    const hs = (H.s || 1) * F.s, tip = A.poke.tip;
    const q = [(tip[0] + TK_POKE.wrist[0]) * sx * hs, (tip[1] + TK_POKE.wrist[1]) * hs];
    const wr = [F.o[0] + q[0] * Math.cos(F.ang) - q[1] * Math.sin(F.ang), F.o[1] + q[0] * Math.sin(F.ang) + q[1] * Math.cos(F.ang)];
    const k = clamp(A.poke.k === undefined ? 1 : A.poke.k), base = A.armL || TK_ARM.restL;
    armL = { e: [lerp(base.e[0], -6, k), lerp(base.e[1], -238, k)], w: [lerp(base.w[0], wr[0], k), lerp(base.w[1], wr[1], k)] };
  }
  p = armAt(p, 'L', armL.e, armL.w);
  return { x: VS.hx + (A.dx || 0), y: VS.hy + (A.dy || 0), s: VS.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, seed: 4, noArms: true };
}
// Draw him from a description A:
//   face, headDX, headDY, headRot, lean, bob, dx, dy, armR / armL ({e, w}), H (the raised hand, hand.js), handRot, handS
//   poke: {tip, k, bend} (his other hand tickling the palm; k = 1 in place), shake 0..1 (laughing: the whole body)
//   goggles 0..1 (lab), pal, ambient, tv, prop(lc, r, st) a prop on his layer under his other arm (rig-local units),
//   post(lc, r, st, F) more drawing in rig-local units, on top
//   handL: 'open' | 'fist' | 'grip' (the other hand when it is not tickling)
// Returns {st, r, head, F, hp(q): raised-hand point -> world, P}
function tkHero(cam, t, A = {}) {
  const pal = A.pal || TKPAL, sh = A.shake || 0;
  const A2 = Object.assign({}, A, {
    dx: (A.dx || 0) + sh * 5 * Math.sin(t * 41), dy: (A.dy || 0) + sh * 4 * Math.abs(Math.sin(t * 27)),
    headDX: (A.headDX || 0) + sh * 4 * Math.sin(t * 33), headRot: (A.headRot || 0) + sh * 0.07 * Math.sin(t * 19),
  });
  const st = tkSt(A2), out = {};
  const tv = A.tv === undefined ? 0.22 : A.tv;
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.03 : A.ambient, light: tv * (0.75 + 0.5 * tvFlick(t)),
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      vsInHead(lc, s2, (c) => {
        const gk = A.goggles || 0;
        if (gk > 0.01) {   // lab safety goggles, up on his forehead
          paint(() => {
            c.save(); c.translate(0, -58);
            line(c, -70, 4, 70, 4, 9, '#2B3550');
            for (const sd of [-1, 1]) { rrect(c, sd * 34 - 30, -16, 60, 38, 16); c.fillStyle = 'rgba(160,220,255,0.55)'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#3A4A6E'; c.stroke(); }
            c.restore();
          });
        }
      });
      const armOf = (k) => {
        capsuleShaded(lc, rr['sh' + k], rr['el' + k], 42, pal.coat, pal.coatSh, pal.coatHi, pal);
        capsuleShaded(lc, rr['el' + k], rr['wr' + k], 38, pal.coat, pal.coatSh, pal.coatHi, pal);
        const d = rr['armDir' + k], wr = rr['wr' + k];
        line(lc, wr[0] - d[0] * 8, wr[1] - d[1] * 8, wr[0] + d[0] * 1, wr[1] + d[1] * 1, 44, pal.coatSh);
      };
      const poking = A.poke && (A.poke.k === undefined || A.poke.k > 0.98);
      if (A.prop) A.prop(lc, rr, s2);
      // the other arm when it is not up at the palm: drawn first (it hangs, or grips the joystick), under the raised arm
      if (!A.poke) actor(() => { armOf('L'); drawHand(lc, rr.wrL, rr.armDirL, A.handL || 'open', pal, -1, t); });
      // the raised arm, then the hand at its wrist
      actor(() => armOf('R'));
      const F = vsHandFrame(rr, A);
      lc.save(); lc.translate(F.o[0], F.o[1]); lc.rotate(F.ang); lc.scale(F.s, F.s);
      actor(() => { out.P = vsHand(lc, pal, A.H || {}, t); });
      lc.restore();
      // the tickling arm: across his chest, in front; its hand on the palm
      if (A.poke) {
        actor(() => armOf('L'));
        if (poking) {
          lc.save(); lc.translate(F.o[0], F.o[1]); lc.rotate(F.ang); lc.scale(F.s, F.s);
          const v = clamp((A.H || {}).view || 0), sx = -Math.cos(Math.PI * v), hs = (A.H && A.H.s) || 1;
          lc.scale((sx >= 0 ? 1 : -1) * hs, hs);
          actor(() => tkPoker(lc, pal, A.poke, t));
          lc.restore();
        } else actor(() => drawHand(lc, rr.wrL, rr.armDirL, 'point', pal, -1, t));
      }
      out.F = F;
      if (A.post) A.post(lc, rr, s2, F);
      lc.restore();
    },
  });
  out.st = st; out.r = r; out.head = vsHeadPt(st, 0, 0);
  const F = out.F, v = clamp((A.H || {}).view || 0), sx = -Math.cos(Math.PI * v), sxx = (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx);
  const hs = (A.H && A.H.s) || 1;
  out.hp = (q) => {   // a raised-hand point (canonical units) -> world
    const qq = [q[0] * hs * sxx, q[1] * hs], a = F.ang;
    const wx = F.o[0] + (qq[0] * Math.cos(a) - qq[1] * Math.sin(a)) * F.s, wy = F.o[1] + (qq[0] * Math.sin(a) + qq[1] * Math.cos(a)) * F.s;
    return [st.x + wx * st.s, st.y + wy * st.s];
  };
  return out;
}

// ---------------------------------------------------------------- Pip, his niece: the rig in pink, smaller, pigtails
const PIPPAL = Object.assign({}, PAL, {
  coat: '#FF6FA0', coatSh: '#D84B7E', coatHi: '#FFB0CB', coatDk: '#B03A66',
  strap: '#FFD447', strapSh: '#D8A92A', pants: '#6B4FD8', pantsSh: '#4A35A8',
  shoe: '#FFD447', shoeSh: '#D8A92A', sole: '#FFF6D8', pj: true,
});
const PIPF = {
  sneak: { eyeOpen: 1, pupil: 1, lookX: -0.85, lookY: 0.1, browY: 0.2, browTilt: -0.7, mouth: 'grin', mouthOpen: 0.4, blink: 0.35, cross: 0 },
  glee: { eyeOpen: 1.15, pupil: 1.1, lookX: -0.6, lookY: 0.1, browY: 0.9, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.9, blink: 0, cross: 0 },
};
// her pigtails and fringe (rig-local, round her head)
function tkPigtails(c, r, st, t) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  for (const s of [-1, 1]) {
    const sw = 0.12 * Math.sin(t * loopW(7) + s);
    c.save(); c.translate(s * 60, -36); c.rotate(s * (0.5 + sw));
    ellipse(c, s * 34, 6, 40, 26, PAL.hair, s * 0.2); ellipse(c, s * 52, 14, 22, 16, PAL.hair, s * 0.4);
    circle(c, s * 2, 2, 13, '#FFD447');
    c.restore();
  }
  c.beginPath(); c.moveTo(-60, -20); c.quadraticCurveTo(-40, -2, -20, -24); c.quadraticCurveTo(0, -4, 20, -26); c.quadraticCurveTo(42, -4, 60, -20);
  c.lineTo(56, -52); c.lineTo(-56, -52); c.closePath(); c.fillStyle = PAL.hair; c.fill();
  c.restore();
}
// Pip, leaning in. P = {x, y (her feet, world), s, rot (lean, rad, about her feet), face, reach: [x, y] world point her
// right fingertip goes to (or null), k 0..1 (how far the arm is out)}. Drawn into ctx under the camera, as an actor.
function tkPip(cam, t, P) {
  const s = P.s || 0.62, rot = P.rot || 0;
  let pose = { hipY: -222, lean: 0, armL: { a: 0.22, b: 0.3 }, armR: { a: 0.2, b: 0.12 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
  // her right hand (the rig's R is on screen right; she faces us, so it reaches toward screen left across her body:
  // use her LEFT arm, which is on the screen-left side) out to the target
  if (P.reach) {
    const k = clamp(P.k === undefined ? 1 : P.k);
    // world -> her rig-local (undo the lean about her feet, then the scale)
    const dx = P.reach[0] - P.x, dy = P.reach[1] - P.y, cs = Math.cos(-rot), sn = Math.sin(-rot);
    const lx = (dx * cs - dy * sn) / s, ly = (dx * sn + dy * cs) / s;
    const sh = [-74, -370], wr0 = [-113, -184];
    const tipBack = 70;   // drawHand's 'point' puts the fingertip about 70 units past the wrist
    const L = Math.hypot(lx - sh[0], ly - sh[1]) || 1, wr = [lx - (lx - sh[0]) / L * tipBack, ly - (ly - sh[1]) / L * tipBack];
    const w = [lerp(wr0[0], wr[0], k), lerp(wr0[1], wr[1], k)];
    const e = [lerp(sh[0], w[0], 0.5) + 10, lerp(sh[1], w[1], 0.5) + 34];
    pose = armAt(pose, 'L', e, w);
  }
  const st = { x: 0, y: 0, s: 1, pose, face: P.face || PIPF.sneak, seed: 9, noArms: true, headDX: P.headDX || 0, headRot: P.headRot || 0 };
  applyCam(cam);
  ctx.save(); ctx.translate(P.x, P.y); ctx.rotate(rot); ctx.scale(s, s);
  actor(() => {
    const r = drawCharacter(ctx, st, t, PIPPAL);
    tkPigtails(ctx, r, st, t);
    // her arms on top (noArms): the right one hanging, the left one reaching with a pointing hand
    for (const k of ['R', 'L']) {
      capsuleShaded(ctx, r['sh' + k], r['el' + k], 40, PIPPAL.coat, PIPPAL.coatSh, PIPPAL.coatHi, PIPPAL);
      capsuleShaded(ctx, r['el' + k], r['wr' + k], 36, PIPPAL.coat, PIPPAL.coatSh, PIPPAL.coatHi, PIPPAL);
      drawHand(ctx, r['wr' + k], r['armDir' + k], k === 'L' && P.reach ? 'point' : 'open', PIPPAL, k === 'L' ? -1 : 1, t);
    }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- the brain's room (room space; brainroom.js)
const TKR = { SCR: [170, 380, 740, 470], BX: 500, BY: 1060, BS: 1.0, DESK: 1250, PR: [215, 1166], KN: [778, 1172] };
// the wall screen: YOUR PALM, live. o: {wig (the poke's wiggle, hand units), target 0..1 (the forecast: a dashed ring
// where the finger will land), match 0..1 (a green tick), other 0..1 (a pink finger with no forecast: ???), alarm 0..1,
// dim 0..1}
function tkPalmScreen(t, o = {}) {
  const c = ctx, [sx, sy, sw, sh] = TKR.SCR;
  rrect(c, sx + sw / 2 - 26, sy - 90, 52, 100, 8); c.fillStyle = '#1A1228'; c.fill();
  rrect(c, sx - 20, sy - 20, sw + 40, sh + 40, 30); c.fillStyle = o.alarm > 0.5 ? '#4A1424' : '#211830'; c.fill();
  rrect(c, sx - 20, sy - 20, sw + 40, 12, 6); c.fillStyle = '#3A2C52'; c.fill();
  const P = {};
  paint(() => {
    c.save(); rrect(c, sx, sy, sw, sh, 16); c.clip();
    const g = c.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#16224E'); g.addColorStop(1, '#0E1638');
    c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
    for (let x = sx + 40; x < sx + sw; x += 80) line(c, x, sy, x, sy + sh, 2, 'rgba(120,150,255,0.07)');
    for (let y = sy + 40; y < sy + sh; y += 80) line(c, sx, y, sx + sw, y, 2, 'rgba(120,150,255,0.07)');
    // his palm, big, the wrist at the bottom of the screen
    const HS = 2.2, ox = sx + sw / 2 + 30, oy = sy + sh + 46;
    c.save(); c.translate(ox, oy); c.scale(HS, HS);
    const HP = vsHand(c, TKPAL, { view: 0 }, t);
    c.restore();
    // the palm's middle (canonical hand units; the palm view is mirrored)
    const pc = [0, -46], toS = (q) => [ox - q[0] * HS, oy + q[1] * HS];
    P.center = toS(pc);
    // the forecast: a dashed ring where the finger will land, and HERE
    const tk = clamp(o.target || 0);
    if (tk > 0.01) {
      const C = P.center, R = 54 * E.outBack(tk, 1.8);
      c.setLineDash([16, 12]); c.lineDashOffset = -t * 40;
      c.beginPath(); c.arc(C[0], C[1], R, 0, 7); c.lineWidth = 8; c.strokeStyle = '#FFD447'; c.stroke(); c.setLineDash([]);
      line(c, C[0] - R - 16, C[1], C[0] - R + 14, C[1], 6, '#FFD447'); line(c, C[0] + R - 14, C[1], C[0] + R + 16, C[1], 6, '#FFD447');
      line(c, C[0], C[1] - R - 16, C[0], C[1] - R + 14, 6, '#FFD447'); line(c, C[0], C[1] + R - 14, C[0], C[1] + R + 16, 6, '#FFD447');
    }
    // the touch as it is felt: a warm glow and sparks round the fingertip, as strong as the FEELING knob lets it be
    const fe = clamp(o.felt || 0);
    if (fe > 0.01) {
      const C = P.center;
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * 6.283 + t * 2.1, r0 = 44 + 10 * Math.sin(t * 13 + i), r1 = r0 + 46 * fe;
        line(c, C[0] + Math.cos(a) * r0, C[1] + Math.sin(a) * r0, C[0] + Math.cos(a) * r1, C[1] + Math.sin(a) * r1, 7, '#FFB347');
      }
    }
    // his own finger, tickling (the same wiggle as in the room)
    const wg = o.wig || [0, 0], fk = o.finger === undefined ? 1 : clamp(o.finger);
    if (fk > 0.01) {
      c.save(); c.translate(ox, oy); c.scale(-HS, HS);
      const drop = (1 - fk) * 90;
      tkPoker(c, TKPAL, { tip: [pc[0] + wg[0], pc[1] + wg[1] + drop], bend: o.bend || 0 }, t);
      c.restore();
    }
    // somebody else's finger: pink sleeve from the right, no forecast: ???
    const ok = clamp(o.other || 0);
    if (ok > 0.01) {
      const C = P.center, q = E.outBack(ok, 2);
      c.save(); c.translate(C[0] - 20, C[1] - 190); c.scale(q, q); c.rotate(-0.06 + 0.05 * Math.sin(t * 30));
      c.font = '400 150px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      c.lineWidth = 16; c.strokeStyle = '#2A0A14'; c.strokeText('???', 0, 0); c.fillStyle = '#FF5A6E'; c.fillText('???', 0, 0);
      c.restore();
    }
    if (ok > 0.01) {
      const C = P.center, a = [sx + sw + 40 - 260 * E.outCubic(ok), C[1] + 120 - 60 * E.outCubic(ok)];
      line(c, sx + sw + 80, C[1] + 220, a[0] + 60, a[1] + 40, 56, '#FF6FA0');
      ellipse(c, a[0] + 40, a[1] + 26, 34, 30, VH_SKIN, 0.4);
      line(c, a[0] + 30, a[1] + 14, a[0] - 24, a[1] - 20, 22, '#F2B993');
      ellipse(c, a[0] - 22, a[1] - 18, 7, 9, VH_NAIL, -0.9);
    }
    c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = o.alarm > 0.5 ? '#FF8A98' : 'rgba(170,190,255,0.95)';
    c.fillText(o.title || 'YOUR PALM', sx + sw / 2, sy + 52);
    c.restore();
    if (o.dim > 0.01) { c.fillStyle = `rgba(6,8,20,${0.6 * o.dim})`; c.fillRect(sx, sy, sw, sh); }
  });
  softDot(gctx, sx + sw / 2, sy + sh / 2, 520, o.alarm > 0.5 ? '#FF4D6D' : '#5A78FF', 0.14 + 0.2 * (o.alarm || 0));
  if ((o.felt || 0) > 0.01 && P.center) softDot(gctx, P.center[0], P.center[1], 150, '#FFB347', 0.7 * o.felt);
  return P;
}
// a paperback the brain reads: SPOILERS on the cover (room units, centre x, y; s scale; k pops it in; open 0..1)
function tkBook(x, y, s, k, t, o = {}) {
  if (k <= 0.01) return;
  const q = s * E.outBack(clamp(k), 1.8), c = ctx;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(q, q);
  actor(() => { rrect(c, -110, -150, 220, 300, 14); c.fillStyle = '#2C6BD8'; c.fill(); rrect(c, -110, -150, 26, 300, 10); c.fillStyle = '#1F4EA6'; c.fill(); });
  paint(() => {
    c.font = '400 52px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF';
    c.fillText('THE', 14, -104); c.fillText('TICKLE', 14, -54);
    // a little drawing: a finger on a palm
    c.save(); c.translate(14, 40); c.scale(0.62, 0.62); c.scale(-1, 1);
    vsHand(c, TKPAL, { view: 0 }, t); tkPoker(c, TKPAL, { tip: [0, -46] }, t);
    c.restore();
    // the SPOILER sticker
    const sk = clamp(o.sticker || 0);
    if (sk > 0.01) {
      c.save(); c.translate(30, 92); c.rotate(-0.22); const ss = lerp(1.9, 1, E.outCubic(sk)); c.scale(ss, ss);
      rrect(c, -118, -30, 236, 60, 10); c.fillStyle = '#FF3B4E'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#FFFFFF'; c.stroke();
      c.font = '400 42px Anton'; c.fillStyle = '#FFFFFF'; c.fillText('SPOILERS', 0, 2);
      c.restore();
    }
  });
  c.restore();
}
// a little printer on the desk (room units): a slip comes out of its mouth as `print` goes 0..1
function tkPrinter(x, y, s, t, o = {}) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  actor(() => {
    rrect(c, -110, -70, 220, 140, 26); c.fillStyle = '#C9CFE6'; c.fill();
    rrect(c, -110, -70, 220, 34, 16); c.fillStyle = '#E4E8F6'; c.fill();
    rrect(c, -80, -18, 160, 22, 8); c.fillStyle = '#2A2440'; c.fill();     // the mouth
  });
  paint(() => {
    c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#4A4466'; c.fillText('COPIER', 0, 40);
    const on = (o.busy || 0) > 0.5 && Math.sin(t * 30) > 0;
    circle(c, 82, 40, 9, on ? '#4DFFB4' : '#2E6A54');
  });
  if ((o.busy || 0) > 0.5) softDot(gctx, x + 82 * s, y + 40 * s, 30 * s, '#4DFFB4', 0.6);
  c.restore();
}
// a slip of paper: a finger on a palm and a word (room units; centre, scale, rotation, k pops)
function tkSlip(x, y, s, rot, txt, col, k, t) {
  if (k <= 0.01) return;
  const c = ctx, q = s * E.outBack(clamp(k), 1.6);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(q, q);
  actor(() => { rrect(c, -80, -100, 160, 200, 10); c.fillStyle = '#FFF8E6'; c.fill(); });
  paint(() => {
    c.save(); c.translate(0, 34); c.scale(-0.5, 0.5); vsHand(c, TKPAL, { view: 0 }, t); tkPoker(c, TKPAL, { tip: [0, -46] }, t); c.restore();
    c.save(); c.translate(0, -66); c.rotate(-0.1);
    rrect(c, -64, -22, 128, 44, 8); c.lineWidth = 5; c.strokeStyle = col; c.stroke();
    c.font = '400 32px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(txt, 0, 2);
    c.restore();
  });
  c.restore();
}
// the big FEELING knob on the desk (room units): level 0..1 (where it points; its ticks light up to it, green to red)
function tkKnob(x, y, r, level, t, o = {}) {
  const c = ctx, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, a = lerp(a0, a1, clamp(level));
  const tickCol = (i) => (i >= 9 ? '#FF5A6E' : i >= 6 ? '#FFD447' : '#4DFFB4');
  paint(() => {
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, aa = lerp(a0, a1, u), r0 = r * 1.2, r1 = r * 1.46, on = u <= level + 0.02;
      line(c, x + Math.cos(aa) * r0, y + Math.sin(aa) * r0, x + Math.cos(aa) * r1, y + Math.sin(aa) * r1, 11, on ? tickCol(Math.round(u * 10)) : 'rgba(220,210,255,0.16)');
    }
    const lk = o.labelK === undefined ? 1 : clamp(o.labelK);
    if (lk > 0.01) {
      c.save(); c.translate(x, y - r * 1.85); const q = E.outBack(lk, 2); c.scale(q, q);
      c.font = '900 38px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFD447'; c.fillText(o.label || 'FEELING', 0, 0);
      c.restore();
    }
  });
  for (let i = 0; i <= 12; i++) {
    const u = i / 12, aa = lerp(a0, a1, u);
    if (u <= level + 0.02) softDot(gctx, x + Math.cos(aa) * r * 1.33, y + Math.sin(aa) * r * 1.33, 22, tickCol(Math.round(u * 10)), 0.5);
  }
  actor(() => {
    circle(c, x, y + 8, r * 1.06, '#140C20');
    circle(c, x, y, r, '#B9BED6');
    circle(c, x, y, r * 0.78, '#D8DCEC');
  });
  paint(() => {
    line(c, x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2, x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92, 14, '#FF9A3C');
    circle(c, x, y, r * 0.16, '#8A90AA');
  });
  if ((o.glow || 0) > 0.01) softDot(gctx, x, y, r * 2.2, '#FF5A6E', 0.35 * o.glow);
  return [x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86];   // the pointer's end: where a hand turning it holds it
}
// a level meter: n bars, lit up to `level` (room units, bottom-left corner)
function tkMeter(x, y, w, h, level, t, o = {}) {
  const c = ctx, n = o.n || 8, gap = 6, bh = (h - gap * (n - 1)) / n;
  rrect(c, x - 14, y - h - 14, w + 28, h + 28, 14); c.fillStyle = '#1A1228'; c.fill();
  paint(() => {
    for (let i = 0; i < n; i++) {
      const on = (i + 0.5) / n <= level, col = i >= n - 2 ? '#FF5A6E' : i >= n - 4 ? '#FFD447' : '#4DFFB4';
      rrect(c, x, y - (i + 1) * bh - i * gap, w, bh, 5); c.fillStyle = on ? col : 'rgba(255,255,255,0.08)'; c.fill();
    }
    if (o.label) { c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(220,210,255,0.9)'; c.fillText(o.label, x + w / 2, y + 34); }
  });
  for (let i = 0; i < n; i++) if ((i + 0.5) / n <= level) softDot(gctx, x + w / 2, y - (i + 0.5) * (bh + gap), w * 0.7, i >= n - 2 ? '#FF5A6E' : i >= n - 4 ? '#FFD447' : '#4DFFB4', 0.35);
}

// ---------------------------------------------------------------- the lab (world units = screen at zoom 1)
let LAB_C = null;
function initTkLab() {
  const c0 = mkCanvas(1080, 1920), x = c0.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#081226'); g.addColorStop(0.55, '#0C1C36'); g.addColorStop(1, '#050A16');
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  // tiled wall, shelves of glassware, a cabinet with lit buttons
  for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,0.016)' : 'rgba(0,0,0,0.04)'; x.fillRect(0, 300 + i * 120, 1080, 120); }
  for (const y of [640, 1000]) { x.fillStyle = '#13233F'; x.fillRect(0, y, 1080, 14); }
  for (let i = 0; i < 10; i++) { const r = mulberry32(70 + i), xx = 40 + i * 105; rrect(x, xx, 1000 - 70 - r() * 60, 34 + r() * 16, 70 + r() * 60, 10); x.fillStyle = ['#1E4A66', '#2C2F5A', '#1D5A52'][i % 3]; x.fill(); }
  for (let i = 0; i < 9; i++) { const r = mulberry32(170 + i), xx = 60 + i * 115; rrect(x, xx, 640 - 60 - r() * 50, 30 + r() * 18, 60 + r() * 50, 10); x.fillStyle = ['#2C2F5A', '#1D5A52', '#1E4A66'][i % 3]; x.fill(); }
  LAB_C = mkCanvas(1080, 1920);
  const y = LAB_C.getContext('2d'); y.filter = 'blur(6px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
}
function tkLabBack(cam, t) {
  const bc = { x: 540 + (cam.x - 540) * 0.35, y: 960 + (cam.y - 1090) * 0.35, zoom: 1.1 + 0.05 * (cam.zoom - 2), rot: 0, sx: (cam.sx || 0) * 0.15, sy: (cam.sy || 0) * 0.15 };
  screenSpace(); ctx.fillStyle = '#050A16'; ctx.fillRect(0, 0, W, H);
  applyCam(bc);
  ctx.drawImage(LAB_C, 0, 0);
  for (let i = 0; i < 10; i++) softDot(gctx, 60 + i * 105, 930, 34, ['#4DFFB4', '#7FE9FF', '#C8A8FF'][i % 3], 0.16 + 0.08 * Math.sin(t * loopW(2 + (i % 3)) + i));
}
// the robot arm: a base at the right (world), two white segments, a pink foam tip at `tip` (world)
function tkRobot(base, tip, t, o = {}) {
  const c = ctx, L1 = o.L1 || 230, L2 = o.L2 || 200;
  // two-bone IK, the elbow up
  const dx = tip[0] - base[0], dy = tip[1] - base[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1);
  const a = Math.atan2(dy, dx), b = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const el = [base[0] + Math.cos(a + b) * L1, base[1] + Math.sin(a + b) * L1];
  actor(() => {
    rrect(c, base[0] - 70, base[1] - 20, 140, 260, 24); c.fillStyle = '#2E3A58'; c.fill();       // the pedestal
    circle(c, base[0], base[1], 46, '#C9D1E6');
    line(c, base[0], base[1], el[0], el[1], 48, '#DDE3F2');
    circle(c, el[0], el[1], 34, '#AEB7D0');
    line(c, el[0], el[1], tip[0], tip[1], 38, '#E8ECF7');
    circle(c, tip[0], tip[1], 24, '#AEB7D0');
  });
  // the foam tip
  const fa = Math.atan2(tip[1] - el[1], tip[0] - el[0]);
  actor(() => { c.save(); c.translate(tip[0] + Math.cos(fa) * 30, tip[1] + Math.sin(fa) * 30); c.rotate(fa); rrect(c, -12, -26, 50, 52, 22); c.fillStyle = '#FF86B6'; c.fill(); c.restore(); });
  paint(() => {
    line(c, base[0] - 20, base[1] + 6, el[0] - 10, el[1] + 10, 4, 'rgba(60,70,100,0.35)');
    circle(c, el[0], el[1], 10, '#6A7594'); circle(c, base[0], base[1], 12, '#6A7594');
  });
  const lampOn = Math.sin(t * loopW(4)) > 0;
  circle(c, base[0] + 40, base[1] + 40, 9, lampOn ? '#4DFFB4' : '#1E4A3A'); if (lampOn) softDot(gctx, base[0] + 40, base[1] + 40, 24, '#4DFFB4', 0.6);
  return { el, tip };
}
// the handle he moves (world): a knob on a short stick on a box; dx = how far it leans
function tkJoystick(c, x, y, dx, t) {
  actor(() => {
    rrect(c, x - 70, y, 140, 90, 18); c.fillStyle = '#2E3A58'; c.fill();
    line(c, x, y + 6, x + dx, y - 70, 16, '#9AA4C0');
    circle(c, x + dx, y - 78, 26, '#E8564C');
  });
  return [x + dx, y - 78];
}
// the lab's panel (screen space): DELAY and its value; under it a TICKLE bar (level 0..1). k pops it in; hot 0..1 (the
// number turns yellow)
function tkReadout(x, y, val, k, hot, level, t) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 1.8), n = 10;
  screenSpace();
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -180, -130, 360, 260, 24); c.fillStyle = '#16244A'; c.fill(); c.lineWidth = 6; c.strokeStyle = hot > 0.5 ? '#FFD447' : 'rgba(127,233,255,0.6)'; c.stroke();
  paint(() => {
    c.font = '900 32px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7FE9FF'; c.fillText('DELAY', 0, -94);
    c.font = '400 96px Anton'; c.fillStyle = hot > 0.5 ? '#FFD447' : '#FFFFFF'; c.fillText(val, 0, -22);
    c.font = '900 26px Montserrat'; c.fillStyle = '#C8FFE6'; c.fillText('TICKLE', 0, 50);
    for (let i = 0; i < n; i++) {
      const on = (i + 0.5) / n <= level, col = i >= n - 2 ? '#FF5A6E' : i >= n - 5 ? '#FFD447' : '#4DFFB4';
      rrect(c, -150 + i * 30.5, 74, 25, 34, 6); c.fillStyle = on ? col : 'rgba(255,255,255,0.09)'; c.fill();
    }
  });
  c.restore();
  softDot(gctx, x, y - 20 * s, 220 * s, hot > 0.5 ? '#FFD447' : '#4A7CFF', 0.12 + 0.18 * hot);
  for (let i = 0; i < n; i++) if ((i + 0.5) / n <= level) softDot(gctx, x + (-137 + i * 30.5) * s, y + 91 * s, 26 * s, i >= n - 2 ? '#FF5A6E' : i >= n - 5 ? '#FFD447' : '#4DFFB4', 0.4);
}
// a little robot arm for a thought bubble (screen space)
function tkMiniRobot(x, y, s, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -40, 20, 80, 40, 10); c.fillStyle = '#2E3A58'; c.fill();
  line(c, 0, 20, -30, -40, 22, '#C9D1E6'); line(c, -30, -40, 40, -60, 18, '#E8ECF7');
  circle(c, -30, -40, 14, '#AEB7D0'); rrect(c, 36, -76, 34, 32, 12); c.fillStyle = '#FF86B6'; c.fill();
  c.restore();
}
