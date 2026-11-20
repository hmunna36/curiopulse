// Can Your THUMB Bend Back Like a Hitchhiker's? 👍 — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash, flashTop, grain: 0,
//    overlay: fn, noCaptions, capY, focus}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// World: ht_world.js (the desert highway at golden hour, the billboard, the cars, the 2D thumbs-up hand, the rival's cap
// and ponytail). The whole Short is ONE state over time (`htS(tt)`, valid at negative time for the loop): every shot draws
// from it, so the hand never jumps between shots.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light: golden hour, the low sun on the left
const HT_LIGHT = { ...LIGHTS.sunset };
setLights({ hook: HT_LIGHT, hook_b: HT_LIGHT, answer: HT_LIGHT, answer_b: HT_LIGHT, belt: HT_LIGHT, belt_b: HT_LIGHT, rival: HT_LIGHT,
  rival_b: HT_LIGHT, rival_c: HT_LIGHT, chart: HT_LIGHT, myth: HT_LIGHT, xrays: HT_LIGHT, xrays_b: HT_LIGHT, weird: HT_LIGHT,
  weird_b: HT_LIGHT, weird_c: HT_LIGHT, button: HT_LIGHT, cover: HT_LIGHT });

const HT_HS = 1.0;                       // the hand's scale (world px per hand unit)
const HT_ARM_UP = { e: [150, -322], w: [176, -404] };       // rig-local: the forearm up beside his head, thumb up
const HT_ARM_DN = { e: [96, -282], w: [112, -196] };        // rig-local: the arm down by his side
const htClone = (p) => JSON.parse(JSON.stringify(p));

