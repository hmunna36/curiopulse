// If You Fell Into JUPITER: the hero, skydiving. The house rig in a blue spacesuit (orange straps, white boots) with
// venus-day's glass helmet, a red scarf at his collar that streams UP while he falls fast and floats lazily in the
// soup, a selfie stick with a phone (we see its back), and whatever he holds (a diamond). From a description.
'use strict';

const JPPAL = Object.assign({}, PAL, { coat: '#2F7FE0', coatSh: '#1E5BAA', coatHi: '#66A8F4', coatDk: '#163E78', strap: '#FF9A3C',
  strapSh: '#C86A1E', pants: '#2A6CC4', pantsSh: '#1B4C92', shoe: '#F2F4F8', shoeSh: '#B6BECE', sole: '#3A4058' });

// the helmet in head space: a glass bubble on a collar. o: {fog, sweat (0..1), noodle (0..1 how far it has slid on),
// heat (0..1: the glass glows warm from below), sparkle (0..1 diamonds in his eyes), t}
function jpHelmet(c, o = {}) {
  const t = o.t || 0;
  rrect(c, -66, 60, 132, 30, 13); c.fillStyle = '#E9EDF6'; c.fill();
  rrect(c, -66, 74, 132, 16, 7); c.fillStyle = '#B8C0D4'; c.fill();
  paint(() => {
    if (o.sparkle > 0.02) {                                  // diamonds in his eyes (drawn on the face, under the glass)
      for (const s of [-1, 1]) {
        c.save(); c.translate(s * 24, -2); c.scale(o.sparkle, o.sparkle);
        c.beginPath(); c.moveTo(0, -15); c.lineTo(10, 0); c.lineTo(0, 15); c.lineTo(-10, 0); c.closePath();
        c.fillStyle = '#BFF0FF'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1A5A8C'; c.stroke();
        c.beginPath(); c.moveTo(-4, -4); c.lineTo(0, -10); c.lineTo(4, -4); c.fillStyle = '#FFFFFF'; c.fill();
        c.restore();
      }
    }
    if (o.sweat > 0.02) {                                    // sweat running down inside the glass
      for (let i = 0; i < 3; i++) {
        const u = ((t * 0.9 + i * 0.37) % 1), x = [-58, 50, -40][i], y = -50 + 80 * u;
        c.save(); c.globalAlpha = o.sweat * (1 - u * 0.6);
        c.beginPath(); c.moveTo(x, y - 12); c.quadraticCurveTo(x + 7, y + 2, x, y + 6); c.quadraticCurveTo(x - 7, y + 2, x, y - 12);
        c.fillStyle = '#BFEFFF'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#4A9AC8'; c.stroke(); c.restore();
      }
    }
    c.beginPath(); c.arc(0, -8, 100, 0, 7); c.fillStyle = 'rgba(190,226,255,0.10)'; c.fill();
    if (o.heat > 0.01) {                                     // the hot ocean's glow on the glass, from below
      const g = c.createLinearGradient(0, -108, 0, 92);
      g.addColorStop(0, 'rgba(255,120,40,0)'); g.addColorStop(1, `rgba(255,110,40,${0.35 * o.heat})`);
      c.fillStyle = g; c.beginPath(); c.arc(0, -8, 100, 0, 7); c.fill();
    }
    if (o.fog > 0.01) {
      const g = c.createRadialGradient(0, 44, 0, 0, 40, 30 + 80 * o.fog);
      g.addColorStop(0, `rgba(250,248,244,${0.8 * o.fog})`); g.addColorStop(1, 'rgba(248,246,242,0)');
      c.save(); c.beginPath(); c.arc(0, -8, 97, 0, 7); c.clip(); c.fillStyle = g; c.fillRect(-110, -110, 220, 220); c.restore();
    }
    c.lineWidth = 6; c.strokeStyle = 'rgba(235,246,255,0.9)'; c.beginPath(); c.arc(0, -8, 100, 0, 7); c.stroke();
    c.beginPath(); c.arc(0, -8, 86, Math.PI * 1.08, Math.PI * 1.42); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.72)'; c.stroke();
    c.beginPath(); c.arc(0, -8, 86, Math.PI * 1.5, Math.PI * 1.56); c.stroke();
    c.beginPath(); c.arc(0, -8, 92, Math.PI * 0.12, Math.PI * 0.34); c.lineWidth = 5; c.strokeStyle = 'rgba(255,200,140,0.55)'; c.stroke();
  });
  if (o.noodle > 0.01) {                                     // a noodle that landed on the dome and slides down one side
    const k = clamp(o.noodle), sl = clamp(o.noodleSlide || 0);
    c.save(); c.translate(0, -8);
    c.beginPath();
    for (let i = 0; i <= 26; i++) {
      const u = i / 26, a = -Math.PI / 2 + (u - 0.5) * 2.4 * k + 0.9 * sl;
      const rr = 104 + 5 * Math.sin(u * 14 + t * 3);
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr + (u > 0.75 ? (u - 0.75) * 160 * k * (0.5 + sl) : 0));
    }
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 15; c.strokeStyle = '#C99A3A'; c.stroke();
    c.lineWidth = 10; c.strokeStyle = '#F2D07A'; c.stroke();
    c.restore();
  }
}
// the scarf's tail (rig-local, behind him): from the neck, streaming up (w = 1, a fast fall) or floating (w = 0)
function jpScarfTail(c, r, w, t, side = 1) {
  const n = r.neck, pts = [];
  const L = 230, wave = 9 + 4 * w;
  for (let i = 0; i <= 18; i++) {
    const u = i / 18;
    const up = lerp(-0.25, -1.0, w), out = lerp(1.0, 0.42, w);                // direction: up the side of the helmet when falling
    const ph = t * lerp(2.2, 16, w) - u * 7;
    const amp = (6 + 40 * u) * lerp(0.5, 1, w);
    const x = n[0] + side * (40 + u * L * out) + amp * Math.sin(ph) * (w > 0.5 ? 0.6 : 1);
    const y = n[1] + 12 + u * L * up + amp * Math.cos(ph) * (w > 0.5 ? 1 : 0.5) * 0.7 + (1 - w) * 40 * u * u;
    pts.push([x, y, (1 - u * 0.55) * 36]);
  }
  c.beginPath();
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], a = Math.atan2(q[1] - p[1], q[0] - p[0]) - Math.PI / 2; c.lineTo(p[0] + Math.cos(a) * p[2] / 2, p[1] + Math.sin(a) * p[2] / 2); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], a = Math.atan2(q[1] - p[1], q[0] - p[0]) - Math.PI / 2; c.lineTo(p[0] - Math.cos(a) * p[2] / 2, p[1] - Math.sin(a) * p[2] / 2); }
  c.closePath(); c.fillStyle = '#E8343E'; c.fill();
  // the fringe at its end
  const e = pts[pts.length - 1];
  for (let k = -2; k <= 2; k++) line(c, e[0] + k * 5, e[1], e[0] + k * 6 + 6 * Math.sin(t * 9 + k), e[1] - 18 * (w > 0.5 ? 1 : -1), 3, '#B8222A');
}
// the selfie stick from his hand to a phone (rig-local); we see the phone's back
function jpSelfie(c, hand, to, pal) {
  line(c, hand[0], hand[1], to[0], to[1], 9, '#2A2E3E');
  const mx = lerp(hand[0], to[0], 0.45), my = lerp(hand[1], to[1], 0.45);
  line(c, hand[0], hand[1], mx, my, 14, '#3A4058');
  const a = Math.atan2(to[1] - hand[1], to[0] - hand[0]);
  c.save(); c.translate(to[0], to[1]); c.rotate(a + Math.PI / 2);
  rrect(c, -16, -24, 32, 30, 6); c.fillStyle = '#20232E'; c.fill();                 // the clamp
  c.rotate(-0.15);
  rrect(c, -64, -66, 128, 76, 14); c.fillStyle = '#2E3344'; c.fill();              // the phone, landscape, its back to us
  paint(() => {
    rrect(c, -54, -58, 40, 40, 10); c.fillStyle = '#1A1C26'; c.fill();
    circle(c, -42, -46, 9, '#0A0B10'); circle(c, -26, -30, 9, '#0A0B10'); circle(c, -42, -30, 5, '#E9E2C8');
    circle(c, -43, -48, 3, '#5A6A9A');
  });
  c.restore();
}

