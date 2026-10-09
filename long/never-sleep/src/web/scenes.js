'use strict';
const cu = () => TLd.cues;
SC.t1 = (lt, t) => {   // the pile + the locks
  darkBg('#1A0E36', '#05030E'); screenSpace();
  adenPile(ctx, 520, 820, 640, 0.3 + 0.3 * lt, t, { hidden: lt > 1 ? 0.6 : 0 });
  lockRow(ctx, 1080, 1700, 640, 4, t, (i) => (i < 2 ? 2 : 1), (i) => lt * 1.2 - i * 0.2, 34);
  tiredLamp(ctx, 1400, 300, 60, 1, lt > 1 ? 1 : 0, t);
  return {};
};
SC.t2 = (lt, t) => {   // the city
  darkBg('#0A0618', '#020108'); screenSpace();
  brainCity(ctx, 960, 480, 560, t, patchDark(0.2, -0.2, 0.5, lt * 0.5), { amyg: lt > 1 ? 1 : 0 });
  return { glow: 0.9 };
};
SC.t3 = (lt, t) => {   // 1964
  const cam = { x: 960, y: 540, zoom: 1, rot: 0 };
  den60(cam, t, {});
  applyCam(cam);
  pinball(ctx, 1500, 880, 0.9, t, { score: '1 0 4 7' });
  figure(cam, { x: 700, y: 880, s: 0.75, pose: POSES.stand, face: FACES.tired, seed: 2 }, t, { pal: RANDYPAL, post: (c, r, st) => randyKit(c, r, st) });
  figure(cam, { x: 1080, y: 880, s: 0.78, pose: POSES.stand, face: FACES.calm, seed: 3 }, t, { pal: DOCPAL, post: (c, r, st) => docKit(c, r, st) });
  return { overlay: () => { sepia60(0.85); film60(t, 1); } };
};
SC.t4 = (lt, t) => {   // fly + rats
  const cam = { x: 960, y: 540, zoom: 1, rot: 0 };
  const L = ratLab(cam, t, {});
  drawRat(ctx, L.cx, L.top, 0.8, t, {});
  fly(ctx, 1500, 420, 0.7, t, { xray: 1, gut: 0.8, mop: lt > 1 ? 0.7 : 0, face: 'tired', wing: 0.3 });
  screenSpace(); lifeBar(200, 200, 600, 0.9, 1, '#4DFFB4', 'LIFESPAN');
  return {};
};
SC.t5 = (lt, t) => {
  if (lt < 1) { rinseTissue(t, { shrink: lt, flow: 1, clean: 0.3 }); return {}; }
  const cam = { x: 960, y: 540, zoom: 1, rot: 0 };
  seaFloor(cam, t, {}); applyCam(cam);
  upsideJelly(ctx, 700, 830, 1, 0.5 + 0.5 * Math.sin(t * 3), t, {});
  upsideJelly(ctx, 1300, 860, 0.7, 0.5 + 0.5 * Math.sin(t * 3 + 1), t, {});
  return { glow: 0.9 };
};
function initScenes2() { initHome(); initBrainHead(); initLab(); }
