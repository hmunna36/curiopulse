// What If You Hold Your Breath TOO Long? (Second by Second) — the shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds in the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a
// cue (make_timeline.py); the kitchen's continuity is kState(t) in state.js.
// The film: on Pip's seventh birthday she bets him she can hold her breath longer (loser gets no cake). The viewer
// holds theirs with him, in real time: the clock counts their seconds. He blows out her candles at 45; she was
// breathing through her nose. His fast-breathing trick gets the whistle; done the slow way he gets to 1:52 (the cold
// cloth, the heart slowing like a seal's, the spleen, the diaphragm kicking; the 1960s scientists who switched the
// kicking off). Then the edge: 11:54 on air, 29 minutes on oxygen, a whale's 3 h 42; what "too long" means (a
// blackout without warning; drowning in water; on land the body breathes for you). He counts his breaths, Pip
// relights her candles, he lets her have the breath. Colour script: kitchen gold → body blue → black stage → cold
// teal → sepia → pool night → abyss → black → dusk pink and candle gold.
'use strict';

const cu = () => TLd.cues;
const SHOT = (id) => TLd.shots.find((s) => s.id === id);
const flashOf = (t, times, rate = 11) => (times || []).reduce((m, f) => Math.max(m, t >= f ? Math.exp(-(t - f) * rate) : 0), 0);
const kickOf = (t, at, rate = 9) => (t >= at ? Math.exp(-(t - at) * rate) : 0);
// the kitchen at time t, through camera cam, with extra drawing passed through
function kitchenAt(cam, t, extra = {}) {
  const S = kState(t);
  if (extra.hero) Object.assign(S.hero, extra.hero);
  if (extra.pip) Object.assign(S.pip, extra.pip);
  if (extra.cake) Object.assign(S.cake, extra.cake);
  return kitScene(cam, t, Object.assign({}, S, { before: extra.before, between: extra.between, after: extra.after, lamp: extra.lamp }));
}
// cameras on the kitchen: a point and a zoom; the head of either person, with an offset in screen pixels
function camOnHead(who, zoom, dx = 0, dy = 0, h = {}) { const p = kitHead(who, h); return { x: p[0] - dx / zoom, y: p[1] - dy / zoom, zoom, rot: 0 }; }
function mixCam(a, b, k) { return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), k)), rot: 0 }; }
const TWO = { x: 965, y: 585, zoom: 1.32, rot: 0 };            // the two-shot: him, the cake, Pip
const dayPost = (x = {}) => Object.assign({ glow: 0.75 }, x);
const duskPost = (x = {}) => Object.assign({ glow: 0.95, tint: '#FFC8A0', tintA: 0.06 }, x);
const bodyPost = (x = {}) => Object.assign({ glow: 0.95 }, x);

