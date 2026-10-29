// Why Won't Your TOES Move One at a Time? 🦶 Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The world is web/toes.js (the dock at sunset, the hero, his foot as a 3D rig); the brain's desk is brainy.js (pins-needles).
'use strict';

const cu = () => TLd.cues;
const TS_TEST = { cy: 830, S: 25, D: 24, pitch: -0.05, ty: 6 };
const tsBump = (t, t0, d) => (t > t0 && t < t0 + d ? Math.sin(Math.PI * (t - t0) / d) : 0);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the low sun is on the right of the lake: LIGHTS.sunset (key from the right, an orange rim)
setLights({
  hook: LIGHTS.sunset, glass: { ...LIGHTS.sunset, rimAmt: 1.0 }, curl: { ...LIGHTS.sunset, rimAmt: 1.0 },
  brain: LIGHTS.screen, paint: LIGHTS.candle, every: LIGHTS.screen, button: LIGHTS.sunset, loop: LIGHTS.sunset, cover: LIGHTS.sunset,
});

// ---------------------------------------------------------------- the hook's state as a function of video time
// valid at negative time (the loop's last 0.4 s plays it from -0.4 s), so the cut back to frame 1 is one move
function tsHookView(t) {
  const c = cu(), sh = ramp(t, c.gangup, c.gangup + 0.05) * (1 - ramp(t, c.gangup + 0.05, c.gangup + 0.35));
  return tsView({ cx: 540 + 10 * sh * Math.sin(t * 70), cy: TS_TEST.cy, S: TS_TEST.S + 1.2 * E.inOutSine(clamp(t / 8.3)), D: TS_TEST.D, pitch: TS_TEST.pitch, ty: TS_TEST.ty, tz: -6 });
}
function tsFaceAt(keys, t) {
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) { if (t < keys[i][0]) break; f = lerpFace(keys[i - 1][1], keys[i][1], ramp(t, keys[i][0], keys[i][0] + 0.12)); }
  return f;
}
const TS_F = {
  focus: Object.assign({}, FACES.calm, { lookY: 1, lookX: 0.1, browY: 0.3, mouth: 'flat', mouthOpen: 0.1 }),
  smug: Object.assign({}, FACES.grin, { lookX: 0.6, lookY: 0.2, blink: 0.35, mouthOpen: 0.6 }),
  strain: Object.assign({}, FACES.nervous, { lookY: 1, browY: 1.1, browTilt: 1.3 }),
  wow: Object.assign({}, FACES.startled, { lookY: 1 }),
  side: Object.assign({}, FACES.confused, { lookX: 0.2, lookY: 0.1 }),
  up: Object.assign({}, FACES.worried, { lookY: -1, lookX: 0.1, mouth: 'o', mouthOpen: 0.4 }),
  yank: Object.assign({}, FACES.shock, { lookY: 1 }),
  flat: Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.4 }),
  scrunch: Object.assign({}, FACES.nervous, { lookY: 1, blink: 0.55, browY: 1.2, browTilt: 1.4, mouth: 'grimace' }),
  grin: Object.assign({}, FACES.grin, { lookY: 0.3 }),
};
function tsHookState(t) {
  const c = cu();
  const bigUp = ramp(t, -0.25, 0.5, E.outBack) * (1 - ramp(t, c.bigdown, c.bigdown + 0.3, E.inOutSine));
  const strain = t > c.strain && t < c.gangup ? 1 : 0;
  const gang = ramp(t, c.gangup, c.gangup + 0.2, E.outBack) * (1 + 0.35 * tsBump(t, c.yank, 0.4));
  const toes = [{ lift: bigUp + 0.12 * gang, wig: 0 }];
  for (let i = 1; i <= 4; i++) toes.push({ lift: gang + (i === 1 ? 0.06 * strain : 0), wig: strain * (i === 1 ? 1 : 0.4) + 0.5 * tsBump(t, c.yank, 0.5) + 0.4 * tsBump(t, c.eyes, 0.5) });
  const face = tsFaceAt([[-9, TS_F.focus], [c.ding - 0.05, TS_F.smug], [c.bigdown + 0.1, TS_F.focus], [c.strain, TS_F.strain], [c.gangup, TS_F.wow],
    [c.whole + 0.1, TS_F.side], [c.drop, TS_F.up], [c.yank, TS_F.yank], [c.twang + 0.1, TS_F.flat]], t);
  const thumb = false;   // no hand gesture: a single raised digit read as a rude one in the stills (30 Oct 2026); the smug face and the sparkle carry "Easy."
  return { toes, face, thumbK: ramp(t, c.ding - 0.25, c.ding + 0.05, E.outBack) * (1 - ramp(t, c.bigdown, c.bigdown + 0.3)), thumb,
    sweat: strain * ramp(t, c.strain, c.strain + 0.3), faces: ramp(t, c.eyes, c.eyes + 0.25), look: t < c.drop ? [0, -0.6] : [0.1, -1],
    happy: t > c.came && t < c.right_end, string: ramp(t, c.drop, c.drop + 0.45), yank: tsBump(t, c.yank, 0.6) };
}
// the hero and his foot in one view; o: {glass..} merged into the foot's A
function tsScene(V, t, S, o = {}) {
  tsLakeBg(V, t, o.bg || {});
  tsDock(V, t);
  tsContact(V);
  const P0 = tsP(V, TS_HEAD), hs = P0[2] * TS_HEAD_R / 64;
  const on = lookHeroBegin(ctx, { x: P0[0], y: P0[1] + 250 * hs, s: hs });
  const H = { face: S.face, sweat: S.sweat, hands: S.thumb ? 'thumb' : 'clasp', thumbK: S.thumbK, headDY: o.headDY || S.headDY || 0, noHead: o.noHead, clasp: o.clasp };
  if (!o.noHero) tsHero(ctx, V, H, t);
  const A = Object.assign({ toes: S.toes, faces: S.faces, look: S.look, happy: S.happy }, o);
  const F = tsFoot(ctx, V, A, t);
  if (!o.noHero) tsHeroFront(ctx, V, H, t);
  lookHeroEnd(on);
  return F;
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu(), V = tsHookView(t), S = tsHookState(t);
  const F = tsScene(V, t, S);
  // the puppet string (the answer): drops on "They", yanks on "ONE"
  tsPuppet(ctx, V, F.G, S.string, S.yank, t);
  // "Easy.": a sparkle on the raised big toe
  const sk = popK(t, c.ding, c.ding + 0.55, 0.06, 0.15);
  if (sk > 0) { const p = F.toe[0][F.toe[0].length - 1]; shockLines(p[0] + 10, p[1] - 30, 60, sk, 8, '#FFF3A8', 3); softDot(gctx, p[0], p[1] - 30, 70, '#FFE68A', 0.6 * sk); }
  // the strange thing: a pop of lines round the four as they spring up
  const gk = popK(t, c.gangup, c.gangup + 0.45, 0.05, 0.2);
  if (gk > 0) { const p = F.toe[2][F.toe[2].length - 1]; shockLines(p[0], p[1] - 20, 120, gk, 10, '#FFFFFF', 7); }
  const tw = popK(t, c.twang, c.twang + 0.5, 0.05, 0.2);
  return { glow: 0.85, push: { k: 1 + 0.012 * tsBump(t, c.yank, 0.3), cx: 540, cy: 900 }, blur: [0, 4 * tw] };
};

