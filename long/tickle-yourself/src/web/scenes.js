// Why Can't You TICKLE Yourself? (long-form, 1920x1080): the 23 shots. Each SC.<id>(lt, t, shot) draws one frame
// (lt = seconds inside the shot, t = seconds in the video) and returns post options for main.js. Every beat comes
// from a cue: cu().name (timeline.json), never a typed-in time.
// The film: he wants to be untickleable before his niece Pip's Sunday visit; his own brain is the obstacle (it
// predicts his touch and turns it down); the turn: a tickle is how the body knows someone else is there; the end: he
// stops training and laughs with her. Colour script: cold blue nights while he trains alone, clinical teal in the
// lab, warm lamp gold for the family photos, Sunday sunlight through the open door for the ending. The feather is the
// motif: his training tool at the start, her toy at the end, drifting down onto his chest in the final image.
'use strict';

const cu = () => TLd.cues;
const SHOT = (id) => TLd.shots.find((s) => s.id === id);
// a 0..1 envelope that rises over [a, a+r] and falls over [b-r, b]
const env = (t, a, b, r = 0.2) => Math.min(ramp(t, a, a + r), 1 - ramp(t, b - r, b));

// the home set behind the hero: room, lamp, couch (back + front)
function homeSet(cam, t, o = {}) {
  homeBack(cam, t, o);
  applyCam(cam);
  homeLamp(t, o.lamp === undefined ? 1 - (o.day || 0) * 0.8 : o.lamp);
  couchBackL(o.day || 0);
  if (o.behind) o.behind();
  applyCam(cam);
  couchFrontL(o.day || 0);
}
// the night grade: a cold blue multiply, stronger when he is stuck
function nightPost(extra = {}) { return Object.assign({ glow: 0.8, tint: '#B8C8FF', tintA: 0.18 }, extra); }

// the three family photos above the couch (live, so the camera can travel into them). k = their warm glow
const PHOTOS = [[690, 300], [910, 300], [1130, 300]];
const PAL_GRAN = Object.assign({}, PAL, { coat: '#A88BD8', coatSh: '#7E64B0', coatHi: '#CDB8F0', coatDk: '#6A5298', strap: '#A88BD8', strapSh: '#7E64B0',
  hair: '#D8D8E0', hairHi: '#FFFFFF', pants: '#4A3A6A', pantsSh: '#33284C', pj: true });
const PAL_BABY = Object.assign({}, PAL, { coat: '#FFF2B0', coatSh: '#E0CC80', coatHi: '#FFFBE0', coatDk: '#C8B060', strap: '#FFF2B0', strapSh: '#E0CC80',
  pants: '#FFF2B0', pantsSh: '#E0CC80', pj: true });
function photoFrame(i, t, glow = 0, laugh = 1) {
  const [x, y] = PHOTOS[i], w = 180, h = 220, c = ctx;
  rrect(c, x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, 6); c.fillStyle = '#8A5A2A'; c.fill();
  rrect(c, x - w / 2 - 8, y - h / 2 - 8, w + 16, h + 16, 4); c.fillStyle = '#C8964E'; c.fill();
  c.save(); c.beginPath(); c.rect(x - w / 2, y - h / 2, w, h); c.clip();
  const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, ['#F4D9A8', '#BFE3F0', '#FFD0DC'][i]); g.addColorStop(1, ['#C89A68', '#7FB2C8', '#E89AB0'][i]);
  c.fillStyle = g; c.fillRect(x - w / 2, y - h / 2, w, h);
  const lf = lerpFace(FACES.grin, FACES.laugh, laugh);
  const jig = (k) => 3 * Math.sin(t * 14 + k);
  // big one (left) tickles the small one (right), who laughs
  const pairs = [[PAL_GRAN, PAL_BABY, 0.2, 0.11], [HOMEPAL, PAL_BABY, 0.17, 0.11], [PIPPAL, HOMEPAL, 0.13, 0.17]];
  const [pa, pb, sa, sb] = pairs[i];
  const bigX = x - 40, smallX = x + 42, floor = y + h / 2 + 4;
  const reach = ikReach(ikReach(POSES.stand, 'R', [150, -330], 1), 'L', [-60, -200], -1);
  drawCharacter(c, { x: bigX, y: floor, s: sa, pose: Object.assign({}, reach, { lean: 0.12 }), face: lerpFace(FACES.grin, FACES.pipGlee, 0.5), seed: 3 }, t, pa);
  if (i === 2) { c.save(); c.translate(bigX, floor); c.scale(sa, sa); pigtails(c, rig(POSES.stand), { headDX: 0, headDY: 0, headRot: 0 }, t); c.restore(); }
  drawCharacter(c, { x: smallX + jig(i), y: floor, s: sb, pose: Object.assign({}, POSES.flinch, { lean: -0.15 }), face: lf, seed: 5 }, t, pb);
  c.restore();
  // glass sheen + the warm glow
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); c.moveTo(x - w / 2, y - h / 2); c.lineTo(x + 10, y - h / 2); c.lineTo(x - w / 2, y + 40); c.fill();
  if (glow > 0) softDot(gctx, x, y, 200, '#FFC870', 0.45 * glow);
}

// ================================================================= ACT 0: the hook
// Night. He sits on the couch with the feather under his chin, deadpan. Nothing.
SC.hook = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 830, 500, 2.55], [c.nothing - 0.2, 815, 505, 2.85], [D, 812, 505, 2.95]], E.inOutSine);
  homeSet(cam, t);
  // the feather moves from chin to nose to under the arm-ish; brisk on "Right now"
  const brisk = 1 + 1.6 * env(t, 2.85, 4.0, 0.15);
  const wig = Math.sin(t * 9 * brisk), toNose = ramp(t, 1.6, 2.2, E.inOutSine) * (1 - ramp(t, 3.9, 4.3));
  const R = [lerp(56, 50, toNose) + 8 * wig, lerp(-176, -198, toNose) + 4 * wig];
  const look = t > c.nothing - 0.15;
  const face = look ? FACES.deadpan : lerpFace(FACES.calm, FACES.deadpan, 0.4 + 0.2 * Math.sin(t * 2));
  heroSeated(cam, t, { R, bendR: 1, face: Object.assign({}, face, { lookX: look ? 0 : 0.35, lookY: look ? 0.05 : 0.5 }), band: 0,
    feather: { len: 108, ang: lerp(-2.6, -2.8, toNose) + 0.18 * wig, curl: 0.4 } });
  return nightPost({ zblur: 0.06 * (1 - ramp(lt, 0, 0.35)) });
};

// Someone ELSE: Pip pops up behind the couch with her feather; he falls apart and off the couch. WHY?
SC.else = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, tf = Math.min(t, c.why + 0.12);   // time freezes on "Why?"
  const fall = ramp(tf, c.apart - 0.1, c.apart + 0.45, E.inOutCubic);
  const cam = camKeys(lt, [[0, 860, 530, 1.75], [c.apart - shot.start, 860, 560, 1.45], [D, 870, 590, 1.3]]);
  const rise = ramp(t, c.poke - 0.75, c.poke - 0.3, E.outBack);
  homeSet(cam, tf, {
    behind: () => pipFigure(cam, tf, { x: 985, y: lerp(800, 668, rise), s: 0.44, pose: ikReach(POSES.stand, 'R', [-60, -440], 1), face: FACES.pipGlee,
      feather: { len: 330, ang: Math.PI * 1.03 + 0.2 * Math.sin(tf * 16) * ramp(tf, c.poke, c.poke + 0.1) } }, { warm: 0.6 }),
  });
  const hit = ramp(tf, c.poke, c.poke + 0.12);
  const face = hit > 0.5 ? FACES.laugh : FACES.deadpan;
  const st = { up: 0.55 * hit, shake: hit * (1 - 0.3 * fall), kick: hit, t: tf };
  if (fall < 0.02) heroSeated(cam, tf, Object.assign({ face, headRot: -0.2 * hit }, st));
  else {   // tipping off the couch to the left, onto the rug
    const p = seatPose({ up: 0.7, t: tf });
    applyCam(cam);
    figure(cam, { x: HOME.hx - 40 * fall, y: HOME.seatY + 150 * fall, s: HOME.hs, pose: p, face: FACES.laugh, seed: 4,
      headDX: 5 * Math.sin(tf * 31), headRot: 0.1 * Math.sin(tf * 17) }, tf, { rot: -1.35 * fall, pivot: [HOME.hx - 60, HOME.seatY + 40], warm: 1 });
  }
  haMarks(...toScreen(cam, HOME.hx - 120 * fall, 470 + 140 * fall), tf, hit * (1 - ramp(t, c.why, c.why + 0.1)), 3, 70);
  // the freeze-frame question
  const why = ramp(t, c.why - 0.05, c.why + 0.25, E.outBack);
  screenSpace();
  if (why > 0) bigWord('WHY?', 1450, 330, 230, '#FFD447', why, -0.08);
  return nightPost({ desat: 0.55 * ramp(t, c.why, c.why + 0.15), flash: 0.25 * (1 - ramp(t, c.poke, c.poke + 0.12)) * (t > c.poke ? 1 : 0) });
};

