// What If You Went to Space WITHOUT a Suit? (long-form): the airlock's continuity. alState(t) says, for any moment of
// the film, how he looks (breath, face, pose, swelling, blue lips, tongue, limp), what the room is doing (the outer
// hatch, the pressure, the beacon, the air), where Ball, the chips and the helmet are, all from the timeline's cues;
// every airlock shot draws alScene(cam, t, alState(t)) with its own camera, so a cut never jumps.
'use strict';

const cue = (n, d = 1e9) => { const v = TLd.cues[n]; return v === undefined ? d : v; };
const since = (t, n) => t - cue(n);
const env2 = (t, a, b, r = 0.2) => Math.min(ramp(t, a, a + r), 1 - ramp(t, b - r, b));
const popK = (t, a, d = 0.3) => E.outBack(clamp((t - a) / d), 2);
const kickAt = (t, a, rate = 9) => (t >= a ? Math.exp(-(t - a) * rate) : 0);

function alState(t) {
  const H = { face: FACES.cheeks, hair: 0, cheeks: 0, legs: 0.5, rot: 0.04 * Math.sin(t * 0.7), x: AL.heroX, y: AL.heroY,
    stick: { k: 1, a: -1.15 }, phone: { kind: 'msg' }, R: [175, -360], L: [-160, -300] };
  const R = { open: 1, gauge: 0, beacon: 1, dep: 1, rep: 0, flashDep: 0, flashRep: 0, red: 0.6, sis: 0, dim: 0, air: 0, airDir: 1 };
  const B = { x: 1010, y: 300, s: 0.9, mood: 'worried', look: [-1, 0.3], fans: 1, blink: 0 };
  const K = { x: 1120, y: 640, s: 0.75, puff: 0, pop: 0, rot: 0.4 + 0.2 * t };          // the chip bag
  const Hm = { x: 820, y: 360, s: 0.7, rot: 0.3 * t, on: 0 };                           // the helmet, floating free
  // a slow drift in zero g
  H.y += 10 * Math.sin(t * 0.6); H.x += 8 * Math.sin(t * 0.37);
  B.y += 14 * Math.sin(t * 1.1); B.x += 6 * Math.sin(t * 0.8);
  K.y += 20 * Math.sin(t * 0.5); Hm.y += 16 * Math.sin(t * 0.45 + 1);
  // ---------------------------------------------------------------- the air leaves (from frame 0 to "The air is gone")
  const gone = cue('gone');
  R.air = 1 - ramp(t, cue('s1'), gone + 0.6, E.inOutCubic);
  R.gauge = lerp(0.32, 0, ramp(t, 0, gone, E.outCubic));
  H.hair = 1.1 * (1 - ramp(t, cue('s1'), gone + 1.0, E.inOutCubic));
  // ---------------------------------------------------------------- the hook: a held breath, then all of it out
  if (t < cue('now') + 0.6) {
    const out = ramp(t, cue('breatheOut') - 0.1, cue('now') + 0.3, E.inOutSine);
    H.cheeks = 1.05 * (1 - out);
    H.face = t < cue('breatheOut') - 0.1 ? Object.assign({}, FACES.cheeks, { eyeOpen: 1.3 + 0.15 * kickAt(t, cue('dont'), 3) }) : lerpFace(FACES.cheeks, FACES.blowOut, ramp(t, cue('breatheOut') - 0.1, cue('breatheOut') + 0.3));
    H.exhale = out > 0.01 ? Math.min(1, out * 1.1) : 0;
    H.L = [-150 - 30 * Math.sin(t * 5), -320 + 30 * Math.sin(t * 4)];
  } else H.face = Object.assign({}, FACES.uhoh, { lookX: -0.4 });
  // ---------------------------------------------------------------- the want and the button (a rewind shows him pressing it)
  if (t >= cue('want') - 0.2 && t < cue('s1') - 0.1) H.face = Object.assign({}, FACES.sheep, { lookX: 0.7, lookY: -0.4 });
  // ---------------------------------------------------------------- act 1: what he feels
  if (t >= cue('s1') - 0.1) {
    H.face = Object.assign({}, FACES.alarmed, { lookX: -0.2, lookY: 0.2 });
    // "Your skin is tougher than that": he pats his chest, checks his arms
    const pat = env2(t, cue('skin') - 0.1, cue('s2') - 0.2, 0.25);
    if (pat > 0) { H.L = [lerp(-160, -40, pat), lerp(-300, -130, pat) + 12 * Math.sin(t * 14) * pat]; H.face = Object.assign({}, FACES.confused, { lookX: -0.3, lookY: 0.8 }); }
  }
  if (t >= cue('s2') - 0.1) {
    // the silence: he shouts, no sound comes out
    const shout = env2(t, cue('soundGone') - 0.1, cue('freezing') - 0.15, 0.2);
    if (shout > 0) H.face = Object.assign({}, FACES.shock, { lookX: 0.6, lookY: -0.2 });
    B.mood = 'shock';
  }
  if (t >= cue('freezing') - 0.1) {
    H.face = Object.assign({}, FACES.worried, { lookX: 0.3, lookY: 0.4 });
    H.heat = env2(t, cue('empty') - 0.2, cue('spit') - 0.2, 0.3);
    H.L = [-150, -250]; H.R = [150, -250];                              // he hugs himself a little: is he cold?
    if (t >= cue('thermosW')) H.face = Object.assign({}, FACES.confused, { lookX: 0.9, lookY: -0.2 });
  }
  // the spit: the viewer touches their tongue to their lip; his tongue comes out, and boils
  if (t >= cue('touch') - 0.2) {
    H.face = Object.assign({}, FACES.tongue);
    H.tongue = ramp(t, cue('touch') - 0.1, cue('touch') + 0.4);
    H.boil = ramp(t, cue('boilingW') - 0.2, cue('boilingW') + 0.5);
    H.frost = ramp(t, cue('frost') - 0.1, cue('frost') + 0.8);
    H.tears = ramp(t, cue('tearsW') - 0.1, cue('tearsW') + 0.4);
  }
  // the oxygen pours out: his lips go blue
  H.blue = 0.8 * ramp(t, cue('pours'), cue('s15'), E.inOutSine);
  if (t >= cue('s10')) H.face = Object.assign({}, FACES.fade, { lookY: 0.4 });
  // ---------------------------------------------------------------- act 2: out cold
  if (t >= cue('s15') - 0.1) {
    H.face = FACES.limp; H.tongue = 0.5; H.boil = 0.6; H.limp = 1;
    H.L = [-170 - 20 * Math.sin(t * 0.8), -250]; H.R = [170, -270 + 20 * Math.sin(t * 0.7)];
    H.rot = 0.25 * Math.sin((t - cue('s15')) * 0.25) + 0.1; H.legs = 0.7;
    H.stick = { k: 1, a: -0.4 + 0.15 * Math.sin(t * 0.5) };
    B.mood = 'worried'; B.look = [-1, 0.6];
    R.red = 1;
  }
  // the swelling: the water in his body turning to gas; the chip bag puffs and pops
  H.swell = ramp(t, cue('gasW') - 0.3, cue('s30'), E.inOutSine) * (1 - ramp(t, cue('slam') + 0.3, cue('slam') + 1.6));
  K.puff = ramp(t, cue('s20'), cue('chipsW') + 0.4, E.inOutSine);
  K.pop = t >= cue('pop') ? ramp(t, cue('pop'), cue('pop') + 1.6, E.outCubic) : 0;
  // his sister: at the inner hatch's window from "So how long"
  R.sis = ramp(t, cue('sisWin'), cue('sisWin') + 0.6, E.outBack);
  R.sisFace = FACES.alarmed; R.sisHand = ramp(t, cue('sisWin') + 0.8, cue('sisWin') + 1.2);
  // ---------------------------------------------------------------- the rescue: REPRESS, the hatch shuts, the air roars back
  const slam = cue('slam');
  if (t >= slam) {
    R.rep = 1; R.flashRep = kickAt(t, slam, 2); R.dep = 0;
    R.open = 1 - ramp(t, slam, slam + 0.7, E.inOutCubic);
    R.air = env2(t, slam + 0.2, cue('wakes') + 1.0, 0.4); R.airDir = -1;
    R.gauge = ramp(t, slam + 0.2, slam + 2.6, E.outCubic);
    R.beacon = 1 - ramp(t, cue('s90') - 0.3, cue('s90'));
    R.red = 1 - ramp(t, cue('s90') - 0.3, cue('s90'));
    H.hair = 0.6 * env2(t, slam + 0.3, slam + 2.2, 0.3);
    H.tongue = 0.5 * (1 - ramp(t, slam + 0.5, slam + 1.2)); H.boil = 0;
    H.blue = 0.8 * (1 - ramp(t, cue('air'), cue('wakes') + 1.5));
    B.mood = t < cue('wakes') ? 'worried' : 'happy';
  }
  if (t >= cue('air') - 0.15) {
    // AIR: his chest heaves; he wakes
    const g = kickAt(t, cue('air') - 0.1, 3);
    H.face = t < cue('wakes') ? lerpFace(FACES.limp, Object.assign({}, FACES.gasp || FACES.shock), g) : Object.assign({}, FACES.wake);
    H.limp = 1 - ramp(t, cue('wakes'), cue('wakes') + 1.5); H.rot = lerp(H.rot, 0, ramp(t, cue('wakes'), cue('wakes') + 2));
    H.dy = -16 * g;
  }
  if (t >= cue('puffy') - 0.1) { H.face = Object.assign({}, FACES.sheep, { lookX: -0.8 }); H.swell = 0.35 * (1 - ramp(t, cue('selfie'), cue('selfie') + 1)); }
  if (t >= cue('selfie') - 0.1) {
    H.face = FACES.happy; H.helmetOn = ramp(t, cue('helmetOn') - 0.3, cue('helmetOn') + 0.2);
    H.stick = { k: 1, a: -1.0 }; H.phone = { kind: t >= cue('bowlW') ? 'fish' : 'photo' };
    B.mood = 'happy';
  }
  return { hero: H, room: R, ball: B, chips: K, helmet: Hm };
}

