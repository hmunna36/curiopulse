// snaphand.js — the finger snap on one-finger's 3D hand (fist3d.js) with bent-wrist-fist's forearm (bwhand.js). What it adds:
// - fingers posed by their three joint angles (`SN_POSE`: open / ready / fired / fizz, blended by `snPose`), and the thumb
//   by where its tip must be (`snGeo`: on the middle fingertip's pad, against the index finger after the snap, or out),
//   reached by a small two-bone solve, so the thumb follows the finger it holds;
// - the middle finger's one string (`snString`: slack, taut and humming, hot), from the puppeteer's bar to the fingertip;
// - the squish where the two pads meet (`snContact`), the snap's arc and streaks (`snStreak`), the shock rings (`snRings`);
// - the LOAD meter (`snMeter`), the fingertip macro (`snMacro`), the speed-up race (`snRace`), the steel glove (`snSteel`)
//   and the villain's cape (`snCape`).
'use strict';

// joint angles (rad) of each finger: knuckle, middle, end; + = toward the palm
const SN_POSE = {
  open: { I: [0.22, 0.28, 0.14], M: [0.26, 0.32, 0.15], R: [0.32, 0.38, 0.18], L: [0.38, 0.42, 0.2] },
  ready: { I: [0.62, 0.5, 0.2], M: [1.05, 0.95, 0.25], R: [1.42, 1.68, 1.0], L: [1.48, 1.72, 1.04] },
  fired: { I: [0.7, 0.62, 0.25], M: [1.52, 1.72, 0.95], R: [1.42, 1.68, 1.0], L: [1.48, 1.72, 1.04] },
  fizz: { I: [0.64, 0.54, 0.22], M: [1.3, 1.32, 0.5], R: [1.42, 1.68, 1.0], L: [1.48, 1.72, 1.04] },
};
const SN_TB = [2.85, 2.2, 0.7];             // the thumb's root (as fist3d's)
const SN_TL = [3.7, 3.0, 2.45];             // its three bones (longer than fist3d's: it has to reach the fingertip)
const SN_FAT = 1.16;                        // cartoon fingers: a little thicker than fist3d's
// blend poses: w = {open: a, ready: b, ...} (weights; normalised)
function snPose(w) {
  const out = {}, keys = Object.keys(w).filter((k) => w[k] > 1e-4), tot = keys.reduce((s, k) => s + w[k], 0) || 1;
  for (const f of FK_ORD) out[f] = [0, 0, 0].map((_, i) => keys.reduce((s, k) => s + SN_POSE[k][f][i] * w[k], 0) / tot);
  return out;
}
const snAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const snSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const snMul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const snDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const snNorm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// the geometry: S = {fing: {I, M, R, L: [b0, b1, b2]}, tw: {rest, pad, side} (where the thumb's tip goes, weights), press
// 0..1 (how hard the thumb pushes into the pad: it sinks in), trem 0..1, t}
function snGeo(S) {
  const G = { f: {} }, t = S.t || 0, tr = S.trem || 0;
  for (const k of FK_ORD) {
    const F = FK_F[k], b = S.fing[k];
    const shk = tr * (0.035 * vnoise(t * 31 + F.x * 3, 3) + 0.02 * vnoise(t * 57, 7));
    const lean = F.lean * 0.6, r = F.r * SN_FAT, rad = [r, r * 0.93, r * 0.85, r * 0.74];
    const pts = [[F.x, F.y, 0]], dirs = [];
    let th = 0, p = pts[0];
    for (let i = 0; i < 3; i++) {
      th += b[i] + shk * (i === 0 ? 1 : 0.5);
      const d = [-Math.sin(lean) * Math.cos(th), Math.cos(lean) * Math.cos(th), Math.sin(th)];
      dirs.push({ d, th });
      p = [p[0] + d[0] * F.len[i], p[1] + d[1] * F.len[i], p[2] + d[2] * F.len[i]];
      pts.push(p);
    }
    G.f[k] = { pts, rad, dirs, lift: 0.5 };
  }
  // where the thumb's tip goes
  const tw = S.tw || { rest: 1 }, press = clamp(S.press || 0);
  const pad = fkSegPt(G, 'M', 2, 0.66, 'front', 1.0), th2 = G.f.M.dirs[2].th, nP = [0, -Math.sin(th2), Math.cos(th2)];
  const padT = snAdd(pad, snMul(nP, 0.78 - 0.32 * press));
  const sideT = snAdd(fkSegPt(G, 'I', 0, 0.75, 'front', 1.0), [0.6, 0.2, 0.9]);
  const restT = [6.4, 8.2, 2.6];
  const T = [0, 0, 0];
  let tot = 0;
  for (const [key, P] of [['rest', restT], ['pad', padT], ['side', sideT]]) { const w = tw[key] || 0; tot += w; for (let i = 0; i < 3; i++) T[i] += P[i] * w; }
  for (let i = 0; i < 3; i++) T[i] /= tot || 1;
  G.thumb = { pts: snThumb(T), rad: [1.35, 1.18, 1.06, 0.9] };
  G.pad = pad; G.padN = nP; G.padT = padT;
  return G;
}
// the thumb as root -> first knuckle (its metacarpal, aimed between the target and out to the side) -> a two-bone reach
function snThumb(T) {
  const B = SN_TB, toT = snSub(T, B), dT = snNorm(toT);
  const u0 = snNorm(snAdd(snMul(dT, 1.0), [0.55, 0.05, -0.1]));
  const p1 = snAdd(B, snMul(u0, SN_TL[0]));
  let v = snSub(T, p1), d = Math.hypot(v[0], v[1], v[2]);
  const l1 = SN_TL[1], l2 = SN_TL[2];
  const dd = clamp(d, Math.abs(l1 - l2) + 0.05, l1 + l2 - 0.02);
  const dir = snNorm(v);
  const T2 = snAdd(p1, snMul(dir, dd));
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const bd = [0.75, 0.15, -0.65], bp = snNorm(snSub(bd, snMul(dir, snDot(bd, dir))));
  const p2 = snAdd(snAdd(p1, snMul(dir, a)), snMul(bp, h));
  return [B.slice(), p1, p2, T2];
}

