// Why Does Your Mouth Water When You Imagine a LEMON? 🍋 Short: a lemon grove on a terrace over the sea at noon, and the
// lemons. World space (1080x1920 at zoom 1): the hero stands at LMS (head centre (540, 1030)), as on tongue-twister's
// stage, so the close-ups use the same camera numbers.
//   initGrove()             paints the far plate (sky, sea, a far headland with a white village, terraces of lemon trees
//                           down the slope) and the mid plate (lemon-tree canopies out of focus), once
//   groveBg(cam, t, o)      the far plate at parallax 0.22, the mid plate at 0.55, a near branch with leaves and lemons,
//                           the sun's glow; o: {}
//   groveFront(cam, t, o)   big out-of-focus leaves in front of him, at the bottom corners (parallax 1.35)
//   lmLayerCam(cam, p)      the camera for a layer at parallax p (0 = fixed to the screen, 1 = the world)
//   lmWedge(c, o)           a lemon wedge in its own units: the rind's arc below, the cut pulp face on top, its long axis
//                           along x (from -L to L); o: {L, R, bite 0..1 (the left end bitten off, scalloped), ghost 0..1
//                           (a dotted outline: imagined), stamp (a word across it)}
//   lmLemon(c, x, y, s, rot)  a whole lemon with a leaf
//   lmJuice(c, g, P0, tau, o) a squirt of juice drops, tau seconds after it left P0 (units of c); o: {n, seed, s, dir, spread, v}
//   LMPAL                   his summer shirt (sky-blue linen, sleeves short)
'use strict';

const LMS = { hx: 540, fy: 1500, hs: 1.0 };
const LMPAL = Object.assign({}, PAL, {
  coat: '#8CC8EE', coatSh: '#5D98C8', coatHi: '#C2E6FF', coatDk: '#3D74A6', strap: '#8CC8EE', strapSh: '#5D98C8',
  pants: '#E9DFC8', pantsSh: '#BFB197', shoe: '#8A5A3A', shoeSh: '#5E3A22', sole: '#E8DCC0', shortSleeve: true, pj: true,
});
const LMC = {
  rind: '#F8D21C', rindDk: '#D9A10C', rindHi: '#FFF08A', pith: '#FFF7DA', pulp: '#FFE57A', pulpDk: '#F2C94A', seg: '#FFF6C8',
  leaf: '#2F7D3A', leafDk: '#1E5A2A', leafHi: '#5FB04E', juice: '#FFF3A0', ghost: '#BFF4FF',
};
let LM_FAR = null, LM_MID = null;
const LM_FAR_O = [-120, 40], LM_MID_O = [-200, 470];       // where each plate's top-left sits in its layer's world

function lmLayerCam(cam, p, X0 = 540, Y0 = 1000) {
  return { x: X0 + (cam.x - X0) * p, y: Y0 + (cam.y - Y0) * p, zoom: 1 + (cam.zoom - 1) * p, rot: cam.rot || 0, sx: cam.sx, sy: cam.sy };
}

// ---------------------------------------------------------------- the lemons
function lmLemonPath(c, rx, ry) {
  c.beginPath();
  c.moveTo(-rx - 10, 0);
  c.bezierCurveTo(-rx - 4, -ry * 0.55, -rx * 0.6, -ry, 0, -ry);
  c.bezierCurveTo(rx * 0.6, -ry, rx + 4, -ry * 0.55, rx + 10, 0);
  c.bezierCurveTo(rx + 4, ry * 0.55, rx * 0.6, ry, 0, ry);
  c.bezierCurveTo(-rx * 0.6, ry, -rx - 4, ry * 0.55, -rx - 10, 0);
  c.closePath();
}
function lmLemon(c, x, y, s = 1, rot = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  lmLemonPath(c, 34, 26); c.fillStyle = LMC.rind; c.fill();
  paint(() => {
    lmLemonPath(c, 34, 26); c.save(); c.clip();
    ellipse(c, 6, 10, 34, 16, rgba(LMC.rindDk, 0.35));
    ellipse(c, -10, -12, 16, 7, rgba(LMC.rindHi, 0.9), -0.2);
    for (let i = 0; i < 14; i++) circle(c, -26 + 52 * hash(i * 1.3 + 2), -18 + 36 * hash(i * 2.1 + 5), 1.6, rgba(LMC.rindDk, 0.4));
    c.restore();
    circle(c, 44, 0, 3, '#8A9A2A');
  });
  if (!o.noLeaf) {
    c.save(); c.translate(-42, -4); c.rotate(-0.5);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-18, -16, -40, -2); c.quadraticCurveTo(-18, 12, 0, 0); c.closePath(); c.fillStyle = LMC.leaf; c.fill();
    paint(() => line(c, 0, 0, -36, -2, 2, rgba(LMC.leafHi, 0.8)));
    c.restore();
  }
  c.restore();
}

