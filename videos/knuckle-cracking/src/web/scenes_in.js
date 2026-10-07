// What Happens When You CRACK Your Knuckles? Short: the shots inside the knuckle (soda, fluid, pull, mri).
'use strict';

// a comic burst with a word in it (screen space). age = seconds since it went off
function burstWord(x, y, age, txt, o = {}) {
  if (age < 0) return;
  const hold = o.hold || 0.62, k = springStep(age, 5.2, 0.38), out = 1 - ramp(age, hold, hold + 0.22, E.inCubic);
  if (out <= 0.01) return;
  const s = k * out * (o.s || 1), rw = o.w || 250, rh = o.h || 132, rot = o.rot === undefined ? -0.1 : o.rot;
  for (const [cc, sc] of [[gctx, 0.5], [ctx, 1]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y); cc.rotate(rot + 0.02 * Math.sin(age * 40)); cc.scale(s, s);
    cc.beginPath();
    const n = 13;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 1 : 1.42 + 0.12 * Math.sin(i * 3.1);
      const px = Math.cos(a) * rw * r, py = Math.sin(a) * rh * r;
      if (i === 0) cc.moveTo(px, py); else cc.lineTo(px, py);
    }
    cc.closePath();
    if (cc === gctx) { cc.fillStyle = rgba(o.fill || '#FFD447', 0.45); cc.fill(); }
    else { cc.fillStyle = o.fill || '#FFD447'; cc.fill(); cc.lineWidth = 12; cc.lineJoin = 'round'; cc.strokeStyle = '#0B0B1A'; cc.stroke(); }
    cc.restore();
  }
  bigWord(txt, x, y + 6 * s, o.size || 150, o.col || '#FF4D3A', s, rot, '#0B0B1A');
}
// a ring that spreads from a point (screen space)
function popRing(x, y, age, r0, r1, col = '#FFFFFF', w = 9) {
  if (age < 0 || age > 0.5) return;
  const k = age / 0.5, r = lerp(r0, r1, E.outCubic(k));
  for (const [cc, sc] of [[ctx, 1], [gctx, 0.5]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0);
    cc.lineWidth = w * (1 - k) + 1; cc.strokeStyle = rgba(col, (cc === gctx ? 0.6 : 0.95) * (1 - k)); cc.beginPath(); cc.arc(x, y, r, 0, 7); cc.stroke();
    cc.restore();
  }
}
// a label: a pill with a dotted leader to what it names (screen space)
function inLabel(x, y, text, col, k, to, size = 50) {
  if (k <= 0.01) return;
  if (to) leader([x, y + (to[1] > y ? 1 : -1) * size * 0.8], to, clamp(k * 1.6), col);
  pill(x, y, text, col, k, size);
}
// the x-ray's backdrop (screen space): deep blue, a faint grid
function xrBg(t) {
  darkBg('#0E3A62', '#020914');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = 'rgba(127,233,255,0.06)'; ctx.lineWidth = 2;
  for (let x = 60; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 60; y < H; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const sy = ((t * 0.42) % 1) * H;
  const g = ctx.createLinearGradient(0, sy - 120, 0, sy); g.addColorStop(0, 'rgba(127,233,255,0)'); g.addColorStop(1, 'rgba(127,233,255,0.1)');
  ctx.fillStyle = g; ctx.fillRect(0, sy - 120, W, 120);
  ctx.restore();
}

// ---------------------------------------------------------------- 3. soda: one knuckle, and a can of soda in the joint
const XR_AT = [560, 1500, 3.1];                 // the x-ray hand: its wrist and its scale
SC.soda = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  xrBg(t);
  const kn = [XR_AT[0] - XR_FINGERS[1].k[0] * XR_AT[2], XR_AT[1] + XR_FINGERS[1].k[1] * XR_AT[2]];   // the first finger's knuckle (the hand is flipped)
  const cam = camKeys(t, [[shot.start, 540, 1010, 0.98], [c.knuckle + 0.1, 556, 1000, 1.08], [c.cracked - 0.08, kn[0] - 40, kn[1] - 30, 1.72], [shot.end, kn[0] - 34, kn[1] - 40, 1.9]], E.inOutCubic);
  const [qx, qy] = shake(t, 9 * decay(t, c.psst, 7), 30, 4);
  cam.sx = qx; cam.sy = qy;
  applyCam(cam);
  xrHand(ctx, gctx, XR_AT[0], XR_AT[1], XR_AT[2], { flip: true, soft: 0.9 });
  // a ring on the knuckle while it is being named
  const rk = ramp(t, c.your, c.knuckle + 0.1) * (1 - ramp(t, c.cracked - 0.25, c.cracked - 0.05));
  if (rk > 0.01) for (const cc of [ctx, gctx]) {
    cc.save(); cc.lineWidth = cc === gctx ? 14 : 8; cc.strokeStyle = rgba('#FFD447', (cc === gctx ? 0.5 : 0.95) * rk);
    cc.setLineDash([26, 16]); cc.lineDashOffset = -t * 90; cc.beginPath(); cc.arc(kn[0], kn[1], 88 + 8 * Math.sin(t * 9), 0, 7); cc.stroke(); cc.restore();
  }
  // the can pops into the joint; its tab goes up; psst
  const pop = springStep(t - c.cracked + 0.14, 5.5, 0.42), tab = ramp(t, c.open - 0.04, c.open + 0.16, E.outCubic), fizz = ramp(t, c.psst - 0.02, c.psst + 0.06) * (1 - 0.5 * ramp(t, c.psst + 0.25, shot.end));
  if (pop > 0.01) sodaCan(ctx, gctx, kn[0], kn[1] + 2, 1.46 * pop, t, { tab, fizz, age: Math.max(0, t - c.psst), rot: -0.08 + 0.05 * decay(t, c.psst, 6) * Math.sin((t - c.psst) * 40) });
  const ks = toScreen(cam, kn[0], kn[1]);
  screenSpace();
  popRing(ks[0], ks[1], t - c.cracked + 0.14, 30, 230, '#FFD447');
  burstWord(Math.min(ks[0] + 290, 742), ks[1] - 330, t - c.psst, 'PSST!', { s: 0.86, size: 150, w: 250, h: 124, fill: '#FFFFFF', col: '#FF6A2E', rot: 0.08, hold: 0.5 });
  return { glow: 0.8, flash: 0.3 * (1 - ramp(lt, 0, 0.1)) + 0.12 * decay(t, c.psst, 12), zblur: 0.14 * (1 - ramp(lt, 0, 0.16)) + 0.1 * ramp(t, shot.end - 0.12, shot.end, E.inCubic), zcx: ks[0], zcy: ks[1] };
};

