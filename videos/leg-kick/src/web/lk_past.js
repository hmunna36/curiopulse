// 1902 to 1904, in sepia: the lab (striped wallpaper, a brass kymograph drum, a tall stool with the volunteer on it,
// two little hammers on a frame in front of his knees, the scientist with a monocle and a hand bell), the lecture hall
// (the scientist at a lectern, a chalkboard, rows of experts seen from behind, a cricket on a chair back), and the dog's
// moment of fame (a spotlight, flashbulbs, a marquee, a gold medal). Plus the old-film overlay.
'use strict';

const LK_OLDPAL = Object.assign({}, PAL, {                        // him in 1902: a tweed jacket, braces, brown boots
  coat: '#9A7350', coatSh: '#6E4E34', coatHi: '#C29A70', coatDk: '#5A3E28',
  strap: '#3E2E22', strapSh: '#2A1E16', pants: '#4A3C30', pantsSh: '#33281F',
  shoe: '#5C3B26', shoeSh: '#3E2618', sole: '#2A1C14',
});
const LK_LAB = { hx: 520, hy: 1150, s: 1.55 };
let LK_LABWALL = null, LK_HALLWALL = null;

function lkInitPast() {
  const M = 260;
  // ---- the lab wall
  LK_LABWALL = mkCanvas(W + 2 * M, H + 2 * M);
  let c = LK_LABWALL.getContext('2d');
  c.translate(M, M);
  c.fillStyle = '#7A5A3A'; c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  for (let x = -M; x < W + M; x += 64) { c.fillStyle = 'rgba(40,24,10,0.22)'; c.fillRect(x, -M, 26, 1460 + M); c.fillStyle = 'rgba(255,230,190,0.05)'; c.fillRect(x + 30, -M, 4, 1460 + M); }
  const wg = c.createLinearGradient(0, 1300, 0, 1900); wg.addColorStop(0, '#4E3420'); wg.addColorStop(1, '#2A1A0E');
  c.fillStyle = wg; c.fillRect(-M, 1300, W + 2 * M, H);
  c.fillStyle = '#6A4A30'; c.fillRect(-M, 1288, W + 2 * M, 16);
  // a tall window on the right: the light comes from there
  c.save(); c.translate(930, 640);
  rrect(c, -150, -330, 300, 660, 14); c.fillStyle = '#3A2614'; c.fill();
  const sg = c.createLinearGradient(0, -310, 0, 310); sg.addColorStop(0, '#FFF2D6'); sg.addColorStop(1, '#E9C890');
  c.fillStyle = sg; c.fillRect(-130, -310, 260, 620);
  c.fillStyle = '#3A2614'; c.fillRect(-6, -310, 12, 620); c.fillRect(-130, -10, 260, 12);
  c.restore();
  // a framed portrait (a stern bearded man)
  c.save(); c.translate(180, 560);
  rrect(c, -90, -116, 180, 232, 10); c.fillStyle = '#5A3A1E'; c.fill();
  rrect(c, -72, -98, 144, 196, 6); c.fillStyle = '#C8AE84'; c.fill();
  circle(c, 0, -20, 40, '#8A6A48'); ellipse(c, 0, 34, 34, 30, '#4A3424'); c.fillStyle = '#4A3424'; c.fillRect(-60, 60, 120, 40);
  c.restore();
  // ---- the lecture hall wall
  LK_HALLWALL = mkCanvas(W + 2 * M, H + 2 * M);
  c = LK_HALLWALL.getContext('2d');
  c.translate(M, M);
  const hg = c.createLinearGradient(0, 0, 0, 1400); hg.addColorStop(0, '#3A2A1C'); hg.addColorStop(1, '#6A4C30');
  c.fillStyle = hg; c.fillRect(-M, -M, W + 2 * M, H + 2 * M);
  for (let x = -M + 30; x < W + M; x += 220) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, -M, 40, 1300 + M); }
  // the chalkboard: a bell, an arrow, a kicking leg; and a banner with the year
  c.save(); c.translate(600, 760);
  rrect(c, -330, -200, 660, 400, 12); c.fillStyle = '#5A3C22'; c.fill();
  rrect(c, -310, -180, 620, 360, 6); c.fillStyle = '#26332A'; c.fill();
  c.strokeStyle = 'rgba(240,240,225,0.85)'; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-230, 40); c.quadraticCurveTo(-230, -70, -170, -80); c.quadraticCurveTo(-110, -70, -110, 40); c.closePath(); c.stroke();   // the bell
  c.beginPath(); c.arc(-170, 56, 14, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-170, -80); c.lineTo(-170, -110); c.stroke();
  c.beginPath(); c.moveTo(-60, -10); c.lineTo(60, -10); c.moveTo(30, -36); c.lineTo(62, -10); c.lineTo(30, 16); c.stroke();                   // the arrow
  c.beginPath(); c.moveTo(130, -100); c.lineTo(170, 0); c.lineTo(270, -60); c.stroke();                                                      // the leg, kicking
  c.beginPath(); c.moveTo(250, -90); c.lineTo(290, -40); c.moveTo(262, -110); c.lineTo(300, -66); c.stroke();
  c.font = '900 54px Montserrat'; c.fillStyle = 'rgba(240,240,225,0.9)'; c.textAlign = 'center'; c.fillText('= KICK!', 150, 120);
  c.restore();
  // the stage floor
  const fg = c.createLinearGradient(0, 1180, 0, 1400); fg.addColorStop(0, '#7A5634'); fg.addColorStop(1, '#4A321E');
  c.fillStyle = fg; c.fillRect(-M, 1180, W + 2 * M, 900);
  c.fillStyle = '#8E6A44'; c.fillRect(-M, 1172, W + 2 * M, 14);
}

