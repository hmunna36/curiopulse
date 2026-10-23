// What Happens If You Stop Eating? (Day by Day) — the shots, the hook and act 1 (hour 0 to day 1). Each SC.<id>(lt, t,
// shot) draws one frame (lt = seconds in the shot, t = seconds in the video) and returns post options for main.js.
// Every beat comes from a cue (make_timeline.py); the hut's continuity is hutState(t) in state.js.
// The film: on the way down from the summit shop with Pip's favourite chocolate, the hiker is snowed into an empty hut
// and a fox takes his food bag; his last meal is a lemon (the viewer bites one in their head). The clock counts the
// hours, then the days, since that lemon: the stomach that sweeps itself and growls, hunger as an alarm clock that goes
// quiet, the liver's one-day pantry (the viewer's fist), the borrowing from muscle, the switch to fat on day three (the
// viewer's breath), the Minnesota men, the viewer's pulse and the heart, the edge, Angus Barbieri's 382 days; on day six
// he unwraps the chocolate and wraps it back up; day seven, the rescue, the soup, Pip, the bigger half.
// Colour script: candlelit hut against a blue storm → blue x-ray with gold sugar → the hut cooling → green new fuel →
// sepia 1944 → the darkest blue of day six → white daylight → Pip's warm kitchen.
'use strict';

