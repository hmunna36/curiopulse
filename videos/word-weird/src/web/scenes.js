// Why Does a Word Go WEIRD When You Repeat It? 🥄 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// Worlds: camp.js (mosquito-bites' campsite at night, snap-fingers' copy), ww_exam.js (stomach-growl's exam hall with a
// blackboard and a classroom door), ww_world.js (the word, the meaning, its house, the circuit, the card, handwriting).
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
const WW_CAMP = { ...LIGHTS.lanterns, keyFrom: [-0.55, -0.85] };
setLights({ hook: WW_CAMP, bell: WW_CAMP, nobody: WW_CAMP, wire: LIGHTS.inside, page: flipLight(LIGHTS.day), door: flipLight(LIGHTS.day), button: WW_CAMP,
  loop: WW_CAMP, cover: WW_CAMP });

// ---------------------------------------------------------------- the hero at the campfire
const WWH = { x: 470, y: CAMP.GY + 40, s: 0.95 };
// the hook's camera (and the button's, and the loop's): tight on his head, the word above it, the bubble to his left
const WW_CAM0 = { x: 470, y: 914, zoom: 2.9, rot: 0 };
function wwRepIdx(tt) {            // the last rep at or before tt (-1: none yet), from the cue list
  const R = cu().reps;
  let i = -1;
  for (let k = 0; k < R.length; k++) if (R[k] <= tt) i = k;
  return i;
}
// how far into the "spoon" he is saying now: 0..1 over 0.24 s after a rep, else -1. Before frame 0 (the loop) and in the
// button he chants on the same clock
function wwSay(tt) {
  const c = cu(), DT = (c.thirty - c.spoonw) / 29;
  let last;
  if (tt < 0 || tt >= c.now) {
    // before frame 0 (the loop) and in the button: the chant runs on the loop's grid, so it meets frame 1's reps exactly
    const g = tt < 0 ? c.reps[0] : c.reps[0] + TLd.duration;
    if (tt >= 0 && tt < c.now + 0.2) return -1;
    last = g - DT * Math.ceil((g - tt) / DT - 1e-9);
    if (last > tt) last -= DT;
  } else {
    if (tt >= c.nobody - 0.1) return -1;
    const i = wwRepIdx(tt);
    if (i < 0) last = c.reps[0] - DT * Math.ceil((c.reps[0] - tt) / DT);
    else last = c.reps[i];
  }
  const u = (tt - last) / 0.3;
  return u >= 0 && u < 1 ? u : -1;
}
function wwFace(tt, base) {
  const f = Object.assign({}, base);
  const u = wwSay(tt);
  if (u >= 0) { f.mouth = 'o'; f.mouthOpen = 0.25 + 0.55 * Math.sin(Math.PI * u); }
  else if (f.mouth === 'o') { f.mouth = 'flat'; f.mouthOpen = 0.1; }
  return f;
}
// his pose: the left hand holds the spoon up under his chin like a microphone (rig units)
function wwMicPose(t, k = 1) {
  let p = JSON.parse(JSON.stringify(POSES.stand));
  p.lean = 0.012 * Math.sin(t * 1.6);
  const rest = { e: [-118, -262], w: [-112, -196] }, mic = { e: [-138, -250], w: [-74, -300] };
  const m = armMix(rest, mic, k);
  p = armAt(p, 'L', m.e, m.w);
  p.armR = { a: 0.24, b: 0.16 };
  p.hand = 'open';
  return p;
}
// the spoon in his fist like a microphone: its bowl just under his chin, to his right (screen-left) of the mouth, so the
// mouth stays in sight (drawn after the head: it is in front of his chin)
const WW_BOWL = [-44, -372];     // the bowl's centre (rig units); the mouth is at (0, -430), the chin's bottom at y -400
function wwMicSpoon(c, r, k = 1) {
  if (k <= 0.01) return;
  const wr = r.wrL, d = r.armDirL, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14;
  const B = [lerp(hx, WW_BOWL[0], k), lerp(hy - 40, WW_BOWL[1], k)];
  const ux = B[0] - hx, uy = B[1] - hy, L = Math.hypot(ux, uy) || 1, nx = ux / L, ny = uy / L;
  const bot = [hx - nx * 40, hy - ny * 40], top = [B[0] - nx * 18, B[1] - ny * 18];
  const ang = Math.atan2(ny, nx) + Math.PI / 2;
  c.save();
  // the handle through the fist
  line(c, bot[0], bot[1], top[0], top[1], 13, '#2A2F45'); line(c, bot[0], bot[1], top[0], top[1], 8, WW.silver);
  // the bowl, tipped toward his mouth, with a dark rim so it reads against his face
  c.save(); c.translate(B[0], B[1]); c.rotate(ang);
  ellipse(c, 0, 0, 21, 27, '#2A2F45'); ellipse(c, 0, 0, 18, 24, WW.silverSh); ellipse(c, -1.5, -2, 14.5, 20, WW.silver);
  c.beginPath(); c.ellipse(-6, -8, 3.5, 8, -0.4, 0, 7); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
  c.restore();
  // the fingers wrapped round the handle
  for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(hx + 8 - i * 2, hy - 12 + i * 11, 12, 6.5, 0.2, 0, 7); c.fillStyle = CAMPPAL.skin; c.fill(); }
  c.restore();
}
// the whole campfire close-up at time tt (the hook, the button and the loop share it). o: {cam, face, word fn, ...}
function wwCampHero(tt, t, cam, o = {}) {
  campBack(cam, t, { soft: 0.85 });
  applyCam(cam);
  campFire(t, 1);
  const st = { x: WWH.x, y: WWH.y, s: WWH.s, pose: wwMicPose(t, o.mic === undefined ? 1 : o.mic), face: wwFace(tt, o.face || FACES.calm),
    headRot: o.headRot || 0, headDX: 0, headDY: 2 * Math.sin(t * 2.3) };
  const r = campChar(cam, st, t, { post: (c, rr) => { rigSpace(c, st, (cc) => wwMicSpoon(cc, rr, o.mic === undefined ? 1 : o.mic)); if (o.post) o.post(c, rr, st); } });
  return { st, r };
}
// where his mouth is on screen
function wwMouthScr(cam, st, r) {
  const p = headPt(st, r, [0, 40]);
  return toScreen(cam, p[0], p[1]);
}

