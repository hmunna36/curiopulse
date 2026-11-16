// Your Text to VOYAGER 1 Would Take a Whole DAY: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside
// the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a cue (make_timeline.py).
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the porch: the wall lamp up on the LEFT, the cool night sky behind him on the right (rim); space: a far Sun up on the
// left, his own text glowing green under him (a cool green-white rim from the right); the scale: a diagram
const VG_L_PORCH = Object.assign({}, LIGHTS.lanterns, { key: [-0.45, -0.70, 0.55], keyTint: [1.10, 1.03, 0.92], rimFrom: [0.90, -0.30],
  rim: [0.62, 0.68, 1.0], rimAmt: 1.2, haloColor: [1.0, 0.7, 0.45], halo: 0.12, pool: 0.5 });
const VG_L_SPACE = Object.assign({}, LIGHTS.night, { key: [-0.50, -0.62, 0.60], keyTint: [1.02, 1.02, 1.06], shadowTint: [0.62, 0.66, 1.0],
  rimFrom: [0.85, -0.25], rim: [0.55, 1.0, 0.78], rimAmt: 1.15, pool: 0.4, poolTint: [0.4, 0.42, 0.8], halo: 0.1 });
setLights({
  hook: VG_L_PORCH, answer: VG_L_PORCH, beep: VG_L_PORCH, button: VG_L_PORCH, loop: VG_L_PORCH, cover: VG_L_PORCH,
  race: VG_L_SPACE, tomorrow: VG_L_SPACE, reply: VG_L_SPACE, weird: Object.assign({}, LIGHTS.diagram, { halo: 0 }),
});

// ---------------------------------------------------------------- him (any place)
// o: {x, y, s, pose, face, pal, armR/armL: {e, w} (world points: elbow, wrist), hand, handR, handL, phone: {x, y, h, rot,
//     chat: {...vgChatFace}, thumb: {u, v} | null}, stubble (0..1), headDX, headRot, lean, frizz, pre, post}
function vgHero(cam, t, o) {
  const st = { x: o.x, y: o.y, s: o.s, frizz: o.frizz || 0, seed: 3, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0,
    hideArm: o.hideArm, noLegs: o.noLegs };
  let pose = JSON.parse(JSON.stringify(o.pose || POSES.stand));
  if (o.lean != null) pose.lean = o.lean;
  if (o.armR) pose = armAt(pose, 'R', ikLocal(st, o.armR.e[0], o.armR.e[1]), ikLocal(st, o.armR.w[0], o.armR.w[1]));
  if (o.armL) pose = armAt(pose, 'L', ikLocal(st, o.armL.e[0], o.armL.e[1]), ikLocal(st, o.armL.w[0], o.armL.w[1]));
  if (o.hand) pose.hand = o.hand;
  if (o.handR) pose.handR = o.handR;
  if (o.handL) pose.handL = o.handL;
  st.pose = pose; st.face = o.face || FACES.calm;
  applyCam(cam);
  const r = charLayer(cam, st, t, { pal: o.pal || PAL, pre: o.pre, post: (lc, rr, s2) => {
    if (o.stubble) vgStubble(lc, s2, rr, o.stubble);
    if (o.phone) {
      const p = o.phone;
      vgPhone(lc, p.x, p.y, p.h, t, p.chat || {});
      vgGrip(lc, p.x, p.y, p.h, p.rot || 0, p.thumb || null, p.sleeve ? (o.pal || PAL) : null, p.mirror);
    }
    if (o.post) o.post(lc, rr, s2);
  } });
  applyCam(cam);          // charLayer leaves the main canvas in screen space
  return { st, r };
}
// riding his text: sitting on top of the bubble, legs dangling over its front edge
function vgRidePose(t, o = {}) {
  const p = JSON.parse(JSON.stringify(POSES.sit));
  p.legL = { a: 0.55 + 0.08 * Math.sin(t * loopW(2.2)), b: -0.25 };
  p.legR = { a: 0.35 + 0.08 * Math.sin(t * loopW(2.2) + 1.4), b: -0.2 };
  p.armL = { a: 0.55, b: -0.35 };
  p.armR = { a: 0.55, b: -0.35 };
  p.hipY = -34; p.lean = o.lean || 0;
  p.hand = 'open'; p.feetFront = 1;
  return p;
}
// surfing his text: standing on top of the bubble, knees bent, arms out for balance, leaning into the ride
function vgSurfPose(t, o = {}) {
  const p = JSON.parse(JSON.stringify(POSES.stand));
  const w1 = Math.sin(t * loopW(2.3)), w2 = Math.sin(t * loopW(1.7) + 1);
  p.hipY = -198 + 4 * w1;
  p.legL = { a: 0.44, b: -0.34 }; p.legR = { a: 0.44, b: -0.34 };
  p.armL = { a: 1.45 + 0.12 * w2, b: 0.3 }; p.armR = { a: 1.3 - 0.12 * w2, b: -0.25 };
  p.lean = o.lean != null ? o.lean : 0.1 + 0.03 * w1;
  p.hand = 'spread'; p.feetFront = 0;
  return p;
}
// where he stands on a bubble of width w at (x, y) (his feet on its top edge)
function vgDeck(x, y, w) { return { x: x - 0.06 * w, y: y - w * 0.23 + 8 }; }
// where he sits IN a bubble (drawn after him, so its front hides him below the chest): the rig's origin for the sit pose
function vgTub(x, y, w, s) { return { x: x - 0.02 * w, y: y - w * 0.23 + 96 * s }; }
// the clock's reading at video time t: 0 at the send, 1 s at "Moon", 5 h at "Pluto", 24 h at "TOMORROW" (held there while
// the stamp lands), 48 h by the end of the reply (piecewise, eased in log time so the digits always run)
function vgTripSecs(t) {
  const c = cu();
  const keys = [[c.light, 0.0], [c.moon - 0.12, 1], [c.second_end + 0.1, 1], [c.hours, 5 * 3600], [c.hours_end + 0.25, 5 * 3600], [c.bonk, 86400],
    [c.another - 0.25, 86400], [c.day2_end, 2 * 86400]];
  if (t <= keys[0][0]) return 0;
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
    if (t <= t1) {
      const k = E.inOutSine(clamp((t - t0) / Math.max(0.01, t1 - t0)));
      const a = Math.log10(v0 + 1), b = Math.log10(v1 + 1);
      return Math.pow(10, lerp(a, b, k)) - 1;
    }
  }
  return 2 * 86400;
}

