// The doorknob-shock worlds. World units are screen pixels at zoom 1.
//   a hallway on a winter evening: a wall with a rail, a wooden door with a brass knob (dsHall, dsDoor, dsKnob), the hero in
//   a red winter jumper from a description (dsHero), electrons as little cyan beads with a minus sign (dsElectron) that sit
//   on him (dsCharge), the spark (dsSpark);
//   the carpet up close with his sneaker sliding over it (dsCarpet, dsSneaker);
//   a hilltop under a storm with a giant doorknob (in scenes.js, with env.js's storm and bolts);
//   Greece, about 600 BC: columns at sunset, him in a toga with a laurel wreath, amber and a scrap of fur, feathers (dsGreece);
//   a chalkboard of arguments (dsBoard).
// Everything that should catch the light is drawn with shapes every frame (reference/visual.md, "The light").
'use strict';

const DS = { HX: 400, FLOOR: 1500, HS: 1.25, DX0: 610, DX1: 960, DTOP: 420, KX: 646, KY: 1088, KR: 23 };

// ---------------------------------------------------------------- the hallway
// cam: the camera. The wall, a picture frame, a radiator, the door with its frame, the floor (a rug runner).
function dsHall(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx;
  // the wall: a deep teal-blue above the rail, darker panelling below
  c.fillStyle = '#24495A'; c.fillRect(-1200, -600, 3600, 1780);
  c.fillStyle = '#1A3542'; c.fillRect(-1200, 1180, 3600, DS.FLOOR - 1180);
  c.fillStyle = '#2F5E70'; c.fillRect(-1200, 1166, 3600, 16);
  for (let x = -1180; x < 2400; x += 170) { c.fillStyle = '#16303C'; rrect(c, x + 14, 1206, 140, DS.FLOOR - 1250, 8); c.fill(); }
  // a framed picture (a snowy mountain) on the left, high
  c.fillStyle = '#C9A46A'; c.fillRect(70, 640, 210, 170);
  c.fillStyle = '#9FC3E4'; c.fillRect(84, 654, 182, 142);
  paint(() => {
    c.fillStyle = '#5D7EA6'; c.beginPath(); c.moveTo(84, 796); c.lineTo(160, 690); c.lineTo(214, 760); c.lineTo(240, 728); c.lineTo(266, 760); c.lineTo(266, 796); c.closePath(); c.fill();
    c.fillStyle = '#F4F8FF'; c.beginPath(); c.moveTo(146, 710); c.lineTo(160, 690); c.lineTo(176, 712); c.lineTo(166, 718); c.lineTo(156, 710); c.closePath(); c.fill();
  });
  // a wall lamp far left (the key light; it goes in the glow layer)
  c.fillStyle = '#C9A46A'; c.fillRect(-150, 560, 20, 60);
  c.fillStyle = '#FFE3B0'; c.beginPath(); c.moveTo(-190, 560); c.lineTo(-90, 560); c.lineTo(-110, 500); c.lineTo(-170, 500); c.closePath(); c.fill();
  softDot(gctx, -140, 540, 160, '#FFD08A', 0.55);
  // the door frame and the door
  const { DX0, DX1, DTOP } = DS;
  c.fillStyle = '#EDE6D6'; c.fillRect(DX0 - 40, DTOP - 40, DX1 - DX0 + 80, DS.FLOOR - DTOP + 40);
  c.fillStyle = '#6B3F26'; c.fillRect(DX0, DTOP, DX1 - DX0, DS.FLOOR - DTOP);
  paint(() => {
    for (const [y0, h] of [[DTOP + 50, 400], [DTOP + 520, 470]]) {
      rrect(c, DX0 + 40, y0, DX1 - DX0 - 80, h, 10); c.lineWidth = 10; c.strokeStyle = '#55301C'; c.stroke();
      rrect(c, DX0 + 52, y0 + 12, DX1 - DX0 - 104, h - 24, 8); c.lineWidth = 3; c.strokeStyle = '#86523A'; c.stroke();
    }
    line(c, DX0 + 6, DTOP, DX0 + 6, DS.FLOOR, 4, '#4E2C19');
  });
  // the floor and a runner
  c.fillStyle = '#3B2A22'; c.fillRect(-1200, DS.FLOOR, 3600, 900);
  c.fillStyle = '#8E2F3A'; c.beginPath(); c.moveTo(-200, DS.FLOOR + 10); c.lineTo(1200, DS.FLOOR + 10); c.lineTo(1500, 2400); c.lineTo(-500, 2400); c.closePath(); c.fill();
  paint(() => { for (let i = 0; i < 6; i++) line(c, -200 - i * 60, DS.FLOOR + 40 + i * 70, 1200 + i * 60, DS.FLOOR + 40 + i * 70, 4, 'rgba(0,0,0,0.18)'); });
  if (!o.noKnob) dsKnob(DS.KX, DS.KY, 1, t, o.knob || {});
}

