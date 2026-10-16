// What If You Went to Space WITHOUT a Suit? (long-form): pictures added in QA round 2, to turn long single shots into
// cuts with a payoff each:
// - a bell jar (the classic demonstration): a beaker of water at 37 °C under a glass dome; the air is pumped out and the
//   water boils;
// - a big stopwatch, full frame: "a different clock starts";
// - the NASA vacuum chamber from outside, 1966 (old film);
// - the Soyuz capsule's hull up close, its valve venting;
// - the selfie itself, as the photo: two helmets and the Earth's thin blue line;
// - Pip's face in a round avatar.
// Screen space unless said otherwise.
'use strict';

// ---------------------------------------------------------------- the bell jar
// pump 0..1 (how much air has been pumped out: the air dots leave, the AIR gauge falls), boil 0..1 (bubbles in the
// water), k pops it in
function bellJar(x, y, s, t, o = {}) {
  const pump = o.pump || 0, boil = o.boil || 0, k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); const sc = s * E.outBack(clamp(k), 1.5); ctx.scale(sc, sc);
  // the base plate and the hose to a pump on the right
  rrect(ctx, -330, 250, 660, 50, 16); ctx.fillStyle = '#3A4466'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(300, 270); ctx.quadraticCurveTo(470, 280, 520, 160); ctx.lineWidth = 22; ctx.strokeStyle = '#2A2E44'; ctx.stroke();
  rrect(ctx, 470, 40, 140, 140, 22); ctx.fillStyle = '#5A6488'; ctx.fill();
  const pr = Math.sin(t * 14) * 0.5 + 0.5;
  rrect(ctx, 500, 0 - 20 * pr * (pump < 0.98 ? 1 : 0), 80, 50, 10); ctx.fillStyle = '#8A93AE'; ctx.fill();   // the pump's piston
  ctx.font = '900 30px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('PUMP', 540, 120);
  // the air inside the dome: dots that get fewer as it is pumped out (and stream out of the hose)
  for (let i = 0; i < 60; i++) {
    if (hash(i * 3.3) < pump) continue;
    const a = hash(i * 7) * 6.283 + t * (0.4 + hash(i)), r = 60 + 200 * hash(i * 5);
    circle(ctx, Math.cos(a) * r, -40 + Math.sin(a) * r * 0.8, 7, 'rgba(127,233,255,0.8)');
  }
  // the beaker of water, a thermometer in it reading 37 C
  rrect(ctx, -110, 20, 220, 230, 18); ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(220,240,255,0.8)'; ctx.stroke();
  rrect(ctx, -102, 80, 204, 164, 14); ctx.fillStyle = 'rgba(90,170,255,0.65)'; ctx.fill();
  for (let i = 0; i < 26; i++) {
    const ph = (t * (1.2 + hash(i)) + hash(i * 5)) % 1, bx = -90 + 180 * hash(i * 2.3), by = 240 - 170 * ph;
    const r = (4 + 10 * hash(i * 9)) * boil * (0.4 + ph);
    if (r < 0.8) continue;
    ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fillStyle = `rgba(235,248,255,${0.7 * (1 - ph * 0.6)})`; ctx.fill();
  }
  if (boil > 0.05) for (let i = 0; i < 8; i++) { const ph = (t * 1.5 + i / 8) % 1; softDot(ctx, -80 + 160 * hash(i), 70 - 90 * ph, 20 + 20 * ph, '#FFFFFF', 0.25 * boil * (1 - ph)); }
  rrect(ctx, 40, -10, 22, 250, 11); ctx.fillStyle = '#F4F4F8'; ctx.fill(); circle(ctx, 51, 236, 18, '#E0303E'); rrect(ctx, 46, 120, 10, 116, 5); ctx.fillStyle = '#E0303E'; ctx.fill();
  // the glass dome
  ctx.beginPath(); ctx.moveTo(-300, 250); ctx.lineTo(-300, -40); ctx.arc(0, -40, 300, Math.PI, 0); ctx.lineTo(300, 250);
  ctx.fillStyle = 'rgba(190,225,255,0.08)'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(220,240,255,0.85)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -40, 270, Math.PI * 1.1, Math.PI * 1.35); ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.stroke();
  circle(ctx, 0, -350, 22, '#C8CEE0');
  ctx.restore();
}

