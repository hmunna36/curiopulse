// Octopus Short: the hiker snorkelling. The rig in a yellow rash vest (`DVPAL`), a dive mask over his eyes and nose
// (the eyes read through the glass), a green snorkel up the side of his head, hair that floats, a stethoscope whose
// earpieces sit in his ears and whose disc he holds to the octopus, bubbles from the corner of his mouth.
// His own heart for "you do this too": a round window on his chest with the heart as TWO pumps taped together
// (the screen-left one sends blood to the lungs, the screen-right one to the body).
'use strict';

const DVPAL = Object.assign({}, PAL, { coat: '#FFC23A', coatSh: '#E39A1C', coatHi: '#FFE38A', coatDk: '#B87410', bare: true,
  shoe: '#1FB5A8', shoeSh: '#127C73', sole: '#0F5F59' });
const DV_FLOAT = { hipY: -222, lean: 0.04, armL: { a: 0.55, b: 0.5 }, armR: { a: 0.4, b: 0.3 }, legL: { a: 0.12, b: 0.35 }, legR: { a: 0.02, b: 0.5 }, hand: 'open', feetFront: 0 };

// head-local point -> world, for this frame's rig
function dvHeadPt(st, r, hx, hy) {
  const a = r.lean + (st.headRot || 0), c = Math.cos(a), s = Math.sin(a);
  const x0 = r.head[0] + (st.headDX || 0), y0 = r.head[1] + (st.headDY || 0);
  return [st.x + (x0 + hx * c - hy * s) * st.s, st.y + (y0 + hx * s + hy * c) * st.s];
}

// the mask and snorkel, drawn over his head in head units (c is already in head space)
function dvMask(c, t, o = {}) {
  // floating hair strands (behind nothing: they rise off the quiff)
  paint(() => {
    for (let i = 0; i < 7; i++) { const x0 = -40 + i * 13, sw = 8 * Math.sin(t * 2.2 + i * 0.9), h = 26 + 10 * Math.sin(i * 1.7);
      c.beginPath(); c.moveTo(x0, -60 - (i % 3) * 4); c.quadraticCurveTo(x0 + sw, -60 - h * 0.6, x0 + sw * 1.8, -64 - h); c.lineWidth = 6; c.strokeStyle = PAL.hair; c.lineCap = 'round'; c.stroke(); }
  });
  // strap round the sides of his head
  line(c, -50, -10, -66, -4, 11, '#1C2026'); line(c, 50, -10, 66, -4, 11, '#1C2026');
  // the snorkel: mouthpiece by his mouth, up the right side of his head (screen right)
  const tube = () => { c.beginPath(); c.moveTo(70, 8); c.lineTo(76, -96); c.quadraticCurveTo(77, -128, 62, -150); };
  tube(); c.lineWidth = 15; c.strokeStyle = '#1F9E5C'; c.lineCap = 'round'; c.stroke();
  paint(() => { tube(); c.lineWidth = 4; c.strokeStyle = 'rgba(190,255,215,0.6)'; c.stroke();
    line(c, 69, -142, 60, -156, 16, '#FF7A2E'); rrect(c, 62, -18, 18, 22, 5); c.fillStyle = '#1C2026'; c.fill(); });
  // the mask: a black silicone skirt, a frame, two lenses joined over a nose pocket
  const skirt = () => { c.beginPath(); c.moveTo(-54, -24); c.quadraticCurveTo(-56, -36, -40, -36); c.lineTo(40, -36); c.quadraticCurveTo(56, -36, 54, -24);
    c.lineTo(52, 12); c.quadraticCurveTo(48, 24, 32, 24); c.quadraticCurveTo(18, 24, 14, 34); c.lineTo(-14, 34); c.quadraticCurveTo(-18, 24, -32, 24); c.quadraticCurveTo(-48, 24, -52, 12); c.closePath(); };
  skirt(); c.lineWidth = 10; c.strokeStyle = '#1C2026'; c.lineJoin = 'round'; c.stroke();
  paint(() => {
    skirt(); c.fillStyle = `rgba(185,240,255,${o.fog ? 0.55 : 0.2})`; c.fill();
    // glints on the glass
    c.save(); skirt(); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.42)'; c.beginPath(); c.moveTo(-46, -30); c.lineTo(-30, -30); c.lineTo(-52, 6); c.lineTo(-58, -6); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(18, -30); c.lineTo(26, -30); c.lineTo(10, 0); c.lineTo(4, 0); c.closePath(); c.fill();
    c.restore();
    skirt(); c.lineWidth = 3.5; c.strokeStyle = '#3B4452'; c.stroke();
    line(c, 0, -34, 0, -4, 4, '#3B4452');
  });
}