// the brass knob on its round plate. o: {glow 0..1, face: null | {dazed 0..1, sad, smoke}, burn 0..1, s}
function dsKnob(x, y, s, t, o = {}) {
  const c = ctx, R = DS.KR * s;
  circle(c, x + 4 * s, y, R * 1.45, '#B78B3A');                 // the rose
  circle(c, x + 2 * s, y, R * 0.55, '#8E6A26');                 // the neck
  const g = c.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R * 1.05);
  g.addColorStop(0, '#FFF1B8'); g.addColorStop(0.35, '#E8B94C'); g.addColorStop(1, '#9A6B1E');
  c.fillStyle = g; c.beginPath(); c.arc(x - 6 * s, y, R, 0, 7); c.fill();
  if (o.burn > 0.01) { c.fillStyle = rgba('#2A1A10', 0.55 * o.burn); c.beginPath(); c.arc(x - 6 * s, y, R, 0, 7); c.fill(); }
  if (o.glow > 0.01) softDot(gctx, x - 6 * s, y, R * 3, '#9FD8FF', 0.7 * o.glow);
  if (o.face) dsKnobFace(x - 6 * s, y, R, t, o.face);
}
// the knob's face (the button): dazed eyes, a wobbly mouth, a plaster, a curl of smoke
function dsKnobFace(x, y, R, t, f) {
  const c = ctx;
  paint(() => {
    const d = f.dazed || 0;
    for (const sx of [-1, 1]) {
      const ex = x + sx * R * 0.36, ey = y - R * 0.12;
      circle(c, ex, ey, R * 0.24, '#FFFFFF');
      if (d > 0.5) {   // spiral eyes
        c.lineWidth = R * 0.06; c.strokeStyle = '#2A1A10'; c.beginPath();
        for (let a = 0; a < 9; a += 0.3) { const rr = R * 0.02 * a, aa = a + t * 6 * sx; c[a ? 'lineTo' : 'moveTo'](ex + Math.cos(aa) * rr, ey + Math.sin(aa) * rr); }
        c.stroke();
      } else circle(c, ex + R * 0.05, ey + R * 0.05, R * 0.11, '#2A1A10');
    }
    // mouth
    c.lineWidth = R * 0.08; c.strokeStyle = '#3A2010'; c.beginPath();
    for (let i = 0; i <= 10; i++) { const u = i / 10, mx = x - R * 0.32 + u * R * 0.64, my = y + R * 0.45 + Math.sin(u * 12 + t * 9) * R * 0.05 * (1 + d) + (f.sad || 0) * R * 0.12 * Math.sin(u * Math.PI) * -1; c[i ? 'lineTo' : 'moveTo'](mx, my); }
    c.stroke();
    // a plaster
    c.save(); c.translate(x + R * 0.55, y - R * 0.62); c.rotate(0.6);
    rrect(c, -R * 0.42, -R * 0.13, R * 0.84, R * 0.26, R * 0.12); c.fillStyle = '#F2C79A'; c.fill();
    rrect(c, -R * 0.14, -R * 0.13, R * 0.28, R * 0.26, R * 0.05); c.fillStyle = '#E3AE7C'; c.fill();
    c.restore();
  });
  if (f.smoke > 0.01) {   // smoke curling up off the top
    for (let i = 0; i < 4; i++) {
      const u = ((t * 0.7 + i / 4) % 1), sx = x + Math.sin(u * 7 + i) * R * 0.5, sy = y - R * 1.1 - u * R * 4.2;
      ellipse(ctx, sx, sy, R * (0.25 + u * 0.4), R * (0.22 + u * 0.35), rgba('#C7CBD6', 0.5 * (1 - u) * f.smoke));
    }
  }
}

