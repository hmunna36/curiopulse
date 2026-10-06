// Why Does Spicy Food BURN? Short: the shots inside him. 3. alarm (the chilli pulls a fire alarm that stands on his
// tongue), 4. sensor (the tongue in section: heat alarms on the nerve endings; scalding soup sets them off), 5. key (no
// heat now: the chilli's molecule slides into the keyway and turns), 6. brain (FIRE on the brain's screen; it pulls the
// sprinkler lever). Worlds: mouth.js, brainy.js (from the pins-and-needles Short). Every beat is a cue.
'use strict';

// ---------------------------------------------------------------- 3. alarm: "That chilli just pulled your fire alarm."
SC.alarm = (lt, t, shot) => {
  const c = cu();
  const ring = ramp(t, c.ring, c.ring + 0.08);
  const walk = ramp(t, shot.start, c.pull - 0.26, E.outCubic);          // the chilli struts in
  const reach = ramp(t, c.pull - 0.34, c.pull - 0.06, E.outCubic), pull = ramp(t, c.pull, c.pull + 0.16, E.inCubic);
  const [qx, qy] = shake(t, 8 * ring * (0.35 + 0.65 * decay(t, c.ring, 3)), 30, 5);
  const cam = camKeys(t, [[shot.start, 524, 850, 1.05], [c.pull, 596, 812, 1.26], [shot.end, 612, 800, 1.36]], E.inOutCubic);
  cam.sx = qx; cam.sy = qy;
  caveBack(cam, t, { red: ring * (0.45 + 0.55 * Math.sin(t * 24)), shake: ring });
  const BX = 712, BY = 736, gs = 1.22, gx = lerp(150, 498, walk), gy = caveTongueY(gx) + 6;
  heatAlarm(BX, BY, 1, t, { post: caveTongueY(BX) - (BY + 130), pulled: pull, ring });
  const hy = 34 + 52 * E.outBack(pull, 1.4) + 13;                         // the handle's bar, in the box's own units
  const grab = [(BX - 42 - gx) / gs, (BY + hy - gy) / gs];
  const after = ramp(t, c.ring + 0.25, c.ring + 0.5, E.inOutCubic);       // it turns to us, very pleased with itself
  chilliGuy(ctx, gx, gy - 8 * Math.abs(Math.sin(t * 13)) * (1 - walk), gs, t, {
    step: walk < 1 ? t * 13 : undefined, mood: ring > 0.5 ? 'evil' : 'smug', look: [lerp(0.9, 0, after), lerp(-0.2, 0, after)],
    armR: [lerp(66, grab[0], reach), lerp(-104, grab[1], reach)], armRFront: true, armL: [-66 - 8 * after, -104 + 60 * Math.sin(Math.PI * after) * 0],
    lean: 0.08 * reach * (1 - pull) - 0.04 * pull,
  });
  // the word the bell shouts, once
  const ws = toScreen(cam, BX - 150, BY - 250);
  screenSpace();
  const rk = springStep(t - c.ring, 5.5, 0.42) * (1 - ramp(t, c.ring + 0.62, c.ring + 0.82));
  if (rk > 0.01) bigWord('RIIING!', clamp(ws[0], 330, 700), Math.max(ws[1], 500), 104, '#FFD447', rk * (1 + 0.04 * Math.sin(t * 40)), -0.1);
  return { glow: 0.85, flash: 0.26 * (1 - ramp(lt, 0, 0.1)) + 0.12 * decay(t, c.ring, 10), zblur: 0.3 * (1 - ramp(lt, 0, 0.22)), zcx: 540, zcy: 800 };
};

// a small label with a dotted leader (screen space). to = the point it names
function inLabel(x, y, text, col, k, size, to) {
  if (k <= 0.01) return;
  if (to) leader([x, y + size * 0.9], to, clamp(k * 1.6), col);
  pill(x, y, text, col, k, size);
}

