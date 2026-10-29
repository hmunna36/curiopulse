// Would SATURN Float in Your Bathtub? 🪐: the cosmic bath (29 Oct 2026). A clawfoot tub floating among the stars, seen
// from the front and a little above (23 degrees: the same look-down as Saturn's rings), the hiker soaking at its far end
// (bare shoulders: finger-wrinkles' BARE palette), foam, steam, soap bubbles drifting off into space, the rubber duck
// (finger-wrinkles' duck with a side-eye), Saturn floating in it (the rings on the water, the globe two thirds under,
// the water laid over the part that is under), splashes, ripples, the foam mountain and its popping, two measuring cups,
// a scrub brush; and the SPLIT-LEVEL set: the same tub cut open at the waterline, the far wall, the floor, the water
// with light shafts and caustics, the planets under it (sbTank*). World units = screen pixels at zoom 1.
'use strict';

const SBPAL = Object.assign({}, PAL, { coat: PAL.skin, coatSh: PAL.skinSh, coatHi: PAL.skinHi, coatDk: '#B8704F', bare: true });
// the tub, front view: the rim's ellipse (centre, half-axes), the water's ellipse below it, the body below the rim
const TB = { cx: 540, rimY: 1250, rimA: 566, rimB: 200, waterY: 1316, waterA: 510, waterB: 178, bottom: 1640, feet: 1704 };
const SBH = { x: 540, y: 1398, s: 1.35 };           // the soaker: feet origin (under the water), scale
const SB_WL = 1212;                                  // the waterline across his chest (world y)
let SB_FOAM = null, SB_STEAM = null, SB_SOAP = null;

function sbInitBath() {
  const rng = mulberry32(57);
  SB_FOAM = [];
  for (let i = 0; i < 150; i++) {
    // foam floats round the edges of the water and in a collar round him, never in the middle where Saturn lands
    const a = rng() * Math.PI * 2, rim = 0.78 + 0.2 * rng();
    let x = TB.cx + Math.cos(a) * TB.waterA * rim, y = TB.waterY + Math.sin(a) * TB.waterB * rim;
    if (i < 34) { x = SBH.x + (rng() - 0.5) * 300; y = SB_WL + rng() * 26; }
    if (y < SB_WL - 2 && Math.abs(x - SBH.x) < 140) continue;
    SB_FOAM.push({ x, y, r: 9 + Math.pow(rng(), 2) * 26, ph: rng() * 6, a: rng() });
  }
  SB_FOAM.sort((p, q) => p.y - q.y);
  SB_STEAM = [...Array(12)].map(() => ({ x: 200 + rng() * 680, ph: rng(), sp: 0.1 + rng() * 0.07, r: 80 + rng() * 110, sw: rng() * 6 }));
  SB_SOAP = [...Array(9)].map(() => ({ x: 150 + rng() * 780, ph: rng(), sp: 0.05 + rng() * 0.05, r: 9 + rng() * 16, sw: rng() * 6, hue: rng() }));
}

