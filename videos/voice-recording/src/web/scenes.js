// Why Does Your Voice Sound WEIRD on Recordings? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// e^(-k (t - t0)) after t0, else 0
const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
function blinkAt(t, seed = 1, every = 3.1) { const p = ((t + seed * 1.37) % every) / every; return p > 0.955 ? 1 : 0; }

const SYL = 19.8;                                       // the phone voice's syllables: |sin(t * SYL)| = 6.3 a second (audio.py uses the same)
// how loud the phone is right now (0..1): quiet under the narration, then the room to itself; again when he replays it
function gibAmp(t) {
  const c = cu();
  let a = 0;
  if (t > c.gib0 && t < c.gib1) a = 0.42 * ramp(t, c.gib0, c.gib0 + 0.2);
  if (t >= c.gib1 && t < c.gib1_end + 0.06) a = 1;
  if (t >= c.gib1_end + 0.06 && t < c.bad) a = 0.3 * (1 - ramp(t, c.that_end, c.that_end + 0.5));
  if (t > c.replay && t < c.replay_end) a = 1;
  if (t >= c.replay_end && t < c.voice2_end) a = 0.35;
  return a * (0.5 + 0.5 * Math.abs(Math.sin(t * SYL)));
}

const FACE_LISTEN = Object.assign({}, FACES.calm, { lookX: 0.95, lookY: 0.25, browY: 0.5, browTilt: 0.2, mouth: 'flat', mouthOpen: 0.5 });
const FACE_DOUBT = Object.assign({}, FACES.confused, { lookX: 0.95, lookY: 0.2, browY: 0.9, browTilt: 1.0, mouth: 'wavy', eyeOpen: 1.15 });
const FACE_HORROR = Object.assign({}, FACES.shock, { lookX: 0.8, lookY: 0.1, browY: 1.5, browTilt: 0.9, pupil: 0.5 });
const FACE_DEADPAN = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.48, browTilt: -0.2, browY: 0 });
const FACE_BLISS = Object.assign({}, FACES.grin, { blink: 1, browY: 1.0, browTilt: 0.5, mouthOpen: 0.55 });

// ---------------------------------------------------------------- the couch, with the phone in his right hand
// o: {cam, face, hold: [x, y] (rig-local wrist target), tilt, lean, headDX, headDY, headRot, frizz, tremble, amp (phone loudness),
//     ringK (how much of the voice we draw), left: [x, y] (left-hand target), post: fn(lc, r, st), phone: false (no phone),
//     toss: {x, y, rot} (the phone is in the air: world coords) }
function couchHero(cam, t, o = {}) {
  const base = couchPose({ hug: 0, t });
  const hold = o.hold || [118, -226];
  let pose = ikReach(base, 'R', hold, 1);
  if (o.left) pose = ikReach(pose, 'L', o.left, -1);
  pose.lean = o.lean || 0;
  const tilt = o.tilt === undefined ? 0.16 : o.tilt, amp = o.amp || 0;
  const inHand = o.phone !== false && !o.toss;
  const rg0 = rig(pose), ph0 = [ROOM.hx + (rg0.wrR[0] + 4) * ROOM.hs, ROOM.seatY + (rg0.wrR[1] - 50) * ROOM.hs];
  const src0 = o.toss ? [o.toss.x, o.toss.y] : ph0;
  const sc = couchScene(cam, t, {
    // the voice coming out of the phone: jagged rings, drawn BEHIND him so they never cross his face
    under: () => { if (amp > 0.01 && o.ringK !== 0) squeakRings(src0[0] - 10, src0[1] - 30, t, 0.8 * amp * (o.ringK === undefined ? 1 : o.ringK), { R: 250, n: 4 }); },
    hero: { face: o.face, hug: 0, pose, poseK: 1, lean: o.lean || 0, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0, frizz: o.frizz || 0, tremble: o.tremble || 0 },
    bucket: { show: false }, ambient: o.ambient === undefined ? 0.2 : o.ambient,
    post: (lc, r, st) => {
      if (inHand) {
        const px = r.wrR[0] + 4, py = r.wrR[1] - 50;
        heldPhone(lc, px, py, tilt, t, { amp });
        phoneFingers(lc, px, py, tilt, HOMEPAL, 1);
      }
      if (o.post) o.post(lc, r, st);
    },
  });
  const ph = toWorld(sc.st, [sc.r.wrR[0] + 4, sc.r.wrR[1] - 50]);
  applyCam(cam);
  if (o.toss) {                                          // the phone in the air (world space)
    ctx.save(); ctx.translate(o.toss.x, o.toss.y); ctx.scale(sc.st.s, sc.st.s); heldPhone(ctx, 0, 0, o.toss.rot, t, { amp: 0 }); ctx.restore();
  }
  const src = o.toss ? [o.toss.x, o.toss.y] : ph;
  return Object.assign(sc, { phone: src, head: toWorld(sc.st, sc.r.head) });
}