// A: {x, y, s, rot (him turned about his middle), face, pose (base), lean, headRot, headDX, headDY, armL / armR (targets,
// or {e, w}), handL / handR, stick: [x, y] (rig-local phone; held in the LEFT hand, screen-left), scarf: w (0..1),
// noodle, noodleSlide, sweat, heat, sparkle, fog, gem: {side, k, rot}, pinch (0..1: the right hand's two fingers on the
// glass where his nose is), squash (a little squash and stretch), post}
function jpHero(cam, t, A = {}) {
  const pal = A.pal || JPPAL;
  const st = { x: A.x, y: A.y, s: A.s || 1, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(A.pose || JP_POSE.dive));
  pose.lean = (A.lean || 0) + (pose.lean || 0);
  for (const sd of ['L', 'R']) {
    const tg = A['arm' + sd];
    if (!tg) continue;
    if (tg.e) pose = armAt(pose, sd, tg.e, tg.w);
    else pose = ikReach(pose, sd, tg, sd === 'L' ? -1 : 1);
  }
  if (A.handL) pose.handL = A.handL;
  if (A.handR) pose.handR = A.handR;
  let camR = cam;
  const mid = [st.x, st.y - 300 * st.s];
  if (A.rot || A.squash) {                                     // the whole of him turned (and squashed) about his middle
    const F = toScreen(cam, mid[0], mid[1]);
    camR = { x: mid[0], y: mid[1], zoom: cam.zoom, rot: (cam.rot || 0) + (A.rot || 0), sx: F[0] - W / 2, sy: F[1] - H / 2 };
  }
  const r = charLayer(camR, Object.assign({}, st, { pose }), t, { pal, pre: (lc) => {
    if (A.scarf !== undefined) {
      const rr = rig(pose);
      lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
      jpScarfTail(lc, rr, A.scarf, t, A.scarfSide || 1);
      lc.restore();
    }
  }, post: (lc, rr) => {
    headSpace(lc, rr, Object.assign({}, st, { pose }), (c) => {
      jpHelmet(c, { t, fog: A.fog || 0, sweat: A.sweat || 0, noodle: A.noodle || 0, noodleSlide: A.noodleSlide || 0, heat: A.heat || 0, sparkle: A.sparkle || 0 });
    });
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    // the scarf's knot at the collar, in front
    const nk = rr.neck;
    ellipse(lc, nk[0] + 18, nk[1] + 22, 20, 14, '#E8343E', 0.3);
    ellipse(lc, nk[0] - 14, nk[1] + 20, 24, 12, '#C82A34', -0.2);
    if (A.stick) jpSelfie(lc, [rr.wrL[0] + rr.armDirL[0] * 14, rr.wrL[1] + rr.armDirL[1] * 14], A.stick, pal);
    if (A.gem && A.gem.k > 0.01) {
      const sd = A.gem.side || 'R', w = rr['wr' + sd], d = rr['armDir' + sd];
      jpGem(lc, w[0] + d[0] * 30, w[1] + d[1] * 30 - 34, 44, A.gem.rot || 0, A.gem.k);
    }
    if (A.pinch > 0.01) {                                     // two fingers pinch the glass in front of his nose
      const hd = rr.head, P = [hd[0] + st.headDX + 4, hd[1] + st.headDY + 18];
      const w = rr.wrR, d = rr.armDirR;
      // the forearm and hand again, in front of the glass
      capsuleShaded(lc, rr.elR, w, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
      circle(lc, w[0] + d[0] * 14, w[1] + d[1] * 14, 21, pal.skin);
      const k = clamp(A.pinch), F = [w[0] + d[0] * 14, w[1] + d[1] * 14];
      for (const s2 of [-1, 1]) { line(lc, F[0], F[1], P[0] + s2 * 11 * (1 - 0.55 * k), P[1] + 4, 13, pal.skinSh); line(lc, F[0], F[1], P[0] + s2 * 11 * (1 - 0.55 * k), P[1] + 4, 9, pal.skin); }
    }
    if (A.post) A.post(lc, rr, st, pose);
    lc.restore();
  } });
  const cs = Math.cos(A.rot || 0), sn = Math.sin(A.rot || 0);
  const wp = (p) => {                                          // rig-local -> world, through his turn about his middle
    const wx = st.x + p[0] * st.s - mid[0], wy = st.y + p[1] * st.s - mid[1];
    return [mid[0] + wx * cs - wy * sn, mid[1] + wx * sn + wy * cs];
  };
  const hd = rig(pose).head;
  return { st, r, pose, wp, head: wp([hd[0] + st.headDX, hd[1] + st.headDY]) };
}
function headSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}

