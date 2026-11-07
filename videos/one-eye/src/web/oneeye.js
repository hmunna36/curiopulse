// Why Can't You Move Just ONE Eye? Short (8 Nov 2026): the hiker close up on a hot day in a mountain meadow (trail.js's
// sky, sun, clouds and ridges behind him, a green slope of wildflowers, prayer flags and a trail sign), two butterflies,
// his eyes drawn big in head units (eyes.js's look, one eye can shut, a ghost iris under a shut lid), the LEASH: a little
// pink brain on top of his head holding one red handle whose lead splits and clips onto BOTH irises; his fingertip on a
// shut lid; a chameleon on a branch whose own tiny brain holds TWO leads, one per eye turret, and a sticky tongue; a fly.
//   oeBack(cam, t, o)            the far view (moves only a little with the camera); OE_BGDY: < 0 low angle, > 0 high
//   oeHero(cam, t, A)            him, from a description A (below); returns points in world coords
//   oeEyes(c, pal, F, t)         the eyes (head units); returns the irises [[x, y], [x, y]] (screen-left, screen-right)
//   oeLeash(c, P, L, t)          the lead from the handle to both irises (head units)
//   oeBrain(c, x, y, s, t, o)    the brain with arms (time-flies' tfBrain, renamed)
//   oeButterfly(c, x, y, s, t, o), oeCham(c, x, y, s, t, o), oeBranch(c, t), oeFly(c, x, y, s, t, o)
// Rig-local units: his feet at 0,0, his head's middle at (0, -470). Head units: the head's middle at 0,0, eyes at (+-24, -2),
// the nose at (0, 16), the mouth at (0, 40), the top of his hair at about -88. Everything ambient runs on loopW().
'use strict';

const OE = { hx: 540, hy: 1500, hs: 1 };
const OE_HEAD = [OE.hx, OE.hy - 470 * OE.hs];
const OE_CAMY = 1000;
const OEC = { lead: '#E8323F', leadDk: '#8E1420', leadHi: '#FF8A92', metal: '#C9CED8', metalDk: '#6E7486', gold: '#FFD447',
  cham: '#4CC35A', chamDk: '#23803A', chamHi: '#9BEA7A', chamBelly: '#C9F27A', tongue: '#FF7AA2', tongueDk: '#C2345E',
  bark: '#7A4A2A', barkDk: '#4A2A16', leaf: '#3FA24A', leafDk: '#22702E', mask: '#3B4FB8', maskDk: '#24307A' };
const OEPAL = Object.assign({}, PAL, {});
let OE_BGDY = 0;                     // the camera's height for the far view (the cinema kit: low / high angles)
let OE_FLOWERS = null;

function initOneEye() {
  initTrail();
  const r = mulberry32(4242), cols = ['#FF5A6E', '#FFD447', '#FFFFFF', '#C8A8FF', '#FF9A3C', '#FF86A6'];
  OE_FLOWERS = [];
  for (let i = 0; i < 150; i++) {
    const u = r(), y = 1330 + 520 * Math.pow(r(), 1.6);
    OE_FLOWERS.push({ x: -300 + 1700 * u, y, s: 0.5 + 1.4 * (y - 1330) / 520, col: cols[Math.floor(r() * cols.length)], ph: r() * 6.28 });
  }
  OE_FLOWERS.sort((a, b) => a.y - b.y);
}

