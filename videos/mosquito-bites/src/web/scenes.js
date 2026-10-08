// Why Do Mosquitoes Bite YOU More? Short: the shots at the campsite (hook, answer, the trail of breath, the aside, the
// button). Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot, t = seconds in the video) and returns
// post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;
const shotOf = (id) => TLd.shots.find((s) => s.id === id);
const HERO_S = 0.95;
const heroAt = (o = {}) => Object.assign({ x: CAMP.HX, y: CAMP.GY, s: HERO_S }, o);
const clone = (p) => JSON.parse(JSON.stringify(p));

// ---------------------------------------------------------------- helpers
// a comic burst with a word (screen space)
function comicBurst(x, y, s, k, word, col = '#FF4A5E', rot = -0.12, size = 104) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.6) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 150 : 96 + 14 * (i % 3); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.82); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(word, 0, 6);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 190 * sc, col, 0.3); gctx.restore();
}
// a counter: an icon, a times sign and a number that punches when it changes (screen space). icon(c) draws at (0, 0)
function counterPill(x, y, k, num, col, icon, punch = 0, w = 300) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2) * (1 + 0.22 * punch);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(-0.04); ctx.scale(s, s);
  rrect(ctx, -w / 2, -64, w, 128, 40); ctx.fillStyle = 'rgba(8,10,30,0.82)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
  ctx.save(); ctx.translate(-w / 2 + 74, 4); icon(ctx); ctx.restore();
  ctx.font = '400 96px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
  ctx.fillText('×', -w / 2 + 128, 2); ctx.fillStyle = col; ctx.fillText(String(num), -w / 2 + 176, 4);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 170, col, 0.22 * clamp(k) + 0.3 * punch); gctx.restore();
}
// a pill with a leader line to a spot (screen space)
function inLabel(txt, x, y, px, py, col, k, size = 44) {
  if (k <= 0) return;
  leader([x, y + size * 0.7], [px, py], clamp(k * 1.6), col);
  pill(x, y, txt, col, k, size);
}
// a pill with a green tick in front of the words
function tickPill(txt, x, y, k, col = '#4DFFB4', size = 44) {
  if (k <= 0) return;
  pill(x, y, '   ' + txt, col, k, size);
  const s = E.outBack(clamp(k), 2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText('   ' + txt).width; ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.17; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.moveTo(-w / 2 - size * 0.02, 0); ctx.lineTo(-w / 2 + size * 0.2, size * 0.24); ctx.lineTo(-w / 2 + size * 0.62, -size * 0.3); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- the hero at camp
// the bites he already has (drawn in the character layer, so the light falls on them)
const heroBites = (n = 7) => (c, r, st) => {
  rigSpace(c, st, (cc) => {
    const A = (a, b, u, off) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [lerp(a[0], b[0], u) - dy / L * off, lerp(a[1], b[1], u) + dx / L * off]; };
    const spots = [A(r.elL, r.wrL, 0.28, 6), A(r.elL, r.wrL, 0.82, -7), A(r.elR, r.wrR, 0.4, 5), A(r.elR, r.wrR, 0.78, -6)];
    spots.slice(0, Math.max(0, n - 3)).forEach(([x, y]) => biteBump(cc, x, y, 12, 1));
  });
  headSpace(c, r, st, (cc) => { [[-30, -40], [-48, 34], [22, 54]].slice(0, n).forEach(([x, y]) => biteBump(cc, x, y, 12, 1)); });
};
// ---- frame 1 and round it, as one function of tt = seconds since frame 1 (negative = the Short's last frames: the loop).
// A mosquito is drinking from his cheek; his hand is already wound up; he slaps his own face.
const CHEEK = [50, 12];                   // head space: where it bites, and where the palm lands
function slapState(tt) {
  const c = cu();
  let p = clone(POSES.stand);
  const hip = p.hipY;
  const down = ramp(tt, -0.04, c.slap, E.inCubic), lift = ramp(tt, c.slap + 0.3, c.slap + 0.62, E.inOutCubic);
  const upPt = [132, hip - 306], hitPt = [64, hip - 224], offPt = [128, hip - 196];
  let hand = [lerp(upPt[0], hitPt[0], down) + 30 * Math.sin(Math.PI * down), lerp(upPt[1], hitPt[1], down) - 10 * Math.sin(Math.PI * down)];
  hand = [lerp(hand[0], offPt[0], lift), lerp(hand[1], offPt[1], lift)];
  const swat = ramp(tt, c.number - 0.05, c.number + 0.2);            // more of them: he starts to flap
  hand[0] += 30 * swat * Math.sin(tt * 19); hand[1] -= 64 * swat + 24 * swat * Math.cos(tt * 19);
  p = ikReach(p, 'R', hand, 1);
  if (swat > 0) {
    const q = ikReach(p, 'L', [-140 + 22 * Math.sin(tt * 17 + 1), hip - 236 + 22 * Math.cos(tt * 17 + 1)], 1);
    p.armL = { a: lerp(0.24, q.armL.a, swat), b: lerp(0.3, q.armL.b, swat) };
  } else p.armL = { a: 0.24, b: 0.3 };
  p.hand = (down > 0.05 && lift < 0.95) || swat > 0.5 ? 'spread' : 'open';
  const hit = tt > c.slap ? Math.exp(-(tt - c.slap) * 6) : 0;
  p.lean = -0.012 - 0.03 * hit;
  // the face: he eyes it sideways, takes the slap, is pleased with himself, then sees the next ones arrive
  const wince = ramp(tt, c.slap - 0.04, c.slap + 0.03) * (1 - ramp(tt, c.slap + 0.2, c.slap + 0.36));
  const got = ramp(tt, c.slap + 0.24, c.slap + 0.42) * (1 - ramp(tt, c.slap + 0.56, c.slap + 0.72));
  const worry = ramp(tt, c.slap + 0.56, c.slap + 0.74);
  let face = Object.assign({}, FACES.annoyed, { lookX: 1, lookY: 0.25, blink: 0.12, browTilt: -1.1, browY: -0.5, mouth: 'flat', mouthOpen: 0, eyeOpen: 1.05 });
  face = lerpFace(face, Object.assign({}, FACES.nervous, { blink: 1 }), wince);
  face = lerpFace(face, Object.assign({}, FACES.grin, { lookX: 0.5, lookY: 0.2, blink: 0 }), got);
  face = lerpFace(face, Object.assign({}, FACES.startled, { lookX: 0, lookY: 0.5, cross: 1, pupil: 0.7 }), worry);
  if (worry > 0.5) face.cross = 1;
  const st = heroAt({ pose: p, face, headDX: -3 - 15 * hit, headDY: 2 + 4 * hit - 3 * worry, headRot: -0.05 - 0.13 * hit + 0.03 * worry * Math.sin(tt * 9) });
  return { st, down, lift, hit, got, worry, wince, hip };
}
// where the newcomers land on his face (head space) and which way each faces: [x, y, flip, rot]
const LAND_SPOTS = [[20, 4, true, 0.1], [-74, 0, false, 0.5], [-36, -78, false, 0.0], [72, -36, true, -0.3], [40, -86, true, 0.1]];
function drawLanders(st, r, t, times, o = {}) {
  const s = (o.s || 0.26) * st.s;
  times.forEach((t0, i) => {
    if (i >= LAND_SPOTS.length) return;
    const u = inv(t0 - 0.4, t0, t);
    if (u <= 0) return;
    const [hx, hy, flip, rot] = LAND_SPOTS[i], side = flip ? 1 : -1, e = E.outCubic(u);
    const [wx, wy] = headPt(st, r, [hx, hy - 18]);
    const x = lerp(wx + side * 300, wx, e) + 20 * Math.sin(u * 9 + i) * (1 - u), y = lerp(wy - 200 - 30 * i, wy, e) + 16 * Math.sin(u * 11 + i * 2) * (1 - u);
    const landed = u >= 1, drink = ramp(t, t0 + 0.1, t0 + 1.2);
    mozzie(ctx, x, y, s, t, { fly: landed ? 0 : 1, flip, rot: landed ? rot : 0, prob: landed ? 1.15 : 0.4, probLen: landed ? 58 : 84, fill: drink, leg: 58, face: landed ? 'happy' : 'calm', seed: i, look: [0.5, 0.6], glow: 0.35 });
  });
}

function hookCam(tt) {
  const c = cu(), tw1 = c.and1 - 0.1, tw2 = c.bites_end - 0.14;
  const k = camKeys(tt, [[-0.4, 372, 934, 3.1], [0, 372, 928, 3.3], [0.34, 371, 925, 3.54], [tw1 - 0.02, 372, 925, 3.62], [tw1 + 0.24, 880, 1040, 2.6],
    [tw2 - 0.02, 884, 1040, 2.7], [tw2 + 0.26, 372, 970, 2.3], [shotOf('answer').start + 0.2, 372, 968, 2.34]]);
  const sh = shake(tt, 15 * (tt > c.slap ? Math.exp(-(tt - c.slap) * 7) : 0), 30, 3);
  k.x += sh[0] / k.zoom; k.y += sh[1] / k.zoom;
  return k;
}
// the hero, mobbed: after the pan back from his friend (and through the answer)
function mobState(t) {
  const c = cu();
  let p = clone(POSES.stand);
  const hip = p.hipY, fl = 1 - ramp(t, c.its - 0.3, c.its + 0.15);          // he flaps, then gives up
  let q = ikReach(p, 'L', [-150 + 28 * Math.sin(t * 17), hip - 262 + 30 * Math.cos(t * 17)], 1);
  q = ikReach(q, 'R', [150 + 28 * Math.sin(t * 15 + 2), hip - 280 + 30 * Math.cos(t * 15 + 2)], 1);
  for (const k of ['armL', 'armR']) p[k] = { a: lerp(0.2, q[k].a, fl), b: lerp(0.12, q[k].b, fl) };
  p.hand = fl > 0.5 ? 'spread' : 'open';
  let face = Object.assign({}, FACES.nervous, { lookX: 0.9, lookY: -0.1 });
  face = lerpFace(face, Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.32 }), 1 - fl);
  return heroAt({ pose: p, face, headRot: 0.05 * fl * Math.sin(t * 8), headDY: 2 * Math.sin(t * 2) });
}
// the cloud round his head; half of it behind him
function mobSwarm(st, t, front, o = {}) {
  mozSwarm(ctx, st.x, st.y - 540 * st.s, t, Object.assign({ n: 14, rx: 190, ry: 96, s: 0.95, seed: 3, front }, o));   // round his hair, clear of his face
}
// the mark his own hand leaves on his cheek (head space, inside the character layer)
function handPrint(cc, k) {
  if (k <= 0.01) return;
  cc.save(); cc.translate(CHEEK[0] - 6, CHEEK[1] + 2); cc.rotate(-0.5); cc.globalAlpha = 0.5 * clamp(k);
  cc.fillStyle = '#E8405C'; cc.beginPath(); cc.ellipse(0, 6, 15, 13, 0, 0, 7); cc.fill();
  for (let i = -1.5; i <= 1.5; i++) { cc.beginPath(); cc.ellipse(i * 8.5, -14 - (1.5 - Math.abs(i)) * 3, 3.6, 10, i * 0.14, 0, 7); cc.fill(); }
  cc.restore();
}
function hookDraw(tt, t) {
  const c = cu(), cam = hookCam(tt), tw1 = c.and1 - 0.1, tw2 = c.bites_end - 0.14;
  campBack(cam, t, { soft: 0.85 });
  applyCam(cam);
  // ---- his friend, in the chair by the fire: not one bite
  if (tt > tw1 - 0.05 && tt < tw2 + 0.3) {
    const sip = ramp(tt, tw1 + 0.2, tw1 + 0.55, E.inOutCubic) * (1 - ramp(tt, c.zero + 0.25, c.zero + 0.6, E.inOutCubic));
    const face = Object.assign({}, lerpFace(FACES.calm, FACES.grin, ramp(tt, c.zero + 0.3, c.zero + 0.6)), { blink: sip > 0.3 ? 1 : 0, lookX: -0.7, lookY: 0 });
    const fr = campFriend(cam, t, { sip, face, headRot: -0.05 * sip, halo: ramp(tt, c.zero - 0.05, c.zero + 0.25, E.outBack) });
    applyCam(cam);
    // one comes to look him over, sniffs, and leaves
    const hd = toWorld(fr.st, fr.r.head), a0 = tw1 + 0.26, a1 = c.has - 0.05, l0 = c.zero + 0.1;
    const inn = ramp(tt, a0, a1, E.outCubic), out = ramp(tt, l0, l0 + 0.55, E.inCubic);
    const mx = lerp(hd[0] - 420, hd[0] - 126, inn) - 520 * out, my = hd[1] + 6 + lerp(-150, 0, inn) - 170 * out + 8 * Math.sin(tt * 9);
    if (inn > 0 && out < 1) mozzie(ctx, mx, my, 0.36, t, { fly: 1, flip: out > 0.12, face: tt > a1 + 0.12 ? 'meh' : 'calm', sniff: inn >= 1 && out <= 0 ? 1 : 0, look: [0.8, 0.1], prob: 0.2, glow: 0.4 });
  }
  campFire(t);
  // ---- the hero
  if (tt < tw1 + 0.26) {
    const h = slapState(tt), st = h.st, mark = h.lift * (1 - 0.35 * ramp(tt, c.slap + 0.8, c.slap + 1.3));
    const r = campChar(cam, st, t, { post: (cc, rr, s2) => {
      heroBites(6)(cc, rr, s2);
      headSpace(cc, rr, s2, (hc) => handPrint(hc, mark));
      // the slapping hand again, on top of his head (the rig draws the head over the arms)
      rigSpace(cc, s2, (hc) => drawHand(hc, rr.wrR, rr.armDirR, s2.pose.hand, CAMPPAL, 1, t));
    } });
    applyCam(cam);
    const sp = headPt(st, r, [CHEEK[0] + 40, CHEEK[1] - 26]), k = st.s * 0.4;
    // mosquito number ten, drinking from his cheek; it sees the hand at the last moment
    if (tt < c.slap) {
      const see = ramp(tt, c.slap - 0.15, c.slap - 0.06);
      mozzie(ctx, sp[0], sp[1], k, t, { fly: 0, flip: true, rot: -0.42, prob: 1.0, probLen: 58, fill: 0.78, leg: 56, face: see > 0.5 ? 'shock' : 'happy', look: [-0.7, -0.7], glow: 0.3 });
    } else {
      // a puff where it was, and its little ghost on the way up
      const d = tt - c.slap, gk = ramp(tt, c.slap + 0.3, c.slap + 0.5) * (1 - ramp(tt, c.slap + 0.95, c.slap + 1.25));
      if (h.lift > 0.15 && d < 0.95) for (let i = 0; i < 7; i++) { const a = i * 0.9, rr2 = 24 + 70 * (d - 0.3); softDot(ctx, sp[0] - 10 + Math.cos(a) * rr2 * 0.5, sp[1] + Math.sin(a) * rr2 * 0.4, 12 + 16 * d, '#E9E4FF', 0.4 * clamp(1.25 - d * 1.4)); }
      if (gk > 0) mozzie(ctx, sp[0] + 16 + 22 * Math.sin(d * 5), sp[1] - 20 - 150 * (d - 0.3), k * 0.82, t, { fly: 1, halo: true, lid: 1, face: 'calm', alpha: 0.8 * gk, prob: 0.2, glow: 0.9 });
    }
    drawLanders(st, r, tt, [c.slap + 0.56, c.slap + 0.74, c.number + 0.02, c.number + 0.2, c.ten + 0.0]);
    screenSpace();
    const P = toScreen(cam, sp[0], sp[1]);
    shockLines(P[0] - 40, P[1] + 20, 110, inv(c.slap, c.slap + 0.4, tt), 12, '#FFFFFF', 4);
    comicBurst(824, 560, 0.8, inv(c.slap + 0.01, c.slap + 0.2, tt) * (1 - ramp(tt, c.slap + 0.7, c.slap + 0.9)), 'SLAP!', '#FF4A5E', 0.1);
    const cnt = tt >= c.slap ? 10 : 9, punch = Math.max(Math.exp(-Math.max(0, tt - c.slap) * 7) * (tt >= c.slap ? 1 : 0), Math.exp(-Math.pow((tt - c.ten - 0.08) / 0.1, 2)));
    counterPill(520, 1140, 1 - ramp(tt, tw1 - 0.1, tw1 + 0.05), cnt, cnt === 10 ? '#FF5A6E' : '#FFD447', (cc) => { cc.scale(1.9, 1.9); mozMini(cc, 6, 0, 1, 0.2, 2); }, punch);
  } else if (tt > tw2 - 0.02) {
    const st = mobState(t);
    mobSwarm(st, t, false);
    campChar(cam, st, t, { post: heroBites(7) });
    applyCam(cam);
    mobSwarm(st, t, true);
  }
  screenSpace();
  tickPill('0 BITES', 826, 650, ramp(tt, c.zero - 0.02, c.zero + 0.2) * (1 - ramp(tt, tw2 - 0.08, tw2 + 0.06)), '#4DFFB4', 42);
  return { cam, tw1, tw2 };
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  const c = cu(), h = hookDraw(t, t);
  const b1 = Math.sin(Math.PI * clamp(inv(h.tw1 - 0.03, h.tw1 + 0.27, t))), b2 = Math.sin(Math.PI * clamp(inv(h.tw2 - 0.03, h.tw2 + 0.29, t)));
  const sw = ramp(t, c.slap - 0.2, c.slap - 0.02) * (1 - ramp(t, c.slap, c.slap + 0.06));
  return { glow: 0.8, blur: [110 * b1 - 110 * b2, 26 * sw], flash: 0.2 * (t > c.slap ? Math.exp(-(t - c.slap) * 10) : 0) };
};

