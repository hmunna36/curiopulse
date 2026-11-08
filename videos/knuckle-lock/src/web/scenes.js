// Make a Duck Hand. Can You SPREAD Your Fingers? 🦆 — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: kl_world.js (the tent at night, the shadow duck, the seatbelt, the knuckle close-up, the cast), fist3d.js
// (one-finger's 3D hand), bwhand.js (bent-wrist-fist's forearm). The whole Short is ONE state over time (`klS(tt)`, valid at
// negative time for the loop): every shot draws from it, so the hand never jumps between shots.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
const KL_LIGHT = { ...LIGHTS.lanterns, keyFrom: [-0.6, -0.8], rimFrom: [0.9, -0.35], rim: [1.0, 0.62, 0.3] };
setLights({ hook: KL_LIGHT, answer: KL_LIGHT, straps: KL_LIGHT, flat: KL_LIGHT, splint: KL_LIGHT, button: KL_LIGHT, loop: KL_LIGHT, cover: KL_LIGHT });

const KL_WR = [565, 918];                 // his left wrist in the world (beside his head, shoulder high)
const KL_EL = [545, 1110];                // his left elbow (below it, in front): the forearm stands up from it, the duck's neck
const klClone = (p) => JSON.parse(JSON.stringify(p));

// ---------------------------------------------------------------- the state of everything at time tt
// tt = video seconds; negative = the Short's last frames (the loop), which run into frame 1
function klS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => (tt < 0 ? 0 : ramp(tt, a, b, e));
  // ---- the hand: mcp 1 = the duck (knuckles bent, fingers straight), 0 = flat
  let mcp = 1, ip = 0, spread = 0, tryK = 0, trem = 0, thumb = 0, open = 0;
  if (tt >= 0) {
    // the hook: the duck quacks once on "duck", the knuckles press down on "bent", the fingers line up on "straight"
    open = popK(tt, c.hand1_end - 0.03, c.hand1_end + 0.17, 0.05, 0.08) * 0.95;            // a quack after "hand."
    ip = 0.25 * (1 - r(c.straight - 0.05, c.straight_end - 0.1));
    mcp = 0.93 + 0.07 * r(c.bent - 0.05, c.bent_end);
    // "Now spread them": he pushes the fingers apart with everything he has: they quiver, they do not go
    tryK = r(c.spread1, c.spread1 + 0.35) * (1 - r(c.stuck, c.stuck + 0.3));
    trem = tryK;
    // the straps: "Bend it": he straightens the knuckle a little and bends it again (the close-up shows the strap)
    mcp -= 0.12 * popK(tt, c.bend - 0.05, c.bump + 0.2, 0.3, 0.6);
    // flatten: the knuckles straighten, the thumb goes out; "spread!": the fingers fan wide
    mcp = lerp(mcp, 0, r(c.flatten_w - 0.05, c.hand3_end + 0.05));
    thumb = r(c.flatten_w, c.hand3_end + 0.1);
    spread = r(c.spread2 - 0.06, c.spread2 + 0.22, E.outBack) * (1 - r(c.doctors - 0.25, c.doctors));
    spread += 0.06 * Math.sin((tt - c.spread2) * 9) * popK(tt, c.spread2 + 0.2, c.doctors - 0.3, 0.2, 0.2);  // jazz hands
    // the splint: back to duck mode (in the cast)
    mcp = lerp(mcp, 1, r(c.doctors - 0.3, c.doctors));
    thumb = lerp(thumb, 0, r(c.doctors - 0.3, c.doctors));
    // the button: "Now duck again": a quack as the cast pops off, "Buckled."
    open = Math.max(open, 0.95 * popK(tt, c.mode_end, c.mode_end + 0.24, 0.05, 0.08));     // a quack after "duck mode,"
    open = Math.max(open, 0.95 * popK(tt, c.again_end + 0.01, c.again_end + 0.25, 0.05, 0.08)); // and after "again."
  }
  S.mcp = clamp(mcp); S.ip = ip; S.spread = spread; S.try = tryK; S.tremble = trem; S.thumb = clamp(thumb); S.open = open;
  // ---- the seatbelt: across the knuckles on "buckled", gone into the inside view; again on "Buckled.", then it zips back
  // it slides across while "buckled them in" is said and clicks shut in the pause after it (the sound is there)
  S.belt = tt < 0 ? 0 : Math.max(r(c.buckled - 0.1, c.in_end + 0.02, E.inOutSine) * (1 - r(c.each + 0.35, c.each + 0.6)),
    r(c.buckled2 - 0.12, c.buckled2_end + 0.02, E.inOutSine) * (1 - r(c.end - 0.4, c.end - 0.12, E.inCubic)));
  S.click = tt < 0 ? 0 : Math.max(popK(tt, c.in_end + 0.01, c.in_end + 0.42, 0.02, 0.2), popK(tt, c.buckled2_end + 0.01, c.buckled2_end + 0.36, 0.02, 0.15));
  // ---- the inside: glass, the side straps on every knuckle, the close-up
  S.glass = tt < 0 ? 0 : r(c.each - 0.1, c.each + 0.3) * (1 - r(c.shot_flat - 0.1, c.shot_flat - 0.01));
  S.straps = tt < 0 ? 0 : r(c.two, c.two + 0.35, E.outBack) * (1 - r(c.shot_flat - 0.1, c.shot_flat - 0.01));
  S.win = tt < 0 ? 0 : r(c.bend - 0.3, c.bend + 0.2, E.outCubic) * (tt < c.shot_flat - 0.01 ? 1 : 0);
  S.dive = tt < 0 ? 0 : r(c.bend - 0.05, c.bend + 0.55, E.inOutCubic);
  // in the close-up the finger is straight on "Bend it", then bends while "pulls them tight" is said
  S.phi = 1.45 * r(c.pulls - 0.15, c.tight + 0.05, E.inOutSine);
  S.bump = tt < 0 ? 0 : popK(tt, c.bump - 0.05, c.pulls + 0.2, 0.15, 0.3);
  S.twang = tt < 0 ? 0 : Math.exp(-Math.max(0, tt - c.tight) * 3.2) * (tt > c.tight ? 1 : 0) * (1 - r(c.flatten - 0.1, c.flatten));
  S.tightTag = tt < 0 ? 0 : popK(tt, c.tight + 0.02, c.shot_flat - 0.01, 0.12, 0.08);
  S.bumpTag = tt < 0 ? 0 : popK(tt, c.bump, c.tight + 0.1, 0.12, 0.12);
  // the slack straps after flattening (a small window), the long strap of the splint
  S.slackWin = tt < 0 ? 0 : popK(tt, c.slack - 0.15, c.spread2 - 0.05, 0.2, 0.15);
  S.longWin = tt < 0 ? 0 : popK(tt, c.so - 0.15, c.shrink_end + 0.18, 0.2, 0.12);
  // ---- the cast
  S.cast = tt < 0 ? 0 : r(c.splint - 0.05, c.splint + 0.18, E.outCubic) * (1 - r(c.shrink_end + 0.2, c.shrink_end + 0.26));
  S.puff = tt < 0 ? 0 : Math.max(popK(tt, c.splint - 0.05, c.splint + 0.35, 0.05, 0.25), popK(tt, c.shrink_end + 0.2, c.shrink_end + 0.5, 0.05, 0.12));
  S.modeTag = tt < 0 ? 0 : popK(tt, c.duckmode - 0.04, c.shrink_end + 0.18, 0.12, 0.12);
  // ---- labels and bursts
  S.stuckQ = tt < 0 ? 0 : popK(tt, c.stuck - 0.05, c.your2 + 0.3, 0.08, 0.15);
  // QUACK! at the beak on each quack (for the eyes too: many watch with the sound off)
  S.quack = tt < 0 ? 0 : Math.max(popK(tt, c.hand1_end - 0.02, c.hand1_end + 0.42, 0.06, 0.1), popK(tt, c.mode_end + 0.01, c.mode_end + 0.45, 0.06, 0.1),
    popK(tt, c.again_end + 0.01, c.again_end + 0.42, 0.06, 0.1));
  S.shake = trem;
  S.spreadBurst = tt < 0 ? 0 : popK(tt, c.spread2, Math.min(c.spread2_end + 0.55, c.shot_splint - 0.03), 0.06, 0.1);
  // ---- the shadow duck's eye: calm, straining, annoyed, wide, gone while the hand is flat, back for duck mode
  let em = 'calm', look = [-0.6, 0];
  if (tt >= 0) {
    if (tt >= c.spread1 + 0.15) { em = 'strain'; look = [0, 0.3]; }
    if (tt >= c.stuck) { em = 'annoyed'; look = [-1, 0.4]; }
    if (tt >= c.in_end) { em = 'shock'; look = [0, -0.3]; }
    if (tt >= c.each) { em = 'calm'; look = [-0.6, 0.2]; }
    if (tt >= c.doctors) { em = 'annoyed'; look = [-0.8, 0.2]; }
    if (tt >= c.duckmode) { em = 'calm'; look = [-0.6, 0]; }
    if (tt >= c.now4) { em = 'happy'; }
    if (tt >= c.buckled2_end) { em = 'shock'; look = [0, -0.3]; }
    if (tt >= c.buckled2_end + 0.3) { em = 'calm'; look = [-0.6, 0]; }
  }
  S.eyeMood = em; S.eyeLook = look;
  S.eyeK = tt < 0 ? 1 : 1 - r(c.flatten_w - 0.1, c.flatten_w + 0.1) + r(c.doctors - 0.1, c.doctors + 0.15);
  S.eyeK = clamp(S.eyeK);
  S.eyeBlink = klBlink(tt, 0.5);
  S.bandage = tt < 0 ? 0 : r(c.splint, c.splint + 0.25) * (1 - r(c.shrink_end + 0.2, c.shrink_end + 0.3));
  // ---- his face and head
  const lookHand = { lookX: 0.85, lookY: -0.35 };
  let f = { ...FACES.calm, ...lookHand, mouth: 'grin', mouthOpen: 0.2 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.grin, ...lookHand, mouthOpen: 0.3 }, popK(tt, c.duck - 0.05, c.hand1_end, 0.15, 0.3));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.8, browTilt: 1.4, browY: 0.6 }, r(c.spread1 + 0.05, c.spread1 + 0.35));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.1, lookY: 0.15 }, r(c.stuck, c.stuck + 0.2));
    f = lerpFace(f, { ...FACES.startled, lookX: 0.9, lookY: -0.2 }, r(c.in_end - 0.02, c.in_end + 0.12));
    f = lerpFace(f, { ...FACES.calm, lookX: 0.9, lookY: -0.3, eyeOpen: 1.15, mouth: 'o' }, r(c.each, c.each + 0.3));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.8, lookY: -0.4, eyeOpen: 1.2 }, r(c.flatten, c.flatten + 0.3));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.8, lookY: -0.5, eyeOpen: 1.3, mouthOpen: 0.8 }, r(c.spread2, c.spread2 + 0.15));
    f = lerpFace(f, { ...FACES.worried, lookX: 0.85, lookY: -0.2 }, r(c.splint, c.splint + 0.25));
    f = lerpFace(f, { ...FACES.calm, lookX: 0.85, lookY: -0.3, mouth: 'grin', mouthOpen: 0.2 }, r(c.duckmode, c.duckmode + 0.3));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.2, lookY: 0.1, mouthOpen: 0.25, browTilt: 1 }, r(c.now4, c.now4 + 0.25));
    f = lerpFace(f, { ...FACES.startled, lookX: 0.85, lookY: -0.3 }, r(c.buckled2_end - 0.02, c.buckled2_end + 0.12));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'grin', mouthOpen: 0.2 }, r(c.buckled2_end + 0.25, c.end - 0.05));
  }
  f.blink = Math.max(f.blink || 0, klBlink(tt + 1.3, 0.45));
  S.face = f;
  S.hrot = tt < 0 ? 0.04 : 0.04 + 0.05 * trem * Math.sin(tt * 37) * 0.3 - 0.06 * r(c.stuck, c.stuck + 0.2) * (1 - r(c.in_end, c.in_end + 0.2));
  S.hdx = trem * 2.0 * Math.sin(tt * 47);
  return S;
}
function klBlink(tt, w = 0.45) { const u = ((tt * loopW(w) / (Math.PI * 2) + 0.3) % 1 + 1) % 1; return u < 0.03 ? Math.sin(u / 0.03 * Math.PI) : 0; }

