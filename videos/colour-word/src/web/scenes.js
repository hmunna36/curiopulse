// Why Can't You Say the COLOUR, Not the Word? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a cue: cu().name
// (timeline.json), never a typed-in time. World: sky-blue's summit trail (trail.js) + the STROOP TRAIL sign, the kids and
// the props (cw_world.js). The test on the sign is drawn in post.overlay, after the light and the lens.
'use strict';

const cu = () => TLd.cues;
const cwPulse = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.06)), 0);

// ---------------------------------------------------------------- the light: a sunny summit, sun high on the right
setLights({ hook: { ...LIGHTS.day, pool: 0.2, halo: 0.05 }, autopilot: { ...LIGHTS.day, pool: 0.2, halo: 0.05 }, these: { ...LIGHTS.day, pool: 0.2, halo: 0.05 },
  kids: { ...LIGHTS.day, pool: 0.12, halo: 0.04 }, weird: { ...LIGHTS.day, pool: 0.12, halo: 0.04 }, button: { ...LIGHTS.day, pool: 0.2, halo: 0.05 },
  cover: { ...LIGHTS.day, pool: 0.2, halo: 0.05 } });

// ---------------------------------------------------------------- his faces
const CWF = {
  focus: { eyeOpen: 1.08, pupil: 0.9, lookX: -0.55, lookY: -1, browY: 0.85, browTilt: 0.95, mouth: 'o', mouthOpen: 0.32, blink: 0, cross: 0 },
  shout: { eyeOpen: 1.32, pupil: 0.7, lookX: -0.35, lookY: -0.9, browY: 1.25, browTilt: 0.2, mouth: 'scream', mouthOpen: 0.85, blink: 0, cross: 0 },
  oops: { eyeOpen: 1.22, pupil: 0.75, lookX: 0.05, lookY: 0.05, browY: 1.3, browTilt: 1.15, mouth: 'grimace', mouthOpen: 0.8, blink: 0, cross: 0 },
  sheep: { eyeOpen: 1.04, pupil: 0.9, lookX: 0, lookY: 0.12, browY: 0.95, browTilt: 1.05, mouth: 'grimace', mouthOpen: 0.42, blink: 0, cross: 0 },
  hope: { eyeOpen: 1.15, pupil: 0.85, lookX: 0.75, lookY: -0.75, browY: 1.1, browTilt: 0.5, mouth: 'flat', mouthOpen: 0.15, blink: 0, cross: 0 },
  flat: { eyeOpen: 0.82, pupil: 1, lookX: 0, lookY: 0.08, browY: 0.1, browTilt: -0.35, mouth: 'flat', mouthOpen: 0, blink: 0.38, cross: 0 },
  wow: { eyeOpen: 1.38, pupil: 0.55, lookX: -0.2, lookY: -1, browY: 1.45, browTilt: 0.35, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  gulp: { eyeOpen: 1.38, pupil: 0.5, lookX: -0.1, lookY: -0.6, browY: 1.45, browTilt: 0.4, mouth: 'scream', mouthOpen: 1, blink: 0, cross: 0 },
  say: { eyeOpen: 1.1, pupil: 0.9, lookX: -0.5, lookY: -1, browY: 0.7, browTilt: 0.3, mouth: 'o', mouthOpen: 0.5, blink: 0, cross: 0 },
  smug: { eyeOpen: 0.86, pupil: 1, lookX: 0, lookY: 0.05, browY: 0.65, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.55, blink: 0.32, cross: 0 },
  gape: { eyeOpen: 1.36, pupil: 0.6, lookX: 0.85, lookY: 0.45, browY: 1.4, browTilt: 0.35, mouth: 'o', mouthOpen: 0.85, blink: 0, cross: 0 },
  wince: { eyeOpen: 0.55, pupil: 1, lookX: 0.8, lookY: 0.5, browY: 1.2, browTilt: 1.2, mouth: 'grimace', mouthOpen: 0.6, blink: 0.55, cross: 0 },
  cool: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.4, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.75, blink: 0, cross: 0 },
};
const cwMix = (a, b, k) => lerpFace(a, b, clamp(k));

