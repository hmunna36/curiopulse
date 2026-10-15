// Why Does a Doorknob SHOCK You? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js. Every beat comes from a cue: cu().name (timeline.json).
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place
const HALL_LIGHT = { ...LIGHTS.room, rim: [0.62, 0.82, 1.0], rimFrom: [0.8, -0.3], rimAmt: 1.1, pool: 0.45 };
const SPARK_LIGHT = (lt, t) => ({ ...HALL_LIGHT, rim: [0.6, 0.85, 1.0], rimAmt: 1.1 + 2.2 * bumpAt(t, cu().zap, 6) + 2.2 * bumpAt(t, cu().jump, 5) });
const CARPET_LIGHT = { ...LIGHTS.room, pool: 0.3 };
const STORM_LIGHT = { ...LIGHTS.night, rimAmt: 1.6 };
const BOARD_LIGHT = { ...LIGHTS.room, pool: 0.35 };
setLights({ hook: SPARK_LIGHT, loop: SPARK_LIGHT, cover: SPARK_LIGHT, pile: HALL_LIGHT, dry: HALL_LIGHT, jump: SPARK_LIGHT, button: HALL_LIGHT,
  steps: CARPET_LIGHT, payoff: STORM_LIGHT, weird: LIGHTS.sunset, debate: BOARD_LIGHT });

