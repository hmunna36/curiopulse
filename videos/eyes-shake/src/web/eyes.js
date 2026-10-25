// eyes-shake (25 Oct 2026): eyes, big, in head units (over the rig's own: its eyes sit at (±24, -2), 14 x 16), with the
// "parking brake" on them (a red caliper that clamps each iris between jumps) and the buzz of someone who can let go.
//   esEyes(c, pal, F, t)   F = {lx, ly (-1..1), cross 0..1 (both pupils to the nose), open, blink, squint, buzz 0..1
//                          (the shake, conjugate: both eyes together, a jump every frame; ghost: how strong the blur of
//                          irises across its span is, 0.16), smear: {x0, x1, k, at} (an iris
//                          on its way between two looks), brake 0..1 (the caliper clamped), brakeOpen (pads apart), off
//                          0..1 (the calipers flown off: up and away), iris (colour), big (iris size)}
//   esLamp(c, k, t)        the red parking-brake lamp, (P), on a forehead (head units, centred)
//   esHummer(c, x, y, s, t, o)  a hummingbird hovering (any context): o = {flip, look, wing}
//   esPhoto(c, w, h, kind, t)   a framed family photo centred on (0, 0) in the current transform: 'shakers' (gran, mum
//                          and a kid, all buzzing) or 'parents' (his mum and dad, calipers on, lamps lit)
//   esScope(c, k, t)       a stethoscope round a neck (rig space, from the shoulders down)
//   tagPill, okTick, sparkle, comicBurst: labels (screen space)
'use strict';

const ES_EYE = { x: 24, y: -2, rx: 15.4, ry: 16.4, IR: 9.0, SPAN: 6.2 };
const ES_IRIS = { hero: ['#7A5230', '#4A2E18', '#B8834E'], friend: ['#3E5A2A', '#24361A', '#7FA052'], blue: ['#3A6AA8', '#203E6A', '#7FA8DA'] };
const ES_RED = '#E8404E', ES_RED_DK = '#8A1E2A', ES_RED_HI = '#FF8A94';

// the buzz offset at time t: one jump every frame (15 back-and-forths a second at 30 fps), its size a little uneven
function esBuzz(t) {
  const n = Math.round(t * 30);
  return (n % 2 ? 1 : -1) * (0.78 + 0.22 * hash(n * 1.7));
}

function esIris(c, px, py, a, col, R) {
  circle(c, px, py, R * 1.04, rgba(col[1], a)); circle(c, px, py, R * 0.9, rgba(col[0], a));
  circle(c, px - R * 0.13, py + R * 0.18, R * 0.6, rgba(col[2], 0.55 * a));
  circle(c, px, py, R * 0.48, rgba('#120A0C', a));
}

// the caliper on one iris (s = which eye: -1 screen-left, 1 screen-right), centred on the iris at (px, py)
function esCaliper(c, s, px, py, R, k, open, off, t) {
  if (off >= 0.999) return;
  const gap = lerp(R * 0.62, -R * 0.05, clamp(k)) + R * 0.5 * clamp(open);   // how far the pads stand off the iris edge
  c.save();
  if (off > 0.001) {                                                            // flown off: up and outward, spinning
    const u = E.outCubic(off);
    c.translate(px + s * 70 * u, py - 150 * u + 120 * u * u); c.rotate(s * 6.5 * u); c.translate(-px, -py);
    c.globalAlpha = 1 - clamp((off - 0.7) / 0.3);
  }
  const pw = R * 1.0, ph = R * 0.42, yT = py - R - gap - ph, yB = py + R + gap;
  // the body: a C round the outer side of the iris, from the top pad to the bottom pad
  const ox = px + s * (R * 0.55);
  c.beginPath();
  c.moveTo(px - pw * 0.15 * s, yT + ph * 0.3);
  c.bezierCurveTo(ox + s * R * 1.25, yT - ph * 0.4, ox + s * R * 1.25, yB + ph * 1.4, px - pw * 0.15 * s, yB + ph * 0.7);
  c.lineWidth = R * 0.42; c.strokeStyle = ES_RED_DK; c.lineCap = 'round'; c.stroke();
  c.lineWidth = R * 0.28; c.strokeStyle = ES_RED; c.stroke();
  // the two pads
  for (const y of [yT, yB]) {
    rrect(c, px - pw / 2, y, pw, ph, ph * 0.4); c.fillStyle = ES_RED_DK; c.fill();
    rrect(c, px - pw / 2 + 0.8, y + 0.8, pw - 1.6, ph - 1.6, ph * 0.35); c.fillStyle = ES_RED; c.fill();
    rrect(c, px - pw * 0.34, y + ph * 0.18, pw * 0.36, ph * 0.22, ph * 0.1); c.fillStyle = 'rgba(255,190,196,0.85)'; c.fill();
  }
  // a bolt on the body
  const bx = ox + s * R * 0.92, by = py;
  circle(c, bx, by, R * 0.2, '#C9CED8'); circle(c, bx - R * 0.05, by - R * 0.05, R * 0.08, '#FFFFFF');
  c.restore();
}

