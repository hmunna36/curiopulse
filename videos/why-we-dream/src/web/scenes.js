// Why Do We DREAM? 💭 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
const clone = (p) => JSON.parse(JSON.stringify(p));
const lerpCam = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), k)), rot: 0 });
// a point given in a rig's head space -> world coords
function headPt(st, r, p) {
  const a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return toWorld(st, [r.head[0] + (st.headDX || 0) + p[0] * cs - p[1] * sn, r.head[1] + (st.headDY || 0) + p[0] * sn + p[1] * cs]);
}
// into a rig's head space (a cap, things on his face): call inside a charLayer post, or on ctx with the camera applied
function headSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// into a rig's own space (feet at 0, 0)
function rigSpace(c, st, fn) { c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); fn(c); c.restore(); }

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the exam hall: daylight from tall windows on both sides; the set goes a little soft behind him in the close shots
const HALL_LIGHT = { ...LIGHTS.day, dof: 0.6, pool: 0.34 };
// his bedroom: moonlight from the upper left
const BED_LIGHT = { ...LIGHTS.night, pool: 0.62 };
// inside his head: a control room lit by its big screen
const CTRL_LIGHT = { ...LIGHTS.screen, pool: 0.5 };
const hallLightAt = (tt) => ({ ...HALL_LIGHT, dof: lerp(1.9, 0.4, ramp(tt, cu().hall - 0.04, cu().hall + 0.40, E.inOutCubic)) });
setLights({ hook: (lt, t) => hallLightAt(t), pajamas: HALL_LIGHT, cover: HALL_LIGHT, answer: BED_LIGHT, bed: BED_LIGHT, weird: BED_LIGHT, stays: BED_LIGHT,
  button: (lt, t) => (t >= cu().loop ? hallLightAt(t - TLd.duration) : BED_LIGHT), warden: CTRL_LIGHT, fears: CTRL_LIGHT, payoff: LIGHTS.diagram });

