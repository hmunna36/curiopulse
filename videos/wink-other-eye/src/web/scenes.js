// Can You WINK Without the Other Eye Moving? 😉 (wink-other-eye, 20 Nov 2026): the shots. Each SC.<id>(lt, t, shot) draws one
// frame (lt = seconds inside the shot, t = seconds in the video). Every beat comes from a cue: cu().name (timeline.json).
// The place: a night café, a spy rendezvous (cafe.js); his face can wink and squint one eye at a time, with a puppet string
// on his eyelids (woface.js); the contact is a grey cat in a fedora (cats-purr's purrcat.js).
// Sides: his RIGHT eye is screen-left (shutR, sqR), his LEFT eye screen-right (shutL, sqL): he winks the right one, the
// ringed eye is the left one.
'use strict';

const cu = () => TLd.cues;
const WO_CANDLE = { ...LIGHTS.candle };
setLights({ dare: WO_CANDLE, cafe: WO_CANDLE, ots: WO_CANDLE, answer: WO_CANDLE, string: WO_CANDLE, blink: WO_CANDLE,
  puppet: WO_CANDLE, wink: WO_CANDLE, prop: WO_CANDLE, slip: WO_CANDLE, board: LIGHTS.diagram, catwink: WO_CANDLE, button: WO_CANDLE, cover: WO_CANDLE });

// ---------------------------------------------------------------- his face, by the story's clock
const WO_FACE0 = { eyeOpen: 1.05, pupil: 1, lookX: 0, lookY: 0, browY: 0.25, browTilt: -0.1, mouth: 'smirk', mouthOpen: 0, blink: 0, cross: 0, holdBlink: true };
function woF(o) { return Object.assign({}, WO_FACE0, o); }
// the attempt: his right eye snaps shut, the left one squints with it (k 0..1 = how far into the attempt)
function woAttempt(k, sq = 0.78) {
  return woF({ shutR: clamp(k * 1.25), sqL: sq * clamp((k - 0.15) * 1.4), strain: 0.7 * k, mouth: k > 0.2 ? 'side' : 'smirk', browTilt: -0.1 + 0.4 * k });
}
// the macro of his face (frame 0 and the loop): the camera on his head, big
function woMacroSt() { return woHeroSt({}); }
function woMacroCam(st, z = 5.0, dy = 0) {
  const h = woHeadPt(st, 0, 0);
  return { x: h[0], y: h[1] + 8 + dy, zoom: z, rot: 0 };
}
// the hero, drawn on the set, then his table in front; returns the rig
function woDrawHero(st, t, o = {}) {
  const r = drawCharacter(ctx, st, t, WO_PAL);
  if (o.after) o.after(r);
  if (!o.noTable) woHeroTable(ctx, t);
  return r;
}
// the puppet bar (a wooden cross) at world (x, y), size s, turned a
function woBar(x, y, s, a = 0) {
  actor(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
    rrect(ctx, -70, -9, 140, 18, 8); ctx.fillStyle = '#B9773A'; ctx.fill();
    rrect(ctx, -9, -60, 18, 120, 8); ctx.fillStyle = '#A0652E'; ctx.fill();
    for (const [px, py] of [[-62, 0], [62, 0], [0, -52], [0, 52]]) circle(ctx, px, py, 6, '#5A3418');
    ctx.restore();
  });
}

// ---------------------------------------------------------------- 1. the dare (DEMO): his face alone, the ringed eye
function woMacroFrame(t, face, ringK, bad, dareK, o = {}) {
  const st = Object.assign(woMacroSt(), { face });
  const cam = woMacroCam(st, o.zoom || 5.0, o.dy === undefined ? -20 : o.dy);
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t, { noTable: true });
  applyCam(cam);
  const e = woHeadPt(st, 24, -2);
  woRing(e[0], e[1], 30 * (o.ringS || 1), ringK, t, bad);
  woDare(dareK, t);
  return { st, cam };
}
SC.dare = (lt, t, shot) => {
  const c = cu(), k = snapRamp(t, c.wink0, c.wink0 + 0.18, { pre: 0.08, ant: 0.05, over: 1.3 });
  const face = woAttempt(clamp(k));
  const bad = clamp((t - c.wink0 - 0.1) / 0.25);
  woMacroFrame(t, face, 1, bad, 1);
  if (bad > 0.5) { screenSpace(); shockLines(780, 1000, 230, popK(t, c.wink0 + 0.2, 1.6, 0.05, 0.2) * 0.9, 9, '#FF5A6E', 3); }
  return { capY: 1520, glow: 0.9 };
};

