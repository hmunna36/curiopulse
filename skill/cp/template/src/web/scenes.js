// __TITLE__ Short: the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the light of each place (reference/visual.md "The light")
// One line per shot id: a place from LIGHTS (room, lanterns, candle, day, sunset, night, inside, screen, water, diagram),
// changed where this place needs it ({...LIGHTS.candle, rim: [1, 0.4, 0.3]}); flipLight() when the lamp is on the right.
// A shot left out gets the house rig (LIGHTS.room). Characters other than the hiker: actor(() => drawThem()); a face,
// a label or a pattern on something: paint(() => drawIt()); a sun or a bright window: sunRays(x, y) with the camera applied.
setLights({ hook: LIGHTS.room, explain: LIGHTS.diagram, button: LIGHTS.room });

// ---------------------------------------------------------------- the world(s)
function roomBg(t) {
  darkBg('#1B2A4A', '#070B18');
  screenSpace();
  for (let i = 0; i < 6; i++) softDot(ctx, (i * 211) % W, 300 + ((i * 337) % 900), 220, i % 2 ? '#FFB870' : '#6FB6D8', 0.08);
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  roomBg(t);
  const cam = { x: 540, y: 1100, zoom: 1.35 - 0.08 * ramp(lt, 0, 3, E.inOutSine), rot: 0 };
  applyCam(cam);
  const pose = lerpPose(POSES.stand, POSES.flinch, ramp(lt, 1.2, 1.5, E.outBack));
  drawCharacter(ctx, { x: 540, y: 1500, s: 1.2, pose, face: lt < 1.2 ? FACES.calm : FACES.startled }, t);
  shockLines(540, 900, 180, inv(1.2, 1.7, lt));
  return { glow: 0.8 };
};

SC.explain = (lt, t, shot) => {
  darkBg();
  screenSpace();
  bigWord('WHY?', 540, 700, 220, '#FFD447', E.outBack(clamp(lt / 0.3), 2));
  return { push: { k: 1 + 0.03 * lt / (shot.end - shot.start), cx: 540, cy: 800 } };
};

SC.button = (lt, t, shot) => {
  roomBg(t);
  applyCam({ x: 540, y: 1100, zoom: 1.2, rot: 0 });
  drawCharacter(ctx, { x: 540, y: 1500, s: 1.2, pose: POSES.stand, face: FACES.grin }, t);
  return {};
};

function initScenes2() {
  // build static layers, props and seeded randomness here (runs once before frame 0)
}