// ---------------------------------------------------------------- the far view
function oeBgCam(cam) {
  return { x: 540 + (cam.x - 540) * 0.25, y: 1150 + (cam.y - OE_CAMY) * 0.25 + OE_BGDY, zoom: 1.06 + 0.05 * (cam.zoom - 2.5), rot: 0,
    sx: (cam.sx || 0) * 0.15, sy: (cam.sy || 0) * 0.15 };
}
function oeBack(cam, t, o = {}) {
  const bc = oeBgCam(cam);
  screenSpace(); ctx.fillStyle = '#1767D4'; ctx.fillRect(0, 0, W, H);
  trSky(bc, t, { blue: 1 });
  trSun(bc, t, { blue: 1, at: o.sunAt || [230, 500], r: 50, rays: 0.55, glow: 0.9 });
  trClouds(bc, t, { k: 1 });
  trRidges(bc, t, { blue: 1 });
  oeFlags(bc, t);
  oeMeadow(bc, t);
  // heat motes drifting up (the loop clock)
  screenSpace();
  for (let i = 0; i < 12; i++) {
    const r = mulberry32(700 + i), ph = r() * 6.28;
    const px = 1080 * r() + 30 * Math.sin(t * loopW(1.1 + r()) + ph), py = 1920 * (1 - ((r() + t / TLd.duration * (1 + Math.floor(r() * 2))) % 1));
    softDot(gctx, px, py, 6 + r() * 7, '#FFF2C0', 0.22);
  }
}
// prayer flags across the pass (lick-elbow's, 7 Nov 2026: the cinema kit's dressed set)
const OE_FLAGC = ['#2F6FE0', '#F4F4F0', '#E8443A', '#2FA65A', '#FFC93A'];
function oeFlags(bc, t) {
  applyCam(bc);
  const strings = [[-260, 760, 1340, 700, 140], [-200, 980, 1300, 1040, 90]];
  strings.forEach(([x0, y0, x1, y1, sag], si) => {
    const P = (u) => [lerp(x0, x1, u), lerp(y0, y1, u) + sag * 4 * u * (1 - u)];
    ctx.lineWidth = 2.2; ctx.strokeStyle = rgba('#3A2E28', 0.75); ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const p = P(i / 40); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } ctx.stroke();
    const n = si ? 16 : 22;
    for (let i = 1; i < n; i++) {
      const u = i / n, p = P(u), q = P(u + 0.5 / n), a = Math.atan2(q[1] - p[1], q[0] - p[0]);
      const fl = 0.18 * Math.sin(t * loopW(5.2) + i * 1.7 + si) + 0.1 * Math.sin(t * loopW(9.1) + i);
      const w = si ? 30 : 38, h = si ? 34 : 44;
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0);
      ctx.quadraticCurveTo(w + 6 * fl, h * 0.5, w * (1 + 0.15 * fl), h); ctx.lineTo(4 * fl, h * (1 - 0.06 * fl)); ctx.closePath();
      ctx.fillStyle = OE_FLAGC[(i + si * 2) % 5]; ctx.fill();
      ctx.restore();
    }
  });
}
// the meadow: a green slope with wildflowers in front of the ridges, and a wooden trail sign (far camera)
function oeMeadow(bc, t) {
  applyCam(bc);
  const g = ctx.createLinearGradient(0, 1300, 0, 2000);
  g.addColorStop(0, '#5DBB4A'); g.addColorStop(0.45, '#3E9A3A'); g.addColorStop(1, '#2A7A2E');
  ctx.beginPath(); ctx.moveTo(-400, 1400);
  for (let i = 0; i <= 24; i++) { const x = -400 + i * 80; ctx.lineTo(x, 1360 - 40 * Math.sin(i * 0.55) - 18 * Math.sin(i * 1.7)); }
  ctx.lineTo(1600, 2400); ctx.lineTo(-400, 2400); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  // the trail: a pale path winding down the slope
  ctx.beginPath(); ctx.moveTo(820, 1350); ctx.quadraticCurveTo(700, 1500, 900, 1700); ctx.quadraticCurveTo(1060, 1900, 820, 2300);
  ctx.lineTo(1180, 2300); ctx.quadraticCurveTo(1280, 1900, 1060, 1700); ctx.quadraticCurveTo(880, 1520, 860, 1350); ctx.closePath();
  ctx.fillStyle = '#D9C48A'; ctx.fill();
  for (const f of OE_FLOWERS) {
    const sw = 2 * Math.sin(t * loopW(1.6) + f.ph);
    line(ctx, f.x, f.y, f.x + sw, f.y - 14 * f.s, 2.2 * f.s, '#2E7A2A');
    circle(ctx, f.x + sw, f.y - 15 * f.s, 5 * f.s, f.col);
    circle(ctx, f.x + sw, f.y - 15 * f.s, 1.8 * f.s, '#FFB02A');
  }
  // the trail sign, on the right
  const sx = 1010, sy = 1500;
  line(ctx, sx, sy, sx, sy - 210, 16, OEC.barkDk); line(ctx, sx - 2, sy, sx - 2, sy - 208, 11, OEC.bark);
  for (const [dy, dir, txt] of [[-196, 1, 'SUMMIT'], [-148, -1, 'LAKE']]) {
    ctx.save(); ctx.translate(sx, sy + dy); ctx.scale(dir, 1);
    ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(96, -20); ctx.lineTo(118, 0); ctx.lineTo(96, 20); ctx.lineTo(-30, 20); ctx.closePath();
    ctx.fillStyle = '#B07A44'; ctx.fill();
    ctx.restore();
    paint(() => { ctx.font = '900 22px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4A2A16'; ctx.fillText(txt, sx + dir * 42, sy + dy + 1); });
  }
}