// ---------------------------------------------------------------- cameras
const CAM_T = { x: 470, y: 1086, zoom: 2.7 };   // (cwCamY keeps y at or under 904 + 486 / zoom = 1084)            // the tight shot: the sign on top, his face under it (frame 0)
const CAM_W = { x: 560, y: 1236, zoom: 1.5 };            // wide: him, the sign and a kid
// the highest the camera may sit: the sign's plank stays under the watermark row (y 405-455) at any zoom
const cwCamY = (z, y) => Math.min(y, CW.head[0] + (960 - 474) / z);
let CAM_NOW = CAM_T;
const CAP_TIGHT = 1545;   // captions in the close shots: under his chin, and a two-line caption still ends above y 1640

// ---------------------------------------------------------------- the whole Short as one state (valid at negative time)
// which row his pole points at (0..3), smoothly
function cwPoleRow(t) {
  const c = cu();
  let row = 0;
  // round two: he taps the four squiggles; the button: the four words
  c.ticks.forEach((f, i) => { row = lerp(row, i, ramp(t, f - 0.12, f, E.inOutCubic)); });
  row = lerp(row, 3, ramp(t, c.ticks[3], c.ticks[3] + 0.01));
  row = lerp(row, 0, ramp(t, c.kids - 0.3, c.kids - 0.05));
  c.reads.forEach((f, i) => { row = lerp(row, i, ramp(t, f - 0.12, f, E.inOutCubic)); });
  row = lerp(row, 0, ramp(t, c.end - 0.55, c.end - 0.15, E.inOutCubic));   // the loop: back to the top word
  return row;
}
// how the pole taps (a small jab on each tick/read and on his blurt)
function cwPoleJab(t) {
  const c = cu();
  return cwPulse(t, [...c.ticks, ...c.reads, c.blurt], 0.14);
}
// his face and mouth at time t
function cwHeroFace(t) {
  const c = cu();
  // frame 0 (and the loop's end): reading the top word, lips working
  let f = Object.assign({}, CWF.focus);
  const flap = 0.5 + 0.5 * Math.sin(t * loopW(15));
  f.mouthOpen = 0.18 + 0.3 * flap;
  f = cwMix(f, CWF.shout, ramp(t, c.blurt - 0.06, c.blurt + 0.04));
  f = cwMix(f, CWF.oops, ramp(t, c.buzz - 0.02, c.buzz + 0.1));
  f = cwMix(f, CWF.sheep, ramp(t, c.tripped - 0.1, c.tripped + 0.2));
  f = cwMix(f, CWF.hope, ramp(t, c.switch - 0.05, c.switch + 0.25));
  f = cwMix(f, CWF.flat, ramp(t, c.off_end + 0.08, c.off_end + 0.2));
  // the autopilot: he looks up at the sign as the shot opens, watches the word take off, then it dives into his mouth
  const apShot = TLd.shots.find((x) => x.id === 'autopilot'), apIn = apShot ? apShot.start : c.auto - 0.64;   // (the cover's one-shot timeline has no such shot)
  f = cwMix(f, CWF.wow, ramp(t, apIn - 0.12, apIn + 0.12));
  f = cwMix(f, CWF.gulp, ramp(t, c.straight - 0.2, c.straight + 0.1));
  const shut = ramp(t, c.mouth_end - 0.25, c.mouth_end - 0.1) * (1 - ramp(t, c.mouth_end + 0.02, c.mouth_end + 0.1));
  if (shut > 0) f = cwMix(f, Object.assign({}, CWF.gulp, { mouth: 'flat', mouthOpen: 0, eyeOpen: 1.5 }), shut);
  f = cwMix(f, CWF.shout, ramp(t, c.mouth_end + 0.02, c.mouth_end + 0.1));
  // round two: he rattles the squiggles off, then he is smug
  f = cwMix(f, CWF.say, ramp(t, c.these - 0.1, c.these + 0.1));
  if (t > c.ticks[0] - 0.15 && t < c.easy) f.mouthOpen = 0.25 + 0.45 * cwPulse(t, c.ticks, 0.18);
  f = cwMix(f, CWF.smug, ramp(t, c.easy - 0.1, c.easy + 0.15));
  // the kids: he gapes at the toddler, winces at the fall
  f = cwMix(f, CWF.gape, ramp(t, c.kids - 0.05, c.kids + 0.15));
  f = cwMix(f, CWF.wince, ramp(t, c.hardest + 0.02, c.hardest + 0.12));
  f = cwMix(f, CWF.sheep, ramp(t, c.ofall_end, c.ofall_end + 0.25));
  // the button: he reads the words out, loud and proud; shades; deadpan; and back to frame 0
  f = cwMix(f, CWF.say, ramp(t, c.nowread - 0.1, c.nowread + 0.1));
  if (t > c.reads[0] - 0.15 && t < c.easy2) f.mouthOpen = 0.35 + 0.5 * cwPulse(t, c.reads, 0.2);
  f = cwMix(f, CWF.cool, ramp(t, c.easy2 - 0.05, c.easy2 + 0.2));
  f = cwMix(f, CWF.sheep, ramp(t, c.showoff + 0.05, c.showoff + 0.3));
  // the loop: back into frame 0's face in the last half second (at negative time this is frame 0 itself)
  const back = ramp(t, c.end - 0.55, c.end - 0.12, E.inOutCubic);
  if (back > 0) { const f0 = Object.assign({}, CWF.focus); f0.mouthOpen = 0.18 + 0.3 * flap; f = cwMix(f, f0, back); }
  return f;
}
// his right arm: the READING switch (answer), a thumbs-up (round two); hanging otherwise
const ARM_HANG = null;
const ARM_SWITCH = { e: [158, -330], w: [104, -446] }, ARM_FLICK = { e: [158, -322], w: [108, -430] }, ARM_THUMB = { e: [150, -292], w: [176, -380] };
const ARM_DOWN = { e: [112, -268], w: [126, -176] };
function cwArmR(t) {
  const c = cu();
  const up = ramp(t, c.switch + 0.1, c.switch + 0.45, E.inOutCubic) * (1 - ramp(t, c.off_end + 0.3, c.off_end + 0.65, E.inOutCubic));
  if (up > 0.001) {
    const fl = ramp(t, c.off - 0.05, c.off + 0.05) * (1 - ramp(t, c.off_end, c.off_end + 0.1));
    return { arm: armMix(armMix(ARM_DOWN, ARM_SWITCH, up), ARM_FLICK, fl), hand: 'point', redraw: up > 0.6 };
  }
  const th = ramp(t, c.easy - 0.05, c.easy + 0.25, E.outBack) * (1 - ramp(t, c.notrip_end + 0.1, c.notrip_end + 0.4, E.inOutCubic));
  if (th > 0.001) return { arm: armMix(ARM_DOWN, ARM_THUMB, th), hand: 'thumb', redraw: false };
  return null;
}
// the switch: out on "switch", flicked OFF on "OFF", and it springs back ON
function cwSwitchState(t) {
  const c = cu();
  const k = ramp(t, c.switch - 0.05, c.switch + 0.2) * (1 - ramp(t, c.auto - 0.4, c.auto - 0.25));
  const off = ramp(t, c.off, c.off + 0.06) * (1 - ramp(t, c.off_end + 0.02, c.off_end + 0.18, E.outBack));
  return { k, on: 1 - off };
}
// the hero, drawn under cam. Returns trHero-like info
function cwHeroAt(cam, t, o = {}) {
  const c = cu(), row = cwPoleRow(t), jab = cwPoleJab(t);
  const ry = lerp(cwRowY(Math.floor(row)), cwRowY(Math.min(3, Math.floor(row) + 1)), row - Math.floor(row));
  // the tip rides the slate's left margin (left of every word: the pole never crosses the test), on the row he is on
  const tip = [CW.x0 + 22 + 8 * jab, ry + 2 * Math.sin(t * loopW(6))];
  const ar = cwArmR(t), sw = cwSwitchState(t);
  const shades = ramp(t, c.easy2 - 0.02, c.easy2 + 0.4) * (1 - ramp(t, c.showoff + 0.25, c.showoff + 0.6, E.inOutCubic));
  const sweat = popK(t, c.buzz + 0.1, c.auto - 0.3, 0.12, 0.1) + popK(t, c.kids + 0.3, c.through_end + 0.2, 0.12, 0.1);
  const buzzShake = cwBump(t, c.buzz, 7) * Math.sin((t - c.buzz) * 70) * 6;
  const gulpBob = 6 * cwBump(t, c.mouth_end - 0.05, 8);
  return cwHero(cam, t, {
    face: cwHeroFace(t), headRot: 0.04 * Math.sin(t * loopW(1.1)) + 0.03 * buzzShake / 6, headDX: buzzShake, headDY: gulpBob,
    bob: 2.5 * Math.sin(t * loopW(2.2)), lean: 0.012 * Math.sin(t * loopW(0.9)),
    poleTip: o.noPole ? null : tip, poleK: 1,
    armR: ar ? ar.arm : null, handR: ar ? ar.hand : 'open', redrawArmR: ar ? ar.redraw : false,
    switchK: sw.k, switchOn: sw.on, shades, sweat: clamp(sweat),
  });
}

