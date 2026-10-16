// What If You Went to Space WITHOUT a Suit? (long-form, 1920x1080): the station's airlock, and space.
// The airlock is a small white-grey room seen from the side: padded wall panels, yellow handrails, an LED strip; on the
// left the inner hatch with a round window (the station's warm corridor beyond it, where his sister appears), the
// control panel with DEPRESS and REPRESS and a pressure gauge, a red warning beacon on the ceiling, and on the right
// the outer hatch, open on space: black, stars, and the curve of the Earth with its thin blue line of air.
// The hero (the hiker rig in a navy station shirt, socks, no helmet) floats in it; Ball, the station's camera drone (a
// white sphere with two big screen eyes), floats near him; his chip bag and his helmet float about.
// World coords = screen coords at zoom 1. The room is painted once, at twice the size, for the close-ups.
'use strict';

const paint = (fn) => fn();          // the Shorts' cinematic-look marks do nothing in this engine (no light stage)
const actor = (fn) => fn();

const AL = { inX: 250, inY: 500, inR: 190, winR: 74, outX: 1590, outY: 500, outR: 300, panX: 560, panY: 540,
  heroX: 1440, heroY: 880, hs: 0.78, beacon: [980, 64], floorY: 980 };
const ALPAL = Object.assign({}, PAL, {             // a navy station shirt with the sleeves rolled up, grey trousers, socks
  coat: '#2E4D9A', coatSh: '#203874', coatHi: '#5F80D0', coatDk: '#1A2C5C',
  strap: '#2E4D9A', strapSh: '#203874', pants: '#5D6478', pantsSh: '#454B5E',
  sock: '#E8ECF4', pj: true, shortSleeve: true,
});
const SISPAL = Object.assign({}, PAL, {            // his big sister, the commander: an orange flight suit
  coat: '#F08A2E', coatSh: '#C4661A', coatHi: '#FFB36A', coatDk: '#A0520F',
  strap: '#F08A2E', strapSh: '#C4661A', pants: '#F08A2E', pantsSh: '#C4661A', hair: '#3A2418', hairHi: '#6A4A34',
  sock: '#E8ECF4', pj: true,
});
// faces for this film
FACES.cheeks = { eyeOpen: 1.2, pupil: 0.8, lookX: 0, lookY: 0, browY: 1.0, browTilt: 0.5, mouth: 'flat', mouthOpen: 0, blink: 0, cross: 0 };
FACES.blowOut = { eyeOpen: 1.1, pupil: 0.85, lookX: 0, lookY: 0, browY: 1.1, browTilt: 0.6, mouth: 'o', mouthOpen: 0.9, blink: 0, cross: 0 };
FACES.selfie = { eyeOpen: 1.05, pupil: 1, lookX: 0.6, lookY: -0.5, browY: 0.6, browTilt: -0.4, mouth: 'grin', mouthOpen: 0.7, blink: 0, cross: 0 };
FACES.uhoh = { eyeOpen: 1.35, pupil: 0.55, lookX: -0.8, lookY: 0, browY: 1.3, browTilt: 1.0, mouth: 'grimace', mouthOpen: 0.8, blink: 0, cross: 0 };
FACES.tongue = { eyeOpen: 1.25, pupil: 0.7, lookX: 0, lookY: 0.6, browY: 1.2, browTilt: 0.8, mouth: 'o', mouthOpen: 0.75, blink: 0, cross: 1 };
FACES.fade = { eyeOpen: 0.8, pupil: 1, lookX: 0, lookY: 0.3, browY: 0.2, browTilt: 0.5, mouth: 'o', mouthOpen: 0.35, blink: 0.6, cross: 0 };
FACES.limp = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0, browTilt: 0.2, mouth: 'o', mouthOpen: 0.3, blink: 1, cross: 0 };
FACES.wake = { eyeOpen: 0.85, pupil: 1.05, lookX: 0.1, lookY: -0.2, browY: 0.7, browTilt: 0.8, mouth: 'flat', mouthOpen: 0.2, blink: 0.35, cross: 0 };
FACES.sheep = { eyeOpen: 1, pupil: 1.05, lookX: -0.6, lookY: 0.1, browY: 0.7, browTilt: 0.9, mouth: 'grimace', mouthOpen: 0.5, blink: 0.25, cross: 0 };
FACES.happy = { eyeOpen: 1, pupil: 1.1, lookX: 0.3, lookY: -0.2, browY: 0.8, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.85, blink: 0.1, cross: 0 };
FACES.stern = { eyeOpen: 1.05, pupil: 0.9, lookX: 0.7, lookY: 0, browY: -0.2, browTilt: -0.9, mouth: 'flat', mouthOpen: 0, blink: 0.2, cross: 0 };
FACES.alarmed = { eyeOpen: 1.4, pupil: 0.5, lookX: 0.8, lookY: 0.2, browY: 1.5, browTilt: 0.6, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 };

// the face, plus what space does to it: f.blue 0..1 (lips and skin going blue: no oxygen), f.pale, drawn on the skin
// under the eyes, brows and mouth (never-sleep's way of extending drawFace)
const ALFACE0 = drawFace;
drawFace = function (c, f, pal) {
  const b = f.blue || 0;
  if (b > 0.02) {
    c.save(); c.beginPath(); c.ellipse(0, 4, 63, 69, 0, 0, Math.PI * 2); c.clip();
    const g = c.createRadialGradient(0, 40, 6, 0, 10, 80); g.addColorStop(0, `rgba(90,110,200,${0.55 * b})`); g.addColorStop(1, `rgba(150,170,220,${0.3 * b})`);
    c.fillStyle = g; c.fillRect(-70, -70, 140, 150);
    c.restore();
  }
  ALFACE0(c, f, pal);
};

let AL_ROOM = null;
const AL_RS = 2;                                   // the room is painted at 2x

