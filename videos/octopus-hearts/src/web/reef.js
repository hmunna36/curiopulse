// Octopus Short: the reef. A sunny tropical reef about four metres down, built in depth: the water column (bright under
// the surface, deep blue below) with light shafts that sway, a far reef wall in haze, a mid reef of coral heads, sea fans
// and a passing school of fish, the sand with caustics crawling over it, marine snow and bubbles, kelp in the foreground.
// The set: the octopus's rock (encrusted, an anemone, a starfish), and a treadmill grown over with barnacles and weed.
// World units = screen pixels at zoom 1. Sand at y ~ 1395. Ambient motion runs on loopW clocks so the loop holds.
'use strict';

const RF = { ok: false };
const RF_SAND_Y = 1395;
const RF_ROCK = { x: 650, top: 1046 };

function initReef() {
  const rng = mulberry32(4242);
  RF.wDrift = loopW(0.35); RF.wSway = loopW(0.9); RF.wFish = loopW(0.05); RF.wSnow = loopW(0.02);
  // ---- the far reef wall: hazy silhouettes, painted once (2600 x 900, drawn at parallax 0.25)
  RF.far = mkCanvas(2600, 900);
  { const c = RF.far.getContext('2d');
    for (let layer = 0; layer < 3; layer++) {
      const col = ['#2C7FA6', '#23709A', '#1A5F88'][layer], base = 900, top = 360 + layer * 120;
      c.beginPath(); c.moveTo(0, base);
      for (let x = 0; x <= 2600; x += 26) {
        const h = top + 90 * Math.sin(x * 0.004 + layer * 2) + 60 * Math.sin(x * 0.013 + layer) + 40 * (rng() - 0.5);
        c.lineTo(x, h);
      }
      c.lineTo(2600, base); c.closePath(); c.fillStyle = col; c.fill();
      // coral heads poking up from each layer
      for (let i = 0; i < 26; i++) {
        const x = rng() * 2600, y = top + 60 + rng() * 80, r = 30 + rng() * 70;
        c.beginPath(); c.ellipse(x, y, r * 1.2, r * 0.8, 0, Math.PI, 0); c.fillStyle = col; c.fill();
        if (layer > 0 && rng() < 0.5) {   // a branching coral silhouette
          c.strokeStyle = col; c.lineCap = 'round';
          const br = (x0, y0, a, L, w, d) => { if (d > 4 || L < 8) return; const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
            c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
            br(x1, y1, a - 0.45 - rng() * 0.2, L * 0.72, w * 0.72, d + 1); br(x1, y1, a + 0.45 + rng() * 0.2, L * 0.72, w * 0.72, d + 1); };
          br(x, y, 0, 40 + rng() * 40, 12, 0);
        }
      }
    }
    const fog = c.createLinearGradient(0, 300, 0, 900); fog.addColorStop(0, 'rgba(46,150,190,0.55)'); fog.addColorStop(1, 'rgba(20,90,140,0.15)');
    c.fillStyle = fog; c.fillRect(0, 0, 2600, 900);
  }
  // ---- the mid reef: coral heads, sea fans, tube sponges with real colour (2400 x 760, parallax 0.55)
  RF.mid = mkCanvas(2400, 760);
  { const c = RF.mid.getContext('2d'), haze = (h, k) => mixH(h, '#2A86AE', k);
    const ground = () => { c.beginPath(); c.moveTo(0, 760); for (let x = 0; x <= 2400; x += 30) c.lineTo(x, 520 + 50 * Math.sin(x * 0.006) + 30 * Math.sin(x * 0.021)); c.lineTo(2400, 760); c.closePath(); c.fillStyle = haze('#5D7F86', 0.45); c.fill(); };
    ground();
    const things = [];
    for (let i = 0; i < 34; i++) things.push({ x: 40 + rng() * 2320, kind: Math.floor(rng() * 5), s: 0.6 + rng() * 0.7, seed: rng() * 1000 });
    things.sort((a, b) => a.s - b.s);
    for (const o of things) {
      const y = 560 + 50 * Math.sin(o.x * 0.006) + 30 * Math.sin(o.x * 0.021), k = 0.55 - 0.25 * (o.s - 0.6);
      const r2 = mulberry32(Math.floor(o.seed));
      if (o.kind === 0) {   // brain coral dome with grooves
        const R = 70 * o.s; c.beginPath(); c.ellipse(o.x, y, R * 1.25, R, 0, Math.PI, 0); c.fillStyle = haze('#C9A15A', k); c.fill();
        c.strokeStyle = haze('#9C7536', k); c.lineWidth = 4 * o.s;
        for (let j = 1; j < 5; j++) { c.beginPath(); c.ellipse(o.x, y, R * 1.25 * j / 5, R * j / 5, 0, Math.PI + 0.2, -0.2); c.stroke(); }
      } else if (o.kind === 1) {   // a sea fan
        const col = haze(['#C2416B', '#8E4FC0', '#E0703A'][Math.floor(r2() * 3)], k); c.strokeStyle = col; c.lineCap = 'round';
        const fan = (x0, y0, a, L, w, d) => { if (d > 6) return; const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
          c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + 8 * (r2() - 0.5), (y0 + y1) / 2, x1, y1); c.stroke();
          fan(x1, y1, a - 0.32, L * 0.78, w * 0.7, d + 1); fan(x1, y1, a + 0.32, L * 0.78, w * 0.7, d + 1); };
        fan(o.x, y, (r2() - 0.5) * 0.3, 70 * o.s, 9 * o.s, 0);
      } else if (o.kind === 2) {   // tube sponges
        for (let j = 0; j < 4; j++) { const h = (70 + 90 * r2()) * o.s, x = o.x + (j - 1.5) * 24 * o.s, w = 20 * o.s;
          c.fillStyle = haze(['#E07B3C', '#D9B33A', '#B24AA8'][Math.floor(o.seed) % 3], k); rrect(c, x - w / 2, y - h, w, h + 10, w / 2); c.fill();
          c.fillStyle = haze('#5A2A1E', k + 0.1); c.beginPath(); c.ellipse(x, y - h + 6, w * 0.32, 5 * o.s, 0, 0, 7); c.fill(); }
      } else if (o.kind === 3) {   // table coral
        c.fillStyle = haze('#7FB39A', k); c.beginPath(); c.ellipse(o.x, y - 70 * o.s, 110 * o.s, 22 * o.s, 0, 0, 7); c.fill();
        c.fillRect(o.x - 10 * o.s, y - 70 * o.s, 20 * o.s, 70 * o.s);
      } else {   // staghorn
        c.strokeStyle = haze('#D7C08A', k); c.lineCap = 'round';
        const br = (x0, y0, a, L, w, d) => { if (d > 3) return; const x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
          c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
          br(x1, y1, a - 0.5, L * 0.75, w * 0.8, d + 1); br(x1, y1, a + 0.4, L * 0.8, w * 0.8, d + 1); };
        br(o.x, y, -0.2, 60 * o.s, 14 * o.s, 0); br(o.x + 20, y, 0.3, 50 * o.s, 12 * o.s, 0);
      }
    }
    const fog = c.createLinearGradient(0, 0, 0, 760); fog.addColorStop(0, 'rgba(40,140,185,0.0)'); fog.addColorStop(1, 'rgba(30,110,150,0.25)');
    c.fillStyle = fog; c.fillRect(0, 0, 2400, 760);
  }
  // ---- caustics: a seamless tile of bright cell edges (Worley F2 - F1), two copies drift past each other on the sand
  RF.caus = mkCanvas(256, 256);
  { const c = RF.caus.getContext('2d'), N = 22, P = [];
    for (let i = 0; i < N; i++) P.push([rng() * 256, rng() * 256]);
    const img = c.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      let f1 = 1e9, f2 = 1e9;
      for (const [px, py] of P) for (let oy = -256; oy <= 256; oy += 256) for (let ox = -256; ox <= 256; ox += 256) {
        const d = Math.hypot(x - px - ox, y - py - oy); if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
      }
      const e = Math.max(0, 1 - (f2 - f1) / 5.5), v = Math.pow(e, 1.8), j = (y * 256 + x) * 4;
      img.data[j] = 225; img.data[j + 1] = 255; img.data[j + 2] = 240; img.data[j + 3] = Math.round(255 * v);
    }
    c.putImageData(img, 0, 0);
  }
  // ---- kelp and seagrass blades (foreground and beside the rock), fish school, snow, bubble columns
  RF.kelp = [...Array(9)].map((_, i) => ({ x: [-40, 60, 150, 980, 1060, 1120, -90, 1180, 20][i], h: 520 + rng() * 520, w: 34 + rng() * 26, ph: rng() * 6, p: 1.25 + 0.15 * rng() }));
  RF.grass = [...Array(26)].map(() => ({ x: 380 + rng() * 820, h: 50 + rng() * 90, ph: rng() * 6, w: 7 + rng() * 6 }));
  RF.fish = [...Array(15)].map((_, i) => ({ dx: (i % 5) * 46 + rng() * 26, dy: Math.floor(i / 5) * 30 + rng() * 18, ph: rng() * 6 }));
  RF.snow = [...Array(90)].map(() => ({ x: rng(), y: rng(), z: 0.25 + rng() * 0.9, ph: rng() * 6 }));
  RF.ok = true;
}

