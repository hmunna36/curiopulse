// Inside his head: the cockpit that flies his arms. A brain in a pilot's cap (time-flies' brain, redrawn here with a cap,
// a headset, a moustache and a coffee mug), the AUTOPILOT sign (green ON / red OFF), the ARMS monitor (his arms, live),
// two arm levers (LEFT ARM, RIGHT ARM), the FOLDS counter, alarm beacons and a console.
// Everything is in cockpit units (a 1080x1920 room, origin top left) drawn through a view V = {x, y, s, cx, cy}:
// cockpit point (cx, cy) lands on screen (x, y), scaled by s. faCockpit(V, t, o) draws it in screen space.
'use strict';

const FAC = {
  wall: '#17264A', wall2: '#1F3360', wallDk: '#0E1834', panel: '#25407A', rivet: '#6E86C4',
  seat: '#A8324A', seatDk: '#7A2236', console: '#2B3550', consoleTop: '#46557E', consoleDk: '#1A2036',
  on: '#3DFF9A', off: '#FF3B4E', amber: '#FFC23A', screen: '#0B1F2E', screenHi: '#123C55',
};

// ---------------------------------------------------------------- the brain (time-flies' tfBrain, with a pilot's kit)
// o: {look: [x, y], mood: calm | worried | squint | grin | wow | sad | think, lean, bob, armL / armR: hand targets in
//  brain units, shut 0..1, cap: 'blue' | 'red' | null, headset, stache, mug: {x, y, rot, k} (held at the right hand)}
function faBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * loopW(2.4))) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const pink = o.pink || '#FF93B0', pinkDk = '#E0688E', paw = '#FFA9C0';
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = pinkDk; c.stroke();
    circle(c, tx, ty, 21, paw); circle(c, tx + sd * 12, ty - 14, 9, paw);
  };
  // the arms behind the head go first (hands behind the head)
  const behind = o.armsBehind;
  if (behind) { arm(-1, [-96, -96]); arm(1, [96, -96]); }
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();                      // the stem
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = pink; c.fill();
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126], [100, -20, 128, 10, 150, -6]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    // the face
    const lx = look[0] * 9, ly = look[1] * 7, shut = o.shut || 0;
    const ry = mood === 'squint' ? 13 : mood === 'worried' || mood === 'wow' ? 34 : mood === 'grin' ? 24 : mood === 'sad' ? 25 : 28;
    for (const ex of [-44, 38]) {
      if (shut > 0.6) { c.beginPath(); c.moveTo(ex - 22, 2); c.quadraticCurveTo(ex, mood === 'grin' ? -12 : 18, ex + 22, 2); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke(); continue; }
      ellipse(c, ex, 4, 25, ry * (1 - 0.5 * shut), '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry * (1 - 0.5 * shut), 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' || mood === 'wow' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    }
    const bt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : 0, by = mood === 'worried' || mood === 'wow' ? -46 : mood === 'squint' ? -24 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8, 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    if (mood === 'worried' || mood === 'wow') ellipse(c, -2, 64, mood === 'wow' ? 19 : 15, mood === 'wow' ? 17 : 12, '#5A1522');
    else if (mood === 'grin') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'sad') { c.beginPath(); c.moveTo(-18, 68); c.quadraticCurveTo(0, 54, 18, 68); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    // a big moustache (the twin's pilot)
    if (o.stache) {
      c.fillStyle = '#5A2A16';
      c.beginPath(); c.moveTo(0, 40); c.quadraticCurveTo(-30, 26, -62, 46); c.quadraticCurveTo(-44, 40, -40, 52); c.quadraticCurveTo(-18, 58, 0, 46);
      c.quadraticCurveTo(18, 58, 40, 52); c.quadraticCurveTo(44, 40, 62, 46); c.quadraticCurveTo(30, 26, 0, 40); c.closePath(); c.fill();
    }
  });
  // the pilot's cap: a soft crown, a badge with wings, a peak
  if (o.cap) {
    const capC = o.cap === 'red' ? '#C9283E' : '#22346E', capDk = o.cap === 'red' ? '#8E1A2B' : '#141F45';
    c.beginPath(); c.moveTo(-150, -70); c.quadraticCurveTo(-150, -190, 0, -196); c.quadraticCurveTo(150, -190, 150, -70); c.closePath();
    c.fillStyle = capC; c.fill();
    rrect(c, -158, -86, 316, 28, 12); c.fillStyle = capDk; c.fill();
    c.beginPath(); c.moveTo(-120, -62); c.quadraticCurveTo(0, -18, 120, -62); c.lineTo(108, -72); c.quadraticCurveTo(0, -40, -108, -72); c.closePath();
    c.fillStyle = '#0B0F22'; c.fill();
    paint(() => {
      circle(c, 0, -128, 17, '#FFD447');
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 14, -132); c.quadraticCurveTo(sd * 46, -146, sd * 70, -136); c.quadraticCurveTo(sd * 46, -126, sd * 14, -122); c.closePath(); c.fillStyle = '#FFD447'; c.fill(); }
    });
  }
  // the headset: a band over the cap's side, an earcup, a mic on a boom to the mouth
  if (o.headset) {
    c.beginPath(); c.arc(0, -40, 170, Math.PI * 1.03, Math.PI * 1.25); c.lineWidth = 12; c.strokeStyle = '#1A1A28'; c.stroke();
    ellipse(c, -160, 0, 30, 42, '#1A1A28'); ellipse(c, -160, 0, 18, 28, '#3A3A55');
    c.beginPath(); c.moveTo(-150, 30); c.quadraticCurveTo(-110, 86, -40, 78); c.lineWidth = 7; c.strokeStyle = '#1A1A28'; c.stroke();
    circle(c, -36, 77, 11, '#1A1A28');
  }
  if (!behind && !o.noArms) { arm(-1, o.armL); arm(1, o.armR); }
  // a coffee mug in the right hand
  const mg = o.mug;
  if (mg && (mg.k === undefined || mg.k > 0.01)) faMug(c, mg.x, mg.y, mg.s || 1, mg.rot || 0, mg.fill === undefined ? 0.8 : mg.fill);
  c.restore();
}
// a mug of coffee (brain units, centre of the mug at (x, y))
function faMug(c, x, y, s, rot, fill) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.arc(40, 0, 22, -1.3, 1.3); c.lineWidth = 11; c.strokeStyle = '#E8EEF8'; c.stroke();
  rrect(c, -36, -40, 76, 84, 14); c.fillStyle = '#F4F7FC'; c.fill();
  paint(() => {
    rrect(c, -36, -40, 76, 12, 6); c.fillStyle = '#6A3A1E'; if (fill > 0.3) c.fill();
    c.font = '900 22px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#E0688E'; c.fillText('♥', 2, 6);
  });
  c.restore();
}