// the wedge: its long axis along x from -L to L, the cut pulp face on top (y < 0 above the axis), the rind's arc below
function lmWedgePath(c, L, R, bite) {
  const bx = -L + (L * 0.55) * bite;                       // the bitten end moves in
  c.beginPath();
  if (bite > 0.02) {
    // a scalloped bite (three tooth marks) across the left end
    const y0 = -R * 0.28, y1 = R * 0.62;
    c.moveTo(bx, y0);
    for (let i = 0; i < 3; i++) {
      const ya = lerp(y0, y1, i / 3), yb = lerp(y0, y1, (i + 1) / 3);
      c.quadraticCurveTo(bx + 9, (ya + yb) / 2, bx, yb);
    }
  } else c.moveTo(-L, 0);
  c.bezierCurveTo(-L * 0.55, R * 1.12, L * 0.55, R * 1.12, L, 0);          // the rind's arc
  c.bezierCurveTo(L * 0.5, -R * 0.42, (bite > 0.02 ? bx : -L) * 0.5, -R * 0.42, bite > 0.02 ? bx : -L, bite > 0.02 ? -R * 0.28 : 0);   // the pulp face
  c.closePath();
}
function lmWedge(c, o = {}) {
  const L = o.L || 60, R = o.R || 34, bite = clamp(o.bite || 0), gh = clamp(o.ghost || 0);
  if (gh < 0.99) {
    // the rind (a shape: it takes the light), the pith and the pulp painted on
    lmWedgePath(c, L, R, bite); c.fillStyle = LMC.rind; c.fill();
    paint(() => {
      c.save(); lmWedgePath(c, L, R, bite); c.clip();
      // the pith line and the pulp: a band above the rind
      c.beginPath(); c.moveTo(-L - 4, 0); c.bezierCurveTo(-L * 0.5, R * 0.86, L * 0.5, R * 0.86, L + 4, 0);
      c.bezierCurveTo(L * 0.5, -R * 0.6, -L * 0.5, -R * 0.6, -L - 4, 0); c.closePath(); c.fillStyle = LMC.pith; c.fill();
      c.beginPath(); c.moveTo(-L, -2); c.bezierCurveTo(-L * 0.5, R * 0.68, L * 0.5, R * 0.68, L, -2);
      c.bezierCurveTo(L * 0.5, -R * 0.6, -L * 0.5, -R * 0.6, -L, -2); c.closePath(); c.fillStyle = LMC.pulp; c.fill();
      // the segments: membranes fanning from the core line
      for (let i = -3; i <= 3; i++) {
        const x = i * L * 0.27;
        c.beginPath(); c.moveTo(x * 0.55, -R * 0.22); c.quadraticCurveTo(x * 0.85, R * 0.18, x, R * 0.5);
        c.lineWidth = 3; c.strokeStyle = rgba(LMC.seg, 0.95); c.stroke();
      }
      // juicy glints
      for (let i = 0; i < 7; i++) ellipse(c, -L * 0.7 + i * L * 0.23, R * (0.1 + 0.18 * hash(i + 3)), 3.4, 1.8, 'rgba(255,255,255,0.85)', -0.3);
      // the rind's own shade and shine (painted: it has a soft edge)
      c.beginPath(); c.moveTo(-L, 0); c.bezierCurveTo(-L * 0.55, R * 1.12, L * 0.55, R * 1.12, L, 0);
      c.lineWidth = 9; c.strokeStyle = rgba(LMC.rindDk, 0.55); c.stroke();
      c.restore();
      ellipse(c, L * 0.3, R * 0.7, L * 0.22, 3, rgba(LMC.rindHi, 0.8), -0.12);
    });
  }
  if (gh > 0.01) {
    // the imagined lemon: a dotted outline, a faint fill, a few sparkles
    paint(() => {
      c.save();
      lmWedgePath(c, L, R, bite);
      c.fillStyle = rgba(LMC.ghost, 0.16 * gh); c.fill();
      c.setLineDash([12, 9]); c.lineDashOffset = -(o.t || 0) * 30;
      c.lineWidth = 7; c.strokeStyle = rgba('#FFFFFF', 0.98 * gh); c.stroke();
      c.setLineDash([]);
      c.beginPath(); c.moveTo(-L * 0.85, -2); c.bezierCurveTo(-L * 0.5, R * 0.5, L * 0.5, R * 0.5, L * 0.85, -2);
      c.setLineDash([7, 8]); c.lineWidth = 3; c.strokeStyle = rgba(LMC.ghost, 0.8 * gh); c.stroke(); c.setLineDash([]);
      c.restore();
    });
  }
  if (o.stamp && (o.stampK || 0) > 0.01) {
    const k = E.outBack(clamp(o.stampK), 2.4);
    paint(() => {
      c.save(); c.translate(0, R * 0.2); c.rotate(-0.16); c.scale(k, k);
      c.font = '400 30px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const w = c.measureText(o.stamp).width + 22;
      rrect(c, -w / 2, -21, w, 42, 8); c.lineWidth = 5; c.strokeStyle = o.stampCol || '#FF4D6D'; c.stroke();
      c.fillStyle = o.stampCol || '#FF4D6D'; c.fillText(o.stamp, 0, 2);
      c.restore();
    });
  }
}