// ================================================================ HOOK: your text to Voyager 1 would take a whole DAY to arrive
// CU, eye level, him LEFT, the phone RIGHT and close to the lens (its screen to us): his thumb is on SEND on frame 0.
const VG_HOOK_CAM = { x: 520, y: 1450, zoom: 2.45 };
const VG_HST = { x: 432, y: 1904, s: 1 };            // his head centre lands near (432, 1434): screen (321, 921)
const VG_HPH = { x: 576, y: 1436, h: 222 };          // the phone, big in the frame: screen x 545-812, y 691-1235
// the hook's chat as a function of tt (seconds since the start; negative = the loop's lead-in)
function vgHookChat(tt) {
  const c = cu();
  return {
    typed: tt < -0.07 ? 1 : 0, tap: tt < -0.08 ? clamp(1 - (-0.08 - tt) / 0.22) : 1 - ramp(tt, 0.05, 0.25),
    sent: ramp(tt, -0.06, 0.2), status: tt < 0.3 ? 'none' : 'sending', prog: 0.004 + 0.003 * clamp(tt / 3),
    eta: ramp(tt, c.day - 0.04, c.day + 0.24),
    lift: ramp(tt, c.arrive - 0.05, c.arrive + 0.5, E.inCubic),
  };
}
function vgHookDraw(tt, o = {}) {
  const c = cu();
  const cam = Object.assign({}, VG_HOOK_CAM, { zoom: VG_HOOK_CAM.zoom + 0.06 * E.inOutSine(clamp(tt / 3.2)) });
  // the sky over the railing (eye level), then the porch
  vgSkyBack({ hz: 1180, dx: -cam.x * 0.4, dy: 0 });
  applyCam(cam);
  vgPorch(ctx, tt, { lampX: 196, lampY: 1180, plantX: 905, mugX: 780 });
  // him: looking at the phone; startled on DAY (the ETA lands), a little deflated on "arrive"
  const shock = popK(tt, c.day + 0.02, c.arrive + 0.35, 0.06, 0.25);
  let face = Object.assign({}, FACES.calm, { lookX: 0.8, lookY: 0.15, mouth: 'flat', mouthOpen: 0.25 });
  if (tt < 0.2) face = Object.assign({}, FACES.grin, { lookX: 0.8, lookY: 0.15, mouthOpen: 0.5 });
  if (shock > 0) face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 0.8, lookY: 0.05 }), shock);
  if (o.face) face = o.face;
  const sway = 3 * Math.sin(tt * loopW(1.9));
  const chat = o.chat || vgHookChat(tt);
  const ph = { x: VG_HPH.x, y: VG_HPH.y + sway, h: VG_HPH.h };
  // his thumb: on SEND at the start (the press), then back to rest at the phone's edge so the screen shows
  const back = ramp(tt, 0.2, 0.45, E.inOutCubic);
  const thumb = o.thumb !== undefined ? o.thumb : (back > 0.98 ? null : { u: lerp(0.82, 0.74, back), v: lerp(0.878 - 0.02 * clamp(chat.tap || 0), 0.972, back) });
  vgHero(cam, tt, { x: VG_HST.x, y: VG_HST.y, s: VG_HST.s, face, headRot: -0.03 + 0.05 * shock,
    armR: { e: [588, 1694], w: [ph.x + 4, ph.y + ph.h * 0.55] }, handR: 'fist',
    stubble: o.stubble || 0, phone: { x: ph.x, y: ph.y, h: ph.h, chat, thumb } });
  // the sent bubble leaves the phone: it lifts off the screen, grows and floats up out of the top of the frame
  const lift = chat.lift || 0;
  if (lift > 0.02 && !o.noFly) {
    const u = E.inOutSine(lift);
    const bx = lerp(ph.x + 10, 545, u), by = lerp(ph.y - 40, 1190, u), bw = lerp(110, 190, u);
    vgBubble(ctx, bx, by, bw, { text: 'u ok?', glow: 0.8 * u });
  }
  return cam;
}
SC.hook = (lt, t, shot) => {
  vgHookDraw(t);
  return { glow: 0.85 };
};
SC.loop = (lt, t, shot) => {
  vgHookDraw(t - TLd.duration);
  return { glow: 0.85 };
};

