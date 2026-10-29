// Shrimp Short: the pistol shrimp and its snap. A candy-striped snapping shrimp in profile facing screen-left (its eyes
// peek out from under the hood of its shell, as a real one's do), one giant snapping claw whose top finger cocks open
// and slams shut, the slow-motion rig (the water jet, the bubble that tears open and crushes itself, the white-hot
// flash and the shock ring), the hiker's own snapping hand, his sunglasses, the thermometer against the Sun, the
// 1940s submarine and its sonar scope full of crackle.
// Shrimp-local units: 1 = 1 world px at s = 1, origin under its belly, facing -x. Prefix: ss.
'use strict';

const SSPAL = { body: '#F57E45', band: '#FFE6D4', claw: '#E8432A', clawDk: '#9E2E16', tip: '#FFC9B0', leg: '#F59870',
  eye: '#FFFFFF', pupil: '#1A1214' };
const SS_HINGE = [-84, -38];   // the claw's hinge (shrimp-local)
const SS_CS = 0.62;            // claw units -> shrimp units

// ---------------------------------------------------------------- the claw (claw-local: the hinge at 0,0, the claw
// points to -x). ang: the top finger's angle (0 = shut on the bottom finger, ~1.45 = cocked open). glow 0..1 heats the tips.
function ssClaw(c, ang, o = {}) {
  const P = SSPAL, ol = '#7E1E10';
  const palm = () => { c.beginPath(); c.ellipse(56, 18, 60, 40, 0.05, 0, 7); };
  const fixed = () => { c.beginPath(); c.moveTo(14, 0); c.quadraticCurveTo(-36, 6, -80, 22); c.quadraticCurveTo(-88, 31, -74, 35); c.quadraticCurveTo(-30, 47, 24, 54); c.closePath(); };
  const dact = () => { c.beginPath(); c.moveTo(10, -13); c.quadraticCurveTo(-40, -20, -84, 2); c.quadraticCurveTo(-92, 11, -78, 15); c.quadraticCurveTo(-38, 13, 6, 11); c.closePath(); };
  // the bottom (fixed) finger, then the palm over its root
  fixed(); c.fillStyle = P.claw; c.fill();
  palm(); c.fillStyle = P.claw; c.fill();
  paint(() => {
    // the white band round the palm, the pale finger tip, the socket the plunger fits into, outlines
    c.save(); palm(); c.clip(); c.fillStyle = P.band; c.fillRect(42, -30, 26, 100); c.restore();
    c.beginPath(); c.moveTo(-56, 24); c.quadraticCurveTo(-86, 26, -80, 32); c.quadraticCurveTo(-72, 37, -54, 37); c.closePath(); c.fillStyle = P.tip; c.fill();
    ellipse(c, -14, 12, 10, 5.5, P.clawDk);
    fixed(); c.lineWidth = 3.5; c.strokeStyle = ol; c.lineJoin = 'round'; c.stroke();
    palm(); c.lineWidth = 3.5; c.strokeStyle = ol; c.stroke();
  });
  // the top finger (dactyl), hinged at 0,0, with the plunger knob on its underside
  c.save(); c.rotate(-ang);
  dact(); c.fillStyle = P.claw; c.fill();
  paint(() => {
    c.beginPath(); c.moveTo(-58, -2); c.quadraticCurveTo(-90, 4, -82, 10); c.quadraticCurveTo(-74, 15, -56, 12); c.closePath(); c.fillStyle = P.tip; c.fill();
    ellipse(c, -14, 13, 8, 6, P.clawDk);   // the plunger
    dact(); c.lineWidth = 3.5; c.strokeStyle = ol; c.stroke();
    circle(c, 0, 0, 7, ol);                // the hinge pin
  });
  c.restore();
  if ((o.glow || 0) > 0.01) paint(() => { softDot(c, -44, 12, 56, '#FFF2C0', 0.6 * o.glow); });
}

