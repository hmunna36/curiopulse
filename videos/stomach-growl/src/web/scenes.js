// Why Does Your Stomach GROWL? Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
// the wall clock: the second hand ticks once a second (a little overshoot), frozen by `freeze` (time)
function clockTick(t, freeze = 1e9) {
  const tt = Math.min(t, freeze);
  return (Math.floor(tt) + E.outBack(clamp((tt % 1) / 0.12))) / 60 + 0.31;
}
// a camera shake that decays after t0
function quake(t, t0, amp, dur = 0.9, freq = 26) {
  if (t < t0) return [0, 0];
  const k = Math.exp(-(t - t0) * 3.2 / dur) * (t - t0 < dur * 1.6 ? 1 : 0);
  return shake(t, amp * k, freq, 9);
}
// the hero's face blends
const FACE_FOCUS = Object.assign({}, FACES.calm, { lookX: 0, lookY: 1, mouth: 'flat', mouthOpen: 0.1, blink: 0.25 });
const FACE_DEADPAN = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.48, browTilt: -0.2, browY: 0 });
const FACE_PANIC = Object.assign({}, FACES.nervous, { lookX: 0, lookY: 0.4, eyeOpen: 1.4 });

// ---------------------------------------------------------------- 1. hook: the silent exam ... GROWL
SC.hook = (lt, t, shot) => {
  const c = cu();
  const cam0 = camKeys(t, [
    [0, 548, 1135, 2.25], [c.pregurgle + 0.55, 548, 1120, 2.1], [c.exam + 0.3, 540, 1010, 1.02], [c.then - 0.05, 540, 1030, 1.12],
    [c.goes + 0.2, 540, 1078, 1.5], [c.growl, 540, 1080, 1.55], [shot.end, 540, 1090, 1.62],
  ], E.inOutSine);
  const [qx, qy] = quake(t, c.growl, 22, 1.0);
  const punch = 1 + 0.06 * Math.exp(-Math.max(0, t - c.growl) * 6) * (t > c.growl ? 1 : 0);
  const cam = Object.assign({}, cam0, { zoom: cam0.zoom * punch, sx: qx, sy: qy });
  // he senses it coming (eyes up on "stomach"), then the growl: the jolt + panic
  const sense = ramp(t, c.stomach + 0.1, c.stomach + 0.4);
  const hit = ramp(t, c.growl, c.growl + 0.12, E.outBack);
  const pre = ramp(t, c.pregurgle + 0.05, c.pregurgle + 0.2) * (1 - ramp(t, c.pregurgle + 0.75, c.pregurgle + 1.0));   // freezes, eyes wide
  let face = lerpFace(FACE_FOCUS, Object.assign({}, FACES.worried, { lookX: 0, lookY: 0.2, eyeOpen: 1.3, browY: 1.1, mouthOpen: 0.1, mouth: 'flat' }), pre);
  face = lerpFace(face, Object.assign({}, FACES.worried, { lookY: 0.6, mouthOpen: 0.2 }), sense);
  face = lerpFace(face, FACE_PANIC, hit);
  const jolt = Math.exp(-Math.max(0, t - c.growl) * 7) * (t > c.growl ? 1 : 0);
  const stare = ramp(t, c.growl + 0.05, c.growl + 0.55, E.outCubic);
  const { hst } = examScene(cam, t, {
    tick: clockTick(t), stare, write: 1 - ramp(t, c.growl, c.growl + 0.1),
    hero: { face, write: (1 - sense) * (1 - pre), jolt: Math.max(jolt, 0.25 * pre * Math.exp(-Math.max(0, t - c.pregurgle) * 4)), headDY: -14 * jolt, headRot: 0.03 * Math.sin(t * 40) * hit * (1 - ramp(t, c.growl + 0.6, c.growl + 0.9)) },
  });
  hallShafts(cam, t, 1);
  // the belly: a little gurgle on "stomach" (foreshadow), then the GROWL
  applyCam(cam);
  const [bx, by] = heroBelly(hst);
  growlRings(ctx, bx, by, inv(c.pregurgle, c.pregurgle + 0.7, t), { n: 2, r: 110, w: 5, col: '#FFB347', a: 0.75, squash: 0.7 });
  growlRings(ctx, bx, by, inv(c.stomach + 0.15, c.stomach + 0.75, t), { n: 2, r: 90, w: 5, col: '#FFB347', a: 0.6, squash: 0.7 });
  for (let k = 0; k < 3; k++) growlRings(ctx, bx, by, inv(c.growl + k * 0.28, c.growl + k * 0.28 + 0.9, t), { n: 3, r: 520, w: 12, col: '#FFB347', squash: 0.75 });
  if (sense > 0 && t < c.growl) { const w = 6 * Math.sin(t * 45) * sense; ellipse(ctx, bx + w, by, 26, 16, rgba('#FFB347', 0.25 * sense)); }
  if (t > c.growl) shockLines(...toScreen(cam, bx, by), 220, inv(c.growl, c.growl + 0.45, t), 14, '#FFD447', 4);
  if (hit > 0) sweatDrop(ctx, hst.x + 76, hst.y - 300, 1.2, hit);
  // the onomatopoeia
  const wk = ramp(t, c.growl, c.growl + 0.25, E.outBack);
  growlWord('GRRRROWL!', 540, 560, 168, wk, t, 1.2 * (1 - 0.6 * ramp(t, c.growl + 0.6, shot.end)));
  motes(t, 0.35);
  return { glow: 0.8, zblur: 0.06 * (1 - ramp(t, 0, 0.5)) + 0.12 * Math.exp(-Math.max(0, t - c.growl) * 8) * (t > c.growl ? 1 : 0),
    zcx: 540, zcy: 1150, flash: 0.22 * Math.exp(-Math.max(0, t - c.growl) * 14) * (t > c.growl ? 1 : 0) };
};