// the backdrop behind the section (screen space)
function inBg() {
  darkBg('#2A1630', '#0A0612');
}
const JT_AT = [540, 864, 1.6], JT_ROT = -Math.PI / 2;   // the joint in section: its middle, its scale, turned so the finger points up

// ---------------------------------------------------------------- 4. fluid: a sealed bag of slippery fluid, with gas dissolved in it
SC.fluid = (lt, t, shot) => {
  const c = cu();
  inBg();
  const cam = camKeys(t, [[shot.start, 540, 884, 0.86], [c.sealed - 0.1, 540, 886, 0.88], [c.slippery + 0.1, 540, 890, 0.9], [c.full, 532, 888, 0.92], [c.dissolved + 0.2, 430, 850, 1.42], [shot.end, 422, 846, 1.52]], E.inOutCubic);
  applyCam(cam);
  const seal = ramp(t, c.sealed - 0.06, c.sealed + 0.52, E.inOutCubic), fl = 0.2 + 0.8 * ramp(t, c.slippery - 0.05, c.slippery + 0.25);
  const glide = ramp(t, c.slippery, c.slippery + 0.15) * (1 - ramp(t, c.full - 0.1, c.full + 0.2));
  const J = jointSection(ctx, gctx, JT_AT[0], JT_AT[1], JT_AT[2], t, {
    rot: JT_ROT, seal, sealGlow: decay(t, c.sealed + 0.5, 3), fluid: fl, slide: 26 * glide * Math.sin((t - c.slippery) * 9.5),
    gas: ramp(t, c.dissolved - 0.08, c.dissolved + 0.35),
  });
  screenSpace();
  // labels, one at a time, each on its beat
  const k2 = springStep(t - c.slippery - 0.06, 5, 0.5) * (1 - ramp(t, c.dissolved - 0.2, c.dissolved - 0.06));
  const k3 = springStep(t - c.dissolved - 0.04, 5, 0.5);
  inLabel(540, 524, 'JOINT FLUID', '#FFD447', k2, toScreen(cam, J.pocket[0], J.pocket[1]), 58);
  inLabel(540, 524, 'DISSOLVED GAS', '#BFF0FF', k3, toScreen(cam, J.pocket[0] + 10, J.pocket[1] - 50), 58);
  const ms = toScreen(cam, J.mid[0], J.mid[1]);
  return { glow: 0.72, flash: 0.26 * (1 - ramp(lt, 0, 0.1)), zblur: 0.14 * (1 - ramp(lt, 0, 0.18)), zcx: ms[0], zcy: ms[1] };
};

