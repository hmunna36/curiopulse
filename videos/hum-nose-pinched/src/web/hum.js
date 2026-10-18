// Why Can't You HUM With Your Nose Pinched? Short: the hero at blocked-nostril's mirror, humming, and what a hum is inside.
// Head units throughout (the rig's head is an ellipse 64 x 70 round its middle; the nose tip at y 20, the nostrils at
// (+-8.5, 30), the mouth at y 40, the chin at 68, the shoulders at 100).
//   hmHero(cam, t, A)          him at the mirror from a description A (see there); returns world points of his face
//   hmNotes(t, P, side, o)     music notes puffing out of a nostril at world point P while he hums
//   hmGlass(c, t, G, gl)       his head and neck as glass (head units): the air's road from the voice box up the throat and
//                              out of the nose, the mouth shut, the hidden caves (sinuses), the dust bunny
//   hmLock, hmZip, hmCheeks, hmPinchNose, hmHand: the props of the test
'use strict';

const HM = {
  vbox: [0, 84],                       // the voice box (in his short cartoon neck)
  cav: [0, 15],                        // the space behind his nose where the throat turns forward
  nostL: [-8.5, 30], nostR: [8.5, 30],
  mouth: [0, 41],
  sinL: [-37, 25], sinR: [37, 25],     // the big caves in the cheekbones
  sinM: [0, -8],                       // a small one between the eyes
};
const HM_SKY = '#7FE9FF', HM_GOLD = '#FFD447', HM_PINK = '#FF86A6', HM_GLASS = '#0E1A3E';

// the air's road, as dense polylines (head units): up the windpipe, through the voice box, up the throat, then the fork
// into the two nose channels and out of each nostril
function hmRoad(side) {
  const P = vhDense([[0, 104], [0, 96], [0, HM.vbox[1]], [0, 64], [0, 42], [0, 18], [side * 4.5, 22], [side * 8.5, 30], [side * 10, 36]], 8);
  return { pts: P, acc: polyLen(P) };
}
const HM_ROAD = { L: hmRoad(-1), R: hmRoad(1) };
// a cave's doorway into the nose: from inside the cave to the space behind the nose
function hmDoor(side) {
  const P = vhDense([[side * 34, 22], [side * 24, 17], [side * 14, 14], [side * 5, 17], [side * 4.5, 22], [side * 8.5, 30], [side * 10, 36]], 8);
  return { pts: P, acc: polyLen(P) };
}
const HM_DOOR = { L: hmDoor(-1), R: hmDoor(1) };

function vhDense(P, n = 12) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}

// ---------------------------------------------------------------- a music note (any units; about 30 units tall at s = 1)
function hmNote(c, x, y, s, rot, col, dbl, edge = true) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const drawIt = (cc, w, colr) => {
    cc.fillStyle = colr; cc.strokeStyle = colr; cc.lineCap = 'round'; cc.lineJoin = 'round';
    cc.save(); cc.translate(0, 0); cc.rotate(-0.38); cc.beginPath(); cc.ellipse(0, 0, 7.4 + w, 5.4 + w, 0, 0, 7); cc.fill(); cc.restore();
    cc.lineWidth = 3 + 2 * w; cc.beginPath(); cc.moveTo(6.4, -1.5); cc.lineTo(6.4, -25); cc.stroke();
    if (dbl) {
      cc.save(); cc.translate(16, -4); cc.rotate(-0.38); cc.beginPath(); cc.ellipse(0, 0, 7.4 + w, 5.4 + w, 0, 0, 7); cc.fill(); cc.restore();
      cc.beginPath(); cc.moveTo(22.4, -5.5); cc.lineTo(22.4, -29); cc.stroke();
      cc.lineWidth = 6 + 2 * w; cc.beginPath(); cc.moveTo(6.4, -24); cc.lineTo(22.4, -28); cc.stroke();
    } else {
      cc.lineWidth = 3 + 2 * w; cc.beginPath(); cc.moveTo(6.4, -25); cc.quadraticCurveTo(15, -20, 14, -9); cc.stroke();
    }
  };
  if (edge) drawIt(c, 1.6, 'rgba(10,12,40,0.85)');
  drawIt(c, 0, col);
  c.restore();
}