// the stethoscope: earpieces in his ears, two tubes down to a Y under his chin, one tube to the disc at `disc` (world)
function dvScope(c, st, r, disc, t, o = {}) {
  const eL = dvHeadPt(st, r, -60, 12), eR = dvHeadPt(st, r, 60, 12), yJ = dvHeadPt(st, r, 0, 132), s = st.s;
  const tube = (P) => { c.beginPath(); c.moveTo(P[0][0], P[0][1]); c.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]); };
  const cL = dvHeadPt(st, r, -64, 96), cR = dvHeadPt(st, r, 64, 96);
  for (const [e, cc] of [[eL, cL], [eR, cR]]) { tube([e, cc, [lerp(cc[0], yJ[0], 0.5), yJ[1]], yJ]); c.lineWidth = 7 * s; c.strokeStyle = '#2B2F38'; c.lineCap = 'round'; c.stroke(); }
  for (const e of [eL, eR]) { circle(c, e[0], e[1], 7 * s, '#C9CED8'); }
  if (!disc) return;
  const sag = o.sag === undefined ? 1 : o.sag, mx = (yJ[0] + disc[0]) / 2, my = Math.max(yJ[1], disc[1]) + 70 * s * sag;
  tube([yJ, [yJ[0], my], [mx + (disc[0] - mx) * 0.4, my], [disc[0], disc[1] + 10 * s]]); c.lineWidth = 7.5 * s; c.strokeStyle = '#2B2F38'; c.stroke();
  // the chest piece
  const k = o.discK === undefined ? 1 : o.discK;
  circle(c, disc[0], disc[1], 17 * s * k, '#8D95A3'); circle(c, disc[0], disc[1], 13 * s * k, '#D9DEE6');
  paint(() => { circle(c, disc[0] - 4 * s, disc[1] - 4 * s, 4 * s, 'rgba(255,255,255,0.9)'); });
}

// the whole hero. A: {x, y, s, pose, face, headRot, headDX, headDY, disc ([wx, wy] the stethoscope's chest piece, held in
// his right hand), scope (earpieces in), handL ([wx, wy] where the left hand goes, or null), bubbles (0..1), fog, gasp (0..1)}
function dvHero(cam, t, A) {
  let pose = Object.assign({}, A.pose || DV_FLOAT);
  const st = { x: A.x, y: A.y, s: A.s || 1, face: A.face || FACES.calm, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, blink: 0 };
  if (A.disc) pose = ikReach(pose, 'R', ikLocal(st, A.disc[0] - 14 * st.s, A.disc[1] + 12 * st.s), A.bendR === undefined ? -1 : A.bendR);
  if (A.handL) pose = ikReach(pose, 'L', ikLocal(st, A.handL[0], A.handL[1]), A.bendL === undefined ? 1 : A.bendL);
  st.pose = pose;
  const r = charLayer(cam, st, t, {
    pal: DVPAL,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      const [hx, hy] = rr.head; lc.translate(hx + (s2.headDX || 0), hy + (s2.headDY || 0)); lc.rotate(rr.lean + (s2.headRot || 0));
      dvMask(lc, t, { fog: A.fog });
      lc.restore();
      if (A.scope !== false) dvScope(lc, s2, rr, A.disc, t, { sag: A.sag, discK: A.discK });
      if (A.post) A.post(lc, rr, s2);
    },
  });
  // bubbles from the corner of his mouth (world space, over him)
  const m = dvHeadPt(st, r, 18, 44);
  applyCam(cam);
  if ((A.bubbles || 0) > 0.01) rfBubbles(ctx, m[0], m[1], t, Math.round(3 + 5 * A.bubbles), 220 * st.s, 7 * st.s * (0.7 + 0.5 * A.bubbles), 3, 14);
  if ((A.gasp || 0) > 0.01) { const g = A.gasp; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28, d = (30 + 140 * g) * st.s * (0.7 + 0.5 * hash(i)); const bx = m[0] + Math.cos(a) * d, by = m[1] - 20 * st.s + Math.sin(a) * d;
    ctx.beginPath(); ctx.arc(bx, by, (8 + 9 * hash(i + 2)) * st.s * (1 - 0.3 * g), 0, 7); ctx.lineWidth = 2.5 * st.s; ctx.strokeStyle = `rgba(230,255,252,${0.9 * (1 - g * 0.6)})`; ctx.stroke(); } }
  return { r, st };
}

