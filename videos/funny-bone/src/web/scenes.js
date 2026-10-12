// Why Does Your FUNNY BONE Hurt So Much? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the hallway: a ceiling light up and to the left (the key), the lit room behind him (a warm rim)
const DOOR_LIGHT = { ...LIGHTS.room, rim: [1.0, 0.74, 0.46], rimFrom: [0.6, -0.4], rimAmt: 1.2, pool: 0.42, halo: 0.12, haloColor: [1.0, 0.72, 0.45] };
// inside his arm
const ARM_LIGHT = { ...LIGHTS.inside, rim: [0.6, 0.8, 1.0], pool: 0.22, halo: 0 };

// ---------------------------------------------------------------- his faces
const FF = {
  hum: { eyeOpen: 1, pupil: 1, lookX: 0.1, lookY: -0.1, browY: 0.4, browTilt: 0, mouth: 'flat', mouthOpen: 1.4, blink: 0, cross: 0 },
  bang: { eyeOpen: 1.42, pupil: 0.5, lookX: -0.6, lookY: 0.1, browY: 1.5, browTilt: 0.4, mouth: 'scream', mouthOpen: 1, blink: 0, cross: 0 },
  pain: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: -0.5, browTilt: -1.0, mouth: 'grimace', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1 },
  watch: { eyeOpen: 1.22, pupil: 0.72, lookX: -1, lookY: 0.55, browY: 1.0, browTilt: 1.3, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  zapped: { eyeOpen: 1.46, pupil: 0.42, lookX: 0, lookY: 0, browY: 1.6, browTilt: 0.2, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
  sulk: { eyeOpen: 0.9, pupil: 0.95, lookX: -0.9, lookY: 0.35, browY: -0.3, browTilt: -0.8, mouth: 'flat', mouthOpen: -1.3, blink: 0.3, cross: 0 },
  huh: { eyeOpen: 1.15, pupil: 0.85, lookX: -0.9, lookY: 0.3, browY: 1.0, browTilt: 0.9, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 0 },
  peer: { eyeOpen: 1.22, pupil: 0.8, lookX: -1, lookY: 0.4, browY: 1.25, browTilt: 0.3, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  eek: { eyeOpen: 1.42, pupil: 0.5, lookX: -0.9, lookY: 0.3, browY: 1.5, browTilt: 0.4, mouth: 'o', mouthOpen: 0.9, blink: 0, cross: 0 },
  glare: { eyeOpen: 0.86, pupil: 0.9, lookX: -1, lookY: 0.15, browY: -0.5, browTilt: -1.0, mouth: 'flat', mouthOpen: -0.9, blink: 0.3, cross: 0 },
  dead: { eyeOpen: 0.84, pupil: 1, lookX: 0, lookY: 0, browY: -0.35, browTilt: -0.3, mouth: 'flat', mouthOpen: -0.4, blink: 0.36, cross: 0 },
};

// ---------------------------------------------------------------- small things
function armBg(t) { darkBg('#17356E', '#050919'); motes(t, 0.35); }
// a small filled tag (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, 2); });
  ctx.restore();
}
// the label on his elbow (screen space): FUNNY BONE, each word struck out as the narrator takes it away. (x, y) = its
// middle, tip = the point it names, k = pop, s1 / s2 = the two strikes (0..1), drop = it falls off
function boneTag(x, y, tip, k, s1, s2, drop, t) {
  if (k <= 0.01 || drop >= 1) return;
  const q = E.outBack(clamp(k), 2), dy = 520 * drop * drop, rot = -0.05 + 0.9 * drop;
  screenSpace();
  ctx.save(); ctx.translate(x - 40 * drop, y + dy); ctx.rotate(rot); ctx.scale(q, q);
  if (drop <= 0.001) { ctx.beginPath(); ctx.moveTo(-26, -40); ctx.lineTo(tip[0] - x, tip[1] - y + 6); ctx.lineTo(26, -40); ctx.closePath(); ctx.fillStyle = '#F7F4EC'; ctx.fill(); }
  rrect(ctx, -178, -46, 356, 92, 22); ctx.fillStyle = '#F7F4EC'; ctx.fill();
  paint(() => {
    ctx.font = '900 50px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const w1 = ctx.measureText('FUNNY').width, gap = 18, w2 = ctx.measureText('BONE').width, x0 = -(w1 + gap + w2) / 2;
    ctx.fillStyle = s1 > 0.5 ? '#9A97A6' : '#1A1C2C'; ctx.fillText('FUNNY', x0, 3);
    ctx.fillStyle = s2 > 0.5 ? '#9A97A6' : '#1A1C2C'; ctx.fillText('BONE', x0 + w1 + gap, 3);
    if (s1 > 0.01) line(ctx, x0 - 8, 8, x0 - 8 + (w1 + 16) * clamp(s1), -4, 9, '#E2283C');
    if (s2 > 0.01) line(ctx, x0 + w1 + gap - 8, 8, x0 + w1 + gap - 8 + (w2 + 16) * clamp(s2), -4, 9, '#E2283C');
  });
  ctx.restore();
}
// a HELLO-my-name-is sticker (screen space). k = it slaps on, flip 0..1 = it turns over to the second name
function nameSticker(x, y, s, k, flip, rot = -0.07) {
  if (k <= 0.01) return;
  const q = lerp(2.1, 1, E.outCubic(clamp(k))) * s, sx = Math.max(0.05, Math.abs(Math.cos(Math.PI * clamp(flip)))), two = flip >= 0.5;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(q * sx, q); ctx.globalAlpha = clamp(k * 3);
  rrect(ctx, -160, -102, 320, 204, 24); ctx.fillStyle = '#E2283C'; ctx.fill();
  rrect(ctx, -146, -26, 292, 112, 12); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  paint(() => {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '400 46px Anton'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('HELLO', 0, -72);
    ctx.font = '800 19px Montserrat'; ctx.fillText('my name is', 0, -40);
    ctx.font = `400 ${two ? 62 : 76}px Anton`; ctx.fillStyle = two ? '#6A2FC4' : '#1A1C2C'; ctx.fillText(two ? 'HUMOROUS?' : 'HUMERUS', 0, 34);
  });
  ctx.restore();
}
// a dent in the door frame where his elbow has been (world units, camera applied)
function doorDent(y, k) {
  if (k <= 0.01) return;
  paint(() => {
    const x = DW.XL - 6;
    for (const [dx, dy] of [[-13, -10], [-17, 3], [-10, 13]]) line(ctx, x, y, x + dx, y + dy, 2.5, rgba('#8A7E6C', 0.8 * k));
    ellipse(ctx, x - 1, y, 4, 9, rgba('#9A8E7C', k));
  });
}

// ================================================================ the doorway: frame 1 and round it
const WIN_R = 78, WIN_S = 0.5;                                   // the window on his elbow: its radius, and its pixels to an arm unit (world)
const MECH0 = { F: FBA.ELB, P: [540, 870], s: 2.3 };             // how the next shot opens: where the elbow is, and how big
// the opening as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const app = clamp(-tt / 0.4), held = tt < 0.05 ? 1 : 0;       // he walks in; the basket leaves his hands a moment after the bang
  const rec = tt > 0 ? 1 - Math.exp(-tt * 7) : 0;
  const fling = ramp(tt, 0.05, 0.2, E.outBack), show = ramp(tt, c.zap_end + 0.1, c.its + 0.05, E.inOutCubic);
  let armL = armMix(FB_ARM.holdL, FB_ARM.zapL, clamp(fling, 0, 1.15));
  armL = armMix(armL, FB_ARM.showL, show);
  let armR = armMix(FB_ARM.holdR, FB_ARM.flinchR, ramp(tt, 0.05, 0.24, E.outBack));
  armR = armMix(armR, FB_ARM.restR, ramp(tt, c.zap_end + 0.2, c.its + 0.3, E.inOutCubic));
  const build = ramp(tt, c.whole - 0.3, c.zap, E.inCubic), zapB = bumpAt(tt, c.zap, 2.4);
  const zap = tt < 0 ? 0 : (0.95 * Math.exp(-tt * 2.2) + 0.8 * build * (tt < c.zap ? 1 : 0) + zapB) * (1 - ramp(tt, c.its - 0.3, c.its))
    + 0.5 * (bumpAt(tt, c.notfunny_end + 0.2, 7) + bumpAt(tt, c.nota_end + 0.12, 7));
  let face = tt < 0 ? FF.hum : FF.bang;
  face = lerpFace(face, FF.pain, ramp(tt, 0.3, 0.45));
  face = lerpFace(face, FF.watch, ramp(tt, c.funny + 0.5, c.whole));
  face = lerpFace(face, FF.zapped, ramp(tt, c.zap - 0.04, c.zap + 0.06));
  face = lerpFace(face, FF.sulk, ramp(tt, c.its - 0.15, c.its + 0.1));
  face = lerpFace(face, FF.huh, ramp(tt, c.its2, c.its2 + 0.18));
  face = lerpFace(face, FF.peer, ramp(tt, c.window, c.window + 0.2));
  face = lerpFace(face, FF.eek, ramp(tt, c.nerve - 0.03, c.nerve + 0.08));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.notfunny_end + 0.05, c.nota_end + 0.3, c.naked + 0.3], 0.11)) };
  const wince = bumpAt(tt, c.notfunny_end + 0.2, 5) + bumpAt(tt, c.nota_end + 0.12, 5);
  const A = {
    x: DW.HX + 52 * app + 34 * rec - (tt > 0 ? 9 * Math.exp(-tt * 5) * Math.sin(tt * 24) : 0), s: DW.HS * (1 - 0.035 * app),
    bob: tt < 0 ? -5 * Math.abs(Math.sin((tt + 0.4) * 9)) : -10 * bumpAt(tt, 0, 6) * Math.sin(tt * 20) + 1.5 * Math.sin(tt * 2.6),
    lean: tt < 0 ? 0 : 0.085 * bumpAt(tt, 0, 3.2) - 0.03 * show,
    face, armL, armR, hand: 'open', handL: tt >= 0.05 && tt < c.its ? 'spread' : 'open', basket: held, sock: tt >= 1.25 ? 1 : 0,
    frizz: (0.85 * bumpAt(tt, c.zap, 1.6) + 0.4 * build * (tt < c.zap ? 1 : 0)) * (tt < c.its + 0.4 ? 1 : 0),
    tremL: tt < 0.05 ? 0 : Math.max(0.5 * Math.exp(-tt * 1.4), 0.35 * build, zapB, 0.6 * wince, 0.12 * show),
    headDX: tt > 0 ? 3 * bumpAt(tt, 0, 5) * Math.sin(tt * 40) + 2.2 * zapB * Math.sin(tt * 61) : 0,
    headDY: tt > 0 ? -4 * bumpAt(tt, c.zap, 5) - 3 * bumpAt(tt, c.nerve, 6) : 0,
    headRot: (tt > 0 ? -0.06 * ramp(tt, 0.3, 0.6) * (1 - show) : 0) - 0.07 * show + 0.03 * wince,
  };
  return { A, zap, zapB, show, held, app, build };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 462, 1054, 2.14], [0, 450, 1052, 2.2], [0.3, 452, 1058, 2.3], [1.0, 432, 1072, 2.04], [c.whole, 420, 1078, 2.0], [c.zap, 416, 1082, 2.12],
    [c.zap_end + 0.15, 422, 1076, 2.04], [c.its + 0.12, 482, 1036, 2.12], [c.window, 478, 1034, 2.2], [c.nerve, 452, 1040, 2.42], [c.dive, 448, 1040, 2.46]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(2.2, 2.3, u); k.x = lerp(450, 452, u); k.y = lerp(1052, 1058, u); }   // the first push is quick off the mark
  const sh = 9 * bumpAt(tt, 0, 8) + 6 * bumpAt(tt, c.zap, 6);
  if (tt >= 0) { k.x += sh * vnoise(tt * 34, 3); k.y += sh * vnoise(tt * 31, 8); }
  return k;
}
// the doorway, him, and everything round the bang. o: {cam, S: a state from hookA, tt, after: fn(H)}
function hookDraw(tt, t, o) {
  const c = cu(), S = o.S, cam = o.cam;
  doorDraw(cam, t, { jolt: bumpAt(tt, 0, 8) * (tt >= 0 ? 1 : 0) });
  applyCam(cam);
  const Y0 = DW.FLOOR - 332 * DW.HS;                           // the height of his elbow at the bang
  doorDent(Y0, tt > 0.1 ? 1 : 0);
  if (tt >= 0) {     // the bang itself, behind him: his elbow stays in front of it, jammed into the frame
    const k = clamp((tt + 0.05) / 0.1), a = 1 - ramp(tt, 0.46, 0.7);
    fbBurst(DW.XL + 20, Y0 - 62, 72, 'BONK!', k, a, -0.12, 3);
  }
  const H = fbHero(cam, t, S.A);
  applyCam(cam);
  if (tt >= 0.05) {   // the basket is on its way down, the washing on its way up
    const d = tt - 0.05, B0 = [DW.HX, DW.FLOOR - 300 * DW.HS];
    if (d < 1.0) fbBasket(ctx, B0[0] + 70 * d, B0[1] - 240 * d + 0.5 * 2700 * d * d, DW.HS, 1.2 * d, 1 - ramp(d, 0, 0.1));
    fbFlying(ctx, [DW.HX, DW.FLOOR - 340 * DW.HS], d, 1);
    const u = clamp(d / 1.2);
    if (u < 1) {      // one sock is going to stay
      const T1 = [H.head[0] + 46 * H.s, H.head[1] - 70 * H.s], T0 = [DW.HX + 150, DW.FLOOR - 350 * DW.HS];
      fbSock(ctx, lerp(T0[0], T1[0], u), lerp(T0[1], T1[1], u) - 330 * Math.sin(Math.PI * u), 1.05 * H.s, 2.5 + (1 - u) * 11);
    }
  }
  if (tt > c.whole - 0.35 && tt < c.zap) {   // it runs down his arm, three times, faster and brighter: "your whole arm goes..."
    const u = (tt - (c.whole - 0.35)) / (c.zap - c.whole + 0.35), n = Math.min(2, Math.floor(u * u * 3)), f = E.inOutSine(clamp(u * u * 3 - n));
    const tip = [H.wrL[0] + H.dirL[0] * 46 * H.s, H.wrL[1] + H.dirL[1] * 46 * H.s], PP = [H.shL, H.elL, H.wrL, tip], acc = polyLen(PP), B = polyAt(PP, acc, f * acc[3]), r = (11 + 5 * n) * H.s;
    circle(ctx, B[0], B[1], r, '#FFFDF0'); softDot(gctx, B[0], B[1], 3 * r, '#FFC24A', 0.6);
  }
  const xr = Math.max(tt < c.zap + 0.4 ? clamp(S.zapB * 1.6) : 0, pulseOf(tt, [c.zap_end + 0.02], 0.36));   // on the word, and again in the pause after it (where the sound is)
  fbArmBones(H, xr * (Math.sin(tt * 78) > -0.2 ? 1 : 0.25));
  fbZap(H, Math.floor(tt * 30), clamp(S.zap), tt > 0.16 ? 1 : 0);
  if (o.after) o.after(H);
  return H;
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const win = ramp(t, c.window, c.window + 0.26), dive = ramp(t, c.dive, shot.end, E.inCubic);
  let NW = null;
  const elbowOf = () => { const st = fbSt(S.A), e = armMix(FB_ARM.showL, FB_ARM.showL, 0).e; return [st.x + e[0] * st.s, st.y + e[1] * st.s]; };
  if (win > 0) NW = elbowOf();
  if (dive > 0) {   // into the window on his elbow: it ends where the next shot's elbow is, at its size
    const P0 = toScreen(cam, NW[0], NW[1]);
    Object.assign(cam, scaledCam(cam, NW, 1 + (MECH0.s / (WIN_S * cam.zoom) - 1) * dive));
    cam.sx = (MECH0.P[0] - P0[0]) * dive; cam.sy = (MECH0.P[1] - P0[1]) * dive;
  }
  const nerveK = ramp(t, c.nerve - 0.04, c.nerve + 0.14);
  const H = hookDraw(t, t, { cam, S, after: (Hh) => {
    if (win <= 0) return;
    fbWindow(NW[0], NW[1], WIN_R, WIN_S, win, t, { mus: [0, 0, 0, 0], glow: 0.7 + 0.3 * nerveK, bare: nerveK * (0.7 + 0.3 * Math.sin(t * 16)),
      face: { mood: nerveK > 0.5 ? 'eek' : 'shy', look: [0.4, -0.6] }, pulse: [[FB_N.acc[FB_N.iHit], 0.8 * bumpAt(t, c.nerve, 4)]] });
  } });
  // the name it goes by, and what is left of it
  const Es = toScreen(cam, H.elL[0], H.elL[1]), tx = clamp(Es[0] + 36, 300, 430), ty = Es[1] + 208;
  const tk = ramp(t, c.its - 0.08, c.its + 0.12);
  boneTag(tx, ty, [Es[0], Es[1] + 40], tk, ramp(t, c.notfunny_end - 0.08, c.notfunny_end + 0.1), ramp(t, c.nota_end - 0.08, c.nota_end + 0.1), ramp(t, c.window - 0.12, c.window + 0.3, E.inCubic), t);
  pill(tx - 10, ty - 6, 'A NERVE', '#FF9A3C', nerveK * (1 - dive), 50);
  const hit = bumpAt(t, 0, 7);
  if (hit > 0.05) { const B = toScreen(cam, DW.XL + 10, DW.FLOOR - 332 * DW.HS); shockLines(B[0], B[1], 150, 1 - hit, 12, '#FFFFFF', 5); }
  const zf = bumpAt(t, c.zap, 9);
  return { glow: 0.85, capY: t < c.its - 0.04 ? 1330 : 1480, zblur: 0.34 * dive, zcx: lerp(540, MECH0.P[0], dive), zcy: lerp(960, MECH0.P[1], dive), flash: 0.16 * bumpAt(t, 0, 10) + 0.3 * zf + 0.08 * bumpAt(t, c.nerve, 8) };
};

