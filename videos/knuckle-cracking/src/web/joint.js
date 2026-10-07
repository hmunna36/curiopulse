// Inside the knuckle: the bones of a hand as an x-ray, a can of soda, the joint in section (two bone ends with
// cartilage, the sealed bag round them, the slippery fluid with gas dissolved in it), a pressure gauge, the bubble,
// and the scan on a monitor with the sound under it.
'use strict';

// ---------------------------------------------------------------- the hand as an x-ray
// Wrist at (0, 0), fingers up. b = where the long bone starts, k = the knuckle, len = the finger bones, a = lean.
const XR_FINGERS = [
  { b: [-58, -26], k: [-112, -84], len: [50, 38], a: -0.8, w: 17 },             // thumb
  { b: [-36, -40], k: [-56, -156], len: [64, 40, 30], a: -0.14, w: 15 },         // first finger
  { b: [-12, -44], k: [-15, -168], len: [72, 46, 32], a: -0.02, w: 15.5 },       // middle
  { b: [12, -42], k: [25, -159], len: [66, 42, 30], a: 0.09, w: 15 },            // ring
  { b: [34, -34], k: [60, -138], len: [50, 32, 26], a: 0.22, w: 13.5 },          // little
];
function xrBone(c, a, b, w, col, core) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, g = 3.2;
  const p = [a[0] + ux * g, a[1] + uy * g], q = [b[0] - ux * g, b[1] - uy * g];
  line(c, p[0], p[1], q[0], q[1], w * 0.72, col);
  circle(c, p[0] + ux * w * 0.3, p[1] + uy * w * 0.3, w * 0.56, col); circle(c, q[0] - ux * w * 0.3, q[1] - uy * w * 0.3, w * 0.52, col);
  if (core) line(c, p[0] + ux * w * 0.9, p[1] + uy * w * 0.9, q[0] - ux * w * 0.9, q[1] - uy * w * 0.9, w * 0.26, core);
}
// the joints of a finger: [[x, y] ...] from the knuckle to the tip. curl bends it toward the palm (drawn as a lean)
function xrChain(f, curl = 0) {
  const pts = [f.k.slice()];
  let a = f.a, p = f.k;
  for (const L of f.len) { a += curl; p = [p[0] + Math.sin(a) * L, p[1] - Math.cos(a) * L]; pts.push(p); }
  return pts;
}
// o: {flip, soft 0..1 (the flesh round the bones), alpha, hot: [finger index, 0..1] (a ring on that knuckle), curl}
function xrHand(c, g, x, y, s, o = {}) {
  const al = o.alpha === undefined ? 1 : o.alpha, soft = o.soft === undefined ? 0.6 : o.soft;
  const BONE = `rgba(228,241,255,${0.95 * al})`, CORE = `rgba(120,165,220,${0.5 * al})`;
  const out = { mcp: [] };
  for (const cc of [c, g]) {
    if (!cc) continue;
    cc.save(); cc.translate(x, y); cc.scale(o.flip ? -s : s, s);
    const isG = cc === g;
    if (!isG && soft > 0.01) {                     // the flesh: a faint glove round the bones
      cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = `rgba(90,170,255,${0.16 * soft * al})`;
      for (const f of XR_FINGERS) {
        const pts = xrChain(f, o.curl || 0);
        cc.lineWidth = f.w * 2.5; cc.beginPath(); cc.moveTo(f.b[0], f.b[1]); cc.lineTo(f.k[0], f.k[1]); for (const p of pts.slice(1)) cc.lineTo(p[0], p[1]); cc.stroke();
      }
      cc.fillStyle = `rgba(90,170,255,${0.16 * soft * al})`; cc.beginPath(); cc.ellipse(-4, -84, 76, 86, 0, 0, 7); cc.fill();
      rrect(cc, -46, -20, 92, 150, 30); cc.fill();
    }
    const bone = isG ? `rgba(127,220,255,${0.11 * al})` : BONE, core = isG ? null : CORE;
    // forearm ends and the small bones of the wrist
    xrBone(cc, [-20, 150], [-22, 26], 30, bone, core); xrBone(cc, [22, 150], [20, 28], 24, bone, core);
    for (const [bx, by, br] of [[-34, 2, 13], [-10, 6, 13], [14, 6, 12], [34, 0, 11], [-26, -18, 11], [-4, -22, 12], [20, -20, 11]]) circle(cc, bx, by, br, bone);
    for (const f of XR_FINGERS) {
      xrBone(cc, f.b, f.k, f.w, bone, core);
      const pts = xrChain(f, o.curl || 0);
      for (let i = 1; i < pts.length; i++) xrBone(cc, pts[i - 1], pts[i], f.w * (1 - 0.09 * i), bone, core);
    }
    cc.restore();
  }
  for (const f of XR_FINGERS) out.mcp.push([x + (o.flip ? -1 : 1) * f.k[0] * s, y + f.k[1] * s]);
  return out;
}