// Notes puffing out of a nostril at world point P (camera applied), side -1 = the screen-left nostril. o: {on: [[t0, t1]...]
// spans in which he hums (notes are born every 0.21 s), D (the Short's length: spans near the end also show at the start,
// so the loop is one move), s (size), crush (0..1: they come out squashed), seed}
function hmNotes(t, P, side, o = {}) {
  const on = o.on || [], D = o.D || 0, every = 0.21, life = 1.5;
  const live = (ts) => on.some(([a, b]) => ts >= a && ts <= b) || (D > 0 && on.some(([a, b]) => ts + D >= a && ts + D <= b));
  const n0 = Math.floor((t - life) / every), n1 = Math.floor(t / every);
  for (let n = n1; n >= n0; n--) {
    const ts = n * every, a = t - ts;
    if (a < 0 || a > life || !live(ts)) continue;
    const h = hash(n * 3 + (side > 0 ? 11 : 0) + (o.seed || 0)), h2 = hash(n * 7 + 5 + (side > 0 ? 3 : 0));
    const u = a / life;
    // out and a little down, clear of his cheeks, then up and away at the sides of his face
    const x = P[0] + side * (4 + 108 * u + 6 * Math.sin(a * 5 + h * 6)) * (o.s || 1);
    const y = P[1] + (5 + 34 * u - 58 * u * u + 4 * Math.sin(a * 4 + h * 3)) * (o.s || 1);
    const k = clamp(a / 0.1) * clamp((life - a) / 0.35);
    const s = (0.2 + 0.32 * Math.sqrt(u)) * (o.s || 1) * k;
    const col = h2 < 0.5 ? HM_GOLD : '#FFF2A8';
    if (s < 0.02) continue;
    hmNote(ctx, x, y, s, side * (0.25 - 0.35 * u) + 0.3 * Math.sin(a * 4 + h * 9), col, h > 0.62);
    hmNote(gctx, x, y, s * 1.05, side * (0.25 - 0.35 * u), rgba(HM_GOLD, 0.32), h > 0.62, false);
  }
}

// ---------------------------------------------------------------- his nose, pinched (head units)
// N: {pinch 0..1 (both wings squeezed in), red}
function hmPinchNose(c, pal, N = {}) {
  const pk = clamp(N.pinch || 0);
  const tip = mixH(pal.skin, '#EE7E5E', 0.42), wing = mixH(pal.skin, '#DC6848', 0.52);
  paint(() => {
    ellipse(c, 0, NZ.nostY + 4.5, 19 - 4 * pk, 4.6, 'rgba(150,66,44,0.24)');
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -3); c.quadraticCurveTo(s * 8.5, 9, s * (14 - 2 * pk), 18); c.lineWidth = 2.8; c.lineCap = 'round'; c.strokeStyle = 'rgba(170,84,56,0.36)'; c.stroke(); }
  });
  const geo = {};
  for (const s of [-1, 1]) {
    const wx = s * (NZ.wing - 7 * pk), wy = NZ.wingY + 0.8 * pk, rx = 9 - 4 * pk, ry = 8.5 + 1.2 * pk;
    ellipse(c, wx, wy, rx, ry, wing);
    geo[s] = { wx, wy, rx, ry };
  }
  ellipse(c, 0, NZ.y + 0.8 * pk, 15 - 3.2 * pk, 13.2 + 2 * pk, tip);
  paint(() => {
    ellipse(c, -4.4, 13.5, 5, 3.2, 'rgba(255,246,236,0.8)');
    for (const s of [-1, 1]) {
      const G = geo[s];
      c.beginPath(); c.ellipse(G.wx, G.wy, G.rx, G.ry, 0, s > 0 ? -0.5 : Math.PI * 0.62, s > 0 ? Math.PI * 0.38 : Math.PI + 0.5); c.lineWidth = 1.9; c.lineCap = 'round'; c.strokeStyle = 'rgba(150,60,40,0.5)'; c.stroke();
      const nx = s * (NZ.nost - 4.2 * pk), ny = NZ.nostY;
      if (pk < 0.85) ellipse(c, nx, ny, 6.2 * (1 - 0.9 * pk), 4.3 * (1 - 0.5 * pk), '#451420', s * 0.24);
      else line(c, nx - 3, ny, nx + 3, ny + 0.6, 2.2, '#451420');   // squeezed shut: a slit
    }
  });
}

// puffed cheeks and a pressed-shut mouth (head units; sky-blue's hamster cheeks). k 0..1
function hmCheeks(c, k, pal, wob = 0) {
  if (k <= 0.02) return;
  paint(() => {
    for (const s of [-1, 1]) {
      const x = s * (41 + 13 * k), y = 39, rx = (15 + 14 * k) * (1 + 0.04 * wob), ry = (14 + 10 * k) * (1 - 0.03 * wob);
      const col = mixH(pal.skin, pal.skinSh, s < 0 ? 0.62 : 0.92);
      ellipse(c, x, y, rx, ry, col);
      ellipse(c, x + s * 2, y + 5, rx * 0.66, ry * 0.62, rgba('#FF6E5E', 0.3 * k));
      c.beginPath(); c.ellipse(x, y, rx, ry, 0, s > 0 ? -1.15 : Math.PI - 1.35, s > 0 ? 1.35 : Math.PI + 1.15); c.lineWidth = 3.4; c.lineCap = 'round'; c.strokeStyle = rgba('#A9603F', 0.8 * k); c.stroke();
      ellipse(c, x - 5, y - 8, rx * 0.26, ry * 0.18, rgba('#FFFFFF', 0.32 * k), -0.4);
    }
    if (k > 0.3) {
      ellipse(c, 0, 40, 17, 10, mixH(pal.skin, pal.skinSh, 0.6));
      c.beginPath(); c.moveTo(-10, 41); c.quadraticCurveTo(0, 36.5, 10, 41); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = pal.mouth; c.stroke();
    }
  });
}

