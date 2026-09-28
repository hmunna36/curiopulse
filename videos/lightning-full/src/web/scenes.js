// Full Short: new shots layered on the 10 s kit (kit.js). Same world, same hiker.
'use strict';

let LEADER, NEURON, NERVE_SEED = 17;
const RANGER_YEARS = [1942, 1969, 1970, 1972, 1973, 1976, 1977];

function initScenes2() {
  const c = TLd.cues;
  c.fern_grow = c.fern; c.label_fern = c.fern + 0.75; // kit fern shot
  LEADER = makeBolt(301, 590, -1500, 546, 552, { disp: 520, depth: 8, branches: 14 });
  NEURON = makeNeuron();
}

const shotDur = (id) => { const s = TLd.shots.find((x) => x.id === id); return s.end - s.start; };

// ---------------------------------------------------------------- the strike world
// tw = time relative to the return stroke; before it, a leader descends for `lead` s
function strikeLight(tw) {
  if (tw < 0) return 0.75 + 0.3 * Math.abs(vnoise(tw * 40, 2));
  let I = 1.9 * Math.exp(-tw * 7);
  for (const rs of [0.2, 0.37]) if (tw >= rs) I = Math.max(I, 1.35 * Math.exp(-(tw - rs) * 9));
  return I + 0.3 * clamp(1 - tw / 0.95);
}
function strikeFlash(tw) {
  if (tw < 0) return 0;
  let f = 0.85 * Math.exp(-tw * 22);
  for (const rs of [0.2, 0.37]) if (tw >= rs) f = Math.max(f, 0.3 * Math.exp(-(tw - rs) * 20));
  return f;
}
function strikeWorld(cam, t, tw, o = {}) {
  const lead = o.lead || 0.35;
  const pre = tw < 0;
  const I = tw < -lead ? 0 : strikeLight(tw);
  const p = tw < -lead ? 0 : pre ? (o.progress ? o.progress(tw) : lerp(o.p0 === undefined ? 0.4 : o.p0, 1, Math.pow(1 + tw / lead, 1.1))) : 1;
  const sky = tw < -lead ? (o.skyBase || 0.05) : clamp(I * (pre ? 0.25 : 0.55));
  const rt = o.rainT === undefined ? t : o.rainT;
  drawStorm(cam, { flash: sky, t: o.cloudT === undefined ? t : o.cloudT });
  drawRain(rt, o.rain === undefined ? 1 : o.rain, 0);
  drawHill(cam, { flash: sky, crestY: 1180, t, blast: tw >= 0 ? Math.exp(-tw * 5) : 0 });
  applyCam(cam);
  if (p > 0) drawBolt(o.bolt || BOLT1, p, pre && o.violetPre ? I * 0.7 : I, t, { violet: pre && o.violetPre });
  if (o.streamer && pre) streamer(t, tw, o.streamer);
  if (!pre) {
    const k = tw / 0.6;
    if (k < 1) { const R = 40 + 700 * E.outCubic(k); ring(540, 1184, R, R * 0.13, 7 * (1 - k), '#BFE6FF', 0.85 * (1 - k)); }
    softDot(gctx, 540, 1180, 260, '#9FD4FF', 0.7 * Math.exp(-tw * 6));
  }
  const zapK = inv(0, 0.07, tw);
  const base = o.basePose ? o.basePose(t) : POSES.stand;
  const pose = pre ? lerpPose(base, POSES.flinch, tw < -lead ? 0 : E.outCubic(inv(-lead, 0, tw)) * (o.flinch === undefined ? 1 : o.flinch))
    : lerpPose(POSES.flinch, POSES.zap, clamp(E.outBack(zapK, 1.3), 0, 1.08));
  const face = pre ? (tw < -lead ? (o.faceBefore || FACES.calm) : FACES.worried) : lerpFace(FACES.worried, FACES.shock, clamp(zapK * 1.5));
  const jit = !pre ? shake(t, 7 * clamp(I), 45, 9) : [0, 0];
  const st = { x: CH.x + jit[0], y: CH.y + jit[1], s: CH.s, pose, face,
    frizz: !pre ? E.outBack(zapK) : (o.frizzBefore || 0), soot: 0.4 * clamp(tw / 0.7), seed: 3 };
  const r = charLayer(cam, st, t, { light: clamp(I * 0.2, 0, 0.3), aura: !pre ? clamp(I * 0.28, 0, 0.3) : 0.05, ambient: 0.1 });
  applyCam(cam);
  if (!pre) bodyArcs(worldPaths(st, r), Math.round(t * FPS), Math.round(3 + 6 * clamp(I)), 1);
  sparks(11, 540, 575, 0, tw, 50, { speed: 1150, life: 0.75, spread: Math.PI * 0.95 });
  sparks(12, 540, 1180, 0.02, tw, 34, { speed: 850, life: 0.5, dir: -Math.PI / 2, spread: 1.3 });
  if (tw > 0.12) smoke(31, 548, 590, 0.12, tw, { rate: 18, rise: 280, alpha: 0.32, size: 26 });
  drawRain(rt, o.rain === undefined ? 1 : o.rain, 1);
  return { flash: strikeFlash(tw), I, st, r };
}

// upward streamer: violet sparks climbing off the hair toward the leader
function streamer(t, tw, o) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0) return;
  const fr = Math.floor(t * FPS);
  const x0 = 546, y0 = 520 - 60 * (o.frizz || 0.5), len = (o.len || 120) * k;
  for (let i = 0; i < 4; i++) {
    const rng = mulberry32(fr * 7 + i * 131);
    const ang = -Math.PI / 2 + (rng() - 0.5) * 0.9;
    const L = len * (0.45 + rng() * 0.6);
    const pts = jagged(rng, x0 + (rng() - 0.5) * 30, y0, x0 + Math.cos(ang) * L, y0 + Math.sin(ang) * L, 40, 4);
    poly(ctx, pts, 2.2, 'rgba(235,220,255,0.95)');
    poly(gctx, pts, 12, 'rgba(160,110,255,0.9)');
  }
  softDot(gctx, x0, y0, 70, '#B89CFF', 0.7 * k);
}

// ---------------------------------------------------------------- 1. tease: strike, freeze, flatline
function ecgFlat(k, y, t, col = '#FF4D5E') {
  // one last blip then a flat line drawn across the screen
  const x1 = lerp(0, W, E.outCubic(clamp(k)));
  const pts = [];
  for (let x = 0; x <= x1; x += 6) {
    let v = 0;
    const d = x - 300;
    if (d > 0 && d < 40) v = -Math.sin((d / 40) * Math.PI) * 18;
    if (d > 70 && d < 90) v = 22;
    if (d > 90 && d < 110) v = -150 + (d - 90) * 3;
    if (d > 110 && d < 130) v = 60 - (d - 110) * 3;
    pts.push([x, y + v]);
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowColor = col; ctx.shadowBlur = 24;
  poly(ctx, pts, 7, col);
  ctx.shadowBlur = 0;
  poly(ctx, pts, 2.5, '#FFE3E6');
  if (k < 1) softDot(ctx, x1, y, 40, '#FFFFFF', 0.8);
  ctx.restore();
}
SC.tease = (lt, t) => {
  const c = TLd.cues, ts = c.tease_strike;
  const frozen = t >= c.freeze;
  const tt = frozen ? c.freeze - 1 / FPS : t;
  const tw = tt - ts;
  const push = ramp(tt, 0, c.freeze, E.outCubic);
  const fz = frozen ? E.outCubic(inv(c.freeze, TLd.shots[1].start, t)) : 0;
  const [shx, shy] = tw >= 0 && !frozen ? shake(t, 34 * Math.exp(-tw * 4) + 3, 24, 3) : [0, 0];
  const cam = { x: 540, y: lerp(955, 965, push) - 40 * fz, zoom: lerp(1.2, 1.32, push) * (1 + 0.16 * fz), rot: 0.012 * Math.sin(tt * 2) - 0.03 * fz, sx: shx, sy: shy };
  const o = strikeWorld(cam, tt, tw, { lead: ts, p0: 0.55, rainT: frozen ? tt : t });
  const post = { flash: frozen ? 0.9 * Math.exp(-(t - c.freeze) * 30) : o.flash };
  if (frozen) {
    const g = clamp((t - c.freeze) / 0.1);
    post.desat = 0.9 * g; post.tint = '#FF5566'; post.tintA = 0.42 * g;
    post.overlay = () => { if (t >= c.flatline1) ecgFlat((t - c.flatline1) / 0.35, 860, t); };
  }
  return post;
};

// ---------------------------------------------------------------- 2. rewind to before the strike
SC.rewind = (lt, t, shot) => {
  const c = TLd.cues, ts = c.tease_strike;
  const D = shot.end - shot.start, rw = c.rewind_end - c.rewind;
  const k = clamp(lt / rw);
  // world time runs backwards from the freeze to well before the leader, then plays forward calmly
  const tt = lt < rw ? lerp(c.freeze - 1 / FPS, -0.8, E.inOutSine(k)) : -0.8 + (lt - rw) * 0.9;
  const tw = tt - ts;
  const cam = { x: 540, y: lerp(925, 900, E.inOutSine(k)), zoom: lerp(1.52, 1.02, E.inOutSine(k)), rot: lerp(-0.03, 0, k) };
  const o = strikeWorld(cam, tt, tw, { lead: ts, p0: 0.55, rainT: 5 + tt, cloudT: 5 + tt, basePose: (x) => (lt < rw ? POSES.stand : walkPose(x, 6)) });
  const vh = lt < rw ? 1 : clamp(1 - (lt - rw) / 0.18);
  return {
    flash: o.flash * 0.5, vhs: vh, desat: 0.35 * vh, tint: '#8FA0FF', tintA: 0.12 * vh,
    overlay: () => {
      if (vh <= 0.05 && lt > rw + 0.25) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = '800 58px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const blink = Math.floor(t * 4) % 2 === 0;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      const label = lt < rw ? '◀◀ REWIND' : '▶ PLAY';
      ctx.fillText(label, 83, 243);
      ctx.fillStyle = lt < rw && !blink ? 'rgba(255,255,255,0.6)' : '#FFFFFF';
      ctx.fillText(label, 80, 240);
      ctx.restore();
    },
  };
};

// ---------------------------------------------------------------- 3. the storm rolls in (wide)
SC.approach = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const k = lt / D;
  const cam = { x: 540, y: lerp(780, 840, E.inOutSine(k)), zoom: lerp(0.74, 0.84, E.inOutSine(k)), rot: -0.012 };
  const fl = Math.max(0, vnoise(t * 7, 3)) * 0.35 + (Math.abs(lt - 0.35) < 0.05 ? 0.4 : 0);
  drawStorm(cam, { flash: fl * 0.6, t: 8 + t * 8 });
  // shelf cloud rolling in from the left
  camTransform(ctx, parallax(cam, 0.5), 1);
  ctx.globalAlpha = 0.95;
  ctx.drawImage(ENV.cloudsFront, lerp(-1900, -1300, k), -120, 2200, 700);
  ctx.globalAlpha = 1;
  // distant bolt inside the storm front
  applyCam(parallax(cam, 0.55));
  if (lt > 0.3 && lt < 0.55) {
    const b = makeBolt(900 + Math.floor(lt * 20), 150, 250, 230, 1080, { disp: 160, depth: 6, branches: 4 });
    drawBolt(b, 1, 0.8 * (1 - (lt - 0.3) / 0.25), t, { width: 0.6 });
  }
  drawRain(t, 1, 0);
  drawHill(cam, { flash: fl * 0.4, crestY: 1180, t: t * 2.5 });
  const st = { x: 520 + lt * 30, y: CH.y, s: CH.s, pose: walkPose(t, 7), face: FACES.calm, frizz: 0, soot: 0, seed: 3 };
  charLayer(cam, st, t, { ambient: 0.22, light: fl * 0.3 });
  drawRain(t, 1, 1);
  const enter = 1 - E.outCubic(inv(0, 0.14, lt));
  return { zblur: enter * -0.25, zcx: 540, zcy: 900 };
};