// ---------------------------------------------------------------- 4. sensor: "Your tongue has sensors for real heat... like scalding soup."
SC.sensor = (lt, t, shot) => {
  const c = cu();
  const cam = camKeys(t, [[shot.start, 540, 1030, 1.3], [c.sensors, 540, 1004, 1.15], [c.spoon - 0.25, 540, 996, 1.12], [c.spoon + 0.3, 548, 860, 0.99], [shot.end, 556, 846, 1.03]], E.inOutCubic);
  const drop = ramp(t, c.spoon, c.spoon + 0.42, E.outBack), heat = ramp(t, c.spoon + 0.16, c.scald + 0.1);
  const order = [0.3, 0, 0.16];                                           // the middle one first, then the right, then the left
  const al = order.map((d) => {
    const g = ramp(t, c.scald - 0.1 + d, c.scald + 0.16 + d, E.outBack), on = t >= c.scald + 0.12 + d ? 1 : 0;
    return { gauge: clamp(g), ring: on, pulled: ramp(t, c.scald + 0.12 + d, c.scald + 0.24 + d) };
  });
  const any = Math.max(...al.map((a) => a.ring));
  const [qx, qy] = shake(t, 4 * any, 30, 6);
  cam.sx = qx; cam.sy = qy;
  const sx = lerp(980, 606, drop), sy = lerp(60, 520, drop);
  tongueScene(cam, t, {
    heat, alarms: al,
    pulses: () => order.forEach((d, i) => moPulses(i, t, c.scald + 0.14 + d, 5, 0.17)),
  });
  if (drop > 0.01) { heatRays(sx - 8, sy + 62, MO.surfY - 6, 500, t, heat); soupSpoon(sx, sy, 1, -0.06 + 0.5 * (1 - drop), t, 0.5 + 0.5 * heat); }
  // the labels: what the red boxes are, then what sets them off
  const top = toScreen(cam, MO.boxes[1][0], MO.boxes[1][1] - 150 * MO.bs);
  const out = 1 - ramp(t, c.spoon - 0.1, c.spoon + 0.12);
  screenSpace();
  inLabel(540, top[1] - 250, 'HEAT SENSOR', '#FFD447', springStep(t - c.sensors + 0.04, 4.5, 0.5) * out, 62, [top[0], top[1] - 8]);
  const k2 = springStep(t - c.heat + 0.02, 5, 0.5) * out;
  if (k2 > 0.01) pill(540, top[1] - 150, 'ALARM AT 43°C', '#FF9A3C', k2, 40);
  if (heat > 0.5) { const ss = toScreen(cam, sx - 250, sy - 30); pill(clamp(ss[0], 250, 800), ss[1], '80°C', '#FF9A3C', springStep(t - c.scald + 0.2, 5, 0.5), 54); }
  return { glow: 0.85, flash: 0.2 * (1 - ramp(lt, 0, 0.08)) + 0.1 * decay(t, c.scald + 0.12, 10), zblur: 0.14 * (1 - ramp(lt, 0, 0.2)), zcx: 540, zcy: 900 };
};

// a torn piece of the chilli, with its seeds, up in the corner where the keys come from
function chilliChunk(x, y, s, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(-0.3 + 0.03 * Math.sin(t * 1.7)); c.scale(s, s);
  c.beginPath(); c.moveTo(-170, -70); c.bezierCurveTo(-60, -130, 90, -110, 170, -30); c.lineTo(150, 6); c.lineTo(120, -8); c.lineTo(96, 32); c.lineTo(60, 10); c.lineTo(30, 52); c.lineTo(-10, 24); c.lineTo(-44, 60); c.lineTo(-80, 26); c.lineTo(-120, 50); c.bezierCurveTo(-170, 20, -190, -30, -170, -70); c.closePath();
  const g = c.createLinearGradient(0, -120, 0, 60); g.addColorStop(0, '#FF5F4C'); g.addColorStop(0.5, '#E3182B'); g.addColorStop(1, '#A01222'); c.fillStyle = g; c.fill();
  c.lineWidth = 9; c.strokeStyle = '#FFB59A'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(150, 6); c.lineTo(120, -8); c.lineTo(96, 32); c.lineTo(60, 10); c.lineTo(30, 52); c.lineTo(-10, 24); c.lineTo(-44, 60); c.lineTo(-80, 26); c.lineTo(-120, 50); c.stroke();
  for (const [px, py] of [[-70, -10], [-20, -20], [40, -18], [90, -28]]) ellipse(c, px, py, 11, 7, '#FFF1C8', 0.5);
  c.restore();
}