SC.glass = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const u0 = E.inOutSine(clamp(lt / 1.0));
  const V = tsView({ cx: 540, cy: lerp(830, 880, u0), S: lerp(26.2, 40, u0) + 1.2 * clamp(lt / D), D: lerp(24, 28, u0), pitch: lerp(-0.05, 0.3, u0), ty: 6, tz: -6 });
  const pO = tsBump(t, c.bigpull, 0.9), pC = tsBump(t, c.fourpull, 0.85);
  const toes = [{ lift: 0.95 * pO }];
  for (let i = 1; i <= 4; i++) toes.push({ lift: 0.06 + 0.9 * pC, wig: 0.5 * tsBump(t, c.jiggle, 0.5) });
  const S = { toes, face: TS_F.focus, faces: 1, look: t > c.jiggle && t < c.fourpull ? [0, -1] : [0, -0.5], happy: t > c.fourpull + 0.5 };
  const F = tsScene(V, t, S, {
    glass: ramp(t, c.glass_in, c.glass_in + 0.7, E.inOutSine), pullO: pO, pullC: pC, slideO: 3 * ramp(t, c.bigpull, c.bigpull + 0.9), slideC: 3 * ramp(t, c.fourpull, c.fourpull + 0.85),
    orangeOn: ramp(t, c.glass_in + 0.4, c.glass_in + 0.9), cyanOn: ramp(t, c.cyan_on, c.cyan_on + 0.4), split: ramp(t, c.split, c.split + 0.45, E.inOutSine),
    oFace: ramp(t, c.own - 0.1, c.own + 0.15), oMood: pO > 0.2 ? 'strain' : 'calm', cFace: ramp(t, c.cyan_on + 0.2, c.cyan_on + 0.45), cMood: pC > 0.2 ? 'strain' : 'calm',
    headDY: 14 * E.inOutSine(clamp(lt / 0.5)), clasp: lerp(10.8, 17.2, u0), bg: { sun: lerp(1, 0.3, u0) },
  });
  // the tags: OWN by the orange muscle, ONE beside the cyan one, then x4 at the fork
  const m = out_m;
  if (m.orange) pill(m.orange[0] + 150, m.orange[1] - 10, 'OWN', TS_OR, popK(t, c.own, D + shot.start, 0.12, 0.1), 38);
  if (m.cyan) pill(m.cyan[0] - 160, m.cyan[1] - 10, '1 MUSCLE', TS_CY, popK(t, c.muscle2, D + shot.start, 0.12, 0.1), 36);
  if (m.S) { const f = tsP(V, m.S.fork); pill(f[0] - 190, f[1] + 30, '4 STRINGS', TS_CY, popK(t, c.strings, D + shot.start, 0.12, 0.1), 36); }
  return { glow: 0.9, capY: lt > 0.5 ? 1570 : undefined };
};

