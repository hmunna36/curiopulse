// Why Does Your Leg KICK When You Tap Your Knee? 🦵 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// The exam room: the wall lamp upper left (the house rig), a cool rim from the right. 1902: a tall window on the right.
// The hall: a warm lamp from the left. The dog: a spotlight from above. Inside his head: the brain's room.
setLights({
  hook: LIGHTS.room, xray: LIGHTS.room, button: LIGHTS.room, cover: LIGHTS.room,
  brain: (lt) => (lt < 0.45 ? LIGHTS.room : { ...LIGHTS.inside, key: [0.45, -0.6, 0.6] }),
  lab: { ...LIGHTS.day, rimAmt: 0.9 }, hall: LIGHTS.candle, dog: { ...LIGHTS.lanterns, rim: [1.0, 0.86, 0.55] },
});

// ---------------------------------------------------------------- motion helpers (all functions of time: any frame renders alone)
// a kick: the shin swings up to amp (rad) in `rise` s, then swings back down and settles (a damped swing)
function lkKick(t, t0, amp, rise = 0.1, decay = 3.0, freq = 5.5) {
  if (t < t0) return 0;
  const u = t - t0;
  if (u < rise) return amp * E.outCubic(u / rise);
  const v = u - rise;
  return amp * Math.exp(-decay * v) * Math.cos(freq * v);
}
// the chopping hand's lift (0 = on the spot, 1 = raised high, rest = hovering): a wind-up, the chop, the bounce back
function lkChop(t, taps, rest = 0.55) {
  let v = rest;
  for (const tp of taps) {
    if (t >= tp - 0.30 && t < tp - 0.12) v = lerp(rest, 1, E.outCubic(inv(tp - 0.30, tp - 0.12, t)));
    else if (t >= tp - 0.12 && t < tp) v = lerp(1, 0, E.inQuad(inv(tp - 0.12, tp, t)));
    else if (t >= tp && t < tp + 0.32) v = lerp(0, rest, E.outCubic(inv(tp, tp + 0.32, t)));
  }
  return v;
}
const lkLookKnee = (f, k = 1) => Object.assign({}, f, { lookX: lerp(f.lookX, -0.85, k), lookY: lerp(f.lookY, 0.85, k) });
const LK_CLENCH = { eyeOpen: 0.62, pupil: 1, lookX: -0.7, lookY: 0.85, browY: -0.4, browTilt: -1.1, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 };

