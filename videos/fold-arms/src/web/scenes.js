// "Fold Your Arms the OTHER Way. Feels WRONG?" Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const faBump = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the summit: a high morning sun on the upper right, the sky's blue as the rim from the left
const SUM_LIGHT = { ...LIGHTS.day, pool: 0.32, halo: 0.08 };
// the cockpit: lit by its sign and monitor, the red beacons as the rim
const CPIT_LIGHT = { ...LIGHTS.screen, rim: [1.0, 0.42, 0.5], rimAmt: 0.9, pool: 0.5 };
setLights({
  hook: SUM_LIGHT, back: SUM_LIGHT, twins: SUM_LIGHT, pilot: SUM_LIGHT, loop: SUM_LIGHT, cover: SUM_LIGHT,
  answer: (lt, t) => (t < cu().dive1 ? SUM_LIGHT : CPIT_LIGHT), usual: CPIT_LIGHT, hand: CPIT_LIGHT,
});

// ---------------------------------------------------------------- his faces
const FF = {
  cool: { eyeOpen: 0.82, pupil: 1, lookX: 0.1, lookY: 0, browY: 0.2, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.32, blink: 0.22, cross: 0, browL: 0.7 },
  huh: { eyeOpen: 1.22, pupil: 0.85, lookX: 0, lookY: 0.1, browY: 1.15, browTilt: 0.3, mouth: 'o', mouthOpen: 0.32, blink: 0, cross: 0 },
  focus: { eyeOpen: 1.05, pupil: 0.95, lookX: 0, lookY: 1, browY: 0.5, browTilt: 1.1, mouth: 'grimace', mouthOpen: 0.7, blink: 0, cross: 0 },
  stuck: { eyeOpen: 1.3, pupil: 0.62, lookX: 0, lookY: 0.95, browY: 1.4, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.5, blink: 0, cross: 0 },
  strain: { eyeOpen: 0.9, pupil: 0.9, lookX: 0, lookY: 0.8, browY: 0.4, browTilt: 1.3, mouth: 'grimace', mouthOpen: 1, blink: 0.15, cross: 0.4 },
  bliss: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.9, browTilt: -0.35, mouth: 'grin', mouthOpen: 0.75, blink: 1, cross: 0 },
  calm: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.15, browTilt: 0, mouth: 'grin', mouthOpen: 0.3, blink: 0, cross: 0 },
  side: { eyeOpen: 1.02, pupil: 1, lookX: 1, lookY: 0.15, browY: 0.5, browTilt: 0.2, mouth: 'flat', mouthOpen: 0.25, blink: 0, cross: 0 },
  down: { eyeOpen: 1.1, pupil: 0.95, lookX: 0.8, lookY: 0.9, browY: 0.9, browTilt: 0.4, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 0 },
};
const faFace = (a, b, k) => lerpFace(a, b, clamp(k));

// ---------------------------------------------------------------- small graphics (screen space)
function faPill(txt, x, y, col, k, size = 42, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, 2); });
  ctx.restore();
}
// a fat arrow from a to b (screen space), popping in with k
function faArrow(ax, ay, bx, by, k, col) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2), ex = lerp(ax, bx, s), ey = lerp(ay, by, s);
  const a = Math.atan2(ey - ay, ex - ax);
  for (const [w, cc] of [[22, '#0B0B1A'], [12, col]]) {
    line(ctx, ax, ay, ex - Math.cos(a) * 18, ey - Math.sin(a) * 18, w, cc);
    ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * (w / 2), ey + Math.sin(a) * (w / 2));
    ctx.lineTo(ex - Math.cos(a) * 40 - Math.sin(a) * (22 + w / 2), ey - Math.sin(a) * 40 + Math.cos(a) * (22 + w / 2));
    ctx.lineTo(ex - Math.cos(a) * 40 + Math.sin(a) * (22 + w / 2), ey - Math.sin(a) * 40 - Math.cos(a) * (22 + w / 2));
    ctx.closePath(); ctx.fillStyle = cc; ctx.fill();
  }
}
// a round window into the cockpit at screen point wc, radius R; view V; cockpit options o. The opaque disc goes
// first (outside the clip), then the cockpit inside the clip (main and glow layers), then a metal rim.
function faWindow(wc, R, V, t, o, rim = true) {
  if (R <= 1) return;
  screenSpace();
  ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.fillStyle = '#0E1834'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.arc(wc[0], wc[1], R, 0, 7); gctx.clip();
  faCockpit(V, t, o);
  ctx.restore(); gctx.restore();
  screenSpace();
  if (rim) {
    ctx.lineWidth = Math.max(10, R * 0.09); ctx.strokeStyle = '#B8C2D6'; ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.stroke();
    paint(() => {
      ctx.lineWidth = Math.max(3, R * 0.025); ctx.strokeStyle = '#6A7590'; ctx.beginPath(); ctx.arc(wc[0], wc[1], R + R * 0.03, 0, 7); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.39; circle(ctx, wc[0] + Math.cos(a) * R, wc[1] + Math.sin(a) * R, Math.max(3, R * 0.03), '#5A6480'); }
    });
  }
}