// ================================================================= THE DREAM: an exam hall, an alarm clock, pajamas
const HERO = { x: 540, y: 1296, s: 1.0 };        // the rig's origin (his feet); exam.js seats him here
const CLOCK = { x: 690, y: 1214, s: 1.0 };       // on his desk, under his right hand
const DESKX = 576;                               // his desk sits a little to the right, so the clock has room beside him
// His state round frame 1 as a function of tt = seconds since frame 1. Negative time is the end of the Short: the
// last frames run into the first (the loop).
function hallState(tt) {
  const c = cu(), since = tt - c.slap;
  const windup = ramp(tt, -0.40, -0.05, E.outCubic), down = ramp(tt, -0.02, c.slap, E.inCubic);
  const q = since >= 0 ? clamp(0.14 + 0.86 * Math.exp(-since * 8) * Math.cos(since * 21)) : 0;   // the clock under his hand
  const rest = [716, 1052], top = [716, 958], on = [CLOCK.x + 4, CLOCK.y - 160 * CLOCK.s + 30 * q * CLOCK.s];
  let hand = [lerp(rest[0], top[0], windup), lerp(rest[1], top[1], windup)];
  hand = [lerp(hand[0], on[0], down), lerp(hand[1], on[1], down)];
  const hit = since >= 0 ? Math.exp(-since * 9) : 0;
  const awake = ramp(tt, c.hall - 0.06, c.hall + 0.12);                 // his eyes snap open: where is he?
  const stand = ramp(tt, c.in_your - 0.02, c.in_your + 0.26, E.outBack);
  const spread = ramp(tt, c.in_your, c.in_your + 0.3, E.outBack);
  const lookDown = ramp(tt, c.in_your + 0.1, c.pj, E.inOutSine) * (1 - ramp(tt, c.pj + 0.40, c.pj + 0.56));
  const horror = ramp(tt, c.pj + 0.40, c.pj + 0.58);
  let face = Object.assign({}, FACES.annoyed, { blink: 1, lookX: 0, lookY: 0 });
  const nod = ramp(tt, c.slap + 0.30, c.hall - 0.10, E.inOutSine) * (1 - awake);            // ...and he nods off again, pleased with himself
  face = lerpFace(face, Object.assign({}, FACES.drowsy, { blink: 0.78 }), ramp(tt, c.slap + 0.16, c.slap + 0.40));
  face = lerpFace(face, Object.assign({}, FACES.sleepy, { mouth: 'grin', mouthOpen: 0.25, browY: 0.3, browTilt: -0.3 }), nod);
  const sweep = awake * (1 - ramp(tt, c.in_your - 0.1, c.in_your + 0.1));
  face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: sweep * Math.sin((tt - c.hall) * 7.4), lookY: -0.1 }), awake);
  face = lerpFace(face, Object.assign({}, FACES.worried, { lookX: 0, lookY: 1, mouthOpen: 0.5 }), lookDown);
  face = lerpFace(face, FACES.shock, horror);
  const drowse = 1 - awake;
  const capSw = (since >= 0 ? 16 * Math.exp(-since * 3.2) * Math.cos(since * 13) : 6 * Math.sin(tt * 30))
    + (tt > c.in_your ? 18 * Math.exp(-(tt - c.in_your) * 3) * Math.cos((tt - c.in_your) * 11) : 0);
  return { hand, handOn: down > 0.55 && spread < 0.4, ring: since < 0 ? 1 : 0, q, hit, since, stand, spread, face,
    headDX: 0, headDY: 10 * drowse + 13 * hit - 6 * horror + 15 * nod, headRot: 0.09 * drowse - 0.05 * hit + 0.07 * nod, sw: capSw + 10 * nod, nod,
    stare: ramp(tt, c.hall + 0.02, c.hall + 0.42), glare: 0.25 * (1 - ramp(tt, c.pj, c.pj + 0.3)), laugh: ramp(tt, c.pj + 0.12, c.pj + 0.42), write: 1, heroWrite: 0, thumb: 0, penguin: false };
}
// the pajamas shot: everything is fine. He sits his exam in pajamas, next to a penguin, and nobody minds
function calmState(t) {
  const c = cu(), up = ramp(t, c.the_pj - 0.05, c.pj2 + 0.05, E.inOutSine), th = ramp(t, c.pj2 - 0.04, c.pj2 + 0.22);
  let face = Object.assign({}, FACES.calm, { lookX: -0.5, lookY: 0.9, blink: 0.2 });
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0, lookY: 0 }), up);
  return { hand: null, handOn: false, ring: 0, q: 0, hit: 0, since: 9, stand: 0, spread: 0, face, headDX: 0, headDY: 4 * (1 - up), headRot: -0.05 * (1 - up) + 0.04 * th,
    sw: 5 * Math.sin(t * 2.2) + 14 * th * Math.exp(-Math.max(0, t - c.pj2) * 3) * Math.cos((t - c.pj2) * 11), stare: 0, glare: 0, laugh: 0, write: 1, heroWrite: 1 - up, thumb: th, penguin: true,
    nod: ramp(t, c.squeak - 0.02, c.squeak + 0.1) * (1 - ramp(t, c.squeak + 0.16, c.squeak + 0.3)) };
}
function hallCam(tt) {
  const c = cu();
  const tight = { x: 624, y: 1088, zoom: 2.84 }, wide = { x: 540, y: 968, zoom: 1.30 }, med = { x: 552, y: 1014, zoom: 1.62 };
  const pull = ramp(tt, c.hall - 0.04, c.hall + 0.40, E.inOutCubic), push = ramp(tt, c.in_your - 0.08, c.pj + 0.08, E.inOutCubic);
  let cam = lerpCam(tight, wide, pull); cam = lerpCam(cam, med, push);
  cam.zoom *= lerp(0.93, 1, ramp(tt, -0.4, 0.3, E.outCubic)) * (1 + 0.035 * ramp(tt, c.pj, c.pj_end + 0.4, (x) => x)) * (1 + 0.05 * ramp(tt, c.slap + 0.2, c.hall, E.inOutSine) * (1 - pull));   // the camera arrives; later it creeps in
  const hit = tt >= c.slap ? Math.exp(-(tt - c.slap) * 10) : 0;
  cam.y += 16 * hit * (1 - pull); cam.x += 5 * Math.sin(tt * 60) * hit * (1 - pull);
  return cam;
}
function hallPose(S, st, t) {
  let p = clone(POSES.sit); p.lean = 0; p.hand = 'open';
  if (S.stand > 0.001) { p.hipY = lerp(-34, -196, S.stand); p.legL = clone(POSES.stand.legL); p.legR = clone(POSES.stand.legR); }
  // both hands on the desk (elbows out); the left one writes when he writes
  const wv = S.heroWrite || 0;
  p = ikReach(p, 'L', ikLocal(st, 478 + 7 * Math.sin(t * 21) * wv, 1226 + 3 * Math.sin(t * 29) * wv), -1);
  p = ikReach(p, 'R', S.hand ? ikLocal(st, S.hand[0], S.hand[1]) : ikLocal(st, 612, 1226), -1);
  if (S.thumb > 0) {                                                        // a thumbs-up, held up beside the clock
    const k = E.outBack(clamp(S.thumb)), up = ikReach(p, 'R', ikLocal(st, 752, 1026), 1).armR;
    p.armR = { a: lerp(p.armR.a, up.a, k), b: lerp(p.armR.b, up.b, k) }; if (S.thumb > 0.5) p.hand = 'thumbR';
  }
  if (S.spread > 0.001) { const sh = { a: 0.98, b: 1.42 }; p.armL = { a: lerp(p.armL.a, sh.a, S.spread), b: lerp(p.armL.b, sh.b, S.spread) }; p.armR = { a: lerp(p.armR.a, sh.a, S.spread), b: lerp(p.armR.b, sh.b, S.spread) }; }
  return p;
}
// The whole hall with everyone in it. tt = seconds since frame 1 (hallState), t = video time (ambient motion).
// o: {S: another state (calmState), cam, inset: true = drawn inside a clip (a bubble): no character layer, no light}
function hallDraw(tt, t, o = {}) {
  const S = o.S || hallState(tt), cam = o.cam || hallCam(tt), inset = !!o.inset;
  examHall(cam, t, { tick: t * 0.9 });                                     // the hall's clock runs a minute a second: it is a dream
  const H0 = HALL.hero;
  const person = (L, stt) => { if (inset) drawStudent(ctx, L, stt, t); else actor(() => drawStudent(ctx, L, stt, t)); };
  HALL.rows.forEach((row, ri) => {
    row.xs.forEach((x, i) => {
      if (S.penguin && ri === 1 && i === 2) {
        dmPenguin(ctx, x, row.y + 14 * row.s, row.s, t, { write: 1 - (S.nod || 0), nod: S.nod || 0, look: -0.6, blink: blinkAt(t, 31) });
        desk(ctx, x, row.y, row.s, { px: -6, prot: 0.02 });
        return;
      }
      const L = STUD[SEATING[ri][i]], dir = Math.sign(H0.x - x) || 1, ph = i * 0.37 + ri * 0.21;
      const turn = clamp(S.stare * 1.4 - ph * 0.5), lf = S.laugh * (0.6 + 0.4 * ((i + ri) % 2));
      person(L, { x, y: row.y + 14 * row.s, s: row.s, lookX: dir * turn, lookY: lerp(0.95 * S.write, 0.6, turn), tilt: dir * 0.10 * turn + 0.05 * lf * Math.sin(t * 15 + i),
        brow: turn * (1 - S.glare) - S.glare * 0.9 * turn + 0.4 * lf, mouthO: Math.max(turn * (1 - S.glare) * (i % 2 ? 0.8 : 0), lf * (0.6 + 0.4 * Math.abs(Math.sin(t * 14 + i * 2)))),
        write: S.write * (1 - turn), lean: dir * 10 * turn * row.s, blink: Math.max(blinkAt(t, ri * 4 + i), 0.95 * S.write * (turn < 0.15 ? 1 : 0)), nod: lf * Math.sin(t * 15 + i) });
      desk(ctx, x, row.y, row.s, { px: -12 + 6 * i, prot: -0.08 + 0.05 * i });
    });
  });
  HALL.front.forEach((x, i) => {
    const L = STUD[FRONT_LOOKS[i]], dir = Math.sign(H0.x - x), turn = clamp(S.stare * 1.6 - 0.1);
    person(L, { x, y: H0.y + 6, s: 1.0, lookX: dir * turn, lookY: lerp(0.95 * S.write, 0.2, turn), tilt: dir * 0.12 * turn, brow: turn * (1 - S.glare) - S.glare * 0.9 * turn + 0.4 * S.laugh,
      mouthO: Math.max(i ? turn * (1 - S.glare) * 0.7 : 0, S.laugh * 0.8), write: S.write * (1 - turn), lean: dir * 18 * turn, blink: Math.max(blinkAt(t, 11 + i), 0.95 * S.write * (turn < 0.15 ? 1 : 0)) });
    desk(ctx, x, HALL.deskTop, 1.0, { px: -6, prot: 0.04 });
  });
  // him
  const st = { x: HERO.x, y: HERO.y, s: HERO.s, face: S.face, headDX: S.headDX, headDY: S.headDY, headRot: S.headRot, noLegs: S.stand < 0.12, seed: 3 };
  st.pose = hallPose(S, st, t);
  let r;
  if (inset) { applyCam(cam); r = drawCharacterRig(ctx, st, t, PJ); headSpace(ctx, r, st, (hc) => dmCap(hc, S.sw)); }
  else r = charLayer(cam, st, t, { pal: PJ, post: (lc, rr, s2) => { pajamaStars(lc, rr, s2); actor(() => headSpace(lc, rr, s2, (hc) => dmCap(hc, S.sw))); } });
  applyCam(cam);
  desk(ctx, DESKX, HALL.deskTop, 1.0, { px: -62, prot: -0.05 });
  // his forearms and hands again: they lie on the desk (and one of them on the clock)
  const fore = (k, sd) => rigSpace(ctx, st, (cc) => { const el = r['el' + k], wr = r['wr' + k], d = r['armDir' + k]; capsuleShaded(cc, el, wr, 38, PJ.coat, PJ.coatSh, PJ.coatHi, PJ); line(cc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, PJ.coatSh); drawHand(cc, wr, d, 'open', PJ, sd, t); });
  const onDesk = S.spread < 0.35;
  if (onDesk) { if (inset) fore('L', -1); else actor(() => fore('L', -1)); }
  if ((S.heroWrite || 0) > 0.05) { const wl = toWorld(st, r.wrL); pencil(ctx, wl[0] - 4, wl[1] - 6, 64, -0.55, 1); }
  // the alarm clock on his desk, then the hand that lands on it
  dmClock(ctx, CLOCK.x, CLOCK.y, CLOCK.s, t, { ring: S.ring, squash: S.q });
  if (!inset) dmRingArcs(CLOCK.x, CLOCK.y, CLOCK.s, t, S.ring);
  if (onDesk && S.thumb < 0.02) { if (inset) fore('R', 1); else actor(() => fore('R', 1)); }
  if (!inset) {
    dmSlapBurst(CLOCK.x, CLOCK.y - 150 * CLOCK.s, inv(0, 0.3, S.since), CLOCK.s);
    hallShafts(cam, t, 0.7);
  }
  return { cam, S, st, r };
}