// ---------------------------------------------------------------- the whole shrimp. o: {cock 0..1, look [x,y] (-1..1),
// lids 0..1 (half-shut: unimpressed), wide 0..1, blink, flex 0..1 (the claw up like a bodybuilder), sway, glow}
function ssShrimp(c, x, y, s, t, o = {}) {
  const P = SSPAL, sw = Math.sin(t * 1.7 + (o.ph || 0));
  c.save(); c.translate(x, y); c.scale(s, s); if (o.rot) c.rotate(o.rot);
  actor(() => {
    // antennae: two long whips forward and up, curling back over its back (thin: they are drawn, never lit)
    paint(() => {
      for (const [k, a0] of [[0, 0], [1, 0.25]]) {
        c.beginPath(); c.moveTo(-50, -62);
        c.bezierCurveTo(-110 - 20 * k, -120 + 10 * sw, -60 + 30 * k, -210 - 15 * sw, 60 + 40 * k + 14 * Math.sin(t * 2.3 + k), -200 + 20 * k + 10 * sw);
        c.lineWidth = 3.2; c.strokeStyle = '#E8603A'; c.lineCap = 'round'; c.stroke();
      }
      // the short feelers
      for (const k of [0, 1]) { c.beginPath(); c.moveTo(-48, -58); c.quadraticCurveTo(-78 - 6 * k, -78 + 4 * sw, -92 - 10 * k, -70 + 6 * k); c.lineWidth = 3; c.strokeStyle = '#F08A60'; c.stroke(); }
    });
    // walking legs
    for (let i = 0; i < 4; i++) { const lx = -24 + i * 16, ph = Math.sin(t * 3 + i);
      line(c, lx, -22, lx - 6 + 2 * ph, -2, 5, P.leg); line(c, lx - 6 + 2 * ph, -2, lx - 12 + 2 * ph, 6, 4, P.leg); }
    // the tail: the abdomen's segments curling down to a tail fan
    const seg = [[34, -40, 27], [58, -38, 25], [80, -34, 22], [99, -28, 18], [114, -20, 14]];
    c.beginPath(); c.moveTo(118, -14); c.lineTo(150, -30 + 3 * sw); c.lineTo(156, -6 + 3 * sw); c.lineTo(150, 14 + 2 * sw); c.closePath(); c.fillStyle = P.body; c.fill();
    for (let i = seg.length - 1; i >= 0; i--) { const [sx, sy, r] = seg[i]; c.beginPath(); c.ellipse(sx, sy, r * 0.95, r, 0, 0, 7); c.fillStyle = P.body; c.fill(); }
    // the shell over its head and body
    c.beginPath(); c.moveTo(-58, -50); c.quadraticCurveTo(-50, -74, -10, -72); c.quadraticCurveTo(30, -70, 40, -44); c.quadraticCurveTo(40, -18, 6, -16);
    c.quadraticCurveTo(-36, -16, -50, -30); c.closePath(); c.fillStyle = P.body; c.fill();
    paint(() => {
      // candy bands on the tail and the shell
      for (const [sx, sy, r] of seg.slice(0, 4)) { c.beginPath(); c.ellipse(sx + r * 0.55, sy, r * 0.22, r * 0.95, 0, 0, 7); c.fillStyle = P.band; c.fill(); }
      c.beginPath(); c.ellipse(4, -44, 9, 26, 0.1, 0, 7); c.fillStyle = P.band; c.fill();
    });
    // the little claw, tucked under
    line(c, -36, -24, -58, -12, 7, P.claw); ellipse(c, -64, -10, 9, 6, P.claw);
    // the big claw: its arm, then the claw at the hinge
    line(c, -26, -26, -48, -30, 14, P.claw);
    const flex = o.flex || 0, ang = lerp(0.03, 1.2, clamp(o.cock || 0));
    c.save(); c.translate(SS_HINGE[0], SS_HINGE[1]); c.rotate(-0.5 * flex); c.scale(SS_CS, SS_CS);
    ssClaw(c, ang, { glow: o.glow });
    c.restore();
  });
  // the eyes, under the front of the shell (a hood they peek out from): big, round, and very expressive
  paint(() => {
    const lx = clamp((o.look || [0, 0])[0], -1, 1), ly = clamp((o.look || [0, 0])[1], -1, 1);
    const wide = o.wide || 0, er = 11 + 3 * wide;
    for (const [ex, ey] of [[-44, -54], [-31, -58]]) {
      circle(c, ex, ey, er + 2, '#5A1E10'); circle(c, ex, ey, er, P.eye);
      circle(c, ex + lx * 4.5, ey + ly * 4, (5.5 - 1.5 * wide), P.pupil); circle(c, ex + lx * 4.5 - 1.6, ey + ly * 4 - 2, 1.6, '#FFFFFF');
      const lid = Math.max(o.blink || 0, (o.lids || 0) * 0.55);
      if (lid > 0.01) { c.save(); c.beginPath(); c.arc(ex, ey, er + 1, 0, 7); c.clip(); c.fillStyle = P.body; c.fillRect(ex - er - 2, ey - er - 2, 2 * er + 4, (2 * er + 4) * lid); c.restore(); }
    }
    // the hood: the shell's rim over the top of the eyes
    c.beginPath(); c.moveTo(-60, -60); c.quadraticCurveTo(-40, -76 - 3 * wide, -18, -66); c.lineWidth = 7; c.strokeStyle = '#E2582E'; c.lineCap = 'round'; c.stroke();
  });
  c.restore();
}

