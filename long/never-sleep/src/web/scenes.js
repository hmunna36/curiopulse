// What Happens If You NEVER Sleep? (Day by Day) — the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds
// in the shot, t = seconds in the video) and returns post options for main.js. Every beat comes from a cue.
// The film: he wants to be the champion of NOT sleeping (his cat is the champion of sleeping) and get into the record
// book; his brain switches itself off piece by piece; the record book refuses him; past the record, rats and flies
// die and nobody fully knows why; even jellyfish sleep; he gives up the record and sleeps, the book as his pillow, the
// cat on him. Colour script: morning gold → night blue → a false dawn → sickly violet days → sepia 1964 → clinical
// teal → ocean blue → dawn gold.
'use strict';

const cu = () => TLd.cues;
const SHOT = (id) => TLd.shots.find((s) => s.id === id);
const env2 = (t, a, b, r = 0.2) => Math.min(ramp(t, a, a + r), 1 - ramp(t, b - r, b));
const pop = (t, a, d = 0.3) => E.outBack(clamp((t - a) / d), 2);

// ---------------------------------------------------------------- how worn out he looks, from the clock
function hoursAwake(t) {
  const L = TLd.cues.clock, s = clockState(t);
  if (!s.cur) return 0;
  const m = /HOUR (\d+)/.exec(s.cur[1]), d = /DAY (\d+)/.exec(s.cur[1]);
  if (s.cur[2] === 'sleep') return 0;
  if (m) return +m[1];
  if (d && s.cur[3] !== 'RANDY, 1964') return 24 * +d[1];
  return 264;
}
function worn(face, t, extra = {}) {
  const h = Math.min(hoursAwake(t), 264);
  const k = clamp(h / 72);
  return Object.assign({}, face, { bags: clamp(0.15 + h / 60) * (h > 8 ? 1 : 0), red: clamp((h - 12) / 50) }, extra);
}
const frizzAt = (t) => clamp((hoursAwake(t) - 30) / 60);

// ---------------------------------------------------------------- the living room with everything in it
// o: {day 0..1, dawn 0..1 (sun in the window), lamp, clockHrs, coat (0..1 alive), coatLook, cat {x,y,s,...},
//     hero(cam) draws him, table(cam) extra props, book {open, stamp, right}, pot {..}, noPot, donuts n, tint}
function homeSet2(cam, t, o = {}) {
  homeBack(cam, t, { day: o.day || 0 });
  applyCam(cam);
  windowSky(t, o.dawn || 0);
  wallClock(ctx, 1330, 330, 66, o.clockHrs === undefined ? 7 + hoursAwake(t) + (t % 60) / 60 : o.clockHrs, { spin: o.spin || 0 });
  coatHook(ctx, 1452, 296, 1, t, o.coat || 0, o.coatLook || 0);
  homeLamp(t, o.lamp === undefined ? 1 - (o.day || 0) : o.lamp);
  couchBackL(o.day || 0);
  const cat = Object.assign({ x: 1095, y: 712, s: 0.72 }, o.cat || {});
  if (!o.noCat && !cat.after) catCurl(ctx, cat.x, cat.y, cat.s, t, cat);
  if (o.hero) o.hero(cam);
  applyCam(cam);
  couchFrontL(o.day || 0);
  if (!o.noCat && cat.after) { applyCam(cam); catCurl(ctx, cat.x, cat.y, cat.s, t, cat); }
  // the coffee table and what is on it
  applyCam(cam);
  if (!o.noTable) {
    rrect(ctx, 520, 828, 780, 34, 10); ctx.fillStyle = '#5A3A2A'; ctx.fill();
    rrect(ctx, 520, 828, 780, 10, 6); ctx.fillStyle = '#7A5238'; ctx.fill();
    for (const lx of [560, 1260]) { ctx.fillStyle = '#3A2418'; ctx.fillRect(lx - 8, 862, 16, 40); }
    if (!o.noPot) coffeePot(ctx, 600, 830, 0.62, t, Object.assign({ level: 0.15 }, o.pot || {}));
    if (o.donuts) donutTower(ctx, 1210, 822, 0.62, o.donuts, t);
    const bk = Object.assign({ open: 1 }, o.book || {});
    if (!o.noBook) recordBook(ctx, o.bookX || 830, 830, o.bookW || 320, t, bk);
    if (o.table) o.table(cam);
  }
}
// the night/day grade per moment
const nightPost = (x = {}) => Object.assign({ glow: 0.8, tint: '#B8C8FF', tintA: 0.16 }, x);
const dayPost = (x = {}) => Object.assign({ glow: 0.75, tint: '#FFE6C0', tintA: 0.08 }, x);
const sickPost = (x = {}) => Object.assign({ glow: 0.85, tint: '#C8B0FF', tintA: 0.22, desat: 0.15 }, x);

// a wobble of the whole frame (day three): horizontal strips shifted by a slow sine (post.overlay)
function warpFrame(a, t) {
  if (a <= 0.01) return;
  tmpx.setTransform(1, 0, 0, 1, 0, 0);
  tmpx.globalCompositeOperation = 'copy'; tmpx.drawImage(mainC, 0, 0); tmpx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let y = 0; y < H; y += 8) {
    const dx = a * 14 * Math.sin(y * 0.012 + t * 2.4) + a * 6 * Math.sin(y * 0.031 - t * 1.7);
    ctx.drawImage(tmpC, 0, y, W, 8, dx, y, W, 8);
  }
}
// a label pill in screen space that pops on a cue
function tag(txt, x, y, t, at, col = '#FFD447', size = 48) { pill(x, y, txt, col, ramp(t, at, at + 0.3), size); }
// a small cartoon hand (for inserts): wrist at (x, y), pointing along ang; o.finger extends the index
function bigHand(c, x, y, s, ang, pal = HOMEPAL, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  rrect(c, -150, -40, 160, 80, 30); c.fillStyle = pal.coat; c.fill();
  rrect(c, -10, -46, 30, 92, 12); c.fillStyle = pal.coatSh; c.fill();
  ellipse(c, 60, 0, 58, 46, pal.skin);
  for (let i = 0; i < 3; i++) ellipse(c, 92, -22 + i * 20 + 10, 26, 12, pal.skinSh);
  if (o.finger !== false) { rrect(c, 80, -44, 90, 26, 13); c.fillStyle = pal.skin; c.fill(); }
  ellipse(c, 50, -40, 22, 14, pal.skin, -0.6);
  c.restore();
}

// ================================================================= ACT 0: the hook (one shot, 0:00 to the cat)
// Frame 1: his face, close, the pot tipped at his mouth (the thumbnail's picture). Morning. The camera pulls back to
// the room on "Day by day" and travels to the record book on "the record".
function potAtMouth(k, t) {
  // k: 1 = pot at his mouth, 0 = back on the table. Returns {x, y, tilt, s, hand (world)}
  const s = 0.62, th = lerp(0, -2.25 + 0.06 * Math.sin(t * 9), k);
  const mouth = [HOME.hx, HOME.seatY - 282 * HOME.hs + 40 * HOME.hs + 6];
  const sp = [78 * s, -186 * s], R = (p) => [p[0] * Math.cos(th) - p[1] * Math.sin(th), p[0] * Math.sin(th) + p[1] * Math.cos(th)];
  const atMouth = [mouth[0] - R(sp)[0], mouth[1] - R(sp)[1]];
  const x = lerp(600, atMouth[0], k), y = lerp(830, atMouth[1], k);
  const hd = R([-96 * s, -116 * s]);
  return { x, y, tilt: th, s, hand: [x + hd[0], y + hd[1]], mouth, spout: [x + R(sp)[0], y + R(sp)[1]] };
}
SC.hook = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 830, 452, 3.05], [c.chug_end, 820, 462, 2.6], [c.daybyday - 0.3, 900, 560, 1.12],
    [c.record1 - 0.4, 860, 700, 1.55], [D, 870, 715, 1.68]]);
  const lower = ramp(t, c.chug_end, c.chug_end + 0.7, E.inOutCubic), k = 1 - lower;
  const P = potAtMouth(k, t), lvl = lerp(0.75, 0.15, ramp(t, 0, c.chug_end));
  const gulp = k > 0.5 ? Math.abs(Math.sin(t * 7.5)) : 0;
  homeSet2(cam, t, { day: 1, lamp: 0, noPot: true, book: { open: 1, glow: ramp(t, c.record1 - 0.3, c.record1 + 0.3) },
    hero: (cm) => {
      const st = { x: HOME.hx, y: HOME.seatY, s: HOME.hs };
      const hand = ikLocal(st, P.hand[0], P.hand[1]);
      const face = k > 0.5 ? Object.assign({}, FACES.wired, { mouth: 'o', mouthOpen: 0.9, eyeOpen: 1.5, blink: 0 })
        : Object.assign({}, FACES.wired, { lookX: lerp(0, 0.6, ramp(t, c.daybyday, c.record1)), lookY: lerp(0, 0.5, ramp(t, c.daybyday, c.record1)) });
      heroSeated(cm, t, { face, R: k > 0.02 || lower < 1 ? hand : [58, -36], bendR: 1, headDY: -3 * gulp, headRot: -0.12 * k,
        L: [-40 + 20 * Math.sin(t * 3) * (1 - k), -60], bendL: -1 }, { warm: 0.6, warmX: 260, warmCol: '#FFE6B0' });
      applyCam(cm);
      coffeePot(ctx, P.x, P.y, P.s, t, { tilt: P.tilt, level: lvl });
      if (k > 0.6) {   // the stream of coffee into his mouth
        const [ax, ay] = P.spout, [bx, by] = P.mouth;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + bx) / 2 + 4 * Math.sin(t * 20), Math.min(ay, by) - 4, bx + 6, by);
        ctx.lineWidth = 9; ctx.strokeStyle = COFFEE; ctx.lineCap = 'round'; ctx.stroke();
      }
      if (k < 0.5) shockLines(...toScreen(cm, HOME.hx, 470), 110, ramp(t, c.chug_end + 0.1, c.chug_end + 0.6), 10, '#FFE08A', 4);
    } });
  return dayPost({ zblur: 0.02 * ramp(lt, 0.05, 0.3) * (1 - ramp(lt, 0.3, 0.6)) });
};