// ---------------------------------------------------------------- the string (the middle finger's tendon)
// o: {k shown 0..1, slack 0..1 (it hangs in a loose wave), taut 0..1 (straight, hot, humming), barS, t}
function snStringPath(P2, G, barS) {
  const A = bwAxis(P2), b = bwBarPt(P2, barS);
  const F = FK_F.M;
  const armEnd = P2.pa([F.x * 0.22, -0.6, 0.95]);
  const hand = [[F.x * 0.25, 0.7, 0.98], [F.x * 0.5, 3.4, 0.98], [F.x * 0.82, 6.4, 0.9], [F.x, F.y - 0.25, 0.78]].map(P2.ph);
  for (const [i, u] of [[0, 0.15], [0, 0.6], [1, 0.12], [1, 0.62], [2, 0.2], [2, 0.82]]) hand.push(P2.ph(fkSegPt(G, 'M', i, u, 'front', 0.42)));
  return { arm: [[b[0], b[1]], [armEnd[0], armEnd[1]]], hand: hand.map((q) => [q[0], q[1]]), k: A.k };
}
function snString(c, g, P2, G, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const S = snStringPath(P2, G, o.barS === undefined ? BWK.barRest : o.barS), t = o.t || 0;
  const taut = clamp(o.taut || 0), slack = clamp(o.slack || 0);
  paint(() => {
    const a = S.arm[0], b = S.arm[1], n = 30, pts = [];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    for (let i = 0; i <= n; i++) {
      const v = i / n, env = Math.sin(Math.PI * v);
      const sag = slack * S.k * 2.2 * env * (0.75 + 0.25 * Math.sin(v * Math.PI * 3 + t * 2));
      const hum = taut * S.k * 0.22 * env * Math.sin(t * 95 + v * 9);
      pts.push([a[0] + dx * v + nx * (sag + hum), a[1] + dy * v + ny * (sag + hum)]);
    }
    const P = pts.concat(S.hand);
    const wpx = Math.max(5, S.k * 0.3) * (1 + 0.15 * taut);
    poly(c, P, wpx * 1.6, rgba(BWC.strDk, 0.65 * k));
    poly(c, P, wpx, rgba(mixH('#FFF1D9', '#FFB648', taut), k));
    if (taut > 0.01) {
      poly(g, P, wpx * 2.6, rgba('#FFC24A', 0.4 * taut * k));
      poly(c, P, wpx * 0.4, rgba('#FFFBEA', 0.9 * taut * k));
    }
  });
}

