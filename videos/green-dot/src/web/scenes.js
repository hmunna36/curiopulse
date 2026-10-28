// Why Do You See a GREEN Dot That Isn't There? 👁️ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt =
// seconds inside the shot, t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
// The test (fog.js) is drawn in post.overlay, after the light and the lens: its grey and pink are exact, and nothing on
// screen is green until the payoff word (the answer says so).
'use strict';

const cu = () => TLd.cues;
E.linear = E.linear || ((x) => x);
E.inBack = E.inBack || ((x, s = 1.7) => (s + 1) * x * x * x - s * x * x);
function shotOf(id) { return TLd.shots.find((s) => s.id === id); }
const bumpAt = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);
function faceSeq(t, seq, dur = 0.14) {
  let f = seq[0][1];
  for (let i = 1; i < seq.length; i++) {
    const [t1, g] = seq[i];
    if (t >= t1 + dur) f = g;
    else if (t > t1) f = lerpFace(f, g, (t - t1) / dur);
  }
  return f;
}
// a small filled tag (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, 2); });
  ctx.restore();
}
const FR = (t) => Math.round(t * FPS);

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// the fog: soft daylight from above and in front, a faint lilac rim from the ring above him; NO pool, halo, split-tone or
// colour fringe, so the fog round his head stays the test's own grey and meets the exact field above without a seam
const FOG_LIGHT = { ...LIGHTS.day, key: [-0.12, -0.72, 0.68], keyTint: [1.02, 1.0, 1.0], rimFrom: [0.0, -1.0], rim: [1.0, 0.66, 0.98], rimAmt: 0.75,
  pool: 0, halo: 0, contrast: 0, sat: 1.0, split: 0, fringe: 0, bloom: 0.05, halation: 0.05, dof: 0 };
const EYE_LIGHT = { ...LIGHTS.inside, pool: 0.25, halo: 0 };
const BRAIN_LIGHT = { ...LIGHTS.screen, pool: 0.3, halo: 0 };
const LAB_LIGHT = { ...LIGHTS.candle, pool: 0.45, halo: 0.08 };
setLights({
  hook: FOG_LIGHT, button: FOG_LIGHT, cover: FOG_LIGHT,
  eye: (lt) => (lt < 0.45 ? FOG_LIGHT : EYE_LIGHT), paint: BRAIN_LIGHT, weird: LAB_LIGHT,
});

// ================================================================ the hiker under the test (hook, button, the loop)
// his state as a function of video time t (the button's end runs into frame 1's state: the loop)
function heroA(t) {
  const c = cu(), D = TLd.duration;
  const tt = t >= cu().so - 0.2 ? t : t;           // one clock: the hook from 0, the button near the end
  let face, s = GDH.S, veins = 0, tremble = 0, tear = 0, headDY = 0, headRot = 0;
  if (t < c.so - 0.2) {
    face = faceSeq(tt, [[-1, GF.stare], [c.green1 - 0.12, GF.see], [c.theres + 0.15, GF.stare], [c.screen - 0.05, GF.sus],
      [c.keep2 - 0.1, GF.strain], [c.fade - 0.12, GF.awe]], 0.16);
    s = GDH.S + 0.07 * E.inOutSine(clamp(tt / 13.5));
    veins = ramp(tt, c.keep2, c.dots_end, E.inOutSine);
    tremble = ramp(tt, c.dont - 0.1, c.blink1_end, E.inOutSine) * (1 - 0.6 * ramp(tt, c.fade, c.away_end));
    tear = ramp(tt, c.blink1_end + 0.15, c.away_end + 0.25, E.inOutSine);
    // "faking it": a slow suspicious lean of the head (his eyes never leave the cross)
    headRot = -0.035 * popK(tt, c.faking - 0.1, c.keep2 - 0.05, 0.3, 0.3);
    // ...and one skeptical eyebrow goes up (his right, screen left); the eyes stay on the cross
    const brow = popK(tt, c.faking - 0.05, c.keep2 - 0.1, 0.16, 0.2);
    if (brow > 0.01) face = { ...face, browR: 0.6 * brow, browL: -0.95 * brow };   // (a brow raised further vanishes into his hair)
    headDY = 1.4 * Math.sin(tt * 1.9) - 7 * popK(tt, c.fade - 0.1, 99, 0.5, 0.1);
  } else {
    // the button: a huge blink, they're back (grin), then the eyes go back up to the cross: frame 1
    face = faceSeq(t, [[-1, GF.stare], [c.blink3 - 0.06, GF.shut], [c.blink3_end + 0.1, GF.shut], [c.theyre - 0.08, GF.grin], [c.now - 0.05, GF.stare]], 0.12);
    headDY = 10 * popK(t, c.blink3 - 0.05, c.theyre, 0.08, 0.1) - 12 * bumpAt(t, c.theyre - 0.05, 6) * Math.sin((t - c.theyre) * 18) + 1.4 * Math.sin((t - D) * 1.9);
  }
  // his lids tremble while he must not blink
  if (tremble > 0.01) face = { ...face, blink: Math.max(face.blink || 0, tremble * (0.16 + 0.12 * Math.sin(t * 47) + 0.06 * Math.sin(t * 83))) };
  if (tear > 0.01) face = { ...face, tear };
  return { face, s, veins, headDY, headRot };
}
// the fog and him (no test: that is the overlay)
function fogDraw(t, A) {
  gdFogBack(t);
  screenSpace();
  return gdHero(t, A);
}

