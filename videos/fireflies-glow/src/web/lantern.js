// Inside the firefly's tail (screen units): the lamp as a chamber of glass, the two chemicals in it (the fuel as yellow
// hexagons, the enzyme as violet mouths that hold them), an air pipe that comes in from the left, oxygen as pairs of
// blue beads, a spark and a ring of light for every meeting, and a tap on the pipe for the blink.
'use strict';

const LAN = {
  CX: 590, TOP: 560, TIP: 1200,                                   // the chamber
  PIPE: [[-60, 596], [70, 650], [170, 705], [286, 772]],          // the air pipe: in from the left edge to the chamber's wall
  TAP: [128, 680],                                                 // where its tap sits
  SITES: [[452, 706], [724, 690], [592, 866], [438, 968], [742, 992]],   // the five enzymes
  FREE: [[610, 640], [330, 850], [846, 842], [612, 1066], [560, 742]],   // fuel that has not found one yet
};
const LAN_DELAY = [0.02, 0.34, 0.15, 0.48, 0.26, 0.56, 0.08, 0.42, 0.21, 0.61, 0.31, 0.12, 0.52, 0.38, 0.66];   // each bead's place in the queue
function lanChamber(c) {
  const X = LAN.CX;
  c.beginPath(); c.moveTo(X - 250, LAN.TOP); c.lineTo(X + 250, LAN.TOP); c.quadraticCurveTo(X + 312, LAN.TOP + 4, X + 318, LAN.TOP + 70);
  c.bezierCurveTo(X + 336, LAN.TOP + 360, X + 220, LAN.TIP - 60, X, LAN.TIP);
  c.bezierCurveTo(X - 220, LAN.TIP - 60, X - 336, LAN.TOP + 360, X - 318, LAN.TOP + 70); c.quadraticCurveTo(X - 312, LAN.TOP + 4, X - 250, LAN.TOP); c.closePath();
}
function lanHex(c, x, y, r, col, rot = 0, tail = true) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fillStyle = col; c.fill();
  if (tail) { line(c, r * 0.86, 0, r * 1.5, 0, r * 0.3, col); circle(c, r * 1.62, 0, r * 0.26, col); }
  c.restore();
}
// a point u (0..1) along the pipe, then on to a site
function lanPath(u, site) {
  const P = LAN.PIPE, k = 0.46;
  if (u < k) {
    const v = (u / k) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(v)), f = v - i;
    return [lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f)];
  }
  const f = E.inOutSine((u - k) / (1 - k)), a = P[P.length - 1], b = [site[0] - 30, site[1] - 6];
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f) - 46 * Math.sin(Math.PI * f) * (site[1] > 800 ? -1 : 1)];
}
// o: {adv: how far the oxygen has got (in queue lengths: 0 = nothing has come in yet; a bead lands at 1 + its place),
//     flow: 0..1 (the tap), sparksOn: 0..1, tap: null | 0 (open) .. 1 (shut), names: [k, k, k] pop of the three labels,
//     fuel: 0..1 the chemicals drifting into place, inset: {x, y, r, lit, k} the bug in a round window (screen units),
//     view: {s, x, y} the section is drawn at this scale and offset (screen = s * section + [x, y]),
//     labels: {fuel: [x, y], enzyme: [x, y], air: [x, y]} where the three pills sit (screen units)}
// returns {glow: how bright the chamber is, at: (p) => that section point on screen}
function lanSection(t, o = {}) {
  const c = ctx, adv = o.adv || 0, flow = o.flow === undefined ? 1 : o.flow, son = o.sparksOn === undefined ? 1 : o.sparksOn;
  const V = o.view || { s: 1, x: 0, y: 0 }, at = (p) => [V.s * p[0] + V.x, V.s * p[1] + V.y];
  darkBg('#113630', '#030B0D');
  ctx.setTransform(V.s, 0, 0, V.s, V.x, V.y); gctx.setTransform(V.s / 2, 0, 0, V.s / 2, V.x / 2, V.y / 2);
  // each bead: where it is, and how long since it landed
  const beads = LAN_DELAY.map((d, i) => {
    const site = LAN.SITES[i % 5], q = adv - d;
    if (q <= 0) return { site: i % 5, u: -1, land: 9 };
    const lap = Math.floor(q), u = q - lap;
    return { site: i % 5, u, land: lap >= 1 ? u : 9, p: lanPath(u, site) };
  });
  const spark = LAN.SITES.map((_, j) => son * flow * beads.filter((b) => b.site === j).reduce((m, b) => Math.max(m, Math.exp(-b.land * 13)), 0));
  const glow = clamp(0.06 * flow * (adv > 0.9 ? 1 : 0) + 0.3 * spark.reduce((a, b) => a + b, 0) + 0.5 * son * flow * clamp(adv - 1.05));
  // ---- the air pipe (behind the chamber), with its rings
  const P = LAN.PIPE;
  const pipe = (w, col) => { c.lineCap = 'butt'; c.lineJoin = 'round'; c.lineWidth = w; c.strokeStyle = col; c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.lineTo(P[3][0] + 30, P[3][1] + 16); c.stroke(); };
  pipe(84, '#2F6676'); pipe(54, '#0A2530');
  paint(() => { for (let i = 0; i < 9; i++) { const u = (i + 0.5) / 9 * 0.44, a = lanPath(u, LAN.SITES[0]), b = lanPath(u + 0.01, LAN.SITES[0]), an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; line(c, a[0] - Math.cos(an) * 41, a[1] - Math.sin(an) * 41, a[0] + Math.cos(an) * 41, a[1] + Math.sin(an) * 41, 5, 'rgba(140,214,230,0.35)'); } });
  // ---- the chamber
  lanChamber(c); c.fillStyle = mixHex('#0E2A22', '#5C7A22', 0.75 * glow); c.fill();
  paint(() => {
    c.save(); lanChamber(c); c.clip();
    c.lineWidth = 3; c.strokeStyle = `rgba(190,240,140,${0.07 + 0.08 * glow})`;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const hx = 250 + i * 96 + (j % 2) * 48, hy = 560 + j * 84; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; c.lineTo(hx + Math.cos(a) * 54, hy + Math.sin(a) * 54); } c.closePath(); c.stroke(); }
    c.restore();
    lanChamber(c); c.lineWidth = 12; c.lineJoin = 'round'; c.strokeStyle = mixHex('#5E8A3A', '#E4FF9A', glow); c.stroke();
  });
  if (glow > 0.02) { lanChamber(gctx); gctx.fillStyle = rgba(FF.GLOW, 0.24 * glow); gctx.fill(); }
  // ---- fuel that is still adrift (it thins out as the enzymes take it)
  const fuel = o.fuel === undefined ? 1 : o.fuel;
  LAN.FREE.forEach((p, i) => { const dx = 16 * Math.sin(t * 0.9 + i * 2), dy = 12 * Math.sin(t * 1.2 + i); lanHex(c, p[0] + dx, p[1] + dy, 21, '#FFD447', t * 0.5 + i, true); });
  // ---- the enzymes, each holding one piece of fuel in its mouth
  LAN.SITES.forEach((s, j) => {
    const sp = spark[j], wob = 5 * Math.sin(t * 2.1 + j * 1.9), ex = s[0] + wob, ey = s[1] + 4 * Math.sin(t * 1.7 + j);
    const open = 0.62 - 0.5 * sp, face = Math.PI + 0.25 * Math.sin(j * 2.2);                 // its mouth faces left, toward the pipe
    c.beginPath(); c.moveTo(ex, ey); c.arc(ex, ey, 50, face + open, face - open + Math.PI * 2); c.closePath(); c.fillStyle = mixHex('#B48CFF', '#F1E8FF', 0.4 * sp); c.fill();
    paint(() => { circle(c, ex + 12, ey - 24, 8, '#FFFFFF'); circle(c, ex + 10, ey - 24, 4, '#2A1848'); });
    // the fuel it holds: yellow until the oxygen lands, then spent and grey for a moment
    const dock = [ex - 30 * (0.5 + 0.5 * fuel) - 60 * (1 - fuel), ey + 60 * (1 - fuel) * Math.sin(j * 3)];
    lanHex(c, dock[0], dock[1], 21, mixHex('#FFD447', '#FFFFFF', sp), 0.2 * j, false);
    if (sp > 0.04) {
      // the spark, and a ring of light leaving it
      const r = 40 + 190 * (1 - sp);
      paint(() => { c.lineWidth = 7 * sp + 1; c.strokeStyle = rgba(FF.CORE, 0.85 * sp); c.beginPath(); c.arc(dock[0], dock[1], r, 0, 7); c.stroke(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + j; line(c, dock[0] + Math.cos(a) * 30, dock[1] + Math.sin(a) * 30, dock[0] + Math.cos(a) * (30 + 46 * sp), dock[1] + Math.sin(a) * (30 + 46 * sp), 6 * sp, rgba(FF.CORE, sp)); } });
      softDot(gctx, dock[0], dock[1], 110, FF.CORE, 0.6 * sp);
      gctx.lineWidth = 12 * sp + 1; gctx.strokeStyle = rgba(FF.GLOW, 0.5 * sp); gctx.beginPath(); gctx.arc(dock[0], dock[1], r, 0, 7); gctx.stroke();
    }
  });
  // ---- oxygen: pairs of blue beads, down the pipe and across to an enzyme
  beads.forEach((b, i) => {
    if (b.u < 0 || !b.p) return;
    const a = clamp(b.u * 12) * clamp((1 - b.u) * 14), an = t * 2 + i;
    if (a <= 0.02) return;
    c.globalAlpha = a;
    circle(c, b.p[0] - 9 * Math.cos(an), b.p[1] - 9 * Math.sin(an), 12, '#7FE9FF'); circle(c, b.p[0] + 9 * Math.cos(an), b.p[1] + 9 * Math.sin(an), 12, '#4FC4F2');
    c.globalAlpha = 1;
    softDot(gctx, b.p[0], b.p[1], 30, '#7FE9FF', 0.3 * a);
  });
  // ---- the tap on the pipe
  if (o.tap !== null && o.tap !== undefined) {
    const [tx, ty] = LAN.TAP, an = 0.5 + (Math.PI / 2) * o.tap;      // open: the bar lies along the pipe; shut: across it
    if (o.tap > 0.5) { c.save(); c.translate(tx + 46, ty + 24); c.rotate(0.5); c.fillStyle = '#C9D0E4'; c.fillRect(-8, -44, 16, 88); c.restore(); }   // the gate, down across the bore
    circle(c, tx, ty, 50, '#C9D0E4');
    paint(() => { circle(c, tx, ty, 33, '#8E96A8'); });
    c.save(); c.translate(tx, ty); c.rotate(an); rrect(c, -92, -16, 184, 32, 16); c.fillStyle = o.tap > 0.5 ? '#FF5A6E' : '#4DFFB4'; c.fill(); c.restore();
    circle(c, tx, ty, 13, '#EEF2FA');
  }
  // ---- the labels
  const N = o.names || [0, 0, 0], LB = Object.assign({ fuel: [600, 448], enzyme: [690, 1236], air: [232, 545] }, o.labels || {});
  screenSpace();
  if (N[0] > 0) { leader([LB.fuel[0], LB.fuel[1] + 34], at([LAN.FREE[0][0], LAN.FREE[0][1] - 26]), clamp(N[0] * 1.6), '#FFD447'); pill(LB.fuel[0], LB.fuel[1], 'LUCIFERIN', '#FFD447', N[0], 40); }
  if (N[1] > 0) { leader([LB.enzyme[0], LB.enzyme[1] - 34], at([LAN.SITES[4][0], LAN.SITES[4][1] + 52]), clamp(N[1] * 1.6), '#C8A8FF'); pill(LB.enzyme[0], LB.enzyme[1], 'LUCIFERASE', '#C8A8FF', N[1], 40); }
  if (N[2] > 0) { leader([LB.air[0], LB.air[1] + 34], at([150, 668]), clamp(N[2] * 1.6), '#7FE9FF'); pill(LB.air[0], LB.air[1], 'OXYGEN', '#7FE9FF', N[2], 40); }
  // ---- the bug itself, in a round window, so we know where we are
  const I = o.inset;
  if (I && I.k > 0) {
    const e = E.outBack(clamp(I.k), 1.8);
    c.save(); c.translate(I.x, I.y); c.scale(e, e);
    circle(c, 0, 0, I.r + 8, '#EEF2FA'); circle(c, 0, 0, I.r, '#071A22');
    c.restore();
    c.save(); c.beginPath(); c.arc(I.x, I.y, I.r * e, 0, 7); c.clip();
    ffBug(I.x, I.y - 6, 0.82 * e * I.r / 120, t, { lit: I.lit, tie: true, face: I.face || 'calm', seed: 2, glow: 0.8 });
    c.restore();
    if (I.ring > 0) paint(() => { c.setLineDash([9, 8]); c.lineWidth = 5; c.strokeStyle = rgba('#FFFFFF', 0.9 * I.ring); c.beginPath(); c.arc(I.x, I.y + 58 * I.r / 120, 34 * I.r / 120, 0, 7); c.stroke(); c.setLineDash([]); });
  }
  return { glow, spark, at };
}