// ---- the answer: not sweet blood; his skin smells like dinner
function answerState(t) {
  const c = cu(), st = mobState(t);
  const up = ramp(t, c.skin1 - 0.4, c.skin1 + 0.08, E.inOutCubic);        // he lifts his forearm and looks at it
  if (up > 0) {
    const q = ikReach(st.pose, 'L', [-64, st.pose.hipY - 112], -1);
    st.pose = lerpPose(st.pose, q, up);
    const side = ramp(t, c.smells + 0.25, c.smells + 0.5), cam = ramp(t, c.dinner_end + 0.05, c.dinner_end + 0.25);
    let f = lerpFace(st.face, Object.assign({}, FACES.confused, { lookX: -0.9, lookY: 0.8 }), up);
    f = lerpFace(f, Object.assign({}, FACES.annoyed, { lookX: -1, lookY: -0.5, blink: 0.2 }), side);
    f = lerpFace(f, Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.38 }), cam);
    st.face = f; st.headRot = -0.06 * up * (1 - cam); st.headDY = 4 * up;
  }
  return st;
}
SC.answer = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  const cam = camKeys(lt, [[0, 372, 968, 2.34], [c.skin1 - s0 - 0.35, 372, 964, 2.4], [c.skin1 - s0 + 0.3, 312, 940, 2.95], [D, 306, 938, 3.08]]);
  campBack(cam, t, { soft: 0.85 });
  applyCam(cam);
  campFire(t);
  const st = answerState(t), thin = 1 - 0.6 * ramp(t, c.skin1 - 0.3, c.skin1 + 0.2);
  mobSwarm(st, t, false, { n: 14, k: thin });
  const r = campChar(cam, st, t, { post: heroBites(7) });
  applyCam(cam);
  mobSwarm(st, t, true, { n: 14, k: thin });
  // the smell off his forearm
  const sm = ramp(t, c.smells - 0.15, c.smells + 0.45);
  const fa = (u) => toWorld(st, [lerp(r.elL[0], r.wrL[0], u), lerp(r.elL[1], r.wrL[1], u) - 16]);
  for (let i = 0; i < 4; i++) { const [x, y] = fa(0.12 + i * 0.26); scentRibbon(x, y, 150, t, '#FFE066', sm, i, 4.5, 16); }
  // the guest: bib on, sniffing; then knife and fork
  const P = fa(0.4), u = inv(c.skin1 + 0.1, c.smells - 0.05, t), e = E.outCubic(u), din = ramp(t, c.dinner - 0.08, c.dinner + 0.1, E.outBack);
  if (u > 0) {
    const mx = lerp(st.x - 420, st.x - 152, e), my = lerp(st.y - 700, st.y - 424, e) + 5 * Math.sin(t * 8);
    const love = t > c.dinner - 0.04;
    mozzie(ctx, mx, my, 0.4, t, { fly: 1, bib: true, cutlery: din, sniff: u >= 1 && !love ? 1 : 0.2, face: love ? 'love' : 'happy', lid: love ? 0 : 0.7, look: [0.8, 0.5], prob: 0.55, glow: 0.5 });
    if (love) for (let i = 0; i < 3; i++) { const q = (((t - c.dinner) * 1.1 + i / 3) % 1); mozHeart(mx + 30 + 26 * Math.sin(q * 5 + i * 2), my - 46 - 70 * q, 0.5 + 0.2 * q, 1 - q); }
  }
  screenSpace();
  const out = 1 - ramp(t, c.blood_end + 0.3, c.blood_end + 0.5);
  bigWord('SWEET', 812, 516, 100, '#FF86A6', ramp(t, c.its, c.its + 0.18, E.outBack) * out, 0.05);
  bigWord('BLOOD?', 812, 622, 100, '#FF86A6', ramp(t, c.its + 0.1, c.its + 0.28, E.outBack) * out, 0.05);
  bigX(812, 570, 0.5, inv(c.blood + 0.06, c.blood + 0.24, t) * out);
  return { glow: 0.8 };
};