// ================================================================ ANSWER: it's not ignoring you... even LIGHT takes that long
// MEDIUM, LOW angle, him centre: the bubble hovers over the porch, "SENDING..."; he shrugs at his phone; it dips to his
// hands on "even"; on LIGHT it rockets up with him hanging on to it (a light-speed streak), out of the top of the frame.
const VG_ANS_CAM = { x: 560, y: 1395, zoom: 1.28 };
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const go = t - c.light;                                   // seconds since the launch
  const launch = go > 0 ? go * go * 1500 + go * 650 : 0;    // px up (world), accelerating
  // the camera rises after him (a little slower than he does, so he climbs up the frame), the porch drops away
  const follow = go > 0 ? launch * 0.86 - 60 * (1 - Math.exp(-go * 8)) : 0;
  const cam = Object.assign({}, VG_ANS_CAM, { y: VG_ANS_CAM.y - 25 * ramp(lt, 0, D, E.inOutSine) - follow, x: VG_ANS_CAM.x + follow * 0.2 });
  vgSkyBack({ hz: 1390 + follow * 0.55, dx: -cam.x * 0.3, dy: follow * 0.3, glow: 1 });
  applyCam(cam);
  vgPorch(ctx, t, { lampX: 196, lampY: 1180, plantX: 905, mugX: 780 });
  // the bubble: hovering and bobbing, it dips to his hands on "even", then on LIGHT it shoots up (with him)
  const dip = ramp(t, c.even - 0.15, c.light - 0.05, E.inOutCubic);
  const bob = 10 * Math.sin(t * loopW(2.4));
  let bx = lerp(655, 640, dip), by = lerp(1095, 1180, dip) + bob * (1 - dip);
  by -= launch; bx += launch * 0.22;
  if (go > 0) vgTrail(ctx, bx, by + 60, Math.min(2400, launch * 1.1 + 300), Math.PI / 2 + 0.21, 1, 54);
  // him: looking up at it; shrug on "ignoring you"; on tiptoe reaching up on "even"; yanked up on LIGHT
  const shrug = popK(t, c.ignoring - 0.1, c.even - 0.05, 0.12, 0.15);
  const reach = clamp(snapRamp(t, c.even - 0.1, c.light - 0.06, { over: 1.6 }), -0.08, 1.12);   // a wind-up and an overshoot
  const pose = lerpPose(POSES.stand, POSES.flinch, 0.35 * shrug);
  const hy = 1904 - (go > 0 ? launch : 0) - 14 * reach;
  let face = Object.assign({}, FACES.calm, { lookX: 0.45, lookY: -0.9, browY: 0.4 });
  if (shrug > 0) face = lerpFace(face, Object.assign({}, FACES.annoyed, { lookX: 0.2, lookY: 0.6 }), shrug);
  if (go > -0.02) face = Object.assign({}, FACES.shock, { lookX: 0.3, lookY: -1 });
  const st = { x: 560 + launch * 0.22, y: hy, s: 1 };
  const grabW = [bx - 30, by + 50];
  const armUp = reach > 0.02 || go > 0;
  vgHero(cam, t, { x: st.x, y: st.y, s: 1, face, pose: go > 0 ? POSES.zap : pose, frizz: go > 0 ? 0.6 : 0,
    armR: armUp ? { e: [lerp(st.x + 120, st.x + 60, reach), lerp(st.y - 470, st.y - 560, reach)], w: [lerp(st.x + 160, grabW[0] + 18, reach), lerp(st.y - 520, grabW[1], reach)] } : null,
    armL: armUp ? { e: [lerp(st.x - 100, st.x + 10, reach), lerp(st.y - 470, st.y - 570, reach)], w: [lerp(st.x - 60, grabW[0] - 22, reach), lerp(st.y - 520, grabW[1] + 4, reach)] } : null,
    hand: armUp ? 'fist' : 'open',
    phone: !armUp ? { x: st.x + 128, y: st.y - 395, h: 150, rot: 0.25, chat: { typed: 0, sent: 1, status: 'sending', prog: 0.006 } } : null });
  // the bubble itself (in front of his hands)
  applyCam(cam);
  vgBubble(ctx, bx, by, 300, { text: 'u ok?', glow: 0.9, rot: go > 0 ? -0.15 : 0.04 * Math.sin(t * loopW(1.3)) });
  // a "SENDING..." tag under the hovering bubble until the dip
  if (go < 0) {
    const sp = toScreen(cam, bx, by + 120);
    vgTag('SENDING...', sp[0], sp[1] + 10, '#8FA3FF', popK(t, shot.start + 0.15, c.even - 0.1, 0.12, 0.1), 34);
  }
  // speed lines on the launch
  if (go > 0) { const sp = toScreen(cam, 600, 1450); shockLines(sp[0], sp[1], 260, inv(c.light, c.light + 0.5, t), 14, '#BFFFD8', 7); }
  return { glow: 0.9 };
};

