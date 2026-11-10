// Your HONEY Could Outlive You 🍯: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue (make_timeline.py).
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the kitchen's window is on the LEFT (the house rig: warm, upper left); inside the jar the lamp-sun is upper right; the
// tomb is lit by torches; the pyramids by a low Sun on the right
const HN_L_JAR = Object.assign({}, LIGHTS.day, { keyTint: [1.10, 1.02, 0.86], rim: [1.0, 0.82, 0.45], rimAmt: 1.0, shadowTint: [0.86, 0.72, 0.62] });
setLights({
  hook: LIGHTS.room, lid: LIGHTS.room, aging: LIGHTS.room, loop: LIGHTS.room, cover: LIGHTS.room,
  desert: HN_L_JAR, slurp: HN_L_JAR,
  tomb: LIGHTS.lanterns, button: LIGHTS.lanterns,
  pyramid: LIGHTS.sunset,
});

// ================================================================ the kitchen hero
// o: {eL, wL, eR, wR (elbows and wrists, world), face, age, beard, glasses, stoop, lean, headRot, blink, post(lc, r, st)}
function hnKHero(cam, t, o) {
  const st = { x: HN_HERO.x, y: HN_HERO.y, s: 1, noLegs: true, blink: o.blink || 0, headRot: o.headRot || 0, headDY: o.headDY || 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = o.lean || 0;
  pose.hipY = -222 + (o.stoop || 0) * 26;
  const L = (p) => ikLocal(st, p[0], p[1]);
  pose = armAt(pose, 'L', L(o.eL), L(o.wL));
  pose = armAt(pose, 'R', L(o.eR), L(o.wR));
  pose.handL = o.handL || 'open'; pose.handR = o.handR || 'open';
  st.pose = pose; st.face = o.face || FACES.calm;
  applyCam(cam);
  const r = charLayer(cam, st, t, { pal: hnOldPal(o.age || 0), post: (lc, r2, s2) => {
    hnWrinkles(lc, s2, r2, o.age || 0);
    hnBeard(lc, s2, r2, o.beard || 0, t);
    hnGlasses(lc, s2, r2, o.glasses || 0);
    if (o.post) o.post(lc, r2, s2);
  } });
  applyCam(cam);   // charLayer leaves ctx in screen space
  return r;
}
// the hand point of a wrist (world): where the rig draws the hand
function hnHandW(st, r, k) { const wr = r['wr' + k], d = r['armDir' + k]; return toWorld(st, [wr[0] + d[0] * 14, wr[1] + d[1] * 14]); }

// ================================================================ HOOK: breakfast; bread, banana or honey? (CU, him centre)
const HN_HOOK_CAM = [0, 603, 1212, 2.6];
function hnHookCam(lt) {
  const c = cu();
  return camKeys(lt, [HN_HOOK_CAM, [1.15, 603, 1214, 2.58], [c.bread - 0.05, 596, 1236, 2.55], [c.banana - 0.25, 600, 1240, 2.5],
    [c.banana + 0.12, 448, 1286, 2.35], [c.honey1 - 0.3, 470, 1280, 2.35], [c.honey1 + 0.08, 742, 1262, 2.25], [c.honey2 + 0.4, 752, 1250, 2.4],
    [c.to, 756, 1246, 2.45]]);
}
// t here is hook time (0 at the Short's start; negative in the loop shot): every motion is a function of it
function hnHookScene(lt, t, cam) {
  const c = cu();
  hnKitchenBack(cam, t, { lamp: 1 });
  hnKettle(ctx, 1040, HN_ITEM_Y, 0.9);
  // the drizzle wobbles; his eyes follow what is named
  const gl = (a, b) => ramp(t, a, b, E.inOutSine);
  const look = { lookX: 0.1 * Math.sin(lt * 2) - 0.9 * popK(t, c.banana - 0.15, c.or, 0.15, 0.15) + 0.95 * gl(c.honey1 - 0.2, c.honey1 + 0.1), lookY: 0.55 - 0.45 * gl(c.honey1 - 0.2, c.honey1 + 0.1) };
  const hap = gl(c.honey2 - 0.15, c.honey2 + 0.1);
  const face = lerpFace(Object.assign({}, FACES.grin, { mouthOpen: 0.55 }, look), Object.assign({}, FACES.grin, { mouthOpen: 1, browY: 1.0 }, look), hap);
  const blink = popK(t, 1.02, 1.12, 0.04, 0.05) * 0.96;
  const wob = Math.sin(lt * 3.1) * 4;
  const hR = [705 + wob, 1190 + 3 * Math.sin(lt * 2.3)];
  hnKHero(cam, t, {
    eL: [452, 1318], wL: [522, 1302], eR: [762, 1288], wR: [hR[0] - 10, hR[1] - 4],
    face, blink, headRot: 0.04 * Math.sin(lt * 1.3) - 0.05 * popK(t, c.banana - 0.15, c.or, 0.15, 0.15) + 0.06 * gl(c.honey1 - 0.2, c.honey1 + 0.1),
    post: (lc, r, st) => {
      // the toast in his left hand, glistening; the hand's thumb over its edge
      const hl = hnHandW(st, r, 'L');
      hnToast(lc, hl[0] + 66, hl[1] - 8, 0.72, -0.1, { honey: 0.35 + 0.65 * clamp(0.5 + lt / 8) });
      circle(lc, hl[0] + 6, hl[1] - 4, 15, PAL.skin);
      // the dipper in his right hand, honey running off it onto the toast
      const hr = hnHandW(st, r, 'R');
      const tip = hnDipper(lc, hr[0], hr[1], 0.7, 1.22 + 0.05 * Math.sin(lt * 3.1));
      hnRibbon(lc, tip[0] - 4, tip[1] - 8, hl[0] + 70, hl[1] - 4, lt, 1);
      circle(lc, hr[0] - 4, hr[1] - 6, 11, PAL.skin);
    },
  });
  hnCounter(cam, t);
  hnPlate(ctx, HN_PLATE.x, HN_PLATE.y);
  hnBanana(ctx, HN_BAN.x, HN_BAN.y, 1, t, 0);
  hnJar(ctx, HN_JAR.x, HN_JAR.y, 1, { lid: 0, glint: popK(t, c.honey2 - 0.1, c.honey2 + 0.9, 0.1, 0.3) });
  // the jar's TING on "Honey."
  const sk = popK(t, c.honey2 - 0.05, c.honey2 + 0.55, 0.12, 0.2);
  if (sk > 0) { const p = toScreen(cam, HN_JAR.x + 46, HN_JAR.y - 150); screenSpace(); hnSparkle(p[0], p[1], 70, sk, t * 2); hnSparkle(p[0] - 120, p[1] + 60, 40, popK(t, c.honey2 + 0.05, c.honey2 + 0.6, 0.12, 0.2), 0.4); }
}
SC.hook = (lt, t, shot) => {
  const cam = hnHookCam(lt);
  hnHookScene(lt, t, cam);
  return { glow: 0.85 };
};
// the loop: the last 0.43 s are the hook's own run-up to frame 0 (negative hook time), so the last frame meets frame 0
SC.loop = (lt, t, shot) => {
  const D = shot.end - shot.start, ht = lt - D;
  const cam = hnHookCam(ht);
  hnHookScene(ht, ht, cam);
  return { glow: 0.85 };
};

// ================================================================ DESERT: inside the jar, the honey is a desert (wide, low)
function hnDesertHero(cam, t, o) {
  const st = { x: o.x, y: o.y, s: o.s, blink: o.blink || 0, headRot: o.headRot || 0, noArms: !!o.noArms };
  let pose = o.walk ? walkPlanted(t, { speed: 4.2, lift: 16, bob: 6 }) : JSON.parse(JSON.stringify(POSES.stand));
  if (o.hug) {   // hugging the canteen to his chest: the elbows out, the wrists at the middle of the chest
    const L = (p) => ikLocal(st, p[0], p[1]);
    pose = armAt(pose, 'L', L([o.x - 92 * o.s, o.y - 268 * o.s]), L([o.x - 22 * o.s, o.y - 318 * o.s]));
    pose = armAt(pose, 'R', L([o.x + 92 * o.s, o.y - 268 * o.s]), L([o.x + 22 * o.s, o.y - 318 * o.s]));
  }
  st.pose = pose; st.face = o.face || FACES.calm;
  applyCam(cam);
  const res = charLayer(cam, st, t, { pal: HNEXP,
    pre: (lc) => { if (o.behind) hnCanteen(lc, o.x + 70 * o.s, o.y - 250 * o.s, 0.9 * o.s, 0.5); },
    post: (lc, r, s2) => {
      hnHelmet(lc, s2, r);
      if (o.hug) { hnCanteen(lc, o.x, o.y - 318 * o.s, 1.05 * o.s, 0); for (const k of ['L', 'R']) { const h = hnHandW(s2, r, k); circle(lc, h[0], h[1], 19 * o.s, PAL.skin); } }
      else if (o.canteenSide) hnCanteen(lc, o.x + 88 * o.s, o.y - 200 * o.s, 0.75 * o.s, 0.2);
      if ((o.sweat || 0) > 0.01) { const hw = hnHeadW(s2, r); sweatDrop(lc, hw[0] + 70 * o.s, hw[1] - 10 * o.s + ((t * 1.2) % 1) * 30 * o.s, 1.3 * o.s, o.sweat); }
    } });
  applyCam(cam);
  return res;
}
SC.desert = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 570 - 20 * clamp(lt / D), y: 1420 + 20 * clamp(lt / D), zoom: 1.08 + 0.08 * E.inOutSine(clamp(lt / D)), rot: 0 };
  const hz = -120;
  hnDesertBack(cam, t, { hz, sun: [840, 470] });
  // the hero trudges along the near dune (walking on the spot), the germ pants beside him
  applyCam(cam);
  const hx = 420, gx = 690;
  const pantFace = Object.assign({}, FACES.worried, { mouth: 'o', mouthOpen: 0.6 + 0.3 * Math.abs(Math.sin(t * 8)), lookX: 0.5, lookY: 0.3, browTilt: 1.1 });
  const wince = ramp(t, c.desert - 0.1, c.desert + 0.2);
  hnDesertHero(cam, t, { x: hx, y: hnDuneY(3, hx) + 10, s: 0.66, walk: true, face: lerpFace(pantFace, Object.assign({}, FACES.nervous, { lookX: 0.9 }), wince), canteenSide: true, sweat: 1 });
  hnGerm(ctx, gx, hnDuneY(3, gx) + 12, 1.2, t, { pant: 1, sweat: 1, look: -0.6 });
  hnDesertFront(cam, t, { hz, rocks: [[110, 0.9, 0.3], [960, 1.3, -0.2]] });
  hnShimmer(t, 1);
  return { glow: 0.9 };
};