// ---------------------------------------------------------------- a can of soda
// Upright, centre (x, y), about 60 x 104 at s = 1. o: {tab 0..1 (it is pulled up), fizz 0..1, rot, age (s since it opened)}
function sodaCan(c, g, x, y, s, t, o = {}) {
  const tab = clamp(o.tab || 0), fizz = clamp(o.fizz || 0);
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  // body
  const bg = c.createLinearGradient(-30, 0, 30, 0);
  bg.addColorStop(0, '#FF8A4A'); bg.addColorStop(0.3, '#FF5A2E'); bg.addColorStop(0.8, '#D8341A'); bg.addColorStop(1, '#9E1F10');
  rrect(c, -30, -46, 60, 96, 10); c.fillStyle = bg; c.fill();
  c.save(); rrect(c, -30, -46, 60, 96, 10); c.clip();
  c.fillStyle = '#FFF3D6'; c.beginPath(); c.moveTo(-30, 2); c.quadraticCurveTo(-8, -22, 8, 0); c.quadraticCurveTo(22, 18, 30, -4); c.lineTo(30, 16); c.quadraticCurveTo(20, 34, 6, 18); c.quadraticCurveTo(-10, -2, -30, 22); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-22, -46, 7, 96);
  c.restore();
  // rims
  rrect(c, -27, -52, 54, 10, 4); c.fillStyle = '#C9D2E0'; c.fill(); rrect(c, -27, 46, 54, 8, 4); c.fillStyle = '#9BA5B8'; c.fill();
  ellipse(c, 0, -52, 25, 6.5, '#E6ECF5');
  // the opening and the tab
  ellipse(c, 6, -52, 8, 3.2, tab > 0.5 ? '#141018' : '#B4BECE');
  c.save(); c.translate(-8, -53); c.rotate(-1.15 * E.outBack(tab, 1.6));
  rrect(c, -3, -4.5, 22, 9, 4); c.fillStyle = '#AEB8C8'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#7C8698'; c.stroke();
  ellipse(c, 13, 0, 3.4, 2, '#7C8698');
  c.restore();
  c.lineWidth = 2.5; c.strokeStyle = 'rgba(40,10,6,0.55)'; rrect(c, -30, -46, 60, 96, 10); c.stroke();
  c.restore();
  if (g) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s); rrect(g, -30, -46, 60, 96, 10); g.fillStyle = 'rgba(255,110,50,0.3)'; g.fill(); g.restore(); }
  // the fizz: a spray out of the opening, and bubbles that rise
  if (fizz > 0.01) {
    const age = o.age || 0, rng = mulberry32(31);
    const ox = x + 6 * s, oy = y - 54 * s;
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI / 2 + (rng() - 0.5) * 1.5, v = (150 + rng() * 330) * s, life = 0.45 + rng() * 0.5, d = (age * (0.8 + rng() * 0.6) + rng() * 0.5) % life;
      const px = ox + Math.cos(a) * v * d, py = oy + Math.sin(a) * v * d + 260 * s * d * d, r = (2.2 + rng() * 4.6) * s, al = fizz * (1 - d / life);
      circle(c, px, py, r, `rgba(255,250,235,${0.9 * al})`);
      if (g) softDot(g, px, py, r * 3, '#FFE9C0', 0.5 * al);
    }
    for (let i = 0; i < 5; i++) {
      const p = ((age * 0.9 + i / 5) % 1), bx = ox + (i - 2) * 9 * s + 8 * s * Math.sin(p * 9 + i), by = oy - p * 150 * s, r = (5 + 3 * (i % 3)) * s;
      c.lineWidth = 2.2 * s; c.strokeStyle = `rgba(255,255,255,${0.85 * fizz * Math.sin(Math.PI * p)})`; c.beginPath(); c.arc(bx, by, r, 0, 7); c.stroke();
    }
  }
}