// ---------------------------------------------------------------- the eyes (eyes.js's, one can shut)
// F = {lx, ly (-1..1), cross 0..1, squint, open, smear {x0, x1, k, at}, shutR 0..1 (his right eye = screen-left),
//      ghost 0..1 (the iris seen through a shut lid), mask 0..1 (a sleep mask on that ghost), big}
const OE_EYE = { x: 24, y: -2, rx: 15.4, ry: 16.4, IR: 9.0, SPAN: 6.2 };
function oeIrisAt(F, s) {
  const lx = clamp((F.lx || 0) - s * 0.72 * clamp(F.cross || 0), -1.15, 1.15), ly = F.ly || 0;
  return [s * OE_EYE.x + lx * OE_EYE.SPAN, OE_EYE.y + ly * 5.2];
}
function oeEyes(c, pal, F = {}, t = 0) {
  const open = F.open === undefined ? 1 : F.open, sq = clamp(F.squint || 0), col = F.iris || ES_IRIS.hero, R = OE_EYE.IR * (F.big || 1);
  const out = [];
  for (const s of [-1, 1]) {
    const ex = s * OE_EYE.x, ey = OE_EYE.y, rx = OE_EYE.rx, ry = OE_EYE.ry * open;
    const p = oeIrisAt(F, s), shut = s < 0 ? clamp(F.shutR || 0) : clamp(F.shutL || 0);
    out.push(p);
    const lid = mixHex(pal.skin, pal.skinSh, 0.25);
    paint(() => {
      if (shut < 0.93) {
        ellipse(c, ex, ey, rx, ry, '#FFFFFF');
        c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.clip();
        ellipse(c, ex, ey - ry * 0.55, rx, ry * 0.5, 'rgba(150,170,200,0.16)');
        const sm = F.smear && F.smear.k > 0.01 ? F.smear : null;
        if (sm) for (let i = 0; i <= 8; i++) {
          const lxx = lerp(sm.x0, sm.x1, i / 8) - s * 0.72 * clamp(F.cross || 0);
          esIris(c, ex + lxx * OE_EYE.SPAN, p[1], 0.3 * sm.k, col, R);
        }
        esIris(c, p[0], p[1], sm ? 1 - 0.45 * sm.k : 1, col, R);
        circle(c, p[0] - R * 0.3, p[1] - R * 0.36, R * 0.27, 'rgba(255,255,255,0.95)'); circle(c, p[0] + R * 0.28, p[1] + R * 0.26, R * 0.12, 'rgba(255,255,255,0.8)');
        if (shut > 0.01) {                                                        // the lid coming down
          c.fillStyle = lid; c.fillRect(ex - rx - 1, ey - ry - 2, 2 * rx + 2, (2 * ry + 2) * shut + 1);
          line(c, ex - rx, ey - ry + 2 * ry * shut, ex + rx, ey - ry + 2 * ry * shut, 2.6, '#6A3526');
        }
        if (sq > 0.01) {
          const top = ey + ry - 2 * ry * 0.42 * sq;
          c.fillStyle = lid; c.fillRect(ex - rx - 1, top, 2 * rx + 2, ry * 2);
          c.beginPath(); c.moveTo(ex - rx, top + 3); c.quadraticCurveTo(ex, top - 2.5, ex + rx, top + 3); c.lineWidth = 2.2; c.strokeStyle = 'rgba(106,53,38,0.8)'; c.stroke();
        }
        c.restore();
        c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.lineWidth = 1.1; c.strokeStyle = 'rgba(120,60,40,0.45)'; c.stroke();
        if (shut < 0.85) {
          const yl = ey - ry + 2 * ry * shut;
          c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, Math.PI * 1.12, Math.PI * 1.88); c.lineWidth = 2.4; c.lineCap = 'round'; c.strokeStyle = '#3A1E16';
          if (shut < 0.02) c.stroke(); else line(c, ex - rx * 0.85, yl, ex + rx * 0.85, yl, 2.4, '#3A1E16');
        }
      } else {
        // shut: the lid (a soft dome of skin), the bulge of the eye under it where it looks, the lash curve
        ellipse(c, ex, ey, rx + 0.6, ry * 0.98, lid);
        const bx = p[0], by = p[1] - 1;
        ellipse(c, bx, by, R * 1.15, R * 1.0, rgba(pal.skinHi || '#FFD9B8', 0.55));
        ellipse(c, bx - R * 0.3, by - R * 0.35, R * 0.42, R * 0.28, 'rgba(255,240,226,0.55)');
        const gk = clamp(F.ghost || 0);
        if (gk > 0.01) {                                                          // x-ray: the iris under the lid, still on its lead
          c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.clip();
          esIris(c, p[0], p[1], 0.5 * gk, col, R);
          c.beginPath(); c.ellipse(ex, ey, rx - 0.6, ry - 0.6, 0, 0, 7); c.setLineDash([2.2, 2.2]); c.lineWidth = 1.2; c.strokeStyle = rgba('#FFFFFF', 0.7 * gk); c.stroke(); c.setLineDash([]);
          c.restore();
          const mk = clamp(F.mask || 0);
          if (mk > 0.01) {                                                        // a tiny sleep mask on the ghost: blindfolded
            const e = E.outBack(mk, 2.4);
            c.save(); c.translate(p[0], p[1] - 1); c.scale(e, e);
            line(c, -R * 1.25, -R * 0.15, R * 1.25, -R * 0.15, 1.6, OEC.maskDk);
            c.beginPath(); c.moveTo(-R * 0.95, -R * 0.62); c.quadraticCurveTo(0, -R * 0.9, R * 0.95, -R * 0.62); c.quadraticCurveTo(R * 1.1, R * 0.3, R * 0.5, R * 0.42);
            c.quadraticCurveTo(0, R * 0.2, -R * 0.5, R * 0.42); c.quadraticCurveTo(-R * 1.1, R * 0.3, -R * 0.95, -R * 0.62); c.closePath();
            c.fillStyle = OEC.mask; c.fill();
            for (const sx of [-0.45, 0.45]) { c.beginPath(); c.moveTo(R * (sx - 0.28), -R * 0.1); c.quadraticCurveTo(R * sx, R * 0.12, R * (sx + 0.28), -R * 0.1); c.lineWidth = 1.2; c.strokeStyle = '#C8D4FF'; c.stroke(); }
            c.restore();
          }
        }
        c.beginPath(); c.moveTo(ex - rx * 0.92, ey + 1); c.quadraticCurveTo(ex, ey + ry * 0.75, ex + rx * 0.92, ey + 1);
        c.lineWidth = 3.2; c.strokeStyle = '#5A2E22'; c.lineCap = 'round'; c.stroke();
        line(c, ex + s * rx * 0.88, ey + 1, ex + s * (rx + 4), ey - 3, 2.4, '#5A2E22');
      }
    });
  }
  return out;
}

