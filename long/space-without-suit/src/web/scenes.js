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
function testBadge(lines, k, x = W - 120, y = 80) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = '900 50px Montserrat';
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 84, h = 40 + 64 * lines.length;
  ctx.translate(x - w / 2, y + h / 2); const sc = E.outBack(clamp(k), 2); ctx.scale(sc, sc); ctx.rotate(-0.02);
  rrect(ctx, -w / 2, -h / 2, w, h, 28); ctx.fillStyle = 'rgba(8,12,34,0.9)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => { ctx.font = i === 0 ? '900 40px Montserrat' : '900 50px Montserrat'; ctx.fillStyle = i === 0 ? '#4DFFB4' : '#FFFFFF'; ctx.fillText(l, 0, -h / 2 + 52 + 64 * i); });
  ctx.restore();
  softDot(gctx, x - w / 2, y + h / 2, w * 0.6, '#4DFFB4', 0.25 * k);
}

// ================================================================= THE HOOK
// Frame 1: his face, close, cheeks full of a held breath, hair and air streaming toward the open hatch, the Earth behind
// him; the beacon flashes red. "fifteen seconds": the thumbnail's 15 SECONDS lands beside him (a punch-in); "Hold your
// breath": the camera punches in on his cheeks; "WRONG." stamps beside him and the camera snaps back.
SC.hook = (lt, t, shot) => {
  const c = cu(), S = alState(t);
  const p1 = kickAt(t, c.fifteenW, 3.5), p2 = ramp(t, c.holdW - 0.15, c.holdW + 0.2, E.outBack) * (1 - ramp(t, c.dont - 0.1, c.dont + 0.15));
  let cam = headCam(S, 3.15 + 0.35 * p1 + 0.9 * p2, lerp(720, 860, p2), lerp(470, 400, p2));
  cam = shakeCam(cam, t, 5 + 12 * kickAt(t, c.dont, 4) + 8 * p1);
  alScene(cam, t, S);
  screenSpace();
  const fk = ramp(t, c.fifteenW + 0.05, c.fifteenW + 0.3) * (1 - ramp(t, c.holdW - 0.3, c.holdW - 0.05));
  stampWord('15', 1350, 330, 260, '#FFD447', fk, -0.08); stampWord('SECONDS', 1370, 520, 110, '#FFFFFF', fk, -0.08);
  stampWord('WRONG!', 1380, 330, 190, '#FF5A6E', ramp(t, c.dont - 0.05, c.dont + 0.25), -0.14);
  return alPost({ zblur: 0.05 * (1 - ramp(lt, 0, 0.4)) + 0.04 * kickAt(t, c.holdW, 6), flash: 0.25 * kickAt(t, c.dont, 8) });
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
// "Now, second by second, here's what your body does... and how long a rescue has." back to now (the rewind's glitch
// out): the airlock, wide, the camera sweeping across it; a cut to the panel, where the green REPRESS button lights up
SC.promise = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  if (t < c.rescue - 0.85) {
    const cam = mixCam({ x: 1300, y: 520, zoom: 1.35, rot: 0 }, { x: 900, y: 540, zoom: 1.05, rot: 0 }, ramp(lt, 0, c.rescue - 0.85 - shot.start, E.inOutSine));
    alScene(cam, t, S);
    return alPost({ vhs: 0.5 * (1 - ramp(lt, 0, 0.3)) });
  }
  const cam = ptCam([AL.panX, AL.panY + 150], 2.1 + 0.15 * ramp(t, c.rescue - 0.85, shot.end), 900, 560);
  S.room.flashRep = 0.8 * ramp(t, c.rescue - 0.2, c.rescue + 0.3) * (0.7 + 0.3 * Math.sin(t * 8));
  alScene(cam, t, S);
  screenSpace();
  tagPill('HOW LONG?', 1300, 260, ramp(t, c.rescue, c.rescue + 0.3), '#4DFFB4', 60);
  return alPost();
};
// "All he wanted was a selfie for his niece, Pip. Without the helmet. 'You look like a goldfish,' she said." his phone,
// big: Pip's face, her messages (one on each beat), then her drawing of him as a goldfish in a bowl; behind it the
// helmet he left floating
SC.want = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 1.5 + 0.2 * lt / D, 560, 430);
  const camHelmet = ptCam([S.helmet.x, S.helmet.y], 2.2, 600, 470);
  const k = ramp(t, c.noHelmet - 0.4, c.noHelmet + 0.3, E.inOutCubic) * (1 - ramp(t, c.goldfish - 0.6, c.goldfish, E.inOutCubic));
  alScene(mixCam(cam, camHelmet, k), t, S);
  screenSpace();
  ctx.fillStyle = 'rgba(5,6,15,0.25)'; ctx.fillRect(0, 0, W, H);
  phoneCard(1380, 470, 1.0, ramp(lt, 0.05, 0.45), t, { msg1: ramp(t, shot.start + 0.4, shot.start + 0.7), msg2: ramp(t, c.noHelmet - 0.1, c.noHelmet + 0.2), drawing: ramp(t, c.goldfish - 0.1, c.goldfish + 0.3) });
  return alPost();
};
// his phone, big, in screen space: Pip's face and name, her messages (a chat), then her drawing of him as a goldfish
function phoneCard(x, y, s, k, t, o = {}) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 60 * (1 - k)); const sc = s * E.outBack(clamp(k), 1.6); ctx.scale(sc, sc); ctx.rotate(0.04);
  rrect(ctx, -250, -420, 500, 840, 56); ctx.fillStyle = '#15182A'; ctx.fill();
  rrect(ctx, -232, -400, 464, 800, 42); ctx.fillStyle = '#FFF6EE'; ctx.fill();
  ctx.save(); rrect(ctx, -232, -400, 464, 800, 42); ctx.clip();
  ctx.fillStyle = '#FFD9E6'; ctx.fillRect(-232, -400, 464, 120);
  ctx.restore();
  pipAvatar(-150, -340, 46, t);
  ctx.font = '900 44px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8A2A50'; ctx.fillText('PIP, 7', -80, -340);
  const bubble = (yy, txt, col, tc, kk) => {
    if (kk <= 0.01) return;
    ctx.save(); ctx.translate(-30, yy); const b = E.outBack(clamp(kk), 2); ctx.scale(b, b);
    ctx.font = '900 36px Montserrat'; const w = Math.min(430, ctx.measureText(txt).width + 56);
    rrect(ctx, -185, -42, w, 84, 30); ctx.fillStyle = col; ctx.fill(); ctx.textAlign = 'left'; ctx.fillStyle = tc; ctx.fillText(txt, -157, 3); ctx.restore();
  };
  bubble(-210, 'Photo from space?', '#FF86A6', '#FFFFFF', o.msg1 === undefined ? 1 : o.msg1);
  bubble(-100, 'NO GOLDFISH BOWL!', '#FF5A6E', '#FFFFFF', o.msg2 || 0);
  const d = o.drawing || 0;
  if (d > 0.01) {   // her drawing: him as a goldfish in a bowl, in crayon colours
    ctx.save(); ctx.translate(0, 160); const b = E.outBack(clamp(d), 1.8); ctx.scale(b, b);
    rrect(ctx, -190, -160, 380, 320, 20); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#E0D0C0'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 10, 120, 0, 7); ctx.fillStyle = 'rgba(127,200,255,0.4)'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#3A7AC8'; ctx.stroke();
    goldfish(ctx, 4, 20, 1.15, t); ctx.restore();
  }
  ctx.restore();
  softDot(gctx, x, y, 420 * s * k, '#FFD9E6', 0.15);
}
// "So he pressed the button marked DEPRESS... thinking it meant 'take the picture.'" a rewind: him at the panel, grinning,
// pressing DEPRESS with the selfie stick up; Ball's eyes go flat. Then back to now.
SC.depress = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, S = alState(t);
  const rw = ramp(lt, 0, 0.35);                         // the rewind's glitch in
  // ten seconds ago: the room still full of air, the hatch shut, him at the panel
  const R0 = Object.assign({}, S.room, { open: 0, gauge: 1, beacon: 0, red: 0, air: 0, dep: kickAt(t, c.depressW, 3) > 0.05 ? 1 : 0, flashDep: kickAt(t, c.depressW, 3) });
  const cam = mixCam(ptCam([AL.panX + 160, AL.panY - 40], 1.7, 960, 520), ptCam([AL.panX + 40, AL.panY + 40], 2.4, 820, 560), ramp(t, c.depressW - 0.5, c.depressW + 0.2, E.inOutCubic));
  alRoom(cam, t, R0);
  applyCam(cam);
  alHelmet(ctx, AL.panX + 260, AL.panY - 260, 0.7, 0.2);
  const push = ramp(t, c.depressW - 0.35, c.depressW, E.inOutCubic);
  const hx = AL.panX + 210, hy = AL.panY + 330, btn = [AL.panX, AL.panY + 40];
  const tgt = [(btn[0] - hx) / 0.78, (btn[1] - hy) / 0.78];
  const hh = { x: hx, y: hy, s: 0.78, face: Object.assign({}, FACES.selfie, { lookX: 0.5, lookY: -0.4 }), hair: 0, rot: 0.04,
    stick: { k: 1, a: -1.3 }, phone: { kind: 'msg' }, L: [lerp(-150, tgt[0] + 30, push), lerp(-300, tgt[1], push)], R: [150, -420], legs: 0.4 };
  alHero(cam, t, hh);
  applyCam(cam);
  alBall(AL.panX + 470, AL.panY - 330, 0.8, t, { mood: t > c.thinking ? 'flat' : 'calm', look: [-1, 0.5] });
  screenSpace();
  stampWord('◀◀ 10 SECONDS AGO', 1100, 130, 64, '#FFFFFF', rw, 0);
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
  const boom = ramp(t, c.s1 - 0.2, c.noExplode - 0.1);
  movieScreen(960, 440, 1.35 + 0.05 * lt / D, ramp(lt, 0, 0.35), t, { boom });
  softDot(gctx, 960, 440, 500, '#6FB6FF', 0.25);
  if (t > c.noExplode + 0.3) { bigX(960, 440, 1.1, ramp(t, c.noExplode + 0.3, c.noExplode + 0.6)); }
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
// "Is he freezing? Not yet. Space is cold, but empty: there's nothing to carry his heat away." first his face, close,
// a thermometer beside it that stays at 37 °C (NOT YET); then a cut to him whole: his heat stays round him as an orange
// glow, little heat arrows leave his skin and come straight back
SC.cold = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  if (t < c.empty - 0.45) {
    const cam = headCam(S, 3.0 + 0.2 * lt, 760, 470);
    alScene(cam, t, S);
    screenSpace();
    const k = ramp(t, c.freezing + 0.2, c.freezing + 0.5);
    if (k > 0.01) {
      ctx.save(); ctx.translate(1450, 470); const b = E.outBack(k, 2); ctx.scale(b, b);
      rrect(ctx, -34, -260, 68, 440, 34); ctx.fillStyle = '#F4F4F8'; ctx.fill(); circle(ctx, 0, 190, 62, '#F4F4F8');
      circle(ctx, 0, 190, 46, '#FF5A3C'); const lev = lerp(0.3, 0.72, ramp(t, c.freezing + 0.3, c.notyet)); rrect(ctx, -16, 190 - 400 * lev, 32, 400 * lev, 16); ctx.fillStyle = '#FF5A3C'; ctx.fill();
      ctx.restore();
      bigWord('37°C', 1450, 830, 90, '#FF9A3C', k, 0);
    }
    tagPill('NOT YET', 1180, 220, ramp(t, c.notyet, c.notyet + 0.25), '#7FE9FF', 64);
    return alPost();
  }
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
  tagPill('NOTHING OUT THERE TO TAKE HIS HEAT', 1250, 260, ramp(t, c.empty + 0.1, c.empty + 0.4), '#FF9A3C', 46);
  return alPost({ flash: 0.12 * kickAt(t, c.empty - 0.45, 10) });
};
// "Space is basically... a giant thermos." a giant thermos pops in beside him: its walls with nothing between them
SC.thermos = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  // him on the right, the thermos on the left: with his head left of x 1320 the camera saw past the room's right wall
  const cam = headCam(S, 1.25, 1340, 300);
  alScene(cam, t, S);
  screenSpace();
  const k = ramp(t, c.thermosW, c.thermosW + 0.35);
  ctx.fillStyle = `rgba(5,6,15,${0.5 * k})`; ctx.fillRect(0, 0, W, H);
  thermos(560, 560, 1.05, k, t, { heat: ramp(t, c.thermosW + 0.6, c.thermosW + 1.2) });
  tagPill('NOTHING HERE', 900, 600, ramp(t, c.thermosW + 0.8, c.thermosW + 1.1), '#C8A8FF', 44);   // beside the gap, clear of the clock
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
// "With no air pressing on it, water boils at body temperature. His spit. His tears. And all that boiling steals heat...
// so his mouth gets cold. Almost freezing." four pictures: a bell jar (a beaker of water at 37 °C; the air is pumped out
// and it boils); his tongue, very close, bubbling; his eyes, the tears bubbling; his face going blue-white with cold
SC.boil = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.bodyT + 1.4) {                               // the bell jar
    darkBg('#0E1A33', '#03060F'); screenSpace();
    const pump = ramp(t, c.noair + 0.1, c.bodyT - 0.2), boil = ramp(t, c.bodyT - 0.4, c.bodyT + 0.4);
    bellJar(880, 560, 1.15 + 0.05 * lt, t, { pump, boil, k: ramp(lt, 0, 0.35) });
    tagPill('AIR: PUMPED OUT', 880, 120, ramp(t, c.noair + 0.3, c.noair + 0.6), '#7FE9FF', 46);
    if (t > c.bodyT - 0.5) { bigWord('100°C', 1560, 330, 110, '#FFFFFF', E.outBack(ramp(t, c.bodyT - 0.5, c.bodyT - 0.2), 2), -0.06); if (t > c.bodyT + 0.05) line(ctx, 1410, 370, 1710, 290, 14, '#FF3A4E'); bigWord('37°C', 1570, 540, 160, '#FF5A6E', E.outBack(ramp(t, c.bodyT + 0.3, c.bodyT + 0.6), 2), 0.05); }
    return inPost({ flash: 0.25 * kickAt(t, c.bodyT, 8) });
  }
  if (t < c.tearsW - 0.1) {                              // his spit: the tongue, very close
    darkBg('#3A1A20', '#100608'); screenSpace();
    tongueMacro(960, 600, 1.05 + 0.04 * (t - c.bodyT), t, 1);
    return inPost();
  }
  const S = alState(t);
  if (t < c.steals - 0.1) {                              // his tears: the eyes, close, bubbling
    const cam = headCam(S, 6.2, 960, 560);
    alScene(cam, t, S);
    return alPost({ flash: 0.15 * kickAt(t, c.tearsW - 0.1, 10) });
  }
  // the cold: his face, a blue-white chill spreading from the mouth; a thermometer falling toward 0
  const cam = headCam(S, 3.4 + 0.3 * ramp(t, c.steals, shot.end), 760, 430);
  alScene(cam, t, S);
  screenSpace();
  const fr = ramp(t, c.frost - 0.1, c.frost + 0.5), cl = ramp(t, c.steals, c.frost + 0.4);
  softDot(ctx, 760, 560, 360, '#BFF0FF', 0.3 * cl);
  ctx.save(); ctx.translate(1460, 470); const b = E.outBack(ramp(t, c.steals, c.steals + 0.3), 2); ctx.scale(b, b);
  rrect(ctx, -34, -260, 68, 440, 34); ctx.fillStyle = '#F4F4F8'; ctx.fill(); circle(ctx, 0, 190, 62, '#F4F4F8');
  const lev = lerp(0.72, 0.12, cl); circle(ctx, 0, 190, 46, '#5AB8FF'); rrect(ctx, -16, 190 - 400 * lev, 32, 400 * lev, 16); ctx.fillStyle = '#5AB8FF'; ctx.fill();
  ctx.restore();
  stampWord('ALMOST FREEZING', 1300, 880 - 40, 86, '#BFF0FF', fr, -0.05);
  return alPost();
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
// camera rides up the neck with the dark front of oxygen-poor blood toward the brain's city of lights
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const front = 0.15 + 0.7 * ramp(t, c.thatBlood, c.toBrain + 0.4, E.inOutSine);
  const z = 1.55 - 0.45 * ramp(lt, 0, D, E.inOutSine), yy = lerp(-260, 220, ramp(lt, 0, D, E.inOutSine));
  ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540 + yy * 0);
  headXray(t, { front, dark: 0, x: 860, y: 520 - yy, s: 1.0 });
  ctx.restore();
  tagPill('ALMOST NO OXYGEN', 1500, 260, ramp(t, c.thatBlood + 1.0, c.thatBlood + 1.3), '#C8A8FF', 46);
  return inPost();
};
// "Fourteen... fifteen... lights out." close on the brain: on each number a cut closer, the number stamped big, and a
// patch of the city goes dark; on "lights out" the rest goes, all at once
SC.lights = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const dk = 0.35 * ramp(t, c.s14, c.s14 + 0.5) + 0.3 * ramp(t, c.s15, c.s15 + 0.5) + 0.6 * ramp(t, c.lightsOut, c.lightsOut + 0.45, E.inCubic);
  const z = t < c.s15 - 0.1 ? 1.8 : (t < c.lightsOut - 0.1 ? 2.3 : 2.6);
  ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-880, -330);
  headXray(t, { front: 1.0, dark: dk, x: 860, y: 520, s: 1.0 });
  ctx.restore();
  stampWord('14', 1560, 330, 220, '#FFD447', ramp(t, c.s14, c.s14 + 0.25) * (1 - ramp(t, c.s15 - 0.2, c.s15 - 0.05)), -0.08);
  stampWord('15', 1560, 330, 260, '#FF5A6E', ramp(t, c.s15, c.s15 + 0.25) * (1 - ramp(t, c.lightsOut - 0.2, c.lightsOut)), -0.08);
  const bl = ramp(t, c.lightsOut + 0.2, c.dark, E.inCubic);
  screenSpace(); if (bl > 0) { ctx.fillStyle = `rgba(0,0,0,${bl})`; ctx.fillRect(0, 0, W, H); gctx.fillStyle = `rgba(0,0,0,${bl})`; gctx.fillRect(0, 0, W, H); }
  return inPost({ flash: 0.25 * (kickAt(t, c.s14, 9) + kickAt(t, c.s15, 9)) });
};
// wordless: black. Only a heartbeat.
SC.black = (lt, t, shot) => {
  screenSpace(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  return { glow: 0, grain: 0 };
};

function initScenes2() { initAirlock(); }
