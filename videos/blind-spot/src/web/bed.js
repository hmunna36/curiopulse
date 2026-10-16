// His bedroom at night, seen from his phone (we ARE the phone): a plain wall painted once (calm paint around the
// viewer's test card), a padded headboard, pillows and a duvet drawn as shapes, a bedside lamp low on the left; the
// hero sitting up in bed in blue pyjamas from a description (one palm over his left eye, the forearm rising from the
// duvet), the X and the red dot on the glass (screen space) for the viewer's own test, and a round window on his open
// eye with the eye cut in half inside it (eyecut.js).
// World units = the frame at zoom 1. The rig sits at BD.hx, BD.hy; his head's middle is at (540, 1030).
'use strict';

const BD = { hx: 540, hy: 1500, hs: 1 };
const BD_HEAD = [BD.hx, BD.hy - 470 * BD.hs];
let BD_WALL = null;
// blue pyjamas: the hiker's own build, at home at midnight
const BDPAL = Object.assign({}, PAL, { coat: '#4E9BD6', coatSh: '#2D6FA8', coatHi: '#8CCBF2', coatDk: '#1E4F80', pj: true });

// ---------------------------------------------------------------- the viewer's test card (on the glass, screen space)
// The X and the dot sit 720 px apart at the same height (the dot 40 px lower: the blind spot is a little below the
// line of sight). On a phone that shows the 1080 px frame about 6.4-7.6 cm wide, they are about 5 cm apart, so the dot
// lands on the blind spot (12-18 degrees out) when the phone is about 15-22 cm from the eye.
const CARD = { X: [185, 600], D: [905, 640], xr: 50, dr: 50 };
function testCard(k, o = {}) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2);
  screenSpace();
  paint(() => {
    // the X: two thick white strokes with a dark edge
    ctx.save(); ctx.translate(CARD.X[0], CARD.X[1]); ctx.scale(q, q);
    for (const [w, col] of [[30, '#0B0B1A'], [18, '#FFFFFF']]) {
      line(ctx, -CARD.xr * 0.82, -CARD.xr * 0.82, CARD.xr * 0.82, CARD.xr * 0.82, w, col);
      line(ctx, CARD.xr * 0.82, -CARD.xr * 0.82, -CARD.xr * 0.82, CARD.xr * 0.82, w, col);
    }
    ctx.restore();
    // the dot: plain red, a thin dark edge, no glow (a halo would make it bigger than the spot it has to hide in)
    if (!o.noDot) {
      ctx.save(); ctx.translate(CARD.D[0], CARD.D[1]); ctx.scale(q, q);
      circle(ctx, 0, 0, CARD.dr + 4, '#0B0B1A'); circle(ctx, 0, 0, CARD.dr, '#FF3B4E');
      ctx.restore();
    }
  });
}

