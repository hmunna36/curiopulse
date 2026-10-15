// What If You Hold Your Breath TOO Long? (long-form): act 3 shots (the records, the whale, too long, the rules, home at
// dusk, the breath count, the final image, the sign-off), the thumbnail, and the one-time setup.
'use strict';

function initScenes2() { initKitchen(); initSea2(); initStars3(); }

// ================================================================= "So how far can a human go?"
SC.human = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  kitchenAt(camOnHead('hero', 2.6 + 0.2 * lt / D, -80, 30), t, { hero: { face: Object.assign({}, FACES.proud, { lookX: 0.3, lookY: -1 }) } });
  screenSpace();
  const k = ramp(lt, 0.4, 0.8, E.outBack);
  if (k > 0.01) { thoughtBubble(1360, 300, 360 * k, 230 * k, k, 1060, 470); bigWord('?', 1360, 300, 170 * k, '#FFD447', 1); }
  return dayPost();
};
// the record pool: the timer races to 11:35; the camera tilts down to him floating face down
SC.record = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const secs = lerp(0, 695, ramp(t, c.official, c.thirtyfive + 0.6, E.inOutSine));
  const tilt = ramp(t, c.facedown - 0.6, c.facedown + 0.4, E.inOutCubic);
  const cam = { x: lerp(960, 1010, tilt), y: lerp(250, 560, tilt), zoom: lerp(1.75, 1.45, tilt), rot: 0 };
  poolScene(cam, t, { secs, label: 'ONE BREATH OF AIR', tank: 0 });
  return { glow: 0.9, flash: 0.3 * (1 - ramp(lt, 0, 0.2)) };
};
// "With a trick, breathing pure oxygen first, a man in Croatia went twenty-nine minutes." the oxygen cylinder; the
// timer to 29:03; this time he lies on the pool's floor
SC.oxygen = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const secs = lerp(695, 1743, ramp(t, c.croatia - 0.4, c.t29 + 0.8, E.inOutSine));
  const cam = { x: lerp(1250, 990, ramp(lt, 0, 1.6, E.inOutCubic)), y: lerp(420, 600, ramp(lt, 0, 1.6, E.inOutCubic)), zoom: lerp(1.5, 1.0, ramp(lt, 0, 1.6, E.inOutCubic)), rot: 0 };
  poolScene(cam, t, { secs, label: 'BREATHING PURE OXYGEN FIRST', tank: ramp(t, c.pure - 0.3, c.pure + 0.1, E.outBack), floor: true, timerCol: '#FFD447' });
  screenSpace();
  pill(560, 380, 'CROATIA, 2025', '#FFD447', ramp(t, c.croatia, c.croatia + 0.3), 48);
  return { glow: 0.95, flash: 0.35 * kickOf(t, c.t29, 7) };
};
// "That's this whole video... almost seven times." seven little copies of this film; the seventh two-thirds full
SC.six = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#14102A', '#05040C'); screenSpace();
  const w = 220, h = 124, gap = 30, x0 = 960 - (7 * w + 6 * gap) / 2 + w / 2, y = 470;
  for (let i = 0; i < 7; i++) {
    const at = c.six + 0.15 + i * 0.32 + (i === 6 ? 0.35 : 0);
    const k = ramp(t, at, at + 0.25, E.outBack);
    if (k <= 0.01) continue;
    ctx.save(); ctx.translate(x0 + i * (w + gap), y); ctx.scale(k, k);
    rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = '#2A1F48'; ctx.fill();
    const fillK = i < 6 ? 1 : 0.66 * ramp(t, at, at + 0.6);
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.clip();
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#F4D8A6'); g.addColorStop(1, '#D9A86C');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w * fillK, h);
    // a tiny cake and two tiny faces
    if (fillK > 0.5) { ellipse(ctx, 0, 24, 40, 14, '#FF9EC0'); for (let q = 0; q < 7; q++) line(ctx, -24 + q * 8, 10, -24 + q * 8, -2, 3, CANDLE_COL[q]); circle(ctx, -62, 0, 18, '#F2B892'); circle(ctx, 62, 8, 13, '#F2B892'); }
    ctx.restore();
    ctx.lineWidth = 5; ctx.strokeStyle = i < 6 ? '#FFD447' : '#FF9A3C'; rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.stroke();
    ctx.font = '900 26px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('4:23', w / 2 - 36, h / 2 - 12);
    ctx.restore();
  }
  bigWord('ALMOST ×7', 960, 720, 140, '#FFD447', ramp(t, c.sixw, c.sixw + 0.3), -0.04);
  return bodyPost({ push: { k: 1 + 0.04 * lt / D, cx: 960, cy: 470 } });
};
// ================================================================= the whale: 3 h 42 in the deep
SC.whale = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const d = lerp(0.45, 0.9, lt / D);
  seaBack(t, { depth: d, glow: 1 });
  const x = lerp(520, 1150, lt / D), y = lerp(300, 560, lt / D);
  beakedWhale(ctx, x, y, 1.15, t, { ang: 0.32 });
  depthScale(t, Math.round(lerp(300, 1500, lt / D)), 1);
  const q = ramp(t, c.how - 0.05, c.how + 0.3, E.outBack);
  if (q > 0.01) bigWord('?', 1500, 330, 260 * q, '#7FFFE0', 1);
  pill(560, 880 - 100, 'STILL A PUZZLE', '#7FFFE0', ramp(t, c.working, c.working + 0.3), 48);
  return { glow: 1, flash: 0.3 * (1 - ramp(lt, 0, 0.2)) };
};
// wordless: the whale goes down into the dark
SC.dark = (lt, t, shot) => {
  const D = shot.end - shot.start;
  screenSpace();
  seaBack(t, { depth: lerp(0.9, 1, lt / D), glow: 1 });
  beakedWhale(ctx, lerp(1150, 1350, lt / D), lerp(560, 980, lt / D), 1.15 * lerp(1, 0.75, lt / D), t, { ang: lerp(0.32, 0.7, lt / D) });
  ctx.fillStyle = `rgba(0,0,0,${0.55 * ramp(lt, 0, D)})`; ctx.fillRect(0, 0, W, H);
  depthScale(t, Math.round(lerp(1500, 2900, lt / D)), 1);
  return { glow: 1 };
};
// ================================================================= too long
SC.toolong = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const wh = env2(t, c.remember2 - 0.1, c.remember2 + 1.1, 0.12);
  const cam = wh > 0.5 ? camOnHead('pip', 4.0, 30, 40) : camOnHead('hero', 2.4 + 0.3 * lt / D, -60, 20);
  kitchenAt(cam, t, { pip: wh > 0.5 ? { whistleBlow: 1, face: Object.assign({}, FACES.annoyed, { lookX: -0.8 }) } : {}, hero: { face: Object.assign({}, FACES.worriedK, { lookX: 0.3, lookY: -0.4 }) } });
  screenSpace();
  // "you're not a whale": a little whale in a thought bubble, crossed out
  const wb = env2(t, c.notwhale, c.toolong - 0.1, 0.2);
  if (wb > 0.01 && wh < 0.5) { thoughtBubble(1380, 280, 380 * wb, 220 * wb, wb, 1060, 460); ctx.save(); ctx.translate(1380, 280); ctx.scale(0.28 * wb, 0.28 * wb); beakedWhale(ctx, 0, 0, 1, t, {}); ctx.restore(); bigX(1380, 280, 0.9 * wb, ramp(t, c.notwhale + 0.5, c.notwhale + 0.8)); }
  if (wh > 0.5) bigWord('TWEEEET!', 1380, 300, 120, '#FFD447', 1, -0.08);
  return dayPost({ flash: 0.3 * kickOf(t, c.remember2 - 0.1, 9) });
};
// the gauges: fast breathing first; the tank drains past BLACKOUT while the needle stays low; lights out
SC.drain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A0A1A', '#000000'); screenSpace();
  const blowK = ramp(t, c.fastfirst, c.fastfirst + 0.8, E.inOutCubic);
  const drainK = ramp(t, c.runout - 0.4, c.switchoff + 0.2, E.inOutSine);
  const ex = lerp(0.35, 0.02, blowK) + 0.45 * drainK;           // the needle crawls up but never reaches the red
  const o2 = lerp(1, 0.42, drainK);
  const dim = ramp(t, c.switchoff - 0.1, c.off, E.inCubic);
  gauges(t, { o2, pctLo: 0, ex, x: 960, y: 470, s: 0.85, blackout: 1, dim });
  if (o2 < 0.52) { screenSpace(); const fl = Math.sin(t * 20) > 0 ? 1 : 0.4; ctx.fillStyle = `rgba(255,40,60,${0.12 * fl * (1 - dim)})`; ctx.fillRect(0, 0, W, H); }
  return bodyPost({ blur: [0, 6 * dim], zblur: 0.03 * dim });
};
// black: switched off (wordless), a single slow heartbeat line
SC.off = (lt, t, shot) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);
  return { glow: 0, grain: 0, noCaptions: false };
};
// "In water, that's how strong swimmers drown. So: never in water, never alone, and never fast breathing first."
SC.water = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: lerp(960, 900, lt / D), y: lerp(520, 470, lt / D), zoom: lerp(1.08, 1.18, lt / D), rot: 0 };
  poolScene(cam, t, { secs: 0, label: '', tank: 0, empty: true, night: true });
  screenSpace();
  ctx.fillStyle = 'rgba(0,4,20,0.35)'; ctx.fillRect(0, 0, W, H);
  const rows = [['NEVER IN WATER', c.never1], ['NEVER ALONE', c.never2], ['NEVER BREATHE FAST FIRST', c.never3]];
  rows.forEach(([txt, at], i) => pill(960, 300 + 120 * i, txt, '#FF5A6E', ramp(t, at - 0.1, at + 0.2), 56));
  return { glow: 0.9, flash: 0.2 * (1 - ramp(lt, 0, 0.3)) };
};
// "On land? Your body won't let you. Even if you blacked out, it would take over... and breathe for you."
SC.land = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.blacked - 0.1) {
    kitchenAt(mixCam(Object.assign({}, TWO, { zoom: 1.25 }), camOnHead('hero', 2.2, -60, 20), ramp(lt, 0, 2, E.inOutSine)), t);
    return duskPost();
  }
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const br = ramp(t, c.breathesfor - 0.1, c.breathesfor + 0.6);
  alarmHead(t, { x: 820, y: 560, s: 1.3, sour: 0.2, ring: 0, whistle: ramp(t, c.takes - 0.2, c.takes + 0.2, E.outBack), lick: 0.3 });
  // a breath streaming in through the nose and mouth
  if (br > 0.01) for (let i = 0; i < 16; i++) { const ph = (t * 1.6 + i / 16) % 1; const x = lerp(1400, 1180, ph), y = 470 + 30 * Math.sin(i * 1.7) + 20 * ph; line(ctx, x, y, x + 40, y, 6, `rgba(150,236,255,${br * (1 - ph)})`); }
  pill(1450, 260, 'LIFEGUARD ON DUTY', '#4DFFB4', ramp(t, c.takes, c.takes + 0.3), 46);
  return bodyPost();
};
// ================================================================= the third test: count your breaths
SC.count = (lt, t, shot) => {
  const D = shot.end - shot.start;
  kitchenAt(camOnHead('hero', 2.8 + 0.3 * lt / D, -40, 10), t);
  return duskPost();
};
// wordless: the count; Pip relights her candles one by one; he breathes
SC.candles = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const L = c.lights;
  const toCake = ramp(t, L[0] - 1.2, L[2], E.inOutCubic), out = ramp(t, L[6] + 0.4, L[6] + 2.2, E.inOutCubic);
  const cam = mixCam(mixCam(Object.assign({}, TWO, { zoom: 1.35 }), { x: KIT.cakeX + 40, y: KIT.cakeY - 60, zoom: 2.3, rot: 0 }, toCake), Object.assign({}, TWO, { zoom: 1.4 }), out);
  kitchenAt(cam, t);
  // a little star on each candle as it lights
  screenSpace();
  const tips = candleTips(KIT.cakeX, KIT.cakeY);
  L.forEach((at, i) => { const k = ramp(t, at, at + 0.35); if (k > 0 && k < 1) { const [x, y] = toScreen(cam, tips[i][0], tips[i][1] - 20); shockLines(x, y, 30, k, 8, '#FFD447', i + 3); } });
  return duskPost();
};
SC.counted = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camOnHead('hero', 2.4 + 0.5 * lt / D, -40, 10);
  kitchenAt(cam, t);
  // a window on the back of his head: the little sensor, pulsing with each breath, a whistle round its neck
  const wk = ramp(t, c.fighting - 0.2, c.fighting + 0.4, E.outBack);
  if (wk > 0.01) {
    const [hx, hy] = toScreen(cam, ...kitHead('hero'));
    const R = 120 * wk, x = hx + 300, y = hy - 40;
    screenSpace();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#0A1A3A'; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    alarmHead(t, { x: x + 10, y: y - 150, s: 1.25, sour: 0, ring: 0, whistle: 1, lick: 0.2 });
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
    const pulse = 0.5 + 0.5 * Math.sin((t - c.fighting) * 2 * Math.PI / 4.0);
    softDot(gctx, x, y, R * 1.3, '#4DFFB4', 0.25 + 0.3 * pulse);
  }
  return duskPost();
};
SC.turn = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const k = ramp(t, c.pipBreath - 0.6, c.pipBreath + 0.2, E.inOutCubic);
  kitchenAt(mixCam(Object.assign({}, TWO, { zoom: 1.4 }), camOnHead('pip', 2.6, 100, 30), k * (1 - ramp(t, c.win - 0.4, c.win + 0.4, E.inOutCubic))), t);
  return duskPost();
};
SC.button = (lt, t, shot) => {
  const D = shot.end - shot.start;
  kitchenAt(camOnHead('hero', 2.6 + 0.2 * lt / D, -100, 20), t);
  return duskPost();
};
// the final image: she blows them out; smoke curls through the last light; BREATHING
SC.final = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: lerp(1010, 965, lt / D), y: lerp(560, 540, lt / D), zoom: lerp(1.55, 1.45, lt / D), rot: 0 };
  kitchenAt(cam, t);
  return duskPost({ glow: 1.0 });
};
// the sign-off: the camera rises with the smoke, out of the window, to the stars; a tiny hiker drifts in space (next week)
let STARS3 = null;
function initStars3() { const r = mulberry32(7007); STARS3 = [...Array(220)].map(() => ({ x: r(), y: r(), s: 0.6 + r() * 2.2, p: r() * 6.28 })); }
SC.sub = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const up = ramp(lt, 0.6, 4.2, E.inOutCubic);
  if (up < 1) {
    const cam = { x: lerp(965, KIT.winX + KIT.winW / 2, up), y: lerp(540, KIT.winY + 80, up), zoom: lerp(1.45, 3.2, up), rot: 0 };
    kitchenAt(cam, t);
    screenSpace();
    ctx.fillStyle = `rgba(4,6,24,${0.85 * ramp(up, 0.55, 1)})`; ctx.fillRect(0, 0, W, H);
  } else {
    screenSpace();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02030C'); g.addColorStop(1, '#0E1030'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // the stars come out as we rise
  const sk = ramp(lt, 2.4, 4.6);
  if (sk > 0.01) for (const s of STARS3) { const a = sk * (0.5 + 0.5 * Math.sin(t * 2 + s.p)); circle(ctx, s.x * W, s.y * H * 0.85 + 60 * (1 - sk), s.s, `rgba(255,255,255,${a})`); if (s.s > 2.2) softDot(gctx, s.x * W, s.y * H * 0.85, 10, '#FFFFFF', 0.4 * a); }
  // next week: a tiny hiker drifting in space in his hoodie, no suit (cheeks puffed: wrong move, as next week will say)
  const hk = ramp(lt, 3.6, 5.0, E.outCubic);
  if (hk > 0.01) {
    ctx.save(); ctx.translate(lerp(1700, 1250, hk), lerp(360, 420, hk) + 10 * Math.sin(t)); ctx.rotate(0.3 * Math.sin(t * 0.6) - 0.4); ctx.scale(0.42, 0.42);
    drawCharacter(ctx, { x: 0, y: 0, s: 1, pose: POSES.fall, face: Object.assign({}, FACES.startled), seed: 4 }, t, KPAL);
    ctx.restore();
    // Earth's edge below
    ctx.save(); ctx.beginPath(); ctx.ellipse(960, H + 760, 1500, 900, 0, 0, Math.PI * 2); const eg = ctx.createRadialGradient(960, H + 300, 200, 960, H + 760, 1500); eg.addColorStop(0, '#2A6AD8'); eg.addColorStop(1, '#0A2A6A'); ctx.fillStyle = eg; ctx.globalAlpha = hk; ctx.fill(); ctx.restore();
    softDot(gctx, 960, H + 40, 900, '#4A9AFF', 0.35 * hk);
  }
  return { glow: 1 };
};