// the hero in the exam room as a function of video time (the hook, the x-ray replay and the button share it, so the
// last frame is the first: the loop)
function lkClinicH(t) {
  const c = cu(), D = TLd.duration;
  const H = { reach: 1 };
  // the taps (the chop and the leg's answer)
  const taps = [c.tap1, c.tap2, c.tap3, c.dud, c.tap6];
  H.chop = lkChop(t, taps) + 0.04 * Math.sin(t * loopW(5)) * (t < c.tap1 - 0.3 ? 1 : 0);
  let kick = lkKick(t, c.tap1 + 0.05, 0.16, 0.08) + lkKick(t, c.kick1, 0.88) + lkKick(t, c.kick2, 1.0);
  // the replay: the leg rewinds, the slow chop, the slow kick on "back"
  if (t >= c.replay && t < c.dud - 0.3) {
    const rw = inv(c.replay, c.replay + 0.2, t);
    kick = lerp(kick, 0, E.outCubic(rw)) + lkKick(t, c.kick3, 0.95, 0.35, 2.4, 5);
    H.chop = t < c.slowtap ? lerp(1, 0, E.inOutSine(inv(c.replay + 0.05, c.slowtap, t))) : lerp(0, 0.5, E.outCubic(inv(c.kick3, c.kick3 + 0.8, t)));
    H.dent = Math.min(ramp(t, c.slowtap, c.slowtap + 0.25), 1 - ramp(t, c.kick3 - 0.15, c.kick3 + 0.1));
  }
  // the button: a dud, then the mega kick
  kick += lkKick(t, c.mega, 1.35, 0.08, 3.6, 8);
  H.kick = kick;
  // the face
  let f = lkLookKnee(FACES.calm);
  if (t >= c.kick1 && t < c.notme) f = lerpFace(lkLookKnee(FACES.startled, 0.7), Object.assign({}, FACES.grin, { lookX: 0, lookY: 0, browY: 1.3 }), ramp(t, c.look1, c.look1 + 0.18));
  else if (t >= c.notme && t < c.tap3w - 0.5) f = Object.assign({}, FACES.nervous, { lookX: 0, lookY: 0, mouth: 'grin', mouthOpen: 0.8 });
  else if (t >= c.tap3w - 0.5 && t < c.replay) f = lerpFace(lkLookKnee(FACES.calm), lkLookKnee(FACES.startled, 0.8), ramp(t, c.kick2, c.kick2 + 0.08));
  else if (t >= c.replay && t < c.no - 0.2) f = lkLookKnee(FACES.calm);
  else if (t >= c.no - 0.2 && t < c.clench) f = lerpFace(lkLookKnee(FACES.calm), lkLookKnee(FACES.confused, 0.8), ramp(t, c.dud, c.dud + 0.2));
  else if (t >= c.clench && t < c.mega) f = lerpFace(lkLookKnee(FACES.confused, 0.8), LK_CLENCH, ramp(t, c.clench, c.clench + 0.2));
  else if (t >= c.mega && t < c.shoe_land) f = lerpFace(Object.assign({}, FACES.shock, { lookX: -0.4, lookY: -1 }), Object.assign({}, FACES.startled, { lookX: -0.3, lookY: -1 }), ramp(t, c.mega + 0.5, c.mega + 0.8));
  else if (t >= c.shoe_land && t < c.reset) f = Object.assign({}, FACES.calm, { blink: 1, lookX: -0.6, lookY: 0.8 });
  H.face = f;
  // gestures
  H.notme = Math.min(ramp(t, c.notme, c.notme + 0.22, E.outBack), 1 - ramp(t, c.you_end + 0.15, c.you_end + 0.45));
  H.headRot = 0.10 * Math.sin((t - c.notme) * 19) * H.notme;
  H.lean = -0.16 + 0.05 * H.notme;
  if (t >= c.clench && t < c.mega) { H.headDX = 2.5 * Math.sin(t * 70); H.headDY = 6; }
  // the see-through back, the spine's face
  H.xback = Math.min(ramp(t, c.xspine, c.xspine + 0.4), 1 - ramp(t, c.speed + 0.25, c.speed + 0.45));
  H.spineWave = Math.min(ramp(t, c.wave, c.wave + 0.12), 1 - ramp(t, c.wave + 0.7, c.wave + 0.85));
  H.spineMood = t >= c.catch && t < c.yank ? 'wide' : t >= c.yank ? 'grin' : 'calm';
  H.spineLook = t >= c.ping && t < c.catch + 0.3 ? [-1, 0.6] : [0, 0];
  H.spineYank = Math.min(ramp(t, c.yank, c.yank + 0.14, E.outBack), 1 - ramp(t, c.kick3 + 0.2, c.kick3 + 0.4));
  // the glass leg and the wires (the replay)
  H.xleg = Math.min(ramp(t, c.replay, c.replay + 0.3), 1 - ramp(t, c.speed + 0.25, c.speed + 0.45));
  H.stretch = t < c.yank ? ramp(t, c.stretch, c.stretch + 0.45, E.outBack) : lerp(1, -0.85, ramp(t, c.yank + 0.45, c.kick3 + 0.02));
  H.wires = H.xleg;
  H.wireUp = ramp(t, c.replay + 0.1, c.replay + 0.5); H.wireDn = ramp(t, c.replay + 0.3, c.replay + 0.7);
  H.sparkUp = t < c.ping ? 0 : inv(c.ping, c.catch, t) < 1 ? inv(c.ping, c.catch, t) : 0;
  H.sparkDn = t < c.yank ? 0 : inv(c.yank, c.kick3 - 0.1, t) < 1 ? inv(c.yank, c.kick3 - 0.1, t) : 0;
  H.holding = t >= c.catch && t < c.yank;
  // the shoe: launched by the mega kick, back on his foot at shoe_land
  H.shoeOff = t >= c.mega + 0.06 && t < c.shoe_land;
  return H;
}
// the flying shoe (world coords): up and off the top of the frame, then straight back down onto his foot
function lkFlyingShoe(t, foot) {
  const c = cu(), t0 = c.mega + 0.06, t1 = c.shoe_land;
  if (t < t0 || t >= t1) return;
  const u = inv(t0, t1, t), top = foot[1] - 1500;
  const y = u < 0.5 ? lerp(foot[1] - 60, top, E.outCubic(u * 2)) : lerp(top, foot[1] + 6, E.inQuad((u - 0.5) * 2));
  const x = foot[0] + (u < 0.5 ? -90 * Math.sin(u * Math.PI) : -40 * (1 - (u - 0.5) * 2));
  ctx.save(); ctx.translate(x, y); ctx.rotate(u < 0.5 ? u * 14 : 0.15 - 0.85 * 0); ctx.scale(LKH.s, LKH.s);
  actor(() => drawShoe(ctx, [0, 0], -1, LKPAL, 0, false));
  ctx.restore();
  if (u < 0.5) for (let i = 1; i < 5; i++) line(ctx, x + 20, y + 40 + i * 34, x + 20, y + 70 + i * 34, 6, rgba('#FFFFFF', 0.3 - i * 0.05));
}