SC.hook = (lt, t) => {
  const A = heroA(t);
  fogDraw(t, A);
  const f = FR(t);
  return { glow: 0.6, capY: 1170, overlay: () => gdTest({ f, gap: gdGap(f) }) };
};

// ================================================================ inside his eye
const SE_CARD = [540, 572, 118];
// the card's gap: running, then held on the marked dot (3 o'clock) while the beam turns grey, then running again
function eyeGap(t) {
  const c = cu(), f = FR(t);
  if (t >= c.a_dot - 0.05 && t < c.green3_end + 0.25) return 3;
  return gdGap(f);
}
function seerStates(t) {
  const c = cu(), out = [];
  for (let i = 0; i < 6; i++) {
    const team = SE.TEAM[i];
    let mood = 'idle', glow = 0, jit = 0, sweat = 0, look = [0, 0];
    if (team === 'P') {
      mood = t < c.sick - 0.1 ? 'work' : t < c.pink2_end + 0.05 ? 'tired' : 'zzz';
      sweat = popK(t, c.sick - 0.1, c.pink2_end + 0.1, 0.1, 0.1);
      glow = t < c.a_dot ? 0.55 * (1 - ramp(t, c.sick, c.pink2_end)) : 0;
      look = [i < 3 ? 0.3 : -0.3, -0.6];
    } else {
      mood = t < c.blinks ? 'idle' : t < c.you_see - 0.05 ? 'ready' : t < c.green3_end + 0.35 ? 'shout' : 'proud';
      look = t < c.a_dot ? [i < 3 ? -0.8 : 0.8, 0.1] : [0, -1];
      glow = ramp(t, c.you_see - 0.05, c.you_see + 0.15) * (1 - 0.4 * ramp(t, c.green3_end + 0.2, c.green3_end + 0.5));
      jit = 3.5 * popK(t, c.you_see - 0.05, c.green3_end + 0.3, 0.05, 0.1);
    }
    out.push({ team, mood, glow, jit, sweat, look, k: 1 });
  }
  return out;
}
SC.eye = (lt, t, shot) => {
  const c = cu();
  const k = ramp(lt, 0, 0.5, E.inOutCubic);            // the test shrinks into the card at the top
  const win = ramp(lt, 0.04, 0.62, E.inCubic);          // the window on his eye opens and swallows the frame
  const beamPink = t < c.a_dot;
  const beam = { col: beamPink ? '#FF5FE0' : '#E4E4E4', a: ramp(lt, 0.45, 0.75) };
  const card = SE_CARD, dot3 = [card[0] + card[2], card[1]];
  const Vf = { x: SE.X, y: SE.Y, s: SE.S };
  const draw = (V) => seInside(t, V, { seers: seerStates(t), beam, card: [lerp(card[0], dot3[0], 0.5), card[1] + card[2] + 84, 46] });
  if (win < 1) {
    const A = heroA(cu().eyes2 - 0.07);                   // he holds the last pose of the test
    const H0 = fogDraw(t, A);
    const eye = [H0.head[0] - 24 * A.s, H0.head[1] - 2 * A.s + (A.headDY || 0) * A.s];
    const r = lerp(8, 1500, win), V = { x: lerp(eye[0], Vf.x, win), y: lerp(eye[1], Vf.y, win), s: lerp(0.12, Vf.s, win) };
    screenSpace();
    ctx.beginPath(); ctx.arc(eye[0], eye[1], r, 0, 7); ctx.fillStyle = '#12060F'; ctx.fill();   // an opaque disc first (the shape map)
    ctx.save(); ctx.beginPath(); ctx.arc(eye[0], eye[1], r, 0, 7); ctx.clip();
    draw(V);
    ctx.restore();
    screenSpace();
    ctx.beginPath(); ctx.arc(eye[0], eye[1], r, 0, 7); ctx.lineWidth = 10; ctx.strokeStyle = rgba('#FFFFFF', 0.85 * (1 - win)); ctx.stroke();
  } else draw(Vf);
  screenSpace();
  // what the seers do, said in a word or two
  const zA = clamp(ramp(t, c.pink2_end - 0.1, c.pink2_end + 0.2)) * (1 - ramp(t, c.green3_end + 0.2, shot.end));
  for (let i = 0; i < 6; i += 2) { const P = seSpot(Vf, i); zzz(P.x - 20, P.y - 190, t, c.pink2_end - 0.1 + i * 0.07, zA, 0.78); }
  tagPill('INSIDE YOUR EYE', 540, 880, '#FFD447', popK(lt, 0.7, c.a_dot - shot.start - 0.1, 0.12, 0.15), 36);
  // the payoff: the green team's shout
  const gk = ramp(t, c.green3 - 0.04, c.green3 + 0.12);
  if (gk > 0) eyeShout('GREEN!', 540, 892, 118, gk, 1 - ramp(t, shot.end - 0.12, shot.end), -0.06, '#4DFFB4', 5);
  // the marked dot in the card, and its beam's colour, in the overlay (the card is exact grey on top of everything)
  const markK = popK(lt, 0.55, 99, 0.15, 0.1);
  return {
    glow: 0.85, capY: 1105, push: { k: 1 + 0.06 * ramp(t, c.a_dot, shot.end, E.inOutSine), cx: 520, cy: 1520 },
    overlay: () => {
      const g = gdTest({ f: FR(t), gap: eyeGap(t), k, card });
      if (markK > 0.01 && g) {
        const x = g.cx + g.R, y = g.cy;
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = markK;
        ctx.setLineDash([9, 7]); ctx.lineWidth = 4; ctx.strokeStyle = '#141826';
        ctx.beginPath(); ctx.arc(x, y, g.R * GD.DOTR * 1.45, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
      }
    },
  };
};

// ================================================================ the brain paints them over
function paintPlan(t) {
  const c = cu(), t0 = c.paints - 0.05, t1 = c.them_end + 0.35, step = (t1 - t0) / 12;
  const painted = [], seq = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let at = null;
  seq.forEach((i, n) => {
    const a = t0 + n * step, p = ramp(t, a, a + step * 0.9, E.inOutSine);
    painted[i] = p;
    if (t >= a && t < a + step) {
      const x = PB.CX + Math.cos(gdAng(i)) * PB.R, y = PB.CY + Math.sin(gdAng(i)) * PB.R, r = PB.R * GD.DOTR;
      at = [lerp(x - r * 1.35, x + r * 1.35, p), y];
    }
  });
  if (!at) { const last = t >= t1; const i = last ? 11 : 0; at = [PB.CX + Math.cos(gdAng(i)) * PB.R, PB.CY + Math.sin(gdAng(i)) * PB.R]; }
  return { painted, at };
}
SC.paint = (lt, t, shot) => {
  const c = cu();
  const P = paintPlan(t);
  const roller = ramp(t, c.your_brain + 0.1, c.paints - 0.05, E.inOutCubic) * (1 - ramp(t, c.them_end + 0.4, c.them_end + 0.7, E.inOutCubic));
  const at = t < c.paints - 0.05 ? [lerp(PB.CX + 260, P.at[0], ramp(t, c.your_brain + 0.1, c.paints - 0.05, E.inOutCubic)), lerp(PB.CY + 220, P.at[1], ramp(t, c.your_brain + 0.1, c.paints - 0.05, E.inOutCubic))] : P.at;
  const mood = t < c.never - 0.1 ? 'calm' : t < c.your_brain ? 'squint' : t < c.them_end + 0.3 ? 'grin' : 'grin';
  const yawn = popK(t, c.change_end - 0.25, c.your_brain - 0.05, 0.25, 0.2);
  pbScene(t, { painted: P.painted, roller, at, mood, yawn, look: t < c.them_end + 0.3 ? [0, -1] : [0, 0] });
  // BORING: the brain stamps the screen while it yawns
  const sk = popK(t, c.change_end - 0.02, c.paints - 0.1, 0.12, 0.12);
  if (sk > 0) stamp('BORING', 548, 826, sk, '#FF4D5E', -0.16, 88);
  return { glow: 0.8, capY: 1092, push: { k: 1 + 0.05 * lt / (shot.end - shot.start), cx: 540, cy: 700 } };
};

// ================================================================ the weirdest fact: the suction cup (1950s, old film)
function labA(t) {
  const c = cu();
  const planted = t >= c.cupped + 0.12;
  // his free eye (screen left): on the hand, wide when it plops, darting about while the picture fades, then at us
  const dart = t > c.gone - 0.5 && t < c.in_seconds ? Math.sin((t - c.gone) * 9) : 0;
  const look = t < c.cupped + 0.1 ? [0.9, -0.2] : t < c.gone - 0.5 ? [0.2, -0.4] : t < c.in_seconds ? [dart, -0.3] : [0, 0];
  const face = faceSeq(t, [[-1, { ...FACES.nervous, lookX: 0.9, lookY: -0.2 }], [c.cupped + 0.08, { ...FACES.startled, lookX: look[0], lookY: look[1] }],
    [c.picture, { ...FACES.calm, lookX: 0.2, lookY: -0.4, mouth: 'flat', mouthOpen: 0.2 }], [c.gone - 0.4, { ...FACES.confused, lookX: dart, lookY: -0.3 }],
    [c.in_seconds + 0.1, { ...FACES.annoyed, lookX: 0, lookY: 0, blink: 0.3 }]], 0.12);
  const f2 = { ...face, lookX: look[0], lookY: look[1], shutL: planted ? 1 : 0 };
  const wob = planted ? Math.sin((t - c.cupped) * 22) * Math.exp(-(t - c.cupped) * 3.2) : 0;
  return { face: f2, look, wob, planted };
}
SC.weird = (lt, t, shot) => {
  const c = cu();
  lbInit();
  screenSpace();
  ctx.drawImage(LB_WALL, 0, 0);
  // a lamp's warm pool on the wall, left
  softDot(gctx, 160, 520, 260, '#FFC27A', 0.25);
  lbChinRest(ctx);
  const A = labA(t);
  const thw = bumpAt(t, c.cupped, 10);
  const st = { x: LB.HX, y: LB.HY + 470 * LB.S, s: LB.S, pose: POSES.stand, face: A.face, headDY: -5 * thw, headRot: 0.03 * thw, noLegs: true, seed: 3 };
  charLayer({ x: W / 2, y: H / 2, zoom: 1, rot: 0 }, st, t, { pal: GDPAL });
  lbChinCup(ctx);
  // the hand brings the cup, plops it on, lets go; later it comes back with a stopwatch
  const cupP = lbCupPos({ look: A.planted ? A.look : [0, 0] });
  cupP[1] += -5 * thw * LB.S;
  const inK = ramp(t, c.scientist - 0.1, c.cupped, E.outCubic), outK = ramp(t, c.cupped + 0.35, c.onto + 0.2, E.inCubic);
  const handK = inK * (1 - outK);
  if (!A.planted) {
    // the cup in the hand, on its way
    const P = [lerp(W + 140, cupP[0], E.outCubic(inK)), lerp(cupP[1] + 120, cupP[1], E.outCubic(inK))];
    lbCup(ctx, gctx, P, { k: inK > 0.02 ? 1 : 0, wob: 0 });
    lbHand(ctx, [P[0] + 40, P[1] + 30], handK);
  } else {
    lbCup(ctx, gctx, cupP, { k: 1, wob: A.wob, squash: bumpAt(t, c.cupped + 0.1, 9) });
    lbHand(ctx, [cupP[0] + 40 + 300 * outK, cupP[1] + 30 + 200 * outK], handK > 0.01 ? 1 - outK : 0);
  }
  // THWOP
  const tk = popK(t, c.cupped + 0.02, c.cupped + 0.62, 0.08, 0.15);
  if (tk > 0) bigWord('THWOP!', 776, 860, 92, '#FFD447', E.outBack(tk, 2.4), 0.12);
  // WHAT HE SEES: the picture fades
  const sk = popK(t, c.picture - 0.05, 99, 0.16, 0.1);
  const fade = ramp(t, c.gone - 0.75, c.gone_end + 0.05, E.inOutSine);
  screenSpace();
  lbSees(ctx, 110, 498, 330, 286, sk, fade, t);
  // the stopwatch: a few seconds
  const wk = popK(t, c.in_seconds - 0.12, 99, 0.14, 0.1);
  if (wk > 0) {
    lbHand(ctx, [800, 760], wk);
    lbWatch(ctx, gctx, 760, 700, 1.05, 3 * ramp(t, c.in_seconds, c.seconds_end + 0.1, E.inOutSine), wk);
  }
  return {
    glow: 0.7, desat: 0.55, tint: '#C9974A', tintA: 0.28,
    push: { k: 1.02 + 0.05 * lt / (shot.end - shot.start), cx: 540, cy: 1000 },
    overlay: () => lbOldFilm(t, 1),
  };
};

// ================================================================ the button: blink, they're back, now... (the loop)
SC.button = (lt, t) => {
  const A = heroA(t);
  fogDraw(t, A);
  const f = FR(t);
  return { glow: 0.6, capY: 1170, overlay: () => gdTest({ f, gap: gdGap(f, true) }) };
};

// ================================================================ the cover (cover.sh renders it)
SC.cover = (lt, t) => {
  const A = { face: { ...GF.see, mouthOpen: 0.5 }, s: GDH.S, veins: 0.5 };
  fogDraw(0.5, A);
  return {
    glow: 0.6, noCaptions: true,
    overlay: () => {
      gdTest({ f: 0, gap: 4 });
      // what the viewer will see in the gap (the cover only: the Short itself never draws it)
      const x = GD.CX + Math.cos(gdAng(4)) * GD.R, y = GD.CY + Math.sin(gdAng(4)) * GD.R, r = GD.R * GD.DOTR;
      const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 1.05);
      g.addColorStop(0, 'rgba(60,235,120,0.95)'); g.addColorStop(1, 'rgba(60,235,120,0)');
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.05, 0, 7); ctx.fill(); ctx.restore();
      bigWord('SEE THE', 540, 1112, 108, '#FFFFFF', 1, -0.03);
      bigWord('GREEN DOT?', 540, 1232, 124, '#4DFFB4', 1, -0.03);
    },
  };
};

function initScenes2() {
  gdInitLayer(); gdInitFog(); lbInit();
}
