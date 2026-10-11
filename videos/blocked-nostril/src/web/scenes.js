// Why Is One Nostril ALWAYS Blocked? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
// the strongest of a list of pulses at time t: each is on for `len` seconds, with soft edges
const pulseOf = (t, times, len = 0.16) => times.reduce((m, f) => Math.max(m, clamp((t - f) / 0.03) * clamp((f + len - t) / 0.05)), 0);
// a decaying bump after a moment
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the bathroom in the morning: the window is on the left (the key), the room behind him is out of focus
const MORN_LIGHT = { ...flipLight(LIGHTS.day), pool: 0.44, halo: 0.1, dof: 0.9 };
// the same room in the evening, with a cold: one warm wall light on the left, the moon in the window
const EVE_LIGHT = { ...LIGHTS.candle, pool: 0.62, halo: 0.14, dof: 0.9 };
// inside his nose
const IN_LIGHT = { ...LIGHTS.inside, pool: 0.34, halo: 0 };

// ---------------------------------------------------------------- his faces
const MF = {
  // cross-eyed, down his own nose: this is a test
  aim: { eyeOpen: 1.0, pupil: 0.95, lookX: 0, lookY: 0.9, browY: 0.3, browTilt: -0.4, mouth: 'flat', mouthOpen: -0.2, blink: 0.08, cross: 1 },
  // breathing in, hard
  pull: { eyeOpen: 1.22, pupil: 0.8, lookX: 0, lookY: 0.7, browY: 1.2, browTilt: 0.3, mouth: 'flat', mouthOpen: -0.5, blink: 0, cross: 1 },
  // harder
  strain: { eyeOpen: 0.9, pupil: 0.9, lookX: 0, lookY: 0.5, browY: -0.5, browTilt: -1.2, mouth: 'grimace', mouthOpen: 1, blink: 0.5, cross: 1, squeeze: 0.8 },
  // nothing. Really?
  huh: { eyeOpen: 1.3, pupil: 0.62, lookX: 0, lookY: 0.2, browY: 1.4, browTilt: 0.5, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  // the other one works: air
  ahh: { eyeOpen: 0.95, pupil: 1, lookX: 0, lookY: -0.1, browY: 0.8, browTilt: 0.3, mouth: 'flat', mouthOpen: 2.4, blink: 0.34, cross: 0 },
  // what is hanging out of my nose
  signs: { eyeOpen: 1.26, pupil: 0.74, lookX: 0, lookY: 1, browY: 1.3, browTilt: 0.6, mouth: 'flat', mouthOpen: -0.4, blink: 0, cross: 1 },
  // a look at the lazy one
  side: { eyeOpen: 1.0, pupil: 0.9, lookX: -0.95, lookY: 0.75, browY: 0.1, browTilt: -0.7, mouth: 'flat', mouthOpen: -0.6, blink: 0.2, cross: 0 },
  // a cold
  sick: { eyeOpen: 0.86, pupil: 1, lookX: 0, lookY: 0.25, browY: -0.3, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3, blink: 0.52, cross: 0 },
  gasp: { eyeOpen: 1.2, pupil: 0.8, lookX: 0, lookY: 0, browY: 0.9, browTilt: 1.2, mouth: 'o', mouthOpen: 0.42, blink: 0.1, cross: 0 },
  // a jar: let's see
  sniff: { eyeOpen: 1, pupil: 1, lookX: -0.5, lookY: 0.9, browY: 0.8, browTilt: 0.1, mouth: 'flat', mouthOpen: 0.4, blink: 0.1, cross: 0 },
  right: { eyeOpen: 1.1, pupil: 0.9, lookX: 0.95, lookY: 0.5, browY: 0.9, browTilt: 0.1, mouth: 'flat', mouthOpen: 1.6, blink: 0, cross: 0 },
  left: { eyeOpen: 1.0, pupil: 0.9, lookX: -0.95, lookY: 0.5, browY: 0.2, browTilt: 0.5, mouth: 'flat', mouthOpen: -0.4, blink: 0.1, cross: 0 },
  deep: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: 0.5, mouth: 'flat', mouthOpen: 0.6, blink: 1, cross: 0 },
  puzzled: { eyeOpen: 1.12, pupil: 0.85, lookX: 0, lookY: -0.4, browY: 0.9, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  // go on
  sly: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.0, browTilt: -0.3, mouth: 'flat', mouthOpen: 2.2, blink: 0.12, cross: 0 },
};
const RED = '#D8344A', GREEN = '#0FA352';
const SIGN_BREAK = { txt: 'ON BREAK', col: RED }, SIGN_SHIFT = { txt: 'ON SHIFT', col: GREEN };