// ================================================================ RACE: it zips past the Moon in one second... Pluto in five hours
// WIDE, eye level, him LEFT surfing his text to the right; the stars stream past; the Earth shrinks away behind; the Moon
// whooshes by on "Moon", Pluto glides past on "Pluto" and he waves at it; the trip clock runs.
SC.race = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const scroll = 2600 * lt + 900 * lt * lt;
  vgSpace({ scroll, streak: 0.85, dirX: 1 });
  screenSpace();
  // the Earth behind us, shrinking away at the left
  const eR = lerp(150, 46, E.outCubic(clamp(lt / 1.4)));
  vgEarthBall(ctx, lerp(170, -40, clamp(lt / 2.2)), 1420, eR);
  // the Moon whooshes past behind him on "Moon" (right to left)
  const mk = (t - (c.moon - 0.35)) / 0.75;
  if (mk > -0.2 && mk < 1.3) vgMoon(ctx, lerp(1500, -520, E.inOutSine(clamp(mk))), 820, 330);
  // Pluto glides in from the right on "Pluto"
  const pk = (t - (c.pluto - 0.45)) / 1.5;
  if (pk > -0.2 && pk < 1.4) vgPluto(ctx, lerp(1250, -220, clamp(pk)), 800 + 30 * Math.sin(pk * 3), 120);
  // him surfing the bubble, bobbing; he waves at Pluto
  const bob = 14 * Math.sin(t * loopW(1.7)), bw = 410, bx = 480, by = 1120 + bob;
  const cam = { x: 540, y: 960, zoom: 1 };
  applyCam(cam);
  vgTrail(ctx, bx - bw * 0.45, by, 900, Math.PI, 1, 76);
  vgBubble(ctx, bx, by, bw, { text: 'u ok?', glow: 1, rot: 0.03 * Math.sin(t * loopW(1.7)), textDX: 0.12 });
  const deck = { x: bx - 0.24 * bw, y: by - bw * 0.23 + 8 };
  const wave = popK(t, c.pluto - 0.1, c.hours_end + 0.2, 0.15, 0.2);
  const wob = Math.sin(t * 14) * wave;
  let face = Object.assign({}, FACES.grin, { lookX: 0.6, lookY: -0.1 });
  if (t > c.moon - 0.3 && t < c.moon + 0.6) face = Object.assign({}, FACES.startled, { lookX: 0.7, lookY: -0.6 });
  if (wave > 0.3) face = Object.assign({}, FACES.grin, { lookX: 0.9, lookY: -0.3 });
  const s = 0.8;
  vgHero(cam, t, { x: deck.x, y: deck.y, s, pose: vgSurfPose(t), face, frizz: 0.8,
    armR: wave > 0.02 ? { e: [deck.x + 110 * s, deck.y - 330 * s], w: [deck.x + 150 * s + 22 * wob, deck.y - 470 * s] } : null });
  vgClock(540, 520, vgTripSecs(t), ramp(lt, 0.0, 0.25), { col: '#7DFFB0' });
  return { glow: 1 };
};

