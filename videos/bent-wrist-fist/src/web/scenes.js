// Why Can't You Make a FIST With Your Wrist Bent? ✊ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: camp.js (mosquito-bites' campsite at night), fist3d.js (one-finger's 3D hand), bwhand.js (the wrist that bends,
// the forearm, the strings, the puppeteer, the glass, the marshmallow stick). The whole Short is ONE state over time
// (`bwS(t)`, valid at negative time for the loop): every shot draws from it, so the hand never jumps between shots.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
const BW_LIGHT = { ...LIGHTS.lanterns, keyFrom: [-0.55, -0.85] };
setLights({ hook: BW_LIGHT, glass: BW_LIGHT, slack: BW_LIGHT, clamp: BW_LIGHT, grab: BW_LIGHT, button: BW_LIGHT, loop: BW_LIGHT,
  cover: BW_LIGHT });

const BW_HS = 0.95;                       // his scale at the campsite
const BW_WR = [440, 895];                 // where his left wrist is in the world (beside his head, shoulder high)
const BW_EL = [345, 990];                // and his left elbow (by his hip, in front): the forearm points from one to the other
const BW_PX = 15;                         // px per cm at the wrist when the 2D camera's zoom is 2.9
const bwClone = (p) => JSON.parse(JSON.stringify(p));

// ---------------------------------------------------------------- small graphics
// a pill tag with a leader to a point (screen space)
function bwTag(txt, x, y, k, col, to, size = 46) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.45;
  ctx.restore();
  if (to) thinLeader([x, y + h * 0.5 * Math.sign(to[1] - y)], to, clamp(k * 1.5 - 0.3), col);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#141428'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
}
// a comic burst with a word (screen space)
function bwBurst(x, y, s, k, word, col = '#4DFFB4', rot = -0.12, size = 104) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.6) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 150 : 96 + 14 * (i % 3); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.lineWidth = size * 0.1; ctx.strokeStyle = '#1A1030'; ctx.strokeText(word, 0, 6); ctx.fillText(word, 0, 6);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 190 * sc, col, 0.25); gctx.restore();
}
// motion marks round a point (screen space): little arcs that show a shake
function bwShake(x, y, r, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const rr = r * (1 + 0.22 * i) + 6 * Math.sin(t * 40 + i);
      ctx.beginPath(); ctx.arc(x, y, rr, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5);
      ctx.lineWidth = 6 - 2 * i; ctx.strokeStyle = rgba('#FFFFFF', 0.8 * k); ctx.lineCap = 'round'; ctx.stroke();
    }
  });
}