// Into his head: a fortune-teller brain with a crystal ball that shows... a feather.
SC.future = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#2A1650', '#08041A');
  screenSpace();
  const rs = mulberry32(31);
  for (let i = 0; i < 70; i++) { const x = rs() * W, y = rs() * H, tw = 0.5 + 0.5 * Math.sin(t * 3 + i); circle(ctx, x, y, 1.2 + rs() * 1.8, `rgba(230,220,255,${0.3 + 0.5 * tw})`); }
  const k = 1 + 0.07 * lt / D, cx = 960, cy = 470;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
  // the brain (left third), with a face, a turban and two little hands round the ball
  const bx = 720, by = 440, bob = 8 * Math.sin(t * 2.2);
  const bg = ctx.createRadialGradient(bx - 60, by - 80 + bob, 20, bx, by + bob, 240); bg.addColorStop(0, '#F2A8CC'); bg.addColorStop(1, '#A04C86');
  ctx.beginPath(); ctx.ellipse(bx, by + bob, 230, 170, 0, 0, 7); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#FFD0E6'; ctx.stroke();
  const g2 = mulberry32(8);
  for (let i = 0; i < 14; i++) { const x = bx - 180 + g2() * 360, y = by - 100 + g2() * 180 + bob; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 30, x + 60, y + 4); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(110,30,80,0.45)'; ctx.stroke(); }
  // turban
  ctx.beginPath(); ctx.ellipse(bx - 10, by - 150 + bob, 190, 80, 0, Math.PI, 0); ctx.fillStyle = '#5B4FD8'; ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(bx - 10, by - 150 + bob + i * 4, 190 - i * 20, 70 - i * 12, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke(); }
  circle(ctx, bx - 10, by - 205 + bob, 26, '#FFD447'); circle(ctx, bx - 10, by - 205 + bob, 14, '#E2424B');
  softDot(gctx, bx - 10, by - 205 + bob, 50, '#FF5A6E', 0.6);
  line(ctx, bx - 10, by - 228 + bob, bx + 30, by - 300 + bob + 6 * Math.sin(t * 5), 8, '#FFFFFF');
  // its face: looking at the ball, narrowing on "future"
  const sq = ramp(t, c.future - 0.2, c.future + 0.2);
  for (const ex of [bx + 40, bx + 130]) {
    ellipse(ctx, ex, by - 40 + bob, 30, 34 * (1 - 0.45 * sq), '#FFFFFF');
    circle(ctx, ex + 12, by - 34 + bob, 13, '#2A1030'); circle(ctx, ex + 8, by - 40 + bob, 4, '#FFFFFF');
    line(ctx, ex - 28, by - 86 + bob + 10 * sq, ex + 28, by - 92 + bob + 14 * sq * (ex > bx + 80 ? -0.3 : 1), 8, '#6A2A60');
  }
  ctx.beginPath(); ctx.moveTo(bx + 60, by + 50 + bob); ctx.quadraticCurveTo(bx + 95, by + 70 + bob + 10 * sq, bx + 130, by + 46 + bob); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = '#5A1A40'; ctx.stroke();
  // the crystal ball (right third) on a little stand
  const ox = 1250, oy = 470, pulse = 0.6 + 0.4 * Math.sin(t * 4) + 0.8 * ramp(t, c.future - 0.1, c.future + 0.3);
  rrect(ctx, ox - 110, oy + 150, 220, 50, 16); ctx.fillStyle = '#8A5A2A'; ctx.fill();
  rrect(ctx, ox - 80, oy + 120, 160, 40, 12); ctx.fillStyle = '#C8964E'; ctx.fill();
  const og = ctx.createRadialGradient(ox - 50, oy - 50, 10, ox, oy, 170); og.addColorStop(0, '#9FE8F8'); og.addColorStop(0.55, '#3A9ACF'); og.addColorStop(1, '#1A3A80');
  ctx.beginPath(); ctx.arc(ox, oy, 165, 0, 7); ctx.fillStyle = og; ctx.fill();
  softDot(gctx, ox, oy, 260, '#7FE9FF', 0.22 * pulse);
  // inside the ball: the feather, appearing on "predicting"
  ctx.save(); ctx.beginPath(); ctx.arc(ox, oy, 160, 0, 7); ctx.clip();
  ctx.globalAlpha = ramp(t, c.future - 1.2, c.future - 0.4);
  feather(ctx, ox - 70, oy + 80, 190, -0.85 + 0.1 * Math.sin(t * 3), t, { flutter: 0.6 });
  ctx.restore(); ctx.globalAlpha = 1;
  ellipse(ctx, ox - 60, oy - 70, 40, 22, 'rgba(255,255,255,0.55)', -0.6);
  // its hands round the ball
  for (const s of [-1, 1]) { line(ctx, bx + 160, by + 60 + bob, ox + s * 120, oy + 30 * s + 40, 18, '#C06A9E'); circle(ctx, ox + s * 140, oy + 30 * s + 40, 26, '#F2A8CC'); }
  ctx.restore();
  return { glow: 0.95, zblur: 0.12 * (1 - ramp(lt, 0, 0.35)), push: { k: 1.0, cx: 960, cy: 470 } };
};

// ================================================================= the want
// Last Sunday (daylight): Pip on the couch with her feather raised and a gold medal; him flat on the rug.
SC.pip = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1000, 470, 1.85], [c.six - shot.start, 990, 520, 1.55], [c.undefeated - shot.start, 900, 690, 1.0], [D, 900, 700, 0.97]]);
  homeSet(cam, t, { day: 1, lamp: 0 });
  // him on the rug, laughing weakly (eyes squeezed), a tear
  applyCam(cam);
  figure(cam, { x: 1180, y: 930, s: HOME.hs, pose: lerpPose(POSES.stand, POSES.fall, 0.5), face: Object.assign({}, FACES.laugh, { tear: 0.6, mouthOpen: 0.6 }), seed: 4,
    headDX: 3 * Math.sin(t * 12) }, t, { rot: -Math.PI / 2, pivot: [1180, 930], warm: 0.7, warmX: 1610, warmDir: -1, warmCol: '#FFD07A', ambient: 0.08 });
  // Pip standing on the couch (her feet on the seat), feather raised, a medal
  const pose = ikReach(ikReach(POSES.stand, 'R', [70, -560], 1), 'L', [-90, -260], -1);
  const r = pipFigure(cam, t, { x: 1050, y: 704, s: 0.46, pose, face: FACES.pipSmug, feather: { len: 260, ang: -1.75 + 0.1 * Math.sin(t * 5) } },
    { warm: 0.6, warmX: 1610, warmDir: -1, warmCol: '#FFD07A', ambient: 0.06,
      under: null });
  // the medal on her chest
  applyCam(cam);
  const mk = ramp(t, c.undefeated - 0.1, c.undefeated + 0.3, E.outBack);
  const [mx, my] = [1050, 704 - 360 * 0.46];
  line(ctx, mx - 22, my - 50, mx, my, 5, '#2A6AD8'); line(ctx, mx + 22, my - 50, mx, my, 5, '#2A6AD8');
  circle(ctx, mx, my + 12, 20 + 4 * mk, '#FFD447'); circle(ctx, mx, my + 12, 13, '#FFE98A');
  softDot(gctx, mx, my + 12, 40 + 50 * mk, '#FFE070', 0.3 + 0.5 * mk);
  if (mk > 0) for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.57; line(ctx, mx + Math.cos(a) * 34, my + 12 + Math.sin(a) * 34, mx + Math.cos(a) * (44 + 10 * mk), my + 12 + Math.sin(a) * (44 + 10 * mk), 4, rgba('#FFF6C8', mk)); }
  // the wall scoreboard
  const sk = ramp(t, c.undefeated + 0.2, c.undefeated + 0.55, E.outBack);
  if (sk > 0) {
    ctx.save(); ctx.translate(560, 300); ctx.scale(sk, sk); ctx.rotate(-0.04);
    rrect(ctx, -170, -80, 340, 160, 14); ctx.fillStyle = '#1F3A2E'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#8A5A2A'; ctx.stroke();
    ctx.font = '400 54px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#F4F6FF';
    ctx.fillText('PIP  37', 0, -28); ctx.fillText('UNCLE  0', 0, 36);
    ctx.restore();
  }
  screenSpace();
  pill(270, 130, 'LAST SUNDAY', '#FFD447', ramp(lt, 0.05, 0.4), 54);
  return { glow: 0.75, tint: '#FFE2B0', tintA: 0.12 };
};