// ---------------------------------------------------------------- the room, painted once
function alPaintRoom() {
  const cv = mkCanvas(W * AL_RS, H * AL_RS), c = cv.getContext('2d');
  c.scale(AL_RS, AL_RS);
  const rng = mulberry32(77);
  // the back wall: a cylinder seen from inside, lighter in the middle band
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#596482'); g.addColorStop(0.16, '#AEB8CC'); g.addColorStop(0.5, '#C9D1E0'); g.addColorStop(0.84, '#A3ADC2'); g.addColorStop(1, '#4E5874');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // padded panels: a grid with rounded corners, each a little different
  for (let y = 150; y < 930; y += 195) for (let x = -40; x < W + 40; x += 230) {
    rrect(c, x + 8, y + 8, 214, 179, 22);
    c.fillStyle = `rgba(255,255,255,${0.10 + 0.08 * rng()})`; c.fill();
    c.lineWidth = 4; c.strokeStyle = 'rgba(60,70,100,0.35)'; c.stroke();
    if (rng() > 0.6) { rrect(c, x + 34, y + 30, 60, 46, 6); c.fillStyle = 'rgba(80,90,120,0.22)'; c.fill(); }          // a velcro square
    if (rng() > 0.7) { for (let i = 0; i < 3; i++) { rrect(c, x + 120, y + 120 + i * 14, 70 - i * 12, 6, 3); c.fillStyle = 'rgba(40,50,80,0.25)'; c.fill(); } }
  }
  // the ceiling and the floor: darker curved bands
  const cg = c.createLinearGradient(0, 0, 0, 150); cg.addColorStop(0, '#2A3150'); cg.addColorStop(1, '#4D5776');
  c.fillStyle = cg; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, 120); c.quadraticCurveTo(W / 2, 175, 0, 120); c.closePath(); c.fill();
  const fg = c.createLinearGradient(0, 930, 0, H); fg.addColorStop(0, '#4A5474'); fg.addColorStop(1, '#232A44');
  c.fillStyle = fg; c.beginPath(); c.moveTo(0, H); c.lineTo(W, H); c.lineTo(W, 960); c.quadraticCurveTo(W / 2, 905, 0, 960); c.closePath(); c.fill();
  // the LED strip along the ceiling
  c.beginPath(); c.moveTo(0, 116); c.quadraticCurveTo(W / 2, 168, W, 116); c.lineWidth = 10; c.strokeStyle = '#F4F8FF'; c.stroke();
  // cable bundles and handrails
  for (const [x0, y0, x1, y1] of [[0, 210, 700, 236], [1180, 240, 1920, 214]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 30, x1, y1); c.lineWidth = 14; c.strokeStyle = '#3B4466'; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#6A7498'; c.stroke(); }
  for (const [x, y, w] of [[700, 890, 380], [1060, 186, 300], [40, 780, 120]]) {
    for (const dx of [16, w - 28]) { rrect(c, x + dx, y - 6, 12, 40, 5); c.fillStyle = '#8A6A18'; c.fill(); }
    rrect(c, x, y, w, 22, 11); c.fillStyle = '#E8B830'; c.fill(); rrect(c, x, y, w, 8, 4); c.fillStyle = '#FFE07A'; c.fill();
  }
  // stowage bags strapped to the wall (lower left)
  for (const [x, y, w, h, col] of [[60, 630, 150, 120, '#E6E1D0'], [210, 690, 110, 90, '#C9D8E8'], [70, 840, 210, 80, '#D6CBB4']]) {
    rrect(c, x, y, w, h, 16); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(60,60,80,0.35)'; c.stroke();
    rrect(c, x + 10, y + h / 2 - 6, w - 20, 12, 5); c.fillStyle = 'rgba(40,50,90,0.35)'; c.fill();
  }
  // the inner hatch: a thick ring with bolts, the closed door, the round window (its inside is drawn live)
  const { inX, inY, inR, winR } = AL;
  circle(c, inX, inY, inR + 26, '#7F89A6'); circle(c, inX, inY, inR + 14, '#DDE2EE'); circle(c, inX, inY, inR, '#B9C1D4');
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; circle(c, inX + Math.cos(a) * (inR + 4), inY + Math.sin(a) * (inR + 4), 6, '#6E7894'); }
  const dg = c.createRadialGradient(inX - 40, inY - 50, 20, inX, inY, inR); dg.addColorStop(0, '#E9EDF6'); dg.addColorStop(1, '#A7B0C6');
  circle(c, inX, inY, inR - 22, '#8E98B2'); c.fillStyle = dg; c.beginPath(); c.arc(inX, inY, inR - 30, 0, 7); c.fill();
  rrect(c, inX - 18, inY + 70, 36, 90, 10); c.fillStyle = '#7C86A2'; c.fill();                       // the door's handle
  circle(c, inX, inY - 40, winR + 16, '#6E7894'); circle(c, inX, inY - 40, winR + 8, '#DDE2EE');
  // the outer hatch ring (its opening is drawn live: space, or the closed door)
  const { outX, outY, outR } = AL;
  circle(c, outX, outY, outR + 46, '#6B7594'); circle(c, outX, outY, outR + 30, '#D8DDE9');
  c.save(); c.beginPath(); c.arc(outX, outY, outR + 30, 0, 7); c.arc(outX, outY, outR + 8, 0, 7, true); c.clip();       // hazard stripes on the ring
  for (let a = 0; a < 6.283; a += 0.09) { c.beginPath(); c.moveTo(outX + Math.cos(a) * 280, outY + Math.sin(a) * 280); c.lineTo(outX + Math.cos(a + 0.045) * 360, outY + Math.sin(a + 0.045) * 360); c.lineTo(outX + Math.cos(a + 0.09) * 360, outY + Math.sin(a + 0.09) * 360); c.lineTo(outX + Math.cos(a + 0.045) * 280, outY + Math.sin(a + 0.045) * 280); c.closePath(); c.fillStyle = Math.round(a / 0.09) % 2 ? '#2A2A36' : '#F2C230'; c.fill(); }
  c.restore();
  for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283; circle(c, outX + Math.cos(a) * (outR + 38), outY + Math.sin(a) * (outR + 38), 6, '#4E5874'); }
  // the control panel (its buttons and gauge are drawn live)
  const { panX, panY } = AL;
  rrect(c, panX - 120, panY - 230, 240, 430, 22); c.fillStyle = '#3A4466'; c.fill();
  rrect(c, panX - 108, panY - 218, 216, 406, 16); c.fillStyle = '#4B577E'; c.fill();
  c.font = '800 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#DDE4F4'; c.fillText('AIRLOCK', panX, panY - 190);
  // a few small labels on the wall (unreadable lines)
  for (const [x, y] of [[880, 300], [1250, 860], [430, 900]]) { rrect(c, x, y, 110, 30, 6); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fill(); for (let i = 0; i < 2; i++) { rrect(c, x + 10, y + 8 + i * 10, 80 - i * 20, 4, 2); c.fillStyle = 'rgba(40,50,80,0.5)'; c.fill(); } }
  return cv;
}
function initAirlock() { AL_ROOM = alPaintRoom(); }

