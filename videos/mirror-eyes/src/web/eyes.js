// mirror-eyes (24 Oct 2026): his eyes, big, at the bathroom mirror (mirror.js), and the things the Short cuts to:
//   meEyes(c, pal, F, t)          his eyes again, larger, in head units (over the rig's): F = {lx, ly (-1..1), open, blink,
//                                 squint (the lower lid up), smear: {x0, x1, k} (a streak of the iris between two looks)}
//   meHero(cam, t, A)             mirHero with A.eyes (meEyes' F); returns mirHero's points plus hp (head units -> world)
//   meMini(c, x, y, s, F, t)      his head small (a film frame, a phone screen), the head's middle at (x, y)
//   edRoom(cam, t, S)             the editing room inside his head (room space: 1080x1920 at zoom 1, centred 540, 960):
//                                 the light table, the film strip of his own eyes, the brain in an editor's visor
//   meScissors, meClock, mePhone, tagPill, okTick, sparkle, snipMark: props and labels
'use strict';

// ---------------------------------------------------------------- his face at the mirror
const MEFACE = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.35, browTilt: 0.05, mouth: 'flat', mouthOpen: 0.1, blink: 0, cross: 0 };
const ME_EYE = { x: 24, y: -2, rx: 16, ry: 16.6 };            // the eye's middle and size, head units (the rig's: 24, -2, 14 x 16)
const IRIS = '#7A5230', IRIS_DK = '#4A2E18', IRIS_HI = '#B8834E';

function meEyes(c, pal, F = {}, t = 0) {
  const lx = F.lx || 0, ly = F.ly || 0, open = F.open === undefined ? 1 : F.open, bl = clamp(F.blink || 0), sq = clamp(F.squint || 0);
  for (const s of [-1, 1]) {
    const ex = s * ME_EYE.x, ey = ME_EYE.y, rx = ME_EYE.rx, ry = ME_EYE.ry * open;
    paint(() => {
      ellipse(c, ex, ey, rx, ry, '#FFFFFF');
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.clip();
      ellipse(c, ex, ey - ry * 0.55, rx, ry * 0.5, 'rgba(150,170,200,0.16)');         // the lid's shadow on the white
      const iris = (px, py, a) => {
        circle(c, px, py, 9.4, rgba(IRIS_DK, a)); circle(c, px, py, 8.2, rgba(IRIS, a));
        circle(c, px - 1.2, py + 1.6, 5.6, rgba(IRIS_HI, 0.55 * a));
        circle(c, px, py, 4.5, rgba('#120A0C', a));
      };
      const P = (k) => [ex + lerp(F.smear ? F.smear.x0 : lx, F.smear ? F.smear.x1 : lx, k) * 6.6, ey + ly * 5.4];
      if (F.smear && F.smear.k > 0.01) {                                              // a jump on its way: a streak of irises
        for (let i = 0; i <= 8; i++) { const p = P(i / 8); iris(p[0], p[1], 0.34 * F.smear.k); }
      }
      const p = F.smear && F.smear.k > 0.01 ? P(F.smear.at === undefined ? 1 : F.smear.at) : [ex + lx * 6.6, ey + ly * 5.4];
      iris(p[0], p[1], F.smear && F.smear.k > 0.01 ? 1 - 0.55 * F.smear.k : 1);
      circle(c, p[0] - 2.8, p[1] - 3.2, 2.5, 'rgba(255,255,255,0.95)'); circle(c, p[0] + 2.6, p[1] + 2.4, 1.1, 'rgba(255,255,255,0.8)');
      const lid = mixHex(pal.skin, pal.skinSh, 0.25);
      if (bl > 0.01) {                                                                // the upper lid comes down
        c.fillStyle = lid; c.fillRect(ex - rx - 1, ey - ry - 2, 2 * rx + 2, (2 * ry + 2) * bl + 1);
        line(c, ex - rx, ey - ry + 2 * ry * bl, ex + rx, ey - ry + 2 * ry * bl, 2.6, '#6A3526');
      }
      if (sq > 0.01) {                                                                // the lower lid up: a squint
        const top = ey + ry - 2 * ry * 0.42 * sq;
        c.fillStyle = lid; c.fillRect(ex - rx - 1, top, 2 * rx + 2, ry * 2);
        c.beginPath(); c.moveTo(ex - rx, top + 3); c.quadraticCurveTo(ex, top - 2.5, ex + rx, top + 3); c.lineWidth = 2.2; c.strokeStyle = 'rgba(106,53,38,0.8)'; c.stroke();
      }
      c.restore();
      c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.lineWidth = 1.1; c.strokeStyle = 'rgba(120,60,40,0.45)'; c.stroke();
      if (bl < 0.85) {                                                                // the lash line on the upper lid
        const yl = ey - ry + 2 * ry * bl;
        c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, Math.PI * 1.12, Math.PI * 1.88); c.lineWidth = 2.4; c.lineCap = 'round'; c.strokeStyle = '#3A1E16';
        if (bl < 0.02) c.stroke(); else line(c, ex - rx * 0.85, yl, ex + rx * 0.85, yl, 2.4, '#3A1E16');
      }
    });
  }
}