// ================================================================ SLURP: sugar slurps the water out of the germ (medium-CU, high)
SC.slurp = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 610, y: 1560 - 20 * clamp(lt / D), zoom: 1.62 + 0.06 * clamp(lt / D), rot: 0 };
  const hz = 140;
  hnDesertBack(cam, t, { hz, sun: [930, 300] });
  applyCam(cam);
  // the hero at the left, hugging his canteen; then hiding it behind his back when a grain eyes it
  const hx = 425, hy = hnDuneY(3, hx) + 10, hide = ramp(t, c.spy + 0.08, c.spy + 0.3);
  const scared = ramp(t, c.slurps + 0.2, c.slurps + 0.5);
  const f0 = Object.assign({}, FACES.worried, { lookX: 0.7, lookY: 0.4 });
  const f1 = Object.assign({}, FACES.nervous, { lookX: 0.9, lookY: 0 });
  hnDesertHero(cam, t, { x: hx, y: hy, s: 0.56, hug: hide < 0.5, noArms: hide >= 0.5, behind: hide >= 0.5, face: lerpFace(f0, f1, Math.max(scared, hide)), sweat: hide, blink: popK(t, c.spy + 0.3, c.spy + 0.42, 0.04, 0.04) * 0.95 });
  // the germ, shrivelling
  const gx = 640, gy = hnDuneY(3, gx) + 14;
  const shv = E.inOutCubic(ramp(t, c.slurps + 0.15, c.in_it_end - 0.05, (x) => x));
  const fear = ramp(t, c.sugar, c.sugar + 0.3);
  hnGerm(ctx, gx, gy, 1.25, t, { shrivel: shv, pant: 1 - fear, fear, look: 0.4 * Math.sin(t * 6) * fear, hat: 1 - ramp(t, c.lands, c.lands + 0.2), sweat: fear * (1 - shv) });
  // the grains pop out of the honey around it, straws in on "SLURPS"
  const target = (dx, dy) => [gx + dx, gy - 70 + dy];
  const G = [
    { x: 510, dy: 8, t0: c.sugar - 0.05, s: 0.95, aim: target(-30, 6), rot: 0.08 },
    { x: 800, dy: 6, t0: c.sugar + 0.12, s: 1.05, aim: target(34, 0), rot: -0.1 },
    { x: 740, dy: -110, t0: c.sugar + 0.28, s: 0.8, aim: target(16, -30), rot: 0.05 },
  ];
  for (const g of G) {
    const k = ramp(t, g.t0, g.t0 + 0.35, (x) => x);
    const y = hnDuneY(3, g.x) + 6 + g.dy;
    const strawK = ramp(t, c.slurps - 0.1, c.slurps + 0.15);
    let aim = g.aim, sk = strawK;
    if (g === G[1]) {   // the big grain turns its straw toward the hero's canteen in the gap
      const turn = ramp(t, c.spy - 0.05, c.spy + 0.2);
      aim = [lerp(g.aim[0], hx + 20, turn), lerp(g.aim[1], hy - 0.56 * 318, turn)];
      sk = strawK * (1 - 0.35 * turn);
    }
    hnGrain(ctx, g.x, y - 40 * g.s, g.s, t, { k, tx: aim[0], ty: aim[1], straw: sk, slurp: ramp(t, c.slurps, c.slurps + 0.3) * (1 - ramp(t, c.in_it_end - 0.2, c.in_it_end)), cheeks: popK(t, c.slurps, c.in_it_end, 0.2, 0.3), look: g.x > gx ? -1 : 1, rot: g.rot });
    hnSplash(ctx, g.x, y + 4, ramp(t, g.t0, g.t0 + 0.45, (x) => x), g.s);
  }
  hnDesertFront(cam, t, { hz, rocks: [[1000, 1.1, -0.3]] });
  return { glow: 0.9 };
};

