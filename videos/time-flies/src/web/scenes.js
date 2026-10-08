// Why Does Time FLY as You Get Older? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
const clone = (p) => JSON.parse(JSON.stringify(p));
// a point given in a rig's head space -> world coords
function headPt(st, r, p) {
  const a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return toWorld(st, [r.head[0] + (st.headDX || 0) + p[0] * cs - p[1] * sn, r.head[1] + (st.headDY || 0) + p[0] * sn + p[1] * cs]);
}
// into a rig's head space (hats, cheeks, things in his mouth): call inside a charLayer post
function headSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// into a rig's own space (feet at 0, 0)
function rigSpace(c, st, fn) { c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); fn(c); c.restore(); }

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the party: a dim room, the candles in front of him, a cool window behind him on the right
const PARTY_LIGHT = { ...LIGHTS.candle, pool: 0.66 };
// the fair: a night outdoors, warm bulbs on the mast to his left
const FAIR_LIGHT = { ...LIGHTS.lanterns, key: [-0.42, -0.70, 0.56], rimFrom: [-0.9, -0.2], pool: 0.5 };
setLights({ hook: PARTY_LIGHT, button: PARTY_LIGHT, cover: PARTY_LIGHT, brain: LIGHTS.inside, payoff: LIGHTS.inside,
  kid: LIGHTS.day, now: { ...LIGHTS.room, pool: 0.42 }, drop: FAIR_LIGHT, felt: FAIR_LIGHT, new: FAIR_LIGHT });

const HUD_SLOT = [HUD.CASE[0] + 86 * HUD.CS, HUD.CASE[1] + 40 * HUD.CS];
let KID_Q = null, HUD_Q = null;
// the strongest of a list of flashes at time t (each decays in about a tenth of a second)
const flashOf = (t, times, rate = 11) => times.reduce((m, f) => Math.max(m, t >= f ? Math.exp(-(t - f) * rate) : 0), 0);

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu();
  partyDraw(t, t);
  const dive = ramp(t, shot.end - 0.24, shot.end, E.inCubic);
  const hit = Math.max(t >= c.slam2 ? Math.exp(-(t - c.slam2) * 12) : 0, t >= c.slam3 ? Math.exp(-(t - c.slam3) * 10) : 0);
  return { glow: 0.85, capY: 1470, zblur: 0.3 * dive, zcx: 540, zcy: 760, flash: 0.05 * hit + 0.5 * ramp(t, shot.end - 0.08, shot.end) };
};

// ---- the answer: inside his head, the brain measures time with a tape whose marks are photos
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  mindRoom(t);
  screenSpace();
  const bx = 566, by = 800, bs = 1.24, CX = 240, CY = 1092, slot = [CX + 86, CY + 40];
  const pull = ramp(t, c.measures - 0.08, c.time + 0.06, E.outCubic), L = 60 + 480 * pull;   // it ends at x 866: clear of the buttons column
  const Q = tfLine(slot[0], slot[1], slot[0] + 700, slot[1]);
  const snapK = flashOf(t, c.snaps, 9);
  const mood = t < c.measures - 0.1 ? 'calm' : t < c.new1 ? 'think' : snapK > 0.3 ? 'wow' : 'grin';
  const toB = (x, y) => [(x - bx) / bs, (y - by - 5 * Math.sin(t * 2.4)) / bs];
  actor(() => tfBrain(ctx, bx, by, bs, t, { mood, look: t < c.measures - 0.1 ? [0, 0.15] : [0.55, 1], armL: toB(CX + 6, CY - 92), armR: toB(slot[0] + L + 8, slot[1] - 6), lean: -0.03 }));
  tfCase(ctx, CX, CY, 1);
  circle(ctx, CX + 6, CY - 92, 24, '#FFA9C0');                       // its hand on top of the case
  tfTape(ctx, Q, 0, L, { shift: L, tab: true });
  circle(ctx, slot[0] + L + 12, slot[1] - 4, 24, '#FFA9C0');          // and the hand that pulls the tab
  const kinds = ['cake', 'bike', 'frog', 'kite', 'cone'];
  c.snaps.forEach((ts, j) => {
    const k = inv(ts, ts + 0.15, t);
    if (k <= 0) return;
    const px = slot[0] + 76 + j * 100, py = slot[1] - 6;
    tfPhoto(ctx, px, py, kinds[j], k, 0.08 * Math.sin(j * 2.3), 0.94);
    tfFlash(px, py - 20, t >= ts ? Math.exp(-(t - ts) * 12) : 0, 110);
  });
  const arrive = 1 - ramp(lt, 0, 0.26);
  return { glow: 0.85, zblur: 0.25 * arrive, zcx: 540, zcy: 800, flash: 0.45 * (1 - ramp(lt, 0, 0.18)) + 0.06 * snapK, push: { k: 1 + 0.045 * lt / D, cx: 540, cy: 900 } };
};