// ---------------------------------------------------------------- the room
let FA_CPIT = null;
function initCockpit() {
  // the back wall painted once: panels, rivets, a grille, cable runs (it is a set: flat and unlit is fine)
  FA_CPIT = mkCanvas(1080, 1920);
  const c = FA_CPIT.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#0C1530'); g.addColorStop(0.35, FAC.wall); g.addColorStop(0.62, FAC.wall2); g.addColorStop(1, '#0A1024');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  // the ceiling's curve and its ribs
  c.fillStyle = '#0A1128'; c.beginPath(); c.moveTo(0, 0); c.lineTo(1080, 0); c.lineTo(1080, 250); c.quadraticCurveTo(540, 330, 0, 250); c.closePath(); c.fill();
  for (let i = 0; i < 7; i++) { const x = 60 + i * 160; c.fillStyle = 'rgba(80,110,180,0.25)'; c.fillRect(x, 0, 10, 250 + 40 * Math.sin((x / 1080) * Math.PI)); }
  // side panels with rivets
  for (const [x0, w] of [[24, 150], [906, 150]]) {
    c.fillStyle = FAC.panel; rrect(c, x0, 300, w, 900, 18); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.25)'; rrect(c, x0 + 14, 320, w - 28, 860, 12); c.fill();
    for (let y = 330; y < 1180; y += 64) for (const dx of [12, w - 12]) { c.fillStyle = FAC.rivet; c.beginPath(); c.arc(x0 + dx, y, 5, 0, 7); c.fill(); }
    // little switch rows
    for (let r = 0; r < 6; r++) for (let k = 0; k < 3; k++) { c.fillStyle = '#0B1328'; rrect(c, x0 + 28 + k * 34, 380 + r * 120, 24, 52, 6); c.fill(); c.fillStyle = '#9AB0E0'; rrect(c, x0 + 32 + k * 34, 384 + r * 120 + ((r + k) % 2) * 22, 16, 22, 4); c.fill(); }
  }
  // the cables along the ceiling
  c.lineCap = 'round';
  for (const [y, col] of [[262, '#C9283E'], [276, '#2E7BD8'], [290, '#FFC23A']]) { c.beginPath(); c.moveTo(0, y + 30); c.quadraticCurveTo(540, y + 90, 1080, y + 30); c.lineWidth = 9; c.strokeStyle = col; c.stroke(); }
}

