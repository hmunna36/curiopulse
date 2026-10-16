// What If You Went to Space WITHOUT a Suit? (Second by Second) — the shots, act 1. Each SC.<id>(lt, t, shot) draws one
// frame (lt = seconds in the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from
// a cue (make_timeline.py); the airlock's continuity is alState(t) in state.js.
// The film: the hiker wants a helmet-free selfie with the Earth for his niece Pip ("you look like a goldfish"); he
// presses DEPRESS thinking it means "take the picture" and the airlock opens on space. The viewer breathes out with
// him; the clock counts his seconds in space with no suit: no explosion, the silence, no freezing (space is a thermos),
// his spit boiling, the oxygen pouring out of his blood, lights out at fifteen. Act 2: his big sister races to the
// airlock while he swells (the chip bag), the skin holds (the viewer's pinch), Kittinger's hand, LeBlanc's chamber, the
// gut, the heart. Act 3: how long a rescue has, the air on the viewer's palm, REPRESS, he wakes, the selfie in the
// goldfish bowl, and Pip's bowl becomes the Earth's thin blue line. Colour script: airlock white → beacon red → space
// black and Earth blue → lung pink → brain lights → black → corridor orange → sepia → palm blue → white air → violet
// bedroom → the thin blue line.
'use strict';

const cu = () => TLd.cues;
const SHOT = (id) => TLd.shots.find((s) => s.id === id);
const flashOf = (t, times, rate = 11) => (times || []).reduce((m, f) => Math.max(m, t >= f ? Math.exp(-(t - f) * rate) : 0), 0);
const WIDE = { x: 960, y: 540, zoom: 1, rot: 0 };
function mixCam(a, b, k) { return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), k)), rot: lerp(a.rot || 0, b.rot || 0, k) }; }
// a camera that puts his head at screen point (sx, sy) at this zoom
function headCam(S, zoom, sx = W / 2, sy = H / 2) {
  const h = Object.assign({}, S.hero, { y: S.hero.y + (S.hero.dy || 0) });
  const hp = alHeadPt(h);
  return { x: hp[0] - (sx - W / 2) / zoom, y: hp[1] - (sy - H / 2) / zoom, zoom, rot: 0 };
}
// a camera that puts world point P at screen point (sx, sy)
function ptCam(P, zoom, sx = W / 2, sy = H / 2) { return { x: P[0] - (sx - W / 2) / zoom, y: P[1] - (sy - H / 2) / zoom, zoom, rot: 0 }; }
function shakeCam(cam, t, amp) { const [dx, dy] = shake(t, amp, 18, 3); return Object.assign({}, cam, { x: cam.x + dx / cam.zoom, y: cam.y + dy / cam.zoom }); }
const alPost = (x = {}) => Object.assign({ glow: 0.85 }, x);
const inPost = (x = {}) => Object.assign({ glow: 1.0 }, x);
// a label pill with an outline, screen space (k pops it)
function tagPill(txt, x, y, k, col = '#FFD447', size = 50) { if (k > 0.01) pill(x, y, txt, col, clamp(k), size); }
// a big stamp word with a pop and a little tilt (screen space)
function stampWord(txt, x, y, size, col, k, rot = -0.12) { if (k > 0.01) bigWord(txt, x, y, size, col, E.outBack(clamp(k), 2.2), rot); }
// the badge for a viewer's test (hud.js's safetyBadge, green): lines of text, top right
function testBadge(lines, k) { safetyBadge(lines, k, W - 110, 92); }

