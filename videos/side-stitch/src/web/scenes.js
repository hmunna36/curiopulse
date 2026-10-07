// Why Do You Get a STITCH When You Run? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- helpers
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
const xrayBg = () => darkBg('#10296A', '#030718');
// the organs' bounce while he runs (two steps a cycle), and the body's own bob
const bounceY = (t, k = 1) => 30 * k * Math.sin(t * 12.5 - 1.0);
const bodyBob = (t, k = 1) => 15 * k * Math.abs(Math.sin(t * 6.25));
function tickPillG(txt, x, y, k, col = '#4DFFB4', size = 40) {
  if (k <= 0) return;
  pill(x, y, '   ' + txt, col, k, size);
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText('   ' + txt).width; ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.17; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.moveTo(-w / 2 - size * 0.02, 0); ctx.lineTo(-w / 2 + size * 0.2, size * 0.24); ctx.lineTo(-w / 2 + size * 0.62, -size * 0.3); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu();
  hookDraw(t, t);
  return { glow: 0.8, flash: 0.14 * Math.exp(-Math.max(0, t - c.stab) * 9) * (t > c.stab ? 1 : 0) };
};

SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  hookDraw(t, t);
  screenSpace();
  const out = 1 - ramp(t, c.guess - 0.22, c.guess - 0.02);
  bigWord('CRAMP?', 730, 640, 128, '#FF5A6E', ramp(t, c.relax + 0.72, c.relax + 0.92, E.outBack) * out, 0.06);
  bigX(730, 640, 0.62, inv(c.not + 0.02, c.not + 0.2, t) * out);
  pill(540, 560, 'BEST GUESS', '#7FE9FF', ramp(t, c.guess, c.guess + 0.25) * (1 - ramp(t, c.guess + 0.2, c.guess + 0.4)), 54);
  const dive = ramp(lt, D - 0.42, D, E.inCubic);
  return { glow: 0.8, zblur: 0.35 * dive, zcx: 540, zcy: 960, flash: 0.3 * ramp(lt, D - 0.12, D) };
};

SC.chafe = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  xrayBg();
  const cam = { x: BL_K[0] + 78, y: BL_K[1] + 20, zoom: lerp(3.3, 2.75, ramp(lt, 0, D, E.outCubic)), rot: 0 };
  applyCam(cam);
  bellyXray(t, { press: 1, oy: bounceY(t, 0.6), rub: ramp(lt, 0.1, 0.5), fluid: 0.5, hiOut: 0.6, hiInn: 0.6, moods: { liver: 'ouch', stomach: 'calm' } });
  screenSpace();
  pill(540, 478, 'BEST GUESS', '#7FE9FF', 1 - ramp(t, c.chafing - 0.3, c.chafing - 0.1), 46);
  bigWord('CHAFING', 560, 560, 178, '#FF9A3C', ramp(t, c.chafing - 0.04, c.chafing + 0.18, E.outBack), -0.04);
  return { glow: 0.9, zblur: 0.3 * (1 - ramp(lt, 0, 0.3)), flash: 0.3 * (1 - ramp(lt, 0, 0.2)) };
};

SC.lining = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  xrayBg();
  const cam = camKeys(lt, [[0, 540, 1120, 0.98], [c.slippery - s0, 540, 1150, 1.16], [c.wall - s0 - 1.25, 540, 1150, 1.2], [c.wall - s0 - 0.45, 372, 1120, 2.1],
    [c.around - s0 - 0.3, 368, 1124, 2.2], [c.organs - s0 - 0.1, 560, 1120, 1.42], [D, 566, 1120, 1.5]]);
  applyCam(cam);
  const hiOut = ramp(t, c.wall - 0.9, c.wall - 0.5) * (1 - ramp(t, c.around - 0.3, c.around));
  const hiInn = ramp(t, c.around - 0.15, c.around + 0.25);
  bellyXray(t, { oy: 5 * Math.sin(t * 2.2), ox: 4 * Math.sin(t * 1.7), fluid: ramp(t, c.slippery - 0.2, c.slippery + 0.3), hiOut: Math.max(hiOut, 0.5 * ramp(t, c.slippery - 0.2, c.slippery + 0.2) * (1 - ramp(t, c.wall - 1.3, c.wall - 0.9))),
    hiInn: Math.max(hiInn, 0.5 * ramp(t, c.slippery - 0.2, c.slippery + 0.2) * (1 - ramp(t, c.wall - 1.3, c.wall - 0.9))), moods: { liver: 'calm', stomach: 'happy' } });
  screenSpace();
  const w1 = toScreen(cam, BL.cx - BL.rx, 1120), w2 = toScreen(cam, BL.cx + 30, BL.cy - (BL.ry - BL.gap) * 0.86);
  blLabel('1: ON THE WALL', 600, 700, w1[0] + 6, w1[1] - 60, BL.OUT, ramp(t, c.wall - 0.75, c.wall - 0.5) * (1 - ramp(t, c.around - 0.4, c.around - 0.25)), 44);
  blLabel('2: ROUND YOUR ORGANS', 540, 520, w2[0], w2[1], BL.INN, ramp(t, c.around + 0.1, c.around + 0.35), 40);
  return { glow: 0.85, zblur: 0.2 * (1 - ramp(lt, 0, 0.25)) };
};