// ================================================================= the thumbnail (three candidates: cues.coverV 0 | 1 | 2)
SC.cover = (lt, t, shot) => {
  const v = (TLd.cues && TLd.cues.coverV) || 0;
  screenSpace();
  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (v === 1) { bg.addColorStop(0, '#1A0626'); bg.addColorStop(1, '#3A0A2A'); }
  else if (v === 2) { bg.addColorStop(0, '#05030C'); bg.addColorStop(1, '#2A0410'); }
  else { bg.addColorStop(0, '#1C0628'); bg.addColorStop(1, '#3A0C1C'); }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glowCol = v === 2 ? '#FF2A3A' : '#FF6A2A';
  softDot(ctx, 1330, 600, 640, glowCol, 0.42);
  const hp = kitHead('hero');
  const Z = 4.1, cam = { x: hp[0] - (1330 - 960) / Z, y: hp[1] - (600 - 540) / Z, zoom: Z, rot: 0 };
  applyCam(cam);
  const face = v === 2 ? Object.assign({}, FACES.dazed, { eyeOpen: 1.3, blink: 0.2 }) : Object.assign({}, FACES.bulge, { eyeOpen: 1.75, pupil: 0.38 });
  kitPerson(cam, 0.35, 'hero', { face, puff: v === 2 ? 0.7 : 1.35, wob: 0, flush: 1, purple: v === 0 ? 0 : 1, sweat: 1, hat: [0, 0, 0] });
  applyCam(cam);
  if (v === 1) {
    const [mx, my] = kitPt('hero', [0, -282 + 60]);
    for (let i = 0; i < 3; i++) { const x = mx - 60 + i * 60, y = my + 70; rrect(ctx, x - 8, y, 16, 90, 4); ctx.fillStyle = CANDLE_COL[i * 2]; ctx.fill(); kitFlame(x, y - 2, 1.5, 0, 0, 1, i); }
  }
  screenSpace();
  if (v === 0) { bigWord('29', 430, 390, 380, '#FFD447', 1); bigWord('MIN', 430, 700, 250, '#FFFFFF', 1); }
  else if (v === 1) { bigWord("DON'T", 440, 360, 230, '#FFFFFF', 1); bigWord('BREATHE', 440, 610, 210, '#FFD447', 1); }
  else { bigWord('BLACK', 440, 380, 250, '#FFFFFF', 1); bigWord('OUT?', 440, 640, 270, '#FF5A6E', 1); }
  return { glow: 0.6, noCaptions: true, noSubscribe: true, grain: 0, noHud: true };
};