// the place: sky, ridges, ledge, the sign's posts, him, the board (in front of him: it sits above his head)
function cwPlace(cam, t, o = {}) {
  CAM_NOW = cam;
  trSky(cam, t, { blue: 1 });
  trSun(cam, t, { blue: 1, k: 0.9, rays: 0.5 });
  cwClouds(cam, t);
  trRidges(cam, t, { blue: 1 });
  trLedge(cam, t, { blue: 1 });
  applyCam(cam);
  cwPosts(ctx);
  if (o.behindHero) { applyCam(cam); o.behindHero(); }
  const Hh = o.noHero ? null : cwHeroAt(cam, t, o);
  trGrass(cam, t, { blue: 1 });
  applyCam(cam);
  cwBoard(ctx, o.flip || 0, t);
  if (Hh && cwBoardScale(o.flip || 0) > 0.98) cwPoleFront(ctx, Hh);
  if (o.front) { applyCam(cam); o.front(Hh); }
  return Hh;
}
// clouds placed for these cameras (trail.js's set put a grey half-cloud in the top-left corner of the tight shot)
const CW_CLOUDS = [[778, 1012, 0.62], [208, 1176, 0.72], [868, 770, 0.8], [96, 742, 0.66], [716, 1300, 0.42], [430, 640, 0.9]];
function cwClouds(cam, t) {
  applyCam(cam);
  CW_CLOUDS.forEach(([x, y, sc], i) => trCloud(ctx, x + 18 * Math.sin(t * loopW(0.11) + i * 1.7), y, sc, 1, '#FFFFFF', '#D5E6FA'));
}
// which side of the sign shows, at t
function cwFlip(t) {
  const c = cu();
  return ramp(t, c.these - 0.04, c.these + 0.36, E.inOutCubic) * (1 - ramp(t, c.kids - 0.32, c.kids - 0.12));
}