// ---------------------------------------------------------------- the cameras
// the 2D camera (him, the tent) per section, and the hand's view angles (yaw from the side view, pitch)
function klCam(tt) {
  const c = cu();
  if (tt < 0 || tt >= c.shot_button) {
    // the button and the loop: the hook's framing
    const u = tt < 0 ? 1 : ramp(tt, c.shot_button, c.end, E.inOutSine);
    return { x: lerp(466, 466, u), y: lerp(876, 880, u), zoom: lerp(3.36, 3.28, u), rot: 0, dy: 0 };
  }
  if (tt < c.shot_answer) return { x: 466, y: lerp(880, 876, ramp(tt, 0, c.shot_answer)), zoom: lerp(3.28, 3.36, ramp(tt, 0, c.shot_answer, E.inOutSine)), rot: 0, dy: 0 };
  if (tt < c.shot_flat) {
    // the back of his knuckles, close and from above; drifting in through the straps
    const u = ramp(tt, c.shot_answer, c.shot_flat, E.inOutSine);
    return { x: lerp(548, 552, u), y: lerp(852, 846, u), zoom: lerp(3.7, 3.95, u), rot: 0, dy: 140 };
  }
  if (tt < c.shot_splint) {
    // low and wide: him in his sleeping bag, the wall above him, the shadow big
    const u = ramp(tt, c.shot_flat, c.shot_splint, E.inOutSine);
    return { x: lerp(500, 506, u), y: lerp(905, 895, u), zoom: lerp(1.85, 1.95, u), rot: 0, dy: -220 };
  }
  // the splint: a high angle, closer
  const u = ramp(tt, c.shot_splint, c.shot_button, E.inOutSine);
  return { x: lerp(500, 506, u), y: lerp(872, 866, u), zoom: lerp(2.55, 2.68, u), rot: 0, dy: 200 };
}
function klAng(tt) {
  const c = cu();
  const side = Math.PI / 2;
  let yaw = 0.2, pitch = 0.12;
  if (tt >= 0 && tt >= c.shot_answer && tt < c.shot_flat) { yaw = -1.05; pitch = 0.42; }
  if (tt >= 0 && tt >= c.shot_flat && tt < c.shot_splint) {
    // the hand turns its palm to the lamp as it flattens
    const u = ramp(tt, c.flatten - 0.05, c.hand3_end + 0.1, E.inOutCubic);
    yaw = lerp(0.2, -Math.PI / 2 - 0.12, u); pitch = lerp(0.12, 0.06, u);
  }
  if (tt >= 0 && tt >= c.shot_splint && tt < c.shot_button) { yaw = 0.12; pitch = 0.3; }
  return { yaw: side + yaw, pitch };
}
function klView(cam, ang, o = {}) {
  const sc = toScreen(cam, KL_WR[0], KL_WR[1]), el = toScreen(cam, KL_EL[0], KL_EL[1]), D = 55;
  const dx = el[0] - sc[0], dy = el[1] - sc[1], l = Math.hypot(dx, dy) || 1;
  const roll = Math.atan2(-dx / l, dy / l);
  return { yaw: ang.yaw, pitch: ang.pitch, roll, tx: 0, ty: 0, tz: 0, D, cx: sc[0] + (o.dx || 0), cy: sc[1] + (o.dy || 0),
    f: KL.PX * D * cam.zoom / 2.9 * (o.k || 1), mirror: true };
}