SC.bounce = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  xrayBg();
  const k = ramp(lt, 0, 0.35);
  const cam = { x: 540, y: 1110 - bodyBob(t, k), zoom: lerp(1.5, 1.06, ramp(lt, 0, 0.5, E.outCubic)), rot: 0.012 * k * Math.sin(t * 6.25) };
  applyCam(cam);
  bellyXray(t, { oy: bounceY(t, k), fluid: 0.6, moods: { liver: t > c.bounce ? 'ouch' : 'calm', stomach: 'happy' } });
  // speed streaks: the body is running
  screenSpace();
  for (let i = 0; i < 10; i++) { const y = ((hash(i * 3.3) * H + t * 1500) % H), x = i % 2 ? 60 + 60 * hash(i) : 960 + 60 * hash(i); line(ctx, x, y, x, y + 150, 5, 'rgba(127,233,255,0.22)'); }
  // up-down arrows beside the bundle, on the beat of the bounce
  const up = bounceY(t, 1) < 0;
  for (const sx of [130, 950]) {
    const y = 1140 + bounceY(t, k) * 1.2;
    both((cc, g) => { cc.beginPath(); cc.moveTo(sx - 26, y + (up ? 14 : -14)); cc.lineTo(sx, y + (up ? -22 : 22)); cc.lineTo(sx + 26, y + (up ? 14 : -14)); cc.lineWidth = g ? 18 : 11; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = rgba('#FFD447', (g ? 0.5 : 1) * k); cc.stroke(); });
  }
  bigWord('BOING', 540, 500, 120, '#FFD447', ramp(t, c.bounce - 0.02, c.bounce + 0.18, E.outBack), -0.05 + 0.04 * Math.sin(t * 12.5));
  return { glow: 0.85 };
};

SC.full = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  xrayBg();
  const sw = ramp(t, c.full + 0.3, c.stomach_end + 0.15, E.outBack), press = ramp(t, c.stomach_end - 0.1, c.layers, E.inOutCubic);
  const kc = camKeys(lt, [[0, 540, 1110, 1.06], [c.layers - s0 - 0.25, 548, 1090, 1.12], [c.rub - s0 - 0.12, BL_K[0] + 96, BL_K[1] + 24, 2.55], [D, BL_K[0] + 88, BL_K[1] + 24, 2.8]]);
  const cam = { x: kc.x, y: kc.y - bodyBob(t, 1 - 0.6 * press), zoom: kc.zoom, rot: 0 };
  applyCam(cam);
  const rub = ramp(t, c.rub - 0.1, c.rub + 0.12);
  bellyXray(t, { oy: bounceY(t, 1 - 0.35 * press), swell: sw, press, fluid: 0.6 * (1 - press), rub, hiOut: 0.8 * rub, hiInn: 0.8 * rub,
    moods: { liver: rub > 0.3 ? 'ouch' : 'calm', stomach: sw > 0.3 ? 'full' : 'happy' } });
  // lunch arrives down the gullet
  const items = [['burger', 0], ['soda', 0.22], ['donut', 0.44]];
  for (const [kind, dly] of items) {
    const u = inv(c.full - 0.3 + dly, c.full + 0.25 + dly, t);
    if (u <= 0 || u >= 1) continue;
    const x = lerp(560, 650, E.inOutCubic(u)), y = lerp(430, 1010 + bounceY(t), E.inCubic(u));
    blFood(x, y, kind, 1.25 - 0.3 * u, clamp((1 - u) * 5));
  }
  screenSpace();
  bigWord('RUB', 760, 560, 170, '#FF5A6E', ramp(t, c.rub - 0.02, c.rub + 0.16, E.outBack), 0.07);
  return { glow: 0.9, blur: [0, 0] };
};