// the AUTOPILOT sign. on 0..1 (1 = green ON), flip = how far the flap has turned (for the clunk)
function faSign(c, x, y, s, on, t, alarm) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -300, -74, 600, 148, 30); c.fillStyle = '#0B1024'; c.fill();
  rrect(c, -286, -60, 572, 120, 22); c.fillStyle = '#141B36'; c.fill();
  const col = on > 0.5 ? FAC.on : FAC.off;
  paint(() => {
    // the word and the badge, measured so they never touch (12 Nov: 'OFF' sat on the T)
    c.font = '900 56px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle';
    const tw = c.measureText('AUTOPILOT').width, bw = 140, gap = 20, x0 = -(tw + gap + bw) / 2;
    c.fillStyle = '#E8EEFF'; c.fillText('AUTOPILOT', x0, 4);
    rrect(c, x0 + tw + gap, -40, bw, 80, 18); c.fillStyle = col; c.fill();
    c.font = '900 50px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#0B0B1A'; c.fillText(on > 0.5 ? 'ON' : 'OFF', x0 + tw + gap + bw / 2, 6);
  });
  c.restore();
}

// the ARMS monitor: his torso with the arms live (fa_arms.js), f / knot / wob as on him
function faMonitor(c, x, y, s, t, o) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -270, -170, 540, 340, 30); c.fillStyle = '#0A0F20'; c.fill();
  rrect(c, -250, -150, 500, 300, 18); c.fillStyle = FAC.screen; c.fill();
  // a soft scanline grid (paint: no edges)
  paint(() => {
    c.save(); rrect(c, -250, -150, 500, 300, 18); c.clip();
    const g = c.createRadialGradient(0, 0, 20, 0, 0, 300); g.addColorStop(0, FAC.screenHi); g.addColorStop(1, FAC.screen);
    c.fillStyle = g; c.fillRect(-250, -150, 500, 300);
    c.strokeStyle = 'rgba(120,220,255,0.10)'; c.lineWidth = 2;
    for (let yy = -150; yy < 150; yy += 22) { c.beginPath(); c.moveTo(-250, yy); c.lineTo(250, yy); c.stroke(); }
    c.restore();
  });
  // the torso and the arms, at a small scale, centred on his chest
  c.save(); c.translate(0, 70); c.scale(0.62, 0.62); c.translate(0, 318);
  const P = o.pal || PAL;
  c.beginPath(); c.moveTo(-80, -390); c.lineTo(80, -390); c.quadraticCurveTo(110, -385, 108, -350); c.lineTo(96, -170); c.lineTo(-96, -170); c.lineTo(-108, -350); c.quadraticCurveTo(-110, -385, -80, -390); c.closePath();
  c.fillStyle = P.coat; c.fill();
  circle(c, 0, -470, 58, P.skin);
  c.beginPath(); c.moveTo(-60, -478); c.quadraticCurveTo(-64, -530, -20, -536); c.quadraticCurveTo(40, -540, 60, -490); c.quadraticCurveTo(30, -510, 0, -500); c.quadraticCurveTo(-30, -512, -60, -478); c.closePath(); c.fillStyle = P.hair; c.fill();
  faArms(c, { f: o.f, knot: o.knot || 0, wob: o.wob || 0, tw: 1, strain: o.strain || 0 }, P, t);
  c.restore();
  paint(() => {
    c.font = '900 34px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(140,230,255,0.95)';
    c.fillText('ARMS', -228, -122);
    const man = o.manual > 0.5;
    rrect(c, 70, -142, 160, 42, 12); c.fillStyle = man ? FAC.off : FAC.on; c.fill();
    c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#0B0B1A'; c.fillText(man ? 'MANUAL' : 'AUTO', 150, -120);
  });
  c.restore();
}

