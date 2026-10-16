// What If You Went to Space WITHOUT a Suit? — the shots, act 2: out cold. Ball can't fly, his sister launches, he swells
// with his chip bag (it bursts without a sound), the viewer's pinch, Kittinger's hand in 1960, LeBlanc's chamber in
// 1966, his gut, his heart. All through it, a small round window keeps his sister's run in sight (the long loop).
'use strict';

// ---------------------------------------------------------------- his sister's run, in a small round window (screen space)
// k pops it; it shows the corridor rushing past and her flying toward us, with a label
function sisInset(t, k, x = 1640, y = 250, r = 150) {
  if (k <= 0.01) return;
  const R = r * E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
  ctx.translate(x - 960 * (R / 520), y - 520 * (R / 520)); ctx.scale(R / 520, R / 520);
  gctx.save(); gctx.beginPath(); gctx.arc(x / 2, y / 2, R / 2, 0, 7); gctx.clip();
  corridorMini(t);
  gctx.restore();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.lineWidth = 9; ctx.strokeStyle = '#FF9A3C'; ctx.stroke();
  softDot(gctx, x, y, R * 1.3, '#FF9A3C', 0.3 * k);
  pill(x, y + R + 36, 'HIS SISTER', '#FF9A3C', k, 34);
}
// the corridor and her, drawn into the inset's own transform (a 1920 x 1040 field squeezed into the circle)
function corridorMini(t) {
  const cx = 960, cy = 520;
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 900); g.addColorStop(0, '#FFE2B8'); g.addColorStop(0.3, '#C9CFDD'); g.addColorStop(1, '#3C4562');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1040);
  for (let i = 7; i >= 0; i--) {
    const z = ((i - t * 2.2) % 8 + 8) % 8 + 0.35, sc = 1 / z, a = clamp(1.4 - z * 0.15);
    ctx.beginPath(); ctx.ellipse(cx, cy, 1100 * sc, 760 * sc, 0, 0, 7); ctx.lineWidth = Math.max(2, 70 * sc); ctx.strokeStyle = `rgba(150,160,190,${0.8 * a})`; ctx.stroke();
    softDot(ctx, cx + 600 * sc, cy - 520 * sc, 200 * sc, '#FF2A3A', 0.6 * a * (0.5 + 0.5 * Math.sin(t * 10 + i)));
  }
  const st = { x: 960, y: 1010 + 10 * Math.sin(t * 3), s: 0.95, face: FACES.stern, seed: 3,
    pose: { hipY: -222, lean: 0, armL: { a: 2.7, b: 0.2 }, armR: { a: 2.6, b: 0.3 }, legL: { a: 0.06, b: -0.3 }, legR: { a: 0.1, b: -0.45 }, hand: 'open', feetFront: 1 } };
  drawCharacter(ctx, st, t, SISPAL); sisHair(ctx, st);
  for (let i = 0; i < 10; i++) { const a = i * 0.63, r0 = 380, r1 = 700; line(ctx, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 8, 'rgba(255,255,255,0.4)'); }
}
// when the inset is up: from her launch to the moment she is at the airlock's window
const sisOn = (t) => ramp(t, cue('sisGo') + 1.5, cue('sisGo') + 1.9) * (1 - ramp(t, cue('sisWin') - 0.3, cue('sisWin')));