// a padlock hanging from his pinched nose (head units). k 0..1 dropped in, shut 0..1 (the shackle clicks down),
// off 0..1 (it springs open and falls away)
function hmLock(c, k, shut, off = 0) {
  if (k <= 0.01 || off >= 1) return;
  const e = E.outBack(clamp(k), 1.8), fall = off * off;
  c.save(); c.translate(3 + 30 * off, 47 - 26 * (1 - e) + 160 * fall); c.rotate(0.08 + 1.6 * off); c.scale(1.3 * e, 1.3 * e);
  const lift = 5 * (1 - clamp(shut)) + 9 * clamp(off * 4);
  // the shackle, round the nose tip (behind the body)
  c.beginPath(); c.moveTo(-7, 0); c.lineTo(-7, -11 - lift); c.arc(0, -11 - lift, 7, Math.PI, 0); c.lineTo(7, -lift * 0.6); c.lineWidth = 3.6; c.lineCap = 'round'; c.strokeStyle = '#C9CEDC'; c.stroke();
  rrect(c, -11, -2, 22, 18, 4); c.fillStyle = '#E8B23A'; c.fill();
  paint(() => {
    rrect(c, -11, -2, 22, 4, 2); c.fillStyle = '#FFD86A'; c.fill();
    circle(c, 0, 6, 2.6, '#5A3A10'); line(c, 0, 7, 0, 11.5, 2.2, '#5A3A10');
    c.beginPath(); c.moveTo(-7, 0); c.lineTo(-7, -11 - lift); c.arc(0, -11 - lift, 7, Math.PI, 0); c.lineTo(7, -lift * 0.6); c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
  });
  c.restore();
}

// a zipper across his lips (head units, the lips at y 40). k 0..1: the pull runs from left to right, closing it
function hmZip(c, k, a = 1) {
  if (a <= 0.01) return;
  const x0 = -17, x1 = 17, xp = lerp(x0, x1, clamp(k));
  paint(() => {
    c.save(); c.globalAlpha *= a;
    line(c, x0, 40, x1, 40, 6.5, '#7A2E3A');
    for (let x = x0 + 1; x <= x1 - 1; x += 2.6) {
      const closed = x < xp;
      rrect(c, x - 0.9, closed ? 37.6 : 36.2, 1.8, 2.4, 0.5); c.fillStyle = '#E9ECF4'; c.fill();
      rrect(c, x + 0.4, closed ? 40 : 41.4, 1.8, 2.4, 0.5); c.fill();
    }
    // the pull
    rrect(c, xp - 3.4, 36.5, 6.8, 7, 2); c.fillStyle = '#C3C9DA'; c.fill();
    rrect(c, xp - 2.2, 42.5, 4.4, 9, 2); c.fillStyle = '#E9ECF4'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = '#5A6288'; c.stroke();
    c.restore();
  });
}

// ---------------------------------------------------------------- the pinching hand (rig-local, drawn in his layer's post)
// H: {on 0..1 (0 = low, below his chin, out of the way; 1 = at his nose), k 0..1 (thumb and finger open .. pinched),
//     drop 0..1 (it falls away, back down)}. st: his rig state; rr: the rig; pal
function hmHand(lc, st, rr, pal, H) {
  const on = clamp(H.on), k = clamp(H.k), drop = clamp(H.drop || 0);
  if (on <= 0.001 && drop >= 0.999) return;
  const P = (x, y) => mirHeadLocal(st, x, y);
  const low = 1 - on + drop;
  // the fist under his nose (head units), its thumb up the right side of the nose and the index finger up the left
  const L = 70 * low;
  const fist = P(27, 61 + L), open = 7 * (1 - k);
  const thumbTip = P(13.5 + open, 26 + L), idxTip = P(-13.5 - open, 28 + L);
  const thumbBase = P(34, 47 + L), idxBase = P(15, 51 + L), idxMid = P(-3, 45 + L);
  const el = rr.elR;
  // the forearm, from the elbow to the heel of the hand, down and away to the right
  const wr = P(44, 76 + L);
  capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
  line(lc, lerp(el[0], wr[0], 0.86), lerp(el[1], wr[1], 0.86), wr[0], wr[1], 42, pal.coatSh);
  // the fist, the thumb up the right side of the nose, the index finger hooked under it to the left side
  circle(lc, fist[0], fist[1], 18.5, pal.skin);
  lc.beginPath(); lc.moveTo(idxBase[0], idxBase[1]); lc.quadraticCurveTo(idxMid[0], idxMid[1] + 4, idxTip[0], idxTip[1]); lc.lineWidth = 12.4; lc.lineCap = 'round'; lc.strokeStyle = pal.skin; lc.stroke();
  line(lc, thumbBase[0], thumbBase[1], thumbTip[0], thumbTip[1], 13.4, pal.skin);
  paint(() => {
    // the curled fingers' creases, and the nails at the tips
    for (let i = 0; i < 3; i++) line(lc, fist[0] - 10 + i * 7, fist[1] + 3, fist[0] - 8 + i * 7, fist[1] + 13, 2.2, 'rgba(170,88,60,0.45)');
    const nail = (base, tip) => {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], Ln = Math.hypot(dx, dy) || 1;
      ellipse(lc, tip[0] - dx / Ln * 3, tip[1] - dy / Ln * 3, 3.6, 4.6, 'rgba(255,226,214,0.85)', Math.atan2(dy, dx) + Math.PI / 2);
    };
    nail(idxMid, idxTip); nail(thumbBase, thumbTip);
    // the squeeze: little marks either side of the nose when the pinch lands
    const sq = clamp(H.squeeze || 0);
    if (sq > 0.02) for (const [tip, sd] of [[idxTip, -1], [thumbTip, 1]]) for (let i = -1; i <= 1; i++) {
      const a = (sd < 0 ? Math.PI : 0) + i * 0.5, r0 = 7, r1 = 7 + 7 * sq;
      line(lc, tip[0] + Math.cos(a) * r0, tip[1] + Math.sin(a) * r0, tip[0] + Math.cos(a) * r1, tip[1] + Math.sin(a) * r1, 2.2, rgba('#FFFFFF', 0.9 * sq));
    }
    line(lc, idxBase[0] - 2, idxBase[1] - 3, idxBase[0] + 3, idxBase[1] - 8, 1.8, 'rgba(170,88,60,0.4)');
  });
  return { fist, thumbTip, idxTip };
}