// ---------------------------------------------------------------- 5. pull: pulled apart, the pressure falls, POP: a bubble
SC.pull = (lt, t, shot) => {
  const c = cu();
  inBg();
  const cam = camKeys(t, [[shot.start, 540, 820, 0.84], [c.pressure, 540, 806, 0.82], [c.pop - 0.04, 540, 800, 0.86], [c.pop + 0.12, 540, 800, 0.82], [c.bubble + 0.1, 540, 800, 1.06], [shot.end, 540, 798, 1.12]], E.inOutCubic);
  const hit = t - c.pop;
  const [qx, qy] = shake(t, 22 * decay(t, c.pop, 6) + 3 * ramp(t, c.drops, c.pop) * (hit < 0 ? 1 : 0), 30, 6);
  cam.sx = qx; cam.sy = qy;
  applyCam(cam);
  const open = 0.74 * ramp(t, c.stretch + 0.04, c.stretch_end, E.inOutCubic) + 0.26 * ramp(t, c.drops, c.pop - 0.02, E.inCubic) - 0.1 * ramp(t, c.pop + 0.05, c.pop + 0.5, E.inOutSine);
  const J = jointSection(ctx, gctx, JT_AT[0], JT_AT[1], JT_AT[2], t, {
    rot: JT_ROT, open, gas: 1 - ramp(t, c.pop - 0.02, c.pop + 0.05), gather: ramp(t, c.drops, c.pop, E.inCubic),
    bub: hit >= 0 ? springStep(hit, 6, 0.4) : 0,
  });
  // the finger is pulled away from the hand: two arrows ride up with its bone
  const ak = ramp(t, c.stretch - 0.02, c.stretch + 0.16) * (1 - ramp(t, c.pop - 0.05, c.pop + 0.1));
  bigArrow(J.cup[0], J.cup[1] - 26 - 16 * Math.sin(t * 9), 1.5, -Math.PI / 2, ak);
  const ms = toScreen(cam, J.mid[0], J.mid[1]);
  screenSpace();
  // the gauge: its needle falls on "drops"
  const gk = springStep(t - c.pressure + 0.22, 4.5, 0.55) * (1 - ramp(t, c.a_bubble - 0.1, c.a_bubble + 0.1));
  const lvl = lerp(0.92, 0.08, ramp(t, c.drops - 0.06, c.drops_end - 0.1, E.inOutCubic)) - 0.06 * ramp(t, c.and_pop, c.pop);
  pressureGauge(846, 590, 108, gk, lvl, t);
  popRing(ms[0], ms[1], hit, 40, 330, '#FFFFFF', 12);
  shockLines(ms[0], ms[1], 120, inv(0, 0.4, hit), 14, '#FFFFFF', 8);
  burstWord(300, 600, hit, 'POP!', { s: 0.78, size: 170, w: 236, h: 132 });
  inLabel(540, 1196, 'A GAS BUBBLE', '#7FE9FF', springStep(t - c.bubble + 0.04, 5, 0.5), [ms[0], ms[1] + 84 * cam.zoom], 54);
  return { glow: 0.74, flash: 0.2 * (1 - ramp(lt, 0, 0.08)) + 0.34 * decay(t, c.pop, 12), zblur: 0.1 * decay(t, c.pop, 14), zcx: ms[0], zcy: ms[1] };
};