// ---------------------------------------------------------------- the lab
function lkLabBack(cam, t) {
  applyCam(cam);
  ctx.drawImage(LK_LABWALL, -260, -260);
  softDot(gctx, 930, 640, 330, '#FFE6B8', 0.55);
  sunRays(930, 640, 0.7);
  // the kymograph: a smoked drum on a stand, a trace being drawn (left, behind his stool)
  const kx = 930, ky = 1330;
  rrect(ctx, kx - 120, ky, 240, 26, 6); ctx.fillStyle = '#4A3420'; ctx.fill();
  rrect(ctx, kx - 16, ky - 210, 32, 210, 6); ctx.fillStyle = '#B08A48'; ctx.fill();
  rrect(ctx, kx - 92, ky - 330, 184, 150, 20); ctx.fillStyle = '#2A2420'; ctx.fill();
  ctx.save(); ctx.beginPath(); rrect(ctx, kx - 92, ky - 330, 184, 150, 20); ctx.clip();
  ctx.strokeStyle = 'rgba(255,245,220,0.8)'; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = -92; x <= 92; x += 4) { const ph = (x + t * 60) * 0.06; ctx.lineTo(kx + x, ky - 255 - 26 * Math.max(0, Math.sin(ph)) * (Math.sin(ph * 0.33) > 0.3 ? 1 : 0.15)); }
  ctx.stroke(); ctx.restore();
  ellipse(ctx, kx, ky - 330, 92, 12, '#4A4038');
}
// the tall stool under him
function lkStool(cam) {
  applyCam(cam);
  const s = LK_LAB.s, x = LK_LAB.hx, top = LK_LAB.hy + 22 * s;
  for (const dx of [-90, 90]) line(ctx, x + dx * 0.7, top + 30, x + dx, top + 640, 18, '#5A3A20');
  line(ctx, x - 82, top + 330, x + 82, top + 330, 12, '#5A3A20');
  rrect(ctx, x - 120, top - 8, 240, 40, 12); ctx.fillStyle = '#7A5230'; ctx.fill();
}
// the hammer frame in front of his knees: a bar on two posts, a hammer hanging for each knee.
// swing: 0 = cocked back (up), 1 = struck. knees: world points of the two tap spots
function lkHammers(cam, knees, swing, t) {
  applyCam(cam);
  const heads = [];
  const barY = Math.min(knees[0][1], knees[1][1]) - 230, x0 = Math.min(knees[0][0], knees[1][0]) - 210, x1 = Math.max(knees[0][0], knees[1][0]) + 40;
  line(ctx, x0, barY, x1, barY, 14, '#6A4A2A');
  line(ctx, x0 + 10, barY, x0 + 10, barY + 900, 14, '#6A4A2A');
  knees.forEach((k, i) => {
    const pv = [k[0] - 120, barY + 6], L = Math.hypot(k[0] - 8 - pv[0], k[1] - pv[1]);
    const hit = Math.atan2(k[1] - pv[1], k[0] - 8 - pv[0]), ang = hit - (1 - swing[i]) * 0.95;
    const hd = [pv[0] + Math.cos(ang) * L, pv[1] + Math.sin(ang) * L];
    heads.push(hd);
    line(ctx, pv[0], pv[1], hd[0], hd[1], 10, '#B89A6A');
    circle(ctx, pv[0], pv[1], 10, '#3A2A1A');
    ctx.save(); ctx.translate(hd[0], hd[1]); ctx.rotate(ang + Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(-34, -16); ctx.lineTo(34, -16); ctx.lineTo(26, 18); ctx.lineTo(-26, 18); ctx.closePath(); ctx.fillStyle = '#9A3A2E'; ctx.fill();
    ctx.restore();
  });
  return heads;
}

// ---------------------------------------------------------------- the scientist (standing; feet at y = 0, ~540 tall)
// o: {mood 'calm' | 'amazed' | 'deadpan' | 'proud' | 'sigh', bell 0..1 (the hand bell up and ringing), ring (wobble),
//     monocle 0..1 (0 = in his eye, 1 = dropped and swinging on its chain), point 0..1 (the other arm points), lean, slump}
function lkProf(x, y, s, t, o = {}) {
  const c = ctx, mood = o.mood || 'calm';
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    const sl = o.slump || 0;
    // legs and shoes
    for (const sd of [-1, 1]) { lkTaper(c, [sd * 24, -236], [sd * 30, -20], 24, 21); c.fillStyle = '#3A3036'; c.fill(); ellipse(c, sd * 34, -10, 34, 15, '#1A1416'); }
    // the coat: a long white lab coat
    c.save(); c.translate(0, sl * 12); c.rotate(o.lean || 0);
    c.beginPath(); c.moveTo(-72, -440); c.lineTo(72, -440); c.quadraticCurveTo(92, -430, 94, -400); c.lineTo(100, -170); c.quadraticCurveTo(0, -150, -100, -170); c.lineTo(-94, -400); c.quadraticCurveTo(-92, -430, -72, -440); c.closePath();
    c.fillStyle = '#EDE6D6'; c.fill();
    c.beginPath(); c.moveTo(-26, -440); c.lineTo(0, -360); c.lineTo(26, -440); c.closePath(); c.fillStyle = '#5A4A40'; c.fill();       // waistcoat V
    paint(() => { line(c, 0, -360, 0, -170, 3, 'rgba(120,100,80,0.5)'); for (const by of [-330, -280, -230]) circle(c, 10, by, 5, '#B8A890'); });
    // the bow tie
    c.beginPath(); c.moveTo(0, -436); c.lineTo(-24, -450); c.lineTo(-24, -422); c.closePath(); c.moveTo(0, -436); c.lineTo(24, -450); c.lineTo(24, -422); c.closePath(); c.fillStyle = '#7A2A2A'; c.fill();
    // arms: the bell arm (screen-right), the other (screen-left) down or pointing
    const bellUp = clamp(o.bell || 0), ring = o.ring || 0, bs = o.bellLeft ? -1 : 1;
    const shR = [80 * bs, -424], hR = [bs * lerp(108, 130, bellUp), lerp(-210, -640, bellUp)];
    lkTaper(c, shR, hR, 20, 17); c.fillStyle = '#E2DAC8'; c.fill(); circle(c, hR[0], hR[1], 19, '#E9B48E');
    if (bellUp > 0.05 || o.bellDown) {                                                  // the hand bell: a wooden handle, a brass dome
      c.save(); c.translate(hR[0], hR[1]); c.rotate(0.35 * Math.sin(ring * 22) * Math.min(1, ring * 4) * Math.exp(-ring * 1.5));
      rrect(c, -9, -70, 18, 56, 8); c.fillStyle = '#6A4424'; c.fill();
      c.beginPath(); c.moveTo(-40, 50); c.quadraticCurveTo(-40, -14, 0, -18); c.quadraticCurveTo(40, -14, 40, 50); c.closePath(); c.fillStyle = '#D8A840'; c.fill();
      ellipse(c, 0, 50, 42, 9, '#A47A24'); circle(c, 0, 60, 9, '#8A6420');
      c.restore();
    }
    const pt = clamp(o.point || 0), shL = [-80 * bs, -424], hL = [-bs * lerp(104, 196, pt), lerp(-200, -585, pt)];
    lkTaper(c, shL, hL, 20, 17); c.fillStyle = '#E2DAC8'; c.fill(); circle(c, hL[0], hL[1], 19, '#E9B48E');
    // the head: bald on top, grey tufts at the sides, a walrus moustache, a monocle
    const hx = 0, hy = -500 + sl * 10;
    circle(c, hx, hy, 58, '#E9B48E');
    for (const sd of [-1, 1]) { ellipse(c, sd * 54, hy - 4, 16, 26, '#C8C2B8'); ellipse(c, sd * 58, hy + 4, 9, 13, '#D89A78'); }
    paint(() => {
      const am = mood === 'amazed', dp = mood === 'deadpan' || mood === 'sigh';
      for (const sd of [-1, 1]) {
        const ex = sd * 21, ey = hy - 6;
        if (dp) { ellipse(c, ex, ey, 9, 6, '#FFFFFF'); c.fillStyle = '#E9B48E'; c.fillRect(ex - 10, ey - 7, 20, 7); circle(c, ex, ey + 1, 3.5, '#1A1416'); line(c, ex - 10, ey, ex + 10, ey, 3, '#B07A5A'); }
        else { ellipse(c, ex, ey, am ? 11 : 8, am ? 13 : 9, '#FFFFFF'); circle(c, ex, ey, am ? 4 : 4.5, '#1A1416'); }
        line(c, ex - sd * 10, ey - (am ? 30 : 18), ex + sd * 12, ey - (am ? 34 : 20) + (dp ? 4 : 0), 6, '#9A948A');
      }
      // the moustache: two curls (they fly up when amazed)
      const up = am ? -12 : mood === 'proud' ? -4 : 0;
      for (const sd of [-1, 1]) {
        c.beginPath(); c.moveTo(0, hy + 18); c.quadraticCurveTo(sd * 30, hy + 10 + up, sd * 46, hy + 26 + up * 1.6); c.quadraticCurveTo(sd * 26, hy + 36, 0, hy + 28); c.closePath(); c.fillStyle = '#8A7A68'; c.fill();
      }
      if (am) ellipse(c, 0, hy + 44, 9, 12, '#5A1E22');
      else if (mood === 'sigh') line(c, -10, hy + 42, 10, hy + 44, 4, '#5A1E22');
      ellipse(c, 0, hy + 6, 8, 11, '#D89A78');
    });
    // the monocle: in his right eye (screen-left), or dropped on its chain
    const md = clamp(o.monocle || 0);
    const eye = [-21, hy - 6], drop = [-36, hy + 120], mp = [lerp(eye[0], drop[0], E.outBounce(md)), lerp(eye[1], drop[1], E.outBounce(md))];
    c.beginPath(); c.moveTo(-60, hy + 40); c.quadraticCurveTo(lerp(-58, -50, md), lerp(hy + 20, hy + 120, md), mp[0], mp[1]); c.lineWidth = 2.5; c.strokeStyle = '#C8A040'; c.stroke();
    c.beginPath(); c.arc(mp[0], mp[1], 16, 0, 7); c.lineWidth = 4.5; c.strokeStyle = '#D8B04A'; c.stroke();
    c.restore();
    c.restore();
  });
}