// ================================================================ LID: the lid screws on (macro from the front)
SC.lid = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 800, y: 1300 + 6 * clamp(lt / D), zoom: 3.2 - 0.12 * clamp(lt / D), rot: 0 };
  hnKitchenBack(cam, t, { lamp: 1 });
  hnCounter(cam, t);
  const drop = 60 * (1 - E.outCubic(ramp(t, shot.start, c.lid + 0.05, (x) => x)));
  const turns = 1.6 * E.inOutSine(ramp(t, c.lid - 0.05, c.clunk, (x) => x));
  const jolt = popK(t, c.clunk, c.clunk + 0.12, 0.02, 0.1);
  hnJar(ctx, HN_JAR.x, HN_JAR.y + 2 * jolt, 1, { lid: 1, drop, turn: turns * 3, glint: 0.4 });
  // his hand from above, gripping the lid: the forearm in from the upper right, the back of the hand, four fingers
  // curled over the lid's front edge, the thumb on its left
  const ly = HN_JAR.y - 176 - 20 - drop, rot = 0.22 * Math.sin(turns * Math.PI * 2) * (1 - jolt * 0.3);
  ctx.save(); ctx.translate(HN_JAR.x + 6, ly - 14); ctx.rotate(rot * 0.25);
  const sk = HNPAL.skin, skd = HNPAL.skinSh;
  actor(() => {
    line(ctx, 190, -330, 46, -96, 84, sk);                              // the forearm
    ellipse(ctx, 6, -58, 92, 54, sk, 0.18);                            // the back of the hand
    line(ctx, -70, -50, -98, 2, 34, sk);                               // the thumb
    for (let i = 0; i < 4; i++) line(ctx, -50 + i * 34, -30, -48 + i * 34, 20, 30, sk);   // the fingers
  });
  paint(() => {
    for (let i = 0; i < 4; i++) { circle(ctx, -50 + i * 34, -34, 7, rgba(skd, 0.45)); line(ctx, -60 + i * 34, 8, -40 + i * 34, 8, 3, rgba(skd, 0.6)); }
    ellipse(ctx, -98, 4, 9, 6, '#FBE4D6');
  });
  ctx.restore();
  return { glow: 0.85, push: { k: 1 + 0.03 * jolt, cx: 540, cy: 900 } };
};