// ---------------------------------------------------------------- 5. key: "A chilli molecule fits them... like a key."
SC.key = (lt, t, shot) => {
  const c = cu(), ks = 1.15, kx = MO.boxes[1][0] + MO.keyX * MO.bs, top = MO.boxes[1][1] - 152 * MO.bs;
  const fly = ramp(t, shot.start + 0.1, c.fits - 0.12, E.inOutCubic), ins = ramp(t, c.fits, c.fits + 0.3, E.inOutCubic);
  const turn = ramp(t, c.turn + 0.06, c.click, E.inOutCubic), on = t >= c.click ? 1 : 0;
  const follow = ramp(t, shot.end - 0.3, shot.end, E.inCubic);          // the camera goes down the nerve after the signal
  const cam = camKeys(t, [[shot.start, 470, 800, 1.0], [c.molecule, 500, 800, 1.14], [c.fits - 0.1, 566, 876, 1.56], [c.click, 566, 884, 1.66], [shot.end - 0.3, 560, 904, 1.58], [shot.end, 540, 1560, 1.3]], E.inOutCubic);
  const [qx, qy] = shake(t, 9 * decay(t, c.click, 5), 30, 8);
  cam.sx = qx; cam.sy = qy;
  // the key: out of the chilli, over to the keyway, down into it
  const hover = [kx, top - 34], from = [250, 520];
  const bob = 8 * Math.sin(t * 5) * (1 - ins);
  const tip = [lerp(from[0], hover[0], fly) + 60 * Math.sin(Math.PI * fly), lerp(from[1], hover[1], fly) - 90 * Math.sin(Math.PI * fly) + bob + 84 * ins];
  const rot = lerp(-1.0, 0, E.outCubic(fly)) + 0.06 * Math.sin(t * 4) * (1 - ins);
  const side = [[0, 0.5], [2, 0.74]].map(([i, d]) => ({ i, d, k: ramp(t, c.click + d - 0.34, c.click + d, E.inOutCubic) }));
  const al = [0, 1, 2].map((i) => {
    if (i === 1) return { gauge: 0.04, ring: on, pulled: ramp(t, c.click, c.click + 0.12) };
    const sdk = side.find((q) => q.i === i).k;
    return { gauge: 0.04, ring: sdk >= 1 ? 1 : 0, pulled: sdk >= 1 ? 1 : 0 };
  });
  tongueScene(cam, t, {
    cool: 1 - 0.5 * on, alarms: al,
    pulses: () => { moPulses(1, t, c.click + 0.03, 10, 0.14); side.forEach((q) => { if (q.k >= 1) moPulses(q.i, t, c.click + q.d + 0.03, 6, 0.16); }); },
    keys: () => {
      for (const q of side) {            // the other two keys, a moment later
        const bx = MO.boxes[q.i][0] + MO.keyX * MO.bs, drift = 6 * Math.sin(t * 4 + q.i);
        capKey(lerp(bx + (q.i ? 190 : -150), bx, E.outCubic(clamp(q.k * 1.4))), lerp(top - 250, top - 30, clamp(q.k * 1.4)) + drift * (1 - q.k) + 78 * ramp(q.k, 0.72, 1), 0.92, lerp(q.i ? 0.9 : -0.9, 0, clamp(q.k * 1.4)), t, { turn: q.k >= 1 ? 1 : 0, glow: 0.6 });
      }
      capKey(tip[0], tip[1], ks, rot, t, { turn });
    },
  });
  chilliChunk(120, 380, 1.15, t);
  for (let i = 0; i < 4; i++) {          // more keys, still on their way out of the chilli
    const p = (t * 0.16 + i * 0.27) % 1;
    ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * p) * 0.9; capKey(170 + 230 * p + 40 * Math.sin(i * 2.1 + t), 450 + 150 * p + 60 * Math.sin(i * 1.3 + t * 0.7), 0.5, -1.0 + i * 0.5 + t * 0.5, t, { glow: 0.3 }); ctx.restore();
  }
  // labels
  const ts = toScreen(cam, tip[0], tip[1] - 122 * ks), gs = toScreen(cam, MO.boxes[1][0] + 40, MO.boxes[1][1] - 42 * MO.bs);
  screenSpace();
  const lk = springStep(t - c.molecule + 0.04, 4.5, 0.5) * (1 - ramp(t, c.fits + 0.25, c.fits + 0.5));
  if (lk > 0.01) pill(clamp(ts[0] + 210, 300, 760), Math.max(ts[1] - 70, 470), 'CAPSAICIN', '#FF9A3C', lk, 46);
  const ck = springStep(t - c.click - 0.02, 5.5, 0.42) * (1 - ramp(t, c.click + 0.55, c.click + 0.75)) * (1 - follow);
  if (ck > 0.01) bigWord('CLICK!', 300, Math.max(toScreen(cam, kx, top - 250)[1], 520), 110, '#FFD447', ck, -0.1);
  const nk = springStep(t - c.click - 0.22, 5, 0.5) * (1 - follow);
  if (nk > 0.01) inLabel(812, gs[1] - 40, 'NO HEAT', '#7FE9FF', nk, 50, [gs[0] + 20, gs[1]]);
  return { glow: 0.85, flash: 0.22 * (1 - ramp(lt, 0, 0.09)) + 0.14 * decay(t, c.click, 12), zblur: 0.4 * follow, zcx: 540, zcy: 1200 };
};