// the claw's hinge in world coordinates (where the jet and the bubble start), for a shrimp at x, y, s
function ssHingeW(x, y, s, flex = 0) { return [x + SS_HINGE[0] * s, y + SS_HINGE[1] * s]; }
// the mouth of the jet (just in front of the socket) in world coordinates
function ssJetW(x, y, s) { return [x + (SS_HINGE[0] - 46 * SS_CS) * s, y + (SS_HINGE[1] + 12 * SS_CS) * s]; }

// ---------------------------------------------------------------- slow motion: the jet and the bubble (world space,
// under the camera). From the jet mouth J pointing -x: jet 0..1 (how far the water has shot), R the bubble's radius
// (world px) at distance d in front; hot 0..1 the white-hot point when it has crushed itself
function ssJet(c, J, len, k, t) {
  if (k <= 0.01) return;
  const x0 = J[0], y0 = J[1], L = len * k;
  paint(() => {
    const g = c.createLinearGradient(x0, 0, x0 - L, 0); g.addColorStop(0, 'rgba(230,255,255,0.75)'); g.addColorStop(1, 'rgba(200,245,255,0.05)');
    c.beginPath(); c.moveTo(x0, y0 - 5); c.lineTo(x0 - L, y0 - 2 - L * 0.06); c.lineTo(x0 - L, y0 + 2 + L * 0.06); c.lineTo(x0, y0 + 5); c.closePath(); c.fillStyle = g; c.fill();
    for (let i = 0; i < 7; i++) { const u = (i * 0.37 + t * 3.1) % 1, yy = y0 + (i - 3) * 3.2, xs = x0 - L * u;
      line(c, xs, yy, xs - 22 - 18 * hash(i), yy, 1.6, `rgba(255,255,255,${0.75 * (1 - u)})`); }
  });
}
function ssBubble(c, cx, cy, R, t, o = {}) {
  if (R <= 0.3) return;
  paint(() => {
    // the bubble: see-through water vapour with a bright rim, a window highlight and a dark refracted edge
    const g = c.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    g.addColorStop(0, 'rgba(235,255,255,0.10)'); g.addColorStop(0.75, 'rgba(160,230,255,0.18)'); g.addColorStop(1, 'rgba(20,70,110,0.55)');
    c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fillStyle = g; c.fill();
    c.lineWidth = Math.max(1.2, R * 0.06); c.strokeStyle = 'rgba(235,255,255,0.85)'; c.stroke();
    c.beginPath(); c.ellipse(cx - R * 0.38, cy - R * 0.42, R * 0.28, R * 0.14, -0.6, 0, 7); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
    c.beginPath(); c.arc(cx + R * 0.15, cy + R * 0.2, R * 0.72, 0.2, 1.3); c.lineWidth = Math.max(1, R * 0.04); c.strokeStyle = 'rgba(255,255,255,0.45)'; c.stroke();
    // inward arrows while it crushes (o.crush 0..1)
    if ((o.crush || 0) > 0.05) { const k = o.crush, u = o.unit || 1;   // u: world px per screen px (1 / zoom)
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, r1 = R + 10 * u, r0 = r1 + 60 * u * (1 - 0.5 * k);
        const ax = cx + Math.cos(a) * r1, ay = cy + Math.sin(a) * r1, hs = 16 * u;
        line(c, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, ax + Math.cos(a) * hs, ay + Math.sin(a) * hs, 6 * u, `rgba(255,255,255,${0.85 * k})`);
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + Math.cos(a + 0.5) * hs * 1.4, ay + Math.sin(a + 0.5) * hs * 1.4); c.lineTo(ax + Math.cos(a - 0.5) * hs * 1.4, ay + Math.sin(a - 0.5) * hs * 1.4); c.closePath(); c.fillStyle = `rgba(255,255,255,${0.85 * k})`; c.fill(); } }
  });
}
// the flash where it crushed itself: the white-hot point (main and glow layers), rays, the shock ring, a spray of tiny
// bubbles. k 0..1 runs the burst (0 = the instant), size in world px
function ssFlash(c, cx, cy, k, size, t, seed = 1) {
  if (k < 0 || k >= 1) return;
  const a = 1 - k, ring = size * (0.3 + 2.4 * E.outCubic(k));
  paint(() => {
    softDot(c, cx, cy, size * (0.9 + 0.6 * k), '#FFFFFF', 0.95 * a * a);
    softDot(c, cx, cy, size * 0.35, '#FFFFFF', a);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 + 0.13 * seed, L = size * (1.2 + 1.6 * hash(i + seed)) * (0.4 + k);
      line(c, cx + Math.cos(an) * size * 0.2, cy + Math.sin(an) * size * 0.2, cx + Math.cos(an) * L, cy + Math.sin(an) * L, Math.max(size * 0.03, size * 0.05 * a), `rgba(255,245,210,${0.7 * a})`); }
    c.restore();
    c.beginPath(); c.arc(cx, cy, ring, 0, 7); c.lineWidth = Math.max(size * 0.04, size * 0.12 * a); c.strokeStyle = `rgba(230,255,255,${0.75 * a})`; c.stroke();
    c.beginPath(); c.arc(cx, cy, ring * 0.82, 0, 7); c.lineWidth = Math.max(size * 0.02, size * 0.05 * a); c.strokeStyle = `rgba(255,255,255,${0.4 * a})`; c.stroke();
    const rr = mulberry32(seed * 31 + 7);
    for (let i = 0; i < 22; i++) { const an = rr() * 7, d = ring * (0.5 + 0.7 * rr()), br = size * (0.04 + 0.07 * rr()) * (1 - 0.5 * k);
      c.beginPath(); c.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, br, 0, 7); c.lineWidth = Math.max(size * 0.015, br * 0.25); c.strokeStyle = `rgba(235,255,255,${0.8 * a})`; c.stroke(); }
  });
}
// the same flash in the glow layer (call with the same transform; gctx under applyCam is world space)
function ssFlashGlow(cx, cy, k, size) {
  if (k < 0 || k >= 1) return;
  const a = 1 - k;
  softDot(gctx, cx, cy, size * (1.6 + 1.5 * k), '#FFF6D8', 0.9 * a * a);
  softDot(gctx, cx, cy, size * 0.6, '#FFFFFF', a);
}

