// Why Can't You Move Just ONE Eye? 👀 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const oeShot = (id) => TLd.shots.find((s) => s.id === id);
const oeClone = (p) => JSON.parse(JSON.stringify(p));
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light (reference/visual.md "The light")
// a hot clear day in the meadow: the sun high on the left is the key, the blue sky the rim from the right
const DAY_LIGHT = { ...flipLight(LIGHTS.day), rimAmt: 0.95, pool: 0.32, dof: 0.6, halo: 0.08 };
setLights({ hook: DAY_LIGHT, answer: DAY_LIGHT, tug: DAY_LIGHT, close: DAY_LIGHT, feel: DAY_LIGHT, weird: DAY_LIGHT,
  fly: DAY_LIGHT, button: DAY_LIGHT, loop: DAY_LIGHT, cover: DAY_LIGHT });

// ---------------------------------------------------------------- his faces
const OF = {
  strain: (bw) => ({ eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: 0.15 + bw, browTilt: 0.55, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 }),
  flat: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.4, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 },
  up: { eyeOpen: 1.1, pupil: 0.9, lookX: 0, lookY: 0, browY: 1.1, browTilt: 0.5, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.2, pupil: 0.8, lookX: 0, lookY: 0, browY: 1.35, browTilt: 0.3, mouth: 'o', mouthOpen: 0.75, blink: 0, cross: 0 },
  focus: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.35, browTilt: 0.7, mouth: 'flat', mouthOpen: 0.15, blink: 0, cross: 0 },
  wince: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0, browY: 0.6, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.4, blink: 0, cross: 0 },
};
const browWig = (tt, amt) => amt * (0.55 * Math.sin(tt * 2 * Math.PI * 5.2) + 0.2 * Math.sin(tt * 2 * Math.PI * 9.1 + 1));

// the eyes hop together between two looks (-amp, +amp, -amp...): {lx, smear} at time tt; hops = the jump times
function oeHops(tt, hops, from = -0.9, amp = 0.9, dur = 0.08) {
  let pos = from, smear = null;
  for (let i = 0; i < hops.length; i++) {
    const h = hops[i], to = (i % 2 === 0 ? -Math.sign(from) : Math.sign(from)) * amp;
    if (tt < h) break;
    if (tt < h + dur) { const u = (tt - h) / dur; smear = { x0: pos, x1: to, k: 1 - 0.4 * u, at: u }; pos = lerp(pos, to, E.inOutSine(u)); break; }
    pos = to;
  }
  return { lx: pos, smear };
}

