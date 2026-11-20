// wink-other-eye (20 Nov 2026): his face, able to wink and squint one eye at a time, with the puppet string on his eyelids
// and a fingertip that holds one lid up. drawFace below REPLACES the rig's (character.js; a function declaration loaded
// later wins), so every shot's face gets it; the rig's own fields still work.
// New face fields (all optional, head units; s = -1 his right eye = screen-left, +1 his left eye = screen-right):
//   shutR / shutL 0..1  one eye shut on its own (the rig's own fields)
//   sqR / sqL 0..1      a squint: the upper lid comes down (to 0.5) and the lower lid comes up (to 0.32), creases at the
//                       outer corner, the cheek lifts
//   strain 0..1         effort: the brows knit a little, sweat beads at the temple, the mouth pulls to one side
//   holdBlink           the automatic blinks are ignored (a held wink must never blink the other eye shut)
//   str: {k, top: [x, y], slackL, slackR, col}   the string: two threads from the upper lids' edges to a knot, then one
//                       thread up to `top` (the puppet bar); k 0..1 drops it in from above; slack 0..1 makes a thread wavy
//   finger: {k, slip, press}   a fingertip pressing his LEFT upper lid (screen-right) up against the brow; k 0..1 brings it
//                       in from the right, slip 0..1 slides it up and away
'use strict';

const WO_LASH = '#4A2418', WO_LID = '#E39A75', WO_LIDLINE = '#6A3526', WO_STR = '#FFF2C8';

function woLidGeom(f, s) {
  const blBase = f.holdBlink ? (f.blinkSet || 0) : (f.blink || 0);
  const sq = clamp((s < 0 ? f.sqR : f.sqL) || 0), sh = clamp((s < 0 ? f.shutR : f.shutL) || 0);
  const up = Math.max(blBase, sh, 0.5 * sq), lo = 0.32 * sq * (1 - sh);
  return { up, lo, sq, sh };
}
// the upper lid's edge (head units) of eye s: where its thread is tied
function woLidEdge(f, s) {
  const g = woLidGeom(f, s), ry = 16 * (f.eyeOpen || 1);
  return [s * 24, -2 - ry + 2 * ry * Math.min(1, g.up)];
}