// The cat: asleep on the other seat. The champion of sleeping.
SC.cat = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1090, 640, 2.7], [D, 1080, 650, 2.95]], E.inOutSine);
  homeSet2(cam, t, { day: 1, lamp: 0, cat: { zzz: 1, ear: env2(lt, 0.8, 1.3) }, hero: (cm) => heroSeated(cm, t, { face: FACES.wired }) });
  return dayPost();
};
// "So he'll be the champion of NOT sleeping": the #1 mug raised like a trophy
SC.champion = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 800, 520, 1.6], [D, 810, 500, 1.85]]);
  const up = ramp(t, c.champion - 0.2, c.champion + 0.35, E.outBack);
  homeSet2(cam, t, { day: 1, lamp: 0, cat: { zzz: 1 }, hero: (cm) => {
    const r = heroSeated(cm, t, { face: lerpFace(FACES.wired, FACES.proud, up), R: [lerp(58, 100, up), lerp(-60, -420, up)], bendR: 1, headRot: -0.08 * up }, { warm: 0.6, warmX: 260, warmCol: '#FFE6B0' });
    const wr = toWorld(r.st, r.r.wrR);
    applyCam(cm); mug(ctx, wr[0] + 6, wr[1] + 30, 0.6, t, { word: '#1', steam: 1 });
    if (up > 0.8) for (let i = 0; i < 6; i++) { const a = t * 2 + i; const rr = 90 + 20 * Math.sin(t * 5 + i); line(ctx, wr[0] + Math.cos(a) * rr, wr[1] - 10 + Math.sin(a) * rr, wr[0] + Math.cos(a) * (rr + 22), wr[1] - 10 + Math.sin(a) * (rr + 22), 5, '#FFE08A'); }
    softDot(gctx, wr[0], wr[1], 120, '#FFD447', 0.5 * up);
  } });
  return dayPost();
};
// The record book, close: LONGEST TIME AWAKE · 11 DAYS; his finger taps it
SC.book = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 830, 700, 2.4], [D, 840, 705, 2.7]], E.inOutSine);
  homeSet2(cam, t, { day: 1, lamp: 0, cat: { zzz: 1 }, book: { open: 1, glow: 0.6 }, hero: (cm) => heroSeated(cm, t, { face: FACES.proud }) });
  applyCam(cam);
  const tap = Math.max(0, Math.sin(Math.min(1, ramp(t, c.hard - 0.9, c.hard - 0.1)) * Math.PI * 3)) * (t < c.hard ? 1 : 0);
  bigHand(ctx, 1110, 760 - 14 * tap, 0.4, Math.PI + 0.25);
  return dayPost();
};
// "Very." Hard cut: the whole room from far, the clock, him small and smug, the cat
SC.very = (lt, t, shot) => {
  const cam = { x: 960, y: 560, zoom: 0.92 + 0.02 * lt, rot: 0 };
  homeSet2(cam, t, { day: 1, lamp: 0, cat: { zzz: 1 }, hero: (cm) => heroSeated(cm, t, { face: FACES.proud }) });
  return dayPost({ desat: 0.2 });
};