// ---------------------------------------------------------------- frame 1 and round it (tt = seconds since frame 1;
// negative = the Short's last frames, the button and the loop, so the last frame IS frame 1's picture)
const OE_NEG_HOPS = [-1.25, -0.55];                     // the button's two hops: -0.9 -> +0.9 -> -0.9 at frame 1
function butterflyAt(tt, i) {
  const out = tt < 0 ? Math.max(0, -tt - 0.35) : 0;      // in the button they flutter in from the sides
  const apart = tt > 0 ? 9 * tt : 0;                     // in the hook they drift apart
  const sd = i ? 1 : -1;
  const x = 540 + sd * (86 + apart + 70 * out) + 5 * Math.sin(tt * 3.1 + i * 2);
  const y = 968 - (i ? 14 : 0) + 10 * Math.sin(tt * 4.3 + i * 1.3) - 6 * apart * 0.2;
  return [x, y];
}
function hookA(tt) {
  const c = cu();
  const hops = tt >= 0 ? c.hops : OE_NEG_HOPS;
  const h = oeHops(tt, hops, -0.9);
  const goK = tt >= 0 ? ramp(tt, c.go1 - 0.05, c.go1 + 0.08) : 0;            // "Go!": a last hard try
  const effort = tt >= 0 ? 1 - 0.3 * ramp(tt, c.go1_end + 0.1, c.go1_end + 0.3) : ramp(tt, -1.9, -1.5);
  const face = lerpFace(OF.flat, OF.strain(browWig(tt, 0.6)), Math.max(0.35, effort));
  const eyes = { lx: h.lx * (1 + 0.15 * goK), smear: h.smear, ly: -0.05, squint: 0.3 * effort + 0.15 * goK, iris: ES_IRIS.hero };
  const tremble = effort * 0.012 * Math.sin(tt * 47);
  return { face, eyes, effort, headRot: tremble + 0.03 * Math.sin(tt * 1.7), headDX: 1.2 * effort * Math.sin(tt * 39), headDY: 1.5 * Math.sin(tt * 2.1),
    sweat: tt >= 0 ? ramp(tt, c.only, c.go1) : 0 };
}
function hookCam(tt) {
  return camKeys(tt, [[-2.6, 540, 1014, 3.9], [-0.45, 540, 1022, 4.4], [0, 540, 1022, 4.4], [3.8, 540, 1024, 4.7]]);
}
function hookDraw(tt, t) {
  OE_BGDY = 0;
  const cam = hookCam(tt), A = hookA(tt);
  oeBack(cam, t);
  applyCam(cam);
  const b0 = butterflyAt(tt, 0), b1 = butterflyAt(tt, 1);
  const r = oeHero(cam, t, { face: A.face, eyes: A.eyes, headRot: A.headRot, headDX: A.headDX, headDY: A.headDY, sweat: A.sweat });
  applyCam(cam);
  oeButterfly(ctx, b0[0], b0[1], 0.82, t, { col: ['#FF8A1E', '#3A1A0A', '#FFFFFF'], rot: -0.25 + 0.1 * Math.sin(tt * 3), ph: 0 });
  oeButterfly(ctx, b1[0], b1[1], 0.78, t, { col: ['#3FA9FF', '#14306A', '#FFFFFF'], rot: 0.25 + 0.1 * Math.sin(tt * 2.6), ph: 1.3 });
  // effort marks by his temples while he strains
  screenSpace();
  const ek = A.effort * (0.6 + 0.4 * Math.sin(tt * 18));
  if (ek > 0.05) for (const sd of [-1, 1]) {
    const q = toScreen(cam, ...r.rp(oeHeadLocal(r.st, sd * 74, -34)));
    for (let i = 0; i < 3; i++) line(ctx, q[0] + sd * (8 + i * 4), q[1] - 30 + i * 30, q[0] + sd * (34 + i * 6), q[1] - 40 + i * 34, 7, rgba('#FFFFFF', 0.75 * ek));
  }
  return { cam, A, r };
}

SC.hook = (lt, t, shot) => { hookDraw(t, t); return { glow: 0.8 }; };
SC.button = (lt, t, shot) => { hookDraw(t - TLd.duration, t); return { glow: 0.8 }; };
SC.loop = (lt, t, shot) => { hookDraw(t - TLd.duration, t); return { glow: 0.8 }; };