// ---------------------------------------------------------------- him
// Draw him at the mirror from a description A:
//   face, headDX, headDY, headRot, lean, bob
//   armR {e, w}: where his right arm's elbow and wrist are (none = it hangs)
//   hand: the pinching hand's state (hmHand); nose {pinch}; cheeks 0..1, cheekWob
//   lock {k, shut, off}; zip {k, a}
//   glass: the glass head's state (hmGlass; G.k is how far it has spread, 0..1)
// Returns world points: {st, head, nose, nostL, nostR, mouth, vbox, sinL, sinR, at(lx, ly)}
function hmHero(cam, t, A = {}) {
  const pal = A.pal || MIRPAL, st = mirSt(A);
  const G = A.glass;
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.04 : A.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      mirInHead(lc, s2, (c) => {
        actor(() => hmPinchNose(c, pal, A.nose || {}));
        hmCheeks(c, A.cheeks || 0, pal, A.cheekWob || 0);
        if (G && G.k > 0.001) hmGlass(c, t, G, s2);
      });
      if (A.hand) hmHand(lc, s2, rr, pal, A.hand);
      mirInHead(lc, s2, (c) => {
        if (G && G.k > 0.001) hmGlassTop(c, t, G, s2);
        if (A.zip) { c.save(); c.translate(0, 40); c.scale(1.35, 1.35); c.translate(0, -40); hmZip(c, A.zip.k, A.zip.a); c.restore(); }
        if (A.lock) hmLock(c, A.lock.k, A.lock.shut, A.lock.off);
      });
      lc.restore();
    },
  });
  const P = (lx, ly) => mirHeadPt(st, lx, ly);
  return {
    st, r, head: P(0, 0), nose: P(0, 22), nostL: P(-NZ.nost, NZ.nostY + 1), nostR: P(NZ.nost, NZ.nostY + 1), mouth: P(0, 40),
    vbox: P(HM.vbox[0], HM.vbox[1]), sinL: P(HM.sinL[0], HM.sinL[1]), sinR: P(HM.sinR[0], HM.sinR[1]), at: P,
  };
}