function esEyes(c, pal, F = {}, t = 0) {
  const lx0 = F.lx || 0, ly = F.ly || 0, open = F.open === undefined ? 1 : F.open, bl = clamp(F.blink || 0), sq = clamp(F.squint || 0);
  const cross = clamp(F.cross || 0), buzz = F.buzz || 0, col = F.iris || ES_IRIS.hero, R = ES_EYE.IR * (F.big || 1);
  const bz = buzz > 0.001 ? 0.62 * buzz * esBuzz(t) : 0;
  const cal = [];
  for (const s of [-1, 1]) {
    const ex = s * ES_EYE.x, ey = ES_EYE.y, rx = ES_EYE.rx, ry = ES_EYE.ry * open;
    const lx = clamp(lx0 - s * 0.72 * cross + bz, -1.15, 1.15);
    const P = (k) => [ex + lerp(F.smear ? F.smear.x0 - s * 0.72 * cross : lx, F.smear ? F.smear.x1 - s * 0.72 * cross : lx, k) * ES_EYE.SPAN, ey + ly * 5.2];
    const smearing = F.smear && F.smear.k > 0.01;
    const p = smearing ? P(F.smear.at === undefined ? 1 : F.smear.at) : [ex + lx * ES_EYE.SPAN, ey + ly * 5.2];
    paint(() => {
      ellipse(c, ex, ey, rx, ry, '#FFFFFF');
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.clip();
      ellipse(c, ex, ey - ry * 0.55, rx, ry * 0.5, 'rgba(150,170,200,0.16)');       // the lid's shadow on the white
      if (buzz > 0.05) {                                                            // the buzz: faint irises across its span
        for (let i = -2; i <= 2; i++) esIris(c, ex + (lx - bz + i * 0.31 * buzz) * ES_EYE.SPAN, p[1], (F.ghost || 0.16) * buzz, col, R);
      }
      if (smearing) for (let i = 0; i <= 8; i++) { const q = P(i / 8); esIris(c, q[0], q[1], 0.32 * F.smear.k, col, R); }
      esIris(c, p[0], p[1], smearing ? 1 - 0.5 * F.smear.k : 1, col, R);
      circle(c, p[0] - R * 0.3, p[1] - R * 0.36, R * 0.27, 'rgba(255,255,255,0.95)'); circle(c, p[0] + R * 0.28, p[1] + R * 0.26, R * 0.12, 'rgba(255,255,255,0.8)');
      const lid = mixHex(pal.skin, pal.skinSh, 0.25);
      if (bl > 0.01) {
        c.fillStyle = lid; c.fillRect(ex - rx - 1, ey - ry - 2, 2 * rx + 2, (2 * ry + 2) * bl + 1);
        line(c, ex - rx, ey - ry + 2 * ry * bl, ex + rx, ey - ry + 2 * ry * bl, 2.6, '#6A3526');
      }
      if (sq > 0.01) {                                                              // the lower lid up: effort
        const top = ey + ry - 2 * ry * 0.42 * sq;
        c.fillStyle = lid; c.fillRect(ex - rx - 1, top, 2 * rx + 2, ry * 2);
        c.beginPath(); c.moveTo(ex - rx, top + 3); c.quadraticCurveTo(ex, top - 2.5, ex + rx, top + 3); c.lineWidth = 2.2; c.strokeStyle = 'rgba(106,53,38,0.8)'; c.stroke();
      }
      c.restore();
      c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.lineWidth = 1.1; c.strokeStyle = 'rgba(120,60,40,0.45)'; c.stroke();
      if (bl < 0.85) {
        const yl = ey - ry + 2 * ry * bl;
        c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, Math.PI * 1.12, Math.PI * 1.88); c.lineWidth = 2.4; c.lineCap = 'round'; c.strokeStyle = '#3A1E16';
        if (bl < 0.02) c.stroke(); else line(c, ex - rx * 0.85, yl, ex + rx * 0.85, yl, 2.4, '#3A1E16');
      }
    });
    cal.push([s, p[0], p[1]]);
  }
  // the brake: drawn over the eyes (and allowed outside them when it flies off)
  const jumping = F.smear && F.smear.k > 0.01 && (F.brakeOpen || 0) > 0.3;     // mid-jump the brake is off the iris
  if (!jumping && ((F.brake || 0) > 0.001 || (F.brakeOpen || 0) > 0.001)) {
    paint(() => {
      for (const [s, px, py] of cal) {
        c.save(); c.beginPath(); c.ellipse(s * ES_EYE.x, ES_EYE.y, ES_EYE.rx + (F.off > 0.001 ? 400 : 0), ES_EYE.ry * open + (F.off > 0.001 ? 400 : 0), 0, 0, Math.PI * 2); c.clip();
        esCaliper(c, s, px, py, R, F.brake || 0, F.brakeOpen || 0, F.off || 0, t);
        c.restore();
      }
    });
  }
}