// ---------------------------------------------------------------- him in his tent (his left arm is the 3D one)
function klHero(cam, t, S) {
  const p = klClone(POSES.stand);
  p.armL = { a: 0.16, b: 0.22 };
  p.lean = -0.01;
  const st = { x: KL.HX, y: KL.GY, s: KL.HS, pose: p, face: S.face, hideArm: 'R', headRot: S.hrot, headDX: S.hdx,
    headDY: 2 * Math.sin(t * loopW(1.6)), noLegs: true };
  const r = charLayer(cam, st, t, { pal: KLPAL, ambient: 0.1 });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return { r, st };
}
// his left upper arm (the coat's sleeve, rolled up to the elbow) from his shoulder to the 3D forearm's elbow (screen space)
function klUpperArm(cam, hero, P2) {
  const shW = toWorld(hero.st, hero.r.shR), sh = toScreen(cam, shW[0], shW[1]);
  const el = P2.pa([0, -BWK.L * 0.97, 0]);
  const w = 42 * hero.st.s * cam.zoom;
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0] - ux * w * 0.2, el[1] - uy * w * 0.2, w, KLPAL.coat);
    line(ctx, el[0] - ux * w * 0.62, el[1] - uy * w * 0.62, el[0] - ux * w * 0.18, el[1] - uy * w * 0.18, w * 1.1, KLPAL.coatSh);
  });
}

