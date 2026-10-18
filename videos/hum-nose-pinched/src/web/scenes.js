// Why Can't You HUM With Your Nose Pinched? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// One world all the way: blocked-nostril's bathroom seen from its mirror (mirror.js), him humming in it, his head turning to
// glass where he stands (hum.js), and back to frame 0 for the loop.
'use strict';

const cu = () => TLd.cues;
const dur = () => (TLd.duration > 5 ? TLd.duration : cu().encore_end + 1.01);   // the cover renders from a 2-frame timeline
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bathroom in the morning: the frosted window is on the left (the key), the room behind him out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
// the same room with the glass head on: a touch darker round him, so the glass reads
const GLASS_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.56, halo: 0.12, dof: 0.9 };
setLights({ hook: MORN_LIGHT, inside: GLASS_LIGHT, caves: GLASS_LIGHT, button: MORN_LIGHT });

// ---------------------------------------------------------------- his faces (the rig's face, before the glass)
const HF = {
  hum: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.7, browTilt: 0.35, mouth: 'flat', mouthOpen: 0.6, blink: 1, cross: 0 },
  humPeek: { eyeOpen: 0.9, pupil: 1, lookX: 0, lookY: 0.3, browY: 0.6, browTilt: 0.2, mouth: 'flat', mouthOpen: 0.4, blink: 0.45, cross: 0 },
  shock: { eyeOpen: 1.32, pupil: 0.6, lookX: 0, lookY: 0, browY: 1.4, browTilt: 0.55, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  dartL: { eyeOpen: 1.2, pupil: 0.7, lookX: -0.95, lookY: 0.1, browY: 1.1, browTilt: 0.6, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
  dartR: { eyeOpen: 1.2, pupil: 0.7, lookX: 0.95, lookY: 0.1, browY: 1.1, browTilt: 0.6, mouth: 'none', mouthOpen: 0, blink: 0, cross: 0 },
};
// his right arm (screen right): hanging, or up with the hand at his nose (rig-local elbow and wrist)
const HM_ARM = { rest: { e: [90, -271], w: [113, -184] }, up: { e: [126, -298], w: [64, -392] } };

// ---------------------------------------------------------------- the state of everything, at any time
// tt < 0 is the end of the Short on its way back to frame 0 (the loop): the hook's state is valid there.
function hookHand(tt) {
  const c = cu();
  // low under his chin while he hums, rising; the thumb and finger close on "pinch ... nose"
  const on = lerp(0.3 + 0.04 * Math.sin(tt * 3), 1, ramp(tt, c.pinch1 - 0.5, c.pinch1 + 0.12, E.inOutCubic));
  const k = ramp(tt, c.pinch1 - 0.05, c.nose1 + 0.02, E.inOutCubic);
  return { on: tt < -0.45 ? 0 : (tt < 0 ? lerp(0, 0.3, ramp(tt, -0.45, 0, E.outCubic)) : on), k: tt < 0 ? 0 : k, drop: 0 };
}

function hmState(t) {
  const c = cu(), D = dur();
  const S = { t, A: {}, G: null, glassK: 0 };
  const tt = t > D - 0.36 ? t - D : t;              // the last frames are frame 0 coming round again
  const A = S.A;
  // ---------- the hand: the hook's pinch (held to the let-go), the second pinch, and nothing in the caves
  let hand;
  if (tt < c.door_end + 0.05) hand = hookHand(tt);
  else if (t < c.pinch2 - 0.2) hand = { on: 1, k: 1 - ramp(t, c.letgo, c.letgo + 0.16), drop: ramp(t, c.letgo + 0.04, c.letgo + 0.42, E.inOutCubic) };
  else if (t < c.stop + 0.3) hand = { on: ramp(t, c.pinch2 - 0.18, c.pinch2 + 0.14, E.inOutCubic), k: ramp(t, c.pinch2 + 0.04, c.squeak - 0.02, E.inOutCubic), drop: 0 };
  else hand = { on: 1, k: 1 - ramp(t, c.stop + 0.3, c.stop + 0.44), drop: ramp(t, c.stop + 0.34, c.stop + 0.72, E.inOutCubic) };
  if (t > c.stop + 0.75 && tt >= 0) hand = null;
  if (t > c.letgo + 0.45 && t < c.pinch2 - 0.2) hand = null;
  if (hand) hand.squeeze = Math.max(popK(t, c.nose1 + 0.02, c.nose1 + 0.4) * (tt >= 0 ? 1 : 0), popK(t, c.squeak - 0.02, c.squeak + 0.36));
  A.hand = hand;
  const up = hand ? clamp(hand.on) * (1 - clamp(hand.drop)) : 0;
  A.armR = hand ? { e: [lerp(HM_ARM.rest.e[0], HM_ARM.up.e[0], up), lerp(HM_ARM.rest.e[1], HM_ARM.up.e[1], up)], w: [lerp(HM_ARM.rest.w[0], HM_ARM.up.w[0], up), lerp(HM_ARM.rest.w[1], HM_ARM.up.w[1], up)] } : HM_ARM.rest;
  A.nose = { pinch: hand ? clamp(hand.k) * up : 0 };
  // ---------- the cheeks
  let ck = 0;
  if (tt >= 0 && t < c.letgo + 0.3) ck = 0.38 * ramp(t, c.choke - 0.05, c.choke + 0.1) + 0.62 * ramp(t, c.puff1 - 0.04, c.puff1 + 0.2, E.outBack);
  if (t >= c.letgo - 0.01 && t < c.letgo + 0.3) ck *= 1 - ramp(t, c.letgo, c.letgo + 0.24, E.inOutCubic);
  if (t > c.pinch2) ck = 0.45 * ramp(t, c.cheeks - 0.1, c.cheeks + 0.25) + 0.55 * ramp(t, c.balloon - 0.12, c.balloon + 0.12, E.outBack);
  if (t > c.stop + 0.3) ck *= 1 - ramp(t, c.stop + 0.32, c.stop + 0.6, E.inOutCubic);
  A.cheeks = ck; A.cheekWob = Math.sin(t * 9) * ck;
  // ---------- the face (before the glass covers it)
  let face = HF.hum;
  if (tt >= 0) {
    if (t > c.choke - 0.02) face = HF.shock;
    if (t > c.gone + 0.12 && t < c.voice) face = (Math.floor((t - c.gone) / 0.3) % 2) ? HF.dartR : HF.dartL;
  }
  A.face = tt < 0 ? HF.hum : face;
  A.headDY = tt >= 0 ? -3 * ramp(t, c.puff1, c.puff1 + 0.12) * (1 - ramp(t, c.gone, c.gone + 0.3)) : 0;
  A.headRot = tt >= 0 && t < c.voice ? 0.04 * Math.sin(Math.max(0, t - c.gone) * 10) * ramp(t, c.gone, c.gone + 0.1) * (1 - ramp(t, c.locked, c.locked + 0.2)) : 0.015 * Math.sin(t * 2.2);
  A.bob = 2 * Math.sin(t * 2.4);
  // ---------- the padlock (the answer) and the zipper (lips shut)
  if (tt >= 0 && t > c.locked && t < c.letgo + 0.42) A.lock = { k: ramp(t, c.locked + 0.02, c.lock_click - 0.02), shut: ramp(t, c.lock_click - 0.03, c.lock_click + 0.03), off: ramp(t, c.letgo - 0.02, c.letgo + 0.4, (x) => x) };
  if (t > c.lips && t < c.pinch2 + 0.4) A.zip = { k: ramp(t, c.zip - 0.04, c.zip + 0.22, E.inOutCubic), a: 1 - ramp(t, c.pinch2 + 0.1, c.pinch2 + 0.36) };
  // ---------- the glass
  let gk = 0;
  if (tt >= 0) gk = ramp(t, c.voice - 0.08, c.voice + 0.5, (x) => x) * (1 - ramp(t, c.blast + 0.22, c.blast + 0.6, (x) => x));
  S.glassK = gk;
  if (gk > 0.001) {
    const G = { k: gk, puff: ck, pinch: A.nose.pinch, look: [0, 0], blink: 0, brow: 0.6, eyeOpen: 1.1, pupil: 0.8 };
    // eyes on the glass
    if (t < c.letgo) { G.look = [0.5 * Math.sin(t * 6), -0.2]; G.brow = 1.1; G.eyeOpen = 1.25; G.pupil = 0.65; }
    else if (t < c.hum2) { G.blink = 0; G.brow = 0.5; }
    else if (t < c.pinch2) { G.blink = t > c.hum2 + 0.1 && t < c.lips ? 1 : 0; G.brow = 0.8; }
    else if (t < c.stop + 0.3) { G.look = [0, 0.5]; G.brow = 1.2 + 0.2 * ramp(t, c.cheeks, c.puff_end); G.eyeOpen = 1.2 + 0.1 * ramp(t, c.cheeks, c.balloon); G.pupil = 0.62; if (t > c.nobuzz) { G.look = [0, 0.2]; G.brow = 0.4; G.eyeOpen = 0.8; } }
    else if (t < c.weirder) { G.brow = 0.9; G.eyeOpen = 1.2; }
    else if (t < c.encore_in) { G.blink = (t > c.airs && t < c.face1_end) ? 1 : 0; G.look = t > c.barely ? [-0.6, 0.4] : [0, 0]; G.brow = 0.7; }
    else { G.blink = t > c.blast - 0.05 ? 1 : 0; G.look = [0, 0]; G.brow = 1.0; }
    // the trapped notes (the answer), then the road of the air
    G.trapped = ramp(t, c.room - 0.25, c.room + 0.1) * (1 - ramp(t, c.letgo - 0.05, c.letgo + 0.12));
    const humming1 = ramp(t, c.hum2 - 0.15, c.hum2 + 0.15) * (1 - ramp(t, c.nobuzz + 0.05, c.stop, (x) => x));
    G.air = t < c.letgo ? 0 : 1;
    G.buzz = humming1 * (1 - 0.45 * ramp(t, c.piles, c.lungs_end)) * (t < c.weirder ? 1 : 0) + (t > c.airs - 0.1 && t < c.face1_end + 0.1 ? 1 : 0) + (t > c.blast - 0.05 ? 1 : 0);
    G.buzz = clamp(G.buzz) * (t > c.letgo ? 1 : 0);
    G.buzz += 0.5 * bumpAt(t, c.buzzing, 3) * (t < c.lips ? 1 : 0);
    G.rings = clamp(G.buzz);
    G.flow = t < c.noflow + 0.2 ? 1 : 1 - ramp(t, c.noflow + 0.2, c.freeze, (x) => x);
    if (t > c.stop + 0.3) G.flow = 1;
    G.tAir = t < c.freeze ? t : (t < c.stop + 0.3 ? c.freeze : t);   // the beads stop where they are
    G.pile = ramp(t, c.squeak, c.up_end + 0.2, E.inOutSine) * (1 - ramp(t, c.stop + 0.3, c.stop + 0.6));
    G.out = t < c.pinch2 + 0.25 || t > c.stop + 0.3 ? 1 : 1 - ramp(t, c.pinch2 + 0.2, c.squeak);
    G.mouthFill = ramp(t, c.piles + 0.2, c.balloon, E.inOutSine) * (1 - ramp(t, c.stop + 0.3, c.stop + 0.55));
    // the push
    if (t > c.pushes - 0.2 && t < c.stop + 0.35) G.push = { down: ramp(t, c.pushes, c.pushes + 0.5), up: ramp(t, c.lungs - 0.05, c.lungs + 0.4), eq: ramp(t, c.lungs_end - 0.05, c.lungs_end + 0.2) };
    // the caves
    if (t > c.hidden - 0.2) {
      G.caves = ramp(t, c.hidden - 0.15, c.hidden + 0.25);
      const flush = ramp(t, c.caves + 0.25, c.face1_end - 0.05, E.inOutSine);
      const back = ramp(t, c.rewind, c.rewind + 0.12);                 // the tape runs back: fog again
      const blast = ramp(t, c.blast, c.blast + 0.3, (x) => x);
      const fogNow = t < c.rewind ? 1 - flush : 1 - blast;
      G.fog = { L: fogNow, R: fogNow, M: fogNow };
      G.flush = t < c.rewind ? flush : blast;
      G.sparkle = t < c.rewind ? ramp(t, c.face1_end - 0.3, c.face1_end + 0.1) * (1 - back) : 0;
      G.hum = (t > c.airs && t < c.face1_end) || t > c.blast ? 1 : 0;
      G.breath = t > c.barely - 0.1 && t < c.encore_in ? ramp(t, c.barely - 0.1, c.barely + 0.15) * (1 - ramp(t, c.them_end + 0.1, c.them_end + 0.4)) : 0;
      G.bunny = t > c.rewind ? { k: ramp(t, c.rewind + 0.06, c.rewind + 0.3), out: ramp(t, c.blast + 0.02, c.blast + 0.3, (x) => x), zz: t > c.snore ? 1 : 0 } : null;
    }
    S.G = G; A.glass = G;
  }
  // ---------- notes out of his nose: when he hums and nothing blocks it
  S.noteOn = [[-3, c.nose1 - 0.08], [c.letgo + 0.02, c.letgo + 0.42], [c.hum2 - 0.1, c.pinch2 + 0.22], [c.airs - 0.05, c.face1_end + 0.08], [c.blast, D + 2]];
  S.tt = tt;
  return S;
}

// ---------------------------------------------------------------- the camera
function hmCam(t) {
  const c = cu(), D = dur();
  if (t > D - 0.36) return hookCamAt(t - D);
  if (t < c.hum2 - 0.1) return hookCamAt(t);
  if (t < c.weirder - 0.1) return camKeys(t, [
    [c.hum2 - 0.1, 540, 1050, 3.75], [c.hum2 + 0.6, 540, 1076, 4.45], [c.buzzing, 540, 1084, 4.6], [c.buzzing + 0.5, 540, 1094, 4.95],
    [c.outnose + 0.1, 540, 1062, 4.85], [c.lips + 0.2, 540, 1064, 5.0], [c.pinch2 + 0.2, 540, 1072, 4.55], [c.cheeks + 0.3, 540, 1068, 4.45],
    [c.pushes + 0.2, 540, 1092, 4.7], [c.lungs + 0.3, 540, 1100, 4.8], [c.nobuzz, 540, 1100, 4.95], [c.stop + 0.3, 540, 1100, 5.1],
  ]);
  if (t < c.encore_in - 0.1) return camKeys(t, [[c.weirder - 0.1, 540, 1100, 5.1], [c.weirder + 0.8, 540, 1046, 4.4], [c.hidden, 540, 1046, 4.6], [c.barely, 540, 1048, 4.75], [c.encore_in, 540, 1046, 4.6]]);
  return camKeys(t, [[c.encore_in - 0.1, 540, 1046, 4.6], [c.blast - 0.1, 540, 1044, 4.45], [D - 0.36, 540, 1040, 4.22]]);
}
function hookCamAt(tt) {
  const c = cu();
  const z = 4.22 + 0.24 * ramp(tt, c.pinch1 - 0.3, c.puff1 + 0.2, E.inOutSine) - 0.5 * ramp(tt, c.voice - 0.1, c.room + 0.4, E.inOutSine);
  const y = 1040 + 10 * ramp(tt, c.voice - 0.1, c.room + 0.4, E.inOutSine);
  return { x: 540, y, zoom: z, rot: 0, sx: 3 * bumpAt(tt, c.puff1, 14) * Math.sin(tt * 70) };
}

// ---------------------------------------------------------------- one frame of the world (every shot draws this)
function hmFrame(t) {
  const c = cu(), D = dur(), S = hmState(t), cam = hmCam(t);
  mirRoom(cam, t, { night: false });
  applyCam(cam);
  const H = hmHero(cam, t, S.A);
  applyCam(cam);
  // notes out of each nostril (they sit in the air in front of him)
  for (const [P, s] of [[H.nostL, -1], [H.nostR, 1]]) hmNotes(t, P, s, { on: S.noteOn, D, s: 1 });
  // the dust bunny, out of his nose and away across the frame
  if (t > c.blast + 0.28) {
    const u = clamp((t - c.blast - 0.28) / 0.55);
    if (u < 1) {
      const P = [H.nostL[0] - 260 * u, H.nostL[1] + 30 * u - 160 * u * u * 0.4 - 90 * Math.sin(Math.PI * u)];
      ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(u * 9); ctx.scale(1.4, 1.4);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 6.2 + 1.4 * hash(i * 5); line(ctx, Math.cos(a) * 3, Math.sin(a) * 3, Math.cos(a) * r, Math.sin(a) * r, 2.2, '#B9B4C8'); }
      circle(ctx, 0, 0, 5.4, '#CFCADC'); for (const e of [-1, 1]) circle(ctx, e * 2.2, -0.6, 1.4, '#3A3450'); ellipse(ctx, 0, 2.4, 1.4, 1.6, '#3A3450');
      ctx.restore();
    }
  }
  return { S, H, cam };
}