SC.curl = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const yaw = lerp(0, -0.7, E.inOutCubic(clamp(lt / 0.75)));
  const u0 = E.inOutCubic(clamp(lt / 0.75));
  const V = tsView({ cx: lerp(540, 640, u0), cy: lerp(880, 840, u0), S: lerp(41.2, 40, u0), D: lerp(28, 32, u0), yaw, pitch: lerp(0.3, 0.2, u0), ty: 6, tz: -6 });
  const cl = ramp(t, c.curl_go, c.curl_go + 0.35, E.outBack) * (0.75 + 0.25 * tsBump(t, c.curl2, 0.6) + 0.15 * clamp((t - c.curl2) * 3));
  const toes = [{ curl: 0.45 * cl }];
  for (let i = 1; i <= 4; i++) toes.push({ curl: cl, wig: 0.3 * tsBump(t, c.curl2, 0.5) });
  const S = { toes, face: TS_F.focus, faces: 1, look: [0.4, 0] };
  tsScene(V, t, S, { glass: 1, orangeOn: 0.25, cyanOn: 0.25, split: 1, violetOn: ramp(t, c.violet_on, c.violet_on + 0.5), pullV: tsBump(t, c.curl2, 0.7) + 0.4 * ramp(t, c.curl_go, c.curl_go + 0.3) * (1 - ramp(t, c.violet_on, c.violet_on + 0.3)),
    slideV: 3 * ramp(t, c.curl_go, c.curl2 + 0.7), vFace: ramp(t, c.violet_on + 0.2, c.violet_on + 0.5), vMood: t > c.curl2 ? 'strain' : 'calm', noHero: true, bg: { dx: 420 * u0, sun: 0.4 } });
  pill(760, 470, 'CRAMP? STOP.', '#FFFFFF', popK(t, c.curl_go + 0.5, shot.end, 0.12, 0.1), 30);
  return { glow: 0.9, capY: 1570 };
};