// ---------------------------------------------------------------- him on the summit (rig arms off; fa_arms.js draws them)
// o: {x, y, s, face, A: {f, knot, wob, tw, strain, big}, headRot, headDX, headDY, pal, lean, seed}
function faHero(cam, t, o) {
  const pose = { ...POSES.stand, hand: 'open', lean: o.lean || 0 };
  const st = { x: o.x === undefined ? FAW.hx : o.x, y: o.y === undefined ? FAW.hy : o.y, s: o.s || FAW.hs, pose, face: o.face, noArms: true,
    headRot: o.headRot || 0, headDX: o.headDX || 0, headDY: (o.headDY || 0) + 1.2 * Math.sin(t * loopW(2.1) + (o.seed || 0)), seed: o.seed || 3 };
  let hands = null;
  const pal = o.pal || PAL;
  const r = charLayer(cam, st, t, { pal, post: (lc, rr, s2) => { hands = faArmsPost(lc, s2, o.A || { f: 1 }, pal, t); } });
  applyCam(cam);
  const hw = [st.x + (r.head[0] + st.headDX) * st.s, st.y + (r.head[1] + st.headDY) * st.s];
  const toW = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  return { st, r, hands, headW: hw, head: toScreen(cam, hw[0], hw[1]), toW, sc: cam.zoom * st.s };
}

// ================================================================ the hook: frame 1 and round it (valid at negative time)
// tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookState(tt) {
  const c = cu();
  // frame 1: his arms already swinging into his usual fold (screen-right forearm on top); before it they rise from open
  let f = E.inOutCubic(inv(-0.6, 0.42, tt)), knot = 0, wob = 0, strain = 0;
  let face = FF.cool;
  if (tt > c.now1 - 0.12) {
    const un = clamp(snapRamp(tt, c.now1 - 0.04, c.now1 + 0.24, { over: 1.3 }), -0.2, 1.15);
    const go = E.inOutCubic(inv(c.fold2 + 0.02, c.knot - 0.04, tt));
    f = 1 - un - 0.85 * go;
    wob = 1.25 * Math.sin(Math.PI * inv(c.fold2 - 0.04, c.knot + 0.02, tt));
    knot = inv(c.knot - 0.09, c.knot + 0.09, tt);
    face = faFace(FF.cool, FF.huh, ramp(tt, c.now1 - 0.1, c.now1 + 0.1));
    face = faFace(face, FF.focus, ramp(tt, c.fold2 - 0.05, c.fold2 + 0.15));
    face = faFace(face, FF.stuck, ramp(tt, c.knot - 0.04, c.knot + 0.1));
    strain = ramp(tt, c.knot, c.knot + 0.3);
  }
  return { A: { f, knot, wob, tw: 1, strain }, face, headRot: -0.04 * ramp(tt, c.knot, c.knot + 0.2) };
}
// the safe area (13 Nov): his folded arms span about 260 rig units, so at zoom 2.9 they fill x 60-870, left of centre,
// clear of the like/comment column (x >= 880 below y 1050); his head is still about 460 px tall (a tight opening)
function hookCam(tt) { return camKeys(tt, [[-1, 561, 1340, 2.85], [0, 561, 1340, 2.9], [3.2, 561, 1343, 2.98]], E.inOutSine); }
const FA_TRIPOD_X = 745;   // hook and loop: the self-timer camera just right of him, its lens in frame
function hookDraw(t, tt, cam, extra = {}) {
  const S = hookState(tt);
  faFar(cam, t, { dy: 0 });
  faGround(cam, t);
  faTripod(cam, t, FA_TRIPOD_X, FAW.hy, { lamp: Math.sin(t * loopW(9)) > 0 ? 1 : 0, flash: extra.flash || 0 });
  const Hh = faHero(cam, t, { face: S.face, A: S.A, headRot: S.headRot });
  return Hh;
}
SC.hook = (lt, t, shot) => {
  const c = cu(), cam = hookCam(t);
  const fl = faBump(t, c.flash, 7) * (t >= c.flash ? 1 : 0);
  const Hh = hookDraw(t, t, cam, { flash: fl });
  // the sweat of the knot
  const sw = toScreen(cam, ...Hh.toW([60, -500]));
  sweatDrop(ctx, sw[0], sw[1], 2.0, popK(t, c.knot + 0.15, shot.end + 1, 0.12, 0.1));
  // the self-timer's flash (the camera is just off the right edge)
  if (fl > 0.01) { const L = toScreen(cam, FA_TRIPOD_X - 81, FAW.hy - 393); screenSpace(); softDot(gctx, L[0], L[1], 300, '#FFFFFF', 0.5 * fl); }
  return { glow: 0.85, flash: 0.18 * fl };
};