// poses (the rig: hipY, lean, arms {a: from straight down, out to his side; b: the elbow}, legs, hand)
const JP_POSE = {
  dive: { hipY: -222, lean: 0, armL: { a: 2.05, b: -0.55 }, armR: { a: 2.05, b: -0.55 }, legL: { a: 0.42, b: -0.75 }, legR: { a: 0.42, b: -0.75 }, hand: 'spread', feetFront: 1 },
  land: { hipY: -192, lean: 0, armL: { a: 0.78, b: 0.95 }, armR: { a: 0.78, b: 0.95 }, legL: { a: 0.34, b: -0.72 }, legR: { a: 0.34, b: -0.72 }, hand: 'open', feetFront: 1 },
  float: { hipY: -222, lean: 0, armL: { a: 1.0, b: 0.6 }, armR: { a: 1.05, b: 0.5 }, legL: { a: 0.16, b: -0.34 }, legR: { a: 0.2, b: -0.22 }, hand: 'open', feetFront: 1 },
  brace: { hipY: -206, lean: 0, armL: { a: 0.55, b: 0.4 }, armR: { a: 0.6, b: 0.5 }, legL: { a: 0.05, b: -0.15 }, legR: { a: 0.05, b: -0.15 }, hand: 'open', feetFront: 1 },
};
// swimming in something thick: the arms sweep out and back, the legs kick; ph = the stroke's phase, k = how much
function jpSwim(ph, k = 1) {
  const p = JSON.parse(JSON.stringify(JP_POSE.float)), s = Math.sin(ph), c2 = Math.cos(ph);
  p.armL = { a: 1.15 + 0.7 * s * k, b: 0.35 + 0.7 * Math.max(0, c2) * k };
  p.armR = { a: 1.15 + 0.7 * s * k, b: 0.35 + 0.7 * Math.max(0, c2) * k };
  p.legL = { a: 0.18 + 0.2 * Math.max(0, -s) * k, b: -0.3 - 0.6 * Math.max(0, -c2) * k };
  p.legR = { a: 0.22 + 0.2 * Math.max(0, -s) * k, b: -0.2 - 0.6 * Math.max(0, -c2) * k };
  return p;
}
// his faces
const JF = {
  grin: Object.assign({}, FACES.grin, { lookX: -0.8, lookY: -0.7, mouthOpen: 0.9, browY: 0.9 }),
  whee: Object.assign({}, FACES.grin, { lookX: 0, lookY: 0.3, mouthOpen: 1, browY: 1.1, eyeOpen: 1.15 }),
  ready: Object.assign({}, FACES.calm, { lookX: 0, lookY: 1, browY: 0.4, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.4 }),
  huh: Object.assign({}, FACES.startled, { lookX: 0, lookY: 1, mouth: 'o', mouthOpen: 0.6 }),
  oh: Object.assign({}, FACES.startled, { lookX: 0, lookY: 0.4, mouth: 'o', mouthOpen: 0.85, eyeOpen: 1.35 }),
  meh: Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0.2, blink: 0.35, browTilt: -0.3, browY: -0.2, mouth: 'flat', mouthOpen: 0 }),
  look: Object.assign({}, FACES.calm, { lookX: 0.6, lookY: -0.3, mouth: 'flat', mouthOpen: 0.2, browY: 0.4 }),
  yuck: Object.assign({}, FACES.nervous, { lookX: -0.4, lookY: -1, browY: 0.9, mouth: 'wavy', mouthOpen: 0.4 }),
  slow: Object.assign({}, FACES.calm, { lookX: 0.2, lookY: 0, blink: 0.45, browY: 0.1, mouth: 'o', mouthOpen: 0.5 }),
  hot: Object.assign({}, FACES.nervous, { lookX: 0, lookY: 0.6, browY: 1.0, browTilt: 0.9, mouth: 'grimace', mouthOpen: 0.7 }),
  squint: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, blink: 1, browY: -0.4, browTilt: -0.5, mouth: 'grimace', mouthOpen: 0.6 }),
  peek: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0.6, blink: 0, shutR: 1, browY: 0.3, browTilt: 0.4, mouth: 'flat', mouthOpen: 0.1 }),
  wave: Object.assign({}, FACES.grin, { lookX: -0.9, lookY: 0.1, mouthOpen: 0.7, browY: 0.8 }),
  wince: Object.assign({}, FACES.nervous, { lookX: -0.9, lookY: 0.3, blink: 0.5, browY: 0.8, browTilt: 1.0, mouth: 'grimace', mouthOpen: 0.9 }),
  up: Object.assign({}, FACES.startled, { lookX: 0, lookY: -1, mouth: 'o', mouthOpen: 0.5 }),
  rich: Object.assign({}, FACES.grin, { lookX: 0.3, lookY: -0.6, mouthOpen: 1, browY: 1.2, eyeOpen: 1.2 }),
  sly: Object.assign({}, FACES.grin, { lookX: -0.8, lookY: -0.7, mouthOpen: 0.6, browY: 0.5, browTilt: -0.4 }),
};