// ---------------------------------------------------------------- the state of everything at time tt
function htS(tt) {
  const c = cu(), S = {};
  const r = (a, b, e = E.inOutCubic) => (tt < 0 ? 0 : ramp(tt, a, b, e));
  const pk = (a, b, i = 0.1, o = 0.12) => (tt < 0 ? 0 : popK(tt, a, b, i, o));
  // ---- his right thumb's top joint (rad, + = bent back): the hook strains to 0.3 and stops; it relaxes for the wide;
  // the seatbelt holds it; "Feel it catch?" strains again; then it rests
  let ip = 0, sh = 0;
  if (tt >= 0) {
    ip = 0.3 * r(c.bend1 + 0.05, c.back1 - 0.05, E.outCubic) * (1 - r(c.barely, c.barely + 0.4));
    sh = popK(tt, c.bend1, c.back1_end + 0.1, 0.2, 0.2);
    ip += 0.3 * r(c.feel - 0.05, c.catch + 0.1, E.outCubic) * (1 - r(c.hers - 0.3, c.hers));
    sh = Math.max(sh, popK(tt, c.catch - 0.05, c.locked_end, 0.15, 0.2) * 0.8);
    // the button: his OTHER thumb; the right hand is down from "Now try" to the loop cut
  }
  S.ip = ip; S.shake = sh * 2.2 * Math.sin(tt * 61);
  S.pump = tt < 0 ? 0 : 6 * Math.sin(clamp(inv(c.up - 0.05, c.up_end + 0.1, tt)) * Math.PI);   // the "Thumbs up!" pump (px)
  // ---- the seatbelt (outside on the skin from the click), then inside the glass
  S.belt = tt < 0 ? 0 : r(c.seatbelt + 0.1, c.click + 0.02, E.outCubic) * (1 - r(c.hers - 0.1, c.hers + 0.05));
  S.glass = tt < 0 ? 0 : r(c.feel - 0.15, c.feel + 0.2) * (1 - r(c.hers - 0.1, c.hers + 0.1));
  S.slack = 1 - clamp(ip / 0.28);
  S.lock = tt < 0 ? 0 : Math.max(pk(c.click, c.click + 0.5, 0.04, 0.2), r(c.lock - 0.05, c.lock + 0.03, E.outCubic) * (1 - r(c.hers - 0.1, c.hers)));
  S.palmTag = pk(c.palm - 0.1, c.shot_rival - 0.05, 0.15, 0.08);
  S.lockTag = pk(c.lock - 0.03, c.shot_rival - 0.05, 0.1, 0.08);
  S.clickTag = pk(c.click, c.shot_belt - 0.03, 0.08, 0.08);
  S.q = pk(c.back1_end - 0.15, c.shot_answer - 0.02, 0.1, 0.08);
  // ---- the rival's thumb: a hook on "Hers?", the bungee inside it
  S.rip = tt < 0 ? 0.15 : 0.15 + 1.25 * r(c.hers - 0.05, c.hers_end + 0.25, E.outBack);
  S.rglass = tt < 0 ? 0 : r(c.less - 0.15, c.less + 0.15) * (1 - r(c.shot_rival_c - 0.05, c.shot_rival_c));
  S.rbungee = S.rglass;
  S.rstretch = tt < 0 ? 0 : 0.5 + 0.5 * r(c.more, c.bungee + 0.2) + 0.12 * Math.sin((tt - c.boing) * 26) * popK(tt, c.boing, c.cord_end, 0.03, 0.3);
  S.rwave = pk(c.skid + 0.6, c.shot_chart, 0.2, 0.1);
  // ---- the cars: 1 passes him, 2 stops for her, 3 stops for him
  S.car1 = tt < 0 ? null : (tt > c.car1 - 0.6 && tt < c.car1 + 1.0 ? lerp(1700, -700, inv(c.car1 - 0.6, c.car1 + 1.0, tt)) : null);
  if (tt >= c.shot_rival_c - 0.1 && tt < c.shot_chart) {
    const u = clamp(inv(c.shot_rival_c - 0.1, c.skid + 0.55, tt));
    S.car2 = lerp(1500, 330, E.outCubic(u)); S.brake2 = popK(tt, c.skid - 0.05, c.shot_chart, 0.06, 0.2);
    S.honk2 = popK(tt, c.skid + 0.55, c.skid + 1.0, 0.05, 0.1);
  }
  if (tt >= c.brake9 - 0.5 && tt < c.end) {
    const u = clamp(inv(c.brake9 - 0.5, c.brake9 + 0.3, tt));
    S.car3 = lerp(1700, 905, E.outCubic(u)); S.brake3 = popK(tt, c.brake9 - 0.05, c.end, 0.06, 0.2);
    S.honk3 = popK(tt, c.brake9 + 0.25, c.end, 0.05, 0.1);
  }
  // ---- the billboard
  S.board = {
    xray: tt < 0 ? 0 : (tt >= c.shot_xrays + 0.12 ? 1 : 0),
    flip: pk(c.shot_xrays - 0.02, c.shot_xrays + 0.28, 0.12, 0.12),
    myth: tt < 0 ? 0 : r(c.slam - 0.06, c.slam + 0.06, E.outCubic) * (tt < c.shot_xrays + 0.12 ? 1 : 0),
    sweep: tt < 0 ? 0 : r(c.found - 0.1, c.between5 + 0.2, (x) => x),
    protractor: tt < 0 ? 0 : r(c.theline - 0.1, c.theline + 0.3, E.outCubic),
    needle: tt < 0 ? 0 : (tt < c.fifty ? 0.55 + 0.75 * Math.sin((tt - c.theline) * 7.5) * 0.6 : lerp(0.55 + 0.75 * Math.sin((c.fifty - c.theline) * 7.5) * 0.6, 50 * Math.PI / 180, r(c.fifty - 0.05, c.degrees, E.outBack))),
    line50: tt < 0 ? 0 : r(c.line50 - 0.02, c.line50 + 0.25),
    card: tt < 0 ? 0 : r(c.picked - 0.08, c.picked + 0.25, E.outCubic),
    faces: { straight: tt >= c.slam - 0.05 ? 'shock' : 'smug', hook: tt >= c.slam - 0.05 ? 'shock' : 'smug' },
  };
  S.fiftyTag = pk(c.line50, c.shot_weird_c - 0.03, 0.1, 0.08);
  S.bigCard = pk(c.picked - 0.06, c.shot_button - 0.03, 0.15, 0.08);
  // ---- the button: the right arm goes down, the left comes up with its thumb; then the loop cut
  S.armR = 1 - r(c.now9 - 0.05, c.try + 0.05);             // 1 = up
  S.armL = r(c.try + 0.1, c.other + 0.02, E.outBack);
  S.lip = tt < 0 ? 0 : 0.62 * r(c.thumb9 - 0.05, c.thumb9_end, E.outBack);
  S.lshake = tt < 0 ? 0 : popK(tt, c.thumb9 - 0.05, c.thumb9_end + 0.1, 0.1, 0.2) * 1.5 * Math.sin(tt * 55);
  // ---- his face
  const lookHand = { lookX: 0.85, lookY: -0.55 };
  let f = { ...FACES.calm, ...lookHand, browY: 0.3, mouth: 'grin', mouthOpen: 0.35 };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.95, browTilt: 1.0, browY: 0.6 }, r(c.bend1, c.bend1 + 0.3));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.8, lookY: -0.5 }, r(c.back1_end - 0.1, c.back1_end + 0.15));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.9, lookY: 0.0 }, r(c.car1 + 0.2, c.car1 + 0.45));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, eyeOpen: 1.1, mouth: 'o', mouthOpen: 0.5 }, r(c.your2, c.your2 + 0.25));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.0, lookY: 0.0 }, r(c.click + 0.1, c.click + 0.35));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.9 }, r(c.feel - 0.05, c.feel + 0.2));
    f = lerpFace(f, { ...FACES.startled, lookX: -1, lookY: 0 }, r(c.hers - 0.05, c.hers + 0.15));
    f = lerpFace(f, { ...FACES.shock, lookX: -1, lookY: 0, mouthOpen: 0.85 }, r(c.skid + 0.3, c.skid + 0.5));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.9, lookY: -0.9 }, r(c.picked - 0.1, c.picked + 0.2));
    f = lerpFace(f, { ...FACES.calm, lookX: -0.8, lookY: -0.4, mouth: 'flat', mouthOpen: 0.2 }, r(c.now9 - 0.1, c.try));
    f = lerpFace(f, { ...FACES.startled, lookX: -0.9, lookY: -0.5 }, r(c.thumb9 + 0.05, c.thumb9 + 0.2));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.6, lookY: 0 }, r(c.brake9 + 0.15, c.brake9 + 0.35));
  }
  S.face = f;
  S.hdx = tt < 0 ? 0 : 7 * Math.sin(tt * 40) * popK(tt, c.car1 - 0.05, c.car1 + 0.5, 0.05, 0.3);
  S.hrot = tt < 0 ? 0.02 : 0.02 - 0.05 * r(c.back1_end - 0.1, c.back1_end + 0.15) * (1 - r(c.barely, c.barely + 0.3))
    + 0.06 * r(c.picked - 0.1, c.picked + 0.2) * (1 - r(c.now9 - 0.1, c.now9 + 0.2));
  return S;
}