// The plan: the headband, SUNDAY circled on the calendar, the feather raised like a sword.
SC.plan = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const toCal = ramp(t, c.plan - 0.5, c.plan + 0.3, E.inOutCubic) * (1 - ramp(t, c.tickle_day - 0.3, c.tickle_day + 0.3, E.inOutCubic));
  const cam = camKeys(lt, [[0, 820, 520, 1.55], [D, 830, 520, 1.7]]);
  const cam2 = { x: lerp(cam.x, HOME.calX, toCal), y: lerp(cam.y, 360, toCal), zoom: lerp(cam.zoom, 2.4, toCal), rot: 0 };
  homeSet(cam2, t);
  // standing in front of the couch
  const tie = ramp(t, SHOT('plan').start + 0.1, SHOT('plan').start + 0.9);
  const sword = ramp(t, c.tickle_day, c.tickle_day + 0.35, E.outBack);
  let p = POSES.stand;
  p = ikReach(p, 'L', [lerp(-60, -40, tie), lerp(-200, -520, tie * (1 - sword))], 1);
  p = ikReach(p, 'R', [lerp(80, 100, sword), lerp(-200, -560 * 0.98, sword) + lerp(-280, 0, 1 - tie) * (1 - sword)], 1);
  const nod = c.immune ? 0.06 * Math.sin(Math.PI * ramp(t, c.immune, c.immune + 0.4)) : 0;
  figure(cam2, { x: 800, y: 880, s: HOME.hs, pose: p, face: lerpFace(FACES.calm, FACES.determined, ramp(t, c.plan - 0.3, c.plan)), seed: 4, headDY: 12 * nod * 10 }, t, {
    warm: 1, post: (lc, r, st) => {
      headband(lc, r, st, ramp(t, SHOT('plan').start + 0.4, SHOT('plan').start + 0.8));
      if (sword > 0.02) { const wr = r.wrR, d = r.armDirR; feather(lc, wr[0] + d[0] * 18, wr[1] + d[1] * 18, 190 * sword, -1.62, t, { flutter: 0.5 }); }
    },
  });
  // the red circle drawn round SUNDAY on the calendar
  applyCam(cam2);
  const ck = ramp(t, c.plan - 0.2, c.plan + 0.5);
  if (ck > 0) {
    ctx.beginPath(); ctx.ellipse(HOME.calX + 58, 420, 46, 30, -0.1, -1.4, -1.4 + 6.6 * ck); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = '#FF3040'; ctx.stroke();
  }
  screenSpace();
  pill(960, 120, 'GOAL: UNTICKLEABLE', '#4DFFB4', ramp(t, c.immune - 0.15, c.immune + 0.25), 56);
  return nightPost({ glow: 0.8 });
};

// DAY 1 / DAY 2 / DAY 6: three hard cuts, three tries, nothing.
SC.days = (lt, t, shot) => {
  const c = cu(), k = t < c.day_cuts[0] ? 0 : t < c.day_cuts[1] ? 1 : 2;
  const t0 = [shot.start, c.day_cuts[0], c.day_cuts[1]][k], u = t - t0;
  const cams = [{ x: 820, y: 520, zoom: 1.7 }, { x: 760, y: 560, zoom: 2.3 }, { x: 860, y: 540, zoom: 1.45 }];
  const cm = Object.assign({ rot: 0 }, cams[k]); cm.zoom *= 1 + 0.03 * u;
  homeSet(cm, t, { lamp: k === 2 ? 0.55 : 1 });
  const wig = Math.sin(t * (k === 2 ? 22 : 10));
  let h;
  if (k === 0) h = { R: [56 + 8 * wig, -178], bendR: 1, face: FACES.deadpan, band: 1, feather: { len: 108, ang: -2.6 + 0.2 * wig } };
  else if (k === 1) h = { L: [-70, -330], bendL: 1, R: [-30 + 8 * wig, -170], bendR: 1, face: Object.assign({}, FACES.deadpan, { lookX: -0.6, lookY: 0.4 }), band: 1,
    feather: { len: 120, ang: -2.7 + 0.3 * wig } };
  else h = { R: [50 + 14 * wig, -150], bendR: 1, L: [-50 - 14 * wig, -150], bendL: 1, face: Object.assign({}, FACES.sad, { blink: 0.55 }), band: 1, tremble: 0.4, t,
    feather: { len: 120, ang: -2.2 + 0.4 * wig }, featherL: { len: 120, ang: -0.95 - 0.4 * wig } };
  heroSeated(cm, t, h);
  if (k === 2) {   // sweat, a wall clock at 3 a.m.
    applyCam(cm);
    sweatDrop(ctx, 870, 430 + 30 * ((t * 1.3) % 1), 1.1);
    const [cx, cy] = [1130, 300];
    circle(ctx, cx, cy, 62, '#20264C'); circle(ctx, cx, cy, 54, '#E8EAF4');
    line(ctx, cx, cy, cx + 30, cy, 7, '#20264C'); line(ctx, cx, cy, cx, cy - 42, 5, '#20264C');
  }
  screenSpace();
  const lab = ['DAY 1', 'DAY 2', 'DAY 6'][k];
  bigWord(lab, 330, 190, 150, k === 2 ? '#FF5A6E' : '#FFFFFF', E.outBack(clamp(u / 0.18), 2), -0.06);
  return nightPost({ tintA: 0.2 + 0.08 * k, flash: 0.18 * (1 - clamp(u / 0.12)) * (k > 0 ? 1 : 0) });
};

// Wordless: he lowers the feather and looks at it. Rain on the window. Cold.
SC.stare = (lt, t, shot) => {
  const D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 800, 500, 2.5], [D, 800, 505, 2.78]], E.inOutSine);
  homeSet(cam, t, { lamp: 0.6 });
  const low = ramp(lt, 0, 0.9, E.inOutSine);
  heroSeated(cam, t, { R: [lerp(46, 26, low), lerp(-150, -170, low)], bendR: 1, band: 1,
    face: Object.assign({}, lerpFace(FACES.deadpan, FACES.sad, ramp(lt, 0.4, 1.4)), { lookX: 0.25, lookY: 0.7 }),
    headRot: 0.06 * low, headDY: 4 * low, feather: { len: 120, ang: lerp(-2.25, -1.75, low), flutter: 0.3 } });
  // rain shadows sliding over him (from the window)
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 9; i++) { const x = (i * 233 + 40) % W, y = ((t * 160 + i * 140) % (H + 300)) - 150; ctx.fillStyle = 'rgba(120,140,200,0.10)'; ctx.fillRect(x, y, 6, 120); }
  ctx.restore();
  return nightPost({ tintA: 0.3, desat: 0.15 });
};