SC.nerve = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  xrayBg();
  const fire = t > c.sharp ? Math.max(0.35, Math.exp(-(t - c.sharp) * 1.6)) : 0;
  const sh = shake(t, 10 * (t > c.sharp ? Math.exp(-(t - c.sharp) * 4) : 0), 30, 5);
  const cam = { x: BL_K[0] + 30 + sh[0], y: BL_K[1] + 22 + sh[1], zoom: lerp(2.8, 3.25, ramp(lt, 0, D, E.inOutSine)), rot: 0 };
  applyCam(cam);
  bellyXray(t, { press: 1, swell: 1, oy: bounceY(t, 0.5), rub: 0.75, nerves: ramp(lt, 0.05, 0.9), fire, hiOut: Math.max(ramp(t, c.outer - 0.1, c.outer + 0.2) * 0.9, fire), hiInn: 0.2,
    moods: { liver: 'ouch', stomach: 'full' } });
  screenSpace();
  const wl = toScreen(cam, BL_K[0] + 4, BL_K[1] - 200);
  blLabel('OUTER LAYER', 640, 520, wl[0], wl[1], BL.OUT, ramp(t, c.outer - 0.05, c.outer + 0.2), 46);
  blLabel('PAIN NERVES', 300, 1140, toScreen(cam, BL_K[0] - 52, BL_K[1] + 104)[0], toScreen(cam, BL_K[0] - 52, BL_K[1] + 104)[1], '#FFE46B', ramp(t, c.sharp - 0.55, c.sharp - 0.3), 40);
  owBurst(770, 760, 0.82, inv(c.sharp + 0.02, c.sharp + 0.2, t), 'OW!', '#FF4A5E', 0.1);
  return { glow: 0.95, flash: 0.16 * (t > c.sharp ? Math.exp(-(t - c.sharp) * 8) : 0), zblur: 0.2 * (1 - ramp(lt, 0, 0.25)) };
};

// ---- outside again: one spot; he stops, it stops; then a camel
function spotState(t) {
  const c = cu(), s0 = shotOf('spot').start;
  const stop = ramp(t, c.stops - 0.05, c.stops + 0.7, E.inOutCubic), run = 0.72 * (1 - stop);
  const well = ramp(t, c.stops + 0.5, c.stop_end, E.inOutCubic);
  const tt = t - s0;
  let pose = clutchPose(runPose(t, run), 1 - well, t);
  pose.lean -= 0.04 * (1 - well);
  const st = { x: 540 + 8 * Math.sin(t * 6.2) * run, y: 1570, s: 1.25, pose };
  const cm = ramp(t, c.camel1 - 0.75, c.camel1 - 0.25, E.outBack);        // the camel leans in
  const see = ramp(t, c.camel1 - 0.5, c.camel1 - 0.2);
  let face = lerpFace(FACES.nervous, FACES.grin, well);
  face = Object.assign({}, face, { blink: well > 0.3 && well < 0.9 ? 1 : 0, lookX: -0.6 * (1 - well), lookY: 0.6 * (1 - well) });
  if (see > 0) face = Object.assign({}, lerpFace(face, FACES.confused, see), { lookX: lerp(0, 1.0, see), lookY: -0.2 * see, blink: 0 });
  st.face = face; st.headRot = -0.08 * (1 - well) + 0.07 * see; st.headDY = -4 * well;
  const dist = 0.72 * Math.min(tt, c.stops - s0) + (t > c.stops ? 0.72 * (1 - Math.exp(-(t - c.stops) * 3)) / 3 : 0);
  return { st, stop, run, well, cm, see, dist };
}
function spotDraw(t, cam) {
  const c = cu(), h = spotState(t);
  raceBack(cam, t, { banner: 0.5, dist: h.dist + 3 });
  applyCam(cam);
  if (h.cm > 0.001) {
    drawBeast(ctx, 1356 + 620 * (1 - h.cm), 1930, 1.5, 'camel', t, { chew: 1, look: -0.75, lid: 0.42 + 0.58 * Math.exp(-Math.pow((t - c.involved_end - 0.05) / 0.12, 2)), blanket: true, headDY: 10 * Math.sin(t * 2.2), bob: 0 });
  }
  charLayer(cam, h.st, t, { pal: RUNPAL, ambient: 0.1, post: runnerPost(4) });
  applyCam(cam);
  return h;
}
SC.spot = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  const cam = camKeys(lt, [[0, 540, 1262, 1.22], [c.one - s0 - 0.25, 540, 1258, 1.26], [c.one - s0 + 0.12, 506, 1236, 1.52], [c.stops - s0 - 0.15, 506, 1236, 1.56], [c.stops - s0 + 0.8, 540, 1250, 1.3], [D, 540, 1250, 1.3]]);
  const h = spotDraw(t, cam);
  const S = sorePt(h.st);
  painRings(S, t, 0, 1 - h.well);
  // a reticle locks on: ONE spot
  const lock = ramp(t, c.one - 0.2, c.one + 0.1, E.outBack) * (1 - ramp(t, c.stops + 0.1, c.stops + 0.5));
  if (lock > 0.01) both((cc, g) => {
    cc.save(); cc.translate(S[0], S[1]); cc.rotate(0.6 * (1 - lock) + 0.4 * Math.sin(t * 1.3)); cc.scale(lerp(2.4, 1, clamp(lock)), lerp(2.4, 1, clamp(lock)));
    cc.lineWidth = g ? 12 : 6; cc.strokeStyle = rgba('#FFD447', (g ? 0.5 : 1) * clamp(lock)); cc.lineCap = 'round';
    cc.beginPath(); cc.arc(0, 0, 62, 0, 7); cc.stroke();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; cc.beginPath(); cc.moveTo(Math.cos(a) * 44, Math.sin(a) * 44); cc.lineTo(Math.cos(a) * 86, Math.sin(a) * 86); cc.stroke(); }
    cc.restore();
  });
  screenSpace();
  const P = toScreen(cam, S[0], S[1]);
  pill(P[0] - 30, P[1] + 180, 'ONE SPOT', '#FFD447', ramp(t, c.one, c.one + 0.2) * (1 - ramp(t, c.stops - 0.1, c.stops + 0.1)), 46);
  tickPillG('PAIN: GONE', 760, 560, ramp(t, c.stop_end - 0.55, c.stop_end - 0.3) * (1 - ramp(lt, D - 0.25, D)), '#4DFFB4', 44);
  return { glow: 0.8, flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};