// ---------------------------------------------------------------- 2. the café opens up, him mid-attempt
SC.cafe = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 620, y: 1150, zoom: 1.62 - 0.06 * E.inOutSine(clamp(lt / D)), rot: 0 };
  applyCam(cam);
  woCafeBack(t);
  woCatTable(ctx, t);
  woSpyCat(ctx, WO.catX + 10, WO.catY - 20, WO.catS, t, { look: [-1, 0.1], eyes: 'open', ears: 0.6 });
  const pose = armAt(armAt(POSES.sit, 'L', [-96, -120], [-40, -60]), 'R', [96, -120], [40, -60]);
  const st = woHeroSt({ pose, face: woAttempt(1), headDX: 3 * Math.sin(t * 31) });
  woDrawHero(st, t);
  const e = woHeadPt(st, 24, -2);
  woRing(e[0], e[1], 34, 1 - clamp(lt / 0.5), t, 1);
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 3. past the cat: his double squint across the room
SC.ots = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const pose = armAt(armAt(POSES.sit, 'L', [-96, -120], [-40, -60]), 'R', [96, -120], [40, -60]);
  const st = woHeroSt({ pose, face: woAttempt(1, 0.85), headDX: 2.5 * Math.sin(t * 29) });
  const h = woHeadPt(st, 0, 0);
  const cam = { x: h[0] + 90, y: h[1] + 140 + 16 * lt, zoom: 2.0 + 0.05 * lt / D, rot: 0 };
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t);
  // the cat in the foreground, big, its back to the room's light: it tilts its head at "right?"
  screenSpace();
  const tilt = 0.28 * E.outBack(clamp((t - c.right) / 0.3));
  woSpyCat(ctx, 770, 2005, 2.05, t, { look: [-1, -0.35], eyes: 'open', tilt, ears: 0.5 - 0.6 * clamp((t - c.right) / 0.3), noTail: true });
  return { capY: 1120, focus: [toScreen(cam, h[0], h[1])[0], toScreen(cam, h[0], h[1])[1]] };
};

// ---------------------------------------------------------------- 4. the answer: he relaxes, then feels something above him
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const rel = E.outCubic(clamp((t - c.relax) / 0.25));
  const up = E.inOutCubic(clamp((t - c.your_two) / 0.35));
  const face = rel < 1 ? woF({ shutR: 1 - rel, sqL: 0.8 * (1 - rel), strain: 0.6 * (1 - rel), mouth: rel > 0.5 ? 'grin' : 'side', mouthOpen: 0.35 }) : woF({ mouth: 'grin', mouthOpen: 0.35 - 0.2 * up, lookY: -1 * up, lookX: 0.2 * up, browY: 0.5 + 0.4 * up });
  const pose = armAt(armAt(POSES.sit, 'L', [-96, -120], [-40, -60]), 'R', [96, -120], [40, -60]);
  const st = woHeroSt({ pose, face, headRot: -0.06 * up });
  const h = woHeadPt(st, 0, 0);
  const cam = { x: h[0] + 40, y: h[1] + 110 - 14 * lt, zoom: 2.75 + 0.1 * lt / D, rot: 0 };
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t);
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 5. the string drops in and ties both upper lids
function woStringFace(t, extra = {}) {
  const c = cu();
  const k = clamp((t - c.share) / 0.4);
  const taut = E.outBack(clamp((t - c.taut) / 0.1), 2.2);
  const bob = (1 - taut) * (0.75 + 0.25 * Math.sin((t - c.share) * 9));   // it dangles, slack, until "string."
  return woF(Object.assign({ mouth: 'o', mouthOpen: 0.35, lookY: -0.9, browY: 0.9, eyeOpen: 1.1,
    str: { k, slackL: bob, slackR: bob, slackTop: 0.6 * (1 - taut), knot: [0, -118], top: [0, -1200 + 90 * (1 - taut)] } }, extra));
}
SC.string = (lt, t, shot) => {
  const c = cu();
  const pose = POSES.sit;
  const wide = t >= c.cut_stringup;
  let face = woStringFace(t);
  if (wide) face = Object.assign(face, { lookY: -1, cross: t > c.taut + 0.05 ? 1 : 0, mouth: t > c.taut ? 'o' : 'flat', mouthOpen: t > c.taut ? 0.7 : 0.2, browY: t > c.taut ? 1.3 : 0.6 });
  const st = woHeroSt({ pose, face });
  const cam = wide ? woMacroCam(st, 2.45 - 0.08 * clamp((t - c.cut_stringup) / 1.2), -60) : woMacroCam(st, 5.2 + 0.25 * clamp(lt / 1.4), -10);
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t, { noTable: !wide });
  return { capY: wide ? 1330 : 1500 };
};

