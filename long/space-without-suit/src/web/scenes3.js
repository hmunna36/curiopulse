// What If You Went to Space WITHOUT a Suit? — the shots, act 3 and the ending: how long a rescue has (the 1960s
// tests, the ninety-second window with him on it), Soyuz 11, REPRESS, the air roaring back, he wakes, the viewer's palm
// (the air was holding him together), his puffy face, the selfie in the goldfish bowl, and Pip's bowl turning into
// the Earth's thin blue line.
'use strict';

// "So how long does he have? Nobody's allowed to test that on a person. In the nineteen-sixties, they tested it on
// animals." the airlock: his sister's face is at the inner hatch's window (wordless reveal), palm on the glass; then a
// 1960s lab on old film: a test chamber with a dog sitting in it, calm, a scientist with a stopwatch
SC.edge = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.sixties - 0.1) {
    const S = alState(t);
    const win = ptCam([AL.inX, AL.inY - 40], 2.6, 700, 470), him = headCam(S, 1.4, 1100, 420);
    const cam = mixCam(win, him, ramp(t, c.howLong + 0.9, c.nobody, E.inOutCubic));
    alScene(cam, t, S);
    screenSpace();
    tagPill('HOW LONG?', 1450, 230, ramp(t, c.howLong + 0.1, c.howLong + 0.4), '#FF5A6E', 64);
    stampWord('NOT ON PEOPLE', 1350, 380, 90, '#FFFFFF', ramp(t, c.nobody + 0.8, c.nobody + 1.1), -0.06);
    return alPost();
  }
  darkBg('#3A3A36', '#141412'); screenSpace();
  testLab60(t, ramp(t, c.sixties - 0.1, c.sixties + 0.3));
  sepia60(0.9); film60(t, 1);
  screenSpace();
  tagPill('THE 1960s', 330, 230, ramp(t, c.sixties, c.sixties + 0.3), '#FFD447', 54);
  return { glow: 0.5 };
};
// a 1960s altitude lab: a round steel test chamber with a porthole, a dog sitting inside looking out, calm; a scientist
// in a white coat holding a stopwatch; gauges on the wall (screen space)
function testLab60(t, k) {
  const c = ctx;
  c.fillStyle = '#C8C4B4'; c.fillRect(0, 0, W, 700); c.fillStyle = '#6A6A60'; c.fillRect(0, 700, W, 380);
  for (let i = 0; i < 4; i++) { circle(c, 1500 + i * 110, 230, 44, '#3A3A36'); circle(c, 1500 + i * 110, 230, 36, '#F4F0E4'); line(c, 1500 + i * 110, 230, 1500 + i * 110 + 26 * Math.sin(t + i), 230 - 26 * Math.cos(t + i), 4, '#A0281E'); }
  // the chamber
  rrect(c, 380, 160, 760, 620, 120); c.fillStyle = '#8A8E90'; c.fill(); rrect(c, 400, 180, 720, 580, 110); c.fillStyle = '#A8ACAE'; c.fill();
  for (let i = 0; i < 14; i++) circle(c, 420 + i * 52, 200, 7, '#6A6E70');
  circle(c, 760, 450, 210, '#5A5E60'); circle(c, 760, 450, 190, '#E8ECEA');
  c.save(); c.beginPath(); c.arc(760, 450, 190, 0, 7); c.clip();
  c.fillStyle = '#D0D4D0'; c.fillRect(560, 250, 400, 400);
  // the dog: sitting, side-on, ears up, looking out at us
  const bob = 3 * Math.sin(t * 2.2);
  ellipse(c, 760, 560, 110, 70, '#8A6A4A');                 // body
  ellipse(c, 700, 610, 30, 20, '#7A5A3A'); ellipse(c, 830, 610, 30, 20, '#7A5A3A');   // paws
  ellipse(c, 760, 450 + bob, 70, 62, '#9A7A5A');            // head
  ellipse(c, 712, 400 + bob, 22, 40, '#6A4A2A', -0.3); ellipse(c, 808, 400 + bob, 22, 40, '#6A4A2A', 0.3);   // ears
  ellipse(c, 760, 478 + bob, 30, 22, '#C8A88A'); circle(c, 760, 468 + bob, 10, '#2A1A10');
  circle(c, 735, 440 + bob, 9, '#2A1A10'); circle(c, 785, 440 + bob, 9, '#2A1A10'); circle(c, 732, 437 + bob, 3, '#FFFFFF'); circle(c, 782, 437 + bob, 3, '#FFFFFF');
  c.restore();
  c.beginPath(); c.arc(760, 450, 178, Math.PI * 1.1, Math.PI * 1.45); c.lineWidth = 12; c.strokeStyle = 'rgba(255,255,255,0.4)'; c.stroke();
  // the scientist (from the side, in a white coat), a stopwatch held up
  const st = { x: 1420, y: 1000, s: 0.7, face: Object.assign({}, FACES.calm, { lookX: -0.9 }), seed: 5,
    pose: ikReach({ hipY: -222, lean: 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 }, 'L', [-150, -420], -1) };
  drawCharacter(c, st, t, LABDOC); docKit2Safe(c, st);
  const r = rig(st.pose), w = toWorld(st, r.wrL);
  circle(c, w[0] - 10, w[1] - 30, 28, '#E8E4D8'); circle(c, w[0] - 10, w[1] - 30, 22, '#F8F6EE'); line(c, w[0] - 10, w[1] - 30, w[0] - 10 + 16 * Math.sin(t * 6), w[1] - 30 - 16 * Math.cos(t * 6), 3, '#A0281E');
}
function docKit2Safe(c, st) { const r = rig(st.pose); c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); docKit2(c, r, st); c.restore(); }
// "Every dog brought back within ninety seconds lived. After about three minutes... most didn't." the window as a bar:
// 0 to 3 minutes; the first 90 s fill green with dogs, all fine; past two minutes it turns red; HIM: a marker that
// creeps along it with the clock (he is already past seventy)
SC.dogs = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#101A2E', '#04060E'); screenSpace();
  const x0 = 240, x1 = 1680, y = 520, sec = (s) => lerp(x0, x1, s / 180);
  const k = ramp(lt, 0, 0.4);
  rrect(ctx, x0 - 10, y - 60, (x1 - x0) * k + 20, 120, 60); ctx.fillStyle = '#1A2238'; ctx.fill();
  const g1 = ramp(t, c.ninety - 0.4, c.ninety + 0.4);
  rrect(ctx, x0, y - 50, (sec(90) - x0) * g1, 100, 50); ctx.fillStyle = '#2FBF7E'; ctx.fill();
  softDot(gctx, (x0 + sec(90)) / 2, y, 400 * g1, '#4DFFB4', 0.35 * g1);
  const r1 = ramp(t, c.longer, c.didnt + 0.4);
  if (r1 > 0.01) { ctx.save(); ctx.beginPath(); ctx.rect(sec(120), y - 50, (x1 - sec(120)) * r1, 100); ctx.clip(); const gr = ctx.createLinearGradient(sec(120), 0, x1, 0); gr.addColorStop(0, '#E8A030'); gr.addColorStop(1, '#E0303E'); rrect(ctx, x0, y - 50, x1 - x0, 100, 50); ctx.fillStyle = gr; ctx.fill(); ctx.restore(); }
  // ticks and labels
  for (const [s, lab] of [[0, '0'], [60, '1 MIN'], [90, '90 S'], [120, '2 MIN'], [180, '3 MIN']]) { line(ctx, sec(s), y - 60, sec(s), y - 88, 5, '#8A93AE'); ctx.font = '800 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#C8CEE0'; ctx.fillText(lab, sec(s), y - 100); }
  // the dogs: little dog heads in the green part, all with happy eyes
  for (let i = 0; i < 5; i++) { const dk = ramp(t, c.ninety + 0.1 * i, c.ninety + 0.1 * i + 0.3); if (dk > 0.01) dogIcon(lerp(x0 + 90, sec(90) - 90, i / 4), y - 170, 1.0 * E.outBack(dk, 2), true); }
  if (r1 > 0.3) for (let i = 0; i < 3; i++) dogIcon(lerp(sec(135), x1 - 80, i / 2), y - 170, 1.0 * E.outBack(ramp(t, c.didnt + 0.1 * i, c.didnt + 0.1 * i + 0.3), 2), false);
  stampWord('ALL LIVED', (x0 + sec(90)) / 2, y - 330, 90, '#4DFFB4', ramp(t, c.lived, c.lived + 0.3), -0.04);
  stampWord("MOST DIDN'T", (sec(120) + x1) / 2, y - 330, 90, '#FF5A6E', ramp(t, c.didnt + 0.1, c.didnt + 0.4), -0.04);
  // HIM: where his clock is now (a marker that creeps forward)
  const now = lerp(60, 80, clamp((t - c.s60) / Math.max(1, c.s80 - c.s60)));
  const mx = sec(now), mk = ramp(lt, 0.3, 0.7);
  if (mk > 0.01) {
    ctx.save(); ctx.translate(mx, y + 70); ctx.scale(mk, mk);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-24, 40); ctx.lineTo(24, 40); ctx.closePath(); ctx.fillStyle = '#FFD447'; ctx.fill();
    ctx.font = '400 64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#FFD447'; ctx.fillText(`HIM: ${Math.floor(now)} S`, 0, 130);
    ctx.restore();
    line(ctx, mx, y - 50, mx, y + 50, 6, '#FFD447'); softDot(gctx, mx, y, 60, '#FFD447', 0.8);
  }
  return inPost();
};
function dogIcon(x, y, s, ok) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 0, 56, 50, ok ? '#C89A6A' : '#5A5A66');
  ellipse(ctx, -38, -36, 18, 32, ok ? '#8A6A4A' : '#3A3A46', -0.4); ellipse(ctx, 38, -36, 18, 32, ok ? '#8A6A4A' : '#3A3A46', 0.4);
  ellipse(ctx, 0, 20, 24, 18, ok ? '#E8C8A8' : '#7A7A86'); circle(ctx, 0, 12, 8, '#2A1A10');
  if (ok) { ctx.beginPath(); ctx.arc(-18, -6, 8, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(18, -6, 8, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 4; ctx.strokeStyle = '#2A1A10'; ctx.stroke(); }
  else { line(ctx, -24, -12, -12, 0, 4, '#1A1A22'); line(ctx, -24, 0, -12, -12, 4, '#1A1A22'); line(ctx, 12, -12, 24, 0, 4, '#1A1A22'); line(ctx, 12, 0, 24, -12, 4, '#1A1A22'); }
  ctx.restore();
}
// "In 1971, a valve opened on a Soyuz capsule, on its way home. Its three cosmonauts are still the only people who ever
// died in space." the Earth from orbit, dark; the capsule drifting; a thin jet from its valve; then three small stars
// come out, one by one, over the thin blue line (a quiet memorial)
SC.soyuz = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  spaceField(ctx, 0, 0, W, H, t);
  const z = 1 + 0.06 * lt / D;
  ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
  earthLimb(ctx, 960, 2900, 2200, t, { line: 0.018, night: 0.6 });
  // the capsule: a bell-shaped descent module, turning slowly
  const cx = 960 + 120 * Math.sin(lt * 0.15), cy = 430, rot = 0.3 + 0.08 * lt;
  const ck = 1 - ramp(t, c.cosmo - 0.6, c.cosmo, E.inOutCubic);
  if (ck > 0.01) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = ck;
    ctx.beginPath(); ctx.moveTo(-60, -90); ctx.quadraticCurveTo(-110, 40, -120, 90); ctx.lineTo(120, 90); ctx.quadraticCurveTo(110, 40, 60, -90); ctx.closePath();
    const g = ctx.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#5A5E66'); g.addColorStop(0.5, '#A8ACB4'); g.addColorStop(1, '#4A4E56'); ctx.fillStyle = g; ctx.fill();
    rrect(ctx, -130, 84, 260, 26, 10); ctx.fillStyle = '#3A3020'; ctx.fill();
    circle(ctx, 0, -10, 18, '#20242C'); circle(ctx, 0, -10, 12, '#5A7AAA');
    const v = ramp(t, c.valve, c.valve + 0.4) * (1 - ramp(t, c.home + 0.8, c.cosmo));
    if (v > 0.01) for (let i = 0; i < 8; i++) { const ph = (t * 2 + i / 8) % 1; softDot(ctx, 70 + 160 * ph, -40 - 40 * ph, 10 + 30 * ph, '#E8ECF4', 0.5 * (1 - ph) * v); }
    ctx.restore();
  }
  ctx.restore();
  tagPill('1971', 330, 230, ramp(t, c.y1971, c.y1971 + 0.3) * (1 - ramp(t, c.cosmo - 0.5, c.cosmo)), '#FFD447', 56);
  // three stars over the Earth
  for (let i = 0; i < 3; i++) {
    const sk = ramp(t, c.cosmo + 0.4 + 0.5 * i, c.cosmo + 0.9 + 0.5 * i);
    if (sk <= 0.01) continue;
    const x = 760 + i * 200, y = 330 - 30 * (i === 1 ? 1 : 0), tw = 0.85 + 0.15 * Math.sin(t * 3 + i);
    ctx.save(); ctx.translate(x, y); ctx.scale(sk * tw, sk * tw); ctx.beginPath();
    for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5 - Math.PI / 2, r = j % 2 ? 9 : 26; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = '#FFF4D8'; ctx.fill(); ctx.restore();
    softDot(gctx, x, y, 80 * sk, '#FFE8B0', 0.8 * sk);
  }
  return { glow: 0.9 };
};
// "Second eighty. Her hand hits REPRESS." the corridor side of the inner hatch: through its window, him floating far
// beyond; beside it her panel; her hand comes down on REPRESS: a flash, the camera kicks
SC.repress = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  const kick = kickAt(t, c.slam, 7), [sx, sy] = shake(t, 22 * kick, 30, 9);
  ctx.save(); ctx.translate(sx, sy);
  const z = 1.0 + 0.25 * ramp(t, c.s80, c.slam, E.inCubic);
  ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
  // the corridor wall: warm white panels, red alarm light
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#E8DCC8'); g.addColorStop(1, '#B8AC98'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  for (let y = 40; y < H; y += 230) for (let x = -40; x < W; x += 260) { rrect(ctx, x, y, 240, 210, 24); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill(); }
  ctx.fillStyle = `rgba(255,40,60,${0.12 * (1 - ramp(t, c.slam, c.slam + 1)) * (0.6 + 0.4 * Math.sin(t * 10))})`; ctx.fillRect(-200, -200, W + 400, H + 400);
  // the hatch with its window: inside, the airlock in miniature, red, him floating
  circle(ctx, 700, 520, 330, '#9AA3BC'); circle(ctx, 700, 520, 300, '#D8DDE9'); circle(ctx, 700, 520, 150, '#6E7894');
  ctx.save(); ctx.beginPath(); ctx.arc(700, 520, 132, 0, 7); ctx.clip();
  ctx.fillStyle = '#B8C0D4'; ctx.fillRect(560, 380, 280, 280);
  ctx.fillStyle = `rgba(255,40,60,${0.25 * (1 - ramp(t, c.slam, c.slam + 1))})`; ctx.fillRect(560, 380, 280, 280);
  ctx.save(); ctx.beginPath(); ctx.arc(820, 470, 110, 0, 7); ctx.clip(); spaceField(ctx, 700, 350, 260, 260, t); earthLimb(ctx, 860, 760, 260, t, { glowCtx: false }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(700, 520, 132, 0, 7); ctx.clip();
  alHero({ x: 960, y: 540, zoom: 1, rot: 0 }, t, { x: 700, y: 820, s: 0.62, face: FACES.limp, limp: 1, swell: 0.8, blue: 0.8, rot: 0.25 + 0.05 * Math.sin(t), stick: { k: 0.5, a: -0.4 } });
  ctx.restore();
  ctx.restore();
  ctx.beginPath(); ctx.arc(700, 520, 132, Math.PI * 1.1, Math.PI * 1.45); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke();
  // her panel and her hand
  rrect(ctx, 1200, 340, 300, 360, 26); ctx.fillStyle = '#3A4466'; ctx.fill();
  const pr = t >= c.slam ? 1 : 0;
  rrect(ctx, 1240, 470, 220, 120, 22); ctx.fillStyle = '#20263F'; ctx.fill();
  rrect(ctx, 1250, 478 + 10 * pr, 200, 100 - 10 * pr, 18); ctx.fillStyle = '#1FAE6A'; ctx.fill();
  ctx.font = '400 54px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('REPRESS', 1350, 530 + 6 * pr);
  softDot(gctx, 1350, 530, 300 * (0.3 + 0.7 * kickAt(t, c.slam, 2.5)), '#4DFFB4', 0.9);
  const hand = ramp(t, c.hand - 0.2, c.slam, E.inCubic);
  ctx.save(); ctx.translate(lerp(1650, 1360, hand), lerp(200, 500, hand)); ctx.rotate(0.5);
  rrect(ctx, -60, -40, 120, 300, 50); ctx.fillStyle = '#F08A2E'; ctx.fill();                  // her orange sleeve
  ellipse(ctx, 0, -60, 70, 60, '#E8A880'); for (let i = 0; i < 4; i++) rrect(ctx, -60 + i * 32, -170, 28, 110, 14), ctx.fillStyle = '#E8A880', ctx.fill();
  ctx.restore();
  ctx.restore();
  return { glow: 0.9, flash: 0.6 * kickAt(t, c.slam, 9) };
};
// wordless: the outer hatch swings shut, the air roars back in as fog, the white lights flood back, the beacon stops;
// his chest heaves
SC.rush = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = mixCam({ x: 1400, y: 500, zoom: 1.2, rot: 0 }, headCam(S, 1.7, 900, 440), ramp(lt, 0.4, D + 0.6, E.inOutCubic));
  alScene(shakeCam(cam, t, 8 * (1 - ramp(lt, 0, D))), t, S);
  screenSpace();
  ctx.fillStyle = `rgba(255,255,255,${0.35 * kickAt(t, c.slam + 0.6, 2)})`; ctx.fillRect(0, 0, W, H);
  return alPost({ glow: 1.0 });
};
// "Second ninety. Air. And like Jim LeBlanc... he wakes up." his face, close: a gasp; his eyes flutter open; Ball's eyes
// light up happy; the inner hatch opens and his sister floats in beside him
SC.wake = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const close = headCam(S, 3.0, 900, 470), two = headCam(S, 1.6, 1150, 430);
  const cam = mixCam(close, two, ramp(t, c.wakes + 0.6, shot.end, E.inOutCubic));
  alScene(cam, t, S, { after: (cm, res, h) => {
    const sk = ramp(t, c.wakes + 0.4, c.wakes + 1.6, E.outCubic);
    if (sk > 0.01) {   // his sister floats in from the left and puts a hand on his shoulder
      const hp = alHeadPt(h), x = lerp(hp[0] - 900, hp[0] - 330, sk), y = hp[1] + 420;
      const st = { x, y, s: 0.78, face: Object.assign({}, FACES.stern, { lookX: 0.8 }), seed: 3,
        pose: ikReach({ hipY: -222, lean: 0.12, armL: { a: 0.3, b: 0.3 }, armR: { a: 0.3, b: 0.3 }, legL: { a: 0.1, b: -0.3 }, legR: { a: 0.15, b: -0.4 }, hand: 'open', feetFront: 1 }, 'R', [260, -330], 1) };
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); camTransform(lctx, cm, 1);
      drawCharacter(lctx, st, t, SISPAL); sisHair(lctx, st);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layerC, 0, 0); occludeGlow(); applyCam(cm);
    }
  } });
  screenSpace();
  stampWord('AIR!', 1460, 300, 170, '#7FE9FF', ramp(t, c.air - 0.05, c.air + 0.25) * (1 - ramp(t, c.likeLB, c.likeLB + 0.3)), -0.1);
  return alPost({ flash: 0.3 * kickAt(t, c.air, 6) });
};
// "Hold out your hand. Right now, the air is pressing on it with the weight of a grown-up. You don't feel it, because
// your body pushes back just as hard." an open palm, big: blue arrows of air press down on it; a tiny grown-up (his
// sister, at the scale of a toy) lands standing on the palm: about 80 kg; then orange arrows push back from inside
SC.palm = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0E1E44', '#03060F'); screenSpace();
  const k = ramp(lt, 0, 0.4), press = ramp(t, c.pressing - 0.2, c.pressing + 0.6), back = ramp(t, c.pushBack - 0.2, c.pushBack + 0.5);
  const P = [1000, 660];
  palmPress(P[0], P[1], 1.6, k, t, { press, back });
  const gk = ramp(t, c.grownup - 0.1, c.grownup + 0.35, E.outBack);
  if (gk > 0.01) {
    const st = { x: P[0] - 100, y: P[1] - 80 - 60 * (1 - clamp(gk)), s: 0.55, face: Object.assign({}, FACES.stern, { lookX: 0, lookY: 0.4 }), seed: 3,
      pose: { hipY: -222, lean: 0, armL: { a: 0.5, b: 0.6 }, armR: { a: 0.5, b: 0.6 }, legL: { a: 0.12, b: 0 }, legR: { a: 0.12, b: 0 }, hand: 'open', feetFront: 1 } };
    drawCharacter(ctx, st, t, SISPAL); sisHair(ctx, st);
    pill(P[0] + 330, P[1] - 330, '≈ 80 KG', '#FFD447', gk, 56);
  }
  testBadge(['TRY IT', 'HOLD OUT YOUR HAND'], ramp(t, c.palm, c.palm + 0.3) * (1 - ramp(t, c.pressing + 1.5, c.pressing + 1.8)));
  stampWord('PUSHING BACK', 1450, 860, 80, '#FF9A3C', ramp(t, c.pushBack + 0.3, c.pushBack + 0.6), -0.04);
  return inPost({ push: { k: 1 + 0.04 * lt / D, cx: 960, cy: 600 } });
};
// "Space doesn't pull you apart. It just stops holding you together." him in the airlock, air back: blue arrows press in
// all round him (the air's hug); on "doesn't pull you apart" they vanish (space: nothing presses); on "holding you
// together" they come back and glow
SC.apart = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 1.3 + 0.1 * lt / D, 960, 360);
  alScene(cam, t, S, { after: (cm, res, h) => {
    const gone = env2(t, c.apart + 0.3, c.stops + 0.5, 0.3), back = ramp(t, c.stops + 0.6, c.stops + 1.2);
    const a = (1 - gone) * (0.5 + 0.5 * back);
    const mid = alPt(h, [0, -320]);
    for (let i = 0; i < 16; i++) {
      const ang = i / 16 * 6.283, r0 = 420 + 20 * Math.sin(t * 3 + i), r1 = 300;
      const x0 = mid[0] + Math.cos(ang) * r0, y0 = mid[1] + Math.sin(ang) * r0 * 1.15, x1 = mid[0] + Math.cos(ang) * r1, y1 = mid[1] + Math.sin(ang) * r1 * 1.15;
      line(ctx, x0, y0, x1, y1, 8, rgba('#7FE9FF', a)); circle(ctx, x1, y1, 10, rgba('#7FE9FF', a)); softDot(gctx, x1, y1, 26, '#7FE9FF', 0.5 * a * (0.4 + back));
    }
  } });
  return alPost();
};
// "He was puffy for a couple of days. His pride... a lot longer." the two of them, close: his face still a little puffy,
// sheepish; hers, one eyebrow up
SC.puffy = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 2.2 + 0.15 * lt / D, 1180, 470);
  alScene(cam, t, S, { after: (cm, res, h) => {
    const hp = alHeadPt(h), x = hp[0] - 330, y = hp[1] + 420;
    const st = { x, y, s: 0.78, face: Object.assign({}, FACES.stern, { lookX: 0.8, browTilt: t > c.pride ? -1.1 : -0.6 }), seed: 3,
      pose: ikReach({ hipY: -222, lean: 0.1, armL: { a: 0.3, b: 0.3 }, armR: { a: 0.3, b: 0.3 }, legL: { a: 0.1, b: -0.3 }, legR: { a: 0.15, b: -0.4 }, hand: 'open', feetFront: 1 }, 'R', [140, -150], 1) };
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); camTransform(lctx, cm, 1);
    drawCharacter(lctx, st, t, SISPAL); sisHair(lctx, st);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layerC, 0, 0); occludeGlow(); applyCam(cm);
  } });
  return alPost();
};
// "So: one more selfie. Helmet on. Goldfish bowl and all." both of them in helmets, his arm out with the stick; Ball
// takes it (flash); then the phone, big: Pip's reply, a heart and a goldfish
SC.selfie = (lt, t, shot) => {
  const c = cu(), S = alState(t), D = shot.end - shot.start;
  const cam = headCam(S, 1.9, 1160, 470);
  S.ball.x = 1650; S.ball.y = 420; S.ball.flash = kickAt(t, c.helmetOn + 0.7, 5);
  alScene(cam, t, S, { after: (cm, res, h) => {
    const hp = alHeadPt(h), x = hp[0] - 300, y = hp[1] + 420;
    const st = { x, y, s: 0.78, face: Object.assign({}, FACES.happy, { lookX: 0.5 }), seed: 3,
      pose: ikReach({ hipY: -222, lean: 0.1, armL: { a: 0.3, b: 0.3 }, armR: { a: 0.3, b: 0.3 }, legL: { a: 0.1, b: -0.3 }, legR: { a: 0.15, b: -0.4 }, hand: 'open', feetFront: 1 }, 'R', [200, -330], 1) };
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H); camTransform(lctx, cm, 1);
    drawCharacter(lctx, st, t, SISPAL); sisHair(lctx, st);
    const r = rig(st.pose); lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s); lctx.translate(r.head[0], r.head[1]);
    alHelmet(lctx, 0, -8, 0.82 * E.outBack(ramp(t, c.helmetOn - 0.2, c.helmetOn + 0.3), 1.6)); lctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layerC, 0, 0); occludeGlow(); applyCam(cm);
  } });
  screenSpace();
  const pk = ramp(t, c.bowlW - 0.2, c.bowlW + 0.3);
  if (pk > 0.01) phoneReply(1500, 560, 0.9, pk, t);
  return alPost({ flash: 0.5 * kickAt(t, c.helmetOn + 0.7, 7) });
};
// Pip's reply on his phone: the selfie, a heart, a goldfish
function phoneReply(x, y, s, k, t) {
  ctx.save(); ctx.translate(x, y + 50 * (1 - k)); const sc = s * E.outBack(clamp(k), 1.6); ctx.scale(sc, sc); ctx.rotate(-0.05);
  rrect(ctx, -250, -420, 500, 840, 56); ctx.fillStyle = '#15182A'; ctx.fill();
  rrect(ctx, -232, -400, 464, 800, 42); ctx.fillStyle = '#FFF6EE'; ctx.fill();
  ctx.save(); rrect(ctx, -232, -400, 464, 800, 42); ctx.clip();
  ctx.fillStyle = '#FFD9E6'; ctx.fillRect(-232, -400, 464, 110);
  ctx.font = '900 40px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8A2A50'; ctx.fillText('PIP', -100, -345);
  circle(ctx, -150, -345, 34, '#FF86A6');
  // the photo he sent
  rrect(ctx, -200, -260, 400, 300, 16); ctx.fillStyle = '#05060F'; ctx.fill();
  ctx.save(); rrect(ctx, -200, -260, 400, 300, 16); ctx.clip(); spaceField(ctx, -200, -260, 400, 300, t); earthLimb(ctx, 60, 300, 360, t, { glowCtx: false, line: 0.03 });
  for (const [hx, sc] of [[-70, 0.55], [60, 0.5]]) { ctx.save(); ctx.translate(hx, -100); ctx.scale(sc, sc); alHelmet(ctx, 0, 0, 1, 0); ctx.restore(); }
  ctx.restore();
  // her answer: a heart and a goldfish
  ctx.save(); ctx.translate(40, 190); const b = E.outBack(ramp(k, 0.4, 1), 2); ctx.scale(b, b);
  rrect(ctx, -170, -90, 340, 180, 40); ctx.fillStyle = '#FF86A6'; ctx.fill();
  ctx.save(); ctx.translate(-80, 0); heartShape(ctx, 40, 0); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
  goldfish(ctx, 70, 0, 0.8, t);
  ctx.restore();
  ctx.restore();
  ctx.restore();
}
// "Turns out... we all live in a goldfish bowl. Ours is just very big... and very thin." Pip's bedroom at night: the
// goldfish bowl on the sill with his selfie leaning on it, Pip in bed with her tablet; the camera pushes into the bowl
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const bowl = [1210, 590];
  const a = { x: 1000, y: 560, zoom: 1.1, rot: 0 }, b = ptCam(bowl, 3.2, 960, 540);
  const push = ramp(t, c.weAll - 0.2, c.ours + 0.6, E.inOutCubic);
  const cam = mixCam(a, b, push);
  pipRoom(cam, t, { pip: { x: 700, y: 860, s: 0.55, face: Object.assign({}, FACES.happy, { lookX: 0.8 }) }, photo: 1, station: ramp(t, shot.start, shot.end) });
  // inside the bowl: as the camera reaches it, the water turns into the curve of the Earth seen from space
  const m = ramp(t, c.ours - 0.2, c.thin + 0.6, E.inOutCubic);
  if (m > 0.01) {
    screenSpace();
    ctx.save(); ctx.globalAlpha = m; spaceField(ctx, 0, 0, W, H, t); earthLimb(ctx, 960, 3000, 2300, t, { line: 0.02 }); ctx.restore();
  }
  return { glow: 0.95, zblur: 0.06 * push * (1 - push) * 4 };
};
// the final image (wordless): the curve of the Earth and its thin blue line of air; the station, a bright dot, crosses
SC.final = (lt, t, shot) => {
  screenSpace();
  spaceField(ctx, 0, 0, W, H, t);
  const z = 1 + 0.04 * ramp(t, cu().final - 0.5, cu().final + 8);
  ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
  earthLimb(ctx, 960, 3000, 2300, t, { line: 0.026, rot: 0.002 * t });
  // the sun coming up over the edge: a bright star on the line, the air lit gold-blue around it
  const sun = ramp(t, cu().final, cu().final + 3, E.inOutSine), sx0 = 1320, sy0 = 3000 - Math.sqrt(2300 * 2300 - 360 * 360) - 30;
  softDot(ctx, sx0, sy0, 420 * sun, '#9FD8FF', 0.35 * sun); softDot(gctx, sx0, sy0, 300 * sun, '#FFF2D0', 0.9 * sun); softDot(ctx, sx0, sy0, 60 * sun, '#FFFFFF', 0.9 * sun);
  ctx.restore();
  const u = ramp(t, cu().final - 0.6, DUR_() - 0.5), px = lerp(260, 1660, u), py = 700 - 70 * Math.sin(u * Math.PI);
  for (let i = 1; i < 12; i++) { const v = Math.max(0, u - i * 0.006), qx = lerp(260, 1660, v), qy = 700 - 70 * Math.sin(v * Math.PI); circle(ctx, qx, qy, 4 - i * 0.25, `rgba(255,255,255,${0.5 - i * 0.04})`); }
  circle(ctx, px, py, 7, '#FFFFFF'); softDot(gctx, px, py, 60, '#FFFFFF', 1);
  return { glow: 1.0 };
};
const DUR_ = () => TLd.duration;
SC.sub = (lt, t, shot) => SC.final(lt, t, shot);