SC.subcam = (lt, t, shot) => {
  const c = cu();
  const cam = { x: 540 + 26 * ramp(t, c.camel1 - 0.6, c.camel1, E.inOutCubic), y: 1250, zoom: 1.3 + 0.05 * ramp(lt, 0, shot.end - shot.start), rot: 0 };
  spotDraw(t, cam);
  return { glow: 0.8 };
};

SC.weird = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  xrayBg();
  const cam = { x: 540, y: lerp(960, 930, ramp(lt, 0, D)), zoom: lerp(1.2, 1.36, ramp(lt, 0, D, E.outCubic)), rot: 0 };
  applyCam(cam);
  const ok = ramp(t, c.either - 0.25, c.either);
  bellyXray(t, { breath: Math.sin(t * 7.5), hiDia: 1, diaFace: ok > 0.5 ? 'happy' : 'calm', fluid: 0.5, moods: { liver: 'calm', stomach: 'happy' } });
  screenSpace();
  const d = toScreen(cam, 700, 842);
  blLabel('BREATHING MUSCLE', 560, 470, d[0], d[1], '#C8A8FF', ramp(lt, 0.1, 0.35), 42);
  stamp('NOT IT', 560, 1090, inv(c.either - 0.2, c.either + 0.05, t), '#4DFFB4', -0.1, 130);
  return { glow: 0.85, flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};