// ---------------------------------------------------------------- small things
// "z z z" out of a nostril, up and to the left (world units under the camera)
function mirZ(x, y, t, t0, s = 1, a = 1) {
  if (t < t0 || a <= 0.01) return;
  const d = t - t0;
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
// a no-entry disc (screen space)
function noEntry(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.1);
  circle(ctx, 0, 0, r + 7, '#FFFFFF'); circle(ctx, 0, 0, r, '#E2283C'); rrect(ctx, -r * 0.62, -r * 0.17, r * 1.24, r * 0.34, r * 0.1); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.restore();
  softDot(gctx, x, y, r * 2.4, '#FF4D5E', 0.5 * clamp(k));
}
// a green tick in a disc (screen space)
function okTick(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#12B25C');
  ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, r * 2.4, '#4DFFB4', 0.5 * clamp(k));
}
// a small filled tag (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
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
// two arrows chasing each other round a point: they swap (screen space)
function swapArrows(x, y, r, k, rot) {
  if (k <= 0.01) return;
  screenSpace();
  for (const [cc, w, col] of [[ctx, 20, '#0B0B1A'], [ctx, 12, '#FFD447'], [gctx, 22, 'rgba(255,212,71,0.5)']]) {
    cc.save(); cc.translate(x, y); cc.rotate(rot); cc.scale(clamp(k, 0, 1.1), clamp(k, 0, 1.1));
    for (const a0 of [0, Math.PI]) {
      cc.beginPath(); cc.arc(0, 0, r, a0 + 0.35, a0 + Math.PI - 0.55); cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = col; cc.stroke();
      const a1 = a0 + Math.PI - 0.55, hx = Math.cos(a1) * r, hy = Math.sin(a1) * r;
      cc.save(); cc.translate(hx, hy); cc.rotate(a1 + Math.PI / 2);
      cc.beginPath(); cc.moveTo(w * 1.5, 0); cc.lineTo(-w * 0.9, -w * 1.25); cc.lineTo(-w * 0.9, w * 1.25); cc.closePath(); cc.fillStyle = col; cc.fill(); cc.restore();
    }
    cc.restore();
  }
}
// his face in a round frame (screen space): where we are
function faceDisc(x, y, r, t, face, k, nose) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paint(() => {
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
    ctx.fillStyle = '#2A8A8E'; ctx.fillRect(-r, -r, 2 * r, 2 * r);
    const st = mirSt({ face }), q = r / 96;
    ctx.scale(q, q); ctx.translate(-MIR_HEAD[0], -MIR_HEAD[1] - 6);
    drawCharacterRig(ctx, st, t, MIRPAL);
    ctx.translate(st.x, st.y); mirInHead(ctx, st, (c) => mirNose(c, MIRPAL, nose || {}, t));
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#BFF0FF'; ctx.stroke();
  });
  ctx.restore();
}

// ================================================================ the state of the inside of his nose, at any time
function secState(t) {
  const c = cu();
  const fill = ramp(t, c.fills - 0.05, c.blood_end + 0.1, E.inOutSine), swell = ramp(t, c.swells - 0.1, c.shut2 + 0.05, E.inOutCubic);
  let kL = 0.6 + 0.14 * fill + 0.26 * swell + 0.035 * bumpAt(t, c.squeak, 7) * Math.sin((t - c.squeak) * 42);
  let kR = 0.36 * (1 - ramp(t, c.opens - 0.14, c.wide + 0.06, E.outBack));
  const sw = ramp(t, c.swap - 0.04, c.swap + 0.46, E.outBack);
  kL = kL * (1 - sw); kR = kR + (1 - kR) * sw;
  return {
    k: { L: kL, R: kR },
    blood: { L: ramp(t, c.fills - 0.1, c.fills + 0.25) * (1 - ramp(t, c.shut2, c.shut2 + 0.4)), R: ramp(t, c.swap - 0.1, c.swap + 0.12) * (1 - ramp(t, c.swap + 0.5, c.swap + 0.85)) },
    sleep: { L: ramp(t, c.nearly - 0.05, c.nearly + 0.1) * (1 - ramp(t, c.swap, c.swap + 0.08)), R: ramp(t, c.swap + 0.28, c.swap + 0.4) },
    hat: { L: ramp(t, c.swap + 0.2, c.swap + 0.42, E.outBack), R: ramp(t, c.wide - 0.02, c.wide + 0.2, E.outBack) * (1 - ramp(t, c.swap - 0.02, c.swap + 0.1)) },
  };
}