// ---------------------------------------------------------------- where the pads meet: a squish, sweat
function snContact(c, g, P2, G, k, o = {}) {
  if (k <= 0.01) return;
  const q = P2.ph(G.pad), q2 = P2.ph(snAdd(G.pad, G.padN));
  const an = Math.atan2(q2[1] - q[1], q2[0] - q[0]) + Math.PI / 2;
  paint(() => {
    ellipse(c, q[0], q[1], q[2] * (0.75 + 0.45 * k), q[2] * 0.18, rgba('#FFE3D2', 0.55 * k), an);
    if (o.glow) softDot(g, q[0], q[1], q[2] * 2.2, '#FFD27A', 0.5 * o.glow * k);
  });
}

// ---------------------------------------------------------------- the snap's arc, streaks, rings (screen space)
// arc: the fingertip's path from the thumb down into the palm (pts on screen), drawn with a fading tail
function snStreak(c, g, pts, k, col = '#FFFFFF') {
  if (k <= 0.01 || pts.length < 2) return;
  paint(() => {
    for (let i = 1; i < pts.length; i++) {
      const u = i / (pts.length - 1), a = pts[i - 1], b = pts[i];
      c.lineCap = 'round';
      c.strokeStyle = rgba(col, 0.85 * k * u); c.lineWidth = 6 + 22 * u;
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      g.strokeStyle = rgba('#FFE7A8', 0.35 * k * u); g.lineWidth = 30 + 40 * u; g.lineCap = 'round';
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
  });
}
// shock rings from a point: u = 0..1 since the hit
function snRings(c, g, x, y, u, s = 1, col = '#FFF6DC') {
  if (u <= 0 || u >= 1) return;
  paint(() => {
    for (let i = 0; i < 3; i++) {
      const v = clamp(u * 1.3 - i * 0.18);
      if (v <= 0 || v >= 1) continue;
      const r = (40 + 330 * E.outCubic(v)) * s, a = (1 - v) * 0.95;
      c.lineWidth = (16 - 4 * i) * (1 - v) + 2; c.strokeStyle = rgba(col, a);
      c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
      g.lineWidth = 30 * (1 - v); g.strokeStyle = rgba('#FFD98A', 0.4 * a);
      g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    }
    // spikes
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2 + 0.3, r0 = (60 + 150 * u) * s, r1 = r0 + (70 * (1 - u)) * s;
      c.strokeStyle = rgba(col, 0.9 * (1 - u)); c.lineWidth = 7 * (1 - u) + 1; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); c.stroke();
    }
  });
}
// a sad little puff (screen space): u = 0..1 since it started
function snPuff(c, x, y, u, s = 1) {
  if (u <= 0 || u >= 1) return;
  paint(() => {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.45, d = (16 + 90 * E.outCubic(u)) * s;
      const r = (26 + 30 * u) * s * (1 - 0.12 * Math.abs(i - 2));
      circle(c, x + Math.cos(a) * d * 0.8, y + Math.sin(a) * d - 25 * u * s, r, rgba('#C9C3D6', 0.7 * (1 - u)));
    }
  });
}