// ================================================================ his arm, see-through: tucked under muscle, bare at the elbow
SC.mech = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, N = FB_N;
  armBg(t);
  const V = armKeys(lt, [[0, MECH0.F[0], MECH0.F[1], MECH0.s, MECH0.P[0], MECH0.P[1]], [c.muscle - T0 + 0.3, -250, -255, 1.06, 420, 792], [c.except - T0 - 0.12, -250, -255, 1.12, 420, 792],
    [c.elbow - T0 + 0.25, -456, 12, 2.0, 540, 880], [c.bone3 - T0 + 0.3, -458, 12, 2.3, 540, 880], [D, -464, 8, 2.55, 540, 880]]);
  const pop = (a) => ramp(t, a - 0.04, a + 0.2, E.outBack);
  const mus = [pop(c.under), pop(c.muscle), pop(c.down), pop(c.down + 0.2)];
  const bare = ramp(t, c.except - 0.02, c.except + 0.22), knob = ramp(t, c.bone3 - 0.06, c.bone3 + 0.18), skin = ramp(t, c.skin - 0.1, c.skin + 0.14);
  const run = ramp(t, T0 + 0.1, c.arm2_end, E.inOutSine);       // a bead goes the whole way down, to show where the nerve runs
  const r2 = clamp((t - c.where) / (c.bone3 - c.where)) * 2, round = E.inOutSine(r2 - Math.floor(Math.min(r2, 1.999)));   // ... round the knob, twice
  const mood = t < c.except ? 'calm' : t < c.right ? 'shy' : 'eek';
  const bodyFace = lerpFace(FF.watch, FF.peer, ramp(t, c.except - 0.1, c.except + 0.1));
  armOn(V, () => fbArm(t, { body: true, bodyFace, mus, ghost: 0.75, glow: 0.6 + 0.4 * bare, bare: bare * (0.55 + 0.45 * Math.abs(Math.sin(t * 5))),
    face: { mood, look: mood === 'eek' ? [-0.9, -0.2] : [0.5, -0.5], sweat: ramp(t, c.right, c.under2) }, knob: knob * (0.6 + 0.4 * Math.sin(t * 9)), skin: skin * (0.65 + 0.35 * Math.sin(t * 11)),
    pulse: [[run * N.L, run > 0.001 && run < 0.999 ? 0.9 : 0], [lerp(N.acc[N.i0], N.acc[N.i1], round), round > 0.001 && round < 0.999 ? 0.75 : 0]] }));
  // what things are
  const wide = 1 - ramp(t, c.except - 0.2, c.except + 0.05);
  const mk = ramp(t, c.muscle - 0.03, c.muscle + 0.16) * wide, M0 = armPt(V, -214, -70);
  leader([M0[0], M0[1] - 150], M0, mk >= 0.99 ? 1 : mk, '#FF86A6'); pill(M0[0], M0[1] - 186, 'MUSCLE', '#FF86A6', mk, 44);
  const bk = ramp(t, c.bone3 - 0.04, c.bone3 + 0.16), B0 = armPt(V, -410, 14), BL = armPt(V, -322, 8);
  leader([BL[0] - 84, BL[1]], B0, bk >= 0.99 ? 1 : bk, '#BFF0FF'); pill(BL[0], BL[1], 'BONE', '#BFF0FF', bk, 44);
  const sk = ramp(t, c.skin - 0.06, c.skin + 0.14), S0 = armPt(V, -508, 8);
  leader([S0[0] - 150, S0[1] - 116], S0, sk >= 0.99 ? 1 : sk, '#FFFFFF'); pill(S0[0] - 170, S0[1] - 152, 'JUST SKIN', '#FFFFFF', sk, 40);
  const arrive = ramp(lt, 0, 0.3);
  return { glow: 0.9, zblur: 0.3 * (1 - arrive), zcx: MECH0.P[0], zcy: MECH0.P[1], flash: 0.26 * (1 - ramp(lt, 0, 0.16)) + 0.05 * bumpAt(t, c.except, 8) };
};