// ---------------------------------------------------------------- the tub, front view
// the far part: the inner walls above the water, the far half of the rim, the water's surface (all behind him)
function sbTubBack(t) {
  // the rim (whole), then the opening, then the inner wall down to the water
  ctx.beginPath(); ctx.ellipse(TB.cx, TB.rimY, TB.rimA, TB.rimB, 0, 0, 7);
  const rg = ctx.createLinearGradient(0, TB.rimY - TB.rimB, 0, TB.rimY + TB.rimB);
  rg.addColorStop(0, '#FFFFFF'); rg.addColorStop(1, '#C9D2DE');
  ctx.fillStyle = rg; ctx.fill();
  ctx.beginPath(); ctx.ellipse(TB.cx, TB.rimY + 4, TB.rimA - 30, TB.rimB - 24, 0, 0, 7);
  const ig = ctx.createLinearGradient(0, TB.rimY - TB.rimB, 0, TB.waterY);
  ig.addColorStop(0, '#DCE3EC'); ig.addColorStop(1, '#A9B8CA');
  ctx.fillStyle = ig; ctx.fill();
  // the water, whole (what is in front of him is laid over him again by sbWaterFront)
  sbWaterFill(t, 0);
}
function sbWaterFill(t, clipY) {
  ctx.save();
  ctx.beginPath(); ctx.ellipse(TB.cx, TB.waterY, TB.waterA, TB.waterB, 0, 0, 7);
  if (clipY) { ctx.clip(); ctx.beginPath(); ctx.rect(TB.cx - TB.waterA - 10, clipY, 2 * TB.waterA + 20, TB.waterB * 2 + 60); }
  const wg = ctx.createLinearGradient(0, TB.waterY - TB.waterB, 0, TB.waterY + TB.waterB);
  wg.addColorStop(0, '#7FD3F0'); wg.addColorStop(0.45, '#3FA9D8'); wg.addColorStop(1, '#2B86C0');
  ctx.fillStyle = wg; ctx.fill();
  ctx.restore();
  // glints and slow caustic bands on the surface (paint: no edge)
  ctx.save();
  ctx.beginPath(); ctx.ellipse(TB.cx, TB.waterY, TB.waterA - 6, TB.waterB - 4, 0, 0, 7); ctx.clip();
  if (clipY) { ctx.beginPath(); ctx.rect(0, clipY, W * 2, 900); ctx.clip(); }
  for (let i = 0; i < 9; i++) {
    const y = TB.waterY - TB.waterB + 30 + i * 38 + 6 * Math.sin(t * loopW(1.1) + i);
    ctx.beginPath();
    for (let x = TB.cx - TB.waterA; x <= TB.cx + TB.waterA; x += 24) ctx.lineTo(x, y + 7 * Math.sin(x * 0.02 + t * loopW(1.6) + i * 1.7));
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(220,248,255,0.22)'; ctx.stroke();
  }
  ctx.restore();
}
// the water in front of him: laid over his body below the waterline (a soft wavy edge round his chest), as an IMAGE: a fill
// inside a clip is left out of the shape map, and the light stage then drew his hidden body's rim and shadow through the
// water (round 0; sharks-older-than-trees found the same). A solid image is one flat thing that hides what is under it.
let SB_WCAN = null, SB_CAMNOW = null;
function sbWaterFront(t, o = {}) {
  const wl = o.wl || SB_WL, cam = SB_CAMNOW;
  if (!SB_WCAN) SB_WCAN = mkCanvas(W, H);
  const wc = SB_WCAN.getContext('2d');
  wc.setTransform(1, 0, 0, 1, 0, 0); wc.clearRect(0, 0, W, H);
  camTransform(wc, cam, 1);
  wc.save();
  wc.beginPath(); wc.ellipse(TB.cx, TB.waterY, TB.waterA, TB.waterB, 0, 0, 7); wc.clip();
  wc.beginPath();
  wc.moveTo(TB.cx - TB.waterA - 10, wl + 40);
  for (let x = TB.cx - TB.waterA; x <= TB.cx + TB.waterA; x += 12) {
    const d = (x - SBH.x) / 190, bow = Math.abs(d) < 1 ? -10 * (1 - d * d) : 0;
    wc.lineTo(x, wl + bow + 3 * Math.sin(x * 0.05 + t * loopW(3.0)));
  }
  wc.lineTo(TB.cx + TB.waterA + 10, TB.waterY + TB.waterB + 10); wc.lineTo(TB.cx - TB.waterA - 10, TB.waterY + TB.waterB + 10); wc.closePath();
  const wg = wc.createLinearGradient(0, TB.waterY - TB.waterB, 0, TB.waterY + TB.waterB);
  wg.addColorStop(0, '#7FD3F0'); wg.addColorStop(0.45, '#3FA9D8'); wg.addColorStop(1, '#2B86C0');
  wc.fillStyle = wg; wc.fill();
  // slow caustic bands on the surface
  wc.clip();
  for (let i = 0; i < 9; i++) {
    const y = TB.waterY - TB.waterB + 30 + i * 38 + 6 * Math.sin(t * loopW(1.1) + i);
    wc.beginPath();
    for (let x = TB.cx - TB.waterA; x <= TB.cx + TB.waterA; x += 24) wc.lineTo(x, y + 7 * Math.sin(x * 0.02 + t * loopW(1.6) + i * 1.7));
    wc.lineWidth = 3; wc.strokeStyle = 'rgba(220,248,255,0.22)'; wc.stroke();
  }
  wc.restore();
  // a bright ring of ripples round his chest
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.5 + i / 3) % 1;
    wc.beginPath(); wc.ellipse(SBH.x, wl + 4, 150 + ph * 200, 14 + ph * 26, 0, 0.05 * Math.PI, 0.95 * Math.PI);
    wc.lineWidth = 3; wc.strokeStyle = `rgba(230,250,255,${0.4 * (1 - ph)})`; wc.stroke();
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(SB_WCAN, 0, 0); ctx.restore();
}
// the near half of the rim and the outside of the tub: enamel, a gold band, claw feet; the faucet at the left end
function sbTubFront(t) {
  // the outside of the tub below the near rim
  ctx.beginPath();
  ctx.moveTo(TB.cx - TB.rimA, TB.rimY);
  ctx.ellipse(TB.cx, TB.rimY, TB.rimA, TB.rimB, 0, Math.PI, 0, true);
  ctx.bezierCurveTo(TB.cx + TB.rimA + 4, TB.rimY + 300, TB.cx + 420, TB.bottom, TB.cx + 250, TB.bottom);
  ctx.lineTo(TB.cx - 250, TB.bottom);
  ctx.bezierCurveTo(TB.cx - 420, TB.bottom, TB.cx - TB.rimA - 4, TB.rimY + 300, TB.cx - TB.rimA, TB.rimY);
  ctx.closePath();
  const g = ctx.createLinearGradient(TB.cx - TB.rimA, 0, TB.cx + TB.rimA, 0);
  g.addColorStop(0, '#F6F9FC'); g.addColorStop(0.3, '#FFFFFF'); g.addColorStop(0.75, '#DCE3EC'); g.addColorStop(1, '#9AA7B8');
  ctx.fillStyle = g; ctx.fill();
  // a gold band along the body
  ctx.save(); ctx.beginPath(); ctx.ellipse(TB.cx, TB.rimY + 74, TB.rimA - 6, TB.rimB + 6, 0, 0.04 * Math.PI, 0.96 * Math.PI);
  ctx.lineWidth = 9; ctx.strokeStyle = '#D9AE4E'; ctx.stroke(); ctx.restore();
  // the near rim: a rolled lip
  ctx.beginPath(); ctx.ellipse(TB.cx, TB.rimY, TB.rimA, TB.rimB, 0, 0, Math.PI);
  ctx.ellipse(TB.cx, TB.rimY + 4, TB.rimA - 30, TB.rimB - 24, 0, Math.PI, 0, true); ctx.closePath();
  const lg = ctx.createLinearGradient(0, TB.rimY + TB.rimB - 30, 0, TB.rimY + TB.rimB);
  lg.addColorStop(0, '#FFFFFF'); lg.addColorStop(1, '#D6DEE8');
  ctx.fillStyle = lg; ctx.fill();
  // claw feet
  for (const fx of [TB.cx - 290, TB.cx + 290]) {
    ctx.beginPath(); ctx.moveTo(fx - 54, TB.bottom - 40); ctx.quadraticCurveTo(fx - 78, TB.feet - 10, fx - 26, TB.feet);
    ctx.lineTo(fx + 26, TB.feet); ctx.quadraticCurveTo(fx + 78, TB.feet - 10, fx + 54, TB.bottom - 40); ctx.closePath();
    ctx.fillStyle = '#D9AE4E'; ctx.fill();
    for (const k of [-26, 0, 26]) circle(ctx, fx + k, TB.feet - 2, 14, '#B88A2E');
  }
  // the faucet on the far left of the rim
  const fx = TB.cx - TB.rimA + 70, fy = TB.rimY - 70;
  rrect(ctx, fx - 16, fy - 120, 32, 130, 14); ctx.fillStyle = '#E0B85A'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(fx, fy - 120); ctx.quadraticCurveTo(fx, fy - 186, fx + 76, fy - 176); ctx.lineTo(fx + 76, fy - 152);
  ctx.quadraticCurveTo(fx + 26, fy - 156, fx + 16, fy - 112); ctx.closePath(); ctx.fillStyle = '#F2CC70'; ctx.fill();
  rrect(ctx, fx + 66, fy - 180, 22, 34, 8); ctx.fillStyle = '#C99A3A'; ctx.fill();
}
// steam rising off the water, soap bubbles drifting away into space (iridescent rings)
function sbSteam(t, a = 1) {
  for (const p of SB_STEAM) {
    const k = ((t * p.sp + p.ph) % 1);
    const y = TB.waterY - 40 - k * 900, x = p.x + 60 * Math.sin(t * 0.5 + p.sw + k * 3);
    softDot(ctx, x, y, p.r * (0.6 + k), '#FFFFFF', 0.07 * a * Math.sin(Math.PI * k));
  }
}
function sbSoapBubbles(t, a = 1) {
  for (const p of SB_SOAP) {
    const k = ((t * p.sp + p.ph) % 1);
    const x = p.x + 70 * Math.sin(t * 0.4 + p.sw + k * 2), y = TB.waterY - 120 - k * 1300, r = p.r * (0.8 + 0.4 * k);
    const al = a * Math.sin(Math.PI * k);
    if (al < 0.05) continue;
    paint(() => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = 2.2; ctx.strokeStyle = `hsla(${(p.hue * 360 + k * 200) % 360},90%,80%,${0.75 * al})`; ctx.stroke();
      ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.28, Math.PI * 1.1, Math.PI * 1.6); ctx.lineWidth = 2.4; ctx.strokeStyle = `rgba(255,255,255,${0.9 * al})`; ctx.stroke();
    });
  }
}
// foam on the water (o.cut: skip what is behind his waterline)
function sbFoam(t, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  for (const f of SB_FOAM) {
    if (f.a > k) continue;
    if (o.avoid && Math.hypot((f.x - o.avoid[0]) / o.avoid[2], (f.y - o.avoid[1]) / (o.avoid[2] * 0.4)) < 1) continue;
    const bob = 2.5 * Math.sin(t * loopW(1.6) + f.ph), r = f.r * (1 + 0.04 * Math.sin(t * 2 + f.ph));
    const gg = ctx.createRadialGradient(f.x - r * 0.35, f.y + bob - r * 0.4, r * 0.1, f.x, f.y + bob, r);
    gg.addColorStop(0, '#FFFFFF'); gg.addColorStop(0.7, '#EAF4FF'); gg.addColorStop(1, '#C3D8EA');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(f.x, f.y + bob, r, 0, 7); ctx.fill();
  }
}
// ripples on the water round a point (front view), t0 = when it started
function sbRipples(x, y, w, t, t0, n = 3, a = 1) {
  const d = t - t0;
  if (d < 0 || d > 2.2) return;
  paint(() => {
    for (let i = 0; i < n; i++) {
      const k = d * 0.7 - i * 0.16;
      if (k <= 0 || k >= 1) continue;
      ctx.beginPath(); ctx.ellipse(x, y, w * (0.3 + 1.4 * k), w * (0.3 + 1.4 * k) * Math.sin(SB_EL), 0, 0, 7);
      ctx.lineWidth = 4 * (1 - k); ctx.strokeStyle = `rgba(235,252,255,${0.85 * a * (1 - k)})`; ctx.stroke();
    }
  });
}
// a splash: drops thrown up from (x, y) at t0 (world units), a crown, falling back
function sbSplash(x, y, t, t0, o = {}) {
  const d = t - t0;
  if (d < 0 || d > 1.1) return;
  const rng = mulberry32(o.seed || 7), n = o.n || 26, s = o.s || 1;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rng() - 0.5) * 2.2, v = (260 + rng() * 520) * s;
    const px = x + Math.cos(a) * v * d * 1.2, py = y + Math.sin(a) * v * d + 0.5 * 2200 * d * d;
    if (py > y + 30) continue;
    const r = (4 + rng() * 9) * s * (1 - 0.4 * d), al = clamp(1 - d / 1.05);
    paint(() => { circle(ctx, px, py, r, rgba('#E6F8FF', 0.95 * al)); circle(ctx, px - r * 0.3, py - r * 0.3, r * 0.35, rgba('#FFFFFF', al)); });
  }
  // the crown
  const ck = clamp(d / 0.35);
  if (ck < 1) paint(() => {
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, rx = (40 + 90 * E.outCubic(ck)) * s, ry = rx * Math.sin(SB_EL);
      const bx = x + Math.cos(a) * rx, by = y + Math.sin(a) * ry, h = 70 * s * Math.sin(Math.PI * ck) * (0.7 + 0.3 * Math.sin(i * 2.3));
      line(ctx, bx, by, bx + Math.cos(a) * 10, by - h, 9 * s * (1 - ck), rgba('#EAF9FF', 0.9 * (1 - ck)));
    }
  });
}
// bubbles rising in the front view (from under the surface: they pop at it)
function sbSurfacePops(x, y, t, t0, t1) {
  if (t < t0 || t > t1 + 0.4) return;
  for (let i = 0; i < 7; i++) {
    const f = t0 + (i / 7) * (t1 - t0), d = t - f;
    if (d < 0 || d > 0.35) continue;
    const bx = x + 70 * Math.sin(i * 2.7), by = y + 14 * Math.cos(i * 1.9), r = 7 + 9 * Math.sin(Math.PI * d / 0.35);
    paint(() => { ctx.beginPath(); ctx.arc(bx, by - 6 * d, r, Math.PI, 0); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(240,252,255,0.9)'; ctx.stroke(); });
  }
}

// ---------------------------------------------------------------- the rubber duck (finger-wrinkles' duck, with a side-eye)
// look: -1 at the camera ... +1 toward Saturn (its right); squeak 0..1 puffs it; flip faces the other way
function sbDuck(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y + (o.bobY || 0)); ctx.rotate((o.rot || 0) + 0.05 * Math.sin(t * loopW(2.2))); ctx.scale(s * (o.flip ? -1 : 1) * (1 + 0.08 * (o.squeak || 0)), s * (1 - 0.06 * (o.squeak || 0)));
  actor(() => {
    ellipse(ctx, 0, -10, 70, 44, '#FFD23F');
    ellipse(ctx, 18, -2, 46, 26, '#F5B82E');
    circle(ctx, -40, -62, 38, '#FFD23F');
    ctx.beginPath(); ctx.moveTo(-74, -58); ctx.quadraticCurveTo(-104, -54, -100, -44); ctx.quadraticCurveTo(-86, -40, -70, -46); ctx.closePath();
    ctx.fillStyle = '#FF8A1F'; ctx.fill();
  });
  paint(() => {
    const lk = o.look || 0;
    ellipse(ctx, -46, -70, 10, 11 * (o.lid ? 0.55 : 1), '#FFFFFF');
    circle(ctx, -46 - 4 * lk, -69 + (o.lid ? 2 : 0), 6, '#1A1300'); circle(ctx, -48 - 4 * lk, -72, 2.2, '#FFFFFF');
    if (o.lid) line(ctx, -57, -76, -35, -74, 4, '#E8A92A');
    ellipse(ctx, -20, -86, 16, 8, 'rgba(255,255,255,0.55)', -0.4);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- Saturn floating, front view
// (x, wy): where the rings sit on the water; R = the globe's radius (world units); o: {face, look, blink, bob, rot, wobble,
// glass (0..1: the scan wipe progress), noGlobe, ringA, sink (0..1: under the water), sx, sy}
function sbSatFloat(x, wy, R, t, o = {}) {
  const el = SB_EL, bob = o.bob === undefined ? 3.5 * Math.sin(t * loopW(2.2)) : o.bob, rot = o.rot === undefined ? 0.035 * Math.sin(t * loopW(1.7) + 0.6) : o.rot;
  const ry = wy + bob, gy = ry + 0.255 * R * Math.cos(el) + (o.sink || 0) * R * 2.4, sx = o.sx || 1, sy = o.sy || 1;
  const ringA = o.ringA === undefined ? 1 : o.ringA;
  ctx.save(); ctx.translate(x, ry); ctx.rotate(rot); ctx.translate(-x, -ry);
  if (ringA > 0.01) sbRingsDraw(x, ry, R, 'back', { a: ringA });
  if (!o.noGlobe) {
    sbGlobeDraw(x, gy, R, { sx, sy });
    if (o.glass > 0) sbSatGlass(x, gy, R, t, o.glass, o);
    if (o.face) sbSatFace(x, gy - R * 0.06, R, o.face, { look: o.look, blink: o.blink });
    // the water over the part that is under: the globe below the waterline's front arc, tinted and lit like the water
    const wa = 0.967 * R * sx, wb = 0.967 * R * Math.sin(el);
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, gy, R * sx * 1.01, R * 0.93 * sy * 1.01, 0, 0, 7); ctx.clip();
    ctx.beginPath(); ctx.moveTo(x - wa - 4, ry); ctx.ellipse(x, ry, wa + 4, wb, 0, Math.PI, 0, true); ctx.lineTo(x + R * 2, ry + R * 3); ctx.lineTo(x - R * 2, ry + R * 3); ctx.closePath();
    const wg = ctx.createLinearGradient(0, ry, 0, gy + R);
    wg.addColorStop(0, 'rgba(110,205,240,0.80)'); wg.addColorStop(1, 'rgba(40,140,200,0.94)');
    ctx.fillStyle = wg; ctx.fill();
    ctx.restore();
    // the meniscus: a bright line where the water meets the globe
    paint(() => { ctx.beginPath(); ctx.ellipse(x, ry, wa, wb, 0, 0.02 * Math.PI, 0.98 * Math.PI); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(235,252,255,0.85)'; ctx.stroke(); });
  }
  if (ringA > 0.01) sbRingsDraw(x, ry, R, 'front', { a: ringA });
  ctx.restore();
  return { gy, ry, top: gy - R * 0.92 };
}
// the see-through globe: mist bands, bubbles, a tiny core (k = 0..1 the wipe from the top down)
function sbSatGlass(x, gy, R, t, k, o = {}) {
  ctx.save();
  ctx.beginPath(); ctx.ellipse(x, gy, R, R * 0.93, 0, 0, 7); ctx.clip();
  ctx.beginPath(); ctx.rect(x - R - 4, gy - R - 4, 2 * R + 8, (2 * R + 8) * clamp(k)); ctx.clip();
  const g = ctx.createRadialGradient(x - R * 0.3, gy - R * 0.35, R * 0.1, x, gy, R);
  g.addColorStop(0, '#A8885C'); g.addColorStop(0.6, '#6A5236'); g.addColorStop(1, '#2E2218');
  ctx.fillStyle = g; ctx.fillRect(x - R, gy - R, 2 * R, 2 * R);
  // swirling bands of gas
  for (let i = 0; i < 7; i++) {
    const yy = gy - R * 0.8 + i * R * 0.27;
    ctx.beginPath();
    for (let xx = -R; xx <= R; xx += R / 12) ctx.lineTo(x + xx, yy + R * 0.05 * Math.sin(xx / R * 5 + t * 3 + i));
    ctx.lineWidth = R * 0.09; ctx.strokeStyle = `rgba(250,228,175,${0.3 + 0.12 * (i % 2)})`; ctx.stroke();
  }
  // fizz: bubbles rising inside it
  for (let i = 0; i < 40; i++) {
    const ph = (hash(i * 3.1) + t * (0.35 + 0.3 * hash(i * 7.7))) % 1;
    const bx = x + (hash(i * 1.7) - 0.5) * 1.7 * R, by = gy + R * 0.9 - ph * 1.8 * R, br = R * (0.025 + 0.03 * hash(i * 5.3));
    ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.lineWidth = Math.max(1.6, R * 0.012); ctx.strokeStyle = 'rgba(255,246,220,0.9)'; ctx.stroke();
  }
  // the core: small and dense, at the very middle
  const cr = R * 0.2;
  const cg = ctx.createRadialGradient(x - cr * 0.3, gy - cr * 0.3, cr * 0.1, x, gy, cr);
  cg.addColorStop(0, '#B08560'); cg.addColorStop(1, '#5A3A26');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(x, gy, cr, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x, gy, cr * 1.25, 0, 7); ctx.lineWidth = R * 0.02; ctx.strokeStyle = 'rgba(255,200,140,0.6)'; ctx.stroke();
  ctx.restore();
  // the scan line
  if (k > 0 && k < 1) {
    const sy = gy - R + 2 * R * k;
    paint(() => line(ctx, x - R * 1.05, sy, x + R * 1.05, sy, 4, 'rgba(160,240,255,0.95)'));
    softDot(gctx, x, sy, R * 0.6, '#7FE9FF', 0.4);
  }
}

// ---------------------------------------------------------------- the hero in the tub
const SB_POSE = { hipY: -34, lean: 0, armL: { a: 0.6, b: -0.2 }, armR: { a: 0.6, b: -0.2 }, legL: { a: 2.25, b: -1.95 }, legR: { a: 2.25, b: -1.95 }, hand: 'open', feetFront: 1 };
// arm targets (rig-local: feet origin, up = -y; shoulders at (±74, -182)): elbow e, wrist w
const SBA = {
  restL: { e: [-118, -120], w: [-150, -40] }, restR: { e: [118, -120], w: [150, -40] },        // on the rim, under the water
  holdL: { e: [-30, -110], w: [58, -150] }, holdR: { e: [160, -116], w: [168, -150] },           // Saturn held up in front of his chest
  dropL: { e: [-20, -118], w: [52, -170] }, dropR: { e: [168, -126], w: [176, -170] },           // hands spread open as it falls
  peekL: { e: [-110, -120], w: [-120, -60] }, peekR: { e: [130, -110], w: [150, -60] },          // hands on the rim, leaning in
  cheerL: { e: [-160, -250], w: [-150, -340] }, cheerR: { e: [166, -250], w: [150, -340] },     // both arms up
  scaleL: { e: [-176, -150], w: [-250, -176] }, scaleR: { e: [176, -150], w: [250, -176] },     // arms out: a human balance
  scoopR: { e: [176, -120], w: [236, -130] },                                                      // a cup into Saturn's top
  knockR: { e: [150, -120], w: [210, -136] }, knockInR: { e: [168, -118], w: [240, -122] },
  brushR: { e: [150, -250], w: [120, -360] },                                                      // the scrub brush, up beside his head
  shrugL: { e: [-150, -150], w: [-196, -210] }, shrugR: { e: [150, -150], w: [196, -210] },
};
const SBF = {
  mischief: { eyeOpen: 0.95, pupil: 1, lookX: 0.15, lookY: 0, browY: 0.6, browTilt: -0.5, mouth: 'grin', mouthOpen: 0.45, blink: 0, cross: 0 },
  drop: { eyeOpen: 1.2, pupil: 0.85, lookX: 0.6, lookY: 0.9, browY: 1.0, browTilt: 0.3, mouth: 'o', mouthOpen: 0.4, blink: 0, cross: 0 },
  peek: { eyeOpen: 1.15, pupil: 0.9, lookX: 0.55, lookY: 1, browY: 1.1, browTilt: 0.8, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  delight: { eyeOpen: 1.3, pupil: 0.75, lookX: 0.5, lookY: 0.6, browY: 1.5, browTilt: 0.2, mouth: 'grin', mouthOpen: 1, blink: 0, cross: 0 },
  proud: { eyeOpen: 1, pupil: 1, lookX: 0.1, lookY: 0, browY: 0.8, browTilt: -0.3, mouth: 'grin', mouthOpen: 0.7, blink: 0, cross: 0 },
  wow: { eyeOpen: 1.3, pupil: 0.7, lookX: 0.6, lookY: 0.2, browY: 1.4, browTilt: 0.3, mouth: 'o', mouthOpen: 0.7, blink: 0, cross: 0 },
  study: { eyeOpen: 1.05, pupil: 1, lookX: 0.7, lookY: 0.5, browY: 0.6, browTilt: 0.6, mouth: 'flat', mouthOpen: 0.2, blink: 0, cross: 0 },
  deadpan: { eyeOpen: 0.82, pupil: 1, lookX: 0, lookY: 0, browY: -0.1, browTilt: 0, mouth: 'flat', mouthOpen: 0, blink: 0.38, cross: 0 },
  down: { eyeOpen: 0.95, pupil: 1, lookX: 0.35, lookY: 1, browY: 0.4, browTilt: 0.5, mouth: 'flat', mouthOpen: 0.1, blink: 0.2, cross: 0 },
  shock: { eyeOpen: 1.4, pupil: 0.55, lookX: 0.4, lookY: 0.4, browY: 1.5, browTilt: 0.4, mouth: 'o', mouthOpen: 0.9, blink: 0, cross: 0 },
};
// the rig and where its joints are (no drawing)
function sbHeroRig(A) {
  let pose = { ...SB_POSE };
  pose.hipY += A.hipDY || 0; pose.lean = A.lean || 0;
  const aL = A.armL || SBA.restL, aR = A.armR || SBA.restR;
  pose = armAt(pose, 'L', aL.e, aL.w); pose = armAt(pose, 'R', aR.e, aR.w);
  pose.handL = A.handL || 'open'; pose.handR = A.handR || 'open';
  return pose;
}
const sbW = (st, p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
// A: {armL, armR, face, headDX, headDY, headRot, hipDY, lean, handL, handR, held: fn(lc, r, st) drawn in his layer over
//     the body (and the hands drawn again over it), heldUnder: fn drawn before the hands are drawn again}
function sbHero(cam, t, A) {
  const pose = sbHeroRig(A);
  const st = { x: SBH.x, y: SBH.y, s: SBH.s, pose, face: A.face || SBF.mischief, noLegs: true, seed: 3,
    headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, frizz: A.frizz || 0 };
  const r = charLayer(cam, st, t, {
    pal: SBPAL,
    post: (lc, rr, s2) => {
      if (A.held) {
        lc.save(); lc.setTransform(1, 0, 0, 1, 0, 0); camTransform(lc, cam, 1);
        A.held(lc, rr, s2);
        lc.restore();
        // the hands again, over what they hold
        lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
        for (const [s, k] of [[-1, 'L'], [1, 'R']]) if ((A.overHands || 'LR').includes(k)) drawHand(lc, rr['wr' + k], rr['armDir' + k], pose['hand' + k] || 'open', SBPAL, s, t);
        lc.restore();
      }
    },
  });
  return { st, r, wr: (k) => sbW(st, r['wr' + k]), head: sbW(st, r.head) };
}
// a measuring cup in the world: (x, y) = the bottom middle; fill: 'saturn' | 'water' | null; tilt (rad); s = size
function sbCup(c, x, y, s, fill, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s, s);
  // the handle
  c.beginPath(); c.moveTo(34, -58); c.quadraticCurveTo(66, -52, 62, -24); c.quadraticCurveTo(58, -6, 34, -10);
  c.lineWidth = 10; c.strokeStyle = '#C8D2DE'; c.lineCap = 'round'; c.stroke();
  // the contents (behind the glass front)
  if (fill === 'water') {
    c.beginPath(); c.moveTo(-36, -50); c.lineTo(36, -50); c.lineTo(32, -2); c.quadraticCurveTo(0, 6, -32, -2); c.closePath();
    const g = c.createLinearGradient(0, -50, 0, 0); g.addColorStop(0, '#8FDDF6'); g.addColorStop(1, '#2F98CC');
    c.fillStyle = g; c.fill();
    ellipse(c, 0, -50, 36, 8, '#BDEBFA');
  } else if (fill === 'saturn') {
    // a heaped swirl of butterscotch cloud, banded like the planet
    const cols = ['#EEDDAE', '#D9BD84', '#E6D2A0', '#C9A66C', '#E2CC97'];
    c.beginPath(); c.moveTo(-36, -46); c.lineTo(36, -46); c.lineTo(32, -2); c.quadraticCurveTo(0, 6, -32, -2); c.closePath();
    c.fillStyle = '#E2CC97'; c.fill();
    for (let i = 0; i < 5; i++) {
      const r = 38 - i * 7, yy = -50 - i * 12;
      c.beginPath(); c.ellipse(i % 2 ? 3 : -3, yy, r, 12, 0, 0, 7); c.fillStyle = cols[i]; c.fill();
    }
    circle(c, 2, -112, 9, '#EEDDAE');
  }
  // the glass
  c.beginPath(); c.moveTo(-40, -64); c.lineTo(40, -64); c.lineTo(35, -2); c.quadraticCurveTo(0, 8, -35, -2); c.closePath();
  c.fillStyle = 'rgba(220,240,255,0.18)'; c.fill();
  c.lineWidth = 4; c.strokeStyle = 'rgba(235,248,255,0.9)'; c.stroke();
  paint(() => { for (let i = 1; i <= 3; i++) line(c, -30, -64 + i * 14, -18, -64 + i * 14, 2.5, 'rgba(255,255,255,0.75)'); });
  c.restore();
}
// a scrub brush (wood back, blue bristles) at (x, y), angle a
function sbBrush(c, x, y, s, a) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  rrect(c, -58, -20, 116, 34, 16); c.fillStyle = '#C98B4E'; c.fill();
  rrect(c, -50, -16, 100, 10, 5); c.fillStyle = 'rgba(255,230,190,0.5)'; c.fill();
  for (let i = -4; i <= 4; i++) { c.fillStyle = '#4FA3E0'; c.fillRect(i * 11 - 4, 12, 8, 20); }
  c.restore();
}

// ---------------------------------------------------------------- the whole front scene
// o: {sat: {x, wy, R, ...sbSatFloat opts} | null, duck: {x, y, look, squeak, lid, s} | null, foamK, steam, front, under(fn), over(fn)}
function sbBathDraw(cam, t, A, o = {}) {
  SB_CAMNOW = cam;
  sbSpaceBg(cam, t, o.bg || {});
  applyCam(cam);
  sbSteam(t, o.steam === undefined ? 1 : o.steam);
  sbTubBack(t);
  if (o.behind) { applyCam(cam); o.behind(); }
  const H2 = sbHero(cam, t, A);
  applyCam(cam);
  sbWaterFront(t, {});
  if (o.ripplesAt) for (const R2 of o.ripplesAt) sbRipples(R2[0], R2[1], R2[2], t, R2[3], 3, R2[4] || 1);
  sbFoam(t, { k: o.foamK === undefined ? 1 : o.foamK, avoid: o.sat ? [o.sat.x, o.sat.wy, o.sat.R * 2.5] : null });
  if (o.under) { applyCam(cam); o.under(H2); }
  if (o.duck) sbDuck(o.duck.x, o.duck.y, o.duck.s || 0.62, t, o.duck);
  let S = null;
  if (o.sat) S = sbSatFloat(o.sat.x, o.sat.wy, o.sat.R, t, o.sat);
  applyCam(cam);
  if (o.front !== false) sbTubFront(t);
  applyCam(cam);
  if (o.over) o.over(H2, S);
  applyCam(cam);
  sbSoapBubbles(t, o.soap === undefined ? 1 : o.soap);
  return { H: H2, S };
}

// ---------------------------------------------------------------- the split-level set: the tub cut open at the waterline
// World units of its own: the waterline at TK.wl, the floor at TK.floor; space above the far rim TK.rim.
const TK = { wl: 820, floor: 1560, rim: 600, x0: -260, x1: 1340 };
function sbTankBack(cam, t, o = {}) {
  sbSpaceBg(cam, t, { sunAt: [120, 300], sunR: 30 });
  applyCam(cam);
  // the far wall of the tub's inside: enamel from the rim down to the floor, a rolled lip on top
  const g = ctx.createLinearGradient(0, TK.rim, 0, TK.floor);
  g.addColorStop(0, '#F2F5FA'); g.addColorStop(0.25, '#DCE4EE'); g.addColorStop(1, '#B9C6D6');
  ctx.fillStyle = g; ctx.fillRect(TK.x0, TK.rim, TK.x1 - TK.x0, TK.floor - TK.rim + 10);
  rrect(ctx, TK.x0 - 20, TK.rim - 34, TK.x1 - TK.x0 + 40, 46, 23);
  const lg = ctx.createLinearGradient(0, TK.rim - 34, 0, TK.rim + 12); lg.addColorStop(0, '#FFFFFF'); lg.addColorStop(1, '#C7D1DD');
  ctx.fillStyle = lg; ctx.fill();
  // the floor, seen almost edge on, curving up into the wall
  ctx.beginPath(); ctx.moveTo(TK.x0, TK.floor - 40); ctx.quadraticCurveTo(540, TK.floor + 30, TK.x1, TK.floor - 40); ctx.lineTo(TK.x1, TK.floor + 60); ctx.lineTo(TK.x0, TK.floor + 60); ctx.closePath();
  ctx.fillStyle = '#C3CFDD'; ctx.fill();
}
// the water over everything under it: a tint, light shafts and caustics; then the surface
function sbTankWater(cam, t, o = {}) {
  applyCam(cam);
  const x0 = TK.x0, w = TK.x1 - TK.x0;
  ctx.save();
  const g = ctx.createLinearGradient(0, TK.wl, 0, TK.floor + 60);
  g.addColorStop(0, 'rgba(90,200,236,0.42)'); g.addColorStop(0.5, 'rgba(36,140,200,0.55)'); g.addColorStop(1, 'rgba(14,70,130,0.7)');
  ctx.fillStyle = g; ctx.fillRect(x0, TK.wl, w, TK.floor + 60 - TK.wl);
  ctx.restore();
  // light shafts from the surface (glow layer, soft)
  gctx.save();
  for (let i = 0; i < 5; i++) {
    const sx = 80 + i * 230 + 30 * Math.sin(t * loopW(0.5) + i), wd = 60 + 30 * Math.sin(i * 2.1);
    const gg = gctx.createLinearGradient(0, TK.wl, 0, TK.floor);
    gg.addColorStop(0, 'rgba(190,240,255,0.07)'); gg.addColorStop(1, 'rgba(190,240,255,0)');
    gctx.fillStyle = gg; gctx.beginPath(); gctx.moveTo(sx, TK.wl); gctx.lineTo(sx + wd, TK.wl); gctx.lineTo(sx + wd + 160, TK.floor); gctx.lineTo(sx + 110, TK.floor); gctx.closePath(); gctx.fill();
  }
  gctx.restore();
  // caustics: a net of bright wavy lines on the floor and the wall
  paint(() => {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, TK.wl + 10, w, TK.floor + 50 - TK.wl); ctx.clip();
    for (let j = 0; j < 9; j++) {
      const yy = TK.wl + 80 + j * 82;
      ctx.beginPath();
      for (let x = x0; x <= TK.x1; x += 18) ctx.lineTo(x, yy + 14 * Math.sin(x * 0.018 + t * loopW(1.3) + j * 1.3) + 8 * Math.sin(x * 0.041 - t * loopW(2.1)));
      ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(210,250,255,${0.10 + 0.05 * (j % 2)})`; ctx.stroke();
    }
    ctx.restore();
  });
  // the surface: a silver line (its underside) with a bright lip, gently waving
  const wave = (x) => TK.wl + 4 * Math.sin(x * 0.02 + t * loopW(2.4)) + (o.waveAt ? o.waveAt(x) : 0);
  ctx.beginPath(); ctx.moveTo(x0, wave(x0));
  for (let x = x0; x <= TK.x1; x += 10) ctx.lineTo(x, wave(x));
  ctx.lineTo(TK.x1, TK.wl + 18); ctx.lineTo(x0, TK.wl + 18); ctx.closePath();
  ctx.fillStyle = 'rgba(200,240,255,0.55)'; ctx.fill();
  paint(() => { ctx.beginPath(); for (let x = x0; x <= TK.x1; x += 10) ctx.lineTo(x, wave(x) - 1); ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(245,253,255,0.95)'; ctx.stroke(); });
  return wave;
}
// the near wall, cut: a thick enamel band along the bottom with a hatched cut face, claw feet below
function sbTankCut(cam, t) {
  applyCam(cam);
  ctx.beginPath(); ctx.moveTo(TK.x0, TK.floor + 20); ctx.quadraticCurveTo(540, TK.floor + 90, TK.x1, TK.floor + 20); ctx.lineTo(TK.x1, TK.floor + 130); ctx.quadraticCurveTo(540, TK.floor + 200, TK.x0, TK.floor + 130); ctx.closePath();
  ctx.fillStyle = '#F4F7FB'; ctx.fill();
  paint(() => {
    ctx.save(); ctx.clip();
    for (let x = TK.x0; x < TK.x1; x += 26) line(ctx, x, TK.floor + 210, x + 90, TK.floor + 10, 3, 'rgba(150,165,185,0.45)');
    ctx.restore();
  });
  for (const fx of [140, 940]) {
    ctx.beginPath(); ctx.moveTo(fx - 50, TK.floor + 150); ctx.quadraticCurveTo(fx - 72, TK.floor + 230, fx - 24, TK.floor + 240);
    ctx.lineTo(fx + 24, TK.floor + 240); ctx.quadraticCurveTo(fx + 72, TK.floor + 230, fx + 50, TK.floor + 150); ctx.closePath(); ctx.fillStyle = '#D9AE4E'; ctx.fill();
  }
}
// bubbles rising under water from (x, y) since t0 (side view)
function sbBubbles(x, y, t, t0, o = {}) {
  const d = t - t0, n = o.n || 10, top = o.top === undefined ? TK.wl : o.top;
  if (d < 0 || d > (o.life || 2.4)) return;
  paint(() => {
    for (let i = 0; i < n; i++) {
      const st0 = i * 0.06, dd = d - st0;
      if (dd < 0) continue;
      const by = y - dd * (260 + 160 * hash(i * 4.1 + (o.seed || 0))) , bx = x + (hash(i * 2.3 + (o.seed || 0)) - 0.5) * (o.spread || 60) + 10 * Math.sin(dd * 9 + i);
      if (by < top + 4) continue;
      const r = (5 + 9 * hash(i * 7.7 + (o.seed || 0))) * (o.s || 1);
      ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(235,252,255,0.85)'; ctx.stroke();
      circle(ctx, bx - r * 0.35, by - r * 0.35, r * 0.28, 'rgba(255,255,255,0.9)');
    }
  });
}
