// What If You Hold Your Breath TOO Long? (long-form): the film's clock (top left, always on; reference/long-form.md
// "The clock") and the safety badge of the viewer's tests.
// cues.clock = [[t, text, kind, label], ...]: the card flips on each entry. kind: '' white, 'go' yellow, 'red' red,
// 'blue' cyan, 'gold' gold, 'dark' violet. text may hold "{s}": then it counts real seconds from cues.tick0 (the moment
// the viewer starts holding), so for the first minute the clock is true to the viewer's own breath; each whole second
// ticks (a small pop) and the card flips only on the labelled jumps.
'use strict';

function clockState(t) {
  const L = (TLd.cues.clock || []);
  let i = -1;
  for (let k = 0; k < L.length; k++) if (t >= L[k][0]) i = k;
  return { i, cur: i >= 0 ? L[i] : null, prev: i > 0 ? L[i - 1] : null, age: i >= 0 ? t - L[i][0] : 0 };
}
// the seconds the viewer has been holding at time t (from cues.tick0; frozen at cues.tickStop if given)
function heldSecs(t) {
  const c = TLd.cues, t0 = c.tick0 === undefined ? 0 : c.tick0, t1 = c.tickStop === undefined ? 1e9 : c.tickStop;
  return Math.max(0, Math.min(t, t1) - t0);
}
const HUD_COL = { '': '#FFFFFF', go: '#FFD447', red: '#FF5A6E', blue: '#7FE9FF', gold: '#FFD447', dark: '#C8A8FF', green: '#4DFFB4' };
function drawHud(t, post) {
  const s = clockState(t);
  if (!s.cur) return;
  const x = 110, y = 132, flip = clamp(s.age / 0.26);
  let txt = s.cur[1];
  let tickPop = 0;
  if (txt.includes('{c}')) {     // a countdown of the viewer's 15 seconds
    const left = Math.max(0, Math.ceil(15 - (t - (TLd.cues.countFrom || 0)) - 1e-6));
    txt = txt.replace('{c}', String(left));
    const frac = (t - (TLd.cues.countFrom || 0)) % 1;
    tickPop = left > 0 ? Math.exp(-frac * 14) : 0;
  }
  if (txt.includes('{s}')) {
    const sec = Math.floor(heldSecs(t));
    txt = txt.replace('{s}', String(sec));
    const frac = heldSecs(t) - sec;
    tickPop = (t < (TLd.cues.tickStop || 1e9)) ? Math.exp(-frac * 14) : 0;
  }
  ctx.save();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const lab = s.cur[3] || 'HOLDING FOR';
  ctx.font = '800 28px Montserrat'; ctx.lineJoin = 'round';
  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(8,8,20,0.85)'; ctx.strokeText(lab, x + 4, y - 80);
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText(lab, x + 4, y - 80);
  const col = HUD_COL[s.cur[2] || ''] || '#FFFFFF';
  const sy = flip < 1 ? E.outBack(flip, 2.4) : 1;
  ctx.translate(x, y); ctx.scale(1 + 0.05 * tickPop, Math.max(0.02, sy) * (1 + 0.05 * tickPop));
  ctx.font = '400 78px Anton';
  ctx.lineWidth = 14; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
  ctx.restore();
  if (flip < 1 && s.i > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - flip)})`;
    ctx.fillRect(x, y + 16, 300 * (1 - flip), 6);
  }
}

// the safety badge for a viewer's test (screen space, top right): lines of text in a dark pill, k 0..1 pops it
function safetyBadge(lines, k, x = W - 110, y = 92) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = '900 36px Montserrat';
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 64, h = 30 + 50 * lines.length;
  ctx.translate(x - w / 2, y + h / 2); const sc = E.outBack(clamp(k), 2); ctx.scale(sc, sc);
  rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(8,12,34,0.86)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => { ctx.fillStyle = i === 0 ? '#4DFFB4' : '#FFFFFF'; ctx.fillText(l, 0, -h / 2 + 40 + 50 * i); });
  ctx.restore();
}