// ================================================================= THE HOOK
// Frame 1: his face, close, cheeks full of a held breath, hair and air streaming toward the open hatch, the Earth behind
// him; the beacon flashes red. "WRONG." stamps beside him; he blows it all out on "Breathe OUT".
SC.hook = (lt, t, shot) => {
  const c = cu(), S = alState(t);
  let cam = headCam(S, 3.25 - 0.25 * ramp(t, 0, c.dont, E.inOutSine), 720, 470);
  cam = shakeCam(cam, t, 5 + 10 * kickAt(t, c.dont, 4));
  alScene(cam, t, S);
  screenSpace();
  stampWord('WRONG!', 1380, 330, 190, '#FF5A6E', ramp(t, c.dont - 0.05, c.dont + 0.25), -0.14);
  return alPost({ zblur: 0.05 * (1 - ramp(lt, 0, 0.4)), flash: 0.25 * kickAt(t, c.dont, 8) });
};
// "Breathe OUT, with him... all of it... now." his cheeks empty, a cloud of breath leaves for the hatch; the camera pulls
// back to the airlock; the clock starts on "now"; the badge asks the viewer to do it with him
SC.out = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const close = headCam(S, 3.0, 720, 470), med = headCam(S, 1.55, 760, 420);
  const cam = mixCam(close, med, ramp(t, c.allofit - 0.3, c.now + 0.4, E.inOutCubic));
  alScene(cam, t, S);
  screenSpace();
  testBadge(['DO IT WITH HIM', 'BREATHE OUT'], ramp(t, c.breatheOut, c.breatheOut + 0.35) * (1 - ramp(t, c.now + 1.2, c.now + 1.5)));
  return alPost({ flash: 0.3 * kickAt(t, c.now, 7) });
};
// "Holding it in could tear your lungs." his chest as an x-ray: the held air balloons the lungs until they crack (red)
SC.lungs = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const k = ramp(lt, 0, c.tear + 0.3 - shot.start, E.inCubic), cr = ramp(t, c.tear + 0.25, c.tear + 0.5);
  const v = { x: 960, y: 900 + 30 * ramp(lt, 0, D), s: 0.95 + 0.25 * k };
  const [sx, sy] = shake(t, 10 * cr, 30, 7);
  ctx.save(); ctx.translate(sx, sy);
  chestX(v, t, { o2: 1, ex: 0, fill: 1 + 0.12 * k, heartGlow: 0.4, air: 1 - cr, airDir: 1 });
  if (cr > 0.01) {   // the tear: jagged red cracks across both lungs
    for (const sd of [-1, 1]) {
      const pts = jagged(mulberry32(sd > 0 ? 3 : 4), v.x + sd * 120 * v.s, v.y - 360 * v.s, v.x + sd * 210 * v.s, v.y - 120 * v.s, 70 * v.s, 4);
      const n = Math.max(2, Math.round(pts.length * cr));
      poly(ctx, pts.slice(0, n), 10, '#FF3A4E'); poly(gctx, pts.slice(0, n).map((p) => [p[0], p[1]]), 18, 'rgba(255,60,80,0.8)');
    }
  }
  ctx.restore();
  stampWord('TEAR!', 1500, 300, 150, '#FF5A6E', cr, 0.1);
  return inPost({ flash: 0.4 * kickAt(t, c.tear + 0.3, 9), push: { k: 1 + 0.05 * lt / D, cx: 960, cy: 500 } });
};
// "Now, second by second, here's what your body does... and how long a rescue has." the whole airlock, wide: the camera
// drifts to the panel, where the green REPRESS button lights up (someone will have to press it)
SC.promise = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const a = { x: 1180, y: 560, zoom: 1.12, rot: 0 }, b = ptCam([AL.panX, AL.panY + 150], 2.1, 900, 560);
  const cam = mixCam(a, b, ramp(t, c.rescue - 0.9, c.rescue + 0.6, E.inOutCubic));
  S.room.flashRep = 0.8 * ramp(t, c.rescue - 0.2, c.rescue + 0.3) * (0.7 + 0.3 * Math.sin(t * 8));
  alScene(cam, t, S);
  screenSpace();
  tagPill('HOW LONG?', 1300, 260, ramp(t, c.rescue, c.rescue + 0.3), '#4DFFB4', 60);
  return alPost();
};
// "All he wanted was a selfie for his niece, Pip. Without the helmet. 'You look like a goldfish,' she said." his phone at
// the end of the stick: Pip's message and her drawing; then the helmet he left behind, floating, spinning
SC.want = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const r = alHero({ x: -9999, y: 0 }, t, {}) && null;   // (no-op: keeps the layer clear)
  const phoneAt = (h) => { const p = alPt(h, [0, 0]); return p; };
  // the phone: where the stick ends (rig-local: the right wrist plus the stick)
  const h = Object.assign({}, S.hero, { y: S.hero.y + (S.hero.dy || 0) });
  const st = alFloatPose(h), rg = rig(st), w = alPt(h, rg.wrR), a = h.stick.a + (h.rot || 0), L = 420 * AL.hs;
  const ph = [w[0] + Math.cos(a) * (L + 60 * AL.hs), w[1] + Math.sin(a) * (L + 60 * AL.hs)];
  const camPhone = ptCam(ph, 3.2, 760, 520), camHelmet = ptCam([S.helmet.x, S.helmet.y], 2.4, 1100, 500);
  const k = ramp(t, c.noHelmet - 0.4, c.noHelmet + 0.3, E.inOutCubic) * (1 - ramp(t, c.goldfish - 0.6, c.goldfish, E.inOutCubic));
  const cam = mixCam(camPhone, camHelmet, k);
  alScene(cam, t, S);
  screenSpace();
  const gk = ramp(t, c.goldfish - 0.1, c.goldfish + 0.3);
  if (gk > 0.01) {   // Pip's drawing, big: him as a goldfish in a bowl
    ctx.save(); ctx.translate(1420, 420); const sc = E.outBack(gk, 2) * 1.6; ctx.scale(sc, sc); ctx.rotate(0.08);
    circle(ctx, 0, 0, 120, 'rgba(127,233,255,0.25)'); ctx.lineWidth = 8; ctx.strokeStyle = '#3A7AC8'; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.stroke();
    goldfish(ctx, 0, 10, 1.2, t); ctx.restore();
    softDot(gctx, 1420, 420, 260, '#FF9A3C', 0.3 * gk);
  }
  tagPill('PIP, 7', 1420, 160, ramp(t, c.want + 0.8, c.want + 1.1) * (1 - gk), '#FF86A6', 46);
  return alPost();
};
// "So he pressed the button marked DEPRESS... thinking it meant 'take the picture.'" a rewind: him at the panel, grinning,
// pressing DEPRESS with the selfie stick up; Ball's eyes go flat. Then back to now.
SC.depress = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = alState(t);
  const rw = ramp(lt, 0, 0.35);                         // the rewind's glitch in
  // ten seconds ago: the room still full of air, the hatch shut, him at the panel
  const R0 = Object.assign({}, S.room, { open: 0, gauge: 1, beacon: 0, red: 0, air: 0, dep: kickAt(t, c.depressW, 3) > 0.05 ? 1 : 0, flashDep: kickAt(t, c.depressW, 3) });
  const cam = mixCam(ptCam([AL.panX + 140, AL.panY - 60], 1.9, 900, 520), ptCam([AL.panX + 60, AL.panY + 40], 2.5, 800, 560), ramp(t, c.depressW - 0.5, c.depressW + 0.2, E.inOutCubic));
  alRoom(cam, t, R0);
  applyCam(cam);
  alHelmet(ctx, AL.panX + 260, AL.panY - 260, 0.7, 0.2);
  const push = ramp(t, c.depressW - 0.35, c.depressW, E.inOutCubic);
  const hh = { x: AL.panX + 330, y: AL.panY + 470, s: 0.78, face: Object.assign({}, FACES.selfie, { lookX: -0.4, lookY: 0.2 }), hair: 0, rot: -0.05,
    stick: { k: 1, a: -1.6 }, phone: { kind: 'msg' }, L: [lerp(-200, -300, push), lerp(-330, -350, push)], R: [140, -420], legs: 0.4 };
  alHero(cam, t, hh);
  applyCam(cam);
  alBall(AL.panX + 520, AL.panY - 300, 0.8, t, { mood: t > c.thinking ? 'flat' : 'calm', look: [-1, 0.5] });
  screenSpace();
  stampWord('◀◀ 10 SECONDS AGO', 560, 150, 64, '#FFFFFF', rw, 0);
  if (t > c.picture - 0.1) { ctx.save(); ctx.translate(1450, 360); const k = E.outBack(ramp(t, c.picture - 0.1, c.picture + 0.2), 2); ctx.scale(k, k);
    rrect(ctx, -110, -70, 220, 140, 20); ctx.fillStyle = '#2A2E44'; ctx.fill(); circle(ctx, 0, 0, 46, '#11131F'); circle(ctx, 0, 0, 30, '#3A5AA8'); circle(ctx, -10, -10, 8, '#FFFFFF');
    rrect(ctx, -90, -92, 60, 26, 8); ctx.fillStyle = '#2A2E44'; ctx.fill(); ctx.restore(); stampWord('?', 1590, 250, 140, '#FFD447', ramp(t, c.picture, c.picture + 0.3), 0.15); }
  return alPost({ vhs: 0.5 * (1 - rw) + 0.06, desat: 0.35, tint: '#FFE0B0', tintA: 0.12, flash: 0.5 * kickAt(t, c.depressW, 6) });
};

