// Can You Do the ELVIS Lip Without Squinting? 😏 (elvis-lip, 24 Nov 2026): the shots. Each SC.<id>(lt, t, shot) draws one
// frame (lt = seconds inside the shot, t = seconds in the video). Every beat comes from a cue: cu().name (timeline.json).
// The place: a photo booth in a roadside diner at night (el_world.js). On the close shots we ARE the booth's camera.
// His face can curl one side of the upper lip and squint one eye (elface.js). Sides: he curls his LEFT lip (screen-right),
// and his LEFT eye (screen-right, sqL) squints. The running device: the booth's flashes and its strip of photos.
'use strict';

const cu = () => TLd.cues;
const EL_BOOTHL = { ...LIGHTS.room, rimFrom: [0.85, -0.35], rim: [1.0, 0.5, 0.78], rimAmt: 1.15, haloColor: [1.0, 0.72, 0.5], halo: 0.12 };
const EL_DINERL = { ...LIGHTS.room, rimFrom: [0.9, -0.3], rim: [0.5, 0.92, 1.0], rimAmt: 1.05 };
setLights({ hook: EL_BOOTHL, ecu: EL_BOOTHL, open: EL_BOOTHL, booth: EL_DINERL, leash: EL_BOOTHL, again: EL_BOOTHL, eye: EL_BOOTHL,
  spill: EL_BOOTHL, step: EL_DINERL, wall: EL_DINERL, name: EL_BOOTHL, dog: EL_BOOTHL, button: EL_BOOTHL, cover: EL_BOOTHL });

// ---------------------------------------------------------------- his face, by the story's clock
const EL_F0 = { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0, browY: 0.2, browTilt: 0, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 };
function elF(o) { return Object.assign({}, EL_F0, o); }
// the test: lip curled on his left (screen-right) by sn; that eye squints by sq; strain grows with the fight
function elTest(sq, sn = 1, extra = {}) { return elF(Object.assign({ snarlL: sn, sqL: sq, strain: sn * (0.3 + 0.5 * sq) }, extra)); }
// frame 0 and the loop: the lip already curled, the eye still (just) open
const EL_SQ0 = 0.12;
function elHookFace(t) {
  const c = cu();
  // it squints by itself at about 0.6 s (the strange thing, while the viewer tries it), he fights it open at "Keep that eye",
  // and it clamps shut again on "OPEN."
  let sq = lerp(EL_SQ0, 0.82, snapRamp(t, 0.5, 0.78, { pre: 0.1, ant: 0.06, over: 1.25 }));
  sq = lerp(sq, 0.38, clamp((t - c.keep) / 0.25) * (1 - clamp((t - c.open + 0.08) / 0.12)));
  sq = Math.max(sq, lerp(0, 0.96, snapRamp(t, c.open, c.open + 0.14, { pre: 0.05, ant: 0.04, over: 1.15 })) * (t > c.open - 0.1 ? 1 : 0));
  const tremor = 0.03 * Math.sin(t * 47) * clamp((t - 0.6) / 0.3);
  return elTest(clamp(sq + tremor), 1, { lookX: 0, browR: 0.2 + 0.5 * clamp((t - c.keep) / 0.3) });
}
// he sits on the stool, his head at (452, 1010) in the diner's world
function elSeat(o = {}) {
  const pose = o.pose || POSES.sit, s = o.s || 1.0, r = rig(pose);
  return Object.assign({ x: 452 - s * r.head[0], y: 1010 - s * r.head[1], s, pose }, o);
}
// the booth camera on his face: z = zoom, (hx, hy) = the point of his head (head units) at the frame's centre (dy shifts it)
function elFaceCam(st, z, hx = 0, hy = 18) {
  const p = elHeadPt(st, hx, hy);
  return { x: p[0], y: p[1], zoom: z, rot: 0 };
}
function elHero(st, t) { return drawCharacter(ctx, st, t, EL_PAL); }
// inside the booth: the curtain behind, then him (no booth front: the camera is the booth's)
function elInside(cam, st, t, o = {}) {
  elBoothBack(cam, t, o);
  applyCam(cam);
  const r = elHero(st, t);
  applyCam(cam);
  return r;
}
// the photo the booth takes: a white print border over the frozen frame, its number in the corner. Drawn as the shot's
// `overlay` (main.js calls it after the lens), so a punch-in never crops it off the frame's edges.
function elPhotoBorder(t, t0, n) {
  const k = popK(t, t0 + 0.03, t0 + 0.4, 0.01, 0.08);
  if (k <= 0.01) return null;
  return () => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, 150); ctx.fillRect(0, H - 360, W, 360); ctx.fillRect(0, 0, 110, H); ctx.fillRect(W - 110, 0, 110, H);
    ctx.font = '900 60px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C8203E';
    ctx.fillText(`PHOTO ${n}`, 140, H - 300);
    ctx.restore();
  };
}