// ---------------------------------------------------------------- 4. stepped leader
function leaderProgress(t) {
  const c = TLd.cues;
  // discrete ~50 m steps every 0.12 s; reaches the head at the connection cue
  const a = c.leader - 1.4, b = c.connect;
  const k = clamp((t - a) / (b - a));
  const steps = 26;
  return Math.pow(Math.floor(k * steps) / steps, 0.92);
}
SC.leader = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const p = Math.max(0.03, leaderProgress(t));
  const n = LEADER.main.length;
  const tip = LEADER.main[Math.min(n - 1, Math.floor(p * (n - 1)))];
  const cam = { x: 560, y: Math.max(-1180, tip[1] + 180) , zoom: 0.92, rot: 0.02 };
  cam.y = lerp(-1180, cam.y, E.outCubic(clamp(lt / 0.3)));
  const inCloud = 0.25 + 0.45 * Math.max(0, vnoise(t * 14, 2));
  drawStorm(cam, { flash: inCloud, t: 6 + t * 3 });
  applyCam(cam);
  // cloud base the leader drops out of, lit from inside
  ctx.globalAlpha = 0.95; ctx.drawImage(ENV.cloudsFront, -700, -1850, 2400, 1000); ctx.globalAlpha = 1;
  softDot(ctx, 600, -1250, 700, '#8E7BFF', 0.25 * inCloud);
  softDot(gctx, 600, -1250, 500, '#A89BFF', 0.35 * inCloud);
  const stepFlash = 1 - ((t * FPS) % 4) / 4;
  drawBolt(LEADER, p, 0.7 + 0.4 * stepFlash, t, { violet: true, width: 1.15 });
  softDot(gctx, tip[0], tip[1], 120, '#C8B0FF', 0.9);
  drawRain(t, 0.8, 1);
  pill(300, 300, 'STEPPED LEADER', '#C8B0FF', ramp(lt, 0.45, 0.65) * 1.1, 36);
  return { blur: lt < 0.14 ? [0, -140 * (1 - lt / 0.14)] : null };
};

// ---------------------------------------------------------------- 5. his body answers with a streamer
SC.streamer = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const p = leaderProgress(t);
  const meet = c.streamer + 0.45;
  const pullK = E.inOutCubic(inv(meet, meet + 0.5, t));
  const cam = { x: 546, y: lerp(lerp(640, 600, lt / 1.2), 520, pullK), zoom: lerp(lerp(2.2, 2.55, E.outCubic(clamp(lt / 1.2))), 1.35, pullK), rot: -0.02 * pullK };
  const fz = 0.2 + 0.45 * ramp(lt, 0, 0.9);
  drawStorm(cam, { flash: 0.1 + 0.15 * Math.abs(vnoise(t * 11, 1)), t: 6 + t });
  drawRain(t * 0.25, 0.8, 0);
  drawHill(cam, { flash: 0.1, crestY: 1180, t });
  applyCam(cam);
  drawBolt(LEADER, p, 0.6 + 0.3 * Math.abs(vnoise(t * 30, 4)), t, { violet: true, width: 0.8 });
  const st = { x: CH.x, y: CH.y, s: CH.s, pose: lerpPose(POSES.stand, POSES.flinch, 0.35 * ramp(lt, 0.2, 1)), face: FACES.worried, frizz: fz, soot: 0, seed: 3 };
  charLayer(cam, st, t, { ambient: 0.12, light: 0.12 });
  applyCam(cam);
  streamer(t, 0, { k: ramp(t, c.streamer, c.streamer + 0.3), len: 150, frizz: fz });
  drawRain(t * 0.25, 0.8, 1);
  return {};
};

// ---------------------------------------------------------------- 6. connection → return stroke
SC.connect = (lt, t, shot) => {
  const c = TLd.cues;
  const tw = t - c.connect;
  const [shx, shy] = tw >= 0 ? shake(t, 36 * Math.exp(-tw * 4) + 2, 24, 3) : [0, 0];
  const zin = E.inCubic(inv(0, c.connect - shot.start, lt));
  const cam = { x: 546, y: lerp(640, 700, zin), zoom: lerp(1.35, 1.2, zin) * (tw >= 0 ? 1 + 0.08 * Math.exp(-tw * 6) : 1), rot: 0, sx: shx, sy: shy };
  const o = strikeWorld(cam, t, tw, {
    lead: 5, bolt: LEADER, violetPre: true, progress: () => leaderProgress(t), flinch: 0.5, frizzBefore: 0.65,
    streamer: { k: 1, len: lerp(150, 230, zin), frizz: 0.65 }, rainT: tw < 0 ? t * 0.25 : t, faceBefore: FACES.worried,
  });
  return { flash: o.flash };
};

// ---------------------------------------------------------------- 7. 30,000 A and 27,700 °C
SC.stat = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const cmpK = E.inOutCubic(inv(c.hotter - 0.05, c.hotter + 0.3, t));
  const exitK = E.inCubic(inv(D - 0.14, D, lt));
  const cam = { x: 540, y: 960, zoom: lerp(1.08, 1.0, E.outCubic(clamp(lt / 0.3))) * (1 + exitK * 0.25), rot: 0 };
  screenSpace();
  const g = ctx.createRadialGradient(540, 860, 40, 540, 960, 1300);
  g.addColorStop(0, '#16215A'); g.addColorStop(0.6, '#090D2A'); g.addColorStop(1, '#03040C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // the white-hot channel (right third), Sun slides in on the left
  const cx = 790;
  const fr = Math.floor(t * FPS / 2);
  for (let i = 0; i < 2; i++) {
    const bb = makeBolt(700 + fr * 3 + i * 17, cx + (i ? 30 : -20), -400, cx + (i ? -10 : 15), 2400, { disp: 110, depth: 7, branches: 3 });
    drawBolt(bb, 1, i ? 0.55 : 1.25, t, { width: i ? 0.7 : 1.9 });
  }
  softDot(gctx, cx, 900, 300, '#9FD4FF', 0.4);
  sparks(40 + fr % 5, cx, 700 + 300 * hash(fr), t - 0.02 * (fr % 3), t, 10, { speed: 500, life: 0.3, grav: 0, spread: Math.PI });
  if (cmpK > 0.01) sunIcon(lerp(-200, 280, cmpK), 700, 110, t);
  const v = 30000 * E.outCubic(inv(c.count, c.count_end, t));
  const hud = () => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    const fade1 = 1 - cmpK;
    if (fade1 > 0.01) {
      ctx.save(); ctx.globalAlpha = fade1;
      const punch = t > c.count_end ? 1 + 0.12 * Math.exp(-(t - c.count_end) * 9) : 1;
      ctx.translate(390, 560 - 220 * cmpK); ctx.scale(punch, punch);
      ctx.font = '400 230px Anton'; ctx.textBaseline = 'alphabetic';
      const txt = fmt(Math.floor(v / 10) * 10);
      ctx.lineWidth = 18; ctx.strokeStyle = '#070A1E'; ctx.strokeText(txt, 0, 0);
      ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 0);
      const ak = E.outBack(inv(c.count_end - 0.03, c.count_end + 0.12, t), 2.4);
      if (ak > 0) {
        ctx.scale(ak, ak); ctx.font = '900 110px Montserrat'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 18; ctx.strokeText('AMPS', 0, 105); ctx.fillStyle = '#FFD447'; ctx.fillText('AMPS', 0, 105);
      }
      ctx.restore();
    }
    if (cmpK > 0.01) {
      ctx.globalAlpha = cmpK; ctx.textBaseline = 'middle';
      ctx.font = '400 84px Anton'; ctx.lineWidth = 12; ctx.strokeStyle = '#070A1E';
      const sv = fmt(Math.round(5500 * E.outCubic(inv(c.hotter, c.hotter + 0.5, t)) / 100) * 100) + '°C';
      const bv = fmt(Math.round(27700 * E.outCubic(inv(c.hotter + 0.2, c.hotter + 0.9, t)) / 100) * 100) + '°C';
      ctx.strokeText(sv, 280, 960); ctx.fillStyle = '#FFB070'; ctx.fillText(sv, 280, 960);
      ctx.strokeText(bv, 770, 960); ctx.fillStyle = '#BFF0FF'; ctx.fillText(bv, 770, 960);
      ctx.font = '800 34px Montserrat'; ctx.lineWidth = 8;
      ctx.strokeText("SUN'S SURFACE", 280, 1034); ctx.fillStyle = '#FFB380'; ctx.fillText("SUN'S SURFACE", 280, 1034);
      ctx.strokeText('LIGHTNING', 770, 1034); ctx.fillStyle = '#9FE8FF'; ctx.fillText('LIGHTNING', 770, 1034);
      const sk = E.outBack(inv(c.hotter + 0.85, c.hotter + 1.05, t), 2.2);
      if (sk > 0) {
        ctx.globalAlpha = 1;
        ctx.translate(530, 420); ctx.rotate(-0.12); ctx.scale(lerp(2, 1, sk), lerp(2, 1, sk));
        circle(ctx, 0, 0, 92, '#FFD447');
        ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.beginPath(); ctx.arc(0, 0, 92, 0, 7); ctx.stroke();
        ctx.fillStyle = '#0B0B1A'; ctx.font = '400 110px Anton'; ctx.fillText('5×', 4, 6);
      }
    }
    ctx.restore();
  };
  const enter = 1 - E.outCubic(inv(0, 0.12, lt));
  return { flash: enter * 0.6, zblur: exitK * 0.35 + enter * 0.2, zcx: 540, zcy: 900, noCaptions: t < c.hotter - 0.03, overlay: hud };
};

// ---------------------------------------------------------------- 8. flash-over (x-ray)
SC.flashover = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  const pull = E.inOutCubic(inv(0.06, 0.8, lt));
  const orbit = lerp(-0.05, 0.035, E.inOutSine(clamp(lt / D)));
  const cam = { x: 540 + enterK * 900, y: lerp(640, 1010, pull), zoom: lerp(2.4, 1.3, pull), rot: orbit };
  const scanK = inv(0.05, 0.45, lt);
  const scanY = lerp(500, 1260, E.inOutSine(scanK));
  const { st, r } = xrayWorld(cam, lt, t, { dim: scanK, scanY, scanK, heart: 1 + 0.08 * Math.sin(lt * 12) });
  applyCam(cam);
  const flowA = ramp(lt, 0.3, 0.5);
  if (flowA > 0) {
    const paths = worldPaths(st, r);
    flowCurrent(paths, lt, { alpha: flowA });
    bodyArcs(paths, Math.round(t * FPS), 3, 0.7 * flowA);
    for (const k of ['L', 'R']) {
      const a = toWorld(st, r['an' + k]);
      for (let j = 0; j < 3; j++) {
        const ph = (lt * 1.6 + j / 3) % 1;
        ring(a[0], 1196, 30 + ph * 240, (30 + ph * 240) * 0.16, 4, '#7FE9FF', 0.7 * (1 - ph) * flowA);
      }
    }
  }
  pill(260, 1070, 'FLASHOVER', '#7FE9FF', ramp(t, c.inside - 0.5, c.inside - 0.3) * 1.2, 40);
  return { blur: enterK > 0.02 ? [enterK * 190, 0] : null };
};