// him at the mirror with his big eyes. A: mirHero's description plus eyes (meEyes' F)
function meHero(cam, t, A) {
  const B = Object.assign({}, A, { nose: A.nose || { nostK: 0.5 }, noseK: A.noseK || 0.78, face: Object.assign({}, MEFACE, A.face || {}) });
  B.under = (c) => meEyes(c, A.pal || MIRPAL, A.eyes || {}, t);
  const out = mirHero(cam, t, B);
  out.hp = (q) => mirHeadPt(out.st, q[0], q[1]);
  return out;
}

// his head, small (a film frame, a phone screen): the head's middle at (x, y), s pixels per head unit
function meMini(c, x, y, s, F, t, o = {}) {
  const face = Object.assign({}, MEFACE, o.face || {});
  drawCharacter(c, { x, y: y + 470 * s, s, pose: POSES.stand, face, noLegs: true, seed: 4 }, t, o.pal || MIRPAL);
  c.save(); c.translate(x, y); c.scale(s, s); meEyes(c, o.pal || MIRPAL, F, t); c.restore();
}

// ---------------------------------------------------------------- small graphics (screen space)
function tagPill(txt, x, y, col, k, size = 40, ink = '#0B0B1A') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function okTick(x, y, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#FFFFFF'); circle(ctx, 0, 0, r, '#12B25C');
  ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.36); ctx.lineTo(r * 0.5, -r * 0.34); ctx.lineWidth = r * 0.24; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, r * 2.4, '#4DFFB4', 0.5 * clamp(k));
}
function sparkle(x, y, r, k, col = '#FFF6C8') {
  if (k <= 0.01) return;
  for (const [cc, rr, cl] of [[ctx, r, col], [gctx, r * 1.6, rgba(col, 0.6)]]) {
    cc.save(); cc.translate(x, y); cc.scale(k, k);
    cc.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, R = i % 2 ? rr * 0.28 : rr; cc.lineTo(Math.cos(a) * R, Math.sin(a) * R); } cc.closePath(); cc.fillStyle = cl; cc.fill();
    cc.restore();
  }
}

// scissors, centred on the pivot; open 0..1; pointing along +x before rot (any context)
function meScissors(c, x, y, s, open, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const a = 0.08 + 0.42 * clamp(open);
  for (const e of [-1, 1]) {
    c.save(); c.rotate(e * a);
    c.beginPath(); c.moveTo(-6, e * 3); c.lineTo(96, e * 1.5); c.quadraticCurveTo(100, 0, 92, -e * 6); c.lineTo(-6, -e * 9); c.closePath();
    c.fillStyle = '#D9E2EA'; c.fill();
    paint(() => { line(c, 6, -e * 2.5, 86, -e * 1.8, 2.4, 'rgba(255,255,255,0.9)'); });
    c.restore();
    c.save(); c.rotate(Math.PI + e * a * 0.9);
    rrect(c, 4, -6, 26, 12, 6); c.fillStyle = '#E8404E'; c.fill();
    c.beginPath(); c.ellipse(52, e * 4, 24, 15, e * 0.25, 0, Math.PI * 2); c.lineWidth = 10; c.strokeStyle = '#E8404E'; c.stroke();
    c.restore();
  }
  circle(c, 0, 0, 6.5, '#8A97A6'); circle(c, -1.5, -1.5, 2.4, '#FFFFFF');
  c.restore();
}