// ---------------------------------------------------------------- the glass head (head units)
// The outline of his head and neck (with the cheeks when they puff), as one path
function hmGlassPath(c, puff) {
  c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2);
  c.moveTo(21, 56); c.lineTo(21, 96); c.quadraticCurveTo(21, 106, 0, 107); c.quadraticCurveTo(-21, 106, -21, 96); c.lineTo(-21, 56); c.lineTo(21, 56);
  if (puff > 0.02) for (const s of [-1, 1]) { const x = s * (41 + 13 * puff), rx = 15 + 14 * puff, ry = 14 + 10 * puff; c.moveTo(x + rx, 39); c.ellipse(x, 39, rx, ry, 0, 0, Math.PI * 2); }
}
// G: {k 0..1 (how far the glass has spread from his nose), look [x, y], blink, brow, puff (the cheeks),
//   flow (the air moves, 0..1), pile 0..1 (the air bunches up behind the pinch), out 0..1 (beads leave the nostrils),
//   buzz 0..1 (the voice box), rings 0..1, mouthFill 0..1, trapped 0..1 (notes bouncing about inside),
//   push {down, up, eq} (the arrows), caves 0..1 (the hidden caves shown), fog {L, R, M} 0..1, flush 0..1 (fog on its way
//   out), sparkle 0..1, bunny {k, out 0..1, zz}, breath 0..1 (air going past the caves' doorways), pinch 0..1}
function hmGlassClip(c, k) { if (k < 0.999) { c.beginPath(); c.arc(0, 24, 8 + 150 * E.inOutCubic(k), 0, Math.PI * 2); c.clip(); } }
function hmGlass(c, t, G, st) {
  const k = clamp(G.k);
  const puff = G.puff || 0;
  c.save();
  hmGlassClip(c, k);
  // the glass itself (opaque, so the light treats it as a thing); one outline for the whole silhouette
  paint(() => { hmGlassPath(c, puff); c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = rgba(HM_SKY, 0.95); c.stroke(); });
  hmGlassPath(c, puff); c.fillStyle = HM_GLASS; c.fill('nonzero');
  paint(() => {
    // a cool sheen in the glass
    const g = c.createRadialGradient(-24, -30, 6, 0, 10, 96);
    g.addColorStop(0, 'rgba(90,150,255,0.30)'); g.addColorStop(1, 'rgba(20,40,110,0.0)');
    hmGlassPath(c, puff); c.fillStyle = g; c.fill();
    // the ears, as glass
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 62, 3, 12, 17, 0, 0, Math.PI * 2); c.fillStyle = '#16265A'; c.fill(); c.lineWidth = 2; c.strokeStyle = rgba(HM_SKY, 0.6); c.stroke(); }
    // the hidden caves (under the hand, which never covers them)
    const cv = clamp(G.caves || 0);
    if (cv > 0.01) hmCaves(c, t, G, cv);
    // his face on the glass, so it is still him: eyes, brows; the hair on top
    hmGlassFace(c, G);
  });
  c.restore();
  // the clean caves glow
  const W2 = (lx, ly) => mirHeadPt(st, lx, ly);
  if ((G.sparkle || 0) > 0.02) for (const s of [-1, 1]) { const p = W2(s * 37, 25); softDot(gctx, p[0], p[1], 22, HM_SKY, 0.4 * G.sparkle * k); }
}
// the second pass, over his hand: the road the air takes, the voice box, the push, the trapped notes
function hmGlassTop(c, t, G, st) {
  const k = clamp(G.k);
  c.save();
  hmGlassClip(c, k);
  paint(() => {
    hmGlassInside(c, t, G);
    // his lips, shut, in front of it all (the mouth is behind them)
    if ((G.puff || 0) < 0.3) { c.beginPath(); c.moveTo(-15, 40); c.quadraticCurveTo(0, 45, 15, 40); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = '#E8907E'; c.stroke(); line(c, -13, 40.6, 13, 40.6, 1.6, 'rgba(90,21,34,0.8)'); }
  });
  c.restore();
  const W2 = (lx, ly) => mirHeadPt(st, lx, ly);
  if ((G.buzz || 0) > 0.02) { const p = W2(HM.vbox[0], HM.vbox[1]); softDot(gctx, p[0], p[1], 17, HM_GOLD, 0.28 * clamp(G.buzz) * k); }
  if ((G.trapped || 0) > 0.02) { const p = W2(0, 20); softDot(gctx, p[0], p[1], 50, HM_GOLD, 0.16 * G.trapped * k); }
}