// ---------------------------------------------------------------- the hiker's snapping hand (world space, on his layer):
// at the wrist W, fingers along `dir` (a unit vector from the elbow), k 0 = cocked (middle finger on the thumb),
// 1 = snapped (middle finger down on the palm). s = scale
function ssSnapHand(c, Wp, dir, k, s, o = {}) {
  const sk = PAL.skin, ln = '#C9805C';
  c.save(); c.translate(Wp[0], Wp[1]); c.rotate(Math.atan2(dir[0], -dir[1])); c.scale(s * (o.flip ? -1 : 1), s);
  const fing = (pts, w) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else c.lineTo(pts[1][0], pts[1][1]);
    c.lineWidth = w; c.strokeStyle = sk; c.lineCap = 'round'; c.stroke(); };
  // the ring and little fingers curled into the palm (behind)
  fing([[14, -62], [24, -46]], 17); fing([[26, -56], [32, -42]], 15);
  // the palm
  rrect(c, -26, -66, 54, 64, 22); c.fillStyle = sk; c.fill();
  // the pointer, up and a little curved
  fing([[-12, -62], [-22, -98], [-20, -122]], 17);
  // the middle finger: on the thumb (cocked) or slammed down onto the palm (snapped)
  const mt = [lerp(-10, 16, k), lerp(-104, -30, k)], mc = [lerp(4, 26, k), lerp(-96, -64, k)];
  fing([[4, -62], mc, mt], 17);
  // the thumb: its tip under the middle finger (cocked), flicked past it (snapped)
  const tt = [lerp(-14, -26, k), lerp(-96, -104, k)];
  fing([[-22, -20], [-40, -60], tt], 19);
  paint(() => {
    // knuckle creases and nails
    line(c, -4, -58, 6, -58, 2.5, ln); line(c, 10, -46, 18, -50, 2.5, ln);
    ellipse(c, -20, -118, 6, 4, '#FFD8C2', 0.2);
    if (k > 0.5) for (let i = 0; i < 3; i++) { const an = -2.6 + i * 0.45; line(c, -16 + Math.cos(an) * 26, -100 + Math.sin(an) * 26, -16 + Math.cos(an) * 42, -100 + Math.sin(an) * 42, 4, 'rgba(255,255,255,0.9)'); }
  });
  c.restore();
}

