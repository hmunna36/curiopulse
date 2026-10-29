// Why Do Wombats Poop CUBES? 🟫 — inside the gut: THE one picture of the Short.
// The wombat's gut cut across and seen end-on, the tunnel running away behind it: a ring of wall (a pink lining, a red
// muscle coat) with TWO STIFF STRIPES of thicker, darker muscle at the diagonals (Yang et al. 2021: two regions 180 degrees
// apart, about twice as thick and four times as stiff). On every squeeze the stiff stripes pull in first and hardest, the
// soft wall follows a beat later; the soft brown round in the middle takes the wall's shape and keeps a little more of it
// each time: four corners (at the stiff stripes and between them), a cube in section. Screen space; paint and props.
'use strict';

const WBG = { cx: 540, cy: 800, R: 380 };
// the stiff stripes sit at these angles (screen: y down), 180 degrees apart
const WBG_STIFF = [Math.PI * 0.25, Math.PI * 1.25];
function wbStiff(th) {
  let k = 0;
  for (const a of WBG_STIFF) { let d = Math.abs(((th - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI); k = Math.max(k, Math.exp(-((d / 0.36) ** 2))); }
  return k;
}
// one squeeze, 0..1: in fast, a short hold, out slower (seconds since it started)
function wbPulse(u) {
  if (u < 0) return 0;
  if (u < 0.2) return E.inOutSine(u / 0.2);
  if (u < 0.32) return 1;
  return Math.max(0, 1 - E.inOutSine((u - 0.32) / 0.5));
}
// the state of the gut at time t: per-angle squeeze 0..1 and how square the brown is (n of the superellipse)
function wbGutState(t, squeezes) {
  let count = 0;
  for (const s of squeezes) if (t > s + 0.12) count++;
  const sqAt = (th) => {
    const st = wbStiff(th), lag = 0.13 * (1 - st);
    let m = 0;
    for (const s of squeezes) m = Math.max(m, wbPulse(t - s - lag) * (0.55 + 0.45 * st));
    return m;
  };
  // squareness grows a step with each squeeze and a little during it (it keeps what it gets: the stuff is drying)
  let n = 2.0;
  squeezes.forEach((s, i) => { n += (0.9 + 0.5 * i) * smooth(inv(s + 0.05, s + 0.45, t)); });
  return { sqAt, n, count };
}
// radius of a superellipse of "radius" a and power n at angle th, with its corners on the diagonals (an upright square)
function wbSuper(a, n, th) {
  const c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th));
  return a / Math.pow(Math.pow(c, n) + Math.pow(s, n), 1 / n);
}