// ---- the trail of his breath: across the dark meadow, to one that is thirty feet away
const REED = [-344, 1392, -330, 1020];           // the cattail it sits on: foot (x, y), top (x, y)
function breathPath(M, A, u, t) {
  const b = Math.sin(Math.PI * u);
  return [lerp(M[0], A[0], u), lerp(M[1], A[1], u) - 70 * b + 46 * b * Math.sin(u * 9.4 - t * 0.8)];
}
SC.breath = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start;
  const go = ramp(t, c.away - 0.02, c.away + 0.5, E.inCubic);                // it takes off down the trail
  const cam = camKeys(lt, [[0, 350, 986, 2.3], [0.3, 344, 986, 2.3], [c.from - s0 + 0.05, -10, 1010, 1.12], [c.away - s0, -4, 1010, 1.15], [D, 250, 990, 1.42]]);
  campBack(cam, t, { soft: 0 });
  applyCam(cam);
  campFire(t);
  // him, by the fire, breathing out
  let p = clone(POSES.stand);
  p = ikReach(p, 'R', [116 + 18 * Math.sin(t * 13), p.hipY - 150 + 30 * Math.cos(t * 13)], 1);
  const st = heroAt({ pose: p, face: Object.assign({}, FACES.annoyed, { lookX: 0.4 * Math.sin(t * 3), lookY: -0.3, mouth: 'o', mouthOpen: 0.3 + 0.2 * Math.sin(t * 5) }), headDY: 2 * Math.sin(t * 2.2) });
  mobSwarm(st, t, false, { n: 8 });
  const r = campChar(cam, st, t, { post: heroBites(7), occlude: true });
  applyCam(cam);
  mobSwarm(st, t, true, { n: 8 });
  // the reed, and the one on it
  const sway = 10 * Math.sin(t * 1.4), top = [REED[2] + sway, REED[3]];
  ctx.lineCap = 'round'; ctx.strokeStyle = '#1C4A52'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(REED[0], REED[1]); ctx.quadraticCurveTo(REED[0] + 4, 1200, top[0], top[1]); ctx.stroke();
  ctx.strokeStyle = '#6A4630'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(top[0] - 2, top[1] + 96); ctx.lineTo(top[0], top[1] + 8); ctx.stroke();
  ctx.strokeStyle = '#8A6040'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(top[0] - 8, top[1] + 90); ctx.lineTo(top[0] - 6, top[1] + 14); ctx.stroke();
  const M = headPt(st, r, [-10, 40]), ms = 1.3;
  softDot(ctx, top[0] + 20, top[1] - 110, 330, '#5A7AD8', 0.28);                       // mist off the pond, so it reads against the night
  const mz = [top[0] + 8 + 1500 * go, top[1] - 74 * ms + 4 - 120 * go * (1 - go) * 4];
  const A = [top[0] + 150, top[1] - 170];                                  // its antennae
  // the trail: marching dashes from his mouth, bubbles of CO2 riding it
  const um = ramp(lt, 0.12, c.from - s0 + 0.1, E.inOutSine);
  if (um > 0.01) {
    const P = []; for (let i = 0; i <= 60; i++) { const u = (i / 60) * um; P.push(breathPath(M, A, u, t)); }
    both((cc, g) => {
      cc.save(); cc.beginPath(); P.forEach((q, i) => (i ? cc.lineTo(q[0], q[1]) : cc.moveTo(q[0], q[1])));
      cc.setLineDash([26, 22]); cc.lineDashOffset = t * 130; cc.lineCap = 'round'; cc.lineWidth = g ? 30 : 11;
      cc.strokeStyle = rgba('#7FE9FF', g ? 0.22 : 0.85); cc.stroke(); cc.restore();
    });
    for (let i = 0; i < 5; i++) {
      const u = (((t * 0.3 + i / 5) % 1) + 1) % 1;
      if (u > um) continue;
      const [bx, by] = breathPath(M, A, u, t), br = 40 + 6 * Math.sin(t * 3 + i), al = Math.min(1, u * 8) * Math.min(1, (um - u) * 8 + 0.3);
      circle(ctx, bx, by, br, rgba('#0B2A4A', 0.85 * al)); ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.lineWidth = 4; ctx.strokeStyle = rgba('#BFF0FF', al); ctx.stroke();
      ctx.save(); ctx.globalAlpha = al; ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#BFF0FF'; ctx.fillText('CO', bx - 7, by); ctx.font = '900 21px Montserrat'; ctx.fillText('2', bx + 25, by + 10); ctx.restore();
      softDot(gctx, bx, by, br * 1.8, '#7FE9FF', 0.3 * al);
    }
  }
  // the mosquito: idle, then it catches the scent, locks on and goes
  const got = ramp(t, c.from - 0.05, c.from + 0.15), lock = t > c.thirty + 0.3;
  mozzie(ctx, mz[0], mz[1], ms, t, { fly: go > 0 ? 1 : 0, rot: go > 0 ? -0.12 : 0, sniff: got, face: lock ? 'lock' : got > 0.5 ? 'shock' : 'calm', look: [0.9, -0.2], lid: got > 0.5 ? 0 : 0.35, prob: go > 0 ? 0.1 : 0.5, leg: 70, glow: 0.7 });
  // thirty feet
  const k30 = ramp(t, c.thirty - 0.2, c.thirty + 0.15), y30 = 1150, x0 = top[0] + 40, x1 = st.x;
  if (k30 > 0) both((cc, g) => {
    const xa = lerp((x0 + x1) / 2, x0, k30), xb = lerp((x0 + x1) / 2, x1, k30);
    cc.lineCap = 'round'; cc.lineWidth = g ? 16 : 7; cc.strokeStyle = rgba('#FFD447', g ? 0.3 : 1);
    cc.beginPath(); cc.moveTo(xa, y30); cc.lineTo(xb, y30); cc.moveTo(xa, y30 - 30); cc.lineTo(xa, y30 + 30); cc.moveTo(xb, y30 - 30); cc.lineTo(xb, y30 + 30); cc.stroke();
  });
  screenSpace();
  const lb = toScreen(cam, (x0 + x1) / 2, y30);
  pill(lb[0], lb[1] - 4, '30 FEET', '#FFD447', ramp(t, c.thirty - 0.05, c.thirty + 0.2) * (1 - ramp(t, c.away + 0.2, c.away + 0.4)), 60);
  const wh = ramp(t, c.away + 0.1, c.away + 0.5);
  return { glow: 0.85, blur: [60 * Math.sin(Math.PI * clamp(inv(0.26, c.from - s0 + 0.08, lt))) + 70 * wh, 0], flash: 0.2 * (1 - ramp(lt, 0, 0.16)) };
};

