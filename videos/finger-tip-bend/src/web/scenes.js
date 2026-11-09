// Can You Bend Just the TIP of Your Finger? 👆 — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: cafe.js (humanity-sugar-cube's trail cafe at dusk), fist3d.js (one-finger's 3D hand), bwhand.js (bent-wrist-fist's
// forearm, glass and the puller), ft_world.js (the pointing hand, the one string, the holding hand, the menu card, the
// doctor's head mirror). The whole Short is ONE state over time (`ftS(tt)`, valid at negative time for the loop): every shot
// draws from it, so the hand never jumps between shots.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the trail cafe at dusk: the pendant lamp on the left (the key), the dusk window on the right (a pink rim)
const FT_LIGHT = { ...LIGHTS.candle, rimAmt: 1.2, pool: 0.5, halo: 0.14 };
setLights({ hook: FT_LIGHT, answer: FT_LIGHT, string: FT_LIGHT, pin: FT_LIGHT, doctors: FT_LIGHT, button: FT_LIGHT, loop: FT_LIGHT, cover: FT_LIGHT });

// his left forearm stands on the table, elbow down, the hand up beside his face (world points)
const FT = { PX: 38 };
const FT_WR = [676, 1240];
const FT_EL = [694, 1470];
const FT_PEL = [536, 1268];          // his right elbow on the table when his right hand holds the middle joint
const ftClone = (p) => JSON.parse(JSON.stringify(p));