// ================================================================= ACT 1: the first night and day
// The head in profile with a glass dome where the brain is: the violet pile heaps up, hour by hour
function headProfile(cx, cy, s, fill = '#2A1A4A') {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.beginPath(); smoothPath(ctx, BH.outline); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 6 / s; ctx.strokeStyle = 'rgba(200,180,255,0.6)'; ctx.stroke();
  // the eye (wide open)
  ellipse(ctx, 210, -110, 26, 20, '#F4F0FF'); circle(ctx, 222, -110, 9, '#1A1030');
  ctx.restore();
}
SC.pile = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1E1040', '#05030E');
  screenSpace();
  const k = 1 + 0.06 * lt / D;
  ctx.save(); ctx.translate(960, 540); ctx.scale(k, k); ctx.translate(-960, -540);
  headProfile(760, 560, 1.32);
  const lvl = lerp(0.42, 0.66, ramp(t, c.chemical, c.sleepier + 0.6, E.inOutSine));
  adenPile(ctx, 700, 520, 470, lvl, t);
  // the SLEEPY gauge on the right
  const gx = 1520, gy = 740, gh = 420;
  rrect(ctx, gx - 40, gy - gh, 80, gh, 40); ctx.fillStyle = 'rgba(20,14,40,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#C8A8FF'; ctx.stroke();
  const fh = gh * lerp(0.35, 0.72, ramp(t, c.bigger, c.sleepier + 0.4));
  rrect(ctx, gx - 30, gy - fh, 60, fh - 10, 30); ctx.fillStyle = ADEN; ctx.fill();
  softDot(gctx, gx, gy - fh, 80, '#C8A8FF', 0.6);
  ctx.restore();
  bigWord('SLEEPY', 1520, 260, 64, '#C8A8FF', pop(t, c.sleepier - 0.2), 0.0);
  tag('ADENOSINE', 700, 160, t, c.chemical, '#C8A8FF', 46);
  return { glow: 0.9, zblur: 0.08 * (1 - ramp(lt, 0, 0.3)) };
};
// The locks: coffee beans plug the cups first; tape goes over the TIRED lamp; the pile keeps growing behind it
SC.locks = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A0E2A', '#08030A');
  screenSpace();
  const k = 1 + 0.05 * lt / D;
  ctx.save(); ctx.translate(960, 560); ctx.scale(k, k); ctx.translate(-960, -560);
  adenPile(ctx, 330, 560, 380, lerp(0.66, 0.78, ramp(lt, 0, D)), t, { hidden: ramp(t, c.tape - 0.2, c.tape + 0.6) });
  lockRow(ctx, 760, 1660, 690, 5, t, () => 2, (i) => (t - c.plugs + 0.6 - i * 0.18) * 1.6, 40);
  for (let i = 0; i < 4; i++) adenBall(ctx, 820 + i * 230 + 20 * Math.sin(t * 2 + i), 560 + 18 * Math.sin(t * 3 + i * 2), 30, t, i);   // locked out
  tiredLamp(ctx, 1220, 280, 78, 1, ramp(t, c.tape - 0.1, c.tape + 0.5), t);
  ctx.restore();
  tag('CAFFEINE', 1210, 940 - 30, t, c.plugs, '#FF9A3C', 44);
  return { glow: 0.9 };
};
// His face: wide awake and not less tired
SC.blind = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 810, 490, 2.9], [D, 805, 495, 3.2]], E.inOutSine);
  const tw = t > c.cant ? 0.6 * Math.max(0, Math.sin(t * 30)) : 0;
  homeSet2(cam, t, { lamp: 1, cat: { zzz: 1 }, hero: (cm) => {
    const r = heroSeated(cm, t, { face: worn(Object.assign({}, FACES.wired, { blink: tw * 0.6, lookX: 0.1 * Math.sin(t * 13) }), t, { bags: 0.45 }), R: [40, -150], bendR: 1 });
    const wr = toWorld(r.st, r.r.wrR); applyCam(cm); mug(ctx, wr[0], wr[1] + 34, 0.6, t, { word: '#1', steam: 0.6 });
  } });
  return nightPost();
};
// Hour 17: two of him side by side. 17 HOURS AWAKE = A FEW DRINKS. The meter: 0.05 %
SC.drunk = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#14204A', '#04060F');
  screenSpace();
  for (const [x, col] of [[480, '#7FE9FF'], [1440, '#FF86A6']]) { softDot(ctx, x, 560, 520, col, 0.12); }
  line(ctx, 960, 130, 960, 840, 6, 'rgba(255,255,255,0.18)');
  const sway = (ph) => 0.09 * Math.sin(t * 1.9 + ph);
  const cam = { x: 960, y: 540, zoom: 1, rot: 0 };
  for (const [x, side] of [[480, 0], [1440, 1]]) {
    const p = Object.assign({}, POSES.stand, { lean: sway(0) });
    const pose = ikReach(ikReach(p, 'L', [-120, -200 + 30 * Math.sin(t * 2)], 1), 'R', [130, -230 - 30 * Math.sin(t * 2.3)], 1);
    figure(cam, { x: x + 20 * Math.sin(t * 1.9), y: 900, s: 1.05, pose, face: worn(Object.assign({}, FACES.dazed, { cross: 0 }), t, { bags: side ? 0 : 0.5 }), seed: 4,
      headRot: sway(1) * 1.4 }, t, { pal: HOMEPAL, ambient: 0.1, post: (lc, r) => {
      if (side) {   // a party hat and a glass with a straw
        const [hx, hy] = r.head; lc.save(); lc.translate(hx, hy - 60); lc.rotate(0.2);
        lc.beginPath(); lc.moveTo(-36, 0); lc.lineTo(0, -90); lc.lineTo(36, 0); lc.closePath(); lc.fillStyle = '#FF5A6E'; lc.fill();
        circle(lc, 0, -92, 12, '#FFD447'); lc.restore();
        const wr = r.wrR; lc.save(); lc.translate(wr[0] + 10, wr[1]);
        lc.beginPath(); lc.moveTo(-26, -60); lc.lineTo(26, -60); lc.lineTo(0, -10); lc.closePath(); lc.fillStyle = 'rgba(200,240,255,0.7)'; lc.fill();
        line(lc, 0, -10, 0, 30, 5, 'rgba(200,240,255,0.8)'); line(lc, 10, -60, 26, -96, 4, '#FF86A6'); lc.restore();
      }
    } });
  }
  bigWord('17 HOURS AWAKE', 480, 190, 92, '#7FE9FF', pop(t, shot.start + 0.2));
  bigWord('A FEW DRINKS', 1440, 190, 92, '#FF86A6', pop(t, c.drinks - 0.3));
  bigWord('=', 960, 470, 170, '#FFFFFF', pop(t, c.drinks + 0.2));
  // the meter on "limit"
  const mk = ramp(t, c.limit - 0.2, c.limit + 0.4, E.outBack);
  if (mk > 0) { ctx.save(); ctx.translate(960, 700); ctx.scale(mk, mk); rrect(ctx, -170, -70, 340, 140, 24); ctx.fillStyle = 'rgba(8,10,28,0.92)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#FF5A6E'; ctx.stroke();
    ctx.font = '400 92px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FF5A6E'; ctx.fillText('0.05%', 0, 6); ctx.restore(); }
  return { glow: 0.85 };
};
// He butters his phone
SC.toast = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A1A12', '#0A0604');
  screenSpace();
  const k = 1 + 0.05 * lt / D;
  ctx.save(); ctx.translate(960, 600); ctx.scale(k, k); ctx.translate(-960, -600);
  // the table top, a plate with toast (untouched), the phone being buttered
  ctx.fillStyle = '#5A3A2A'; ctx.fillRect(0, 640, W, 500); ctx.fillStyle = '#7A5238'; ctx.fillRect(0, 640, W, 16);
  softDot(ctx, 960, 400, 900, '#FFC870', 0.12);
  ellipse(ctx, 520, 740, 230, 70, '#F4F6FF'); ellipse(ctx, 520, 734, 190, 54, '#E4E8F4');
  rrect(ctx, 420, 650, 200, 120, 30); ctx.fillStyle = '#E8B060'; ctx.fill(); rrect(ctx, 436, 664, 168, 92, 22); ctx.fillStyle = '#F4D49A'; ctx.fill();
  // the phone, lit, with a smear of butter growing on it
  ctx.save(); ctx.translate(1180, 700); ctx.rotate(-0.08);
  rrect(ctx, -110, -200, 220, 400, 30); ctx.fillStyle = '#14161E'; ctx.fill(); rrect(ctx, -96, -184, 192, 368, 20); ctx.fillStyle = '#3A6AD8'; ctx.fill();
  const buzz = t > c.phone ? 6 * Math.sin(t * 80) * env2(t, c.phone, c.phone + 0.6, 0.05) : 0;
  ctx.translate(buzz, 0);
  const sm = ramp(lt, 0.2, D - 0.4);
  ctx.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, x = -80 + 160 * u * sm, y = -40 + 30 * Math.sin(u * 9 + 1); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  ctx.lineWidth = 60; ctx.strokeStyle = '#FFE58A'; ctx.lineCap = 'round'; if (sm > 0.02) ctx.stroke();
  ctx.restore();
  softDot(gctx, 1180, 700, 260, '#6FA0FF', 0.4);
  // the knife in his hand, spreading back and forth
  const sx = 1100 + 120 * Math.sin(t * 6) * sm;
  ctx.save(); ctx.translate(sx, 630); ctx.rotate(0.35);
  rrect(ctx, -10, 0, 150, 26, 10); ctx.fillStyle = '#C8CCD8'; ctx.fill(); rrect(ctx, 140, -4, 130, 34, 14); ctx.fillStyle = '#3A2418'; ctx.fill();
  ctx.restore();
  bigHand(ctx, sx + 330, 760, 0.6, Math.PI + 0.35, HOMEPAL, { finger: false });
  ctx.restore();
  return nightPost({ tintA: 0.08 });
};
// Hour 24: the sun comes up and he jumps up, feeling great
SC.dawn = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 900, 540, 1.05], [D, 880, 520, 1.2]]);
  const dw = ramp(t, c.sun - 0.2, c.great, E.inOutSine), up = ramp(t, c.great - 0.4, c.great + 0.2, E.outBack);
  homeSet2(cam, t, { day: dw, dawn: dw, lamp: 1 - dw, cat: { zzz: 1 }, hero: (cm) => {
    if (up < 0.05) { heroSeated(cm, t, { face: worn(FACES.tired, t), R: [40, -150], bendR: 1 }); return; }
    const pose = ikReach(ikReach(POSES.stand, 'L', [-170, -520], 1), 'R', [170, -520], 1);
    figure(cm, { x: 800, y: lerp(800, 880, up), s: 0.78, pose: lerpPose(POSES.stand, pose, up), face: worn(FACES.grin, t), seed: 4 }, t, { warm: dw, warmX: 220, warmCol: '#FFD07A' });
  } });
  applyCam(cam); sunRaysCheap(222, 470, dw, t);
  return Object.assign(dayPost(), { tintA: 0.12 * dw });
};
function sunRaysCheap(x, y, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const a = -0.25 + i * 0.09 + 0.02 * Math.sin(t + i);
    const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * 1500, y + Math.sin(a) * 1500);
    g.addColorStop(0, `rgba(255,214,140,${0.12 * k})`); g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - 0.03) * 1500, y + Math.sin(a - 0.03) * 1500); ctx.lineTo(x + Math.cos(a + 0.03) * 1500, y + Math.sin(a + 0.03) * 1500); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// "That's a trap": the body clock rings the morning bell; the pile is still there