SC.hook = (lt, t, shot) => {
  const c = cu(), HD = hallDraw(t, t), S = HD.S;
  const pull = ramp(t, c.hall - 0.04, c.hall + 0.40, E.inOutCubic), whip = Math.sin(Math.PI * pull);
  if (S.nod > 0.3 && pull < 0.05) { const hp = toScreen(HD.cam, ...headPt(HD.st, HD.r, [96, -70])); screenSpace(); zzz(hp[0] - 60, hp[1] + 10, t, c.slap + 0.42, 0.95, 0.75); }
  return { glow: 0.8, capY: 1500, flash: 0.10 * S.hit, zblur: 0.22 * whip, zcx: 540, zcy: 900 };
};

SC.pajamas = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = calmState(t);
  const cam = lerpCam({ x: 566, y: 1030, zoom: 1.46 }, { x: 560, y: 1020, zoom: 1.58 }, ramp(lt, 0, D, E.inOutSine));
  hallDraw(9, t, { S, cam });
  return { glow: 0.8, capY: 1500, flash: 0.14 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================= THE NIGHT: his bedroom from above
const BEDW = { x: 540, y: 904, zoom: 0.80, rot: 0 };     // the whole bed
const BEDC = { x: 418, y: 520, zoom: 1.12, rot: 0 };     // his head, and room for the dream beside it
const NCLOCK = { x: 902, y: 548, s: 1.25 };              // the same alarm clock, on his nightstand
const BUBW = [232, 566, 156], BUBC = [296, 612, 214];    // the bubble for those two cameras: x, y, radius (screen)
function nightstand2(t, o = {}) {
  ctx.save(); ctx.translate(960, 420);
  rrect(ctx, -140, -170, 280, 330, 18); ctx.fillStyle = '#3A2C3E'; ctx.fill();
  rrect(ctx, -128, -158, 256, 306, 12); ctx.fillStyle = '#48374C'; ctx.fill();
  circle(ctx, 46, -86, 74, '#8C7C68'); circle(ctx, 46, -86, 26, '#5C4C3C');     // the lamp (off), seen from above
  ctx.restore();
  dmClock(ctx, NCLOCK.x, NCLOCK.y, NCLOCK.s, t, { ring: o.ringReal || 0 });
  dmRingArcs(NCLOCK.x, NCLOCK.y, NCLOCK.s, t, o.ringReal || 0);
}
// o: {face, headRot, locks: {wL, wR, aL, aR} each 0..1 (popped on), openR 0..1, fly 0..1 (the right one is off and away),
//     reach 0..1 (his right hand goes for the clock), ringReal, pulse: {arms, legs} 0..1, twitch 0..1, breathe}
function bedDraw(cam, t, o = {}) {
  applyCam(cam);
  drawFloorTop();
  bedTop(t, {});
  nightstand2(t, o);
  const st = { x: LY.x, y: LY.y, s: LY.s, face: o.face || FACES.sleepy, seed: 3, headRot: o.headRot || 0, headDY: 0, frizz: 0, soot: 0 };
  let p = clone(POSES.sleep);
  const tw = o.twitch || 0;
  p.armL.b += 0.05 * tw * Math.sin(t * 31); p.armR.b += 0.05 * tw * Math.sin(t * 27 + 1);
  const restR = rig(p).wrR;
  if ((o.reach || 0) > 0.001) {
    const k = o.reach, tgt = ikLocal(st, NCLOCK.x + 2, NCLOCK.y - 148 * NCLOCK.s), lift = Math.sin(Math.PI * k) * 26;
    p = ikReach(p, 'R', [lerp(restR[0], tgt[0], k) + lift, lerp(restR[1], tgt[1], k)], 1);
  }
  st.pose = p;
  const r = rig(p);
  ellipse(ctx, 540, 980, 260, 560, 'rgba(10,10,30,0.18)');
  charLayer(cam, st, t, { ambient: 0.08, pal: PJ, post: (lc, rr) => { pajamaStars(lc, rr, st); actor(() => headSpace(lc, rr, st, (hc) => dmCap(hc, 4 * Math.sin(t * 1.3)))); } });
  applyCam(cam);
  duvetTop(st, r, t, { lift: 0.25 * Math.sin(t * 1.6) * (o.breathe === undefined ? 1 : o.breathe), kick: 0.5 * tw });
  actor(() => armsOnTop(ctx, st, r, tintPal(PJ, 0.08)));
  // the brain's order on its way down his arms and legs
  const pl = o.pulse || {};
  const run = (pts, u) => {
    if (u <= 0 || u >= 1) return;
    const acc = polyLen(pts), L = acc[acc.length - 1];
    paint(() => { for (let i = 0; i < 4; i++) { const q = polyAt(pts, acc, clamp(u - i * 0.07) * L); circle(ctx, q[0], q[1], 13 - i * 2.4, `rgba(255,150,190,${0.95 - i * 0.2})`); softDot(gctx, q[0], q[1], 60, '#FF86A6', 0.55 - i * 0.1); } });
  };
  const W_ = (k) => toWorld(st, r[k]);
  run([headPt(st, r, [0, 40]), W_('shL'), W_('elL'), W_('wrL')], pl.arms || 0); run([headPt(st, r, [0, 40]), W_('shR'), W_('elR'), W_('wrR')], pl.arms || 0);
  run([headPt(st, r, [0, 40]), W_('hipL'), W_('knL'), W_('anL')], pl.legs || 0); run([headPt(st, r, [0, 40]), W_('hipR'), W_('knR'), W_('anR')], pl.legs || 0);
  // padlocks: his wrists, on top of the covers; his ankles, through them
  const lk = o.locks || {}, rat = (i) => 0.05 * tw * Math.sin(t * 33 + i * 2);
  const wl = W_('wrL'), wr = W_('wrR'), al = W_('anL'), ar = W_('anR');
  dmLock(ctx, wl[0] + 4, wl[1] - 22, 1.75, { k: lk.wL || 0, rot: 0.12 + rat(0), cuffW: 30 });
  if ((o.fly || 0) <= 0) dmLock(ctx, restWorld(st, restR)[0] - 4, restWorld(st, restR)[1] - 22, 1.75, { k: lk.wR || 0, rot: -0.12 + rat(1), cuffW: 30, open: o.openR || 0 });
  else {                                                                     // it springs open and tumbles off the bed
    const f = o.fly, b = restWorld(st, restR);
    dmLock(ctx, b[0] + 190 * f, b[1] - 22 - 260 * Math.sin(Math.PI * Math.min(1, f * 0.9)) + 420 * f * f, 1.75, { k: 1, rot: -0.12 + 7 * f, open: 1, cuff: false });
  }
  dmLock(ctx, al[0] - 6, al[1] - 30, 1.75, { k: lk.aL || 0, rot: -0.06 + rat(2), cuffW: 36 });
  dmLock(ctx, ar[0] + 6, ar[1] - 30, 1.75, { k: lk.aR || 0, rot: 0.06 + rat(3), cuffW: 36 });
  moonlightTop(1);
  return { st, r };
}
function restWorld(st, p) { return toWorld(st, p); }
const sleepFace = (t, frown = 0) => Object.assign({}, FACES.sleepy, { browY: -0.1 + 0.5 * frown, browTilt: -0.1 + 0.9 * frown, mouth: frown > 0.5 ? 'wavy' : 'flat', mouthOpen: 0.1 + 0.2 * frown });
// the dream going on in its bubble: he runs for it, the exam paper is right behind him. hard 0..1 = how hard he runs
function bubChase(c, t, hard = 0.5) {
  // a corridor that never ends: floor lines streaming toward us
  c.fillStyle = 'rgba(20,14,48,0.55)'; c.fillRect(-220, 96, 440, 140);
  for (let i = 0; i < 6; i++) { const u = ((i / 6 + t * (0.9 + 0.9 * hard)) % 1), y = 100 + 110 * u * u; c.fillStyle = `rgba(190,170,255,${0.10 + 0.25 * u})`; c.fillRect(-220, y, 440, 3 + 5 * u); }
  // the exam paper, right behind him and gaining
  dmMonster(c, 52 + 8 * Math.sin(t * 5), 168, 0.92, t, { run: t * (12 + 6 * hard), look: -0.9 });
  // him, in front of it, running for his life (toward us): knees up, elbows pumping
  const sp = 13 + 7 * hard, ph = Math.sin(t * sp), up = Math.max(0, ph), dn = Math.max(0, -ph);
  const p = clone(POSES.stand);
  p.legL = { a: 0.10 + 0.34 * up, b: -1.15 * up }; p.legR = { a: 0.10 + 0.34 * dn, b: -1.15 * dn };
  p.armL = { a: 0.55 - 0.45 * ph, b: 1.5 }; p.armR = { a: 0.55 + 0.45 * ph, b: 1.5 };
  p.hipY = -222 + 12 * Math.abs(Math.cos(t * sp)); p.lean = 0.05 * ph;
  const st = { x: -62 + 6 * Math.sin(t * sp * 0.5), y: 192, s: 0.44, pose: p, face: Object.assign({}, FACES.nervous, { lookX: 0.2, lookY: -0.2 }), seed: 3 };
  const r = drawCharacterRig(c, st, t, PJ);
  headSpace(c, r, st, (hc) => dmCap(hc, 12 * ph));
  // sweat, and the air going past
  for (let i = 0; i < 3; i++) { const u = ((t * 2.2 + i / 3) % 1); sweatDrop(c, -58 - 66 - 30 * u, 60 + i * 26 - 20 * u, 0.7, 1 - u); }
  c.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const u = ((hash(i * 3.1) + t * (2 + 2 * hard)) % 1); line(c, -190 + 380 * hash(i * 7.7), -170 + 330 * u, -190 + 380 * hash(i * 7.7), -170 + 330 * u + 40 + 40 * hard, 4, `rgba(220,225,255,${0.30 * Math.sin(Math.PI * u)})`); }
}
// the exam hall in the bubble: a camera that puts the hall's point F at the bubble's centre B
function bubHall(tt, t, B, zoom, F = [540, 1010]) { hallDraw(tt, t, { inset: true, cam: { x: F[0], y: F[1], zoom, rot: 0, sx: B[0] - 540, sy: B[1] - 960 } }); }