function hmGlassFace(c, G) {
  const look = G.look || [0, 0], bl = G.blink || 0, br = G.brow || 0;
  for (const s of [-1, 1]) {
    const ex = s * 24, ey = -2;
    if (bl > 0.9) { c.beginPath(); c.moveTo(ex - 13, ey); c.quadraticCurveTo(ex, ey + 9, ex + 13, ey); c.lineWidth = 3.6; c.lineCap = 'round'; c.strokeStyle = 'rgba(230,240,255,0.92)'; c.stroke(); }
    else {
      ellipse(c, ex, ey, 13, 15 * (G.eyeOpen || 1), 'rgba(240,248,255,0.95)');
      circle(c, ex + look[0] * 5, ey + look[1] * 5, 6.4 * (G.pupil || 1), '#101433');
      circle(c, ex + look[0] * 5 - 2, ey + look[1] * 5 - 2.4, 2.1, '#FFFFFF');
    }
    line(c, s * 11, -31 - br * 7, s * 36, -28 - br * 5 + s * 0, 6.5, 'rgba(42,27,20,0.96)');
  }
  // the hair cap
  c.beginPath();
  c.moveTo(-66, 10); c.quadraticCurveTo(-74, -54, -30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(76, -44, 66, 10);
  c.quadraticCurveTo(60, -22, 32, -36); c.quadraticCurveTo(2, -26, -20, -42); c.quadraticCurveTo(-52, -30, -66, 10); c.closePath();
  c.fillStyle = '#2A1B14'; c.fill();
  line(c, -26, -58, 6, -68, 5, 'rgba(110,80,60,0.9)');
}

// the airway and the caves, inside the glass (head units, already under paint)
function hmGlassInside(c, t, G) {
  const pk = clamp(G.pinch || 0), puff = G.puff || 0;
  // the windpipe (it goes on down into his chest) and the throat up to the space behind the nose
  const tube = (P, w, col) => { c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke(); };
  tube([[0, 106], [0, 90]], 17, '#B8405E'); tube([[0, 106], [0, 90]], 12.5, '#F07892');
  for (let i = 0; i < 2; i++) line(c, -6, 96 + i * 6, 6, 96 + i * 6, 1.8, 'rgba(255,255,255,0.45)');
  tube([[0, 78], [0, 60], [0, 40], [0, 20]], 23, '#B8405E'); tube([[0, 78], [0, 60], [0, 40], [0, 20]], 18, '#F07892');
  // the space behind the nose, and the two channels down to the nostrils (squeezed shut by the pinch)
  ellipse(c, 0, 15, 16, 10, '#B8405E'); ellipse(c, 0, 15, 13, 7.8, '#F07892');
  for (const s of [-1, 1]) {
    const nx = s * (8.5 - 3 * pk);
    tube([[s * 3, 17], [s * 6, 23], [nx, 30]], 8.5 - 3.5 * pk, '#B8405E'); tube([[s * 3, 17], [s * 6, 23], [nx, 30]], 5.6 - 3.2 * pk, '#F07892');
    if (pk > 0.6) line(c, nx - 4, 29.6, nx + 4, 30.4, 2.4, rgba('#FF5A6E', pk));   // shut
  }
  // the mouth: a pocket in front of the throat, lips shut. It fills (and runs into the cheeks) when the air piles up
  const mf = clamp(G.mouthFill || 0);
  ellipse(c, 0, 41, 21 + 3 * mf, 8 + 3 * mf, '#7A2440');
  for (const s of [-1, 1]) if (puff > 0.02) ellipse(c, s * (28 + 14 * puff), 40, 8 + 13 * puff, 6 + 10 * puff, '#7A2440');
  ellipse(c, 0, 44, 15, 4.6, '#C4405A');                                                    // the tongue
  // the voice box
  hmVoiceBox(c, t, G);
  // the air
  hmBeads(c, t, G);
  // sound rings round the voice box
  const rg = clamp(G.rings || 0);
  if (rg > 0.01) for (let i = 0; i < 3; i++) {
    const p = ((t * 2.4 + i / 3) % 1); c.beginPath(); c.arc(HM.vbox[0], HM.vbox[1], 12 + 26 * p, -2.6, -0.54); c.lineWidth = 2; c.strokeStyle = rgba(HM_GOLD, 0.8 * rg * (1 - p)); c.stroke();
    c.beginPath(); c.arc(HM.vbox[0], HM.vbox[1], 12 + 26 * p, 0.54, 2.6); c.stroke();
  }
  // notes trapped inside, bouncing off the walls of the room with no door
  const tr = clamp(G.trapped || 0);
  if (tr > 0.01) hmTrapped(c, t, tr);
  // the arrows of the push
  if (G.push) hmPush(c, t, G.push);
}

function hmVoiceBox(c, t, G) {
  const [x, y] = HM.vbox, bz = clamp(G.buzz || 0), w = bz * (0.5 + 0.5 * Math.sin(t * 150));
  c.save(); c.translate(x, y); c.scale(1.25, 1.25); c.translate(-x, -y);
  c.beginPath(); c.moveTo(x - 15, y - 13); c.quadraticCurveTo(x, y - 20, x + 15, y - 13); c.quadraticCurveTo(x + 18, y + 6, x, y + 15); c.quadraticCurveTo(x - 18, y + 6, x - 15, y - 13); c.closePath();
  c.fillStyle = mixHex('#E2557A', '#FFB0C4', 0.4 * bz); c.fill(); c.lineWidth = 1.8; c.strokeStyle = '#8E2E48'; c.stroke();
  // the two folds: they shiver apart and together while the air goes through
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * (1.2 + 2.6 * w), y - 9); c.quadraticCurveTo(x + s * (5 + 3.4 * w), y, x + s * (1.2 + 2.6 * w), y + 8); c.lineWidth = 2.8; c.lineCap = 'round'; c.strokeStyle = bz > 0.05 ? '#FFF6C8' : '#F2D9C2'; c.stroke(); }
  c.restore();
}