// ================================================================ the mirror: frame 1 and round it
const WIN_R = 22, WIN_Y = 23;                                // the window on his nose, in head units
// the opening, as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu();
  const arrive = ramp(tt, -0.36, -0.1, E.inOutCubic);                         // the finger comes in to the wing
  const press = ramp(tt, -0.14, 0.0, E.outBack) * (1 - ramp(tt, c.relax - 0.08, c.relax + 0.06));
  const letgo = ramp(tt, c.relax - 0.04, c.relax + 0.36, E.inOutCubic);       // ... and he lets go
  const pull = ramp(tt, -0.06, 0.2) * (1 - ramp(tt, c.blocked + 0.03, c.blocked + 0.16));   // he breathes in: nothing comes
  const strain = ramp(tt, c.shut, c.blocked - 0.08, E.inOutSine) * (1 - ramp(tt, c.blocked + 0.02, c.blocked + 0.14));
  const breathe = ramp(tt, c.relax + 0.2, c.relax + 0.55) * (1 - ramp(tt, c.shifts - 0.3, c.shifts - 0.08));   // through the other one: easy (until the signs drop)
  const drop = ramp(tt, c.shifts - 0.05, c.shifts + 0.34, E.outBack), drop2 = ramp(tt, c.shifts + 0.06, c.shifts + 0.44, E.outBack);
  const gone = ramp(tt, c.dive - 0.1, c.dive + 0.08);
  const win = ramp(tt, c.break - 0.02, c.break + 0.22, E.outBack);
  const swing = tt > c.shifts ? 0.4 + 1.4 * Math.exp(-(tt - c.shifts) * 2.2) : 0;
  let face = lerpFace(MF.aim, MF.pull, ramp(tt, 0.0, 0.26));
  face = lerpFace(face, MF.strain, strain);
  face = lerpFace(face, MF.huh, ramp(tt, c.blocked, c.blocked + 0.09));
  face = lerpFace(face, MF.ahh, ramp(tt, c.relax + 0.2, c.relax + 0.5));
  face = lerpFace(face, MF.signs, ramp(tt, c.shifts + 0.02, c.shifts + 0.16));
  face = lerpFace(face, MF.side, ramp(tt, c.that - 0.02, c.that + 0.16));
  face = { ...face, blink: Math.max(face.blink || 0, pulseOf(tt, [c.nostrils + 0.1], 0.12)) };
  const sn = Math.sin(tt * 5.2);
  const A = {
    face,
    armR: mirArmMix(mirArmMix(MIR_ARM.off, MIR_ARM.on, arrive), MIR_ARM.rest, letgo),
    finger: { side: 1, k: press, on: 1 - ramp(tt, c.relax - 0.02, c.relax + 0.16) },
    nose: { block: { L: 0.96, R: 0.04 }, flare: { L: pull * (0.75 + 0.25 * Math.sin(tt * 31)), R: breathe * (0.45 + 0.4 * sn) }, quiver: strain },
    signs: { L: { ...SIGN_BREAK, k: drop * (1 - gone), swing }, R: { ...SIGN_SHIFT, k: drop2 * (1 - gone), swing: swing * 0.8 } },
    headDY: -2.2 * pull + 1.3 * strain * Math.sin(tt * 43) + 3 * bumpAt(tt, c.blocked, 7) - 1.6 * breathe * sn,
    headRot: 0.03 * strain * Math.sin(tt * 37) - 0.025 * ramp(tt, c.that, c.that + 0.25),
    bob: 1.2 * Math.sin(tt * 2.3) - 2.5 * pull,
    post: (lc, rr, st) => mirInHead(lc, st, (hc) => nasMini(hc, 0, WIN_Y, WIN_R, tt, { ...secState(tt), air: 1 }, win)),
  };
  return { A, pull, strain, breathe, win };
}
function hookCam(tt) {
  const c = cu();
  const k = camKeys(tt, [[-0.4, 540, 1066, 4.16], [0, 540, 1066, 4.2], [0.3, 540, 1063, 4.8], [c.other, 540, 1062, 4.95], [c.blocked + 0.12, 537, 1060, 5.4],
    [c.relax + 0.5, 540, 1068, 4.4], [c.shifts, 540, 1070, 4.45], [c.that, 538, 1072, 4.7], [c.break + 0.1, 536, 1070, 5.4], [c.dive, 536, 1069, 5.5]], E.inOutCubic);
  if (tt >= 0 && tt < 0.3) { const u = E.outCubic(tt / 0.3); k.zoom = lerp(4.2, 4.8, u); k.y = lerp(1066, 1063, u); }   // the first push is quick off the mark
  return k;
}
// the room and him. o: {cam, A, night, after: fn(H)}
function mirrorDraw(t, o) {
  mirRoom(o.cam, t, { night: o.night });
  const H = mirHero(o.cam, t, o.A);
  applyCam(o.cam);
  if (o.after) o.after(H);
  return H;
}

