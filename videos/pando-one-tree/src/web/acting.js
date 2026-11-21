// AUTOMATIC ACTING for the hiker (8 Nov 2026; the video-quality research, "his eyes look alive"). The rig already has
// blink, gaze and brow controls, but every Short placed each blink by hand. This layer adds, on top of whatever face a
// shot gives him, the small things a living face does, with timings from the research (reference/visual.md):
// - blinks on a natural rhythm (2.4-4.6 s apart, now and then a double blink, one just after most cuts), closing in
//   2 frames, held 1, opening in 3;
// - eye darts: the gaze hops by a little every 0.5-1.6 s in 2 frames (a saccade) and holds (a fixation), smaller when
//   the shot is already looking somewhere on purpose;
// - brow lifts on the beats the plan names (CAMERA["act"]["brow"]: [cue times]), up in 3 frames, held, eased down.
// It holds off when the shot's face has its eyes shut or squinting, dizzy, or wide in shock, and near the loop point
// (the first 0.7 s and the last 0.6 s) so the last frame still matches frame 1. Deterministic: a pure function of time.
'use strict';

const ACT_ON = !!(window.TL && window.TL.cinema === true && window.TL.acting !== false);
const ACT_CFG = (window.TL && window.TL.camera && window.TL.camera.act) || {};
let ACT_BLINKS = null, ACT_FIX = null;

function actDur() { return window.TL && window.TL.duration ? window.TL.duration : 30; }
function actBlinkTimes() {
  if (ACT_BLINKS) return ACT_BLINKS;
  const D = actDur(), out = [];
  let t = 0.9 + 0.7 * hash(3.7);
  for (let k = 0; t < D - 0.8; k++) {
    out.push(t);
    if (hash(k * 5.1 + 2) < 0.18 && t + 0.3 < D - 0.8) out.push(t + 0.3);      // a double blink now and then
    t += 2.4 + 2.2 * hash(k * 7.3 + 1);
  }
  // a blink just after most cuts (a fresh look), unless one is already close by
  for (const s of (window.TL && window.TL.shots) || []) {
    const tb = s.start + 0.1;
    if (s.start < 0.7 || tb > D - 0.8 || hash(s.start * 13.1) < 0.35) continue;
    if (!out.some((b) => Math.abs(b - tb) < 0.9)) out.push(tb);
  }
  for (const b of ACT_CFG.blink || []) if (b > 0.7 && b < D - 0.8) out.push(b);  // a blink the plan asks for
  return (ACT_BLINKS = out.sort((a, b) => a - b));
}
function actBlinkAt(t) {
  let k = 0;
  for (const b of actBlinkTimes()) {
    const u = (t - b) * FPS;                    // frames since the blink began
    if (u < 0 || u > 6) continue;
    k = Math.max(k, u < 2 ? u / 2 : u < 3 ? 1 : 1 - (u - 3) / 3);
  }
  return k;
}
// fixations: [start time, x, y] in the rig's look units (pupils move 5 head units per 1)
function actFixations() {
  if (ACT_FIX) return ACT_FIX;
  const D = actDur(), out = [[0, 0, 0]];
  let t = 0.7;
  for (let k = 0; t < D - 0.6; k++) {
    out.push([t, (hash(k * 3.3 + 11) - 0.5) * 2, (hash(k * 9.7 + 5) - 0.5) * 2]);
    t += 0.5 + 1.1 * hash(k * 4.1 + 17);
  }
  out.push([D - 0.6, 0, 0]);                    // back to rest for the loop
  return (ACT_FIX = out);
}
function actDartAt(t) {
  const F = actFixations();
  let i = 0;
  while (i + 1 < F.length && F[i + 1][0] <= t) i++;
  const cur = F[i], prev = i > 0 ? F[i - 1] : cur, u = clamp((t - cur[0]) * FPS / 2);   // a 2-frame saccade
  const e = u * u * (3 - 2 * u);
  return [lerp(prev[1], cur[1], e), lerp(prev[2], cur[2], e)];
}
function actBrowAt(t) {
  let k = 0;
  for (const b of ACT_CFG.brow || []) {
    const u = t - b;
    if (u < -0.02 || u > 0.95) continue;
    k = Math.max(k, u < 0.1 ? clamp(u / 0.1) : u < 0.55 ? 1 : 1 - E.inOutSine(clamp((u - 0.55) / 0.4)));
  }
  return k;
}

// the face the shot gave him, plus the living bits
function actFace(f, t) {
  if (!f) return f;
  const o = Object.assign({}, f);
  const shut = (f.blink || 0) > 0.3 || (f.squeeze || 0) > 0.3, dizzy = (f.cross || 0) > 0.5, wide = (f.eyeOpen || 1) > 1.25;
  if (!shut && !wide) o.blink = Math.max(f.blink || 0, actBlinkAt(t));
  if (!shut && !dizzy) {
    const d = actDartAt(t), aim = Math.max(Math.abs(f.lookX || 0), Math.abs(f.lookY || 0));
    const amp = 0.26 * (1 - 0.65 * clamp(aim));                       // smaller when he is already looking somewhere
    o.lookX = (f.lookX || 0) + d[0] * amp;
    o.lookY = (f.lookY || 0) + d[1] * amp * 0.7;
  }
  const br = actBrowAt(t);
  if (br > 0) o.browY = (f.browY || 0) + 0.65 * br;
  return o;
}

if (ACT_ON && typeof drawCharacter === 'function') {
  const ACT_drawCharacter0 = drawCharacter;
  drawCharacter = function (c, st, t, pal) {
    // the clock is the frame's own (or the scene's frozen clock in a hitstop), never the shot's local time
    const tv = typeof CIN !== 'undefined' && CIN.sceneT !== undefined && CIN.sceneT !== null ? CIN.sceneT
      : typeof CIN !== 'undefined' && CIN.frame >= 0 ? CIN.frame / FPS : t;
    const st2 = st && st.face ? Object.assign({}, st, { face: actFace(st.face, tv) }) : st;
    return ACT_drawCharacter0(c, st2, t, pal);
  };
}

// SNAP (8 Nov 2026, the video-quality research: what the Cartoon Animation Filter, Wang et al. 2006, does to a move): a
// small wind-up the other way just before the move, then the move with a little overshoot that settles. Use it in place
// of ramp() on the hiker's big moves (a reach, a swing, a grab, a toss) and on props that land (a stamp, a pin):
//   const k = snapRamp(t, c.feel - 0.3, c.feel + 0.25);          // o: {pre: 0.12 s, ant: 0.07, over: 1.5}
// Never on fades, colours or camera keys (an overshoot there reads as a glitch).
function snapRamp(t, a, b, o = {}) {
  const pre = o.pre === undefined ? 0.12 : o.pre, ant = o.ant === undefined ? 0.07 : o.ant, over = o.over === undefined ? 1.5 : o.over;
  if (t <= a - pre) return 0;
  if (t < a) return -ant * Math.sin(Math.PI * (t - (a - pre)) / pre);
  if (t >= b) return 1;
  return E.outBack((t - a) / (b - a), over);
}
