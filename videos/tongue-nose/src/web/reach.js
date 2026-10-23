// Why Can't Your Tongue Touch Your NOSE? Short: the tongue reaching UP for the nose, seen from the front (the mirror).
// Head units of the mirror hero (mirror.js): the middle of his head is the origin, his nose tip's ball is centred at
// y 20 (its underside at y 33), his lips at y 44-46.
//   tnTongueUp(c, T, t)        his tongue out and curled up at his nose; we see its underside (two blue veins, the fold
//                              down the middle, the strap that ties it to the floor of the mouth). T:
//                              {reach 0..1 (1 = the tip touches the nose), point 0..1 (narrower and pointier), sway (head
//                              units sideways at the tip), quiver 0..1 (a strained tremble), strap 0..1 (the strap glows),
//                              taut 0..1 (the strap drawn tight), out 0..1 (0 = in, mouth shut)}. Returns named points.
//   tnLeash(c, P, t, o)        a red dog leash clipped under the tongue at P, running down out of the mouth: o {k, taut,
//                              yank}; it can fade into the real strap (o.k -> 0)
//   tnFlag(c, t, k)            a tiny summit flag planted on his nose tip
//   tnMini(c, x, y, s, t, o)   a little round face trying it (any units): o {reach, point, skin, hair, hairCol, bun,
//                              glasses, win 0..1 (made it: a grin of the eyes), pop, bendy 0..1 (a rubbery wobble)}
'use strict';

const TN = { col: '#EF6F7E', under: '#E86A80', dark: '#9C2C44', vein: '#7C7FD6', hi: '#FFC2CC', mouth: '#4A1020', floor: '#C8526A', lip: '#B9524C', strap: '#F49AAE' };
const TN_NOSE_Y = 33;        // the underside of his nose tip (head units): where the tongue has to get to
const TN_JAW = 0.45;         // how far the rig's jaw drops (face.jaw) with the mouth wide open
const tnLowLip = (m) => 47 + 27 * m;          // his lower lip's height (head units) with the mouth open m 0..1

function tnGeo(T) {
  const out = clamp(T.out === undefined ? 1 : T.out), m = clamp(T.m === undefined ? out : T.m), r = clamp(T.reach || 0, 0, 1.05), pt = clamp(T.point || 0);
  const q = (T.quiver || 0) * (0.6 * Math.sin((T.qt || 0) * 44) + 0.4 * Math.sin((T.qt || 0) * 71));
  const base = tnLowLip(m) - 5;
  const tipY = lerp(base - 4, lerp(base - 4, TN_NOSE_Y + 0.4, r), out) - 0.8 * q * out - 2.6 * pt;
  const len = base - tipY, sw = (T.sway || 0) + 0.5 * q;
  const hw = (u) => {   // half its width at fraction u of the way up (0 = the base, 1 = the tip)
    const body = 16 * (1 - 0.24 * u) * (1 - 0.36 * pt * Math.pow(u, 0.8));
    const end = u < 0.6 ? 1 : Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.6) / 0.4, 2 - 0.9 * pt)));
    return body * end;
  };
  const at = (u, s) => [s * hw(u) + sw * u * u, base - len * u];
  return { out, m, r, pt, len, base, tipY, sw, hw, at, tip: [sw, tipY] };
}
function tnPath(c, G) {
  const L = [], R = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16; L.push(G.at(u, -1)); R.push(G.at(u, 1)); }
  c.beginPath(); c.moveTo(L[0][0], L[0][1] + 5);
  L.forEach((p) => c.lineTo(p[0], p[1]));
  for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
  c.lineTo(R[0][0], R[0][1] + 5); c.closePath();
}