// ---- the aside: he sniffs his own arm (the subscribe pill plays over this shot: everything stays above y 1050)
SC.subcam = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const cam = { x: 352, y: 946 - 6 * ramp(lt, 0, D), zoom: 2.86 + 0.1 * ramp(lt, 0, D), rot: 0 };
  campBack(cam, t, { soft: 0.85 });
  applyCam(cam);
  campFire(t);
  const lift = ramp(lt, 0.05, 0.42, E.inOutCubic), yuck = ramp(t, c.itgets - 0.1, c.itgets + 0.18);
  const dip = Math.exp(-Math.pow((lt - 0.62) / 0.11, 2)) + Math.exp(-Math.pow((lt - 0.98) / 0.11, 2));     // sniff, sniff
  let p = clone(POSES.stand);
  const q = ikReach(p, 'L', [-52 - 14 * yuck, p.hipY - 204 + 26 * yuck], -1);
  p = lerpPose(p, q, lift);
  p.lean = 0.03 * yuck;
  let face = lerpFace(FACES.calm, Object.assign({}, FACES.confused, { lookX: -0.7, lookY: 0.8 }), lift);
  face = lerpFace(face, { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.3, browTilt: 1.1, mouth: 'wavy', mouthOpen: 0.4, blink: 1, cross: 0, squeeze: 1, tear: 0.5 * ramp(t, c.smellier, c.smellier + 0.4) }, yuck);
  const st = heroAt({ pose: p, face, headDY: 7 * dip * (1 - yuck) - 8 * yuck, headRot: -0.06 * lift * (1 - yuck) + 0.1 * yuck, headDX: 12 * yuck });
  const r = campChar(cam, st, t, { post: (cc, rr, s2) => {
    heroBites(7)(cc, rr, s2);
    // his forearm and hand again, over his chin (the rig draws the head over the arms)
    rigSpace(cc, s2, (hc) => { capsuleShaded(hc, rr.elL, rr.wrL, 36, CAMPPAL.skin, CAMPPAL.skinSh, CAMPPAL.skinHi, CAMPPAL); drawHand(hc, rr.wrL, rr.armDirL, 'open', CAMPPAL, -1, t); });
    rigSpace(cc, s2, (hc) => { for (const u of [0.3, 0.72]) biteBump(hc, lerp(rr.elL[0], rr.wrL[0], u), lerp(rr.elL[1], rr.wrL[1], u) + 4, 12, 1); });
  } });
  applyCam(cam);
  // sniff marks at his nose, then the stink
  const nose = headPt(st, r, [-4, 22]);
  for (const [t0, i] of [[0.62, 0], [0.98, 1]]) { const qq = inv(t0 - 0.06, t0 + 0.22, lt); if (qq > 0 && qq < 1) both((cc, g) => { cc.beginPath(); cc.arc(nose[0] - 18, nose[1] + 6, 10 + 22 * qq, 2.2, 4.2); cc.lineWidth = g ? 9 : 4; cc.lineCap = 'round'; cc.strokeStyle = rgba('#BFF0FF', (g ? 0.4 : 0.9) * (1 - qq)); cc.stroke(); }); }
  const stink = ramp(t, c.itgets - 0.25, c.smellier + 0.2);
  // (his forearm lies under his chin, elbow to the right: only what comes off his hand, left of his face, clears it)
  for (let i = 0; i < 3; i++) { const u = 1.08 + i * 0.22, x = lerp(r.elL[0], r.wrL[0], u), y = lerp(r.elL[1], r.wrL[1], u); const [wx, wy] = toWorld(st, [x, y - 10 + 6 * i]); scentRibbon(wx, wy, 130, t, '#9BE86A', stink, i + 2, 4.5, 9); }
  // one on his shoulder is in heaven
  const sh = toWorld(st, [r.shR[0] + 6, r.shR[1] - 36]), inn = ramp(lt, 0.5, 1.0, E.outCubic);
  if (inn > 0) {
    const love = t > c.itgets;
    mozzie(ctx, lerp(sh[0] + 260, sh[0], inn), lerp(sh[1] - 220, sh[1], inn), 0.3, t, { fly: inn < 1 ? 1 : 0, flip: true, leg: 60, face: love ? 'love' : 'happy', sniff: 1, lid: love ? 0 : 0.6, prob: 0.6, glow: 0.4, seed: 4 });
    if (love) for (let i = 0; i < 3; i++) { const qq = (((t - c.itgets) * 1.0 + i / 3) % 1); mozHeart(sh[0] - 8 + 18 * Math.sin(qq * 5 + i * 2), sh[1] - 40 - 60 * qq, 0.42 + 0.2 * qq, 1 - qq); }
  }
  return { glow: 0.8, flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};