// ================================================================ shots
SC.hook = (lt, t, shot) => {
  const c = cu(), S = hookA(t), cam = hookCam(t);
  const dive = ramp(t, c.dive, shot.end, E.inCubic);
  if (dive > 0) {   // into the window on his nose: it ends where the next shot's section is
    const NW = mirHeadPt(mirSt(S.A), 0, WIN_Y), P0 = toScreen(cam, NW[0], NW[1]);
    Object.assign(cam, scaledCam(cam, NW, 1 + (NAS_MINI / (WIN_R * cam.zoom) - 1) * dive));
    cam.sx = (NAS.cx - P0[0]) * dive; cam.sy = (NAS.cy - 12 - P0[1]) * dive;
  }
  const H = mirrorDraw(t, { cam, A: S.A, after: (Hh) => {
    mirAir(t, Hh.nostL, { k: S.pull * (1 - dive), blocked: 1, seed: 2 });
    mirAir(t, Hh.nostR, { k: S.breathe, seed: 6, speed: 1.5 });
    mirZ(Hh.nostL[0] - 3, Hh.nostL[1] - 8, t, c.snore - 0.3, 1.2, (1 - dive) * ramp(t, c.snore - 0.3, c.snore - 0.1));
  } });
  // the sniff stops dead
  const N = toScreen(cam, H.nostL[0], H.nostL[1]);
  noEntry(clamp(N[0] - 190, 150, 900), N[1] + 70, 58, pulseOf(t, [c.blocked + 0.02], c.relax - c.blocked + 0.05));
  const hit = bumpAt(t, c.blocked, 6);
  if (hit > 0.05) shockLines(N[0], N[1], 70, 1 - hit, 9, '#FFFFFF', 3);
  return { glow: 0.85, zblur: 0.34 * dive, zcx: lerp(540, NAS.cx, dive), zcy: lerp(900, NAS.cy, dive), flash: 0.1 * hit };
};

// ================================================================ inside his nose
function insideBg(t) {
  darkBg('#5A1E4E', '#170718');
  motes(t, 0.35);
}
SC.mech = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  insideBg(t);
  const V = sectionCam(lt, [[0, 0, 0, 1.0, NAS.cy], [c.inside - T0 + 0.1, 0, 30, 1.12, NAS.cy + 20], [c.fills - T0 + 0.25, -122, 96, 1.42, 880], [c.shut2 - T0 + 0.25, -128, 104, 1.52, 880],
    [c.while - T0 + 0.05, -128, 104, 1.52, 880], [c.opens - T0 + 0.1, 126, 98, 1.44, 880], [D, 120, 98, 1.52, 880]]);
  const S = secState(t);
  // "Spongy tissue": the six shelves bounce, one after the other, from the bottom up
  const pulse = (li, sd) => { const dt = t - (c.spongy + 0.04 + 0.075 * (li * 2 + (sd === 'R' ? 1 : 0))); return dt < 0 ? 0 : 0.2 * Math.exp(-dt * 7) * Math.sin(dt * 30); };
  nasOn(V, t, { ...S, air: 1, pulse });
  // snoring, on the side that has shut
  const F = nasPt(V, ...nasFace('L', S.k.L));
  screenSpace(); zzz(F[0] - 10, F[1] - 90 * V.s, t, c.shut2 - 0.1, 1 - ramp(t, c.while + 0.2, c.while + 0.5), 0.5);
  // where we are, and what this is
  faceDisc(196, 566, 92, t, MF.side, ramp(lt, 0.12, 0.4) * (1 - ramp(t, c.fills - 0.2, c.fills - 0.02)), { block: { L: 0.96, R: 0.04 } });
  const lk = ramp(t, c.spongy + 0.05, c.spongy + 0.3) * (1 - ramp(t, c.fills - 0.2, c.fills - 0.04));
  const T1 = nasPt(V, 150, 6);
  leader([760, 534], [T1[0], T1[1]], lk >= 0.99 ? 1 : lk, '#FF86A6'); pill(782, 500, 'SPONGY TISSUE', '#FF86A6', lk, 36);
  // blood in
  const bk = ramp(t, c.blood - 0.06, c.blood + 0.16) * (1 - ramp(t, c.while - 0.05, c.while + 0.12));
  tagPill('BLOOD IN', 262, 566, '#FF5A6E', bk, 44, '#FFFFFF');
  if (bk > 0.02) { const a = (t * 2.2) % 1; screenSpace(); for (const cc of [ctx, gctx]) for (let i = 0; i < 3; i++) { const y = 620 + i * 34 + 30 * a; line(cc, 244, y, 262, y + 16, 9, rgba('#FF5A6E', bk * (1 - Math.abs(i + a - 1.5) / 2))); line(cc, 280, y, 262, y + 16, 9, rgba('#FF5A6E', bk * (1 - Math.abs(i + a - 1.5) / 2))); } }
  // wide open
  tagPill('WIDE OPEN', 786, 566, '#4DFFB4', ramp(t, c.wide - 0.05, c.wide + 0.16), 44);
  const arrive = ramp(lt, 0, 0.3);
  return { glow: 0.9, zblur: 0.3 * (1 - arrive), zcx: NAS.cx, zcy: NAS.cy, flash: 0.26 * (1 - ramp(lt, 0, 0.16)) + 0.06 * bumpAt(t, c.squeak, 9) };
};