// the whole airlock with everything in it. S = alState(t); o: {before(cam), after(cam), noBall, noChips, noHelmet}
function alScene(cam, t, S, o = {}) {
  alRoom(cam, t, S.room);
  applyCam(cam);
  alAir(t, S.room.air * (S.room.airDir < 0 ? 1.4 : 1), S.room.airDir);
  if (!o.noHelmet && !S.hero.helmetOn) alHelmet(ctx, S.helmet.x, S.helmet.y, S.helmet.s, S.helmet.rot);
  if (!o.noChips) alChips(ctx, S.chips.x, S.chips.y, S.chips.s, S.chips.puff, t, S.chips.rot, S.chips.pop);
  if (o.before) { o.before(cam); applyCam(cam); }
  const h = Object.assign({}, S.hero, { helmet: S.hero.helmetOn || 0, y: S.hero.y + (S.hero.dy || 0) });
  if (S.hero.heat > 0.01) { const hp = alPt(h, [0, -330]); softDot(ctx, hp[0], hp[1], 330, '#FF9A3C', 0.22 * S.hero.heat); softDot(gctx, hp[0], hp[1], 260, '#FF9A3C', 0.35 * S.hero.heat); }
  const res = alHero(cam, t, h);
  applyCam(cam);
  if (!o.noBall) alBall(S.ball.x, S.ball.y, S.ball.s, t, S.ball);
  if (o.after) o.after(cam, res, h);
  return res;
}