// ---------------------------------------------------------------- 1. hook: his thumb hits PLAY ... and a squeaky stranger comes out
function povBg(t, dark = 0.55) {
  // what's behind the phone, from his eyes: the room, soft and dark, and his knees
  applyCam({ x: 540, y: 1330, zoom: 1.9, rot: 0 });
  ctx.drawImage(ROOM_STATIC, 0, 0);
  screenSpace();
  ctx.fillStyle = `rgba(4,6,20,${dark})`; ctx.fillRect(0, 0, W, H);
  for (const s of [-1, 1]) { const g = ctx.createLinearGradient(0, 1500, 0, H); g.addColorStop(0, HOMEPAL.pants); g.addColorStop(1, HOMEPAL.pantsSh); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(540 + s * 330, 1960, 300, 380, 0, 0, Math.PI * 2); ctx.fill(); }
}
SC.hook = (lt, t, shot) => {
  const c = cu();
  if (t < c.front) {
    // from his own eyes: the thumb lands on PLAY on frame 1, the waveform comes alive, the camera falls back
    povBg(t);
    const u = ramp(t, 0, c.front, E.outCubic), s = lerp(2.05, 1.06, u);
    const cam = { x: lerp(540 - (PHN.btn[0] + 60) * s, 540, u), y: lerp(930 - PHN.btn[1] * s, 880, u), s, rot: lerp(-0.07, -0.02, u) + 0.012 * Math.sin(t * 40) * decay(t, 0, 6) };
    povPhone(t, cam, { prog: t / 7.4, playing: t > 0.035, press: decay(t, 0, 6.5), amp: 0.5 + gibAmp(t), thumb: 1 - ramp(t, 0.1, 0.36, E.inOutCubic), face: FACES.grin, glowK: 0.55 + 0.45 * ramp(t, 0.1, 0.4) });
    return { glow: 0.8, zblur: 0.07 * decay(t, 0.03, 9) * (t > 0.03 ? 1 : 0), zcx: 540, zcy: 930 };
  }
  // from the front: he listens ... and likes it less and less
  const lf = t - c.front, amp = gibAmp(t);
  const doubt = ramp(t, c.voice - 0.1, c.message + 0.25), dread = ramp(t, c.and - 0.1, c.and + 0.3), hit = ramp(t, c.gib1, c.gib1 + 0.12, E.outBack);
  let face = lerpFace(FACE_LISTEN, FACE_DOUBT, doubt);
  face = lerpFace(face, Object.assign({}, FACES.worried, { lookX: 0.95, lookY: 0.2, eyeOpen: 1.25 }), dread);
  face = lerpFace(face, FACE_HORROR, hit);
  face = Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 2, 2.3) * (1 - dread)) });
  const jolt = decay(t, c.gib1, 5), [qx, qy] = shake(t, 10 * jolt, 30, 2);
  const cam = camKeys(t, [[c.front, 612, 950, 2.3], [c.front + 0.5, 604, 962, 2.02], [c.and, 600, 966, 1.96], [c.gib1 + 0.25, 606, 958, 2.1], [shot.end, 608, 956, 2.16]], E.inOutSine);
  cam.sx = qx; cam.sy = qy;
  const away = 0.35 * dread + 0.65 * hit;
  const sc = couchHero(cam, t, {
    face, amp: 0.25 + amp, hold: [lerp(118, 178, away), lerp(-226, -238, away)], tilt: 0.16 + 0.1 * away,
    lean: -0.02 * doubt - 0.05 * hit, headDX: -8 * doubt - 16 * hit, headRot: -0.04 * doubt - 0.05 * hit, frizz: 0.45 * hit, tremble: 0.03 * hit,
  });
  const ps = toScreen(cam, sc.phone[0], sc.phone[1]);
  phoneLight(ps[0] - 40, ps[1] - 40, 0.8 + 0.5 * amp, 560);
  screenSpace();
  // what comes out of it: scribble, in a spiky bubble
  const kb = ramp(t, c.front + 0.12, c.front + 0.34) * (0.74 + 0.26 * hit);
  scribbleBubble(Math.min(ps[0] + 10, 760), Math.max(ps[1] - 318 - 26 * hit, 520), 330 * (0.86 + 0.3 * hit), 210 * (0.86 + 0.3 * hit), kb, t, { tail: [-14, 168], rows: 2, rot: 0.06 });
  if (t > c.gib1) shockLines(ps[0], ps[1] - 40, 150, inv(c.gib1, c.gib1 + 0.4, t), 12, '#DCE6FF', 3);
  return { glow: 0.85, zblur: 0.3 * decay(lf, 0, 9) + 0.05 * jolt, zcx: 540, zcy: 900, flash: 0.16 * decay(lf, 0, 14) };
};

// ---------------------------------------------------------------- 2. who: "WHO is THAT?!"
SC.who = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, amp = gibAmp(t);
  const j = decay(t, c.who, 4.5) + 0.7 * decay(t, c.that, 5), [qx, qy] = shake(t, 13 * j, 30, 5);
  const cam = { x: 612, y: 950, zoom: 2.06 + 0.08 * lt / D + 0.05 * decay(t, c.that, 6), rot: 0, sx: qx, sy: qy };
  const atPhone = ramp(t, c.that - 0.1, c.that + 0.06) * (1 - ramp(t, c.that_end + 0.12, c.that_end + 0.3));
  const face = Object.assign({}, FACE_HORROR, { lookX: lerp(0, 1, atPhone), lookY: 0.05, mouthOpen: 0.75 + 0.25 * Math.abs(Math.sin(t * 17)) * (t < c.that_end ? 1 : 0.4) });
  const arm = ramp(t, c.who - 0.05, c.that + 0.1, E.outBack);
  const sc = couchHero(cam, t, {
    face, amp, hold: [lerp(178, 214, arm), lerp(-238, -246, arm)], tilt: 0.26 + 0.08 * Math.sin(t * 50) * decay(t, c.that, 5),
    lean: -0.06 - 0.02 * arm, headDX: -18, headRot: -0.05, frizz: 0.5 + 0.2 * decay(t, c.who, 4), tremble: 0.04, left: [-88, -196],
  });
  const ps = toScreen(cam, sc.phone[0], sc.phone[1]), hs = toScreen(cam, sc.head[0], sc.head[1]);
  phoneLight(ps[0] - 60, ps[1] - 20, 1.0, 620);
  screenSpace();
  shockLines(hs[0], hs[1], 250, inv(c.who, c.who + 0.45, t), 14, '#DCE6FF', 7);
  const kq = ramp(t, c.that - 0.03, c.that + 0.16, E.outBack);
  if (kq > 0) bigWord('?!', 716, 566, 180, '#FFD447', kq * (1 + 0.05 * Math.sin(t * 30)), 0.14);
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)), zblur: 0.06 * j, zcx: hs[0], zcy: hs[1] };
};