// ---------------------------------------------------------------- 6. Blink: the string jerks, BOTH lids drop
function woPullCurve(t) {
  const c = cu();
  const b1 = popK(t, c.blink - 0.02, c.blink + 0.28, 0.07, 0.12);                       // "Blink." a full blink
  const b2 = 0.55 * popK(t, c.pulls - 0.04, c.drop - 0.25, 0.12, 0.2);                 // "That pulls it..." half
  return Math.max(b1, b2);
}
SC.blink = (lt, t, shot) => {
  const k = woPullCurve(t);
  const face = woF({ blinkSet: k, mouth: 'flat', mouthOpen: 0.2, browY: 0.4 - 0.5 * k, str: { k: 1, knot: [0, -118], top: [0, -1200 + 140 * k] } });
  const st = woHeroSt({ pose: POSES.sit, face });
  const cam = woMacroCam(st, 4.4 + 0.2 * lt, 0);
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t, { noTable: true });
  return { capY: 1500 };
};

// ---------------------------------------------------------------- 7. the puppet: the string runs up to a bar in his own hand
function woPuppetPose(yank) {
  // his right arm (screen-left) up, holding the bar above his head; yank 0..1 pulls it down
  const w = [-112, -388 + 62 * yank], e = [-162, -268 + 30 * yank];
  return armAt(armAt(POSES.sit, 'L', e, w), 'R', [96, -120], [40, -60]);
}
SC.puppet = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const yank = snapRamp(t, c.both - 0.05, c.both + 0.12, { over: 1.25 }) * (1 - E.inOutCubic(clamp((t - c.drop_end - 0.25) / 0.3)));
  const pose = woPuppetPose(clamp(yank));
  const st0 = woHeroSt({ pose });
  const r = rig(pose), wr = toWorld(st0, r.wrL);
  const bar = [wr[0] + 8, wr[1] - 30];
  const top = woToHead(st0, bar[0], bar[1]);
  const face = woF({ blinkSet: clamp(yank * 1.1), mouth: yank > 0.5 ? 'flat' : 'smirk', browY: 0.5, str: { k: 1, knot: [0, -118], top } });
  const st = Object.assign(st0, { face });
  const cam = { x: 570, y: 1175 - 30 * lt / D, zoom: 1.45, rot: 0 };
  applyCam(cam);
  woCafeBack(t);
  woCatTable(ctx, t);
  // the cat loses patience: it lifts a paw and looks at its watch (the escalate beat), then taps the table
  const watch = clamp((t - c.both) / 0.3) * (1 - clamp((t - c.drop_end - 0.1) / 0.3));
  woSpyCat(ctx, WO.catX + 10, WO.catY - 20, WO.catS, t, { look: watch > 0.5 ? [0.3, 0.8] : [-1, 0], eyes: watch > 0.5 ? 'half' : 'open', paw: watch, pawTo: [60, -200], pawSide: -1, ears: 0.2 });
  if (watch > 0.05) {   // the wristwatch on its lifted paw (gold, a white face, two hands)
    const wx = WO.catX + 10 + lerp(-24, 60, watch) * WO.catS, wy = WO.catY - 20 + lerp(-6, -200, watch) * WO.catS + 14 * WO.catS;
    actor(() => { circle(ctx, wx, wy, 15 * WO.catS * 1.4, '#E8B04A'); });
    paint(() => { circle(ctx, wx, wy, 11 * WO.catS * 1.4, '#FFFFFF'); line(ctx, wx, wy, wx, wy - 8, 2.2, '#272B45'); line(ctx, wx, wy, wx + 6, wy + 2, 2.2, '#272B45'); });
  }
  woDrawHero(st, t);
  woBar(bar[0], bar[1], 1.25, -0.15 + 0.1 * yank);
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 8. a wink: pull the bar AND prop one lid up with a finger
function woWinkPose(yank) {
  const w = [-112, -388 + 62 * yank], e = [-162, -268 + 30 * yank];
  return armAt(armAt(POSES.sit, 'L', e, w), 'R', [118, -250], [76, -300]);   // his left hand up at his left eye
}
SC.wink = (lt, t, shot) => {
  const c = cu();
  const fin = E.outBack(clamp((t - c.a_wink) / 0.3), 1.6);
  const yank = snapRamp(t, c.pulling - 0.05, c.pulling + 0.14, { over: 1.25 });
  const pose = woWinkPose(clamp(yank));
  const st0 = woHeroSt({ pose });
  const r = rig(pose), wr = toWorld(st0, r.wrL), bar = [wr[0] + 8, wr[1] - 30];
  const face = woF({ shutR: clamp(yank * 1.1), sqL: 0, eyeOpen: 1.15, strain: 0.4 * yank, mouth: 'side', side: 0.6,
    str: { k: 1, knot: [0, -118], top: woToHead(st0, bar[0], bar[1]), slackL: yank }, finger: { k: fin, press: yank } });
  const st = Object.assign(st0, { face });
  const h = woHeadPt(st, 0, 0);
  const cam = { x: h[0] + 30, y: h[1] + 60, zoom: 2.15, rot: 0 };
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t);
  woBar(bar[0], bar[1], 1.25, -0.12);
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 9. the fingertip holding the lid UP
function woHoldFace(t, slip = 0, shake = 0) {
  const c = cu();
  const drop = E.outBounce ? E.outBounce(clamp(slip)) : clamp(slip);
  return woF({ shutR: 1, eyeOpen: 1.18 - 0.08 * drop, sqL: 0.82 * drop, strain: 0.55 + 0.45 * clamp((t - c.but) / 1.4), mouth: 'side', side: 0.8,
    str: { k: 1, knot: [0, -118], top: [-40, -1200], slackL: 1 - drop }, finger: { k: 1, press: 1 - slip, slip }, lookX: 0.1 * shake });
}
SC.prop = (lt, t, shot) => {
  const pose = woWinkPose(1);
  const st = woHeroSt({ pose, face: woHoldFace(t) });
  const e = woHeadPt(st, 24, -6);
  const cam = { x: e[0] - 8, y: e[1] + 24 - 6 * lt, zoom: 7.2 + 0.25 * lt, rot: 0 };
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t, { noTable: true });
  return { capY: 1520 };
};

