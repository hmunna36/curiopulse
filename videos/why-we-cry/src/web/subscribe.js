// Subscribe cue: a red SUBSCRIBE pill + bell that pops in, gets a cursor click, flips to SUBSCRIBED and pops out
// again, about 2.8 s in all. Engine file (reference/visual.md). Since 9 Oct 2026 it is SILENT and plays over the last
// seconds of the Short, on top of the button line: nobody says "subscribe". Wherever the word was spoken (the last
// line until 5 Oct, a mid-video aside from 5 to 9 Oct) a quarter to a half of the viewers still watching left within
// three seconds of it (reference/analytics.md).
// Timeline cues (make_timeline.py sets them from the duration; never type a time here):
//   sub_in  = when the pill pops in (3.4 s before the end)
//   sub_tap = when the cursor clicks; defaults to sub_in + 1.25
//   sub_out = when the pill starts to pop out; defaults to sub_tap + 1.3 (gone 0.6 s before the end, for the loop)
// If a timeline has no sub_in the cue falls back to the same last seconds, so it can never be forgotten silently
// (qa.py fails a Short whose cue is missing or not at the end).
// Placement: inside the Shorts key-content zone measured 30 Sep 2026 (x 100-870 for y 1000-1640; the like/comment
// column starts at x ≈ 880 from y ≈ 1050, the Related chip and channel row at y ≈ 1680): pill + bell centred on
// x = 540 (pill x ≈ 221-701, bell x ≈ 727-859), y = 1420 (y ≈ 1354-1486). Every caption chunk that shares the screen
// with the cue sits at y = SUB_CAPY for its whole life (main.js asks subLift), so nothing collides and nothing jumps.
// Only decoration crosses x 870: the cursor's first 0.15 s as it swoops in, and the ring marks after the tap.
'use strict';

const SUB_Y = 1420, SUB_CAPY = 1150, SUB_PILL_W = 480, SUB_PILL_H = 132, SUB_BELL_R = 66, SUB_GAP = 26;
const SUB_EXIT = 0.24;   // seconds the pill and the bell take to pop out after sub_out
const SUB_LINE = '';     // one line of text under the pill ('' = the pill alone, the default). Only what the user has
//                          approved goes here; it is drawn at 46 px or smaller, never wider than the pill and the bell

function subTimes() {
  const c = TLd.cues || {};
  const dur = TLd.duration;
  const tin = c.sub_in !== undefined ? c.sub_in : dur - 3.4;
  const tap = Math.min(c.sub_tap !== undefined ? c.sub_tap : tin + 1.25, dur - 0.75);
  const tout = c.sub_out !== undefined ? c.sub_out : Math.min(tap + 1.3, dur - 0.6);
  return { tin, tap, tout };
}
// true while the cue is on screen (from just before the pop-in to the end of the pop-out)
function subActive(t) {
  const { tin, tout } = subTimes();
  return t >= tin - 0.05 && t <= tout + SUB_EXIT;
}
// true for a caption chunk on screen from c0 to c1 that meets the cue at any moment: main.js draws that whole chunk
// at SUB_CAPY, so a caption never sits under the pill and never jumps while it is being read
function subLift(c0, c1) {
  const { tin, tout } = subTimes();
  return c1 > tin - 0.05 && c0 < tout + SUB_EXIT;
}

function bellPath(c) {
  c.beginPath();
  c.moveTo(-30, 22);
  c.bezierCurveTo(-24, 14, -22, 4, -22, -8);
  c.bezierCurveTo(-22, -24, -12, -32, 0, -32);
  c.bezierCurveTo(12, -32, 22, -24, 22, -8);
  c.bezierCurveTo(22, 4, 24, 14, 30, 22);
  c.closePath();
}
function drawBell(c, x, y, s, rot, col) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.translate(0, -34); c.rotate(rot); c.translate(0, 34);   // swing from the top knob
  c.fillStyle = col;
  bellPath(c); c.fill();
  c.beginPath(); c.arc(0, 30, 8, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(0, -38, 5.5, 0, Math.PI * 2); c.fill();
  c.restore();
}
function drawCursor(c, x, y, s, col = '#FFFFFF') {   // arrow pointer; (x, y) is the tip
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(0, 74); c.lineTo(18, 58); c.lineTo(30, 86); c.lineTo(44, 80); c.lineTo(32, 52); c.lineTo(56, 52);
  c.closePath();
  c.lineJoin = 'round'; c.lineWidth = 7; c.strokeStyle = '#0B0B1A'; c.stroke();
  c.fillStyle = col; c.fill();
  c.restore();
}