// ================================================================ TOMORROW: and Voyager? TOMORROW.
// MEDIUM, HIGH angle (we look down on him): he has dozed off in his text; the clock spins up to 24:00:00; Voyager 1
// slides in below; on TOMORROW the bubble BONKS into its dish: DELIVERED.
SC.tomorrow = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  vgSpace({ scroll: 400 * lt, vy: -160 * lt, streak: 0.3 * (1 - ramp(t, c.tomorrow - 0.3, c.tomorrow)), dirX: 1 });
  screenSpace();
  vgFarSun(ctx, 170, 560, 0.6, 0.9);
  const cam = { x: 540, y: 960, zoom: 1 };
  applyCam(cam);
  // the approach: the bubble glides down-right toward the dish and stops dead on it
  const hitT = c.bonk, since = t - hitT;
  const ap = clamp((t - shot.start) / Math.max(0.2, hitT - shot.start));
  const bx = lerp(360, 560, E.inQuad(ap)), by = lerp(900, 1060, E.inQuad(ap));
  // Voyager: its dish facing up-left (toward home), sliding in from the lower right
  const vx = lerp(930, 820, E.outCubic(ap)), vy = lerp(1560, 1400, E.outCubic(ap));
  vgVoyager(ctx, vx, vy, 0.82, t, { face: -1, rot: -0.55, bonk: since > 0 ? 1 : 0, bonkT: Math.max(0, since) });
  const sq = since > 0 ? Math.exp(-since * 9) : 0;
  vgTrail(ctx, bx - 170, by - 60, 700, Math.PI + 0.45, 1 - ramp(t, hitT - 0.1, hitT + 0.2), 62);
  // him in the bubble (drawn first: the bubble's front hides him below the chest), asleep, then jolted awake
  const s = 0.95, seat = vgTub(bx, by, 360, s);
  const awake = since > 0;
  const face = awake ? Object.assign({}, FACES.shock, { lookX: 0.4, lookY: 0.4 }) : Object.assign({}, FACES.sleepy, { mouth: 'o', mouthOpen: 0.35 });
  const jk = clamp(snapRamp(t, hitT, hitT + 0.16, { pre: 0.0, over: 2.2 }), 0, 1.2);
  const p = awake ? lerpPose(POSES.sit, POSES.jolt, 0.75 * jk) : JSON.parse(JSON.stringify(POSES.sit));
  if (!awake) { p.armL = { a: 0.25, b: 0.1 }; p.armR = { a: 0.3, b: 0.1 }; }
  vgHero(cam, t, { x: seat.x, y: seat.y, s, pose: p, face, frizz: awake ? 1 : 0.3, headDX: awake ? 6 * Math.sin(since * 50) * Math.exp(-since * 5) : 0,
    headRot: awake ? 0 : 0.3, lean: awake ? 0 : 0.12, noLegs: true });
  applyCam(cam);
  vgBubble(ctx, bx, by, 360, { text: 'u ok?', glow: 1, squash: sq, rot: 0.16 });
  if (!awake) zzz(toScreen(cam, seat.x + 60, 0)[0], toScreen(cam, 0, seat.y - 330)[1], t, shot.start, 1, 0.9);
  // the clock spins up to a whole day
  vgClock(540, 520, vgTripSecs(t), ramp(lt, 0, 0.2), { col: '#FFD447' });
  // BONK: a burst behind the hit, then the stamp
  if (since > 0) {
    const sp = toScreen(cam, bx + 130, by + 90);
    shockLines(sp[0], sp[1], 230, inv(hitT, hitT + 0.4, t), 12, '#FFFFFF', 9);
    stamp('DELIVERED', 540, 1520, ramp(t, hitT + 0.08, hitT + 0.26), '#4DFFB4', -0.12, 100);
  }
  return { glow: 1 };
};