SC.bell = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#3A2A10', '#0A0604');
  screenSpace();
  softDot(ctx, 560, 480, 600, '#FFC870', 0.2);
  // the alarm clock (twin bells) that rings
  const ring = t > c.bell - 0.2 ? Math.sin(t * 60) * 0.06 : 0;
  ctx.save(); ctx.translate(560, 520); ctx.rotate(ring);
  for (const sd of [-1, 1]) { ellipse(ctx, sd * 120, -200, 70, 50, '#E8B84A'); }
  line(ctx, 0, -230, 0, -180, 14, '#8A6A2A');
  circle(ctx, 0, 0, 210, '#E2424B'); circle(ctx, 0, 0, 175, '#FBF6EA');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(ctx, Math.sin(a) * 140, -Math.cos(a) * 140, Math.sin(a) * 160, -Math.cos(a) * 160, 6, '#2A2030'); }
  line(ctx, 0, 0, 0, -120, 12, '#2A2030'); line(ctx, 0, 0, 95, 30, 9, '#2A2030');
  ctx.font = '400 48px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = '#E2424B'; ctx.fillText('MORNING!', 0, 90);
  ctx.restore();
  if (ring) shockLines(560, 300, 260, ((t * 2.2) % 1), 12, '#FFE08A', 7);
  bigWord('BODY CLOCK', 560, 140, 70, '#FFD447', pop(t, shot.start + 0.15));
  // the pile on the right, still there
  const pk = ramp(t, c.pile2 - 0.4, c.pile2);
  adenPile(ctx, 1420, 860, 440, 0.8, t);
  bigWord('STILL THERE', 1420, 260, 76, '#C8A8FF', pop(t, c.pile2), -0.05);
  return { glow: 0.85, push: { k: 1 + 0.05 * lt / D, cx: 960, cy: 540 } };
};
// The alarm centre fires harder: the brain as a city; the bars; +60%
SC.alarm = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#120624', '#020108');
  screenSpace();
  const zx = lerp(760, 820, ramp(lt, 0, D)), zs = lerp(520, 600, ramp(t, c.alarm - 0.3, c.alarm + 0.6));
  brainCity(ctx, zx, 470, zs, t, () => 0, { amyg: ramp(t, c.alarm, c.alarm + 0.4) * (1 + 0.5 * ramp(t, c.sixty, c.sixty + 0.4)) });
  tag('ALARM CENTRE', zx + 0.18 * zs, 470 + 0.22 * zs * 0.78 + 110, t, c.alarm + 0.1, '#FF5A6E', 40);
  // the bars, on the right
  const bk = ramp(t, c.sixty - 0.3, c.sixty + 0.6);
  if (bk > 0) {
    for (const [i, lab, v, col] of [[0, 'SLEPT', 0.5, '#7FE9FF'], [1, 'NO SLEEP', 0.8, '#FF5A6E']]) {
      const bx = 1440 + i * 200, bh = 520 * v * E.outCubic(bk);
      rrect(ctx, bx - 70, 820 - bh, 140, bh, 14); ctx.fillStyle = col; ctx.fill();
      ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(lab, bx, 860);
    }
    bigWord('+60%', 1640, 210, 110, '#FF5A6E', pop(t, c.sixty + 0.4));
  }
  // an upsetting picture card on "pictures": an ice cream fallen on the floor
  const pc = pop(t, c.pictures - 0.2);
  if (pc > 0 && t < c.pictures + 3) { ctx.save(); ctx.translate(380, 760); ctx.rotate(-0.08); ctx.scale(pc, pc);
    rrect(ctx, -120, -100, 240, 200, 10); ctx.fillStyle = '#F4F0E6'; ctx.fill(); rrect(ctx, -104, -84, 208, 140, 4); ctx.fillStyle = '#9FD8FF'; ctx.fill();
    ellipse(ctx, 0, 40, 60, 16, '#FFB0CB'); ctx.beginPath(); ctx.moveTo(-26, 10); ctx.lineTo(26, 10); ctx.lineTo(0, -60); ctx.closePath(); ctx.fillStyle = '#E8B060'; ctx.fill(); ctx.restore(); }
  return { glow: 0.95 };
};
// The cereal ad; then him, sobbing; the cat sleeps on
SC.cereal = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, sw = c.nice - 0.25;
  if (t < sw) {
    darkBg('#0A0A12', '#020204'); screenSpace();
    cerealTV(ctx, 960, 470, 1300, 730, t, 1);
    return { glow: 0.7, push: { k: 1 + 0.06 * lt / D, cx: 960, cy: 470 } };
  }
  const cam = camKeys(t - sw, [[0, 900, 520, 1.9], [D, 900, 520, 2.05]]);
  homeSet2(cam, t, { day: 1, lamp: 0, cat: { zzz: 1 }, hero: (cm) => heroSeated(cm, t, { face: worn(Object.assign({}, FACES.sob, { tears: 0.5 + 0.5 * ((t * 1.3) % 1) }), t), shake: 0.4, R: [30, -200], bendR: 1, L: [-30, -200], bendL: 1 }) });
  screenSpace(); softDot(ctx, 960, 540, 900, '#FFC870', 0.08 + 0.05 * Math.sin(t * 7));
  return dayPost();
};
// Hour 30: patches of the city go dark while he is awake
SC.city = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0A0618', '#020108'); screenSpace();
  const p1 = ramp(t, c.patches, c.patches + 1.2), p2 = ramp(t, c.falling, c.falling + 1.2), p3 = ramp(t, c.falling + 1.4, c.falling + 2.6);
  const dark = (x, y) => Math.max(patchDark(0.35, -0.25, 0.32, p1)(x, y), patchDark(-0.45, 0.05, 0.35, p2)(x, y), patchDark(0.05, 0.35, 0.3, p3)(x, y));
  const s = lerp(500, 560, lt / D);
  brainCity(ctx, 960, 480, s, t, dark, {});
  tag('LOCAL SLEEP', 960, 900 - 60, t, c.falling, '#8FB8FF', 44);
  return { glow: 0.95 };
};
// Wordless: the world skips. Hard jumps in where things are; the sound drops out (audio.py)
SC.skip = (lt, t, shot) => {
  const c = cu(), J = c.skip_jumps, n = J.filter((j) => t >= j).length;
  const offs = [[0, 0, 0], [180, -0.4, 3.2], [-120, 0.3, 6.1], [60, 0.8, 9.0]][n];
  const cam = { x: 860 + [0, 30, -20, 10][n], y: 520, zoom: [1.55, 1.7, 1.45, 1.8][n], rot: 0 };
  homeSet2(cam, t, { day: 1, lamp: 0, clockHrs: 13 + offs[2] / 10, cat: { x: 1095 + [0, 40, -30, 60][n], zzz: n % 2 }, pot: { level: 0.1 }, hero: (cm) => {
    const r = heroSeated(cm, t, { face: worn(FACES.blank, t), R: [40 + offs[0] * 0.2, -150], bendR: 1, headRot: offs[1] * 0.1 });
    const wr = toWorld(r.st, r.r.wrR); applyCam(cm); mug(ctx, wr[0] + offs[0] * 0.1, wr[1] + 34, 0.6, t, { word: '#1' });
  } });
  return dayPost({ flash: 0.3 * (J.some((j) => t >= j && t < j + 0.07) ? 1 : 0), noCaptions: true });
};
// A microsleep: his blank face; a strip of time with a piece cut out
SC.micro = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 810, 490, 2.9], [D, 810, 495, 3.3]], E.inOutSine);
  const back = ramp(t, c.notice - 0.3, c.notice + 0.2);
  homeSet2(cam, t, { day: 1, lamp: 0, hero: (cm) => heroSeated(cm, t, { face: worn(back > 0.5 ? Object.assign({}, FACES.tired, { blink: 0.3 + 0.6 * env2(t, c.notice + 0.2, c.notice + 0.45, 0.1) }) : FACES.blank, t), R: [40, -150], bendR: 1 }) });
  screenSpace();
  const sk = ramp(t, c.micro, c.micro + 0.4);
  if (sk > 0) {   // a film strip of time: one piece missing
    ctx.save(); ctx.globalAlpha = sk;
    const y = 180, x0 = 1180;
    for (let i = 0; i < 6; i++) {
      const gone = i === 3 && t > c.gone - 0.1;
      const x = x0 + i * 110 + (i > 3 ? -40 * ramp(t, c.gone, c.gone + 0.3) : 0);
      if (gone) { ctx.setLineDash([10, 8]); rrect(ctx, x, y, 96, 70, 8); ctx.lineWidth = 4; ctx.strokeStyle = '#FF5A6E'; ctx.stroke(); ctx.setLineDash([]); continue; }
      rrect(ctx, x, y, 96, 70, 8); ctx.fillStyle = '#E8ECF8'; ctx.fill();
    }
    ctx.restore();
    bigWord('−4 SECONDS', 1500, 320, 64, '#FF5A6E', pop(t, c.gone));
  }
  return dayPost();
};
// On a couch: he jolts; the cat does not care
SC.couch = (lt, t, shot) => {
  const c = cu();
  const cam = { x: 950, y: 560, zoom: 1.3 + 0.03 * lt, rot: 0 };
  const j = ramp(lt, 0, 0.25, E.outBack);
  homeSet2(cam, t, { day: 1, lamp: 0, cat: { eye: env2(lt, 0.4, 1.6, 0.2) }, hero: (cm) => heroSeated(cm, t, { face: worn(FACES.startled, t), up: 0.6 * (1 - ramp(lt, 0.4, 1.2)), shake: 0.3 * (1 - ramp(lt, 0, 0.8)) }) });
  return dayPost({ flash: 0.25 * (1 - ramp(lt, 0, 0.15)) });
};
// At the wheel: the night road, the lids closing
SC.road = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#060A1A', '#000000'); screenSpace();
  const drift = 120 * Math.sin(lt * 0.9) * ramp(t, c.wheel, c.crash);
  // the road from the driver's seat
  ctx.fillStyle = '#0C0E18'; ctx.beginPath(); ctx.moveTo(960 + drift - 40, 470); ctx.lineTo(960 + drift + 40, 470); ctx.lineTo(1900 + drift, 1080); ctx.lineTo(20 + drift, 1080); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const u = ((i / 8 + lt * 0.9) % 1), y = 470 + u * u * 610, w = 4 + u * 26;
    ctx.fillStyle = `rgba(255,236,170,${0.4 + 0.5 * u})`; ctx.fillRect(960 + drift - w / 2 + (u * u) * 0, y, w, 10 + u * 60);
  }
  softDot(ctx, 960 + drift, 640, 700, '#FFF2C8', 0.13);
  softDot(gctx, 960 + drift, 520, 160, '#FFF2C8', 0.4);
  // the dashboard and the wheel
  ctx.fillStyle = '#10121C'; ctx.beginPath(); ctx.moveTo(0, 820); ctx.quadraticCurveTo(960, 740, W, 820); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(960, 1060, 330, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 46; ctx.strokeStyle = '#1C1E2A'; ctx.stroke();
  softDot(gctx, 640, 860, 40, '#4DFFB4', 0.5); softDot(gctx, 1280, 860, 40, '#FF9A3C', 0.5);
  // the eyelids
  const lid = clamp(0.25 * Math.max(0, Math.sin(lt * 2.2)) + ramp(t, c.crash - 0.4, c.crash + 0.25));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H * 0.5 * lid); ctx.fillRect(0, H - H * 0.5 * lid, W, H * 0.5 * lid);
  return { glow: 0.8, capY: 915, flash: t > c.crash + 0.5 ? 0.0 : 0 };
};
// "And that was the easy part": the wall clock spins; the window flicks night and day
SC.easy = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1330, 360, 2.6], [D, 1330, 340, 3.2]]);
  const sp = ramp(lt, 0.6, D);
  homeSet2(cam, t, { day: 0.5 + 0.5 * Math.sin(t * 9 * sp), lamp: 0.5, clockHrs: 13 + sp * 18, spin: sp, hero: (cm) => heroSeated(cm, t, { face: worn(FACES.tired, t) }) });
  return dayPost({ zblur: 0.1 * sp, tintA: 0.12 });
};