// ---------------------------------------------------------------- 9. current skating over wet skin
function armBase(t, sootA) {
  armShape(ctx);
  const sg = ctx.createLinearGradient(1180 - 0.742 * 396, 180 - 0.671 * 396, 1180 + 0.742 * 396, 180 + 0.671 * 396);
  sg.addColorStop(0, '#8F5238'); sg.addColorStop(0.18, '#D98F6A'); sg.addColorStop(0.42, '#F7C3A0'); sg.addColorStop(0.62, '#EFB08C');
  sg.addColorStop(0.88, '#C27A58'); sg.addColorStop(1, '#7A4430');
  ctx.fillStyle = sg; ctx.fill();
  ctx.save(); armShape(ctx); ctx.clip();
  ctx.globalAlpha = 0.22; ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = ctx.createPattern(ENV.skinTex, 'repeat'); ctx.fillRect(-600, -600, 2400, 3200);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function sleeve() {
  ctx.save();
  const sx = 1180 + -0.671 * -60, sy = 180 + 0.742 * -60;
  ctx.translate(sx, sy); ctx.rotate(Math.atan2(0.742, -0.671) + Math.PI / 2);
  rrect(ctx, -420, -700, 840, 760, 40);
  const cg = ctx.createLinearGradient(-420, 0, 420, 0);
  cg.addColorStop(0, '#B06C0C'); cg.addColorStop(0.3, '#FFC23A'); cg.addColorStop(0.7, '#FFD466'); cg.addColorStop(1, '#C27A12');
  ctx.fillStyle = cg; ctx.fill();
  rrect(ctx, -430, -10, 860, 70, 30); ctx.fillStyle = '#DE8C16'; ctx.fill();
  ctx.restore();
}
SC.wetskin = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const k = clamp(lt / D);
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  const cam = { x: lerp(700, 420, E.inOutSine(k)) - enterK * 500, y: lerp(640, 1180, E.inOutSine(k)) - enterK * 600, zoom: 1.35, rot: -0.06 };
  screenSpace();
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0B1030'); bg.addColorStop(1, '#1B1446');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (const b of BOKEH) softDot(ctx, (b.x + t * 20) % (W + 100) - 50, b.y + 10 * Math.sin(t + b.ph), b.r, '#7F9BFF', b.a);
  applyCam(cam);
  armBase(t);
  // droplets along the arm, sorted by distance from the sleeve
  const rng = mulberry32(321), drops = [];
  for (let i = 0; i < 46; i++) {
    const u = 0.1 + rng() * 0.85, v = (rng() - 0.5) * 0.8;
    drops.push({ x: 1180 + (-150 - 1180) * u + 0.742 * v * 480, y: 180 + (1650 - 180) * u + 0.671 * v * 480, r: 6 + rng() * 9, u });
  }
  drops.sort((a, b) => a.u - b.u);
  const front = lerp(0.05, 1.05, k * 1.1);
  ctx.save(); armShape(ctx); ctx.clip();
  gctx.save(); armShape(gctx); gctx.clip();
  for (const d of drops) {
    const hit = (front - d.u) * 3;
    if (hit < 0) {
      ellipse(ctx, d.x, d.y, d.r, d.r * 0.9, 'rgba(255,255,255,0.2)');
      ellipse(ctx, d.x - d.r * 0.3, d.y - d.r * 0.35, d.r * 0.35, d.r * 0.28, 'rgba(255,255,255,0.85)');
    } else if (hit < 1) {
      circle(ctx, d.x, d.y, d.r * (1 - hit), 'rgba(220,245,255,0.9)');
      circle(gctx, d.x, d.y, d.r * 3, `rgba(120,210,255,${0.9 * (1 - hit)})`);
      softDot(ctx, d.x + hit * 30, d.y - hit * 90, d.r * (2 + hit * 5), '#F4F6FF', 0.5 * (1 - hit) + 0.1);
    }
  }
  // arcs hopping between neighbouring drops near the front
  const frm = Math.floor(t * FPS);
  const r2 = mulberry32(frm * 3 + 1);
  const near = drops.filter((d) => Math.abs(d.u - front) < 0.14);
  for (let i = 0; i + 1 < near.length; i++) {
    const a = near[i], b = near[i + 1];
    const pts = jagged(r2, a.x, a.y, b.x, b.y, 50, 4);
    poly(ctx, pts, 3, 'rgba(240,252,255,0.95)');
    poly(gctx, pts, 14, 'rgba(100,200,255,0.95)');
  }
  gctx.restore(); ctx.restore();
  sleeve();
  return { blur: enterK > 0.02 ? [-enterK * 120, -enterK * 150] : null };
};

// ---------------------------------------------------------------- 10. steam blows off a shoe
function shoeFlight(t) {
  const c = TLd.cues, t0 = c.shoe;
  const d = t - t0;
  if (d < 0) return { x: 380, y: 1110, rot: 0, gone: false };
  const land = 0.85;
  if (d < land) {
    const k = d / land;
    return { x: 380 - 460 * k, y: 1110 - 2200 * k + 2200 * k * k, rot: -11 * k, gone: true, air: true };
  }
  const b = d - land;
  return { x: -40 - 60 * clamp(b / 0.3), y: 1110 - 60 * Math.sin(Math.PI * clamp(b / 0.25)), rot: -9 - 1.2 * clamp(b / 0.3), gone: true, air: false };
}
SC.shoes = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const sh = shoeFlight(t);
  const trackK = E.inOutCubic(inv(c.shoe, c.shoe + 0.35, t));
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  const cam = { x: lerp(540, 300, trackK) + (sh.air ? (sh.x - 300) * 0.35 * trackK : 0), y: lerp(1010, 880, trackK) + (sh.air ? (sh.y - 1110) * 0.4 : 0) + enterK * -500, zoom: lerp(1.55, 0.98, trackK), rot: 0.02 };
  if (t > c.shoe) { const [a, b] = shake(t, 10 * Math.exp(-(t - c.shoe) * 6), 30, 2); cam.sx = a; cam.sy = b; }
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#141B45'); g.addColorStop(0.55, '#10163A'); g.addColorStop(1, '#070A1C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  drawRain(t, 0.8, 0);
  applyCam(cam);
  // wet ground + puddles
  const gg = ctx.createLinearGradient(0, 1100, 0, 1900);
  gg.addColorStop(0, '#1A2352'); gg.addColorStop(1, '#070A1C');
  ctx.fillStyle = gg; ctx.fillRect(-1500, 1135, 4200, 1500);
  for (const [px, pw] of [[250, 260], [760, 200], [-300, 300]]) {
    ellipse(ctx, px, 1170, pw, 26, 'rgba(120,150,255,0.18)');
    ellipse(ctx, px - pw * 0.3, 1165, pw * 0.3, 5, 'rgba(220,230,255,0.25)');
  }
  for (const b of ENV.blades) {
    if (b.x < -800 || b.x > 1800) continue;
    const y = 1140, sway = b.lean + 0.2 * vnoise(t * 1.3 + b.ph, 3);
    ctx.strokeStyle = '#223068'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.x, y); ctx.quadraticCurveTo(b.x + sway * b.h, y - b.h * 1.2, b.x + sway * b.h * 2, y - b.h * 2.2); ctx.stroke();
  }
  // legs from the knee down (zap stance)
  const trem = t > c.steam ? shake(t, 3, 50, 4) : [0, 0];
  for (const [kx, ax, side] of [[420, 380, -1], [660, 700, 1]]) {
    const x0 = kx + trem[0], x1 = ax + trem[0];
    const lg = ctx.createLinearGradient(x0 - 70, 0, x0 + 70, 0);
    lg.addColorStop(0, '#1A2150'); lg.addColorStop(0.35, '#3A4690'); lg.addColorStop(0.6, '#2F3A78'); lg.addColorStop(1, '#161C44');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(x0 - 70, 200); ctx.lineTo(x0 + 70, 200); ctx.quadraticCurveTo(x1 + 70, 700, x1 + 62, 1060);
    ctx.lineTo(x1 - 62, 1060); ctx.quadraticCurveTo(x1 - 70, 700, x0 - 70, 200); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x0 - 10, 220); ctx.quadraticCurveTo(x1 - 14, 640, x1 - 8, 1030); ctx.stroke();
    ctx.strokeStyle = 'rgba(10,14,40,0.5)'; ctx.lineWidth = 3;
    for (const yy of [560, 600]) { ctx.beginPath(); ctx.moveTo(lerp(x0, x1, yy / 1060) - 50, yy); ctx.quadraticCurveTo(lerp(x0, x1, yy / 1060), yy + 18, lerp(x0, x1, yy / 1060) + 50, yy - 4); ctx.stroke(); }
    rrect(ctx, ax - 64 + trem[0], 1024, 128, 44, 18); ctx.fillStyle = '#26306A'; ctx.fill();
  }
  // right shoe stays, left shoe flies
  ctx.save(); ctx.translate(700 + trem[0], 1090); ctx.scale(2.7, 2.7); drawShoe(ctx, [0, 0], 1, PAL, 0, false); ctx.restore();
  if (!sh.gone) {
    ctx.save(); ctx.translate(380 + trem[0], 1090); ctx.scale(2.7, 2.7); drawShoe(ctx, [0, 0], -1, PAL, 0, false); ctx.restore();
  } else {
    ellipse(ctx, 380, 1105, 70, 40, PAL.sock); ellipse(ctx, 360, 1095, 40, 20, '#FFFFFF');
    ctx.save(); ctx.translate(sh.x, sh.y); ctx.rotate(sh.rot); ctx.scale(2.7, 2.7); drawShoe(ctx, [0, 0], -1, PAL, 0, false); ctx.restore();
    if (sh.air) smoke(55, sh.x + 40, sh.y + 20, c.shoe, t, { rate: 40, rise: 60, alpha: 0.35, size: 30, life: 0.5, wind: 60 });
  }
  // steam bursting out of shoes and cuffs
  if (t > c.steam) {
    for (const [x, sd] of [[380, 81], [700, 82], [360, 83], [720, 84]]) {
      smoke(sd, x + (sd % 2 ? -20 : 20), 1020, c.steam, t, { rate: 26, rise: 520, alpha: 0.5, size: 42, life: 0.9, wind: sd % 2 ? -80 : 80, spread: 60, col: '#E8ECFF' });
    }
    const blast = Math.exp(-(t - c.shoe) * 8) * (t > c.shoe ? 1 : 0);
    if (blast > 0.01) softDot(gctx, 380, 1060, 300, '#DDE6FF', blast);
  }
  if (t > c.shoe) sparks(91, 380, 1080, c.shoe, t, 26, { speed: 700, life: 0.5, dir: -2.2, spread: 0.8, cols: ['#FFFFFF', '#CFE8FF'] });
  drawRain(t, 0.8, 1);
  return { blur: enterK > 0.02 ? [0, enterK * 150] : (t > c.shoe && t < c.shoe + 0.2 ? [-30, -60] : null) };
};