// ---------------------------------------------------------------- his faces
const DF = {
  reach: { eyeOpen: 0.95, pupil: 1, lookX: 0.85, lookY: 0.45, browY: 0.1, browTilt: 0, mouth: 'flat', mouthOpen: 0.2, blink: 0.15, cross: 0 },
  zap: { eyeOpen: 1.48, pupil: 0.42, lookX: 0.3, lookY: 0, browY: 1.6, browTilt: 0.3, mouth: 'scream', mouthOpen: 1, blink: 0, cross: 0 },
  sting: { eyeOpen: 1.3, pupil: 0.55, lookX: 0.4, lookY: 0.1, browY: 1.2, browTilt: 0.8, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
  peer: { eyeOpen: 1.2, pupil: 0.8, lookX: 0.7, lookY: -0.5, browY: 1.1, browTilt: 0.5, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  down: { eyeOpen: 1.35, pupil: 0.6, lookX: 0, lookY: 1, browY: 1.4, browTilt: 0.5, mouth: 'o', mouthOpen: 0.8, blink: 0, cross: 0 },
  happy: { eyeOpen: 1, pupil: 1, lookX: 0.3, lookY: 0, browY: 0.5, browTilt: -0.2, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0 },
  nervous: { eyeOpen: 1.25, pupil: 0.7, lookX: -0.6, lookY: -0.6, browY: 1, browTilt: 1.2, mouth: 'grimace', mouthOpen: 1, blink: 0, cross: 0 },
  guilty: { eyeOpen: 1.1, pupil: 0.8, lookX: 0.9, lookY: 0.4, browY: 0.8, browTilt: 1.2, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.35, pupil: 0.7, lookX: -0.5, lookY: 0.3, browY: 1.3, browTilt: 0.3, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 },
  huh: { eyeOpen: 1.1, pupil: 0.85, lookX: -0.6, lookY: -0.7, browY: 0.9, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
};

// ---------------------------------------------------------------- small things (screen space)
function tagPill(txt, x, y, col, k, size = 44, ink = '#0B0B1A') {
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
// a comic burst with a word in it (world units, camera applied)
function dsBurst(x, y, r, txt, k, rot = -0.1) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.6), n = 13;
  const star = (c, r0, r1) => {
    c.beginPath();
    for (let i = 0; i < n * 2; i++) { const an = (i / (n * 2)) * Math.PI * 2 + rot, rr = (i % 2 ? r0 : r1 * (0.86 + 0.28 * ((i * 7919) % 13) / 13)) * q; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    c.closePath();
  };
  star(ctx, r * 0.62, r * 1.08); ctx.fillStyle = '#1F6FE0'; ctx.fill();
  star(ctx, r * 0.54, r * 0.94); ctx.fillStyle = '#BFF0FF'; ctx.fill();
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(q, q);
    ctx.font = `400 ${r * 0.62}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = r * 0.07; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText(txt, 0, r * 0.03);
    ctx.fillStyle = '#0B1A40'; ctx.fillText(txt, 0, r * 0.03);
    ctx.restore();
  });
  star(gctx, r * 0.5, r * 0.9); gctx.fillStyle = rgba('#7FD0FF', 0.45); gctx.fill();
}
// a CHARGE meter (screen space): k = pop, v = level 0..1
function chargeMeter(x, y, k, v) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -230, -46, 460, 92, 46); ctx.fillStyle = '#0B1426'; ctx.fill();
  rrect(ctx, -110, -22, 320, 44, 22); ctx.fillStyle = '#22324E'; ctx.fill();
  const col = mixHex('#37C8FF', '#FF5A6E', clamp((v - 0.6) / 0.4));
  if (v > 0.02) { rrect(ctx, -110, -22, 320 * clamp(v), 44, 22); ctx.fillStyle = col; ctx.fill(); softDot(gctx, -110 + 320 * v, 0, 50, col, 0.6); }
  paint(() => { ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('CHARGE', -168, 2); });
  ctx.restore();
}

// ================================================================ the hook: frame 1 and round it
// his state as a function of tt = seconds since frame 1 (negative = the last frames of the Short, on their way here)
function hookA(tt) {
  const c = cu(), z = c.zap;
  const approach = E.inOutSine(inv(-0.9, z, tt));
  let armR = armMix(DS_ARM.restR, DS_ARM.reachR, approach);
  armR = armMix(armR, DS_ARM.yankR, ramp(tt, z, z + 0.14, E.outBack));
  const shakeK = tt > z ? Math.exp(-(tt - z) * 0.9) * (1 - ramp(tt, c.relax - 0.4, c.relax)) : 0;
  armR = { e: armR.e, w: [armR.w[0] + 22 * shakeK * Math.sin(tt * 38), armR.w[1] + 10 * shakeK * Math.cos(tt * 41)] };
  armR = armMix(armR, DS_ARM.showR, ramp(tt, c.relax - 0.15, c.relax + 0.35, E.inOutCubic));
  armR = armMix(armR, DS_ARM.restR, ramp(tt, c.you - 0.1, c.you + 0.3, E.inOutCubic));
  const fl = bumpAt(tt, z, 4);
  const armL = armMix(DS_ARM.restL, { e: [-124, -300], w: [-66, -352] }, fl * 0.9 + 0.6 * ramp(tt, c.you - 0.1, c.you + 0.2) * (1 - ramp(tt, c.every - 0.6, c.every)));
  let face = tt < z ? DF.reach : DF.zap;
  face = lerpFace(face, DF.sting, ramp(tt, z + 0.9, z + 1.3));
  face = lerpFace(face, DF.peer, ramp(tt, c.relax - 0.1, c.relax + 0.2));
  face = lerpFace(face, DF.down, ramp(tt, c.you - 0.1, c.you + 0.15));
  const frizz = tt < z ? 0 : Math.max(0.35, 1.05 * Math.exp(-(tt - z) * 0.8)) + 0.5 * bumpAt(tt, c.you, 3);
  const A = {
    face, armL, armR, finger: tt < z + 0.02 ? 1 : 0, handR: tt > z && tt < c.you + 0.1 ? 'spread' : 'open',
    frizz, lean: -0.04 * fl, headDX: 7 * fl * Math.sin(tt * 70), headDY: -10 * fl, headRot: 0.04 * approach * (tt < z ? 1 : 0),
  };
  const spark = tt < z - 0.02 ? 0 : bumpAt(tt, z - 0.02, 7) * (tt < z + 0.32 ? 1 : 0);
  const charge = 120 * ramp(tt, c.you - 0.35, c.you + 0.35, E.inOutSine);
  return { A, spark, fl, charge, approach };
}
function hookCam(tt) {
  const c = cu(), z = c.zap;
  const k = camKeys(tt, [[-0.4, 520, 1004, 2.2], [0, 518, 1000, 2.28], [z, 530, 1012, 2.38], [z + 0.6, 505, 995, 2.08], [c.thousands, 495, 990, 2.0],
    [c.relax - 0.2, 480, 975, 1.92], [c.relax + 0.5, 462, 955, 2.06], [c.spark + 0.4, 460, 952, 2.12], [c.you - 0.15, 455, 965, 1.85],
    [c.you + 0.35, 420, 1170, 1.08], [c.every - 0.75, 418, 1180, 1.06], [c.every, 400, 1420, 1.55]], E.inOutCubic);
  const sh = 14 * bumpAt(tt, z, 7);
  if (tt >= 0) { k.x += sh * vnoise(tt * 40, 3); k.y += sh * vnoise(tt * 37, 8); }
  return k;
}
function hookDraw(tt, t, o) {
  const c = cu(), S = o.S, cam = o.cam;
  dsHall(cam, t, { knob: { glow: S.spark } });
  applyCam(cam);
  const Hh = dsHero(cam, t, S.A);
  applyCam(cam);
  const KL = [DS.KX - 6 - DS.KR, DS.KY];
  if (S.spark > 0.01) dsSpark(Hh.tip, KL, S.spark, Math.round(t * 30), 1.1);
  dsBurst(DS.KX + 14, DS.KY - 150, 62, 'ZAP!', popK(tt, c.zap, c.zap + 0.95, 0.06, 0.12), -0.12);
  if (tt > c.spark - 0.05 && tt < c.spark + 0.35) {   // a tiny spark off his fingertip on "spark"
    const k = bumpAt(tt, c.spark - 0.05, 9);
    dsSpark(Hh.tip, [Hh.tip[0] + 18, Hh.tip[1] - 22], k, Math.round(t * 30), 0.5, 3);
  }
  if (tt > c.zap + 0.25 && tt < c.relax) {   // static still crackling round his hair and his hand
    const k = 0.35 + 0.65 * Math.max(bumpAt(tt, c.zapped, 5), bumpAt(tt, c.thousands, 5), 0.5 * Math.exp(-(tt - c.zap) * 0.6));
    const f = Math.round(t * 30), rng = mulberry32(5000 + f), H0 = Hh.head;
    for (let i = 0; i < 2; i++) {
      if (rng() > 0.55 + 0.45 * k) continue;
      const a = -Math.PI / 2 + (rng() - 0.5) * 2.2, r0 = 95 + rng() * 25, A = [H0[0] + Math.cos(a) * r0, H0[1] + Math.sin(a) * r0], B = [A[0] + (rng() - 0.5) * 50, A[1] - 10 - rng() * 30];
      dsSpark(A, B, k, f + i, 0.6, 7 + i);
    }
    if (rng() < 0.4 + 0.5 * k) dsSpark(Hh.wrR, [Hh.wrR[0] + 30 + rng() * 20, Hh.wrR[1] - 30 - rng() * 30], k, f, 0.6, 9);
  }
  if (tt > c.spark - 0.1 && tt < c.you + 0.4) {   // on "spark": a few electrons gather on his palm, the rest come out on "YOU"
    const n = Math.round(6 * ramp(tt, c.spark - 0.1, c.spark + 0.5));
    for (let i = 0; i < n; i++) {
      const a = i * 1.05 + tt * 1.6, P = [Hh.wrR[0] + Math.cos(a) * 34, Hh.wrR[1] - 20 + Math.sin(a) * 26];
      dsElectron(P[0], P[1], 9 * E.outBack(clamp((tt - c.spark - i * 0.06) / 0.2), 2.4), 1 - ramp(tt, c.you + 0.1, c.you + 0.4));
    }
  }
  if (S.charge > 0.5) dsCharge(Hh.st, S.charge, t, 7);
  if (tt >= 0) tagPill('THOUSANDS OF VOLTS', 560, 540, '#FFD447', popK(tt, c.thousands - 0.05, c.relax - 0.15), 46);
  return Hh;
}

SC.hook = (lt, t) => {
  const S = hookA(lt), cam = hookCam(lt);
  hookDraw(lt, t, { cam, S });
  const z = cu().zap;
  return { glow: 0.9, flash: 0.55 * bumpAt(lt, z, 14), zblur: 0.05 * bumpAt(lt, z, 10) };
};
SC.loop = (lt, t) => {
  const tt = t - TLd.duration, S = hookA(tt), cam = hookCam(tt);
  hookDraw(tt, t, { cam, S });
  return { glow: 0.9 };
};

// ================================================================ steps: the sneaker on the carpet, up close
const STEP_E = (() => { const r = mulberry32(12), a = []; for (let i = 0; i < 16; i++) a.push({ x: 180 + i * 62 + r() * 20, y: 1140 + r() * 70, j: r() * 9, up: 0.6 + r() * 0.8 }); return a; })();
SC.steps = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#3A2026', '#120709');
  const sx = 120 + 150 * lt, sy = 1238 + 5 * Math.sin(lt * 9), rot = 0.025 * Math.sin(lt * 9);
  const cam = { x: lerp(330, 560, E.inOutSine(clamp(lt / D))), y: 1120, zoom: 1.85 + 0.12 * lt / D, rot: 0 };
  // the room behind, far and soft: a skirting board and the wall
  screenSpace(); ctx.fillStyle = '#2A1E2A'; ctx.fillRect(0, 0, W, H);
  softDot(ctx, 900, 300, 600, '#5A3A4A', 0.6); softDot(ctx, 150, 520, 500, '#3A2E4A', 0.6);
  applyCam(cam);
  o_push_x = sx;
  dsCarpet(t, 'back', 0.6);
  dsSneaker(sx, sy, 1, rot);
  applyCam(cam);
  // the electrons: they sit on the fibre tips until the sole's front reaches them, then hop onto it and climb the leg
  STEP_E.forEach((e, i) => {
    const tp = (e.x - 330) / 150;                     // when the toe (x + 210) reaches it
    const d = lt - tp, wob = 4 * vnoise(t * 3 + e.j, 2);
    if (d < 0) { dsElectron(e.x, e.y + wob, 16, 1, 1, -0.6); return; }
    const hop = clamp(d / 0.25), relx = e.x - 120 - 150 * tp;  // where it landed on the shoe, shoe-relative
    const climb = Math.max(0, d - 0.25) * 420 * e.up;
    const x = sx + lerp(relx, -80 + (i % 3) * 30, clamp(climb / 300)), y = lerp(e.y, sy - 50, E.outBack(hop, 2)) - climb;
    if (y > 300) dsElectron(x, y + wob, 16, 1, 1, 0.5);
  });
  dsCarpet(t, 'front', 0.6);
  // the tag on "electrons"
  const k = popK(t, c.electrons - 0.05, shot.end + 1);
  tagPill('ELECTRONS', 540, 560, '#37C8FF', k, 50);
  if (k > 0.5) { const P = toScreen(cam, STEP_E[13].x, STEP_E[13].y - 20); thinLeader([540, 600], P, ramp(t, c.electrons, c.electrons + 0.3), '#37C8FF'); }
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 960 }, zblur: 0.06 * (1 - ramp(lt, 0, 0.25)) };
};

// ================================================================ pile: he walks to the door and they pile onto him
SC.pile = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 470 + 20 * lt / D, y: 1130, zoom: 1.12 + 0.06 * lt / D, rot: 0 };
  dsHall(cam, t);
  applyCam(cam);
  const walk = Math.sin(lt * 9);
  const legs = Object.assign({}, POSES.stand, { legL: { a: 0.07 + 0.05 * Math.max(0, walk), b: -0.35 * Math.max(0, walk) }, legR: { a: 0.07 + 0.05 * Math.max(0, -walk), b: -0.35 * Math.max(0, -walk) }, hipY: -222 + 4 * Math.abs(Math.cos(lt * 9)) });
  const n = lerp(70, 160, ramp(t, c.pile - 0.1, c.onto + 0.4, E.inOutSine));
  const Hh = dsHero(cam, t, { x: 330 + 50 * lt / D, legs, face: lerpFace(DF.happy, DF.down, ramp(t, c.onto, c.onto + 0.2)),
    armL: { e: [-108, -272 + 8 * walk], w: [-118 - 10 * walk, -186] }, armR: { e: [108, -272 - 8 * walk], w: [118 + 10 * walk, -186] },
    frizz: 0.3 + 0.6 * (n - 70) / 90 });
  applyCam(cam);
  dsCharge(Hh.st, n, t, 8);
  // a stream climbing up from his shoes
  for (let i = 0; i < 6; i++) {
    const u = ((lt * 1.6 + i / 6) % 1), P = toWorld(Hh.st, [(i % 2 ? 40 : -40), -20 - u * 300]);
    dsElectron(P[0], P[1], 9, 1 - u * 0.2);
  }
  chargeMeter(540, 540, popK(t, c.pile - 0.1, shot.end + 1), (n - 40) / 120);
  return { glow: 0.85 };
};

// ================================================================ dry: they try to leave, and bounce back off the dry air
SC.dry = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 425, y: 960, zoom: 1.62 + 0.08 * lt / D, rot: 0 };
  dsHall(cam, t);
  applyCam(cam);
  const Hh = dsHero(cam, t, { face: lerpFace(DF.nervous, DF.huh, ramp(t, c.escape, c.escape + 0.3)), frizz: 0.85,
    armL: { e: [-118, -290], w: [-70, -330] }, armR: { e: [118, -290], w: [70, -330] } });
  applyCam(cam);
  dsCharge(Hh.st, 160, t, 8);
  // five leapers: out from his outline, a bonk on the invisible wall, back in
  const H0 = Hh.head;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.6, t0 = shot.start + 0.15 + i * 0.32, u = (t - t0) / 0.7;
    if (u < 0 || u > 1) continue;
    const r0 = 120, r1 = 245, rr = u < 0.5 ? lerp(r0, r1, E.outCubic(u * 2)) : lerp(r1, r0 + 10, E.inCubic((u - 0.5) * 2));
    const x = H0[0] + Math.cos(a) * rr * 1.1, y = H0[1] + 60 + Math.sin(a) * rr;
    dsElectron(x, y, 14, 1, 1, Math.cos(a));
    const hit = bumpAt(t, t0 + 0.35, 6);
    if (hit > 0.05) {   // the wall it hit: a short dashed arc, and a tiny star
      ctx.save(); ctx.setLineDash([10, 9]); ctx.lineWidth = 5; ctx.strokeStyle = rgba('#BFF0FF', 0.8 * hit);
      ctx.beginPath(); ctx.arc(H0[0], H0[1] + 60, 262, a - 0.25, a + 0.25); ctx.stroke(); ctx.restore();
      shockLines(H0[0] + Math.cos(a) * 262, H0[1] + 60 + Math.sin(a) * 262, 26, hit);
    }
  }
  tagPill('DRY AIR', 560, 520, '#FF9A3C', popK(t, c.dry - 0.05, shot.end + 1), 52);
  return { glow: 0.85 };
};

// ================================================================ jump: slow motion, the finger nears the knob, they ALL jump
SC.jump = (lt, t, shot) => {
  const c = cu();
  const cam = { x: 535, y: 1040, zoom: 2.2 + 0.22 * ramp(t, shot.start, c.jump, E.inOutSine), rot: 0 };
  const sh = 16 * bumpAt(t, c.jump, 6); cam.x += sh * vnoise(t * 40, 3); cam.y += sh * vnoise(t * 37, 5);
  const jumpK = bumpAt(t, c.jump - 0.03, 5);
  dsHall(cam, t, { knob: { glow: 0.3 * ramp(t, c.metal - 0.1, c.metal + 0.2) + jumpK } });
  applyCam(cam);
  const app = lerp(0.55, 0.985, E.inOutSine(inv(shot.start, c.jump - 0.02, t)));
  const yank = ramp(t, c.jump + 0.05, c.jump + 0.25, E.outBack);
  let armR = armMix(armMix(DS_ARM.restR, DS_ARM.reachR, app), DS_ARM.yankR, yank * 0.6);
  const face = lerpFace(DF.nervous, DF.zap, ramp(t, c.jump, c.jump + 0.06));
  const Hh = dsHero(cam, t, { face: lerpFace({ ...DF.reach, browTilt: 1.0, browY: 0.9, mouth: 'grimace' }, face, ramp(t, c.all - 0.2, c.all)), armR, finger: 1 - yank, frizz: 0.85 + 0.4 * jumpK });
  applyCam(cam);
  // the charge flows down his arm and crowds into his fingertip
  const crowd = ramp(t, c.finger, c.all + 0.1, E.inOutSine), gone = ramp(t, c.jump, c.jump + 0.3);
  const path = [Hh.shR, Hh.elR, Hh.wrR, Hh.tip];
  for (let i = 0; i < 26; i++) {
    const u0 = ((i * 0.618) % 1), u = clamp(u0 + crowd * (1 - u0) * 0.98 + 0.03 * Math.sin(t * 7 + i));
    const seg = Math.min(2, Math.floor(u * 3)), f = u * 3 - seg, A = path[seg], B = path[seg + 1];
    let x = lerp(A[0], B[0], f), y = lerp(A[1], B[1], f) - 12 + 24 * ((i * 0.37) % 1);
    if (gone > 0) { x = lerp(x, DS.KX - 6, gone); y = lerp(y, DS.KY, gone); }
    if (gone < 0.98) dsElectron(x, y, 8, 1);
  }
  if (crowd > 0.6 && gone < 0.5) softDot(gctx, Hh.tip[0], Hh.tip[1], 40, '#5FD6FF', (crowd - 0.6) * 2);
  dsSpark(Hh.tip, [DS.KX - 6 - DS.KR, DS.KY], jumpK * (t > c.jump - 0.03 ? 1 : 0), Math.round(t * 30), 1.5);
  // the gap, measured: a bracket between the fingertip and the knob, until they jump
  const gk = popK(t, c.nears - 0.05, c.jump - 0.05);
  if (gk > 0.01) {
    const P = toScreen(cam, Hh.tip[0], Hh.tip[1] - 34), Q = toScreen(cam, DS.KX - 6 - DS.KR, DS.KY - 34);
    screenSpace(); ctx.save(); ctx.globalAlpha = gk; line(ctx, P[0], P[1], Q[0], Q[1], 5, '#FFD447'); line(ctx, P[0], P[1] - 14, P[0], P[1] + 14, 5, '#FFD447'); line(ctx, Q[0], Q[1] - 14, Q[0], Q[1] + 14, 5, '#FFD447'); ctx.restore();
  }
  tagPill('METAL', 760, 860, '#8FB8FF', popK(t, c.metal - 0.05, c.jump - 0.1), 44);
  return { glow: 0.95, flash: 0.6 * bumpAt(t, c.jump, 12), zblur: 0.06 * bumpAt(t, c.jump, 8) };
};

// ================================================================ payoff: the spark up close, then a bolt of lightning on a giant knob
let DS_BOLT = null;
SC.payoff = (lt, t, shot) => {
  const c = cu(), cut = c.bolt - 0.08;
  if (t < cut) {   // the gap, huge: a fingertip on the left, the knob on the right, the spark between
    darkBg('#0C1636', '#02040C');
    screenSpace();
    const sc = 1 + 0.08 * lt;
    ctx.save(); ctx.translate(540, 900); ctx.scale(sc, sc); ctx.translate(-540, -900);
    actor(() => { rrect(ctx, -200, 800, 520, 200, 100); ctx.fillStyle = DSPAL.skin; ctx.fill(); ellipse(ctx, 250, 880, 46, 36, '#F7D3BC'); });
    const g = ctx.createRadialGradient(780, 860, 20, 860, 900, 260); g.addColorStop(0, '#FFF1B8'); g.addColorStop(0.35, '#E8B94C'); g.addColorStop(1, '#9A6B1E');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(880, 900, 220, 0, 7); ctx.fill();
    dsSpark([322, 900], [662, 900], 1, Math.round(t * 30), 3.2, 5);
    ctx.restore();
    return { glow: 1, flash: 0.3 * (1 - ramp(lt, 0, 0.12)) };
  }
  const u = t - cut;
  const cam = { x: 540, y: 980 - 40 * u, zoom: 1.0 + 0.05 * u, rot: 0 };
  const strike = bumpAt(u, 0.08, 2.5);
  drawStorm(cam, { t, flash: strike * 0.9 });
  applyCam(cam);
  // the hill and a giant doorknob on top of it
  ctx.fillStyle = '#0D1230'; ctx.beginPath(); ctx.moveTo(-300, 1500); ctx.quadraticCurveTo(560, 1180, 1400, 1500); ctx.lineTo(1400, 2400); ctx.lineTo(-300, 2400); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7A5A22'; ctx.fillRect(536, 1190, 48, 120);
  const g = ctx.createRadialGradient(530, 1080, 20, 560, 1120, 150); g.addColorStop(0, '#FFF1B8'); g.addColorStop(0.35, '#E8B94C'); g.addColorStop(1, '#8A5B12');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(560, 1120, 110, 0, 7); ctx.fill();
  drawBolt(DS_BOLT, clamp(u / 0.12), clamp(1.4 * strike + 0.25 * (u > 0.1 ? 1 : 0)), t);
  if (u > 0.1) sparks(31, 560, 1010, cut + 0.12, t, 26, { speed: 900, life: 0.7 });
  return { glow: 1, flash: 0.75 * bumpAt(u, 0, 10) };
};

// ================================================================ weird: Greece, about 600 BC. Amber, fur, feathers
const FEATHERS = [[-180, 1500, 0.3], [260, 1480, 0.9], [-90, 1430, 1.7], [200, 1350, 2.4], [-240, 1300, 3.1]];
SC.weird = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(t, [[shot.start, 480, 1120, 1.25], [c.years, 470, 1010, 1.75], [shot.end, 468, 1000, 1.86]], E.inOutSine);
  dsGreece(cam, t);
  applyCam(cam);
  const rub = Math.sin(lt * 15) * (1 - ramp(t, c.years, c.years + 0.3));
  const armR = { e: [DS_ARM.rubR.e[0], DS_ARM.rubR.e[1] + 6 * rub], w: [DS_ARM.rubR.w[0] + 26 * rub, DS_ARM.rubR.w[1] + 4 * rub] };
  const Hh = dsHero(cam, t, { x: 470, pal: TOGAPAL, face: lerpFace({ ...DF.reach, lookX: -0.3, lookY: 0.6 }, DF.wow, ramp(t, c.years, c.years + 0.2)),
    armL: DS_ARM.amberL, armR: armMix(armR, DS_ARM.shrugR, ramp(t, c.ago_end - 0.1, c.ago_end + 0.3) * 0),
    pre: (lc, st) => {}, post: (lc, rr) => { dsRobe(lc); dsWreath(lc, rr.head[0], rr.head[1]); } });
  applyCam(cam);
  const AM = [Hh.wrL[0] + 30, Hh.wrL[1] - 30];
  dsAmber(AM[0], AM[1], 1.2, 0.25 + 0.25 * Math.abs(rub) + 0.6 * ramp(t, c.years, c.years + 0.4));
  dsFur(Hh.wrR[0] + 10, Hh.wrR[1] - 10, 1, 0.3 * rub);
  // feathers float up to the amber and stick to it
  const fk = ramp(t, c.noticed, c.ago_end + 0.2, E.inOutSine);
  FEATHERS.forEach(([dx, y0, ph], i) => {
    const k = clamp(fk * 1.3 - i * 0.08), x = lerp(AM[0] + dx, AM[0] + (i - 2) * 16, E.inOutCubic(k)), y = lerp(y0, AM[1] - 12 + (i % 2) * 22, E.inOutCubic(k));
    dsFeather(x + 12 * Math.sin(t * 2 + ph) * (1 - k), y, 1.5, (1 - k) * Math.sin(t * 1.6 + ph) * 0.8 + k * (i - 2) * 0.4);
  });
  tagPill('ABOUT 600 BC', 560, 540, '#C8A8FF', popK(t, c.noticed - 0.1, shot.end + 1), 48);
  return { glow: 0.85 };
};

// ================================================================ debate: today, a board full of arguments
const LABPAL = Object.assign({}, PAL, { coat: '#F4F6FA', coatSh: '#C9D0DE', coatHi: '#FFFFFF', coatDk: '#AEB6C8', strap: '#5B8DEF', strapSh: '#3E6CC4', pj: true });
SC.debate = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 960, zoom: 1 + 0.04 * lt / D, rot: 0 };
  dsBoard(cam, t, ramp(lt, 0, 0.9));
  applyCam(cam);
  const sc = Math.sin(lt * 11) * (1 - ramp(t, c.explain - 0.1, c.explain + 0.2));
  const armR = armMix({ e: DS_ARM.scratchR.e, w: [DS_ARM.scratchR.w[0] + 12 * sc, DS_ARM.scratchR.w[1]] }, DS_ARM.shrugR, ramp(t, c.explain - 0.1, c.explain + 0.25, E.outBack));
  const armL = armMix(DS_ARM.restL, DS_ARM.shrugL, ramp(t, c.explain - 0.1, c.explain + 0.25, E.outBack));
  dsHero(cam, t, { x: 780, y: 1660, s: 1.2, pal: LABPAL, face: lerpFace(DF.huh, { ...DF.huh, lookX: 0, lookY: 0, mouth: 'flat', mouthOpen: -0.6, browTilt: 1.3 }, ramp(t, c.explain, c.explain + 0.2)),
    armL, armR, handL: 'open', handR: 'open',
    post: (lc, rr) => { lc.font = '900 90px Montserrat'; lc.fillStyle = '#FFD447'; lc.textAlign = 'center'; paint(() => lc.fillText('?', rr.head[0] + 70, rr.head[1] - 110 - 10 * Math.sin(t * 5))); } });
  const k = ramp(t, c.still - 0.05, c.still + 0.25);
  if (k > 0) stamp('STILL DEBATED', 540, 800, k, '#FF5A6E', -0.1, 104);
  return { glow: 0.8 };
};

// ================================================================ the button: the doorknob is the victim
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 530, y: 1062, zoom: 2.15 + 0.12 * lt / D, rot: 0 };
  dsHall(cam, t, { noKnob: true });
  applyCam(cam);
  const sorry = ramp(t, c.victim - 0.2, c.victim + 0.2, E.inOutCubic);
  const armR = armMix({ e: DS_ARM.scratchR.e, w: [DS_ARM.scratchR.w[0] + 8 * Math.sin(lt * 9), DS_ARM.scratchR.w[1]] }, DS_ARM.foldR, sorry);
  const lean = 0.05 * ramp(t, c.so, c.so + 0.4, E.inOutSine) * (1 - sorry);
  dsHero(cam, t, { face: lerpFace(DF.guilty, { ...DF.guilty, mouth: 'grimace', mouthOpen: 1, browTilt: 1.4 }, sorry), armR, armL: armMix(DS_ARM.restL, DS_ARM.foldL, sorry), frizz: 0.35, lean, headRot: lean });
  applyCam(cam);
  const pop = E.outBack(ramp(lt, 0, 0.25), 2), KXb = DS.KX + 14, KYb = DS.KY - 30, sb = 1.9 * lerp(0.6, 1, pop);
  dsKnob(KXb, KYb, sb, t, { burn: 0.6, face: { dazed: t < c.technically_end ? 1 : 0, sad: sorry, smoke: 1 } });
  const tear = ramp(t, c.victim + 0.1, c.victim + 0.9);   // a tear on "VICTIM"
  if (t > c.victim) { const R = DS.KR * sb, x = KXb - 6 * sb - R * 0.36, y = KYb - R * 0.12 + R * 0.25 + tear * R * 0.9; paint(() => sweatDrop(ctx, x, y, 0.8 * sb, 1)); }
  return { glow: 0.85 };
};

// ================================================================ the cover (src/cover.sh renders it)
SC.cover = (lt, t) => {
  const tt = cu().zap + 0.08, S = hookA(tt), cam = { x: 512, y: 1000, zoom: 2.1, rot: 0 };
  S.spark = 1; S.A.frizz = 0.9;
  hookDraw(tt, 0.5, { cam, S });
  screenSpace();
  bigWord('WHY DOES', 540, 1250, 110, '#FFFFFF', 1, -0.03);
  bigWord('IT ZAP?!', 540, 1410, 190, '#7FE9FF', 1, -0.03);
  return { glow: 0.9, noCaptions: true };
};

function initScenes2() {
  initGreece();
  DS_BOLT = makeBolt(17, 520, 120, 560, 1020, { disp: 220, branches: 5 });
}