// ---------------------------------------------------------------- labels (screen space)
function hmTag(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
// world point -> screen point under a camera
const hmScr = (cam, p) => [W / 2 + (cam.sx || 0) + (p[0] - cam.x) * cam.zoom, H / 2 + (cam.sy || 0) + (p[1] - cam.y) * cam.zoom];

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu(), F = hmFrame(t);
  // the jolt of the choke: the camera kicks, a squeak burst at his nose
  return { glow: 0.85, zblur: 0.05 * bumpAt(t, c.puff1, 10), push: { k: 1, cx: 540, cy: 900 } };
};

SC.inside = (lt, t, shot) => {
  const c = cu(), F = hmFrame(t), cam = F.cam, P = F.H.at;
  // the push: what pushes, in words a ten-year-old uses
  const vb = hmScr(cam, P(HM.vbox[0], HM.vbox[1]));
  hmTag('PUSH BACK', vb[0] - 262, vb[1] - 128, '#7FE9FF', popK(t, c.pushes + 0.1, c.stop + 0.2), 44);
  hmTag('LUNGS', vb[0] - 262, vb[1] + 112, '#FF9A3C', popK(t, c.lungs, c.stop + 0.2), 44);
  hmTag('=', vb[0] - 262, vb[1] - 8, '#FFD447', popK(t, c.lungs_end, c.stop + 0.2), 54);
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 } };
};