const cu = () => TLd.cues;
const pk = (t, a, d = 0.3) => E.outBack(clamp((t - a) / d), 2);
const kick = (t, a, rate = 9) => (t >= a ? Math.exp(-(t - a) * rate) : 0);
const flashOf = (t, times, rate = 11) => (times || []).reduce((m, f) => Math.max(m, t >= f ? Math.exp(-(t - f) * rate) : 0), 0);
const hutPost = (x = {}) => Object.assign({ glow: 0.85 }, x);
const bodyPost = (x = {}) => Object.assign({ glow: 1.0 }, x);
const WIDE = { x: 960, y: 540, zoom: 1, rot: 0 };
// a label pill (screen space; k pops it)
function tagPill(txt, x, y, k, col = '#FFD447', size = 50) { if (k > 0.01) pill(x, y, txt, col, clamp(k), size); }
// a big stamp word with a pop and a little tilt (screen space)
function stampWord(txt, x, y, size, col, k, rot = -0.12) { if (k > 0.01) bigWord(txt, x, y, size, col, E.outBack(clamp(k), 2.2), rot); }
// the badge for a viewer's test (green, top right): lines of text
function testBadge(lines, k, x = W - 130, y = 70) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = '900 50px Montserrat';
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 84, h = 40 + 64 * lines.length;
  ctx.translate(x - w / 2, y + h / 2); const sc = E.outBack(clamp(k), 2); ctx.scale(sc, sc); ctx.rotate(-0.02);
  rrect(ctx, -w / 2, -h / 2, w, h, 28); ctx.fillStyle = 'rgba(8,12,34,0.9)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => { ctx.font = i === 0 ? '900 40px Montserrat' : '900 50px Montserrat'; ctx.fillStyle = i === 0 ? '#4DFFB4' : '#FFFFFF'; ctx.fillText(l, 0, -h / 2 + 52 + 64 * i); });
  ctx.restore();
  softDot(gctx, x - w / 2, y + h / 2, w * 0.6, '#4DFFB4', 0.25 * k);
}
// Pip's face in a disc (the rig in pink, pigtails), screen space
function pipDisc(x, y, r, t, face = FACES.happy, ring = '#FF86A6') {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#FFD9E6'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  const st = { x, y: y + r * 2.9, s: r / 72, face, seed: 9, noLegs: true,
    pose: { hipY: -222, lean: 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 } };
  const rr = drawCharacter(ctx, st, t, KPIP);
  ctx.save(); ctx.translate(st.x, st.y); ctx.scale(st.s, st.s); pigtails2(ctx, rr, st, t); ctx.restore();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = 7; ctx.strokeStyle = ring; ctx.stroke();
  ctx.restore();
}
// Pip on the radio: her face in a disc above the radio with a speech bubble (screen space); k pops it, txt in the bubble
function pipCall(x, y, k, t, txt, o = {}) {
  if (k <= 0.01) return;
  const kk = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(kk, kk); ctx.translate(-x, -y);
  pipDisc(x, y, 92, t, o.face || FACES.happy);
  if (txt) {
    ctx.font = '900 52px Montserrat';
    const w = ctx.measureText(txt).width + 70, bx = o.left ? x - 130 - w : x + 130, by = y - 60;
    rrect(ctx, bx, by - 52, w, 104, 40); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    if (o.left) { ctx.beginPath(); ctx.moveTo(bx + w - 20, by + 30); ctx.lineTo(bx + w + 30, by + 70); ctx.lineTo(bx + w - 60, by + 40); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(bx + 20, by + 30); ctx.lineTo(bx - 30, by + 70); ctx.lineTo(bx + 60, by + 40); ctx.closePath(); ctx.fill(); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C8346A'; ctx.fillText(txt, bx + 35, by + 2);
  }
  ctx.restore();
}

// ================================================================= THE HOOK
// Frame 1: his face, close, by candlelight, mid-bite into a lemon (the thumbnail's picture in action). "three hundred
// and eighty-two days": a torn calendar page 382 DAYS slaps onto the right of the frame; "bite a lemon... Now": he bites
// again, puckers hard, juice sprays; the badge asks the viewer to do it in their head.
SC.hook = (lt, t, shot) => {
  const c = cu();
  const bite1 = ramp(lt, 0, 0.25);
  const sour = clamp(0.55 + 0.45 * kick(t, 0.05, 1.5));
  const push = 2.9 + 0.3 * ramp(lt, 0, shot.end - shot.start, E.inOutSine);
  let cam = hutHeadCam(push, 760, 470);
  cam = shakeCam(cam, t, 3 + 8 * kick(t, c.n382, 5));
  hutNow(cam, t, { lemon: null, hero: { face: lerpFace(FACES.calm, FACES.sour, sour), L: HUT_ARMS.rest.L, R: HUT_ARMS.lemon.R, lemon: { k: 1, bite: 0.35 }, headRot: -0.05 * sour, headDY: -2 * bite1 } });
  const hp = toScreen(cam, ...hutHead({}));
  lemonSpray(hp[0] + 40, hp[1] + 70, cam.zoom * 0.5, ramp(lt, 0, 0.6), 3);
  screenSpace();
  // the calendar page: 382 DAYS
  const pg = pk(t, c.n382 - 0.05, 0.35);
  if (pg > 0.01) { ctx.save(); ctx.translate(1440, 430); ctx.rotate(0.08); ctx.scale(pg, pg); bbCalendar(0, 0, 0.95, 382, 0, t, { top: 'NO FOOD FOR', red: true }); ctx.restore(); }
  return hutPost({ zblur: 0.05 * (1 - ramp(lt, 0, 0.4)) });
};
// "But first... bite a lemon. In your head. Now." a cut in closer: the lemon at his lips; the badge asks the viewer to do
// it in their head; on "Now" he bites hard, puckers, the juice sprays and the camera kicks
SC.bite = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const bite2 = ramp(t, c.now - 0.15, c.now + 0.1), sour = Math.max(0.35, ramp(t, c.now, c.now + 0.25));
  let cam = ptCam(hutPt([20, -250]), 4.0 + 0.3 * ramp(lt, 0, D, E.inOutSine) + 0.4 * kick(t, c.now, 4), 900, 470);
  cam = shakeCam(cam, t, 3 + 12 * kick(t, c.now, 5));
  hutNow(cam, t, { lemon: null, hero: { face: lerpFace(FACES.hungry, FACES.sour, clamp(sour)), L: HUT_ARMS.rest.L, R: HUT_ARMS.lemon.R, lemon: { k: 1, bite: 0.5 + 0.35 * bite2 }, headRot: -0.05 * sour } });
  const hp = toScreen(cam, ...hutHead({}));
  lemonSpray(hp[0] + 40, hp[1] + 70, cam.zoom * 0.6, ramp(t, c.now, c.now + 0.7), 5);
  screenSpace();
  testBadge(['TRY IT', 'BITE A LEMON', 'IN YOUR HEAD'], ramp(t, c.bite - 0.1, c.bite + 0.25) * (1 - ramp(t, shot.end - 0.25, shot.end)));
  return hutPost({ zblur: 0.04 * kick(t, c.now, 6), flash: 0.18 * kick(t, c.now, 8) });
};
// "Your mouth just watered, right?" a round window opens on his cheek: inside, two little taps turn on and spit pours;
// his mouth waters (a drool drop); a tick: the viewer's own result
SC.water = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = hutHeadCam(2.7 + 0.2 * ramp(lt, 0, D), 720, 470);
  hutNow(cam, t, { lemon: { rind: 1 }, hero: { face: lerpFace(FACES.sour, FACES.hungry, ramp(lt, 0.1, 0.6)), drool: ramp(t, c.watered + 0.4, c.watered + 1.2), L: HUT_ARMS.rest.L, R: hutMixArms(HUT_ARMS.lemon, HUT_ARMS.rest, ramp(lt, 0, 0.5)).R,
    lemon: { k: 1 - ramp(lt, 0, 0.4), bite: 0.85 } } });
  const hp = toScreen(cam, ...hutHead({}));
  // the window on his cheek: the mouth's taps
  const wk = pk(t, c.watered - 0.1, 0.35);
  if (wk > 0.01) mouthTaps(1290, 430, 190 * wk, t, ramp(t, c.watered + 0.1, c.watered + 0.6), hp);
  screenSpace();
  tagPill('YOUR MOUTH: ON', 1290, 680, pk(t, c.watered + 0.5), '#7FE9FF', 46);
  return hutPost();
};
// the mouth's taps in a round window at (x, y) of radius R (screen space): two brass taps in the cheek wall, spit
// pouring from them (flow 0..1); a dashed leader back to his cheek (hp = his head on screen)
function mouthTaps(x, y, R, t, flow, hp) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (hp) { ctx.setLineDash([12, 12]); line(ctx, hp[0] + 50, hp[1] + 40, x - R * 0.8, y + R * 0.4, 4, 'rgba(255,255,255,0.7)'); ctx.setLineDash([]); }
  ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fillStyle = '#5A1A2A'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
  const s = R / 190;
  ctx.fillStyle = '#C8505E'; ctx.fillRect(x - R, y + 60 * s, 2 * R, R);           // the tongue below
  for (let i = -3; i <= 3; i++) { rrect(ctx, x + i * 46 * s - 18 * s, y - R, 36 * s, 60 * s, 10 * s); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }   // teeth above
  for (const sd of [-1, 1]) {
    const tx = x + sd * 80 * s, ty = y - 40 * s;
    rrect(ctx, tx - 30 * s, ty - 14 * s, 60 * s, 28 * s, 8 * s); ctx.fillStyle = '#E8C060'; ctx.fill();
    line(ctx, tx, ty - 14 * s, tx, ty - 40 * s, 10 * s, '#C8A040'); line(ctx, tx - 20 * s, ty - 40 * s, tx + 20 * s, ty - 40 * s, 10 * s, '#C8A040');
    rrect(ctx, tx + sd * 10 * s - 8 * s, ty + 10 * s, 16 * s, 24 * s, 4 * s); ctx.fillStyle = '#C8A040'; ctx.fill();
    if (flow > 0.01) {
      for (let k = 0; k < 6; k++) { const u = ((t * 2.2 + k / 6) % 1); circle(ctx, tx + sd * 10 * s + 3 * s * Math.sin(k), ty + 34 * s + 110 * s * u, (7 + 3 * flow) * s, `rgba(200,235,255,${0.9 * flow})`); }
      line(ctx, tx + sd * 10 * s, ty + 34 * s, tx + sd * 10 * s, ty + 34 * s + 110 * s * flow, 8 * s * flow, `rgba(200,235,255,${0.5 * flow})`);
    }
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
}
// "That's your body getting ready for food... from a thought." his body as the see-through diagram: the stomach lights
// up and the sign READY pops; a thought bubble with a lemon over the brain
SC.ready = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const V = ibMix(ibView([30, -230], [900, 600], 1.1), ibView([60, -190], [900, 590], 1.25), ramp(lt, 0, D, E.inOutSine));
  const rd = ramp(t, c.ready + 0.2, c.ready + 0.6);
  ibBody(V, t, { flex: 0, stomach: { glow: rd, wave: -1 }, liver: { fill: 1 }, straw: { flow: 0.6 }, brain: { mood: lt < 0.6 ? 'calm' : 'happy' }, heart: { beat: kick((t * 1.2) % 1, 0, 8) } });
  screenSpace();
  tagPill('READY!', ibPt(V, IB.stomach)[0] + 230, ibPt(V, IB.stomach)[1] - 60, pk(t, c.ready + 0.5), '#4DFFB4', 56);
  // the thought: a lemon over his head
  const tk = pk(t, c.thought - 0.1, 0.3);
  if (tk > 0.01) {
    const bp = ibPt(V, [260, -470]);
    ctx.save(); ctx.translate(bp[0], bp[1]); ctx.scale(tk, tk);
    circle(ctx, -110, 110, 12, '#FFFFFF'); circle(ctx, -80, 74, 18, '#FFFFFF'); ellipse(ctx, 0, 0, 110, 76, '#FFFFFF');
    lemonHalf(ctx, 0, 0, 0.9, t, {});
    ctx.restore();
  }
  return bodyPost({ push: { k: 1 + 0.04 * lt / D, cx: 960, cy: 520 } });
};
// "Now imagine the food never comes." the camera pulls all the way back: the hut, the storm against the window, the
// rind on his plate, the bar on the table; on "comes" the clock flips in: HOUR 0
SC.never = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const k = ramp(lt, 0, D, E.inOutCubic);
  const cam = mixCam(hutHeadCam(2.2, 760, 470), { x: 980, y: 520, zoom: 1.08, rot: 0 }, k);
  hutNow(cam, t, { hero: { face: lerpFace(FACES.hungry, FACES.worried, ramp(t, c.never - 0.2, c.never + 0.3)), drool: 1 - ramp(lt, 0, 0.8), headDX: 6 * ramp(t, c.never, c.never + 0.4), L: HUT_ARMS.rest.L, R: HUT_ARMS.rest.R } });
  return hutPost({ flash: 0.12 * kick(t, c.h0, 8) });
};