// ---------------------------------------------------------------- the leash (head units)
// L = {k 0..1 (drawn on: the main lead, then the two branches, then the clips), H: [x, y] the handle, taut 0..1,
//      sag: extra slack, hide: [bool, bool] (skip a branch), one: true (a single lead per eye: the chameleon's)}
function oeLeadPath(c, a, b, sag, k) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
  const n = 14, pts = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * k;
    pts.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1]]);
  }
  return pts;
}
function oeStrap(c, pts, w) {
  if (pts.length < 2) return;
  const draw = (lw, col) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.lineWidth = lw; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  draw(w + 1.8, OEC.leadDk); draw(w, OEC.lead);
  c.setLineDash([1.6, 1.8]); draw(Math.max(0.5, w * 0.16), rgba(OEC.leadHi, 0.9)); c.setLineDash([]);
}
function oeClip(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s * 1.35, s * 1.35);
  c.beginPath(); c.ellipse(0, 0, 3.2, 2.4, 0, 0, 7); c.lineWidth = 1.6; c.strokeStyle = OEC.metalDk; c.stroke();
  c.beginPath(); c.ellipse(0, 0, 3.2, 2.4, 0, 0, 7); c.lineWidth = 0.9; c.strokeStyle = '#F4F6FA'; c.stroke();
  rrect(c, -1.6, -6.5, 3.2, 4.4, 1.2); c.fillStyle = OEC.metal; c.fill();
  c.restore();
}
function oeLeash(c, P, L = {}, t = 0) {
  const k = clamp(L.k === undefined ? 1 : L.k);
  if (k <= 0.001) return null;
  const H = L.H || [0, -84], taut = clamp(L.taut || 0), sag0 = (L.sag === undefined ? 6 : L.sag) * (1 - taut);
  const clips = P.map((p) => [p[0], p[1] - OE_EYE.IR * 0.92]);
  const S = [lerp((clips[0][0] + clips[1][0]) / 2, H[0], 0.35), lerp(-34, H[1], 0.12)];
  const k1 = clamp(k / 0.45), k2 = clamp((k - 0.45) / 0.45), k3 = clamp((k - 0.9) / 0.1);
  paint(() => {
    oeStrap(c, oeLeadPath(c, H, S, sag0 * 0.6, k1), 4.2);
    if (k2 > 0) clips.forEach((q, i) => { if (!(L.hide && L.hide[i])) oeStrap(c, oeLeadPath(c, S, q, sag0 * 0.5, k2), 3.2); });
    if (k1 >= 1) { circle(c, S[0], S[1], 3.4, OEC.metalDk); circle(c, S[0], S[1], 2.2, OEC.metal); circle(c, S[0] - 0.7, S[1] - 0.7, 0.8, '#FFFFFF'); }
    if (k3 > 0) clips.forEach((q, i) => { if (!(L.hide && L.hide[i])) oeClip(c, q[0], q[1], E.outBack(k3, 2.6)); });
    // the handle loop
    c.beginPath(); c.ellipse(H[0], H[1] - 8, 8.5, 10.5, 0, 0, 7); c.lineWidth = 6; c.strokeStyle = OEC.leadDk; c.stroke();
    c.lineWidth = 4.2; c.strokeStyle = OEC.lead; c.stroke();
    c.beginPath(); c.ellipse(H[0], H[1] - 8, 8.5, 10.5, 0, 0, 7); c.setLineDash([1.6, 1.8]); c.lineWidth = 0.7; c.strokeStyle = rgba(OEC.leadHi, 0.9); c.stroke(); c.setLineDash([]);
  });
  return { H, S, clips };
}