SC.caves = (lt, t, shot) => {
  const c = cu(), F = hmFrame(t), cam = F.cam, P = F.H.at;
  const sl = hmScr(cam, P(HM.sinL[0], HM.sinL[1]));
  hmTag('SINUSES', 540, 470 + 0 * sl[1], '#4DFFB4', popK(t, c.caves, c.rewind - 0.05), 40);
  // the tape runs back
  const rw = popK(t, c.rewind - 0.02, c.rewind + 0.28, 0.04, 0.06);
  if (rw > 0.01) { screenSpace(); for (const dx of [0, 46]) { ctx.beginPath(); ctx.moveTo(250 + dx, 560); ctx.lineTo(296 + dx, 528); ctx.lineTo(296 + dx, 592); ctx.closePath(); ctx.fillStyle = rgba('#FFFFFF', 0.92 * rw); ctx.fill(); } }
  // the bunny snores on
  if (t > c.snore) { const z = hmScr(cam, P(HM.sinL[0] - 4, HM.sinL[1] - 12)); mirZ(z[0], z[1], t, c.snore, 3.2, 1 - ramp(t, c.encore_in + 0.6, c.blast)); }
  return { glow: 0.85, vhs: 0.45 * rw, push: { k: 1, cx: 540, cy: 960 } };
};