// two people watching the monitor, from behind (screen space): k = how startled they are
function watchers(t, k) {
  const c = ctx;
  for (const [x, y, r, bun, sd] of [[214, 1716, 150, true, 1], [862, 1744, 160, false, 2]]) {
    const up = 30 * k * Math.abs(Math.cos(t * 9 + sd)) + 4 * Math.sin(t * 1.3 + sd);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y - up);
    c.fillStyle = '#2A3550';                                              // a white coat, in the monitor's light
    c.beginPath(); c.ellipse(0, 330, 290, 240, 0, 0, 7); c.fill();
    line(c, -60, 100, 0, 210, 9, '#4A5878'); line(c, 60, 100, 0, 210, 9, '#4A5878');
    c.fillStyle = '#121A2C';
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    for (const s2 of [-1, 1]) { c.beginPath(); c.ellipse(s2 * (r + 4), 16, 20, 30, 0, 0, 7); c.fill(); }
    if (bun) { c.beginPath(); c.arc(-24, -r - 22, 60, 0, 7); c.fill(); }
    c.lineWidth = 7; c.strokeStyle = 'rgba(150,205,245,0.75)'; c.beginPath(); c.arc(0, 0, r, -2.7, -0.4); c.stroke();
    if (bun) { c.beginPath(); c.arc(-24, -r - 22, 60, -2.9, -0.6); c.stroke(); }
    c.restore();
  }
}

// ---------------------------------------------------------------- 6a. mri: the experiment: his hand in a scanner, a cable on one finger
const FACE_MRI = Object.assign({}, FACES.nervous, { lookX: 0.95, lookY: 0.2, mouth: 'wavy', mouthOpen: 0.3, browY: 1.1, browTilt: 1.1 });
const FACE_WINCE = Object.assign({}, FACES.nervous, { lookX: 0.9, lookY: 0.3, mouth: 'grimace', mouthOpen: 1, eyeOpen: 0.95, blink: 0.4, browY: 0.6, browTilt: 1.5 });
SC.mri = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // the winch winds in steps: click, click, click ... and once more in the pause after "MRI..."
  const steps = c.winch;
  let turn = 0, kick = 0;
  steps.forEach((tk) => { turn += ramp(t, tk, tk + 0.16, E.outBack); kick += decay(t, tk, 12); });
  const pull = clamp(turn / steps.length);
  const cam = camKeys(t, [[shot.start, 548, 900, 1.04], [c.mri, 590, 904, 1.14], [shot.end, 622, 910, 1.22]], E.inOutSine);
  const [qx, qy] = shake(t, 5 * kick, 30, 14);
  cam.sx = qx; cam.sy = qy;
  mriRoomBack(cam, t);
  const face = lerpFace(FACE_MRI, FACE_WINCE, clamp(0.25 * pull + 0.75 * ramp(t, c.mri, c.mri + 0.3)));
  mriHero(cam, t, { face: Object.assign({}, face, { blink: Math.max(face.blink || 0, blinkAt(t, 3, 2.0)) }), wince: pull, headRot: 0.05 + 0.03 * pull, headDX: 3 * kick, jit: 3 * kick });
  mriFront(cam, t, { pull, turn: turn * 1.1, jit: 2 * kick });
  const ws = toScreen(cam, MR.winch[0], MR.winch[1]);
  screenSpace();
  for (const [i, tk] of steps.entries()) denTick(ws[0] + 60, ws[1] - 30, t - tk, cam.zoom * 1.6, i + 1, i === 5 ? 'click' : '');
  return { glow: 0.74, flash: 0.22 * (1 - ramp(lt, 0, 0.08)), zblur: 0.12 * ramp(t, shot.end - 0.14, shot.end, E.inCubic), zcx: toScreen(cam, MR.win[0] + 160, MR.win[1] + 100)[0], zcy: toScreen(cam, MR.win[0] + 160, MR.win[1] + 100)[1] };
};