// a pop-in tag (screen space): text in a rounded pill with a coloured edge. k 0..1
function lkTag(x, y, k, txt, col, size = 46, rot = -0.04) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(E.outBack(clamp(k)), E.outBack(clamp(k)));
  ctx.font = `900 ${size}px Montserrat`; const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  paint(() => {
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(10,12,28,0.88)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
  });
  ctx.restore();
}
// the dashed target on the spot to tap (screen space): it pulses while the line says where
function lkTarget(p, k, t) {
  if (k <= 0.01) return;
  screenSpace();
  const r = 46 + 6 * Math.sin(t * loopW(9));
  ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 40;
  ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  softDot(gctx, p[0], p[1], r + 24, '#FFD447', 0.25 * k);
}
// the shock burst behind a kicking foot (world coords)
function lkBurst(p, k, s = 1) {
  if (k <= 0.01 || k >= 1) return;
  const a = Math.sin(Math.PI * k);
  for (let i = 0; i < 9; i++) { const an = -2.6 + i * 0.32, r0 = 60 * s, r1 = (90 + 90 * k) * s; line(ctx, p[0] + Math.cos(an) * r0, p[1] + Math.sin(an) * r0, p[0] + Math.cos(an) * r1, p[1] + Math.sin(an) * r1, 7 * s, rgba('#FFF2C0', a)); }
}

// ---------------------------------------------------------------- the exam room shots
const LK_CAM_HOOK = [436, 1119, 1.48];
const LK_CAPY = 1545;                         // the exam-room shots: captions under his knee (the chop and the kick stay clear)
function lkClinicCam(t) {
  const c = cu(), D = TLd.duration;
  let k;
  if (t < c.tap3w - 0.1) {                    // the hook: tight, a slow push; back to the spine on "That was your SPINE"
    k = camKeys(t, [[0, ...LK_CAM_HOOK], [2.4, 436, 1124, 1.56], [c.pullback, 436, 1124, 1.56], [c.xspine + 0.1, 510, 1170, 1.25]]);
  } else if (t < c.no - 0.15) {               // the replay: to the thigh, out to the spine, in to the knee
    const lt = t;
    k = camKeys(lt, [[c.tap3w - 0.1, 510, 1170, 1.25], [c.replay + 0.15, 485, 1440, 2.0], [c.kick3 - 0.05, 488, 1440, 2.0],
      [c.kick3 + 0.3, 465, 1400, 1.5]]);
  } else {                                     // the button: the hook's framing, and back to frame 1
    k = camKeys(t, [[c.no - 0.15, 436, 1124, 1.56], [c.mega, 436, 1124, 1.60], [c.reset - 0.05, 436, 1124, 1.60], [D, ...LK_CAM_HOOK]]);
  }
  const sh = Math.max(0, 1 - (t - c.kick1) / 0.35) * (t >= c.kick1 ? 1 : 0) * 9 + Math.max(0, 1 - (t - c.mega) / 0.5) * (t >= c.mega ? 1 : 0) * 18;
  const [sx, sy] = shake(t, sh, 26, 3);
  return Object.assign(k, { sx, sy });
}
function lkClinicDraw(t) {
  const cam = lkClinicCam(t);
  lkRoomBack(cam, t);
  lkTable(cam);
  applyCam(cam);
  const H = lkClinicH(t);
  const out = lkHero(cam, t, H);
  applyCam(cam);
  lkFlyingShoe(t, out.ank);
  return { cam, H, out };
}