// ================================================================ every few hours, they swap
SC.swap = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  insideBg(t);
  const s = 0.9 * (1 + 0.03 * lt / D), V = { x: 540, y: 925, s };
  const S = secState(t), fl = ramp(t, c.swap - 0.02, c.swap + 0.3, E.inOutCubic);
  const sway = 0.3 + 1.2 * bumpAt(t, c.swap, 2.5);
  nasOn(V, t, { ...S, air: 1, signs: { L: { ...SIGN_BREAK, txt2: SIGN_SHIFT.txt, col2: SIGN_SHIFT.col, k: 1, flip: fl, swing: sway }, R: { ...SIGN_SHIFT, txt2: SIGN_BREAK.txt, col2: SIGN_BREAK.col, k: 1, flip: fl, swing: sway } } });
  // the clock, and how long a shift is
  const spin = 2 + 6 * ramp(t, c.every - 0.1, c.swap + 0.2, E.inOutSine);
  actor(() => nasClock(322, 506, 80, spin, ramp(lt, 0.02, 0.26)));
  pill(734, 486, '~ 2 HOURS', '#FFD447', ramp(t, c.hours - 0.04, c.hours + 0.18), 48);
  tagPill('IT VARIES A LOT', 734, 566, '#C8A8FF', ramp(t, c.hours + 0.22, c.hours + 0.42), 27);
  // ... they swap
  const ak = ramp(t, c.swap - 0.03, c.swap + 0.14, E.outBack) * (1 - ramp(t, shot.end - 0.14, shot.end));
  swapArrows(V.x, V.y + 40 * s, 150 * s, ak, -1.2 + 5.5 * ramp(t, c.swap - 0.03, c.swap + 0.75, E.outCubic));
  return { glow: 0.9, capY: 1524, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.16 * bumpAt(t, c.swap, 8) };
};

// ================================================================ the same mirror, with a cold
SC.cold = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 512, 1071, 3.9], [D, 514, 1069, 4.12]]);
  const both = ramp(t, c.both - 0.03, c.both + 0.26, E.inOutCubic), gasp = ramp(t, c.gasp - 0.04, c.gasp + 0.1);
  let face = { ...MF.sick, blink: Math.max(0.52, pulseOf(t, [c.notice], 0.13)) };
  face = lerpFace(face, { ...MF.sick, lookY: 1, cross: 1, eyeOpen: 1.1, blink: 0.1, browY: 0.8 }, ramp(t, c.swells2, c.swells2 + 0.15) * (1 - gasp));
  face = lerpFace(face, MF.gasp, gasp);
  const sw = 0.3 + 1.3 * bumpAt(t, c.both, 2.4);
  const A = {
    face, blanket: 1, ambient: 0.1,
    nose: { red: 0.95, block: { L: lerp(0.2, 1, ramp(t, c.swells2 - 0.05, c.both + 0.05, E.inOutCubic)), R: 1 }, quiver: 0.3 },
    signs: { L: { ...SIGN_SHIFT, txt2: SIGN_BREAK.txt, col2: SIGN_BREAK.col, k: 1, flip: both, swing: sw }, R: { ...SIGN_BREAK, k: 1, swing: 0.4 } },
    headDX: 0.9 * Math.sin(t * 39), headDY: 1.2 * Math.sin(t * 2.6) - 3 * gasp, bob: 1.2 * Math.sin(t * 2.6),
  };
  mirrorDraw(t, { cam, A, night: true });
  // inside: both sides swell
  const kL = lerp(0.18, 1.08, ramp(t, c.swells2 - 0.08, c.both + 0.05, E.inOutCubic));
  screenSpace();
  nasMini(ctx, 236, 640, 128, t, { k: { L: kL, R: 1.08 }, sleep: { L: kL > 0.8 ? 1 : 0, R: 1 }, hat: { L: 1 - ramp(t, c.swells2, c.swells2 + 0.1), R: 0 }, blood: { L: ramp(t, c.swells2 - 0.1, c.swells2 + 0.1) * (1 - both), R: 0 }, air: 1 }, ramp(lt, 0.1, 0.36, E.outBack));
  // the cold itself
  actor(() => mirGerm(ctx, 900, 560 + 10 * Math.sin(t * 3.1), 1.2, t, ramp(t, c.cold - 0.08, c.cold + 0.14, E.outBack)));
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) + 0.1 * bumpAt(t, c.both + 0.1, 8) };
};