// ---------------------------------------------------------------- the overlay: the test, then what flies in front of it
function cwHookOverlay(t, cam, Hh, o = {}) {
  const c = cu();
  const rows = [1, 1, 1, 1];
  // the top word leaves the board in the autopilot gag (from "the word" until the sign spins round)
  const gone = ramp(t, c.word - 0.02, c.word + 0.02) * (1 - ramp(t, c.these, c.these + 0.01));
  rows[0] = 1 - gone;
  // its red drains out on "autopilot": the letters go white while a drop forms under them
  const drain = ramp(t, c.auto + 0.1, c.auto + 0.55) * (1 - gone) * (t < c.these ? 1 : 0);
  if (drain > 0.01) rows[0] = 0;   // the word is drawn by cwFlyWord while it drains
  const ticks = o.ticks || null;
  cwTestOverlay({ cam, flip: cwFlip(t), rows, ticks });
  if (drain > 0.01 && gone < 0.5) {
    const wing = ramp(t, c.auto + 0.45, c.auto + 0.75, E.outBack);
    const hov = [CW.bx, cwRowY(0) - 6 * wing * Math.sin(t * 9)];
    cwFlyWord(cam, CW_WORDS[0][0], hov, 0.05 * wing * Math.sin(t * 7), 1, wing, t, 1 - drain, drain);
  }
  // the word flies: hovers up off the board on "the word just", dives on "barges", into his mouth on "mouth"
  if (gone > 0.5 && t < c.mouth_end + 0.05) {
    const m = Hh.mouth, p0 = [CW.bx, cwRowY(0)], up = [CW.bx + 40, CW.slate[0] - 30], mid = [CW.bx + 150, m[1] - 120];
    const a = ramp(t, c.word, c.barges, E.inOutSine), b = ramp(t, c.barges, c.mouth + 0.02, E.inCubic);
    let p = cwLerp2(p0, up, a);
    if (b > 0) { const q1 = cwLerp2(up, mid, b), q2 = cwLerp2(mid, m, b); p = cwLerp2(q1, q2, b); }
    const s = 1 - 0.75 * ramp(t, c.mouth - 0.15, c.mouth + 0.05, E.inCubic);
    const rot = b > 0 ? lerp(-0.2, 0.9, b) : 0.1 * Math.sin(t * 8);
    cwFlyWord(cam, CW_WORDS[0][0], p, rot, s * (1 - ramp(t, c.mouth + 0.02, c.mouth + 0.08)), 1, t);
  }
  // the drop (the colour): forms under the word, slides down the pole, waits politely by his mouth, gets barged off
  const dk = ramp(t, c.auto + 0.15, c.auto + 0.5, E.outBack) * (1 - ramp(t, c.mouth_end + 0.4, c.mouth_end + 0.42));
  if (dk > 0.01 && t < c.these) {
    // it squeezes out of the B to the left, then slides down the margin (left of every word), then to his mouth
    const m = Hh.mouth, mx = (CW.x0 + cwWordLeft(1)) / 2 + 2, start = [cwWordLeft(0) - 6, cwRowY(0) + 4];
    const marg = [mx, cwRowY(0) + 6], low = [mx, CW.slate[1] + 26], wait = [m[0] - 56, m[1] + 4];
    const u1 = ramp(t, c.auto + 0.45, c.auto + 0.85, E.inOutSine), u2 = ramp(t, c.word - 0.1, c.barges + 0.1, E.inOutSine), u3 = ramp(t, c.barges + 0.1, c.straight + 0.15, E.inOutSine);
    let p = cwLerp2(marg, marg, u1); void start;   // it appears in the margin beside the B (never over a test word)
    p = cwLerp2(p, low, u2); p = cwLerp2(p, wait, u3);
    // the barge: the word clips it on the way in, it spins off to the left
    const hit = ramp(t, c.mouth - 0.12, c.mouth + 0.45, E.outCubic);
    p = [p[0] - 150 * hit, p[1] - 90 * Math.sin(Math.PI * hit) + 140 * hit * hit];
    cwInkDrop(cam, p, 1.05 * dk, -8 * hit, hit > 0.02 ? 'oof' : 'calm', t, ramp(t, c.straight, c.straight + 0.2) * (1 - hit));
  }
  // his blurts: "BLUE!" (the hook), "BLUE!" again after the gulp
  const mS = toScreen(cam, Hh.mouth[0], Hh.mouth[1]);
  const b1 = popK(t, c.blurt, c.tripped + 0.35, 0.08, 0.12), b2 = popK(t, c.mouth_end + 0.04, c.these + 0.05, 0.08, 0.1);
  cwBubble('BLUE!', 770, 1250, Math.max(b1, b2), mS[0] + 70, mS[1], { size: 74, rot: -0.06 });
  // the switch's word: ON, OFF on the flick, ON again
  const sw = cwSwitchState(t);
  if (sw.k > 0.01) { const sp = toScreen(cam, Hh.head[0] + 108 * Hh.st.s, Hh.head[1] - 100 * Hh.st.s); cwSwitchWord(sp[0], sp[1], sw.k, sw.on); }
  cwBuzzX(770, 1250, popK(t, c.buzz, c.tripped + 0.35, 0.05, 0.12), 1.15);
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu();
  const cam = Object.assign({}, CAM_T, { zoom: 2.7 + 0.08 * ramp(t, 0, c.go_end, E.inOutSine) + 0.06 * ramp(t, c.switch - 0.3, c.off, E.inOutSine),
    x: 470 + 12 * ramp(t, c.switch - 0.3, c.off, E.inOutSine) });
  cam.y = cwCamY(cam.zoom, cam.y);
  const Hh = cwPlace(cam, t);
  return { glow: 0.55, capY: CAP_TIGHT, overlay: () => cwHookOverlay(t, cam, Hh) };
};