SC.button = (lt, t, shot) => {
  const c = cu(), F = hmFrame(t);
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 } };
};

// ---------------------------------------------------------------- the cover: pinched, cheeks ballooned, padlocked
SC.cover = (lt, t) => {
  const c = cu(), tc = c.puff1 + 0.3, S = hmState(tc);
  S.A.lock = { k: 1, shut: 1, off: 0 };
  S.A.face = HF.shock;
  const cam = { x: 540, y: 986, zoom: 4.3, rot: 0 };
  mirRoom(cam, tc, { night: false });
  applyCam(cam);
  hmHero(cam, tc, S.A);
  screenSpace();
  bigWord('PINCH IT,', 540, 560, 150, '#FFFFFF', 1, -0.04);
  bigWord('NOW HUM!', 540, 720, 176, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};
setLights({ hook: MORN_LIGHT, inside: GLASS_LIGHT, caves: GLASS_LIGHT, button: MORN_LIGHT, cover: MORN_LIGHT });

// "z z z" up and to the left (screen space, from blocked-nostril)
function mirZ(x, y, t, t0, s = 1, a = 1) {
  if (t < t0 || a <= 0.01) return;
  const d = t - t0;
  screenSpace();
  for (const c of [ctx, gctx]) {
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) {
      if (d < i * 0.2) continue;
      const p = ((d - i * 0.2) * 0.9) % 1, px = x - (6 + p * 26) * s + Math.sin(p * 7 + i) * 3 * s, py = y - p * 40 * s, sz = (7 + p * 9 + i * 1.5) * s, al = Math.sin(Math.PI * p) * a;
      c.font = `900 ${sz}px Montserrat`;
      c.save(); c.translate(px, py); c.rotate(-0.25 + 0.2 * Math.sin(p * 5 + i));
      if (c === ctx) { c.lineWidth = sz * 0.2; c.strokeStyle = `rgba(10,14,40,${0.75 * al})`; c.strokeText('z', 0, 0); c.fillStyle = `rgba(226,236,255,${al})`; c.fillText('z', 0, 0); }
      else { c.fillStyle = `rgba(150,180,255,${0.5 * al})`; c.fillText('z', 0, 0); }
      c.restore();
    }
    c.restore();
  }
}

function initScenes2() {
  initMirror();
}