// ---------------------------------------------------------------- 3. you: "Bad news. That's you."
SC.you = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  povBg(t, 0.62);
  const push = ramp(t, c.news_end - 0.1, c.thats, E.inOutCubic), s = lerp(1.22, 1.56, push) + 0.03 * lt / D;
  const cam = { x: lerp(540, 540 + 28 * 1.56, push), y: lerp(990, 850 + 262 * 1.56, push), s, rot: -0.02 + 0.006 * Math.sin(t * 1.7) };
  const idk = ramp(t, c.ident, c.ident + 0.16, E.outBack) * (1 + 0.1 * Math.sin(t * 16) * decay(t, c.ident, 3));
  const wink = Math.exp(-(((t - (c.you + 0.12)) / 0.09) ** 2));
  povPhone(t, cam, { prog: clamp((t - 0.9) / 6.2), playing: t < c.news_end + 0.2, amp: 0.25, ident: clamp(idk), thumb: 0,
    face: Object.assign({}, FACES.grin, { blink: wink > 0.5 ? 1 : 0, browY: 0.8 }) });
  screenSpace();
  // the arrow that says it: a fat yellow one, pointing at his own face
  const ka = ramp(t, c.ident - 0.02, c.ident + 0.2, E.outBack);
  if (ka > 0) {
    const av = [cam.x + PHN.avatar[0] * s, cam.y + PHN.avatar[1] * s], bob = 10 * Math.sin(t * 9);
    for (const [cc, sc2] of [[ctx, 1], [gctx, 0.5]]) {
      cc.save(); cc.setTransform(sc2, 0, 0, sc2, 0, 0); cc.translate(av[0] + 30, av[1] - 210 * ka - bob); cc.rotate(0.12);
      cc.beginPath(); cc.moveTo(-38, -150); cc.lineTo(38, -150); cc.lineTo(38, -40); cc.lineTo(84, -40); cc.lineTo(0, 60); cc.lineTo(-84, -40); cc.lineTo(-38, -40); cc.closePath();
      cc.fillStyle = cc === ctx ? '#FFD447' : 'rgba(255,212,71,0.5)'; cc.fill();
      if (cc === ctx) { cc.lineWidth = 9; cc.lineJoin = 'round'; cc.strokeStyle = '#0B0B1A'; cc.stroke(); }
      cc.restore();
    }
    shockLines(av[0], av[1], 150 * s / 1.5, inv(c.ident, c.ident + 0.4, t), 12, '#FFE9A0', 9);
  }
  return { glow: 0.9, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- the see-through head: shared staging
function headBg(t) {
  darkBg('#17346E', '#040818');
  screenSpace();
  for (let i = 0; i < 7; i++) softDot(ctx, (i * 197 + 80) % W, 420 + ((i * 331) % 1100), 240, i % 2 ? '#3550D8' : '#1C9BB0', 0.07);
  motes(t, 0.6);
}
// a label pill with a number badge and a leader to a point on the head
function routeLabel(x, y, n, txt, col, k, to) {
  if (k <= 0.01) return;
  if (to) leader([x + 30, y - 46], to, clamp(k * 1.4), col);
  pill(x + 30, y, txt, col, k, 60);
  screenSpace();
  ctx.font = '900 60px Montserrat';
  const w = ctx.measureText(txt).width + 66, s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.translate(x + 30 - w / 2 - 8, y); ctx.scale(s, s);
  circle(ctx, 0, 0, 44, col); ctx.font = '400 60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#0B0B1A'; ctx.fillText(String(n), 0, 3);
  ctx.restore();
}

// ---------------------------------------------------------------- 4. twice: route 1 through the air, route 2 through the skull
SC.twice = (lt, t, shot) => {
  const c = cu();
  headBg(t);
  const K = camKeys(t, [[shot.start, 540, 856, 4.25], [c.hear, 540, 856, 4.42], [c.twice + 0.3, 540, 856, 4.5], [c.once1 + 0.45, 596, 842, 4.62], [c.andonce, 596, 842, 4.64],
    [c.once2 + 0.5, 486, 856, 4.64], [c.skull_end, 494, 856, 4.7], [shot.end, 500, 856, 4.74]], E.inOutCubic);
  const airK = ramp(t, c.once1 - 0.04, c.air + 0.08, E.inOutSine), boneK = ramp(t, c.once2 - 0.04, c.skull + 0.1, E.inOutSine);
  const hear = ramp(t, c.hear - 0.1, c.hear + 0.2);
  const dart = Math.sin((t - c.hear) * 9) * hear * (1 - ramp(t, c.twice, c.twice + 0.2));
  const toAir = ramp(t, c.once1, c.once1 + 0.25) * (1 - ramp(t, c.andonce, c.andonce + 0.2)), toBone = ramp(t, c.once2, c.once2 + 0.25);
  const look = [dart - 0.95 * toAir + 0.95 * toBone, 0.55 * toAir + 0.35 * toBone];
  const airOn = airK >= 0.999 ? 1 : 0, boneOn = boneK >= 0.999 ? 1 : 0;
  const o = { x: K.x, y: K.y, s: K.zoom, t, talk: 1, look, open: 1 + 0.12 * ramp(t, c.twice, c.twice + 0.15),
    browY: 0.4 + 0.9 * ramp(t, c.twice, c.twice + 0.15) * (1 - ramp(t, c.once1, c.once1 + 0.2)), browTilt: 0.3,
    air: { k: airK, a: 1, guide: 0.38 * hear, flow: true }, bone: { k: boneK, a: 1, guide: 0.38 * hear, flow: true },
    airHit: airOn * (0.5 + 0.4 * Math.sin(t * 15)) + decay(t, c.air + 0.08, 4), boneHit: boneOn * (0.5 + 0.4 * Math.sin(t * 11 + 1)) + decay(t, c.skull + 0.1, 3.5),
    vib: 0.35 * boneK + 0.8 * decay(t, c.skull, 4), hot: 0.8 * boneK, rim: 0.2 + 0.3 * decay(t, c.skull, 3) };
  vhHead(o);
  screenSpace();
  // his ears prick up on "hear yourself"
  for (const s of [-1, 1]) { const e = vhPt(o, [s * 78, 3]); shockLines(e[0] + s * 16, e[1], 30 * o.s / 4.4, inv(c.hear, c.hear + 0.4, t), 6, '#BFF0FF', 20 + s); }
  // TWICE
  const k2 = ramp(t, c.twice - 0.03, c.twice + 0.17, E.outBack) * (1 - ramp(t, c.once1 - 0.1, c.once1 + 0.12));
  if (k2 > 0) { bigWord('×2', 806, 512, 200, '#FFD447', k2 * (1 + 0.06 * Math.sin(t * 22) * decay(t, c.twice, 4)), 0.1); softDot(gctx, 806, 512, 200, '#FFD447', 0.2 * k2); }
  // the two routes, named
  const ka = ramp(t, c.air - 0.06, c.air + 0.14, E.outBack), ks = ramp(t, c.skull - 0.06, c.skull + 0.14, E.outBack);
  routeLabel(226, 1316, 1, 'AIR', VH.air, ka, vhPt(o, [-84, 70]));
  routeLabel(650, 1316, 2, 'SKULL', VH.bone, ks, vhPt(o, [44, 50]));
  if (t > c.skull) shockLines(...vhPt(o, [0, 6]), 70 * o.s, inv(c.skull, c.skull + 0.45, t), 16, '#FFD9A8', 21);
  return { glow: 0.7, capY: 1480, zblur: 0.14 * (1 - ramp(lt, 0, 0.25)), zcx: 540, zcy: 850, flash: 0.22 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 5. deep: the skull's signal is the fat, slow one
SC.deep = (lt, t, shot) => {
  const c = cu();
  headBg(t);
  const K = camKeys(t, [[shot.start, 500, 856, 4.74], [shot.start + 0.5, 540, 1046, 3.5], [shot.end, 540, 1050, 3.6]], E.inOutCubic);
  const deep = ramp(t, c.deeper - 0.04, c.deeper + 0.28, E.outBack);
  const o = { x: K.x, y: K.y, s: K.zoom, t, talk: 1, look: [0.15 * Math.sin(t * 2), -0.85 * ramp(lt, 0.3, 0.6)], open: 1 + 0.15 * clamp(deep), browY: 0.5 + 0.8 * clamp(deep), browTilt: 0.3,
    air: { k: 1, a: 0.8, guide: 0, flow: true }, bone: { k: 1, a: 1, guide: 0, flow: true },
    airHit: 0.45 + 0.3 * Math.sin(t * 15), boneHit: 0.5 + 0.4 * Math.sin(t * 9) + 0.5 * clamp(deep),
    vib: 0.4 + 1.0 * clamp(deep), hot: 0.8 + 0.2 * clamp(deep), rim: 0.2, trapped: 0.6 * clamp(deep) };
  vhHead(o);
  screenSpace();
  const kp = ramp(lt, 0.16, 0.5);
  vhScope(120, 424, 840, 286, { k: kp, deep: clamp(deep), t });
  if (t > c.deeper) shockLines(540, 624, 300, inv(c.deeper, c.deeper + 0.45, t), 14, '#FFD9A8', 23);
  return { glow: 0.7, capY: 1480, push: { k: 1 + 0.03 * decay(t, c.deeper, 5), cx: 540, cy: 620 } };
};

// ---------------------------------------------------------------- 7. mic: the microphone only gets the air route
function recPanel(x, y, w, h, t, o) {
  const k = o.k;
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 1.5);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x + w / 2, y + h / 2); c.scale(s, s); c.translate(-w / 2, -h / 2);
  rrect(c, 0, 0, w, h, 26); c.fillStyle = 'rgba(8,12,34,0.94)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(255,90,110,0.75)'; c.stroke();
  const blink = Math.sin(t * 7) > -0.2 ? 1 : 0.25;
  circle(c, w - 30, 28, 11, `rgba(255,70,90,${blink})`);
  const rows = [['AIR', VH.air, o.air || 0, true], ['SKULL', VH.bone, 0, false]];
  rows.forEach(([name, col, on, ok], i) => {
    const cy = h * (i === 0 ? 0.3 : 0.72), x0 = 172, n = 9;
    c.font = '900 40px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(name, 24, cy + 2);
    for (let j = 0; j < n; j++) {
      const lvl = ok ? on * (0.45 + 0.55 * Math.abs(Math.sin(t * 13 + j * 0.9) * Math.sin(t * 5.3 + j))) : 0;
      rrect(c, x0 + j * 22, cy - 17, 15, 34, 5); c.fillStyle = j / n < lvl ? col : 'rgba(255,255,255,0.11)'; c.fill();
    }
    const mk = clamp(i === 0 ? o.tick || 0 : o.cross || 0), ms = E.outBack(mk, 2.4);
    if (mk > 0.01) {
      c.save(); c.translate(x0 + n * 22 + 34, cy); c.scale(ms, ms); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 10;
      if (ok) { c.strokeStyle = '#4DFFB4'; c.beginPath(); c.moveTo(-16, 1); c.lineTo(-4, 14); c.lineTo(18, -14); c.stroke(); }
      else { c.strokeStyle = '#FF5A6E'; c.beginPath(); c.moveTo(-14, -14); c.lineTo(14, 14); c.moveTo(14, -14); c.lineTo(-14, 14); c.stroke(); }
      c.restore();
    }
  });
  c.restore();
}
SC.mic = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  headBg(t);
  const lookM = ramp(t, c.microphone - 0.2, c.microphone + 0.1);
  const o = { x: 540, y: 846 - 6 * lt / D, s: 3.8 + 0.1 * lt / D, t, talk: 1, look: [0.55 * lookM, 0.9 * lookM], open: 1, browY: 0.9 * lookM, browTilt: 0.6 * lookM,
    air: { k: 1, a: 0.28, guide: 0, flow: true }, bone: { k: 1, a: 1, guide: 0, flow: true }, airHit: 0.2, boneHit: 0.5 + 0.4 * Math.sin(t * 9),
    vib: 0.5, hot: 0.8, rim: 0.2 + 0.4 * ramp(t, c.blocked, c.blocked + 0.3) * (0.6 + 0.4 * Math.sin(t * 12)), edgeGlow: t > c.blocked ? '#FF9A3C' : '#7FE9FF',
    trapped: 0.9 * ramp(t, c.blocked, c.blocked + 0.25), mic: ramp(t, c.but - 0.02, c.microphone + 0.12), micIn: ramp(t, c.only - 0.05, c.only + 0.2), mouthWaves: false };
  vhHead(o);
  // the hop from his mouth into the microphone
  const hop = ramp(t, c.only - 0.08, c.only + 0.18);
  if (hop > 0.01) vhBoth(o, (cc, glow) => vhRoute(cc, glow, VH_TOMIC, { col: VH.air, w: 4.4, k: hop, a: 1, t, speed: 70, kind: 'air', head: true }));
  screenSpace();
  // the cable down to the recorder
  const mk = o.mic, end = vhPt(o, [VH_MICPOS[0] + 0.58 * 76, VH_MICPOS[1] + 0.81 * 76]), px = 104, py = 1200, pw = 474, ph = 156;
  if (mk > 0.6) { ctx.beginPath(); ctx.moveTo(end[0], end[1]); ctx.bezierCurveTo(end[0] + 10, end[1] + 60, 690, py + 150, px + pw - 6, py + ph * 0.6); ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(22,26,46,${clamp((mk - 0.6) * 3)})`; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(120,130,170,${0.7 * clamp((mk - 0.6) * 3)})`; ctx.stroke(); }
  recPanel(px, py, pw, ph, t, { k: ramp(t, c.microphone - 0.05, c.microphone + 0.25), air: hop, tick: ramp(t, c.air2, c.air2 + 0.18), cross: ramp(t, c.part, c.part + 0.18) });
  const kin = ramp(t, c.gets - 0.02, c.gets + 0.2, E.outBack);
  if (kin > 0) pill(540, 446, 'STAYS INSIDE', VH.bone, kin, 50);
  if (t > c.blocked) shockLines(...vhPt(o, [24, 62]), 34 * o.s / 3.8, inv(c.blocked, c.blocked + 0.35, t), 7, '#FFD9A8', 25);
  return { glow: 0.7, capY: 1480, zblur: 0.12 * (1 - ramp(lt, 0, 0.25)), zcx: 540, zcy: 840, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 6. trailer: how he sounds to himself
const POSE_HERO = (() => { let p = ikReach(POSES.stand, 'L', [-70, -222], -1); p = ikReach(p, 'R', [70, -222], -1); return p; })();
const FACE_SMUG = Object.assign({}, FACES.grin, { blink: 0.34, browY: 0.3, browTilt: -0.7, mouthOpen: 0.55, lookX: 0, lookY: -0.2 });
SC.trailer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const j = decay(t, c.braam, 5), [qx, qy] = shake(t, 14 * j, 30, 31);
  trailerBg(t);
  const cam = { x: 540, y: 960, zoom: 1.0 + 0.06 * lt / D, rot: 0, sx: qx, sy: qy };
  const st = { x: 540, y: 1650, s: 1.42, pose: POSE_HERO, face: FACE_SMUG, headRot: -0.03, seed: 4 };
  applyCam(cam);
  heroCape(ctx, st, t);
  charLayer(cam, st, t, { pal: PAL, ambient: 0.2 });
  // he stands in front of the sun: keep its bloom off him
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out'; gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  // a warm edge of light on his shoulders and hair
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createRadialGradient(540, 1040, 200, 540, 1040, 520); rg.addColorStop(0, 'rgba(255,170,80,0.0)'); rg.addColorStop(0.6, 'rgba(255,170,80,0.10)'); rg.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); ctx.restore();
  // the lens flare on the slam
  if (j > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const fg = ctx.createLinearGradient(0, 600, W, 600); fg.addColorStop(0, 'rgba(255,220,160,0)'); fg.addColorStop(0.5, `rgba(255,236,200,${0.7 * j})`); fg.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = fg; ctx.fillRect(0, 590, W, 26); ctx.restore(); }
  letterbox(ramp(lt, 0, 0.12, E.outCubic));
  goldTitle('YOUR VOICE', 540, 604, 178, ramp(t, c.braam - 0.03, c.braam + 0.2), t);
  const k2 = ramp(t, c.trailer - 0.02, c.trailer + 0.2, E.outBack);
  if (k2 > 0) { ctx.save(); ctx.translate(540, 730); ctx.scale(k2, k2); ctx.font = '900 50px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.strokeStyle = '#3A1206'; ctx.strokeText('ONLY IN YOUR HEAD', 0, 0); ctx.fillStyle = '#FFF4D2'; ctx.fillText('ONLY IN YOUR HEAD', 0, 0); ctx.restore(); }
  return { glow: 0.9, capY: 1570, flash: 0.28 * decay(t, c.braam, 9) + 0.2 * (1 - ramp(lt, 0, 0.1)), zblur: 0.08 * j, zcx: 540, zcy: 900 };
};

// ---------------------------------------------------------------- 8. always: karaoke night. What he hears; what the room has always heard
const FACE_SING = Object.assign({}, FACES.shock, { blink: 1, browY: 1.3, browTilt: 0.9, mouthOpen: 1 });
SC.always = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const real = ramp(t, c.realise, c.realise + 0.14);
  const K = camKeys(t, [[shot.start, 520, 900, 1.2], [c.always, 526, 894, 1.27], [c.realise + 0.32, 490, 836, 1.6], [shot.end, 490, 834, 1.64]], E.inOutCubic);
  const cam = { x: K.x, y: K.y, zoom: K.zoom, rot: 0 };
  karaokeBg(cam, t);
  const beat = Math.sin(t * 6.4) * (1 - real);
  let pose = Object.assign({}, POSES.stand, { lean: -0.05 + 0.02 * beat, armL: { a: lerp(2.2, 0.28, real) + 0.08 * beat, b: lerp(0.3, 0.2, real) }, legL: { a: 0.16, b: 0 }, legR: { a: 0.12, b: 0 }, hand: real > 0.5 ? 'open' : 'spread' });
  pose = ikReach(pose, 'R', [lerp(36, 60, real), lerp(-372, -330, real)], 1);
  let face = Object.assign({}, FACE_SING, { mouthOpen: 0.7 + 0.3 * Math.abs(Math.sin(t * 9)) });
  face = lerpFace(face, Object.assign({}, FACES.worried, { lookX: 0.95, lookY: 0.7, eyeOpen: 1.3, mouth: 'o', mouthOpen: 0.25, browY: 1.3, browTilt: 1.2, pupil: 0.6 }), real);
  const st = { x: KARA.hx, y: KARA.fy, s: KARA.hs, pose, face, headRot: lerp(-0.1, 0.04, real) + 0.02 * beat, seed: 4 };
  ellipse(ctx, st.x, st.y + 8, 130, 16, 'rgba(0,0,0,0.38)');
  const r = charLayer(cam, st, t, { pal: STAGEPAL, ambient: 0.1, post: (lc, rr, s2) => { lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s); handMic(lc, rr.wrR, -0.2); lc.restore(); } });
  applyCam(cam);
  karaokeCrowd(t);
  const hd = toScreen(cam, ...toWorld(st, r.head)), mic = toScreen(cam, ...toWorld(st, [r.wrR[0] + 10, r.wrR[1] - 56]));
  // what the room hears: the thin one, from the microphone out over the crowd
  const kr = ramp(t, c.iswhat - 0.06, c.else + 0.05, E.inOutSine);
  const B = [956, lerp(mic[1] + 190, mic[1] + 150, real)];
  waveRibbon([mic[0] + 26, mic[1]], B, t, 'thin', kr, VH.air);
  screenSpace();
  const ke = ramp(t, c.everyone - 0.04, c.everyone + 0.16, E.outBack);
  if (ke > 0) pill(Math.min(lerp(mic[0], B[0], 0.6), 800), lerp(mic[1], B[1], 0.6) - 92, 'THE ROOM', VH.air, ke, 46);
  // what he hears: a thought cloud with the fat, golden one
  const kc = ramp(lt, 0.06, 0.32) * (1 - ramp(t, c.realise + 0.02, c.realise + 0.14));
  const bx = 300, by = 572 + 6 * Math.sin(t * 3);
  thoughtBubble(bx, by, 400, 236, kc, hd[0] - 50, hd[1] - 120);
  if (kc > 0.6) { waveRibbon([bx - 150, by - 4], [bx + 150, by - 4], t, 'fat', 1, VH.bone); screenSpace(); pill(bx, by + 166, 'HIS HEAD', VH.bone, ramp(lt, 0.3, 0.5), 46); }
  if (t > c.realise) { shockLines(bx, by, 200, inv(c.realise, c.realise + 0.4, t), 14, '#FFE9D0', 31); shockLines(hd[0], hd[1], 120 * cam.zoom, inv(c.realise + 0.02, c.realise + 0.42, t), 10, '#DCE6FF', 32); }
  // ALWAYS: it was the thin one at seven, at seventeen, last week
  ['AGE 7', 'AGE 17', 'LAST WEEK'].forEach((txt, i) => {
    const k = ramp(t, c.always + i * 0.17, c.always + i * 0.17 + 0.16, E.outBack) * (1 - ramp(t, c.realise + 0.1, c.realise + 0.3));
    if (k > 0) pill([628, 706, 664][i], [968, 1058, 1148][i], txt, '#FFD447', k, 42);
  });
  // a sweat drop when it dawns on him
  if (real > 0.3) { applyCam(cam); const hw = toWorld(st, r.head); sweatDrop(ctx, hw[0] - 86, hw[1] - 30 + 40 * clamp((t - c.realise) / 0.6), 1.2, clamp(real * 2)); }
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.1)), zblur: 0.1 * (1 - ramp(lt, 0, 0.25)), zcx: 540, zcy: 900 };
};