// ================================================================= THE WANT AND THE FOX
// "He climbed the mountain for one thing: Pip's favourite chocolate, from the shop at the top." The summit shop in the
// sun; he comes out of the door holding the bar up like a trophy; Pip's note slides in: BRING THE BIG ONE!
SC.want = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam({ x: 1100, y: 500, zoom: 1.1, rot: 0 }, { x: 1080, y: 540, zoom: 1.4, rot: 0 }, ramp(lt, 0, D, E.inOutSine));
  mtScene(cam, t, { day: 1, storm: 0, hut: false, after: () => {
    summitShop(ctx, 1330, MT.snowY, t);
    const up = ramp(t, c.pipsFav - 0.4, c.pipsFav + 0.1, E.outBack);
    const st = { x: 900 + 90 * ramp(lt, 0, 0.8), y: MT.snowY + 10, s: 0.62, face: lerpFace(FACES.calm, FACES.proud, up),
      pose: lerpPose(walkPose(t * 0.8), Object.assign({}, POSES.stand, { armR: { a: 2.6, b: 0.4 }, armL: { a: 0.3, b: 0.2 } }), up), seed: 4 };
    const r = drawCharacter(ctx, st, t, HUTPAL);
    const wr = toWorld(st, r.wrR);
    chocBar(ctx, wr[0] + 10, wr[1] - 40, 0.6 + 0.08 * kick(t, c.pipsFav, 5), t, { rot: -0.2, glow: up });
    if (up > 0.5) for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.05, rr = 120; line(ctx, wr[0] + Math.cos(a) * rr, wr[1] - 40 + Math.sin(a) * rr * 0.6, wr[0] + Math.cos(a) * (rr + 20), wr[1] - 40 + Math.sin(a) * (rr + 20) * 0.6, 5, `rgba(255,230,120,${up})`); }
  } });
  screenSpace();
  // Pip's note
  const nk = pk(t, c.pipsFav, 0.35);
  if (nk > 0.01) {
    ctx.save(); ctx.translate(430, 380); ctx.rotate(-0.07); ctx.scale(nk, nk);
    ctx.fillStyle = '#FFFDF4'; ctx.fillRect(-230, -150, 460, 300);
    ctx.fillStyle = 'rgba(255,134,166,0.25)'; for (let y = -110; y < 150; y += 40) ctx.fillRect(-230, y, 460, 3);
    ctx.font = '400 62px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C8346A'; ctx.fillText('BRING ME THE', 0, -70); ctx.fillText('BIG ONE!', 0, 6);
    ctx.font = '900 42px Montserrat'; ctx.fillStyle = '#6A2A9A'; ctx.fillText('LOVE, PIP', 30, 90);
    heartIcon(-130, 90, 0.5);
    ctx.restore();
  }
  tagPill('THAT MORNING', 960, 120, pk(t, shot.start + 0.15) * (1 - ramp(t, shot.start + 1.8, shot.start + 2.1)), '#FFFFFF', 46);
  return hutPost({ glow: 0.7, vhs: 0.7 * (1 - ramp(lt, 0, 0.35)) });
};
// "On the way down, a storm hit. He made it to an empty hut... and a fox made it to his food bag." Night, the storm; he
// trudges to the hut and goes in, his food bag left by the door; the fox darts in, grabs it and runs (the wordless beat)
SC.storm = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam({ x: 900, y: 520, zoom: 1.0, rot: 0 }, { x: 1080, y: 600, zoom: 1.35, rot: 0 }, ramp(lt, 0, D, E.inOutSine));
  mtScene(shakeCam(cam, t, 3), t, { day: 0, storm: 1, hut: { door: ramp(t, c.hut + 0.6, c.hut + 0.9) * (1 - ramp(t, c.hut + 1.5, c.hut + 1.8)) }, after: () => {
    // him, walking into the wind to the door, then gone inside
    const wk = ramp(t, shot.start, c.hut + 1.2, E.inOutSine);
    if (t < c.hut + 1.4) {
      const st = { x: lerp(560, MT.doorX - 10, wk), y: MT.snowY + 12, s: 0.5, face: FACES.worried, pose: Object.assign(walkPose(t), { lean: 0.12 }), seed: 4 };
      ctx.save(); ctx.globalAlpha = 1 - ramp(t, c.hut + 1.0, c.hut + 1.4);
      drawCharacter(ctx, st, t, HUTPAL);
      // the green food bag on his back, then dropped by the door
      if (t < c.hut + 0.9) { rrect(ctx, st.x - 70 * st.s * 1.4, st.y - 300 * st.s, 50, 70, 14); ctx.fillStyle = '#3E8A4A'; ctx.fill(); }
      ctx.restore();
    }
    const bagOnGround = t >= c.hut + 0.9 && t < c.grab;
    if (bagOnGround) { ctx.save(); ctx.translate(MT.doorX - 110, MT.snowY + 2); rrect(ctx, -26, -60, 52, 60, 14); ctx.fillStyle = '#3E8A4A'; ctx.fill(); ctx.font = '900 14px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('FOOD', 0, -24); ctx.restore(); }
    // the fox: creeps in from the right, grabs, runs off left
    if (t > c.foxW - 0.6) {
      const inK = ramp(t, c.foxW - 0.6, c.grab, E.outCubic), out = ramp(t, c.grab + 0.15, c.grab + 1.4, E.inCubic);
      const fx = t < c.grab + 0.15 ? lerp(1900, MT.doorX - 60, inK) : lerp(MT.doorX - 60, 300, out);
      foxRun(ctx, fx, MT.snowY + 18, 0.85, t, { dir: t < c.grab + 0.15 ? -1 : -1, bag: t >= c.grab ? 1 : 0, speed: t < c.grab ? 9 : 16 });
    }
  } });
  screenSpace();
  stampWord('STOLEN!', 640, 300, 140, '#FF5A6E', pk(t, c.grab + 0.3) * (1 - ramp(t, shot.end - 0.3, shot.end)), -0.1);
  return hutPost({ glow: 0.8, blur: [12 * kick(t, c.grab + 0.15, 4), 0] });
};
// "All he had left... was a lemon." inside: the lemon, close, in his hand; he looks at it; his deadpan; the clock ticks
SC.lemon = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam(ptCam(hutPt([60, -190]), 3.2, 960, 500), hutHeadCam(2.6, 860, 480), ramp(t, c.lemonW - 0.2, c.lemonW + 0.5, E.inOutCubic));
  hutNow(driftCam(cam, lt), t, { lemon: null, hero: { face: lerpFace(FACES.longing, FACES.deadpan, ramp(t, c.lemonW, c.lemonW + 0.3)), L: HUT_ARMS.rest.L, R: [70, -150], lemon: { k: 1, bite: 0.85 } } });
  return hutPost();
};
// "The radio says the storm could last a week. And Pip has one question: 'Is my chocolate okay?'" the radio crackles; the
// camera pushes to it; A WEEK; Pip's face pops above it with her question; he looks at the bar
SC.radio = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam(ptCam([HUT.radioX - 60, HUT.tableY - 160], 2.0, 820, 560), ptCam([HUT.chocX + 120, HUT.tableY - 200], 1.7, 900, 600), ramp(t, c.question - 0.3, c.question + 0.5, E.inOutCubic));
  const S = hutState(t);
  hutNow(cam, t, { radio: { talk: ramp(t, c.radioW, c.radioW + 0.2) * (1 - ramp(t, c.week + 0.6, c.week + 0.8)) + ramp(t, c.chocOK - 0.1, c.chocOK + 0.1) },
    choc: { glow: 0.4 + 0.5 * ramp(t, c.chocOK, c.chocOK + 0.4) },
    hero: { face: t < c.chocOK ? FACES.worried : lerpFace(FACES.worried, FACES.longing, ramp(t, c.chocOK, c.chocOK + 0.4)), L: HUT_ARMS.rest.L, R: HUT_ARMS.rest.R, headRot: 0.08 } });
  const rp = toScreen(cam, HUT.radioX - 34, HUT.tableY - 30);
  radioWaves(rp[0], rp[1], cam.zoom * 0.9, t, ramp(t, c.radioW, c.radioW + 0.2));
  screenSpace();
  stampWord('A WEEK?!', 1420, 260, 130, '#FF5A6E', pk(t, c.week) * (1 - ramp(t, c.question - 0.2, c.question + 0.1)), 0.08);
  pipCall(560, 300, pk(t, c.chocOK - 0.25), t, 'IS MY CHOCOLATE OK?');
  return hutPost();
};

