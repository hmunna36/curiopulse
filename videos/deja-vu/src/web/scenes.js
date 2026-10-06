// Why Do We Get DÉJÀ VU? Short: the shots in the cafe (hook, relax, layout, dejavu, next). Each SC.<id>(lt, t, shot)
// draws one frame (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// e^(-k (t - t0)) after t0, else 0
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }

const FACE_NOSY = Object.assign({}, FACES.calm, { eyeOpen: 1.1, browY: 0.7, browTilt: -0.1, mouth: 'grin', mouthOpen: 0.35 });
const FACE_PUSH = Object.assign({}, FACES.calm, { eyeOpen: 1.08, lookX: 0.1, lookY: 0.1, browY: 0.6, browTilt: -0.1, mouth: 'flat', mouthOpen: 0.5 });
const FACE_DEJA = Object.assign({}, FACES.startled, { eyeOpen: 1.45, pupil: 0.46, browY: 1.5, browTilt: 0.5, mouth: 'o', mouthOpen: 0.5 });
const FACE_FROZEN = Object.assign({}, FACES.nervous, { eyeOpen: 1.38, pupil: 0.5, lookY: 0, browY: 1.3, browTilt: 0.9, mouth: 'wavy', mouthOpen: 0.3 });
const FACE_SHIVER = Object.assign({}, FACES.nervous, { eyeOpen: 1.3, pupil: 0.55, lookX: 0, lookY: 0, browY: 1.2, browTilt: 1.1 });
const FACE_PHEW = Object.assign({}, FACES.calm, { eyeOpen: 0.95, lookX: 0, lookY: 0.2, browY: 0.5, browTilt: 0.6, mouth: 'o', mouthOpen: 0.25 });
const FACE_HUH = Object.assign({}, FACES.confused, { eyeOpen: 1.2, lookX: 0.7, lookY: -0.5, browY: 1.0, browTilt: 0.9 });
const FACE_HUHCAT = Object.assign({}, FACES.confused, { eyeOpen: 1.38, pupil: 0.6, lookX: 0, lookY: 0.9, browY: 1.4, browTilt: 0.6, mouth: 'flat', mouthOpen: 0.1 });
const FACE_SMUG = Object.assign({}, FACES.calm, { eyeOpen: 0.8, pupil: 1, lookX: 0.75, lookY: 0.15, browY: 0.1, browTilt: -0.8, blink: 0.32, mouth: 'grin', mouthOpen: 0.28 });
const FACE_KID = Object.assign({}, FACES.grin, { eyeOpen: 1.2, lookX: 0.85, lookY: 0.2, browY: 0.9, mouthOpen: 0.7 });
// him, long ago, in pajamas
const PAL_KID = Object.assign({}, PAL, { coat: '#8FB8FF', coatSh: '#5E86D0', coatHi: '#D4E3FF', coatDk: '#4A6CB0', pants: '#8FB8FF', pantsSh: '#5E86D0', sock: '#FFFFFF', pj: true });

// where frame 1 is shot from: close on the glass door, his face and his palm behind it
const CAM_DOOR = [470, 1066, 2.02];
const CAM_ROOM = [540, 1100, 1.15];
const HERO = { x: 520, y: 1650, s: 1.25 };
const STAND = () => JSON.parse(JSON.stringify(POSES.stand));