// ---------------------------------------------------------------- 11. nervous system map
function nervePaths(r) {
  const out = [];
  const [hx, hy] = r.head;
  const bot = r.U(0, -2);
  out.push({ pts: [[hx, hy + 34], r.U(0, -200), r.U(0, -140), r.U(0, -70), bot], w: 8, d: 0 });
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    out.push({ pts: [r.U(0, -168), r.U(s * 40, -160), r['sh' + k], r['el' + k], r['wr' + k]], w: 4.5, d: 1 });
    const d = r['armDir' + k], wr = r['wr' + k];
    for (let i = -2; i <= 2; i++) {
      const ang = Math.atan2(d[1], d[0]) + i * 0.35;
      out.push({ pts: [[wr[0] + d[0] * 8, wr[1] + d[1] * 8], [wr[0] + Math.cos(ang) * 38, wr[1] + Math.sin(ang) * 38]], w: 2, d: 3 });
    }
    out.push({ pts: [bot, r['hip' + k], r['kn' + k], r['an' + k], [r['an' + k][0] + s * 44, r['an' + k][1] + 20]], w: 5, d: 1 });
    for (let i = 0; i < 5; i++) {
      const y = -150 + i * 20;
      out.push({ pts: [r.U(0, y), r.U(s * 34, y - 6), r.U(s * 66, y + 8)], w: 2, d: 2 });
    }
  }
  // fine twigs along the limb nerves
  const rng = mulberry32(NERVE_SEED);
  const twigs = [];
  for (const n of out) {
    if (n.d !== 1) continue;
    const acc = polyLen(n.pts), L = acc[acc.length - 1];
    for (let sPos = 40, i = 0; sPos < L - 20; sPos += 34 + rng() * 20, i++) {
      const [x, y, ang] = polyAt(n.pts, acc, sPos);
      const a2 = ang + (i % 2 ? 1 : -1) * (0.7 + rng() * 0.4), l = 22 + rng() * 22;
      twigs.push({ pts: [[x, y], [x + Math.cos(a2) * l, y + Math.sin(a2) * l], [x + Math.cos(a2 + 0.4) * l * 1.6, y + Math.sin(a2 + 0.4) * l * 1.6]], w: 1.6, d: 2 });
    }
  }
  return out.concat(twigs);
}
function drawBrain(c, g, hx, hy, sc, glow, stem) {
  // front view: two hemispheres, gyri, brainstem dropping into the neck
  c.save(); c.translate(hx, hy); c.scale(sc, sc);
  for (const s of [-1, 1]) {
    c.beginPath(); c.ellipse(s * 22, -16, 32, 40, s * 0.15, 0, 7);
    c.fillStyle = `rgba(255,170,205,${0.55})`; c.fill();
    c.lineWidth = 2.5; c.strokeStyle = `rgba(255,210,150,${0.6 + 0.4 * glow})`; c.stroke();
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      const y = -44 + i * 15;
      c.moveTo(s * 6, y); c.bezierCurveTo(s * 18, y - 8, s * 30, y + 10, s * 46, y - 2);
      c.lineWidth = 2; c.strokeStyle = 'rgba(200,110,150,0.7)'; c.stroke();
    }
  }
  rrect(c, -8, 14, 16, 42, 7);
  c.fillStyle = stem > 0.5 ? `rgba(127,233,255,${0.5 + 0.5 * stem})` : 'rgba(90,90,110,0.9)'; c.fill();
  c.restore();
  if (glow > 0) softDot(g, hx, hy - 16 * sc, 90 * sc, '#FFD08A', 0.8 * glow);
  if (stem > 0.5) softDot(g, hx, hy + 35 * sc, 40 * sc, '#7FE9FF', 0.9 * stem);
}
function drawNerves(paths, t, t0, o = {}) {
  const on = o.on === undefined ? 1 : o.on;
  for (const n of paths) {
    const col = o.dead ? 'rgba(120,120,140,0.6)' : `rgba(255,200,87,${0.55 + 0.35 * on})`;
    poly(ctx, n.pts, n.w * (o.s || 1), col);
    if (!o.dead) poly(gctx, n.pts, n.w * 3 * (o.s || 1), `rgba(255,190,80,${0.35 * on})`);
  }
  if (t < t0) return;
  // pulses race outward from the spinal cord
  paths.forEach((n, i) => {
    if (n.d > 2) return;
    const acc = polyLen(n.pts), L = acc[acc.length - 1];
    const cnt = Math.max(1, Math.floor(L / 90));
    for (let j = 0; j < cnt; j++) {
      const sPos = ((t - t0) * (n.d === 0 ? 900 : 700) + (j / cnt) * L + hash(i * 7 + j) * 30) % L;
      const pts = [];
      for (let q = 0; q <= 3; q++) { const p = polyAt(n.pts, acc, sPos - q * 14); pts.push([p[0], p[1]]); }
      poly(ctx, pts, n.w * 1.3 + 1.5, 'rgba(240,252,255,0.95)');
      poly(gctx, pts, n.w * 4 + 8, 'rgba(100,210,255,0.95)');
    }
  });
}
function bodyXray(cam, t, o = {}) {
  drawStorm(cam, { flash: 0.08, t: 6 + t * 0.2 });
  drawHill(cam, { flash: 0.08, crestY: 1180, t: 1 });
  screenSpace(); ctx.fillStyle = 'rgba(2,4,16,0.62)'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  const st = { x: CH.x, y: CH.y, s: CH.s, pose: o.pose || POSES.zap, face: FACES.shock, frizz: 1, soot: 0.3, seed: 3 };
  const r = drawCharacter(ctx, st, 0.8, XPAL);
  if (o.bones) drawBones(ctx, st, r, t, 1, o.bones);
  return { st, r };
}
SC.nerves = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const k = E.inOutCubic(inv(0.1, 1.3, lt));
  const cam = { x: 540, y: lerp(640, 960, k), zoom: lerp(2.6, 1.22, k), rot: lerp(0.05, -0.02, clamp(lt / D)) };
  const { st, r } = bodyXray(cam, t, { bones: 0.25 });
  applyCam(cam);
  const paths = nervePaths(r).map((n) => ({ pts: n.pts.map((p) => toWorld(st, p)), w: n.w * st.s, d: n.d }));
  const [hx, hy] = toWorld(st, r.head);
  drawBrain(ctx, gctx, hx, hy, st.s, 0.6 + 0.4 * Math.abs(vnoise(t * 8, 2)), 1);
  drawNerves(paths, t, c.races);
  // the current entering through the head
  if (t < c.races + 0.2) {
    const fr = Math.floor(t * FPS);
    const rng = mulberry32(fr * 5);
    const pts = jagged(rng, hx + 20, hy - 400, hx, hy - 60, 60, 5);
    poly(ctx, pts, 4, 'rgba(240,250,255,0.9)'); poly(gctx, pts, 20, 'rgba(110,190,255,0.9)');
  }
  pill(280, 330, 'NERVES', '#FFC857', ramp(t, c.races + 0.3, c.races + 0.5) * 1.1, 40);
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  return { zblur: enterK * 0.3, zcx: 540, zcy: 700 };
};

// ---------------------------------------------------------------- 12. inside one neuron: tiny signals vs the surge
function makeNeuron() {
  const rng = mulberry32(11);
  const soma = [250, 520];
  const dend = [];
  function branch(x, y, a, len, w, depth) {
    const pts = [[x, y]];
    let px = x, py = y, aa = a;
    const n = Math.floor(len / 18);
    for (let i = 0; i < n; i++) {
      aa += (rng() - 0.5) * 0.35; px += Math.cos(aa) * 18; py += Math.sin(aa) * 18; pts.push([px, py]);
      if (depth < 2 && i === Math.floor(n * 0.55)) branch(px, py, aa + (rng() < 0.5 ? -0.6 : 0.6), len * 0.55, w * 0.6, depth + 1);
    }
    dend.push({ pts, w });
  }
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * 0.62 + (i / 6) * Math.PI * 1.25 + (rng() - 0.5) * 0.2;
    branch(soma[0] + Math.cos(a) * 60, soma[1] + Math.sin(a) * 60, a, 170 + rng() * 120, 9, 0);
  }
  const axon = [];
  for (let i = 0; i <= 80; i++) {
    const u = i / 80;
    const x = (1 - u) ** 3 * 320 + 3 * (1 - u) ** 2 * u * 620 + 3 * (1 - u) * u * u * 700 + u ** 3 * 930;
    const y = (1 - u) ** 3 * 560 + 3 * (1 - u) ** 2 * u * 560 + 3 * (1 - u) * u * u * 920 + u ** 3 * 960;
    axon.push([x, y]);
  }
  const acc = polyLen(axon);
  const term = [];
  const end = axon[axon.length - 1];
  for (let i = 0; i < 4; i++) {
    const a = -0.5 + i * 0.4;
    term.push(jagged(rng, end[0], end[1], end[0] + Math.cos(a) * 110, end[1] + Math.sin(a) * 110, 20, 3));
  }
  return { soma, dend, axon, acc, term };
}
SC.neuron = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start, N = NEURON;
  const surged = t >= c.surge;
  const sk = surged ? Math.exp(-(t - c.surge) * 3) : 0;
  const [shx, shy] = surged ? shake(t, 26 * sk + 3, 30, 6) : [0, 0];
  const cam = { x: lerp(560, 600, clamp(lt / D)), y: lerp(700, 680, clamp(lt / D)), zoom: lerp(1.3, 1.45, E.inOutSine(clamp(lt / D))) * (1 + 0.06 * sk), rot: lerp(-0.03, 0.02, clamp(lt / D)), sx: shx, sy: shy };
  screenSpace();
  const g = ctx.createRadialGradient(540, 760, 60, 540, 900, 1300);
  g.addColorStop(0, '#1C1340'); g.addColorStop(1, '#05040F');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const b of BOKEH) softDot(ctx, (b.x * 1.3 + t * 12) % (W + 100) - 50, b.y, b.r * 1.4, '#9A7BFF', b.a * 0.8);
  applyCam(cam);
  const front = surged ? (t - c.surge) * 2400 : -1;
  const hot = (sPos) => front > sPos;
  // dendrites + soma
  for (const d of N.dend) {
    poly(ctx, d.pts, d.w, surged ? 'rgba(235,245,255,0.95)' : '#B596F0');
    if (surged) poly(gctx, d.pts, d.w * 3, 'rgba(120,210,255,0.9)');
  }
  const sg = ctx.createRadialGradient(N.soma[0] - 20, N.soma[1] - 20, 5, N.soma[0], N.soma[1], 80);
  sg.addColorStop(0, surged ? '#FFFFFF' : '#EBDDFF'); sg.addColorStop(1, surged ? '#9FDFFF' : '#8660D6');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(N.soma[0], N.soma[1], 76, 0, 7); ctx.fill();
  circle(ctx, N.soma[0] + 8, N.soma[1] + 4, 26, surged ? '#E8F8FF' : '#5B3FA8');
  // axon + myelin
  poly(ctx, N.axon, 12, '#A889EE');
  const L = N.acc[N.acc.length - 1];
  for (let sPos = 70; sPos < L - 40; sPos += 84) {
    const a = polyAt(N.axon, N.acc, sPos), b = polyAt(N.axon, N.acc, sPos + 66);
    const h = hot(sPos);
    line(ctx, a[0], a[1], b[0], b[1], 30, h ? '#FFFFFF' : '#F1E6FF');
    line(ctx, a[0], a[1] + 4, b[0], b[1] + 4, 12, h ? 'rgba(160,230,255,0.9)' : 'rgba(170,140,230,0.6)');
    if (h) line(gctx, a[0], a[1], b[0], b[1], 60, 'rgba(110,210,255,0.9)');
  }
  for (const tp of N.term) { poly(ctx, tp, 5, '#B596F0'); const e = tp[tp.length - 1]; circle(ctx, e[0], e[1], 12, surged ? '#FFFFFF' : '#D8C4FF'); }
  // tiny signals hopping node to node (saltatory conduction)
  if (!surged || sk > 0.7) {
    for (let i = 0; i < 4; i++) {
      const t0 = c.tiny - 0.2 + i * 0.42;
      if (t < t0) continue;
      const raw = (t - t0) * 620;
      const hop = Math.floor(raw / 84) * 84 + 84 * clamp(((raw % 84) / 84) * 4);
      if (hop > L) continue;
      const p = polyAt(N.axon, N.acc, hop + 70);
      circle(ctx, p[0], p[1], 9, '#FFFFFF');
      softDot(gctx, p[0], p[1], 50, '#7FE9FF', surged ? 0.3 : 1);
    }
  }
  // the surge: arcs crawling over the whole cell
  if (surged) {
    const fr = Math.floor(t * FPS), rng = mulberry32(fr * 9);
    const pool = [N.axon, ...N.dend.map((d) => d.pts)];
    for (let i = 0; i < 9; i++) {
      const P = pool[Math.floor(rng() * pool.length)], acc = polyLen(P), LL = acc[acc.length - 1];
      const s0 = rng() * LL, a = polyAt(P, acc, s0), b = polyAt(P, acc, Math.min(LL, s0 + 80 + rng() * 120));
      const pts = jagged(rng, a[0], a[1], b[0], b[1], 60, 4);
      poly(ctx, pts, 3, 'rgba(255,255,255,0.95)'); poly(gctx, pts, 16, 'rgba(120,210,255,0.95)');
    }
    softDot(gctx, lerp(N.soma[0], 930, clamp(front / L)), lerp(N.soma[1], 960, clamp(front / L)), 260, '#DFF6FF', 0.9 * sk);
  }
  // oscilloscope
  ctx.save(); screenSpace();
  const px = 80, py = 1010, pw = 920, ph = 170;
  rrect(ctx, px, py, pw, ph, 18); ctx.fillStyle = 'rgba(6,14,20,0.9)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = surged ? '#FF5A6E' : 'rgba(80,255,170,0.5)'; ctx.stroke();
  ctx.strokeStyle = 'rgba(80,255,170,0.12)'; ctx.lineWidth = 1.5;
  for (let x = px + 46; x < px + pw; x += 46) { ctx.beginPath(); ctx.moveTo(x, py + 8); ctx.lineTo(x, py + ph - 8); ctx.stroke(); }
  const probe = 360;
  const trace = [];
  for (let x = px + 12; x <= px + pw - 12; x += 4) {
    const tm = t - (px + pw - 12 - x) / (pw - 24) * 1.4;
    let v = 0;
    for (let i = 0; i < 4; i++) {
      const pass = c.tiny - 0.2 + i * 0.42 + probe / 620;
      const d = tm - pass;
      if (d > 0 && d < 0.05) v += Math.sin((d / 0.05) * Math.PI) * 0.8 - (d > 0.03 ? 0.2 : 0);
    }
    if (tm >= c.surge) v = clamp(1.2 * Math.exp(-(tm - c.surge) * 0.4) * (0.8 + 0.2 * vnoise(tm * 90, 3)), -1, 1) * (vnoise(tm * 40, 5) > -0.2 ? 1 : -1);
    trace.push([x, py + ph / 2 - clamp(v, -1, 1) * (ph / 2 - 16)]);
  }
  const tc = surged ? '#FF7A88' : '#50FFAA';
  ctx.shadowColor = tc; ctx.shadowBlur = 14; poly(ctx, trace, 3.5, tc); ctx.shadowBlur = 0;
  ctx.font = '800 28px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = surged ? '#FF7A88' : '#9FFFD0';
  ctx.fillText(surged ? 'OVERLOAD' : 'NERVE SIGNAL', px + 20, py + 14);
  ctx.restore();
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  return { flash: surged ? 0.6 * Math.exp(-(t - c.surge) * 10) : 0, glitch: surged ? 0.9 * sk : 0, zblur: enterK * 0.35, zcx: 250, zcy: 520 };
};