// ---------------------------------------------------------------- the joint in section
// Drawn sideways: the long bone of the hand comes in from the left and ends in a round head; the first finger bone
// comes in from the right and ends in a shallow cup. Local units; (0, 0) is the middle of the joint space at rest.
const JT = { R: 112, gap: 16, pull: 96 };
let JT_DOTS = null, JT_TEX = null;
function initJoint() {
  const rng = mulberry32(41);
  // dissolved gas: dots that live in the fluid. zone 0 = the pocket above, 1 = the pocket below, 2 = the gap
  JT_DOTS = [...Array(54)].map((_, i) => ({ z: i % 9 === 8 ? 2 : i % 2, u: rng(), v: rng(), ph: rng() * 6.28, r: 3 + rng() * 3.2 }));
  // spongy bone: speckles
  JT_TEX = [...Array(150)].map(() => [rng(), rng(), 2 + rng() * 5]);
}
// geometry for an opening o (0 = at rest, 1 = pulled apart): returns the shapes' key numbers (local)
function jtGeo(open) {
  const sh = JT.pull * clamp(open, 0, 1.2);                 // the finger bone slides right by sh
  const hc = [-JT.gap / 2 - JT.R, 0];                       // the head's centre
  return { sh, hc, gapL: -JT.gap / 2, gapR: JT.gap / 2 + sh, mid: [sh / 2, 0], cup: [hc[0] + sh, 0], rc: JT.R + JT.gap };
}
function jtBonePath(c, G, which) {
  c.beginPath();
  if (which === 'head') {
    c.moveTo(-900, -66); c.lineTo(G.hc[0] - 70, -66);
    c.quadraticCurveTo(G.hc[0] - 40, -70, G.hc[0] - 22, -104);
    c.arc(G.hc[0], 0, JT.R, -1.78, 1.78);
    c.quadraticCurveTo(G.hc[0] - 40, 70, G.hc[0] - 70, 66);
    c.lineTo(-900, 66); c.closePath();
  } else {
    const cx = G.cup[0], r = G.rc, a = 0.86;                 // the cup follows the head's curve
    const x0 = cx + Math.cos(a) * r, y0 = Math.sin(a) * r;
    c.moveTo(900, -58); c.lineTo(x0 + 110, -58);
    c.quadraticCurveTo(x0 + 50, -64, x0 + 6, -y0 - 6);
    c.quadraticCurveTo(x0 - 8, -y0 + 2, x0, -y0 + 14);
    c.arc(cx, 0, r, -a + 0.1, a - 0.1);
    c.quadraticCurveTo(x0 - 8, y0 - 2, x0 + 6, y0 + 6);
    c.quadraticCurveTo(x0 + 50, 64, x0 + 110, 58);
    c.lineTo(900, 58); c.closePath();
  }
}
// the bag round the joint (its inner wall): a closed path through the fluid's outline
function jtBagPath(c, G, bulge = 0) {
  const top = -168 - 14 * bulge + 30 * clamp(G.sh / JT.pull), xl = G.hc[0] - 96, xr = G.cup[0] + G.rc + 96;
  c.beginPath();
  c.moveTo(xl, -62);
  c.bezierCurveTo(xl + 30, top - 10, G.mid[0] - 90, top, G.mid[0], top);
  c.bezierCurveTo(G.mid[0] + 90, top, xr - 30, top - 6, xr, -56);
  c.lineTo(xr, 56);
  c.bezierCurveTo(xr - 30, -top + 6, G.mid[0] + 90, -top, G.mid[0], -top);
  c.bezierCurveTo(G.mid[0] - 90, -top, xl + 30, -top + 10, xl, 62);
  c.closePath();
}
// a dot of dissolved gas: where it sits for this opening
function jtDotPos(d, G, t, gather = 0) {
  let x, y;
  if (d.z === 2) { x = lerp(G.gapL - 2, G.gapR + 2, d.u); y = lerp(-74, 74, d.v); x += (JT.R - Math.sqrt(Math.max(0, JT.R * JT.R - y * y))) * -1 + 0; }
  else {
    const sgn = d.z === 0 ? -1 : 1, top = 150 - 26 * clamp(G.sh / JT.pull);
    x = lerp(G.hc[0] - 40, G.cup[0] + G.rc + 30, d.u); y = sgn * lerp(96, top, d.v) - sgn * 22 * Math.pow(Math.abs((d.u - 0.5) * 2), 2);
  }
  x += 5 * Math.sin(t * 1.3 + d.ph); y += 4 * Math.cos(t * 1.1 + d.ph * 1.7);
  return [lerp(x, G.mid[0], gather), lerp(y, 0, gather)];
}
// o: {open, seal 0..1 (the bag's outline draws on), fluid 0..1 (it lights up), gas 0..1 (the dots show),
//     gather 0..1 (they run to the middle), bub 0..1.3 (the bubble's size), slide (the finger bone's glide, units),
//     tissue 0..1, dim 0..1}
function jointSection(c, g, x, y, s, t, o = {}) {
  const G = jtGeo(o.open || 0), seal = o.seal === undefined ? 1 : clamp(o.seal), fl = o.fluid === undefined ? 1 : clamp(o.fluid);
  const slide = o.slide || 0, rot = o.rot || 0;
  for (const cc of [c, g]) {
    if (!cc) continue;
    const isG = cc === g;
    cc.save(); cc.translate(x, y); cc.rotate(rot); cc.scale(s, s);
    if (!isG) {
      // the finger round it: flesh, and skin at the edges
      const tg = cc.createLinearGradient(0, -338, 0, 338);
      tg.addColorStop(0, '#E8A784'); tg.addColorStop(0.07, '#8E3F52'); tg.addColorStop(0.5, '#5E2440'); tg.addColorStop(0.93, '#8E3F52'); tg.addColorStop(1, '#E8A784');
      cc.fillStyle = tg; cc.fillRect(-900, -338, 1800, 676);
      cc.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 9; i++) cc.fillRect(-900, -300 + i * 74, 1800, 3);
      // a vein and an artery run along each side, with blood moving in them
      for (const sd of [-1, 1]) for (const [y0, amp, col, wv] of [[246, 16, 'rgba(226,84,112,0.55)', 90], [296, 12, 'rgba(110,128,226,0.5)', 70]]) {
        cc.beginPath();
        for (let xx = -900; xx <= 900; xx += 30) { const yy = sd * (y0 + amp * Math.sin(xx / wv + sd)); if (xx === -900) cc.moveTo(xx, yy); else cc.lineTo(xx, yy); }
        cc.lineWidth = 11; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = col; cc.stroke();
        for (let i = 0; i < 9; i++) {
          const xx = ((t * 70 * (y0 > 260 ? -1 : 1) + i * 200) % 1800 + 1800) % 1800 - 900;
          circle(cc, xx, sd * (y0 + amp * Math.sin(xx / wv + sd)), 4, 'rgba(255,235,240,0.5)');
        }
      }
    }
    // the fluid fills the bag (the bones are drawn over it)
    jtBagPath(cc, G, 0);
    if (isG) { cc.fillStyle = `rgba(255,196,80,${0.03 + 0.07 * fl})`; cc.fill(); }
    else {
      const fg = cc.createRadialGradient(G.mid[0], 0, 20, G.mid[0], 0, 300);
      fg.addColorStop(0, mixHex('#9A6A26', '#FFC436', fl)); fg.addColorStop(1, mixHex('#6E4420', '#E2861C', fl));
      cc.fillStyle = fg; cc.fill();
      // gloss: slow streaks that slide along the fluid
      cc.save(); jtBagPath(cc, G, 0); cc.clip();
      for (let i = 0; i < 5; i++) {
        const px = G.mid[0] - 260 + ((t * 46 + i * 130) % 560), py = (i % 2 ? 1 : -1) * (112 + 12 * (i % 3));
        cc.fillStyle = `rgba(255,244,200,${0.34 * fl})`; cc.beginPath(); cc.ellipse(px, py, 46, 6, 0, 0, 7); cc.fill();
      }
      cc.restore();
    }
    if (!isG) {
      // the bones
      for (const which of ['head', 'cup']) {
        cc.save(); if (which === 'cup') cc.translate(0, slide);
        jtBonePath(cc, G, which);
        const bgd = cc.createLinearGradient(0, -110, 0, 110); bgd.addColorStop(0, '#FFF6E2'); bgd.addColorStop(0.5, '#F1E3C6'); bgd.addColorStop(1, '#D9C6A2');
        cc.fillStyle = bgd; cc.fill();
        cc.save(); jtBonePath(cc, G, which); cc.clip();
        for (const [u, v, r] of JT_TEX) {
          const px = which === 'head' ? G.hc[0] + JT.R - u * 700 : G.cup[0] + G.rc - 20 + u * 700, py = (v - 0.5) * 190;
          cc.fillStyle = 'rgba(190,160,110,0.26)'; cc.beginPath(); cc.arc(px, py, r, 0, 7); cc.fill();
        }
        cc.restore();
        cc.lineWidth = 8; cc.strokeStyle = '#8F7650'; cc.lineJoin = 'round'; jtBonePath(cc, G, which); cc.stroke();
        // cartilage: a smooth blue-white cap on each end
        cc.lineCap = 'round'; cc.lineWidth = 17; cc.strokeStyle = '#BDEBFA';
        cc.beginPath();
        if (which === 'head') cc.arc(G.hc[0], 0, JT.R - 5, -1.2, 1.2); else cc.arc(G.cup[0], 0, G.rc + 5, -0.72, 0.72);
        cc.stroke();
        cc.lineWidth = 5; cc.strokeStyle = 'rgba(255,255,255,0.75)';
        cc.beginPath();
        if (which === 'head') cc.arc(G.hc[0], 0, JT.R - 1, -1.0, -0.2); else cc.arc(G.cup[0], 0, G.rc + 9, 0.15, 0.62);
        cc.stroke();
        cc.restore();
      }
    }
    // the bag's wall
    if (seal > 0.01) {
      cc.save();
      jtBagPath(cc, G, 0);
      cc.lineJoin = 'round'; cc.lineCap = 'round';
      const L = 2300;
      cc.setLineDash([L * seal, L]);
      if (isG) { cc.lineWidth = 20; cc.strokeStyle = `rgba(255,140,170,${0.3 + 0.3 * (o.sealGlow || 0)})`; cc.stroke(); }
      else { cc.lineWidth = 15; cc.strokeStyle = '#E9728E'; cc.stroke(); cc.lineWidth = 5; cc.strokeStyle = '#FFB9C8'; cc.stroke(); }
      cc.setLineDash([]);
      cc.restore();
      if (seal < 0.995 && seal > 0.02) {             // the spark at the head of the line
        const top = -168 + 30 * clamp(G.sh / JT.pull), a = seal * Math.PI * 2 - Math.PI * 0.82;
        const px = G.mid[0] + Math.cos(a) * 190, py = Math.sin(a) * Math.abs(top) * 0.98;
        if (isG) softDot(cc, px, py, 70, '#FFD0DC', 0.9); else circle(cc, px, py, 13, '#FFFFFF');
      }
    }
    // dissolved gas
    const gas = clamp(o.gas || 0), gather = clamp(o.gather || 0);
    if (gas > 0.01) for (const d of JT_DOTS) {
      const [px, py] = jtDotPos(d, G, t, gather), tw = 0.6 + 0.4 * Math.sin(t * 5 + d.ph * 3), al = gas * tw * (1 - 0.85 * gather);
      if (isG) softDot(cc, px, py, d.r * 3.2, '#BFF0FF', 0.5 * al);
      else { circle(cc, px, py, d.r, `rgba(235,252,255,${0.95 * al})`); cc.lineWidth = 1.6; cc.strokeStyle = `rgba(40,110,150,${0.7 * al})`; cc.beginPath(); cc.arc(px, py, d.r, 0, 7); cc.stroke(); }
    }
    // the bubble: there, where a moment ago there was only fluid
    const bub = o.bub || 0;
    if (bub > 0.01) {
      const br = Math.min(64, 22 + G.sh * 0.46) * bub, bx = G.mid[0], by = 0, wob = 1 + 0.05 * Math.sin(t * 9);
      if (isG) softDot(cc, bx, by, br * 1.8, '#DFF8FF', 0.34);
      else {
        cc.save(); cc.translate(bx, by); cc.scale(wob, 2 - wob);
        const rg = cc.createRadialGradient(-br * 0.3, -br * 0.35, br * 0.1, 0, 0, br);
        rg.addColorStop(0, 'rgba(255,255,255,0.98)'); rg.addColorStop(0.35, 'rgba(214,246,255,0.92)'); rg.addColorStop(1, 'rgba(120,205,235,0.9)');
        cc.fillStyle = rg; cc.beginPath(); cc.arc(0, 0, br, 0, 7); cc.fill();
        cc.lineWidth = 5; cc.strokeStyle = '#2A7FA6'; cc.stroke();
        cc.fillStyle = 'rgba(255,255,255,0.95)'; cc.beginPath(); cc.ellipse(-br * 0.36, -br * 0.4, br * 0.2, br * 0.12, -0.6, 0, 7); cc.fill();
        cc.restore();
      }
    }
    cc.restore();
  }
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const P = (p) => [x + (p[0] * cr - p[1] * sr) * s, y + (p[0] * sr + p[1] * cr) * s];
  const top = -168 + 30 * clamp(G.sh / JT.pull);
  return { G, P, mid: P(G.mid), wall: P([G.mid[0] + 30, top]), wall2: P([G.mid[0] + 30, -top]), pocket: P([G.mid[0] - 50, -126]), pocket2: P([G.mid[0] - 50, 126]), head: P(G.hc), cup: P([G.cup[0] + G.rc + 60, 0]) };
}