// ---------------------------------------------------------------- 1. the hook: the booth camera on his face, the lip curled
SC.hook = (lt, t, shot) => {
  const st = elSeat({ face: elHookFace(t) });
  const cam = elFaceCam(st, 5.2 + 0.12 * E.inOutSine(clamp(lt / 1.5)), 6, 20);
  elInside(cam, st, t);
  return { capY: 1420, flash: 0 };
};

// ---------------------------------------------------------------- 2. ECU of the snarling side: the fang, the squinting eye
SC.ecu = (lt, t, shot) => {
  const c = cu();
  const st = elSeat({ face: elHookFace(t) });
  const cam = elFaceCam(st, 9.2 + 0.4 * E.inOutSine(clamp(lt / 2.3)), 20, 16 - 4 * E.inOutSine(clamp(lt / 2.3)));
  elInside(cam, st, t);
  // the fight: shock lines off the eye when it clamps back
  const p = toScreen(cam, ...elHeadPt(st, 24, -2));
  screenSpace(); shockLines(p[0], p[1], 210, popK(t, c.keep + 0.05, c.keep + 0.5, 0.05, 0.15) * 0.8, 8, '#FFD447', 4);
  return { capY: 1430 };
};

// ---------------------------------------------------------------- 3. OPEN. (the eye clamps shut on the word): MCU, low, left
SC.open = (lt, t, shot) => {
  const c = cu();
  const st = elSeat({ face: elHookFace(t), headRot: -0.04 });
  const cam = elFaceCam(st, 3.1, -22, 58);
  elInside(cam, st, t);
  const p = toScreen(cam, ...elHeadPt(st, 50, -26));
  screenSpace();
  sweatDrop(ctx, p[0] + 30, p[1] - 20 + 60 * clamp((t - c.open) / 0.6), 1.4, popK(t, c.open + 0.05, shot.end + 1));
  return { capY: 1430 };
};

// ---------------------------------------------------------------- 4. outside: the booth at the diner, him in it; the dog
function elOutsideFace(t) {
  const c = cu();
  return elTest(0.9 + 0.04 * Math.sin(t * 9), 1, { lookX: t > c.your_lip ? 0.6 : 0 });
}
SC.booth = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 640, y: 1110 - 20 * E.inOutSine(clamp(lt / D)), zoom: 1.12 + 0.03 * E.inOutSine(clamp(lt / D)), rot: 0 };
  elDiner(cam, t, { wall: { count: 0 } });
  elBooth(t, { open: 1, strip: 0 });
  const st = elSeat({ face: elOutsideFace(t) });
  elHero(st, t);
  applyCam(cam);
  elBoothFront(t, { open: 1 });
  // the bulldog outside: it turns to him and tilts its head on "Squinting?"
  const tilt = 0.25 * E.outBack(clamp((t - c.squinting - 0.1) / 0.3));
  elDog(ctx, EL.dogX, EL.floorY, EL.dogS, t, { look: [-1, -0.2], tilt, ears: 0.6 * clamp((t - c.squinting) / 0.3), headDX: -6 });
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 5. the leash clips from his lip to his eye; FLASH 1
SC.leash = (lt, t, shot) => {
  const c = cu();
  const k = snapRamp(t, c.leash_on, c.leash_on + 0.16, { pre: 0.06, ant: 0.05, over: 1.2 });
  const yank = snapRamp(t, c.leash_end - 0.12, c.leash_end + 0.02, { pre: 0.05, ant: 0.05, over: 1.35 });
  const sq = lerp(0.86, 1.0, clamp(yank));
  const face = elTest(sq, 1, { leash: { k: clamp(k), yank: clamp(yank) }, lookY: 0.4 * clamp(k), lookX: -0.4 * clamp(k) });
  const st = elSeat({ face, headDX: 5 * clamp(yank), headRot: 0.05 * clamp(yank) });
  const cam = elFaceCam(st, 4.2, -6, 14);
  elInside(cam, st, t);
  const ov = elPhotoBorder(t, c.flash1, 1);
  return { overlay: ov || undefined, capY: 1420, flash: 0.9 * popK(t, c.flash1, c.flash1 + 0.034, 0.004, 0.02) };
};