// ---------------------------------------------------------------- 13. legs go limp (temporary paralysis)
function clockIcon(x, y, r, t, k) {
  if (k <= 0) return;
  ctx.save(); screenSpace(); ctx.translate(x, y); const s = E.outBack(clamp(k), 2); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 8, 'rgba(8,12,34,0.9)');
  ctx.lineWidth = 6; ctx.strokeStyle = '#8FB8FF'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(ctx, Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92, 3, '#8FB8FF'); }
  const sp = t * 9;
  line(ctx, 0, 0, Math.cos(sp) * r * 0.75, Math.sin(sp) * r * 0.75, 5, '#FFFFFF');
  line(ctx, 0, 0, Math.cos(sp / 12) * r * 0.5, Math.sin(sp / 12) * r * 0.5, 7, '#FFFFFF');
  circle(ctx, 0, 0, 6, '#FFFFFF');
  ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8FB8FF';
  ctx.fillText('HOURS', 0, r + 42);
  ctx.restore();
}
SC.limp = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const fall = E.outCubic(inv(0.05, 0.55, lt));
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  const cam = { x: 540, y: lerp(880, 930, fall) - enterK * 400, zoom: lerp(1.25, 1.4, E.inOutSine(clamp(lt / D))), rot: 0.015 };
  drawStorm(cam, { flash: 0.06, t: 6 + t });
  drawRain(t, 0.8, 0);
  drawHill(cam, { flash: 0.06, crestY: 1180, t });
  const pose = lerpPose(POSES.zap, POSES.sit, fall);
  const face = lerpFace(FACES.shock, FACES.dazed, fall);
  const cold = ramp(t, c.limp - 0.1, c.limp + 0.3);
  const st = { x: 540, y: lerp(1180, 1206, fall), s: CH.s, pose, face, frizz: 1, soot: 0.6, seed: 3, shoeMissingL: true };
  const r = charLayer(cam, st, t, {
    ambient: 0.14,
    post: (lc, rr) => {
      if (cold <= 0) return;
      lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s); lc.globalCompositeOperation = 'source-atop';
      for (const k of ['L', 'R']) {
        line(lc, rr['hip' + k][0], rr['hip' + k][1], rr['kn' + k][0], rr['kn' + k][1], 60, `rgba(120,170,255,${0.45 * cold})`);
        line(lc, rr['kn' + k][0], rr['kn' + k][1], rr['an' + k][0], rr['an' + k][1], 56, `rgba(120,170,255,${0.45 * cold})`);
      }
      lc.restore();
    },
  });
  applyCam(cam);
  // leg nerves flicker, then go dark
  const nerves = nervePaths(r).filter((n) => n.d === 1 && n.pts[0][1] > r.P[1] - 20).map((n) => ({ pts: n.pts.map((p) => toWorld(st, p)), w: n.w * st.s, d: n.d }));
  const flick = t < c.limp ? 1 : (Math.floor(t * 20) % 3 === 0 && t < c.limp + 0.35 ? 0.2 : 1 - cold);
  if (fall > 0.6) drawNerves(nerves, t, 1e9, { on: flick, dead: cold > 0.9 });
  for (const k of ['L', 'R']) { const kn = toWorld(st, r['kn' + k]); softDot(gctx, kn[0], kn[1], 110, '#6FA8FF', 0.5 * cold); }
  clockIcon(810, 520, 100, t, ramp(t, c.hours - 0.05, c.hours + 0.15) * 1.1);
  drawRain(t, 0.8, 1);
  return { blur: enterK > 0.02 ? [0, -enterK * 130] : null };
};

// ---------------------------------------------------------------- 14. the brain's breathing center
SC.brain = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const st0 = { x: CH.x, y: 1206, s: CH.s };
  const pose = POSES.sit, r0 = rig(pose);
  const head = toWorld(st0, r0.head);
  const k = E.inOutCubic(inv(0, 0.5, lt));
  const cam = { x: head[0], y: lerp(head[1] + 250, head[1] + 60, k), zoom: lerp(1.6, 3.3, k) * lerp(1, 1.05, clamp(lt / D)), rot: lerp(0.03, -0.02, clamp(lt / D)) };
  drawStorm(cam, { flash: 0.06, t: 6 + t * 0.3 });
  drawHill(cam, { flash: 0.06, crestY: 1180, t: 1 });
  screenSpace(); ctx.fillStyle = 'rgba(2,4,16,0.55)'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  const st = { x: st0.x, y: st0.y, s: st0.s, pose, face: FACES.dazed, frizz: 1, soot: 0.5, seed: 3 };
  const r = drawCharacter(ctx, st, 0.8, XPAL);
  const off = t >= c.shutdown;
  const fl = off ? (t < c.shutdown + 0.3 ? (Math.floor(t * 24) % 2 ? 1 : 0) : 0) : 1;
  drawBrain(ctx, gctx, head[0], head[1], st.s, 0.4, fl);
  // spinal cord continuing down the neck
  const neck = toWorld(st, r.U(0, -150));
  line(ctx, head[0], head[1] + 56 * st.s, neck[0], neck[1], 10, fl ? 'rgba(127,233,255,0.8)' : 'rgba(110,110,130,0.9)');
  const lk = ramp(t, c.brainstem - 0.1, c.brainstem + 0.15);
  if (lk > 0) {
    const m = new DOMMatrix().translate(W / 2, H / 2).rotate((cam.rot || 0) * 57.3).scale(cam.zoom).translate(-cam.x, -cam.y);
    const pt = m.transformPoint(new DOMPoint(head[0] + 8, head[1] + 38 * st.s));
    ctx.save(); screenSpace();
    line(ctx, 780, 1060, lerp(780, pt.x, E.outCubic(lk)), lerp(1060, pt.y, E.outCubic(lk)), 4, off ? 'rgba(255,90,110,0.9)' : 'rgba(127,233,255,0.9)');
    circle(ctx, pt.x, pt.y, 9 * lk, off ? '#FF5A6E' : '#7FE9FF');
    ctx.restore();
    pill(700, 1080, 'BREATHING CENTER', off ? '#FF5A6E' : '#7FE9FF', lk * 1.1, 36);
  }
  // breathing monitor
  ctx.save(); screenSpace();
  const bx = 640, by = 260, bw = 360, bh = 150;
  rrect(ctx, bx, by, bw, bh, 18); ctx.fillStyle = 'rgba(6,12,30,0.88)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = off ? '#FF5A6E' : 'rgba(127,233,255,0.6)'; ctx.stroke();
  const tr = [];
  for (let x = 0; x <= bw - 40; x += 4) {
    const tm = t - (bw - 40 - x) / (bw - 40) * 2.5;
    const amp = tm < c.shutdown ? 1 : Math.max(0, 1 - (tm - c.shutdown) * 5);
    tr.push([bx + 20 + x, by + 90 - Math.sin(tm * 4.2) * 32 * amp]);
  }
  poly(ctx, tr, 4, off ? '#FF7A88' : '#7FE9FF');
  ctx.font = '800 26px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = off ? '#FF7A88' : '#BFF3FF';
  ctx.fillText(off ? 'BREATHING: STOPPED' : 'BREATHING', bx + 20, by + 14);
  ctx.restore();
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  return { zblur: enterK * 0.3, zcx: 540, zcy: 700, flash: off ? 0.25 * Math.exp(-(t - c.shutdown) * 10) : 0 };
};