SC.hook = (lt, t, shot) => {
  const c = cu();
  const { cam, out } = lkClinicDraw(t);
  // the shock burst behind the foot as it kicks; the dashed target while the line says where to tap
  applyCam(cam);
  lkBurst(out.ank, inv(c.kick1, c.kick1 + 0.32, t), LKH.s * 0.8);
  const tp = toScreen(cam, out.tap[0], out.tap[1]);
  lkTarget(tp, Math.min(ramp(t, 0, 0.2), 1 - ramp(t, c.tap2 - 0.05, c.tap2 + 0.05)), t);
  lkTag(Math.max(250, tp[0] - 40), tp[1] - 175, Math.min(ramp(t, c.just - 0.05, c.just + 0.2), 1 - ramp(t, c.tap2 - 0.05, c.tap2 + 0.1)), 'TAP HERE', '#FFD447', 54, -0.06);
  // SPINE: a label on the window
  const sp = toScreen(cam, out.spine[0] + 150, out.spine[1] - 90);
  lkTag(Math.min(870, sp[0]), sp[1], ramp(t, c.spine1 + 0.1, c.spine1 + 0.35), 'SPINE', '#FF9A3C', 50, 0.04);
  return { glow: 0.85, capY: LK_CAPY };
};

SC.xray = (lt, t, shot) => {
  const c = cu();
  const { cam, out, H } = lkClinicDraw(t);
  applyCam(cam);
  lkBurst(out.ank, inv(c.kick2, c.kick2 + 0.32, t), LKH.s * 0.8);
  // the replay badge, the labels
  lkTag(270, 1385, Math.min(ramp(t, c.replay, c.replay + 0.2), 1 - ramp(t, c.speed - 0.1, c.speed + 0.05)), 'REPLAY ×300', '#FF5A6E', 46, -0.05);
  const m = toScreen(cam, out.muscle[0], out.muscle[1] - 40);
  lkTag(Math.max(260, m[0]), m[1] - 140, Math.min(ramp(t, c.label, c.label + 0.2), 1 - ramp(t, c.ping - 0.1, c.ping + 0.05)), 'THIGH MUSCLE', '#FF86A6', 40, -0.03);
  const sp = toScreen(cam, out.spine[0] + 70, out.spine[1] - 120);
  lkTag(Math.min(860, sp[0]), sp[1], Math.min(ramp(t, c.catch, c.catch + 0.2), 1 - ramp(t, c.speed - 0.1, c.speed + 0.05)), 'SPINE', '#FF9A3C', 46, 0.04);
  if (t > c.catch && t < c.yank) { screenSpace(); bigWord('!', Math.min(900, sp[0] + 40), sp[1] - 110, 120, '#FFD447', ramp(t, c.catch, c.catch + 0.2, E.outBack), 0.1); }
  lkTag(540, 470, ramp(t, c.speed, c.speed + 0.2), 'REAL SPEED: 1/50 s', '#4DFFB4', 50, -0.03);
  // the rewind: VHS lines for a moment
  const rw = Math.max(0, 1 - Math.abs(t - (c.replay + 0.08)) / 0.14);
  return { glow: 0.9, vhs: 0.55 * rw, capY: LK_CAPY };
};