// ---------------------------------------------------------------- the cameras (world: x, y, zoom)
const HT_CAM_HOOK = { x: 705, y: 1346, zoom: 2.5, rot: 0 };
function htCam(tt) {
  const c = cu();
  const sh = (id) => [c['shot_' + id], htNext(id)];
  const mv = (id, a, b, e = E.inOutSine) => { const [t0, t1] = sh(id); const u = ramp(tt, t0, t1, e); return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), zoom: lerp(a[2], b[2], u), rot: 0 }; };
  if (tt < 0) return { ...HT_CAM_HOOK };
  if (tt < c.shot_hook_b) return mv('hook', [705, 1346, 2.5], [708, 1344, 2.62]);
  if (tt < c.shot_answer) {
    if (tt < c.cut_back) return mv('hook_b', [786, 1252, 4.3], [790, 1250, 4.55]);
    const u = ramp(tt, c.cut_back, c.shot_answer, E.inOutSine);
    return { x: lerp(808, 811, u), y: lerp(1228, 1226, u), zoom: lerp(5.5, 5.75, u), rot: 0 };
  }
  if (tt < c.shot_answer_b) return mv('answer', [560, 1380, 1.12], [575, 1376, 1.17]);
  if (tt < c.shot_belt) {
    if (tt < c.cut_click) return mv('answer_b', [690, 1300, 2.9], [700, 1296, 3.05]);
    const u = ramp(tt, c.cut_click, c.shot_belt, E.inOutSine);
    return { x: lerp(806, 810, u), y: lerp(1236, 1232, u), zoom: lerp(4.3, 4.45, u), rot: 0 };
  }
  if (tt < c.shot_belt_b) return mv('belt', [812, 1236, 5.2], [815, 1232, 5.45]);
  if (tt < c.shot_rival) return mv('belt_b', [796, 1222, 3.6], [800, 1220, 3.75]);
  if (tt < c.shot_rival_b) return mv('rival', [340, 1352, 2.0], [346, 1348, 2.08]);
  if (tt < c.shot_rival_c) return mv('rival_b', [432, 1250, 4.6], [436, 1246, 4.8]);
  if (tt < c.shot_chart) return mv('rival_c', [470, 1420, 1.08], [480, 1418, 1.12]);
  if (tt < c.shot_myth) return mv('chart', [855, 975, 2.02], [856, 965, 2.16]);
  if (tt < c.shot_xrays) return mv('myth', [858, 1000, 2.28], [858, 998, 2.33]);   // the labels stay above y 1050 (the button column)
  if (tt < c.shot_xrays_b) return mv('xrays', [855, 965, 2.08], [856, 962, 2.14]);
  if (tt < c.shot_weird) return mv('xrays_b', [745, 945, 3.2], [975, 945, 3.2]);
  if (tt < c.shot_weird_b) return mv('weird', [860, 935, 2.75], [860, 930, 2.85]);
  if (tt < c.shot_weird_c) return mv('weird_b', [858, 915, 3.5], [858, 912, 3.6]);
  if (tt < c.shot_button) return mv('weird_c', [650, 1330, 2.15], [656, 1326, 2.22]);
  if (tt < c.cut_other) return mv('button', [640, 1360, 1.95], [645, 1358, 2.02]);
  if (tt < c.loopcut) { const u = ramp(tt, c.cut_other, c.loopcut, E.inOutSine); return { x: lerp(552, 556, u), y: lerp(1346, 1344, u), zoom: lerp(2.25, 2.3, u), rot: 0 }; }
  return { ...HT_CAM_HOOK };
}
function htNext(id) {
  const ids = ['hook', 'hook_b', 'answer', 'answer_b', 'belt', 'belt_b', 'rival', 'rival_b', 'rival_c', 'chart', 'myth', 'xrays', 'xrays_b', 'weird', 'weird_b', 'weird_c', 'button'];
  const c = cu(), i = ids.indexOf(id);
  return i < ids.length - 1 ? c['shot_' + ids[i + 1]] : c.end;
}