// ---------------------------------------------------------------- 2. react: "Cool. Very cool."
SC.react = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 1062, zoom: 2.05 + 0.1 * ramp(lt, 0, D, E.inOutSine), rot: 0 };
  const thumb = ramp(t, c.verycool + 0.12, c.verycool + 0.45);
  let face = lerpFace(FACE_DEADPAN, Object.assign({}, FACES.nervous, { lookX: 0, lookY: 0, eyeOpen: 1.1, browY: 0.7 }), ramp(t, c.verycool, c.verycool + 0.2));
  const { hst } = examScene(cam, t, {
    tick: clockTick(t), stare: 1, glare: ramp(lt, 0.2, 1.2), write: 0,
    hero: { face, thumb, pencil: thumb < 0.3, headRot: -0.03 },
  });
  hallShafts(cam, t, 0.8);
  applyCam(cam);
  sweatDrop(ctx, hst.x + 74, hst.y - 300 + 30 * ramp(lt, 0, D), 1.1, ramp(t, c.verycool, c.verycool + 0.3));
  return { glow: 0.7 };
};

// ---------------------------------------------------------------- 3. name: BORBORYGMI (the word growls)
SC.name = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#3A1C14', '#0A0406');
  screenSpace();
  // a big faint stomach behind the title, glowing, breathing
  const rum = ramp(t, c.growls_w - 0.05, c.growls_w + 0.15) * (1 - ramp(t, c.growls_end + 0.1, c.growls_end + 0.3));
  const [rx, ry] = shake(t, 10 * rum, 30, 3);
  const br = 1 + 0.025 * Math.sin(lt * 5) + 0.05 * rum;
  ctx.save(); ctx.translate(540 - STOM_C[0] * 2.1 * br + rx, 900 - STOM_C[1] * 2.1 * br + ry); ctx.scale(2.1 * br, 2.1 * br); ctx.globalAlpha = 0.42;
  stomachPath(ctx); ctx.fillStyle = '#E2697A'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFB347'; ctx.stroke();
  ctx.restore();
  softDot(gctx, 280, 400, 260, '#FF7A4A', 0.25);
  // "IT'S CALLED"
  const kc = 0;
  if (kc > 0) {
    ctx.save(); ctx.translate(540, 560); ctx.scale(kc, kc);
    ctx.font = '900 54px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,230,200,0.85)'; ctx.fillText("IT'S CALLED…", 0, 0);
    ctx.restore();
  }
  // BORBORYGMI typed letter by letter as she says it
  const word = 'BORBORYGMI', n = word.length;
  const shown = clamp((t - c.borbo + 0.05) / Math.max(0.3, c.borbo_end - c.borbo)) * n;
  ctx.save(); ctx.font = '400 150px Anton';
  const widths = [...word].map((ch) => ctx.measureText(ch).width), total = widths.reduce((a, b) => a + b, 0);
  ctx.restore();
  let px = 540 - total / 2;
  const wob = 0.25 * ramp(t, c.even, c.even + 0.3) + 1.6 * rum;
  [...word].forEach((ch, i) => {
    const k = E.outBack(clamp(shown - i));
    if (k > 0) {
      const jx = wob * 6 * Math.sin(t * 37 + i * 2.3), jy = wob * 8 * Math.sin(t * 29 + i * 1.7);
      ctx.save(); ctx.translate(px + widths[i] / 2 + jx, 780 + jy); ctx.scale(k, k); ctx.rotate(0.05 * wob * Math.sin(t * 17 + i));
      ctx.font = '400 150px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(0,0,12,0.5)'; ctx.fillText(ch, 4, 9);
      ctx.lineWidth = 20; ctx.strokeStyle = '#1A0A04'; ctx.strokeText(ch, 0, 0);
      ctx.fillStyle = i % 2 ? '#FFD447' : '#FFB347'; ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    px += widths[i];
  });
  if (shown > 0) softDot(gctx, 540, 780, 420, '#FFB347', 0.3 * clamp(shown / n) * (1 + rum));
  // pronunciation
  const kp = ramp(t, c.borbo_end + 0.05, c.borbo_end + 0.35, E.outBack);
  if (kp > 0) {
    ctx.save(); ctx.translate(540, 905); ctx.scale(kp, kp);
    ctx.font = '800 46px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7FE9FF'; ctx.fillText('(bor-bor-RIG-mee)', 0, 0);
    ctx.restore();
  }
  // "the WORD growls": rings off the letters while she growls it
  for (let k = 0; k < 3; k++) growlRings(ctx, 540, 780, inv(c.growls_w + k * 0.22, c.growls_w + k * 0.22 + 0.8, t), { n: 2, r: 520, w: 9, squash: 0.45 });
  // an underline on WORD
  const ku = ramp(t, c.word, c.word + 0.3);
  if (ku > 0) { line(ctx, 540 - total / 2, 880 - 30, 540 - total / 2 + total * ku, 880 - 30, 9, '#FF5A6E'); }
  const noCap = t > c.borbo - 0.1 && t < c.borbo_end + 0.45;
  return { glow: 0.9, push: { k: 1 + 0.06 * lt / D, cx: 540, cy: 800 }, noCaptions: noCap };
};