// ---------------------------------------------------------------- a big stopwatch (screen space), red: UNCONSCIOUS
function bigStopwatch(x, y, s, t, secs, k, o = {}) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); const sc = s * E.outBack(clamp(k), 1.7); ctx.scale(sc, sc);
  rrect(ctx, -40, -330, 80, 60, 14); ctx.fillStyle = '#C8CEE0'; ctx.fill();
  circle(ctx, 0, 0, 290, '#2A2E44'); circle(ctx, 0, 0, 262, '#F4F4F8');
  for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283, L = i % 5 ? 14 : 30; line(ctx, Math.sin(a) * 240, -Math.cos(a) * 240, Math.sin(a) * (240 - L), -Math.cos(a) * (240 - L), i % 5 ? 4 : 8, '#2A2E44'); }
  // the red danger arc from 15 to 90 seconds (the rescue window)
  ctx.beginPath(); ctx.arc(0, 0, 200, -Math.PI / 2 + 15 / 60 * 6.283, -Math.PI / 2 + 90 / 60 * 6.283); ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(255,58,78,0.5)'; ctx.stroke();
  const a = secs / 60 * 6.283;
  line(ctx, 0, 0, Math.sin(a) * 220, -Math.cos(a) * 220, 12, '#E0303E'); circle(ctx, 0, 0, 22, '#E0303E');
  ctx.font = '400 96px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A2E44'; ctx.fillText(`${Math.floor(secs)}`, 0, 110);
  ctx.restore();
  softDot(gctx, x, y, 420 * s * k, '#FF3A4E', 0.35);
}

// ---------------------------------------------------------------- 1966: the vacuum chamber from outside (world units)
function chamberOutside(cam, t, o = {}) {
  screenSpace(); ctx.fillStyle = '#2A2A26'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // a hangar: a high wall with windows, a floor
  ctx.fillStyle = '#8A8A82'; ctx.fillRect(-400, -300, W + 800, 1000);
  for (let i = 0; i < 7; i++) { rrect(ctx, -200 + i * 340, -100, 220, 260, 8); ctx.fillStyle = '#C8CCC4'; ctx.fill(); line(ctx, -90 + i * 340, -100, -90 + i * 340, 160, 6, '#6A6A62'); }
  ctx.fillStyle = '#5A5A52'; ctx.fillRect(-400, 700, W + 800, 600);
  // the chamber: a huge steel cylinder on its side with a round door, pipes, a NASA meatball-free sign
  rrect(ctx, 240, 220, 1440, 560, 260); const g = ctx.createLinearGradient(0, 220, 0, 780); g.addColorStop(0, '#B8BCBE'); g.addColorStop(0.5, '#D8DCDC'); g.addColorStop(1, '#7A7E80'); ctx.fillStyle = g; ctx.fill();
  for (let i = 0; i < 9; i++) line(ctx, 420 + i * 150, 230, 420 + i * 150, 770, 4, 'rgba(60,64,66,0.35)');
  circle(ctx, 1500, 500, 220, '#6A6E70'); circle(ctx, 1500, 500, 190, '#9A9EA0'); circle(ctx, 1500, 500, 80, '#5A5E60');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; circle(ctx, 1500 + Math.cos(a) * 205, 500 + Math.sin(a) * 205, 10, '#4A4E50'); }
  circle(ctx, 760, 470, 90, '#4A4E50'); circle(ctx, 760, 470, 70, '#D0D4D0');                                   // a porthole
  ctx.save(); ctx.beginPath(); ctx.arc(760, 470, 70, 0, 7); ctx.clip(); circle(ctx, 760, 470, 34, '#E8E2D0'); circle(ctx, 760, 474, 24, '#202428'); ctx.restore();
  for (const [x0, x1] of [[300, 120], [600, 520]]) { ctx.beginPath(); ctx.moveTo(x0, 780); ctx.lineTo(x0, 900); ctx.lineTo(x1, 900); ctx.lineWidth = 26; ctx.strokeStyle = '#4A4E50'; ctx.stroke(); }
  rrect(ctx, 960, 270, 360, 80, 12); ctx.fillStyle = '#2A2E3A'; ctx.fill();
  ctx.font = '900 46px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#F4F0E4'; ctx.fillText('VACUUM', 1140, 312);
  // an engineer walking past in the foreground (a silhouette in a white shirt)
  const ex = 100 + 60 * (o.walk || 0);
  rrect(ctx, ex - 70, 560, 140, 360, 50); ctx.fillStyle = '#E8E4DA'; ctx.fill(); circle(ctx, ex, 510, 56, '#2A2018');
}