// ---------------------------------------------------------------- the answer: the brain and the leash
function leashLook(t, c) {
  // where both eyes look in the answer: middle after "Can't?", up at the brain on "Your eyes", at us on "leash"
  const up = ramp(t, c.your_e - 0.05, c.your_e + 0.15) * (1 - ramp(t, c.leash - 0.1, c.leash + 0.05));
  return { lx: 0.05, ly: lerp(-0.05, -0.95, up) };
}
SC.answer = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = -300;                                                                // low: the horizon drops, sky behind him
  const cam = camKeys(t, [[shot.start, 548, 978, 3.0], [shot.end, 552, 970, 3.18]]);
  oeBack(cam, t);
  applyCam(cam);
  const nope = t > c.cant && t < c.cant + 0.5 ? 0.08 * Math.sin((t - c.cant) / 0.5 * Math.PI * 3) * (1 - (t - c.cant) / 0.5) : 0;
  const lk = leashLook(t, c);
  const bk = ramp(t, c.your_e - 0.12, c.your_e + 0.18);
  const lk2 = ramp(t, c.on - 0.05, c.leash_end - 0.05);
  // after the clips land: a little test tug, both eyes jerk (no held face)
  const test = bumpAt(t, c.leash_end + 0.12, 7) * Math.sin((t - c.leash_end - 0.12) * 18) * (t > c.leash_end + 0.12 ? 1 : 0);
  const wide = ramp(t, c.leash - 0.05, c.leash + 0.1);
  let face = lerpFace(OF.wince, OF.up, ramp(t, c.your_e - 0.05, c.your_e + 0.15));
  face = lerpFace(face, OF.wow, wide);
  oeHero(cam, t, { face, headRot: nope, headDY: -2 * wide,
    eyes: { lx: lk.lx + 0.6 * test, ly: lk.ly, iris: ES_IRIS.hero, open: 1 + 0.15 * wide },
    brain: { k: bk, mood: wide > 0.5 ? 'grin' : 'calm', look: [0, 0.7], dx: 6 * test, leash: { k: lk2, taut: 0.2 + 0.6 * Math.abs(test) } } });
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- the tug: one tug, both eyes go
function tugDX(t, c) {
  // the brain's fists: left on "left.", right on "right.", a big yank left on "tug...", a whoosh right on "BOTH"
  const [g0, g1, g2, g3] = c.tugs;
  const to = (t < g0 ? 0 : t < g1 ? -14 : t < g2 ? 14 : t < g3 ? -22 : 22);
  const from = (t < g0 ? 0 : t < g1 ? 0 : t < g2 ? -14 : t < g3 ? 14 : -22);
  const g = t < g0 ? g0 : t < g1 ? g0 : t < g2 ? g1 : t < g3 ? g2 : g3;
  const u = clamp((t - g) / 0.12);
  return lerp(from, to, E.outBack(u, 1.6));
}
SC.tug = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = 0;
  const cam = camKeys(t, [[shot.start, 540, 986, 4.6], [shot.end, 540, 992, 4.95]]);
  oeBack(cam, t);
  applyCam(cam);
  const dx = tugDX(t, c), dxl = tugDX(t - 0.04, c);                              // the eyes follow a hair later
  const lx = clamp(dxl / 15, -1.05, 1.05);
  const moving = Math.abs(dx - dxl) > 1.2;
  const yank = ramp(t, c.tug - 0.05, c.tug + 0.1) * (1 - ramp(t, c.go2_end, c.go2_end + 0.3));
  const face = lerpFace(OF.up, OF.wow, yank);
  oeHero(cam, t, { face, headRot: 0.01 * dx * 0.2, headDX: dx * 0.12,
    eyes: { lx, ly: 0.05, smear: moving ? { x0: clamp(tugDX(t - 0.12, c) / 15, -1.05, 1.05), x1: lx, k: 0.8, at: 1 } : null, iris: ES_IRIS.hero, open: 1 + 0.1 * yank },
    brain: { k: 1, mood: Math.abs(dx) > 18 ? 'squint' : 'think', look: [dx / 22, 0.8], dx, lean: dx * 0.01, leash: { k: 1, taut: 0.85 } } });
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- close one eye, fingertip on the lid
SC.close = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = 240;                                                                 // high: more meadow behind him
  const cam = camKeys(t, [[shot.start, 500, 1046, 2.95], [shot.end, 505, 1038, 3.2]]);
  oeBack(cam, t);
  applyCam(cam);
  const shut = ramp(t, c.close + 0.05, c.eye_c_end);
  const fk = ramp(t, c.fingertip - 0.15, c.lid + 0.05, E.inOutCubic);
  const pose = oeFingerPose(oeClone(POSES.stand), fk);
  const face = Object.assign({}, lerpFace(OF.focus, OF.wince, 0.35 * shut), { shutR: shut, browR: -0.4 * shut });
  oeHero(cam, t, { face, pose, finger: fk, headRot: -0.02 * shut,
    eyes: { lx: 0, ly: -0.05, shutR: shut, iris: ES_IRIS.hero },
    brain: { k: 1, mood: 'think', look: [-0.6, 0.8], leash: { k: 1, taut: 0.3 } } });
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- feel it: the shut eye still moves (macro)
function lookAround(t, c) {
  // the open eye looks around: left, right, up-left, right: the shut one goes with it
  return camKeys(t, [[c.look_a - 0.05, 0, 0, 1], [c.around - 0.02, -1, -0.1, 1], [c.around + 0.3, 1, 0.05, 1], [c.feel - 0.05, 1, 0.05, 1],
    [c.that, -0.9, -0.4, 1], [c.still - 0.1, -0.9, -0.4, 1], [c.walking, 0.9, 0.1, 1], [c.walking_end, -0.9, 0.1, 1], [c.blind, 0.8, 0, 1],
    [c.blind_end, -0.7, 0, 1], [oeShot('feel').end, 0.2, 0, 1]], E.inOutSine);
}
SC.feel = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = 0;
  const cam = camKeys(t, [[shot.start, 532, 1020, 7.1], [shot.end, 530, 1018, 7.5]]);
  oeBack(cam, t);
  applyCam(cam);
  const L = lookAround(t, c);
  const ghost = ramp(t, c.around - 0.1, c.around + 0.25);
  const mask = ramp(t, c.blind - 0.04, c.blind + 0.16);
  const pose = oeFingerPose(oeClone(POSES.stand), 1, -3 * L.x);                // the fingertip rides the bulge
  const face = Object.assign({}, lerpFace(OF.focus, OF.wow, ramp(t, c.that - 0.1, c.that + 0.1) * (1 - ramp(t, c.still, c.still + 0.3))),
    { shutR: 1, browR: -0.4 });
  const r = oeHero(cam, t, { face, pose, finger: 1,
    eyes: { lx: L.x, ly: L.y, shutR: 1, ghost, mask, iris: ES_IRIS.hero },
    brain: { k: 1, mood: 'grin', look: [L.x * 0.5, 0.8], dx: 5 * L.x, leash: { k: 1, taut: 0.7 } } });
  // what the fingertip feels: a little ring each time the bulge rolls under it
  screenSpace();
  const tip = toScreen(cam, ...r.rp(OE_FINGER_TIP));
  const feels = [c.around - 0.02, c.around + 0.3, c.that, c.walking, c.walking_end, c.blind];
  for (const f of feels) {
    const u = (t - f) / 0.45;
    if (u > 0 && u < 1) { ctx.beginPath(); ctx.arc(tip[0], tip[1], 30 + 90 * u, 0, 7); ctx.lineWidth = 8 * (1 - u); ctx.strokeStyle = rgba('#FFF6C8', 0.8 * (1 - u)); ctx.stroke(); }
  }
  return { glow: 0.9 };
};