// ================================================================ AGING: a time-lapse; he grows old, the honey doesn't (wide)
function hnAgingState(t) {
  const c = cu();
  const sp = ramp(t, c.lapse, c.lapse + 0.5, E.inCubic) * (1 - ramp(t, c.way - 0.1, c.way + 0.4, E.outCubic));   // lapse speed 0..1
  // the lapse's own clock: fast in the middle, slows to a stop on "Way longer"
  const lap = (() => { let a = 0; const n = 40; const t0 = c.lapse, t1 = Math.min(t, c.you_end + 1); for (let i = 0; i < n; i++) { const u = t0 + (t1 - t0) * (i + 0.5) / n; a += (t1 - t0) / n * ramp(u, c.lapse, c.lapse + 0.5, E.inCubic) * (1 - ramp(u, c.way - 0.1, c.way + 0.4, E.outCubic)); } return t > c.lapse ? a : 0; })();
  return {
    sp, lap,
    page: lap * 7,
    night: sp * (0.5 + 0.5 * Math.sin(lap * 38)) + 0.25 * ramp(t, c.way - 0.1, c.way + 0.4),
    season: (lap * 0.42) % 1,
    mould: ramp(t, c.lapse + 0.3, c.centuries - 0.2, (x) => x),
    fur: ramp(t, c.centuries - 0.4, c.centuries_end, (x) => x),
    rot: ramp(t, c.lapse + 0.2, c.centuries, (x) => x),
    age: ramp(t, c.good - 0.1, c.centuries_end - 0.2, E.inOutSine),
    beard: 0.8 * ramp(t, c.beard - 0.1, c.way + 0.2, E.inOutSine),
    web: ramp(t, c.centuries - 0.3, c.way, (x) => x),
    dust: ramp(t, c.centuries - 0.2, c.way, (x) => x),
  };
}
SC.aging = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const A = hnAgingState(t);
  const cam = { x: 700, y: 1215, zoom: 1.42 + 0.05 * clamp(lt / D), rot: 0 };
  hnKitchenBack(cam, t, { night: A.night, season: A.season, page: A.page, web: A.web, lamp: 1 });
  hnKettle(ctx, 1040, HN_ITEM_Y, 0.9);
  // him: leaning on the counter, watching the jar; growing old (hair, beard to the counter, glasses, a stoop); on "YOU"
  // the punch-in finds his old face as his eyes slide to the jar
  const sideEye = ramp(t, c.you - 0.15, c.you + 0.25, E.inOutSine);
  const f0 = Object.assign({}, FACES.calm, { lookX: 0.6, lookY: 0.5 });
  const fOld = Object.assign({}, FACES.drowsy, { lookX: 0.2, lookY: 0.2, mouth: 'flat', blink: 0.5 });
  const fYou = Object.assign({}, FACES.annoyed, { lookX: 1, lookY: 0.35, blink: 0.45, browTilt: -0.4 });
  const face = sideEye > 0 ? lerpFace(fOld, fYou, sideEye) : lerpFace(f0, fOld, A.age);
  hnKHero(cam, t, {
    eL: [470, 1320], wL: [524, 1336], eR: [730, 1318], wR: [676, 1336],
    face, age: A.age, beard: A.beard, glasses: ramp(t, c.centuries, c.centuries + 0.3), stoop: A.age, lean: 0.0,
    headDY: 18 * A.age, headRot: 0.05 * sideEye,
    blink: popK(t, c.and + 0.5, c.and + 0.62, 0.04, 0.05) * 0.96,
  });
  hnCounter(cam, t, { dust: A.dust });
  hnPlate(ctx, HN_PLATE.x, HN_PLATE.y);
  hnToast(ctx, HN_PLATE.x, HN_PLATE.y - 12, 0.85, 0, { flat: 1, honey: 1, mould: A.mould, fur: A.fur });
  hnBanana(ctx, HN_BAN.x, HN_BAN.y, 1, t, A.rot);
  hnJar(ctx, HN_JAR.x, HN_JAR.y, 1, { lid: 1, glint: 0.5 + 0.5 * popK(t, c.you, c.you_end + 0.4, 0.1, 0.2) });
  // the jar stays new: a sparkle now and then, a big TING on "YOU"
  screenSpace();
  const p = toScreen(cam, HN_JAR.x + 50, HN_JAR.y - 160);
  for (let i = 0; i < 3; i++) { const tt = c.lapse + 0.4 + i * 0.9; hnSparkle(p[0] - 30 * i, p[1] + 40 * i, 34, popK(t, tt, tt + 0.35, 0.08, 0.2), i); }
  hnSparkle(p[0], p[1], 64, popK(t, c.you + 0.02, c.you_end + 0.35, 0.1, 0.2), 0.3);
  // the room flickers day/night while the lapse runs (the jar's glow stays)
  const nk = A.sp * (0.5 - 0.5 * Math.cos(A.lap * 38));
  if (nk > 0.01) { ctx.fillStyle = `rgba(14,18,52,${0.34 * nk})`; ctx.fillRect(0, 0, W, H); }
  return { glow: 0.85 };
};