// ================================================================= ACT 1: the cutaway
SC.brain = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1A1036', '#05030F');
  const cam = bhCam(lt, [[0, 40, 0, 1.25, 980, 560], [1.4, 0, -20, 0.98, 980, 560], [c.copy - shot.start, -30, -40, 1.02, 980, 560],
    [c.cerebellum - shot.start - 0.3, -150, -20, 1.45, 820, 520], [D, -150, -20, 1.5, 820, 520]]);
  const hand = ramp(t, c.move - 0.2, c.move + 0.8);
  brainHead(cam, t, { hand, order: inv(c.order - 0.1, c.muscles + 0.6, t), copy: inv(c.copy, c.back_here + 0.5, t),
    motorHi: env(t, c.order - 0.2, c.copy + 0.6, 0.3), cerebHi: ramp(t, c.back_here, c.cerebellum), wiggle: 0.6 });
  bhLabel(cam, 'ORDER', [-50, -140], -330, -120, '#FFD447', ramp(t, c.order, c.order + 0.3) * (1 - ramp(t, c.cerebellum - 0.4, c.cerebellum)));
  bhLabel(cam, 'COPY', [-110, -32], -300, 150, '#7FE9FF', ramp(t, c.copy, c.copy + 0.3) * (1 - ramp(t, c.cerebellum - 0.4, c.cerebellum)));
  bhLabel(cam, 'CEREBELLUM', BH.cereb, -170, -260, '#7FE9FF', ramp(t, c.cerebellum - 0.05, c.cerebellum + 0.3));
  return { glow: 0.9, zblur: 0.14 * (1 - ramp(lt, 0, 0.4)), flash: 0.2 * (1 - ramp(lt, 0, 0.15)) };
};

SC.predict = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  darkBg('#1A1036', '#05030F');
  const cam = bhCam(lt, [[0, -150, -20, 1.5, 820, 520], [c.predict - shot.start + 0.2, -200, -80, 0.85, 1060, 560],
    [c.touch - shot.start, -160, -60, 0.88, 1060, 560], [c.spoiler - shot.start - 0.2, -380, -200, 0.98, 960, 470], [D, -380, -200, 1.02, 960, 470]]);
  const fc = ramp(t, c.predict - 0.1, c.predict + 0.35);
  const level = 1 - 0.85 * ramp(t, c.turns_down, c.turns_down + 0.8);
  brainHead(cam, t, { hand: 1, wiggle: 0.6, cerebHi: 0.5 + 0.5 * fc, copy: 1, touchRun: inv(c.touch - 0.1, c.turns_down + 0.3, t),
    touchA: lerp(1, 0.3, 1 - level), touchHi: level * ramp(t, c.touch, c.touch + 0.4), senseHi: 0.6 * level * env(t, c.turns_down - 0.2, D + shot.start, 0.3) });
  bhSet(ctx, cam, 1); bhSet(gctx, cam, 0.5);
  bhForecast(t, fc, { label: t > c.schedule ? 'ON TIME' : 'EXPECTED' });
  bhKnob(t, ramp(t, c.turns_down - 0.25, c.turns_down + 0.1), level);
  // the cerebellum's smug little face on "it already knew"
  const sm = ramp(t, c.knew - 0.3, c.knew + 0.1);
  if (sm > 0) {
    const [x, y] = BH.cereb;
    for (const ex of [x - 20, x + 18]) { ellipse(ctx, ex, y - 6, 9 * sm, 9 * sm, '#FFFFFF'); circle(ctx, ex + 3, y - 4, 4 * sm, '#2A1030'); line(ctx, ex - 9, y - 10, ex + 9, y - 12, 4 * sm, '#5A2A5E'); }
    ctx.beginPath(); ctx.moveTo(x - 14, y + 14); ctx.quadraticCurveTo(x, y + 20, x + 14, y + 12); ctx.lineWidth = 4; ctx.strokeStyle = '#3A0E24'; ctx.stroke();
  }
  screenSpace();
  // SPOILER stamp over the forecast bubble
  const [sx, sy] = bhScreen(cam, [-560, -300]);
  stamp('SPOILER', sx, sy, ramp(t, c.spoiler - 0.05, c.spoiler + 0.2), '#FF4D5E', -0.16, 130);
  return { glow: 0.9 };
};

// ================================================================= he tries to surprise himself
SC.surprise = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 820, 520, 1.6], [c.and_you - shot.start, 815, 530, 1.85], [D, 810, 532, 2.05]], E.inOutSine);
  homeSet(cam, t);
  // the left hand creeps behind his back, then pokes his ribs on "And you..."
  const creep = ramp(t, shot.start + 0.4, c.and_you - 0.45, E.inOutSine), poke = ramp(t, c.and_you - 0.45, c.and_you - 0.3, E.outBack);
  const L = [lerp(-58, -120, creep) + lerp(0, 70, poke), lerp(-36, -60, creep) + lerp(0, -70, poke)];
  const looking = t < c.and_you + 0.4;
  const face = looking ? Object.assign({}, FACES.calm, { lookX: 0.9, lookY: -0.6, mouth: 'o', mouthOpen: 0.35 })
    : Object.assign({}, FACES.deadpan, { lookX: t < c.cant ? -0.7 : 0, lookY: t < c.cant ? 0.6 : 0.05 });
  heroSeated(cam, t, { L, bendL: -1, R: [58, -36], face, band: 1, headRot: looking ? 0.1 : 0 });
  // whistling notes while he pretends not to look
  if (looking) for (let i = 0; i < 3; i++) {
    const ph = (t * 0.9 + i / 3) % 1, [x, y] = toScreen(cam, 850 + 60 * ph, 545 - 90 * ph);
    screenSpace(); musicNote(ctx, x, y, 0.55, '#FFD447', 0.2, i % 2, Math.sin(Math.PI * ph));
  }
  return nightPost();
};
function musicNote(c, x, y, s, col, rot = 0, kind = 0, a = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha *= a;
  c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  ellipse(c, 0, 0, 17, 12.5, col, -0.4);
  c.lineWidth = 6; c.beginPath(); c.moveTo(14, -3); c.lineTo(14, -72); c.stroke();
  if (kind === 0) { c.beginPath(); c.moveTo(14, -72); c.quadraticCurveTo(46, -62, 40, -30); c.lineWidth = 7; c.stroke(); }
  else { ellipse(c, 52, -12, 17, 12.5, col, -0.4); c.beginPath(); c.moveTo(66, -15); c.lineTo(66, -84); c.stroke(); c.beginPath(); c.moveTo(14, -72); c.lineTo(66, -84); c.lineWidth = 12; c.stroke(); }
  c.restore();
}

// "So what if you could?" His eyes narrow; a glint.
SC.rehook1 = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 800, 505, 3.1], [D, 800, 505, 3.6]], E.inOutSine);
  homeSet(cam, t);
  const idea = ramp(t, c.could - 0.1, c.could + 0.3);
  heroSeated(cam, t, { band: 1, face: Object.assign({}, lerpFace(FACES.deadpan, FACES.determined, idea), { lookX: 0.4 * idea, lookY: -0.2 }), headRot: -0.05 * idea });
  const [ex, ey] = toScreen(cam, 800 + 20 * HOME.hs, HOME.seatY - 284 * HOME.hs);
  screenSpace();
  if (idea > 0) { softDot(gctx, ex, ey, 70, '#FFFFFF', 0.8 * idea * (1 - ramp(t, c.could + 0.5, c.could + 1.2))); }
  return nightPost({ tintA: 0.12, glow: 0.9 });
};