// ---- the button: he is not sweet; he is a cheese board. Then the loop
function buttonState(t) {
  const c = cu();
  let p = clone(POSES.stand);
  const sag = ramp(t, c.cheese3 - 0.1, c.cheese3 + 0.3);
  p.armL = { a: 0.2 - 0.06 * sag, b: 0.12 }; p.armR = { a: 0.2 - 0.06 * sag, b: 0.12 };
  const down = ramp(t, c.youre - 0.05, c.youre + 0.5) * (1 - ramp(t, c.cheese3 + 0.05, c.cheese3 + 0.4));
  let face = Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.3 });
  face = lerpFace(face, Object.assign({}, FACES.worried, { lookX: 0.2, lookY: 1 }), down);
  const end = ramp(t, c.board_end, c.board_end + 0.25);
  face = lerpFace(face, Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.42, browTilt: -0.9 }), end);
  const bl = Math.exp(-Math.pow((t - c.board_end - 0.62) / 0.06, 2));
  face.blink = Math.max(face.blink, bl);
  return heroAt({ pose: p, face, headDY: 6 * down, headRot: 0.02 * Math.sin(t * 1.3) });
}
const DINERS = [[-300, 62, false], [-196, 96, false], [-70, 112, false], [70, 112, true], [196, 96, true], [300, 62, true]];
SC.button = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start, s0 = shot.start, DUR = TLd.duration, LOOP = 0.4;
  if (t >= DUR - LOOP) { hookDraw(t - DUR, t); const wh = 1 - ramp(t, DUR - LOOP, DUR - LOOP + 0.16); return { glow: 0.8, blur: [0, 70 * wh], zblur: 0.3 * wh }; }
  const cam = camKeys(lt, [[0, 372, 962, 2.3], [c.youre - s0 - 0.1, 372, 958, 2.36], [c.acheese - s0, 398, 1100, 1.3], [c.board_end - s0, 398, 1102, 1.32], [D - LOOP, 386, 1078, 1.5]]);
  const wide = ramp(t, c.youre - 0.1, c.acheese, E.inOutCubic);
  campBack(cam, t, { soft: 0.85 * (1 - wide) });
  applyCam(cam);
  const st = buttonState(t), bk = ramp(t, c.youre + 0.05, c.cheese3 + 0.25), BX = 340, BY = CAMP.GY + 6;
  cheeseBoard(ctx, BX, BY, bk, t, false);
  campFire(t);
  mobSwarm(st, t, false, { n: 10, k: 1 - wide });
  const flag = ramp(t, c.cheese3 - 0.02, c.cheese3 + 0.16, E.outBack);
  const r = campChar(cam, st, t, { post: (cc, rr, s2) => {
    heroBites(7)(cc, rr, s2);
    // a cocktail flag in his hair: he is on the menu
    if (flag > 0) headSpace(cc, rr, s2, (hc) => { hc.save(); hc.translate(14, -62); hc.rotate(0.16); hc.scale(flag, flag); hc.lineWidth = 5; hc.lineCap = 'round'; hc.strokeStyle = '#E8D8B0'; hc.beginPath(); hc.moveTo(0, 0); hc.lineTo(0, -104); hc.stroke(); hc.beginPath(); hc.moveTo(0, -104); hc.lineTo(58, -86); hc.lineTo(0, -66); hc.closePath(); hc.fillStyle = '#FF5A6E'; hc.fill(); hc.restore(); });
  } });
  applyCam(cam);
  mobSwarm(st, t, true, { n: 10, k: 1 - wide });
  cheeseBoard(ctx, BX, BY, bk, t, true);
  // the diners take their places round the board, bibs on; knives and forks up on "board"
  DINERS.forEach(([dx, dy, flip], i) => {
    const t0 = c.youre_end - 0.25 + i * 0.12, u = inv(t0, t0 + 0.45, t);
    if (u <= 0) return;
    const e = E.outCubic(u), x = lerp(BX + dx + (flip ? 500 : -500), BX + dx, e), y = lerp(BY + dy - 420, BY + dy - 52, e);
    mozzie(ctx, x, y, 0.5, t, { fly: u < 1 ? 1 : 0, flip, bib: true, leg: 56, cutlery: ramp(t, c.board - 0.1 + i * 0.03, c.board + 0.1 + i * 0.03, E.outBack), face: t > c.board ? 'love' : 'happy', look: [0.7, -0.5], prob: 0.4, glow: 0.4, seed: i });
  });
  screenSpace();
  const out = 1 - ramp(t, c.sweet2_end + 0.3, c.sweet2_end + 0.5);
  bigWord('SWEET', 818, 560, 110, '#FF86A6', ramp(t, c.notsweet - 0.2, c.notsweet, E.outBack) * out, 0.05);
  bigX(818, 560, 0.5, inv(c.sweet2 + 0.02, c.sweet2 + 0.2, t) * out);
  const wh = ramp(t, DUR - LOOP - 0.12, DUR - LOOP, E.inCubic);
  return { glow: 0.8, capY: lerp(1330, 1466, wide), zblur: 0.25 * wh, blur: [0, 60 * wh], flash: 0.25 * (1 - ramp(lt, 0, 0.18)) };
};