SC.button = (lt, t, shot) => {
  const c = cu();
  const { cam, out } = lkClinicDraw(t);
  applyCam(cam);
  lkBurst(out.ank, inv(c.mega, c.mega + 0.4, t), LKH.s * 1.1);
  // the dud: a "?" over the knee; the clench: sweat
  const kn = toScreen(cam, out.knee[0], out.knee[1] - 120);
  if (t > c.dud && t < c.clench + 0.1) { screenSpace(); bigWord('?', kn[0] - 30, kn[1] - 40, 150, '#FFD447', ramp(t, c.dud + 0.05, c.dud + 0.25, E.outBack), -0.1); }
  const hd = toScreen(cam, out.head[0], out.head[1]);
  if (t > c.clench && t < c.mega) { screenSpace(); sweatDrop(ctx, hd[0] + 110, hd[1] - 70, 1.6, ramp(t, c.clench + 0.1, c.clench + 0.3)); }
  return { glow: 0.85, capY: LK_CAPY };
};

// ---------------------------------------------------------------- inside his head
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const open = ramp(lt, 0.06, 0.42, E.inCubic);
  if (open < 1) {
    // the head close-up: a round window opens on his forehead and the camera dives through it
    const head0 = [LKH.hx - 40 * LKH.s, LKH.hy - 244 * LKH.s];
    const cam = { x: head0[0], y: head0[1] + 10, zoom: lerp(2.3, 3.2, E.inCubic(clamp(lt / 0.42))), rot: 0 };
    lkRoomBack(cam, t);
    lkTable(cam);
    applyCam(cam);
    lkHero(cam, t, Object.assign(lkClinicH(cu().speed + 0.5), { face: lkLookKnee(FACES.calm, 0.5), xback: 0, xleg: 0, wires: 0 }));
    const p = toScreen(cam, head0[0] + 4, head0[1] - 30 * LKH.s), r = lerp(8, 1250, open);
    screenSpace();
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fillStyle = '#2A1238'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.clip();
    lkBrainInside(t, lt, false);
    ctx.restore();
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#C8A060'; ctx.stroke();
    return { glow: 0.85, zblur: 0.25 * open, zcx: p[0], zcy: p[1] };
  }
  lkBrainInside(t, lt);
  return { glow: 0.9, push: { k: 1 + 0.04 * (lt - 0.42) / (D - 0.42), cx: 560, cy: 1000 } };
};
function lkBrainInside(t, lt, full = true) {
  const c = cu();
  if (full) lkBrainRoom(t); else { screenSpace(); ctx.fillStyle = '#2A1238'; ctx.fillRect(0, 0, W, H); }
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.2);
  const wake = ramp(t, c.wake, c.wake + 0.25);
  // the bed group, scaled up round the brain (screen space)
  screenSpace(); ctx.save(); ctx.translate(560, 1040); ctx.scale(1.3, 1.3); ctx.translate(-560, -1040);
  lkBed(t);
  lkBrain(600, 1000 - 6 * breathe, 1.05, t, { mood: wake > 0.5 ? 'squint' : 'sleep', mask: wake, lean: -0.05, look: [-0.6, 0.6] });
  lkQuilt(t, breathe);
  ctx.restore();
  if (full) softDot(gctx, 560 + (935 - 560) * 1.3, 1040 + (940 - 1040) * 1.3, 200, '#FFC27A', 0.7);
  if (full && wake < 0.5) zzz(800, 640, t, 0, 1, 1.3);
  // the memo: in late, from below (from the spine), onto the quilt under the brain's nose
  lkMemo(560, 2100, 470, 1205, inv(c.memo, c.memo_land, t), t);
  if (wake > 0) { screenSpace(); bigWord('?', 860, 640, 190, '#C8A8FF', ramp(t, c.wake + 0.1, c.wake + 0.3, E.outBack), 0.12); }
}