// ---------------------------------------------------------------- the brain (time-flies' tfBrain, renamed; 9 Oct 2026)
// o: {look: [x, y] -1..1, mood: 'calm' | 'worried' | 'squint' | 'think' | 'shrug' | 'grin' | 'sad' | 'wow', lean, bob,
//  armL / armR: hand targets in the brain's own units, still, shut}
function oeBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * loopW(2.4))) + (o.bob || 0);
  c.save(); c.translate(x, y + bob * s * 0.6); c.scale(s, s); c.rotate(o.lean || 0);
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    circle(c, tx, ty, 21, '#FFA9C0'); circle(c, tx + sd * 12, ty - 14, 9, '#FFA9C0');
  };
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = '#FF93B0'; c.fill();
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    const lx = look[0] * 9, ly = look[1] * 7, shut = o.shut || 0;
    const ry = mood === 'squint' ? 13 : mood === 'worried' || mood === 'wow' ? 34 : mood === 'grin' ? 24 : mood === 'sad' ? 25 : 28;
    for (const ex of [-44, 38]) {
      if (shut > 0.6) { c.beginPath(); c.moveTo(ex - 22, 2); c.quadraticCurveTo(ex, 18, ex + 22, 2); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke(); continue; }
      ellipse(c, ex, 4, 25, ry * (1 - 0.5 * shut), '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry * (1 - 0.5 * shut), 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' || mood === 'wow' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    }
    const bt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : 0, by = mood === 'worried' || mood === 'wow' ? -46 : mood === 'squint' ? -24 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    if (mood === 'worried' || mood === 'wow') ellipse(c, -2, 64, mood === 'wow' ? 19 : 15, mood === 'wow' ? 17 : 12, '#5A1522');
    else if (mood === 'grin' || mood === 'shrug') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'sad') { c.beginPath(); c.moveTo(-18, 68); c.quadraticCurveTo(0, 54, 18, 68); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  if (!o.noArms) { arm(-1, o.armL); arm(1, o.armR); }
  c.restore();
}
// the brain on top of his head, holding the handle: B = where it sits (head units), dx = how far it tugs (head units)
function oeBrainLeash(c, P, A, t) {
  const B = A.B || [0, -124], s = A.bs || 0.25, k = clamp(A.k === undefined ? 1 : A.k);
  if (k <= 0.001) return null;
  const e = E.outBack(k, 2.2), dx = A.dx || 0, dy = A.dy || 0;
  const H = [B[0] + dx, B[1] + 196 * s + dy];
  c.save(); c.translate(B[0], B[1] + 26 * (1 - e)); c.scale(e, e); c.translate(-B[0], -B[1]);
  actor(() => oeBrain(c, B[0] + dx * 0.25, B[1], s, t, { mood: A.mood || 'calm', look: A.look || [0, 0.6], lean: (A.lean || 0) + dx * 0.012,
    armL: [(dx - 7) / s, 150 + dy / s], armR: [(dx + 7) / s, 150 + dy / s], noArms: true }));
  c.restore();
  const L = oeLeash(c, P, Object.assign({}, A.leash || {}, { H: [lerp(B[0], H[0], 1), lerp(B[1] + 26, H[1], e)] }), t);
  // the arms over the handle (so the fists hold it)
  c.save(); c.translate(B[0], B[1] + 26 * (1 - e)); c.scale(e, e); c.translate(-B[0], -B[1]);
  actor(() => {
    c.save(); c.translate(B[0] + dx * 0.25, B[1]); c.scale(s, s); c.rotate((A.lean || 0) + dx * 0.012);
    for (const sd of [-1, 1]) {
      const sx = sd * 132, sy = 40, tx = (H[0] - B[0] - dx * 0.25) / s + sd * 26, ty = (H[1] - 8 - B[1]) / s;
      const mx = (sx + tx) / 2 + sd * 40, my = (sy + ty) / 2 + 10;
      c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 26; c.lineCap = 'round'; c.strokeStyle = '#D9587E'; c.stroke();
      c.lineWidth = 19; c.strokeStyle = '#E0688E'; c.stroke();
      circle(c, tx, ty, 30, '#E0688E'); circle(c, tx, ty, 26, '#FFA9C0');
      paint(() => { for (let i = -1; i <= 1; i++) line(c, tx - sd * 16, ty + i * 9, tx - sd * 4, ty + i * 9, 3, 'rgba(200,80,120,0.55)'); });
    }
    c.restore();
  });
  c.restore();
  return L;
}

