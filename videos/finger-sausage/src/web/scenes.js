// Why Is There a SAUSAGE Between Your Fingers? 🌭 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js.
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
E.linear = E.linear || ((x) => x);
E.inBack = E.inBack || ((x, s = 1.7) => (s + 1) * x * x * x - s * x * x);
E.outBounce = E.outBounce || ((x) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
});
function shotOf(id) { return TLd.shots.find((s) => s.id === id); }

// ---------------------------------------------------------------- the light of each place
// the bus at night: the ceiling strip is the key (cool, from above), the street lamps through the windows behind give
// a warm rim from the upper right; the brain's room is lit by its monitors
const BUS_LIGHT = { ...LIGHTS.room, key: [-0.28, -0.84, 0.56], keyTint: [0.96, 1.0, 1.07], shadowTint: [0.66, 0.68, 0.98], rimFrom: [0.8, -0.5], rim: [1.0, 0.74, 0.46], rimAmt: 1.15, pool: 0.55, poolTint: [0.4, 0.42, 0.76] };
const ROOM_LIGHT = { ...LIGHTS.screen, rim: [1.0, 0.55, 0.85] };
setLights({
  hook: BUS_LIGHT, pov: BUS_LIGHT, room: (lt) => (lt < 0.55 ? BUS_LIGHT : ROOM_LIGHT), wink: BUS_LIGHT, gone: BUS_LIGHT,
  phone: BUS_LIGHT, button: ROOM_LIGHT, loop: BUS_LIGHT, cover: BUS_LIGHT,
});

// ---------------------------------------------------------------- his faces
const FF = {
  tips: { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0.85, browY: 0.45, browTilt: 0.7, mouth: 'flat', mouthOpen: 0.15, blink: 0, cross: 1, shutL: 0, shutR: 0 },
  past: { eyeOpen: 1.2, pupil: 0.9, lookX: 0, lookY: 0, browY: 1.0, browTilt: 0.3, mouth: 'o', mouthOpen: 0.35, blink: 0, cross: 0, shutL: 0, shutR: 0 },
  calm: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.3, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.3, blink: 0, cross: 0, shutL: 0, shutR: 0 },
  wink: { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: -0.2, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0, shutL: 0, shutR: 1 },
  winkSad: { eyeOpen: 1.05, pupil: 1, lookX: 0.3, lookY: 0.2, browY: 0.9, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0, shutL: 0, shutR: 1 },
};
function faceSeq(t, seq) {
  let f = seq[0][1];
  for (let i = 1; i < seq.length; i++) {
    const [t1, g] = seq[i];
    if (t >= t1 + 0.12) f = g;
    else if (t > t1) f = lerpFace(f, g, (t - t1) / 0.12);
  }
  return f;
}