// a squirt of juice: n drops leave P0 in a fan around dir (radians; 0 = right, -PI/2 = up), fall under gravity
// (units of c a second), shrink and go; glints into the glow layer through g (a function that maps a point to the
// glow layer's transform) when given
function lmJuice(c, P0, tau, o = {}) {
  if (tau <= 0 || tau > 1.1) return;
  const n = o.n || 14, seed = o.seed || 1, s = o.s || 1, dir = o.dir === undefined ? -Math.PI / 2 : o.dir, spread = o.spread || 1.3;
  const v0 = o.v || 420, grav = 900 * s;
  paint(() => {
    for (let i = 0; i < n; i++) {
      const a = dir + (hash(seed * 31 + i * 7.3) - 0.5) * spread, v = v0 * s * (0.55 + 0.7 * hash(seed * 17 + i * 3.1));
      const tt = tau * (0.85 + 0.3 * hash(seed + i * 5.7));
      const x = P0[0] + Math.cos(a) * v * tt, y = P0[1] + Math.sin(a) * v * tt + 0.5 * grav * tt * tt;
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v + grav * tt, ang = Math.atan2(vy, vx);
      const r = s * (2.5 + 4.5 * hash(seed * 3 + i)) * (1 - 0.6 * clamp(tau / 1.1));
      const al = clamp((1.05 - tau) * 3);
      ellipse(c, x, y, r * 1.8, r, rgba(LMC.juice, 0.95 * al), ang);
      circle(c, x - r * 0.4, y - r * 0.4, r * 0.45, rgba('#FFFFFF', 0.9 * al));
    }
  });
}