// ================================================================= ACT 1: THE FIRST DAY
// "Hour four. His stomach growls." the hut, medium: his belly rumbles (shake lines, GRRR), his hand goes to it; the fox
// outside pricks up its ears
SC.growl = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(mixCam({ x: 960, y: 520, zoom: 1.3, rot: 0 }, hutHeadCam(1.7, 820, 420), ramp(lt, 0, D, E.inOutSine)), lt);
  const gr = ramp(t, c.growls, c.growls + 0.15) * (1 - ramp(t, c.growls + 1.4, c.growls + 1.8));
  hutNow(shakeCam(cam, t, 5 * gr), t, { fox: { face: gr > 0.3 ? 'curious' : 'sly', ears: 0.4 + 0.6 * gr, look: -1 },
    hero: { face: gr > 0.2 ? FACES.startled : FACES.calm, L: [10, -60], R: [40, -50], headDY: 4 * gr } });
  const bp = toScreen(cam, ...hutPt([0, -90]));
  if (gr > 0.01) { shockLines(bp[0], bp[1], 120 * cam.zoom * 0.6, gr, 10, '#FFD447', 4); }
  screenSpace();
  stampWord('GRRROWL', bp[0] + 330, bp[1] - 120, 120, '#FFD447', pk(t, c.growls + 0.1) * (1 - ramp(t, c.notAsking - 0.2, c.notAsking)), -0.1);
  return hutPost();
};
// "It's not asking for food... it's cleaning. Every couple of hours, an empty stomach squeezes out the leftovers." the
// diagram, close on the stomach: a ring of squeeze sweeps through it, pushing the last crumbs out; a broom tag
SC.clean = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const V = ibMix(ibView(IB.stomach, [960, 520], 2.6), ibView([IB.stomach[0] - 10, IB.stomach[1] + 10], [960, 500], 3.1), ramp(lt, 0, D, E.inOutSine));
  const wv = ((t - c.cleaning) * 0.55) % 1;
  ibBody(V, t, { flex: 0, stomach: { wave: t > c.cleaning - 0.3 ? Math.max(0, wv) : -1, glow: 0.15 }, liver: { fill: 0.95 }, straw: { flow: 0.6 }, brain: { mood: 'calm' } });
  screenSpace();
  tagPill('NOT HUNGRY...', 560, 230, pk(t, c.notAsking) * (1 - ramp(t, c.cleaning - 0.1, c.cleaning + 0.1)), '#FF86A6', 50);
  tagPill('CLEANING!', 560, 230, pk(t, c.cleaning), '#4DFFB4', 58);
  tagPill('EVERY ~2 HOURS', 1400, 860, pk(t, c.every), '#FFD447', 46);
  return bodyPost();
};
// "With nothing in there... it echoes." back in the hut, wide: the growl rings bounce round the log walls, the kettle
// rattles; the fox, outside, tilts its head
SC.echo = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(mixCam({ x: 1000, y: 520, zoom: 1.12, rot: 0 }, { x: 1040, y: 500, zoom: 1.2, rot: 0 }, ramp(lt, 0, D)), lt);
  const ec = ramp(t, c.echoes, c.echoes + 0.2);
  hutNow(shakeCam(cam, t, 3 * ec), t, { fox: { face: 'curious', ears: 1, tilt: 0.25 * ec, look: -1 }, hero: { face: lerpFace(FACES.deadpan, FACES.nervous, ec), L: [10, -60], R: [40, -50] } });
  if (ec > 0.01) {
    const bp = toScreen(cam, ...hutPt([0, -90]));
    for (let i = 0; i < 4; i++) {
      const u = ((t - c.echoes) * 0.7 + i / 4) % 1;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath(); ctx.ellipse(bp[0], bp[1], 120 + 900 * u, 60 + 420 * u, 0, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,214,120,${0.6 * ec * (1 - u)})`; ctx.stroke();
      ctx.restore();
    }
  }
  screenSpace();
  ['GRRR', 'grrr', 'grr'].forEach((w, i) => stampWord(w, 1250 + i * 170, 330 + i * 70, 100 - i * 24, '#FFD447', pk(t, c.echoes + 0.15 + i * 0.25) * (1 - ramp(t, shot.end - 0.2, shot.end)), -0.1 + i * 0.1));
  return hutPost();
};
// "Hour six. Lunchtime... and here comes the hunger, right on time." him, close, staring at the bar; the diagram's
// alarm clock rings on his stomach in a window
SC.alarm = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = driftCam(hutHeadCam(2.3 + 0.2 * ramp(lt, 0, D), 760, 480), lt);
  const hun = ramp(t, c.hunger - 0.2, c.hunger + 0.3);
  hutNow(shakeCam(cam, t, 4 * ramp(t, c.onTime, c.onTime + 0.1) * (1 - ramp(t, c.onTime + 0.8, c.onTime + 1.2))), t, { choc: { glow: 0.4 + 0.6 * hun },
    hero: { face: lerpFace(FACES.calm, FACES.hungry, hun), drool: 0.6 * ramp(t, c.onTime, c.onTime + 0.6), L: [10, -60], R: [40, -50] } });
  screenSpace();
  const rk = pk(t, c.lunch - 0.1, 0.3);
  if (rk > 0.01) {   // a round window: the alarm clock on his stomach, ringing at 12:00
    ctx.save(); ctx.translate(1450, 420); ctx.scale(rk, rk);
    ctx.beginPath(); ctx.arc(0, 0, 230, 0, 7); ctx.fillStyle = '#0A1A3A'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 230, 0, 7); ctx.clip();
    ibBody(ibView([IB.stomach[0] + 40, IB.stomach[1] - 120], [1450, 400], 2.3), t, { flex: 0, stomach: { glow: 0.2 }, alarm: { ring: ramp(t, c.hunger - 0.1, c.hunger + 0.1), hour: 12 } });
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, 230, 0, 7); ctx.lineWidth = 9; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
    ctx.restore();
  }
  tagPill('12:00', 1450, 700, pk(t, c.lunch + 0.2), '#FFD447', 56);
  return hutPost();
};
// "It's not a fuel gauge. It's an alarm clock: your body learned when you eat." a car's fuel gauge pops and gets
// crossed out; the alarm clock bounces in; a day strip 8:00 · 12:00 · 19:00 with a bell on each
SC.clock = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1A1030', '#05030C'); screenSpace();
  const push = 1 + 0.05 * lt / D;
  // the gauge (left)
  const gk = pk(t, shot.start, 0.35), x1 = 620, y1 = 430;
  if (gk > 0.01) {
    ctx.save(); ctx.translate(x1, y1); ctx.scale(gk, gk);
    ctx.beginPath(); ctx.arc(0, 0, 200, Math.PI, 0); ctx.lineTo(200, 30); ctx.lineTo(-200, 30); ctx.closePath(); ctx.fillStyle = '#20263A'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 160, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 18; ctx.strokeStyle = '#3A4460'; ctx.stroke();
    ctx.font = '400 54px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = '#FF5A6E'; ctx.fillText('E', -150, -20); ctx.fillStyle = '#4DFFB4'; ctx.fillText('F', 150, -20);
    const a = Math.PI * (1.15 + 0.05 * Math.sin(t * 3)); line(ctx, 0, 0, Math.cos(a) * 140, Math.sin(a) * 140, 10, '#FF9A3C'); circle(ctx, 0, 0, 16, '#FFFFFF');
    ctx.font = '900 34px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('FUEL GAUGE', 0, 90);
    ctx.restore();
    bigX(x1, y1 - 40, 0.95 * gk, ramp(t, c.gaugeEnd + 0.05, c.gaugeEnd + 0.35));
  }
  // the alarm clock (right), ringing
  const ak = pk(t, c.alarmW - 0.05, 0.35);
  if (ak > 0.01) ibAlarm(t, 1300, 400, 2.1 * ak, { ring: ramp(t, c.alarmW, c.alarmW + 0.2) * (1 - ramp(t, c.learned + 0.2, c.learned + 0.5)), hour: 12 });
  // the day strip with the meal times
  const sk = ramp(t, c.learned - 0.1, c.learned + 0.4);
  if (sk > 0.01) {
    const times = ['8:00', '12:00', '19:00'];
    times.forEach((tm, i) => {
      const k = pk(t, c.learned + 0.15 * i, 0.3), x = 640 + i * 330, y = 840;
      if (k <= 0.01) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      rrect(ctx, -130, -55, 260, 110, 30); ctx.fillStyle = i === 1 ? '#FFD447' : '#2A3050'; ctx.fill();
      ctx.font = '400 64px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = i === 1 ? '#2A1A0A' : '#FFFFFF'; ctx.fillText(tm, 0, 4);
      ctx.restore();
    });
  }
  return bodyPost({ push: { k: push, cx: 960, cy: 500 } });
};
// "Ignore it... and it goes quiet. Until dinner." the alarm clock stops ringing, yawns and dozes (z z z); on "Until
// dinner" it twitches one eye open: 19:00
SC.snooze = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1A1030', '#05030C'); screenSpace();
  const sl = ramp(t, c.goesQuiet - 0.2, c.goesQuiet + 0.4), din = ramp(t, c.dinner, c.dinner + 0.15);
  ibAlarm(t, 960, 470, 2.6, { ring: 0.4 * din * (1 - ramp(t, c.dinner + 0.6, c.dinner + 0.9)), hour: lerp(12, 19, ramp(lt, 0, D)), sleep: sl * (1 - din) });
  screenSpace();
  tagPill('SNOOZE', 960, 820, pk(t, c.goesQuiet + 0.2) * (1 - din), '#C8A8FF', 56);
  tagPill('19:00', 960, 820, pk(t, c.dinner), '#FFD447', 64);
  return bodyPost({ push: { k: 1 + 0.06 * lt / D, cx: 960, cy: 470 } });
};
// "Make a fist. Squeeze." him, close, raising his fist and squeezing (knuckles whiten); the badge: the viewer does it too
SC.fist = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const sq = ramp(t, c.squeeze - 0.05, c.squeeze + 0.2);
  const cam = driftCam(hutHeadCam(2.6 + 0.2 * sq, 760, 560), lt);
  hutNow(shakeCam(cam, t, 2 * sq), t, { hero: { face: lerpFace(FACES.calm, FACES.nervous, 0.6 * sq), fist: 0.3 + 0.7 * sq, L: HUT_ARMS.rest.L, R: hutMixArms(HUT_ARMS.rest, HUT_ARMS.fist, ramp(lt, 0, 0.4)).R } });
  screenSpace();
  testBadge(['TRY IT', 'MAKE A FIST', 'SQUEEZE'], ramp(t, c.fistW - 0.1, c.fistW + 0.3) * (1 - ramp(t, shot.end - 0.25, shot.end)));
  return hutPost();
};
// "Your muscles keep sugar for themselves. Your brain lives on the stash in your liver... about one day's worth." the
// diagram: his raised arm's muscle glows with its own sugar and a padlock; the camera travels down the arm to the liver
// pantry full of gold jars and up the straw to the brain, sipping; ONE DAY
SC.pantry = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A1A3A', '#02040C'); screenSpace();
  const k1 = ramp(t, c.brainLives - 0.3, c.brainLives + 0.6, E.inOutCubic), k2 = ramp(t, c.oneDay - 0.6, c.oneDay + 0.2, E.inOutCubic);
  const V = ibMix(ibMix(ibView(IB.muscle, [900, 560], 2.4), ibView(IB.liver, [760, 600], 2.4), k1), ibView([-40, -200], [900, 520], 1.35), k2);
  ibBody(V, t, { flex: 1, muscle: { lit: 1 - 0.6 * k1, lock: ramp(t, c.muscles + 0.4, c.muscles + 0.8) }, liver: { fill: 1, glow: 1 }, straw: { flow: k1 }, brain: { mood: k1 > 0.5 ? 'sip' : 'calm' }, stomach: {} });
  screenSpace();
  tagPill('FOR MUSCLES ONLY', 1380, 300, pk(t, c.muscles + 0.4) * (1 - k1), '#FF86A6', 48);
  ibTag(V, 'THE LIVER\'S STASH', 1300, 820, IB.liver, pk(t, c.liverW) * (1 - ramp(t, c.oneDay - 0.6, c.oneDay - 0.3)), '#FFD447', 48);
  tagPill('1–2 DAYS', 1380, 380, pk(t, c.oneDay), '#FFD447', 70);
  return bodyPost();
};
// "Hour eighteen. The stash is almost gone, and he just lost an argument... with a fox." the pantry, one jar left, the
// brain slurping air through its straw; then the hut: he shouts at the window, the fox yawns, licks its lips and turns
// its back (he loses)
SC.hangry = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  if (t < c.argument - 0.15) {
    darkBg('#0A1A3A', '#02040C'); screenSpace();
    const V = ibView([-40, -200], [960, 520], 1.6 + 0.15 * ramp(lt, 0, 2));
    ibBody(V, t, { flex: 0, liver: { fill: 0.3, glow: 1 }, straw: { flow: 0.2, empty: ramp(t, c.almost, c.almost + 0.3) }, brain: { mood: t > c.almost ? 'slurp' : 'worry' } });
    screenSpace();
    tagPill('RUNNING LOW', 1350, 820, pk(t, c.almost), '#FF5A6E', 52);
    return bodyPost();
  }
  const a0 = c.argument - 0.15;
  const cam = driftCam(mixCam({ x: 1150, y: 480, zoom: 1.45, rot: 0 }, { x: 1180, y: 470, zoom: 1.6, rot: 0 }, ramp(t, a0, shot.end)), lt);
  const lose = ramp(t, c.withFox - 0.1, c.withFox + 0.3);
  hutNow(cam, t, { fox: { face: lose > 0.5 ? 'smug' : 'sly', lick: lose * (0.5 + 0.5 * Math.sin(t * 9)), look: -1, tilt: -0.1 * lose },
    hero: { face: lose > 0.5 ? FACES.deadpan : FACES.shout, L: HUT_ARMS.rest.L, R: lose > 0.5 ? HUT_ARMS.rest.R : HUT_ARMS.shout.R, headRot: 0.12 * (1 - lose), headDX: 10 * (1 - lose) } });
  if (lose < 0.5) { const hp = toScreen(cam, ...hutHead({})); screenSpace(); speech('MY FOOD!', hp[0] + 260, hp[1] - 160, pk(t, a0 + 0.1), '#FF5A6E', 70, -0.06); }
  return hutPost();
};
// "Day one. And this... is the easy part." outside, wide: the hut tiny under the storm, the clock flips to DAY 1; on
// "the easy part" the wind howls and the camera pulls back further (the stakes go up)
SC.easy = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = mixCam({ x: 1250, y: 620, zoom: 1.6, rot: 0 }, { x: 980, y: 480, zoom: 0.95, rot: 0 }, ramp(lt, 0, D, E.inOutCubic));
  mtScene(shakeCam(cam, t, 2 + 4 * ramp(t, c.easyPart, c.easyPart + 0.3)), t, { day: 0, storm: 1 });
  return hutPost({ glow: 0.8 });
};