// ================================================================= ACT 1: what he would feel
// "Second one. Good news: you don't explode. That's just the movies." the movies' version on a screen: an astronaut puffs
// up and goes BOOM; MYTH is stamped over it
SC.explode = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#140A28', '#04020C'); screenSpace();
  for (let i = 0; i < 7; i++) { rrect(ctx, 200 + i * 230, 900, 180, 140, 40); ctx.fillStyle = '#0A0614'; ctx.fill(); circle(ctx, 290 + i * 230, 870, 60, '#0A0614'); }   // the audience, from behind
  const boom = ramp(t, c.noExplode - 0.9, c.noExplode - 0.1);
  movieScreen(960, 440, 1.35 + 0.05 * lt / D, ramp(lt, 0, 0.35), t, { boom });
  softDot(gctx, 960, 440, 500, '#6FB6FF', 0.25);
  if (t > c.noExplode + 0.3) { bigX(960, 440, 300, ramp(t, c.noExplode + 0.3, c.noExplode + 0.6)); }
  stampWord('MYTH', 1480, 260, 170, '#FF5A6E', ramp(t, c.movies - 0.05, c.movies + 0.25), 0.16);
  return inPost({ flash: 0.4 * kickAt(t, c.noExplode - 0.1, 8) });
};
// "Your skin is tougher than that." back in the airlock: whole. He pats his chest and checks his arms
SC.intact = (lt, t, shot) => {
  const S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 1.75 + 0.15 * lt / D, 840, 380);
  alScene(cam, t, S);
  return alPost();
};
// "Second two. The air is gone... and so is the sound. The alarm is screaming. He can't hear a thing." wide: the last fog
// leaves through the hatch; the beacon flashes, its sound waves stop dead (crossed out); then his face, shouting
SC.silence = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const wide = { x: 1020, y: 470, zoom: 1.08, rot: 0 }, beacon = ptCam([AL.beacon[0], AL.beacon[1] + 120], 2.0, 960, 420), face = headCam(S, 2.6, 860, 470);
  let cam = mixCam(wide, beacon, ramp(t, c.alarmW - 0.5, c.alarmW + 0.1, E.inOutCubic));
  cam = mixCam(cam, face, ramp(t, c.alarmW + 1.4, c.alarmW + 1.9, E.inOutCubic));
  alScene(cam, t, S);
  // the alarm's sound waves: rings off the beacon that shrink and stop when the sound goes
  applyCam(cam);
  const [bx, by] = AL.beacon, snd = 1 - ramp(t, c.soundGone, c.soundGone + 0.5);
  for (let i = 0; i < 4; i++) { const ph = (t * 1.8 + i / 4) % 1; ctx.beginPath(); ctx.arc(bx, by + 20, 50 + 160 * ph, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,90,110,${(1 - ph) * snd})`; ctx.stroke(); }
  screenSpace();
  const mu = ramp(t, c.alarmW, c.alarmW + 0.3);
  if (mu > 0.01 && t < c.alarmW + 1.6) {   // a speaker icon, crossed out
    ctx.save(); ctx.translate(1340, 300); const k = E.outBack(mu, 2); ctx.scale(k, k);
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-60, -30); ctx.lineTo(-20, -30); ctx.lineTo(30, -75); ctx.lineTo(30, 75); ctx.lineTo(-20, 30); ctx.lineTo(-60, 30); ctx.closePath(); ctx.fill();
    for (const r of [60, 95]) { ctx.beginPath(); ctx.arc(30, 0, r, -0.6, 0.6); ctx.lineWidth = 10; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); }
    line(ctx, -80, 90, 120, -90, 16, '#FF3A4E'); ctx.restore();
  }
  return alPost();
};
// wordless: no sound. His face, mouth wide open in a shout; Ball's eyes huge. Only his heartbeat.
SC.nosound = (lt, t, shot) => {
  const S = alState(t), D = shot.end - shot.start;
  S.hero.face = Object.assign({}, FACES.shock, { lookX: 0.2, lookY: -0.1 });
  const cam = headCam(S, 3.6 + 0.3 * lt / D, 960, 500);
  alScene(cam, t, S);
  return alPost({ desat: 0.25 });
};
// "Is he freezing? Not yet. Space is cold, but empty: there's nothing to carry his heat away." he hugs himself; his own
// warmth stays round him as an orange glow; little heat arrows leave his skin and come straight back
SC.cold = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 1.5 + 0.12 * lt / D, 800, 330);
  alScene(cam, t, S, { after: (cm, res, h) => {
    const k = ramp(t, c.heatAway - 0.6, c.heatAway);
    if (k <= 0.01) return;
    const mid = alPt(h, [0, -300]);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * 6.283 + 0.3, ph = (t * 0.9 + i * 0.13) % 1, d = 180 + 140 * Math.sin(ph * Math.PI);
      const x = mid[0] + Math.cos(a) * d, y = mid[1] + Math.sin(a) * d * 1.3;
      circle(ctx, x, y, 12, rgba('#FF9A3C', 0.9 * k)); softDot(gctx, x, y, 26, '#FF9A3C', 0.6 * k);
    }
  } });
  screenSpace();
  tagPill('NOT YET', 1320, 260, ramp(t, c.notyet, c.notyet + 0.25) * (1 - ramp(t, c.empty, c.empty + 0.2)), '#7FE9FF', 60);
  tagPill('NOTHING OUT THERE TO TAKE HIS HEAT', 1250, 260, ramp(t, c.empty + 0.1, c.empty + 0.4), '#FF9A3C', 46);
  return alPost();
};
// "Space is basically... a giant thermos." a giant thermos pops in beside him: its walls with nothing between them
SC.thermos = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 1.25, 560, 300);
  alScene(cam, t, S);
  screenSpace();
  const k = ramp(t, c.thermosW, c.thermosW + 0.35);
  ctx.fillStyle = `rgba(5,6,15,${0.5 * k})`; ctx.fillRect(0, 0, W, H);
  thermos(1350, 520, 0.95, k, t, { heat: ramp(t, c.thermosW + 0.6, c.thermosW + 1.2) });
  tagPill('NOTHING', 1350 + 175, 120, ramp(t, c.thermosW + 0.8, c.thermosW + 1.1), '#C8A8FF', 40);
  return alPost({ flash: 0.2 * kickAt(t, c.thermosW, 9) });
};
// "But his spit? Touch your tongue to your lip. Feel that? Second five: his is boiling." his face, close; the viewer's
// second test (the badge); his tongue comes out and the spit on it starts to bubble
SC.spit = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 3.0 + 0.6 * ramp(t, c.s5 - 0.4, c.boilingW + 0.3, E.inOutCubic), 820, 430);
  alScene(cam, t, S);
  screenSpace();
  testBadge(['TRY IT', 'TONGUE TO YOUR LIP'], ramp(t, c.touch, c.touch + 0.3) * (1 - ramp(t, c.s5 - 0.3, c.s5)));
  stampWord('BOILING!', 1450, 640, 140, '#FF5A6E', ramp(t, c.boilingW + 0.1, c.boilingW + 0.4), 0.1);
  return alPost({ flash: 0.2 * kickAt(t, c.boilingW + 0.1, 9) });
};
// "With no air pressing on it, water boils at body temperature. His spit. His tears. And boiling steals heat so
// fast... his tongue could frost over." macro on his mouth: 100 °C crossed out, 37 °C; his eyes; frost on his tongue
SC.boil = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const mouth = headCam(S, 5.2, 760, 380), eyes = headCam(S, 5.0, 900, 640);
  let cam = mixCam(mouth, eyes, env2(t, c.tearsW - 0.35, c.steals - 0.1, 0.35));
  alScene(cam, t, S);
  screenSpace();
  const th = ramp(t, c.bodyT - 0.2, c.bodyT + 0.2) * (1 - ramp(t, c.tearsW - 0.4, c.tearsW - 0.1));
  if (th > 0.01) {
    bigWord('100°C', 1450, 300, 120, '#FFFFFF', E.outBack(th, 2), -0.06);
    if (t > c.bodyT + 0.3) line(ctx, 1290, 340, 1610, 250, 14, '#FF3A4E');
    bigWord('37°C', 1460, 520, 170, '#FF5A6E', E.outBack(ramp(t, c.bodyT + 0.45, c.bodyT + 0.75), 2), 0.05);
  }
  const fr = ramp(t, c.frost - 0.1, c.frost + 0.5);
  if (fr > 0.01) { softDot(ctx, 760, 520, 300, '#BFF0FF', 0.25 * fr); stampWord('FROST?', 1440, 340, 130, '#BFF0FF', fr, -0.1); }
  return alPost({ push: { k: 1 + 0.04 * lt / D, cx: 760, cy: 450 } });
};
// "Second ten. The real danger is in here. His lungs are empty, so the oxygen in his blood pours OUT... the wrong way."
// a round window opens on his chest; the camera dives through it to an air sac of his lung: no air in it, and the
// oxygen beads leave the red cells, cross into the sac and stream away
SC.oxygen = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const dive = ramp(t, c.inhere - 0.1, c.lungsEmpty - 0.1, E.inCubic);
  if (dive < 1) {
    const cam = headCam(S, 1.6 + 0.6 * dive, 860, 330);
    alScene(cam, t, S);
    const h = Object.assign({}, S.hero, { y: S.hero.y + (S.hero.dy || 0) });
    const [wx, wy] = toScreen(cam, ...alPt(h, [0, -330]));
    const open = ramp(t, c.s10 + 0.2, c.inhere, E.outBack), R = lerp(110 * open, Math.hypot(W, H), dive * dive);
    screenSpace();
    ctx.save(); ctx.beginPath(); ctx.arc(lerp(wx, 960, dive), lerp(wy, 540, dive), Math.max(1, R), 0, 7); ctx.clip();
    alveolus(t, { out: 0, empty: 0.2, z: lerp(0.35, 1, dive) });
    ctx.restore();
    ctx.beginPath(); ctx.arc(lerp(wx, 960, dive), lerp(wy, 540, dive), Math.max(1, R), 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#FF86A6'; ctx.stroke();
    return alPost({ zblur: 0.08 * dive * (1 - dive) * 4 });
  }
  screenSpace();
  const out = ramp(t, c.pours - 0.4, c.wrongWay + 0.6, E.inOutSine);
  alveolus(t, { out, empty: ramp(t, c.lungsEmpty, c.lungsEmpty + 0.8), z: 1.0 + 0.05 * ramp(lt, 0, D) });
  tagPill('HIS LUNGS: EMPTY', 960, 140, ramp(t, c.lungsEmpty + 0.3, c.lungsEmpty + 0.6) * (1 - ramp(t, c.pours - 0.5, c.pours - 0.2)), '#C8A8FF', 50);
  return inPost();
};
// "And that blood, with almost nothing left in it, is on its way to his brain." his head and neck as an x-ray: the
// oxygen-poor blood (a dark front with a sour face) climbs the neck toward the brain's city of lights
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const front = 0.15 + 0.7 * ramp(t, c.thatBlood, c.toBrain + 0.4, E.inOutSine);
  const k = ramp(lt, 0, D);
  headXray(t, { front, dark: 0, x: 860 - 40 * k, y: 520 - 30 * k, s: 0.95 + 0.08 * k });
  tagPill('ALMOST NO OXYGEN', 1480, 700, ramp(t, c.thatBlood + 1.0, c.thatBlood + 1.3), '#C8A8FF', 46);
  return inPost();
};
// "Fourteen... fifteen... lights out." the dark blood reaches the brain; the city's lights go out in patches, all at once
SC.lights = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const dk = 0.35 * ramp(t, c.s14, c.s14 + 0.5) + 0.3 * ramp(t, c.s15, c.s15 + 0.5) + 0.6 * ramp(t, c.lightsOut, c.lightsOut + 0.45, E.inCubic);
  const z = 1.0 + 0.6 * ramp(lt, 0, D, E.inOutCubic);
  ctx.save(); ctx.translate(880, 360); ctx.scale(z, z); ctx.translate(-880, -360);
  headXray(t, { front: 1.0, dark: dk, x: 860, y: 520, s: 1.0 });
  ctx.restore();
  const bl = ramp(t, c.lightsOut + 0.2, c.dark, E.inCubic);
  screenSpace(); if (bl > 0) { ctx.fillStyle = `rgba(0,0,0,${bl})`; ctx.fillRect(0, 0, W, H); gctx.fillStyle = `rgba(0,0,0,${bl})`; gctx.fillRect(0, 0, W, H); }
  return inPost();
};
// wordless: black. Only a heartbeat.
SC.black = (lt, t, shot) => {
  screenSpace(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  return { glow: 0, grain: 0 };
};

function initScenes2() { initAirlock(); }
