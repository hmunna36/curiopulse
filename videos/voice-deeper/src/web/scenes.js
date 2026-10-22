// Why Does Your Voice Sound DEEPER With Fingers in Your Ears? 👂 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The desk shots share one description of him over time (vdState) and one camera (vdCam), so a cut between two of them
// keeps him where he was; the last 0.4 s blend back into frame 1 (the loop).
'use strict';

const cu = () => TLd.cues;
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// his desk at night: the monitor and the moon in front and to the left (a cool key from above), a warm lamp far right (the rim)
const DESK_LIGHT = { ...LIGHTS.night, key: [-0.38, -0.66, 0.62], keyTint: [0.98, 1.0, 1.06], rim: [1.0, 0.74, 0.46], rimFrom: [0.85, -0.35], rimAmt: 1.15, pool: 0.5, halo: 0.08, haloColor: [0.6, 0.7, 1.0], dof: 1.0 };
setLights({ hook: DESK_LIGHT, skull: DESK_LIGHT, hum: DESK_LIGHT, leak: DESK_LIGHT, plug: DESK_LIGHT, canal: LIGHTS.inside, buds: DESK_LIGHT, rumble: DESK_LIGHT, button: DESK_LIGHT, loop: DESK_LIGHT, cover: DESK_LIGHT });

// ---------------------------------------------------------------- his faces
const VF = {
  listen: { eyeOpen: 1, pupil: 1, lookX: 0.25, lookY: -0.55, browY: 0.75, browTilt: 0.35, mouth: 'flat', mouthOpen: 0.12, blink: 0, cross: 0 },
  talk: { eyeOpen: 1.05, pupil: 1, lookX: 0.1, lookY: -0.4, browY: 0.8, browTilt: 0.3, mouth: 'o', mouthOpen: 0.55, blink: 0, cross: 0 },
  hello: { eyeOpen: 1.3, pupil: 0.8, lookX: 0, lookY: -0.6, browY: 1.5, browTilt: 0.35, mouth: 'o', mouthOpen: 0.95, blink: 0, cross: 0 },
  deep: { eyeOpen: 1.15, pupil: 0.9, lookX: 0, lookY: 0, browY: 1.3, browTilt: 0.1, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0 },
  huh: { eyeOpen: 1.1, pupil: 0.85, lookX: -0.6, lookY: -0.4, browY: 0.9, browTilt: 1.0, mouth: 'wavy', mouthOpen: 0.35, blink: 0, cross: 0 },
  push: { eyeOpen: 0.8, pupil: 1, lookX: 0, lookY: 0, browY: 0.2, browTilt: 1.2, mouth: 'grimace', mouthOpen: 0.7, blink: 0.5, cross: 0 },
  hear: { eyeOpen: 1.1, pupil: 0.85, lookX: 0.1, lookY: -0.85, browY: 1.1, browTilt: 0.6, mouth: 'o', mouthOpen: 0.3, blink: 0, cross: 0 },
  arm: { eyeOpen: 1.15, pupil: 0.85, lookX: 0.95, lookY: 0.15, browY: 1.2, browTilt: 0.4, mouth: 'o', mouthOpen: 0.45, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.3, pupil: 0.75, lookX: 0, lookY: 0, browY: 1.5, browTilt: 0.3, mouth: 'o', mouthOpen: 0.8, blink: 0, cross: 0 },
  deadpan: { eyeOpen: 1, pupil: 0.95, lookX: 0, lookY: 0, browY: -0.1, browTilt: -0.3, mouth: 'flat', mouthOpen: 0.05, blink: 0.46, cross: 0 },
};