// ================================================================ the door frame again, from inside: the squash, and where the zap goes
SC.knock = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, N = FB_N;
  armBg(t);
  const V = armKeys(lt, [[0, -470, 5, 2.05, 480, 880], [c.zap2 - T0, -470, 5, 2.12, 480, 880], [c.pinky - T0 + 0.06, -452, -492, 1.66, 540, 810], [D, -452, -498, 1.8, 540, 810]]);
  const hitB = bumpAt(t, c.squash, 7);
  V.x += 12 * hitB * vnoise(t * 36, 2); V.y += 12 * hitB * vnoise(t * 33, 6);
  const xp = lerp(-800, -500, ramp(t, c.knock - 0.14, c.squash, E.inCubic)), sq = ramp(t, c.squash - 0.01, c.squash + 0.09, E.outBack);
  const go = ramp(t, c.zap2 - 0.06, c.pinky, E.inOutSine), sHit = N.acc[N.iHit];
  const charge = t >= c.squash && t < c.zap2 ? 0.55 + 0.45 * Math.sin(t * 40) : 0;
  const mood = t < c.squash ? 'eek' : 'ouch';
  armOn(V, () => fbArm(t, { mus: [1, 1, 1, 1], ghost: 0.7, glow: 0.7, bare: 0.4 + 0.6 * hitB, face: { mood, look: [-1, -0.5], sweat: t < c.squash ? 1 : 0 }, post: xp, squash: clamp(sq, 0, 1.15),
    knob: 0.5 * hitB, pulse: [[sHit, charge], [lerp(sHit, N.L + 104, go), go > 0.001 && go < 0.995 ? 1 : 0]], fingers: ramp(t, c.pinky - 0.04, c.pinky + 0.12) * (0.72 + 0.28 * Math.max(bumpAt(t, c.pinky, 3), bumpAt(t, c.pinky_end + 0.02, 3.5))), ends: ramp(t, c.nerve2 - 0.05, c.ends + 0.1) }));
  const C0 = armPt(V, FBA.HIT[0], FBA.HIT[1]);
  if (t >= c.squash) { applyCam(CAM0); fbBurst(C0[0] - 168, C0[1] - 214, 146, 'SQUASH!', clamp((t - c.squash) / 0.1), 1 - ramp(t, c.zap2 - 0.3, c.zap2 - 0.05), -0.1, 5); screenSpace(); }
  if (hitB > 0.05) shockLines(C0[0], C0[1], 120, 1 - hitB, 12, '#FFFFFF', 7);
  const ek = ramp(t, c.nerve2 - 0.05, c.nerve2 + 0.15), P0 = armPt(V, FBA.PINKY[0], FBA.PINKY[1] - 12);
  leader([296, 742], P0, ek >= 0.99 ? 1 : ek, '#FFD447'); pill(280, 778, 'IT ENDS HERE', '#FFD447', ek, 40);
  return { glow: 0.9, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.2 * bumpAt(t, c.squash, 9) + 0.14 * bumpAt(t, c.pinky, 8) };
};

