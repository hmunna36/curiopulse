// colour-word (5 Nov 2026): the STROOP TRAIL sign on sky-blue's summit trail (trail.js), the test on it, the hiker
// with a trekking pole, two kids, and the props of the gags. World = 1080x1920 at zoom 1 (trail.js: he stands at
// TR.hx, TR.hy). Prefix cw* everywhere (engine names are taken: LK, toScreen...).
//
// THE TEST IS DRAWN AFTER THE LIGHT AND THE LENS (post.overlay, cwTestOverlay), as green-dot did: the four inks are
// exact on every frame and the lens's grade never shifts them. The sign's wood and slate are drawn in the scene.
'use strict';

const CW = { bx: 470, x0: 326, x1: 614, head: [904, 927], slate: [933, 1105], posts: [338, 602], ground: TR.hy + 22 };
const CW_INK = { red: '#E8302E', blue: '#3A7BFF', green: '#2DBF4E', yellow: '#FFD21F' };
const CW_WORDS = [['BLUE', 'red'], ['YELLOW', 'green'], ['RED', 'blue'], ['GREEN', 'yellow']];   // every row incongruent
const CW_SQUIG = ['blue', 'red', 'yellow', 'green'];                                             // round 2: no words
const CW_TEXT = 36;                                                                                // world px (≈97 px at zoom 2.7)
let CW_LEFT = null;
function cwWordLeft(i) {                 // where row i's word starts (world x): the pole's tip sits just left of it
  if (!CW_LEFT) {
    const m = document.createElement('canvas').getContext('2d');
    m.font = `900 ${CW_TEXT}px Montserrat`;
    CW_LEFT = CW_WORDS.map(([w]) => CW.bx - m.measureText(w).width / 2);
  }
  return CW_LEFT[Math.max(0, Math.min(3, i))];
}
const cwRowY = (i) => CW.slate[0] + ((CW.slate[1] - CW.slate[0]) * (i + 0.5)) / 4;
const cwLerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const cwBump = (t, f, rate = 9) => (t >= f ? Math.exp(-(t - f) * rate) : 0);

// ---------------------------------------------------------------- the sign
// the two posts (set: drawn before him, so they stand behind him)
function cwPosts(c) {
  const wood = '#7B5537', woodDk = '#5A3B25';
  for (const x of CW.posts) {
    c.fillStyle = woodDk; c.fillRect(x - 9, CW.head[0] + 6, 18, CW.ground - CW.head[0]);
    c.fillStyle = wood; c.fillRect(x - 9, CW.head[0] + 6, 11, CW.ground - CW.head[0]);
  }
}
// the board (front: drawn after him; it sits above his head). flip 0 = the words side, 1 = the squiggles side; the
// board turns on its vertical axis (its width squashes through zero) so the swap reads as a sign spun round.
function cwBoardScale(flip) { return Math.max(0.025, Math.abs(Math.cos(Math.PI * clamp(flip)))); }
function cwBoard(c, flip, t) {
  const sx = cwBoardScale(flip), cx = CW.bx;
  c.save(); c.translate(cx, 0); c.scale(sx, 1); c.translate(-cx, 0);
  // the header plank: STROOP TRAIL · EST. 1935 (the effect's name lives on the sign, never in the narration)
  const hx0 = cx - 104, hx1 = cx + 104;
  rrect(c, hx0, CW.head[0], hx1 - hx0, CW.head[1] - CW.head[0], 4); c.fillStyle = '#A8784C'; c.fill();
  c.fillStyle = '#8A5E39'; c.fillRect(hx0 + 4, CW.head[1] - 5, hx1 - hx0 - 8, 3);
  paint(() => {
    c.font = '900 13px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3A2213';
    c.fillText('STROOP TRAIL · EST. 1935', cx, (CW.head[0] + CW.head[1]) / 2 + 1);
  });
  // the frame and the slate
  rrect(c, CW.x0 - 10, CW.slate[0] - 10, CW.x1 - CW.x0 + 20, CW.slate[1] - CW.slate[0] + 20, 8); c.fillStyle = '#8F633E'; c.fill();
  rrect(c, CW.x0 - 10, CW.slate[1] + 4, CW.x1 - CW.x0 + 20, 6, 3); c.fillStyle = '#6E4A2D'; c.fill();
  rrect(c, CW.x0, CW.slate[0], CW.x1 - CW.x0, CW.slate[1] - CW.slate[0], 4); c.fillStyle = '#20232B'; c.fill();
  paint(() => {                                                     // chalk dust and wood grain (paint: no edges of their own)
    for (let i = 0; i < 18; i++) {
      const x = CW.x0 + 12 + (CW.x1 - CW.x0 - 24) * hash(i * 3.7 + 1), y = CW.slate[0] + 8 + (CW.slate[1] - CW.slate[0] - 16) * hash(i * 1.9 + 4);
      ellipse(c, x, y, 10 + 18 * hash(i + 2), 2 + 2 * hash(i + 5), 'rgba(255,255,255,0.025)', 0.1 * (hash(i) - 0.5));
    }
    for (const y of [CW.slate[0] - 6, CW.slate[1] + 6]) line(c, CW.x0 - 4, y, CW.x1 + 4, y, 1.4, 'rgba(70,40,20,0.35)');
    for (const [x, y] of [[CW.x0 - 5, CW.slate[0] - 5], [CW.x1 + 5, CW.slate[0] - 5], [CW.x0 - 5, CW.slate[1] + 5], [CW.x1 + 5, CW.slate[1] + 5]]) circle(c, x, y, 2.6, '#C9CED8');
  });
  c.restore();
}