// ---------------------------------------------------------------- the state of everything at time tt
// tt = video seconds; negative = the Short's last frames (the loop), which run into frame 1
function ftS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => (tt < 0 ? 0 : ramp(tt, a, b, e));
  // ---- the index finger: pip = the middle joint, dip = the tip's joint (rad)
  let pip = 0, dip = 0, trem = 0;
  if (tt >= 0) {
    // the hook: "Now bend only the TIP." The tip starts; the middle joint folds with it
    dip = 0.55 * r(c.bend1 - 0.05, c.only1 + 0.3, E.inOutSine);
    pip = 1.2 * r(c.only1 + 0.1, c.tip1_end - 0.05, E.outBack);
    dip = lerp(dip, 1.0, r(c.only1 + 0.1, c.tip1_end));
    trem = popK(tt, c.bend1, c.tip1_end + 0.15, 0.2, 0.25);
    // the answer: "Sorry." he straightens it; "The tip only comes as a COMBO.": he tries again, and it hooks again
    const reset = r(c.sorry - 0.1, c.sorry_end + 0.05);
    const retry = r(c.comes - 0.05, c.combo + 0.12, E.outBack);
    pip = lerp(pip, 0, reset) + 1.2 * retry * reset;
    dip = lerp(dip, 0, reset) + 1.0 * retry * reset;
    trem = Math.max(trem, popK(tt, c.the2, c.combo + 0.1, 0.2, 0.2));
    // the string: straight again through the whip; "It pulls the tip": the tip; "AND the middle joint": the middle too
    const s0 = r(c.shot_string - 0.3, c.shot_string + 0.15);
    pip = lerp(pip, 0, s0); dip = lerp(dip, 0, s0);
    dip += 0.8 * r(c.pulls - 0.05, c.tip3 + 0.35);
    pip += 1.15 * r(c.and3 - 0.05, c.joint3_end);
    dip += 0.2 * r(c.and3 - 0.05, c.joint3_end);
    // the pin: straight again for the cut; held at the middle; "and bend the tip": only the tip goes
    const p0 = r(c.shot_pin - 0.25, c.shot_pin + 0.12);
    pip = lerp(pip, 0, p0); dip = lerp(dip, 0, p0);
    dip += 1.2 * r(c.bend4 - 0.05, c.tip4_end + 0.1, E.outCubic);
    // "There it goes!": the tip waves for joy
    dip += 0.16 * Math.sin((tt - c.goes) * 15) * popK(tt, c.there, c.goes_end + 0.35, 0.1, 0.25);
    trem = Math.max(trem, 0.6 * popK(tt, c.bend4, c.tip4_end, 0.15, 0.2));
    // the button: "Let go": the hold comes off and the tip straightens; "and the combo's back.": the whole finger hooks
    const b0 = r(c.letgo + 0.05, c.go_end + 0.15);
    dip = lerp(dip, 0, b0);
    pip += 1.2 * r(c.and6 - 0.02, c.combo6 + 0.25, E.outBack) * b0;
    dip += 1.0 * r(c.and6 - 0.02, c.combo6 + 0.25) * b0;
    trem = Math.max(trem, popK(tt, c.and6, c.back, 0.15, 0.2));
    // ...and it springs straight for frame 1 (the loop)
    const L = r(c.back_end + 0.02, c.end - 0.18, E.inOutSine);
    pip = lerp(pip, 0, L); dip = lerp(dip, 0, L);
    trem *= 1 - L;
  }
  S.pip = pip; S.dip = Math.max(0, dip); S.tremble = trem;
  // ---- the hold: his other hand on the middle joint
  S.pin = tt < 0 ? 0 : r(c.hold - 0.12, c.middle4 + 0.2, E.outCubic) * (1 - r(c.letgo - 0.05, c.go_end + 0.05, E.inCubic));
  // ---- the inside: the glass, the string, the puller
  S.glass = tt < 0 ? 0 : r(c.see - 0.12, c.see + 0.25) * (tt < c.shot_button ? 1 : 0);
  S.str = tt < 0 ? 0 : r(c.see - 0.02, c.string3_end + 0.1, E.inOutSine) * (tt < c.shot_button ? 1 : 0);
  let pull = 0;
  if (tt >= 0) {
    pull = r(c.pulls - 0.05, c.tip3 + 0.35) * 0.5 + r(c.and3 - 0.05, c.joint3_end) * 0.5;
    pull *= 1 - r(c.shot_pin - 0.25, c.shot_pin + 0.12);
    pull = Math.max(pull, 0.85 * r(c.bend4 - 0.05, c.tip4_end + 0.1));
    pull *= 1 - r(c.letgo, c.go_end);
  }
  S.pull = pull;
  S.barS = BWK.barRest + 2.2 * pull;
  S.hotTip = tt < 0 ? 0 : Math.max(popK(tt, c.tip3 - 0.08, c.and3 + 0.2, 0.12, 0.15), popK(tt, c.tip4 - 0.08, c.goes_end + 0.3, 0.12, 0.2));
  S.hotMid = tt < 0 ? 0 : Math.max(popK(tt, c.middle3 - 0.08, c.shot_pin - 0.05, 0.12, 0.1), popK(tt, c.middle4 - 0.05, c.still_end + 0.2, 0.12, 0.15));
  let pm = 'calm';
  if (tt >= 0) {
    if (tt >= c.pulls - 0.05) pm = 'strain';
    if (tt >= c.joint3_end) pm = 'pant';
    if (tt >= c.shot_pin) pm = 'calm';
    if (tt >= c.bend4 - 0.05) pm = 'strain';
    if (tt >= c.there) pm = 'happy';
    if (tt >= c.congrats) pm = 'proud';
  }
  S.pupMood = pm;
  // ---- labels and props
  S.q = tt < 0 ? 0 : popK(tt, c.tip1_end - 0.12, c.shot_answer - 0.02, 0.1, 0.08);
  S.ringMid = tt < 0 ? 0 : popK(tt, c.middle2 - 0.06, c.sorry - 0.05, 0.12, 0.12);
  S.menu = tt < 0 ? 0 : popK(tt, c.the2 - 0.1, c.shot_string - 0.03, 0.18, 0.08);
  S.combo = tt < 0 ? 0 : popK(tt, c.combo - 0.03, c.shot_string - 0.03, 0.1, 0.08);
  S.bends = tt < 0 ? 0 : popK(tt, c.goes - 0.06, c.shot_doctors - 0.03, 0.08, 0.08);
  S.mirror = tt < 0 ? 0 : r(c.congrats - 0.05, c.congrats + 0.3) * (tt < c.shot_button ? 1 : 0);
  S.stamp = tt < 0 ? 0 : popK(tt, c.hand5 - 0.05, c.shot_button - 0.03, 0.12, 0.08);
  S.combo2 = tt < 0 ? 0 : popK(tt, c.combo6 - 0.04, c.back_end + 0.15, 0.1, 0.12);
  // ---- his face and head
  const lookHand = { lookX: 0.8, lookY: -0.55 };
  let f = { ...FACES.calm, ...lookHand, mouth: 'grin', mouthOpen: 0.15 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.85, browTilt: 1.2, browY: 0.5 }, r(c.bend1, c.bend1 + 0.3));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.75, lookY: -0.5 }, r(c.tip1_end - 0.15, c.tip1_end + 0.1));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.8, lookY: -0.5 }, r(c.combo, c.combo + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.15, mouth: 'o' }, r(c.see - 0.1, c.see + 0.2));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.9 }, r(c.bend4 - 0.05, c.bend4 + 0.2));
    f = lerpFace(f, { ...FACES.grin, ...lookHand, eyeOpen: 1.3, mouthOpen: 0.85 }, r(c.there - 0.05, c.there + 0.15));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.15, lookY: 0.05, eyeOpen: 1.1, mouthOpen: 0.35 }, r(c.congrats, c.congrats + 0.25));
    f = lerpFace(f, { ...FACES.grin, ...lookHand, mouthOpen: 0.3 }, r(c.check, c.check + 0.3));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.85 }, r(c.and6, c.and6 + 0.2));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.8, lookY: -0.5 }, r(c.combo6, c.combo6 + 0.2));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'grin', mouthOpen: 0.15 }, r(c.back_end + 0.05, c.end - 0.15));
  }
  f.blink = Math.max(f.blink || 0, ftBlink(tt + 1.1, 0.45));
  S.face = f;
  S.hrot = tt < 0 ? 0.03 : 0.03 - 0.07 * r(c.tip1_end - 0.1, c.tip1_end + 0.15) * (1 - r(c.sorry, c.sorry + 0.3))
    + 0.05 * r(c.congrats, c.congrats + 0.25) * (1 - r(c.check, c.check + 0.3));
  S.hdx = trem * 1.6 * Math.sin(tt * 47);
  return S;
}
function ftBlink(tt, w = 0.45) { const u = ((tt * loopW(w) / (Math.PI * 2) + 0.3) % 1 + 1) % 1; return u < 0.03 ? Math.sin(u / 0.03 * Math.PI) : 0; }