// ---------------------------------------------------------------- the LOAD meter (screen space), lying across the top
// x, y: its middle; w: its length; v 0..1 filled; k 0..1 shown; flash 0..1 (FULL)
function snMeter(x, y, w, v, k, flash = 0, t = 0) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2), h = 70;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2 - 8, -h / 2 - 8, w + 16, h + 16, (h + 16) / 2); ctx.fillStyle = '#141428'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#FFB648'; ctx.stroke();
  const fw = (w - 8) * clamp(v), col = mixH(mixH('#FFE066', '#FF9A2E', clamp(v * 1.4)), '#FF4D3D', clamp(v * 2 - 1));
  if (fw > 1) {
    ctx.save(); rrect(ctx, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8, (h - 8) / 2); ctx.clip();
    ctx.fillStyle = col; ctx.fillRect(-w / 2 + 4, -h / 2, fw, h);
    ctx.fillStyle = rgba('#FFFFFF', 0.32); ctx.fillRect(-w / 2 + 4, -h / 2 + 8, fw, 10);
    ctx.fillStyle = rgba('#FFFFFF', 0.8); ctx.fillRect(-w / 2 + 4 + fw - 6, -h / 2, 6 + 2 * Math.sin(t * 30), h);
    ctx.restore();
  }
  for (let i = 1; i < 5; i++) { const xx = -w / 2 + 4 + (w - 8) * i / 5; ctx.fillStyle = rgba('#FFFFFF', 0.35); ctx.fillRect(xx - 2, h / 2 - 22, 4, 14); }
  // the label on the left end, the number on the right
  ctx.font = '900 40px Montserrat'; ctx.textBaseline = 'middle'; ctx.lineWidth = 9; ctx.strokeStyle = '#141428';
  ctx.textAlign = 'left'; ctx.strokeText('LOAD', -w / 2 + 26, 2); ctx.fillStyle = v > 0.25 ? '#141428' : '#FFB648';
  if (v > 0.25) { ctx.fillText('LOAD', -w / 2 + 26, 2); } else { ctx.fillText('LOAD', -w / 2 + 26, 2); }
  const pct = Math.round(clamp(v) * 100) + '%';
  ctx.font = '400 54px Anton'; ctx.textAlign = 'right'; ctx.lineWidth = 10; ctx.strokeText(pct, w / 2 - 24, 4);
  ctx.fillStyle = v >= 0.995 ? '#FFFFFF' : '#FFFFFF'; ctx.fillText(pct, w / 2 - 24, 4);
  ctx.restore();
  if (flash > 0.01) softDot(gctx, x, y, w * 0.55, '#FFB648', 0.55 * flash);
}