// the pole's upper part, in front of the board (the board is drawn after him: without this the pole vanished behind it)
function cwPoleFront(c, Hh) {
  if (!Hh || !Hh.pole) return;
  const [a, b] = Hh.pole;   // world points: where it comes out from under the slate, and the tip
  line(c, a[0], a[1], b[0], b[1], 9 * Hh.st.s, '#6C7686');
  line(c, a[0], a[1], b[0], b[1], 4.5 * Hh.st.s, '#A9B4C6');
  const d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]) || 1, u = [d[0] / L, d[1] / L];
  line(c, b[0] - u[0] * 13 * Hh.st.s, b[1] - u[1] * 13 * Hh.st.s, b[0], b[1], 6 * Hh.st.s, '#2A2F3A');
}

// ---------------------------------------------------------------- the test (overlay: screen space, after the lens)
// o: {cam, flip, rows: [0..1 alpha per row], fly: {k, from, to, ...} (the winged word), ticks: [0..1 per row], leave: row
// index whose word has left the board, inkDrop: {...}}
function cwWordSquash(cam, flip) {
  camTransform(ctx, cam, 1);
  const sx = cwBoardScale(flip);
  ctx.translate(CW.bx, 0); ctx.scale(sx, 1); ctx.translate(-CW.bx, 0);
  return sx;
}
function cwInkText(txt, x, y, col, size = CW_TEXT, a = 1) {
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillText(txt, x, y + size * 0.04); ctx.globalAlpha = 1;
}
function cwSquiggle(x, y, col, w, seed, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 9.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const u = i / n, px = x - w / 2 + w * u, py = y + 9 * Math.sin(u * Math.PI * 5 + seed) + 3 * Math.sin(u * 19 + seed * 2);
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}
function cwTestOverlay(o) {
  const flip = o.flip || 0, side = flip < 0.5 ? 'words' : 'squig';
  ctx.save();
  cwWordSquash(o.cam, flip);
  for (let i = 0; i < 4; i++) {
    const a = o.rows ? o.rows[i] : 1, y = cwRowY(i);
    if (a <= 0.01) continue;
    if (side === 'words') {
      const [w, ink] = CW_WORDS[i];
      cwInkText(w, CW.bx, y, CW_INK[ink], CW_TEXT, a);
    } else cwSquiggle(CW.bx, y, CW_INK[CW_SQUIG[i]], 150, i * 1.7 + 0.4, a);
  }
  ctx.restore();
  // ticks to the right of the rows (round 2, the kid): a green tick that pops
  if (o.ticks) {
    ctx.save(); camTransform(ctx, o.cam, 1);
    o.ticks.forEach((k, i) => {
      if (k <= 0.01) return;
      const s = E.outBack(clamp(k), 2.2), x = CW.x1 - 22, y = cwRowY(i);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, 8); ctx.lineTo(11, -9);
      ctx.lineWidth = 6.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = '#4DFF8A'; ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the word that flies (the autopilot gag), overlay
// The top word splits: its red ink drips out into a polite little drop (the colour), its letters go white, sprout
// wings and goggles, and barge into his mouth. k: 0 on the board .. 1 in his mouth; wing 0..1; path from -> to (world)
function cwFlyWord(cam, txt, p, rot, s, wing, t, inkA = 0, strokeA = 1) {
  if (s <= 0.01) return;
  ctx.save(); camTransform(ctx, cam, 1); ctx.translate(p[0], p[1]); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `900 ${CW_TEXT}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width;
  if (wing > 0.01) {                                                // two wings that flap, behind the letters
    const fl = Math.sin(t * 38) * 0.5 + 0.5;
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.translate(sd * (w * 0.32), -CW_TEXT * 0.18); ctx.scale(sd, 1); ctx.rotate(-0.5 - 0.6 * fl);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(24 * wing, -30 * wing, 52 * wing, -20 * wing); ctx.quadraticCurveTo(40 * wing, -6 * wing, 46 * wing, 4 * wing);
      ctx.quadraticCurveTo(26 * wing, 2 * wing, 0, 8); ctx.closePath();
      ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
      ctx.restore();
    }
  }
  if (strokeA > 0.01) { ctx.globalAlpha = strokeA; ctx.lineWidth = 7; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 2); ctx.globalAlpha = 1; }
  ctx.fillStyle = inkA > 0.01 ? mixH('#FFFFFF', CW_INK.red, inkA) : '#FFFFFF'; ctx.fillText(txt, 0, 2);
  if (wing > 0.01) {                                                // aviator goggles on the first letter
    const gx = -w / 2 + 12, gy = -CW_TEXT * 0.52;
    ctx.save(); ctx.translate(gx, gy); ctx.scale(wing, wing);
    line(ctx, -16, 0, 16, 0, 4, '#5A3B25');
    for (const sd of [-1, 1]) { circle(ctx, sd * 8, 0, 7.5, '#5A3B25'); circle(ctx, sd * 8, 0, 5.2, '#9FE3FF'); circle(ctx, sd * 8 - 1.5, -1.5, 1.6, '#FFFFFF'); }
    ctx.restore();
  }
  ctx.restore();
}
// the colour as a polite little red drop with a face (overlay; world point p under cam). mood: 'calm' | 'oof'
function cwInkDrop(cam, p, s, rot, mood, t, wave = 0) {
  if (s <= 0.01) return;
  s *= 1.55;
  ctx.save(); camTransform(ctx, cam, 1); ctx.translate(p[0], p[1]); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, -24); ctx.bezierCurveTo(10, -10, 17, 0, 17, 9); ctx.arc(0, 9, 17, 0, Math.PI); ctx.bezierCurveTo(-17, 0, -10, -10, 0, -24); ctx.closePath();
  ctx.fillStyle = CW_INK.red; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = '#5A0E0E'; ctx.stroke();
  ellipse(ctx, -6, 0, 3.5, 6, 'rgba(255,255,255,0.55)', 0.3);
  if (mood === 'oof') {
    for (const sd of [-1, 1]) { line(ctx, sd * 6 - 3, 5, sd * 6 + 3, 11, 2.2, '#1A0606'); line(ctx, sd * 6 + 3, 5, sd * 6 - 3, 11, 2.2, '#1A0606'); }
    ellipse(ctx, 0, 18, 4, 3, '#1A0606');
  } else {
    for (const sd of [-1, 1]) { ellipse(ctx, sd * 6, 7, 3, 3.6, '#FFFFFF'); circle(ctx, sd * 6 + 0.6, 8, 1.7, '#1A0606'); }
    ctx.beginPath(); ctx.arc(0, 14, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 1.8; ctx.strokeStyle = '#1A0606'; ctx.stroke();
    if (wave > 0.01) {                                              // a little raised hand: "excuse me..."
      const a = -0.6 - 0.35 * Math.sin(t * 14) * wave;
      ctx.save(); ctx.translate(15, 6); ctx.rotate(a); line(ctx, 0, 0, 13 * wave, -4 * wave, 4, CW_INK.red); circle(ctx, 14 * wave, -4 * wave, 3.6 * wave, CW_INK.red); ctx.restore();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- speech bubbles (screen space, overlay)
// a white bubble with black words in it (what someone blurts), tail toward (tx, ty)
function cwBubble(txt, x, y, k, tx, ty, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2), size = o.size || 70;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = Math.max(size * 1.4, ctx.measureText(txt).width + size * 0.8), h = size * 1.35;
  ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  const tdx = (tx - x) * 0.55, tdy = (ty - y) * 0.55;
  ctx.beginPath(); ctx.moveTo(-w * 0.12, h * 0.3); ctx.lineTo(tdx, tdy); ctx.lineTo(w * 0.1, h * 0.3); ctx.closePath();
  ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = o.col || '#0B0B1A'; ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
}
// a bubble with coloured dots in it (the kid naming the inks: colours, no words). n = how many dots so far (fractional)
function cwDotBubble(x, y, k, n, tx, ty, inks) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.0), w = 280, h = 96;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  const tdx = (tx - x) * 0.55, tdy = (ty - y) * 0.55;
  ctx.beginPath(); ctx.moveTo(-w * 0.1, h * 0.3); ctx.lineTo(tdx, tdy); ctx.lineTo(w * 0.08, h * 0.3); ctx.closePath();
  ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
  inks.forEach((ink, i) => {
    const kk = clamp(n - i);
    if (kk <= 0.01) return;
    const r = 24 * E.outBack(kk, 2.6), px = -w / 2 + 48 + i * 61;
    circle(ctx, px, 0, r + 3, '#0B0B1A'); circle(ctx, px, 0, r, CW_INK[ink]);
  });
  ctx.restore();
}
// a buzzer cross (screen space): wrong!
function cwBuzzX(x, y, k, s = 1) {
  if (k <= 0.01) return;
  const sc = lerp(1.8, 1, E.outCubic(clamp(k * 1.6))) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 3);
  for (const [w, col] of [[30, '#0B0B1A'], [20, '#FF3A4A']]) { line(ctx, -36, -36, 36, 36, w, col); line(ctx, 36, -36, -36, 36, w, col); }
  ctx.restore(); ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- him: the trail hero with a pole and two free arms
// A: {x, y, s, face, headDX, headDY, headRot, lean, bob, poleTip: [x, y] world | null, poleK (0..1: the pole up to the
// board), armR: {e, w} rig-local (null = hanging), handR, switchK (the READING switch on his temple: 0 hidden .. 1 out),
// switchOn (1 = ON, 0 = OFF), shades 0..1, pal}
const CW_POLE_GRIP = 74;   // rig units from the grip to the pole's bottom end
function cwHero(cam, t, A = {}) {
  const pal = A.pal || PAL;
  const st = { x: A.x === undefined ? TR.hx : A.x, y: A.y === undefined ? TR.hy : A.y, s: A.s === undefined ? TR.hs : A.s, face: A.face || FACES.calm,
    headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = A.lean || 0; pose.hipY += A.bob || 0;
  const loc = (p) => [(p[0] - st.x) / st.s, (p[1] - st.y) / st.s];
  // the left (screen-left) hand holds the pole; the grip slides with the row it points at
  let tipL = null, grip = null;
  if (A.poleTip) {
    tipL = loc(A.poleTip);
    const k = E.inOutCubic(clamp(A.poleK === undefined ? 1 : A.poleK));
    grip = cwLerp2([-128, -262], [-156 + (tipL[0] + 141) * 0.25, -350 + (tipL[1] + 747) * 0.22], k);
    pose = armAt(pose, 'L', [-118 + 8 * k, -290 + 6 * k], [grip[0] + 6, grip[1] + 14]);
    pose.handL = 'open';
  }
  if (A.armR) { pose = armAt(pose, 'R', A.armR.e, A.armR.w); pose.handR = A.handR || 'point'; }
  else pose.armR = { a: 0.2 + 0.05 * Math.sin(t * loopW(1.3)), b: 0.18 };
  const H = trHeadLocal(st, pose);
  const r = charLayer(cam, Object.assign({}, st, { pose }), t, { pal, ambient: A.ambient, post: (lc, rr) => {
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    if (tipL) {                                                     // the pole: a grey shaft, a cork grip, a basket
      const d = [tipL[0] - grip[0], tipL[1] - grip[1]], L = Math.hypot(d[0], d[1]) || 1, u = [d[0] / L, d[1] / L];
      const bot = [grip[0] - u[0] * CW_POLE_GRIP, grip[1] - u[1] * CW_POLE_GRIP];
      line(lc, bot[0], bot[1], tipL[0], tipL[1], 9, '#6C7686');
      line(lc, bot[0], bot[1], tipL[0], tipL[1], 4.5, '#A9B4C6');
      line(lc, grip[0] - u[0] * 30, grip[1] - u[1] * 30, grip[0] + u[0] * 30, grip[1] + u[1] * 30, 15, '#B98A55');
      line(lc, tipL[0] - u[0] * 14, tipL[1] - u[1] * 14, tipL[0], tipL[1], 6, '#2A2F3A');
      // his fist round the grip, on top of the pole
      circle(lc, grip[0], grip[1], 21, pal.skin);
      paint(() => { for (let i = -1; i <= 1; i++) line(lc, grip[0] - 15, grip[1] + i * 9, grip[0] + 13, grip[1] + i * 9 - 2, 2.4, rgba(pal.skinSh, 0.85)); });
    }
    trHeadSpace(lc, H, (c) => {
      if (A.switchK > 0.01) cwSwitch(c, A.switchK, A.switchOn === undefined ? 1 : A.switchOn);
      if (A.shades > 0.01) cwShades(c, A.shades);
      if (A.sweat > 0.01) paint(() => sweatDrop(c, -58, -40, 1.1, A.sweat));
    });
    if (A.armR && A.redrawArmR) {                                   // a hand at his head is drawn again over the head
      capsuleShaded(lc, rr.elR, rr.wrR, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
      drawHandAt(lc, rr, 'R', pose.handR, pal, t);
    }
    if (A.post) A.post(lc, { H, rr });
    lc.restore();
  } });
  const wp = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  let pole = null;
  if (tipL) {                                // the stretch of the pole above the slate's bottom edge, for cwPoleFront
    const tw = wp(tipL), gw = wp(grip), yb = CW.slate[1] + 12;
    if (gw[1] > yb && tw[1] < yb) { const u = (yb - gw[1]) / (tw[1] - gw[1]); pole = [[lerp(gw[0], tw[0], u), yb], tw]; }
  }
  return { st, r, pose, head: wp(H.hd), H, mouth: wp([H.hd[0] - 40 * Math.sin(H.hr), H.hd[1] + 40 * Math.cos(H.hr)]), tip: A.poleTip, pole };
}
function drawHandAt(c, rr, k, kind, pal, t) { drawHand(c, rr['wr' + k], rr['armDir' + k], kind, pal, k === 'L' ? -1 : 1, t); }
// the READING switch on his temple (head space): a little plate with a lever, ON up / OFF down
function cwSwitch(c, k, on) {
  const e = E.outBack(clamp(k), 2) * 1.45, x = 74, y = -22;
  c.save(); c.translate(x, y); c.scale(e, e); c.rotate(0.12);
  rrect(c, -15, -28, 30, 56, 7); c.fillStyle = '#E9ECF2'; c.fill();
  rrect(c, -15, -28, 30, 56, 7); c.lineWidth = 3; c.strokeStyle = '#596173'; c.stroke();
  rrect(c, -6, -16, 12, 32, 5); c.fillStyle = '#2A2F3A'; c.fill();
  const ly = lerp(9, -9, clamp(on));
  rrect(c, -9, ly - 9, 18, 18, 6); c.fillStyle = on > 0.5 ? '#4DFF8A' : '#FF5A6E'; c.fill();
  c.restore();
}
// the switch's ON / OFF word (screen space, overlay): beside it, on a dark pill so it reads over the sky
function cwSwitchWord(x, y, k, on) {
  if (k <= 0.01) return;
  const txt = on > 0.5 ? 'ON' : 'OFF', col = on > 0.5 ? '#4DFF8A' : '#FF5A6E';
  cwTag(txt, x, y, k, col, 40, 0.08);
}
// sunglasses (head space), slide down from his hair with k
function cwShades(c, k) {
  const y = lerp(-70, -2, E.outBounce ? E.outBounce(clamp(k)) : E.outCubic(clamp(k)));
  paint(() => {
    line(c, -58, y - 4, 58, y - 4, 5, '#111318');
    for (const sd of [-1, 1]) {
      rrect(c, sd * 26 - 22, y - 12, 44, 26, 9); c.fillStyle = '#111318'; c.fill();
      line(c, sd * 26 - 12, y - 5, sd * 26 - 2, y - 9, 3, 'rgba(255,255,255,0.55)');
    }
  });
}

// ---------------------------------------------------------------- the kids (the hero's rig, small, their own clothes)
const CW_TOT = Object.assign({}, PAL, { coat: '#FF7FB0', coatSh: '#D9578C', coatHi: '#FFB6D2', coatDk: '#B5426F', strap: '#7FE9FF', strapSh: '#3FB8D8',
  pants: '#4B4FD0', pantsSh: '#3438A0', shoe: '#FFD447', shoeSh: '#D0A020', hair: '#5A3218', hairHi: '#8A5530' });
const CW_KID = Object.assign({}, PAL, { coat: '#4DC2FF', coatSh: '#2A8FC8', coatHi: '#9FE0FF', coatDk: '#1F6E9E', strap: '#FF9A3C', strapSh: '#C8701C',
  pants: '#3A3F4E', pantsSh: '#262A36', shoe: '#FFFFFF', shoeSh: '#C8CCD8', hair: '#1A120C', hairHi: '#4A3626' });
// a propeller beanie (head space)
function cwBeanie(c, t, spin) {
  c.beginPath(); c.ellipse(0, -46, 66, 44, 0, Math.PI, 2 * Math.PI); c.closePath(); c.fillStyle = '#FFD447'; c.fill();
  c.fillStyle = '#FF5A6E'; c.beginPath(); c.moveTo(-64, -46); c.lineTo(64, -46); c.lineTo(58, -36); c.lineTo(-58, -36); c.closePath(); c.fill();
  line(c, 0, -90, 0, -104, 5, '#596173');
  paint(() => {
    const a = t * 30 * spin;
    for (const sd of [-1, 1]) ellipse(c, sd * 26 * Math.cos(a), -106, 26 * Math.abs(Math.cos(a)) + 3, 7, sd > 0 ? '#3A7BFF' : '#FF5A6E');
    circle(c, 0, -106, 5, '#2A2F3A');
  });
}
// a backpack behind the body (rig space, drawn BEFORE the rig) and a book in front
function cwBackpack(c) {
  rrect(c, -96, -370, 192, 190, 30); c.fillStyle = '#FF9A3C'; c.fill();
  rrect(c, -80, -250, 160, 60, 14); c.fillStyle = '#E07A22'; c.fill();
}
function cwBook(c, x, y, rot, open = 1) {
  c.save(); c.translate(x, y); c.rotate(rot);
  rrect(c, -62, -40, 124, 80, 6); c.fillStyle = '#C8102E'; c.fill();
  rrect(c, -56, -36, 112 * open, 72, 4); c.fillStyle = '#FFF6E0'; c.fill();
  paint(() => { for (let i = 0; i < 4; i++) { line(c, -46, -20 + i * 14, -8, -20 + i * 14, 4, 'rgba(40,40,60,0.55)'); line(c, 8, -20 + i * 14, 46, -20 + i * 14, 4, 'rgba(40,40,60,0.55)'); } line(c, 0, -36, 0, 36, 3, 'rgba(120,80,60,0.6)'); });
  c.restore();
}
// a kid scooter (world, under the camera), the deck at y, front wheel at x + 70*s
function cwScooter(c, x, y, s, t, spin) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -70, -18, 150, 16, 8); c.fillStyle = '#3A7BFF'; c.fill();
  line(c, 70, -10, 96, -200, 11, '#C9CED8');
  line(c, 74, -202, 120, -202, 12, '#2A2F3A'); line(c, 74, -202, 50, -202, 12, '#2A2F3A');
  for (const wx of [-56, 84]) {
    circle(c, wx, 4, 20, '#2A2F3A'); circle(c, wx, 4, 9, '#C9CED8');
    paint(() => { const a = spin; line(c, wx, 4, wx + 16 * Math.cos(a), 4 + 16 * Math.sin(a), 3, 'rgba(255,255,255,0.7)'); });
  }
  c.restore();
}
// wind lines (a breeze), world space
function cwBreeze(c, x, y, s, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    for (let i = 0; i < 4; i++) {
      const u = (t * 2.2 + i * 0.27) % 1, yy = y + (i - 1.5) * 34 * s, x0 = x + (60 + 260 * u) * s;
      ctx.save(); ctx.globalAlpha = clamp(k * (1 - u) * 1.4);
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + 50 * s, yy - 14 * s, x0 + 110 * s, yy); ctx.lineWidth = 5 * s; ctx.lineCap = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
      ctx.restore();
    }
  });
}
// dust puffs (world), from a time
function cwDust(c, x, y, s, t0, t) {
  const d = t - t0;
  if (d < 0 || d > 0.9) return;
  paint(() => {
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI, v = (60 + 90 * hash(i + 3)) * s, r = (8 + 11 * hash(i + 9)) * s * (0.6 + d);
      circle(c, x + Math.cos(a) * v * d * 2.2, y + Math.sin(a) * v * d * 0.5 - 4 * s, r, rgba('#D9C7A6', 0.8 * clamp(1 - d / 0.9)));
    }
  });
}
// a small tag on a pill (screen space): AGES 7–9
function cwTag(txt, x, y, k, col = '#FFD447', size = 46, rot = -0.06) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.55;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = '#0B0B1A'; ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
}