// a small red snip mark that pops beside a jump (screen space): scissors closing, two cut lines
function snipMark(x, y, k, rot = -0.4, size = 1) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k * 1.6), 2) * size;
  circle(ctx, x, y, 46 * s, '#0B0B1A'); circle(ctx, x, y, 40 * s, '#FF5A6E');
  meScissors(ctx, x - 22 * s, y, 0.42 * s, 1 - clamp(k * 1.4), rot);
  softDot(gctx, x, y, 90 * s, '#FF5A6E', 0.35 * clamp(1 - k));
}

// ---------------------------------------------------------------- the clock (any context; centred on x, y)
// sec: how many ticks since 12 (fractional = mid-tick); o: {num: false, rim}
function meClock(c, x, y, r, sec, t, o = {}) {
  c.save(); c.translate(x, y);
  circle(c, 0, 6, r + 16, 'rgba(0,0,0,0.28)');
  circle(c, 0, 0, r + 16, o.rim || '#2A2440');
  circle(c, 0, 0, r, '#FFF8EC');
  paint(() => {
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, big = i % 5 === 0, r0 = r * (big ? 0.80 : 0.88);
      line(c, Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r * 0.94, Math.sin(a) * r * 0.94, big ? r * 0.05 : r * 0.018, '#2A2440');
    }
    const ah = -Math.PI / 2 + 0.6, am = -Math.PI / 2 - 0.9;                          // the hour and minute hands, still
    line(c, 0, 0, Math.cos(ah) * r * 0.45, Math.sin(ah) * r * 0.45, r * 0.07, '#2A2440');
    line(c, 0, 0, Math.cos(am) * r * 0.68, Math.sin(am) * r * 0.68, r * 0.05, '#2A2440');
    const as = -Math.PI / 2 + (sec / 60) * Math.PI * 2;
    line(c, -Math.cos(as) * r * 0.2, -Math.sin(as) * r * 0.2, Math.cos(as) * r * 0.84, Math.sin(as) * r * 0.84, r * 0.04, '#E8404E');
    circle(c, Math.cos(as) * r * 0.66, Math.sin(as) * r * 0.66, r * 0.06, '#E8404E');
    circle(c, 0, 0, r * 0.075, '#E8404E');
  });
  c.restore();
}
// the second hand's position for ticks at times ticks[] (a snap with a small overshoot at each)
function tickSec(t, ticks) {
  let s = 0;
  for (const f of ticks) {
    if (t < f) break;
    const u = (t - f) / 0.09;
    s += u >= 1 ? 1 : E.outBack(clamp(u), 2.6);
  }
  return s;
}

// ---------------------------------------------------------------- the editing room (inside his head)
// Room space (1080x1920 at zoom 1, centred 540, 960). Everything is drawn in world coordinates, so the room can sit
// small in the window on his forehead (the camera says where) and then fill the frame.
const ED = { SY: 780, FW: 214, FH: 270, PITCH: 232, BX: 540, BY: 1300, BS: 0.92 };