// ---------------------------------------------------------------- 9. plug: fingers in his ears, a hum ... BOOM: that's his skull
SC.plug = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const thr = Math.sin(t * 2 * Math.PI * 3.3);                              // the throb of the hum, once we are inside his head
  const xr = ramp(t, c.boom - 0.08, c.boom + 0.08);
  const [qx, qy] = shake(t, (6 + 4 * thr) * xr, 26, 41);
  const cam = { x: 540, y: 936, zoom: 2.0 + 0.1 * lt / D + 0.14 * ramp(t, c.boom - 0.08, c.boom + 0.2, E.outBack), rot: 0, sx: qx, sy: qy };
  const inK = ramp(t, c.fingers - 0.14, c.fingers + 0.16, E.outBack);
  const base = couchPose({ hug: 0, t });
  let plugP = ikReach(base, 'L', [-104, -258], 1); plugP = ikReach(plugP, 'R', [104, -258], 1);
  const hum = ramp(t, c.humstart - 0.05, c.humstart + 0.12);
  let face = lerpFace(Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, browY: 0.5 }), Object.assign({}, FACES.calm, { blink: 1, mouth: 'flat', mouthOpen: 0.8, browY: 0.7 }), hum);
  face = lerpFace(face, Object.assign({}, FACES.startled, { mouth: 'flat', mouthOpen: 0.5, lookY: -0.6 }), xr);
  const sway = 0.045 * Math.sin(t * 3.4) * hum * (1 - xr);
  const sc = couchScene(cam, t, {
    hero: { face, hug: 0, pose: plugP, poseK: inK, headRot: sway, frizz: 0.25 * xr },
    bucket: { show: false },
    post: (lc, r, s2) => {
      // index fingers, into the ears
      if (inK > 0.45) for (const [k, sd] of [['L', -1], ['R', 1]]) {
        const w = r['wr' + k], d = r['armDir' + k], hx = w[0] + d[0] * 14, hy = w[1] + d[1] * 14, ex = r.head[0] + sd * 64, ey = r.head[1] + 4;
        line(lc, hx, hy, ex, ey, 16, HOMEPAL.skinSh); line(lc, hx, hy - 1, ex, ey - 1, 12, HOMEPAL.skin);
      }
      // ... and the skull lights up inside his head: the hum is trapped in there
      if (xr > 0.01) {
        lc.save(); lc.translate(r.head[0], r.head[1]); lc.rotate(r.lean + sway); lc.globalAlpha = xr;
        lc.beginPath(); lc.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); lc.fillStyle = '#16307A'; lc.fill();
        vhSkull(lc, { jd: 0, look: [0, -0.5], open: 1.1, t, vib: 0.7 + 0.6 * thr, hot: 0.9, browY: 1.3, browTilt: 0.5 });
        vhTrapped(lc, false, t, 0.95, { speed: 3.3, n: 3, cy: 8 });
        vhHair(lc);
        lc.beginPath(); lc.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); lc.lineWidth = 2.6; lc.strokeStyle = 'rgba(255,170,90,0.9)'; lc.stroke();
        lc.restore();
      }
    },
  });
  const hw = toWorld(sc.st, sc.r.head), hs = toScreen(cam, hw[0], hw[1]);
  applyCam(cam);
  // the hum, from outside: two little notes
  for (let i = 0; i < 3; i++) {
    const p = (((t - c.humstart) * 0.9 + i / 3) % 1), a = Math.sin(Math.PI * p) * hum * (1 - xr) * (t > c.humstart ? 1 : 0);
    if (a > 0.01) for (const [cc, al] of [[ctx, a], [gctx, a * 0.6]]) { cc.save(); cc.globalAlpha = al; musicNote(cc, hw[0] + (i % 2 ? 1 : -1) * (96 + 40 * p), hw[1] - 60 - 150 * p, 0.5 + 0.2 * p, i % 2 ? '#7FE9FF' : '#FFD447', 0.3 * Math.sin(p * 5 + i), i % 2); cc.restore(); }
  }
  screenSpace();
  if (xr > 0.01) softDot(gctx, hs[0], hs[1], 150 * cam.zoom, VH.bone, 0.22 * xr * (0.7 + 0.3 * thr));
  // BOOM
  const kb = ramp(t, c.boom - 0.05, c.boom + 0.14, E.outBack);
  if (kb > 0) { bigWord('BOOM', 540, 520, 250, VH.bone, kb * (1 + 0.05 * thr), -0.04 + 0.012 * thr); softDot(gctx, 540, 520, 380, VH.bone, 0.22 * kb); }
  if (t > c.boomhit) shockLines(hs[0], hs[1], 150 * cam.zoom, inv(c.boomhit, c.boomhit + 0.45, t), 16, '#FFD9A8', 43);
  const ky = ramp(t, c.skull2 - 0.05, c.skull2 + 0.15, E.outBack);
  if (ky > 0) { leader([724, 746], [hs[0] + 70, hs[1] - 62 * cam.zoom], clamp(ky * 1.4), VH.bone); pill(742, 704, 'YOUR SKULL', VH.bone, ky, 48); }
  return { glow: 0.82, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) + 0.14 * decay(t, c.boom, 9) };
};