// ---------------------------------------------------------------- 4. clean: the x-ray gut, the housekeeping wave
SC.clean = (lt, t, shot) => {
  const c = cu();
  darkBg('#0B1A3A', '#02040C');
  screenSpace();
  motes(t, 0.3);
  const ringU = lerp(0, 0.5, ramp(t, c.wave - 0.1, shot.end + 0.35, E.inOutSine));
  const ringP = gutAt(ringU);
  const v = sectionCam(t, [
    [shot.start, 0, -120, 1.12, 900], [c.hours + 0.6, 40, -150, 1.2, 900], [c.gut + 0.1, 20, -60, 1.25, 860],
    [c.wave - 0.2, 110, -210, 1.75, 860], [c.squeezes, ringP.x, ringP.y, 1.9, 860], [shot.end, ringP.x, ringP.y, 2.1, 860],
  ]);
  // keep following the ring after it starts
  if (t > c.squeezes) { v.x = 540 - ringP.x * v.s; v.y = 860 - ringP.y * v.s; }
  const food = 1 - ramp(t, c.hours + 0.2, c.gut - 0.1);
  const glow = ramp(t, c.cleaning - 0.1, c.cleaning + 0.3);
  gutXray(v, t, { food, glow: glow * (0.6 + 0.4 * Math.sin(t * 6) ** 2), clean: glow, debris: t > c.cleaning, ring: t > c.wave - 0.1 ? ringU : -1 });
  // "hours after a meal": a clock with spinning hands + an empty plate
  const kh = ramp(t, c.hours - 0.05, c.hours + 0.3, E.outBack) * (1 - ramp(t, c.cleaning, c.cleaning + 0.3));
  if (kh > 0) {
    ctx.save(); ctx.translate(250, 560); ctx.scale(kh, kh);
    circle(ctx, 0, 0, 92, '#2B2B33'); circle(ctx, 0, 0, 80, '#F4EFE2');
    const sp = (t - c.hours) * 9;
    line(ctx, 0, 0, Math.sin(sp) * 60, -Math.cos(sp) * 60, 7, '#1A1A22'); line(ctx, 0, 0, Math.sin(sp / 12) * 40, -Math.cos(sp / 12) * 40, 9, '#1A1A22');
    ctx.font = '400 64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('+2 HRS', 0, 140); ctx.fillStyle = '#FFD447'; ctx.fillText('+2 HRS', 0, 140);
    ctx.restore();
  }
  // CLEANING MODE
  const km = ramp(t, c.cleaning - 0.05, c.cleaning + 0.25, E.outBack) * (1 - ramp(t, c.wave - 0.3, c.wave));
  if (km > 0) neonWord('CLEANING MODE', 540, 480, 78, '#4DFFB4', km, t);
  // SQUEEZE! sting at the ring
  const ks = ramp(t, c.squeezes - 0.05, c.squeezes + 0.2, E.outBack);
  if (ks > 0) bigWord('SQUEEZE!', 540, 520, 120, '#FFD447', ks, -0.06);
  return { glow: 0.95, zblur: 0.1 * (1 - ramp(lt, 0, 0.35)) };
};

// ---------------------------------------------------------------- 5. sweep: inside the tube, leftovers + bacteria swept along
const TUBE_CY = 820;
function debrisPile(ringX, t, n, seed, cy, R, o = {}) {
  // items spread along the tube; the ring scoops them up and pushes them ahead, tumbling
  const rng = mulberry32(seed), items = [];
  for (let i = 0; i < n; i++) {
    const base = (o.x0 || 0) + rng() * (o.span || 1300), kind = o.kinds[i % o.kinds.length], r = (o.r || 22) * (0.7 + 0.6 * rng());
    let x = base, y = cy + R - r - 6 - rng() * 30, rot = rng() * 6;
    if (ringX !== null && ringX + 40 > base - 80) {
      const pushed = Math.max(base, ringX + 60 + (i % 5) * 34 + 20 * rng());
      const caught = clamp((ringX + 60 - base + 80) / 160);
      x = lerp(base, pushed, caught);
      y = lerp(y, cy + R * 0.25 - (i % 4) * 34 + 20 * Math.sin(t * 5 + i), caught * 0.8);
      rot += t * 4 * caught * (i % 2 ? 1 : -1);
    }
    items.push({ x, y, r, rot, kind, i });
  }
  return items;
}
SC.sweep = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A0A12', '#060104');
  const cam = { x: 540 + 40 * lt, y: TUBE_CY, zoom: 1.12 + 0.08 * lt / D, rot: 0 };
  applyCam(cam);
  const ringX = lerp(80, 980, ramp(t, shot.start - 0.2, shot.end + 0.6, E.linear)) + 40 * lt;
  const o = { R: 170, wall: 80, ring: ringX, pinch: 0.78, width: 110 };
  tubeSection(TUBE_CY, -200, 1600, t, o);
  const items = debrisPile(ringX, t, 14, 31, TUBE_CY, 170, { x0: 160, span: 1150, kinds: ['crumb', 'bac', 'crumb'], r: 34 });
  for (const it of items) {
    if (it.kind === 'bac') bacterium(ctx, it.x, it.y, 30, t, it.i, 1);
    else crumb(ctx, it.x, it.y, it.r, it.rot, it.i % 2 ? '#C98A3A' : '#E8C46A');
  }
  // labels, in screen space
  screenSpace();
  const kl = ramp(t, c.leftovers - 0.05, c.leftovers + 0.25, E.outBack);
  if (kl > 0) pill(390, 520, 'LEFTOVERS', '#FF9A3C', kl, 46);
  const kb = ramp(t, c.bacteria - 0.05, c.bacteria + 0.25, E.outBack);
  if (kb > 0) pill(700, 1160, 'BACTERIA', '#4DFFB4', kb, 46);
  return { glow: 0.85, blur: [0, 0] };
};