// ---------------------------------------------------------------- the state of everything at time tt
// tt = video seconds; negative = the Short's last frames (the loop), which run into frame 1
function bwS(tt) {
  const c = cu(), D = TLd.duration, S = {};
  const t = tt < 0 ? D + tt : tt;                         // for cue comparisons in the button
  // ---- the wrist (th: + down) and the fingers (lift: 0 fist .. 1 straight)
  const r = (a, b, e = E.inOutCubic) => ramp(tt, a, b, e);
  let th, lift, squeeze = 0, trem = 0, thumb = 0.45;
  if (tt < 0) {                                          // the loop: wrist down, fingers loose (as the button ends)
    th = 1.0; lift = 0.78; thumb = 0.7;
  } else {
    // the hook: the wrist goes all the way down while she says it, then he squeezes with everything he has
    th = lerp(1.0, 1.3, r(0.05, c.down1_end));
    lift = lerp(0.78, 0.82, r(0, 0.6)) - 0.4 * r(c.squeeze1 - 0.05, c.squeeze1 + 0.45, E.outCubic) - 0.05 * r(c.tight, c.fist_end);
    thumb = lerp(0.7, 0.3, r(c.squeeze1, c.squeeze1 + 0.4));
    trem = r(c.squeeze1 + 0.2, c.squeeze1 + 0.5) * (1 - r(c.giveup, c.giveup + 0.2)) * (0.6 + 0.4 * r(c.tight, c.fist));
    squeeze = trem;
    // "Can't?": he gives up, the fingers fall open a little
    lift += 0.22 * r(c.giveup, c.giveup + 0.35, E.outBack);
    thumb = lerp(thumb, 0.6, r(c.giveup, c.giveup + 0.35));
    // "puppets.": the fingers jig on their strings
    const jig = r(c.jig, c.jig + 0.1) * (1 - r(c.squeeze2 - 0.25, c.squeeze2));
    S.jigK = jig * Math.exp(-Math.max(0, tt - c.jig) * 1.2);
    lift += jig * 0.16 * Math.sin((tt - c.jig) * 22) * Math.exp(-(tt - c.jig) * 1.2);
    // the glass: he squeezes again (a loose fist again), the puppeteer pulls
    lift -= 0.36 * r(c.squeeze2 - 0.05, c.squeeze2 + 0.35, E.outCubic);
    thumb = lerp(thumb, 0.35, r(c.squeeze2, c.squeeze2 + 0.3));
    th = lerp(th, 1.12, r(c.squeeze2 - 0.3, c.squeeze2 + 0.3));
    // slack: all the way down
    th = lerp(th, 1.36, r(c.wrist2 - 0.05, c.down2_end + 0.1));
    lift += 0.12 * r(c.wrist2, c.down2_end);                         // the strings give: the fist opens a little
    lift -= 0.1 * r(c.reel, c.bottom, E.inOutSine);                  // he reels: a little tighter, not much
    // clamp: tip it back; the fingers curl by themselves, then slam shut
    th = lerp(th, -0.62, r(c.tip - 0.04, c.back_end + 0.1));
    lift = lerp(lift, 0.3, r(c.tip + 0.2, c.back_end + 0.15));
    lift = lerp(lift, 0.0, r(c.snap, c.snap + 0.1, E.outCubic));
    thumb = lerp(thumb, 0.0, r(c.snap - 0.1, c.snap + 0.1));
    squeeze = Math.max(squeeze, r(c.snap, c.snap + 0.1) * (1 - r(c.people, c.people + 0.3)));
    trem = Math.max(trem, 0.25 * r(c.snap + 0.05, c.snap + 0.15) * (1 - r(c.clamp_end + 0.2, c.clamp_end + 0.4)));
    // grab: the hand lets go and opens (wrist down a little), the stick lands, wrist back: it closes round the stick
    th = lerp(th, 0.85, r(c.people, c.people + 0.5));
    lift = lerp(lift, 0.86, r(c.people, c.people + 0.5));
    thumb = lerp(thumb, 0.85, r(c.people, c.people + 0.5));
    th = lerp(th, -0.5, r(c.grip, c.grip + 0.7));
    lift = lerp(lift, 0.3, r(c.grip + 0.1, c.grip + 0.75, E.inOutSine));
    thumb = lerp(thumb, 0.2, r(c.grip + 0.2, c.grip + 0.8));
    // the button: bend it down again: the grip goes slack and flops open, the stick slides out
    th = lerp(th, 1.15, r(c.bend3, c.again3_end, E.inOutSine));
    lift = lerp(lift, 0.5, r(c.bend3 + 0.3, c.again3_end + 0.2));
    lift = lerp(lift, 0.8, r(c.flop - 0.02, c.flop + 0.16, E.outBack));
    thumb = lerp(thumb, 0.7, r(c.flop - 0.02, c.flop + 0.2));
    th = lerp(th, 1.0, r(c.fwoosh, c.loop_in + 0.3));
    lift = lerp(lift, 0.78, r(c.fwoosh, c.loop_in + 0.3));
  }
  S.th = th; S.lift = clamp(lift, 0, 1); S.squeeze = squeeze; S.tremble = trem; S.thumb = clamp(thumb);
  S.fan = 1;
  // ---- the inside
  S.ties = tt < 0 ? 0 : r(c.strings_in, c.strings_in + 0.45, E.outCubic) * (1 - r(c.glass_in, c.glass_in + 0.3));
  S.tag0 = tt < 0 ? 0 : popK(tt, c.tag0, c.theyre + 0.1, 0.12, 0.15);
  S.glass = tt < 0 ? 0 : r(c.glass_in, c.glass_in + 0.35) * (tt < c.unglass ? 1 : 0);
  S.pup = tt < 0 ? 0 : r(c.glass_in + 0.12, c.glass_in + 0.45) * (tt < c.unglass ? 1 : 0);
  S.bulge = tt < 0 ? 0 : r(c.bulge, c.bulge + 0.25, E.outBack) * (1 - r(c.wrist2, c.wrist2 + 0.4)) + 0.5 * r(c.reel, c.bottom) * (1 - r(c.tip, c.back_end));
  // the bar: rests at barRest; the squeeze pulls it a little; reeling in pulls it all the way to his chest
  let barS = BWK.barRest + 1.0 * r(c.bulge, c.bulge + 0.3) * (1 - r(c.wrist2, c.wrist2 + 0.3));
  const reel = r(c.reel, c.bottom, (u) => u + 0.06 * Math.sin(u * Math.PI * 6));   // hand over hand
  barS += 5.5 * reel * (1 - r(c.tip, c.back_end));
  // tip back: the strings drag the bar (and him) up toward the wrist
  const yank = r(c.yank - 0.1, c.yank + 0.25, E.outBack) * (1 - r(c.people, c.people + 0.4));
  barS -= 1.3 * yank;
  // grab: wrist back drags the sleeping puppeteer up too
  const yank2 = r(c.grip, c.grip + 0.7) * (tt < c.unglass ? 1 : 0);
  barS -= 1.0 * yank2;
  S.barS = barS;
  S.lift_cm = 1.3 * yank + 1.0 * yank2;
  S.pull = Math.max(0.35 * r(c.bulge, c.bulge + 0.3) * (1 - r(c.wrist2, c.wrist2 + 0.3)), reel * (1 - r(c.tip, c.back_end)), 0.6 * r(c.squeeze3, c.snap) * (1 - r(c.people, c.people + 0.3)));
  S.slack = tt < 0 ? 0 : r(c.sag, c.sag + 0.5) * (1 - 0.85 * reel) * (1 - r(c.tip, c.back_end - 0.1));
  S.taut = tt < 0 ? 0 : Math.max(r(c.tip + 0.2, c.back_end) * (1 - r(c.people, c.people + 0.4)), r(c.grip + 0.2, c.grip + 0.7));
  S.glow = tt < 0 ? 0 : Math.max(0.6 * r(c.back - 0.1, c.back + 0.2) * (1 - r(c.people, c.people + 0.4)) + 0.4 * popK(tt, c.snap, c.people, 0.05, 0.3), 0.8 * r(c.grip + 0.3, c.grip + 0.8));
  S.beads = tt < 0 ? 0 : Math.max(r(c.bulge, c.bulge + 0.2) * (1 - r(c.thats, c.thats + 0.2)), r(c.reel, c.reel + 0.2) * (1 - r(c.pant, c.pant + 0.2)), popK(tt, c.tip, c.clamp_end, 0.2, 0.2), popK(tt, c.grip, c.label + 0.4, 0.2, 0.2));
  S.pullS = barS - BWK.barRest;
  // the puppeteer's mood
  let mood = 'calm', look = [0, -0.6], wave = 0;
  if (tt >= c.bulge) { mood = 'strain'; look = [0, -1]; }
  if (tt >= c.wake) { mood = 'happy'; look = [0.3, 0.6]; wave = popK(tt, c.wake, c.wrist2 - 0.1, 0.18, 0.2); }
  if (tt >= c.sag) { mood = 'worry'; look = [0.3, -1]; }
  if (tt >= c.reel) { mood = 'strain'; look = [0, -1]; }
  if (tt >= c.pant) { mood = 'pant'; look = [0.4, 0.5]; }
  if (tt >= c.yank) { mood = 'shock'; look = [0, -1]; }
  if (tt >= c.squeeze3) { mood = 'strain'; }
  if (tt >= c.snap + 0.1) { mood = 'proud'; look = [0.4, 0.4]; }
  if (tt >= c.sleep) { mood = 'sleep'; }
  S.mood = mood; S.look = look; S.wave = wave;
  S.cap = tt < 0 ? 0 : r(c.sleep, c.sleep + 0.3) * (tt < c.unglass ? 1 : 0);
  // ---- the stick
  const inS = tt < 0 ? 0 : r(c.stick, c.stick + 0.3, E.outBack);
  S.stick = tt < 0 ? 0 : inS * (1 - r(c.fwoosh - 0.05, c.fwoosh));
  S.stickDrop = -(1 - inS) * 10 + (tt > c.slip ? 490 * Math.pow(tt - c.slip, 2) : 0);
  S.toast = r(c.stick, c.again3_end);
  // ---- labels
  S.slackTag = tt < 0 ? 0 : popK(tt, c.slack, c.reel + 0.4, 0.12, 0.15);
  S.gap = tt < 0 ? 0 : popK(tt, c.left - 0.1, c.now2 + 0.1, 0.15, 0.15);
  S.burst = tt < 0 ? 0 : popK(tt, c.snap, c.clamp_end + 0.45, 0.06, 0.15);
  S.label = tt < 0 ? 0 : popK(tt, c.label, c.unglass, 0.15, 0.12);
  S.zzz = tt >= c.sleep && tt < c.unglass;
  S.fwoosh = tt < 0 ? 0 : popK(tt, c.fwoosh, c.loop_in + 0.15, 0.06, 0.35);
  // ---- his face and head
  const lookHand = { lookX: 0.9, lookY: 0.25 };
  let f = { ...FACES.calm, ...lookHand, mouth: 'flat' };
  if (tt >= 0) {
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace', eyeOpen: 0.85, browTilt: 1.4, browY: 0.6 }, r(c.squeeze1, c.squeeze1 + 0.3));
    f = lerpFace(f, { ...FACES.annoyed, lookX: 0.95, lookY: 0.3, mouth: 'flat', blink: 0.3 }, r(c.giveup, c.giveup + 0.25));
    f = lerpFace(f, { ...FACES.startled, lookX: 0.9, lookY: 0.3 }, r(c.muscles, c.muscles + 0.2));
    f = lerpFace(f, { ...FACES.shock, lookX: 0.95, lookY: 0.35, mouthOpen: 0.7 }, r(c.puppets, c.puppets + 0.2));
    f = lerpFace(f, { ...FACES.nervous, ...lookHand, mouth: 'grimace' }, r(c.squeeze2, c.squeeze2 + 0.3));
    // inside: he meets the puppeteer, worries with him, jumps when the strings snap tight, beams at the clamp
    f = lerpFace(f, { ...FACES.grin, lookX: 0.85, lookY: 0.35, eyeOpen: 1.25 }, r(c.wake, c.wake + 0.25));
    f = lerpFace(f, { ...FACES.worried, lookX: 0.8, lookY: 0.2 }, r(c.sag, c.sag + 0.25));
    f = lerpFace(f, { ...FACES.confused, lookX: 0.85, lookY: 0.4 }, r(c.pant, c.pant + 0.25));
    f = lerpFace(f, { ...FACES.startled, lookX: 0.8, lookY: 0.1 }, r(c.yank, c.yank + 0.15));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.8, lookY: 0.1 }, r(c.snap + 0.05, c.snap + 0.25));
    f = lerpFace(f, { ...FACES.calm, lookX: 0.85, lookY: 0.3, mouth: 'flat' }, r(c.sleep, c.sleep + 0.3));
    f = lerpFace(f, { ...FACES.startled, lookX: 0.8, lookY: 0.05 }, r(c.grip + 0.25, c.grip + 0.45));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.8, lookY: 0.1, mouthOpen: 0.6 }, r(c.label, c.label + 0.3));
    // the button: dread, then the stick goes: shock, then a sheepish grin in the firelight
    f = lerpFace(f, { ...FACES.worried, lookX: 0.9, lookY: 0.4 }, r(c.now3, c.now3 + 0.3));
    f = lerpFace(f, { ...FACES.shock, lookX: 0.6, lookY: 1 }, r(c.slip, c.slip + 0.15));
    f = lerpFace(f, { ...FACES.grin, lookX: 0.2, lookY: 0.6, mouthOpen: 0.4, browTilt: 1 }, r(c.fwoosh + 0.15, c.fwoosh + 0.4));
    f = lerpFace(f, { ...FACES.calm, ...lookHand, mouth: 'flat' }, r(c.loop_in - 0.1, c.loop_in + 0.35));
  }
  f.blink = Math.max(f.blink || 0, bwBlink(tt));
  S.face = f;
  S.hrot = tt < 0 ? 0.05 : 0.05 + 0.04 * r(c.squeeze1, c.squeeze1 + 0.3) * (1 - r(c.giveup, c.giveup + 0.3)) - 0.05 * r(c.slip, c.slip + 0.2) * (1 - r(c.loop_in - 0.1, c.loop_in + 0.3));
  S.hdx = trem * 2.5 * Math.sin(tt * 47);
  return S;
}
function bwBlink(tt, w = 0.45) { const u = ((tt * loopW(w) / (Math.PI * 2) + 0.3) % 1 + 1) % 1; return u < 0.03 ? Math.sin(u / 0.03 * Math.PI) : 0; }