SC.autopilot = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 474, 1090, 2.55], [c.barges, 474, 1094, 2.6], [c.mouth_end, 470, 1100, 2.75], [shot.end, 470, 1100, 2.78]]);
  cam.y = cwCamY(cam.zoom, cam.y);
  const Hh = cwPlace(cam, t);
  return { glow: 0.55, capY: CAP_TIGHT, overlay: () => cwHookOverlay(t, cam, Hh) };
};

SC.these = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 470, 1088, 2.62], [c.easy, 470, 1090, 2.7], [shot.end, 476, 1092, 2.76]]);
  cam.y = cwCamY(cam.zoom, cam.y);
  const Hh = cwPlace(cam, t, { flip: cwFlip(t) });
  const ticks = c.ticks.map((f) => ramp(t, f, f + 0.12) * (1 - ramp(t, c.kids - 0.52, c.kids - 0.42)));
  return { glow: 0.55, capY: CAP_TIGHT, overlay: () => {
    cwHookOverlay(t, cam, Hh, { ticks });
    // a sparkle on his grin when he is smug ("Easy, right?")
    const k = popK(t, c.easy + 0.15, c.nowords, 0.1, 0.12);
    if (k > 0.01) {
      const p = toScreen(cam, Hh.mouth[0] + 34, Hh.mouth[1] - 4);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(p[0], p[1]); ctx.rotate(t * 3); ctx.scale(k, k);
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); for (let j = 0; j < 8; j++) { const r = j % 2 ? 7 : 26, a = j * Math.PI / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    }
  } };
};