// ---------------------------------------------------------------- the room
function bdPaintWall() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#141B40'); g.addColorStop(0.45, '#1B2552'); g.addColorStop(1, '#121838');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // the lamp's warmth on the wall, low on the left (well away from the X and the dot)
  const lg = c.createRadialGradient(40, 1240, 20, 40, 1240, 620);
  lg.addColorStop(0, 'rgba(255,170,90,0.30)'); lg.addColorStop(0.5, 'rgba(255,140,80,0.10)'); lg.addColorStop(1, 'rgba(255,140,80,0)');
  c.fillStyle = lg; c.fillRect(0, 0, W, H);
  // a faint moon-blue wash from the top right, very soft (no edge anywhere near the dot)
  const mg = c.createRadialGradient(1000, 120, 40, 1000, 120, 900);
  mg.addColorStop(0, 'rgba(130,160,255,0.10)'); mg.addColorStop(1, 'rgba(130,160,255,0)');
  c.fillStyle = mg; c.fillRect(0, 0, W, H);
  return cv;
}
function initBed() { BD_WALL = bdPaintWall(); }
// the wall is far behind him: it slides and grows only a little as the camera moves
function bdWallCam(cam) {
  return { x: 540 + (cam.x - 560) * 0.3, y: 960 + (cam.y - 998) * 0.3, zoom: 1 + 0.04 * (cam.zoom - 3.4), rot: 0, sx: (cam.sx || 0) * 0.15, sy: (cam.sy || 0) * 0.15 };
}
// the room behind him: wall, lamp, headboard, pillows (camera applied by the caller afterwards)
function bdRoom(cam, t, o = {}) {
  screenSpace(); ctx.fillStyle = '#121838'; ctx.fillRect(0, 0, W, H);
  applyCam(bdWallCam(cam));
  ctx.drawImage(BD_WALL, 0, 0);
  applyCam(cam);
  // the bedside lamp, low on the left: a small table, a warm shade, its glow
  const L = [404, 1150];
  rrect(ctx, L[0] - 46, L[1] + 34, 92, 80, 10); ctx.fillStyle = '#2A2147'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(L[0] - 26, L[1] - 30); ctx.lineTo(L[0] + 26, L[1] - 30); ctx.lineTo(L[0] + 36, L[1] + 8); ctx.lineTo(L[0] - 36, L[1] + 8); ctx.closePath();
  ctx.fillStyle = '#FFD9A0'; ctx.fill();
  line(ctx, L[0], L[1] + 8, L[0], L[1] + 34, 6, '#3A2E5A');
  softDot(gctx, L[0], L[1] - 10, 70, '#FFC27A', 0.55); softDot(gctx, L[0], L[1], 170, '#FF9A50', 0.16);
  // the headboard: padded, its top just below his hair, buttons in rows
  const HB = { x0: 300, x1: 780, y0: 960, y1: 1240 };
  rrect(ctx, HB.x0, HB.y0, HB.x1 - HB.x0, HB.y1 - HB.y0, 34); ctx.fillStyle = '#2D4468'; ctx.fill();
  paint(() => {
    for (let y = HB.y0 + 40; y < HB.y1 - 10; y += 56) for (let x = HB.x0 + 40 + ((y - HB.y0) % 112 ? 28 : 0); x < HB.x1 - 20; x += 56) circle(ctx, x, y, 3.4, 'rgba(14,24,48,0.55)');
  });
  // pillows behind his shoulders
  for (const [x, y, w, h, col] of [[410, 1080, 150, 92, '#4A6497'], [672, 1086, 150, 88, '#4A6497']]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(x < 540 ? -0.06 : 0.06);
    rrect(ctx, -w / 2, -h / 2, w, h, h * 0.42); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
  }
}
// the duvet over his lap, in front of him (camera applied)
function bdDuvet(t) {
  const y0 = 1218;
  ctx.beginPath(); ctx.moveTo(260, y0 + 30);
  ctx.quadraticCurveTo(380, y0 - 10, 470, y0 + 6); ctx.quadraticCurveTo(560, y0 + 22, 640, y0 + 2); ctx.quadraticCurveTo(740, y0 - 14, 820, y0 + 26);
  ctx.lineTo(840, 1700); ctx.lineTo(240, 1700); ctx.closePath();
  ctx.fillStyle = '#5B6FB3'; ctx.fill();
  paint(() => {   // a few soft folds
    for (const [x0, y0f, x1, y1] of [[330, 1250, 400, 1330], [500, 1240, 560, 1300], [690, 1240, 640, 1320]]) {
      ctx.beginPath(); ctx.moveTo(x0, y0f); ctx.quadraticCurveTo((x0 + x1) / 2 + 12, (y0f + y1) / 2, x1, y1); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(40,52,110,0.55)'; ctx.lineCap = 'round'; ctx.stroke();
    }
  });
}