// ================================================================= ACT 2: days two to four, and the proof
// Day two: wrapped in a blanket, shivering, a tower of donuts
SC.day2 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 840, 560, 1.55], [c.donuts - shot.start, 1000, 640, 1.75], [D, 1010, 650, 1.8]]);
  const nd = 2 + Math.floor(5 * ramp(t, c.starving, c.donuts + 0.6));
  homeSet2(cam, t, { day: 0.55, lamp: 0.4, donuts: nd, cat: { zzz: 1 }, hero: (cm) => heroSeated(cm, t, { face: worn(Object.assign({}, FACES.nervous, { mouth: 'grimace' }), t), frizz: frizzAt(t),
    postX: (lc, r, st) => blanketWrap(lc, r, st, t, 1, ramp(t, c.freezing, c.freezing + 0.3)) }) });
  return Object.assign(dayPost(), { tint: '#C8D8FF', tintA: 0.15, desat: 0.2 });
};
// The brain offers a pillow: "just one little nap?"
SC.nap = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 900, 470, 2.1], [D, 920, 470, 2.3]]);
  const no = t > c.napw + 0.3 ? Math.sin((t - c.napw) * 14) * env2(t, c.napw + 0.3, c.napw + 1.5) : 0;
  homeSet2(cam, t, { day: 0.55, lamp: 0.4, donuts: 7, hero: (cm) => {
    heroSeated(cm, t, { face: worn(Object.assign({}, FACES.annoyed, { lookX: 0.7 }), t), frizz: frizzAt(t), headRot: 0.15 * no, postX: (lc, r, st) => blanketWrap(lc, r, st, t, 1, 0.3) });
    applyCam(cm); napBrain(ctx, 1060, 400, 0.7, t, { plead: 1, pillow: pop(t, c.napw - 0.6) });
  } });
  return Object.assign(dayPost(), { tint: '#C8D8FF', tintA: 0.15, desat: 0.2 });
};
// Day three: night; the room wobbles; the camera creeps toward the coat
SC.day3 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 900, 540, 1.1], [c.floor - shot.start, 900, 640, 1.3], [D, 1420, 470, 2.2]], E.inOutSine);
  homeSet2(cam, t, { lamp: 0.7, cat: { zzz: 1 }, hero: (cm) => heroSeated(cm, t, { face: worn(FACES.wreck, t), frizz: frizzAt(t) }) });
  const wa = ramp(t, c.wobble - 0.5, c.wobble + 0.5) * (0.8 + 0.4 * Math.sin(t * 0.8));
  return sickPost({ overlay: () => warpFrame(wa, t) });
};
// The coat on the door turns its head (wordless), then the line
SC.coat = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1450, 470, 2.2], [D, 1450, 440, 2.6]], E.inOutSine);
  const alive = ramp(lt, 0.7, 2.2, E.inOutSine);
  homeSet2(cam, t, { lamp: 0.6, coat: alive, coatLook: -1 * ramp(t, c.turns - 0.8, c.turns + 0.2), hero: (cm) => heroSeated(cm, t, { face: worn(FACES.wreck, t) }) });
  return sickPost({ overlay: () => warpFrame(0.6, t) });
};
// He backs into the corner of the couch; the coat watches
SC.seeing = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1000, 520, 1.25], [D, 980, 520, 1.35]]);
  homeSet2(cam, t, { lamp: 0.6, coat: 1, coatLook: -1, cat: { zzz: 1 }, hero: (cm) => heroSeated(cm, t, { face: worn(Object.assign({}, FACES.shock, { lookX: 1 }), t), frizz: frizzAt(t), dx: -40 * ramp(lt, 0, 0.8), tremble: 0.5, t, L: [-60, -180], bendL: 1, R: [10, -200], bendR: 1 }) });
  return sickPost({ overlay: () => warpFrame(0.5, t) });
};
// The cat opens one eye: GO TO BED.
SC.catspeak = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1090, 640, 2.6], [D, 1085, 630, 3.0]], E.inOutSine);
  homeSet2(cam, t, { lamp: 0.6, cat: { eye: ramp(t, c.told - 0.8, c.told - 0.3), talk: env2(t, c.told - 0.2, c.gotobed + 0.6) }, hero: (cm) => heroSeated(cm, t, { face: worn(FACES.wreck, t), frizz: frizzAt(t) }) });
  screenSpace();
  const bk = pop(t, c.told);
  if (bk > 0) speech('GO TO BED.', 1320, 330, bk, '#2A1060', 86, -0.06);
  return sickPost({ overlay: () => warpFrame(0.35, t) });
};
// The record book page: RANDY GARDNER · 1964; the camera dives into its photo
SC.randy = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 830, 700, 2.1], [D - 0.6, 920, 705, 2.9], [D, 920, 700, 4.4]], E.inOutCubic);
  homeSet2(cam, t, { lamp: 0.7, book: { open: 1, glow: 1, left: { title: 'LONGEST TIME', big: 'AWAKE', sub: 'SAN DIEGO' }, right: { title: 'RANDY GARDNER', big: '11 DAYS', sub: '1964' } },
    hero: (cm) => heroSeated(cm, t, { face: worn(Object.assign({}, FACES.calm, { lookX: 0.5, lookY: 0.8 }), t), frizz: frizzAt(t) }) });
  return nightPost({ zblur: 0.15 * ramp(lt, D - 0.6, D) });
};

