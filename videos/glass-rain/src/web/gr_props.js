// The Planet Where It Rains GLASS Sideways ☔: the props and graphics.
// The umbrella (opens, gets punched full of holes and torn to rags that stream downwind, leaving bare spokes), a cartoon
// bullet that gets overtaken, rotten-egg stink and an egg badge, pill tags, a CLONK burst.
'use strict';

// ---------------------------------------------------------------- the umbrella
// Drawn in any space (rig-local inside his layer works): the handle at (0, 0), the shaft up along -y, length L; canopy
// radius R. o: {open 0..1, shred 0..1, t, wind: [x, y] (downwind in this space), cols, seed}
function grUmbrella(c, L, R, o = {}) {
  const open = clamp(o.open === undefined ? 1 : o.open), shred = clamp(o.shred || 0), t = o.t || 0;
  const wind = o.wind || [1, 0.15], cols = o.cols || ['#FFC93C', '#FF6F59'];
  // the J handle under the hand, and the shaft
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 34); c.arc(-22, 34, 22, 0, Math.PI, false);
  c.lineWidth = 13; c.strokeStyle = '#5A3420'; c.stroke();
  line(c, 0, 0, 0, -L - 0.62 * R * Math.max(open, 0.3) - 18, 8, '#3A3F52');
  if (open < 0.12) {                                   // furled: the cloth wrapped round the shaft, a strap round it
    const top = -L - 0.62 * R * 0.3 - 10, bot = -L + 0.55 * R;
    const bl = 1 + 2.2 * open / 0.12;                  // it starts to bloom just before it opens
    for (let j = 0; j < 4; j++) {
      c.beginPath(); c.moveTo(0, top);
      c.quadraticCurveTo((j - 1.5) * 9 * bl, (top + bot) / 2, (j - 1.5) * 10 * bl, bot);
      c.lineTo((j - 0.5) * 10 * bl, bot); c.quadraticCurveTo((j - 0.5) * 9 * bl, (top + bot) / 2, 0, top); c.closePath();
      c.fillStyle = cols[j % 2]; c.fill();
    }
    rrect(c, -16 * bl, (top + bot) / 2 - 6, 32 * bl, 12, 6); c.fillStyle = '#C84A3A'; c.fill();
    circle(c, 0, top - 6, 8, '#2C3144');
    return;
  }
  const op = inv(0.12, 1, open), Rr = R * lerp(0.18, 1, E.outBack(op, 1.4)), Hd = 0.6 * Rr * lerp(1.6, 1, op);
  const top = [0, -L - Hd];
  const tips = [];
  for (let i = 0; i <= 4; i++) { const x = Rr * Math.cos(Math.PI * i / 4); tips.push([x, -L + 0.2 * Rr * (1 - (x / Rr) * (x / Rr))]); }
  const ribCtl = (i) => [tips[i][0] * 1.02, -L - Hd * (Math.abs(tips[i][0]) > 0.9 * Rr ? 0.95 : 0.72)];
  const tear = [0.32, 0.58, 0.44, 0.8];                    // when each panel goes (left to right on screen: 3, 2, 1, 0)
  const rng = mulberry32(o.seed || 71);
  // the panels
  for (let j = 0; j < 4; j++) {
    const a = tips[j], b = tips[j + 1], ca = ribCtl(j), cb = ribCtl(j + 1);
    const tj = tear[j];
    const gone = shred > tj;
    const panel = () => {
      c.beginPath(); c.moveTo(top[0], top[1]);
      c.quadraticCurveTo(ca[0], ca[1], a[0], a[1]);
      c.quadraticCurveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 0.16 * Rr, b[0], b[1]);
      c.quadraticCurveTo(cb[0], cb[1], top[0], top[1]); c.closePath();
    };
    if (!gone) {
      panel(); c.fillStyle = cols[j % 2]; c.fill();
      // punctures before it tears: little dark stars where beads went through
      const pk = clamp((shred - (tj - 0.3)) / 0.3);
      if (pk > 0) {
        paint(() => {
          c.save(); panel(); c.clip();
          const nh = Math.floor(pk * 7);
          for (let h = 0; h < nh; h++) {
            const u = 0.25 + 0.6 * ((h * 0.37 + j * 0.21) % 1), v = 0.2 + 0.7 * ((h * 0.61 + j * 0.13) % 1);
            const px = lerp(lerp(top[0], a[0], u), lerp(top[0], b[0], u), v), py = lerp(top[1], (a[1] + b[1]) / 2, u) - 6;
            c.beginPath();
            for (let q = 0; q < 10; q++) { const ang = q * Math.PI / 5, rr = (q % 2 ? 4 : 11) * (0.8 + 0.4 * ((h + q) % 3) / 2); c.lineTo(px + Math.cos(ang) * rr, py + Math.sin(ang) * rr); }
            c.closePath(); c.fillStyle = '#2E64C2'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#7A2A1A'; c.stroke();
          }
          c.restore();
        });
      }
    } else {
      // rags: strips still tied to the ribs, streaming downwind
      const age = shred - tj;
      for (let r = 0; r < 3; r++) {
        const side = r % 2 ? b : a, ctl = r % 2 ? cb : ca, u = 0.35 + 0.25 * r;
        const ax = (1 - u) * (1 - u) * top[0] + 2 * u * (1 - u) * ctl[0] + u * u * side[0];
        const ay = (1 - u) * (1 - u) * top[1] + 2 * u * (1 - u) * ctl[1] + u * u * side[1];
        const len = (55 + 40 * ((j + r) % 3)) * clamp(age * 4 + 0.4), wdt = 16 - 3 * r;
        const pts = [];
        for (let k = 0; k <= 8; k++) {
          const v = k / 8, ph = t * 15 + j * 1.7 + r * 2.3 - v * 5;
          pts.push([ax + wind[0] * len * v + Math.sin(ph) * 9 * v, ay + wind[1] * len * v + Math.cos(ph * 0.8) * 12 * v + 10 * v * v]);
        }
        c.beginPath();
        for (let k = 0; k <= 8; k++) c.lineTo(pts[k][0], pts[k][1] - wdt * (1 - k / 10) / 2);
        for (let k = 8; k >= 0; k--) c.lineTo(pts[k][0], pts[k][1] + wdt * (1 - k / 10) / 2);
        c.closePath(); c.fillStyle = cols[j % 2]; c.fill();
      }
    }
  }
  // the ribs (spokes): always there; with the cloth gone they are all that is left
  for (let i = 0; i <= 4; i++) {
    const ctl = ribCtl(i);
    c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(ctl[0], ctl[1], tips[i][0], tips[i][1]);
    c.lineWidth = shred > 0.5 ? 6 : 4; c.strokeStyle = '#2C3144'; c.stroke();
    circle(c, tips[i][0], tips[i][1], 6, '#2C3144');
  }
  // a bent spoke or two at the end
  circle(c, top[0], top[1] - 6, 9, '#2C3144');
  line(c, top[0], top[1] - 6, top[0], top[1] - 26, 7, '#2C3144');
  void rng;
}