// ---------------------------------------------------------------- the cameras
// the 2D camera per section (x, y, zoom, rot; bgdy: the camera's height for the far wall), and the hand's view angles
function ftCam(tt) {
  const c = cu();
  const hook = (u) => ({ x: 628, y: lerp(1112, 1108, u), zoom: lerp(2.7, 2.82, u), rot: 0, bgdy: 0 });
  if (tt < 0 || tt >= c.shot_button) {
    const u = tt < 0 ? 1 : ramp(tt, c.shot_button, c.end, E.inOutSine);
    return { ...hook(1), zoom: lerp(2.92, 2.7, u), y: lerp(1106, 1112, u) };
  }
  if (tt < c.shot_answer) return hook(ramp(tt, 0, c.shot_answer, E.inOutSine));
  if (tt < c.shot_string) {
    // low and a little wider: the cafe's lights behind him, the menu card beside the hooked finger
    const u = ramp(tt, c.shot_answer, c.shot_string, E.inOutSine);
    return { x: lerp(618, 612, u), y: lerp(1022, 1016, u), zoom: lerp(2.1, 2.22, u), rot: 0, bgdy: 200 };
  }
  if (tt < c.shot_pin) {
    // the hand alone, closer, from a little above: the forearm and the puller in it
    const u = ramp(tt, c.shot_string, c.shot_pin, E.inOutSine);
    return { x: lerp(650, 652, u), y: lerp(1236, 1226, u), zoom: lerp(2.55, 2.68, u), rot: 0, bgdy: -150 };
  }
  if (tt < c.shot_doctors) {
    // the other side of the hand: his other hand comes in from the left
    const u = ramp(tt, c.shot_pin, c.shot_doctors, E.inOutSine);
    return { x: lerp(614, 618, u), y: lerp(1112, 1106, u), zoom: lerp(3.25, 3.4, u), rot: 0, bgdy: 80 };
  }
  // a medium shot from a little above: him, the hand, the head mirror, the stamp
  const u = ramp(tt, c.shot_doctors, c.shot_button, E.inOutSine);
  return { x: lerp(606, 610, u), y: lerp(1160, 1152, u), zoom: lerp(1.9, 2.0, u), rot: 0, bgdy: -170 };
}
function ftAng(tt) {
  const c = cu(), side = Math.PI / 2;
  let yaw = 0.22, pitch = 0.1;
  if (tt >= 0 && tt >= c.shot_answer && tt < c.shot_string) { yaw = 0.32; pitch = -0.05; }
  if (tt >= 0 && tt >= c.shot_string && tt < c.shot_pin) { yaw = 0.06; pitch = 0.2; }
  if (tt >= 0 && tt >= c.shot_pin && tt < c.shot_doctors) { yaw = 0.08; pitch = 0.12; }
  if (tt >= 0 && tt >= c.shot_doctors && tt < c.shot_button) { yaw = 0.15; pitch = 0.18; }
  return { yaw: side + yaw, pitch };
}
// the 3D camera tied to the 2D one (bent-wrist-fist): the wrist lands where the 2D camera puts the world wrist, the size
// follows the zoom, the roll follows the forearm's direction on screen
function ftView(cam, ang) {
  const sc = toScreen(cam, FT_WR[0], FT_WR[1]), el = toScreen(cam, FT_EL[0], FT_EL[1]), D = 55;
  const dx = el[0] - sc[0], dy = el[1] - sc[1], l = Math.hypot(dx, dy) || 1;
  const roll = Math.atan2(-dx / l, dy / l);
  return { yaw: ang.yaw, pitch: ang.pitch, roll, tx: 0, ty: 0, tz: 0, D, cx: sc[0], cy: sc[1],
    f: FT.PX * D * cam.zoom / 2.9, mirror: true };
}