// ---------------------------------------------------------------- 6. loud: empty -> gas + juice squeezed through the pinch
SC.loud = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A0A12', '#060104');
  const pinchAt = c.squeezed + 0.25;                 // the ring reaches the big bubble here
  const ringX = lerp(-260, 1320, ramp(t, c.squeezed - 0.9, c.tube_end + 0.6, E.inOutSine));
  const cam = { x: 540, y: TUBE_CY, zoom: 1.0 + 0.1 * ramp(t, c.squeezed - 0.3, c.tube_end, E.inOutSine), rot: 0 };
  applyCam(cam);
  const o = { R: 170, wall: 80, ring: t > c.squeezed - 0.9 ? ringX : null, pinch: 0.8, width: 110 };
  tubeSection(TUBE_CY, -300, 1400, t, o);
  tubeJuice(TUBE_CY, -300, 1400, t, o, 0.3);
  // gas bubbles: they drift; the ones the ring reaches squeeze through the pinch (stretched), then pop out
  const B = [[300, -40, 70], [560, -60, 92], [800, -30, 60], [960, -70, 50], [180, -90, 40], [690, -110, 36]];
  B.forEach(([bx0, by0, r], i) => {
    let bx = bx0 + 10 * Math.sin(t * 1.3 + i), by = TUBE_CY + by0 + 8 * Math.sin(t * 1.9 + i * 2);
    let sx = 1, sy = 1;
    if (o.ring !== null) {
      const d = bx - o.ring;
      if (d > -40 && d < 160) { const q = 1 - Math.abs(d - 60) / 100; sx = 1 + 0.7 * clamp(q); sy = 1 - 0.45 * clamp(q); by = lerp(by, TUBE_CY, clamp(q)); }
      if (d <= -40) bx = o.ring - 60 - (bx0 % 80);   // squeezed past: trails just behind the ring
    }
    bubble(ctx, bx, by, r, 1, sx, sy);
  });
  // the noise: rings leave the pinch as each bubble squeezes through
  if (o.ring !== null) for (let k = 0; k < 4; k++) growlRings(ctx, o.ring, TUBE_CY, inv(c.squeezed + k * 0.3, c.squeezed + k * 0.3 + 1.0, t), { n: 3, r: 420, w: 10, col: '#FFB347', squash: 0.9 });
  screenSpace();
  const ke = ramp(t, c.empty - 0.05, c.empty + 0.25, E.outBack) * (1 - ramp(t, c.gasjuice - 0.3, c.gasjuice));
  if (ke > 0) stamp('EMPTY', 540, 500, ke, '#7FE9FF', -0.12, 130);
  const kg = ramp(t, c.gasjuice - 0.05, c.gasjuice + 0.25, E.outBack);
  if (kg > 0) { pill(330, 520, 'GAS', '#7FE9FF', kg, 50); leader([330, 560], [540, 700], kg, '#7FE9FF'); }
  const kj = ramp(t, c.juice - 0.05, c.juice + 0.25, E.outBack);
  if (kj > 0) { pill(760, 1140, 'JUICE', '#C8E85A', kj, 50); leader([760, 1100], [640, 940], kj, '#C8E85A'); }
  return { glow: 0.9 };
};

// ---------------------------------------------------------------- 7. pipes: "Bagpipes."
SC.pipes = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A1030', '#07020A');
  screenSpace();
  // a spotlight
  const g = ctx.createRadialGradient(540, 780, 40, 540, 820, 620); g.addColorStop(0, 'rgba(255,230,180,0.22)'); g.addColorStop(1, 'rgba(255,230,180,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const k = ramp(lt, 0, 0.22, E.outBack);
  const sq = 0.5 + 0.5 * Math.sin(lt * 9);
  const tips = bagpipe(560, 900, 1.5, sq * ramp(t, c.bagpipes, c.bagpipes + 0.2), t, k, ramp(lt, 0.02, 0.3));
  for (const [i, tp] of tips.entries()) notes(tp[0], tp[1] + 40, t, c.bagpipes + 0.05 + i * 0.1, 1, 0.9, ['#FFD447', '#7FE9FF', '#FF86A6'][i]);
  return { glow: 0.8, push: { k: 1 + 0.05 * lt / D, cx: 540, cy: 820 }, zblur: 0.12 * (1 - ramp(lt, 0, 0.25)) };
};

// ---------------------------------------------------------------- 8. full: same squeeze, muffled
SC.full = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A0A12', '#060104');
  const ringX = lerp(-120, 1200, ramp(t, c.full + 0.2, c.full_end + 0.4, E.linear));
  const ring = t > c.full + 0.2 ? ringX : null;
  const topA = 0.35 + 0.65 * ramp(t, c.same - 0.2, c.same + 0.2);
  // top: EMPTY (a callback), bottom: FULL
  const TY = 610, BY = 965;
  applyCam({ x: 540, y: 960, zoom: 1, rot: 0 });
  ctx.save(); ctx.globalAlpha = topA;
  const oT = { R: 100, wall: 46, ring, pinch: 0.8, width: 80 };
  tubeSection(TY, -200, 1300, t, oT);
  tubeJuice(TY, -200, 1300, t, oT, 0.3);
  for (const [bx0, r] of [[260, 40], [520, 52], [780, 38]]) {
    let bx = bx0, sx = 1, sy = 1;
    if (ring !== null) { const d = bx - ring; if (d > -30 && d < 110) { const q = 1 - Math.abs(d - 40) / 70; sx = 1 + 0.7 * clamp(q); sy = 1 - 0.45 * clamp(q); } if (d <= -30) bx = ring - 40 - bx0 % 50; }
    bubble(ctx, bx, TY - 20, r, 1, sx, sy);
  }
  ctx.restore();
  const oB = { R: 100, wall: 46, ring, pinch: 0.55, width: 80 };
  tubeSection(BY, -200, 1300, t, oB);
  // packed food: noodles, peas, bread
  ctx.save();
  ctx.beginPath();
  for (let x = -200; x <= 1300; x += 8) ctx.lineTo(x, BY - tubeRadius(x, oB));
  for (let x = 1300; x >= -200; x -= 8) ctx.lineTo(x, BY + tubeRadius(x, oB));
  ctx.closePath(); ctx.clip();
  const rng = mulberry32(12);
  for (let i = 0; i < 70; i++) {
    let fx = -200 + rng() * 1500, fy = BY - 90 + rng() * 180;
    if (ring !== null) { const d = fx - ring; fx += 26 * Math.exp(-((d / 90) ** 2)); }
    const kind = i % 4;
    if (kind === 0) ellipse(ctx, fx, fy, 18, 18, '#7FC24A');
    else if (kind === 1) { ctx.beginPath(); ctx.moveTo(fx - 40, fy); ctx.bezierCurveTo(fx - 20, fy - 30, fx + 10, fy + 30, fx + 40, fy); ctx.lineWidth = 12; ctx.strokeStyle = '#F2D27A'; ctx.stroke(); }
    else if (kind === 2) { rrect(ctx, fx - 24, fy - 20, 48, 40, 8); ctx.fillStyle = '#D9A55A'; ctx.fill(); }
    else ellipse(ctx, fx, fy, 14, 9, '#F4EFE2', rng() * 3);
  }
  ctx.restore();
  // the sound: big rings up top, tiny muffled ones below
  if (ring !== null) {
    for (let k = 0; k < 3; k++) growlRings(ctx, ring, TY, inv(c.same + k * 0.35, c.same + k * 0.35 + 0.9, t), { n: 3, r: 300, w: 9, col: '#FFB347', squash: 0.85, a: topA });
    for (let k = 0; k < 3; k++) growlRings(ctx, ring, BY, inv(c.food + k * 0.35, c.food + k * 0.35 + 0.6, t), { n: 2, r: 46, w: 4, col: '#8FB8FF', squash: 0.8, a: 0.8 });
  }
  screenSpace();
  // labels on the left, inside the safe zone
  const kf = ramp(t, c.full - 0.05, c.full + 0.25, E.outBack);
  if (kf > 0) pill(250, 1135, 'FULL', '#FF9A3C', kf, 46);
  const ke = ramp(t, c.same - 0.1, c.same + 0.15, E.outBack);
  if (ke > 0) pill(250, 470, 'EMPTY', '#7FE9FF', ke, 46);
  const kg = ramp(t, c.same + 0.3, c.same + 0.55, E.outBack);
  if (kg > 0) bigWord('GRRR!', 780, 480, 96, '#FFB347', kg, -0.08);
  const km = ramp(t, c.muffles - 0.05, c.muffles + 0.25, E.outBack);
  if (km > 0) { ctx.save(); ctx.translate(780, 1140); ctx.scale(km, km); ctx.font = 'italic 800 44px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8FB8FF'; ctx.fillText('grr… (mmf)', 0, 0); ctx.restore(); }
  return { glow: 0.85, push: { k: 1 + 0.04 * lt / D, cx: 540, cy: 760 } };
};