// draw an image layer at parallax p (0 = glued to the screen, 1 = the world) about the screen centre
function rfPara(c, cam, p, scale = 1) {
  const z = 1 + (cam.zoom - 1) * p;
  c.setTransform(scale, 0, 0, scale, 0, 0);
  c.translate(W / 2 + (cam.sx || 0) * p, H / 2 + (cam.sy || 0) * p); c.scale(z, z);
  c.translate(-(cam.x * p + 540 * (1 - p)), -(cam.y * p + 960 * (1 - p)));
}

// the water, far and mid reef, light shafts, fish, snow (everything behind the sand). o: {dim, murk}
function reefBack(cam, t, o = {}) {
  if (!RF.ok) initReef();
  const c = ctx;
  screenSpace();
  // the water column, by the camera's height (deeper = darker)
  const yTop = (cam.y - 960 / cam.zoom) * 0.35, g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mixH('#5FD3E6', '#2BA6C9', clamp(yTop / 500))); g.addColorStop(0.35, '#1E8DBB'); g.addColorStop(0.75, '#0F5E92'); g.addColorStop(1, '#0A3E6C');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // the surface far above: a bright rippling ceiling at the very top (only when the camera looks up there)
  rfPara(c, cam, 0.15);
  const sy = 120;
  c.fillStyle = 'rgba(190,250,255,0.35)';
  for (let i = 0; i < 9; i++) { const x = -300 + i * 220 + 40 * Math.sin(t * RF.wSway + i); c.beginPath(); c.ellipse(x, sy + 30 * Math.sin(i * 1.7), 150, 22, 0, 0, 7); c.fill(); }
  // light shafts from the surface (additive), swaying
  rfPara(c, cam, 0.3);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const x0 = -120 + i * 210 + 50 * Math.sin(t * RF.wSway * 0.5 + i * 2.1), wv = 40 + 34 * Math.sin(i * 1.7) ** 2, a = 0.07 + 0.035 * Math.sin(t * RF.wSway + i * 3);
    const sg = c.createLinearGradient(0, 0, 0, 1700); sg.addColorStop(0, `rgba(210,255,250,${a})`); sg.addColorStop(1, 'rgba(210,255,250,0)');
    c.fillStyle = sg; c.beginPath(); c.moveTo(x0 - wv, -100); c.lineTo(x0 + wv, -100); c.lineTo(x0 + wv * 2.6 + 180, 1700); c.lineTo(x0 - wv * 2.6 + 180, 1700); c.closePath(); c.fill();
  }
  c.restore();
  // far reef wall and mid reef
  rfPara(c, cam, 0.25); c.drawImage(RF.far, -760, 620);
  rfPara(c, cam, 0.42);
  // the school of fish, crossing slowly between far and mid
  const fx = -400 + ((t * RF.wFish / (Math.PI * 2)) * 2400 % 2400), fy = 760;
  for (const f of RF.fish) {
    const x = fx + f.dx, y = fy + f.dy + 6 * Math.sin(t * RF.wSway * 2 + f.ph);
    rfFish(c, x, y, 0.55, t, f.ph, '#4F9EC0', '#86C7DC');
  }
  rfPara(c, cam, 0.55); c.drawImage(RF.mid, -660, 640);
  // the glow of the sunlit water above
  screenSpace();
  softDot(gctx, 540 + (540 - cam.x) * 0.1, -120 - (cam.y - 960) * 0.2, 760, '#A8F4FF', 0.22);
  if (o.dim) { c.fillStyle = `rgba(4,20,40,${o.dim})`; c.fillRect(0, 0, W, H); }
}