// ---- a summer at seven: everything is a first, and the tape pours out
function kidTape(t) {
  const c = cu();
  let n = 0;
  for (const f of c.firsts) n += ramp(t, f, f + 0.16, E.outCubic);
  return 30 + TAPE.step * n + 660 * Math.max(0, t - c.lasts);
}
SC.kid = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, F = c.firsts;
  summerBack(t, 1);
  screenSpace();
  // the kite, up on the right, on a string to his handlebar
  const kiteK = ramp(t, F[2] - 0.12, F[2] + 0.1, E.outBack);
  const wasp = ramp(t, F[3] - 0.35, F[3]);
  let face = Object.assign({}, FACES.grin, { lookX: 0, lookY: 0.1 });
  face = lerpFace(face, Object.assign({}, FACES.nervous, { lookX: 0.9, lookY: -0.4 }), wasp * (1 - ramp(t, c.one - 0.1, c.one + 0.2)));
  const K = kidRide(t, { face }), st = K.st;
  const bx = KID.X + K.dx * 1.3, grip = [bx + 150 * KID.B, KID.BAR];
  if (kiteK > 0) {
    const kx = 900 + 22 * Math.sin(t * 2.3), ky = 960 + 18 * Math.sin(t * 3.1 + 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(grip[0] - 8, grip[1]); ctx.quadraticCurveTo(lerp(grip[0], kx, 0.6), grip[1] - 40, kx - 4, ky + 30); ctx.stroke();
    ctx.save(); ctx.translate(kx, ky); ctx.rotate(0.25 + 0.12 * Math.sin(t * 4)); tfIcon(ctx, 'kite', 3.0 * kiteK); ctx.restore();
  }
  // him, then the bike in front of his legs, then his hands on the grips
  const r = charLayer(CAM0, st, t, { pal: KIDPAL, post: (cc, rr, s2) => { headSpace(cc, rr, s2, (hc) => kidHelmet(hc)); } });
  screenSpace();
  kidBike(bx, KID.BAR + 206 * KID.B, KID.B, K.sway * 1.4, t);
  rigSpace(ctx, st, (cc) => { drawHand(cc, r.wrL, r.armDirL, 'open', KIDPAL, -1, t); drawHand(cc, r.wrR, r.armDirR, 'open', KIDPAL, 1, t); });
  // a frog lands on his helmet and stays
  const hop = inv(F[1] - 0.34, F[1], t);
  if (hop > 0) {
    const top = headPt(st, r, [0, -122]), e = E.outCubic(hop);
    const fx = lerp(90, top[0], e), fy = lerp(1330, top[1], e) - 220 * Math.sin(Math.PI * hop);
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(hop < 1 ? -0.5 * (1 - hop) : 0.04 * Math.sin(t * 5)); tfIcon(ctx, 'frog', 2.5 * (1 + 0.1 * Math.max(0, Math.sin(t * 6)) * (hop >= 1 ? 1 : 0))); ctx.restore();
  }
  // a wasp comes to look at him
  if (wasp > 0) {
    const hd = headPt(st, r, [0, 0]), a = t * 6.5, wx = hd[0] + 170 * Math.cos(a) + 420 * (1 - wasp), wy = hd[1] - 30 + 56 * Math.sin(a * 1.3) - 60 * (1 - wasp);
    ctx.save(); ctx.translate(wx, wy); ctx.scale(Math.cos(a) > 0 ? -1 : 1, 1); tfIcon(ctx, 'wasp', 1.9); ctx.restore();
  }
  // a beach ball bounces across the path
  const bl = inv(F[4] - 0.1, F[4] + 0.9, t);
  if (bl > 0 && bl < 1) { const x = lerp(-80, 1160, bl), y = 1420 - 170 * Math.abs(Math.sin(bl * Math.PI * 2.5)); ctx.save(); ctx.translate(x, y); ctx.rotate(bl * 9); tfIcon(ctx, 'ball', 2.6); ctx.restore(); }
  // ---- the brain in its window, snapping away, and the tape that never ends
  const L = kidTape(t), pour = Math.max(0, t - c.lasts);
  const fk = Math.max(flashOf(t, F, 11), pour > 0 ? Math.pow(1 - ((L / TAPE.step) % 1), 3) : 0);
  tfHud(t, { brain: { mood: fk > 0.3 ? 'wow' : 'grin', cam: { flash: fk }, look: [0.6, 0.6] }, flash: fk });
  tfTape(ctx, KID_Q, 0, Math.min(L, KID_Q.len), { w: 34, shift: L });
  tfTapePhotos(ctx, KID_Q, L, KID_PHOTOS, { s: 0.56 });
  const inf = ramp(t, c.forever - 0.05, c.forever + 0.3);
  if (inf > 0) softDot(gctx, KID_Q.cx, KID_Q.cy, 240, '#FFE9A6', 0.16 * inf * (0.7 + 0.3 * Math.sin(t * 9)));
  const whip = 1 - ramp(lt, 0, 0.2);
  return { glow: 0.8, capY: 1500, blur: [130 * whip, 0], flash: 0.07 * fk, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 1000 } };
};