// ================================================================ the answer: feels wrong? you just switched OFF your autopilot
const FA_WIN_LOCAL = [0, -560];          // rig-local: the top of his head (the window's centre)
function faCockpitAnswer(t) {
  const c = cu();
  const offK = ramp(t, c.off - 0.02, c.off + 0.04);
  const fly = inv(c.off, c.off + 0.9, t);
  return {
    on: 0, alarm: 1, flipPop: faBump(t, c.off, 6), arms: { f: -0.4, knot: 1, wob: 0, manual: 1, strain: 1 },
    levers: [0.35 * Math.sin(t * 23), -0.35 * Math.sin(t * 19 + 1)],
    pilot: { mood: 'wow', cap: 'blue', headset: true, armL: [-210, -150 - 30 * Math.sin(t * 20)], armR: [210, -150 - 30 * Math.sin(t * 17)], bob: 6 * Math.sin(t * 30) },
    flyMug: offK > 0 ? { x: 700 + 220 * fly, y: 1000 - 520 * fly + 600 * fly * fly, rot: 5 * fly, k: 1 } : null,
    counter: 9999,
  };
}
SC.answer = (lt, t, shot) => {
  const c = cu();
  const dk = inv(c.dive0, c.dive1, t);
  if (t < c.dive1) {
    const cam0 = camKeys(lt, [[0, 566, 1300, 2.7], [c.dive0 - shot.start, 566, 1296, 2.8]], E.inOutSine);
    const winW = [FAW.hx + FA_WIN_LOCAL[0], FAW.hy + FA_WIN_LOCAL[1]];
    const zk = lerp(1, 4.76, E.inCubic(dk));
    const cam = scaledCam(cam0, winW, zk);
    faFar(cam, t, { dy: -150 });
    faGround(cam, t);
    const Hh = faHero(cam, t, { face: faFace(FF.stuck, FF.strain, 0.5 + 0.5 * Math.sin(t * 6)), A: { knot: 1, tw: 1, strain: 1 }, headRot: -0.04 });
    const sw = toScreen(cam, ...Hh.toW([66, -500]));
    sweatDrop(ctx, sw[0], sw[1], 2.0 * zk, 1);
    // the window opens on the top of his head, then the camera dives through it
    const wc0 = toScreen(cam, ...winW);
    const R0 = 118 * E.outBack(clamp((t - c.win) / 0.3), 1.6);
    const wc = [lerp(wc0[0], 540, E.inCubic(dk)), lerp(wc0[1], 960, E.inCubic(dk))];
    const R = R0 * zk * (1 + 2.2 * dk);
    const s0 = 0.215;
    const V = { x: wc[0], y: wc[1], s: s0 * zk, cx: 540, cy: lerp(840, 960, dk) };
    faWindow(wc, R, V, t, faCockpitAnswer(t), dk < 0.85);
    return { glow: 0.85, zblur: 0.3 * Math.sin(Math.PI * dk), zcx: wc[0], zcy: wc[1] };
  }
  // inside: the cockpit, full frame, alarms on; the sign punches on OFF
  const li = t - c.dive1;
  const V = { x: 540, y: 960 + 6 * Math.sin(t * 40) * faBump(t, c.off, 5), s: 1.0 + 0.03 * li, cx: 540, cy: 900 };
  faCockpit(V, t, faCockpitAnswer(t));
  return { glow: 0.9, focus: [540, 470], shake: 0 };
};