// ---------------------------------------------------------------- 10. study: three mystery voices. One is his own. Guess which gets the hearts
SC.study = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  boothBg(t);
  const CW = 244, CH = 392;
  const F = ramp(t, c.without - 0.14, c.without + 0.36, E.inOutCubic);            // wide (three cards, him) -> close (voice 3, and him listening to it)
  const L = (a, b) => lerp(a, b, F);
  const cards = [{ x: L(236, 172), y: L(672, 560), sc: L(1.1, 0.72), a: L(1, 0.5) }, { x: L(540, 172), y: L(672, 872), sc: L(1.1, 0.72), a: L(1, 0.5) }, { x: L(844, 694), y: L(672, 736), sc: L(1.1, 1.74), a: 1 }];
  const act1 = ramp(t, c.people - 0.06, c.people + 0.1) * (1 - ramp(t, c.recorded - 0.08, c.recorded + 0.05));
  const act2 = ramp(t, c.recorded - 0.05, c.recorded + 0.1) * (1 - ramp(t, c.without - 0.1, c.without + 0.05));
  const act3 = ramp(t, c.without - 0.05, c.without + 0.1);
  const st1 = 3 * ramp(t, c.rated, c.rated + 0.3), st2 = 2 * ramp(t, c.voices, c.voices + 0.24), st3 = 5 * ramp(t, c.hearts, c.hearts + 0.62);
  const flip = ramp(t, c.flip, c.flip + 0.34, E.inOutCubic), gold = ramp(t, c.more - 0.05, c.more + 0.2);
  const see = ramp(t, c.more_end + 0.0, c.more_end + 0.12);
  const dreamy = ramp(t, c.without + 0.15, c.knowing + 0.2), bliss = ramp(t, c.hearts - 0.1, c.hearts + 0.2);
  // him at the desk, headphones on
  let face = Object.assign({}, FACES.calm, { lookX: -0.7 * act1 + 0.7 * act3, lookY: -0.9, browY: 0.7, mouth: 'flat', mouthOpen: 0.4, blink: blinkAt(t, 3, 2.7) });
  face = lerpFace(face, Object.assign({}, FACE_DEADPAN, { lookX: 0, lookY: -0.8, mouth: 'wavy', browTilt: -0.3 }), act2);
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0.6, lookY: -0.6, blink: 0.5, mouthOpen: 0.35, browY: 1.0, browTilt: 0.5 }), dreamy);
  face = lerpFace(face, FACE_BLISS, bliss);
  face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 0.9, lookY: -0.9, eyeOpen: 1.45 }), see);
  let pose = Object.assign({}, POSES.stand, { armL: { a: 0.5, b: -0.9 }, armR: { a: 0.5, b: -0.9 } });
  let clasp = ikReach(pose, 'L', [-22, -334], -1); clasp = ikReach(clasp, 'R', [22, -334], 1);
  pose = lerpPose(pose, clasp, bliss * (1 - see));
  pose = lerpPose(pose, Object.assign({}, POSES.stand, { armL: { a: 2.2, b: 0.5 }, armR: { a: 2.2, b: 0.5 }, hand: 'spread' }), see);
  const bob = Math.sin(t * 5.2) * (act1 + act3) * (1 - see), swoon = Math.sin(t * 2.6) * bliss * (1 - see);
  const hs = L(1.72, 1.84), hx = L(540, 316), hy = L(1212, 1268);
  const st = { x: hx, y: hy + 470 * hs, s: hs, pose, face, headRot: 0.03 * bob + 0.07 * swoon, headDX: 7 * swoon, headDY: 4 * bob - 14 * see, noLegs: true, frizz: 0.4 * see, seed: 4 };
  const hpK = ramp(lt, -0.1, 0.24);
  const r = charLayer(CAM0, st, t, { pal: HOMEPAL, ambient: 0.14, post: (lc, rr, s2) => { lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s); headphones(lc, rr, s2, hpK); lc.restore(); } });
  boothDesk(L(1446, 1508));
  const hd = toWorld(st, r.head);
  // the voice he is listening to: a thread from its card to his headphones
  [act1, act2, act3].forEach((a, i) => { if (a > 0.02) waveRibbon([cards[i].x - (i === 2 ? 110 * F : 0), cards[i].y + CH / 2 * cards[i].sc + 6], [hd[0] + ((i - 1) * 70) * (1 - F) + 96 * hs * F * 0.9, hd[1] - 72 * hs], t, 'thin', a, VH.air); });
  screenSpace();
  // the cards
  for (let i = 0; i < 3; i++) {
    voiceCard(cards[i].x, cards[i].y, CW, CH, { k: ramp(lt, -0.16 + i * 0.1, 0.1 + i * 0.1), n: i + 1, active: [act1, act2, act3][i], stars: [st1, st2, st3][i], t, sc: cards[i].sc, alpha: cards[i].a,
      flip: i === 2 ? flip : 0, gold: i === 2 ? gold : 0, face: Object.assign({}, FACES.grin, { browY: 0.8 }), rot: (i - 1) * 0.025 * (1 - F) });
  }
  const ks = ramp(t, c.inone - 0.04, c.inone + 0.16, E.outBack) * (1 - F);
  if (ks > 0) pill(540, 420, '1 STUDY · 80 PEOPLE', '#8FB8FF', ks, 38);
  if (t > c.flip + 0.16) shockLines(cards[2].x, cards[2].y - 80, 250, inv(c.flip + 0.16, c.flip + 0.56, t), 16, '#FFE9A0', 51);
  // hearts, from him to that voice
  for (let i = 0; i < 7; i++) {
    const p = inv(c.hearts + i * 0.15, c.hearts + i * 0.15 + 0.9, t);
    if (p <= 0 || p >= 1 || see > 0.5) continue;
    const x = lerp(hd[0] + 60, cards[2].x - 40 + 40 * Math.sin(i * 2), E.inOutSine(p)) + 34 * Math.sin(p * 6 + i), y = lerp(hd[1] - 190, cards[2].y + 120, p) - 80 * Math.sin(Math.PI * p);
    heartIcon(x, y, 1.1 + 0.6 * Math.sin(Math.PI * p), Math.sin(Math.PI * p));
  }
  if (t > c.more) shockLines(cards[2].x, cards[2].y + (CH / 2 - 48) * cards[2].sc, 240, inv(c.more, c.more + 0.45, t), 18, '#FFE9A0', 52);
  const kx = ramp(t, c.more_end + 0.02, c.more_end + 0.16, E.outBack);
  if (kx > 0) bigWord('!', hd[0] - 170, hd[1] - 150, 200, '#FFD447', kx, -0.16);
  return { glow: 0.85, capY: 1560, flash: 0.2 * (1 - ramp(lt, 0, 0.1)), push: { k: 1 + 0.03 * lt / D, cx: 600, cy: 800 } };
};