// ---- "Relax, you're dreaming": the hall shrinks into a bubble beside his sleeping head
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = lerpCam({ x: BEDC.x, y: BEDC.y, zoom: BEDC.zoom * 0.95 }, BEDC, ramp(lt, 0, D, E.outCubic));
  const B0 = bedDraw(cam, t, { face: sleepFace(t, 0.5) });
  // the bubble starts as the whole frame (the hook's last picture) and closes down to its place
  const k = ramp(lt, 0, 0.40, E.inOutCubic), hc = hallCam(shot.start);
  const Bx = lerp(540, BUBC[0], k), By = lerp(960, BUBC[1], k), wr = Math.exp(lerp(Math.log(1150), Math.log(BUBC[2] * 0.83), k));
  const zoom = hc.zoom * (wr / 1150) * lerp(1, 2.5, k);
  const head = toScreen(cam, ...headPt(B0.st, B0.r, [-40, -40]));
  screenSpace();
  dmBubble(Bx, By, wr / 0.83, 1, k > 0.6 ? head : null, () => bubHall(t, t, [Bx, By], zoom, [lerp(hc.x, 540, k), lerp(hc.y, 1000, k)]), { t });
  screenSpace();
  zzz(head[0] + 150, head[1] - 60, t, shot.start + 0.5, 0.9, 0.8);
  return { glow: 0.8, capY: 1330, flash: 0.22 * (1 - ramp(lt, 0, 0.14)) };
};