// ---------------------------------------------------------------- the hero
function oeHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function oeInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
// his right hand (screen left) with a fingertip on his shut right eye: k 0 down at his side .. 1 the fingertip on the lid
const OE_FINGER_TIP = [-24, -478];                       // rig-local: the middle of his right (screen-left) lid
function oeFingerPose(pose, k, wob = 0) {
  const d = [0.42, -0.91], tip = [OE_FINGER_TIP[0] + wob, OE_FINGER_TIP[1]];
  const up = { e: [-92 - 40 * (1 - k), -330 + 70 * (1 - k)], w: [tip[0] - 70 * d[0], tip[1] - 70 * d[1]] };
  const down = { e: [-110, -270], w: [-118, -180] };
  const q = armMix(down, up, E.inOutCubic(clamp(k)));
  const p = armAt(pose, 'L', q.e, q.w);
  p.handL = k > 0.4 ? 'point' : 'open';
  return p;
}
// A = {face, pose, headRot, headDX, headDY, eyes: F, brain: {k, dx, dy, mood, look, leash: {k, taut, sag}}, finger: 0..1,
//      sweat, post(c, rr, st): more in rig-local units, head(c): more in head units}
function oeHero(cam, t, A = {}) {
  const pal = A.pal || OEPAL;
  const st = { x: OE.hx, y: OE.hy, s: OE.hs, pose: A.pose || POSES.stand, face: A.face || FACES.calm, headRot: A.headRot || 0,
    headDX: A.headDX || 0, headDY: A.headDY || 0 };
  const out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: 0.03, light: 0,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      oeInHead(lc, s2, (c) => {
        out.iris = oeEyes(c, pal, A.eyes || {}, t);
        if (A.brain) out.leash = oeBrainLeash(c, out.iris, A.brain, t);
        if ((A.sweat || 0) > 0.02) paint(() => sweatDrop(c, 56, -38 + 24 * A.sweat, 0.5, A.sweat));
        if (A.head) A.head(c);
      });
      // the hand at his face is drawn again here (the head is drawn last): forearm, cuff, hand, finger
      if ((A.finger || 0) > 0.3) {
        const k = 'L', el = rr['el' + k], wr = rr['wr' + k], d = rr['armDir' + k];
        actor(() => {
          capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);
          line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);
          drawHand(lc, wr, d, 'point', pal, -1, t);
        });
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
      out.rr = rr;
    },
  });
  const rp = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  out.st = st; out.r = r; out.rp = rp;
  out.head = rp(oeHeadLocal(st, 0, 0)); out.nose = rp(oeHeadLocal(st, 0, 14));
  out.eyeL = rp(oeHeadLocal(st, -24, -2)); out.eyeR = rp(oeHeadLocal(st, 24, -2));
  return out;
}

// ---------------------------------------------------------------- butterflies (world; s = 1 is ~70 px across)
// o = {col: [main, dark, spot], flap phase, rot, look}
function oeButterfly(c, x, y, s, t, o = {}) {
  const col = o.col || ['#FF8A1E', '#3A1A0A', '#FFFFFF'];
  const fl = Math.abs(Math.sin(t * loopW(11) + (o.ph || 0)));        // 0 shut .. 1 open
  const wx = 0.25 + 0.75 * fl;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  actor(() => {
    for (const sd of [-1, 1]) {
      c.save(); c.scale(sd * wx, 1);
      c.beginPath(); c.moveTo(0, -2); c.bezierCurveTo(10, -34, 40, -38, 38, -14); c.bezierCurveTo(36, -4, 18, 0, 0, 2); c.closePath();
      c.fillStyle = col[1]; c.fill();
      c.beginPath(); c.moveTo(1, -3); c.bezierCurveTo(10, -30, 35, -33, 33, -14); c.bezierCurveTo(31, -6, 16, -2, 1, 1); c.closePath();
      c.fillStyle = col[0]; c.fill();
      c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(14, 4, 30, 10, 24, 26); c.bezierCurveTo(18, 34, 6, 22, 0, 8); c.closePath();
      c.fillStyle = col[1]; c.fill();
      c.beginPath(); c.moveTo(1, 3); c.bezierCurveTo(13, 6, 26, 11, 21, 24); c.bezierCurveTo(16, 30, 7, 20, 1, 8); c.closePath();
      c.fillStyle = col[0]; c.fill();
      c.restore();
    }
    rrect(c, -2.6, -14, 5.2, 34, 2.6); c.fillStyle = '#2A1A10'; c.fill();
    circle(c, 0, -16, 3.6, '#2A1A10');
  });
  paint(() => {
    for (const sd of [-1, 1]) { circle(c, sd * 26 * wx, -20, 2.6, col[2]); circle(c, sd * 30 * wx, -14, 1.8, col[2]); }
    line(c, -1, -18, -8, -30, 1.1, '#2A1A10'); line(c, 1, -18, 8, -30, 1.1, '#2A1A10');
    circle(c, -8, -30, 1.4, '#2A1A10'); circle(c, 8, -30, 1.4, '#2A1A10');
  });
  c.restore();
}