// ---------------------------------------------------------------- him (his layer), her (an actor)
function htHero(cam, t, S, tt) {
  let p = htClone(POSES.stand);
  const up = S.armR, lu = S.armL;
  p = armAt(p, 'R', ...[armMix(HT_ARM_DN, HT_ARM_UP, up)].map((m) => [m.e, m.w])[0]);
  const ML = armMix({ e: [-HT_ARM_DN.e[0], HT_ARM_DN.e[1]], w: [-HT_ARM_DN.w[0], HT_ARM_DN.w[1]] }, { e: [-HT_ARM_UP.e[0], HT_ARM_UP.e[1]], w: [-HT_ARM_UP.w[0], HT_ARM_UP.w[1]] }, lu);
  p = armAt(p, 'L', ML.e, ML.w);
  p.handR = up > 0.5 ? 'none' : 'open'; p.handL = lu > 0.5 ? 'none' : 'open';
  const st = { x: HT.hx, y: HT.hy, s: HT.hs, pose: p, face: S.face, headRot: S.hrot, headDX: S.hdx, headDY: 2 * Math.sin(t * loopW(1.6)) };
  const hands = {};
  const r = charLayer(cam, st, t, { pal: PAL, post: (c, rr) => {
    if (up > 0.5) {
      const w = toWorld(st, rr.wrR);
      hands.R = htHand(c, w[0], w[1] - S.pump, HT_HS, { dir: 1, rot: 0.2, ip: S.ip, shake: S.shake, belt: S.belt, slack: S.slack, lock: S.lock, glass: S.glass, t });
    }
    if (lu > 0.5) {
      const w = toWorld(st, rr.wrL);
      hands.L = htHand(c, w[0], w[1], HT_HS, { dir: -1, rot: -0.2, ip: S.lip, shake: S.lshake, t });
    }
  } });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  return { r, st, hands };
}
function htRival(cam, t, S) {
  applyCam(cam);
  let p = htClone(POSES.stand);
  p = armAt(p, 'R', HT_ARM_UP.e, HT_ARM_UP.w);
  p.handR = 'none';
  if (S.rwave > 0.01) p = armAt(p, 'L', [-140, -330], [-120 - 30 * Math.sin(t * 18) * S.rwave, -420]);
  const st = { x: HT.rx, y: HT.ry, s: HT.rs, pose: p, face: { ...FACES.grin, lookX: 0.7, lookY: -0.5, mouthOpen: 0.4, browY: 0.6 }, headRot: -0.04, headDY: 2 * Math.sin(t * loopW(1.9) + 1) };
  let hand = null;
  actor(() => {
    const rr0 = rig(p), hw = toWorld(st, rr0.head);
    htRivalPre(ctx, { head: hw }, t);
    const rr = drawCharacter(ctx, st, t, RIVPAL);
    const w = toWorld(st, rr.wrR);
    hand = htHand(ctx, w[0], w[1], HT_HS * 0.95, { dir: 1, rot: 0.2, ip: S.rip, glass: S.rglass, bungee: S.rbungee, stretch: S.rstretch, t, pal: RIVPAL });
    htRivalPost(ctx, { head: toWorld(st, rr.head) }, t);
  });
  return { hand, st };
}