// ---- the aside: the dream goes on
SC.bed = (lt, t, shot) => {
  const B0 = bedDraw(BEDC, t, { face: sleepFace(t, 0.7), twitch: 0.3 });
  const head = toScreen(BEDC, ...headPt(B0.st, B0.r, [-40, -40]));
  screenSpace();
  dmBubble(BUBC[0], BUBC[1], BUBC[2], 1, head, (cc) => bubChase(cc, t, 0.45), { t });
  screenSpace();
  zzz(head[0] + 150, head[1] - 60, t, shot.start - 1, 0.9, 0.8);
  return { glow: 0.8, flash: 0.16 * (1 - ramp(lt, 0, 0.12)) };
};

// the brain in a round window above his head: a lever marked BODY, and it pulls it. p = the lever 0 (ON) .. 1 (OFF)
function brainWindow(t, k, p, tail) {
  if (k <= 0) return;
  screenSpace();
  const X = 868, Y = 612, R = 88 * E.outBack(clamp(k), 1.8);
  if (tail) for (let i = 0; i < 3; i++) circle(ctx, lerp(X - R, tail[0], 0.2 + i * 0.3), lerp(Y, tail[1], 0.2 + i * 0.3), 12 - i * 3, '#C8A8FF');
  circle(ctx, X, Y, R + 12, '#160C2A');
  ctx.save(); ctx.beginPath(); ctx.arc(X, Y, R, 0, 7); ctx.clip();
  const g = ctx.createRadialGradient(X - 30, Y - 40, 10, X, Y, R * 1.2); g.addColorStop(0, '#3B3F8E'); g.addColorStop(1, '#141A40');
  ctx.fillStyle = g; ctx.fillRect(X - R, Y - R, 2 * R, 2 * R);
  const sc = R / 92;
  // the lever, on the right
  const lx = X + 50 * sc, ly0 = Y - 36 * sc, ly1 = Y + 40 * sc, ky = lerp(ly0, ly1, clamp(p));
  rrect(ctx, lx - 9 * sc, ly0 - 8 * sc, 18 * sc, (ly1 - ly0) + 16 * sc, 8 * sc); ctx.fillStyle = '#0A0C1E'; ctx.fill();
  line(ctx, lx, (ly0 + ly1) / 2, lx, ky, 7 * sc, '#C9D0E4'); circle(ctx, lx, ky, 14 * sc, p > 0.5 ? '#FF4A4A' : '#4DFFB4');
  tfBrain(ctx, X - 24 * sc, Y + 8 * sc, 0.30 * sc, t, { mood: p > 0.5 ? 'grin' : 'think', look: [0.8, p > 0.5 ? 0.6 : -0.4], helmet: 1, still: true,
    armR: [(lx - (X - 24 * sc)) / (0.30 * sc), (ky - (Y + 8 * sc)) / (0.30 * sc)], armL: [-150, 110] });
  ctx.restore();
  paint(() => { ctx.lineWidth = 8; ctx.strokeStyle = p > 0.5 ? '#FF86A6' : '#C8A8FF'; ctx.beginPath(); ctx.arc(X, Y, R + 4, 0, 7); ctx.stroke(); });
  if (p > 0.02 && p < 1) softDot(gctx, lx, ky, 90, '#FF86A6', 0.5);
}
// the weird fact and what follows it: one continuous picture, read by three shots
function nightDraw(t) {
  const c = cu(), s0 = shotOf('weird').start;
  const pull = ramp(t, s0 + 0.05, c.brain2 - 0.05, E.inOutCubic) * (1 - ramp(t, c.the_drill - 0.12, c.the_drill + 0.5, E.inOutCubic));
  const sb = shotOf('button'), back = sb && t >= sb.start - 1e-4 ? 1 : 0;  // "Usually.": a hard cut back to the whole bed
  const closer = back ? 0 : ramp(t, c.the_drill - 0.12, c.head_end, E.inOutSine);
  let cam = lerpCam(BEDC, BEDW, back ? 1 : pull);
  if (!back) cam = lerpCam(cam, { x: 404, y: 528, zoom: 1.2 }, closer * (1 - pull));
  if (back) cam = lerpCam(BEDW, { x: 566, y: 880, zoom: 0.845 }, ramp(t, c.usually, c.loop, E.inOutSine));
  const lever = ramp(t, c.paralyzes + 0.02, c.paralyzes + 0.2, E.inCubic);
  const lockK = (at) => inv(at, at + 0.14, t);
  const pop = inv(c.pop, c.pop + 0.12, t), fly = inv(c.pop + 0.10, c.pop + 0.75, t);
  const reach = ramp(t, c.rise, c.loop + 0.16, E.inOutCubic);
  const frown = back ? 0.3 + 0.7 * ramp(t, c.rise, c.rise + 0.3) : 0.75;
  const B0 = bedDraw(cam, t, {
    face: sleepFace(t, frown), headRot: back ? 0.05 * reach : 0,
    twitch: t > c.so ? 0.5 + 0.5 * ramp(t, c.so, c.dreams) : 0.25, breathe: 1,
    locks: { wL: lockK(c.arms), wR: lockK(c.arms + 0.05), aL: lockK(c.legs), aR: lockK(c.legs + 0.05) }, openR: pop, fly: t > c.pop + 0.10 ? Math.max(0.001, fly) : 0,
    reach, ringReal: ramp(t, c.rise + 0.05, c.rise + 0.2),
    pulse: { arms: inv(c.paralyzes + 0.16, c.arms + 0.02, t), legs: inv(c.paralyzes + 0.22, c.legs + 0.02, t) },
  });
  const head = toScreen(cam, ...headPt(B0.st, B0.r, [-40, -40]));
  // the bubble follows the camera between its two places
  const kb = back ? 1 : pull, big = back ? 0 : closer * (1 - pull);
  const Bx = lerp(lerp(BUBC[0], BUBW[0], kb), 318, big), By = lerp(lerp(BUBC[1], BUBW[1], kb), 650, big), Br = lerp(lerp(BUBC[2], BUBW[2], kb), 250, big);
  screenSpace();
  const dreamAgain = t >= c.rise;                                           // the alarm is in the dream now: the hall is back
  dmBubble(Bx, By, Br, 1, head, (cc, wr) => { if (dreamAgain) bubHall(t - TLd.duration, t, [Bx, By], 0.72 * (wr / 200) * 1.6, [600, 1050]); else bubChase(cc, t, t > c.so ? 1 : 0.6); }, { t });
  // the brain's window: it pops up for the order, and goes again
  const wk = ramp(t, c.brain2 - 0.12, c.brain2 + 0.1) * (1 - ramp(t, c.so - 0.1, c.so + 0.06)) * (back ? 0 : 1) * pull;
  brainWindow(t, wk, lever, toScreen(cam, ...headPt(B0.st, B0.r, [84, -10])));
  screenSpace();
  if (!back || t < c.rise) zzz(head[0] + (back ? 96 : 150), head[1] - (back ? 40 : 60), t, s0 - 3, 0.9, back ? 0.55 : 0.8);
  return { cam, B0, Bx, By, Br, lever, pop, reach };
}
SC.weird = (lt, t, shot) => {
  const c = cu(), N = nightDraw(t);
  const snap = Math.max(t >= c.arms ? Math.exp(-(t - c.arms) * 12) : 0, t >= c.legs ? Math.exp(-(t - c.legs) * 12) : 0);
  const yank = t >= c.paralyzes + 0.2 ? Math.exp(-(t - c.paralyzes - 0.2) * 10) : 0;
  return { glow: 0.8, capY: 1520, flash: 0.05 * snap + 0.07 * yank };
};
SC.stays = (lt, t, shot) => { nightDraw(t); return { glow: 0.8, capY: 1330 }; };