// a fat arrow (under the camera): (x, y) = its middle, ang = where it points (0 = right), k = pop-in
function bigArrow(x, y, s, ang, k, col = '#FFD447') {
  if (k <= 0.01) return;
  const c = ctx, e = E.outBack(clamp(k), 1.8);
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s * e, s * e);
  c.beginPath(); c.moveTo(-70, -26); c.lineTo(16, -26); c.lineTo(16, -60); c.lineTo(92, 0); c.lineTo(16, 60); c.lineTo(16, 26); c.lineTo(-70, 26); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = '#0B0B1A'; c.stroke();
  c.restore();
}

// ---------------------------------------------------------------- a pressure gauge (screen space)
// lvl 1 = high (needle on the right, green), 0 = low (on the left, red)
function pressureGauge(x, y, r, k, lvl, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 14, '#0B0B1A'); circle(ctx, 0, 0, r + 8, '#C9D2E0'); circle(ctx, 0, 0, r, '#0E1830');
  // the scale: red on the left, green on the right
  ctx.lineCap = 'butt'; ctx.lineWidth = r * 0.2;
  const A0 = Math.PI * 0.8, A1 = Math.PI * 2.2, n = 5;
  for (let i = 0; i < n; i++) { ctx.strokeStyle = ['#FF5A6E', '#FF9A3C', '#FFD447', '#9BE86A', '#4DFFB4'][i]; ctx.beginPath(); ctx.arc(0, 0, r * 0.74, A0 + (A1 - A0) * (i / n) + 0.02, A0 + (A1 - A0) * ((i + 1) / n) - 0.02); ctx.stroke(); }
  const a = lerp(A0 + 0.14, A1 - 0.14, clamp(lvl) + 0.012 * Math.sin(t * 31));
  ctx.lineCap = 'round'; line(ctx, 0, 0, Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, r * 0.085, '#FFFFFF');
  circle(ctx, 0, 0, r * 0.13, '#FFFFFF'); circle(ctx, 0, 0, r * 0.06, '#0E1830');
  ctx.font = `900 ${r * 0.24}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#DCE6FF'; ctx.fillText('PRESSURE', 0, r * 0.5);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, r * 1.5, lvl < 0.4 ? '#FF5A6E' : '#4DFFB4', 0.22 * clamp(k)); gctx.restore();
}

// ---------------------------------------------------------------- the scan on a monitor
// the joint the way an MRI shows it: greys, a bright sliver of fluid, and the bubble as a black hole
function mriJoint(c, cx, cy, s, open, bub, t) {
  const G = jtGeo(open);
  c.save(); c.translate(cx, cy); c.scale(s, s);
  // the finger: grey flesh, a brighter rim of skin and fat
  const tg = c.createLinearGradient(0, -250, 0, 250);
  tg.addColorStop(0, '#9AA0A8'); tg.addColorStop(0.08, '#3C4048'); tg.addColorStop(0.5, '#2A2D34'); tg.addColorStop(0.92, '#3C4048'); tg.addColorStop(1, '#9AA0A8');
  c.fillStyle = tg; c.fillRect(-900, -250, 1800, 500);
  // fluid: bright
  jtBagPath(c, G, 0); c.fillStyle = '#C9CED6'; c.fill();
  for (const which of ['head', 'cup']) {
    jtBonePath(c, G, which);
    const bg = c.createLinearGradient(0, -100, 0, 100); bg.addColorStop(0, '#5A5F68'); bg.addColorStop(0.5, '#8C929C'); bg.addColorStop(1, '#5A5F68');
    c.fillStyle = bg; c.fill(); c.lineWidth = 12; c.strokeStyle = '#17191E'; c.lineJoin = 'round'; c.stroke();
  }
  if (bub > 0.01) {
    const br = Math.min(60, 20 + G.sh * 0.46) * bub;
    c.fillStyle = '#020203'; c.beginPath(); c.ellipse(G.mid[0], 0, br * 0.92, br * 1.12, 0, 0, 7); c.fill();
    c.lineWidth = 3; c.strokeStyle = 'rgba(235,240,250,0.8)'; c.stroke();
  }
  c.restore();
}
// The monitor (screen space). o: {clip 0..1 (how far the pull has gone), bub, head 0..1 (the playhead along the
// sound strip), spike 0..1 (where the crack sits on the strip), hit 0..1 (the spike is drawn), tags 0..1, frame}
const MRI = { x: 78, y: 440, w: 924, h: 640 };
function mriMonitor(t, o = {}) {
  const c = ctx, { x, y, w, h } = MRI;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  rrect(c, x - 18, y - 18, w + 36, h + 36, 34); c.fillStyle = '#05070D'; c.fill();
  rrect(c, x - 10, y - 10, w + 20, h + 20, 28); c.fillStyle = '#1A2030'; c.fill();
  rrect(c, x, y, w, h, 18); c.fillStyle = '#04060B'; c.fill();
  // the picture
  const ih = 414;
  c.save(); rrect(c, x + 10, y + 56, w - 20, ih, 10); c.clip();
  c.fillStyle = '#0B0D12'; c.fillRect(x, y, w, h);
  mriJoint(c, x + w / 2 - 20, y + 56 + ih / 2, 1.2, 0.86 * clamp(o.clip || 0), o.bub || 0, t);
  // grain and scan lines
  const fr = Math.floor(t * 15), rng = mulberry32(700 + fr);
  for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${0.04 + 0.1 * rng()})`; c.fillRect(x + 10 + rng() * (w - 20), y + 56 + rng() * ih, 2 + rng() * 3, 2); }
  c.fillStyle = 'rgba(0,0,0,0.16)'; for (let yy = y + 56; yy < y + 56 + ih; yy += 6) c.fillRect(x, yy, w, 2);
  if (o.flash > 0.01) { c.fillStyle = `rgba(255,255,255,${0.5 * o.flash})`; c.fillRect(x, y, w, h); }
  c.restore();
  // header
  c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#7FE9FF'; c.fillText('MRI · LIVE', x + 26, y + 30);
  circle(c, x + w - 150, y + 30, 9, Math.floor(t * 2.5) % 2 ? '#FF5A6E' : '#5A1522');
  c.font = '800 26px Montserrat'; c.fillStyle = '#DCE6FF'; c.fillText('REC', x + w - 130, y + 31);
  c.textAlign = 'center'; c.font = '800 24px Montserrat'; c.fillStyle = 'rgba(220,230,255,0.62)'; c.fillText('after Kawchuk et al. 2015', x + w / 2 - 6, y + 31); c.textAlign = 'left';
  // the sound strip
  const sy0 = y + 56 + ih + 18, sh = h - 56 - ih - 30, sx0 = x + 150, sw = w - 176, mid = sy0 + sh / 2;
  rrect(c, x + 10, sy0, w - 20, sh, 10); c.fillStyle = '#0A1220'; c.fill();
  c.font = '900 26px Montserrat'; c.fillStyle = '#FFD447'; c.fillText('SOUND', x + 28, mid + 1);
  const head = clamp(o.head || 0), spike = o.spike === undefined ? 0.7 : o.spike;
  c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = '#FFD447'; c.beginPath();
  const N = 180;
  for (let i = 0; i <= N * head; i++) {
    const u = i / N, d = u - spike;
    let a = 2.2 * Math.sin(u * 90) * (0.6 + 0.4 * Math.sin(u * 23));
    if (d >= 0) a += Math.exp(-d * 46) * Math.cos(d * 330) * (sh * 0.46) * clamp(o.hit === undefined ? 1 : o.hit);
    const px = sx0 + u * sw, py = mid - a;
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.stroke();
  const hx = sx0 + head * sw;
  line(c, hx, sy0 + 8, hx, sy0 + sh - 8, 3, 'rgba(127,233,255,0.9)');
  c.restore();
  // the monitor's light
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  rrect(gctx, x, y, w, h, 18); gctx.fillStyle = 'rgba(110,150,200,0.16)'; gctx.fill();
  gctx.restore();
  return { bubble: [x + w / 2 - 20 + jtGeo(0.86 * clamp(o.clip || 0)).mid[0] * 1.2, y + 56 + ih / 2], spikeX: sx0 + spike * sw, stripY: mid, stripTop: sy0, imgBottom: y + 56 + ih };
}