// ---------------------------------------------------------------- 9. proof: 1912, the balloon
function heroLab(cam, t, o) {
  const st = Object.assign({ x: LAB.hero.x, y: LAB.hero.y, s: LAB.hero.s, face: FACES.calm }, o.st || {});
  // the stool
  applyCam(cam);
  rrect(ctx, st.x - 70, st.y + 10, 140, 26, 8); ctx.fillStyle = '#5A3E26'; ctx.fill();
  line(ctx, st.x - 50, st.y + 30, st.x - 70, st.y + 260, 12, '#3E2A18'); line(ctx, st.x + 50, st.y + 30, st.x + 70, st.y + 260, 12, '#3E2A18');
  heroSeatLegs(ctx, st.x, st.y, st.s, PAL1912);
  const pose = heroDeskPose({ t, shrug: o.shrug || 0, whisper: o.hand || 0 });
  const r = drawCharacter(ctx, Object.assign({}, st, { y: st.y + 34 * st.s, pose, noLegs: true }), t, PAL1912);
  bowTie(ctx, Object.assign({}, st, { y: st.y + 34 * st.s }), r);
  return { st, r };
}
function heroSeatLegs(c, x, y, s, pal = PAL) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    rrect(c, sd * 38 - 30, -14, 60, 54, 24); c.fillStyle = pal.pants; c.fill();
    const g = c.createLinearGradient(0, 30, 0, 230); g.addColorStop(0, pal.pants); g.addColorStop(1, pal.pantsSh);
    rrect(c, sd * 40 - 24, 26, 48, 200, 20); c.fillStyle = g; c.fill();
    ellipse(c, sd * 44, 236, 38, 18, '#2A1A10');
  }
  c.restore();
}
// the rubber tube from his mouth to the tambour (world coords)
function labTube(mouth, k, t) {
  if (k <= 0) return;
  const [tx, ty] = LAB.tamb;
  const P = [];
  for (let i = 0; i <= 30; i++) {
    const u = i / 30;
    const x = lerp(mouth[0], tx, u) + 60 * Math.sin(Math.PI * u), y = lerp(mouth[1], ty, u) + 160 * Math.sin(Math.PI * u) + 4 * Math.sin(t * 3 + u * 6);
    P.push([x, y]);
  }
  const n = Math.max(2, Math.round(P.length * clamp(k)));
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(P[i][0], P[i][1]);
  ctx.lineWidth = 14; ctx.strokeStyle = '#B07A4A'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,230,190,0.5)'; ctx.stroke();
}
// trace + marks for the drum (shared by proof and match): squeeze peaks every PER seconds
const KY_PER = 1.15;
// the stomach pressure the drum records: a squeeze peak every KY_PER seconds
function kyY(tt) { const ph = (tt % KY_PER) / KY_PER; return -Math.exp(-(((ph - 0.5) / 0.12) ** 2)) * 150 + 8 * Math.sin(tt * 13); }
SC.proof = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam0 = camKeys(t, [
    [shot.start, 600, 1000, 1.02], [c.year + 0.2, 560, 1000, 1.06], [c.student - 0.2, 420, 1040, 1.45],
    [c.swallowed + 0.2, 380, 1040, 1.6], [c.balloon_end, 400, 1040, 1.55], [c.spy + 0.4, 640, 1020, 1.22], [shot.end, 680, 1020, 1.28],
  ], E.inOutSine);
  const [qx, qy] = shake(t, 3, 2.5, 21);                    // the gate weave of old film
  const cam = Object.assign({}, cam0, { sx: qx, sy: qy });
  labRoom(cam, t);
  // the drum + tambour + lever
  const writing = ramp(t, c.spy - 0.1, c.spy + 0.3);
  const scroll = (t - c.spy) * 120;
  const trace = [];
  if (writing > 0) for (let tt = c.spy; tt <= t; tt += 1 / 60) trace.push({ x: (tt - c.spy) * 120, y: kyY(tt) * 0.6 });
  const dr = LAB.drum;
  kymograph(dr.x, dr.y, dr.r, dr.h, scroll, t, { trace });
  // tambour + lever (its tip rides the trace at the drum's front)
  const [tbx, tby] = LAB.tamb;
  circle(ctx, tbx, tby, 34, '#8A6A3A'); circle(ctx, tbx, tby, 24, '#C9A86A');
  const tipY = dr.y + (trace.length ? trace[trace.length - 1].y : 0);
  line(ctx, tbx, tby, dr.x - 4, tipY, 5, '#D8C090');
  circle(ctx, dr.x - 4, tipY, 6, '#FFD447');
  // the professor behind the drum, peering through a magnifier on "spy"
  const kp = ramp(t, c.spy - 0.3, c.spy + 0.2, E.outCubic);
  drawStudent(ctx, PROF, { x: 990 - 30 * kp, y: 1150, s: 0.95, lookX: -1, lookY: 0.4, brow: 0.6 * kp, tilt: -0.08 * kp, blink: blinkAt(t, 40) }, t);
  if (kp > 0.05) {
    const mx = 900 - 60 * kp, my = 890;
    ctx.beginPath(); ctx.arc(mx, my, 46, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = '#3A2A1A'; ctx.stroke(); line(ctx, mx + 32, my + 32, mx + 80, my + 90, 14, '#3A2A1A');
  }
  // the student
  const nerv = ramp(t, c.student - 0.1, c.student + 0.2);
  const gulp = ramp(t, c.swallowed - 0.05, c.swallowed + 0.25) * (1 - ramp(t, c.swallowed + 0.6, c.balloon - 0.05));
  const pop = ramp(t, c.balloon, c.balloon + 0.2, E.outBack);
  let face = lerpFace(FACES.calm, Object.assign({}, FACES.nervous, { lookX: 0.6 }), nerv);
  face = lerpFace(face, Object.assign({}, FACES.calm, { blink: 1, browY: 1.2, browTilt: 0.9, mouth: 'flat', mouthOpen: 0.4, squeeze: 1 }), gulp);
  face = lerpFace(face, Object.assign({}, FACES.startled, { mouth: 'o', mouthOpen: 0.25 }), pop);
  face = lerpFace(face, Object.assign({}, FACES.nervous, { lookX: 1, lookY: 0.2 }), ramp(t, c.spy + 0.2, c.spy + 0.5));
  const { st, r } = heroLab(cam, t, { st: { face, headDY: 10 * gulp, headRot: -0.05 * gulp } });
  const head = toWorld(Object.assign({}, st, { y: st.y + 34 * st.s }), r.head);
  const mouth = [head[0], head[1] + 40 * st.s + 10 * gulp];
  // the tube: in his hand (before), into the mouth (swallowed), out to the tambour (spy)
  if (t < c.swallowed) {
    const wr = toWorld(Object.assign({}, st, { y: st.y + 34 * st.s }), r.wrR);
    ctx.beginPath(); ctx.arc(wr[0] - 10, wr[1] - 20, 34, 0, Math.PI * 2); ctx.lineWidth = 12; ctx.strokeStyle = '#B07A4A'; ctx.stroke();
  }
  labTube(mouth, ramp(t, c.swallowed, c.spy + 0.2), t);
  // the x-ray callout: his stomach with the tube and the balloon
  const kx = ramp(t, c.swallowed + 0.05, c.swallowed + 0.35, E.outBack);
  if (kx > 0) {
    const belly = [st.x, st.y - 60 * st.s];
    const sp = toScreen(cam, belly[0], belly[1]);
    screenSpace();
    const bxC = 760, byC = 560, R = 170;
    leader([sp[0] + 40, sp[1] - 20], [bxC - R * 0.8, byC + R * 0.6], kx, '#7FE9FF');
    xrayWindow(bxC, byC, R, t, { k: kx, balloon: pop, squeeze: writing * Math.max(0, Math.sin((t - c.spy) / KY_PER * Math.PI * 2 - 1.2)) });
    applyCam(cam);
  }
  screenSpace();
  // 1912 stamp
  const ky = ramp(t, c.year - 0.05, c.year + 0.2, E.outBack) * (1 - ramp(t, c.student - 0.1, c.student + 0.2));
  if (ky > 0) stamp('1912', 540, 560, ky, '#F2E2C0', -0.1, 210);
  const kb = ramp(t, c.balloon, c.balloon + 0.25, E.outBack) * (1 - ramp(t, c.spy - 0.2, c.spy + 0.1));
  if (kb > 0) bigWord('GULP.', 300, 470, 110, '#FF5A6E', kb, -0.1);
  const kw = ramp(t, c.weirdest - 0.1, c.weirdest + 0.15) * (1 - ramp(t, c.year - 0.2, c.year));
  return { glow: 0.65, overlay: () => { sepia(0.85); oldFilm(t, 1); }, flash: 0.5 * (1 - ramp(lt, 0, 0.18)) + 0 * kw };
};