// ---------------------------------------------------------------- the macro: two fingertips, pad to pad (screen space)
// The thumb comes up from the bottom left, the middle finger down from the top right; they meet at C. In each finger's own
// frame the pad's face is at y = 0 and the finger runs back along +y; x is across it (+x: the nail's side).
// o: {press 0..1 (how flat they squish), shear (px the finger has crept along the face), slip 0..1 (it shoots off), sweat
// 0..1, arrows 0..1 (the push), t}
const SN_MC = [540, 940], SN_MA = 0.62, SN_MR = 215;
function snTipPath(c, R, fl, bulge) {
  const Rb = R + bulge;
  c.beginPath();
  c.moveTo(-R, 2200); c.lineTo(-R, R * 1.25);
  c.bezierCurveTo(-Rb * 1.02, R * 0.55, -fl - R * 0.32, 0, -fl, 0);
  c.lineTo(fl, 0);
  c.bezierCurveTo(fl + R * 0.32, 0, Rb * 1.02, R * 0.55, R, R * 1.25);
  c.lineTo(R, 2200); c.closePath();
}
function snTip(x, y, rot, o) {
  const R = SN_MR, press = o.press, fl = 22 + 120 * press, bulge = 26 * press;
  // the finger
  actor(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const g = ctx.createLinearGradient(-R, 0, R, 0);
    g.addColorStop(0, o.light || '#F7C8A6'); g.addColorStop(0.55, o.mid || '#EFB38D'); g.addColorStop(1, o.dark || '#D9946E');
    snTipPath(ctx, R, fl, bulge); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  });
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    snTipPath(ctx, R, fl, bulge); ctx.save(); ctx.clip();
    // the fingerprint: loops round a point behind the pad, squashed flat near the face as it presses
    const cy = R * 0.95;
    for (let i = 0; i < 13; i++) {
      const rr = 30 + i * 21, sq = 1 - 0.28 * press * clamp(rr / 260);
      ctx.beginPath(); ctx.ellipse(o.whorl || 0, cy, rr * 1.12, rr * 0.92 * sq, 0, 0, Math.PI * 2);
      ctx.lineWidth = 6; ctx.strokeStyle = rgba('#B8704E', 0.34); ctx.stroke();
    }
    // the pad's light (a soft highlight near the face) and the crease of the last joint
    ellipse(ctx, -R * 0.35, R * 0.55, R * 0.32, R * 0.2, 'rgba(255,236,220,0.35)', 0.3);
    ctx.beginPath(); ctx.moveTo(-R, R * 2.65); ctx.quadraticCurveTo(0, R * 2.5, R, R * 2.65); ctx.lineWidth = 9; ctx.strokeStyle = rgba('#B8704E', 0.45); ctx.stroke();
    ctx.restore();
    // the nail along the back (+x side), seen edge-on
    ctx.beginPath(); ctx.moveTo(R - 6, R * 0.62); ctx.quadraticCurveTo(R + 26, R * 1.2, R + 18, R * 2.3); ctx.lineTo(R - 30, R * 2.3); ctx.quadraticCurveTo(R - 30, R * 1.3, R - 6, R * 0.62);
    ctx.fillStyle = '#FBE3D8'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#D9A090'; ctx.stroke();
    ctx.restore();
  });
}
function snMacro(o = {}) {
  const t = o.t || 0, press = clamp(o.press || 0), slip = clamp(o.slip || 0), shear = o.shear || 0;
  // a warm dark background: the campfire out of focus
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#160C22'); bg.addColorStop(0.55, '#341820'); bg.addColorStop(1, '#5A2A16');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(77);
  for (let i = 0; i < 26; i++) {
    const x = rng() * W, y = 300 + rng() * 1500, r = 30 + rng() * 90, col = rng() < 0.5 ? '#FF9A3C' : '#FFD27A';
    softDot(ctx, x + 14 * Math.sin(t * 0.7 + i), y, r, col, 0.10 + 0.08 * rng());
    softDot(gctx, x + 14 * Math.sin(t * 0.7 + i), y, r * 0.8, col, 0.10);
  }
  const [cx, cy] = SN_MC, a = SN_MA, gap = 4 * (1 - press);
  // the axis (from the contact toward the thumb's body) and across it
  const ax = [-Math.sin(a), Math.cos(a)], ac = [Math.cos(a), Math.sin(a)];
  // the thumb: its face at the contact, its body down-left
  snTip(cx + ax[0] * gap, cy + ax[1] * gap, a, { press, whorl: -20 });
  // the finger: creeps along the face (shear), then shoots off across it and away (the slip)
  const off = shear + slip * 1300, away = slip * 260;
  const fx = cx - ax[0] * (gap + away) + ac[0] * off, fy = cy - ax[1] * (gap + away) + ac[1] * off;
  if (slip < 0.999) snTip(fx, fy, a + Math.PI, { press: press * (1 - slip), whorl: 25, light: '#F9CDAA', mid: '#F1B790', dark: '#DB9872' });
  // the squish where they meet: a bright seam
  if (press > 0.02 && slip < 0.3) paint(() => {
    ctx.save(); ctx.translate(cx + ac[0] * shear * 0.5, cy + ac[1] * shear * 0.5); ctx.rotate(a);
    const fl = 22 + 120 * press;
    ctx.fillStyle = rgba('#FFF1E6', 0.75 * press * (1 - slip / 0.3)); rrect(ctx, -fl - 20, -6, (fl + 20) * 2, 12, 6); ctx.fill();
    ctx.restore();
    softDot(gctx, cx, cy, 140 + 60 * press, '#FFD9A0', 0.3 * press);
  });
  // the push: two arrows driving the tips together
  const ka = clamp(o.arrows || 0) * (1 - slip);
  if (ka > 0.01) paint(() => {
    for (const sgn of [1, -1]) {
      const d = 380 + 18 * Math.sin(t * 9), bx = cx + ax[0] * d * sgn + ac[0] * 230, by = cy + ax[1] * d * sgn + ac[1] * 230;
      const tx = bx - ax[0] * 150 * sgn, ty = by - ax[1] * 150 * sgn;
      ctx.strokeStyle = rgba('#FFFFFF', 0.9 * ka); ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
      const an = Math.atan2(ty - by, tx - bx);
      ctx.beginPath(); ctx.moveTo(tx + Math.cos(an) * 30, ty + Math.sin(an) * 30); ctx.lineTo(tx + Math.cos(an + 2.4) * 46, ty + Math.sin(an + 2.4) * 46); ctx.lineTo(tx + Math.cos(an - 2.4) * 46, ty + Math.sin(an - 2.4) * 46); ctx.closePath();
      ctx.fillStyle = rgba('#FFFFFF', 0.9 * ka); ctx.fill();
    }
  });
  // sweat at the seam
  if ((o.sweat || 0) > 0.01 && slip < 0.2) paint(() => {
    for (const [sx, ph] of [[-1, 0], [1, 0.55]]) {
      const u = ((t * 0.8 + ph) % 1), fl = 22 + 120 * press + 60;
      const px = cx + ac[0] * fl * sx + ax[0] * 20 + ac[0] * shear * 0.5, py = cy + ac[1] * fl * sx + 10 + u * 70;
      ctx.save(); ctx.translate(px, py); ctx.scale(1, 1.3);
      ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(17, 4, 0, 15); ctx.quadraticCurveTo(-17, 4, 0, -20); ctx.fillStyle = rgba('#BFE8FF', 0.9 * o.sweat * (1 - u * 0.5)); ctx.fill();
      ctx.restore();
    }
  });
  // the slip's streaks, trailing behind the finger
  if (slip > 0.01 && slip < 0.999) paint(() => {
    for (let i = 0; i < 8; i++) {
      const w = (i - 3.5) * 52, bx = fx - ax[0] * (120 + w * 0.2) + ax[0] * 0 + (-ac[0]) * 60, by = fy - ax[1] * 120 + (-ac[1]) * 60;
      const sx = bx + ax[0] * w * 2.2, sy = by + ax[1] * w * 2.2;
      ctx.strokeStyle = rgba('#FFFFFF', 0.75 * (1 - slip)); ctx.lineWidth = 11; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - ac[0] * 520 * (0.4 + slip), sy - ac[1] * 520 * (0.4 + slip)); ctx.stroke();
    }
  });
}