// ---- "Usually.": a padlock springs open, his arm gets away... and the last 0.4 s are the dream again (frame 1)
SC.button = (lt, t, shot) => {
  const c = cu();
  if (t >= c.loop) {
    hallDraw(t - TLd.duration, t);
    return { glow: 0.8, capY: 1500, flash: 0.30 * (1 - ramp(t, c.loop, c.loop + 0.12)) };
  }
  const N = nightDraw(t), dive = ramp(t, c.loop - 0.16, c.loop, E.inCubic);
  return { glow: 0.8, capY: 1520, flash: 0.12 * (1 - ramp(lt, 0, 0.1)) + 0.3 * dive, zblur: 0.4 * dive, zcx: N.Bx, zcy: N.By };
};

// ================================================================= INSIDE HIS HEAD: the control room
function ctrlDraw(lt, t, o = {}) {
  screenSpace();
  ctrlRoom(t);
  applyCam(o.cam || CAM0);
  fireSign(t, o.sign || 0);
  ctrlScreen(t, o.inside, { glow: o.screenGlow });
  const knob = logicPanel(t, o.lever || 0);
  // the brain: a red helmet (it is the warden tonight), a megaphone in one hand; the other goes to the switch
  const [bx, by, bs] = CTRL.BRAIN, bob = 5 * Math.sin(t * 2.4);
  const toB = (x, y) => [(x - bx) / bs, (y - by - bob) / bs];
  const up = o.point || 0, restR = [bx + 176 * bs, by + 118 * bs + bob], hr = [lerp(restR[0], bx + 214 * bs, up), lerp(restR[1], by - 150 * bs + bob, up)];
  const reach = o.reach || 0, restL = [bx - 176 * bs, by + 118 * bs + bob];
  const hl = [lerp(restL[0], knob[0] + 26, reach), lerp(restL[1], knob[1] + 4, reach)];
  actor(() => tfBrain(ctx, bx, by, bs, t, Object.assign({ helmet: 1, mood: 'grin', look: [0, -0.5], armR: toB(hr[0], hr[1]), armL: toB(hl[0], hl[1]) }, o.brain || {})));
  if ((o.whistle || 0) > 0.01) ctrlWhistle(bx - 2 * bs, by + 66 * bs + bob, 1.5 * bs, o.blow || 0, t);
  if (reach > 0.5) circle(ctx, knob[0] + 26, knob[1] + 4, 21, '#FFA9C0');   // its hand again, over the knob
  return { knob };
}
SC.warden = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 822, 1.0], [D, 540, 808, 1.06]]);   // the room sits low in the frame: its sign stays clear of the watermark's corners
  const sign = inv(c.fire - 0.06, c.fire + 0.16, t);
  const blow = ramp(t, c.whistle - 0.02, c.whistle + 0.05) * (1 - ramp(t, c.whistle + 0.15, c.whistle + 0.24));
  ctrlDraw(lt, t, { cam, sign, blow, whistle: ramp(t, c.running - 0.1, c.running + 0.1), point: ramp(t, c.fire - 0.16, c.fire + 0.1, E.outBack), inside: (cc, w, h) => fearCard(cc, 'exam', w, h, t),
    brain: { mood: t >= c.running ? 'wow' : 'grin', look: t >= c.fire - 0.2 ? [0, -0.9] : [0, -0.3], lean: -0.03 * sign } });
  const arrive = 1 - ramp(lt, 0, 0.24), beat = t >= c.fire ? 0.5 + 0.5 * Math.cos((t - c.fire) * 9) : 0;
  return { glow: 0.85, capY: 1560, zblur: 0.28 * arrive, zcx: 540, zcy: 900, flash: 0.36 * (1 - ramp(lt, 0, 0.16)), tint: '#FF5A4A', tintA: 0.10 * beat * clamp(sign) };
};
SC.fears = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  const cam = camKeys(lt, [[0, 540, 808, 1.06], [c.with - s0 - 0.1, 540, 804, 1.10], [c.logic - s0 + 0.16, 452, 1118, 1.40], [D, 448, 1126, 1.46]]);
  const kinds = ['exam', 'fall', 'chase', 'teeth'];
  let idx = 0, last = s0 - 9;
  for (const ct of c.cards) if (t >= ct) { idx++; last = ct; }
  const slide = inv(last, last + 0.13, t);
  const lever = ramp(t, c.switched + 0.18, c.off + 0.03, E.inCubic), reach = ramp(t, c.logic - 0.1, c.switched + 0.12, E.inOutCubic);
  ctrlDraw(lt, t, { cam, sign: 1, lever, reach, screenGlow: ['#7FA0FF', '#8FC8FF', '#FF7AB0', '#7FE9FF'][idx],
    inside: (cc, w, h) => {
      if (slide < 1 && idx > 0) { fearCard(cc, kinds[idx - 1], w, h, t); cc.save(); cc.translate(w * (1 - E.outCubic(slide)), 0); fearCard(cc, kinds[idx], w, h, t); cc.restore(); }
      else fearCard(cc, kinds[idx], w, h, t);
    },
    brain: { mood: lever > 0.9 ? 'grin' : reach > 0.3 ? 'squint' : 'grin', look: reach > 0.3 ? [-0.9, 0.3] : [0, -0.9], lean: -0.05 * reach } });
  const off = ramp(t, c.off, c.off + 0.12), click = t >= c.off ? Math.exp(-(t - c.off) * 9) : 0;
  return { glow: 0.85, capY: 1560, flash: 0.08 * click, desat: 0.25 * off, tint: '#5A64C8', tintA: 0.22 * off };
};