// ---------------------------------------------------------------- 10. but your grip slips
SC.slip = (lt, t, shot) => {
  const c = cu();
  const slip = clamp(snapRamp(t, c.slip_go, c.slip_land, { pre: 0.06, ant: 0.04, over: 1.1 }));
  const shake = Math.sin(t * 47) * clamp((t - c.but) / 1.0);
  const pose = woWinkPose(1);
  const st = woHeroSt({ pose, face: woHoldFace(t, slip, shake), headDX: 1.4 * shake });
  let cam;
  if (t < c.cut_grip) {   // close on his face, sweating
    const h = woHeadPt(st, 0, 0);
    cam = { x: h[0] + 20, y: h[1] + 40, zoom: 3.3, rot: 0 };
  } else {                // snap in to the fingertip and the lid, from below
    const e = woHeadPt(st, 30, -14);
    cam = { x: e[0] + 10, y: e[1] + 30, zoom: 6.0, rot: 0 };
  }
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t, { noTable: t >= c.cut_grip });
  if (slip > 0.6) { applyCam(cam); const e2 = woHeadPt(st, 24, -2); woRing(e2[0], e2[1], 30, popK(t, c.slip_land, c.slip_land + 0.8, 0.05, 0.2), t, 1); }
  return { capY: t < c.cut_grip ? 1330 : 1520 };
};