// ================================================================ a jar under his nose: a fast lane and a slow lane
// a dark badge with an icon and a word (screen space): FAST with streaks, SLOW with a snail
function laneBadge(x, y, txt, col, k, t, icon) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2), w = 268, h = 92;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = '#0B0F2A'; ctx.fill();
  paint(() => {
    rrect(ctx, -w / 2, -h / 2, w, h, 26); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    ctx.font = '900 50px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(txt, 44, 3);
    if (icon === 'snail') mirSnail(ctx, -84 + 5 * Math.sin(t * 1.4), 2, 0.6, t);
    else for (let i = 0; i < 3; i++) { const u = (t * 2.6 + i / 3) % 1; line(ctx, -62 - 44 * u, -20 + i * 20, -98 - 44 * u + 30 * u, -20 + i * 20, 7, rgba(col, 1 - u)); }
  });
  ctx.restore();
  gctx.save(); gctx.translate(x, y); gctx.scale(s, s); rrect(gctx, -w / 2, -h / 2, w, h, 26); gctx.fillStyle = '#000000'; gctx.fill(); gctx.lineWidth = 8; gctx.strokeStyle = rgba(col, 0.4); gctx.stroke(); gctx.restore();   // black in the glow layer: the window's bloom does not wash it out
}
// a thought bubble with a dark edge, so it reads in front of a bright window (screen space); the tail goes to (tx, ty)
function thinkBubble(x, y, w, h, k, tx, ty) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.6), n = 14;
  screenSpace();
  for (const [grow, col] of [[9, '#10142E'], [0, '#F6F8FF']]) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; circle(ctx, Math.cos(a) * w * 0.44, Math.sin(a) * h * 0.42, Math.min(w, h) * 0.2 + grow, col); }
    ellipse(ctx, 0, 0, w * 0.47 + grow, h * 0.45 + grow, col);
    ctx.restore();
    for (let i = 0; i < 3; i++) { const f = 0.3 + i * 0.25; circle(ctx, lerp(x, tx, f), lerp(y + h * 0.4, ty, f), (24 - i * 6) * s + grow, col); }
  }
  gctx.save(); gctx.translate(x, y); gctx.scale(s, s); ellipse(gctx, 0, 0, w * 0.56, h * 0.55, '#000000'); gctx.restore();   // no bloom through it
}
// smell on its way from the jar to a nostril: beads of two colours along a curve (world units, camera applied)
function scentLane(t, a, b, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.02) return;
  const n = o.n || 8, sp = o.speed || 1, mx = (a[0] + b[0]) / 2 + (o.bow || 0), my = Math.max(a[1], b[1]) + 16;
  for (let i = 0; i < n; i++) {
    const p = ((t * sp + i / n) % 1 + 1) % 1, q = 1 - p;
    const x = q * q * a[0] + 2 * q * p * mx + p * p * b[0] + 1.6 * Math.sin(p * 9 + i), y = q * q * a[1] + 2 * q * p * my + p * p * b[1];
    const al = k * Math.sin(Math.PI * Math.min(1, p * 1.5) * 0.5) * clamp((1 - p) * 5), col = i % 2 ? '#5BE08F' : '#C3B2F2';
    if (o.streak) { const p2 = Math.max(0, p - 0.05), q2 = 1 - p2; line(ctx, q2 * q2 * a[0] + 2 * q2 * p2 * mx + p2 * p2 * b[0], q2 * q2 * a[1] + 2 * q2 * p2 * my + p2 * p2 * b[1], x, y, 2.2, rgba(col, 0.6 * al)); }
    circle(ctx, x, y, 3.6, rgba('#0B0F2A', 0.55 * al)); circle(ctx, x, y, 2.9, rgba(col, al)); softDot(gctx, x, y, 6, col, 0.22 * al);
  }
}
SC.weird = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0;
  const cam = camKeys(lt, [[0, 536, 1070, 4.3], [0.5, 536, 1071, 4.0], [c.so - T0, 536, 1072, 4.06], [D, 536, 1070, 4.2]]);
  const up = ramp(lt, 0.0, 0.34, E.outBack), fast = ramp(t, c.one1 - 0.05, c.fast + 0.05), slow = ramp(t, c.one2 - 0.05, c.slow + 0.05);
  const smell = ramp(t, c.so - 0.1, c.each + 0.2), diff = ramp(t, c.little - 0.02, c.differently + 0.1);
  let face = lerpFace(MF.sniff, MF.right, ramp(t, c.one1 - 0.08, c.one1 + 0.1));
  face = lerpFace(face, MF.left, ramp(t, c.one2 - 0.08, c.one2 + 0.1));
  face = lerpFace(face, MF.deep, ramp(t, c.so - 0.05, c.so + 0.14));
  face = lerpFace(face, MF.puzzled, ramp(t, c.little - 0.04, c.little + 0.12));
  face = lerpFace(face, { ...MF.puzzled, lookX: 0.9, lookY: -0.7 }, ramp(t, c.differently, c.differently + 0.12));
  face = lerpFace(face, { ...MF.puzzled, lookX: -0.9, lookY: -0.7, browTilt: -0.6 }, ramp(t, c.differently_end - 0.2, c.differently_end - 0.05));
  const sn = Math.sin(t * 6);
  const A = {
    face, armL: mirArmMix(MIR_ARM.restL, MIR_ARM.jar, up), jar: { s: 1.3 },
    nose: { block: { L: 0.9, R: 0.04 }, flare: { L: 0.3 * smell * (0.5 + 0.5 * sn), R: 0.5 * Math.max(fast, smell) * (0.5 + 0.5 * sn) } },
    headDY: -1.6 * smell * sn + 1.2 * Math.sin(t * 2.3), headRot: 0.03 * ramp(t, c.one1, c.one1 + 0.2) * (1 - ramp(t, c.one2 - 0.1, c.one2 + 0.1)) - 0.03 * ramp(t, c.one2, c.one2 + 0.2) * (1 - smell), bob: 1.2 * Math.sin(t * 2.3),
  };
  let Hh = null;
  mirrorDraw(t, { cam, A, after: (H) => {
    Hh = H;
    const J = [H.jar[0], H.jar[1] - 9];
    mirAir(t, H.nostR, { k: fast * (1 - smell), seed: 4, speed: 2.6 });
    mirAir(t, H.nostL, { k: slow * (1 - smell), seed: 9, slow: true, col: '#FFD9A8' });
    scentLane(t, J, H.nostR, { k: smell, speed: 1.5, n: 9, streak: true, bow: 6 });
    scentLane(t, J, H.nostL, { k: smell, speed: 0.34, n: 6, bow: -4 });
  } });
  const NR = toScreen(cam, Hh.nostR[0], Hh.nostR[1]), NL = toScreen(cam, Hh.nostL[0], Hh.nostL[1]);
  // one fast ...
  const fk = ramp(t, c.fast - 0.05, c.fast + 0.14) * (1 - ramp(t, c.little - 0.2, c.little - 0.04));
  leader([704, 936], [NR[0] + 22, NR[1] + 8], fk >= 0.99 ? 1 : fk, '#7FE9FF');
  laneBadge(838, 940, 'FAST', '#7FE9FF', fk, t, 'streaks');
  // ... one slow
  const sk = ramp(t, c.slow - 0.05, c.slow + 0.14) * (1 - ramp(t, c.little - 0.2, c.little - 0.04));
  leader([372, 884], [NL[0] - 22, NL[1] + 2], sk >= 0.99 ? 1 : sk, '#FF9A3C');
  laneBadge(238, 880, 'SLOW', '#FF9A3C', sk, t, 'snail');
  // ... so each one makes something else of the same jar
  const b1 = ramp(t, c.differently - 0.1, c.differently + 0.12), b2 = ramp(t, c.differently + 0.1, c.differently + 0.32);
  if (b1 > 0.01) {
    paint(() => {
      thinkBubble(836, 580, 276, 232, b1, 742, 742); thinkBubble(244, 580, 276, 232, b2, 338, 742);
      screenSpace();
      const s1 = E.outBack(clamp(b1), 1.6), s2 = E.outBack(clamp(b2), 1.6);
      if (s1 > 0.02) mintLeaf(ctx, 836, 600, 2.1 * s1, 0.1 * Math.sin(t * 3));
      if (s2 > 0.02) fuelCan(ctx, 244, 590, 1.75 * s2, 0.06 * Math.sin(t * 3 + 1));
    });
  }
  pill(540, 1196, 'ONE STUDY, 1999', '#C8A8FF', ramp(t, c.smells - 0.05, c.smells + 0.18), 34);
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};