// the sand floor with its caustics and seagrass, under the camera (world space)
function reefSand(cam, t) {
  const c = ctx; applyCam(cam);
  const sandPath = () => { c.beginPath(); c.moveTo(-1400, 2600); c.lineTo(-1400, RF_SAND_Y + 30);
    for (let x = -1400; x <= 2600; x += 40) c.lineTo(x, RF_SAND_Y + 18 * Math.sin(x * 0.004) + 10 * Math.sin(x * 0.013 + 1)); c.lineTo(2600, 2600); c.closePath(); };
  const g = c.createLinearGradient(0, RF_SAND_Y - 20, 0, RF_SAND_Y + 500);
  g.addColorStop(0, '#7FB2B0'); g.addColorStop(0.25, '#B8C59A'); g.addColorStop(1, '#D8C890');
  sandPath(); c.fillStyle = g; c.fill();
  paint(() => {
    // ripples in the sand
    for (let i = 0; i < 26; i++) {
      const y = RF_SAND_Y + 30 + i * 22 + i * i * 0.6, a = 0.10 + 0.004 * i;
      c.beginPath(); for (let x = -1400; x <= 2600; x += 60) c.lineTo(x, y + 6 * Math.sin(x * 0.02 + i * 1.3)); c.lineWidth = 3 + i * 0.25; c.strokeStyle = `rgba(120,110,70,${a})`; c.stroke();
    }
    // caustics: two tiles drifting against each other (a whole number of tiles per loop)
    c.save(); sandPath(); c.clip(); c.globalCompositeOperation = 'lighter';
    const D = (window.TL && TL.duration) || 31, sp = 256 / D;
    for (const [k, dx, dy, a, sc] of [[0, 1, 0.42, 0.30, 0.62], [1, -1, 0.63, 0.22, 0.86]]) {
      const pat = c.createPattern(RF.caus, 'repeat'), m = new DOMMatrix();
      m.translateSelf(dx * sp * t * sc * (k ? 1 : 2), dy * sp * t * sc * 2); m.scaleSelf(sc, sc * 0.42);
      pat.setTransform(m); c.globalAlpha = a; c.fillStyle = pat; c.fillRect(-1400, RF_SAND_Y - 40, 4000, 1200);
    }
    c.restore();
  });
  // seagrass tufts along the sand
  for (const b of RF.grass) {
    const sw = 10 * Math.sin(t * RF.wSway + b.ph), y0 = RF_SAND_Y + 14 * Math.sin(b.x * 0.004) + 6;
    c.beginPath(); c.moveTo(b.x - b.w / 2, y0); c.quadraticCurveTo(b.x + sw * 0.4, y0 - b.h * 0.5, b.x + sw, y0 - b.h); c.quadraticCurveTo(b.x + b.w / 2 + sw * 0.4, y0 - b.h * 0.5, b.x + b.w / 2, y0); c.closePath();
    c.fillStyle = '#3F8F6A'; c.fill();
  }
}