// the red parking-brake lamp on a forehead, head units, centred at (0, 0): a ring with (P) and two arcs
function esLamp(c, k, t, x = 0, y = -50, r = 11) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    circle(c, 0, 0, r * 1.18, 'rgba(40,6,10,0.75)');
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.lineWidth = r * 0.2; c.strokeStyle = '#FF3B4E'; c.stroke();
    for (const sd of [-1, 1]) { c.beginPath(); c.arc(0, 0, r * 1.5, sd > 0 ? -0.75 : Math.PI - 0.75, sd > 0 ? 0.75 : Math.PI + 0.75); c.lineWidth = r * 0.18; c.stroke(); }
    c.font = `900 ${r * 1.3}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FF5A6E'; c.fillText('P', 0, r * 0.08);
    c.restore();
  });
}

// ---------------------------------------------------------------- a car's handbrake lever (screen space)
// pivot (x, y), size s (1 = a 230 px lever), ang 0..1 (0 down, 1 pulled all the way up), k 0..1 (slid in from the right)
function esLever(x, y, s, ang, k) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x + (1 - E.outCubic(clamp(k))) * 420, y); ctx.scale(s, s);
  const a = lerp(-0.12, 0.78, clamp(ang)), dx = -Math.cos(a), dy = -Math.sin(a), L = 230;
  // the ratchet's toothed quadrant behind the pivot
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 70, Math.PI * 0.95, Math.PI * 1.32); ctx.closePath(); ctx.fillStyle = '#5A6070'; ctx.fill();
  paint(() => { for (let i = 0; i < 9; i++) { const t2 = Math.PI * (0.96 + i * 0.04); line(ctx, Math.cos(t2) * 62, Math.sin(t2) * 62, Math.cos(t2) * 74, Math.sin(t2) * 74, 5, '#8A92A6'); } });
  // the rod, then the grip and the red release button at the tip
  line(ctx, 0, 0, dx * L, dy * L, 30, '#1A1C26');
  line(ctx, 0, 0, dx * L, dy * L, 22, '#C9CED8');
  paint(() => line(ctx, dx * 8 + dy * 5, dy * 8 - dx * 5, dx * (L * 0.55) + dy * 5, dy * (L * 0.55) - dx * 5, 5, 'rgba(255,255,255,0.75)'));
  line(ctx, dx * L * 0.52, dy * L * 0.52, dx * L * 1.02, dy * L * 1.02, 46, '#121318');
  line(ctx, dx * L * 0.52, dy * L * 0.52, dx * L * 1.02, dy * L * 1.02, 38, '#2A2D3A');
  paint(() => { for (let i = 0; i < 6; i++) { const u = 0.58 + i * 0.075, px = dx * L * u, py = dy * L * u; line(ctx, px + dy * 15, py - dx * 15, px - dy * 15, py + dx * 15, 3, 'rgba(0,0,0,0.55)'); } });
  circle(ctx, dx * (L + 22), dy * (L + 22), 19, '#8A1E2A'); circle(ctx, dx * (L + 22), dy * (L + 22), 15, '#E8404E');
  paint(() => circle(ctx, dx * (L + 22) - 5, dy * (L + 22) - 5, 5, 'rgba(255,220,224,0.9)'));
  // the rubber boot over the pivot
  ctx.beginPath(); ctx.moveTo(-64, 34); ctx.quadraticCurveTo(-60, -26, 0, -30); ctx.quadraticCurveTo(60, -26, 64, 34); ctx.closePath(); ctx.fillStyle = '#16171E'; ctx.fill();
  paint(() => { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 26 - i * 16, 58 - i * 9, 7, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(120,130,160,0.45)'; ctx.stroke(); } });
  ctx.restore();
}

// ---------------------------------------------------------------- a hummingbird (any context; s = 1 is ~120 px long)
function esHummer(c, x, y, s, t, o = {}) {
  const f = o.flip ? -1 : 1;
  c.save(); c.translate(x, y); c.scale(s * f, s); c.rotate(o.tilt || 0);
  const n = Math.round(t * 30), up = n % 2;
  actor(() => {
    // the far wing (behind)
    c.beginPath(); c.moveTo(-2, -8); c.quadraticCurveTo(-30, up ? -78 : 20, -8, up ? -64 : 34); c.closePath(); c.fillStyle = 'rgba(160,220,210,0.5)'; c.fill();
    // the tail
    c.beginPath(); c.moveTo(-26, 4); c.lineTo(-62, 14); c.lineTo(-58, 24); c.lineTo(-24, 12); c.closePath(); c.fillStyle = '#1E6A5A'; c.fill();
    // the body and the head
    c.beginPath(); c.ellipse(-6, 4, 30, 15, -0.18, 0, 7); c.fillStyle = '#2FA88E'; c.fill();
    c.beginPath(); c.ellipse(-4, 10, 22, 8, -0.18, 0, Math.PI); c.fillStyle = '#E8F2E0'; c.fill();
    circle(c, 22, -8, 14, '#2FA88E');
    c.beginPath(); c.ellipse(20, 4, 9, 6, 0.3, 0, 7); c.fillStyle = '#E8355A'; c.fill();          // the red throat
    c.beginPath(); c.moveTo(33, -10); c.lineTo(80, -6); c.lineTo(33, -4); c.closePath(); c.fillStyle = '#1A1A22'; c.fill();   // the beak
  });
  paint(() => { circle(c, 26, -11, 4.2, '#0B0B14'); circle(c, 24.6, -12.6, 1.5, '#FFFFFF');
    if (o.brow) line(c, 18, -21 + 2 * o.brow, 32, -19 - 3 * o.brow, 2.4, '#123A30'); });
  // the near wing: a blur that flips every frame
  c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(20, up ? -92 : 34, 6, up ? -84 : 48); c.closePath(); c.fillStyle = 'rgba(200,245,235,0.55)'; c.fill();
  c.restore();
}

// ---------------------------------------------------------------- a framed family photo, centred on (0, 0)
// kind 'shakers': gran, mum and a kid, eyes buzzing; 'parents': his mum and dad, calipers on and lamps lit
const ES_GRAN = Object.assign({}, FRPAL, { hair: '#D9D6E2', hairHi: '#FFFFFF', coat: '#C85A8A', coatSh: '#9A3A66', coatHi: '#E88AB2', coatDk: '#6A2446', strap: '#C85A8A', strapSh: '#9A3A66' });
const ES_MUM = Object.assign({}, FRPAL, { hair: '#4A2A1A', coat: '#3FB8A8', coatSh: '#23806F', coatHi: '#7FE0D2', coatDk: '#1A5E52', strap: '#3FB8A8', strapSh: '#23806F' });
const ES_KID = Object.assign({}, FRPAL, { coat: '#FFB02A', coatSh: '#D08410', coatHi: '#FFD27A', coatDk: '#9A5E08', strap: '#FFB02A', strapSh: '#D08410' });
const ES_HMUM = Object.assign({}, PAL, { hair: '#7A4A2A', hairHi: '#A06A44', coat: '#8A6AE0', coatSh: '#6248B4', coatHi: '#B49CF4', coatDk: '#3E2C80', strap: '#8A6AE0', strapSh: '#6248B4' });
const ES_HDAD = Object.assign({}, PAL, { hair: '#3A2A20', coat: '#4A8AD8', coatSh: '#2E62A6', coatHi: '#8AB8F0', coatDk: '#1E3E6A', strap: '#4A8AD8', strapSh: '#2E62A6' });
function esPhoto(c, w, h, kind, t, o = {}) {
  // the frame
  rrect(c, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 8); c.fillStyle = '#5A3A22'; c.fill();
  rrect(c, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 4); c.fillStyle = '#8A5E36'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
    const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, kind === 'parents' ? '#F3D9A8' : '#BFE3F0'); g.addColorStop(1, kind === 'parents' ? '#D8A86A' : '#7FB8D8');
    c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
    const people = kind === 'parents'
      ? [[-w * 0.24, ES_HMUM, 1.0, 'hmum'], [w * 0.24, ES_HDAD, 1.04, 'hdad']]
      : [[-w * 0.3, ES_GRAN, 0.96, 'gran'], [0, ES_MUM, 1.0, 'mum'], [w * 0.3, ES_KID, 0.78, 'kid']];
    const S = (w / 330) * (kind === 'parents' ? 0.6 : 0.42);
    for (const [x, pal, k, who] of people) {
      const s = S * k, y = -h * (kind === 'parents' ? 0.06 : 0.02) + 470 * s, head = [x, y - 470 * s];
      if (who === 'hmum' || who === 'mum') {                                     // long hair, behind the head
        c.save(); c.translate(head[0], head[1]); c.scale(s, s);
        c.beginPath(); c.ellipse(0, 22, 80, 96, 0, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(76, 110); c.quadraticCurveTo(0, 128, -76, 110); c.closePath();
        c.fillStyle = pal.hair; c.fill(); c.restore();
      }
      drawCharacter(c, { x, y, s, pose: POSES.stand, noLegs: true, face: Object.assign({}, FACES.calm, { lookX: 0, lookY: 0, mouth: kind === 'parents' ? 'flat' : 'grin', mouthOpen: kind === 'parents' ? 0.1 : 0.6, browY: kind === 'parents' ? -0.2 : 0.4 }) }, t, pal);
      c.save(); c.translate(head[0], head[1]); c.scale(s, s);
      if (kind === 'parents') { esEyes(c, pal, { brake: 1 }, t); esLamp(c, 1, t, 0, -50, 9); }
      else esEyes(c, pal, { buzz: 1, iris: ES_IRIS.friend }, t + x * 0.01);
      if (who === 'gran') { paint(() => { for (const sx of [-24, 24]) { c.beginPath(); c.arc(sx, -2, 20, 0, 7); c.lineWidth = 3.5; c.strokeStyle = '#B8902A'; c.stroke(); } line(c, -4, -4, 4, -4, 3.5, '#B8902A'); }); }
      if (kind !== 'parents') for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) { const j = esBuzz(t + i + x) * 3; line(c, sd * (76 + i * 12) + j, -18 + i * 30, sd * (92 + i * 12) + j, -18 + i * 30, 6, 'rgba(255,255,255,0.9)'); }
      if (who === 'kid') { paint(() => { c.beginPath(); c.moveTo(-50, -58); c.quadraticCurveTo(0, -112, 50, -58); c.closePath(); c.fillStyle = '#E8404E'; c.fill(); line(c, 40, -60, 78, -52, 8, '#E8404E'); }); }
      c.restore();
    }
    c.restore();
    // glass shine
    c.beginPath(); c.moveTo(-w / 2 + w * 0.08, -h / 2); c.lineTo(-w / 2 + w * 0.3, -h / 2); c.lineTo(-w / 2, -h / 2 + h * 0.45); c.lineTo(-w / 2, -h / 2 + h * 0.2); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fill();
  });
}

// ---------------------------------------------------------------- a stethoscope round his neck (rig space)
function esScope(c, r, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2), n = r.neck;
  c.save(); c.translate(n[0], n[1] + 4); c.scale(s, s);
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(-44, -8); c.bezierCurveTo(-60, 40, -40, 92, -6, 120); c.moveTo(44, -8); c.bezierCurveTo(60, 40, 30, 86, -6, 120);
  c.lineWidth = 10; c.strokeStyle = '#1E2236'; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#3A4060'; c.stroke();
  c.beginPath(); c.moveTo(-6, 120); c.quadraticCurveTo(-10, 150, 14, 162); c.lineWidth = 8; c.strokeStyle = '#1E2236'; c.stroke();
  circle(c, 22, 166, 17, '#9AA6B8'); circle(c, 22, 166, 11, '#D8E0EA');
  paint(() => circle(c, 18, 162, 4, '#FFFFFF'));
  c.restore();
}

// ---------------------------------------------------------------- labels (screen space)
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
// a comic burst with a word (screen space)
function comicBurst(x, y, s, k, word, col = '#FF4A5E', rot = -0.12, size = 104) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.4) * s;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(e, e);
  const n = 14;
  ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, R = i % 2 ? 150 : 205 + 18 * hash(i * 3.1); ctx.lineTo(Math.cos(a) * R * 1.25, Math.sin(a) * R * 0.78); } ctx.closePath();
  ctx.fillStyle = '#0B0B1A'; ctx.fill();
  ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, R = i % 2 ? 136 : 190 + 18 * hash(i * 3.1); ctx.lineTo(Math.cos(a) * R * 1.25, Math.sin(a) * R * 0.78); } ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.font = `900 ${size}px Anton, Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 14; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(word, 0, 4); ctx.fillStyle = '#FFFFFF'; ctx.fillText(word, 0, 4);
  ctx.restore();
}