// ================================================================ back: switch back... ahh. autopilot.
SC.back = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // a low camera: the horizon drops, he stands against the sky, left of the middle; the tripod on the right
  const cam = camKeys(lt, [[0, 612, 1360, 2.0], [D, 606, 1356, 2.1]], E.inOutSine);
  faFar(cam, t, { dy: 160 });
  faGround(cam, t);
  faTripod(cam, t, 810, FAW.hy, { lamp: Math.sin(t * loopW(9)) > 0 ? 1 : 0 });
  // the knot pops open on "Switch", the usual fold snaps back on "back"
  const open = inv(c.switch - 0.02, c.switch + 0.16, t);
  const knot = 1 - open;
  const fold = clamp(snapRamp(t, c.back - 0.02, c.back + 0.3, { over: 1.4 }), 0, 1.08);
  let face = faFace(FF.stuck, FF.huh, ramp(t, c.switch, c.switch + 0.15));
  face = faFace(face, FF.calm, ramp(t, c.back, c.back + 0.2));
  face = faFace(face, FF.bliss, ramp(t, c.ahh - 0.08, c.ahh + 0.12));
  const Hh = faHero(cam, t, { face, A: { f: fold, knot, tw: 1 }, headRot: 0.05 * ramp(t, c.ahh, c.ahh + 0.4), lean: -0.02 * ramp(t, c.ahh, c.ahh + 0.4) });
  faNear(cam, t);
  // "Autopilot.": a round window pops up above his head: the sign is green again and the pilot sips his coffee
  const wk = E.outBack(clamp((t - c.auto2 + 0.06) / 0.28), 1.7);
  if (wk > 0.01) {
    const hd = Hh.head, wc = [hd[0] + 262, hd[1] - 46];
    screenSpace();
    // the stem from his head (a thought bubble up and to the right, clear of the top of the frame)
    for (let i = 0; i < 3; i++) circle(ctx, lerp(hd[0] + 110, wc[0] - 110, 0.2 + 0.25 * i), lerp(hd[1] - 60, wc[1] + 40, 0.2 + 0.25 * i), (10 + 5 * i) * wk, '#B8C2D6');
    faWindow(wc, 140 * wk, { x: wc[0], y: wc[1], s: 0.29 * wk, cx: 540, cy: 790 }, t, {
      on: 1, alarm: 0, arms: { f: 1, manual: 0 }, levers: [0, 0], counter: 9999,
      pilot: { mood: 'grin', shut: 1, cap: 'blue', headset: true, armR: [96, 40], mug: { x: 96, y: 10, rot: -0.3, s: 0.95 }, armL: [-150, 110] },
    });
  }
  const sp = popK(t, c.ahh + 0.05, shot.end + 1, 0.15, 0.1);
  if (sp > 0.01) { const hd = Hh.head; screenSpace(); for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5; softDot(gctx, hd[0] + Math.cos(a) * 190, hd[1] + Math.sin(a) * 170, 22, '#FFE7A0', 0.8 * sp); } }
  return { glow: 0.85 };
};