// ================================================================= THE STUDY: two bars
// Arnulf et al. 2014: 719 students, the night before a medical school entrance exam. Those who reported a dream about
// the exam scored 8.5 out of 20 on average; those who did not, 7.8.
function sleeperDisc(x, y, R, k, pal, o = {}) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, R + 10, o.ring || '#C8A8FF');
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.clip();
  ctx.fillStyle = '#1B2452'; ctx.fillRect(-R, -R, 2 * R, 2 * R);
  rrect(ctx, -R * 0.86, -R * 0.1, R * 1.72, R * 1.3, 40); ctx.fillStyle = '#D4DAF2'; ctx.fill();          // the pillow
  ctx.save(); ctx.translate(0, R * 0.16); ctx.scale(R / 104, R / 104); ctx.rotate(o.tilt || 0);
  drawHead(ctx, { head: [0, 0], lean: 0 }, Object.assign({}, FACES.sleepy, o.face || {}), { seed: 3 }, pal, o.t || 0);
  if (o.cap) dmCap(ctx, 0);
  ctx.restore();
  ctx.restore();
  ctx.restore();
}
SC.payoff = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#26347A', '#090C20');
  screenSpace();
  const LX = 312, RX = 748, BASE = 1290, PX = 36, BWD = 232, DY = 642, DR = 112;
  const OTHER = Object.assign({}, PAL, { skin: '#C99070', skinSh: '#A06A4C', skinHi: '#E3B090', hair: '#B5532E', hairHi: '#D9772E' });
  pill(540, 486, 'ONE STUDY · 719 STUDENTS', '#C8A8FF', ramp(lt, 0.03, 0.22), 33);
  // the two sleepers: him (he is one of them) from the first frame, somebody else on "students"
  const kS = ramp(lt, 0.0, 0.2), kS2 = ramp(t, c.students - 0.08, c.students + 0.14), bobL = 5 * Math.sin(t * 2.1), bobR = 5 * Math.sin(t * 2.1 + 2);
  sleeperDisc(LX, DY + bobL, DR, kS, PJ, { cap: true, t, face: { browY: 0.5, browTilt: 0.8, mouth: 'wavy', mouthOpen: 0.3 }, ring: '#7FE9FF' });
  sleeperDisc(RX, DY + bobR, DR, kS2, OTHER, { t, tilt: 0.05, face: { mouth: 'flat', mouthOpen: 0.3 }, ring: '#8FB8FF' });
  // the first one's dream: the exam, with teeth
  const kD = ramp(t, c.dreamed - 0.06, c.dreamed + 0.16);
  screenSpace();
  dmBubble(LX - 152, DY - 66 + bobL, 80, kD, [LX - 84, DY - 30 + bobL], (cc) => { cc.save(); cc.translate(0, 172); dmMonster(cc, 0, 0, 1.12, t, { run: t * 9 }); cc.restore(); }, { t, bg0: '#5A3A8C' });
  screenSpace();
  if (kS2 >= 1) zzz(RX + 84, DY - 40, t, c.students + 0.3, 0.9, 0.42);
  const label = (x, y, a, b, col, k) => { if (k <= 0) return; paint(() => { ctx.save(); ctx.translate(x, y); const s = E.outBack(clamp(k), 2); ctx.scale(s, s); ctx.font = '900 41px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.fillStyle = col; ctx.strokeText(a, 0, 0); ctx.fillText(a, 0, 0); ctx.strokeText(b, 0, 46); ctx.fillText(b, 0, 46); ctx.restore(); }); };
  label(LX, 798, 'DREAMED OF', 'THE EXAM', '#7FE9FF', kD);
  label(RX, 798, 'NO EXAM', 'DREAM', '#B9C6EE', ramp(t, c.of_their - 0.04, c.of_their + 0.18));
  // the bars: exam scores out of 20, from zero. The left one comes up with "scored", the right one a beat behind
  const gL = ramp(t, c.scored - 0.04, c.scored + 0.5, E.outCubic), gR = ramp(t, c.scored + 0.14, c.scored + 0.66, E.outCubic);
  const hi = ramp(t, c.higher - 0.02, c.higher + 0.16), pulse = t >= c.higher ? Math.exp(-(t - c.higher) * 6) : 0;
  line(ctx, 150, BASE, 910, BASE, 6, 'rgba(200,210,255,0.7)');
  // two empty slots wait for the scores: who did better?
  const slot = (x, k, g) => { if (k <= 0 || g >= 1) return; paint(() => { ctx.save(); ctx.globalAlpha = clamp(k) * (1 - g); ctx.setLineDash([16, 12]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,210,255,0.55)'; rrect(ctx, x - BWD / 2, BASE - 9.2 * PX, BWD, 9.2 * PX, 18); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '400 150px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(200,210,255,0.5)'; ctx.fillText('?', x, BASE - 4.6 * PX + 8 * Math.sin(t * 3 + x)); ctx.restore(); }); };
  const bar = (x, v, g, col, top, big) => {
    if (g <= 0) return;
    const h = v * PX * g;
    rrect(ctx, x - BWD / 2, BASE - h, BWD, h, 18); ctx.fillStyle = col; ctx.fill();
    paint(() => { ctx.save(); ctx.translate(x, BASE - h - 62); ctx.scale(big, big); ctx.font = '400 104px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.strokeStyle = '#0B0B1A'; ctx.fillStyle = top;
      const txt = (v * g).toFixed(1); ctx.strokeText(txt, 0, 0); ctx.fillText(txt, 0, 0); ctx.restore(); });
  };
  slot(LX, ramp(lt, 0.15, 0.4), gL); slot(RX, kS2, gR);
  bar(LX, 8.5, gL, mixHex('#3FA7FF', '#4DFFB4', hi), mixHex('#FFFFFF', '#4DFFB4', hi), 1 + 0.16 * pulse);
  bar(RX, 7.8, gR, '#6E7BB8', '#FFFFFF', 1);
  if (hi > 0) {
    // the gap: a dashed line from the lower bar's top across the taller one, an arrow up it, and what it comes to
    const yR = BASE - 7.8 * PX, yL = BASE - 8.5 * PX;
    paint(() => { ctx.setLineDash([14, 10]); line(ctx, LX - BWD / 2, yR, RX + BWD / 2, yR, 5, `rgba(255,255,255,${0.8 * hi})`); ctx.setLineDash([]);
      const ax = LX; line(ctx, ax, yR - 3, ax, yL + 16, 10, '#0B0B1A'); ctx.beginPath(); ctx.moveTo(ax - 22, yL + 22); ctx.lineTo(ax, yL + 3); ctx.lineTo(ax + 22, yL + 22); ctx.closePath(); ctx.fillStyle = '#0B0B1A'; ctx.fill(); });
    softDot(gctx, LX, yL - 62, 170, '#4DFFB4', 0.2 * hi + 0.22 * pulse);
  }
  paint(() => { ctx.globalAlpha = ramp(t, c.scored - 0.1, c.scored + 0.2); ctx.font = '800 32px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#B9C6EE'; ctx.fillText('EXAM SCORE, OUT OF 20', 540, BASE + 46); ctx.globalAlpha = 1; });
  const cut = 1 - ramp(lt, 0, 0.12);
  return { glow: 0.8, capY: 1478, flash: 0.14 * cut, push: { k: 1 + 0.025 * lt / D + 0.04 * ramp(t, c.higher - 0.1, c.higher + 0.4, E.inOutCubic), cx: 430, cy: 960 } };
};

// ---- the cover (cover.jpg: the YouTube thumbnail and the Instagram cover): the exam, the pajamas, the clock
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.pj + 0.74, cam = { x: 548, y: 1004, zoom: 1.66, rot: 0 };
  hallDraw(tt, tt, { cam });
  screenSpace();
  bigWord('WHY DO WE', 540, 1296, 124, '#FFFFFF', 1, -0.02);
  bigWord('DREAM?', 540, 1434, 184, '#FFD447', 1, -0.02);
  return { glow: 0.82, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initExam(); initCtrl();
}