function drawFace(c, f, pal) {
  // cheeks (they lift with a squint)
  for (const s of [-1, 1]) { const g = woLidGeom(f, s); ellipse(c, s * 38, 24 - 6 * g.sq, 11 + 2 * g.sq, 7, `rgba(255,110,110,${0.28 + 0.12 * g.sq})`); }
  const lid = pal.skin[0] === '#' && pal.skinSh[0] === '#' ? mixHex(pal.skin, pal.skinSh, 0.3) : pal.skinSh;
  for (const s of [-1, 1]) {
    const g = woLidGeom(f, s), ex = s * 24, ey = -2, ry = 16 * (f.eyeOpen || 1), bl = g.up;
    if (bl >= 0.93) { // shut: a soft lash curve, pressed a little harder in a wink
      const pr = g.sh > 0.5 ? 3 : 0;
      c.beginPath(); c.moveTo(ex - 14, ey - 1 + pr * 0.3); c.quadraticCurveTo(ex, ey + 10 - pr, ex + 14, ey - 1 + pr * 0.3);
      c.lineWidth = 4.5; c.strokeStyle = '#5A2E22'; c.lineCap = 'round'; c.stroke();
      line(c, ex + s * 13, ey - 1, ex + s * 18, ey - 5, 3, '#5A2E22');
      if (g.sh > 0.5) for (let i = -1; i <= 1; i++) line(c, ex + s * 17, ey + i * 6, ex + s * (24 + 2 * Math.abs(i)), ey - 2 + i * 9, 2.4, 'rgba(120,60,40,0.55)');
    } else {
      ellipse(c, ex, ey, 14 * Math.min(1.15, 0.9 + (f.eyeOpen || 1) * 0.1), ry, '#FFFFFF');
      const lx = (f.cross || 0) > 0.5 ? -s * 5 : (f.lookX || 0) * 5, ly = (f.lookY || 0) * Math.min(7, ry * 0.45);
      circle(c, ex + lx, ey + ly, 7.5 * (f.pupil || 1), pal.pupil);
      circle(c, ex + lx - 2.2, ey + ly - 2.8, 2.6, '#FFFFFF');
      if (bl > 0.01 || g.lo > 0.01) {
        c.save(); c.beginPath(); c.ellipse(ex, ey, 15, ry + 1, 0, 0, Math.PI * 2); c.clip();
        if (bl > 0.01) {
          c.fillStyle = lid; c.fillRect(ex - 16, ey - ry - 2, 32, (2 * ry + 2) * bl + 1);
          line(c, ex - 15, ey - ry + (2 * ry) * bl, ex + 15, ey - ry + (2 * ry) * bl, 3.5, WO_LIDLINE);
        }
        if (g.lo > 0.01) {   // the lower lid pushed up by the cheek
          const yl = ey + ry - (2 * ry) * g.lo;
          c.fillStyle = lid; c.beginPath(); c.moveTo(ex - 16, ey + ry + 2); c.lineTo(ex - 16, yl + 3); c.quadraticCurveTo(ex, yl - 3, ex + 16, yl + 3); c.lineTo(ex + 16, ey + ry + 2); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(ex - 15, yl + 3); c.quadraticCurveTo(ex, yl - 3, ex + 15, yl + 3); c.lineWidth = 2.6; c.strokeStyle = 'rgba(150,70,50,0.7)'; c.stroke();
        }
        c.restore();
      }
      if (g.sq > 0.08) for (let i = -1; i <= 1; i++)   // crow's feet at the outer corner
        line(c, ex + s * 18, ey + i * 6, ex + s * (25 + 3 * Math.abs(i)), ey - 2 + i * 9, 2.3, `rgba(120,60,40,${0.6 * g.sq})`);
    }
    // the brow: a wink or a squint pulls that side's brow down; strain knits the inner end
    const st = f.strain || 0;
    const by = -30 - ((f.browY || 0) + ((s < 0 ? f.browR : f.browL) || 0)) * 8 + 7 * Math.max(g.sh - (f.holdBlink ? 0 : 0), 0) + 5 * g.sq;
    if (!f.noBrows) line(c, s * (11 - 2 * st), by - (f.browTilt || 0) * 7 + 4 * st, s * 37, by + (f.browTilt || 0) * 3, 7.5, pal.hair);
  }
  // effort: a bead of sweat at the temple (screen-right)
  const st = f.strain || 0;
  if (st > 0.3) {
    const k = clamp((st - 0.3) / 0.5);
    c.beginPath(); c.moveTo(52, -30); c.quadraticCurveTo(58, -18, 52, -14); c.quadraticCurveTo(46, -18, 52, -30);
    c.fillStyle = `rgba(170,225,255,${0.95 * k})`; c.fill(); circle(c, 50.5, -19, 1.6, `rgba(255,255,255,${k})`);
  }
  // nose
  ellipse(c, 0, 16, 8, 6, 'rgba(190,110,80,0.55)');
  ellipse(c, -2, 14, 3, 2, 'rgba(255,230,210,0.8)');
  // mouth (the rig's shapes, plus 'side': a mouth pulled up at the winking side with effort)
  woMouth(c, f, pal);
  if (f.str) woStrings(c, f);
  if (f.finger) woFinger(c, f, pal);
}