// ================================================================= ACT 1: the first hold, in real time
// Frame 1: his face, close, mid-breath; the candles' flames bright in the corner. On "now" his cheeks are full and the
// clock starts. Then the camera pulls back to the two of them over the cake.
SC.hook = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const close = camOnHead('hero', 3.5, -150, 30), wide = mixCam(TWO, camOnHead('hero', 1.6, -200, -60), 0.25);
  const k = ramp(t, c.pullback - 0.2, D + shot.start, E.inOutCubic);
  const cam = mixCam(Object.assign({}, close, { zoom: close.zoom * (1 + 0.04 * ramp(t, 0, c.now)) }), wide, k);
  kitchenAt(cam, t);
  safetyBadge(['SIT DOWN', 'NEVER IN WATER', 'LET GO ANYTIME'], ramp(t, c.now + 0.2, c.now + 0.6) * (1 - ramp(t, c.badgeOff, c.badgeOff + 0.3)));
  return dayPost({ zblur: 0.03 * (1 - ramp(lt, 0, 0.35)) });
};
// "...all the way to a man who held it for twenty-nine minutes": a glimpse of where this is going (the record's timer)
SC.glimpse = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 960, y: 260 + 30 * lt, zoom: 2.2 - 0.25 * lt / D, rot: 0 };
  poolScene(cam, t, { secs: lerp(1700, 1743, ramp(lt, 0, D * 0.8)), label: 'WITH PURE OXYGEN', tank: 1, timerCol: '#FFD447' });
  return { glow: 1, flash: 0.6 * (1 - ramp(lt, 0, 0.18)), vhs: 0.25 * (1 - ramp(lt, 0, 0.3)) };
};
// "Ten seconds. Easy." the two-shot, he gives a thumbs-up
SC.ten = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cam = mixCam(TWO, camOnHead('hero', 2.2, -60, 40), 0.15 + 0.35 * ramp(lt, 0, D, E.inOutSine));
  kitchenAt(cam, t);
  return dayPost();
};
// "It's Pip's birthday, and she bet him she'd last longer. Loser gets no cake." Pip, close; then the cake
SC.bet = (lt, t, shot) => {
  const c = cu();
  const pipCam = camOnHead('pip', 3.4, 60, 30);
  const cakeCam = { x: KIT.cakeX, y: KIT.cakeY - 10, zoom: 2.4, rot: 0 };
  const k = ramp(t, c.nocake - 0.5, c.nocake + 0.2, E.inOutCubic);
  kitchenAt(mixCam(pipCam, cakeCam, k), t);
  screenSpace();
  pill(960, 230, 'LOSER = NO CAKE', '#FF5A6E', ramp(t, c.nocake + 0.1, c.nocake + 0.4), 54);
  return dayPost({ zblur: 0.05 * env2(t, c.nocake - 0.45, c.nocake + 0.1, 0.15) });
};
// "Right now, your blood is still almost completely full of oxygen." a round window opens on his chest; the camera
// dives through it into the x-ray chest: lungs full of cyan oxygen
const CHEST = () => kitPt('hero', [0, -150]);
// the chest x-ray framed to fill the screen (its lungs centred)
const CHEST_V = { x: 960, y: 830, s: 1.25 };
SC.blood = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const base = camOnHead('hero', 2.2 + 0.25 * ramp(lt, 0, D), -60, -120);
  kitchenAt(base, t);
  // the window on his chest opens, then grows until it is the whole frame
  const [wx, wy] = toScreen(base, ...CHEST());
  const open = ramp(lt, 0.15, 0.7, E.outBack), grow = ramp(lt, 1.0, D, E.inCubic);
  const R = lerp(150 * open, Math.hypot(W, H), grow);
  const k = grow;                                   // the x-ray inside: from "fits his chest" to the full-frame view
  const v = { x: lerp(wx, CHEST_V.x, k), y: lerp(wy + 130, CHEST_V.y, k), s: lerp(0.22, CHEST_V.s, k) };
  screenSpace();
  ctx.save(); ctx.beginPath(); ctx.arc(lerp(wx, 960, k), lerp(wy, 540, k), Math.max(1, R), 0, Math.PI * 2); ctx.clip();
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0A1A3A'); bg.addColorStop(1, '#02040C');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  chestX(v, t, { o2: 1, ex: 0, puff: 1, heartGlow: 0.4 });
  ctx.restore();
  screenSpace();
  if (grow < 0.98) { ctx.beginPath(); ctx.arc(lerp(wx, 960, k), lerp(wy, 540, k), Math.max(1, R), 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = '#7FE9FF'; ctx.stroke(); softDot(gctx, lerp(wx, 960, k), lerp(wy, 540, k), R * 1.15, '#7FE9FF', 0.25 * (1 - grow)); }
  return dayPost({ zblur: 0.06 * grow * (1 - grow) * 4 });
};
// "Twenty. Your blood is still almost totally full of oxygen. But every second, your body makes exhaust... and it's
// got nowhere to go." the chest, lungs glowing cyan (OXYGEN 98 %); then the camera dives into a lung's blood vessel:
// violet exhaust bubbles appear, multiply and crowd against the exit, which is locked (his mouth is shut)
SC.twenty = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const dv = ramp(t, c.exhaust - 1.1, c.exhaust - 0.2, E.inOutCubic);
  if (dv < 1) {
    darkBg('#0A1A3A', '#02040C'); screenSpace();
    const P = [960 + 150 * 1.25, CHEST_V.y - 220 * 1.25];          // a spot in his left lung (our right)
    const z = (1 + 0.05 * clamp((t - c.twenty) / 4)) * (1 + 2.2 * dv * dv);
    ctx.save(); ctx.translate(P[0], P[1]); ctx.scale(z, z); ctx.translate(-P[0], -P[1]);
    chestX(CHEST_V, t, { o2: 1, ex: 0.12 * ramp(t, c.exhaust - 2.2, c.exhaust - 1.2), puff: 1, heartGlow: 0.4, sweep: 1.2 * ramp(t, c.oxy - 0.9, c.oxy + 0.5) });
    ctx.restore();
    pill(960, 210, 'OXYGEN 98%', '#7FE9FF', ramp(t, c.oxy - 0.2, c.oxy + 0.15) * (1 - dv), 60);
    if (dv > 0.35) {   // the blood vessel opens up inside the lung, through a growing circle
      const k = ramp(dv, 0.35, 1, E.inOutCubic), R = lerp(40, 1200, k);
      ctx.save(); screenSpace(); ctx.beginPath(); ctx.arc(P[0] - 120 * k, P[1] + 60 * k, R, 0, Math.PI * 2); ctx.clip();
      bloodTube(t, { o2: 0.97, ex: 0.12, y: 560, h: 620, flow: 1 });
      ctx.restore();
    }
    return bodyPost();
  }
  const ex = 0.12 + 0.8 * ramp(t, c.exhaust - 0.2, c.nowhere + 1.0, E.inOutSine);
  screenSpace();
  const a = t - (c.exhaust - 0.2), z = 1.06 + 0.06 * clamp(a / 5);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  bloodTube(t, { o2: 0.97, ex, y: 560, h: 620, flow: lerp(1, 0.25, ramp(t, c.nowhere, c.nowhere + 1)) });
  ctx.restore();
  // the exit at the right end of the vessel, locked
  const lk = ramp(t, c.nowhere - 0.1, c.nowhere + 0.25, E.outBack);
  exitDoor(1750, 560, 1, lk);
  pill(1360, 230, 'EXHAUST', '#B48CFF', ramp(t, c.exhaust, c.exhaust + 0.3), 56);
  return bodyPost({ flash: 0.35 * (1 - ramp(a, 0, 0.25)) });
};
// a door at the end of the vessel: EXIT, and a padlock on it that drops in (k 0..1)
function exitDoor(x, y, s, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -90, -230, 180, 460, 20); ctx.fillStyle = '#3A1830'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#FF8AA0'; ctx.stroke();
  ctx.font = '400 54px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4DFFB4'; ctx.fillText('EXIT', 0, -170);
  softDot(gctx, x, y - 170 * s, 90, '#4DFFB4', 0.5);
  if (k > 0.01) { ctx.save(); ctx.translate(0, -40 - 120 * (1 - k)); ctx.scale(1.3, 1.3); padlock(ctx, 0, 0, 1); ctx.restore(); }
  ctx.restore();
}
// a padlock (screen units)
function padlock(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.arc(0, -26, 26, Math.PI, 0); c.lineWidth = 12; c.strokeStyle = '#C8CCD8'; c.stroke();
  rrect(c, -40, -26, 80, 64, 12); c.fillStyle = '#FFD447'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#8A6A10'; c.stroke();
  circle(c, 0, 0, 8, '#5A4010'); c.fillStyle = '#5A4010'; c.fillRect(-3, 0, 6, 18);
  c.restore();
}
// the wordless stretch before "Thirty": his face going red, cheeks wobbling; Pip watching; ticks
SC.tense = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cut = D * 0.55;
  if (lt < cut) kitchenAt(camOnHead('hero', 4.0 + 0.4 * lt / cut, -40, 10), t);
  else kitchenAt(camOnHead('pip', 4.4 + 0.3 * (lt - cut) / (D - cut), 40, 10), t, { pip: { face: Object.assign({}, FACES.suspicious, { lookX: -0.9 }) } });
  return dayPost();
};
// "Thirty. Feel that? That burn?" his chest glows hot; his hand on it
SC.thirty = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camOnHead('hero', 2.9 + 0.25 * lt / D, -10, -170);
  kitchenAt(cam, t, {
    after: (cm) => {
      const [x, y] = toScreen(cm, ...CHEST()), k = ramp(t, c.burn - 0.3, c.burn + 0.3) * (0.85 + 0.15 * Math.sin(t * 9));
      screenSpace();
      softDot(ctx, x, y, 260 * k, '#FF5030', 0.35 * k); softDot(gctx, x, y, 200, '#FF4020', 0.6 * k);
      for (let i = 0; i < 6; i++) { const ph = (t * 1.2 + i / 6) % 1, a = i * 1.05; line(ctx, x + Math.cos(a) * (60 + 120 * ph), y + Math.sin(a) * (60 + 120 * ph), x + Math.cos(a) * (90 + 140 * ph), y + Math.sin(a) * (90 + 140 * ph), 6, `rgba(255,120,60,${k * (1 - ph)})`); }
    },
  });
  return dayPost();
};
// "That's not the missing oxygen. It's mostly the exhaust. It makes your blood a tiny bit sour..." his whole chest:
// the oxygen pill still says 96 %, the lungs fill up with violet exhaust, and a sour lemon pops in
SC.alarm = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#140A28', '#04020C'); screenSpace();
  const ex = 0.25 + 0.6 * ramp(t, c.itsex - 0.2, c.sour + 0.4);
  const v = { x: 760, y: 900 - 60 * ramp(lt, 0, D), s: 0.9 + 0.06 * ramp(lt, 0, D) };
  chestX(v, t, { o2: 0.9, ex, puff: 1, heartGlow: 0.5, bpm: 92 });
  pill(1440, 300, 'OXYGEN: STILL 96%', '#4DFFB4', ramp(t, c.notmissing - 0.1, c.notmissing + 0.25), 50);
  pill(1440, 420, 'EXHAUST: PILING UP', '#B48CFF', ramp(t, c.itsex, c.itsex + 0.25), 50);
  const sour = ramp(t, c.sour - 0.25, c.sour + 0.35);
  if (sour > 0.01) { ctx.save(); ctx.translate(1440, 680); const sc = E.outBack(clamp(sour), 2); ctx.scale(sc, sc); ctx.rotate(0.06 * Math.sin(t * 9)); lemon(ctx, 0, 0, 1.25, t); ctx.restore(); }
  return bodyPost();
};
// a lemon with a sour face (screen units): "a tiny bit sour"
function lemon(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 110, 80, 0, 0, Math.PI * 2); c.fillStyle = '#FFE14A'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#C8A010'; c.stroke();
  ellipse(c, 118, 0, 16, 12, '#FFE14A'); ellipse(c, -118, 0, 16, 12, '#FFE14A');
  ellipse(c, -40, -40, 26, 12, 'rgba(255,255,255,0.4)', -0.3);
  organFace(c, 0, 4, 2.2, 'sour', t);
  c.restore();
}
// "...and a sensor at the base of your brain tastes it... and pulls the alarm." (the camera arrives at the sensor)
SC.sensor = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const k = ramp(lt, 0, 1.4, E.inOutCubic);
  const s = lerp(1.0, 1.9, k), x = lerp(960, 1060, k), y = lerp(560, 300, k);
  const ring = ramp(t, c.pulls - 0.1, c.pulls + 0.2);
  alarmHead(t, { x, y, s, sour: ramp(t, c.tastes - 0.2, c.tastes + 0.6), ring, lick: ramp(t, c.tastes - 0.4, c.tastes + 0.1) });
  if (ring > 0) { ctx.fillStyle = `rgba(255,30,50,${0.12 * ring * (Math.sin(t * 22) > 0 ? 1 : 0.3)})`; ctx.fillRect(0, 0, W, H); }
  return bodyPost({ zblur: 0.03 * kickOf(t, c.pulls, 6), push: { k: 1 + 0.03 * kickOf(t, c.pulls, 5), cx: 960, cy: 540 } });
};
// the seconds before he breaks: the alarm ringing in him, his face shaking (wordless)
SC.shake = (lt, t, shot) => {
  const D = shot.end - shot.start;
  kitchenAt(camOnHead('hero', 3.2 + 0.6 * lt / D, -30, 0), t);
  screenSpace();
  ctx.fillStyle = `rgba(255,30,50,${0.10 * (Math.sin(t * 22) > 0 ? 1 : 0.3)})`; ctx.fillRect(0, 0, W, H);
  const [sx, sy] = shake(t, 6, 30, 3);
  return dayPost({ blur: [sx, sy] });
};
// "Forty-five. He's out." PAAAH: the breath blasts out across the table and blows out all seven candles
SC.out = (lt, t, shot) => {
  const c = cu();
  const a = t - c.out;
  const cam = { x: 800, y: 560, zoom: 1.85 * (1 + 0.06 * kickOf(t, c.out, 4)), rot: 0 };
  kitchenAt(cam, t, {
    after: (cm) => {
      if (a > 0 && a < 0.9) {   // the blast: streaks of air from his mouth across the cake
        const [mx, my] = kitPt('hero', [10, -282 + 40]);
        for (let i = 0; i < 14; i++) {
          const ph = clamp(a * 2.2 - i * 0.03), y = my + (i - 7) * 8 + 10 * Math.sin(i * 1.7);
          if (ph <= 0 || ph >= 1) continue;
          line(ctx, mx + 40 + 700 * ph * 0.6, y + 40 * ph, mx + 40 + 700 * ph, y + 60 * ph, 6, `rgba(220,245,255,${0.8 * (1 - ph)})`);
        }
      }
    },
  });
  const [px, py] = toScreen(cam, ...kitHead('hero'));
  shockLines(px, py, 120, ramp(t, c.out, c.out + 0.45), 12, '#FFFFFF', 3);
  return dayPost({ push: { k: 1 + 0.03 * kickOf(t, c.out, 5), cx: 960, cy: 540 } });
};
// the smoke curling from seven dead wicks; Pip's stare (wordless)
SC.smoke = (lt, t, shot) => {
  const D = shot.end - shot.start, cut = D * 0.52;
  if (lt < cut) kitchenAt({ x: KIT.cakeX, y: KIT.cakeY - 70, zoom: 3.0 + 0.2 * lt / cut, rot: 0 }, t);
  else kitchenAt(camOnHead('pip', 4.0, 30, 10), t, { pip: { face: Object.assign({}, FACES.deadpan, { lookX: -0.9 }) } });
  return dayPost();
};
// "And Pip? Still going..." / "[deadpan] through her nose." Pip close; then her nose (it flares, it whistles)
SC.pip = (lt, t, shot) => {
  const c = cu();
  const k = ramp(t, c.nose2 - 0.75, c.nose2 - 0.35, E.inOutCubic);
  const cam = mixCam(camOnHead('pip', 3.6, 40, 20), camOnHead('pip', 7.5, 0, -110), k);
  kitchenAt(cam, t);
  return dayPost({ zblur: 0.05 * env2(t, c.nose2 - 0.75, c.nose2 - 0.3, 0.15) });
};
// "And you? Breathe. Seriously." he looks at us and takes a huge breath; the clock stops
SC.breathe = (lt, t, shot) => {
  const D = shot.end - shot.start;
  kitchenAt(camOnHead('hero', 2.6 + 0.3 * lt / D, 0, -10), t);
  screenSpace();
  bigWord('BREATHE', 960, 330, 170, '#4DFFB4', ramp(t, cu().breathe, cu().breathe + 0.3) * (1 - ramp(t, cu().breathe + 1.6, cu().breathe + 1.9)));
  return dayPost();
};