// ---------------------------------------------------------------- 6b. scan: the scan and the sound: the bubble arrives on the crack
SC.scan = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const bg = ctx.createRadialGradient(540, 760, 80, 540, 900, 1300); bg.addColorStop(0, '#101A2C'); bg.addColorStop(1, '#03050A');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const SPIKE = 0.47;
  const hit = t - c.on_crack;
  // after the first pass the clip plays the moment again, like a loop
  const loopT = hit > 1.0 ? (hit - 1.0) % 0.9 : -1;
  const rep = loopT >= 0;
  const clip = rep ? ramp(loopT, 0, 0.34, E.inCubic) : 0.55 + 0.25 * ramp(t, shot.start, c.on_crack - 0.02, E.inOutSine) + 0.2 * ramp(t, c.right, c.on_crack, E.inCubic);
  const bub = rep ? (loopT >= 0.34 ? springStep(loopT - 0.34, 7, 0.45) : 0) : (hit >= 0 ? springStep(hit, 6.5, 0.42) : 0);
  const head = rep ? lerp(SPIKE - 0.2, SPIKE + 0.3, loopT / 0.9) : (hit < 0 ? lerp(0.05, SPIKE, ramp(t, shot.start - 0.1, c.on_crack, (x) => x)) : lerp(SPIKE, SPIKE + 0.36, ramp(hit, 0, 1.0, E.outCubic)));
  const fl = rep ? decay(loopT, 0.34, 9) : decay(t, c.on_crack, 9);
  const M = mriMonitor(t, { clip, bub, head, spike: SPIKE, hit: 1, flash: fl });
  // the bubble and the spike line up: one dashed line through both
  const tk = rep ? (loopT >= 0.34 ? 1 : 0.35) : springStep(hit - 0.02, 6, 0.6);
  if (hit >= 0) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(tk);
    ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 60;
    line(ctx, M.spikeX, M.bubble[1] + 70, M.spikeX, M.stripY - 44, 5, '#4DFFB4');
    ctx.setLineDash([]); ctx.restore();
    popRing(M.bubble[0], M.bubble[1], rep ? loopT - 0.34 : hit, 30, 200, '#FFFFFF', 8);
  }
  const lk = springStep(hit - 0.12, 5, 0.5);
  inLabel(M.bubble[0] + 190, MRI.y + 128, 'BUBBLE', '#7FE9FF', lk, [M.bubble[0] + 44, M.bubble[1] - 40], 48);
  inLabel(M.spikeX + 196, M.stripTop - 50, 'CRACK', '#FFD447', lk, [M.spikeX + 26, M.stripY - 30], 48);
  // the control desk under it: a lit edge, a row of buttons, two small scopes
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const dg = ctx.createLinearGradient(0, 1548, 0, 1920); dg.addColorStop(0, '#1A2740'); dg.addColorStop(1, '#070B14');
  ctx.fillStyle = dg; ctx.fillRect(0, 1548, W, 380);
  ctx.fillStyle = 'rgba(150,205,245,0.5)'; ctx.fillRect(0, 1548, W, 5);
  for (let i = 0; i < 9; i++) {
    const on2 = (Math.floor(t * 3 + i * 0.7) + i) % 3 === 0, col = ['#4DFFB4', '#FFD447', '#FF5A6E'][i % 3];
    circle(ctx, 412 + i * 32, 1596, 10, on2 ? col : '#2A3550');
    if (on2) softDot(gctx, 412 + i * 32, 1596, 30, col, 0.5);
  }
  ctx.restore();
  watchers(t, decay(t, c.on_crack, 2.4));
  return { glow: 0.7, flash: 0.24 * (1 - ramp(lt, 0, 0.1)), zblur: 0.14 * (1 - ramp(lt, 0, 0.16)), zcx: 540, zcy: 780, push: { k: 1 + 0.045 * lt / D, cx: 540, cy: 780 } };
};