// ---- now: the same desk, the same lunch, and a brain that does not bother
SC.now = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = OFFICE.S;
  officeBack(lt, t);
  officeCalendar(lt, t);
  screenSpace();
  let p = clone(POSES.stand);
  const st = { x: OFFICE.X, y: OFFICE.Y, s: S, pose: p, noLegs: true };
  const lift = ramp(t, c.lunch - 0.44, c.lunch - 0.04, E.inOutCubic) * (1 - ramp(t, c.lunch_end - 0.06, c.lunch_end + 0.26, E.inOutCubic));
  const bite = ramp(t, c.lunch + 0.04, c.lunch + 0.12);
  const chew = bite * (1 - ramp(t, c.your_b, c.your_b + 0.3));
  const tap = (ph) => 9 * Math.max(0, Math.sin(t * 19 + ph));
  const loc = (x, y) => [(x - st.x) / S, (y - st.y) / S];
  const mouthW = [st.x - 4, st.y - 430 * S + 6];
  const plate = [190, OFFICE.DESK + 50], sand = [lerp(plate[0], mouthW[0] - 92, lift), lerp(plate[1], mouthW[1] + 26, lift) - 80 * Math.sin(Math.PI * lift)];
  const handL = lift > 0.02 ? [sand[0] - 10, sand[1] + 44] : [452, OFFICE.DESK + 70 - tap(0)];
  p = ikReach(p, 'L', loc(handL[0], handL[1]), -1);
  p = ikReach(p, 'R', loc(628, OFFICE.DESK + 70 - tap(2.1) * (lift > 0.5 ? 0 : 1)), -1);
  st.pose = p;
  let face = Object.assign({}, FACES.drowsy, { lookY: 0.7, blink: 0.5 });
  face = lerpFace(face, Object.assign({}, FACES.drowsy, { mouth: 'o', mouthOpen: 0.9, lookX: -0.5, lookY: 0.6, blink: 0.4 }), ramp(t, c.lunch - 0.16, c.lunch) * (1 - bite));
  if (chew > 0.05) face = Object.assign({}, face, { mouth: 'wavy', mouthOpen: 0.3 });
  st.face = face; st.headDY = 3 * Math.sin(t * 19) * (1 - lift) + 3 * chew * Math.sin(t * 14); st.headRot = -0.05 * lift;
  const r = charLayer(CAM0, st, t, { pal: OFFPAL, post: (cc, rr, s2) => {
    rigSpace(cc, s2, (hc) => { hc.save(); hc.translate(rr.P[0], rr.P[1]); hc.beginPath(); hc.moveTo(-12, -166); hc.lineTo(12, -166); hc.lineTo(7, -146); hc.lineTo(17, -66); hc.lineTo(0, -44); hc.lineTo(-17, -66); hc.lineTo(-7, -146); hc.closePath(); hc.fillStyle = '#C0392B'; hc.fill(); hc.restore(); });
    if (chew > 0.05) headSpace(cc, rr, s2, (hc) => tfCheeks(hc, 0.3 + 0.2 * Math.sin(t * 14), OFFPAL));
  } });
  officeDesk(t);
  officeSandwich(ctx, sand[0], sand[1], 1.3 + 0.35 * lift, bite, -0.42 * lift);
  if (lift > 0.02) rigSpace(ctx, st, (cc) => drawHand(cc, r.wrL, r.armDirL, 'open', OFFPAL, -1, t));
  // ---- the brain: asleep under its mask. It lifts it for a look, and pulls it down again
  const peek = ramp(t, c.your_b - 0.1, c.your_b + 0.1) * (1 - ramp(t, c.bother - 0.05, c.bother + 0.12));
  tfHud(t, { brain: { mask: peek > 0.5 ? 0 : 1, mood: 'squint', look: [0.8, 0.9], still: true, lean: 0.06 }, web: 1, ring: '#8A93AD' });
  if (peek < 0.5) zzz(HUD.X + 40, HUD.Y - 70, t, shot.start, 0.9, 0.5);
  tfTape(ctx, HUD_Q, 0, 10, { w: 34, tab: true });
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.7, capY: 1470, desat: 0.4, flash: 0.12 * cut, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 1000 } };
};