// ---------------------------------------------------------------- the whole picture at time tt
function htFrame(tt, t, o = {}) {
  const S = htS(tt), cam = o.cam || htCam(tt), c = cu();
  if (o.patch) o.patch(S);
  htSky(cam, t);
  const bs = { ...S.board };
  htLand(cam, t, { boardState: bs });
  applyCam(cam);
  // the billboard's flip to the x-ray box: a squash across its middle
  // cars on the near lane, behind the people
  if (S.car1 !== null && S.car1 !== undefined) htCar(ctx, S.car1, 1376, 1.9, t, { col: '#2E86DE', dk: '#1C5FA6', speed: 1, spin: -t * 40 });
  if (S.car2 !== undefined) htCar(ctx, S.car2, 1376, 1.9, t, { col: '#E8343C', dk: '#A81E26', speed: 1 - clamp(inv(c.skid, c.skid + 0.5, tt)), brake: S.brake2, honk: S.honk2, spin: -S.car2 / 30 });
  if (S.car3 !== undefined) htCar(ctx, S.car3, 1376, 1.9, t, { col: '#2FBF71', dk: '#1E8A50', speed: 1 - clamp(inv(c.brake9, c.brake9 + 0.3, tt)), brake: S.brake3, honk: S.honk3, spin: -S.car3 / 30 });
  const R = (tt >= 0 && tt >= c.shot_chart) ? null : htRival(cam, t, S);   // she rides off in her car after rival_c
  const H = htHero(cam, t, S, tt);
  return { S, cam, H, R };
}