// ================================================================ the bone it is squashed against, and its name
SC.name = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  armBg(t);
  const V = armKeys(lt, [[0, -440, 20, 2.2, 404, 870], [c.against - T0, -440, 20, 2.36, 404, 870], [c.humerus - T0 - 0.05, -214, 4, 1.4, 548, 880], [D, -214, 4, 1.5, 548, 880]]);
  const hum = ramp(t, c.humerus - 0.1, c.humerus + 0.12), flip = ramp(t, c.humorous - 0.06, c.humorous + 0.2, E.inOutCubic);
  const thr = ramp(t, c.bone4 - 0.05, c.bone4 + 0.1) * (1 - hum) * (0.55 + 0.45 * Math.sin(t * 10));
  const bodyFace = lerpFace(lerpFace(FF.pain, FF.huh, ramp(t, c.bone4, c.bone4 + 0.2)), FF.sulk, ramp(t, c.humorous + 0.25, c.humorous + 0.45));
  armOn(V, () => fbArm(t, { body: true, bodyFace, mus: [1, 1, 1, 1], ghost: 0.7, glow: 0.55, bare: 0.35, face: { mood: 'ouch' }, post: -500, squash: 1,
    knob: thr, hum: hum * (0.5 + 0.2 * Math.sin(t * 6)) * (1 - 0.4 * flip), humFace: ramp(t, c.humorous + 0.1, c.humorous + 0.3) }));
  const K0 = armPt(V, -404, -86);
  bigWord('?', K0[0] + 40, K0[1] - 40, 190, '#FFD447', E.outBack(ramp(t, c.against - 0.03, c.against + 0.16), 2.2) * (1 - ramp(t, c.humerus - 0.35, c.humerus - 0.18)), 0.14);
  const ST = armPt(V, -186, -58), sk = ramp(t, c.humerus - 0.03, c.humerus + 0.14);
  nameSticker(ST[0], ST[1], V.s / 1.4, sk, flip);
  tagPill('BA-DUM TSS!', 742, 1090, '#FFD447', pulseOf(t, [c.rimshot], c.maybe - c.rimshot - 0.04), 34);
  stamp('UNPROVEN', 730, 604, ramp(t, c.maybe - 0.02, c.maybe + 0.2), '#FF5A6E', -0.08, 76);
  tagPill('= FUNNY BONE?', 706, 492, '#C8A8FF', ramp(t, c.joke - 0.03, c.joke + 0.15), 40);
  const land = bumpAt(t, c.humerus, 8);
  return { glow: 0.9, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.12 * land + 0.08 * bumpAt(t, c.humorous, 9) };
};