// a small fish in profile at (x, y) facing right, size s
function rfFish(c, x, y, s, t, ph, body, belly) {
  const wag = 0.35 * Math.sin(t * 9 + ph);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-26, 0); c.lineTo(-44, -12 + wag * 10); c.lineTo(-42, 12 + wag * 10); c.closePath(); c.fillStyle = body; c.fill();
  c.beginPath(); c.ellipse(0, 0, 30, 13, 0, 0, 7); c.fillStyle = body; c.fill();
  c.beginPath(); c.ellipse(2, 4, 22, 6, 0, 0, Math.PI); c.fillStyle = belly; c.fill();
  c.restore();
}

// the octopus's rock (world space, lit): a boulder with encrusting coral, an anemone and a starfish
function reefRock(cam, t) {
  const c = ctx; applyCam(cam);
  const x = RF_ROCK.x, top = RF_ROCK.top;
  c.beginPath();
  c.moveTo(x - 150, RF_SAND_Y + 24);
  c.bezierCurveTo(x - 168, top + 150, x - 120, top + 8, x - 30, top);
  c.bezierCurveTo(x + 50, top - 8, x + 128, top + 30, x + 150, top + 140);
  c.bezierCurveTo(x + 172, top + 250, x + 160, RF_SAND_Y, x + 176, RF_SAND_Y + 26);
  c.closePath();
  const g = c.createLinearGradient(x - 160, top, x + 160, RF_SAND_Y);
  g.addColorStop(0, '#8C8A7A'); g.addColorStop(0.5, '#6E6B60'); g.addColorStop(1, '#4E4A44');
  c.fillStyle = g; c.fill();
  paint(() => {
    // encrusting coral patches and speckles
    const rr = mulberry32(91);
    for (let i = 0; i < 26; i++) { const px = x - 130 + rr() * 270, py = top + 30 + rr() * 300; if (py > RF_SAND_Y) continue;
      ellipse(c, px, py, 8 + rr() * 22, 5 + rr() * 12, ['rgba(214,96,120,0.55)', 'rgba(232,170,80,0.5)', 'rgba(130,190,150,0.45)', 'rgba(60,50,48,0.35)'][i % 4], rr() * 3); }
    for (let i = 0; i < 60; i++) circle(c, x - 140 + rr() * 290, top + 20 + rr() * 330, 1.5 + rr() * 2.5, 'rgba(40,36,34,0.4)');
  });
  // a pink anemone on the right shoulder, tentacles swaying
  const ax = x + 128, ay = top + 128;
  for (let i = 0; i < 14; i++) {
    const a = -1.25 + i * 0.18 + 0.12 * Math.sin(t * RF.wSway * 1.5 + i * 0.7), L = 34 + 8 * Math.sin(i * 2.1);
    line(c, ax, ay, ax + Math.sin(a) * L, ay - Math.cos(a) * L, 7, '#F28DB2');
    circle(c, ax + Math.sin(a) * L, ay - Math.cos(a) * L, 4.5, '#FFD1E4');
  }
  ellipse(c, ax, ay + 4, 22, 10, '#C9507E');
  // a starfish on the left face
  c.save(); c.translate(x - 118, top + 230); c.rotate(0.3);
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, R = i % 2 ? 11 : 30; c.lineTo(Math.sin(a) * R, -Math.cos(a) * R); } c.closePath();
  c.fillStyle = '#F07A3A'; c.fill(); c.restore();
}