// the toddler on her scooter: rolls in from the right on "Little kids", reads the colours off on "breeze", leaves on "But"
function cwTot(cam, t) {
  const c = cu();
  const inK = ramp(t, c.kids - 0.05, c.kids + 0.75, E.outCubic), outK = ramp(t, c.but - 0.05, c.but + 0.5, E.inCubic);
  const x = lerp(1060, 708, inK) + 560 * outK, y = TR.hy - 2, s = 0.6;
  if (x > 1300) return null;
  const roll = (inK < 1 ? 1 - inK : 0) + outK;
  const pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.hipY = -222 + 4 * Math.sin(t * 12) * roll;
  pose.armL = { a: 0.55, b: 0.2 }; pose.armR = { a: 0.35, b: 0.3 };
  const say = cwPulse(t, c.dots, 0.2);
  const f = Object.assign({}, FACES.grin, { lookX: -0.9, lookY: -0.7, eyeOpen: 1.12, mouth: say > 0.1 ? 'o' : 'grin', mouthOpen: 0.4 + 0.5 * say, browY: 0.9 });
  const st = { x, y: y - 26 * s, s, pose, face: f };
  applyCam(cam);
  actor(() => cwScooter(ctx, x + 6, y - 6, 0.85 * s / 0.5 * 0.5, t, -t * 22 * roll));
  actor(() => {
    const r = drawCharacter(ctx, st, t, CW_TOT);
    ctx.save(); ctx.translate(st.x, st.y); ctx.scale(s, s); ctx.translate(r.head[0], r.head[1]); ctx.rotate(r.lean);
    cwBeanie(ctx, t, 0.2 + 1.8 * popK(t, c.breeze - 0.1, c.through_end + 0.3) + roll);
    ctx.restore();
  });
  cwBreeze(ctx, x - 40, y - 330 * s, 1, popK(t, c.breeze - 0.05, c.through_end + 0.25, 0.1, 0.2) + 0.6 * roll, t);
  return { x, head: [x, y - 26 * s - 470 * s], st };
}
SC.kids = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 560, 1226, 1.5], [shot.end, 566, 1224, 1.52]]);
  cam.y = cwCamY(cam.zoom, cam.y);
  let tot = null;
  const Hh = cwPlace(cam, t, { front: () => { tot = cwTot(cam, t); } });
  const ticks = c.dots.map((f) => ramp(t, f, f + 0.12));
  return { glow: 0.5, overlay: () => {
    cwTestOverlay({ cam, flip: 0, ticks });
    if (tot) {
      const hs = toScreen(cam, tot.head[0], tot.head[1]);
      cwDotBubble(hs[0] - 20, hs[1] - 170, popK(t, c.breeze - 0.08, c.but + 0.1, 0.1, 0.12), (t - c.dots[0]) / 0.27 + 1, hs[0] - 30, hs[1] - 70, ['red', 'green', 'blue', 'yellow']);
    }
  } };
};