// the heart as two pumps, in a round window at (x, y) radius R (world; call with the camera applied).
// k = 0..1 opens it; pulse = 0..1; tape = 0..1 slaps the tape on; labels 0..1
function dvHeartWindow(c, x, y, R, k, pulse, tape, labels, t) {
  if (k <= 0.01) return;
  const rr = R * E.outBack(clamp(k));
  // one opaque fill of the window first (two-noses' rule), then what is inside
  circle(c, x, y, rr + 6, '#0B2034');
  paint(() => {
    c.save(); c.beginPath(); c.arc(x, y, rr, 0, 7); c.clip();
    const g = c.createRadialGradient(x, y - rr * 0.3, 10, x, y, rr); g.addColorStop(0, '#24496A'); g.addColorStop(1, '#0E2338'); c.fillStyle = g; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
    // ribs, faint
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.ellipse(x, y + i * rr * 0.32, rr * 0.95, rr * 0.18, 0, Math.PI * 0.05, Math.PI * 0.95); c.lineWidth = 5; c.strokeStyle = 'rgba(200,230,255,0.12)'; c.stroke(); }
    const s = rr / 120, pk = 1 + 0.12 * pulse, gap = 9 * s;
    // the two pumps: the left half of a heart and the right half, pulled a little apart
    for (const sd of [-1, 1]) {
      c.save(); c.translate(x + sd * gap, y + 6 * s); c.scale(pk, pk);
      c.beginPath(); c.moveTo(0, 62 * s);
      if (sd < 0) { c.bezierCurveTo(-80 * s, 10 * s, -66 * s, -66 * s, 0, -30 * s); }
      else { c.bezierCurveTo(80 * s, 10 * s, 66 * s, -66 * s, 0, -30 * s); }
      c.closePath();
      c.fillStyle = sd < 0 ? '#7E7BE0' : '#F0506E'; c.fill(); c.lineWidth = 4 * s; c.strokeStyle = sd < 0 ? '#3F3A9E' : '#9C1E3B'; c.stroke();
      ellipse(c, sd * 30 * s, -22 * s, 12 * s, 7 * s, 'rgba(255,255,255,0.45)', sd * 0.5);
      c.restore();
    }
    // arrows: the left pump to the lungs (up-left), the right pump to the body (down-right)
    const ar = (x0, y0, x1, y1, col, a) => { if (a <= 0.01) return; c.globalAlpha = a; line(c, x0, y0, x1, y1, 9 * s, col); const an = Math.atan2(y1 - y0, x1 - x0);
      c.beginPath(); c.moveTo(x1 + Math.cos(an) * 16 * s, y1 + Math.sin(an) * 16 * s); c.lineTo(x1 + Math.cos(an + 2.4) * 18 * s, y1 + Math.sin(an + 2.4) * 18 * s); c.lineTo(x1 + Math.cos(an - 2.4) * 18 * s, y1 + Math.sin(an - 2.4) * 18 * s); c.closePath(); c.fillStyle = col; c.fill(); c.globalAlpha = 1; };
    ar(x - 40 * s, y - 34 * s, x - 78 * s, y - 84 * s, '#AEB4FF', labels);
    ar(x + 40 * s, y + 20 * s, x + 84 * s, y + 70 * s, '#FF8FA6', labels);
    // the tape over the join
    if (tape > 0.01) {
      c.save(); c.translate(x, y + 4 * s); c.rotate(-0.25); const tk = E.outBack(clamp(tape));
      c.scale(tk, tk); rrect(c, -46 * s, -13 * s, 92 * s, 26 * s, 3 * s); c.fillStyle = '#C8CDD4'; c.fill();
      for (let i = -3; i <= 3; i++) line(c, i * 13 * s, -12 * s, i * 13 * s + 4 * s, 12 * s, 1.5 * s, 'rgba(120,128,140,0.6)');
      c.restore();
    }
    c.restore();
    c.beginPath(); c.arc(x, y, rr, 0, 7); c.lineWidth = 7; c.strokeStyle = '#9FE8FF'; c.stroke();
  });
}