// ---------------------------------------------------------------- 1902: the lab, in sepia
const LK_SEPIA = (t) => ({ desat: 0.78, tint: '#F6D2A0', tintA: 0.45, overlay: () => lkOldFilm(t) });
SC.lab = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 960, 1.0], [D, 530, 975, 1.07]], E.inOutSine);
  lkLabBack(cam, t);
  lkStool(cam);
  applyCam(cam);
  const kicks = [c.kick4, c.kick5, c.kick6];
  const kick = kicks.reduce((a, k0) => a + lkKick(t, k0, 0.95), 0);
  const kickB = kicks.reduce((a, k0) => a + lkKick(t, k0 + 0.04, 0.9), 0);
  let face = Object.assign({}, FACES.calm, { lookX: 0.8, lookY: 0.2 });
  if (t >= c.kick4 && t < c.ding2) face = Object.assign({}, FACES.startled, { lookX: -0.6, lookY: 0.9 });
  if (t >= c.kick5) face = Object.assign({}, FACES.shock, { lookX: -0.7, lookY: 0.9 });
  if (t >= c.kick5 + 0.6) face = Object.assign({}, FACES.confused, { lookX: 0.8, lookY: 0.2 });
  const out = lkHero(cam, t, { pal: LK_OLDPAL, x: LK_LAB.hx, y: LK_LAB.hy, s: LK_LAB.s, uncrossed: 1, reach: 0, kick, kickB, face, lean: -0.04 });
  // the hammers: they strike once (with the bell), then stay up while the bell rings alone
  const sw = Math.min(ramp(t, c.hammer1 - 0.12, c.hammer1, E.inQuad), 1 - ramp(t, c.hammer1 + 0.05, c.hammer1 + 0.4));
  const heads = lkHammers(cam, [out.tap, out.tapB], [sw, sw], t);
  // the scientist with his bell (and the monocle), on the volunteer's right
  const rings = [c.ding1, c.ding2, c.ding3].filter((d) => t >= d);
  const ring = rings.length ? t - rings[rings.length - 1] : 0;
  const bellUp = ramp(t, c.ding1 - 0.35, c.ding1 - 0.05);
  lkProf(790, 1720, 1.0, t, { mood: t >= c.kick5 + 0.05 ? 'amazed' : 'calm', bell: bellUp, bellLeft: true, ring: rings.length ? ring : 0,
    monocle: ramp(t, c.monocle, c.monocle + 0.6, (x) => x), lean: -0.03 });
  // ding marks round the bell
  const bellW = [790 - 130, 1720 - 640 - 40];
  for (const d of [c.ding1, c.ding2, c.ding3]) {
    const k = inv(d, d + 0.45, t);
    if (k > 0 && k < 1) { applyCam(cam); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(bellW[0], bellW[1], 70 + 36 * i + 50 * k, -2.5, -0.65); ctx.lineWidth = 7; ctx.strokeStyle = rgba('#FFF2C0', (1 - k) * 0.95); ctx.stroke(); } }
  }
  // NO HAMMERS: a cross on the two still hammers while the bell rings alone
  applyCam(cam);
  const hx = (heads[0][0] + heads[1][0]) / 2, hy = (heads[0][1] + heads[1][1]) / 2;
  const hs = toScreen(cam, hx, hy);
  if (t > c.ding2 && t < c.ding2 + 1.1) { screenSpace(); bigX(hs[0], hs[1], 0.5, ramp(t, c.ding2 + 0.05, c.ding2 + 0.25, E.outBack)); }
  // the stamps: 1902, and 150 TRIES LATER
  screenSpace();
  stamp('1902', 330, 610, ramp(t, c.stamp, c.stamp + 0.22, E.outBack), '#5A1408', -0.14, 150);
  lkTag(700, 560, Math.min(ramp(t, c.later, c.later + 0.2), 1 - ramp(t, c.alone_end, c.alone_end + 0.15)), '150 TRIES LATER', '#FFE2A0', 42, 0.03);
  return Object.assign({ glow: 0.8, capY: LK_CAPY }, LK_SEPIA(t));
};

