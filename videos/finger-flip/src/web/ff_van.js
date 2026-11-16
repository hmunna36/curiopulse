// "Can You Wag Your Fingers Like WIPERS?" Short: the campervan on a rainy evening in the woods.
//   ffPOV(cam, t, o)        the driver's view over his shoulder: the windscreen (dusk woods, a road, a lit cabin, a lamp
//                           post), rain on the glass, two tandem wipers (o.wip = their angle offset, rad), the dashboard
//                           (a steaming mug, a map, a cactus on a spring), the mirror with fuzzy dice. World 1080x1920.
//   ffCabin(cam, t, o)      the cab seen from the dashboard: his seat, the living space behind (wood, fairy lights, a
//                           rainy side window with a gingham curtain, a shelf with a kettle, a hanging plant, a bunk)
//   ffCabinFront(cam, t)    what is in front of him in that view (the steering wheel's rim in a corner)
//   ffBack(cam, t, o)       outside the van's back doors under a striped awning: rain, a lantern, puddles, the woods
//   ffBackFront(cam, t)     the awning's dripping edge and the near puddle (in front of the two on the step)
// Times are cues from scenes.js; ambient motion runs on loopW clocks so the last frame matches the first.
'use strict';

const FV = { horizon: 860, dashY: 1262, pivots: [[262, 1300], [704, 1300]], blade: 560 };
let FV_DROPS = null, FV_OUT = null, FV_WOOD = null, FV_TREES = null;

function initFFVan() {
  const rng = mulberry32(4242);
  FV_DROPS = [];
  for (let i = 0; i < 150; i++) {
    const x = 40 + rng() * 1000, y = 430 + rng() * 820;
    FV_DROPS.push({ x, y, r: 5 + rng() * 8, seed: rng(), run: rng() < 0.2 ? 40 + rng() * 120 : 0 });
  }
  // the woods outside the windscreen, painted once (a cached image is fine: far background, unlit)
  FV_OUT = mkCanvas(1080, 900);
  const o = FV_OUT.getContext('2d');
  const g = o.createLinearGradient(0, 0, 0, 900);
  g.addColorStop(0, '#202660'); g.addColorStop(0.42, '#38558F'); g.addColorStop(0.62, '#6E86B8'); g.addColorStop(0.7, '#8C8FB8'); g.addColorStop(1, '#232A46');
  o.fillStyle = g; o.fillRect(0, 0, 1080, 900);
  // far ridge and pines
  const hz = FV.horizon - 400;
  o.fillStyle = '#2B3D6B'; o.beginPath(); o.moveTo(0, hz + 30);
  for (let x = 0; x <= 1080; x += 40) o.lineTo(x, hz - 40 - 30 * Math.sin(x * 0.006) - 18 * Math.sin(x * 0.019 + 1));
  o.lineTo(1080, 900); o.lineTo(0, 900); o.closePath(); o.fill();
  const pine = (x, y, h, col) => {
    o.fillStyle = col; o.beginPath(); o.moveTo(x, y - h);
    for (let i = 1; i <= 5; i++) { const yy = y - h + (h * i) / 5.2, ww = h * 0.11 * i; o.lineTo(x + ww, yy); o.lineTo(x + ww * 0.45, yy - h * 0.02); }
    o.lineTo(x + h * 0.06, y); o.lineTo(x - h * 0.06, y);
    for (let i = 5; i >= 1; i--) { const yy = y - h + (h * i) / 5.2, ww = h * 0.11 * i; o.lineTo(x - ww * 0.45, yy - h * 0.02); o.lineTo(x - ww, yy); }
    o.closePath(); o.fill();
  };
  for (let i = 0; i < 26; i++) { const x = (i * 97 + 30 * rng()) % 1120 - 20, h = 140 + rng() * 120; pine(x, hz + 40 + rng() * 20, h, '#1C2E52'); }
  for (let i = 0; i < 14; i++) { const x = i < 7 ? rng() * 330 : 760 + rng() * 330, h = 260 + rng() * 220; pine(x, hz + 150 + rng() * 40, h, '#12223F'); }
  // the road to the horizon, wet
  o.fillStyle = '#262C44'; o.beginPath(); o.moveTo(520, hz + 40); o.lineTo(560, hz + 40); o.lineTo(900, 900); o.lineTo(160, 900); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,214,120,0.55)'; o.lineWidth = 5; o.setLineDash([26, 30]);
  o.beginPath(); o.moveTo(540, hz + 44); o.lineTo(530, 900); o.stroke(); o.setLineDash([]);
  FV_TREES = rng;
  // the cabin's wood panelling, painted once (back wall)
  FV_WOOD = mkCanvas(1400, 1300);
  const w = FV_WOOD.getContext('2d');
  w.fillStyle = '#7A4632'; w.fillRect(0, 0, 1400, 1300);
  for (let i = 0; i < 1400; i += 70) {
    w.fillStyle = i % 140 ? '#80503A' : '#734230'; w.fillRect(i, 0, 68, 1300);
    w.fillStyle = 'rgba(40,18,10,0.45)'; w.fillRect(i + 68, 0, 2, 1300);
    for (let k = 0; k < 5; k++) { w.strokeStyle = 'rgba(60,28,16,0.18)'; w.lineWidth = 2; w.beginPath(); const yy = rng() * 1300; w.moveTo(i + 6, yy); w.quadraticCurveTo(i + 34, yy + 40, i + 62, yy + 10); w.stroke(); }
  }
}