// the treadmill nobody uses (world space, lit): frame, belt, handrails, all barnacled and weedy; a crab jogs on it
function reefTreadmill(cam, t, x, y, o = {}) {
  const c = ctx; applyCam(cam);
  c.save(); c.translate(x, y); c.scale((o.s || 1) * (o.flip ? -1 : 1), o.s || 1);
  // base and belt
  rrect(c, -110, -26, 230, 40, 14); c.fillStyle = '#4D5560'; c.fill();
  rrect(c, -100, -38, 210, 18, 8); c.fillStyle = '#23272E'; c.fill();
  // uprights and console
  line(c, 90, -30, 104, -200, 16, '#5A626E'); line(c, 70, -30, 82, -190, 12, '#5A626E');
  rrect(c, 52, -232, 92, 46, 10); c.fillStyle = '#5A626E'; c.fill();
  line(c, 60, -190, -10, -150, 10, '#5A626E');
  paint(() => {
    rrect(c, 62, -224, 72, 30, 6); c.fillStyle = '#1C2A2E'; c.fill();
    c.save(); c.translate(98, -204); if (o.flip) c.scale(-1, 1);
    c.font = '700 15px Montserrat'; c.textAlign = 'center'; c.fillStyle = 'rgba(120,255,190,0.75)'; c.fillText('0.0 km', 0, 0); c.restore();
    // barnacles all over it
    const rr = mulberry32(17);
    for (let i = 0; i < 38; i++) {
      const px = -100 + rr() * 240, py = i < 26 ? -20 + rr() * 30 : -230 + rr() * 200; if (i >= 26 && px < 40) continue;
      const r = 4 + rr() * 6; circle(c, px, py, r, '#D9D2C2'); circle(c, px, py, r * 0.45, '#6C665C');
    }
    // weed hanging off the console
    for (let i = 0; i < 6; i++) { const sw = 6 * Math.sin(t * RF.wSway + i);
      c.beginPath(); c.moveTo(60 + i * 14, -190); c.quadraticCurveTo(58 + i * 14 + sw, -160, 62 + i * 14 + sw * 1.6, -128 - 8 * (i % 3)); c.lineWidth = 5; c.strokeStyle = '#4C8A4E'; c.lineCap = 'round'; c.stroke(); }
  });
  // a crab doing the cardio
  if (o.crab !== false) {
    const ph = t * 14, bx = -20 + 4 * Math.sin(ph * 0.5);
    actor(() => {
      for (const s of [-1, 1]) for (let j = 0; j < 3; j++) { const lift = 6 * Math.max(0, Math.sin(ph + j * 2 + (s > 0 ? Math.PI : 0)));
        line(c, bx + s * 12, -50, bx + s * (26 + j * 8), -38 - lift, 4, '#D9482F'); }
      ellipse(c, bx, -58, 24, 15, '#E85A3A');
      for (const s of [-1, 1]) { line(c, bx + s * 14, -66, bx + s * 26, -84, 5, '#E85A3A'); circle(c, bx + s * 30, -88, 7, '#E85A3A'); }
    });
    paint(() => { for (const s of [-1, 1]) { line(c, bx + s * 6, -70, bx + s * 8, -80, 2.5, '#7A2A1A'); circle(c, bx + s * 8, -82, 4, '#FFFFFF'); circle(c, bx + s * 8.5, -82, 2, '#111'); }
      // its tiny sweatband, and sweat flying off it
      line(c, bx - 12, -66, bx + 12, -66, 3, '#FFFFFF');
      for (let i = 0; i < 3; i++) { const u = (t * 2.2 + i / 3) % 1, sx = bx + (i - 1) * 10 + (i - 1) * 26 * u, sy = -76 - 30 * u + 40 * u * u;
        c.beginPath(); c.moveTo(sx, sy - 6); c.quadraticCurveTo(sx + 4, sy, sx, sy + 4); c.quadraticCurveTo(sx - 4, sy, sx, sy - 6); c.fillStyle = `rgba(190,240,255,${0.9 * (1 - u)})`; c.fill(); } });
  }
  c.restore();
}