// a lever from a slot in the console: base (x, y), angle a (0 = straight up), knob colour, label
function faLever(c, x, y, s, a, col, label) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -34, -12, 68, 40, 10); c.fillStyle = '#0B1024'; c.fill();
  c.save(); c.rotate(a);
  line(c, 0, 0, 0, -190, 22, '#9AA6C4');
  line(c, 0, 0, 0, -190, 12, '#C9D2EA');
  circle(c, 0, -206, 40, col);
  paint(() => { circle(c, -12, -218, 12, 'rgba(255,255,255,0.55)'); });
  c.restore();
  paint(() => {
    c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#E8EEFF';
    c.fillText(label, 0, 62);
  });
  c.restore();
}
// the FOLDS counter: a row of digit wheels (value can be a number or text), the last wheel rolling when it moves
function faCounter(c, x, y, s, val, roll) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -230, -56, 460, 112, 20); c.fillStyle = '#0B1024'; c.fill();
  paint(() => {
    c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#9AB0E0';
    c.fillText('FOLDS', -212, 0);
    const txt = typeof val === 'string' ? val : Math.floor(val).toLocaleString('en-US');
    rrect(c, -86, -38, 300, 76, 12); c.fillStyle = '#F2F4FA'; c.fill();
    c.font = '900 54px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#121626';
    c.save(); rrect(c, -86, -38, 300, 76, 12); c.clip();
    const dy = (roll || 0) * 60;
    c.fillText(txt, 64, 4 - dy);
    c.restore();
  });
  c.restore();
}
// an alarm beacon: a red dome whose beam sweeps round (glow) while `on`
function faBeacon(c, g, x, y, s, t, on) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -46, 10, 92, 30, 8); c.fillStyle = '#2A2F44'; c.fill();
  c.beginPath(); c.arc(0, 12, 42, Math.PI, 0); c.closePath(); c.fillStyle = on > 0.5 ? '#FF3B4E' : '#6A2430'; c.fill();
  c.restore();
  if (on > 0.5) {
    softDot(g, x, y - 4 * s, 120 * s, '#FF2A3C', 0.55);
    const a = t * 9;
    g.save(); g.translate(x, y); g.rotate(a);
    const gr = g.createLinearGradient(0, 0, 520 * s, 0); gr.addColorStop(0, 'rgba(255,60,70,0.55)'); gr.addColorStop(1, 'rgba(255,60,70,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(520 * s, -90 * s); g.lineTo(520 * s, 90 * s); g.closePath(); g.fill();
    g.restore();
  }
}