// ---------------------------------------------------------------- the hero
// arm positions as {e: elbow, w: wrist} (rig-local). palm = his left hand flat over his left eye (screen right)
const BD_ARM = {
  palm: { e: [126, -328], w: [56, -432] },     // the heel of the hand on his cheek, fingers up over the brow
  palmUp: { e: [140, -300], w: [96, -372] },   // on its way up from the duvet (the loop's last frames)
  duvet: { e: [118, -268], w: [92, -214] },    // resting on the duvet
  restL: { e: [-118, -268], w: [-92, -214] },  // his other hand, on the duvet (holding the phone: we are the phone)
};
const bdArmMix = (a, b, k) => ({ e: [lerp(a.e[0], b.e[0], k), lerp(a.e[1], b.e[1], k)], w: [lerp(a.w[0], b.w[0], k), lerp(a.w[1], b.w[1], k)] });
function bdSt(A = {}) {
  let p = { hipY: -222 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.16, b: 0.1 }, armR: { a: 0.16, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
  const aR = A.armR || BD_ARM.palm, aL = A.armL || BD_ARM.restL;
  p = armAt(p, 'R', aR.e, aR.w);
  p = armAt(p, 'L', aL.e, aL.w);
  return { x: BD.hx + (A.dx || 0), y: BD.hy + (A.dy || 0), s: BD.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: true, seed: 4 };
}
function bdHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function bdHeadPt(st, lx, ly) { const p = bdHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
// the back of his left hand, flat over his eye: the palm, four fingers up over the brow (leaning in toward his nose),
// the thumb along the side of his nose. Rig-local units; W = the wrist, ang = the way the fingers point
function bdPalm(c, Wr, ang, pal, press = 0) {
  c.save(); c.translate(Wr[0], Wr[1]); c.rotate(ang);
  // local: +y is down the arm (toward the wrist), the fingers point to -y
  rrect(c, -31, -62, 62, 64, 22); c.fillStyle = pal.skin; c.fill();                       // the back of the hand
  const F = [[-22, 30], [-7, 36], [8, 34], [22, 27]];                                        // four fingers: x, length
  for (const [fx, L] of F) { rrect(c, fx - 8.5, -62 - L + 6 * press, 17, L + 14, 8.5); c.fillStyle = pal.skin; c.fill(); }
  // the thumb, on the inner side (screen left), along his nose
  c.save(); c.translate(-30, -14); c.rotate(-0.55); rrect(c, -9, -40, 18, 46, 9); c.fillStyle = pal.skin; c.fill(); c.restore();
  paint(() => {
    for (const [fx] of F) line(c, fx, -60, fx + 0.5, -50, 2.4, 'rgba(170,88,60,0.45)');           // knuckle creases
    for (const [fx, L] of F) line(c, fx - 4, -62 - L * 0.55 + 6 * press, fx + 4, -62 - L * 0.55 + 6 * press, 2, 'rgba(170,88,60,0.35)');
    for (const [fx, L] of F) { rrect(c, fx - 5, -62 - L + 8 + 6 * press, 10, 9, 4); c.fillStyle = 'rgba(255,214,196,0.8)'; c.fill(); }   // nails
  });
  c.restore();
}
// The hero in bed. A: {armR, armL: {e, w} (BD_ARM, bdArmMix), palm: 0..1 (his hand flat over the eye: drawn again in
// front of his head), press, face, bob, lean, headRot, headDX, headDY, post(lc, r, st)}.
// Returns {st, r, head, eyeOpen (his right eye, screen left), eyeShut, top, chin, K}.
function bdHero(cam, t, A = {}) {
  const pal = BDPAL, st = bdSt(A);
  const r = charLayer(cam, st, t, {
    pal, ambient: 0.04,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      if ((A.palm || 0) > 0.01) {
        const el = rr.elR, wr = rr.wrR, d = rr.armDirR;
        capsuleShaded(lc, el, wr, 38, pal.coat, pal.coatSh, pal.coatHi, pal);                 // the forearm again, in front of his face
        line(lc, wr[0] - d[0] * 6, wr[1] - d[1] * 6, wr[0] + d[0] * 2, wr[1] + d[1] * 2, 42, pal.coatSh);   // the cuff
        const ang = Math.atan2(d[1], d[0]) + Math.PI / 2 + (A.palmTilt || 0);
        bdPalm(lc, [wr[0] + d[0] * 4, wr[1] + d[1] * 4], ang, pal, A.press || 0);
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  const P = (lx, ly) => bdHeadPt(st, lx, ly);
  return { st, r, K: st.s, head: P(0, 0), eyeOpen: P(-24, -2), eyeShut: P(24, -2), top: P(0, -84), chin: P(0, 68) };
}

// ---------------------------------------------------------------- the window on his eye (camera applied: world units)
// E = the eye's world point, rw = the window's radius (world units), k = how far it has opened (0..1); inner(V) draws
// what is inside with a view V = {x, y, s} (world units); ring = a pulse on the rim
function eyeWindow(Ept, rw, k, inner, ring = 0) {
  if (k <= 0.01) return;
  const R = rw * E.outBack(clamp(k), 1.6);
  ctx.save(); ctx.beginPath(); ctx.arc(Ept[0], Ept[1], R, 0, 7); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.arc(Ept[0], Ept[1], R, 0, 7); gctx.clip();
  ctx.fillStyle = '#0D1A44'; ctx.fillRect(Ept[0] - R, Ept[1] - R, 2 * R, 2 * R);
  inner(R);
  ctx.restore(); gctx.restore();
  paint(() => {
    ctx.beginPath(); ctx.arc(Ept[0], Ept[1], R, 0, 7); ctx.lineWidth = Math.max(2.4, R * 0.06); ctx.strokeStyle = '#E8F4FF'; ctx.stroke();
    if (ring > 0.01) { ctx.beginPath(); ctx.arc(Ept[0], Ept[1], R * (1 + 0.25 * (1 - ring)), 0, 7); ctx.lineWidth = R * 0.05; ctx.strokeStyle = rgba('#FFD447', ring); ctx.stroke(); }
  });
  softDot(gctx, Ept[0], Ept[1], R * 1.2, '#7FB6FF', 0.12 * clamp(k));
}