function woMouth(c, f, pal) {
  const mo = f.mouth === 'yawn' ? Math.max(0.06, f.mouthOpen) : (f.mouthOpen || 0);
  c.save(); c.translate(0, 40);
  if (f.mouth === 'side') {   // effort: one corner hauled up toward the winking eye (screen-left), the other down
    const k = f.side === undefined ? 1 : f.side;
    c.beginPath(); c.moveTo(-17, -5 * k); c.quadraticCurveTo(-2, 4 + 2 * k, 15, 3 * k);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else if (f.mouth === 'o') {
    ellipse(c, 0, 0, 7 + 5 * mo, 8 + 8 * mo, pal.mouth);
    ellipse(c, 0, 5 + 3 * mo, 5 + 3 * mo, 3 + 2 * mo, pal.tongue);
  } else if (f.mouth === 'scream') {
    const h = 14 + 22 * mo;
    rrect(c, -24, -8, 48, h, 16); c.fillStyle = pal.mouth; c.fill();
    c.save(); rrect(c, -24, -8, 48, h, 16); c.clip();
    c.fillStyle = pal.teeth; c.fillRect(-24, -8, 48, 8);
    ellipse(c, 0, h - 6, 15, 8, pal.tongue); c.restore();
  } else if (f.mouth === 'grin') {
    c.beginPath(); c.moveTo(-32, -8); c.quadraticCurveTo(0, 34 * mo + 4, 32, -8); c.closePath();
    c.fillStyle = pal.mouth; c.fill();
    c.save(); c.clip(); c.fillStyle = pal.teeth; c.fillRect(-32, -9, 64, 10);
    ellipse(c, 0, 18 * mo, 13, 7, pal.tongue); c.restore();
  } else if (f.mouth === 'smirk') {   // a cool half smile, the corner on screen-right up
    c.beginPath(); c.moveTo(-14, 1); c.quadraticCurveTo(2, 7, 17, -5);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else if (f.mouth === 'wavy') {
    c.beginPath(); c.moveTo(-18, 0);
    c.bezierCurveTo(-10, -8, -4, 8, 2, 0); c.bezierCurveTo(8, -8, 14, 8, 20, 0);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else if (f.mouth === 'flat') {
    c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, 4 + mo * 4, 14, 0);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else if (f.mouth === 'grimace') {
    rrect(c, -26, -9, 52, 20, 8); c.fillStyle = pal.teeth; c.fill();
    c.lineWidth = 3.5; c.strokeStyle = pal.mouth; c.stroke();
    line(c, -24, 1, 24, 1, 2.5, pal.mouth);
    for (const x of [-13, 0, 13]) line(c, x, -8, x, 10, 2, 'rgba(90,21,34,0.6)');
  }
  c.restore();
}

// the puppet string: a thread from each upper lid's edge to a knot above the nose, one thread from the knot up to `top`
function woStrings(c, f) {
  const S = f.str, k = clamp(S.k === undefined ? 1 : S.k);
  if (k <= 0.01) return;
  const top = S.top || [0, -900], knot = S.knot || [0, -72], col = S.col || WO_STR;
  const drop = (1 - E.outCubic(k)) * 260;   // it comes down from above
  c.save(); c.translate(0, -drop); c.lineCap = 'round';
  const thread = (a, b, slack, ph) => {
    c.beginPath(); c.moveTo(a[0], a[1]);
    const n = 14;
    for (let i = 1; i <= n; i++) {
      const u = i / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), w = slack * 7 * Math.sin(u * Math.PI * 3 + ph) * Math.sin(u * Math.PI);
      c.lineTo(x + w, y + slack * 9 * Math.sin(u * Math.PI));
    }
    c.lineWidth = 2.6; c.strokeStyle = 'rgba(60,30,20,0.55)'; c.stroke();
    c.lineWidth = 1.7; c.strokeStyle = col; c.stroke();
  };
  for (const s of [-1, 1]) {
    const e = woLidEdge(f, s), sl = (s < 0 ? S.slackR : S.slackL) || 0;
    thread([e[0], e[1] + drop], knot, sl, s * 2 + 1);
    circle(c, e[0], e[1] + drop, 2.6, col);   // the little loop on the lid
  }
  thread(knot, top, S.slackTop || 0, 0.5);
  circle(c, knot[0], knot[1], 3.2, col);
  c.restore();
}

// a fingertip from the right holding his left upper lid up against the brow; slip slides it up and off
function woFinger(c, f, pal) {
  const F = f.finger, k = clamp(F.k === undefined ? 1 : F.k), sl = clamp(F.slip || 0);
  if (k <= 0.01) return;
  const tx = 24 + 2 + 9 * sl, ty = -21 - 10 * E.inCubic(sl) - 3 * (F.press || 0);   // the tip, on the lid crease
  const ox = (1 - E.outCubic(k)) * 120 + 26 * sl;
  c.save(); c.translate(ox, 0); c.rotate(-0.38 - 0.22 * sl);
  // the finger: from off to the right, its pad on the lid
  const L = 64, Wd = 15;
  rrect(c, tx - 4, ty - Wd / 2, L, Wd, Wd / 2); c.fillStyle = pal.skin; c.fill();
  rrect(c, tx - 4, ty + 1, L, Wd / 2 - 1, 4); c.fillStyle = rgba(pal.skinSh, 0.45); c.fill();
  // the nail on top, near the tip
  rrect(c, tx + 2, ty - Wd / 2 + 1.5, 13, 7, 3.5); c.fillStyle = '#FBD9C6'; c.fill();
  c.beginPath(); c.moveTo(tx + 26, ty - 5); c.quadraticCurveTo(tx + 29, ty, tx + 26, ty + 5); c.lineWidth = 1.6; c.strokeStyle = rgba(pal.skinSh, 0.8); c.stroke();   // a knuckle crease
  c.restore();
}

// where a point of his head (head units) lands in world coordinates, for a hiker drawn with st
function woHeadPt(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  const hx = r.head[0] + (st.headDX || 0), hy = r.head[1] + (st.headDY || 0);
  return [st.x + st.s * (hx + lx * cs - ly * sn), st.y + st.s * (hy + lx * sn + ly * cs)];
}
// a head-units point -> head units from a world point (for a puppet bar held in his hand)
function woToHead(st, wx, wy) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  const hx = r.head[0] + (st.headDX || 0), hy = r.head[1] + (st.headDY || 0);
  const dx = (wx - st.x) / st.s - hx, dy = (wy - st.y) / st.s - hy;
  return [dx * cs + dy * sn, -dx * sn + dy * cs];
}

// the ring round the eye that must stay still (world coords, under the camera): cyan, or red when it moves (bad 0..1)
function woRing(x, y, r, k, t, bad = 0) {
  if (k <= 0.01) return;
  const col = mixH('#7FE9FF', '#FF5A6E', clamp(bad)), rr = r * (0.7 + 0.3 * E.outBack(clamp(k), 2)) * (1 + 0.04 * bad * Math.sin(t * 40));
  const draw = (c, lw, a) => { c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.lineWidth = lw; c.strokeStyle = rgba(col, a); c.stroke(); };
  paint(() => {
    draw(ctx, 22, 0.16 * k); draw(ctx, 9, 0.95 * k);
    // four ticks, like a target
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      line(ctx, x + Math.cos(a) * (rr + 6), y + Math.sin(a) * (rr + 6), x + Math.cos(a) * (rr + 30), y + Math.sin(a) * (rr + 30), 8, rgba(col, 0.95 * k));
    }
  });
  gctx.beginPath(); gctx.arc(x, y, rr, 0, Math.PI * 2); gctx.lineWidth = 7; gctx.strokeStyle = rgba(col, 0.22 * k); gctx.stroke();
}

// the dare card: big words, centred, with a dark outline (screen space)
function woDare(k, t, lines = ['KEEP THIS', 'EYE STILL'], y0 = 520) {
  if (k <= 0.01) return;
  screenSpace();
  const sizes = [118, 150];
  lines.forEach((tx, i) => {
    const kk = clamp(k * 1.6 - i * 0.35);
    if (kk <= 0) return;
    const col = i === 1 ? '#7FE9FF' : '#FFFFFF';
    bigWord(tx, 540, y0 + i * 150, sizes[i], col, E.outBack(kk, 2), i ? -0.03 : 0.02);
  });
}