// ---------------------------------------------------------------- space: stars, and the Earth's edge with its thin blue line
const AL_STARS = (() => { const r = mulberry32(5), s = []; for (let i = 0; i < 260; i++) s.push([r(), r(), 0.6 + 1.8 * r() * r(), r()]); return s; })();
// a disc (or any clip already set) of space: centre (cx, cy), radius R (screen or world units of the current transform).
// o: {earth: [ex, ey, er] in units of R (where the Earth's centre sits, and its radius), rot (the Earth's slow turn),
//     glow (the blue line's glow into gctx), sun 0..1 (a bright side), night 0..1}
function spaceField(c, x0, y0, w, h, t, o = {}) {
  const g = c.createRadialGradient(x0 + w * 0.6, y0 + h * 0.3, 10, x0 + w / 2, y0 + h / 2, Math.max(w, h));
  g.addColorStop(0, '#0B1030'); g.addColorStop(1, '#010208');
  c.fillStyle = g; c.fillRect(x0, y0, w, h);
  for (const [u, v, r, p] of AL_STARS) {
    const tw = 0.55 + 0.45 * Math.sin(t * (1.2 + 2 * p) + p * 50);
    circle(c, x0 + u * w, y0 + v * h, r * (o.starS || 1), `rgba(255,255,255,${0.35 + 0.6 * tw * p})`);
  }
}
function earthLimb(c, ex, ey, er, t, o = {}) {
  // the thin blue line: a glow outside the edge
  const thick = er * (o.line || 0.035);
  if (o.glowCtx !== false) { const gl = gctx; gl.save(); gl.beginPath(); gl.arc(ex, ey, er + thick * 1.6, 0, 7); gl.lineWidth = thick * 2.2; gl.strokeStyle = 'rgba(90,170,255,0.75)'; gl.stroke(); gl.restore(); }
  const ag = c.createRadialGradient(ex, ey, er * 0.985, ex, ey, er + thick * 2.4);
  ag.addColorStop(0, 'rgba(120,200,255,0.95)'); ag.addColorStop(0.35, 'rgba(70,140,255,0.55)'); ag.addColorStop(1, 'rgba(40,80,200,0)');
  c.fillStyle = ag; c.beginPath(); c.arc(ex, ey, er + thick * 2.4, 0, 7); c.fill();
  // the ocean and the land
  const og = c.createRadialGradient(ex - er * 0.2, ey - er * 0.5, er * 0.1, ex, ey, er);
  og.addColorStop(0, '#3C8BE6'); og.addColorStop(0.7, '#1F5CB8'); og.addColorStop(1, '#16418A');
  c.fillStyle = og; c.beginPath(); c.arc(ex, ey, er, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(ex, ey, er, 0, 7); c.clip();
  const rot = o.rot || 0;
  c.fillStyle = '#4E9B5E';
  for (const [a, d, rx, ry, rr] of [[-1.95, 0.92, 0.16, 0.06, 0.3], [-1.45, 0.96, 0.22, 0.05, -0.2], [-2.4, 0.95, 0.12, 0.04, 0.5], [-1.1, 0.9, 0.1, 0.05, 0.1]]) {
    const aa = a + rot; c.beginPath(); c.ellipse(ex + Math.cos(aa) * er * d, ey + Math.sin(aa) * er * d, rx * er, ry * er, aa + Math.PI / 2 + rr, 0, 7); c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.82)';
  for (let i = 0; i < 18; i++) {
    const a = -2.9 + i * 0.13 + rot * 1.3 + 0.03 * Math.sin(i * 7), d = 0.86 + 0.12 * hash(i * 3.1);
    c.beginPath(); c.ellipse(ex + Math.cos(a) * er * d, ey + Math.sin(a) * er * d, er * (0.04 + 0.05 * hash(i)), er * 0.012, a + Math.PI / 2 + 0.3 * hash(i * 7), 0, 7); c.fill();
  }
  // the terminator: the night side darker
  if (o.night) { const ng = c.createLinearGradient(ex - er, 0, ex + er, 0); ng.addColorStop(0, `rgba(0,0,20,${0.7 * o.night})`); ng.addColorStop(0.5, 'rgba(0,0,20,0)'); c.fillStyle = ng; c.fillRect(ex - er, ey - er, 2 * er, 2 * er); }
  c.restore();
  // the bright rim of air on the edge itself
  c.beginPath(); c.arc(ex, ey, er + thick * 0.35, 0, 7); c.lineWidth = Math.max(2, thick * 0.55); c.strokeStyle = 'rgba(170,225,255,0.9)'; c.stroke();
}
// the view through the open outer hatch (world units; call with the camera applied)
function alSpace(t, open = 1) {
  const { outX, outY, outR } = AL;
  ctx.save(); ctx.beginPath(); ctx.arc(outX, outY, outR + 8, 0, 7); ctx.clip();
  spaceField(ctx, outX - outR - 10, outY - outR - 10, 2 * outR + 20, 2 * outR + 20, t);
  earthLimb(ctx, outX + 260, outY + 1250, 1050, t, { rot: 0.004 * t, line: 0.03, glowCtx: false });
  ctx.restore();
  gctx.save(); gctx.beginPath(); gctx.arc(outX, outY, outR + 8, 0, 7); gctx.clip();
  gctx.beginPath(); gctx.arc(outX + 260, outY + 1250, 1050 + 50, 0, 7); gctx.lineWidth = 60; gctx.strokeStyle = 'rgba(90,170,255,0.7)'; gctx.stroke();
  gctx.restore();
  // the hatch door: a thick round slab that swings out of the way (open 0 = shut, 1 = gone)
  const k = clamp(open);
  if (k < 0.999) {
    const sx = 1 - k;
    ctx.save(); ctx.translate(outX + outR * k * 0.9, outY); ctx.scale(Math.max(0.02, sx), 1);
    circle(ctx, 0, 0, outR + 6, '#9AA3BC'); const dg = ctx.createRadialGradient(-60, -80, 20, 0, 0, outR); dg.addColorStop(0, '#E9EDF6'); dg.addColorStop(1, '#A2ABC2');
    ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 0, outR - 16, 0, 7); ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2 + 0.4); rrect(ctx, -12, -outR + 30, 24, 120, 10); ctx.fillStyle = '#7C86A2'; ctx.fill(); ctx.restore(); }
    circle(ctx, 0, 0, 46, '#7C86A2'); circle(ctx, 0, 0, 30, '#C9D0E0');
    ctx.restore();
  }
  // its glow into the room: a cool blue spill from the Earth
  softDot(gctx, outX, outY + 140, outR * 1.2, '#4F9DFF', 0.25 * open);
}