// ================================================================ REPLY: and its reply? Another whole day.
// MEDIUM, him RIGHT: Voyager's grey reply (the typing dots) pops out of the dish; he rides it back toward the blue dot at
// the left, arms folded; the clock runs to 48:00:00 and stubble grows on his chin.
SC.reply = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const scroll = 1800 * lt + 600 * lt * lt;
  vgSpace({ scroll, streak: 0.75 * ramp(lt, 0.3, 0.8), dirX: -1 });
  screenSpace();
  // home ahead: the Earth growing at the left
  vgEarthBall(ctx, 160, 1000, lerp(26, 90, E.inCubic(clamp(lt / D))));
  const cam = { x: 540, y: 960, zoom: 1 };
  applyCam(cam);
  // Voyager behind him at the right, getting smaller
  const vk = clamp(lt / 1.0);
  vgVoyager(ctx, lerp(940, 1260, E.inCubic(vk)), lerp(760, 700, vk), lerp(0.62, 0.3, vk), t, { face: -1, rot: 0.2 });
  // the reply bubble pops out and carries him off to the left
  const pop = ramp(t, shot.start - 0.05, shot.start + 0.25, E.outBack);
  const bob = 12 * Math.sin(t * loopW(1.6)), bw = 380;
  const bx = lerp(700, 640, clamp(lt / D)), by = 1150 + bob;
  vgTrail(ctx, bx + bw * 0.45, by, 800, 0, ramp(lt, 0.2, 0.6), 64, '#CFE0FF');
  const grow = ramp(t, c.another - 0.1, c.day2_end + 0.2);
  const s = 1.12, seat = { x: bx - 0.02 * bw, y: by - bw * 0.23 + 58 * s };
  const face = Object.assign({}, FACES.annoyed, { lookX: -0.6, lookY: 0.1, blink: 0.45 + 0.2 * grow });
  vgHero(cam, t, { x: seat.x, y: seat.y, s, pose: POSES.sit, face, stubble: 0.15 + 0.85 * grow, headRot: -0.05, noLegs: true,
    armL: { e: [seat.x - 84 * s, seat.y - 96 * s], w: [seat.x + 50 * s, seat.y - 126 * s] },
    armR: { e: [seat.x + 84 * s, seat.y - 96 * s], w: [seat.x - 50 * s, seat.y - 120 * s] }, hand: 'fist' });
  applyCam(cam);
  vgBubble(ctx, bx, by, bw * pop, { text: '•••', col: 'grey', tail: 'l', glow: 0.8 });
  vgClock(540, 520, vgTripSecs(t), ramp(lt, 0, 0.2), { col: '#C8A8FF' });
  return { glow: 0.9 };
};

// ================================================================ BEEP: Beep.
// CU, him RIGHT, the phone LEFT and close to the lens (the hook's mirror): two days later, stubble, the tea has grown a
// skin; the reply lands on the phone: "beep."
const VG_BEEP_CAM = { x: 600, y: 1440, zoom: 2.3 };
SC.beep = (lt, t, shot) => {
  const c = cu();
  const cam = Object.assign({}, VG_BEEP_CAM, { zoom: VG_BEEP_CAM.zoom + 0.04 * lt });
  vgSkyBack({ hz: 1170, dx: -cam.x * 0.4 - 200 });
  applyCam(cam);
  vgPorch(ctx, t, { lampX: 196, lampY: 1180, plantX: 360, mugX: 760, mugOld: 1, plant: false });
  const rk = ramp(t, c.ping, c.ping + 0.22);
  const face = Object.assign({}, FACES.annoyed, { lookX: -0.8, lookY: 0.25, blink: 0.5, mouth: 'flat', mouthOpen: 0 });
  const ph = { x: 505, y: 1424, h: 250 };
  vgHero(cam, t, { x: 662, y: 1904, s: 1, face, stubble: 1, headRot: 0.02, hideArm: 'L',
    phone: { x: ph.x, y: ph.y, h: ph.h, chat: { typed: 0, sent: 1, status: 'delivered', reply: rk }, thumb: null, sleeve: true, mirror: true } });
  return { glow: 0.85 };
};