// ---- the payoff: two tapes. One summer, and all of last year. The aside plays over it: the brain finds a helmet
SC.payoff = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  mindRoom(t);
  screenSpace();
  const s1 = tfCase(ctx, 152, 610, 0.62), s2 = tfCase(ctx, 152, 900, 0.62);
  // one summer: it runs off the frame, and keeps coming
  const Q1 = tfLine(s1[0], s1[1], 1180, s1[1]), in1 = ramp(lt, 0.05, 0.6, E.outCubic), L1 = 1000 * in1 + 150 * lt;
  tfTape(ctx, Q1, 0, Math.min(L1, Q1.len), { w: 44, shift: L1 });
  tfTapePhotos(ctx, Q1, L1, KID_PHOTOS, { s: 0.7 });
  // last year: the brain pulls, and pulls, and gets this
  const tug = t < c.tiny ? 6 * Math.max(0, Math.sin((t - c.a_year) * 16)) * ramp(t, c.a_year, c.a_year + 0.1) : 0;
  const out = ramp(t, c.tiny - 0.02, c.tiny + 0.14, E.outBack), L2 = 12 + tug + 128 * out;
  const Q2 = tfLine(s2[0], s2[1], s2[0] + 400, s2[1]);
  tfTape(ctx, Q2, 0, L2, { w: 44, shift: L2, tab: true });
  if (out > 0.2) tfPhoto(ctx, s2[0] + 12 + 128 * out - 62, s2[1] - 4, 'desk', inv(c.tiny, c.tiny + 0.12, t), -0.06, 0.7);
  // the brain, beside the short one
  const bx = 728, by = 916, bs = 0.72, aside = ramp(t, c.sub_w - 0.1, c.sub_w + 0.2), helm = ramp(t, c.gets - 0.02, c.gets + 0.34);
  const mood = helm > 0.6 ? 'grin' : t >= c.tiny ? 'sad' : t >= c.a_year ? 'think' : 'calm';
  const toB = (x, y) => [(x - bx) / bs, (y - by) / bs];
  const reach = t >= c.a_year - 0.2 && helm < 0.05;
  actor(() => tfBrain(ctx, bx, by, bs, t, { mood, look: helm > 0.3 ? [0, 0] : t >= c.a_year - 0.3 ? [-1, 0.5] : [-0.6, -0.9], helmet: helm,
    armL: reach ? toB(s2[0] + L2 + 10, s2[1] - 4) : helm > 0.05 ? toB(bx - 96, by - 96 + 60 * (1 - helm)) : undefined, armR: helm > 0.05 ? toB(bx + 96, by - 96 + 60 * (1 - helm)) : undefined }));
  screenSpace();
  pill(338, 520, 'ONE SUMMER, AGE 7', '#FFD447', ramp(lt, 0.1, 0.34), 38);
  pill(318, 812, 'ALL OF LAST YEAR', '#8FB8FF', ramp(t, c.a_year - 0.1, c.a_year + 0.14), 38);
  pill(806, 500, 'LEADING IDEA', '#C8A8FF', ramp(t, c.think - 0.05, c.think + 0.2), 30);
  const cut = 1 - ramp(lt, 0, 0.1);
  return { glow: 0.85, flash: 0.1 * cut, push: { k: 1 + 0.04 * lt / D + 0.05 * ramp(t, c.gets, c.gets + 0.5, E.inOutCubic), cx: 620, cy: 860 } };
};