// ---------------------------------------------------------------- 10. match: hunger pangs on the squeezes
SC.match = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the lab bench under a lamp, the smoked paper unrolled big: top track = the stomach's squeezes, bottom = his key
  screenSpace();
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#6A4A2C'); bg.addColorStop(1, '#2A1A0E');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  softDot(ctx, 540, 820, 700, '#FFD9A0', 0.3);
  for (let y = 0; y < H; y += 60) line(ctx, 0, y, W, y + 8, 2, 'rgba(0,0,0,0.12)');
  const px0 = 90, px1 = 990, top = 600, bot = 1110;
  rrect(ctx, px0 - 22, top - 22, px1 - px0 + 44, bot - top + 44, 18); ctx.fillStyle = '#C9A26A'; ctx.fill();
  rrect(ctx, px0, top, px1 - px0, bot - top, 10); ctx.fillStyle = '#121214'; ctx.fill();
  const speed = 300, yA = 875, yB = 1045, now = t, tFrom = now - (px1 - px0) / speed;
  const yAt = (tt) => yA - Math.exp(-(((((tt + 0.3) % KY_PER) / KY_PER - 0.5) / 0.1) ** 2)) * 190 + 5 * Math.sin(tt * 17);
  ctx.save(); rrect(ctx, px0, top, px1 - px0, bot - top, 10); ctx.clip();
  // the squeeze trace
  ctx.beginPath();
  for (let tt = tFrom; tt <= now; tt += 1 / 90) { const x = px1 - (now - tt) * speed; tt === tFrom ? ctx.moveTo(x, yAt(tt)) : ctx.lineTo(x, yAt(tt)); }
  ctx.lineWidth = 8; ctx.strokeStyle = '#F5F0E1'; ctx.lineJoin = 'round'; ctx.stroke();
  // the key track
  line(ctx, px0, yB, px1, yB, 5, 'rgba(245,240,225,0.7)');
  const peaks = [];
  for (let k = Math.floor((tFrom + 0.3) / KY_PER - 0.5); ; k++) { const tp = (k + 0.5) * KY_PER - 0.3; if (tp > now) break; if (tp >= tFrom) peaks.push(tp); }
  for (const tp of peaks) {
    const x = px1 - (now - tp) * speed;
    const marked = tp >= c.hunger - 0.25;
    if (marked) { line(ctx, x, yB, x, yB - 80, 10, '#FF9A3C'); softDot(gctx, x, yB - 40, 40, '#FF9A3C', 0.7); }
    const km = marked ? ramp(t, Math.max(c.matched, tp + 0.1), Math.max(c.matched, tp + 0.1) + 0.3) : 0;
    if (km > 0) {
      ctx.setLineDash([14, 10]); line(ctx, x, yB - 84, x, lerp(yB - 84, yA - 190, km), 6, '#4DFFB4'); ctx.setLineDash([]);
      if (km > 0.95) { softDot(gctx, x, yA - 215, 50, '#4DFFB4', 0.9); circle(ctx, x, yA - 225, 28, '#4DFFB4'); line(ctx, x - 13, yA - 225, x - 3, yA - 213, 7, '#0A2A1A'); line(ctx, x - 3, yA - 213, x + 15, yA - 238, 7, '#0A2A1A'); }
    }
  }
  circle(ctx, px1 - 8, yAt(now), 11, '#FFD447'); softDot(gctx, px1 - 8, yAt(now), 40, '#FFD447', 0.9);
  ctx.restore();
  // track labels
  pill(250, top + 56, 'STOMACH SQUEEZES', '#FFD447', ramp(lt, 0.05, 0.35, E.outBack), 34);
  pill(260, bot - 120, 'HUNGER PANGS', '#FF9A3C', ramp(t, c.hunger - 0.05, c.hunger + 0.25, E.outBack), 34);
  // his finger on the telegraph key, pressing on each peak
  const lastPeak = peaks.length ? peaks[peaks.length - 1] : -9;
  const press = Math.exp(-Math.max(0, now - lastPeak) * 9) * (lastPeak >= c.hunger - 0.25 ? 1 : 0);
  ctx.save(); ctx.translate(700, 1225);
  rrect(ctx, -150, 40, 300, 46, 12); ctx.fillStyle = '#4A3420'; ctx.fill();
  rrect(ctx, -120, 10 + 14 * press, 240, 32, 10); ctx.fillStyle = '#C49A5A'; ctx.fill();
  circle(ctx, 70, 0 + 14 * press, 28, '#2A1A10');
  rrect(ctx, 48, -96 + 14 * press, 50, 100, 24); ctx.fillStyle = PAL.skin; ctx.fill();
  rrect(ctx, 34, -210 + 14 * press, 78, 130, 30); ctx.fillStyle = PAL1912.coat; ctx.fill();
  if (press > 0.3) shockLines(770, 1195, 70, 1 - press, 8, '#FF9A3C', 3);
  ctx.restore();
  const kM = ramp(t, c.matched - 0.05, c.matched + 0.25, E.outBack);
  if (kM > 0) stamp('MATCH!', 540, 500, kM, '#4DFFB4', -0.08, 110);
  return { glow: 0.75, overlay: () => { sepia(0.6); oldFilm(t, 0.7); }, push: { k: 1 + 0.06 * lt / D, cx: 540, cy: 820 } };
};

