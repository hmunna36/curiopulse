// Can You Say MIT's HARDEST Tongue Twister? 👅 Short: a speech lab's sound booth, 2013. World space; the volunteer (him,
// in headphones) sits at a desk, a studio mic on a boom in front of his face, a monitor with his voice on it.
//   twLabBg(cam, t)                 foam walls, a SPEECH LAB sign, a paper note MIT 2013, the booth window, a desk lamp
//   twLabDesk(t)                    the desk in front of him (it hides his lap)
//   twMonitor(x, y, s, t, o)        the monitor: his voice as a scrolling trace; o: {flat 0..1, rec 0..1}
//   twStudioMic(t)                  the boom, the mic and its pop filter, in front of his face
//   twHeadphones(c)                 headphones over the rig's head (head units)
//   TWLAB                           where things are
'use strict';

const TWLAB = { hx: 540, fy: 1500, hs: 1.05, desk: 1420, mon: [806, 1252], mic: [636, 1238] };
let TW_FOAM = null;

function initLab() {
  const c = mkCanvas(1500, 1500), g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, 1500); bg.addColorStop(0, '#16223E'); bg.addColorStop(1, '#0A1022');
  g.fillStyle = bg; g.fillRect(0, 0, 1500, 1500);
  // acoustic foam: pyramids in squares, alternating direction
  for (let r = 0; r < 12; r++) for (let q = 0; q < 12; q++) {
    const x = q * 128, y = r * 128, vert = (r + q) % 2;
    for (let k = 0; k < 4; k++) {
      const yy = y + 8 + k * 30, xx = x + 8 + k * 30;
      g.fillStyle = 'rgba(255,255,255,0.035)';
      if (vert) g.fillRect(xx, y + 8, 18, 112); else g.fillRect(x + 8, yy, 112, 18);
      g.fillStyle = 'rgba(0,0,0,0.22)';
      if (vert) g.fillRect(xx + 18, y + 8, 8, 112); else g.fillRect(x + 8, yy + 18, 112, 8);
    }
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 3; g.strokeRect(x + 2, y + 2, 124, 124);
  }
  TW_FOAM = c;
}

function twLabBg(cam, t) {
  const c = ctx;
  darkBg('#101A34', '#050914');
  applyCam(cam);
  c.drawImage(TW_FOAM, -200, 400, 1500, 1500);
  // the booth window, top left: the control room beyond, out of focus (a screen glow, a lamp)
  rrect(c, 40, 560, 330, 230, 14); c.fillStyle = '#0B1426'; c.fill();
  softDot(c, 150, 680, 90, '#3FD8FF', 0.25); softDot(c, 290, 640, 60, '#FFB060', 0.25);
  softDot(gctx, 150, 680, 70, '#3FD8FF', 0.25);
  paint(() => { rrect(c, 40, 560, 330, 230, 14); c.lineWidth = 12; c.strokeStyle = '#2A3554'; c.stroke(); line(c, 205, 566, 205, 784, 6, '#2A3554'); });
  // the sign: SPEECH LAB, lit; and a paper note taped under it
  rrect(c, 340, 822, 400, 96, 16); c.fillStyle = '#1A1220'; c.fill();
  paint(() => {
    c.font = '400 64px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#FF5A6E'; c.fillText('SPEECH LAB', 540, 872);
  });
  softDot(gctx, 540, 872, 200, '#FF5A6E', 0.22);
  c.save(); c.translate(560, 984); c.rotate(0.04);
  c.fillStyle = '#F4F0E2'; c.fillRect(-150, -46, 300, 92);
  paint(() => {
    c.fillStyle = 'rgba(255,255,220,0.6)'; c.fillRect(-36, -58, 72, 22);
    c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1A2030';
    c.fillText('MIT · 2013', 0, 4);
  });
  c.restore();
}

function twLabDesk(t) {
  const c = ctx, y = TWLAB.desk;
  const g = c.createLinearGradient(0, y, 0, y + 400); g.addColorStop(0, '#3A3040'); g.addColorStop(1, '#16121C');
  c.fillStyle = g; c.fillRect(-300, y, 1700, 800);
  c.fillStyle = '#6A5A6C'; c.fillRect(-300, y, 1700, 12);
  // a clipboard and a cable on the desk
  c.save(); c.translate(250, y + 60); c.rotate(-0.12);
  rrect(c, -80, -30, 160, 110, 8); c.fillStyle = '#B98A55'; c.fill();
  c.fillStyle = '#F4F0E2'; c.fillRect(-66, -16, 132, 88);
  paint(() => { for (let i = 0; i < 5; i++) line(c, -52, 2 + i * 14, 40 - 18 * (i % 2), 2 + i * 14, 3, 'rgba(30,40,60,0.5)'); c.font = '900 16px Montserrat'; c.fillStyle = '#1A2030'; c.textAlign = 'left'; c.fillText('VOLUNTEER 7', -56, -4); });
  rrect(c, -24, -40, 48, 16, 5); c.fillStyle = '#9AA0AE'; c.fill();
  c.restore();
}