// ---- the tower: he hangs, the lever comes down, he drops; the brain's camera goes off like a strobe
function towerCam(t) {
  const c = cu(), F = fallState(t), s0 = shotOf('drop').start;
  let cam = { x: 540, y: 700 - 14 * ramp(t, s0, c.release, E.inOutSine), zoom: 1.0 + 0.06 * ramp(t, s0, c.release, E.inOutSine), rot: 0 };
  if (F.falling || F.landed) {
    cam = { x: 540, y: 686 + F.d + 60 * F.u, zoom: 1.06 - 0.10 * F.u, rot: 0 };
    if (F.landed) {
      const settle = ramp(t, c.net, c.net + 0.5, E.outCubic), push = ramp(t, c.so - 0.15, c.so + 0.5, E.inOutCubic);
      cam.y = lerp(cam.y, 3112, settle); cam.zoom = lerp(cam.zoom, 0.9, settle);
      cam.x = lerp(lerp(540, 722, settle), 640, push); cam.y = lerp(cam.y, 3252, push); cam.zoom = lerp(cam.zoom, 1.14, push);
      const sh = shake(t, 16 * Math.exp(-F.tau * 6), 28, 5); cam.x += sh[0]; cam.y += sh[1];
    }
  }
  return { cam, F };
}
function towerDraw(t) {
  const c = cu(), { cam, F } = towerCam(t), H0 = fallHero(t), st = H0.st;
  fairBack(cam, t, F.v);
  applyCam(cam);
  fairMast(cam, t, F.v);
  const pull = ramp(t, c.dropped - 0.04, c.dropped + 0.1, E.inCubic);
  const top = cam.y < 2300;
  let knob = null;
  if (top) knob = fairTop(t, pull);
  if (cam.y > 1900) fairNet(t, F.landed ? F.sag : 0, false);
  if (top) fairScientist(t, knob, pull);
  applyCam(cam);
  // the rope: to his harness until the lever lets it go, then it whips back up
  const ry = F.falling || F.landed ? 520 - 200 * ramp(t, c.release, c.release + 0.25) : st.y - 540;
  if (top) line(ctx, FAIR.HX, 268, FAIR.HX + (F.falling ? 14 * Math.sin(t * 30) : 0), Math.max(300, FAIR.TOP - 540 + (F.falling || F.landed ? -200 * ramp(t, c.release, c.release + 0.25) : 0)), 7, '#C9D0E4');
  const r = charLayer(cam, st, t, { pal: PAL, post: (cc, rr, s2) => {
    rigSpace(cc, s2, (hc) => fairHarness(hc, rr, s2.pose));
    headSpace(cc, rr, s2, (hc) => fairHelmet(hc));
  } });
  applyCam(cam);
  // the dizzy stars round his head once he is in the net
  if (F.landed) {
    const k = 1 - ramp(t, c.so - 0.1, c.so + 0.2), hd = headPt(st, r, [0, -96]);
    if (k > 0.02) for (let i = 0; i < 4; i++) { const a = t * 4.2 + i * Math.PI / 2; ctx.save(); ctx.translate(hd[0] + 92 * Math.cos(a), hd[1] + 24 * Math.sin(a)); ctx.rotate(a); tfIcon(ctx, 'star', 0.8 * k * (0.8 + 0.2 * Math.sin(a))); ctx.restore(); }
  }
  if (cam.y > 1900) fairNet(t, F.landed ? F.sag : 0, true);
  // "something new": a new photo, held up for us (drawn over the net, his hand over its corner)
  const pk = F.landed ? inv(c.new3 - 0.04, c.new3 + 0.12, t) : 0;
  if (pk > 0) {
    const w = toWorld(st, r.wrL);
    tfPhoto(ctx, w[0] - 6, w[1] - 62, 'fall', pk, -0.14 + 0.03 * Math.sin(t * 5), 1.9);
    rigSpace(ctx, st, (cc) => drawHand(cc, r.wrL, r.armDirL, 'open', PAL, -1, t));
    tfFlash(w[0] - 6, w[1] - 70, t >= c.new3 ? Math.exp(-(t - c.new3) * 9) : 0, 150);
    const P = toScreen(cam, w[0] - 6, w[1] - 62);
    screenSpace();
    bigWord('NEW!', P[0] - 10, P[1] - 168, 84, '#FFD447', E.outBack(clamp(inv(c.new3 + 0.02, c.new3 + 0.2, t)), 2.4), -0.1);
    applyCam(cam);
  }
  // speed: streaks of air past him
  if (F.falling) {
    screenSpace();
    const a = clamp(F.v / 1800);
    paint(() => { for (let i = 0; i < 22; i++) { const x = hash(i * 9.1) * W, y = ((hash(i * 4.3) * H - t * (2600 + 900 * hash(i))) % H + H) % H, len = 120 + 260 * hash(i * 2.2); line(ctx, x, y, x, y + len * a, 3 + 3 * hash(i), `rgba(225,235,255,${0.34 * a})`); } });
  }
  return { cam, F, st, r, pull };
}
// the brain's window during the drop: burst mode, and photos of the fall pouring out
function towerHud(t, mode) {
  const c = cu(), B = c.burst;
  let n = 0;
  for (const b of B) n += ramp(t, b, b + 0.09, E.outCubic);
  const fk = mode === 'drop' ? flashOf(t, B, 16) : 0;
  const L = mode === 'drop' ? 8 + TAPE.step * n : 8;
  const scared = t > c.dropped - 0.2 && t < c.release;
  const brain = mode === 'drop' ? { mood: scared ? 'worried' : fk > 0.25 ? 'wow' : 'grin', cam: t >= c.release ? { flash: fk } : null, look: [0.7, 0.8], helmet: 1 }
    : mode === 'new' ? { mood: 'grin', look: [0.7, 0.6], helmet: 1, cam: { flash: flashOf(t, [c.click3], 9), x: 60, y: 40, rot: 0.2, s: 0.8 } }
      : { mood: 'grin', look: [0.4, 0.9], helmet: 1 };
  tfHud(t, { brain, flash: Math.max(fk, mode === 'new' ? flashOf(t, [c.click3], 9) : 0) });
  tfTape(ctx, HUD_Q, 0, Math.min(L, HUD_Q.len), { w: 34, shift: L, tab: true });
  if (mode === 'drop') tfTapePhotos(ctx, HUD_Q, L, ['fall'], { s: 0.5 });
  return { fk };
}
SC.drop = (lt, t, shot) => {
  const c = cu(), T = towerDraw(t), H2 = towerHud(t, 'drop');
  const whip = 1 - ramp(lt, 0, 0.18), land = t >= c.net ? Math.exp(-(t - c.net) * 9) : 0;
  return { glow: 0.85, blur: [0, 150 * whip + 26 * clamp(T.F.v / 2200)], flash: 0.07 * H2.fk + 0.14 * land };
};
// ---- in the net: the real fall and the remembered one, as two bars
// What the study measured (Stetson, Fiesta & Eagleman 2007): the same 2.5 s fall, judged with a stopwatch afterwards.
// Watching someone else fall: 2.17 s on average. Their own fall, from memory: 2.96 s. That is the 36 %.
function feltEye(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(0, -34, 40, 0); c.quadraticCurveTo(0, 34, -40, 0); c.closePath(); c.fillStyle = '#FBF8F0'; c.fill();
  paint(() => { circle(c, 0, 0, 15, '#3FA7FF'); circle(c, 0, 0, 7, '#15132A'); circle(c, -4, -5, 3, '#FFFFFF'); });
  c.restore();
}
function feltBars(t) {
  const c = cu(), X0 = 226, RW = 380, YA = 806, YB = 952;
  const gone = 1 - ramp(t, c.so - 0.2, c.so - 0.02, E.inCubic);
  if (gone <= 0.01) return;
  const kA = ramp(t, c.they - 0.06, c.they + 0.16, E.outBack) * gone;
  const draw = ramp(t, c.remembered, c.fall_end, E.inOutSine), more = ramp(t, c.a_third, c.longer + 0.05, E.inOutCubic);
  const kB = ramp(t, c.remembered - 0.1, c.remembered + 0.08) * gone;
  const num = (txt, x, y, col = '#FFFFFF') => paint(() => { ctx.font = '400 84px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); });
  screenSpace();
  // watching someone else fall: a bar
  if (kA > 0) {
    ctx.save(); ctx.translate(X0, YA); ctx.scale(kA, kA); ctx.translate(-X0, -YA);
    rrect(ctx, X0, YA - 37, RW, 74, 18); ctx.fillStyle = '#8FB8FF'; ctx.fill();
    paint(() => { ctx.font = '900 33px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#16264F'; ctx.fillText('WATCHING A FALL', X0 + 22, YA + 3); });
    num('2.2 s', X0 + RW + 24, YA + 6);
    feltEye(ctx, X0 - 62, YA, 1.05);
    ctx.restore();
  }
  // their own fall, from memory: the brain's tape, drawn along the bar... and past its end
  if (kB > 0) {
    const Q = tfLine(X0, YB, X0 + RW * 1.36 + 2, YB), L = RW * (draw + 0.36 * more) * gone;
    tfCamera(ctx, X0 - 62, YB, 0.74 * kB, 0, -0.1);
    tfTape(ctx, Q, 0, Math.max(3, L), { w: 66, shift: L, tab: true });
    tfTapePhotos(ctx, Q, L, ['fall'], { s: 0.74, off: 60 });
    paint(() => { ctx.font = '900 34px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.globalAlpha = kB; ctx.fillStyle = '#FFE9A6'; ctx.lineWidth = 7; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.strokeText('THEIR OWN FALL', X0, YB - 66); ctx.fillText('THEIR OWN FALL', X0, YB - 66); ctx.globalAlpha = 1; });
    if (more > 0.01) { ctx.setLineDash([12, 10]); line(ctx, X0 + RW, YA - 50, X0 + RW, YB + 52, 5, 'rgba(255,255,255,0.8)'); ctx.setLineDash([]); }
    const k3 = ramp(t, c.longer - 0.06, c.longer + 0.1, E.outBack) * gone;
    if (k3 > 0) { ctx.save(); ctx.translate(X0 + RW * 1.36 + 26, YB + 6); ctx.scale(k3, k3); num('3.0 s', 0, 0, '#FFE9A6'); ctx.restore(); }
  }
  const p36 = ramp(t, c.longer + 0.08, c.longer + 0.3) * gone;
  if (p36 > 0) { bigWord('+36%', 700, 1094, 120, '#4DFFB4', E.outBack(clamp(p36), 2.4), -0.06); softDot(gctx, 700, 1094, 170, '#4DFFB4', 0.2 * p36); }   // inside the key zone
  pill(768, 524, 'ONE SMALL STUDY, 2007', '#8FB8FF', ramp(t, c.they + 0.1, c.they + 0.34) * gone, 29);
}
SC.felt = (lt, t, shot) => {
  const c = cu();
  towerDraw(t); towerHud(t, 'felt');
  feltBars(t);
  return { glow: 0.85, capY: 1520, flash: 0.14 * (t >= c.net ? Math.exp(-(t - c.net) * 9) : 0) };
};
SC.new = (lt, t, shot) => {
  const c = cu();
  towerDraw(t); const H2 = towerHud(t, 'new');
  feltBars(t);
  return { glow: 0.85, capY: 1520, flash: 0.5 * flashOf(t, [c.click3], 7) };
};

SC.button = (lt, t, shot) => {
  partyDraw(t - TLd.duration, t);
  return { glow: 0.85, capY: 1470, flash: 0.3 * (1 - ramp(lt, 0, 0.14)) };
};

// ---- the cover (cover.jpg: the YouTube thumbnail and the Instagram cover): three birthdays at once, rendered by cover.sh
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.slam3 + 0.13, cam = { x: 540, y: 1296, zoom: 2.25, rot: 0 };
  partyDraw(tt, tt, { cam, confetti: false, kindMap: { 2: 1 }, under: () => {
    // the birthday before this one and the one after it, on either side: 29, 30, 31
    for (const [x, kind] of [[352, 0], [728, 2]]) { ctx.save(); ctx.translate(x, PARTY.CY + 26); ctx.scale(0.6, 0.6); tfCake(0, 0, tt, { kind, lit: [1, 1], lean: [0, 0], out: [-1, -1] }); ctx.restore(); }
  } });
  applyCam(cam);
  tfConfetti(PARTY.CX - 250, PARTY.CY - 300, 0.42, 5, 20, 0.8); tfConfetti(PARTY.CX + 250, PARTY.CY - 300, 0.4, 6, 20, 0.8);
  screenSpace();
  bigWord('TIME FLIES?!', 540, 1404, 164, '#FFD447', 1, -0.025);
  return { glow: 0.86, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initParty(); initMind(); initFair();
  KID_Q = tfEight(HUD_SLOT[0], HUD_SLOT[1], 30, 12);
  HUD_Q = tfLine(HUD_SLOT[0], HUD_SLOT[1], 1140, HUD_SLOT[1]);
}