// the inner hatch's window: the warm corridor, and maybe his sister's face pressed to it (sis: 0..1 how far she is in)
function alWindow(t, o = {}) {
  const { inX, inY, winR } = AL, wy = inY - 40;
  ctx.save(); ctx.beginPath(); ctx.arc(inX, wy, winR, 0, 7); ctx.clip();
  const g = ctx.createLinearGradient(inX, wy - winR, inX, wy + winR); g.addColorStop(0, '#FFD9A0'); g.addColorStop(1, '#E39A52');
  ctx.fillStyle = g; ctx.fillRect(inX - winR, wy - winR, 2 * winR, 2 * winR);
  for (let i = 0; i < 4; i++) rrect(ctx, inX - winR + 10 + i * 40, wy - winR + 20, 26, 2 * winR - 40, 6), ctx.fillStyle = 'rgba(160,90,40,0.18)', ctx.fill();
  if (o.sis > 0.01) {
    const st = { x: inX + 6, y: wy + 330 * 0.42 - 0 + (1 - o.sis) * 140, s: 0.42, face: o.face || FACES.alarmed, pose: Object.assign({}, POSES.stand), noLegs: true, seed: 3 };
    drawCharacter(ctx, st, t, SISPAL);
    sisHair(ctx, st);
    if (o.hand > 0.01) {   // her palm flat on the glass
      const hx = inX - 34, hy = wy + 18 - 20 * o.hand;
      ellipse(ctx, hx, hy, 22, 26, '#E8A880'); for (let i = 0; i < 4; i++) ellipse(ctx, hx - 15 + i * 10, hy - 30, 5, 13, '#E8A880');
    }
  }
  ctx.restore();
  // the glass: a sheen
  ctx.beginPath(); ctx.arc(inX, wy, winR, Math.PI * 1.1, Math.PI * 1.5); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
  softDot(gctx, inX, wy, winR * 1.4, '#FFB866', 0.3);
}
// her ponytail and fringe over the rig's head (call after drawCharacter, in its world transform)
function sisHair(c, st) {
  const r = rig(st.pose);
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  c.fillStyle = SISPAL.hair;
  c.beginPath(); c.moveTo(-58, -40); c.quadraticCurveTo(-96, 30, -64, 92); c.quadraticCurveTo(-58, 40, -44, -10); c.closePath(); c.fill();     // hair down the left side
  c.beginPath(); c.moveTo(-64, -10); c.quadraticCurveTo(-60, -76, 0, -78); c.quadraticCurveTo(58, -76, 66, -16); c.quadraticCurveTo(30, -44, 4, -40); c.quadraticCurveTo(-30, -36, -64, -10); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(58, -66, 26, 18, 0.6, 0, 7); c.fill();                                // the bun
  c.restore();
}