// ---------------------------------------------------------------- the spark
// a short fat spark between two points, with branches and a hot core (world units, camera applied). f = frame number
function dsSpark(A, B, k, f, w = 1, seed = 0) {
  if (k <= 0.01) return;
  const rng = mulberry32(400 + f * 3 + seed), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  for (let i = 0; i < 3; i++) {
    const J = jagged(rng, A[0], A[1], B[0], B[1], L * (0.35 + rng() * 0.3), 4);
    poly(ctx, J, (i ? 3 : 6) * w, rgba('#F4FBFF', 0.95 * clamp(k * 1.4)));
    poly(gctx, J, (i ? 10 : 18) * w, rgba('#7FD0FF', 0.85 * clamp(k * 1.4)));
  }
  softDot(gctx, A[0], A[1], 38 * w, '#BFE8FF', 0.9 * k); softDot(gctx, B[0], B[1], 44 * w, '#BFE8FF', 0.9 * k);
  for (let i = 0; i < 6; i++) {   // little sparks spitting off
    const a = rng() * 6.283, r0 = 6 * w, r1 = (14 + rng() * 30) * w * k, P = rng() < 0.5 ? A : B;
    line(ctx, P[0] + Math.cos(a) * r0, P[1] + Math.sin(a) * r0, P[0] + Math.cos(a) * r1, P[1] + Math.sin(a) * r1, 2.5 * w, rgba('#E9F7FF', 0.9 * k));
  }
}

// ---------------------------------------------------------------- electrons
// one electron: a cyan bead with a minus sign; face 0..1 gives it two dots of eyes. (world or screen units: r in pixels)
function dsElectron(x, y, r, a = 1, face = 0, look = 0) {
  if (a <= 0.01 || r < 0.5) return;
  circle(ctx, x, y, r, rgba('#37C8FF', a));
  softDot(gctx, x, y, r * 2.2, '#5FD6FF', 0.32 * a);
  paint(() => {
    if (face > 0.5 && r > 7) {
      circle(ctx, x - r * 0.32 + look * r * 0.1, y - r * 0.2, r * 0.17, rgba('#08223A', a));
      circle(ctx, x + r * 0.32 + look * r * 0.1, y - r * 0.2, r * 0.17, rgba('#08223A', a));
      line(ctx, x - r * 0.28, y + r * 0.32, x + r * 0.28, y + r * 0.32, Math.max(1.5, r * 0.14), rgba('#08223A', a));
    } else line(ctx, x - r * 0.45, y, x + r * 0.45, y, Math.max(1.5, r * 0.26), rgba('#E9FBFF', a));
  });
}
// where electrons sit on him: rig-local points over his jumper, legs and arms (seeded, fixed)
let DS_SPOTS = null;
function dsSpots() {
  if (DS_SPOTS) return DS_SPOTS;
  const rng = mulberry32(77), out = [];
  for (let i = 0; i < 160; i++) {
    const u = rng();
    let p;
    if (u < 0.45) p = [-66 + rng() * 132, -360 + rng() * 150];          // the jumper
    else if (u < 0.93) { const sd = rng() < 0.5 ? -1 : 1; p = [sd * (22 + rng() * 34), -200 + rng() * 190]; }   // the legs
    else p = [-70 + rng() * 140, -560 + rng() * 30];   // on top of his hair
    out.push({ p, j: rng() * 10, r: 0.7 + rng() * 0.6, d: rng() });
  }
  DS_SPOTS = out;
  return out;
}
// the charge on him: n of the spots light up (n 0..160), a = alpha, size in world px, rig st, t
function dsCharge(st, n, t, size = 7, a = 1, o = {}) {
  const S = dsSpots();
  for (let i = 0; i < Math.min(S.length, n); i++) {
    const q = S[i], pop = clamp((n - i) / 3);
    let x = q.p[0] + 5 * vnoise(t * 2.1 + q.j, 3), y = q.p[1] + 5 * vnoise(t * 1.9 + q.j, 7);
    if (o.toward) { const k = clamp(o.toward * (0.6 + q.d * 0.8)); x = lerp(x, o.toward_p[0], k); y = lerp(y, o.toward_p[1], k); }
    const P = toWorld(st, [x, y]);
    dsElectron(P[0], P[1], size * q.r * E.outBack(pop, 2.4), a, 0);
  }
}