// ================================================================= ACT 2: the tickle robot
function labRig(cam, t, o) {
  labBack(cam, t);
  applyCam(cam);
  const off = o.off || 0, lagOff = o.lagOff === undefined ? off : o.lagOff;
  // robot 1 (small, scaled) under his left hand
  ctx.save(); ctx.translate(800, LAB.benchY + 4); ctx.scale(0.6, 0.6);
  robotHandle(0, 0, off / 0.6 / 1.2, t, { delay: o.delay });
  ctx.restore();
  const handle = [800 + off, LAB.benchY + 4 - 186 * 0.6];
  // the hero behind the bench
  const st0 = { x: LAB.hx, y: LAB.hy, s: LAB.hs };
  const L = ikLocal(st0, handle[0] - 8, handle[1] + 6), R = ikLocal(st0, 1068, LAB.benchY - 8);
  labHero(cam, t, { L, R, face: o.face, shake: o.shake, pal: HOMEPAL, post: (lc, r, st) => headband(lc, r, st, 1) });
  // his palm on the bench (a flat open hand, drawn over the rig's hand) and the robot arm with the foam over it
  applyCam(cam);
  ellipse(ctx, 1070, LAB.benchY - 4, 46, 20, PAL.skinSh); ellipse(ctx, 1068, LAB.benchY - 7, 42, 16, PAL.skin);
  for (let i = 0; i < 4; i++) ellipse(ctx, 1100 + i * 2, LAB.benchY - 16 + i * 7, 22, 6, PAL.skin);
  robotArm(1460, LAB.benchY + 4, 1068 + lagOff * 1.1, LAB.benchY - 16, t);
  return handle;
}
SC.lab = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 520, 1.3], [c.handle - shot.start - 0.3, 870, 580, 1.9], [c.strokes - shot.start - 0.2, 1080, 610, 1.9], [D, 1060, 540, 1.4]]);
  const go = ramp(t, c.handle - 0.2, c.handle + 0.3), off = 34 * Math.sin(t * 2 * Math.PI * 1.1) * go;
  labRig(cam, t, { off, lagOff: off * ramp(t, c.strokes - 0.3, c.strokes), delay: 0, face: Object.assign({}, FACES.calm, { lookX: lt < 2 ? 0 : 0.5, lookY: 0.6 }) });
  screenSpace();
  pill(260, 130, 'LONDON', '#7FE9FF', ramp(t, c.london - 0.05, c.london + 0.3), 56);
  const [fx, fy] = toScreen(cam, 1068, LAB.benchY - 30);
  pill(fx + 200, fy - 190, 'SOFT FOAM', '#FF86A6', ramp(t, c.foam - 0.1, c.foam + 0.2) * (1 - ramp(lt, D - 0.3, D)), 54);
  return { glow: 0.75 };
};
SC.sync = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1080, 530, 1.4], [c.delay - shot.start, 900, 560, 1.75], [c.comes_back - shot.start, 1080, 530, 1.4], [D, 1080, 525, 1.45]]);
  const dl = ramp(t, c.delay, c.delay + 0.2) * 0.2;
  const ph = (tt) => 34 * Math.sin(tt * 2 * Math.PI * 1.1);
  const off = ph(t), lagOff = ph(t - dl * 2.2);
  const tick = ramp(t, c.comes_back - 0.1, c.comes_back + 0.35);
  const v = lerp(0.12 + 0.03 * Math.sin(t * 7), 0.88 + 0.05 * Math.sin(t * 11), tick);
  const face = tick > 0.4 ? lerpFace(FACES.giggle, FACES.laugh, ramp(t, c.comes_back + 0.3, c.back_end + 0.4)) : FACES.deadpan;
  labRig(cam, t, { off, lagOff, delay: dl, face, shake: tick });
  applyCam(cam);
  screenSpace(); tickleMeter(1690, 430, 380, v, t, 1);
  screenSpace();
  if (tick > 0) haMarks(...toScreen(cam, 960, 470), t, tick, 7, 60);
  return { glow: 0.8 };
};
SC.fool = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1080, 520, 1.45], [D, 980, 500, 1.85]], E.inOutSine);
  const ph = (tt) => 34 * Math.sin(tt * 2 * Math.PI * 1.1);
  labRig(cam, t, { off: ph(t), lagOff: ph(t - 0.44), delay: 0.2, face: FACES.laugh, shake: 1 });
  applyCam(cam);
  screenSpace(); tickleMeter(1690, 430, 380, 0.95 + 0.04 * Math.sin(t * 13), t, 1);
  screenSpace();
  haMarks(...toScreen(cam, 960, 470), t, 1, 9, 70);
  bigWord('FOOLED!', 960, 210, 200, '#FFD447', ramp(t, c.fool - 0.05, c.fool + 0.25, E.outBack), -0.05);
  return { glow: 0.85 };
};

// ================================================================= the backfire: his homemade delay machine
function machineDraw(t, crank, armOff) {
  const c = ctx;
  // the crank wheel on a stand, left of him
  const wx = 600, wy = 700;
  line(c, wx, wy, wx - 50, HOME.floorY, 10, '#6A4A2A'); line(c, wx, wy, wx + 50, HOME.floorY, 10, '#6A4A2A');
  circle(c, wx, wy, 62, '#8A5A2A'); circle(c, wx, wy, 50, '#C8964E'); circle(c, wx, wy, 10, '#4A3A2A');
  for (let i = 0; i < 6; i++) { const a = crank + i * 1.047; line(c, wx, wy, wx + Math.cos(a) * 50, wy + Math.sin(a) * 50, 5, '#8A5A2A'); }
  const hx = wx + Math.cos(crank) * 44, hy = wy + Math.sin(crank) * 44;
  line(c, hx, hy, hx, hy - 34, 10, '#E2424B');
  // the belt: a rubber band from the wheel along the couch front to the box
  c.beginPath(); c.moveTo(wx, wy - 62); c.bezierCurveTo(800, 640 + 8 * Math.sin(t * 6), 950, 650, 1090, 600); c.lineWidth = 6; c.strokeStyle = '#3A3A3A'; c.stroke();
  c.beginPath(); c.moveTo(wx, wy + 62); c.bezierCurveTo(820, 800, 980, 760, 1090, 680); c.stroke();
  // the cardboard DELAY box on the right seat
  rrect(c, 1030, 560, 180, 150, 6); c.fillStyle = '#C8964E'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#8A5A2A'; c.stroke();
  line(c, 1030, 600, 1210, 600, 3, 'rgba(120,80,30,0.5)');
  c.font = '400 52px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2A1A10';
  c.save(); c.translate(1120, 652); c.rotate(-0.06); c.fillText('DELAY', 0, 0); c.restore();
  // little springs and a cog on top
  for (let i = 0; i < 5; i++) line(c, 1060 + i * 10, 556 - 6 * (i % 2), 1070 + i * 10, 556 - 6 * ((i + 1) % 2), 4, '#8A9AB8');
  c.save(); c.translate(1160, 548); c.rotate(crank * 0.7);
  for (let i = 0; i < 8; i++) { c.rotate(0.785); c.fillStyle = '#8A9AB8'; c.fillRect(-5, -28, 10, 12); }
  circle(c, 0, 0, 20, '#8A9AB8'); circle(c, 0, 0, 7, '#3A3A3A'); c.restore();
  // the long arm from the box to his chin, holding the feather (it moves LATE: armOff)
  const ax = 1040, ay = 580, tx = 862 + armOff * 0.5, ty = 560 + armOff;
  line(c, ax, ay, tx, ty, 12, '#6A4A2A'); line(c, ax, ay, tx, ty, 6, '#A87A4A');
  feather(c, tx, ty, 90, Math.PI * 1.08 + 0.15 * Math.sin(t * 9), t, { flutter: 0.6 });
}
SC.machine = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 880, 560, 1.5], [c.realize - shot.start, 860, 540, 1.8], [c.congrats - shot.start - 0.1, 880, 560, 1.4], [c.built - shot.start, 900, 570, 1.25], [D, 900, 570, 1.3]]);
  homeSet(cam, t);
  const cranking = 1 - ramp(t, c.realize - 0.1, c.realize + 0.1) + ramp(t, c.built - 0.2, c.built + 0.2);
  const crank = t * 5 * clamp(cranking) + 2;
  const lateOff = 14 * Math.sin((t - 0.25) * 9);
  const giggle = env(t, shot.start + 0.4, c.realize, 0.3), realize = ramp(t, c.realize, c.realize + 0.25), giggle2 = ramp(t, c.tickles_him - 0.6, c.tickles_him);
  let face = lerpFace(FACES.deadpan, FACES.laugh, giggle);
  if (realize > 0) face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 0, mouth: 'o' }), realize);
  if (t > c.congrats - 0.2) face = lerpFace(Object.assign({}, FACES.deadpan, { lookY: 0 }), FACES.giggle, giggle2);
  const wx = 600, wy = 700, hk = [wx + Math.cos(crank) * 44, wy + Math.sin(crank) * 44 - 34];
  const st0 = { x: HOME.hx, y: HOME.seatY, s: HOME.hs };
  applyCam(cam);
  heroSeated(cam, t, { L: ikLocal(st0, hk[0], hk[1]), bendL: -1, R: [58, -36], face, band: 1, shake: 0.7 * Math.max(giggle, giggle2) });
  applyCam(cam);
  machineDraw(t, crank, lateOff * clamp(cranking));
  screenSpace();
  const gk = ramp(t, c.untickle - 0.1, c.untickle + 0.25);
  pill(960, 120, 'GOAL: UNTICKLEABLE', '#4DFFB4', gk, 56);
  bigX(960, 120, 1.1, ramp(t, c.tickles_him - 0.2, c.tickles_him + 0.2));
  if (giggle > 0.05 || giggle2 > 0.05) haMarks(...toScreen(cam, 800, 470), t, Math.max(giggle, giggle2), 11, 56);
  return nightPost({ tintA: 0.14 });
};