// ---------------------------------------------------------------- the word over him and the thought bubble with the meaning
const WW_WORD = [540, 532, 168];       // screen x, y, font size of the big word
const WW_BUB = [795, 768, 280, 272];   // the thought bubble: centre, w, h (its lobes end inside x 980)
// the state of the word at video time tt (negative = the loop)
function wwWordState(tt) {
  const c = cu();
  if (tt < 0) return { txt: 'SPOON', brk: 0, crack: 0, dead: 0, wob: 0, thump: 0 };
  const s = { txt: 'SPOON' };
  s.crack = ramp(tt, c.crack, c.crack + 0.4, E.outQuad) * (1 - ramp(tt, c.drift, c.drift + 0.3));
  s.brk = 0.3 * ramp(tt, c.drift, c.stays_end, E.inOutSine) + 0.42 * ramp(tt, c.meaning, c.out, E.inOutSine);
  s.dead = ramp(tt, c.meaning, c.out);
  s.wob = 0.25 * ramp(tt, c.drift, c.drift + 0.5);
  const i = wwRepIdx(tt);
  s.thump = i >= 0 && tt < c.nobody ? Math.max(0, 1 - (tt - c.reps[i]) / 0.18) : 0;
  s.thump = Math.max(s.thump, popK(tt, c.thump, c.thump + 0.3, 0.05, 0.25));
  if (tt >= c.now) {        // the button: SPOON (broken) -> YOUR NAME (fresh), which starts to wobble
    const sw = tt >= c.tagname;
    s.txt = sw ? 'YOUR NAME' : 'SPOON';
    s.brk = sw ? 0.16 * ramp(tt, c.wobble, c.wobble + 0.7) : 0.72;
    s.dead = sw ? 0.3 * ramp(tt, c.wobble + 0.2, c.wobble + 0.9) : 1;
    s.crack = 0;
    s.wob = sw ? 0.2 + 0.6 * ramp(tt, c.wobble, c.wobble + 0.4) : 0.25;
    s.pop = sw ? ramp(tt, c.tagname, c.tagname + 0.3) : 1 - ramp(tt, c.tagname - 0.18, c.tagname);
  }
  return s;
}
function wwDrawWord(tt, t, k = 1, y = WW_WORD[1]) {
  const s = wwWordState(tt);
  wwWord(s.txt, WW_WORD[0], y, s.txt === 'SPOON' ? WW_WORD[2] : 132, { k: k * (s.pop === undefined ? 1 : s.pop), brk: s.brk, crack: s.crack,
    dead: s.dead, wob: s.wob, t, thump: s.thump, seed: s.txt === 'SPOON' ? 3 : 8, col: s.txt === 'SPOON' ? '#FFD447' : '#7FE9FF' });
}
// the meaning in the bubble at tt: where it stands and what it does
function wwMeaning(tt, t) {
  const c = cu(), [bx, by] = WW_BUB;
  const o = { x: bx, y: by + 106, s: 0.74, mood: 'happy', wave: 0.6 + 0.4 * Math.sin(t * 5), suitcase: 0, walk: 0, dir: 1, t, bubble: 1 };
  if (tt < 0) return o;
  if (tt >= c.pack && tt < c.now) {
    o.wave = 0; o.suitcase = ramp(tt, c.pack, c.pack + 0.25, E.outBack); o.mood = 'happy';
    const u = ramp(tt, c.leave, c.out + 0.1, (v) => v);
    o.x = bx + u * 360; o.walk = u * 4.2; o.dir = 1;
    o.bubble = 1 - ramp(tt, c.gone, c.gone + 0.12);
    if (tt >= c.out + 0.1) o.x = 2000;
  }
  if (tt >= c.now) {
    // gone until it walks back in at the end, suitcase in hand, and stops in the bubble
    o.bubble = ramp(tt, c.back - 0.35, c.back - 0.1, E.outBack);
    const u = ramp(tt, c.back - 0.2, c.loop_in - 0.02, E.outCubic);
    o.x = bx + (1 - u) * 300; o.walk = (1 - u) * 3; o.dir = -1; o.suitcase = 1 - ramp(tt, c.loop_in - 0.1, c.loop_in);
    o.wave = 0;
    if (tt < c.back - 0.2) o.x = 2000;
  }
  return o;
}
function wwDrawBubble(tt, t, headScr) {
  const m = wwMeaning(tt, t), [bx, by, bw, bh] = WW_BUB;
  if (m.bubble > 0.01) thoughtBubble(bx, by, bw, bh, m.bubble, headScr[0] + 120, headScr[1] - 40);
  screenSpace();
  if (m.x < 1300) wwSpoon(ctx, m.x, m.y, m.s, { mood: m.mood, wave: m.wave, suitcase: m.suitcase, walk: m.walk, dir: m.dir, t });
  // a "?" left in the empty bubble
  const q = m.bubble > 0.5 && m.x > 1200 && tt > 0 ? 1 : 0;
  if (q && tt < cu().now) bigWord('?', bx, by, 130, '#C8A8FF', 1, 0.1);
}
// the counter at tt
function wwCount(tt) {
  const c = cu(), i = wwRepIdx(tt);
  const n = i < c.counted0 ? 0 : Math.min(30, i - c.counted0 + 1);
  const hit = i >= c.counted0 && tt < c.nobody ? Math.max(0, 1 - (tt - c.reps[i]) / 0.15) : 0;
  return { n, hit, k: ramp(tt, c.rep_first, c.rep_first + 0.25) };
}
// the little "spoon!" pops from his mouth for the reps near tt
function wwPops(tt, mouth, dirSign = -1, size = 50) {
  const c = cu(), DT = (c.thirty - c.spoonw) / 29;
  for (const r of [c.reps[0] - 2 * DT, c.reps[0] - DT, ...c.reps]) {
    const u = (tt - r) / 0.9;
    if (u > 0 && u < 1 && r < c.nobody) wwPop('spoon!', mouth[0] - 175, mouth[1] - 30 - 40 * hash(r * 7), u, dirSign * (hash(r * 13) > 0.5 ? 1 : 0.7), size);
  }
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => wwHookAt(t, t);
function wwHookAt(tt, t) {
  const c = cu();
  // a slow push in; at "MEANING walks out" a small pan toward the bubble
  const pan = tt < 0 ? 0 : ramp(tt, c.pack - 0.2, c.leave + 0.3) * (1 - ramp(tt, c.out + 0.05, c.out + 0.3));
  const cam = Object.assign({}, WW_CAM0, { zoom: WW_CAM0.zoom * (1 + 0.04 * (tt < 0 ? 0 : ramp(tt, 0, c.keep, E.inOutSine))), x: WW_CAM0.x + 26 * pan });
  const lookUp = tt < 0 ? 0 : ramp(tt, c.pack, c.pack + 0.3) * (1 - ramp(tt, c.out + 0.2, c.out + 0.4));
  const face = Object.assign({}, FACES.calm, { lookX: 0.1 + 0.85 * lookUp, lookY: -0.2 - 0.7 * lookUp, browY: 0.2 + 0.9 * lookUp, browTilt: 0.2 + 0.7 * lookUp, mouth: 'flat' });
  if (tt > c.out && tt < c.now) Object.assign(face, { eyeOpen: 1.15, lookX: 0.2, lookY: -0.1, browY: 1.0, browTilt: 0.9 });
  const { st, r } = wwCampHero(tt, t, cam, { face, headRot: 0.05 * lookUp });
  screenSpace();
  const head = toScreen(cam, ...headPt(st, r, [0, -10]));
  wwDrawBubble(tt, t, head);
  wwDrawWord(tt, t, 1);
  const cn = wwCount(tt);
  wwCounter(246, 712, cn.k, cn.n, cn.hit);
  wwPops(tt, wwMouthScr(cam, st, r));
  return { glow: 0.85, push: { k: 1, cx: 540, cy: 900 } };
}

// the bell: a round window opens on his forehead; inside, the meaning's house; every "spoon" flies in and rings the bell
function wwBellState(tt) {
  const c = cu(), i = wwRepIdx(tt);
  const S = { ring: 0, press: 0, open: 0, mood: 'happy', wave: 0, cap: 0, robe: 0, sign: 0, lamp: 1, dark: 0, what: 0, yes: 0, hop: 0 };
  if (i >= 0 && tt < c.nobody) { const u = (tt - c.reps[i]) / 0.22; S.ring = u < 1 ? u : 0; S.press = u < 0.4 ? 1 - u / 0.4 : 0; S.hop = u < 1 ? Math.sin(Math.PI * u) : 0; }
  S.open = ramp(tt, c.each + 0.15, c.each + 0.45, E.outBack) * (1 - ramp(tt, c.thirty + 0.15, c.in_end - 0.05, E.inOutSine));
  S.yes = popK(tt, c.meaning2 - 0.1, c.yes + 0.05, 0.12, 0.1);
  S.wave = S.yes;
  S.what = popK(tt, c.yes, c.thirty + 0.05, 0.08, 0.1);
  if (tt > c.yes) { S.mood = 'cross'; S.robe = 1; S.cap = ramp(tt, c.yes, c.yes + 0.2, E.outBack); }
  if (tt > c.thirty) S.mood = 'sleepy';
  if (tt >= c.frantic && tt < c.shut) { const u = ((tt - c.frantic) / 0.11) % 1; S.ring = u; S.press = u < 0.5 ? 1 : 0; }
  S.sign = ramp(tt, c.shut, c.shut + 0.35);
  S.signT = tt - c.shut - 0.35;
  S.lamp = 1 - ramp(tt, c.home, c.home + 0.12);
  S.dark = ramp(tt, c.home, c.home + 0.2);
  S.cricket = ramp(tt, c.cricket, c.cricket + 0.12);
  return S;
}
// draws the house into a screen-space circle (cx, cy, R) at house scale hs, centred so its door is in the middle
function wwHouseIn(tt, t, cx, cy, R, hs) {
  const S = wwBellState(tt), c = cu();
  // the room in his head behind the house
  const g = ctx.createRadialGradient(cx, cy - R * 0.3, 10, cx, cy, R * 1.2);
  g.addColorStop(0, '#6A2A74'); g.addColorStop(1, '#2A0F3A');
  ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); const y0 = cy - R + i * R * 0.45; ctx.moveTo(cx - R, y0); for (let x = -R; x <= R; x += 20) ctx.lineTo(cx + x, y0 + 18 * Math.sin(x * 0.03 + i)); ctx.lineWidth = 22 * hs * 2; ctx.strokeStyle = 'rgba(255,120,170,0.08)'; ctx.stroke(); }
  const gy = cy + 0.6 * R;
  ctx.fillStyle = '#3A1446'; ctx.fillRect(cx - R, gy, 2 * R, R);
  wwHouse(ctx, cx, gy, hs, {
    t, open: S.open, lamp: S.lamp, dark: S.dark, sign: S.sign, signT: S.signT, ring: S.ring, press: S.press,
    inside: (cc) => wwSpoon(cc, 0, -2 - 14 * S.hop, 0.72, { mood: S.mood, wave: S.wave, cap: S.cap, robe: S.robe, t, look: -0.3 }),
  });
  // the word that flies in from his mouth and smacks the button
  const i = wwRepIdx(tt + 0.2);
  if (i >= 0 && tt < c.nobody && tt > c.each - 0.1) {
    const u = clamp((tt - (c.reps[i] - 0.2)) / 0.2);
    if (u < 1) {
      const bx = cx + 150 * hs, by = gy - 134 * hs;
      const fx = lerp(cx - R * 0.2, bx, E.inQuad(u)), fy = lerp(cy + R * 1.05, by, E.inQuad(u));
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(-0.5 + 0.5 * u);
      ctx.font = `italic 900 ${Math.round(40 * hs * 1.5)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 9; ctx.strokeStyle = '#141428'; ctx.strokeText('spoon!', 0, 0); ctx.fillStyle = '#FFFFFF'; ctx.fillText('spoon!', 0, 0);
      ctx.restore();
    }
  }
  // what the meaning says
  if (S.yes > 0.01) speech('YES?', cx - 0.5 * R, gy - 1.05 * R, S.yes, '#2A2440', Math.round(66 * hs * 1.3), -0.1);
  if (S.what > 0.01) speech('WHAT?!', cx - 0.45 * R, gy - 1.05 * R, S.what, '#C0392B', Math.round(66 * hs * 1.3), 0.08);
  if (S.cricket > 0.01) {
    const kx = cx - 70 * hs, ky = gy + 22 * hs, s = E.outBack(S.cricket) * hs * 1.4;
    ctx.save(); ctx.translate(kx, ky); ctx.scale(s, s);
    ellipse(ctx, 0, 0, 22, 10, '#3A7A3A'); circle(ctx, 20, -3, 8, '#4A9A4A'); line(ctx, 18, -8, 40, -30, 2.5, '#2A5A2A'); line(ctx, 22, -8, 46, -22, 2.5, '#2A5A2A');
    line(ctx, -6, 4, -26, -18, 4, '#2A5A2A'); line(ctx, -26, -18, -34, 8, 4, '#2A5A2A');
    circle(ctx, 23, -5, 2.5, '#000');
    ctx.restore();
    const u = clamp((tt - cu().cricket) / 0.9);
    wwPop('chirp.', kx + 20 * hs, ky - 40 * hs, u, 1, Math.round(36 * hs * 1.4));
  }
}
function wwWindowShot(lt, t, shot, which) {
  const c = cu();
  // the camera dives toward his forehead; the window grows there; his mouth stays in the frame until 13 s
  const k1 = ramp(t, c.window, c.window + 0.55, E.inOutCubic);
  const k2 = which === 'nobody' ? ramp(t, c.thirty - 0.15, c.in_end, E.inOutCubic) : 0;
  const zoom = lerp(WW_CAM0.zoom * 1.04, 4.2, k1) * (1 + 0.6 * k2);
  const camY = lerp(WW_CAM0.y, 892, k1) - 40 * k2;
  const cam = { x: WWH.x, y: camY, zoom, rot: 0 };
  const face = Object.assign({}, FACES.calm, { lookX: 0.05, lookY: -0.6, browY: 0.5, browTilt: 0.5 });
  const { st, r } = wwCampHero(t, t, cam, { face });
  // the window on his forehead (an opaque disc first, outside any clip: the light then treats it as one flat thing)
  const ctr = headPt(st, r, [0, -38]);
  const [sx, sy] = toScreen(cam, ctr[0], ctr[1]);
  const R = lerp(0, 63, E.outBack(clamp(k1 * 1.4), 1.6)) * st.s * zoom * (1 + 0.5 * k2);
  if (R > 2) {
    screenSpace();
    circle(ctx, sx, sy, R + 10, '#2A1430');
    ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, R, 0, Math.PI * 2); ctx.clip();
    wwHouseIn(t, t, sx, sy, R, R / 360);
    ctx.restore();
    ctx.beginPath(); ctx.arc(sx, sy, R + 5, 0, Math.PI * 2); ctx.lineWidth = 12; ctx.strokeStyle = '#E8B48C'; ctx.stroke();
    ctx.beginPath(); ctx.arc(sx, sy, R + 5, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,240,220,0.8)'; ctx.stroke();
  }
  screenSpace();
  const mouth = wwMouthScr(cam, st, r);
  if (mouth[1] < 1640) wwPops(t, mouth, -1, 44);
  const cn = wwCount(t);
  const big = which === 'nobody' ? popK(t, c.thirty - 0.05, c.home, 0.08, 0.3) : 0;
  wwCounter(lerp(246, 540, big), lerp(1120, 470 + 30, big), cn.k, cn.n, Math.max(cn.hit, big > 0.5 && t < c.thirty + 0.3 ? 1 : 0), cn.n >= 30 ? '#FF5A6E' : '#FFD447');
  return { glow: 0.85, capY: which === 'nobody' ? 1545 : undefined };
}
SC.bell = (lt, t, shot) => wwWindowShot(lt, t, shot, 'bell');
SC.nobody = (lt, t, shot) => wwWindowShot(lt, t, shot, 'nobody');

// the circuit inside his head: SOUND (left) - the wire - MEANING (right); a LAB RESULTS card ticks them off
SC.wire = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  wwBrainRoom(t);
  const cam = camKeys(t, [[shot.start, 545, 1150, 0.94], [c.soundw, 420, 1100, 1.1], [c.fine1_end - 0.18, 420, 1100, 1.1], [c.meaning3 + 0.05, 690, 1100, 1.1],
    [c.wire, 582, 1380, 1.45], [c.worn, 586, 1470, 2.0], [shot.end, 586, 1480, 2.08]]);
  applyCam(cam);
  const post = [240, 1300], house = [800, 1300], hs = 0.6;
  const press = popK(t, c.soundw, c.soundw + 0.35, 0.05, 0.2);
  wwButtonPost(ctx, post[0], post[1], 0.9, { press, glow: press + 0.4 * ramp(t, c.tick1, c.tick1 + 0.2) * (1 - ramp(t, c.fray, c.fray + 0.3)) });
  const fray = ramp(t, c.between, c.worn + 0.2, E.inOutSine);
  const spark = fray > 0.6 ? 0.6 + 0.4 * Math.sin(t * 40) : 0;
  const a = [post[0] + 46 * 0.9, post[1] - 318 * 0.9], b = [house[0] + 150 * hs, house[1] - 120 * hs];
  const wpt = wwWire(ctx, a, b, 380, { fray, spark: spark + 1.4 * popK(t, c.cross, c.cross + 0.4, 0.04, 0.3), t }), m5 = wpt(0.5);
  wwHouse(ctx, house[0], house[1], hs, { t, open: 1, lamp: 1, ring: 0,
    inside: (cc) => wwSpoon(cc, 0, -2, 0.72, { mood: 'happy', wave: ramp(t, c.meaning3, c.tick2) * (1 - ramp(t, c.fray, c.fray + 0.2)), t }) });
  // a puff of smoke after it fizzles
  const sm = clamp((t - c.fizzle) / 1.0);
  if (sm > 0 && sm < 1) for (let i = 0; i < 4; i++) softDot(ctx, m5[0] + 20 * Math.sin(i * 2 + t), m5[1] - 10 - 120 * sm - i * 26, 30 + 40 * sm, '#B8B0C8', 0.35 * (1 - sm));
  // labels
  const sp1 = toScreen(cam, post[0], post[1] + 72), sp2 = toScreen(cam, house[0], house[1] + 72);
  wwTag('SOUND', sp1[0], sp1[1], popK(t, c.soundw - 0.1, c.fine1_end - 0.12, 0.2, 0.12), '#7FE9FF', { size: 40 });
  wwTag('MEANING', sp2[0], sp2[1], popK(t, c.meaning3 - 0.1, c.fray, 0.2, 0.15), '#C8A8FF', { size: 40 });
  const wl = toScreen(cam, m5[0], m5[1]);
  wwTag('WORN OUT', wl[0], wl[1] + 150, ramp(t, c.cross, c.cross + 0.2), '#FF5A6E', { size: 46 });
  wwCard(540, 640, ramp(t, c.card, c.card + 0.3), [
    { txt: 'SOUND', mark: 'tick', k: ramp(t, c.tick1, c.tick1 + 0.2) },
    { txt: 'MEANING', mark: 'tick', k: ramp(t, c.tick2, c.tick2 + 0.2) },
    { txt: 'THE WIRE', mark: 'cross', k: ramp(t, c.cross, c.cross + 0.2) },
  ], t);
  wwTag('Tian & Huber, Cognitive Psychology 2010', 540, 1590, ramp(t, c.lab + 0.3, c.lab + 0.6) * (1 - ramp(t, c.fray, c.fray + 0.2)), '#B8BCD8', { size: 24 });
  return { glow: 0.9, push: { k: 1 + 0.02 * (t - shot.start) / D, cx: 540, cy: 960 } };
};

// the page: close on his exam page on the desk, COPY: DOOR, his pencil writing "door door door"
const WW_PAGE = { w: 420, h: 600, lines: 8, per: 2 };
// the pencil tip's spot on the page (page units) when `fill` of the page is written
function wwPageTip(fill) {
  const P = WW_PAGE, lh = (P.h - 80) / P.lines, xh = lh * 0.42, total = P.lines * P.per;
  const f = clamp(fill) * total, i = Math.min(total - 1, Math.floor(f)), fr = f - i, li = Math.floor(i / P.per), j = i % P.per;
  const adv = 4.78 * xh;
  return [-P.w / 2 + 84 + j * adv + fr * adv * 0.8, -P.h / 2 + 60 + (li + 1) * lh - lh * 0.16 - xh * 0.5];
}
function wwDesk() {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9A6A3C'); g.addColorStop(1, '#6A4422');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) { const y = i * 78 + 20 * Math.sin(i * 1.7); ctx.fillStyle = `rgba(60,30,10,${0.08 + 0.06 * hash(i)})`; ctx.fillRect(0, y, W, 6 + 10 * hash(i * 3)); }
}
SC.page = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  wwDesk();
  const fill = lerp(0.18, 0.42, ramp(t, shot.start, shot.end, (v) => v));
  const sc = 1.95 * (1 + 0.05 * lt / D), cx = 545, cy = 1000, rot = -0.05;
  ctx.save(); ctx.translate(cx + 10, cy + 16); ctx.rotate(rot); ctx.scale(sc, sc);
  rrect(ctx, -WW_PAGE.w / 2, -WW_PAGE.h / 2, WW_PAGE.w, WW_PAGE.h, 6); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  actor(() => wwPage(ctx, WW_PAGE.w, WW_PAGE.h, { fill, lines: WW_PAGE.lines, perLine: WW_PAGE.per, title: 'COPY:  DOOR' }));
  ctx.restore();
  // his hand: a sleeve from the lower right, a fist, the pencil's tip on the word being written
  const tip = wwPageTip(fill), wig = 4 * Math.sin(t * 40);
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const tx = cx + (tip[0] * cs - tip[1] * sn) * sc, ty = cy + (tip[0] * sn + tip[1] * cs) * sc + wig;
  const hx = tx + 120, hy = ty + 150;
  actor(() => {
    line(ctx, hx + 520, hy + 560, hx + 40, hy + 40, 150, EXAMPAL.coat);
    line(ctx, hx + 70, hy + 74, hx + 40, hy + 40, 150, EXAMPAL.coatSh);
    pencil(ctx, tx, ty, 230, Math.atan2(120, 150) + Math.PI - 2 * Math.atan2(120, 150) + 0.0 * t, 3.2);
    circle(ctx, hx, hy, 78, EXAMPAL.skin);
    // the thumb and the first finger pinching the pencil, the knuckles over it
    ellipse(ctx, hx - 62, hy - 70, 36, 22, EXAMPAL.skin, -0.75);
    ellipse(ctx, hx - 30, hy - 92, 34, 20, EXAMPAL.skin, -0.2);
    for (let k = 0; k < 3; k++) ellipse(ctx, hx + 18 + 22 * k, hy - 40 + 12 * k, 22, 26, EXAMPAL.skinSh || '#C98F63', 0.3);
    rrect(ctx, hx + 40, hy + 40, 120, 70, 20); ctx.fillStyle = EXAMPAL.coatDk; ctx.fill();
  });
  return { glow: 0.5, push: { k: 1, cx: 540, cy: 960 } };
};

// the study: the hall, seven in ten quit, his page looks WRONG, the door goes jelly
const WW_QUIT_SEATS = [0, 1, 3, 4, 6, 7, 8];       // seven of the ten classmates quit (seat = row * 4 + i; 8, 9 the front pair)
function wwQuit(t) {
  const c = cu();
  return (seat) => {
    const j = WW_QUIT_SEATS.indexOf(seat);
    if (j < 0) return 0;
    const t0 = lerp(c.seven - 0.05, c.quit, j / 6);
    return ramp(t, t0, t0 + 0.12);
  };
}
function wwHeroPagePose(k) {
  let p = heroDeskPose({ write: 0, t: 0 });
  if (k > 0.01) {
    const e = E.inOutCubic(clamp(k));
    p = armAt(p, 'L', [lerp(-96, -128, e), lerp(-80, -96, e)], [lerp(-30, -104, e), lerp(-10, -160, e)]);
    p = armAt(p, 'R', [lerp(96, 128, e), lerp(-80, -96, e)], [lerp(30, 104, e), lerp(-10, -160, e)]);
  }
  return p;
}
SC.door = (lt, t, shot) => {
  const c = cu();
  const hold = ramp(t, c.holdup - 0.1, c.holdup + 0.45, E.inOutCubic);
  const whip = ramp(t, c.jelly - 0.06, c.jelly + 0.14, E.inOutCubic);
  // the camera: the hall (a small pull back), then in on him, then a whip to the door
  let cam = { x: 540, y: lerp(930, 940, ramp(t, shot.start, c.holdup)), zoom: lerp(1.1, 1.0, ramp(t, shot.start, shot.start + 1.2, E.outCubic)), rot: 0 };
  cam = { x: lerp(cam.x, 548, hold), y: lerp(cam.y, 1062, hold), zoom: lerp(cam.zoom, 1.75, hold), rot: 0 };
  cam = { x: lerp(cam.x, 790, whip), y: lerp(cam.y, 660, whip), zoom: lerp(cam.zoom, 2.0, whip), rot: 0 };
  const confused = ramp(t, c.looked, c.wrong);
  const look = ramp(t, c.jelly - 0.1, c.jelly + 0.1);
  const face = Object.assign({}, FACES.calm, { lookY: lerp(0.8, -0.1, hold) - 0.4 * look, lookX: 0.9 * look, browY: 0.1 + 1.1 * confused, browTilt: 0.1 + 0.9 * confused,
    mouth: 'flat', mouthOpen: 0.2, eyeOpen: 1 + 0.25 * confused });
  const jelly = popK(t, c.jelly, shot.end + 1, 0.05, 0.1) * Math.exp(-2.2 * Math.max(0, t - c.jelly - 0.15));
  const H0 = HALL.hero;
  examHall(cam, t, { jelly, boardWord: 'DOOR' });
  const quit = wwQuit(t), heads = [];
  HALL.rows.forEach((row, ri) => row.xs.forEach((x, i) => {
    const L = STUD[SEATING[ri][i]], q = quit(ri * 4 + i);
    actor(() => drawStudent(ctx, L, { x, y: row.y + 14 * row.s, s: row.s, lookX: 0.3 * q * Math.sin(i + ri), lookY: 0.6 + 0.4 * q, tilt: q * 0.16 * (i % 2 ? 1 : -1),
      brow: 1.2 * q, mouthO: 0.5 * q * (i % 2), write: 1 - q, blink: blinkAt(t, ri * 4 + i) }, t));
    desk(ctx, x, row.y, row.s, { px: -12 + 6 * i, prot: -0.08 + 0.05 * i });
    if (q > 0.5) pencil(ctx, x + 40 * row.s, row.y - 22 * row.s, 54 * row.s, 1.5 + 0.2 * i, row.s);
    heads.push([x, row.y + 14 * row.s - 330 * row.s, q, row.s]);
  }));
  HALL.front.forEach((x, i) => {
    const L = STUD[FRONT_LOOKS[i]], q = quit(8 + i);
    actor(() => drawStudent(ctx, L, { x, y: H0.y + 6, s: 1.0, lookY: 0.7 + 0.3 * q, tilt: -0.15 * q * Math.sign(H0.x - x), brow: 1.2 * q, mouthO: 0.5 * q * i, write: 1 - q, blink: blinkAt(t, 11 + i) }, t));
    desk(ctx, x, HALL.deskTop, 1.0, { px: -6, prot: 0.04 });
    if (q > 0.5) pencil(ctx, x + 50, HALL.deskTop - 18, 60, 1.5, 1);
    heads.push([x + (i ? -60 : 60), H0.y + 6 - 330, q, 1]);
  });
  // him: writing, then holding his page up (its last lines bend)
  const writing = 1 - ramp(t, c.holdup - 0.2, c.holdup);
  const pose = hold > 0.01 ? wwHeroPagePose(hold) : heroDeskPose({ write: writing, t });
  const hst = { x: H0.x, y: H0.y + 34, s: H0.s, pose, face, noLegs: true, headRot: 0.12 * look, headDX: 0 };
  const r = drawCharacter(ctx, hst, t, EXAMPAL);
  desk(ctx, H0.x, HALL.deskTop, 1.0, { px: 18, prot: -0.04, paper: hold < 0.5 });
  if (hold < 0.5) { const wr = toWorld(hst, r.wrR); pencil(ctx, wr[0] - 8, wr[1], 64, -0.55 + 0.25 * Math.sin(t * 18) * writing, 1); }
  if (hold > 0.01) {
    const L = toWorld(hst, r.wrL), R2 = toWorld(hst, r.wrR), cxp = (L[0] + R2[0]) / 2, cyp = (L[1] + R2[1]) / 2 + 46;
    const bend = (i) => (i >= 3 ? confused * Math.min(1, 0.45 + 0.2 * (i - 3)) : 0.08 * confused);
    ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(-0.03 + 0.015 * Math.sin(t * 3)); const ps = 0.5 * E.outBack(hold, 1.4); ctx.scale(ps, ps);
    actor(() => wwPage(ctx, 420, 520, { fill: 1, lines: 7, perLine: 2, bend }));
    ctx.restore();
    for (const w of [L, R2]) { circle(ctx, w[0], w[1], 21, EXAMPAL.skin); }
  }
  screenSpace();
  // a "?" pops over each classmate who quits
  for (const [hx, hy, q, s2] of heads) {
    if (q < 0.05 || t > c.holdup + 0.2) continue;
    const p = toScreen(cam, hx, hy);
    bigWord('?', p[0], p[1], Math.round(80 * s2 * cam.zoom), '#FF5A6E', E.outBack(clamp(q), 2.4), 0.12);
  }
  // tags
  wwTag('94 STUDENTS · MEMORY, 2021', 540, 1560, popK(t, c.tag, c.seven - 0.1, 0.12, 0.12), '#7FE9FF', { size: 38 });
  wwTag('IG NOBEL PRIZE 2023', 540, 1470, popK(t, c.tag + 0.3, c.seven - 0.1, 0.12, 0.12), '#FFD447', { size: 34, bg: '#3A2A10' });
  wwTag('7 IN 10 QUIT', 540, 1560, popK(t, c.seven_tag + 0.15, c.holdup - 0.05, 0.12, 0.12), '#FF5A6E', { size: 46 });
  if (jelly > 0.01) { const dq = toScreen(cam, 735, 330); bigWord('?', dq[0] + 150, dq[1], 140, '#FFD447', clamp(jelly * 3), 0.2); }
  return { glow: 0.6, blur: whip > 0.05 && whip < 0.95 ? [60 * Math.sin(Math.PI * whip), -30 * Math.sin(Math.PI * whip)] : undefined,
    capY: t >= c.quit_end + 0.05 ? 1545 : undefined };
};

// the button: back at the campfire; SPOON is gone, YOUR NAME takes its place and starts to wobble; the meaning walks back in
SC.button = (lt, t, shot) => {
  const c = cu();
  const cam = Object.assign({}, WW_CAM0, { zoom: WW_CAM0.zoom * (1.02 - 0.02 * ramp(t, shot.start, shot.end)) });
  const face = Object.assign({}, FACES.calm, { lookX: 0, lookY: -0.1, browY: 0.4 + 0.5 * ramp(t, c.wobble, c.wobble + 0.4), browTilt: 0.3, mouth: 'flat' });
  const { st, r } = wwCampHero(t, t, cam, { face });
  screenSpace();
  const head = toScreen(cam, ...headPt(st, r, [0, -10]));
  wwDrawBubble(t, t, head);
  wwDrawWord(t, t, 1);
  wwPops(t, wwMouthScr(cam, st, r));
  return { glow: 0.85 };
};
// the loop: the hook at negative time, so the cut to frame 1 is one move
SC.loop = (lt, t, shot) => wwHookAt(t - TLd.duration, t);

// the cover: him close, the word breaking over him
SC.cover = (lt, t, shot) => {
  const cam = Object.assign({}, WW_CAM0, { zoom: 3.3, y: 905 });
  const face = Object.assign({}, FACES.calm, { eyeOpen: 1.2, lookX: 0.15, lookY: -0.7, browY: 1.1, browTilt: 0.9, mouth: 'o', mouthOpen: 0.5 });
  const { st, r } = wwCampHero(-0.5, t, cam, { face });
  screenSpace();
  wwWord('SPOON', 540, 530, 236, { k: 1, brk: 0.38, crack: 0, dead: 0.25, wob: 0, t: 0.4, seed: 3 });
  wwTag('SAY IT 30 TIMES', 540, 1440, 1, '#FFD447', { size: 58 });
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  initCamp();
  initExam();
  initWwRoom();
}