// his voice on the monitor (world space): a trace scrolling left; flat k turns it into a flat line
function twMonitor(x, y, s, t, o = {}) {
  const c = ctx, flat = clamp(o.flat || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -24, 118, 48, 70, 6); c.fillStyle = '#2A2A34'; c.fill();                 // the stand
  rrect(c, -90, 180, 180, 18, 8); c.fillStyle = '#2A2A34'; c.fill();
  rrect(c, -160, -120, 320, 240, 18); c.fillStyle = '#1C1C26'; c.fill();             // the case
  c.restore();
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    rrect(c, -146, -106, 292, 212, 10); c.fillStyle = '#04140E'; c.fill();
    c.save(); rrect(c, -146, -106, 292, 212, 10); c.clip();
    for (let gx = -140; gx <= 140; gx += 28) line(c, gx, -106, gx, 106, 1.2, 'rgba(80,255,170,0.10)');
    for (let gy = -100; gy <= 100; gy += 28) line(c, -146, gy, 146, gy, 1.2, 'rgba(80,255,170,0.10)');
    // the trace: busy speech, then (flat) a line
    const P = [];
    for (let i = 0; i <= 140; i++) {
      const xx = -146 + i * 2.1, ph = t * 9 - i * 0.09;
      const env = 0.35 + 0.65 * Math.abs(Math.sin(ph * 1.7)) * (0.6 + 0.4 * Math.sin(ph * 0.43));
      const tailFlat = clamp((i / 140 - (1 - flat * 1.15)) * 6);     // the flat part grows in from the right edge
      const a = (1 - tailFlat) * env * 62;
      P.push([xx, 6 + a * Math.sin(i * 1.9 + t * 40) * (0.6 + 0.4 * Math.sin(i * 0.7 + t * 13))]);
    }
    poly(c, P, 3, '#4DFFB4');
    c.restore();
    c.font = '900 20px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle';
    const rec = (o.rec === undefined ? 1 : o.rec) * (Math.sin(t * 6) > -0.3 ? 1 : 0.2);
    circle(c, -122, -84, 7, rgba('#FF4D5E', rec)); c.fillStyle = 'rgba(200,255,220,0.85)'; c.fillText('REC', -108, -84);
    if (o.wpm !== undefined) { c.textAlign = 'right'; c.fillStyle = o.wpm ? 'rgba(200,255,220,0.85)' : '#FF5A6E'; c.fillText(`WORDS/MIN ${o.wpm}`, 136, -84); }
    c.restore();
  });
  softDot(gctx, x, y, 170 * s, '#4DFFB4', 0.16);
}

// the boom arm from the top right, the mic and a pop filter in front of his face (world space)
function twStudioMic(t, m = TWLAB.mic) {
  const c = ctx;
  line(c, 1160, 820, m[0] + 170, 1030, 14, '#22242E'); line(c, m[0] + 170, 1030, m[0] + 40, m[1] - 40, 12, '#22242E');
  circle(c, m[0] + 170, 1030, 14, '#3A3C48');
  // the mic: a short cylinder, angled at his mouth
  c.save(); c.translate(m[0] + 26, m[1] - 18); c.rotate(-0.75);
  rrect(c, -18, -46, 36, 92, 14); c.fillStyle = '#2E3244'; c.fill();
  paint(() => { for (let i = -36; i < 30; i += 8) line(c, -16, i, 16, i, 1.6, 'rgba(160,170,200,0.4)'); });
  c.restore();
  // the pop filter: a hoop of mesh on a gooseneck
  line(c, m[0] + 60, m[1] - 70, m[0] + 8, m[1] - 40, 4, '#1A1C24');
  paint(() => {
    c.beginPath(); c.ellipse(m[0] - 18, m[1] - 10, 30, 52, -0.2, 0, Math.PI * 2);
    c.fillStyle = 'rgba(40,44,60,0.35)'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#1A1C24'; c.stroke();
    c.save(); c.clip(); for (let i = -60; i <= 60; i += 6) { line(c, m[0] - 60, m[1] - 10 + i, m[0] + 30, m[1] - 10 + i, 1, 'rgba(10,10,20,0.35)'); } c.restore();
  });
}

// headphones over the rig's head (head units): a band over the top, cups over the ears
function twHeadphones(c) {
  c.beginPath(); c.arc(0, -6, 74, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = 12; c.strokeStyle = '#1C1E2A'; c.stroke();
  for (const s of [-1, 1]) { rrect(c, s * 64 - 15, -20, 30, 50, 12); c.fillStyle = '#2A2C3A'; c.fill(); rrect(c, s * 64 - 9, -12, 18, 34, 8); c.fillStyle = '#FF5A6E'; c.fill(); }
}