// ---------------------------------------------------------------- 1964 (sepia)
const old = (t, x = {}) => Object.assign({ glow: 0.6, overlay: () => { sepia60(0.85); film60(t, 1); } }, x);
function randyFig(cam, x, t, face, pose = POSES.stand, o = {}) {
  return figure(cam, { x, y: 880, s: 0.75, pose, face, seed: 2, headRot: o.headRot || 0 }, t, { pal: RANDYPAL, ambient: 0.05, post: (cc, r, st) => { randyKit(cc, r, st); if (o.post) o.post(cc, r, st); } });
}
function docFig(cam, x, t, face, pose = POSES.stand, o = {}) {
  return figure(cam, { x, y: 880, s: 0.78, pose, face, seed: 3 }, t, { pal: DOCPAL, ambient: 0.05, post: (cc, r, st) => { docKit(cc, r, st); if (o.post) o.post(cc, r, st); } });
}
SC.sixty4 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1100, 470, 1.6], [c.randyname - shot.start, 900, 520, 1.25], [D, 1300, 450, 1.55]]);
  den60(cam, t, {});
  applyCam(cam);
  randyFig(cam, 880, t, FACES.grin, ikReach(POSES.stand, 'R', [180, -380], 1));
  screenSpace();
  tag('SAN DIEGO · 1964', 960, 130, t, c.sandiego, '#F2D7A0', 52);
  return old(t);
};
SC.watch = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 520, 1.1], [c.moody - shot.start, 820, 480, 1.7], [D, 830, 470, 1.85]]);
  den60(cam, t, {});
  const walk = ramp(t, shot.start, c.stanford + 0.8);
  const dx = lerp(1700, 1220, walk);
  randyFig(cam, 820, t, t > c.moody ? FACES.annoyed : FACES.tired, POSES.stand, { post: (cc, r) => {
    if (t > c.forgetful) { cc.save(); cc.translate(r.head[0] + 80, r.head[1] - 120); cc.font = '400 90px Anton'; cc.fillStyle = '#FFD447'; cc.textAlign = 'center'; cc.fillText('?', 0, 0); cc.restore(); }
  } });
  docFig(cam, dx, t, FACES.calm, walk < 1 ? walkPlanted(t) : ikReach(POSES.stand, 'L', [-120, -260], 1), { post: (cc, r) => {
    const w = r.wrL; rrect(cc, w[0] - 60, w[1] - 70, 90, 120, 6); cc.fillStyle = '#E8DCC0'; cc.fill();
  } });
  applyCam(cam);
  if (t > c.seeing2 - 0.1) { const k = pop(t, c.seeing2 - 0.1); ctx.save(); ctx.translate(560, 420); ctx.scale(k, k); ellipse(ctx, 0, 0, 60, 80, 'rgba(240,240,255,0.7)'); circle(ctx, -20, -20, 8, '#222'); circle(ctx, 20, -20, 8, '#222'); ctx.restore(); }
  screenSpace(); tag('STANFORD SLEEP SCIENTIST', 1240, 140, t, c.stanford, '#F2D7A0', 40);
  return old(t);
};
SC.pinball = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1150, 480, 1.25], [c.beating - shot.start, 1100, 460, 1.4], [D, 1080, 450, 1.5]]);
  den60(cam, t, { poster: false });
  applyCam(cam);
  pinball(ctx, 1150, 880, 0.95, t, { flip: 1, score: t > c.beating ? 'RANDY WINS' : '1 0 4 7' });
  const win = ramp(t, c.beating, c.beating + 0.3, E.outBack);
  randyFig(cam, 880, t, win > 0.5 ? FACES.grin : FACES.tired, lerpPose(ikReach(ikReach(POSES.stand, 'R', [140, -200], 1), 'L', [120, -210], 1), ikReach(ikReach(POSES.stand, 'R', [150, -540], 1), 'L', [-150, -540], 1), win));
  docFig(cam, 1500, t, win > 0.5 ? FACES.deadpan || FACES.annoyed : FACES.calm);
  return old(t);
};
SC.count = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 500, 1.1], [D, 1080, 430, 1.4]]);
  den60(cam, t, { poster: false, day: 1 });
  applyCam(cam);
  countBoard(ctx, 1150, 420, 1, 0, t);
  randyFig(cam, 640, t, worn(FACES.tired, 0, { bags: 0.9 }), ikReach(POSES.stand, 'R', [150, -360], 1));
  docFig(cam, 1650, t, FACES.calm);
  return old(t);
};
SC.sevens = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const ns = [c.n100, c.n93, c.n86, c.n79, c.n72, c.n65];
  let shown = 0; ns.forEach((n, i) => { shown += ramp(t, n - 0.05, n + 0.35); });
  const cam = camKeys(lt, [[0, 1080, 430, 1.4], [D, 1150, 420, 1.85]], E.inOutSine);
  den60(cam, t, { poster: false, day: 1 });
  applyCam(cam);
  countBoard(ctx, 1150, 420, 1, shown, t);
  const writing = ns.some((n) => t > n - 0.05 && t < n + 0.4);
  const hx = 1150 - 220 + (Math.min(5, Math.floor(shown)) % 3) * 220 - 40;
  randyFig(cam, 760, t, worn(Object.assign({}, FACES.tired, { lookX: 0.8, lookY: -0.4 }), 0, { bags: 0.9 }), ikReach(POSES.stand, 'R', [(hx - 760) / 0.75, (330 + (shown > 3 ? 170 : 0) - 880) / 0.75 + (writing ? 6 * Math.sin(t * 30) : 0)], 1));
  return old(t);
};
SC.stop = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 900, 470, 2.0], [D, 860, 480, 2.4]], E.inOutSine);
  den60(cam, t, { poster: false, day: 1 });
  applyCam(cam);
  countBoard(ctx, 1150, 420, 1, 6, t, { q: ramp(t, c.forgot, c.forgot + 0.4) });
  const drop = ramp(t, c.stopped, c.stopped + 0.4, E.inCubic);
  randyFig(cam, 760, t, worn(FACES.blank, 0, { bags: 1 }), ikReach(POSES.stand, 'R', [lerp(400, 120, drop), lerp(-640, -260, drop)], 1));
  if (drop > 0.05) { applyCam(cam); rrect(ctx, 900 - 10 + 30 * drop, lerp(400, 870, drop * drop), 40, 14, 6); ctx.fillStyle = '#F4F4E8'; ctx.fill(); }
  return old(t, { noCaptions: t < c.stopped - 0.1 });
};
SC.record = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#3A2A1E', '#0E0A06'); screenSpace();
  ctx.save(); ctx.translate(960, 500); ctx.rotate(-0.03 + 0.01 * lt); const k = 1 + 0.05 * lt; ctx.scale(k, k);
  rrect(ctx, -600, -340, 1200, 680, 6); ctx.fillStyle = '#F2EAD8'; ctx.fill();
  ctx.font = '400 66px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A2018';
  ctx.fillText('SAN DIEGO · JANUARY 1964', 0, -270); line(ctx, -560, -230, 560, -230, 4, '#2A2018');
  ctx.font = '400 150px Anton'; ctx.fillText('11 DAYS', 0, -90);
  ctx.font = '400 96px Anton'; ctx.globalAlpha = clamp((t - c.minutes + 0.2) * 4); ctx.fillText('24 MINUTES', 0, 60); ctx.globalAlpha = 1;
  for (let i = 0; i < 5; i++) line(ctx, -560, 160 + i * 34, 560 - (i % 2) * 200, 160 + i * 34, 8, 'rgba(40,30,20,0.2)');
  ctx.restore();
  return old(t);
};
SC.slept = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 600, 1.3], [D, 960, 600, 1.45]]);
  den60(cam, t, { poster: false, day: t > c.fine });
  applyCam(cam);
  // a bed with Randy in it; a clock spinning through fourteen hours
  rrect(ctx, 560, 640, 820, 220, 30); ctx.fillStyle = '#C8B49A'; ctx.fill(); rrect(ctx, 540, 600, 80, 280, 20); ctx.fillStyle = '#6A4A2E'; ctx.fill();
  const sit = ramp(t, c.fine - 0.4, c.fine + 0.2, E.outBack);
  randyFig(cam, 760, t, sit > 0.5 ? FACES.grin : FACES.peace, lerpPose(POSES.sleep, POSES.sit, sit), { headRot: 0 });
  rrect(ctx, 600, 700, 760, 160, 40); ctx.fillStyle = '#E8DCC8'; ctx.fill();
  if (sit < 0.5) zzz(900, 520, t, shot.start, 1, 1.2);
  wallClock(ctx, 1460, 330, 80, 7 + 14 * ramp(t, shot.start, c.fine - 0.3), { spin: env2(t, shot.start, c.fine - 0.3) });
  screenSpace(); bigWord('14 HOURS', 1460, 520, 80, '#F2D7A0', pop(t, c.fourteen));
  return old(t);
};
// Back to colour: he goes to sign the record book; NO LONGER ACCEPTED
SC.refused = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 880, 560, 1.4], [c.stamp - shot.start - 0.3, 860, 700, 2.2], [D, 870, 705, 2.6]]);
  const st = ramp(t, c.stamp, c.stamp + 0.25);
  homeSet2(cam, t, { lamp: 0.8, book: { open: 1, stamp: st, right: { title: 'LONGEST TIME AWAKE', big: '11 DAYS', sub: '' } }, cat: { zzz: 1 },
    hero: (cm) => heroSeated(cm, t, { face: worn(st > 0.5 ? FACES.sad : FACES.proud, t), frizz: 1, R: [70, -40], bendR: -1 }) });
  applyCam(cam);
  if (st < 1) { ctx.save(); ctx.translate(960 + 20 * Math.sin(t * 5), 760); ctx.rotate(-0.6); rrect(ctx, -6, -90, 14, 100, 4); ctx.fillStyle = '#2A4A8A'; ctx.fill(); ctx.restore(); }
  stamp('NO LONGER ACCEPTED', 960, 330, ramp(t, c.stamp, c.stamp + 0.25), '#FF4D5E', -0.12, 104);
  return nightPost({ flash: 0.3 * (1 - ramp(t, c.stamp, c.stamp + 0.15)) * (t > c.stamp ? 1 : 0) });
};