function drawSubscribe(t) {
  const { tin, tap, tout } = subTimes();
  const age = t - tin;
  if (age < 0 || t > tout + SUB_EXIT) return;
  const live = 1 - (t > tout ? E.inCubic(inv(tout, tout + SUB_EXIT, t)) : 0);   // 1 → 0 as the cue pops out
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  const totalW = SUB_PILL_W + SUB_GAP + SUB_BELL_R * 2;
  const x0 = W / 2 - totalW / 2;
  const pillCx = x0 + SUB_PILL_W / 2, bellCx = x0 + SUB_PILL_W + SUB_GAP + SUB_BELL_R;
  const done = t >= tap;                                  // SUBSCRIBED state
  const sinceTap = t - tap;

  // ---- pop-in (pill first, bell 0.12 s later), a slight tilt that settles
  const popP = E.outBack(inv(0, 0.34, age), 2.4), popB = E.outBack(inv(0.12, 0.46, age), 2.6);
  // ---- the press: dip on the click, spring back
  const press = sinceTap >= 0 ? (sinceTap < 0.09 ? 1 - 0.09 * (sinceTap / 0.09) : 0.91 + 0.09 * E.outBack(inv(0.09, 0.4, sinceTap), 3)) : 1;
  const hold = 1 + 0.0 * age;

  // ---- glow under the pill (bloom look), brighter on pop and on the click
  const flash = sinceTap >= 0 ? Math.exp(-sinceTap / 0.22) : 0;
  c.globalCompositeOperation = 'lighter';
  softDot(c, pillCx, SUB_Y, 340, done ? '#4DFFB4' : '#FF3B55', clamp((0.20 + 0.25 * flash) * popP * live));
  if (done) softDot(c, bellCx, SUB_Y, 170, '#FFD447', 0.35 * E.outCubic(inv(0.05, 0.4, sinceTap)) * live);
  c.globalCompositeOperation = 'source-over';

  // ---- the pill
  c.save();
  c.translate(pillCx, SUB_Y);
  const ps = Math.max(0.001, popP * live) * press * hold;
  c.rotate((1 - Math.min(1, popP)) * -0.09);
  c.scale(ps, ps);
  c.shadowColor = 'rgba(0,0,10,0.55)'; c.shadowBlur = 28; c.shadowOffsetY = 12;
  const g = c.createLinearGradient(0, -SUB_PILL_H / 2, 0, SUB_PILL_H / 2);
  if (done) { g.addColorStop(0, '#3A3F55'); g.addColorStop(1, '#23273A'); } else { g.addColorStop(0, '#FF5670'); g.addColorStop(1, '#E01B3E'); }
  c.fillStyle = g;
  rrect(c, -SUB_PILL_W / 2, -SUB_PILL_H / 2, SUB_PILL_W, SUB_PILL_H, SUB_PILL_H / 2); c.fill();
  c.shadowColor = 'transparent';
  c.lineWidth = 5; c.strokeStyle = done ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)'; c.stroke();
  // gloss
  c.save(); rrect(c, -SUB_PILL_W / 2 + 6, -SUB_PILL_H / 2 + 5, SUB_PILL_W - 12, SUB_PILL_H * 0.42, SUB_PILL_H * 0.21);
  c.fillStyle = 'rgba(255,255,255,0.14)'; c.fill(); c.restore();
  // label
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const label = done ? 'SUBSCRIBED' : 'SUBSCRIBE';
  const tick = done ? E.outBack(inv(0, 0.25, sinceTap), 2) : 1;
  c.font = `900 ${done ? 50 : 58}px Montserrat`;
  const off = done ? 26 : 0;
  c.fillStyle = 'rgba(0,0,10,0.45)'; c.fillText(label, off, 4);
  c.fillStyle = '#FFFFFF'; c.fillText(label, off, 0);
  if (done) {   // check mark
    c.save(); c.translate(-SUB_PILL_W / 2 + 62, 0); c.scale(tick, tick);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 10; c.strokeStyle = '#4DFFB4';
    c.beginPath(); c.moveTo(-17, 0); c.lineTo(-4, 14); c.lineTo(19, -14); c.stroke();
    c.restore();
  }
  c.restore();

  // ---- the line under the pill (SUB_LINE, off by default): it rises in just after the pill and leaves with it
  const lineA = SUB_LINE ? E.outCubic(inv(0.18, 0.5, age)) * live : 0;
  if (lineA > 0) {
    c.save();
    c.translate(W / 2, SUB_Y + SUB_PILL_H / 2 + 64 + (1 - lineA) * 16);
    c.globalAlpha = lineA;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    const maxW = SUB_PILL_W + SUB_GAP + SUB_BELL_R * 2;
    let fs = 46; c.font = `800 ${fs}px Montserrat`;
    const tw = c.measureText(SUB_LINE).width;
    if (tw > maxW) { fs = Math.floor(fs * maxW / tw); c.font = `800 ${fs}px Montserrat`; }
    c.lineWidth = 11; c.strokeStyle = 'rgba(8,8,20,0.85)'; c.strokeText(SUB_LINE, 0, 0);
    c.fillStyle = '#FFFFFF'; c.fillText(SUB_LINE, 0, 0);
    c.restore();
  }

  // ---- the bell: dark disc, white bell; after the click it goes yellow and rings
  c.save();
  c.translate(bellCx, SUB_Y);
  const bs = Math.max(0.001, popB * live) * (sinceTap >= 0 ? 1 + 0.10 * Math.exp(-sinceTap / 0.15) : 1);
  c.scale(bs, bs);
  c.shadowColor = 'rgba(0,0,10,0.55)'; c.shadowBlur = 24; c.shadowOffsetY = 10;
  c.fillStyle = done ? '#2C2A3E' : '#262A3C';
  c.beginPath(); c.arc(0, 0, SUB_BELL_R, 0, Math.PI * 2); c.fill();
  c.shadowColor = 'transparent';
  c.lineWidth = 5; c.strokeStyle = done ? 'rgba(255,212,71,0.75)' : 'rgba(255,255,255,0.3)'; c.stroke();
  const ring = sinceTap >= 0 ? Math.sin(sinceTap * 34) * 0.42 * Math.exp(-sinceTap / 0.55) : (age > 0.5 ? Math.sin(age * 9) * 0.05 * (1 - inv(0.5, 1.6, age)) : 0);
  drawBell(c, 0, 4, 1.15, ring, done ? '#FFD447' : '#FFFFFF');
  c.restore();
  if (done) {   // ring marks either side of the bell, and a ding sparkle
    const r = inv(0, 0.7, sinceTap), a = (1 - r) * 0.9;
    c.save(); c.translate(bellCx, SUB_Y - 6); c.lineCap = 'round'; c.strokeStyle = `rgba(255,212,71,${a})`; c.lineWidth = 7;
    for (const sgn of [-1, 1]) for (let k = 0; k < 2; k++) {
      const rr = SUB_BELL_R + 20 + k * 20 + r * 20;
      c.beginPath(); c.arc(0, 0, rr, sgn < 0 ? Math.PI * 0.78 : -Math.PI * 0.22, sgn < 0 ? Math.PI * 1.22 : Math.PI * 0.22); c.stroke();
    }
    c.restore();
    // confetti sparks burst from the pill on the click
    const rng = mulberry32(77);
    const cols = ['#FFD447', '#4DFFB4', '#7FE9FF', '#FF86A6', '#FFFFFF'];
    for (let i = 0; i < 22; i++) {
      const ang = rng() * Math.PI * 2, sp = 180 + rng() * 380, life = 0.55 + rng() * 0.5;
      const q = sinceTap / life; if (q < 0 || q > 1) continue;
      const px = pillCx + Math.cos(ang) * sp * E.outCubic(q) * 0.8, py = SUB_Y + Math.sin(ang) * sp * E.outCubic(q) * 0.5 + 220 * q * q;
      c.globalAlpha = 1 - q; c.fillStyle = cols[i % cols.length];
      c.save(); c.translate(px, py); c.rotate(ang + q * 6); c.fillRect(-7, -3, 14, 6); c.restore();
    }
    c.globalAlpha = 1;
  }

  // ---- the cursor: swoops in from the upper right, presses, drifts off
  const cIn = tap - 0.85, cq = inv(cIn, tap, t);
  if (t >= cIn && sinceTap < 0.9) {
    const tipX = pillCx + 70, tipY = SUB_Y + 18;
    const e = E.inOutCubic(cq);
    const sx = tipX + 330, sy = tipY - 300;
    let cx2 = lerp(sx, tipX, e) + Math.sin(e * Math.PI) * -70, cy2 = lerp(sy, tipY, e) + Math.sin(e * Math.PI) * 50;
    if (sinceTap >= 0) { cx2 = tipX + sinceTap * 40; cy2 = tipY + sinceTap * 40; }
    const fade = cq < 0.15 ? cq / 0.15 : (sinceTap > 0.55 ? 1 - inv(0.55, 0.9, sinceTap) : 1);
    const cs = sinceTap >= 0 && sinceTap < 0.12 ? 0.82 : 1;
    c.globalAlpha = fade;
    drawCursor(c, cx2, cy2, cs);
    c.globalAlpha = 1;
    if (sinceTap >= 0 && sinceTap < 0.45) {   // click ripple at the tip
      const rq = sinceTap / 0.45;
      c.strokeStyle = `rgba(255,255,255,${0.9 * (1 - rq)})`; c.lineWidth = 8 * (1 - rq) + 2;
      c.beginPath(); c.arc(tipX, tipY, 16 + 90 * E.outCubic(rq), 0, Math.PI * 2); c.stroke();
    }
  }
}