// ---------------------------------------------------------------- 11. button: not rude, just vacuuming
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 1090, zoom: 1.7 + 0.12 * ramp(lt, 0, D, E.inOutSine), rot: 0 };
  const look = ramp(t, c.justgut - 0.1, c.justgut + 0.3);
  const proud = ramp(t, c.vacuuming + 0.2, c.vacuuming + 0.5);
  let face = lerpFace(FACE_DEADPAN, Object.assign({}, FACES.calm, { lookX: 0, lookY: 1, blink: 0.2, mouth: 'flat' }), look);
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0, lookY: 0, mouthOpen: 0.5 }), proud);
  const { hst } = examScene(cam, t, {
    tick: clockTick(t), stare: 1, glare: 1, write: 0,
    hero: { face, pencil: false, headDY: 8 * look * (1 - proud), headRot: 0.04 * proud * Math.sin(t * 10) },
  });
  hallShafts(cam, t, 0.8);
  applyCam(cam);
  const [bx, by] = heroBelly(hst);
  growlRings(ctx, bx, by, inv(c.growl_w, c.growl_w + 0.7, t), { n: 2, r: 160, w: 6, a: 0.8, squash: 0.7 });
  screenSpace();
  // RUDE? crossed out
  const kr = ramp(t, c.rude - 0.05, c.rude + 0.2, E.outBack) * (1 - ramp(t, c.justgut - 0.2, c.justgut + 0.1));
  if (kr > 0) { stamp('RUDE', 540, 500, kr, '#FF5A6E', -0.12, 140); bigX(540, 500, 0.75, ramp(t, c.rude + 0.3, c.rude + 0.5)); }
  // the x-ray callout of his gut with the vacuum
  const kx = ramp(t, c.justgut - 0.05, c.justgut + 0.3, E.outBack);
  if (kx > 0) {
    const sp = toScreen(cam, bx, by);
    const cx = 740, cy = 650, R = 225;
    leader([sp[0] + 50, sp[1] - 30], [cx - R * 0.75, cy + R * 0.65], kx, '#7FE9FF');
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R * kx, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(8,20,48,0.95)'; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const oV = { R: 110, wall: 44, ring: null };
    tubeSection(cy, cx - R - 60, cx + R + 60, t, oV);
    // the vacuum drives along the gut; crumbs + bacteria ahead of it get sucked in
    const vx = lerp(cx - R + 10, cx + R - 120, ramp(t, c.vacuuming - 0.45, shot.end, E.inOutSine));
    for (let i = 0; i < 9; i++) {
      const bx0 = cx - R + 90 + i * 40, d = bx0 - vx;
      if (d < 20) continue;
      const pull = clamp(1 - (d - 20) / 90);
      const x = lerp(bx0, vx + 70, pull * pull), y = lerp(cy + 70 - (i % 3) * 26, cy + 60, pull);
      if (i % 3 === 1) bacterium(ctx, x, y, 17 * (1 - 0.6 * pull), t, i, 1); else crumb(ctx, x, y, 16 * (1 - 0.6 * pull), i, i % 2 ? '#C98A3A' : '#E8C46A');
    }
    if (t > c.vacuuming - 0.45) vacuum(ctx, vx, cy + 66, 0.95, t, 1);
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, R * kx, 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(127,233,255,0.9)'; ctx.stroke();
    softDot(gctx, cx, cy, R * 1.1, '#7FE9FF', 0.25 * kx);
  }
  return { glow: 0.8 };
};