// the control panel's live parts: o: {gauge 0..1 (pressure), dep 0..1 (DEPRESS pressed), rep 0..1, flashDep, flashRep}
function alPanel(t, o = {}) {
  const { panX, panY } = AL;
  // the gauge
  const gx = panX, gy = panY - 100;
  circle(ctx, gx, gy, 70, '#20263F'); circle(ctx, gx, gy, 62, '#F2F4F8');
  ctx.save(); ctx.beginPath(); ctx.arc(gx, gy, 54, Math.PI * 0.8, Math.PI * 1.15); ctx.lineWidth = 12; ctx.strokeStyle = '#FF5A6E'; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(gx, gy, 54, Math.PI * 1.85, Math.PI * 2.2); ctx.lineWidth = 12; ctx.strokeStyle = '#4DFFB4'; ctx.stroke(); ctx.restore();
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.8 + 1.4 * i / 10); line(ctx, gx + Math.cos(a) * 40, gy + Math.sin(a) * 40, gx + Math.cos(a) * 50, gy + Math.sin(a) * 50, 3, '#20263F'); }
  const p = clamp(o.gauge === undefined ? 1 : o.gauge), na = Math.PI * (0.8 + 1.4 * p) + 0.03 * Math.sin(t * 30) * (o.shiver || 0);
  line(ctx, gx, gy, gx + Math.cos(na) * 48, gy + Math.sin(na) * 48, 6, '#C8102E'); circle(ctx, gx, gy, 8, '#20263F');
  ctx.font = '800 18px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#C8CEE0'; ctx.fillText('PRESSURE', gx, gy + 92);
  // the two buttons
  const btn = (y, txt, col, pr, fl) => {
    const dy = 6 * pr;
    rrect(ctx, panX - 92, y - 40, 184, 92, 18); ctx.fillStyle = '#20263F'; ctx.fill();
    rrect(ctx, panX - 84, y - 34 + dy, 168, 72 - dy, 14); ctx.fillStyle = col; ctx.fill();
    rrect(ctx, panX - 84, y - 34 + dy, 168, 14, 7); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
    ctx.font = '400 38px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, panX, y + 4 + dy * 0.6);
    if (fl > 0.01) softDot(gctx, panX, y, 160, col, 0.8 * fl);
  };
  btn(panY + 40, 'DEPRESS', '#E0303E', o.dep || 0, o.flashDep || 0);
  btn(panY + 150, 'REPRESS', '#1FAE6A', o.rep || 0, o.flashRep || 0);
}
// the warning beacon on the ceiling: on 0..1 (it turns and flashes red)
function alBeacon(t, on) {
  const [bx, by] = AL.beacon;
  rrect(ctx, bx - 40, by - 24, 80, 30, 8); ctx.fillStyle = '#3A4060'; ctx.fill();
  ctx.beginPath(); ctx.arc(bx, by + 6, 34, Math.PI, 0); ctx.fillStyle = on > 0.5 ? '#FF3044' : '#7A2A34'; ctx.fill();
  if (on > 0.01) {
    const ph = (t * 1.6) % 1, a = Math.max(0, Math.sin(ph * Math.PI * 2));
    softDot(gctx, bx, by, 220, '#FF2A3A', 0.9 * on * (0.4 + 0.6 * a));
    // the turning beam across the wall
    const ang = t * 6.0;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const s of [0, Math.PI]) {
      const aa = ang + s, dx = Math.cos(aa), sy = Math.sin(aa) * 0.35;
      const g = ctx.createLinearGradient(bx, by, bx + dx * 900, by + 500);
      g.addColorStop(0, `rgba(255,40,60,${0.10 * on * Math.max(0, Math.cos(aa * 0.5) ** 2)})`); g.addColorStop(1, 'rgba(255,40,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + dx * 1200 - 160, by + 900 + sy * 300); ctx.lineTo(bx + dx * 1200 + 160, by + 900 - sy * 300); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}
// the room (world units). o: {open (outer hatch), gauge, dep, rep, beacon, red (a red wash over the room), sis, sisFace,
// sisHand, dim (the lights going down)}
function alRoom(cam, t, o = {}) {
  screenSpace(); ctx.fillStyle = '#10141F'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  ctx.drawImage(AL_ROOM, -0, -0, W, H);
  // beyond the frame on the left and right: the room continues (a darker extension for wide moves)
  ctx.fillStyle = '#5A6482'; ctx.fillRect(-900, 0, 900, H); ctx.fillRect(W, 0, 900, H);
  alSpace(t, o.open === undefined ? 1 : o.open);
  alWindow(t, { sis: o.sis || 0, face: o.sisFace, hand: o.sisHand || 0 });
  alPanel(t, o);
  alBeacon(t, o.beacon || 0);
  if (o.red > 0.01) { ctx.save(); screenSpace(); ctx.fillStyle = `rgba(255,30,50,${0.1 * o.red * (0.6 + 0.4 * Math.sin(t * 10))})`; ctx.fillRect(0, 0, W, H); ctx.restore(); applyCam(cam); }
  // the LED strip's glow
  ctx.save(); gctx.beginPath(); gctx.moveTo(0, 116); gctx.quadraticCurveTo(W / 2, 168, W, 116); gctx.lineWidth = 26; gctx.strokeStyle = `rgba(230,240,255,${0.5 * (1 - (o.dim || 0))})`; gctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------- the air: fog streaming out through the hatch, or swirling back in
const AL_FOG = (() => { const r = mulberry32(9), s = []; for (let i = 0; i < 140; i++) s.push([r(), r(), r(), r()]); return s; })();
// k 0..1 strength; dir 1 = rushing out (toward the outer hatch), -1 = rushing back in (from the inner side). Screen coords via cam.
function alAir(t, k, dir = 1) {
  if (k <= 0.01) return;
  const { outX, outY } = AL;
  for (const [u, v, p, q] of AL_FOG) {
    const sp = 0.6 + 0.8 * p, ph = ((t * sp + u) % 1);
    const x0 = -200 + v * 600, y0 = 180 + q * 720;
    const f = dir > 0 ? ph : 1 - ph;
    const x = lerp(x0, outX + 120, f * f), y = lerp(y0, outY + (q - 0.5) * 160, f * f);
    const r = 30 + 70 * p * (1 - 0.5 * f), a = 0.12 * k * Math.sin(Math.PI * ph);
    softDot(ctx, x, y, r, '#EAF2FF', a);
    if (q > 0.8) { const L = 60 + 140 * f; line(ctx, x - L, y - (y - outY) * 0.04, x, y, 3, `rgba(240,248,255,${0.35 * k * Math.sin(Math.PI * ph)})`); }
  }
}

// ---------------------------------------------------------------- Ball, the camera drone
// x, y world; s scale (1 = 120 px across); o: {look: [lx, ly], mood: 'calm'|'worried'|'shock'|'sad'|'happy'|'flat', fans 0..1 (spinning),
// blink, tilt, flash (its camera flash), spin (fans with nothing to push: a little shake)}
function alBall(x, y, s, t, o = {}) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s, s);
  // vents and fans on its sides
  for (const sd of [-1, 1]) {
    circle(c, sd * 58, 0, 18, '#4A5274'); circle(c, sd * 58, 0, 13, '#20263F');
    const fa = (o.fans || 0) * t * 40;
    for (let i = 0; i < 3; i++) { const a = fa + i * 2.09; line(c, sd * 58, 0, sd * 58 + Math.cos(a) * 11, Math.sin(a) * 11, 3, '#AAB4D0'); }
  }
  const g = c.createRadialGradient(-20, -24, 6, 0, 0, 62); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.6, '#E8ECF4'); g.addColorStop(1, '#AEB6CC');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 60, 0, 7); c.fill();
  c.lineWidth = 3; c.strokeStyle = '#8A93AE'; c.beginPath(); c.arc(0, 0, 60, 0.2, 2.9); c.stroke();
  // the face: a dark visor with two screen eyes
  rrect(c, -40, -28, 80, 46, 20); c.fillStyle = '#16203A'; c.fill();
  const mood = o.mood || 'calm', [lx, ly] = o.look || [0, 0], bl = o.blink || 0;
  for (const sd of [-1, 1]) {
    const ex = sd * 17 + lx * 5, ey = -5 + ly * 4;
    let rx = 10, ry = 12 * (1 - bl);
    if (mood === 'shock') { rx = 12; ry = 15 * (1 - bl); }
    if (mood === 'happy') { c.beginPath(); c.arc(ex, ey + 4, 9, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 4; c.strokeStyle = '#7FE9FF'; c.stroke(); softDot(gctx, x + ex * s, y + ey * s, 18 * s, '#7FE9FF', 0.8); continue; }
    if (mood === 'flat') ry = 3;
    ellipse(c, ex, ey, rx, Math.max(1.5, ry), '#7FE9FF');
    if (mood === 'worried' || mood === 'sad') line(c, ex - 9 * sd, ey - 15, ex + 7 * sd, ey - 11 + (mood === 'sad' ? 3 : 0), 3, '#7FE9FF');
    softDot(gctx, x + ex * s, y + ey * s, 20 * s, '#7FE9FF', 0.8);
  }
  // the lens under the visor
  circle(c, 0, 34, 10, '#20263F'); circle(c, 0, 34, 6, '#3A5AA8'); circle(c, -2, 32, 2, '#FFFFFF');
  if (o.flash > 0.01) { softDot(gctx, x, y + 34 * s, 260 * s * o.flash, '#FFFFFF', o.flash); softDot(c, x, y + 34 * s, 200 * s * o.flash, '#FFFFFF', 0.8 * o.flash); }
  c.restore();
}

// ---------------------------------------------------------------- props
// the helmet: a clear bubble with a white neck ring (x, y the bubble's centre; s 1 = 200 px across)
function alHelmet(c, x, y, s, rot = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (!o.noRing) { rrect(c, -78, 70, 156, 34, 14); c.fillStyle = '#C3C9DA'; c.fill(); rrect(c, -78, 70, 156, 11, 6); c.fillStyle = '#E9EDF6'; c.fill(); }
  c.beginPath(); c.arc(0, -6, 104, 0, 7); c.fillStyle = 'rgba(190,225,255,0.14)'; c.fill();
  c.lineWidth = 7; c.strokeStyle = 'rgba(235,245,255,0.9)'; c.stroke();
  c.beginPath(); c.arc(0, -6, 88, Math.PI * 1.08, Math.PI * 1.42); c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
  c.beginPath(); c.arc(0, -6, 88, Math.PI * 1.5, Math.PI * 1.56); c.stroke();
  if (o.fish) {   // the goldfish Pip drew in it: a little orange fish
    c.save(); c.translate(10, 4); c.scale(0.9, 0.9); goldfish(c, 0, 0, 1, o.t || 0); c.restore();
  }
  c.restore();
}
// a goldfish (side view, facing right; s 1 = 120 px long)
function goldfish(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s);
  const wag = Math.sin(t * 7) * 0.3;
  c.save(); c.translate(-40, 0); c.rotate(wag);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-34, -40, -46, -30); c.quadraticCurveTo(-30, 0, -46, 30); c.quadraticCurveTo(-34, 40, 0, 0); c.fillStyle = '#FF9A3C'; c.fill();
  c.restore();
  c.beginPath(); c.ellipse(0, 0, 50, 30, 0, 0, 7); const g = c.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#FFB45A'); g.addColorStop(1, '#F06A1E'); c.fillStyle = g; c.fill();
  c.beginPath(); c.moveTo(-10, -26); c.quadraticCurveTo(4, -48, 22, -26); c.closePath(); c.fillStyle = '#FF9A3C'; c.fill();
  circle(c, 26, -6, 9, '#FFFFFF'); circle(c, 28 + (o.lookX || 0) * 2, -6, 5, '#15132A'); circle(c, 27, -8, 1.8, '#FFFFFF');
  if (o.gape) { ellipse(c, 48, 6, 5, 5 + 4 * o.gape, '#7A1A10'); } else line(c, 42, 8, 49, 6, 3, '#9A3A10');
  c.restore();
}
// the chip bag (ears-pop's, in world units): puff 0..1 swells it; pop 0..1 bursts it open
function alChips(c, x, y, s, puff, t, rot = 0, pop = 0) {
  if (pop > 0.01) {   // burst: the bag torn open, chips flying out
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    for (let i = 0; i < 14; i++) {
      const a = hash(i * 3.7) * 6.283, d = 30 + 260 * pop * (0.5 + hash(i)), cx = Math.cos(a) * d, cy = Math.sin(a) * d - 60;
      c.save(); c.translate(cx, cy); c.rotate(a + pop * 6 * hash(i + 2)); ellipse(c, 0, 0, 18, 12, '#F2C14A'); ellipse(c, -4, -3, 8, 4, '#FFE08A'); c.restore();
    }
    c.beginPath(); c.moveTo(-40, -10); c.lineTo(-56, -80); c.lineTo(-20, -60); c.lineTo(-10, -120); c.lineTo(20, -70); c.lineTo(50, -110); c.lineTo(46, -10); c.closePath();
    c.fillStyle = '#C8283A'; c.fill();
    c.restore();
    return;
  }
  const p = clamp(puff), w = lerp(46, 64, p), h = lerp(138, 126, p), bow = lerp(3, 38, p);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const body = () => { c.beginPath(); c.moveTo(-w, -6); c.quadraticCurveTo(-w - bow, -h / 2, -w, -h + 6); c.lineTo(w, -h + 6); c.quadraticCurveTo(w + bow, -h / 2, w, -6); c.closePath(); };
  body(); const g = c.createLinearGradient(-w - bow, 0, w + bow, 0); g.addColorStop(0, '#FF8A66'); g.addColorStop(0.3, '#F2483C'); g.addColorStop(1, '#AE1E2A');
  c.fillStyle = g; c.fill();
  c.save(); body(); c.clip();
  c.fillStyle = '#FFD447'; c.beginPath(); c.ellipse(0, -h * 0.54, w * 0.86 + bow * 0.5, 27 + 5 * p, -0.08, 0, Math.PI * 2); c.fill();
  c.font = '400 32px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#AE1E2A';
  c.save(); c.translate(0, -h * 0.54 + 2); c.rotate(-0.08); c.scale(1 + 0.2 * p, 1); c.fillText('CHIPS', 0, 0); c.restore();
  for (let i = 0; i < 4; i++) { const yy = -h * (0.18 + i * 0.2); line(c, -w * 0.7 + i * 9, yy, w * 0.2 - i * 6, yy - 18, 3, `rgba(110,10,20,${0.45 * (1 - p)})`); }
  ellipse(c, -w * 0.45 - bow * 0.3, -h * 0.6, 6 + 8 * p, 34 + 8 * p, `rgba(255,255,255,${0.2 + 0.4 * p})`, 0.12);
  c.restore();
  for (const yy of [-6, -h + 6]) { rrect(c, -w - 1, yy - 8, 2 * w + 2, 16, 3); c.fillStyle = '#E8ECF8'; c.fill(); for (let xx = -w + 6; xx < w; xx += 9) line(c, xx, yy - 6, xx, yy + 6, 2, 'rgba(120,130,170,0.6)'); }
  c.restore();
}
// the phone on the end of the selfie stick: its screen shows Pip (a message, or her face). s 1 = 120 x 230 px.
// screen: {kind: 'msg' | 'face' | 'photo' | 'fish', k}
function alPhone(c, x, y, s, rot, t, screen = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -62, -118, 124, 236, 20); c.fillStyle = '#15182A'; c.fill();
  rrect(c, -55, -108, 110, 216, 14); c.fillStyle = '#FFF4E8'; c.fill();
  c.save(); rrect(c, -55, -108, 110, 216, 14); c.clip();
  const kind = screen.kind || 'msg';
  if (kind === 'msg' || kind === 'fish') {
    c.fillStyle = '#FFD9E6'; c.fillRect(-55, -108, 110, 40);
    c.font = '800 16px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#8A2A50'; c.fillText('PIP', 0, -88);
    rrect(c, -46, -56, 92, 62, 12); c.fillStyle = '#FF6FA0'; c.fill();
    c.font = '400 20px Anton'; c.fillStyle = '#FFFFFF'; c.fillText(kind === 'fish' ? '❤' : 'NO', 0, -38); c.fillText(kind === 'fish' ? 'LOVE IT' : 'GOLDFISH', 0, -18);
    if (kind === 'msg') c.fillText('BOWL!', 0, 2), 0;
    // her drawing: him as a goldfish in a bowl
    c.save(); c.translate(0, 60); c.scale(0.45, 0.45); c.beginPath(); c.arc(0, 0, 90, 0, 7); c.fillStyle = 'rgba(127,233,255,0.35)'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#3A7AC8'; c.stroke(); goldfish(c, 0, 6, 0.8, t); c.restore();
  } else if (kind === 'photo') {
    c.fillStyle = '#05060F'; c.fillRect(-55, -108, 110, 216);
    earthLimb(c, 30, 210, 190, t, { glowCtx: false, line: 0.03 });
    c.save(); c.translate(-6, -10); c.scale(0.3, 0.3); alHelmet(c, 0, 0, 1, 0, { noRing: false }); c.restore();
  }
  c.restore();
  circle(c, 0, -112, 3, '#3A3E5A');
  c.restore();
}