// the gut in section. o = {t, squeezes, k (0..1 appear), labels 0..1, arrows 0..1, corners 0..1 (sparkles), depth 0..1}
function wbGutSection(o) {
  const t = o.t, S = wbGutState(t, o.squeezes || []);
  const cx = WBG.cx, cy = WBG.cy, R = WBG.R;
  screenSpace();
  // the dark warm inside of the body, with soft blurred tissue around
  const bg = ctx.createRadialGradient(cx, cy, 100, cx, cy, 1300);
  bg.addColorStop(0, '#4A1622'); bg.addColorStop(0.5, '#2A0B14'); bg.addColorStop(1, '#12040A');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(9);
  for (let i = 0; i < 14; i++) softDot(ctx, rng() * W, rng() * H, 120 + rng() * 200, i % 2 ? '#7A2A3A' : '#5A1A2A', 0.35);
  // the tunnel behind: the same ring, smaller and dimmer as it goes away, the squeeze reaching each ring a little earlier
  const depth = o.depth == null ? 1 : o.depth;
  for (let k = 6; k >= 1; k--) {
    const f = 1 - k * 0.075, ox = cx + k * 4, oy = cy - k * 62, tk = t + k * 0.09;
    const S2 = wbGutState(tk, o.squeezes || []);
    ctx.save(); ctx.translate(ox, oy); ctx.scale(f, f * 0.94);
    wbRing(S2, R, tk, 0.35 + 0.6 * (1 - k / 7), depth, true);
    ctx.restore();
  }
  ctx.save(); ctx.translate(cx, cy);
  const ring = wbRing(S, R, t, 1, 1, false);
  // the brown round in the middle: it fills the lumen, squared by S.n, darker as it dries
  const dry = clamp((S.n - 2) / 3.4);
  const brown = (th) => ring.inner(th) - 12;
  ctx.beginPath();
  for (let a = 0; a <= 120; a++) { const th = a / 120 * Math.PI * 2, r = brown(th); ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
  ctx.closePath();
  const bgr = ctx.createRadialGradient(-60, -70, 20, 0, 0, R * 0.7);
  bgr.addColorStop(0, mixH('#9C7A44', '#7A5634', dry)); bgr.addColorStop(0.7, mixH('#7A5A30', '#5C3E25', dry)); bgr.addColorStop(1, mixH('#5A4222', '#3F2A1A', dry));
  ctx.fillStyle = bgr; ctx.fill();
  paint(() => {
    ctx.save(); ctx.clip(); ctx.lineWidth = 34; ctx.strokeStyle = 'rgba(30,16,8,0.35)'; ctx.stroke(); ctx.restore();
    const r2 = mulberry32(21);
    for (let i = 0; i < 70; i++) {   // packed grass fibres
      const th = r2() * 6.283, rr = Math.sqrt(r2()) * R * 0.55, x = Math.cos(th) * rr, y = Math.sin(th) * rr, a = r2() * 3.14, L = 14 + r2() * 26;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L);
      ctx.lineWidth = 2.5; ctx.strokeStyle = r2() < 0.5 ? 'rgba(200,180,110,0.35)' : 'rgba(40,24,12,0.4)'; ctx.stroke();
    }
    // a wet sheen along the top edge
    ctx.beginPath();
    for (let a = 190; a <= 300; a++) { const th = a / 180 * Math.PI, r = brown(th) - 12; ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
    ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,236,200,${0.35 - 0.2 * dry})`; ctx.stroke();
  });
  ctx.restore();
  // labels: STIFF on both stripes, sitting on the stripes themselves (clear of the captions and the right column)
  const lab = clamp(o.labels || 0);
  if (lab > 0.01) {
    for (const a of WBG_STIFF) {
      const r = R - 30, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      wbTag('STIFF', clamp(x, 230, 850), y, '#FF5A7A', lab, 44);
    }
  }
  // the arrows: big and early on the stiff stripes, small and late on the soft wall
  const ar = clamp(o.arrows || 0);
  if (ar > 0.01) {
    for (const a of WBG_STIFF) {
      const m = S.sqAt(a), r0 = R + 150 - 50 * m, r1 = R + 40 - 70 * m;
      wbArrow(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 34 * ar, '#FF5A7A', ar);
    }
    for (const a of [Math.PI * 0.75, Math.PI * 1.75]) {
      const m = S.sqAt(a), r0 = R + 110 - 30 * m, r1 = R + 50 - 40 * m;
      wbArrow(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 18 * ar, '#FFB0C0', ar * 0.85);
    }
  }
  // the corners: four little sparkles where the brown has gone square
  const ck = clamp(o.corners || 0);
  if (ck > 0.01) for (let i = 0; i < 4; i++) {
    const th = Math.PI * 0.25 + i * Math.PI / 2, r = (R - 108) * wbSuper(1, S.n, th) - 30;
    const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r, kk = popK(o.t, o.cornerT + 0.06 * i, o.cornerT + 0.75 + 0.06 * i, 0.08, 0.2);
    wbSpark(x, y, 46 * kk, '#FFE9A8');
  }
  return S;
}

// one ring of gut wall at the origin: the muscle coat outside, the stiff stripes in it, the pink lining inside with folds.
// Returns {inner(th)}: the lining's inner radius at an angle (where the brown is pressed).
function wbRing(S, R, t, alpha, depth, back) {
  const n = 160;
  // the stiff stripes bulge out (a thicker coat) and pull in more; the lining's inner edge goes square with the brown,
  // the corners at the stiff stripes a step ahead of the others
  const outer = (th) => R + 34 * wbStiff(th) - (26 + 36 * wbStiff(th)) * S.sqAt(th);
  const nAt = (th) => 2 + (S.n - 2) * (0.75 + 0.25 * wbStiff(th));
  const inner = (th) => (R - 108 - 26 * S.sqAt(th)) * wbSuper(1, nAt(th), th);
  const ringPath = (fo, fi) => {
    ctx.beginPath();
    for (let a = 0; a <= n; a++) { const th = a / n * Math.PI * 2, r = fo(th); ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
    for (let a = n; a >= 0; a--) { const th = a / n * Math.PI * 2, r = fi(th); ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
    ctx.closePath();
  };
  ctx.globalAlpha = alpha;
  // the muscle coat
  ringPath(outer, (th) => inner(th) + 26);
  ctx.fillStyle = back ? '#8A3046' : '#E07C8E'; ctx.fill();
  // the stiff stripes: darker, glowing a little when they squeeze
  for (const a0 of WBG_STIFF) {
    ctx.beginPath();
    const a1 = a0 - 0.5, a2 = a0 + 0.5;
    for (let a = 0; a <= 30; a++) { const th = lerp(a1, a2, a / 30), r = outer(th) + 2; ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
    for (let a = 30; a >= 0; a--) { const th = lerp(a1, a2, a / 30), r = inner(th) + 24; ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
    ctx.closePath();
    ctx.fillStyle = back ? '#56101F' : '#7A0E2A'; ctx.fill();
    if (!back) paint(() => { ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,170,190,0.55)'; ctx.stroke(); });
    if (!back) {
      const m = S.sqAt(a0);
      if (m > 0.05) {
        const x = Math.cos(a0) * (outer(a0) - 50), y = Math.sin(a0) * (outer(a0) - 50);
        softDot(gctx, (WBG.cx + x), (WBG.cy + y), 120, '#FF3A60', 0.55 * m);
      }
      paint(() => {   // circular muscle fibres across the stripe
        for (let k = 0; k < 9; k++) {
          const rr = lerp(inner(a0) + 30, outer(a0) - 8, k / 8);
          ctx.beginPath(); ctx.arc(0, 0, rr, a1 + 0.05, a2 - 0.05);
          ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,120,150,0.5)'; ctx.stroke();
        }
      });
    }
  }
  // the pink lining with its little folds
  ringPath((th) => inner(th) + 28, (th) => inner(th) + 4 * Math.sin(th * 26 + t * 2));
  ctx.fillStyle = back ? '#B0606E' : '#F29AAA'; ctx.fill();
  if (!back) paint(() => {
    ctx.beginPath();
    for (let a = 0; a <= n; a++) { const th = a / n * Math.PI * 2, r = inner(th) + 16; ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
    ctx.closePath(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,220,226,0.55)'; ctx.stroke();
    // radial fibres in the muscle coat
    for (let a = 0; a < 70; a++) {
      const th = a / 70 * Math.PI * 2, r0 = inner(th) + 34, r1 = outer(th) - 6;
      ctx.beginPath(); ctx.moveTo(Math.cos(th) * r0, Math.sin(th) * r0); ctx.lineTo(Math.cos(th) * r1, Math.sin(th) * r1);
      ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,170,180,0.18)'; ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;
  void depth;
  return { inner };
}

// a bold arrow from a to b (screen), head at b
function wbArrow(x0, y0, x1, y1, w, col, k) {
  if (k <= 0.01) return;
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  paint(() => {
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(a); ctx.globalAlpha = clamp(k * 1.2);
    ctx.beginPath(); ctx.moveTo(0, -w * 0.32); ctx.lineTo(L - w * 0.9, -w * 0.32); ctx.lineTo(L - w * 0.9, -w * 0.75); ctx.lineTo(L, 0);
    ctx.lineTo(L - w * 0.9, w * 0.75); ctx.lineTo(L - w * 0.9, w * 0.32); ctx.lineTo(0, w * 0.32); ctx.closePath();
    ctx.lineWidth = 6; ctx.strokeStyle = '#1A0610'; ctx.stroke(); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
  });
}
// a four-point sparkle (screen)
function wbSpark(x, y, r, col) {
  if (r <= 0.5) return;
  paint(() => {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
  });
  softDot(gctx, x, y, r * 1.4, col, 0.8);
}
// a label pill (screen): rounded dark plate, coloured border, white or coloured Montserrat; pops with k
function wbTag(txt, x, y, col, k, size = 40) {
  if (k <= 0.01) return;
  const kk = E.outBack(clamp(k), 2);
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(kk, kk);
    ctx.font = `900 ${size}px Montserrat`;
    const w = ctx.measureText(txt.toUpperCase()).width + size * 0.9, h = size * 1.45;
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(14,10,24,0.85)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt.toUpperCase(), 0, size * 0.05);
    ctx.restore();
  });
}
// his face in a round frame (screen; paint, not lit): the hiker watching from a corner
function wbPortrait(x, y, Rr, t, k, face, pal = PAL) {
  if (k <= 0.01) return;
  const r = Rr * E.outBack(clamp(k), 1.8), s = r / 84;
  screenSpace();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#2B3B6A'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#F6C48A'); g.addColorStop(1, '#C88A5A');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  paint(() => drawCharacter(ctx, { x, y: y + 470 * s + 14 * s, s, pose: POSES.stand, face }, t, pal));
  ctx.restore();
  paint(() => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = '#FFD447'; ctx.stroke(); });
}