// the whole picture at time tt (t = the video time for clocks)
function klFrame(tt, t, o = {}) {
  const S = klS(tt), cam = o.cam || klCam(tt), ang = o.ang || klAng(tt);
  const G = klGeo({ mcp: S.mcp, ip: S.ip, spread: S.spread, try: S.try, tremble: S.tremble, thumb: S.thumb, open: S.open, t });
  // the wall, and the shadow on it (the set)
  const cw = klTent(cam, t, { dy: cam.dy || 0, t });
  const V = klView(cam, ang), P2 = bwProj(V, 0);
  const bc = toScreen(cw, KL.BEAM[0], KL.BEAM[1]), bz = cw.zoom;
  const beamS = [bc[0], bc[1], KL.BEAMR[0] * bz, KL.BEAMR[1] * bz];
  const sk = 1.42;                                    // the shadow is bigger than the hand (the torch is close to it)
  const hs = toScreen(cam, KL_WR[0], KL_WR[1]);
  const Vs = { ...V, f: V.f * sk * 0.88, cx: hs[0] + (bc[0] - hs[0]) * 0.35 + 40 * bz / 2.6, cy: hs[1] - 230 * bz / 2.6 };
  const P2s = bwProj(Vs, 0);
  screenSpace();
  klShadowDraw(P2s, G, { beamS, cast: S.cast > 0.5, a: 0.82 });
  const ep = P2s.ph([0.3, 7.15, -1.15]);
  klDuckEye({ x: ep[0], y: ep[1], r: ep[2] * 0.62, mood: S.eyeMood, look: S.eyeLook, blink: S.eyeBlink, k: S.eyeK, bandage: S.bandage });
  applyCam(cam);
  klLantern(cam, t);
  const hero = klHero(cam, t, S);
  applyCam(cam);
  klBag(t);
  // the hand
  screenSpace();
  klUpperArm(cam, hero, P2);
  const items = klBelt(P2, G, S.belt, { click: S.click });
  actor(() => bwDraw(ctx, P2, G, { items }));
  if (S.cast > 0.01) klCast(P2, G, S.cast, t);
  if (S.glass > 0.01) bwGlass(ctx, P2, G, S.glass, {});
  if (S.straps > 0.01) klSideStraps(P2, G, S.straps, t);
  return { S, cam, cw, V, P2, G, P2s, beamS };
}