// ================================================================ usual: you've folded that way thousands of times... it flies itself
SC.usual = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const V = { x: 540, y: 960, s: lerp(1.0, 1.07, lt / D), cx: 540, cy: 900 };
  const roll = ramp(t, c.thousands - 0.1, c.times_end, E.inOutCubic);
  const counter = roll < 1 ? Math.floor(lerp(0, 9999, roll)) : '9,999+';
  const fly = inv(c.flies1 - 0.25, c.itself_end + 0.1, t);
  const f = 1 - 0.95 * Math.sin(Math.PI * fly);
  faCockpit(V, t, {
    on: 1, alarm: 0, arms: { f, manual: 0 }, counter, roll: 0,
    levers: [0.4 * Math.sin(Math.PI * fly) * Math.sin(Math.PI * 2 * fly), -0.4 * Math.sin(Math.PI * fly) * Math.sin(Math.PI * 2 * fly)],
    pilot: { mood: 'grin', shut: 1, cap: 'blue', headset: true, armsBehind: true, lean: -0.06, bob: 0 },
  });
  // zzz over the dozing pilot
  screenSpace();
  zzz(lerp(540, 540, 0) + 150 * V.s, 900, t, shot.start + 0.3, 1, 1.2);
  return { glow: 0.9, focus: [540, 760] };
};

// ================================================================ hand: the other way? your brain flies it... by hand.
SC.hand = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // closer than "usual" on the pilot and the levers; the sign rides above the frame's key zone, the pilot's face sits
  // above the captions (y 1330, never moved), the levers pulled in clear of the like/comment column (safe area, 13 Nov)
  const V = { x: 540, y: 960, s: lerp(1.3, 1.38, lt / D), cx: 540, cy: 960 };
  const LX = [380, 700];
  const grab = ramp(t, c.the_other - 0.05, c.the_other + 0.3, E.outBack);
  const yank = inv(c.brain - 0.1, c.hand_end, t);
  const jerk = (ph) => 0.34 * Math.sign(Math.sin(t * 14 + ph)) * Math.pow(Math.abs(Math.sin(t * 14 + ph)), 0.4) * clamp(yank * 4);
  const lv = [jerk(0), jerk(1.7)];
  // the knobs, in brain units, follow the levers
  const knob = (x0, a) => [((x0 + Math.sin(a) * 206) - 540) / 1.05, ((1262 - Math.cos(a) * 206) - 1090) / 1.05];   // in brain units
  const pk = clamp(grab);
  const armL = [lerp(-150, knob(LX[0], lv[0])[0], pk), lerp(110, knob(LX[0], lv[0])[1], pk)];
  const armR = [lerp(150, knob(LX[1], lv[1])[0], pk), lerp(110, knob(LX[1], lv[1])[1], pk)];
  const fumble = inv(c.brain - 0.1, c.hand - 0.05, t);
  const knot = inv(c.hand - 0.05, c.hand + 0.12, t);
  faCockpit(V, t, {
    on: 0, alarm: 1, arms: { f: -0.9 * fumble, wob: 1.4 * Math.sin(Math.PI * fumble), knot, manual: 1, strain: knot },
    levers: lv, leverX: LX, counter: null,   // the counter would sit under the title strip at this framing
    pilot: { mood: 'worried', cap: 'blue', headset: true, armL, armR, bob: 3 * Math.sin(t * 26) },
  });
  // sweat flying off the pilot
  screenSpace();
  const p = [540 + (540 - 540) * V.s, 960 + (1090 - V.cy) * V.s];
  for (let i = 0; i < 3; i++) sweatDrop(ctx, p[0] + (i - 1) * 190, p[1] - 230 - 30 * (i % 2), 1.6, popK(t, c.brain + 0.1 * i, shot.end + 1, 0.1, 0.1));
  return { glow: 0.9, focus: [540, 1080] };
};