// ---------------------------------------------------------------- the brain's desk
// the wall screen that watches the mouth. fire 0..1 = what it shows; wait 0..1 = a signal has come in and it is working it out
function fireMonitor(x, y, w, h, t, fire, wait) {
  const c = ctx;
  screenSpace();
  rrect(c, x - 14, y - 14, w + 28, h + 28, 26); c.fillStyle = '#1A1228'; c.fill(); c.lineWidth = 6; c.strokeStyle = fire ? '#FF5A6E' : '#6A5A8A'; c.stroke();
  for (const bx of [x + 30, x + w - 30]) line(c, bx, y - 14, bx, y - 60, 8, '#3A2C55');
  c.save(); rrect(c, x, y, w, h, 16); c.clip();
  const bl = 0.5 + 0.5 * Math.sin(t * 22);
  if (fire) {
    c.fillStyle = mixHex('#5A0A0A', '#C01818', bl); c.fillRect(x, y, w, h);
    c.restore();
    fireJet(x + w * 0.2, y + h * 0.86, -Math.PI / 2, h * 0.72, w * 0.11, t, 1, 4);
    screenSpace(); c.save(); rrect(c, x, y, w, h, 16); c.clip();
    c.font = `400 ${Math.round(h * 0.5)}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = 12; c.strokeStyle = '#3A0606'; c.strokeText('FIRE!', x + w * 0.64, y + h * 0.56); c.fillStyle = bl > 0.5 ? '#FFD447' : '#FFFFFF'; c.fillText('FIRE!', x + w * 0.64, y + h * 0.56);
    c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.fillStyle = '#FFD9D9'; c.fillText('MOUTH', x + 22, y + 34);
  } else {
    c.fillStyle = '#0E3A44'; c.fillRect(x, y, w, h);
    c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#4DFFB4'; c.fillText('MOUTH', x + 22, y + 34);
    c.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, yy = y + h * 0.62 + (wait ? 34 * Math.sin(u * 30 - t * 30) * wait : 5 * Math.sin(u * 14 - t * 4)); i ? c.lineTo(x + u * w, yy) : c.moveTo(x + u * w, yy); }
    c.lineWidth = 6; c.strokeStyle = wait ? '#FFD447' : '#4DFFB4'; c.stroke();
    c.font = `400 ${Math.round(h * 0.3)}px Anton`; c.textAlign = 'right'; c.fillStyle = wait ? (bl > 0.5 ? '#FFD447' : 'rgba(255,212,71,0.4)') : '#4DFFB4';
    c.fillText(wait ? 'INCOMING' : 'ALL OK', x + w - 24, y + h * 0.3);
  }
  for (let yy = 0; yy < h; yy += 6) { c.fillStyle = 'rgba(0,0,10,0.16)'; c.fillRect(x, y + yy, w, 2); }
  c.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, x, y, w, h, 16); gctx.fillStyle = fire ? rgba('#FF3A2A', 0.3 + 0.25 * bl) : rgba(wait ? '#FFD447' : '#4DFFB4', 0.18); gctx.fill();
  if (fire) softDot(gctx, x + w / 2, y + h / 2, w * 1.1, '#FF2A1E', 0.3 * bl);
  gctx.restore();
}
// the sprinkler lever on the wall. pull 0..1; returns where its knob is (screen)
function sprLever(x, y, w, h, t, pull) {
  const c = ctx, on = pull >= 1;
  screenSpace();
  rrect(c, x, y, w, h, 22); const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#5E6884'); g.addColorStop(1, '#2E3550'); c.fillStyle = g; c.fill(); c.lineWidth = 6; c.strokeStyle = '#1A1E34'; c.stroke();
  for (const [bx, by] of [[x + 20, y + 20], [x + w - 20, y + 20], [x + 20, y + h - 20], [x + w - 20, y + h - 20]]) circle(c, bx, by, 7, '#AEB9CE');
  c.font = '400 37px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = on ? '#7FE9FF' : '#DCE6F8'; c.fillText('SPRINKLERS', x + w / 2, y + 62);
  const s0 = y + 112, s1 = y + h - 118, cx = x + w / 2;
  rrect(c, cx - 17, s0 - 20, 34, s1 - s0 + 40, 17); c.fillStyle = '#12152A'; c.fill();
  const ky = lerp(s0, s1, E.outBack(clamp(pull), 1.3));
  line(c, cx, (s0 + s1) / 2, cx, ky, 15, '#C9D2E4');
  circle(c, cx, ky, 37, '#7A0E1A'); const kg = c.createRadialGradient(cx - 10, ky - 12, 4, cx, ky, 36); kg.addColorStop(0, '#FF9A8A'); kg.addColorStop(1, '#D8232F'); c.fillStyle = kg; c.beginPath(); c.arc(cx, ky, 32, 0, 7); c.fill();
  // the water drop under it lights up
  const dy = y + h - 54;
  c.beginPath(); c.moveTo(cx, dy - 28); c.bezierCurveTo(cx + 18, dy - 4, cx + 16, dy + 16, cx, dy + 16); c.bezierCurveTo(cx - 16, dy + 16, cx - 18, dy - 4, cx, dy - 28);
  c.fillStyle = on ? '#7FE9FF' : '#3A4466'; c.fill();
  if (on) { gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, cx, dy, 90, '#7FE9FF', 0.8); rrect(gctx, x, y, w, h, 22); gctx.lineWidth = 12; gctx.strokeStyle = rgba('#7FE9FF', 0.5); gctx.stroke(); gctx.restore(); }
  return [cx, ky];
}
// a coffee mug (screen space)
function brainMug(x, y, s, rot) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.arc(-34, 4, 20, Math.PI * 0.5, Math.PI * 1.5); c.lineWidth = 10; c.strokeStyle = '#E8E0F4'; c.stroke();
  rrect(c, -30, -34, 62, 72, 12); c.fillStyle = '#F4EEFF'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#8A7AA8'; c.stroke();
  ellipse(c, 1, -30, 26, 7, '#5A3420');
  c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#D8232F'; c.fillText('#1', 2, 8);
  c.restore();
}

// ---------------------------------------------------------------- 6. brain: "So your brain hears FIRE... and turns on the sprinklers."
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const fire = t >= c.brain_fire ? 1 : 0, wait = fire ? 0 : ramp(t, c.hears - 0.25, c.hears - 0.05);
  const jump = decay(t, c.brain_fire, 5) * Math.abs(Math.cos((t - c.brain_fire) * 13));
  const reach = ramp(t, c.lever - 0.34, c.lever - 0.04, E.inOutCubic), pull = ramp(t, c.lever, c.lever + 0.17, E.inCubic);
  const BX = 452, BY = 1012, BS = 1.12;
  brainRoom(t);
  // the nerve comes up through the floor into the screen, and the signal with it
  const cable = moDense([[-40, 1010], [70, 960], [40, 800], [96, 700], [150, 640]], 10), acc = polyLen(cable), L = acc[acc.length - 1];
  screenSpace();
  poly(ctx, cable, 24, '#8A4A08'); poly(ctx, cable, 16, '#E89A22'); poly(ctx, cable, 5, '#FFE9A8');
  for (let k = 0; k < 6; k++) { const d = (lt - k * 0.13) * 900; if (d > 0 && d < L) { const p = polyAt(cable, acc, d); circle(ctx, p[0], p[1], 13, '#FFF6C8'); gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, p[0], p[1], 64, '#FFC44A', 0.95); gctx.restore(); } }
  fireMonitor(128, 478, 452, 280, t, fire, wait);
  const knob = sprLever(716, 520, 232, 470, t, pull);
  // the brain: coffee, then panic, then the lever
  const lx = (knob[0] - BX) / BS, ly = (knob[1] - (BY - 30 * jump)) / BS;
  const armR = fire ? [lerp(196 + 14 * Math.sin(t * 31), lx, reach), lerp(-150 + 12 * Math.cos(t * 27), ly, reach)] : [176, 118];
  const armL = fire ? [-196 + 14 * Math.sin(t * 29 + 1), -146 + 12 * Math.cos(t * 33)] : [-178, 56 + 5 * Math.sin(t * 3)];
  screenSpace();
  brainGuy(BX, BY - 30 * jump, BS, t, { mood: fire ? (pull >= 1 ? 'squint' : 'worried') : 'calm', look: fire ? [reach > 0.3 ? 0.9 : -0.6, reach > 0.3 ? -0.3 : -0.9] : [-0.5, -0.7 - 0.3 * wait], armL, armR, sweat: fire, lean: 0.05 * reach });
  // its mug: in its hand, then in the air
  screenSpace();
  if (!fire) brainMug(BX + (armL[0] - 16) * BS, BY + (armL[1] - 30) * BS + 5 * Math.sin(t * 2.4), 1.05, -0.08);
  else { const d = t - c.brain_fire; if (d < 1.1) { brainMug(BX - 216 * BS - 150 * d, BY + 26 * BS - 760 * d + 1300 * d * d, 1.05, -0.08 - d * 9); splashDrops(BX - 216 * BS - 20, BY - 20, c.brain_fire, t, 12, 4, 0.5); } }
  brainDesk(1158, t);
  screenSpace();
  shockLines(BX, BY - 20, 250, inv(c.brain_fire, c.brain_fire + 0.45, t), 14, '#FFFFFF', 4);
  const [qx, qy] = shake(t, 10 * decay(t, c.brain_fire, 5) + 8 * decay(t, c.lever + 0.17, 7), 30, 12);
  return { glow: 0.85, capY: 1400, push: { k: 1.02 + 0.05 * lt / D, cx: 540 + qx, cy: 820 + qy }, flash: 0.24 * (1 - ramp(lt, 0, 0.09)) + 0.16 * decay(t, c.brain_fire, 11), zblur: 0.3 * (1 - ramp(lt, 0, 0.18)), zcx: 150, zcy: 700 };
};