// ---------------------------------------------------------------- 15/16. the heart: rhythm, jolt, flatline, restart, lungs
const HC = { x: 540, y: 700 };
const BEAT = 0.75;
function heartState(t) {
  const c = TLd.cues;
  if (t < c.defib) return { mode: 'beat', t0: c.beat_ok - 0.3, period: BEAT };
  if (t < c.defib + 0.18) return { mode: 'jolt' };
  if (t < c.stop) return { mode: 'fade', k: (t - c.defib - 0.18) / (c.stop - c.defib - 0.18) };
  if (t < c.restart) return { mode: 'stop' };
  return { mode: 'beat', t0: c.restart, period: 0.82, back: clamp((t - c.restart) / 0.5) };
}
function ecgAt(tm) {
  const s = heartState(tm);
  if (s.mode === 'jolt') return 2.5;
  if (s.mode === 'stop') return 0;
  if (s.mode === 'fade') return 0.5 * (1 - s.k) * Math.sin(tm * 47) * Math.sin(tm * 13) * (1 - s.k);
  const ph = ((tm - s.t0) % s.period + s.period) % s.period / s.period;
  const bump = (c0, w, a) => a * Math.exp(-Math.pow((ph - c0) / w, 2));
  return bump(0.1, 0.03, 0.15) - bump(0.27, 0.008, 0.15) + bump(0.3, 0.012, 1.0) - bump(0.33, 0.01, 0.3) + bump(0.55, 0.05, 0.28);
}
function conduction() {
  // SA node → atria; AV node → His bundle → branches → Purkinje (heart-local coords)
  return {
    sa: [-150, -92], av: [-30, -8],
    his: [[-30, -8], [-10, 40]],
    left: [[-10, 40], [60, 110], [90, 190], [70, 250]],
    right: [[-10, 40], [-70, 110], [-100, 170], [-60, 225]],
    purk: [[[90, 190], [140, 150]], [[70, 250], [120, 250]], [[-100, 170], [-150, 130]], [[-60, 225], [-120, 220]], [[60, 110], [130, 80]], [[-70, 110], [-140, 70]]],
  };
}
function heartShape(c, s) {
  c.beginPath();
  c.moveTo(-175, -40);
  c.bezierCurveTo(-255, 90, -120, 250, 60, 320);
  c.bezierCurveTo(200, 250, 285, 110, 222, -30);
  c.bezierCurveTo(175, -110, 60, -118, 0, -88);
  c.bezierCurveTo(-60, -118, -155, -108, -175, -40);
  c.closePath();
}
function hexMix(a, b, k) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(lerp((A >> sh) & 255, (B >> sh) & 255, clamp(k)));
  return '#' + [16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, '0')).join('');
}
function drawLungs(c, g, k, breath, blue) {
  if (k <= 0) return;
  for (const s of [-1, 1]) {
    c.save(); c.translate(HC.x + s * 300, HC.y + 20); c.scale(s * (1 + 0.04 * breath), 1 + 0.07 * breath);
    c.beginPath(); c.moveTo(40, -300); c.bezierCurveTo(-120, -260, -170, 120, -130, 300); c.bezierCurveTo(-40, 330, 60, 300, 90, 220);
    c.bezierCurveTo(60, 60, 110, -120, 40, -300); c.closePath();
    c.fillStyle = blue > 0.5 ? `rgba(140,160,255,${0.35 * k})` : `rgba(255,140,165,${0.38 * k})`; c.fill();
    c.lineWidth = 4; c.strokeStyle = blue > 0.5 ? `rgba(170,190,255,${0.7 * k})` : `rgba(255,180,195,${0.7 * k})`; c.stroke();
    for (let i = 0; i < 5; i++) {
      c.beginPath(); c.moveTo(60, -230 + i * 20); c.quadraticCurveTo(-20, -120 + i * 60, -80 + i * 10, -40 + i * 70);
      c.lineWidth = 3; c.strokeStyle = `rgba(255,220,230,${0.35 * k})`; c.stroke();
    }
    c.restore();
  }
  line(c, HC.x, HC.y - 520, HC.x, HC.y - 300, 34, `rgba(255,190,205,${0.4 * k})`);
}
function heartWorld(cam, t, o = {}) {
  const c = TLd.cues, hs = heartState(t);
  screenSpace();
  const bg = ctx.createRadialGradient(540, 700, 40, 540, 800, 1300);
  bg.addColorStop(0, hs.mode === 'stop' ? '#1A1020' : '#2A0E22'); bg.addColorStop(1, '#05030A');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (const b of BOKEH) softDot(ctx, (b.x + t * 10) % (W + 100) - 50, b.y, b.r * 1.3, '#FF6A8A', b.a * 0.5);
  applyCam(cam);
  drawLungs(ctx, gctx, o.lungs || 0.6, o.breath || 0, o.blue || 0);
  // beat phase → squeeze
  let ph = 0, squeeze = 1, alive = 1, white = 0;
  if (hs.mode === 'beat') {
    ph = ((t - hs.t0) % hs.period + hs.period) % hs.period / hs.period;
    squeeze = 1 - 0.07 * Math.sin(Math.PI * clamp((ph - 0.3) / 0.3));
    alive = hs.back === undefined ? 1 : hs.back;
  } else if (hs.mode === 'jolt') { white = 1; squeeze = 1.06; }
  else if (hs.mode === 'stop') {
    alive = 0; squeeze = 1 + 0.004 * Math.sin(t * 2.1);
  }
  else if (hs.mode === 'fade') { alive = 1 - hs.k; squeeze = 1 + 0.02 * (1 - hs.k) * Math.sin(t * 60); white = 0.5 * Math.exp(-hs.k * 6); }
  else { alive = 0; }
  const col1 = hexMix('#6E6A7A', '#E0455E', alive), col2 = hexMix('#3B3848', '#8C1C34', alive);
  ctx.save(); ctx.translate(HC.x, HC.y); ctx.scale(squeeze * 0.9, squeeze * 0.9); ctx.rotate(-0.12);
  // atria + great vessels (behind the ventricles)
  ellipse(ctx, -168, -40, 72, 84, hexMix('#4E4A5C', '#B8364E', alive));
  ellipse(ctx, 176, -58, 58, 48, hexMix('#4E4A5C', '#B8364E', alive));
  line(ctx, -172, -60, -172, -250, 52, hexMix('#4A4A60', '#5B6FC0', alive));
  ctx.lineCap = 'round'; ctx.lineWidth = 62; ctx.strokeStyle = hexMix('#5A5060', '#C9364F', alive);
  ctx.beginPath(); ctx.moveTo(22, -70); ctx.bezierCurveTo(8, -250, 190, -262, 180, -130); ctx.stroke();
  ctx.lineWidth = 20; ctx.strokeStyle = hexMix('#7A7080', '#F0617A', alive);
  ctx.beginPath(); ctx.moveTo(10, -120); ctx.bezierCurveTo(5, -230, 160, -240, 168, -150); ctx.stroke();
  for (const [x, y] of [[48, -236], [96, -248], [140, -236]]) line(ctx, x, y, x + 6, y - 70, 20, hexMix('#5A5060', '#C9364F', alive));
  line(ctx, -40, -60, -85, -175, 56, hexMix('#4A4A60', '#6F86D8', alive));
  heartShape(ctx);
  const hg = ctx.createRadialGradient(-60, -30, 20, 20, 60, 330);
  hg.addColorStop(0, white > 0 ? hexMix(col1, '#FFFFFF', white) : hexMix(col1, '#FFB0B8', 0.3 * alive)); hg.addColorStop(0.6, white > 0 ? hexMix(col1, '#E8F6FF', white) : col1); hg.addColorStop(1, col2);
  ctx.fillStyle = hg; ctx.fill();
  // coronary vessels
  ctx.lineWidth = 6; ctx.strokeStyle = hexMix('#4A4050', '#FF7A7A', alive);
  ctx.beginPath(); ctx.moveTo(-20, -70); ctx.bezierCurveTo(-10, 40, 30, 150, 60, 240); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-160, -40); ctx.bezierCurveTo(-120, 60, -60, 140, -10, 200); ctx.stroke();
  // conduction system
  const K = conduction();
  const lines = [K.his, K.left, K.right, ...K.purk];
  for (const L of lines) poly(ctx, L, 5, alive > 0.2 ? 'rgba(255,215,120,0.75)' : 'rgba(150,150,160,0.6)');
  if (hs.mode === 'beat') {
    const saK = Math.exp(-Math.pow(ph / 0.05, 2));
    circle(ctx, K.sa[0], K.sa[1], 14 + 8 * saK, '#FFE08A');
    circle(gctx, K.sa[0], K.sa[1], 50 + 40 * saK, `rgba(255,220,120,${0.9 * alive})`);
    const aw = clamp((ph - 0.02) / 0.16);
    if (aw > 0 && aw < 1) { ring(K.sa[0], K.sa[1], 30 + 220 * aw, 30 + 180 * aw, 10, '#FFE08A', 0.7 * (1 - aw) * alive); }
    const avK = Math.exp(-Math.pow((ph - 0.22) / 0.04, 2));
    circle(ctx, K.av[0], K.av[1], 10 + 6 * avK, '#FFE08A');
    const vk = clamp((ph - 0.24) / 0.16);
    if (vk > 0 && vk < 1) {
      for (const L of lines) {
        const acc = polyLen(L), LL = acc[acc.length - 1];
        const p = polyAt(L, acc, LL * vk);
        circle(ctx, p[0], p[1], 9, '#FFFFFF'); circle(gctx, p[0], p[1], 40, `rgba(255,230,140,${alive})`);
      }
    }
  }
  if (white > 0) { heartShape(gctx); gctx.fillStyle = `rgba(200,235,255,${white})`; gctx.fill(); }
  if (hs.mode === 'stop' || hs.mode === 'fade') {
    // residual static crawling over the stilled heart, dying away
    const since = t - c.defib, fr = Math.floor(t * FPS), rng = mulberry32(fr * 17);
    const n = Math.max(0, Math.round(5 * Math.exp(-since * 0.6)));
    for (let i = 0; i < n; i++) {
      const a0 = rng() * 6.28, r0 = 150 + rng() * 90;
      const pts = jagged(rng, Math.cos(a0) * r0, 60 + Math.sin(a0) * r0 * 1.1, Math.cos(a0 + 0.5) * r0, 60 + Math.sin(a0 + 0.5) * r0 * 1.1, 30, 3);
      poly(ctx, pts, 2, 'rgba(220,240,255,0.7)'); poly(gctx, pts, 10, 'rgba(120,190,255,0.7)');
    }
    // the pacemaker tries: two faint flickers before it catches
    for (const ft of [c.restart - 1.1, c.restart - 0.5]) {
      const fk = Math.exp(-Math.pow((t - ft) / 0.05, 2));
      if (fk > 0.02) { circle(ctx, -135, -83, 10 + 6 * fk, `rgba(255,224,138,${fk})`); circle(gctx, -135, -83, 40 * fk + 10, `rgba(255,220,120,${0.8 * fk})`); }
    }
  }
  ctx.restore();
  // ECG strip
  ctx.save(); screenSpace();
  const px = 70, py = 200, pw = 940, ph2 = 160;
  rrect(ctx, px, py, pw, ph2, 18); ctx.fillStyle = 'rgba(6,10,14,0.9)'; ctx.fill();
  const flat = hs.mode === 'stop' || (hs.mode === 'fade' && hs.k > 0.9);
  ctx.lineWidth = 3; ctx.strokeStyle = flat ? '#FF5A6E' : 'rgba(80,255,170,0.5)'; ctx.stroke();
  const tr = [];
  for (let x = 0; x <= pw - 40; x += 3) {
    const tm = t - (pw - 40 - x) / (pw - 40) * 2.6;
    tr.push([px + 20 + x, py + ph2 * 0.62 - clamp(ecgAt(tm), -0.6, 1.2) * 88]);
  }
  const tc = flat ? '#FF5A6E' : '#50FFAA';
  ctx.shadowColor = tc; ctx.shadowBlur = 16; poly(ctx, tr, 4, tc); ctx.shadowBlur = 0;
  const bpm = hs.mode === 'beat' ? Math.round(60 / hs.period) : hs.mode === 'stop' ? (Math.floor(t * 2.5) % 2 ? '0' : '') : '--';
  ctx.font = '400 54px Anton'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = tc;
  ctx.fillText(`${bpm}`, px + pw - 20, py + 10);
  ctx.font = '800 22px Montserrat'; ctx.fillText('BPM', px + pw - 20, py + 68);
  ctx.restore();
}
SC.heart = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const hs = heartState(t);
  const inK = E.outCubic(inv(0, 0.35, lt));
  let [shx, shy] = [0, 0];
  if (t >= c.defib) [shx, shy] = shake(t, 40 * Math.exp(-(t - c.defib) * 5), 30, 4);
  const stopK = E.inOutSine(inv(c.stop - 0.2, shot.end, t));
  const cam = { x: 540 + 40 * stopK, y: lerp(640, 760, inK) - 30 * stopK, zoom: lerp(1.9, 1.1, inK) * lerp(1, 1.3, stopK) * (t >= c.defib ? 1 + 0.1 * Math.exp(-(t - c.defib) * 7) : 1),
    rot: lerp(-0.04, 0.02, clamp(lt / D)) + 0.05 * stopK, sx: shx, sy: shy };
  heartWorld(cam, t, { lungs: 0.3 });
  // the strike arriving: a bolt driven into the heart
  if (t >= c.defib - 0.08 && t < c.defib + 0.3) {
    applyCam(cam);
    const b = makeBolt(880 + Math.floor(t * FPS), 700, -500, 540, 700, { disp: 260, depth: 6, branches: 5 });
    drawBolt(b, clamp((t - c.defib + 0.08) / 0.08), t < c.defib ? 0.8 : 2 * Math.exp(-(t - c.defib) * 6), t, { width: 1.4 });
  }
  pill(300, 440, 'BUILT-IN PACEMAKER', '#FFD08A', ramp(t, c.beat_ok + 0.45, c.beat_ok + 0.65) * (t < c.defib ? 1.1 : 0), 34);
  const flash = t >= c.defib ? 0.85 * Math.exp(-(t - c.defib) * 14) : 0;
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  return { flash, zblur: enterK * 0.35, zcx: 540, zcy: 690, desat: hs.mode === 'stop' ? 0.35 : 0 };
};
SC.restart = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const out = E.inOutCubic(inv(c.breath_fail - 0.15, c.breath_fail + 0.5, t));
  const hold = 1 - E.inOutSine(inv(c.restart - 0.2, c.restart + 0.4, t));
  const cam = { x: 540 + 40 * hold, y: lerp(760, 700, out) - 30 * hold + 10 * Math.sin(t * 0.9), zoom: lerp(lerp(1.2, 1.43, hold), 0.74, out) * (t >= c.restart ? 1 + 0.05 * Math.exp(-(t - c.restart) * 5) : 1), rot: lerp(0.02, 0, out) + 0.07 * hold - 0.02 * Math.sin(t * 0.7) };
  // the gasp: one reflexive twitch of the lungs that goes nowhere, and the O₂ gauge flashes red
  const gT = c.gasp === undefined ? -99 : t - c.gasp;
  const twitch = gT > 0 ? Math.sin(Math.PI * clamp(gT / 0.28)) * Math.exp(-gT * 2.5) : 0;
  const alarm = gT > 0 ? Math.exp(-gT * 3.2) * (0.6 + 0.4 * Math.cos(gT * 18)) : 0;
  const o2 = (t < c.breath_fail ? 0.7 : lerp(0.7, 0.32, E.outCubic(inv(c.breath_fail, shot.end, t)))) - 0.04 * twitch;
  heartWorld(cam, t, { lungs: lerp(0.3, 1, out), breath: 0.55 * twitch, blue: out > 0.5 ? 1 : 0 });
  if (t >= c.restart && t < c.restart + 0.25) {
    applyCam(cam);
    sparks(611, 540 - 135, 700 - 83, c.restart, t, 30, { speed: 500, life: 0.4, grav: 0, cols: ['#FFE08A', '#FFFFFF'] });
  }
  if (out > 0.2) {
    ctx.save(); screenSpace(); ctx.globalAlpha = clamp(out * 1.5);
    const x = 830, y = 420, w = 170, h = 44;
    ctx.font = '900 40px Montserrat'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#8FB8FF'; ctx.fillText('O₂', x - 18, y + h / 2);
    rrect(ctx, x, y, w, h, 22); ctx.fillStyle = 'rgba(8,12,34,0.9)'; ctx.fill();
    ctx.lineWidth = 3 + 3 * alarm; ctx.strokeStyle = alarm > 0.05 ? hexMix('#8FB8FF', '#FF5A6E', clamp(alarm * 1.6)) : '#8FB8FF';
    if (alarm > 0.05) { ctx.shadowColor = '#FF5A6E'; ctx.shadowBlur = 30 * alarm; }
    ctx.stroke(); ctx.shadowBlur = 0;
    rrect(ctx, x + 6, y + 6, (w - 12) * o2, h - 12, 16); ctx.fillStyle = o2 < 0.45 || alarm > 0.3 ? '#FF5A6E' : '#7FE9FF'; ctx.fill();
    ctx.restore();
    pill(300, 442, 'LUNGS: STILL', '#8FB8FF', out * 1.1, 34);
  }
  return { flash: t >= c.restart ? 0.35 * Math.exp(-(t - c.restart) * 10) : 0, desat: t < c.restart ? 0.35 : 0 };
};