// ================================================================ the button: go on, check
SC.button = (lt, t, shot) => {
  const c = cu(), T0 = shot.start, D = shot.end - T0, E0 = hookA(-0.4).A;
  const back = ramp(t, shot.end - 0.5, shot.end - 0.04, E.inOutCubic);          // everything on its way to the picture of frame 1
  const cam = camKeys(lt, [[0, 540, 1068, 4.5], [c.check - T0, 540, 1067, 4.4], [D, 540, 1066, 4.16]]);
  const up = ramp(t, T0 + 0.05, c.go + 0.2, E.inOutCubic);                       // the hand comes up beside his nose
  const cross = ramp(t, c.check - 0.16, c.check + 0.06, E.inOutCubic) * (1 - ramp(t, c.shift - 0.04, c.shift + 0.24, E.inOutCubic));   // ... over to the other nostril, and back
  const pressL = ramp(t, c.check + 0.02, c.check + 0.12, E.outBack) * (1 - ramp(t, c.shift - 0.1, c.shift));
  const easy = ramp(t, c.check + 0.1, c.check + 0.3) * (1 - ramp(t, c.shift - 0.08, c.shift + 0.06));
  let face = lerpFace(MF.sly, { ...MF.sly, browY: 1.5, mouthOpen: 2.8 }, pulseOf(t, [c.go], 0.5));
  face = lerpFace(face, MF.aim, ramp(t, c.check - 0.12, c.check));
  face = lerpFace(face, MF.ahh, easy);
  face = lerpFace(face, E0.face, ramp(t, c.shift, c.shift + 0.2));
  const side = lerp(1, -1, cross), sn = Math.sin(t * 5.2);
  const tap = pulseOf(t, [c.on_end + 0.07, c.on_end + 0.27], 0.1);                 // two taps on the side of his nose: which one?
  const A = {
    face, armR: mirArmMix(mirArmMix(MIR_ARM.rest, mirArmMix(mirArmMix(MIR_ARM.off, MIR_ARM.on, tap), MIR_ARM.left, cross), up), E0.armR, back),
    finger: { side, k: side < -0.9 ? pressL : side > 0.9 ? tap : 0, on: up },
    nose: { block: { L: 0.96, R: 0.04 }, flare: { L: 0, R: easy * (0.5 + 0.4 * sn) } },
    headDY: 1.2 * Math.sin(t * 2.3) * (1 - back) - 1.6 * easy * sn, headRot: 0.03 * pulseOf(t, [c.go], 0.5) * (1 - back), bob: lerp(1.2 * Math.sin(t * 2.3), E0.bob, back),
  };
  let Hh = null;
  mirrorDraw(t, { cam, A, after: (H) => { Hh = H; mirAir(t, H.nostR, { k: easy, seed: 6, speed: 1.9 }); } });
  const NR = toScreen(cam, Hh.nostR[0], Hh.nostR[1]);
  okTick(NR[0] + 190, NR[1] - 120, 50, pulseOf(t, [c.whos], c.shift - c.whos + 0.06));
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.12)) };
};

SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  mirrorDraw(t, { cam, A: S.A, after: (H) => mirAir(t, H.nostL, { k: S.pull, blocked: 1, seed: 2 }) });
  return { glow: 0.85 };
};

// ================================================================ the cover (rendered by src/cover.sh from a one-shot timeline)
SC.cover = (lt, t) => {
  const cam = { x: 540, y: 1092, zoom: 4.1, rot: 0 };
  const A = { face: { ...MF.huh, cross: 1, lookY: 0.9 }, armR: MIR_ARM.on, finger: { side: 1, k: 1 }, nose: { block: { L: 1, R: 0 }, flare: { L: 0.8, R: 0 } },
    signs: { L: { ...SIGN_BREAK, k: 1, swing: 0.5 }, R: { k: 0 } } };
  mirrorDraw(0.5, { cam, A });
  screenSpace();
  bigWord('WHY IS ONE NOSTRIL', 540, 1250, 118, '#FFFFFF', 1, -0.03);
  bigWord('BLOCKED?', 540, 1432, 236, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

setLights({ hook: MORN_LIGHT, loop: MORN_LIGHT, cover: MORN_LIGHT, mech: IN_LIGHT, swap: IN_LIGHT, cold: EVE_LIGHT, weird: MORN_LIGHT, button: MORN_LIGHT });

function initScenes2() {
  initMirror();
}