// ---- the desert: on a horse, then on a camel
const RIDE_GAP = 1700;
function rideOne(cam, t, kind, x0, pokeT, o = {}) {
  const c = cu();
  const b = drawBeast(ctx, x0, 1660, 1.0, kind, t, { walk: t * (kind === 'horse' ? 9.5 : 7), chew: kind === 'camel' ? 1 : 0, look: o.look === undefined ? -0.4 : o.look, lid: o.lid, blanket: true });
  const hurt = ramp(t, pokeT, pokeT + 0.2, E.outCubic);
  const dead = o.dead || 0;
  let face = lerpFace(FACES.grin, FACES.shock, hurt);
  face = lerpFace(face, FACES.nervous, ramp(t, pokeT + 0.45, pokeT + 0.8));
  if (dead > 0) face = Object.assign({}, lerpFace(face, FACES.annoyed, dead), { lookX: 0, lookY: 0, blink: 0.35 * dead });
  const st = riderState(b.seat, 0.92, t, { clutch: hurt, face, headDY: b.bob * 0.4 });
  riderLeg(ctx, b.seat, 0.92, RUNPAL);
  charLayer(cam, st, t, { pal: RUNPAL, ambient: 0.06, post: runnerPost(hurt > 0.5 ? 2 : 0) });
  applyCam(cam);
  const S = sorePt(st);
  const d = lerp(150 + 20 * Math.sin(t * 5), -24, ramp(t, pokeT - 0.2, pokeT, E.inCubic)) + 170 * ramp(t, pokeT + 0.5, pokeT + 1.0, E.inOutCubic);
  bigNeedle(S, d, 0.5, t, ramp(t, pokeT - 0.9, pokeT - 0.5) * (1 - ramp(t, pokeT + 0.9, pokeT + 1.2)), 0.72);
  if (hurt > 0) painRings(S, t, pokeT, clamp(hurt) * 0.9, 3);
  return { st, S, b };
}
SC.ride = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  const tw = c.camels - 0.3;                                        // the whip pan to the camel
  const pan = ramp(t, tw, tw + 0.26, E.inOutCubic);
  const close = ramp(t, c.sitting - 0.1, c.sitting + 0.5, E.inOutCubic);
  const cam = { x: 500 + RIDE_GAP * pan + 10 * close, y: lerp(lerp(1190, 1180, pan), 1050, close), zoom: lerp(lerp(1.08, 1.16, ramp(lt, 0, tw - s0)), 1.1, pan) + 0.42 * close, rot: 0 };
  desertBack(cam, t, t * 1.3);
  applyCam(cam);
  let P1 = null, P2 = null;
  if (pan < 1) P1 = rideOne(cam, t, 'horse', 560, c.horses + 0.12);
  if (pan > 0) P2 = rideOne(cam, t, 'camel', 560 + RIDE_GAP, c.camels_end - 0.12, { dead: ramp(t, c.sitting - 0.05, c.sitting + 0.25), look: lerp(-0.4, -0.85, close), lid: 0.5 });
  screenSpace();
  if (P1 && pan < 0.05) { const p = toScreen(cam, P1.S[0], P1.S[1]); owBurst(820, 640, 0.8, inv(c.horses + 0.14, c.horses + 0.32, t), 'OW!'); shockLines(p[0], p[1], 70, inv(c.horses + 0.12, c.horses + 0.5, t), 10, '#FFFFFF', 6); }
  if (P2 && pan > 0.95) { const p = toScreen(cam, P2.S[0], P2.S[1]); owBurst(820, 640, 0.8, inv(c.camels_end - 0.1, c.camels_end + 0.08, t) * (1 - ramp(t, c.sitting - 0.15, c.sitting)), 'OW!'); shockLines(p[0], p[1], 70, inv(c.camels_end - 0.12, c.camels_end + 0.26, t), 10, '#FFFFFF', 8); }
  const bl = Math.sin(Math.PI * pan);
  return { glow: 0.7, blur: [70 * bl, 0], flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};