// ---------------------------------------------------------------- the hero
const DSPAL = Object.assign({}, PAL, { coat: '#C8323F', coatSh: '#93222D', coatHi: '#F06A72', coatDk: '#7A1A24', strap: '#F2E6D0', strapSh: '#CDBFA4', pj: true });
const DS_ARM = {
  restL: { e: [-104, -272], w: [-114, -184] }, restR: { e: [104, -272], w: [114, -184] },
  reachR: { e: [150, -300], w: [222, -326] },     // out to the knob (the hand lands at the knob's left)
  yankR: { e: [130, -300], w: [70, -352] },       // snatched back to his chest
  showR: { e: [150, -318], w: [150, -410] },      // his open hand held up beside his face, to look at
  scratchR: { e: [128, -380], w: [64, -476] },    // a hand on his head
  shrugL: { e: [-150, -300], w: [-206, -360] }, shrugR: { e: [150, -300], w: [206, -360] },
  amberL: { e: [-120, -300], w: [-40, -344] },    // holding the amber up in front of his chest
  rubR: { e: [110, -296], w: [20, -340] },        // the fur rubbing it
  foldL: { e: [-122, -288], w: [-30, -326] }, foldR: { e: [122, -288], w: [30, -320] },
};
// A: {x, y, s, face, armL, armR, handL, handR, finger (0..1 the index finger out), frizz, lean, legs (a pose for the legs),
//     pal, headDX, headDY, headRot, post(lc, r, st)}
function dsHero(cam, t, A) {
  const st = { x: A.x === undefined ? DS.HX : A.x, y: A.y === undefined ? DS.FLOOR : A.y, s: A.s || DS.HS };
  let pose = Object.assign({}, A.legs || POSES.stand, { hipY: (A.legs || POSES.stand).hipY, lean: A.lean || 0, hand: 'open', handL: A.handL, handR: A.handR });
  pose = armAt(pose, 'L', (A.armL || DS_ARM.restL).e, (A.armL || DS_ARM.restL).w);
  pose = armAt(pose, 'R', (A.armR || DS_ARM.restR).e, (A.armR || DS_ARM.restR).w);
  Object.assign(st, { pose, face: A.face || FACES.calm, frizz: A.frizz || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0 });
  const pal = A.pal || DSPAL;
  const r = charLayer(cam, st, t, { pal, post: (lc, rr) => {
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    if ((A.finger || 0) > 0.01) {   // the index finger out of the right hand, toward where the forearm points
      const wr = rr.wrR, d = rr.armDirR, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14, L = 30 * A.finger;
      actor(() => { line(lc, hx, hy, hx + d[0] * (18 + L), hy + d[1] * (18 + L), 13, pal.skin); circle(lc, hx, hy, 21, pal.skin); });
    }
    if (A.post) A.post(lc, rr, st);
    lc.restore();
  } });
  const wp = (p) => toWorld(st, p);
  const d = r.armDirR, tipL = [r.wrR[0] + d[0] * (14 + 18 + 30 * (A.finger || 0)), r.wrR[1] + d[1] * (14 + 18 + 30 * (A.finger || 0))];
  return { st, r, tip: wp(tipL), wrR: wp(r.wrR), wrL: wp(r.wrL), elR: wp(r.elR), shR: wp(r.shR), head: wp([r.head[0] + st.headDX, r.head[1] + st.headDY]), dirR: d };
}

// ---------------------------------------------------------------- the carpet up close (world: the camera frames it)
// a shag carpet whose fibres are tapered strands in rows. Rows behind the shoe (back) or in front of it (front).
function dsCarpet(t, part, push = 0) {
  const c = ctx, rows = part === 'back' ? [0, 1, 2, 3] : [4, 5];
  for (const rI of rows) {
    const y0 = 1230 + rI * 60, rng = mulberry32(31 + rI), col = ['#9E3B2E', '#A9452F', '#B34E33', '#BD5A39', '#C76840', '#D07448'][rI];
    for (let x = -200 + (rI % 2) * 18; x < 1300; x += 36) {
      const h = 120 + rng() * 60, lean = (rng() - 0.5) * 0.4 + push * Math.exp(-Math.pow((x - (o_push_x || 0)) / 140, 2)) * 0.9;
      c.fillStyle = col; c.beginPath();
      c.moveTo(x - 14, y0 + 40); c.quadraticCurveTo(x + lean * h * 0.4, y0 - h * 0.5, x + lean * h, y0 - h);
      c.quadraticCurveTo(x + lean * h * 0.4 + 6, y0 - h * 0.5, x + 14, y0 + 40); c.closePath(); c.fill();
    }
  }
}
let o_push_x = 0;
// his sneaker from the side, toe to the right; (x, y) = the middle of the sole's bottom; s = scale (1 = 400 long)
function dsSneaker(x, y, s, rot = 0) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  // the trouser leg and the sock above it
  c.fillStyle = '#2F3A78'; c.beginPath(); c.moveTo(-150, -150); c.lineTo(-10, -150); c.lineTo(0, -900); c.lineTo(-170, -900); c.closePath(); c.fill();
  c.fillStyle = '#E4E7F0'; c.fillRect(-140, -170, 120, 40);
  // the upper
  c.fillStyle = '#EF4638'; c.beginPath();
  c.moveTo(-190, -30); c.lineTo(-180, -150); c.quadraticCurveTo(-170, -178, -130, -176); c.lineTo(-20, -170);
  c.quadraticCurveTo(60, -140, 120, -110); c.quadraticCurveTo(200, -86, 210, -40); c.lineTo(205, -30); c.closePath(); c.fill();
  // the sole (rubber: white with a grey tread line)
  c.fillStyle = '#F4F0E6'; rrect(c, -200, -42, 420, 44, 20); c.fill();
  paint(() => {
    line(c, -186, -6, 206, -6, 6, '#B9B3A6');
    for (let i = 0; i < 4; i++) line(c, -60 + i * 40, -150 + i * 12, -10 + i * 40, -158 + i * 12, 9, '#FFFFFF');   // laces
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-120, -60); c.quadraticCurveTo(0, -120, 110, -70); c.quadraticCurveTo(0, -95, -120, -60); c.fill();   // the swoosh-free stripe
  });
  c.restore();
}