function edBackdrop(t) {
  // the walls, the shelf of film cans, the desk; a wide rect so it also fills a zoomed-out view
  ctx.fillStyle = '#160F2C'; ctx.fillRect(-900, -900, 2880, 3720);
  const g = ctx.createLinearGradient(0, 200, 0, 1100); g.addColorStop(0, '#2A1D4E'); g.addColorStop(1, '#170F30');
  ctx.fillStyle = g; ctx.fillRect(-900, 200, 2880, 900);
  rrect(ctx, -60, 420, 1200, 22, 8); ctx.fillStyle = '#3B2A62'; ctx.fill();          // the shelf
  for (let i = 0; i < 8; i++) {                                                       // film cans
    const x = 70 + i * 136 + (i % 2) * 10, r = 46 + (i % 3) * 6;
    circle(ctx, x, 420 - r, r, ['#5C6C8E', '#8A5A9A', '#5A7E9C', '#9A6A4A'][i % 4]);
    paint(() => { circle(ctx, x, 420 - r, r * 0.55, 'rgba(255,255,255,0.12)'); circle(ctx, x, 420 - r, r * 0.18, '#1A1230'); });
  }
  ctx.fillStyle = '#2E1D16'; ctx.fillRect(-900, 1040, 2880, 1900);                    // the desk
  ctx.fillStyle = '#4A2E20'; ctx.fillRect(-900, 1040, 2880, 26);
}
// the light table under the strip: a glowing panel (its light goes into the glow layer)
function edTable(t) {
  rrect(ctx, 30, ED.SY - 230, 1020, 460, 34); ctx.fillStyle = '#1E2238'; ctx.fill();
  rrect(ctx, 52, ED.SY - 208, 976, 416, 24); ctx.fillStyle = '#EAF6FF'; ctx.fill();
  softDot(gctx, 540, ED.SY, 620, '#DDF2FF', 0.10);
}
// one frame's picture (inside its window, clipped): kind 'L' / 'R' / 'F' (front) = his eyes in the mirror looking
// left / right / at us; 'S' = mid-jump, smeared; 'C1'.. = a clock at 1, 2, 3 s; 'H' = a hole (nothing)
function edFramePic(x, y, w, h, kind, t) {
  if (kind === 'H') { ctx.fillStyle = '#05040C'; ctx.fillRect(x - w / 2, y - h / 2, w, h); return; }
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, y - h / 2, w, h); ctx.clip();
  paint(() => {
    const g = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2); g.addColorStop(0, '#49B3AE'); g.addColorStop(1, '#1F6E78');
    ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    for (let i = -2; i <= 2; i++) line(ctx, x + i * 60, y - h / 2, x + i * 60, y + h / 2, 3, 'rgba(8,58,70,0.45)');
    if (kind[0] === 'C') {
      meClock(ctx, x, y - 6, w * 0.34, +kind.slice(1), t, { rim: '#3A2E5C' });
      ctx.font = '900 62px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(kind.slice(1), x, y + h * 0.36); ctx.fillStyle = '#FFD447'; ctx.fillText(kind.slice(1), x, y + h * 0.36);
    } else {
      const s = w / 120, hy = y + 6;
      if (kind === 'S') {                                                            // smeared sideways: the picture mid-jump
        for (let i = -3; i <= 3; i++) { ctx.save(); ctx.globalAlpha = i === 0 ? 0.5 : 0.3; meMini(ctx, x + i * w * 0.08, hy, s, { lx: i / 3 }, t); ctx.restore(); }
        for (let i = 0; i < 9; i++) line(ctx, x - w / 2, y - h / 2 + 18 + i * 30, x + w / 2, y - h / 2 + 18 + i * 30, 7, 'rgba(255,255,255,0.22)');
      } else meMini(ctx, x, hy, s, { lx: kind === 'L' ? -0.85 : kind === 'R' ? 0.85 : 0 }, t);
    }
  });
  ctx.restore();
}
// the strip: frames[] kinds, laid out from x0 (the middle of frame 0); o: {gone: {i0, i1, k (0..1 fallen), dir}, stretch:
// {i, k, back (slots)}, glowI: [indexes lit], dim}
function edStrip(frames, x0, t, o = {}) {
  const { SY, FW, FH, PITCH } = ED, n = frames.length;
  const fall = (i) => (o.gone && i >= o.gone.i0 && i <= o.gone.i1 ? o.gone.k : 0);
  // the film base: one strip, broken where frames have fallen out
  const segs = []; let cur = null;
  for (let i = 0; i < n; i++) {
    const out = fall(i) > 0.001;
    if (!out) { if (!cur) cur = [i, i]; else cur[1] = i; } else if (cur) { segs.push(cur); cur = null; }
  }
  if (cur) segs.push(cur);
  for (const [a, b] of segs) {
    const xa = x0 + a * PITCH - PITCH / 2 - (a === 0 ? 400 : 0), xb = x0 + b * PITCH + PITCH / 2 + (b === n - 1 ? 400 : 0);
    rrect(ctx, xa, SY - FH / 2 - 34, xb - xa, FH + 68, 6); ctx.fillStyle = '#211726'; ctx.fill();
    paint(() => {
      for (let x = xa + 14; x < xb - 10; x += 38) for (const yy of [SY - FH / 2 - 22, SY + FH / 2 + 10]) { rrect(ctx, x, yy, 20, 12, 3); ctx.fillStyle = '#F4F1E8'; ctx.fill(); }
    });
  }
  // the hole where frames fell out: the table shows through, with a dashed edge
  if (o.gone && o.gone.k > 0.001 && !o.closed) {
    const xa = x0 + o.gone.i0 * PITCH - PITCH / 2, xb = x0 + o.gone.i1 * PITCH + PITCH / 2;
    paint(() => { ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = 'rgba(232,64,78,0.9)'; ctx.lineWidth = 5; ctx.strokeRect(xa + 8, SY - FH / 2 - 26, xb - xa - 16, FH + 52); ctx.restore(); });
  }
  for (let i = 0; i < n; i++) {
    let x = x0 + i * PITCH, y = SY, rot = 0, kind = frames[i], w = FW;
    const f = fall(i);
    if (f > 0.001) { y += 900 * f * f; rot = (o.gone.dir || 1) * (0.5 + 0.25 * (i - o.gone.i0)) * f; x += (i - (o.gone.i0 + o.gone.i1) / 2) * 120 * f; }
    if (f > 0.001) {                                                                   // a fallen frame keeps its piece of film
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      rrect(ctx, -PITCH / 2, -FH / 2 - 34, PITCH, FH + 68, 6); ctx.fillStyle = '#211726'; ctx.fill();
      edFramePic(0, 0, w, FH, kind, t);
      ctx.restore();
      continue;
    }
    edFramePic(x, y, w, FH, kind, t);
    if (o.glowI && o.glowI.includes(i)) { paint(() => { ctx.lineWidth = 8; ctx.strokeStyle = '#8FB8FF'; ctx.strokeRect(x - w / 2 - 4, y - FH / 2 - 4, w + 8, FH + 8); }); }
  }
  // a stretched frame: frame o.stretch.i reaches back over o.stretch.back slots (the patch)
  if (o.stretch && o.stretch.k > 0.001) {
    const S = o.stretch, xr = x0 + S.i * PITCH + FW / 2, span = FW + S.back * PITCH * S.k;
    for (let j = 1; j <= S.back; j++) {
      const k = clamp(S.k * S.back - (S.back - j));                                   // the copies land one after the other
      if (k <= 0.001) continue;
      const xc = x0 + (S.i - j) * PITCH;
      ctx.save(); ctx.translate(xc, SY); ctx.scale(lerp(1.25, 1, E.outBack(k, 2)), lerp(1.25, 1, E.outBack(k, 2)));
      ctx.globalAlpha = Math.min(1, k * 2.5);
      edFramePic(0, 0, FW, FH, frames[S.i], t);
      ctx.restore();
    }
    paint(() => { ctx.lineWidth = 8; ctx.strokeStyle = '#4DFFB4'; ctx.strokeRect(xr - span - 4, SY - FH / 2 - 6, span + 8, FH + 12); });
  }
}