// ---------------------------------------------------------------- small things
// a small filled tag (screen space)
function vdTag(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
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
// the desk's edge (camera applied); no mug: in the wide shots it showed as a red sliver at the frame's edge
function vdDesk(hop = 0, t = 0) {
  const y = DK.hy - 196 * DK.hs;
  ctx.fillStyle = '#2A1F3F'; ctx.fillRect(-200, y, 1480, 600);
  ctx.fillStyle = '#3B2C58'; ctx.fillRect(-200, y, 1480, 14);
}
// a video call's frame (screen space): a timer pill at the top, three round buttons at the bottom
function vdCallUI(k, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 1.5);
  screenSpace();
  ctx.save(); ctx.globalAlpha = clamp(k * 1.5);
  paint(() => {
    rrect(ctx, 64, 360, 952, 1300, 46); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.stroke();
  });
  ctx.restore();
  const secs = 134 + Math.floor(t);
  vdTag(`● CALL  ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 540, 486, '#1B2440', k, 34, '#FFFFFF');
  for (const [i, col] of [[-1, '#3A4160'], [0, '#3A4160'], [1, '#FF4D5E']]) {
    const x = 540 + i * 150, y = 1528, r = 50 * q;
    circle(ctx, x, y, r, col);
    paint(() => {
      if (i === -1) { rrect(ctx, x - 11 * q, y - 24 * q, 22 * q, 34 * q, 11 * q); ctx.fillStyle = '#FFFFFF'; ctx.fill(); line(ctx, x, y + 14 * q, x, y + 24 * q, 4 * q, '#FFFFFF'); }
      if (i === 0) { rrect(ctx, x - 26 * q, y - 15 * q, 36 * q, 30 * q, 6 * q); ctx.fillStyle = '#FFFFFF'; ctx.fill(); poly(ctx, [[x + 12 * q, y - 4 * q], [x + 27 * q, y - 13 * q], [x + 27 * q, y + 13 * q], [x + 12 * q, y + 4 * q]], 1, '#FFFFFF', true); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }
      if (i === 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(2.36); rrect(ctx, -26 * q, -8 * q, 52 * q, 16 * q, 8 * q); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore(); }
    });
  }
}
// his voice on the call, as he hears it: a speech bubble holding a fat, slow wave
function vdBoomBubble(x, y, k, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 1.6);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  rrect(ctx, -170, -70, 340, 140, 60); ctx.fillStyle = '#F4F0FF'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-90, 60); ctx.lineTo(-150, 120); ctx.lineTo(-40, 66); ctx.closePath(); ctx.fill();
  paint(() => {
    const P = [];
    for (let xx = -140; xx <= 140; xx += 4) P.push([xx, 34 * Math.sin((xx / 280) * Math.PI * 2 * 1.5 - t * 9) * (0.75 + 0.25 * Math.sin(t * 6))]);
    poly(ctx, P, 16, VD.bassDk);
  });
  ctx.restore();
}

// ================================================================ the desk shots: one description of him over time
const VD_OUT = { L: { e: [-176, -300], f: [-132, -404] }, R: { e: [176, -300], f: [132, -404] } };   // fingers out, hands hovering by his ears
// how far his fingers are in (0..1) and where his arms are (0 = out, 1 = plugged)
function vdPlug(t) {
  const c = cu();
  if (t < c.plugout) return 1;
  if (t < c.plugin - 0.2) return 1 - ramp(t, c.plugout, c.plugout + 0.22, E.inOutCubic);
  if (t < c.same - 0.1) return ramp(t, c.plugin - 0.2, c.plugin, E.inCubic);
  if (t < c.press - 0.6) return 0;
  return ramp(t, c.press - 0.6, c.press - 0.25, E.inCubic);
}
// the whole description of him at time t (desk shots). tt < 0 = the last frames of the Short, on their way to frame 1
function vdState(t) {
  const c = cu();
  const pk = vdPlug(t);
  const inBuds = t >= c.same - 0.1 && t < c.press - 0.6;
  const talkK = Math.max(popK(t, c.talk - 0.05, c.hello_end + 0.05), inBuds ? popK(t, c.same, c.earbuds_end + 0.2) : 0);
  const mouthWob = 0.5 + 0.5 * Math.abs(Math.sin(t * 13.5));
  // the face
  let face = VF.listen;
  face = lerpFace(face, VF.talk, ramp(t, c.talk - 0.08, c.talk + 0.05));
  face = lerpFace(face, VF.hello, ramp(t, c.hello - 0.08, c.hello + 0.1));
  face = lerpFace(face, VF.deep, ramp(t, c.deep - 0.06, c.deep + 0.12));
  if (inBuds) face = VF.huh;
  if (t >= c.press - 0.6) {
    face = VF.listen;
    face = lerpFace(face, VF.push, ramp(t, c.press - 0.05, c.harder + 0.1));
    face = lerpFace(face, VF.hear, ramp(t, c.faint - 0.1, c.faint + 0.15));
    face = lerpFace(face, VF.arm, ramp(t, c.own - 0.1, c.own + 0.15));
    face = lerpFace(face, VF.wow, ramp(t, c.twentyfive - 0.08, c.twentyfive + 0.12));
    face = lerpFace(face, VF.deadpan, ramp(t, c.youre - 0.1, c.youre + 0.15));
    face = lerpFace(face, VF.listen, ramp(t, c.loop, c.end));            // the loop: back to frame 1's face
  }
  if (talkK > 0.01) face = Object.assign({}, face, { mouthOpen: lerp(face.mouthOpen, (face.mouth === 'grin' ? 0.8 : 0.35) + 0.6 * mouthWob, talkK) });
  // the arms
  const armL = vdArmMix(VD_OUT.L, VD_ARM.plugL, pk), armR0 = vdArmMix(VD_OUT.R, VD_ARM.plugR, pk);
  let armR = armR0, armLx = armL;
  const budK = inBuds ? ramp(t, c.same - 0.1, c.same + 0.25, E.inOutCubic) : 0;
  if (inBuds) { armR = vdArmMix(VD_OUT.R, VD_ARM.budR, budK); armLx = vdArmMix(VD_OUT.L, VD_ARM.deskL, budK); }
  const press = t >= c.press - 0.6 ? ramp(t, c.press, c.harder + 0.15) * (1 - ramp(t, c.youre - 0.3, c.youre)) : 0;
  const A = {
    armL: armLx, armR, plugL: inBuds ? undefined : pk, plugR: inBuds ? 0 : pk,
    budsL: inBuds ? 1 : 0, budsR: inBuds ? 1 : 0, press, tremble: press,
    face, bob: 1.4 * Math.sin(t * loopW(2.6)), lean: 0,
    headRot: 0.02 * Math.sin(t * loopW(1.3)) + (inBuds ? -0.05 : 0),
    headDY: -6 * bumpAt(t, c.deep, 6) + 4 * Math.sin(Math.PI * clamp((t - c.deep) / 0.35)) * (t > c.deep && t < c.deep + 0.35 ? 1 : 0),
  };
  return { A, pk, talkK, inBuds, press };
}
// the camera for every desk shot (world units: his head's middle is at (540, 1030))
function vdCam(t) {
  const c = cu();
  const k = camKeys(t, [
    [0, 540, 1090, 3.35], [0.35, 540, 1090, 3.5], [1.4, 540, 1088, 3.54], [c.hello, 540, 1086, 3.6], [c.skull - 0.3, 540, 1084, 3.68],
    [c.singing, 540, 1074, 4.5], [c.every - 0.2, 540, 1076, 4.55], [c.bones, 540, 1104, 3.45], [c.normally - 0.25, 540, 1106, 3.4],
    [c.leaks, 540, 1112, 2.85], [c.fingers2, 540, 1110, 2.9], [c.window, 540, 1100, 3.15],
    [c.same - 0.1, 540, 1092, 3.35], [c.press - 0.65, 540, 1092, 3.5],
    [c.press - 0.6, 540, 1090, 3.62], [c.harder + 0.2, 540, 1088, 3.8], [c.muscles - 0.25, 540, 1120, 2.7], [c.second_end, 540, 1118, 2.78],
    [c.youre - 0.1, 540, 1142, 2.4], [c.loop, 540, 1136, 2.55], [c.end, 540, 1090, 3.35],
  ], E.inOutCubic);
  if (t >= 0 && t < 0.35) { const u = E.outCubic(t / 0.35); k.zoom = lerp(3.35, 3.5, u); }   // the first push is quick off the mark
  // a bass shake while the boom is on (Hellooo; the thumps)
  const boom = popK(t, c.hello, c.hello_end + 0.15, 0.05, 0.2);
  const th = (c.thump || []).reduce((m, f) => Math.max(m, bumpAt(t, f, 14)), 0);
  const sh = 5 * boom * Math.sin(t * 2 * Math.PI * 7) + 9 * th * Math.sin(t * 70);
  k.y += sh / k.zoom; k.x += 0.4 * sh / k.zoom * Math.cos(t * 23);
  return k;
}
// draw the desk world with him in it; o: {glass, woofer, pump, muscle, buzz, hop, under(H)}. Returns his points + the camera.
function vdDraw(t, o = {}) {
  const c = cu(), S = vdState(t), cam = vdCam(t);
  dkRoom(cam, t, { dark: 0, lamp: 1 });
  applyCam(cam);
  const A = Object.assign({}, S.A, { glass: o.glass, woofer: o.woofer || 0, pump: o.pump || 0, muscleL: o.muscle || 0, muscleR: o.muscle || 0, buzz: o.buzz || 0 });
  const H = vdHero(cam, t, A);
  applyCam(cam);
  vdDesk(o.hop || 0, t);
  return { H, cam, S };
}

// ---------------------------------------------------------------- 1. hook: fingers in his ears, he talks ... and it comes out DEEP
SC.hook = (lt, t, shot) => {
  const c = cu();
  const { H, cam } = vdDraw(t);
  applyCam(cam);
  const boom = ramp(t, c.hello - 0.04, c.hello + 0.12) * (1 - ramp(t, c.skull - 0.4, c.skull - 0.1));
  vdBoomRings(H.head, H.K, t, 0.95 * boom);
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) vdEarRings(H['ear' + k], s, H.K, t, { back: 0.8 * boom });
  return { glow: 0.85, flash: 0.08 * bumpAt(t, c.hello, 10) };
};

// ---------------------------------------------------------------- 2. skull: his head turns to glass where he sits: the skull, singing bass
SC.skull = (lt, t, shot) => {
  const c = cu();
  const g = ramp(t, c.skull - 0.12, c.skull + 0.3);
  const sing = ramp(t, c.singing - 0.05, c.singing + 0.15);
  const glass = { g, jd: 1 + 6 * sing * Math.abs(Math.sin(t * 7.5)), vib: 0.6 * sing, hot: 0.25 * sing, notes: sing, trapped: 0.75 * ramp(t, c.bass - 0.05, c.bass + 0.2), look: [0, -0.3], browY: 1.2 };
  const { H, cam } = vdDraw(t, { glass });
  applyCam(cam);
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) vdEarRings(H['ear' + k], s, H.K, t, { back: 0.6 * ramp(t, c.bass - 0.05, c.bass + 0.2) });
  screenSpace();
  const hs = toScreen(cam, H.head[0], H.head[1]);
  softDot(gctx, hs[0], hs[1], 90 * cam.zoom, VD.bassGlow, 0.18 * sing);
  return { glow: 0.85, flash: 0.12 * bumpAt(t, c.skull, 10) };
};

// ---------------------------------------------------------------- 3. hum: every word sets the bone humming, from the voice box up
SC.hum = (lt, t, shot) => {
  const c = cu();
  const talk = 0.5 + 0.5 * Math.abs(Math.sin(t * 13.5));
  const humK = ramp(t, c.hum1 - 0.05, c.hum1 + 0.2);
  const glass = {
    g: 1, jd: 4 * talk, vib: 0.3 + 1.1 * humK, hot: 0.2 + 0.75 * humK, humArcs: ramp(t, c.every - 0.1, c.every + 0.25), talk: 1,
    bone: ramp(t, c.bones - 0.1, c.bones + 0.55), boneHit: humK * (0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 3.1)), look: [0, -0.2], browY: 0.8,
    notes: 1 - ramp(t, c.every - 0.2, c.every + 0.2),
  };
  const { H, cam } = vdDraw(t, { glass });
  screenSpace();
  const jaw = toScreen(cam, ...dkHeadPt(H.st, 46, 40));
  const kb = ramp(t, c.bones - 0.05, c.bones + 0.15);
  if (kb > 0.01) { thinLeader([750, 1150], jaw, kb, VH.bone); vdTag('BONE', 752, 1150, VH.bone, kb, 40); }
  const hs = toScreen(cam, H.head[0], H.head[1]);
  softDot(gctx, hs[0], hs[1], 100 * cam.zoom, VH.bone, 0.16 * humK);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- 4. leak: fingers out, and the low hum leaks out of his ears
SC.leak = (lt, t, shot) => {
  const c = cu();
  const talk = 0.5 + 0.5 * Math.abs(Math.sin(t * 13.5));
  const glass = { g: 1, jd: 4 * talk, vib: 1.0, hot: 0.85, humArcs: 1, talk: 1, bone: 1, look: [0, -0.2], browY: 0.8 };
  const { H, cam } = vdDraw(t, { glass });
  applyCam(cam);
  const leak = ramp(t, c.low - 0.1, c.low + 0.3);
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) vdEarRings(H['ear' + k], s, H.K, t, { leak, speed: 0.75 });
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- 5. plug: fingers back in (plup): it bounces back; a window opens on his ear
const VC_VIEW0 = { s: 1.12, F: [-60, 0], P: [540, 860] };     // how the canal shot opens: section point F at screen P
SC.plug = (lt, t, shot) => {
  const c = cu();
  const talk = 0.5 + 0.5 * Math.abs(Math.sin(t * 13.5));
  const inK = ramp(t, c.plugin - 0.05, c.plugin + 0.1);
  const glass = { g: 1, jd: 4 * talk, vib: 1.0, hot: 0.85, humArcs: 1 - inK, talk: 1, bone: 1, trapped: 0.9 * inK, look: [0, -0.2], browY: 1.1 * inK + 0.8 * (1 - inK) };
  const { H, cam } = vdDraw(t, { glass });
  applyCam(cam);
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) vdEarRings(H['ear' + k], s, H.K, t, { leak: 1 - inK, back: inK, speed: 0.75 });
  // a round window on his right ear: the canal inside, with the finger in it; it grows into the next shot
  const w = ramp(t, c.window, shot.end, E.inCubic);
  if (w > 0.001) {
    const es = toScreen(cam, H.earR[0], H.earR[1]);
    const R = lerp(40, 1180, w), P = [lerp(es[0], VC_VIEW0.P[0], E.inOutCubic(w)), lerp(es[1], VC_VIEW0.P[1], E.inOutCubic(w))];
    const s = lerp(0.35, VC_VIEW0.s, w);
    screenSpace();
    circle(ctx, P[0], P[1], R + 7, '#FFFFFF');
    ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, Math.PI * 2); ctx.fillStyle = '#2A1030'; ctx.fill();
    ctx.save(); gctx.save();
    for (const cc of [ctx, gctx]) { cc.beginPath(); const k2 = cc === gctx ? 0.5 : 1; cc.arc(P[0] * k2, P[1] * k2, R * k2, 0, Math.PI * 2); cc.clip(); }
    vdCanal({ x: P[0] - VC_VIEW0.F[0] * s, y: P[1] - VC_VIEW0.F[1] * s, s }, t, { plug: 1, hum: 1, trap: 0.2 });
    ctx.restore(); gctx.restore();
  }
  return { glow: 0.85, zblur: 0.22 * ramp(t, shot.end - 0.2, shot.end, E.inCubic), zcx: 540, zcy: 820 };
};

// ---------------------------------------------------------------- 6. canal: trapped between the finger and the drum ... BOOM
SC.canal = (lt, t, shot) => {
  const c = cu();
  darkBg('#2A1030', '#120618');
  const s = VC_VIEW0.s, F = VC_VIEW0.F;
  const V = { x: VC_VIEW0.P[0] - F[0] * s, y: VC_VIEW0.P[1] - F[1] * s, s };
  const trap = ramp(t, c.trapped - 0.1, c.booms, E.inOutSine);
  const hit = bumpAt(t, c.boom, 2.6) * ramp(t, c.boom - 0.02, c.boom + 0.04) + 0.35 * ramp(t, c.eardrum - 0.05, c.eardrum + 0.1) * (0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 3.1));
  vdCanal(V, t, { plug: 1, hum: 1, trap, hit: clamp(hit), nerve: ramp(t, c.eardrum, c.eardrum + 0.3) });
  screenSpace();
  // BOOM on the drum
  const drum = vdCanalPt(V, VC.x1, 0);
  const kb = popK(t, c.boom - 0.03, c.eardrum - 0.08, 0.12, 0.1);
  if (kb > 0.01) { bigWord('BOOM!', 640, 520, 200, VD.bass, kb, -0.06 + 0.02 * Math.sin(t * 30)); softDot(gctx, 640, 520, 300, VD.bassGlow, 0.22 * kb); }
  // the tags
  const kd = ramp(t, c.eardrum - 0.05, c.eardrum + 0.15);
  if (kd > 0.01) { thinLeader([drum[0] - 40, 1196], [drum[0] + 4, drum[1] + 46], kd, '#FFD447'); vdTag('EARDRUM', Math.min(drum[0] - 60, 740), 1210, '#FFD447', kd, 42); }
  const fk = popK(t, c.its - 0.05, c.booms - 0.1);
  const fp = vdCanalPt(V, -300, 0);
  if (fk > 0.01) vdTag('YOUR FINGER', Math.max(fp[0] + 20, 250), 1210, '#FFE3D6', fk, 38);
  return { glow: 0.85, flash: 0.09 * bumpAt(t, c.boom, 12) + 0.1 * (1 - ramp(lt, 0, 0.12)), push: { k: 1 + 0.03 * lt / (shot.end - shot.start), cx: 540, cy: 820 }, shake: 0 };
};

// ---------------------------------------------------------------- 7. buds: a video call with earbuds in: his own voice comes out boomy
SC.buds = (lt, t, shot) => {
  const c = cu();
  const { H, cam } = vdDraw(t);
  applyCam(cam);
  const talkB = popK(t, c.same, c.earbuds_end + 0.2);
  vdBoomRings(H.head, H.K, t, 0.6 * talkB);
  screenSpace();
  const ui = ramp(t, shot.start, shot.start + 0.25);
  vdCallUI(ui, t);
  const ms = toScreen(cam, H.head[0], H.head[1]);
  vdBoomBubble(Math.min(ms[0] + 250, 740), ms[1] - 230, ramp(t, c.boomy - 0.1, c.boomy + 0.15) * (1 - ramp(t, shot.end - 0.15, shot.end)), t);
  const kt = ramp(t, c.earbuds - 0.05, c.earbuds + 0.15);
  if (kt > 0.01) { const bs = toScreen(cam, ...dkHeadPt(H.st, 63, 30)); thinLeader([bs[0] + 60, 1120], [bs[0] + 6, bs[1] + 24], kt, '#7FE9FF'); vdTag('= EARPLUGS', 700, 1130, '#7FE9FF', kt, 40); }
  return { glow: 0.85, flash: 0.12 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 8. rumble: fingers in, press harder: a faint rumble ... his own muscles, buzzing
SC.rumble = (lt, t, shot) => {
  const c = cu();
  const mus = ramp(t, c.own - 0.05, c.muscles + 0.1);
  const buzz = ramp(t, c.buzzing - 0.1, c.buzzing + 0.1) + 0.4 * mus;
  const { H, cam } = vdDraw(t, { muscle: mus, buzz: clamp(buzz) });
  applyCam(cam);
  const rk = ramp(t, c.faint - 0.1, c.rumble + 0.1) * (1 - 0.5 * ramp(t, c.muscles, c.muscles + 0.4));
  vdRumble(H.head, H.K, t, rk);
  // bzz marks by the muscles
  if (buzz > 0.05) for (const k of ['L', 'R']) {
    const F = H['fist' + k], El = H['el' + k], M = [lerp(El[0], F[0], 0.5), lerp(El[1], F[1], 0.5)], s = k === 'L' ? -1 : 1;
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.5, r0 = 52 * H.K, r1 = 70 * H.K, j = 3 * Math.sin(t * 2 * Math.PI * 25 + i);
      for (const [cc, w, al] of [[ctx, 6, 0.9], [gctx, 12, 0.45]]) line(cc, M[0] + s * Math.cos(a) * r0, M[1] + Math.sin(a) * r0 + j, M[0] + s * Math.cos(a) * r1, M[1] + Math.sin(a) * r1 + j, w * H.K, rgba('#FF8A9A', clamp(buzz) * al));
    }
  }
  screenSpace();
  const k25 = ramp(t, c.twentyfive - 0.05, c.twentyfive + 0.15);
  if (k25 > 0.01) vdTag('25 × A SECOND', 540, 452, '#FFD447', k25 * (1 + 0.03 * Math.sin(t * 2 * Math.PI * 25)), 44);
  return { glow: 0.85, flash: 0.1 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 9. button: a walking subwoofer
SC.button = (lt, t, shot) => {
  const c = cu();
  const wk = ramp(t, c.subwoofer - 0.08, c.subwoofer + 0.12) * (1 - ramp(t, c.loop - 0.02, c.loop + 0.12));
  const th = (c.thump || []).reduce((m, f) => Math.max(m, bumpAt(t, f, 12)), 0);
  const { H, cam } = vdDraw(t, { woofer: wk, pump: th, hop: th });
  applyCam(cam);
  if (wk > 0.01) { for (let i = 0; i < 2; i++) vdBoomRings(H.chest, H.K * (0.8 + 0.4 * i), t + i * 0.3, 0.7 * wk * (0.4 + 0.6 * th)); }
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- 10. loop: the last 0.4 s, back to frame 1
SC.loop = (lt, t, shot) => {
  const { H, cam } = vdDraw(t);
  return { glow: 0.85 };
};

// ---------------------------------------------------------------- the cover (rendered on its own by cover.sh)
SC.cover = (lt, t, shot) => {
  const c = cu();
  const tt = c.hello + 0.45;
  const S = vdState(tt), cam = { x: 540, y: 998, zoom: 3.0, rot: 0 };
  dkRoom(cam, tt, { dark: 0, lamp: 1 });
  applyCam(cam);
  const A = Object.assign({}, S.A, { face: VF.hello });
  const H = vdHero(cam, tt, A);
  applyCam(cam);
  vdDesk(0, tt);
  vdBoomRings(H.head, H.K, 0.2, 0.95);
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) vdEarRings(H['ear' + k], s, H.K, 0.3, { back: 0.8 });
  screenSpace();
  bigWord('WHY SO', 540, 512, 140, '#FFFFFF', 1, -0.03);
  bigWord('DEEP?!', 540, 657, 175, VD.bass, 1, -0.03);
  softDot(gctx, 540, 600, 420, VD.bassGlow, 0.12);
  return { glow: 0.85, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initDesk();
}