// ---------------------------------------------------------------- him at the cafe table (his left arm is the 3D one)
function ftHero(cam, t, S) {
  const p = ftClone(POSES.stand);
  p.lean = -0.01;
  const st = { x: CF.hx, y: CF.hy, s: CF.hs, pose: p, face: S.face, noArms: true, headRot: S.hrot, headDX: S.hdx,
    headDY: 2 * Math.sin(t * loopW(1.6)), noLegs: true };
  const r = charLayer(cam, st, t, { pal: CFPAL, ambient: 0.06 });
  // nothing glows through him
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return { r, st };
}
// his left upper arm (the coat's sleeve, rolled up) from his shoulder down to the 3D forearm's elbow on the table
function ftUpperArm(cam, hero, P2) {
  const shW = toWorld(hero.st, hero.r.shR), sh = toScreen(cam, shW[0], shW[1]);
  const el = P2.pa([0, -BWK.L * 0.97, 0]);
  const w = 42 * hero.st.s * cam.zoom;
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0] - ux * w * 0.2, el[1] - uy * w * 0.2, w, CFPAL.coat);
    line(ctx, el[0] - ux * w * 0.62, el[1] - uy * w * 0.62, el[0] - ux * w * 0.18, el[1] - uy * w * 0.18, w * 1.1, CFPAL.coatSh);
  });
}
// his right arm at rest: down his side to the table, the hand on the table by the mug (screen space)
function ftRestArm(cam, hero) {
  const shW = toWorld(hero.st, hero.r.shL), sh = toScreen(cam, shW[0], shW[1]);
  const el = toScreen(cam, CF.hx - 112, CF.hy - 250), wr = toScreen(cam, CF.hx - 150, CF.hy - 196);
  const w = 42 * hero.st.s * cam.zoom;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0], el[1], w, CFPAL.coat);
    line(ctx, el[0], el[1], wr[0], wr[1], w * 0.86, CFPAL.skin);
    circle(ctx, wr[0], wr[1] + w * 0.1, w * 0.55, CFPAL.skin);
  });
}

// the whole picture at time tt (t = the video time for clocks)
function ftFrame(tt, t, o = {}) {
  const S = ftS(tt), cam = o.cam || ftCam(tt), ang = o.ang || ftAng(tt);
  const G = ftGeo({ pip: S.pip, dip: S.dip, tremble: S.tremble, t });
  CF_BGDY = cam.bgdy || 0;
  cfBack(cam, t);
  cfTable(cam);
  applyCam(cam);
  cfSaucer(ctx, 300, 1352, 1);
  cfMug(ctx, 300, 1338, 1, t);
  cfBowl(ctx, 128, 1330, 1);
  const hero = ftHero(cam, t, S);
  const V = ftView(cam, ang), P2 = bwProj(V, 0);
  screenSpace();
  // his right arm: at rest, or holding the middle joint
  const shW = toWorld(hero.st, hero.r.shL), shS = toScreen(cam, shW[0], shW[1]);
  if (S.pin < 0.02) ftRestArm(cam, hero);
  ftUpperArm(cam, hero, P2);
  if (S.pin > 0.01) ftPinHand(P2, G, S.pin, shS, 'back');
  actor(() => bwDraw(ctx, P2, G, { bulge: 0.3 * S.pull }));
  let str = null;
  if (S.glass > 0.01) bwGlass(ctx, P2, G, S.glass, { bulge: 0.3 * S.pull });
  if (S.str > 0.01) {
    bwPuppeteer(ctx, gctx, P2, { k: S.str, barS: S.barS, pull: S.pull, mood: S.pupMood, look: [0.3, -0.6], t,
      bar: () => bwBar(ctx, P2, S.barS, S.str) });
    str = ftString(ctx, gctx, P2, G, { k: S.str, barS: S.barS, pull: S.pull, slack: 1 - clamp(S.pull * 3), hotTip: S.hotTip, hotMid: S.hotMid, t });
  }
  if (S.pin > 0.01) ftPinHand(P2, G, S.pin, shS, 'front', { el: toScreen(cam, FT_PEL[0], FT_PEL[1]) });
  return { S, cam, V, P2, G, hero, str };
}