// ================================================================ twins: weirdest part? identical twins... almost half fold opposite ways
const FA_PX = 470;   // the twins' labels, centred over the pair (left of the frame's centre, like the twins)
const FA_TWIN_A = 420, FA_TWIN_B = 680;   // close together: the right twin's elbow stays clear of the like/comment column
function faTwins(cam, t, o) {
  faFar(cam, t, { dy: o.dy || 0, clouds: o.clouds });
  faGround(cam, t, { twin: true, noPack: true });
  const A = faHero(cam, t, { x: FA_TWIN_A, face: o.faceA, A: o.armsA, headRot: o.rotA || 0, seed: 1 });
  const B = faHero(cam, t, { x: FA_TWIN_B, face: o.faceB, A: o.armsB, headRot: o.rotB || 0, seed: 2 });
  faNear(cam, t);
  return { A, B };
}
function twinsFaces(t) {
  const c = cu();
  let fa = FF.calm, fb = FF.calm;
  // after the fold they look at each other's arms, then at each other (deadpan)
  const lk = ramp(t, c.ways - 0.05, c.ways + 0.2), up = ramp(t, c.ways_end + 0.15, c.ways_end + 0.35);
  fa = faFace(fa, { ...FF.down, lookX: 1 }, lk); fb = faFace(fb, { ...FF.down, lookX: -1 }, lk);
  fa = faFace(fa, { ...FF.side, lookX: 1 }, up); fb = faFace(fb, { ...FF.side, lookX: -1 }, up);
  return { fa, fb };
}
SC.twins = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 598, 1268, 1.5], [D, 597, 1262, 1.55]], E.inOutSine);
  const fk = clamp(snapRamp(t, c.fold3 - 0.04, c.fold3 + 0.3, { over: 1.4 }), 0, 1.08);
  const F = twinsFaces(t);
  const T2 = faTwins(cam, t, { faceA: F.fa, faceB: F.fb, armsA: { f: 0.1 + 0.9 * fk }, armsB: { f: -0.1 - 0.9 * fk } });
  // the camera flash catches them (the timer, off to the right)
  const fl = faBump(t, c.ways_end + 0.05, 7) * (t >= c.ways_end + 0.05 ? 1 : 0);
  faPill('IDENTICAL TWINS', FA_PX, 470, '#FFD447', popK(t, c.identical - 0.02, shot.end + 1, 0.12, 0.1), 44);
  // 46 %, and a tick at each top forearm
  const nk = popK(t, c.almost, shot.end + 1, 0.14, 0.1);
  if (nk > 0.01) { screenSpace(); bigWord('46%', FA_PX, 610, 150, '#FF9A3C', nk, -0.05); }
  faPill('FOLD OPPOSITE', FA_PX, 730, '#7FE9FF', popK(t, c.opposite - 0.02, shot.end + 1, 0.12, 0.1), 36);
  const ak = popK(t, c.opposite + 0.1, shot.end + 1, 0.12, 0.1);
  if (ak > 0.01) {
    screenSpace();
    // an arrow at each top forearm: they point the opposite ways
    for (const [H, sd] of [[T2.A, 1], [T2.B, -1]]) {
      const p = toScreen(cam, ...H.toW([sd * 40, -296]));
      faArrow(p[0] + sd * 150, p[1] - 150, p[0] + sd * 40, p[1] - 40, ak, '#FFD447');
    }
  }
  return { glow: 0.85, flash: 0.16 * fl };
};

// ================================================================ pilot: same DNA... different pilot.
SC.pilot = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // a low angle, closer than the twins' two-shot: the heads against the sky, the horizon dropped (a new framing at the cut)
  const cam = camKeys(lt, [[0, 590, 1255, 1.85], [D, 590, 1250, 1.92]], E.inOutSine);
  const F = twinsFaces(t);
  const T2 = faTwins(cam, t, { faceA: faFace(F.fa, { ...FF.calm, lookX: 0.4, lookY: -1 }, ramp(t, c.different, c.different + 0.2)),
    faceB: faFace(F.fb, { ...FF.calm, lookX: -0.4, lookY: -1 }, ramp(t, c.different, c.different + 0.2)),
    armsA: { f: 1 }, armsB: { f: -1 }, dy: 170, clouds: false });
  faPill('SAME DNA', 466, 1010, '#4DFFB4', popK(t, c.same - 0.02, shot.end + 1, 0.12, 0.1), 40);
  // a window pops out of each head: two different pilots
  for (const [H, sd, cap, stache] of [[T2.A, -1, 'blue', false], [T2.B, 1, 'red', true]]) {
    const wk = E.outBack(clamp((t - c.different + 0.04 + (sd > 0 ? -0.1 : 0)) / 0.3), 1.6);
    if (wk <= 0.01) continue;
    const hd = H.head, wc = [hd[0] - sd * 12, hd[1] - 320];
    screenSpace();
    for (let i = 0; i < 3; i++) circle(ctx, lerp(hd[0], wc[0], 0.25 + 0.2 * i), lerp(hd[1] - 140, wc[1] + 140, 0.25 + 0.2 * i), (9 + 5 * i) * wk, '#B8C2D6');
    const salute = ramp(t, c.pilot - 0.05 + (sd > 0 ? 0.12 : 0), c.pilot + 0.2 + (sd > 0 ? 0.12 : 0), E.outBack);
    faWindow(wc, 140 * wk, { x: wc[0], y: wc[1], s: 0.5 * wk, cx: 540, cy: 1030 }, t, {
      on: 1, alarm: 0, arms: { f: sd < 0 ? 1 : -1 }, counter: 9999,
      pilot: { mood: 'grin', cap, stache, headset: !stache, armR: [lerp(176, 110, salute), lerp(118, -110, salute)] },
    });
  }
  return { glow: 0.85 };
};