// ---------------------------------------------------------------- him, floating
// h: {x, y, s, rot (the whole body turns about his middle), face, L, R (rig-local IK targets for the hands, null = the
// float pose), legs 0..1 (how bent), swell 0..1 (he puffs up), blue 0..1, cheeks 0..1 (a held breath), exhale 0..1 (a
// cloud of breath leaving his mouth), tongue 0..1 (it sticks out), boil 0..1 (bubbles on his tongue and in his eyes),
// hair 0..1 (blown toward the hatch), stick {k, a} (the selfie stick in his right hand, angle a), phone (screen),
// helmet 0..1, limp 0..1, sunL 0..1 (the sun on one side), post(lc, r, st)}
function alFloatPose(h = {}) {
  const lg = h.legs === undefined ? 0.5 : h.legs, limp = h.limp || 0;
  const base = { hipY: -222, lean: 0, armL: { a: lerp(1.15, 0.9, limp), b: lerp(0.9, 0.5, limp) }, armR: { a: lerp(1.15, 0.9, limp), b: lerp(0.9, 0.5, limp) },
    legL: { a: 0.16 + 0.1 * lg, b: -0.55 * lg }, legR: { a: 0.12 + 0.12 * lg, b: -0.45 * lg }, hand: h.hand || 'open', feetFront: 1 };
  let p = base;
  if (h.L) p = ikReach(p, 'L', h.L, -1);
  if (h.R) p = ikReach(p, 'R', h.R, 1);
  return p;
}
function alHero(cam, t, h = {}) {
  const X = h.x === undefined ? AL.heroX : h.x, Y = h.y === undefined ? AL.heroY : h.y, S = (h.s === undefined ? AL.hs : h.s);
  const sw = h.swell || 0;
  const st = { x: X, y: Y, s: S, face: Object.assign({}, h.face || FACES.calm, { blue: h.blue || 0 }), pose: h.pose || alFloatPose(h), noLegs: !!h.noLegs, seed: 4,
    headDX: h.headDX || 0, headDY: h.headDY || 0, headRot: h.headRot || 0 };
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  // the whole body turns about his middle (rig-local [0, -260])
  const mid = [X, Y - 330 * S];
  lctx.translate(mid[0], mid[1]); lctx.rotate(h.rot || 0); lctx.translate(-mid[0], -mid[1]);
  if (h.pre) h.pre(lctx, st);
  // swelling: the body a little wider (the skin holds it)
  if (sw > 0.01) { lctx.translate(mid[0], mid[1]); lctx.scale(1 + 0.16 * sw, 1 + 0.08 * sw); lctx.translate(-mid[0], -mid[1]); }
  const r = drawCharacter(lctx, st, t, h.pal || ALPAL);
  lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s);
  // the mission patch on his chest
  if (!h.pal) { lctx.save(); lctx.translate(r.P[0], r.P[1]); lctx.rotate(st.pose.lean); circle(lctx, 46, -118, 17, '#F4F1EA'); circle(lctx, 46, -118, 13, '#1E2A66'); circle(lctx, 46, -118, 5, '#FFD447'); lctx.restore(); }
  // swollen hands
  if (sw > 0.05) for (const k of ['L', 'R']) { const w = r['wr' + k], d = r['armDir' + k]; circle(lctx, w[0] + d[0] * 16, w[1] + d[1] * 16, 21 + 12 * sw, rgba('#F2B892', 0.9)); }
  // head-space extras
  lctx.save(); lctx.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); lctx.rotate(r.lean + (st.headRot || 0));
  if (h.hair > 0.01) alHairBlown(lctx, h.hair, t);
  if (sw > 0.05) { ellipse(lctx, -40, 30, 18 * sw, 12 * sw, 'rgba(242,170,140,0.5)'); ellipse(lctx, 40, 30, 18 * sw, 12 * sw, 'rgba(242,170,140,0.5)'); }
  if (h.cheeks > 0.01) alCheeks(lctx, h.cheeks, t);
  if (h.tongue > 0.01) alTongue(lctx, h.tongue, h.boil || 0, t);
  if (h.boil > 0.01) alEyeBoil(lctx, h.boil, t);
  if (h.frost > 0.01) alFrost(lctx, h.frost);
  if (h.exhale > 0.01) alBreathCloud(lctx, h.exhale, t);
  if (h.helmet > 0.01) alHelmet(lctx, 0, -8, 0.82 * E.outBack(clamp(h.helmet), 1.6));
  if (h.headPost) h.headPost(lctx, r, st);
  lctx.restore();
  // the selfie stick in his right hand
  if (h.stick) {
    const w = r.wrR, a = h.stick.a === undefined ? -0.9 : h.stick.a, L = 420 * (h.stick.k === undefined ? 1 : h.stick.k);
    const ex = w[0] + Math.cos(a) * L, ey = w[1] + Math.sin(a) * L;
    line(lctx, w[0], w[1], ex, ey, 9, '#2A2E44'); line(lctx, w[0], w[1], ex, ey, 4, '#5A607E');
    alPhone(lctx, ex + Math.cos(a) * 60, ey + Math.sin(a) * 60, 0.9, a + Math.PI / 2, t, h.phone || {});
  }
  if (h.post) h.post(lctx, r, st);
  lctx.restore();
  // light: the room's cool white from above, the Earth's blue from the hatch side (right), the beacon's red
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  const [hx] = toScreen(cam, AL.outX, AL.outY);
  const g = lctx.createLinearGradient(hx, 0, hx - 1500 * cam.zoom, 0);
  g.addColorStop(0, `rgba(90,160,255,${0.22 * (h.earthLight === undefined ? 1 : h.earthLight)})`); g.addColorStop(1, 'rgba(90,160,255,0)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  if (h.red > 0.01) { lctx.fillStyle = `rgba(255,40,60,${0.16 * h.red * (0.5 + 0.5 * Math.max(0, Math.sin(t * 1.6 * 6.283)))})`; lctx.fillRect(0, 0, W, H); }
  if (h.dark > 0.01) { lctx.fillStyle = `rgba(10,12,30,${0.5 * h.dark})`; lctx.fillRect(0, 0, W, H); }
  if (h.sunL > 0.01) { const [sx] = toScreen(cam, X + 300, 0); const g2 = lctx.createLinearGradient(sx, 0, sx - 900 * cam.zoom, 0); g2.addColorStop(0, `rgba(255,236,200,${0.45 * h.sunL})`); g2.addColorStop(1, 'rgba(255,236,200,0)'); lctx.fillStyle = g2; lctx.fillRect(0, 0, W, H); }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  occludeGlow();
  return { st, r, mid };
}
// what is on the character layer blocks the glow behind it (a bright Earth or lamp must not bloom through him)
function occludeGlow(k = 1) {
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out'; gctx.globalAlpha = k;
  gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
}
// a world point given in his rig-local coords, with his body turn (h.rot) applied
function alPt(h, p) {
  const X = h.x === undefined ? AL.heroX : h.x, Y = h.y === undefined ? AL.heroY : h.y, S = (h.s === undefined ? AL.hs : h.s);
  const mid = [X, Y - 330 * S], wx = X + p[0] * S, wy = Y + p[1] * S, a = h.rot || 0;
  const dx = wx - mid[0], dy = wy - mid[1];
  return [mid[0] + dx * Math.cos(a) - dy * Math.sin(a), mid[1] + dx * Math.sin(a) + dy * Math.cos(a)];
}
function alHeadPt(h) { return alPt(h, [h.headDX || 0, -470 + (h.headDY || 0)]); }