// ---------------------------------------------------------------- the race: SPEED-UP bars (screen space)
// o: {k shown, head 0..1, snap (its bar, 1 = the top), arm, x26 0..1, t}
function snRace(o = {}) {
  const base = 1262, top = 700, hmax = base - top, k = clamp(o.k || 0);
  screenSpace();
  const kh = clamp(o.head || 0);
  if (kh > 0.01) {
    ctx.save(); ctx.translate(540, 470); const s = E.outBack(kh, 2); ctx.scale(s, s);
    ctx.font = '400 96px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 14; ctx.strokeStyle = '#141428';
    ctx.strokeText('SPEED-UP', 0, 0); ctx.fillStyle = '#FFFFFF'; ctx.fillText('SPEED-UP', 0, 0);
    ctx.restore();
  }
  const bar = (x, v, col, l1, l2) => {
    if (k <= 0.01) return;
    const h = hmax * v, w = 200;
    ctx.save();
    rrect(ctx, x - w / 2 - 8, top - 8, w + 16, hmax + 16, 28); ctx.fillStyle = rgba('#141428', 0.8 * k); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = rgba(col, 0.6 * k); ctx.stroke();
    if (h > 1) {
      const hh = Math.min(h, hmax + 18);
      rrect(ctx, x - w / 2 + 6, base - hh, w - 12, hh - 6, 22); ctx.fillStyle = col; ctx.fill();
      ctx.fillStyle = rgba('#FFFFFF', 0.3); ctx.fillRect(x - w / 2 + 20, base - hh + 12, 22, Math.max(0, hh - 44));
      softDot(gctx, x, base - hh, 170, col, 0.35);
    }
    ctx.font = '900 40px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.strokeStyle = '#141428';
    ctx.globalAlpha = k;
    ctx.strokeText(l1, x, top - 116); ctx.fillStyle = col; ctx.fillText(l1, x, top - 116);
    ctx.strokeText(l2, x, top - 70); ctx.fillStyle = '#FFFFFF'; ctx.fillText(l2, x, top - 70);
    ctx.restore();
  };
  bar(320, o.arm || 0, '#5BC8FF', "PITCHER'S", 'ARM');
  bar(760, o.snap || 0, '#4DFFB4', 'YOUR', 'SNAP');
  if (k > 0.01) {
    // a baseball riding the pitcher's bar
    const ya = base - hmax * (o.arm || 0) - 52, x = 320, r = 40;
    circle(ctx, x, ya, r + 5, '#141428'); circle(ctx, x, ya, r, '#FFFDF5');
    paint(() => { ctx.strokeStyle = '#E2403A'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(x - r * 1.3, ya, r * 0.95, -0.72, 0.72); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + r * 1.3, ya, r * 0.95, Math.PI - 0.72, Math.PI + 0.72); ctx.stroke(); });
  }
  if ((o.x26 || 0) > 0.01) {
    const s = E.outBack(clamp(o.x26), 2.4), y = 980;
    ctx.save(); ctx.translate(540, y); ctx.rotate(-0.08); ctx.scale(s, s);
    rrect(ctx, -130, -62, 260, 124, 36); ctx.fillStyle = '#4DFFB4'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#141428'; ctx.stroke();
    ctx.font = '400 100px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#141428'; ctx.fillText('×2.6', 0, 6);
    ctx.restore();
    softDot(gctx, 540, y, 240, '#4DFFB4', 0.4 * clamp(o.x26));
  }
}