// ================================================================ TOMB: the oldest honey ever found (medium, low angle)
const HN_LEDGE = { x0: 640, x1: 1060, y: 1500 };
function hnLedge(cam) {
  applyCam(cam);
  rrect(ctx, HN_LEDGE.x0, HN_LEDGE.y, HN_LEDGE.x1 - HN_LEDGE.x0, 420, 10); ctx.fillStyle = '#7A5E47'; ctx.fill();
  rrect(ctx, HN_LEDGE.x0 - 10, HN_LEDGE.y - 18, HN_LEDGE.x1 - HN_LEDGE.x0 + 20, 30, 8); ctx.fillStyle = '#8E6E53'; ctx.fill();
}
function hnTombHero(cam, t, o) {
  const st = { x: o.x, y: o.y, s: o.s, blink: o.blink || 0, headRot: o.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  const L = (p) => ikLocal(st, p[0], p[1]);
  if (o.eL) pose = armAt(pose, 'L', L(o.eL), L(o.wL));
  if (o.eR) pose = armAt(pose, 'R', L(o.eR), L(o.wR));
  pose.handR = o.handR || 'open';
  st.pose = pose; st.face = o.face || FACES.calm;
  applyCam(cam);
  const res = charLayer(cam, st, t, { pal: HNEXP, post: (lc, r, s2) => { hnHelmet(lc, s2, r); if (o.post) o.post(lc, r, s2); } });
  applyCam(cam);
  return res;
}
SC.tomb = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 700, y: 1330 - 20 * clamp(lt / D), zoom: 1.72 + 0.1 * E.inOutSine(clamp(lt / D)), rot: 0 };
  hnTombBack(cam, t, { hz: -80 });
  applyCam(cam);
  const lift = E.inOutCubic(ramp(t, c.found - 0.1, c.found + 0.4, (x) => x));
  if (lift < 0.5) hnLedge(cam);
  // the jar: on the ledge, dusty; brushed clean from the top; lifted into the torchlight on "found?"
  const jarLedge = [800, HN_LEDGE.y - 12], jarHeld = [670, 1450];
  const jp = [lerp(jarLedge[0], jarHeld[0], lift), lerp(jarLedge[1], jarHeld[1], lift)];
  const brush = ramp(t, c.the - 0.05, c.found - 0.15, (x) => x);
  const stroke = Math.sin((t - c.the) * loopW(9));
  const dust = 1 - 0.85 * brush;
  const awe = ramp(t, c.found, c.found + 0.3);
  const f = lerpFace(Object.assign({}, FACES.calm, { lookX: 0.9, lookY: 0.6, mouth: 'flat' }), Object.assign({}, FACES.startled, { mouth: 'o', lookX: 0.5, lookY: 0.2 }), awe);
  const hx = 500, hy = 1690, s = 1;
  const grabL = [lerp(560, jp[0] - 92, lift), lerp(1430, jp[1] - 120, lift)], grabR = [lerp(780 + 50 * stroke * (1 - lift), jp[0] + 92, lift), lerp(1290 - 12 * stroke * (1 - lift), jp[1] - 130, lift)];
  const drawJar = () => hnOldJar(ctx, jp[0], jp[1], 0.82, { dust, glow: awe });
  if (lift >= 0.5) hnLedge(cam);
  if (lift < 0.5) drawJar();
  hnTombHero(cam, t, {
    x: hx, y: hy, s, face: f,
    eL: [lerp(450, grabL[0] - 40, lift), lerp(1390, grabL[1] + 50, lift)], wL: grabL,
    eR: [lerp(660, grabR[0] + 10, lift), lerp(1380, grabR[1] + 70, lift)], wR: grabR,
    post: (lc, r, st) => {
      if (lift < 0.5) { const h = hnHandW(st, r, 'R'); hnBrush(lc, h[0], h[1], 1.0, 2.5 + 0.2 * stroke); circle(lc, h[0], h[1], 12, PAL.skin); }
    },
  });
  if (lift >= 0.5) { drawJar(); }
  // dust puffs off the jar while he brushes
  for (let i = 0; i < 3; i++) { const t0 = c.the + 0.1 + i * 0.45; hnDustPuff(ctx, jarLedge[0] + 40 - i * 30, jarLedge[1] - 200 + i * 30, ramp(t, t0, t0 + 0.6, (x) => x), 1.2); }
  return { glow: 0.9 };
};