// sunglasses over his dive mask (head units; c in head space)
function ssShades(c, k) {
  if (k <= 0.01) return;
  c.save(); c.translate(0, -60 * (1 - E.outBack(clamp(k))));
  rrect(c, -58, -30, 54, 34, 12); c.fillStyle = '#121216'; c.fill();
  rrect(c, 4, -30, 54, 34, 12); c.fillStyle = '#121216'; c.fill();
  line(c, -6, -22, 6, -22, 6, '#121216');
  paint(() => { line(c, -48, -22, -30, -22, 4, 'rgba(255,255,255,0.35)'); line(c, 14, -22, 30, -22, 4, 'rgba(255,255,255,0.35)'); });
  c.restore();
}

// ---------------------------------------------------------------- the thermometer against the Sun (screen space).
// x, yTop, yBot: the column; k pops it; level 0..1 the red column; sunK pops the Sun at the top
function ssThermo(x, yTop, yBot, k, level, sunK, t) {
  if (k <= 0.01) return;
  const c = ctx; screenSpace();
  c.save(); const s = E.outBack(clamp(k)); c.translate(x, yBot); c.scale(s, s); c.translate(-x, -yBot);
  const w = 46, by = yBot + 36;
  rrect(c, x - w / 2 - 8, yTop - 8, w + 16, yBot - yTop + 30, w / 2 + 8); c.fillStyle = 'rgba(8,24,40,0.82)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(200,240,255,0.7)'; c.stroke();
  circle(c, x, by, 44, 'rgba(8,24,40,0.82)');
  const ly = lerp(yBot, yTop + 14, clamp(level));
  const g = c.createLinearGradient(0, yBot, 0, yTop); g.addColorStop(0, '#FF5A2E'); g.addColorStop(1, '#FFE36A');
  rrect(c, x - w / 2 + 6, ly, w - 12, yBot - ly + 24, (w - 12) / 2); c.fillStyle = g; c.fill();
  circle(c, x, by, 34, '#FF5A2E');
  softDot(gctx, x, ly, 60, '#FFB060', 0.6 * clamp(level));
  // ticks
  for (let i = 1; i < 10; i++) { const y = lerp(yBot, yTop + 14, i / 10); line(c, x + w / 2 + 2, y, x + w / 2 + (i % 5 ? 14 : 24), y, 3, 'rgba(200,240,255,0.6)'); }
  c.restore();
  if (sunK > 0.01) sunIcon(x, yTop - 46, 34 * E.outBack(clamp(sunK)), t);
}