// ---- the cover (rendered from a one-shot copy of the timeline; not in the Short)
SC.cover = (lt, t, shot) => {
  const cam = { x: 372, y: 900, zoom: 3.3, rot: -0.02 };
  campBack(cam, 1.0, { soft: 0.9 });
  applyCam(cam);
  let p = clone(POSES.stand);
  p = ikReach(p, 'R', [132, p.hipY - 300], 1); p = ikReach(p, 'L', [-136, p.hipY - 290], 1); p.hand = 'spread';
  const st = heroAt({ pose: p, face: Object.assign({}, FACES.shock, { cross: 1, lookY: 0.4, pupil: 0.6 }), headRot: -0.03 });
  const r = campChar(cam, st, 1.0, { post: heroBites(7) });
  applyCam(cam);
  const nose = headPt(st, r, [66, 34]);
  mozzie(ctx, nose[0], nose[1], 0.36, 0.3, { fly: 0, flip: true, rot: 0.2, bib: true, cutlery: 1, fill: 0.7, leg: 40, face: 'love', prob: 1.2, probLen: 46, glow: 0.4 });
  for (const [hx, hy, fl, s] of [[-78, -30, false, 0.24], [70, -64, true, 0.22], [-30, -92, false, 0.2]]) { const q = headPt(st, r, [hx, hy]); mozzie(ctx, q[0], q[1], s, 0.5, { fly: 0, flip: fl, fill: 0.7, leg: 52, face: 'happy', prob: 1.1, probLen: 52, glow: 0.3 }); }
  mozSwarm(ctx, st.x, st.y - 470 * st.s, 2.2, { n: 10, rx: 250, ry: 190, s: 0.8, seed: 8 });
  screenSpace();
  bigWord('WHY', 540, 1146, 220, '#FFFFFF', 1, -0.04);
  bigWord('ME?', 540, 1366, 290, '#FFD447', 1, -0.04);
  return { glow: 0.8, noCaptions: true, noSubscribe: true };
};

function initScenes2() {
  initCamp();
  initMozzie();
}