// ---------------------------------------------------------------- the Soyuz hull up close, the valve venting (screen space)
function soyuzValve(t, v, o = {}) {
  screenSpace();
  spaceField(ctx, 0, 0, W, H, t);
  ctx.save(); ctx.translate(960, 560); ctx.rotate(-0.12 + 0.01 * Math.sin(t * 0.7));
  // the curved hull filling the lower left
  ctx.beginPath(); ctx.moveTo(-1300, 900); ctx.lineTo(-1300, -200); ctx.quadraticCurveTo(-200, -360, 900, -120); ctx.lineTo(900, 900); ctx.closePath();
  const g = ctx.createLinearGradient(0, -360, 0, 600); g.addColorStop(0, '#B8BCC4'); g.addColorStop(0.4, '#7A7E86'); g.addColorStop(1, '#3A3E46'); ctx.fillStyle = g; ctx.fill();
  for (let i = 0; i < 7; i++) line(ctx, -1100 + i * 300, -220 + 30 * Math.sin(i), -1100 + i * 300, 900, 5, 'rgba(30,34,40,0.4)');
  // the valve: a round fitting with a small open port
  ctx.save(); ctx.translate(140, -160);
  circle(ctx, 0, 0, 90, '#4A4E56'); circle(ctx, 0, 0, 70, '#9A9EA6'); circle(ctx, 0, 0, 26, '#15181E');
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; circle(ctx, Math.cos(a) * 80, Math.sin(a) * 80, 8, '#2A2E36'); }
  // the jet of air leaving
  if (v > 0.01) for (let i = 0; i < 26; i++) { const ph = (t * 2.2 + i / 26) % 1, d = 30 + 640 * ph; softDot(ctx, d * 0.9 + 30 * Math.sin(i), -d * 0.45 - 20 * Math.cos(i * 1.7), 14 + 60 * ph, '#E8ECF4', 0.55 * (1 - ph) * v); }
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- the selfie itself (screen space): the photo he sends
// k pops it in; flash 0..1
function selfiePhoto(x, y, s, t, k, flash = 0) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); const sc = s * E.outBack(clamp(k), 1.6); ctx.scale(sc, sc); ctx.rotate(-0.04);
  rrect(ctx, -520, -330, 1040, 660, 20); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.save(); rrect(ctx, -490, -300, 980, 600, 10); ctx.clip();
  spaceField(ctx, -490, -300, 980, 600, t, { starS: 1.3 });
  earthLimb(ctx, 120, 1300, 1250, t, { glowCtx: false, line: 0.03 });
  // the two of them, heads and shoulders, helmets on (his sister on the left)
  const draw = (pal, hx, face, sis) => {
    const st = { x: hx, y: 450, s: 1.0, face, seed: sis ? 3 : 4, noLegs: true,
      pose: { hipY: -222, lean: sis ? 0.06 : -0.06, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 } };
    drawCharacter(ctx, st, t, pal); if (sis) sisHair(ctx, st);
    const r = rig(st.pose); ctx.save(); ctx.translate(st.x, st.y); ctx.scale(st.s, st.s); ctx.translate(r.head[0], r.head[1]); ctx.rotate(st.pose.lean); alHelmet(ctx, 0, -8, 0.82); ctx.restore();
  };
  draw(SISPAL, -190, Object.assign({}, FACES.happy, { lookX: 0.2 }), true);
  draw(ALPAL, 170, Object.assign({}, FACES.happy, { lookX: -0.2 }), false);
  if (flash > 0.01) { ctx.fillStyle = `rgba(255,255,255,${0.8 * flash})`; ctx.fillRect(-490, -300, 980, 600); }
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- Pip's face in a round avatar (screen space)
function pipAvatar(x, y, r, t) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  ctx.fillStyle = '#FFD9E6'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  const st = { x, y: y + r * 2.9, s: r / 72, face: Object.assign({}, FACES.happy, { lookX: 0.3 }), seed: 9, noLegs: true,
    pose: { hipY: -222, lean: 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 } };
  const r_ = drawCharacter(ctx, st, t, PIP_PJ);
  ctx.save(); ctx.translate(st.x, st.y); ctx.scale(st.s, st.s); pipTails(ctx, r_, st, t); ctx.restore();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = '#FF86A6'; ctx.stroke();
}