// ---------------------------------------------------------------- the grove
function initGrove() {
  const FW = 1340, FH = 1900;
  LM_FAR = mkCanvas(FW, FH);
  const g = LM_FAR.getContext('2d'), rng = mulberry32(711);
  // the sky: deep blue up top, pale at the horizon (plate y 960)
  const sky = g.createLinearGradient(0, 0, 0, 980);
  sky.addColorStop(0, '#2F7FD6'); sky.addColorStop(0.55, '#62A9E8'); sky.addColorStop(1, '#BFE6F7');
  g.fillStyle = sky; g.fillRect(0, 0, FW, 990);
  // the sun's warmth from the top right
  const sg = g.createRadialGradient(1260, 140, 20, 1260, 140, 760);
  sg.addColorStop(0, 'rgba(255,250,220,0.85)'); sg.addColorStop(0.25, 'rgba(255,244,200,0.35)'); sg.addColorStop(1, 'rgba(255,244,200,0)');
  g.fillStyle = sg; g.fillRect(0, 0, FW, 990);
  // a few soft clouds
  g.filter = 'blur(10px)';
  for (const [cx, cy, w] of [[200, 380, 260], [760, 260, 320], [1110, 560, 220], [460, 700, 200]]) {
    g.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(cx + (i - 2.5) * w * 0.16, cy + (i % 2 ? -10 : 6), w * 0.2, w * 0.1, 0, 0, 7); g.fill(); }
  }
  g.filter = 'none';
  // the sea from the horizon down
  const sea = g.createLinearGradient(0, 960, 0, 1260);
  sea.addColorStop(0, '#3E8FC4'); sea.addColorStop(1, '#1D5E9A');
  g.fillStyle = sea; g.fillRect(0, 960, FW, 320);
  for (let i = 0; i < 70; i++) { const y = 975 + 280 * Math.pow(rng(), 1.4), x = rng() * FW; g.fillStyle = `rgba(255,255,255,${0.15 + 0.35 * rng()})`; g.fillRect(x, y, 14 + 40 * rng(), 2 + (y - 960) / 140); }
  // a far headland on the left with a white village
  g.fillStyle = '#6E8F7A';
  g.beginPath(); g.moveTo(-10, 990); g.bezierCurveTo(60, 760, 220, 700, 330, 760); g.bezierCurveTo(400, 800, 450, 900, 520, 990); g.closePath(); g.fill();
  g.fillStyle = '#5A7A68';
  g.beginPath(); g.moveTo(-10, 990); g.bezierCurveTo(80, 860, 180, 840, 280, 880); g.bezierCurveTo(340, 910, 380, 960, 420, 990); g.closePath(); g.fill();
  for (let i = 0; i < 26; i++) {
    const hx = 90 + 300 * rng(), hy = 790 + 150 * rng() + Math.max(0, (hx - 260)) * 0.4, hw = 14 + 14 * rng(), hh = 10 + 10 * rng();
    g.fillStyle = ['#F6F1E6', '#F2D9C2', '#E9C7A8', '#F8EED8'][Math.floor(rng() * 4)]; g.fillRect(hx, hy, hw, hh);
    g.fillStyle = 'rgba(120,80,60,0.35)'; g.fillRect(hx, hy + hh - 3, hw, 3);
  }
  // the terraces of lemon trees down the slope (plate y 1180 ->)
  for (let row = 0; row < 7; row++) {
    const y = 1180 + row * 105;
    g.fillStyle = `rgba(${150 - row * 8},${120 - row * 6},${86 - row * 5},1)`; g.fillRect(0, y + 64, FW, 30);           // the stone wall
    for (let x = -30; x < FW + 40; x += 64 + 24 * rng()) {
      const r = 40 + 18 * rng() + row * 3, cx = x, cy = y + 30 - 10 * rng();
      g.fillStyle = ['#2D6E36', '#3A7F3E', '#24602E'][Math.floor(rng() * 3)];
      g.beginPath(); g.ellipse(cx, cy, r, r * 0.8, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(120,190,90,0.35)'; g.beginPath(); g.ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.45, r * 0.3, 0, 0, 7); g.fill();
      for (let k = 0; k < 5; k++) { g.fillStyle = '#F6D23A'; g.beginPath(); g.ellipse(cx + (rng() - 0.5) * r * 1.4, cy + (rng() - 0.4) * r, 5 + row * 0.6, 4 + row * 0.5, 0, 0, 7); g.fill(); }
    }
  }
  // the whole far plate a little soft
  const tmp = mkCanvas(FW, FH), tg = tmp.getContext('2d');
  tg.filter = 'blur(2.5px)'; tg.drawImage(LM_FAR, 0, 0); LM_FAR = tmp;

  // ---- the mid plate: lemon-tree canopies, out of focus, sky between them up top
  const MW = 1480, MH = 1250;
  const mid = mkCanvas(MW, MH), m = mid.getContext('2d'), r2 = mulberry32(911);
  const clump = (cx, cy, R, dark) => {
    for (let i = 0; i < 22; i++) {
      const a = r2() * Math.PI * 2, d = R * Math.sqrt(r2()), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8, rr = R * (0.18 + 0.2 * r2());
      m.fillStyle = [dark ? '#1F5A2B' : '#2A6E34', '#2F7D3A', dark ? '#24622F' : '#3E8E43', '#4C9E4A'][Math.floor(r2() * 4)];
      m.beginPath(); m.ellipse(x, y, rr, rr * 0.75, r2() * 3, 0, 7); m.fill();
    }
    for (let i = 0; i < 8; i++) {                               // lemons hanging in the leaves
      const a = r2() * Math.PI * 2, d = R * 0.8 * Math.sqrt(r2()), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8 + 10;
      m.fillStyle = '#F8D21C'; m.beginPath(); m.ellipse(x, y, 17, 13, 0.3, 0, 7); m.fill();
      m.fillStyle = 'rgba(255,248,170,0.9)'; m.beginPath(); m.ellipse(x - 5, y - 4, 6, 4, 0.3, 0, 7); m.fill();
    }
  };
  // canopies left and right of where his head is; lower ones behind his shoulders
  for (const [cx, cy, R, dk] of [[120, 260, 230, true], [360, 120, 170, false], [1080, 180, 210, true], [1330, 380, 240, false],
    [60, 700, 260, false], [1380, 760, 260, true], [300, 980, 240, true], [1150, 1040, 250, false], [700, 1160, 230, true]]) clump(cx, cy, R, dk);
  // a trunk or two
  m.fillStyle = '#5A4232'; m.fillRect(250, 360, 26, 700); m.fillRect(1200, 520, 30, 600);
  const mt = mkCanvas(MW, MH), mg = mt.getContext('2d');
  mg.filter = 'blur(7px)'; mg.drawImage(mid, 0, 0); LM_MID = mt;
}