// ================================================================= ACT 3: the pushes
SC.press = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  // a black stage with one warm spotlight
  screenSpace();
  ctx.fillStyle = '#05050C'; ctx.fillRect(0, 0, W, H);
  const cone = ctx.createRadialGradient(960, 620, 40, 960, 620, 760); cone.addColorStop(0, 'rgba(255,220,170,0.22)'); cone.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = cone; ctx.fillRect(0, 0, W, H);
  ellipse(ctx, 960, 760, 520, 70, 'rgba(255,220,170,0.08)');
  const k = 1 + 0.05 * lt / D + 0.25 * (1 - ramp(t, c.pushes - 3.2, c.pushes - 2.6));
  ctx.save(); ctx.translate(960, 520); ctx.scale(k, k); ctx.translate(-960, -520);
  // the feather falls into the spotlight and is flicked away on "at all"
  const away = ramp(t, c.pushes - 3.4, c.pushes - 2.9, E.inCubic);
  if (t < c.pushes - 2.8) {
    const fy = lerp(-100, 520, ramp(t, shot.start, shot.start + 2.4, E.outCubic)), fx = 960 + 40 * Math.sin(t * 2.5) + 1400 * away;
    feather(ctx, fx - 170, fy, 340, 0.2 * Math.sin(t * 2) + away * 3, t, { flutter: 0.7 });
    softDot(gctx, fx, fy, 160, '#FFB0D0', 0.25 * (1 - away));
  }
  // his own push: a hand from the left pressing a plate; PUSHED vs FELT
  const own = env(t, c.pushes - 2.6, c.experiment - 0.3, 0.3), duo = ramp(t, c.experiment - 0.2, c.experiment + 0.4);
  const pTurn = t > c.two_people ? (Math.floor((t - c.two_people) / 0.9) % 2) : 0;
  const pressL = own * (0.5 + 0.5 * Math.sin(t * 5)) + duo * (pTurn === 0 ? env((t - c.two_people) % 0.9, 0, 0.9, 0.25) : 0);
  const pressR = duo * (pTurn === 1 ? env((t - c.two_people) % 0.9, 0, 0.9, 0.25) : 0);
  const showL = Math.max(own, duo);
  if (showL > 0) {
    ctx.globalAlpha = clamp(showL * 2);
    const x0 = lerp(-400, 0, E.outCubic(showL));
    pointArm(930 + x0 + 14 * pressL, 560, -1, HOMEPAL.coat, HOMEPAL.coatSh, 0);
    ctx.globalAlpha = 1;
  }
  if (duo > 0) pointArm(990 + lerp(400, 0, E.outCubic(duo)) - 14 * pressR, 560, 1, '#3FB27F', '#2A8A5E', 0);
  // the little plate between the fingertips
  if (showL > 0) { rrect(ctx, 945, 560, 30, 110, 8); ctx.fillStyle = '#8A9AB8'; ctx.fill(); }
  ctx.restore();
  // the bars: what you pushed vs what you felt
  if (own > 0.01) {
    forceBar(420, 740, 420, 2 * own, 2.2, '#FFD447', 'PUSHED', own);
    forceBar(1500, 740, 420, 1 * own, 2.2, '#7FE9FF', 'FELT', own);
    screenSpace(); bigWord('½', 1500, 250, 130, '#7FE9FF', own);
  }
  if (duo > 0) {
    screenSpace();
    bigWord('=', 960, 330, 160, '#FFFFFF', ramp(t, c.exactly - 0.1, c.exactly + 0.2, E.outBack));
    pill(470, 200, 'PRESS', '#8FB8FF', duo, 56); pill(1450, 200, 'PRESS BACK', '#4DFFB4', duo, 56);
  }
  return { glow: 0.85, capY: 960 };
};

// +38% a turn: a staircase that climbs with every push
SC.escalate = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  screenSpace();
  ctx.fillStyle = '#05050C'; ctx.fillRect(0, 0, W, H);
  softDot(ctx, 960, 560, 900, '#FFB870', 0.10);
  const k = 1 + 0.04 * lt / D;
  ctx.save(); ctx.translate(960, 540); ctx.scale(k, k); ctx.translate(-960, -540);
  const base = 800, x0 = 360, bw = 150;
  line(ctx, x0 - 40, base, x0 + 7 * (bw + 30), base, 5, 'rgba(255,255,255,0.5)');
  c.turns.forEach((tt, i) => {
    const g = ramp(t, tt, tt + 0.25, E.outBack), h = 72 * Math.pow(1.38, i) * g;
    if (g <= 0) return;
    const x = x0 + i * (bw + 30), col = i % 2 ? '#4DFFB4' : '#8FB8FF';
    rrect(ctx, x, base - h, bw, h, 12); ctx.fillStyle = col; ctx.fill();
    softDot(gctx, x + bw / 2, base - h, 60, col, 0.4 * g);
    if (i > 0) {
      ctx.font = '900 44px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = clamp(g); ctx.fillText('+38%', x + bw / 2, base - h - 36); ctx.globalAlpha = 1;
    }
  });
  ctx.font = '400 64px Anton'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('FORCE', x0 - 40, 200);
  ctx.restore();
  screenSpace();
  stamp('EVERY TURN', 1000, 190, ramp(t, c.forty - 0.1, c.forty + 0.15), '#FF4D5E', -0.12, 80);
  return { glow: 0.85, capY: 960 };
};