// ---- Shakespeare at his desk
function bardScene(cam, t, o) {
  screenSpace();
  const bg = ctx.createRadialGradient(330, 1250, 60, 540, 1000, 1400);
  bg.addColorStop(0, '#6A3A22'); bg.addColorStop(0.5, '#2E1A1E'); bg.addColorStop(1, '#0C0812');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  for (let i = 0; i < 7; i++) line(ctx, -100 + i * 220, 200, -100 + i * 220, 1500, 6, 'rgba(0,0,0,0.25)');
  const c = ctx, hx = 560, hy = 1030 + 4 * Math.sin(t * 1.6);
  // hair behind the head
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hx + s * 104, hy + 40, 50, 128, s * 0.12, 0, 7); c.fillStyle = '#3A2218'; c.fill(); }
  // doublet
  c.beginPath(); c.moveTo(hx - 250, 1500); c.quadraticCurveTo(hx - 250, 1200, hx - 110, 1160); c.lineTo(hx + 110, 1160); c.quadraticCurveTo(hx + 250, 1200, hx + 250, 1500); c.closePath();
  { const g = c.createLinearGradient(hx - 250, 0, hx + 250, 0); g.addColorStop(0, '#5A2A4A'); g.addColorStop(0.5, '#3A1A36'); g.addColorStop(1, '#22102A'); c.fillStyle = g; c.fill(); }
  for (let i = 0; i < 5; i++) circle(c, hx, 1230 + i * 52, 9, '#FFD447');
  // ruff
  for (let i = 0; i < 15; i++) { const a = Math.PI * (i / 14), x = hx - Math.cos(a) * 176, y = hy + 138 + Math.sin(a) * 42; c.beginPath(); c.ellipse(x, y, 30, 24, 0, 0, 7); c.fillStyle = i % 2 ? '#F4F0E6' : '#D9D4C6'; c.fill(); }
  c.beginPath(); c.ellipse(hx, hy + 132, 150, 30, 0, 0, 7); c.fillStyle = '#FBF7EA'; c.fill();
  // head: a high bald dome
  c.beginPath(); c.ellipse(hx, hy, 104, 128, 0, 0, 7);
  { const g = c.createRadialGradient(hx - 36, hy - 50, 10, hx, hy, 140); g.addColorStop(0, '#FFDDBE'); g.addColorStop(0.5, '#EDB78E'); g.addColorStop(1, '#C48560'); c.fillStyle = g; c.fill(); }
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hx + s * 98, hy - 6, 30, 84, s * 0.1, 0, 7); c.fillStyle = '#3A2218'; c.fill(); }
  circle(c, hx + 112, hy + 66, 9, '#FFD447');
  const brow = o.brow || 0, lookY = o.lookY || 0;
  for (const s of [-1, 1]) {
    ellipse(c, hx + s * 38, hy + 4, 15, 15, '#FFFFFF'); circle(c, hx + s * 38 + (o.lookX || 0) * 5, hy + 5 + lookY * 5, 7.5, '#1A1020');
    c.beginPath(); c.moveTo(hx + s * 18, hy - 22 - 10 * brow); c.quadraticCurveTo(hx + s * 40, hy - 34 - 16 * brow, hx + s * 60, hy - 22 - 8 * brow); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = '#3A2218'; c.stroke();
  }
  c.beginPath(); c.moveTo(hx - 4, hy + 6); c.quadraticCurveTo(hx - 14, hy + 40, hx + 6, hy + 44); c.lineWidth = 5; c.strokeStyle = '#B4704E'; c.stroke();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hx, hy + 60); c.quadraticCurveTo(hx + s * 26, hy + 54, hx + s * 52, hy + 74); c.lineWidth = 13; c.strokeStyle = '#3A2218'; c.stroke(); }
  c.beginPath(); c.moveTo(hx - 16, hy + 96); c.quadraticCurveTo(hx, hy + 138, hx + 16, hy + 96); c.closePath(); c.fillStyle = '#3A2218'; c.fill();
  c.beginPath(); c.ellipse(hx, hy + 82, 12, 5 + 5 * (o.mouth || 0), 0, 0, 7); c.fillStyle = '#6A1E2A'; c.fill();
  // the desk
  c.fillStyle = '#3A2014'; c.fillRect(-300, 1440, 1700, 600); c.fillStyle = '#6A4022'; c.fillRect(-300, 1440, 1700, 22);
  // the candle
  rrect(c, 150, 1300, 52, 142, 8); c.fillStyle = '#F4E9C8'; c.fill(); ellipse(c, 176, 1440, 56, 12, '#8A6A2A');
  const fl = 1 + 0.12 * Math.sin(t * 17) + 0.08 * Math.sin(t * 29);
  both((cc, g) => { cc.beginPath(); cc.moveTo(176, 1300); cc.quadraticCurveTo(176 - 24 * fl, 1268, 176 + 3 * Math.sin(t * 9), 1218 - 16 * fl); cc.quadraticCurveTo(176 + 24 * fl, 1268, 176, 1300); cc.fillStyle = g ? 'rgba(255,170,60,0.9)' : '#FFD98A'; cc.fill(); });
  softDot(gctx, 176, 1262, 280, '#FF9A3C', 0.5); softDot(ctx, 176, 1262, 520, '#FF9A3C', 0.16);
  // his writing arm + the quill
  const wx = 792 + 34 * (o.write || 0) * Math.sin(t * 13), wy = 1400 - 6 * Math.abs(Math.sin(t * 13)) * (o.write || 0);
  c.lineCap = 'round'; c.lineWidth = 74; c.strokeStyle = '#2E1430'; c.beginPath(); c.moveTo(hx + 190, 1290); c.quadraticCurveTo(hx + 290, 1400, wx, wy + 10); c.stroke();
  ellipse(c, wx, wy - 30, 30, 12, '#FBF7EA', -0.4); circle(c, wx - 4, wy - 4, 30, '#EDB78E');
  c.save(); c.translate(wx - 10, wy + 14); c.rotate(-0.5 + 0.1 * (o.write || 0) * Math.sin(t * 13));
  line(c, 0, 26, 0, -250, 6, '#F4F0E6');
  c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(58, -150, 10, -262); c.quadraticCurveTo(-46, -160, 0, -60); c.closePath(); c.fillStyle = '#FBF7EA'; c.fill();
  for (let i = 0; i < 6; i++) line(c, 0, -90 - i * 28, (i % 2 ? 1 : -1) * 26, -112 - i * 28, 2.5, '#C8C2B0');
  c.restore();
}
// the page, held up big: his own line (The Tempest, Act 1, Scene 2), written on
function bardPage(k, wk, t, stampK) {
  if (k <= 0) return;
  const c = ctx; screenSpace();
  c.save(); c.translate(540, 640 + 500 * (1 - E.outCubic(clamp(k))) * 0); c.rotate(-0.035); c.scale(E.outBack(clamp(k), 1.4), E.outBack(clamp(k), 1.4));
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16;
  rrect(c, -420, -190, 840, 380, 14); c.fillStyle = '#F2E2B8'; c.fill(); c.shadowColor = 'transparent';
  c.lineWidth = 5; c.strokeStyle = '#B89A5A'; c.stroke();
  const lines = ['“…thou shalt have cramps,', 'Side-stitches that shall', 'pen thy breath up.”'];
  c.font = 'italic 700 54px Georgia'; c.textAlign = 'left'; c.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) {
    const u = clamp(wk * 3 - i);
    if (u <= 0) continue;
    const w = c.measureText(lines[i]).width, x0 = -w / 2, y = -98 + i * 84;
    c.save(); c.beginPath(); c.rect(x0 - 10, y - 44, (w + 20) * u, 88); c.clip();
    c.fillStyle = '#2A1A10'; c.fillText(lines[i], x0, y);
    if (i === 1) { const ws = c.measureText('Side-stitches').width; c.fillStyle = '#C8203A'; c.fillText('Side-stitches', x0, y); line(c, x0, y + 34, x0 + ws, y + 34, 6, '#C8203A'); }
    c.restore();
  }
  c.restore();
  pill(540, 880, 'SHAKESPEARE · THE TEMPEST', '#C8A8FF', clamp(k * 2 - 1), 34);
}
SC.bard = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 1000, zoom: 1.0 + 0.06 * ramp(lt, 0, D), rot: 0 };
  const still = ramp(t, c.still - 0.05, c.still + 0.2);
  bardScene(cam, t, { write: 1 - still, brow: still, lookY: lerp(0.9, -0.8, still), lookX: 0.2 * (1 - still), mouth: still });
  bardPage(ramp(lt, 0.02, 0.3), ramp(t, c.wrote - 0.2, c.pain2_end), t);
  screenSpace();
  stamp('STILL NOT SURE', 540, 650, inv(c.still - 0.02, c.still + 0.2, t), '#FF4D5E', -0.1, 104);
  pill(500, 472, '400 YEARS LATER', '#FFD447', ramp(t, c.science - 0.05, c.science + 0.2), 40);
  return { glow: 0.7, flash: 0.25 * (1 - ramp(lt, 0, 0.18)), capY: 1500 };
};