// ---------------------------------------------------------------- the overlays of each part
function ftOverlays(R, tt, t) {
  const c = cu(), S = R.S, P2 = R.P2, G = R.G;
  screenSpace();
  // the try: motion marks round the finger
  if (S.tremble > 0.05) { const q = P2.ph(G.f.I.pts[2]); ftShake(q[0], q[1], q[2] * 2.6, S.tremble * 0.8, t); }
  // "?" when the middle joint tags along
  if (S.q > 0.01) { const q = P2.ph(G.f.I.pts[1]); bigWord('?', clamp(q[0] + 120, 300, 820), clamp(q[1] - 60, 480, 980), 170, '#FF5A6E', E.outBack(S.q, 2), 0.12); }
  // the ring round the middle joint ("Middle joint bent too?")
  if (S.ringMid > 0.01) { const q = P2.ph(G.f.I.pts[1]); ftRing(q[0], q[1], q[2] * 1.9, S.ringMid, '#FF9A3C', t); }
  // the menu card and its COMBO ONLY stamp
  if (S.menu > 0.01) ftMenu(470, 672, S.menu, S.combo, 660);
  // IT BENDS!
  if (S.bends > 0.01) { const q = P2.ph(fkTip(G, 'I', 0.5)); ftBurst(clamp(q[0] + 60, 330, 760), clamp(q[1] - 200, 580, 900), 0.62, S.bends, 'IT BENDS!', '#4DFFB4', -0.1, 96); }
  // the doctor's head mirror and the stamp
  if (S.mirror > 0.01) {
    const hd = R.hero.r.head, hw = toWorld(R.hero.st, [hd[0], hd[1] - 38]), hs = toScreen(R.cam, hw[0], hw[1]);
    ftMirror(hs[0], hs[1], R.hero.st.s * R.cam.zoom, S.hrot, S.mirror);
  }
  if (S.stamp > 0.01) {
    stamp("HAND DOCTORS' TEST", 540, 500, E.outBack(clamp(S.stamp), 2), '#4DFFB4', -0.06, 72);
  }
  // "the combo's back"
  if (S.combo2 > 0.01) ftTag('COMBO', 330, 560, S.combo2, '#C8A8FF', null, 60);
}

// ---------------------------------------------------------------- shots
function ftShot(lt, t, shot) {
  const R = ftFrame(t, t);
  ftOverlays(R, t, t);
  const hp = R.P2.ph([0.2, 9, 1]), hd = toScreen(R.cam, ...toWorld(R.hero.st, R.hero.r.head));
  // punch-ins centre between his face and the finger, so both stay in the frame
  return { glow: 0.8, focus: [clamp((hp[0] + hd[0]) / 2, 260, 820), clamp((hp[1] + hd[1]) / 2, 480, 1080)] };
}
SC.hook = ftShot;
SC.answer = ftShot;
SC.string = ftShot;
SC.pin = ftShot;
SC.doctors = ftShot;
SC.button = ftShot;
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration;
  ftFrame(tt, t);
  return { glow: 0.8 };
};

// the cover: the hooked finger, the menu card's COMBO ONLY, ONLY THE TIP?
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.combo + 0.3;
  const R = ftFrame(tt, t, { cam: { x: 628, y: 1100, zoom: 2.8, rot: 0, bgdy: 0 }, ang: ftAng(0) });
  screenSpace();
  bigWord('ONLY THE', 540, 1260, 120, '#FFFFFF', 1, -0.05);
  bigWord('TIP?', 540, 1430, 220, '#FFD447', 1, -0.05);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() { initCafe(); }