// ================================================================ PYRAMID: older than the pyramids (wide, high angle)
SC.pyramid = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 560, y: 1080 - 40 * E.inOutSine(clamp(lt / D)), zoom: 1.0 + 0.05 * clamp(lt / D), rot: 0 };
  hnPyramidBack(cam, t, { hz: 120 });
  applyCam(cam);
  const hx = 340, hy = 1650, s = 0.98;
  const raise = E.outBack(ramp(t, shot.start, shot.start + 0.35, (x) => x), 1.4);
  const jy = lerp(1300, 1146, raise);
  const proud = Object.assign({}, FACES.grin, { lookX: 0.3, lookY: -0.6 });
  hnTombHero(cam, t, { x: hx, y: hy, s, face: proud,
    eL: [hx - 96 * s, hy - 420 * s], wL: [hx - 50 * s, jy - 22],
    eR: [hx + 96 * s, hy - 420 * s], wR: [hx + 50 * s, jy - 22],
    post: (lc) => { hnOldJar(lc, hx, jy, 0.42, { dust: 0.15, glow: 0.8 }); },
  });
  // the two ages
  screenSpace();
  const pj = toScreen(cam, hx, jy - 120);
  hnTag(Math.max(330, pj[0] + 10), pj[1] - 130, 'OLDEST HONEY', '~5,500 YEARS', '#FFD447', popK(t, c.tag1, shot.end + 1, 0.14, 0.1), -0.04);
  hnTag(718, 540, 'THE PYRAMIDS', '~4,500 YEARS', '#FF9A3C', popK(t, c.tag2, shot.end + 1, 0.14, 0.1), 0.04);
  return { glow: 0.9 };
};