// ---------------------------------------------------------------- the experiment: a hand scanner, and a cable that pulls one finger
// A small scanner for hands (he stands beside it with his arm in its side). World coords under the camera.
const MR = { hx: 356, hy: 1318, hs: 1.25, x: 640, y: 568, w: 388, h: 690, hole: [617, 846], win: [676, 868, 316, 212], winch: [912, 540] };
const HOSPAL = Object.assign({}, PAL, { coat: '#8EDDD0', coatSh: '#58AFA4', coatHi: '#C9F5EE', coatDk: '#3F8D83', pj: true, pants: '#7CCFC2', pantsSh: '#58AFA4', shoe: '#F4F0E6', shoeSh: '#C9CCD6' });
function mriRoomBack(cam, t) {
  const c = ctx;
  applyCam(cam);
  const g = c.createLinearGradient(0, 300, 0, 1260); g.addColorStop(0, '#14283A'); g.addColorStop(0.6, '#1E3F55'); g.addColorStop(1, '#17303F');
  c.fillStyle = g; c.fillRect(-300, -300, W + 600, 1560);
  for (let x = -300; x < W + 300; x += 150) { c.fillStyle = 'rgba(160,220,255,0.035)'; c.fillRect(x, -300, 4, 1560); }
  c.fillStyle = 'rgba(160,220,255,0.05)'; c.fillRect(-300, 980, W + 600, 5);
  // floor
  const fg = c.createLinearGradient(0, 1258, 0, 1920); fg.addColorStop(0, '#22384A'); fg.addColorStop(1, '#0C1620');
  c.fillStyle = fg; c.fillRect(-300, 1258, W + 600, 900);
  c.fillStyle = 'rgba(190,230,255,0.08)'; c.fillRect(-300, 1258, W + 600, 5);
  // a ceiling lamp's cone
  softDot(c, 420, 560, 560, '#CFEFFF', 0.13);
  // warning sign on the wall
  c.save(); c.translate(250, 600); c.rotate(-0.03);
  rrect(c, -92, -58, 184, 116, 12); c.fillStyle = '#FFD447'; c.fill(); c.lineWidth = 7; c.strokeStyle = '#0B0B1A'; c.stroke();
  c.font = '400 54px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#0B0B1A'; c.fillText('MAGNET', 0, -6);
  c.font = '900 22px Montserrat'; c.fillText('NO METAL', 0, 34);
  c.restore();
  // the scanner's side face, with the hole his arm goes into
  c.beginPath(); c.moveTo(MR.x - 46, MR.y + 30); c.lineTo(MR.x + 2, MR.y); c.lineTo(MR.x + 2, MR.y + MR.h); c.lineTo(MR.x - 46, MR.y + MR.h - 16); c.closePath();
  c.fillStyle = '#AEB9CB'; c.fill();
  ellipse(c, MR.hole[0], MR.hole[1], 22, 86, '#7C8698'); ellipse(c, MR.hole[0] + 2, MR.hole[1], 16, 76, '#070A12');
}
// the scanner's front (drawn over his arm): the body, a window on his hand, the winch on top. pull 0..1, turn = the crank's angle
function mriFront(cam, t, o = {}) {
  const c = ctx, pull = clamp(o.pull || 0), jit = (o.jit || 0);
  applyCam(cam);
  // body
  const bg = c.createLinearGradient(MR.x, 0, MR.x + MR.w, 0); bg.addColorStop(0, '#F4F7FB'); bg.addColorStop(0.7, '#E2E8F1'); bg.addColorStop(1, '#C6CFDD');
  rrect(c, MR.x, MR.y, MR.w + 60, MR.h, 40); c.fillStyle = bg; c.fill();
  c.fillStyle = '#1CB3A4'; c.fillRect(MR.x, MR.y + 232, MR.w + 60, 16);
  c.fillStyle = 'rgba(20,40,60,0.12)'; c.fillRect(MR.x, MR.y + MR.h - 60, MR.w + 60, 60);
  // the name plate and its lamp
  c.font = '400 108px Anton'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#1B2A40'; c.fillText('MRI', MR.x + 44, MR.y + 128);
  const lampOn = Math.floor(t * 3) % 2;
  circle(c, MR.x + 290, MR.y + 86, 17, lampOn ? '#FF5A6E' : '#6A2430'); if (lampOn) softDot(gctx, MR.x + 290, MR.y + 86, 60, '#FF5A6E', 0.6);
  c.font = '900 26px Montserrat'; c.fillStyle = '#5A6880'; c.fillText('REC', MR.x + 318, MR.y + 88);
  for (let i = 0; i < 3; i++) circle(c, MR.x + 286 + i * 34, MR.y + 160, 9, i === Math.floor(t * 4) % 3 ? '#4DFFB4' : '#9BA9BF');
  // the window: his hand inside, as the scanner sees it, and the cable on one finger
  const [wx, wy, ww, wh] = MR.win;
  rrect(c, wx - 10, wy - 10, ww + 20, wh + 20, 26); c.fillStyle = '#8E99B3'; c.fill();
  rrect(c, wx, wy, ww, wh, 18); c.fillStyle = '#041225'; c.fill();
  c.save(); rrect(c, wx, wy, ww, wh, 18); c.clip();
  const wg = c.createRadialGradient(wx + ww / 2, wy + wh / 2, 10, wx + ww / 2, wy + wh / 2, 220); wg.addColorStop(0, '#0E3A62'); wg.addColorStop(1, '#03101F'); c.fillStyle = wg; c.fillRect(wx, wy, ww, wh);
  // the hand lies on its side, fingers to the right; the first finger is in a loop
  const hs = 0.62, hx0 = wx + 6 + 5 * pull + jit, hy0 = wy + wh / 2 + 14;
  c.save(); c.translate(hx0, hy0); c.rotate(Math.PI / 2);
  xrHand(c, null, 0, 0, hs, { soft: 0.8 });
  c.restore();
  const f = XR_FINGERS[1], tip = xrChain(f).pop();
  const tx = hx0 - tip[1] * hs, ty = hy0 + tip[0] * hs;                         // local (x, y) -> (-y, x) after the quarter turn
  c.lineCap = 'round'; c.lineWidth = 7; c.strokeStyle = '#FFD447';
  c.beginPath(); c.arc(tx - 12, ty, 15, 0, 7); c.stroke();                       // the loop
  const sag = (1 - pull) * 26;
  c.beginPath(); c.moveTo(tx + 3, ty); c.quadraticCurveTo((tx + wx + ww) / 2, ty + sag + 3 * Math.sin(t * 40) * pull, wx + ww + 4, ty - 4); c.lineWidth = 5; c.stroke();
  const sy = wy + ((t * 0.8) % 1) * wh; c.fillStyle = 'rgba(127,233,255,0.2)'; c.fillRect(wx, sy, ww, 8);
  c.restore();
  gctx.lineWidth = 10; gctx.strokeStyle = 'rgba(127,233,255,0.35)'; rrect(gctx, wx, wy, ww, wh, 18); gctx.stroke();
  // the winch on top: a drum, a crank, the cable going down into the machine
  const [qx, qy] = MR.winch, a = o.turn || 0;
  line(c, qx, qy + 40, qx, MR.y + 12, 6, '#FFD447');
  rrect(c, qx - 70, qy + 26, 140, 26, 8); c.fillStyle = '#5A6880'; c.fill();
  circle(c, qx, qy, 46, '#26304A'); circle(c, qx, qy, 34, '#8E99B3');
  for (let i = 0; i < 6; i++) line(c, qx, qy, qx + Math.cos(a + i * Math.PI / 3) * 32, qy + Math.sin(a + i * Math.PI / 3) * 32, 5, '#26304A');
  const hx = qx + Math.cos(a) * 62, hy = qy + Math.sin(a) * 62;
  line(c, qx, qy, hx, hy, 12, '#26304A'); circle(c, hx, hy, 14, '#EF4638');
  circle(c, qx, qy, 9, '#FFD447');
}
// the hero beside the scanner, his arm in its side. o: {face, wince 0..1, headRot, jit}
function mriHero(cam, t, o = {}) {
  const s = MR.hs, st = { x: MR.hx + (o.jit || 0) * 0.6, y: MR.hy, s, face: o.face || FACES.nervous, headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
  let pose = JSON.parse(JSON.stringify(POSES.stand));
  pose.lean = 0.05 + 0.03 * (o.wince || 0);
  pose.hand = 'open';
  const tgt = ikLocal(st, MR.hole[0] + 70, MR.hole[1] + 4);
  pose = ikReach(pose, 'R', tgt, 1);
  pose = denReach(pose, 'L', [-34 - 10 * (o.wince || 0), -306 - 26 * (o.wince || 0)]);   // his other hand: at his chest, then at his mouth
  return charLayer(cam, Object.assign(st, { pose }), t, { pal: HOSPAL, ambient: 0.1, light: 0.12 });
}