// ---------------------------------------------------------------- Greece, about 600 BC
const TOGAPAL = Object.assign({}, PAL, { coat: '#F1E7CF', coatSh: '#CDBF9C', coatHi: '#FFF8E6', coatDk: '#B4A47E', strap: '#B5452F', strapSh: '#8A3322',
  pants: '#F1E7CF', pantsSh: '#CDBF9C', shoe: '#8A5A34', shoeSh: '#6A4226', sole: '#5A3A22', pj: true });
let DS_GREECE = null;
function initGreece() {
  const cv = mkCanvas(W, H), x = cv.getContext('2d');
  let g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, '#3B3C7A'); g.addColorStop(0.5, '#D9787A'); g.addColorStop(0.8, '#FFC27A'); g.addColorStop(1, '#FFD9A0');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#FFE7B0'; x.beginPath(); x.arc(860, 1230, 120, 0, 7); x.fill();
  x.fillStyle = '#4C6A8A'; x.fillRect(0, 1300, W, 120);                                  // the sea
  x.fillStyle = '#B98E62'; x.beginPath(); x.moveTo(0, 1340); x.quadraticCurveTo(300, 1260, 640, 1330); x.lineTo(1080, 1310); x.lineTo(1080, H); x.lineTo(0, H); x.closePath(); x.fill();
  DS_GREECE = mkCanvas(W, H); const y = DS_GREECE.getContext('2d'); y.filter = 'blur(6px)'; y.drawImage(cv, 0, 0); y.filter = 'none';
}
function dsGreece(cam, t) {
  screenSpace(); ctx.drawImage(DS_GREECE, -(cam.x - 540) * 0.05, -(cam.y - 1000) * 0.03);
  applyCam(cam);
  const c = ctx;
  for (const cx of [90, 880]) {   // two columns and a lintel, drawn as shapes so they catch the light
    c.fillStyle = '#EDE3CC'; c.fillRect(cx - 54, 300, 108, 1200);
    c.fillStyle = '#E2D6BA'; c.fillRect(cx - 74, 270, 148, 40); c.fillRect(cx - 74, 1480, 148, 40);
    paint(() => { for (let i = -2; i <= 2; i++) line(c, cx + i * 20, 320, cx + i * 20, 1470, 4, '#CDBF9F'); });
  }
  c.fillStyle = '#E8DDC2'; c.fillRect(-100, 200, 1300, 80);
  c.fillStyle = '#C9A77A'; c.fillRect(-300, 1500, 1700, 600);
}
// a lump of amber (honey-gold, see-through looking, with a glint) and a scrap of fur
function dsAmber(x, y, s, glow = 0) {
  const c = ctx;
  c.fillStyle = '#E38A1E'; c.beginPath(); c.moveTo(x - 30 * s, y - 6 * s); c.quadraticCurveTo(x - 24 * s, y - 34 * s, x + 4 * s, y - 32 * s);
  c.quadraticCurveTo(x + 34 * s, y - 26 * s, x + 32 * s, y + 4 * s); c.quadraticCurveTo(x + 22 * s, y + 30 * s, x - 6 * s, y + 28 * s); c.quadraticCurveTo(x - 32 * s, y + 20 * s, x - 30 * s, y - 6 * s); c.fill();
  paint(() => { ellipse(ctx, x - 6 * s, y - 2 * s, 18 * s, 14 * s, 'rgba(255,200,90,0.55)'); ellipse(ctx, x - 12 * s, y - 16 * s, 7 * s, 4 * s, 'rgba(255,250,220,0.9)', -0.5); });
  if (glow > 0.01) softDot(gctx, x, y, 70 * s, '#FFB547', 0.6 * glow);
}
function dsFur(x, y, s, rot) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#7A5232'; c.beginPath();
  for (let i = 0; i <= 14; i++) { const a = (i / 14) * 6.283, rr = (i % 2 ? 26 : 34); c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr * 1.4, Math.sin(a) * rr * 0.8); }
  c.closePath(); c.fill();
  c.restore();
}
// a small feather (about 60 long), drawn at x, y with a turn
function dsFeather(x, y, s, rot) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#FBF7EE'; c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(16, -10, 6, 26); c.lineTo(-6, 26); c.quadraticCurveTo(-16, -10, 0, -32); c.fill();
  paint(() => line(c, 0, -28, 0, 34, 2.5, '#C9C0AE'));
  c.restore();
}
// a robe that falls to his ankles over the trousers (rig units, in the layer's post: under his arms, which hang above it)
function dsRobe(lc) {
  actor(() => {
    lc.fillStyle = '#F1E7CF'; lc.beginPath(); lc.moveTo(-86, -250); lc.lineTo(86, -250); lc.lineTo(118, -18); lc.quadraticCurveTo(0, 0, -118, -18); lc.closePath(); lc.fill();
  });
  paint(() => {
    for (const x of [-60, -22, 20, 58]) { lc.beginPath(); lc.moveTo(x * 0.8, -240); lc.quadraticCurveTo(x * 1.05, -130, x * 1.25, -14); lc.lineWidth = 4; lc.strokeStyle = '#D6C7A2'; lc.stroke(); }
    lc.beginPath(); lc.moveTo(-117, -26); lc.quadraticCurveTo(0, -8, 117, -26); lc.lineWidth = 12; lc.strokeStyle = '#B5452F'; lc.stroke();
  });
}
// a laurel wreath round his head (rig head units, drawn in the layer's post)
function dsWreath(lc, hx, hy) {
  for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + sd * (0.5 + i * 0.32), x = hx + Math.cos(a) * 70, y = hy - 10 + Math.sin(a) * 66;
    lc.fillStyle = i % 2 ? '#4E8A3A' : '#62A048';
    lc.beginPath(); lc.ellipse(x, y, 16, 8, a + sd * 0.9, 0, 7); lc.fill();
  }
}