// ================================================================ BUTTON: maybe don't eat THAT one (CU, back in the tomb)
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 560, y: 1240, zoom: 2.25, rot: 0 };
  hnTombBack(cam, t, { hz: -40 });
  const up = E.inOutCubic(ramp(t, c.scoop, c.maybe + 0.25, (x) => x)), down = E.inOutCubic(ramp(t, c.lower, c.loop - 0.02, (x) => x));
  const fr = ramp(t, c.freeze, c.freeze + 0.12);
  const eat = Object.assign({}, FACES.grin, { mouth: 'o', mouthOpen: 1, blink: 0.95, browY: 0.9 });
  const caught = Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.9, lookX: 0, lookY: 0, browY: 1.6 });
  const face = lerpFace(Object.assign({}, FACES.grin, { lookX: 0.4, lookY: 0.6 }), fr > 0 ? lerpFace(eat, caught, fr) : eat, up);
  const wR = [lerp(700, 652, up) + 70 * down, lerp(1460, 1388, up) - 50 * down], rot = lerp(0.3, -0.42, up) + 1.5 * down;
  hnTombHero(cam, t, { x: 540, y: 1700, s: 1, face,
    eL: [452, 1410], wL: [492, 1452],
    eR: [lerp(710, 730, up), lerp(1440, 1430, up)], wR,
    post: (lc, r, st) => {
      hnOldJar(lc, 470, 1600, 0.78, { dust: 0.2 });
      const h = hnHandW(st, r, 'R');
      const sx = h[0] + Math.sin(rot) * 100, sy = h[1] - Math.cos(rot) * 100;
      hnSpoon(lc, sx, sy, 1.0, rot, { lump: 1 });
      circle(lc, h[0], h[1], 14, PAL.skin);
    },
  });
  // a stink line and a fly over the lump (paint), once he has stopped
  screenSpace();
  return { glow: 0.85 };
};