// ---------------------------------------------------------------- overlays (screen space)
function htTag(txt, x, y, k, col, size = 64, rot = -0.06) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.7, h = size * 1.25;
  rrect(ctx, -w / 2, -h / 2, w, h, h * 0.3); ctx.fillStyle = '#14112A'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 3);
  ctx.restore();
}
function htArrow(a, b, k, col) {
  if (k <= 0.01) return;
  const x1 = lerp(a[0], b[0], E.outCubic(k)), y1 = lerp(a[1], b[1], E.outCubic(k));
  line(ctx, a[0], a[1], x1, y1, 10, '#14112A'); line(ctx, a[0], a[1], x1, y1, 6, col);
  const an = Math.atan2(y1 - a[1], x1 - a[0]);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x1 + Math.cos(an) * 16, y1 + Math.sin(an) * 16);
  ctx.lineTo(x1 + Math.cos(an + 2.4) * 22, y1 + Math.sin(an + 2.4) * 22); ctx.lineTo(x1 + Math.cos(an - 2.4) * 22, y1 + Math.sin(an - 2.4) * 22); ctx.closePath(); ctx.fill();
}
function htOverlays(F, tt, t) {
  const S = F.S, cam = F.cam, c = cu();
  screenSpace();
  const hr = F.H.hands.R;
  if (hr) {
    const ipS = toScreen(cam, hr.ip[0], hr.ip[1]);
    // the strain: motion marks round the tip
    if (Math.abs(S.shake) > 0.05 && cam.zoom > 3) shockLines(ipS[0] + 30, ipS[1] - 70, 90, 0.6, 8, '#FFFFFF', 3);
    if (S.q > 0.01) bigWord('?', clamp(ipS[0] + 170, 300, 900), clamp(ipS[1] - 120, 480, 1000), 190, '#FFD447', E.outBack(S.q, 2), 0.12);
    if (S.clickTag > 0.01) htTag('CLICK!', clamp(ipS[0] - 260, 260, 820), clamp(ipS[1] - 220, 480, 1000), S.clickTag, '#7FE9FF', 78, -0.1);
    if (S.palmTag > 0.01 && hr.beltMid) {
      const m = toScreen(cam, hr.beltMid[0], hr.beltMid[1]);
      htTag('PALM SIDE', clamp(m[0] - 250, 250, 820), clamp(m[1] + 210, 520, 1120), S.palmTag, '#7FE9FF', 64, -0.05);
      htArrow([clamp(m[0] - 200, 250, 820), clamp(m[1] + 160, 520, 1120)], [m[0] - 26, m[1] + 18], S.palmTag, '#7FE9FF');
    }
    if (S.lockTag > 0.01 && hr.beltMid) {
      const m = toScreen(cam, hr.beltMid[0], hr.beltMid[1]);
      htTag('LOCKED', clamp(m[0] + 40, 300, 800), clamp(m[1] - 330, 520, 1000), S.lockTag, '#FF5A6E', 80, 0.08);
    }
  }
  if (S.fiftyTag > 0.01) bigWord('50°', 540, 560, 230, '#FF3B5C', E.outBack(S.fiftyTag, 2), -0.04);
  if (S.bigCard > 0.01) { ctx.save(); ctx.setTransform(2.3, 0, 0, 2.3, 0, 0); htCard1953(ctx, 600 / 2.3, 600 / 2.3, S.bigCard); ctx.restore(); }
}

// ---------------------------------------------------------------- shots
function htShot(lt, t, shot) {
  const F = htFrame(t, t);
  htOverlays(F, t, t);
  const c = cu();
  // punch-ins centre between his face and the thumb (or the billboard's middle)
  let focus = null;
  if (F.H.hands.R && t < c.shot_chart) {
    const hs = toScreen(F.cam, F.H.hands.R.ip[0], F.H.hands.R.ip[1]), hd = toScreen(F.cam, ...toWorld(F.H.st, F.H.r.head));
    focus = [clamp((hs[0] + hd[0]) / 2, 260, 820), clamp((hs[1] + hd[1]) / 2, 480, 1080)];
  } else if (t >= c.shot_chart && t < c.shot_weird_c) {
    const b = toScreen(F.cam, HTB.x, HTB.y);
    focus = [clamp(b[0], 260, 820), clamp(b[1], 480, 1080)];
  }
  return focus ? { glow: 0.8, focus } : { glow: 0.8 };
}
for (const id of ['hook', 'hook_b', 'answer', 'answer_b', 'belt', 'belt_b', 'rival', 'rival_b', 'rival_c', 'chart', 'myth', 'xrays', 'xrays_b', 'weird', 'weird_b', 'weird_c', 'button']) SC[id] = htShot;

// the button's last beat: the loop cut back to frame 1's picture (the hook at negative time)
const _htShotButton = SC.button;
SC.button = (lt, t, shot) => {
  const c = cu();
  if (t >= c.loopcut) { const tt = t - TLd.duration; const F = htFrame(tt, t); htOverlays(F, tt, t); return { glow: 0.8 }; }
  return _htShotButton(lt, t, shot);
};

// the cover: his thumb bent all the way back into a hitchhiker's hook, beside his grin; BEND IT BACK?
SC.cover = (lt, t, shot) => {
  const F = htFrame(0.6, t, { cam: { x: 712, y: 1318, zoom: 2.55, rot: 0 }, patch: (S) => {
    S.ip = 1.2; S.shake = 0; S.q = 0; S.face = { ...FACES.grin, lookX: 0.85, lookY: -0.6, mouthOpen: 0.6, browY: 0.8 };
  } });
  screenSpace();
  bigWord('BEND IT', 540, 1290, 150, '#FFFFFF', 1, -0.05);
  bigWord('BACK?', 540, 1455, 190, '#FFD447', 1, -0.05);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() { initHt(); }