// the brain in an editor's green visor (borrowed erBrain from blind-spot), at (x, y), with scissors in its right hand
function edBrain(x, y, s, t, o = {}) {
  actor(() => erBrain(ctx, x, y, s, t, o));
  // the visor: a band round the top of the brain and a see-through green bill
  const bob = (o.still ? 0 : 5 * Math.sin(t * 2.4)) + (o.bob || 0);
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s); ctx.rotate(o.lean || 0);
  ctx.beginPath(); ctx.ellipse(0, -60, 160, 46, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.lineWidth = 16; ctx.strokeStyle = '#1F2A3A'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-150, -66); ctx.quadraticCurveTo(0, -150, 150, -66); ctx.quadraticCurveTo(0, -20, -150, -66); ctx.closePath();
  ctx.fillStyle = 'rgba(40,190,120,0.78)'; ctx.fill();
  paint(() => { ctx.beginPath(); ctx.moveTo(-120, -74); ctx.quadraticCurveTo(0, -128, 120, -74); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,255,220,0.6)'; ctx.stroke(); });
  ctx.restore();
  // scissors in either hand: o.scisR / o.scisL = {open 0..1, rot, size}; the pivot sits just above the hand
  for (const [k, arm, def] of [['scisR', o.armR, [176, 118]], ['scisL', o.armL, [-176, 118]]]) {
    const S = o[k];
    if (!S) continue;
    const bx = x + (arm ? arm[0] : def[0]) * s, by = y + bob + (arm ? arm[1] : def[1]) * s;
    meScissors(ctx, bx, by - 26 * s, (S.size || 1.15) * s, S.open, S.rot === undefined ? -1.25 : S.rot);
  }
}

// the whole room. S: {frames, x0, gone, stretch, glowI, brain: erBrain options + scis}
function edRoom(cam, t, S) {
  applyCam(cam);
  edBackdrop(t);
  softDot(gctx, 120, 300, 300, '#FFC27A', 0.35);                                       // a desk lamp, up left
  edTable(t);
  edStrip(S.frames, S.x0, t, S);
  const B = S.brain || {};
  edBrain(ED.BX + (B.dx || 0), ED.BY + (B.dy || 0), ED.BS, t, B);
}