// the side straps of every knuckle seen through the glass: a short yellow band on each side of each big knuckle
function klSideStraps(P2, G, k, t) {
  paint(() => {
    for (const kk of FK_ORD) {
      const F = G.f[kk];
      for (const sd of [-1, 1]) {
        const a = P2.ph([F.pts[0][0] + sd * F.rad[0] * 1.02, F.pts[0][1] - 1.5, F.pts[0][2] - 0.7]);
        const b = P2.ph([F.pts[1][0] * 0.2 + F.pts[0][0] * 0.8 + sd * F.rad[0] * 1.02, F.pts[0][1] * 0.6 + F.pts[1][1] * 0.4, F.pts[0][2] * 0.45 + F.pts[1][2] * 0.55]);
        const s = E.outBack(clamp(k), 2), w = Math.max(8, a[2] * 0.85) * s;
        line(ctx, a[0], a[1], lerp(a[0], b[0], s), lerp(a[1], b[1], s), w * 1.35, '#8A5C14');
        line(ctx, a[0], a[1], lerp(a[0], b[0], s), lerp(a[1], b[1], s), w, '#FFD447');
        softDot(gctx, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, w * 2.2, '#FFE680', 0.25 * k);
      }
    }
  });
}

// ---------------------------------------------------------------- the overlays of each part
function klOverlays(R, tt, t) {
  const c = cu(), S = R.S, P2 = R.P2, G = R.G;
  screenSpace();
  // the hook: straining
  if (S.shake > 0.05) { const q = P2.ph(fkTip(R.G, 'M', 0.2)); klShake(q[0], q[1], q[2] * 4, S.shake, t); }
  // "Knuckles bent": a curved arrow round the big knuckle; "fingers straight": a ruler line along the top of the fingers
  const kb = tt < 0 ? 0 : popK(tt, c.bent - 0.08, c.straight - 0.1, 0.12, 0.12), fs = tt < 0 ? 0 : popK(tt, c.straight - 0.06, c.spread1 + 0.1, 0.12, 0.12);
  if (kb > 0.01) {
    const k0 = P2.ph(fkSegPt(G, 'I', 0, 0.0, 'back', 1.9)), a = P2.ph([FK_F.I.x, FK_F.I.y - 2.6, -1.9]), b = P2.ph(fkSegPt(G, 'I', 0, 0.45, 'back', 1.9));
    paint(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const s2 = E.outBack(kb, 2);
      ctx.lineWidth = 11 * s2; ctx.lineCap = 'round'; ctx.strokeStyle = '#FF9A3C';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(k0[0] + (k0[0] - (a[0] + b[0]) / 2) * 0.9, k0[1] + (k0[1] - (a[1] + b[1]) / 2) * 0.9, b[0], b[1]); ctx.stroke();
      const an = Math.atan2(b[1] - k0[1], b[0] - k0[0]);
      ctx.fillStyle = '#FF9A3C'; ctx.translate(b[0], b[1]); ctx.rotate(an + Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 22 * s2); ctx.lineTo(-17 * s2, -8 * s2); ctx.lineTo(17 * s2, -8 * s2); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
  }
  if (fs > 0.01) {
    const a = P2.ph(fkSegPt(G, 'I', 0, 0.05, 'back', 1.8)), b = P2.ph(fkSegPt(G, 'I', 2, 1.0, 'back', 1.8));
    const u = E.outCubic(clamp(fs * 1.4));
    paint(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.setLineDash([18, 12]); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#7FE9FF', fs);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u)); ctx.stroke(); ctx.setLineDash([]);
      circle(ctx, a[0], a[1], 9 * fs, '#7FE9FF'); if (u > 0.95) circle(ctx, b[0], b[1], 9 * fs, '#7FE9FF');
      ctx.restore();
    });
  }
  // QUACK!: a speech bubble at the beak (it points left, at his face)
  if (S.quack > 0.01) {
    const q = P2.ph(fkTip(G, 'I', 1.4)), k = E.outBack(clamp(S.quack), 2.4);
    const bx = clamp(q[0] - 10, 330, 760), by = clamp(q[1] - 120, 470, 1000);
    paint(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(bx, by); ctx.rotate(-0.08); ctx.scale(k, k);
      ctx.font = '900 46px Montserrat'; const w = ctx.measureText('QUACK!').width + 44, h = 76;
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1A1030'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
      ctx.beginPath(); rrect(ctx, -w / 2, -h / 2, w, h, 30); ctx.moveTo(-14, h / 2 - 2); ctx.lineTo(4, h / 2 + 26); ctx.lineTo(18, h / 2 - 2);
      ctx.stroke(); ctx.fill();
      ctx.fillStyle = '#FF9A3C'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('QUACK!', 0, 3);
      ctx.restore();
    });
  }
  // "Stuck?"
  if (S.stuckQ > 0.01) { const q = P2.ph(fkTip(R.G, 'I', 1.2)); bigWord('?', q[0] - 40, q[1] - 120, 150, '#FF5A6E', E.outBack(S.stuckQ, 2), -0.1); }
  // CLICK! on the buckle
  if (S.click > 0.01) { const q = P2.ph(fkSegPt(G, 'L', 0, 0.1, 'back', 2.4)); klBurst(clamp(q[0] + 150, 300, 780), clamp(q[1] - 190, 480, 1000), tt < c.flatten ? 0.62 : 0.5, S.click, 'CLICK!', '#FFD447', 0.12, 96); }
  // the close-up of one knuckle: a window on the index knuckle that the camera dives into
  if (S.win > 0.01) {
    const q = P2.ph(fkSegPt(G, 'I', 0, 0.05, 'back', 0.2));
    const d = S.dive, cx = lerp(q[0], 540, d), cy = lerp(q[1], 800, d), R0 = lerp(0.9, 1, d) * lerp(26, 96, d);
    const K = klKnuckle(cx, cy, R0, { k: S.win, phi: S.phi, bump: S.bump, twang: S.twang, far: S.straps, t });
    if (K) {
      if (S.bumpTag > 0.01) klTag('BUMP', clamp(K.bump[0] - 250, 230, 850), K.bump[1] + 220, S.bumpTag, '#FF9A3C', K.bump, 50);
      if (S.tightTag > 0.01) klTag('TIGHT!', 540, Math.max(452, cy - K.WR - 40), S.tightTag, '#FF5A6E', null, 58);
    }
  }
  // the slack straps of the flat hand (a small window top left)
  if (S.slackWin > 0.01) {
    const K = klKnuckle(250, 545, 40, { k: S.slackWin, phi: 0, far: 1, t });
    if (K) klTag('SLACK', 250 + K.WR + 105, 545, S.slackWin, '#7FE9FF', null, 44);
  }
  // spread!
  if (S.spreadBurst > 0.01) klBurst(740, 610, 0.7, S.spreadBurst, 'SPREAD!', '#4DFFB4', 0.1, 100);
  // duck mode: the tag, and the strap kept long
  if (S.modeTag > 0.01) klTag('DUCK MODE', 360, 505, S.modeTag, '#FFD447', null, 54);
  if (S.longWin > 0.01) {
    const K = klKnuckle(810, 640, 38, { k: S.longWin, phi: 1.45, far: 1, taut: 1, t });
    if (K) klTag('STAYS LONG', 810, 640 + K.WR + 42, S.longWin, '#4DFFB4', null, 40);
  }
  // the cast's puffs
  if (S.puff > 0.01) {
    const q = P2.ph([0.2, 5, 0]);
    paint(() => { for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = q[2] * (7 + 5 * (1 - S.puff)); circle(ctx, q[0] + Math.cos(a) * rr, q[1] + Math.sin(a) * rr * 0.8, q[2] * 1.6 * S.puff, rgba('#FFFFFF', 0.85 * S.puff)); } });
  }
}

// ---------------------------------------------------------------- shots
function klShot(lt, t, shot) {
  const R = klFrame(t, t);
  klOverlays(R, t, t);
  const hp = R.P2.ph([0.2, 6, 1]);
  return { glow: 0.85, focus: [clamp(hp[0], 200, 880), clamp(hp[1], 450, 1100)] };
}
SC.hook = klShot;
SC.answer = klShot;
SC.straps = klShot;
SC.flat = klShot;
SC.splint = klShot;
SC.button = klShot;
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration;
  klFrame(tt, t);
  return { glow: 0.85 };
};

// the cover: the duck that will not spread, its shadow straining on the wall, his face, SPREAD? / CAN YOU?
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.them1_end;
  const R = klFrame(tt, t);
  klOverlays(R, tt, t);
  bigWord('CAN YOU', 540, 1230, 150, '#FFFFFF', 1, -0.05);
  bigWord('SPREAD?', 540, 1410, 210, '#FFD447', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {}