// ================================================================ the button: nobody is laughing
function buttonA(t) {
  const c = cu();
  const turn = ramp(t, c.laughing - 0.2, c.laughing - 0.02, E.inOutCubic);
  let face = lerpFace(FF.glare, FF.dead, turn);
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(t, [c.laughing_end - 0.25], 0.12)) };
  const rub = [3.5 * Math.cos(t * 10), 3 * Math.sin(t * 10)];
  return {
    x: DW.HX + 34, face, armL: FB_ARM.foldL, armR: { e: FB_ARM.rubR.e, w: [FB_ARM.rubR.w[0] + rub[0], FB_ARM.rubR.w[1] + rub[1]] }, hand: 'open', sock: t < c.laughing_end - 0.1 ? 1 : 0,
    bob: 1.5 * Math.sin(t * 2.6), headRot: -0.06 * (1 - turn), headDY: 2 * turn, lean: -0.01,
  };
}
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 520, 1136, 1.72], [D, 528, 1120, 1.92]], E.inOutSine);
  doorDraw(cam, t, {});
  applyCam(cam);
  doorDent(DW.FLOOR - 332 * DW.HS, 1);
  const H = fbHero(cam, t, buttonA(t));
  applyCam(cam);
  const fall = t - (c.laughing_end - 0.1);                        // the sock on his head gives up
  if (fall >= 0) fbSock(ctx, H.head[0] + 46 * H.s + 26 * fall, H.head[1] - 70 * H.s + 60 * fall + 0.5 * 2400 * fall * fall, 1.05 * H.s, 2.5 + 3.4 * fall);
  const throb = 0.5 + 0.5 * Math.sin(t * 9);                     // his elbow, still sore
  softDot(gctx, H.elL[0], H.elL[1], 60, '#FF5A3C', 0.45 * throb);
  for (let i = 0; i < 3; i++) { const p = (t * 1.2 + i / 3) % 1, a = -2.6 + i * 0.5; line(ctx, H.elL[0] + Math.cos(a) * (40 + 22 * p), H.elL[1] + Math.sin(a) * (40 + 22 * p), H.elL[0] + Math.cos(a) * (54 + 22 * p), H.elL[1] + Math.sin(a) * (54 + 22 * p), 4, rgba('#FFD0C0', 0.9 * (1 - p))); }
  return { glow: 0.85, capY: 1150, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  hookDraw(tt, t, { cam, S });
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const tt = 0.02, S = hookA(tt), cam = { x: 452, y: 1048, zoom: 2.24, rot: 0 };
  S.zap = 1; S.A.frizz = 0.5;
  hookDraw(tt, 0.5, { cam, S });
  screenSpace();
  bigWord("IT'S NOT", 540, 1190, 120, '#FFFFFF', 1, -0.03);
  bigWord('A BONE', 540, 1352, 216, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: DOOR_LIGHT, loop: DOOR_LIGHT, cover: DOOR_LIGHT, button: DOOR_LIGHT, mech: ARM_LIGHT, knock: ARM_LIGHT, name: ARM_LIGHT });

function initScenes2() {
  initDoorway();
  initArm();
}