// ---------------------------------------------------------------- 17/18. overhead: CPR, then safe to touch
const LIE = { hipY: -222, lean: 0, armL: { a: 0.42, b: 0.08 }, armR: { a: 0.42, b: 0.08 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
function groundTop(cam, t) {
  screenSpace();
  const g = ctx.createRadialGradient(540, 900, 100, 540, 900, 1300);
  g.addColorStop(0, '#1B2B4A'); g.addColorStop(1, '#070B1C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  const rng = mulberry32(404);
  ctx.lineCap = 'round';
  for (let i = 0; i < 1400; i++) {
    const x = -300 + rng() * 1700, y = -200 + rng() * 2300, a = rng() * 6.3, l = 10 + rng() * 22;
    ctx.strokeStyle = `rgba(${70 + rng() * 50},${110 + rng() * 60},${170 + rng() * 60},0.55)`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  for (const [px, py, pr] of [[180, 1500, 140], [900, 420, 110], [860, 1650, 90]]) ellipse(ctx, px, py, pr, pr * 0.7, 'rgba(130,160,255,0.14)');
  // raindrop ripples on the ground
  for (let i = 0; i < 18; i++) {
    const born = Math.floor((t * 6 + i * 0.37) % 18), ph = (t * 6 + i * 0.37) % 1;
    const x = hash(i * 13 + born) * 1100, y = hash(i * 7 + born * 3) * 1900;
    ring(x, y, 6 + ph * 40, (6 + ph * 40) * 0.8, 2, '#AFC4FF', 0.35 * (1 - ph));
  }
}
function lyingHiker(cam, t, face, blink) {
  const st = { x: 540, y: 1330, s: 1.3, pose: LIE, face: Object.assign({}, face, { blink }), frizz: 1, soot: 0.8, seed: 3, shoeMissingL: true };
  applyCam(cam);
  const sg = ctx.createRadialGradient(540, 960, 60, 540, 960, 620);
  sg.addColorStop(0, 'rgba(8,6,10,0.75)'); sg.addColorStop(1, 'rgba(8,6,10,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(540, 960, 460, 640, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(250, 1420); ctx.rotate(-0.9); ctx.scale(1.5, 1.5); drawShoe(ctx, [0, 0], -1, PAL, 0, false); ctx.restore();
  const r = charLayer(cam, st, t, { ambient: 0.12 });
  applyCam(cam);
  return { st, r };
}
function rescuerBody(x, y) {
  // kneeling rescuer seen from above, entering from the right edge
  ellipse(ctx, x + 60, y, 150, 250, '#1D4452');
  ellipse(ctx, x + 40, y, 120, 220, '#2A6475');
  circle(ctx, x - 40, y, 70, '#2B1A12');
  circle(ctx, x - 52, y - 8, 56, '#3C2618');
}
function rescuerArm(from, to, press) {
  const mid = [lerp(from[0], to[0], 0.5) + 30, lerp(from[1], to[1], 0.5) + (from[1] < to[1] ? -40 : 40)];
  line(ctx, from[0], from[1], mid[0], mid[1], 64, '#1D4452');
  line(ctx, from[0], from[1] - 6, mid[0], mid[1] - 6, 44, '#2F6B7A');
  line(ctx, mid[0], mid[1], to[0], to[1], 56, '#1D4452');
  line(ctx, mid[0], mid[1] - 6, to[0], to[1] - 6, 38, '#347789');
}
SC.cpr = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const cam = { x: 600, y: lerp(840, 860, clamp(lt / D)), zoom: lerp(1.3, 1.42, E.inOutSine(clamp(lt / D))), rot: lerp(0.05, -0.02, clamp(lt / D)) };
  groundTop(cam, t);
  const { st, r } = lyingHiker(cam, t, FACES.out, 1);
  const chest = toWorld(st, r.chest);
  const per = 0.5, ph = ((t - c.cpr) % per + per) % per / per;
  const press = t < c.cpr - 0.2 ? 0 : Math.pow(Math.sin(Math.PI * ph), 2);
  // chest ripple + blood pushed out to brain and limbs
  if (t > c.cpr - 0.2) {
    const k = ph;
    ring(chest[0], chest[1], 40 + 180 * k, (40 + 180 * k) * 0.8, 6, '#FF6A8A', 0.6 * (1 - k));
    const head = toWorld(st, r.head);
    const dests = [head, toWorld(st, r.wrL), toWorld(st, r.wrR), toWorld(st, r.anL), toWorld(st, r.anR)];
    for (const d of dests) {
      const u = clamp(k * 1.2);
      const x = lerp(chest[0], d[0], u), y = lerp(chest[1], d[1], u);
      circle(ctx, x, y, 9, 'rgba(255,120,140,0.95)'); circle(gctx, x, y, 34, `rgba(255,80,110,${0.8 * (1 - u * 0.5)})`);
    }
  }
  const hx = chest[0] + 20, hy = chest[1] + 10 + 10 * press;
  rescuerBody(1000, 860);
  rescuerArm([930, 760], [hx + 30, hy - 14], press);
  rescuerArm([930, 960], [hx + 30, hy + 14], press);
  const s = 1 - 0.07 * press;
  ctx.save(); ctx.translate(hx, hy); ctx.scale(s, s);
  circle(ctx, 0, 0, 44, '#A8704C'); circle(ctx, -6, -8, 38, '#C68860');
  for (let i = -1; i <= 2; i++) line(ctx, -30, i * 14, 12, i * 14, 3, 'rgba(120,70,45,0.6)');
  ctx.restore();
  pill(260, 250, '100–120 / MIN', '#FF86A6', ramp(t, c.cpr, c.cpr + 0.2) * 1.05, 34);
  // O2 recovering
  const o2 = lerp(0.32, 0.62, E.inOutSine(clamp(lt / D)));
  ctx.save(); screenSpace();
  const x = 830, y = 250, w = 170, h = 44;
  ctx.font = '900 40px Montserrat'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8FB8FF'; ctx.fillText('O₂', x - 18, y + h / 2);
  rrect(ctx, x, y, w, h, 22); ctx.fillStyle = 'rgba(8,12,34,0.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#8FB8FF'; ctx.stroke();
  rrect(ctx, x + 6, y + 6, (w - 12) * o2, h - 12, 16); ctx.fillStyle = o2 < 0.45 ? '#FF5A6E' : '#7FE9FF'; ctx.fill();
  ctx.restore();
  const enterK = 1 - E.outCubic(inv(0, 0.16, lt));
  return { zblur: -enterK * 0.35, zcx: 540, zcy: 880 };
};
function voltmeter(k, t) {
  if (k <= 0) return;
  ctx.save(); screenSpace(); ctx.translate(250, 330); const s = E.outBack(clamp(k), 2); ctx.scale(s, s);
  rrect(ctx, -170, -120, 340, 250, 30); ctx.fillStyle = 'rgba(8,12,34,0.92)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
  ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(160,190,255,0.35)';
  ctx.beginPath(); ctx.arc(0, 30, 110, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  const na = Math.PI * 1.15 + 0.02 * Math.sin(t * 20);
  line(ctx, 0, 30, Math.cos(na) * 100, 30 + Math.sin(na) * 100, 6, '#FFFFFF'); circle(ctx, 0, 30, 10, '#FFFFFF');
  ctx.font = '400 76px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4DFFB4'; ctx.fillText('0 V', 0, -30);
  ctx.font = '900 28px Montserrat'; ctx.fillText('NO CHARGE', 0, 90);
  ctx.restore();
}
SC.touch = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const k = E.inOutCubic(inv(0, 0.5, lt));
  const cam = { x: lerp(540, 575, k), y: lerp(880, 690, k), zoom: lerp(1.1, 1.85, k), rot: lerp(-0.02, 0.03, clamp(lt / D)) };
  groundTop(cam, t);
  const wake = inv(c.touch + 0.2, c.touch + 0.45, t);
  const face = wake > 0 ? lerpFace(FACES.out, FACES.dazed, wake) : FACES.out;
  const { st, r } = lyingHiker(cam, t, Object.assign({}, face, { lookX: 0.8 }), wake > 0 ? lerp(1, 0.35, wake) : 1);
  const sh = toWorld(st, r.U(80, -150));
  const reach = E.inOutCubic(inv(c.no_charge - 0.2, c.touch, t));
  const hx = lerp(1250, sh[0] + 30, reach), hy = lerp(760, sh[1], reach);
  rescuerBody(1120, 760);
  rescuerArm([1060, 760], [hx + 40, hy], 0);
  circle(ctx, hx, hy, 40, '#A8704C'); circle(ctx, hx - 5, hy - 6, 35, '#C68860');
  for (let i = -1; i <= 1; i++) line(ctx, hx - 30, hy + i * 15, hx - 58, hy + i * 17, 13, '#C68860');
  if (t >= c.touch) {
    const tk = (t - c.touch) / 0.6;
    if (tk < 1) ring(sh[0], sh[1], 30 + 180 * tk, 30 + 180 * tk, 6, '#4DFFB4', 0.8 * (1 - tk));
    softDot(gctx, sh[0], sh[1], 90, '#4DFFB4', 0.6 * Math.exp(-(t - c.touch) * 3));
  }
  voltmeter(ramp(t, c.no_charge - 0.1, c.no_charge + 0.1) * 1.1, t);
  const ck = ramp(t, c.touch, c.touch + 0.2);
  if (ck > 0) {
    ctx.save(); screenSpace(); ctx.translate(820, 330); const s = E.outBack(ck, 2.2); ctx.scale(s, s);
    circle(ctx, 0, 0, 70, '#4DFFB4'); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B1A14';
    ctx.beginPath(); ctx.moveTo(-32, 2); ctx.lineTo(-8, 26); ctx.lineTo(34, -24); ctx.stroke();
    ctx.restore();
    softDot(gctx, 820, 330, 150, '#4DFFB4', 0.5 * ck);
  }
  return {};
};

// ---------------------------------------------------------------- 19/20. survive (kit) → the ranger struck 7 times
function rangerFigure(x, y, s, glow, smokeT) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = '#1E2A3A';
  const legs = (c) => { rrect(c, -58, -250, 50, 250, 20); c.fill(); rrect(c, 8, -250, 50, 250, 20); c.fill(); };
  const torso = (c) => { c.beginPath(); c.moveTo(-90, -470); c.lineTo(90, -470); c.quadraticCurveTo(110, -460, 104, -420); c.lineTo(78, -240); c.lineTo(-78, -240); c.lineTo(-104, -420); c.quadraticCurveTo(-110, -460, -90, -470); c.fill(); };
  ctx.fillStyle = '#9FE8FF'; ctx.save(); ctx.translate(0, 0); ctx.scale(1.03, 1.01); legs(ctx); torso(ctx); ctx.restore(); circle(ctx, 0, -530, 66, '#9FE8FF');
  ctx.fillStyle = body; legs(ctx); torso(ctx);
  rrect(ctx, -140, -455, 44, 200, 22); ctx.fill(); rrect(ctx, 96, -455, 44, 200, 22); ctx.fill();
  circle(ctx, 0, -530, 62, body);
  // campaign hat: wide brim + pinched crown
  ellipse(ctx, 0, -572, 118, 22, '#8A6A3A');
  ctx.fillStyle = '#A07C44'; ctx.beginPath(); ctx.moveTo(-58, -575); ctx.lineTo(-40, -650); ctx.lineTo(0, -628); ctx.lineTo(40, -650); ctx.lineTo(58, -575); ctx.closePath(); ctx.fill();
  line(ctx, -56, -586, 56, -586, 8, '#5A4424');
  // badge
  circle(ctx, -40, -410, 12, '#FFD447');
  ctx.restore();
  // cyan rim
  gctx.save(); gctx.translate(x, y); gctx.scale(s, s); gctx.fillStyle = `rgba(110,200,255,${0.35 * glow})`;
  legs(gctx); torso(gctx); circle(gctx, 0, -530, 70, `rgba(110,200,255,${0.35 * glow})`); gctx.restore();
}
SC.ranger = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const hits = c.ranger_strikes;
  let n = 0; for (const h of hits) if (t >= h) n++;
  const last = n ? hits[n - 1] : -9;
  const dt = t - last;
  const I = n ? 1.8 * Math.exp(-dt * 12) : 0;
  const [shx, shy] = n ? shake(t, 18 * Math.exp(-dt * 8) + 2 * n, 28, 5) : [0, 0];
  const cam = { x: 540, y: lerp(900, 860, clamp(lt / D)), zoom: lerp(1.0, 1.12, E.inOutSine(clamp(lt / D))) * (1 + 0.04 * Math.exp(-dt * 10)), rot: 0, sx: shx, sy: shy };
  drawStorm(cam, { flash: clamp(0.1 + I * 0.5), t: 6 + t });
  drawRain(t, 0.9, 0);
  drawHill(cam, { flash: clamp(I * 0.4), crestY: 1150, t });
  applyCam(cam);
  const pk = E.outBack(inv(0, 0.3, lt), 1.8);
  if (n && dt < 0.22) {
    const b = makeBolt(1200 + n * 31, 300 + hash(n) * 480, -500, 540, 505, { disp: 300, depth: 7, branches: 5 });
    drawBolt(b, 1, I, t);
    sparks(1300 + n, 540, 520, last, t, 30, { speed: 900, life: 0.4 });
  }
  rangerFigure(540, 1150, 1.0 * clamp(pk, 0, 1.1), 0.4 + 0.6 * clamp(I), t);
  if (n) smoke(1400, 548, 440, hits[0], t, { rate: 14, rise: 260, alpha: 0.3, size: 24 });
  pill(540, 1040 + 0 * lt, 'PARK RANGER', '#8FE39A', ramp(lt, 0.2, 0.4) * (n ? 0 : 1.1), 36);
  // counter + year
  ctx.save(); screenSpace();
  if (n) {
    const punch = 1 + 0.25 * Math.exp(-dt * 10);
    ctx.translate(540, 330); ctx.scale(punch, punch);
    ctx.font = '400 230px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = '#070A1E'; ctx.strokeText(`×${n}`, 0, 0);
    ctx.fillStyle = '#FFD447'; ctx.fillText(`×${n}`, 0, 0);
    ctx.font = '800 50px Montserrat'; ctx.lineWidth = 10; ctx.strokeText(`${RANGER_YEARS[n - 1]}`, 0, 150);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(`${RANGER_YEARS[n - 1]}`, 0, 150);
  }
  ctx.restore();
  // "survived all 7" stamp
  const sk = E.outBack(inv(c.stamp, c.stamp + 0.2, t), 2.2);
  if (sk > 0) {
    ctx.save(); screenSpace(); ctx.translate(540, 760); ctx.rotate(-0.1); const s = lerp(2.2, 1, sk); ctx.scale(s, s);
    ctx.globalAlpha = clamp(sk * 1.5);
    rrect(ctx, -330, -95, 660, 190, 30); ctx.fillStyle = 'rgba(8,24,18,0.92)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
    ctx.font = '900 104px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4DFFB4';
    ctx.fillText('SURVIVED', 0, -18);
    ctx.font = '900 44px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('ALL 7 STRIKES', 0, 60);
    ctx.restore();
    const tr = t - c.stamp;
    ring(540, 760, 200 + tr * 1200, 200 + tr * 1200, 10 * clamp(1 - tr * 2), '#4DFFB4', clamp(1 - tr * 2));
  }
  drawRain(t, 0.9, 1);
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  return { flash: n ? 0.55 * Math.exp(-dt * 16) : 0, zblur: enterK * 0.3, zcx: 540, zcy: 700 };
};

// ---------------------------------------------------------------- 21. back to the hiker... the sky flickers again
SC.final = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const pre = inv(shot.start + 0.4, c.final_strike, t);
  const sky = 0.08 + 0.5 * pre * Math.abs(vnoise(t * 16, 6)) + (t >= c.final_strike ? 1 : 0);
  const [shx, shy] = shake(t, 3 + 12 * pre, 20, 4);
  const up = E.inOutCubic(inv(0.3, 1.1, lt));
  const cam = { x: 540, y: lerp(900, 690, up), zoom: lerp(1.5, 1.25, up), rot: 0, sx: shx, sy: shy };
  survivorWorld(cam, lt, t, { sky: clamp(sky), nervous: ramp(lt, 0.15, 0.4), lower: 1 });
  applyCam(cam);
  const lead = inv(c.final_strike - 0.14, c.final_strike, t);
  if (lead > 0) drawBolt(BOLT2, lerp(0.2, 1, lead), t >= c.final_strike ? 2 : 0.7, t);
  const flashTop = t >= c.final_strike ? lerp(1, 0.9, inv(c.final_strike, TLd.duration, t)) : 0;
  const enterK = 1 - E.outCubic(inv(0, 0.14, lt));
  return { flashTop, noCaptions: true, blur: enterK > 0.02 ? [enterK * 150, 0] : null };
};