// ---------------------------------------------------------------- 12. sub: whispered tease, the LOUD click, the shush
SC.sub = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 540, y: 1075, zoom: 1.4 + 0.1 * ramp(lt, 0, D, E.inOutSine), rot: 0 };
  const [qx, qy] = quake(t, c.sub_tap, 10, 0.6);
  cam.sx = qx; cam.sy = qy;
  const whisper = ramp(t, c.nextup - 0.2, c.nextup + 0.2) * (1 - ramp(t, c.sub_in - 0.2, c.sub_in + 0.1));
  const clicked = ramp(t, c.sub_tap, c.sub_tap + 0.15);
  let face = lerpFace(FACE_DEADPAN, Object.assign({}, FACES.grin, { lookX: 0.2, lookY: 0, mouthOpen: 0.3, blink: 0.3 }), whisper);
  face = lerpFace(face, Object.assign({}, FACES.nervous, { lookX: -0.8, lookY: 0 }), clicked);
  const shiver = ramp(t, c.goose, c.goose + 0.1) * (1 - ramp(t, c.goose_end + 0.2, c.goose_end + 0.5));
  const stare = 0.55 + 0.45 * ramp(t, c.sub_tap, c.sub_tap + 0.3);
  const { hst } = examScene(cam, t, {
    tick: clockTick(t), stare, glare: 1 - clicked * 0.6, write: 0,
    hero: { face, whisper, pencil: false, headRot: 0.05 * Math.sin(t * 50) * shiver, headDX: 10 * whisper },
  });
  hallShafts(cam, t, 0.8);
  screenSpace();
  // the tease: a card above his head with a goosebumpy arm
  const kn = ramp(t, c.goose - 0.05, c.goose + 0.25, E.outBack) * (1 - ramp(t, c.sub_in, c.sub_in + 0.3));
  if (kn > 0) {
    ctx.save(); ctx.translate(540, 520); ctx.rotate(-0.04); ctx.scale(kn, kn);
    rrect(ctx, -300, -80, 600, 160, 24); ctx.fillStyle = '#FFF6D8'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
    ctx.font = '800 36px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6A5A2A'; ctx.fillText('NEXT UP', 0, -40);
    ctx.font = '400 76px Anton'; ctx.fillStyle = '#1A1C2C'; ctx.fillText('GOOSEBUMPS', 0, 24);
    ctx.restore();
    // shiver lines around him
    shockLines(...toScreen(cam, hst.x, hst.y - 250), 150, (t * 2.5) % 1 * shiver, 8, '#BFF0FF', 6);
  }
  // the proctor leans in from the left: SHHH!
  const kp = ramp(t, c.shush - 0.35, c.shush, E.outCubic);
  if (kp > 0) {
    drawStudent(ctx, STUD.proctor, { x: lerp(-260, 175, kp), y: 1240, s: 1.45, lookX: 1, lookY: 0.2, brow: -1, tilt: 0.12, cover: ramp(t, c.shush - 0.1, c.shush + 0.1), shh: true }, t);
    const kb = ramp(t, c.shush, c.shush + 0.2, E.outBack);
    if (kb > 0) speech('SHHH!', 340, 560, kb, '#1A1C2C', 92, -0.1);
  }
  if (t > c.sub_tap) shockLines(540, 1420, 200, inv(c.sub_tap, c.sub_tap + 0.4, t), 12, '#FFFFFF', 7);
  return { glow: 0.75 };
};

// ---------------------------------------------------------------- the cover (rendered on its own, not in the timeline)
SC.cover = (lt, t, shot) => {
  const cam = { x: 540, y: 1075, zoom: 1.5, rot: 0 };
  const { hst } = examScene(cam, 3.6, {
    tick: 0.3, stare: 1, write: 0,
    hero: { face: Object.assign({}, FACE_PANIC, { lookY: 0.3 }), jolt: 0.4, headDY: -6 },
  });
  hallShafts(cam, 3.6, 1);
  applyCam(cam);
  const [bx, by] = heroBelly(hst);
  growlRings(ctx, bx, by, 0.45, { n: 3, r: 520, w: 14, squash: 0.75 });
  growlRings(ctx, bx, by, 0.8, { n: 2, r: 520, w: 12, squash: 0.75 });
  sweatDrop(ctx, hst.x + 76, hst.y - 300, 1.3, 1);
  growlWord('GRRRROWL!', 540, 560, 190, 1, 0.37, 1.1);
  screenSpace();
  bigWord('WHY?!', 540, 1480, 190, '#FFFFFF', 1, -0.05);
  return { glow: 0.85, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initExam();
  initGut();
}