// ---------------------------------------------------------------- the steel glove and the cape
// recolour the hand as steel while fn draws it (fist3d's colours are module objects: swap and put back)
function snSteel(fn) {
  const keep = { F: FK_ORD.map((k) => FK_F[k].col), C: Object.assign({}, FKC) };
  const steel = ['#AEB6C4', '#A9B1BF', '#B3BBC9', '#A4ACBA'];
  FK_ORD.forEach((k, i) => { FK_F[k].col = steel[i]; });
  Object.assign(FKC, { palm: '#9AA2B1', thumb: '#A6AEBC', arm: '#8E96A6', nail: '#D8DEE8', nailEdge: '#6E7686', crease: 'rgba(40,46,60,0.8)' });
  try { fn(); } finally { FK_ORD.forEach((k, i) => { FK_F[k].col = keep.F[i]; }); Object.assign(FKC, keep.C); }
}
// rivets and a shine on each finger bone of the steel glove (paint)
function snRivets(c, g, pr, G, k = 1) {
  if (k <= 0.01) return;
  paint(() => {
    for (const kk of FK_ORD) {
      const F = G.f[kk];
      for (let i = 0; i < 3; i++) {
        const q = pr(fkSegPt(G, kk, i, 0.5, 'back', 0.85));
        if (q[3] > pr(fkLerp(F.pts[i], F.pts[i + 1], 0.5))[3]) continue;
        circle(c, q[0], q[1], Math.max(3, q[2] * 0.16), rgba('#565E6E', k));
        circle(c, q[0] - q[2] * 0.05, q[1] - q[2] * 0.05, Math.max(1.5, q[2] * 0.07), rgba('#F2F6FF', k));
      }
    }
  });
}
// a villain's cape behind him (world space, his rig's units): shoulders at (st.x +- 70 s, st.y - 330 s)
function snCape(c, st, k, t) {
  if (k <= 0.01) return;
  const s = st.s, x = st.x, y = st.y, sh = y - 352 * s, sw = 78 * s, flap = 18 * s * Math.sin(t * 3.1);
  const drop = E.outBack(clamp(k), 1.6);
  actor(() => {
    c.save(); c.translate(x, sh); c.scale(1, drop); c.translate(-x, -sh);
    c.beginPath();
    c.moveTo(x - sw, sh);
    c.quadraticCurveTo(x - sw * 2.4, sh + 220 * s, x - sw * 2.1 + flap, sh + 330 * s);
    c.lineTo(x + sw * 2.0 + flap, sh + 330 * s);
    c.quadraticCurveTo(x + sw * 2.3, sh + 220 * s, x + sw, sh);
    c.closePath(); c.fillStyle = '#3A1450'; c.fill();
    c.restore();
  });
}
// the cape's high collar, in front of his neck (world space)
function snCollar(c, st, k) {
  if (k <= 0.01) return;
  const s = st.s, x = st.x, sh = st.y - 352 * s, sw = 70 * s, h = 70 * s * E.outBack(clamp(k), 2);
  actor(() => {
    for (const d of [-1, 1]) {
      c.beginPath(); c.moveTo(x + d * sw * 0.35, sh + 6 * s); c.lineTo(x + d * sw * 1.25, sh - h); c.lineTo(x + d * sw * 1.05, sh + 22 * s); c.closePath();
      c.fillStyle = '#C0263A'; c.fill();
    }
  });
}