// the second-grader: marches in with his first book, reads the words out (wrong), trips flat on "hardest"
function cwKidState(t) {
  const c = cu();
  const inK = ramp(t, c.just - 0.3, c.learned + 0.2, E.outCubic);
  const fall = ramp(t, c.they_trip, c.hardest + 0.02, E.inCubic);
  return { inK, fall, x: lerp(1060, 718, inK) };
}
function cwKid(cam, t) {
  const c = cu(), S = cwKidState(t), s = 0.72, y = TR.hy;
  if (S.inK <= 0) return null;
  const walking = S.inK < 0.99;
  let pose = walking ? walkPlanted(t, { speed: 9, lift: 18, bob: 6 }) : JSON.parse(JSON.stringify(POSES.stand));
  // reading pose: the book held up in front with both hands
  const hold = ramp(t, c.learned - 0.1, c.learned + 0.15);
  if (!walking) {
    pose = armAt(pose, 'L', [-96, -270], [-52, -330]);
    pose = armAt(pose, 'R', [96, -270], [52, -330]);
  }
  const say = cwPulse(t, c.kid_reads, 0.22);
  let f = Object.assign({}, FACES.grin, { lookX: -0.85, lookY: -0.75, eyeOpen: 1.15, browY: 1.0 });
  if (hold > 0) f = Object.assign({}, f, { mouth: 'scream', mouthOpen: 0.45 + 0.5 * say });
  if (S.fall > 0.3) f = Object.assign({}, FACES.shock);
  const land = c.hardest + 0.02;
  if (t > land + 0.05) f = Object.assign({}, FACES.dazed);
  const st = { x: S.x, y, s, pose, face: f };
  applyCam(cam);
  actor(() => {
    ctx.save();
    // the fall: the whole kid tips over his feet toward the sign (screen-left), a bounce when he lands
    const bounce = t > land ? 0.08 * Math.exp(-(t - land) * 9) * Math.sin((t - land) * 30) : 0;
    ctx.translate(S.x - 30 * s, y); ctx.rotate(-Math.PI / 2 * S.fall + bounce); ctx.translate(-(S.x - 30 * s), -y);
    // backpack behind him
    ctx.save(); ctx.translate(S.x, y); ctx.scale(s, s); cwBackpack(ctx); ctx.restore();
    const r = drawCharacter(ctx, st, t, CW_KID);
    // the book in his hands (flies off when he falls)
    if (!walking) {
      const fly = ramp(t, land - 0.1, land + 0.5, E.outCubic);
      ctx.save(); ctx.translate(S.x, y); ctx.scale(s, s);
      cwBook(ctx, -10 * (1 - fly) - 260 * fly, -330 - 160 * Math.sin(Math.PI * fly) + 200 * fly * fly, 6 * fly, 1);
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(S.x, y); ctx.scale(s, s); cwBook(ctx, 120, -250, 0.4, 0.2); ctx.restore();
    }
    ctx.restore();
    void r;
  });
  cwDust(ctx, S.x - 250 * s, y + 6, 1.2, land, t);
  // dizzy stars over his head once he is down
  if (t > land + 0.1) paint(() => {
    const hx = S.x - 470 * s - 20, hy = y - 40;
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; ctx.save(); ctx.translate(hx + Math.cos(a) * 46, hy + Math.sin(a) * 14 - 30); ctx.fillStyle = '#FFD447'; ctx.beginPath(); for (let j = 0; j < 10; j++) { const rr = j % 2 ? 5 : 12, aa = j * Math.PI / 5; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
  });
  return { x: S.x, head: [S.x, y - 470 * s], fall: S.fall };
}
SC.weird = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 578, 1226, 1.5], [c.they_trip, 580, 1226, 1.5], [c.hardest + 0.1, 560, 1226, 1.52], [shot.end, 556, 1224, 1.52]]);
  const shake = cwBump(t, c.hardest + 0.02, 10) * 7;
  cam.y += shake * Math.sin((t - c.hardest) * 60);
  cam.y = cwCamY(cam.zoom, cam.y);
  let tot = null, kid = null;
  const Hh = cwPlace(cam, t, { front: () => { tot = cwTot(cam, t); kid = cwKid(cam, t); } });
  return { glow: 0.5, overlay: () => {
    cwTestOverlay({ cam, flip: 0 });
    if (kid && kid.fall < 0.3) {
      const hs = toScreen(cam, kid.head[0], kid.head[1]);
      c.kid_reads.forEach((f, i) => {
        const k = popK(t, f, i < 2 ? c.kid_reads[i + 1] : c.hardest - 0.05, 0.07, 0.06);
        cwBubble(CW_WORDS[i][0] + '!', hs[0] - 30, hs[1] - 175, k, hs[0] - 20, hs[1] - 70, { size: 62, rot: (i % 2 ? 0.06 : -0.06) });
        cwBuzzX(hs[0] - 30, hs[1] - 175, popK(t, f + 0.16, i < 2 ? c.kid_reads[i + 1] : c.hardest - 0.05, 0.04, 0.06), 0.8);
      });
    }
    // the tag: who trips hardest
    cwTag('AGES 7–9', 690, 1150, popK(t, c.hardest + 0.3, shot.end + 1, 0.1, 0.1), '#FFD447', 50, -0.05);
  } };
};