// head-space details (the head's centre is the origin; 1 unit = 1 rig unit)
function alHairBlown(c, k, t) {
  c.fillStyle = PAL.hair;
  for (let i = 0; i < 6; i++) {
    const y = -78 + i * 7, x0 = 10 + i * 9, len = (40 + 34 * hash(i)) * k * (1 + 0.15 * Math.sin(t * 30 + i));
    c.beginPath(); c.moveTo(x0, y - 7); c.quadraticCurveTo(x0 + 40 + len * 0.6, y - 14 + 6 * Math.sin(t * 25 + i), x0 + 46 + len, y - 2); c.lineTo(x0 + 6, y + 6); c.closePath(); c.fill();
  }
}
function alCheeks(c, k, t) {
  for (const s of [-1, 1]) { const wob = 1 + 0.04 * Math.sin(t * 13 + s); ellipse(c, s * 36, 30, 26 * k * wob, 22 * k * wob, 'rgba(242,170,140,0.95)'); ellipse(c, s * 40, 24, 9 * k, 6 * k, 'rgba(255,220,200,0.7)'); }
  line(c, -12, 40, 12, 40, 5, '#8A3A3A');
}
// his tongue out, with spit that bubbles (boil 0..1) and a little frost on it (cold from the boiling)
function alTongue(c, k, boil, t) {
  c.save(); c.translate(0, 44);
  c.beginPath(); c.ellipse(0, 10 + 16 * k, 16, 10 + 18 * k, 0, 0, 7); c.fillStyle = '#E0616C'; c.fill();
  line(c, 0, 6, 0, 10 + 24 * k, 2.5, 'rgba(150,40,60,0.6)');
  if (boil > 0.01) for (let i = 0; i < 9; i++) {
    const ph = (t * (1.4 + hash(i)) + hash(i * 5)) % 1, bx = -11 + 22 * hash(i * 2.3), by = 4 + 30 * k * hash(i * 1.7) - 16 * ph;
    const r = (2 + 4 * hash(i * 9)) * boil * (0.5 + ph);
    c.beginPath(); c.arc(bx, by, r, 0, 7); c.fillStyle = `rgba(230,245,255,${0.85 * (1 - ph)})`; c.fill(); c.lineWidth = 1.2; c.strokeStyle = `rgba(255,255,255,${0.9 * (1 - ph)})`; c.stroke();
  }
  c.restore();
}
function alEyeBoil(c, k, t) {
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const ph = (t * 1.8 + hash(i * 3 + s) ) % 1, x = s * 24 + (hash(i + s * 7) - 0.5) * 18, y = 10 - 22 * ph;
    c.beginPath(); c.arc(x, y, (1.5 + 2.5 * hash(i)) * k, 0, 7); c.fillStyle = `rgba(220,240,255,${0.8 * (1 - ph) * k})`; c.fill();
  }
}
function alFrost(c, k) {
  for (let i = 0; i < 10; i++) { const x = -18 + 36 * hash(i * 4.1), y = 40 + 14 * hash(i * 2.9); c.save(); c.translate(x, y); c.rotate(i); line(c, -4 * k, 0, 4 * k, 0, 2, 'rgba(230,248,255,0.9)'); line(c, 0, -4 * k, 0, 4 * k, 2, 'rgba(230,248,255,0.9)'); c.restore(); }
}
// the cloud of a big breath out (k 0..1: how far it has travelled), drawn from the mouth toward the right
function alBreathCloud(c, k, t) {
  for (let i = 0; i < 9; i++) {
    const f = clamp(k * 1.3 - i * 0.04), x = 30 + 220 * f * (0.6 + 0.4 * hash(i)), y = 40 + (hash(i * 3) - 0.5) * 70 * f, r = 12 + 34 * f;
    softDot(c, x, y, r, '#F4F8FF', 0.55 * (1 - f) + 0.1);
  }
}