// ---------------------------------------------------------------- the cameras
// the 2D camera (him, the campsite) and the 3D view of the hand (its angles), from one key list per section
function bwCam(tt) {
  const c = cu();
  const K = [
    [-1, 430, 950, 3.0, 0], [0, 430, 950, 3.0, 0],
    [c.cant, 434, 946, 3.1, 0], [c.theyre, 440, 940, 3.3, 0], [c.puppets_end, 452, 925, 3.75, 0],
    [c.see, 440, 932, 3.8, -0.08], [c.move_end, 428, 945, 6.2, -0.36], [c.puppeteer_end, 428, 946, 6.3, -0.36],
    [c.slack_end, 428, 948, 6.3, -0.36], [c.left_end, 426, 952, 6.4, -0.36],
    [c.tip, 426, 952, 6.4, -0.36], [c.back_end, 422, 935, 5.9, -0.3], [c.clamp_end, 422, 935, 6.0, -0.3],
    [c.people + 0.3, 440, 935, 5.0, -0.3], [c.them_end, 440, 935, 5.1, -0.3],
  ];
  if (tt >= c.unglass || tt < 0) {
    // the button: back on him; the loop: the hook's camera
    const u = tt < 0 ? 1 : ramp(tt, c.fwoosh + 0.1, c.loop_in + 0.3, E.inOutCubic);
    const a = { x: 436, y: 946, zoom: 3.15 }, b = { x: 430, y: 950, zoom: 3.0 };
    const sh = tt >= 0 ? popK(tt, c.fwoosh, c.fwoosh + 0.35, 0.03, 0.3) : 0;
    return { x: lerp(a.x, b.x, u) + 4 * sh * Math.sin(tt * 60), y: lerp(a.y, b.y, u) + 3 * sh * Math.cos(tt * 53), zoom: lerp(a.zoom, b.zoom, u), rot: 0 };
  }
  let k = K[0];
  for (let i = 1; i < K.length; i++) {
    const a = K[i - 1], b = K[i];
    if (tt >= b[0]) { k = b; continue; }
    if (tt > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], tt)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  return { x: k[1], y: k[2], zoom: k[3], rot: k[4] };
}
// the hand's view angles: [t, yaw offset, pitch, roll]
function bwAng(tt) {
  const c = cu();
  const K = [
    [-1, 0.42, 0.18], [0, 0.42, 0.18], [c.puppets_end, 0.36, 0.16],
    [c.move_end, 0.12, 0.08], [c.clamp_end, 0.12, 0.08], [c.people + 0.45, 0.95, 0.12], [c.them_end, 0.95, 0.12],
  ];
  let k = K[0];
  if (tt < 0) k = [0, 0.42, 0.18];
  else if (tt >= c.unglass) { const u = ramp(tt, c.fwoosh, c.loop_in + 0.3, E.inOutCubic); k = [0, lerp(0.85, 0.42, u), 0.18]; }
  else for (let i = 1; i < K.length; i++) {
    const a = K[i - 1], b = K[i];
    if (tt >= b[0]) { k = b; continue; }
    if (tt > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], tt)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  return { yaw: -Math.PI / 2 + k[1], pitch: k[2] };
}
function bwView(cam, ang) {
  const sc = toScreen(cam, BW_WR[0], BW_WR[1]), el = toScreen(cam, BW_EL[0], BW_EL[1]), D = 55;
  const dx = el[0] - sc[0], dy = el[1] - sc[1], l = Math.hypot(dx, dy) || 1;
  const roll = Math.atan2(-dx / l, dy / l);
  return { yaw: ang.yaw, pitch: ang.pitch, roll, tx: 0, ty: 0, tz: 0, D, cx: sc[0], cy: sc[1],
    f: BW_PX * D * cam.zoom / 2.9, mirror: true };
}