function tnTongueUp(c, T, t) {
  const G = tnGeo(Object.assign({ qt: t }, T));
  const m = G.m, ll = tnLowLip(m), mc = (44 + ll) / 2;
  // the open mouth behind it: dark inside, the floor of the mouth, the teeth
  paint(() => {
    ellipse(c, 0, mc, 15 * (0.6 + 0.4 * m), (ll - 43) / 2 + 0.6, TN.mouth);
    // the upper lip: the tongue comes out over it
    c.beginPath(); c.moveTo(-16.5, 45.5); c.quadraticCurveTo(-8, 39.5, 0, 41.5); c.quadraticCurveTo(8, 39.5, 16.5, 45.5); c.quadraticCurveTo(0, 48.5, -16.5, 45.5); c.closePath();
    c.fillStyle = '#C9605A'; c.fill();
    if (m > 0.05) {
      ellipse(c, 0, ll - 5.5, 12.5 * m, 4 * m, TN.floor);
      ellipse(c, 0, 45.6, 11.5 * m, 2.6 * m, '#FFFFFF');
    }
  });
  if (G.out > 0.02) {
    actor(() => { tnPath(c, G); c.fillStyle = TN.under; c.fill(); });
    paint(() => {
      c.save(); tnPath(c, G); c.clip();
      // the fold down the middle, two blue veins either side, a shine down one side
      const yA = G.base - 1, yB = G.base - G.len * 0.74;
      c.beginPath(); c.moveTo(0.2 * G.sw, yA); c.quadraticCurveTo(0.1 * G.sw, (yA + yB) / 2, 0.45 * G.sw, yB); c.lineWidth = 1.5; c.strokeStyle = rgba(TN.dark, 0.5); c.stroke();
      for (const s of [-1, 1]) {
        c.beginPath();
        for (let i = 0; i <= 12; i++) {
          const u = 0.03 + 0.66 * i / 12, x = s * (3.6 + 1.6 * Math.sin(u * 10 + s) + 1.8 * u) * (1 - 0.3 * G.pt) + G.sw * u * u, y = G.base - G.len * u;
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.lineWidth = 2.1; c.lineCap = 'round'; c.strokeStyle = rgba('#5F63C9', 0.75); c.stroke();
      }
      // it comes toward us out of the mouth: darker where it leaves the lips, lighter at the tip
      const gr = c.createLinearGradient(0, G.base + 4, 0, G.tipY);
      gr.addColorStop(0, rgba('#5A0F24', 0.5)); gr.addColorStop(0.35, rgba('#5A0F24', 0)); gr.addColorStop(0.8, rgba('#FFD0D8', 0)); gr.addColorStop(1, rgba('#FFD0D8', 0.35));
      c.fillStyle = gr; c.fillRect(-30, G.tipY - 2, 60, G.len + 10);
      const S = []; for (let i = 2; i <= 13; i++) { const p = G.at(i / 16, -1); S.push([p[0] + 3.2, p[1]]); }
      poly(c, S, 2.2, rgba('#FFFFFF', 0.3));
      ellipse(c, G.tip[0] - 2.5, G.tipY + 4, 3.4, 2, rgba('#FFFFFF', 0.4), -0.3);
      c.restore();
      tnPath(c, G); c.lineWidth = 1.3; c.strokeStyle = rgba('#7A1C34', 0.7); c.stroke();     // its edge
    });
  }
  // the strap: from the floor of the mouth up the middle of the underside (it glows, and pulls tight)
  const sk = clamp(T.strap || 0), tt = clamp(T.taut || 0);
  const sTop = [0.18 * G.sw, G.base - Math.max(4, G.len * 0.3)], sBot = [0, ll - 4];
  if (G.out > 0.05) {
    paint(() => {
      const w = lerp(2.8, 1.8, tt), bow = 1.4 * (1 - tt) * Math.sin(t * 3);
      c.beginPath(); c.moveTo(sBot[0], sBot[1]); c.quadraticCurveTo(bow, (sTop[1] + sBot[1]) / 2, sTop[0], sTop[1]);
      c.lineWidth = w + 1.6; c.lineCap = 'round'; c.strokeStyle = rgba(TN.dark, 0.45); c.stroke();
      c.lineWidth = w; c.strokeStyle = sk > 0.02 ? mixH(TN.strap, '#FFD447', sk) : TN.strap; c.stroke();
      if (tt > 0.05) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {   // tension marks beside it
        const y = lerp(sBot[1] - 1.5, sTop[1] + 2, (i + 0.5) / 3), x = s * (3.6 + 0.7 * Math.sin(t * 40 + i));
        line(c, x, y, x + s * 2.6, y - 1.2, 0.9, rgba('#FFFFFF', 0.85 * tt));
      }
    });
    if (sk > 0.02) softDotLocal(c, sTop[0], (sTop[1] + sBot[1]) / 2, 9, '#FFD447', 0.5 * sk);
  }
  // the lower teeth and lower lip in front of the floor of the mouth; the corners of the mouth
  paint(() => {
    if (m > 0.05) {
      c.save(); tnPath(c, G); c.rect(-40, 0, 80, 140); c.clip('evenodd');
      ellipse(c, 0, ll - 2.4, 10.5 * m, 2 * m, '#FFFFFF');
      c.restore();
    }
    c.beginPath(); c.moveTo(-17, ll - 1); c.quadraticCurveTo(0, ll + 6, 17, ll - 1); c.lineWidth = 3; c.lineCap = 'round'; c.strokeStyle = TN.lip; c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 16, 45.5); c.quadraticCurveTo(s * (16.5 + 1.5 * m), mc, s * 14, ll - 1); c.lineWidth = 2.4; c.strokeStyle = TN.lip; c.stroke(); }
  });
  return { G, tip: G.tip, strapTop: sTop, strapBot: sBot, gap: Math.max(0, G.tipY - TN_NOSE_Y) };
}
// a soft glow in the current transform of c (head units): mirrors softDot for a context that is not the screen
function softDotLocal(c, x, y, r, col, a) {
  const mm = c.getTransform(), X = mm.a * x + mm.c * y + mm.e, Y = mm.b * x + mm.d * y + mm.f, sc = Math.hypot(mm.a, mm.b);
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, X, Y, r * sc, col, a); gctx.restore();
}