// ---------------------------------------------------------------- the lecture hall
function lkHallBack(cam, t) {
  applyCam(cam);
  ctx.drawImage(LK_HALLWALL, -260, -260);
  softDot(ctx, 600, 820, 520, '#FFE2B0', 0.16);
}
function lkLectern(x, y) {
  ctx.beginPath(); ctx.moveTo(x - 110, y); ctx.lineTo(x + 110, y); ctx.lineTo(x + 86, y + 330); ctx.lineTo(x - 86, y + 330); ctx.closePath(); ctx.fillStyle = '#5A3A20'; ctx.fill();
  rrect(ctx, x - 130, y - 16, 260, 30, 6); ctx.fillStyle = '#7A5230'; ctx.fill();
}
// one expert from behind: shoulders, the back of a head, a top hat or a bowler. nod 0..1 tips the hat forward
function lkExpert(x, y, s, kind, nod = 0, seed = 1) {
  const c = ctx, rng = mulberry32(seed);
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(-110, 140); c.quadraticCurveTo(-104, 20, -40, 6); c.lineTo(40, 6); c.quadraticCurveTo(104, 20, 110, 140); c.closePath();
    c.fillStyle = ['#2E2420', '#3A2C24', '#28201C'][seed % 3]; c.fill();
    c.save(); c.translate(0, -40); c.rotate(nod * 0.5); c.translate(0, nod * 18);
    circle(c, 0, 0, 50, ['#C89A78', '#B88A68', '#D0A482'][seed % 3]);
    ellipse(c, 0, 20, 46, 30, ['#5A4436', '#8A8478', '#3A2C24'][seed % 3]);                         // hair at the back of the head
    if (kind === 'top') { rrect(c, -40, -120, 80, 96, 6); c.fillStyle = '#1A1416'; c.fill(); ellipse(c, 0, -28, 62, 12, '#1A1416'); }
    else { ellipse(c, 0, -34, 50, 44, '#2A2220'); ellipse(c, 0, -26, 64, 12, '#2A2220'); }
    c.restore();
    c.restore();
  });
}
// the cricket on a chair back: chirp 0..1 lifts its wings (they rub), look turns its head to us
function lkCricket(x, y, s, t, chirp) {
  const c = ctx;
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    // legs: long jumping legs bent up behind
    line(c, 10, 0, 50, -40, 7, '#3E5A1E'); line(c, 50, -40, 76, 8, 6, '#3E5A1E');
    line(c, -10, 6, -24, 22, 5, '#3E5A1E'); line(c, 8, 8, 4, 24, 5, '#3E5A1E');
    ellipse(c, 0, -6, 46, 20, '#8CB43C');                                                        // the body
    const wing = 0.25 * chirp * Math.sin(t * 60);
    c.save(); c.translate(-6, -16); c.rotate(-0.1 - wing); ellipse(c, 16, 0, 40, 11, '#B4D85A'); c.restore();
    circle(c, -44, -12, 17, '#8CB43C');                                                          // the head
    paint(() => { circle(c, -50, -18, 6, '#FFFFFF'); circle(c, -52, -18, 3, '#141A0A'); });
    c.beginPath(); c.moveTo(-54, -24); c.quadraticCurveTo(-90, -80, -60, -120); c.moveTo(-48, -26); c.quadraticCurveTo(-70, -90, -30, -126);
    c.lineWidth = 3; c.strokeStyle = '#3E5A1E'; c.stroke();                                       // antennae
    c.restore();
  });
}