// the brain's scan card: two boxes, FINGERS with five tidy patches and TOES with one smudge (most brains), or five tidy
// patches lit one by one (lit[] 0..1: the foot artists). k pops it in; smudge 0..1 melts the toes' five into one.
function tsScanCard(cx, cy, s, k, smudge, lit, title) {
  if (k <= 0.01) return;
  const c = ctx; screenSpace();
  const ks = s * E.outBack(clamp(k), 1.4);
  c.save(); c.translate(cx, cy); c.scale(ks, ks);
  rrect(c, -360, -230, 720, 460, 40); c.fillStyle = 'rgba(14,10,34,0.95)'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#FF86C8'; c.stroke();
  const cols = ['#FF9A3C', '#FFD447', '#4DFFB4', '#7FE9FF', '#C8A8FF'];
  const box = (x, label) => { rrect(c, x - 160, -120, 320, 260, 28); c.fillStyle = 'rgba(255,134,200,0.10)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,134,200,0.45)'; c.stroke();
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText(label, x, 100); };
  paint(() => {
    c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFB3D9'; c.fillText(title, 0, -178);
    box(-180, 'FINGERS'); box(180, 'TOES');
    // fingers: five tidy patches in a row
    for (let i = 0; i < 5; i++) { const x = -180 - 112 + i * 56, y = -20; circle(c, x, y, 22, cols[i]); circle(c, x - 6, y - 6, 7, 'rgba(255,255,255,0.55)'); }
    if (!lit) {
      // toes: five patches that melt into one smudge
      const sm = clamp(smudge);
      for (let i = 0; i < 5; i++) {
        const x = lerp(180 - 112 + i * 56, 180, sm * 0.85), y = -20, r = 22 + 46 * sm;
        const g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, rgba('#FFAA78', 0.95 - 0.55 * sm)); g.addColorStop(0.6, rgba('#FFAA78', 0.6 - 0.4 * sm)); g.addColorStop(1, 'rgba(255,170,120,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      }
      if (sm > 0.5) { c.font = '400 76px Anton'; c.fillStyle = rgba('#FFD447', clamp((sm - 0.5) * 2)); c.fillText('?', 290, -70); }
    } else {
      for (let i = 0; i < 5; i++) { const x = 180 - 112 + i * 56, y = -20, lk = clamp(lit[i]); circle(c, x, y, 22 * (lk > 0.5 ? 1 : 0.8), lk > 0.5 ? cols[i] : 'rgba(255,170,120,0.22)'); if (lk > 0.5) circle(c, x - 6, y - 6, 7, 'rgba(255,255,255,0.55)'); }
    }
  });
  c.restore();
  if (lit) for (let i = 0; i < 5; i++) if (clamp(lit[i]) > 0.5) softDot(gctx, cx + (180 - 112 + i * 56) * ks, cy - 20 * ks, 70 * ks, cols[i], 0.7);
}
// a little control panel on the brain's desk: five finger keys, the big toe's key and ONE wide key for the other four
function tsPanel(x, y, t, pressK) {
  const c = ctx; screenSpace();
  rrect(c, x - 420, y - 70, 840, 190, 26); c.fillStyle = '#251838'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#6A4A90'; c.stroke();
  paint(() => {
    c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C8A8FF';
    c.fillText('FINGERS', x - 220, y - 38); c.fillText('TOES', x + 210, y - 38);
  });
  for (let i = 0; i < 5; i++) { const kx = x - 340 + i * 60; rrect(c, kx - 24, y - 12, 48, 70, 12); c.fillStyle = '#4DFFB4'; c.fill(); rrect(c, kx - 24, y - 12, 48, 14, 7); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill(); }
  rrect(c, x + 50, y - 12, 70, 70, 14); c.fillStyle = TS_OR; c.fill();
  const pd = 10 * pressK;
  rrect(c, x + 140, y - 12 + pd, 250, 70 - pd, 14); c.fillStyle = pressK > 0.3 ? '#BFF6FF' : TS_CY; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2A6A80'; c.stroke();
  paint(() => { c.font = '900 24px Montserrat'; c.fillStyle = '#103040'; c.fillText('THE OTHER 4', x + 265, y + 24 + pd / 2); c.fillStyle = '#5A2A00'; c.fillText('BIG', x + 85, y + 24); });
  if (pressK > 0.3) softDot(gctx, x + 265, y + 24, 160, TS_CY, 0.5 * pressK);
  return { wide: [x + 265, y + 20] };
}
// a wall screen showing his foot live (the 3D rig in a small view)
function tsWallFoot(x, y, w, h, t, toes) {
  const c = ctx; screenSpace();
  rrect(c, x - 14, y - 14, w + 28, h + 28, 26); c.fillStyle = '#1A1228'; c.fill();
  c.save(); rrect(c, x, y, w, h, 18); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2C5A6A'); g.addColorStop(1, '#0E2A36'); c.fillStyle = g; c.fillRect(x, y, w, h);
  const V = tsView({ cx: x + w / 2, cy: y + h * 0.5, S: w / 30, D: 40, pitch: 0.75, ty: 2, tz: -6 });
  tsFoot(c, V, { toes, knee: false, noShin: true, faces: 1, look: [0, -1] }, t);
  c.restore();
  paint(() => { c.font = '900 26px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#4DFFB4'; c.fillText('FOOT · LIVE', x + 20, y + 30); });
  softDot(gctx, x + w / 2, y + h / 2, w * 0.7, '#4DFFB4', 0.18);
}

SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  brainRoom(t);
  const pk = tsBump(t, c.slap, 0.5);
  const jump = ramp(t, c.slap + 0.05, c.slap + 0.2, E.outBack) * (1 - ramp(t, c.slap + 0.9, c.slap + 1.2));
  const toes = [{ lift: 0 }]; for (let i = 1; i <= 4; i++) toes.push({ lift: jump });
  tsWallFoot(300, 400, 480, 300, t, toes);
  // the brain behind its desk, then the desk and the panel
  const shrug = ramp(t, c.shrug, c.shrug + 0.25, E.outBack);
  const bx = 540, by = 905, bs = 1.0;
  const key = [540 + 265, 1140 + 20];
  const armR = pk > 0.01 || (t > c.slap - 0.25 && t < c.slap + 0.4) ? [(key[0] - bx) / bs, (key[1] - by) / bs - 40 * (1 - pk)] : shrug > 0.01 ? [200, -40 * shrug + 60] : undefined;
  const armL = shrug > 0.01 ? [-200, -40 * shrug + 60] : undefined;
  actor(() => brainGuy(bx, by, bs, t, { mood: shrug > 0.3 ? 'shrug' : pk > 0.2 ? 'squint' : 'calm', look: pk > 0.05 ? [0.6, 0.8] : [0, -0.3], armR, armL }));
  brainDesk(1060, t);
  tsPanel(540, 1140, t, pk);
  // the scan card pops in over the top on "scans"
  tsScanCard(540, 600, 0.95, ramp(t, c.card, c.card + 0.3), ramp(t, c.smudge, c.smudge + 0.5, E.inOutSine), null, 'BRAIN SCANS');
  return { glow: 0.85, push: { k: 1 + 0.02 * lt / D, cx: 540, cy: 900 } };
};