// air as cyan beads along the road. flow: they move; pile: they bunch up toward the top (the pinch); out: they leave the
// nostrils; freeze: they stop where they are
function hmBeads(c, t, G) {
  const flow = G.flow === undefined ? 1 : G.flow, pile = clamp(G.pile || 0), out = clamp(G.out === undefined ? 1 : G.out);
  if ((G.air === undefined ? 1 : G.air) <= 0.01) return;
  const n = 26, tt = G.tAir === undefined ? t : G.tAir;
  for (const sd of ['L', 'R']) {
    const R = HM_ROAD[sd], L = R.acc[R.acc.length - 1], Lnose = L - 8;   // the last 8 units are outside the nostril
    for (let i = 0; i < n; i++) {
      const h = hash(i * 17 + (sd === 'L' ? 3 : 9));
      let u = ((tt * 0.55 * flow + i / n + 0.013 * h) % 1 + 1) % 1;        // 0 = down in the chest .. 1 = out of the nose
      // the pile: everything crowds into the top part of the road, densest at the shut nostril
      const up = 1 - Math.pow(1 - i / n, 1.7) * 0.62;
      u = lerp(u, Math.min(up, (Lnose - 4) / L), pile);
      if (out < 0.5 && u * L > Lnose && pile < 0.5) continue;                // nothing gets out
      const p = polyAt(R.pts, R.acc, u * L);
      const a = clamp(u * 8) * (u * L > Lnose ? out : 1) * (G.air === undefined ? 1 : G.air);
      circle(c, p[0] + (sd === 'L' ? -0.6 : 0.6) * pile * Math.sin(i * 2.1), p[1], 3.3, rgba('#0B2A5A', 0.7 * a));
      circle(c, p[0] + (sd === 'L' ? -0.6 : 0.6) * pile * Math.sin(i * 2.1), p[1], 2.5, rgba(HM_SKY, 0.98 * a));
    }
  }
  // the mouth and the cheeks fill with air too, when it piles up
  const mf = clamp(G.mouthFill || 0);
  if (mf > 0.02) {
    const m = Math.round(26 * mf), puff = G.puff || 0;
    for (let i = 0; i < m; i++) {
      const h1 = hash(i * 5 + 1), h2 = hash(i * 11 + 4), side = i % 3 === 0 ? 0 : (i % 3 === 1 ? -1 : 1);
      const cx = side * (28 + 14 * puff), rx = side ? 6 + 11 * puff : 17, ry = side ? 4.5 + 8 * puff : 6;
      const a = h1 * Math.PI * 2 + t * 0.6 * (G.flow || 0), r = Math.sqrt(h2);
      circle(c, cx + Math.cos(a) * rx * r, 41 + Math.sin(a) * ry * r, 2.5, rgba(HM_SKY, 0.95));
    }
  }
}

// the notes, trapped: three of them bouncing round inside his head, with a small burst where one hits the wall
function hmTrapped(c, t, k) {
  const tri = (x) => 2 * Math.abs(x - Math.floor(x + 0.5));    // 0..1..0
  for (let i = 0; i < 3; i++) {
    const fx = 0.9 + 0.37 * i, fy = 1.25 + 0.29 * i, px = tri(t * fx + i * 0.31), py = tri(t * fy + i * 0.53);
    const x = -38 + 72 * px, y = -30 + 84 * py;
    const s = 0.78 * E.outBack(clamp(k), 2);
    hmNote(c, x, y, s, 0.3 * Math.sin(t * 6 + i), i === 1 ? '#FFF2A8' : HM_GOLD, i === 2, true);
    // a hit: when it turns round at a wall
    const ex = Math.min(px, 1 - px), ey = Math.min(py, 1 - py);
    if (ex < 0.035 || ey < 0.035) { const hx = ex < 0.035 ? (px < 0.5 ? -46 : 46) : x, hy = ey < 0.035 ? (py < 0.5 ? -40 : 64) : y; for (let j = 0; j < 5; j++) { const a = j * 1.26; line(c, hx + Math.cos(a) * 4, hy + Math.sin(a) * 4, hx + Math.cos(a) * 9, hy + Math.sin(a) * 9, 1.6, rgba('#FFFFFF', 0.85 * k)); } }
  }
}

// the push: a down arrow (the trapped air pushing back) above the voice box, an up arrow (the lungs) below it.
// P: {down 0..1, up 0..1, eq 0..1 (they match: both lit), still 0..1}
function hmPush(c, t, P) {
  const [x, y] = HM.vbox;
  const arrow = (y0, y1, k, col) => {
    if (k <= 0.01) return;
    const e = E.outBack(clamp(k), 1.6), ya = lerp(y0, y1, 0.08), yb = lerp(y0, y1, e), dir = Math.sign(y1 - y0);
    for (const [w, cc] of [[17, 'rgba(10,12,40,0.9)'], [11.5, col]]) {
      const ax = x - 27;
      c.beginPath(); c.moveTo(ax, ya); c.lineTo(ax, yb - dir * 6); c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = cc; c.stroke();
      c.beginPath(); c.moveTo(ax, yb + dir * (w * 0.4)); c.lineTo(ax - (7 + w * 0.5), yb - dir * (9 + w * 0.3)); c.lineTo(ax + (7 + w * 0.5), yb - dir * (9 + w * 0.3)); c.closePath(); c.fillStyle = cc; c.fill();
    }
  };
  arrow(y - 44, y - 13, P.down, HM_SKY);
  arrow(y + 40, y + 13, P.up, '#FF9A3C');
}