// ================================================================ WEIRD: forty-nine years to get this far... and the nearest star
// is fifteen hundred times farther. EXTREME WIDE, a zoom out: Voyager (him on it) at the top of one light-day of ruler,
// the Sun at its foot, the trail it flew since 1977; then the ruler runs on 1,550 light-days to the nearest star.
function vgWeirdState(t) {
  const c = cu();
  // pixels per light-day and the Sun's screen y: close on Voyager, back to show the whole light-day, then out to the star
  const k1 = ramp(t, c.forty - 0.2, c.far_end + 0.1, E.inOutCubic);
  const k2 = ramp(t, c.nearest - 0.05, c.farther_end + 0.2, E.inOutSine);
  const lp = lerp(Math.log(1700), Math.log(880), k1);
  const ppl = Math.exp(lerp(lp, Math.log(0.70), k2));
  const y0 = lerp(lerp(2600, 1590, k1), 1650, k2);
  return { ppl, y0, k1, k2 };
}
SC.weird = (lt, t, shot) => {
  const c = cu();
  const S = vgWeirdState(t);
  vgSpace({ scroll: 30 * lt, vy: 10 * lt, streak: 0 });
  screenSpace();
  const x0 = 540, ppl = S.ppl, y0 = S.y0, vyS = y0 - ppl;
  // the ruler: one light-day a segment, drawn while a segment is at least 3 px; a glowing bar under that
  const yTop = y0 - 1550 * ppl;
  const tick = ramp(t, c.nearest - 0.1, c.nearest + 0.3);
  if (ppl >= 3) {
    for (let i = 0; i < 1550; i++) {
      const ya = y0 - i * ppl, yb = y0 - (i + 1) * ppl;
      if (yb > H + 50) continue;
      if (ya < -50) break;
      ctx.fillStyle = i === 0 ? '#FFD447' : rgba(i % 2 ? '#7DFFB0' : '#2E8F5C', 0.9 * tick);
      ctx.fillRect(x0 - 8, yb, 16, ya - yb);
    }
  } else {
    const g = ctx.createLinearGradient(0, y0, 0, Math.max(-50, yTop));
    g.addColorStop(0, '#7DFFB0'); g.addColorStop(1, '#5FD6FF');
    ctx.fillStyle = g; ctx.fillRect(x0 - 6, Math.max(-50, yTop), 12, y0 - Math.max(-50, yTop));
    ctx.fillStyle = '#FFD447'; ctx.fillRect(x0 - 8, y0 - Math.max(2, ppl), 16, Math.max(2, ppl));
  }
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.fillStyle = rgba('#5CFFA0', 0.25 * tick);
  gctx.fillRect(x0 - 18, Math.max(-50, yTop), 36, y0 - Math.max(-50, yTop)); gctx.restore();
  // the Sun (and the Earth by it) at the foot
  vgFarSun(ctx, x0, y0, 1.0, 1);
  if (ppl > 30) circle(ctx, x0 + 26, y0 + 8, 6, '#5FB0FF');
  // the trail Voyager flew since 1977: a dashed gold curve beside the first light-day, and the year counter
  const tr = ramp(t, c.forty - 0.1, c.far_end, E.inOutSine);
  if (ppl > 25) {
    ctx.save(); ctx.setLineDash([18, 14]); ctx.lineWidth = Math.max(3, Math.min(8, ppl / 110)); ctx.strokeStyle = rgba('#FFD447', 0.95);
    ctx.beginPath();
    const N = 40;
    for (let i = 0; i <= N * tr; i++) {
      const u = i / N, px = x0 + 60 + Math.sin(u * Math.PI) * 0.12 * ppl, py = y0 - u * ppl;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.restore();
  }
  // Voyager at one light-day, him sitting on its dish, waving
  if (ppl > 60 && vyS > -400) {
    const vs = Math.min(1.2, ppl / 1700 * 1.1);
    // draw in a camera whose world point (540, 960) lands on Voyager's place on the ruler
    const cm = { x: 540, y: 960, zoom: vs, sx: 0, sy: vyS - 960 };
    applyCam(cm);
    vgVoyager(ctx, 560, 1040, 0.7, t, { face: -1, rot: -0.15 });
    const seat = { x: 520, y: 900 };
    const waveK = popK(t, c.forty, c.far_end + 0.4, 0.2, 0.2);
    vgHero(cm, t, { x: seat.x, y: seat.y, s: 0.8, pose: vgRidePose(t), face: Object.assign({}, FACES.grin, { lookX: -0.2, lookY: 0.6 }),
      armR: waveK > 0.02 ? { e: [seat.x + 100, seat.y - 280], w: [seat.x + 140 + 18 * Math.sin(t * 13), seat.y - 400] } : null, handR: waveK > 0.02 ? 'spread' : 'open' });
  }
  screenSpace();
  // labels: the first light-day, the 49 years, then the star and the count
  const yr = Math.round(lerp(1977, 2026, tr));
  if (ppl > 120) {
    vgTag('1 LIGHT-DAY', x0 - 230, Math.min(1110, y0 - ppl * 0.5), '#FFD447', popK(t, c.forty - 0.05, c.nearest + 0.1, 0.18, 0.15), 38);
    vgTag(tr < 0.98 ? `${yr}` : '49 YEARS', 735, 1120, '#FFFFFF', popK(t, c.forty, c.nearest + 0.1, 0.15, 0.15), 44);
  }
  // the nearest star: a red dwarf glowing at the top end of the ruler
  const starK = ramp(t, c.fifteen - 0.25, c.fifteen + 0.3);
  if (yTop > -600) {
    const sy = Math.max(yTop, 470);
    softDot(gctx, x0, sy, 160, '#FF7A4A', 0.95 * starK);
    softDot(ctx, x0, sy, 46, '#FFB088', starK);
    circle(ctx, x0, sy, 22 * starK, '#FFE2CC');
    vgTag('NEAREST STAR', x0, sy + 120, '#FF9A6A', popK(t, c.fifteen, shot.end + 1, 0.2, 0.1), 40);
  }
  // the count: how many light-days the ruler shows, up to ×1,500
  const shown = Math.min(1550, Math.max(1, (y0 + 60) / Math.max(0.01, ppl)));
  const cnt = shown >= 1500 ? '×1,500' : '×' + Math.max(1, Math.round(shown)).toLocaleString('en-US');
  const ck = popK(t, c.nearest + 0.05, shot.end + 1, 0.2, 0.1);
  if (ck > 0.01) {
    bigWord(cnt, 540, 820, 190, '#7DFFB0', E.outBack(ck));
  }
  vgTag('ABOUT 75,000 YEARS AT ITS SPEED', 540, 1060, '#C8A8FF', popK(t, c.farther + 0.05, shot.end + 1, 0.2, 0.1), 30);
  return { glow: 0.95 };
};

// ================================================================ BUTTON: better hit send now.
// CU, eye level, him LEFT, the phone RIGHT (the hook's picture): he types "u ok?" again, fast; the loop shot puts his thumb
// back on SEND, which is frame 0.
SC.button = (lt, t, shot) => {
  const c = cu();
  const typed = ramp(t, c.better - 0.1, c.send + 0.1);
  // the same clock as the loop shot (t minus the length): the button runs straight into the loop and on into frame 0
  vgHookDraw(t - TLd.duration, { chat: { typed, sent: 0, status: 'none', tap: 0 },
    face: Object.assign({}, FACES.nervous, { lookX: 0.75, lookY: 0.25, mouth: 'grimace', mouthOpen: 0.6 }),
    thumb: { u: lerp(0.3, 0.82, ramp(t, c.send, c.now)), v: 0.878 + 0.014 * Math.sin(t * 38) * (1 - ramp(t, c.send, c.now)) } });
  return { glow: 0.85 };
};

// ================================================================ the cover (cover.sh): his thumb on SEND, the ETA pill up
SC.cover = (lt, t, shot) => {
  const c = cu();
  vgHookDraw(c.day + 0.4, { noFly: true });
  bigWord('24 HOURS', 540, 1400, 150, '#FFD447', 1, -0.04);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  vgWorldInit();
}