// ---------------------------------------------------------------- the phone (his own eyes' view: the selfie camera)
// screen space: the phone's middle at (x, y), w x h; F = his eyes on its screen; o: {late: 0..1 (the LATE timer),
// rec: blink of the red dot}
function mePhone(x, y, w, h, t, F, o = {}) {
  screenSpace();
  rrect(ctx, x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12, 78); ctx.fillStyle = '#0B0B14'; ctx.fill();
  rrect(ctx, x - w / 2, y - h / 2, w, h, 72); ctx.fillStyle = '#2C3346'; ctx.fill();
  const sx = x - w / 2 + 22, sy = y - h / 2 + 22, sw = w - 44, sh = h - 44;
  ctx.save(); rrect(ctx, sx, sy, sw, sh, 56); ctx.clip();
  paint(() => {
    // the selfie: the bathroom behind him, then him (flipped, as a selfie camera shows it)
    const g = ctx.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#5CC2BA'); g.addColorStop(1, '#22707A');
    ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
    for (let i = 0; i < 6; i++) line(ctx, sx + i * 110 + 30, sy, sx + i * 110 + 30, sy + sh, 6, 'rgba(8,58,70,0.35)');
    for (let i = 0; i < 9; i++) line(ctx, sx, sy + i * 120 + 40, sx + sw, sy + i * 120 + 40, 6, 'rgba(8,58,70,0.35)');
    const s = sw / 150;
    meMini(ctx, x, sy + sh * 0.43, s, F, t, { face: o.face });
  });
  ctx.restore();
  // the notch and the camera: the lens glints
  rrect(ctx, x - 70, sy + 10, 140, 34, 17); ctx.fillStyle = '#05050A'; ctx.fill();
  circle(ctx, x + 40, sy + 27, 9, '#1A2A4A'); paint(() => circle(ctx, x + 37, sy + 24, 3, '#9FC8FF'));
  softDot(gctx, x, y, w * 0.9, '#BFF0FF', 0.10);
  // REC dot
  if (o.rec !== undefined) { const on = Math.sin(t * 6) > -0.3; circle(ctx, sx + 46, sy + 70, 11, on ? '#FF3B4E' : '#7A2030'); if (on) softDot(gctx, sx + 46, sy + 70, 30, '#FF3B4E', 0.6); }
  return { sx, sy, sw, sh };
}
// his hand round the phone (screen space): the palm and the wrist behind it (back), the fingers and thumb in front
function mePhoneHandBack(x, y, w, h, pal = MIRPAL) {
  screenSpace();
  ctx.fillStyle = pal.coat; ctx.beginPath(); ctx.moveTo(x + 40, H + 40); ctx.lineTo(x + 120, y + h / 2 + 140); ctx.lineTo(x + 330, y + h / 2 + 210); ctx.lineTo(x + 330, H + 40); ctx.closePath(); ctx.fill();   // the sleeve, from the lower right
  actor(() => {
    ctx.beginPath(); ctx.moveTo(x - 150, y + h / 2 - 60); ctx.quadraticCurveTo(x - 170, y + h / 2 + 120, x + 40, y + h / 2 + 170);
    ctx.lineTo(x + 250, y + h / 2 + 200); ctx.quadraticCurveTo(x + 230, y + h / 2 - 20, x + 150, y + h / 2 - 80); ctx.closePath(); ctx.fillStyle = pal.skin; ctx.fill();   // the palm and the wrist
  });
}
function mePhoneHand(x, y, w, h, pal = MIRPAL) {
  screenSpace();
  actor(() => {
    for (let i = 0; i < 3; i++) { rrect(ctx, x - w / 2 - 34, y + 150 + i * 96, 84, 72, 34); ctx.fillStyle = pal.skin; ctx.fill(); }   // fingers round the left edge
    ctx.save(); ctx.translate(x + w / 2 + 8, y + 300); ctx.rotate(-0.35); rrect(ctx, -44, -110, 88, 220, 44); ctx.fillStyle = pal.skin; ctx.fill(); ctx.restore();   // the thumb, right edge
  });
  paint(() => { for (let i = 0; i < 3; i++) line(ctx, x - w / 2 + 22, y + 168 + i * 96, x - w / 2 + 34, y + 204 + i * 96, 3, 'rgba(170,88,60,0.45)'); });
}