// marine snow and bubbles in front of the set (screen space with depth); kelp at the frame's edges
function reefFront(cam, t, o = {}) {
  const c = ctx;
  screenSpace();
  for (const m of RF.snow) {
    const z = m.z, x = ((m.x * W + t * 12 * z * Math.cos(m.ph) - (cam.x - 540) * cam.zoom * z * 0.6) % W + W) % W;
    const y = ((m.y * H + t * 9 * z - (cam.y - 960) * cam.zoom * z * 0.6 + 8 * Math.sin(t * RF.wSway + m.ph)) % H + H) % H;
    softDot(c, x, y, 2 + 4 * z, '#E6FFF6', 0.10 + 0.12 * z);
  }
  if (o.kelp === false) return;
  rfPara(c, cam, 1.3);
  for (const k of RF.kelp) {
    const base = RF_SAND_Y + 260, top = base - k.h, sw = 40 * Math.sin(t * RF.wSway + k.ph);
    c.beginPath(); c.moveTo(k.x - k.w / 2, base); c.bezierCurveTo(k.x - k.w / 2 + sw * 0.3, base - k.h * 0.4, k.x + sw * 0.8 - k.w / 3, top + k.h * 0.3, k.x + sw, top);
    c.bezierCurveTo(k.x + sw * 0.8 + k.w / 3, top + k.h * 0.3, k.x + k.w / 2 + sw * 0.3, base - k.h * 0.4, k.x + k.w / 2, base); c.closePath();
    c.fillStyle = 'rgba(18,64,52,0.92)'; c.fill();
  }
}

// a rising bubble train from (x, y) in the current transform: n bubbles over `rise` px, size r
function rfBubbles(c, x, y, t, n, rise, r, seed = 1, wob = 10) {
  for (let i = 0; i < n; i++) {
    const u = (hash(i * 3.7 + seed) + t * (0.35 + 0.2 * hash(i + seed))) % 1, by = y - u * rise, bx = x + wob * Math.sin(t * 4 + i * 2 + seed) * u;
    const rr = r * (0.5 + 0.8 * hash(i * 1.3 + seed)) * (0.6 + 0.4 * u);
    c.beginPath(); c.arc(bx, by, rr, 0, 7); c.fillStyle = 'rgba(220,255,250,0.12)'; c.fill(); c.lineWidth = Math.max(1.5, rr * 0.18); c.strokeStyle = 'rgba(230,255,252,0.7)'; c.stroke();
    circle(c, bx - rr * 0.35, by - rr * 0.35, rr * 0.25, 'rgba(255,255,255,0.8)');
  }
}