SC.button = (lt, t, shot) => {
  const c = cu();
  // the tight shot again; the last half second eases into frame 0's camera
  const cam = Object.assign({}, CAM_T, { zoom: lerp(2.74, 2.7, ramp(t, c.end - 0.6, c.end)), x: 470, y: 1086 });
  cam.y = cwCamY(cam.zoom, cam.y);
  const Hh = cwPlace(cam, t);
  const ticks = c.reads.map((f) => ramp(t, f, f + 0.12) * (1 - ramp(t, c.easy2 + 0.3, c.easy2 + 0.45)));
  return { glow: 0.55, capY: CAP_TIGHT, overlay: () => {
    cwTestOverlay({ cam, flip: 0, ticks });
    const mS = toScreen(cam, Hh.mouth[0], Hh.mouth[1]);
    c.reads.forEach((f, i) => {
      const k = popK(t, f, i < 3 ? c.reads[i + 1] : c.easy2 - 0.1, 0.06, 0.06);
      cwBubble(CW_WORDS[i][0] + '!', 770, 1250, k, mS[0] + 70, mS[1], { size: 74, rot: i % 2 ? 0.05 : -0.05 });
    });
  } };
};

// the cover: frame 0's picture a little wider, his blurt crossed out, the title idea above the sign (the Instagram grid
// crops to the middle square, y 420-1500: the sign and his face are in it)
SC.cover = (lt, t, shot) => {
  const z = 2.45, cam = { x: 470, y: CW.head[0] + (960 - 452) / z, zoom: z, rot: 0 };
  const Hh = cwPlace(cam, cu().buzz + 0.12);   // his "oops" face, a sweat drop, the pole on the top word
  return { glow: 0.55, noCaptions: true, overlay: () => {
    cwTestOverlay({ cam, flip: 0 });
    const mS = toScreen(cam, Hh.mouth[0], Hh.mouth[1]);
    cwBubble('BLUE!', 790, mS[1] - 120, 1, mS[0] + 60, mS[1], { size: 84, rot: -0.06 });
    cwBuzzX(790, mS[1] - 120, 1, 1.25);
    bigWord('SAY THE COLOUR', 540, 250, 118, '#FFD447', 1, -0.03);
    bigWord('NOT THE WORD', 540, 375, 92, '#FFFFFF', 1, -0.03);
  } };
};

function initScenes2() {
  initTrail();
}