// ---------------------------------------------------------------- the hero on the bus, fingertips together at his chin
// rig-local units (sit pose, no lean): the head's middle is at (0, -282); the fingertips meet just under his chin.
const FSH = { x: 690, y: BUS.seatY + 34 * 1.15, s: 1.15 };
const HOOK_CAM = { x: 706, y: 1012, zoom: 2.9, rot: 0 };
const TIP_Y = -212, FL = 46;                 // the fingertips' line (rig-local y) and a finger's length
// A: {g (the gap between the tips, rig units), low (0..1 the hands down in his lap), face, shake}
function fsHeroPose(A) {
  let pose = Object.assign({}, POSES.sit, { lean: 0, hand: 'open' });
  const low = E.inOutSine(clamp(A.low || 0)), H = {};
  for (const sd of [-1, 1]) {
    const side = sd < 0 ? 'L' : 'R';
    const T = [sd * (A.g / 2), TIP_Y + 2 * Math.sin((A.wob || 0))];
    const up = { e: [sd * 165, -66], w: [T[0] + sd * (FL + 46), TIP_Y + 6] };
    const down = { e: [sd * 112, -112], w: [sd * 54, -44] };
    const a = armMix(up, down, low);
    pose = armAt(pose, side, a.e, a.w);
    H[side] = { T, W: a.w, low, sd };
  }
  return { pose, H };
}
// one hand from the front (rig-local, in the layer's post): a fist with the index finger out toward the middle
function fsHandFront(lc, h, pal = PAL) {
  const sd = h.sd, ang = sd < 0 ? lerp(0, -1.1, h.low) : lerp(Math.PI, Math.PI + 1.1, h.low);
  const dir = [Math.cos(ang), Math.sin(ang)], pr = [-dir[1], dir[0]];
  const Wp = h.W, C = [Wp[0] + dir[0] * 24, Wp[1] + dir[1] * 24];
  const B = [C[0] + dir[0] * 22 - pr[0] * 4 * -sd, C[1] + dir[1] * 22 - pr[1] * 4 * -sd];
  const T = [B[0] + dir[0] * FL, B[1] + dir[1] * FL];
  lc.save(); lc.translate(C[0], C[1]); lc.rotate(ang);
  // the fist: the curled fingers under the pointing one, the knuckles
  rrect(lc, -26, -20, 50, 46, 18); lc.fillStyle = pal.skin; lc.fill();
  lc.restore();
  // the index finger, a capsule from the fist to the tip
  line(lc, B[0], B[1], T[0] - dir[0] * 2, T[1] - dir[1] * 2, 21, pal.skin);
  // the thumb along the top of the fist
  lc.save(); lc.translate(C[0], C[1]); lc.rotate(ang);
  rrect(lc, -20, -26, 40, 16, 8); lc.fillStyle = mixHex(pal.skin, pal.skinSh, 0.35); lc.fill();
  lc.restore();
  paint(() => {
    lc.save(); lc.translate(C[0], C[1]); lc.rotate(ang);
    for (let i = 0; i < 3; i++) { lc.beginPath(); lc.moveTo(-18 + i * 2, -6 + i * 10); lc.quadraticCurveTo(4, -3 + i * 10, 20, -4 + i * 10); lc.lineWidth = 2.6; lc.strokeStyle = 'rgba(170,96,70,0.55)'; lc.lineCap = 'round'; lc.stroke(); }
    lc.restore();
    // the nail at the tip, on its top edge; two creases
    lc.save(); lc.translate(T[0], T[1]); lc.rotate(ang);
    rrect(lc, -15, -10, 13, 8, 4); lc.fillStyle = '#FAD4C6'; lc.fill();
    for (const u of [16, 32]) { lc.beginPath(); lc.moveTo(-u, -8); lc.quadraticCurveTo(-u - 2, 0, -u, 8); lc.lineWidth = 2.2; lc.strokeStyle = 'rgba(170,96,70,0.5)'; lc.stroke(); }
    lc.restore();
  });
  return T;
}
// the hero on the bench, from a description; returns world points
function fsHero(cam, t, A) {
  const st = { x: FSH.x + (A.dx || 0), y: FSH.y, s: FSH.s };
  const P = fsHeroPose(A);
  Object.assign(st, { pose: P.pose, face: A.face || FF.calm, noLegs: true, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0 });
  const tips = {};
  const r = charLayer(cam, st, t, { pal: PAL, post: (lc) => {
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    tips.L = fsHandFront(lc, P.H.L); tips.R = fsHandFront(lc, P.H.R);
    lc.restore();
  } });
  const wp = (p) => toWorld(st, p);
  return { st, r, head: wp([r.head[0], r.head[1]]), forehead: wp([r.head[0], r.head[1] - 40]), tipL: wp(tips.L || [0, 0]), tipR: wp(tips.R || [0, 0]) };
}
// the bus set behind him (world units); glowA lower in close-ups so the windows do not bloom through his head
function fsBus(cam, t, o = {}) {
  busInterior(cam, t, { glowA: o.glowA === undefined ? 0.4 : o.glowA, x0: cam.x - 1300 / cam.zoom, x1: cam.x + 1300 / cam.zoom });
  busStraps(cam, t, cam.x - 1300 / cam.zoom, cam.x + 1300 / cam.zoom);
  applyCam(cam);
}
// the granny beside him (world units): side = her glance, slide = she edges away down the bench
function fsGran(cam, t, o = {}) {
  applyCam(cam);
  drawPassenger(ctx, PASS.gran, { x: 912 + 120 * (o.slide || 0), y: BUS.seatY, s: 1.08, side: o.side || 0, brow: o.brow || 0, mouthO: o.mouthO || 0, lean: 0.1 * (o.slide || 0), blink: o.blink || 0 }, t);
}