// ================================================================ COVER (cover.sh): the old man and the jar that will outlive him
SC.cover = (lt, t, shot) => {
  const c = cu();
  const cam = { x: 700, y: 1150, zoom: 2.0, rot: 0 };
  hnKitchenBack(cam, c.you, { night: 0.25, season: 0.2, page: 3, web: 1, lamp: 1 });
  hnKHero(cam, c.you, {
    eL: [470, 1320], wL: [524, 1336], eR: [730, 1318], wR: [676, 1336],
    face: Object.assign({}, FACES.annoyed, { lookX: 1, lookY: 0.35, blink: 0.45, browTilt: -0.4 }), age: 1, beard: 0.8, glasses: 1, stoop: 1, headDY: 18,
  });
  hnCounter(cam, c.you, { dust: 1 });
  hnPlate(ctx, HN_PLATE.x, HN_PLATE.y);
  hnToast(ctx, HN_PLATE.x, HN_PLATE.y - 12, 0.85, 0, { flat: 1, honey: 1, mould: 1, fur: 1 });
  hnJar(ctx, HN_JAR.x, HN_JAR.y, 1, { lid: 1, glint: 1 });
  screenSpace();
  const p = toScreen(cam, HN_JAR.x + 50, HN_JAR.y - 160);
  hnSparkle(p[0], p[1], 80, 1, 0.3);
  bigWord('IT WILL', 540, 500, 124, '#FFFFFF', 1, -0.03);
  bigWord('OUTLIVE YOU', 540, 650, 136, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  // nothing to cache: every world is drawn with shapes each frame, so it catches the light
}