// a red leash clipped on at P (head units), running down out of his mouth and over his chin
function tnLeash(c, P, t, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const taut = clamp(o.taut || 0), yank = o.yank || 0;
  const slack = (1 - taut) * (5 + 1.5 * Math.sin(t * 2.7));
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16, y = lerp(P[1] + 6, 190, u), x = P[0] * (1 - u) + 6 * u + slack * Math.sin(Math.PI * u) - 5 * yank * u;
    pts.push([x, y + 4 * yank * u]);
  }
  paint(() => {
    c.globalAlpha = k;
    poly(c, pts, 9.5, '#4A0C14'); poly(c, pts, 7, '#E3313F');
    c.setLineDash([2.2, 1.8]); poly(c, pts.map((p) => [p[0] - 2.2, p[1]]), 0.7, 'rgba(255,215,215,0.85)'); poly(c, pts.map((p) => [p[0] + 2.2, p[1]]), 0.7, 'rgba(255,215,215,0.85)'); c.setLineDash([]);
    // the snap hook: a grey hook with its spring gate, clipped to the strap
    c.save(); c.translate(P[0], P[1] + 1);
    rrect(c, -3.2, 2, 6.4, 7.5, 2.4); c.fillStyle = '#9AA6B6'; c.fill();
    c.beginPath(); c.arc(0, 0.2, 3.4, Math.PI * 0.05, Math.PI * 1.95); c.lineWidth = 1.8; c.strokeStyle = '#DDE4EE'; c.stroke();
    line(c, -1.4, 3.4, 1.4, 7.6, 0.9, 'rgba(40,46,60,0.7)');
    c.restore();
    c.globalAlpha = 1;
  });
}