// ---------------------------------------------------------------- the chalkboard today
function dsBoard(cam, t, k) {
  darkBg('#2B2F3C', '#0E1018');
  applyCam(cam);
  const c = ctx;
  c.fillStyle = '#6E4B2E'; c.fillRect(70, 470, 940, 620);
  c.fillStyle = '#21402F'; c.fillRect(96, 496, 888, 568);
  paint(() => {
    c.font = '700 44px "Comic Sans MS", Montserrat'; c.fillStyle = 'rgba(240,245,235,0.85)'; c.textAlign = 'left';
    const lines = [['ELECTRONS?', 130, 580], ['IONS??', 600, 590], ['BITS OF', 150, 720], ['MATERIAL?', 150, 772], ['STRAIN!', 620, 760]];
    lines.forEach(([s, x, y], i) => { if (k > i * 0.12) c.fillText(s, x, y); });
    if (k > 0.5) { line(c, 420, 570, 580, 580, 5, 'rgba(240,245,235,0.8)'); line(c, 560, 566, 580, 580, 5, 'rgba(240,245,235,0.8)'); }
    if (k > 0.65) { c.font = '900 150px Montserrat'; c.fillText('?', 820, 1010); c.fillText('?', 430, 1020); }
    if (k > 0.3) { c.beginPath(); c.ellipse(260, 900, 120, 60, -0.1, 0, 7); c.lineWidth = 5; c.strokeStyle = 'rgba(240,245,235,0.7)'; c.stroke(); line(c, 160, 840, 360, 960, 5, 'rgba(255,140,140,0.8)'); }
  });
  c.fillStyle = '#8A6A4A'; c.fillRect(80, 1078, 920, 22);
}