// a canvas on an easel; strokes appear on the cues (a sunset over a lake and a dock: the place he sits)
function tsEasel(x, y, t, k1, k2, k3) {
  const c = ctx; screenSpace();
  line(c, x - 260, y + 760, x - 150, y - 40, 22, '#6A3E26'); line(c, x + 260, y + 760, x + 150, y - 40, 22, '#6A3E26'); line(c, x, y + 820, x, y + 300, 18, '#5A3220');
  rrect(c, x - 300, y + 520, 600, 26, 8); c.fillStyle = '#7A4A2E'; c.fill();
  rrect(c, x - 280, y - 30, 560, 560, 10); c.fillStyle = '#FBF4E6'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#D9C9A8'; c.stroke();
  paint(() => {
    c.save(); rrect(c, x - 270, y - 20, 540, 540, 6); c.clip();
    if (k1 > 0) { const g = c.createLinearGradient(0, y - 20, 0, y + 330); g.addColorStop(0, '#8A4F92'); g.addColorStop(0.6, '#F07F6A'); g.addColorStop(1, '#FFC16E'); c.fillStyle = g; c.fillRect(x - 270, y - 20, 540 * clamp(k1), 350); }
    if (k2 > 0) { circle(c, x + 120, y + 270, 70 * E.outBack(clamp(k2)), '#FFF2C8'); c.fillStyle = '#4E3470'; c.fillRect(x - 270, y + 330, 540 * clamp(k2 * 1.3), 190); }
    if (k3 > 0) { c.fillStyle = '#B07656'; c.beginPath(); c.moveTo(x - 60, y + 520); c.lineTo(x + 60, y + 520); c.lineTo(x + 18, y + 400); c.lineTo(x - 18, y + 400); c.closePath(); c.globalAlpha = clamp(k3 * 2); c.fill();
      c.globalAlpha = 1; circle(c, x, y + 380 - 10 * (1 - clamp(k3)), 14 * clamp(k3 * 1.5), '#2A1B14'); }
    c.restore();
  });
}
SC.paint = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // a warm studio wall, a window glow on the right, the floor
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5A3A4A'); g.addColorStop(1, '#24162A'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  softDot(ctx, 880, 260, 620, '#FFB870', 0.25); softDot(gctx, 880, 260, 520, '#FFB870', 0.3);
  ctx.fillStyle = '#3A2430'; ctx.fillRect(0, 1560, W, 360);
  const k1 = ramp(t, c.stroke1, c.stroke1 + 0.6), k2 = ramp(t, c.stroke2, c.stroke2 + 0.6), k3 = ramp(t, c.stroke3, c.stroke3 + 0.5);
  const ex = 330, ey = 610;
  tsEasel(ex, ey, t, k1, k2, k3);
  // the brush tip travels over the canvas as it paints
  const tip = t < c.stroke2 ? [lerp(ex - 190, ex + 130, ramp(t, c.stroke1, c.stroke1 + 0.6, E.inOutSine)), ey + 90 + 26 * Math.sin(t * 9)]
    : t < c.stroke3 ? [ex + 110 + 24 * Math.sin(t * 7), lerp(ey + 250, ey + 360, ramp(t, c.stroke2, c.stroke2 + 0.6))] : [ex + 20 + 10 * Math.sin(t * 8), ey + 400];
  // the foot holds the brush between the big toe and the next: place the rig so its grip lands on the handle's end
  const toes = [{ curl: 0.3, lift: 0.1 }, { curl: 0.55 }, { curl: 0.35 }, { curl: 0.3 }, { curl: 0.3 }];
  const A = { toes, knee: false, noShin: true, profile: true };
  const rot = 0.08, L = 200, dir = [0.94, 0.34];
  const V = tsView({ cx: 0, cy: 0, S: 21, D: 60, yaw: -1.45, pitch: 0.1, ty: 4, tz: -6 });
  const G0 = tsFootGeo(V, A, t), gp = tsP(V, tsLerp3(G0.toes[0].J[1], G0.toes[1].J[2], 0.5)), an = tsP(V, TS_ANKLE);
  const rx = an[0] + (gp[0] - an[0]) * Math.cos(rot) - (gp[1] - an[1]) * Math.sin(rot), ry = an[1] + (gp[0] - an[0]) * Math.sin(rot) + (gp[1] - an[1]) * Math.cos(rot);
  const want = [tip[0] + dir[0] * L, tip[1] + dir[1] * L];
  V.cx += want[0] - rx; V.cy += want[1] - ry;
  const an2 = tsP(V, TS_ANKLE);
  const on = lookHeroBegin(ctx, { x: an2[0], y: an2[1] + 250 * 0.8, s: 0.8 });
  // the leg, from the ankle down to the bottom right, with a rolled-up trouser cuff
  { const e = [an2[0] + 60, an2[1] - 1100], r0 = 3.6 * an2[2], r1 = 4.6 * an2[2];
    ctx.beginPath(); tsCapsule(ctx, an2[0], an2[1], r0 + 3, e[0], e[1], r1 + 3); ctx.fillStyle = TSK.line; ctx.fill();
    ctx.beginPath(); tsCapsule(ctx, an2[0], an2[1], r0, e[0], e[1], r1); ctx.fillStyle = TSK.skin; ctx.fill();
    const cf = [lerp(an2[0], e[0], 0.42), lerp(an2[1], e[1], 0.42)];
    ctx.beginPath(); tsCapsule(ctx, cf[0], cf[1], r1 * 1.3, e[0], e[1], r1 * 1.4); ctx.fillStyle = '#2F3A78'; ctx.fill();
    ctx.beginPath(); tsCapsule(ctx, cf[0], cf[1], r1 * 1.3, cf[0] + 4, cf[1] - 50, r1 * 1.32); ctx.fillStyle = '#4A57A0'; ctx.fill(); }
  ctx.save(); ctx.translate(an2[0], an2[1]); ctx.rotate(rot); ctx.translate(-an2[0], -an2[1]);
  tsFoot(ctx, V, A, t);
  ctx.restore();
  lookHeroEnd(on);
  // the brush: from the toes' grip to the tip on the canvas
  const back = [want[0] + dir[0] * 40, want[1] + dir[1] * 40];
  line(ctx, back[0], back[1], tip[0], tip[1], 20, '#3A1E10'); line(ctx, back[0], back[1], tip[0], tip[1], 14, '#C0392B');
  line(ctx, lerp(back[0], tip[0], 0.78), lerp(back[1], tip[1], 0.78), lerp(back[0], tip[0], 0.9), lerp(back[1], tip[1], 0.9), 16, '#D8D0C0');
  const pc = t < c.stroke2 ? '#F07F6A' : t < c.stroke3 ? '#FFF2C8' : '#B07656';
  ctx.beginPath(); ctx.moveTo(lerp(back[0], tip[0], 0.9) - 9, lerp(back[1], tip[1], 0.9)); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(lerp(back[0], tip[0], 0.9) + 9, lerp(back[1], tip[1], 0.9)); ctx.closePath(); ctx.fillStyle = pc; ctx.fill();
  pill(560, 520, 'FOOT ARTISTS', TS_YE, popK(t, c.foot, shot.end, 0.15, 0.1), 46);
  return { glow: 0.8, push: { k: 1 + 0.025 * lt / D, cx: 600, cy: 800 } };
};