// ---------------------------------------------------------------- the chameleon: two leashes
const OE_CH = { x: 738, y: 990, s: 1.35 };
function chamEyes(t, c) {
  // roaming on their own (two clocks), then forward on "forward", back on "back"
  const fA = Math.PI + 0.9 * Math.sin(t * 2.3) + 0.4 * Math.sin(t * 5.1), bA = -0.6 + 1.1 * Math.sin(t * 1.7 + 2) + 0.3 * Math.sin(t * 4.3);
  const kf = ramp(t, c.forward - 0.1, c.forward + 0.15), kb = ramp(t, c.back - 0.1, c.back + 0.15);
  return [lerp(fA, Math.PI + 0.12, kf), lerp(bA, -0.55, kb)];
}
SC.weird = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = -260;                                                                // low: the two of them against the sky
  const cam = camKeys(t, [[shot.start, 640, 998, 2.5], [c.one_f - 0.3, 646, 996, 2.62], [c.one_f + 0.25, 668, 988, 2.9], [shot.end, 672, 986, 2.98]]);
  oeBack(cam, t, { sunAt: [110, 330] });                                         // the sun away from his brain
  applyCam(cam);
  oeBranch(ctx, 1040, 1040, 660, 1026, t);
  // him, trying to copy: his eyes hop together, the brain yanking
  const tryK = ramp(t, c.one_f - 0.2, c.one_f + 0.1);
  const hops = [c.one_f, c.forward + 0.25, c.one_b, c.back + 0.2, c.back_end + 0.35, c.back_end + 0.75];
  const h = oeHops(t, hops, -0.9);
  const lx = lerp(-0.85, h.lx, tryK);
  const face = lerpFace(OF.up, OF.strain(browWig(t, 0.5)), tryK);
  oeHero(cam, t, { face, eyes: { lx, smear: tryK > 0.5 ? h.smear : null, ly: -0.05, squint: 0.25 * tryK, iris: ES_IRIS.hero },
    brain: { k: 1, mood: tryK > 0.5 ? 'squint' : 'think', look: [0.8, 0.4], dx: 14 * lx, leash: { k: 1, taut: 0.8 } } });
  applyCam(cam);
  const [eF, eB] = chamEyes(t, c);
  const ch = oeCham(ctx, OE_CH.x, OE_CH.y, OE_CH.s, t, { eyeF: eF, eyeB: eB, brain: ramp(t, c.two - 0.12, c.leashes), tug: [Math.cos(eF), Math.cos(eB)] });
  // where each eye looks: a dotted sight line pops out of it, forward on "forward", back on "back"
  screenSpace();
  for (const [i, a, k] of [[0, eF, ramp(t, c.forward - 0.12, c.forward + 0.12)], [1, eB, ramp(t, c.back - 0.12, c.back + 0.12)]]) {
    if (k <= 0.01) continue;
    const e = toScreen(cam, ...ch.eyes[i]), L = 205 * E.outCubic(k), r0 = 46;
    const x0 = e[0] + Math.cos(a) * r0, y0 = e[1] + Math.sin(a) * r0, x1 = e[0] + Math.cos(a) * (r0 + L), y1 = e[1] + Math.sin(a) * (r0 + L);
    for (const [w, col] of [[13, rgba('#0B0B1A', 0.55)], [7, '#FFD447']]) {
      ctx.save(); ctx.setLineDash([16, 13]); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
    }
    const hx = Math.cos(a), hy = Math.sin(a);
    ctx.beginPath(); ctx.moveTo(x1 + hx * 30, y1 + hy * 30); ctx.lineTo(x1 - hy * 20, y1 + hx * 20); ctx.lineTo(x1 + hy * 20, y1 - hx * 20); ctx.closePath();
    ctx.lineWidth = 6; ctx.strokeStyle = rgba('#0B0B1A', 0.55); ctx.stroke(); ctx.fillStyle = '#FFD447'; ctx.fill();
    softDot(gctx, x1, y1, 40, '#FFD447', 0.35 * k);
  }
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- until it spots a fly
function flyAt(t, c, nose) {
  // in from the upper right, a loop, then down onto his nose
  if (t < c.fly_land) {
    const u = clamp((t - c.fly_in) / (c.fly_land - c.fly_in));
    const a = [760, 850], b = nose;
    const x = lerp(a[0], b[0], E.inOutSine(u)) + 40 * Math.sin(u * 9) * (1 - u), y = lerp(a[1], b[1] - 6, E.inOutSine(u)) + 30 * Math.sin(u * 13 + 1) * (1 - u);
    return { p: [x, y], landed: false };
  }
  return { p: [nose[0] + 1.5 * Math.sin(t * 20) * 0.3, nose[1] - 6], landed: true };
}
SC.fly = (lt, t, shot) => {
  const c = cu();
  OE_BGDY = -120;
  const cam = camKeys(t, [[shot.start, 592, 1026, 3.3], [shot.end, 590, 1030, 3.5]]);
  oeBack(cam, t);
  applyCam(cam);
  oeBranch(ctx, 1040, 1040, 660, 1026, t);
  const cross = ramp(t, c.fly_land - 0.08, c.fly_land + 0.2) * (1 - ramp(t, c.snap + 0.2, c.gulp + 0.05));
  const blink = popK(t, c.snap + 0.02, c.snap + 0.16, 0.03, 0.05);
  const face = Object.assign({}, lerpFace(OF.up, OF.wow, ramp(t, c.snap, c.snap + 0.06) * (1 - ramp(t, c.gulp, c.gulp + 0.3))), { blink: blink > 0.5 ? 1 : 0 });
  // before it lands his eyes follow the fly in (both, together); then they cross on his nose
  const nose0 = [540, 1046];
  const f = flyAt(t, c, nose0);
  const follow = clamp((f.p[0] - 540) / 60, -1, 1);
  const lx = lerp(follow, 0, cross), ly = lerp(clamp((f.p[1] - 1028) / 40, -1, 1), 0.55, cross);
  const r = oeHero(cam, t, { face, eyes: { lx, ly, cross, iris: ES_IRIS.hero, open: 1 + 0.15 * cross },
    brain: { k: 1, mood: cross > 0.5 ? 'worried' : 'think', look: [-0.2, 0.9], leash: { k: 1, taut: 0.5 + 0.4 * cross } } });
  applyCam(cam);
  // the chameleon on the right: both its eyes swing onto the fly on "spots", the tongue SNAPS in the pause after "fly."
  const lock = ramp(t, c.spots - 0.05, c.spots + 0.15);
  const [eF0, eB0] = chamEyes(t, c);
  const ang = (e) => Math.atan2(f.p[1] - (OE_CH.y + e[1] * OE_CH.s), f.p[0] - (OE_CH.x + e[0] * OE_CH.s));
  const aF = ang(OE_CHAM_EYES[0]), aB = ang(OE_CHAM_EYES[1]);
  const tk = t < c.snap ? 0 : t < c.snap + 0.07 ? (t - c.snap) / 0.07 : Math.max(0, 1 - (t - c.snap - 0.07) / 0.16);
  const gone = t > c.snap + 0.07;
  const ch = oeCham(ctx, OE_CH.x, OE_CH.y, OE_CH.s, t, { eyeF: lerp(eF0, aF, lock), eyeB: lerp(eB0, aB, lock), brain: 1, tongue: tk, tip: f.p,
    tug: [0.4, 0.4], mood: 'wow' });
  // the fly: on his nose until the tongue takes it, then riding the tongue back
  applyCam(cam);
  if (!gone) oeFly(ctx, f.p[0], f.p[1], 0.9, t, { landed: f.landed, rot: f.landed ? 0 : 0.3 * Math.sin(t * 9) });
  else if (ch.tongueTip && tk > 0.05) oeFly(ctx, ch.tongueTip[0], ch.tongueTip[1], 0.8, t, { landed: true, rot: 0.6 });
  // the gulp: the chameleon's throat bulges once
  if (t > c.gulp && t < c.gulp + 0.3) { const u = (t - c.gulp) / 0.3; circle(ctx, OE_CH.x - 52, OE_CH.y - 2, 9 * Math.sin(u * Math.PI), OEC.chamHi); }
  // a SNAP burst behind the nose, a beat after the take
  screenSpace();
  const sk = popK(t, c.snap + 0.06, c.snap + 0.34, 0.05, 0.08);
  if (sk > 0.01) { const q = toScreen(cam, nose0[0] + 70, nose0[1] - 70); comicBurst(q[0], q[1], 0.42, sk, 'SNAP!', '#FF5A6E', -0.12, 96); }
  return { glow: 0.8, flash: 0.12 * bumpAt(t, c.snap + 0.06, 14) };
};

// ---------------------------------------------------------------- the cover: the leash moment, both eyes yanked one way
SC.cover = (lt, t, shot) => {
  OE_BGDY = -120;
  const cam = { x: 540, y: 948, zoom: 3.2, rot: 0 };
  oeBack(cam, 6.0);
  applyCam(cam);
  oeHero(cam, 6.0, { face: Object.assign({}, OF.wow, { browY: 1.2 }), eyes: { lx: -1.0, ly: 0.05, iris: ES_IRIS.hero, open: 1.12 },
    brain: { k: 1, mood: 'squint', look: [-0.8, 0.8], dx: -16, lean: -0.15, leash: { k: 1, taut: 1 } } });
  applyCam(cam);
  oeButterfly(ctx, 408, 1010, 0.7, 6.0, { col: ['#FF8A1E', '#3A1A0A', '#FFFFFF'], rot: -0.3 });
  screenSpace();
  bigWord('JUST ONE', 540, 488, 140, '#FFD447', 1, -0.04);
  bigWord('EYE?', 540, 628, 150, '#FFFFFF', 1, 0.03);
  return { glow: 0.8, noCaptions: true };
};

function initScenes2() {
  initOneEye();
}