// ---------------------------------------------------------------- 6. Again: the glass cheek, the lifting muscle (ECU, low)
function elRedo(t, t0) {   // he lets go, then curls it again on "Again."; the eye follows a moment later
  const sn = lerp(0, 1, snapRamp(t, t0 + 0.12, t0 + 0.38, { pre: 0.08, ant: 0.05, over: 1.2 }));
  const sq = lerp(0.05, 0.86, clamp((t - t0 - 0.3) / 0.25));
  return { sn: clamp(sn), sq };
}
function elXrFace(t, extra = {}) {
  const c = cu(), R = elRedo(t, c.again);
  const xk = snapRamp(t, c.that_lip - 0.12, c.that_lip + 0.05, { pre: 0.04, ant: 0.04, over: 1.15 });
  const spark = clamp((t - c.order) / (c.spills - c.order));
  const spill = clamp((t - c.spill_go) / 0.35), cinch = E.outBack(clamp((t - c.cinch) / 0.14), 1.6);
  const sq = Math.min(1, R.sq + 0.14 * cinch);
  return elTest(sq, R.sn, Object.assign({ xr: { k: clamp(xk), lift: R.sn, spark: t < c.spills ? (t > c.order ? spark : 0) : 1, spill, cinch: clamp(cinch) } }, extra));
}
SC.again = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const st = elSeat({ face: elXrFace(t) });
  // the camera travels up the muscle as it is named: from the lip ("That lip muscle") to its top by the eye ("starts right...")
  const u = E.inOutCubic(clamp((t - c.muscle) / (c.right + 0.3 - c.muscle)));
  const cam = elFaceCam(st, 6.6 + 0.4 * u, lerp(14, 12, u), lerp(34, 4, u));
  elInside(cam, st, t);
  // the top end glows on "right..."
  const p = toScreen(cam, ...elHeadPt(st, 9.5, -9));
  const gk = popK(t, c.right, shot.end + 1, 0.06, 0.1);
  if (gk > 0.01) { softDot(gctx, p[0], p[1], 120, '#FFE47A', 0.8 * gk); screenSpace(); ctx.beginPath(); ctx.arc(p[0], p[1], 46 + 8 * Math.sin(t * 12), 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFE47A', gk); ctx.stroke(); }
  return { capY: 1500 };
};

// ---------------------------------------------------------------- 7. by your eye: ECU, high, the top end right by the eye
SC.eye = (lt, t, shot) => {
  const c = cu();
  const st = elSeat({ face: elXrFace(t, { lookY: -0.3 }) });
  const cam = elFaceCam(st, 8.2 - 0.3 * E.inOutSine(clamp(lt / 1.2)), 16, 2);
  elInside(cam, st, t);
  // the eye's ring lights up as "eye" lands, a label in the key zone
  const k = popK(t, c.eye3, shot.end + 1, 0.08, 0.1);
  screenSpace();
  const p = toScreen(cam, ...elHeadPt(st, 9.5, -9));
  ctx.beginPath(); ctx.arc(p[0], p[1], 40, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFE47A', 0.9); ctx.stroke();
  bigWord('YOUR EYE', 540, 560, 96, '#7FE9FF', E.outBack(k, 2), -0.02);
  return { capY: 1500 };
};

// ---------------------------------------------------------------- 8. the spill: the LIFT spark climbs and spills into the ring
SC.spill = (lt, t, shot) => {
  const c = cu();
  const close = t >= c.cut_spill;
  const st = elSeat({ face: elXrFace(t, { lookX: close ? 0 : 0.5 }) });
  const cam = close ? elFaceCam(st, 8.6 + 0.5 * clamp((t - c.cut_spill) / 1.5), 18, 4) : elFaceCam(st, 4.7, 30, 16);
  elInside(cam, st, t);
  // the word LIFT! rides the spark up the muscle
  if (!close && t > c.order - 0.05) {
    const P = elMusclePath(st.face), u = E.inOutSine(clamp((t - c.order) / (c.spills - c.order)));
    const q = toScreen(cam, ...elHeadPt(st, lerp(P.lip[0], P.top[0], u), lerp(P.lip[1], P.top[1], u)));
    softDot(gctx, q[0], q[1], 34, '#FFE47A', 0.55);
    screenSpace(); bigWord('LIFT!', Math.min(720, q[0] + 210), q[1] + 40, 120, '#FFD447', E.outBack(clamp((t - c.order) / 0.18), 2), -0.08);
  }
  if (close) {   // the overflow, big: the ring glows and cinches
    const p = toScreen(cam, ...elHeadPt(st, 24, -2));
    softDot(gctx, p[0], p[1], 200, '#FF9A3C', 0.35 * clamp((t - c.spill_go) / 0.3));
    screenSpace(); shockLines(p[0], p[1], 330, popK(t, c.cinch, c.cinch + 0.45, 0.04, 0.2) * 0.9, 10, '#FF9A3C', 6);
  }
  return { capY: 1500 };
};

// ---------------------------------------------------------------- 9. he leans out of the booth toward the photo wall (MS)
SC.step = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cam = { x: 650 + 30 * E.inOutSine(clamp(lt / D)), y: 1110, zoom: 1.5, rot: 0 };
  elDiner(cam, t, { wall: { count: 0 } });
  elBooth(t, { open: 1, strip: 1 });
  const lean = E.outBack(clamp(lt / 0.4), 1.3);
  const st = elSeat({ face: elF({ lookX: 1, lookY: -0.3, browY: 0.7, mouth: 'o', mouthOpen: 0.3 }), headDX: 60 * lean, headRot: 0.12 * lean });
  elHero(st, t);
  applyCam(cam);
  elBoothFront(t, { open: 1 });
  elDog(ctx, EL.dogX, EL.floorY, EL.dogS, t, { look: [0.4, -1], ears: 0.4 });
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 10. the photo wall: 90 in 100 squint (the held shot)
SC.wall = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 870, y: 812 + 10 * E.inOutSine(clamp(lt / D)), zoom: 1.72 + 0.05 * E.inOutSine(clamp(lt / D)), rot: 0 };
  const cnt = 100 * E.inOutSine(clamp((t - c.ninety + 0.05) / (c.hundred_end - c.ninety + 0.05)));
  const pin = snapRamp(t, c.pin, c.pin + 0.14, { pre: 0.06, ant: 0.05, over: 1.3 });
  elDiner(cam, t, { wall: { count: cnt, pin: clamp(pin) } });
  // the counter above the board: the squinters so far (the largest thing in the frame)
  screenSpace();
  const n = Math.round(Math.min(90, cnt));
  const k = E.outBack(clamp((t - c.ninety + 0.05) / 0.2), 2);
  bigWord(String(n), 470, 520, 190, '#FF5A6E', k, -0.03);
  bigWord('/100', 650, 545, 92, '#FFFFFF', k, -0.03);
  return { capY: 1530 };
};