SC.every = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  brainRoom(t);
  const jaw = ramp(t, c.jaw, c.jaw + 0.2, E.outBack);
  actor(() => brainGuy(800, 1620, 0.7, t, { mood: jaw > 0.3 ? 'worried' : 'think', look: [-0.6, -1] }));
  const lit = c.keys.map((k) => (t >= k ? 1 : 0)).concat([t >= c.keys[3] + 0.13 ? 1 : 0]);
  tsScanCard(540, 880, 1.2, 1, 1, lit, 'FOOT ARTISTS');
  pill(540, 525, 'A SPOT FOR EVERY TOE', '#4DFFB4', popK(t, c.every, shot.end, 0.12, 0.1), 40);
  return { glow: 0.9, push: { k: 1 + 0.03 * lt / D, cx: 540, cy: 760 } };
};

SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the hook's framing, a touch closer at first, settling exactly on frame 1's view by the end
  const V0 = tsHookView(-0.4), u = E.inOutSine(clamp(lt / (D - 0.2)));
  const V = Object.assign({}, V0, { S: lerp(V0.S + 2.5, V0.S, u), cy: lerp(V0.cy + 30, V0.cy, u) });
  const tr = t > c.tremble && t < c.big3up ? 1 : 0;
  const big = ramp(t, c.big3up, c.big3up + 0.45, E.outBack) * (1 - ramp(t, c.loop_in - 0.42, c.loop_in - 0.1, E.inOutSine));
  const toes = [{ lift: big, wig: tr * 0.8 }];
  for (let i = 1; i <= 4; i++) toes.push({ lift: 0, wig: tr * 0.7 });
  const face = tsFaceAt([[-9, TS_F.focus], [c.scrunch, TS_F.scrunch], [c.big3up, TS_F.wow], [c.grin, TS_F.grin], [c.loop_in - 0.3, TS_F.focus]], t);
  const S = { toes, face, faces: 0, sweat: tr * 0.8 };
  const F = tsScene(V, t, S);
  return { glow: 0.85 };
};

SC.loop = (lt, t, shot) => SC.hook(lt, t - cu().loop_in - 0.40, shot);

// the cover (cover.sh): the answer's moment, the four small toes up together with their eyes, his face in shock
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.whole + 0.6;
  const V = tsHookView(tt), S = tsHookState(tt);
  S.face = TS_F.wow; S.happy = false; S.look = [0, -1];
  const F = tsScene(V, tt, S);
  const p = F.toe[2][F.toe[2].length - 1];
  shockLines(p[0], p[1] - 10, 150, 0.7, 10, '#FFFFFF', 7);
  screenSpace();
  bigWord('LIFT JUST', 540, 1180, 150, '#FFFFFF', 1, -0.03);
  bigWord('ONE TOE?', 540, 1350, 190, '#FFD447', 1, -0.03);
  return { glow: 0.85, noCaptions: true };
};

function initScenes2() {
  tsInitLake();
}