// the cockpit. o: {on 0..1 (the sign), alarm 0..1, levers [aL, aR], lpush (a lever yank 0..1 each), pilot: faBrain
// options + {x, y, s}, counter, roll, arms: {f, knot, wob, manual}, flip}
function faCockpit(V, t, o = {}) {
  screenSpace();
  const c = ctx, g = gctx;
  c.save();
  c.translate(V.x, V.y); c.scale(V.s, V.s); c.translate(-V.cx, -V.cy);
  g.save(); g.translate(V.x, V.y); g.scale(V.s, V.s); g.translate(-V.cx, -V.cy);
  c.drawImage(FA_CPIT, 0, 0);
  const alarm = clamp(o.alarm || 0), blink = alarm > 0.5 && Math.sin(t * 18) > -0.2 ? 1 : 0;
  // little panel lamps (glow), blinking on loop-safe clocks
  for (let i = 0; i < 12; i++) {
    const x = i < 6 ? 60 + (i % 3) * 40 : 942 + (i % 3) * 40, y = 1240 - Math.floor((i % 6) / 3) * 34;
    const on = Math.sin(t * loopW(1.3 + 0.37 * i) + i * 2.1) > 0;
    const col = i % 4 === 0 ? '#FF5A6E' : i % 4 === 1 ? '#3DFF9A' : '#FFD447';
    circle(c, x, y, 9, on ? col : '#2A3350');
    if (on) softDot(g, x, y, 26, col, 0.6);
  }
  // the beacons
  faBeacon(c, g, 150, 330, 1.1, t, alarm);
  faBeacon(c, g, 930, 330, 1.1, t + 0.3, alarm);
  if (alarm > 0.5) { c.fillStyle = `rgba(255,30,50,${0.10 + 0.08 * blink})`; c.fillRect(0, 0, 1080, 1920); }
  // the sign
  const sk = o.signK === undefined ? 1 : o.signK;
  faSign(c, 540, 470, 1.0 + 0.08 * sk * (o.flipPop || 0), o.on === undefined ? 1 : o.on, t, alarm);
  softDot(g, 731, 474, 110, (o.on === undefined ? 1 : o.on) > 0.5 ? FAC.on : FAC.off, 0.55 + 0.25 * blink);
  // the monitor
  const ar = o.arms || { f: 1 };
  faMonitor(c, 540, 760, 1.0, t, ar);
  softDot(g, 540, 760, 300, '#5AD8FF', 0.16);
  // the seat behind the pilot
  rrect(c, 330, 880, 420, 470, 120); c.fillStyle = FAC.seatDk; c.fill();
  rrect(c, 350, 900, 380, 420, 110); c.fillStyle = FAC.seat; c.fill();
  paint(() => { for (let i = 0; i < 3; i++) line(c, 400, 990 + i * 90, 680, 990 + i * 90, 5, 'rgba(90,20,40,0.5)'); });
  // the pilot
  const pp = o.pilot || {};
  actor(() => faBrain(c, pp.x || 540, pp.y || 1090, pp.s || 1.05, t, pp));
  // a mug knocked into the air, coffee flying out of it
  const fm = o.flyMug;
  if (fm) {
    faMug(c, fm.x, fm.y, 1.15, fm.rot, 0.2);
    paint(() => { for (let i = 0; i < 7; i++) { const a = fm.rot * 0.6 + i * 0.55; circle(c, fm.x + Math.cos(a) * (70 + 16 * i), fm.y - 40 + Math.sin(a) * (40 + 10 * i), 14 - i, '#6A3A1E'); } });
  }
  // the console: its top edge and the face below
  c.fillStyle = FAC.consoleTop; c.beginPath(); c.moveTo(0, 1250); c.quadraticCurveTo(540, 1196, 1080, 1250); c.lineTo(1080, 1300); c.quadraticCurveTo(540, 1246, 0, 1300); c.closePath(); c.fill();
  c.fillStyle = FAC.console; c.beginPath(); c.moveTo(0, 1300); c.quadraticCurveTo(540, 1246, 1080, 1300); c.lineTo(1080, 1920); c.lineTo(0, 1920); c.closePath(); c.fill();
  // the levers
  const lv = o.levers || [0, 0];
  const LX = o.leverX || [290, 790];   // the hand shot pulls them in, clear of the like/comment column
  faLever(c, LX[0], 1262, 1.0, lv[0], '#FF5A6E', 'LEFT ARM');
  faLever(c, LX[1], 1262, 1.0, lv[1], '#5AA8FF', 'RIGHT ARM');
  // the counter
  if (o.counter !== null) faCounter(c, 540, 1500, 1.0, o.counter === undefined ? 9999 : o.counter, o.roll || 0);   // inside the key zone (y <= 1640) at every framing
  // more switches on the console face
  for (let i = 0; i < 8; i++) { const x = 140 + i * 115; rrect(c, x - 18, 1690, 36, 64, 8); c.fillStyle = '#0B1024'; c.fill(); rrect(c, x - 12, 1696 + (i % 3 === 0 ? 30 : 0), 24, 28, 6); c.fillStyle = '#C9D2EA'; c.fill(); }
  c.restore(); g.restore();
}