// ---- the finish: slow down, lean forward, and the camel takes the race; then the loop
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, DUR = TLd.duration;
  const LOOP = 0.4;
  if (t >= DUR - LOOP) { hookDraw(t - DUR, t); return { glow: 0.8, blur: [90 * (1 - ramp(t, DUR - LOOP, DUR - LOOP + 0.14)), 0] }; }
  const slow = ramp(t, c.slow - 0.15, c.slow + 0.7, E.inOutCubic), bow = ramp(t, c.lean - 0.1, c.lean + 0.45, E.inOutCubic) * (1 - ramp(t, c.never - 0.1, c.never + 0.35, E.inOutCubic));
  const run = 0.6 * (1 - slow);
  let pose = runPose(t, run);
  if (bow > 0) { let q = JSON.parse(JSON.stringify(pose)); q.hipY = -196; q = ikReach(ikReach(q, 'L', [-52, -118], -1), 'R', [52, -118], -1); pose = lerpPose(pose, q, bow); }
  const st = { x: 540, y: 1570, s: 1.25, pose, headDY: 26 * bow };
  // the camel gallops through the tape
  const g0 = c.never - 0.15, g1 = c.camel3 + 0.35, gu = inv(g0, g1, t), cx = lerp(-520, 1750, gu);
  const seen = ramp(t, c.never, c.never + 0.25), stare = ramp(t, c.camel3 + 0.1, c.camel3 + 0.35);
  let face = lerpFace(FACES.nervous, FACES.calm, slow);
  face = Object.assign({}, lerpFace(face, FACES.grin, bow), { blink: bow > 0.5 ? 1 : 0 });
  if (seen > 0) face = Object.assign({}, lerpFace(face, FACES.startled, seen * (1 - stare)), { lookX: lerp(-1, 1, clamp(gu * 1.3)) * (1 - stare), lookY: -0.3 * (1 - stare), blink: 0 });
  if (stare > 0) face = Object.assign({}, lerpFace(face, FACES.annoyed, stare), { lookX: 0, lookY: 0, blink: 0.4 * stare });
  st.face = face; st.headRot = 0.1 * seen * (1 - stare) * lerp(-1, 1, clamp(gu * 1.3));
  const cam = { x: 540, y: 1250, zoom: 1.3 + 0.07 * stare, rot: 0 };
  const dist = 0.6 * (lt - (slow > 0 ? 0 : 0)) * (1 - slow) + 40;
  raceBack(cam, t, { banner: 0.92, word: 'FINISH', dist: 40 + 0.6 * Math.min(lt, c.slow - shot.start) + 0.25 * (1 - Math.exp(-Math.max(0, t - c.slow) * 2)) });
  applyCam(cam);
  // the tape (it snaps when the camel hits it)
  const snap = ramp(t, lerp(g0, g1, 0.42), lerp(g0, g1, 0.42) + 0.25);
  if (snap < 1) both((cc, g) => { cc.lineWidth = g ? 14 : 9; cc.strokeStyle = rgba('#FFF6DC', (g ? 0.4 : 1) * (1 - snap)); cc.beginPath(); cc.moveTo(160, 1150); cc.quadraticCurveTo(540, 1150 + 20 * Math.sin(t * 3) - 200 * snap, 920, 1150); cc.stroke(); });
  if (gu > 0 && gu < 1) drawBeast(ctx, cx, 1640 - 20 * Math.abs(Math.sin(t * 14)), 1.18, 'camel', t, { flip: true, walk: t * 16, chew: 1, look: -0.2, lid: 0.3, bib: '1', medal: true, blanket: false });
  charLayer(cam, st, t, { pal: RUNPAL, ambient: 0.1, post: runnerPost(4) });
  // confetti when the tape goes
  screenSpace();
  const ct = t - lerp(g0, g1, 0.42);
  if (ct > 0 && ct < 2.2) for (let i = 0; i < 46; i++) {
    const a = -Math.PI / 2 + (hash(i * 1.7) - 0.5) * 2.6, v = 500 + 700 * hash(i * 3.1);
    const x = 540 + Math.cos(a) * v * ct * 0.7, y = 600 + Math.sin(a) * v * ct * 0.7 + 600 * ct * ct, r = 9 + 9 * hash(i);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ct * 6 + i); ctx.fillStyle = rgba(['#FFD447', '#FF5A6E', '#7FE9FF', '#4DFFB4'][i % 4], clamp(2.2 - ct)); ctx.fillRect(-r, -r * 0.4, 2 * r, r * 0.8); ctx.restore();
  }
  tickPillG('SLOW DOWN', 300, 500, ramp(t, c.slow + 0.1, c.slow + 0.3) * (1 - ramp(t, c.never - 0.25, c.never - 0.05)), '#4DFFB4', 40);
  tickPillG('LEAN FORWARD', 730, 590, ramp(t, c.lean + 0.15, c.lean + 0.35) * (1 - ramp(t, c.never - 0.25, c.never - 0.05)), '#4DFFB4', 40);
  const wh = ramp(t, DUR - LOOP - 0.12, DUR - LOOP, E.inCubic);
  return { glow: 0.8, blur: [90 * wh, 0], flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};

function initScenes2() {
  initRace();
  initBeasts();
}

// ---- the cover (rendered from a one-shot copy of the timeline; not in the Short)
SC.cover = (lt, t, shot) => {
  const c = cu(), tt = c.stab + 0.42;
  const h = hookState(tt), cam = { x: 500, y: 965, zoom: 1.55, rot: -0.02 };
  h.st.face = Object.assign({}, FACES.shock, { lookX: -0.7, lookY: 0.8 });
  raceBack(cam, tt, { banner: 0, dist: 1.2 });
  charLayer(cam, h.st, t, { pal: RUNPAL, ambient: 0.04, post: runnerPost(4) });
  applyCam(cam);
  const S = sorePt(h.st);
  bigNeedle(S, -30, 0.62, tt, 1, 1.25);
  painRings(S, 0.2, 0, 1);
  screenSpace();
  const P = toScreen(cam, S[0], S[1]);
  shockLines(P[0], P[1], 110, 0.35, 14, '#FFFFFF', 4);
  bigWord('WHY THE', 540, 505, 150, '#FFFFFF', 1, -0.03);
  bigWord('STITCH?', 540, 690, 250, '#FFD447', 1, -0.03);
  return { glow: 0.8, noCaptions: true, noSubscribe: true };
};