// ---------------------------------------------------------------- the hook as a function of time (valid at negative time)
function hookS(tt) {
  const c = cu();
  // the tips close in to touch on "together", with a little bump; at negative time (the loop) the hands rise from his lap
  const g = tt < 0 ? 30 : lerp(30, 8, ramp(tt, 0, c.together + 0.05, E.outCubic)) + 3 * Math.sin(clamp((tt - c.together) / 0.25) * Math.PI) * (tt > c.together ? 1 : 0);
  const low = tt < 0 ? 1 - ramp(tt, -0.4, -0.04, E.outCubic) : 0;
  const face = tt < 0 ? FF.tips : faceSeq(tt, [[-1, FF.tips], [c.look - 0.1, FF.past]]);
  const push = tt < 0 ? 0 : ramp(tt, 0, 2.7, E.inOutSine);
  const sh = tt >= 0 ? shake(tt, 6 * Math.max(0, 1 - tt / 0.22), 24, 2) : [0, 0];
  return { cam: { x: HOOK_CAM.x + sh[0], y: HOOK_CAM.y + 6 * push + sh[1], zoom: HOOK_CAM.zoom + 0.08 * push, rot: 0 }, g, low, face, wob: tt * 3 };
}
function hookDraw(t, S) {
  fsBus(S.cam, t, { glowA: 0.35 });
  return fsHero(S.cam, t, { g: S.g, low: S.low, face: S.face, wob: S.wob });
}
SC.hook = (lt, t) => {
  const S = hookS(t);
  const H = hookDraw(t, S);
  // a small "boop" where the tips touch
  const c = cu(), k = popK(t, c.together, c.together + 0.35, 0.05, 0.2);
  if (k > 0.01) {
    const p = toScreen(S.cam, (H.tipL[0] + H.tipR[0]) / 2, H.tipL[1]);
    screenSpace();
    shockLines(p[0], p[1], 60, k, 8, '#FFF6D0', 3);
  }
  return { glow: 0.85 };
};
SC.loop = (lt, t) => {
  const S = hookS(t - TLd.duration);
  hookDraw(t, S);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- his view
// the copies split as he looks past: d 0 -> FSP.d; the bus sharpens and his fingers blur
function povFocus(t) { const c = cu(); return ramp(t, c.past - 0.1, c.past + 0.45, E.inOutCubic); }
function fsBlurScreen(px) {
  if (px < 0.3) return;
  const x = FS_T.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.drawImage(mainC, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${px.toFixed(1)}px)`; ctx.drawImage(FS_T, 0, 0); ctx.filter = 'none'; ctx.restore();
}
// the passengers across the aisle react to a man staring at them through his fingers
function povPass(t) {
  const c = cu();
  const sus = ramp(t, c.sausage1, c.sausage1 + 0.3), cg = popK(t, c.congrats, c.double1_end + 0.4, 0.15, 0.2);
  return { suit: { brow: 0.9 * sus, lookX: 0.4, smile: -0.3 * sus }, nurse: { side: -0.6 * cg, brow: 0.6 * cg, mouthO: 0.5 * cg } };
}
SC.pov = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, f = povFocus(t);
  const z = 1.02 + 0.05 * lt / D;
  const V = fsPovAt([540, 980], [540, 980], z);
  const back = 9 * (1 - f);
  if (back > 0.3) paint(() => { fsPovSet(V); fsBackdrop(t, { pass: povPass(t), glowA: 0.6 }); });
  else { fsPovSet(V); fsBackdrop(t, { pass: povPass(t), glowA: 0.6 }); }
  fsBlurScreen(back);
  const tint = ramp(t, c.you_are, c.you_are + 0.35);
  fsFingers(V, { d: FSP.d * f, blur: 1 + 2.2 * f, tint, sausage: ramp(t, c.floating - 0.1, c.floating + 0.25) * (1 - 0.6 * tint), t });
  // the two copies named on "seeing double", eyes as icons
  screenSpace();
  if (tint > 0.01) {
    // the one-eye ghosts: the gap left of the sausage is the left eye's alone (teal), the gap right of it the right eye's
    const [x0, x1, y, r] = fsSausageBox();
    const P0 = [V.x + (x0 - FSP.g / 2) * V.s, V.y + (y - r) * V.s], P1 = [V.x + (x1 + FSP.g / 2) * V.s, V.y + (y - r) * V.s];
    fsTag('LEFT EYE', 330, 520, FS_TEAL, popK(t, c.you_are + 0.05, shot.end, 0.25, 0.1), [P0[0], P0[1]]);
    fsTag('RIGHT EYE', 760, 520, FS_ORANGE, popK(t, c.you_are + 0.3, shot.end, 0.25, 0.1), [P1[0], P1[1]]);
  }
  // congrats: a party popper from the lower left, deadpan
  const cg = popK(t, c.congrats_end - 0.04, c.congrats_end + 0.7, 0.06, 0.25);
  if (cg > 0.01) fsConfetti(t - (c.congrats_end - 0.04), cg);
  return { glow: 0.9, zblur: 0.05 * (1 - ramp(lt, 0, 0.2)) };
};
// a pill label on a thin dashed leader (screen space); k 0..1
function fsTag(txt, x, y, col, k, to, size = 46) {
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
// a deadpan party popper: confetti from the lower left corner (screen space), u = seconds since the pop
function fsConfetti(u, k) {
  screenSpace();
  const rng = mulberry32(17), cols = ['#FFD447', '#FF5A6E', '#7FE9FF', '#4DFFB4', '#C8A8FF', '#FF9A3C'];
  // the popper itself
  ctx.save(); ctx.translate(170, 1250); ctx.rotate(-0.75); ctx.scale(k, k);
  ctx.beginPath(); ctx.moveTo(-34, 70); ctx.lineTo(34, 70); ctx.lineTo(10, -60); ctx.lineTo(-10, -60); ctx.closePath(); ctx.fillStyle = '#C8A8FF'; ctx.fill();
  paint(() => { for (let i = 0; i < 3; i++) line(ctx, -28 + i * 4, 50 - i * 36, 28 - i * 4, 40 - i * 36, 6, '#FFD447'); });
  ctx.restore();
  for (let i = 0; i < 26; i++) {
    const a = -1.35 + rng() * 0.9, v = 700 + rng() * 600, x = 200 + Math.cos(a) * v * u, y = 1210 + Math.sin(a) * v * u + 900 * u * u;
    const r = rng() * 6, sz = 10 + rng() * 10;
    ctx.save(); ctx.translate(x, y); ctx.rotate(r + u * 8); ctx.globalAlpha = clamp(k * 1.2);
    ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-sz / 2, -sz / 4, sz, sz / 2); ctx.restore();
  }
}

// ---------------------------------------------------------------- inside: the brain's room
const ROOM_F = [540, 900];
const ROOM_CAP = 1585;
// the monitors' state over time: d (how far each eye's copy sits from the middle), the slide together, the merge
function roomState(t) {
  const c = cu();
  const d = lerp(120, FSP.d, ramp(t, c.look2, c.look2 + 0.7, E.inOutCubic));
  const slide = ramp(t, c.stacks - 0.02, c.stacks + 0.36, E.inCubic);
  return { d, slide, merged: slide >= 1, mergeT: t - (c.stacks + 0.36) };
}
function roomDraw(t, o = {}) {
  const c = cu(), R = roomState(t);
  fsRoom(t);
  const mL = FS_MON.L, mR = FS_MON.R, mB = FS_MON.both;
  const tagK = ramp(t, c.each - 0.1, c.each + 0.25) * (o.noTags ? 0 : 1);
  if (!R.merged) {
    const xL = lerp(mL[0], mB[0], R.slide), xR = lerp(mR[0], mB[0], R.slide);
    fsMonitor(xL, mL[1], mL[2], mL[3], t, { eye: 'L', d: R.d, blurF: 6, tag: tagK, on: ramp(t, c.each - 0.15, c.each + 0.1) });
    fsMonitor(xR, mR[1], mR[2], mR[3], t, { eye: 'R', d: R.d, blurF: 6, tag: tagK, on: ramp(t, c.sees - 0.1, c.sees + 0.15) });
    // the split: arrows pushing each eye's fingers apart
    const ak = popK(t, c.two_views - 0.05, c.stacks - 0.05, 0.2, 0.15);
    if (ak > 0.01) {
      fsArrow(xL + mL[2] / 2 - 40, mL[1] + mL[3] / 2 - 150, 1, ak, FS_TEAL, t);
      fsArrow(xR + mR[2] / 2 + 40, mR[1] + mR[3] / 2 - 150, -1, ak, FS_ORANGE, t);
    }
  } else {
    const fl = 1 - clamp(R.mergeT / 0.25);
    fsMonitor(mB[0], mB[1], mB[2], mB[3], t, { eye: 'both', d: FSP.d, blurF: 5, tag: (o.noTags ? 0 : 1) * (1 - ramp(t, c.and_two - 0.1, c.and_two + 0.2)), flash: fl, sausage: o.sausage || 0, tint: 0.85 });
  }
  fsDesk(1450, t, Object.assign({ showDrawer: !!o.drawer }, o.desk || {}));
  fsStackButton(770, 1434, t, o.press || 0);
  brainGuy2(540, 1300 + (o.brainDY || 0), 1.0, t, o.brain || {});
  return R;
}
// a big red STACK button on the desk (room space); press 0..1
function fsStackButton(x, y, t, press) {
  rrect(ctx, x - 70, y - 18, 140, 30, 10); ctx.fillStyle = '#2A1B3A'; ctx.fill();
  const dy = 10 * clamp(press);
  ellipse(ctx, x, y - 22 + dy, 52, 20, '#B8263A');
  ellipse(ctx, x, y - 30 + dy, 52, 20, '#FF4D5E');
  softDot(gctx, x, y - 30, 70, '#FF4D5E', 0.35 + 0.4 * clamp(press));
  paint(() => { ctx.font = '900 22px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('STACK', x, y - 30 + dy); });
}
// a fat arrow pointing dir (+1 right), room space
function fsArrow(x, y, dir, k, col, t) {
  const q = E.outBack(clamp(k), 2), wob = 8 * Math.sin(t * 14);
  ctx.save(); ctx.translate(x + dir * wob, y); ctx.scale(dir * q, q);
  ctx.beginPath(); ctx.moveTo(-60, -16); ctx.lineTo(20, -16); ctx.lineTo(20, -38); ctx.lineTo(66, 0); ctx.lineTo(20, 38); ctx.lineTo(20, 16); ctx.lineTo(-60, 16); ctx.closePath();
  ctx.fillStyle = '#0B0B1A'; ctx.fill();
  ctx.scale(0.86, 0.8); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
}
function roomBrain(t) {
  const c = cu();
  const look = t < c.fingers2 ? [-0.9, -0.9] : t < c.own ? [0.9, -0.9] : t < c.look2 ? [0, -0.2] : t < c.stack ? [0, -0.9] : t < c.and_two ? [0.3, -0.5] : [0, -1];
  const mood = t < c.own ? 'calm' : t < c.look2 ? 'think' : t < c.stack ? 'worried' : t < c.overlap ? 'grin' : 'yum';
  const press = ramp(t, c.stacks - 0.18, c.stacks - 0.02, E.inCubic) * (1 - ramp(t, c.stacks + 0.25, c.stacks + 0.5));
  const shrug = popK(t, c.anyway - 0.05, c.and_two, 0.2, 0.2);
  const armR = press > 0.01 ? [lerp(176, 214, press), lerp(118, 132, press)] : shrug > 0.01 ? [lerp(176, 230, shrug), lerp(118, -60, shrug)] : null;
  const armL = shrug > 0.01 ? [lerp(-176, -230, shrug), lerp(118, -60, shrug)] : null;
  return { brain: { look, mood, armR, armL, sweat: popK(t, c.two_views, c.stack, 0.2, 0.2) }, press };
}
SC.room = (lt, t, shot) => {
  const c = cu();
  const DIVE = 0.85;
  const B = roomBrain(t);
  const sausage = ramp(t, c.overlap - 0.05, c.overlap + 0.3);
  const ro = { brain: B.brain, press: B.press, sausage };
  if (lt < DIVE) {
    // the dive: his face from the hook framing, the camera pushes into a round window on his forehead
    const u = lt / DIVE, S = hookS(t);
    S.face = FF.past;
    const H0 = fsHeroDrawNoop(S);
    const k = 1 + 9 * E.inCubic(u);
    S.cam = scaledCam(S.cam, H0.forehead, k);
    const Hh = hookDraw(t, S);
    const P = toScreen(S.cam, Hh.forehead[0], Hh.forehead[1]);
    const R = lerp(0, 120, E.outBack(clamp(u / 0.3), 2)) * k;
    const Pw = [lerp(P[0], 540, E.inOutCubic(u)), lerp(P[1], 900, E.inOutCubic(u))];
    screenSpace();
    ctx.beginPath(); ctx.arc(Pw[0], Pw[1], R, 0, 7); ctx.fillStyle = '#2B1440'; ctx.fill();   // an opaque disc first (outside the clip)
    ctx.save(); gctx.save();
    ctx.beginPath(); ctx.arc(Pw[0], Pw[1], R, 0, 7); ctx.clip();
    gctx.beginPath(); gctx.arc(Pw[0], Pw[1], R, 0, 7); gctx.clip();
    const s = lerp(0.16, 1, E.inCubic(u));
    fsPovSet({ s, x: Pw[0] - ROOM_F[0] * s, y: Pw[1] - ROOM_F[1] * s });
    roomDraw(t, ro);
    ctx.restore(); gctx.restore();
    screenSpace();
    paint(() => { ctx.beginPath(); ctx.arc(Pw[0], Pw[1], R, 0, 7); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,170,220,0.9)'; ctx.stroke(); });
    return { glow: 0.85, zblur: 0.25 * E.inCubic(u), zcx: Pw[0], zcy: Pw[1], capY: lerp(1330, ROOM_CAP, ramp(u, 0.6, 1)) };
  }
  // the push into the stacked monitor on "and two fingertips overlap into one sausage"
  const D = shot.end - shot.start;
  const pu = ramp(t, c.anyway_end - 0.1, c.and_two + 0.05, E.inOutCubic);
  const z = 1 + 0.03 * (lt - DIVE) / (D - DIVE) + 0.6 * pu;
  const F = [540, lerp(900, 720, pu)];
  fsPovSet({ s: z, x: 540 - F[0] * z, y: lerp(900, 700, pu) - F[1] * z });
  roomDraw(t, Object.assign(ro, { noTags: false }));
  // SAUSAGE! on "one sausage"
  fsBurst('SAUSAGE!', 700, 610, 0.62, popK(t, c.one_sausage - 0.05, shot.end, 0.1, 0.12), 0.12);
  return { glow: 0.85, flash: 0.25 * (1 - clamp((lt - DIVE) / 0.2)), capY: t < c.and_two ? ROOM_CAP : 1330, zblur: 0.1 * Math.sin(Math.PI * pu) };
};
// the hero's world points for a state, without drawing (used to aim the dive)
function fsHeroDrawNoop(S) {
  const P = fsHeroPose({ g: S.g, low: S.low });
  const st = { x: FSH.x, y: FSH.y, s: FSH.s };
  const r = rig(P.pose);
  return { forehead: toWorld(st, [r.head[0], r.head[1] - 40]), head: toWorld(st, r.head) };
}

// ---------------------------------------------------------------- the payoff: close one eye... sausage gone
const WINK_CAM = { x: 780, y: 1000, zoom: 1.7, rot: 0 };
SC.wink = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { ...WINK_CAM, zoom: WINK_CAM.zoom + 0.06 * lt / D };
  fsBus(cam, t, { glowA: 0.5 });
  const face = faceSeq(t, [[-1, FF.past], [c.one_eye - 0.05, FF.wink]]);
  // the granny: turns to stare at the wink, then edges away down the bench
  const side = -ramp(t, c.close, c.close + 0.3);
  const slide = ramp(t, c.eye3_end + 0.05, c.eye3_end + 0.45, E.inOutCubic);
  fsGran(cam, t, { side, brow: ramp(t, c.one_eye, c.one_eye + 0.25), slide, mouthO: popK(t, c.one_eye + 0.1, shot.end, 0.15, 0.1) * 0.6 });
  fsHero(cam, t, { g: 8, low: 0, face, wob: t * 3 });
  return { glow: 0.85 };
};
SC.gone = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const V = fsPovAt([540, 980], [540, 980], 1.07 - 0.03 * lt / D);
  fsPovSet(V);
  fsBackdrop(t, { pass: { suit: { brow: 0.9, lookX: 0.4, smile: -0.3 }, nurse: { side: -0.4, brow: 0.4 } }, glowA: 0.6 });
  const shutT = c.gone_s - 0.14, shut = t >= shutT;
  fsFingers(V, shut ? { one: 'L', blur: 3.2, tint: 0, t } : { d: FSP.d, blur: 3.2, tint: 0, sausage: 0.4, t });
  // the eyes as icons: his right eye (screen left) shuts
  fsEyeIcon(470, 490, 1.15, 1, '#FFFFFF');
  fsEyeIcon(610, 490, 1.15, shut ? 0 : 1, '#FFFFFF');
  // POOF where the sausage was
  const pk = popK(t, c.gone_s - 0.14, shot.end, 0.08, 0.15);
  if (pk > 0.01) {
    const [x0, x1, y] = fsSausageBox();
    const P = [V.x + (x0 + x1) / 2 * V.s, V.y + y * V.s];
    fsPoof(P[0], P[1], t - (c.gone_s - 0.14), pk);
    fsBurst('POOF!', P[0] + 170, P[1] + 210, 0.6, popK(t, c.gone, shot.end, 0.1, 0.15), 0.14, '#C8A8FF');
  }
  return { glow: 0.9 };
};
// a cartoon puff of smoke (screen space), u seconds old
function fsPoof(x, y, u, k) {
  screenSpace();
  const rng = mulberry32(5);
  for (let i = 0; i < 9; i++) {
    const a = rng() * 6.28, r = 40 + 120 * E.outCubic(clamp(u / 0.5)) * (0.5 + rng() * 0.6), rr = (36 + rng() * 30) * (1 - 0.4 * clamp(u / 0.8));
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.6 - 30 * u;
    ctx.globalAlpha = clamp(k) * 0.92; circle(ctx, px, py, rr, '#E9E4F4'); ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = clamp(k); circle(ctx, x, y, 46 * (1 - 0.5 * clamp(u / 0.6)), '#FFFFFF'); ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the weirdest fact: everything behind your phone is double
// his view of his phone: the screen sharp (it plays this Short: the sausage), the bus behind it doubled and soft
function fsBackdropTo(cv, V, t, o) {
  const x = cv.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
  x.setTransform(V.s, 0, 0, V.s, V.x, V.y);
  gctx.setTransform(V.s / 2, 0, 0, V.s / 2, V.x / 2, V.y / 2);
  fsBackdropC(x, t, o);
}
SC.phone = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const dk = ramp(t, c.everything - 0.1, c.behind + 0.2, E.inOutCubic) * (1 - ramp(t, c.mention_end + 0.05, c.mention_end + 0.35, E.inOutCubic));   // the far bus goes double; hushed back to one
  const dd = 230 * dk, z = 1.03 + 0.1 * lt / D;
  const V0 = fsPovAt([540, 980], [540, 980], z);
  const pass = { suit: { brow: 0.6, lookX: 0.3 }, nurse: { side: -0.3 } };
  fsBackdropTo(FS_A, { s: V0.s, x: V0.x + dd / 2, y: V0.y }, t, { pass, glowA: 0.3 });
  fsBackdropTo(FS_B, { s: V0.s, x: V0.x - dd / 2, y: V0.y }, t, { pass, glowA: 0.3 });
  const tint = popK(t, c.is_double - 0.05, c.brain3, 0.3, 0.3);
  fsTintCanvas(FS_A, FS_TEAL, tint * 0.5); fsTintCanvas(FS_B, FS_ORANGE, tint * 0.5);
  screenSpace();
  ctx.save(); ctx.filter = `blur(${(3 + 4 * dk).toFixed(1)}px)`;
  ctx.drawImage(FS_A, 0, 0); ctx.globalAlpha = dk > 0.01 ? 0.5 : 0; ctx.drawImage(FS_B, 0, 0);
  ctx.restore(); ctx.filter = 'none';
  // the phone in his left hand, sharp
  fsPhone(540 + 9 * Math.sin(t * loopW(1.3)), 820 + 7 * Math.sin(t * loopW(0.9) + 1), t, lt);
  // the brain in a round window: shh
  const bk = popK(t, c.brain3 - 0.1, shot.end, 0.25, 0.15);
  if (bk > 0.01) {
    const P = [232, 1535], R = 104 * E.outBack(clamp(bk), 2);
    screenSpace();
    ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = '#2B1440'; ctx.fill();
    ctx.save(); gctx.save();
    ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
    gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
    const s = 0.62;
    fsPovSet({ s, x: P[0] - 540 * s, y: P[1] - 1250 * s });
    fsRoom(t);
    const shh = t > c.doesnt - 0.05;
    brainGuy2(540, 1250, 1.05, t, { mood: shh ? 'shh' : 'worried', look: shh ? [0.6, 0] : [-0.8, -0.6], armL: shh ? [-20, 40] : null, fingerL: shh, sweat: shh ? 1 : 0 });
    ctx.restore(); gctx.restore();
    screenSpace();
    paint(() => { ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(255,170,220,0.9)'; ctx.stroke(); });
    fsBurst('SHH!', 400, 1450, 0.4, popK(t, c.doesnt, shot.end, 0.1, 0.12), -0.12, '#FF86A6');
  }
  // the label on the doubled bus
  fsTag('DOUBLE', 760, 560, '#7FE9FF', popK(t, c.is_double - 0.05, c.brain3 - 0.1, 0.25, 0.15));
  return { glow: 0.85 };
};
// the phone (screen space): its screen plays the sausage picture; his hand holds it from the lower left
function fsPhone(x, y, t, lt) {
  const w = 380, h = 760, X = x - w / 2, Y = y - h / 2;
  // his right forearm in its sleeve from the lower right corner, the palm behind the phone's lower half
  ctx.beginPath(); ctx.moveTo(X + w - 120, Y + h + 40); ctx.lineTo(X + w + 70, Y + h - 60); ctx.lineTo(1240, 2000); ctx.lineTo(900, 2100); ctx.closePath();
  ctx.fillStyle = PAL.coat; ctx.fill();
  ctx.save(); ctx.translate(X + w - 10, Y + h + 20); ctx.rotate(-0.55); rrect(ctx, -120, -40, 240, 80, 34); ctx.fillStyle = PAL.coatSh; ctx.fill(); ctx.restore();
  rrect(ctx, X + 40, Y + h - 300, w + 10, 330, 120); ctx.fillStyle = FS_SKIN; ctx.fill();
  // three fingertips curling round the left edge
  for (let i = 0; i < 3; i++) { rrect(ctx, X - 30, Y + h - 330 + i * 78, 74, 64, 30); ctx.fillStyle = i % 2 ? '#EDA987' : FS_SKIN; ctx.fill(); }
  // the phone
  rrect(ctx, X, Y, w, h, 56); ctx.fillStyle = '#15161E'; ctx.fill();
  rrect(ctx, X + 6, Y + 6, w - 12, h - 12, 50); ctx.fillStyle = '#2A2C38'; ctx.fill();
  // the screen plays this very Short: the sausage between two fingertips
  const sx = X + 18, sy = Y + 18, sw = w - 36, sh = h - 36;
  ctx.save(); rrect(ctx, sx, sy, sw, sh, 40); ctx.clip();
  const m = ctx.getTransform(), g0 = gctx.getTransform();
  gctx.save(); gctx.beginPath(); rrect(gctx, sx, sy, sw, sh, 40); gctx.clip();
  const s = sw / 760;
  const V = { s, x: sx - 160 * s, y: sy + sh * 0.46 - FSP.tipY * s };
  fsPovSet(V);
  paint(() => fsBackdrop(t, { glowA: 0.4 }));
  fsFingers(V, { d: FSP.d, blur: 1.5, tint: 0, sausage: 0.8, t, clip: (cc) => { rrect(cc, sx, sy, sw, sh, 40); } });
  ctx.setTransform(m); gctx.setTransform(g0);
  rrect(ctx, sx + 30, sy + sh - 40, sw - 60, 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  rrect(ctx, sx + 30, sy + sh - 40, (sw - 60) * (0.2 + 0.6 * ((lt / 6) % 1)), 8, 4); ctx.fillStyle = '#FF5A6E'; ctx.fill();
  ctx.restore(); gctx.restore();
  softDot(gctx, x, y, 400, '#BFD8FF', 0.18);
  // his thumb on the right edge, in front
  ctx.save(); ctx.translate(X + w + 4, Y + h - 250); ctx.rotate(-0.35); rrect(ctx, -38, -90, 76, 180, 36); ctx.fillStyle = '#EDA987'; ctx.fill();
  rrect(ctx, -26, -84, 46, 40, 16); ctx.fillStyle = FS_NAIL; ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- the button: it's been hiding sausages your whole life
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const open = ramp(t, c.hiding - 0.1, c.hiding + 0.25, E.outBack) * (1 - ramp(t, c.life_end - 0.05, c.life_end + 0.12, E.inCubic));
  const slam = t > c.life_end + 0.12 ? clamp((t - c.life_end - 0.12) / 0.5) : 0;
  const pop = ramp(t, c.sausages - 0.05, c.sausages + 0.7, E.linear);
  const z = 1.22 + 0.1 * lt / D;
  fsPovSet({ s: z, x: 540 - 540 * z, y: 930 - 1460 * z });
  const cover = ramp(t, c.sausages + 0.15, c.sausages + 0.45, E.outBack) * (1 - ramp(t, c.life_end - 0.2, c.life_end - 0.05));
  const shove = t > c.life_end - 0.2 && t < c.life_end + 0.45;
  const brain = {
    look: t < c.sausages + 0.2 ? [0, 0.9] : [0, 0], mood: slam > 0 ? 'grin' : 'worried', sweat: slam > 0 ? 0 : 1,
    armL: shove ? [-60, 210] : cover > 0.01 ? [lerp(-176, -95, cover), lerp(118, 225, cover)] : null,
    armR: shove ? [60, 210] : cover > 0.01 ? [lerp(176, 95, cover), lerp(118, 225, cover)] : null,
  };
  roomDraw(t, { brain, drawer: true, desk: { drawer: open, pop: pop * (1 - slam), slam: slam > 0 ? slam : 0 }, noTags: true });
  fsBurst('SLAM!', 720, 950, 0.55, popK(t, c.life_end + 0.1, shot.end, 0.08, 0.15), 0.12, '#FF5A6E');
  return { glow: 0.85, capY: 1585 };
};

// ---------------------------------------------------------------- the cover
SC.cover = (lt, t) => {
  const V = fsPovAt([540, 760], [540, 830], 1.32);
  fsPovSet(V);
  fsBackdrop(t, { pass: { suit: { brow: 0.9, lookX: 0.4 }, nurse: { side: -0.5, brow: 0.6, mouthO: 0.4 } }, glowA: 0.6 });
  fsFingers(V, { d: FSP.d, blur: 3, tint: 0, sausage: 1, t });
  screenSpace();
  bigWord('SEE THE', 540, 1120, 150, '#FFFFFF', 1, -0.03);
  bigWord('SAUSAGE?', 540, 1275, 165, '#FFD447', 1, -0.03);
  return { glow: 0.9, noCaptions: true };
};

function initScenes2() {
  initBus();
  initFsPov();
}