// "He's out. Not dead... out. And now, a different clock starts." the airlock, wide: he floats limp in front of the
// open hatch; a heart pulses on his chest on "Not dead"; on "a different clock starts" a cut to a big stopwatch, its
// hand already past fifteen, the danger arc red ahead of it (the rescue window)
SC.turn = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  if (t >= c.newClock - 0.1) {
    darkBg('#2A0A14', '#08020A'); screenSpace();
    const secs = 15 + 1.0 * clamp((t - c.newClock) / 3);
    bigStopwatch(960, 520, 1.25 + 0.04 * (t - c.newClock), t, secs, ramp(t, c.newClock - 0.1, c.newClock + 0.25));
    stampWord('UNCONSCIOUS', 960, 120, 80, '#FF5A6E', ramp(t, c.newClock + 0.3, c.newClock + 0.6), 0);
    return inPost({ flash: 0.3 * kickAt(t, c.newClock - 0.1, 8) });
  }
  const cam = mixCam({ x: 1300, y: 520, zoom: 1.35, rot: 0 }, headCam(S, 1.9, 900, 420), ramp(t, c.notDead - 0.3, c.notDead + 0.4, E.inOutCubic));
  alScene(cam, t, S, { after: (cm, res, h) => {
    const hb = ramp(t, c.notDead, c.notDead + 0.3);
    if (hb > 0.01) { const P = alPt(h, [16, -330]), b = beatAt(t, 70, c.notDead); ctx.save(); ctx.translate(P[0], P[1]); ctx.scale(1 + 0.25 * b, 1 + 0.25 * b); heartShape(ctx, 34, 0); ctx.fillStyle = rgba('#FF4A5E', hb); ctx.fill(); ctx.restore(); softDot(gctx, P[0], P[1], 90, '#FF4A5E', 0.6 * hb * (0.5 + b)); }
  } });
  return alPost();
};
// "Ball, the camera drone, wants to help. But its fans need air to push against. Right now, Ball is just... a ball."
// three framings: Ball, close, narrowing its eyes and spinning its fans flat out (nothing happens); the fans
// full-frame, side by side, in air (beads blown along: it moves) and in space (nothing to push); Ball again, eyes flat,
// drifting: JUST A BALL
SC.ball = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const B = S.ball;
  if (t >= c.fans - 0.1 && t < c.justBall - 0.35) {
    darkBg('#0E1A33', '#03060F'); screenSpace();
    const fk = ramp(t, c.fans - 0.1, c.fans + 0.25);
    for (const [px, inAir, lab] of [[620, true, 'IN AIR'], [1300, false, 'IN SPACE']]) {
      ctx.save(); ctx.translate(px, 470); const k = E.outBack(fk, 1.8) * 1.6; ctx.scale(k, k);
      circle(ctx, 0, 0, 170, inAir ? 'rgba(20,40,80,0.95)' : 'rgba(5,6,15,0.95)'); ctx.lineWidth = 6; ctx.strokeStyle = inAir ? '#7FE9FF' : '#8A90B8'; ctx.beginPath(); ctx.arc(0, 0, 170, 0, 7); ctx.stroke();
      for (let i = 0; i < 3; i++) { const a = t * 30 + i * 2.09; line(ctx, -60, 0, -60 + Math.cos(a) * 56, Math.sin(a) * 56, 14, '#C8CEE0'); }
      circle(ctx, -60, 0, 14, '#5A607E');
      if (inAir) { for (let i = 0; i < 14; i++) { const ph = (t * 1.5 + i / 14) % 1; circle(ctx, -30 + 170 * ph, -70 + 140 * hash(i), 8, `rgba(127,233,255,${1 - ph})`); } }
      else { for (let i = 0; i < 5; i++) circle(ctx, 30 + 25 * i, -40 + 20 * Math.sin(i), 3, 'rgba(255,255,255,0.15)'); }
      ctx.restore();
      pill(px, 820, lab, inAir ? '#7FE9FF' : '#C8A8FF', fk, 46);
    }
    stampWord('PUSH!', 620, 160, 100, '#4DFFB4', ramp(t, c.pushAg, c.pushAg + 0.25), -0.08);
    stampWord('NOTHING', 1300, 160, 100, '#C8A8FF', ramp(t, c.pushAg + 0.25, c.pushAg + 0.5), -0.08);
    return inPost();
  }
  const late = t >= c.justBall - 0.35;
  const cam = late ? ptCam([B.x, B.y], 3.4 - 0.3 * ramp(t, c.justBall, shot.end), 960, 520) : ptCam([B.x, B.y], 3.0 + 0.2 * lt, 760, 520);
  const effort = env2(t, c.ballW + 0.6, c.fans - 0.1, 0.3);
  alScene(cam, t, S, { noBall: true });
  applyCam(cam);
  const sh = effort * 2.5 * Math.sin(t * 60), drift = late ? 30 * (t - c.justBall) : 0;
  alBall(B.x + sh + drift, B.y + drift * 0.3, B.s, t, { mood: t > c.aBall - 0.1 ? 'flat' : (effort > 0.3 ? 'worried' : 'calm'), look: [-1, 0.4], fans: late ? 0.2 : 1 + 6 * effort, tilt: late ? 0.15 * (t - c.justBall) : -0.1 * effort });
  if (effort > 0.05) for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const ph = (t * 6 + i / 3) % 1; ctx.beginPath(); ctx.arc(B.x + sd * 52 * B.s, B.y, (20 + 40 * ph) * B.s, -0.8, 0.8); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ph) * effort})`; ctx.stroke(); }
  screenSpace();
  stampWord('JUST A BALL', 1360, 260, 120, '#FFFFFF', ramp(t, c.aBall + 0.05, c.aBall + 0.35), -0.08);
  return alPost();
};
// "Down the hall, the alarm reaches his big sister, the commander. She's been rescuing him since he was four." the
// corridor, red: her face as she hears it; she launches toward us; a polaroid pops: the two of them as kids
SC.sister = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const go = ramp(t, c.commander - 0.2, c.commander + 1.4, E.inOutCubic);
  // first her face as she hears the alarm (close, in the corridor); then she launches and flies across it, flat out,
  // arms forward like a swimmer pushing off, the camera panning with her
  if (t < c.commander - 0.1) {
    corridor(t, { k: 0.3 * t, red: 1 });
    screenSpace();
    const st = { x: 900, y: 1190 + 10 * Math.sin(t * 1.3), s: 1.55, face: t < c.sisW + 0.2 ? FACES.calm : FACES.alarmed, noLegs: true, seed: 3,
      pose: { hipY: -222, lean: 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 } };
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
    drawCharacter(lctx, st, t, SISPAL); sisHair(lctx, st);
    lctx.globalCompositeOperation = 'source-atop'; lctx.fillStyle = `rgba(255,40,60,${0.15 * (0.5 + 0.5 * Math.sin(t * 10))})`; lctx.fillRect(0, 0, W, H); lctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(layerC, 0, 0); occludeGlow();
    return alPost();
  }
  corridor(t, { k: 0.3 * t + 3.0 * go, red: 1 });
  screenSpace();
  const x = lerp(2150, 760, go), y = 800 + 30 * Math.sin(t * 3);
  const st = { x, y, s: 0.95, face: Object.assign({}, FACES.stern, { lookX: -0.9 }), seed: 3,
    pose: { hipY: -222, lean: 0, armL: { a: 2.9, b: 0.1 }, armR: { a: 2.75, b: 0.2 }, legL: { a: 0.05, b: -0.15 }, legR: { a: 0.12, b: -0.35 }, hand: 'open', feetFront: 0 } };
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  const mid = [x, y - 330 * st.s];
  lctx.translate(mid[0], mid[1]); lctx.rotate(-Math.PI / 2 + 0.08 * Math.sin(t * 2)); lctx.translate(-mid[0], -mid[1]);
  drawCharacter(lctx, st, t, SISPAL); sisHair(lctx, st);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0); occludeGlow();
  for (let i = 0; i < 12; i++) { const yy = mid[1] - 160 + i * 28, L = 200 + 260 * hash(i); line(ctx, x + 260, yy, x + 260 + L, yy, 6, `rgba(255,255,255,${0.45 * go * (0.4 + 0.6 * hash(i * 3))})`); }
  pill(960, 150, 'THE COMMANDER', '#FF9A3C', ramp(t, c.commander, c.commander + 0.3) * (1 - ramp(t, c.four - 0.5, c.four - 0.2)), 50);
  const pk = ramp(t, c.four - 0.25, c.four + 0.2);
  if (pk > 0.01) polaroidKids(1450, 520, 1.0, pk, t);
  return alPost({ flash: 0.15 * kickAt(t, c.commander + 0.2, 8) });
};
// a polaroid: her at about eight, pulling him (about four) out of a paddling pool by his collar. AGE 4.
function polaroidKids(x, y, s, k, t) {
  ctx.save(); ctx.translate(x, y); const sc = s * E.outBack(clamp(k), 1.8); ctx.scale(sc, sc); ctx.rotate(0.08);
  rrect(ctx, -230, -260, 460, 540, 10); ctx.fillStyle = '#FBF8F0'; ctx.fill();
  ctx.save(); rrect(ctx, -200, -230, 400, 380, 4); ctx.clip();
  const g = ctx.createLinearGradient(0, -230, 0, 150); g.addColorStop(0, '#9FD8FF'); g.addColorStop(1, '#BFE8B0'); ctx.fillStyle = g; ctx.fillRect(-200, -230, 400, 380);
  ellipse(ctx, 40, 110, 170, 50, '#5AB8E8'); ellipse(ctx, 40, 104, 150, 38, '#8FD8FF');                    // the paddling pool
  const big = { x: -90, y: 140, s: 0.42, face: FACES.stern, seed: 3, pose: ikReach({ hipY: -222, lean: 0.1, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0.08, b: 0 }, legR: { a: 0.08, b: 0 }, hand: 'open', feetFront: 1 }, 'R', [260, -380], 1) };
  drawCharacter(ctx, big, t, SISPAL); sisHair(ctx, big);
  const small = { x: 60, y: 120, s: 0.3, face: FACES.sheep, seed: 4, noLegs: true, pose: { hipY: -222, lean: -0.2, armL: { a: 1.6, b: 0.4 }, armR: { a: 1.6, b: 0.4 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'spread', feetFront: 1 } };
  drawCharacter(ctx, small, t, Object.assign({}, PAL, { coat: '#FFD447' }));
  ctx.restore();
  ctx.font = '700 44px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#3A3A50'; ctx.fillText('him, age 4', 0, 220);
  ctx.restore();
}
// "Second twenty. The water in his body is turning to gas. He's swelling... like his bag of chips." the airlock: he
// puffs up; beside him his bag of chips puffs too; his sister's window in the corner
SC.swell = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const a = headCam(S, 1.6, 1000, 420), b = mixCam(headCam(S, 1.6, 1000, 420), ptCam([S.chips.x, S.chips.y - 40], 2.4, 820, 520), 0.65);
  const cam = mixCam(a, b, ramp(t, c.chipsW - 0.6, c.chipsW + 0.2, E.inOutCubic));
  alScene(cam, t, S);
  screenSpace();
  tagPill('WATER → GAS', 1500, 640, ramp(t, c.gasW, c.gasW + 0.3) * (1 - ramp(t, c.chipsW - 0.6, c.chipsW - 0.3)), '#C8A8FF', 50);
  sisInset(t, sisOn(t));
  return alPost();
};
// wordless: the chip bag bursts, without a sound; chips everywhere; Ball's eyes go wide
SC.pop = (lt, t, shot) => {
  const c = cu(), S = alState(t);
  const cam = ptCam([S.chips.x, S.chips.y - 50], 2.6 + 0.4 * ramp(lt, 0, 0.9), 900, 520);
  S.ball.mood = 'shock';
  alScene(cam, t, S);
  return alPost({ flash: 0.35 * kickAt(t, c.pop, 9) });
};
// "Pinch the skin on the back of your hand. Let go. It snaps back, right? That's what's holding him together." the back
// of a hand, big: fingers pinch the skin into a tent, let go, it snaps flat with a little wobble; then him, swollen,
// his outline glowing like the skin of a balloon that holds
SC.pinch = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.together1 - 0.25) {
    darkBg('#1A2A50', '#060A18'); screenSpace();
    const up = ramp(t, c.pinch + 0.4, c.pinch + 1.1, E.inOutCubic), rel = t >= c.letgo + 0.1 ? 1 : 0;
    const tent = rel ? Math.max(0, Math.exp(-(t - c.letgo - 0.1) * 9) * Math.cos((t - c.letgo - 0.1) * 30)) * (up) : up;
    pinchHand(960, 600, 1.25 + 0.05 * lt / D, tent, rel ? 0 : up, t);
    testBadge(['TRY IT', 'PINCH YOUR HAND'], ramp(t, c.pinch, c.pinch + 0.3) * (1 - ramp(t, c.snaps + 1.2, c.snaps + 1.5)));
    stampWord('SNAP!', 1450, 330, 140, '#4DFFB4', ramp(t, c.letgo + 0.15, c.letgo + 0.4) * (1 - ramp(t, c.together1 - 0.6, c.together1 - 0.3)), 0.1);
    return inPost();
  }
  const S = alState(t);
  const cam = headCam(S, 1.45, 960, 380);
  alScene(cam, t, S, { after: (cm, res, h) => {
    const k = ramp(t, c.together1 - 0.2, c.together1 + 0.4);
    const mid = alPt(h, [0, -300]);
    for (const [cc, w, a] of [[ctx, 6, 0.9], [gctx, 22, 0.6]]) { cc.save(); cc.beginPath(); cc.ellipse(mid[0], mid[1], 250 * (1 + 0.1 * (h.swell || 0)), 330, h.rot || 0, 0, 7); cc.lineWidth = w; cc.setLineDash([22, 14]); cc.strokeStyle = rgba('#4DFFB4', a * k); cc.stroke(); cc.restore(); }
  } });
  screenSpace();
  tagPill('HIS SKIN HOLDS', 1450, 220, ramp(t, c.together1, c.together1 + 0.3), '#4DFFB4', 52);
  return alPost();
};
// the back of a hand (fingers to the right) with two fingertips coming down to pinch a tent of skin (screen space)
function pinchHand(x, y, s, tent, grip, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // the sleeve and the hand
  rrect(ctx, -620, -70, 260, 200, 60); ctx.fillStyle = '#2E4D9A'; ctx.fill();
  ctx.fillStyle = '#F2B892';
  ctx.beginPath(); ctx.moveTo(-380, -60); ctx.quadraticCurveTo(-100, -100, 120, -70); ctx.lineTo(120, 110); ctx.quadraticCurveTo(-100, 140, -380, 120); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 4; i++) { rrect(ctx, 100, -66 + i * 45, 300 - Math.abs(i - 1.3) * 40, 40, 20); ctx.fill(); }
  // knuckles and the tendons
  for (let i = 0; i < 4; i++) { ellipse(ctx, 96, -46 + i * 45, 14, 10, '#E09A78'); line(ctx, -240, -30 + i * 30, 80, -46 + i * 45, 4, 'rgba(200,120,90,0.35)'); }
  // the tent of skin: a ridge rising from the back of the hand
  const tx = -120, th = 110 * tent;
  if (th > 1) {
    ctx.beginPath(); ctx.moveTo(tx - 110, -66); ctx.quadraticCurveTo(tx - 30, -66 - th * 0.9, tx, -66 - th); ctx.quadraticCurveTo(tx + 30, -66 - th * 0.9, tx + 110, -66); ctx.closePath();
    ctx.fillStyle = '#F4BE9C'; ctx.fill(); line(ctx, tx, -66 - th + 8, tx, -60, 3, 'rgba(190,110,80,0.5)');
  }
  // the pinching hand, from above: a palm, the index finger and the thumb meeting at the top of the tent
  if (grip > 0.01) {
    const lift = 240 * (1 - grip), top = -66 - th - 6 - lift;
    ctx.fillStyle = '#EFB08C';
    rrect(ctx, tx - 150, top - 330, 210, 190, 70); ctx.fill();                                                  // the palm
    rrect(ctx, tx + 30, top - 300, 150, 60, 30); ctx.fill();                                                    // the folded fingers
    ctx.save(); ctx.translate(tx + 14, top - 6); ctx.rotate(-0.35); rrect(ctx, -22, -190, 44, 200, 22); ctx.fill(); ellipse(ctx, 0, -4, 18, 12, '#F8D0B8'); ctx.restore();   // the index
    ctx.save(); ctx.translate(tx - 18, top - 2); ctx.rotate(0.55); rrect(ctx, -24, -170, 48, 180, 24); ctx.fill(); ellipse(ctx, 0, -2, 19, 12, '#F8D0B8'); ctx.restore();  // the thumb
    rrect(ctx, tx - 180, top - 520, 200, 220, 40); ctx.fillStyle = '#2E4D9A'; ctx.fill();                       // his other sleeve
  }
  ctx.restore();
}
// "In 1960, a pilot named Joe Kittinger rode a balloon nineteen miles up." old film: the open gondola under the huge
// balloon, the black sky above, the curve of the Earth far below; the camera tilts up from the Earth; an altimeter
SC.kitt1 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam({ x: 960, y: 900, zoom: 0.9, rot: 0 }, { x: 960, y: 380, zoom: 1.15, rot: 0 }, ramp(lt, 0, D * 0.8, E.inOutCubic));
  gondola(cam, t, { swell: 0 });
  sepia60(0.9); film60(t, 1);
  screenSpace();
  tagPill('1960', 330, 260, ramp(t, c.k1960, c.k1960 + 0.3), '#FFD447', 60);
  const alt = Math.round(lerp(60000, 102800, ramp(t, c.k1960, c.miles + 0.6)) / 100) * 100;
  if (t > c.k1960 + 0.2) bigWord(`${alt.toLocaleString('en-US')} FT`, 1480, 260, 84, '#FFFFFF', 1, 0);
  stampWord('19 MILES UP', 1480, 380, 76, '#FFD447', ramp(t, c.miles + 0.2, c.miles + 0.5), -0.05);
  return { glow: 0.6, grain: 1 };
};
// "One of his gloves failed. His hand swelled to twice its size..." close on his raised hand: it swells; 2x
SC.kitt2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const sw = ramp(t, c.leaked + 0.6, c.twice + 0.6, E.inOutSine);
  const cam = { x: 1092 - 10 * lt, y: 320, zoom: 2.6 + 0.2 * lt / D, rot: 0 };
  gondola(cam, t, { swell: sw });
  sepia60(0.8); film60(t, 1);
  screenSpace();
  stampWord('2×', 600, 330, 220, '#FF5A6E', ramp(t, c.twice + 0.2, c.twice + 0.5), -0.1);
  return { glow: 0.7 };
};
// "...and three hours after he landed, the swelling was gone." the hand back to normal; a clock face spins three hours
SC.kitt3 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A2418', '#0A0806'); screenSpace();
  const spin = ramp(t, c.threeH, c.normal, E.inOutCubic);
  ctx.save(); ctx.translate(620, 500);
  circle(ctx, 0, 0, 220, '#3A3020'); circle(ctx, 0, 0, 200, '#F4ECD8');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(ctx, Math.sin(a) * 160, -Math.cos(a) * 160, Math.sin(a) * 185, -Math.cos(a) * 185, 8, '#3A3020'); }
  const am = spin * 3 * 6.283, ah = spin * 3 / 12 * 6.283;
  line(ctx, 0, 0, Math.sin(ah) * 100, -Math.cos(ah) * 100, 14, '#3A3020'); line(ctx, 0, 0, Math.sin(am) * 160, -Math.cos(am) * 160, 9, '#3A3020'); circle(ctx, 0, 0, 14, '#C83A2A');
  ctx.restore();
  bigWord('+3 HOURS', 620, 820, 90, '#FFD447', ramp(t, c.threeH + 0.2, c.threeH + 0.5), 0);
  // the hand, back to normal size
  ctx.save(); ctx.translate(1350, 520); ctx.rotate(-0.5); const sw = 1 - ramp(t, c.threeH + 0.4, c.normal + 0.4, E.inOutSine);
  ellipse(ctx, 0, 0, 70 + 70 * sw, 80 + 80 * sw, '#E8B898'); for (let i = 0; i < 4; i++) ellipse(ctx, -48 + i * 32 * (1 + 0.5 * sw), -90 - 50 * sw, 17 + 12 * sw, 40 + 22 * sw, '#E8B898');
  ctx.restore();
  stampWord('GONE', 1420, 860, 120, '#4DFFB4', ramp(t, c.normal + 0.3, c.normal + 0.6), -0.06);
  sepia60(0.75); film60(t, 0.8);
  return { glow: 0.6 };
};
// "Second thirty. What does this feel like? One man knows." the airlock: he floats, swollen; a slow push; the frame
// flickers toward old film on "One man knows"
SC.leb1 = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 1.3 + 0.5 * ramp(lt, 0, D, E.inCubic), 980, 440);
  alScene(cam, t, S);
  const old = ramp(t, c.knows + 0.4, shot.end);
  if (old > 0) { sepia60(old); film60(t, old); }
  sisInset(t, sisOn(t));
  return alPost({ vhs: 0.4 * ramp(t, shot.end - 0.25, shot.end) });
};
// "In 1966, Jim LeBlanc was testing a spacesuit in a NASA vacuum chamber, when its air hose came loose." old film: the
// chamber from outside in its hangar; a cut to its round window, the suited man inside, the engineers; a cut close on
// the hose as it comes loose and whips
SC.leb2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.leblanc + 0.9) {
    chamberOutside({ x: 960 + 40 * lt, y: 520, zoom: 0.95 + 0.04 * lt, rot: 0 }, t, { walk: lt });
    sepia60(0.9); film60(t, 1);
    screenSpace();
    tagPill('1966 · HOUSTON', 330, 230, ramp(t, c.y1966, c.y1966 + 0.3), '#FFD447', 50);
    tagPill('JIM LEBLANC', 330, 330, ramp(t, c.leblanc + 0.1, c.leblanc + 0.4), '#FFFFFF', 46);
    return { glow: 0.6 };
  }
  const close = t >= c.hose - 0.35;
  const cam = close ? { x: 1020 + 20 * Math.sin(t * 9) * kickAt(t, c.hose, 3), y: 290, zoom: 2.6, rot: 0 } : { x: 900, y: 440, zoom: 1.2 + 0.05 * (t - c.leblanc), rot: 0 };
  chamber66(cam, t, { hose: ramp(t, c.hose, c.hose + 0.3), fog: 0, fall: 0, eng: ramp(t, c.hose + 0.4, c.hose + 0.8) });
  sepia60(0.9); film60(t, 1);
  screenSpace();
  stampWord('LOOSE!', 1500, 300, 130, '#FF5A6E', ramp(t, c.hose + 0.25, c.hose + 0.5), -0.1);
  return { glow: 0.6, flash: 0.25 * kickAt(t, c.hose, 9) };
};
// "He stayed awake for about fourteen seconds. The last thing he remembered? The spit on his tongue... starting to
// bubble." the chamber: his visor fogs, he sags; a timer runs to 14; then a tongue, big, its spit bubbling (old film)
SC.leb3 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.lastThing + 0.6) {
    const cam = { x: 900, y: 360 + 20 * lt, zoom: 1.5 + 0.1 * lt, rot: 0 };
    chamber66(cam, t, { hose: 1, fog: ramp(t, c.awake, c.fourteen + 0.6), fall: ramp(t, c.fourteen, c.lastThing + 0.4, E.inOutCubic), eng: 1, valve: 0 });
    sepia60(0.9); film60(t, 1);
    screenSpace();
    const sec = Math.min(14, Math.floor(lerp(0, 14.99, ramp(t, c.awake, c.fourteen + 0.3, (x) => x))));
    bigWord(`${sec} SEC`, 1480, 300, 120, '#FFFFFF', ramp(t, c.awake, c.awake + 0.3), 0);
    return { glow: 0.5 };
  }
  darkBg('#3A1A20', '#100608'); screenSpace();
  tongueMacro(960, 560, 1.0 + 0.06 * lt / D, t, ramp(t, c.bubble, c.bubble + 0.6));
  sepia60(0.7); film60(t, 0.8);
  return { glow: 0.6 };
};
// a tongue, very close (screen space), with spit on it that bubbles (boil 0..1)
function tongueMacro(x, y, s, t, boil) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-700, -260); ctx.quadraticCurveTo(0, -330, 700, -260); ctx.lineTo(700, 600); ctx.lineTo(-700, 600); ctx.closePath(); ctx.fillStyle = '#5A1A22'; ctx.fill();   // the mouth
  ctx.beginPath(); ctx.ellipse(0, 160, 520, 360, 0, Math.PI, 0); ctx.lineTo(520, 600); ctx.lineTo(-520, 600); ctx.closePath();
  const g = ctx.createLinearGradient(0, -200, 0, 600); g.addColorStop(0, '#F07A88'); g.addColorStop(1, '#C04858'); ctx.fillStyle = g; ctx.fill();
  line(ctx, 0, -150, 0, 560, 10, 'rgba(150,40,60,0.5)');
  for (let i = 0; i < 70; i++) circle(ctx, (hash(i * 3) - 0.5) * 900, -100 + hash(i * 7) * 600, 6, 'rgba(255,170,180,0.5)');   // the bumps
  for (let i = 0; i < 26; i++) {
    const ph = (t * (0.8 + hash(i)) + hash(i * 5)) % 1, bx = (hash(i * 2.3) - 0.5) * 800, by = -60 + 400 * hash(i * 1.7) - 120 * ph * boil;
    const r = (8 + 26 * hash(i * 9)) * boil * (0.4 + ph);
    if (r < 1) continue;
    ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fillStyle = `rgba(235,248,255,${0.5 * (1 - ph)})`; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - ph)})`; ctx.stroke();
    circle(ctx, bx - r * 0.35, by - r * 0.35, r * 0.25, `rgba(255,255,255,${0.8 * (1 - ph)})`);
  }
  ctx.restore();
}
// "They pumped the air back in, fast. And he was fine. He just couldn't taste much... for four days." the engineers
// spin the valve, the air swirls back into the chamber: FINE; then a lollipop and a taste meter that reads nearly
// nothing: 4 DAYS
SC.leb4 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.taste - 0.2) {
    const cam = { x: 1150, y: 480, zoom: 1.05 + 0.08 * lt, rot: 0 };
    chamber66(cam, t, { hose: 1, fog: 1 - ramp(t, c.pumped + 0.6, c.fine), fall: 1 - 0.6 * ramp(t, c.fine - 0.2, c.fine + 0.4), eng: 1, valve: ramp(t, c.pumped, c.fine, E.inOutCubic), air: ramp(t, c.pumped + 0.3, c.pumped + 0.8) });
    sepia60(0.85); film60(t, 1);
    screenSpace();
    stampWord('FINE', 1500, 330, 150, '#4DFFB4', ramp(t, c.fine + 0.1, c.fine + 0.4), -0.1);
    return { glow: 0.6 };
  }
  darkBg('#2A2418', '#0A0806'); screenSpace();
  const k = ramp(t, c.taste - 0.2, c.taste + 0.2);
  // a lollipop and a meter: TASTE
  ctx.save(); ctx.translate(640, 520); const b = E.outBack(k, 1.8); ctx.scale(b, b);
  line(ctx, 0, 0, 0, 300, 18, '#F4ECD8'); circle(ctx, 0, -40, 150, '#FF5A6E');
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, -40, 30 + i * 30, i, i + 4); ctx.lineWidth = 14; ctx.strokeStyle = '#FFD9E6'; ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.translate(1300, 500); ctx.scale(b, b);
  rrect(ctx, -280, -70, 560, 140, 30); ctx.fillStyle = '#20263F'; ctx.fill();
  rrect(ctx, -260, -50, 520 * lerp(0.9, 0.08, ramp(t, c.taste + 0.2, c.taste + 0.8)), 100, 22); ctx.fillStyle = '#FF9A3C'; ctx.fill();
  ctx.font = '900 46px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('TASTE', 0, -120);
  ctx.restore();
  stampWord('4 DAYS', 1300, 760, 130, '#FFD447', ramp(t, c.fourDays, c.fourDays + 0.3), -0.06);
  sepia60(0.5); film60(t, 0.6);
  return { glow: 0.7 };
};
// "Second forty-five. Every bit of gas in his gut is swelling too. Yes. That gas." his gut as an x-ray balloon swelling;
// "Yes. That gas.": Ball, very slowly, turns its eyes away
SC.gut = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.yes - 0.15) {
    darkBg('#14102A', '#04020C'); screenSpace();
    gutBalloon(t, ramp(t, c.gutW - 0.3, c.yes, E.inOutSine), { x: 900, y: 500, s: 1.9 });
    tagPill('GAS', 1400, 300, ramp(t, c.gutW, c.gutW + 0.3), '#FFD447', 56);
    sisInset(t, sisOn(t));
    return inPost();
  }
  const S = alState(t), B = S.ball;
  const cam = ptCam([B.x, B.y], 3.6, 960, 520);
  alScene(cam, t, S, { noBall: true });
  applyCam(cam);
  const away = ramp(t, c.thatGas - 0.1, c.thatGas + 0.6, E.inOutSine);
  alBall(B.x, B.y, B.s, t, { mood: 'flat', look: [lerp(-1, 1, away), lerp(0.4, -0.6, away)], tilt: 0.25 * away });
  return alPost();
};
// "Second sixty. His heart is still beating... but slower, and slower." his chest, dim, the heart monitor slowing
SC.heart = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1A0A14', '#05020A'); screenSpace();
  const t0 = shot.start;
  const bpm = (u) => lerp(118, 38, clamp((u - c.beating + 0.3) / (shot.end + 0.6 - c.beating)));
  chestX({ x: 640, y: 980, s: 0.9 }, t, { o2: 0.2, ex: 0.2, fill: 0.3, heartGlow: 0.3 + 0.4 * beatVar(t, bpm, t0 - 1), bpm: bpm(t) });
  heartMon(1300, 480, 1.05, t, bpm, t0);
  sisInset(t, sisOn(t), 1700, 150, 110);
  return inPost({ push: { k: 1 + 0.04 * lt / D, cx: 1100, cy: 500 } });
};
