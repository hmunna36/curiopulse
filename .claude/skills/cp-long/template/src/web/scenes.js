// __TITLE__ (long-form, 1920x1080): the shots. Each SC.<id>(lt, t, shot) draws one frame (lt = seconds inside the shot,
// t = seconds in the video) and returns post options for main.js:
//   {glow, push: {k, cx, cy}, blur: [dx, dy], zblur, zcx, zcy, desat, tint, tintA, vhs, glitch, flash,
//    flashTop, grain: 0, overlay: fn, noCaptions, capY}
// Every beat comes from a cue: cu().name (timeline.json), never a typed-in time.
'use strict';

const cu = () => TLd.cues;

// ---------------------------------------------------------------- the world(s)
// Landscape staging: the frame is 1920 wide and 1080 tall. The ground line sits around y 880, the hiker stands
// ~560 px tall (s ≈ 0.75) on one third of the frame (x ≈ 640 or 1280) with the thing he is looking at on the other,
// and the lower 220 px belong to the captions. World files borrowed from a Short were staged for a tall frame:
// re-frame them with the camera and check the stills for empty left/right edges.
function roomBg(t) {
  darkBg('#1B2A4A', '#070B18');
  screenSpace();
  for (let i = 0; i < 8; i++) softDot(ctx, (i * 311) % W, 160 + ((i * 337) % 620), 240, i % 2 ? '#FFB870' : '#6FB6D8', 0.08);
}

// ---------------------------------------------------------------- shots
SC.hook = (lt, t, shot) => {
  roomBg(t);
  const cam = { x: 960, y: 640, zoom: 1.25 - 0.08 * ramp(lt, 0, 3, E.inOutSine), rot: 0 };
  applyCam(cam);
  const pose = lerpPose(POSES.stand, POSES.flinch, ramp(lt, 1.2, 1.5, E.outBack));
  drawCharacter(ctx, { x: 700, y: 880, s: 0.75, pose, face: lt < 1.2 ? FACES.calm : FACES.startled }, t);
  shockLines(700, 480, 160, inv(1.2, 1.7, lt));
  return { glow: 0.8 };
};

SC.explain = (lt, t, shot) => {
  darkBg();
  screenSpace();
  bigWord('WHY?', 960, 430, 240, '#FFD447', E.outBack(clamp(lt / 0.3), 2));
  return { push: { k: 1 + 0.03 * lt / (shot.end - shot.start), cx: 960, cy: 480 } };
};

SC.button = (lt, t, shot) => {
  roomBg(t);
  applyCam({ x: 960, y: 640, zoom: 1.15, rot: 0 });
  drawCharacter(ctx, { x: 960, y: 880, s: 0.75, pose: POSES.stand, face: FACES.grin }, t);
  return {};
};

// The thumbnail (make_cover.js draws this one frame; it is not in the timeline). Rules: reference/long-form.md.
SC.cover = (lt, t, shot) => {
  roomBg(0);
  applyCam({ x: 1070, y: 535, zoom: 2.3, rot: 0 });        // the face fills the right half
  drawCharacter(ctx, { x: 1280, y: 880, s: 0.75, pose: POSES.flinch, face: FACES.startled }, 0);
  screenSpace();
  bigWord('WHY?', 520, 420, 330, '#FFD447', 1);            // 2-3 huge words on the left, never under the face
  return { glow: 0.9, noCaptions: true, noSubscribe: true, grain: 0 };
};

function initScenes2() {
  // build static layers, props and seeded randomness here (runs once before frame 0)
}