// ================================================================ the button: now try the wrong way... FASTER. (and the loop)
SC.loop = (lt, t, shot) => {
  const c = cu(), T = TLd.duration, tt = t - T;
  // the camera eases from a slightly lower, wider framing back to frame 1's
  const back = E.inOutCubic(inv(T - 0.75, T, t));
  // it pulls back a little as the pretzel grows (the super-pretzel is the widest picture of the Short), then eases into frame 1
  const camA = camKeys(lt, [[0, 561, 1350, 2.75], [Math.max(0.1, shot.end - shot.start - 0.8), 566, 1346, 2.5]], E.inOutSine);
  const camB = hookCam(tt);
  const cam = { x: lerp(camA.x, camB.x, back), y: lerp(camA.y, camB.y, back), zoom: lerp(camA.zoom, camB.zoom, back), rot: 0 };
  // arms: the usual fold; "try the wrong way" = a spin of fumbling; FASTER = the super-pretzel; then (the last 0.62 s)
  // it springs open and the arms rise into the usual fold of frame 1
  let A, face;
  const un = clamp(snapRamp(t, c.try - 0.04, c.try + 0.22, { over: 1.3 }), -0.2, 1.15);
  const go = E.inOutCubic(inv(c.wrong2, c.faster - 0.04, t));
  const knotIn = inv(c.faster - 0.06, c.faster + 0.06, t);
  const knotOut = inv(T - 0.66, T - 0.56, t);
  if (t < T - 0.62) {
    A = { f: 1 - un - 0.9 * go, wob: 2.6 * Math.sin(Math.PI * inv(c.wrong2 - 0.05, c.faster, t)), knot: knotIn, big: 1, tw: 1, strain: ramp(t, c.faster, c.faster + 0.2) };
    face = faFace(FF.calm, FF.focus, ramp(t, c.try - 0.05, c.try + 0.15));
    face = faFace(face, FF.strain, ramp(t, c.faster - 0.05, c.faster + 0.1));
  } else {
    const S = hookState(tt);
    A = { ...S.A, knot: 1 - knotOut, big: 1 };
    face = faFace(FF.strain, S.face, ramp(t, T - 0.6, T - 0.35));
  }
  faFar(cam, t, { dy: 0 });
  faGround(cam, t);
  faTripod(cam, t, FA_TRIPOD_X, FAW.hy, { lamp: Math.sin(t * loopW(9)) > 0 ? 1 : 0 });
  const Hh = faHero(cam, t, { face, A, headRot: 0.04 * Math.sin(t * 30) * ramp(t, c.faster, c.faster + 0.1) * (1 - knotOut) });
  const sw = toScreen(cam, ...Hh.toW([60, -500]));
  sweatDrop(ctx, sw[0], sw[1], 2.0, popK(t, c.faster + 0.1, T - 0.62, 0.12, 0.08));
  return { glow: 0.85 };
};

// ================================================================ the cover (cover.sh renders it on its own)
SC.cover = (lt, t) => {
  const c = cu();
  const cam = { x: 540, y: 1267, zoom: 3.0, rot: 0 };
  faFar(cam, t, { dy: 0 });
  faGround(cam, t);
  faHero(cam, c.knot + 0.6, { face: FF.stuck, A: { knot: 1, tw: 1, strain: 1, big: 1 }, headRot: -0.05 });
  screenSpace();
  bigWord('OTHER WAY?', 540, 520, 150, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initSummit();
  initCockpit();
}