// "He pushed me first!": he and Pip, shoving, bigger and bigger; then the fight becomes an old painting.
SC.fight = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 960, 560, 2.0], [c.history - shot.start - 0.3, 960, 540, 1.75], [D, 960, 530, 1.6]]);
  homeSet(cam, t, { day: 1, lamp: 0 });
  // who is pushing: alternate shoves, each bigger
  let amp = 0, who = 0;
  c.shoves.forEach((s0, i) => { const e = env(t, s0, s0 + 0.55, 0.12); if (e > 0) { amp = e * (0.35 + 0.1 * i); who = i % 2; } });
  const lean = (side) => (who === side ? 0 : 1) * amp * 0.35;
  // Pip on the couch seat (taller), the hero on the rug in front
  // each pusher's hand goes to the other's shoulder; the one pushed leans and slides away
  const pipX = 1010 + 60 * lean(1), heroX = 860 - 60 * lean(0);
  const pipSh = [pipX - 74 * 0.48, 704 - 370 * 0.48], heroSh = [heroX + 74 * HOME.hs, 900 - 370 * HOME.hs];
  const pst = { x: pipX, y: 704, s: 0.48 }, hst = { x: heroX, y: 900, s: HOME.hs };
  const pp = who === 1 && amp > 0 ? ikReach(POSES.stand, 'L', ikLocal(pst, heroSh[0] + 20 * amp, heroSh[1]), 1) : ikReach(POSES.stand, 'L', [-120, -330], 1);
  pipFigure(cam, t, { x: pipX, y: 704, s: 0.48, pose: Object.assign({}, pp, { lean: lean(1) * 0.8 }), face: who === 0 && amp > 0.2 ? FACES.startled : FACES.pipSmug }, { warm: 0.6, warmX: 1610, warmDir: -1, warmCol: '#FFD07A' });
  const hp = who === 0 && amp > 0 ? ikReach(POSES.stand, 'R', ikLocal(hst, pipSh[0] - 20 * amp, pipSh[1]), 1) : ikReach(POSES.stand, 'R', [120, -330], 1);
  figure(cam, { x: heroX, y: 900, s: HOME.hs, pose: Object.assign({}, hp, { lean: -lean(0) * 0.6 }), face: who === 1 && amp > 0.2 ? FACES.startled : FACES.annoyed, seed: 4 }, t,
    { warm: 0.6, warmX: 1610, warmDir: -1, warmCol: '#FFD07A', post: (lc, r, st) => headband(lc, r, st, 1) });
  screenSpace();
  const bub = ramp(t, c.pushed - 0.25, c.pushed + 0.05);
  if (bub > 0) speech('HE PUSHED ME FIRST!', 1330, 170, bub, '#0B0B1A', 64, 0.05);
  // "in history": the frame turns into an old oil painting in a gold frame
  const old = ramp(t, c.history - 0.1, c.history + 0.4);
  if (old > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.fillStyle = `rgba(150,110,60,${0.75 * old})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    const fw = 70 * E.outBack(old);
    ctx.lineWidth = fw; ctx.strokeStyle = '#B8862E'; ctx.strokeRect(fw / 2, fw / 2, W - fw, H - fw);
    ctx.lineWidth = fw * 0.3; ctx.strokeStyle = '#FFD86A'; ctx.strokeRect(fw * 0.85, fw * 0.85, W - fw * 1.7, H - fw * 1.7);
  }
  return { glow: 0.7, tint: '#FFE2B0', tintA: 0.1 };
};

// ================================================================= the rats
SC.rats = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 760, 560, 1.75], [c.sound - shot.start - 0.3, 980, 520, 1.12], [c.chase - shot.start, 880, 560, 1.3], [D, 880, 560, 1.34]]);
  labBack(cam, t);
  // the hero leaning in from the left, cupping his ear on "too high for us to hear"
  const ear = ramp(t, c.high - 0.2, c.high + 0.3), shrug = ramp(t, c.hear, c.hear + 0.3) * (1 - ramp(t, c.chase, c.chase + 0.3));
  const st0 = { x: 420, y: LAB.hy, s: LAB.hs };
  labHero(cam, t, { x: 420, L: [-70, -60], R: ear > 0 ? [lerp(100, 70, ear), lerp(-60, -270, ear)] : [90, -60],
    face: ear > 0.5 ? Object.assign({}, FACES.confused, { lookX: 0.8 }) : Object.assign({}, FACES.soft, { lookX: 0.9, lookY: 0.5 }),
    headRot: 0.12 * ear, pal: HOMEPAL, post: (lc, r, st) => headband(lc, r, st, 1) });
  applyCam(cam);
  // the tank
  const tx = 780, ty = LAB.benchY;
  rrect(ctx, tx - 230, ty - 230, 460, 236, 12); ctx.fillStyle = 'rgba(160,230,255,0.10)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(200,245,255,0.55)'; ctx.stroke();
  for (let i = 0; i < 40; i++) ellipse(ctx, tx - 210 + (i * 37) % 420, ty - 12 - (i % 3) * 8, 14, 6, i % 2 ? '#E8C890' : '#D8B070');
  // the rat: on its back while tickled, then a joy jump after the hand
  const tick = env(t, c.tickle_rat - 0.2, c.chase - 0.2, 0.3), jump = c.chase ? ((t - c.chase) > 0 ? ((t - c.chase) * 1.6) % 1 : 0) : 0;
  const jumping = t > c.chase;
  drawRat(ctx, tx - 30 + (jumping ? 60 * ramp(t, c.chase, c.chase + 1.5) : 0), ty - 70, 0.85, t,
    { belly: tick, happy: Math.max(tick, jumping ? 1 : 0), jump: jumping ? jump : 0 });
  // the gloved hand
  const hin = ramp(t, c.tickle_rat - 0.6, c.tickle_rat - 0.1, E.outCubic), hout = ramp(t, c.chase - 0.2, c.chase + 1.2, E.inOutSine);
  gloveHand(lerp(1300, tx + 120, hin) + 220 * hout, ty - 150 - 30 * hout, t, tick, 0.8);
  // chirp marks out of its mouth
  if (tick > 0.2 || jumping) for (let i = 0; i < 3; i++) {
    const ph = (t * 1.8 + i / 3) % 1, x = tx + 40 + 120 * ph, y = ty - 150 - 70 * ph;
    ctx.beginPath(); ctx.arc(x, y, 18 + 26 * ph, -0.8, 0.8); ctx.lineWidth = 5; ctx.strokeStyle = rgba('#FF86A6', 0.9 * Math.sin(Math.PI * ph)); ctx.stroke();
  }
  screenSpace();
  const [dx, dy] = toScreen(cam, 1330, 380);
  batDetector(dx, dy, t, ramp(t, c.sound - 0.2, c.sound + 0.2), clamp(tick + (jumping ? 1 : 0)));
  if (shrug > 0) { const [qx, qy] = toScreen(cam, 470, 300); bigWord('?', qx, qy, 120, '#7FE9FF', shrug); }
  return { glow: 0.8 };
};

// ================================================================= the turn: the family photos
SC.play = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 690, 330, 2.7], [1.7, 910, 330, 2.7], [c.play - shot.start, 1130, 330, 2.7], [c.two_brains - shot.start, 910, 380, 1.55], [D, 910, 390, 1.5]]);
  homeSet(cam, t);
  applyCam(cam);
  const warm = ramp(t, c.play, c.bond);
  PHOTOS.forEach((_, i) => photoFrame(i, t, warm));
  // a warm thread between the photos on "two brains to bond"
  const th = ramp(t, c.two_brains - 0.3, c.bond + 0.2);
  if (th > 0) {
    const P = PHOTOS.map(([x, y]) => [x, y - 20]);
    for (const [cc, w, a] of [[ctx, 4, 0.9], [gctx, 12, 0.6]]) {
      cc.beginPath(); cc.moveTo(P[0][0], P[0][1]);
      for (let i = 1; i < 3; i++) cc.quadraticCurveTo((P[i - 1][0] + P[i][0]) / 2, P[i][1] - 80, P[i][0], P[i][1]);
      cc.lineWidth = w; cc.strokeStyle = rgba('#FFD447', a * th); cc.setLineDash([2000]); cc.lineDashOffset = 2000 * (1 - th); cc.stroke(); cc.setLineDash([]);
    }
    for (const [x, y] of P) heartIcon(...toScreen(cam, x, y - 140), 0.9, th);
  }
  return { glow: 0.85, tint: '#FFD8A0', tintA: 0.12 * warm };
};

// Alone on the couch, he looks at the photos; he puts the feather down; he looks at the door.
SC.turn = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 900, 470, 1.25], [c.knows - shot.start, 830, 500, 1.9], [D, 830, 505, 2.2]], E.inOutSine);
  homeSet(cam, t);
  applyCam(cam);
  PHOTOS.forEach((_, i) => photoFrame(i, t, 0.5, 0.6));
  const down = ramp(t, c.knows - 0.2, c.knows + 1.0, E.inOutSine), toDoor = ramp(t, c.someone - 0.2, c.someone + 0.6, E.inOutSine);
  const lookUp = 1 - ramp(t, c.bug, c.bug + 0.6);
  const face = Object.assign({}, lerpFace(FACES.sad, FACES.soft, ramp(t, c.someone, c.there)),
    { lookX: lerp(lerp(0.2, -0.3, 1 - lookUp), 1, toDoor), lookY: lerp(lerp(-1, 0.6, 1 - lookUp), -0.1, toDoor) });
  heroSeated(cam, t, { R: [lerp(46, 120, down), lerp(-150, -30, down)], bendR: 1, face, band: 1 - ramp(t, c.someone, c.there),
    headRot: lerp(-0.05, 0.08, toDoor), feather: down < 0.97 ? { len: 120, ang: lerp(-2.25, -0.2, down), flutter: 0.3 } : null });
  if (down >= 0.97) { applyCam(cam); feather(ctx, 990, 702, 94, -0.15, t, { flutter: 0.1 }); }
  return nightPost({ tintA: lerp(0.18, 0.06, ramp(t, c.someone, c.there)), glow: 0.85 });
};

// ================================================================= Sunday: the door opens
SC.sunday = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1200, 520, 1.25], [c.door - shot.start + 0.4, 1150, 540, 1.12], [D, 1080, 560, 1.05]]);
  const door = ramp(t, c.door, c.door + 0.9, E.inOutCubic);
  homeSet(cam, t, { day: 1, door, sunK: 1, lamp: 0 });
  // Pip in the doorway, backlit, feather up; she runs in on "quit"
  const run = ramp(t, c.quit + 0.3, c.quit + 1.6, E.inOutCubic);
  const pose = run > 0 ? walkPose(t, 14) : ikReach(POSES.stand, 'R', [70, -560], 1);
  if (door > 0.3) pipFigure(cam, t, { x: lerp(HOME.doorX, 1180, run), y: HOME.floorY - 2, s: 0.46, pose: ikReach(pose, 'R', [70, -560], 1), face: FACES.pipGlee,
    feather: { len: 250, ang: -1.7 + 0.15 * Math.sin(t * 8) } }, { ambient: lerp(0.5, 0.06, run), ambCol: '#2A1A30', warm: 0.8, warmX: 1610, warmDir: -1, warmCol: '#FFD07A' });
  // he stands; opens his arms; takes off the headband on "quit" and drops it
  const up = ramp(t, c.door + 0.3, c.door + 1.0, E.inOutCubic), open = ramp(t, c.quit - 0.6, c.quit + 0.1, E.outBack);
  const band = 1 - ramp(t, c.quit - 0.1, c.quit + 0.2);
  let p = lerpPose(seatPose({}), POSES.stand, up);
  if (open > 0) p = lerpPose(p, Object.assign({}, POSES.stand, { armL: { a: 1.65, b: 0.35 }, armR: { a: 1.65, b: 0.35 }, hand: 'spread' }), open);
  applyCam(cam);
  if (up < 0.5) seatLegs(ctx, HOME.hx, HOME.seatY, HOME.hs, HOMEPAL);
  figure(cam, { x: HOME.hx + 60 * up, y: lerp(HOME.seatY, HOME.floorY, up), s: HOME.hs, pose: p, noLegs: up < 0.5, seed: 4,
    face: lerpFace(Object.assign({}, FACES.soft, { lookX: 1 }), FACES.grin, open) }, t,
  { warm: 0.9, warmX: 1610, warmDir: -1, warmCol: '#FFD07A', post: (lc, r, st) => headband(lc, r, st, band) });
  // the dropped headband
  if (band < 1) { applyCam(cam); const f = ramp(t, c.quit, c.quit + 0.5, E.inCubic); ellipse(ctx, HOME.hx + 120, lerp(470, HOME.floorY + 20, f), 34, 10, '#E2424B', 3 * f); }
  return { glow: 0.85, tint: '#FFE2B0', tintA: 0.1 };
};

// ================================================================= the end: laughing on the rug; the final image
SC.end = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = camKeys(lt, [[0, 1080, 905, 1.7], [c.final - shot.start, 1000, 905, 1.55], [D, 950, 930, 1.85]], E.inOutSine);
  homeSet(cam, t, { day: 1, door: 1, sunK: 1, lamp: 0 });
  const settle = ramp(t, c.final - 0.4, c.final + 2.5, E.inOutSine);     // the big laugh calms into a soft one
  const flop = ramp(t, c.does_them - 0.3, c.final + 0.3, E.inOutCubic);   // Pip lets go and flops down beside him
  // him on his back on the rug (head to the left), laughing
  const shk = 1 - 0.8 * settle;
  figure(cam, { x: 1420, y: 950, s: HOME.hs, pose: lerpPose(Object.assign({}, POSES.fall, { armL: { a: 0.35, b: 0.4 } }), Object.assign({}, POSES.stand, { armL: { a: 0.12, b: 0.1 }, armR: { a: 1.5, b: 0.7 } }), settle), seed: 4,
    face: lerpFace(FACES.laugh, Object.assign({}, FACES.grin, { blink: 0.62, mouthOpen: 0.7 }), settle), headDX: 5 * shk * Math.sin(t * 31), headRot: 0.08 * shk * Math.sin(t * 17) }, t,
  { rot: -Math.PI / 2, pivot: [1420, 950], warm: 0.9, warmX: 1610, warmDir: -1, warmCol: '#FFD07A', ambient: 0.06 });
  // Pip: kneeling over him with the feather, then lying beside him (head to the right, near his)
  const tick = 1 - flop;
  const pp = ikReach(POSES.stand, 'R', [-120 + 40 * Math.sin(t * 16), -200], 1);
  pipFigure(cam, t, { x: lerp(1180, 600, flop), y: lerp(905, 940, flop), s: 0.46, pose: lerpPose(Object.assign({}, pp, { lean: 0.5 }), POSES.fall, flop),
    face: lerpFace(FACES.pipGlee, FACES.laugh, flop), rot: lerp(0, Math.PI / 2, flop), pivot: [lerp(1180, 600, flop), 940],
    feather: tick > 0.05 ? { len: 240, ang: Math.PI * 0.85 + 0.25 * Math.sin(t * 15) } : null }, { warm: 0.8, warmX: 1610, warmDir: -1, warmCol: '#FFD07A', ambient: 0.05 });
  // the feather she let go: it drifts down through the sunlight and lands on his chest
  if (flop > 0.05) {
    const u = ramp(t, c.final - 0.4, c.final + 2.9, (x) => x), fx = lerp(1000, 1205, u) + 60 * Math.sin(u * 9) * (1 - u), fy = lerp(560, 905, E.outCubic(u));
    applyCam(cam);
    feather(ctx, fx - 70, fy, 150, 0.15 + 0.5 * Math.sin(u * 9) * (1 - u), t, { flutter: 0.5 * (1 - u) });
    softDot(gctx, fx, fy, 70, '#FFE6A0', 0.25 * (1 - u));
  }
  screenSpace();
  haMarks(...toScreen(cam, 900, 860), t, 1 - settle, 13, 60);
  // dust in the sunbeam
  for (let i = 0; i < 24; i++) {
    const x = (hash(i) * 900 + 800 + t * 12 * (hash(i + 3) - 0.5) * 6) % W, y = (hash(i + 9) * 700 + t * 8) % H;
    softDot(ctx, x, y, 3 + 3 * hash(i + 5), '#FFF2C8', 0.5 * settle);
  }
  return { glow: 0.85, tint: '#FFE2B0', tintA: 0.1 + 0.06 * settle };
};

// The thumbnail (make_cover.js draws this one frame). Rules: reference/long-form.md, "Thumbnail".
SC.cover = (lt, t, shot) => {
  // a saturated backdrop: magenta into deep violet, a warm glow behind his head
  screenSpace();
  const g = ctx.createRadialGradient(1340, 430, 60, 1200, 520, 1300); g.addColorStop(0, '#FF6FA8'); g.addColorStop(0.45, '#8A2BB8'); g.addColorStop(1, '#1A0A40');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; ctx.save(); ctx.translate(1340, 430); ctx.rotate(a); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -110); ctx.lineTo(1400, 110); ctx.fill(); ctx.restore(); }
  const cam = { x: 702, y: 528, zoom: 4.0, rot: 0 };
  heroSeated(cam, 1.2, { R: [48, -196], bendR: 1, face: Object.assign({}, FACES.deadpan, { lookX: -0.35, lookY: 0.0, blink: 0.45 }), band: 1,
    feather: { len: 112, ang: -2.78, curl: 0.45, flutter: 0 } }, { warm: 0.4, ambient: 0.05 });
  screenSpace();
  bigWord('BRAIN', 470, 330, 290, '#FFFFFF', 1, -0.06);
  bigWord('SAYS NO', 500, 640, 270, '#FFD447', 1, -0.06);
  return { glow: 0.35, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  initHome();
  initBrainHead();
  initLab();
}