// ---------------------------------------------------------------- 1904: the lecture hall
SC.hall = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 560, 980, 1.02], [D, 580, 1000, 1.10]], E.inOutSine);
  lkHallBack(cam, t);
  applyCam(cam);
  lkProf(800, 1430, 1.0, t, { mood: t > c.chirp ? 'deadpan' : 'proud', point: Math.min(ramp(t, c.point, c.point + 0.25, E.outBack), 1 - ramp(t, c.chirp - 0.1, c.chirp + 0.2)) });
  lkLectern(800, 1135);
  const ch = t > c.chirp && t < c.chirp + 1.4 ? 1 : 0;
  lkCricket(680, 1106, 1.8, t, ch);
  if (t > c.chirp) {
    const k = ((t - c.chirp) * 2.6) % 1;
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(610, 1070, 50 + 34 * i + 40 * k, -2.6, -1.2); ctx.lineWidth = 6; ctx.strokeStyle = rgba('#E8FFB0', 0.85 * (1 - k)); ctx.stroke(); }
  }
  // the experts: two rows from behind, nobody moves (one tips forward, asleep)
  const rows = [[1600, 1.05, 5, 215], [1800, 1.3, 4, 270]];
  rows.forEach(([y, sc, n, dx], ri) => {
    for (let i = 0; i < n; i++) {
      const x = 560 + (i - (n - 1) / 2) * dx + (ri % 2) * 30, sd = ri * 10 + i + 1;
      const nod = ri === 0 && i === 3 ? ramp(t, c.nod, c.nod + 0.35, E.outBack) : 0;
      lkExpert(x, y, sc, (sd % 3) ? 'top' : 'bowler', nod, sd);
    }
  });
  screenSpace();
  stamp('1904', 330, 610, ramp(t, c.y1904, c.y1904 + 0.22, E.outBack), '#5A1408', -0.14, 140);
  if (t > c.chirp) { ctx.font = '900 46px Montserrat'; ctx.fillStyle = rgba('#F4FFD0', 0.95 * popK(t, c.chirp + 0.1, c.chirp + 1.6)); ctx.textAlign = 'center'; ctx.fillText('chirp… chirp…', 470, 1010); }
  return Object.assign({ glow: 0.8 }, LK_SEPIA(t));
};

// ---------------------------------------------------------------- the dog's moment of fame
SC.dog = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 540, 980, 1.04], [D, 540, 965, 1.12]], E.inOutSine);
  const flashes = [c.flash1, c.flash1 + 0.42, c.flash1 + 0.95, c.medal + 0.1, c.medal + 0.55, c.sigh + 0.3];
  const fl = (i) => inv(flashes[i], flashes[i] + 0.22, t);
  lkStageBack(cam, t, 1300);
  applyCam(cam);
  lkDog(560, 1300, 1.5, t, { pant: 1, proud: ramp(t, c.medal, c.medal + 0.3), medal: ramp(t, c.medal, c.medal + 0.25, E.outBack), medalT: c.medal, drool: 0.5 + 0.5 * Math.sin(t * 3) });
  lkPressCam(300, 1730, 1.15, Math.max(fl(0), fl(3)));
  lkPressCam(790, 1750, 1.15, Math.max(fl(1), fl(4)));
  lkPressCam(560, 1840, 1.0, Math.max(fl(2), fl(5)));
  // the scientist in the dark foreground, deadpan
  lkProf(200, 1980, 1.0, t, { mood: t > c.sigh ? 'sigh' : 'deadpan', slump: ramp(t, c.sigh, c.sigh + 0.4) });
  const f = Math.max(...flashes.map((_, i) => Math.sin(Math.PI * clamp(fl(i))))) * 0.18;
  return { glow: 0.95, flash: f };
};

// ---------------------------------------------------------------- the cover (cover.sh): the mega kick, WHO KICKED?
SC.cover = (lt, t, shot) => {
  const c = cu();
  const tt = c.mega + 0.11;
  const cam = { x: 455, y: 924, zoom: 1.25, rot: 0 };
  lkRoomBack(cam, tt);
  lkTable(cam);
  applyCam(cam);
  const H = lkClinicH(tt);
  H.shoeOff = false;
  H.face = Object.assign({}, FACES.shock, { lookX: 0.1, lookY: 0.1 });
  const out = lkHero(cam, tt, H);
  applyCam(cam);
  lkBurst(out.ank, 0.45, LKH.s * 1.0);
  screenSpace();
  bigWord('WHO', 540, 500, 190, '#FFFFFF', 1, -0.05);
  bigWord('KICKED?', 540, 680, 190, '#FFD447', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  lkInitRoom();
  lkInitPast();
}