// ---------------------------------------------------------------- 11. the study: the café's chalkboard, 96 out of 100
function woChalkFace(c, x, y, r, kind, a = 1) {
  // a chalk face: a circle, two eyes (one shut in a wink), the other open (kind 'clean') or squinting ('squint')
  c.lineCap = 'round';
  const col = kind === 'clean' ? `rgba(120,255,190,${a})` : kind === 'squint' ? `rgba(255,170,90,${a})` : `rgba(240,240,225,${a})`;
  c.strokeStyle = col; c.lineWidth = r * 0.2;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  // the winking eye (left on screen): a shut curve
  c.beginPath(); c.moveTo(x - r * 0.55, y - r * 0.18); c.quadraticCurveTo(x - r * 0.35, y, x - r * 0.15, y - r * 0.18); c.stroke();
  if (kind === 'squint') { c.beginPath(); c.moveTo(x + r * 0.15, y - r * 0.2); c.lineTo(x + r * 0.55, y - r * 0.2); c.stroke(); }
  else { c.beginPath(); c.arc(x + r * 0.35, y - r * 0.2, r * 0.15, 0, Math.PI * 2); c.stroke(); }
  c.beginPath(); c.moveTo(x - r * 0.35, y + r * 0.42); c.quadraticCurveTo(x, y + r * 0.6, x + r * 0.4, y + r * 0.3); c.stroke();
}
SC.board = (lt, t, shot) => {
  const c = cu();
  if (t < c.cut_board) {   // he turns to the chalkboard on the wall (wide, low)
    const turn = E.inOutCubic(clamp(lt / 0.45));
    const face = woF({ shutR: 0, sqL: 0.5, lookX: 1 * turn, lookY: -0.4 * turn, mouth: 'flat', strain: 0.2, holdBlink: true });
    const st = woHeroSt({ pose: POSES.sit, face, headRot: 0.12 * turn });
    const cam = { x: 640, y: 1060, zoom: 1.15, rot: 0 };
    applyCam(cam);
    woCafeBack(t);
    woCatTable(ctx, t);
    woSpyCat(ctx, WO.catX + 10, WO.catY - 20, WO.catS, t, { look: [-0.6, 0.1], eyes: 'half', ears: 0 });
    woDrawHero(st, t);
    // the small menu board lights up as he looks
    softDot(gctx, 922, 670, 160, '#FFF4D8', 0.35 * turn);
    return { capY: 1330 };
  }
  // the chalkboard itself, filling the frame
  screenSpace();
  ctx.fillStyle = '#7A4E22'; ctx.fillRect(0, 0, W, H);
  rrect(ctx, 50, 330, W - 100, 1380, 18); ctx.fillStyle = '#1F3A30'; ctx.fill();
  paint(() => {
    // chalk smudges
    for (let i = 0; i < 9; i++) softDot(ctx, 120 + 840 * hash(i * 3.1), 420 + 1200 * hash(i * 7.7), 160, '#FFFFFF', 0.035);
    ctx.font = '800 54px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(240,240,225,0.9)';
    ctx.fillText('ONE STUDY', 540, 470);
    // the count: rolls up to 96 on "ninety-six"
    const n = Math.round(96 * E.outCubic(clamp((t - c.ninety + 0.05) / 0.55)));
    const pop = E.outBack(clamp((t - c.ninety) / 0.25), 2);
    if (pop > 0) {
      ctx.save(); ctx.translate(430, 700); ctx.scale(pop, pop); ctx.rotate(-0.03);
      ctx.font = '400 330px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,212,71,0.35)'; ctx.strokeText(String(n), 0, 0);
      ctx.fillStyle = '#FFD447'; ctx.fillText(String(n), 0, 0);
      ctx.restore();
    }
    const of = E.outBack(clamp((t - c.hundred) / 0.25), 2);
    if (of > 0) { ctx.save(); ctx.translate(790, 760); ctx.scale(of, of); ctx.font = '400 120px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(240,240,225,0.95)'; ctx.fillText('/ 100', 0, 0); ctx.restore(); }
    // 100 chalk faces, 10 x 10: they all wink; on the count 96 of them squint (orange), 4 stay clean (green)
    const clean = new Set([7, 33, 58, 91]);
    for (let i = 0; i < 100; i++) {
      const col = i % 10, row = Math.floor(i / 10), x = 128 + col * 78, y = 925 + row * 58;
      const on = clamp((t - (c.cut_board + 0.02 * i * 0.25)) / 0.12);
      if (on <= 0) continue;
      const flip = clamp((t - (c.ninety + 0.006 * i)) / 0.08);
      const kind = clean.has(i) ? (flip > 0.5 ? 'clean' : 'plain') : (flip > 0.5 ? 'squint' : 'plain');
      woChalkFace(ctx, x, y, 26 * E.outBack(on, 1.6), kind, 0.95);
      if (kind === 'clean') { softDot(gctx, x, y, 40, '#4DFFB4', 0.5); }
    }
  });
  // glow on the number
  softDot(gctx, 430, 700, 240, '#FFD447', 0.25 * E.outCubic(clamp((t - c.ninety) / 0.3)));
  return { capY: 1565, push: { k: 1 + 0.04 * clamp((t - c.cut_board) / 2.8), cx: 540, cy: 900 } };
};