// ---------------------------------------------------------------- him at the campsite (his left arm is the 3D one)
function bwHero(cam, t, S) {
  const p = bwClone(POSES.stand);
  p.armL = { a: 0.16, b: 0.22 };
  p.lean = -0.01;
  const st = { x: CAMP.HX, y: CAMP.GY, s: BW_HS, pose: p, face: S.face, hideArm: 'R', headRot: S.hrot, headDX: S.hdx, headDY: 2 * Math.sin(t * loopW(1.6)) };
  const r = campChar(cam, st, t, {});
  return { r, st };
}
// his left upper arm (the coat's sleeve, rolled up to the elbow) from his shoulder to the 3D forearm's elbow (screen space)
function bwUpperArm(cam, hero, P2) {
  const shW = toWorld(hero.st, hero.r.shR), sh = toScreen(cam, shW[0], shW[1]);
  const el = P2.pa([0, -BWK.L * 0.97, 0]);
  const w = 42 * hero.st.s * cam.zoom;
  const dx = el[0] - sh[0], dy = el[1] - sh[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  actor(() => {
    line(ctx, sh[0], sh[1], el[0] - ux * w * 0.2, el[1] - uy * w * 0.2, w, CAMPPAL.coat);
    line(ctx, el[0] - ux * w * 0.62, el[1] - uy * w * 0.62, el[0] - ux * w * 0.18, el[1] - uy * w * 0.18, w * 1.1, CAMPPAL.coatSh);
  });
}

// the whole picture at time tt (t = the video time for clocks)
function bwFrame(tt, t, o = {}) {
  const S = bwS(tt), cam = o.cam || bwCam(tt), ang = o.ang || bwAng(tt);
  campBack(cam, t, { soft: 0.9 });
  applyCam(cam);
  campFire(t);
  const hero = bwHero(cam, t, S);
  // the hand
  const V = bwView(cam, ang), P2 = bwProj(V, S.th);
  const G = bwGeo(S, t);
  screenSpace();
  bwUpperArm(cam, hero, P2);
  const items = [];
  if (S.stick > 0.01) items.push(...bwStickItems(ctx, gctx, P2, { k: S.stick, drop: S.stickDrop, toast: S.toast }));
  actor(() => bwDraw(ctx, P2, G, { items, bulge: S.bulge }));
  // outside: the strings tied to the fingertips (the hook)
  bwTies(ctx, gctx, P2, G, S.ties, t, S.jigK);
  // inside: glass, strings, the bar, the puppeteer
  if (S.glass > 0.01) {
    bwGlass(ctx, P2, G, S.glass, { bulge: S.bulge });
    bwStrings(ctx, gctx, P2, G, { k: S.pup, slack: S.slack, glow: S.glow, barS: S.barS, pullS: S.pullS, beads: S.beads, t });
    bwPuppeteer(ctx, gctx, P2, { k: S.pup, barS: S.barS, pull: S.pull, mood: S.mood, look: S.look, wave: S.wave, lift: S.lift_cm, cap: S.cap, t,
      bar: () => bwBar(ctx, P2, S.barS, S.pup) });
  }
  return { S, cam, V, P2, G };
}

// ---------------------------------------------------------------- the overlays of each part
function bwOverlays(R, tt, t) {
  const c = cu(), S = R.S, P2 = R.P2, G = R.G;
  screenSpace();
  // the hook: shaking with effort
  if (S.tremble > 0.05 && tt < c.cant) { const q = P2.ph([0, 8, 2.5]); bwShake(q[0], q[1], q[2] * 7, S.tremble, t); }
  // MUSCLES: 0
  if (S.tag0 > 0.01) { const q = P2.ph(fkSegPt(G, 'I', 1, 0.5, 'front', 1.2)); bwTag('MUSCLES: 0', 640, 520, S.tag0, '#FF5A6E', [q[0], q[1]], 50); }
  // SLACK, by the waves
  if (S.slackTag > 0.01) { const b = bwBarPt(P2, S.barS), w = P2.pa([0, -0.6, 0.95]); bwTag('SLACK', 300, (b[1] + w[1]) / 2, S.slackTag, '#FF5A6E', [(b[0] + w[0]) / 2 - 20, (b[1] + w[1]) / 2], 54); }
  // the gap the fist cannot close
  if (S.gap > 0.01) {
    const a = P2.ph(fkSegPt(G, 'M', 2, 0.9, 'front', 1.0)), b = P2.ph([1.0, 4.6, 1.8]);
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], rr = Math.max(30, Math.hypot(a[0] - b[0], a[1] - b[1]) * 0.7) * E.outBack(S.gap, 2);
    paint(() => { ctx.save(); ctx.setLineDash([16, 11]); ctx.lineDashOffset = -t * 50; ctx.lineWidth = 7; ctx.strokeStyle = rgba('#FF5A6E', S.gap);
      ctx.beginPath(); ctx.arc(m[0], m[1], rr, 0, 7); ctx.stroke(); ctx.restore(); });
  }
  // CLAMP!
  if (S.burst > 0.01) { const q = P2.ph([0, 7.5, 3]); bwBurst(Math.min(800, q[0] + 230), Math.max(560, q[1] - 250), 0.95, S.burst, 'CLAMP!', '#4DFFB4', -0.12, 110); }
  // zzz from the sleeping puppeteer
  if (S.zzz) { const b = P2.pa([0, -(S.barS + 3.0) + S.lift_cm, 0.35]); applyCam({ x: 540, y: 960, zoom: 1, rot: 0 }); zzz(b[0] - 150, b[1] + 10, t, c.sleep, 1, 1.25); screenSpace(); }
  // WRIST BACK = GRIP
  if (S.label > 0.01) bwTag('WRIST BACK = GRIP', 540, 1530, S.label, '#4DFFB4', null, 52);
  // FWOOSH: the stick hit the fire below
  if (S.fwoosh > 0.01) {
    const k = S.fwoosh;
    softDot(ctx, 760, 1900, 900 * (0.6 + 0.4 * k), '#FF7A2C', 0.5 * k);
    softDot(gctx, 760, 1900, 700, '#FFB040', 0.6 * k);
    for (let i = 0; i < 18; i++) {
      const u = clamp((tt - c.fwoosh) * (0.9 + 0.5 * hash(i * 3.1))), x = 560 + hash(i * 7.3) * 420 + 60 * Math.sin(u * 5 + i), y = 1950 - u * (900 + 500 * hash(i * 1.9));
      circle(ctx, x, y, 5 * (1 - u) + 2, rgba('#FFD070', (1 - u) * k)); softDot(gctx, x, y, 22, '#FFA040', 0.8 * (1 - u) * k);
    }
    bwBurst(700, 1520, 0.85, popK(tt, c.fwoosh, c.loop_in - 0.05, 0.06, 0.12), 'FWOOSH!', '#FF9A3C', 0.1, 100);
  }
}