// "Most people let go somewhere between thirty seconds and a minute..." a ruler of the first minute: the band where
// most people let go, his mark at 45, and "YOU?" sliding along it
SC.result = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#14102A', '#05040C'); screenSpace();
  const x0 = 260, x1 = 1660, y = 560, X = (s) => lerp(x0, x1, s / 60);
  const draw = ramp(lt, 0, 0.6);
  line(ctx, x0, y, lerp(x0, x1, draw), y, 14, '#FFFFFF');
  for (let s = 0; s <= 60; s += 10) if (X(s) <= lerp(x0, x1, draw) + 1) {
    line(ctx, X(s), y - 20, X(s), y + 20, 6, '#FFFFFF');
    ctx.font = '400 66px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(`${s}`, X(s), y + 40);
  }
  // the band 30-60 s
  const b = ramp(t, c.band30 - 0.2, c.minute + 0.2, E.inOutCubic);
  if (b > 0.01) {
    rrect(ctx, X(30), y - 120, (X(60) - X(30)) * b, 240, 30); ctx.fillStyle = 'rgba(255,212,71,0.22)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
    softDot(gctx, X(45), y, 300 * b, '#FFD447', 0.25);
    if (b > 0.9) { ctx.font = '400 60px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#FFD447'; ctx.fillText('MOST PEOPLE LET GO', X(45), y - 140); }
  }
  // his mark at 45
  const hm = ramp(lt, 0.4, 0.8, E.outBack);
  if (hm > 0.01) { ctx.save(); ctx.translate(X(45), y); ctx.scale(hm, hm); circle(ctx, 0, 0, 22, '#3FA7FF'); ctx.restore(); ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#8FB8FF'; ctx.globalAlpha = hm; ctx.fillText('HIM', X(45), y - 30); ctx.globalAlpha = 1; }
  // "YOU?" a marker that runs along and settles inside the band
  const yu = ramp(lt, 0.8, 2.2, E.outCubic);
  if (yu > 0.01) { const s = lerp(0, 38 + 8 * Math.sin(t * 2), yu); ctx.save(); ctx.translate(X(s), y + 150); ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(-22, 0); ctx.lineTo(22, 0); ctx.closePath(); ctx.fillStyle = '#4DFFB4'; ctx.fill(); ctx.font = '400 56px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#4DFFB4'; ctx.fillText('YOU?', 0, 10); ctx.restore(); }
  return bodyPost({ push: { k: 1 + 0.04 * lt / D, cx: 960, cy: 560 } });
};
// "...and at that moment, their blood is still more than ninety percent full." the two gauges: the tank nearly full,
// the alarm needle deep in the red and its bell ringing
SC.tank = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A0A1A', '#000000'); screenSpace();
  const ex = lerp(0.2, 0.86, ramp(lt, 0.2, 1.4, E.inOutCubic));
  const o2 = lerp(1, 0.94, ramp(lt, 0.2, 1.4));
  gauges(t, { o2, pctLo: 0, ex, x: 960, y: 470, s: 0.85 });
  const wow = ramp(t, c.ninetyPct - 0.1, c.ninetyPct + 0.3, E.outBack);
  if (wow > 0.01) stamp('STILL FULL!', 690, 520, wow, '#4DFFB4', -0.14, 84);
  return bodyPost({ push: { k: 1 + 0.05 * lt / D, cx: 960, cy: 470 }, flash: 0.25 * kickOf(t, c.ninetyPct, 8) });
};
// "You didn't run out. Your body pulled the alarm early... because exhaust builds up much faster than oxygen runs down."
// the race: the exhaust needle swings up fast and rings; the oxygen tank barely moves
SC.early = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A0A1A', '#000000'); screenSpace();
  const run = clamp(inv(c.faster - 0.6, c.faster + 1.6, t));
  const ex = run < 0.02 ? 0.86 * (1 - ramp(lt, 0, 0.6)) : lerp(0.1, 0.9, E.outCubic(run));
  const o2 = run < 0.02 ? 1 : lerp(1, 0.95, run);
  gauges(t, { o2, pctLo: 0, ex, x: 960, y: 470, s: 0.85 });
  screenSpace();
  if (run > 0.05) {
    ctx.save(); ctx.font = '400 84px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 14; ctx.strokeStyle = '#0B0B1A'; ctx.globalAlpha = clamp(run * 3);
    const bump = 1 + 0.08 * Math.sin(t * 10);
    ctx.save(); ctx.translate(1600, 470); ctx.scale(bump, bump); ctx.strokeText('FAST!', 0, 0); ctx.fillStyle = '#B48CFF'; ctx.fillText('FAST!', 0, 0); ctx.restore();
    ctx.strokeText('slow...', 330, 470); ctx.fillStyle = '#7FE9FF'; ctx.fillText('slow...', 330, 470);
    ctx.restore();
  }
  return bodyPost({ push: { k: 1.02 + 0.04 * lt / D, cx: 960, cy: 470 } });
};
// "Round two. He's seen a trick online: breathe really fast first." swimming goggles on; he pants like a dog
SC.round2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam(TWO, camOnHead('hero', 2.4, -80, -20), ramp(lt, 0, 1.2, E.inOutCubic));
  kitchenAt(cam, t);
  screenSpace();
  pill(960, 150, 'ROUND 2', '#FFD447', ramp(t, c.round2, c.round2 + 0.3) * (1 - ramp(t, c.round2 + 1.6, c.round2 + 1.9)), 60);
  return dayPost();
};
// TWEEEET: Pip blows her whistle (her present); he freezes mid-pant. Then "[deadpan] Pip got a whistle for her birthday."
SC.whistle = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const frozen = t >= c.whistleT + 0.45 && t < c.pipgot - 0.12;
  const cam = frozen ? camOnHead('hero', 3.4, 0, 20) : camOnHead('pip', 3.6 + 0.2 * lt / D, 30, 40);
  kitchenAt(cam, t);
  if (frozen) { screenSpace(); return dayPost({ push: { k: 1 + 0.05 * kickOf(t, c.whistleT + 0.45, 5), cx: 960, cy: 500 } }); }
  const [px, py] = toScreen(cam, ...kitPt('pip', [10, -282 + 46]));
  const w = env2(t, c.whistleT - 0.05, c.whistleT + 0.9, 0.08);
  if (w > 0.01) {
    screenSpace();
    for (let i = 0; i < 5; i++) { const ph = (t * 4 + i / 5) % 1; ctx.beginPath(); ctx.arc(px + 60, py, 60 + 160 * ph, -0.7, 0.7); ctx.lineWidth = 10; ctx.strokeStyle = `rgba(255,212,71,${w * (1 - ph)})`; ctx.stroke(); }
    bigWord('TWEEEET!', 1380, 300, 120, '#FFD447', w, -0.08);
  }
  return dayPost({ push: { k: 1 + 0.04 * kickOf(t, c.whistleT, 6), cx: px, cy: py }, flash: 0.35 * kickOf(t, c.whistleT, 10) });
};
// "And she's right. Fast breathing doesn't add oxygen. It just blows the exhaust away... so the alarm rings late.
// Sometimes... too late." the gauges: the tank stays where it was; the exhaust needle falls to zero; the BLACKOUT line
SC.dont = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  if (t < c.late - 0.25) {
    // the blood: wind streaks blow the violet exhaust away; the red cells were already full (+0 OXYGEN)
    const blow = ramp(t, c.blows - 0.3, c.blows + 1.2, E.inOutCubic);
    bloodTube(t, { o2: 1, ex: 0.55 * (1 - blow), y: 560, h: 620, flow: 1 + 2.5 * blow });
    const wind = env2(t, c.right + 0.8, c.late, 0.3);
    for (let i = 0; i < 26; i++) { const ph = (t * 2.2 + hash(i)) % 1, y = 300 + 520 * hash(i * 3.1); line(ctx, -200 + 2300 * ph, y, -200 + 2300 * ph + 160, y, 5, `rgba(220,245,255,${0.5 * wind * Math.sin(Math.PI * ph)})`); }
    const na = ramp(t, c.noadd - 0.1, c.noadd + 0.3, E.outBack);
    // the stamp goes on after the wind's blur, so it stays sharp
    return bodyPost({ blur: [24 * wind, 0], overlay: na > 0.01 ? () => stamp('+0 OXYGEN', 960, 200, na, '#7FE9FF', -0.08, 100) : null });
  }
  // the alarm: it should be ringing, and it is dozing; at "too late" its eye snaps open, in the dark
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const late = ramp(t, c.toolate - 0.1, c.toolate + 0.3);
  alarmHead(t, { x: 900, y: 420, s: 1.55, sour: 0, ring: 0.6 * late, lick: 0.1 });
  if (late < 0.5) zzz(1150, 330, t, c.late - 0.2, 1, 1.3);
  if (late > 0.01) { ctx.fillStyle = `rgba(0,0,0,${0.45 * late})`; ctx.fillRect(0, 0, W, H); stamp('TOO LATE', 960, 760 - 60, late, '#FF5A6E', -0.1, 100); }
  return bodyPost({ vhs: 0.18 * kickOf(t, c.toolate, 3), push: { k: 1 + 0.05 * late, cx: 960, cy: 400 } });
};