// a wiper's angle: 0 = resting flat to the left along the bottom; it sweeps up and to the right by `sw` (rad)
function ffWiperAng(sw) { return Math.PI - 0.06 + sw; }

// ---------------------------------------------------------------- the driver's view (hook, button)
// o: {sw (0..1.75 sweep of both wipers), hist: [[dt, sw]...] (the sweep a moment ago, for the cleared glass), steam, dice}
function ffPOV(cam, t, o = {}) {
  applyCam(cam);
  // outside, through the glass (with a little parallax)
  const px = (cam.x - 540) * 0.25;
  ctx.drawImage(FV_OUT, -60 + px * 0.2, 380, 1200, 1000);
  // a lit cabin far left and a lamp post right: warm points that bloom
  rrect(ctx, 150, 760, 120, 70, 8); ctx.fillStyle = '#3B2A3A'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(140, 764); ctx.lineTo(210, 714); ctx.lineTo(280, 764); ctx.closePath(); ctx.fillStyle = '#2A1F30'; ctx.fill();
  for (const [wx, wy] of [[168, 782], [222, 782]]) { rrect(ctx, wx, wy, 34, 28, 4); ctx.fillStyle = '#FFC66B'; ctx.fill(); softDot(gctx, wx + 17, wy + 14, 60, '#FFB04A', 0.55); }
  line(ctx, 846, 640, 846, 980, 9, '#1A2034');
  line(ctx, 846, 646, 806, 640, 6, '#1A2034');
  circle(ctx, 800, 652, 15, '#FFE2A0'); softDot(gctx, 800, 652, 130, '#FFC060', 0.75);
  // the glass: a cool sheen
  const sh = ctx.createLinearGradient(0, 400, 1080, 1260);
  sh.addColorStop(0, 'rgba(160,200,255,0.10)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.0)'); sh.addColorStop(1, 'rgba(140,190,255,0.08)');
  ctx.fillStyle = sh; ctx.fillRect(0, 380, 1080, 900);
  // rain on the glass: a drop the wiper just passed is gone and comes back over half a second
  const sw = o.sw || 0, hist = o.hist || [];
  paint(() => {
    for (const d of FV_DROPS) {
      let clear = 0;
      for (const [pvx, pvy] of FV.pivots) {
        const r = Math.hypot(d.x - pvx, d.y - pvy);
        if (r > FV.blade + 10 || r < 60) continue;
        const ang = Math.atan2(d.y - pvy, d.x - pvx);
        // the newest sample whose sweep passed this drop's angle
        for (let i = 0; i < hist.length - 1; i++) {
          const a0 = ffWiperAng(hist[i][1]), a1 = ffWiperAng(hist[i + 1][1]);
          const lo = Math.min(a0, a1) - 0.03, hi = Math.max(a0, a1) + 0.03;
          let aa = ang; if (aa < 0) aa += Math.PI * 2;
          if (aa >= lo && aa <= hi) { clear = Math.max(clear, 1 - hist[i][0] / 0.55); break; }
        }
      }
      const a = clamp(1 - clear) * (0.5 + 0.4 * d.seed);
      if (a < 0.04) continue;
      const fall = d.run ? ((t * (40 + 60 * d.seed) + d.seed * 300) % d.run) : 0;
      ellipse(ctx, d.x, d.y + fall + d.r * 0.18, d.r * 0.82, d.r * 0.95, `rgba(20,30,70,${0.30 * a})`);
      ellipse(ctx, d.x, d.y + fall, d.r * 0.78, d.r * 0.9, `rgba(170,200,255,${0.22 * a})`);
      ellipse(ctx, d.x - d.r * 0.28, d.y + fall - d.r * 0.38, d.r * 0.26, d.r * 0.2, `rgba(255,255,255,${0.8 * a})`);
      ellipse(ctx, d.x + d.r * 0.2, d.y + fall + d.r * 0.5, d.r * 0.38, d.r * 0.14, `rgba(230,240,255,${0.35 * a})`);
      if (d.run) line(ctx, d.x, d.y, d.x, d.y + fall, 2, `rgba(200,225,255,${0.22 * a})`);
    }
  });
  // the wipers (in front of the glass)
  for (const [pvx, pvy] of FV.pivots) {
    const an = ffWiperAng(sw), ex = pvx + Math.cos(an) * FV.blade, ey = pvy + Math.sin(an) * FV.blade;
    const mx = pvx + Math.cos(an) * FV.blade * 0.5, my = pvy + Math.sin(an) * FV.blade * 0.5;
    line(ctx, pvx, pvy, mx, my, 22, '#14161F');
    line(ctx, mx, my, ex, ey, 13, '#14161F');
    // the rubber blade along the arm's outer half
    const nx = -Math.sin(an), ny = Math.cos(an);
    line(ctx, pvx + Math.cos(an) * 160 + nx * 12, pvy + Math.sin(an) * 160 + ny * 12, ex + nx * 12, ey + ny * 12, 15, '#0D0E14');
    paint(() => line(ctx, pvx + Math.cos(an) * 30 - nx * 5, pvy + Math.sin(an) * 30 - ny * 5, ex - nx * 4, ey - ny * 4, 4, 'rgba(200,210,240,0.6)'));
  }
  // the frame: the roof edge, the visors, the two pillars
  ctx.fillStyle = '#1B1A28';
  ctx.beginPath(); ctx.moveTo(-80, 300); ctx.lineTo(1160, 300); ctx.lineTo(1160, 420); ctx.quadraticCurveTo(540, 392, -80, 420); ctx.closePath(); ctx.fill();
  for (const sx of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(540 + sx * 640, 300); ctx.lineTo(540 + sx * 470, 300); ctx.lineTo(540 + sx * 560, 1300); ctx.lineTo(540 + sx * 680, 1300); ctx.closePath(); ctx.fill();
    rrect(ctx, 540 + sx * 250 - 150, 396, 300, 70, 22); ctx.fillStyle = '#5B3E5E'; ctx.fill();
    paint(() => line(ctx, 540 + sx * 250 - 120, 412, 540 + sx * 250 + 120, 412, 3, 'rgba(255,220,240,0.25)'));
    ctx.fillStyle = '#1B1A28';
  }
  // the rear-view mirror and the fuzzy dice (they swing)
  rrect(ctx, 454, 412, 172, 66, 18); ctx.fillStyle = '#23222F'; ctx.fill();
  rrect(ctx, 464, 420, 152, 50, 13); ctx.fillStyle = '#4A5C86'; ctx.fill();
  paint(() => line(ctx, 476, 430, 560, 428, 4, 'rgba(220,235,255,0.45)'));
  const dz = (o.dice || 0.05) * Math.sin(t * loopW(4.2));
  ctx.save(); ctx.translate(540, 478); ctx.rotate(dz);
  line(ctx, 0, 0, -18, 92, 3, '#E9E2D0'); line(ctx, 0, 0, 20, 106, 3, '#E9E2D0');
  for (const [dx, dy, col, rot] of [[-18, 112, '#FF5A6E', 0.2], [20, 126, '#7FE9FF', -0.25]]) {
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(rot);
    rrect(ctx, -24, -24, 48, 48, 12); ctx.fillStyle = col; ctx.fill();
    paint(() => { for (const [px2, py2] of [[-10, -10], [10, 10], [0, 0]]) circle(ctx, px2, py2, 4.5, '#FFFFFF'); });
    ctx.restore();
  }
  ctx.restore();
  // the dashboard
  ctx.beginPath(); ctx.moveTo(-80, FV.dashY + 20); ctx.quadraticCurveTo(540, FV.dashY - 40, 1160, FV.dashY + 20); ctx.lineTo(1160, 2100); ctx.lineTo(-80, 2100); ctx.closePath();
  ctx.fillStyle = '#3A2E46'; ctx.fill();
  paint(() => { ctx.beginPath(); ctx.moveTo(-80, FV.dashY + 22); ctx.quadraticCurveTo(540, FV.dashY - 38, 1160, FV.dashY + 22); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,200,230,0.22)'; ctx.stroke(); });
  // the gauge cluster, low behind the wheel (a dim glow, kept away from his fists)
  rrect(ctx, 390, FV.dashY + 330, 300, 90, 36); ctx.fillStyle = '#1C1726'; ctx.fill();
  softDot(gctx, 540, FV.dashY + 375, 90, '#5FE0FF', 0.25);
  // a steaming mug (left), a folded map (right), a cactus on a spring (right)
  ctx.save(); ctx.translate(132, FV.dashY + 10);
  rrect(ctx, -40, -78, 80, 86, 14); ctx.fillStyle = '#E8504E'; ctx.fill();
  ctx.beginPath(); ctx.arc(42, -40, 20, -1.2, 1.2); ctx.lineWidth = 11; ctx.strokeStyle = '#C73E42'; ctx.stroke();
  paint(() => { ellipse(ctx, 0, -78, 38, 9, '#5A2A1E'); ellipse(ctx, -14, -46, 9, 16, 'rgba(255,255,255,0.25)'); });
  const st = o.steam === undefined ? 1 : o.steam;
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.5 + i / 3) % 1, sy = -96 - ph * 140, sx = 8 * Math.sin(ph * 7 + i * 2);
    softDot(ctx, sx + (i - 1) * 14, sy, 26 + ph * 26, '#FFFFFF', 0.18 * st * Math.sin(Math.PI * ph));
  }
  ctx.restore();
  ctx.save(); ctx.translate(820, FV.dashY + 4); ctx.rotate(-0.08);
  rrect(ctx, -84, -26, 168, 40, 6); ctx.fillStyle = '#F2E2B4'; ctx.fill();
  paint(() => { line(ctx, -84, -6, 84, -6, 2, 'rgba(120,90,40,0.4)'); line(ctx, -30, -26, -30, 14, 2, 'rgba(120,90,40,0.35)'); line(ctx, 30, -26, 30, 14, 2, 'rgba(120,90,40,0.35)');
    ctx.beginPath(); ctx.moveTo(-70, 4); ctx.quadraticCurveTo(-20, -20, 20, 2); ctx.quadraticCurveTo(50, 16, 74, -10); ctx.lineWidth = 3; ctx.strokeStyle = '#E8504E'; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]); });
  ctx.restore();
  const bob = 0.18 * Math.sin(t * loopW(5.4) + 1);
  ctx.save(); ctx.translate(965, FV.dashY + 6);
  rrect(ctx, -28, -34, 56, 40, 8); ctx.fillStyle = '#C8743E'; ctx.fill();
  ctx.save(); ctx.translate(0, -40); ctx.rotate(bob);
  rrect(ctx, -18, -92, 36, 92, 18); ctx.fillStyle = '#3FA35A'; ctx.fill();
  rrect(ctx, -44, -64, 24, 40, 12); ctx.fill(); rrect(ctx, 20, -76, 24, 36, 12); ctx.fill();
  paint(() => { circle(ctx, -6, -62, 4, '#15132A'); circle(ctx, 7, -62, 4, '#15132A'); ctx.beginPath(); ctx.arc(0, -52, 6, 0.2, Math.PI - 0.2); ctx.lineWidth = 2.5; ctx.strokeStyle = '#15132A'; ctx.stroke(); circle(ctx, 0, -98, 7, '#FF86A6'); });
  ctx.restore(); ctx.restore();
}
// the steering wheel's top in the POV (in front of his wrists' level, below the hands): world coords
function ffPOVWheel(cam) {
  applyCam(cam);
  ctx.beginPath(); ctx.ellipse(540, 1880, 360, 300, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.lineWidth = 58; ctx.strokeStyle = '#17141F'; ctx.stroke();
  paint(() => { ctx.beginPath(); ctx.ellipse(540, 1868, 360, 300, 0, Math.PI * 1.2, Math.PI * 1.55); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,220,240,0.18)'; ctx.stroke(); });
}

// ---------------------------------------------------------------- the cab from the dashboard (answer .. copy)
// world: he sits at x 540 with his seat's base at FC.seatY; the back wall spans x -160..1240
const FC = { seatY: 1560, wallTop: 300 };
function ffCabin(cam, t, o = {}) {
  applyCam(cam);
  // the back wall (cached panelling), with a little parallax so the cab has depth
  const par = (cam.x - 540) * 0.22, pary = (cam.y - 1100) * 0.18;
  ctx.drawImage(FV_WOOD, -160 + par, 180 + pary, 1400, 1300);
  // the floor and the gap between the seats (no void below the wall)
  ctx.fillStyle = '#3A2430'; ctx.fillRect(-400, 1440 + pary, 1900, 1200);
  paint(() => { for (let i = 0; i < 12; i++) line(ctx, -300 + i * 150 + par, 1500 + pary, -360 + i * 170 + par * 1.4, 2400, 4, 'rgba(255,200,220,0.07)'); });
  rrect(ctx, 820 + par * 1.2, 1300 + pary, 300, 600, 40); ctx.fillStyle = '#2C1C26'; ctx.fill();
  // the ceiling
  ctx.fillStyle = '#3A2530'; ctx.fillRect(-300, -200 + pary, 1700, 420);
  paint(() => line(ctx, -300, 220 + pary, 1400, 220 + pary, 6, 'rgba(255,220,180,0.18)'));
  // the side window on the left: rain outside, a gingham curtain
  const wx = 20 + par, wy = 430 + pary;
  rrect(ctx, wx - 16, wy - 16, 312, 372, 40); ctx.fillStyle = '#4A2C22'; ctx.fill();
  rrect(ctx, wx, wy, 280, 340, 30); ctx.fillStyle = '#28406E'; ctx.fill();
  paint(() => {
    for (let i = 0; i < 26; i++) { const rx = wx + 14 + ((i * 53) % 252), ry = wy + ((t * 420 + i * 97) % 330); line(ctx, rx, ry, rx - 4, ry + 26, 2, 'rgba(190,215,255,0.5)'); }
    for (let i = 0; i < 4; i++) { const tx = wx + 30 + i * 70; ctx.fillStyle = '#16264A'; ctx.beginPath(); ctx.moveTo(tx, wy + 340); ctx.lineTo(tx + 30, wy + 170 + 30 * (i % 2)); ctx.lineTo(tx + 60, wy + 340); ctx.fill(); }
  });
  for (const sd of [0, 1]) {   // the curtain halves, tied back
    const cx = wx + (sd ? 236 : 0);
    ctx.beginPath(); ctx.moveTo(cx - 10, wy - 20); ctx.lineTo(cx + 60, wy - 20); ctx.quadraticCurveTo(cx + 30, wy + 170, cx + 46, wy + 360); ctx.lineTo(cx - 10, wy + 360); ctx.closePath();
    ctx.fillStyle = '#D9465A'; ctx.fill();
    paint(() => { ctx.save(); ctx.clip(); for (let k = 0; k < 14; k++) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cx - 10 + (k % 3) * 24, wy - 20 + Math.floor(k / 3) * 80, 12, 380); } ctx.restore(); });
  }
  // fairy lights in a swag across the top (they twinkle on loop clocks)
  const lights = [];
  for (let i = 0; i <= 15; i++) { const u = i / 15, lx = -120 + par + u * 1320, ly = 300 + pary + 70 * Math.sin(Math.PI * ((u * 3) % 1)); lights.push([lx, ly]); }
  paint(() => { ctx.beginPath(); lights.forEach(([lx, ly], i) => (i ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly))); ctx.lineWidth = 2.5; ctx.strokeStyle = '#2A1A14'; ctx.stroke(); });
  lights.forEach(([lx, ly], i) => {
    const tw = 0.75 + 0.25 * Math.sin(t * loopW(2 + (i % 4)) + i * 1.7), col = ['#FFD447', '#FF9A3C', '#FF86A6', '#7FE9FF'][i % 4];
    circle(ctx, lx, ly + 10, 9, col); softDot(gctx, lx, ly + 10, 46, col, 0.55 * tw);
  });
  // the shelf on the right: a kettle, two mugs, a jar
  const sx = 790 + par, sy = 660 + pary;
  rrect(ctx, sx - 20, sy, 330, 22, 6); ctx.fillStyle = '#4A2A1C'; ctx.fill();
  ctx.save(); ctx.translate(sx + 40, sy);
  ctx.beginPath(); ctx.moveTo(-36, 0); ctx.quadraticCurveTo(-46, -80, 0, -84); ctx.quadraticCurveTo(46, -80, 36, 0); ctx.closePath(); ctx.fillStyle = '#2FA7A0'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -84, 26, Math.PI, 0); ctx.lineWidth = 7; ctx.strokeStyle = '#1F6E6A'; ctx.stroke();
  line(ctx, 34, -50, 62, -70, 9, '#2FA7A0');
  paint(() => ellipse(ctx, -14, -46, 7, 20, 'rgba(255,255,255,0.3)'));
  ctx.restore();
  for (const [mx, col] of [[sx + 140, '#FFD447'], [sx + 200, '#9A62C4']]) { rrect(ctx, mx - 22, sy - 50, 44, 50, 9); ctx.fillStyle = col; ctx.fill(); }
  rrect(ctx, sx + 250, sy - 74, 46, 74, 10); ctx.fillStyle = 'rgba(200,230,255,0.55)'; ctx.fill();
  rrect(ctx, sx + 250, sy - 84, 46, 14, 4); ctx.fillStyle = '#C8743E'; ctx.fill();
  // a hanging plant, top right
  const px2 = 1010 + par, py2 = 330 + pary;
  line(ctx, px2, py2 - 140, px2, py2, 3, '#2A1A14');
  rrect(ctx, px2 - 44, py2, 88, 70, 18); ctx.fillStyle = '#C8743E'; ctx.fill();
  for (let i = 0; i < 7; i++) {
    const vx = px2 - 40 + i * 14, sway = 6 * Math.sin(t * loopW(1.3) + i);
    ctx.beginPath(); ctx.moveTo(vx, py2 + 40); ctx.quadraticCurveTo(vx + sway, py2 + 140, vx - 10 + sway, py2 + 200 + (i % 3) * 40);
    ctx.lineWidth = 4; ctx.strokeStyle = '#2E7A3E'; ctx.stroke();
    for (let k = 1; k < 5; k++) ellipse(ctx, vx + sway * k / 4 - 4, py2 + 40 + k * 44, 10, 6, k % 2 ? '#3FA35A' : '#57C06E', 0.6);
  }
  // the bunk behind, right of his seat: a patchwork quilt
  const bx = 640 + par, by = 1010 + pary;
  rrect(ctx, bx, by, 620, 170, 20); ctx.fillStyle = '#5A2F3E'; ctx.fill();
  const pat = ['#FFD447', '#FF86A6', '#7FE9FF', '#4DFFB4', '#FF9A3C', '#C8A8FF'];
  for (let i = 0; i < 8; i++) { rrect(ctx, bx + 14 + i * 74, by + 16, 68, 64, 10); ctx.fillStyle = pat[i % 6]; ctx.fill(); rrect(ctx, bx + 14 + i * 74, by + 86, 68, 64, 10); ctx.fillStyle = pat[(i + 3) % 6]; ctx.fill(); }
  rrect(ctx, bx + 40, by - 48, 160, 56, 24); ctx.fillStyle = '#9AD4E8'; ctx.fill();
  // his seat: the back and the headrest (brown leather) behind him (his head is at about y 1138, his shoulders 1308)
  const seatX = 540;
  rrect(ctx, seatX - 200, 1150, 400, 520, 70); ctx.fillStyle = '#6A3A2A'; ctx.fill();
  line(ctx, seatX - 64, 1110, seatX - 64, 1160, 14, '#2E2228'); line(ctx, seatX + 64, 1110, seatX + 64, 1160, 14, '#2E2228');
  rrect(ctx, seatX - 128, 905, 256, 220, 64); ctx.fillStyle = '#6A3A2A'; ctx.fill();
  paint(() => { for (const dx2 of [-120, 0, 120]) line(ctx, seatX + dx2, 1180, seatX + dx2, 1640, 3, 'rgba(40,16,10,0.35)'); line(ctx, seatX - 100, 1010, seatX + 100, 1010, 3, 'rgba(40,16,10,0.3)'); });
}
// the dashboard edge and the steering wheel in front of him (from the dashboard's own point of view)
function ffCabinFront(cam, t, o = {}) {
  applyCam(cam);
  ctx.beginPath(); ctx.ellipse(o.wx || 920, o.wy || 1980, 330, 300, 0, Math.PI * 1.02, Math.PI * 1.7); ctx.lineWidth = 62; ctx.strokeStyle = '#17141F'; ctx.stroke();
  paint(() => { ctx.beginPath(); ctx.ellipse(o.wx || 920, (o.wy || 1980) - 12, 330, 300, 0, Math.PI * 1.1, Math.PI * 1.4); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,220,240,0.2)'; ctx.stroke(); });
}

// ---------------------------------------------------------------- outside the back doors (pair, sync)
// world: the van's floor edge (where they sit) at FB.stepY; the opening spans x 160..920
const FB = { stepY: 1220, groundY: 1640 };
function ffBack(cam, t, o = {}) {
  applyCam(cam);
  // dusk sky and the woods
  const g = ctx.createLinearGradient(0, -200, 0, 1700);
  g.addColorStop(0, '#1F2560'); g.addColorStop(0.45, '#3A5A92'); g.addColorStop(0.75, '#5C6FA8'); g.addColorStop(1, '#2B3A5E');
  ctx.fillStyle = g; ctx.fillRect(-400, -400, 1900, 2600);
  const par = (cam.x - 540) * 0.3;
  for (let i = 0; i < 12; i++) {
    const x = -200 + i * 130 + par * 0.5, h = 420 + ((i * 37) % 5) * 60;
    ctx.fillStyle = i % 2 ? '#1B2C52' : '#16254A';
    ctx.beginPath(); ctx.moveTo(x, FB.groundY - h); ctx.lineTo(x + 90, FB.groundY); ctx.lineTo(x - 90, FB.groundY); ctx.closePath(); ctx.fill();
  }
  // the ground: wet grass, puddles
  ctx.fillStyle = '#23402E'; ctx.fillRect(-400, FB.groundY - 20, 1900, 900);
  paint(() => { for (let i = 0; i < 60; i++) { const gx = -300 + ((i * 71) % 1700), gy = FB.groundY + ((i * 53) % 300); line(ctx, gx, gy, gx + 6 * Math.sin(i), gy - 22, 4, i % 3 ? '#2F5A3A' : '#3E7330'); } });
  // the van's back: body, open doors, the lit interior
  rrect(ctx, 60, 300, 960, 1060, 70); ctx.fillStyle = '#8FD3C1'; ctx.fill();
  rrect(ctx, 60, 300, 960, 260, 70); ctx.fillStyle = '#F3E6C8'; ctx.fill();
  ctx.fillStyle = '#8FD3C1'; ctx.fillRect(60, 480, 960, 90);
  // the opening
  rrect(ctx, 170, 560, 740, 680, 26); ctx.fillStyle = '#3B2418'; ctx.fill();
  // inside: warm wood, a bunk, fairy lights
  ctx.save(); rrect(ctx, 170, 560, 740, 680, 26); ctx.clip();
  ctx.drawImage(FV_WOOD, 170, 560, 740, 680);
  ctx.restore();
  rrect(ctx, 190, 900, 700, 120, 16); ctx.fillStyle = '#5A2F3E'; ctx.fill();
  for (let i = 0; i < 7; i++) { rrect(ctx, 200 + i * 98, 910, 90, 50, 8); ctx.fillStyle = ['#FFD447', '#FF86A6', '#7FE9FF', '#4DFFB4', '#FF9A3C', '#C8A8FF', '#FFD447'][i]; ctx.fill(); }
  for (let i = 0; i <= 9; i++) {
    const lx = 200 + i * 75, ly = 600 + 26 * Math.sin(i * 1.1), col = ['#FFD447', '#FF9A3C', '#FF86A6', '#7FE9FF'][i % 4];
    circle(ctx, lx, ly, 8, col); softDot(gctx, lx, ly, 40, col, 0.5 * (0.8 + 0.2 * Math.sin(t * loopW(2.5) + i)));
  }
  softDot(gctx, 540, 860, 360, '#FFB060', 0.22);
  // the doors, swung open to the sides
  for (const sd of [-1, 1]) {
    const dx = sd < 0 ? -110 : 930;
    rrect(ctx, dx, 520, 260, 780, 30); ctx.fillStyle = '#7CC2B0'; ctx.fill();
    rrect(ctx, dx + 40, 590, 180, 220, 24); ctx.fillStyle = '#2E4A72'; ctx.fill();
    paint(() => line(ctx, dx + 60, 610, dx + 150, 602, 4, 'rgba(220,240,255,0.45)'));
  }
  // the bumper (their seat edge) and the tail lights
  rrect(ctx, 120, FB.stepY + 10, 840, 50, 18); ctx.fillStyle = '#B9C2CF'; ctx.fill();
  paint(() => line(ctx, 140, FB.stepY + 20, 940, FB.stepY + 20, 4, 'rgba(255,255,255,0.6)'));
  for (const lx of [92, 988]) { rrect(ctx, lx - 22, 1100, 44, 100, 12); ctx.fillStyle = '#E8504E'; ctx.fill(); softDot(gctx, lx, 1150, 70, '#FF4A4A', 0.45); }
  // the awning overhead: striped canvas, its posts
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-200, 300); ctx.lineTo(1280, 300); ctx.lineTo(1340, 470); ctx.lineTo(-260, 470); ctx.closePath(); ctx.clip();
  for (let i = -6; i < 16; i++) { ctx.fillStyle = i % 2 ? '#F3E6C8' : '#E8504E'; ctx.beginPath(); ctx.moveTo(-200 + i * 100, 300); ctx.lineTo(-100 + i * 100, 300); ctx.lineTo(-100 + i * 110, 470); ctx.lineTo(-200 + i * 110, 470); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // the scalloped edge
  for (let i = -3; i < 16; i++) { ctx.beginPath(); ctx.arc(-200 + i * 110 + 55, 470, 55, 0, Math.PI); ctx.fillStyle = i % 2 ? '#F3E6C8' : '#E8504E'; ctx.fill(); }
  // a lantern under the awning, right
  const lw = 0.06 * Math.sin(t * loopW(1.9));
  ctx.save(); ctx.translate(880, 520); ctx.rotate(lw);
  line(ctx, 0, 0, 0, 60, 3, '#2A1A14');
  rrect(ctx, -26, 60, 52, 70, 12); ctx.fillStyle = '#2A1A14'; ctx.fill();
  rrect(ctx, -18, 68, 36, 54, 8); ctx.fillStyle = '#FFD27A'; ctx.fill();
  ctx.restore();
  softDot(gctx, 880 + Math.sin(lw) * -90, 615, 170, '#FFB04A', 0.75);
}
// in front of them: the dripping edge of the awning and the near puddles
function ffBackFront(cam, t, o = {}) {
  applyCam(cam);
  // puddles in front of the step
  for (const [px, py, rx] of [[330, FB.groundY + 60, 170], [760, FB.groundY + 90, 150]]) {
    ellipse(ctx, px, py, rx, 34, '#3A4E78');
    paint(() => {
      ellipse(ctx, px - rx * 0.3, py - 6, rx * 0.4, 8, 'rgba(255,210,140,0.35)');
      for (let k = 0; k < 3; k++) { const ph = (t * 1.3 + k / 3 + px * 0.001) % 1; ctx.beginPath(); ctx.ellipse(px + (k - 1) * 60, py, 10 + 50 * ph, 3 + 10 * ph, 0, 0, 7); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(220,235,255,${0.45 * (1 - ph)})`; ctx.stroke(); }
    });
  }
  // drips falling off the awning's edge
  paint(() => {
    for (let i = 0; i < 24; i++) {
      const dx = -150 + i * 62, ph = (t * (1.1 + (i % 3) * 0.2) + i * 0.37) % 1, dy = 520 + ph * 1200;
      line(ctx, dx, dy, dx, dy + 34, 3, 'rgba(210,230,255,0.55)');
    }
  });
}