// ================================================================= ACT 3: past the record
SC.rats = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 500, 1.0], [D, 960, 560, 1.35]]);
  const L = ratLab(cam, t, { spin: t * 0.3 });
  drawRat(ctx, L.cx + 60 * Math.sin(t * 0.8), L.top, 0.8, t, {});
  screenSpace(); tag('1980s', 960, 130, t, shot.start + 0.2, '#7FE9FF', 52);
  return { glow: 0.8 };
};
SC.ratsdead = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 560, 1.35], [D, 960, 580, 1.55]]);
  const dim = ramp(t, c.dead - 0.3, c.dead + 0.8);
  const L = ratLab(cam, t, { lamp: 1 - 0.85 * dim, spin: 0 });
  drawRat(ctx, L.cx, L.top + 10 * dim, 0.8, t * (1 - dim), {});
  ctx.fillStyle = `rgba(0,0,0,${0.45 * dim})`; ctx.fillRect(0, -200, W, 1400);
  screenSpace();
  const qk = pop(t, c.exactly);
  if (qk > 0) bigWord('?', 960, 300, 260, '#FFD447', qk);
  return { glow: 0.8 };
};
SC.flies = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0E2A30', '#020809'); screenSpace();
  for (let i = 0; i < 40; i++) circle(ctx, (i * 197) % W, (i * 331) % H, 2, 'rgba(160,230,255,0.25)');
  const fly0 = ramp(lt, 0, 1.2, E.outCubic);
  const toBelly = ramp(t, c.nobodyx - 0.4, c.nobodyx + 0.8, E.inOutCubic);
  const s = lerp(0.9, 1.25, toBelly), fx = lerp(1700, 1100, fly0), fy = lerp(300, 420, fly0) - 180 * toBelly;
  fly(ctx, fx, fy, s, t, { wing: 1 - 0.7 * fly0, face: t > c.damage ? 'tired' : 'calm' });
  tag('HARVARD · 2020', 480, 160, t, c.harvard, '#7FE9FF', 50);
  return { glow: 0.85 };
};
SC.gut = (lt, t, shot) => {
  const c = cu();
  darkBg('#0E1A30', '#020408'); screenSpace();
  const xr = ramp(t, c.notbrain - 0.2, c.notbrain + 0.4);
  fly(ctx, 1100, 240, 1.25, t, { xray: xr, gut: ramp(t, c.gut - 0.1, c.gut + 0.4), face: 'tired' });
  // the brain, crossed out
  const bk = pop(t, c.notbrain);
  if (bk > 0 && t < c.gut + 0.4) { ctx.save(); ctx.translate(500, 360); ctx.scale(bk, bk); napBrain(ctx, 0, 0, 0.6, t, { pillow: 0 }); ctx.restore(); bigX(500, 360, 1.1, ramp(t, c.notbrain + 0.3, c.notbrain + 0.6)); }
  bigWord('THE GUT', 600, 700, 140, '#FF5A6E', pop(t, c.gut));
  return { glow: 0.95 };
};
SC.mop = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#0E1A30', '#020408'); screenSpace();
  fly(ctx, 1320, 240, 1.0, t, { xray: 1, gut: 1, mop: ramp(t, c.anti - 0.2, c.anti + 1.4), face: t > c.normal ? 'ok' : 'tired' });
  lifeBar(170, 640, 620, 0.25, ramp(t, c.barely - 0.6, c.barely), '#FF5A6E', 'NO SLEEP');
  lifeBar(170, 820, 620, 1.0, ramp(t, c.normal - 0.5, c.normal + 0.3), '#4DFFB4', 'NO SLEEP + ANTIOXIDANTS');
  tag('ANTIOXIDANTS', 480, 200, t, c.anti, '#7FE9FF', 52);
  return { glow: 0.9 };
};
SC.rinse = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  rinseTissue(t, { shrink: ramp(t, c.rinses - 0.6, c.rinses + 0.6), flow: ramp(t, c.rinses - 0.3, c.rinses + 0.5), clean: ramp(t, c.rinses, c.dishwasher + 1.4) });
  tag('ONE IDEA', 300, 130, t, c.idea, '#FFD447', 50);
  tag('MICE · 2013', 1620, 130, t, c.rinses, '#FF86A6', 46);
  return { glow: 0.85, push: { k: 1 + 0.05 * lt / D, cx: 960, cy: 540 } };
};
SC.opposite = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  rinseTissue(t, { shrink: 1 - ramp(t, c.opposite - 0.3, c.opposite + 0.6), flow: 1 - 0.7 * ramp(t, c.opposite - 0.3, c.opposite + 0.6), clean: 0.6 });
  screenSpace();
  for (const [i, x, top, bot, col, at] of [[0, 560, 'MICE · 2013', 'SLEEP RINSES MORE', '#4DFFB4', shot.start + 0.1], [1, 1360, 'MICE · 2024', 'SLEEP RINSES LESS', '#FF5A6E', c.newer]]) {
    const k = pop(t, at); if (k <= 0) continue;
    ctx.save(); ctx.translate(x, 520); ctx.rotate(i ? 0.04 : -0.04); ctx.scale(k, k);
    rrect(ctx, -300, -150, 600, 300, 26); ctx.fillStyle = 'rgba(8,10,28,0.92)'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.stroke();
    ctx.font = '400 70px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(top, 0, -55);
    ctx.font = '900 40px Montserrat'; ctx.fillStyle = col; ctx.fillText(bot, 0, 50); ctx.restore();
  }
  bigWord('VS', 960, 520, 120, '#FFD447', pop(t, c.newer + 0.3));
  return { glow: 0.85 };
};
SC.argue = (lt, t, shot) => {
  const c = cu();
  darkBg('#1A1A30', '#05050C');
  const cam = { x: 960, y: 560, zoom: 1.1 + 0.03 * lt, rot: 0 };
  applyCam(cam);
  const lunge = Math.sin(t * 9);
  docFig(cam, 680, t, Object.assign({}, FACES.annoyed, { mouth: 'scream', mouthOpen: 0.5 + 0.5 * Math.abs(lunge), lookX: 0.8 }), ikReach(POSES.stand, 'R', [220, -380 + 30 * lunge], 1));
  docFig(cam, 1240, t, Object.assign({}, FACES.annoyed, { mouth: 'scream', mouthOpen: 0.5 + 0.5 * Math.abs(Math.sin(t * 9 + 1.5)), lookX: -0.8 }), ikReach(POSES.stand, 'L', [-220, -380 - 30 * lunge], 1));
  screenSpace();
  speech('RINSE!', 560, 260, pop(t, shot.start + 0.1), '#4DFFB4', 80, -0.08);
  speech('NOPE!', 1360, 260, pop(t, shot.start + 0.5), '#FF5A6E', 80, 0.08);
  stamp('STILL ARGUING', 960, 720, ramp(t, c.arguing, c.arguing + 0.25), '#FFD447', -0.12, 100);
  return { glow: 0.8 };
};
SC.jelly = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1100, 640, 1.5], [c.jellyw - shot.start, 900, 700, 1.9], [D, 880, 720, 2.1]], E.inOutSine);
  seaFloor(cam, t, {}); applyCam(cam);
  for (const [x, s, ph] of [[600, 0.7, 0.3], [1300, 0.8, 1.7], [900, 1.0, 0]]) upsideJelly(ctx, x, 830 + (s < 1 ? 10 : 20), s, 0.5 + 0.5 * Math.sin(t * 2.2 + ph), t, {});
  screenSpace();
  const nb = pop(t, c.nobrain - 0.1);
  if (nb > 0) { stamp('NO BRAIN', 1450, 300, nb, '#7FE9FF', -0.1, 96); }
  return { glow: 1.0, tint: '#9FD8FF', tintA: 0.08 };
};
SC.older = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 640, 1.0], [D, 960, 420, 0.95]], E.inOutSine);
  seaFloor(cam, t, {}); applyCam(cam);
  for (let i = 0; i < 9; i++) { const x = 140 + i * 210, s = 0.4 + 0.25 * ((i * 7) % 3) / 2; upsideJelly(ctx, x, 830 + 6 * (i % 3), s, 0.5 + 0.5 * Math.sin(t * (1.2 - 0.5 * ramp(lt, 0, D)) + i), t, { sleep: 1 }); }
  screenSpace();
  tag('OLDER THAN BRAINS?', 960, 160, t, c.older, '#FFD447', 56);
  return { glow: 1.0, tint: '#9FD8FF', tintA: 0.08 };
};