// ---------------------------------------------------------------- 11. button: he plays it again ... and rather likes it
SC.button = (lt, t, shot) => {
  const c = cu(), amp = gibAmp(t);
  const cam = camKeys(t, [[shot.start, 606, 958, 1.92], [c.youjust, 600, 956, 2.0], [shot.end, 596, 954, 2.08]], E.inOutSine);
  const out = 1 - ramp(t, c.replay + 0.1, c.maybe + 0.3), warm = ramp(t, c.youjust - 0.12, c.hate2 + 0.1), hug = ramp(t, c.its - 0.14, c.you2 + 0.04, E.inOutCubic);
  let face = lerpFace(Object.assign({}, FACE_DOUBT, { browTilt: 1.3, eyeOpen: 0.9, blink: 0.25 }), Object.assign({}, FACE_LISTEN, { browY: 1.1, mouthOpen: 0.6 }), ramp(t, c.maybe, c.voice2));
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0.9, lookY: 0.2, mouthOpen: 0.45, browY: 0.8 }), warm);
  face = lerpFace(face, FACE_BLISS, hug);
  const sc = couchHero(cam, t, { face, amp, hold: [lerp(lerp(118, 172, out), 62, hug), lerp(-226, -262, hug)], tilt: lerp(0.16 + 0.1 * out, -0.26, hug),
    headRot: -0.04 * out + 0.05 * warm + 0.1 * hug, headDX: -10 * out + 8 * hug, lean: -0.03 * out + 0.03 * hug, ringK: 1 - hug });
  const ps = toScreen(cam, sc.phone[0], sc.phone[1]), hs = toScreen(cam, sc.head[0], sc.head[1]);
  phoneLight(ps[0] - 40, ps[1] - 40, 0.5 + 0.3 * amp, 520);
  screenSpace();
  if (t > c.replay) shockLines(ps[0], ps[1], 60, inv(c.replay, c.replay + 0.3, t), 8, '#A0FFDC', 61);
  const kb = ramp(t, c.replay, c.replay + 0.2) * (1 - ramp(t, c.voice2 - 0.1, c.voice2_end));
  scribbleBubble(Math.min(ps[0] + 10, 770), Math.max(ps[1] - 300, 520), 300, 190, kb, t, { tail: [-14, 150], rows: 2, rot: 0.06 });
  const kh = ramp(t, c.you2 - 0.04, c.you2 + 0.16, E.outBack);
  if (kh > 0) heartIcon(hs[0] + 150, hs[1] - 190 - 20 * ramp(t, c.you2, c.you2 + 0.8), 2.2 * kh * (1 + 0.1 * Math.sin(t * 12)), 1);
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.1)) };
};