// ---------------------------------------------------------------- the cafe, with him in it
// o: room options (door, bell, lamp, cup, steam) + hero: {st, outside, ambient, post, alpha}, ghosts: [{st, a}] (see-through
// copies of him), people: [{st, pal, a, post}], cat: [{x, look}], wire: {ks, a}, kitchen: {a, then}, fog: 0..1
function cafeScene(cam, t, o = {}) {
  cfBack(ctx, gctx, cam, t, o);
  const h = o.hero;
  const hero = (st, a, amb) => {
    ctx.globalAlpha = a;
    const r = charLayer(cam, st, t, { pal: h.pal || PAL, ambient: amb, post: h.post });
    ctx.globalAlpha = 1;
    return r;
  };
  let r = null;
  if (h && h.outside) {                    // still on the street: seen through the doorway, behind the glass
    const a = toScreen(cam, CF.door.x, CF.door.y), b = toScreen(cam, CF.door.x + CF.door.w, CF.door.y + CF.door.h);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]); ctx.clip();
    r = hero(h.st, 1, h.ambient === undefined ? 0.3 : h.ambient);
    ctx.restore();
  }
  cfSet(ctx, gctx, cam);
  if (o.palm) { softDot(ctx, o.palm[0], o.palm[1], 40, '#FFFFFF', 0.16 * o.palm[2]); softDot(gctx, o.palm[0], o.palm[1], 44, '#BFF0FF', 0.2 * o.palm[2]); }
  const edge = cfLeaf(ctx, gctx, t, o.st || 0, o.door || 0);
  if (o.kitchen && o.kitchen.a > 0) cfKitchenOver(cam, t, o.kitchen.a, o.kitchen);
  if (o.fog > 0) cfFog(t, o.fog);
  if (o.wire) cfWire(cam, t, o.wire.ks, o.wire.a, o.wire.col);
  for (const p of o.people || []) if (p.a > 0.01) { ctx.globalAlpha = p.a; charLayer(cam, p.st, t, { pal: p.pal, ambient: 0.12, post: p.post }); ctx.globalAlpha = 1; }   // someone else, over the outlines
  for (const gh of o.ghosts || []) if (gh.a > 0.01) { ctx.globalAlpha = gh.a; charLayer(cam, gh.st, t, { pal: XPAL, aura: 0.55 * gh.a }); ctx.globalAlpha = 1; }
  if (h && !h.outside) r = hero(h.st, h.alpha === undefined ? 1 : h.alpha, h.ambient === undefined ? 0.1 : h.ambient);
  cfSet(ctx, gctx, cam);
  for (const k of o.cat || []) cfCat(ctx, gctx, k.x, k.y || 1716, k.s || 1.0, t, k);
  return { r, edge, head: h ? toWorld(h.st, [r.head[0] + (h.st.headDX || 0), r.head[1] + (h.st.headDY || 0)]) : null };
}
// what a forgotten room looks like: mist
function cfFog(t, k) {
  screenSpace();
  ctx.fillStyle = `rgba(20,28,48,${0.9 * k})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) {
    const x = ((hash(i) * 1400 + t * (30 + 20 * hash(i + 4))) % 1400) - 160, y = 380 + hash(i + 9) * 1100 + 30 * Math.sin(t * 0.7 + i);
    softDot(ctx, x, y, 240 + 160 * hash(i + 2), '#B8C6E6', 0.10 * k);
  }
}

// the walk-in. tt = seconds since the hook began (negative = the loop's last frames: his hand comes up to the glass)
function hookState(tt) {
  const c = cu();
  const u = ramp(tt, 0.3, c.step_in + 0.18, E.inOutSine);          // through the door and into the room
  const st = { x: lerp(428, HERO.x, u), y: lerp(1500, HERO.y, u), s: lerp(1.02, HERO.s, u) };
  const open = ramp(tt, 0, 0.5, E.outCubic) * (1 - ramp(tt, c.step_in - 0.25, c.step_in + 0.55, E.inOutCubic));
  const moving = Math.sin(Math.PI * clamp(u)) > 0.04 ? 1 : 0;
  let pose = moving ? walkPlanted(tt, { speed: 10.5, lift: 20, bob: 6 }) : STAND();
  // the palm on the glass, then on the swinging edge, then it lets go
  const reach = ramp(tt, -0.42, -0.04, E.outCubic) * (1 - ramp(tt, 0.36, 0.66, E.inOutCubic));
  const palm = [Math.max(CF.door.x + CF.door.w * Math.cos(open * 1.38) * 0.8 - 30, st.x + 56), 1224 - 20 * open];
  if (reach > 0.001) {
    pose = lerpPose(pose, ikReach(pose, 'R', ikLocal(st, palm[0], palm[1]), 1), reach);
    pose.hand = reach > 0.5 ? 'spread' : 'open';
  }
  return { st, u, open, pose, moving, outside: u < 0.4, reach, palm };
}
// the cat's walk across the floor, started at t0 (the same walk every time: that is the joke)
function catPass(t, t0) {
  const d = t - t0;
  return d < 0 || d > 1.6 ? null : { x: 1170 - 880 * d, look: 0 };
}
// the name of the feeling: a title with its own echo (screen space; drawn in the overlay so the lamp's bloom stays off it)
function dejaTitle(t, k, y = 580, size = 200) {
  if (k <= 0.01) return;
  for (const [dx, a] of [[-36, 0.2], [36, 0.2], [-18, 0.38], [18, 0.38]]) {
    ctx.globalAlpha = a * (0.6 + 0.4 * Math.sin(t * 11 + dx)); bigWord('DÉJÀ VU', 540 + dx * (1.2 + 0.4 * Math.sin(t * 5)), y, size, '#7FE9FF', k, -0.04);
  }
  ctx.globalAlpha = 1;
  bigWord('DÉJÀ VU', 540, y, size, '#FFD447', k, -0.04);
}

// ---------------------------------------------------------------- 1. hook: a brand-new cafe ... and he has BEEN here
SC.hook = (lt, t, shot) => {
  const c = cu();
  const hs = hookState(t), J = c.jolt;
  const hit = ramp(t, J, J + 0.09), dj = decay(t, J, 3.2);
  const flinch = springStep(t - J, 4.2, 0.4);
  let pose = hs.pose;
  if (t > J) pose = lerpPose(pose, POSES.flinch, 0.55 * flinch);
  const look = Math.sin((t - 1.0) * 2.6);                         // he has a look round his new favourite cafe
  let face = lerpFace(FACE_PUSH, FACE_NOSY, ramp(t, 0.5, 0.9));
  face = Object.assign({}, face, { lookX: lerp(0.1, 0.85 * look, ramp(t, 0.8, 1.2)), lookY: -0.25 * ramp(t, 0.8, 1.2), blink: blinkAt(t, 2, 1.7) });
  face = lerpFace(face, FACE_DEJA, hit);
  if (t > J + 0.5) face = Object.assign({}, face, { lookX: 0.8 * Math.sin((t - J - 0.5) * 7.5), lookY: 0 });   // his eyes go left ... right ...
  const st = Object.assign({}, hs.st, { pose, face, headDY: -10 * flinch * dj, frizz: 0.5 * dj, headRot: 0.03 * Math.sin(t * 9) * hs.moving });
  const [qx, qy] = shake(t, 14 * decay(t, J, 6), 30, 3);
  const cam = camKeys(t, [[0, ...CAM_DOOR], [0.5, 486, 1070, 1.78], [c.step_in + 0.1, ...CAM_ROOM], [J - 0.02, 540, 1100, 1.17], [J + 0.2, 528, 1112, 1.4], [shot.end, 526, 1114, 1.47]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  // see-through copies of the last second, back along his path: he has already walked in once
  const ga = t > J ? 0.75 * Math.exp(-(t - J) * 0.9) * hit : 0;
  const ghosts = [3, 2, 1].map((k) => {
    const g = hookState(c.step_in + 0.18 - 0.24 * k * (1 - Math.exp(-(t - J) * 6)));
    return { st: Object.assign({}, g.st, { pose: g.pose, face: FACE_NOSY, x: g.st.x - 44 * k * (1 - Math.exp(-(t - J) * 6)) }), a: ga * (1 - 0.2 * k) };
  });
  const bell = 0.5 * decay(t, c.chime, 3.2) * Math.sin((t - c.chime) * 26) + 0.3 * decay(t, c.step_in + 0.5, 4) * Math.sin((t - c.step_in - 0.5) * 24);
  // ... and before that, a see-through copy of him does it all first: it walks in ahead of him, stops, and jumps
  const tg = t + c.ahead, g0 = hookState(tg), gf = springStep(tg - J, 4.2, 0.4), ge = ramp(tg, 0.7, 1.7, E.inOutSine);   // (it ends up a step to his right)
  const ahead = {
    st: Object.assign({}, g0.st, {
      x: g0.st.x + 138 * ge, y: g0.st.y + 22 * ge, s: g0.st.s * (1 + 0.05 * ge), pose: tg > J ? lerpPose(g0.pose, POSES.flinch, 0.62 * gf) : g0.pose, face: FACE_NOSY,
      frizz: 0.7 * decay(tg, J, 3.2), headDY: -12 * gf * decay(tg, J, 3.2),
    }),
    a: 0.62 * ramp(t, 0.3, 0.62) * (1 - ramp(t, J - 0.12, J + 0.04)),
  };
  const S = cafeScene(cam, t, {
    door: hs.open, bell, hero: { st, outside: hs.outside }, ghosts: (t > J ? ghosts : []).concat([ahead]), palm: [hs.palm[0], hs.palm[1], hs.reach],
    wire: { ks: Array(8).fill(1), a: 0.42 * decay(t, J, 3.5) * hit },
  });
  const head = toScreen(cam, S.head[0], S.head[1]);
  const gh = toScreen(cam, ahead.st.x, ahead.st.y - 470 * ahead.st.s);
  screenSpace();
  shockLines(head[0], head[1], 130 * cam.zoom, inv(J, J + 0.5, t), 14, '#FFFFFF', 4);
  if (ahead.a > 0.05) shockLines(gh[0], gh[1], 120 * cam.zoom, inv(J - c.ahead, J - c.ahead + 0.45, t), 12, '#9FE8FF', 6);
  const kt = springStep(t - c.title, 4.4, 0.45);
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, 540, 580, 380, '#FFD447', 0.16 * clamp(kt)); gctx.restore();
  return {
    glow: 0.8, flash: 0.14 * decay(t, J, 11), glitch: 0.5 * decay(t, J, 5.5) * hit, zblur: 0.07 * decay(t, J, 8), zcx: head[0], zcy: head[1],
    desat: 0.2 * ramp(t, J, J + 0.25) * (1 - ramp(t, shot.end - 0.3, shot.end)), tint: '#9FD8FF', tintA: 0.1 * ramp(t, J, J + 0.25),
    overlay: () => dejaTitle(t, kt),
  };
};

// ---------------------------------------------------------------- 2. relax: his frozen face
SC.relax = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const gulp = Math.sin(Math.PI * inv(c.gulp, c.gulp + 0.3, t));
  const face = Object.assign({}, FACE_FROZEN, { lookX: Math.sin(lt * 8.5) > 0 ? 0.85 : -0.85 });
  const st = Object.assign({}, HERO, { pose: lerpPose(POSES.stand, POSES.flinch, 0.5), face, headDY: 5 * gulp, frizz: 0.12 });
  const dive = ramp(t, shot.end - 0.3, shot.end, E.inCubic);
  const cam = { x: 524, y: 1070 - 26 * dive, zoom: 2.05 + 0.14 * lt / D + 1.5 * dive, rot: 0 };
  const S = cafeScene(cam, t, { hero: { st } });
  cfSet(ctx, gctx, cam);
  sweatDrop(ctx, S.head[0] + 104, S.head[1] - 46 + 46 * ramp(lt, 0.1, 0.9, E.inCubic), 1.05, ramp(lt, 0.05, 0.2));
  const head = toScreen(cam, S.head[0], S.head[1] - 40);
  return { glow: 0.8, flash: 0.15 * (1 - ramp(lt, 0, 0.09)), zblur: 0.5 * dive, zcx: head[0], zcy: head[1], desat: 0.2, tint: '#9FD8FF', tintA: 0.1 };
};

// ---------------------------------------------------------------- 5. layout: the room's outlines ... are another room's
function teddy(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [dx, dy, r] of [[-20, -44, 12], [20, -44, 12], [-26, 6, 12], [26, 6, 12], [-16, 40, 13], [16, 40, 13]]) circle(c, dx, dy, r, '#8A5A2C');
  ellipse(c, 0, 14, 26, 30, '#A8713E'); circle(c, 0, -28, 24, '#A8713E'); ellipse(c, 0, -22, 11, 8, '#E9CFA0');
  circle(c, -8, -32, 3, '#1B1208'); circle(c, 8, -32, 3, '#1B1208'); circle(c, 0, -24, 3, '#1B1208');
  c.restore();
}
SC.layout = (lt, t, shot) => {
  const c = cu();
  const ks = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ramp(t, c.wire + 0.1 * i, c.wire + 0.1 * i + 0.42, E.inOutCubic));
  const m = ramp(t, c.morph, c.morph + 0.45, E.inOutSine);            // the other room comes up under the same lines
  const fog = ramp(t, c.fog, c.fog + 0.42, E.inOutSine);              // ... and goes: he forgot it
  const cam = camKeys(t, [[shot.start, 540, 1150, 1.14], [c.wire + 0.5, 540, 1180, 1.0], [shot.end, 540, 1180, 1.04]], E.inOutCubic);
  const sway = Math.sin((t - shot.start) * 2.4);
  const scratch = ramp(t, c.fog + 0.1, c.fog + 0.4, E.outBack);
  let pose = STAND();
  pose.armR = { a: lerp(0.2, 2.7, scratch), b: lerp(0.12, 1.18 + 0.12 * Math.sin(t * 16), scratch) };
  const face0 = Object.assign({}, FACE_HUH, { lookX: 0.5 + 0.4 * sway, lookY: -0.55, blink: blinkAt(t, 3, 2.1) });
  const face = lerpFace(face0, Object.assign({}, FACES.confused, { lookX: 0.2, lookY: -0.9, eyeOpen: 1.2, browY: 1.1, browTilt: 1 }), fog);
  const me = { x: 236, y: 1694, s: 1.12, pose, face, headRot: 0.05 * sway * (1 - fog) };
  const kid = { x: 226, y: 1690, s: 0.86, pose: Object.assign(STAND(), { armL: { a: 0.5, b: 0.9 }, armR: { a: 0.3, b: 0.2 } }), face: Object.assign({}, FACE_KID, { blink: blinkAt(t, 7, 1.3) }), headRot: 0.06 };
  const S = cafeScene(cam, t, {
    hero: { st: me, alpha: Math.max(1 - m, fog) },
    kitchen: { a: m * (1 - fog) }, fog, wire: { ks, a: 1 },
    people: [{ st: kid, pal: PAL_KID, a: m * (1 - fog), post: (lc, r, s2) => { const w = toWorld(s2, r.wrL); teddy(lc, w[0] - 6, w[1] + 34, 0.9); } }],
  });
  const head = toScreen(cam, S.head[0], S.head[1]);
  const kq = springStep(t - c.fog - 0.14, 4.2, 0.4);
  return { glow: 0.85, overlay: () => { if (kq > 0.01) bigWord('?', head[0] + 150, head[1] - 150, 230, '#C8A8FF', kq * (1 + 0.05 * Math.sin(t * 8)), 0.14); } };
};

// ---------------------------------------------------------------- 8. dejavu: the shiver has a name (the subscribe aside plays here)
SC.dejavu = (lt, t, shot) => {
  const c = cu();
  const sh = decay(t, c.shiver, 1.5) * ramp(t, c.shiver, c.shiver + 0.08);        // the shiver
  const relax = ramp(t, c.phew, c.phew + 0.45, E.inOutSine);
  const cats = [catPass(t, c.cat1), catPass(t, c.cat2)].filter(Boolean);
  const cat = cats[0];
  const second = t >= c.cat2;
  const NOTICE = c.cat2 + 0.34;
  const dbl = ramp(t, NOTICE, NOTICE + 0.12);                                     // ... the same cat?
  let pose = lerpPose(POSES.stand, POSES.flinch, 0.6 * sh);
  pose = lerpPose(pose, Object.assign(STAND(), { armL: { a: 0.36, b: 0.3 }, armR: { a: 0.36, b: 0.3 } }), 0.5 * Math.sin(Math.PI * inv(c.phew, c.phew + 0.9, t)));
  let face = lerpFace(FACE_FROZEN, FACE_SHIVER, ramp(t, c.shiver, c.shiver + 0.1));
  face = lerpFace(face, FACE_DEJA, ramp(t, c.title2 - 0.05, c.title2 + 0.08) * (1 - relax));
  face = lerpFace(face, FACE_PHEW, relax);
  if (cat) {                                                                      // his eyes go with the cat
    const cx = clamp((cat.x - HERO.x) / 420, -1, 1);
    face = lerpFace(face, Object.assign({}, second ? FACE_HUHCAT : FACES.calm, { lookX: cx, lookY: 0.9, mouth: second ? 'flat' : 'flat', mouthOpen: 0.2 }), second ? Math.max(0.7, dbl) : 0.85);
  }
  face = Object.assign({}, face, { blink: Math.max(face.blink || 0, relax * blinkAt(t, 4, 2.3) * (second ? 0 : 1)) });
  const st = Object.assign({}, HERO, {
    x: HERO.x + 7 * sh * Math.sin(t * 74), pose, face, frizz: 0.42 * sh + 0.3 * decay(t, NOTICE, 3) * dbl, headDY: -6 * sh * Math.abs(Math.sin(t * 40)) - 8 * decay(t, NOTICE, 5) * dbl,
    headRot: second ? -0.07 * dbl * clamp((HERO.x - (cat ? cat.x : 0)) / 400, -1, 1) : 0,
  });
  const cam = camKeys(t, [[shot.start, 524, 1070, 2.25], [c.shiver + 0.25, 524, 1078, 1.95], [c.thats, ...CAM_ROOM], [c.sub_in, 540, 1100, 1.17], [shot.end, 540, 1100, 1.2]], E.inOutCubic);
  const ghosts = [-1, 1].map((sd) => ({ st: Object.assign({}, st, { x: HERO.x + sd * (26 + 60 * sh) }), a: 0.6 * sh }));
  const S = cafeScene(cam, t, { hero: { st }, ghosts, cat: cats.map((k) => Object.assign(k, { look: 0 })) });
  const head = toScreen(cam, S.head[0], S.head[1]);
  // shiver marks beside him
  cfSet(ctx, gctx, cam);
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
    const x0 = S.head[0] + sd * (150 + 18 * i), y0 = S.head[1] - 40 + 70 * i, a = sh * (0.5 + 0.5 * Math.sin(t * 40 + i));
    if (a > 0.02) poly(ctx, [0, 1, 2, 3, 4].map((j) => [x0 + sd * (j % 2 ? 12 : 0), y0 + j * 11]), 6, `rgba(190,240,255,${0.9 * a})`);
  }
  const kt = springStep(t - c.title2, 4.4, 0.45) * (1 - ramp(t, c.sub_in - 0.22, c.sub_in - 0.02, E.inCubic));
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, 540, 580, 380, '#FFD447', 0.16 * clamp(kt)); gctx.restore();
  const kq = springStep(t - c.meow2 + 0.03, 4.6, 0.4);
  return {
    glow: 0.8, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) + 0.1 * decay(t, c.title2, 10), desat: 0.3 * sh, tint: '#9FD8FF', tintA: 0.14 * sh, glitch: 0.3 * decay(t, c.title2, 6) * ramp(t, c.title2, c.title2 + 0.05),
    overlay: () => { dejaTitle(t, kt); if (kq > 0.01) bigWord('?!', head[0] + 196, head[1] - 150, 170, '#C8A8FF', kq, 0.12); },
  };
};

// ---------------------------------------------------------------- 9. next: he "knows" what happens next
// the prediction in his thought bubble: the cup goes over
function predictIcon(x, y, s, t) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  line(ctx, -120, 60, 60, 60, 12, '#8E99A0');
  const k = (t * 1.4) % 1, rot = 1.25 * E.outCubic(clamp(k * 1.8));
  ctx.save(); ctx.translate(20, 56); ctx.rotate(rot);
  ctx.beginPath(); ctx.moveTo(-34, -62); ctx.lineTo(34, -62); ctx.quadraticCurveTo(30, -4, 14, 0); ctx.lineTo(-14, 0); ctx.quadraticCurveTo(-30, -4, -34, -62); ctx.closePath();
  ctx.fillStyle = '#FF5A6E'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#3A0E18'; ctx.stroke();
  ctx.beginPath(); ctx.arc(40, -32, 14, -1.3, 1.5); ctx.lineWidth = 9; ctx.strokeStyle = '#3A0E18'; ctx.stroke();
  ctx.restore();
  for (let i = 0; i < 5; i++) {
    const d = clamp(k * 1.8 - 0.35) * (0.7 + 0.1 * i);
    if (d > 0) circle(ctx, 70 + 90 * d + 12 * i, 20 - 70 * d + 190 * d * d + 6 * i, 9 - i, `rgba(110,60,24,${1 - d})`);
  }
  for (let i = 0; i < 3; i++) line(ctx, -84, -50 + i * 22, -52, -40 + i * 22, 6, 'rgba(57,68,74,0.55)');
  ctx.restore();
}
SC.next = (lt, t, shot) => {
  const c = cu();
  const think = ramp(t, c.feels - 0.05, c.feels + 0.25, E.outBack) * (1 - ramp(t, c.point - 0.1, c.point + 0.1));
  const pt = springStep(t - c.point, 3.6, 0.5);
  let pose = STAND();
  pose = lerpPose(pose, ikReach(pose, 'L', [-52, -452], 1), think);
  pose = lerpPose(pose, ikReach(pose, 'R', [262, -262], 1), clamp(pt, 0, 1.15));
  let face = lerpFace(FACE_PHEW, FACE_SMUG, ramp(t, c.even, c.feels + 0.1));
  face = Object.assign({}, face, { lookX: lerp(0.2, 0.9, ramp(t, c.point - 0.1, c.point + 0.1)), blink: Math.max(face.blink || 0, blinkAt(t, 5, 2.6)) });
  const st = Object.assign({}, HERO, { pose, face, headRot: 0.05 * think + 0.04 * clamp(pt), headDX: 3 * clamp(pt) });
  const cam = camKeys(t, [[shot.start, 540, 1100, 1.2], [c.know, 556, 1090, 1.3], [c.point + 0.3, 636, 1104, 1.22], [shot.end, 644, 1106, 1.25]], E.inOutCubic);
  const cats = [catPass(t, c.cat2)].filter(Boolean);
  const wob = 0.1 * Math.sin((t - c.point) * 21) * decay(t, c.point + 0.2, 3.2) * ramp(t, c.point + 0.2, c.point + 0.3);
  const S = cafeScene(cam, t, { hero: { st }, cat: cats, cup: wob });
  const head = toScreen(cam, S.head[0], S.head[1]);
  const kb = springStep(t - c.bubble, 4, 0.5) * (1 - ramp(t, shot.end - 0.12, shot.end));
  return {
    glow: 0.8, capY: 1470,
    overlay: () => {
      if (kb > 0.01) { thoughtBubble(head[0] + 224, head[1] - 300, 370, 280, kb, head[0] + 96, head[1] - 96); predictIcon(head[0] + 228, head[1] - 318, 1.2 * clamp(kb), t - c.bubble); }
    },
  };
};

for (const id of ['caught', 'bell', 'files', 'clash', 'lab', 'psychic', 'button']) {
  if (!SC[id]) SC[id] = (lt, t, shot) => { darkBg(); screenSpace(); bigWord(id.toUpperCase(), 540, 800, 160, '#FFD447', 1); return {}; };
}

function initScenes2() {
  initCafe();
  if (typeof initMind === 'function') initMind();
  if (typeof initLab === 'function') initLab();
}