// ---------------------------------------------------------------- 12. the cat winks back... and ITS other eye squints too
function woCatWinkFrame(t, lt) {
  const c = cu();
  const w = clamp((t - c.cat_wink) / 0.08), sq = clamp((t - c.cat_squint) / 0.06);
  const eyes = w < 0.5 ? ['open', 'open'] : sq < 0.5 ? ['shut', 'open'] : ['shut', 'half'];
  const lid = sq > 0.5 ? 0.55 : undefined;
  const cx = WO.catX + 10, cy = WO.catY - 20;
  const head = purPt(cx, cy, WO.catS, {}, 0, 0);
  const cam = { x: head[0] - 10, y: head[1] + 50 - 8 * lt, zoom: 3.5, rot: 0 };
  applyCam(cam);
  woCafeBack(t);
  woCatTable(ctx, t);
  woSpyCat(ctx, cx, cy, WO.catS, t, { look: [-0.2, 0], eyes, lid, ears: sq > 0.5 ? -0.6 : 0.5, tip: sq, mouth: sq > 0.5 ? 'open' : 'w', tilt: -0.1 * w });
  if (sq > 0.5) { applyCam(cam); const e = purPt(cx, cy, WO.catS, { tilt: -0.1 }, 33, -7); woRing(e[0], e[1], 21, popK(t, c.cat_squint + 0.03, c.cat_squint + 0.9, 0.05, 0.15), t, 1); }
  return cam;
}
SC.catwink = (lt, t, shot) => {
  woCatWinkFrame(t, lt);
  return { capY: 1330 };
};

// ---------------------------------------------------------------- 13. the button: back to the macro, the loop
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // from a close shot of him grinning at the cat, the camera pushes into the macro of frame 0 and settles there
  const u = E.inOutCubic(clamp((t - c.now) / (c.other - c.now + 0.35)));
  const settle = clamp((t - (shot.end - 0.55)) / 0.2);
  const grin = 1 - clamp((t - c.other) / 0.35);
  const face = grin > 0 ? woF({ mouth: 'grin', mouthOpen: 0.3 * grin, lookX: 0.4 * grin, browY: 0.25 + 0.4 * grin }) : woF({});
  const st = Object.assign(woMacroSt(), { face });
  const cam = woMacroCam(st, lerp(2.6, 5.0, u), lerp(60, -20, u));
  applyCam(cam);
  woCafeBack(t);
  woDrawHero(st, t, { noTable: u > 0.6 });
  applyCam(cam);
  const e = woHeadPt(st, 24, -2);
  const ring = E.outBack(clamp((t - c.other) / 0.25), 1.8);
  woRing(e[0], e[1], 30, ring, t, 0);
  woDare(clamp((t - (c.eye_last_end + 0.05)) / 0.3) * 1 + settle * 0, t);
  return { capY: 1520 };
};

// the cover: his double squint with the ringed eye, and two words
SC.cover = (lt, t, shot) => {
  woMacroFrame(t, woAttempt(1, 0.85), 1, 1, 0, { zoom: 4.2, dy: 0 });
  screenSpace();
  bigWord('WINK.', 540, 520, 190, '#FFFFFF', 1, -0.03);
  bigWord('ONE EYE?', 540, 1415, 170, '#FFD447', 1, 0.02);
  return { noCaptions: true };
};

function initScenes2() {
  WO_WALL = woPaintWall();
}