// the hidden caves (sinuses): two big ones in the cheekbones and a small one between the eyes, each with a doorway into
// the space behind the nose. Fog fills them; a hum flushes it out of the doorway and the nose; a plain breath barely
// stirs it. The dust bunny sleeps in the left one.
function hmCaves(c, t, G, cv) {
  const e = E.outBack(cv, 1.4), fog = G.fog || {}, fl = clamp(G.flush || 0), br = clamp(G.breath || 0);
  const caves = [['L', HM.sinL, 15, 13], ['R', HM.sinR, 15, 13]];
  for (const [id, p, rx, ry] of caves) {
    // the doorway
    if (id !== 'M') { const s = id === 'L' ? -1 : 1; c.beginPath(); c.moveTo(p[0] - s * 8, p[1] - 4); c.quadraticCurveTo(s * 18, 12, s * 8, 14); c.lineWidth = 3.6 * e; c.lineCap = 'round'; c.strokeStyle = '#B8405E'; c.stroke(); }
    else { line(c, 0, -2, 0, 7, 3 * e, '#B8405E'); }
    c.save(); c.translate(p[0], p[1]); c.scale(e, e);
    c.beginPath(); c.ellipse(0, 0, rx + 1.6, ry + 1.6, 0, 0, 7); c.fillStyle = '#B8405E'; c.fill();
    const clean = 1 - clamp(fog[id] === undefined ? 1 : fog[id]);
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fillStyle = mixHex('#2E3A2A', '#1E5A9A', clean); c.fill();
    // the fog: lumpy grey-green clouds that wobble (more when a breath goes past, a lot when a hum shakes them)
    const fk = 1 - clean;
    if (fk > 0.02) {
      c.save(); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.clip();
      for (let i = 0; i < 10; i++) {
        const h = hash(i * 13 + id.charCodeAt(0)), wob = 0.6 + 2.2 * br + 3 * (G.hum || 0);
        const fx = (h - 0.5) * rx * 1.5 + Math.sin(t * 2.1 + i) * wob, fy = (hash(i * 7 + 2) - 0.5) * ry * 1.3 + Math.cos(t * 1.7 + i) * wob * 0.6;
        circle(c, fx, fy, (rx * 0.3 + 1.6 * h) * (0.4 + 0.6 * fk), rgba('#8E9C80', 0.9 * fk));
        circle(c, fx - 1, fy - 1.2, (rx * 0.16 + h) * (0.4 + 0.6 * fk), rgba('#C9D4B2', 0.75 * fk));
      }
      c.restore();
    }
    if (clean > 0.5 && (G.sparkle || 0) > 0.02) for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + t * 1.3, sx = Math.cos(a) * rx * 0.45, sy = Math.sin(a) * ry * 0.4, sk = (G.sparkle) * (0.6 + 0.4 * Math.sin(t * 9 + i * 2));
      for (let j = 0; j < 4; j++) line(c, sx, sy, sx + Math.cos(j * Math.PI / 2) * 4.2 * sk, sy + Math.sin(j * Math.PI / 2) * 4.2 * sk, 1.4, rgba('#FFFFFF', 0.95 * sk));
    }
    c.restore();
  }
  // the fog on its way out: puffs along each doorway, then down the nose channels and out
  if (fl > 0.01 && fl < 0.995) for (const sd of ['L', 'R']) {
    const R = HM_DOOR[sd], L = R.acc[R.acc.length - 1];
    for (let i = 0; i < 9; i++) {
      const u = clamp(fl * 1.6 - i * 0.07), a = Math.sin(Math.PI * u);
      if (a <= 0.02) continue;
      const p = polyAt(R.pts, R.acc, u * L);
      circle(c, p[0], p[1], 3 + 1.5 * hash(i * 3), rgba('#9AA88A', 0.85 * a));
    }
  }
  // a plain breath: beads that zip past the doorways and do not go in
  if (br > 0.01) for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
    const u = ((t * 1.6 + i / 6) % 1), y = lerp(30, 8, u), x = s * lerp(8, 3, u);
    circle(c, x, y, 1.8, rgba(HM_SKY, 0.9 * br * Math.sin(Math.PI * u)));
  }
  // the dust bunny
  if (G.bunny && G.bunny.k > 0.01) hmBunny(c, t, G.bunny);
}

// a dust bunny with a sleepy face. B: {k (in), out 0..1 (blown along the doorway and out of the left nostril), zz 0..1}
function hmBunny(c, t, B) {
  const R = HM_DOOR.L, L = R.acc[R.acc.length - 1];
  const o = clamp(B.out || 0);
  if (o >= 0.999) return;
  let p = [-39, 28], rot = 0;
  if (o > 0.001) { const q = polyAt(R.pts, R.acc, E.inCubic(o) * L); p = [q[0], q[1]]; rot = o * 6; }
  const s = 1.45 * E.outBack(clamp(B.k), 1.8) * (1 - 0.35 * o);
  c.save(); c.translate(p[0], p[1]); c.rotate(rot); c.scale(s, s);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 6.2 + 1.4 * hash(i * 5); line(c, Math.cos(a) * 3, Math.sin(a) * 3, Math.cos(a) * r, Math.sin(a) * r, 2.2, '#B9B4C8'); }
  circle(c, 0, 0, 5.4, '#CFCADC');
  if (o < 0.05) { for (const e of [-1, 1]) { c.beginPath(); c.arc(e * 2.2, -0.6, 1.3, 0.2, Math.PI - 0.2); c.lineWidth = 0.9; c.strokeStyle = '#3A3450'; c.stroke(); } ellipse(c, 0, 2.2, 1, 0.7, '#3A3450'); }
  else { for (const e of [-1, 1]) circle(c, e * 2.2, -0.6, 1.4, '#3A3450'); ellipse(c, 0, 2.4, 1.4, 1.6, '#3A3450'); }
  c.restore();
}