// ---------------------------------------------------------------- a cartoon bullet (screen space), flying right
// o: {look (-1 back .. 1 ahead), sweat 0..1, k (pop in)}
function grBullet(x, y, s, t, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  for (let i = 0; i < 4; i++) line(ctx, -150 - 40 * i, -24 + 16 * i, -60 - 30 * i, -24 + 16 * i, 4, `rgba(255,255,255,${0.5 - 0.1 * i})`);
  ctx.beginPath(); ctx.moveTo(-60, -26); ctx.lineTo(20, -26); ctx.quadraticCurveTo(78, -24, 92, 0); ctx.quadraticCurveTo(78, 24, 20, 26);
  ctx.lineTo(-60, 26); ctx.closePath(); ctx.fillStyle = '#D9893A'; ctx.fill();
  ctx.fillStyle = '#B86A28'; ctx.fillRect(-60, 8, 80, 18);
  ctx.fillStyle = '#9A5A22'; ctx.fillRect(-66, -26, 10, 52);
  paint(() => {
    const lk = o.look || 0;
    for (const ex of [10, 40]) { circle(ctx, ex, -6, 11, '#FFFFFF'); circle(ctx, ex + 5 * lk, -6, 5.5, '#1A1C26'); }
    line(ctx, 2, -22, 18, -18 - 4 * (o.sweat || 0), 3.5, '#5A3018'); line(ctx, 32, -18 - 4 * (o.sweat || 0), 48, -22, 3.5, '#5A3018');
    if (o.sweat > 0.05) {
      ctx.save(); ctx.globalAlpha = o.sweat;
      ctx.beginPath(); ctx.moveTo(62, -40); ctx.quadraticCurveTo(70, -26, 62, -20); ctx.quadraticCurveTo(54, -26, 62, -40);
      ctx.fillStyle = '#BFF0FF'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#4A9AC8'; ctx.stroke(); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(26, 12, 7, 0.1, Math.PI - 0.1, true); ctx.lineWidth = 3; ctx.strokeStyle = '#5A3018'; ctx.stroke();
  });
  ctx.restore();
}

// ---------------------------------------------------------------- stink and the egg
function grStink(x, y, s, t, k) {
  if (k <= 0.01) return;
  screenSpace();
  for (let i = 0; i < 3; i++) {
    const ox = x + (i - 1) * 46 * s, ph = t * 5 + i * 1.3;
    ctx.beginPath();
    for (let j = 0; j <= 12; j++) { const v = j / 12; ctx.lineTo(ox + 14 * s * Math.sin(ph + v * 8), y - v * 150 * s * k); }
    ctx.lineWidth = 9 * s; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(132,214,70,${0.85 * k})`; ctx.stroke();
  }
}
function grEgg(x, y, s, t, k) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.rotate(0.12 * Math.sin(t * 6));
  circle(ctx, 0, 0, 92, '#2E4A1C');
  circle(ctx, 0, 0, 84, '#7FBF45');
  ctx.beginPath(); ctx.ellipse(0, 8, 44, 58, 0, 0, 7); ctx.fillStyle = '#F3EBD6'; ctx.fill();
  paint(() => {
    ctx.beginPath(); ctx.moveTo(-40, -2); ctx.lineTo(-20, -14); ctx.lineTo(-6, 2); ctx.lineTo(10, -16); ctx.lineTo(26, 0); ctx.lineTo(42, -10);
    ctx.lineWidth = 5; ctx.strokeStyle = '#6B5A3A'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 26, 22, 22, 0, 0, 7); ctx.fillStyle = 'rgba(160,190,60,0.85)'; ctx.fill();
    // eyes: x x
    for (const ex of [-16, 16]) { line(ctx, ex - 7, 12, ex + 7, 26, 4, '#3A2A12'); line(ctx, ex + 7, 12, ex - 7, 26, 4, '#3A2A12'); }
  });
  ctx.restore();
  grStink(x, y - 70 * s * k, 0.8 * s, t, k);
}

// ---------------------------------------------------------------- tags and bursts (screen space)
// a pill with one or two lines; o: {bg, fg, size, sub (a second, smaller line), rot}
function grTag(txt, x, y, k, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  const size = o.size || 46, sub = o.sub || '';
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(E.outBack(clamp(k), 1.7), E.outBack(clamp(k), 1.7));
  ctx.font = `900 ${size}px Montserrat`;
  const w1 = ctx.measureText(txt).width;
  ctx.font = `800 ${size * 0.56}px Montserrat`;
  const w2 = sub ? ctx.measureText(sub).width : 0;
  const w = Math.max(w1, w2) + size * 1.1, h = size * (sub ? 1.95 : 1.4);
  rrect(ctx, -w / 2 + 6, -h / 2 + 8, w, h, h * 0.32); ctx.fillStyle = 'rgba(4,10,30,0.55)'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h * 0.32); ctx.fillStyle = o.bg || '#0E1E46'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = o.edge || '#7FE9FF'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${size}px Montserrat`; ctx.fillStyle = o.fg || '#FFFFFF';
  ctx.fillText(txt, 0, sub ? -size * 0.36 : 2);
  if (sub) { ctx.font = `800 ${size * 0.56}px Montserrat`; ctx.fillStyle = o.subCol || '#BFE6FF'; ctx.fillText(sub, 0, size * 0.5); }
  ctx.restore();
}
// a comic burst with a word (screen space)
function grBurst(txt, x, y, r, k, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.12); const sc = E.outBack(clamp(k), 2); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 22; i++) { const a = i * Math.PI * 2 / 22, rr = r * (i % 2 ? 0.66 : 1) * (1 + 0.06 * Math.sin(i * 3.1)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.78); }
  ctx.closePath(); ctx.fillStyle = o.bg || '#FFFFFF'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#141A2E'; ctx.stroke();
  ctx.font = `900 ${o.size || r * 0.5}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 8; ctx.strokeStyle = '#141A2E'; ctx.strokeText(txt, 0, 4);
  ctx.fillStyle = o.fg || '#FF5A6E'; ctx.fillText(txt, 0, 4);
  ctx.restore();
}