// ---------------------------------------------------------------- 12. sub: the tease, the click, the hiccup, the phone lands on PLAY (loop)
function teaseCard(k, t) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(540, 524); ctx.rotate(-0.035); ctx.scale(k, k);
  rrect(ctx, -300, -92, 600, 184, 26); ctx.fillStyle = '#FFF6D8'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
  ctx.font = '800 36px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6A5A2A'; ctx.fillText('NEXT UP', -52, -48);
  ctx.font = '400 84px Anton'; ctx.fillStyle = '#1A1C2C'; ctx.fillText('HICCUPS', -52, 26);
  // a little "hic!" that keeps popping
  const p = ((t * 1.6) % 1), hk = E.outBack(clamp(p * 4), 2.4) * (1 - ramp(p, 0.7, 1));
  ctx.translate(206, -4 - 22 * hk); ctx.rotate(0.14); ctx.scale(0.4 + 0.6 * hk, 0.4 + 0.6 * hk);
  ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, rr = i % 2 ? 62 : 46; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#FF5A6E'; ctx.fill();
  ctx.font = '400 40px Anton'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('HIC!', 0, 2);
  ctx.restore();
}
SC.sub = (lt, t, shot) => {
  const c = cu();
  if (t >= c.catch) {
    // back to his own eyes: the phone drops into his hand, the thumb comes in for PLAY (the next frame is frame 1)
    povBg(t);
    const u = inv(c.catch, TLd.duration, t), s = 2.05, e = E.outCubic(u);
    const cam = { x: 540 - (PHN.btn[0] + 60) * s, y: 930 - PHN.btn[1] * s - 900 * (1 - e), s, rot: -0.07 + 0.3 * (1 - e) };
    povPhone(t, cam, { prog: 0, playing: false, press: 0, amp: 0, thumb: 0.1 + 0.9 * E.inOutCubic(u), face: FACES.grin, glowK: 0.55 });
    return { glow: 0.8, blur: [0, 60 * (1 - e)], flash: 0.16 * (1 - ramp(u, 0, 0.3)) };
  }
  const hic = t - c.hic, jolt = hic > 0 ? Math.exp(-hic * 5) * Math.cos(hic * 17) : 0, up = ramp(t, c.hic, c.hic + 0.1);
  const m1 = t - c.hic1, mini = m1 > 0 ? Math.exp(-m1 * 7) * Math.cos(m1 * 21) : 0;      // the small one, after "why we hiccup."
  const cover = ramp(t, c.hic1 + 0.2, c.hic1 + 0.42, E.outBack) * (1 - up);              // ... so he claps a hand over his mouth
  const [qx, qy] = shake(t, 12 * decay(t, c.hic, 6), 30, 71);
  const cam = camKeys(t, [[shot.start, 596, 954, 2.08], [c.sub_in, 586, 948, 1.96], [c.hic, 580, 944, 1.94], [c.hic + 0.3, 580, 900, 1.8], [TLd.duration, 590, 860, 1.9]], E.inOutSine);
  cam.sx = qx; cam.sy = qy;
  const settle = ramp(t, shot.start, shot.start + 0.5, E.inOutCubic);
  let face = lerpFace(FACE_BLISS, Object.assign({}, FACES.grin, { lookX: 0, lookY: 0, mouthOpen: 0.5, browY: 0.6, blink: blinkAt(t, 5, 2.6) }), settle);
  face = lerpFace(face, Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.4, lookX: 0, lookY: 0 }), clamp(Math.abs(mini) * 1.6));
  face = lerpFace(face, Object.assign({}, FACES.worried, { lookX: 0.8 * Math.sin((t - c.hic1) * 4.2), lookY: -0.2, eyeOpen: 1.25, browY: 1.1, browTilt: 1.0 }), clamp(cover));
  face = lerpFace(face, Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.5, lookX: 0.5, lookY: -1 }), up);
  // the phone: against his cheek, back down ... then the hiccup throws it
  const fu = inv(c.hic + 0.02, c.play2, t), flying = fu > 0;
  const hold = [lerp(62, 118, settle) + 20 * up, lerp(-262, -226, settle) - 110 * up];
  const base = [ROOM.hx + (hold[0] + 4) * ROOM.hs, ROOM.seatY + (hold[1] - 50) * ROOM.hs];
  const toss = flying ? { x: base[0] - 30 * fu + 30 * Math.sin(fu * 3), y: base[1] + 60 - 560 * 4 * fu * (1 - fu) * 0.62 - 120 * fu, rot: 0.16 + Math.PI * 4 * fu } : null;
  const sc = couchHero(cam, t, { face, amp: 0, hold, tilt: lerp(-0.26, 0.16, settle), headRot: 0.1 * (1 - settle) - 0.06 * jolt, headDX: 8 * (1 - settle), headDY: -30 * jolt * (hic > 0 ? 1 : 0) - 8 * up - 13 * mini,
    lean: 0.03 * (1 - settle), frizz: 0.5 * decay(t, c.hic, 3) + 0.2 * decay(t, c.hic1, 5), tremble: 0.05 * decay(t, c.hic, 4), toss,
    left: flying ? [-110 - 30 * up, -250 - 60 * up] : (cover > 0.01 ? [lerp(-52, -8, clamp(cover)), lerp(-40, -226, clamp(cover))] : undefined), ringK: 0,
    // the head is drawn over the arms, so the hand that covers his mouth is drawn again on top
    post: (lc, r) => {
      if (cover < 0.5 || flying) return;
      const hx = r.head[0] - 2, hy = r.head[1] + 44;
      lc.save(); lc.globalAlpha = clamp((cover - 0.5) * 4);
      ellipse(lc, hx, hy, 33, 25, HOMEPAL.skinSh, -0.12); ellipse(lc, hx - 1, hy - 2, 30, 22, HOMEPAL.skin, -0.12);
      for (let i = 0; i < 4; i++) line(lc, hx - 20 + i * 12, hy - 14, hx - 17 + i * 12, hy + 12, 2.2, 'rgba(160,96,70,0.55)');
      lc.restore();
    } });
  const hs = toScreen(cam, sc.head[0], sc.head[1]);
  screenSpace();
  teaseCard(ramp(t, c.nextup - 0.04, c.nextup + 0.2, E.outBack) * (1 - ramp(t, c.sub_in - 0.1, c.sub_in + 0.14)), t);
  // a small "hic" first
  const k1 = springStep(m1, 6, 0.45) * (1 - ramp(t, c.hic1 + 0.5, c.hic1 + 0.7));
  if (m1 > 0 && k1 > 0.01) speech('hic', Math.min(hs[0] + 250, 730), hs[1] - 190, k1, '#FF5A6E', 64, 0.12);
  // HIC!
  const kh = springStep(hic, 5, 0.4) * (1 - ramp(t, c.catch - 0.15, c.catch));
  if (hic > 0) { speech('HIC!', Math.min(hs[0] + 280, 730), hs[1] - 250, kh, '#FF5A6E', 120, 0.1); shockLines(hs[0], hs[1] + 40, 170 * cam.zoom / 1.9, inv(c.hic, c.hic + 0.4, t), 14, '#FFFFFF', 72); }
  return { glow: 0.85, flash: 0.2 * decay(t, c.hic, 10), zblur: 0.25 * ramp(t, c.catch - 0.1, c.catch, E.inCubic), zcx: 540, zcy: 700 };
};

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
SC.cover = (lt, t, shot) => {
  const tt = 4.6, cam = { x: 618, y: 874, zoom: 2.1, rot: 0 };
  const face = Object.assign({}, FACE_HORROR, { lookX: 1, lookY: 0.05, mouthOpen: 1 });
  const sc = couchHero(cam, tt, { face, amp: 0.55, hold: [200, -236], tilt: 0.3, lean: -0.07, headDX: -18, headRot: -0.05, frizz: 0.6, left: [-88, -196] });
  const ps = toScreen(cam, sc.phone[0], sc.phone[1]);
  phoneLight(ps[0] - 60, ps[1] - 20, 0.7, 620);
  screenSpace();
  scribbleBubble(806, 792, 270, 180, 1, 0.3, { tail: [26, 150], rows: 2, rot: 0.08 });
  bigWord('IS THAT', 540, 486, 150, '#FFFFFF', 1, -0.03);
  bigWord('MY VOICE?!', 540, 650, 178, '#FFD447', 1, -0.03);
  softDot(gctx, 540, 590, 460, '#FFD447', 0.14);
  return { glow: 0.85, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initRoom();
}