// ================================================================= his turn, the button, the final image
// Wordless, then "So he does the bravest thing... He goes to bed.": he closes the book and lies down on it
function lyingHero(cm, t, k, face) {
  // k 0 = seated, 1 = lying along the couch with his head on the book at the left arm
  if (k < 0.01) return heroSeated(cm, t, { face, frizz: 1 });
  const fz = lerp(1, 0.25, k);
  const rot = -Math.PI / 2 * E.inOutCubic(k);
  const st = { x: lerp(HOME.hx, 1250, k), y: lerp(HOME.seatY, 690, k), s: HOME.hs, pose: lerpPose(seatPose({}), POSES.sleep, k), face, seed: 4, frizz: fz };
  return { st, r: figure(cm, st, t, { rot, pivot: [st.x, st.y], warm: 0.5 }) };
}
SC.bed = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 880, 560, 1.5], [2.2, 960, 620, 1.35], [D, 980, 640, 1.25]], E.inOutSine);
  const look = ramp(lt, 0.3, 0.9), close = ramp(lt, 1.4, 2.0), lie = ramp(lt, 2.3, 3.6, E.inOutSine);
  const sleepy = ramp(t, c.gotobed2 - 0.2, c.gotobed2 + 0.4);
  const face = worn(lerpFace(Object.assign({}, FACES.tired, { lookX: look > 0.5 && close < 0.5 ? 0.9 : 0.4, lookY: close > 0.5 ? 0.8 : 0 }), FACES.peace, sleepy), t);
  homeSet2(cam, t, { lamp: 0.8, noBook: lie > 0.1, book: { open: 1 - close }, cat: { zzz: 1 }, hero: (cm) => {
    if (lie > 0.1) { applyCam(cm); recordBook(ctx, lerp(830, 690, lie), lerp(830, 700, lie), 300, t, { open: 0 }); }
    lyingHero(cm, t, lie, face);
  } });
  return nightPost({ noCaptions: lt < 2.0 && t < c.bravest - 0.1 });
};
// The cat climbs onto him; dawn
SC.champ = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 980, 640, 1.25], [D, 960, 620, 1.35]], E.inOutSine);
  const dw = ramp(lt, 0.5, D + 3.5, E.inOutSine) * 0.6;
  const hop = ramp(lt, 0.3, 1.4, E.inOutSine);
  homeSet2(cam, t, { day: dw, dawn: dw, lamp: 0.8 - dw, noBook: true, cat: { x: lerp(1095, 1000, hop), y: lerp(712, 630, hop) - 60 * Math.sin(Math.PI * hop), s: 0.6, zzz: hop > 0.9 ? 1 : 0, after: true }, hero: (cm) => {
    applyCam(cm); recordBook(ctx, 690, 700, 300, t, { open: 0 });
    lyingHero(cm, t, 1, FACES.peace);
  } });
  return Object.assign(nightPost(), { tintA: 0.16 * (1 - dw) });
};
// The final image and the subscribe line: dawn gold, both asleep, the book his pillow
function finalImage(lt, t, push) {
  const cam = { x: 960, y: 620, zoom: 1.35 + push, rot: 0 };
  const dw = 0.6 + 0.4 * ramp(t, cu().final - 1, cu().final + 3, E.inOutSine);
  homeSet2(cam, t, { day: dw, dawn: dw, lamp: 0, noBook: true, cat: { x: 1000, y: 630, s: 0.6, zzz: 1, after: true }, hero: (cm) => {
    applyCam(cm); recordBook(ctx, 690, 700, 300, t, { open: 0 });
    lyingHero(cm, t, 1, FACES.peace);
    zzz(...toScreen(cm, 760, 560), t, cu().final - 0.5, 1, 1);
  } });
  applyCam(cam); sunRaysCheap(222, 470, dw, t);
  return dayPost({ tint: '#FFD8A0', tintA: 0.14 });
}
SC.final = (lt, t, shot) => finalImage(lt, t, 0.02 * lt);
SC.sub = (lt, t, shot) => finalImage(lt, t, 0.02 * (SHOT('final').end - SHOT('final').start + lt));

// ================================================================= the thumbnail
// variant (window.COVER_V or TLd.coverVariant): 0 his wired face + the pot + "DAY 11"; 1 the wrecked face + coat
// eyes + "DAY 3"; 2 face half asleep + "DON'T SLEEP"
SC.cover = (lt, t, shot) => {
  const v = TLd.coverVariant || 0;
  darkBg(['#1A1040', '#120A2A', '#0A1A3A'][v], '#020108');
  screenSpace();
  softDot(ctx, 1240, 520, 700, ['#FF9A3C', '#B07CFF', '#7FE9FF'][v], 0.35);
  const cam = { x: 820, y: 505, zoom: 3.4, rot: 0, sx: 300, sy: 20 };
  const face = [Object.assign({}, FACES.wired, { mouth: 'o', mouthOpen: 0.9, eyeOpen: 1.55, bags: 0.6, red: 0.9 }),
    Object.assign({}, FACES.wreck, { bags: 1, red: 1, eyeOpen: 1.5 }), Object.assign({}, FACES.tired, { bags: 1, red: 0.7, blink: 0.6 })][v];
  const k = v === 0 ? 1 : 0, P = potAtMouth(k, 0.3);
  const st = { x: HOME.hx, y: HOME.seatY, s: HOME.hs };
  heroSeated(cam, 0.3, { face, frizz: v ? 1 : 0.3, R: v === 0 ? ikLocal(st, P.hand[0], P.hand[1]) : [40, -150], bendR: 1 }, { ambient: 0.05 });
  applyCam(cam);
  if (v === 0) {
    coffeePot(ctx, P.x, P.y, P.s, 0.3, { tilt: P.tilt, level: 0.5 });
    const [ax, ay] = P.spout, [bx, by] = P.mouth; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + bx) / 2, Math.min(ay, by) - 4, bx + 6, by); ctx.lineWidth = 9; ctx.strokeStyle = COFFEE; ctx.lineCap = 'round'; ctx.stroke();
  }
  screenSpace();
  const words = [['DAY', '11'], ['DAY', '3'], ["DON'T", 'SLEEP']][v];
  bigWord(words[0], 420, 330, 230, '#FFFFFF', 1, -0.05);
  bigWord(words[1], 420, 610, v === 2 ? 230 : 330, '#FFD447', 1, -0.05);
  return { glow: 0.9, noCaptions: true, noSubscribe: true, grain: 0, noHud: true };
};

function initScenes2() { initHome(); initBrainHead(); initLab(); }