function groveBg(cam, t, o = {}) {
  const c = ctx;
  // the far plate
  const cf = lmLayerCam(cam, 0.22);
  applyCam(cf);
  c.drawImage(LM_FAR, LM_FAR_O[0], LM_FAR_O[1]);
  // the sun's glow spills from the top right (glow layer only: it never sits behind his head)
  softDot(gctx, 1180, 140, 420, '#FFF4C8', 0.55);
  // the mid plate
  const cm = lmLayerCam(cam, 0.55);
  applyCam(cm);
  c.drawImage(LM_MID, LM_MID_O[0], LM_MID_O[1]);
  // bokeh: lemons and sun glints between the leaves, out of focus, round where his head is (never behind it)
  for (const [x, y, r, col, a] of [[300, 780, 26, '#FFE46A', 0.5], [760, 760, 22, '#FFF6C0', 0.45], [250, 1130, 30, '#FFD447', 0.4],
    [830, 1180, 26, '#FFE46A', 0.45], [700, 640, 18, '#FFFFFF', 0.35], [380, 620, 16, '#FFFFFF', 0.3]])
    softDot(c, x + 6 * Math.sin(loopW(1.1) * t + x), y + 4 * Math.cos(loopW(0.9) * t + y), r, col, a);
  // the near branch: top left, leaves and two lemons (sharp, the set), swaying a little
  applyCam(cam);
  lmBranch(c, 392, 812, t, 1.0);
  lmBranch(c, 724, 836, t + 1.3, -1.0, true);
}
// a branch with leaves and lemons; side +1 hangs in from the left, -1 from the right (world units)
function lmBranch(c, x, y, t, side, small) {
  const sw = 0.04 * Math.sin(loopW(1.3) * t);
  c.save(); c.translate(x, y); c.rotate(sw); c.scale(side * (small ? 0.75 : 1), small ? 0.75 : 1);
  line(c, -120, -40, 40, 10, 9, '#5A4232');
  line(c, -20, -8, 10, 40, 6, '#5A4232');
  const leaf = (lx, ly, a, L) => {
    c.save(); c.translate(lx, ly); c.rotate(a);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * 0.45, -L * 0.32, L, 0); c.quadraticCurveTo(L * 0.45, L * 0.32, 0, 0); c.closePath();
    c.fillStyle = LMC.leaf; c.fill();
    paint(() => line(c, 2, 0, L * 0.9, 0, 2, rgba(LMC.leafHi, 0.7)));
    c.restore();
  };
  for (const [lx, ly, a, L] of [[-90, -32, -0.6, 52], [-60, -22, 0.7, 48], [-30, -12, -0.4, 56], [0, 2, 0.9, 50], [20, 6, -0.2, 46], [-40, -14, 2.4, 44], [6, 30, 1.9, 40]]) leaf(lx, ly, a, L);
  lmLemon(c, 12, 62, 0.62, 1.35, { noLeaf: true });
  lmLemon(c, -48, 22, 0.55, 1.6, { noLeaf: true });
  c.restore();
}

// out-of-focus leaves in front of him at the bottom corners (drawn after him)
function groveFront(cam, t, o = {}) {
  const cn = lmLayerCam(cam, 1.35);
  applyCam(cn);
  const c = ctx;
  c.save(); c.filter = 'blur(9px)';
  const leaf = (lx, ly, a, L, col) => {
    c.save(); c.translate(lx, ly); c.rotate(a + 0.03 * Math.sin(loopW(1.2) * t + lx));
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * 0.45, -L * 0.34, L, 0); c.quadraticCurveTo(L * 0.45, L * 0.34, 0, 0); c.closePath();
    c.fillStyle = col; c.fill(); c.restore();
  };
  for (const [lx, ly, a, L, col] of [[330, 1330, -0.9, 150, '#1E5A2A'], [300, 1360, -0.3, 170, '#2A6E34'], [350, 1390, 0.4, 140, '#24622F'],
    [770, 1360, -2.3, 160, '#24622F'], [790, 1330, -2.9, 150, '#2A6E34']]) leaf(lx, ly, a, L, col);
  c.restore();
}