// a tiny summit flag planted on his nose tip (head units)
function tnFlag(c, t, k = 1) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  c.save(); c.translate(1.5, 9); c.scale(s, s);
  paint(() => {
    line(c, 0, 0, 0, -25, 1.6, '#3A2A2A');
    const fl = (u) => 2.2 * Math.sin(t * 9 - u * 5) * u;
    c.beginPath(); c.moveTo(0, -25);
    for (let i = 0; i <= 8; i++) { const u = i / 8; c.lineTo(15 * u, -25 + 4.5 * u + fl(u)); }
    for (let i = 8; i >= 0; i--) { const u = i / 8; c.lineTo(15 * u, -16 - 4.5 * u + fl(u)); }
    c.closePath(); c.fillStyle = '#FF3B4E'; c.fill();
    circle(c, 0, -26, 1.4, '#FFD447');
  });
  c.restore();
}

// ---------------------------------------------------------------- a little face trying it (about 2s wide at size s)
function tnMini(c, x, y, s, t, o = {}) {
  const pop = E.outBack(clamp(o.pop === undefined ? 1 : o.pop), 1.8);
  if (pop <= 0.01) return;
  const bd = clamp(o.bendy || 0), wob = bd * Math.sin(t * 9 + (o.ph || 0));
  c.save(); c.translate(x, y); c.scale(s / 70 * pop * (1 - 0.06 * wob), s / 70 * pop * (1 + 0.08 * wob)); c.rotate(0.05 * wob);
  const skin = o.skin || '#F4C9A4', hair = o.hairCol || '#3A2418', win = clamp(o.win || 0);
  actor(() => {
    if (o.bun) circle(c, 0, -76, 26, hair);
    circle(c, 0, 0, 70, skin);
  });
  paint(() => {
    if (o.hair !== 'none') { c.beginPath(); c.moveTo(-66, -6); c.quadraticCurveTo(-70, -66, 0, -72); c.quadraticCurveTo(70, -66, 66, -6); c.quadraticCurveTo(40, -44, 0, -40); c.quadraticCurveTo(-40, -44, -66, -6); c.closePath(); c.fillStyle = hair; c.fill(); }
    ellipse(c, -40, 24, 11, 6, 'rgba(255,110,110,0.28)'); ellipse(c, 40, 24, 11, 6, 'rgba(255,110,110,0.28)');
    for (const sd of [-1, 1]) {
      if (win > 0.5) { c.beginPath(); c.moveTo(sd * 24 - 11, -2); c.quadraticCurveTo(sd * 24, -14, sd * 24 + 11, -2); c.lineWidth = 5; c.strokeStyle = '#3A2418'; c.lineCap = 'round'; c.stroke(); continue; }
      ellipse(c, sd * 24, -6, 11, 13, '#FFFFFF');
      circle(c, sd * 24 - sd * 4.5, -1.5, 6, '#15132A');              // crossed, down at the tongue
      circle(c, sd * 24 - sd * 4.5 - 2, -4.5, 2, '#FFFFFF');
      line(c, sd * 36, -24, sd * 12, -31, 4.5, '#3A2418');   // brows up in the middle: trying
    }
    if (o.glasses) { c.lineWidth = 4; c.strokeStyle = o.glasses; for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 24, -6, 18, 0, 7); c.stroke(); } line(c, -6, -8, 6, -8, 4, o.glasses); }
  });
  // the nose (the target), then the tongue going up at it
  actor(() => { ellipse(c, 0, 20, 13, 12, mixH(skin, '#E08A6A', 0.4)); });
  paint(() => { ellipse(c, -4, 15, 4, 2.6, 'rgba(255,246,236,0.7)'); for (const sd of [-1, 1]) ellipse(c, sd * 5.5, 28, 3.6, 2.4, '#5A2028'); });
  tnTongueUp(c, { reach: o.reach === undefined ? 0.8 : o.reach, point: o.point || 0.4, quiver: win > 0.5 ? 0 : 0.5, sway: o.sway || 0, m: 0.62 }, t + (o.ph || 0));
  c.restore();
}