// ---------------------------------------------------------------- the chameleon (world; s = 1: about 150 px long)
// facing screen-left. o = {eyeF: angle of its near eye's look (radians, 0 = screen-right, PI = screen-left), eyeB: the far
// eye's, tongue: 0..1 how far out, tip: [x, y] world (where the tongue goes), brain: 0..1 (its tiny brain with TWO leads),
// tug: [-1..1, -1..1] how its brain's two fists move, curl}
const OE_CHAM_EYES = [[-46, -30], [-30, -44]];         // the near eye turret and the far one (local, s = 1)
function oeChamEye(c, x, y, r, a, t) {
  circle(c, x, y, r + 1.6, OEC.chamDk); circle(c, x, y, r, OEC.cham);
  paint(() => {
    for (let i = 1; i <= 2; i++) { c.beginPath(); c.arc(x + Math.cos(a) * r * 0.22 * i, y + Math.sin(a) * r * 0.22 * i, r * (1 - 0.3 * i), 0, 7); c.lineWidth = 1.2; c.strokeStyle = rgba(OEC.chamDk, 0.6); c.stroke(); }
    const px = x + Math.cos(a) * r * 0.62, py = y + Math.sin(a) * r * 0.62;
    circle(c, px, py, r * 0.36, '#FFF6C8'); circle(c, px + Math.cos(a) * r * 0.08, py + Math.sin(a) * r * 0.08, r * 0.24, '#111018');
    circle(c, px - r * 0.1, py - r * 0.12, r * 0.07, '#FFFFFF');
  });
}
function oeCham(c, x, y, s, t, o = {}) {
  const out = {};
  c.save(); c.translate(x, y); c.scale(s, s);
  const br = 0.6 * Math.sin(t * loopW(2.1));                          // breathing
  actor(() => {
    // the tail, curled (behind the branch on the right)
    c.beginPath(); c.moveTo(40, -4);
    for (let i = 0; i <= 20; i++) { const u = i / 20, a = u * 4.2 * (o.curl || 1), R = 34 * (1 - 0.72 * u); c.lineTo(56 + 26 * u + R * Math.sin(a) * 0.7, 6 + 18 * u + R * (1 - Math.cos(a)) * 0.7); }
    c.lineWidth = 11; c.lineCap = 'round'; c.strokeStyle = OEC.chamDk; c.stroke(); c.lineWidth = 7.5; c.strokeStyle = OEC.cham; c.stroke();
    // the body: a leaf shape with a crest down its back
    c.beginPath(); c.moveTo(-40, -14); c.bezierCurveTo(-30, -44 - br, 30, -46 - br, 52, -10); c.bezierCurveTo(40, 14 + br, -20, 18 + br, -40, 6); c.closePath();
    c.fillStyle = OEC.cham; c.fill();
    c.beginPath(); c.moveTo(-36, 4); c.bezierCurveTo(-10, 16 + br, 30, 12 + br, 46, -4); c.lineTo(46, 0); c.bezierCurveTo(28, 16, -10, 20, -36, 8); c.closePath();
    c.fillStyle = OEC.chamBelly; c.fill();
    // legs gripping the branch
    for (const [lx, ly, d] of [[-24, 8, -1], [26, 8, 1]]) {
      line(c, lx, ly, lx + d * 6, ly + 16, 8, OEC.chamDk); line(c, lx, ly, lx + d * 6, ly + 16, 5.5, OEC.cham);
      circle(c, lx + d * 6, ly + 19, 4.6, OEC.chamDk);
    }
    // the head with its casque, the mouth line, facing left
    c.beginPath(); c.moveTo(-36, -16); c.quadraticCurveTo(-50, -56, -30, -64); c.quadraticCurveTo(-22, -48, -12, -36); c.closePath();
    c.fillStyle = OEC.chamDk; c.fill();
    c.beginPath(); c.moveTo(-34, -26); c.quadraticCurveTo(-58, -36, -74, -18); c.quadraticCurveTo(-76, -6, -62, -2); c.quadraticCurveTo(-46, 2, -34, 0); c.closePath();
    c.fillStyle = OEC.cham; c.fill();
  });
  paint(() => {
    for (let i = 0; i < 9; i++) circle(c, -26 + i * 9, -36 - br + 6 * Math.sin(i * 0.9), 2.2, OEC.chamHi);       // spots
    c.beginPath(); c.moveTo(-72, -12); c.quadraticCurveTo(-56, -8, -40, -12); c.lineWidth = 1.8; c.strokeStyle = OEC.chamDk; c.stroke();
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-10 + i * 12, -38 - br); c.lineTo(-6 + i * 12, -46 - br); c.lineWidth = 2; c.strokeStyle = OEC.chamDk; c.stroke(); }
  });
  // its eyes: two turrets that each look their own way
  const eA = [o.eyeF === undefined ? Math.PI : o.eyeF, o.eyeB === undefined ? 0 : o.eyeB];
  out.eyes = [];
  [1, 0].forEach((i) => { const [ex, ey] = OE_CHAM_EYES[i]; actor(() => oeChamEye(c, ex, ey, i ? 9.5 : 11, eA[i], t)); out.eyes[i] = [x + ex * s, y + ey * s]; });
  // its tiny brain holding two leads, one per eye
  const bk = clamp(o.brain || 0);
  if (bk > 0.01) {
    const e = E.outBack(bk, 2.2), B = [-14, -100], bs = 0.17 * e, tug = o.tug || [0, 0];
    actor(() => oeBrain(c, B[0], B[1], bs, t, { mood: o.mood || 'think', look: o.blook || [-0.4, 0.5], noArms: true }));
    const hands = [[B[0] - 34 + 10 * tug[0], B[1] + 32], [B[0] + 28 + 10 * tug[1], B[1] + 30]];
    paint(() => {
      hands.forEach((h, i) => {
        const eye = OE_CHAM_EYES[i], q = [eye[0] + Math.cos(eA[i]) * 4, eye[1] - (i ? 9 : 10)];
        oeStrap(c, oeLeadPath(c, h, q, 4, clamp((bk - 0.3) / 0.7)), 2.6);
        if (bk > 0.95) oeClip(c, q[0], q[1], 0.6);
        c.beginPath(); c.ellipse(h[0], h[1] - 3, 3.4, 4.2, 0, 0, 7); c.lineWidth = 2.4; c.strokeStyle = OEC.leadDk; c.stroke(); c.lineWidth = 1.6; c.strokeStyle = OEC.lead; c.stroke();
      });
    });
    actor(() => { for (const [i, h] of hands.entries()) { const sx = B[0] + (i ? 1 : -1) * 22 * e, sy = B[1] + 6; line(c, sx, sy, h[0], h[1] - 2, 3.4, '#E0688E'); circle(c, h[0], h[1] - 2, 4.2, '#FFA9C0'); } });
  }
  c.restore();
  // the tongue (world): from the mouth to the tip point, a sticky ball on its end
  const tk = clamp(o.tongue || 0);
  out.mouth = [x - 72 * s, y - 12 * s];
  if (tk > 0.01 && o.tip) {
    const m = out.mouth, q = [lerp(m[0], o.tip[0], tk), lerp(m[1], o.tip[1], tk)];
    actor(() => {
      line(c, m[0], m[1], q[0], q[1], 10 * s, OEC.tongueDk); line(c, m[0], m[1], q[0], q[1], 7 * s, OEC.tongue);
      circle(c, q[0], q[1], 7.5 * s, OEC.tongueDk); circle(c, q[0], q[1], 6 * s, OEC.tongue);
    });
    paint(() => circle(c, q[0] - 2 * s, q[1] - 2 * s, 2 * s, '#FFD0DE'));
    out.tongueTip = q;
  }
  return out;
}
// the branch it sits on: from off the right edge into the frame (world), with leaves
function oeBranch(c, x0, y0, x1, y1, t) {
  const P = (u) => [lerp(x0, x1, u), lerp(y0, y1, u) + 10 * Math.sin(u * 3.1)];
  const pts = [...Array(17)].map((_, i) => P(i / 16));
  const draw = (w, col) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = col; c.stroke(); };
  draw(17, OEC.barkDk); draw(12, OEC.bark);
  for (const [u, sd, s] of [[0.15, -1, 1.1], [0.35, 1, 0.9], [0.58, -1, 1.0], [0.8, 1, 0.8], [0.95, -1, 0.7]]) {
    const p = P(u), sw = 0.08 * Math.sin(t * loopW(1.3) + u * 9);
    c.save(); c.translate(p[0], p[1]); c.rotate(sd * 0.9 + sw); c.scale(s, s);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(18, -16, 40, -2); c.quadraticCurveTo(18, 12, 0, 0); c.closePath(); c.fillStyle = OEC.leaf; c.fill();
    c.restore();
  }
}

// ---------------------------------------------------------------- a fly (world; s = 1: about 26 px)
function oeFly(c, x, y, s, t, o = {}) {
  const n = Math.round(t * 30), up = n % 2;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s * (o.flip ? -1 : 1), s);
  for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 6, up && !o.landed ? -9 : -5, 8, 4.5, sd * (up && !o.landed ? 0.9 : 0.35), 0, 7); c.fillStyle = 'rgba(220,235,255,0.6)'; c.fill(); }
  actor(() => { ellipse(c, 0, 2, 6.5, 8.5, '#2A2A34'); circle(c, 0, -7, 5.2, '#2A2A34'); });
  paint(() => { circle(c, -3.2, -8.2, 2.6, '#C2302E'); circle(c, 3.2, -8.2, 2.6, '#C2302E'); circle(c, -3.8, -9, 0.8, '#FFFFFF');
    for (let i = 0; i < 3; i++) line(c, -5, -1 + i * 4, -9, 2 + i * 5, 1, '#1A1A22'), line(c, 5, -1 + i * 4, 9, 2 + i * 5, 1, '#1A1A22'); });
  c.restore();
}