// ---------------------------------------------------------------- shots
function bwShot(lt, t, shot) {
  const R = bwFrame(t, t);
  bwOverlays(R, t, t);
  const c = cu();
  return { glow: 0.85, zblur: 0.03 * popK(t, c.snap, c.snap + 0.12, 0.02, 0.1) };
}
SC.hook = bwShot;
SC.glass = bwShot;
SC.slack = bwShot;
SC.clamp = bwShot;
SC.grab = bwShot;
SC.button = bwShot;
SC.loop = (lt, t, shot) => {
  const tt = t - TLd.duration;
  bwFrame(tt, t);
  return { glow: 0.85 };
};

// the cover: the bent wrist and the fist that will not close, the puppeteer showing, his face, CAN'T / SQUEEZE?
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.fist_end - 0.2;
  const S = bwS(tt);
  const cam = { x: 412, y: 930, zoom: 3.5, rot: 0 };
  campBack(cam, t, { soft: 0.9 });
  applyCam(cam);
  campFire(t);
  const hero = bwHero(cam, t, S);
  const ang = bwAng(0), V = bwView(cam, ang), P2 = bwProj(V, S.th), G = bwGeo(S, t);
  screenSpace();
  bwUpperArm(cam, hero, P2);
  actor(() => bwDraw(ctx, P2, G, {}));
  // the gap the fist cannot close, ringed
  const a = P2.ph(fkSegPt(G, 'M', 2, 0.9, 'front', 1.0)), b = P2.ph([1.0, 4.6, 1.8]);
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], rr = Math.max(46, Math.hypot(a[0] - b[0], a[1] - b[1]) * 0.75);
  paint(() => { ctx.save(); ctx.setLineDash([20, 13]); ctx.lineWidth = 9; ctx.strokeStyle = '#FF5A6E';
    ctx.beginPath(); ctx.arc(m[0], m[1], rr, 0, 7); ctx.stroke(); ctx.restore(); });
  bigWord('MAKE A', 540, 1230, 175, '#FFFFFF', 1, -0.05);
  bigWord('FIST?', 540, 1430, 240, '#FFD447', 1, -0.05);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initCamp();
}