// ---------------------------------------------------------------- the dog's moment of fame
function lkStageBack(cam, t, fy = 1380) {
  applyCam(cam);
  const g = ctx.createLinearGradient(0, 300, 0, 1800); g.addColorStop(0, '#2A0E1E'); g.addColorStop(1, '#120610');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  // the curtains
  for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) {
    const x = 540 + sd * (380 + i * 46);
    rrect(ctx, x - 30, 200, 60, 1500, 30); ctx.fillStyle = i % 2 ? '#7A1428' : '#8E1A30'; ctx.fill();
  }
  // the marquee: PAVLOV'S DOG in bulbs (chasing lights)
  const my = 560;
  rrect(ctx, 150, my - 90, 780, 180, 24); ctx.fillStyle = '#3A1020'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#D8A840'; ctx.stroke();
  for (let i = 0; i < 26; i++) {
    const u = i / 26, px = 170 + u * 740, on = ((i + Math.floor(t * 12)) % 3) === 0;
    for (const py of [my - 76, my + 76]) { circle(ctx, px, py, 8, on ? '#FFF2B0' : '#7A5A30'); if (on) softDot(gctx, px, py, 26, '#FFD87A', 0.8); }
  }
  ctx.font = '900 92px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFE38A';
  paint(() => ctx.fillText("PAVLOV'S DOG", 540, my + 4));
  gctx.font = '900 92px Anton'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.fillStyle = 'rgba(255,200,90,0.55)'; gctx.fillText("PAVLOV'S DOG", 540, my + 4);
  // the stage floor and the spotlight's pool
  const fg = ctx.createLinearGradient(0, fy - 40, 0, fy + 600); fg.addColorStop(0, '#4A2A1A'); fg.addColorStop(1, '#1A0C08');
  ctx.fillStyle = fg; ctx.fillRect(-300, fy - 40, W + 600, 1400);
  ellipse(ctx, 560, fy + 20, 340, 74, 'rgba(255,236,180,0.35)');
  // the cone of light from above
  const cg = ctx.createLinearGradient(0, 300, 0, fy + 20); cg.addColorStop(0, 'rgba(255,240,200,0.0)'); cg.addColorStop(1, 'rgba(255,240,200,0.22)');
  ctx.beginPath(); ctx.moveTo(500, 260); ctx.lineTo(620, 260); ctx.lineTo(900, fy + 20); ctx.lineTo(220, fy + 20); ctx.closePath(); ctx.fillStyle = cg; ctx.fill();
  softDot(gctx, 560, 300, 140, '#FFF2D0', 0.6);
}
// the dog, sitting, three-quarters to us. o: {pant, wag, proud 0..1 (chin up), medal 0..1 (the medal swings in), drool}
function lkDog(x, y, s, t, o = {}) {
  const c = ctx;
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    const wag = Math.sin(t * loopW(14)) * 0.5;
    c.save(); c.translate(80, -40); c.rotate(-0.6 + wag); line(c, 0, 0, 70, -60, 22, '#B87A44'); c.restore();       // the tail
    ellipse(c, 0, -120, 120, 140, '#C88A50');                                                                     // the body
    ellipse(c, -10, -100, 70, 100, '#F2E2C8');                                                                    // the chest
    for (const sd of [-1, 1]) ellipse(c, sd * 60, -14, 42, 26, '#C88A50');                                        // the paws
    // the head
    const hy = -300 - 10 * (o.proud || 0);
    c.save(); c.translate(0, hy); c.rotate(-0.1 * (o.proud || 0));
    for (const sd of [-1, 1]) { c.save(); c.translate(sd * 78, -10); c.rotate(sd * (0.25 + 0.06 * Math.sin(t * 5))); ellipse(c, 0, 40, 34, 74, '#7A4A28'); c.restore(); }   // floppy ears
    ellipse(c, 0, 0, 92, 84, '#D49A5C');
    ellipse(c, 0, 46, 54, 40, '#F2E2C8');                                                                          // the muzzle
    paint(() => {
      for (const sd of [-1, 1]) { ellipse(c, sd * 34, -16, 15, 17, '#FFFFFF'); circle(c, sd * 34 + 2, -14, 9, '#2A1A10'); circle(c, sd * 34 - 1, -18, 3, '#FFFFFF'); }
      ellipse(c, 0, 26, 20, 14, '#2A1A10');                                                                         // the nose
      const pant = o.pant || 0;
      c.beginPath(); c.moveTo(-26, 52); c.quadraticCurveTo(0, 74 + 6 * pant, 26, 52); c.lineWidth = 5; c.strokeStyle = '#3A2010'; c.stroke();
      ellipse(c, 8, 84 + 4 * Math.sin(t * 9), 16, 26 + 4 * pant, '#F06A84');                                       // the tongue
      if (o.drool) { line(c, 18, 104, 20, 104 + 36 * o.drool, 5, 'rgba(220,240,255,0.8)'); }
    });
    c.restore();
    // the collar with a little bell
    line(c, -64, -218, 64, -218, 16, '#C82A3A');
    c.beginPath(); c.arc(0, -196, 16, 0, 7); c.fillStyle = '#E8B840'; c.fill();
    // the medal on its ribbon
    const md = clamp(o.medal || 0);
    if (md > 0.01) {
      const sw = Math.sin((t - (o.medalT || 0)) * 7) * 0.4 * Math.exp(-(t - (o.medalT || 0)) * 1.6);
      c.save(); c.translate(0, -214); c.rotate(sw); c.scale(md, md);
      line(c, -18, 0, -6, 92, 12, '#2A6AD8'); line(c, 18, 0, 6, 92, 12, '#2A6AD8');
      circle(c, 0, 120, 38, '#E8B840'); circle(c, 0, 120, 28, '#FFD86A');
      paint(() => { c.font = '900 34px Anton'; c.fillStyle = '#A07418'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('No.1', 0, 122); });
      c.restore();
      softDot(gctx, x, y + (-214 + 120 * md) * s, 60 * s, '#FFD86A', 0.5 * md);
    }
    c.restore();
  });
}
// a flashbulb pop at (x, y): k 0..1 (a burst of light, then gone)
function lkFlash(x, y, k) {
  if (k <= 0) return;
  const a = Math.sin(Math.PI * clamp(k));
  softDot(gctx, x, y, 220, '#FFFFFF', 0.9 * a); softDot(ctx, x, y, 140, '#FFFFFF', 0.5 * a);
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; line(ctx, x + Math.cos(an) * 40, y + Math.sin(an) * 40, x + Math.cos(an) * (60 + 70 * a), y + Math.sin(an) * (60 + 70 * a), 6, rgba('#FFFFFF', a)); }
}
// a press camera from behind (the bottom edge): a box, a bellows, a flash pan held up
function lkPressCam(x, y, s, flash) {
  actor(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    circle(ctx, 0, 60, 70, '#1A1010');                                                           // the photographer's head
    rrect(ctx, -60, -60, 120, 90, 10); ctx.fillStyle = '#2A2020'; ctx.fill();
    line(ctx, 70, -10, 120, -110, 10, '#3A3030');
    ctx.beginPath(); ctx.moveTo(90, -120); ctx.lineTo(150, -120); ctx.lineTo(140, -100); ctx.lineTo(100, -100); ctx.closePath(); ctx.fillStyle = '#6A6060'; ctx.fill();
    ctx.restore();
  });
  lkFlash(x + 120 * s, y - 120 * s, flash);
}

// ---------------------------------------------------------------- the old film (screen space, after the lens)
function lkOldFilm(t, a = 1) {
  const f = Math.floor(t * FPS), rng = mulberry32(1000 + f);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(40,24,10,${(0.05 + 0.04 * rng()) * a})`; ctx.fillRect(0, 0, W, H);   // the flicker
  for (let i = 0; i < 2; i++) if (rng() < 0.55) { const x = rng() * W; line(ctx, x, 0, x + (rng() - 0.5) * 30, H, 1.5 + rng() * 2, `rgba(255,240,210,${0.18 * a})`); }
  for (let i = 0; i < 7; i++) { const x = rng() * W, y = rng() * H; circle(ctx, x, y, 1.5 + rng() * 3.5, `rgba(30,18,8,${0.45 * a})`); }
  // the frame's rounded corners, darker
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(30,16,6,${0.42 * a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