// ---------------------------------------------------------------- 11. the name tag, then the scroll unrolls to the floor
SC.name = (lt, t, shot) => {
  const c = cu();
  const wide = t >= c.cut_scroll;
  const tk = snapRamp(t, c.blame + 0.35, c.blame + 0.5, { pre: 0.05, ant: 0.05, over: 1.3 });
  const face = elTest(0.86, 1, { tag: { k: clamp(tk) }, lookX: wide ? 0.6 : 0, lookY: wide ? 0.9 : 0 });
  const st = elSeat({ face });
  const cam = wide ? elFaceCam(st, 2.45, 0, 150) : elFaceCam(st, 4.4, 8, 18);
  elInside(cam, st, t);
  if (wide) {
    const p = toScreen(cam, ...elHeadPt(st, 31, 30));
    const k = clamp((t - c.unroll) / (c.name_end - c.unroll + 0.15));
    elScroll(p[0] + 60, p[1], k, t, { fall: clamp((t - c.name_end + 0.05) / 0.4) });
  }
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 12. the bulldog pops into the frame: the PERFECT snarl; FLASH 3
SC.dog = (lt, t, shot) => {
  const c = cu();
  const st = elSeat({ face: elTest(0.88, 1, { lookX: 0.9, lookY: 0.2 }) });
  const cam = { x: 515, y: 1060, zoom: 2.6, rot: 0 };
  elInside(cam, st, t);
  const up = snapRamp(t, shot.start, shot.start + 0.1, { pre: 0.0, ant: 0.0, over: 1.2 });
  const sn = snapRamp(t, c.dog_snarl, c.dog_snarl + 0.14, { pre: 0.05, ant: 0.04, over: 1.25 });
  const dy = lerp(1600, 1186, clamp(up));
  elDog(ctx, 590, dy, 0.62, t, { look: [0, 0], wide: 1, snarl: clamp(sn), glint: popK(t, c.dog_snarl + 0.12, c.dog_snarl + 0.5, 0.05, 0.12), ears: 0.3 });
  const ov = elPhotoBorder(t, c.flash3, 3);
  return { overlay: ov || undefined, capY: 1330, flash: 0.9 * popK(t, c.flash3, c.flash3 + 0.034, 0.004, 0.02), focus: toScreen(cam, 590, dy - 0.62 * 232) };
};

// ---------------------------------------------------------------- 13. the button: the other side... then back to frame 0
SC.button = (lt, t, shot) => {
  const c = cu();
  const sw = snapRamp(t, c.swap, c.swap + 0.16, { pre: 0.06, ant: 0.05, over: 1.2 });
  const back = snapRamp(t, c.back, c.back + 0.14, { pre: 0.04, ant: 0.03, over: 1.1 });
  const s1 = clamp(sw) * (1 - clamp(back));
  const sqR = lerp(0, 0.84, clamp((t - c.swap - 0.22) / 0.25)) * (1 - clamp(back));
  const face = elF({ snarlL: 1 - s1, sqL: lerp(0.86, EL_SQ0, Math.max(s1, clamp(back))), snarlR: s1, sqR, strain: 0.3 + 0.4 * Math.max(sqR, 0.5 * (1 - s1)),
    browR: 0.2 * (1 - s1), browL: 0.4 * s1 });
  // the camera ends exactly where frame 0's begins (the hook's zoom at lt = 0)
  const st = elSeat({ face });
  const z = lerp(5.5, 5.2, E.inOutSine(clamp((t - (shot.end - 0.6)) / 0.5)));
  const cam = elFaceCam(st, z, 6, 20);
  elInside(cam, st, t);
  return { capY: 1420 };
};

// ---------------------------------------------------------------- the cover (cover.sh): his snarl and squint, two words
SC.cover = (lt, t, shot) => {
  const st = elSeat({ face: elTest(0.92, 1, { strain: 0.8, browR: 0.6 }) });
  const cam = elFaceCam(st, 6.2, 6, 12);
  elInside(cam, st, t);
  screenSpace();
  bigWord("DON'T SQUINT", 540, 1420, 142, '#FFD447', 1, -0.02);
  return { noCaptions: true };
};

function initScenes2() {
  initElWorld();
}