// ---------------------------------------------------------------- the 1940s submarine (world or screen; facing -x)
function ssSub(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  actor(() => {
    // hull
    c.beginPath(); c.moveTo(-300, 0); c.quadraticCurveTo(-300, -46, -220, -50); c.lineTo(230, -42); c.quadraticCurveTo(300, -36, 330, -6); c.quadraticCurveTo(300, 30, 230, 34);
    c.lineTo(-220, 40); c.quadraticCurveTo(-300, 40, -300, 0); c.closePath(); c.fillStyle = '#4E5C61'; c.fill();
    // the conning tower and the periscope
    c.beginPath(); c.moveTo(-60, -48); c.lineTo(-40, -120); c.lineTo(70, -120); c.lineTo(100, -46); c.closePath(); c.fillStyle = '#56656A'; c.fill();
    line(c, 20, -120, 20, -186, 9, '#3E4A4E'); line(c, 20, -184, 2, -184, 9, '#3E4A4E');
    // the deck rail and the propeller
    line(c, -220, -50, 230, -42, 4, '#3B474B');
    const pr = Math.sin(t * 30); ellipse(c, 340, -4, 8, 26 * Math.abs(pr) + 6, '#2E383B');
  });
  paint(() => {
    for (let i = 0; i < 5; i++) { circle(c, -200 + i * 70, -6, 11, '#2A3336'); circle(c, -200 + i * 70, -6, 7.5, '#FFD978'); }
    c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(230,236,238,0.85)'; c.fillText('1943', 15, -82);
  });
  c.restore();
}

// the sonar scope (screen space): a green round screen with a sweep; noise 0..1 fills it with crackle; k pops it
function ssSonar(x, y, R, k, t, noise, crk) {
  if (k <= 0.01) return;
  const c = ctx; screenSpace();
  c.save(); const s = E.outBack(clamp(k)); c.translate(x, y); c.scale(s, s);
  circle(c, 0, 0, R + 16, '#2B3A33'); circle(c, 0, 0, R + 6, '#10241A'); circle(c, 0, 0, R, '#06140D');
  c.save(); c.beginPath(); c.arc(0, 0, R, 0, 7); c.clip();
  for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(0, 0, R * i / 3.2, 0, 7); c.lineWidth = 2; c.strokeStyle = 'rgba(80,255,150,0.25)'; c.stroke(); }
  line(c, -R, 0, R, 0, 2, 'rgba(80,255,150,0.2)'); line(c, 0, -R, 0, R, 2, 'rgba(80,255,150,0.2)');
  const sa = t * 2.6;
  for (let i = 0; i < 18; i++) { const a = sa - i * 0.035; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, a - 0.04, a); c.closePath(); c.fillStyle = `rgba(90,255,160,${0.22 * (1 - i / 18)})`; c.fill(); }
  line(c, 0, 0, Math.cos(sa) * R, Math.sin(sa) * R, 3, 'rgba(150,255,190,0.9)');
  // the target it is looking for (a blip), then crackle everywhere
  const tb = [R * 0.42, -R * 0.3];
  if (noise < 0.5) { circle(c, tb[0], tb[1], 9, 'rgba(150,255,190,0.9)'); softDot(gctx, x + tb[0] * s, y + tb[1] * s, 26, '#7CFFB0', 0.6 * s); }
  if (noise > 0.01) {
    const n = Math.floor(240 * noise), fr = Math.floor(t * 30);
    for (let i = 0; i < n; i++) { const a = hash(i * 7.1 + fr * 1.3) * 7, d = Math.sqrt(hash(i * 3.3 + fr * 0.7)) * R;
      const rr = 2 + 4 * hash(i + fr); circle(c, Math.cos(a) * d, Math.sin(a) * d, rr, `rgba(160,255,200,${0.5 + 0.5 * hash(i * 1.9 + fr)})`); }
  }
  c.restore();
  // its label
  c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#9CFFC4'; c.fillText('SONAR', 0, R + 46);
  c.restore();
}
